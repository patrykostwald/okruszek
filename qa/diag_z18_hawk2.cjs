const { serwer, przegladarka, sleep } = require('./wspolne.cjs');
const { zrodlo } = require('./boty_z18.cjs');
(async () => {
  const srv = await serwer(8772); const br = await przegladarka(); const pg = await br.newPage();
  await pg.goto('http://127.0.0.1:8772/?test&tor=1&seed=11'); await sleep(900);
  const kr = 6, seed = 1222, src = zrodlo('idealny', seed + 7);
  const r = await pg.evaluate(([src, kr, seed]) => { const O = window.__okruszek; O.pauza(true); O.panel(false); O.ziarno(seed); O.brama(kr); O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false);
    const b0 = (0, eval)(src); const log = []; const bot = (A) => { const o = b0(A); if (A.haw && A.haw.cel && A.haw.cel[2] > 0.9) log.push([+A.t.toFixed(2), A.kom.kol, A.kom.wiersz, JSON.stringify(A.haw.cel.map(x=>+(+x).toFixed(2))), JSON.stringify(o), A.plastry[0] ? A.plastry[0].g.join('/') + '@' + A.plastry[0].eta.toFixed(2) : '']); return o; };
    let t = 0, res; while (t < 70) { res = O.torSymuluj(1/60, bot, 1/60); t = res.graCzas; if (res.tryb !== 'gra') break; }
    return log.slice(-30); }, [src, kr, seed]);
  r.forEach(x => console.log(x.join(' ')));
  await br.close(); srv.close();
})();
