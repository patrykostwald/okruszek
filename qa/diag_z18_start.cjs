const { serwer, przegladarka, sleep } = require('./wspolne.cjs');
const { zrodlo } = require('./boty_z18.cjs');
(async () => {
  const srv = await serwer(8775); const br = await przegladarka(); const pg = await br.newPage();
  await pg.goto('http://127.0.0.1:8775/?test&tor=1&seed=11'); await sleep(900);
  const r = await pg.evaluate((src) => { const O = window.__okruszek; O.pauza(true); O.panel(false); O.ziarno(1074); O.brama(1); O.odblokuj(); O.ustawEnergie(null); const bot = (0, eval)(src); const out = []; let t = 0;
    while (t < 12) { const res = O.torSymuluj(0.25, bot, 1/60); t = res.graCzas; out.push([t.toFixed(2), res.E.toFixed(2), res.s.toFixed(2), res.poziom, res.kom.kol + ',' + res.kom.wiersz, O.lancuch().n, res.wloty, res.idealnych].join(' ')); }
    return { out, wej: O.torLog().wejscia.map(e => [e.t.toFixed(2), e.znak, e.idealne, e.lancuchPo].join(':')) }; }, zrodlo('idealny', 5));
  console.log(r.out.join('\n')); console.log(r.wej.join(' ')); await br.close(); srv.close();
})();
