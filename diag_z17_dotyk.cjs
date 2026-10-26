/* Z17 diagnoza: tryb 1, ukos w górę (dwa przeciągnięcia z dolnego wiersza) powtarzany N razy; czasy CDP i stan po ruchu. Użycie: node diag_z17_dotyk.cjs [N] */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(path.join(__dirname, 'index.html'));
const base = 'file:///' + file.replace(/\\/g, '/');
const CHROME = 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe';
const N = +process.argv[2] || 8;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => console.log('PAGEERROR ' + e));
  await pg.goto(base + '?test&tor=1&seed=23'); await pg.waitForTimeout(900);
  const ev = (f, a) => pg.evaluate(f, a);
  const cdp = await ctx.newCDPSession(pg);
  const touch = async (type, pts) => { await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p[1], y: p[2], id: p[0] })) }); };
  const upAll = async () => { try { await touch('touchCancel', []); } catch (_) { } await sleep(80); };
  const kom = () => ev(() => __okruszek.komorka());
  const mach = () => ev(() => __okruszek.torLog().machniecia);
  const fresh = async (mode, c, r) => { await upAll(); await ev(([m, c2, r2_]) => { const O = __okruszek; O.panel(false); O.odblokuj(); O.nurkuj(false); O.bezPrzeszkod(true); O.bezPradow(true); O.tempo(1); O.czulosc(1); O.sterowanie(m); O.nowyBieg(); O.ustaw(0); O.idz(c2, r2_, true); }, [mode, c, r]); await sleep(150); };
  const swipe = async (x0, y0, x1, y1, n) => { await touch('touchStart', [[1, x0, y0]]); for (let i = 1; i <= (n || 6); i++) { await touch('touchMove', [[1, x0 + (x1 - x0) * i / (n || 6), y0 + (y1 - y0) * i / (n || 6)]]); await sleep(16); } await touch('touchEnd', []); await sleep(260); };
  for (let i = 0; i < N; i++) {
    await fresh(1, 1, 2); const m0 = await mach(); const t0 = Date.now();
    await swipe(200, 600, 250, 550); const k1 = await kom(); const t1 = Date.now();
    await swipe(200, 600, 200, 550); const k = await kom(); const t2 = Date.now();
    console.log(i + ': po 1. ' + JSON.stringify({ kol: k1.kol, w: k1.wiersz, p: k1.p }) + ' ' + (t1 - t0) + ' ms; po 2. ' + JSON.stringify({ kol: k.kol, w: k.wiersz, p: k.p }) + ' ' + (t2 - t1) + ' ms; machnięcia ' + ((await mach()) - m0) + ' stan ' + JSON.stringify(await ev(() => { const s = __okruszek.stan(); return { tryb: s.tryb, palce: s.palce }; })));
  }
  await browser.close();
})();
