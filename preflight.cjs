/* Okruszek: pre-flight. Użycie: node preflight.cjs [plik.html]
   Sprawdza: składnię skryptu, start bez błędów konsoli, hak ?test, niepusty obraz, stany prędkości 0 / 0,5 / 1,
   progi koloru (od tyłu do przodu), brak zawieszenia pętli, pomiar klatek.
   Z2: hak sterowania i fizyki, a potem pełny test bota gra_test_z2.cjs (60 s lotu, lądowanie po ok. 20 s, dwa palce,
   kolejność koloru). SKIP_Z2=1 pomija długi test bota (ok. 50 s).
   Z3: hak przeszkód (zdarzenie ptak / deszcz / jastrzab / prad, gdzie, noc, bezPrzeszkod), a potem pełny test gra_test_z3.cjs
   (harmonogram 125 s, kolizje, deszcz, jastrząb, noc). SKIP_Z3=1 pomija go (ok. 3 min).
   Z3b: hak poziomów i doby (poziom, ustawPoziom, lancuch, pora, ustawPore, tempoDoby, nowe zdarzenia), pomiar klatek przy L5, potem pełny test
   gra_test_z3b.cjs (poziomy, boty, L5, kolor i 14 odcieni, doba, nowe przeszkadzajki, harmonogram). SKIP_Z3B=1 pomija go (ok. 4 min).
   Z2b: hak sterowania (sterowanie, tryb, czulosc, panel, wskaznik), kontrola zapisu w przeglądarce (tylko localStorage, klucz okruszek-sterowanie, try/catch),
   potem pełny test gra_test_z2b.cjs (3 tryby, boty 60 s, pamięć wyboru, przycisk 46 px). SKIP_Z2B=1 pomija go (ok. 2,5 min).
   Z10: składnia teksty.js, zapis w przeglądarce tylko pod kluczami okruszek-sterowanie (LSKEY), okruszek.zapis (ZKEY) i okruszek.zapis.zly (ZKEY_ZLY), każdy w try/catch,
   hak Drogi, potem pełny test gra_test_z10.cjs (krainy, boty z bramy do bramy, zapowiedzi, klasy skutku, zapis, brama). SKIP_Z10=1 pomija go (ok. 1,5 min).
   Z3c: hak energii koloru (energia, lancuchE, ustawEnergie, rozkwit, pelnyKolor, serie, stala), potem pełny test gra_test_z3c.cjs (model E, boty w symulacji, kolejność koloru przy E = 0/0,3/0,62/1,
   rozkwit, iskierki HUD, fps względem bazy). SKIP_Z3C=1 pomija go (ok. 2,5 min).
   Z5: manifest, ikony, sw.js, wstęp, dźwięk (wywołania podpięte), przełączniki M/N, prywatność i „Usuń zapis”, service worker na localhost: pełny test gra_test_z5.cjs. SKIP_Z5=1 pomija go (ok. 1,5 min).
   Testy Z3 i Z3b (stary harmonogram) działają w trybie zgodności ?pasmo=1. Musi skończyć się PRE-FLIGHT OK. */
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
  [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].forEach(m => { const f = path.join(path.dirname(file), m[1]); if (!fs.existsSync(f)) { bad('brak pliku ' + m[1]); return; }
    try { cp.execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); ok('składnia ' + m[1]); } catch (e) { bad('składnia ' + m[1] + ': ' + String(e.stderr || e).split('\n').slice(0, 3).join(' | ')); } });
  if (/PROTOTYP/.test(html)) bad('w pliku jest napis PROTOTYP');
  /* Z2b: jedyna rzecz zapisywana w przeglądarce w tej fazie to wybór sterowania (klucz okruszek-sterowanie, w try/catch); żadnych ciasteczek ani innych kluczy */
  if (/document\.cookie|sessionStorage|indexedDB/.test(html)) bad('w pliku jest zapis w przeglądarce poza localStorage (ciasteczka / sessionStorage / indexedDB)');
  { const keys = [...html.matchAll(/localStorage\.(?:setItem|removeItem|clear)\(([^,)]*)/g)].map(m => m[1].trim()), dozw = ['LSKEY', 'ZKEY', 'ZKEY_ZLY'];
    const nieTry = [...html.matchAll(/[^\n]*localStorage\.(?:setItem|removeItem|getItem)\([^\n]*/g)].map(m => m[0]).filter(l => !/try \{[^\n]*localStorage/.test(l) && !/__okruszek|zapis: function|wyczyscZapis|zly: \(function/.test(l));
    if (keys.some(k => dozw.indexOf(k) < 0) || /localStorage\[/.test(html)) bad('zapis do localStorage poza kluczami ' + dozw.join('/') + ': ' + keys.join(','));
    else ok('zapis w przeglądarce tylko localStorage, klucze okruszek-sterowanie, okruszek.zapis, okruszek.zapis.zly (' + keys.length + ' wywołań)');
    nieTry.length ? bad('localStorage poza try/catch: ' + nieTry.slice(0, 2).join(' | ')) : ok('każdy odczyt i zapis localStorage w try/catch'); }
  if (!/LSKEY = 'okruszek-sterowanie'/.test(html) || !/try \{ localStorage\.setItem\(LSKEY[\s\S]{0,120}?\} catch/.test(html)) bad('zapis wyboru sterowania nie jest w try/catch albo klucz inny niż okruszek-sterowanie');
  if (!/ZKEY = 'okruszek\.zapis', ZKEY_ZLY = 'okruszek\.zapis\.zly'/.test(html)) bad('klucze zapisu Drogi inne niż okruszek.zapis / okruszek.zapis.zly');

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
    (k5.niebo > k5.daleko && k5.daleko > k5.blisko && k5.blisko > 0 && k5.smugi === 0) ? ok('s=0,5 (L2): kolor od tyłu do przodu (niebo > daleko > blisko > 0, smugi dopiero od L3) ' + JSON.stringify(k5)) : bad('s=0,5 złe progi: ' + JSON.stringify(k5));
    (k1.niebo > 0.9999 && k1.daleko > 0.9999 && k1.blisko > 0.9999 && k1.smugi > 0.9999) ? ok('s=1: pełny kolor wszędzie') : bad('s=1 nie jest pełnią: ' + JSON.stringify(k1));
    (k5.niebo < 0.5 && k5.daleko < 0.5) ? ok('s=0,5: pełnia jeszcze nie osiągnięta (pełny kolor dopiero w L4-L5)') : bad('pełnia za wcześnie przy s=0,5');

    /* pętla żyje i pomiar klatek przy pełnej prędkości (najcięższy stan) */
    await page.evaluate(() => { window.__okruszek.ustaw(1); window.__okruszek.zerujFps(); });
    const f0 = await page.evaluate(() => window.__okruszek.stan().klatki);
    await page.waitForTimeout(4000);
    const f1 = await page.evaluate(() => window.__okruszek.stan().klatki);
    (f1 - f0 > 20) ? ok('pętla działa (' + (f1 - f0) + ' klatek w 4 s)') : bad('pętla stoi (' + (f1 - f0) + ' klatek w 4 s)');
    const fps = await page.evaluate(() => window.__okruszek.fps());
    console.log('  info fps przy s=1, 390x844 @2x (SC=1,5), headless bez GPU: ' + JSON.stringify(fps));
    (fps.avg >= MIN_FPS) ? ok('średnio ' + fps.avg + ' kl/s >= ' + MIN_FPS) : bad('średnio ' + fps.avg + ' kl/s < ' + MIN_FPS);

    /* Z3b: najcięższy stan = L5 (hiperprzestrzeń: smugi, rozbłysk, poświata, zmiana kolorów); pomiar klatek headless, to NIE jest pomiar telefonu */
    await page.evaluate(() => { window.__okruszek.ustawPoziom(5); window.__okruszek.zerujFps(); });
    await page.waitForTimeout(4000);
    const fps5 = await page.evaluate(() => window.__okruszek.fps());
    console.log('  info fps przy L5 (hiperprzestrzeń), 390x844 @2x (SC=1,5), headless bez GPU (to NIE jest pomiar telefonu): ' + JSON.stringify(fps5));
    (fps5.avg >= MIN_FPS) ? ok('L5: średnio ' + fps5.avg + ' kl/s >= ' + MIN_FPS) : bad('L5: średnio ' + fps5.avg + ' kl/s < ' + MIN_FPS);
    await page.evaluate(() => { window.__okruszek.odblokuj(); window.__okruszek.ustaw(1); });

    /* skręt przesuwa kulisy */
    await page.evaluate(() => window.__okruszek.przesun(0.9));
    await page.waitForTimeout(1500);
    const cam = await page.evaluate(() => window.__okruszek.stan().camX);
    cam > 100 ? ok('skręt w prawo przesuwa kamerę (camX=' + Math.round(cam) + ')') : bad('skręt nie działa (camX=' + cam + ')');
    await page.evaluate(() => window.__okruszek.przesun(null));

    /* Z2: hak sterowania i fizyki lotu */
    const need = ['bezPrzeszkod', 'gdzie', 'noc', 'zdarzenie', 'wysokosc', 'dystans', 'koniec', 'nowyBieg', 'dotyk', 'tempo', 'prady', 'ptak', 'ustaw', 'odblokuj', 'przesun', 'fps', 'stan', 'kolory', 'poziom', 'ustawPoziom', 'lancuch', 'pora', 'ustawPore', 'tempoDoby', 'warstwy', 'odcienie', 'sterowanie', 'tryb', 'czulosc', 'panel', 'wskaznik', 'kraina', 'brama', 'napiecie', 'zapowiedzi', 'zapis', 'wyczyscZapis', 'wytrwalosc', 'cichaPomoc', 'energia', 'lancuchE', 'ustawEnergie', 'rozkwit', 'pelnyKolor', 'serie', 'stala'];
    const miss = await page.evaluate(n => n.filter(k => typeof window.__okruszek[k] !== 'function'), need);
    miss.length ? bad('w haku brakuje: ' + miss.join(', ')) : ok('hak Z1-Z3b, Z2b, Z10 i Z3c kompletny (' + need.length + ' funkcji)');
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
  /* Z3b: pełny test w osobnym procesie */
  if (process.env.SKIP_Z3B) console.log('  info pominięto test Z3b (SKIP_Z3B)');
  else {
    const tf = path.join(__dirname, 'gra_test_z3b.cjs');
    if (!fs.existsSync(tf)) bad('brak gra_test_z3b.cjs');
    else {
      let out = '', code = 0;
      try { out = cp.execFileSync(process.execPath, [tf, file], { stdio: 'pipe', timeout: 590000, encoding: 'utf8' }); }
      catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); code = e.status || 1; }
      const lines = out.split(String.fromCharCode(10)).filter(l => /FAIL|TEST Z3b|BŁĄD|^\(| info /.test(l));
      lines.forEach(l => console.log('  z3b> ' + l.trim()));
      code === 0 && /TEST Z3b OK/.test(out) ? ok('test Z3b (gra_test_z3b.cjs) przeszedł: ' + (out.match(/ok   /g) || []).length + ' sprawdzeń') : bad('test Z3b nie przeszedł (kod ' + code + ')');
    }
  }
  /* Z2b: trzy tryby sterowania, pełny test w osobnym procesie */
  if (process.env.SKIP_Z2B) console.log('  info pominięto test Z2b (SKIP_Z2B)');
  else {
    const tf = path.join(__dirname, 'gra_test_z2b.cjs');
    if (!fs.existsSync(tf)) bad('brak gra_test_z2b.cjs');
    else {
      let out = '', code = 0;
      try { out = cp.execFileSync(process.execPath, [tf, file], { stdio: 'pipe', timeout: 590000, encoding: 'utf8' }); }
      catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); code = e.status || 1; }
      const lines = out.split(String.fromCharCode(10)).filter(l => /FAIL|TEST Z2b|BŁĄD|^\(| info (różnica|środek|tryb|opisy)/.test(l));
      lines.forEach(l => console.log('  z2b> ' + l.trim()));
      code === 0 && /TEST Z2b OK/.test(out) ? ok('test Z2b (gra_test_z2b.cjs) przeszedł: ' + (out.match(/ok   /g) || []).length + ' sprawdzeń') : bad('test Z2b nie przeszedł (kod ' + code + ')');
    }
  }
  /* Z10: Droga (krainy, bramy, zapis), pełny test w osobnym procesie */
  if (process.env.SKIP_Z10) console.log('  info pominięto test Z10 (SKIP_Z10)');
  else {
    const tf = path.join(__dirname, 'gra_test_z10.cjs');
    if (!fs.existsSync(tf)) bad('brak gra_test_z10.cjs');
    else {
      let out = '', code = 0;
      try { out = cp.execFileSync(process.execPath, [tf, file], { stdio: 'pipe', timeout: 590000, encoding: 'utf8' }); }
      catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); code = e.status || 1; }
      const lines = out.split(String.fromCharCode(10)).filter(l => /FAIL|TEST Z10|BŁĄD|^\(| info (klatki|kryterium)/.test(l));
      lines.forEach(l => console.log('  z10> ' + l.trim()));
      code === 0 && /TEST Z10 OK/.test(out) ? ok('test Z10 (gra_test_z10.cjs) przeszedł: ' + (out.match(/ok   /g) || []).length + ' sprawdzeń') : bad('test Z10 nie przeszedł (kod ' + code + ')');
    }
  }
  /* Z3c: energia koloru (pełny kolor po trzech przyspieszeniach z rzędu), pełny test w osobnym procesie */
  if (process.env.SKIP_Z3C) console.log('  info pominięto test Z3c (SKIP_Z3C)');
  else {
    const tf = path.join(__dirname, 'gra_test_z3c.cjs');
    if (!fs.existsSync(tf)) bad('brak gra_test_z3c.cjs');
    else {
      let out = '', code = 0;
      try { out = cp.execFileSync(process.execPath, [tf, file], { stdio: 'pipe', timeout: 590000, encoding: 'utf8' }); }
      catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); code = e.status || 1; }
      const lines = out.split(String.fromCharCode(10)).filter(l => /FAIL|TEST Z3c|BŁĄD|^\(| info (stałe|zanik|idealny|bot 50|geometria|rozkwit|fps|piksele)/.test(l));
      lines.forEach(l => console.log('  z3c> ' + l.trim()));
      code === 0 && /TEST Z3c OK/.test(out) ? ok('test Z3c (gra_test_z3c.cjs) przeszedł: ' + (out.match(/ok   /g) || []).length + ' sprawdzeń') : bad('test Z3c nie przeszedł (kod ' + code + ')');
    }
  }
  /* Z5: intro, dźwięk, PWA, prywatność; własny lokalny serwer na localhost, pełny test w osobnym procesie */
  if (process.env.SKIP_Z5) console.log('  info pominięto test Z5 (SKIP_Z5)');
  else {
    const tf = path.join(__dirname, 'gra_test_z5.cjs');
    if (!fs.existsSync(tf)) bad('brak gra_test_z5.cjs');
    else {
      let out = '', code = 0;
      try { out = cp.execFileSync(process.execPath, [tf, file], { stdio: 'pipe', timeout: 590000, encoding: 'utf8' }); }
      catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); code = e.status || 1; }
      const lines = out.split(String.fromCharCode(10)).filter(l => /FAIL|TEST Z5|BŁĄD|^[(]/.test(l));
      lines.forEach(l => console.log('  z5> ' + l.trim()));
      code === 0 && /TEST Z5 OK/.test(out) ? ok('test Z5 (gra_test_z5.cjs) przeszedł: ' + (out.match(/ok   /g) || []).length + ' sprawdzeń') : bad('test Z5 nie przeszedł (kod ' + code + ')');
    }
  }
  console.log(fail ? ('PRE-FLIGHT NIE PRZESZEDŁ (' + fail + ')') : 'PRE-FLIGHT OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PRE-FLIGHT BŁĄD: ' + e); process.exit(2); });
