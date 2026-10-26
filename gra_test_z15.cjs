/* Okruszek Z15: testy grafiki tonalnej (PROJEKT.md 15.5 i 15.7). Użycie: node gra_test_z15.cjs [plik.html]
   Baza do porównań: BAZA=ścieżka (domyślnie ../gra-okruszek-Z11/index.html, wersja przed Z15).
   (a) brak jednolitego ciemnego obrysu: ułamek pikseli w cienkiej CIEMNEJ linii (dolina jasności: piksel ciemniejszy o > 16 od obu sąsiadów w odległości 2 px,
       poziomo albo pionowo) na L0-L5 o zachodzie, w dzień i w nocy, także na scenach z przeszkodami i wieżami; porównanie z bazą (ten sam pomiar);
       w L0 brak białego konturu na granacie (grzbiety: cienkie JASNE linie)
   (b) przejścia: brak skoku jasności i nasycenia powyżej progu między sąsiednimi poziomami L0-L5 (4 pory), przy przemiataniu etapu koloru co 0,05
       i w czasie gry po wlocie w prąd (klatka do klatki; kolor napływa w ok. 0,3 s zamiast skakać)
   (c) pory doby: L0 i L2 przy przejściu przez całą dobę co 2% bez skoku jasności obrazu
   (d) L0 nie jest czarny: średnia jasność obrazu w zakresie dla każdej pory; L0 bez koloru ponad chromę tła (szaroniebieskie tony)
   (e) kolejność koloru niebo >= daleko >= blisko >= smugi (E = 0 / 0,3 / 0,62 / 1, 4 pory) i monotoniczność etapów (nasycenie rośnie z poziomem, tolerancja jak w Z3b)
   (f) zieleń tylko w chmurach z funkcją: w pełnym kolorze (L4) brak zielonych pikseli w świecie dekoracyjnym; paleta CHMURY15 ma zieleń tylko w mgla_zielona i oaza_zielona
   (g) pamięć sprite'ów <= 60 MB (wszystkie wieże, samoloty i 8 chmur toru), klatki headless nie gorsze niż o 10% od bazy, tryb lekki działa
   Kończy się kodem 0 tylko gdy wszystko przeszło. */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const baza = path.resolve(process.env.BAZA || path.join(__dirname, '..', 'gra-okruszek-Z11', 'index.html'));
const uOf = (f, q) => 'file:///' + f.split(path.sep).join('/') + '?test&seed=23' + (q || '');
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const f1 = (v) => (typeof v === 'number' ? v.toFixed(1) : String(v));
const f4 = (v) => (typeof v === 'number' ? v.toFixed(4) : String(v));
/* progi (uzasadnienie w raporcie Z15) */
const P = {
  DOL_L04: 0.003,      /* cienkie ciemne linie na L0-L4: Z11 miał 0,005-0,023 (tusz), Z15 ok. 0,0005-0,0018 */
  DOL_L5: 0.008,       /* L5: promieniste smugi hiperprzestrzeni dają przerwy między jasnymi kreskami (nie kontur) */
  DOL_WZGL: 0.35,      /* L2 (zachód, dzień, noc): najwyżej 35% wartości bazy Z11 */
  GRZ_L0: 0.008,       /* L0: cienkie jasne linie (dawny biały kontur): Z11 ok. 0,035-0,049 */
  DLUM_POZ: 45,        /* sąsiednie poziomy: |różnica średniej jasności| (Z11: do 104) */
  DCHR_POZ: 35,        /* sąsiednie poziomy: |różnica średniej chromy| (Z11: do 32; pełnia L4 ma być wyraźną nagrodą) */
  DLUM_KROK: 15,       /* przemiatanie etapu co 0,05: |różnica jasności| (Z11: do 29) */
  DCHR_KROK: 10,       /* przemiatanie co 0,05: |różnica chromy| */
  WLOT_WZGL: 0.6,      /* po wlocie w prąd: największy skok jasności klatki najwyżej 60% skoku bazy Z11 (błysk wlotu jest w obu) */
  DLUM_PORA: 8,        /* doba co 2% (2% doby trwa najmniej 0,3 s = ok. 18 klatek przy L5): skok jasności obrazu między próbkami */
  L0_ZAKRES: { zachod: [60, 115], noc: [45, 100], dzien: [85, 150], swit: [70, 130] },
  ZIELEN: 0.003        /* udział zielonych pikseli w świecie przy L4 */
};
const MIERZ = () => {
  const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height;
  const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
  const W = t.width, H = t.height, d = x.getImageData(0, 0, W, H).data, sc = W / 390, bw = 90 * sc, bcx = W / 2, bcy = 0.76 * H, T = 16;
  const L = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) L[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  const bgb = __okruszek.tlo(), bgc = Math.max(...bgb) - Math.min(...bgb);
  let lum = 0, chr = 0, ex = 0, tot = 0, dol = 0, grz = 0, n = 0, zie = 0;
  for (let y = Math.round(90 * sc); y < H - 2; y++) for (let xx = 2; xx < W - 2; xx++) {
    if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bw) continue;
    const i = y * W + xx, l = L[i];
    if ((y & 1) === 0 && (xx & 1) === 0) {
      const q = i * 4, r = d[q], g = d[q + 1], b = d[q + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), ch = mx - mn;
      lum += l; chr += ch; ex += Math.max(0, ch - bgc); tot++;
      if (ch > 24 && g === mx && g > r + 10 && g > b + 4) zie++;   /* zielony: kanał G dominuje wyraźnie */
    }
    n++;
    const a = L[i - 2], bb = L[i + 2], u = L[i - 2 * W], v = L[i + 2 * W];
    if ((l < a - T && l < bb - T) || (l < u - T && l < v - T)) dol++;
    if ((l > a + T && l > bb + T) || (l > u + T && l > v + T)) grz++;
  }
  return { lum: lum / tot, chr: chr / tot, ex: ex / tot, dol: dol / n, grz: grz / n, zie: zie / tot };
};

(async () => {
  console.log('TEST Z15 ' + file);
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const errors = [];
  const watch = (p) => { p.on('pageerror', e => errors.push('pageerror: ' + e)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); }); };
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const strona = async (f, q) => { const p = await ctx.newPage(); watch(p); await p.goto(uOf(f, q)); await sleep(900); return p; };
  const fresh = (p) => p.evaluate(() => { const o = __okruszek; o.odblokuj(); o.nurkuj(false); o.przesun(null); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.nowyBieg(); o.noc(false); o.tempo(0.02); });
  const poziomy = async (p, pora) => { const out = []; await fresh(p); for (let n = 0; n <= 5; n++) { await p.evaluate((a) => { __okruszek.ustawPore(a[0]); __okruszek.ustawPoziom(a[1]); }, [pora, n]); await sleep(n === 5 ? 1000 : 650); out.push(await p.evaluate(MIERZ)); } return out; };
  const pg = await strona(file, '&pasmo=1');
  const need = ['z15', 'torChmura', 'ustawPoziom', 'ustawPore', 'kolory', 'pamiec', 'fps', 'trafPrad', 'dbg', 'lekki'];
  const miss = await pg.evaluate((n) => n.filter(k => typeof __okruszek[k] !== 'function'), need);
  chk(miss.length === 0, 'hak Z15 kompletny (' + need.join(', ') + ')', 'w haku brakuje: ' + miss.join(', '));

  /* ---------- (a) obrys ---------- */
  console.log('(a) brak jednolitego ciemnego obrysu');
  const PORY = ['zachod', 'dzien', 'noc', 'swit'], M = {};
  for (const pora of PORY) { M[pora] = await poziomy(pg, pora); console.log('  info ' + pora.padEnd(6) + ' jasność/chroma/ciemne linie/jasne linie L0..L5: ' + M[pora].map(m => f1(m.lum) + '/' + f1(m.chr) + '/' + f4(m.dol) + '/' + f4(m.grz)).join('  ')); }
  let maxDol04 = 0, maxDol5 = 0, gdzie = '';
  for (const pora of PORY) M[pora].forEach((m, n) => { if (n < 5 && m.dol > maxDol04) { maxDol04 = m.dol; gdzie = pora + ' L' + n; } if (n === 5) maxDol5 = Math.max(maxDol5, m.dol); });
  chk(maxDol04 <= P.DOL_L04, 'cienkie ciemne linie (kontur) na L0-L4, 4 pory: najwięcej ' + f4(maxDol04) + ' (' + gdzie + ') <= ' + P.DOL_L04, 'ciemny obrys: ' + f4(maxDol04) + ' w ' + gdzie);
  chk(maxDol5 <= P.DOL_L5, 'L5 (smugi hiperprzestrzeni): ciemne linie ' + f4(maxDol5) + ' <= ' + P.DOL_L5);
  const grz0 = Math.max(...PORY.map(p => M[p][0].grz));
  chk(grz0 <= P.GRZ_L0, 'L0 bez białego konturu na granacie: cienkie jasne linie najwyżej ' + f4(grz0) + ' <= ' + P.GRZ_L0);
  /* sceny z przeszkodami i wieżami */
  const scenaDol = async (p, L, ev) => {
    await fresh(p); await p.evaluate((a) => { const o = __okruszek; o.ustawPore('zachod'); o.ustawPoziom(a[0]); o.bezPrzeszkod(false); o.tempo(1); a[1].forEach(e => o.zdarzenie(e[0], e[1])); }, [L, ev]);
    await sleep(2600); await p.evaluate(() => __okruszek.tempo(0.02)); await sleep(500); return p.evaluate(MIERZ);
  };
  const EVP = [['ptak', { z: 1.6, wiek: 2 }], ['stado', { z: 2.6, wiek: 2 }], ['burza', { z: 2.4, wiek: 2 }], ['latawiec', { z: 2.0, wiek: 2 }], ['jastrzab', {}]];
  const sp = [];
  for (const L of [0, 2, 4]) sp.push(await scenaDol(pg, L, EVP));
  console.log('  info przeszkody (ptak, stado, burza, latawiec, jastrząb) L0/L2/L4: ciemne linie ' + sp.map(m => f4(m.dol)).join(' / '));
  chk(Math.max(...sp.map(m => m.dol)) <= P.DOL_L04, 'przeszkody bez ciemnego konturu: ' + sp.map(m => f4(m.dol)).join(' / ') + ' <= ' + P.DOL_L04);
  {
    const pz = await strona(file, '');
    await pz.evaluate(() => __okruszek.z11Zbuduj());
    const sz = [];
    for (const L of [0, 2, 4]) {
      await pz.evaluate((L) => { const o = __okruszek; o.pauza(true); o.tempo(1); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokuj(); o.odblokujPore(); o.brama(3); o.ustawPore('zachod'); o.ustawPoziom(L); o.ustawWysokosc(0.8); o.symuluj(0.6); o.zdarzenie('szpile', { uklad: 'aleja', dx: 0, z: 2.2 }); o.symuluj(1.15); o.tempo(0.02); o.pauza(false); }, L);
      await sleep(900); sz.push(await pz.evaluate(MIERZ));
      await pz.evaluate((L) => { const o = __okruszek; o.pauza(true); o.tempo(1); o.odblokuj(); o.brama(5); o.ustawPore('zachod'); o.ustawPoziom(L); o.ustawWysokosc(0.8); o.symuluj(0.6); o.zdarzenie('przelot', { dx: 0, wiry: true }); o.symuluj(1.55); o.tempo(0.02); o.pauza(false); }, L);
      await sleep(900); sz.push(await pz.evaluate(MIERZ));
    }
    console.log('  info wieże i samolot (L0/L2/L4, szpile|samolot): ciemne linie ' + sz.map(m => f4(m.dol)).join(' '));
    chk(Math.max(...sz.map(m => m.dol)) <= P.DOL_L04, 'wieże (szpile) i samolot bez ciemnego konturu: najwięcej ' + f4(Math.max(...sz.map(m => m.dol))) + ' <= ' + P.DOL_L04);
    await pz.close();
  }
  if (!fs.existsSync(baza)) bad('brak bazy do porównania: ' + baza);
  else {
    const pb = await strona(baza, '&pasmo=1'), bz = {};
    for (const pora of ['zachod', 'dzien', 'noc']) { await fresh(pb); await pb.evaluate((a) => { __okruszek.ustawPore(a); __okruszek.ustawPoziom(2); }, pora); await sleep(700); bz[pora] = await pb.evaluate(MIERZ); }
    await fresh(pb); await pb.evaluate(() => { __okruszek.ustawPore('zachod'); __okruszek.ustawPoziom(0); }); await sleep(700); const bz0 = await pb.evaluate(MIERZ);
    await pb.close();
    const wz = ['zachod', 'dzien', 'noc'].map(p => M[p][2].dol / Math.max(1e-6, bz[p].dol));
    console.log('  info baza Z11, L2: ciemne linie zachód/dzień/noc ' + ['zachod', 'dzien', 'noc'].map(p => f4(bz[p].dol)).join(' / ') + '; Z15: ' + ['zachod', 'dzien', 'noc'].map(p => f4(M[p][2].dol)).join(' / ') + '; L0 zachód: jasność ' + f1(bz0.lum) + ' -> ' + f1(M.zachod[0].lum) + ', jasne linie ' + f4(bz0.grz) + ' -> ' + f4(M.zachod[0].grz));
    chk(Math.max(...wz) <= P.DOL_WZGL, 'ciemne linie na L2 względem Z11: ' + wz.map(v => (100 * v).toFixed(0) + '%').join(' / ') + ' (<= ' + (100 * P.DOL_WZGL) + '%)');
  }

  /* ---------- (b) przejścia ---------- */
  console.log('(b) przejścia między poziomami, przemiatanie etapu, czas gry');
  let mxL = 0, mxC = 0, gL = '', gC = '';
  for (const pora of PORY) for (let n = 0; n < 5; n++) { const a = M[pora][n], b = M[pora][n + 1], dl = Math.abs(b.lum - a.lum), dc = Math.abs(b.chr - a.chr); if (dl > mxL) { mxL = dl; gL = pora + ' L' + n + '>L' + (n + 1); } if (dc > mxC) { mxC = dc; gC = pora + ' L' + n + '>L' + (n + 1); } }
  chk(mxL <= P.DLUM_POZ, 'sąsiednie poziomy: największy skok jasności ' + f1(mxL) + ' (' + gL + ') <= ' + P.DLUM_POZ, 'skok jasności ' + f1(mxL) + ' w ' + gL);
  chk(mxC <= P.DCHR_POZ, 'sąsiednie poziomy: największy skok chromy ' + f1(mxC) + ' (' + gC + ') <= ' + P.DCHR_POZ, 'skok chromy ' + f1(mxC) + ' w ' + gC);
  const sw = [];
  await fresh(pg);
  for (let sv = 0; sv <= 1.0001; sv += 0.05) { await pg.evaluate((v) => { __okruszek.ustaw(Math.min(1, v)); __okruszek.ustawPore('zachod'); }, sv); await sleep(400); sw.push(await pg.evaluate(MIERZ)); }
  let kL = 0, kC = 0; for (let i = 1; i < sw.length; i++) { kL = Math.max(kL, Math.abs(sw[i].lum - sw[i - 1].lum)); kC = Math.max(kC, Math.abs(sw[i].chr - sw[i - 1].chr)); }
  console.log('  info przemiatanie s 0..1 co 0,05 (zachód), jasność: ' + sw.map(m => f1(m.lum)).join(' '));
  chk(kL <= P.DLUM_KROK && kC <= P.DCHR_KROK, 'przemiatanie etapu co 0,05: największy skok jasności ' + f1(kL) + ' <= ' + P.DLUM_KROK + ', chromy ' + f1(kC) + ' <= ' + P.DCHR_KROK);
  {   /* czas gry: wlot w prąd (E 0 -> 0,3) przy odblokowanej energii; jasność klatka po klatce na zmniejszonej kopii; ten sam scenariusz na bazie Z11
       (w obu jest też błysk wlotu: ekran rozjaśnia się w jednej klatce o ok. 10% barwą słońca; to sygnał gry, nie etap koloru, więc porównujemy z bazą) */
    const wlot = async (p) => {
      await fresh(p); await p.evaluate(() => { const o = __okruszek; o.odblokuj(); o.tempo(1); o.ustawPore('zachod'); });
      await sleep(600);
      return p.evaluate(() => new Promise(res => {
        const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = 39; t.height = 84; const x = t.getContext('2d', { willReadFrequently: true });
        const vals = [], sk = []; let lastF = -1, t0 = performance.now(), hit = false;
        (function tick() {
          const st = __okruszek.stan();
          if (st.klatki !== lastF) { lastF = st.klatki; x.drawImage(c, 0, 0, t.width, t.height); const d = x.getImageData(0, 9, 39, 75).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; vals.push(s / (d.length / 4)); sk.push(__okruszek.z15 ? __okruszek.z15().skV : st.sk); }
          if (!hit && performance.now() - t0 > 400) { hit = true; __okruszek.trafPrad(); }
          if (performance.now() - t0 > 1600) { res({ vals, sk }); return; }
          requestAnimationFrame(tick);
        })();
      }));
    };
    const ocen = (fr) => { let mf = 0; for (let i = 1; i < fr.vals.length; i++) mf = Math.max(mf, Math.abs(fr.vals[i] - fr.vals[i - 1])); const skMax = Math.max(...fr.sk), i90 = fr.sk.findIndex(v => v >= 0.9 * skMax), i10 = fr.sk.findIndex(v => v >= 0.1 * skMax); return { mf, skMax, kl: i90 - i10, n: fr.vals.length, lo: Math.min(...fr.vals), hi: Math.max(...fr.vals) }; };
    const A = ocen(await wlot(pg));
    let B = null; if (fs.existsSync(baza)) { const pb = await strona(baza, '&pasmo=1'); B = ocen(await wlot(pb)); await pb.close(); }
    console.log('  info wlot w prąd: Z15 ' + A.n + ' klatek, jasność ' + f1(A.lo) + '..' + f1(A.hi) + ', etap rysowania 10% -> 90% w ' + A.kl + ' klatkach, największy skok między klatkami ' + f1(A.mf) + (B ? '; baza Z11: skok ' + f1(B.mf) + ', etap 10% -> 90% w ' + B.kl + ' klatkach' : ''));
    chk(A.n > 30 && A.skMax > 0.05 && A.kl >= 3 && (!B || A.mf <= P.WLOT_WZGL * B.mf), 'po wlocie w prąd kolor napływa przez ' + A.kl + ' klatek (Z11: ' + (B ? B.kl : '?') + '), największy skok jasności klatki ' + f1(A.mf) + (B ? ' <= ' + P.WLOT_WZGL + ' x Z11 (' + f1(B.mf) + ')' : ''), 'przejście w czasie: ' + JSON.stringify({ A, B }));
  }

  /* ---------- (c) pory doby ---------- */
  console.log('(c) pory doby');
  for (const L of [0, 2]) {
    await fresh(pg); await pg.evaluate((L) => __okruszek.ustawPoziom(L), L);
    const v = []; for (let k = 0; k <= 50; k++) { await pg.evaluate((x) => __okruszek.ustawPore((x % 1), true), k * 0.02); await sleep(110); v.push((await pg.evaluate(MIERZ)).lum); }
    let m = 0; for (let i = 1; i < v.length; i++) m = Math.max(m, Math.abs(v[i] - v[i - 1]));
    console.log('  info L' + L + ' doba co 2%: jasność ' + f1(Math.min(...v)) + '..' + f1(Math.max(...v)) + ', największy skok ' + f1(m));
    chk(m <= P.DLUM_PORA, 'L' + L + ': przejście przez dobę co 2% bez skoku jasności (' + f1(m) + ' <= ' + P.DLUM_PORA + ')');
  }

  /* ---------- (d) L0 nie czarny, bez koloru ---------- */
  console.log('(d) L0');
  for (const pora of PORY) { const m = M[pora][0], z = P.L0_ZAKRES[pora]; chk(m.lum >= z[0] && m.lum <= z[1] && m.ex < 5, 'L0 ' + pora + ': średnia jasność ' + f1(m.lum) + ' w [' + z[0] + ', ' + z[1] + '], nadwyżka chromy ponad tło ' + f1(m.ex) + ' < 5 (szaroniebieskie tony, bez koloru)'); }
  const L0p = await pg.evaluate(() => __okruszek.z15().L0);
  chk(0.299 * L0p.bg[0] + 0.587 * L0p.bg[1] + 0.114 * L0p.bg[2] >= 28, 'tło L0 (niebo u góry) nie jest czarne: ' + JSON.stringify(L0p.bg.map(Math.round)));

  /* ---------- (e) kolejność i monotoniczność ---------- */
  console.log('(e) kolejność koloru i etapy');
  let ordBad = 0, ordN = 0, why = '';
  for (const pora of PORY) for (const e of [0, 0.3, 0.62, 1]) {
    await pg.evaluate((a) => { const o = __okruszek; o.odblokuj(); o.ustawPore(a[0]); o.ustawEnergie(a[1]); }, [pora, e]); await sleep(60);
    const k = await pg.evaluate(() => __okruszek.kolory()); ordN++;
    if (!(k.niebo >= k.daleko - 1e-9 && k.daleko >= k.blisko - 1e-9 && k.blisko >= k.smugi - 1e-9)) { ordBad++; why = pora + ' E=' + e + ' ' + JSON.stringify(k); }
  }
  await pg.evaluate(() => __okruszek.ustawEnergie(null));
  chk(ordBad === 0, 'kolejność niebo >= daleko >= blisko >= smugi (' + ordN + ' próbek: 4 pory x E 0 / 0,3 / 0,62 / 1)', 'kolejność złamana: ' + why);
  const chz = M.zachod.map(m => m.ex);
  console.log('  info nadwyżka chromy ponad tło, zachód L0..L4: ' + chz.slice(0, 5).map(f1).join(' / '));
  chk(chz[1] <= chz[0] + 3 && chz[2] >= chz[1] && chz[3] > chz[2] && chz[4] >= chz[3] * 0.9, 'nasycenie rośnie z poziomem (tolerancja jak w Z3b: L4 >= 0,9 x L3)');

  /* ---------- (f) zieleń ---------- */
  console.log('(f) zieleń tylko z funkcją');
  const zi = [];
  for (const pora of ['zachod', 'dzien', 'noc']) zi.push(M[pora][4].zie);
  chk(Math.max(...zi) <= P.ZIELEN, 'L4: zielone piksele w świecie dekoracyjnym ' + zi.map(v => (100 * v).toFixed(2) + '%').join(' / ') + ' <= ' + (100 * P.ZIELEN) + '%');
  const pal = await pg.evaluate(() => __okruszek.z15());
  chk(pal.chmury.indexOf('mgla_zielona') >= 0 && pal.chmury.indexOf('oaza_zielona') >= 0, 'paleta toru ma zieloną mgłę (nerf) i zieloną oazę (buff): ' + pal.chmury.join(', '));

  /* ---------- (g) pamięć, klatki, tryb lekki ---------- */
  console.log('(g) pamięć i klatki');
  const PM = await pg.evaluate(() => { const o = __okruszek; o.z11Zbuduj(); ['biala', 'lawenda', 'szara', 'burzowa', 'roz', 'brzoskwinia', 'mgla_zielona', 'oaza_zielona'].forEach((r, k) => o.torChmura(r, k)); return o.pamiec(); });
  chk(PM.MB <= 60, 'pamięć sprite\'ów (wszystkie wieże, samoloty, 8 chmur toru): ' + PM.MB + ' MB <= 60 (' + PM.sprite + ' sprite\'ów)', 'pamięć: ' + JSON.stringify(PM));
  await pg.evaluate(() => { const o = __okruszek; o.lekki(true); o.ustawPoziom(2); }); await sleep(500);
  const lk = await pg.evaluate(MIERZ); await pg.evaluate(() => __okruszek.lekki(false));
  chk(lk.lum > 40 && lk.dol <= P.DOL_L04, 'tryb lekki rysuje (jasność ' + f1(lk.lum) + ', ciemne linie ' + f4(lk.dol) + ')');
  await pg.close();
  const fpsScena = async (f) => {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); watch(p);
    await p.goto(uOf(f, '&pasmo=1')); await sleep(700);
    await p.evaluate(() => { const o = __okruszek; o.odblokuj(); o.bezPrzeszkod(true); o.bezPradow(true); o.nowyBieg(); o.ustawPore('zachod'); o.tempo(1); o.ustawPoziom(2); });
    await sleep(900); await p.evaluate(() => { __okruszek.zerujFps(); if (__okruszek.zerujCpu) __okruszek.zerujCpu(); });
    await sleep(3000);
    const r = await p.evaluate(() => ({ fps: __okruszek.fps().avg, cpu: __okruszek.cpu ? __okruszek.cpu().sr : null }));
    await p.close(); return r;
  };
  if (fs.existsSync(baza)) {
    const FB = [], FN = [];
    for (let r = 0; r < 3; r++) { FB.push(await fpsScena(baza)); FN.push(await fpsScena(file)); }
    const best = (a) => Math.max(...a.map(x => x.fps));
    console.log('  info klatki L2 w ruchu (najlepszy z 3, 390x844 @2x, headless bez GPU, to NIE jest pomiar telefonu): Z11 ' + f1(best(FB)) + ' (' + FB.map(x => f1(x.fps)).join('/') + '), Z15 ' + f1(best(FN)) + ' (' + FN.map(x => f1(x.fps)).join('/') + '); czas rysowania ms Z11 ' + FB.map(x => x.cpu).join('/') + ', Z15 ' + FN.map(x => x.cpu).join('/'));
    chk(best(FN) >= 0.9 * best(FB), 'klatki nie gorsze niż o 10% od Z11 (' + f1(best(FN)) + ' vs ' + f1(best(FB)) + ' kl/s)');
  }
  const real = errors.filter(e => !/favicon/i.test(e));
  chk(real.length === 0, 'brak błędów i ostrzeżeń konsoli', 'błędy konsoli: ' + real.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fail ? ('TEST Z15 NIE PRZESZEDŁ (' + fail + ')') : 'TEST Z15 OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST Z15 BŁĄD: ' + (e && e.stack || e)); process.exit(2); });
