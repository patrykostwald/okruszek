/* Okruszek Z5: zrzuty 390x844 (DPR 2). Użycie: node zrzuty_z5.cjs [katalog-wyjścia]
   wstęp (klatki: zdanie 1, zdanie 3, Okruszek wlatuje, kolor po pierwszym prądzie), ekran startu, panel z przełącznikami dźwięku, prywatność (góra, dół z pytaniem), ekran końca z tekstem historii */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const out = path.resolve(process.argv[2] || path.join(__dirname, 'zrzuty-z5'));
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
  const shot = (g, n) => g.page.screenshot({ path: path.join(out, n) });
  /* wstęp */
  { const g = await mk('&intro=pokaz&start=1');
    await g.ev(() => __okruszek.introCzas(2.0)); await sleep(350); await shot(g, 'z5-01-intro-zdanie-1.png');
    await g.ev(() => __okruszek.introCzas(6.7)); await sleep(350); await shot(g, 'z5-02-intro-zdanie-3.png');
    await g.ev(() => __okruszek.introCzas(7.7)); await sleep(1100); await shot(g, 'z5-03-intro-okruszek-wlatuje.png');
    await sleep(2400); await shot(g, 'z5-04-intro-kolor-po-pradzie.png');
    console.log('intro:', JSON.stringify(await g.ev(() => __okruszek.intro())));
    await sleep(3200); await shot(g, 'z5-05-ekran-startu.png');
    await g.ctx.close(); }
  /* panel z przełącznikami (w trakcie gry, efekty wyłączone) */
  { const g = await mk('');
    await g.ev(() => { const o = __okruszek; o.bezPrzeszkod(true); o.nowyBieg(); }); await g.page.keyboard.press('m'); await sleep(900); await shot(g, 'z5-06-gra-komunikat-efekty.png');
    await g.page.click('#sterb'); await sleep(500); await shot(g, 'z5-07-panel-przelaczniki-dzwieku.png');
    await g.page.click('#ster-priv'); await sleep(500); await shot(g, 'z5-08-prywatnosc-gora.png');
    await g.ev(() => { document.getElementById('priv').scrollTop = 9999; }); await g.page.click('#priv-usun'); await sleep(300); await shot(g, 'z5-09-prywatnosc-dol-pytanie.png');
    await g.ctx.close(); }
  /* ekran końca: lądowanie */
  { const g = await mk('');
    await g.ev(() => { const o = __okruszek; o.bezPrzeszkod(true); o.bezPradow(true); o.nowyBieg(); o.ustaw(0.3); o.tempo(4); });
    await sleep(900); await g.ev(() => { const o = __okruszek; o.odblokuj(); o.ustawWysokosc(0); }); await sleep(2600); await shot(g, 'z5-10-koniec-ladowanie.png');
    await g.ev(() => { const o = __okruszek; o.tempo(1); o.odblokuj(); o.nowyBieg(); o.bezPrzeszkod(false); o.bezPradow(true); o.tempo(8); o.ustaw(0); o.zdarzenie('jastrzab'); });
    for (let i = 0; i < 40; i++) { await sleep(250); if (await g.ev(() => document.getElementById('wynik').classList.contains('pokaz'))) break; }
    await sleep(900); await shot(g, 'z5-11-koniec-jastrzab.png');
    await g.ctx.close(); }
  await browser.close();
  console.log(errs.length ? 'BŁĘDY: ' + errs.join(' | ') : 'zrzuty zapisane w ' + out);
})();
