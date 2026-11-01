/* Okruszek Z3c: dziennik jednego biegu bota (wlot po wlocie): czas, dx, idealny/brzeg, łańcuch, s, E. Użycie: node diag_z3c3.cjs bot [sekundy] */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const boty = Object.assign({}, require('./boty_z10.cjs'), require('./boty_z3c.cjs'));
const file = path.resolve(path.join(__dirname, 'index.html'));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23'); await page.waitForTimeout(300);
  const r = await page.evaluate(([src, sek]) => {
    const o = __okruszek; o.odblokuj(); o.noc(false); o.bezPrzeszkod(true); o.bezPradow(false); o.nurkuj(false); o.nowyBieg();
    o.autopilot(eval(src), 5);
    const log = []; let t = 0, lastW = 0;
    while (t < sek) {
      const before = o.stan(), pr = o.prady().filter(p => !p.hit).map(p => p.id + ':' + p.z.toFixed(2));
      const q = o.symuluj(1 / 30, 1 / 60); t = q.graCzas; const st = o.stan();
      if (st.wloty !== lastW) { lastW = st.wloty; log.push(t.toFixed(1) + ' wlot#' + st.wloty + ' lancuch=' + st.lancuch + ' s=' + st.s.toFixed(2) + ' h=' + st.h.toFixed(2) + ' E=' + o.energia().toFixed(2) + ' ideal=' + o.lancuchE().idealnych + ' brzeg=' + o.lancuchE().brzegowych + ' bx=' + st.bx.toFixed(0)); }
      if (q.tryb !== 'gra') { log.push('koniec ' + q.tryb + ' ' + t.toFixed(1)); break; }
    }
    return { log, serie: o.serie().map(x => x.id + ':' + x.n + '/' + x.ideal + '/' + x.maxChain + '@' + x.t0.toFixed(0)).join(' ') };
  }, [boty[process.argv[2] || 'idealny'], +process.argv[3] || 60]);
  console.log(r.log.join('\n')); console.log(r.serie);
  await browser.close();
})();
