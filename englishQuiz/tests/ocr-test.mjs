// End-to-end OCR test for englishQuiz: loads the real page in headless Chrome, uploads photos from
// tests/fixtures/ and checks the rows the page produces. Covers both kinds of photos:
//   - "pairs": English words with their Hebrew next to them        (new-words-*.jpg)
//   - "list":  English-only word list, meanings come from translation (word-list-*.jpg)
// The translation service (MyMemory) is stubbed, so the test is fast, repeatable and doesn't hit the real API.
//
// Setup (once):   cd tests && npm install
// Run:            cd tests && npm run ocr              (everything)   |   node ocr-test.mjs wordbank|random|layout|back|tabs|streak|pairs|list|translation|practice|chooser|header|persist|learn|shop|box|phoneback|avatar   (pairs/list take a file-name part too: node ocr-test.mjs list quarter)
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
async function openPage(mode = () => 'ok', { fresh = false } = {}) {
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
  // New users start on the learning tab; most tests are about the word list, so they start on the random tab
  // (as a returning user who picked it). { fresh: true } opens the page as a brand-new user.
  if (!fresh) await page.evaluateOnNewDocument(() => { try { if (!localStorage.getItem('englishquiz-mode')) localStorage.setItem('englishquiz-mode', 'random'); } catch (e) {} });
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
  const badFormat = [], badEn = [], badHe = [], longHe = [], dupEn = [], badPic = [];
  for (const [lv, arr] of Object.entries(bank)) for (const p of arr) {
    const [en, he, pic] = p;
    if (p.length < 2 || p.length > 3 || !en.trim() || !he.trim()) { badFormat.push(`L${lv} ${p.join('|')}`); continue; }
    if (p.length === 3 && !/^[0-9]\uFE0F\u20E3$/.test(pic) && !/^\p{Extended_Pictographic}(\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?|\p{Emoji_Modifier})*$/u.test(pic)) badPic.push(`L${lv} ${en}=${pic}`);
    if (!/^[A-Za-z][A-Za-z' -]*$/.test(en)) badEn.push(`L${lv} ${en}`);
    if (!/^[֐-׿][֐-׿ '"\-\/,]*$/.test(he) || /[֑-ׇ]/.test(he)) badHe.push(`L${lv} ${en}=${he}`);
    if (he.split(/\s+/).length > 3) longHe.push(`L${lv} ${en}=${he}`);
    const k = en.toLowerCase(); if (allEn.has(k)) dupEn.push(`${en} (L${allEn.get(k)} and L${lv})`); else allEn.set(k, lv);
  }
  check(!badFormat.length, `every line is "english|hebrew" or "english|hebrew|emoji" (${badFormat.slice(0, 3).join('; ') || 'ok'})`);
  check(!badPic.length, `a picture is a single emoji (${badPic.slice(0, 5).join(', ') || 'ok'})`);
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
  await page.evaluate(() => { streak = 290; updateStreakEmoji(); });
  check(await nextText() === '🎁 עוד 10', `game: before the last emoji it counts down to it and the mystery box (${await nextText()})`);
  await page.evaluate(() => { streak = 11; updateStreakEmoji(); });
  check(!(await page.$('#menu-streak-count')), 'main screen: the small emoji has no stage number next to it');
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
  console.log('\n[learn] learning path by category: a learn and a quiz button for every part, green when its quiz is passed');
  const newbie = await openPage(undefined, { fresh: true });
  await newbie.waitForFunction(() => document.querySelectorAll('#cat-list .cat-step').length > 0, { timeout: 10000 });
  check(await newbie.$eval('#tab-category', e => e.getAttribute('aria-selected')) === 'true' && await newbie.$eval('#panel-category', e => getComputedStyle(e).display !== 'none'), 'a new user starts on the learning tab, with the path shown');
  await newbie.close();
  const page = await openPage();
  const bankSteps = lv => {   // the steps the page should build from the level file
    const cats = [];
    for (const l of fs.readFileSync(path.join(root, 'wordbank', `level-${lv}.txt`), 'utf8').split(/\r?\n/)) {
      if (l.startsWith('#')) cats.push({ name: l.slice(1).trim(), n: 0, words: [] }); else if (l.includes('|')) { cats[cats.length - 1].n++; cats[cats.length - 1].words.push(l.split('|')); }
    }
    return cats.flatMap(c => { const parts = Math.ceil(c.n / 15), size = Math.ceil(c.n / parts); return Array.from({ length: parts }, (_, p) => ({ name: c.name, n: Math.min(size, c.n - p * size), catWords: c.words })); });
  };
  const steps = () => page.$$eval('#cat-list .cat-row', rows => rows.map(r => {
    const c = r.querySelector('.cat-step');
    return { done: c.classList.contains('done'), name: c.querySelector('.cat-name').textContent, meta: c.querySelector('.cat-meta').textContent, state: c.querySelector('.cat-state').textContent,
      learn: !!r.querySelector('.cat-learn:not([disabled])'), quiz: !!r.querySelector('.cat-quiz:not([disabled])') };
  }));
  const row = i => `#cat-list .cat-row:nth-child(${i + 1})`;
  const vis = id => page.$eval('#' + id, e => getComputedStyle(e).display !== 'none');
  const text = id => page.$eval('#' + id, e => e.textContent);
  const progress = () => page.evaluate(() => JSON.parse(localStorage.getItem('englishquiz-learn-progress')));
  const fireworks = () => page.evaluate(() => { const f = !!document.getElementById('fireworks'); document.querySelectorAll('#fireworks').forEach(c => c.remove()); return f; });
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
  const quizReady = () => page.waitForFunction(() => document.getElementById('game-screen').style.display !== 'none' && wordsData.length > 0, { timeout: 10000 });

  await page.evaluate(() => { window.unlockSounds = 0; playUnlockSound = () => window.unlockSounds++; });   // count the jingle instead of playing it
  const sounds = () => page.evaluate(() => window.unlockSounds);
  await page.select('#level-select', '1');
  await page.click('#tab-category');
  await page.waitForFunction(() => document.querySelectorAll('#cat-list .cat-step').length > 0, { timeout: 10000 });
  const want = bankSteps(1);
  let st = await steps();
  check(st.length === want.length && st.every((s, i) => s.name === `${i + 1}. ${want[i].name}` && s.meta.endsWith(`${want[i].n} מילים`)), `level 1 shows one part per category (big ones split): ${st.length} parts, every Hebrew category name in order`);
  check(want.every(w => w.n >= 4 && w.n <= 15), 'every part has 4-15 words');
  check(st.every(s => s.learn && s.quiz && !s.done && s.state === ''), 'nothing is locked: every part has a 📖 learn and a 📝 quiz button, none is green yet');
  check(!(await page.$eval('#cat-list', e => e.textContent.includes('🔒'))), 'no lock anywhere on the path');
  check((await text('path-progress')) === `⭐ 0/${want.length}`, 'the path counts 0 passed parts');
  check(!(await vis('words-count')) && !(await vis('start-btn')), 'the word list and the start button are hidden in the learning tab');
  check((await page.$eval('#cat-level-select', e => e.value)) === '1', 'the learning tab uses the chosen level');

  // the cards of part 1
  await page.click(`${row(0)} .cat-learn`);
  check(await vis('learn-screen') && !(await vis('start-screen')), 'the 📖 button shows the learning cards');
  const first = await page.evaluate(() => ({ en: document.getElementById('learn-word').textContent, he: document.getElementById('learn-meaning').textContent, n: learn.step.words.length, words: learn.step.words.map(w => w.en) }));
  const l1 = Object.fromEntries(fs.readFileSync(path.join(root, 'wordbank', 'level-1.txt'), 'utf8').split(/\r?\n/).filter(l => l.includes('|')).map(l => l.split('|')));
  const both = await page.evaluate(() => { const v = id => { const r = document.getElementById(id).getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; }; return v('learn-word') && v('learn-meaning'); });
  check(first.n === want[0].n && l1[first.en] === first.he && both, `the card shows a word of the part and its Hebrew meaning together, both in view (${first.en} = ${first.he})`);
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
  check(!(await progress()), 'learning the cards alone does not mark the part as passed');

  // the quiz of part 1
  await page.click('#learn-quiz-btn');
  check(await vis('game-screen'), 'the quiz starts');
  const quiz = await page.evaluate(() => wordsData.map(w => ({ word: w.word, correct: w.correct, dynamics: w.dynamics })));
  const catHe = new Set(want[0].catWords.map(w => w[1]));
  check(quiz.length === first.n && quiz.every(q => first.words.includes(q.word) && l1[q.word] === q.correct), `the quiz asks exactly the ${first.n} words of the part`);
  check(quiz.every(q => q.dynamics.length === 3 && new Set([q.correct, ...q.dynamics]).size === 4 && q.dynamics.every(d => catHe.has(d))), 'every question has 4 different answers, the wrong ones from the same category');
  await playQuiz(1);   // one mistake
  check(await vis('summary-screen') && (await text('step-result')).includes('בירוק') && (await text('step-result')).includes('בלי טעויות'), `one mistake: the summary says the part turns green only with no mistakes (${await text('step-result')})`);
  check(!(await progress()) && await sounds() === 0 && !(await fireworks()), 'not passed: nothing saved, no sound, no fireworks');
  const onlyBack = () => page.evaluate(() => [...document.querySelectorAll('#summary-screen .btn-restart')].filter(b => getComputedStyle(b).display !== 'none').map(b => b.id || b.textContent.trim()));
  check(JSON.stringify(await onlyBack()) === '["change-words-btn"]' && (await text('change-words-btn')).includes('מסלול'),
        `the summary of a learning quiz has only the button back to the path (no try again / practice / next topic): ${JSON.stringify(await onlyBack())}`);
  await page.click('#change-words-btn');
  await page.waitForSelector('#cat-list .cat-quiz');
  await page.click(`${row(0)} .cat-quiz`);
  await quizReady();
  await playQuiz(0);
  check((await text('step-result')).includes('בירוק') && JSON.stringify(await onlyBack()) === '["change-words-btn"]', `taking the part's quiz again from the path and passing it: the part is green now (${await text('step-result')}), still only the back button`);
  check(JSON.stringify((await progress())[1]) === '[0]', 'the passed part is saved on the device');
  check(await sounds() === 1, 'the happy sound plays once');
  check(await fireworks(), '🎆 fireworks when the quiz of the part is passed');
  await page.click('#change-words-btn');
  await page.waitForSelector('#cat-list .cat-step.done');
  st = await steps();
  check(st[0].done && st[0].state === '✅' && !st[1].done && st.slice(1).every(s => s.learn && s.quiz), 'back on the path: part 1 is green with ✅, the others stay white and open');

  // any part, in any order: the 📝 button of part 4 goes straight to its quiz
  const step4 = want[3];
  await page.click(`${row(3)} .cat-quiz`);
  await quizReady();
  const quiz4 = await page.evaluate(() => wordsData.map(w => w.word)), words4 = step4.catWords.map(w => w[0]);
  check(await vis('game-screen') && !(await vis('start-screen')) && !(await vis('learn-screen')) && quiz4.length === step4.n && quiz4.every(w => words4.includes(w)), `the 📝 button of part 4 starts its quiz right away, without the cards (${quiz4.length} words)`);
  await playQuiz(0);
  check(JSON.stringify((await progress())[1]) === '[0,3]' && await fireworks() && await sounds() === 2, 'passing it marks part 4 (parts 2-3 not needed first), with fireworks');
  await page.click('#change-words-btn');
  await page.waitForFunction(() => document.querySelectorAll('#cat-list .cat-step.done').length === 2, { timeout: 10000 });
  st = await steps();
  check(st[0].done && !st[1].done && !st[2].done && st[3].done && (await text('path-progress')) === `⭐ 2/${want.length}`, 'the path: parts 1 and 4 green, 2 and 3 white, ⭐ 2');

  // a passed part can be learned and quizzed again: it stays green, fireworks again, nothing new saved
  await page.click(`${row(0)} .cat-learn`);
  check(await vis('learn-screen'), 'a passed part can be learned again');
  await doStep(0);
  check((await text('step-result')) === '✅ עברתם את הבוחן!' && JSON.stringify((await progress())[1]) === '[0,3]' && await sounds() === 2 && await fireworks(), 'passing its quiz again: "passed", fireworks, no sound, nothing new');
  await page.click('#change-words-btn');
  check(await vis('start-screen') && await page.$eval('#tab-category', e => e.getAttribute('aria-selected')) === 'true', '"back to the path" from the summary shows the path');

  // progress saved by the older version (a count of parts passed in order) still shows
  await page.evaluate(() => { learnProgress = { 1: 2 }; localStorage.setItem('englishquiz-learn-progress', JSON.stringify(learnProgress)); renderPath(); });
  await page.waitForFunction(() => document.querySelectorAll('#cat-list .cat-step.done').length === 2, { timeout: 10000 });
  st = await steps();
  check(st[0].done && st[1].done && !st[2].done, 'older saved progress (2 parts in order) shows parts 1-2 green');

  // survives a reload; levels are separate; the last part of a level offers the next level
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll('#cat-list .cat-step').length > 0, { timeout: 10000 });
  st = await steps();
  check(await page.$eval('#tab-category', e => e.getAttribute('aria-selected')) === 'true' && st[0].done && st[1].done && !st[2].done, 'after a reload the learning tab and the progress are back');
  const n5 = bankSteps(5).length;
  await page.select('#cat-level-select', '5');
  await page.waitForFunction(n => document.querySelectorAll('#cat-list .cat-step').length === n, { timeout: 10000 }, n5);
  st = await steps();
  check(st.every(s => !s.done && s.learn && s.quiz), `level 5 has its own path (${n5} parts), nothing passed yet`);
  check((await page.$eval('#level-select', e => e.value)) === '5', 'changing the level here changes it in the random tab too');
  await page.evaluate(n => { learnProgress = { 1: [0, 1], 5: Array.from({ length: n - 1 }, (_, i) => i) }; localStorage.setItem('englishquiz-learn-progress', JSON.stringify(learnProgress)); renderPath(); }, n5);
  await page.waitForFunction(n => document.querySelectorAll('#cat-list .cat-step.done').length === n - 1, { timeout: 10000 }, n5);
  await page.click(`${row(n5 - 1)} .cat-learn`);
  await doStep(0);
  check((await text('step-result')).includes('ברמה 5') && !(await vis('next-step-btn')), 'passing the last part of level 5 says all its topics are passed');
  await fireworks();   // clear them (the check below must not see these)
  await page.click('#change-words-btn');
  await page.waitForFunction(() => document.querySelectorAll('#cat-list .cat-learn').length > 0, { timeout: 10000 });

  // a quiz from the random tab is not a part's quiz
  await page.click('#tab-random');
  await page.evaluate(() => { document.getElementById('words-input').value = 'cat\tחתול\ndog\tכלב\nsun\tשמש\nmoon\tירח'; renderWords(); startFromInput(); });
  await playQuiz(2);   // 50%: no fireworks from the score either (a perfect score has them anyway, see the celebrate test)
  check(!(await vis('step-result')) && !(await vis('next-step-btn')) && (await text('change-words-btn')) === 'החלפת מילים' && !(await fireworks()), 'a quiz from the random tab shows the usual summary (no topic fireworks)');
  await page.evaluate(() => showStart());
  await page.click('#tab-category');
  await page.waitForSelector('#cat-list .cat-learn');

  // every learning screen fits common phones without page scrolling
  for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
    await page.setViewport({ width: w, height: h });
    const over = () => page.evaluate(() => Math.max(document.documentElement.scrollHeight - innerHeight, document.documentElement.scrollWidth - innerWidth));
    await page.evaluate(() => showStart());
    await page.waitForSelector('#cat-list .cat-learn');
    const pathO = await over();
    const rowFits = await page.$eval('#cat-list .cat-row', r => r.scrollWidth <= r.clientWidth);
    await page.click(`${row(0)} .cat-learn`);
    const cardO = await over();
    await finishCards();
    const doneO = await over();
    await page.click('#learn-quiz-btn');
    const quizO = await over();
    await playQuiz(2);   // a summary with missed words
    const sumO = await over();
    await page.evaluate(() => restartGame());
    await playQuiz(0);   // a summary with the bonus badge, "passed" and "next topic"
    const sum2O = await over();
    await fireworks();
    check(rowFits && Math.max(pathO, cardO, doneO, quizO, sumO, sum2O) <= 0, `${w}x${h}: the path (a row with both buttons), the card, the well-done screen, the quiz and both summaries fit without page scrolling (${pathO}/${cardO}/${doneO}/${quizO}/${sumO}/${sum2O}px)`);
  }
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

// The 🛒 shop: the total points buy a character (shown next to the title) and a background. Buying takes two taps,
// bought items stay bought and switching between them is free.
async function testShop() {
  console.log('\n[shop] spending the points on a character and a background');
  const page = await openPage();
  const vis = id => page.$eval('#' + id, e => getComputedStyle(e).display !== 'none');
  const text = id => page.$eval('#' + id, e => e.textContent);
  const item = (box, id) => `#${box} .shop-item[data-id="${id}"]`;
  const cls = (box, id) => page.$eval(item(box, id), e => e.className);
  const total = () => page.evaluate(() => +localStorage.getItem('englishquiz-total-points') || 0);

  check(await vis('shop-btn'), 'the main screen has a shop button');
  await page.click('#shop-btn');
  check(await vis('shop-screen') && !(await vis('start-screen')), 'it opens the shop');
  check((await page.$$('#shop-avatars .shop-item')).length >= 10 && (await page.$$('#shop-themes .shop-item')).length >= 5, 'the shop has characters and backgrounds');
  check((await text('shop-balance')).includes('0') && (await cls('shop-avatars', 'dog')).includes('poor'), 'with 0 points everything costs more than you have');
  await page.click(item('shop-avatars', 'dog'));
  check((await text('shop-msg')).includes('חסרות') && (await total()) === 0, 'tapping an item you cannot afford says how many points are missing and buys nothing');
  check((await cls('shop-themes', 'purple')).includes('active'), 'the purple background is free and in use');

  // 55 points
  await page.evaluate(() => { localStorage.setItem('englishquiz-total-points', '55'); });
  await page.reload();
  check(await vis('shop-screen') && !(await vis('start-screen')), 'after a reload the app reopens in the shop, where it was');
  check((await text('shop-balance')).includes('55'), 'the shop shows the points (55)');
  await page.evaluate(() => { window.__sounds = 0; playUnlockSound = () => window.__sounds++; });
  await page.click(item('shop-avatars', 'dog'));
  check((await cls('shop-avatars', 'dog')).includes('confirm') && (await total()) === 55, 'the first tap asks "buy?" and buys nothing yet');
  await page.click(item('shop-avatars', 'dog'));
  check((await total()) === 45 && (await cls('shop-avatars', 'dog')).includes('active') && (await text('shop-balance')).includes('45'), 'the second tap buys the dog: 45 points left, and the dog is in use');
  check((await page.evaluate(() => window.__sounds)) === 1 && (await text('shop-msg')).includes('קניתם'), 'buying plays the happy sound and says so');
  check((await text('menu-avatar')) === '🐶', 'the dog shows next to the title on the main screen');
  await page.click(item('shop-themes', 'ocean'));
  await page.click(item('shop-themes', 'ocean'));
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
  check((await total()) === 20 && bg.includes('0, 82, 212'), `buying the sea background changes the page background (${bg.slice(0, 60)}...)`);
  await page.click(item('shop-avatars', 'cat'));
  await page.click(item('shop-avatars', 'cat'));
  await page.click(item('shop-avatars', 'dog'));
  check((await total()) === 0 && (await text('menu-avatar')) === '🐶', 'switching back to a character you own is free');
  await page.click(item('shop-avatars', 'dog'));
  check((await text('menu-avatar')) === '', 'tapping the character in use takes it off');
  await page.click(item('shop-themes', 'purple'));
  check((await page.evaluate(() => getComputedStyle(document.body).backgroundImage)).includes('74, 0, 224'), 'back to the purple background, for free');
  await page.click(item('shop-themes', 'ocean'));
  await page.click(item('shop-avatars', 'cat'));

  // saved on the device
  await page.reload();
  check((await text('menu-avatar')) === '🐱' && (await page.evaluate(() => getComputedStyle(document.body).backgroundImage)).includes('0, 82, 212'), 'after a reload the cat and the sea background are still there');
  // the character in the game: it asks the question and hops on a right answer
  await page.evaluate(() => { showStart(); document.getElementById('words-input').value = 'cat\tחתול\ndog\tכלב\nsun\tשמש\nmoon\tירח'; renderWords(); startFromInput(); });
  check(await vis('game-screen') && (await text('game-avatar')) === '🐱' && (await page.$eval('.instruction-text', e => e.textContent)).startsWith('🐱'), 'the cat shows in the game, before the question');
  await page.evaluate(() => [...document.querySelectorAll('#answers-container button')].find(b => b.innerText === wordsData[currentIndex].correct).click());
  check(await page.$eval('#game-avatar', e => e.classList.contains('hop')), 'and hops on a right answer');
  for (const [w, h] of [[320, 568], [360, 640]]) {
    await page.setViewport({ width: w, height: h });
    const o = await page.evaluate(() => Math.max(document.documentElement.scrollHeight - innerHeight, document.documentElement.scrollWidth - innerWidth));
    check(o <= 0, `${w}x${h}: the game with the character fits without page scrolling (${o}px)`);
  }
  await page.setViewport({ width: 360, height: 800 });
  await page.evaluate(() => { clearTimeout(nextQuestionTimer); showStart(); });
  await page.click('#shop-btn');
  check((await cls('shop-avatars', 'dog')).includes('owned') && (await cls('shop-themes', 'ocean')).includes('active'), 'and the bought items are still yours');
  await page.click('#shop-back');
  check(await vis('start-screen') && !(await vis('shop-screen')), 'the back button returns to the main screen');

  // fits common phones without page scrolling
  for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
    await page.setViewport({ width: w, height: h });
    const over = () => page.evaluate(() => Math.max(document.documentElement.scrollHeight - innerHeight, document.documentElement.scrollWidth - innerWidth));
    await page.evaluate(() => showStart());
    const mainO = await over();
    await page.click('#shop-btn');
    const shopO = await over();
    check(Math.max(mainO, shopO) <= 0, `${w}x${h}: the main screen and the shop fit without page scrolling (${mainO}/${shopO}px)`);
  }

  // 🏅 all the points ever earned: buying never takes from it
  const earned = () => page.evaluate(() => [earnedTotal, +localStorage.getItem('englishquiz-earned-points'), document.getElementById('shop-earned').textContent]);
  await page.evaluate(() => { localStorage.removeItem('englishquiz-earned-points'); localStorage.setItem('englishquiz-total-points', '7'); });
  await page.reload();
  const spent = await page.evaluate(() => [...SHOP_AVATARS, ...SHOP_THEMES].filter(it => shop.owned.includes(it.id)).reduce((s, it) => s + it.price, 0));
  let e = await earned();
  check(spent > 0 && e[0] === 7 + spent && e[1] === e[0] && e[2].includes(String(e[0])), `an older device starts it at its points + what its shop items cost (7 + ${spent} = ${e[0]}), shown in the shop: "${e[2]}"`);
  const start0 = e[0];
  await page.evaluate(() => { pendingCoins = 12; savePending(); collectCoins(); renderShop(); });
  e = await earned();
  check(e[0] === start0 + 12 && e[1] === e[0] && e[2].includes(String(e[0])), `the points of a quiz add to it (+12 = ${e[0]})`);
  await page.evaluate(() => { Math.random = () => 0.6; shop.boxes = 1; openBox(); });
  e = await earned();
  check(e[0] === start0 + 62 && e[1] === e[0], `surprise-box coins add to it too (+50 = ${e[0]})`);
  const lion = await page.evaluate(() => SHOP_AVATARS.find(a => !shop.owned.includes(a.id) && a.price <= grandTotal)?.id);
  await page.click(item('shop-avatars', lion)); await page.click(item('shop-avatars', lion));
  e = await earned();
  check((await page.evaluate(id => shop.owned.includes(id), lion)) && e[0] === start0 + 62 && e[1] === e[0] && e[2].includes(String(e[0])), `buying (${lion}) takes from the points but not from it (still ${e[0]})`);
  await page.reload();
  check((await earned())[0] === start0 + 62, 'it is kept after a reload');
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

// 🎁 Mystery boxes: reaching the last streak emoji (a streak of 300) earns a box and the
// streak starts again from 0. The box is opened in the shop: a trophy or a medal for the collection.
async function testBox() {
  console.log('\n[box] a mystery box at the last emoji, then the streak starts over');
  const page = await openPage();
  const vis = id => page.$eval('#' + id, e => getComputedStyle(e).display !== 'none');
  const text = id => page.$eval('#' + id, e => e.textContent);
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('englishquiz-shop')) || {});
  const start = () => page.evaluate(() => { document.getElementById('words-input').value = 'cat\tחתול\ndog\tכלב\nsun\tשמש\nmoon\tירח\nbook\tספר\nmilk\tחלב'; renderWords(); startFromInput(); });
  const answer = right => page.evaluate(right => {
    const c = wordsData[currentIndex].correct, bs = [...document.querySelectorAll('#answers-container button')];
    if (!right) bs.find(b => b.innerText !== c).click();
    bs.find(b => b.innerText === c).click();
    clearTimeout(nextQuestionTimer); nextQuestionTimer = null; currentIndex++; if (currentIndex < wordsData.length) loadQuestion();
  }, right);

  await page.click('#shop-btn');
  check((await text('box-count')).includes('אין') && await page.$eval('#box-open', e => e.disabled) && (await text('box-hint')).includes('כשאוספים את כל הפרצופים'), 'the shop has a mystery box section: no box yet, and it says how to get one');
  check(!(await page.$('#shop-awards')) && (await text('shop-wands')) === '🪄 × 0' && (await text('menu-wands')) === '', 'instead of the prizes the shop shows the magic wands (0); the main screen shows none while there are none');
  await page.evaluate(() => { shop.wands = 3; saveShop(); renderShop(); applyShop(); });
  check((await text('shop-wands')) === '🪄 × 3' && (await text('menu-wands')) === '🪄 3', 'with 3 wands: 🪄 × 3 in the shop, 🪄 3 on the main screen next to the points');
  await page.evaluate(() => { shop.wands = 0; saveShop(); renderShop(); applyShop(); });
  const faces = () => page.$$eval('#shop-faces .face', fs => fs.map(f => (f.classList.contains('current') ? '*' : '') + f.textContent));
  check((await faces()).length === 30 && (await faces()).every(f => f === '❓'), 'the faces: 30 hidden ❓ before the first one is reached');
  await page.evaluate(() => { streak = 25; updateStreakEmoji(); renderShop(); });
  let fc = await faces();
  check(fc.slice(0, 5).join('') === '🙂😊😄😆*😎' && fc.slice(5).every(f => f === '❓') && (await text('faces-count')) === '(5/30)', `a streak of 25: the first 5 faces, the 5th marked as the current one, the rest hidden (${fc.slice(0, 6).join(' ')})`);
  await page.evaluate(() => { streak = 300; updateStreakEmoji(); renderShop(); });
  fc = await faces();
  check(fc.filter(f => f !== '❓').length === 30 && fc[29] === '*👑', 'at the last emoji all 30 faces show');
  await page.evaluate(() => { streak = 0; updateStreakEmoji(); renderShop(); });
  await page.evaluate(() => showStart());

  await page.evaluate(() => { localStorage.setItem('englishQuizStreak', '298'); });
  await page.reload();
  await page.evaluate(() => { window.unlockSounds = 0; playUnlockSound = () => window.unlockSounds++; });
  await start();
  check((await text('streak-next')) === '🎁 עוד 2', `before the last emoji the game counts down to it and the box (${await text('streak-next')})`);
  await answer(false);   // 297
  await answer(true);    // 298
  await answer(true);    // 299
  check(((await saved()).boxes || 0) === 0 && (await text('streak-next')) === '🎁 עוד 1', '299: no box yet (a mistake took 1 off)');
  await answer(true);    // 300
  check((await saved()).boxes === 1 && await vis('box-toast') && (await text('box-toast')).includes('קופסת הפתעה') && (await page.evaluate(() => window.unlockSounds)) === 1, 'reaching the last emoji (300) earns a box right away: a note in the game and the happy sound');
  check((await page.evaluate(() => streak)) === 0 && (await page.evaluate(() => localStorage.getItem('englishQuizStreak'))) === '0' && (await text('streak-next')) === 'עוד 5', 'and the streak starts again from 0 (5 more to the first face)');
  check((await page.$eval('#streak-emoji', e => e.classList.contains('on') && e.textContent)) === '👑' && (await text('menu-streak')) === '', 'the last face (👑) shows with the box; the menu faces start over');
  await answer(true);    // 1
  check(!(await page.$eval('#streak-emoji', e => e.classList.contains('on'))) && (await page.evaluate(() => streak)) === 1 && ((await saved()).boxes) === 1, 'on the next answer the big emoji goes away (streak 1, still 1 box)');
  await page.evaluate(() => showStart());
  check((await page.$eval('#shop-btn', e => e.dataset.boxes)) === '1', 'the shop button shows a red 1');
  await page.click('#shop-btn');
  check((await page.$$('#shop-faces .face.missing')).length === 30, 'after the box the faces start over too (all hidden again)');
  await page.evaluate(() => showStart());

  // opening: half the boxes hold a magic wand, the rest 50 or 100 coins
  await page.click('#shop-btn');
  check((await text('box-count')).includes('1') && !(await page.$eval('#box-open', e => e.disabled)), 'the shop: 1 box to open');
  await page.evaluate(() => { Math.random = () => 0; });
  await page.click('#box-open');
  await new Promise(r => setTimeout(r, 900));
  check((await saved()).boxes === 0 && (await saved()).wands === 1 && !Object.keys((await saved()).awards || {}).length, 'opening the box can give a magic wand (saved; no medal)');
  check((await text('box-pic')) === '🪄' && (await text('shop-msg')).includes('שרביט קסמים') && (await page.evaluate(() => window.unlockSounds)) === 2, 'the box shows the wand, with the happy sound');
  check((await text('shop-wands')) === '🪄 × 1' && (await text('menu-wands')) === '🪄 1', 'the wand counts go up (🪄 1)');
  check(await page.$eval('#box-open', e => e.disabled) && (await page.$eval('#shop-btn', e => e.dataset.boxes)) === undefined, 'no boxes left: the button is off and the red count is gone');
  await page.evaluate(() => { shop.boxes = 1; saveShop(); renderShop(); });
  await page.click('#box-open');
  await new Promise(r => setTimeout(r, 900));
  check((await saved()).wands === 2 && (await text('shop-msg')).includes('2'), 'another wand: now 2');
  await page.reload();
  check(await vis('shop-screen') && (await page.evaluate(() => shop.wands)) === 2, 'after a reload the app reopens in the shop and the wands are kept');
  for (const [r, coins] of [[0.6, 50], [0.95, 100]]) {
    const before = await page.evaluate(r => { Math.random = () => r; shop.boxes = 1; saveShop(); renderShop(); return { total: grandTotal, wands: shop.wands }; }, r);
    await page.click('#box-open');
    await new Promise(res => setTimeout(res, 900));
    const after = await page.evaluate(() => ({ total: grandTotal, saved: +localStorage.getItem(TOTAL_KEY), wands: shop.wands, boxes: shop.boxes }));
    check(after.total === before.total + coins && after.saved === after.total && after.wands === before.wands && after.boxes === 0, `a box can give ${coins} coins instead (saved: ${after.total})`);
    check((await text('box-pic')) === '💰' && (await text('shop-msg')).includes(`${coins} נקודות`) && (await text('shop-balance')).includes(String(after.total)), `it shows 💰 "${coins} נקודות" and the new balance`);
  }
  const odds = await page.evaluate(() => { const out = { wand: 0, 50: 0, 100: 0 }; const real = Math.random;
    for (let k = 0; k < 600; k++) { const r = k / 600; Math.random = () => r; shop.boxes = 1; const t = grandTotal, w = shop.wands; openBox();
      if (grandTotal - t === 50) out[50]++; else if (grandTotal - t === 100) out[100]++; else if (shop.wands === w + 1) out.wand++; }
    Math.random = real; return out; });
  check(odds.wand === 300 && odds[50] === 200 && odds[100] === 100, `half the boxes give a wand, a third 50 coins, a sixth 100 coins (${JSON.stringify(odds)})`);

  for (const [w, h] of [[320, 568], [390, 844]]) {
    await page.setViewport({ width: w, height: h });
    const o = await page.evaluate(() => Math.max(document.documentElement.scrollHeight - innerHeight, document.documentElement.scrollWidth - innerWidth));
    check(o <= 0, `${w}x${h}: the shop with the box and the collection fits without page scrolling (${o}px)`);
  }
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

// The phone's back button (it fires popstate like history.back() does). The page keeps one extra history entry (the
// "trap", history.state.eq === 1) only while it is needed: off the start screen or with a pop-up open. It is added
// when the user taps into another screen (Chrome's back button skips entries added before any tap), and removed
// back on the start screen, so there back leaves the app at the first press. History must never pile up.
async function testPhoneBack() {
  console.log('\n[phoneback] the phone back button');
  const page = await openPage();
  const cdp = await page.createCDPSession();
  const hist = async () => { const h = await cdp.send('Page.getNavigationHistory'); return { index: h.currentIndex, length: h.entries.length, eq: await page.evaluate(() => history.state && history.state.eq) }; };
  const vis = id => page.$eval('#' + id, e => getComputedStyle(e).display !== 'none');
  const settle = () => new Promise(r => setTimeout(r, 150));
  const back = async () => { await page.evaluate(() => history.back()); await settle(); };
  const dialog = () => page.$('[data-dialog]');
  const clickText = t => page.evaluate(t => [...document.querySelectorAll('button')].find(b => b.innerText.trim() === t).click(), t);

  const base = await hist();
  check(base.eq === 0 && base.index === base.length - 1, `start screen: no trap, so back leaves the app (${JSON.stringify(base)})`);

  // a quiz: back asks before leaving; back again cancels that question; leaving goes to the start screen
  await page.evaluate(() => { document.getElementById('words-input').value = 'apple\tתפוח\ndog\tכלב\ncat\tחתול\nsun\tשמש'; renderWords(); });
  await page.click('#start-btn'); await settle();
  check((await hist()).eq === 1, 'tapping into a quiz sets the trap');
  await back();
  check(await vis('game-screen') && !!(await dialog()) && (await hist()).eq === 1, 'back in a quiz asks before leaving, and the trap is set again');
  await back();
  check(await vis('game-screen') && !(await dialog()) && (await hist()).eq === 1, 'back again closes the question and stays in the quiz');
  await back();
  await clickText('חזרה לתפריט'); await settle();
  let h = await hist();
  check(await vis('start-screen') && h.eq === 0 && h.index === base.index, `confirming goes to the start screen and the trap is removed (${JSON.stringify(h)})`);

  // the shop, many times: back to the start screen, history does not pile up
  for (let i = 0; i < 3; i++) { await page.click('#shop-btn'); await settle(); await back(); }
  h = await hist();
  check(await vis('start-screen') && !(await vis('shop-screen')) && h.eq === 0 && h.index === base.index && h.length <= base.length + 1, `shop -> back -> start screen, 3 times, no history piling up (${JSON.stringify(h)})`);
  // the in-app back button of the shop removes the trap too
  await page.click('#shop-btn'); await settle(); await page.click('#shop-back'); await settle();
  h = await hist();
  check(h.eq === 0 && h.index === base.index, 'the shop\'s own back button removes the trap');

  // a pop-up on the start screen: back closes it and stays
  await page.evaluate(() => { clearWords(); }); await settle();
  check(!!(await dialog()) && (await hist()).eq === 1, 'a pop-up on the start screen sets the trap');
  await back();
  h = await hist();
  check(!(await dialog()) && await vis('start-screen') && h.eq === 0 && h.index === base.index && (await page.$$eval('#words-table tbody tr', r => r.length)) === 4, 'back closes it (nothing cleared), the trap is gone');

  // the summary and the learning screens go back to the start screen
  await page.click('#start-btn'); await settle();
  for (let k = 0; k < 4; k++) { await page.evaluate(() => { const c = wordsData[currentIndex].correct; [...document.querySelectorAll('#answers-container button')].find(b => b.innerText === c).click(); }); await new Promise(r => setTimeout(r, 650)); }
  check(await vis('summary-screen') && (await hist()).eq === 1, 'the summary keeps the trap');
  await back();
  check(await vis('start-screen') && (await hist()).eq === 0, 'back from the summary goes to the start screen');
  await page.evaluate(() => startLearning(1, 0)); await new Promise(r => setTimeout(r, 500));
  check(await vis('learn-screen') && (await hist()).eq === 1, 'the learning cards set the trap');
  await back();
  check(await vis('start-screen') && (await hist()).eq === 0, 'back from the learning cards goes to the start screen');

  // reopened on another screen (the app remembers where it was): the trap is set there too
  await page.click('#shop-btn'); await settle();
  await page.reload({ waitUntil: 'load' }); await settle();
  check(await vis('shop-screen') && (await hist()).eq === 1, 'reopened in the shop: the trap is set');
  await back();
  check(await vis('start-screen') && (await hist()).eq === 0, 'and back goes to the start screen');
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

// 🐶 Tapping the character on the main screen: its own move, emojis and English phrase, then a word of the chosen
// level in a speech bubble (read aloud, tap the bubble to hear it again). 5 taps in a row make it dizzy. Not the shop.
async function testAvatar() {
  console.log('\n[avatar] tapping the character: one of its own 4 funny GIFs; the 5th tap in a row: dizzy, then a headache');
  const page = await openPage();
  const text = sel => page.$eval(sel, e => e.textContent);
  // record what is read aloud instead of speaking (each text "takes" 300 ms, then reports its end like a real voice)
  await page.evaluate(() => { window.spoken = []; speechSynthesis.speak = u => { window.spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 300); }; speechSynthesis.cancel = () => {}; });
  const turnOver = () => page.waitForFunction(() => !document.getElementById('menu-avatar').disabled, { timeout: 15000 });
  const spoken = () => page.evaluate(() => { const s = window.spoken.slice(); window.spoken.length = 0; return s; });
  const setAvatar = id => page.evaluate(id => { if (!shop.owned.includes(id)) shop.owned.push(id); shop.avatar = id; saveShop(); applyShop(); }, id);
  const gif = () => page.evaluate(() => { const p = document.getElementById('gif-pop'); return p && { scene: p.dataset.scene, say: p.querySelector('.gp-say').textContent, he: p.querySelector('.gp-he').textContent,
    stage: [...p.querySelectorAll('.gp-stage .gp-e')].map(e => e.textContent), imgs: p.querySelectorAll('.gp-stage img').length, moving: p.getAnimations({ subtree: true }).length,
    fits: (r => r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight)(p.querySelector('.gp-card').getBoundingClientRect()) }; });

  check(await page.evaluate(() => SHOP_AVATARS.every(a => AVATAR_FX[a.id] && AVATAR_MOVES[AVATAR_FX[a.id].move] && AVATAR_FX[a.id].fx.length && AVATAR_FX[a.id].say)), 'every character in the shop has its own move, emojis and phrase');
  const bad = await page.evaluate(() => SHOP_AVATARS.filter(a => { const g = AVATAR_GIFS[a.id]; return !g || g.length !== 4 || new Set(g).size !== 4 || !g.every(n => GIF_SCENES[n] && n !== 'headache'); }).map(a => a.id));
  check(bad.length === 0, `every character has its own 4 different GIFs${bad.length ? ' (missing: ' + bad.join(', ') + ')' : ''}`);
  // every scene draws and moves, for an emoji character and for the drawn capybara
  const scenes = await page.evaluate(() => { const out = []; for (const id of ['dog', 'capybara']) for (const n of Object.keys(GIF_SCENES)) {
    openGif(SHOP_AVATARS.find(a => a.id === id), n, 'hi', 60000); const p = document.getElementById('gif-pop');
    if (p.querySelectorAll('.gp-stage .gp-e').length < 2 || (n !== 'headache' && ![...p.querySelectorAll('.gp-stage .gp-e')].some(e => AVATAR_FX[id].fx.includes(e.textContent))) || !p.getAnimations({ subtree: true }).length || (id === 'capybara' && !p.querySelector('.gp-stage img'))) out.push(id + ':' + n); closeGif(); } return out; });
  check(scenes.length === 0, `all ${await page.evaluate(() => Object.keys(GIF_SCENES).length)} cartoons draw and move, each with the character's own things (emoji and drawn characters)${scenes.length ? ': ' + scenes.join(', ') : ''}`);

  await setAvatar('dog');
  await page.click('#menu-avatar');
  await page.waitForSelector('#gif-pop', { timeout: 5000 });
  let g = await gif();
  const dogGifs = await page.evaluate(() => AVATAR_GIFS.dog);
  const sceneSay = await page.evaluate(n => GIF_SCENES[n].say, g.scene);
  const sceneHe = await page.evaluate(n => GIF_SCENES[n].he, g.scene);
  check(dogGifs.includes(g.scene) && g.say.includes('Woof woof! ' + sceneSay) && g.he === 'הב הב! ' + sceneHe && g.stage.includes('🐶') && g.stage.some(t => ['🦴', '🐾'].includes(t)) && g.moving > 0,
        `tapping the dog opens one of its GIFs (${g.scene}): the dog with its bones / paws, moving, its own "Woof woof!" and the cartoon's own line (${sceneSay}) and a Hebrew line (${g.he})`);
  check(g.fits && await page.$eval('#gif-pop .gp-badge', e => e.textContent === 'GIF'), 'the GIF pop-up is fully on the screen');
  check(!(await page.$eval('#avatar-bubble', e => e.classList.contains('on'))) && !(await page.evaluate(() => typeof avatarWord !== 'undefined')), 'no word to learn any more');
  check(await page.$eval('#menu-avatar', e => e.disabled), 'while the GIF is open the character\'s button is off');
  await new Promise(r => setTimeout(r, 300));
  check(JSON.stringify(await spoken()) === JSON.stringify(['Woof woof!', sceneSay]), `it says "Woof woof!" and "${sceneSay}" aloud`);
  await page.waitForFunction(() => !document.getElementById('gif-pop'), { timeout: 8000 });
  await turnOver();
  check(true, 'the GIF closes by itself after a few seconds, and the button is on again');
  // the next taps: its other GIFs, in turn; a tap on the pop-up closes it at once
  const seen = [g.scene];
  for (let k = 0; k < 3; k++) {
    await new Promise(r => setTimeout(r, 200));
    await page.click('#menu-avatar');
    await page.waitForSelector('#gif-pop', { timeout: 5000 });
    const gk = await gif(); seen.push(gk.scene); seen.says = [...(seen.says || [g.say]), gk.say];
    await page.click('#gif-pop');
    check(!(await page.$('#gif-pop')), `tap ${k + 2}: a tap on the GIF closes it`);
    await turnOver();
  }
  check(new Set(seen).size === 4 && seen.every(n => dogGifs.includes(n)), `4 taps show the dog's 4 different GIFs (${seen.join(', ')})`);
  check(new Set(seen.says).size === 4, `each GIF says something different (${seen.says.join(' / ')})`);
  check(await page.evaluate(() => { const s = Object.values(GIF_SCENES).map(x => x.say); return s.every(Boolean) && new Set(s).size === s.length; }), 'every cartoon has its own English line');
  check(await page.evaluate(() => SHOP_AVATARS.every(a => AVATAR_SAY_HE[a.id]) && Object.values(GIF_SCENES).every(x => x.he)), 'every character phrase and every cartoon line has its Hebrew too');

  // the 5th tap in a row (slow taps too): dizzy, then the headache GIF
  await spoken();
  await page.click('#menu-avatar');
  await page.waitForFunction(() => document.getElementById('avatar-bubble').classList.contains('on'), { timeout: 5000 });
  check((await text('#avatar-bubble .ab-say')).includes('dizzy') && !(await page.$('#gif-pop')), 'the 5th tap in a row: first the character spins, dizzy');
  await page.waitForSelector('#gif-pop', { timeout: 5000 });
  g = await gif();
  check(g.scene === 'headache' && g.stage.includes('🧊') && g.say.includes('headache') && g.he.includes('כואב לי הראש'), 'then a headache: an ice pack on its head, "Ouch, now I have a headache!" / "אוי, כואב לי הראש!"');
  await page.click('#gif-pop');
  await turnOver();
  const sp = await spoken();
  check(sp.includes("Whoa, I'm dizzy!") && sp.includes('Ouch, now I have a headache!'), 'it says both aloud');
  await page.click('#menu-avatar');
  await page.waitForSelector('#gif-pop', { timeout: 5000 });
  check((await gif()).scene !== 'headache', 'after the headache the count starts over (the next tap is a GIF again)');
  await page.click('#gif-pop'); await turnOver();
  // a pause of more than 6 seconds starts the count over
  await page.evaluate(() => { avatarTaps = 4; avatarLastTap = Date.now() - 6500; });
  await page.click('#menu-avatar');
  await page.waitForSelector('#gif-pop', { timeout: 5000 });
  check((await gif()).scene !== 'headache', 'after a 6-second pause, the next tap is not the 5th in a row');
  await page.click('#gif-pop'); await turnOver();

  // the capybara (a drawn character) has its GIFs too
  await setAvatar('capybara');
  await page.click('#menu-avatar');
  await page.waitForSelector('#gif-pop', { timeout: 5000 });
  g = await gif();
  check(g.imgs > 0 && (await page.evaluate(() => AVATAR_GIFS.capybara)).includes(g.scene) && g.say.includes("I'm so chill! " + await page.evaluate(n => GIF_SCENES[n].say, g.scene)), `the drawn capybara stars in its own GIF (${g.scene})`);
  await page.setViewport({ width: 320, height: 568 });
  check((await gif()).fits, '320x568: the GIF fits on a small phone');
  await page.click('#gif-pop'); await turnOver();

  // no character chosen: no badge to tap
  await page.evaluate(() => { shop.avatar = null; applyShop(); });
  check(!(await page.$eval('#menu-avatar', e => e.getBoundingClientRect().width > 0)), 'without a character there is nothing to tap');
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

async function testKeep() {
  console.log('\n[keep] progress survives app updates');
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  page.pageErrors = [];
  page.on('pageerror', e => page.pageErrors.push(e.message));
  // count the requests for "persistent storage" (Chrome answers on its own; the mock says no, so it asks every load)
  await page.evaluateOnNewDocument(() => { window.persistAsked = 0; if (navigator.storage) { navigator.storage.persisted = async () => false; navigator.storage.persist = async () => { window.persistAsked++; return true; }; } });
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => navigator.serviceWorker.controller, { timeout: 10000 }).catch(() => page.reload({ waitUntil: 'load' }));
  check((await page.evaluate(() => window.persistAsked)) === 1, 'the app asks the browser to keep its data (never cleared when space runs low)');
  // some progress: points, a character, a passed topic, a streak
  const keys = ['englishquiz-total-points', 'englishquiz-shop', 'englishquiz-learn-progress', 'englishQuizStreak'];
  await page.evaluate(() => { grandTotal = 321; localStorage.setItem(TOTAL_KEY, '321'); shop.owned.push('dog'); shop.avatar = 'dog'; saveShop();
    localStorage.setItem(LEARN_KEY, JSON.stringify({ 1: [0, 2] })); localStorage.setItem(STREAK_KEY, localStorage.getItem(STREAK_KEY) || '0'); });
  const before = await page.evaluate(k => k.map(x => localStorage.getItem(x)), keys);
  // an app update = a new service worker: the old file cache is thrown away and the files are loaded again
  await page.evaluate(async () => { for (const k of await caches.keys()) await caches.delete(k); for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); });
  await page.reload({ waitUntil: 'load' });
  await page.reload({ waitUntil: 'load' });
  const after = await page.evaluate(k => k.map(x => localStorage.getItem(x)), keys);
  check(JSON.stringify(after) === JSON.stringify(before) && before.every(v => v !== null), 'after an update (all files reloaded) the points, shop, learning path and streak are all still there');
  check((await page.$eval('#grand-total', e => e.textContent)).includes('321') && (await page.$eval('#menu-avatar', e => e.textContent)) === '🐶', 'and the app shows them (321 points, the dog)');
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await ctx.close();
}

async function testPictures() {
  console.log('\n[pictures] picture backgrounds and the capybara');
  const page = await openPage();
  const info = await page.evaluate(() => ({
    pics: SHOP_THEMES.filter(t => t.scene).map(t => t.id),
    uniqueThemePrices: new Set(SHOP_THEMES.map(t => t.price)).size === SHOP_THEMES.length,
    uniqueAvatarPrices: new Set(SHOP_AVATARS.map(a => a.price)).size === SHOP_AVATARS.length,
    avatars: SHOP_AVATARS.length,
  }));
  check(info.pics.length >= 12 && info.pics.includes('unicorn') && info.pics.includes('capyspa'), `${info.pics.length} picture backgrounds, with a unicorn one and a capybara one`);
  check(info.avatars >= 60 && info.uniqueThemePrices && info.uniqueAvatarPrices, `${info.avatars} characters; every item still has its own price`);
  // every picture background is drawn and used (a picture, not just colors); the card becomes see-through
  const bad = [];
  for (const id of info.pics) {
    await page.evaluate(id => { if (!shop.owned.includes(id)) shop.owned.push(id); shop.theme = id; saveShop(); applyShop(); }, id);
    const ok = await page.waitForFunction(() => getComputedStyle(document.body).getPropertyValue('--bg').includes('blob:'), { timeout: 5000 }).then(() => true, () => false);
    if (!ok) bad.push(id);
  }
  check(!bad.length, `every picture background is drawn as a picture${bad.length ? ' (not: ' + bad.join(', ') + ')' : ''}`);
  check(await page.evaluate(() => document.body.classList.contains('pic-theme') && getComputedStyle(document.querySelector('.game-container')).backgroundColor.startsWith('rgba')), 'with a picture background the card is see-through');
  // the picture follows the screen size: a new picture after a big resize
  const before = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--bg'));
  await page.setViewport({ width: 800, height: 600 });
  const resized = await page.waitForFunction(b => getComputedStyle(document.body).getPropertyValue('--bg') !== b, { timeout: 5000 }, before).then(() => true, () => false);
  await page.setViewport({ width: 360, height: 800 });
  check(resized, 'turning the screen draws the picture again for the new size');
  // back to a plain background: no picture, the card is white again
  await page.evaluate(() => { shop.theme = 'purple'; saveShop(); applyShop(); });
  check(await page.evaluate(() => !document.body.classList.contains('pic-theme') && !getComputedStyle(document.body).getPropertyValue('--bg').includes('blob:')), 'a color background has no picture and a white card');
  // the capybara: a drawing (no emoji exists) everywhere a character shows
  await page.evaluate(() => { shop.owned.push('capybara'); shop.avatar = 'capybara'; saveShop(); applyShop(); openShop(); });
  const capy = await page.evaluate(() => ({
    menu: !!document.querySelector('#menu-avatar img.pic-img'), game: !!document.querySelector('#game-avatar img.pic-img'),
    shop: !!document.querySelector('#shop-avatars [data-id="capybara"] img.pic-img'), swatch: !!document.querySelector('#shop-themes [data-id="capyspa"] img.pic-img'),
    loaded: [...document.querySelectorAll('img.pic-img')].every(i => i.complete && i.naturalWidth > 0),
  }));
  check(capy.menu && capy.game && capy.shop && capy.swatch && capy.loaded, `the capybara drawing shows on the main screen, in the quiz, in the shop and on its background's swatch (${JSON.stringify(capy)})`);
  await page.evaluate(() => { showStart(); speechSynthesis.speak = u => setTimeout(() => u.onend && u.onend(), 50); });
  await page.click('#menu-avatar');
  await page.waitForSelector('#gif-pop', { timeout: 10000 });
  check((await page.$eval('#gif-pop', e => e.querySelector('.gp-say').textContent === "I'm so chill! " + GIF_SCENES[e.dataset.scene].say)) && !!(await page.$('#gif-pop .gp-stage img.pic-img')), "tapping the capybara: its drawing in a GIF, with its own phrase and that cartoon's line");
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

async function testWand() {
  console.log('\n[wand] a magic wand shows the right answer in a quiz (the end-of-quiz box gives none)');
  const page = await openPage();
  await page.evaluate(() => {
    speechSynthesis.speak = u => setTimeout(() => u.onend && u.onend(), 50); speechSynthesis.cancel = () => {}; window.coinSound = () => {};
    document.getElementById('words-input').value = Array.from({ length: 6 }, (_, i) => `word${i + 1}\tמילה${i + 1}`).join('\n');
    renderWords();
  });
  const wands = () => page.evaluate(() => [shop.wands || 0, (JSON.parse(localStorage.getItem(SHOP_KEY)) || {}).wands || 0].join());
  const finishQuiz = () => page.evaluate(() => {
    showStart(); startFromInput();
    while (currentIndex < wordsData.length) { const c = wordsData[currentIndex].correct; [...document.querySelectorAll('#answers-container button')].find(b => b.innerText === c).click(); clearTimeout(nextQuestionTimer); nextQuestionTimer = null; currentIndex++; loadQuestion(); }
  });
  const shown = sel => page.$eval(sel, e => getComputedStyle(e).display !== 'none');

  await page.evaluate(() => { showStart(); startFromInput(); });
  check(await shown('#wand-btn') && await page.$eval('#wand-btn', e => e.disabled) && (await page.$eval('#wand-count', e => e.textContent)) === '0', 'without a wand the wand button shows 0 and is disabled');
  await finishQuiz();
  await page.click('#coin-box');
  await new Promise(r => setTimeout(r, 1500));
  check((await wands()) === '0,0' && !(await page.$eval('#box-toast', e => e.classList.contains('on') && e.textContent.includes('שרביט'))), 'the box at the end of a quiz gives no magic wand');
  await page.evaluate(() => { shop.wands = 1; saveShop(); showWands(); });
  check((await page.$eval('#menu-wands', e => e.textContent)) === '🪄 1' && (await page.$eval('#shop-wands', e => e.textContent)) === '🪄 × 1', 'with a wand (from the shop box) the main screen and the shop count it (🪄 1)');

  // using it
  await page.evaluate(() => { showStart(); startFromInput(); });
  const before = await page.evaluate(() => ({ score: totalScore, streak }));
  check(await shown('#wand-btn') && (await page.$eval('#wand-count', e => e.textContent)) === '1' && !(await page.$eval('#wand-btn', e => e.disabled)), 'in the quiz the wand button shows how many wands there are (1)');
  await page.click('#wand-btn');
  const st = await page.evaluate(() => { const c = wordsData[currentIndex].correct, bs = [...document.querySelectorAll('#answers-container .btn-answer')];
    return { magic: bs.filter(b => b.classList.contains('magic')).map(b => b.innerText), c, othersOff: bs.filter(b => b.innerText !== c).every(b => b.disabled && b.classList.contains('faded')) }; });
  check(st.magic.length === 1 && st.magic[0] === st.c && st.othersOff, 'tapping the wand makes the right answer glow; the other answers fade and cannot be tapped');
  check((await wands()) === '0,0' && await page.$eval('#wand-btn', e => e.disabled), 'the wand is used up (saved), once per question');
  check((await page.$eval('#menu-wands', e => e.textContent)) === '' && (await page.$eval('#shop-wands', e => e.textContent)) === '🪄 × 0', 'the counts go down too (none left: nothing on the main screen, 0 in the shop)');
  // reopening the app in the middle of that question: still shown, the wand is not given back
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => getComputedStyle(document.getElementById('game-screen')).display !== 'none', { timeout: 10000 });
  check((await page.$$eval('#answers-container .magic', b => b.length)) === 1 && (await wands()) === '0,0', 'after reopening the app the right answer still glows (the wand is not given back)');
  await page.evaluate(() => { speechSynthesis.speak = u => setTimeout(() => u.onend && u.onend(), 50); window.coinSound = () => {}; });
  await page.evaluate(() => [...document.querySelectorAll('#answers-container .btn-answer')].find(b => b.classList.contains('magic')).click());
  const after = await page.evaluate(() => ({ score: totalScore, streak, missed: missed.length }));
  check(after.score === before.score && after.streak === before.streak && after.missed === 1, 'the word answered with the wand gives no point, takes none, keeps the streak and goes to the practice list');
  await page.evaluate(() => { clearTimeout(nextQuestionTimer); nextQuestionTimer = null; currentIndex++; loadQuestion(); });
  check(await shown('#wand-btn') && await page.$eval('#wand-btn', e => e.disabled) && (await page.$eval('#wand-count', e => e.textContent)) === '0', 'with no wands left the button stays disabled (0) on the next question');

  // end-of-quiz boxes never add a wand, opened or not
  await finishQuiz(); await page.evaluate(() => showStart());   // left closed
  await finishQuiz(); await page.click('#coin-box');
  await finishQuiz(); await page.evaluate(() => restartGame());
  check((await wands()) === '0,0', `end-of-quiz boxes add no wands, opened or not (${await wands()})`);
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

async function testCelebrate() {
  console.log('\n[celebrate] the end of a test: a celebration as big as the score');
  const page = await openPage();
  await page.evaluate(() => {
    window.spoken = []; speechSynthesis.speak = u => { window.spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 300); }; speechSynthesis.cancel = () => {};
    window.coins = 0; window.coinSound = () => window.coins++;
    if (!shop.owned.includes('dog')) shop.owned.push('dog'); shop.avatar = 'dog'; saveShop(); applyShop();
    document.getElementById('words-input').value = Array.from({ length: 10 }, (_, i) => `word${i + 1}\tמילה${i + 1}`).join('\n');
    renderWords();
  });
  const canvas = id => page.evaluate(id => !!document.getElementById(id), id);
  const clearFx = () => page.evaluate(() => { document.querySelectorAll('#fireworks, #confetti').forEach(c => c.remove()); document.getElementById('avatar-fx').innerHTML = ''; window.spoken.length = 0; window.coins = 0; });
  const score = () => page.$eval('#summary-final-score', e => e.innerText);
  // plays a whole quiz of the 10 words; the first `wrong` questions get a wrong answer first
  const play = wrong => page.evaluate(wrong => {
    showStart(); startFromInput();
    for (let k = 0; currentIndex < wordsData.length; k++) {
      const c = wordsData[currentIndex].correct, bs = [...document.querySelectorAll('#answers-container button')];
      if (k < wrong) bs.find(b => b.innerText !== c).click();
      bs.find(b => b.innerText === c).click();
      clearTimeout(nextQuestionTimer); nextQuestionTimer = null; currentIndex++; loadQuestion();
    }
    return { points: totalScore, total: grandTotal };
  }, wrong);
  const sayOn = () => page.waitForFunction(() => document.getElementById('summary-say').classList.contains('on'), { timeout: 5000 }).then(() => page.$eval('#summary-say', e => e.textContent), () => '');

  // no mistakes: fireworks, the dog cheers "You're a champion!", the points count up
  await clearFx();
  let r = await play(0);
  const final = `נקודות בבוחן: ${r.points} · סה״כ: ${r.total + r.points}`;
  const shown = sel => page.$eval(sel, e => getComputedStyle(e).display !== 'none');
  const money = () => page.evaluate(() => [grandTotal, pendingCoins, +localStorage.getItem(TOTAL_KEY), +localStorage.getItem(PENDING_KEY)].join());
  check(r.points > 0 && await shown('#coin-box') && await shown('#summary-final-score') && (await score()) === `נקודות בבוחן: ${r.points} · סה״כ: ${r.total}`,
        `after the quiz a surprise box 🎁 waits on the result screen, under the quiz's points and the total from before (${await score()})`);
  check((await money()) === [r.total, r.points, r.total, r.points].join(), 'its points are saved as waiting, not in the total yet');
  check(await canvas('fireworks') && !(await canvas('confetti')), '100%: fireworks');
  check(await page.$eval('#summary-emoji', e => e.getAnimations().length > 0), 'the trophy pops in');
  check((await page.$eval('#summary-avatar', e => e.textContent)) === '🐶' && await page.$eval('#summary-avatar', e => e.getAnimations().length > 0), 'the dog jumps onto the result screen');
  check((await sayOn()).includes("You're a champion!"), 'the dog says "You\'re a champion!"');
  check(!(await page.evaluate(() => window.spoken)).includes("You're a champion!"), 'written only: it is not said aloud');
  check((await page.$$eval('#avatar-fx span', s => s.map(x => x.textContent))).some(t => ['🦴', '🐾'].includes(t)), 'its bones and paw prints burst out');
  check(await page.$eval('#summary-say', b => { const r = b.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0; }), 'its bubble is on the screen');
  // open the box
  await page.evaluate(() => { document.getElementById('avatar-fx').innerHTML = ''; window.coins = 0; });
  await page.click('#coin-box');
  check((await money()) === [r.total + r.points, 0, r.total + r.points, 0].join(), 'tapping the box collects its points into the total at once (saved)');
  await page.click('#coin-box').catch(() => {});   // a second tap while it opens: nothing more
  await page.waitForFunction(() => document.querySelector('#coin-box .cb-pic').textContent === '💰', { timeout: 3000 }).catch(() => {});
  check((await page.$$eval('#avatar-fx span', s => s.map(x => x.textContent))).includes('💰'), 'it shakes, pops open into 💰 and coins burst out');
  const ticks = [];
  for (let k = 0; k < 150 && ticks[ticks.length - 1] !== r.total + r.points; k++) {
    const t = await page.evaluate(() => { const e = document.querySelector('#summary-final-score .total-up'); return e ? { n: +e.textContent, pop: e.getAnimations().length > 0 } : null; });
    if (t && ticks[ticks.length - 1] !== t.n) { ticks.push(t.n); if (t.pop) ticks.pops = (ticks.pops || 0) + 1; }
    await new Promise(res => setTimeout(res, 40));
  }
  check(ticks.length >= Math.min(r.points, 25) - 3 && ticks.every((n, i) => !i || n > ticks[i - 1]) && ticks[ticks.length - 1] === r.total + r.points && ticks.pops >= 3,
        `the total counts up step by step to its new value, popping as it goes (${ticks[0]} … ${ticks[ticks.length - 1]}, ${ticks.length} steps)`);
  await page.waitForFunction(t => getComputedStyle(document.getElementById('coin-box')).display === 'none' && document.getElementById('summary-final-score').innerText === t, { timeout: 8000 }, final).catch(() => {});
  check(!(await shown('#coin-box')) && (await score()) === final && (await page.evaluate(() => window.coins)) === 1, `then the points tick up into the total, with one short ka-ching (${await score()}; sounds: ${await page.evaluate(() => window.coins)})`);
  check((await money()) === [r.total + r.points, 0, r.total + r.points, 0].join(), 'a second tap did not add them twice');

  // tapping the character: a funny gag (English + Hebrew in the bubble, said aloud), one at a time, never the same twice in a row
  await page.waitForFunction(() => !summaryBusy, { timeout: 8000 });
  const gags = await page.evaluate(() => SUMMARY_GAGS.map(g => g.say));
  await page.evaluate(() => { window.spoken.length = 0; document.getElementById('avatar-fx').innerHTML = ''; });
  await page.click('#summary-avatar');
  const g1 = await page.$eval('#summary-say .ss-en', e => e.textContent.replace('🐶 ', ''));
  check(gags.includes(g1) && (await page.$eval('#summary-say', e => e.classList.contains('on') && e.querySelector('.ss-he').textContent.length > 0)), `tapping the dog does a funny gag, in English and Hebrew ("${g1}")`);
  check(await page.$eval('#summary-avatar', e => e.getAnimations().length > 0) && (await page.$$('#avatar-fx span')).length > 0, 'it moves and emojis burst out');
  await page.click('#summary-avatar');
  check((await page.$eval('#summary-say .ss-en', e => e.textContent.replace('🐶 ', ''))) === g1, 'a tap during the gag does nothing');
  await page.waitForFunction(() => !summaryBusy, { timeout: 8000 });
  check((await page.evaluate(() => window.spoken)).length === 1 && (await page.evaluate(() => window.spoken[0])).length > 0, 'the gag is said aloud once');
  await page.click('#summary-avatar');
  const g2 = await page.$eval('#summary-say .ss-en', e => e.textContent.replace('🐶 ', ''));
  check(gags.includes(g2) && g2 !== g1, `the next tap is a different gag ("${g2}")`);
  await page.waitForFunction(() => !summaryBusy, { timeout: 8000 });
  await page.waitForFunction(() => !document.getElementById('summary-say').classList.contains('on'), { timeout: 5000 }).catch(() => {});
  check(!(await page.$eval('#summary-say', e => e.classList.contains('on'))), 'the bubble closes a few seconds after the gag');

  // after a reload the result screen comes back with the final numbers and no new party
  await page.reload({ waitUntil: 'load' });
  await page.evaluate(() => { window.coins = 0; window.coinSound = () => window.coins++; });
  await new Promise(res => setTimeout(res, 800));
  check((await score()) === final && !(await canvas('fireworks')) && (await page.evaluate(() => window.coins)) === 0, 'reopening on the result screen shows the final numbers, without celebrating again');
  await page.evaluate(() => { window.spoken = []; speechSynthesis.speak = u => { window.spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 300); }; speechSynthesis.cancel = () => {}; window.coinSound = () => window.coins++; });
  await page.click('#summary-avatar');
  check(await page.$eval('#summary-say', e => e.classList.contains('on')), 'after reopening, the character still does its gags');
  await page.waitForFunction(() => !summaryBusy, { timeout: 8000 });

  // 2 of 10 wrong (80%): confetti and "Great job!"
  await clearFx();
  r = await play(2);
  check(await canvas('confetti') && !(await canvas('fireworks')), '80%: confetti (no fireworks)');
  check((await sayOn()).includes('Great job!') && !(await page.evaluate(() => window.spoken)).includes('Great job!'), 'the dog shows "Great job!" (not said aloud)');

  // 5 of 10 wrong (50%): a small cheer and "Nice try! Keep going!"
  await clearFx();
  r = await play(5);
  check(!(await canvas('confetti')) && !(await canvas('fireworks')) && (await page.$$eval('#avatar-fx span', s => s.map(x => x.textContent))).includes('👏'), '50%: a small cheer of 👏💪⭐, no fireworks or confetti');
  check((await sayOn()).includes('Nice try! Keep going!') && !(await page.evaluate(() => window.spoken)).includes('Nice try! Keep going!'), 'the dog shows "Nice try! Keep going!" (not said aloud)');

  // the box is never lost: reopening the app on the result screen keeps it closed and waiting
  check(await shown('#coin-box') && (await money()) === [r.total, r.points, r.total, r.points].join(), 'a box not opened yet keeps its points waiting');
  await page.reload({ waitUntil: 'load' });
  await page.evaluate(() => { window.coinSound = () => {}; });
  await new Promise(res => setTimeout(res, 500));
  check(await shown('#coin-box') && !(await page.$eval('#coin-box', e => e.disabled)) && (await money()) === [r.total, r.points, r.total, r.points].join(), 'after reopening the app the box is still there, closed');
  await page.click('#coin-box');
  check((await money()) === [r.total + r.points, 0, r.total + r.points, 0].join(), 'and opening it then collects the points');
  await page.evaluate(() => { window.spoken = []; speechSynthesis.speak = u => { window.spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 300); }; speechSynthesis.cancel = () => {}; });
  // leaving the result screen without opening it: the points are added anyway
  r = await play(0);
  await page.evaluate(() => showStart());
  check((await money()) === [r.total + r.points, 0, r.total + r.points, 0].join() && (await page.$eval('#grand-total', e => e.textContent)).includes(String(r.total + r.points)), 'leaving without opening the box still adds its points');
  r = await play(0);
  await page.evaluate(() => restartGame());
  check((await money()) === [r.total + r.points, 0, r.total + r.points, 0].join(), 'so does "try again"');
  // closing the app on the result screen and opening it somewhere else: collected on start
  r = await play(0);
  await page.evaluate(() => saveSession('start'));
  await page.reload({ waitUntil: 'load' });
  await new Promise(res => setTimeout(res, 300));
  check((await money()) === [r.total + r.points, 0, r.total + r.points, 0].join(), 'reopening the app on another screen collects a closed box too');
  await page.evaluate(() => { window.spoken = []; speechSynthesis.speak = u => { window.spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 300); }; speechSynthesis.cancel = () => {}; window.coinSound = () => window.coins++; });

  // leaving in the middle of the count stops it (the numbers are final when you come back)
  await clearFx();
  r = await play(0);
  await page.click('#coin-box');
  await new Promise(res => setTimeout(res, 1500));
  await page.evaluate(() => showStart());
  await new Promise(res => setTimeout(res, 900));
  check((await score()) === `נקודות בבוחן: ${r.points} · סה״כ: ${r.total + r.points}` && (await money()) === [r.total + r.points, 0, r.total + r.points, 0].join(), 'leaving during the count stops it at the final numbers');

  // a quiz with 0 points: no box, just the numbers
  r = await play(10);
  check(r.points === 0 && !(await shown('#coin-box')) && await shown('#summary-final-score'), 'a quiz with 0 points shows no box');

  // without a character: the party, but no character
  await page.evaluate(() => { shop.avatar = null; saveShop(); applyShop(); });
  await clearFx();
  await play(0);
  check(await canvas('fireworks') && (await page.$eval('#summary-avatar', e => e.textContent)) === '' && !(await sayOn()), 'without a character: fireworks, no character and nothing said');
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

async function testFire() {
  console.log('\n[fire] 🔥 days in a row: every day a quiz is finished adds one; from 10 days all the points are doubled');
  const page = await openPage();
  await page.evaluate(() => {
    speechSynthesis.speak = u => setTimeout(() => u.onend && u.onend(), 50); speechSynthesis.cancel = () => {}; window.coinSound = () => {};
    document.getElementById('words-input').value = Array.from({ length: 6 }, (_, i) => `word${i + 1}\tמילה${i + 1}`).join('\n');
    renderWords();
  });
  // the day the app thinks it is: shift the clock by whole days
  const setDay = n => page.evaluate(n => { const R = window.__RealDate || (window.__RealDate = Date), off = n * 864e5;
    window.Date = class extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() + off); } static now() { return R.now() + off; } }; }, n);
  const finishQuiz = () => page.evaluate(() => {
    showStart(); startFromInput();
    while (currentIndex < wordsData.length) { const c = wordsData[currentIndex].correct; [...document.querySelectorAll('#answers-container button')].find(b => b.innerText === c).click(); clearTimeout(nextQuestionTimer); nextQuestionTimer = null; currentIndex++; loadQuestion(); }
    return { points: totalScore, badges: [...document.querySelectorAll('#bonus-container .fire-badge')].map(b => b.innerText) };
  });
  const fire = () => page.evaluate(() => { showStart(); return document.getElementById('menu-fire').textContent; });
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('englishquiz-daily-streak')));

  check((await fire()) === '🔥 1' && (await page.evaluate(() => { openShop(); const t = document.getElementById('shop-fire').textContent; showStart(); return t; })) === '🔥 × 1', 'before playing the first day already shows 🔥 1 (main screen and shop)');
  let r = await finishQuiz();
  check(r.points === 6 && r.badges.length === 1 && r.badges[0].includes('יום ראשון') && (await fire()) === '🔥 1', `the first quiz of the day: 🔥 1 (${r.badges.join(' | ')})`);
  r = await finishQuiz();
  check(r.badges.length === 0 && (await fire()) === '🔥 1' && (await saved()).days === 1, 'another quiz the same day adds nothing');
  for (let d = 1; d <= 8; d++) { await setDay(d); r = await finishQuiz(); }
  const shopRow = () => page.evaluate(() => { openShop(); const o = { n: document.getElementById('shop-fire').textContent, info: document.getElementById('fire-info').textContent }; showStart(); return o; });
  let sr = await shopRow();
  check(sr.n === '🔥 × 9' && sr.info.includes('עוד 1 '), `the shop has a 🔥 row like the wands: 🔥 × 9, one more day to double points (${sr.info})`);
  check((await fire()) === '🔥 9' && r.points === 6, `9 days in a row: 🔥 9, points not doubled yet (${r.points})`);
  await setDay(9); r = await finishQuiz();
  check((await fire()) === '🔥 10 ×2' && r.points === 12 && r.badges.some(b => b.includes('כפולות')), `the 10th day: 🔥 10 ×2 and the quiz's points are doubled (6 → ${r.points}; ${r.badges.join(' | ')})`);
  await page.evaluate(() => openCoinBox()); await new Promise(res => setTimeout(res, 300));
  sr = await shopRow();
  check(sr.n === '🔥 × 10' && sr.info.includes('כפולות') && sr.info.includes('200'), `from 10 days the shop row says the points are doubled and the box may hold 200 (${sr.info})`);
  // the shop's surprise box: its coins are doubled too
  await page.evaluate(() => { shop.boxes = 1; saveShop(); Math.random = () => 0.6; });
  const t0 = await page.evaluate(() => grandTotal);
  await page.evaluate(() => openBox());
  check((await page.evaluate(() => grandTotal)) - t0 === 50, 'the shop box coins are not doubled (50)');
  const odds = await page.evaluate(() => { const out = { wand: 0, 50: 0, 100: 0, 200: 0 };
    for (let k = 0; k < 600; k++) { const r = k / 600; Math.random = () => r; shop.boxes = 1; const t = grandTotal, w = shop.wands || 0; openBox();
      if ((shop.wands || 0) > w) out.wand++; else out[grandTotal - t]++; }
    return out; });
  check(odds.wand === 300 && Math.abs(odds[50] - 150) <= 1 && Math.abs(odds[100] - 100) <= 1 && Math.abs(odds[200] - 50) <= 1, `🔥 in a streak the shop box may give 200 too: half a wand, then 50 / 100 / 200 (${JSON.stringify(odds)})`);
  // a missed day: back to 0 on the main screen, and the next quiz starts again from 1, points no longer doubled
  await setDay(11);
  check((await fire()) === '🔥 1', 'a day missed: back to 🔥 1');
  r = await finishQuiz();
  check((await fire()) === '🔥 1' && r.points === 6, `playing again starts from 🔥 1, no double points (${r.points})`);
  await page.reload({ waitUntil: 'load' });
  check((await saved()).days === 1, 'the days in a row are saved on the device');
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

const TESTS = { fire: testFire, wordbank: testWordbank, random: testRandom, layout: testLayout, back: testBack, tabs: testTabs, streak: testStreak, pairs: () => eachFixture('pairs', testPairs), list: () => eachFixture('list', testList), translation: testTranslationRetry, practice: testPractice, chooser: testChooser, header: testHeader, persist: testPersist, learn: testLearn, shop: testShop, box: testBox, phoneback: testPhoneBack, avatar: testAvatar, celebrate: testCelebrate, keep: testKeep, wand: testWand, pictures: testPictures };
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
