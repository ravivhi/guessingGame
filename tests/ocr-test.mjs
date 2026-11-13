// End-to-end OCR test for englishQuiz: loads the real page in headless Chrome, uploads photos from
// tests/fixtures/ and checks the rows the page produces. Covers both kinds of photos:
//   - "pairs": English words with their Hebrew next to them        (new-words-page29.jpg)
//   - "list":  English-only word list, meanings come from translation (word-list-vocab.jpg)
// The translation service (MyMemory) is stubbed, so the test is fast, repeatable and doesn't hit the real API.
//
// Setup (once):   cd tests && npm install
// Run:            cd tests && npm run ocr              (all fixtures)   |   node ocr-test.mjs pairs|list
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

// Opens the page with the translation service stubbed. mode(n) decides per request: 'ok' | 'fail'.
async function openPage(mode = () => 'ok') {
  const ctx = await browser.createBrowserContext();       // fresh storage per test (the page saves the word list)
  const page = await ctx.newPage();
  const closePage = page.close.bind(page);
  page.close = async () => { await closePage(); await ctx.close(); };
  await page.setViewport({ width: 360, height: 800 });   // small phone
  page.pageErrors = []; page.tr = { total: 0, failed: 0 };
  page.on('pageerror', e => page.pageErrors.push(e.message));
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (!req.url().includes('api.mymemory.translated.net')) return req.continue();
    const n = ++page.tr.total;
    if (mode(n, req.url()) === 'fail') { page.tr.failed++; return req.abort('failed'); }
    req.respond({
      status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ responseData: { translatedText: 'תרגום' }, responseStatus: 200, matches: [] }),
    });
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
  const junk = rows.filter(r => fx.marginJunk.includes(r[1]));
  check(junk.length === 0, `Hebrew from the page margin is not used as a meaning${junk.length ? ' (' + junk.map(r => r[0]).join(', ') + ')' : ''}`);
  const ov = await overflowOf(page);
  check(ov <= 0, `no horizontal overflow at 360px (overflow: ${ov}px)`);
  check(page.pageErrors.length === 0, `no page errors${page.pageErrors.length ? ': ' + page.pageErrors.join('; ') : ''}`);
  await page.close();
}

// Rate limiting / flaky network: retries recover; a service that never answers leaves a blank, not the English word.
async function testTranslationRetry() {
  console.log('\n[retry] translation service failures');
  let page = await openPage(n => (n <= 2 ? 'fail' : 'ok'));
  const t1 = await page.evaluate(() => translateWithRetry('apple'));
  check(t1 === 'תרגום', `recovers after 2 failed requests (got ${JSON.stringify(t1)}, ${page.tr.total} requests)`);
  const again = await page.evaluate(() => translateWithRetry('apple'));
  check(again === 'תרגום' && page.tr.total === 3, `a translated word is cached (no new request; total ${page.tr.total})`);
  await page.close();

  page = await openPage(() => 'fail');
  const t2 = await page.evaluate(() => translateWithRetry('banana'));
  check(t2 === null, `returns null when the service never answers (got ${JSON.stringify(t2)}, ${page.tr.total} requests)`);
  await page.close();
}

try {
  let ran = 0;
  for (const [name, fx] of Object.entries(FIXTURES)) {
    if (only && only !== name && only !== 'retry') continue;
    if (!fs.existsSync(path.resolve(here, 'fixtures', fx.file))) { console.log(`\n[${name}] SKIPPED - tests/fixtures/${fx.file} not found (photos are git-ignored)`); continue; }
    await (name === 'pairs' ? testPairs : testList)(fx); ran++;
  }
  if (!only || only === 'retry') { await testTranslationRetry(); ran++; }
  if (!ran) { console.error('Nothing ran.'); process.exitCode = 2; }
} finally {
  await browser.close();
  server.close();
}

console.log(failures.length ? `\n${failures.length} check(s) FAILED` : '\nAll checks passed');
process.exit(process.exitCode || (failures.length ? 1 : 0));
