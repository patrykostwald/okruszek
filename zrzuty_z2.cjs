/* Okruszek Z2: zrzuty 390x844 w stanach: start, w prądzie, nurkowanie przy s=1, tuż przed lądowaniem, ekran wyniku.
   Użycie: node zrzuty_z2.cjs [katalog-wyjścia] */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const out = path.resolve(process.argv[2] || path.join(__dirname, 'zrzuty-z2'));
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  for (const [w, h, tag] of [[390, 844, '390'], [1440, 900, '1440']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?test&seed=23');
    await page.waitForTimeout(500);
    const shot = (nazwa) => page.screenshot({ path: path.join(out, 'z2-' + tag + '-' + nazwa + '.png') });
    const ev = (f, a) => page.evaluate(f, a);

    /* 1. start: lot z samym machaniem, pierwszy prąd w drodze */
    await ev(() => { __okruszek.nowyBieg(); });
    await sleep(1300);
    await shot('1-start');

    /* 2. w prądzie: prąd dokładnie na torze lotu, zrzut tuż po wlocie */
    await ev(() => { __okruszek.nowyBieg(); __okruszek.bezPradow(true); __okruszek.zdarzenie('prad', { z: 1.25 }); });
    for (let i = 0; i < 80; i++) { const st = await ev(() => __okruszek.stan()); if (st.wloty > 0) break; await sleep(25); }
    await sleep(260);
    await shot('2-w-pradzie');
    await ev(() => __okruszek.bezPradow(false));

    /* 3. nurkowanie przy s=1 (prędkość zablokowana, pozycja nurkowania przez hak) */
    await ev(() => { __okruszek.nowyBieg(); __okruszek.ustaw(1); __okruszek.nurkuj(true); __okruszek.przesun(0.8); });
    await sleep(2600);
    await shot('3-nurkowanie-s1');
    await ev(() => { __okruszek.przesun(null); __okruszek.nurkuj(false); __okruszek.odblokuj(); });

    /* 4. tuż przed lądowaniem */
    await ev(() => { __okruszek.nowyBieg(); __okruszek.bezPradow(true); __okruszek.ustawWysokosc(0.075); });
    await sleep(800);
    await shot('4-przed-ladowaniem');
    /* 5. ekran wyniku */
    for (let i = 0; i < 100; i++) { const st = await ev(() => __okruszek.stan()); if (st.tryb === 'ladowanie') break; await sleep(30); }
    await sleep(500);
    await shot('4b-ladowanie');
    await sleep(2200);
    await shot('5-wynik');
    await ev(() => __okruszek.bezPradow(false));
    console.log(tag + ' błędy konsoli: ' + (errs.length ? errs.join(' | ') : 'brak'));
    await page.close();
  }
  await browser.close();
  console.log('zrzuty w ' + out);
})();
