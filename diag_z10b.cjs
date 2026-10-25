/* Okruszek Z3c: jeden bieg bota z bramy n (jak diag_z10.cjs) z dziennikiem trafień. Użycie: node diag_z10b.cjs plik.html bot n ziarno */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const BOTY = require('./boty_z10.cjs');
const file = path.resolve(process.argv[2]), bot = process.argv[3], n = +process.argv[4], z = +process.argv[5];
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23'); await page.waitForTimeout(500);
  const r = await page.evaluate(([src, n, z]) => {
    const o = __okruszek; o.pauza(true); o.odblokuj(); o.nurkuj(false); o.przesun(null); o.bezPradow(false); o.bezPrzeszkod(false); o.odblokujPore(); o.cichaPomoc(false); o.pomiar(false); o.ziarno(z);
    o.brama(n); o.autopilot(eval(src), z * 7919 + n);
    const log = []; let lw = 0, t = 0;
    while (t < 150) { const q = o.symuluj(0.1, 1 / 60); t = q.graCzas; const st = o.stan(); if (st.wloty !== lw) { lw = st.wloty; log.push(t.toFixed(1) + ' w' + lw + ' ch=' + st.lancuch + ' s=' + st.s.toFixed(2) + ' h=' + st.h.toFixed(2) + ' id=' + (o.lancuchE ? o.lancuchE().idealnych : '-') + ' br=' + (o.lancuchE ? o.lancuchE().brzegowych : '-')); } if (q.tryb !== 'gra') { log.push('koniec ' + q.tryb + ' ' + t.toFixed(1) + ' h=' + st.h.toFixed(2)); break; } }
    return log;
  }, [BOTY[bot], n, z]);
  console.log(r.join('\n'));
  await browser.close();
})();
