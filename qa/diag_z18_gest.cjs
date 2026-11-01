const { serwer, przegladarka, sleep } = require('./wspolne.cjs');
const { zrodlo } = require('./boty_z18.cjs');
(async () => {
  const srv = await serwer(8774); const br = await przegladarka(); const pg = await br.newPage();
  await pg.goto('http://127.0.0.1:8774/?test&tor=1&seed=11'); await sleep(900);
  const r = await pg.evaluate((src) => { const O = window.__okruszek; O.pauza(true); O.panel(false); O.ziarno(3000); O.brama(1); O.odblokuj(); const bot = (0, eval)(src); const out = []; let t = 0;
    while (t < 120) { const res = O.torSymuluj(5, bot, 1/60); t = res.graCzas; const g = O.torGest(); out.push([Math.round(t), res.poziom, g.cel.w.toFixed(1), g.tempo.w.toFixed(1), g.cel.p.toFixed(1), g.tempo.p.toFixed(1), g.log].join(' ')); } return out; }, zrodlo('idealny', 5));
  console.log(r.join('\n')); await br.close(); srv.close();
})();
