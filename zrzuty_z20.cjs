/* Okruszek Z20: zrzuty 390x844 (DPR 2) przycisku „Zainstaluj”. Użycie: node zrzuty_z20.cjs [katalog-wyjścia]
   ekran startu z przyciskiem (android), panel pauzy z przyciskiem, instrukcja iOS, ekran startu zainstalowanej gry (bez przycisku), komunikat po odrzuceniu */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const out = path.resolve(process.argv[2] || path.join(__dirname, 'zrzuty-z20'));
fs.mkdirSync(out, { recursive: true });
const base = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?test&seed=23';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const errs = [];
  const mk = async (query) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
    const page = await ctx.newPage(); page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(base + (query || '')); await page.waitForTimeout(600);
    return { ctx, page, ev: (f, a) => page.evaluate(f, a) };
  };
  const zd = (g) => g.ev(() => { const e = new Event('beforeinstallprompt', { cancelable: true }); e.prompt = () => Promise.resolve(); e.userChoice = new Promise(r => { window.__wybor = r; }); window.dispatchEvent(e); });
  const shot = (g, n) => g.page.screenshot({ path: path.join(out, n) });
  { const g = await mk('&start=1&instaluj=android'); await zd(g); await sleep(500); await shot(g, 'z20-01-ekran-startu-android.png');
    await g.page.click('#instal'); await sleep(100); await g.ev(() => window.__wybor({ outcome: 'dismissed' })); await sleep(400); await shot(g, 'z20-05-po-odrzuceniu.png');
    await g.ctx.close(); }
  { const g = await mk('&instaluj=android'); await g.ev(() => __okruszek.panel(true)); await sleep(400); await zd(g); await sleep(400); await shot(g, 'z20-02-panel-pauzy-android.png'); await g.ctx.close(); }
  { const g = await mk('&start=1&instaluj=ios'); await sleep(300); await shot(g, 'z20-03a-ekran-startu-ios.png');
    await g.page.click('#instal'); await sleep(600); await shot(g, 'z20-03-instrukcja-ios.png'); await g.ctx.close(); }
  { const g = await mk('&start=1&instaluj=standalone'); await zd(g); await sleep(500); await shot(g, 'z20-04-zainstalowana-bez-przycisku.png'); await g.ctx.close(); }
  { const g = await mk('&start=1'); await sleep(400); await shot(g, 'z20-06-test-domyslnie-bez-przycisku.png'); await g.ctx.close(); }
  await browser.close();
  console.log(errs.length ? 'BŁĘDY: ' + errs.join(' | ') : 'zrzuty zapisane w ' + out);
})();
