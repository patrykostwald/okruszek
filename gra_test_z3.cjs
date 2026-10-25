/* Okruszek Z3: testy Playwright. Użycie: node gra_test_z3.cjs [plik.html]
   (a) harmonogram: przeszkód nie ma w pierwszych 20 s czasu gry, prądy są od startu, ptaki i deszcz z rosnącą częstością,
       odstęp >= ok. 3 s, jastrząb dopiero od 2:00; ziarno ?test daje powtarzalny pierwszy termin
   (b) każde zdarzenie wymuszalne hakiem zdarzenie() i widoczne w gdzie()
   (c) kolizja z ptakiem: spada prędkość, wirowanie 1 s, bieg trwa dalej; hitbox mniejszy niż rysunek; inna warstwa z / inny tor = brak kolizji
   (d) deszcz: 5 s "mokro" (wolniej, kolor osłabiony), potem powrót
   (e) jastrząb: zapowiedź 2 s, pościg; ucieczka prędkością; złapanie = koniec biegu z tekstem; ucieczka w gęstą chmurę
   (f) kolejność koloru z Z1 także w nocy (hak noc() = pora doby noc); przy s=0 w nocy tylko kontur (brak nasyconych pikseli poza szalikiem); gwiazdy w nocy nie gasną (przejście nocy po 1000 m zastąpiła doba: Z3b)
   Czas gry jest przyspieszany hakiem tempo() (tylko ?test). Kończy się kodem 0 tylko gdy wszystko przeszło. */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const url = 'file:///' + file.replace(/\\/g, '/') + '?test&seed=23&pasmo=1';   /* Z10: stary harmonogram Z3/Z3b w trybie zgodności */
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const f2 = (v) => (typeof v === 'number' ? v.toFixed(2) : String(v));

(async () => {
  console.log('TEST Z3 ' + file);
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  const ev = (f, a) => page.evaluate(f, a);
  const st = () => ev(() => __okruszek.stan());
  const gd = () => ev(() => __okruszek.gdzie());
  const fresh = (tempo) => ev((tp) => { const o = __okruszek; o.odblokuj(); o.nurkuj(false); o.przesun(null); o.noc(false); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(tp || 1); o.nowyBieg(); }, tempo);
  await page.goto(url);
  await page.waitForTimeout(700);
  const K = await ev(() => __okruszek.stale());
  console.log('  info stałe: ' + JSON.stringify(K));
  const need = ['zdarzenie', 'noc', 'bezPrzeszkod', 'gdzie', 'bezPradow', 'ustaw', 'odblokuj', 'tempo', 'nurkuj', 'stan', 'kolory', 'nowyBieg', 'ustawWysokosc', 'ustawDystans', 'prady', 'ptak', 'dotyk', 'pauza', 'wysokosc', 'dystans', 'koniec', 'przesun', 'fps', 'zerujFps', 'stale'];
  const miss = await ev((n) => n.filter(k => typeof __okruszek[k] !== 'function'), need);
  chk(miss.length === 0, 'hak kompletny (' + need.length + ' funkcji, w tym wszystkie z Z1 i Z2)', 'w haku brakuje: ' + miss.join(', '));

  /* ---------- (a) harmonogram: jeden długi bieg bez przeszkadzania (wysokość podtrzymana, brak sterowania) ---------- */
  console.log('(a) harmonogram zdarzeń (bieg 125 s czasu gry, tempo x8)');
  await ev(() => { const o = __okruszek; o.odblokuj(); o.noc(false); o.bezPradow(false); o.bezPrzeszkod(false); o.tempo(8); o.nowyBieg(); });
  const A = { early: 0, samples: 0, prad0: false, spawns: [], hawk: null, lastN: { ptak: 0, deszcz: 0, jastrzab: 0 }, maxConc: 0, first: -1, firstLog: [] };
  const tA = Date.now();
  while (Date.now() - tA < 90000) {
    const d = await ev(() => { __okruszek.ustawWysokosc(1); const s = __okruszek.stan(); return { s, g: __okruszek.gdzie() }; });
    A.samples++;
    const obs = d.g.filter(o => o.typ === 'ptak' || o.typ === 'deszcz' || o.typ === 'jastrzab');
    if (d.s.graCzas < 20 && obs.length) A.early++;
    if (d.s.graCzas < 8 && d.g.some(o => o.typ === 'prad')) A.prad0 = true;
    A.maxConc = Math.max(A.maxConc, obs.length);
    for (const typ of ['ptak', 'deszcz', 'jastrzab']) { if (d.s.spawny[typ] > A.lastN[typ]) { for (let i = A.lastN[typ]; i < d.s.spawny[typ]; i++) A.spawns.push({ typ, t: d.s.graCzas }); A.lastN[typ] = d.s.spawny[typ]; } }
    if (d.s.jastrzab && !A.hawk) A.hawk = { t: d.s.graCzas, faza: d.s.jastrzab.faza };
    if (d.s.tryb !== 'gra') { A.ended = d.s.graCzas; break; }
    if (d.s.graCzas >= 125) break;
    await sleep(40);
  }
  const sA = await st();
  chk(A.early === 0 && A.samples > 100, 'brak przeszkód w pierwszych 20 s czasu gry (' + A.samples + ' próbek, ' + A.early + ' z przeszkodą przed 20 s)', 'przeszkody przed 20 s: ' + A.early);
  chk(A.prad0, 'prądy powietrzne są od startu (nauka ma pierwszeństwo)');
  const birds = A.spawns.filter(x => x.typ === 'ptak'), rains = A.spawns.filter(x => x.typ === 'deszcz');
  const fT = A.spawns.length ? Math.min(...A.spawns.map(x => x.t)) : -1;
  chk(fT >= 20 && fT <= 30, 'pierwsza przeszkoda w ' + f2(fT) + ' s czasu gry (>= 20 i <= 30); wg gry: ' + f2(sA.pierwszaPrzeszkoda), 'pierwsza przeszkoda w ' + fT + ' s');
  const gaps = (arr) => arr.slice(1).map((x, i) => x.t - arr[i].t);
  const gb = gaps(birds), gr = gaps(rains);
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  chk(birds.length >= 8 && rains.length >= 4, 'liczba zdarzeń: ptaków ' + birds.length + ', chmur deszczowych ' + rains.length + ' (w ' + f2(sA.graCzas) + ' s)');
  chk(gb.length >= 6 && mean(gb.slice(0, 3)) > mean(gb.slice(-3)) + 1.5, 'rosnąca częstość ptaków: pierwsze 3 odstępy śr. ' + f2(mean(gb.slice(0, 3))) + ' s, ostatnie 3 śr. ' + f2(mean(gb.slice(-3))) + ' s', 'częstość nie rośnie: ' + gb.map(f2).join(','));
  chk(gr.length >= 2 && mean(gr.slice(0, 2)) > mean(gr.slice(-2)) + 1.5, 'rosnąca częstość deszczu: pierwsze odstępy śr. ' + f2(mean(gr.slice(0, 2))) + ' s, ostatnie śr. ' + f2(mean(gr.slice(-2))) + ' s', 'deszcz nie rośnie: ' + gr.map(f2).join(','));
  const all = A.spawns.filter(x => x.typ !== 'jastrzab').sort((x, y) => x.t - y.t);
  const minGap = Math.min(...gaps(all));
  chk(minGap >= 2.8, 'odstęp między przeszkodami >= ok. 3 s (najmniejszy ' + f2(minGap) + ' s)', 'zbyt gęsto: ' + f2(minGap) + ' s');
  chk(A.hawk && A.hawk.t >= 120 && A.hawk.t <= 122, 'jastrząb dopiero od 2:00 (zapowiedź zauważona w ' + (A.hawk ? f2(A.hawk.t) : '?') + ' s, faza ' + (A.hawk ? A.hawk.faza : '?') + ')', 'jastrząb: ' + JSON.stringify(A.hawk));
  chk(!A.spawns.some(x => x.typ === 'jastrzab' && x.t < 120), 'żadnego jastrzębia przed 2:00');
  chk(A.maxConc <= 8, 'liczba jednoczesnych przeszkód ograniczona (max ' + A.maxConc + ')');
  /* powtarzalność: drugi bieg z tym samym ziarnem ma ten sam pierwszy termin */
  await ev(() => { const o = __okruszek; o.nowyBieg(); });
  let first2 = -1; const tB = Date.now();
  while (Date.now() - tB < 30000) { const s = await ev(() => { __okruszek.ustawWysokosc(1); return __okruszek.stan(); }); if (s.pierwszaPrzeszkoda >= 0) { first2 = s.pierwszaPrzeszkoda; break; } await sleep(40); }
  chk(first2 >= 0 && Math.abs(first2 - sA.pierwszaPrzeszkoda) < 0.4, 'ziarno ?test: ten sam pierwszy termin w drugim biegu (' + f2(sA.pierwszaPrzeszkoda) + ' i ' + f2(first2) + ' s)', 'różne terminy: ' + sA.pierwszaPrzeszkoda + ' vs ' + first2);

  /* ---------- (b) wymuszanie zdarzeń ---------- */
  console.log('(b) każde zdarzenie wymuszalne i widoczne w gdzie()');
  for (const nazwa of ['ptak', 'deszcz', 'jastrzab', 'prad']) {
    await fresh(1);
    const r = await ev((n) => __okruszek.zdarzenie(n), nazwa);
    const g = (await gd()).filter(o => o.typ === nazwa);
    const fin = g.length === 1 && Number.isFinite(g[0].ex) && Number.isFinite(g[0].ey);
    chk(r === true && fin, 'zdarzenie(\'' + nazwa + '\') -> true, w gdzie() jest 1 wpis z pozycją ekranu (' + (g[0] ? Math.round(g[0].ex) + ',' + Math.round(g[0].ey) : '?') + ')', 'zdarzenie(' + nazwa + ') -> ' + r + ', gdzie: ' + JSON.stringify(g));
    if (nazwa === 'jastrzab') { chk(g[0] && g[0].faza === 'zapowiedz' && g[0].cien === true, 'jastrząb zaczyna od zapowiedzi (sam cień)'); chk(!(await ev(() => __okruszek.zdarzenie('jastrzab'))), 'drugi jastrząb naraz jest odrzucony'); }
  }
  chk((await ev(() => __okruszek.zdarzenie('nieznane'))) === false, 'nieznana nazwa zdarzenia -> false');

  /* ---------- (c) kolizje 2,5D z ptakiem ---------- */
  console.log('(c) kolizja z ptakiem');
  const hitRun = (dx, z, nurk) => ev(([dxx, zz, nu]) => new Promise(res => {
    const o = __okruszek; o.odblokuj(); o.noc(false); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.przesun(null); o.nowyBieg(); if (nu) o.nurkuj(true);
    const log = []; let spawned = false, t0 = 0, before = 0;
    (function tick(now) {
      const s = o.stan(); o.ustawWysokosc(Math.max(s.h, 0.5));
      if (!spawned && (!nu || s.sHold > 0.45)) { spawned = true; before = s.s; t0 = now; o.zdarzenie('ptak', { z: zz, dx: dxx, v: 0 }); }
      if (spawned) log.push({ t: now - t0, s: s.s, wir: s.wirowanie, kol: s.kolizje, tryb: s.tryb, odp: s.odpornosc });
      if (spawned && now - t0 > 1900) { o.nurkuj(false); res({ before, log }); return; }
      requestAnimationFrame(tick);
    })(performance.now());
  }), [dx, z, nurk]);
  const R = await hitRun(0, 1.0, true);
  const hitI = R.log.findIndex(x => x.kol > 0);
  const afterS = hitI >= 0 ? R.log.slice(hitI, hitI + 3).map(x => x.s) : [];
  chk(hitI >= 0 && R.log[R.log.length - 1].kol === 1, 'ptak na torze: dokładnie jedna kolizja (kolizje=' + R.log[R.log.length - 1].kol + ')');
  chk(hitI >= 0 && Math.min(...afterS) < R.before * 0.5, 'prędkość spada po kolizji: ' + f2(R.before) + ' -> ' + (afterS.length ? f2(Math.min(...afterS)) : '?') + ' (< połowy)', 'prędkość nie spadła: ' + R.before + ' -> ' + afterS);
  const wir = R.log.filter(x => x.wir);
  const wirDur = wir.length ? wir[wir.length - 1].t - wir[0].t : 0;
  chk(wir.length > 5 && wirDur > 850 && wirDur < 1150, 'wirowanie trwa ' + Math.round(wirDur) + ' ms (cel ok. 1000)', 'wirowanie ' + Math.round(wirDur) + ' ms');
  chk(R.log.every(x => x.tryb === 'gra'), 'kolizja nie kończy biegu (tryb cały czas "gra")');
  chk(R.log.length > 20 && !R.log[R.log.length - 1].wir, 'po wirowaniu stan wraca do normy');
  /* hitbox mniejszy niż rysunek: ptak 25 jedn. obok toru trafia, 45 jedn. obok nie (rysunek korpusu ma ok. 50 jedn. połowy szerokości) */
  const near = await hitRun(25 / 300, 1.0, false), far = await hitRun(45 / 300, 1.0, false), wide = await hitRun(1.0, 1.0, false), deep = await hitRun(0, 3.0, false);
  chk(near.log[near.log.length - 1].kol === 1, 'ptak 25 jedn. od toru: trafia (hitbox ' + K.HITB + ' jedn.)');
  chk(far.log[far.log.length - 1].kol === 0, 'ptak 45 jedn. od toru: mija (hitbox mniejszy niż rysunek)');
  chk(wide.log[wide.log.length - 1].kol === 0, 'ptak 300 jedn. od toru: brak kolizji');
  chk(deep.log[deep.log.length - 1].kol === 0, 'ptak w dalszej warstwie (z=3 przy z ptaszka ' + K.ZB + '): brak kolizji, kolizja tylko w oknie z');

  /* ---------- (d) deszcz: 5 s mokro, potem powrót ---------- */
  console.log('(d) chmura deszczowa');
  const D = await ev(() => new Promise(res => {
    const o = __okruszek; o.odblokuj(); o.noc(false); o.bezPradow(true); o.bezPrzeszkod(true); o.przesun(null); o.tempo(2); o.nowyBieg(); o.nurkuj(true);
    let spawned = false, w0 = null, w1 = null, peak = null, after = null, pre = null, g0 = 0, maxK = 0;
    (function tick() {
      const s = o.stan(); o.ustawWysokosc(1);
      if (!spawned && s.sHold > 0.45) { spawned = true; pre = { s: s.s, raw: s.sSuche, sk: s.sk }; o.zdarzenie('deszcz', { z: 1.0, dx: 0 }); }
      if (spawned && w0 === null && s.mokro) w0 = s.graCzas;
      if (w0 !== null) maxK = Math.max(maxK, s.mokroK);
      if (w0 !== null && w1 === null && s.graCzas - w0 > 1.2 && !peak) peak = { s: s.s, raw: s.sSuche, sk: s.sk, k: s.mokroK };
      if (w0 !== null && w1 === null && !s.mokro) w1 = s.graCzas;
      if (w1 !== null && s.graCzas - w1 > 0.9) { after = { s: s.s, raw: s.sSuche, sk: s.sk, k: s.mokroK, wet: s.mokrych }; o.nurkuj(false); res({ pre, w0, w1, peak, after, maxK }); return; }
      if (s.graCzas > 40) { o.nurkuj(false); res({ pre, w0, w1, peak, after, maxK, timeout: true }); return; }
      requestAnimationFrame(tick);
    })();
  }));
  chk(D.w0 !== null && D.w1 !== null, 'wlot w chmurę deszczową uruchamia stan "mokro"', 'brak stanu mokro: ' + JSON.stringify(D));
  if (D.w0 !== null && D.w1 !== null) {
    chk(D.w1 - D.w0 > 4.8 && D.w1 - D.w0 < 5.3, 'mokro trwa ' + f2(D.w1 - D.w0) + ' s czasu gry (cel 5)', 'mokro ' + f2(D.w1 - D.w0) + ' s');
    chk(D.peak && D.peak.s < D.peak.raw * 0.75, 'mokro: ptaszek wolniejszy (s ' + f2(D.peak.s) + ' przy bazowym ' + f2(D.peak.raw) + ')', 'mokro nie spowalnia: ' + JSON.stringify(D.peak));
    chk(D.peak && D.peak.sk < D.peak.s * 0.7, 'mokro: kolor gaśnie szybciej niż prędkość (sk ' + f2(D.peak.sk) + ' < 0,7 * ' + f2(D.peak.s) + ')', 'kolor nie gaśnie: ' + JSON.stringify(D.peak));
    chk(D.maxK > 0.95, 'mokro: pełny mokry wygląd ptaszka (parametr rysowania ' + f2(D.maxK) + '; wygląd oceniony na zrzutach)');
    chk(D.after && D.after.s > D.after.raw * 0.97 && D.after.sk > D.after.s * 0.97 && D.after.k === 0, 'po 5 s powrót: s=' + f2(D.after.s) + ' (bazowo ' + f2(D.after.raw) + '), kolor wrócił, wygląd suchy', 'brak powrotu: ' + JSON.stringify(D.after));
    chk(D.pre && D.pre.s > 0.4, 'przed deszczem prędkość była podniesiona nurkowaniem (' + f2(D.pre.s) + '; Z3b: samo nurkowanie daje najwyżej ok. 0,5), więc spadek jest od deszczu');
  }

  /* ---------- (e) jastrząb ---------- */
  console.log('(e) jastrząb');
  const watchHawk = (lockV, tempo, maxGame, extra) => ev(([lv, tp, mg, ex]) => new Promise(res => {
    const o = __okruszek; o.odblokuj(); o.noc(false); o.bezPradow(true); o.bezPrzeszkod(true); o.przesun(null); o.tempo(tp); o.nowyBieg(); o.ustaw(lv); o.zdarzenie('jastrzab');
    const log = []; let chase0 = null, extraDone = false;
    (function tick() {
      const s = o.stan(), j = s.jastrzab;
      log.push({ gc: s.graCzas, faza: j ? j.faza : null, t: j ? j.t : 0, g: j ? j.g : null, roz: j ? j.rozmiar : 0, sygnal: s.sygnal, tryb: s.tryb, pozostalo: j ? j.pozostalo : 0, powod: j ? j.powod : '', uciekl: s.jastrzabLog.uciekl, zgubil: s.jastrzabLog.zgubil, zlapany: s.jastrzabLog.zlapany, mokro: s.mokro, cien: o.gdzie().filter(x => x.typ === 'jastrzab').map(x => x.cien)[0] });
      if (j && j.faza === 'poscig' && chase0 === null) chase0 = s.graCzas;
      if (ex === 'chmura' && chase0 !== null && !extraDone && s.graCzas - chase0 > 0.8) { extraDone = true; o.zdarzenie('deszcz', { z: 1.0, dx: 0 }); }
      const done = (ex === 'zlapanie' && s.tryb === 'koniec') || (ex !== 'zlapanie' && s.graCzas > mg);
      if (done || s.graCzas > mg + 5) { res({ log, chase0 }); return; }
      requestAnimationFrame(tick);
    })();
  }), [lockV, tempo, maxGame, extra]);

  /* e1: zapowiedź 2 s przed pościgiem, sygnał i cień */
  const E1 = await watchHawk(0.95, 4, 5.5, 'brak');
  const zap = E1.log.filter(x => x.faza === 'zapowiedz'), pos0 = E1.log.find(x => x.faza === 'poscig');
  const zapDur = zap.length ? zap[zap.length - 1].gc - zap[0].gc : 0;
  chk(zap.length > 5 && zapDur > 1.7 && zapDur <= 2.1 && pos0 && pos0.gc - zap[0].gc > 1.95 && pos0.gc - zap[0].gc < 2.25, 'zapowiedź trwa ' + f2(zapDur) + ' s, pościg zaczyna się po ' + (pos0 ? f2(pos0.gc - zap[0].gc) : '?') + ' s (cel 2)', 'zapowiedź ' + zapDur + ' / pościg po ' + (pos0 ? pos0.gc - zap[0].gc : '?'));
  chk(zap.every(x => x.sygnal === true && x.cien === true) && E1.log.filter(x => x.faza === 'poscig').every(x => x.sygnal === false && x.cien === false), 'sygnał wizualny i cień tylko w zapowiedzi (nie w pościgu)');
  chk(zap.length && zap[0].pozostalo > 1.85 && zap[zap.length - 1].pozostalo < 0.3, 'licznik zapowiedzi odlicza ' + f2(zap[0].pozostalo) + ' -> ' + f2(zap[zap.length - 1].pozostalo) + ' s');

  /* e2: ucieczka wysoką prędkością (s=1 przez cały pościg) */
  const E2 = await watchHawk(1, 6, 14.5, 'ucieczka');
  const e2last = E2.log[E2.log.length - 1], e2chase = E2.log.filter(x => x.faza === 'poscig'), e2od = E2.log.find(x => x.faza === 'odlot');
  chk(e2last.tryb === 'gra' && e2last.zlapany === 0, 'ucieczka prędkością: bieg trwa, brak złapania (tryb ' + e2last.tryb + ')', 'ucieczka nie działa: ' + JSON.stringify(e2last));
  chk(e2chase.length && Math.min(...e2chase.map(x => x.g)) > 0.97, 'przy s=1 dystans do jastrzębia nie maleje (min g=' + f2(Math.min(...e2chase.map(x => x.g))) + ')');
  chk(e2od && e2od.powod === 'predkosc' && e2last.uciekl === 1 && Math.abs((e2od.gc - e2chase[0].gc) - K.HAW_CHASE) < 0.4, 'pościg trwa ' + (e2od ? f2(e2od.gc - e2chase[0].gc) : '?') + ' s (cel ' + K.HAW_CHASE + '), potem jastrząb odlatuje (powód: prędkość)', 'odlot: ' + JSON.stringify(e2od));
  chk(e2last.faza === null, 'po odlocie jastrząb znika ze sceny');

  /* e3: brak ucieczki (s=0): jastrząb rośnie i łapie; koniec biegu z tekstem */
  const E3 = await watchHawk(0, 4, 40, 'zlapanie');
  const e3chase = E3.log.filter(x => x.faza === 'poscig'), e3catch = E3.log.find(x => x.tryb === 'zlapany'), e3end = E3.log[E3.log.length - 1];
  const tCatch = e3catch ? e3catch.gc - e3chase[0].gc : -1;
  chk(e3catch && tCatch > 4.5 && tCatch < 9.5, 'bez ucieczki jastrząb łapie po ' + f2(tCatch) + ' s pościgu (zakres 4,5-9,5)', 'złapanie po ' + tCatch);
  const szA = e3chase[2].roz, szB = e3chase[Math.floor(e3chase.length * 0.9)].roz;
  chk(szB > szA * 1.6 && e3chase.every((x, i) => i === 0 || x.roz >= e3chase[i - 1].roz - 0.02), 'jastrząb rośnie na ekranie w czasie pościgu (rozmiar ' + f2(szA) + ' -> ' + f2(szB) + ')', 'rozmiar ' + szA + ' -> ' + szB);
  chk(e3end.tryb === 'koniec', 'złapanie kończy bieg (tryb "' + e3end.tryb + '")');
  await sleep(1000);
  const ov = await ev(() => { const e = document.getElementById('wynik'); return { pokaz: e.classList.contains('pokaz'), op: +getComputedStyle(e).opacity, txt: e.innerText.replace(/\s+/g, ' ').trim(), m: document.getElementById('w-m').textContent, dist: __okruszek.stan().dystans, btn: document.getElementById('jeszcze').offsetHeight }; });
  chk(ov.pokaz && ov.op > 0.9 && /Jastrząb był szybszy\. Okruszek wraca jutro\./.test(ov.txt), 'ekran końca: "' + ov.txt + '"', 'ekran końca: ' + JSON.stringify(ov));
  chk(ov.m.replace(/\s|\u00a0/g, '') === String(Math.floor(ov.dist)) && !/krew|zgin|martw/i.test(ov.txt), 'ekran końca pokazuje metry (' + ov.m + ') i nie ma makabry');
  await page.click('#jeszcze'); await sleep(300);
  const sNew = await st();
  chk(sNew.tryb === 'gra' && sNew.jastrzab === null && sNew.dystans < 20, 'Jeszcze raz: nowy bieg, bez jastrzębia (tryb ' + sNew.tryb + ')');
  const ov2 = await ev(() => document.getElementById('wynik').classList.contains('pokaz'));
  chk(!ov2, 'ekran końca znika po "Jeszcze raz"');

  /* e4: ucieczka w gęstą chmurę (prędkość 0, a jednak bez złapania) */
  const E4 = await watchHawk(0, 4, 8, 'chmura');
  const e4last = E4.log[E4.log.length - 1], e4od = E4.log.find(x => x.faza === 'odlot');
  chk(e4od && e4od.powod === 'zgubil' && e4last.zgubil === 1 && e4last.zlapany === 0 && e4last.tryb === 'gra', 'wlot w gęstą chmurę zrywa pościg przy s=0 (powód: ' + (e4od ? e4od.powod : '?') + ', tryb ' + e4last.tryb + ')', 'ucieczka chmurą: ' + JSON.stringify(e4od));
  chk(E4.log.some(x => x.mokro), 'schowanie się w chmurze kosztuje: ptaszek jest mokry');

  /* ---------- (f) biom nocny i kolejność koloru ---------- */
  console.log('(f) noc (pora doby) i kolejność koloru');
  const ordered = (k) => k.niebo >= k.daleko - 1e-9 && k.daleko >= k.blisko - 1e-9 && k.blisko >= k.smugi - 1e-9 && k.smugi >= 0 && k.niebo <= 1 + 1e-9;
  const sat = () => ev(() => { const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
    const d = x.getImageData(0, 0, t.width, t.height).data, sc = c.width / 390, bw = 90 * sc, bh = 90 * sc, bcx = c.width / 2, bcy = 0.76 * c.height; let n = 0, tot = 0, n30 = 0;
    for (let y = 0; y < t.height; y += 2) for (let xx = 0; xx < t.width; xx += 2) { if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bh) continue; const i = (y * t.width + xx) * 4, mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); tot++; if (mx - mn > 60) n++; if (mx - mn > 30) n30++; } return { n, tot, n30 }; });
  const col = {}, satN = {}, star = {};
  for (const noc of [false, true]) {
    for (const v of [0, 0.5, 1]) {
      await ev(([n, x]) => { const o = __okruszek; o.odblokuj(); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.nowyBieg(); o.noc(n); o.ustaw(x); }, [noc, v]);
      await sleep(900);
      const k = await ev(() => __okruszek.kolory()), s2 = await st();
      col[(noc ? 'n' : 'd') + v] = k; star[(noc ? 'n' : 'd') + v] = s2.gwiazdy; satN[(noc ? 'n' : 'd') + v] = await sat();
      chk(ordered(k), (noc ? 'noc' : 'dzień') + ' s=' + v + ': kolejność niebo >= daleko >= blisko >= smugi ' + JSON.stringify({ n: +k.niebo.toFixed(3), d: +k.daleko.toFixed(3), b: +k.blisko.toFixed(3), s: +k.smugi.toFixed(3) }));
    }
  }
  const n0 = col.n0, n1 = col.n1;
  chk(n0.niebo === 0 && n0.daleko === 0 && n0.blisko === 0 && n0.smugi === 0 && n0.noc === 1, 'noc s=0: zero koloru (same kontury), biom nocny włączony');
  chk(col['n0.5'].niebo > col['n0.5'].daleko && col['n0.5'].daleko > col['n0.5'].blisko && col['n0.5'].smugi === 0, 'noc s=0,5: kolor wchodzi od tyłu do przodu');
  chk(n1.niebo === 1 && n1.daleko === 1 && n1.blisko === 1 && n1.smugi === 1, 'noc s=1: pełny kolor');
  chk(['niebo', 'daleko', 'blisko', 'smugi'].every(k => col['n0.5'][k] === col['d0.5'][k] && col.n1[k] === col.d1[k]), 'reguła kolor z prędkością identyczna w dzień i w nocy');
  chk(satN.n0.n / satN.n0.tot < 0.002, 'noc s=0: tylko kontur, brak nasyconych pikseli poza ptaszkiem (' + satN.n0.n + ' z ' + satN.n0.tot + ')', 'noc s=0 ma kolor: ' + JSON.stringify(satN.n0));
  chk(satN.n1.n30 / satN.n1.tot > 0.4, 'noc s=1: kolor wypełnia obraz (Z3b: paleta pastelowa, więc próg chroma > 30: ' + (100 * satN.n1.n30 / satN.n1.tot).toFixed(0) + '% pikseli)', 'noc s=1 bez koloru: ' + JSON.stringify(satN.n1));
  chk(star.n1 > 0.9 && star['n0.5'] > 0.9 && star.d1 < 0.05, 'gwiazdy: w nocy nie gasną z kolorem (s=1: ' + f2(star.n1) + '), w dzień przy s=1 gasną (' + f2(star.d1) + ')', 'gwiazdy ' + JSON.stringify(star));
  /* Z3b: biom nocny po 1000 m zastąpiła doba w tle (noc jest jedną z pór); płynność doby i jej tempo sprawdza gra_test_z3b.cjs */
  await ev(() => { __okruszek.tempo(1); __okruszek.nowyBieg(); });

  /* ---------- błędy konsoli ---------- */
  const real = errors.filter(e => !/favicon/i.test(e));
  chk(real.length === 0, 'brak błędów i ostrzeżeń konsoli', 'błędy konsoli: ' + real.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fail ? ('TEST Z3 NIE PRZESZEDŁ (' + fail + ')') : 'TEST Z3 OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST Z3 BŁĄD: ' + e); process.exit(2); });
