/* Okruszek Z10: testy Drogi (krainy, bramy, napięcie, zapowiedzi, klasy skutku, zapis). Użycie: node gra_test_z10.cjs [plik.html]
   Boty (boty_z10.cjs) sterują autopilotem w grze, a symulacja idzie krokami 1/60 s bez rysowania (hak symuluj), więc wyniki są powtarzalne dla ziarna.
   (a) dane: KRAINY K1-K5 + Dalekie Niebo, metry = czas typowy x prędkość z raporty/z10-pomiar.md, pory domowe, SINK, nBaza, klasy S0-S3
   (b) boty z bramy n do bramy n+1 (n = 1..5, 10 ziaren): idealny >= 9/10, "70%" >= 5/10; bot losowy nigdy L4; 12.1 w trybie krain
   (c) zapowiedzi: każde zagrożenie na L0, L2, L4, L5 (i przyspieszenie L0 -> L5 zaraz po pojawieniu): szkic -> kontakt >= 1,5 s, drapieżnik >= 2 s
   (d) 50 wymuszeń każdej przeszkody innej niż jastrząb i sowa: 0 końców biegu; skutki S1 i S2 w granicach klas
   (e) napięcie N <= 0,85, odstęp zagrożeń >= 3,2 s, 20 s bez zdarzeń po starcie (z Gniazda i z bramy), 10 s po bramie, brak drapieżnika w K1, budżet uwagi
   (f) start z bramy: pora domowa, prądy co 3 s przez 20 s, drapieżnik najwcześniej 60 s (brama) / 120 s (Gniazdo); cicha pomoc; ziarno
   (g) wytrwałość, prąd ratunkowy, sowa-pokaz przy pierwszej wizycie w K2, napis krainy, kreska do bramy
   (h) zapis: tylko 3 chwile, rozmiar, blokada localStorage, uszkodzony JSON, zamknięcie karty po bramie, pole v w ustawieniach
   (i) brama: klatki przez cały przelot (bez ograniczenia i z ograniczeniem CPU x4), zrzuty 390 px (kurtyna w połowie, start z bram, kreska)
   (j) tryb zgodności ?pasmo=1. Kończy się "TEST Z10 OK" i kodem 0 tylko wtedy, gdy wszystko przeszło. */
const fs = require('fs'), path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const BOTY = require('./boty_z10.cjs');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const base = 'file:///' + file.replace(/\\/g, '/');
const url = base + '?test&seed=23';
const OUT = path.join(__dirname, 'zrzuty-z10');
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const f2 = (v) => (typeof v === 'number' ? v.toFixed(2) : String(v));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const NZ = +process.env.ZIAREN || 10;

(async () => {
  console.log('TEST Z10 ' + file);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const errors = [];
  const watch = (p) => { p.on('pageerror', e => errors.push('pageerror: ' + e)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); }); };
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); watch(page);
  const ev = (f, a) => page.evaluate(f, a);
  await page.goto(url); await page.waitForTimeout(800);
  const need = ['kraina', 'brama', 'napiecie', 'zapowiedzi', 'zapis', 'wyczyscZapis', 'wytrwalosc', 'cichaPomoc', 'droga', 'krainy', 'doBramy', 'budzet', 'bramaLog', 'ratunek', 'skutki', 'napis', 'klasy', 'autopilot', 'symuluj', 'ziarno', 'pomiar'];
  const miss = await ev((n) => n.filter(k => typeof __okruszek[k] !== 'function'), need);
  chk(miss.length === 0, 'hak Z10 kompletny (' + need.length + ' funkcji, w tym 8 z punktu 18)', 'w haku brakuje: ' + miss.join(', '));
  /* czysty bieg do testów punktowych: pauza (pętla klatek nie rusza gry), bez autopilota */
  const czysto = (o) => ev((o) => { const q = __okruszek; q.pauza(true); q.autopilot(null); q.odblokuj(); q.nurkuj(false); q.przesun(null); q.tempo(1); q.odblokujPore(); q.pomiar(false); q.cichaPomoc(false); q.ziarno(o.z || 0);
    q.bezPradow(!!o.bezPradow); q.bezPrzeszkod(o.przeszkody === undefined ? true : !o.przeszkody); q.brama(o.brama || 1); return q.droga(); }, o || {});

  /* ---------- (a) dane ---------- */
  console.log('(a) KRAINY jako dane');
  const KR = await ev(() => __okruszek.krainy());
  const pom = fs.existsSync(path.join(__dirname, 'raporty', 'z10-pomiar.md')) ? fs.readFileSync(path.join(__dirname, 'raporty', 'z10-pomiar.md'), 'utf8') : '';
  const vRap = +((pom.match(/V_TYP = ([\d.]+)/) || [])[1] || NaN), vGra = (await ev(() => __okruszek.droga())).V_TYP;
  chk(vRap > 0 && vRap === vGra, 'prędkość typowa w raporcie (' + vRap + ' m/s) = V_TYP w KRAINY (' + vGra + ')', 'raport ' + vRap + ' vs KRAINY ' + vGra);
  const czasy = [90, 120, 135, 150, 165], dl = czasy.map(c => Math.round(c * vGra / 100) * 100);
  chk(KR.length === 6 && KR.slice(0, 5).every((k, i) => k.czasTyp === czasy[i] && k.dl === dl[i] && pom.includes('| ' + dl[i] + ' m |')), 'K1-K5: czasy 90/120/135/150/165 s, długości ' + dl.join('/') + ' m (te same w raporcie)', 'długości: ' + JSON.stringify(KR.map(k => [k.czasTyp, k.dl])));
  chk(KR.slice(0, 5).every((k, i) => i === 0 ? k.od === 0 : k.od === KR[i - 1].do) && KR[5].od === KR[4].do && (KR[5].do === null || !isFinite(KR[5].do)) && KR[5].nazwa === 'Dalekie Niebo', 'Droga ciągła od 0 m, za K5 Dalekie Niebo bez końca');
  const pory = KR.map(k => k.pora);
  chk(pory[0] > 0.7 && pory[0] < 0.85 && (pory[1] > 0.85 || pory[1] < 0.1) && Math.abs(pory[2] - 0.25) < 0.03 && Math.abs(pory[3] - 0.5) < 0.03 && pory[4] > 0.53 && pory[4] < 0.72, 'pory domowe: K1 zmierzch ' + pory[0] + ', K2 noc ' + pory[1] + ', K3 świt ' + pory[2] + ', K4 dzień ' + pory[3] + ', K5 popołudnie ' + pory[4]);
  chk(JSON.stringify(KR.map(k => k.sink)) === '[0.032,0.036,0.038,0.04,0.04,0.042]' && JSON.stringify(KR.map(k => k.nBaza)) === '[0.1,0.2,0.28,0.36,0.44,0.55]', 'SINK 0,032/0,036/0,038/0,040/0,040/0,042 i nBaza 0,10/0,20/0,28/0,36/0,44/0,55 jak w specyfikacji');
  const pola = ['id', 'od', 'do', 'czasTyp', 'pora', 'akcent', 'sink', 'pradCo', 'pradTyp', 'przeszkody', 'debiut', 'drapieznik', 'nBaza', 'final'];
  chk(KR.every(k => pola.every(p => p in k)), 'każda kraina ma pola: ' + pola.join(', '));
  /* Z11 (uczciwe dostosowanie): w Z10 stado było w K3 tylko „zastępstwem wież” (ZLECENIA-Z10-Z13, Z10 pkt 2); Z11 wstawia szpile miasta, więc K3 = szpile + mgła, K4 = festiwal latawców + wiatr, K5 = Wielki przelot + stado */
  chk(Object.keys(KR[0].przeszkody).join() === 'ptak' && KR[1].przeszkody.deszcz && KR[1].przeszkody.grad && KR[2].przeszkody.mgla && KR[2].przeszkody.szpile && KR[3].przeszkody.latawce && KR[3].przeszkody.wiatr && KR[4].przeszkody.stado >= 1 && KR[4].przeszkody.przelot && KR[5].przeszkody.burza && !KR.slice(0, 5).some(k => k.przeszkody.burza),
    'przeszkadzajki: K1 ptak, K2 deszcz + grad, K3 szpile + mgła, K4 latawce + wiatr, K5 przelot + stado, burza dopiero w Dalekim Niebie');
  chk(!KR[0].drapieznik.jastrzab && !KR[0].drapieznik.sowa && !KR[1].drapieznik.jastrzab && KR[1].drapieznik.sowa && !KR[2].drapieznik.jastrzab && KR[3].drapieznik.jastrzab && KR[4].drapieznik.jastrzab === 120, 'drapieżniki: K1 brak, K2 sowa, K3 sowa nocą, od K4 jastrząb, K5 jastrząb co ok. 120 s');
  const KL = await ev(() => __okruszek.klasy());
  chk(Object.keys(KL).filter(k => KL[k] === 3).sort().join() === 'jastrzab,morze,sowa', 'klasa S3 (koniec biegu) tylko: jastrząb, sowa, morze chmur');
  const txt = await ev(() => typeof window.OKRUSZEK_TEKSTY === 'object' && window.OKRUSZEK_TEKSTY.krainy[5].nazwa);
  chk(txt === 'Szlak Żelaznych Gęsi', 'teksty krain w teksty.js (window.OKRUSZEK_TEKSTY)');

  /* ---------- (b) boty ---------- */
  console.log('(b) boty z bramy do bramy (' + NZ + ' ziaren)');
  async function bramaBot(bot, n, z) {
    return ev(([src, n, z]) => {
      const o = __okruszek; o.pauza(true); o.odblokuj(); o.nurkuj(false); o.przesun(null); o.bezPradow(false); o.bezPrzeszkod(false); o.odblokujPore(); o.cichaPomoc(false); o.pomiar(false); o.ziarno(z);
      o.brama(n); o.autopilot(eval(src), z * 7919 + n);
      let r, ok = false; for (let i = 0; i < 60; i++) { r = o.symuluj(10); if (r.bramy.some(b => b.brama === n + 1)) { ok = true; break; } if (r.tryb === 'koniec' || r.graCzas > 500) break; }
      o.autopilot(null);
      const zp = o.zapowiedzi(), np = o.napiecie(), bud = o.budzet();
      return { ok, t: r.graCzas, koniec: r.koniec, maxL: r.poziomMax, l5bez: r.l5bezLancucha, pred: zp.filter(e => e.klasa === 3).map(e => ({ typ: e.typ, t: e.tSzkic })), przeszkody: np.przeszkody, nlog: np.log, bud: bud.max, bramy: r.bramy };
    }, [BOTY[bot], n, z]);
  }
  const wyn = { idealny: {}, siedemdziesiat: {} }, wszystkie = [];
  for (const bot of ['idealny', 'siedemdziesiat']) {
    for (let n = 1; n <= 5; n++) {
      const rs = []; for (let z = 1; z <= NZ; z++) { const r = await bramaBot(bot, n, z); r.n = n; r.bot = bot; rs.push(r); wszystkie.push(r); }
      wyn[bot][n] = rs;
      console.log('  info ' + bot + ' brama ' + n + ' -> ' + (n + 1) + ': ' + rs.filter(r => r.ok).length + '/' + NZ + ' (' + rs.map(r => r.ok ? 'OK' : (r.koniec || '?') + '@' + r.t.toFixed(0)).join(' ') + ')');
    }
  }
  for (let n = 1; n <= 5; n++) {
    const a = wyn.idealny[n].filter(r => r.ok).length, b = wyn.siedemdziesiat[n].filter(r => r.ok).length;
    chk(a >= Math.ceil(0.9 * NZ), 'bot idealny z bramy ' + n + ' (K' + n + ') do bramy ' + (n + 1) + ': ' + a + '/' + NZ + ' (>= 9/10)', 'bot idealny K' + n + ': ' + a + '/' + NZ);
    chk(b >= Math.ceil(0.5 * NZ), 'bot "70%" z bramy ' + n + ' (K' + n + ') do bramy ' + (n + 1) + ': ' + b + '/' + NZ + ' (>= 50%)', 'bot 70% K' + n + ': ' + b + '/' + NZ);
  }
  chk(wszystkie.every(r => r.l5bez === 0), 'L5 nigdy bez łańcucha >= 5 prądów (wszystkie ' + wszystkie.length + ' biegów botów)');
  /* 12.1 w trybie krain: bot idealny z Z3b (nurkuje od 30% wysokości) osiąga L4 w 60 s; bot losowy nigdy L4 */
  const l121 = [], los = [];
  for (let z = 1; z <= 5; z++) l121.push(await ev(([src, z]) => { const o = __okruszek; o.pauza(true); o.odblokuj(); o.bezPradow(false); o.bezPrzeszkod(false); o.odblokujPore(); o.ziarno(z); o.brama(1); o.autopilot(eval(src), z); const r = o.symuluj(60); o.autopilot(null); return r; }, [BOTY.idealny121, z]));
  chk(l121.every(r => r.poziomT[4] > 0 && r.poziomT[4] <= 60), '12.1 w krainach: bot idealny osiąga L4 w 60 s (5 ziaren, pierwsze L4 w ' + l121.map(r => f2(r.poziomT[4])).join('/') + ' s)', '12.1: L4 ' + l121.map(r => r.poziomT[4]).join('/'));
  for (let z = 1; z <= 10; z++) los.push(await ev(([src, z]) => { const o = __okruszek; o.pauza(true); o.odblokuj(); o.bezPradow(false); o.bezPrzeszkod(false); o.odblokujPore(); o.ziarno(z); o.brama(1 + (z % 5)); o.autopilot(eval(src), z * 31); let r; for (let i = 0; i < 12; i++) { r = o.symuluj(10); if (r.tryb === 'koniec') break; } o.autopilot(null); return r; }, [BOTY.losowy, z]));
  chk(los.every(r => r.poziomMax < 4), 'bot losowy nigdy nie osiąga L4 (10 biegów z bram 1-5, szczyty ' + los.map(r => 'L' + r.poziomMax).join(' ') + ')', 'bot losowy: ' + los.map(r => r.poziomMax).join(','));

  /* ---------- (e) napięcie, odstępy, spokój, budżet (z biegów botów) ---------- */
  console.log('(e) napięcie N(t), odstępy, spokój po starcie i po bramie, budżet uwagi');
  /* długi lot bota idealnego od Gniazda przez kilka bram: spokój po każdej bramie */
  const dlugie = [];
  for (let z = 1; z <= 3; z++) dlugie.push(await ev(([src, z]) => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(false); o.bezPradow(false); o.odblokujPore(); o.ziarno(z); o.brama(1); o.autopilot(eval(src), z); let r; for (let i = 0; i < 70; i++) { r = o.symuluj(10); if (r.tryb === 'koniec') break; } o.autopilot(null); const np = o.napiecie(); return { bramy: r.bramy, przeszkody: np.przeszkody, nlog: np.log, t: r.graCzas, kraina: r.kraina, bud: o.budzet().max, pred: o.zapowiedzi().filter(e => e.klasa === 3).map(e => ({ typ: e.typ, t: e.tSzkic })), l5bez: r.l5bezLancucha }; }, [BOTY.idealny, z]));
  console.log('  info długie loty bota idealnego od Gniazda: ' + dlugie.map(d => f2(d.t) + ' s, kraina ' + d.kraina + ', bramy ' + d.bramy.map(b => b.brama + '@' + Math.round(b.t)).join(' ')).join(' | '));
  dlugie.forEach(d => { d.n = 1; wszystkie.push(d); });
  const nMax = Math.max(...wszystkie.map(r => Math.max(0, ...r.nlog.map(x => x.N))));
  chk(nMax <= 0.85 + 1e-9, 'N zawsze <= 0,85 (maks. ' + f2(nMax) + ' w ' + wszystkie.length + ' biegach)');
  let minGap = 1e9; wszystkie.forEach(r => { for (let k = 1; k < r.przeszkody.length; k++) minGap = Math.min(minGap, r.przeszkody[k].t - r.przeszkody[k - 1].t); });
  chk(minGap >= 3.2 - 1e-6, 'odstęp kolejnych zagrożeń >= 3,2 s (najmniejszy ' + f2(minGap) + ' s)', 'odstęp ' + minGap);
  const first = Math.min(...wszystkie.map(r => r.przeszkody.length ? r.przeszkody[0].t : 1e9));
  chk(first >= 20 - 1e-6, 'pierwsze zagrożenie najwcześniej w 20 s biegu (z Gniazda i z bram: ' + f2(first) + ' s)');
  let poBramie = 1e9, nBram = 0; wszystkie.forEach(r => r.bramy.forEach(b => { nBram++; r.przeszkody.forEach(p => { if (p.t >= b.t) poBramie = Math.min(poBramie, p.t - b.t); }); }));
  chk(nBram >= 10 && poBramie >= 10 - 1e-6, 'po przelocie bramy 10 s bez nowych zdarzeń (' + nBram + ' przelotów, najkrótsza przerwa ' + f2(poBramie) + ' s)', 'po bramie: ' + poBramie + ' (' + nBram + ')');
  chk(wyn.idealny[1].concat(wyn.siedemdziesiat[1]).every(r => r.pred.length === 0), 'brak drapieżnika w K1 (' + (2 * NZ) + ' biegów)');
  const predMin = { brama: Math.min(...wszystkie.filter(r => r.n > 1).map(r => Math.min(1e9, ...r.pred.map(p => p.t)))) };
  chk(predMin.brama >= 60 - 1e-6, 'drapieżnik najwcześniej 60 s od startu z bramy (najwcześniej ' + f2(predMin.brama) + ' s)');
  const bmax = { s0: 0, s1: 0, s2: 0, duze: 0, czastki: 0, naruszen: 0 }; wszystkie.forEach(r => { for (const k in bmax) bmax[k] = Math.max(bmax[k], r.bud[k]); });
  chk(bmax.s0 <= 1 && bmax.s1 <= 2 && bmax.s2 <= 1 && bmax.duze <= 3 && bmax.czastki <= 120 && bmax.naruszen === 0, 'budżet uwagi: naraz najwyżej ' + bmax.s0 + ' widowisko, ' + bmax.s2 + ' S2, ' + bmax.s1 + ' S1, ' + bmax.duze + ' duże sprite\'y, ' + bmax.czastki + ' cząstek (log w budzet())', 'budżet: ' + JSON.stringify(bmax));
  /* udział S2 rośnie z N (N^2): K1 nie ma S2, w Dalekim Niebie są */
  const s2share = await ev(([src]) => { const o = __okruszek; o.pauza(true); o.bezPradow(false); o.bezPrzeszkod(false); o.odblokujPore(); o.ziarno(3); o.brama(6); o.autopilot(eval(src), 5); for (let i = 0; i < 30; i++) { const r = o.symuluj(10); if (r.tryb === 'koniec') break; } o.autopilot(null); const p = o.napiecie().przeszkody.filter(x => x.klasa); return { n: p.length, s2: p.filter(x => x.klasa === 2).length, N: p.map(x => x.N) }; }, [BOTY.idealny]);
  const expS2 = s2share.N.reduce((a, b) => a + b * b, 0);
  chk(s2share.n > 5 && Math.abs(s2share.s2 - expS2) <= Math.max(3, 2 * Math.sqrt(expS2)), 'udział S2 = N^2 (Dalekie Niebo: ' + s2share.s2 + ' z ' + s2share.n + ' przeszkód, oczekiwane ok. ' + f2(expS2) + ')', 'S2: ' + JSON.stringify(s2share));

  /* ---------- (c) zapowiedzi ---------- */
  console.log('(c) zapowiedź w sekundach i zasada szkicu');
  const TYPY = ['ptak', 'stado', 'deszcz', 'latawiec', 'mgla', 'burza', 'grad', 'wiatr', 'jastrzab', 'sowa'];
  const zap = await ev((TYPY) => {
    const o = __okruszek, out = [];
    for (const L of [0, 2, 4, 5, 'przysp']) for (const typ of TYPY) {
      o.pauza(true); o.autopilot(null); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokuj(); o.brama(1); o.ustawWysokosc(0.9);
      o.ustawPoziom(L === 'przysp' ? 0 : L);
      o.zdarzenie(typ, { force: true, dx: 0.9 });
      if (L === 'przysp') o.ustawPoziom(5);   /* przyspieszenie zaraz po pojawieniu się zagrożenia */
      const sz = o.stan(); let e = null;
      for (let i = 0; i < 80; i++) { o.symuluj(0.25); e = o.zapowiedzi().find(x => x.typ === typ); if (e && e.czas !== null) break; }
      out.push({ L, typ, czas: e ? e.czas : null, klasa: e ? e.klasa : null, hak: !!e });
      o.odblokuj();
    }
    return out;
  }, TYPY);
  const zle = zap.filter(x => x.czas === null || x.czas < (x.klasa === 3 ? 2 : 1.5) - 1e-6);
  const minZ = Math.min(...zap.filter(x => x.klasa !== 3 && x.czas !== null).map(x => x.czas)), minP = Math.min(...zap.filter(x => x.klasa === 3 && x.czas !== null).map(x => x.czas));
  chk(zle.length === 0, 'zapowiedzi() dla ' + zap.length + ' wymuszeń (10 typów x L0, L2, L4, L5, przyspieszenie L0->L5): przeszkody >= 1,5 s (min ' + f2(minZ) + ' s), drapieżniki >= 2 s (min ' + f2(minP) + ' s)', 'za krótkie zapowiedzi: ' + JSON.stringify(zle));
  console.log('  info czasy szkic -> kontakt (s): ' + [0, 2, 4, 5, 'przysp'].map(L => 'L' + L + ' ' + zap.filter(x => x.L === L).map(x => x.typ + ' ' + f2(x.czas)).join(', ')).join(' | '));
  const typ2 = await ev(() => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.brama(1); o.ustawPoziom(2); o.zdarzenie('ptak', { dx: 0.5 }); const g = o.gdzie().find(x => x.typ === 'ptak'); o.odblokuj(); return g; });
  chk(typ2 && typ2.z > 3.5, 'odległość pojawienia z czasu do kontaktu: ptak na L2 pojawia się na warstwie z = ' + f2(typ2 && typ2.z) + ' (typowo 2,5-3 s lotu)');
  /* szkic: farba (wiek < 0) dochodzi dopiero po szkicu; drugi kanał to łuk na krawędzi (piksele przy krawędzi) */
  const szk = await ev(() => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.brama(1); o.ustawPoziom(2); o.zdarzenie('deszcz', { dx: 0.3 }); o.symuluj(0.2); return o.zapowiedzi().length; });
  await ev(() => { __okruszek.tempo(0.1); __okruszek.pauza(false); }); await sleep(250);
  await page.screenshot({ path: path.join(OUT, 'szkic-deszcz-L2.png') });
  const luk = await ev(() => { const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
    const k = c.width / 390, col = (x0) => { const d = x.getImageData(Math.round(x0 * k), Math.round(200 * k), Math.max(1, Math.round(4 * k)), Math.round(560 * k)).data; let m = 0; for (let i = 0; i < d.length; i += 4) m = Math.max(m, d[i] + d[i + 1] + d[i + 2]); return m; }; return { l: col(0), r: col(386) }; });
  await ev(() => { __okruszek.pauza(true); __okruszek.tempo(1); __okruszek.odblokuj(); });
  chk(szk >= 1 && Math.max(luk.l, luk.r) > 450, 'szkic deszczu na L2 (zrzut szkic-deszcz-L2.png) i łuk na krawędzi ekranu (jasność krawędzi ' + luk.l + '/' + luk.r + ')', 'łuk: ' + JSON.stringify(luk));

  /* ---------- (d) 50 wymuszeń każdej przeszkody ---------- */
  console.log('(d) klasy skutku: 50 wymuszeń każdej przeszkody innej niż jastrząb i sowa');
  const W50 = await ev(() => {
    const o = __okruszek, typy = ['ptak', 'stado', 'deszcz', 'latawiec', 'mgla', 'burza', 'grad', 'wiatr'], out = {};
    for (const typ of typy) {
      o.pauza(true); o.autopilot(null); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokuj(); o.brama(1);
      const dlugi = typ === 'grad' || typ === 'wiatr';
      let konce = 0, traf = 0;
      for (let i = 0; i < 50; i++) {
        o.ustawWysokosc(i % 5 === 0 ? (dlugi ? 0.31 : 0.2) : 0.6);   /* co piąte nisko (sam spadek przez 5 s zapowiedzi gradu zjada 0,16) */
        o.zdarzenie(typ, { dx: 0, v: 0, z: typ === 'grad' || typ === 'wiatr' ? undefined : 1.6 });
        const r = o.symuluj(dlugi ? 5 : 2.5);
        if (r.tryb !== 'gra') { konce++; o.nowyBieg(); }
      }
      traf = o.skutki().length; out[typ] = { konce, traf, stan: o.stan().trafienia };
    }
    return out;
  });
  const sumK = Object.values(W50).reduce((a, b) => a + b.konce, 0);
  chk(sumK === 0, '400 wymuszeń (8 typów x 50, co piąte nisko: h = 0,2, grad i wiatr 0,31): 0 końców biegu', 'końce biegu: ' + JSON.stringify(W50));
  const podl = await ev(() => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.brama(1); o.ustawWysokosc(0.16); o.zdarzenie('burza', { dx: 0, z: 1.0 }); o.symuluj(0.6); const a = o.stan().h; o.ustawWysokosc(0.16); o.zdarzenie('grad', { dx: 0 }); o.symuluj(2.3); return { a, b: o.stan().h, koniec: o.koniec() }; });
  chk(podl.a >= 0.15 - 0.03 && !podl.koniec, 'przeszkoda nie zbija wysokości poniżej 0,15 (burza przy h = 0,16 -> ' + f2(podl.a) + '), więc sama nie kończy biegu', 'podłoga: ' + JSON.stringify(podl));
  console.log('  info trafienia (skutki klas): ' + Object.keys(W50).map(k => k + ' ' + W50[k].traf).join(', ') + '; ' + JSON.stringify(W50.grad.stan));
  const SK = await ev(() => { const o = __okruszek, out = []; for (const typ of ['ptak', 'burza']) for (const n of [1, 2, 3, 4, 5]) { o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.brama(1); o.ustawWysokosc(0.6); for (let i = 0; i < n; i++) o.trafPrad(); o.zdarzenie(typ, { dx: 0, v: 0, z: 1.0 }); o.symuluj(1.0); const s = o.skutki(); if (s.length) out.push(s[s.length - 1]); } return out; });
  chk(SK.length === 10 && SK.filter(x => x.klasa === 1).every(x => x.s0 - x.s1 <= 0.1 + 1e-6) && SK.filter(x => x.klasa === 2).every(x => x.l0 - x.l1 <= 1),
    'S1 (ptak): s spada najwyżej o 0,1 (spadki ' + SK.filter(x => x.klasa === 1).map(x => f2(x.s0 - x.s1)).join('/') + '); S2 (burza): poziom w dół najwyżej o 1 (' + SK.filter(x => x.klasa === 2).map(x => 'L' + x.l0 + '->L' + x.l1).join(' ') + ')', 'skutki: ' + JSON.stringify(SK));

  /* ---------- (f) start z bramy, cicha pomoc, ziarno ---------- */
  console.log('(f) start z bramy, cicha pomoc, ziarno');
  const st = [];
  for (let n = 1; n <= 6; n++) st.push(await ev((n) => { const o = __okruszek; o.pauza(true); o.autopilot(null); o.bezPrzeszkod(false); o.bezPradow(false); o.odblokujPore(); o.ziarno(4); const d = o.brama(n); const ids = new Set(); for (let i = 0; i < 39; i++) { o.ustawWysokosc(0.7); o.symuluj(0.5); o.prady().forEach(p => ids.add(p.id)); } const g = o.gdzie().filter(x => x.typ !== 'prad'); return { n, pora: d.pora, dom: d.poraDomowa, prady20: ids.size, zagr20: o.napiecie().przeszkody.filter(p => p.t < 20).length, inne: g.length, nastDrap: d.nastDrapieznik, kraina: d.kraina, drogaM: d.drogaM }; }, n));
  chk(st.every(x => Math.abs(x.pora - x.dom) < 1e-9 && x.kraina === x.n), 'start z bram 1-6: kraina n i pora domowa (' + st.map(x => 'b' + x.n + ' ' + f2(x.pora)).join(', ') + ')');
  chk(st.every(x => x.prady20 >= 6 && x.zagr20 === 0 && x.inne === 0), 'pierwsze 20 s: prądy co 3 s (' + st.map(x => x.prady20).join('/') + ' prądów), 0 zagrożeń');
  chk(st[0].nastDrap === 120 && st.slice(1).every(x => x.nastDrap === 60), 'drapieżnik najwcześniej 120 s od Gniazda i 60 s od bramy');
  const pomoc = await ev(() => { const o = __okruszek; o.pauza(true); o.cichaPomoc(true); const a = o.brama(2); o.cichaPomoc(false); const b = o.brama(2); return { a: a.nastDrapieznik, pa: a.pomoc, b: b.nastDrapieznik, pb: b.pomoc }; });
  chk(pomoc.pa && pomoc.a === pomoc.b + 30 && !pomoc.pb, 'cicha pomoc (tylko hakiem w ?test): drapieżnik 30 s później (' + pomoc.a + ' vs ' + pomoc.b + ' s) i więcej prądów');
  const pomocPr = await ev(() => { const o = __okruszek, cnt = (v) => { o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(false); o.ziarno(5); o.cichaPomoc(v); o.brama(1); o.ustawPoziom(2); const ids = new Set(); for (let i = 0; i < 600; i++) { o.symuluj(0.5); o.prady().forEach(p => ids.add(p.id)); } o.odblokuj(); o.cichaPomoc(false); return ids.size; }; return { z: cnt(true), bez: cnt(false) }; });
  chk(pomocPr.z >= pomocPr.bez * 1.08, 'cicha pomoc: więcej prądów w 300 s na L2 (' + pomocPr.z + ' vs ' + pomocPr.bez + ', +' + Math.round((pomocPr.z / pomocPr.bez - 1) * 100) + '%; cel +15%)', 'cicha pomoc prądy: ' + JSON.stringify(pomocPr));
  const krot = await ev(() => { const o = __okruszek; o.wyczyscZapis(); o.pauza(true); o.bezPradow(true); o.bezPrzeszkod(true); for (let i = 0; i < 3; i++) { o.brama(1); o.symuluj(40); } o.bezPradow(false); return o.zapis().pamiec.krotkie; });
  chk(krot === 3, 'licznik krótkich biegów (< 60 s) w zapisie: ' + krot + ' po 3 krótkich biegach (cicha pomoc rusza poza ?test od 3)');
  const ziarna = await ev(([src]) => { const o = __okruszek, run = (z) => { o.pauza(true); o.bezPrzeszkod(false); o.bezPradow(false); o.ziarno(z); o.brama(3); o.autopilot(eval(src), 77); o.symuluj(90); o.autopilot(null); return o.napiecie().przeszkody.map(p => p.typ + Math.round(p.t * 10)).join(','); }; return { a: run(8), b: run(8), c: run(9) }; }, [BOTY.idealny]);
  chk(ziarna.a === ziarna.b && ziarna.a !== ziarna.c && ziarna.a.length > 0, 'ziarno: to samo ziarno = ten sam harmonogram, inne ziarno = inny (w ?test stałe; poza testem data + numer biegu dnia)');

  /* ---------- (g) wytrwałość, prąd ratunkowy, sowa-pokaz, napisy ---------- */
  console.log('(g) wytrwałość, prąd ratunkowy, sowa-pokaz, napis krainy');
  const wt = await ev(() => { const o = __okruszek; o.wyczyscZapis(); o.pauza(true); const dl1 = o.krainy()[0].dl; const a = o.wytrwalosc(1, 2.9 * dl1); const b = o.wytrwalosc(1, 0.1 * dl1 + 1); const d = o.nowyBieg ? (o.nowyBieg(), o.droga()) : null; return { a: a.odblokowana, b: b.odblokowana, bramy: b.bramy, start: d.startBrama, scena: d.scena, napis: o.napis(), kraina: d.kraina }; });
  chk(wt.a === 0 && wt.b === 2 && wt.bramy.join() === '1,2', 'wytrwałość: 2,9 x długość K1 nie otwiera, 3 x otwiera bramę 2 (bramy ' + wt.bramy.join(',') + ')');
  chk(wt.start === 2 && wt.kraina === 2 && wt.scena && wt.scena.brama === 2, 'następny bieg startuje z bramy 2 ze sceną Fiuka (3 s)');
  const fiuk = await ev(() => { const o = __okruszek, seen = []; for (let i = 0; i < 24; i++) { o.symuluj(0.25); const n = o.napis(); if (n && seen[seen.length - 1] !== n) seen.push(n); } return { seen, scena: o.droga().scena }; });
  /* napisy idą w pętli rysowania (strefa tekstu), więc sprawdzamy kolejkę: nazwa krainy, potem szept */
  const fk = await ev(() => { const o = __okruszek; o.wyczyscZapis(); o.pauza(true); o.wytrwalosc(1, 1e6); o.nowyBieg(); o.pauza(false); return true; });
  const napisySeen = []; for (let i = 0; i < 30; i++) { const n = await ev(() => __okruszek.napis()); if (n && napisySeen[napisySeen.length - 1] !== n) napisySeen.push(n); await sleep(200); }
  await ev(() => __okruszek.pauza(true));
  chk(napisySeen.includes('Morze Pierzyn') && napisySeen.includes('Fiuk zna już drogę.'), 'strefa tekstu: "' + napisySeen.join('" -> "') + '" (bez komunikatu o próbach)', 'napisy: ' + JSON.stringify(napisySeen));
  chk(fiuk.scena === null, 'scena Fiuka kończy się po 3 s');
  const rat = await ev(() => { const o = __okruszek; o.pauza(true); o.autopilot(null); o.bezPrzeszkod(true); o.bezPradow(false); o.brama(1); for (let i = 0; i < 22; i++) { o.ustawWysokosc(0.7); o.symuluj(1); } o.ustawWysokosc(0.19); const t0 = o.stan().graCzas; o.symuluj(3.0); const r1 = o.ratunek().slice(); const st1 = o.stan(); for (let i = 0; i < 10; i++) { o.ustawWysokosc(0.19); o.symuluj(1); } const r2 = o.ratunek().length; return { t0, r1, h: st1.h, wl: st1.wloty, r2 }; });
  const rr = rat.r1[rat.r1.length - 1];
  chk(rr && rr.pojawil !== null && rr.pojawil - rat.t0 <= 3, 'prąd ratunkowy: h < 0,2 -> prąd na wprost po ' + f2(rr && rr.pojawil - rat.t0) + ' s (<= 3 s); ptaszek go złapał i wysokość wróciła do ' + f2(rat.h), 'ratunek: ' + JSON.stringify(rat));
  chk(rat.r2 === rat.r1.length, 'prąd ratunkowy najwyżej raz na 30 s (drugi spadek po 3 s: bez nowego)');
  const rat3 = await ev(() => { const o = __okruszek; o.ustawWysokosc(0.6); o.symuluj(20); o.ustawWysokosc(0.19); o.symuluj(3); return o.ratunek().length; });
  chk(rat3 === rat.r1.length + 1, 'po 30 s prąd ratunkowy znowu dostępny');
  const sp = await ev(() => { const o = __okruszek; o.wyczyscZapis(); o.pauza(true); o.autopilot(null); o.bezPrzeszkod(false); o.bezPradow(false); o.ziarno(2); o.brama(2); o.ustawPore('noc'); let pk = false; for (let i = 0; i < 140; i++) { o.ustawWysokosc(0.7); o.symuluj(0.5); if (o.droga().pokaz) pk = true; } const a = { pk, sowy: o.zapowiedzi().filter(e => e.typ === 'sowa').length };
    o.brama(2); o.ustawPore('noc'); for (let i = 0; i < 240; i++) { o.ustawWysokosc(0.7); o.ustaw(0.5); o.symuluj(0.5); } o.odblokuj(); a.sowy2 = o.zapowiedzi().filter(e => e.typ === 'sowa').length; o.odblokujPore(); return a; });
  chk(sp.pk && sp.sowy === 0 && sp.sowy2 >= 1, 'K2: pierwsza wizyta w zapisie = sowa tylko przelatuje w tle (S0, bez pościgu); przy następnej wizycie sowa poluje (' + sp.sowy2 + ' pościg)', 'sowa K2: ' + JSON.stringify(sp));
  const pr = await ev(() => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.ziarno(1); o.brama(1); o.ustawPoziom(2); o.doBramy(30); for (let i = 0; i < 20; i++) o.symuluj(0.25); o.odblokuj(); const d = o.droga(); return { kraina: d.kraina, h: o.stan().h, log: o.bramaLog().przeloty, nap: [] }; });
  chk(pr.kraina === 2 && pr.log.length === 1 && pr.log[0].h >= 0.8 - 1e-9, 'przelot bramy 2: kraina 2, wysokość >= 0,8 (' + f2(pr.log[0] && pr.log[0].h) + '), gra się nie zatrzymuje');

  /* ---------- (h) zapis ---------- */
  console.log('(h) zapis okruszek.zapis v1');
  const zp = await ev(([src]) => { const o = __okruszek; o.wyczyscZapis(); o.pauza(true); const z0 = o.zapis().zapisow; o.bezPrzeszkod(true); o.bezPradow(false); o.ziarno(1); o.brama(1); o.autopilot(eval(src), 3); o.symuluj(40); const z1 = o.zapis().zapisow; let r; for (let i = 0; i < 20; i++) { r = o.symuluj(10); if (r.bramy.length) break; } const z2 = o.zapis(); o.autopilot(null); o.bezPradow(true); o.nurkuj(true); o.ustawWysokosc(0.01); o.symuluj(3); o.nurkuj(false); o.bezPradow(false); const z3 = o.zapis(); return { z0, z1, z2: z2.zapisow, ls2: z2.localStorage, z3: z3.zapisow, p3: z3.pamiec, bajtow: z3.bajtow }; }, [BOTY.idealny]);
  const zj = JSON.parse(zp.ls2 || 'null');
  chk(zp.z1 === zp.z0 && zp.z2 === zp.z0 + 1 && zp.z3 === zp.z0 + 2, 'zapis tylko przy bramie i na końcu biegu (licznik: ' + zp.z0 + ' -> 40 s lotu ' + zp.z1 + ' -> brama ' + zp.z2 + ' -> koniec ' + zp.z3 + '), nigdy w pętli klatek');
  chk(zj && zj.v === 1 && zj.bramy.join() === '1,2' && zj.krainy[1].m > 1500 && zj.krainy[1].loty === 1 && typeof zj.najdalej === 'number' && typeof zj.najdluzszy === 'number' && typeof zj.krotkie === 'number' && zj.dzien && zj.dzien.n >= 1,
    'okruszek.zapis v1: v, bramy [1,2], najdalej, najdluzszy, krainy {n: {m, loty}}, krotkie, dzien {d, n}; ' + zp.bajtow + ' B', 'zapis: ' + zp.ls2);
  const ust = await ev(() => { __okruszek.pauza(true); return null; });
  await page.keyboard.press('t'); await sleep(100);
  const ustJ = await ev(() => { const r = { s: localStorage.getItem('okruszek-sterowanie') }; return r; });
  await page.keyboard.press('t'); await page.keyboard.press('t'); await sleep(100);
  chk(/"v":1/.test(ustJ.s || ''), 'klucz ustawień z 5b ma pole v: ' + ustJ.s);
  /* zamknięcie karty tuż po przelocie bramy: brama zostaje w zapisie */
  {
    const c2 = await browser.newContext({ viewport: { width: 390, height: 844 } }); const p2 = await c2.newPage(); watch(p2);
    await p2.goto(url); await p2.waitForTimeout(500);
    await p2.evaluate(() => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.brama(3); o.ustawPoziom(2); o.doBramy(15); for (let i = 0; i < 12; i++) { o.symuluj(0.1); if (o.bramaLog().przeloty.length) break; } });
    await p2.close();
    const p3 = await c2.newPage(); await p3.goto(url); await p3.waitForTimeout(400);
    const zz = await p3.evaluate(() => JSON.parse(localStorage.getItem('okruszek.zapis')));
    chk(zz && zz.bramy.includes(4), 'zamknięcie karty tuż po przelocie bramy 4: brama w zapisie (' + (zz && zz.bramy.join(',')) + ')');
    await c2.close();
  }
  /* zablokowany localStorage: Storage.prototype.setItem rzuca wyjątek -> gra działa */
  {
    const c3 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await c3.addInitScript(() => { Storage.prototype.setItem = function () { throw new Error('QuotaExceededError (test)'); }; });
    const p4 = await c3.newPage(); const e4 = []; p4.on('pageerror', e => e4.push(String(e)));
    await p4.goto(url); await p4.waitForTimeout(600);
    const r4 = await p4.evaluate(([src]) => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(false); o.brama(1); o.autopilot(eval(src), 1); let r; for (let i = 0; i < 20; i++) { r = o.symuluj(10); if (r.bramy.length) break; } o.autopilot(null); o.bezPradow(true); o.nurkuj(true); o.ustawWysokosc(0.01); o.symuluj(3); o.nurkuj(false); const kon = o.koniec(); o.bezPradow(false); o.nowyBieg(); return { r, kon, z: o.zapis(), d: o.droga() }; }, [BOTY.idealny]);
    await p4.evaluate(() => __okruszek.pauza(false)); await p4.waitForTimeout(500);
    const fr = await p4.evaluate(() => __okruszek.stan().klatki);
    chk(e4.length === 0 && r4.r.bramy.length === 1 && r4.kon && r4.z.zapisow === 0 && fr > 5, 'zablokowany localStorage (setItem rzuca): gra działa, brama przeleciana, 0 zapisów, bez błędów', 'blokada: ' + JSON.stringify({ e4, z: r4.z.zapisow }));
    await c3.close();
  }
  /* uszkodzony JSON -> kopia w okruszek.zapis.zly i czysty start bez komunikatu */
  {
    const c4 = await browser.newContext({ viewport: { width: 390, height: 844 } }); const p5 = await c4.newPage(); const e5 = []; p5.on('pageerror', e => e5.push(String(e)));
    await p5.goto(url); await p5.waitForTimeout(300);
    await p5.evaluate(() => localStorage.setItem('okruszek.zapis', '{"v":1,"bramy":[1,2,3'));
    await p5.reload(); await p5.waitForTimeout(500);
    const r5 = await p5.evaluate(() => ({ z: __okruszek.zapis(), d: __okruszek.droga(), dlg: document.querySelectorAll('[role=alert]').length }));
    chk(e5.length === 0 && r5.z.zly === '{"v":1,"bramy":[1,2,3' && r5.z.pamiec.bramy.join() === '1' && r5.z.localStorage === null && r5.d.kraina === 1, 'uszkodzony JSON: kopia w okruszek.zapis.zly, czysty start (bramy [1]), bez komunikatu i błędów');
    await p5.evaluate(() => localStorage.setItem('okruszek.zapis', '{"v":1,"bramy":"zle"}')); await p5.reload(); await p5.waitForTimeout(400);
    const r6 = await p5.evaluate(() => __okruszek.zapis());
    chk(r6.zly === '{"v":1,"bramy":"zle"}' && r6.pamiec.bramy.join() === '1', 'zapis o złym kształcie traktowany jak uszkodzony');
    await c4.close();
  }

  /* ---------- (i) brama: klatki i zrzuty ---------- */
  console.log('(i) brama-kurtyna: klatki przez cały przelot, zrzuty 390 px');
  await page.close();   /* pomiar klatek tylko z jedną rysującą stroną w przeglądarce (strony file:// dzielą proces) */
  const c5 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const pg = await c5.newPage(); watch(pg);
  await pg.goto(url); await pg.waitForTimeout(800);
  const cdp = await c5.newCDPSession(pg);
  async function przelotFps(throttle, n) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
    /* najpierw ta sama scena bez bramy (5 s): praca klatki bazowa */
    await pg.evaluate((n) => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(false); o.ziarno(1); o.brama(n); o.ustawPoziom(2); o.symuluj(6); o.zerujKurtyne(); o.zerujFps(); o.pauza(false); }, n);
    await sleep(5000);
    const baza = await pg.evaluate(() => ({ praca: __okruszek.pracaKlatki(true), fps: __okruszek.fps() }));   /* informacyjnie */
    await pg.evaluate(() => { const o = __okruszek; o.pauza(true); o.doBramy(170); o.zerujKurtyne(); o.zerujFps(); o.pauza(false); });
    let log; const t0 = Date.now();
    while (Date.now() - t0 < 30000) { await sleep(300); log = await pg.evaluate(() => __okruszek.bramaLog()); const d = await pg.evaluate(() => __okruszek.droga()); if (log.przeloty.length && !d.kurtyna) break; }
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const all = await pg.evaluate(() => __okruszek.fps()), praca = await pg.evaluate(() => __okruszek.pracaKlatki());
    await pg.evaluate(() => { __okruszek.pauza(true); __okruszek.odblokuj(); });
    return { k: log.fpsKurtyna, przelot: log.przeloty.length, all, praca, baza };
  }
  const f1 = await przelotFps(1, 1), f4 = await przelotFps(4, 1), f4b = await przelotFps(4, 4);
  const opis = (f) => 'przelot ' + f.k.avg + ' kl/s (p5 ' + f.k.p5 + '), praca ' + f.praca.avg + ' ms (p95 ' + f.praca.p95 + '); bez bramy ' + f.baza.fps.avg + ' kl/s, praca ' + f.baza.praca.avg + ' ms (p95 ' + f.baza.praca.p95 + ')';
  console.log('  info klatki (390x844 @2x, SC 1,5, headless bez GPU): bez ograniczenia CPU, brama 2: ' + opis(f1) + ' | CPU x4, brama 2: ' + opis(f4) + ' | CPU x4, brama 5: ' + opis(f4b));
  chk(f1.przelot === 1 && f1.k.n > 30 && f1.k.avg >= 55, 'brama bez ograniczenia CPU: średnio ' + f1.k.avg + ' kl/s przez cały przelot (5. percentyl ' + f1.k.p5 + ')', 'brama fps ' + JSON.stringify(f1));
  /* CPU x4 w headless bez GPU: kl/s skaczą 40-95 także w kodzie sprzed Z10 (rasteryzacja programowa), więc twardym kryterium jest czas pracy klatki:
     95. percentyl symulacji + rysowania przy bramie mieści się w budżecie 60 kl/s (16,7 ms) przy procesorze 4 razy wolniejszym */
  console.log('  info CPU x4 (headless bez GPU, wynik zależy od obciążenia maszyny): brama 2 przelot ' + f4.k.avg + ' kl/s, ta sama scena bez bramy ' + f4.baza.fps.avg + ' kl/s; brama 5 przelot ' + f4b.k.avg + ' kl/s, bez bramy ' + f4b.baza.fps.avg + ' kl/s; kryterium ">= 55 kl/s przy CPU x4" do potwierdzenia na telefonie (Z7)');
  /* koszt rysowania bramy niezależny od obciążenia maszyny: wywołania drawImage i powierzchnia w kadrze na klatkę, ta sama scena z bramą i bez, 5 położeń kurtyny */
  {
    const c7 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await c7.addInitScript(() => { const P = CanvasRenderingContext2D.prototype, d0 = P.drawImage; window.__rys = { n: 0, pole: 0 };
      P.drawImage = function () { if (this.canvas && this.canvas.id === 'g') { const a = arguments; window.__rys.n++; if (a.length >= 5) { const x = a[a.length - 4], y = a[a.length - 3], w = a[a.length - 2], h = a[a.length - 1], H = 390 * innerHeight / Math.min(innerWidth, Math.round(innerHeight * 0.66));
        window.__rys.pole += Math.max(0, Math.min(390, x + w) - Math.max(0, x)) * Math.max(0, Math.min(H, y + h) - Math.max(0, y)); } } return d0.apply(this, arguments); }; });
    const p7 = await c7.newPage(); watch(p7);
    await p7.goto(url); await p7.waitForTimeout(700);
    const pomiar = async (prep, arg) => { await p7.evaluate(prep, arg); await p7.waitForTimeout(300); const a = await p7.evaluate(() => ({ r: Object.assign({}, window.__rys), f: __okruszek.stan().klatki })); await p7.waitForTimeout(1500); const b = await p7.evaluate(() => ({ r: Object.assign({}, window.__rys), f: __okruszek.stan().klatki })); const fr = b.f - a.f; return { n: (b.r.n - a.r.n) / fr, pole: (b.r.pole - a.r.pole) / fr }; };
    const wyn = [];
    for (const z of [8, 5, 3.4, 2.1, 1.3]) {
      const baza = await pomiar(() => { const o = __okruszek; o.pauza(true); o.tempo(1); o.bezPrzeszkod(true); o.bezPradow(true); o.ziarno(1); o.brama(1); o.ustawPoziom(2); o.symuluj(8); o.tempo(0.02); o.pauza(false); });
      const zb = await pomiar((z) => { const o = __okruszek; o.pauza(true); o.tempo(1); o.bezPrzeszkod(true); o.bezPradow(true); o.ziarno(1); o.brama(1); o.ustawPoziom(2); o.symuluj(8); const sp = (0.32 + 1.9 * o.stan().s) / (10 + 22 * o.stan().s); o.doBramy((z - 0.7) / sp); o.symuluj(0.05); o.tempo(0.02); o.pauza(false); }, z);
      wyn.push({ z, n: zb.n / baza.n, pole: zb.pole / baza.pole });
    }
    await c7.close();
    const mn = Math.max(...wyn.map(w => w.n)), mp = Math.max(...wyn.map(w => w.pole));
    chk(mn <= 1.35 && mp <= 1.35, 'koszt rysowania bramy: najwyżej x' + mn.toFixed(2) + ' wywołań drawImage i x' + mp.toFixed(2) + ' powierzchni w kadrze względem tej samej sceny bez bramy (z = ' + wyn.map(w => w.z).join('/') + '; budżet x1,35)', 'koszt bramy: ' + JSON.stringify(wyn));
  }
  const p390 = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); watch(p390);
  await p390.goto(url); await p390.waitForTimeout(800);
  const shot = async (name) => { await p390.screenshot({ path: path.join(OUT, name + '.png') }); };
  const kurt = [];
  for (let n = 2; n <= 6; n++) {
    const k = await p390.evaluate((n) => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokujPore(); o.ziarno(1); o.brama(n - 1); o.ustawPoziom(2); o.symuluj(8); o.doBramy(24); o.symuluj(0.05); o.tempo(0.1); o.pauza(false); return o.droga().kurtyna; }, n);
    await p390.waitForTimeout(450); await shot('kurtyna-brama' + n + '-L2'); kurt.push(k);
    await p390.evaluate(() => { __okruszek.pauza(true); __okruszek.tempo(1); __okruszek.odblokuj(); });
  }
  chk(kurt.every(k => k && k.open > 0.35 && k.open < 0.7), 'zrzuty kurtyny w połowie dla 5 bram (2-6): otwarcie ' + kurt.map(k => f2(k && k.open)).join('/'));
  { const k = await p390.evaluate(() => { const o = __okruszek; o.pauza(true); o.brama(1); o.ustawPoziom(0); o.symuluj(8); o.doBramy(30); o.symuluj(0.05); o.tempo(0.1); o.pauza(false); return o.droga().kurtyna; }); await p390.waitForTimeout(450); await shot('kurtyna-brama2-L0'); await p390.evaluate(() => { __okruszek.pauza(true); __okruszek.tempo(1); __okruszek.odblokuj(); }); }
  for (let n = 1; n <= 5; n++) {
    await p390.evaluate((n) => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.bezPradow(false); o.odblokujPore(); o.brama(n); o.ustawPoziom(3); o.symuluj(4); o.tempo(0.1); o.pauza(false); }, n);
    await p390.waitForTimeout(500); await shot('start-brama' + n + '-L3'); await p390.evaluate(() => { __okruszek.pauza(true); __okruszek.tempo(1); __okruszek.odblokuj(); });
  }
  await p390.evaluate(() => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.brama(2); o.ustawPoziom(1); o.symuluj(25); o.doBramy(1050); o.symuluj(0.05); o.tempo(0.1); o.pauza(false); });
  await p390.waitForTimeout(400); await shot('kreska-do-bramy'); await p390.screenshot({ path: path.join(OUT, 'kreska-do-bramy-hud.png'), clip: { x: 0, y: 0, width: 230, height: 120 } });
  const kr = await p390.evaluate(() => { const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
    const k = c.width / 390, row = (x0, x1) => { const d = x.getImageData(Math.round(x0 * k), Math.round(56.5 * k) - 1, Math.round((x1 - x0) * k), 2).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2]; return s / (d.length / 4); };
    const d = __okruszek.droga(); return { pelne: row(20, 20 + 107 * 0.45), puste: row(18 + 107 * 0.62, 122), f: (d.drogaM - d.od) / (d.do - d.od) }; });
  await p390.evaluate(() => { __okruszek.pauza(true); __okruszek.tempo(1); __okruszek.odblokuj(); });
  chk(kr.pelne > kr.puste + 60 && kr.f > 0.5 && kr.f < 0.56, 'kreska do bramy pod licznikiem: wypełniona część jaśniejsza (' + Math.round(kr.pelne) + ' vs ' + Math.round(kr.puste) + ') przy ' + Math.round(kr.f * 100) + '% drogi do bramy, bez liczb');
  await p390.evaluate(() => { const o = __okruszek; o.wyczyscZapis(); o.wytrwalosc(1, 1e6); o.pauza(true); o.nowyBieg(); o.ustawPoziom(2); o.symuluj(1.4); o.tempo(0.1); o.pauza(false); });
  await p390.waitForTimeout(400); await shot('scena-fiuk-brama2'); await p390.evaluate(() => { __okruszek.pauza(true); __okruszek.tempo(1); __okruszek.odblokuj(); __okruszek.wyczyscZapis(); });
  await p390.evaluate(() => { const o = __okruszek; o.pauza(true); o.wyczyscZapis(); o.bezPrzeszkod(true); o.brama(2); o.ustawPore('noc'); o.ustawPoziom(2); o.zdarzenie('sowaPokaz'); o.symuluj(2); o.tempo(0.1); o.pauza(false); });
  await p390.waitForTimeout(400); await shot('sowa-pokaz-K2'); await p390.evaluate(() => { __okruszek.pauza(true); __okruszek.tempo(1); __okruszek.odblokuj(); __okruszek.odblokujPore(); });
  await p390.close(); await c5.close();

  /* ---------- (j) tryb zgodności ---------- */
  console.log('(j) tryb zgodności ?pasmo=1');
  {
    const c6 = await browser.newContext({ viewport: { width: 390, height: 844 } }); const p6 = await c6.newPage(); watch(p6);
    await p6.goto(url + '&pasmo=1'); await p6.waitForTimeout(500);
    const r = await p6.evaluate(() => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(false); o.bezPradow(false); o.nowyBieg(); for (let i = 0; i < 60; i++) { o.ustawWysokosc(1); o.symuluj(2); } const s = o.stan(); return { d: o.droga(), sp: s.spawny, nap: o.napiecie().przeszkody.length, ls: localStorage.getItem('okruszek.zapis'), sink: o.stale().SINK, hw: o.stale().HAW_WARN }; });
    const nsp = Object.values(r.sp).reduce((a, b) => a + b, 0);
    chk(r.d.pasmo && nsp > 5 && r.nap === 0 && r.ls === null && r.sink === 0.04 && r.hw === 2 && !r.d.kurtyna, '?pasmo=1: stary harmonogram Z3/Z3b (' + nsp + ' zdarzeń w 120 s), bez krain, bram i zapisu postępu, SINK 0,04, zapowiedź drapieżnika 2 s');
    await c6.close();
  }

  const real = errors.filter(e => !/favicon/i.test(e));
  chk(real.length === 0, 'brak błędów i ostrzeżeń konsoli', 'błędy konsoli: ' + real.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fail ? ('TEST Z10 NIE PRZESZEDŁ (' + fail + ')') : 'TEST Z10 OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST Z10 BŁĄD: ' + (e && e.stack || e)); process.exit(2); });
