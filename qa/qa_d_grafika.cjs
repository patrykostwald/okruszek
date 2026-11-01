/* QA runda 1, punkt D: grafika i czytelność. Zrzuty L0-L5 x pory (świt, dzień, zachód, noc) w 390x844 na scenie z naturalnym torem (K3 po 40 s lotu bota),
   podzbiór w 360x640, 412x915, 1440x900 i poziomo 844x390; pomiary: płynność przejścia kolorów (E 0..1 co 0,1), cienkie ciemne linie, zieleń, czerwień poza szalikiem,
   kontrast HUD (DYSTANS, nazwa poziomu), elementy poza ekranem. Wynik: qa/wynik_d.json + qa/zrzuty/D*.png */
const { serwer, przegladarka, sleep, zapiszJson, ZRZUTY, fs, path } = require('./wspolne.cjs');
const z14 = fs.readFileSync(path.join(__dirname, '..', 'gra_test_z14.cjs'), 'utf8');
const BOT_TOR = z14.slice(z14.indexOf('const BOT_TOR = `') + 17, z14.indexOf('})()`;') + 4);
const MIERZ = () => {
  const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height;
  const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
  const W = t.width, H = t.height, d = x.getImageData(0, 0, W, H).data, sc = W / window.__okruszek.stan().W, p = window.__okruszek.ptakEkran(), bw = 70 * sc, bcx = p.x * sc, bcy = p.y * sc, T = 16;
  let dol = 0, n = 0, zie = 0, cz = 0, tot = 0, Ls = 0, Ss = 0, hist = new Array(8).fill(0);
  const L = (i) => 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  for (let y = Math.round(90 * sc); y < H - 2; y += 1) for (let xx = 2; xx < W - 2; xx += 1) {
    const i = y * W + xx, q = i * 4, r = d[q], g = d[q + 1], b = d[q + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), ch = mx - mn, l = L(i);
    if ((y & 1) === 0 && (xx & 1) === 0) { tot++; Ls += l; Ss += mx ? ch / mx : 0; if (ch > 24 && g === mx && g > r + 10 && g > b + 4) zie++; const ptak = Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bw; if (!ptak && r === mx && ch > 60 && r > 120 && r > g * 1.6 && r > b * 1.4) cz++; const hu = ch > 20 ? Math.floor(((mx === r ? ((g - b) / ch + 6) % 6 : mx === g ? (b - r) / ch + 2 : (r - g) / ch + 4) / 6) * 8) % 8 : -1; if (hu >= 0) hist[hu]++; }
    if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bw) continue;
    n++; const a = L(i - 2), bb = L(i + 2), u = L(i - 2 * W), v = L(i + 2 * W);
    if ((l < a - T && l < bb - T) || (l < u - T && l < v - T)) dol++;
  }
  return { dol: +(dol / n).toFixed(4), zie: +(zie / tot).toFixed(4), czerwien: +(cz / tot).toFixed(5), jasnosc: +(Ls / tot).toFixed(1), nasycenie: +(Ss / tot).toFixed(3), odcienie: hist.filter(h => h > tot * 0.01).length };
};
/* kontrast tekstu HUD: w pudełku (x0,y0,w,h w px CSS) jasność 3% najjaśniejszych pikseli wobec mediany tła; zwraca stosunek kontrastu WCAG */
const KONTRAST = (boxes) => {
  const c = document.getElementById('g'), k = c.width / innerWidth, t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return boxes.map(([nm, x0, y0, w, h]) => { const D = x.getImageData(Math.round(x0 * k), Math.round(y0 * k), Math.round(w * k), Math.round(h * k)).data, Ls = []; for (let i = 0; i < D.length; i += 4) Ls.push(0.2126 * lin(D[i]) + 0.7152 * lin(D[i + 1]) + 0.0722 * lin(D[i + 2])); Ls.sort((a, b) => a - b); const bg = Ls[Math.floor(Ls.length * 0.5)], hi = Ls[Math.floor(Ls.length * 0.98)], lo = Ls[Math.floor(Ls.length * 0.02)]; const cr = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); return { nm, jasny: +cr(hi, bg).toFixed(2), ciemny: +cr(lo, bg).toFixed(2) }; });
};

(async () => {
  const srv = await serwer(8736); const br = await przegladarka();
  const W = { sceny: {}, przejscie: {}, rozmiary: {} };
  const scena = async (pg, nazwa, L, pora, opcje = {}) => {
    await pg.evaluate(([L, pora, BOT, o]) => {
      const O = window.__okruszek; O.tempo(1); O.pauza(true); O.panel(false); O.ziarno(77); O.brama(o.kraina || 3); O.odblokuj(); O.ustawEnergie(null); O.bezPrzeszkod(false); O.bezPradow(false);
      O.torSymuluj(o.lot || 42, (0, eval)(BOT), 1 / 60);
      O.ustawPore(pora); O.ustawPoziom(L); O.pauza(false);
    }, [L, pora, BOT_TOR, opcje]);
    await sleep(700); await pg.evaluate(() => window.__okruszek.tempo(0.05)); await sleep(500);
    await pg.screenshot({ path: path.join(ZRZUTY, nazwa + '.png') });
    const m = await pg.evaluate(MIERZ);
    await pg.evaluate(() => window.__okruszek.tempo(1));
    return m;
  };
  const PORY = ['swit', 'dzien', 'zachod', 'noc'];
  /* 390 x 844: pełna macierz */
  {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const pg = await ctx.newPage(); const bl = []; pg.on('pageerror', e => bl.push(e.message));
    await pg.goto('http://127.0.0.1:8736/?test&tor=1&seed=5'); await sleep(900);
    await pg.evaluate(() => { window.__okruszek.z11Zbuduj(); window.__okruszek.torSprite(); });
    for (const pora of PORY) for (const L of [0, 1, 2, 3, 4, 5]) { const m = await scena(pg, 'D1-390-' + pora + '-L' + L, L, pora); W.sceny['390-' + pora + '-L' + L] = m; console.log(pora, L, JSON.stringify(m)); }
    /* HUD: nazwa poziomu i kontrast przy L0 dzień, L0 noc, L3 zachód */
    for (const [pora, L] of [['dzien', 0], ['noc', 0], ['zachod', 3], ['swit', 1]]) {
      await scena(pg, 'D2-hud-' + pora + '-L' + L, L, pora);
      W['hud-' + pora + '-L' + L] = { kontrast: await pg.evaluate(KONTRAST, [['DYSTANS-etykieta', 14, 8, 70, 14], ['dystans-liczba', 14, 22, 60, 26], ['nazwa-poziomu', 132, 54, 52, 14], ['WYSOKOSC-etykieta', 300, 8, 76, 14]]), nazwa: await pg.evaluate(() => window.__okruszek.hudNazwa()) };
      console.log('hud', pora, L, JSON.stringify(W['hud-' + pora + '-L' + L]));
    }
    /* płynność: E od 0 do 1 co 0,1 przy każdej porze; skok jasności i nasycenia między krokami */
    for (const pora of PORY) {
      const rz = [];
      for (let e = 0; e <= 1.0001; e += 0.1) {
        await pg.evaluate(([pora, e]) => { const O = window.__okruszek; O.tempo(1); O.pauza(true); O.ziarno(9); O.brama(1); O.odblokuj(); O.bezPrzeszkod(true); O.bezPradow(true); O.ustawPore(pora); O.ustawEnergie(e); O.idz(1, 1, true); O.pauza(false); }, [pora, e]);
        await sleep(500); await pg.evaluate(() => window.__okruszek.tempo(0.05)); await sleep(350);
        const m = await pg.evaluate(MIERZ); rz.push({ E: +e.toFixed(1), ...m });
        if (pora === 'dzien' && [0, 3, 6, 10].includes(Math.round(e * 10))) await pg.screenshot({ path: path.join(ZRZUTY, 'D3-E' + e.toFixed(1) + '-dzien.png') });
      }
      let skokL = 0, skokS = 0; for (let i = 1; i < rz.length; i++) { skokL = Math.max(skokL, Math.abs(rz[i].jasnosc - rz[i - 1].jasnosc)); skokS = Math.max(skokS, Math.abs(rz[i].nasycenie - rz[i - 1].nasycenie)); }
      W.przejscie[pora] = { rz, maxSkokJasnosci: +skokL.toFixed(1), maxSkokNasycenia: +skokS.toFixed(3), zakresJasnosci: [Math.min(...rz.map(r => r.jasnosc)), Math.max(...rz.map(r => r.jasnosc))], nasycenieE0: rz[0].nasycenie, nasycenieE1: rz[rz.length - 1].nasycenie };
      console.log('przejscie', pora, JSON.stringify({ skokL, skokS, E0: rz[0], E1: rz[rz.length - 1] }));
    }
    await pg.evaluate(() => { const O = window.__okruszek; O.ustawEnergie(null); O.bezPrzeszkod(false); O.bezPradow(false); O.tempo(1); });
    /* ekrany startu i końca bez ?test nie są dostępne hakiem: start przez ?test&start */
    W.bledy390 = bl; await ctx.close();
  }
  /* inne rozmiary: L0 dzień, L3 zachód, L5 noc + ekran startu i końca */
  for (const [w, h] of [[360, 640], [412, 915], [1440, 900], [844, 390]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w > 900 ? 1 : 2, hasTouch: w < 900, isMobile: w < 900 });
    const pg = await ctx.newPage(); const bl = []; pg.on('pageerror', e => bl.push(e.message));
    await pg.goto('http://127.0.0.1:8736/?test&tor=1&start&seed=5'); await sleep(1100);
    await pg.screenshot({ path: path.join(ZRZUTY, 'D4-' + w + 'x' + h + '-start.png') });
    const ui = await pg.evaluate(() => { const out = []; document.querySelectorAll('#ster button, #ster input, #sterb, #ster h2, #ster .pod').forEach(b => { const r = b.getBoundingClientRect(); if (r.width) out.push({ id: b.id || b.className || b.tagName, l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) }); }); const p = document.querySelector('#ster .pan'); return { ui: out, pan: p ? { sh: p.scrollHeight, ch: p.clientHeight } : null, vw: innerWidth, vh: innerHeight, docW: document.documentElement.scrollWidth }; });
    const poza = ui.ui.filter(e => e.l < 0 || e.r > ui.vw || e.t < 0 || e.b > ui.vh);
    const nakl = []; for (let i = 0; i < ui.ui.length; i++) for (let j = i + 1; j < ui.ui.length; j++) { const a = ui.ui[i], b = ui.ui[j]; if (a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b) nakl.push(a.id + ' x ' + b.id); }
    await pg.evaluate(() => window.__okruszek.panel(false));
    const sc = {};
    for (const [L, pora] of [[0, 'dzien'], [3, 'zachod'], [5, 'noc']]) sc[pora + '-L' + L] = await scena(pg, 'D5-' + w + 'x' + h + '-' + pora + '-L' + L, L, pora);
    /* ekran końca: bierny lot do lądowania */
    await pg.evaluate(() => { const O = window.__okruszek; O.tempo(1); O.odblokuj(); O.pauza(false); O.nowyBieg(); O.torSymuluj(40, null, 1 / 60); });
    await sleep(1800); await pg.screenshot({ path: path.join(ZRZUTY, 'D6-' + w + 'x' + h + '-koniec.png') });
    const kon = await pg.evaluate(() => { const k = document.querySelector('#wynik .karta').getBoundingClientRect(), b = document.getElementById('jeszcze').getBoundingClientRect(), s = document.getElementById('sterb').getBoundingClientRect(); return { karta: [Math.round(k.top), Math.round(k.bottom)], jeszcze: [Math.round(b.top), Math.round(b.bottom), Math.round(b.width), Math.round(b.height)], sterb: [Math.round(s.left), Math.round(s.top), Math.round(s.right), Math.round(s.bottom)], vh: innerHeight, pokaz: document.getElementById('wynik').classList.contains('pokaz') }; });
    W.rozmiary[w + 'x' + h] = { start: { poza, nakladki: nakl, pan: ui.pan, docW: ui.docW, vw: ui.vw }, sceny: sc, koniec: kon, bledy: bl };
    console.log(w + 'x' + h, JSON.stringify(W.rozmiary[w + 'x' + h]).slice(0, 900));
    await ctx.close();
  }
  zapiszJson('wynik_d.json', W);
  await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
