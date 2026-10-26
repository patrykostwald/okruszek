const { serwer, przegladarka, sleep } = require('./wspolne.cjs');
const { zrodlo } = require('./boty_z18.cjs');
const [ZI, BR, OD, DO, SEEDB] = process.argv.slice(2).map(Number);
(async () => {
  const srv = await serwer(8812); const br = await przegladarka(); const pg = await br.newPage();
  await pg.goto('http://127.0.0.1:8812/?test&tor=1&seed=11'); await sleep(900);
  const r = await pg.evaluate(([src, ZI, BR, OD, DO]) => { const O = window.__okruszek; O.pauza(true); O.panel(false); O.ziarno(ZI); O.brama(BR); O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false); const bot = (0, eval)(src); let t = 0, st = [];
    while (t < DO + 8) { const res = O.torSymuluj(0.5, bot, 1/60); t = res.graCzas; const s = O.stan(); if (t > OD && t < DO + 8) st.push([t.toFixed(1), res.s.toFixed(2), s.jastrzab ? s.jastrzab.faza : '-', O.kraina().kraina, res.kom.wiersz]); if (res.tryb !== 'gra') break; }
    return { pl: O.torLog().plastry.filter(p => p.tSpawn > OD - 4 && p.tSpawn < DO + 2).map(p => [p.tSpawn.toFixed(1), p.tKontakt && p.tKontakt.toFixed(1), p.wz, p.faza, p.g.join('/'), p.s]), st }; }, [zrodlo('idealny', SEEDB), ZI, BR, OD, DO]);
  r.pl.forEach(x => console.log(x.join(' '))); console.log(r.st.filter((x, i) => i % 2 === 0).map(x => x.join(':')).join(' '));
  await br.close(); srv.close();
})();
