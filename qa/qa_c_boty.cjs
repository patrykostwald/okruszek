/* QA runda 1, punkt C: mechanika toru i trudność. Boty (idealny, 70%, 50%, losowy, bierny, stukacz) x krainy K1-K5 i Dalekie Niebo (6),
   symulacja bez rysowania (torSymuluj, krok 1/60 s), ?test&tor=1. Użycie: node qa/qa_c_boty.cjs [biegow_na_komorke] [max_s_biegu]
   Wynik: qa/wynik_c.json */
const { serwer, przegladarka, sleep, zapiszJson, fs, path } = require('./wspolne.cjs');
const N_BIEG = +(process.argv[2] || 6), MAX_S = +(process.argv[3] || 180);
const z14 = fs.readFileSync(path.join(__dirname, '..', 'gra_test_z14.cjs'), 'utf8');
const BOT_TOR = z14.slice(z14.indexOf('const BOT_TOR = `') + 17, z14.indexOf('})()`;') + 4);

/* bot parametryczny: p = szansa, że próbuje złapać wiatr danego plastra; unik = szansa poprawnego uniku przeszkody; reakcja = eta (s), od której zaczyna działać */
const BOT_P = `(function (p, unik, reakcja) {
  var last = -9, cel = null, plId = -1, chceWiatr = true, chceUnik = true;
  function wolna(ch) { return ch === '.' || 'UuDF<>ZXo'.indexOf(ch) >= 0; }
  function wiatr(ch) { return 'UuDZ<>XF'.indexOf(ch) >= 0; }
  return function (A) {
    var k = A.kom, out = {}, pl = null, i, c, r, best = null, sc, ch, g;
    for (i = 0; i < A.plastry.length; i++) if (!/^[.]+$/.test(A.plastry[i].g.join('').replace(/,/g, ''))) { pl = A.plastry[i]; break; }
    if (A.haw && A.haw.cel) { if (A.haw.cel[0] === k.kol && A.haw.cel[1] === k.wiersz && Math.random() < unik) out.ruch = [k.kol < A.COLS - 1 ? 1 : -1, 0]; }
    else if (pl && pl.eta < reakcja) {
      g = pl.g;
      if (pl.id !== plId) { plId = pl.id; cel = null; chceWiatr = Math.random() < p; chceUnik = Math.random() < unik; }
      if (!cel) {
        for (r = 0; r < A.ROWS; r++) for (c = 0; c < A.COLS; c++) {
          ch = g[r].charAt(c);
          if (!wolna(ch) && chceUnik) continue;
          if (ch === 'F' && !(c === (A.COLS - 1) / 2 && r === (A.ROWS - 1) / 2)) continue;
          sc = (wiatr(ch) && chceWiatr ? 10 : (ch === 'o' ? 4 : 0)) - Math.abs(c - k.kol) * 1.5 - Math.max(0, k.wiersz - r) * 2.5 - Math.max(0, r - k.wiersz) * 0.8 - (r === A.ROWS - 1 && !wiatr(ch) ? 1.5 : 0);
          if (!best || sc > best.sc) best = { c: c, r: r, sc: sc };
        }
        cel = best;
      }
      if (cel && A.t - last > 0.14) {
        var dc = cel.c > k.kol ? 1 : (cel.c < k.kol ? -1 : 0), dr = cel.r > k.wiersz ? 1 : 0;
        if (dc || dr) { out.ruch = [dc, dr]; last = A.t; }
        else if (cel.r < k.wiersz && pl.eta > 0.25) { if (A.t - last > 0.24) { out.stuk = 0; last = A.t; } }
      }
    }
    if (!out.ruch && out.stuk === undefined && (k.wiersz >= A.ROWS - 1 || k.p > 0.55) && A.t - last > 0.26) { out.stuk = 0; last = A.t; }
    return out;
  };
})`;
const BOT_LOS = `(function () { var nast = 0; return function (A) { if (A.t < nast) return {}; nast = A.t + 0.35 + Math.random() * 0.5; var q = Math.floor(Math.random() * 10); if (q < 8) { var D = [[1,0],[-1,0],[0,1],[1,1],[-1,1],[0,0],[1,0],[-1,0]][q]; if (q === 5) return { stuk: 0 }; return { ruch: D }; } if (q === 8) return { stuk: 0 }; return { nurkuj: true }; }; })()`;
const BOT_STUK = `(function () { var nast = 0; return function (A) { if (A.t < nast) return {}; nast = A.t + 0.7; return { stuk: 0 }; }; })()`;
const BOTY = { idealny: BOT_TOR, b70: BOT_P + '(0.7, 1, 1.4)', b50: BOT_P + '(0.5, 0.85, 1.2)', losowy: BOT_LOS, bierny: 'null', stukacz: BOT_STUK };

(async () => {
  const srv = await serwer(8734); const br = await przegladarka();
  const pg = await br.newPage({ viewport: { width: 390, height: 844 } });
  const bledy = []; pg.on('pageerror', e => bledy.push(e.message));
  await pg.goto('http://127.0.0.1:8734/?test&tor=1&seed=11'); await sleep(900);
  await pg.evaluate(() => { const O = window.__okruszek; O.pauza(true); O.panel(false); });
  const WYN = { parametry: { N_BIEG, MAX_S }, komorki: {} };
  const t0 = Date.now();
  for (const [bn, bsrc] of Object.entries(BOTY)) for (const kr of [1, 2, 3, 4, 5, 6]) {
    const r = await pg.evaluate(([bsrc, kr, N, MAXS, bn]) => {
      const O = window.__okruszek, out = [];
      for (let i = 0; i < N; i++) {
        O.ziarno(1000 + kr * 37 + i * 101); O.brama(kr); O.odblokuj(); O.ustawEnergie(null); O.bezPrzeszkod(false); O.bezPradow(false); O.nowyBieg && 0;
        const bot = (0, eval)(bsrc);
        let t = 0, pierwszyPelny = null, Emax = 0, res = null, pelnyCiag = 0, pelnyMaxCiag = 0, l4 = null, l5 = 0, poziomMax = 0;
        while (t < MAXS) {
          res = O.torSymuluj(0.25, bot, 1 / 60); t = res.graCzas;
          if (res.E >= 0.98) { if (pierwszyPelny === null) pierwszyPelny = t; pelnyCiag += 0.25; pelnyMaxCiag = Math.max(pelnyMaxCiag, pelnyCiag); } else pelnyCiag = 0;
          Emax = Math.max(Emax, res.E); poziomMax = Math.max(poziomMax, res.poziom); if (res.poziom >= 4 && l4 === null) l4 = t; if (res.poziom >= 5) l5 += 0.25;
          if (res.tryb === 'koniec' || res.tryb !== 'gra') break;
        }
        /* dokończ animację końca */
        if (res.tryb !== 'gra' && res.tryb !== 'koniec') res = O.torSymuluj(4, null, 1 / 60);
        const L = O.torLog(), zap = O.zapowiedzi ? O.zapowiedzi() : [];
        const pl = L.plastry.filter(p => !p.wstawiony);
        const zn = {}; let wiatry = 0, przeszk = 0;
        pl.forEach(p => { const seen = {}; p.g.forEach((row, rI) => row.split('').forEach((ch, cI) => { if (ch === '.') return; const key = ch + (('AaSKT'.indexOf(ch) >= 0) ? '' : rI + ',' + cI); if (seen[key]) return; seen[key] = 1; zn[ch] = (zn[ch] || 0) + 1; if ('UuDF<>ZX'.indexOf(ch) >= 0) wiatry++; else przeszk++; })); });
        /* najdłuższy odcinek bez niepustego plastra (s, po 20 s nauki) */
        const kontakty = pl.filter(p => p.tKontakt !== null).map(p => p.tKontakt).sort((a, b) => a - b);
        let luka = 0; for (let j = 1; j < kontakty.length; j++) if (kontakty[j - 1] > 20) luka = Math.max(luka, kontakty[j] - kontakty[j - 1]);
        /* zapowiedź: czas od pokazania plastra do kontaktu (min, dla niepustych z przeszkodą) */
        const zapCz = pl.filter(p => p.czas !== null && /[^.UuDF<>ZXo]/.test(p.g.join('').replace(/,/g, ''))).map(p => p.czas);
        out.push({ czas: +t.toFixed(1), m: Math.round(res.dystans), koniec: res.koniec, konce: L.konce.map(k => k.typ), pierwszyPelny: pierwszyPelny === null ? null : +pierwszyPelny.toFixed(1), Emax: +Emax.toFixed(2), pelnyMaxCiag, poziomMax, l4: l4 === null ? null : +l4.toFixed(1), l5s: l5,
          wejscia: L.wejscia.length, idealne: L.wejscia.filter(e => e.idealne).length, poza_srodkiem: L.wejscia.filter(e => e.efekt === 'poza_srodkiem').length, kary: L.kontakty.filter(e => e.efekt === 'kara').length,
          karyTypy: L.kontakty.filter(e => e.efekt === 'kara').reduce((a, e) => (a[e.znak] = (a[e.znak] || 0) + 1, a), {}),
          plastrow: pl.length, nieuczciwe: L.nieuczciwe, naprawy: L.naprawy, wiatry, przeszk, znaki: zn, luka: +luka.toFixed(1), zapMin: zapCz.length ? +Math.min(...zapCz).toFixed(2) : null,
          ataki: L.ataki.map(a => a.typ + ':' + a.wynik), machniecia: L.machniecia, wzloty: L.wzloty, nurkowania: L.nurkowania, kraina: O.kraina().kraina, pora: +O.pora().toFixed(2), widowiska: L.widowiska });
      }
      return out;
    }, [bsrc, kr, N_BIEG, MAX_S, bn]);
    WYN.komorki[bn + '_K' + kr] = r;
    const med = (a) => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : null; };
    const pp = r.filter(x => x.pierwszyPelny !== null && x.pierwszyPelny <= 60).length;
    console.log(bn, 'K' + kr, 'czas med', med(r.map(x => x.czas)), 'pelny<=60s', pp + '/' + r.length, 'Emax med', med(r.map(x => x.Emax)), 'konce', r.map(x => x.koniec).join(','), 'kary/min', (r.reduce((a, x) => a + x.kary, 0) / r.reduce((a, x) => a + x.czas, 0) * 60).toFixed(1), 'nieucz', r.reduce((a, x) => a + x.nieuczciwe, 0), ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  WYN.bledy = bledy;
  zapiszJson('wynik_c.json', WYN);
  await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
