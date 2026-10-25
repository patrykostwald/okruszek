const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto(require('url').pathToFileURL(path.join(__dirname, 'index.html')).href + '?test&seed=23');
  await page.waitForTimeout(500);
  const ev = (f, a) => page.evaluate(f, a);
  await ev(() => { const o = __okruszek; o.odblokuj(); o.noc(true); o.bezPradow(false); o.bezPrzeszkod(false); o.tempo(8); o.nowyBieg(); });
  let last = {}, n = 0;
  while (true) {
    const s = await ev(() => { __okruszek.ustawWysokosc(1); return __okruszek.stan(); });
    for (const k of Object.keys(s.spawny)) if (s.spawny[k] > (last[k] || 0)) { last[k] = s.spawny[k]; console.log('t=' + s.graCzas.toFixed(1), 'spawn', k, '| terminy nowe:', JSON.stringify(Object.fromEntries(Object.entries(s.terminy.nowe).map(([a, b]) => [a, +b.toFixed(0)]))), 'ptak', s.terminy.ptak.toFixed(0), 'deszcz', s.terminy.deszcz.toFixed(0)); }
    if (s.tryb !== 'gra' || s.graCzas >= 125) break; await sleep(40);
  }
  await browser.close();
})();
