/* Okruszek: pre-flight. Użycie: node preflight.cjs [plik.html]
   Sprawdza: składnię skryptu, start bez błędów konsoli, hak ?test, niepusty obraz, stany prędkości 0 / 0,5 / 1,
   progi koloru (od tyłu do przodu), brak zawieszenia pętli, pomiar klatek. Musi skończyć się PRE-FLIGHT OK. */
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const MIN_FPS = +process.env.MIN_FPS || 25;   /* próg dla headless bez GPU; pomiar na telefonie: osobno (Z7) */
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };

(async () => {
  console.log('PRE-FLIGHT ' + file);
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (!scripts.length) bad('brak <script>');
  scripts.forEach((js, i) => {
    const tmp = path.join(os.tmpdir(), 'okruszek-pf-' + i + '.js'); fs.writeFileSync(tmp, js);
    try { cp.execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' }); ok('składnia skryptu ' + (i + 1)); }
    catch (e) { bad('składnia skryptu ' + (i + 1) + ': ' + String(e.stderr || e).split('\n').slice(0, 3).join(' | ')); }
  });
  if (/PROTOTYP/.test(html)) bad('w pliku jest napis PROTOTYP');
  if (/localStorage\.setItem|document\.cookie/.test(html)) bad('Z1 nie powinien zapisywać nic w przeglądarce (stan: Z5)');

  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23');
  await page.waitForTimeout(1500);
  const has = await page.evaluate(() => !!window.__okruszek);
  has ? ok('hak window.__okruszek (?test)') : bad('brak haka window.__okruszek');
  if (has) {
    const st0 = await page.evaluate(() => window.__okruszek.stan());
    st0.pula === 14 ? ok('pula chmur = 14') : bad('pula chmur = ' + st0.pula);
    st0.warstw === 9 ? ok('warstw-kulis = 9') : bad('warstw-kulis = ' + st0.warstw);
    const noHook = await (async () => { const p2 = await browser.newPage(); await p2.goto('file:///' + file.replace(/\\/g, '/')); await p2.waitForTimeout(300); const r = await p2.evaluate(() => typeof window.__okruszek); await p2.close(); return r; })();
    noHook === 'undefined' ? ok('bez ?test hak nie istnieje') : bad('hak widoczny bez ?test');

    const kolory = {};
    for (const v of [0, 0.5, 1]) {
      await page.evaluate(x => window.__okruszek.ustaw(x), v);
      await page.waitForTimeout(1200);
      kolory[v] = await page.evaluate(() => window.__okruszek.kolory());
      const uniq = await page.evaluate(() => { const c = document.getElementById('g'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0); const d = x.getImageData(0, 0, t.width, t.height).data, set = new Set(); for (let i = 0; i < d.length; i += 4 * 97) set.add((d[i] >> 4) + ',' + (d[i + 1] >> 4) + ',' + (d[i + 2] >> 4)); return set.size; });
      uniq > 12 ? ok('obraz niepusty przy s=' + v + ' (' + uniq + ' kolorów)') : bad('obraz prawie jednolity przy s=' + v + ' (' + uniq + ')');
    }
    const k0 = kolory[0], k5 = kolory[0.5], k1 = kolory[1];
    (k0.niebo === 0 && k0.daleko === 0 && k0.blisko === 0 && k0.smugi === 0) ? ok('s=0: zero koloru (same kreski)') : bad('s=0 ma kolor: ' + JSON.stringify(k0));
    (k5.niebo > k5.daleko && k5.daleko > k5.blisko && k5.blisko === 0 && k5.smugi === 0) ? ok('s=0,5: kolor od tyłu do przodu (niebo > daleko > blisko, smugi 0) ' + JSON.stringify(k5)) : bad('s=0,5 złe progi: ' + JSON.stringify(k5));
    (k1.niebo === 1 && k1.daleko === 1 && k1.blisko === 1 && k1.smugi === 1) ? ok('s=1: pełny kolor wszędzie') : bad('s=1 nie jest pełnią: ' + JSON.stringify(k1));
    (k5.niebo < 0.5 && k5.daleko < 0.5) ? ok('s=0,5: pełnia jeszcze nie osiągnięta') : bad('pełnia za wcześnie przy s=0,5');

    /* pętla żyje i pomiar klatek przy pełnej prędkości (najcięższy stan) */
    await page.evaluate(() => { window.__okruszek.ustaw(1); window.__okruszek.zerujFps(); });
    const f0 = await page.evaluate(() => window.__okruszek.stan().klatki);
    await page.waitForTimeout(4000);
    const f1 = await page.evaluate(() => window.__okruszek.stan().klatki);
    (f1 - f0 > 20) ? ok('pętla działa (' + (f1 - f0) + ' klatek w 4 s)') : bad('pętla stoi (' + (f1 - f0) + ' klatek w 4 s)');
    const fps = await page.evaluate(() => window.__okruszek.fps());
    console.log('  info fps przy s=1, 390x844 @2x (SC=1,5), headless bez GPU: ' + JSON.stringify(fps));
    (fps.avg >= MIN_FPS) ? ok('średnio ' + fps.avg + ' kl/s >= ' + MIN_FPS) : bad('średnio ' + fps.avg + ' kl/s < ' + MIN_FPS);

    /* skręt przesuwa kulisy */
    await page.evaluate(() => window.__okruszek.przesun(0.9));
    await page.waitForTimeout(1500);
    const cam = await page.evaluate(() => window.__okruszek.stan().camX);
    cam > 100 ? ok('skręt w prawo przesuwa kamerę (camX=' + Math.round(cam) + ')') : bad('skręt nie działa (camX=' + cam + ')');
    await page.evaluate(() => window.__okruszek.przesun(null));
  }
  const real = errors.filter(e => !/favicon/i.test(e));
  real.length ? bad('błędy konsoli: ' + real.slice(0, 3).join(' | ')) : ok('brak błędów i ostrzeżeń konsoli');
  await browser.close();
  console.log(fail ? ('PRE-FLIGHT NIE PRZESZEDŁ (' + fail + ')') : 'PRE-FLIGHT OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PRE-FLIGHT BŁĄD: ' + e); process.exit(2); });
