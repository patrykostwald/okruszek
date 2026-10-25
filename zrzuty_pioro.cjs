/* pomocnik: zbliżenia ptaszka suchego i mokrego (s=0 i s=0,8), skala 3x. Użycie: node zrzuty_pioro.cjs [katalog] */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const out = path.resolve(process.argv[2] || path.join(__dirname, 'zrzuty-z3'));
const file = path.join(__dirname, 'index.html');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23');
  await page.waitForTimeout(500);
  const ev = (f, a) => page.evaluate(f, a);
  for (const sv of [0, 0.8]) {
    for (const wet of [false, true]) {
      await ev(([x, w]) => { const o = __okruszek; o.noc(false); o.bezPradow(true); o.bezPrzeszkod(true); o.nowyBieg(); o.ustaw(x); if (w) o.zdarzenie('deszcz', { z: 0.85, dx: 0 }); }, [sv, wet]);
      if (wet) { for (let i = 0; i < 100; i++) { const st = await ev(() => __okruszek.stan()); if (st.mokro) break; await sleep(20); } await sleep(1800); } else await sleep(600);
      await page.screenshot({ path: path.join(out, 'pioro-s' + String(sv).replace('.', '') + (wet ? '-mokry' : '-suchy') + '.png'), clip: { x: 120, y: 560, width: 150, height: 150 } });
    }
  }
  await browser.close();
})();
