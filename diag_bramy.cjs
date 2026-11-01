/* diagnostyka Z10: boty z bramy n do bramy n+1 (node diag_bramy.cjs [bot] [n_od] [n_do] [ziaren]) */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const BOTY = require('./boty_z10.cjs');
const bot = process.argv[2] || 'siedemdziesiat', n0 = +process.argv[3] || 1, n1 = +process.argv[4] || 5, NZ = +process.argv[5] || 10;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack)));
  await page.goto('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?test&seed=23');
  await page.waitForTimeout(800);
  for (let n = n0; n <= n1; n++) {
    const res = [];
    for (let z = 1; z <= NZ; z++) {
      res.push(await page.evaluate(([src, n, z]) => {
        const o = __okruszek; o.pauza(true); o.odblokuj(); o.nurkuj(false); o.przesun(null); o.bezPradow(false); o.bezPrzeszkod(false); o.odblokujPore(); o.cichaPomoc(false); o.ziarno(z);
        o.brama(n); o.autopilot(eval(src), z * 7919 + n);
        let r, ok = false; for (let i = 0; i < 60; i++) { r = o.symuluj(10); if (r.bramy.some(b => b.brama === n + 1)) { ok = true; break; } if (r.tryb === 'koniec' || r.graCzas > 500) break; }
        o.autopilot(null);
        const zp = o.zapowiedzi(), sk = o.skutki();
        return { z, ok, t: r.graCzas, m: Math.round(r.drogaM), koniec: r.koniec, kraina: r.kraina, maxL: r.poziomMax, hawk: r.jastrzabLog, pred: zp.filter(e => e.klasa === 3).map(e => e.typ + '@' + e.tSzkic.toFixed(0)).join(','), kol: sk.length, s2: sk.filter(e => e.klasa === 2).length };
      }, [BOTY[bot], n, z]));
    }
    const okN = res.filter(r => r.ok).length;
    console.log('brama ' + n + ' -> ' + (n + 1) + ': ' + okN + '/' + NZ + '  ' + res.map(r => (r.ok ? 'OK' : 'x') + '(' + r.t.toFixed(0) + 's,' + r.koniec + ',L' + r.maxL + ',kol' + r.kol + (r.pred ? ',' + r.pred : '') + ')').join(' '));
  }
  if (errs.length) console.log('BŁĘDY: ' + errs.slice(0, 3).join('\n'));
  await browser.close();
})();
