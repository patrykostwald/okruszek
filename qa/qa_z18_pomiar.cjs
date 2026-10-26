/* Z18: pomiar celów strojenia toru botami (deterministyczne ziarna). Użycie:
   node qa/qa_z18_pomiar.cjs <etykieta> [boty=idealny,b70,b50,losowy,bierny,stukacz,nurek] [krainy=1,2,3,4,5,6] [biegow=4] [max_s=300] [port=8761]
   Wynik: qa/wynik_z18_<etykieta>.json i podsumowanie w konsoli. */
const { serwer, przegladarka, sleep, zapiszJson } = require('./wspolne.cjs');
const { zrodlo } = require('./boty_z18.cjs');
const ET = process.argv[2] || 'pomiar';
const BOTY = (process.argv[3] || 'idealny,b70,b50,losowy,bierny,stukacz,nurek').split(',');
const KR = (process.argv[4] || '1,2,3,4,5,6').split(',').map(Number);
const N = +(process.argv[5] || 4), MAXS = +(process.argv[6] || 300), PORT = +(process.argv[7] || 8761);

(async () => {
  const srv = await serwer(PORT); const br = await przegladarka();
  const pg = await br.newPage({ viewport: { width: 390, height: 844 } });
  const bledy = []; pg.on('pageerror', e => bledy.push(e.message));
  await pg.goto('http://127.0.0.1:' + PORT + '/?test&tor=1&seed=11'); await sleep(900);
  await pg.evaluate(() => { const O = window.__okruszek; O.pauza(true); O.panel(false); });
  const WYN = { etykieta: ET, parametry: { N, MAXS, KR }, boty: {} }, t0 = Date.now();
  for (const bn of BOTY) {
    const runs = [];
    for (const kr of KR) for (let i = 0; i < N; i++) {
      const seed = 1000 + kr * 37 + i * 101, src = zrodlo(bn, seed + 7);
      const r = await pg.evaluate(([src, kr, seed, MAXS]) => {
        const O = window.__okruszek;
        O.ziarno(seed); O.brama(kr); O.odblokuj(); O.ustawEnergie(null); O.bezPrzeszkod(false); O.bezPradow(false);
        const bot = src === 'null' ? null : (0, eval)(src);
        let t = 0, res = null, pierwszyPelny = null, pelny60 = 0, czasL = [0, 0, 0, 0, 0, 0], wiersze = [0, 0, 0, 0], prevW = 1, prevWl = 0, nadch = { wiatr: 0, inne: 0 }, l4 = null, Emax = 0;
        while (t < MAXS) {
          res = O.torSymuluj(0.25, bot, 1 / 60); t = res.graCzas;
          if (res.E >= 0.98 && pierwszyPelny === null) pierwszyPelny = t;
          if (t <= 60.01) pelny60 = res.pelnyKolor.lacznie;
          czasL[res.poziom] += 0.25; wiersze[res.kom.wiersz] += 0.25; Emax = Math.max(Emax, res.E);
          if (res.poziom >= 4 && l4 === null) l4 = t;
          if (res.kom.wiersz === 0 && prevW !== 0) { if (res.wloty > prevWl) nadch.wiatr++; else nadch.inne++; }
          prevW = res.kom.wiersz; prevWl = res.wloty;
          if (res.tryb !== 'gra') break;
        }
        if (res.tryb !== 'gra' && res.tryb !== 'koniec') O.torSymuluj(4, null, 1 / 60);
        const L = O.torLog();
        const wej = L.wejscia.filter(e => e.efekt === 'przerzut');
        let lanMax = 0; wej.forEach(e => { lanMax = Math.max(lanMax, e.lancuchPo || 0); });
        return { t: +t.toFixed(1), koniec: res.koniec || (res.tryb === 'gra' ? null : res.tryb), konce: L.konce.map(k => k.typ), pierwszyPelny, pelny60: +pelny60.toFixed(2), pelnyLacznie: +res.pelnyKolor.lacznie.toFixed(2), pelnyMax: +res.pelnyKolor.max.toFixed(2),
          czasL: czasL, l4, l5: czasL[5], hiper: res.hiperRazy, wiersze, nadch, wejscia: wej.length, idealne: wej.filter(e => e.idealne).length, lanMax, kary: L.kontakty.filter(e => e.efekt === 'kara').length,
          ataki: L.ataki.map(a => a.wynik), m: Math.round(res.dystans), Emax: +Emax.toFixed(2), poziomMax: res.poziomMax, l5bez: res.l5bezLancucha };
      }, [src, kr, seed, MAXS]);
      r.kr = kr; r.seed = seed; runs.push(r);
    }
    WYN.boty[bn] = runs;
    const med = (a) => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : null; };
    const n = runs.length, sum = (f) => runs.reduce((x, y) => x + f(y), 0);
    const S = {
      biegow: n, czasMed: med(runs.map(x => x.t)), konceDo60: runs.filter(x => x.koniec && x.t <= 60).length, konceDo180: runs.filter(x => x.koniec && x.t <= 180).length, konceDo300: runs.filter(x => x.koniec && x.t <= 300).length, przezyl: runs.filter(x => !x.koniec).length,
      konce: runs.reduce((a, x) => { const k = x.koniec || 'brak'; a[k] = (a[k] || 0) + 1; return a; }, {}),
      pelnyDo60: runs.filter(x => x.pierwszyPelny !== null && x.pierwszyPelny <= 60).length, pelny60max: Math.max(...runs.map(x => x.pelny60)), pelny60ponad2: runs.filter(x => x.pelny60 > 2).length,
      pierwszyPelnyMed: med(runs.filter(x => x.pierwszyPelny !== null).map(x => x.pierwszyPelny)), pelnyMaxCiag: Math.max(...runs.map(x => x.pelnyMax)),
      l4biegi: runs.filter(x => x.l4 !== null).length, l4do60: runs.filter(x => x.l4 !== null && x.l4 <= 60).length, czasL4: +sum(x => x.czasL[4]).toFixed(1), l5s: +sum(x => x.l5).toFixed(1), hiper: sum(x => x.hiper), l5bez: sum(x => x.l5bez),
      idealneProc: +(100 * sum(x => x.idealne) / Math.max(1, sum(x => x.wejscia))).toFixed(1), wejscMin: +(sum(x => x.wejscia) / Math.max(1, sum(x => x.t)) * 60).toFixed(1), lanMax: Math.max(...runs.map(x => x.lanMax)),
      nadchProc: +(100 * sum(x => x.wiersze[0]) / Math.max(1, sum(x => x.t))).toFixed(1), nadchWejscia: { wiatr: sum(x => x.nadch.wiatr), inne: sum(x => x.nadch.inne) }, przezyl300: runs.filter(x => !x.koniec && x.t >= 299).length,
      karyMin: +(sum(x => x.kary) / Math.max(1, sum(x => x.t)) * 60).toFixed(2)
    };
    WYN['podsumowanie_' + bn] = S;
    console.log(bn.padEnd(8), JSON.stringify(S), ((Date.now() - t0) / 1000).toFixed(0) + ' s');
  }
  WYN.bledy = bledy;
  zapiszJson('wynik_z18_' + ET + '.json', WYN);
  if (bledy.length) console.log('BLEDY', bledy.slice(0, 3));
  await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
