/* Okruszek Z3c: szybka diagnostyka botów w symulacji bez rysowania (autopilot + symuluj). Użycie: node diag_z3c.cjs [sekundy] [seed] [pasmo]
   Wypisuje dla każdego bota: czas do pierwszego pełnego koloru, liczbę rozkwitów, czas w E >= 0,98, serie (n, idealnych, najdłuższy łańcuch). */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const boty = require('./boty_z10.cjs');
const file = path.resolve(path.join(__dirname, 'index.html'));
const sek = +process.argv[2] || 60, seed = +process.argv[3] || 23, pasmo = process.argv[4] === 'pasmo';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=' + seed + (pasmo ? '&pasmo=1' : '')); await page.waitForTimeout(500);
  for (const nm of ['idealny', 'idealny121', 'siedemdziesiat', 'losowy']) {
    const r = await page.evaluate(([src, sek, ziarno]) => {
      const o = __okruszek; o.odblokuj(); o.noc(false); o.bezPrzeszkod(true); o.bezPradow(false); o.nurkuj(false); o.nowyBieg();
      o.autopilot(eval(src), ziarno);
      let tFull = -1, steps = 0, t = 0;
      while (t < sek) { const q = o.symuluj(0.25, 1 / 60); t = q.graCzas; if (tFull < 0 && o.energia() >= 0.98) tFull = t; if (q.tryb !== 'gra') break; }
      const f = o.pelnyKolor(), se = o.serie(), st = o.stan();
      o.autopilot(null);
      return { graCzas: t, tFull, rozkwity: o.rozkwit().razy, pelny: f, serie: se.map(x => x.n + ':' + x.ideal + '/' + x.maxChain).join(' '), poziomMax: st.poziomMax, wloty: st.wloty };
    }, [boty[nm], sek, 11]);
    console.log(nm.padEnd(16) + JSON.stringify(r));
  }
  console.log('błędy: ' + (errs.length ? errs.join('|') : 'brak'));
  await browser.close();
})();
