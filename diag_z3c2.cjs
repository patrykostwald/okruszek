/* Okruszek Z3c: statystyka serii dla botów (wiele ziaren, symulacja bez rysowania). Użycie: node diag_z3c2.cjs [sekundy] [liczba ziaren] [pasmo]
   Dla każdego bota: ile serii (z >= 3 prądami) miało łańcuch >= 3 (trójka z rzędu), łączny i najdłuższy ciągły czas pełnego koloru, rozkwity. */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const b10 = require('./boty_z10.cjs'), b3c = require('./boty_z3c.cjs');
const boty = Object.assign({}, b10, b3c);
const file = path.resolve(path.join(__dirname, 'index.html'));
const sek = +process.argv[2] || 120, N = +process.argv[3] || 6, pasmo = process.argv[4] === 'pasmo';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const names = (process.argv[5] || 'idealny,idealny121,polowa,polowaA,sprawny80,siedemdziesiat').split(',');
  const agg = {}; names.forEach(n => agg[n] = { serii: 0, trojek: 0, pelnyLacznie: 0, pelnyMax: 0, rozkwity: 0, runs: 0, pierwszy: [], poziomMax: 0, czas: 0 });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=' + (23 + i * 7) + (pasmo ? '&pasmo=1' : '')); await page.waitForTimeout(300);
    for (const nm of names) {
      const r = await page.evaluate(([src, sek, ziarno, ovr]) => {
        const o = __okruszek; o.odblokuj(); o.noc(false); o.bezPrzeszkod(true); o.bezPradow(false); o.nurkuj(false); (JSON.parse(ovr || '{}') && Object.keys(JSON.parse(ovr || '{}')).forEach(k => o.stala(k, JSON.parse(ovr)[k]))); o.nowyBieg();
        o.autopilot(eval(src), ziarno);
        let tFull = -1, t = 0;
        while (t < sek) { const q = o.symuluj(0.25, 1 / 60); t = q.graCzas; if (tFull < 0 && o.energia() >= 0.98) tFull = t; if (q.tryb !== 'gra') break; }
        const f = o.pelnyKolor(), se = o.serie(), st = o.stan();
        o.autopilot(null);
        return { t, tFull, rozkwity: o.rozkwit().razy, f, serie: se.filter(x => x.n >= 3), pm: st.poziomMax };
      }, [boty[nm], sek, 101 + i * 13, process.env.OVR]);
      const a = agg[nm]; a.runs++; a.serii += r.serie.length; a.trojek += r.serie.filter(x => x.maxChain >= 3).length; a.pelnyLacznie += r.f.lacznie; a.pelnyMax = Math.max(a.pelnyMax, r.f.maxCiagly); a.rozkwity += r.rozkwity; if (r.tFull >= 0) a.pierwszy.push(+r.tFull.toFixed(1)); a.poziomMax = Math.max(a.poziomMax, r.pm); a.czas += r.t;
      await page.evaluate(() => __okruszek.nowyBieg());
    }
    await page.close();
  }
  for (const nm of names) { const a = agg[nm]; console.log(nm.padEnd(15) + 'serii ' + a.serii + ', trójek ' + a.trojek + ' (' + (100 * a.trojek / Math.max(1, a.serii)).toFixed(0) + '%), pełny kolor łącznie/bieg ' + (a.pelnyLacznie / a.runs).toFixed(1) + ' s, najdłuższy ciągły ' + a.pelnyMax.toFixed(2) + ' s, rozkwitów/bieg ' + (a.rozkwity / a.runs).toFixed(1) + ', pierwszy pełny kolor w ' + JSON.stringify(a.pierwszy) + ', max poziom L' + a.poziomMax + ', czas gry ' + a.czas.toFixed(0)); }
  console.log('czas ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s');
  await browser.close();
})();
