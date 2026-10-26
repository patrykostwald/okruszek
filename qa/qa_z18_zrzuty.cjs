/* Z18: zrzuty 390 x 844 kluczowych poprawek (katalog zrzuty-z18): wiatry i przeszkody przed kontaktem, HUD w dzień / noc / o świcie, nazwa L0, panele, wstęp, pauza.
   Użycie: node qa/qa_z18_zrzuty.cjs [katalog=zrzuty-z18] [port=8795] [prefiks=] */
const { serwer, przegladarka, sleep, path, fs } = require('./wspolne.cjs');
const DIR = path.resolve(process.argv[2] || 'zrzuty-z18'), PORT = +(process.argv[3] || 8795), PRE = process.argv[4] || '';
fs.mkdirSync(DIR, { recursive: true });
(async () => {
  const srv = await serwer(PORT); const br = await przegladarka();
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage(); const bledy = []; pg.on('pageerror', e => bledy.push(e.message));
  await pg.goto('http://127.0.0.1:' + PORT + '/?test&tor=1&seed=5'); await sleep(900);
  await pg.evaluate(() => { const O = window.__okruszek; O.z11Zbuduj(); O.torSprite(); });
  const zrzut = async (nazwa) => { await pg.screenshot({ path: path.join(DIR, PRE + nazwa + '.png') }); };
  const zamroz = async () => { await pg.evaluate(() => { const O = window.__okruszek; O.tempo(0.001); O.pauza(false); }); await sleep(300); };
  /* 1. wiatry i przeszkody w drodze, 1,5 s i 0,6 s przed kontaktem (dzień L0) */
  for (const eta of [1.5, 0.6]) {
    await pg.evaluate((eta) => { const O = window.__okruszek; O.tempo(1); O.pauza(true); O.panel(false); O.ziarno(5); O.brama(1); O.odblokuj(); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.ustawPore('dzien'); O.ustawPoziom(0); O.idz(1, 1, true); O.torSymuluj(0.6); O.idz(1, 1, true);
      const sp = O.tor().sp, z = 0.7 + sp * eta; O.zdarzenie('chmura:szara', { k: 1, w: 1, z }); O.zdarzenie('wiatr:gora', { k: 0, w: 2, z: z + 0.002 }); O.zdarzenie('wiatr:prawo', { k: 2, w: 0, z: z + 0.004 }); O.zdarzenie('chmura:lawenda', { k: 2, w: 2, z: z + 0.006 }); }, eta);
    await zamroz(); await zrzut('tor-dzien-L0-eta' + eta);
  }
  /* 2. HUD i nazwa poziomu: dzień L0 (Mgiełka), świt L1, dzień L2, zachód L3, noc L0, noc L4; scena po 30 s lotu */
  for (const [pora, L] of [['dzien', 0], ['swit', 1], ['dzien', 2], ['zachod', 3], ['noc', 0], ['noc', 4]]) {
    await pg.evaluate(([pora, L]) => { const O = window.__okruszek; O.tempo(1); O.pauza(true); O.panel(false); O.ziarno(77); O.brama(3); O.odblokuj(); O.bezPrzeszkod(false); O.bezPradow(false); O.nowyBieg();
      let n = 0; O.torSymuluj(30, (A) => (A.kom.wiersz >= 2 || A.kom.p > 0.5) && A.t - (n || -9) > 0.25 ? (n = A.t, { stuk: 0 }) : {}, 1 / 60); O.ustawPore(pora); O.ustawPoziom(L); }, [pora, L]);
    await zamroz(); await zrzut('hud-' + pora + '-L' + L);
  }
  /* 3. panel startu (jasny), pauza, ekran końca */
  await pg.evaluate(() => { const O = window.__okruszek; O.tempo(1); O.ustawPore('dzien'); O.ustawPoziom(0); O.panel(true); }); await sleep(500); await zrzut('panel-start');
  await pg.evaluate(() => { const O = window.__okruszek; O.panel(false); O.pauza(true); }); await sleep(400); await zrzut('pauza');
  await pg.evaluate(() => { const O = window.__okruszek; O.pauza(false); O.odblokuj(); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.tempo(1); O.torSymuluj(40); }); await sleep(2200); await zrzut('koniec');
  /* 4. wstęp (świeża karta, bez ?test, czysty zapis) */
  const c2 = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p2 = await c2.newPage(); await p2.goto('http://127.0.0.1:' + PORT + '/?tor=1'); await sleep(4300); await p2.screenshot({ path: path.join(DIR, PRE + 'wstep-4s.png') }); await c2.close();
  /* 5. 360 x 640: panel z opisami trybów */
  const c3 = await br.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p3 = await c3.newPage(); await p3.goto('http://127.0.0.1:' + PORT + '/?test&tor=1&seed=5'); await sleep(900); await p3.evaluate(() => window.__okruszek.panel(true)); await sleep(500);
  const op = await p3.evaluate(() => [...document.querySelectorAll('#ster .tryb .op')].map(e => ({ tekst: e.textContent, wys: e.scrollHeight, widoczna: e.clientHeight })));
  await p3.screenshot({ path: path.join(DIR, PRE + 'panel-360x640.png') }); await c3.close();
  console.log('opisy trybów 360 px:', JSON.stringify(op.map(o => [o.wys, o.widoczna, o.wys <= o.widoczna ? 'cały' : 'UCIĘTY'])));
  console.log('błędy strony:', bledy.length ? bledy.slice(0, 3) : 0);
  await br.close(); srv.close();
})().catch(e => { console.error('BLAD', e); process.exit(1); });
