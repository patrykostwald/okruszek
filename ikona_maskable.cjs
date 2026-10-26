/* Okruszek/Crumbi Z20: ikona maskable (ikona-512-maskable.png) z tego samego tła i ptaszka co ikony Z5 (ikony.cjs), ale z ptaszkiem w strefie bezpiecznej:
   okrąg o średnicy 80% (promień 205 px z 512) ma zawierać cały rysunek ptaszka; tło pełne do krawędzi (system sam przycina). Użycie: node ikona_maskable.cjs
   Sprawdza obwiednię ptaszka (kanał alfa osobnego rysunku) i kończy kodem 1, jeśli ptaszek wystaje poza strefę bezpieczną. */
const fs = require('fs'), path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?test&seed=23'); await page.waitForTimeout(800);
  const wyn = await page.evaluate(() => {
    const SK = 4.0;   /* ta sama skala co w ikonie zwykłej; mieści się w okręgu o promieniu 205 px (sprawdzane niżej) */
    /* 1) obwiednia ptaszka: osobny, przezroczysty canvas */
    const t = document.createElement('canvas'); t.width = t.height = 512; const tx = t.getContext('2d');
    window.__okruszek.rysujPtaka(tx, 256, 268, SK, 0.9, 0, 0.02);
    const d = tx.getImageData(0, 0, 512, 512).data; let maxR = 0, x0 = 512, y0 = 512, x1 = 0, y1 = 0;
    for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) if (d[(y * 512 + x) * 4 + 3] > 8) { const r = Math.hypot(x - 256, y - 256); if (r > maxR) maxR = r; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    /* 2) ikona: to samo tło co w ikony.cjs, pełne do krawędzi */
    const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
    x.fillStyle = '#0d1224'; x.fillRect(0, 0, 512, 512);
    let g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#12183a'); g.addColorStop(0.55, '#1c1f4a'); g.addColorStop(1, '#3a2a5e'); x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    g = x.createRadialGradient(256, 470, 10, 256, 470, 330); g.addColorStop(0, 'rgba(255,170,100,0.85)'); g.addColorStop(0.35, 'rgba(240,138,75,0.4)'); g.addColorStop(1, 'rgba(240,138,75,0)'); x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    x.fillStyle = 'rgba(236,240,248,0.85)';
    [[70, 80, 2.4], [150, 40, 1.8], [420, 90, 2.6], [360, 36, 1.8], [470, 190, 1.8], [44, 200, 1.8], [250, 64, 1.6], [96, 140, 1.4], [400, 150, 1.4]].forEach(([sx, sy, r]) => { x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill(); });
    x.strokeStyle = 'rgba(236,240,248,0.55)'; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(-10, 452); x.bezierCurveTo(60, 420, 100, 452, 150, 438); x.bezierCurveTo(200, 418, 240, 450, 300, 436); x.bezierCurveTo(350, 420, 400, 448, 440, 436); x.bezierCurveTo(470, 428, 500, 440, 522, 446); x.stroke();
    window.__okruszek.rysujPtaka(x, 256, 268, SK, 0.9, 0, 0.02);
    return { url: c.toDataURL('image/png'), maxR, bbox: [x0, y0, x1, y1] };
  });
  fs.writeFileSync(path.join(__dirname, 'ikona-512-maskable.png'), Buffer.from(wyn.url.split(',')[1], 'base64'));
  await browser.close();
  console.log('promień ptaszka od środka: ' + wyn.maxR.toFixed(1) + ' px (dozwolone <= 204,8 = 80% z 512); obwiednia ' + wyn.bbox.join(','));
  if (errors.length) { console.log('BŁĘDY: ' + errors.join(' | ')); process.exit(1); }
  if (wyn.maxR > 204.8) { console.log('FAIL: ptaszek wystaje poza strefę bezpieczną'); process.exit(1); }
  console.log('ikona-512-maskable.png zapisana');
})();
