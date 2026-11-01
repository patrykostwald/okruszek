/* Z18 (P0-4): czytelność przeszkody przed kontaktem. Szara chmura w komórce Okruszka (1,1) i w komórce prawo-dół (2,2), dzień L0, 390 x 844;
   dla eta 2,5 / 1,5 / 1,0 / 0,5 s: skala rysunku, szerokość chmury na ekranie (px), odległość od ptaszka w pionie, odstęp sąsiednich kolumn; zrzuty do katalogu (arg 2).
   Użycie: node qa/qa_z18_czytelnosc.cjs <etykieta> [katalog_zrzutow] [port] */
const { serwer, przegladarka, sleep, zapiszJson, path, fs } = require('./wspolne.cjs');
const ET = process.argv[2] || 'po', DIR = process.argv[3] || '', PORT = +(process.argv[4] || 8790);
(async () => {
  const srv = await serwer(PORT); const br = await przegladarka();
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage(); await pg.goto('http://127.0.0.1:' + PORT + '/?test&tor=1&seed=5'); await sleep(900);
  await pg.evaluate(() => { window.__okruszek.torSprite(); });
  if (DIR) fs.mkdirSync(DIR, { recursive: true });
  const out = [];
  for (const eta of [2.5, 1.5, 1.0, 0.5]) {
    const r = await pg.evaluate((eta) => {
      const O = window.__okruszek; O.tempo(1); O.pauza(true); O.ziarno(5); O.brama(1); O.odblokuj(); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.ustawPore('dzien'); O.ustawPoziom(0); O.idz(1, 1, true);
      O.torSymuluj(0.6); O.idz(1, 1, true); const sp = O.tor().sp;
      O.zdarzenie('chmura:szara', { k: 1, w: 1, z: 0.7 + sp * eta }); O.zdarzenie('chmura:lawenda', { k: 2, w: 2, z: 0.7 + sp * eta + 0.001 });
      const G = O.gdzie(), a = G.find(x => x.typ === 'chmura:szara'), b = G.find(x => x.typ === 'chmura:lawenda'), p = G.find(x => x.typ === 'okruszek'), T = O.tor();
      const sk = a.skala !== undefined ? a.skala : 0.7 / a.z;
      return { eta, sp: +sp.toFixed(2), skala: +sk.toFixed(2), szerChmury: Math.round(T.CW * 1.25 * sk / 0.7), dyOdPtaszka: Math.round(p.ey - a.ey), odstepKolumn: Math.round(Math.abs(b.ex - a.ex)), chmura: [Math.round(a.ex), Math.round(a.ey)], ptak: [Math.round(p.ex), Math.round(p.ey)] };
    }, eta);
    if (DIR) { await pg.evaluate(() => { const O = window.__okruszek; O.tempo(0.001); O.pauza(false); }); await sleep(250); await pg.screenshot({ path: path.join(DIR, 'czytelnosc-eta' + eta + '.png') }); }
    out.push(r); console.log(JSON.stringify(r));
  }
  zapiszJson('wynik_z18_czytelnosc_' + ET + '.json', out); await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
