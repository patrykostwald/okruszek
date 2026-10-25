/* Okruszek Z3b: zrzuty 390x844. Użycie: node zrzuty_z3b.cjs [katalog-wyjścia]
   L0-L5 (ta sama pora: zachód), cztery pory doby przy L2 (i L4), każda nowa przeszkoda, sowa, wskaźnik poziomu (powiększenie) */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const out = path.resolve(process.argv[2] || path.join(__dirname, 'zrzuty-z3b'));
const file = path.resolve(process.argv[3] || path.join(__dirname, 'index.html'));
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const mk = async (dsf) => { const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: dsf }); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23'); await page.waitForTimeout(500); return { page, errs }; };
  const { page, errs } = await mk(1);
  const ev = (f, a) => page.evaluate(f, a);
  const shot = (nazwa) => page.screenshot({ path: path.join(out, 'z3b-' + nazwa + '.png') });
  const fresh = async (tempo) => { await ev((tp) => { const o = __okruszek; o.odblokuj(); o.odblokujPore(); o.nurkuj(false); o.przesun(null); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(tp || 1); o.nowyBieg(); o.noc(false); }, tempo); };

  /* 1. poziomy L0-L5, zachód */
  for (let n = 0; n <= 5; n++) { await fresh(1); await ev((q) => __okruszek.ustawPoziom(q), n); await sleep(1600); await shot('L' + n); }
  /* 2. pory doby przy L2 i L4 */
  for (const lev of [2, 4]) for (const p of ['noc', 'swit', 'dzien', 'zachod']) { await fresh(1); await ev(([q, l]) => { __okruszek.ustawPore(q); __okruszek.ustawPoziom(l); }, [p, lev]); await sleep(1600); await shot('pora-' + p + '-L' + lev); }
  /* 3. nowe przeszkody (L2, zachód; tempo 0,1 = prawie stoi, żeby kadr był w ręku) */
  const place = async (nm, opt, lev, wait) => { await fresh(0.1); await ev(([l]) => __okruszek.ustawPoziom(l), [lev || 2]); await ev(([n, o]) => __okruszek.zdarzenie(n, o), [nm, opt]); await sleep(wait || 900); await shot('przeszkoda-' + nm); };
  await place('stado', { dx: 0.15, z: 1.45, v: -60, dir: -1, wiek: 5 }, 2);
  await place('latawiec', { dx: 0.05, z: 1.4, wiek: 5 }, 2);
  await place('mgla', { dx: 0.15, z: 1.6, wiek: 5 }, 2);
  await place('burza', { dx: 0.25, z: 1.7, wiek: 5 }, 2, 1300);
  /* burza w błysku: czekamy na błysk */
  await fresh(0.3); await ev(() => __okruszek.ustawPoziom(2)); await ev(() => __okruszek.zdarzenie('burza', { dx: 0.2, z: 1.5, wiek: 5 }));
  for (let i = 0; i < 200; i++) { await sleep(40); const fl = await ev(() => { const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = 20; t.height = 40; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0, 20, 40); const d = x.getImageData(0, 0, 20, 40).data; let s = 0; for (let k = 0; k < d.length; k += 4) s += d[k]; return s / (d.length / 4); }); if (fl > 150) break; }
  await shot('przeszkoda-burza-blysk');
  /* wiatr: zapowiedź i podmuch; grad: zapowiedź i aktywny */
  await fresh(1); await ev(() => __okruszek.ustawPoziom(2)); await ev(() => __okruszek.zdarzenie('wiatr', { dir: 1 })); await sleep(1500); await shot('przeszkoda-wiatr-zapowiedz'); await sleep(2300); await shot('przeszkoda-wiatr-podmuch');
  await fresh(1); await ev(() => __okruszek.ustawPoziom(2)); await ev(() => __okruszek.zdarzenie('grad', { dx: 0.1 })); await sleep(1500); await shot('przeszkoda-grad-zapowiedz'); await sleep(1200); await shot('przeszkoda-grad-aktywny');
  /* 4. sowa: noc, zapowiedź i pościg */
  await fresh(1); await ev(() => { __okruszek.noc(true); __okruszek.ustawPoziom(2); __okruszek.zdarzenie('sowa'); }); await sleep(1300); await shot('sowa-zapowiedz');
  await sleep(900); await ev(() => __okruszek.ustaw(0.25)); await ev(() => __okruszek.tempo(3)); await sleep(1500); await ev(() => __okruszek.tempo(1)); await shot('sowa-poscig');
  await ev(() => __okruszek.tempo(3)); await sleep(1200); await ev(() => __okruszek.tempo(1)); await shot('sowa-blisko');
  /* 5. wskaźnik poziomu: powiększenie lewego górnego rogu */
  const hud = await mk(3);
  for (let n = 0; n <= 5; n++) { await hud.page.evaluate((q) => { const o = __okruszek; o.odblokuj(); o.odblokujPore(); o.bezPradow(true); o.bezPrzeszkod(true); o.nowyBieg(); o.noc(false); o.ustawPoziom(q); }, n); await sleep(900); await hud.page.screenshot({ path: path.join(out, 'z3b-wskaznik-L' + n + '.png'), clip: { x: 0, y: 0, width: 260, height: 80 } }); }
  /* komunikat przy wejściu na poziom */
  await hud.page.evaluate(() => { const o = __okruszek; o.odblokuj(); o.nowyBieg(); o.noc(false); o.ustaw(0.4); }); await sleep(450); await hud.page.screenshot({ path: path.join(out, 'z3b-komunikat-Kolor.png'), clip: { x: 0, y: 0, width: 390, height: 170 } });
  await hud.page.evaluate(() => { const o = __okruszek; o.odblokuj(); o.nowyBieg(); o.noc(false); o.ustawPoziom(5); }); await sleep(450); await hud.page.screenshot({ path: path.join(out, 'z3b-komunikat-Hiper.png'), clip: { x: 0, y: 0, width: 390, height: 170 } });
  console.log('błędy konsoli: ' + (errs.concat(hud.errs).length ? errs.concat(hud.errs).join(' | ') : 'brak'));
  await browser.close();
  console.log('zrzuty w ' + out);
})();
