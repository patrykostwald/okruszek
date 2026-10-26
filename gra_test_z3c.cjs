/* Okruszek Z3c: testy Playwright. Użycie: node gra_test_z3c.cjs [plik.html]
   Pełny kolor tylko po trzech przyspieszeniach z rzędu (PROJEKT.md sekcja 14): energia koloru E.
   (a) hak Z3c i stałe w G
   (b) model E w symulacji bez rysowania (deterministycznie, jeden evaluate = brak klatek pośrednich): 1/2/3 idealne wejścia -> E 0,30 / 0,62 / 1,0,
       okno łańcucha CHAIN_W, brzeg prądu (mały skok, bez łańcucha), nauka na starcie (szersze idealne wejście), nurkowanie samo najwyżej E_NURK, zanik (łaska i FALL_E),
       rozkwit 1,0-1,4 s, kolizja zabiera kolor
   (c) boty (symulacja): idealny osiąga E = 1 w 60 s gry; bot "50% prądów" trójka z rzędu <= 15% serii i pełny kolor <= 2 s na trójkę; bot losowy i bierny nigdy E = 1;
       L5 (hiper) rzadszy niż pełny kolor; geometria serii (zygzak, nie na jednej prostej)
   (d) kolor na klatkach: kolejność niebo >= daleko >= blisko >= smugi przy E = 0, 0,3, 0,62, 1 o każdej porze doby, także w trakcie rozkwitu (fala od tyłu do przodu), w L0 sam kontur
   (e) HUD: trzy iskierki wypełniają się 1/2/3 przy łańcuchu 1/2/3 (model i piksele), stała strefa, bez liczb, nie nachodzi na przycisk "sterowanie"
   (f) klasa S3 przeszkód bez zmian; brak błędów konsoli
   (g) fps headless nie gorszy o więcej niż 10% niż przed zmianą (baza: scalony kod Z4+Z10, zmienna BAZA=ścieżka do index.html, domyślnie ../gra-okruszek-M1/index.html)
   Kończy się kodem 0 tylko gdy wszystko przeszło. */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const boty = Object.assign({}, require('./boty_z10.cjs'), require('./boty_z3c.cjs'));
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const baza = path.resolve(process.env.BAZA || path.join(__dirname, '..', 'gra-okruszek-M1', 'index.html'));
const base = 'file:///' + file.replace(/\\/g, '/');
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const f2 = (v) => (typeof v === 'number' ? v.toFixed(2) : String(v));
const FAST = !!process.env.FAST;   /* FAST=1: mniej ziaren (do prób) */
const NSEED = FAST ? 6 : 16, NPOL = FAST ? 12 : 40;   /* bot 50%: więcej ziaren, bo trójki są rzadkie (statystyka serii) */

(async () => {
  console.log('TEST Z3c ' + file);
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const errors = [];
  const open = async (url, dsf) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: dsf || 1 });
    page.on('pageerror', e => errors.push('pageerror: ' + e));
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
    await page.goto(url); await page.waitForTimeout(600);
    return page;
  };
  const page = await open(base + '?test&seed=23');
  const ev = (f, a) => page.evaluate(f, a);
  const fresh = () => ev(() => { const o = __okruszek; o.odblokuj(); o.odblokujPore(); o.nurkuj(false); o.przesun(null); o.noc(false); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.nowyBieg(); });

  /* ---------- (a) hak i stałe ---------- */
  console.log('(a) hak Z3c i stałe');
  const need = ['energia', 'lancuchE', 'ustawEnergie', 'rozkwit', 'pelnyKolor', 'serie', 'stala', 'autopilot', 'symuluj', 'trafPrad', 'kolory', 'warstwy', 'ustaw', 'ustawPoziom', 'odblokuj', 'nowyBieg', 'tempo', 'stan', 'zdarzenie', 'prady', 'nurkuj', 'bezPradow', 'bezPrzeszkod', 'ustawPore', 'odblokujPore', 'noc', 'klasy', 'fps', 'zerujFps', 'wskaznik', 'lancuch', 'poziom', 'stale'];
  const miss = await ev((n) => n.filter(k => typeof __okruszek[k] !== 'function'), need);
  chk(miss.length === 0, 'hak kompletny (' + need.length + ' funkcji, w tym energia, lancuchE, ustawEnergie)', 'w haku brakuje: ' + miss.join(', '));
  const K = await ev(() => __okruszek.stale());
  console.log('  info stałe Z3c: ' + JSON.stringify({ E_POJEDYNCZY: K.E_POJEDYNCZY, E_DWA: K.E_DWA, E_TRZY: K.E_TRZY, E_NURK: K.E_NURK, CHAIN_W: K.CHAIN_W, HIT_IDEAL: K.HIT_IDEAL, HIT_IDEAL_UCZ: K.HIT_IDEAL_UCZ, GRACE_E: K.GRACE_E, FALL_E: K.FALL_E, BLOOM_T: K.BLOOM_T, ZIG: K.ZIG, GATE4: K.GATE4, GATE5: K.GATE5, CAP4: K.CAP4 }));
  chk(K.E_POJEDYNCZY === 0.3 && K.E_DWA === 0.62 && K.E_TRZY === 1 && K.E_NURK === 0.4 && K.GATE4 === 3 && K.GATE5 === 5 && K.CAP4 === 0.79 && Math.abs(K.CHAIN_W - 2.2) < 1e-9, 'stałe wg sekcji 14: E 0,30 / 0,62 / 1,0, nurkowanie <= 0,40, CHAIN_W 2,2, GATE4 = 3, GATE5 = 5, CAP4 bez zmian (0,79)', 'stałe: ' + JSON.stringify(K));
  chk(K.GRACE_E >= 1.0 && K.GRACE_E <= 1.5 && K.FALL_E === 0.35 && K.HIT_IDEAL > 20 && K.HIT_IDEAL < K.HIT && K.BLOOM_T >= 1.1 && K.BLOOM_T <= 1.3, 'GRACE_E ' + K.GRACE_E + ' s (spec: do 1,5 s; skrócone, by trójka nie trzymała pełni dłużej niż 2 s), FALL_E 0,35/s, idealne wejście węższe niż trafienie (' + K.HIT_IDEAL + ' < ' + K.HIT + '), BLOOM_T ' + K.BLOOM_T + ' s');

  /* ---------- (b) model E ---------- */
  console.log('(b) model energii koloru E (symulacja)');
  const M = await ev(() => {
    const o = __okruszek, out = {};
    const fr = () => { o.odblokuj(); o.bezPradow(true); o.bezPrzeszkod(true); o.nurkuj(false); o.noc(false); o.stala('SINK', 0); o.stala('DIVE', 0.2); o.nowyBieg(); };
    const run = (s) => o.symuluj(s, 1 / 60);
    /* 1. trzy idealne wejścia co 1,1 s */
    fr(); run(0.5); out.e0 = o.energia();
    o.trafPrad(); run(0.6); out.e1 = o.energia(); out.l1 = o.lancuchE();
    run(0.5); o.trafPrad(); run(0.6); out.e2 = o.energia(); out.l2 = o.lancuchE();
    run(0.5); o.trafPrad(); out.rz0 = o.rozkwit(); run(0.3); out.rzSrodek = o.rozkwit(); out.eSrodek = o.energia();
    run(1.3); out.e3 = o.energia(); out.l3 = o.lancuchE(); out.rz3 = o.rozkwit();
    /* 2. zanik po osiągnięciu E = 1: próbkowanie co krok */
    fr(); run(0.2); o.trafPrad(); run(1.1); o.trafPrad(); run(1.1); o.trafPrad();
    const tr = []; let t0 = o.stan().graCzas;
    for (let i = 0; i < 360; i++) { run(1 / 60); tr.push([o.stan().graCzas - t0, o.energia(), o.rozkwit().trwa]); }
    out.zanik = tr;
    /* 3. brzeg prądu (45 j. od osi = poza idealnym 34, ale w nauce 54 to jeszcze idealne): po 21 s gry */
    fr(); run(21); out.tBrzeg = o.stan().graCzas;
    const b0 = o.stan().boost; o.zdarzenie('prad', { dx: 0.15, z: 1.2 }); run(3); const sB = o.stan();
    out.brzeg = { l: o.lancuchE(), boost: sB.boost, b0, e: o.energia(), n: o.lancuch().n, w12: o.lancuch().w12 };
    /* idealny po 21 s: dx 0,05 = 15 j. */
    o.zdarzenie('prad', { dx: 0.05, z: 1.2 }); run(3); out.idealPo = { l: o.lancuchE(), n: o.lancuch().n, e: o.energia() };
    /* 4. nauka na starcie: ten sam prąd 45 j. od osi w pierwszych 20 s jest idealny */
    fr(); run(1); o.zdarzenie('prad', { dx: 0.15, z: 1.2 }); run(3); out.nauka = { l: o.lancuchE(), n: o.lancuch().n };
    /* 5. okno łańcucha: drugie wejście po 2,5 s (> CHAIN_W) zaczyna od 1; po 1,5 s ciągnie dalej */
    fr(); run(0.2); o.trafPrad(); run(2.5); o.trafPrad(); out.okno1 = o.lancuch().n;
    fr(); run(0.2); o.trafPrad(); run(1.5); o.trafPrad(); out.okno2 = o.lancuch().n;
    /* 6. nurkowanie samo: bez prądów, wysokość nie ma znaczenia (DIVE 0), 14 s */
    fr(); o.stala('DIVE', 0.01); o.nurkuj(true); let eMaxD = 0; for (let i = 0; i < 14 * 60; i++) { run(1 / 60); eMaxD = Math.max(eMaxD, o.energia()); }
    out.nurk = { eMax: eMaxD, e: o.energia(), s: o.stan().s, sHold: o.stan().sHold, lanE: o.lancuchE().Ec }; o.nurkuj(false); o.stala('DIVE', 0.2);
    /* 7. bez prądów i bez nurkowania E = 0 przez 15 s */
    fr(); let eMax0 = 0; for (let i = 0; i < 15 * 60; i++) { run(1 / 60); eMax0 = Math.max(eMax0, o.energia()); } out.eMax0 = eMax0;
    /* 8. kolizja zabiera kolor: E = 0,62 -> ptak na torze */
    fr(); run(0.2); o.trafPrad(); run(1.0); o.trafPrad(); run(0.8); out.eKol0 = o.energia(); out.sKol0 = o.stan().s;
    o.bezPrzeszkod(false); o.zdarzenie('ptak', { dx: 0, z: 1.0, v: 0 }); let eMin = 9; for (let i = 0; i < 120; i++) { run(1 / 60); eMin = Math.min(eMin, o.energia()); }
    out.kolizja = { eMin, sMin: o.stan().s, kolizje: o.stan().kolizje };
    o.stala('SINK', 0.04); o.bezPrzeszkod(true);
    return out;
  });
  chk(Math.abs(M.e0) < 1e-9, 'start: E = 0 (nic nie podnosi koloru bez łańcucha), ' + f2(M.e0));
  chk(M.l1.n === 1 && Math.abs(M.e1 - 0.30) < 0.015, 'jedno idealne wejście: łańcuch 1, E = ' + f2(M.e1) + ' (cel 0,30)', 'E po 1 prądzie = ' + M.e1 + ', łańcuch ' + M.l1.n);
  chk(M.l2.n === 2 && Math.abs(M.e2 - 0.62) < 0.02, 'dwa z rzędu: łańcuch 2, E = ' + f2(M.e2) + ' (cel 0,62)', 'E po 2 prądach = ' + M.e2 + ', łańcuch ' + M.l2.n);
  chk(M.rzSrodek.trwa && M.eSrodek > 0.62 && M.eSrodek < 0.98 && M.l3.n === 3 && M.e3 === 1 && !M.rz3.trwa, 'trzy z rzędu: rozkwit trwa (E w trakcie ' + f2(M.eSrodek) + '), potem E = 1,0 i łańcuch 3', 'trójka: ' + JSON.stringify({ rz: M.rzSrodek.trwa, e: M.eSrodek, e3: M.e3, n: M.l3.n, koniec: M.rz3.trwa }));
  const dur = M.rz3.dziennik.length ? M.rz3.dziennik[0].dur : -1;
  chk(dur >= 1.0 && dur <= 1.4, 'rozkwit trwa ' + f2(dur) + ' s gry (wymagane 1,0-1,4)', 'rozkwit trwa ' + dur + ' s');
  /* zanik: moment osiągnięcia E >= 0,98 po rozkwicie, potem trzymanie GRACE_E, potem spadek ok. FALL_E */
  const tz = M.zanik, iFull = tz.findIndex(r => r[1] >= 0.98 && !r[2]);
  let iLeave = -1; for (let i = iFull; i < tz.length; i++) if (tz[i][1] < 0.98) { iLeave = i; break; }
  const tFull = iFull >= 0 ? tz[iFull][0] : -1, tLeave = iLeave >= 0 ? tz[iLeave][0] : -1;
  const trzyma = tLeave - tFull;
  const i90 = tz.findIndex(r => r[1] <= 0.9 && r[0] > tFull), i70 = tz.findIndex(r => r[1] <= 0.7 && r[0] > tFull);
  const slope = (i90 >= 0 && i70 >= 0) ? (tz[i90][1] - tz[i70][1]) / (tz[i70][0] - tz[i90][0]) : -1;
  console.log('  info zanik: pełny kolor od ' + f2(tFull) + ' s, trzyma ' + f2(trzyma) + ' s, spadek 0,9 -> 0,7: ' + f2(slope) + ' E/s (stałe: łaska ' + K.GRACE_E + ' s, FALL_E ' + K.FALL_E + ')');
  chk(trzyma >= K.GRACE_E - 0.05 && trzyma <= K.GRACE_E + 0.25 && Math.abs(slope - K.FALL_E) < 0.03, 'po osiągnięciu pełni kolor trzyma ' + f2(trzyma) + ' s (łaska ' + K.GRACE_E + ' s) i opada ' + f2(slope) + ' E/s (FALL_E ' + K.FALL_E + ')', 'zanik: trzyma ' + trzyma + ', spadek ' + slope);
  const eKoniec = tz[tz.length - 1][1];
  chk(eKoniec < 0.05, 'po 6 s bez kolejnego prądu kolor wraca do zera (E = ' + f2(eKoniec) + ')', 'E po 6 s: ' + eKoniec);
  chk(M.brzeg.l.brzegowych === 1 && M.brzeg.l.idealnych === 0 && M.brzeg.n === 0 && Math.abs(M.brzeg.e) < 1e-6 && M.brzeg.boost > M.brzeg.b0 && M.brzeg.boost < 0.24 * 0.75 && M.brzeg.w12 === 0, 'wejście na brzegu prądu (po 20 s nauki): mały skok (boost ' + f2(M.brzeg.boost) + ' < pełnego 0,24), łańcuch 0, E = 0, nie liczy się do bramki 12 s', 'brzeg: ' + JSON.stringify(M.brzeg));
  chk(M.idealPo.l.idealnych === 1 && M.idealPo.n === 1 && M.idealPo.e > 0.05, 'wejście w środek po 20 s liczy się: łańcuch 1, E > 0 (' + f2(M.idealPo.e) + ' po 3 s, już w zaniku)', 'idealne po 20 s: ' + JSON.stringify(M.idealPo));
  chk(M.nauka.l.idealnych === 1 && M.nauka.n === 1, 'nauka na starcie (pierwsze 20 s): to samo wejście 45 j. od osi jest idealne (HIT_IDEAL_UCZ ' + K.HIT_IDEAL_UCZ + ')', 'nauka: ' + JSON.stringify(M.nauka));
  chk(M.okno1 === 1 && M.okno2 === 2, 'okno łańcucha ' + K.CHAIN_W + ' s: po 2,5 s łańcuch zaczyna od 1, po 1,5 s ciągnie dalej do 2', 'okno: ' + M.okno1 + ' / ' + M.okno2);
  console.log('  info nurkowanie samo: maks. E ' + f2(M.nurk.eMax) + ' (sHold ' + f2(M.nurk.sHold) + ', s ' + f2(M.nurk.s) + ')');
  chk(M.nurk.eMax <= K.E_NURK + 1e-6 && M.nurk.eMax >= K.E_NURK - 0.03 && M.nurk.lanE === 0, 'nurkowanie samo daje najwyżej E ' + f2(K.E_NURK) + ' (zmierzone ' + f2(M.nurk.eMax) + '), łańcuch go nie dotyka', 'nurkowanie: ' + JSON.stringify(M.nurk));
  chk(M.eMax0 === 0, 'bez prądów i bez nurkowania E = 0 przez 15 s (maks. ' + M.eMax0 + ')');
  chk(M.eKol0 > 0.55 && M.kolizja.kolizje >= 1 && M.kolizja.eMin < M.eKol0 * 0.8,'kolizja z ptakiem zabiera kolor razem z prędkością (E ' + f2(M.eKol0) + ' -> ' + f2(M.kolizja.eMin) + ', s ' + f2(M.sKol0) + ' -> ' + f2(M.kolizja.sMin) + ')', 'kolizja: ' + JSON.stringify(M.kolizja) + ' E0 ' + M.eKol0);

  /* ---------- (c) boty ---------- */
  console.log('(c) boty (symulacja bez rysowania, ' + NSEED + ' ziaren)');
  async function bieg(pg, nm, sek, ziarno) {
    return pg.evaluate(([src, sek, ziarno]) => {
      const o = __okruszek; o.odblokuj(); o.noc(false); o.bezPrzeszkod(true); o.bezPradow(false); o.nurkuj(false); o.nowyBieg();
      o.autopilot(eval(src), ziarno);   /* źródło bota z boty_z3c.cjs / boty_z10.cjs (własny kod testu) */
      let tFull = -1, t = 0, eMax = 0;
      while (t < sek) { const q = o.symuluj(0.25, 1 / 60); t = q.graCzas; const e = o.energia(); if (e > eMax) eMax = e; if (tFull < 0 && e >= 0.98) tFull = t; if (q.tryb !== 'gra') break; }
      const f = o.pelnyKolor(), se = o.serie().filter(x => x.n >= 3), st = o.stan(), rk = o.rozkwit();
      o.autopilot(null);
      return { t, tFull, eMax, razyE: rk.razy, f, serie: se, hiper: st.hiperRazy, l5bez: st.l5bezLancucha, czasL5: st.czasPoziom[5], poziomMax: st.poziomMax };
    }, [boty[nm], sek, ziarno]);
  }
  const agg = {};
  const add = (nm, r) => { const a = agg[nm] || (agg[nm] = { runs: 0, serii: 0, trojek: 0, pelny: 0, maxCiagly: 0, rozkwity: 0, tFull: [], eMax: 0, hiper: 0, l5bez: 0, czasL5: 0, t: 0, brakFull: 0 }); a.runs++; a.serii += r.serie.length; a.trojek += r.serie.filter(x => x.maxChain >= 3).length; a.pelny += r.f.lacznie; a.maxCiagly = Math.max(a.maxCiagly, r.f.maxCiagly); a.rozkwity += r.razyE; if (r.tFull >= 0) a.tFull.push(r.tFull); else a.brakFull++; a.eMax = Math.max(a.eMax, r.eMax); a.hiper += r.hiper; a.l5bez += r.l5bez; a.czasL5 += r.czasL5; a.t += r.t; };
  for (let i = 0; i < NSEED; i++) {
    const pg = await open(base + '?test&seed=' + (23 + i * 7));
    for (const nm of ['idealny', 'idealny121']) add(nm, await bieg(pg, nm, 120, 101 + i * 13));
    for (const nm of ['polowa', 'polowaA', 'sprawny80']) add(nm, await bieg(pg, nm, 300, 101 + i * 13));
    if (i === 0) for (let j = NSEED; j < NPOL; j++) { const pg2 = await open(base + '?test&seed=' + (23 + j * 7)); add('polowa', await bieg(pg2, 'polowa', 300, 101 + j * 13)); await pg2.close(); }
    for (let k = 0; k < 2; k++) { add('losowy', await bieg(pg, 'losowy', 60, 7 + i * 5 + k)); add('bierny', await bieg(pg, 'bierny', 60, 3)); }
    await pg.close();
  }
  const A = agg;
  console.log('  info idealny: pierwszy pełny kolor w ' + A.idealny.tFull.map(f2).join(', ') + ' s; rozkwitów/bieg ' + f2(A.idealny.rozkwity / A.idealny.runs) + '; pełny kolor łącznie/bieg ' + f2(A.idealny.pelny / A.idealny.runs) + ' s; hiper razy ' + A.idealny.hiper + ', L5 bez łańcucha ' + A.idealny.l5bez);
  console.log('  info idealny121 (nurkuje od 30% wysokości, jak w Z3b): pierwszy pełny kolor w ' + A.idealny121.tFull.map(f2).join(', ') + ' s; hiper razy ' + A.idealny121.hiper + ', czas L5 ' + f2(A.idealny121.czasL5) + ' s, pełny kolor ' + f2(A.idealny121.pelny) + ' s');
  chk(A.idealny.brakFull === 0 && Math.max(...A.idealny.tFull) <= 60, 'bot idealny osiąga pełny kolor (E = 1) w <= 60 s czasu gry we wszystkich ' + A.idealny.runs + ' biegach (najpóźniej ' + f2(Math.max(...A.idealny.tFull)) + ' s)', 'bot idealny: brak pełnego koloru w ' + A.idealny.brakFull + ' biegach, najpóźniej ' + Math.max(...A.idealny.tFull));
  chk(A.idealny121.brakFull === 0 && Math.max(...A.idealny121.tFull) <= 60, 'bot idealny z Z3b (nurkuje od 30%): pełny kolor w <= 60 s (najpóźniej ' + f2(Math.max(...A.idealny121.tFull)) + ' s)', 'idealny121: ' + JSON.stringify(A.idealny121.tFull));
  const p50 = A.polowa, pr = p50.trojek / Math.max(1, p50.serii), pe = p50.pelny / Math.max(1, p50.trojek);
  console.log('  info bot 50% prądów (losowo): ' + p50.serii + ' serii (>= 3 prądów), trójek ' + p50.trojek + ' (' + (100 * pr).toFixed(1) + '%), pełny kolor ' + f2(p50.pelny) + ' s łącznie = ' + f2(pe) + ' s na trójkę, najdłuższy ciągły ' + f2(p50.maxCiagly) + ' s; "co drugi prąd": trójek ' + A.polowaA.trojek + ' z ' + A.polowaA.serii + '; 80% prądów: ' + (100 * A.sprawny80.trojek / Math.max(1, A.sprawny80.serii)).toFixed(0) + '% serii');
  chk(p50.serii >= 200 && pr <= 0.15, 'bot "50% prądów": trójka z rzędu w ' + (100 * pr).toFixed(1) + '% serii (<= 15%, próba ' + p50.serii + ' serii)', 'bot 50%: trójki w ' + (100 * pr).toFixed(1) + '% z ' + p50.serii + ' serii (wymagane <= 15%)');
  chk(p50.trojek > 0 && pe <= 2.0, 'bot "50% prądów": pełny kolor ' + f2(pe) + ' s na jedną trójkę (<= 2 s)', 'bot 50%: pełny kolor ' + f2(pe) + ' s na trójkę (wymagane <= 2 s)');
  chk(A.polowaA.trojek === 0, 'bot "co drugi prąd": nigdy trójki (zerwany łańcuch), maks. E ' + f2(A.polowaA.eMax), 'co drugi prąd: trójek ' + A.polowaA.trojek);
  chk(A.losowy.eMax < 0.98 && A.losowy.pelny === 0 && A.bierny.eMax < 0.98 && A.bierny.pelny === 0, 'bot losowy i bierny nigdy nie osiągają pełnego koloru (' + A.losowy.runs + ' + ' + A.bierny.runs + ' biegów; maks. E ' + f2(A.losowy.eMax) + ' / ' + f2(A.bierny.eMax) + ')', 'losowy/bierny: eMax ' + A.losowy.eMax + ' / ' + A.bierny.eMax);
  chk(A.bierny.eMax <= K.E_POJEDYNCZY + 1e-6, 'bot bierny: E co najwyżej ' + f2(K.E_POJEDYNCZY) + ' (tylko prąd ratunkowy, który leży na wprost), maks. ' + f2(A.bierny.eMax), 'bierny eMax ' + A.bierny.eMax);
  const rzadkosc = [A.idealny121, A.idealny, A.sprawny80].every(a => a.hiper < a.rozkwity);
  chk(rzadkosc && A.idealny.l5bez === 0 && A.idealny121.l5bez === 0, 'L5 (hiper) rzadszy niż pełny kolor: hiper ' + A.idealny.hiper + ' / ' + A.idealny121.hiper + ' / ' + A.sprawny80.hiper + ' razy vs rozkwitów ' + A.idealny.rozkwity + ' / ' + A.idealny121.rozkwity + ' / ' + A.sprawny80.rozkwity + '; nigdy bez łańcucha >= 5', 'rzadkość L5: ' + JSON.stringify({ i: [A.idealny.hiper, A.idealny.rozkwity], i121: [A.idealny121.hiper, A.idealny121.rozkwity], s80: [A.sprawny80.hiper, A.sprawny80.rozkwity], l5bez: A.idealny.l5bez + A.idealny121.l5bez }));
  /* geometria serii: zygzak w x, nie na jednej prostej; ratunek i nauka bez zmian */
  const zv = await ev(() => ({ zig: __okruszek.stala('ZIG'), zigv: __okruszek.stala('ZIG_V') }));
  const geo = await ev(([src]) => {
    const o = __okruszek; o.odblokuj(); o.noc(false); o.bezPrzeszkod(true); o.bezPradow(false); o.nurkuj(false); o.nowyBieg();
    o.autopilot(eval(src), 5);
    const serie = {}; let t = 0;
    while (t < 90) { const q = o.symuluj(0.1, 1 / 60); t = q.graCzas; for (const p of o.prady()) if (p.seria !== undefined) { (serie[p.seria] = serie[p.seria] || {})[p.id] = p.x; } if (q.tryb !== 'gra') break; }
    o.autopilot(null);
    return Object.values(serie).map(s => Object.keys(s).map(Number).sort((a, b) => a - b).map(k => s[k]));
  }, [boty.idealny]);
  const pelne = geo.filter(x => x.length >= 3);
  let altOk = true, minD = 1e9, rozstep = 1e9;
  for (const s of pelne) {
    const d = []; for (let i = 1; i < s.length; i++) d.push(s[i] - s[i - 1]);
    for (let i = 1; i < d.length; i++) if (d[i] * d[i - 1] >= 0) altOk = false;
    for (const v of d) minD = Math.min(minD, Math.abs(v));
    const mean = s.reduce((a, b) => a + b, 0) / s.length; rozstep = Math.min(rozstep, Math.sqrt(s.reduce((a, b) => a + (b - mean) * (b - mean), 0) / s.length));
  }
  console.log('  info geometria serii (' + pelne.length + ' serii): minimalny odstęp w x między sąsiednimi prądami ' + f2(minD) + ' j., najmniejsze odchylenie standardowe x serii ' + f2(rozstep) + ' j.');
  const minOczek = 2 * zv.zig * (1 - zv.zigv) * 300 * 0.97;
  chk(pelne.length >= 3 && altOk && minD >= minOczek && rozstep >= 0.4 * zv.zig * 300, 'prądy w serii leżą naprzemiennie po dwóch stronach osi (zygzak): sąsiednie >= ' + f2(minOczek) + ' j. od siebie w x (ok. ' + f2(minOczek / 0.7) + ' px na ekranie), nie na jednej prostej', 'geometria serii: alt ' + altOk + ' minD ' + minD + ' rozstęp ' + rozstep + ' serii ' + pelne.length);

  /* ---------- (d) kolor na klatkach ---------- */
  console.log('(d) kolor: kolejność przy E = 0, 0,3, 0,62, 1 o każdej porze doby, rozkwit, L0');
  const ordered = (k) => k.niebo >= k.daleko - 1e-9 && k.daleko >= k.blisko - 1e-9 && k.blisko >= k.smugi - 1e-9 && k.smugi >= 0 && k.niebo <= 1 + 1e-9;
  let ordBad = 0, ordN = 0, layBad = 0, layN = 0, ordWhy = '';
  const PN = ['noc', 'swit', 'dzien', 'zachod'], Es = [0, 0.3, 0.62, 1], kPor = {};
  for (const p of PN) {
    await fresh(); await ev((q) => __okruszek.ustawPore(q), p);
    for (const e of Es) {
      await ev((x) => __okruszek.ustawEnergie(x), e); await sleep(250);
      const k = await ev(() => __okruszek.kolory()), w = await ev(() => __okruszek.warstwy());
      kPor[p + e] = k;
      ordN++; if (!ordered(k)) { ordBad++; ordWhy = p + ' E=' + e + ' ' + JSON.stringify(k); }
      layN++; for (let i = 1; i < w.length; i++) if (w[i].c > w[i - 1].c + 1e-9 || w[i].z > w[i - 1].z + 1e-9) { layBad++; ordWhy = p + ' E=' + e + ' warstwy ' + JSON.stringify(w.map(q => [+q.z.toFixed(2), q.c])); break; }
    }
  }
  chk(ordBad === 0 && ordN === 16, 'kolejność niebo >= daleko >= blisko >= smugi przy E = 0, 0,3, 0,62, 1 o każdej porze doby (' + ordN + ' próbek)', 'kolejność złamana ' + ordBad + 'x: ' + ordWhy);
  chk(layBad === 0 && layN === 16, 'narysowane warstwy: kolor nie rośnie od tyłu do przodu w żadnej próbce (' + layN + ' próbek)', 'kolejność warstw złamana ' + layBad + 'x: ' + ordWhy);
  const zer = PN.every(p => kPor[p + 0].niebo === 0 && kPor[p + 0].daleko === 0 && kPor[p + 0].blisko === 0 && kPor[p + 0].smugi === 0);
  const pelna = PN.every(p => kPor[p + 1].niebo > 0.9999 && kPor[p + 1].daleko > 0.9999 && kPor[p + 1].blisko > 0.9999 && kPor[p + 1].smugi > 0.9999);
  const posr = PN.every(p => kPor[p + 0.3].blisko < 0.5 && kPor[p + 0.62].blisko < 0.8 && kPor[p + 0.62].blisko > kPor[p + 0.3].blisko + 0.15 && kPor[p + 0.3].niebo > 0.15 && kPor[p + 0.62].smugi < 0.5);
  console.log('  info kolory (zachód): E=0 ' + JSON.stringify(kPor['zachod0']) + '; E=0,3 ' + JSON.stringify(kPor['zachod0.3']) + '; E=0,62 ' + JSON.stringify(kPor['zachod0.62']) + '; E=1 ' + JSON.stringify(kPor['zachod1']));
  chk(zer && pelna && posr, 'E = 0: bez koloru (tony L0); E = 1: pełny kolor wszędzie (kolory 1,0); E = 0,3 i 0,62 pośrednie, rosnące, pełni jeszcze nie ma', 'etapy E: ' + JSON.stringify({ zer, pelna, posr }));
  /* rozkwit na klatkach: próbkowanie kolejności i fali (tempo 0,25: 1,2 s gry = 4,8 s rzeczywistych) */
  await fresh(); await ev(() => { const o = __okruszek; o.ustawPore('zachod'); o.stala('SINK', 0); o.trafPrad(); o.symuluj(1.0, 1 / 60); o.trafPrad(); o.symuluj(1.0, 1 / 60); o.tempo(0.25); });
  const fr = await ev(() => new Promise(res => {
    const o = __okruszek, vals = []; o.trafPrad(); const t0 = performance.now();
    (function tick() {
      const k = o.kolory(), w = o.warstwy(), r = o.rozkwit(); let wb = true; for (let i = 1; i < w.length; i++) if (w[i].c > w[i - 1].c + 1e-9 || w[i].z > w[i - 1].z + 1e-9) wb = false;
      vals.push({ k, r: r.trwa, kk: r.k, wb, e: o.energia(), t: performance.now() - t0 });
      if (performance.now() - t0 > 6500) { res(vals); return; }
      setTimeout(tick, 30);
    })();
  }));
  const duringB = fr.filter(v => v.r);
  chk(duringB.length >= 5 && duringB.every(v => ordered(v.k) && v.wb), 'w trakcie rozkwitu kolejność niebo >= daleko >= blisko >= smugi i warstw zachowana (' + duringB.length + ' próbek)', 'rozkwit: złamana kolejność w ' + duringB.filter(v => !(ordered(v.k) && v.wb)).length + ' z ' + duringB.length);
  const gapMax = Math.max(...duringB.map(v => v.k.niebo - v.k.blisko)), gapStd = Math.max(...fr.filter(v => !v.r && v.e >= 0.98).map(v => v.k.niebo - v.k.blisko), 0);
  console.log('  info rozkwit na klatkach: ' + duringB.length + ' próbek, największa różnica niebo - blisko ' + f2(gapMax) + ' (po rozkwicie ' + f2(gapStd) + ')');
  chk(gapMax > 0.08 && gapMax > gapStd + 0.05, 'fala koloru jest widoczna: w rozkwicie dalekie warstwy wyprzedzają bliskie (różnica niebo - blisko ' + f2(gapMax) + ' > ' + f2(gapStd) + ' po rozkwicie)', 'brak fali: ' + gapMax + ' vs ' + gapStd);
  await ev(() => { __okruszek.tempo(1); __okruszek.stala('SINK', 0.04); });

  /* ---------- (e) HUD: iskierki ---------- */
  console.log('(e) HUD: trzy iskierki');
  const H = await ev(() => {
    const o = __okruszek, out = {}; const run = (s) => o.symuluj(s, 1 / 60);
    o.odblokuj(); o.bezPradow(true); o.bezPrzeszkod(true); o.nurkuj(false); o.nowyBieg(); o.stala('SINK', 0);
    out.s0 = o.lancuchE(); run(0.2); o.trafPrad(); run(0.6); out.s1 = o.lancuchE(); run(0.5); o.trafPrad(); run(0.6); out.s2 = o.lancuchE(); run(0.5); o.trafPrad(); run(1.6); out.s3 = o.lancuchE();
    run(5); out.s4 = o.lancuchE(); o.stala('SINK', 0.04); return out;
  });
  const sumF = (l) => l.iskierki.reduce((a, b) => a + b, 0);
  chk(H.s0.wypelnione === 0 && H.s1.wypelnione === 1 && H.s2.wypelnione === 2 && H.s3.wypelnione === 3 && H.s1.iskierki.join() === '1,0,0' && H.s2.iskierki.join() === '1,1,0' && H.s3.iskierki.join() === '1,1,1', 'iskierki wypełniają się po kolei: łańcuch 0/1/2/3 -> [0,0,0] [1,0,0] [1,1,0] [1,1,1]', 'iskierki: ' + JSON.stringify([H.s0.iskierki, H.s1.iskierki, H.s2.iskierki, H.s3.iskierki]));
  chk(H.s4.wypelnione === 0 && sumF(H.s4) < 0.05, 'po 5 s bez prądu iskierki są puste (zanik razem z kolorem)', 'iskierki po zaniku: ' + JSON.stringify(H.s4.iskierki));
  const sp = await ev(() => { const w = __okruszek.wskaznik(); return { w, sc: document.getElementById('g').width / 390 }; });
  const pix = (e) => ev(([x, sc]) => { __okruszek.ustawEnergie(x); return new Promise(res => setTimeout(() => {
    const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const q = t.getContext('2d', { willReadFrequently: true }); q.drawImage(c, 0, 0);
    const X0 = Math.round(18 * sc), Y0 = Math.round(75 * sc), W0 = Math.round(52 * sc), H0 = Math.round(14 * sc), a = q.getImageData(X0, Y0, W0, H0).data, b = q.getImageData(X0 + Math.round(90 * sc), Y0, W0, H0).data;
    let n = 0, col = 0; for (let i = 0; i < a.length; i += 4) { n += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); const ch = Math.max(a[i], a[i + 1], a[i + 2]) - Math.min(a[i], a[i + 1], a[i + 2]); if (ch > 70) col++; }
    res({ diff: n / (a.length / 4), kol: col }); }, 350)); }, [e, sp.sc]);
  await fresh(); await ev(() => __okruszek.ustawPore('zachod'));
  const px = []; for (const e of [0, 0.3, 0.62, 1]) px.push(await pix(e));
  console.log('  info piksele strefy iskierek (liczba barwnych pikseli) E=0/0,3/0,62/1: ' + px.map(p => p.kol).join('/'));
  chk(px[1].kol > px[0].kol + 8 && px[2].kol > px[1].kol + 8 && px[3].kol > px[2].kol + 8, 'na obrazie liczba barwnych pikseli w strefie iskierek rośnie z 0 do 3 iskierek', 'piksele iskierek: ' + JSON.stringify(px));
  const geom = await ev(() => { const b = document.getElementById('sterb').getBoundingClientRect(), c = document.getElementById('g').getBoundingClientRect(), k = c.width / 390; return { sb: { l: b.left, t: b.top, r: b.right, b: b.bottom }, sp: { l: c.left + 18 * k, t: c.top + 75 * k, r: c.left + 70 * k, b: c.top + 89 * k }, bar: { b: c.top + 68 * k }, w: __okruszek.wskaznik() }; });
  const naklada = !(geom.sp.r <= geom.sb.l || geom.sp.l >= geom.sb.r || geom.sp.b <= geom.sb.t || geom.sp.t >= geom.sb.b);
  chk(!naklada && geom.sp.t > geom.bar.b + 4 && geom.w.y + geom.w.h >= 89 && geom.w.h >= 28, 'strefa iskierek (x 18-70, y 75-89 w układzie 390 px): pod paskiem poziomu z odstępem, w polu wskaźnika, nie nachodzi na przycisk "sterowanie"', 'strefa iskierek: ' + JSON.stringify(geom));
  const src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n'), fn = (src.match(/function drawSparks\(\) \{[\s\S]*?\n  \}\n/) || [''])[0];
  chk(fn.length > 100 && !/fillText|strokeText|arc\(/.test(fn), 'iskierki bez liczb i bez okręgów (kod drawSparks: brak fillText i arc)', 'drawSparks zawiera tekst albo okrąg');

  /* ---------- (f) klasy przeszkód, konsola ---------- */
  console.log('(f) klasy przeszkód i konsola');
  const KL = await ev(() => __okruszek.klasy());
  chk(Object.keys(KL).filter(k => KL[k] === 3).sort().join() === 'jastrzab,morze,sowa', 'klasa S3 (koniec biegu) bez zmian: tylko jastrząb, sowa, morze chmur');
  /* ---------- (g) fps ---------- */
  console.log('(g) fps headless: po zmianie vs baza (' + path.basename(path.dirname(baza)) + ')');
  let fpsN = [], fpsO = [], fpsN2 = [];
  if (!fs.existsSync(baza)) bad('brak pliku bazy do porównania fps: ' + baza);
  else {
    await page.goto('about:blank');   /* żadna inna strona nie może rysować w tle podczas pomiaru */
    const urlO = 'file:///' + baza.replace(/\\/g, '/') + '?test&seed=23', urlN = base + '?test&seed=23';
    const meas = async (url, f) => { const pg = await open(url, 2); await pg.evaluate(f); await pg.evaluate(() => __okruszek.zerujFps()); await sleep(3500); const v = (await pg.evaluate(() => __okruszek.fps())).avg; await pg.close(); return v; };
    for (let r = 0; r < 4; r++) {
      fpsO.push(await meas(urlO, () => { __okruszek.odblokuj(); __okruszek.ustaw(1); }));
      fpsN.push(await meas(urlN, () => { __okruszek.odblokuj(); __okruszek.ustaw(1); }));
      fpsN2.push(await meas(urlN, () => { __okruszek.odblokuj(); __okruszek.ustawEnergie(1); }));
    }
    const med = (a) => Math.max(...a);   /* najlepszy z 4 przebiegów: headless na wspólnej maszynie ma duży rozrzut, szczyt jest odporny na obciążenie */
    console.log('  info fps (najlepszy z 4, 390x844 @2x, ' + 'headless bez GPU): baza s=1 ' + f2(med(fpsO)) + ' (' + fpsO.map(f2).join('/') + '), po zmianie s=1 ' + f2(med(fpsN)) + ' (' + fpsN.map(f2).join('/') + '), po zmianie E=1 ' + f2(med(fpsN2)) + ' (' + fpsN2.map(f2).join('/') + ')');
    chk(med(fpsN) >= 0.9 * med(fpsO) && med(fpsN2) >= 0.9 * med(fpsO), 'fps po zmianie nie gorszy niż o 10% względem bazy (s=1: ' + f2(med(fpsN)) + ' vs ' + f2(med(fpsO)) + ', E=1: ' + f2(med(fpsN2)) + ')', 'fps: baza ' + med(fpsO) + ', po zmianie ' + med(fpsN) + ' / ' + med(fpsN2));
  }
  const real = errors.filter(e => !/favicon/i.test(e));
  chk(real.length === 0, 'brak błędów i ostrzeżeń konsoli', 'błędy konsoli: ' + real.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fail ? ('TEST Z3c NIE PRZESZEDŁ (' + fail + ')') : 'TEST Z3c OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST Z3c BŁĄD: ' + e); process.exit(2); });
