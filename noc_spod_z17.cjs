/* Z17: spód dużej bliskiej chmury nocą (brak 2 z Z15). Zrzuty swobodnego lotu L0 i L2 w nocy (jak zrzuty_z15.cjs) i zbliżenie x3 pokazu chmur toru Z15 (dbg tor15: te same kształty w obu wersjach, do porównania przed / po).
   Użycie: node noc_spod_z17.cjs [plik.html] [przedrostek] -> zrzuty-z17/<przedrostek>noc-L0.png, ...noc-L2.png */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const pre = process.argv[3] || 'spod-';
const OUT = path.join(__dirname, 'zrzuty-z17');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await p.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23'); await p.waitForTimeout(900);
  for (const n of [0, 2]) {
    await p.evaluate((n) => { const o = __okruszek; o.odblokuj(); o.nurkuj(false); o.przesun(null); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.nowyBieg(); o.noc(false); o.tempo(0.02); o.ustawPore('noc'); o.ustawPoziom(n); }, n);
    await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(OUT, pre + 'noc-L' + n + '.png') });
    console.log('  zrzut ' + pre + 'noc-L' + n);
    if (n === 2) { const q = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 }); await q.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23'); await q.waitForTimeout(900);
      await q.evaluate(() => { const o = __okruszek; o.odblokuj(); o.nurkuj(false); o.przesun(null); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.nowyBieg(); o.noc(false); o.tempo(0.02); o.ustawPore('noc'); o.ustawPoziom(2); o.dbg({ tor15: 1 }); });
      await q.waitForTimeout(900); await q.screenshot({ path: path.join(OUT, pre + 'noc-L2-zblizenie.png'), clip: { x: 0, y: 150, width: 390, height: 260 } }); await q.close(); }
  }
  await b.close();
})();
