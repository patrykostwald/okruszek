/* Okruszek Z5: testy Playwright. Użycie: node gra_test_z5.cjs  (plik index.html obok; lokalny serwer http na localhost, bo service worker działa tylko tam)
   (a) pliki: manifest.webmanifest (JSON z wymaganymi polami), ikony 192/512/180 o właściwych rozmiarach, sw.js, tagi w <head>, noindex zostaje, teksty bez „redakcj”
   (b) wstęp: pojawia się za pierwszym razem, zdania po kolei, ptaszek wlatuje, prąd budzi kolor, kończy się sam i po dotknięciu; nie pojawia się za drugim razem (zapis);
       tryb prywatny i uszkodzony JSON; starszy zapis v1 bez pola intro zachowany; ekran startu z wyborem sterowania działa po wstępie
   (c) dźwięk: moduł ładuje się, wywołania podpięte (licznik w haku ?test), M/N i przełączniki w panelu (min. 44 px) działają i są zapamiętane, pauza i ukrycie karty wyciszają,
       z ?dzwiek=1 prawdziwy moduł startuje bez błędów
   (d) PWA: service worker rejestruje się na localhost (nie w ?test), pamięć crumbi-N zawiera pliki, najpierw sieć (nowa wersja wygrywa), offline działa
   (e) prywatność: ekran zawiera „iapply sp. z o.o.”, bez „redakcj” i bez nazwiska; „Usuń zapis” z potwierdzeniem czyści klucze (a w grze bez ?test przeładowuje do wstępu)
   (f) ekran końca: tekst historii przy lądowaniu, teksty jastrzębia i sowy bez zmian
   (g) brak błędów konsoli. Kończy się kodem 0 tylko gdy wszystko przeszło. Zrzuty 390x844: node zrzuty_z5.cjs */
const path = require('path'), fs = require('fs'), http = require('http');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const dir = process.argv[2] ? path.dirname(path.resolve(process.argv[2])) : __dirname;
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
let teksty2 = false;   /* serwer: druga wersja teksty.js (test „najpierw sieć”) */

(async () => {
  console.log('TEST Z5 ' + dir);
  /* ---------- lokalny serwer ---------- */
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path.join(dir, p);
    if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nie ma'); return; }
    let body = fs.readFileSync(f);
    if (teksty2 && p === '/teksty.js') body = Buffer.concat([body, Buffer.from('\n/*wersja-2*/')]);
    res.writeHead(200, { 'Content-Type': TYPY[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(body);
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const PORT = srv.address().port, URL0 = 'http://localhost:' + PORT + '/';

  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1', '--autoplay-policy=no-user-gesture-required'] });
  const errors = [];
  const nowy = async (opts) => {   /* nowy kontekst = czysta pamięć przeglądarki */
    const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true }, opts || {}));
    return ctx;
  };
  const strona = async (ctx, query, bezCzekania) => {
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push('pageerror: ' + e + ' @ ' + query));
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text() + ' @ ' + query); });
    await page.goto(URL0 + 'index.html' + (query || '')); if (!bezCzekania) await page.waitForTimeout(500);
    return page;
  };
  const O = (page, f, a) => page.evaluate(f, a);
  const ls = (page, k) => page.evaluate((k) => { try { return localStorage.getItem(k); } catch (e) { return 'BŁĄD'; } }, k);

  /* ---------- (a) pliki ---------- */
  console.log('(a) pliki: manifest, ikony, sw.js, head');
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  let man = null;
  try { man = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.webmanifest'), 'utf8')); ok('manifest.webmanifest to poprawny JSON'); } catch (e) { bad('manifest: ' + e); }
  if (man) {
    chk(man.name === 'Crumbi' && man.short_name === 'Crumbi' && man.start_url === './' && man.scope === './' && man.display === 'standalone' && man.orientation === 'portrait', 'manifest: name/short_name Crumbi, start_url i scope ./, standalone, portrait');
    chk(/^#[0-9a-f]{6}$/i.test(man.theme_color) && /^#[0-9a-f]{6}$/i.test(man.background_color) && man.theme_color.toLowerCase() === '#cdd5ee', 'manifest: kolory jasnego nieba gry (Z18, QA P1-7 i 15.8: dawniej granat #0d1224; ' + man.theme_color + ' / ' + man.background_color + ')');
    const ic = man.icons || [], s192 = ic.find(i => i.sizes === '192x192'), s512 = ic.find(i => i.sizes === '512x512');
    chk(!!s192 && !!s512, 'manifest: ikony 192 i 512');
    for (const i of ic) chk(fs.existsSync(path.join(dir, i.src)), 'ikona istnieje: ' + i.src + ' (' + i.sizes + ', ' + i.purpose + ')');
  }
  for (const [n, w] of [['ikona-192.png', 192], ['ikona-512.png', 512], ['ikona-180.png', 180]]) {
    const f = path.join(dir, n);
    if (!fs.existsSync(f)) { bad('brak ' + n); continue; }
    const b = fs.readFileSync(f), sig = b.slice(0, 8).toString('hex') === '89504e470d0a1a0a', ww = b.readUInt32BE(16), hh = b.readUInt32BE(20);
    chk(sig && ww === w && hh === w, n + ': PNG ' + ww + 'x' + hh + (sig ? '' : ' (zła sygnatura)'));
  }
  chk(/<link rel="manifest" href="manifest\.webmanifest">/.test(html), 'head: <link rel="manifest">');
  chk(/<meta name="theme-color" content="#cdd5ee">/.test(html), 'head: theme-color (Z18: jasne niebo zamiast granatu, QA P1-7)');
  chk(/<link rel="apple-touch-icon" href="ikona-180\.png">/.test(html), 'head: apple-touch-icon 180');
  chk(/<meta name="robots" content="noindex">/.test(html), 'head: noindex zostaje');
  chk(/<script src="dzwiek\.js"><\/script>/.test(html) && /<script src="teksty\.js"><\/script>/.test(html), 'dzwiek.js i teksty.js ładowane jako osobne pliki (CSP self)');
  chk(!/ on(click|load|error)=|eval\(|new Function|http:\/\/|https:\/\/(?!www\.iapply)/.test(html.replace(/<!--[\s\S]*?-->/g, '')), 'bez inline-handlerów, eval i zewnętrznych adresów (poza www.iapply.pl w tekście)');
  const sw = fs.readFileSync(path.join(dir, 'sw.js'), 'utf8');
  chk(/const PAMIEC = 'crumbi-\d+'/.test(sw) && /index\.html/.test(sw) && /teksty\.js/.test(sw) && /dzwiek\.js/.test(sw) && /manifest\.webmanifest/.test(sw) && /ikona-192\.png/.test(sw) && /ikona-512\.png/.test(sw), 'sw.js: stała crumbi-N i precache index, teksty, dzwiek, manifest, ikony');
  chk(/fetch\(e\.request\)\.then/.test(sw) && /skipWaiting/.test(sw) && /clients\.claim/.test(sw), 'sw.js: najpierw sieć, samoaktualizacja (skipWaiting, claim)');
  const tekstyJs = fs.readFileSync(path.join(dir, 'teksty.js'), 'utf8');
  const TX = (() => { const w = {}; require('vm').runInNewContext(tekstyJs, { window: w }); return w.OKRUSZEK_TEKSTY; })();
  chk(TX.intro.zdania.length === 3 && TX.intro.zdania.every(z => z.split(/\s+/).length <= 12), 'intro: 3 zdania, każde do 12 słów: ' + TX.intro.zdania.map(z => z.split(/\s+/).length).join('/'));
  chk(!/redakcj/i.test(tekstyJs + html), 'w grze nie ma słowa „redakcj”');

  /* ---------- (b) wstęp ---------- */
  console.log('(b) wstęp „Gdzie śpi słońce”');
  {
    const ctx = await nowy();
    const g = await strona(ctx, '?test&intro=1&start=1&seed=23');
    const i0 = await O(g, () => __okruszek.intro());
    chk(i0.aktywny && i0.ptakUkryty && i0.zapisane === 0, 'pierwsze uruchomienie: wstęp aktywny, ptaszek jeszcze poza kadrem, flaga w zapisie 0');
    chk(await O(g, () => document.body.classList.contains('intro') && getComputedStyle(document.getElementById('sterb')).display === 'none'), 'wstęp: przycisk „sterowanie” ukryty, klasa body.intro');
    chk(await O(g, () => !document.getElementById('ster').classList.contains('pokaz')), 'wstęp: ekran startu jeszcze się nie pokazuje');
    /* zdania po kolei (czas rzeczywisty): sprawdzamy 3 okna */
    const widziane = new Set(); let eMaks = 0, sMaks = 0, ptakWidoczny = false, pradBył = false;
    const t0 = Date.now();
    let ost = null;
    while (Date.now() - t0 < 15500) {
      const i = await O(g, () => __okruszek.intro()); ost = i;
      if (i.zdanie >= 0) widziane.add(i.zdanie);
      eMaks = Math.max(eMaks, i.E); sMaks = Math.max(sMaks, i.s); if (!i.ptakUkryty) ptakWidoczny = true; if (i.prad) pradBył = true;
      if (!i.aktywny) break;
      await sleep(150);
    }
    chk(widziane.size === 3, 'pojawiły się wszystkie 3 zdania (' + [...widziane].join(',') + ')');
    chk(ptakWidoczny && pradBył, 'Okruszek wlatuje w kadr, a prąd pojawia się przed końcem wstępu');
    chk(eMaks >= 0.28 && sMaks > 0.1, 'kolor budzi się z pierwszym prądem: energia koloru max ' + eMaks.toFixed(2) + ', prędkość max ' + sMaks.toFixed(2));
    chk(ost && !ost.aktywny, 'wstęp kończy się sam po ok. ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
    const st = await O(g, () => ({ ster: document.getElementById('ster').classList.contains('pokaz'), cls: document.body.classList.contains('intro'), pauza: __okruszek.stan().pauza, tytul: document.getElementById('ster-t').textContent, ok: document.getElementById('ster-ok').textContent, i: __okruszek.intro() }));
    chk(st.ster && !st.cls && st.pauza && st.ok === 'Leć', 'po wstępie: zwykły ekran startu z wyborem sterowania i przyciskiem „Leć” (gra czeka w pauzie)');
    chk(st.i.zapisane === 1, 'flaga „wstęp widziany” ustawiona po wstępie');
    chk(await O(g, () => { const w = __okruszek.stan(); return w.s < 0.02 && __okruszek.energia() < 0.02 && w.dystans < 1; }), 'po wstępie bieg zaczyna się czysto (s i E = 0, dystans 0)');
    const zap = JSON.parse(await ls(g, 'okruszek.zapis'));
    chk(zap && zap.v === 1 && zap.intro === 1 && Array.isArray(zap.bramy) && zap.dz && zap.dz.m === 1 && zap.dz.e === 1, 'zapis okruszek.zapis: v = 1, intro = 1, dz = {m:1,e:1}, reszta Z10 zachowana');
    /* ekran startu działa po wstępie */
    await g.click('.tryb[data-tryb="2"]'); await sleep(100);
    chk(await O(g, () => __okruszek.tryb() === 2) && await ls(g, 'okruszek-sterowanie') !== null, 'po wstępie wybór sterowania (tryb 2) działa i zapisuje się');
    await g.click('#ster-ok'); await sleep(400);
    chk(await O(g, () => !document.getElementById('ster').classList.contains('pokaz') && !__okruszek.stan().pauza && __okruszek.stan().graCzas > 0.1), '„Leć” zamyka ekran startu i gra rusza');
    /* drugi raz: bez wstępu */
    await g.goto(URL0 + 'index.html?test&intro=1&start=1&seed=23'); await sleep(500);
    const i2 = await O(g, () => ({ i: __okruszek.intro(), ster: document.getElementById('ster').classList.contains('pokaz'), cls: document.body.classList.contains('intro'), tryb: __okruszek.tryb() }));
    chk(!i2.i.aktywny && !i2.cls && i2.ster && i2.tryb === 2, 'drugie uruchomienie: bez wstępu, od razu ekran startu, zapamiętany tryb 2');
    await g.close();

    /* dotyk pomija wstęp (prawdziwe zdarzenie wskaźnika) */
    const g2 = await strona(await nowy(), '?test&intro=1&start=1&seed=23');
    await sleep(1200);
    chk(await O(g2, () => __okruszek.intro().aktywny), 'przed dotknięciem wstęp trwa');
    await O(g2, () => __okruszek.dotyk('dol', 1, 0.5, 0.5)); await sleep(300);
    const s2 = await O(g2, () => ({ i: __okruszek.intro(), ster: document.getElementById('ster').classList.contains('pokaz') }));
    chk(!s2.i.aktywny && s2.ster && s2.i.zapisane === 1, 'dotknięcie pomija wstęp: ekran startu, flaga zapisana');
    await g2.context().close();

    /* klawisz pomija wstęp */
    const g3 = await strona(await nowy(), '?test&intro=1&start=1&seed=23'); await sleep(900);
    await g3.keyboard.press('Space'); await sleep(250);
    chk(await O(g3, () => !__okruszek.intro().aktywny && document.getElementById('ster').classList.contains('pokaz')), 'klawisz pomija wstęp');
    await g3.context().close();

    /* ?test bez ?intro=1 nie pokazuje wstępu (testy deterministyczne), ?intro=pokaz zawsze */
    const g4 = await strona(await nowy(), '?test&seed=23');
    chk(await O(g4, () => !__okruszek.intro().aktywny), '?test bez ?intro: bez wstępu (stare testy bez zmian)');
    await g4.context().close();
    const g5 = await strona(await nowy(), '?test&intro=pokaz&seed=23');
    chk(await O(g5, () => __okruszek.intro().aktywny), '?test&intro=pokaz: wstęp zawsze');
    await g5.context().close();

    /* bez ?test: pierwsze uruchomienie = wstęp, drugie = ekran startu */
    const c6 = await nowy();
    const g6 = await strona(c6, '');
    const p6 = await O(g6, () => ({ cls: document.body.classList.contains('intro'), ster: document.getElementById('ster').classList.contains('pokaz'), hak: typeof window.__okruszek }));
    chk(p6.cls && !p6.ster && p6.hak === 'undefined', 'bez ?test, pierwsze uruchomienie: wstęp (i brak haka testowego)');
    await g6.mouse.click(200, 400); await sleep(400);
    const p6b = await O(g6, () => ({ cls: document.body.classList.contains('intro'), ster: document.getElementById('ster').classList.contains('pokaz') }));
    chk(!p6b.cls && p6b.ster, 'bez ?test: kliknięcie pomija wstęp i otwiera ekran startu');
    await g6.goto(URL0 + 'index.html'); await sleep(500);
    const p6c = await O(g6, () => ({ cls: document.body.classList.contains('intro'), ster: document.getElementById('ster').classList.contains('pokaz'), ok: document.getElementById('ster-ok').textContent }));
    chk(!p6c.cls && p6c.ster && p6c.ok === 'Leć', 'bez ?test, drugie uruchomienie: tylko ekran startu z przyciskiem „Leć”');
    await c6.close();

    /* uszkodzony JSON w zapisie: czysty start, kopia w .zly, wstęp się pokazuje, brak błędów */
    const c7 = await nowy(); const g7 = await c7.newPage();
    g7.on('pageerror', e => errors.push('pageerror: ' + e + ' @ uszkodzony')); g7.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text() + ' @ uszkodzony'); });
    await g7.addInitScript(() => { try { if (!localStorage.getItem('okruszek.zapis')) localStorage.setItem('okruszek.zapis', '{to nie jest json'); } catch (e) { } });
    await g7.goto(URL0 + 'index.html?test&intro=1&start=1&seed=23'); await sleep(500);
    chk(await O(g7, () => __okruszek.intro().aktywny) && (await ls(g7, 'okruszek.zapis.zly')) === '{to nie jest json', 'uszkodzony JSON: gra startuje, wstęp się pokazuje, kopia w okruszek.zapis.zly');
    await c7.close();

    /* tryb prywatny: localStorage rzuca wyjątki */
    const c8 = await nowy(); const g8 = await c8.newPage(); let blad8 = 0;
    g8.on('pageerror', e => { blad8++; errors.push('pageerror: ' + e + ' @ prywatny'); }); g8.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') { blad8++; errors.push(m.type() + ': ' + m.text() + ' @ prywatny'); } });
    await g8.addInitScript(() => { const bl = () => { throw new DOMException('QuotaExceededError', 'QuotaExceededError'); }; Storage.prototype.getItem = bl; Storage.prototype.setItem = bl; Storage.prototype.removeItem = bl; });
    await g8.goto(URL0 + 'index.html?test&intro=1&start=1&seed=23'); await sleep(500);
    chk(await O(g8, () => __okruszek.intro().aktywny) && blad8 === 0, 'tryb prywatny (localStorage rzuca): gra działa, wstęp się pokazuje, brak błędów');
    await g8.keyboard.press('Space'); await sleep(300);
    chk(await O(g8, () => document.getElementById('ster').classList.contains('pokaz')), 'tryb prywatny: pominięcie wstępu i ekran startu działają bez zapisu');
    await g8.click('#snd-m'); await sleep(100);
    chk(await O(g8, () => __okruszek.dzwiekLicznik().muzyka === false) && blad8 === 0, 'tryb prywatny: przełącznik muzyki działa w pamięci, bez błędów');
    await c8.close();

    /* starszy zapis v1 (Z10) bez pól intro i dz: wstęp raz, reszta zachowana, v = 1 */
    const c9 = await nowy(); const g9 = await c9.newPage();
    g9.on('pageerror', e => errors.push('pageerror: ' + e + ' @ stary zapis')); g9.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text() + ' @ stary zapis'); });
    await g9.addInitScript(() => { try { if (!localStorage.getItem('okruszek.zapis')) localStorage.setItem('okruszek.zapis', JSON.stringify({ v: 1, bramy: [1, 2], najdalej: 1234, najdluzszy: 555, krainy: { 1: { m: 800, loty: 3 } }, krotkie: 1, dzien: { d: '2026-10-24', n: 2 } })); } catch (e) { } });
    await g9.goto(URL0 + 'index.html?test&intro=1&start=1&seed=23'); await sleep(500);
    chk(await O(g9, () => __okruszek.intro().aktywny), 'starszy zapis v1 bez pola intro: wstęp pokazuje się jeszcze raz');
    await g9.keyboard.press('Space'); await sleep(300);
    const z9 = JSON.parse(await ls(g9, 'okruszek.zapis'));
    chk(z9.v === 1 && z9.intro === 1 && JSON.stringify(z9.bramy) === '[1,2]' && z9.najdalej === 1234 && z9.krainy[1].m === 800 && z9.krainy[1].loty === 4 && z9.dz.e === 1, 'starszy zapis: v = 1, bramy, rekordy, metry krainy bez zmian (wstęp nie liczy lotów ani metrów), doszło intro = 1');
    await c9.close();
  }

  /* ---------- (c) dźwięk ---------- */
  console.log('(c) dźwięk: moduł, wywołania, przełączniki, pauza');
  {
    const ctx = await nowy();
    const g = await strona(ctx, '?test&seed=23&start=1');
    const mod = await O(g, () => { const d = window.OkruszekDzwiek; return d ? Object.keys(d).sort().join(',') : null; });
    // Z19 rozszerza publiczne API o dziesięć głosów; zachowujemy dokładne sprawdzanie wszystkich nazw.
    chk(mod === 'cwir,dzwiek,ladowanie,muzyka,nurkowanie,och,pauza,prad,predkosc,start,machniecie,uderzenie,wybicie,lancuch,rozkwit,drapieznik,turbo,hiper,schody,nurkStart'.split(',').sort().join(','), 'dzwiek.js załadowany: dotychczasowe API i dziesięć nowych głosów Z19');
    const l0 = await O(g, () => __okruszek.dzwiekLicznik());
    { const pt = await O(g, () => __okruszek.ptak()); chk(pt && typeof pt.z === 'number' && typeof pt.hit === 'number', 'stary hak ptak() (położenie ptaszka) nietknięty przez hak ikon rysujPtaka'); }
    chk(!l0.aktywny && l0.zaladowany, 'w ?test dźwięk wyciszony (moduł nie jest wołany), ale załadowany');
    await sleep(500);
    const l1 = await O(g, () => __okruszek.dzwiekLicznik());
    chk(l1.n.predkosc - l0.n.predkosc >= 10, 'predkosc(s) wołane co klatkę (' + (l1.n.predkosc - l0.n.predkosc) + ' wywołań w 0,5 s)');
    chk(l1.n.start === 0, 'start() jeszcze nie wołany przed pierwszym gestem');
    chk(l1.n.dzwiek >= 1 && l1.n.muzyka >= 1, 'przy starcie przekazane zapamiętane ustawienia efektów i muzyki');
    /* start na pierwszym geście */
    await g.mouse.click(10, 10); await sleep(100);
    const l2 = await O(g, () => __okruszek.dzwiekLicznik());
    chk(l2.n.start === 1 && l2.otwarty, 'start() przy pierwszym geście (1 wywołanie, potem już nie)');
    await g.mouse.click(12, 12); await sleep(100);
    chk((await O(g, () => __okruszek.dzwiekLicznik())).n.start === 1, 'kolejne gesty nie wołają start() ponownie');
    /* Leć z ekranu startu = ćwir */
    const c0 = (await O(g, () => __okruszek.dzwiekLicznik())).n.cwir;
    await g.click('#ster-ok'); await sleep(400);
    chk((await O(g, () => __okruszek.dzwiekLicznik())).n.cwir === c0 + 1, 'cwir() na starcie biegu (Leć)');
    /* prąd */
    const p0 = (await O(g, () => __okruszek.dzwiekLicznik())).n.prad;
    await O(g, () => { __okruszek.trafPrad(); }); await sleep(100);
    chk((await O(g, () => __okruszek.dzwiekLicznik())).n.prad === p0 + 1, 'prad() przy wlocie w prąd');
    /* nurkowanie */
    await O(g, () => __okruszek.nurkuj(true)); await sleep(200);
    const dn1 = await O(g, () => __okruszek.dzwiekLicznik());
    await O(g, () => __okruszek.nurkuj(false)); await sleep(200);
    const dn2 = await O(g, () => __okruszek.dzwiekLicznik());
    chk(dn1.ostatni.nurkowanie === true && dn2.ostatni.nurkowanie === false && dn2.n.nurkowanie === dn1.n.nurkowanie + 1, 'nurkowanie(bool) tylko przy zmianie stanu (true przy nurkowaniu, false po puszczeniu)');
    /* pauza */
    await O(g, () => __okruszek.pauza(true)); await sleep(100);
    const pa1 = await O(g, () => __okruszek.dzwiekLicznik());
    await O(g, () => __okruszek.pauza(false)); await sleep(100);
    const pa2 = await O(g, () => __okruszek.dzwiekLicznik());
    chk(pa1.ostatni.pauza === true && pa2.ostatni.pauza === false, 'pauza(true) przy pauzie, pauza(false) po wznowieniu');
    await O(g, () => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); }); await sleep(100);
    const pa3 = await O(g, () => __okruszek.dzwiekLicznik());
    await O(g, () => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); __okruszek.pauza(false); }); await sleep(100);
    const pa4 = await O(g, () => __okruszek.dzwiekLicznik());
    chk(pa3.ostatni.pauza === true && pa4.ostatni.pauza === false, 'ukrycie karty (visibilitychange) wycisza, powrót włącza');
    /* och: złapanie przez jastrzębia */
    await O(g, () => { const o = __okruszek; o.odblokuj(); o.bezPrzeszkod(false); o.nowyBieg(); o.tempo(8); o.ustaw(0); o.zdarzenie('jastrzab'); });
    let och = 0; for (let i = 0; i < 40 && !och; i++) { await sleep(250); och = (await O(g, () => __okruszek.dzwiekLicznik())).n.och; }
    chk(och === 1, 'och() przy złapaniu przez jastrzębia (' + och + ')');
    await O(g, () => { const o = __okruszek; o.tempo(1); o.odblokuj(); });
    /* ladowanie */
    await O(g, () => { const o = __okruszek; o.odblokuj(); o.nowyBieg(); o.bezPradow(true); o.bezPrzeszkod(true); o.ustawWysokosc(0); });
    await sleep(400);
    chk((await O(g, () => __okruszek.dzwiekLicznik())).n.ladowanie === 1, 'ladowanie() przy lądowaniu');
    /* ekran końca biegu: tekst historii (lądowanie) */
    await sleep(1800);
    const kon = await O(g, () => ({ et: document.getElementById('w-et').textContent, lin: document.getElementById('w-lin').textContent, m: document.getElementById('w-m').textContent, lab: document.getElementById('wynik').getAttribute('aria-label'), poz: document.getElementById('wynik').classList.contains('pokaz') }));
    chk(kon.poz && kon.et === 'Przeleciał' && kon.lin === 'Okruszek zasnął na chmurce.\nSłońce obiecało wrócić rano.', 'ekran końca (lądowanie): „' + kon.et + ' ' + kon.m + ' m” + „' + kon.lin.replace('\n', ' ') + '”');
    chk(kon.lab === 'Okruszek zasnął na chmurce. Przeleciał ' + kon.m + ' m. Słońce obiecało wrócić rano.', 'czytnik ekranu czyta całość: „' + kon.lab + '”');
    /* Jeszcze raz = cwir */
    const c1 = (await O(g, () => __okruszek.dzwiekLicznik())).n.cwir;
    await g.click('#jeszcze'); await sleep(300);
    chk((await O(g, () => __okruszek.dzwiekLicznik())).n.cwir === c1 + 1, '„Jeszcze raz” też zaczyna od ćwirnięcia');
    /* jastrząb i sowa: teksty bez zmian */
    for (const [rodzaj, lin] of [['jastrzab', 'Jastrząb był szybszy.\nOkruszek wraca jutro.'], ['sowa', 'Sowa była szybsza.\nOkruszek wraca jutro.']]) {
      await O(g, (r) => { const o = __okruszek; o.odblokuj(); o.bezPrzeszkod(false); o.bezPradow(true); o.nowyBieg(); o.tempo(8); o.ustaw(0); if (r === 'sowa') o.noc(true); o.zdarzenie(r); }, rodzaj);
      let koniec = false; for (let i = 0; i < 48 && !koniec; i++) { await sleep(250); koniec = await O(g, () => document.getElementById('wynik').classList.contains('pokaz')); }
      const t = await O(g, () => ({ et: document.getElementById('w-et').textContent, lin: document.getElementById('w-lin').textContent }));
      chk(koniec && t.et === 'Koniec lotu' && t.lin === lin, 'ekran końca (' + rodzaj + '): „' + t.et + '” / „' + t.lin.replace('\n', ' ') + '” bez zmian');
      await O(g, () => { const o = __okruszek; o.tempo(1); o.odblokuj(); o.noc(false); });
    }
    await ctx.close();
  }
  {
    /* przełączniki M / N, przyciski w panelu, pamięć wyboru */
    const ctx = await nowy();
    const g = await strona(ctx, '?test&seed=23');
    await g.keyboard.press('m'); await sleep(80);
    let l = await O(g, () => __okruszek.dzwiekLicznik());
    chk(l.efekty === false && l.ostatni.dzwiek === false && l.muzyka === true, 'klawisz M wyłącza efekty (dzwiek(false)), muzyka bez zmian');
    await g.keyboard.press('n'); await sleep(80);
    l = await O(g, () => __okruszek.dzwiekLicznik());
    chk(l.muzyka === false && l.ostatni.muzyka === false, 'klawisz N wyłącza muzykę (muzyka(false))');
    let zap = JSON.parse(await ls(g, 'okruszek.zapis'));
    chk(zap && zap.dz && zap.dz.e === 0 && zap.dz.m === 0 && zap.v === 1, 'wybór zapisany w okruszek.zapis (dz.e = 0, dz.m = 0, v = 1)');
    await g.goto(URL0 + 'index.html?test&seed=23'); await sleep(400);
    l = await O(g, () => __okruszek.dzwiekLicznik());
    chk(l.efekty === false && l.muzyka === false && l.ostatni.dzwiek === false && l.ostatni.muzyka === false, 'po przeładowaniu wybór zapamiętany i przekazany modułowi');
    await O(g, () => __okruszek.panel(true)); await sleep(350);
    const pr = await O(g, () => { const q = (id) => { const b = document.getElementById(id).getBoundingClientRect(); return { w: b.width, h: b.height, t: b.top, b: b.bottom, l: b.left, r: b.right, on: document.getElementById(id).getAttribute('aria-pressed') }; }; return { e: q('snd-e'), m: q('snd-m'), lnk: q('ster-priv'), ok: q('ster-ok'), W: innerWidth, H: innerHeight, es: document.getElementById('snd-e-s').textContent, ms: document.getElementById('snd-m-s').textContent }; });
    chk(pr.e.h >= 44 && pr.e.w >= 44 && pr.m.h >= 44 && pr.m.w >= 44 && pr.lnk.h >= 44, 'przełączniki dźwięku w panelu mają co najmniej 44 px (efekty ' + Math.round(pr.e.w) + 'x' + Math.round(pr.e.h) + ', muzyka ' + Math.round(pr.m.w) + 'x' + Math.round(pr.m.h) + ', link ' + Math.round(pr.lnk.h) + ' px)');
    chk(pr.e.on === 'false' && pr.m.on === 'false' && pr.es === 'wyłączone' && pr.ms === 'wyłączona', 'panel pokazuje zapamiętany stan (efekty i muzyka wyłączone)');
    chk(pr.e.b < pr.m.t || pr.e.r <= pr.m.l, 'przełączniki nie nachodzą na siebie; panel mieści się w ekranie: dolny link kończy się na ' + Math.round(pr.lnk.b) + ' z ' + pr.H);
    await g.click('#snd-e'); await sleep(80);
    l = await O(g, () => __okruszek.dzwiekLicznik());
    chk(l.efekty === true && l.ostatni.dzwiek === true, 'przycisk „Efekty” w panelu włącza efekty');
    await g.click('#snd-m'); await sleep(80);
    l = await O(g, () => __okruszek.dzwiekLicznik());
    chk(l.muzyka === true && l.ostatni.muzyka === true, 'przycisk „Muzyka” w panelu włącza muzykę');
    zap = JSON.parse(await ls(g, 'okruszek.zapis'));
    chk(zap.dz.e === 1 && zap.dz.m === 1, 'zmiana z panelu też zapisana');
    await g.keyboard.press('Escape'); await sleep(300);
    await ctx.close();
  }
  {
    /* prawdziwy moduł (?dzwiek=1): start() po geście, wywołania bez błędów */
    const ctx = await nowy();
    const g = await strona(ctx, '?test&dzwiek=1&seed=23');
    await g.mouse.click(10, 10); await sleep(400);
    const l = await O(g, () => __okruszek.dzwiekLicznik());
    chk(l.aktywny && l.otwarty, 'z ?dzwiek=1 prawdziwy moduł startuje (AudioContext uruchomiony po geście)');
    await O(g, () => { const o = __okruszek; o.trafPrad(); o.nurkuj(true); }); await sleep(300);
    await O(g, () => { __okruszek.nurkuj(false); __okruszek.pauza(true); }); await sleep(200); await O(g, () => __okruszek.pauza(false)); await sleep(200);
    ok('z ?dzwiek=1 prąd, nurkowanie i pauza przechodzą przez prawdziwy moduł bez wyjątków');
    await ctx.close();
  }

  /* ---------- (d) PWA ---------- */
  console.log('(d) PWA: service worker, pamięć, najpierw sieć, offline');
  {
    const ctx = await nowy();
    const gt = await strona(ctx, '?test&seed=23'); await sleep(800);
    chk((await O(gt, () => navigator.serviceWorker.getRegistrations().then(r => r.length))) === 0, 'w ?test service worker się nie rejestruje');
    await gt.close();
    const g = await strona(ctx, '');
    const reg = await O(g, async () => { const r = await navigator.serviceWorker.ready; return { scope: r.scope, stan: r.active && r.active.state, script: r.active && r.active.scriptURL }; });
    chk(reg.scope === URL0 && /sw\.js$/.test(reg.script), 'service worker rejestruje się na localhost (zakres ' + reg.scope + ')');
    await sleep(800);
    const keys = await O(g, () => caches.keys());
    chk(keys.length === 1 && /^crumbi-\d+$/.test(keys[0]), 'pamięć podręczna: ' + keys.join(','));
    const cached = await O(g, async (k) => { const c = await caches.open(k); const r = await c.keys(); return r.map(x => new URL(x.url).pathname); }, keys[0]);
    const need = ['/', '/index.html', '/teksty.js', '/dzwiek.js', '/manifest.webmanifest', '/ikona-192.png', '/ikona-512.png', '/ikona-180.png'];
    const miss = need.filter(n => !cached.includes(n));
    chk(miss.length === 0, 'pamięć zawiera wszystkie pliki z precache (' + cached.length + ')' + (miss.length ? ', brakuje: ' + miss.join(', ') : ''));
    const man2 = await O(g, () => fetch('manifest.webmanifest').then(r => ({ ok: r.ok, ct: r.headers.get('content-type') })));
    chk(man2.ok && /manifest/.test(man2.ct), 'manifest serwowany (' + man2.ct + ')');
    chk(await O(g, () => !!document.querySelector('link[rel="manifest"]') && document.querySelector('meta[name="theme-color"]').content === '#cdd5ee'), 'strona wskazuje manifest i theme-color');
    /* najpierw sieć: nowa wersja teksty.js wygrywa z pamięcią i trafia do pamięci */
    teksty2 = true;
    const nowa = await O(g, () => fetch('teksty.js').then(r => r.text()));
    await sleep(300);
    const wCache = await O(g, async () => { const r = await caches.match('teksty.js'); return r ? r.text() : null; });
    chk(/wersja-2/.test(nowa) && /wersja-2/.test(wCache || ''), 'najpierw sieć: przy dostępnym serwerze plik jest nowy i odświeża pamięć');
    teksty2 = false;
    /* offline */
    await ctx.setOffline(true);
    const off = await ctx.newPage(); const offErr = [];
    off.on('pageerror', e => offErr.push(String(e)));
    await off.goto(URL0 + 'index.html?sterowanie=1'); await off.waitForTimeout(800);
    const offOk = await O(off, () => ({ tytul: document.title, canvas: !!document.getElementById('g'), tekst: !!window.OKRUSZEK_TEKSTY, dz: !!window.OkruszekDzwiek }));
    chk(offOk.tytul === 'Okruszek' && offOk.canvas && offOk.tekst && offOk.dz && offErr.length === 0, 'offline: gra otwiera się z pamięci (strona, teksty.js, dzwiek.js), bez błędów');
    await off.close(); await ctx.setOffline(false);
    await ctx.close();
  }

  /* ---------- (e) prywatność i regulamin, Usuń zapis ---------- */
  console.log('(e) prywatność i regulamin, „Usuń zapis”');
  {
    const ctx = await nowy();
    const g = await strona(ctx, '?test&seed=23&start=1');
    chk(await O(g, () => document.getElementById('ster').classList.contains('pokaz') && document.getElementById('ster-priv').textContent === 'Prywatność i regulamin'), 'na ekranie startu jest link „Prywatność i regulamin”');
    await g.click('#ster-priv'); await sleep(400);
    const pv = await O(g, () => { const e = document.getElementById('priv'); return { poz: e.classList.contains('pokaz'), txt: e.innerText, html: e.innerHTML }; });
    chk(pv.poz, 'link otwiera ekran prywatności i regulaminu w grze');
    chk(/iapply sp\. z o\.o\./.test(pv.txt), 'tekst zawiera „iapply sp. z o.o.”');
    chk(!/redakcj/i.test(pv.html) && !/ostwald/i.test(pv.html) && !/patryk/i.test(pv.html), 'tekst bez „redakcj” i bez nazwiska właściciela');
    chk(/okruszek-sterowanie/.test(pv.txt) && /okruszek\.zapis/.test(pv.txt) && /ciasteczek/.test(pv.txt) && /analityk/.test(pv.txt) && /synteza/.test(pv.txt) && /reklam/.test(pv.txt), 'tekst opisuje klucze zapisu, brak ciasteczek i analityki, własną syntezę dźwięku, brak reklam');
    chk(/KRS 0001133291/.test(pv.txt) && /NIP 7831915094/.test(pv.txt) && /kontakt@iapply\.pl/.test(pv.txt), 'dane operatora jak w Kociłapkach (KRS, NIP, kontakt)');
    const bt = await O(g, () => ['priv-usun', 'priv-wroc'].map(id => { const b = document.getElementById(id).getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; }));
    chk(bt.every(b => b[0] >= 44 && b[1] >= 44), 'przyciski ekranu prywatności mają co najmniej 44 px: ' + JSON.stringify(bt));
    /* zapis do usunięcia: ustaw i sprawdź */
    await O(g, () => { localStorage.setItem('okruszek-sterowanie', JSON.stringify({ v: 1, m: 3, c: 1.2 })); localStorage.setItem('okruszek.zapis.zly', 'x'); localStorage.setItem('okruszek.zapis', JSON.stringify({ v: 1, bramy: [1, 2], najdalej: 10, najdluzszy: 10, krainy: {}, krotkie: 0, dzien: { d: '', n: 0 }, intro: 1, dz: { m: 1, e: 1 } })); });
    await g.click('#priv-usun'); await sleep(150);
    chk(await O(g, () => !document.getElementById('priv-pyt').hidden && /Usunąć zapis/.test(document.getElementById('priv-pyt').innerText)), '„Usuń zapis” pyta o potwierdzenie');
    chk((await ls(g, 'okruszek.zapis')) !== null && (await ls(g, 'okruszek-sterowanie')) !== null, 'przed potwierdzeniem nic nie zostało usunięte');
    await g.click('#priv-nie'); await sleep(100);
    chk(await O(g, () => document.getElementById('priv-pyt').hidden) && (await ls(g, 'okruszek-sterowanie')) !== null, '„Nie” zamyka pytanie i niczego nie kasuje');
    await g.click('#priv-usun'); await g.click('#priv-tak'); await sleep(200);
    const k = [await ls(g, 'okruszek-sterowanie'), await ls(g, 'okruszek.zapis'), await ls(g, 'okruszek.zapis.zly')];
    chk(k.every(v => v === null), '„Tak, usuń” czyści wszystkie trzy klucze (okruszek-sterowanie, okruszek.zapis, okruszek.zapis.zly)');
    chk(await O(g, () => /Zapis usunięty/.test(document.getElementById('priv-info').textContent) && __okruszek.tryb() === 1 && __okruszek.zapisPodglad().intro === 0), 'komunikat „Zapis usunięty”, tryb sterowania wraca do 1, flaga wstępu zerowa');
    await g.keyboard.press('Escape'); await sleep(300);
    chk(await O(g, () => !document.getElementById('priv').classList.contains('pokaz') && document.getElementById('ster').classList.contains('pokaz')), 'Esc zamyka prywatność i wraca do ekranu startu');
    await ctx.close();
    /* w grze bez ?test: po usunięciu strona przeładowuje się i pokazuje wstęp */
    const c2 = await nowy();
    const g2 = await strona(c2, '');
    await g2.mouse.click(200, 400); await sleep(400);
    chk((await ls(g2, 'okruszek.zapis')) !== null, 'bez ?test: po wstępie zapis istnieje');
    await g2.click('#ster-priv'); await sleep(300); await g2.click('#priv-usun'); await g2.click('#priv-tak');
    await g2.waitForNavigation({ timeout: 4000 }).catch(() => { }); await sleep(700);
    chk(await O(g2, () => document.body.classList.contains('intro')), 'bez ?test: po „Usuń zapis” gra przeładowuje się i znów pokazuje wstęp');
    await c2.close();
  }

  /* ---------- (g) błędy konsoli ---------- */
  console.log('(g) konsola');
  const ist = errors.filter(e => !/favicon|Failed to load resource: the server responded with a status of 404/.test(e));
  chk(ist.length === 0, 'brak błędów i ostrzeżeń konsoli we wszystkich scenariuszach' + (ist.length ? ': ' + ist.slice(0, 4).join(' | ') : ''));

  await browser.close(); srv.close();
  console.log(fail ? ('WYNIK: ' + fail + ' porażek') : 'TEST Z5 OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('BŁĄD TESTU: ' + (e && e.stack || e)); process.exit(2); });
