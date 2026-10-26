/* Sprawdza żywy podgląd: ładuje URL w Chromium, zbiera błędy konsoli i naruszenia CSP, robi zrzut 390x844 po kilku sekundach lotu. Użycie: node sprawdz_live.cjs [url] [plik-zrzutu] */
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async () => {
  const url = process.argv[2] || 'https://zbudujmi.com/crumbi/?sterowanie=1', out = process.argv[3] || 'live.png';
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const err = [];
  p.on('pageerror', e => err.push('pageerror: ' + e)); p.on('console', m => { if (['error', 'warning'].includes(m.type())) err.push(m.type() + ': ' + m.text()); });
  p.on('requestfailed', r => err.push('requestfailed: ' + r.url()));
  await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(4000);
  await p.mouse.move(195, 600); await p.mouse.down(); await p.waitForTimeout(2500);
  await p.screenshot({ path: out }); await p.mouse.up();
  const info = await p.evaluate(() => ({ canvas: !!document.getElementById('g'), tekstyJs: typeof window.TEKSTY !== 'undefined' || typeof window.KRAINY_TEKSTY !== 'undefined' || 'nieznana nazwa globalu' }));
  console.log(JSON.stringify(info), err.length ? 'BŁĘDY/OSTRZEŻENIA:\n' + err.join('\n') : 'bez błędów i ostrzeżeń');
  await b.close();
})();
