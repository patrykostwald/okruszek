/* QA runda 1, punkt B: trzy tryby sterowania w torze prawdziwymi gestami dotyku (CDP), ?test&tor=1.
   Część 1: scenariusze ruchów (8 kierunków, machnięcie, szybowanie, nurkowanie + wybicie), opóźnienie, duch palca, 2 i 3 palce, zmiana trybu w locie, czułość.
   Część 2 (argument "bot" i minuty, np. node qa/qa_b_sterowanie.cjs bot 5): bot dotykowy w każdym trybie przez N minut czasu rzeczywistego.
   Wynik: qa/wynik_b.json (część 1) i qa/wynik_b_bot.json (część 2). */
const { serwer, przegladarka, dotykCDP, sleep, zapiszJson, ZRZUTY, path } = require('./wspolne.cjs');
const PORT = 8732, BASE = 'http://127.0.0.1:' + PORT + '/';
const TRYB_BOT = process.argv[2] === 'bot', MIN = +(process.argv[3] || 5);
const R = {};
const log = (k, v) => { R[k] = v; console.log(k, JSON.stringify(v)); };

(async () => {
  const srv = await serwer(PORT);
  const br = await przegladarka();
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  const bledy = [];
  pg.on('pageerror', e => bledy.push('pageerror: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') bledy.push(m.type() + ': ' + m.text()); });
  await pg.goto(BASE + '?test&tor=1&seed=31', { waitUntil: 'load' }); await sleep(800);
  const cdp = await ctx.newCDPSession(pg); const T = dotykCDP(cdp);
  const ev = (f, a) => pg.evaluate(f, a);
  /* instrumentacja: czas ostatniego zdarzenia wskaźnika i chwila zmiany stanu (rAF) */
  await ev(() => {
    const O = window.__okruszek; window.__qa = { ev: [], zm: [] };
    ['pointerdown', 'pointermove', 'pointerup'].forEach(n => window.addEventListener(n, e => { window.__qa.ev.push({ n, t: performance.now() }); if (window.__qa.ev.length > 400) window.__qa.ev.shift(); }, true));
    let p = null;
    const krok = () => { const k = O.komorka(), L = O.torLog(), s = { kol: k.kol, w: k.wiersz, m: L.machniecia, d: k.nurkowanie, wz: L.wzloty, wb: L.wybicia };
      if (p && (s.kol !== p.kol || s.w !== p.w || s.m !== p.m || s.d !== p.d || s.wb !== p.wb)) window.__qa.zm.push({ t: performance.now(), s, p }); p = s; requestAnimationFrame(krok); };
    requestAnimationFrame(krok);
  });
  const reset = async (tryb, kol = 1, w = 1, sens = 1) => ev(([tryb, kol, w, sens]) => { const O = window.__okruszek; O.pauza(false); O.panel(false); O.sterowanie(tryb); O.czulosc(sens); O.bezPrzeszkod(true); O.bezPradow(true); O.odblokuj(); O.nowyBieg(); O.idz(kol, w, true); window.__qa.zm.length = 0; window.__qa.ev.length = 0; return O.komorka(); }, [tryb, kol, w, sens]);
  const kom = () => ev(() => { const k = window.__okruszek.komorka(), L = window.__okruszek.torLog(); return { kol: k.kol, w: k.wiersz, p: +k.p.toFixed(2), lift: +k.wzlot.toFixed(2), nurk: k.nurkowanie, mach: L.machniecia, wzloty: L.wzloty, wybicia: L.wybicia, nurkowania: L.nurkowania, palce: window.__okruszek.stan().palce, tryb: window.__okruszek.stan().tryb }; });
  const opoz = () => ev(() => { const q = window.__qa, out = []; q.zm.forEach(z => { const e = q.ev.filter(x => x.t <= z.t).pop(); if (e) out.push(Math.round(z.t - e.t)); }); return out; });
  /* gesty */
  const swipe = async (x, y, dx, dy, ms = 60, id = 1) => { await T('touchStart', [[id, x, y]]); const n = 5; for (let k = 1; k <= n; k++) { await T('touchMove', [[id, x + dx * k / n, y + dy * k / n]]); await sleep(ms / n); } await T('touchEnd', []); };
  const tap = async (x, y, ms = 50, id = 1) => { await T('touchStart', [[id, x, y]]); await sleep(ms); await T('touchEnd', []); };
  const hold = async (pts, ms) => { await T('touchStart', pts); await sleep(ms); await T('touchEnd', []); };

  /* ---------- tryb 1 ---------- */
  const t1 = {};
  const kier = { P: [60, 0], L: [-60, 0], D: [0, 60], G: [0, -60], PG: [55, -55], LG: [-55, -55], PD: [55, 55], LD: [-55, 55] };
  for (const [n, [dx, dy]] of Object.entries(kier)) { await reset(1, 1, 1); await swipe(195, 600, dx, dy); await sleep(80); t1[n] = await kom(); }
  log('B1_osiem_kierunkow_ze_srodka', Object.fromEntries(Object.entries(t1).map(([k, v]) => [k, 'k' + v.kol + 'w' + v.w + ' mach' + v.mach])));
  /* do góry: ile stuknięć na wiersz (środek -> góra), rytm 0,3 s vs spam 0,08 s */
  await reset(1, 1, 1); let n = 0; for (; n < 8; n++) { await tap(195, 600); await sleep(250); if ((await kom()).w === 0) break; }
  log('B1_stukniec_na_wiersz_gora_rytm', n + 1);
  await reset(1, 1, 2); n = 0; for (; n < 8; n++) { await tap(195, 600); await sleep(250); if ((await kom()).w === 1) break; }
  log('B1_stukniec_dol_do_srodka_rytm', n + 1);
  await reset(1, 1, 2); n = 0; for (; n < 12; n++) { await tap(195, 600, 30); await sleep(40); if ((await kom()).w === 1) break; }
  log('B1_stukniec_dol_do_srodka_spam', n + 1);
  /* szybowanie: bez dotyku, ile s do wiersza w dół */
  await reset(1, 1, 0); const tg = Date.now(); let wz = 0; while (Date.now() - tg < 9000) { const k = await kom(); if (k.w !== wz) { log('B1_szybowanie_wiersz_w_dol_po_s', (Date.now() - tg) / 1000); break; } await sleep(50); }
  /* nurkowanie i wybicie */
  await reset(1, 1, 0); await T('touchStart', [[1, 195, 600]]); const nk = []; for (let i = 0; i < 8; i++) { await sleep(100); nk.push((await kom()).w); } await T('touchEnd', []); await sleep(150); const po = await kom();
  log('B1_nurkowanie_przytrzymanie_0_8s', { wiersze_co_100ms: nk, po_puszczeniu: 'w' + po.w, wybicia: po.wybicia });
  /* „położony kciuk”: palec leży 0,3 s, potem przesunięcie w bok -> czy skręca? */
  await reset(1, 1, 1); await T('touchStart', [[1, 195, 600]]); await sleep(300); for (let k = 1; k <= 5; k++) { await T('touchMove', [[1, 195 + 12 * k, 600]]); await sleep(12); } await sleep(60); const pk = await kom(); await T('touchEnd', []);
  log('B1_kciuk_lezy_0_3s_potem_w_bok', { kol: pk.kol, w: pk.w, nurk: pk.nurk, uwaga: pk.kol === 1 ? 'BRAK SKRĘTU (przytrzymanie zamieniło się w nurkowanie)' : 'skręt' });
  /* opóźnienie: swipe w bok, stuknięcie */
  await reset(1, 1, 1); await swipe(195, 600, 60, 0); await sleep(100); const opS = await opoz();
  await reset(1, 1, 1); await tap(195, 600, 40); await sleep(100); const opT = await opoz();
  log('B1_opoznienie_ms_stan', { przesuniecie: opS, stukniecie_od_puszczenia: opT, uwaga: 'machnięcie liczy się przy puszczeniu palca; nurkowanie po HOLD_T 0,2 s; ruch obrazu 95% w ok. 0,2 s (MOVE_TAU 0,065)' });
  /* czułość: krótki ruch 30 px przy 0,5 / 1 / 1,5 */
  const czul = {}; for (const c of [0.5, 1, 1.5]) { await reset(1, 1, 1, c); await swipe(195, 600, 30, 0); await sleep(80); czul[c] = (await kom()).kol; }
  log('B1_czulosc_ruch_30px_kolumna', czul);
  /* duch palca: start bez końca, potem touchCancel; potem nowy palec główny */
  await reset(1, 1, 0); await T('touchStart', [[1, 195, 600]]); await sleep(400); const d1 = await kom(); await T('touchCancel', []); await sleep(200); const d2 = await kom();
  await T('touchStart', [[5, 195, 600]]); await sleep(40); await T('touchEnd', []); await sleep(200); const d3 = await kom();
  log('B1_duch_palca', { trzyma_przed: d1.nurk, palce_przed: d1.palce, po_cancel_nurk: d2.nurk, palce_po: d2.palce, nowy_palec_palce: d3.palce });
  /* utrata fokusu w trakcie przytrzymania (blur) */
  await reset(1, 1, 0); await T('touchStart', [[1, 195, 600]]); await sleep(350); await ev(() => window.dispatchEvent(new Event('blur'))); await sleep(100); const bl = await kom(); await T('touchEnd', []);
  log('B1_blur_w_trakcie', { nurk: bl.nurk, palce: bl.palce });
  /* dwa i trzy palce */
  await reset(1, 1, 0); await T('touchStart', [[1, 120, 600], [2, 270, 600]]); await sleep(400); const p2 = await kom(); await T('touchStart', [[1, 120, 600], [2, 270, 600], [3, 195, 700]]); await sleep(300); const p3 = await kom(); await T('touchEnd', []); await sleep(200); const p0 = await kom();
  log('B1_dwa_trzy_palce', { dwa: { nurk: p2.nurk, palce: p2.palce }, trzy: { nurk: p3.nurk, palce: p3.palce }, po: { nurk: p0.nurk, palce: p0.palce } });

  /* ---------- tryb 2 ---------- */
  const t2 = {};
  await reset(2, 1, 1); await tap(80, 700); await sleep(200); t2.lewe = await kom();
  await reset(2, 1, 1); await tap(310, 700); await sleep(200); t2.prawe = await kom();
  await reset(2, 1, 1); await T('touchStart', [[1, 80, 700], [2, 310, 700]]); await sleep(40); await T('touchEnd', []); await sleep(200); t2.oba = await kom();
  await reset(2, 1, 1); await T('touchStart', [[1, 80, 700]]); await sleep(30); await T('touchStart', [[1, 80, 700], [2, 310, 700]]); await sleep(40); await T('touchEnd', []); await sleep(200); t2.oba_30ms_rozjazd = await kom();
  await reset(2, 1, 1); await T('touchStart', [[1, 80, 700]]); await sleep(120); await T('touchStart', [[1, 80, 700], [2, 310, 700]]); await sleep(40); await T('touchEnd', []); await sleep(200); t2.oba_120ms_rozjazd = await kom();
  await reset(2, 1, 0); await hold([[1, 80, 700], [2, 310, 700]], 450); await sleep(150); t2.przytrzymaj_oba = await kom();
  await reset(2, 1, 0); await hold([[1, 80, 700]], 450); await sleep(150); t2.przytrzymaj_lewy = await kom();
  await reset(2, 1, 1); for (let i = 0; i < 4; i++) { await T('touchStart', [[1, 80, 700], [2, 310, 700]]); await sleep(40); await T('touchEnd', []); await sleep(260); } t2.oba_x4 = await kom();
  log('B2_ruchy', Object.fromEntries(Object.entries(t2).map(([k, v]) => [k, 'k' + v.kol + 'w' + v.w + ' mach' + v.mach + ' wyb' + v.wybicia])));
  await reset(2, 1, 1); await tap(80, 700, 40); await sleep(200); log('B2_opoznienie_ms_stan_lewe', await opoz());
  /* tryb 2: czy da się skręcić w bok BEZ wznoszenia (gdy wzlot zebrany)? lewe x2 na dole */
  await reset(2, 1, 2); await tap(80, 700); await sleep(150); await tap(310, 700); await sleep(150); log('B2_lewe_potem_prawe_z_dolu', await kom());

  /* ---------- tryb 3 ---------- */
  const t3 = {};
  const stick = async (dx, dy, ms = 160) => { await T('touchStart', [[1, 100, 650]]); for (let k = 1; k <= 4; k++) { await T('touchMove', [[1, 100 + dx * k / 4, 650 + dy * k / 4]]); await sleep(15); } await sleep(ms); await T('touchEnd', []); };
  for (const [nm, [dx, dy]] of Object.entries({ P: [50, 0], L: [-50, 0], D: [0, 50], G: [0, -50], PG: [40, -40], LG: [-40, -40], PD: [40, 40], LD: [-40, 40] })) { await reset(3, 1, 1); await stick(dx, dy); await sleep(80); t3[nm] = await kom(); }
  log('B3_osiem_kierunkow_drazek', Object.fromEntries(Object.entries(t3).map(([k, v]) => [k, 'k' + v.kol + 'w' + v.w + ' mach' + v.mach])));
  await reset(3, 1, 1); await stick(55, 0, 1200); log('B3_drazek_trzymany_1_2s_w_prawo', await kom());
  await reset(3, 1, 1); await tap(300, 650); await sleep(150); log('B3_stuk_prawa_polowa', await kom());
  await reset(3, 1, 0); await hold([[1, 300, 650]], 450); await sleep(150); log('B3_przytrzymaj_prawa', await kom());
  await reset(3, 1, 1); await T('touchStart', [[1, 100, 650]]); for (let k = 1; k <= 4; k++) { await T('touchMove', [[1, 100 + 12 * k, 650]]); await sleep(15); } await T('touchStart', [[1, 148, 650], [2, 300, 650]]); await sleep(40); await T('touchEnd', [[2, 300, 650]]); await sleep(100); await T('touchEnd', []); await sleep(100);
  log('B3_drazek_plus_stuk_prawa', await kom());
  await reset(3, 1, 1); await stick(30, 0); await sleep(80); log('B3_wychylenie_30px', await kom());
  /* drążek przy krawędzi: start na x=20 (baza dosuwana), ruch w lewo */
  await reset(3, 1, 1); await T('touchStart', [[1, 20, 800]]); for (let k = 1; k <= 4; k++) { await T('touchMove', [[1, 20 - 4 * k, 800]]); await sleep(15); } await sleep(150); await T('touchEnd', []); log('B3_drazek_krawedz_lewo', await kom());
  const geo = await ev(() => window.__okruszek.stan().drazek); log('B3_drazek_geometria', geo);

  /* ---------- zmiana trybu w locie, z palcem na ekranie ---------- */
  await reset(1, 1, 1); await T('touchStart', [[1, 195, 600]]); await sleep(350); await ev(() => { window.__okruszek.panel(true); }); await sleep(100);
  await pg.click('#ster .tryb[data-tryb="3"]').catch(() => { }); await ev(() => window.__okruszek.panel(false)); await sleep(100); const zm1 = await kom(); await T('touchEnd', []); await sleep(100); const zm2 = await kom();
  log('B_zmiana_trybu_z_palcem', { po_zmianie: zm1, po_puszczeniu: zm2, tryb: await ev(() => window.__okruszek.tryb()) });
  /* klawisz T w locie */
  await reset(1, 1, 1); await pg.keyboard.press('t'); await sleep(100); log('B_klawisz_T', await ev(() => ({ tryb: window.__okruszek.tryb(), ls: (() => { try { return localStorage.getItem('okruszek-sterowanie'); } catch (e) { return 'x'; } })() })));
  /* klawiatura: wszystkie ruchy */
  await ev(() => window.__okruszek.sterowanie(1)); const kl = {};
  for (const [nm, key] of Object.entries({ prawo: 'ArrowRight', lewo: 'ArrowLeft', dol: 'ArrowDown', gora: 'ArrowUp' })) { await reset(1, 1, 1); await pg.keyboard.press(key); await sleep(80); const k = await kom(); kl[nm] = 'k' + k.kol + 'w' + k.w + ' mach' + k.mach; }
  await reset(1, 1, 0); await pg.keyboard.down('s'); await sleep(450); await pg.keyboard.up('s'); await sleep(100); { const k = await kom(); kl.nurk_S = 'w' + k.w + ' wyb' + k.wybicia; }
  log('B_klawiatura', kl);
  log('B_bledy', bledy.slice(0, 10));
  zapiszJson('wynik_b.json', R);

  if (TRYB_BOT) {
    /* ---------- bot dotykowy: N minut na tryb, prawdziwe gesty ---------- */
    const WYN = {};
    for (const tryb of [1, 2, 3]) {
      await ev((tryb) => { const O = window.__okruszek; O.pauza(false); O.panel(false); O.sterowanie(tryb); O.czulosc(1); O.bezPrzeszkod(false); O.bezPradow(false); O.odblokuj(); O.ziarno(40 + tryb); O.brama(1); O.nowyBieg(); window.__qb = { biegi: [], t0: performance.now() }; }, tryb);
      const t0 = Date.now(); const biegi = []; let gesty = 0, ost = null, maxE = 0, pelny = 0, poziomMax = 0;
      while (Date.now() - t0 < MIN * 60000) {
        const A = await ev(() => { const O = window.__okruszek, k = O.komorka(), st = O.stan(); const pl = O.plastry().filter(p => p.z > 1 && !p.kontakt && !p.puste).slice(0, 3); return { k: k.kol, w: k.wiersz, p: k.p, nurk: k.nurkowanie, tryb: st.tryb, E: O.energia(), lvl: st.poziom, dyst: st.dystans, czas: st.graCzas, haw: st.jastrzab, pl: pl.map(p => ({ eta: p.eta, g: p.siatka })), pk: O.pelnyKolor().lacznie }; });
        maxE = Math.max(maxE, A.E); poziomMax = Math.max(poziomMax, A.lvl); pelny = Math.max(pelny, A.pk);
        if (A.tryb !== 'gra') {
          if (A.tryb === 'koniec') { const L = await ev(() => ({ kon: window.__okruszek.torLog().konce.slice(-1)[0], wej: window.__okruszek.torLog().wejscia.length, kont: window.__okruszek.torLog().kontakty.filter(e => e.efekt === 'kara').length })); biegi.push({ czas: +(ost ? ost.czas : 0).toFixed(1), m: Math.round(ost ? ost.dyst : 0), koniec: L.kon && L.kon.typ, kary: L.kont, wiatry: L.wej }); await ev(() => { window.__okruszek.panel(false); window.__okruszek.nowyBieg(); }); }
          await sleep(100); continue;
        }
        ost = A;
        /* decyzja jak BOT_TOR: najbliższy niepusty plaster z eta < 1,6 s */
        const pl = A.pl.find(p => p.eta < 1.7 && p.eta > 0.15);
        let cel = null;
        const wolna = (ch) => ch === '.' || 'UuDF<>ZXo'.indexOf(ch) >= 0, wiatr = (ch) => 'UuDZ<>XF'.indexOf(ch) >= 0;
        if (A.haw && A.haw.faza === 'poscig') cel = { c: A.k === 2 ? 1 : A.k + 1, r: A.w };
        else if (pl) { let best = null; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const ch = pl.g[r][c]; if (!wolna(ch)) continue; if (ch === 'F' && !(c === 1 && r === 1)) continue; const sc = (wiatr(ch) ? 10 : (ch === 'o' ? 4 : 0)) - Math.abs(c - A.k) * 1.5 - Math.max(0, A.w - r) * 2.5 - Math.max(0, r - A.w) * 0.8 - (r === 2 && !wiatr(ch) ? 1.5 : 0); if (!best || sc > best.sc) best = { c, r, sc }; } cel = best; }
        const dc = cel ? Math.sign(cel.c - A.k) : 0, dr = cel ? Math.sign(cel.r - A.w) : 0;
        const goraPotrzeba = dr < 0 || (!cel && (A.w >= 2 || A.p > 0.55)) || (dr === 0 && A.p > 0.6);
        gesty++;
        if (tryb === 1) {
          if (dc || dr > 0) await swipe(195, 600, dc * 55, dr > 0 ? 55 : 0, 50);
          else if (goraPotrzeba) await tap(195, 600, 40);
          else await sleep(60);
        } else if (tryb === 2) {
          if (dc && dr > 0) await hold([[1, dc < 0 ? 80 : 310, 700]], 280);
          else if (dc) await tap(dc < 0 ? 80 : 310, 700, 40);
          else if (dr > 0) await hold([[1, 80, 700], [2, 310, 700]], 300);
          else if (goraPotrzeba) { await T('touchStart', [[1, 80, 700], [2, 310, 700]]); await sleep(40); await T('touchEnd', []); }
          else await sleep(60);
        } else {
          if (dc || dr > 0) await stick(dc * 50, dr > 0 ? 50 : 0, 90);
          else if (goraPotrzeba) await tap(300, 650, 40);
          else await sleep(60);
        }
        await sleep(90);
      }
      const L = await ev(() => { const L = window.__okruszek.torLog(); return { wejscia: L.wejscia.length, idealne: L.wejscia.filter(e => e.idealne).length, kary: L.kontakty.filter(e => e.efekt === 'kara').length, konce: L.konce }; });
      WYN['tryb' + tryb] = { minut: MIN, gesty, biegi, maxE: +maxE.toFixed(2), poziomMax, pelnyKolorS: +pelny.toFixed(1), log: L };
      console.log('BOT tryb', tryb, JSON.stringify(WYN['tryb' + tryb]));
      await pg.screenshot({ path: path.join(ZRZUTY, 'B-bot-tryb' + tryb + '.png') });
    }
    WYN.bledy = bledy.slice(0, 10);
    zapiszJson('wynik_b_bot.json', WYN);
  }
  await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
