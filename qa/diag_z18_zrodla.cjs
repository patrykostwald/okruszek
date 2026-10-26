const { serwer, przegladarka, sleep } = require('./wspolne.cjs');
const { zrodlo } = require('./boty_z18.cjs');
(async () => {
  const srv = await serwer(8773); const br = await przegladarka(); const pg = await br.newPage();
  await pg.goto('http://127.0.0.1:8773/?test&tor=1&seed=11'); await sleep(900);
  const r = await pg.evaluate((src) => { const O = window.__okruszek; O.pauza(true); O.panel(false); const agg = {}, cz = {};
    for (let i = 0; i < 4; i++) { O.ziarno(3000 + i); O.brama(1 + i); O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false); const bot = (0, eval)(src); let t = 0, seen = {};
      while (t < 200) { const res = O.torSymuluj(0.5, bot, 1/60); t = res.graCzas; if (t > 20) cz[res.poziom] = (cz[res.poziom] || 0) + 0.5;
        O.torLog().plastry.forEach(p => { if (seen[p.id] || p.tSpawn < 20) return; seen[p.id] = 1; const nW = p.g.join('').replace(/[^UuDF<>ZX]/g, '').length; if (!nW) return; const k = 'L' + p.poziom + ':' + (p.wz || '?').replace(/^w\d+$/, 'wzor').replace(/^ucz\d*$/, 'ucz') + ':' + p.faza; agg[k] = (agg[k] || 0) + nW; });
        if (res.tryb !== 'gra') break; } }
    return { agg, cz }; }, zrodlo('idealny', 5));
  console.log(JSON.stringify(r.cz)); Object.keys(r.agg).sort().forEach(k => console.log(k, r.agg[k]));
  await br.close(); srv.close();
})();
