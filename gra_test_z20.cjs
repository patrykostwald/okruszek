/* Okruszek Z20: testy Playwright przycisku „Zainstaluj” i instalowalności PWA. Użycie: node gra_test_z20.cjs  (index.html obok; lokalny serwer http na localhost jak w Z5)
   Serwer dokłada CSP z produkcji (zbudujmi/wdrozenie/dist/_headers, reguła /crumbi/*), żeby naruszenie CSP wyszło jako błąd konsoli.
   (a) pliki: manifest (id, lang pl, description, categories games, ikony any 192/512 + osobna maskable, standalone, orientation any, kolory jasnego startu), ikony istnieją i mają deklarowane
       rozmiary, maskable pełna do krawędzi (alfa 255) z ptaszkiem w strefie bezpiecznej; sw.js (crumbi-N >= 3, precache nowej ikony); head (apple-mobile-web-app-capable, apple-touch-icon 180, tytuł)
   (b) ?test bez parametru: przycisk ukryty, brak nasłuchu (istniejące testy nie dostają nowego elementu)
   (c) android: sztuczne beforeinstallprompt (preventDefault, przycisk dopiero po zdarzeniu, na ekranie startu i w panelu pauzy), klik = prompt(), dismissed = przycisk zostaje + komunikat,
       drugi klik = wskazówka (nie martwy), nowe zdarzenie + accepted = ukryty; appinstalled = ukryty
   (d) ios: instrukcja otwiera się i zamyka (dotknięcie, Esc, przycisk), trzy kroki z rysunkami, fokus; standalone i brak: ukryty
   (e) wykrywanie bez ?test: iPhone UA, iPad udający Maca (maxTouchPoints > 1), navigator.standalone, zwykły komputer bez zdarzenia = ukryty, ze zdarzeniem = widoczny
   (f) dostępność i układ: cele >= 44 px, aria-label, kolejność Tab, brak zasłaniania, panel bez przewijania na 390x844, instrukcja mieści się w ekranie
   (g) instalowalność: Page.getInstallabilityErrors puste na http://localhost, SW z fetch aktywny, offline działa (w tym ikona maskable z pamięci)
   (h) brak błędów konsoli. Kończy się kodem 0 tylko gdy wszystko przeszło. */
const path = require('path'), fs = require('fs'), http = require('http');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const dir = process.argv[2] ? path.dirname(path.resolve(process.argv[2])) : __dirname;
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  FAIL ' + m); };
const chk = (c, good, badm) => (c ? ok(good) : bad(badm || good));
const info = (m) => console.log('  info ' + m);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
/* CSP jak dla /crumbi/* na produkcji (kopia reguły z _headers; tylko odczyt) */
const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'";

(async () => {
  console.log('TEST Z20 ' + dir);
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path.join(dir, p);
    if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nie ma'); return; }
    res.writeHead(200, { 'Content-Type': TYPY[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'Content-Security-Policy': CSP }); res.end(fs.readFileSync(f));
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const PORT = srv.address().port, URL0 = 'http://localhost:' + PORT + '/';
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1', '--autoplay-policy=no-user-gesture-required'] });
  const errors = [];
  const nowy = (opts) => browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true }, opts || {}));
  const strona = async (ctx, query, init) => {
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push('pageerror: ' + e + ' @ ' + query));
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text() + ' @ ' + query); });
    if (init) await page.addInitScript(init);
    await page.goto(URL0 + 'index.html' + (query || '')); await page.waitForTimeout(500);
    return page;
  };
  const O = (page, f, a) => page.evaluate(f, a);
  const stan = (g) => O(g, () => __okruszek.instaluj());
  const wid = (g) => O(g, () => { const b = document.getElementById('instal'), r = b.getBoundingClientRect(), cs = getComputedStyle(b); return !b.hidden && cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; });
  /* sztuczne zdarzenie instalacji jak z Chrome: prompt() liczy wywołania, userChoice rozstrzyga test */
  const zdarzenie = (g) => O(g, () => {
    const e = new Event('beforeinstallprompt', { cancelable: true });
    window.__pN = (window.__pN || 0);
    e.prompt = function () { window.__pN++; return Promise.resolve(); };
    e.userChoice = new Promise(function (r) { window.__wybor = r; });
    window.dispatchEvent(e); return e.defaultPrevented;
  });

  /* ---------- (a) pliki ---------- */
  console.log('(a) pliki: manifest, ikony, sw.js, head');
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  let man = null;
  try { man = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.webmanifest'), 'utf8')); ok('manifest.webmanifest to poprawny JSON'); } catch (e) { bad('manifest: ' + e); }
  if (man) {
    chk(typeof man.id === 'string' && man.id.length > 0, 'manifest: id (' + man.id + ')');
    chk(man.lang === 'pl' && typeof man.description === 'string' && man.description.length > 20, 'manifest: lang pl i opis');
    chk(Array.isArray(man.categories) && man.categories.includes('games'), 'manifest: categories zawiera games');
    chk(man.display === 'standalone' && man.orientation === 'any', 'manifest: display standalone, orientation any (nie blokuje poziomu)');
    chk(man.start_url === './' && man.scope === './', 'manifest: start_url i scope ./ (działa pod /crumbi/)');
    chk(/^#[0-9a-f]{6}$/i.test(man.theme_color) && man.theme_color.toLowerCase() === '#cdd5ee' && man.background_color.toLowerCase() === '#cdd5ee', 'manifest: theme_color i background_color = jasne niebo startu #cdd5ee');
    chk(man.name === 'Crumbi' && man.short_name === 'Crumbi', 'manifest: name i short_name Crumbi');
    const ic = man.icons || [];
    const a192 = ic.find(i => i.sizes === '192x192' && i.purpose === 'any'), a512 = ic.find(i => i.sizes === '512x512' && i.purpose === 'any'), mk = ic.find(i => i.purpose === 'maskable');
    chk(!!a192 && !!a512, 'manifest: ikony 192 i 512 z purpose "any"');
    chk(!!mk && mk.sizes === '512x512' && mk.src !== (a512 && a512.src), 'manifest: osobna ikona maskable 512 (' + (mk && mk.src) + ')');
    chk(ic.every(i => i.purpose === 'any' || i.purpose === 'maskable'), 'manifest: żadna ikona nie łączy "any maskable" (osobne pliki)');
    for (const i of ic) {
      const f = path.join(dir, i.src);
      if (!fs.existsSync(f)) { bad('brak ikony ' + i.src); continue; }
      const b = fs.readFileSync(f), sig = b.slice(0, 8).toString('hex') === '89504e470d0a1a0a', w = b.readUInt32BE(16), h = b.readUInt32BE(20), [dw, dh] = i.sizes.split('x').map(Number);
      chk(sig && w === dw && h === dh && i.type === 'image/png', 'ikona ' + i.src + ': PNG ' + w + 'x' + h + ' = deklarowane ' + i.sizes + ' (' + i.purpose + ')');
    }
    /* maskable: pełna do krawędzi (alfa 255 w rogach i na brzegach), a ptaszek w strefie bezpiecznej = środkowe 80% okręgu (sprawdzone generatorem ikona_maskable.cjs; tu: rogi nie są przezroczyste, a środek różni się od narożnika) */
    if (mk) {
      const ctx = await nowy(); const g = await ctx.newPage();
      await g.goto(URL0 + mk.src);
      const r = await g.evaluate(async () => {
        const im = document.images[0]; await im.decode(); const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
        const px = (a, b) => Array.from(x.getImageData(a, b, 1, 1).data), W = c.width - 1, pts = [[0, 0], [W, 0], [0, W], [W, W], [256, 0], [256, W], [0, 256], [W, 256]];
        return { alfy: pts.map(p => px(p[0], p[1])[3]), srodek: px(256, 250), rog: px(2, 2), w: c.width };
      });
      chk(r.alfy.every(a => a === 255), 'maskable: pełne tło do krawędzi (alfa 255 w rogach i na środkach boków)');
      chk(Math.abs(r.srodek[0] - r.rog[0]) + Math.abs(r.srodek[1] - r.rog[1]) + Math.abs(r.srodek[2] - r.rog[2]) > 30, 'maskable: środek (ptaszek) różni się od narożnika');
      await ctx.close();
    }
  }
  const sw = fs.readFileSync(path.join(dir, 'sw.js'), 'utf8');
  const mNum = sw.match(/const PAMIEC = 'crumbi-(\d+)'/);
  chk(mNum && +mNum[1] >= 3, 'sw.js: stała wersja pamięci crumbi-' + (mNum && mNum[1]) + ' (>= 3, podbita w Z20)');
  chk(/ikona-512-maskable\.png/.test(sw), 'sw.js: precache obejmuje ikonę maskable');
  for (const m of [...sw.matchAll(/'\.\/([^']+)'/g)].map(x => x[1]).filter(x => x && !/^crumbi/.test(x))) chk(fs.existsSync(path.join(dir, m)), 'precache: plik istnieje: ' + m);
  chk(/fetch/.test(sw) && /addEventListener\('fetch'/.test(sw), 'sw.js: ma obsługę fetch (warunek instalowalności)');
  chk(/<meta name="apple-mobile-web-app-capable" content="yes">/.test(html) && /<meta name="apple-mobile-web-app-title" content="Crumbi">/.test(html), 'head: apple-mobile-web-app-capable i tytuł Crumbi');
  chk(/<link rel="apple-touch-icon"[^>]*href="ikona-180\.png"/.test(html) && /<link rel="manifest" href="manifest\.webmanifest">/.test(html) && /<title>[^<]+<\/title>/.test(html), 'head: apple-touch-icon 180, link do manifestu, <title>');
  const TX = (() => { const w = {}; require('vm').runInNewContext(fs.readFileSync(path.join(dir, 'teksty.js'), 'utf8'), { window: w }); return w.OKRUSZEK_TEKSTY; })();
  const TI = TX.instaluj || {};
  chk(TI.przycisk === 'Zainstaluj' && TI.ios && TI.ios.kroki && TI.ios.kroki.length === 3 && /Udostępnij/.test(TI.ios.kroki[0]) && /Dodaj do ekranu początkowego/.test(TI.ios.kroki[1]), 'teksty.js: przycisk, trzy kroki iOS po polsku');
  chk(!/redakcj/i.test(JSON.stringify(TI)) && !/[\u2013\u2014]/.test(JSON.stringify(TI)), 'teksty Z20: bez „redakcj” i bez długich myślników');

  /* ---------- (b) ?test bez parametru ---------- */
  console.log('(b) ?test bez ?instaluj: ukryty, bez nasłuchu');
  {
    const ctx = await nowy();
    const g = await strona(ctx, '?test&start=1&seed=23');
    chk(await O(g, () => document.getElementById('ster').classList.contains('pokaz')), 'ekran startu otwarty');
    chk(!(await wid(g)) && (await stan(g)).scenariusz === '', 'przycisk ukryty, scenariusz pusty');
    await zdarzenie(g); await sleep(80);
    chk(!(await wid(g)) && !(await stan(g)).maOdlozone, 'zdarzenie beforeinstallprompt w ?test bez parametru nie pokazuje przycisku (brak nasłuchu)');
    chk(await O(g, () => { const b = document.getElementById('instal'); return getComputedStyle(b).display === 'none' && b.getBoundingClientRect().height === 0; }), 'ukryty przycisk nie zajmuje miejsca (display none)');
    await ctx.close();
  }

  /* ---------- (c) android ---------- */
  console.log('(c) android: beforeinstallprompt, prompt(), wynik, appinstalled');
  {
    const ctx = await nowy();
    const g = await strona(ctx, '?test&start=1&instaluj=android&seed=23');
    chk((await stan(g)).scenariusz === 'android' && !(await wid(g)), 'przed zdarzeniem: przycisk ukryty (jak w prawdziwej przeglądarce)');
    const pan0 = await O(g, () => document.querySelector('#ster .pan').getBoundingClientRect().top);
    const prev = await zdarzenie(g); await sleep(80);
    const pan1 = await O(g, () => document.querySelector('#ster .pan').getBoundingClientRect().top);
    chk(Math.abs(pan1 - pan0) < 0.5, 'panel nie przeskakuje, gdy zdarzenie przyjdzie po chwili (górna krawędź ' + pan0.toFixed(1) + ' -> ' + pan1.toFixed(1) + ' px; miejsce zarezerwowane z góry)');
    chk(prev === true, 'zdarzenie przechwycone (preventDefault): brak paska przeglądarki');
    chk(await wid(g), 'ekran startu: po zdarzeniu przycisk „Zainstaluj” widoczny');
    const ekr = await O(g, () => ({ ok: document.getElementById('ster-ok').textContent, t: document.getElementById('instal-t').textContent, aria: document.getElementById('instal').getAttribute('aria-label'), pan: document.getElementById('ster').classList.contains('pokaz') }));
    chk(ekr.pan && ekr.ok === 'Leć' && ekr.t === 'Zainstaluj' && /Zainstaluj Crumbi/.test(ekr.aria), 'to ekran startu (Leć), przycisk „Zainstaluj”, aria-label: ' + ekr.aria);
    const bb = await O(g, () => { const r = id => document.getElementById(id).getBoundingClientRect(), a = r('instal'), l = r('ster-ok'), p = r('ster-priv'); return { aw: a.width, ah: a.height, at: a.top, ab: a.bottom, lb: l.bottom, lh: l.height, pt: p.top, vh: innerHeight, ax: a.left, ar: a.right }; });
    chk(bb.ah >= 44 && bb.aw >= 44, 'cel dotyku >= 44 px: ' + bb.aw.toFixed(0) + 'x' + bb.ah.toFixed(0));
    chk(bb.at >= bb.lb && bb.ab <= bb.pt + 0.5, 'przycisk stoi pod „Leć”, nad „Prywatność i regulamin” (nic się nie nakłada)');
    chk(bb.ah < bb.lh + 0.5, 'drugorzędny: niższy od „Leć” (' + bb.ah.toFixed(0) + ' < ' + bb.lh.toFixed(0) + ' px)');
    chk(await O(g, () => { const b = document.getElementById('instal'), cs = getComputedStyle(b); return parseFloat(cs.borderTopWidth) === 0 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)'; }), 'styl: bez obrysu, miękkie jasne tło');
    /* klik */
    await g.click('#instal'); await sleep(120);
    chk((await O(g, () => window.__pN)) === 1, 'klik wywołuje prompt() dokładnie raz');
    chk(await O(g, () => document.getElementById('instal').disabled), 'w trakcie okna przeglądarki przycisk jest wyłączony (bez podwójnego prompt())');
    await O(g, () => window.__wybor({ outcome: 'dismissed', platform: 'web' })); await sleep(150);
    let s = await stan(g);
    chk((await wid(g)) && s.komunikat === TI.pozniej && (await O(g, () => document.getElementById('instal-t').textContent)) === TI.pozniej && !(await O(g, () => document.getElementById('instal').disabled)), 'dismissed: przycisk zostaje, krótki komunikat w przycisku i dla czytnika: „' + s.komunikat + '”');
    await g.click('#instal'); await sleep(120);
    s = await stan(g);
    chk((await O(g, () => window.__pN)) === 1 && s.komunikat === TI.menu && (await O(g, () => document.getElementById('instal-t').textContent)) === TI.menu, 'drugi klik bez nowego zdarzenia: wskazówka „' + s.komunikat + '”, bez ponownego prompt() (nie martwy)');
    await zdarzenie(g); await sleep(80);
    await g.click('#instal'); await sleep(100);
    chk((await O(g, () => window.__pN)) === 2, 'nowe zdarzenie od przeglądarki: kolejny klik wywołuje prompt()');
    await O(g, () => window.__wybor({ outcome: 'accepted', platform: 'web' })); await sleep(200);
    s = await stan(g);
    chk((await wid(g)) && s.komunikat === TI.ok && (await O(g, () => document.getElementById('instal-t').textContent)) === TI.ok, 'accepted: w przycisku chwilę „' + s.komunikat + '”');
    await sleep(2800);
    chk(!(await wid(g)) && (await stan(g)).scenariusz === 'standalone' && (await O(g, () => document.getElementById('instal-t').textContent)) === TI.przycisk, 'accepted: potem przycisk znika (scenariusz standalone), etykieta wraca');
    await ctx.close();
    /* panel pauzy w trakcie lotu */
    const c2 = await nowy();
    const g2 = await strona(c2, '?test&instaluj=android&seed=23');
    await O(g2, () => { __okruszek.panel(true); }); await sleep(350);
    await zdarzenie(g2); await sleep(80);
    const pp = await O(g2, () => ({ pan: document.getElementById('ster').classList.contains('pokaz'), ok: document.getElementById('ster-ok').textContent, tytul: document.getElementById('ster-t').textContent }));
    chk(pp.pan && pp.ok === 'Wróć do lotu' && (await wid(g2)), 'panel pauzy / sterowania (Wróć do lotu): przycisk „Zainstaluj” widoczny');
    await g2.click('#instal'); await sleep(100); await O(g2, () => window.__wybor({ outcome: 'accepted' })); await sleep(2900);
    chk(!(await wid(g2)), 'panel pauzy: po accepted ukryty');
    await c2.close();
    /* appinstalled */
    const c3 = await nowy();
    const g3 = await strona(c3, '?test&start=1&instaluj=android&seed=23');
    await zdarzenie(g3); await sleep(80);
    chk(await wid(g3), 'appinstalled: najpierw widoczny');
    await O(g3, () => window.dispatchEvent(new Event('appinstalled'))); await sleep(150);
    chk((await stan(g3)).komunikat === TI.ok, 'appinstalled: komunikat „' + TI.ok + '”');
    await sleep(2900);
    chk(!(await wid(g3)), 'appinstalled: przycisk potem ukryty');
    await c3.close();
  }

  /* ---------- (d) ios, standalone, brak ---------- */
  console.log('(d) ios: instrukcja; standalone i brak: ukryty');
  {
    const ctx = await nowy();
    const g = await strona(ctx, '?test&start=1&instaluj=ios&seed=23');
    chk((await stan(g)).scenariusz === 'ios' && (await wid(g)), 'ios: przycisk widoczny od razu (iOS nie ma beforeinstallprompt)');
    chk(!(await stan(g)).dialog && await O(g, () => document.getElementById('instr').getAttribute('aria-hidden') === 'true' && getComputedStyle(document.getElementById('instr')).visibility === 'hidden'), 'instrukcja zamknięta na początku');
    await g.click('#instal'); await sleep(450);
    const d = await O(g, () => { const r = document.getElementById('instr'), k = r.querySelector('.kart').getBoundingClientRect(); return { dlg: r.classList.contains('pokaz'), aria: r.getAttribute('aria-hidden'), vis: getComputedStyle(r).visibility, role: r.getAttribute('role'), modal: r.getAttribute('aria-modal'), t: document.getElementById('instr-t').textContent, kroki: [1, 2, 3].map(i => document.getElementById('instr-k' + i).textContent), svg: r.querySelectorAll('li svg').length, foc: document.activeElement && document.activeElement.id, kl: k.left, kr: k.right, kt: k.top, kb: k.bottom, vw: innerWidth, vh: innerHeight, ok: document.getElementById('instr-ok').getBoundingClientRect().height }; });
    chk(d.dlg && d.aria === 'false' && d.vis === 'visible' && d.role === 'dialog' && d.modal === 'true', 'klik otwiera instrukcję (role dialog, aria-modal)');
    chk(d.t === TI.ios.tytul && JSON.stringify(d.kroki) === JSON.stringify(TI.ios.kroki), 'tytuł i trzy kroki z teksty.js: „' + d.kroki[0] + '” / „' + d.kroki[1] + '”');
    chk(d.svg === 3, 'trzy rysunki narysowane kodem (svg), bez obrazków');
    chk(d.kl >= 8 && d.kr <= d.vw - 8 && d.kt >= 0 && d.kb <= d.vh, 'karta mieści się w ekranie 390x844 (' + d.kl.toFixed(0) + '..' + d.kr.toFixed(0) + ' x ' + d.kt.toFixed(0) + '..' + d.kb.toFixed(0) + ')');
    chk(d.ok >= 44 && d.foc === 'instr-ok', 'przycisk „Rozumiem” >= 44 px i ma fokus (' + d.foc + ')');
    await g.mouse.click(30, 60); await sleep(400);   /* dotknięcie poza kartą */
    chk(!(await stan(g)).dialog && await O(g, () => getComputedStyle(document.getElementById('instr')).visibility === 'hidden'), 'dotknięcie ekranu zamyka instrukcję');
    chk(await O(g, () => document.getElementById('ster').classList.contains('pokaz')), 'po zamknięciu ekran startu nadal otwarty (nic nie ruszyło gry)');
    await g.click('#instal'); await sleep(350); await g.click('#instr .kart'); await sleep(350);
    chk(!(await stan(g)).dialog, 'dotknięcie samej karty też zamyka');
    await g.click('#instal'); await sleep(350); await g.keyboard.press('Escape'); await sleep(350);
    chk(!(await stan(g)).dialog && await O(g, () => document.getElementById('ster').classList.contains('pokaz')), 'Esc zamyka tylko instrukcję (panel startu zostaje)');
    await g.click('#instal'); await sleep(350); await g.keyboard.press('Enter'); await sleep(350);
    chk(!(await stan(g)).dialog, 'Enter na „Rozumiem” zamyka');
    await g.click('#instal'); await sleep(350);
    await g.keyboard.press('Tab'); await g.keyboard.press('Tab');
    chk(await O(g, () => document.getElementById('instr').contains(document.activeElement)), 'fokus klawiatury nie ucieka z otwartej instrukcji (pułapka)');
    await g.keyboard.press('Escape'); await sleep(300);
    chk(await O(g, () => document.activeElement && document.activeElement.id) === 'instal', 'po zamknięciu fokus wraca na „Zainstaluj”');
    await ctx.close();
    for (const [sc, opis] of [['standalone', 'już zainstalowana'], ['brak', 'przeglądarka bez instalacji']]) {
      const c = await nowy();
      const gg = await strona(c, '?test&start=1&instaluj=' + sc + '&seed=23');
      await zdarzenie(gg); await sleep(80);
      chk((await stan(gg)).scenariusz === sc && !(await wid(gg)), sc + ' (' + opis + '): przycisk ukryty, także po zdarzeniu instalacji');
      await c.close();
    }
  }

  /* ---------- (e) wykrywanie bez ?test ---------- */
  console.log('(e) wykrywanie platformy w prawdziwym trybie (bez ?test)');
  {
    const IPH = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
    const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
    const widoczny = (g) => O(g, () => !document.getElementById('instal').hidden);
    let ctx = await nowy({ userAgent: IPH }); let g = await strona(ctx, '?seed=23');
    chk(await widoczny(g), 'iPhone (userAgent): przycisk widoczny'); await ctx.close();
    ctx = await nowy({ userAgent: MAC }); g = await strona(ctx, '?seed=23', () => { Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' }); Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 }); });
    chk(await widoczny(g), 'iPad udający Maca (platform MacIntel, maxTouchPoints 5): przycisk widoczny'); await ctx.close();
    ctx = await nowy({ userAgent: MAC }); g = await strona(ctx, '?seed=23', () => { Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' }); Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 }); });
    chk(!(await widoczny(g)), 'prawdziwy Mac (maxTouchPoints 0, Safari bez zdarzenia): ukryty'); await ctx.close();
    ctx = await nowy({ userAgent: IPH }); g = await strona(ctx, '?seed=23', () => { Object.defineProperty(navigator, 'standalone', { get: () => true }); });
    chk(!(await widoczny(g)), 'iPhone z ekranu początkowego (navigator.standalone): ukryty'); await ctx.close();
    ctx = await nowy({ viewport: { width: 1280, height: 800 }, hasTouch: false }); g = await strona(ctx, '?seed=23');
    chk(!(await widoczny(g)), 'komputer bez zdarzenia instalacji (np. Firefox): ukryty, bez martwego przycisku');
    await zdarzenie(g); await sleep(100);
    chk(await widoczny(g), 'ten sam komputer po beforeinstallprompt (Chrome / Edge): widoczny'); await ctx.close();
    ctx = await nowy({ viewport: { width: 1280, height: 800 }, hasTouch: false });
    g = await strona(ctx, '?seed=23', () => { try { delete window.onbeforeinstallprompt; } catch (_) { } try { delete Window.prototype.onbeforeinstallprompt; } catch (_) { } });
    if (await O(g, () => 'onbeforeinstallprompt' in window)) info('nie udało się usunąć onbeforeinstallprompt: pomijam symulację Firefoksa');
    else {
      await zdarzenie(g); await sleep(100);
      chk(!(await widoczny(g)) && await O(g, () => !document.getElementById('instal-w').classList.contains('rez') && getComputedStyle(document.getElementById('instal-w')).display === 'none'), 'przeglądarka bez onbeforeinstallprompt (Firefox, Safari na Macu): ukryty, bez rezerwacji miejsca');
    }
    await ctx.close();
  }

  /* ---------- (f) dostępność i układ ---------- */
  console.log('(f) dostępność i układ');
  {
    const ctx = await nowy();
    const g = await strona(ctx, '?test&start=1&instaluj=android&seed=23');
    await zdarzenie(g); await sleep(100);
    const sc = await O(g, () => { const e = document.getElementById('ster'); return { sh: e.scrollHeight, ch: e.clientHeight, pb: document.querySelector('#ster .pan').getBoundingClientRect().bottom, vh: innerHeight, top: document.querySelector('#ster .pan').getBoundingClientRect().top }; });
    chk(sc.sh <= sc.ch + 1 && sc.pb <= sc.vh, 'ekran startu z przyciskiem mieści się bez przewijania na 390x844 (panel ' + sc.top.toFixed(0) + '..' + sc.pb.toFixed(0) + ')');
    await g.focus('#ster-ok'); await g.keyboard.press('Tab');
    chk(await O(g, () => document.activeElement.id) === 'instal', 'Tab z „Leć” trafia na „Zainstaluj”');
    await g.keyboard.press('Tab');
    chk(await O(g, () => document.activeElement.id) === 'ster-priv', 'kolejny Tab: „Prywatność i regulamin”');
    await g.focus('#instal');
    chk(await O(g, () => { const c = getComputedStyle(document.activeElement); return document.activeElement.matches(':focus-visible') && c.outlineStyle === 'solid' && parseFloat(c.outlineWidth) >= 1.5; }), 'fokus klawiaturą ma widoczny obrys (solid, >= 1,5 px po skali ekranu)');
    chk(await O(g, () => { const k = document.getElementById('instal-st'); return k.getAttribute('role') === 'status' && k.getAttribute('aria-live') === 'polite'; }), 'komunikat: role status, aria-live polite');
    /* nie zasłania wskaźnika i „sterowanie” w trakcie lotu: przycisk jest tylko w oknie #ster, więc po zamknięciu panelu go nie ma w kadrze */
    await g.click('#ster-ok'); await sleep(300);
    chk(await O(g, () => { const b = document.getElementById('instal').getBoundingClientRect(), e = document.getElementById('ster'); return !e.classList.contains('pokaz') && getComputedStyle(e).visibility === 'hidden' && b.width > 0; }), 'po „Leć” okno (a z nim przycisk) jest ukryte: gra i wskaźnik bez nowych elementów');
    chk(await O(g, () => { const b = document.getElementById('sterb').getBoundingClientRect(); const cx = b.left + b.width / 2, cy = b.top + b.height / 2, el = document.elementFromPoint(cx, cy); return el && el.closest('#sterb') !== null; }), 'przycisk „sterowanie” nadal dostępny (nic go nie zasłania)');
    await ctx.close();
    /* mały ekran 360x640: panel może się przewijać, ale przycisk jest osiągalny */
    const c2 = await nowy({ viewport: { width: 360, height: 640 } });
    const g2 = await strona(c2, '?test&start=1&instaluj=ios&seed=23');
    await g2.click('#instal'); await sleep(400);
    const k = await O(g2, () => { const r = document.querySelector('#instr .kart').getBoundingClientRect(), e = document.getElementById('instr'); return { kt: r.top, kb: r.bottom, vh: innerHeight, sh: e.scrollHeight, ch: e.clientHeight }; });
    chk(k.sh <= k.ch + 1 || k.kb <= k.vh, 'instrukcja iOS na 360x640: mieści się albo daje się przewinąć (' + k.kt.toFixed(0) + '..' + k.kb.toFixed(0) + ' z ' + k.vh + ')');
    await c2.close();
  }

  /* ---------- (g) instalowalność Chrome (CDP) i offline ---------- */
  console.log('(g) instalowalność: Page.getInstallabilityErrors na http://localhost');
  {
    /* zwykły (nie incognito) profil: Playwright domyślnie daje kontekst incognito, a Chrome zgłasza wtedy in-incognito */
    const prof = fs.mkdtempSync(path.join(require('os').tmpdir(), 'z20-prof-'));
    const ctx = await chromium.launchPersistentContext(prof, { headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'], viewport: { width: 390, height: 844 }, hasTouch: true });
    const g = ctx.pages()[0] || await ctx.newPage();
    g.on('pageerror', e => errors.push('pageerror: ' + e + ' @ instalowalnosc'));
    g.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text() + ' @ instalowalnosc'); });
    await g.goto(URL0); await g.waitForTimeout(500);
    await g.evaluate(() => navigator.serviceWorker.ready.then(() => 0)).catch(() => 0);
    await sleep(1500);
    const sesja = await ctx.newCDPSession(g);
    await sesja.send('Page.enable').catch(() => { });
    let err = null, mf = null;
    try { err = await sesja.send('Page.getInstallabilityErrors'); } catch (e) { bad('Page.getInstallabilityErrors: ' + e); }
    try { mf = await sesja.send('Page.getAppManifest'); } catch (e) { info('getAppManifest: ' + e); }
    if (err) { chk((err.installabilityErrors || []).length === 0, 'getInstallabilityErrors puste' + ((err.installabilityErrors || []).length ? ': ' + JSON.stringify(err.installabilityErrors) : '')); info('installabilityErrors = ' + JSON.stringify(err.installabilityErrors)); }
    if (mf) { chk(!(mf.errors || []).length, 'getAppManifest bez błędów parsowania' + ((mf.errors || []).length ? ': ' + JSON.stringify(mf.errors) : '')); info('manifest url: ' + mf.url + ', errors: ' + JSON.stringify(mf.errors || [])); }
    const sw = await g.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return { aktywny: !!(r && r.active), stan: r && r.active && r.active.state, ctrl: !!navigator.serviceWorker.controller }; });
    chk(sw.aktywny && sw.stan === 'activated', 'service worker aktywny na localhost (z obsługą fetch)');
    const pam = await g.evaluate(async () => { const k = await caches.keys(), c = k.length ? await (await caches.open(k[0])).keys() : []; return { k, pliki: c.map(r => new URL(r.url).pathname) }; });
    chk(pam.k.length === 1 && /^crumbi-\d+$/.test(pam.k[0]) && pam.pliki.includes('/ikona-512-maskable.png') && pam.pliki.includes('/manifest.webmanifest'), 'pamięć ' + pam.k.join(',') + ' zawiera ikonę maskable i manifest (' + pam.pliki.length + ' plików)');
    /* offline: bez sieci ikona maskable i strona z pamięci */
    await ctx.setOffline(true);
    const off = await g.evaluate(async () => { try { const r = await fetch('ikona-512-maskable.png'), b = await r.blob(); const r2 = await fetch('manifest.webmanifest'); return { ok: r.ok, rozm: b.size, man: r2.ok }; } catch (e) { return { err: String(e) }; } });
    chk(off.ok && off.rozm > 1000 && off.man, 'offline: ikona maskable i manifest z pamięci (' + (off.rozm || off.err) + ' B)');
    await ctx.setOffline(false);
    await ctx.close(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (_) { }
  }

  /* ---------- (h) konsola ---------- */
  console.log('(h) konsola');
  const ist = errors.filter(e => !/favicon|Failed to load resource: the server responded with a status of 404/.test(e));
  chk(ist.length === 0, 'brak błędów i ostrzeżeń konsoli (w tym naruszeń CSP) we wszystkich scenariuszach' + (ist.length ? ': ' + ist.slice(0, 4).join(' | ') : ''));

  await browser.close(); srv.close();
  console.log(fail ? ('WYNIK: ' + fail + ' porażek') : 'TEST Z20 OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('BŁĄD TESTU: ' + (e && e.stack || e)); process.exit(2); });
