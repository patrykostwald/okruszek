/* QA C: analiza plastrów z długich biegów bota idealnego (K1-K6): zajęte komórki na plaster, S2 pod rząd, oddech po S2, odstęp plastrów w czasie,
   udział plastrów pustych, czas od pojawienia się plastra do kontaktu. Wynik: qa/wynik_c3.json */
const { serwer, przegladarka, sleep, zapiszJson, fs, path } = require('./wspolne.cjs');
const z14 = fs.readFileSync(path.join(__dirname, '..', 'gra_test_z14.cjs'), 'utf8');
const BOT_TOR = z14.slice(z14.indexOf('const BOT_TOR = `') + 17, z14.indexOf('})()`;') + 4);
(async () => {
  const srv = await serwer(8741); const br = await przegladarka();
  const pg = await br.newPage(); await pg.goto('http://127.0.0.1:8741/?test&tor=1&seed=2'); await sleep(900);
  const R = await pg.evaluate((BOT) => {
    const O = window.__okruszek, out = {}; O.pauza(true); O.panel(false);
    for (const kr of [1, 2, 3, 4, 5, 6]) {
      const zaj = {}, S2 = 'fBHT'; let s2Rzad = 0, s2bezOddechu = 0, plN = 0, puste = 0, odst = [], czasy = [], maxZaj = 0, s2n = 0;
      for (let i = 0; i < 4; i++) {
        O.ziarno(60 + kr * 10 + i); O.brama(kr); O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false);
        const bot = (0, eval)(BOT); let t = 0; while (t < 200) { const r = O.torSymuluj(1, bot, 1 / 60); t = r.graCzas; if (r.tryb !== 'gra') break; }
        const P = O.torLog().plastry.filter(p => !p.wstawiony && p.tKontakt !== null).sort((a, b) => a.tKontakt - b.tKontakt);
        for (let j = 0; j < P.length; j++) {
          const g = P[j].g.join(''); const n = g.replace(/[.]/g, '').replace(/[UuDF<>ZX]/g, '').length; zaj[n] = (zaj[n] || 0) + 1; maxZaj = Math.max(maxZaj, n); plN++;
          if (/[^.]/.test(g) === false) puste++;
          if (j) odst.push(P[j].tKontakt - P[j - 1].tKontakt);
          if (P[j].czas !== null) czasy.push(P[j].czas);
          const ma2 = /[fBHT]/.test(g); if (ma2) s2n++;
          if (ma2 && j + 1 < P.length) { const g2 = P[j + 1].g.join(''); if (/[fBHT]/.test(g2)) s2Rzad++; if (g2.replace(/[.UuDF<>ZXo]/g, '').length > 0) s2bezOddechu++; }
        }
      }
      odst.sort((a, b) => a - b); czasy.sort((a, b) => a - b);
      out['K' + kr] = { plastrow: plN, pustych: puste, zajeteRozklad: zaj, maxZajetych: maxZaj, s2: s2n, s2PodRzad: s2Rzad, s2NastepnyZPrzeszkoda: s2bezOddechu, odstepMin: +odst[0].toFixed(2), odstepMed: +odst[odst.length >> 1].toFixed(2), zapowiedzMin: +czasy[0].toFixed(2), zapowiedzMed: +czasy[czasy.length >> 1].toFixed(2) };
    }
    return out;
  }, BOT_TOR);
  console.log(JSON.stringify(R, null, 0));
  zapiszJson('wynik_c3.json', R); await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
