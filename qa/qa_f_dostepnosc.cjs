/* QA runda 1, punkt F: dostępność. Cele dotyku >= 44 px, kontrast tekstów DOM, aria (canvas, przyciski, dialogi), czytnik ekranu na końcu biegu,
   gra samą klawiaturą od wejścia (bez ?test), prefers-reduced-motion (drgania, błysk), migotanie burzy (błyski na sekundę), zapowiedź drapieżnika bez dźwięku.
   Wynik: qa/wynik_f.json */
const { serwer, przegladarka, sleep, zapiszJson, ZRZUTY, path } = require('./wspolne.cjs');
(async () => {
  const srv = await serwer(8740); const br = await przegladarka();
  const F = {};
  /* 1. klawiatura od zera (czysty profil, bez ?test) */
  {
    const ctx = await br.newContext({ viewport: { width: 1440, height: 900 } });
    const pg = await ctx.newPage(); await pg.goto('http://127.0.0.1:8740/?tor=1'); await sleep(2500);
    await pg.keyboard.press('x'); await sleep(1500);
    const kroki = [];
    const fok = async () => pg.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.className || a.tagName) + ' "' + (a.innerText || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').slice(0, 30) + '"' : null; });
    kroki.push('po pominięciu wstępu fokus: ' + await fok());
    for (let i = 0; i < 9; i++) { await pg.keyboard.press('Tab'); kroki.push('Tab ' + (i + 1) + ': ' + await fok()); }
    const widocznyFokus = await pg.evaluate(() => { const a = document.activeElement; if (!a) return null; const s = getComputedStyle(a); return { outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, boxShadow: s.boxShadow.slice(0, 60) }; });
    await pg.evaluate(() => document.getElementById('ster-ok').focus()); await pg.keyboard.press('Enter'); await sleep(800);
    const st1 = await pg.evaluate(() => ({ ster: document.getElementById('ster').classList.contains('pokaz') }));
    /* lot klawiaturą 20 s: strzałka w górę co 0,6 s, czasem w bok */
    for (let i = 0; i < 34; i++) { await pg.keyboard.press(i % 9 === 4 ? 'ArrowLeft' : (i % 9 === 8 ? 'ArrowRight' : 'ArrowUp')); await sleep(600); }
    const st2 = await pg.evaluate(() => ({ wynik: document.getElementById('wynik').classList.contains('pokaz') }));
    await pg.keyboard.press('p'); await sleep(400); await pg.screenshot({ path: path.join(ZRZUTY, 'F1-pauza-klawisz-1440.png') }); await pg.keyboard.press('p'); await sleep(300);
    /* do końca biegu: nic nie rób */
    let kon = false; for (let i = 0; i < 80 && !kon; i++) { await sleep(500); kon = await pg.evaluate(() => document.getElementById('wynik').classList.contains('pokaz')); }
    await sleep(900);
    const k = await pg.evaluate(() => ({ fokus: document.activeElement && document.activeElement.id, aria: document.getElementById('wynik').getAttribute('aria-label'), role: document.getElementById('wynik').getAttribute('role'), modal: document.getElementById('wynik').getAttribute('aria-modal') }));
    await pg.keyboard.press('Enter'); await sleep(300);
    const st3 = await pg.evaluate(() => ({ wynik: document.getElementById('wynik').classList.contains('pokaz') }));
    F.klawiatura = { kroki, widocznyFokus, startLec: !st1.ster, po20sLotuZyje: !st2.wynik, koniec: k, enterJeszczeRaz: !st3.wynik };
    console.log('klawiatura', JSON.stringify(F.klawiatura));
    /* cele dotyku i aria w DOM */
    const dom = await pg.evaluate(() => {
      const out = { male: [], bezEtykiety: [], canvas: null, live: [] };
      document.querySelectorAll('button, a, input, [role=button]').forEach(b => { const r = b.getBoundingClientRect(); const nazwa = (b.getAttribute('aria-label') || b.innerText || b.title || '').trim(); const ukryty = b.closest('[aria-hidden=true]') !== null; if (!nazwa) out.bezEtykiety.push(b.id || b.className); out.male.push({ id: b.id || b.className || b.tagName, w: Math.round(r.width), h: Math.round(r.height), ukryty }); });
      out.male = out.male.filter(x => (x.w && x.w < 44) || (x.h && x.h < 44));
      const c = document.getElementById('g'); out.canvas = { role: c.getAttribute('role'), aria: (c.getAttribute('aria-label') || '').slice(0, 120), tabindex: c.getAttribute('tabindex') };
      document.querySelectorAll('[aria-live], [role=status]').forEach(e => out.live.push(e.id || e.className));
      return out;
    });
    F.dom = dom; console.log('dom', JSON.stringify(dom));
    await ctx.close();
  }
  /* 2. kontrast tekstów DOM w panelach (kolor tekstu wobec tła panelu) */
  {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage(); await pg.goto('http://127.0.0.1:8740/?test&tor=1&start'); await sleep(1000);
    F.kontrastPanel = await pg.evaluate(() => {
      const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      const parse = (s) => { const m = s.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
      const L = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
      const tlo = (el) => { let e = el; while (e) { const c = parse(getComputedStyle(e).backgroundColor); if (c.a > 0.5) return c; e = e.parentElement; } return { r: 20, g: 26, b: 50, a: 1 }; };
      const out = [];
      document.querySelectorAll('#ster h2, #ster .pod, #ster .tryb .op, #ster .tryb b, #ster label, #ster .st, #ster kbd, #ster-priv, #ster-ok').forEach(e => { if (!e.getBoundingClientRect().width) return; const s = getComputedStyle(e); let c = parse(s.color); const op = parseFloat(s.opacity) * (e.parentElement ? parseFloat(getComputedStyle(e.parentElement).opacity) : 1); const b = tlo(e); const a = c.a * op; c = { r: c.r * a + b.r * (1 - a), g: c.g * a + b.g * (1 - a), b: c.b * a + b.b * (1 - a) }; const l1 = L(c), l2 = L(b); out.push({ el: e.id || e.className || e.tagName, txt: (e.innerText || '').slice(0, 20), px: s.fontSize, kontrast: +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2) }); });
      return out;
    });
    console.log('kontrastPanel', JSON.stringify(F.kontrastPanel));
    await ctx.close();
  }
  /* 3. migotanie: burza (błysk po trafieniu) i wejście w L5; zliczanie błysków na sekundę z jasności klatek (zwykły ruch i reduced-motion) */
  for (const rm of ['no-preference', 'reduce']) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: rm });
    const pg = await ctx.newPage(); await pg.goto('http://127.0.0.1:8740/?test&tor=1&seed=4'); await sleep(1000);
    const r = await pg.evaluate(async () => {
      const O = window.__okruszek, c = document.getElementById('g'), t = document.createElement('canvas'); t.width = 60; t.height = 120; const x = t.getContext('2d', { willReadFrequently: true });
      const jas = () => { x.drawImage(c, 0, 0, 60, 120); const d = x.getImageData(0, 0, 60, 120).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; return s / (d.length / 4); };
      O.pauza(false); O.panel(false); O.ziarno(4); O.brama(6); O.odblokuj(); O.bezPrzeszkod(true); O.bezPradow(true); O.ustawPore('noc'); O.ustawPoziom(2); O.idz(1, 1, true);
      /* seria burz w komórce Okruszka co 0,25 s przez 4 s */
      const sp = O.tor().sp; let n = 0; const iv = setInterval(() => { O.zdarzenie('burza', { k: 1, w: 1, z: 0.7 + sp * 0.3 }); n++; }, 250);
      const L = []; const t0 = performance.now();
      await new Promise(res => { const f = () => { L.push({ t: performance.now() - t0, j: jas() }); if (performance.now() - t0 < 4500) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
      clearInterval(iv);
      /* błysk = wzrost jasności o > 20 względem mediany poprzednich 10 klatek */
      let bl = [], ost = -1e9; for (let i = 10; i < L.length; i++) { const m = L.slice(i - 10, i).map(q => q.j).sort((a, b) => a - b)[5]; if (L[i].j - m > 20 && L[i].t - ost > 120) { bl.push(Math.round(L[i].t)); ost = L[i].t; } }
      const naS = {}; bl.forEach(tt => { const s = Math.floor(tt / 1000); naS[s] = (naS[s] || 0) + 1; });
      const kar = O.torLog().kontakty.filter(e => e.znak === 'B').length;
      /* hiper: wymuszenie L5 i wyjście, liczenie błysków */
      O.bezPrzeszkod(true); O.ustawPore('dzien'); O.ustawPoziom(4); await new Promise(r => setTimeout(r, 600));
      const L2 = []; const t1 = performance.now(); O.ustawPoziom(5);
      await new Promise(res => { const f = () => { L2.push({ t: performance.now() - t1, j: jas() }); if (performance.now() - t1 < 3000) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
      let bl2 = 0, ost2 = -1e9; for (let i = 10; i < L2.length; i++) { const m = L2.slice(i - 10, i).map(q => q.j).sort((a, b) => a - b)[5]; if (L2[i].j - m > 20 && L2[i].t - ost2 > 120) { bl2++; ost2 = L2[i].t; } }
      const zakres = (A) => [Math.round(Math.min(...A.map(q => q.j))), Math.round(Math.max(...A.map(q => q.j)))];
      return { burzWymuszonych: n, trafienBurzy: kar, blyskow: bl.length, blyskiNaSekunde: naS, maxNaSekunde: Math.max(0, ...Object.values(naS)), klatek: L.length, jasnoscZakres: zakres(L), hiperBlyskow3s: bl2, hiperJasnosc: zakres(L2) };
    });
    F['migotanie_' + rm] = r; console.log('migotanie', rm, JSON.stringify(r));
    /* drżenie kamery (wir, samolot): przesunięcie obrazu przy reduced-motion */
    const sh = await pg.evaluate(async () => { const O = window.__okruszek; O.bezPrzeszkod(true); O.ustawPoziom(1); O.idz(1, 1, true); const sp = O.tor().sp; O.zdarzenie('samolot', { k: 1, w: 1, z: 0.7 + sp * 0.3 }); await new Promise(r => setTimeout(r, 700)); return O.z11().drzenie; });
    F['drzenie_' + rm] = sh;
    await ctx.close();
  }
  /* 4. zapowiedź drapieżnika: zrzut w fazie zapowiedzi (bez dźwięku) i w chwili zaznaczenia komórki */
  {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
    const pg = await ctx.newPage(); await pg.goto('http://127.0.0.1:8740/?test&tor=1&seed=4'); await sleep(1000);
    for (const [pora, kto] of [['dzien', 'jastrzab'], ['noc', 'sowa']]) {
      await pg.evaluate(([pora, kto]) => { const O = window.__okruszek; O.tempo(1); O.pauza(false); O.panel(false); O.brama(4); O.odblokuj(); O.bezPrzeszkod(true); O.bezPradow(true); O.ustawPore(pora); O.ustawPoziom(1); O.idz(1, 1, true); O.zdarzenie(kto); }, [pora, kto]);
      await sleep(1200); await pg.screenshot({ path: path.join(ZRZUTY, 'F2-' + kto + '-zapowiedz.png') });
      let ok = false; for (let i = 0; i < 40 && !ok; i++) { await sleep(100); ok = await pg.evaluate(() => { const h = window.__okruszek.stan().jastrzab; return !!(h && h.faza === 'poscig' && window.__okruszek.torLog().ataki.length && window.__okruszek.torLog().ataki.slice(-1)[0].wynik === null); }); }
      await sleep(700); await pg.screenshot({ path: path.join(ZRZUTY, 'F3-' + kto + '-atak-komorka.png') });
      F['drapieznik_' + kto] = await pg.evaluate(() => ({ stan: window.__okruszek.stan().jastrzab, ataki: window.__okruszek.torLog().ataki.slice(-2) }));
    }
    await ctx.close();
  }
  zapiszJson('wynik_f.json', F);
  await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
