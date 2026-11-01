/* Z17 diagnoza: pierwszy test dotyku po scenie (m) z gra_test_z14.cjs (złapanie przez jastrzębia, ucieczka), stan gry przed i po przeciągnięciu w lewo. */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const base = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true });
  const pg = await ctx.newPage(); pg.on('pageerror', e => console.log('PAGEERROR ' + e));
  await pg.goto(base + '?test&tor=1&seed=23'); await pg.waitForTimeout(900);
  const ev = (f, a) => pg.evaluate(f, a);
  const cdp = await ctx.newCDPSession(pg);
  const touch = async (type, pts) => { await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p[1], y: p[2], id: p[0] })) }); };
  const upAll = async () => { try { await touch('touchCancel', []); } catch (_) { } await sleep(80); };
  const st = () => ev(() => { const s = __okruszek.stan(), k = __okruszek.komorka(); return { tryb: s.tryb, pauza: s.pauza, palce: s.palce, nurk: __okruszek.torLog().nurkowania, ruchy: __okruszek.torLog().ruchy, kol: k.kol, w: k.wiersz, x: Math.round(k.x * 100) / 100, panel: !!document.querySelector('#panel:not([hidden])') }; });
  for (let rep = 0; rep < +(process.argv[2] || 4); rep++) {
    await ev(() => { const O = __okruszek; O.pauza(true); O.brama(4); O.bezPrzeszkod(true); O.idz(1, 1, true); O.ustaw(0.1); O.zdarzenie('jastrzab'); for (let i = 0; i < 60 * 12; i++) { O.torSymuluj(1 / 60); if (O.koniec()) break; } O.odblokuj(); O.symuluj(2.5); O.odblokuj(); O.bezPrzeszkod(false); O.ziarno(0); O.brama(1); O.pauza(false); });
    await upAll(); await ev(() => { const O = __okruszek; O.panel(false); O.odblokuj(); O.nurkuj(false); O.bezPrzeszkod(true); O.bezPradow(true); O.tempo(1); O.czulosc(1); O.sterowanie(1); O.nowyBieg(); O.ustaw(0); O.idz(1, 1, true); }); await sleep(150);
    const a = await st();
    await touch('touchStart', [[1, 200, 600]]); for (let i = 1; i <= 6; i++) { await touch('touchMove', [[1, 200 - 60 * i / 6, 600]]); await sleep(16); } await touch('touchEnd', []); await sleep(260);
    console.log(rep + ' przed ' + JSON.stringify(a) + ' po ' + JSON.stringify(await st()));
  }
  await browser.close();
})();
