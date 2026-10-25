/* Okruszek Z2b: testy trzech trybów sterowania (Playwright, prawdziwy dotyk przez CDP). Użycie: node gra_test_z2b.cjs [plik.html]
   (a) tryb 1 (jeden kciuk) domyślny i bez zmian zachowania (pełne testy Z2 odpalane osobno: gra_test_z2.cjs)
   (b) tryb 2 (dwa kciuki jak skrzydła): lewy = skręt w lewo, prawy = w prawo, oba = nurkowanie, puszczenie jednego bez ducha, po puszczeniu wszystkich machanie,
       skrzydła ptaszka animowane zgodnie z kciukami (parametr rysowania i piksele), stukanie na zmianę daje krótki, wygaszany przyrost wysokości
   (c) tryb 3 (drążek): wychylenie skręca proporcjonalnie, baza idzie za kciukiem, drugi palec w prawej połowie = nurkowanie, drążek znika po puszczeniu
   (d) bot-gracz leci 60 s czasu gry w każdym z trzech trybów (prawdziwe dotyki, trafianie w prądy, bez przeszkód) bez lądowania
   (e) przełączanie trybu w trakcie dotyku (hak, klawisz T) nie zostawia ducha; dwa i trzy palce w każdym trybie nie blokują gry
   (f) wybór i czułość zapamiętane po przeładowaniu (localStorage), ?sterowanie=n nadpisuje, pierwsze uruchomienie pokazuje wybór, gra działa bez dostępu do localStorage
   (g) przycisk "sterowanie": min. 44 px, w stałej strefie, nie nachodzi na wskaźnik poziomu ani na HUD (kilka rozmiarów ekranu i stanów gry)
   (h) suwak czułości zmienia skręt we wszystkich trybach (mysz, klawiatura też)
   Czas gry jest przyspieszany hakiem tempo() (tylko ?test). Kończy się kodem 0 tylko gdy wszystko przeszło. */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const base = 'file:///' + file.replace(/\\/g, '/');
const url = base + '?test&seed=23';
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const f2 = (v) => (typeof v === 'number' ? v.toFixed(2) : String(v));
const TEMPO = +process.env.TEMPO || 3;   /* tempo czasu gry dla botów */
const BOT_S = +process.env.BOT_S || 60;
const CHROME = 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe';

(async () => {
  console.log('TEST Z2b ' + file + ' (tempo botów x' + TEMPO + ', bot ' + BOT_S + ' s czasu gry)');
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const mkCtx = (vp, extra) => browser.newContext(Object.assign({ viewport: vp || { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true }, extra || {}));
  const ctx = await mkCtx();
  const page = await ctx.newPage();
  const errors = [];
  const watch = (pg) => { pg.on('pageerror', e => errors.push('pageerror: ' + e)); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); }); };
  watch(page);
  const ev = (f, a) => page.evaluate(f, a);
  const st = () => ev(() => __okruszek.stan());
  const cdp = await ctx.newCDPSession(page);
  const touch = async (type, pts) => { await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p[1], y: p[2], id: p[0] })) }); };
  const LP = [1, 80, 700], RP = [2, 310, 700];   /* lewy i prawy kciuk w dolnych rogach (390 x 844) */
  const upAll = async () => { try { await touch('touchCancel', []); } catch (_) { } await sleep(60); };
  const fresh = async (mode) => {
    await upAll();
    await ev((m) => { const o = __okruszek; o.panel(false); o.odblokuj(); o.nurkuj(false); o.przesun(null); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.czulosc(1); o.sterowanie(m || 1); o.nowyBieg(); }, mode);
    await sleep(120);
  };

  await page.goto(url);
  await page.waitForTimeout(800);
  const K = await ev(() => __okruszek.stale());
  const need = ['sterowanie', 'tryb', 'czulosc', 'dotyk', 'panel', 'wskaznik', 'stan', 'nowyBieg', 'tempo'];
  const miss = await ev((n) => n.filter(k => typeof __okruszek[k] !== 'function'), need);
  chk(miss.length === 0, 'hak Z2b kompletny (' + need.length + ' funkcji)', 'w haku brakuje: ' + miss.join(', '));
  const snap = async () => { const s = await st(); return { pl: s.palceL, pp: s.palceP, p: s.palce, nur: s.nurkuje, vx: s.vx, bx: s.bx, h: s.h, s: s.s, sHold: s.sHold, sl: s.skrzL, sp: s.skrzP, dr: s.drazek, gt: s.graCzas, lad: s.ladunek, mach: s.machniec }; };

  /* ---------- (a) tryb 1 domyślny ---------- */
  console.log('(a) tryb 1 (jeden kciuk) domyślny, bez zmian');
  chk((await ev(() => __okruszek.tryb())) === 1 && (await st()).sterowanie === 1, 'bez zapisu i bez ?sterowanie= tryb = 1 (jeden kciuk), czułość ' + (await ev(() => __okruszek.czulosc())));
  chk(!(await st()).panel, 'w trybie ?test pierwsze uruchomienie nie zasłania gry panelem (panel zamknięty)');
  await fresh(1);
  await touch('touchStart', [LP]); await sleep(300);
  let a = await snap();
  chk(a.p === 1 && a.nur && a.sl > 0.5 && a.sp > 0.5, 'tryb 1: jeden palec = nurkowanie, oba skrzydła składają się razem ' + JSON.stringify({ nur: a.nur, sl: f2(a.sl), sp: f2(a.sp) }));
  await touch('touchMove', [[1, 150, 700]]); await sleep(500);
  a = await snap(); chk(a.vx > 30, 'tryb 1: przesunięcie palca w prawo skręca (vx=' + f2(a.vx) + ')');
  await touch('touchEnd', [[1, 150, 700]]); await sleep(150);
  a = await snap(); chk(a.p === 0 && !a.nur, 'tryb 1: puszczenie palca bez ducha');

  /* ---------- (b) tryb 2 ---------- */
  console.log('(b) tryb 2: dwa kciuki jak skrzydła');
  await fresh(2);
  a = await snap(); const bx0 = a.bx;
  chk((await ev(() => __okruszek.tryb())) === 2, 'tryb 2 ustawiony hakiem');
  await touch('touchStart', [LP]); await sleep(600);
  a = await snap();
  chk(a.pl === 1 && a.pp === 0 && !a.nur, 'lewy kciuk: tylko lewa połowa, bez nurkowania ' + JSON.stringify({ pl: a.pl, pp: a.pp, nur: a.nur }));
  chk(a.vx < -60 && a.bx < bx0 - 25, 'lewy kciuk = skręt w lewo (vx=' + f2(a.vx) + ', bx ' + Math.round(bx0) + ' -> ' + Math.round(a.bx) + ')');
  chk(a.sl > 0.85 && a.sp < 0.2, 'lewe skrzydło złożone, prawe rozłożone (skrzL=' + f2(a.sl) + ', skrzP=' + f2(a.sp) + ')');
  await touch('touchEnd', [LP]); await sleep(120); const bxL = (await snap()).bx;
  await touch('touchStart', [RP]); await sleep(600);
  a = await snap();
  chk(a.pl === 0 && a.pp === 1 && !a.nur, 'prawy kciuk: tylko prawa połowa, bez nurkowania');
  chk(a.vx > 60 && a.bx > bxL + 25, 'prawy kciuk = skręt w prawo (vx=' + f2(a.vx) + ', bx ' + Math.round(bxL) + ' -> ' + Math.round(a.bx) + ')');
  chk(a.sp > 0.85 && a.sl < 0.2, 'prawe skrzydło złożone, lewe rozłożone (skrzL=' + f2(a.sl) + ', skrzP=' + f2(a.sp) + ')');
  /* oba = nurkowanie */
  await upAll(); await fresh(2);
  const h1 = (await snap()).h;
  await touch('touchStart', [LP]); await touch('touchStart', [LP, RP]); await sleep(1500);
  a = await snap();
  chk(a.pl === 1 && a.pp === 1 && a.nur, 'oba kciuki = nurkowanie ' + JSON.stringify({ pl: a.pl, pp: a.pp, nur: a.nur }));
  chk(a.s > 0.1 && a.sHold > 0.1, 'nurkowanie: prędkość rośnie (s=' + f2(a.s) + ', sHold=' + f2(a.sHold) + ')');
  chk(a.h < h1 - 0.15, 'nurkowanie: wysokość spada (' + f2(h1) + ' -> ' + f2(a.h) + ')');
  chk(Math.abs(a.vx) < 70, 'oba kciuki: brak skrętu (vx=' + f2(a.vx) + ')');
  chk(a.sl > 0.85 && a.sp > 0.85, 'oba skrzydła złożone (skrzL=' + f2(a.sl) + ', skrzP=' + f2(a.sp) + ')');
  /* puszczenie jednego nie zostawia ducha */
  await touch('touchEnd', [LP]); await sleep(500);
  a = await snap();
  chk(a.pl === 0 && a.pp === 1 && !a.nur && a.vx > 30, 'puszczony lewy: zostaje prawy, nurkowanie kończy się, skręt w prawo (nur=' + a.nur + ', vx=' + f2(a.vx) + ')');
  chk(a.sl < 0.25 && a.sp > 0.85, 'lewe skrzydło znów rozłożone, prawe złożone (' + f2(a.sl) + ' / ' + f2(a.sp) + ')');
  await touch('touchStart', [RP, LP]); await sleep(300); await touch('touchEnd', [RP]); await sleep(400);
  a = await snap(); chk(a.pl === 1 && a.pp === 0 && !a.nur && a.vx < -30, 'puszczony prawy (w odwrotnej kolejności): zostaje lewy, skręt w lewo (vx=' + f2(a.vx) + ')');
  const sAtRel = (await snap()).sHold;
  await touch('touchEnd', [LP]); await sleep(1600);
  a = await snap();
  chk(a.p === 0 && !a.nur && a.sl < 0.2 && a.sp < 0.2, 'puszczone wszystkie: brak ducha, skrzydła rozłożone (machanie) ' + JSON.stringify({ p: a.p, nur: a.nur, sl: f2(a.sl), sp: f2(a.sp) }));
  chk(a.sHold < Math.max(0.02, sAtRel * 0.6) && Math.abs(a.vx) < 25, 'po puszczeniu wszystkich wraca machanie (sHold ' + f2(sAtRel) + ' -> ' + f2(a.sHold) + ', vx=' + f2(a.vx) + ')');
  /* anulowanie, blur */
  await touch('touchStart', [LP]); await touch('touchStart', [LP, RP]); await sleep(300);
  await touch('touchCancel', []); await sleep(150);
  a = await snap(); chk(a.p === 0 && !a.nur, 'touchCancel obu kciuków czyści stan ' + JSON.stringify({ p: a.p, nur: a.nur }));
  await ev(() => { __okruszek.dotyk('dol', 1, 0.2, 0.8); __okruszek.dotyk('dol', 2, 0.8, 0.8); window.dispatchEvent(new Event('blur')); }); await sleep(100);
  a = await snap(); chk(a.p === 0 && !a.nur, 'blur czyści oba kciuki (hak dotyk() z y)');
  /* trzy palce: dwa w lewej połowie nie blokują, wszystkie puszczone = pusto */
  await touch('touchStart', [LP]); await touch('touchStart', [LP, [3, 140, 640]]); await touch('touchStart', [LP, [3, 140, 640], RP]); await sleep(300);
  a = await snap(); chk(a.p === 3 && a.pl === 2 && a.pp === 1 && a.nur, 'trzy palce w trybie 2: gra reaguje (nurkowanie), nic się nie zawiesza ' + JSON.stringify({ p: a.p, pl: a.pl, pp: a.pp, nur: a.nur }));
  await touch('touchEnd', [[3, 140, 640]]); await touch('touchEnd', [RP]); await sleep(100); await touch('touchEnd', [LP]); await sleep(300);
  a = await snap(); chk(a.p === 0 && !a.nur, 'trzy palce puszczone w innej kolejności: brak ducha');
  /* skrzydła w pikselach: przy zredukowanym ruchu ptaszek stoi (ale korpus i szalik dalej falują), więc porównujemy tylko pola skrzydeł po bokach korpusu
     i odnosimy różnicę do szumu (dwa zrzuty bez dotyku) */
  {
    const c2 = await mkCtx(null, { reducedMotion: 'reduce' }); const p2 = await c2.newPage(); watch(p2);
    await p2.goto(base + '?test&seed=23&sterowanie=2'); await p2.waitForTimeout(700);
    await p2.evaluate(() => { const o = __okruszek; o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(0.1); o.czulosc(0.5); o.nowyBieg(); });
    const grab = async (acts) => {
      await p2.evaluate((ac) => { const o = __okruszek; o.dotyk('gora', 1); o.dotyk('gora', 2); ac.forEach(([id, x]) => o.dotyk('dol', id, x, 0.8)); }, acts);
      await p2.waitForTimeout(800);
      return p2.evaluate(() => { const c = document.getElementById('g'), sc = c.width / 390, t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
        const by = 0.76 * (c.height / sc), box = (x0, x1) => { const X0 = Math.round(x0 * sc), Wd = Math.round((x1 - x0) * sc), Y0 = Math.round((by - 36) * sc), Hd = Math.round(70 * sc); return Array.from(x.getImageData(X0, Y0, Wd, Hd).data.filter((v, i) => i % 4 < 3)); };
        return { L: box(138, 176), R: box(214, 252), w: Math.round(38 * sc), h: Math.round(70 * sc) }; });
    };
    const onlyL = await grab([[1, 0.2]]), onlyR = await grab([[2, 0.8]]);
    /* środek ciężkości jasnych pikseli (kontur skrzydła) w polu: złożone skrzydło zwisa w dół, rozłożone sterczy w górę, więc środek ciężkości jest niżej */
    const cy = (A, w, h) => { let sy = 0, n = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 3; if (Math.min(A[i], A[i + 1], A[i + 2]) > 140) { sy += y; n++; } } return n ? sy / n : -1; };
    const w = onlyL.w, h = onlyL.h, cLL = cy(onlyL.L, w, h), cLR = cy(onlyR.L, w, h), cRL = cy(onlyL.R, w, h), cRR = cy(onlyR.R, w, h);
    console.log('  info środek ciężkości konturu skrzydła (px, w dół = większe): pole lewe: L złożone ' + cLL.toFixed(1) + ', P złożone ' + cLR.toFixed(1) + '; pole prawe: L złożone ' + cRL.toFixed(1) + ', P złożone ' + cRR.toFixed(1));
    chk(cLL > cLR + 5 && cRR > cRL + 5, 'rysunek: złożone skrzydło zwisa (lewy kciuk obniża kontur lewego skrzydła o ' + (cLL - cLR).toFixed(1) + ' px, prawy prawego o ' + (cRR - cRL).toFixed(1) + ' px)');
    await c2.close();
    if (process.env.ONLY_PIX) { await browser.close(); process.exit(fail ? 1 : 0); }
  }
  /* stukanie na zmianę: krótki, wygaszany przyrost wysokości; nie na zmianę = nic */
  await fresh(2);
  let t0 = await snap();
  for (let i = 0; i < 6; i++) { const P = i % 2 ? RP : LP; await touch('touchStart', [P]); await sleep(40); await touch('touchEnd', [P]); await sleep(110); }
  let t1 = await snap();
  const gainBurst = (t1.h - t0.h) + K.SINK * (t1.gt - t0.gt);
  chk(t1.mach >= 3 && gainBurst > 0.02, 'stukanie na zmianę L-P-L-P-L-P daje przyrost wysokości (machnięć ' + t1.mach + ', przyrost ok. ' + gainBurst.toFixed(3) + ')');
  chk(t1.pl === 0 && t1.pp === 0 && !t1.nur, 'stukanie nie zostawia ducha ani nie wywołuje nurkowania');
  await fresh(2); t0 = await snap();
  for (let i = 0; i < 24; i++) { const P = i % 2 ? RP : LP; await touch('touchStart', [P]); await sleep(30); await touch('touchEnd', [P]); await sleep(90); }
  t1 = await snap();
  const gainSpam = (t1.h - t0.h) + K.SINK * (t1.gt - t0.gt);
  console.log('  info 24 stuknięć w ' + (t1.gt - t0.gt).toFixed(1) + ' s: machnięć ' + t1.mach + ', przyrost wysokości ok. ' + gainSpam.toFixed(3) + ', ładunek ' + f2(t1.lad));
  chk(gainSpam < 0.13 && gainSpam > 0.03, 'spamowanie stukania jest wygaszone (przyrost ' + gainSpam.toFixed(3) + ' < 0,13, bez wygaszania byłoby ok. ' + (t1.mach * 0.03).toFixed(2) + ')');
  await fresh(2); t0 = await snap();
  for (let i = 0; i < 6; i++) { await touch('touchStart', [LP]); await sleep(40); await touch('touchEnd', [LP]); await sleep(110); }
  t1 = await snap(); chk(t1.mach === t0.mach, 'stukanie tą samą stroną nie daje przyrostu (machnięć ' + t1.mach + ')');

  /* ---------- (c) tryb 3 ---------- */
  console.log('(c) tryb 3: drążek');
  await fresh(3);
  a = await snap(); chk(!a.dr.jest && a.dr.widocznosc < 0.05, 'przed dotknięciem drążka nie widać');
  await touch('touchStart', [[1, 120, 640]]); await sleep(350);
  a = await snap();
  chk(a.dr.jest && a.dr.widocznosc > 0.6 && a.dr.srednica >= 130, 'tuż po dotknięciu lewej połowy drążek jest widoczny, średnica pola ' + a.dr.srednica + ' px >= 130 (widoczność ' + f2(a.dr.widocznosc) + ')');
  chk(Math.abs(a.dr.wychylenie) < 0.15 && !a.nur, 'brak wychylenia = brak skrętu i nurkowania (wychylenie ' + f2(a.dr.wychylenie) + ')');
  const vxAt = async (x) => { await touch('touchMove', [[1, x, 640]]); await sleep(700); const s = await snap(); return { vx: s.vx, u: s.dr.wychylenie, bx: s.dr.bx }; };
  const m20 = await vxAt(140), m40 = await vxAt(160), m70 = await vxAt(190);
  console.log('  info wychylenie +20 px: u=' + f2(m20.u) + ' vx=' + f2(m20.vx) + '; +40 px: u=' + f2(m40.u) + ' vx=' + f2(m40.vx) + '; +70 px: u=' + f2(m70.u) + ' vx=' + f2(m70.vx));
  chk(Math.abs(m20.u - 20 / 70) < 0.05 && Math.abs(m40.u - 40 / 70) < 0.05 && m70.u > 0.93, 'wychylenie drążka proporcjonalne do przesunięcia kciuka (0,29 / 0,57 / 1,0)');
  chk(m20.vx > 40 && m40.vx / m20.vx > 1.6 && m40.vx / m20.vx < 2.4 && m70.vx / m40.vx > 1.4 && m70.vx / m40.vx < 2.1, 'skręt proporcjonalny do wychylenia (vx ' + f2(m20.vx) + ' / ' + f2(m40.vx) + ' / ' + f2(m70.vx) + ')');
  const mFar = await vxAt(330);
  chk(mFar.bx > m70.bx + 60 && mFar.u > 0.95 && mFar.vx > m70.vx * 0.95, 'daleko za polem: baza idzie za kciukiem (bx ' + Math.round(m70.bx) + ' -> ' + Math.round(mFar.bx) + '), wychylenie pełne');
  const mLeft = await vxAt(mFar.bx - 35);
  chk(mLeft.u < -0.4 && mLeft.vx < -50, 'wychylenie w lewo skręca w lewo (u=' + f2(mLeft.u) + ', vx=' + f2(mLeft.vx) + ')');
  /* drugi palec w prawej połowie = nurkowanie */
  const hh = (await snap()).h;
  await touch('touchStart', [[1, mFar.bx - 35, 640], RP]); await sleep(900);
  a = await snap();
  chk(a.nur && a.pp === 1 && a.dr.jest && a.sHold > 0.05 && a.h < hh - 0.05, 'prawy kciuk (druga ręka) = nurkowanie, drążek dalej działa (sHold ' + f2(a.sHold) + ', h ' + f2(hh) + ' -> ' + f2(a.h) + ')');
  await touch('touchEnd', [RP]); await sleep(300);
  a = await snap(); chk(!a.nur && a.dr.jest, 'puszczony prawy kciuk: koniec nurkowania, drążek zostaje');
  await touch('touchEnd', [[1, mFar.bx - 35, 640]]); await sleep(120);
  a = await snap(); chk(!a.dr.jest && a.p === 0, 'puszczony drążek: stan czysty');
  await sleep(500); a = await snap(); chk(a.dr.widocznosc < 0.05, 'drążek znika po puszczeniu (widoczność ' + f2(a.dr.widocznosc) + ')');
  await touch('touchStart', [RP]); await sleep(300);
  a = await snap(); chk(a.nur && !a.dr.jest && Math.abs(a.vx) < 30, 'sam prawy kciuk: nurkowanie bez drążka i bez skrętu');
  await touch('touchEnd', [RP]); await sleep(150);
  await touch('touchStart', [[1, 100, 600]]); await touch('touchStart', [[1, 100, 600], [4, 170, 560]]); await touch('touchStart', [[1, 100, 600], [4, 170, 560], RP]); await sleep(300);
  a = await snap(); chk(a.p === 3 && a.dr.jest && a.nur, 'trzy palce w trybie 3: jeden drążek (drugi palec w lewej połowie ignorowany), nurkowanie ' + JSON.stringify({ p: a.p, jest: a.dr.jest, nur: a.nur }));
  await touch('touchEnd', [[4, 170, 560]]); await touch('touchEnd', [RP]); await sleep(80); await touch('touchEnd', [[1, 100, 600]]); await sleep(300);
  a = await snap(); chk(a.p === 0 && !a.nur && !a.dr.jest, 'trzy palce puszczone w innej kolejności: brak ducha');
  await ev(() => { __okruszek.dotyk('dol', 1, 0.2, 0.8); __okruszek.dotyk('dol', 2, 0.8, 0.8); window.dispatchEvent(new Event('blur')); }); await sleep(100);
  a = await snap(); chk(a.p === 0 && !a.dr.jest, 'blur czyści drążek');

  /* ---------- (e) przełączanie trybu w trakcie dotyku ---------- */
  console.log('(e) przełączanie trybu w trakcie dotyku, T');
  await fresh(2);
  await touch('touchStart', [LP]); await touch('touchStart', [LP, RP]); await sleep(400);
  a = await snap(); const dived = a.nur;
  await ev(() => __okruszek.sterowanie(1)); await sleep(100);
  a = await snap(); chk(dived && a.p === 0 && !a.nur && a.pl === 0 && a.pp === 0, 'tryb 2 -> 1 przy dwóch kciukach: stan wyczyszczony ' + JSON.stringify({ p: a.p, nur: a.nur }));
  await touch('touchEnd', [LP]); await touch('touchEnd', [RP]); await sleep(150);
  a = await snap(); chk(a.p === 0 && !a.nur, 'puszczenie palców po zmianie trybu: nadal czysto');
  await touch('touchStart', [LP]); await sleep(200);
  a = await snap(); chk(a.p === 1 && a.nur, 'po zmianie trybu nowy dotyk działa w nowym trybie (tryb 1: nurkowanie)');
  await touch('touchEnd', [LP]); await sleep(100);
  await fresh(3);
  await touch('touchStart', [[1, 120, 640]]); await touch('touchMove', [[1, 170, 640]]); await sleep(300);
  a = await snap(); const hadStick = a.dr.jest;
  await ev(() => __okruszek.sterowanie(2)); await sleep(100);
  a = await snap(); chk(hadStick && !a.dr.jest && a.p === 0 && Math.abs(a.dr.wychylenie) < 0.01, 'tryb 3 -> 2 przy drążku: drążek zniknął, stan czysty');
  await touch('touchMove', [[1, 200, 640]]); await sleep(300);
  a = await snap(); chk(a.p === 0, 'ruch starego palca po zmianie trybu nie wskrzesza stanu');
  await touch('touchEnd', [[1, 200, 640]]); await sleep(100);
  await fresh(1);
  await touch('touchStart', [LP]); await sleep(150);
  await page.keyboard.press('t'); await sleep(120);
  a = await snap(); chk((await ev(() => __okruszek.tryb())) === 2 && a.p === 0 && !a.nur, 'klawisz T w trakcie dotyku: tryb 1 -> 2, palce wyczyszczone');
  await touch('touchEnd', [LP]); await sleep(100);
  await page.keyboard.press('T'); await sleep(60); const m3 = await ev(() => __okruszek.tryb());
  await page.keyboard.press('t'); await sleep(60); const m1 = await ev(() => __okruszek.tryb());
  chk(m3 === 3 && m1 === 1, 'klawisz T przełącza kolejne tryby 2 -> 3 -> 1 (' + m3 + ', ' + m1 + ')');
  /* pauza w trybach 2 i 3 czyści palce */
  for (const m of [2, 3]) {
    await fresh(m); await touch('touchStart', [LP]); await touch('touchStart', [LP, RP]); await sleep(200);
    await page.keyboard.press('p'); await sleep(150);
    a = await snap(); const pz = (await st()).pauza;
    chk(pz && a.p === 0 && !a.nur, 'tryb ' + m + ': pauza P czyści palce');
    await page.keyboard.press('p'); await sleep(100); await touch('touchCancel', []); await sleep(100);
  }
  /* mysz i klawiatura bez zmian we wszystkich trybach */
  for (const m of [1, 2, 3]) {
    await fresh(m);
    await page.mouse.move(300, 400); await sleep(500);
    const sv = await snap(); await page.mouse.down(); await sleep(150); const sn = await snap(); await page.mouse.up(); await sleep(100);
    await page.mouse.move(195, 400); await ev(() => __okruszek.przesun(null));
    await page.keyboard.down('ArrowLeft'); await sleep(500); const kl = await snap(); await page.keyboard.up('ArrowLeft'); await sleep(80);
    await page.keyboard.down(' '); await sleep(150); const ks = await snap(); await page.keyboard.up(' '); await sleep(80);
    chk(sv.vx > 20 && sn.nur && kl.vx < -40 && ks.nur, 'tryb ' + m + ': mysz (skręt, LPM) i klawiatura (strzałka, spacja) działają jak dotąd');
  }

  /* ---------- (h) suwak czułości ---------- */
  console.log('(h) czułość skrętu we wszystkich trybach');
  const sensRun = async (mode, c, gesture) => {
    await fresh(mode); await ev((x) => __okruszek.czulosc(x), c);
    await gesture();
    await sleep(800); const s = await snap(); await upAll(); return s.vx;
  };
  const gestures = {
    1: async () => { await touch('touchStart', [[1, 150, 700]]); await touch('touchMove', [[1, 180, 700]]); },
    2: async () => { await touch('touchStart', [RP]); },
    3: async () => { await touch('touchStart', [[1, 120, 640]]); await touch('touchMove', [[1, 150, 640]]); }
  };
  for (const m of [1, 2, 3]) {
    const lo = await sensRun(m, 0.5, gestures[m]), mid = await sensRun(m, 1, gestures[m]), hi = await sensRun(m, 1.5, gestures[m]);
    console.log('  info tryb ' + m + ': vx przy czułości 0,5 / 1,0 / 1,5 = ' + f2(lo) + ' / ' + f2(mid) + ' / ' + f2(hi));
    chk(lo > 10 && hi / lo > 2.5 && hi / lo < 3.5 && mid > lo * 1.7 && mid < hi * 0.8, 'tryb ' + m + ': czułość 0,5 < 1,0 < 1,5 skaluje skręt (stosunek 1,5/0,5 = ' + f2(hi / lo) + ', oczekiwane 3)');
  }
  {
    const lo = await (async () => { await fresh(1); await ev(() => __okruszek.czulosc(0.5)); await page.keyboard.down('ArrowRight'); await sleep(800); const s = await snap(); await page.keyboard.up('ArrowRight'); return s.vx; })();
    const hi = await (async () => { await fresh(1); await ev(() => __okruszek.czulosc(1.5)); await page.keyboard.down('ArrowRight'); await sleep(800); const s = await snap(); await page.keyboard.up('ArrowRight'); return s.vx; })();
    chk(lo > 10 && hi / lo > 2.5 && hi / lo < 3.5, 'czułość działa też dla klawiatury (vx ' + f2(lo) + ' / ' + f2(hi) + ')');
  }
  chk((await ev(() => { __okruszek.czulosc(7); const a = __okruszek.czulosc(); __okruszek.czulosc(0.1); return [a, __okruszek.czulosc()]; })).join('/') === '1.5/0.5', 'czułość ograniczona do 0,5-1,5');
  await ev(() => __okruszek.czulosc(1));

  /* ---------- (d) boty 60 s w każdym trybie ---------- */
  console.log('(d) bot-gracz, prawdziwe dotyki, ' + BOT_S + ' s czasu gry w każdym trybie');
  const runBot = async (mode) => {
    await fresh(mode);
    await ev((tp) => { const o = __okruszek; o.bezPradow(false); o.bezPrzeszkod(true); o.nowyBieg(); o.tempo(tp); }, TEMPO);
    const fing = { one: false, L: false, R: false, st: false, dv: false }; let lastX = 0, diving = false, hyst = 0, loops = 0, maxS = 0, final = null, landed = false, dives = 0, flaps0 = 0;
    const T0 = Date.now();
    while (Date.now() - T0 < 240000) {
      const d = await ev(() => ({ s: __okruszek.stan(), pr: __okruszek.prady(), b: __okruszek.ptak() }));
      loops++; maxS = Math.max(maxS, d.s.s);
      if (d.s.tryb !== 'gra') { landed = true; final = d.s; break; }
      if (d.s.graCzas >= BOT_S) { final = d.s; break; }
      const cand = d.pr.filter(p => !p.hit && p.z > d.b.z).sort((x, y) => x.z - y.z)[0];
      const dx = cand ? cand.x - d.b.x : 0, u = clamp(dx / 40, -1, 1), imminent = cand && cand.z < 1.6;
      if (d.s.h > 0.9 && !imminent) diving = true; else if (d.s.h < 0.75 || imminent) diving = false;
      if (mode === 1) {
        /* w trybie 1 skręt wymaga palca na ekranie, a palec to nurkowanie (kosztuje wysokość): bot stuka krótko i celuje z wyprzedzeniem (błąd liczony od miejsca, gdzie ptaszek zatrzyma się po puszczeniu) */
        const err = cand ? cand.x - (d.b.x + d.s.vx / 6) : 0, u1 = clamp(err / 55, -1, 1);
        const steer = cand && Math.abs(err) > (fing.one ? 12 : 26), want = steer || diving;
        if (want && !fing.one) { await touch('touchStart', [[1, 195, 600]]); fing.one = true; lastX = 195; if (diving) dives++; }
        if (fing.one) {
          const tx = 195 + (steer ? u1 * 80 : 0);
          if (Math.abs(tx - lastX) > 3) { await touch('touchMove', [[1, tx, 600]]); lastX = tx; }
          if (!want) { await touch('touchEnd', [[1, lastX, 600]]); fing.one = false; }
        }
      } else if (mode === 2) {
        let wl = fing.L, wr = fing.R;
        if (cand && dx < -(fing.L ? 10 : 24)) { wl = true; wr = false; } else if (cand && dx > (fing.R ? 10 : 24)) { wr = true; wl = false; } else { wl = false; wr = false; }
        if (!wl && !wr && diving) { wl = true; wr = true; }
        const act = [];
        if (wl !== fing.L) { if (wl) act.push(['touchStart', LP]); else act.push(['touchEnd', LP]); fing.L = wl; }
        if (wr !== fing.R) { if (wr) act.push(['touchStart', RP]); else act.push(['touchEnd', RP]); fing.R = wr; }
        for (const [ty, P] of act) { const pts = ty === 'touchStart' ? [fing.L ? LP : null, fing.R ? RP : null].filter(Boolean) : [P]; await touch(ty, pts); }
        if (fing.L && fing.R && act.length) dives++;
      } else {
        const steer = cand && Math.abs(dx) > (fing.st ? 10 : 24);
        if (steer && !fing.st) { await touch('touchStart', [[1, 120, 640]]); fing.st = true; lastX = 120; }
        if (fing.st) {
          const bxs = d.s.drazek.bx || 120, tx = bxs + (steer ? u * 66 : 0);
          if (Math.abs(tx - lastX) > 3) { await touch('touchMove', [[1, tx, 640]]); lastX = tx; }
          if (!steer) { await touch('touchEnd', [[1, lastX, 640]]); fing.st = false; }
        }
        if (diving && !fing.dv) { await touch('touchStart', fing.st ? [[1, lastX, 640], RP] : [RP]); fing.dv = true; dives++; }
        else if (!diving && fing.dv) { await touch('touchEnd', [RP]); fing.dv = false; }
      }
      await sleep(12);
    }
    await upAll();
    return { final, landed, loops, maxS, dives };
  };
  for (const m of [1, 2, 3]) {
    const r = await runBot(m); const fs_ = r.final;
    chk(fs_ && !r.landed && fs_.graCzas >= BOT_S - 0.01, 'tryb ' + m + ': bot leci ' + (fs_ ? fs_.graCzas.toFixed(1) : '?') + ' s czasu gry bez lądowania (min wysokość ' + (fs_ ? fs_.minH.toFixed(2) : '?') + ', wlotów ' + (fs_ ? fs_.wloty : '?') + ', dystans ' + (fs_ ? Math.round(fs_.dystans) : '?') + ' m, nurkowań ' + r.dives + ', maks. s ' + r.maxS.toFixed(2) + ')',
      'tryb ' + m + ': bot wylądował po ' + (fs_ ? fs_.graCzas.toFixed(1) : '?') + ' s czasu gry (wlotów ' + (fs_ ? fs_.wloty : '?') + ')');
    chk(fs_ && fs_.wloty >= 8, 'tryb ' + m + ': bot trafił w prądy co najmniej 8 razy (' + (fs_ ? fs_.wloty : 0) + ')');
  }
  await ev(() => { __okruszek.tempo(1); __okruszek.bezPradow(true); });
  await fresh(1);

  /* ---------- (f) pamięć wyboru ---------- */
  console.log('(f) wybór w grze, pamięć localStorage, ?sterowanie=n, pierwsze uruchomienie, brak localStorage');
  {
    const c3 = await mkCtx(); const p3 = await c3.newPage(); watch(p3);
    const e3 = (f, a) => p3.evaluate(f, a);
    const LS = () => e3(() => localStorage.getItem('okruszek-sterowanie'));
    await p3.goto(url); await p3.waitForTimeout(600);
    chk((await LS()) === null && (await e3(() => __okruszek.tryb())) === 1, 'świeża przeglądarka: nic nie zapisano, tryb 1');
    const gt0 = (await e3(() => __okruszek.stan())).graCzas;
    await p3.click('#sterb'); await p3.waitForTimeout(500);
    let s3 = await e3(() => __okruszek.stan()); const gtP = s3.graCzas; await p3.waitForTimeout(600); const gtP2 = (await e3(() => __okruszek.stan())).graCzas;
    chk(s3.panel && gtP2 === gtP && gtP > gt0 - 0.001, 'przycisk w rogu otwiera pauzę z wyborem sterowania (czas gry stoi: ' + gtP.toFixed(2) + ' = ' + gtP2.toFixed(2) + ')');
    const panel = await e3(() => { const q = document.getElementById('ster'), cs = [...q.querySelectorAll('.tryb')], r = document.getElementById('ster-c');
      return { vis: getComputedStyle(q).visibility, title: document.getElementById('ster-t').textContent, ok: document.getElementById('ster-ok').textContent, n: cs.length,
        cards: cs.map(c => { const b = c.getBoundingClientRect(); return { txt: c.innerText.replace(/\s+/g, ' ').trim(), h: b.height, w: b.width, svg: !!c.querySelector('svg'), press: c.getAttribute('aria-pressed') }; }),
        slider: { min: r.min, max: r.max, h: r.getBoundingClientRect().height, v: r.value }, okh: document.getElementById('ster-ok').getBoundingClientRect().height }; });
    chk(panel.vis === 'visible' && panel.n === 3 && panel.cards.every(c => c.svg && c.h >= 44 && /[.]/.test(c.txt)), 'panel: trzy karty z ilustracją i opisem (wysokości ' + panel.cards.map(c => Math.round(c.h)).join('/') + ' px), tytuł "' + panel.title + '"');
    chk(panel.cards[0].press === 'true' && panel.cards[1].press === 'false', 'zaznaczony jest tryb 1');
    chk(panel.slider.min === '0.5' && panel.slider.max === '1.5' && panel.slider.h >= 44 && panel.slider.v === '1', 'suwak czułości 0,5-1,5, domyślnie 1, wysokość pola ' + panel.slider.h + ' px');
    console.log('  info opisy trybów: ' + panel.cards.map(c => '"' + c.txt + '"').join(' | '));
    await p3.click('.tryb[data-tryb="3"]'); await p3.waitForTimeout(150);
    await e3(() => { const r = document.getElementById('ster-c'); r.value = '1.3'; r.dispatchEvent(new Event('input', { bubbles: true })); });
    chk((await e3(() => __okruszek.tryb())) === 3 && (await e3(() => __okruszek.czulosc())) === 1.3 && JSON.stringify(JSON.parse(await LS())) === '{"v":1,"m":3,"c":1.3}', 'wybór karty 3 i suwaka 1,3 zapisany: ' + (await LS()));
    chk((await e3(() => document.getElementById('ster-cv').textContent)) === '1,3', 'wartość suwaka pokazana po polsku ("1,3")');
    await p3.keyboard.press('Escape'); await p3.waitForTimeout(400);
    s3 = await e3(() => __okruszek.stan()); await p3.waitForTimeout(500); const gtR = (await e3(() => __okruszek.stan())).graCzas;
    chk(!s3.panel && !s3.pauza && gtR > gtP2, 'Esc zamyka panel i wznawia grę');
    await p3.reload(); await p3.waitForTimeout(700);
    chk((await e3(() => __okruszek.tryb())) === 3 && (await e3(() => __okruszek.czulosc())) === 1.3, 'po przeładowaniu strony tryb 3 i czułość 1,3 zapamiętane');
    await p3.goto(url + '&sterowanie=2'); await p3.waitForTimeout(600);
    chk((await e3(() => __okruszek.tryb())) === 2 && (await e3(() => __okruszek.czulosc())) === 1.3 && (await LS()) === '{"v":1,"m":3,"c":1.3}', '?sterowanie=2 nadpisuje zapisany tryb (czułość z zapisu zostaje, zapis nietknięty)');
    await p3.goto(url); await p3.waitForTimeout(600);
    chk((await e3(() => __okruszek.tryb())) === 3, 'bez parametru wraca zapisany tryb 3');
    await p3.keyboard.press('t'); await p3.waitForTimeout(150);
    chk((await e3(() => __okruszek.tryb())) === 1 && (await LS()) === '{"v":1,"m":1,"c":1.3}', 'klawisz T zapisuje nowy wybór: ' + (await LS()));
    await p3.reload(); await p3.waitForTimeout(600);
    chk((await e3(() => __okruszek.tryb())) === 1, 'po przeładowaniu tryb 1 (z klawisza T)');
    /* karta w panelu przy otwartym panelu: T zmienia zaznaczenie */
    await p3.click('#sterb'); await p3.waitForTimeout(300); await p3.keyboard.press('t'); await p3.waitForTimeout(150);
    chk((await e3(() => document.querySelector('.tryb[data-tryb="2"]').getAttribute('aria-pressed'))) === 'true', 'klawisz T przy otwartym panelu przestawia zaznaczenie na kartę 2');
    await p3.click('#ster-ok'); await p3.waitForTimeout(300);
    chk(!(await e3(() => __okruszek.stan())).panel, 'przycisk w panelu zamyka go');
    /* uszkodzony zapis nie psuje gry */
    await e3(() => localStorage.setItem('okruszek-sterowanie', '{zepsute')); await p3.reload(); await p3.waitForTimeout(600);
    chk((await e3(() => __okruszek.tryb())) === 1 && (await e3(() => __okruszek.czulosc())) === 1, 'uszkodzony zapis ignorowany, tryb 1 i czułość 1');
    await c3.close();

    /* pierwsze uruchomienie: ekran "Wybierz sterowanie" */
    const c4 = await mkCtx(); const p4 = await c4.newPage(); watch(p4); const e4 = (f, a) => p4.evaluate(f, a);
    await p4.goto(url + '&pierwszy'); await p4.waitForTimeout(700);
    let s4 = await e4(() => __okruszek.stan());
    const t4 = await e4(() => ({ t: document.getElementById('ster-t').textContent, ok: document.getElementById('ster-ok').textContent, vis: getComputedStyle(document.getElementById('ster')).visibility }));
    chk(s4.panel && t4.vis === 'visible' && t4.t === 'Wybierz sterowanie' && t4.ok === 'Leć', 'pierwsze uruchomienie bez zapisu: ekran "' + t4.t + '" z przyciskiem "' + t4.ok + '"');
    await p4.waitForTimeout(600); const g4 = (await e4(() => __okruszek.stan())).graCzas;
    chk(g4 < 0.05 || g4 === s4.graCzas, 'gra czeka na wybór (czas gry ' + g4.toFixed(2) + ')');
    await p4.click('.tryb[data-tryb="2"]'); await p4.click('#ster-ok'); await p4.waitForTimeout(900);
    s4 = await e4(() => __okruszek.stan());
    chk(!s4.panel && !s4.pauza && s4.graCzas > g4 + 0.3 && s4.sterowanie === 2, 'po "Leć" gra rusza w wybranym trybie 2 (czas gry ' + s4.graCzas.toFixed(2) + ')');
    await p4.goto(url + '&pierwszy'); await p4.waitForTimeout(600);
    chk(!(await e4(() => __okruszek.stan())).panel && (await e4(() => __okruszek.tryb())) === 2, 'drugie uruchomienie: bez ekranu wyboru, zapamiętany tryb 2');
    await c4.close();
    const c5 = await mkCtx(); const p5 = await c5.newPage(); watch(p5);
    await p5.goto(url + '&pierwszy&sterowanie=3'); await p5.waitForTimeout(600);
    chk(!(await p5.evaluate(() => __okruszek.stan())).panel && (await p5.evaluate(() => __okruszek.tryb())) === 3, '?sterowanie=3 pomija ekran wyboru i ustawia tryb 3');
    await c5.close();

    /* brak dostępu do localStorage (tryb prywatny, zablokowane dane) */
    const c6 = await mkCtx(); await c6.addInitScript(() => { const boom = () => { throw new Error('zablokowane'); }; Object.defineProperty(window, 'localStorage', { configurable: true, get: boom }); });
    const p6 = await c6.newPage(); watch(p6);
    await p6.goto(url); await p6.waitForTimeout(600);
    await p6.click('#sterb'); await p6.waitForTimeout(200); await p6.click('.tryb[data-tryb="2"]'); await p6.click('#ster-ok'); await p6.waitForTimeout(500);
    await p6.keyboard.press('t'); await p6.waitForTimeout(100);
    const s6 = await p6.evaluate(() => __okruszek.stan());
    chk(s6.sterowanie === 3 && !s6.panel && s6.graCzas > 0.1, 'bez dostępu do localStorage gra działa i tryb da się przełączać (tryb ' + s6.sterowanie + ')');
    await c6.close();
  }

  /* ---------- (g) przycisk: wielkość, strefa, brak nakładania ---------- */
  console.log('(g) przycisk "sterowanie": 44 px, stała strefa, bez nakładania na wskaźnik poziomu');
  const boxes = async (pg) => pg.evaluate(() => {
    const b = document.getElementById('sterb').getBoundingClientRect(), c = document.getElementById('g').getBoundingClientRect(), w = __okruszek.wskaznik(), k = w.k;
    return { b: { l: b.left, t: b.top, r: b.right, bt: b.bottom, w: b.width, h: b.height }, c: { l: c.left, t: c.top, r: c.right, bt: c.bottom, w: c.width },
      lvl: { l: c.left + w.x * k, t: c.top + w.y * k, r: c.left + (w.x + w.w) * k, bt: c.top + (w.y + w.h) * k }, k,
      hbar: { l: c.left + (390 - 18 - 112) * k, t: c.top + 20 * k, r: c.left + (390 - 18) * k, bt: c.top + 50 * k },
      msg: { l: c.left + 75 * k, t: c.top + 126 * k, r: c.left + 315 * k, bt: c.top + 156 * k } };
  });
  const ovl = (A, B) => A.l < B.r && A.r > B.l && A.t < B.bt && A.bt > B.t;
  let ref = null;
  for (const vp of [{ width: 390, height: 844 }, { width: 360, height: 640 }, { width: 430, height: 932 }, { width: 320, height: 568 }, { width: 1440, height: 900 }]) {
    const cx = await mkCtx(vp); const pg = await cx.newPage(); watch(pg);
    await pg.goto(url); await pg.waitForTimeout(500);
    await pg.evaluate(() => { const o = __okruszek; o.bezPradow(true); o.bezPrzeszkod(true); o.nowyBieg(); o.ustawPoziom(3); o.trafPrad(); o.trafPrad(); o.trafPrad(); o.odblokuj(); });   /* łańcuch x3: najszersze pole wskaźnika */
    await pg.waitForTimeout(300);
    const B = await boxes(pg);
    const inside = B.b.l >= B.c.l - 0.5 && B.b.r <= B.c.r + 0.5 && B.b.t >= B.c.t && B.b.bt <= B.c.bt;
    chk(B.b.w >= 43.99 && B.b.h >= 43.99 && inside, vp.width + 'x' + vp.height + ': przycisk ' + Math.round(B.b.w) + 'x' + Math.round(B.b.h) + ' px (min 44), w obrębie ekranu gry');
    chk(!ovl(B.b, B.lvl) && !ovl(B.b, B.hbar) && !ovl(B.b, B.msg), vp.width + 'x' + vp.height + ': nie nachodzi na wskaźnik poziomu (' + Math.round(B.lvl.l) + '-' + Math.round(B.lvl.r) + ' x ' + Math.round(B.lvl.t) + '-' + Math.round(B.lvl.bt) + '), pasek wysokości ani komunikat poziomu; przycisk ' + Math.round(B.b.l) + '-' + Math.round(B.b.r) + ' x ' + Math.round(B.b.t) + '-' + Math.round(B.b.bt));
    if (vp.width === 390) ref = B.b;
    if (vp.width === 390) {
      /* stała strefa: to samo miejsce w grze, w pauzie, na ekranie wyniku i po zmianie trybu */
      await pg.evaluate(() => __okruszek.pauza(true)); await pg.waitForTimeout(150); const bp = (await boxes(pg)).b; await pg.evaluate(() => __okruszek.pauza(false));
      await pg.evaluate(() => { __okruszek.sterowanie(3); }); await pg.waitForTimeout(100); const bm = (await boxes(pg)).b;
      await pg.evaluate(() => { const o = __okruszek; o.odblokuj(); o.tempo(4); o.ustawWysokosc(0); }); await pg.waitForTimeout(3800);
      const fin = await pg.evaluate(() => ({ k: __okruszek.stan().tryb, pokaz: document.getElementById('wynik').classList.contains('pokaz') })); const be = (await boxes(pg)).b;
      const same = (A, B) => Math.abs(A.l - B.l) < 0.6 && Math.abs(A.t - B.t) < 0.6 && Math.abs(A.w - B.w) < 3 && Math.abs(A.h - B.h) < 0.6;
      chk(same(ref, bp) && same(ref, be) && fin.pokaz, 'stała strefa: przycisk stoi w tym samym miejscu w grze, w pauzie i na ekranie wyniku (stan "' + fin.k + '")', 'stała strefa: gra ' + JSON.stringify(ref) + ' pauza ' + JSON.stringify(bp) + ' wynik ' + JSON.stringify(be) + ' (stan ' + fin.k + ', pokaz ' + fin.pokaz + ')');
      chk(Math.abs(ref.w - bm.w) < 3 && Math.abs(ref.l + ref.w - (bm.l + bm.w)) < 0.6, 'zmiana trybu nie przesuwa prawej krawędzi przycisku');
      /* przycisk klikalny nad ekranem wyniku */
      await pg.click('#sterb'); await pg.waitForTimeout(400);
      chk((await pg.evaluate(() => __okruszek.stan())).panel, 'na ekranie wyniku przycisk otwiera wybór sterowania');
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
      chk(!(await pg.evaluate(() => __okruszek.stan())).panel && (await pg.evaluate(() => document.getElementById('wynik').classList.contains('pokaz'))), 'zamknięcie panelu wraca do ekranu wyniku');
    }
    if (vp.width === 360 || vp.width === 390) {   /* ekran wyniku: przycisk nie dotyka napisów karty */
      if (vp.width === 360) { await pg.evaluate(() => { const o = __okruszek; o.nowyBieg(); o.tempo(4); o.ustawWysokosc(0); }); await pg.waitForTimeout(3800); }
      const r = await pg.evaluate(() => { const q = (sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, bt: b.bottom }; }; return { b: q('#sterb'), et: q('#w-et'), m: q('.metry'), pokaz: document.getElementById('wynik').classList.contains('pokaz') }; });
      const near = (A, B) => A.l < B.r + 8 && A.r > B.l - 8 && A.t < B.bt + 8 && A.bt > B.t - 8;
      chk(r.pokaz && !near(r.b, r.et) && !near(r.b, r.m), vp.width + 'x' + vp.height + ': na ekranie wyniku przycisk jest co najmniej 8 px od napisu "Miękkie lądowanie" i od licznika metrów');
    }
    await cx.close();
  }

  /* ---------- błędy konsoli ---------- */
  const real = errors.filter(e => !/favicon/i.test(e) && !/zablokowane/.test(e));
  chk(real.length === 0, 'brak błędów i ostrzeżeń konsoli', 'błędy konsoli: ' + real.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fail ? ('TEST Z2b NIE PRZESZEDŁ (' + fail + ')') : 'TEST Z2b OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST Z2b BŁĄD: ' + e); process.exit(2); });
