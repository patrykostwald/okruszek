/* QA runda 1, D/C: jak wyglądają przeszkody i wiatry toru w chwili zapowiedzi (ok. 1,5 s przed kontaktem) i tuż przed kontaktem (ok. 0,5 s),
   w komórce Okruszka (środek) i w sąsiedniej (prawo-dół), dzień L0 i noc L2. Zrzuty qa/zrzuty/D7-*.png */
const { serwer, przegladarka, sleep, ZRZUTY, path, zapiszJson } = require('./wspolne.cjs');
const TYPY = ['chmura:biala', 'chmura:lawenda', 'chmura:szara', 'chmura:fiolet', 'chmura:zielona_mgla', 'chmura:oaza', 'burza', 'grad', 'tornado', 'ptak', 'samolot', 'motolotnia', 'ufo', 'szpile', 'latawiec', 'wiatr:gora', 'wiatr:wprost', 'wiatr:lewo', 'wiatr:zjazd', 'wiatr:dol'];
(async () => {
  const srv = await serwer(8737); const br = await przegladarka();
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage(); await pg.goto('http://127.0.0.1:8737/?test&tor=1&seed=5'); await sleep(900);
  await pg.evaluate(() => { window.__okruszek.z11Zbuduj(); window.__okruszek.torSprite(); });
  const out = {};
  for (const [pora, L] of [['dzien', 0], ['noc', 2]]) for (const typ of TYPY) for (const eta of [1.5, 0.5]) {
    const r = await pg.evaluate(([typ, pora, L, eta]) => {
      const O = window.__okruszek; O.tempo(1); O.pauza(true); O.panel(false); O.ziarno(5); O.brama(5); O.odblokuj(); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg();
      O.ustawPore(pora); O.ustawPoziom(L); O.idz(1, 1, true);
      const sp = O.tor().sp; const kol = typ === 'wiatr:wprost' ? 1 : 1, w = typ === 'samolot' ? 1 : 1;
      O.zdarzenie(typ, { k: kol, w, z: 0.7 + sp * eta });
      return { sp };
    }, [typ, pora, L, eta]);
    await pg.evaluate(() => { const O = window.__okruszek; O.tempo(0.001); O.pauza(false); }); await sleep(250);
    const nm = 'D7-' + pora + 'L' + L + '-' + typ.replace(':', '_') + '-eta' + eta;
    await pg.screenshot({ path: path.join(ZRZUTY, nm + '.png'), clip: { x: 0, y: 150, width: 390, height: 560 } });
    out[nm] = r;
  }
  zapiszJson('wynik_d2.json', out);
  await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
