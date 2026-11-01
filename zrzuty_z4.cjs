/* Okruszek Z4: zrzuty 390x844 (DPR 2, jak telefon). Użycie: node zrzuty_z4.cjs [katalog-wyjścia] [plik.html] [tylko]
   tylko = lista grup po przecinku: poziomy, pory, ptaszek, przeszkody (domyślnie wszystkie).
   L0-L5 (zachód), cztery pory doby przy L2 i L4, Okruszek w zbliżeniu (suchy L0/L4, mokry, skręt, nurkowanie, zerkanie, skrzydło złożone, drzemka),
   każda przeszkoda w stylu tuszu i akwareli. */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const out = path.resolve(process.argv[2] || path.join(__dirname, 'zrzuty-z4'));
const file = path.resolve(process.argv[3] || path.join(__dirname, 'index.html'));
const only = (process.argv[4] || 'poziomy,pory,ptaszek,przeszkody').split(',');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const errs = [];
  const mk = async (dsf, extra) => { const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: dsf }); page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); }); await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23' + (extra || '')); await page.waitForTimeout(600); return page; };
  let page = await mk(2);
  let ev = (f, a) => page.evaluate(f, a);
  const shot = (nazwa, clip) => page.screenshot({ path: path.join(out, 'z4-' + nazwa + '.png'), clip });
  const fresh = async (tempo) => { await ev((tp) => { const o = __okruszek; o.odblokuj(); o.odblokujPore(); o.nurkuj(false); o.przesun(null); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(tp || 1); o.nowyBieg(); o.noc(false); o.ustawWysokosc(0.8); }, tempo); };
  if (only.includes('poziomy')) for (let n = 0; n <= 5; n++) { await fresh(1); await ev((q) => __okruszek.ustawPoziom(q), n); await sleep(1800); await shot('L' + n); }
  if (only.includes('pory')) for (const lev of [2, 4]) for (const p of ['noc', 'swit', 'dzien', 'zachod']) { await fresh(1); await ev(([q, l]) => { __okruszek.ustawPore(q); __okruszek.ustawPoziom(l); }, [p, lev]); await sleep(1800); await shot('pora-' + p + '-L' + lev); }
  if (only.includes('ptaszek')) {
    /* zbliżenia: płótno w 4x (hak ?sc=4), wycinek 150x150 px CSS wokół ptaszka, zrzut DPR 3 */
    await page.close(); page = await mk(3, '&sc=4'); ev = (f, a) => page.evaluate(f, a);
    const clip = { x: 195 - 80, y: 641 - 86, width: 160, height: 160 };
    const zb = async (nazwa, prep, wait, look) => {
      await fresh(1); await ev(prep); await sleep(wait || 900);
      if (look) for (let i = 0; i < 200; i++) { const c = await ev(() => __okruszek.stan().czas % 8.4); if (look === 'L' ? (c > 1.0 && c < 2.2) : (c > 4.7 && c < 5.8)) break; await sleep(50); }
      await shot('ptaszek-' + nazwa, clip);
    };
    await zb('L0-suchy', () => __okruszek.ustawPoziom(0), 900);
    await zb('L0-zerka', () => __okruszek.ustawPoziom(0), 300, 'L');
    await zb('L2-zerka', () => __okruszek.ustawPoziom(2), 300, 'P');
    await zb('L4-suchy', () => __okruszek.ustawPoziom(4), 900);
    await zb('L4-zerka', () => __okruszek.ustawPoziom(4), 300, 'L');
    await zb('L3-dzien', () => { __okruszek.ustawPore('dzien'); __okruszek.ustawPoziom(3); }, 900);
    await zb('L3-noc', () => { __okruszek.ustawPore('noc'); __okruszek.ustawPoziom(3); }, 900);
    await zb('mokry-L3', () => { __okruszek.ustawPoziom(3); __okruszek.bezPrzeszkod(false); __okruszek.zdarzenie('deszcz', { dx: 0, z: 0.86, wiek: 5 }); }, 1100);
    await zb('skret-L3', () => { __okruszek.ustawPoziom(3); __okruszek.przesun(1); }, 900);
    await zb('nurkowanie-L3', () => { __okruszek.ustawPoziom(3); __okruszek.nurkuj(true); }, 900);
    await zb('skrzydlo-lewe-L2', () => { const o = __okruszek; o.sterowanie(2); o.ustawPoziom(2); o.dotyk('dol', 1, 0.2, 0.8); }, 900);
    await ev(() => { __okruszek.dotyk('gora', 1); __okruszek.sterowanie(1); });
    await fresh(1); await ev(() => { __okruszek.ustawPoziom(2); }); await ev(() => { __okruszek.odblokuj(); __okruszek.ustawWysokosc(0.01); }); await sleep(2600); await shot('ptaszek-drzemka', { x: 195 - 80, y: 641 - 60, width: 160, height: 160 });
    await page.close(); page = await mk(2); ev = (f, a) => page.evaluate(f, a);
  }
  if (only.includes('przeszkody')) {
    const place = async (nm, opt, lev, wait, pora) => { await fresh(0.1); await ev(([l, p]) => { if (p) __okruszek.ustawPore(p); __okruszek.ustawPoziom(l); __okruszek.bezPrzeszkod(false); }, [lev || 2, pora]); await ev(([n, o]) => __okruszek.zdarzenie(n, o), [nm, opt]); await sleep(wait || 900); await shot('przeszkoda-' + nm + '-L' + (lev || 2)); };
    await place('ptak', { dx: 0.1, z: 1.3, v: -40, dir: -1, wiek: 5 }, 3);
    await place('stado', { dx: 0.15, z: 1.45, v: -60, dir: -1, wiek: 5 }, 2);
    await place('latawiec', { dx: 0.05, z: 1.4, wiek: 5 }, 3);
    await place('mgla', { dx: 0.15, z: 1.6, wiek: 5 }, 2);
    await place('mgla', { dx: 0.15, z: 1.6, wiek: 5 }, 0);
    await place('deszcz', { dx: 0.25, z: 1.7, wiek: 5 }, 3, 1300);
    await place('burza', { dx: 0.25, z: 1.7, wiek: 5 }, 2, 1300);
    await fresh(1); await ev(() => { __okruszek.ustawPoziom(2); __okruszek.bezPrzeszkod(false); __okruszek.zdarzenie('grad', { dx: 0.1 }); }); await sleep(1500); await shot('przeszkoda-grad-zapowiedz'); await sleep(1200); await shot('przeszkoda-grad-aktywny');
    await fresh(1); await ev(() => { __okruszek.ustawPoziom(0); __okruszek.bezPrzeszkod(false); __okruszek.zdarzenie('grad', { dx: 0.1 }); }); await sleep(2700); await shot('przeszkoda-grad-aktywny-L0');
    await fresh(1); await ev(() => { __okruszek.ustawPoziom(2); __okruszek.bezPrzeszkod(false); __okruszek.zdarzenie('wiatr', { dir: 1 }); }); await sleep(3800); await shot('przeszkoda-wiatr-podmuch');
    await fresh(1); await ev(() => { __okruszek.ustawPore('dzien'); __okruszek.ustawPoziom(3); __okruszek.bezPrzeszkod(false); __okruszek.zdarzenie('jastrzab'); }); await sleep(2600); await ev(() => __okruszek.ustaw(0.3)); await sleep(1800); await ev(() => __okruszek.ustawPoziom(3)); await shot('jastrzab-poscig');
    await fresh(1); await ev(() => { __okruszek.noc(true); __okruszek.ustawPoziom(2); __okruszek.bezPrzeszkod(false); __okruszek.zdarzenie('sowa'); }); await sleep(2600); await ev(() => __okruszek.ustaw(0.3)); await sleep(1800); await ev(() => __okruszek.ustawPoziom(2)); await shot('sowa-poscig');
    await fresh(1); await ev(() => { __okruszek.ustawPoziom(3); __okruszek.bezPradow(false); __okruszek.zdarzenie('prad', { dx: 0.1, z: 1.6 }); __okruszek.zdarzenie('prad', { dx: -0.4, z: 2.6 }); }); await sleep(600); await shot('prad-L3');
  }
  console.log('błędy konsoli: ' + (errs.length ? errs.join(' | ') : 'brak'));
  await browser.close();
  console.log('zrzuty w ' + out);
})().catch(e => { console.error('BLAD ' + e); process.exit(2); });
