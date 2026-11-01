const { serwer, przegladarka, sleep } = require('./wspolne.cjs');
(async () => {
  const srv = await serwer(8796); const br = await przegladarka();
  for (const cpu of [1, 4]) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const pg = await ctx.newPage(); const cdp = await ctx.newCDPSession(pg);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
    await pg.addInitScript(() => { window.__t0 = performance.now(); new PerformanceObserver(l => { for (const e of l.getEntries()) (window.__lt = window.__lt || []).push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); const r = requestAnimationFrame; let first = true; window.requestAnimationFrame = function (f) { return r.call(window, function (ts) { if (first) { first = false; window.__fp = performance.now(); } f(ts); }); }; });
    const t0 = Date.now(); await pg.goto('http://127.0.0.1:8796/?tor=1'); const tl = Date.now() - t0; await sleep(3000);
    const r = await pg.evaluate(() => ({ fp: Math.round(window.__fp), lt: window.__lt, paint: performance.getEntriesByType('paint').map(p => [p.name, Math.round(p.startTime)]) }));
    console.log('CPU x' + cpu, 'load ms', tl, JSON.stringify(r)); await ctx.close();
  }
  await br.close(); srv.close();
})();
