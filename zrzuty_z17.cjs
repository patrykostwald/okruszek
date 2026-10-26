/* Okruszek Z17: zrzuty 390 x 844 toru po integracji z grafiką Z15 (zrzuty-z17/). Użycie: node zrzuty_z17.cjs [plik.html] [filtr]
   Tor w L0-L5, wiatry, chmury kolorowe (L0 i kolor), burza, grad, tornado, ptak, samolot, motolotnia, UFO, nadchmurze z widowiskami (S0), noc z dużą bliską chmurą. */
const fs = require('fs'), path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const filtr = process.argv[3] ? new RegExp(process.argv[3]) : null;
const OUT = path.join(__dirname, 'zrzuty-z17');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const err = []; pg.on('pageerror', e => err.push(String(e))); pg.on('console', m => { if (m.type() === 'error') err.push(m.text()); });
  await pg.goto('file:///' + file.replace(/\\/g, '/') + '?test&tor=1&seed=23'); await pg.waitForTimeout(1200);
  await pg.evaluate(() => { __okruszek.z11Zbuduj(); __okruszek.torSprite(); });
  /* scena: brama (kraina), komórka, poziom (L) albo energia (E) i prędkość (s), pora, zdarzenia [nazwa, k, w, z, kolumna], czas lotu; potem tempo 0,1 */
  const scena = async (nazwa, o) => {
    if (filtr && !filtr.test(nazwa)) return;
    await pg.evaluate(async (o) => {
      const O = __okruszek; O.tempo(1); O.pauza(true); O.ziarno(o.ziarno || 3); O.brama(o.brama || 1); O.odblokuj(); O.ustawEnergie(null);
      O.bezPrzeszkod(!o.gen); O.bezPradow(!o.gen); O.nowyBieg();
      if (o.pora) O.ustawPore(o.pora);
      if (o.L !== undefined) O.ustawPoziom(o.L); else { if (o.E !== undefined) O.ustawEnergie(o.E); O.ustaw(o.s !== undefined ? o.s : 0.02); }
      O.idz(o.k !== undefined ? o.k : 1, o.w !== undefined ? o.w : 1, true);
      (o.zd || []).forEach(z => { if (z[0].indexOf('wzorzec:') === 0) O.wzorzec(z[0].slice(8), { z: z[3] }); else O.zdarzenie(z[0], { k: z[1], w: z[2], z: z[3], kolumna: z[4] }); });
      if (o.jastrzab) O.zdarzenie('jastrzab');
      O.pauza(false); await new Promise(r => setTimeout(r, (o.lot || 0.35) * 1000));
      O.tempo(0.1); await new Promise(r => setTimeout(r, 140));
    }, o);
    await pg.screenshot({ path: path.join(OUT, nazwa + '.png') });
    console.log('  zrzut ' + nazwa);
  };
  for (let L = 0; L <= 5; L++) await scena('0' + L + '_tor_L' + L, { gen: true, lot: 5, L, brama: 2 });
  const W = [['gora', 1, 2], ['zjazd', 1, 0], ['lewo', 2, 1], ['wprost', 1, 1]];
  for (const [n, k, w] of W) await scena('10_wiatr_' + n, { k, w, zd: [['wiatr:' + n, k, w, 1.75], ['chmura:lawenda', (k + 1) % 3, (w + 1) % 3, 2.6]], E: 0.3, s: 0.2 });
  const CH = [['chmura:biala', 0, 0], ['chmura:lawenda', 1, 0], ['chmura:szara', 2, 0], ['chmura:fiolet', 0, 1], ['chmura:zielona_mgla', 2, 1], ['chmura:oaza', 1, 2]];
  await scena('20_chmury_L0', { k: 1, w: 1, zd: CH.map(c => [c[0], c[1], c[2], 1.9]), s: 0.02 });
  await scena('21_chmury_kolor', { k: 1, w: 1, zd: CH.map(c => [c[0], c[1], c[2], 1.9]), E: 1, s: 0.85 });
  await scena('22_chmury_noc', { k: 1, w: 1, pora: 'noc', zd: CH.map(c => [c[0], c[1], c[2], 1.9]), E: 0.3, s: 0.2 });
  const Z = [['burza', 'burza', 1, 0], ['grad', 'grad', 0, 1], ['tornado', 'tornado', 2, 0], ['ptak', 'ptak', 0, 1], ['samolot', 'samolot', 0, 1], ['motolotnia', 'motolotnia', 2, 1], ['ufo', 'ufo', 1, 1]];
  for (const [n, t, k, w] of Z) { await scena('30_' + n + '_L0', { k: 1, w: 2, zd: [[t, k, w, 1.8]] }); await scena('31_' + n + '_kolor', { k: 1, w: 2, zd: [[t, k, w, 1.8]], E: 0.62, s: 0.5 }); }
  await scena('32_szpile_K3', { brama: 3, k: 1, w: 0, zd: [['szpile', 0, 1, 1.8], ['szpile', 2, 2, 2.7]], E: 0.3, s: 0.2 });
  await scena('33_latawiec_K4', { brama: 4, k: 1, w: 2, zd: [['latawiec', 0, 1, 1.8], ['latawiec', 2, 2, 2.7]], E: 0.3, s: 0.2 });
  await scena('40_poscig_jastrzab', { brama: 4, k: 1, w: 1, jastrzab: true, lot: 4.0, s: 0.1 });
  const NC = ['statek', 'satelita', 'ufo', 'samolot', 'drapieznik'];
  await scena('50_nadchmurze_L0', { k: 1, w: 0, zd: NC.map((n, i) => ['nadchmurze:' + n, [-0.2, 2.2, 1.0, 1.4, 0.1][i], [-0.4, -0.15, 0, -0.55, -0.05][i], [1.2, 1.35, 1.1, 1.6, 1.25][i]]), lot: 0.6 });
  await scena('51_nadchmurze_kolor', { k: 1, w: 0, zd: NC.map((n, i) => ['nadchmurze:' + n, [-0.2, 2.2, 1.0, 1.4, 0.1][i], [-0.4, -0.15, 0, -0.55, -0.05][i], [1.2, 1.35, 1.1, 1.6, 1.25][i]]), lot: 0.6, E: 1, s: 0.9 });
  await scena('52_nadchmurze_noc', { k: 1, w: 0, pora: 'noc', zd: NC.map((n, i) => ['nadchmurze:' + n, [-0.2, 2.2, 1.0, 1.4, 0.1][i], [-0.4, -0.15, 0, -0.55, -0.05][i], [1.2, 1.35, 1.1, 1.6, 1.25][i]]), lot: 0.6, E: 0.62, s: 0.5 });
  await scena('60_noc_bliska_chmura', { gen: true, k: 1, w: 1, pora: 'noc', lot: 3, E: 0.3, s: 0.2 });
  console.log(err.length ? 'BŁĘDY: ' + err.slice(0, 3).join(' | ') : 'bez błędów');
  await b.close();
})().catch(e => { console.error('BŁĄD ' + e); process.exit(2); });
