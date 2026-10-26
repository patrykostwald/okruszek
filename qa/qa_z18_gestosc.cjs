/* Z18: gęstość toru wg poziomu (L0-L5) i krainy: komórki wiatrów i przeszkód na minutę (z plastrów, które doleciały do Okruszka), porównanie z tabelą 4.2 x GEST_SKALA.
   Użycie: node qa/qa_z18_gestosc.cjs <etykieta> [bot=idealny] [biegow=3] [max_s=300] [port] */
const { serwer, przegladarka, sleep, zapiszJson } = require('./wspolne.cjs');
const { zrodlo } = require('./boty_z18.cjs');
const ET = process.argv[2] || 'g', BOTN = process.argv[3] || 'idealny', N = +(process.argv[4] || 3), MAXS = +(process.argv[5] || 300), PORT = +(process.argv[6] || 8781);
const TAB = { L0: [11, 6, 13, 9, 15, 13, 16, 15, 17, 17, 18, 20], L1: [16, 12, 18, 17, 21, 23, 22, 26, 23, 30, 23, 34], L2: [22, 21, 24, 28, 27, 37, 28, 42, 30, 49, 31, 55], L3: [25, 32, 27, 42, 30, 55, 30, 63, 31, 72, 32, 81], L4: [25, 43, 27, 56, 29, 73, 30, 85, 29, 93, 30, 107], L5: [24, 20, 27, 27, 31, 37, 33, 43, 34, 48, 36, 56] };
(async () => {
  const srv = await serwer(PORT); const br = await przegladarka(); const pg = await br.newPage();
  await pg.goto('http://127.0.0.1:' + PORT + '/?test&tor=1&seed=11'); await sleep(900);
  const AGG = {};
  for (const kr of [1, 2, 3, 4, 5, 6]) for (let i = 0; i < N; i++) {
    const seed = 2000 + kr * 41 + i * 97, src = zrodlo(BOTN, seed + 3);
    const r = await pg.evaluate(([src, kr, seed, MAXS]) => { const O = window.__okruszek; O.pauza(true); O.panel(false); O.ziarno(seed); O.brama(kr); O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false);
      const bot = src === 'null' ? null : (0, eval)(src); let t = 0, res, cz = [0, 0, 0, 0, 0, 0], W = [0, 0, 0, 0, 0, 0], P = [0, 0, 0, 0, 0, 0], S2 = [0, 0, 0, 0, 0, 0], seen = {}, pusteN = [0,0,0,0,0,0], plN = [0,0,0,0,0,0];
      while (t < MAXS) { res = O.torSymuluj(0.5, bot, 1 / 60); t = res.graCzas; if (t > 20) cz[res.poziom] += 0.5;
        const L = O.torLog(); L.plastry.forEach(p => { if (p.tKontakt === null || seen[p.id + ':' + p.tKontakt] || p.wstawiony || p.tKontakt < 20) return; seen[p.id + ':' + p.tKontakt] = 1; const lv = p.poziom; plN[lv]++; const g = p.g.join(''); if (!/[^.]/.test(g)) pusteN[lv]++;
          const cnt = {}; p.g.forEach((row, rI) => row.split('').forEach((ch, cI) => { if (ch === '.') return; const key = ch + (('AaSKT'.indexOf(ch) >= 0) ? '' : rI + ',' + cI); if (cnt[key]) return; cnt[key] = 1; if ('UuDF<>ZX'.indexOf(ch) >= 0) W[lv]++; else { P[lv]++; if ('fBHT'.indexOf(ch) >= 0) S2[lv]++; } })); });
        if (res.tryb !== 'gra') break; }
      return { cz, W, P, S2, pusteN, plN }; }, [src, kr, seed, MAXS]);
    const a = AGG[kr] = AGG[kr] || { cz: [0, 0, 0, 0, 0, 0], W: [0, 0, 0, 0, 0, 0], P: [0, 0, 0, 0, 0, 0], S2: [0, 0, 0, 0, 0, 0], pusteN: [0,0,0,0,0,0], plN: [0,0,0,0,0,0] };
    for (const k of ['cz', 'W', 'P', 'S2', 'pusteN', 'plN']) for (let l = 0; l < 6; l++) a[k][l] += r[k][l];
  }
  const OUT = {};
  for (const kr of [1, 2, 3, 4, 5, 6]) { const a = AGG[kr]; OUT['K' + kr] = {}; let line = 'K' + kr + ' ';
    for (let l = 0; l < 6; l++) { if (a.cz[l] < 20) { line += ' L' + l + ': -        '; continue; } const w = a.W[l] / a.cz[l] * 60, p = a.P[l] / a.cz[l] * 60, s2 = a.S2[l] / a.cz[l] * 60, tw = TAB['L' + l][(kr - 1) * 2] * 0.75, tp = TAB['L' + l][(kr - 1) * 2 + 1] * 0.75;
      OUT['K' + kr]['L' + l] = { czas: a.cz[l], wiatryMin: +w.toFixed(1), przeszkodyMin: +p.toFixed(1), s2Min: +s2.toFixed(2), puste: +(a.pusteN[l] / Math.max(1, a.plN[l])).toFixed(2), celW: tw, celP: tp };
      line += ' L' + l + ': ' + w.toFixed(0) + '/' + p.toFixed(0) + ' (' + tw.toFixed(0) + '/' + tp.toFixed(0) + ')'; }
    console.log(line); }
  zapiszJson('wynik_z18_gestosc_' + ET + '.json', OUT);
  await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
