/* Okruszek Z15: pomiar grafiki (bez progów). Użycie: node pomiar_z15.cjs [plik.html] [wyjscie.json]
   Na zamrożonej scenie (tempo 0,02) mierzy dla pór doby i poziomów L0-L5 oraz przemiatania s 0..1:
   lum = średnia jasność obrazu (bez paska HUD i okolicy ptaszka), chr = średnia chroma (max-min kanału),
   dol = ułamek pikseli w cienkiej CIEMNEJ linii (dolina jasności: piksel ciemniejszy o > T od obu sąsiadów w odległości 2 px, poziomo albo pionowo),
   grz = ułamek pikseli w cienkiej JASNEJ linii (grzbiet, np. biały kontur na granacie). */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const outF = process.argv[3] || null;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const MIERZ = () => {
  const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height;
  const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
  const W = t.width, H = t.height, d = x.getImageData(0, 0, W, H).data, sc = W / 390, bw = 90 * sc, bcx = W / 2, bcy = 0.76 * H, T = 16;
  const L = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) L[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  let lum = 0, chr = 0, tot = 0, dol = 0, grz = 0, n = 0;
  for (let y = Math.round(90 * sc); y < H - 2; y++) for (let xx = 2; xx < W - 2; xx++) {
    if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bw) continue;
    const i = y * W + xx, l = L[i];
    if ((y & 1) === 0 && (xx & 1) === 0) { const q = i * 4; lum += l; chr += Math.max(d[q], d[q + 1], d[q + 2]) - Math.min(d[q], d[q + 1], d[q + 2]); tot++; }
    n++;
    const a = L[i - 2], b = L[i + 2], u = L[i - 2 * W], v = L[i + 2 * W];
    if ((l < a - T && l < b - T) || (l < u - T && l < v - T)) dol++;
    if ((l > a + T && l > b + T) || (l > u + T && l > v + T)) grz++;
  }
  return { lum: +(lum / tot).toFixed(1), chr: +(chr / tot).toFixed(1), dol: +(dol / n).toFixed(4), grz: +(grz / n).toFixed(4) };
};
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await p.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23&pasmo=1'); await sleep(900);
  const ev = (f, a) => p.evaluate(f, a);
  const fresh = () => ev(() => { const o = __okruszek; o.odblokuj(); o.nurkuj(false); o.przesun(null); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(1); o.nowyBieg(); o.noc(false); o.tempo(0.02); });
  const wyn = { plik: file, pory: {}, przemiatanie: [] };
  for (const pora of ['zachod', 'dzien', 'noc', 'swit']) {
    await fresh(); wyn.pory[pora] = [];
    for (let n = 0; n <= 5; n++) { await ev((a) => { __okruszek.ustawPore(a[0]); __okruszek.ustawPoziom(a[1]); }, [pora, n]); await sleep(700); wyn.pory[pora].push(await ev(MIERZ)); }
    console.log(pora.padEnd(7) + wyn.pory[pora].map((m, i) => 'L' + i + ' ' + m.lum + '/' + m.chr + '/' + m.dol + '/' + m.grz).join('  '));
  }
  await fresh();
  for (let sv = 0; sv <= 1.0001; sv += 0.05) { await ev((v) => { __okruszek.ustaw(Math.min(1, v)); __okruszek.ustawPore('zachod'); }, sv); await sleep(450); const m = await ev(MIERZ); m.s = +sv.toFixed(2); wyn.przemiatanie.push(m); }
  console.log('s:     ' + wyn.przemiatanie.map(m => m.s + ':' + m.lum + '/' + m.chr).join(' '));
  const pam = await ev(() => __okruszek.pamiec()); wyn.pamiec = pam; console.log('pamiec ' + JSON.stringify(pam));
  if (outF) fs.writeFileSync(outF, JSON.stringify(wyn, null, 1));
  await b.close();
})();
