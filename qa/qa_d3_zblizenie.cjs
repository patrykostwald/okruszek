/* QA D: ta sama chmura (szara) w komórce Okruszka i w komórce obok, sekwencja eta 2.5 .. 0.05 s, dzień L0; mierzy wielkość na ekranie (gdzie().ex/ey) */
const { serwer, przegladarka, sleep, ZRZUTY, path, zapiszJson } = require('./wspolne.cjs');
(async () => {
  const srv = await serwer(8738); const br = await przegladarka();
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage(); await pg.goto('http://127.0.0.1:8738/?test&tor=1&seed=5'); await sleep(900);
  await pg.evaluate(() => { window.__okruszek.torSprite(); });
  const out = [];
  for (const [k, w] of [[1, 1], [2, 2], [0, 0]]) for (const eta of [2.5, 1.5, 1.0, 0.5, 0.25, 0.08]) {
    const r = await pg.evaluate(([k, w, eta]) => { const O = window.__okruszek; O.tempo(1); O.pauza(true); O.ziarno(5); O.brama(1); O.odblokuj(); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.ustawPore('dzien'); O.ustawPoziom(0); O.idz(1, 1, true); const sp = O.tor().sp; O.zdarzenie('chmura:szara', { k, w, z: 0.7 + sp * eta }); const g = O.gdzie().find(x => x.typ === 'chmura:szara'), b = O.gdzie().find(x => x.typ === 'okruszek'); return { k, w, eta, ex: Math.round(g.ex), ey: Math.round(g.ey), z: +g.z.toFixed(2), skala: +(0.7 / g.z).toFixed(2), ptak: [Math.round(b.ex), Math.round(b.ey)], CW: O.tor().CW }; }, [k, w, eta]);
    await pg.evaluate(() => { const O = window.__okruszek; O.tempo(0.001); O.pauza(false); }); await sleep(200);
    await pg.screenshot({ path: path.join(ZRZUTY, 'D8-k' + k + 'w' + w + '-eta' + eta + '.png') });
    out.push(r); console.log(JSON.stringify(r));
  }
  zapiszJson('wynik_d3.json', out); await br.close(); srv.close();
})();
