/* diagnostyka Z10 (szybka): node diag_z10.cjs [zapytanie] — ładuje grę, wypisuje błędy konsoli, krainy, stan Drogi i krótki bieg symulacji */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.stack));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  await page.goto('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?test&seed=23' + (process.argv[2] || ''));
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => { const o = __okruszek; return { krainy: o.krainy().map(k => [k.id, k.nazwa, k.od, k.do]), droga: o.droga(), napis: o.napis() }; });
  console.log(JSON.stringify(r, null, 1));
  const sim = await page.evaluate(() => { const o = __okruszek; o.pauza(true); o.nowyBieg(); const out = []; for (let i = 0; i < 6; i++) { const q = o.symuluj(20); out.push([q.graCzas.toFixed(1), q.tryb, q.kraina, Math.round(q.drogaM), q.h.toFixed(2), q.poziom]); if (q.tryb === 'koniec') break; } return { out, nap: o.napiecie().przeszkody, zap: o.zapowiedzi().slice(0, 8), bud: o.budzet() }; });
  console.log(JSON.stringify(sim));
  await page.evaluate(() => __okruszek.pauza(false));
  await page.waitForTimeout(1500);
  console.log('błędy: ' + (errs.length ? errs.join('\n') : 'brak'));
  await browser.close();
})();
