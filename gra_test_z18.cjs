/* Okruszek Z18: testy poprawek z QA runda 1 (tor ?tor=1). Użycie: node gra_test_z18.cjs [plik.html]
   Boty z qa/boty_z18.cjs (własny generator liczb z ziarnem, bez Math.random), stałe ziarna gry: wynik deterministyczny.
   (a) cele strojenia (sekcja 14, 12.1, 15.3, 17 nr 1, QA P0-1..P0-3, P1-1):
       bot idealny: pełny kolor (E = 1) w <= 60 s i Turbo (L4) w >= 90% biegów; bez nurkowania nigdy L5; bot „nurek” (idealny + nurkowanie po łańcuchu >= 4): L5 > 0, nigdy L5 bez łańcucha;
       bot 50% prądów: pełny kolor w <= 60 s w <= 15% biegów i najwyżej 2 s łącznie; bot losowy i bierny nigdy E = 1 i kończą w kilkadziesiąt sekund;
       idealne wejście wymaga precyzji: bot 70% ma 40-60% idealnych wejść; bot 70% kończy bieg typowo w 3-8 min (mediana 180-480 s), bot idealny żyje dłużej;
       samo machanie (stukacz) nigdy w nadchmurzu i przeżywa 300 s w <= 30% biegów
   (b) nadchmurze: machaniem nie, winda bez łańcucha kończy w chmurach, Schody światła (drugi z rzędu) tak; opadanie co ok. NADCH_SINK_T s, machnięcie go nie zatrzymuje
   (c) precyzja: wejście opadłym ptaszkiem (poniżej wstęgi) nie jest idealne, środkiem wstęgi jest
   (d) drapieżnik: śledzi komórkę do namierzenia (ucieczka na zapas nie działa), zejście z drogi po namierzeniu ratuje
   (e) luki: po nauce najdłuższa przerwa bez plastra z zawartością <= 5 s (cel QA: ok. 4 s)
   (f) debiuty (17 nr 4): tornado nie przed K5, burza tylko w Dalekim Niebie
   (g) czytelność (P0-4): 1,5 s przed kontaktem skala rysunku >= 0,55, chmura >= 48 px, sąsiednie komórki >= 60 px, przy L0 i L4; zapowiedź przy L4 >= 3,3 s
   (h) HUD (P1-4, P1-5, P2-1): L0 „MGIEŁKA”; kontrast napisów HUD >= 4,5:1 w dzień, o świcie, o zachodzie i nocą; komunikat poziomu w dzień >= 4,5:1; zdanie wstępu >= 4,5:1
   (i) sterowanie (P1-2, P1-3): tryb 1 kciuk leży 0,3 s, potem przesunięcie = krok bez nurkowania; tryb 2 drugi kciuk po ok. 120 ms = mocne machnięcie; pojedyncze stuknięcie od razu
   (j) panele (P1-7, P1-8): jasne tło i ciemny tusz, opisy trybów >= 4,5:1 i bez ucięcia przy 360 px; manifest jasny
   (k) brak błędów konsoli
   Kończy się kodem 0 tylko gdy wszystko przeszło. */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const { zrodlo } = require('./qa/boty_z18.cjs');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const base = 'file:///' + file.replace(/\\/g, '/');
const CHROME = 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe';
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const info = (m) => console.log('  info ' + m);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const r2 = (v) => Math.round(v * 100) / 100;
const med = (a) => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : null; };

/* bieg bota w przeglądarce (torSymuluj, krok 1/60 s): zwraca czas, koniec, pełny kolor, poziomy, wiersze, wejścia */
const BIEG = ([src, kr, seed, MAXS]) => {
  const O = window.__okruszek;
  O.pauza(true); O.panel(false); O.ziarno(seed); O.brama(kr); O.odblokuj(); O.ustawEnergie(null); O.bezPrzeszkod(false); O.bezPradow(false);
  const bot = src === 'null' ? null : (0, eval)(src);   /* źródło bota: stała z qa/boty_z18.cjs (nie dane z zewnątrz) */
  let t = 0, res = null, pierwszyPelny = null, pelny60 = 0, l4 = null, wiersz0 = 0;
  while (t < MAXS) {
    res = O.torSymuluj(0.25, bot, 1 / 60); t = res.graCzas;
    if (res.E >= 0.98 && pierwszyPelny === null) pierwszyPelny = t;
    if (t <= 60.01) pelny60 = res.pelnyKolor.lacznie;
    if (res.poziom >= 4 && l4 === null) l4 = t;
    if (res.kom.wiersz === 0) wiersz0 += 0.25;
    if (res.tryb !== 'gra') break;
  }
  const L = O.torLog(), wej = L.wejscia.filter(e => e.efekt === 'przerzut');
  return { t, koniec: res.tryb === 'gra' ? null : (res.koniec || res.tryb), pierwszyPelny, pelny60, l4, hiper: res.hiperRazy, l5bez: res.l5bezLancucha, wiersz0, wejscia: wej.length, idealne: wej.filter(e => e.idealne).length };
};

(async () => {
  console.log('TEST Z18 ' + file);
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
  const boty = async (nazwa, krainy, n, maxs) => { const out = []; for (const kr of krainy) for (let i = 0; i < n; i++) { const seed = 1000 + kr * 37 + i * 101; const r = await ev(BIEG, [zrodlo(nazwa, seed + 7), kr, seed, maxs]); r.kr = kr; out.push(r); } return out; };
  const K6 = [1, 2, 3, 4, 5, 6];

  /* ---------- (a) cele strojenia ---------- */
  console.log('(a) cele strojenia botami (deterministyczne ziarna)');
  const ID60 = await boty('idealny', K6, 6, 61);
  const idE = ID60.filter(x => x.pierwszyPelny !== null && x.pierwszyPelny <= 60).length, idL4 = ID60.filter(x => x.l4 !== null && x.l4 <= 60).length;
  chk(idE >= 0.9 * ID60.length, 'bot idealny: pełny kolor (E = 1) w <= 60 s w ' + idE + '/' + ID60.length + ' biegach (>= 90%; mediana pierwszego ' + r2(med(ID60.filter(x => x.pierwszyPelny !== null).map(x => x.pierwszyPelny))) + ' s)');
  chk(idL4 >= 0.9 * ID60.length, 'bot idealny: Turbo (L4) w <= 60 s w ' + idL4 + '/' + ID60.length + ' biegach (12.1: osiągalne)');
  const B50 = await boty('b50', K6, 6, 61);
  const b50E = B50.filter(x => x.pierwszyPelny !== null && x.pierwszyPelny <= 60).length, b50max = Math.max(...B50.map(x => x.pelny60));
  chk(b50E <= 0.15 * B50.length && b50max <= 2.0, 'bot 50% prądów: pełny kolor w <= 60 s w ' + b50E + '/' + B50.length + ' biegach (<= 15%), łącznie najwyżej ' + r2(b50max) + ' s (<= 2 s; sekcja 14)');
  const B70 = await boty('b70', K6, 4, 600);
  const b70id = B70.reduce((a, x) => a + x.idealne, 0) / Math.max(1, B70.reduce((a, x) => a + x.wejscia, 0)), b70t = B70.map(x => x.t), b70kon = B70.filter(x => x.koniec).length;
  chk(b70id >= 0.4 && b70id <= 0.6, 'idealne wejście wymaga precyzji: bot 70% ma ' + r2(100 * b70id) + '% idealnych wejść (cel 40-60%; przed Z18 92-97%)');
  chk(med(b70t) >= 180 && med(b70t) <= 480 && b70kon >= 0.5 * B70.length, 'bot 70% kończy bieg typowo w 3-8 min: mediana ' + r2(med(b70t)) + ' s, skończyło ' + b70kon + '/' + B70.length + ' w 600 s (końce: ' + [...new Set(B70.filter(x => x.koniec).map(x => x.koniec))].join(', ') + ')');
  const ID300 = await boty('idealny', K6, 2, 300);
  const idZyje = ID300.filter(x => !x.koniec).length;
  chk(idZyje >= 0.75 * ID300.length && med(ID300.map(x => x.t)) >= med(b70t.map(t => Math.min(t, 300))), 'bot idealny żyje dłużej: ' + idZyje + '/' + ID300.length + ' biegów po 300 s bez końca; L5 bez nurkowania: ' + ID300.reduce((a, x) => a + x.hiper, 0));
  chk(ID300.every(x => x.hiper === 0) && ID60.every(x => x.hiper === 0), 'bez nurkowania nigdy L5 (hiper wymaga łańcucha >= 5 i nurkowania)');
  const NUR = await boty('nurek', K6, 2, 300);
  const nurH = NUR.reduce((a, x) => a + x.hiper, 0);
  chk(nurH >= 1 && NUR.every(x => x.l5bez === 0), 'L5 rzadkie, ale możliwe: bot nurek (łańcuch >= 4 + nurkowanie) wszedł w hiper ' + nurH + ' razy w ' + NUR.length + ' x 300 s; L5 bez łańcucha: ' + NUR.reduce((a, x) => a + x.l5bez, 0));
  const LOS = await boty('losowy', K6, 1, 90), BIER = await boty('bierny', K6, 1, 90);
  chk(LOS.every(x => x.koniec && x.t <= 90 && x.pierwszyPelny === null) && BIER.every(x => x.koniec && x.t <= 90 && x.pierwszyPelny === null), 'bot losowy i bierny: nigdy E = 1, koniec w ' + LOS.map(x => Math.round(x.t)).join('/') + ' s i ' + BIER.map(x => Math.round(x.t)).join('/') + ' s');
  const STU = await boty('stukacz', K6, 2, 300);
  const stuZyje = STU.filter(x => !x.koniec).length;
  chk(STU.every(x => x.wiersz0 === 0) && stuZyje <= 0.3 * STU.length, 'samo machanie (co 0,7 s) nigdy w nadchmurzu (czas w górnym wierszu ' + STU.reduce((a, x) => a + x.wiersz0, 0) + ' s) i przeżywa 300 s w ' + stuZyje + '/' + STU.length + ' biegach (<= 30%; przed Z18 114/120)');

  /* ---------- (b) nadchmurze ---------- */
  console.log('(b) nadchmurze: tylko Schody światła');
  const NB = await ev(() => {
    const O = __okruszek, R = {}, T = O.tor().stale; O.pauza(true); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg();
    const ID0 = O.torStala('IDEAL'); O.torStala('IDEAL', 0.5);
    for (let i = 0; i < 42; i++) { O.idz(1, 1, true); O.torSymuluj(0.5); }   /* po nauce (w nauce najwyżej dwa z rzędu) */
    O.idz(1, 1, true); for (let i = 0; i < 6; i++) { O.stuknij(); O.torSymuluj(0.3); } R.machanie = O.komorka().wiersz;
    O.idz(1, 2, true); O.torSymuluj(1.5); O.idz(1, 2, true); O.zdarzenie('wiatr:gora', { k: 1, w: 2, z: 1.3 }); O.torSymuluj(1.0); R.windaSama = O.komorka().wiersz;
    O.idz(1, 2, true); O.torSymuluj(2.0); O.idz(1, 1, true); O.zdarzenie('wiatr:wprost', { k: 1, w: 1, z: 1.2 }); O.zdarzenie('wiatr:gora', { k: 1, w: 2, z: 1.95 });
    let s1 = false; for (let i = 0; i < 90; i++) { const k = O.komorka(); if (O.torLog().wejscia.length && O.torLog().wejscia.slice(-1)[0].znak === 'F' && k.wiersz === 1 && !k.przerzut) O.idz(1, 2); O.torSymuluj(1 / 60); if (O.komorka().wiersz === 0) { s1 = true; break; } }
    R.schody = s1; R.schodyLog = O.torLog().wejscia.slice(-2).map(e => e.znak + ':' + e.lancuchPo + ':' + (e.schody === undefined ? '-' : e.schody));
    O.idz(1, 0, true); let t0 = O.stan().graCzas, tz = -1; for (let i = 0; i < 400; i++) { O.torSymuluj(0.02); if (O.komorka().wiersz !== 0) { tz = O.stan().graCzas - t0; break; } } R.opadNadch = tz;
    O.idz(1, 0, true); t0 = O.stan().graCzas; tz = -1; for (let i = 0; i < 40; i++) { O.stuknij(); O.torSymuluj(0.15); if (O.komorka().wiersz !== 0) { tz = O.stan().graCzas - t0; break; } } R.opadMach = tz;
    R.T = { NADCH_SINK_T: T.NADCH_SINK_T, NADCH_LANC: T.NADCH_LANC };
    O.torStala('IDEAL', ID0); O.bezPrzeszkod(false); O.bezPradow(false); O.nowyBieg(); return R; });
  chk(NB.machanie === 1, 'z chmur (wiersz 1) sześć machnięć nie wnosi do nadchmurza (wiersz ' + NB.machanie + ')');
  chk(NB.windaSama === 1, 'winda w górę bez łańcucha z dolnego wiersza kończy w chmurach (wiersz ' + NB.windaSama + ', nie 0)');
  chk(NB.schody, 'druga z rzędu (Schody światła, łańcuch >= ' + NB.T.NADCH_LANC + ') wnosi do nadchmurza: ' + NB.schodyLog.join(', '), JSON.stringify(NB));
  chk(NB.opadNadch > 0 && Math.abs(NB.opadNadch - NB.T.NADCH_SINK_T) < 0.6 && NB.opadMach > 0 && NB.opadMach < NB.T.NADCH_SINK_T + 0.6, 'w nadchmurzu opadanie po ' + r2(NB.opadNadch) + ' s (NADCH_SINK_T ' + NB.T.NADCH_SINK_T + '), machanie co 0,15 s go nie zatrzymuje (' + r2(NB.opadMach) + ' s)');

  /* ---------- (c) precyzja ---------- */
  console.log('(c) idealne wejście = środek wstęgi');
  const PR = await ev(() => {
    const O = __okruszek, R = {}; O.pauza(true); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg();
    for (let i = 0; i < 42; i++) { O.idz(1, 1, true); O.torSymuluj(0.5); }
    const sp = () => O.tor().sp;
    O.idz(1, 1, true); O.zdarzenie('wiatr:wprost', { k: 1, w: 1, z: 0.7 + sp() * 2.6 }); O.torSymuluj(2.9); let e = O.torLog().wejscia.slice(-1)[0]; R.opadly = { idealne: e.idealne, odch: e.odch };
    O.torSymuluj(1.5); O.idz(1, 1, true); O.zdarzenie('wiatr:wprost', { k: 1, w: 1, z: 0.7 + sp() * 0.35 }); O.torSymuluj(0.6); e = O.torLog().wejscia.slice(-1)[0]; R.srodek = { idealne: e.idealne, odch: e.odch };
    R.IDEAL = O.torStala('IDEAL'); O.bezPrzeszkod(false); O.bezPradow(false); O.nowyBieg(); return R; });
  chk(!PR.opadly.idealne && PR.opadly.odch > PR.IDEAL && PR.srodek.idealne && Math.abs(PR.srodek.odch) < PR.IDEAL, 'wejście po 2,6 s szybowania (odchylenie ' + PR.opadly.odch + ' > ' + PR.IDEAL + ') nie jest idealne; środkiem wstęgi (' + PR.srodek.odch + ') jest', JSON.stringify(PR));

  /* ---------- (d) drapieżnik ---------- */
  console.log('(d) drapieżnik: śledzi do namierzenia, unik po namierzeniu');
  const DR = await ev(() => {
    const O = __okruszek, R = {}, T = O.tor().stale, lock = T.ATAK_ZAP - T.ATAK_LOCK;
    const atak = (kiedy) => { O.pauza(true); O.brama(4); O.bezPrzeszkod(true); O.bezPradow(true); O.idz(1, 1, true); O.ustaw(0.1); O.zdarzenie('jastrzab'); let ruszyl = false, wynik = null;
      for (let i = 0; i < 60 * 10; i++) { const st = O.stan().jastrzab, a = O.torLog().ataki.slice(-1)[0];
        if (st && st.faza === 'poscig' && a && !a.wynik && !ruszyl) { const ta = O.stan().graCzas - a.t; if (ta >= kiedy) { const k = O.komorka(); O.idz(k.kol === 2 ? 1 : k.kol + 1, k.wiersz); ruszyl = true; } }
        if (a && a.wynik) { wynik = a.wynik; break; } if (O.idz(O.komorka().kol, O.komorka().wiersz) && false) break; O.torSymuluj(1 / 60); }
      O.odblokuj(); return wynik; };
    R.zapas = atak(0.3); R.poNamierzeniu = atak(lock + 0.2); R.lock = lock; O.bezPrzeszkod(false); O.bezPradow(false); O.brama(1); return R; });
  chk(DR.zapas === 'zlapal' && DR.poNamierzeniu === 'pudlo', 'ucieczka na zapas (0,3 s po zaznaczeniu): ' + DR.zapas + '; zejście z drogi po namierzeniu (' + r2(DR.lock) + ' s): ' + DR.poNamierzeniu, JSON.stringify(DR));

  /* ---------- (e) luki ---------- */
  console.log('(e) luki bez plastra z zawartością');
  const LK = await ev((src) => { const O = __okruszek, out = [];
    for (let i = 0; i < 6; i++) { O.pauza(true); O.ziarno(5000 + i * 13); O.brama(1 + i); O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false); const bot = (0, eval)(src.replace('SEED', String(21 + i))); let t = 0;
      while (t < 200) { const r = O.torSymuluj(1, bot, 1 / 60); t = r.graCzas; if (r.tryb !== 'gra') break; }
      const k = O.torLog().plastry.filter(p => p.tKontakt !== null && /[^.]/.test(p.g.join(''))).map(p => p.tKontakt).sort((a, b) => a - b); let mx = 0; for (let j = 1; j < k.length; j++) if (k[j - 1] > 25) mx = Math.max(mx, k[j] - k[j - 1]); out.push(mx); }
    return out; }, zrodlo('b70', 'SEED'));
  chk(Math.max(...LK) <= 5.0, 'najdłuższa przerwa bez wiatru i przeszkody po nauce: ' + LK.map(r2).join(', ') + ' s (<= 5 s; przed Z18 do 21 s)');

  /* ---------- (f) debiuty ---------- */
  console.log('(f) debiuty tornada i burzy');
  const DB = await ev(() => { const O = __okruszek, out = {}; for (let k = 1; k <= 6; k++) { const g = O.generuj(600, { kraina: k, losoweN: true, ziarno: 31 + k }).join(''); out[k] = { T: (g.match(/T/g) || []).length, B: (g.match(/B/g) || []).length }; } return out; });
  chk([1, 2, 3, 4].every(k => DB[k].T === 0) && [1, 2, 3, 4, 5].every(k => DB[k].B === 0) && DB[5].T > 0 && DB[6].B > 0, 'generator: tornado od K5, burza tylko w Dalekim Niebie: ' + JSON.stringify(DB));

  /* ---------- (g) czytelność ---------- */
  console.log('(g) czytelność przeszkody 1,5 s przed kontaktem');
  const CZ = await ev(() => { const O = __okruszek, out = [];
    for (const L of [0, 4]) { O.tempo(1); O.pauza(true); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.ustawPoziom(L); O.idz(1, 1, true); O.torSymuluj(0.8); O.idz(1, 1, true);
      const sp = O.tor().sp; O.zdarzenie('chmura:szara', { k: 1, w: 1, z: 0.7 + sp * 1.5 }); O.zdarzenie('chmura:lawenda', { k: 2, w: 1, z: 0.7 + sp * 1.5 + 0.001 });
      const G = O.gdzie(), a = G.find(x => x.typ === 'chmura:szara'), b = G.find(x => x.typ === 'chmura:lawenda'), CW = O.tor().CW;
      out.push({ L, sp: Math.round(sp * 100) / 100, skala: a.skala, szer: CW * 1.25 * a.skala / 0.7, odstep: Math.abs(b.ex - a.ex) }); }
    O.ziarno(3); O.nowyBieg(); O.ustawPoziom(4); O.bezPrzeszkod(false); O.bezPradow(false); O.torSymuluj(40); const pl = O.torLog().plastry.filter(p => p.tKontakt !== null && p.tPokaz > 0 && !p.wstawiony);
    O.odblokuj(); O.nowyBieg(); return { sceny: out, zapL4: Math.min(...pl.map(p => p.czas)), n: pl.length }; });
  chk(CZ.sceny.every(x => x.skala >= 0.55 && x.szer >= 48 && x.odstep >= 60), '1,5 s przed kontaktem: ' + CZ.sceny.map(x => 'L' + x.L + ' skala ' + r2(x.skala) + ', chmura ' + Math.round(x.szer) + ' px, sąsiednia komórka ' + Math.round(x.odstep) + ' px').join('; ') + ' (przed Z18: 0,33 / 48 px / 38 px)');
  chk(CZ.zapL4 >= 3.3 && CZ.n >= 10, 'przy L4 plaster widać co najmniej ' + r2(CZ.zapL4) + ' s przed kontaktem (' + CZ.n + ' plastrów; przed Z18 2,75-2,95 s)');

  /* ---------- (h) HUD i wstęp ---------- */
  console.log('(h) HUD, nazwa L0, wstęp');
  const nm = await ev(() => { const O = __okruszek; O.nowyBieg(); O.ustawPoziom(0); const n = O.hudNazwa(); O.odblokuj(); return n; });
  chk(nm.nazwy[0] === 'Mgiełka' && nm.nazwa === 'MGIEŁKA', 'L0 w HUD: „' + nm.nazwa + '” (dawniej „Kontur”)');
  const H2 = await mkPage('?test&tor=1&seed=5', { deviceScaleFactor: 2 });
  const KONTRAST = (boxes) => { const c = document.getElementById('g'), k = c.width / innerWidth, t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return boxes.map(([nm, x0, y0, w, h]) => { const D = x.getImageData(Math.round(x0 * k), Math.round(y0 * k), Math.round(w * k), Math.round(h * k)).data, Ls = []; for (let i = 0; i < D.length; i += 4) Ls.push(0.2126 * lin(D[i]) + 0.7152 * lin(D[i + 1]) + 0.0722 * lin(D[i + 2])); Ls.sort((a, b) => a - b); const bg = Ls[Math.floor(Ls.length * 0.5)], hi = Ls[Math.floor(Ls.length * 0.98)], lo = Ls[Math.floor(Ls.length * 0.02)]; const cr = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); return { nm, kontrast: +Math.max(cr(hi, bg), cr(lo, bg)).toFixed(2) }; }); };
  const BOXY = [['DYSTANS', 14, 8, 70, 14], ['liczba', 14, 22, 60, 26], ['poziom', 132, 54, 70, 14], ['WYSOKOSC', 300, 8, 76, 14]];
  const hud = {};
  for (const [pora, L] of [['dzien', 0], ['swit', 1], ['dzien', 2], ['zachod', 3], ['noc', 0], ['noc', 4]]) {
    await H2.pg.evaluate(([pora, L]) => { const O = window.__okruszek; O.tempo(1); O.pauza(true); O.panel(false); O.ziarno(77); O.brama(3); O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false); O.nowyBieg();
      let n = -9; O.torSymuluj(30, (A) => (A.kom.wiersz >= 2 || A.kom.p > 0.5) && A.t - n > 0.25 ? (n = A.t, { stuk: 0 }) : {}, 1 / 60); O.ustawPore(pora); O.ustawPoziom(L); O.tempo(0.001); O.pauza(false); }, [pora, L]);
    await sleep(1500); hud[pora + '-L' + L] = await H2.pg.evaluate(KONTRAST, BOXY);   /* tusz HUD przechodzi płynnie (ok. 0,3 s czasu rzeczywistego) po próbce co 0,25 s */
  }
  const hudMin = Math.min(...Object.values(hud).flat().map(b => b.kontrast));
  chk(hudMin >= 4.5, 'kontrast napisów HUD >= 4,5:1 (najmniej ' + hudMin + '): ' + Object.keys(hud).map(k => k + ' ' + hud[k].map(b => b.kontrast).join('/')).join(', ') + ' (przed Z18 w dzień 1,75-2,5)');
  await H2.pg.evaluate(() => { const O = window.__okruszek; O.tempo(1); O.ustawPore('dzien'); O.ustaw(0); }); await sleep(400);
  await H2.pg.evaluate(() => { window.__okruszek.ustaw(0.5); }); await sleep(450); await H2.pg.evaluate(() => window.__okruszek.tempo(0.001)); await sleep(250);
  const kom = await H2.pg.evaluate(() => window.__okruszek.stan().komunikat), lvk = (await H2.pg.evaluate(KONTRAST, [['komunikat', 125, 126, 140, 22]]))[0].kontrast;
  chk(kom && lvk >= 4.5, 'komunikat poziomu w dzień („' + kom + '”): ' + lvk + ':1 (przed Z18 1,33:1)');
  await H2.ctx.close();
  const W5 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }); const wp = await W5.newPage(); wp.on('pageerror', e => errors.push('pageerror: ' + e));
  await wp.goto(base + '?tor=1'); await sleep(4300);
  const wk = await wp.evaluate((K) => { const c = document.getElementById('g'), k = c.width / innerWidth, t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }, D = x.getImageData(Math.round(60 * k), Math.round(0.36 * innerHeight * k - 40 * k), Math.round(270 * k), Math.round(80 * k)).data, Ls = [];
    for (let i = 0; i < D.length; i += 4) Ls.push(0.2126 * lin(D[i]) + 0.7152 * lin(D[i + 1]) + 0.0722 * lin(D[i + 2])); Ls.sort((a, b) => a - b); const bg = Ls[Ls.length >> 1], lo = Ls[Math.floor(Ls.length * 0.01)]; return +((bg + 0.05) / (lo + 0.05)).toFixed(2); });
  chk(wk >= 4.5, 'zdanie wstępu (4 s): ' + wk + ':1 (przed Z18 ok. 1,6:1)'); await W5.close();

  /* ---------- (i) sterowanie ---------- */
  console.log('(i) sterowanie: kciuk położony w trybie 1, para kciuków w trybie 2');
  const cdp = await ctx.newCDPSession(pg);
  const touch = async (type, pts) => { await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p[1], y: p[2], id: p[0] })) }); };
  const fresh = async (mode, c, r) => { try { await touch('touchCancel', []); } catch (_) { } await sleep(60); await ev(([m, c2, r_]) => { const O = __okruszek; O.panel(false); O.odblokuj(); O.nurkuj(false); O.bezPrzeszkod(true); O.bezPradow(true); O.tempo(1); O.czulosc(1); O.sterowanie(m); O.nowyBieg(); O.ustaw(0); O.idz(c2, r_, true); }, [mode, c, r]); await sleep(150); };
  const kom1 = () => ev(() => __okruszek.komorka());
  await fresh(1, 1, 1); await touch('touchStart', [[1, 200, 600]]); await sleep(320); for (let i = 1; i <= 6; i++) { await touch('touchMove', [[1, 200 + i * 10, 600]]); await sleep(16); } await touch('touchEnd', []); await sleep(250);
  const t1 = await kom1();
  chk(t1.kol === 2 && t1.wiersz === 1 && !t1.nurkuje, 'tryb 1: kciuk leżał 0,3 s, potem przesunięcie w prawo = kolumna ' + t1.kol + ', wiersz ' + t1.wiersz + ' (bez nurkowania; przed Z18: nurkowanie, bez skrętu)');
  await fresh(2, 1, 1); const w0 = (await kom1()).wzlot; await touch('touchStart', [[1, 80, 700]]); await sleep(120); await touch('touchStart', [[1, 80, 700], [2, 310, 700]]); await sleep(40); await touch('touchEnd', []); await sleep(250);
  const t2 = await kom1();
  chk(t2.kol === 1 && (t2.wzlot >= 1.5 || t2.wiersz === 0), 'tryb 2: drugi kciuk ok. 120 ms po pierwszym = mocne machnięcie (kolumna ' + t2.kol + ', wzlot ' + r2(t2.wzlot) + '; przed Z18: skręt)');
  await fresh(2, 1, 1); await touch('touchStart', [[1, 80, 700]]); await sleep(30); await touch('touchEnd', []); await sleep(40);
  const t3 = await kom1();
  chk(t3.kol === 0, 'tryb 2: pojedyncze stuknięcie działa od razu (po 40 ms kolumna ' + t3.kol + '; przed Z18 czekało 79-90 ms)');
  await ev(() => { __okruszek.sterowanie(1); __okruszek.bezPrzeszkod(false); __okruszek.bezPradow(false); __okruszek.nowyBieg(); });

  /* ---------- (j) panele ---------- */
  console.log('(j) jasne panele, opisy trybów, manifest');
  const P3 = await mkPage('?test&tor=1&seed=5', { viewport: { width: 360, height: 640 } });
  await P3.pg.evaluate(() => window.__okruszek.panel(true)); await sleep(500);
  const PN = await P3.pg.evaluate(() => {
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }, L = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number), ster = document.getElementById('ster'), bgc = rgb(getComputedStyle(ster).backgroundColor), ink = rgb(getComputedStyle(ster).color);
    const ops = [...document.querySelectorAll('#ster .tryb .op')].map(e => { const o = +getComputedStyle(e).opacity, c = ink.map((v, i) => o * v + (1 - o) * bgc[i]); return { cut: e.scrollHeight > e.clientHeight + 1, kontrast: (L(bgc) + 0.05) / (L(c) + 0.05) }; });
    return { tlo: L(bgc), tusz: L(ink), ops };
  });
  chk(PN.tlo >= 0.7 && PN.tusz <= 0.05, 'panel sterowania jasny (luminancja tła ' + r2(PN.tlo) + ', tuszu ' + r2(PN.tusz) + '; przed Z18 granat 93%)');
  chk(PN.ops.every(o => !o.cut && o.kontrast >= 4.5), 'opisy trybów przy 360 x 640: bez ucięcia, kontrast ' + PN.ops.map(o => r2(o.kontrast)).join('/') + ':1');
  await P3.ctx.close();
  const man = JSON.parse(fs.readFileSync(path.join(path.dirname(file), 'manifest.webmanifest'), 'utf8')), hexL = (h) => { const c = [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16)); return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]; };
  chk(hexL(man.background_color) > 180 && hexL(man.theme_color) > 180, 'manifest: jasne kolory ekranu powitalnego i paska (' + man.background_color + ' / ' + man.theme_color + ')');

  /* ---------- (k) konsola ---------- */
  const real = errors.filter(e => !/favicon/i.test(e));
  chk(real.length === 0, 'brak błędów i ostrzeżeń konsoli', real.slice(0, 4).join(' | '));
  await browser.close();
  console.log(fail ? ('TEST Z18 NIE PRZESZEDŁ (' + fail + ')') : 'TEST Z18 OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST Z18 BŁĄD: ' + (e && e.stack || e)); process.exit(2); });
