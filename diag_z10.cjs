/* Okruszek Z3c: skrócona wersja testu botów Z10 (bramy), do porównania wariantów gry. Użycie: node diag_z10.cjs plik.html [bot] [krainy 2,3,4] [ziaren]
   Wypisuje, ile biegów z bramy n dociera do bramy n+1 (bot z boty_z10.cjs), jak w gra_test_z10.cjs. */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const BOTY = require('./boty_z10.cjs');
const file = path.resolve(process.argv[2]);
const bot = process.argv[3] || 'siedemdziesiat', kr = (process.argv[4] || '2,3,4').split(',').map(Number), NZ = +process.argv[5] || 10;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23'); await page.waitForTimeout(500);
  const out = [];
  for (const n of kr) {
    let okN = 0; const why = [];
    for (let z = 1; z <= NZ; z++) {
      const r = await page.evaluate(([src, n, z, ovr]) => {
        const o = __okruszek; if (ovr) Object.keys(ovr).forEach(k => o.stala(k, ovr[k])); o.pauza(true); o.odblokuj(); o.nurkuj(false); o.przesun(null); o.bezPradow(false); o.bezPrzeszkod(false); o.odblokujPore(); o.cichaPomoc(false); o.pomiar(false); o.ziarno(z);
        o.brama(n); o.autopilot(eval(src), z * 7919 + n);
        let r, ok = false; for (let i = 0; i < 60; i++) { r = o.symuluj(10); if (r.bramy.some(b => b.brama === n + 1)) { ok = true; break; } if (r.tryb === 'koniec' || r.graCzas > 500) break; }
        o.autopilot(null); return { ok, t: r.graCzas, koniec: r.koniec, wloty: r.wloty, hiper: r.hiperRazy };
      }, [BOTY[bot], n, z, process.env.OVR ? JSON.parse(process.env.OVR) : null]);
      if (r.ok) okN++; else why.push(r.koniec + '@' + r.t.toFixed(0) + '/w' + r.wloty);
    }
    out.push('K' + n + ' ' + okN + '/' + NZ + (why.length ? ' (' + why.slice(0, 5).join(' ') + ')' : ''));
  }
  console.log(path.basename(file) + ' ' + bot + ': ' + out.join(' | '));
  await browser.close();
})();
