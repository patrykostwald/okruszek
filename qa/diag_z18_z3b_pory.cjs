/* Z18: rozrzut miary „pory” z gra_test_z3b.cjs (nadwyżka chroma L0 / L1 / L4 dla 4 pór doby) w N przebiegach (każdy w nowej przeglądarce, jak w teście).
   Użycie: node qa/diag_z18_z3b_pory.cjs [N=10] [plik.html]. Wynik: qa/wynik_z18_z3b_pory.json */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const N = +(process.argv[2] || 10), file = path.resolve(process.argv[3] || path.join(__dirname, '..', 'index.html'));
const url = 'file:///' + file.replace(/\\/g, '/') + '?test&seed=23&pasmo=1';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const wyn = [];
  for (let i = 0; i < N; i++) {
    const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const ev = (f, a) => page.evaluate(f, a);
    await page.goto(url); await page.waitForTimeout(1500);
    const fresh = (tempo) => ev((tp) => { const o = __okruszek; o.odblokuj(); o.nurkuj(false); o.przesun(null); o.noc(false); o.bezPradow(true); o.bezPrzeszkod(true); o.tempo(tp || 1); o.nowyBieg(); }, tempo);
    const metr = () => ev(() => { const bgb = __okruszek.tlo(), bgc = Math.max(...bgb) - Math.min(...bgb), c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
      const d = x.getImageData(0, 0, t.width, t.height).data, sc = c.width / 390, bw = 90 * sc, bcx = c.width / 2, bcy = 0.76 * c.height; let ex = 0, tot = 0, col = 0, all = [];
      for (let y = 0; y < t.height; y += 2) for (let xx = 0; xx < t.width; xx += 2) { if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bw) continue; if (y < 90 * sc) continue; const i = (y * t.width + xx) * 4, ch = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]); tot++; ex += Math.max(0, ch - bgc); all.push(ch); if (ch > bgc + 10) col++; }
      all.sort((a, b) => a - b);
      return { ex: ex / tot, kol: col / tot, p90: all[Math.floor(all.length * 0.9)] - bgc, med: all[all.length >> 1] - bgc }; });
    const ustalony = async () => { let prev = await metr(); if (!process.env.USTAL) return prev; for (let k = 0; k < 8; k++) { await sleep(400); const cur = await metr(); if (Math.abs(cur.ex - prev.ex) < 0.15) return cur; prev = cur; } return prev; };
    const out = {};
    for (const p of ['noc', 'swit', 'dzien', 'zachod']) {
      await fresh(1); await ev((q) => { __okruszek.tempo(0.02); __okruszek.ustawPore(q); }, p);
      await ev(() => __okruszek.ustawPoziom(0)); await sleep(800); const a0 = await ustalony(); await ev(() => __okruszek.ustawPoziom(1)); await sleep(800); const a1 = await ustalony(); await ev(() => __okruszek.ustawPoziom(4)); await sleep(900); const a4 = await ustalony();
      out[p] = { L0: +a0.ex.toFixed(2), L1: +a1.ex.toFixed(2), L4: +a4.ex.toFixed(2), kol: [+a0.kol.toFixed(3), +a1.kol.toFixed(3), +a4.kol.toFixed(3)], p90: [a0.p90, a1.p90, a4.p90] };
    }
    wyn.push(out); console.log(i, JSON.stringify(out));
    await browser.close();
  }
  fs.writeFileSync(path.join(__dirname, 'wynik_z18_z3b_pory.json'), JSON.stringify(wyn, null, 1));
  for (const p of ['noc', 'swit', 'dzien', 'zachod']) { const v = wyn.map(w => w[p].L4).sort((a, b) => a - b), d = wyn.map(w => w[p].L4 - w[p].L1).sort((a, b) => a - b), k = wyn.map(w => w[p].kol[2] - w[p].kol[1]).sort((a, b) => a - b);
    console.log(p, 'L4 min/med/max', v[0], v[v.length >> 1], v[v.length - 1], '| L4-L1 min', d[0].toFixed(2), '| kol L4-L1 min', k[0].toFixed(3), 'max', k[k.length - 1].toFixed(3)); }
})().catch(e => { console.error('BLAD', e); process.exit(1); });
