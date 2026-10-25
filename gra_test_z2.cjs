/* Okruszek Z2: testy bota Playwright. Użycie: node gra_test_z2.cjs [plik.html]
   (a) bot-gracz (mysz) trafia w prądy i leci 60 s czasu gry bez lądowania; kontrola: bez sterowania ląduje wcześniej
   (b) bez prądów lądowanie po ok. 20 s czasu gry (zakres 14-28 s), ekran wyniku, "Jeszcze raz" bez przeładowania
   (c) dwa palce (prawdziwe zdarzenia dotyku przez CDP): puszczenie jednego nie zostawia ducha, po puszczeniu wszystkich wraca machanie;
       anulowanie, blur, ukrycie karty, mysz, klawiatura, pauza
   (d) wlot w prąd nie psuje kolejności koloru z Z1 (niebo >= daleko >= blisko >= smugi), kolor skacze i gaśnie
   Czas gry jest przyspieszany hakiem tempo() (tylko ?test). Kończy się kodem 0 tylko gdy wszystko przeszło. */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const url = 'file:///' + file.replace(/\\/g, '/') + '?test&seed=23';
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TEMPO = +process.env.TEMPO || 4;

(async () => {
  console.log('TEST Z2 ' + file + ' (tempo czasu gry x' + TEMPO + ')');
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  const ev = (f, a) => page.evaluate(f, a);
  const st = () => ev(() => __okruszek.stan());
  await page.goto(url);
  await page.waitForTimeout(700);
  await ev(() => { window.__marker = 12345; });
  const K = await ev(() => __okruszek.stale());
  console.log('  info stałe: ' + JSON.stringify(K));
  const ordered = (k) => k.niebo >= k.daleko - 1e-9 && k.daleko >= k.blisko - 1e-9 && k.blisko >= k.smugi - 1e-9 && k.smugi >= 0 && k.niebo <= 1 + 1e-9;
  const colorSamples = { n: 0, bad: 0, maxS: 0, minS: 1 };
  const sample = async () => {
    const d = await ev(() => ({ k: __okruszek.kolory(), s: __okruszek.stan().s }));
    colorSamples.n++; if (!ordered(d.k)) colorSamples.bad++; colorSamples.maxS = Math.max(colorSamples.maxS, d.s); colorSamples.minS = Math.min(colorSamples.minS, d.s);
    return d;
  };

  /* ---------- (b) lądowanie po ok. 20 s bez prądów ---------- */
  console.log('(b) lądowanie bez prądów');
  await ev((m) => { __okruszek.odblokuj(); __okruszek.bezPradow(true); __okruszek.nowyBieg(); __okruszek.tempo(m); }, TEMPO);
  const h0 = await ev(() => __okruszek.wysokosc());
  chk(Math.abs(h0 - K.H0) < 0.01, 'start z wysokością ' + h0);
  let tl = null, hmax = 0;
  for (let i = 0; i < 600; i++) {
    const s = await st(); hmax = Math.max(hmax, s.h);
    if (s.tryb !== 'gra') { tl = s.graCzas; break; }
    await sleep(100);
  }
  chk(tl !== null && tl >= 14 && tl <= 28, 'lądowanie po ' + (tl === null ? '?' : tl.toFixed(1)) + ' s czasu gry (cel 14-28)', 'lądowanie po ' + tl + ' s czasu gry poza zakresem 14-28');
  chk(hmax <= K.H0 + 1e-6, 'samo machanie nie podnosi wysokości ponad start (max ' + hmax.toFixed(3) + ')');
  await sleep(2300);
  const sEnd = await st();
  const overlay = await ev(() => { const e = document.getElementById('wynik'); return { pokaz: e.classList.contains('pokaz'), op: getComputedStyle(e).opacity, txt: e.innerText.replace(/\s+/g, ' '), m: document.getElementById('w-m').textContent }; });
  chk(sEnd.tryb === 'koniec' && overlay.pokaz && +overlay.op > 0.9, 'ekran wyniku widoczny: "' + overlay.txt + '"', 'ekran wyniku niewidoczny: ' + JSON.stringify(overlay));
  const dBeforeRestart = sEnd.dystans;
  chk(overlay.m.replace(/\s|\u00a0/g, '') === String(Math.floor(dBeforeRestart)), 'wynik w metrach zgodny z dystansem (' + Math.floor(dBeforeRestart) + ' m)');
  const frames1 = sEnd.klatki;
  await page.click('#jeszcze');
  await sleep(300);
  const sNew = await st(); const mk = await ev(() => window.__marker);
  chk(sNew.tryb === 'gra' && sNew.h > 0.7 && sNew.dystans < 40 && mk === 12345 && sNew.klatki > frames1, 'Jeszcze raz: reset stanu bez przeładowania (h=' + sNew.h.toFixed(2) + ', dystans=' + sNew.dystans.toFixed(1) + ')');
  chk(!(await ev(() => document.getElementById('wynik').classList.contains('pokaz'))), 'ekran wyniku zniknął po "Jeszcze raz"');

  /* ---------- (a) kontrola bez sterowania, potem bot ---------- */
  console.log('(a) bot-gracz i kontrola');
  await ev((m) => { __okruszek.bezPradow(false); __okruszek.nowyBieg(); __okruszek.tempo(m); }, TEMPO);
  let idle = null;
  for (let i = 0; i < 900; i++) { const s = await st(); if (s.tryb !== 'gra') { idle = s; break; } if (s.graCzas >= 60) { idle = s; break; } await sleep(100); }
  chk(idle && idle.tryb !== 'gra' && idle.graCzas < 60, 'kontrola (bez sterowania, prądy włączone) ląduje po ' + (idle ? idle.graCzas.toFixed(1) : '?') + ' s, wlotów: ' + (idle ? idle.wloty : '?'), 'kontrola bez sterowania przeżyła 60 s');

  await ev((m) => { __okruszek.nowyBieg(); __okruszek.tempo(m); }, TEMPO);
  const rect = await ev(() => { const r = document.getElementById('g').getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
  let mouseDown = false, lastU = 99, bot = { loops: 0, maxS: 0, dives: 0, maxBx: 0 }, final = null, landed = false;
  await page.mouse.move(rect.l + rect.w / 2, rect.t + rect.h * 0.5);
  const t0 = Date.now();
  while (Date.now() - t0 < 120000) {
    const d = await ev(() => ({ s: __okruszek.stan(), pr: __okruszek.prady(), b: __okruszek.ptak() }));
    bot.loops++; bot.maxS = Math.max(bot.maxS, d.s.s); bot.maxBx = Math.max(bot.maxBx, Math.abs(d.s.bx));
    if (d.s.tryb !== 'gra') { landed = true; final = d.s; break; }
    if (d.s.graCzas >= 60) { final = d.s; break; }
    const cand = d.pr.filter(p => !p.hit && p.z > d.b.z).sort((a, b) => a.z - b.z)[0];
    let u = cand ? clamp((cand.x - d.b.x) / 40, -1, 1) : 0;
    if (Math.abs(u - lastU) > 0.02) { lastU = u; await page.mouse.move(rect.l + rect.w / 2 * (1 + u / 1.25), rect.t + rect.h * 0.5); }
    /* nurkowanie tylko, gdy wysokości jest w nadmiarze i żaden prąd nie jest tuż-tuż */
    const imminent = cand && cand.z < 1.6;
    const wantDive = d.s.h > 0.9 && !imminent;
    const release = d.s.h < 0.75 || imminent;
    if (wantDive && !mouseDown) { await page.mouse.down(); mouseDown = true; bot.dives++; }
    else if (release && mouseDown) { await page.mouse.up(); mouseDown = false; }
    if (bot.loops % 4 === 0) await sample();
    await sleep(15);
  }
  if (mouseDown) await page.mouse.up();
  chk(final && !landed && final.graCzas >= 60, 'bot leci ' + (final ? final.graCzas.toFixed(1) : '?') + ' s czasu gry bez lądowania (min wysokość ' + (final ? final.minH.toFixed(2) : '?') + ', wlotów ' + (final ? final.wloty : '?') + ', dystans ' + (final ? Math.round(final.dystans) : '?') + ' m, nurkowań ' + bot.dives + ', maks. s ' + bot.maxS.toFixed(2) + ')',
    'bot wylądował po ' + (final ? final.graCzas.toFixed(1) : '?') + ' s czasu gry (wlotów ' + (final ? final.wloty : '?') + ')');
  chk(final && final.wloty >= 8, 'bot trafił w prądy co najmniej 8 razy (' + (final ? final.wloty : 0) + ')');
  chk(bot.maxBx > 80, 'ptaszek faktycznie zmieniał x w świecie (maks. |bx| = ' + Math.round(bot.maxBx) + ')');
  await ev(() => __okruszek.tempo(1));

  /* ---------- (d) kolejność koloru ---------- */
  console.log('(d) kolejność koloru z Z1');
  chk(colorSamples.n > 20 && colorSamples.bad === 0, 'kolejność koloru zachowana w ' + colorSamples.n + ' próbkach biegu bota (s od ' + colorSamples.minS.toFixed(2) + ' do ' + colorSamples.maxS.toFixed(2) + ')', 'kolejność koloru złamana w ' + colorSamples.bad + ' z ' + colorSamples.n + ' próbek');
  await ev(() => { __okruszek.nowyBieg(); __okruszek.bezPradow(true); __okruszek.tempo(1); });
  await sleep(200);
  const dz = await sample();
  chk(dz.s < 0.02 && dz.k.niebo === 0 && dz.k.smugi === 0, 's=0 na starcie: zero koloru (s=' + dz.s.toFixed(3) + ')');
  const hBefore = await ev(() => __okruszek.wysokosc());
  await ev(() => __okruszek.zdarzenie('prad', { z: 1.0 }));
  let wl = null;
  for (let i = 0; i < 120; i++) { const s = await st(); if (s.wloty > 0) { wl = s; break; } await sleep(25); }
  chk(wl !== null, 'wymuszony prąd na torze: wlot zaliczony');
  if (wl) {
    const k = await ev(() => __okruszek.kolory());
    chk(wl.s - dz.s > 0.4, 'wlot: skok prędkości ' + dz.s.toFixed(2) + ' -> ' + wl.s.toFixed(2));
    chk(wl.h >= Math.min(1, hBefore + K.PRAD_H) - 0.06, 'wlot: skok wysokości (z ograniczeniem do 1) ' + hBefore.toFixed(2) + ' -> ' + wl.h.toFixed(2));
    chk(k.niebo > 0.1 && ordered(k), 'wlot: kolor skoczył i kolejność zachowana ' + JSON.stringify(k));
    await sleep(6000);
    const s2 = await sample();
    chk(s2.s < 0.15 && ordered(s2.k), 'po wlocie prędkość i kolor wracają do podstawowych (s=' + s2.s.toFixed(2) + ')');
  }
  /* wlot obok prądu nie liczy się (skok w bok o 200 jednostek) */
  const w0 = (await st()).wloty;
  await ev(() => __okruszek.zdarzenie('prad', { dx: 1.0, z: 1.0 })); /* 300 jednostek obok toru */
  await sleep(3500);
  chk((await st()).wloty === w0, 'prąd obok toru lotu nie daje wlotu');

  /* ---------- (c) dwa palce i inne wejścia ---------- */
  console.log('(c) wejście: dwa palce, anulowanie, blur, mysz, klawiatura, pauza');
  await ev(() => { __okruszek.nowyBieg(); __okruszek.bezPradow(true); __okruszek.tempo(1); });
  let cdp = null;
  try { cdp = await ctx.newCDPSession(page); } catch (e) { console.log('  info brak CDP: ' + e); }
  const touch = async (type, pts) => { if (cdp) await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p[1], y: p[2], id: p[0] })) }); };
  const P1 = [1, 100, 500], P2 = [2, 290, 520], P3 = [3, 200, 560];
  const snap = async () => { const s = await st(); return { palce: s.palce, nurkuje: s.nurkuje, sHold: s.sHold, s: s.s }; };
  const info = (n, o) => n + ' ' + JSON.stringify({ palce: o.palce, nurkuje: o.nurkuje });
  const method = cdp ? 'CDP (prawdziwy dotyk)' : 'zdarzenia syntetyczne';
  console.log('  info metoda symulacji palców: ' + method);
  if (cdp) {
    /* CDP: touchStart/touchMove podają wszystkie aktywne punkty, touchEnd/touchCancel punkty kończone */
    await touch('touchStart', [P1]); await sleep(150);
    let a = await snap(); chk(a.palce === 1 && a.nurkuje, 'jeden palec: nurkowanie ' + info('', a));
    await touch('touchStart', [P1, P2]); await sleep(150);
    a = await snap(); chk(a.palce === 2 && a.nurkuje, 'dwa palce: nurkowanie ' + info('', a));
    await touch('touchEnd', [P1]); await sleep(150);
    a = await snap(); chk(a.palce === 1 && a.nurkuje, 'puszczony pierwszy palec: drugi dalej trzyma ' + info('', a));
    await touch('touchMove', [[2, 340, 520]]); await sleep(350);
    const sv = await st(); chk(sv.vx > 20, 'drugi palec przesunięty w prawo skręca (vx=' + sv.vx.toFixed(0) + ')');
    await touch('touchEnd', [[2, 340, 520]]); await sleep(200);
    a = await snap(); chk(a.palce === 0 && !a.nurkuje, 'puszczone wszystkie: brak ducha ' + info('', a));
    const sAtRelease = a.sHold; await sleep(1500);
    const a2 = await snap(); chk(a2.sHold < sAtRelease * 0.5 && !a2.nurkuje, 'po puszczeniu wszystkich wraca machanie (sHold ' + sAtRelease.toFixed(2) + ' -> ' + a2.sHold.toFixed(2) + ')');
    /* puszczenie drugiego palca jako pierwszego, potem pierwszego */
    await touch('touchStart', [P1]); await touch('touchStart', [P1, P2]); await sleep(120);
    await touch('touchEnd', [P2]); await sleep(120);
    a = await snap(); const keep = a.palce === 1 && a.nurkuje;
    await touch('touchEnd', [P1]); await sleep(150);
    a = await snap(); chk(keep && a.palce === 0 && !a.nurkuje, 'puszczanie w odwrotnej kolejności ' + info('', a));
    /* anulowanie obu palców */
    await touch('touchStart', [P1]); await touch('touchStart', [P1, P2]); await sleep(120);
    await touch('touchCancel', []); await sleep(150);
    a = await snap(); chk(a.palce === 0 && !a.nurkuje, 'touchCancel obu palców czyści stan ' + info('', a));
    /* trzy palce, puszczane w różnej kolejności */
    await touch('touchStart', [P1]); await touch('touchStart', [P1, P2]); await touch('touchStart', [P1, P2, P3]); await sleep(120);
    a = await snap(); const three = a.palce;
    await touch('touchEnd', [P2]); await touch('touchEnd', [P3]); await sleep(100);
    const mid = await snap();
    await touch('touchEnd', [P1]); await sleep(150);
    a = await snap(); chk(three === 3 && mid.palce === 1 && mid.nurkuje && a.palce === 0 && !a.nurkuje, 'trzy palce w różnej kolejności (było ' + three + ', po dwóch ' + mid.palce + '): na końcu ' + info('', a));
  }
  /* syntetyczne zdarzenia przez hak dotyk() */
  await ev(() => { __okruszek.dotyk('dol', 1, 0.3); __okruszek.dotyk('dol', 2, 0.6); }); await sleep(100);
  let b = await snap(); chk(b.palce === 2 && b.nurkuje, 'hak dotyk(): dwa palce ' + info('', b));
  await ev(() => __okruszek.dotyk('gora', 1)); await sleep(80);
  b = await snap(); chk(b.palce === 1 && b.nurkuje, 'hak dotyk(): po puszczeniu jednego drugi trzyma ' + info('', b));
  await ev(() => __okruszek.dotyk('anuluj', 2)); await sleep(80);
  b = await snap(); chk(b.palce === 0 && !b.nurkuje, 'hak dotyk(): po anulowaniu drugiego pusto ' + info('', b));
  /* blur z dwoma palcami */
  await ev(() => { __okruszek.dotyk('dol', 1, 0.3); __okruszek.dotyk('dol', 2, 0.6); window.dispatchEvent(new Event('blur')); }); await sleep(100);
  b = await snap(); chk(b.palce === 0 && !b.nurkuje, 'blur czyści palce ' + info('', b));
  /* nowy gest po zgubionym palcu: palec główny czyści stare (obrona przed duchem) */
  await ev(() => { __okruszek.dotyk('dol', 1, 0.3); __okruszek.dotyk('dol', 2, 0.6); }); await sleep(50);
  await ev(() => { __okruszek.dotyk('dol', 1, 0.5); }); await sleep(80);
  b = await snap(); chk(b.palce === 1, 'zgubione zdarzenie puszczenia: nowy gest zaczyna czysto (palce=' + b.palce + ')');
  await ev(() => __okruszek.dotyk('gora', 1)); await sleep(80);
  /* ukrycie karty */
  await ev(() => { __okruszek.dotyk('dol', 1, 0.3); Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); }); await sleep(100);
  b = await st(); chk(b.palce === 0 && b.pauza === true, 'ukrycie karty czyści palce i wstrzymuje grę (pauza=' + b.pauza + ')');
  await ev(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); __okruszek.pauza(false); });
  /* mysz */
  await page.mouse.move(rect.l + rect.w * 0.8, rect.t + rect.h * 0.5); await sleep(400);
  const mv = await st(); chk(mv.vx > 20, 'mysz: ruch w prawo skręca (vx=' + mv.vx.toFixed(0) + ')');
  await page.mouse.down(); await sleep(120);
  b = await snap(); chk(b.nurkuje, 'mysz: LPM = nurkowanie');
  await page.mouse.up(); await sleep(120);
  b = await snap(); chk(!b.nurkuje, 'mysz: puszczenie LPM kończy nurkowanie');
  await page.mouse.move(rect.l + rect.w * 0.5, rect.t + rect.h * 0.5); await ev(() => __okruszek.przesun(null));
  /* klawiatura */
  await page.keyboard.down(' '); await sleep(120);
  b = await snap(); chk(b.nurkuje, 'klawiatura: spacja = nurkowanie');
  await page.keyboard.up(' '); await sleep(120);
  b = await snap(); chk(!b.nurkuje, 'klawiatura: puszczenie spacji kończy nurkowanie');
  const bx0 = (await st()).bx;
  await page.keyboard.down('ArrowLeft'); await sleep(700); await page.keyboard.up('ArrowLeft'); await sleep(100);
  const bx1 = (await st()).bx;
  chk(bx1 < bx0 - 40, 'klawiatura: strzałka w lewo skręca (bx ' + Math.round(bx0) + ' -> ' + Math.round(bx1) + ')');
  await page.keyboard.down('d'); await sleep(700); await page.keyboard.up('d'); await sleep(100);
  chk((await st()).bx > bx1 + 40, 'klawiatura: D skręca w prawo');
  /* pauza */
  await page.keyboard.press('p'); await sleep(150);
  const p1 = await st(); await sleep(400); const p2 = await st();
  chk(p1.pauza && p2.graCzas === p1.graCzas, 'P: pauza wstrzymuje czas gry (' + p1.graCzas.toFixed(2) + ' = ' + p2.graCzas.toFixed(2) + ')');
  await page.keyboard.press('Escape'); await sleep(300);
  const p3 = await st(); chk(!p3.pauza && p3.graCzas > p2.graCzas, 'Esc: wznawia grę');
  await page.keyboard.press('Escape'); await sleep(150);
  await page.mouse.click(rect.l + rect.w / 2, rect.t + 300); await sleep(250);
  const p4 = await st(); chk(!p4.pauza, 'dotknięcie ekranu wznawia z pauzy');

  /* ---------- błędy konsoli ---------- */
  const real = errors.filter(e => !/favicon/i.test(e));
  chk(real.length === 0, 'brak błędów i ostrzeżeń konsoli', 'błędy konsoli: ' + real.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fail ? ('TEST Z2 NIE PRZESZEDŁ (' + fail + ')') : 'TEST Z2 OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST Z2 BŁĄD: ' + e); process.exit(2); });
