const { serwer, przegladarka, sleep } = require('./wspolne.cjs');
const { zrodlo } = require('./boty_z18.cjs');
(async () => {
  const srv = await serwer(8776); const br = await przegladarka(); const pg = await br.newPage();
  await pg.goto('http://127.0.0.1:8776/?test&tor=1&seed=11'); await sleep(900);
  for (const bn of (process.argv[2] || 'idealny,b50').split(',')) {
    const r = await pg.evaluate((src) => { const O = window.__okruszek; O.pauza(true); O.panel(false); const all = [];
      for (let i = 0; i < 6; i++) { O.ziarno(4000 + i); O.brama(1 + i); O.odblokuj(); const bot = (0, eval)(src.replace('SEED', 11 + i)); let t = 0; while (t < 200) { const res = O.torSymuluj(1, bot, 1/60); t = res.graCzas; if (res.tryb !== 'gra') break; } O.torLog().wejscia.filter(e => e.t > 20 && e.efekt === 'przerzut').forEach(e => all.push([e.odch, e.dx, e.lancuchPrzed, e.idealne])); }
      return all; }, zrodlo(bn, 'SEED'));
    const H = {}; r.forEach(([o, dx]) => { const b = Math.max(-0.4, Math.min(0.4, Math.round(o / 0.04) * 0.04)).toFixed(2); H[b] = (H[b] || 0) + 1; });
    console.log(bn, r.length, 'idealne', r.filter(x => x[3]).length, 'dx>0.24', r.filter(x => Math.abs(x[1]) >= 0.24).length);
    console.log(Object.keys(H).sort((a, b) => a - b).map(k => k + ':' + H[k]).join(' '));
  }
  await br.close(); srv.close();
})();
