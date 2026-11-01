/* Okruszek Z2b: zrzuty 390x844. Użycie: node zrzuty_z2b.cjs [katalog-wyjścia]
   ekran "Wybierz sterowanie" (pierwsze uruchomienie), przycisk w rogu, każdy z trzech trybów w trakcie dotyku (tryb 2: lewe, prawe i oba skrzydła; tryb 3: drążek),
   pauza z wyborem trybu i suwakiem (też z innym trybem i czułością), ekran wyniku z przyciskiem. Dotyk: prawdziwe zdarzenia przez CDP. */
const path = require('path'), fs = require('fs');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const out = path.resolve(process.argv[2] || path.join(__dirname, 'zrzuty-z2b'));
const file = path.resolve(process.argv[3] || path.join(__dirname, 'index.html'));
fs.mkdirSync(out, { recursive: true });
const base = 'file:///' + file.replace(/\\/g, '/') + '?test&seed=23';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const errs = [];
  const mk = async (query, vp) => {
    const ctx = await browser.newContext({ viewport: vp || { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
    const page = await ctx.newPage(); page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(base + (query || '')); await page.waitForTimeout(600);
    const cdp = await ctx.newCDPSession(page);
    const touch = async (type, pts) => { await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p[1], y: p[2], id: p[0] })) }); };
    return { ctx, page, touch, ev: (f, a) => page.evaluate(f, a) };
  };
  const LP = [1, 80, 700], RP = [2, 310, 700];
  const prep = async (g, mode, poziom) => { await g.ev(([m, l]) => { const o = __okruszek; o.sterowanie(m); o.bezPradow(true); o.bezPrzeszkod(true); o.nowyBieg(); o.noc(false); if (l) { o.trafPrad(); o.trafPrad(); } }, [mode, poziom]); await sleep(900); };

  /* 1. pierwsze uruchomienie: ekran wyboru */
  { const g = await mk('&pierwszy'); await sleep(500); await g.page.screenshot({ path: path.join(out, 'z2b-01-wybor-pierwsze-uruchomienie.png') });
    await g.page.click('.tryb[data-tryb="2"]'); await sleep(300); await g.page.screenshot({ path: path.join(out, 'z2b-02-wybor-tryb2-zaznaczony.png') }); await g.ctx.close(); }
  /* 2. przycisk w rogu (tryb 1, gra) */
  { const g = await mk(); await prep(g, 1, true); await g.page.screenshot({ path: path.join(out, 'z2b-03-tryb1-przycisk-w-rogu.png') });
    await g.touch('touchStart', [[1, 195, 600]]); await g.touch('touchMove', [[1, 150, 600]]); await sleep(700); await g.page.screenshot({ path: path.join(out, 'z2b-04-tryb1-w-trakcie-dotyku.png') }); await g.touch('touchEnd', [[1, 150, 600]]);
    /* pauza z wyborem trybu i suwakiem */
    await g.page.click('#sterb'); await sleep(500); await g.page.screenshot({ path: path.join(out, 'z2b-05-pauza-wybor-trybu-i-suwak.png') });
    await g.page.click('.tryb[data-tryb="3"]'); await g.ev(() => { const r = document.getElementById('ster-c'); r.value = '1.35'; r.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(250);
    await g.page.screenshot({ path: path.join(out, 'z2b-06-pauza-tryb3-czulosc-1-35.png')}); await g.ctx.close(); }
  /* 3. tryb 2: lewe, prawe, oba skrzydła (dotyk) */
  { const g = await mk(); await prep(g, 2, true);
    await g.touch('touchStart', [LP]); await sleep(900); await g.page.screenshot({ path: path.join(out, 'z2b-07-tryb2-lewy-kciuk.png') }); await g.touch('touchEnd', [LP]); await sleep(200);
    await g.touch('touchStart', [RP]); await sleep(900); await g.page.screenshot({ path: path.join(out, 'z2b-08-tryb2-prawy-kciuk.png') });
    await g.touch('touchStart', [RP, LP]); await sleep(1000); await g.page.screenshot({ path: path.join(out, 'z2b-09-tryb2-oba-kciuki-nurkowanie.png') });
    await g.touch('touchCancel', []); await sleep(300);
    await g.page.screenshot({ path: path.join(out, 'z2b-10-tryb2-bez-dotyku.png') });
    /* zbliżenie ptaszka w trzech pozycjach skrzydeł */
    const crop = { x: 100, y: 540, width: 190, height: 150 };
    const gs = await mk('&sterowanie=2'); await prep(gs, 2, false);
    await gs.page.screenshot({ path: path.join(out, 'z2b-11-skrzydla-zblizenie-rozlozone.png'), clip: crop });
    await gs.touch('touchStart', [LP]); await sleep(800); await gs.page.screenshot({ path: path.join(out, 'z2b-12-skrzydla-zblizenie-lewe-zlozone.png'), clip: crop }); await gs.touch('touchEnd', [LP]); await sleep(200);
    await gs.touch('touchStart', [RP]); await sleep(800); await gs.page.screenshot({ path: path.join(out, 'z2b-13-skrzydla-zblizenie-prawe-zlozone.png'), clip: crop });
    await gs.touch('touchStart', [RP, LP]); await sleep(800); await gs.page.screenshot({ path: path.join(out, 'z2b-14-skrzydla-zblizenie-oba-zlozone.png'), clip: crop });
    await gs.ctx.close(); await g.ctx.close(); }
  /* 4. tryb 3: drążek */
  { const g = await mk(); await prep(g, 3, true);
    await g.touch('touchStart', [[1, 110, 650]]); await sleep(500); await g.page.screenshot({ path: path.join(out, 'z2b-15-tryb3-drazek-po-dotknieciu.png') });
    await g.touch('touchMove', [[1, 165, 630]]); await sleep(900); await g.page.screenshot({ path: path.join(out, 'z2b-16-tryb3-drazek-wychylony.png') });
    await g.touch('touchStart', [[1, 165, 630], RP]); await sleep(900); await g.page.screenshot({ path: path.join(out, 'z2b-17-tryb3-drazek-i-nurkowanie.png') });
    await g.touch('touchCancel', []); await g.ctx.close(); }
  /* 5. ekran wyniku z przyciskiem; mały ekran 360x640; komputer 1440x900 */
  { const g = await mk(); await prep(g, 1, false); await g.ev(() => { __okruszek.tempo(4); __okruszek.ustawWysokosc(0); }); await sleep(3800); await g.page.screenshot({ path: path.join(out, 'z2b-18-ekran-wyniku-z-przyciskiem.png') }); await g.ctx.close(); }
  { const g = await mk('&pierwszy', { width: 360, height: 640 }); await sleep(400); await g.page.screenshot({ path: path.join(out, 'z2b-19-wybor-360x640.png') }); await g.page.click('#ster-ok'); await sleep(300);
    await g.ev(() => { const o = __okruszek; o.sterowanie(3); o.bezPrzeszkod(true); o.nowyBieg(); o.ustawPoziom(3); o.trafPrad(); o.trafPrad(); o.trafPrad(); o.odblokuj(); }); await sleep(700); await g.page.screenshot({ path: path.join(out, 'z2b-20-gra-360x640-przycisk-i-wskaznik.png') }); await g.ctx.close(); }
  { const g = await mk('&pierwszy', { width: 1440, height: 900 }); await sleep(400); await g.page.screenshot({ path: path.join(out, 'z2b-21-wybor-1440x900.png') }); await g.ctx.close(); }
  console.log('błędy konsoli: ' + (errs.length ? errs.join(' | ') : 'brak'));
  await browser.close();
  console.log('zrzuty w ' + out);
})();
