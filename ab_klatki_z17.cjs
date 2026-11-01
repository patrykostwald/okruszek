/* Z17: pomiar A/B klatek (mediana z RUND rund naprzemiennych) dla sceny testu Z11 (j): samolot Wielkiego przelotu i 5 wież na ekranie, L2, h 0,85.
   Wersje: Z5 (baza testu Z11), Z11 (przed Z14/Z15), Z17 swobodny (?swobodny=1) i Z17 tor (?tor=1, ta sama scena przez zdarzenia toru: samolot w wierszu i szpile).
   Każda runda mierzy wszystkie wersje w kolejności przesuniętej o rundę (A/B/C/D, B/C/D/A, ...), więc obciążenie maszyny rozkłada się równo.
   Wynik: mediana kl/s i mediana czasu pracy klatki (ms, __okruszek.cpu, mniej wrażliwy na obciążenie). Użycie: node ab_klatki_z17.cjs [rundy=5] */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const CHROME = 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe';
const RUNDY = +process.argv[2] || 5;
const P = (f) => 'file:///' + path.resolve(__dirname, f).replace(/\\/g, '/');
const WER = [
  { n: 'Z5', u: P('../gra-okruszek-Z5/index.html') + '?test&seed=23', sc: 'z5' },
  { n: 'Z11', u: P('../gra-okruszek-Z11/index.html') + '?test&seed=23', sc: 'z11' },
  { n: 'Z17 swobodny', u: P('index.html') + '?test&swobodny=1&seed=23', sc: 'z11' },
  { n: 'Z17 tor', u: P('index.html') + '?test&tor=1&seed=23', sc: 'tor' }
];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const med = (a) => { const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const err = [];
  const scena = async (w) => {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    p.on('pageerror', e => err.push(w.n + ': ' + e));
    await p.goto(w.u); await p.waitForTimeout(700);
    const info = await p.evaluate((sc) => { const o = __okruszek; if (o.z11Zbuduj) o.z11Zbuduj(); o.pauza(true);
      if (sc === 'tor') { o.odblokuj(); o.brama(5); o.ustawPoziom(2); o.idz(1, 1, true);
        o.zdarzenie('samolot', { k: 0, w: 0, z: 2.4 }); o.zdarzenie('szpile', { k: 0, w: 1, z: 3.2 }); o.zdarzenie('szpile', { k: 2, w: 1, z: 3.8 }); o.zdarzenie('szpile', { k: 0, w: 2, z: 4.6 }); o.zdarzenie('szpile', { k: 2, w: 2, z: 5.2 });
        o.tempo(0.012); o.pauza(false); return { n: o.gdzie().length }; }
      o.bezPrzeszkod(true); o.bezPradow(true); o.odblokuj(); o.brama(5); o.ustawPoziom(2); o.ustawWysokosc(0.85); o.symuluj(0.5);
      let g = null; if (sc === 'z11') { o.zdarzenie('przelot', { dx: 0, wiry: true }); o.symuluj(0.7); o.zdarzenie('szpile', { uklad: 'rzad', dx: 0, z: 5.6, n: 5 }); o.symuluj(0.9); g = o.gdzie(); }
      o.tempo(0.012); o.pauza(false);
      if (!g) return null; const pl = g.find(x => x.typ === 'przelot'), sz = g.find(x => x.typ === 'szpile');
      return { samolot: !!(pl && pl.ex > 0 && pl.ex < 390), wiez: sz ? sz.wieze.filter(w => w.ex > -20 && w.ex < 410).length : 0 }; }, w.sc);
    await sleep(900); await p.evaluate(() => { __okruszek.zerujFps(); if (__okruszek.zerujCpu) __okruszek.zerujCpu(); });
    await sleep(3500);
    const f = await p.evaluate(() => ({ fps: __okruszek.fps().avg, cpu: __okruszek.cpu ? __okruszek.cpu().sr : null }));
    await p.close(); return { info, fps: f.fps, cpu: f.cpu };
  };
  const R = WER.map(() => []);
  for (let r = 0; r < RUNDY; r++) for (let i = 0; i < WER.length; i++) { const k = (i + r) % WER.length; R[k].push(await scena(WER[k])); }
  console.log('A/B klatek: ' + RUNDY + ' rund naprzemiennych, 390x844 @2x, headless');
  WER.forEach((w, k) => console.log('  ' + w.n.padEnd(13) + ' kl/s mediana ' + med(R[k].map(x => x.fps)).toFixed(1) + ' [' + R[k].map(x => x.fps.toFixed(0)).join(' ') + ']'
    + '  praca klatki ms mediana ' + (R[k][0].cpu === null ? '-' : med(R[k].map(x => x.cpu)).toFixed(2) + ' [' + R[k].map(x => (+x.cpu).toFixed(2)).join(' ') + ']') + '  scena ' + JSON.stringify(R[k][0].info)));
  const m = (k) => med(R[k].map(x => x.fps));
  console.log('  stosunek Z17 swobodny / Z5: ' + (m(2) / m(0)).toFixed(3) + ', Z17 swobodny / Z11: ' + (m(2) / m(1)).toFixed(3) + ', Z17 tor / Z17 swobodny: ' + (m(3) / m(2)).toFixed(3));
  if (err.length) console.log('  błędy: ' + err.slice(0, 4).join(' | '));
  await browser.close();
})();
