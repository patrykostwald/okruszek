const { serwer, przegladarka, dotykCDP, sleep } = require('./wspolne.cjs');
(async () => {
  const srv = await serwer(8793); const br = await przegladarka();
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage(); await pg.goto('http://127.0.0.1:8793/?test&tor=1&seed=5'); await sleep(900);
  const cdp = await ctx.newCDPSession(pg); const T = dotykCDP(cdp);
  await pg.evaluate(() => { const O = window.__okruszek; O.panel(false); O.sterowanie(2); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.idz(1, 1, true); window.__ev = []; ['pointerdown', 'pointerup', 'pointercancel'].forEach(t => window.addEventListener(t, e => window.__ev.push([t, e.pointerId, Math.round(e.timeStamp), e.isPrimary]), true)); });
  for (const gap of [30, 120, 150]) {
    await pg.evaluate(() => { const O = window.__okruszek; O.nowyBieg(); O.idz(1, 1, true); window.__ev = []; });
    await T('touchStart', [[1, 80, 700]]); await sleep(gap); await T('touchStart', [[1, 80, 700], [2, 310, 700]]); await sleep(40); await T('touchEnd', []); await sleep(250);
    const r = await pg.evaluate(() => ({ kom: window.__okruszek.komorka(), L: { pary: window.__okruszek.torLog().pary, mach: window.__okruszek.torLog().machniecia, ruchy: window.__okruszek.torLog().ruchy }, ev: window.__ev }));
    console.log(gap, r.kom.kol, r.kom.wiersz, r.kom.wzlot.toFixed(2), JSON.stringify(r.L), JSON.stringify(r.ev));
  }
  await br.close(); srv.close();
})();
