/* Okruszek Z4: szybka kontrola progów pikselowych z testów Z3 i Z3b (te same miary i progi, bez botów).
   Użycie: node kontrola_z4.cjs [plik.html] [skok] - nasycenie L0..L4 (zachód), L0/L1/L4 w każdej porze, noc s=0 i s=1, (skok) jasność klatek przy L5. */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await p.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23'); await sleep(800);
  const ev = (f, a) => p.evaluate(f, a);
  const fresh = () => ev(() => { const o = __okruszek; o.odblokuj(); o.odblokujPore(); o.nurkuj(false); o.przesun(null); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.nowyBieg(); o.noc(false); });
  const metr = () => ev(() => { const bgb = __okruszek.tlo(), bgc = Math.max(...bgb) - Math.min(...bgb), c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
    const d = x.getImageData(0, 0, t.width, t.height).data, sc = c.width / 390, bw = 90 * sc, bcx = c.width / 2, bcy = 0.76 * c.height; let ex = 0, tot = 0, col = 0;
    for (let y = 0; y < t.height; y += 2) for (let xx = 0; xx < t.width; xx += 2) { if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bw) continue; if (y < 90 * sc) continue; const i = (y * t.width + xx) * 4, ch = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]); tot++; ex += Math.max(0, ch - bgc); if (ch > bgc + 10) col++; }
    return { ex: ex / tot, kol: col / tot }; });
  const sat = () => ev(() => { const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
    const d = x.getImageData(0, 0, t.width, t.height).data, sc = c.width / 390, bw = 90 * sc, bh = 90 * sc, bcx = c.width / 2, bcy = 0.76 * c.height; let n = 0, tot = 0, n30 = 0;
    for (let y = 0; y < t.height; y += 2) for (let xx = 0; xx < t.width; xx += 2) { if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bh) continue; const i = (y * t.width + xx) * 4, mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); tot++; if (mx - mn > 60) n++; if (mx - mn > 30) n30++; } return { n, tot, n30 }; });
  let fail = 0; const chk = (ok, m) => { if (!ok) fail++; console.log((ok ? '  ok   ' : '  FAIL ') + m); };
  const chr = [];
  for (let n = 0; n <= 4; n++) { await fresh(); await ev(() => __okruszek.ustawPore('zachod')); await ev((q) => __okruszek.ustawPoziom(q), n); await sleep(900); chr.push(await metr()); }
  console.log('  info zachód L0..L4 nadwyżka/barwne: ' + chr.map(c => c.ex.toFixed(1) + '/' + c.kol.toFixed(3)).join('  '));
  chk(chr[0].ex < 5 && chr[0].kol < 0.05, 'L0 sam kontur'); chk(chr[1].ex < 8 && chr[1].kol < 0.25, 'L1 niskie nasycenie');
  chk(chr[2].ex >= chr[1].ex && chr[3].ex > chr[2].ex && chr[4].ex >= chr[3].ex * 0.9 && chr[2].kol > chr[1].kol && chr[3].kol > chr[2].kol && chr[4].kol > chr[3].kol, 'nasycenie i barwne piksele rosną z poziomem');
  const chrP = {};
  for (const pr of ['noc', 'swit', 'dzien', 'zachod']) { await fresh(); await ev((q) => __okruszek.ustawPore(q), pr); await ev(() => __okruszek.ustawPoziom(0)); await sleep(800); const a0 = await metr(); await ev(() => __okruszek.ustawPoziom(1)); await sleep(800); const a1 = await metr(); await ev(() => __okruszek.ustawPoziom(4)); await sleep(900); const a4 = await metr(); chrP[pr] = [a0.ex, a1.ex, a4.ex]; }
  console.log('  info pory L0/L1/L4: ' + Object.keys(chrP).map(k => k + ' ' + chrP[k].map(v => v.toFixed(1)).join('/')).join(', '));
  chk(Object.keys(chrP).every(k => chrP[k][0] < 5 && chrP[k][2] > 10 && chrP[k][2] > chrP[k][1] + 8), 'każda pora: L0 < 5, L4 > 10 i > L1 + 8');
  const sn = {};
  for (const v of [0, 1]) { await ev((x) => { const o = __okruszek; o.odblokuj(); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.nowyBieg(); o.noc(true); o.ustaw(x); }, v); await sleep(900); sn[v] = await sat(); }
  chk(sn[0].n / sn[0].tot < 0.002, 'noc s=0: brak nasyconych pikseli (' + sn[0].n + ')'); chk(sn[1].n30 / sn[1].tot > 0.4, 'noc s=1: kolor wypełnia obraz (' + (100 * sn[1].n30 / sn[1].tot).toFixed(0) + '%)');
  if (process.argv[3]) {
    await fresh(); await ev(() => { __okruszek.odblokujPore(); __okruszek.ustawPoziom(5); __okruszek.ustawPore(0.6, false); }); await sleep(2500);
    const fr = await ev(() => new Promise(res => { const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = 39; t.height = 84; const x = t.getContext('2d', { willReadFrequently: true }); const vals = []; let lastF = -1, t0 = performance.now();
      (function tick() { const sF = __okruszek.stan().klatki; if (sF !== lastF) { lastF = sF; x.drawImage(c, 0, 0, t.width, t.height); const d = x.getImageData(0, 0, 39, 84).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; vals.push([s / (d.length / 4), __okruszek.pora()]); } if (performance.now() - t0 > 16500) { res(vals); return; } requestAnimationFrame(tick); })(); }));
    let mf = 0, at = 0; for (let i = 1; i < fr.length; i++) { const dd = Math.abs(fr[i][0] - fr[i - 1][0]); if (dd > mf) { mf = dd; at = fr[i][1]; } }
    const big = fr.filter((v, i) => i && Math.abs(v[0] - fr[i - 1][0]) > 4).map(v => v[1].toFixed(3));
    chk(mf < 6, 'L5 skok jasności między klatkami ' + mf.toFixed(2) + ' (pora ' + at.toFixed(3) + '; skoki > 4 przy porach: ' + big.slice(0, 12).join(',') + ')');
  }
  await b.close(); console.log(fail ? 'KONTROLA: ' + fail + ' FAIL' : 'KONTROLA OK');
})();
