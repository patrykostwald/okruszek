const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(__dirname, '..', 'index.html');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto(require('url').pathToFileURL(file).href + '?test&seed=23&pasmo=1'); await page.waitForTimeout(1500);
  for (const noc of [false, true]) {
    await page.evaluate((n) => { const o = __okruszek; o.odblokuj(); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.nowyBieg(); o.noc(n); o.ustaw(0); }, noc);
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => { const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
      const d = x.getImageData(0, 0, t.width, t.height).data, bw = 90, bcx = c.width / 2, bcy = 0.76 * c.height; const pts = [];
      for (let y = 0; y < t.height; y += 2) for (let xx = 0; xx < t.width; xx += 2) { if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bw) continue; const i = (y * t.width + xx) * 4, mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); if (mx - mn > 60) pts.push([xx, y, d[i], d[i+1], d[i+2]]); }
      const reg = {}; pts.forEach(p => { const k = Math.floor(p[0] / 40) * 40 + ":" + Math.floor(p[1] / 20) * 20; reg[k] = (reg[k] || 0) + 1; }); return { n: pts.length, reg }; });
    console.log(noc ? 'noc' : 'dzien', JSON.stringify(r));
  }
  await b.close();
})();
