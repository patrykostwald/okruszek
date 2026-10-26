/* QA B: drążek trzymany + stuknięcie prawą połową (podniesienie jednego palca przez CDP: touchMove z pozostałym palcem / touchEnd z listą) */
const { serwer, przegladarka, dotykCDP, sleep } = require('./wspolne.cjs');
(async () => {
  const srv = await serwer(8733); const br = await przegladarka();
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage(); await pg.goto('http://127.0.0.1:8733/?test&tor=1&seed=31'); await sleep(800);
  const T = dotykCDP(await ctx.newCDPSession(pg));
  await pg.evaluate(() => { window.__pe = []; ['pointerdown', 'pointerup', 'pointercancel'].forEach(n => window.addEventListener(n, e => window.__pe.push(n + ':' + e.pointerId), true)); });
  for (const wariant of ['touchMove', 'touchEndLista']) {
    await pg.evaluate(() => { const O = window.__okruszek; O.sterowanie(3); O.bezPrzeszkod(true); O.bezPradow(true); O.nowyBieg(); O.idz(1, 1, true); window.__pe.length = 0; });
    await T('touchStart', [[1, 100, 650]]); await sleep(30);
    await T('touchStart', [[1, 100, 650], [2, 300, 650]]); await sleep(40);
    if (wariant === 'touchMove') await T('touchMove', [[1, 101, 650]]); else await T('touchEnd', [[2, 300, 650]]);
    await sleep(150); const a = await pg.evaluate(() => { const k = window.__okruszek.komorka(), L = window.__okruszek.torLog(); return { w: k.wiersz, mach: L.machniecia, nurk: L.nurkowania, palce: window.__okruszek.stan().palce, pe: window.__pe.slice() }; });
    await T('touchEnd', []); await sleep(100);
    console.log(wariant, JSON.stringify(a));
  }
  await br.close(); srv.close();
})();
