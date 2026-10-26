/* QA runda 1, punkt A: user journey nowego gracza w czasie rzeczywistym, BEZ ?test (czysty profil), tryb ?tor=1.
   Użycie: node qa/qa_a_journey.cjs   (wynik: qa/wynik_a.json + zrzuty qa/zrzuty/A*.png) */
const { serwer, przegladarka, dotykCDP, sleep, zapiszJson, ZRZUTY, path } = require('./wspolne.cjs');
const PORT = 8731, BASE = 'http://127.0.0.1:' + PORT + '/';
const W = {};
const log = (k, v) => { W[k] = v; console.log(k, typeof v === 'object' ? JSON.stringify(v) : v); };

(async () => {
  const srv = await serwer(PORT);
  const br = await przegladarka();
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  const bledy = [];
  pg.on('pageerror', e => bledy.push('pageerror: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') bledy.push(m.type() + ': ' + m.text()); });
  const zr = async (n) => pg.screenshot({ path: path.join(ZRZUTY, n + '.png') });
  const dom = () => pg.evaluate(() => ({
    wynik: document.getElementById('wynik').classList.contains('pokaz'),
    ster: document.getElementById('ster').classList.contains('pokaz'),
    priv: document.getElementById('priv').classList.contains('pokaz'),
    intro: document.body.classList.contains('intro'),
    sterT: document.getElementById('ster-t').textContent, sterOk: document.getElementById('ster-ok').textContent,
    wynikTxt: document.getElementById('wynik').innerText.replace(/\s+/g, ' ').trim(),
    ls: (() => { try { return Object.keys(localStorage).map(k => k + '=' + (localStorage.getItem(k) || '').length + 'B'); } catch (e) { return 'brak'; } })()
  }));

  /* 1. wejście + intro */
  const t0 = Date.now();
  await pg.goto(BASE + '?tor=1', { waitUntil: 'load' });
  log('A_load_ms', Date.now() - t0);
  const nav = await pg.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), transfer: n.transferSize, zasoby: performance.getEntriesByType('resource').map(r => r.name.split('/').pop() + ':' + Math.round(r.duration) + 'ms') }; });
  log('A_nav', nav);
  const plan = [0.5, 1.6, 4.0, 6.6, 8.6, 10.2, 12.0];
  for (const s of plan) { const d = s * 1000 - (Date.now() - t0); if (d > 0) await sleep(d); await zr('A01-intro-' + s.toFixed(1) + 's'); }
  let st = await dom(); log('A_po_12s', st);
  /* czekaj na ekran startu */
  let tStart = null; for (let i = 0; i < 60; i++) { st = await dom(); if (st.ster) { tStart = (Date.now() - t0) / 1000; break; } await sleep(100); }
  log('A_ekran_startu_s', tStart);
  await sleep(700); await zr('A02-start-390');
  const startUi = await pg.evaluate(() => [...document.querySelectorAll('#ster button, #ster input, #sterb')].map(b => { const r = b.getBoundingClientRect(); return { id: b.id || b.className || b.tagName, txt: (b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.top), widoczny: r.width > 0 && getComputedStyle(b).visibility !== 'hidden' }; }));
  log('A_start_ui', startUi);
  const startScroll = await pg.evaluate(() => { const p = document.querySelector('#ster .pan'); return { scrollH: p.scrollHeight, clientH: p.clientHeight, top: Math.round(p.getBoundingClientRect().top), bottom: Math.round(p.getBoundingClientRect().bottom), vh: innerHeight }; });
  log('A_start_scroll', startScroll);

  /* 2. „Leć” i bierny lot (gracz nic nie robi) */
  const tLec = Date.now();
  await pg.tap('#ster-ok');
  const zrBierny = [1, 3, 6, 9, 12, 16, 20, 25, 30, 40, 50, 60];
  let koniecBierny = null;
  for (const s of zrBierny) {
    while ((Date.now() - tLec) < s * 1000) { st = await dom(); if (st.wynik && koniecBierny === null) koniecBierny = (Date.now() - tLec) / 1000; await sleep(100); }
    if (koniecBierny !== null && s > koniecBierny + 2) break;
    await zr('A03-bierny-' + String(s).padStart(2, '0') + 's');
  }
  if (koniecBierny === null) { for (let i = 0; i < 300; i++) { st = await dom(); if (st.wynik) { koniecBierny = (Date.now() - tLec) / 1000; break; } await sleep(100); } }
  log('A_bierny_koniec_s', koniecBierny);
  await sleep(1200); await zr('A04-koniec-bierny'); st = await dom(); log('A_koniec_tekst', st.wynikTxt); log('A_ls_po_biegu', st.ls);
  const koniecUi = await pg.evaluate(() => { const b = document.getElementById('jeszcze').getBoundingClientRect(); const k = document.querySelector('#wynik .karta').getBoundingClientRect(); return { jeszcze: { w: Math.round(b.width), h: Math.round(b.height), y: Math.round(b.top) }, karta: { top: Math.round(k.top), bottom: Math.round(k.bottom) }, fokus: document.activeElement && document.activeElement.id, aria: document.getElementById('wynik').getAttribute('aria-label') }; });
  log('A_koniec_ui', koniecUi);

  /* 3. „Jeszcze raz”: czas do zniknięcia ekranu końca i do pierwszej zmiany obrazu */
  const tJ = Date.now();
  await pg.tap('#jeszcze');
  let tJz = null; for (let i = 0; i < 100; i++) { st = await dom(); if (!st.wynik) { tJz = Date.now() - tJ; break; } await sleep(10); }
  log('A_jeszcze_raz_ms_do_ukrycia_ekranu', tJz);

  /* 4. naiwny gracz: stuka w środek co 0,7 s (nie wie, co robić) przez 60 s */
  const tN = Date.now(); let koniecNaiwny = null, stukow = 0;
  while (Date.now() - tN < 60000) {
    await pg.touchscreen.tap(195, 560); stukow++;
    await sleep(700);
    const e = (Date.now() - tN) / 1000;
    if ([10, 30, 59].some(x => Math.abs(e - x) < 0.4)) await zr('A05-naiwny-stuka-' + Math.round(e) + 's');
    st = await dom(); if (st.wynik) { koniecNaiwny = e; break; }
  }
  log('A_naiwny_stuka', { koniec_s: koniecNaiwny, stukow });
  if (st.wynik) { await zr('A06-koniec-naiwny'); await pg.tap('#jeszcze'); }

  /* 5. pauza: Escape, zrzut; czy widać, że gra stoi? wznowienie dotykiem */
  await sleep(1500);
  await pg.keyboard.press('Escape'); await sleep(600); await zr('A07-pauza-esc');
  const pz1 = await pg.screenshot(); await sleep(1000); const pz2 = await pg.screenshot();
  log('A_pauza_obraz_stoi', Buffer.compare(pz1, pz2) === 0);
  await pg.touchscreen.tap(195, 500); await sleep(400);
  const pz3 = await pg.screenshot(); await sleep(300); const pz4 = await pg.screenshot();
  log('A_po_dotyku_wznowiona', Buffer.compare(pz3, pz4) !== 0);
  /* pauza przyciskiem „sterowanie” */
  await pg.tap('#sterb'); await sleep(500); await zr('A08-panel-w-locie'); st = await dom(); log('A_panel_w_locie', { ster: st.ster, tytul: st.sterT, ok: st.sterOk });
  await pg.tap('#ster-ok'); await sleep(300);

  /* 6. przeładowanie strony: intro pominięte? */
  const tR = Date.now(); await pg.reload({ waitUntil: 'load' }); await sleep(800);
  st = await dom(); log('A_reload', { ms: Date.now() - tR, intro: st.intro, ster: st.ster, tytul: st.sterT, ls: st.ls }); await zr('A09-po-przeladowaniu');

  /* 7. prywatność i „Usuń zapis” */
  await pg.tap('#ster-priv'); await sleep(500); await zr('A10-prywatnosc');
  const privUi = await pg.evaluate(() => [...document.querySelectorAll('#priv button, #priv a')].map(b => { const r = b.getBoundingClientRect(); return { id: b.id || b.tagName, w: Math.round(r.width), h: Math.round(r.height) }; }));
  log('A_priv_ui', privUi);
  await pg.evaluate(() => { const p = document.getElementById('priv'); p.scrollTop = p.scrollHeight; const q = document.querySelector('#priv .pan'); if (q) q.scrollTop = q.scrollHeight; });
  await sleep(300); await zr('A11-prywatnosc-dol');
  await pg.tap('#priv-usun'); await sleep(300); await zr('A12-usun-pytanie');
  await pg.tap('#priv-tak'); await sleep(800); st = await dom(); log('A_po_usun', { ls: st.ls, intro: st.intro, priv: st.priv, ster: st.ster }); await zr('A13-po-usun');

  /* 8. offline / PWA: service worker, manifest, przeładowanie bez sieci */
  await sleep(1500);
  const sw = await pg.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); const keys = await caches.keys(); let pliki = []; for (const k of keys) { const c = await caches.open(k); pliki = pliki.concat((await c.keys()).map(q => q.url.split('/').pop() || '/')); } return { rej: !!r, aktywny: !!(r && r.active), kontroler: !!navigator.serviceWorker.controller, cache: keys, pliki, manifest: !!document.querySelector('link[rel=manifest]') }; });
  log('A_sw', sw);
  await ctx.setOffline(true);
  let offline = 'ok';
  try { await pg.reload({ waitUntil: 'load', timeout: 15000 }); await sleep(1500); await zr('A14-offline'); offline = await pg.evaluate(() => ({ tytul: document.title, canvas: !!document.getElementById('g'), teksty: !!window.OKRUSZEK_TEKSTY })); } catch (e) { offline = 'BLAD ' + e.message.slice(0, 120); }
  log('A_offline', offline);
  await ctx.setOffline(false);

  log('A_bledy_konsoli', bledy);
  zapiszJson('wynik_a.json', W);
  await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
