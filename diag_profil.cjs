/* diagnostyka Z10: profil CPU (CDP Profiler) przez 4 s: czas własny funkcji gry (node diag_profil.cjs [pasmo|brama]) */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const MODE = process.argv[2] || '';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const pg = await c.newPage();
  await pg.goto('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?test&seed=23' + (MODE === 'pasmo' ? '&pasmo=1' : '')); await pg.waitForTimeout(800);
  await pg.evaluate((m) => { const o = __okruszek; o.bezPrzeszkod(true); o.nowyBieg(); o.ustawPore('zachod', true); o.ustawPoziom(2); if (m === 'brama') { o.pauza(true); o.symuluj(6); o.doBramy(40); o.symuluj(0.05); o.tempo(0.02); o.pauza(false); } }, MODE);
  await pg.waitForTimeout(1000);
  const cdp = await c.newCDPSession(pg);
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start');
  const f0 = await pg.evaluate(() => __okruszek.stan().klatki);
  await pg.waitForTimeout(4000);
  const f1 = await pg.evaluate(() => __okruszek.stan().klatki);
  const { profile } = await cdp.send('Profiler.stop');
  const byId = new Map(profile.nodes.map(n => [n.id, n])), self = new Map(), dt = profile.timeDeltas; let total = 0;
  profile.samples.forEach((id, i) => { const n = byId.get(id), k = n.callFrame.functionName || '(' + (n.callFrame.url ? 'anon' : n.callFrame.functionName || 'program') + ')'; const d = dt[i] || 0; total += d; self.set(k, (self.get(k) || 0) + d); });
  const frames = f1 - f0, top = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 22);
  console.log((MODE || 'krainy') + ': klatek ' + frames + ' w 4 s; czas własny na klatkę (ms):');
  top.forEach(([k, v]) => console.log('  ' + (v / 1000 / frames).toFixed(3) + '  ' + k));
  const z10 = ['drawZ10Swiat', 'drawZ10Nakladka', 'drawSzkice', 'drawLuki', 'drawKreska', 'drawNapis', 'dorenderuj', 'drogaKrok', 'planKrainy', 'aktywne', 'zapowiedziKrok', 'akcentKrainy', 'akcentTeraz', 'napiecieCalc', 'drawBrama', 'kurtynaChmury', 'itemBrama', 'uPrzejscia', 'wagiTeraz', 'pauzaPradow'];
  console.log('  razem Z10 (ms/klatkę, czas własny): ' + (z10.reduce((a, k) => a + (self.get(k) || 0), 0) / 1000 / frames).toFixed(3) + ' z ' + (total / 1000 / frames).toFixed(2) + ' ms całości (w tym bezczynność)');
  await browser.close();
})();
