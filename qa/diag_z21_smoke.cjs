/* Z21: szybki przegląd po edycji: błędy konsoli, przewrót (klatki), drogi, zrzuty do obejrzenia. Użycie: node qa/diag_z21_smoke.cjs */
const { chromium, CHROME, path, fs } = require('./wspolne.cjs');
const file = path.resolve(__dirname, '..', 'index.html');
const dir = path.join(__dirname, '..', 'zrzuty-z21'); fs.mkdirSync(dir, { recursive: true });
(async () => {
  const br = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const errors = [];
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errors.push('pageerror: ' + (e.stack || e))); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  await ctx.addInitScript(() => { try { localStorage.setItem('okruszek.zapis', JSON.stringify({ v: 1, bramy: [1], najdalej: 0, najdluzszy: 0, krainy: {}, krotkie: 0, dzien: { d: '', n: 0 }, intro: 1, naukaTor: 1, drogi: 1, dz: { m: 1, e: 1, v: 1 } })); } catch (_) { } });
  await pg.goto('file:///' + file.replace(/\\/g, '/') + '?test&tor=1&seed=23'); await pg.waitForFunction(() => !!window.__okruszek);
  const reset = (pora, L) => pg.evaluate(([pora, L]) => { const O = __okruszek; O.panel(false); O.pauza(true); O.bezPradow(true); O.bezPrzeszkod(true); O.ziarno(23); O.brama(1); O.odblokuj(); O.nowyBieg(); O.tempo(1); O.ustawPore(pora); O.ustawPoziom(L); O.torSymuluj(0.1); O.idz(1, 1, true); O.kadr19(); }, [pora, L]);
  const st = await pg.evaluate(() => { const O = __okruszek; return { drogi: O.drogi(), p: O.przewrotStan(), u: O.unoszenie() }; });
  console.log('stan:', JSON.stringify({ drogi: st.drogi, gotowy: st.p.gotowy, stale: st.p.stale, un: st.u.stale }));
  for (const [pora, L] of [['dzien', 0], ['dzien', 2], ['noc', 0], ['noc', 4]]) {
    await reset(pora, L);
    await pg.screenshot({ path: path.join(dir, 'smoke-drogi-' + pora + '-L' + L + '.png'), clip: { x: 0, y: 280, width: 390, height: 420 } });
  }
  /* przewrót w prawo: 6 klatek */
  await reset('dzien', 2);
  const kl = await pg.evaluate(() => { const O = __okruszek; const out = []; const r = O.przewrot('prawo'); out.push({ ok: r.ok, t: r.stan.t }); for (let i = 0; i < 24; i++) { O.torSymuluj(1 / 60); O.kadr19(1 / 60); const s = O.przewrotStan(); out.push({ t: s.t, unik: s.unik, dir: s.dir, kol: O.komorka().kol, E: s.E }); } return out; });
  console.log('przewrot:', JSON.stringify(kl.slice(0, 4)), '...', JSON.stringify(kl.slice(-2)));
  for (const str of ['prawo', 'lewo']) for (let i = 0; i < 6; i++) {
    await reset('dzien', 2);
    const pe = await pg.evaluate(([i, str]) => { const O = __okruszek; O.przewrot(str); const n = Math.round(i * 0.35 / 5 / (1 / 60)); for (let k = 0; k < n; k++) O.torSymuluj(1 / 60); O.kadr19(1 / 60); return O.ptakEkran(); }, [i, str]);
    await pg.screenshot({ path: path.join(dir, 'smoke-przewrot-' + str + '-' + i + '.png'), clip: { x: Math.max(0, pe.x - 100), y: pe.y - 130, width: 200, height: 260 } });
  }
  const dz = await pg.evaluate(() => { const O = __okruszek; O.idz(1, 1, true); const ys = []; for (let i = 0; i < 300; i++) { O.torSymuluj(1 / 60); O.kadr19(1 / 60); ys.push(Math.round(O.unoszenie().ekranY * 10) / 10); } return ys; });
  console.log('unoszenie y (co 20 klatek):', dz.filter((_, i) => i % 20 === 0).join(' '));
  console.log('errors:', errors.length, errors.slice(0, 5));
  await br.close();
})().catch(e => { console.error(e); process.exit(2); });
