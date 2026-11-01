/* Okruszek Z10: zrzuty 390 px (kurtyna w połowie dla przelotów do bram 2-6, start z bram 1-5, kreska do bramy, Fiuk, sowa-pokaz). Użycie: node zrzuty_z10.cjs */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const OUT = path.join(__dirname, 'zrzuty-z10');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('file:///' + path.join(__dirname, 'index.html').split(String.fromCharCode(92)).join('/') + '?test&seed=23'); await p.waitForTimeout(800);
  const shot = async (prep, arg, name) => { const r = await p.evaluate(prep, arg); await p.waitForTimeout(450); await p.screenshot({ path: path.join(OUT, name + '.png') }); await p.evaluate(() => { __okruszek.pauza(true); __okruszek.tempo(1); __okruszek.odblokuj(); }); return r; };
  for (let n = 2; n <= 6; n++) for (const L of [0, 2]) {
    const k = await shot(([n, L]) => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokujPore(); o.ziarno(1); o.brama(n - 1); o.ustawPoziom(L); o.symuluj(8); const sp = (0.32 + 1.9 * o.stan().s) / (10 + 22 * o.stan().s); o.doBramy((2.13 - 0.7) / sp); o.symuluj(0.05); o.tempo(0.1); o.pauza(false); return o.droga().kurtyna; }, [n, L], 'kurtyna-brama' + n + '-L' + L);
    console.log('kurtyna brama ' + n + ' L' + L + ': otwarcie ' + (k && k.open.toFixed(2)));
  }
  console.log('gotowe');
  await browser.close();
})();
