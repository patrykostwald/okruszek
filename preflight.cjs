/* Okruszek: pre-flight. Użycie: node preflight.cjs [plik.html]
   Sprawdza: składnię skryptu, start bez błędów konsoli, hak ?test, niepusty obraz, stany prędkości 0 / 0,5 / 1,
   progi koloru (od tyłu do przodu), brak zawieszenia pętli, pomiar klatek.
   Z2: hak sterowania i fizyki, a potem pełny test bota gra_test_z2.cjs (60 s lotu, lądowanie po ok. 20 s, dwa palce,
   kolejność koloru). SKIP_Z2=1 pomija długi test bota (ok. 50 s).
   Z3: hak przeszkód (zdarzenie ptak / deszcz / jastrzab / prad, gdzie, noc, bezPrzeszkod), a potem pełny test gra_test_z3.cjs
   (harmonogram 125 s, kolizje, deszcz, jastrząb, biom nocny). SKIP_Z3=1 pomija go (ok. 60 s). Musi skończyć się PRE-FLIGHT OK. */
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

    /* Z2: hak sterowania i fizyki lotu */
    const need = ['bezPrzeszkod', 'gdzie', 'noc', 'zdarzenie', 'wysokosc', 'dystans', 'koniec', 'nowyBieg', 'dotyk', 'tempo', 'prady', 'ptak', 'ustaw', 'odblokuj', 'przesun', 'fps', 'stan', 'kolory'];
    const miss = await page.evaluate(n => n.filter(k => typeof window.__okruszek[k] !== 'function'), need);
    miss.length ? bad('w haku brakuje: ' + miss.join(', ')) : ok('hak Z2 i Z3 kompletny (' + need.length + ' funkcji)');
    const z2 = await page.evaluate(() => { const o = window.__okruszek; o.odblokuj(); o.bezPradow(true); o.nowyBieg(); return { h: o.wysokosc(), k: o.koniec(), d: o.dystans() }; });
    (z2.h > 0.7 && z2.k === false) ? ok('nowy bieg: wysokość ' + z2.h + ', gra trwa') : bad('nowy bieg nie resetuje stanu: ' + JSON.stringify(z2));
    const ds = await page.evaluate(() => { const o = window.__okruszek; o.dotyk('dol', 1, 0.3); o.dotyk('dol', 2, 0.6); o.dotyk('gora', 1); const m = o.stan().palce; o.dotyk('gora', 2); return [m, o.stan().palce, o.stan().nurkuje]; });
    (ds[0] === 1 && ds[1] === 0 && ds[2] === false) ? ok('dwa palce: po puszczeniu obu brak ducha') : bad('duch palca: ' + JSON.stringify(ds));
    /* Z3: każde zdarzenie wymuszalne i widoczne w gdzie(); noc włączalna; nowy bieg czyści przeszkody */
    const z3 = await page.evaluate(() => { const o = window.__okruszek, r = {}; o.bezPrzeszkod(true); o.nowyBieg();
      for (const n of ['ptak', 'deszcz', 'jastrzab', 'prad']) { r[n] = o.zdarzenie(n) === true && o.gdzie().some(x => x.typ === n); }
      o.noc(true); r.noc = o.stan().noc === 1; o.noc(false); o.nowyBieg(); r.czysto = o.gdzie().length === 0 && o.stan().jastrzab === null; o.bezPrzeszkod(false); return r; });
    Object.values(z3).every(Boolean) ? ok('Z3: zdarzenia ptak/deszcz/jastrzab/prad wymuszalne i widoczne w gdzie(), noc(), czysty nowy bieg') : bad('hak Z3: ' + JSON.stringify(z3));
    await page.evaluate(() => { window.__okruszek.bezPradow(false); window.__okruszek.nowyBieg(); });
  }
  const real = errors.filter(e => !/favicon/i.test(e));
  real.length ? bad('błędy konsoli: ' + real.slice(0, 3).join(' | ')) : ok('brak błędów i ostrzeżeń konsoli');
  await browser.close();

  /* Z2: pełny test bota w osobnym procesie */
  if (process.env.SKIP_Z2) console.log('  info pominięto test bota Z2 (SKIP_Z2)');
  else {
    const tf = path.join(__dirname, 'gra_test_z2.cjs');
    if (!fs.existsSync(tf)) bad('brak gra_test_z2.cjs');
    else {
      let out = '', code = 0;
      try { out = cp.execFileSync(process.execPath, [tf, file], { stdio: 'pipe', timeout: 400000, encoding: 'utf8' }); }
      catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); code = e.status || 1; }
      const lines = out.split(String.fromCharCode(10)).filter(l => /FAIL|TEST Z2|BŁĄD|bot leci|lądowanie po|kontrola|metoda/.test(l));
      lines.forEach(l => console.log('  z2> ' + l.trim()));
      code === 0 && /TEST Z2 OK/.test(out) ? ok('test bota Z2 (gra_test_z2.cjs) przeszedł') : bad('test bota Z2 nie przeszedł (kod ' + code + ')');
    }
  }
  /* Z3: pełny test w osobnym procesie */
  if (process.env.SKIP_Z3) console.log('  info pominięto test Z3 (SKIP_Z3)');
  else {
    const tf = path.join(__dirname, 'gra_test_z3.cjs');
    if (!fs.existsSync(tf)) bad('brak gra_test_z3.cjs');
    else {
      let out = '', code = 0;
      try { out = cp.execFileSync(process.execPath, [tf, file], { stdio: 'pipe', timeout: 400000, encoding: 'utf8' }); }
      catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); code = e.status || 1; }
      const lines = out.split(String.fromCharCode(10)).filter(l => /FAIL|TEST Z3|BŁĄD|^\(/.test(l));
      lines.forEach(l => console.log('  z3> ' + l.trim()));
      code === 0 && /TEST Z3 OK/.test(out) ? ok('test Z3 (gra_test_z3.cjs) przeszedł: ' + (out.match(/ok   /g) || []).length + ' sprawdzeń') : bad('test Z3 nie przeszedł (kod ' + code + ')');
    }
  }
  console.log(fail ? ('PRE-FLIGHT NIE PRZESZEDŁ (' + fail + ')') : 'PRE-FLIGHT OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PRE-FLIGHT BŁĄD: ' + e); process.exit(2); });
