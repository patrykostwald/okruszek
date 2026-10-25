/* Okruszek/Crumbi Z5: generator ikon PWA z rysunku ptaszka Z4 (hak ?test: __okruszek.rysujPtaka rysuje drawBird na innym canvasie).
   Zrzut canvasu w Playwright, bez zewnętrznych obrazków. Użycie: node ikony.cjs  ->  ikona-512.png, ikona-192.png, ikona-180.png */
const fs = require('fs'), path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?test&seed=23'); await page.waitForTimeout(800);
  const urls = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
    /* tło: granat gry, ciepła poświata zachodu nisko (słońce, za którym leci), kilka gwiazd; ptaszek w środku (strefa bezpieczna ikony maskable: środkowe 60%) */
    x.fillStyle = '#0d1224'; x.fillRect(0, 0, 512, 512);
    let g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#12183a'); g.addColorStop(0.55, '#1c1f4a'); g.addColorStop(1, '#3a2a5e'); x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    g = x.createRadialGradient(256, 470, 10, 256, 470, 330); g.addColorStop(0, 'rgba(255,170,100,0.85)'); g.addColorStop(0.35, 'rgba(240,138,75,0.4)'); g.addColorStop(1, 'rgba(240,138,75,0)'); x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    x.fillStyle = 'rgba(236,240,248,0.85)';
    [[70, 80, 2.4], [150, 40, 1.8], [420, 90, 2.6], [360, 36, 1.8], [470, 190, 1.8], [44, 200, 1.8], [250, 64, 1.6], [96, 140, 1.4], [400, 150, 1.4]].forEach(([sx, sy, r]) => { x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill(); });
    /* kontur chmury u dołu (kreska jak w grze) */
    x.strokeStyle = 'rgba(236,240,248,0.55)'; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(-10, 452); x.bezierCurveTo(60, 420, 100, 452, 150, 438); x.bezierCurveTo(200, 418, 240, 450, 300, 436); x.bezierCurveTo(350, 420, 400, 448, 440, 436); x.bezierCurveTo(470, 428, 500, 440, 522, 446); x.stroke();
    window.__okruszek.rysujPtaka(x, 256, 268, 4.0, 0.9, 0, 0.02);
    const out = { 512: c.toDataURL('image/png') };
    for (const n of [192, 180]) { const d = document.createElement('canvas'); d.width = d.height = n; const y = d.getContext('2d'); y.imageSmoothingEnabled = true; y.imageSmoothingQuality = 'high'; y.drawImage(c, 0, 0, n, n); out[n] = d.toDataURL('image/png'); }
    return out;
  });
  for (const n of [512, 192, 180]) fs.writeFileSync(path.join(__dirname, 'ikona-' + n + '.png'), Buffer.from(urls[n].split(',')[1], 'base64'));
  await browser.close();
  if (errors.length) { console.log('BŁĘDY: ' + errors.join(' | ')); process.exit(1); }
  console.log('ikony zapisane');
})();
