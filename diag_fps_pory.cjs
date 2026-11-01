/* diagnostyka Z10: klatki bez bramy w różnych porach doby, CPU xN (node diag_fps_pory.cjs plik.html [cpu] [pasmo]) — porównanie z kodem sprzed Z10 */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html')), CPU = +process.argv[3] || 4, PAS = process.argv[4] === 'pasmo';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const pg = await c.newPage();
  await pg.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23' + (PAS ? '&pasmo=1' : '')); await pg.waitForTimeout(800);
  const cdp = await c.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const out = [];
  for (const [pora, lock] of [['zachod', true], ['dzien', true], ['noc', true], ['dzien', false]]) {
    await pg.evaluate(([p, l]) => { const o = __okruszek; o.bezPrzeszkod(true); o.nowyBieg(); o.ustawPore(p, l); o.ustawPoziom(2); }, [pora, lock]);
    await pg.waitForTimeout(1200); await pg.evaluate(() => __okruszek.zerujFps()); await pg.waitForTimeout(4000);
    out.push(pora + (lock ? ' (stała)' : ' (płynie)') + ' ' + JSON.stringify(await pg.evaluate(() => __okruszek.fps())));
    await pg.evaluate(() => { __okruszek.odblokuj(); __okruszek.odblokujPore(); });
  }
  console.log(path.basename(path.dirname(file)) + (PAS ? ' ?pasmo=1' : '') + ' CPU x' + CPU + ', L2:\n  ' + out.join('\n  '));
  await browser.close();
})();
