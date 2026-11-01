/* Okruszek Z21 (PROJEKT.md 19.1-19.3): przewrót w bok (unik), widoczne drogi toru bez ramek, unoszenie. Użycie: node gra_test_z21.cjs [plik.html]
   (Uwaga: eval w tym teście wykonuje tylko własne, lokalne źródła botów i pomiarów w stronie testowej, jak w gra_test_z17/z19; nie czyta danych z zewnątrz.)
   Pomiary deterministyczne (hak ?test, torSymuluj z dt 1/60, stałe ziarna, kadr19 = jedna klatka rysowania):
   (a) przewrót: hak przewrot('lewo' | 'prawo'), kolumna w stronę przewrotu (przy krawędzi w miejscu), okno niewrażliwości TYLKO w środku animacji (0,05-0,30 s z 0,35),
       odnowienie 1,2 s, koszt energii (E 1 -> 0,9; E 0,4 -> 0,3), łańcuch nienaruszony, obrót beczki (skrzydla().obrot) rośnie płynnie do 2 pi, reduced-motion = sam przechył,
       kanały: obraz + dźwięk + vibrate
   (b) unik przed namierzonym uderzeniem drapieżnika: przewrót 0,2 s przed uderzeniem = 'unik' (bieg trwa), za późno (0,02 s) i za wcześnie (0,34 s) = 'zlapal', bez przewrotu = 'zlapal';
       6 ziaren, K4 (dwa cele), Okruszek przy krawędzi (przewrót w miejscu, więc ratuje tylko okno)
   (c) unik przed przeszkodą S1/S2: chmura szara / burza / ptak w oknie = 'unik', kontakt 0,02 s po przewrocie i 0,5 s po nim = 'kara'; oaza w oknie nadal działa (buff)
   (d) podwójne stuknięcie vs dwa pojedyncze (prawdziwe zdarzenia wskaźnika, odstęp 60 ms vs 400 ms) w trybach 1, 2, 3 i na klawiaturze (Q / E), mysz (podwójny klik);
       pojedyncze stuknięcie nie jest opóźnione (machnięcie od razu), po gestach brak ducha palca (palce 0, bez nurkowania, bez drążka)
   (e) bot-unikacz (przewrót 0,22 s przed uderzeniem) osiąga dłuższy bieg niż ten sam bot bez przewrotu (K4, 5 ziaren, do 240 s)
   (f) drogi: wstęgi widoczne (zmiana jasności 3-50 w dzień i w nocy, dolny wiersz za dnia cieniem na morzu), cień Okruszka >= 2:1 w 4 porach x L0/L5, komórka Okruszka
       jaśniejsza od dalekiej (w trybach 1-3), brak prostokątnych obrysów i cienkich linii (miara Z17: grz, dol), czytelność przeszkody bez zmian (kontrast chmury +-25%),
       przełącznik „Drogi toru” (panel w torze, nie na ekranie startu, nie w swobodnym locie) działa i jest zapamiętany po przeładowaniu
   (g) unoszenie: po dwóch machnięciach wiersz w górę bez skoku (najwyżej 10 px na klatkę, >= 0,25 s do 90% drogi), po wietrze w górę płynnie (<= 12 px na klatkę, >= 0,3 s),
       dyszki przy szybowaniu (>= 4 px, ciągłe), przy reduced-motion brak dyszek
   (h) zrzuty 390x844 do zrzuty-z21: przewrót w obie strony (6 klatek), drogi L0-L4 dzień i noc, cień, wznoszenie; brak błędów konsoli.
   Kończy się kodem 0 tylko gdy wszystko przeszło. */
const { chromium, CHROME, fs, path } = require('./qa/wspolne.cjs');
const { BOT } = require('./qa/boty_z18.cjs');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const base = 'file:///' + file.replace(/\\/g, '/');
const dir = path.join(__dirname, 'zrzuty-z21'); fs.mkdirSync(dir, { recursive: true });
let fail = 0; const wyn = {}, errors = [];
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const info = (m) => console.log('  info ' + m);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const med = (a) => { const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const r2 = (v) => Math.round(v * 100) / 100, r3 = (v) => Math.round(v * 1000) / 1000;
/* miara z gra_test_z17.cjs: ułamek pikseli w cienkiej ciemnej (dol) i cienkiej jasnej (grz) linii, poza kwadratem ptaszka, poniżej HUD */
const MIERZ = () => {
  const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height;
  const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
  const W = t.width, H = t.height, d = x.getImageData(0, 0, W, H).data, sc = W / 390, p = __okruszek.ptakEkran(), bw = 90 * sc, bcx = p.x * sc, bcy = p.y * sc, T = 16;
  const L = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) L[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  let dol = 0, n = 0, grz = 0;
  for (let y = Math.round(90 * sc); y < H - 2; y++) for (let xx = 2; xx < W - 2; xx++) {
    if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bw) continue;
    const i = y * W + xx, l = L[i]; n++;
    const a = L[i - 2], bb = L[i + 2], u = L[i - 2 * W], v = L[i + 2 * W];
    if ((l < a - T && l < bb - T) || (l < u - T && l < v - T)) dol++;
    if ((l > a + T && l > bb + T) || (l > u + T && l > v + T)) grz++;
  }
  return { dol: dol / n, grz: grz / n };
};
const ZAPIS = { v: 1, bramy: [1, 2, 3, 4, 5, 6], najdalej: 0, najdluzszy: 0, krainy: {}, krotkie: 0, dzien: { d: '', n: 0 }, intro: 1, naukaTor: 1, drogi: 1, dz: { m: 1, e: 1, v: 1 } };

(async () => {
  console.log('TEST Z21 ' + file);
  const br = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  try {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true });
    await ctx.addInitScript((Z) => {
      let seed = 21023; Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
      window.wibracjeTest = []; Object.defineProperty(navigator, 'vibrate', { configurable: true, value: p => { wibracjeTest.push(p); return true; } });
      try { if (!localStorage.getItem('okruszek.zapis')) localStorage.setItem('okruszek.zapis', JSON.stringify(Z)); } catch (_) { }
    }, ZAPIS);
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errors.push('pageerror: ' + (e.stack || e))); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
    await pg.goto(base + '?test&tor=1&seed=23'); await pg.waitForFunction(() => !!window.__okruszek);
    const ev = (f, a) => pg.evaluate(f, a);
    const reset = (o) => ev((o) => { const O = __okruszek; O.panel(false); O.pauza(true); O.bezPradow(true); O.bezPrzeszkod(true); O.ziarno(o.ziarno || 23); O.brama(o.brama || 1); O.odblokuj(); O.ustawEnergie(null); O.nurkuj(false); O.nowyBieg(); O.tempo(1); O.sterowanie(o.tryb || 1); O.ustawPore(o.pora || 'dzien'); O.ustawPoziom(o.L || 0); if (o.s !== undefined) O.ustaw(o.s); O.torSymuluj(0.1); O.idz(o.k === undefined ? 1 : o.k, o.w === undefined ? 1 : o.w, true); O.kadr19(); return O.przewrotStan().stale; }, o || {});

    /* ---------- (a) przewrót: hak, animacja, odnowienie, koszt ---------- */
    console.log('(a) przewrót: hak, okno niewrażliwości, odnowienie, koszt energii, animacja');
    wyn.stale = await reset({});
    const A1 = await ev(() => {
      const O = __okruszek, out = { klatki: [] };
      const r = O.przewrot('prawo'); out.ok = r.ok; out.kol = O.komorka().kol; out.t0 = r.stan.t;
      out.drugi = O.przewrot('prawo').ok;
      for (let i = 0; i < 26; i++) { O.torSymuluj(1 / 60); O.kadr19(1 / 60); const s = O.przewrotStan(), w = O.skrzydla(); out.klatki.push({ t: s.t, unik: s.unik, obrot: w ? w.obrot : null, dl: w ? w.dl : null, dr: w ? w.dr : null }); }
      out.poCd = O.przewrot('prawo').ok; O.torSymuluj(1.25); out.po125 = O.przewrot('prawo').ok; out.kolKraw = O.komorka().kol;
      O.idz(1, 1, true); O.torSymuluj(1.3); out.lewo = O.przewrot('lewo').ok; out.kolLewo = O.komorka().kol;
      return out;
    });
    chk(A1.ok && A1.kol === 2 && A1.t0 === 0, 'przewrot(\'prawo\') z (1,1): kolumna 2, animacja od t = 0', JSON.stringify({ ok: A1.ok, kol: A1.kol, t0: A1.t0 }));
    const wOknie = A1.klatki.filter(k => k.t !== null && k.unik), pozaOknem = A1.klatki.filter(k => k.t !== null && !k.unik);
    chk(wOknie.length && wOknie.every(k => k.t >= 0.05 - 1e-6 && k.t <= 0.30 + 1e-6) && pozaOknem.every(k => k.t < 0.05 || k.t > 0.30), 'niewrażliwość tylko w środku animacji (0,05-0,30 s z 0,35): w oknie ' + wOknie.length + ' klatek, poza ' + pozaOknem.length, JSON.stringify(A1.klatki.map(k => [k.t, k.unik])));
    const obr = A1.klatki.filter(k => k.t !== null).map(k => k.obrot);
    const monot = obr.every((v, i) => i === 0 || v >= obr[i - 1] - 1e-9), kroki = obr.map((v, i) => i ? v - obr[i - 1] : 0);
    chk(obr.length >= 18 && monot && Math.abs(obr[obr.length - 1]) > 5.5 && Math.max(...kroki) < 1.2 && obr.every(v => isFinite(v)), 'beczka: obrót rośnie monotonicznie do ok. 2 pi w ' + obr.length + ' klatkach, największy krok ' + r3(Math.max(...kroki)) + ' rad (bez migotania)', JSON.stringify(obr.map(r2)));
    const dr0 = A1.klatki.slice(0, 8).map(k => k.dr), dl0 = A1.klatki.slice(0, 8).map(k => k.dl);
    chk(Math.max(...dr0) > 0.5 && Math.max(...dr0) > Math.max(...dl0) + 0.2, 'przewrót w prawo: prawe skrzydło prowadzi (złożone pierwsze: dr ' + r2(Math.max(...dr0)) + ' > dl ' + r2(Math.max(...dl0)) + ')', JSON.stringify({ dr0, dl0 }));
    chk(!A1.drugi && !A1.poCd && A1.po125, 'odnowienie: drugi przewrót w trakcie i tuż po = odmowa, po 1,2 s znów działa', JSON.stringify({ drugi: A1.drugi, poCd: A1.poCd, po125: A1.po125 }));
    chk(A1.kolKraw === 2, 'przy krawędzi (kolumna 2) przewrót w prawo zostaje w miejscu (kolumna ' + A1.kolKraw + ')');
    chk(A1.lewo && A1.kolLewo === 0, 'przewrot(\'lewo\') z (1,1): kolumna 0', JSON.stringify({ lewo: A1.lewo, kol: A1.kolLewo }));
    await reset({});
    const A2 = await ev(() => {
      const O = __okruszek, out = {};
      O.odblokuj();   /* energia() przy zablokowanej prędkości pokazuje blokadę, nie E */
      /* E bez blokady opada samo (FALL_E po łasce), więc koszt mierzony w tej samej chwili: przed i tuż po przewrocie, bez kroku symulacji między nimi */
      O.ustawEnergie(1); O.ustawEnergie(null); out.e0 = O.energia(); O.przewrot('prawo'); out.e1 = O.energia(); O.torSymuluj(0.3); out.e1b = O.energia();
      O.idz(1, 1, true); O.torSymuluj(1.3); O.ustawEnergie(0.4); O.ustawEnergie(null); out.e2 = O.energia(); O.przewrot('lewo'); out.e3 = O.energia();
      O.idz(1, 1, true); O.torSymuluj(1.3); O.trafPrad(); out.n0 = O.lancuch().n; O.przewrot('prawo'); O.torSymuluj(0.1); out.n1 = O.lancuch().n;
      out.kan = O.czucie().kanaly.przewrot; out.wibr = wibracjeTest.length;
      return out;
    });
    chk(Math.abs(A2.e0 - 1) < 0.005 && Math.abs(A2.e1 - 0.9) < 0.005 && A2.e1b <= A2.e1 + 0.001, 'koszt energii przy pełnym kolorze: E 1 -> ' + r2(A2.e1) + ' (najwyżej 0,1) i nie wraca sama (po 0,3 s ' + r2(A2.e1b) + ')', JSON.stringify(A2));
    chk(Math.abs(A2.e2 - 0.4) < 0.005 && Math.abs(A2.e3 - 0.3) < 0.005, 'koszt energii: E 0,4 -> ' + r2(A2.e3) + ' (25%, część, nie całość)', JSON.stringify(A2));
    chk(A2.n0 === 1 && A2.n1 === 1, 'przewrót nie zrywa łańcucha wiatrów (n ' + A2.n0 + ' -> ' + A2.n1 + ')');
    chk(A2.kan && A2.kan.obraz >= 3 && A2.kan.dzwiek >= 3 && A2.kan.vibrate >= 3 && A2.wibr >= 3, 'przewrót: obraz + wywołanie dźwięku + vibrate (' + JSON.stringify(A2.kan) + ')');
    /* zmiana prefers-reduced-motion dociera do strony zdarzeniem matchMedia; przy obciążonym komputerze 60 ms nie wystarcza: czekamy na jej potwierdzenie w stronie */
    await pg.emulateMedia({ reducedMotion: 'reduce' }); await pg.waitForFunction(() => matchMedia('(prefers-reduced-motion: reduce)').matches && __okruszek.czucie().kamera.przechyl === 0); await sleep(60); await reset({});
    const A3 = await ev(() => { const O = __okruszek; O.przewrot('prawo'); let m = 0; for (let i = 0; i < 24; i++) { O.torSymuluj(1 / 60); O.kadr19(1 / 60); const w = O.skrzydla(); if (w) m = Math.max(m, Math.abs(w.obrot)); } return { obrot: m, kol: O.komorka().kol, unik: O.przewrotStan().log.length }; });
    await pg.emulateMedia({ reducedMotion: 'no-preference' }); await pg.waitForFunction(() => !matchMedia('(prefers-reduced-motion: reduce)').matches); await sleep(60);
    chk(A3.obrot > 0.1 && A3.obrot <= 0.6 && A3.kol === 2, 'reduced-motion: przewrót bez pełnego obrotu (najwyżej ' + r2(A3.obrot) + ' rad), mechanika ta sama (kolumna ' + A3.kol + ')');

    /* ---------- (b) unik przed drapieżnikiem ---------- */
    console.log('(b) unik przed namierzonym uderzeniem drapieżnika');
    wyn.drap = await ev(() => {
      const O = __okruszek, out = [];
      const bieg = (seed, rollAt) => {
        O.panel(false); O.pauza(true); O.ziarno(seed); O.brama(4); O.odblokuj(); O.bezPradow(true); O.bezPrzeszkod(true); O.nowyBieg(); O.ustaw(0.1); O.idz(2, 1, true); O.zdarzenie('jastrzab');
        let done = false, tRoll = null, r = null, a = {};
        /* symulacja w krokach 0,1 s do rozstrzygnięcia PIERWSZEGO ataku (drapieżnik atakuje potem jeszcze dwa razy, a ten bot nie robi nic więcej) */
        for (let i = 0; i < 160 && !(a.wynik); i++) {
          r = O.torSymuluj(0.1, (A) => { if (rollAt !== null && !done && A.haw && A.haw.cel && A.przewrot.hitAt !== null && A.haw.cel[2] >= A.przewrot.hitAt - rollAt - 1 / 120) { done = true; tRoll = A.haw.cel[2]; return { przewrot: 1 }; } return {}; });
          a = O.torLog().ataki[0] || {};
        }
        return { seed, rollAt, wynik: a.wynik, tryb: r.tryb, kom: O.komorka().kol, hitAt: a.hitAt, tRoll, przewroty: O.przewrotStan().liczniki.przewroty, uniki: O.przewrotStan().liczniki.uniki };
      };
      for (let seed = 1; seed <= 6; seed++) for (const rollAt of [0.2, 0.02, 0.34, null]) out.push(bieg(seed, rollAt));
      O.odblokuj(); return out;
    });
    const dU = wyn.drap.filter(x => x.rollAt === 0.2), dP = wyn.drap.filter(x => x.rollAt === 0.02), dW = wyn.drap.filter(x => x.rollAt === 0.34), dB = wyn.drap.filter(x => x.rollAt === null);
    chk(dU.every(x => x.wynik === 'unik' && x.tryb === 'gra' && x.uniki === 1 && x.kom === 2), 'przewrót 0,2 s przed uderzeniem = unik, bieg trwa (6 ziaren, Okruszek przy krawędzi, przewrót w miejscu)', JSON.stringify(dU));
    chk(dP.every(x => x.wynik === 'zlapal') && dW.every(x => x.wynik === 'zlapal'), 'przewrót za późno (0,02 s) i za wcześnie (0,34 s) nie chroni: zlapal', JSON.stringify({ dP, dW }));
    chk(dB.every(x => x.wynik === 'zlapal' && x.przewroty === 0), 'bez przewrotu: zlapal (ten sam bieg)', JSON.stringify(dB));

    /* ---------- (c) unik przed przeszkodą ---------- */
    console.log('(c) unik przed przeszkodą S1/S2 (chmura, burza, ptak), oaza nadal działa');
    wyn.przesz = await ev(() => {
      const O = __okruszek, out = [];
      const proba = (typ, eta, roll) => {
        O.panel(false); O.pauza(true); O.ziarno(5); O.brama(2); O.odblokuj(); O.bezPradow(true); O.bezPrzeszkod(true); O.nowyBieg(); O.ustaw(0.1); O.idz(2, 1, true); O.torSymuluj(0.05);
        const sp = O.tor().sp, k0 = O.torLog().kontakty.length, s0 = O.stan().s;
        O.zdarzenie(typ, { k: 2, w: 1, z: 0.7 + sp * eta });
        if (roll) O.przewrot('prawo');
        O.torSymuluj(eta + 0.25);
        const k = O.torLog().kontakty.slice(k0), e = k.find(x => x.efekt !== 'widowisko') || {};
        return { typ, eta, roll, efekt: e.efekt, kolizje: O.stan().kolizje, wiersz: O.komorka().wiersz, kontaktow: k.length };
      };
      for (const typ of ['chmura:szara', 'burza', 'chmura:fiolet']) { out.push(proba(typ, 0.2, true)); out.push(proba(typ, 0.2, false)); }
      out.push(proba('chmura:szara', 0.02, true)); out.push(proba('chmura:szara', 0.5, true)); out.push(proba('chmura:oaza', 0.2, true)); out.push(proba('ptak', 0.2, true));
      O.odblokuj(); return out;
    });
    const pU = wyn.przesz.filter(x => x.roll && x.eta === 0.2 && x.typ !== 'chmura:oaza'), pK = wyn.przesz.filter(x => !x.roll);
    chk(pU.every(x => x.efekt === 'unik' && x.kolizje === 0 && x.wiersz === 1), 'chmura szara, burza, fiolet, ptak: kontakt w oknie przewrotu = unik (bez kary, bez zepchnięcia)', JSON.stringify(pU));
    chk(pK.every(x => x.efekt === 'kara'), 'bez przewrotu te same kontakty = kara', JSON.stringify(pK));
    chk(wyn.przesz.filter(x => x.roll && x.typ === 'chmura:szara' && x.eta !== 0.2).every(x => x.efekt === 'kara'), 'kontakt 0,02 s po przewrocie i 0,5 s po nim (po animacji) = kara', JSON.stringify(wyn.przesz.filter(x => x.eta !== 0.2)));
    chk((wyn.przesz.find(x => x.typ === 'chmura:oaza') || {}).efekt === 'oaza_wzlot', 'oaza (buff) w oknie przewrotu nadal działa', JSON.stringify(wyn.przesz.find(x => x.typ === 'chmura:oaza')));

    /* ---------- (d) podwójne vs pojedyncze stuknięcie, tryby, klawiatura, mysz, duch palca ---------- */
    console.log('(d) podwójne stuknięcie vs dwa pojedyncze w trybach 1-3, klawiatura Q/E, mysz');
    const tapy = async (tryb, x, n, gap, k0) => {
      await reset({ tryb, k: k0 === undefined ? 1 : k0, w: 1 }); await ev(() => __okruszek.pauza(false));
      return ev(async ([x, n, gap]) => {
        const O = __okruszek, czekaj = (ms) => new Promise(r => setTimeout(r, ms)), L0 = O.torLog(), m0 = L0.machniecia, p0 = O.przewrotStan().liczniki.przewroty, t0 = performance.now(), mach1 = [];
        for (let i = 0; i < n; i++) { O.dotyk('dol', 1, x, 0.7); O.dotyk('gora', 1, x, 0.7); mach1.push(O.torLog().machniecia - m0); if (i < n - 1) await czekaj(gap); }
        await czekaj(80); O.pauza(true);
        const L = O.torLog(), s = O.stan(), k = O.komorka(), ps = O.przewrotStan();
        return { mach: L.machniecia - m0, przewroty: ps.liczniki.przewroty - p0, dir: ps.dir, kol: k.kol, palce: s.palce, nurkuje: k.nurkuje, drazek: s.drazek.jest, mach1, ms: Math.round(performance.now() - t0) };
      }, [x, n, gap]);
    };
    const D = {};
    D.t1_poj = await tapy(1, 0.75, 1, 0); D.t1_podw = await tapy(1, 0.75, 2, 60); D.t1_podwL = await tapy(1, 0.25, 2, 60); D.t1_dwa = await tapy(1, 0.75, 2, 400);
    D.t2_poj = await tapy(2, 0.25, 1, 0); D.t2_podw = await tapy(2, 0.25, 2, 60); D.t2_dwa = await tapy(2, 0.25, 2, 400); D.t2_podwP = await tapy(2, 0.75, 2, 60);
    D.t3_poj = await tapy(3, 0.25, 1, 0); D.t3_podwL = await tapy(3, 0.25, 2, 60); D.t3_podwP = await tapy(3, 0.75, 2, 60); D.t3_dwa = await tapy(3, 0.75, 2, 400);
    chk(D.t1_poj.mach === 1 && D.t1_poj.przewroty === 0 && D.t1_poj.mach1[0] === 1, 'tryb 1: pojedyncze stuknięcie = machnięcie od razu (bez czekania na drugie), bez przewrotu', JSON.stringify(D.t1_poj));
    chk(D.t1_podw.mach === 1 && D.t1_podw.przewroty === 1 && D.t1_podw.dir === 1 && D.t1_podw.kol === 2, 'tryb 1: podwójne stuknięcie po prawej (60 ms) = machnięcie + przewrót w prawo, kolumna 2', JSON.stringify(D.t1_podw));
    chk(D.t1_podwL.przewroty === 1 && D.t1_podwL.dir === -1 && D.t1_podwL.kol === 0, 'tryb 1: podwójne po lewej = przewrót w lewo, kolumna 0', JSON.stringify(D.t1_podwL));
    chk(D.t1_dwa.mach === 2 && D.t1_dwa.przewroty === 0, 'tryb 1: dwa pojedyncze stuknięcia (400 ms) = dwa machnięcia, bez przewrotu', JSON.stringify(D.t1_dwa));
    chk(D.t2_poj.mach === 1 && D.t2_poj.kol === 0 && D.t2_poj.przewroty === 0, 'tryb 2: pojedyncze lewym = lewe skrzydło (kolumna 0 + machnięcie) od razu', JSON.stringify(D.t2_poj));
    chk(D.t2_podw.przewroty === 1 && D.t2_podw.dir === -1 && D.t2_podw.kol === 0 && D.t2_podw.mach === 1, 'tryb 2: podwójne lewym kciukiem = przewrót w lewo (kolumna już przesunięta pierwszym stuknięciem nie przesuwa się drugi raz)', JSON.stringify(D.t2_podw));
    chk(D.t2_podwP.przewroty === 1 && D.t2_podwP.dir === 1 && D.t2_podwP.kol === 2, 'tryb 2: podwójne prawym = przewrót w prawo', JSON.stringify(D.t2_podwP));
    chk(D.t2_dwa.mach === 2 && D.t2_dwa.przewroty === 0, 'tryb 2: dwa pojedyncze (400 ms) = dwa machnięcia', JSON.stringify(D.t2_dwa));
    chk(D.t3_poj.mach === 0 && D.t3_poj.przewroty === 0, 'tryb 3: pojedyncze stuknięcie obszaru drążka nic nie robi (jak dotąd)', JSON.stringify(D.t3_poj));
    chk(D.t3_podwL.przewroty === 1 && D.t3_podwL.dir === -1 && D.t3_podwL.kol === 0, 'tryb 3: podwójne lewą połową (drążek) = przewrót w lewo', JSON.stringify(D.t3_podwL));
    chk(D.t3_podwP.przewroty === 1 && D.t3_podwP.dir === 1 && D.t3_podwP.mach === 1 && D.t3_podwP.kol === 2, 'tryb 3: podwójne prawą połową = machnięcie + przewrót w prawo', JSON.stringify(D.t3_podwP));
    chk(D.t3_dwa.mach === 2 && D.t3_dwa.przewroty === 0, 'tryb 3: dwa pojedyncze prawą (400 ms) = dwa machnięcia', JSON.stringify(D.t3_dwa));
    chk(Object.values(D).every(d => d.palce === 0 && !d.nurkuje && !d.drazek), 'po każdym geście brak ducha palca (palce 0, bez nurkowania, bez drążka)', JSON.stringify(Object.values(D).map(d => [d.palce, d.nurkuje, d.drazek])));
    await reset({ tryb: 1 }); await ev(() => __okruszek.pauza(false));
    await pg.keyboard.press('q'); await sleep(60);
    const K1 = await ev(() => { const O = __okruszek, p = O.przewrotStan(); return { przewroty: p.liczniki.przewroty, dir: p.dir, kol: O.komorka().kol }; });
    await sleep(1350); await pg.keyboard.press('e'); await sleep(60);
    const K2 = await ev(() => { const O = __okruszek, p = O.przewrotStan(); O.pauza(true); return { przewroty: p.liczniki.przewroty, dir: p.dir, kol: O.komorka().kol }; });
    chk(K1.przewroty === 1 && K1.dir === -1 && K1.kol === 0 && K2.przewroty === 2 && K2.dir === 1 && K2.kol === 1, 'klawiatura: Q = przewrót w lewo, E = w prawo', JSON.stringify({ K1, K2 }));
    await ev(() => { __okruszek.pauza(true); }); await pg.keyboard.press('q'); await sleep(40);
    const K3 = await ev(() => __okruszek.przewrotStan().liczniki.przewroty);
    chk(K3 === 2, 'w pauzie Q nie robi przewrotu');
    await reset({ tryb: 1 }); await ev(() => __okruszek.pauza(false));
    await pg.mouse.move(300, 600); await pg.mouse.down(); await sleep(30); await pg.mouse.up(); await sleep(70); await pg.mouse.down(); await sleep(30); await pg.mouse.up(); await sleep(80);
    const M1 = await ev(() => { const O = __okruszek, p = O.przewrotStan(); O.pauza(true); return { przewroty: p.liczniki.przewroty, dir: p.dir, kol: O.komorka().kol, mach: O.torLog().machniecia }; });
    chk(M1.przewroty === 1 && M1.dir === 1 && M1.kol === 2 && M1.mach >= 1, 'mysz: podwójny klik po prawej = machnięcie + przewrót w prawo', JSON.stringify(M1));

    /* ---------- (e) bot-unikacz ---------- */
    console.log('(e) bot z przewrotem (unik) wobec tego samego bota bez przewrotu');
    wyn.boty = await ev(([BOT]) => {
      const O = __okruszek, out = [];
      const mk = (seed, roll) => {
        const baza = (0, eval)(BOT + '(' + JSON.stringify({ seed, pWiatr: 0.7, unik: 0.95, reakcja: 1.4, precyzja: 0, hawkNotice: 0 }) + ')');
        return (A) => {
          const r = baza(A) || {};
          if (roll && A.haw && A.haw.cel && A.przewrot && A.przewrot.gotowy && A.przewrot.hitAt !== null && A.haw.cel[2] >= A.hawLock && A.przewrot.hitAt - A.haw.cel[2] <= 0.22 && (A.hawCele || []).some(q => q[0] === A.kom.kol && q[1] === A.kom.wiersz)) {
            const k = A.kom.kol, dir = k === 0 ? 1 : (k === A.COLS - 1 ? -1 : ((A.hawCele || []).some(q => q[0] === k + 1) ? -1 : 1));
            return { przewrot: dir };
          }
          return r;
        };
      };
      for (const seed of [11, 12, 13, 14, 15]) for (const roll of [false, true]) {
        O.panel(false); O.pauza(true); O.ziarno(seed); O.brama(4); O.odblokuj(); O.ustawEnergie(null); O.bezPradow(false); O.bezPrzeszkod(false); O.nowyBieg();
        const r = O.torSymuluj(240, mk(seed, roll)), L = O.torLog(), p = O.przewrotStan().liczniki;
        out.push({ seed, roll, czas: Math.round(r.graCzas * 10) / 10, koniec: r.tryb === 'gra' ? 'limit' : r.koniec, ataki: L.ataki.map(a => a.wynik).join(','), przewroty: p.przewroty, uniki: p.uniki });
      }
      O.ziarno(0); O.odblokuj(); return out;
    }, [BOT]);
    const bR = wyn.boty.filter(b => b.roll).map(b => b.czas), bN = wyn.boty.filter(b => !b.roll).map(b => b.czas);
    info('biegi (s) bez przewrotu: ' + bN.join('/') + ', z przewrotem: ' + bR.join('/') + '; uniki: ' + wyn.boty.filter(b => b.roll).map(b => b.uniki).join('/'));
    chk(med(bR) > med(bN) && bR.filter((v, i) => v > bN[i]).length >= 4 && wyn.boty.filter(b => b.roll).some(b => b.uniki >= 1), 'bot-unikacz osiąga dłuższy bieg niż bot bez przewrotu (mediana ' + med(bR) + ' s wobec ' + med(bN) + ' s, 5 ziaren K4)', JSON.stringify(wyn.boty));

    /* ---------- (f) drogi ---------- */
    console.log('(f) drogi: kontrast wstęg i cienia, komórka Okruszka, brak obrysów, czytelność przeszkód, przełącznik');
    /* odczyt pikseli z kopii płótna (willReadFrequently), jak w gra_test_z17.cjs: bez ostrzeżenia Canvas2D w konsoli */
    const LUM = `(function (x0, y0, w, h) { const c = document.getElementById('g'), k = c.width / 390, t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0); const d = x.getImageData(Math.round(x0 * k), Math.round(y0 * k), Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))).data; let L = 0; for (let i = 0; i < d.length; i += 4) L += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; return L / (d.length / 4); })`;
    const PUNKT = `(function (c, r, z) { const O = __okruszek, T = O.tor(), v = 844 * T.stale.VP_Y; return [195 + (T.kolumny[c] - 195) * 0.7 / z, v + (T.wiersze[r] - v) * 0.7 / z]; })`;
    wyn.wstegi = [];
    for (const pora of ['dzien', 'noc']) for (const L of [0, 4]) {
      await reset({ pora, L, k: 1, w: 1 });
      wyn.wstegi.push(await ev(([pora, L, LUM, PUNKT]) => {
        const O = __okruszek, lum = eval(LUM), pt = eval(PUNKT), out = { pora, L, d: {} };
        for (const [c, r] of [[0, 0], [2, 0], [1, 2], [0, 2]]) { const p = pt(c, r, 0.9); O.dbg({}); O.kadr19(); const a = lum(p[0] - 6, p[1] - 3, 12, 6); O.dbg({ torDrogi: 1 }); O.kadr19(); const b = lum(p[0] - 6, p[1] - 3, 12, 6); O.dbg({}); out.d[c + ',' + r] = Math.round((a - b) * 10) / 10; }
        return out;
      }, [pora, L, LUM, PUNKT]));
    }
    chk(wyn.wstegi.every(w => w.d['0,0'] >= 3 && w.d['0,0'] <= 50 && w.d['2,0'] >= 3 && w.d['2,0'] <= 50), 'wstęgi górnego wiersza widoczne w dzień i w nocy, L0 i L4 (rozjaśnienie 3-50): ' + wyn.wstegi.map(w => w.pora + 'L' + w.L + ' ' + w.d['0,0'] + '/' + w.d['2,0']).join(', '), JSON.stringify(wyn.wstegi));
    chk(wyn.wstegi.filter(w => w.pora === 'dzien').every(w => w.d['1,2'] <= -3 && w.d['0,2'] <= -3) && wyn.wstegi.filter(w => w.pora === 'noc').every(w => Math.abs(w.d['1,2']) >= 2), 'dolny wiersz: za dnia cień na morzu chmur (pociemnienie >= 3), nocą światło: ' + wyn.wstegi.map(w => w.pora + 'L' + w.L + ' ' + w.d['1,2'] + '/' + w.d['0,2']).join(', '), JSON.stringify(wyn.wstegi));
    wyn.kom = [];
    for (const tryb of [1, 2, 3]) {
      await reset({ tryb, k: 1, w: 0 });
      /* pomiar w drodze (1,0) na głębokości z 1,35 (ok. 55 px nad komórką: poza rysunkiem ptaszka, który stoi w (1,0)) */
      const a = await ev(([LUM, PUNKT]) => { const O = __okruszek, lum = eval(LUM), pt = eval(PUNKT), p = pt(1, 0, 1.35); O.dbg({}); O.kadr19(); const x = lum(p[0] - 6, p[1] - 3, 12, 6); O.dbg({ torDrogi: 1 }); O.kadr19(); const y = lum(p[0] - 6, p[1] - 3, 12, 6); O.dbg({}); return x - y; }, [LUM, PUNKT]);
      await reset({ tryb, k: 1, w: 2 });
      const b = await ev(([LUM, PUNKT]) => { const O = __okruszek, lum = eval(LUM), pt = eval(PUNKT), p = pt(1, 0, 1.35); O.dbg({}); O.kadr19(); const x = lum(p[0] - 6, p[1] - 3, 12, 6); O.dbg({ torDrogi: 1 }); O.kadr19(); const y = lum(p[0] - 6, p[1] - 3, 12, 6); O.dbg({}); return x - y; }, [LUM, PUNKT]);
      wyn.kom.push({ tryb, ptak: Math.round(a * 10) / 10, daleka: Math.round(b * 10) / 10 });
    }
    chk(wyn.kom.every(k => k.ptak > k.daleka * 1.3 && k.daleka >= 1.5), 'komórka Okruszka wyraźniejsza od dalekiej (droga (1,0) z ptaszkiem w (1,0) wobec ptaszka w (1,2)) w trybach 1-3: ' + wyn.kom.map(k => k.ptak + ' > ' + k.daleka).join(', '), JSON.stringify(wyn.kom));
    wyn.kontrast = await ev(([LUM]) => {
      const O = __okruszek, out = [];
      function lumy(x, y, w, h) { const c = document.getElementById('g'), k = c.width / 390, t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const cx = t.getContext('2d', { willReadFrequently: true }); cx.drawImage(c, 0, 0); const d = cx.getImageData(Math.round(x * k), Math.round(y * k), Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))).data, a = []; const lin = v => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; for (let i = 0; i < d.length; i += 4) a.push(0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2])); return a.sort((p, q) => p - q); }
      for (const pora of ['swit', 'dzien', 'zachod', 'noc']) for (const L of [0, 5]) for (const w of [0, 1, 2]) {
        O.panel(false); O.pauza(true); O.brama(1); O.odblokuj(); O.bezPradow(true); O.bezPrzeszkod(true); O.nowyBieg(); O.ustawPore(pora); O.ustawPoziom(L); O.torSymuluj(0.1); O.idz(1, w, true); O.kadr19();
        const q = O.cienOkruszka(); O.dbg({ torCien: 1 }); O.kadr19(); const a = lumy(q.x - 8, q.y - 2, 16, 4); O.dbg({}); O.kadr19(); const b = lumy(q.x - 8, q.y - 2, 16, 4);
        const la = a[a.length >> 1], lb = b[b.length >> 1]; out.push({ pora, L, w, cien: Math.round((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05) * 100) / 100 });
      }
      O.odblokuj(); return out;
    }, [LUM]);
    chk(wyn.kontrast.every(x => x.cien >= 2), 'cień Okruszka >= 2:1 w 4 porach x L0/L5 x 3 wiersze, z drogami (najmniej ' + Math.min(...wyn.kontrast.map(x => x.cien)) + ':1)', JSON.stringify(wyn.kontrast.filter(x => x.cien < 2)));
    wyn.linie = [];
    for (const pora of ['dzien', 'noc']) {
      await reset({ pora, L: 0, k: 1, w: 1 });
      wyn.linie.push(await ev(([pora, M]) => { const O = __okruszek, m = eval('(' + M + ')'); O.dbg({ torDrogi: 1 }); O.kadr19(); const off = m(); O.dbg({}); O.kadr19(); const on = m(); O.torSiatka(true); O.kadr19(); const si = m(); O.torSiatka(false); O.kadr19(); return { pora, off, on, siatka: si }; }, [pora, MIERZ.toString()]));
    }
    chk(wyn.linie.every(l => l.on.grz - l.off.grz <= 0.0015 && l.on.dol - l.off.dol <= 0.0025 && l.on.grz < l.siatka.grz * 0.6), 'drogi bez prostokątnych obrysów: cienkie jasne linie (grz) +' + wyn.linie.map(l => (l.on.grz - l.off.grz).toFixed(4)).join('/') + ' <= 0,0015 i wobec ?siatka=1 ' + wyn.linie.map(l => l.on.grz.toFixed(4) + '<' + l.siatka.grz.toFixed(4)).join('/') + ', ciemne (dol) +' + wyn.linie.map(l => (l.on.dol - l.off.dol).toFixed(4)).join('/') + ' <= 0,0025', JSON.stringify(wyn.linie));
    await reset({ pora: 'dzien', L: 2, k: 1, w: 2 });
    wyn.przeszkoda = await ev(([LUM]) => {
      const O = __okruszek, lum = eval(LUM);
      O.zdarzenie('chmura:szara', { k: 1, w: 0, z: 1.3 }); O.torSymuluj(0.01);
      const g = O.gdzie().find(q => q.typ === 'chmura:szara'), w = 46 * g.skala, h = 30 * g.skala;
      const pomiar = () => { O.kadr19(); const inn = lum(g.ex - w / 2, g.ey - h / 2, w, h), outT = lum(g.ex - w, g.ey - h * 1.6, w * 2, h * 0.5), outB = lum(g.ex - w, g.ey + h * 1.1, w * 2, h * 0.5); return { inn, out: (outT + outB) / 2, k: Math.abs(inn - (outT + outB) / 2) }; };
      O.dbg({ torDrogi: 1 }); const a = pomiar(); O.dbg({}); const b = pomiar();
      return { bez: a, z: b, ex: g.ex, ey: g.ey, skala: g.skala, zmiana: a.k > 0 ? Math.abs(b.k - a.k) / a.k : 0 };
    }, [LUM]);
    chk(wyn.przeszkoda.bez.k >= 4 && wyn.przeszkoda.zmiana <= 0.25, 'czytelność przeszkody w drodze (chmura szara w górnym wierszu): kontrast z otoczeniem ' + r2(wyn.przeszkoda.bez.k) + ' bez dróg, ' + r2(wyn.przeszkoda.z.k) + ' z drogami (zmiana ' + Math.round(wyn.przeszkoda.zmiana * 100) + '% <= 25%)', JSON.stringify(wyn.przeszkoda));
    /* przełącznik: panel w torze, nie na ekranie startu, nie w swobodnym locie; zapis i przeładowanie */
    await reset({ pora: 'dzien', L: 0, k: 1, w: 1 });
    await ev(() => __okruszek.panel(true)); await sleep(150);
    const PB = await pg.evaluate(() => { const b = document.getElementById('drogi'); return { jest: !!b, widoczny: !!b && !b.hidden && getComputedStyle(b).display !== 'none', tekst: b && b.textContent, pressed: b && b.getAttribute('aria-pressed'), wys: b ? b.getBoundingClientRect().height : 0 }; });
    chk(PB.jest && PB.widoczny && PB.pressed === 'true' && /widoczne/.test(PB.tekst) && PB.wys >= 44, 'panel w torze: przełącznik „Drogi toru” widoczny, włączony, >= 44 px (' + PB.tekst + ', ' + Math.round(PB.wys) + ' px)', JSON.stringify(PB));
    await pg.locator('#drogi').click(); await sleep(100);
    const PO = await ev(([LUM, PUNKT]) => { const O = __okruszek, lum = eval(LUM), pt = eval(PUNKT); O.panel(false); O.kadr19(); const p = pt(0, 0, 0.9), a = lum(p[0] - 6, p[1] - 3, 12, 6); O.dbg({ torDrogi: 1 }); O.kadr19(); const b = lum(p[0] - 6, p[1] - 3, 12, 6); O.dbg({}); return { drogi: O.drogi(), zapis: O.zapisPodglad().drogi, tekst: document.getElementById('drogi').textContent, roznica: Math.abs(a - b) }; }, [LUM, PUNKT]);
    chk(PO.drogi === false && PO.zapis === 0 && /ukryte/.test(PO.tekst) && PO.roznica < 0.5, 'kliknięcie wyłącza drogi (obraz jak z wyłączonym rysunkiem) i zapisuje wybór (zapis.drogi = 0)', JSON.stringify(PO));
    await pg.reload(); await pg.waitForFunction(() => !!window.__okruszek); await sleep(200);
    const PR = await ev(() => __okruszek.drogi());
    chk(PR === false, 'wyłączenie dróg zachowane po przeładowaniu');
    await ev(() => __okruszek.drogi(true));
    chk(await ev(() => __okruszek.drogi() && __okruszek.zapisPodglad().drogi === 1), 'hak drogi(true) włącza i zapisuje');
    { const p2 = await ctx.newPage(); await p2.goto(base + '?test&tor=1&seed=23&start'); await p2.waitForFunction(() => !!window.__okruszek); await sleep(300);
      const s1 = await p2.evaluate(() => { const b = document.getElementById('drogi'); return { panel: __okruszek.stan().panel, ukryty: !b || b.hidden || getComputedStyle(b).display === 'none' }; }); await p2.close();
      const p3 = await ctx.newPage(); await p3.goto(base + '?test&seed=23'); await p3.waitForFunction(() => !!window.__okruszek); await p3.evaluate(() => __okruszek.panel(true)); await sleep(200);
      const s2 = await p3.evaluate(() => { const b = document.getElementById('drogi'); return { panel: __okruszek.stan().panel, ukryty: !b || b.hidden || getComputedStyle(b).display === 'none' }; }); await p3.close();
      chk(s1.panel && s1.ukryty && s2.panel && s2.ukryty, 'przełącznik dróg nie zmienia ekranu startu (ukryty) i nie pokazuje się w swobodnym locie', JSON.stringify({ start: s1, swobodny: s2 })); }

    /* ---------- (g) unoszenie ---------- */
    console.log('(g) unoszenie: wznoszenie po machnięciach i po wietrze bez skoku, dyszki przy szybowaniu');
    await reset({ k: 1, w: 2, s: 0.1 });
    wyn.wzlot = await ev(() => {
      const O = __okruszek, ys = [], rows = [];
      for (let i = 0; i < 150; i++) { if (i === 0 || i === 21) O.stuknij(); O.torSymuluj(1 / 60); O.kadr19(1 / 60); ys.push(O.unoszenie().ekranY); rows.push(O.komorka().wiersz); }
      const kroki = ys.map((y, i) => i ? Math.abs(y - ys[i - 1]) : 0), iRow = rows.indexOf(1), yEnd = ys[ys.length - 1], y0 = ys[0];
      let i90 = -1; for (let i = iRow; i < ys.length; i++) if (y0 - ys[i] >= 0.9 * (y0 - yEnd)) { i90 = i; break; }
      return { maxKrok: Math.max(...kroki), wzrost: y0 - yEnd, iRow, t90: (i90 - iRow) / 60, wiersz: rows[rows.length - 1], ys: ys.filter((_, i) => i % 10 === 0).map(v => Math.round(v)) };
    });
    chk(wyn.wzlot.wiersz === 1 && wyn.wzlot.wzrost >= 90 && wyn.wzlot.maxKrok <= 10 && wyn.wzlot.t90 >= 0.25, 'po dwóch machnięciach wiersz 2 -> 1: wznoszenie ' + Math.round(wyn.wzlot.wzrost) + ' px bez skoku (najwyżej ' + r2(wyn.wzlot.maxKrok) + ' px na klatkę <= 10), 90% drogi po ' + r2(wyn.wzlot.t90) + ' s >= 0,25', JSON.stringify(wyn.wzlot));
    await reset({ k: 1, w: 2, s: 0.1 });
    wyn.wiatr = await ev(() => {
      const O = __okruszek, sp = O.tor().sp, ys = [], rows = [];
      O.zdarzenie('wiatr:gora1', { k: 1, w: 2, z: 0.7 + sp * 0.5 });
      for (let i = 0; i < 150; i++) { O.torSymuluj(1 / 60); O.kadr19(1 / 60); ys.push(O.unoszenie().ekranY); rows.push(O.komorka().wiersz); }
      const kroki = ys.map((y, i) => i ? Math.abs(y - ys[i - 1]) : 0), iRow = rows.indexOf(1), y0 = ys[Math.max(0, iRow - 1)], yEnd = ys[ys.length - 1];
      let i90 = -1; for (let i = iRow; i < ys.length; i++) if (y0 - ys[i] >= 0.9 * (y0 - yEnd)) { i90 = i; break; }
      return { maxKrok: Math.max(...kroki), wzrost: y0 - yEnd, iRow, t90: (i90 - iRow) / 60, wiersz: rows[rows.length - 1], wloty: O.stan().wloty };
    });
    chk(wyn.wiatr.wloty === 1 && wyn.wiatr.wiersz === 1 && wyn.wiatr.wzrost >= 90 && wyn.wiatr.maxKrok <= 12 && wyn.wiatr.t90 >= 0.3, 'po wietrze w górę: wzlot ' + Math.round(wyn.wiatr.wzrost) + ' px płynny (najwyżej ' + r2(wyn.wiatr.maxKrok) + ' px na klatkę <= 12), 90% po ' + r2(wyn.wiatr.t90) + ' s >= 0,3', JSON.stringify(wyn.wiatr));
    await reset({ k: 1, w: 1 });
    wyn.dysz = await ev(() => { const O = __okruszek, d = [], ys = []; for (let i = 0; i < 300; i++) { O.torSymuluj(1 / 60); O.kadr19(1 / 60); const u = O.unoszenie(); d.push(u.dysz); ys.push(u.ekranY); } const kd = d.map((v, i) => i ? Math.abs(v - d[i - 1]) : 0); return { max: Math.max(...d), krokMax: Math.max(...kd), start: d[0], wiersze: O.komorka().wiersz }; });
    chk(wyn.dysz.max >= 4 && wyn.dysz.krokMax <= 2 && wyn.dysz.start === 0, 'dyszki unoszenia przy szybowaniu: uniesienie do ' + r2(wyn.dysz.max) + ' px >= 4, ciągłe (krok <= ' + r2(wyn.dysz.krokMax) + ' px), zero na starcie', JSON.stringify(wyn.dysz));
    await pg.emulateMedia({ reducedMotion: 'reduce' }); await pg.waitForFunction(() => matchMedia('(prefers-reduced-motion: reduce)').matches); await sleep(60); await reset({ k: 1, w: 1 });
    const DR = await ev(() => { const O = __okruszek; let m = 0; for (let i = 0; i < 300; i++) { O.torSymuluj(1 / 60); O.kadr19(1 / 60); m = Math.max(m, O.unoszenie().dysz); } return m; });
    await pg.emulateMedia({ reducedMotion: 'no-preference' }); await pg.waitForFunction(() => !matchMedia('(prefers-reduced-motion: reduce)').matches); await sleep(60);
    chk(DR === 0, 'reduced-motion: bez dyszek (' + DR + ')');

    /* ---------- (h) zrzuty ---------- */
    console.log('(h) zrzuty 390x844 (zrzuty-z21)');
    for (const str of ['prawo', 'lewo']) for (let i = 0; i < 6; i++) {
      await reset({ pora: 'dzien', L: 2, k: 1, w: 1 });
      const pe = await ev(([i, str]) => { const O = __okruszek; O.przewrot(str); const n = Math.round(i * 0.35 / 5 / (1 / 60)); for (let k = 0; k < n; k++) O.torSymuluj(1 / 60); O.kadr19(1 / 60); return O.ptakEkran(); }, [i, str]);
      await pg.screenshot({ path: path.join(dir, 'przewrot-' + str + '-' + i + '.png'), clip: { x: Math.max(0, Math.min(190, pe.x - 100)), y: pe.y - 130, width: 200, height: 260 } });
    }
    for (const pora of ['dzien', 'noc']) for (const L of [0, 1, 2, 3, 4]) {
      await reset({ pora, L, k: 1, w: 1 }); await ev(() => { __okruszek.zdarzenie('chmura:lawenda', { k: 0, w: 0, z: 1.4 }); __okruszek.zdarzenie('wiatr:gora', { k: 2, w: 2, z: 1.9 }); __okruszek.torSymuluj(0.02); __okruszek.kadr19(); });
      await pg.screenshot({ path: path.join(dir, 'drogi-' + pora + '-L' + L + '.png') });
    }
    for (const pora of ['dzien', 'noc']) { await reset({ pora, L: 0, k: 0, w: 2 }); await pg.screenshot({ path: path.join(dir, 'cien-' + pora + '.png') }); }
    await reset({ k: 1, w: 2, s: 0.1 });
    for (let i = 0; i < 4; i++) { await ev((i) => { const O = __okruszek; if (i === 0) { O.stuknij(); O.torSymuluj(0.35); O.stuknij(); } for (let k = 0; k < 9; k++) { O.torSymuluj(1 / 60); O.kadr19(1 / 60); } }, i); await pg.screenshot({ path: path.join(dir, 'wznoszenie-' + i + '.png'), clip: { x: 0, y: 380, width: 390, height: 340 } }); }
    const cpu = await ev(() => { const O = __okruszek; O.panel(false); O.pauza(true); O.brama(1); O.odblokuj(); O.nowyBieg(); O.ustawPoziom(2); O.idz(1, 1, true); const r = {}; for (const on of [true, false]) { O.drogi(on); O.zerujCpu(); for (let i = 0; i < 90; i++) { O.torSymuluj(1 / 60); O.kadr19(1 / 60); } r[on ? 'z' : 'bez'] = O.cpu(); } O.drogi(true); return r; });
    info('czas rysowania klatki (ms, 90 klatek, headless bez GPU, to NIE jest pomiar telefonu): z drogami p50 ' + cpu.z.p50 + ' / p95 ' + cpu.z.p95 + ', bez dróg p50 ' + cpu.bez.p50 + ' / p95 ' + cpu.bez.p95);
    chk(cpu.z.p50 <= cpu.bez.p50 + 4, 'drogi nie dokładają więcej niż 4 ms do mediany czasu rysowania (' + cpu.z.p50 + ' wobec ' + cpu.bez.p50 + ' ms)');
    fs.writeFileSync(path.join(dir, 'pomiary.json'), JSON.stringify(wyn, null, 1));
    const real = errors.filter(e => !/favicon/i.test(e));
    chk(real.length === 0, 'brak błędów i ostrzeżeń konsoli', real.slice(0, 4).join(' | '));
  } finally { await br.close(); }
  console.log(fail ? ('TEST Z21 NIE PRZESZEDŁ (' + fail + ')') : 'TEST Z21 OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST Z21 BŁĄD: ' + (e && e.stack || e)); process.exit(2); });
