/* Żywy podgląd bez ?test: intro, rejestracja service workera, błędy konsoli (w tym CSP). Użycie: node sprawdz_live2.cjs [url] [prefiks-zrzutów] */
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async () => {
  const url = process.argv[2] || 'https://zbudujmi.com/crumbi/', pre = process.argv[3] || 'live-z5';
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const err = [];
  p.on('pageerror', e => err.push('pageerror: ' + e)); p.on('console', m => { if (['error', 'warning'].includes(m.type())) err.push(m.type() + ': ' + m.text()); }); p.on('requestfailed', r => err.push('requestfailed: ' + r.url()));
  await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(6000);
  await p.screenshot({ path: pre + '-intro.png' });
  const sw = await p.evaluate(async () => { try { const r = await navigator.serviceWorker.getRegistration(); await new Promise(x => setTimeout(x, 1500)); return r ? { zakres: r.scope, aktywny: !!r.active } : 'brak rejestracji'; } catch (e) { return 'błąd: ' + e; } });
  const manifest = await p.evaluate(() => { const l = document.querySelector('link[rel=manifest]'); return l ? l.href : 'brak'; });
  await p.mouse.click(195, 500); await p.waitForTimeout(2500);
  await p.screenshot({ path: pre + '-po-dotyku.png' });
  console.log(JSON.stringify({ sw, manifest }), err.length ? 'BŁĘDY/OSTRZEŻENIA:\n' + err.join('\n') : 'bez błędów i ostrzeżeń');
  await b.close();
})();
