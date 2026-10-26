/* Okruszek Z11: testy treści krain K2-K5 (Playwright). Użycie: node gra_test_z11.cjs [plik.html]
   (a) hak i dane: zdarzenie / gdzie / z11 / z11Zbuduj / ptakEkran; KRAINY (prądy krain, przeszkadzajki, finały, zwiastuny); teksty.js; klasy skutku
   (b) każdy element wymuszalny hakiem i widoczny w gdzie(): szpile (5 układów), komin, latawce, poryw, przelot, smuga, wir, tęcza (tecza_ks / teczka), rogal, finał K1-K5, zwiastuny, ulewa, festiwal
   (c) szczeliny: szpile i sznury >= 2,2 / 1,8 / 1,5 szerokości ptaszka (L0-L2 / L3-L4 / L5); kolizja tylko trzonu; niska wieża przelatywalna górą przy h > szczyt + 0,1; skutki S1
   (d) bonusy: komin (wysokość +0,2, s najwyżej +0,5 j., bez łańcucha, nie ponad CAP4, raz, gaśnie 5 s), tęcza (1 prąd + suche piórka, alfa <= 0,35 w L0-L1), poryw (1 prąd),
       smuga = JEDEN prąd w łańcuchu (skok <= 1,5 j., od s >= 0,35), wiry (S1: drżenie, czułość -40% przez 1,2 s, znos <= 1 szerokości ptaszka)
   (e) budżet prędkości: boty z wymuszanymi bonusami (smuga, komin, poryw, tęcza) nigdy L4 bez GATE4 ani L5 bez GATE5; sam komin nigdy L4;
       w krainach K2-K5 z przeszkodami: bot idealny pełny kolor >= 1 raz w 60 s, bot losowy nigdy L4 ani pełnego koloru, bot 50% trójka <= 15% serii
   (f) 400 wymuszeń nowych przeszkód (co piąte nisko): 0 końców biegu
   (g) zapowiedzi: szkic -> kontakt >= 1,5 s (szpile, latawce, ulewa), Wielki przelot >= 2,5 s; na L0, L2, L4, L5 i przy przyspieszeniu L0 -> L5
   (h) kolor: kolejność niebo >= daleko >= blisko >= smugi przy E = 0 / 0,3 / 0,62 / 1 w K2-K5 z elementami na ekranie; przy s = 0 brak czerwieni poza szalikiem (piksele) w K2-K5
   (i) kierunek słońca (świt za plecami, dzień wysoko, zachód przed Okruszkiem); finały i zwiastuny w ruchu (Droga); Rogal (scena w K2, mruga od L3)
   (j) pamięć sprite'ów <= 60 MB; klatki headless z samolotem i 5 wieżami na ekranie nie gorsze niż o 10% od Z5 (BAZA=ścieżka, domyślnie ../gra-okruszek-Z5/index.html);
       CPU x4 tylko jako informacja; brak błędów konsoli. Kończy się "TEST Z11 OK" i kodem 0 tylko wtedy, gdy wszystko przeszło. */
const fs = require('fs'), path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const BOTY = Object.assign({}, require('./boty_z10.cjs'), require('./boty_z3c.cjs'));
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const baza = path.resolve(process.env.BAZA || path.join(__dirname, '..', 'gra-okruszek-Z5', 'index.html'));
const url = 'file:///' + file.replace(/\\/g, '/') + '?test&seed=23';
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const f2 = (v) => (typeof v === 'number' ? v.toFixed(2) : String(v));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const FAST = !!process.env.FAST;
const CZ = process.env.CZESCI ? process.env.CZESCI.split(',') : null, run = (x) => !CZ || CZ.indexOf(x) >= 0;   /* CZESCI=b,d,... uruchamia wybrane części (a, h, j zawsze) */

(async () => {
  console.log('TEST Z11 ' + file);
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const errors = [];
  const watch = (p) => { p.on('pageerror', e => errors.push('pageerror: ' + e)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); }); };
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 }); watch(page);
  await page.goto(url); await page.waitForTimeout(800);
  const ev = (f, a) => page.evaluate(f, a);
  /* czysty stan do testów punktowych: pauza, bez harmonogramu przeszkód i prądów, brama n, poziom L (zablokowana prędkość) albo wolny lot */
  const prep = (o) => ev((o) => { const q = __okruszek; q.pauza(true); q.autopilot(null); q.odblokuj(); q.nurkuj(false); q.przesun(null); q.tempo(1); q.odblokujPore(); q.pomiar(false); q.cichaPomoc(false); q.ziarno(o.z || 0);
    q.bezPradow(o.prady === undefined ? true : !o.prady); q.bezPrzeszkod(o.przeszkody === undefined ? true : !o.przeszkody); q.brama(o.brama || 1); if (o.pora) q.ustawPore(o.pora); if (o.L !== undefined) q.ustawPoziom(o.L); q.ustawWysokosc(o.h || 0.8); q.symuluj(o.rozbieg || 0.3); return q.droga(); }, o || {});

  /* ---------- (a) hak i dane ---------- */
  console.log('(a) hak, KRAINY, teksty, klasy');
  const need = ['zdarzenie', 'gdzie', 'z11', 'z11Zbuduj', 'ptakEkran', 'budzetLog', 'swiatlo', 'zapowiedzi', 'skutki', 'krainy', 'symuluj', 'autopilot', 'trafPrad', 'lancuch', 'stan', 'kolory', 'warstwy', 'ustawEnergie', 'pamiec'];
  const miss = await ev((n) => n.filter(k => typeof __okruszek[k] !== 'function'), need);
  chk(miss.length === 0, 'hak Z11 kompletny (' + need.length + ' funkcji)', 'w haku brakuje: ' + miss.join(', '));
  const KR = await ev(() => __okruszek.krainy());
  chk(KR[1].pradTyp === 'tecza_ks' && KR[2].pradTyp === 'komin' && KR[3].pradTyp === 'poryw' && KR[4].pradTyp === 'smuga', 'nowy typ prądu w każdej krainie: K2 tęcza księżycowa, K3 komin ciepła, K4 poryw latawcowy, K5 smuga');
  chk(KR[2].przeszkody.szpile > 0 && KR[2].przeszkody.mgla > 0 && KR[3].przeszkody.latawce > 0 && KR[3].przeszkody.wiatr >= KR[3].przeszkody.latawiec && KR[4].przeszkody.przelot > 0 && KR[4].przeszkody.stado > 0 && KR[1].przeszkody.deszcz > 0 && KR[1].przeszkody.grad > 0,
    'przeszkadzajki: K2 deszcz + grad, K3 szpile + mgła, K4 festiwal latawców + wiatr boczny (częściej niż sznur z Z3b), K5 Wielki przelot + stado');
  chk(KR.slice(0, 5).map(k => k.final).join() === 'trzy_w_rytmie,ulewa_i_luk,kanion_wiez,festiwal,przelot_olbrzyma', 'finały K1-K5: ' + KR.slice(0, 5).map(k => k.final).join(', '));
  const TX = await ev(() => window.OKRUSZEK_TEKSTY);
  const slowa = (t) => String(t).replace(/^[^:]+: /, '').split(/\s+/).length;
  const zdania = [].concat(Object.values(TX.debiuty), Object.values(TX.finaly), Object.values(TX.zwiastuny), [TX.szepty.swit, TX.szepty.rogal, TX.szepty.gegawa], [2, 3, 4, 5].map(n => TX.krainy[n].tablica));
  chk(zdania.every(z => z && slowa(z) <= 7) && TX.szepty.swit === 'Słońce wstało z tyłu. Jak to?' && /Gę! W lewo!/.test(TX.szepty.gegawa), 'teksty Z11 w teksty.js (' + zdania.length + ' zdań, każde <= 7 słów; szept świtu i Cioci Gęgawy jak w specyfikacji)', 'teksty: ' + JSON.stringify(zdania.filter(z => !z || slowa(z) > 7)));
  const KL = await ev(() => __okruszek.klasy());
  chk(['szpile', 'latawce', 'przelot', 'wir', 'ulewa'].every(k => KL[k] === 1) && KL.tecza === 0 && KL.komin === 0 && Object.keys(KL).filter(k => KL[k] === 3).sort().join() === 'jastrzab,morze,sowa', 'klasy: szpile, sznury festiwalu, wiry, ulewa = S1; tęcza i komin = S0; S3 nadal tylko jastrząb, sowa, morze chmur');

  /* ---------- (b) wymuszenia i gdzie() ---------- */
  if (run('b')) {
  console.log('(b) każdy element wymuszalny hakiem i widoczny w gdzie()');
  const EL = [
    ['szpile', { uklad: 'rzad', dx: 0 }, 'szpile', 3], ['szpile', { uklad: 'aleja', dx: 0 }, 'szpile', 3], ['szpile', { uklad: 'strzala', dx: 0 }, 'szpile', 3], ['szpile', { uklad: 'skos', dx: 0 }, 'szpile', 3], ['szpile', { uklad: 'kanion', dx: 0 }, 'szpile', 3],
    ['komin', { dx: 0 }, 'komin', 3], ['latawce', { dx: 0 }, 'latawce', 4], ['poryw', { dx: 0 }, 'poryw', 4], ['przelot', { dx: 0, wiry: true }, 'przelot', 5], ['przelot', { dx: 0, wiry: true }, 'wir', 5], ['smuga', { dx: 0 }, 'smuga', 5],
    ['tecza_ks', { dx: 0 }, 'tecza', 2], ['teczka', { dx: 0 }, 'tecza', 2], ['rogal', {}, 'rogal', 2], ['ulewa', { dx: 0 }, 'ulewa', 2], ['festiwal', {}, 'festiwal', 4],
    ['final', { kraina: 1 }, 'final', 1], ['final', { kraina: 2 }, 'final', 2], ['final', { kraina: 3 }, 'final', 3], ['final', { kraina: 4 }, 'final', 4], ['final', { kraina: 5 }, 'final', 5],
    ['zwiastun', { kraina: 2 }, 'tecza', 1], ['zwiastun', { kraina: 3 }, 'szpile', 2], ['zwiastun', { kraina: 4 }, 'latawce', 3], ['zwiastun', { kraina: 5 }, 'przelot', 4]];
  const wym = [];
  for (const [nm, opt, typ, br] of EL) {
    await prep({ brama: br, L: 2 });
    const r = await ev(([nm, opt, typ]) => { const o = __okruszek, ret = o.zdarzenie(nm, opt); o.symuluj(0.05); const g = o.gdzie().filter(x => x.typ === typ); return { ret, n: g.length, e: g[0] || null }; }, [nm, opt, typ]);
    wym.push({ nm, typ, ok: r.ret === true && r.n >= 1 && isFinite(r.e.ex) && isFinite(r.e.ey), e: r.e });
  }
  const zle = wym.filter(w => !w.ok);
  chk(zle.length === 0, 'zdarzenie(...) -> true i wpis w gdzie() z położeniem ekranu dla ' + wym.length + ' wymuszeń (' + [...new Set(EL.map(e => e[0]))].join(', ') + ')', 'nie działa: ' + JSON.stringify(zle.map(w => w.nm + '>' + w.typ)));
  const ukl = wym.filter(w => w.nm === 'szpile').map(w => w.e.uklad + ' ' + w.e.wieze.length);
  console.log('  info układy szpil: ' + ukl.join(', ') + '; sylwetki wież: 8 (kod rysuje każdą osobno)');
  /* 8 różnych sylwetek w użyciu (100 losowych wież) */
  await prep({ brama: 3, L: 2 });
  const syl = await ev(() => { const o = __okruszek, s = new Set(); for (let i = 0; i < 40; i++) { o.ziarno(i + 1); o.brama(3); o.zdarzenie('szpile', { uklad: ['rzad', 'aleja', 'skos', 'strzala'][i % 4], dx: 0 }); o.gdzie().filter(x => x.typ === 'szpile').forEach(g => g.wieze.forEach(w => s.add(w.sylwetka))); } o.ziarno(0); return [...s].sort(); });
  chk(syl.length === 8, 'szpile: wszystkie 8 sylwetek występują w grze (' + syl.join(',') + ')', 'sylwetki: ' + syl.join(','));

  }
  /* ---------- (c) szczeliny i kolizje ---------- */
  if (run('c')) {
  console.log('(c) szczeliny, kolizja trzonu, niska wieża, skutki S1');
  const SZ = await ev(() => { const o = __okruszek, out = []; for (const L of [0, 1, 2, 3, 4, 5]) { o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.brama(3); o.ustawPoziom(L); o.symuluj(0.1);
      for (let i = 0; i < 40; i++) { o.zdarzenie(i % 2 ? 'latawce' : 'szpile', { uklad: ['rzad', 'aleja', 'strzala', 'kanion'][i % 4], dx: 0 }); }
      o.gdzie().forEach(g => { if ((g.typ === 'szpile' || g.typ === 'latawce') && g.szczelina !== null && !g.zw) out.push({ L, typ: g.typ, uklad: g.uklad || '', sz: g.szczelina }); }); o.nowyBieg(); } return { out, BW: o.z11().BIRD_W }; });
  const prog = (L) => (L <= 2 ? 2.2 : (L <= 4 ? 1.8 : 1.5)) * SZ.BW;
  const szZle = SZ.out.filter(x => x.sz < prog(x.L) - 1e-6);
  const minPo = [0, 1, 2, 3, 4, 5].map(L => Math.min(...SZ.out.filter(x => x.L === L).map(x => x.sz)) / SZ.BW);
  chk(szZle.length === 0 && SZ.out.length > 200, 'szczeliny między trzonami wież i sznurami (' + SZ.out.length + ' układów): najmniejsza w szerokościach ptaszka L0-L5 = ' + minPo.map(f2).join(' / ') + ' (próg 2,2 / 2,2 / 2,2 / 1,8 / 1,8 / 1,5)', 'za wąskie: ' + JSON.stringify(szZle.slice(0, 4)));
  const KOL = await ev(() => {
    const o = __okruszek, PRAD_DX = 300, out = {};
    const przelec = (uklad, dxW, h, top) => { o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokuj(); o.brama(3); o.nurkuj(true); for (let i = 0; i < 30; i++) { o.ustawWysokosc(0.9); o.symuluj(0.1); } const sk0 = o.skutki().length;   /* prawdziwa prędkość z nurkowania (s ok. 0,5), wysokość trzymana */
      o.zdarzenie('szpile', { uklad: uklad, dx: dxW / PRAD_DX, z: 1.4, top: top }); const g = o.gdzie().find(x => x.typ === 'szpile'); for (let i = 0; i < 40; i++) { o.ustawWysokosc(h); o.symuluj(0.05); }
      o.nurkuj(false); const s = o.skutki().slice(sk0); return { traf: s.length, s: s[0] || null, trzon: g.wieze[0].trzon, pol: g.wieze[0].pol, top: g.wieze[0].top }; };
    const w0 = przelec('wysoka', 0, 0.8); const T = w0.trzon, PP = o.z11().PTAK_POL;
    out.srodek = w0; out.trzonPlus = przelec('wysoka', T + PP + 3, 0.8); out.trzonMinus = przelec('wysoka', T + PP - 3, 0.8);
    out.akwarela = przelec('wysoka', w0.pol - 2, 0.8);   /* w obrębie rysunku, poza trzonem */
    out.niskaNad = przelec('niska', 0, 0.62, 0.45); out.niskaPod = przelec('niska', 0, 0.5, 0.45);
    return out; });
  chk(KOL.srodek.traf === 1 && KOL.srodek.s.klasa === 1 && KOL.trzonMinus.traf === 1 && KOL.trzonPlus.traf === 0 && KOL.akwarela.traf === 0,
    'kolizja tylko trzonu (60% szerokości rysunku): środek i brzeg trzonu trafiają, ' + Math.round(KOL.trzonPlus.trzon + 17) + ' j. od osi i w obrębie rysunku (' + Math.round(KOL.akwarela.pol - 2) + ' j.) nie', 'kolizje: ' + JSON.stringify(KOL));
  chk(KOL.niskaNad.traf === 0 && KOL.niskaPod.traf === 1, 'niska wieża (szczyt 0,45): przelot górą przy h = 0,62 (> szczyt + 0,1) bez kolizji, przy h = 0,5 uderzenie', 'niska: ' + JSON.stringify([KOL.niskaNad, KOL.niskaPod]));
  const s1 = KOL.srodek.s;
  chk(s1 && s1.s0 - s1.s1 <= 0.1 + 1e-6 && s1.klasa === 1, 'uderzenie w wieżę = S1 (s ' + f2(s1.s0) + ' -> ' + f2(s1.s1) + ', spadek <= 0,1; wirowanie 0,8 s, piórka, odbicie)', 'S1 wieży: ' + JSON.stringify(s1));

  }
  /* ---------- (d) bonusy ---------- */
  if (run('d')) {
  console.log('(d) komin, tęcza, poryw, smuga, wiry');
  const KM = await ev(() => {
    const o = __okruszek, out = {};
    o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.brama(3); o.odblokuj(); o.ustawWysokosc(0.5); o.symuluj(0.3); o.trafPrad(); o.symuluj(0.3); o.ustawWysokosc(0.5);
    o.zdarzenie('komin', { dx: 0, z: 1.3 }); const g = o.gdzie().find(x => x.typ === 'komin');
    const l0 = o.lancuch(), st0 = o.stan();
    for (let i = 0; i < 40; i++) { o.ustawWysokosc(g.top + 0.2); o.symuluj(0.025); if (o.z11().komin.length) break; }
    out.log = o.z11().komin; out.l0 = l0; out.l1 = o.lancuch(); out.stale = o.stale(); out.top = g.top;
    o.symuluj(0.1); const ga = (o.gdzie().find(x => x.typ === 'komin') || {}).gas; o.symuluj(0.25); const gb = (o.gdzie().find(x => x.typ === 'komin') || {}).gas; out.gas1 = ga; out.tempoGas = (ga - gb) / 0.25;   /* komin mija ptaszka szybciej niż gaśnie: mierzymy tempo (1/5 s) */
    /* drugi przelot nad tym samym kominem nie działa (każdy komin raz) */
    out.raz = o.z11().komin.length;
    /* komin przy prędkości tuż pod CAP4: nie przebija CAP4 */
    o.nowyBieg(); o.brama(3); o.symuluj(0.2); o.stala('DIVE', 0.01); o.nurkuj(true); o.symuluj(6); o.trafPrad(); o.symuluj(0.2); o.trafPrad();
    o.zdarzenie('komin', { dx: 0, z: 1.2 }); const g2 = o.gdzie().find(x => x.typ === 'komin');
    for (let i = 0; i < 40; i++) { o.ustawWysokosc(g2.top + 0.2); o.symuluj(0.025); if (o.z11().komin.length) break; }
    out.cap = o.z11().komin[0]; o.nurkuj(false); o.stala('DIVE', 0.2);
    return out; });
  const k0 = KM.log[0];
  chk(KM.log.length === 1 && Math.abs(k0.h1 - Math.min(1, k0.h0 + 0.2)) < 1e-6 && k0.dodane <= 0.5 * KM.stale.PRAD_S + 1e-9 && k0.lancuchPo === k0.lancuchPrzed && k0.w12Po === k0.w12Przed,
    'komin ciepła: wysokość ' + f2(k0.h0) + ' -> ' + f2(k0.h1) + ' (+0,2), rozpęd +' + f2(k0.dodane) + ' (<= 0,5 j. = ' + f2(0.5 * KM.stale.PRAD_S) + '), łańcuch i licznik 12 s bez zmian (kolor stoi)', 'komin: ' + JSON.stringify(KM.log));
  chk(KM.cap && KM.cap.s1 <= KM.stale.CAP4 + 1e-9 && KM.raz === 1 && KM.gas1 > 0.9 && Math.abs(KM.tempoGas - 0.2) < 0.02, 'komin nie przebija CAP4 (s ' + f2(KM.cap && KM.cap.s1) + ' <= ' + KM.stale.CAP4 + '), działa raz, gaśnie w 5 s po wlocie (tempo ' + f2(KM.tempoGas) + '/s = 1/5 s)', 'komin cap/raz/gas: ' + JSON.stringify([KM.cap, KM.raz, KM.gas1, KM.tempoGas]));
  const TC = await ev(() => {
    const o = __okruszek, out = {};
    o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.brama(2); o.odblokuj(); for (let i = 0; i < 21; i++) { o.ustawWysokosc(0.8); o.symuluj(1); }
    o.zdarzenie('deszcz', { dx: 0, z: 0.86 }); o.symuluj(0.6); out.mokro0 = o.stan().mokro;
    const l0 = o.lancuch().w12; o.zdarzenie('tecza_ks', { dx: 0, z: 0.86 }); o.symuluj(1.0); out.mokro1 = o.stan().mokro; out.w12 = o.lancuch().w12 - l0; out.log = o.z11().tecza;
    out.alfa = {}; for (const L of [0, 1, 2, 3, 4]) { o.ustawPoziom(L); o.symuluj(0.05); o.zdarzenie('tecza_ks', { dx: 2, z: 3 }); out.alfa[L] = o.gdzie().filter(x => x.typ === 'tecza')[0].alfa; } o.odblokuj();
    o.nowyBieg(); o.brama(4); for (let i = 0; i < 21; i++) { o.ustawWysokosc(0.8); o.symuluj(1); } const p0 = o.lancuch().w12; o.zdarzenie('poryw', { dx: 0, z: 0.86 }); o.symuluj(1.0); out.poryw = o.lancuch().w12 - p0;
    return out; });
  chk(TC.mokro0 && !TC.mokro1 && TC.w12 === 1 && TC.log.length === 1, 'tęcza księżycowa: przelot pod łukiem = 1 prąd w łańcuchu (+1 w oknie 12 s) i suche piórka (mokro: ' + TC.mokro0 + ' -> ' + TC.mokro1 + ')', 'tęcza: ' + JSON.stringify(TC));
  chk(TC.alfa[0] <= 0.35 && TC.alfa[1] <= 0.35 && TC.alfa[2] > 0.35 && TC.alfa[4] > 0.35 && TC.poryw === 1, 'tęcza: alfa ' + [0, 1, 2, 3, 4].map(L => 'L' + L + ' ' + f2(TC.alfa[L])).join(', ') + ' (<= 0,35 w L0-L1, pełna od L2); poryw latawcowy = 1 prąd w łańcuchu', 'alfa/poryw: ' + JSON.stringify(TC));
  const SM = await ev(() => {
    const o = __okruszek, out = {};
    o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.brama(5); o.odblokuj(); o.ustawWysokosc(0.9); o.symuluj(21);
    o.nurkuj(true); o.zdarzenie('smuga', { dx: 0 }); o.trafPrad(); o.symuluj(0.4); o.trafPrad();
    let w12max = 0; const t0 = o.stan().graCzas; let wpis = null;
    for (let i = 0; i < 200; i++) { o.ustawWysokosc(0.9); o.symuluj(0.05); const sm = o.z11().smuga; if (sm.length && !wpis) wpis = Object.assign({ tWlot: o.stan().graCzas - t0 }, sm[0]); if (!o.gdzie().some(x => x.typ === 'smuga')) break; }
    o.nurkuj(false); out.wpis = wpis; out.n = o.z11().smuga.length; out.koniec = o.lancuch(); out.PRAD_S = o.stale().PRAD_S; out.zapowiedz = o.zapowiedzi().filter(e => e.typ === 'przelot').map(e => e.czas);
    /* przy s < 0,35 smuga nie działa */
    o.nowyBieg(); o.brama(5); o.symuluj(21); o.ustaw(0.2); o.zdarzenie('smuga', { dx: 0 }); for (let i = 0; i < 160; i++) { o.symuluj(0.05); if (!o.gdzie().some(x => x.typ === 'smuga')) break; } out.wolno = o.z11().smuga.length; o.odblokuj();
    return out; });
  chk(SM.n === 1 && SM.wpis && SM.wpis.idealne && SM.wpis.w12Po === SM.wpis.w12Przed + 1 && (SM.wpis.lancuchPo === SM.wpis.lancuchPrzed + 1 || SM.wpis.lancuchPo === 1),
    'smuga samolotu = JEDEN prąd w łańcuchu: cały przelot przez smugę (ok. 3 s) dodał 1 wpis w oknie 12 s (' + (SM.wpis && SM.wpis.w12Przed) + ' -> ' + (SM.wpis && SM.wpis.w12Po) + '), łańcuch ' + (SM.wpis && SM.wpis.lancuchPrzed) + ' -> ' + (SM.wpis && SM.wpis.lancuchPo) + ', żadnych kolejnych', 'smuga: ' + JSON.stringify(SM));
  chk(SM.wpis && SM.wpis.s1 - SM.wpis.s0 <= 1.5 * SM.PRAD_S + 1e-6 && SM.wolno === 0, 'smuga: skok prędkości ' + f2(SM.wpis && SM.wpis.s1 - SM.wpis.s0) + ' <= 1,5 j. (' + f2(1.5 * SM.PRAD_S) + '); przy s = 0,2 (< 0,35) smuga nie działa', 'smuga skok/wolno: ' + JSON.stringify(SM));
  const WR = await ev(() => {
    const o = __okruszek, out = {};
    o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokuj(); o.brama(5); o.nurkuj(true); for (let i = 0; i < 30; i++) { o.ustawWysokosc(0.9); o.symuluj(0.1); }
    const sk0 = o.skutki().length; o.zdarzenie('przelot', { dx: 96 / 300, wiry: true });   /* tor ptaszka = oś lewego wiru */
    let bx0 = null;
    for (let i = 0; i < 500; i++) { o.ustawWysokosc(0.9); o.symuluj(0.02); const z = o.z11(); if (z.wiry.length && bx0 === null) { bx0 = z.wiry[0].bx; out.drz = z.drzenie; out.sens = z.wirSens; out.stale = z.stale; out.t0 = o.stan().graCzas; } if (bx0 !== null && o.stan().graCzas - out.t0 >= 1.3) break; }
    o.nurkuj(false); out.wir = o.z11().wiry; out.dx = Math.abs(o.stan().bx - bx0); out.sk = o.skutki().slice(sk0); out.BW = o.z11().BIRD_W;
    return out; });
  const sw = WR.sk.find(s => s.typ === 'wir');
  chk(WR.wir.length === 1 && sw && sw.klasa === 1 && sw.s0 - sw.s1 <= 0.1 + 1e-6 && WR.drz > 1.1 && Math.abs(WR.sens - 1.2) < 0.05 && WR.stale.WIR_SENS === 0.6 && WR.stale.WIR_SHAKE >= 6 && WR.stale.WIR_SHAKE <= 10 && WR.dx <= WR.BW + 1e-6,
    'wir = S1: s ' + f2(sw && sw.s0) + ' -> ' + f2(sw && sw.s1) + ', drżenie kamery ' + WR.stale.WIR_SHAKE + ' px przez ' + f2(WR.drz) + ' s, czułość skrętu x' + WR.stale.WIR_SENS + ' przez ' + f2(WR.sens) + ' s, znos ' + f2(WR.dx) + ' j. (<= ' + WR.BW + ' = 1 szerokość ptaszka), jeden wir na przelot', 'wir: ' + JSON.stringify(WR));

  }
  /* ---------- (e) budżet prędkości ---------- */
  if (run('e')) {
  console.log('(e) budżet prędkości');
  const EXP = await ev(() => {
    const o = __okruszek, out = [];
    for (const [br, bonusy, prady] of [[5, ['smuga', 'tecza_ks', 'poryw', 'komin'], false], [3, ['komin'], false], [5, ['smuga'], false], [2, ['tecza_ks', 'smuga', 'komin'], true], [4, ['poryw', 'smuga', 'komin'], true]]) {
      o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(!prady); o.odblokuj(); o.brama(br); o.symuluj(0.2);
      o.autopilot(eval('(function(){return function(A){var k,p,tx=A.bx;for(k=0;k<A.prady.length;k++){p=A.prady[k];if(!p.hit&&p.z>A.ZB&&p.z<3.5){tx=p.x;break;}}return {u:Math.max(-1,Math.min(1,(tx-A.bx)/40)),hold:A.h>0.35};};})()'), 3);
      let narusz4 = 0, narusz5 = 0, maxL = 0, n = 0, t = 0, konce = 0;
      while (t < 90) {   /* t = łączny czas symulacji (po końcu biegu nowy bieg, czas liczy się dalej) */
        const b = bonusy[n % bonusy.length]; n++;
        if (b === 'komin') o.zdarzenie('komin', { dx: 0, z: 1.6 }); else if (b === 'smuga') o.zdarzenie('smuga', { dx: 0 }); else o.zdarzenie(b, { dx: 0, z: 1.8 });
        for (let i = 0; i < 30; i++) { if (b === 'komin') { const g = o.gdzie().find(x => x.typ === 'komin' && x.z > 0.7); if (g) o.ustawWysokosc(Math.max(o.stan().h, g.top + 0.18)); }
          const r = o.symuluj(0.05); const st = o.stan(); t += 0.05; maxL = Math.max(maxL, st.poziom);
          if (st.poziom >= 4 && st.lancuch12 < 3 && !st.hiper) narusz4++; if (st.poziom === 5 && !st.hiper) narusz5++; if (r.tryb !== 'gra') { konce++; o.nowyBieg(); o.brama(br); } }
      }
      const st = o.stan(); o.autopilot(null);
      out.push({ br, bonusy: bonusy.join('+') + (prady ? '+prądy' : ''), maxL, narusz4, narusz5, l5bez: st.l5bezLancucha, hiper: st.hiperRazy, smug: o.z11().smuga.length, kominow: o.z11().komin.length, konce });
    }
    return out; });
  console.log('  info boty z wymuszanymi bonusami (90 s): ' + EXP.map(e => 'K' + e.br + ' ' + e.bonusy + ': maks. L' + e.maxL + ', smug ' + e.smug + ', kominów ' + e.kominow).join(' | '));
  chk(EXP.every(e => e.narusz4 === 0 && e.narusz5 === 0 && e.l5bez === 0), 'bonusy (smuga, komin, poryw, tęcza) nie dają L4 bez GATE4 (>= 3 prądy w 12 s) ani L5 bez GATE5: 0 naruszeń w ' + EXP.length + ' biegach', 'naruszenia: ' + JSON.stringify(EXP));
  chk(EXP[1].maxL < 4 && EXP[1].kominow >= 10, 'sam komin (bez prądów, ' + EXP[1].kominow + ' kominów): najwyżej L' + EXP[1].maxL + ' (nigdy L4, komin nie przekracza CAP4)', 'komin: ' + JSON.stringify(EXP[1]));
  /* boty w krainach K2-K5 z treścią Z11 (przeszkody włączone) */
  const KB = await ev(([srcI, srcL, srcP]) => {
    const o = __okruszek, out = { idealny: [], losowy: [], polowa: { serii: 0, trojek: 0, pelny: 0 } };
    for (let br = 2; br <= 5; br++) for (let z = 1; z <= 3; z++) {
      o.pauza(true); o.bezPrzeszkod(false); o.bezPradow(false); o.odblokuj(); o.odblokujPore(); o.ziarno(z); o.brama(br); o.autopilot(eval(srcI), z * 17 + br);
      let tFull = -1, t = 0; while (t < 60) { const q = o.symuluj(0.25); t = q.graCzas; if (tFull < 0 && o.energia() >= 0.98) tFull = t; if (q.tryb !== 'gra') break; }
      o.autopilot(null); out.idealny.push({ br, z, tFull });
      o.ziarno(z); o.brama(br); o.autopilot(eval(srcL), z * 31 + br); let r; for (let i = 0; i < 12; i++) { r = o.symuluj(10); if (r.tryb !== 'gra') break; } o.autopilot(null);
      out.losowy.push({ br, z, maxL: r.poziomMax, pelny: o.pelnyKolor().lacznie });
      o.ziarno(z); o.brama(br); o.autopilot(eval(srcP), z * 13 + br); t = 0; while (t < 200) { const q = o.symuluj(1); t = q.graCzas; if (q.tryb !== 'gra') break; } o.autopilot(null);
      const se = o.serie().filter(x => x.n >= 3); out.polowa.serii += se.length; out.polowa.trojek += se.filter(x => x.maxChain >= 3).length; out.polowa.pelny += o.pelnyKolor().lacznie;
    }
    return out; }, [BOTY.idealny121, BOTY.losowy, BOTY.polowa]);
  const brak = KB.idealny.filter(r => r.tFull < 0 || r.tFull > 60);
  console.log('  info bot idealny w K2-K5 (z Z3b, nurkuje od 30% wysokości), pierwszy pełny kolor (s): ' + KB.idealny.map(r => 'K' + r.br + '/' + r.z + ' ' + f2(r.tFull)).join(', '));
  chk(brak.length === 0, 'bot idealny osiąga pełny kolor w <= 60 s w każdej krainie K2-K5 (' + KB.idealny.length + ' biegów z przeszkodami Z11)', 'bez pełnego koloru w 60 s: ' + JSON.stringify(brak));
  chk(KB.losowy.every(r => r.maxL < 4 && r.pelny === 0), 'bot losowy w K2-K5 nigdy L4 ani pełnego koloru (' + KB.losowy.length + ' biegów, szczyty ' + KB.losowy.map(r => 'L' + r.maxL).join(' ') + ')', 'losowy: ' + JSON.stringify(KB.losowy));
  const pr = KB.polowa.trojek / Math.max(1, KB.polowa.serii);
  chk(KB.polowa.serii >= 60 && pr <= 0.15, 'bot "50% prądów" w K2-K5 z przeszkodami: trójka z rzędu w ' + (100 * pr).toFixed(1) + '% serii (<= 15%, ' + KB.polowa.serii + ' serii)', 'bot 50%: ' + JSON.stringify(KB.polowa));

  }
  /* ---------- (f) 400 wymuszeń ---------- */
  if (run('f')) {
  console.log('(f) 400 wymuszeń nowych przeszkód: 0 końców biegu');
  const W400 = await ev(() => {
    const o = __okruszek, typy = [['szpile', { uklad: 'rzad' }, 3], ['szpile', { uklad: 'aleja' }, 3], ['szpile', { uklad: 'strzala' }, 3], ['szpile', { uklad: 'skos' }, 3], ['szpile', { uklad: 'kanion' }, 3], ['latawce', {}, 4], ['przelot', { wiry: true }, 5], ['ulewa', {}, 2]], out = {};
    for (const [nm, opt, br] of typy) {
      o.pauza(true); o.autopilot(null); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokuj(); o.brama(br);
      let konce = 0;
      for (let i = 0; i < 50; i++) { o.ustawWysokosc(i % 5 === 0 ? (nm === 'przelot' ? 0.32 : 0.2) : 0.6); o.zdarzenie(nm, Object.assign({ dx: nm === 'przelot' ? (i % 2 ? 96 / 300 : -96 / 300) : ((i % 7) - 3) * 0.12, z: 1.15, zA: 1.3 }, opt)); const r = o.symuluj(nm === 'przelot' ? 7 : 3);   /* przelot: tor na osi wiru; nisko 0,32 (7 s opadania przy SINK 0,04 nie dochodzi do morza) */ if (r.tryb !== 'gra') { konce++; o.nowyBieg(); } }
      out[nm + (opt.uklad ? '-' + opt.uklad : '')] = { konce, skutki: o.skutki().length };
    }
    return out; });
  const sumK = Object.values(W400).reduce((a, b) => a + b.konce, 0);
  chk(sumK === 0, '400 wymuszeń (szpile w 5 układach, festiwal latawców, Wielki przelot z wirami, ulewa; po 50, tor przesuwany, co piąte nisko: h = 0,2, przelot 0,32): 0 końców biegu', 'końce biegu: ' + JSON.stringify(W400));
  console.log('  info skutki (trafienia) na 50 wymuszeń: ' + Object.keys(W400).map(k => k + ' ' + W400[k].skutki).join(', '));

  }
  /* ---------- (g) zapowiedzi ---------- */
  if (run('g')) {
  console.log('(g) zapowiedzi w sekundach');
  const ZP = await ev(() => {
    const o = __okruszek, out = [];
    for (const L of [0, 2, 4, 5, 'przysp']) for (const [nm, br, opt] of [['szpile', 3, { uklad: 'rzad' }], ['szpile', 3, { uklad: 'aleja' }], ['latawce', 4, {}], ['ulewa', 2, {}], ['przelot', 5, { wiry: true }]]) {
      o.pauza(true); o.autopilot(null); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokuj(); o.brama(br); o.ustawWysokosc(0.9);
      o.ustawPoziom(L === 'przysp' ? 0 : L); o.zdarzenie(nm, Object.assign({ dx: 0.9 }, opt)); if (L === 'przysp') o.ustawPoziom(5);
      let e = null; for (let i = 0; i < 80; i++) { o.symuluj(0.25); e = o.zapowiedzi().find(x => x.typ === nm); if (e && e.czas !== null) break; }
      out.push({ L, typ: nm + (opt.uklad ? '-' + opt.uklad : ''), czas: e ? e.czas : null }); o.odblokuj();
    }
    return out; });
  const zpZle = ZP.filter(x => x.czas === null || x.czas < (x.typ === 'przelot' ? 2.5 : 1.5) - 1e-6);
  chk(zpZle.length === 0, 'zapowiedzi ' + ZP.length + ' wymuszeń na L0, L2, L4, L5 i przy przyspieszeniu L0 -> L5: szpile, latawce, ulewa >= 1,5 s (min ' + f2(Math.min(...ZP.filter(x => x.typ !== 'przelot').map(x => x.czas))) + ' s), Wielki przelot >= 2,5 s (min ' + f2(Math.min(...ZP.filter(x => x.typ === 'przelot').map(x => x.czas))) + ' s)', 'za krótkie: ' + JSON.stringify(zpZle));

  }
  /* ---------- (i) słońce, finały, zwiastuny, Rogal (Droga w ruchu) ---------- */
  if (run('i')) {
  console.log('(i) kierunek słońca, finały i zwiastuny w ruchu, Rogal');
  const SL = {}; for (const p of ['swit', 'dzien', 'zachod', 'noc']) { await ev((p) => { __okruszek.ustawPore(p); }, p); await sleep(150); SL[p] = await ev(() => __okruszek.swiatlo()); }   /* światło liczy się w klatce rysowania */
  await ev(() => __okruszek.odblokujPore());
  chk(SL.swit.slonce < 0.01 && SL.swit.zaPlecami > 0.9 && SL.dzien.slonce > 0.9 && SL.dzien.sy < SL.dzien.H * 0.2 && SL.zachod.slonce > 0.9 && Math.abs(SL.zachod.sx - SL.zachod.W / 2) < 30 && Math.abs(SL.zachod.sy - (SL.zachod.horyzont - 30)) < 5 && SL.noc.ksiezyc > 0.5,
    'słońce: świt za plecami (tarcza niewidoczna, światło od kamery ' + f2(SL.swit.zaPlecami) + '), dzień wysoko (y ' + Math.round(SL.dzien.sy) + ' z ' + Math.round(SL.dzien.H) + '), zachód na wprost nad horyzontem (x ' + Math.round(SL.zachod.sx) + ', y ' + Math.round(SL.zachod.sy) + '), noc: Rogal', 'słońce: ' + JSON.stringify(SL));
  const FN = [];
  for (let br = 1; br <= 5; br++) FN.push(await ev(([br]) => {
    const o = __okruszek; o.pauza(true); o.autopilot(null); o.bezPrzeszkod(false); o.bezPradow(false); o.odblokuj(); o.odblokujPore(); o.ziarno(2); o.brama(br); o.ustawPoziom(2); o.symuluj(25);
    o.doBramy(330); let zw = null, fin = null, gap0 = o.napiecie().przeszkody.length, bram = 0, tow = false, typy = new Set();
    for (let i = 0; i < 400; i++) { o.ustawWysokosc(0.8); o.symuluj(0.1); const g = o.gdzie(); g.forEach(x => typy.add(x.typ + (x.zw ? '(zw)' : ''))); if (!zw) zw = g.find(x => x.zw && x.typ !== 'festiwal') || null; if (!fin) { const f = g.find(x => x.typ === 'final'); if (f) { fin = f; gap0 = o.napiecie().przeszkody.length; } } if (g.some(x => x.typ === 'towarzysz')) tow = true; if (o.bramaLog().przeloty.length) { bram = 1; break; } }
    const po = o.napiecie().przeszkody.length - gap0; o.odblokuj();
    return { br, zw: zw ? zw.typ : null, fin: fin ? fin.rodzaj : null, noweWFinale: po, brama: bram, tow, typy: [...typy].join(','), finaly: o.z11().finaly.length, poBramie: o.z11().final }; }, [br]));
  console.log('  info finały i zwiastuny: ' + FN.map(f => 'K' + f.br + ' zwiastun ' + f.zw + ', finał ' + f.fin + (f.tow ? ' (+żółty latawiec)' : '')).join(' | '));
  const oczZw = { 1: 'tecza', 2: 'szpile', 3: 'latawce', 4: 'przelot', 5: 'burza' }, oczFin = { 1: 'trzy_w_rytmie', 2: 'ulewa_i_luk', 3: 'kanion_wiez', 4: 'festiwal', 5: 'przelot_olbrzyma' };
  chk(FN.every(f => f.zw === oczZw[f.br]), 'zwiastuny 300 m przed bramą (S0, z boku toru): K1 -> tęcza, K2 -> szpila, K3 -> latawiec, K4 -> mały samolot, K5 -> burza', 'zwiastuny: ' + JSON.stringify(FN.map(f => [f.br, f.zw])));
  chk(FN.every(f => f.fin === oczFin[f.br] && f.noweWFinale === 0 && f.brama === 1 && f.poBramie === null) && FN[3].tow, 'finały K1-K5 przed bramą (trzy w rytmie, ulewa i łuk, kanion wież, festiwal z żółtym latawcem, przelot olbrzyma): bez nowych zagrożeń w finale, kończą się na bramie', 'finały: ' + JSON.stringify(FN));
  const RG = await ev(() => { const o = __okruszek, out = {}; o.pauza(true); o.bezPrzeszkod(false); o.bezPradow(false); o.odblokuj(); o.ziarno(1); o.brama(2); o.ustawPore('noc'); let t = null;
    for (let i = 0; i < 300; i++) { o.ustawWysokosc(0.8); o.symuluj(0.1); const r = o.gdzie().find(x => x.typ === 'rogal'); if (r && t === null) t = o.stan().graCzas; if (r) { out.ey = r.ey; break; } } out.t = t;
    o.ustawPoziom(3); o.symuluj(0.05); out.mrugaL3 = o.gdzie().find(x => x.typ === 'rogal'); o.ustawPoziom(1); o.symuluj(0.05); out.mrugaL1 = o.gdzie().find(x => x.typ === 'rogal'); o.odblokuj(); o.odblokujPore(); return out; });
  chk(RG.t !== null && RG.t >= 20 && RG.t <= 30 && RG.mrugaL3 && RG.mrugaL3.mruga && !RG.mrugaL1.mruga, 'Rogal w Morzu Pierzyn: wychyla się zza chmur ' + f2(RG.t) + ' s po starcie z bramy 2 (po 20 s ciszy), mruga od L3, w L1 nie', 'Rogal: ' + JSON.stringify(RG));

  }
  if (run('h')) {   /* (h) i (j) korzystają z tej samej strony @2x */
  /* ---------- (h) kolor: kolejność i brak czerwieni przy s = 0 ---------- */
  console.log('(h) kolor: kolejność warstw i czerwień przy s = 0');
  await page.close();
  const pg = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); watch(pg);
  await pg.goto(url); await pg.waitForTimeout(700);
  await pg.evaluate(() => __okruszek.z11Zbuduj());
  const SCENY = {
    2: [['tecza_ks', { dx: 0, z: 2.0 }], ['rogal', { t: 3.5 }], ['deszcz', { dx: -0.6, z: 2.4 }], ['tecza_ks', { dx: 0.7, z: 3.4, big: 1.6 }]],
    3: [['szpile', { uklad: 'rzad', dx: 0, z: 2.6, n: 5 }], ['komin', { dx: 0.5, z: 1.6 }], ['szpile', { uklad: 'aleja', dx: -0.8, z: 4 }]],
    4: [['latawce', { dx: 0, z: 2.2 }], ['poryw', { dx: 0.6, z: 2.6 }], ['festiwal', {}]],
    5: [['przelot', { dx: 0, wiry: true }], ['przelot', { dx: -0.9, wiry: true, z: 3 }]] };
  const scena = async (br, L, pora, sim) => pg.evaluate(([br, L, pora, sc, sim]) => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokuj(); o.brama(br); if (pora) o.ustawPore(pora); o.ustawWysokosc(0.85); o.ustaw(L); o.symuluj(0.4);
    sc.forEach(e => o.zdarzenie(e[0], e[1])); o.symuluj(sim); o.tempo(0.02); o.pauza(false); return o.gdzie().map(x => x.typ); }, [br, L, pora, SCENY[br], sim]);
  let ordBad = 0, ordN = 0, why = '';
  const ordered = (k) => k.niebo >= k.daleko - 1e-9 && k.daleko >= k.blisko - 1e-9 && k.blisko >= k.smugi - 1e-9;
  for (let br = 2; br <= 5; br++) {
    await scena(br, 0, null, 1.4);
    for (const e of [0, 0.3, 0.62, 1]) {
      await pg.evaluate((x) => __okruszek.ustawEnergie(x), e); await sleep(220);
      const k = await pg.evaluate(() => __okruszek.kolory()), w = await pg.evaluate(() => __okruszek.warstwy());
      ordN++; let lb = false; for (let i = 1; i < w.length; i++) if (w[i].c > w[i - 1].c + 1e-9 || w[i].z > w[i - 1].z + 1e-9) lb = true;
      if (!ordered(k) || lb) { ordBad++; why = 'K' + br + ' E=' + e + ' ' + JSON.stringify(k); }
    }
    await pg.evaluate(() => { __okruszek.ustawEnergie(null); __okruszek.pauza(true); __okruszek.tempo(1); });
  }
  chk(ordBad === 0 && ordN === 16, 'kolejność niebo >= daleko >= blisko >= smugi i warstwy od tyłu do przodu przy E = 0 / 0,3 / 0,62 / 1 w K2-K5 z elementami Z11 na ekranie (' + ordN + ' próbek)', 'kolejność złamana: ' + why);
  const czerwien = () => pg.evaluate(() => { const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
    const d = x.getImageData(0, 0, t.width, t.height).data, p = __okruszek.ptakEkran(), k = c.width / p.W, sx0 = (p.x - 46) * k, sx1 = (p.x + 46) * k, sy0 = (p.y - 36) * k, sy1 = (p.y + 52) * k;
    let red = 0, all = 0, inS = 0, hud = 0;
    for (let y = 0; y < t.height; y += 2) for (let xx = 0; xx < t.width; xx += 2) { const i = (y * t.width + xx) * 4, r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), v = mx / 255, s = mx ? (mx - mn) / mx : 0;
      let hh = 0; if (mx !== mn) { if (mx === r) hh = ((g - b) / (mx - mn)) * 60; else if (mx === g) hh = (2 + (b - r) / (mx - mn)) * 60; else hh = (4 + (r - g) / (mx - mn)) * 60; if (hh < 0) hh += 360; }
      const czer = (hh <= 18 || hh >= 340) && s > 0.45 && v > 0.35; if (y < 110 * k) { if (czer) hud++; continue; } all++;   /* góra 110 px: HUD i strefa tekstu (obwódki antyaliasingu tekstu w Chromium bez GPU, tak samo w Z5) */
      if (czer) { if (xx >= sx0 && xx <= sx1 && y >= sy0 && y <= sy1) inS++; else red++; } }
    return { red, all, inS, hud, frac: red / all }; });
  const RED = [];
  for (let br = 2; br <= 5; br++) for (const pora of [null, 'noc', 'dzien']) {
    const typy = await scena(br, 0, pora, br === 5 ? 1.8 : 1.4); await sleep(450);
    const r = await czerwien(); r.br = br; r.pora = pora || 'domowa'; r.typy = [...new Set(typy)].join(','); RED.push(r);
    await pg.evaluate(() => { __okruszek.pauza(true); __okruszek.tempo(1); });
  }
  const redMax = Math.max(...RED.map(r => r.frac));
  console.log('  info czerwone piksele poza szalikiem przy s = 0: ' + RED.map(r => 'K' + r.br + '/' + r.pora + ' ' + r.red + ' z ' + r.all + ' (szalik ' + r.inS + ', strefa HUD i tekstu ' + r.hud + ')').join(', '));
  chk(RED.every(r => r.frac < 0.0001 && r.inS > 20), 'przy s = 0 brak czerwieni poza szalikiem w K2-K5 o porze domowej, w nocy i w dzień (12 kadrów z elementami Z11 na ekranie; najwięcej ' + RED.reduce((a, r) => Math.max(a, r.red), 0) + ' pikseli = ' + (100 * redMax).toFixed(4) + '%, próg 0,01%; szalik czerwony w każdym kadrze)', 'czerwień: ' + JSON.stringify(RED));

  /* ---------- (j) pamięć i klatki ---------- */
  console.log('(j) pamięć sprite\'ów i klatki');
  const PM = await pg.evaluate(() => __okruszek.z11Zbuduj());
  chk(PM.MB <= 60, 'pamięć sprite\'ów po zbudowaniu wszystkich wież (8) i samolotów (2): ' + PM.MB + ' MB (<= 60 MB), ' + PM.sprite + ' sprite\'ów', 'pamięć: ' + JSON.stringify(PM));
  await pg.close();
  const fpsScena = async (u, z11, cpu) => {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); watch(p);
    await p.goto(u); await p.waitForTimeout(700);
    let cdp = null; if (cpu) { cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu }); }
    const info = await p.evaluate((z11) => { const o = __okruszek; if (o.z11Zbuduj) o.z11Zbuduj(); o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokuj(); o.brama(5); o.ustawPoziom(2); o.ustawWysokosc(0.85); o.symuluj(0.5);
      let g = null; if (z11) { o.zdarzenie('przelot', { dx: 0, wiry: true }); o.symuluj(0.7); o.zdarzenie('szpile', { uklad: 'rzad', dx: 0, z: 5.6, n: 5 }); o.symuluj(0.9); g = o.gdzie(); }
      o.tempo(0.012); o.pauza(false);
      if (!g) return null; const pl = g.find(x => x.typ === 'przelot'), sz = g.find(x => x.typ === 'szpile');
      return { samolot: pl && pl.ex > 0 && pl.ex < 390 && pl.ey > 0 && pl.ey < 844, wiez: sz ? sz.wieze.filter(w => w.ex > -20 && w.ex < 410).length : 0 }; }, z11);
    await sleep(900); await p.evaluate(() => { __okruszek.zerujFps(); if (__okruszek.zerujCpu) __okruszek.zerujCpu(); });   /* rozgrzewka: pierwsze klatki malują akwarelę wszystkich sprite'ów */
    await sleep(3500);
    const f = await p.evaluate(() => ({ fps: __okruszek.fps(), cpu: __okruszek.cpu ? __okruszek.cpu() : null }));
    if (cdp) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await p.close(); return { info, fps: f.fps.avg, cpu: f.cpu };
  };
  const urlB = 'file:///' + baza.replace(/\\/g, '/') + '?test&seed=23';
  if (!fs.existsSync(baza)) bad('brak pliku bazy do porównania klatek: ' + baza);
  else {
    /* Z17: 5 rund naprzemiennych A/B (w rundach parzystych najpierw Z5, w nieparzystych najpierw Z11), wynik = mediana stosunków z rund (sąsiednie pomiary
       znoszą zmiany obciążenia maszyny); dawniej jeden przebieg „najlepszy z 4”, który pod obciążeniem dawał fałszywe porażki (np. 80 vs 94,9). Próg 10% bez zmian. */
    const FB = [], FN2 = [], RAT = []; let inf = null;
    for (let r = 0; r < 5; r++) { let a, q; if (r % 2) { q = await fpsScena(url, true); a = await fpsScena(urlB, false); } else { a = await fpsScena(urlB, false); q = await fpsScena(url, true); } FB.push(a); FN2.push(q); inf = q.info; RAT.push(q.fps / a.fps); }
    const med = (a) => { const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
    const mB = med(FB.map(x => x.fps)), mN = med(FN2.map(x => x.fps)), mR = med(RAT);
    console.log('  info klatki (5 rund A/B, mediany; 390x844 @2x, headless bez GPU): Z5 ' + f2(mB) + ' (' + FB.map(x => f2(x.fps)).join('/') + '), Z11 z samolotem i ' + (inf && inf.wiez) + ' wieżami ' + f2(mN) + ' (' + FN2.map(x => f2(x.fps)).join('/') + '); stosunki rund ' + RAT.map(x => f2(x)).join('/') + '; czas rysowania (cpu, średnio ms): Z5 ' + FB.map(x => x.cpu && x.cpu.sr).join('/') + ', Z11 ' + FN2.map(x => x.cpu && x.cpu.sr).join('/'));
    chk(inf && inf.samolot && inf.wiez >= 5, 'na ekranie: samolot i ' + (inf && inf.wiez) + ' wież', 'scena klatek: ' + JSON.stringify(inf));
    chk(mR >= 0.9, 'klatki z samolotem i 5 wieżami nie gorsze niż o 10% od Z5 (mediana stosunków 5 rund A/B ' + f2(mR) + '; mediany ' + f2(mN) + ' vs ' + f2(mB) + ' kl/s)', 'klatki: Z11 vs Z5 mediana stosunków ' + f2(mR) + ' (' + RAT.map(x => f2(x)).join('/') + ')');
    const c4b = await fpsScena(urlB, false, 4), c4n = await fpsScena(url, true, 4);
    console.log('  info CPU x4 (tylko informacja, headless bez GPU): Z5 ' + f2(c4b.fps) + ' kl/s (rysowanie ' + (c4b.cpu && c4b.cpu.sr) + ' ms), Z11 z samolotem i wieżami ' + f2(c4n.fps) + ' kl/s (rysowanie ' + (c4n.cpu && c4n.cpu.sr) + ' ms); kryterium >= 55 kl/s na średnim Androidzie do potwierdzenia na telefonie (Z7)');
  }
  }
  const real = errors.filter(e => !/favicon/i.test(e));
  chk(real.length === 0, 'brak błędów i ostrzeżeń konsoli', 'błędy konsoli: ' + real.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fail ? ('TEST Z11 NIE PRZESZEDŁ (' + fail + ')') : 'TEST Z11 OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST Z11 BŁĄD: ' + (e && e.stack || e)); process.exit(2); });
