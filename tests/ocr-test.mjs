// End-to-end OCR test for englishQuiz: loads the real page in headless Chrome, uploads a photo
// from tests/fixtures/ and checks the rows the page produces.
//
// Setup (once):   cd tests && npm install
// Run:            cd tests && npm run ocr          (or: node ocr-test.mjs [fixture.jpg])
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
const fixture = path.resolve(here, 'fixtures', process.argv[2] || 'new-words-page29.jpg');

// What the page must produce for fixtures/new-words-page29.jpg (workbook p.29, "New Words").
// Hebrew is taken verbatim from the photo, commas included.
const EXPECTED = {
  sweet: 'מתוק', July: 'יולי', candy: 'ממתק', everyone: 'כולם', then: 'אז', date: 'תאריך',
  flour: 'קמח', outside: 'בחוץ, החוצה', throw: 'לזרוק', do: 'לעשות, פועל עזר בהווה',
  give: 'לתת', ready: 'מוכן',
};

if (!fs.existsSync(fixture)) {
  console.error(`Fixture not found: ${fixture}\nPut the photo in tests/fixtures/ (it is git-ignored).`);
  process.exit(2);
}

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
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failures.push(msg); };

const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 800 });   // small phone
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto(url, { waitUntil: 'load' });

  await (await page.$('#photo-input')).uploadFile(fixture);
  await page.waitForFunction(() => /מוכן|שגיאה/.test(document.getElementById('photo-status').innerText), { timeout: 240000 });
  const status = await page.$eval('#photo-status', e => e.innerText);
  check(/מוכן/.test(status), `OCR finished without error (status: ${status})`);

  const rows = await page.$$eval('#words-table tbody tr', trs => trs.map(tr => [...tr.querySelectorAll('input')].map(i => i.value.trim())));
  const got = Object.fromEntries(rows.map(r => [r[0], r[1]]));

  check(rows.length === Object.keys(EXPECTED).length, `row count is ${Object.keys(EXPECTED).length} (got ${rows.length})`);
  for (const [en, he] of Object.entries(EXPECTED)) check(got[en] === he, `${en} -> ${he}${got[en] === he ? '' : `   (got: ${got[en] ?? 'missing'})`}`);

  const count = await page.$eval('#words-count', e => e.textContent);
  check(count.includes(String(Object.keys(EXPECTED).length)), `count line shows the total (${count})`);

  // The game must use the full meaning (commas included) as the correct answer.
  const parsed = await page.evaluate(() => parseWords(document.getElementById('words-input').value));
  check(!parsed.error && parsed.words.length === Object.keys(EXPECTED).length, `parseWords OK (${parsed.error || parsed.words?.length + ' words'})`);
  for (const w of parsed.words || []) {
    if (EXPECTED[w.word]) check(w.correct === EXPECTED[w.word], `game correct answer for "${w.word}" is the full meaning`);
  }
  const outside = (parsed.words || []).find(w => w.word === 'outside');
  check(outside && !outside.dynamics.includes('החוצה'), 'part of a meaning is not reused as a wrong answer');

  // Layout: nothing may overflow a 360px screen.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 0, `no horizontal overflow at 360px (overflow: ${overflow}px)`);

  await page.click('#start-btn');
  await new Promise(r => setTimeout(r, 500));
  const q = await page.$eval('#question-word', e => e.innerText.trim());
  check(Object.hasOwn(EXPECTED, q), `game starts with a word from the photo ("${q}")`);

  check(pageErrors.length === 0, `no page errors${pageErrors.length ? ': ' + pageErrors.join('; ') : ''}`);
} finally {
  await browser.close();
  server.close();
}

console.log(failures.length ? `\n${failures.length} check(s) FAILED` : '\nAll checks passed');
process.exit(failures.length ? 1 : 0);
