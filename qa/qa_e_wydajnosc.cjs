/* QA runda 1, punkt E: wydajność i stabilność. fps i czas pracy klatki (headless, CPU x1 / x4 / x6) w L0 dzień, L5 noc, przy wielu przeszkodach;
   pamięć sprite'ów i sterty; długi bieg 10 min czasu gry (tempo 4, stukanie): trend czasu klatki i sterty; zimne ładowanie z ograniczeniem CPU;
   żywa strona: błędy konsoli, CSP, nagłówki. Wynik: qa/wynik_e.json */
const { serwer, przegladarka, sleep, zapiszJson, ROOT, fs, path } = require('./wspolne.cjs');
const TYLKO_FPS = process.argv[2] === 'tylkofps';   /* powtórka samego pomiaru fps bez innych procesów w tle */
const LIVE = process.argv[2] !== 'bezlive' && !TYLKO_FPS;
(async () => {
  const srv = await serwer(8739); const br = await przegladarka();
  const E = { pliki: {}, fps: {}, zimny: {}, dlugi: [], live: null };
  for (const f of ['index.html', 'teksty.js', 'dzwiek.js', 'sw.js', 'manifest.webmanifest', 'ikona-192.png', 'ikona-512.png', 'ikona-180.png']) E.pliki[f] = fs.statSync(path.join(ROOT, f)).size;
  const zlib = require('zlib'); E.pliki.index_gzip = zlib.gzipSync(fs.readFileSync(path.join(ROOT, 'index.html'))).length; E.pliki.index_brotli = zlib.brotliCompressSync(fs.readFileSync(path.join(ROOT, 'index.html'))).length;
  console.log('pliki', JSON.stringify(E.pliki));
  /* zimne ładowanie: czas do load i do pierwszej klatki gry, CPU x1/x4/x6 (bez ?test: z wstępem) */
  for (const cpu of (TYLKO_FPS ? [] : [1, 4, 6])) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage(); const cdp = await ctx.newCDPSession(pg);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
    await pg.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push(Math.round(e.duration)))).observe({ type: 'longtask', buffered: true }); } catch (e) { } const raf = window.requestAnimationFrame; let n = 0; window.__f = []; window.requestAnimationFrame = function (cb) { return raf.call(window, function (t) { if (n < 120) { window.__f.push(Math.round(performance.now())); n++; } cb(t); }); }; });
    const t0 = Date.now(); await pg.goto('http://127.0.0.1:8739/?tor=1', { waitUntil: 'load' }); const tl = Date.now() - t0; await sleep(3000);
    const r = await pg.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const f = window.__f; let maxGap = 0; for (let i = 1; i < f.length; i++) maxGap = Math.max(maxGap, f[i] - f[i - 1]); return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), pierwszaKlatka: f[0], maxPrzerwaPierwsze120: maxGap, longtasks: window.__lt.slice(0, 12), heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null }; });
    E.zimny['cpu' + cpu] = { goto_ms: tl, ...r }; console.log('zimny cpu' + cpu, JSON.stringify(E.zimny['cpu' + cpu]));
    await ctx.close();
  }
  /* fps i czas pracy klatki w scenach */
  for (const cpu of [1, 4, 6]) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage(); const bl = []; pg.on('pageerror', e => bl.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') bl.push(m.text()); });
    await pg.goto('http://127.0.0.1:8739/?test&tor=1&seed=8'); await sleep(1200);
    const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
    const sceny = { 'L0-dzien': { L: 0, pora: 'dzien', duzo: false }, 'L5-noc': { L: 5, pora: 'noc', duzo: false }, 'L3-zachod-duzo': { L: 3, pora: 'zachod', duzo: true }, 'L5-dzien-duzo': { L: 5, pora: 'dzien', duzo: true } };
    for (const [nm, s] of Object.entries(sceny)) {
      await pg.evaluate((s) => { const O = window.__okruszek; O.tempo(1); O.pauza(false); O.panel(false); O.ziarno(3); O.brama(6); O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false); O.ustawPore(s.pora); O.ustawPoziom(s.L); O.idz(1, 0, true);
        window.__st = setInterval(() => { O.stuknij(0); }, 600);
        if (s.duzo) { window.__dz = setInterval(() => { const T = ['chmura:szara', 'burza', 'tornado', 'samolot', 'ptak', 'szpile', 'latawiec', 'ufo', 'chmura:lawenda', 'grad']; for (let i = 0; i < 4; i++) O.zdarzenie(T[(Math.random() * T.length) | 0], { k: (Math.random() * 3) | 0, w: 1 + ((Math.random() * 2) | 0), z: 1.5 + Math.random() * 3.5 }); O.zdarzenie('przelot'); }, 700); }
      }, s);
      await sleep(2500); await pg.evaluate(() => { window.__okruszek.zerujFps(); window.__okruszek.zerujCpu && window.__okruszek.zerujCpu(); window.__okruszek.zerujKurtyne(); });
      await sleep(8000);
      const r = await pg.evaluate(() => { const O = window.__okruszek; clearInterval(window.__st); clearInterval(window.__dz); return { fps: O.fps(), praca: O.pracaKlatki(true), cpu: O.cpu(), sprite: O.pamiec(), heapMB: Math.round(performance.memory.usedJSHeapSize / 1048576), plastrow: O.tor().plastrow, budzet: O.budzet().teraz }; });
      E.fps['cpu' + cpu + '-' + nm] = r; console.log('fps cpu' + cpu, nm, JSON.stringify(r));
    }
    E.fps['cpu' + cpu + '-bledy'] = bl;
    await ctx.close();
  }
  /* długi bieg: 10 min czasu gry (tempo 4), stukacz utrzymuje lot; co 30 s czasu gry: praca klatki, sterta, liczba plastrów i obiektów */
  if (!TYLKO_FPS) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage(); const bl = []; pg.on('pageerror', e => bl.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') bl.push(m.text()); });
    await pg.goto('http://127.0.0.1:8739/?test&tor=1&seed=12'); await sleep(1200);
    await pg.evaluate(() => { const O = window.__okruszek; O.panel(false); O.ziarno(12); O.brama(1); O.odblokuj(); O.tempo(4); O.pauza(false); window.__st = setInterval(() => { const st = O.stan(); if (st.tryb === 'koniec') { O.panel(false); O.nowyBieg(); window.__konce = (window.__konce || 0) + 1; } else O.stuknij(0); }, 160); });
    const t0 = Date.now(); let ost = 0;
    while (Date.now() - t0 < 175000) {
      await sleep(7500);
      const r = await pg.evaluate(() => { const O = window.__okruszek, st = O.stan(); const p = O.pracaKlatki(true); O.zerujKurtyne(); return { gra: Math.round(st.graCzas), m: Math.round(st.dystans), praca: p.avg, p95: p.p95, heapMB: Math.round(performance.memory.usedJSHeapSize / 1048576), sprite: O.pamiec().MB, plastrow: O.tor().plastrow, kolejka: O.tor().kolejka, przeszkod: st.przeszkod, konce: window.__konce || 0, kraina: O.kraina().kraina, fps: O.fps().avg }; });
      E.dlugi.push(r); console.log('dlugi', JSON.stringify(r)); ost = r.gra; if (ost > 620) break;
    }
    E.dlugiBledy = bl; await ctx.close();
  }
  /* żywa strona */
  if (LIVE) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage(); const log = [];
    pg.on('pageerror', e => log.push('pageerror: ' + e.message)); pg.on('console', m => log.push(m.type() + ': ' + m.text()));
    await pg.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', e => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI)); });
    const t0 = Date.now(); let resp = null;
    try { resp = await pg.goto('https://zbudujmi.com/crumbi/?tor=1', { waitUntil: 'load', timeout: 30000 }); } catch (e) { log.push('goto: ' + e.message); }
    const tl = Date.now() - t0; await sleep(16000);
    await pg.touchscreen.tap(195, 400).catch(() => { }); await sleep(800);
    await pg.evaluate(() => { const b = document.getElementById('ster-ok'); if (b && document.getElementById('ster').classList.contains('pokaz')) b.click(); }).catch(() => { });
    await sleep(15000);
    const naglowki = resp ? resp.headers() : {};
    const csp = await pg.evaluate(() => window.__csp).catch(() => 'brak');
    const meta = await pg.evaluate(() => ({ robots: (document.querySelector('meta[name=robots]') || {}).content || null, csp: (document.querySelector('meta[http-equiv="Content-Security-Policy"]') || {}).content || null, title: document.title })).catch(() => null);
    const zas = await pg.evaluate(() => performance.getEntriesByType('resource').map(r => ({ n: r.name.split('/').pop(), kB: Math.round(r.transferSize / 1024), ms: Math.round(r.duration) }))).catch(() => []);
    const nav = await pg.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { kB: Math.round(n.transferSize / 1024), enc: n.encodedBodySize, dec: n.decodedBodySize, load: Math.round(n.loadEventEnd), ttfb: Math.round(n.responseStart) }; }).catch(() => null);
    E.live = { status: resp && resp.status(), goto_ms: tl, naglowki: { 'content-security-policy': naglowki['content-security-policy'] || null, 'x-robots-tag': naglowki['x-robots-tag'] || null, 'content-encoding': naglowki['content-encoding'] || null, 'cache-control': naglowki['cache-control'] || null, server: naglowki['server'] || null }, meta, nav, zasoby: zas, csp, konsola: log.filter(l => !/^(log|info|debug)/.test(l)).slice(0, 20) };
    console.log('live', JSON.stringify(E.live).slice(0, 1500));
    await pg.screenshot({ path: path.join(__dirname, 'zrzuty', 'E-live.png') });
    await ctx.close();
  }
  zapiszJson(TYLKO_FPS ? 'wynik_e_fps.json' : 'wynik_e.json', E);
  await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
