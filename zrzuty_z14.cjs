/* Okruszek Z14: zrzuty 390 x 844 toru (?tor=1) do zrzuty-z14/. Użycie: node zrzuty_z14.cjs [plik.html] [filtr]
   Tor z siatką (L0 i w kolorze), Okruszek w komórkach (lewy-górny, środek, prawy-dolny), każdy typ wiatru z trasą, chmury kolorowe (L0 i kolor),
   burza, grad, tornado, ptak, samolot (wiersz i kolumna), motolotnia, UFO, szpile (K3), latawiec (K4), Wielki przelot (K5), pościg jastrzębia po komórkach. */
const fs = require('fs'), path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const filtr = process.argv[3] ? new RegExp(process.argv[3]) : null;
const OUT = path.join(__dirname, 'zrzuty-z14');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const err = []; pg.on('pageerror', e => err.push(String(e))); pg.on('console', m => { if (m.type() === 'error') err.push(m.text()); });
  await pg.goto('file:///' + file.replace(/\\/g, '/') + '?test&tor=1&seed=23'); await pg.waitForTimeout(1200);
  await pg.evaluate(() => { __okruszek.z11Zbuduj(); __okruszek.torSprite(); });
  /* scena: brama (kraina), komórka, poziom koloru (E), zdarzenia [nazwa, k, w, z], czas lotu przed zrzutem; potem tempo 0,1 (prawie stop, bez nakładki pauzy) */
  const scena = async (nazwa, o) => {
    if (filtr && !filtr.test(nazwa)) return;
    await pg.evaluate(async (o) => {
      const O = __okruszek; O.tempo(1); O.pauza(true); O.ziarno(o.ziarno || 3); O.brama(o.brama || 1); O.odblokuj(); O.ustawEnergie(null);
      if (o.pora) O.ustawPore(o.pora);
      O.bezPrzeszkod(!o.gen); O.bezPradow(!o.gen); O.nowyBieg();
      if (o.E !== undefined) O.ustawEnergie(o.E); O.ustaw(o.s !== undefined ? o.s : 0.02);
      O.idz(o.k !== undefined ? o.k : 1, o.w !== undefined ? o.w : 1, true);
      (o.zd || []).forEach(z => { if (z[0].indexOf('wzorzec:') === 0) O.wzorzec(z[0].slice(8), { z: z[3] }); else O.zdarzenie(z[0], { k: z[1], w: z[2], z: z[3], kolumna: z[4] }); });
      if (o.jastrzab) O.zdarzenie('jastrzab');
      O.pauza(false); await new Promise(r => setTimeout(r, (o.lot || 0.35) * 1000));
      if (o.ruch) { o.ruch.forEach(m => O.idz(m[0], m[1])); await new Promise(r => setTimeout(r, 160)); }
      O.tempo(0.1); await new Promise(r => setTimeout(r, 120));
    }, o);
    await pg.screenshot({ path: path.join(OUT, nazwa + '.png') });
    console.log('  zrzut ' + nazwa);
  };
  await scena('01_tor_siatka_L0', { gen: true, lot: 6 });
  await scena('02_tor_siatka_kolor', { gen: true, lot: 6, E: 1, s: 0.85 });
  await scena('03_komorka_lewy_gorny', { k: 0, w: 0, zd: [['wiatr:prawo', 1, 0, 2.6], ['chmura:biala', 2, 1, 3.6]] });
  await scena('04_komorka_srodek', { k: 1, w: 1, zd: [['wiatr:wprost', 1, 1, 2.6], ['chmura:lawenda', 0, 0, 3.6]] });
  await scena('05_komorka_prawy_dolny', { k: 2, w: 2, zd: [['wiatr:gora', 2, 2, 2.6], ['ptak', 0, 1, 3.6]] });
  const W = [['gora', 1, 2], ['gora1', 0, 2], ['dol', 0, 0], ['wprost', 1, 1], ['lewo', 2, 1], ['prawo', 0, 1], ['zjazd', 1, 0], ['smuga', 1, 1]];
  for (const [n, k, w] of W) await scena('10_wiatr_' + n, { k, w, zd: [['wiatr:' + n, k, w, 1.75]], E: 0.3, s: 0.2 });
  await scena('11_przerzut_wiatrem', { k: 1, w: 2, zd: [['wiatr:gora', 1, 2, 0.95]], lot: 0.5, E: 0.3, s: 0.2 });
  const CH = [['chmura:biala', 0, 0], ['chmura:lawenda', 1, 0], ['chmura:szara', 2, 0], ['chmura:fiolet', 0, 1], ['chmura:zielona_mgla', 2, 1], ['chmura:oaza', 1, 2]];
  await scena('20_chmury_kolorowe_L0', { k: 1, w: 1, zd: CH.map(c => [c[0], c[1], c[2], 1.9]), s: 0.02 });
  await scena('21_chmury_kolorowe_kolor', { k: 1, w: 1, zd: CH.map(c => [c[0], c[1], c[2], 1.9]), E: 1, s: 0.85 });
  const Z = [['burza', 'burza', 1, 0], ['grad', 'grad', 0, 1], ['tornado', 'tornado', 2, 0], ['ptak', 'ptak', 0, 1], ['samolot_wiersz', 'samolot', 0, 0], ['motolotnia', 'motolotnia', 2, 1], ['ufo', 'ufo', 1, 0]];
  for (const [n, t, k, w] of Z) { await scena('30_' + n + '_L0', { k: 1, w: 2, zd: [[t, k, w, 1.8]] }); await scena('31_' + n + '_kolor', { k: 1, w: 2, zd: [[t, k, w, 1.8]], E: 0.62, s: 0.5 }); }
  await scena('30_samolot_kolumna_L0', { k: 1, w: 1, zd: [['samolot', 0, 0, 1.8, true]] });
  await scena('32_szpile_K3', { brama: 3, k: 1, w: 0, zd: [['szpile', 0, 1, 1.8], ['szpile', 2, 2, 2.7]], E: 0.3, s: 0.2 });
  await scena('33_latawiec_K4', { brama: 4, k: 1, w: 2, zd: [['latawiec', 0, 1, 1.8], ['latawiec', 2, 2, 2.7]], E: 0.3, s: 0.2 });
  await scena('34_przelot_K5', { brama: 5, k: 1, w: 1, zd: [['wzorzec:x02', 0, 0, 1.6]], E: 0.62, s: 0.5 });
  await scena('40_poscig_jastrzab', { brama: 4, k: 1, w: 1, jastrzab: true, lot: 4.0, s: 0.1 });
  await scena('41_poscig_sowa', { brama: 2, pora: 'noc', k: 1, w: 1, jastrzab: false, zd: [], lot: 0.2, s: 0.1 });
  if (!filtr || filtr.test('41_poscig_sowa')) { await pg.evaluate(async () => { const O = __okruszek; O.tempo(1); O.zdarzenie('sowa', { force: true }); await new Promise(r => setTimeout(r, 3900)); O.tempo(0.1); await new Promise(r => setTimeout(r, 120)); }); await pg.screenshot({ path: path.join(OUT, '41_poscig_sowa.png') }); }
  console.log(err.length ? 'BŁĘDY: ' + err.slice(0, 3).join(' | ') : 'bez błędów');
  await b.close();
})().catch(e => { console.error('BŁĄD ' + e); process.exit(2); });
