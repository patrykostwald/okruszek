/* diagnostyka Z10: ślad jednego biegu bota (node diag_slad.cjs bot brama ziarno [sekund]) */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const BOTY = require('./boty_z10.cjs');
const [bot, n, z, sek] = [process.argv[2] || 'siedemdziesiat', +process.argv[3] || 3, +process.argv[4] || 9, +process.argv[5] || 30];
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?test&seed=23');
  await page.waitForTimeout(800);
  const out = await page.evaluate(([src, n, z, sek]) => {
    const o = __okruszek; o.pauza(true); o.odblokuj(); o.nurkuj(false); o.przesun(null); o.bezPradow(false); o.bezPrzeszkod(false); o.odblokujPore(); o.cichaPomoc(false); o.ziarno(z);
    o.brama(n); o.autopilot(eval(src), z * 7919 + n);
    const L = []; let r;
    for (let i = 0; i < sek * 4; i++) { r = o.symuluj(0.25); const st = o.stan(); if (i % 2 === 0) L.push(st.graCzas.toFixed(1) + ' h=' + st.h.toFixed(2) + ' s=' + st.s.toFixed(2) + ' bx=' + Math.round(st.bx) + ' wloty=' + st.wloty + ' nurk=' + st.nurkuje + ' prady=' + o.prady().map(p => Math.round(p.x) + '@' + p.z.toFixed(1) + (p.hit ? 'x' : '')).join(',')); if (r.tryb !== 'gra') break; }
    o.autopilot(null);
    return { L, rat: o.ratunek(), r };
  }, [BOTY[bot], n, z, sek]);
  console.log(out.L.join('\n')); console.log('ratunek: ' + JSON.stringify(out.rat)); console.log(JSON.stringify(out.r));
  await browser.close();
})();
