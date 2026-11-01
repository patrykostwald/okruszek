/* Okruszek Z17: testy integracji toru (Z14) z grafiką tonalną (Z15) i zasady nadchmurza (PROJEKT.md 17.1). Użycie: node gra_test_z17.cjs [plik.html]
   (a) brak pageerror i ostrzeżeń konsoli w torze w trzech trybach sterowania: po >= 120 s czasu gry na tryb z botem (bot z gra_test_z14.cjs), z rysowaniem,
       z prawdziwymi gestami CDP danego trybu, z wymuszanymi przeszkodami wszystkich rodzajów, Wielkim przelotem i widowiskami nadchmurza
   (b) brak ciemnych konturów na obiektach toru: miara z gra_test_z15.cjs (dolina jasności: cienkie CIEMNE linie) na scenach z 17 rodzajami elementów toru
       i widowiskami, L0 / L2 / L4, dzień i noc, liczona jako PRZYROST względem tej samej sceny bez obiektów toru (tło nocą w torze samo ma ok. 0,004:
       tytuł krainy w HUD, księżyc, krawędzie morza chmur, czego test nie dotyczy); próg przyrostu P.DOL_PRZYROST
   (c) zieleń tylko z funkcją: w torze przy L4 bez zielonych chmur brak zielonych pikseli (próg Z15 0,003); z zieloną mgłą i oazą zieleń widać;
       mapa rodzajów toru (TOR_R15) daje zieleń tylko znakom g (nerf) i o (buff)
   (d) nadchmurze (górny wiersz) bez kolizji: widowiska (statek, satelita, ufo, samolot, drapieżnik) i samolot / UFO w górnym wierszu siatki nie zmieniają E, s,
       wiersza ani liczby kar (porównanie z identycznym biegiem bez nich); drapieżnik nie atakuje górnego wiersza i odlatuje
   (e) nazwa poziomu L1 w HUD: „PASTEL” (nie „Szarość”), także komunikat poziomu; teksty.js bez „Szarość”
   (f) tor BEZ widocznej siatki (właściciel 26.10): domyślnie siatka wyłączona, ?siatka=1 ją włącza (debug); bez siatki znika większość cienkich jasnych linii
       (szyny, ramy); cień Okruszka na chmurach widoczny we wszystkich wierszach (dzień i noc); wstęga wiatru widoczna; zapowiedź przeszkody (cień w miejscu
       jej drogi) widoczna ok. 1 s przed kontaktem
   Kończy się kodem 0 tylko gdy wszystko przeszło. */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const base = 'file:///' + file.replace(/\\/g, '/');
const CHROME = 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe';
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const info = (m) => console.log('  info ' + m);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const f4 = (v) => (typeof v === 'number' ? v.toFixed(4) : String(v));
const z14 = fs.readFileSync(path.join(__dirname, 'gra_test_z14.cjs'), 'utf8');
const BOT_TOR = z14.slice(z14.indexOf('const BOT_TOR = `') + 17, z14.indexOf('})()`;') + 4);
const P = { DOL_PRZYROST: 0.0025, ZIELEN: 0.003, CZAS: 120 };   /* DOL_PRZYROST: poniżej progu Z15 dla całego kadru (0,003), bo to tylko dodatek obiektów toru */
/* miara z gra_test_z15.cjs (MIERZ): ułamek pikseli w cienkiej ciemnej linii (dol), zielone piksele (zie); poza kwadratem ptaszka */
const MIERZ = () => {
  const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height;
  const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
  const W = t.width, H = t.height, d = x.getImageData(0, 0, W, H).data, sc = W / 390, p = __okruszek.ptakEkran(), bw = 90 * sc, bcx = p.x * sc, bcy = p.y * sc, T = 16;
  const L = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) L[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  let dol = 0, n = 0, zie = 0, tot = 0, grz = 0;
  for (let y = Math.round(90 * sc); y < H - 2; y++) for (let xx = 2; xx < W - 2; xx++) {
    if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bw) continue;
    const i = y * W + xx, l = L[i];
    if ((y & 1) === 0 && (xx & 1) === 0) { const q = i * 4, r = d[q], g = d[q + 1], b = d[q + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), ch = mx - mn; tot++; if (ch > 24 && g === mx && g > r + 10 && g > b + 4) zie++; }
    n++;
    const a = L[i - 2], bb = L[i + 2], u = L[i - 2 * W], v = L[i + 2 * W];
    if ((l < a - T && l < bb - T) || (l < u - T && l < v - T)) dol++;
    if ((l > a + T && l > bb + T) || (l > u + T && l > v + T)) grz++;
  }
  return { dol: dol / n, zie: zie / tot, grz: grz / n };
};

(async () => {
  console.log('TEST Z17 ' + file);
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errors.push('pageerror: ' + (e.stack || e))); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  await pg.goto(base + '?test&tor=1&seed=23'); await pg.waitForTimeout(900);
  // Z19: sceny pomiaru linii dotyczą przeszkolonego gracza; litery wskazówki nie są liniami siatki.
  await pg.evaluate(() => { const z=__okruszek.zapisPodglad(); z.naukaTor=1; localStorage.setItem('okruszek.zapis',JSON.stringify(z)); });
  await pg.reload(); await pg.waitForTimeout(900);
  const ev = (f, a) => pg.evaluate(f, a);
  await ev(() => { __okruszek.z11Zbuduj(); __okruszek.torSprite(); });

  /* ---------- (e) nazwa poziomu ---------- */
  console.log('(e) nazwa poziomu L1 w HUD');
  const HN = await ev(async () => { const O = __okruszek; O.panel(false); O.odblokuj(); O.nowyBieg(); O.ustawPoziom(1); await new Promise(r => setTimeout(r, 300)); const a = O.hudNazwa(); O.odblokuj(); return a; });
  chk(HN.poziom === 1 && HN.nazwa === 'PASTEL' && HN.komunikaty[1] === 'Pastel' && HN.nazwy.indexOf('Szarość') < 0, 'L1 w HUD: „' + HN.nazwa + '”, komunikat „' + HN.komunikaty[1] + '” (bez „Szarość”)', JSON.stringify(HN));
  const tx = fs.readFileSync(path.join(path.dirname(file), 'teksty.js'), 'utf8');
  chk(!/Szaro/.test(tx), 'teksty.js bez „Szarość” (ekrany i panel)');

  /* ---------- (f) tor bez widocznej siatki ---------- */
  console.log('(f) tor bez widocznej siatki: cień Okruszka, wiatry i zapowiedzi zamiast ramek');
  const S0 = await ev(() => __okruszek.torSiatka());
  { const p2 = await ctx.newPage(); await p2.goto(base + '?test&tor=1&siatka=1&seed=23'); await p2.waitForTimeout(700); const s1 = await p2.evaluate(() => __okruszek.torSiatka()); await p2.close();
    chk(S0 === false && s1 === true, 'siatka toru domyślnie niewidoczna, ?siatka=1 ją włącza (debug)', JSON.stringify({ domyslnie: S0, zFlaga: s1 })); }
  const pusty = async (siatka) => { await ev(async (sg) => { const O = __okruszek; O.torSiatka(sg); O.tempo(1); O.pauza(true); O.panel(false); O.ziarno(5); O.brama(1); O.odblokuj(); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.ustawPore('dzien'); O.ustawPoziom(0); O.idz(1, 1, true); O.pauza(false); await new Promise(r => setTimeout(r, 500)); O.tempo(0.02); await new Promise(r => setTimeout(r, 400)); }, siatka); return ev(MIERZ); };
  const G1 = await pusty(true), G0 = await pusty(false); await ev(() => __okruszek.torSiatka(false));
  chk(G0.grz < G1.grz * 0.6, 'bez siatki znikają cienkie jasne linie toru (szyny, ramy): ' + f4(G0.grz) + ' wobec ' + f4(G1.grz) + ' z ?siatka=1', JSON.stringify({ bez: G0.grz, z: G1.grz }));
  const CI = await ev(async () => { const O = __okruszek, out = [];
    const kopia = () => { const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0); return x; };
    const lum = (x0, y0, w, h) => { const c = document.getElementById('g'), k = c.width / 390, d = kopia().getImageData(Math.round(x0 * k), Math.round(y0 * k), Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))).data; let L = 0; for (let i = 0; i < d.length; i += 4) L += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; return L / (d.length / 4); };
    const czekaj = (ms) => new Promise(r => setTimeout(r, ms));
    for (const pora of ['dzien', 'noc']) for (const w of [0, 1, 2]) {
      O.pauza(true); O.panel(false); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.ustawPore(pora); O.ustawPoziom(0); O.idz(1, w, true); O.pauza(false); await czekaj(400); O.tempo(0.02);
      const q = O.cienOkruszka(); O.dbg({ torCien: 0 }); await czekaj(120); const a = lum(q.x - 20, q.y - 4, 40, 8); O.dbg({ torCien: 1 }); await czekaj(120); const b = lum(q.x - 20, q.y - 4, 40, 8); O.dbg({ torCien: 0 }); O.tempo(1);
      out.push({ pora, w, d: b - a });
    }
    /* wiatr i zapowiedź: ta sama zamrożona klatka z elementem i bez niego (przełączniki rysowania dbg), bez porównywania dwóch różnych biegów */
    const sc = async (zd) => { O.pauza(true); O.bezPrzeszkod(true); O.bezPradow(true); O.ziarno(5); O.nowyBieg(); O.ustawPore('dzien'); O.ustawPoziom(1); O.idz(1, 1, true); zd(); O.pauza(false); await czekaj(300); O.tempo(0.02); await czekaj(250); };
    const obraz = () => { const c = document.getElementById('g'); return kopia().getImageData(0, 0, c.width, c.height).data; };
    const roz = (P, Q, x0, y0, r) => { const c = document.getElementById('g'), k = c.width / 390; let s2 = 0, n = 0; for (let y = Math.round((y0 - r) * k); y < (y0 + r) * k; y += 2) for (let x = Math.round((x0 - r) * k); x < (x0 + r) * k; x += 2) { if (x < 0 || y < 0 || x >= c.width || y >= c.height) continue; const i = (y * c.width + x) * 4; s2 += Math.abs(P[i] - Q[i]) + Math.abs(P[i + 1] - Q[i + 1]) + Math.abs(P[i + 2] - Q[i + 2]); n++; } return s2 / Math.max(1, n) / 3; };
    await sc(() => O.zdarzenie('wiatr:gora', { k: 2, w: 2, z: 1.6 })); const gw = O.gdzie().find(g => g.typ === 'wiatr:gora');
    const A1 = obraz(); O.dbg({ torPl: 1 }); await czekaj(120); const A0 = obraz(); O.dbg({ torPl: 0 }); O.tempo(1);
    const wiatr = gw ? Math.max(roz(A0, A1, gw.ex, gw.ey - 20, 22), roz(A0, A1, gw.ex, gw.ey - 60, 22)) : -1;   /* wstęga biegnie od komórki wiatru w górę (do celu przerzutu): pas nad komórką */
    const sp = O.tor().sp; await sc(() => O.zdarzenie('chmura:szara', { k: 1, w: 1, z: 0.7 + sp * 1.35 })); const cq = O.cienKomorki(1, 1), eta = (O.gdzie().find(g => g.typ === 'chmura:szara') || {}).eta;
    O.dbg({ torCien: 1 }); await czekaj(120); const l1 = lum(cq.x - 20, cq.y - 4, 40, 8); O.dbg({ torCien: 1, torZapow: 1 }); await czekaj(120); const l0 = lum(cq.x - 20, cq.y - 4, 40, 8); O.dbg({ torCien: 0, torZapow: 0 }); O.tempo(1);
    return { cien: out, wiatr, zap: { l0, l1, eta } };
  });
  chk(CI.cien.every(c => Math.abs(c.d) >= 3), 'cień Okruszka na chmurach widoczny w każdym wierszu, w dzień i w nocy (pociemnienie ' + CI.cien.map(c => c.pora[0] + c.w + ' ' + c.d.toFixed(1)).join(', ') + ' >= 3)', JSON.stringify(CI.cien));
  chk(CI.wiatr >= 4, 'wstęga wiatru widoczna w świecie bez ramki komórki (średnia zmiana obrazu ' + CI.wiatr.toFixed(1) + ' >= 4)', JSON.stringify(CI));
  chk(CI.zap.l0 - CI.zap.l1 >= 3, 'zapowiedź przeszkody bez ramki: ' + (CI.zap.eta || 0).toFixed(2) + ' s przed kontaktem jej cień leży w drodze Okruszka (pociemnienie wobec tej samej klatki bez zapowiedzi ' + (CI.zap.l0 - CI.zap.l1).toFixed(1) + ' >= 3)', JSON.stringify(CI.zap));

  /* ---------- (d) nadchmurze bez kolizji ---------- */
  console.log('(d) nadchmurze: widowiska S0 bez kolizji');
  const ND = await ev((BOT) => {
    const O = __okruszek, bot = (0, eval)(BOT);
    /* Z18: dawniej bot trzymał górny wiersz machnięciami; po 17 nr 1 (QA P0-1) w nadchmurzu skrzydła nie trzymają, a wejść można tylko Schodami światła,
       więc test stawia Okruszka w nadchmurzu hakiem idz(1, 0, skok) co 0,5 s (opadanie w 0,5 s nie zmienia wiersza) i porównuje biegi z widowiskami i bez nich */
    const gora = null, trzymaj = () => O.idz(1, 0, true);
    const bieg = (z) => {
      O.pauza(true); O.panel(false); O.ziarno(7); O.brama(2); O.odblokuj(); O.ustawEnergie(null); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.ustaw(0.4); O.odblokuj(); O.idz(1, 0, true);
      const k0 = O.torLog().kontakty.length;
      if (z) { ['statek', 'satelita', 'ufo', 'samolot', 'drapieznik'].forEach((n, i) => O.zdarzenie('nadchmurze:' + n, { k: i % 3, w: 0, z: 1.1 + 0.1 * i })); O.zdarzenie('samolot', { k: 0, w: 0, z: 1.3 }); O.zdarzenie('ufo', { k: 1, w: 0, z: 2.0 }); }
      const W = [];
      for (let i = 0; i < 6; i++) { trzymaj(); const r = O.torSymuluj(0.5, gora); W.push({ s: Math.round(r.s * 1e6), E: Math.round(r.E * 1e6), w: r.kom.wiersz, h: Math.round(r.h * 1e6), tryb: r.tryb }); }
      const L = O.torLog();
      return { W, kary: L.kontakty.slice(k0).filter(e => e.efekt === 'kara').length, s0: L.kontakty.slice(k0).filter(e => e.efekt === 'widowisko').length, wid: L.widowiska, widKontakty: L.widowiskaKontakty, nWid: O.widowiska().length, gdzie: O.gdzie().filter(g => /^nadchmurze:/.test(g.typ)).map(g => g.typ + (g.kolizja ? '!' : '')) };
    };
    const A = bieg(false), B = bieg(true);
    /* drapieżnik w nadchmurzu: Okruszek trzyma górny wiersz; nie może zostać złapany */
    O.pauza(true); O.panel(false); O.brama(4); O.odblokuj(); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.ustaw(0.1); O.odblokuj(); O.idz(1, 0, true); O.zdarzenie('jastrzab');
    let jr = null; for (let i = 0; i < 28; i++) { trzymaj(); jr = O.torSymuluj(0.5, gora); if (jr.tryb !== 'gra') break; }
    const at = O.torLog().ataki.map(a => a.wynik), jz = O.stan().jastrzab;
    O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false); O.ziarno(0); O.brama(1); O.pauza(false);
    return { A, B, jastrzab: { tryb: jr.tryb, wiersz: jr.kom.wiersz, ataki: at, jest: !!jz } };
  }, BOT_TOR);
  const rowne = JSON.stringify(ND.A.W) === JSON.stringify(ND.B.W);
  chk(rowne && ND.A.kary === ND.B.kary, 'widowiska i samolot / UFO w górnym wierszu nie zmieniają s, E, wiersza ani wysokości (3 s co 0,5 s identyczne z biegiem bez nich; kary ' + ND.A.kary + ' = ' + ND.B.kary + ')', JSON.stringify({ A: ND.A.W.slice(-2), B: ND.B.W.slice(-2), kA: ND.A.kary, kB: ND.B.kary }));
  chk(ND.B.wid >= 5 && ND.B.gdzie.length >= 5 && ND.B.gdzie.every(t => !/!$/.test(t)), 'widowiska nadchmurza na scenie, bez kolizji: ' + ND.B.gdzie.join(', '), JSON.stringify(ND.B));
  chk(ND.B.s0 >= 1 && ND.B.W.every(w => w.w === 0 && w.tryb === 'gra'), 'samolot / UFO w górnym wierszu = widowisko S0 (kontakty bez kary: ' + ND.B.s0 + '), Okruszek cały czas w nadchmurzu', JSON.stringify(ND.B));
  chk(ND.jastrzab.tryb === 'gra' && ND.jastrzab.ataki.indexOf('zlapal') < 0 && ND.jastrzab.ataki.indexOf('nadchmurze') >= 0 && !ND.jastrzab.jest, 'drapieżnik nie atakuje nadchmurza: krąży i odlatuje (ataki: ' + ND.jastrzab.ataki.join(', ') + ')', JSON.stringify(ND.jastrzab));

  /* ---------- (b), (c) kontury i zieleń na obiektach toru ---------- */
  console.log('(b) brak ciemnych konturów na obiektach toru, (c) zieleń tylko z funkcją');
  const scena = (o) => ev(async (o) => {
    const O = __okruszek; O.tempo(1); O.pauza(true); O.panel(false); O.ziarno(5); O.brama(5); O.odblokuj(); O.ustawEnergie(null); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg();
    O.ustawPore(o.pora); O.ustawPoziom(o.L); O.idz(1, 1, true);
    o.typy.forEach((t, i) => O.zdarzenie(t, { k: i % 3, w: (i >> 1) % 3, z: 1.3 + (i % 6) * 0.7 }));
    if (o.wid) ['statek', 'satelita', 'ufo', 'samolot', 'drapieznik'].forEach((n, i) => O.zdarzenie('nadchmurze:' + n, { k: [-0.2, 2.2, 1, 1.4, 0.1][i], w: -0.3, z: 1.2 + 0.1 * i }));
    O.pauza(false); await new Promise(r => setTimeout(r, 500)); O.tempo(0.02); await new Promise(r => setTimeout(r, 650));
  }, o).then(() => ev(MIERZ));
  const WSZ = ['chmura:biala', 'chmura:lawenda', 'chmura:szara', 'chmura:fiolet', 'chmura:zielona_mgla', 'chmura:oaza', 'burza', 'grad', 'tornado', 'ptak', 'samolot', 'motolotnia', 'ufo', 'szpile', 'latawiec', 'wiatr:gora', 'wiatr:lewo'];
  const BEZ_ZIELENI = WSZ.filter(t => !/zielona|oaza/.test(t));
  const D = [];
  for (const pora of ['dzien', 'noc']) for (const L of [0, 2, 4]) { const m0 = await scena({ pora, L, typy: [], wid: false }), m = await scena({ pora, L, typy: WSZ, wid: true }); D.push({ pora, L, tlo: m0.dol, dol: m.dol, dd: m.dol - m0.dol }); }
  info('cienkie ciemne linie (dol): tło toru | z 17 rodzajami elementów i 5 widowiskami: ' + D.map(d => d.pora + ' L' + d.L + ' ' + f4(d.tlo) + ' | ' + f4(d.dol)).join(', '));
  chk(D.every(d => d.dd <= P.DOL_PRZYROST), 'obiekty toru bez ciemnego konturu: przyrost dol <= ' + P.DOL_PRZYROST + ' na L0 / L2 / L4 w dzień i w nocy (max ' + f4(Math.max(...D.map(d => d.dd))) + ')');
  const Z0 = await scena({ pora: 'dzien', L: 4, typy: BEZ_ZIELENI, wid: true }), Z0n = await scena({ pora: 'zachod', L: 4, typy: BEZ_ZIELENI, wid: true });
  const Z1 = await scena({ pora: 'dzien', L: 4, typy: ['chmura:zielona_mgla', 'chmura:oaza', 'chmura:zielona_mgla', 'chmura:oaza'], wid: false });
  chk(Z0.zie <= P.ZIELEN && Z0n.zie <= P.ZIELEN, 'L4, tor bez zielonych chmur: zielone piksele ' + (100 * Z0.zie).toFixed(2) + '% (dzień) i ' + (100 * Z0n.zie).toFixed(2) + '% (zachód) <= ' + (100 * P.ZIELEN) + '%');
  chk(Z1.zie > Z0.zie && Z1.zie > 0.0005, 'zielona mgła (nerf) i oaza (buff) widocznie zielone: ' + (100 * Z1.zie).toFixed(2) + '%');
  const KOL = await ev(() => __okruszek.torKolory());
  const zieloneRodzaje = Object.keys(KOL.r15).filter(k => /zielon/.test(KOL.r15[k]));
  chk(zieloneRodzaje.sort().join('') === 'go', 'zielone rodzaje chmur toru tylko dla g (mgla_zielona, nerf) i o (oaza_zielona, buff): ' + zieloneRodzaje.join(', '));

  /* ---------- (a) 120 s w każdym trybie sterowania, z rysowaniem ---------- */
  console.log('(a) brak błędów w trzech trybach sterowania (>= ' + P.CZAS + ' s czasu gry na tryb, z botem i rysowaniem)');
  const cdp = await ctx.newCDPSession(pg);
  const touch = async (type, pts) => { try { await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p[1], y: p[2], id: p[0] })) }); } catch (_) { } };
  const gest = async (m, i) => {
    if (m === 1) { const dx = i % 2 ? 60 : -60; await touch('touchStart', [[1, 200, 600]]); for (let k = 1; k <= 4; k++) { await touch('touchMove', [[1, 200 + dx * k / 4, 600]]); await sleep(16); } await touch('touchEnd', []); }
    else if (m === 2) { const x = i % 2 ? 310 : 80; await touch('touchStart', [[1, x, 700]]); await sleep(40); await touch('touchEnd', []); }
    else { const dx = i % 2 ? 45 : -45; await touch('touchStart', [[1, 90, 650]]); for (let k = 1; k <= 4; k++) { await touch('touchMove', [[1, 90 + dx * k / 4, 650]]); await sleep(20); } await sleep(120); await touch('touchEnd', []); await sleep(60); await touch('touchStart', [[2, 300, 650]]); await sleep(40); await touch('touchEnd', []); }
  };
  const TRYBY = [];
  for (const m of [1, 2, 3]) {
    const e0 = errors.length;
    await ev(([m, BOT, kr]) => {
      const O = __okruszek; O.tempo(1); O.pauza(false); O.panel(false); O.odblokuj(); O.ustawEnergie(null); O.bezPrzeszkod(false); O.bezPradow(false); O.sterowanie(m); O.ziarno(10 + m); O.brama(kr); O.nowyBieg();
      const bot = (0, eval)(BOT), R = window.__z17 = { suma: 0, ostatni: 0, biegi: 1, klatki: 0, stop: false, wym: 0, maxE: 0, poziomy: {} };
      const WYM = ['chmura:biala', 'chmura:lawenda', 'chmura:szara', 'chmura:fiolet', 'chmura:zielona_mgla', 'chmura:oaza', 'burza', 'grad', 'tornado', 'ptak', 'samolot', 'motolotnia', 'ufo', 'szpile', 'latawiec', 'przelot', 'nadchmurze:statek', 'nadchmurze:satelita', 'nadchmurze:ufo', 'nadchmurze:samolot', 'nadchmurze:drapieznik'];
      let tw = 0;
      const krok = () => {
        if (R.stop) return;
        const st = O.stan();
        if (st.tryb === 'gra') {
          const r = O.torSymuluj(1 / 60, bot, 1 / 60); R.klatki++;
          if (r.graCzas < R.ostatni) { R.suma += R.ostatni; R.biegi++; }
          R.ostatni = r.graCzas; R.maxE = Math.max(R.maxE, r.E); R.poziomy[r.poziom] = 1;
          if (r.graCzas - tw > 2) { tw = r.graCzas; const n = WYM[R.wym++ % WYM.length]; O.zdarzenie(n, { k: R.wym % 3, w: n.indexOf('nadchmurze') === 0 ? -0.3 : (R.wym >> 1) % 3, z: n.indexOf('nadchmurze') === 0 ? 1.4 : 4.5 }); }
        } else if (st.tryb === 'koniec') { R.suma += R.ostatni; R.ostatni = 0; R.biegi++; O.panel(false); O.nowyBieg(); tw = 0; }
        requestAnimationFrame(krok);
      };
      requestAnimationFrame(krok);
    }, [m, BOT_TOR, [3, 4, 5][m - 1]]);
    const t0 = Date.now(); let i = 0, R = null;
    while (Date.now() - t0 < 170000) {
      await sleep(2500); await gest(m, i++);
      R = await ev(() => { const R = window.__z17; return { suma: R.suma + R.ostatni, biegi: R.biegi, klatki: R.klatki, wym: R.wym, maxE: R.maxE, poziomy: Object.keys(R.poziomy).join('') }; });
      if (R.suma >= P.CZAS) break;
    }
    await ev(() => { window.__z17.stop = true; });
    const st = await ev(() => { const s = __okruszek.stan(); return { klatki: s.klatki }; });
    const bl = errors.slice(e0).filter(e => !/favicon/i.test(e));
    TRYBY.push({ m, R, bl });
    info('tryb ' + m + ': ' + R.suma.toFixed(1) + ' s czasu gry w ' + Math.round((Date.now() - t0) / 1000) + ' s, biegów ' + R.biegi + ', kroków bota ' + R.klatki + ', wymuszeń ' + R.wym + ', E max ' + R.maxE.toFixed(2) + ', poziomy ' + R.poziomy + ', gestów ' + i + ', klatek strony ' + st.klatki);
    chk(R.suma >= P.CZAS && bl.length === 0, 'tryb ' + m + ': >= ' + P.CZAS + ' s czasu gry bez pageerror i ostrzeżeń konsoli', 'tryb ' + m + ': ' + R.suma.toFixed(1) + ' s; błędy: ' + bl.slice(0, 3).join(' | '));
  }
  const real = errors.filter(e => !/favicon/i.test(e));
  chk(real.length === 0, 'brak błędów i ostrzeżeń konsoli w całym teście', real.slice(0, 4).join(' | '));
  await browser.close();
  console.log(fail ? ('TEST Z17 NIE PRZESZEDŁ (' + fail + ')') : 'TEST Z17 OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST Z17 BŁĄD: ' + (e && e.stack || e)); process.exit(2); });
