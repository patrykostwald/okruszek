/* Zrzuty 390 px przy prędkości 0 / 0,5 / 1. Użycie: node zrzuty.cjs [katalog-wyjścia] */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const out = path.resolve(process.argv[2] || path.join(__dirname, 'zrzuty'));
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  for (const [w, h, tag] of [[390, 844, '390'], [1440, 900, '1440']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.goto('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?test&seed=23');
    await page.waitForTimeout(800);
    for (const v of [0, 0.5, 1]) {
      await page.evaluate(x => window.__okruszek.ustaw(x), v);
      await page.waitForTimeout(2500);
      await page.screenshot({ path: path.join(out, 'okruszek-' + tag + '-s' + String(v).replace('.', '') + '.png') });
    }
    await page.close();
  }
  await browser.close();
  console.log('zrzuty w ' + out);
})();
