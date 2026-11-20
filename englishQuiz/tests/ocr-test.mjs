// End-to-end OCR test for englishQuiz: loads the real page in headless Chrome, uploads photos from
// tests/fixtures/ and checks the rows the page produces. Covers both kinds of photos:
//   - "pairs": English words with their Hebrew next to them        (new-words-*.jpg)
//   - "list":  English-only word list, meanings come from translation (word-list-*.jpg)
// The translation service (MyMemory) is stubbed, so the test is fast, repeatable and doesn't hit the real API.
//
// Setup (once):   cd tests && npm install
// Run:            cd tests && npm run ocr              (everything)   |   node ocr-test.mjs wordbank|random|layout|back|tabs|streak|pairs|list|translation|practice|chooser|header|persist   (pairs/list take a file-name part too: node ocr-test.mjs list quarter)
// Chrome:         set CHROME_PATH if Chrome/Edge isn't in a default location.
//
// The photos in tests/fixtures/ are git-ignored on purpose (copyrighted workbook pages).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');   // the englishQuiz folder (what the test server serves at /)

const FIXTURES = {
  pairs: [{
    file: 'new-words-page29.jpg',
    // Hebrew is taken verbatim from the photo, commas included.
    pairs: {
      sweet: 'מתוק', July: 'יולי', candy: 'ממתק', everyone: 'כולם', then: 'אז', date: 'תאריך',
      flour: 'קמח', outside: 'בחוץ, החוצה', throw: 'לזרוק', do: 'לעשות, פועל עזר בהווה',
      give: 'לתת', ready: 'מוכן',
    },
  }, {
    file: 'new-words-card.jpg',          // sideways photo, Hebrew + Arabic under each word, a finger over the corner
    pairs: {
      card: 'כרטיס ברכה', for: 'ל-, עבור, למשך', market: 'שוק', sell: 'למכור',
      end: 'סוף', hear: 'לשמוע', present: 'מתנה', thing: 'דבר',
      flower: 'פרח', "I'm sorry": 'אני מצטער', pretty: 'יפה', village: 'כפר',
    },
  }, {
    file: 'new-words-always.jpg',        // same kind of card
    pairs: {
      always: 'תמיד', find: 'למצוא', paint: 'לצייר, לצבוע', safe: 'בטוח, מוגן',
      choose: 'לבחור', fix: 'לתקן', practice: 'להתאמן', 'table tennis': 'טניס שולחן',
      club: 'מועדון, חוג', or: 'או', problem: 'בעיה', use: 'להשתמש',
    },
  }, {
    file: 'new-words-country.jpg',       // same kind of card
    pairs: {
      country: 'מדינה', hour: 'שעה', many: 'הרבה', 'Olympic Games': 'משחקים אולימפיים',
      first: 'ראשון', how: 'איך', medal: 'מדליה', prepare: 'להתכונן',
      hard: 'קשה', later: 'מאוחר יותר, אחר כך', need: 'צריך', was: 'היה',
    },
  }, {
    file: 'new-words-again.jpg',         // same kind of card; "(be) called" keeps its bracketed word
    pairs: {
      again: 'שוב', 'be called': 'נקרא', move: 'לזוז, להזיז', race: 'מירוץ',
      artist: 'צייר', easy: 'קל', place: 'מקום', them: 'אותם, אותן',
      because: 'כי', interesting: 'מעניין', plate: 'צלחת', tomorrow: 'מחר',
    },
  }, {
    file: 'new-words-adult.jpg',
    pairs: {
      adult: 'מבוגר', get: 'לקבל', road: 'רחוב, כביש', think: 'לחשוב',
      ago: 'לפני', player: 'שחקן', some: 'כמה, קצת', true: 'נכון, אמת',
      build: 'לבנות', right: 'נכון', something: 'משהו', way: 'דרך',
    },
  }, {
    file: 'new-words-cry.jpg',
    pairs: {
      cry: 'לבכות', hurt: 'נפצע, כואב', keep: 'לשמור', of: 'של, ב-',
      excited: 'נרגש, מתרגש', ice: 'קרח', lie: 'לשכב', son: 'בן',
      'get up': 'לקום', important: 'חשוב', noise: 'רעש', winner: 'מנצח',
    },
  }, {
    file: 'new-words-anyone.jpg',
    pairs: {
      anyone: 'כל אחד, מישהו', heart: 'לב', point: 'להצביע', these: 'אלה',
      'come from': 'מ-, לבוא מ-', light: 'קל', rich: 'עשיר', top: 'צמרת, פיסגה, למעלה',
      finger: 'אצבע', list: 'רשימה', tent: 'אוהל', travel: 'לנסוע',
    },
  }, {
    file: 'new-words-anyone-title.jpg',  // the same card with its "New Words 1" title in the photo: text outside the box is ignored
    pairs: {
      anyone: 'כל אחד, מישהו', heart: 'לב', point: 'להצביע', these: 'אלה',
      'come from': 'מ-, לבוא מ-', light: 'קל', rich: 'עשיר', top: 'צמרת, פיסגה, למעלה',
      finger: 'אצבע', list: 'רשימה', tent: 'אוהל', travel: 'לנסוע',
    },
  }],
  list: [{
    file: 'word-list-vocab.jpg',
    words: "a hundred|a lot of|about|age|also|April|August|bathroom|building|candy|card|classroom|date|December|dining room|do|eighteen|eighty|end|every|everyone|far|fifteen|February|fifty|flat|flour|flower|for|forty|fourteen|give|goal|guitar|hear|her|hobby|I'm sorry|Israel|January|July|June|kick|like|March|market|May|month|nineteen|ninety|November|October|other|outside|piano|play|present|pretty|ready|same|sell|September|seventeen|seventy|sixteen|sixty|sofa|song|soon|special|student|study|subject|sweet|teach|their|then|thing|thirteen|thirty|throw|toilet|trip|twenty|village|wait|year".split('|'),
    maxMissing: 3,                       // OCR is not perfect (currently misses "other")
    marginJunk: ['תרגמו', 'נכונים'],     // Hebrew labels printed in the page margin - must never become a meaning
  }, {
    file: 'word-list-afternoon.jpg',     // "(v)" is a part-of-speech note and is dropped; "look (for)" keeps its word: "look for"
    words: "afternoon|all|another|any|anything|as usual|ask for|before|blouse|body|bookshop|breakfast|butter|call|camera|cook|corner|cream|cucumber|cup|customer|different|don't worry|enjoy|evening|everything|friendly|garlic|Good afternoon|Have a good day|jam|knee|less|long|look for|mix|mug|neck|next|night|note|oil|once|onion|only|out|pass|pepper|put|quick|raincoat|recipe|restaurant|rice|salt|save|sometimes|spoon|steak|sugar|supper|take care of|tea|that|toy|understand|vegetable|waiter|waitress|watermelon|website|weekend|Well done|which|wrong|Yes please|yogurt".split('|'),
    maxMissing: 0,
    marginJunk: [],
  }, {
    file: 'word-list-quarter.jpg',
    words: "a quarter past|a quarter to|adult|after|again|ago|always|artist|aunt|because|build|be called|choose|clock|club|country|cry|easy|excited|find|first|fix|get|get up|hard|hour|how|hurt|ice|important|interesting|keep|later|lie|many|medal|minute|money|more|move|need|neighbor|noise|of|Olympic Games|or|our|paint|parent|place|plate|player|poor|practice|prepare|prize|problem|race|right|road|safe|second|sick|sign|some|something|son|table tennis|them|think|time|tomorrow|true|us|use|was|way|winner".split('|'),
    maxMissing: 0,
    marginJunk: [],
  }, {
    file: 'word-list-anywhere.jpg',      // "Do you know ... ?" / "not very ..." lose their dots; "watch (n)" loses its note
    words: "anywhere|as|ate|begin|beginning|catch|center|cool|dancer|daughter|difficult|Do you know|doll|drive|dry|early|farmer|floor|good luck|grandchildren|granddaughter|grandparents|grandson|group|half|have a nice time|heavy|him|hold|holiday|How about|husband|inside|internet|jacket|jeans|just|language|last night|late|laugh|leather|lie down|make plans|maybe|movie|never|nobody|not very|often|painter|part|price|program|push|radio|real|runner|Say it again please|seat|See you later|singer|someone|speak|spend|storm|strong|taxi|than|the moon|there|those|ticket|tonight|turn on|uncle|until|watch|well|wife|writer|yesterday|young".split('|'),
    maxMissing: 0,
    marginJunk: [],
  }],
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
const url = `http://localhost:${server.address().port}/`;

const cdnCache = path.join(here, 'node_modules', '.cdn-cache');   // git-ignored with node_modules
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
    // the OCR library and its language files come from a CDN; keep a local copy so a slow CDN can't stall the tests
    if (/^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com)\//.test(u)) {
      const f = path.join(cdnCache, encodeURIComponent(u));
      if (fs.existsSync(f)) return req.respond({ status: 200, contentType: u.endsWith('.js') ? 'text/javascript' : 'application/octet-stream', headers: { 'Access-Control-Allow-Origin': '*' }, body: fs.readFileSync(f) });
      return req.continue();
    }
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
  page.on('response', async res => {
    const u = res.url(), f = path.join(cdnCache, encodeURIComponent(u));
    if (!/^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com)\//.test(u) || !res.ok() || fs.existsSync(f)) return;
    try { const body = await res.buffer(); fs.mkdirSync(cdnCache, { recursive: true }); fs.writeFileSync(f, body); } catch (e) {}
  });
  await page.goto(url, { waitUntil: 'load' });
  return page;
}

async function uploadAndRead(page, file) {
  // In headless Chrome the OCR engine now and then never finishes starting ("טוען OCR"), before any reading.
  // That is retried once on a reloaded page; a stall anywhere else is reported with the step it stopped at.
  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.evaluate(() => setMode('picture'));   // photos belong to the picture tab (random words is the default tab)
    await (await page.$('#photo-input')).uploadFile(path.resolve(here, 'fixtures', file));
    const done = await page.waitForFunction(() => /מוכן|שגיאה/.test(document.getElementById('photo-status').innerText), { timeout: 90000 }).then(() => true, () => false);
    if (done) break;
    const at = await page.$eval('#photo-status', e => e.innerText);
    console.log(`  (reading ${file} stalled at: ${at}${attempt === 1 && /טוען OCR/.test(at) ? ' - retrying' : ''})`);
    if (attempt === 2 || !/טוען OCR/.test(at)) break;
    await page.reload({ waitUntil: 'load' });
    page.tr = { total: 0, failed: 0, google: 0, mm: 0, bank: 0 };
  }
  const status = await page.$eval('#photo-status', e => e.innerText);
  const rows = await page.$$eval('#words-table tbody tr', trs => trs.map(tr => [...tr.querySelectorAll('input')].map(i => i.value.trim())));
  return { status, rows };
}

const overflowOf = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function testPairs(fx) {
  console.log(`\n[pairs] English + Hebrew in the photo (${fx.file})`);
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
  if (exp.outside) check(outside && !outside.dynamics.includes('החוצה'), 'part of a meaning is not reused as a wrong answer');

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
  console.log(`\n[list] English-only list, meanings from translation (${fx.file})`);
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
  for (let lv = 1; lv <= 9; lv++) {
    const f = path.join(root, 'wordbank', `level-${lv}.txt`);
    if (!fs.existsSync(f)) { check(false, `level-${lv}.txt exists`); continue; }
    bank[lv] = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#')).map(l => l.split('|'));   // '# category' header lines (in Hebrew) group the words of every level
  }
  check(Object.keys(bank).length === 9, 'there are 9 level files');
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
  const bankOf = lv => fs.readFileSync(path.join(root, 'wordbank', `level-${lv}.txt`), 'utf8').split(/\r?\n/).filter(Boolean).map(l => l.split('|'));
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
  await page.evaluate(() => { chosen['hello'] = 'שלום רב'; shuffle = a => a; });   // no shuffling: the first 20 words of the level
  await page.evaluate(() => { document.getElementById('words-input').value = ''; renderWords(); });
  await selectLevel(1);
  await page.click('#random-btn');
  await page.waitForFunction(() => document.querySelectorAll('#words-table tbody tr').length === 20);
  const l1 = await table();
  check(l1[0][0] === 'hello' && l1[0][1] === 'שלום רב', `a hand-picked meaning wins over the bank (${l1[0].join(' = ')})`);
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

// The app view never scrolls (any screen, any common portrait phone size); only the words box does.
async function testLayout() {
  console.log('\n[layout] no page scrolling, only the words box scrolls');
  const page = await openPage();
  const wordsText = n => Array.from({ length: n }, (_, i) => `word${i + 1}\tמילה${i + 1}`).join('\n');
  const setWords = n => page.evaluate(t => { document.getElementById('words-input').value = t; renderWords(); }, wordsText(n));
  const pageOverflow = () => page.evaluate(() => ({ y: document.documentElement.scrollHeight - innerHeight, x: document.documentElement.scrollWidth - innerWidth }));

  for (const [w, h] of [[320, 568], [360, 640], [360, 740], [390, 844], [412, 915]]) {
    const tag = `${w}x${h}`;
    await page.setViewport({ width: w, height: h });
    await page.evaluate(() => showStart());
    for (const n of [20, 40]) {
      await setWords(n);
      const o = await pageOverflow();
      const s = await page.evaluate(() => {
        const box = document.querySelector('.words-box'), b = document.getElementById('start-btn').getBoundingClientRect();
        return { boxScrolls: box.scrollHeight > box.clientHeight, btnInView: b.top >= 0 && b.bottom <= innerHeight };
      });
      check(o.y <= 0 && o.x <= 0, `${tag}, ${n} words: the page does not scroll (vertical ${o.y}px, horizontal ${o.x}px)`);
      check(s.boxScrolls && s.btnInView, `${tag}, ${n} words: the words box scrolls and the start button stays in view`);
    }
    // random-words button and level picker share one line, inside the card
    const line = await page.evaluate(() => {
      const r = id => document.getElementById(id).getBoundingClientRect(), b = r('random-btn'), s = r('level-select'), c = document.querySelector('.game-container').getBoundingClientRect();
      return { sameLine: Math.abs((b.top + b.bottom) / 2 - (s.top + s.bottom) / 2) <= 4, inside: Math.min(b.left, s.left) >= c.left && Math.max(b.right, s.right) <= c.right };
    });
    check(line.sameLine && line.inside, `${tag}: "20 random words" and the level picker are on one line, inside the card`);
    // game screen and the busiest result screen (all 4 buttons)
    await setWords(6);
    await page.evaluate(() => startFromInput());
    const g = await pageOverflow();
    check(g.y <= 0 && g.x <= 0, `${tag}, game screen: the page does not scroll (${g.y}px)`);
    // with the streak emoji showing at the top there is less room: it must still fit
    await page.evaluate(() => { streak = 75; shownStage = 0; updateStreakEmoji(); });
    const geNow = () => page.evaluate(() => ({ y: document.documentElement.scrollHeight - innerHeight, x: document.documentElement.scrollWidth - innerWidth, h: document.getElementById('streak-emoji').offsetHeight }));
    await new Promise(r => setTimeout(r, 300));
    const mid = await geNow();     // while the emoji is still popping in
    await new Promise(r => setTimeout(r, 700));
    const ge = await geNow();      // after the animation
    check(Math.max(mid.y, ge.y, mid.x, ge.x) <= 0 && ge.h >= 40, `${tag}, game screen with the streak emoji on top (${ge.h}px high): the page does not scroll, not even while it pops in (vertical ${ge.y}px, horizontal ${Math.max(mid.x, ge.x)}px)`);
    await page.evaluate(() => { missed = wordsData.slice(0, 2); wordsData = wordsData.slice(0, 3); showSummary(); });
    const r = await pageOverflow();
    check(r.y <= 0 && r.x <= 0, `${tag}, result screen with 4 buttons: the page does not scroll (${r.y}px)`);
  }
  // the picture tab must fit too
  await page.evaluate(() => setMode('picture'));
  for (const [w, h] of [[320, 568], [360, 640], [412, 915]]) {
    await page.setViewport({ width: w, height: h });
    for (const n of [0, 20, 40]) {
      await setWords(n);
      const o = await pageOverflow();
      const s = await page.evaluate(() => ({ btnInView: document.getElementById('start-btn').getBoundingClientRect().bottom <= innerHeight, photoInView: document.getElementById('photo-btn').getBoundingClientRect().bottom <= innerHeight }));
      check(o.y <= 0 && o.x <= 0 && s.btnInView && s.photoInView, `${w}x${h}, picture tab, ${n} words: no page scrolling, photo and start buttons in view`);
    }
  }
  // the four grey action buttons look the same, and the photo one is a real button that opens the file chooser
  await page.setViewport({ width: 360, height: 740 });
  await page.evaluate(() => showStart());
  const looks = await page.$$eval('#start-screen .action-btn', bs => bs.map(b => { const s = getComputedStyle(b); return { id: b.id || b.textContent.trim().slice(0, 12), tag: b.tagName, look: [s.backgroundColor, s.borderTopWidth, s.borderTopColor, s.borderRadius, s.fontSize, s.color, s.boxShadow].join('|') }; }));
  check(looks.length === 4 && looks.every(l => l.tag === 'BUTTON'), `there are 4 action buttons and all are real buttons (${looks.map(l => l.id).join(', ')})`);
  check(new Set(looks.map(l => l.look)).size === 1, 'the add, clear, random-words and photo buttons share the same look');
  const [chooser] = await Promise.all([page.waitForFileChooser({ timeout: 5000 }).catch(() => null), page.click('#photo-btn')]);
  check(!!chooser, 'the photo button opens the file chooser');
  if (chooser) await chooser.cancel();
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

// "→ תפריט" in the middle of a quiz: asks first, cancelling carries on, confirming goes to the main menu.
async function testBack() {
  console.log('\n[back] back to the main menu from a quiz');
  const page = await openPage();
  await page.evaluate(() => { document.getElementById('words-input').value = 'apple\tתפוח\ndog\tכלב\ncat\tחתול\nsun\tשמש'; renderWords(); });
  const vis = id => page.$eval('#' + id, e => getComputedStyle(e).display !== 'none');
  const txt = id => page.$eval('#' + id, e => e.innerText.trim());
  const total = () => page.evaluate(() => localStorage.getItem('englishquiz-total-points'));
  const dialogOpen = text => page.waitForFunction(t => [...document.querySelectorAll('button')].some(b => b.innerText.trim() === t), { timeout: 5000 }, text);
  const clickText = t => page.evaluate(t => [...document.querySelectorAll('button')].find(b => b.innerText.trim() === t).click(), t);
  const clickCorrect = () => page.evaluate(() => { const c = wordsData[currentIndex].correct; [...document.querySelectorAll('#answers-container button')].find(b => b.innerText === c).click(); });
  const wait = ms => new Promise(r => setTimeout(r, ms));

  await page.click('#start-btn');
  check(await vis('game-screen') && await vis('back-btn'), 'the quiz screen has a back-to-menu button');

  await page.click('#back-btn'); await dialogOpen('חזרה לתפריט');
  check(true, 'tapping it asks before leaving');
  await clickText('ביטול');
  check(await vis('game-screen') && !(await vis('start-screen')) && await txt('current-progress') === '1', 'cancel stays in the quiz, on the same question');
  await clickCorrect();
  await page.click('#back-btn'); await dialogOpen('חזרה לתפריט'); await clickText('ביטול');
  await page.waitForFunction(() => document.getElementById('current-progress').innerText === '2', { timeout: 5000 });
  check(true, 'cancelling right after a right answer still moves on to the next word');

  const before = await total();
  await page.click('#back-btn'); await dialogOpen('חזרה לתפריט'); await clickText('חזרה לתפריט');
  check(await vis('start-screen') && !(await vis('game-screen')) && !(await vis('summary-screen')), 'confirming goes back to the main menu');
  check((await total()) === before, `the points of the abandoned round are not added to the total (${before} -> ${await total()})`);
  check((await page.$$eval('#words-table tbody tr', r => r.length)) === 4, 'the word list is still there');

  await page.click('#start-btn');
  check(await txt('current-progress') === '1' && await txt('total-progress') === '4' && await txt('score') === '0', 'a new quiz starts from the beginning (question 1 of 4, 0 points)');

  // leaving at the very moment the LAST answer is right: the pending "next question" must not pop the result screen up
  for (let i = 0; i < 3; i++) { await clickCorrect(); await wait(700); }
  const before2 = await total();
  await clickCorrect();
  await page.click('#back-btn'); await dialogOpen('חזרה לתפריט'); await clickText('חזרה לתפריט');
  await wait(900);
  check(await vis('start-screen') && !(await vis('summary-screen')) && !(await vis('game-screen')), 'leaving right after the last right answer stays on the main menu (no result screen pops up)');
  check((await total()) === before2, 'and no points were added');
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

// Two tabs: random words (default) and picture. Each keeps its own list.
async function testTabs() {
  console.log('\n[tabs] random words / picture tabs, one list each');
  let page = await openPage();
  const vis = id => page.$eval('#' + id, e => getComputedStyle(e).display !== 'none');
  const selected = id => page.$eval('#' + id, e => e.getAttribute('aria-selected'));
  const table = () => page.$$eval('#words-table tbody tr', trs => trs.map(tr => [...tr.querySelectorAll('input')].map(i => i.value)));
  const setText = t => page.evaluate(t => { document.getElementById('words-input').value = t; renderWords(); saveRows(); }, t);

  check(await selected('tab-random') === 'true' && await selected('tab-picture') === 'false', 'the random-words tab is the default');
  check(await vis('panel-random') && !(await vis('panel-picture')), 'the default tab shows the level picker and the dice button, not the photo button');
  check((await page.$eval('#words-count', e => e.innerText)).includes('🎲'), 'an empty random list says to press the dice');

  await setText('apple\tתפוח\ndog\tכלב');
  await page.click('#tab-picture');
  check(await selected('tab-picture') === 'true' && await vis('panel-picture') && !(await vis('panel-random')), 'the picture tab shows the photo button instead');
  check((await table()).length === 0, 'the picture tab starts with its own, empty list');
  await setText('cat\tחתול\nsun\tשמש\nmoon\tירח\nstar\tכוכב');
  await page.click('#tab-random');
  check(JSON.stringify(await table()) === JSON.stringify([['apple', 'תפוח'], ['dog', 'כלב']]), 'going back to the random tab brings back its own list');

  // both lists and the last tab survive a reload
  await page.click('#tab-picture');
  await page.reload({ waitUntil: 'load' });
  check(await selected('tab-picture') === 'true', 'the last open tab is remembered');
  check((await table()).length === 4, 'the picture list is still there');
  await page.click('#tab-random');
  check((await table()).length === 2, 'and so is the random list');

  // the quiz plays the list of the tab that is open
  await page.click('#tab-picture');
  await page.click('#start-btn');
  check(await page.$eval('#total-progress', e => e.innerText) === '4', 'start plays the list of the open tab (picture: 4 words)');
  await page.evaluate(() => showStart());
  await page.click('#tab-random');
  await page.evaluate(() => { document.getElementById('words-input').value = 'apple\tתפוח\ndog\tכלב\ncat\tחתול\nsun\tשמש\nmoon\tירח\nstar\tכוכב'; renderWords(); saveRows(); });
  await page.click('#start-btn');
  check(await page.$eval('#total-progress', e => e.innerText) === '6', 'and in the random tab it plays the random list (6 words)');
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();

  // an older single list (saved before the tabs existed) shows up in the picture tab; the random tab starts empty
  page = await openPage();
  await page.evaluate(() => { localStorage.setItem('englishquiz-words', 'old\tישן\nnew\tחדש'); localStorage.removeItem('englishquiz-mode'); localStorage.removeItem('englishquiz-words-random'); });
  await page.reload({ waitUntil: 'load' });
  check((await table()).length === 0, 'after an update the random tab starts empty');
  await page.click('#tab-picture');
  check(JSON.stringify(await table()) === JSON.stringify([['old', 'ישן'], ['new', 'חדש']]), 'a list saved by an older version appears in the picture tab');
  await page.close();
}

// A big emoji after every 5 / 10 / 15 (by tier) first-try answers in a row, up to 300: 30 different emojis, a mistake lowers the streak by 1, the streak carries over.
async function testStreak() {
  console.log('\n[streak] emoji after every 5 right answers in a row');
  const page = await openPage();
  await page.evaluate(() => { document.getElementById('words-input').value = Array.from({ length: 24 }, (_, i) => `word${i + 1}\tמילה${i + 1}`).join('\n'); renderWords(); });
  const emoji = () => page.$eval('#streak-emoji', e => ({ text: e.textContent, on: e.classList.contains('on') }));
  const answer = (right, firstWrong = false) => page.evaluate((firstWrong) => {
    const c = wordsData[currentIndex].correct, bs = [...document.querySelectorAll('#answers-container button')];
    if (firstWrong) bs.find(b => b.innerText !== c).click();
    bs.find(b => b.innerText === c).click();
  }, firstWrong);
  const next = ms => new Promise(r => setTimeout(r, ms));
  const emojis = await page.evaluate(() => STREAK_EMOJIS);
  check(emojis.length === 30 && new Set(emojis).size === 30, `there are 30 different emojis, one per 5 / 10 / 15 in a row up to 300 (${emojis.join(' ')})`);
  // near-twins that people can not tell apart on a phone: at most one face from each family may be used
  const FAMILIES = [['😀', '😃', '😄', '😁'], ['😂', '🤣', '😹'], ['🙂', '🙃'], ['😊', '☺️'], ['🌟', '⭐'], ['😜', '😝', '😛'], ['😸', '😺', '😃']];
  const clash = FAMILIES.filter(f => f.filter(x => emojis.includes(x)).length > 1).map(f => f.filter(x => emojis.includes(x)).join(' + '));
  check(clash.length === 0, `no two emojis that look alike (${clash.join('; ') || 'ok'})`);

  await page.click('#start-btn');
  for (let i = 0; i < 4; i++) { await answer(true); await next(560); }
  check(!(await emoji()).on, 'no emoji after 4 right answers');
  await answer(true); await next(560);
  let e = await emoji();
  check(e.on && e.text === emojis[0], `the 1st emoji appears after 5 in a row (${e.text})`);
  for (let i = 0; i < 4; i++) { await answer(true); await next(560); }
  check((await emoji()).text === emojis[0], 'it stays the same until the next 5 (9 in a row)');
  await answer(true); await next(560);
  e = await emoji();
  check(e.on && e.text === emojis[1], `a happier one after 10 in a row (${e.text})`);
  await answer(true, true); await next(560);   // a mistake first, then the right answer
  check(await page.evaluate(() => streak) === 9 && (await emoji()).on && (await emoji()).text === emojis[0], 'one wrong first try at 10 in a row lowers the streak to 9: back to the 1st emoji');
  await page.evaluate(() => { streak = 5; shownStage = 0; updateStreakEmoji(); });
  await answer(true, true); await next(560);   // 5 -> 4
  check(await page.evaluate(() => streak) === 4 && !(await emoji()).on, 'a wrong first try at 5 lowers it to 4: the emoji fades away');
  await answer(true); await next(560);
  check((await emoji()).on && (await emoji()).text === emojis[0], 'and 1 more right answer (4 -> 5) brings the 1st emoji back');
  await page.evaluate(() => { streak = 165; shownStage = 0; updateStreakEmoji(); });
  await answer(true, true); await next(560);   // 165 -> 164
  check(await page.evaluate(() => streak) === 164 && (await emoji()).text === emojis[19], 'a wrong first try at 165 lowers it to 164 and the emoji drops to the 20th');

  // the streak carries on into the next round and through the menu; only a wrong first try lowers it
  await page.evaluate(() => { streak = 14; shownStage = 0; updateStreakEmoji(); });   // 14 in a row: 2nd emoji
  const before = (await emoji()).text;
  await page.evaluate(() => restartGame());
  check((await emoji()).on && (await emoji()).text === before, 'a new round keeps the emoji of the streak');
  await answer(true, true); await next(560);   // a wrong first try at 0 points
  check(await page.evaluate(() => totalScore) === 0 && await page.$eval('#score', e => e.textContent) === '0', 'a wrong first try at 0 points keeps the points at 0 (never below)');
  // steps: emojis 1-10 every 5 (5..50), 11-20 every 10 (60..150), 21-30 every 15 (165..300)
  const stageAt = async s => { await page.evaluate(s => { streak = s; shownStage = 0; updateStreakEmoji(); }, s); return (await emoji()).text; };
  check(await stageAt(50) === emojis[9], '50 in a row shows the 10th emoji');
  check(await stageAt(59) === emojis[9], '59 in a row still shows the 10th (the step is now 10)');
  check(await stageAt(60) === emojis[10], '60 in a row shows the 11th emoji');
  check(await stageAt(150) === emojis[19] && emojis[19] === '💯', `150 in a row shows the 20th emoji (${(await emoji()).text})`);
  check(await stageAt(164) === emojis[19], '164 in a row still shows the 20th (the step is now 15)');
  check(await stageAt(165) === emojis[20], '165 in a row shows the 21st emoji');
  check(await stageAt(299) === emojis[28], `299 in a row shows the 29th emoji (${(await emoji()).text})`);
  await answer(true); await next(560);
  check((await emoji()).text === emojis[29], `300 in a row shows the 30th, top emoji (${(await emoji()).text})`);
  await page.evaluate(() => { streak = 400; updateStreakEmoji(); });
  check((await emoji()).text === emojis[29], 'and it stays at the 30th beyond that');
  await page.evaluate(() => showStart());
  check((await emoji()).on && (await emoji()).text === emojis[29], 'back at the menu the streak is kept');
  await page.evaluate(() => { streak = 7; shownStage = 0; updateStreakEmoji(); });
  await page.evaluate(() => showStart());
  check((await emoji()).text === emojis[0], 'going to the menu does not reset the streak');
  // the streak survives a reload
  await page.evaluate(() => { streak = 23; shownStage = 0; updateStreakEmoji(); });
  await page.reload();
  check(await page.evaluate(() => streak) === 23 && (await emoji()).on && (await emoji()).text === emojis[3], 'after a reload the streak (23) and its emoji are restored');
  await page.evaluate(() => { streak = 3; updateStreakEmoji(); });
  await page.reload();
  check(await page.evaluate(() => streak) === 3 && !(await emoji()).on, 'a small streak is restored too, with no emoji yet');
  // the main screen shows a small copy of the emoji
  const menu = () => page.$eval('#menu-streak', e => ({ text: e.textContent, visible: e.getBoundingClientRect().height > 0 && e.offsetParent !== null }));
  check((await menu()).text === '' , 'main screen: no small emoji below 5 in a row');
  await page.evaluate(() => { streak = 23; updateStreakEmoji(); });
  check((await menu()).text === emojis[3] && (await menu()).visible, 'main screen: the small emoji of the current streak is visible');
  await page.evaluate(() => { streak = 11; updateStreakEmoji(); });
  check((await menu()).text === emojis[1], 'main screen: it follows the streak (11 -> 2nd emoji)');
  const nextText = () => page.$eval('#streak-next', e => e.textContent);
  await page.evaluate(() => { streak = 0; updateStreakEmoji(); });
  check(await nextText() === 'עוד 5', `game: 0 in a row -> 5 more to the 1st emoji (${await nextText()})`);
  await page.evaluate(() => { streak = 11; updateStreakEmoji(); });
  check(await nextText() === 'עוד 4', `game: 11 in a row -> 4 more to the 3rd emoji (${await nextText()})`);
  await page.evaluate(() => { streak = 160; updateStreakEmoji(); });
  check(await nextText() === 'עוד 5', `game: 160 in a row -> 5 more to the 21st emoji (${await nextText()})`);
  await page.evaluate(() => { streak = 300; updateStreakEmoji(); });
  check(await nextText() === '', 'game: nothing left to reach at the top emoji');
  await page.evaluate(() => { streak = 11; updateStreakEmoji(); });
  const count = () => page.$eval('#menu-streak-count', e => e.textContent);
  check(await count() === '2', 'main screen: the emoji stage (11 in a row -> stage 2) is shown next to the small emoji');
  await page.evaluate(() => { streak = 4; updateStreakEmoji(); });
  check(await count() === '', 'main screen: no stage below 5 in a row');
  await page.evaluate(() => { streak = 11; updateStreakEmoji(); });
  await page.reload();
  check((await menu()).text === emojis[1] && (await menu()).visible, 'main screen: still there after a reload');
  // the points total and the small emoji share one line
  await page.evaluate(() => { localStorage.setItem('x', '1'); document.getElementById('grand-total').innerText = '⭐ סה״כ נקודות: 12'; });
  const sameLine = await page.evaluate(() => { const a = document.getElementById('grand-total').getBoundingClientRect(), b = document.getElementById('menu-streak').getBoundingClientRect(); return { dy: Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2), ah: a.height, bh: b.height }; });
  check(sameLine.dy < Math.max(sameLine.ah, sameLine.bh) / 2, `main screen: the points and the small emoji are on the same line (vertical centres ${Math.round(sameLine.dy)}px apart)`);
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

// Runs a photo test on every fixture of its kind; a third argument on the command line picks one file (substring).
async function eachFixture(kind, run) {
  for (const fx of FIXTURES[kind]) {
    if (process.argv[3] && !fx.file.includes(process.argv[3])) continue;
    if (!fs.existsSync(path.resolve(here, 'fixtures', fx.file))) { console.log(`\n[${kind}] SKIPPED - tests/fixtures/${fx.file} not found (photos are git-ignored)`); continue; }
    await run(fx);
  }
}

// The 📚 learning tab: each level's categories as a path of steps (big categories split into parts of up to 15).
// Only the first unfinished step is open. A step = cards with the English word and the Hebrew together, then a short
// quiz on those words; only a quiz with no mistakes opens the next step.
async function testLearn() {
  console.log('\n[learn] learning path by category, with a quiz at the end of each step');
  const page = await openPage();
  const bankSteps = lv => {   // the steps the page should build from the level file
    const cats = [];
    for (const l of fs.readFileSync(path.join(root, 'wordbank', `level-${lv}.txt`), 'utf8').split(/\r?\n/)) {
      if (l.startsWith('#')) cats.push({ name: l.slice(1).trim(), n: 0, words: [] }); else if (l.includes('|')) { cats[cats.length - 1].n++; cats[cats.length - 1].words.push(l.split('|')); }
    }
    return cats.flatMap(c => { const parts = Math.ceil(c.n / 15), size = Math.ceil(c.n / parts); return Array.from({ length: parts }, (_, p) => ({ name: c.name, n: Math.min(size, c.n - p * size), catWords: c.words })); });
  };
  const steps = () => page.$$eval('#cat-list .cat-step', bs => bs.map(b => ({ cls: b.className.replace('cat-step ', ''), name: b.querySelector('.cat-name').textContent, meta: b.querySelector('.cat-meta').textContent, disabled: b.disabled })));
  const vis = id => page.$eval('#' + id, e => getComputedStyle(e).display !== 'none');
  const text = id => page.$eval('#' + id, e => e.textContent);
  const progress = () => page.evaluate(() => JSON.parse(localStorage.getItem('englishquiz-learn-progress')));
  const finishCards = () => page.evaluate(() => { for (let i = 0; i < learn.step.words.length; i++) learnStep(1); });
  // plays the open quiz to the end; the first `wrong` questions get a wrong answer first
  const playQuiz = (wrong = 0) => page.evaluate(wrong => {
    for (let k = 0; currentIndex < wordsData.length; k++) {
      const c = wordsData[currentIndex].correct, bs = [...document.querySelectorAll('#answers-container button')];
      if (k < wrong) bs.find(b => b.innerText !== c).click();
      bs.find(b => b.innerText === c).click();
      clearTimeout(nextQuestionTimer); nextQuestionTimer = null; currentIndex++; loadQuestion();
    }
  }, wrong);
  const doStep = async (wrong = 0) => { await finishCards(); await page.click('#learn-quiz-btn'); await playQuiz(wrong); };

  await page.select('#level-select', '1');
  await page.click('#tab-category');
  await page.waitForFunction(() => document.querySelectorAll('#cat-list .cat-step').length > 0, { timeout: 10000 });
  const want = bankSteps(1);
  let st = await steps();
  check(st.length === want.length && st.every((s, i) => s.name === `${i + 1}. ${want[i].name}` && s.meta.endsWith(`${want[i].n} מילים`)), `level 1 shows one step per category (big ones split): ${st.length} steps, every Hebrew category name in order`);
  check(want.every(w => w.n >= 4 && w.n <= 15), 'every step has 4-15 words');
  check(st[0].cls === 'current' && !st[0].disabled && st.slice(1).every(s => s.cls === 'locked' && s.disabled), 'only the first step is open, all the others are locked');
  check(!(await vis('words-count')) && !(await vis('start-btn')), 'the word list and the start button are hidden in the learning tab');
  check((await page.$eval('#cat-level-select', e => e.value)) === '1', 'the learning tab uses the chosen level');

  // the cards of step 1
  await page.click('.cat-step.current');
  check(await vis('learn-screen') && !(await vis('start-screen')), 'tapping the open step shows the learning cards');
  const first = await page.evaluate(() => ({ en: document.getElementById('learn-word').textContent, he: document.getElementById('learn-meaning').textContent, n: learn.step.words.length, words: learn.step.words.map(w => w.en) }));
  const l1 = Object.fromEntries(fs.readFileSync(path.join(root, 'wordbank', 'level-1.txt'), 'utf8').split(/\r?\n/).filter(l => l.includes('|')).map(l => l.split('|')));
  const both = await page.evaluate(() => { const v = id => { const r = document.getElementById(id).getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; }; return v('learn-word') && v('learn-meaning'); });
  check(first.n === want[0].n && l1[first.en] === first.he && both, `the card shows a word of the step and its Hebrew meaning together, both in view (${first.en} = ${first.he})`);
  check(!(await page.$eval('#learn-next', e => e.disabled)) && await page.$eval('#learn-prev', e => e.disabled), '"next" works right away (and there is no previous card)');
  await page.click('#learn-next');
  check((await text('learn-count')) === `2/${first.n}`, 'next shows the 2nd card');
  await page.click('#learn-prev');
  check((await text('learn-count')) === `1/${first.n}`, 'previous goes back');
  for (let i = 0; i < first.n; i++) {
    if (i === first.n - 1) check((await text('learn-next')).includes('סיום'), 'on the last card the button says finish');
    await page.click('#learn-next');
  }
  check(await vis('learn-done-screen') && (await text('learn-unlock')).includes('בוחן'), 'after the last card: well done, now a short quiz');
  check(!(await progress()), 'learning the cards alone does not open the next step yet');

  // the quiz of step 1
  await page.click('#learn-quiz-btn');
  check(await vis('game-screen'), 'the quiz starts');
  const quiz = await page.evaluate(() => wordsData.map(w => ({ word: w.word, correct: w.correct, dynamics: w.dynamics })));
  const catHe = new Set(want[0].catWords.map(w => w[1]));
  check(quiz.length === first.n && quiz.every(q => first.words.includes(q.word) && l1[q.word] === q.correct), `the quiz asks exactly the ${first.n} words of the step`);
  check(quiz.every(q => q.dynamics.length === 3 && new Set([q.correct, ...q.dynamics]).size === 4 && q.dynamics.every(d => catHe.has(d))), 'every question has 4 different answers, the wrong ones from the same category');
  await playQuiz(1);   // one mistake
  check(await vis('summary-screen') && (await text('step-result')).includes('בלי טעויות') && !(await vis('next-step-btn')), `one mistake: the summary says the quiz must be done with no mistakes, and there is no "next topic" (${await text('step-result')})`);
  check(!(await progress()), 'and the next step stays locked');
  await page.evaluate(() => practiceMissed());
  await playQuiz(0);
  check(!(await vis('next-step-btn')) && !(await progress()), 'practising only the missed words does not open it either');
  check((await text('change-words-btn')).includes('מסלול'), 'the summary offers a way back to the path');
  check(await vis('all-words-btn'), 'after practising, "all the words" brings back the full quiz');
  await page.evaluate(() => playAll());
  await playQuiz(0);
  check((await text('step-result')).includes(want[1].name) && await vis('next-step-btn'), `passing the quiz says the next step is open (${want[1].name})`);
  check((await progress())[1] === 1, 'the progress is saved on the device');
  await page.click('#next-step-btn');
  check(await vis('learn-screen') && (await text('learn-title')).includes(want[1].name), '"next topic" starts learning the next step');
  await page.click('#learn-back');
  st = await steps();
  check(st[0].cls === 'done' && st[1].cls === 'current' && st[2].cls === 'locked', 'back on the path: step 1 is done, step 2 is open, step 3 still locked');

  // a finished step can be learned (and quizzed) again without changing the progress
  await page.click('.cat-step.done');
  check(await vis('learn-screen'), 'a finished step can be learned again');
  await doStep(0);
  check(!(await text('step-result')).includes('🔓') && (await progress())[1] === 1, 'passing its quiz again opens nothing new');
  await page.click('#change-words-btn');
  check(await vis('start-screen') && await page.$eval('#tab-category', e => e.getAttribute('aria-selected')) === 'true', '"back to the path" from the summary shows the path');

  // survives a reload; levels are separate; the last step of a level offers the next level
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll('#cat-list .cat-step').length > 0, { timeout: 10000 });
  st = await steps();
  check(await page.$eval('#tab-category', e => e.getAttribute('aria-selected')) === 'true' && st[1].cls === 'current', 'after a reload the learning tab and the progress are back');
  const n5 = bankSteps(5).length;
  await page.select('#cat-level-select', '5');
  await page.waitForFunction(n => document.querySelectorAll('#cat-list .cat-step').length === n, { timeout: 10000 }, n5);
  st = await steps();
  check(st[0].cls === 'current' && st[1].cls === 'locked', `level 5 has its own path (${n5} steps), starting from step 1`);
  check((await page.$eval('#level-select', e => e.value)) === '5', 'changing the level here changes it in the random tab too');
  await page.evaluate(n => { learnProgress = { 1: 1, 5: n - 1 }; localStorage.setItem('englishquiz-learn-progress', JSON.stringify(learnProgress)); renderPath(); }, n5);
  await page.waitForFunction(n => document.querySelectorAll('#cat-list .cat-step.done').length === n - 1, { timeout: 10000 }, n5);
  await page.click('.cat-step.current');
  await doStep(0);
  check((await text('step-result')).includes('ברמה 5') && (await text('next-step-btn')).includes('לרמה 6'), 'passing the quiz of the last step of level 5 says so and offers level 6');
  await page.click('#next-step-btn');
  await page.waitForFunction(() => document.getElementById('cat-level-select').value === '6' && document.querySelectorAll('#cat-list .cat-step.current').length === 1, { timeout: 10000 });
  check(await vis('start-screen'), 'which opens the level 6 path');

  // a quiz from the random tab is not a step quiz
  await page.click('#tab-random');
  await page.evaluate(() => { document.getElementById('words-input').value = 'cat\tחתול\ndog\tכלב\nsun\tשמש\nmoon\tירח'; renderWords(); startFromInput(); });
  await playQuiz(0);
  check(!(await vis('step-result')) && !(await vis('next-step-btn')) && (await text('change-words-btn')) === 'החלפת מילים', 'a quiz from the random tab shows the usual summary');
  await page.evaluate(() => showStart());
  await page.click('#tab-category');
  await page.waitForSelector('.cat-step.current');

  // every learning screen fits common phones without page scrolling
  for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
    await page.setViewport({ width: w, height: h });
    const over = () => page.evaluate(() => Math.max(document.documentElement.scrollHeight - innerHeight, document.documentElement.scrollWidth - innerWidth));
    await page.evaluate(() => showStart());
    await page.waitForSelector('.cat-step.current');
    const pathO = await over();
    await page.click('.cat-step.current');
    const cardO = await over();
    await finishCards();
    const doneO = await over();
    await page.click('#learn-quiz-btn');
    const quizO = await over();
    await playQuiz(2);   // a summary with missed words
    const sumO = await over();
    await page.evaluate(() => restartGame());
    await playQuiz(0);   // a summary with the bonus badge, the unlock and "next topic"
    const sum2O = await over();
    check(Math.max(pathO, cardO, doneO, quizO, sumO, sum2O) <= 0, `${w}x${h}: the path, the card, the well-done screen, the quiz and both summaries fit without page scrolling (${pathO}/${cardO}/${doneO}/${quizO}/${sumO}/${sum2O}px)`);
  }
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

const TESTS = { wordbank: testWordbank, random: testRandom, layout: testLayout, back: testBack, tabs: testTabs, streak: testStreak, pairs: () => eachFixture('pairs', testPairs), list: () => eachFixture('list', testList), translation: testTranslationRetry, practice: testPractice, chooser: testChooser, header: testHeader, persist: testPersist, learn: testLearn };
try {
  let ran = 0;
  for (const [name, run] of Object.entries(TESTS)) {
    if (only && only !== name) continue;
    await run(); ran++;
  }
  if (!ran) { console.error(`Nothing ran (known tests: ${Object.keys(TESTS).join(', ')}).`); process.exitCode = 2; }
} finally {
  await browser.close();
  server.close();
}

console.log(failures.length ? `\n${failures.length} check(s) FAILED` : '\nAll checks passed');
process.exit(process.exitCode || (failures.length ? 1 : 0));
