const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const path = require('path');
(async () => {
  const file = process.argv[2], out = process.argv[3];
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  for (const w of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width: w, height: w === 1440 ? 900 : 844 } });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file:///' + file.replace(/\\/g, '/'));
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => ({ bodyW: document.body.scrollWidth, innerW: innerWidth, docH: document.documentElement.scrollHeight }));
    console.log(w, JSON.stringify(m), errors.length ? 'BŁĘDY: ' + errors.join(' | ') : 'bez błędów konsoli');
    await page.screenshot({ path: path.join(out, 'kulisy-' + w + '.png'), fullPage: true });
    const tel = await page.$('.tel');
    await tel.screenshot({ path: path.join(out, 'kulisy-' + w + '-wolno.png') });
    await page.evaluate(() => { const s = document.getElementById('kulisy-v'); s.value = 100; });
    await page.waitForTimeout(3000);
    await tel.screenshot({ path: path.join(out, 'kulisy-' + w + '-szybko.png') });
    await page.close();
  }
  await browser.close();
})();
