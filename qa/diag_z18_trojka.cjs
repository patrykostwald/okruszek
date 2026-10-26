const { serwer, przegladarka, sleep } = require('./wspolne.cjs');
const { zrodlo } = require('./boty_z18.cjs');
const [ZI, BR, SB, BOTN] = [+process.argv[2], +process.argv[3], +process.argv[4], process.argv[5] || 'idealny'];
(async () => {
  const srv = await serwer(8813); const br = await przegladarka(); const pg = await br.newPage();
  await pg.goto('http://127.0.0.1:8813/?test&tor=1&seed=11'); await sleep(900);
  const r = await pg.evaluate(([src, ZI, BR]) => { const O = window.__okruszek; O.pauza(true); O.panel(false); O.ziarno(ZI); O.brama(BR); O.odblokuj(); O.ustawEnergie(null); O.bezPrzeszkod(false); O.bezPradow(false); const bot = (0, eval)(src); let t = 0;
    while (t < 62) { const res = O.torSymuluj(0.25, bot, 1/60); t = res.graCzas; if (res.tryb !== 'gra') break; }
    const L = O.torLog(); return { w: L.wejscia.filter(e => e.t > 18).map(e => [e.t.toFixed(1), e.znak, e.k + ',' + e.w, e.idealne ? 'I' : '-', e.odch, e.lancuchPo, e.efekt]), pl: L.plastry.filter(p => p.tSpawn > 15 && p.tSpawn < 40).map(p => [p.tSpawn.toFixed(1), p.tKontakt && p.tKontakt.toFixed(1), p.wz, p.g.join('/')]) }; }, [zrodlo(BOTN, SB), ZI, BR]);
  console.log(r.w.map(x => x.join(' ')).join('\n')); console.log('---'); console.log(r.pl.map(x => x.join(' ')).join('\n'));
  await br.close(); srv.close();
})();
