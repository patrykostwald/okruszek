/* Okruszek Z3c: zrzuty 390x844. Użycie: node zrzuty_z3c.cjs [katalog-wyjścia] [plik.html]
   (1) E = 0, 0,3, 0,62, 1 przy tej samej porze doby (zachód i dzień),
   (2) rozkwit: 3 klatki (po trafieniu trzeciego prądu z rzędu),
   (3) HUD z 0/1/2/3 iskierkami (powiększenie lewego górnego rogu) */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const out = path.resolve(process.argv[2] || path.join(__dirname, 'zrzuty-z3c'));
const file = path.resolve(process.argv[3] || path.join(__dirname, 'index.html'));
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const mk = async (dsf) => { const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: dsf }); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); }); await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23'); await page.waitForTimeout(600); return { page, errs }; };
  const { page, errs } = await mk(1);
  const ev = (f, a) => page.evaluate(f, a);
  const shot = (nazwa) => page.screenshot({ path: path.join(out, 'z3c-' + nazwa + '.png') });
  const fresh = async (tempo) => { await ev((tp) => { const o = __okruszek; o.odblokuj(); o.odblokujPore(); o.nurkuj(false); o.przesun(null); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(tp || 1); o.nowyBieg(); o.noc(false); }, tempo); };
  const only = process.env.ONLY || 'abc';

  if (only.includes('a')) {
    for (const pora of ['zachod', 'dzien']) {
      for (const e of [0, 0.3, 0.62, 1]) {
        await fresh(1); await ev(([p, x]) => { __okruszek.ustawPore(p); __okruszek.ustawEnergie(x); }, [pora, e]); await sleep(1800);
        await shot('E' + String(e).replace('.', '') + '-' + pora);
        const k = await ev(() => __okruszek.kolory()); console.log(pora + ' E=' + e + ' kolory ' + JSON.stringify(k));
      }
    }
  }
  if (only.includes('b')) {
    /* rozkwit: trzy idealne wejścia w łańcuchu, potem klatki w tempie 0,25 (rozkwit 1,2 s gry = 4,8 s rzeczywistych) */
    await fresh(1); await ev(() => { __okruszek.ustawPore('zachod'); __okruszek.tempo(0.25); });
    await ev(() => { const o = __okruszek; o.trafPrad(); }); await sleep(120); await ev(() => __okruszek.trafPrad()); await sleep(120);
    await shot('rozkwit-0-przed');
    await ev(() => __okruszek.trafPrad());
    const t0 = Date.now();
    for (const [nm, ms] of [['1', 900], ['2', 2200], ['3', 3600], ['4', 5400]]) {
      while (Date.now() - t0 < ms) await sleep(20);
      await shot('rozkwit-' + nm); console.log('rozkwit ' + nm + ' ' + JSON.stringify(await ev(() => __okruszek.rozkwit())) + ' E=' + (await ev(() => __okruszek.energia())).toFixed(2));
    }
    await ev(() => __okruszek.tempo(1));
  }
  if (only.includes('c')) {
    const hud = await mk(3);
    for (let n = 0; n <= 3; n++) {
      await hud.page.evaluate((q) => { const o = __okruszek; o.odblokuj(); o.odblokujPore(); o.bezPradow(true); o.bezPrzeszkod(true); o.nowyBieg(); o.noc(false); o.ustawPore('zachod'); o.ustawEnergie([0, 0.3, 0.62, 1][q]); }, n);
      await sleep(900); await hud.page.screenshot({ path: path.join(out, 'z3c-hud-' + n + '.png'), clip: { x: 0, y: 0, width: 200, height: 100 } });
      console.log('hud ' + n + ' ' + JSON.stringify(await hud.page.evaluate(() => __okruszek.lancuchE().iskierki)));
    }
    errs.push(...hud.errs);
  }
  console.log('błędy konsoli: ' + (errs.length ? errs.join(' | ') : 'brak'));
  await browser.close();
  console.log('zrzuty w ' + out);
})();
