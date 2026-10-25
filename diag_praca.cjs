/* diagnostyka Z10: praca klatki (ms) z bramą i bez, CPU xN (node diag_praca.cjs [cpu]) */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const CPU = +process.argv[2] || 4;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const pg = await c.newPage();
  await pg.goto('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?test&seed=23'); await pg.waitForTimeout(800);
  const cdp = await c.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  for (const rep of [1, 2]) {
    await pg.evaluate(() => { const o = __okruszek; o.pauza(true); o.bezPrzeszkod(true); o.ziarno(1); o.brama(1); o.ustawPoziom(2); o.symuluj(6); o.zerujKurtyne(); o.zerujFps(); o.pauza(false); });
    await pg.waitForTimeout(5000);
    const bez = await pg.evaluate(() => ({ p: __okruszek.pracaKlatki(true), f: __okruszek.fps() }));
    await pg.evaluate(() => { const o = __okruszek; o.pauza(true); o.doBramy(170); o.zerujKurtyne(); o.zerujFps(); o.pauza(false); });
    await pg.waitForTimeout(9500);
    const z = await pg.evaluate(() => ({ p: __okruszek.pracaKlatki(), f: __okruszek.bramaLog().fpsKurtyna }));
    console.log('CPU x' + CPU + ' #' + rep + ': bez bramy praca ' + JSON.stringify(bez.p) + ' kl/s ' + bez.f.avg + ' | przelot bramy praca ' + JSON.stringify(z.p) + ' kl/s ' + z.f.avg);
  }
  await browser.close();
})();
