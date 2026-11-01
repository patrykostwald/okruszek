/* Okruszek Z3c: pomiar chroma (jak w teście Z3b "etapy koloru") dla L0..L4 na zachodzie. Użycie: node diag_chroma.cjs [plik.html] */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23' + (process.env.PASMO ? '&pasmo=1' : '')); await page.waitForTimeout(600);
  const ev = (f, a) => page.evaluate(f, a);
  const metr = () => ev(() => { const bgb = __okruszek.tlo(), bgc = Math.max(...bgb) - Math.min(...bgb), c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
    const d = x.getImageData(0, 0, t.width, t.height).data, sc = c.width / 390, bw = 90 * sc, bcx = c.width / 2, bcy = 0.76 * c.height; let ex = 0, tot = 0, col = 0;
    for (let y = 0; y < t.height; y += 2) for (let xx = 0; xx < t.width; xx += 2) { if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bw) continue; if (y < 90 * sc) continue; const i = (y * t.width + xx) * 4, ch = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]); tot++; ex += Math.max(0, ch - bgc); if (ch > bgc + 10) col++; }
    return { ex: ex / tot, kol: col / tot, bgc }; });
  const out = [], REP = +process.env.REP || 1;
  for (let rep = 0; rep < REP; rep++) for (let n = 3; n <= 4; n++) { await ev((q) => { const o = __okruszek; o.odblokuj(); o.odblokujPore(); o.nurkuj(false); o.bezPradow(true); o.bezPrzeszkod(true); o.nowyBieg(); o.noc(false); o.ustawPore('zachod'); o.ustawPoziom(q); }, n); await sleep(+process.env.SL || 900); const m = await metr(); out.push(m.ex.toFixed(1) + '/' + m.kol.toFixed(3)); }
  console.log(path.basename(file) + ' L0..L4 ex/kol: ' + out.join('  '));
  await browser.close();
})();
