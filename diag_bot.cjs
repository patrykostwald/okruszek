/* diagnostyka bota idealnego (do strojenia): node diag_bot.cjs [sekundy gry] [diveMinH] */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const SEC = +process.argv[2] || 60, DMH = +process.argv[3] || 0.3, TEMPO = +process.env.TEMPO || 4;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?test&seed=23');
  await page.waitForTimeout(500);
  const ev = (f, a) => page.evaluate(f, a);
  const rect = await ev(() => { const r = document.getElementById('g').getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
  await ev((m) => { const o = __okruszek; o.odblokuj(); o.noc(false); o.bezPrzeszkod(true); o.bezPradow(false); o.nowyBieg(); o.tempo(m); }, TEMPO);
  await page.mouse.move(rect.l + rect.w / 2, rect.t + rect.h / 2);
  let down = false, lastU = 99, lastW = 0; const log = [];
  while (true) {
    const d = await ev(() => ({ s: __okruszek.stan(), pr: __okruszek.prady(), b: __okruszek.ptak() }));
    if (d.s.tryb !== 'gra' || d.s.graCzas >= SEC) { console.log('koniec', d.s.tryb, d.s.graCzas.toFixed(1), 'poziomMax', d.s.poziomMax, 'wloty', d.s.wloty, 'czasPoziom', d.s.czasPoziom.map(v => v.toFixed(1)).join('/')); break; }
    const ahead = d.pr.filter(p => !p.hit && p.z > d.b.z).sort((a, b) => a.z - b.z), cand = ahead[0];
    const u = cand ? clamp((cand.x - d.b.x) / 40, -1, 1) : 0;
    if (Math.abs(u - lastU) > 0.02) { lastU = u; await page.mouse.move(rect.l + rect.w / 2 * (1 + u / 1.25), rect.t + rect.h * 0.5); }
    const want = process.env.NAIVE ? d.s.h > DMH : (d.s.h > DMH && ((cand && cand.z < 3.8) || d.s.s > 0.4));
    if (want && !down) { await page.mouse.down(); down = true; } else if (!want && down) { await page.mouse.up(); down = false; }
    if (Math.floor(d.s.graCzas / 2) !== (global.lt || -1)) { global.lt = Math.floor(d.s.graCzas / 2); log.push('  . t=' + d.s.graCzas.toFixed(1) + ' s=' + d.s.s.toFixed(2) + ' h=' + d.s.h.toFixed(2) + ' sHold=' + d.s.sHold.toFixed(2) + ' boost=' + d.s.boost.toFixed(2) + ' prady=' + d.pr.map(p => p.z.toFixed(1) + (p.hit ? 'x' : '')).join(',') + ' dive=' + down); }
    if (d.s.wloty !== lastW) { lastW = d.s.wloty; log.push('t=' + d.s.graCzas.toFixed(1) + ' wlot#' + d.s.wloty + ' lancuch=' + d.s.lancuch + ' w12=' + d.s.lancuch12 + ' s=' + d.s.s.toFixed(2) + ' h=' + d.s.h.toFixed(2) + ' prady_przed=' + ahead.length + ' x=' + Math.round(d.s.bx)); }
    await sleep(15);
  }
  console.log(log.join('\n'));
  await browser.close();
})();
