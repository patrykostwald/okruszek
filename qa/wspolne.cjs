/* QA runda 1: wspólne klocki (serwer statyczny, przeglądarka, dotyk CDP, zrzuty). Nie zmienia gry. */
const path = require('path'), fs = require('fs'), http = require('http');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const CHROME = 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const ZRZUTY = path.join(__dirname, 'zrzuty');
fs.mkdirSync(ZRZUTY, { recursive: true });
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.css': 'text/css' };

function serwer(port) {
  return new Promise((res) => {
    const s = http.createServer((q, r) => {
      let u = decodeURIComponent(q.url.split('?')[0]); if (u.endsWith('/')) u += 'index.html';
      const f = path.join(ROOT, u);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end('404'); return; }
      r.writeHead(200, { 'Content-Type': TYPY[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      fs.createReadStream(f).pipe(r);
    });
    s.listen(port, '127.0.0.1', () => res(s));
  });
}
async function przegladarka() {
  return chromium.launch({ headless: true, executablePath: CHROME, args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
}
function dotykCDP(cdp) {
  return async (type, pts) => { try { await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p[1], y: p[2], id: p[0] })) }); } catch (e) { return e; } };
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
function zapiszJson(nazwa, obj) { fs.writeFileSync(path.join(__dirname, nazwa), JSON.stringify(obj, null, 1)); }
module.exports = { chromium, CHROME, ROOT, ZRZUTY, serwer, przegladarka, dotykCDP, sleep, zapiszJson, path, fs };
