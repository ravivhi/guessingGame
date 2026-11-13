// End-to-end OCR test for englishQuiz: loads the real page in headless Chrome, uploads photos from
// tests/fixtures/ and checks the rows the page produces. Covers both kinds of photos:
//   - "pairs": English words with their Hebrew next to them        (new-words-page29.jpg)
//   - "list":  English-only word list, meanings come from translation (word-list-vocab.jpg)
// The translation service (MyMemory) is stubbed, so the test is fast, repeatable and doesn't hit the real API.
//
// Setup (once):   cd tests && npm install
// Run:            cd tests && npm run ocr              (everything)   |   node ocr-test.mjs wordbank|random|pairs|list|translation|practice|chooser|header|persist
// Chrome:         set CHROME_PATH if Chrome/Edge isn't in a default location.
//
// The photos in tests/fixtures/ are git-ignored on purpose (copyrighted workbook pages).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const FIXTURES = {
  pairs: {
    file: 'new-words-page29.jpg',
    // Hebrew is taken verbatim from the photo, commas included.
    pairs: {
      sweet: 'מתוק', July: 'יולי', candy: 'ממתק', everyone: 'כולם', then: 'אז', date: 'תאריך',
      flour: 'קמח', outside: 'בחוץ, החוצה', throw: 'לזרוק', do: 'לעשות, פועל עזר בהווה',
      give: 'לתת', ready: 'מוכן',
    },
  },
  list: {
    file: 'word-list-vocab.jpg',
    words: "a hundred|a lot of|about|age|also|April|August|bathroom|building|candy|card|classroom|date|December|dining room|do|eighteen|eighty|end|every|everyone|far|fifteen|February|fifty|flat|flour|flower|for|forty|fourteen|give|goal|guitar|hear|her|hobby|I'm sorry|Israel|January|July|June|kick|like|March|market|May|month|nineteen|ninety|November|October|other|outside|piano|play|present|pretty|ready|same|sell|September|seventeen|seventy|sixteen|sixty|sofa|song|soon|special|student|study|subject|sweet|teach|their|then|thing|thirteen|thirty|throw|toilet|trip|twenty|village|wait|year".split('|'),
    maxMissing: 3,                       // OCR is not perfect (currently misses "other")
    marginJunk: ['תרגמו', 'נכונים'],     // Hebrew labels printed in the page margin - must never become a meaning
  },
};

const only = process.argv[2];
const chromePath = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(p => p && fs.existsSync(p));
if (!chromePath) { console.error('Chrome/Edge not found. Set CHROME_PATH.'); process.exit(2); }

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const url = `http://localhost:${server.address().port}/englishQuiz/`;

const failures = [];
const check = (ok, msg) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failures.push(msg); };

const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new', args: ['--no-sandbox'], protocolTimeout: 600000 });

// Opens the page with both translation services stubbed (Google first, MyMemory as fallback).
// mode(n, service) decides per request: 'ok' | 'fail'   (n counts all translation requests, service = 'google' | 'mm').
async function openPage(mode = () => 'ok') {
  const ctx = await browser.createBrowserContext();       // fresh storage per test (the page saves the word list)
  const page = await ctx.newPage();
  const closePage = page.close.bind(page);
  page.close = async () => { await closePage(); await ctx.close(); };
  await page.setViewport({ width: 360, height: 800 });   // small phone
  page.pageErrors = []; page.tr = { total: 0, failed: 0, google: 0, mm: 0, bank: 0 };
  page.on('pageerror', e => page.pageErrors.push(e.message));
  await page.setBypassServiceWorker(true);   // so every request below is seen (and can be stubbed) by the page
  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    // the built-in word bank files: counted, and can be made to fail with mode(0, 'bank', url)
    if (u.includes('/wordbank/')) { page.tr.bank++; return mode(0, 'bank', u) === 'fail' ? req.abort('failed') : req.continue(); }
    const service = u.includes('translate.googleapis.com') ? 'google' : u.includes('api.mymemory.translated.net') ? 'mm' : null;
    if (!service) return req.continue();
    const n = ++page.tr.total; page.tr[service]++;
    if (mode(n, service, u) === 'fail') { page.tr.failed++; return req.abort('failed'); }
    // Google answers with vowel marks (niqqud); the page must strip them -> 'תרגום'.
    // With dt=bd it also returns dictionary entries (other meanings, grouped by part of speech).
    const body = service === 'google'
      ? (u.includes('dt=bd')
        ? [[['בחוץ', 'outside']], [['adverb', ['בָּחוּץ', 'הַחוּצָה'], [['בחוץ', ['outside'], 0.5], ['החוצה', ['outside'], 0.2]], 'outside'], ['noun', ['חוּץ'], [['חוץ', ['outside'], 0.1]], 'outside']]]
        : [[['תַּרְגּוּם', 'x', null, null, 2]], null, 'en'])
      : { responseData: { translatedText: 'תרגום' }, responseStatus: 200, matches: [] };
    req.respond({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
  });
  await page.goto(url, { waitUntil: 'load' });
  return page;
}

async function uploadAndRead(page, file) {
  await (await page.$('#photo-input')).uploadFile(path.resolve(here, 'fixtures', file));
  await page.waitForFunction(() => /מוכן|שגיאה/.test(document.getElementById('photo-status').innerText), { timeout: 420000 });
  const status = await page.$eval('#photo-status', e => e.innerText);
  const rows = await page.$$eval('#words-table tbody tr', trs => trs.map(tr => [...tr.querySelectorAll('input')].map(i => i.value.trim())));
  return { status, rows };
}

const overflowOf = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function testPairs(fx) {
  console.log('\n[pairs] English + Hebrew in the photo');
  const page = await openPage();
  const { status, rows } = await uploadAndRead(page, fx.file);
  const exp = fx.pairs, got = Object.fromEntries(rows.map(r => [r[0], r[1]]));
  check(/מוכן/.test(status), `OCR finished (${status})`);
  check(rows.length === Object.keys(exp).length, `row count is ${Object.keys(exp).length} (got ${rows.length})`);
  for (const [en, he] of Object.entries(exp)) check(got[en] === he, `${en} -> ${he}${got[en] === he ? '' : `   (got: ${got[en] ?? 'missing'})`}`);
  check(page.tr.total === 0, `no translation requests needed (made ${page.tr.total})`);

  const parsed = await page.evaluate(() => parseWords(document.getElementById('words-input').value));
  check(!parsed.error && parsed.words.length === Object.keys(exp).length, `parseWords OK (${parsed.error || parsed.words?.length + ' words'})`);
  for (const w of parsed.words || []) if (exp[w.word]) check(w.correct === exp[w.word], `game correct answer for "${w.word}" is the full meaning`);
  const outside = (parsed.words || []).find(w => w.word === 'outside');
  check(outside && !outside.dynamics.includes('החוצה'), 'part of a meaning is not reused as a wrong answer');

  const ov = await overflowOf(page);
  check(ov <= 0, `no horizontal overflow at 360px (overflow: ${ov}px)`);
  await page.click('#start-btn');
  await new Promise(r => setTimeout(r, 500));
  const q = await page.$eval('#question-word', e => e.innerText.trim());
  check(Object.hasOwn(exp, q), `game starts with a word from the photo ("${q}")`);
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

async function testList(fx) {
  console.log('\n[list] English-only list, meanings from translation');
  const page = await openPage();
  const { status, rows } = await uploadAndRead(page, fx.file);
  const got = rows.map(r => r[0]), gotLc = got.map(w => w.toLowerCase());
  const missing = fx.words.filter(w => !gotLc.includes(w.toLowerCase()));
  const extra = got.filter(w => !fx.words.map(x => x.toLowerCase()).includes(w.toLowerCase()));
  check(/מוכן/.test(status), `OCR finished (${status})`);
  check(missing.length <= fx.maxMissing, `found ${fx.words.length - missing.length}/${fx.words.length} words (missing: ${missing.join(', ') || '-'})`);
  check(extra.length === 0, `no wrong/garbled words (extra: ${extra.join(', ') || '-'})`);
  const notTranslated = rows.filter(r => r[1] !== 'תרגום');
  check(notTranslated.length === 0, `every word got its (stubbed) translation, none blank or paired with page text${notTranslated.length ? ' (got: ' + notTranslated.map(r => `${r[0]}=${JSON.stringify(r[1])}`).join(', ') + ')' : ''}`);
  check(page.tr.google >= rows.length && page.tr.mm === 0, `translated through Google only, no MyMemory calls (google: ${page.tr.google}, mymemory: ${page.tr.mm})`);
  const junk = rows.filter(r => fx.marginJunk.includes(r[1]));
  check(junk.length === 0, `Hebrew from the page margin is not used as a meaning${junk.length ? ' (' + junk.map(r => r[0]).join(', ') + ')' : ''}`);
  const ov = await overflowOf(page);
  check(ov <= 0, `no horizontal overflow at 360px (overflow: ${ov}px)`);
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

// Rate limiting / flaky network: retries recover; a service that never answers leaves a blank, not the English word.
async function testTranslationRetry() {
  console.log('\n[translation] Google first, MyMemory fallback, retries, cache');
  const tr = (page, w) => page.evaluate(x => translateWithRetry(x), w);

  let page = await openPage();
  const t0 = await tr(page, 'apple');
  check(t0 === 'תרגום', `Google answer is used, vowel marks stripped (got ${JSON.stringify(t0)})`);
  check(page.tr.google === 1 && page.tr.mm === 0, `only Google was asked (google ${page.tr.google}, mymemory ${page.tr.mm})`);
  await tr(page, 'apple');
  check(page.tr.total === 1, `a translated word is cached - no new request (total ${page.tr.total})`);
  await page.close();

  page = await openPage((n, service) => (service === 'google' ? 'fail' : 'ok'));
  const t1 = await tr(page, 'apple');
  check(t1 === 'תרגום' && page.tr.google === 1 && page.tr.mm === 1, `falls back to MyMemory when Google is unreachable (got ${JSON.stringify(t1)}; google ${page.tr.google}, mymemory ${page.tr.mm})`);
  await page.close();

  page = await openPage(n => (n <= 4 ? 'fail' : 'ok'));
  const t2 = await tr(page, 'apple');
  check(t2 === 'תרגום' && page.tr.total === 5, `retries after both services failed twice (got ${JSON.stringify(t2)}, ${page.tr.total} requests)`);
  await page.close();

  page = await openPage(() => 'fail');
  const t3 = await tr(page, 'banana');
  check(t3 === null, `returns null when no service ever answers (got ${JSON.stringify(t3)}, ${page.tr.total} requests)`);
  await page.close();
}

// "Practise the words I missed": the summary offers the missed words, a clean round clears them, "all words" goes back.
async function testPractice() {
  console.log('\n[practice] practise missed words');
  const page = await openPage();
  await page.evaluate(() => { document.getElementById('words-input').value = 'apple\tתפוח\ndog\tכלב\ncat\tחתול\nsun\tשמש'; renderWords(); });
  await page.click('#start-btn');

  // Plays the round on screen. Words in `miss` are answered wrong first (like a student), then right.
  const playRound = async (miss = []) => {
    for (let guard = 0; guard < 20; guard++) {
      const st = await page.evaluate(() => ({ summary: getComputedStyle(document.getElementById('summary-screen')).display !== 'none', word: wordsData[currentIndex]?.word, correct: wordsData[currentIndex]?.correct }));
      if (st.summary) return;
      await page.evaluate((miss, st) => {
        const btns = [...document.querySelectorAll('#answers-container button')];
        if (miss.includes(st.word)) btns.find(b => b.innerText !== st.correct).click();
        btns.find(b => b.innerText === st.correct).click();
      }, miss, st);
      await new Promise(r => setTimeout(r, 650));
    }
  };
  const vis = sel => page.$eval(sel, e => getComputedStyle(e).display !== 'none');
  const text = sel => page.$eval(sel, e => e.innerText.trim());

  await playRound(['dog', 'sun']);
  check(await vis('#practice-missed-btn') && /\(2\)/.test(await text('#practice-missed-btn')), `summary offers to practise the 2 missed words ("${await text('#practice-missed-btn')}")`);
  check(!(await vis('#all-words-btn')), '"all words" button is hidden in a normal round');

  await page.click('#practice-missed-btn');
  const words = await page.evaluate(() => wordsData.map(w => w.word).sort());
  check(JSON.stringify(words) === JSON.stringify(['dog', 'sun']), `practice round has only the missed words (${words.join(', ')})`);
  check(await text('#total-progress') === '2', `progress shows 2 questions (${await text('#total-progress')})`);

  await playRound([]);   // clean round
  check(!(await vis('#practice-missed-btn')), 'no missed words left -> practice button is hidden');
  check(await vis('#all-words-btn'), '"all words" button is shown after practising');

  await page.click('#all-words-btn');
  check(await text('#total-progress') === '4', `"all words" returns to the full list (${await text('#total-progress')} questions)`);

  await playRound(['cat']);                       // missed words are tracked fresh each round
  check(/\(1\)/.test(await text('#practice-missed-btn')), `a new round starts counting from zero ("${await text('#practice-missed-btn')}")`);
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

// The ▾ button: other meanings from the dictionary, light-yellow auto-translated cells, remembered choice.
async function testChooser() {
  console.log('\n[chooser] pick another meaning');
  let page = await openPage();
  await page.evaluate(async () => {
    const he = await translateWithRetry('outside');            // automatic translation -> counts as unconfirmed
    document.getElementById('words-input').value = 'outside\t' + he;
    renderWords();
  });
  const cell = () => page.$eval('#words-table tbody tr td:nth-child(2) input', e => ({ bg: getComputedStyle(e).backgroundColor, value: e.value }));
  const hint = () => page.$eval('#words-hint', e => (getComputedStyle(e).display === 'none' ? '' : e.innerText));
  check((await cell()).bg === 'rgb(255, 251, 234)', `auto-translated cell is light yellow (${(await cell()).bg})`);
  check((await hint()).includes('▾'), `a hint explains the colour and the ▾ button ("${await hint()}")`);

  await page.click('#words-table tbody tr button[aria-label="פירושים נוספים"]');
  await page.waitForSelector('[data-role=alternatives] button');
  const opts = await page.$$eval('[data-role=alternatives] button', bs => bs.map(b => b.innerText));
  const labels = await page.$eval('[data-role=alternatives]', e => e.innerText);
  check(['בחוץ', 'החוצה', 'חוץ'].every(o => opts.includes(o)), `chooser lists the dictionary meanings, vowel marks stripped (${opts.join(', ')})`);
  check(labels.includes('תואר פועל') && labels.includes('שם עצם'), 'meanings are grouped by part of speech');

  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.innerText === 'ביטול').click());
  check((await cell()).value === 'תרגום' && !(await page.$('[data-role=alternatives]')), 'cancel closes the chooser and changes nothing');

  await page.click('#words-table tbody tr button[aria-label="פירושים נוספים"]');
  await page.waitForSelector('[data-role=alternatives] button');
  await page.evaluate(() => [...document.querySelectorAll('[data-role=alternatives] button')].find(b => b.innerText === 'החוצה').click());
  const after = await cell();
  const stored = await page.$eval('#words-input', e => e.value);
  check(after.value === 'החוצה' && stored === 'outside\tהחוצה', `the picked meaning is written to the cell and the list (${JSON.stringify(stored)})`);
  check(after.bg !== 'rgb(255, 251, 234)' && (await hint()) === '', 'a confirmed meaning is no longer yellow, hint disappears');
  const again = await page.evaluate(() => translateWithRetry('outside'));
  check(again === 'החוצה', `the choice is remembered for the next photo (got ${JSON.stringify(again)})`);
  const reqs = page.tr.total;
  await page.reload({ waitUntil: 'load' });   // the list is saved on every change, no game needed
  check((await cell()).bg !== 'rgb(255, 251, 234)', 'after a reload the confirmed cell is still not yellow');
  check(page.tr.total === reqs, 'no extra translation requests were needed');
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();

  // offline / blocked dictionary request -> a friendly message, nothing breaks
  page = await openPage((n, service, u) => (u.includes('dt=bd') ? 'fail' : 'ok'));
  await page.evaluate(() => { document.getElementById('words-input').value = 'outside\tבחוץ'; renderWords(); });
  await page.click('#words-table tbody tr button[aria-label="פירושים נוספים"]');
  await page.waitForFunction(() => /בדקו את החיבור/.test(document.querySelector('[data-role=alternatives]')?.innerText || ''), { timeout: 10000 });
  check(true, 'when the dictionary can not be reached the chooser says so (check the connection)');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.innerText === 'ביטול').click());
  check((await page.$eval('#words-input', e => e.value)) === 'outside\tבחוץ', 'the list is unchanged after a failed lookup');
  await page.close();
}

// The "English | עברית" header must stay in place while a long list scrolls, with the rows going UNDER it.
async function testHeader() {
  console.log('\n[header] sticky table header');
  const page = await openPage();
  await page.evaluate(() => {
    document.getElementById('words-input').value = Array.from({ length: 40 }, (_, i) => `word${i + 1}\tמילה${i + 1}`).join('\n');
    renderWords();
  });
  const probe = () => page.evaluate(() => {
    const wrap = document.getElementById('words-table').parentElement;
    const ths = [...document.querySelectorAll('#words-table th')];
    const covered = ths.filter(th => th.textContent).map(th => {
      const r = th.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return top === th || th.contains(top);
    });
    return { scroll: Math.round(wrap.scrollTop), headerTop: Math.round(ths[0].getBoundingClientRect().top), headerOnTop: covered.every(Boolean) };
  });
  const before = await probe();
  await page.evaluate(() => { document.getElementById('words-table').parentElement.scrollTop = 600; });
  const after = await probe();
  check(after.scroll >= 500, `the list scrolled (${after.scroll}px)`);
  check(after.headerTop === before.headerTop, `header stays in place while scrolling (top ${before.headerTop}px -> ${after.headerTop}px)`);
  check(after.headerOnTop, 'rows slide under the header and never cover its text');
  await page.close();
}

// Corrections must survive a refresh (and any other reload) without starting a game.
async function testPersist() {
  console.log('\n[persist] edits survive a refresh');
  const page = await openPage();
  await page.evaluate(async () => {
    const lines = [];
    for (const w of ['apple', 'dog', 'cat']) lines.push(w + '\t' + await translateWithRetry(w));   // automatic translations
    document.getElementById('words-input').value = lines.join('\n');
    renderWords();
  });
  const cells = () => page.$$eval('#words-table tbody tr', trs => trs.map(tr => [...tr.querySelectorAll('input')].map(i => i.value)));

  // 1) type a correction into a Hebrew cell, leave the cell
  const heInputs = await page.$$('#words-table tbody tr td:nth-child(2) input');
  await heInputs[0].click({ clickCount: 3 });
  await heInputs[0].type('תפוח עץ');
  await page.keyboard.press('Tab');
  // 2) delete the 'dog' row, add a new word by hand
  await page.click('#words-table tbody tr:nth-child(2) button[aria-label="מחיקת השורה"]');
  await page.evaluate(() => addWordRow());
  const enInputs = await page.$$('#words-table tbody tr td:nth-child(1) input');
  await enInputs[enInputs.length - 1].type('sun');
  const heInputs2 = await page.$$('#words-table tbody tr td:nth-child(2) input');
  await heInputs2[heInputs2.length - 1].type('שמש');
  await page.keyboard.press('Tab');

  await page.reload({ waitUntil: 'load' });   // like pull-to-refresh / F5 - no game was started
  const after = await cells();
  check(JSON.stringify(after) === JSON.stringify([['apple', 'תפוח עץ'], ['cat', 'תרגום'], ['sun', 'שמש']]), `the table after a reload keeps the corrections, the deleted row and the new row (${JSON.stringify(after)})`);
  const yellow = await page.$$eval('#words-table tbody tr td:nth-child(2) input', is => is.map(i => getComputedStyle(i).backgroundColor === 'rgb(255, 251, 234)'));
  check(JSON.stringify(yellow) === JSON.stringify([false, true, false]), `only the untouched automatic translation is still yellow (${JSON.stringify(yellow)})`);
  const again = await page.evaluate(() => translateWithRetry('apple'));
  check(again === 'תפוח עץ', `reading the same word again keeps the typed correction (got ${JSON.stringify(again)})`);

  await page.click('button[onclick="clearWords()"]');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.innerText === 'מחיקה').click());
  await page.reload({ waitUntil: 'load' });
  check((await cells()).length === 0, 'after "clear the list" and a reload the list stays empty');
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

// The built-in word bank files themselves: format, size, no duplicates, clean Hebrew.
async function testWordbank() {
  console.log('\n[wordbank] built-in word bank files');
  const bank = {}, allEn = new Map();
  for (let lv = 1; lv <= 10; lv++) {
    const f = path.join(root, 'englishQuiz', 'wordbank', `level-${lv}.txt`);
    if (!fs.existsSync(f)) { check(false, `level-${lv}.txt exists`); continue; }
    bank[lv] = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(l => l.trim()).map(l => l.split('|'));
  }
  check(Object.keys(bank).length === 10, 'there are 10 level files');
  const total = Object.values(bank).flat().length;
  check(Object.values(bank).every(a => a.length >= 100), `every level has at least 100 words (${Object.entries(bank).map(([l, a]) => `L${l}:${a.length}`).join(' ')}; ${total} in total)`);
  const badFormat = [], badEn = [], badHe = [], longHe = [], dupEn = [];
  for (const [lv, arr] of Object.entries(bank)) for (const p of arr) {
    const [en, he] = p;
    if (p.length !== 2 || !en.trim() || !he.trim()) { badFormat.push(`L${lv} ${p.join('|')}`); continue; }
    if (!/^[A-Za-z][A-Za-z' -]*$/.test(en)) badEn.push(`L${lv} ${en}`);
    if (!/^[֐-׿][֐-׿ '"\-\/,]*$/.test(he) || /[֑-ׇ]/.test(he)) badHe.push(`L${lv} ${en}=${he}`);
    if (he.split(/\s+/).length > 3) longHe.push(`L${lv} ${en}=${he}`);
    const k = en.toLowerCase(); if (allEn.has(k)) dupEn.push(`${en} (L${allEn.get(k)} and L${lv})`); else allEn.set(k, lv);
  }
  check(!badFormat.length, `every line is "english|hebrew" (${badFormat.slice(0, 3).join('; ') || 'ok'})`);
  check(!badEn.length, `English words use plain letters only (${badEn.slice(0, 5).join(', ') || 'ok'})`);
  check(!badHe.length, `Hebrew uses Hebrew letters only, no vowel marks (${badHe.slice(0, 5).join(', ') || 'ok'})`);
  check(!longHe.length, `no Hebrew meaning is longer than 3 words (${longHe.slice(0, 5).join(', ') || 'ok'})`);
  check(!dupEn.length, `no English word appears twice in the bank (${dupEn.slice(0, 5).join(', ') || 'ok'})`);
}

// The 🎲 button: 20 random words of the chosen level go into the table.
async function testRandom() {
  console.log('\n[random] 20 random words by level');
  const bankOf = lv => fs.readFileSync(path.join(root, 'englishQuiz', 'wordbank', `level-${lv}.txt`), 'utf8').split(/\r?\n/).filter(Boolean).map(l => l.split('|'));
  let page = await openPage();
  const table = () => page.$$eval('#words-table tbody tr', trs => trs.map(tr => [...tr.querySelectorAll('input')].map(i => i.value)));
  const selectLevel = lv => page.select('#level-select', String(lv));

  await selectLevel(5);
  await page.click('#random-btn');
  await page.waitForFunction(() => document.querySelectorAll('#words-table tbody tr').length === 20, { timeout: 10000 });
  const first = await table();
  const level5 = Object.fromEntries(bankOf(5));
  check(first.length === 20 && new Set(first.map(r => r[0])).size === 20, 'the table has 20 different words');
  check(first.every(r => level5[r[0]] === r[1]), 'every word and meaning comes from level 5 of the bank');
  check((await page.$eval('#random-status', e => e.innerText)).includes('רמה 5'), `a message says which level was used ("${await page.$eval('#random-status', e => e.innerText)}")`);

  // another click on a non-empty list asks first; cancel keeps the list
  await page.click('#random-btn');
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.innerText === 'ביטול'));
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.innerText === 'ביטול').click());
  check(JSON.stringify(await table()) === JSON.stringify(first), 'cancelling the question keeps the current list');
  // confirm replaces it with a new random set
  await page.click('#random-btn');
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.innerText === 'החלפה'));
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.innerText === 'החלפה').click());
  await page.waitForFunction(first => JSON.stringify([...document.querySelectorAll('#words-table tbody tr')].map(tr => [...tr.querySelectorAll('input')].map(i => i.value))) !== first, { timeout: 10000 }, JSON.stringify(first));
  const second = await table();
  check(second.length === 20 && JSON.stringify(second) !== JSON.stringify(first), 'confirming replaces the list with a different random set');

  // level + list survive a reload
  await page.reload({ waitUntil: 'load' });
  check(JSON.stringify(await table()) === JSON.stringify(second), 'the list is still there after a reload');
  check(await page.$eval('#level-select', e => e.value) === '5', 'the chosen level is remembered');

  // a meaning picked by hand earlier wins over the bank's default; and the game starts with the 20 words
  await page.evaluate(() => { chosen['one'] = 'אחת'; shuffle = a => a; });   // no shuffling: the first 20 words of the level
  await page.evaluate(() => { document.getElementById('words-input').value = ''; renderWords(); });
  await selectLevel(1);
  await page.click('#random-btn');
  await page.waitForFunction(() => document.querySelectorAll('#words-table tbody tr').length === 20);
  const l1 = await table();
  check(l1[0][0] === 'one' && l1[0][1] === 'אחת', `a hand-picked meaning wins over the bank (${l1[0].join(' = ')})`);
  await page.click('#start-btn');
  await new Promise(r => setTimeout(r, 400));
  check(await page.$eval('#total-progress', e => e.innerText) === '20', 'the game starts with 20 questions');
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();

  // the bank can't be loaded (offline / blocked): friendly message, the list is untouched
  page = await openPage((n, service, u) => (service === 'bank' && u.includes('level-3') ? 'fail' : 'ok'));
  await page.evaluate(() => { document.getElementById('words-input').value = 'apple\tתפוח'; renderWords(); });
  await selectLevel(3);
  await page.click('#random-btn');
  await page.waitForFunction(() => /מאגר המילים/.test(document.getElementById('random-status').innerText), { timeout: 10000 });
  check(JSON.stringify(await table()) === JSON.stringify([['apple', 'תפוח']]), 'when the level cannot be loaded the list is not touched');
  check((await page.$eval('#random-status', e => e.innerText)).includes('בדקו את החיבור'), 'and a message asks to check the connection');
  await page.close();
}

const TESTS = { wordbank: testWordbank, random: testRandom, pairs: () => testPairs(FIXTURES.pairs), list: () => testList(FIXTURES.list), translation: testTranslationRetry, practice: testPractice, chooser: testChooser, header: testHeader, persist: testPersist };
try {
  let ran = 0;
  for (const [name, run] of Object.entries(TESTS)) {
    if (only && only !== name) continue;
    const fx = FIXTURES[name];
    if (fx && !fs.existsSync(path.resolve(here, 'fixtures', fx.file))) { console.log(`\n[${name}] SKIPPED - tests/fixtures/${fx.file} not found (photos are git-ignored)`); continue; }
    await run(); ran++;
  }
  if (!ran) { console.error(`Nothing ran (known tests: ${Object.keys(TESTS).join(', ')}).`); process.exitCode = 2; }
} finally {
  await browser.close();
  server.close();
}

console.log(failures.length ? `\n${failures.length} check(s) FAILED` : '\nAll checks passed');
process.exit(process.exitCode || (failures.length ? 1 : 0));
