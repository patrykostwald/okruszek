const { serwer, przegladarka, sleep } = require('./wspolne.cjs');
const { zrodlo } = require('./boty_z18.cjs');
(async () => {
  const srv = await serwer(8771); const br = await przegladarka(); const pg = await br.newPage();
  await pg.goto('http://127.0.0.1:8771/?test&tor=1&seed=11'); await sleep(900);
  for (const kr of [1,2,3,4,5,6]) for (let i = 0; i < 4; i++) {
    const seed = 1000 + kr * 37 + i * 101, src = zrodlo(process.argv[2] || 'idealny', seed + 7);
    const r = await pg.evaluate(([src, kr, seed]) => { const O = window.__okruszek; O.pauza(true); O.panel(false); O.ziarno(seed); O.brama(kr); O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false);
      const bot = (0, eval)(src); let t = 0, res, hist = [];
      while (t < 300) { res = O.torSymuluj(1/60, bot, 1/60); t = res.graCzas; const st = O.stan(); if (st.jastrzab && st.jastrzab.faza === 'poscig') hist.push([+t.toFixed(2), res.kom.kol, res.kom.wiersz, JSON.stringify(O.torLog().ataki.slice(-1)[0] || null)]); if (hist.length > 400) hist.shift(); if (res.tryb !== 'gra') break; }
      return { t, koniec: res.tryb, ataki: O.torLog().ataki.slice(-3), hist: hist.slice(-40) }; }, [src, kr, seed]);
    if (r.koniec !== 'gra') { console.log('K' + kr, seed, r.t.toFixed(1), JSON.stringify(r.ataki)); console.log(r.hist.filter((x,i)=>i%3===0).map(x=>x.slice(0,3).join(',')).join(' | ')); }
  }
  await br.close(); srv.close();
})();
