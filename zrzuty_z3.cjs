/* Okruszek Z3: zrzuty 390x844 w stanach: ptak w kulisie, wirowanie, deszcz (przed i mokro), zapowiedź jastrzębia, pościg,
   ekran końca po złapaniu, biom nocny przy s=0 i s=1. Użycie: node zrzuty_z3.cjs [katalog-wyjścia] [plik.html] */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const out = path.resolve(process.argv[2] || path.join(__dirname, 'zrzuty-z3'));
const file = path.resolve(process.argv[3] || path.join(__dirname, 'index.html'));
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  for (const [w, h, tag] of [[390, 844, '390']].concat(process.env.WIDE ? [[1440, 900, '1440']] : [])) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23');
    await page.waitForTimeout(500);
    const shot = (nazwa) => page.screenshot({ path: path.join(out, 'z3-' + tag + '-' + nazwa + '.png') });
    const ev = (f, a) => page.evaluate(f, a);
    const fresh = async () => { await ev(() => { const o = __okruszek; o.odblokuj(); o.nurkuj(false); o.przesun(null); o.noc(false); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.nowyBieg(); }); };

    /* 1. ptak w kulisie (przed zderzeniem), s ok. 0 i ok. 0,6 */
    await fresh(); await ev(() => { __okruszek.zdarzenie('ptak', { z: 1.55, dx: 0.55, v: -70 }); });
    await sleep(1100); await shot('1-ptak-s0');
    await fresh(); await ev(() => { __okruszek.ustaw(0.75); __okruszek.zdarzenie('ptak', { z: 1.9, dx: 0.5, v: -70 }); });
    await sleep(500); await shot('1b-ptak-s075');
    /* 2. wirowanie po zderzeniu (zderzenie na torze) */
    await fresh(); await ev(() => { __okruszek.nurkuj(true); });
    await sleep(1500);
    await ev(() => { __okruszek.zdarzenie('ptak', { z: 0.95, dx: 0, v: 0 }); });
    for (let i = 0; i < 80; i++) { const st = await ev(() => __okruszek.stan()); if (st.wirowanie) break; await sleep(15); }
    await sleep(180); await shot('2-wirowanie');
    await sleep(120); await shot('2b-wirowanie-pioro');
    /* 3. deszcz: chmura przed ptaszkiem i mokry ptaszek w środku */
    await fresh(); await ev(() => { __okruszek.zdarzenie('deszcz', { z: 1.6, dx: 0.08 }); });
    await sleep(900); await shot('3-deszcz-przed');
    for (let i = 0; i < 400; i++) { const st = await ev(() => __okruszek.stan()); if (st.mokro) break; await sleep(25); }
    await sleep(700); await shot('3b-deszcz-w-chmurze');
    await sleep(1200); await shot('3c-mokry-ptaszek');
    /* 4. zapowiedź jastrzębia (po ok. 1,2 s z 2) */
    await fresh(); await ev(() => { __okruszek.ustaw(0.4); __okruszek.zdarzenie('jastrzab'); });
    await sleep(1300); await shot('4-zapowiedz');
    /* 5. pościg: kilka sekund w głąb, jastrząb rośnie */
    await sleep(900);
    await ev(() => __okruszek.ustaw(0.25));
    await ev(() => __okruszek.tempo(3)); await sleep(1100); await ev(() => __okruszek.tempo(1));
    await shot('5-poscig');
    await ev(() => __okruszek.tempo(3)); await sleep(500); await ev(() => __okruszek.tempo(1));
    await shot('5b-poscig-blisko');
    /* 6. złapanie: sekwencja i ekran końca */
    await ev(() => __okruszek.ustaw(0));
    for (let i = 0; i < 400; i++) { const st = await ev(() => __okruszek.stan()); if (st.tryb === 'zlapany') break; await ev(() => __okruszek.tempo(3)); await sleep(30); }
    await ev(() => __okruszek.tempo(1));
    await sleep(220); await shot('6-zlapany-start');
    await sleep(380); await shot('6b-odlatuje');
    await sleep(2300); await shot('6c-ekran-konca');
    /* 7. biom nocny przy s=0, 0,5 i 1 */
    for (const v of [0, 0.5, 1]) {
      await fresh(); await ev((x) => { __okruszek.noc(true); __okruszek.ustaw(x); __okruszek.zdarzenie('ptak', { z: 2.2, dx: 0.5, v: -60 }); __okruszek.zdarzenie('deszcz', { z: 3.0, dx: -0.7 }); }, v);
      await sleep(1600); await shot('7-noc-s' + String(v).replace('.', ''));
    }
    await fresh(); await ev(() => { __okruszek.noc(true); __okruszek.ustaw(0.8); __okruszek.zdarzenie('ptak', { z: 2.1, dx: 0.45, v: -60 }); __okruszek.zdarzenie('deszcz', { z: 3.2, dx: -0.55 }); });
    await sleep(350); await shot('7-noc-s08-przeszkody');
    await ev(() => __okruszek.noc(false));
    console.log(tag + ' błędy konsoli: ' + (errs.length ? errs.join(' | ') : 'brak'));
    await page.close();
  }
  await browser.close();
  console.log('zrzuty w ' + out);
})();
