/* Okruszek Z15: zrzuty 390x844 (zrzuty-z15). Użycie: node zrzuty_z15.cjs [plik.html] [grupa]
   grupy: poziomy (L0-L5 o zachodzie, w dzień i w nocy), przejscia (krok 0,05 s między sąsiednimi poziomami, 6 klatek), zblizenia (chmury z bliska ?sc=3),
   szpile, przeszkody, morze, swit; bez grupy = wszystkie. */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const grupa = process.argv[3] || 'wszystko';
const OUT = path.join(__dirname, 'zrzuty-z15'); if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const chce = (g) => grupa === 'wszystko' || grupa === g;
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const otworz = async (q) => { const p = await ctx.newPage(); await p.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23' + (q || '')); await sleep(900); return p; };
  let p = await otworz('&pasmo=1');
  const ev = (f, a) => p.evaluate(f, a);
  const fresh = () => ev(() => { const o = __okruszek; o.odblokuj(); o.nurkuj(false); o.przesun(null); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.nowyBieg(); o.noc(false); o.tempo(0.02); });
  const shot = async (n) => { await p.screenshot({ path: path.join(OUT, n + '.png') }); console.log('  ' + n); };
  if (chce('poziomy')) {
    for (const pora of ['zachod', 'dzien', 'noc']) {
      await fresh();
      for (let n = 0; n <= 5; n++) { await ev((a) => { __okruszek.ustawPore(a[0]); __okruszek.ustawPoziom(a[1]); }, [pora, n]); await sleep(n === 5 ? 1500 : 800); await shot('L' + n + '-' + pora); }
    }
  }
  if (chce('swit')) { await fresh(); for (const n of [0, 2, 4]) { await ev((a) => { __okruszek.ustawPore('swit'); __okruszek.ustawPoziom(a); }, n); await sleep(800); await shot('L' + n + '-swit'); } }
  if (chce('przejscia')) {
    /* przejście między poziomami w czasie gry: E (energia) rośnie od wartości poziomu n do n+1; 6 klatek co 0,05 s czasu gry (świat zamrożony tempem) */
    await fresh();
    await ev(() => { __okruszek.ustawPore('zachod'); });
    const mid = [0.04, 0.25, 0.47, 0.70, 0.88, 1.0];
    for (let n = 0; n < 5; n++) {
      for (let k = 0; k < 6; k++) { const v = mid[n] + (mid[n + 1] - mid[n]) * k / 5; await ev((x) => { __okruszek.ustaw(x); __okruszek.ustawPore('zachod'); }, v); await sleep(380); await shot('przejscie-L' + n + 'L' + (n + 1) + '-' + k); }
    }
  }
  if (chce('czas')) {   /* przejście w czasie gry: wlot w prąd (E 0 -> 0,3, potem 0,3 -> 0,62), 6 klatek co 0,05 s czasu gry (tempo 0,1: 0,5 s na klatkę) */
    await fresh(); await ev(() => { const o = __okruszek; o.odblokuj(); o.ustawPore('zachod'); o.tempo(1); }); await sleep(700);
    for (const [nm, ile] of [['E0-E03', 1], ['E03-E062', 1]]) {
      await ev(() => { __okruszek.tempo(0.1); }); await sleep(200);
      for (let i = 0; i < ile; i++) await ev(() => __okruszek.trafPrad());
      for (let k = 0; k < 6; k++) { await shot('czas-' + nm + '-' + k); await sleep(Math.max(0, 500 - 160)); }
      await sleep(1500);
    }
  }
  if (chce('zblizenia')) {   /* chmury z bliska: płótno w 3x (sc=3), wycinek 130x150 px CSS powiększony 3 razy */
    const c3 = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
    const q = await c3.newPage(); await q.goto('file:///' + file.split(path.sep).join('/') + '?test&seed=23&pasmo=1'); await sleep(900);
    for (const [n, pora] of [[0, 'zachod'], [0, 'noc'], [2, 'zachod'], [4, 'zachod']]) {
      await q.evaluate((a) => { const o = __okruszek; o.odblokuj(); o.bezPradow(true); o.bezPrzeszkod(true); o.nowyBieg(); o.noc(false); o.tempo(0.02); o.ustawPore(a[1]); o.ustawPoziom(a[0]); }, [n, pora]); await sleep(1300);
      await q.screenshot({ path: path.join(OUT, 'zblizenie-L' + n + '-' + pora + '.png'), clip: { x: 0, y: 330, width: 195, height: 200 } }); console.log('  zblizenie-L' + n + '-' + pora);
    }
    await c3.close();
  }
  if (chce('przeszkody')) {
    for (const n of [0, 2, 4]) {
      await fresh(); await ev((a) => { __okruszek.ustawPore('zachod'); __okruszek.ustawPoziom(a); __okruszek.bezPrzeszkod(false); __okruszek.tempo(1); }, n);
      await ev(() => { const o = __okruszek; o.zdarzenie('ptak', { z: 1.6, wiek: 2 }); o.zdarzenie('stado', { z: 2.6, wiek: 2 }); o.zdarzenie('deszcz', { z: 3.2, wiek: 2 }); o.zdarzenie('latawiec', { z: 2.0, wiek: 2 }); });
      await sleep(250); await ev(() => __okruszek.tempo(0.02)); await sleep(500); await shot('przeszkody-L' + n);
      await fresh(); await ev((a) => { __okruszek.ustawPore('zachod'); __okruszek.ustawPoziom(a); __okruszek.bezPrzeszkod(false); __okruszek.tempo(1); }, n);
      await ev(() => { const o = __okruszek; o.zdarzenie('burza', { z: 2.4, wiek: 2 }); o.zdarzenie('mgla', { z: 3.6, wiek: 2 }); o.zdarzenie('jastrzab', {}); });
      await sleep(2600); await ev(() => __okruszek.tempo(0.02)); await sleep(500); await shot('burza-mgla-jastrzab-L' + n);
    }
  }
  if (chce('szpile')) {   /* wieże, samolot, latawce: inscenizacja jak w zrzuty_z11.cjs (brama krainy, zdarzenie, symulacja do chwili kadru) */
    await p.close(); p = await otworz('');
    await ev(() => __okruszek.z11Zbuduj());
    const scena = async (nm, c) => { await ev((c) => { const o = __okruszek; o.pauza(true); o.tempo(1); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokuj(); o.odblokujPore(); o.brama(c.b); if (c.pora) o.ustawPore(c.pora); o.ustawPoziom(c.L); o.ustawWysokosc(0.8); o.symuluj(0.6);
      (c.ev || []).forEach(e => o.zdarzenie(e[0], e[1])); o.symuluj(c.sim); o.tempo(0.02); o.pauza(false); }, c); await sleep(900); await shot(nm); };
    for (const [L, pora] of [[0, 'zachod'], [0, 'noc'], [2, 'zachod'], [4, 'dzien']]) await scena('szpile-L' + L + '-' + pora, { b: 3, L: L, pora: pora, ev: [['szpile', { uklad: 'aleja', dx: 0, z: 2.2 }]], sim: 1.15 });
    for (const L of [0, 2, 4]) await scena('samolot-L' + L, { b: 5, L: L, ev: [['przelot', { dx: 0, wiry: true }]], sim: 1.55 });
    await scena('samolot-wiry-L2', { b: 5, L: 2, ev: [['przelot', { dx: 0.05, wiry: true }]], sim: 4.9 });
    for (const L of [0, 2, 4]) await scena('latawce-L' + L, { b: 4, L: L, ev: [['latawce', { dx: 0, z: 2.5 }], ['poryw', { dx: 0.7, z: 3.0 }]], sim: 1.2 });
  }
  if (chce('tor')) {   /* paleta toru dla Z14: chmury-funkcje (zieleń tylko mgła-nerf i oaza-buff), wstęgi i podświetlenia */
    for (const [n, pora] of [[0, 'zachod'], [2, 'zachod'], [4, 'zachod'], [2, 'noc'], [4, 'dzien']]) {
      await fresh(); await ev((a) => { __okruszek.ustawPore(a[1]); __okruszek.ustawPoziom(a[0]); __okruszek.dbg({ tor15: 1 }); }, [n, pora]); await sleep(900); await shot('tor-paleta-L' + n + '-' + pora);
    }
    await ev(() => __okruszek.dbg({}));
  }
  if (chce('morze')) {
    for (const n of [0, 3]) { await fresh(); await ev((a) => { __okruszek.ustawPore('zachod'); __okruszek.ustawPoziom(a); __okruszek.ustawWysokosc(0.08); }, n); await sleep(900); await shot('morze-L' + n); }
  }
  await b.close();
})();
