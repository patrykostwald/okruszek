/* Z17 diagnoza: cienkie ciemne linie (miara Z15) na scenach toru z jednym rodzajem elementu naraz (noc i dzień, L4); zapisuje mapę dolin do zrzuty-z17/kontur-*.png.
   Użycie: node diag_z17_kontur.cjs [pora] [L] */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.join(__dirname, 'index.html');
const pora = process.argv[2] || 'noc', LV = +(process.argv[3] || 4);
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await pg.goto('file:///' + file.replace(/\\/g, '/') + '?test&tor=1&seed=23'); await pg.waitForTimeout(900);
  await pg.evaluate(() => { __okruszek.z11Zbuduj(); __okruszek.torSprite(); });
  const TYPY = ['(nic)', 'chmura:biala', 'chmura:lawenda', 'chmura:szara', 'chmura:fiolet', 'chmura:zielona_mgla', 'chmura:oaza', 'burza', 'grad', 'tornado', 'ptak', 'samolot', 'motolotnia', 'ufo', 'szpile', 'latawiec', 'wiatr:gora', 'wiatr:lewo', 'nadchmurze:statek', 'nadchmurze:satelita', 'nadchmurze:drapieznik', 'nadchmurze:samolot'];
  for (const ty of TYPY) {
    const m = await pg.evaluate(async (a) => {
      const [ty, pora, LV] = a, O = __okruszek; O.tempo(1); O.pauza(true); O.panel(false); O.ziarno(5); O.brama(5); O.odblokuj(); O.ustawEnergie(null); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg();
      O.ustawPore(pora); O.ustawPoziom(LV); O.idz(1, 2, true);
      if (ty !== '(nic)') for (let i = 0; i < 3; i++) O.zdarzenie(ty, { k: i, w: ty.indexOf('nadchmurze') === 0 ? -0.3 : (i % 2), z: 1.3 + i * 0.7 });
      O.pauza(false); await new Promise(r => setTimeout(r, 500)); O.tempo(0.02); await new Promise(r => setTimeout(r, 650));
      const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height;
      const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0);
      const W = t.width, H = t.height, d = x.getImageData(0, 0, W, H).data, sc = W / 390, p = O.ptakEkran(), bw = 90 * sc, bcx = p.x * sc, bcy = p.y * sc, T = 16, L = new Float32Array(W * H);
      for (let i = 0; i < W * H; i++) L[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
      let dol = 0, n = 0; const mapa = x.createImageData(W, H);
      for (let y = Math.round(90 * sc); y < H - 2; y++) for (let xx = 2; xx < W - 2; xx++) {
        if (Math.abs(xx - bcx) < bw && Math.abs(y - bcy) < bw) continue;
        const i = y * W + xx, l = L[i]; n++;
        const a1 = L[i - 2], bb = L[i + 2], u = L[i - 2 * W], v = L[i + 2 * W];
        if ((l < a1 - T && l < bb - T) || (l < u - T && l < v - T)) { dol++; mapa.data[i * 4] = 255; mapa.data[i * 4 + 3] = 255; }
      }
      x.globalAlpha = 0.35; x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
      const m2 = document.createElement('canvas'); m2.width = W; m2.height = H; m2.getContext('2d').putImageData(mapa, 0, 0); x.drawImage(m2, 0, 0);
      return { dol: dol / n, png: t.toDataURL('image/png') };
    }, [ty, pora, LV]);
    console.log(ty.padEnd(24) + ' dol ' + m.dol.toFixed(4));
    if (process.env.MAPY) fs.writeFileSync(path.join(__dirname, 'zrzuty-z17', 'kontur-' + pora + '-' + ty.replace(/[:()]/g, '_') + '.png'), Buffer.from(m.png.split(',')[1], 'base64'));
  }
  await b.close();
})();
