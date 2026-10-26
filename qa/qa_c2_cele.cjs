/* QA runda 1, punkt C (uzupełnienie): czy L4 / L5 (Turbo, Hiper) są osiągalne w torze; gdzie atakują drapieżniki (kraina, pora);
   skąd długie puste odcinki; ile czasu stukacz spędza w nadchmurzu. Wynik: qa/wynik_c2.json */
const { serwer, przegladarka, sleep, zapiszJson, fs, path } = require('./wspolne.cjs');
const z14 = fs.readFileSync(path.join(__dirname, '..', 'gra_test_z14.cjs'), 'utf8');
const BOT_TOR = z14.slice(z14.indexOf('const BOT_TOR = `') + 17, z14.indexOf('})()`;') + 4);
(async () => {
  const srv = await serwer(8735); const br = await przegladarka();
  const pg = await br.newPage({ viewport: { width: 390, height: 844 } });
  await pg.goto('http://127.0.0.1:8735/?test&tor=1&seed=11'); await sleep(900);
  const R = await pg.evaluate((BOT) => {
    const O = window.__okruszek, out = {};
    O.pauza(true); O.panel(false);
    /* 1. bot idealny + nurkowanie przy łańcuchu >= 3 (i gdy nie ma celu), 20 biegów po 240 s */
    const nurek = (base) => { const b = (0, eval)(base); return function (A) { const r = b(A) || {}; if (!r.ruch && r.stuk === undefined && A.lancuch >= 2 && A.kom.wiersz < A.ROWS - 1) r.nurkuj = true; return r; }; };
    const L = [];
    for (let i = 0; i < 20; i++) {
      O.ziarno(500 + i); O.brama(1 + (i % 6)); O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false);
      const bot = nurek(BOT); let t = 0, smax = 0, lmax = 0, l4 = null, l5 = 0, lan = 0, w12 = 0;
      while (t < 240) { const r = O.torSymuluj(0.25, bot, 1 / 60); t = r.graCzas; smax = Math.max(smax, r.s); lmax = Math.max(lmax, r.poziom); if (r.poziom >= 4 && l4 === null) l4 = t; if (r.poziom >= 5) l5 += 0.25; const lc = O.lancuch(); lan = Math.max(lan, lc.n); w12 = Math.max(w12, lc.w12); if (r.tryb !== 'gra') break; }
      L.push({ smax: +smax.toFixed(3), lmax, l4, l5, lancuchMax: lan, w12max: w12 });
    }
    out.nurek = L;
    /* 2. wymuszony długi łańcuch: wzorzec w09 i w14 (5 wiatrów) wstawiany co 3 s, bot idealny + nurkowanie */
    const L2 = [];
    for (let i = 0; i < 6; i++) {
      O.ziarno(900 + i); O.brama(6); O.odblokuj(); O.bezPrzeszkod(true); O.bezPradow(true);
      const bot = nurek(BOT); let t = 0, smax = 0, lmax = 0, l5 = 0, k = 0, lan = 0, w12 = 0;
      while (t < 90) { if (t >= k * 4) { O.wzorzec(['w09', 'w14', 'w01', 'w05'][k % 4]); k++; } const r = O.torSymuluj(0.25, bot, 1 / 60); t = r.graCzas; smax = Math.max(smax, r.s); lmax = Math.max(lmax, r.poziom); if (r.poziom >= 5) l5 += 0.25; const lc = O.lancuch(); lan = Math.max(lan, lc.n); w12 = Math.max(w12, lc.w12); if (r.tryb !== 'gra') break; }
      L2.push({ smax: +smax.toFixed(3), lmax, l5, lancuchMax: lan, w12max: w12, wejscia: O.torLog().wejscia.length, idealne: O.torLog().wejscia.filter(e => e.idealne).length });
    }
    O.bezPrzeszkod(false); O.bezPradow(false);
    out.wymuszony = L2; out.stale = O.stale();
    /* 3. ataki drapieżników: kraina i pora w chwili ataku (bot idealny, 12 biegów po 300 s z bram 1-6) */
    const AT = [], LUKI = [];
    for (let i = 0; i < 12; i++) {
      O.ziarno(700 + i); O.brama(1 + (i % 6)); O.odblokuj();
      const bot = (0, eval)(BOT); let t = 0, nA = 0, ostNiepusty = null, kontaktyPrzed = 0;
      while (t < 300) {
        const r = O.torSymuluj(0.25, bot, 1 / 60); t = r.graCzas; const Lg = O.torLog(), st = O.stan();
        while (nA < Lg.ataki.length) { const a = Lg.ataki[nA++]; AT.push({ t: +a.t.toFixed(1), typ: a.typ, kraina: O.kraina().kraina, pora: st.poraNazwa, w: a.w }); }
        const niep = Lg.plastry.filter(p => p.tKontakt !== null && /[^.,]/.test(p.g.join(''))).map(p => p.tKontakt);
        if (niep.length) { const ost = Math.max(...niep); if (t - ost > 8 && t > 25) { if (!LUKI.length || LUKI[LUKI.length - 1].od !== +ost.toFixed(1)) LUKI.push({ bieg: i, od: +ost.toFixed(1), jastrzab: !!st.jastrzab, faza: st.jastrzab && st.jastrzab.faza, kraina: O.kraina().kraina, kurtyna: !!O.kraina().kurtyna, scena: !!O.kraina().scena, pokaz: O.kraina().pokaz, cisza: O.kraina().cisza }); } }
        if (r.tryb !== 'gra') break;
      }
    }
    out.ataki = AT; out.luki = LUKI;
    /* 4. stukacz: udział czasu w wierszach 0/1/2 */
    const ST = { 0: 0, 1: 0, 2: 0 };
    for (let i = 0; i < 6; i++) { O.ziarno(300 + i); O.brama(1 + i); O.odblokuj(); let nast = 0; const bot = (A) => { if (A.t < nast) return {}; nast = A.t + 0.7; return { stuk: 0 }; }; let t = 0; while (t < 200) { const r = O.torSymuluj(0.25, bot, 1 / 60); t = r.graCzas; ST[r.kom.wiersz] += 0.25; if (r.tryb !== 'gra') break; } }
    out.stukaczWiersze = ST;
    return out;
  }, BOT_TOR);
  zapiszJson('wynik_c2.json', R);
  const sum = (a, f) => a.reduce((x, y) => x + f(y), 0);
  console.log('nurek: lmax', R.nurek.map(x => x.lmax).join(''), 'smax max', Math.max(...R.nurek.map(x => x.smax)), 'L4 runs', R.nurek.filter(x => x.l4 !== null).length, 'L5 s', sum(R.nurek, x => x.l5), 'lancuchMax', Math.max(...R.nurek.map(x => x.lancuchMax)), 'w12max', Math.max(...R.nurek.map(x => x.w12max)));
  console.log('wymuszony:', JSON.stringify(R.wymuszony));
  console.log('stale', JSON.stringify(R.stale).slice(0, 400));
  const pk = {}; R.ataki.forEach(a => { const k = a.typ + '@K' + a.kraina + '/' + a.pora; pk[k] = (pk[k] || 0) + 1; }); console.log('ataki wg krainy/pory', JSON.stringify(pk));
  console.log('luki > 8 s', R.luki.length, JSON.stringify(R.luki.slice(0, 12)));
  console.log('stukacz wiersze (s)', JSON.stringify(R.stukaczWiersze));
  await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
