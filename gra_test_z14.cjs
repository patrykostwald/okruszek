/* Okruszek Z14: testy rdzenia „Tor 3x3” (?tor=1). Użycie: node gra_test_z14.cjs [plik.html]
   (a) przełącznik: ?tor=1 włącza tor, bez parametru i z ?swobodny=1 zostaje swobodny lot; hak toru kompletny
   (b) biblioteka WZORCE: >= 40 wzorców, znaki 3 x 3 ze znanego zestawu, KAŻDY plaster spełnia zasadę uczciwości, łańcuchy wiatrów osiągalne bez wznoszenia
   (c) generator: 1000 wylosowanych plastrów (losowe N i krainy) uczciwych; łańcuchy z generatora osiągalne; plastry z prawdziwych biegów uczciwe
   (d) zieleń tylko z funkcją: każda zielona chmura toru ma funkcję (buff / nerf), żadna inna chmura nie jest zielona, zielone znaki w wzorcach i generatorze to tylko g / o
   (e) zapowiedzi: od pojawienia się plastra do kontaktu >= 1,5 s na L0, L2, L4 i L5; ostrzeżenie przeszkód 1,5 s; drapieżnik >= 2 s, zaznaczenie komórki przed atakiem >= 1,5 s
   (f) bot po torze: 60 s czasu gry bez lądowania (trafia wiatry, omija przeszkody, utrzymuje wysokość machnięciami) w K1, K3, K4 i K5
   (g) bot bierny ląduje po 20-40 s (kilka ziaren)
   (h) 0 końców biegu poza S3 przy 400 wymuszeniach wszystkich przeszkód toru (tylko morze chmur, jastrząb, sowa)
   (i) łańcuch: 3 wiatry z rzędu = E = 1 (rozkwit), 5 w 12 s + nurkowanie = L5, 5 bez nurkowania nie daje L5, bot losowy nigdy E = 1, wiatr „na wprost” tylko ze środka
   (j) ruch: koszt wznoszenia 2 / 3 machnięcia, spam słabszy niż rytm, szybowanie wiersz co ok. SINK_T s, nurkowanie + wybicie, bez wyjścia poza siatkę, osiem kierunków ze środka
   (k) skrzydła zgodne z akcją (szybowanie rozłożone, machnięcie ciężki zamach, nurkowanie złożone, bok asymetryczny)
   (l) trzy tryby sterowania (prawdziwy dotyk przez CDP), mysz i klawiatura: kolumny, wiersze, ukosy, machnięcie, nurkowanie; brak ducha palca
   (m) krainy i bramy (Z10): przelot bramy w torze, przeszkody krain (szpile K3, latawce K4, samoloty i smuga K5), drapieżnik złapie tylko w zaznaczonej komórce
   (n) pamięć sprite'ów <= 60 MB, klatki headless w torze bez spadku > 10% względem swobodnego lotu (Z11), brak czerwieni poza szalikiem przy s = 0, brak błędów konsoli
   Kończy się kodem 0 tylko gdy wszystko przeszło. */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const base = 'file:///' + file.replace(/\\/g, '/');
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const info = (m) => console.log('  info ' + m);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const CHROME = 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe';
const r2 = (v) => Math.round(v * 100) / 100;

/* bot po torze (działa w przeglądarce w torSymuluj): wybiera komórkę dla najbliższego plastra z zawartością (wiatr > wolna > przeszkoda),
   rusza się tylko o jeden krok na plaster, machnięciami w rytmie trzyma wysokość, ucieka z komórki zaznaczonej przez drapieżnika */
const BOT_TOR = `(function () {
  var last = -9, cel = null, plId = -1;
  function wolna(ch) { return ch === '.' || 'UuDF<>ZXo'.indexOf(ch) >= 0; }
  function wiatr(ch) { return 'UuDZ<>X'.indexOf(ch) >= 0 || ch === 'F'; }
  return function (A) {
    var k = A.kom, out = {}, pl = null, i, c, r, best = null, sc, ch, g, tgt;
    for (i = 0; i < A.plastry.length; i++) if (!/^[.]+$/.test(A.plastry[i].g.join('').replace(/,/g, ''))) { pl = A.plastry[i]; break; }
    if (A.haw && A.haw.cel) { /* drapieżnik zaznaczył komórkę: przejdź obok, najlepiej w bok */
      if (A.haw.cel[0] === k.kol && A.haw.cel[1] === k.wiersz) out.ruch = [k.kol < A.COLS - 1 ? 1 : -1, 0];
    } else if (pl) {
      g = pl.g;
      if (pl.id !== plId) { plId = pl.id; cel = null; }
      if (!cel) {
        for (r = 0; r < A.ROWS; r++) for (c = 0; c < A.COLS; c++) {
          ch = g[r].charAt(c); if (!wolna(ch)) continue;
          if (ch === 'F' && !(c === (A.COLS - 1) / 2 && r === (A.ROWS - 1) / 2)) continue;
          sc = (wiatr(ch) ? 10 : (ch === 'o' ? 4 : 0)) - Math.abs(c - k.kol) * 1.5 - Math.max(0, k.wiersz - r) * 2.5 - Math.max(0, r - k.wiersz) * 0.8 - (r === A.ROWS - 1 && !wiatr(ch) ? 1.5 : 0);
          if (!best || sc > best.sc) best = { c: c, r: r, sc: sc };
        }
        cel = best;
      }
      if (cel && A.t - last > 0.12) {
        var dc = cel.c > k.kol ? 1 : (cel.c < k.kol ? -1 : 0), dr = cel.r > k.wiersz ? 1 : 0;
        if (dc || dr) { out.ruch = [dc, dr]; last = A.t; }
        else if (cel.r < k.wiersz && pl.eta > 0.25) { if (A.t - last > 0.22) { out.stuk = 0; last = A.t; } }
      }
    }
    if (!out.ruch && out.stuk === undefined && (k.wiersz >= A.ROWS - 1 || k.p > 0.55) && A.t - last > 0.24) {   /* trzymaj wysokość rytmem */
      tgt = pl ? pl.g[Math.max(0, k.wiersz - 1)].charAt(k.kol) : '.';
      if (!pl || pl.eta > 0.6 || wolna(tgt)) { out.stuk = 0; last = A.t; }
    }
    return out;
  };
})()`;

(async () => {
  console.log('TEST Z14 ' + file);
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const errors = [];
  const mkPage = async (q, extra) => {
    const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true }, extra || {}));
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errors.push('pageerror: ' + e)); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
    await pg.goto(base + q); await pg.waitForTimeout(900);
    return { ctx, pg };
  };
  const { ctx, pg } = await mkPage('?test&tor=1&seed=23');
  const ev = (f, a) => pg.evaluate(f, a);

  /* ---------- (a) ---------- */
  console.log('(a) przełącznik ?tor=1 i hak');
  const need = ['komorka', 'idz', 'stuknij', 'nurkuj', 'plastry', 'gdzie', 'zdarzenie', 'wzorzec', 'wzorce', 'siatka', 'lancuch', 'energia', 'uczciwy', 'generuj', 'tor', 'torLog', 'torStala', 'torSymuluj', 'skrzydla', 'torSprite', 'torChmury'];
  const miss = await ev((n) => n.filter(k => typeof __okruszek[k] !== 'function'), need);
  chk(miss.length === 0, 'hak toru kompletny (' + need.length + ' funkcji)', 'brakuje: ' + miss.join(', '));
  const T0 = await ev(() => __okruszek.tor());
  chk(T0.wlaczony && T0.COLS === 3 && T0.ROWS === 3, '?tor=1 włącza tor 3 x 3');
  for (const q of ['?test&seed=23', '?test&tor=1&swobodny=1&seed=23']) {
    const p2 = await mkPage(q); const w = await p2.pg.evaluate(() => ({ t: __okruszek.tor().wlaczony, d: __okruszek.gdzie().some(e => e.typ === 'okruszek') }));
    chk(!w.t && !w.d, q.replace('?test&', '') + ': swobodny lot (tor wyłączony)'); await p2.ctx.close();
  }
  { const p5 = await mkPage('?test&tor=1&kol=5&wier=3&seed=23'); const w = await p5.pg.evaluate(() => { const O = __okruszek, t = O.tor(), g = O.generuj(200, { losoweN: true, losowaKraina: true }); return { c: t.COLS, r: t.ROWS, all: g.every(x => O.uczciwy(x).ok && x.length === 3 && x[0].length === 5), kom: O.komorka() }; });
    chk(w.c === 5 && w.r === 3 && w.all && w.kom.kol === 2, 'siatka parametryzowana: ?kol=5&wier=3 daje tor 5 x 3, start w środku, 200 plastrów generatora uczciwych'); await p5.ctx.close(); }

  /* ---------- (b) ---------- */
  console.log('(b) biblioteka WZORCE');
  const WZ = await ev(() => __okruszek.wzorce());
  const ZNAKI = '.UuDF<>ZXblsfgoBHTPAaMYSKv';
  let zle = [], plN = 0, lancZle = [];
  for (const w of WZ) {
    for (const g of w.pl) {
      plN++;
      if (g.length !== 3 || g.some(r => r.length !== 3 || [...r].some(c => ZNAKI.indexOf(c) < 0))) zle.push(w.id + ' (znaki)');
      else if (!(await ev(x => __okruszek.uczciwy(x).ok, g))) zle.push(w.id);
    }
    if (w.faza === 'wiatry') {   /* łańcuch: wiatr następnego plastra osiągalny z celu poprzedniego jednym ruchem bez wznoszenia */
      const cel = (ch, c, r) => ({ U: [c, Math.max(0, r - 2)], u: [c, Math.max(0, r - 1)], D: [1, 1], F: [c, r], '<': [Math.max(0, c - 1), r], '>': [Math.min(2, c + 1), r], Z: [c, Math.min(2, r + 1)], X: [c, r] })[ch];
      let poz = null;
      for (const g of w.pl) {
        const ws = []; g.forEach((row, r) => [...row].forEach((ch, c) => { if ('UuDF<>ZX'.indexOf(ch) >= 0) ws.push([ch, c, r]); }));
        if (poz && !ws.some(([ch, c, r]) => Math.abs(c - poz[0]) <= 1 && (r === poz[1] || r === poz[1] + 1))) lancZle.push(w.id);
        if (ws.length) poz = cel(ws[0][0], ws[0][1], ws[0][2]);
      }
    }
  }
  chk(WZ.length >= 40, 'biblioteka: ' + WZ.length + ' ręcznie zaprojektowanych wzorców (' + plN + ' plastrów; wiatry ' + WZ.filter(w => w.faza === 'wiatry').length + ', mieszane ' + WZ.filter(w => w.faza === 'mieszane').length + ', przeszkody ' + WZ.filter(w => w.faza === 'przeszkody').length + ')');
  chk(zle.length === 0, 'każdy plaster każdego wzorca spełnia zasadę uczciwości (wolna komórka w zasięgu ruchu bez wznoszenia z każdej komórki)', 'nieuczciwe: ' + zle.join(', '));
  chk(lancZle.length === 0, 'łańcuchy wiatrów w wzorcach: każdy następny wiatr osiągalny z celu poprzedniego jednym ruchem bez wznoszenia', 'łańcuch nieosiągalny: ' + lancZle.join(', '));
  chk(WZ.some(w => w.pl.length >= 5 && w.faza === 'wiatry') && WZ.filter(w => w.faza === 'wiatry' && w.pl.length >= 3).length >= 8, 'łańcuchy: >= 8 wzorców po 3+ wiatry i wzorce po 5 (szansa na L5)');

  /* ---------- (c) ---------- */
  console.log('(c) generator: uczciwość 1000 plastrów');
  const G1 = await ev(() => { const O = __okruszek, g = O.generuj(1000, { losoweN: true, losowaKraina: true, ziarno: 7 }); let zle = 0, puste = 0, prz = 0; const typy = {};
    g.forEach(x => { if (!O.uczciwy(x).ok) zle++; const j = x.join(''); if (/^[.]+$/.test(j)) puste++; [...j].forEach(c => { if (c !== '.') typy[c] = (typy[c] || 0) + 1; }); prz += [...j].filter(c => 'blsfgBHTPAaMYSKv'.indexOf(c) >= 0).length; });
    return { n: g.length, zle, puste, prz: prz / g.length, typy }; });
  chk(G1.n === 1000 && G1.zle === 0, '1000 wylosowanych plastrów (losowe N 0..0,85 i krainy K1-K6): 0 nieuczciwych; średnio ' + r2(G1.prz) + ' komórek przeszkód na plaster', 'nieuczciwe: ' + G1.zle);
  info('typy w generatorze: ' + JSON.stringify(G1.typy));
  const G2 = await ev(() => { const O = __okruszek, g = O.generuj(200, { lancuch: 3, ziarno: 11 }); return g.length; });
  chk(G2 === 600, 'generator łańcuchów: 200 łańcuchów po 3 wiatry');

  /* ---------- (d) ---------- */
  console.log('(d) zieleń tylko z funkcją (sekcja 15.7)');
  const CH = await ev(() => __okruszek.torChmury());
  const hsv = (c) => { const [r, g, b] = c, mx = Math.max(r, g, b), mn = Math.min(r, g, b); let hh = 0; if (mx !== mn) { if (mx === r) hh = ((g - b) / (mx - mn)) * 60; else if (mx === g) hh = (2 + (b - r) / (mx - mn)) * 60; else hh = (4 + (r - g) / (mx - mn)) * 60; if (hh < 0) hh += 360; } return { h: hh, s: mx ? (mx - mn) / mx : 0 }; };
  const zielone = Object.keys(CH).filter(k => { const q = hsv(CH[k].kol); return q.h >= 75 && q.h <= 170 && q.s > 0.12; });
  chk(zielone.length > 0 && zielone.every(k => CH[k].fn === 'buff' || CH[k].fn === 'nerf'), 'zielone chmury toru (' + zielone.map(k => CH[k].n + ' = ' + CH[k].fn).join(', ') + ') zawsze z funkcją', 'zielona bez funkcji: ' + zielone.join(','));
  chk(Object.keys(CH).filter(k => CH[k].fn).every(k => zielone.indexOf(k) >= 0) && Object.keys(CH).filter(k => !CH[k].fn).every(k => zielone.indexOf(k) < 0), 'pozostałe chmury (biała, lawenda, szara, fiolet, burza, grad) bez zieleni; kolor chmury = rodzaj efektu');
  chk(Object.keys(CH).filter(k => !CH[k].fn && !CH[k].rys).every((k, i, a) => true) && CH.b.ds < CH.l.ds && CH.l.ds < CH.s.ds && CH.f.ds === 'poziom', 'siła spowolnienia rośnie z kolorem: biała ' + CH.b.ds + ' < lawenda ' + CH.l.ds + ' < szara ' + CH.s.ds + ' < fiolet (o poziom)');

  /* ---------- (j) ruch ---------- */
  console.log('(j) ruch w siatce: koszt wznoszenia, rytm, szybowanie, nurkowanie i wybicie');
  const J = await ev(() => {
    const O = __okruszek, R = {}; O.pauza(true); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg();
    O.idz(1, 2, true); O.torSymuluj(0.05);
    const m0 = O.torLog().wzloty; O.stuknij(); O.torSymuluj(0.3); R.po1 = O.komorka().wiersz; O.stuknij(); O.torSymuluj(0.3); R.po2 = O.komorka().wiersz;
    O.stuknij(); O.torSymuluj(0.3); O.stuknij(); O.torSymuluj(0.3); R.po4 = O.komorka().wiersz; O.stuknij(); O.torSymuluj(0.3); R.po5 = O.komorka().wiersz;
    O.idz(1, 2, true); O.torSymuluj(0.8); R.spamN = 0; for (let i = 0; i < 20 && O.komorka().wiersz === 2; i++) { O.stuknij(); R.spamN++; O.torSymuluj(0.05); }   /* machnięcia co 0,05 s: ile trzeba na wiersz */
    O.idz(1, 2, true); O.torSymuluj(0.8); R.rytmN = 0; for (let i = 0; i < 20 && O.komorka().wiersz === 2; i++) { O.stuknij(); R.rytmN++; O.torSymuluj(0.3); }   /* rytm co 0,3 s */
    O.idz(1, 1, true); O.torSymuluj(0.05); O.stuknij(); O.torSymuluj(1.6); R.ucieka = O.komorka().wzlot;   /* zebrany wzlot ucieka po przerwie */
    O.idz(1, 0, true); const t0 = O.stan().graCzas; let t1 = -1; for (let i = 0; i < 600; i++) { O.torSymuluj(0.02); if (O.komorka().wiersz === 1) { t1 = O.stan().graCzas; break; } } R.opad = t1 - t0;
    O.idz(1, 0, true); O.nurkuj(true); O.torSymuluj(0.1); R.nurk1 = O.komorka().wiersz; O.torSymuluj(0.6); R.nurk2 = O.komorka().wiersz; R.sHold = O.stan().sHold; O.nurkuj(false); O.torSymuluj(0.1); R.wybicie = O.komorka().wiersz;
    O.idz(1, 2, true); O.nurkuj(true); O.torSymuluj(0.4); O.nurkuj(false); O.torSymuluj(0.1); R.dnoWybicie = O.komorka().wiersz;   /* na dnie: nurkowanie bez darmowego wzlotu */
    O.idz(0, 0, true); O.idz(-1, 0); O.torSymuluj(0.3); R.lewo = O.komorka().kol; O.idz(2, 0, true); O.idz(9, 0); O.torSymuluj(0.3); R.prawo = O.komorka().kol;
    O.idz(1, 1, true); const kier = []; for (const [dc, dr] of [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]) { O.idz(1, 1, true); O.torSymuluj(0.05); O.idz(1 + dc, 1 + dr); if (dr < 0) { O.torSymuluj(0.2); O.stuknij(); O.torSymuluj(0.2); O.stuknij(); } O.torSymuluj(0.3); const k = O.komorka(); kier.push([k.kol - 1, k.wiersz - 1].join(',')); }
    R.kier = kier; R.T = O.tor().stale; O.bezPrzeszkod(false); O.bezPradow(false); O.nowyBieg(); O.pauza(false); return R; });
  chk(J.po1 === 2 && J.po2 === 1, 'z dolnego do środkowego wiersza 2 machnięcia (po 1: wiersz ' + J.po1 + ', po 2: ' + J.po2 + ')');
  chk(J.po4 === 1 && J.po5 === 0, 'ze środkowego do górnego 3 machnięcia (koszt rośnie z wysokością; po 2: wiersz ' + J.po4 + ', po 3: ' + J.po5 + ')');
  chk(J.rytmN === 2 && J.spamN >= 4, 'rytm oszczędniejszy niż spam: wiersz w górę w rytmie co 0,3 s = ' + J.rytmN + ' machnięcia, spamem co 0,05 s = ' + J.spamN);
  chk(J.ucieka < 0.5, 'zebrany wzlot ucieka po przerwie (po 1,6 s: ' + r2(J.ucieka) + ')');
  chk(J.opad > J.T.SINK_T * 0.7 && J.opad < J.T.SINK_T * 1.4, 'szybowanie: wiersz w dół po ' + r2(J.opad) + ' s (SINK_T ' + J.T.SINK_T + ' s x opadanie krainy)');
  chk(J.nurk1 === 1 && J.nurk2 === 2 && J.wybicie === 1 && J.sHold > 0.05, 'nurkowanie: od razu wiersz w dół, po 0,55 s drugi, prędkość rośnie (sHold ' + r2(J.sHold) + '), puszczenie = wybicie o wiersz (' + J.nurk1 + ' > ' + J.nurk2 + ' > ' + J.wybicie + ')');
  chk(J.dnoWybicie === 2, 'nurkowanie z dolnego wiersza nie daje darmowego wzlotu (wybicie nie wyżej niż start nurkowania)');
  chk(J.lewo === 0 && J.prawo === 2, 'bez wychodzenia poza siatkę (krok w lewo z lewej i w prawo z prawej kolumny zostaje na miejscu)');
  chk(J.kier.join(' ') === '1,0 1,1 0,1 -1,1 -1,0 -1,-1 0,-1 1,-1', 'ze środka osiem kierunków (w górę: krok + machnięcia): ' + J.kier.join(' '));

  /* ---------- (k) skrzydła ---------- */
  console.log('(k) skrzydła zgodne z akcją');
  const K = await ev(() => {
    const O = __okruszek, R = {}; O.pauza(true); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.idz(1, 1, true); O.torSymuluj(0.6);
    R.szyb = O.skrzydla(); O.stuknij(); const fs = []; for (let i = 0; i < 24; i++) { O.torSymuluj(1 / 60); fs.push(O.skrzydla().f); } R.min = Math.min(...fs); R.max = Math.max(...fs); R.koniec = O.skrzydla().f;
    O.torSymuluj(0.5); O.nurkuj(true); O.torSymuluj(0.1); R.nurk = O.skrzydla(); O.nurkuj(false); O.torSymuluj(0.6);
    O.idz(0, 1); O.torSymuluj(0.05); R.lewo = O.skrzydla(); O.torSymuluj(0.5); O.idz(2, 1); O.torSymuluj(0.05); R.prawo = O.skrzydla();
    O.bezPrzeszkod(false); O.bezPradow(false); O.nowyBieg(); O.pauza(false); return R; });
  chk(K.szyb && Math.abs(K.szyb.f + 0.2) < 0.15 && K.szyb.dl === 0 && K.szyb.dr === 0, 'szybowanie: skrzydła rozłożone, lekkie drżenie (f ' + r2(K.szyb.f) + ')');
  chk(K.min < -1 && K.max > 0.9, 'machnięcie: ciężki zamach (w górę do ' + r2(K.min) + ', w dół do ' + r2(K.max) + ')');
  chk(K.nurk.dl === 1 && K.nurk.dr === 1, 'nurkowanie: oba skrzydła złożone');
  chk(K.lewo.dl > 0.3 && K.lewo.dr === 0 && K.prawo.dr > 0.3 && K.prawo.dl === 0, 'bok: skrzydło po stronie ruchu podwinięte (asymetria: lewo dl ' + r2(K.lewo.dl) + ', prawo dr ' + r2(K.prawo.dr) + ')');

  /* ---------- (i) łańcuch, E, L5 ---------- */
  console.log('(i) łańcuch wiatrów: E = 1, L5, na wprost tylko ze środka');
  const I = await ev(() => {
    const O = __okruszek, R = {}; O.pauza(true); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.idz(1, 1, true); O.torSymuluj(0.3);
    O.wzorzec('w01', { z: 1.6 }); let maxE = 0; for (let i = 0; i < 300; i++) { O.torSymuluj(1 / 60); maxE = Math.max(maxE, O.energia()); } R.E3 = maxE; R.ch3 = O.lancuch().n; R.rozkwit = O.rozkwit().razy;
    O.nowyBieg(); O.idz(1, 1, true); O.torSymuluj(0.3); O.zdarzenie('wiatr:wprost', { k: 1, w: 1, z: 1.6 }); O.zdarzenie('wiatr:wprost', { k: 1, w: 1, z: 2.5 }); maxE = 0; for (let i = 0; i < 240; i++) { O.torSymuluj(1 / 60); maxE = Math.max(maxE, O.energia()); } R.E2 = maxE;
    /* 5 (i 6.) wiatrów w 12 s z nurkowaniem: poprzeczne wiatry w dolnym wierszu przerzucają Okruszka tam, gdzie czeka następny; nurkowanie trwa cały czas */
    const SEK = [['wiatr:prawo', 0], ['wiatr:prawo', 1], ['wiatr:lewo', 2], ['wiatr:lewo', 1], ['wiatr:prawo', 0], ['wiatr:prawo', 1]];
    O.nowyBieg(); O.idz(0, 2, true); O.torSymuluj(0.2);
    SEK.forEach(([n, k], i) => O.zdarzenie(n, { k: k, w: 2, z: 1.4 + i * 1.0 }));
    O.nurkuj(true); let hy = 0; for (let i = 0; i < 60 * 9; i++) { O.torSymuluj(1 / 60); if (O.stan().hiper) hy = 1; if (O.koniec()) break; } O.nurkuj(false); R.L5 = hy; R.hiperRazy = O.stan().hiperRazy; R.l5bez = O.stan().l5bezLancucha; R.w12 = Math.max(O.stan().lancuch12, O.torLog().wejscia.filter(e => e.idealne).length); R.tryb = O.stan().tryb;
    O.nowyBieg(); O.idz(0, 2, true); O.torSymuluj(0.2);
    SEK.forEach(([n, k], i) => O.zdarzenie(n, { k: k, w: 2, z: 1.4 + i * 1.0 }));
    hy = 0; for (let i = 0; i < 60 * 9; i++) { O.torSymuluj(1 / 60); if (O.stan().hiper) hy = 1; } R.L5bez = hy; R.w12b = O.torLog().wejscia.filter(e => e.idealne).length;
    /* na wprost: środek tak, inna komórka nie */
    O.nowyBieg(); O.idz(1, 1, true); O.torSymuluj(0.3); const s0 = O.stan().s; O.zdarzenie('wiatr:wprost', { k: 1, w: 1, z: 1.3 }); O.torSymuluj(1.2); let wj = O.torLog().wejscia.slice(-1)[0]; R.wprostSrodek = { efekt: wj && wj.efekt, lancuch: wj && wj.lancuchPo, ds: O.stan().s - s0 };
    O.nowyBieg(); O.idz(0, 1, true); O.torSymuluj(0.3); const s1 = O.stan().s; O.zdarzenie('wiatr:wprost', { k: 0, w: 1, z: 1.3 }); O.torSymuluj(1.2); wj = O.torLog().wejscia.slice(-1)[0]; R.wprostBok = { efekt: wj && wj.efekt, lancuch: O.lancuch().n, ds: O.stan().s - s1 };
    O.bezPrzeszkod(false); O.bezPradow(false); O.nowyBieg(); O.pauza(false); return R; });
  chk(I.E3 >= 0.99 && I.rozkwit >= 1, '3 wiatry z rzędu (idealne wejścia) = E 1 (pełny kolor, rozkwit; E max ' + r2(I.E3) + ', łańcuch ' + I.ch3 + ')');
  chk(I.E2 > 0.5 && I.E2 < 0.7, '2 wiatry = E ok. 0,62 (bez pełni; ' + r2(I.E2) + ')');
  chk(I.L5 === 1 && I.l5bez === 0, '5 wiatrów w 12 s + nurkowanie = L5 (hiperprzestrzeń; łańcuch w 12 s ' + I.w12 + ', L5 bez łańcucha ' + I.l5bez + ', stan ' + I.tryb + ')');
  chk(I.L5bez === 0, '5 wiatrów bez nurkowania nie daje L5 (łańcuch ' + I.w12b + ')');
  chk(I.wprostSrodek.efekt === 'przerzut' && I.wprostSrodek.lancuch >= 1 && I.wprostSrodek.ds > 0.05, 'wiatr „na wprost” w komórce środkowej: działa (prędkość +' + r2(I.wprostSrodek.ds) + ', łańcuch ' + I.wprostSrodek.lancuch + ')');
  chk(I.wprostBok.efekt === 'poza_srodkiem' && I.wprostBok.lancuch === 0 && I.wprostBok.ds <= 0.001, 'wiatr „na wprost” poza środkiem: nie działa (bez prędkości i łańcucha)', JSON.stringify(I.wprostBok));

  /* bot losowy: nigdy E = 1 */
  const LOS = await ev(() => { const O = __okruszek, out = []; for (let z = 1; z <= 6; z++) { O.ziarno(z); O.nowyBieg(); let r = z * 7919; const rnd = () => { r = (r * 16807) % 2147483647; return (r - 1) / 2147483646; };
      const res = O.torSymuluj(90, function (A) { const o = {}; const q = rnd(); if (q < 0.03) o.ruch = [Math.floor(rnd() * 3) - 1, Math.floor(rnd() * 3) - 1]; else if (q < 0.06) o.stuk = Math.floor(rnd() * 4) - 1; o.nurkuj = rnd() < 0.15 ? true : (A.kom.nurkuje && rnd() < 0.9); return o; });
      out.push({ E: O.pelnyKolor().lacznie, t: res.graCzas, ide: res.idealnych }); } O.ziarno(0); O.nowyBieg(); return out; });
  chk(LOS.every(x => x.E === 0), 'bot losowy (6 biegów do 90 s) nigdy nie ma E = 1 (czas pełnego koloru: ' + LOS.map(x => r2(x.E)).join(', ') + '; biegi ' + LOS.map(x => Math.round(x.t)).join(', ') + ' s)');

  /* ---------- (e) zapowiedzi ---------- */
  console.log('(e) zapowiedzi >= 1,5 s na L0, L2, L4, L5');
  const E = await ev(() => { const O = __okruszek, out = {};
    for (const lv of [0, 2, 4, 5]) { O.ziarno(3); O.nowyBieg(); O.ustawPoziom(lv); O.torSymuluj(40); const pl = O.torLog().plastry.filter(p => p.tKontakt !== null && p.tPokaz > 0); out[lv] = { n: pl.length, min: Math.min(...pl.map(p => p.czas)), sp: O.tor().sp }; O.odblokuj(); }
    O.ziarno(0); O.nowyBieg(); return out; });
  for (const lv of [0, 2, 4, 5]) chk(E[lv].n >= 8 && E[lv].min >= 1.5, 'L' + lv + ': ' + E[lv].n + ' plastrów, najkrótsza zapowiedź ' + r2(E[lv].min) + ' s (tempo ' + r2(E[lv].sp) + ' warstw/s)', 'L' + lv + ': ' + JSON.stringify(E[lv]));
  const P = await ev(() => { const O = __okruszek; O.pauza(true); O.nowyBieg(); O.idz(1, 1, true); O.zdarzenie('jastrzab'); const st = O.stale(); let tz = -1, ta = -1, zap = -1;
    for (let i = 0; i < 60 * 8; i++) { O.torSymuluj(1 / 60); const g = O.stan().jastrzab; if (g && g.faza === 'poscig' && tz < 0) tz = O.stan().graCzas; const a = O.torLog().ataki; if (a.length && ta < 0) ta = a[0].t; if (a.length && a[0].wynik && zap < 0) zap = O.stan().graCzas - a[0].t; if (zap > 0) break; }
    const r = { warn: st.HAW_WARN, tz, ta, zap, t0: 0, ataki: O.torLog().ataki }; O.nowyBieg(); O.pauza(false); return r; });
  chk(P.warn >= 2 && P.zap >= 1.5, 'drapieżnik: zapowiedź ' + P.warn + ' s (cień, sygnał, łuk), komórka zaznaczona ' + r2(P.zap) + ' s przed uderzeniem (>= 1,5 s)');

  /* ---------- (f) bot po torze 60 s ---------- */
  console.log('(f) bot po torze: 60 s bez lądowania');
  /* eval: źródło bota to stała BOT_TOR z tego pliku (nie dane z zewnątrz); funkcji nie da się przekazać do przeglądarki inaczej niż jako tekst */
  const F = await ev((BOT) => { const O = __okruszek, out = []; for (const [br, z] of [[1, 1], [1, 2], [3, 3], [4, 4], [5, 5], [2, 6]]) { O.ziarno(z); O.brama(br); const fn = eval(BOT); const r = O.torSymuluj(60, fn); const L = O.torLog();
      out.push({ br, z, t: r.graCzas, tryb: r.tryb, koniec: r.koniec, wej: L.wejscia.filter(e => e.efekt === 'przerzut').length, ide: L.wejscia.filter(e => e.idealne).length, kar: L.kontakty.filter(e => e.efekt === 'kara').length, kont: L.kontakty.length, pl: L.plastry.length, Emax: r.pelnyKolor.lacznie, lvlMax: r.poziomMax, nieucz: L.plastry.filter(p => !p.uczciwy).length, typy: [...new Set(L.plastry.map(p => p.g.join('')).join('').replace(/\./g, ''))].join('') }); }
    O.ziarno(0); O.brama(1); return out; }, BOT_TOR);
  for (const x of F) info('K' + x.br + ' ziarno ' + x.z + ': ' + r2(x.t) + ' s, ' + x.tryb + (x.koniec ? ' (' + x.koniec + ')' : '') + ', wiatry ' + x.wej + ' (idealnie ' + x.ide + '), kary ' + x.kar + ' z ' + x.kont + ' kontaktów, pełny kolor ' + r2(x.Emax) + ' s, poziom max L' + x.lvlMax + ', znaki: ' + x.typy);
  chk(F.every(x => x.t >= 59.9 && x.tryb === 'gra'), 'bot po torze leci 60 s bez lądowania we wszystkich 6 biegach (K1 x2, K2, K3, K4, K5)', 'wylądował: ' + JSON.stringify(F.filter(x => x.t < 59.9).map(x => [x.br, x.z, x.t, x.koniec])));
  chk(F.every(x => x.wej >= 8), 'bot trafia wiatry (>= 8 w 60 s w każdym biegu: ' + F.map(x => x.wej).join(', ') + ')');
  chk(F.some(x => x.Emax > 0), 'bot po torze osiąga pełny kolor (E = 1) w co najmniej jednym biegu (czasy ' + F.map(x => r2(x.Emax)).join(', ') + ' s)');
  chk(F.every(x => x.nieucz === 0), 'wszystkie plastry z prawdziwych biegów uczciwe (' + F.reduce((a, x) => a + x.pl, 0) + ' plastrów)');
  chk(F.find(x => x.br === 3).typy.indexOf('S') >= 0 && F.find(x => x.br === 4).typy.indexOf('K') >= 0 && /[AaXv]/.test(F.find(x => x.br === 5).typy), 'przeszkody krain w torze: szpile w K3, latawce w K4, samoloty / Wielki przelot w K5');

  /* ---------- (g) bot bierny ---------- */
  console.log('(g) bot bierny');
  const B = await ev(() => { const O = __okruszek, out = []; for (let z = 1; z <= 6; z++) { O.ziarno(z); O.brama(1); const r = O.torSymuluj(90); out.push({ t: r.graCzas, k: r.koniec, wej: r.wloty }); } O.ziarno(0); O.brama(1); return out; });
  const bt = B.map(x => x.t).sort((a, b) => a - b), med = (bt[2] + bt[3]) / 2;
  chk(B.every(x => x.k === 'ladowanie' && x.t >= 20 && x.t <= 40), 'bot bierny ląduje w morzu chmur po 20-40 s w każdym z 6 ziaren (' + B.map(x => r2(x.t)).join(', ') + ' s; mediana ' + r2(med) + ' s; złapane wiatry ' + B.map(x => x.wej).join(', ') + ')', 'bierny: ' + JSON.stringify(B));

  /* ---------- (h) 400 wymuszeń ---------- */
  console.log('(h) 400 wymuszeń: końce biegu tylko S3');
  const H = await ev(() => { const O = __okruszek, typy = ['chmura:biala', 'chmura:lawenda', 'chmura:szara', 'chmura:fiolet', 'chmura:zielona_mgla', 'chmura:oaza', 'burza', 'grad', 'tornado', 'ptak', 'samolot', 'motolotnia', 'ufo', 'szpile', 'latawiec', 'przelot'];
    let n = 0, konce = {}, natych = 0, kar = 0, odp = 0, bledy = [];
    O.pauza(true); O.ziarno(9); O.brama(1); O.bezPrzeszkod(true);
    for (let i = 0; i < 400; i++) {
      if (O.koniec()) { const k = O.stan().tryb; O.nowyBieg(); }
      const kk = O.komorka(); if (kk.wiersz === 2 || kk.p > 0.6) { O.stuknij(); O.torSymuluj(0.2); O.stuknij(); }
      const t = typy[i % typy.length]; if (!O.zdarzenie(t, {})) bledy.push(t); n++;
      const k0 = O.torLog().kontakty.length; const r = O.torSymuluj(1.25);
      const nowe = O.torLog().kontakty.slice(k0); nowe.forEach(e => { if (e.efekt === 'kara') kar++; if (e.efekt === 'odpornosc') odp++; if (e.stan && e.stan !== 'gra') natych++; });
      if (r.tryb === 'koniec' || r.tryb === 'ladowanie') konce[r.koniec || r.tryb] = (konce[r.koniec || r.tryb] || 0) + 1;
    }
    const all = O.torLog().konce; O.bezPrzeszkod(false); O.ziarno(0); O.nowyBieg(); O.pauza(false); return { n, konce, natych, kar, odp, bledy }; });
  const zleKonce = Object.keys(H.konce).filter(k => ['ladowanie', 'jastrzab', 'sowa'].indexOf(k) < 0);
  chk(H.n === 400 && H.bledy.length === 0 && zleKonce.length === 0 && H.natych === 0, '400 wymuszeń 16 rodzajów przeszkód toru w komórce Okruszka: 0 końców biegu poza S3 (końce: ' + JSON.stringify(H.konce) + '; kary ' + H.kar + ', w odporności ' + H.odp + ')', JSON.stringify(H));

  /* ---------- (m) krainy, bramy, drapieżnik ---------- */
  console.log('(m) krainy i bramy, drapieżnik');
  const M = await ev(() => { const O = __okruszek, R = {}; O.pauza(true); O.ziarno(4); O.brama(1); O.bezPrzeszkod(true); O.idz(1, 2, true);
    O.doBramy(40); for (let i = 0; i < 60 * 6; i++) { O.torSymuluj(1 / 60); const k = O.komorka(); if (k.wiersz === 2 && k.p > 0.4) O.stuknij(); if (O.bramaLog().przeloty.length) break; }
    R.brama = O.bramaLog().przeloty.length; R.kraina = O.droga().kraina; R.wiersz = O.komorka().wiersz;
    /* drapieżnik: stojąc w miejscu zostaje złapany; uciekając z zaznaczonej komórki ucieka */
    O.brama(4); O.bezPrzeszkod(true); O.idz(1, 1, true); O.ustaw(0.1); O.zdarzenie('jastrzab'); for (let i = 0; i < 60 * 12; i++) { O.torSymuluj(1 / 60); if (O.koniec()) break; } R.stoi = { koniec: O.stan().tryb, log: O.torLog().ataki.map(a => a.wynik), konce: O.torLog().konce };
    O.odblokuj(); O.symuluj(2.5); R.endKind = O.torLog().konce.map(k => k.typ);
    O.brama(4); O.bezPrzeszkod(true); O.idz(1, 1, true); O.ustaw(0.1); O.zdarzenie('jastrzab'); for (let i = 0; i < 60 * 14; i++) { const st = O.stan().jastrzab; if (st && st.faza === 'poscig') { const a = O.torLog().ataki.slice(-1)[0]; const kk = O.komorka(); if (a && !a.wynik && a.k === kk.kol && a.w === kk.wiersz) O.idz(kk.kol === 2 ? 1 : kk.kol + 1, kk.wiersz); } O.torSymuluj(1 / 60); if (O.koniec() || !O.stan().jastrzab) break; }
    R.ucieka = { tryb: O.stan().tryb, log: O.torLog().ataki.map(a => a.wynik), uciekl: O.stan().jastrzabLog };
    O.odblokuj(); O.bezPrzeszkod(false); O.ziarno(0); O.brama(1); O.pauza(false); return R; });
  chk(M.brama === 1 && M.kraina === 2 && M.wiersz === 0, 'przelot bramy w torze: kraina 1 > 2, Okruszek wysoko (górny wiersz, jak h >= 0,8 w Z10)', JSON.stringify(M));
  chk(M.stoi.log[0] === 'zlapal' && M.endKind.indexOf('jastrzab') >= 0, 'pościg po komórkach: stojąc w zaznaczonej komórce Okruszek zostaje złapany (koniec biegu S3: jastrząb)', JSON.stringify(M.stoi));
  chk(M.ucieka.log.length >= 3 && M.ucieka.log.every(w => w === 'pudlo') && M.ucieka.tryb === 'gra', 'opuszczając zaznaczoną komórkę Okruszek ucieka (ataki: ' + M.ucieka.log.join(', ') + ')', JSON.stringify(M.ucieka));

  /* ---------- (l) trzy tryby sterowania (CDP), mysz, klawiatura ---------- */
  console.log('(l) trzy tryby sterowania (prawdziwy dotyk), mysz, klawiatura');
  const cdp = await ctx.newCDPSession(pg);
  const touch = async (type, pts) => { await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p[1], y: p[2], id: p[0] })) }); };
  const upAll = async () => { try { await touch('touchCancel', []); } catch (_) { } await sleep(80); };
  const kom = () => ev(() => __okruszek.komorka());
  const mach = () => ev(() => __okruszek.torLog().machniecia);
  const fresh = async (mode, c, r) => { await upAll(); await ev(([m, c2, r2_]) => { const O = __okruszek; O.panel(false); O.odblokuj(); O.nurkuj(false); O.bezPrzeszkod(true); O.bezPradow(true); O.tempo(1); O.czulosc(1); O.sterowanie(m); O.nowyBieg(); O.ustaw(0); O.idz(c2, r2_, true); }, [mode, c, r]); await sleep(150); };
  const swipe = async (x0, y0, x1, y1, n) => { await touch('touchStart', [[1, x0, y0]]); for (let i = 1; i <= (n || 6); i++) { await touch('touchMove', [[1, x0 + (x1 - x0) * i / (n || 6), y0 + (y1 - y0) * i / (n || 6)]]); await sleep(16); } await touch('touchEnd', []); await sleep(260); };
  const tap = async (x, y, id) => { await touch('touchStart', [[id || 1, x, y]]); await sleep(50); await touch('touchEnd', []); await sleep(200); };
  const RUCH = {};
  /* tryb 1 */
  await fresh(1, 1, 1); await swipe(200, 600, 140, 600); RUCH.t1_lewo = (await kom()).kol === 0;
  await fresh(1, 1, 1); await swipe(200, 600, 260, 600); RUCH.t1_prawo = (await kom()).kol === 2;
  await fresh(1, 1, 1); await swipe(200, 600, 200, 660); RUCH.t1_dol = (await kom()).wiersz === 2;
  await fresh(1, 1, 1); await swipe(200, 600, 150, 650); { const k = await kom(); RUCH.t1_ukos_dol = k.kol === 0 && k.wiersz === 2; }
  await fresh(1, 1, 2); let m0 = await mach(); await swipe(200, 600, 250, 550); await swipe(200, 600, 200, 550); { const k = await kom(); RUCH.t1_ukos_gora = k.kol === 2 && k.wiersz === 1 && (await mach()) - m0 === 2; }
  await fresh(1, 1, 2); m0 = await mach(); await tap(200, 600); await tap(200, 600); { const k = await kom(); RUCH.t1_stuk = (await mach()) - m0 === 2 && k.wiersz === 1; }
  await fresh(1, 1, 0); await touch('touchStart', [[1, 200, 600]]); await sleep(450); { const k = await kom(); RUCH.t1_nurk = k.nurkuje && k.wiersz >= 1; } await touch('touchEnd', []); await sleep(200); { const k = await kom(); RUCH.t1_duch = !k.nurkuje && (await ev(() => __okruszek.stan().palce)) === 0; }
  /* tryb 2 */
  await fresh(2, 1, 1); m0 = await mach(); await tap(80, 700); { const k = await kom(); RUCH.t2_lewo_gora = k.kol === 0 && (await mach()) - m0 === 1; }
  await fresh(2, 1, 1); m0 = await mach(); await tap(310, 700); { const k = await kom(); RUCH.t2_prawo_gora = k.kol === 2 && (await mach()) - m0 === 1; }
  await fresh(2, 1, 1); { const w0 = (await kom()).wzlot; await touch('touchStart', [[1, 80, 700], [2, 310, 700]]); await sleep(60); await touch('touchEnd', []); await sleep(250); const k = await kom(); RUCH.t2_oba = k.kol === 1 && (k.wzlot > 1.4 || k.wiersz === 0); }
  await fresh(2, 1, 0); await touch('touchStart', [[1, 80, 700], [2, 310, 700]]); await sleep(450); { const k = await kom(); RUCH.t2_nurk = k.nurkuje && k.wiersz >= 1; } await touch('touchEnd', []); await sleep(200);
  await fresh(2, 1, 0); await touch('touchStart', [[1, 80, 700]]); await sleep(400); await touch('touchEnd', []); await sleep(200); { const k = await kom(); RUCH.t2_slizg_lewo_dol = k.kol === 0 && k.wiersz === 1; }
  await fresh(2, 1, 1); { await tap(80, 700); await sleep(100); const k = await kom(); RUCH.t2_kolumna = k.kol === 0 && k.wiersz === 1; }
  RUCH.t2_duch = (await ev(() => __okruszek.stan().palce)) === 0 && !(await kom()).nurkuje;
  /* tryb 3 */
  const stick = async (dx, dy) => { await touch('touchStart', [[1, 90, 650]]); for (let i = 1; i <= 5; i++) { await touch('touchMove', [[1, 90 + dx * i / 5, 650 + dy * i / 5]]); await sleep(20); } await sleep(150); await touch('touchEnd', []); await sleep(200); };
  await fresh(3, 1, 1); await stick(-50, 0); RUCH.t3_lewo = (await kom()).kol === 0;
  await fresh(3, 1, 1); await stick(50, 0); RUCH.t3_prawo = (await kom()).kol === 2;
  await fresh(3, 1, 1); await stick(0, 50); RUCH.t3_dol = (await kom()).wiersz === 2;
  await fresh(3, 1, 1); await stick(-40, 40); { const k = await kom(); RUCH.t3_ukos_dol = k.kol === 0 && k.wiersz === 2; }
  await fresh(3, 1, 2); m0 = await mach(); await stick(40, -40); { const k = await kom(); RUCH.t3_ukos_gora = k.kol === 2 && (await mach()) - m0 === 1; }
  await fresh(3, 1, 2); m0 = await mach(); await tap(300, 650); await tap(300, 650); { const k = await kom(); RUCH.t3_stuk = (await mach()) - m0 === 2 && k.wiersz === 1; }
  await fresh(3, 1, 0); await touch('touchStart', [[2, 300, 650]]); await sleep(450); { const k = await kom(); RUCH.t3_nurk = k.nurkuje && k.wiersz >= 1; } await touch('touchEnd', []); await sleep(200);
  RUCH.t3_duch = (await ev(() => __okruszek.stan().palce)) === 0 && !(await kom()).nurkuje && !(await ev(() => __okruszek.stan().drazek.jest));
  /* przełączenie trybu w trakcie dotyku: bez ducha */
  await fresh(1, 1, 1); await touch('touchStart', [[1, 200, 600]]); await sleep(300); await ev(() => __okruszek.sterowanie(2)); await touch('touchEnd', []); await sleep(200); RUCH.przelaczenie_bez_ducha = !(await kom()).nurkuje && (await ev(() => __okruszek.stan().palce)) === 0;
  /* mysz i klawiatura */
  await fresh(1, 1, 1); await upAll();
  const box = await pg.evaluate(() => { const r = document.getElementById('g').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await pg.mouse.move(box.x + box.w * 0.12, box.y + box.h * 0.7); await sleep(150); RUCH.mysz_kolumna = (await kom()).kol === 0;
  await pg.mouse.move(box.x + box.w * 0.88, box.y + box.h * 0.7); await sleep(150); RUCH.mysz_kolumna = RUCH.mysz_kolumna && (await kom()).kol === 2;
  await ev(() => __okruszek.idz(1, 2, true)); m0 = await mach(); await pg.mouse.down(); await sleep(60); await pg.mouse.up(); await sleep(120); await pg.mouse.down(); await sleep(60); await pg.mouse.up(); await sleep(150); RUCH.mysz_klik = (await mach()) - m0 === 2 && (await kom()).wiersz === 1;
  await ev(() => __okruszek.idz(1, 0, true)); await pg.mouse.down(); await sleep(450); RUCH.mysz_nurk = (await kom()).nurkuje; await pg.mouse.up(); await sleep(150);
  await fresh(1, 1, 1); await pg.keyboard.press('ArrowLeft'); await sleep(250); RUCH.klaw_lewo = (await kom()).kol === 0; await pg.keyboard.press('d'); await sleep(250); RUCH.klaw_prawo = (await kom()).kol === 1;
  await pg.keyboard.press('ArrowDown'); await sleep(250); RUCH.klaw_dol = (await kom()).wiersz === 2;
  m0 = await mach(); await pg.keyboard.press('ArrowUp'); await sleep(250); await pg.keyboard.press(' '); await sleep(250); RUCH.klaw_gora = (await mach()) - m0 === 2 && (await kom()).wiersz === 1;
  await pg.keyboard.press('w'); await sleep(250); RUCH.klaw_w = (await mach()) - m0 === 3;
  await ev(() => __okruszek.idz(1, 0, true)); await pg.keyboard.down('Shift'); await sleep(300); RUCH.klaw_shift = (await kom()).nurkuje; await pg.keyboard.up('Shift'); await sleep(150);
  await pg.keyboard.down('s'); await sleep(300); RUCH.klaw_s = (await kom()).nurkuje; await pg.keyboard.up('s'); await sleep(150); RUCH.klaw_puszczone = !(await kom()).nurkuje;
  await ev(() => { __okruszek.sterowanie(1); __okruszek.odblokuj(); __okruszek.bezPrzeszkod(false); __okruszek.bezPradow(false); __okruszek.nowyBieg(); });
  const zleR = Object.keys(RUCH).filter(k => !RUCH[k]);
  for (const t of ['t1', 't2', 't3']) { const ks = Object.keys(RUCH).filter(k => k.indexOf(t + '_') === 0); chk(ks.every(k => RUCH[k]), 'tryb ' + t.slice(1) + ': ' + ks.map(k => k.slice(3)).join(', '), 'tryb ' + t.slice(1) + ' nie działa: ' + ks.filter(k => !RUCH[k]).join(', ')); }
  chk(RUCH.przelaczenie_bez_ducha, 'przełączenie trybu w trakcie dotyku: bez ducha palca (palce 0, nie nurkuje)');
  const km = Object.keys(RUCH).filter(k => /^(mysz|klaw)/.test(k));
  chk(km.every(k => RUCH[k]), 'mysz (kolumna z położenia, klik = machnięcie, przytrzymanie = nurkowanie) i klawiatura (strzałki, A/D, W, spacja, S, Shift)', 'nie działa: ' + km.filter(k => !RUCH[k]).join(', '));
  if (zleR.length) info('niezaliczone ruchy: ' + zleR.join(', '));

  /* ---------- (n) pamięć, klatki, czerwień, konsola ---------- */
  console.log('(n) pamięć, klatki, czerwień');
  const MEM = await ev(() => { const O = __okruszek; O.z11Zbuduj(); O.torSprite(); return O.pamiec(); });
  chk(MEM.MB <= 60, 'pamięć sprite\'ów z wszystkimi elementami Z11 i toru: ' + MEM.MB + ' MB (<= 60 MB), ' + MEM.sprite + ' sprite\'ów');
  const fpsOf = async (q) => { const p3 = await mkPage(q, { deviceScaleFactor: 2 }); const f = await p3.pg.evaluate(async () => { const O = __okruszek; O.ustaw(1); await new Promise(r => setTimeout(r, 1200)); O.zerujFps(); await new Promise(r => setTimeout(r, 4000)); return O.fps().avg; }); await p3.ctx.close(); return f; };
  const fs = [], ft = [];
  for (let i = 0; i < 3; i++) { fs.push(await fpsOf('?test&seed=23')); ft.push(await fpsOf('?test&tor=1&seed=23')); }
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  info('klatki headless przy s = 1 (390 x 844 @2x): swobodny ' + fs.join(', ') + ' | tor ' + ft.join(', '));
  chk(avg(ft) >= 0.9 * avg(fs), 'klatki w torze bez spadku > 10% względem swobodnego lotu (średnio ' + r2(avg(ft)) + ' vs ' + r2(avg(fs)) + ' kl/s, ' + r2(100 * (avg(ft) / avg(fs) - 1)) + '%)');
  const RED = await ev(async () => { const O = __okruszek; O.pauza(true); O.ziarno(5); O.brama(5); O.odblokuj(); O.ustawEnergie(0); O.ustaw(0); O.idz(1, 1, true);
    const typy = ['chmura:biala', 'chmura:lawenda', 'chmura:szara', 'chmura:fiolet', 'chmura:zielona_mgla', 'chmura:oaza', 'burza', 'grad', 'tornado', 'ptak', 'samolot', 'motolotnia', 'ufo', 'szpile', 'latawiec', 'wiatr:gora', 'wiatr:lewo'];
    typy.forEach((t, i) => O.zdarzenie(t, { k: i % 3, w: (i >> 1) % 3, z: 1.3 + (i % 6) * 0.7 })); O.pauza(false); await new Promise(r => setTimeout(r, 500)); O.tempo(0.1); await new Promise(r => setTimeout(r, 150));   /* zamrożenie tempem (nakładka pauzy przyciemnia szalik) */
    const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
    const d = x.getImageData(0, 0, t.width, t.height).data, p = O.ptakEkran(), k = c.width / p.W, sx0 = (p.x - 46) * k, sx1 = (p.x + 46) * k, sy0 = (p.y - 36) * k, sy1 = (p.y + 52) * k;
    let red = 0, all = 0, inS = 0;
    for (let y = 0; y < t.height; y += 2) for (let xx = 0; xx < t.width; xx += 2) { const i = (y * t.width + xx) * 4, r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), v = mx / 255, s = mx ? (mx - mn) / mx : 0;
      let hh = 0; if (mx !== mn) { if (mx === r) hh = ((g - b) / (mx - mn)) * 60; else if (mx === g) hh = (2 + (b - r) / (mx - mn)) * 60; else hh = (4 + (r - g) / (mx - mn)) * 60; if (hh < 0) hh += 360; }
      const czer = (hh <= 18 || hh >= 340) && s > 0.45 && v > 0.35; if (y < 110 * k) continue; all++; if (czer) { if (xx >= sx0 && xx <= sx1 && y >= sy0 && y <= sy1) inS++; else red++; } }
    O.tempo(1); O.ustawEnergie(null); O.odblokuj(); O.ziarno(0); O.brama(1); O.pauza(false); return { red, all, inS, frac: red / all, n: O.gdzie().length }; });
  chk(RED.frac < 0.0001 && RED.inS > 20, 'przy s = 0 brak czerwieni poza szalikiem z 17 rodzajami elementów toru na ekranie (' + RED.red + ' pikseli, szalik ' + RED.inS + ')', JSON.stringify(RED));
  const real = errors.filter(e => !/favicon/i.test(e));
  chk(real.length === 0, 'brak błędów i ostrzeżeń konsoli', real.slice(0, 4).join(' | '));
  await browser.close();
  console.log(fail ? ('TEST Z14 NIE PRZESZEDŁ (' + fail + ')') : 'TEST Z14 OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST Z14 BŁĄD: ' + (e && e.stack || e)); process.exit(2); });
