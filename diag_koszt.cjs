/* diagnostyka Z10: koszt rysowania przy bramie bez zależności od obciążenia maszyny: wywołania drawImage i powierzchnia (px CSS) na klatkę (node diag_koszt.cjs [brama]) */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const N = +process.argv[2] || 1;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await c.addInitScript(() => { const P = CanvasRenderingContext2D.prototype, d0 = P.drawImage; window.__rys = { n: 0, pole: 0 };
    P.drawImage = function () { if (this.canvas && this.canvas.id === 'g') { const a = arguments; window.__rys.n++; if (a.length >= 5) { const x = a[a.length - 4], y = a[a.length - 3], w = a[a.length - 2], h = a[a.length - 1], H = 390 * innerHeight / Math.min(innerWidth, Math.round(innerHeight * 0.66));
        const cw = Math.max(0, Math.min(390, x + w) - Math.max(0, x)), ch = Math.max(0, Math.min(H, y + h) - Math.max(0, y)); window.__rys.pole += cw * ch; } else window.__rys.pole += (a[0].width || 0) * (a[0].height || 0); }   /* powierzchnia w kadrze (px w jednostkach 390) */ return d0.apply(this, arguments); }; });
  const pg = await c.newPage();
  await pg.goto('file:///' + path.join(__dirname, 'index.html').split(String.fromCharCode(92)).join('/') + '?test&seed=23'); await pg.waitForTimeout(800);
  const pomiar = async (prep, arg) => { await pg.evaluate(prep, arg); await pg.waitForTimeout(300); const a = await pg.evaluate(() => ({ r: Object.assign({}, window.__rys), f: __okruszek.stan().klatki })); await pg.waitForTimeout(2000); const b = await pg.evaluate(() => ({ r: Object.assign({}, window.__rys), f: __okruszek.stan().klatki })); const fr = b.f - a.f; return { wywolan: +((b.r.n - a.r.n) / fr).toFixed(1), pole: Math.round((b.r.pole - a.r.pole) / fr) }; };
  const out = [];
  for (const z of [8, 5, 3.4, 2.1, 1.3]) {
    const baza = await pomiar((n) => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.ziarno(1); o.brama(n); o.ustawPoziom(2); o.symuluj(8); o.tempo(0.02); o.pauza(false); }, N);
    const zb = await pomiar(([n, z]) => { const o = __okruszek; o.pauza(true); o.tempo(1); o.bezPrzeszkod(true); o.bezPradow(true); o.ziarno(1); o.brama(n); o.ustawPoziom(2); o.symuluj(8); const sp = (0.32 + 1.9 * o.stan().s) / (10 + 22 * o.stan().s); o.doBramy((z - 0.7) / sp); o.symuluj(0.05); o.tempo(0.02); o.pauza(false); }, [N, z]);
    out.push({ z, baza, zb, k: await pg.evaluate(() => __okruszek.droga().kurtyna) });
  }
  out.forEach(o => console.log('z=' + o.z + ' (otwarcie ' + (o.k ? o.k.open.toFixed(2) : '-') + '): bez bramy ' + JSON.stringify(o.baza) + ' | z bramą ' + JSON.stringify(o.zb) + ' | +' + Math.round((o.zb.pole / o.baza.pole - 1) * 100) + '% pola, +' + Math.round((o.zb.wywolan / o.baza.wywolan - 1) * 100) + '% wywołań'));
  await browser.close();
})();
