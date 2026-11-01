/* Z17 diagnoza: scena testu czerwieni Z14 (17 elementów toru przy s = 0), łapie pageerror ze stosem. Użycie: node diag_z17_blad.cjs [plik.html] */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const base = 'file:///' + file.replace(/\\/g, '/');
const CHROME = 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => console.log('PAGEERROR: ' + (e.stack || e)));
  await pg.goto(base + '?test&tor=1&seed=23'); await pg.waitForTimeout(900);
  const res = await pg.evaluate(async () => { const O = __okruszek; O.pauza(true); O.ziarno(5); O.brama(5); O.odblokuj(); O.ustawEnergie(0); O.ustaw(0); O.idz(1, 1, true);
    const typy = ['chmura:biala', 'chmura:lawenda', 'chmura:szara', 'chmura:fiolet', 'chmura:zielona_mgla', 'chmura:oaza', 'burza', 'grad', 'tornado', 'ptak', 'samolot', 'motolotnia', 'ufo', 'szpile', 'latawiec', 'wiatr:gora', 'wiatr:lewo'];
    const out = [];
    typy.forEach((t, i) => { try { O.zdarzenie(t, { k: i % 3, w: (i >> 1) % 3, z: 1.3 + (i % 6) * 0.7 }); out.push(t + ':ok'); } catch (e) { out.push(t + ':' + e); } });
    O.pauza(false); await new Promise(r => setTimeout(r, 500)); O.tempo(0.1); await new Promise(r => setTimeout(r, 150));
    return { out, n: O.gdzie().length, gdzie: O.gdzie().slice(0, 30) };
  });
  console.log(JSON.stringify(res, null, 1).slice(0, 3000));
  await pg.screenshot({ path: path.join(__dirname, 'diag_z17_blad.png') });
  await browser.close();
})();
