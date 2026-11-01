const { serwer, przegladarka, sleep } = require('./wspolne.cjs');
const { zrodlo } = require('./boty_z18.cjs');
(async () => {
  const srv = await serwer(8798); const br = await przegladarka(); const pg = await br.newPage();
  await pg.goto('http://127.0.0.1:8798/?test&tor=1&seed=11'); await sleep(900);
  for (const bn of ['idealny', 'b70']) {
    const r = await pg.evaluate((src) => { const O = window.__okruszek; O.pauza(true); O.panel(false); const out = [];
      for (let i = 0; i < 12; i++) { O.ziarno(5000 + i * 13); O.brama(1 + (i % 6)); O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false); const bot = (0, eval)(src.replace('SEED', 21 + i)); let t = 0, seen = {}, kont = [], hawT = [];
        while (t < 300) { const res = O.torSymuluj(0.5, bot, 1/60); t = res.graCzas; const st = O.stan(); if (st.jastrzab) hawT.push(t); O.torLog().plastry.forEach(p => { if (p.tKontakt !== null && !seen[p.id] && /[^.]/.test(p.g.join(''))) { seen[p.id] = 1; kont.push(p.tKontakt); } }); if (res.tryb !== 'gra') break; }
        kont.sort((a, b) => a - b); let mx = 0, at = 0; for (let j = 1; j < kont.length; j++) if (kont[j - 1] > 25 && kont[j] - kont[j - 1] > mx) { mx = kont[j] - kont[j - 1]; at = kont[j - 1]; }
        out.push([+mx.toFixed(2), +at.toFixed(1), hawT.some(h => Math.abs(h - at) < 3)]); }
      return out; }, zrodlo(bn, 'SEED'));
    console.log(bn, JSON.stringify(r));
  }
  await br.close(); srv.close();
})();
