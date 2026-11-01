/* diagnostyka Z10: przebieg klatek w czasie przelotu bramy (node diag_fps_przelot.cjs [cpu] [brama]) — próbki co 0,5 s: z kurtyny, otwarcie, kl/s */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const CPU = +process.argv[2] || 4, N = +process.argv[3] || 1;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const pg = await c.newPage();
  await pg.goto('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?test&seed=23'); await pg.waitForTimeout(800);
  const cdp = await c.newCDPSession(pg);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  await pg.evaluate((n) => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.ziarno(1); o.brama(n); o.ustawPoziom(2); o.symuluj(6); o.doBramy(170); o.zerujKurtyne(); o.zerujFps(); o.pauza(false); }, N);
  const L = []; let prev = await pg.evaluate(() => ({ f: __okruszek.stan().klatki, t: performance.now() }));
  for (let i = 0; i < 24; i++) {
    await pg.waitForTimeout(500);
    const q = await pg.evaluate(() => ({ f: __okruszek.stan().klatki, t: performance.now(), k: __okruszek.droga().kurtyna, p: __okruszek.bramaLog().przeloty.length }));
    L.push((q.k ? 'z=' + q.k.z.toFixed(2) + ' otw=' + q.k.open.toFixed(2) : 'brak kurtyny') + ' przelot=' + q.p + ' kl/s=' + ((q.f - prev.f) / (q.t - prev.t) * 1000).toFixed(1));
    prev = q;
  }
  console.log('CPU x' + CPU + ' brama ' + N + ' -> ' + (N + 1) + '\n' + L.join('\n') + '\nfpsKurtyna ' + JSON.stringify((await pg.evaluate(() => __okruszek.bramaLog())).fpsKurtyna));
  await browser.close();
})();
