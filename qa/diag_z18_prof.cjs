const { serwer, przegladarka, sleep } = require('./wspolne.cjs');
(async () => { const srv = await serwer(8797); const br = await przegladarka(); const pg = await br.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await pg.goto('http://127.0.0.1:8797/idx_prof.html?tor=1'); await sleep(500); console.log(JSON.stringify(await pg.evaluate(() => window.__prof))); await br.close(); srv.close(); })();
