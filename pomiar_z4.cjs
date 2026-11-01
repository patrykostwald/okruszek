/* Okruszek Z4: pomiar klatek i pamięci sprite'ów. Użycie: node pomiar_z4.cjs [plik.html]
   Mierzy: (1) headless 390x844 @2x (SC 1,5) na poziomach L0..L5, (2) to samo z CDP Emulation.setCPUThrottlingRate 4 (L3, L5),
   (3) tryb lekki (hak lekki(true)) przy L5 z dławieniem 4x, (4) pamięć sprite'ów (hak pamiec()). Wynik: JSON na końcu. */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const URL = 'file:///' + file.replace(/\\/g, '/') + '?test&seed=23';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  await page.goto(URL); await sleep(1800);
  const ev = (f, a) => page.evaluate(f, a);
  const out = { plik: file, headless: {}, dlawienie4x: {}, lekki4x: null, pamiec: null, bloom: null, bledy: errs };
  await ev(() => { const o = __okruszek; o.bezPradow(true); o.bezPrzeszkod(true); });
  async function meas(n, ms) { await ev((q) => { __okruszek.ustawWysokosc(0.8); __okruszek.ustawPoziom(q); }, n); await sleep(1200); await ev(() => __okruszek.zerujFps()); await sleep(ms); return ev(() => __okruszek.fps()); }
  for (let n = 0; n <= 5; n++) out.headless['L' + n] = await meas(n, 2500);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  for (const n of [0, 3, 5]) out.dlawienie4x["L" + n] = await meas(n, 6000);
  await ev(() => __okruszek.ustawPore("zachod")); out.dlawienie4x.L5zachod = await meas(5, 6000); await ev(() => __okruszek.ustawPore("noc")); out.dlawienie4x.L5noc = await meas(5, 6000); await ev(() => __okruszek.odblokujPore());
  if (await ev(() => typeof __okruszek.lekki === 'function')) { await ev(() => __okruszek.lekki(true)); out.lekki4x = await meas(5, 3500); await ev(() => __okruszek.lekki(false)); }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  if (await ev(() => typeof __okruszek.pamiec === 'function')) out.pamiec = await ev(() => __okruszek.pamiec());
  if (await ev(() => typeof __okruszek.bloom === 'function')) out.bloom = await ev(() => __okruszek.bloom());
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error('BLAD ' + e); process.exit(2); });
