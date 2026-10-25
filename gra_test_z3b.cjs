/* Okruszek Z3b: testy Playwright. Użycie: node gra_test_z3b.cjs [plik.html]
   (a) poziomy L0-L5: progi, wskaźnik w HUD, komunikat przy wejściu
   (b) trudność: bot idealny (trafia wszystkie prądy, nurkuje) osiąga L4 w 60 s czasu gry, nigdy L5 bez łańcucha >= 5;
       bot-średniak (ok. 50% prądów) ma szczyt L2-L3; bot losowy i bierny nigdy nie osiągają L4
   (c) L5: hiperprzestrzeń tylko po łańcuchu >= 5 prądów w 12 s plus nurkowaniu, trwa ok. 6 s i wygasa
   (d) kolor: kolejność niebo >= daleko >= blisko >= smugi na każdym poziomie i o każdej porze doby (też w narysowanych warstwach), 14 odcieni wchodzi po kolei
       w całym zakresie L1-L4, w L0 sam kontur, nasycenie obrazu rośnie z poziomem
   (e) doba: płynne przejścia (analitycznie i na klatkach), tempo doby maleje z poziomem (pomiar), kolejność pór, noc() = pora noc
   (f) nowe przeszkadzajki: każda wymuszalna hakiem i widoczna w gdzie(), zapowiedź >= 2 s, efekt kolizji, sowa tylko w nocy, harmonogram
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
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const f2 = (v) => (typeof v === 'number' ? v.toFixed(2) : String(v));
const TEMPO = +process.env.TEMPO || 4;
const FAST = !!process.env.FAST;   /* FAST=1: krótsze biegi botów (do prób); pełny test bez FAST */

(async () => {
  console.log('TEST Z3b ' + file + ' (tempo botów x' + TEMPO + ')');
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
  const need = ['poziom', 'ustawPoziom', 'lancuch', 'pora', 'ustawPore', 'tempoDoby', 'zdarzenie', 'warstwy', 'jasnosc', 'jasnoscPory', 'odcienie', 'trafPrad', 'odblokujPore', 'noc', 'gdzie', 'stan', 'kolory', 'ustaw', 'odblokuj', 'tempo', 'nurkuj', 'nowyBieg'];
  const miss = await ev((n) => n.filter(k => typeof __okruszek[k] !== 'function'), need);
  chk(miss.length === 0, 'hak Z3b kompletny (' + need.length + ' funkcji)', 'w haku brakuje: ' + miss.join(', '));

  /* ---------- (a) poziomy ---------- */
  console.log('(a) poziomy L0-L5 i wskaźnik');
  const lv = {};
  for (const [v, want] of [[0.05, 0], [0.2, 1], [0.4, 2], [0.7, 3], [0.85, 4]]) {
    await fresh(1); await ev((x) => __okruszek.ustaw(x), v); await sleep(300);
    lv[v] = (await st()).poziom;
  }
  chk(lv[0.05] === 0 && lv[0.2] === 1 && lv[0.4] === 2 && lv[0.7] === 3 && lv[0.85] === 4, 'progi: s=0,05 -> L0, 0,2 -> L1, 0,4 -> L2, 0,7 -> L3, 0,85 -> L4 (' + JSON.stringify(lv) + ')', 'progi poziomów: ' + JSON.stringify(lv));
  const l5 = await (async () => { await fresh(1); await ev(() => __okruszek.ustawPoziom(5)); await sleep(300); const s = await st(); return { p: s.poziom, h: s.hiper }; })();
  chk(l5.p === 5 && l5.h, 'ustawPoziom(5) -> poziom 5 i hiperprzestrzeń');
  /* wskaźnik w stałej strefie (x 18..116, y 62..68): model (stopnie wypełniają się z prędkością) i piksele (pasek różni się od tła tuż pod nim coraz bardziej) */
  const hudPix = () => ev(() => { const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
    const sc = c.width / 390, X0 = Math.round(18 * sc), W0 = Math.round(98 * sc), Y0 = Math.round(62 * sc), H0 = Math.round(7 * sc), a = x.getImageData(X0, Y0, W0, H0).data, b = x.getImageData(X0, Y0 + Math.round(14 * sc), W0, H0).data; let n = 0;
    for (let i = 0; i < a.length; i += 4) n += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); return n / (a.length / 4); });
  const hp = [], hs = [];
  for (let n = 0; n <= 4; n++) { await fresh(1); await ev((q) => __okruszek.ustawPoziom(q), n); await sleep(500); hp.push(await hudPix()); hs.push((await st()).hudSegmenty.reduce((a, b) => a + b, 0)); }
  chk(hs.every((v, i) => i === 0 || v > hs[i - 1]) && hp.every(v => v > 40) && hp[4] > hp[0] * 1.5, 'wskaźnik poziomu w stałej strefie wypełnia się z poziomem (suma wypełnienia stopni L0..L4: ' + hs.map(v => v.toFixed(2)).join(', ') + '; pasek widoczny na pikselach, różnica od tła L0..L4: ' + hp.map(v => v.toFixed(0)).join(', ') + ')', 'wskaźnik: ' + hs.join(',') + ' / ' + hp.join(','));
  await fresh(1); await ev(() => __okruszek.ustaw(0.4)); await sleep(250);
  const km = (await st()).komunikat; await sleep(2100); const km2 = (await st()).komunikat;
  chk(km === 'Kolor' && km2 === '', 'komunikat przy wejściu na poziom: "' + km + '", po ok. 2 s znika ("' + km2 + '")', 'komunikat: "' + km + '" -> "' + km2 + '"');

  /* ---------- (b) boty: trudność ---------- */
  console.log('(b) trudność: boty (czas gry 60 s, tempo x' + TEMPO + ')');
  const rect = await ev(() => { const r = document.getElementById('g').getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
  let seedR = 7; const rr = () => { seedR = (seedR * 16807) % 2147483647; return (seedR - 1) / 2147483646; };
  async function runBot(opt) {
    await ev((m) => { const o = __okruszek; o.odblokuj(); o.noc(false); o.bezPrzeszkod(true); o.bezPradow(false); o.przesun(null); o.nurkuj(false); o.tempo(m); o.nowyBieg(); }, TEMPO);
    await page.mouse.move(rect.l + rect.w / 2, rect.t + rect.h * 0.5);
    const decided = {}; let idx = 0, down = false, lastU = 99, final = null, rt = 0, rDive = false, rU = 0;
    const t0 = Date.now(), maxG = opt.seconds;
    while (Date.now() - t0 < 200000) {
      const d = await ev(() => ({ s: __okruszek.stan(), pr: __okruszek.prady(), b: __okruszek.ptak() }));
      if (d.s.tryb !== 'gra' || d.s.graCzas >= maxG) { final = d.s; break; }
      let u = 0, wantDive = false;
      if (opt.mode === 'losowy') {
        rt -= 1; if (rt <= 0) { rt = 12 + Math.floor(rr() * 25); rDive = rr() < 0.4; rU = rr() * 2 - 1; } u = rU; wantDive = rDive;
      } else if (opt.mode === 'bierny') { u = 0; wantDive = false; }
      else {
        for (const p of d.pr) if (!(p.id in decided)) decided[p.id] = opt.hit(idx++);
        const ahead = d.pr.filter(p => !p.hit && p.z > d.b.z).sort((a, b) => a.z - b.z);
        const target = ahead.find(p => decided[p.id]);
        const avoid = ahead.find(p => !decided[p.id] && (!target || p.z < target.z) && Math.abs(p.x - d.b.x) < 110);
        if (avoid) u = (avoid.x - d.b.x) >= 0 ? -1 : 1; else if (target) u = clamp((target.x - d.b.x) / 40, -1, 1);
        wantDive = opt.dive(d.s, target || ahead[0]);
      }
      if (Math.abs(u - lastU) > 0.02) { lastU = u; await page.mouse.move(rect.l + rect.w / 2 * (1 + u / 1.25), rect.t + rect.h * 0.5); }
      if (wantDive && !down) { await page.mouse.down(); down = true; } else if (!wantDive && down) { await page.mouse.up(); down = false; }
      await sleep(15);
    }
    if (down) await page.mouse.up();
    await ev(() => __okruszek.tempo(1));
    return final || (await st());
  }
  /* nurkowanie idealne: tylko gdy opłaca się (seria prądów tuż przed nami albo już rozpędzony), bo nurkowanie kosztuje wysokość; średniak nurkuje, gdy ma ponad 45% wysokości */
  const diveMid2 = (s) => s.h > 0.45;
  const diveIdeal = (s, tg) => s.h > 0.3 && ((tg && tg.z < 3.8) || s.s > 0.4), diveMid = (s) => s.h > 0.7;
  const T60 = FAST ? 40 : 60;
  const ideal = await runBot({ mode: 'hit', seconds: 150, hit: () => true, dive: diveIdeal });
  console.log('  info bot idealny: koniec ' + f2(ideal.graCzas) + ' s gry, tryb ' + ideal.tryb + ', wlotów ' + ideal.wloty + ', maks. poziom ' + ideal.poziomMax + ', pierwsze wejścia na poziomy (s gry) ' + ideal.poziomT.map(f2).join('/') + ', czas w poziomach ' + ideal.czasPoziom.map(f2).join('/') + ', hiper razy ' + ideal.hiperRazy + ', L5 bez łańcucha ' + ideal.l5bezLancucha);
  chk(ideal.poziomT[4] > 0 && ideal.poziomT[4] <= 60, 'bot idealny osiąga L4 w ' + f2(ideal.poziomT[4]) + ' s czasu gry (<= 60)', 'bot idealny: pierwsze wejście na L4 w ' + f2(ideal.poziomT[4]) + ' s (wymagane <= 60)');
  chk(ideal.l5bezLancucha === 0, 'bot idealny: L5 nigdy bez łańcucha >= 5 prądów w 12 s (L5 trwało ' + f2(ideal.l5czas) + ' s, razy ' + ideal.hiperRazy + ')', 'L5 bez łańcucha: ' + ideal.l5bezLancucha);
  chk(ideal.czasPoziom[4] > 0.5 && ideal.czasPoziom[4] / ideal.graCzas < 0.3, 'bot idealny: L4 trwa ' + f2(ideal.czasPoziom[4]) + ' s i L5 ' + f2(ideal.czasPoziom[5]) + ' s z ' + f2(ideal.graCzas) + ' s (rzadkość: ' + (100 * (ideal.czasPoziom[4] + ideal.czasPoziom[5]) / ideal.graCzas).toFixed(0) + '% biegu na L4-L5)', 'bot idealny: L4 ' + f2(ideal.czasPoziom[4]) + ' s z ' + f2(ideal.graCzas));
  chk(ideal.hiperTrwa.every(x => x > 5.4 && x < 6.6), 'bot idealny: każde L5 trwało ok. 6 s (' + ideal.hiperTrwa.map(f2).join(', ') + '; razy ' + ideal.hiperRazy + ')', 'czas L5 bota: ' + JSON.stringify(ideal.hiperTrwa));
  const midA = await runBot({ mode: 'hit', seconds: T60, hit: (i) => i % 2 === 0, dive: diveMid2 });
  const midB = await runBot({ mode: 'hit', seconds: T60, hit: () => rr() < 0.5, dive: diveMid2 });
  const midC = await runBot({ mode: 'hit', seconds: T60, hit: () => rr() < 0.5, dive: diveIdeal });
  console.log('  info średniak A (co drugi prąd): maks. poziom ' + midA.poziomMax + ', wlotów ' + midA.wloty + ', koniec ' + f2(midA.graCzas) + ' s; B (losowo 50%): ' + midB.poziomMax + ', wlotów ' + midB.wloty + ', ' + f2(midB.graCzas) + ' s; C (50% i nurkuje jak idealny): ' + midC.poziomMax + ', wlotów ' + midC.wloty + ', ' + f2(midC.graCzas) + ' s');
  chk(midA.poziomMax >= 2 && midA.poziomMax <= 3, 'średniak A (50% prądów): szczyt L' + midA.poziomMax + ' (cel L2-L3)', 'średniak A: szczyt L' + midA.poziomMax);
  chk(midB.poziomMax >= 2 && midB.poziomMax <= 3, 'średniak B (losowe 50%): szczyt L' + midB.poziomMax + ' (cel L2-L3)', 'średniak B: szczyt L' + midB.poziomMax);
  chk(midC.poziomMax <= 4, 'średniak C (50% prądów i nurkowanie jak idealny): bez L5 (szczyt L' + midC.poziomMax + ')', 'średniak C: szczyt L' + midC.poziomMax);
  const losA = await runBot({ mode: 'losowy', seconds: T60 }), losB = await runBot({ mode: 'losowy', seconds: T60 }), bier = await runBot({ mode: 'bierny', seconds: T60 });
  console.log('  info losowy A: maks. poziom ' + losA.poziomMax + ' (' + f2(losA.graCzas) + ' s), losowy B: ' + losB.poziomMax + ' (' + f2(losB.graCzas) + ' s), bierny: ' + bier.poziomMax + ' (' + f2(bier.graCzas) + ' s)');
  chk(losA.poziomMax < 4 && losB.poziomMax < 4, 'bot losowy nigdy nie osiąga L4 (szczyty L' + losA.poziomMax + ', L' + losB.poziomMax + ')');
  chk(bier.poziomMax <= 1 && bier.tryb !== 'gra', 'bot bierny: szczyt L' + bier.poziomMax + ' i lądowanie po ' + f2(bier.graCzas) + ' s', 'bot bierny: ' + bier.poziomMax + ' / ' + bier.tryb);

  /* ---------- (c) L5: tylko po łańcuchu >= 5 ---------- */
  console.log('(c) hiperprzestrzeń (L5)');
  async function chainRun(n, gap, tempo) {
    await fresh(tempo); await ev(() => { __okruszek.nurkuj(true); });
    for (let i = 0; i < 400; i++) { await ev(() => __okruszek.ustawWysokosc(1)); if ((await st()).sHold > 0.46) break; await sleep(30); }
    const log = []; let hits = 0, nextT = (await st()).graCzas, t0 = nextT;
    const tEnd = Date.now() + 90000;
    while (Date.now() < tEnd) {
      const s = await ev(() => { __okruszek.ustawWysokosc(1); return __okruszek.stan(); });
      log.push({ t: s.graCzas - t0, s: s.s, p: s.poziom, hy: s.hiper, l12: s.lancuch12, sRaw: s.sSuche });
      if (hits < n && s.graCzas >= nextT) { await ev(() => __okruszek.trafPrad()); hits++; nextT = s.graCzas + gap; }
      if (hits >= n && s.graCzas - t0 > (n * gap + 12)) break;
      await sleep(25);
    }
    await ev(() => { __okruszek.nurkuj(false); });
    return { log, fin: await st() };
  }
  const c6 = await chainRun(6, 2.0, 3);
  const hy0 = c6.log.find(x => x.hy), maxS6 = Math.max(...c6.log.map(x => x.s));
  console.log('  info łańcuch 6: maks. s ' + f2(maxS6) + ', hiper razy ' + c6.fin.hiperRazy + ', czasy ' + JSON.stringify(c6.fin.hiperTrwa.map(f2)));
  chk(c6.fin.hiperRazy === 1 && hy0 && hy0.l12 >= 5, 'łańcuch 6 prądów + nurkowanie: wchodzi L5 (przy ' + (hy0 ? hy0.l12 : '?') + ' prądach w 12 s, s=' + (hy0 ? f2(hy0.s) : '?') + ')', 'łańcuch 6: ' + JSON.stringify({ razy: c6.fin.hiperRazy, hy0 }));
  chk(c6.fin.hiperTrwa.length === 1 && c6.fin.hiperTrwa[0] > 5.4 && c6.fin.hiperTrwa[0] < 6.6, 'L5 trwa ' + (c6.fin.hiperTrwa[0] !== undefined ? f2(c6.fin.hiperTrwa[0]) : '?') + ' s (cel ok. 6) i wygasa', 'czas L5: ' + JSON.stringify(c6.fin.hiperTrwa));
  const last6 = c6.log[c6.log.length - 1];
  chk(!last6.hy && last6.p <= 4, 'po wygaśnięciu poziom wraca poniżej L5 (L' + last6.p + ')');
  const c4 = await chainRun(4, 2.0, 3);
  const maxS4 = Math.max(...c4.log.map(x => x.s)), maxP4 = Math.max(...c4.log.map(x => x.p));
  console.log('  info łańcuch 4: maks. s ' + f2(maxS4) + ', maks. poziom ' + maxP4 + ', hiper razy ' + c4.fin.hiperRazy);
  chk(c4.fin.hiperRazy === 0 && maxP4 <= 4 && maxS4 <= K.CAP5 + 1e-6, 'łańcuch tylko 4 prądów + nurkowanie: brak L5 (maks. s ' + f2(maxS4) + ' <= ' + K.CAP5 + ')', 'łańcuch 4: ' + JSON.stringify({ razy: c4.fin.hiperRazy, maxS4, maxP4 }));
  const cb = await chainRun(6, 3.6, 3);   /* odstęp > okna CHAIN_W (Z3c: 2,2 s; w Z3b było 3 s, więc odstęp łańcucha zmieniono z 2,3 na 2,0 s): łańcuch się zrywa */
  const maxPb = Math.max(...cb.log.map(x => x.p)), maxLb = Math.max(...cb.log.map(x => x.l12));
  console.log('  info 6 prądów co 3,6 s (zerwany łańcuch): maks. poziom ' + maxPb + ', maks. prądów w 12 s ' + maxLb + ', hiper ' + cb.fin.hiperRazy);
  chk(cb.fin.hiperRazy === 0 && maxPb <= 3, 'te same 6 prądów, ale poza oknem łańcucha (3,6 s > 2,2 s): brak L5 i brak L4 (szczyt L' + maxPb + ')', 'zerwany łańcuch: ' + JSON.stringify({ razy: cb.fin.hiperRazy, maxPb }));

  /* ---------- (d) kolor ---------- */
  console.log('(d) kolor: kolejność, odcienie, etapy');
  const ordered = (k) => k.niebo >= k.daleko - 1e-9 && k.daleko >= k.blisko - 1e-9 && k.blisko >= k.smugi - 1e-9 && k.smugi >= 0 && k.niebo <= 1 + 1e-9;
  let ordBad = 0, ordN = 0, layBad = 0, layN = 0, ordWhy = '';
  const PN = ['noc', 'swit', 'dzien', 'zachod'];
  for (const p of PN) {
    await fresh(1); await ev((q) => __okruszek.ustawPore(q), p);
    for (let sv = 0; sv <= 1.0001; sv += 0.05) {
      await ev((x) => __okruszek.ustaw(Math.min(1, x)), sv); await sleep(70);
      const k = await ev(() => __okruszek.kolory()), w = await ev(() => __okruszek.warstwy());
      ordN++; if (!ordered(k)) { ordBad++; ordWhy = p + ' s=' + sv.toFixed(2) + ' ' + JSON.stringify(k); }
      layN++; for (let i = 1; i < w.length; i++) if (w[i].c > w[i - 1].c + 1e-9 || w[i].z > w[i - 1].z + 1e-9) { layBad++; ordWhy = p + ' s=' + sv.toFixed(2) + ' warstwy ' + JSON.stringify(w.map(q => [+q.z.toFixed(2), q.c])); break; }
    }
  }
  chk(ordBad === 0 && ordN > 80, 'kolejność niebo >= daleko >= blisko >= smugi na każdym poziomie i o każdej porze doby (' + ordN + ' próbek: 4 pory x 21 prędkości)', 'kolejność złamana ' + ordBad + 'x: ' + ordWhy);
  chk(layBad === 0 && layN > 80, 'narysowane warstwy: kolor nie rośnie od tyłu do przodu w żadnej klatce próbki (' + layN + ' próbek, 9 warstw każda)', 'kolejność warstw złamana ' + layBad + 'x: ' + ordWhy);
  await fresh(1); await ev(() => __okruszek.ustaw(0)); await sleep(100); let k0 = await ev(() => __okruszek.kolory());
  await ev(() => __okruszek.ustaw(1)); await sleep(100); let k1 = await ev(() => __okruszek.kolory());
  chk(k0.niebo === 0 && k0.daleko === 0 && k0.blisko === 0 && k0.smugi === 0, 'L0 (s=0): zero koloru');
  chk(k1.niebo > 0.9999 && k1.daleko > 0.9999 && k1.blisko > 0.9999 && k1.smugi > 0.9999, 'pełny kolor wszędzie dopiero przy s=1');
  await ev(() => __okruszek.ustaw(0.8)); await sleep(100); const k08 = await ev(() => __okruszek.kolory());
  chk(k08.blisko < 0.9 && k08.niebo < 0.95, 'przy s=0,8 (początek L4) pełni jeszcze nie ma: ' + JSON.stringify({ n: k08.niebo, b: k08.blisko }));
  /* odcienie wchodzą po kolei */
  const odc = [];
  for (let sv = 0; sv <= 1.0001; sv += 0.02) { await ev((x) => __okruszek.ustaw(Math.min(1, x)), sv); await sleep(25); odc.push([+sv.toFixed(2), (await ev(() => __okruszek.odcienie())).n]); }
  let mono = true, maxJump = 0, firstAt = {}; for (let i = 0; i < odc.length; i++) { if (i && odc[i][1] < odc[i - 1][1]) mono = false; if (i) maxJump = Math.max(maxJump, odc[i][1] - odc[i - 1][1]); if (firstAt[odc[i][1]] === undefined) firstAt[odc[i][1]] = odc[i][0]; }
  const n05 = odc.find(x => x[0] === 0.5)[1], n02 = odc.find(x => x[0] === 0.2)[1], n09 = odc.find(x => x[0] === 0.9)[1], n015 = odc.find(x => x[0] === 0.14)[1];
  console.log('  info liczba odcieni (wagi > 0,5) od s: ' + odc.filter((x, i) => i % 5 === 0).map(x => x[0] + ':' + x[1]).join(' '));
  chk(mono && maxJump <= 1 && odc[0][1] === 0 && n015 === 0, 'odcienie dochodzą po jednym (nigdy 2 naraz w kroku 0,02), nigdy nie ubywają; w L0 zero (s=0,14: ' + n015 + ')', 'odcienie: mono=' + mono + ' maxJump=' + maxJump + ' ' + JSON.stringify(odc.slice(0, 8)));
  chk(n02 >= 1 && n02 <= 3 && n05 >= 5 && n05 <= 9 && n09 === 14 && firstAt[14] >= 0.8 && firstAt[14] <= 0.9, 'rozciągnięte po L1-L4: s=0,2 -> ' + n02 + ', 0,5 -> ' + n05 + ', 0,9 -> ' + n09 + ' z 14 (czternasty od s=' + firstAt[14] + ')', 'rozkład odcieni: ' + JSON.stringify({ n02, n05, n09, c14: firstAt[14] }));
  /* nasycenie obrazu rośnie z poziomem; w L0 sam kontur. Miara: nadwyżka chroma (max-min kanału) ponad chroma tła L0 danej pory (granat ma własną chroma),
     średnia po obrazie bez paska HUD i bez okolicy ptaszka; kol = ułamek pikseli z chroma > tło + 10 */
  const metr = () => ev(() => { const bgb = __okruszek.tlo(), bgc = Math.max(...bgb) - Math.min(...bgb), c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
    const d = x.getImageData(0, 0, t.width, t.height).data, sc = c.width / 390, bw = 90 * sc, bcx = c.width / 2, bcy = 0.76 * c.height; let ex = 0, tot = 0, col = 0;
    for (let y = 0; y < t.height; y += 2) for (let xx = 0; xx < t.width; xx += 2) { if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bw) continue; if (y < 90 * sc) continue; const i = (y * t.width + xx) * 4, ch = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]); tot++; ex += Math.max(0, ch - bgc); if (ch > bgc + 10) col++; }
    return { ex: ex / tot, kol: col / tot }; });
  const chr = [];
  for (let n = 0; n <= 4; n++) { await fresh(1); await ev(() => __okruszek.ustawPore('zachod')); await ev((q) => __okruszek.ustawPoziom(q), n); await sleep(900); chr.push(await metr()); }
  console.log('  info nadwyżka chroma / ułamek barwnych pikseli, zachód, L0..L4: ' + chr.map(c => c.ex.toFixed(1) + '/' + c.kol.toFixed(2)).join('  '));
  chk(chr[0].ex < 5 && chr[0].kol < 0.05, 'L0: sam kontur (nadwyżka chroma ' + chr[0].ex.toFixed(1) + ' < 5, barwnych pikseli ' + (100 * chr[0].kol).toFixed(0) + '%)', 'L0 ma kolor: ' + JSON.stringify(chr[0]));
  chk(chr[1].ex < 8 && chr[1].kol < 0.25, 'L1: szarości i błękit, nasycenie niskie (nadwyżka ' + chr[1].ex.toFixed(1) + ' < 8)', 'L1 nasycenie: ' + JSON.stringify(chr[1]));
  chk(chr[2].ex >= chr[1].ex && chr[3].ex > chr[2].ex && chr[4].ex >= chr[3].ex * 0.9 && chr[2].kol > chr[1].kol && chr[3].kol > chr[2].kol && chr[4].kol > chr[3].kol, 'nasycenie i liczba barwnych pikseli rosną z poziomem (nadwyżka ' + chr.map(c => c.ex.toFixed(0)).join(' < ') + '; barwnych pikseli ' + chr.map(c => (100 * c.kol).toFixed(0) + '%').join(' < ') + ')', 'etapy koloru: ' + JSON.stringify(chr));
  const chrP = {};
  for (const p of PN) { await fresh(1); await ev((q) => __okruszek.ustawPore(q), p); await ev(() => __okruszek.ustawPoziom(0)); await sleep(800); const a0 = await metr(); await ev(() => __okruszek.ustawPoziom(1)); await sleep(800); const a1 = await metr(); await ev(() => __okruszek.ustawPoziom(4)); await sleep(900); const a4 = await metr(); chrP[p] = [a0.ex, a1.ex, a4.ex]; }
  chk(PN.every(p => chrP[p][0] < 5 && chrP[p][2] > 10 && chrP[p][2] > chrP[p][1] + 8), 'każda pora doby: L0 sam kontur (< 5), L4 pełna paleta (> 10 i o ponad 8 nad L1): ' + PN.map(p => p + ' ' + chrP[p].map(v => v.toFixed(1)).join('/')).join(', '), 'pory: ' + JSON.stringify(chrP));
  await fresh(1); await ev(() => { __okruszek.ustawPore('noc'); __okruszek.ustaw(1); }); await sleep(600); const gn = (await st()).gwiazdy;
  await ev(() => { __okruszek.ustawPore('dzien'); __okruszek.ustaw(1); }); await sleep(600); const gdz = (await st()).gwiazdy;
  chk(gn > 0.9 && gdz < 0.05, 'gwiazdy: w nocy widoczne także przy pełnym kolorze (' + f2(gn) + '), w dzień przy s=1 gasną (' + f2(gdz) + ')', 'gwiazdy ' + gn + ' / ' + gdz);

  /* ---------- (e) doba ---------- */
  console.log('(e) doba w tle');
  const tdb = {};
  for (const sv of [0.1, 0.3, 0.5, 0.7, 0.9]) { await fresh(1); await ev((x) => __okruszek.ustaw(x), sv); await sleep(1800); tdb[sv] = await ev(() => __okruszek.tempoDoby()); }
  await fresh(1); await ev(() => __okruszek.ustawPoziom(5)); await sleep(4500); tdb[5] = await ev(() => __okruszek.tempoDoby());
  console.log('  info tempo doby (s na dobę): ' + Object.keys(tdb).map(k => (k === '5' ? 'L5' : 's=' + k) + ' ' + tdb[k].toFixed(1)).join(', '));
  chk(tdb[0.1] >= tdb[0.3] && tdb[0.3] > tdb[0.5] && tdb[0.5] > tdb[0.7] && tdb[0.7] >= tdb[0.9] && tdb[0.9] > tdb[5], 'tempo doby maleje z poziomem prędkości (strogo dla L0-L2 > L3 > L5)', 'tempo doby: ' + JSON.stringify(tdb));
  chk(Math.abs(tdb[0.1] - 240) < 3 && tdb[0.7] > 34 && tdb[0.7] < 46 && tdb[0.9] > 34 && tdb[0.9] < 46 && Math.abs(tdb[5] - 15) < 2, 'wartości: spokojny lot ' + f2(tdb[0.1]) + ' s (cel ok. 240), L3-L4 ' + f2(tdb[0.7]) + '/' + f2(tdb[0.9]) + ' s (cel ok. 40), L5 ' + f2(tdb[5]) + ' s (cel ok. 15)', 'wartości tempa doby: ' + JSON.stringify(tdb));
  /* pomiar rzeczywistego przesuwu fazy w czasie gry (nie tylko wzoru) */
  async function measurePeriod(prep, tempo, dur) {
    await fresh(tempo); await ev(() => __okruszek.odblokujPore()); await ev(prep); await sleep(1200);
    await ev(() => __okruszek.ustawPore(0.1, false)); await sleep(50);
    let prev = await ev(() => ({ p: __okruszek.pora(), g: __okruszek.stan().graCzas })), acc = 0; const g0 = prev.g;
    while (prev.g - g0 < dur) { await sleep(40); const cur = await ev(() => ({ p: __okruszek.pora(), g: __okruszek.stan().graCzas })); let dp = cur.p - prev.p; if (dp < -0.5) dp += 1; acc += dp; prev = cur; }
    return (prev.g - g0) / acc;
  }
  const mp1 = await measurePeriod(() => { __okruszek.ustaw(0.1); }, 8, 20), mp2 = await measurePeriod(() => { __okruszek.ustaw(0.8); }, 4, 8), mp3 = await measurePeriod(() => { __okruszek.ustawPoziom(5); }, 2, 6);
  console.log('  info zmierzony okres doby w czasie gry: spokojny ' + mp1.toFixed(0) + ' s, s=0,8 ' + mp2.toFixed(1) + ' s, L5 ' + mp3.toFixed(1) + ' s');
  chk(mp1 > 200 && mp1 < 290 && mp2 > 30 && mp2 < 50 && mp3 > 11 && mp3 < 20 && mp1 > mp2 && mp2 > mp3, 'faktyczny przesuw doby: ' + mp1.toFixed(0) + ' s (spokojny) > ' + mp2.toFixed(0) + ' s (L3-L4) > ' + mp3.toFixed(0) + ' s (L5)', 'zmierzone okresy: ' + [mp1, mp2, mp3].map(v => v.toFixed(1)).join(', '));
  /* płynność: analitycznie po całej dobie (z przejściem 1 -> 0) przy dwóch poziomach, potem na klatkach obrazu */
  let maxStepL = 0;
  for (const sv of [0.2, 0.9]) {
    await fresh(1); await ev((x) => __okruszek.ustaw(x), sv); await sleep(150);
    const arr = await ev(() => { const o = []; for (let i = 0; i <= 1000; i++) o.push(__okruszek.jasnoscPory(i / 1000)); o.push(__okruszek.jasnoscPory(0)); return o; });
    let ms = 0; for (let i = 1; i < arr.length; i++) ms = Math.max(ms, Math.abs(arr[i] - arr[i - 1])); maxStepL = Math.max(maxStepL, ms);
    console.log('  info jasność nieba: min ' + Math.min(...arr).toFixed(0) + ', maks. ' + Math.max(...arr).toFixed(0) + ', największy skok na 0,1% doby (s=' + sv + '): ' + ms.toFixed(2));
  }
  chk(maxStepL < 3, 'doba płynna: największy skok jasności nieba na 0,1% doby < 3 z 255 (' + maxStepL.toFixed(2) + '), także na styku noc -> noc', 'skok jasności ' + maxStepL);
  await fresh(1); await ev(() => { __okruszek.odblokujPore(); __okruszek.ustawPoziom(5); __okruszek.ustawPore(0.6, false); });
  await sleep(2500);
  const fr = await ev(() => new Promise(res => {
    const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = 39; t.height = 84; const x = t.getContext('2d', { willReadFrequently: true });
    const vals = []; let lastF = -1, t0 = performance.now();
    (function tick() {
      const sF = __okruszek.stan().klatki;
      if (sF !== lastF) { lastF = sF; x.drawImage(c, 0, 0, t.width, t.height); const d = x.getImageData(0, 0, 39, 84).data; let sum = 0; for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; vals.push(sum / (d.length / 4)); }
      if (performance.now() - t0 > 16500) { res(vals); return; }
      requestAnimationFrame(tick);
    })();
  }));
  let maxFrame = 0; for (let i = 1; i < fr.length; i++) maxFrame = Math.max(maxFrame, Math.abs(fr[i] - fr[i - 1]));
  console.log('  info jasność obrazu na klatkach przy L5 (doba 15 s): ' + fr.length + ' klatek, min ' + Math.min(...fr).toFixed(0) + ', maks. ' + Math.max(...fr).toFixed(0) + ', największy skok między klatkami ' + maxFrame.toFixed(2));
  chk(fr.length > 200 && maxFrame < 6 && Math.max(...fr) - Math.min(...fr) > 25, 'obraz: brak skoków jasności między klatkami (max ' + maxFrame.toFixed(2) + ' < 6) przy pełnej dobie 15 s (rozpiętość ' + (Math.max(...fr) - Math.min(...fr)).toFixed(0) + ')', 'skok jasności klatek ' + maxFrame + ' (klatek ' + fr.length + ')');
  /* kolejność pór i hak noc() */
  await fresh(1); await ev(() => { __okruszek.odblokujPore(); __okruszek.ustawPoziom(5); __okruszek.ustawPore(0.75, false); __okruszek.tempo(3); });
  const seq = []; const tq = Date.now();
  while (Date.now() - tq < 26000) { const n = (await st()).poraNazwa; if (!seq.length || seq[seq.length - 1] !== n) seq.push(n); if (seq.length >= 6) break; await sleep(80); }
  console.log('  info kolejność pór od zachodu: ' + seq.join(' > '));
  chk(seq.join(',').startsWith('zachod,noc,swit,dzien,zachod'), 'doba przechodzi w kolejności zachód > noc > świt > dzień > zachód', 'kolejność pór: ' + seq.join(','));
  await fresh(1); await ev(() => __okruszek.noc(true)); await sleep(200);
  const sn = await st();
  chk(sn.poraNazwa === 'noc' && sn.nocW === 1, 'noc() ustawia porę doby na noc (nocW=' + sn.nocW + ')');
  await ev(() => __okruszek.tempo(1));

  /* ---------- (f) nowe przeszkadzajki ---------- */
  console.log('(f) nowe przeszkadzajki');
  const NEWO = ['stado', 'wiatr', 'grad', 'burza', 'latawiec', 'mgla'];
  for (const n of NEWO) {
    await fresh(1); await ev(() => __okruszek.ustaw(1));   /* s=1: najszybszy dolot, więc najkrótsza zapowiedź */
    let tz0 = (await st()).graCzas, tz1 = null, lastT = 0; const tEnd = Date.now() + 40000;   /* czas czytany PRZED wymuszeniem: pomiar nie może być krótszy niż prawdziwa zapowiedź */
    const r = await ev((nm) => __okruszek.zdarzenie(nm), n);
    const g0 = (await gd()).filter(o => o.typ === n);
    while (Date.now() < tEnd) {
      const s = await ev(() => { __okruszek.ustawWysokosc(1); return __okruszek.stan(); }); const gg = (await gd()).filter(o => o.typ === n)[0];
      lastT = s.graCzas; if (gg && gg.faza !== 'zapowiedz') { tz1 = s.graCzas; break; } await sleep(25);
    }
    chk(r === true && g0.length === 1 && Number.isFinite(g0[0].ex) && Number.isFinite(g0[0].ey) && g0[0].faza === 'zapowiedz', 'zdarzenie(\'' + n + '\') -> true, widoczne w gdzie() (' + Math.round(g0[0].ex) + ',' + Math.round(g0[0].ey) + '), faza "zapowiedz"', 'zdarzenie(' + n + '): ' + r + ' ' + JSON.stringify(g0));
    chk(tz1 !== null && tz1 - tz0 >= 1.95, n + ': zapowiedź trwa ' + (tz1 === null ? '?' : f2(tz1 - tz0)) + ' s czasu gry (>= 2 przy najszybszym locie, s=1)', n + ': zapowiedź tylko ' + (tz1 === null ? '?' : f2(tz1 - tz0)) + ' s');
  }
  /* efekty kolizji */
  const diveTo = async (v) => { await ev(() => __okruszek.nurkuj(true)); for (let i = 0; i < 300; i++) { await ev(() => __okruszek.ustawWysokosc(1)); if ((await st()).sHold > v) break; await sleep(30); } };
  const effect = (name, opt, secs) => ev(([nm, op, sc]) => new Promise(res => {
    const o = __okruszek; const before = o.stan(); o.zdarzenie(nm, op); const log = []; const t0 = performance.now();
    (function tick() { const s = o.stan(); o.ustawWysokosc(1); if (nm === 'burza' || nm === 'mgla') o.nurkuj(false); log.push({ t: performance.now() - t0, s: s.s, p: s.poziom, wir: s.wirowanie, pot: s.potkniecie, mgla: s.mgla, sk: s.sk, kol: s.kolizje, tryb: s.tryb, bx: s.bx, wd: s.wiatrDx, tr: s.trafienia });
      if (performance.now() - t0 > sc * 1000) { res({ before, log }); return; } requestAnimationFrame(tick); })();
  }), [name, opt, secs]);
  /* stado */
  await fresh(1); await diveTo(0.45); let R = await effect('stado', { dx: 0, z: 1.0, v: 0, dir: 1 }, 1.6); let Rl = R.log[R.log.length - 1]; let Rmin = Math.min(...R.log.map(x => x.s));
  chk(R.log.some(x => x.wir) && Rmin < R.before.s * 0.5 && Rl.tr.stado === 1, 'stado na torze: wirowanie i spadek prędkości (' + f2(R.before.s) + ' -> ' + f2(Rmin) + '), 1 trafienie', 'stado: ' + JSON.stringify({ wir: R.log.some(x => x.wir), Rmin, before: R.before.s, tr: Rl.tr }));
  await fresh(1); await diveTo(0.45); R = await effect('stado', { dx: 1.0, z: 1.0, v: 0, dir: 1 }, 1.6); Rl = R.log[R.log.length - 1];
  chk(Rl.tr.stado === 0 && !R.log.some(x => x.wir), 'stado 300 jedn. obok toru: bez kolizji');
  /* latawiec */
  await fresh(1); await diveTo(0.45); R = await effect('latawiec', { dx: 0, z: 1.0 }, 1.4); Rl = R.log[R.log.length - 1]; Rmin = Math.min(...R.log.map(x => x.s));
  chk(R.log.some(x => x.pot) && Rmin < R.before.s * 0.5 && Rl.tr.latawiec === 1, 'sznur latawca na torze: potknięcie i utrata prędkości (' + f2(R.before.s) + ' -> ' + f2(Rmin) + ')', 'latawiec: ' + JSON.stringify({ pot: R.log.some(x => x.pot), Rmin, before: R.before.s, tr: Rl.tr }));
  await fresh(1); await diveTo(0.45); R = await effect('latawiec', { dx: 1.0, z: 1.0 }, 1.4); Rl = R.log[R.log.length - 1];
  chk(Rl.tr.latawiec === 0 && !R.log.some(x => x.pot), 'sznur latawca 300 jedn. obok toru: bez kolizji');
  /* po trafieniu: próbka ok. 0,1 s po (poziom po spadku) i ok. 0,6 s po (kolor); od trafienia nie nurkujemy, więc nic nie odbudowuje prędkości */
  const afterHit = (log, key, ms) => { const i0 = log.findIndex(x => x.tr[key] >= 1); if (i0 < 0) return null; const t1 = log[i0].t + ms; return log.slice(i0).find(x => x.t >= t1) || log[log.length - 1]; };
  /* burza: spadek o poziom i wirowanie */
  await fresh(1); await diveTo(0.46); const pb = (await st()).poziom; R = await effect('burza', { dx: 0, z: 1.0 }, 1.6); Rl = R.log[R.log.length - 1];
  const ab = afterHit(R.log, 'burza', 100);
  chk(R.log.some(x => x.wir) && ab && ab.p === pb - 1 && Rl.tr.burza === 1, 'burza: wirowanie i spadek o poziom (L' + pb + ' -> L' + (ab ? ab.p : '?') + ')', 'burza: ' + JSON.stringify({ wir: R.log.some(x => x.wir), pb, po: ab && ab.p, tr: Rl.tr }));
  /* mgła: spadek o poziom i gaśnięcie koloru */
  await fresh(1); await diveTo(0.46); const pm = (await st()).poziom; R = await effect('mgla', { dx: 0, z: 1.0 }, 1.6); Rl = R.log[R.log.length - 1];
  const am = afterHit(R.log, 'mgla', 100), am2 = afterHit(R.log, 'mgla', 600);
  chk(R.log.some(x => x.mgla) && am && am.p === pm - 1 && am2.sk < am2.s * 0.7 && Rl.tr.mgla === 1, 'mgła: spadek o poziom (L' + pm + ' -> L' + (am ? am.p : '?') + ') i gaśnięcie koloru (sk ' + (am2 ? f2(am2.sk) : '?') + ' < 0,7 * s ' + (am2 ? f2(am2.s) : '?') + ')', 'mgła: ' + JSON.stringify({ mgla: R.log.some(x => x.mgla), pm, po: am && am.p, sk: am2 && am2.sk, s: am2 && am2.s, tr: Rl.tr }));
  /* wiatr: znosi w bok dopiero po zapowiedzi */
  await fresh(1); R = await effect('wiatr', { dir: 1 }, 6.4);
  const w19 = R.log.filter(x => x.t < 1800), wEnd = R.log[R.log.length - 1];
  chk(w19.every(x => Math.abs(x.wd) < 1e-6) && wEnd.wd > 300 && wEnd.bx > 300, 'wiatr: w zapowiedzi (pierwsze 1,8 s) nic nie znosi, potem znosi w bok o ' + Math.round(wEnd.wd) + ' jedn. (ptaszek bez sterowania: bx=' + Math.round(wEnd.bx) + ')', 'wiatr: ' + JSON.stringify({ wd19: w19.map(x => x.wd).slice(-1), wd: wEnd.wd, bx: wEnd.bx }));
  /* grad: utrata wysokości tylko pod gradem */
  const hailRun = (dx) => ev((d) => new Promise(res => { const o = __okruszek; o.zdarzenie('grad', { dx: d }); const t0 = performance.now(); let h0 = o.wysokosc(); o.ustawWysokosc(0.9); h0 = 0.9; let hit = 0;
    (function tick() { const s = o.stan(); hit = s.trafienia.grad; if (performance.now() - t0 > 4900) { res({ h0, h: o.wysokosc(), hit }); return; } requestAnimationFrame(tick); })(); }), dx);
  await fresh(1); const hh = await hailRun(0); await fresh(1); const hc = await hailRun(1.0);
  chk(hh.hit >= 1 && hc.hit === 0 && (hc.h - hh.h) > 0.08, 'grad: trafienie = utrata wysokości (pod gradem ' + hh.h.toFixed(2) + ', obok ' + hc.h.toFixed(2) + ', różnica ' + (hc.h - hh.h).toFixed(2) + ', jedno trafienie = ' + K.HAIL_H + ')', 'grad: ' + JSON.stringify({ hh, hc }));
  /* sowa: tylko nocą; złapanie = koniec biegu z tekstem; ucieczka jak jastrząb */
  await fresh(1); await ev(() => __okruszek.ustawPore('dzien'));
  const sd = await ev(() => __okruszek.zdarzenie('sowa')), sdg = (await gd()).filter(o => o.typ === 'sowa').length;
  chk(sd === false && sdg === 0, 'sowa w dzień: zdarzenie odrzucone (false), brak na scenie');
  await fresh(1); await ev(() => __okruszek.ustawPore('zachod')); chk((await ev(() => __okruszek.zdarzenie('sowa'))) === false, 'sowa o zachodzie: odrzucona');
  await fresh(1); await ev(() => __okruszek.noc(true)); chk((await ev(() => __okruszek.zdarzenie('sowa'))) === true && (await gd()).some(o => o.typ === 'sowa' && o.faza === 'zapowiedz' && o.cien === true), 'sowa w nocy: wymuszalna, zaczyna od zapowiedzi (sam cień)');
  const owlRun = (lockV, tempo, maxGame, until) => ev(([lv, tp, mg, un]) => new Promise(res => { const o = __okruszek; o.odblokuj(); o.przesun(null); o.noc(true); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(tp); o.nowyBieg(); o.ustaw(lv); o.zdarzenie('sowa');
    const log = []; (function tick() { const s = o.stan(), j = s.jastrzab; log.push({ gc: s.graCzas, faza: j ? j.faza : null, rodzaj: j ? j.rodzaj : null, tryb: s.tryb, sygnal: s.sygnal, uciekl: s.jastrzabLog.uciekl, zlapany: s.jastrzabLog.zlapany });
      const done = (un === 'koniec' && s.tryb === 'koniec') || (un !== 'koniec' && s.graCzas > mg); if (done || s.graCzas > mg + 5) { res(log); return; } requestAnimationFrame(tick); })(); }), [lockV, tempo, maxGame, until]);
  const O1 = await owlRun(0.95, 4, 5, 'czas'), z1 = O1.filter(x => x.faza === 'zapowiedz'), p1 = O1.find(x => x.faza === 'poscig');
  chk(z1.length > 4 && z1[z1.length - 1].gc - z1[0].gc > 1.7 && p1 && p1.gc - z1[0].gc > 1.95 && p1.gc - z1[0].gc < 2.25 && z1.every(x => x.sygnal && x.rodzaj === 'sowa'), 'sowa: zapowiedź 2 s z sygnałem (pościg po ' + (p1 ? f2(p1.gc - z1[0].gc) : '?') + ' s)', 'sowa zapowiedź: ' + JSON.stringify({ n: z1.length, p1 }));
  const O2 = await owlRun(1, 6, 14.5, 'czas'), e2 = O2[O2.length - 1];
  chk(e2.tryb === 'gra' && e2.uciekl === 1 && e2.zlapany === 0 && e2.faza === null, 'sowa: ucieczka prędkością (s=1) działa jak u jastrzębia, bieg trwa');
  const O3 = await owlRun(0, 4, 40, 'koniec'); await sleep(1000);
  const ov = await ev(() => { const e = document.getElementById('wynik'); return { pokaz: e.classList.contains('pokaz'), txt: e.innerText.replace(/\s+/g, ' ').trim() }; });
  chk(O3[O3.length - 1].tryb === 'koniec' && ov.pokaz && /Sowa była szybsza\. Okruszek wraca jutro\./.test(ov.txt), 'sowa złapała: koniec biegu, tekst "' + ov.txt + '"', 'sowa koniec: ' + JSON.stringify(ov));
  await page.click('#jeszcze'); await sleep(300);

  /* ---------- harmonogram: nowe przeszkody, sowa tylko w nocy ---------- */
  console.log('(g) harmonogram nowych przeszkód (bieg 125 s czasu gry, tempo x8)');
  async function longRun(pora) {
    await ev((p) => { const o = __okruszek; o.odblokuj(); o.bezPradow(false); o.bezPrzeszkod(false); o.przesun(null); o.nurkuj(false); o.tempo(8); if (p === 'noc') o.noc(true); else if (p === 'dzien') o.ustawPore('dzien'); else { o.odblokujPore(); } o.nowyBieg(); }, pora);
    const first = {}, early = []; let last = {}, end = null; const tA = Date.now();
    while (Date.now() - tA < 90000) {
      const d = await ev(() => { __okruszek.ustawWysokosc(1); return { s: __okruszek.stan(), g: __okruszek.gdzie() }; });
      for (const k of Object.keys(d.s.spawny)) if (d.s.spawny[k] > (last[k] || 0)) { if (first[k] === undefined) first[k] = d.s.graCzas; last[k] = d.s.spawny[k]; }
      if (d.s.graCzas < 20 && d.g.some(o => o.typ !== 'prad')) early.push(d.s.graCzas);
      end = d.s; if (d.s.tryb !== 'gra' || d.s.graCzas >= 125) break; await sleep(40);
    }
    return { first, early, end };
  }
  const L = await longRun('noc');
  const EVF = { wiatr: 32, stado: 38, latawiec: 46, grad: 54, mgla: 64, burza: 76 };
  console.log('  info pierwsze pojawienia (s gry), noc: ' + JSON.stringify(L.first) + ', spawny: ' + JSON.stringify(L.end.spawny));
  chk(L.early.length === 0, 'nowe przeszkody też nie pojawiają się w pierwszych 20 s (próbek z przeszkodą: ' + L.early.length + ')');
  chk(NEWO.every(n => L.first[n] !== undefined && L.first[n] >= EVF[n] - 0.5 && L.first[n] <= EVF[n] + 30), 'harmonogram: każda nowa przeszkoda pojawia się po swoim terminie (wiatr ' + f2(L.first.wiatr) + ', stado ' + f2(L.first.stado) + ', latawiec ' + f2(L.first.latawiec) + ', grad ' + f2(L.first.grad) + ', mgła ' + f2(L.first.mgla) + ', burza ' + f2(L.first.burza) + ')', 'harmonogram: ' + JSON.stringify(L.first));
  const dl = L.end.drapieznikLog;
  chk(dl.sowa.length >= 1 && dl.jastrzab.length === 0 && dl.sowa.every(x => x.noc >= 0.5), 'harmonogram: w nocy drapieżnikiem jest sowa (' + dl.sowa.length + '), nie jastrząb (' + dl.jastrzab.length + ')', 'drapieżnik w nocy: ' + JSON.stringify(dl));
  const D = await longRun('dzien'); const dd = D.end.drapieznikLog;
  chk(dd.jastrzab.length >= 1 && dd.sowa.length === 0, 'harmonogram: za dnia drapieżnikiem jest jastrząb (' + dd.jastrzab.length + '), nigdy sowa (' + dd.sowa.length + ')', 'drapieżnik w dzień: ' + JSON.stringify(dd));

  /* ---------- pomiar klatek na poziomach (informacyjnie) ---------- */
  const fpsL = [];
  for (let n = 0; n <= 5; n++) { await fresh(1); await ev((q) => __okruszek.ustawPoziom(q), n); await sleep(1200); await ev(() => __okruszek.zerujFps()); await sleep(2500); fpsL.push((await ev(() => __okruszek.fps())).avg); }
  console.log('  info fps (headless bez GPU, 390x844 @1x) L0..L5: ' + fpsL.join(' / ') + ' (to NIE jest pomiar telefonu)');
  chk(Math.min(...fpsL) >= 25, 'klatki headless >= 25 na każdym poziomie (min ' + Math.min(...fpsL) + ')', 'klatki: ' + fpsL.join(','));

  /* ---------- błędy konsoli ---------- */
  const real = errors.filter(e => !/favicon/i.test(e));
  chk(real.length === 0, 'brak błędów i ostrzeżeń konsoli', 'błędy konsoli: ' + real.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fail ? ('TEST Z3b NIE PRZESZEDŁ (' + fail + ')') : 'TEST Z3b OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST Z3b BŁĄD: ' + e); process.exit(2); });
