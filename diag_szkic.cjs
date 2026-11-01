/* diagnostyka Z10: zrzut szkicu zagrożenia (node diag_szkic.cjs typ poziom dx) */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const [typ, L, dx] = [process.argv[2] || 'deszcz', +(process.argv[3] || 0), +(process.argv[4] || 0.3)];
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('file:///' + path.join(__dirname, 'index.html').split(String.fromCharCode(92)).join('/') + '?test&seed=23'); await p.waitForTimeout(800);
  const g = await p.evaluate(([typ, L, dx]) => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.brama(1); o.ustawPoziom(L); o.symuluj(3); o.zdarzenie(typ, { dx: dx }); o.symuluj(0.1); o.tempo(0.05); o.pauza(false); return o.gdzie().filter(x => x.typ !== 'prad'); }, [typ, L, dx]);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(__dirname, 'zrzuty-z10', 'szkic-' + typ + '-L' + L + '.png') });
  console.log(JSON.stringify(g));
  await browser.close();
})();
