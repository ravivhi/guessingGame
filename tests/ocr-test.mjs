// End-to-end OCR test for englishQuiz: loads the real page in headless Chrome, uploads photos from
// tests/fixtures/ and checks the rows the page produces. Covers both kinds of photos:
//   - "pairs": English words with their Hebrew next to them        (new-words-page29.jpg)
//   - "list":  English-only word list, meanings come from translation (word-list-vocab.jpg)
// The translation service (MyMemory) is stubbed, so the test is fast, repeatable and doesn't hit the real API.
//
// Setup (once):   cd tests && npm install
// Run:            cd tests && npm run ocr              (everything)   |   node ocr-test.mjs pairs|list|translation|practice|chooser
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

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
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
  page.pageErrors = []; page.tr = { total: 0, failed: 0, google: 0, mm: 0 };
  page.on('pageerror', e => page.pageErrors.push(e.message));
  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
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
  // the list is only saved to the device when a game is started, so mimic that before reloading
  await page.evaluate(() => localStorage.setItem('englishquiz-words', document.getElementById('words-input').value));
  await page.reload({ waitUntil: 'load' });
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

const TESTS = { pairs: () => testPairs(FIXTURES.pairs), list: () => testList(FIXTURES.list), translation: testTranslationRetry, practice: testPractice, chooser: testChooser };
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
