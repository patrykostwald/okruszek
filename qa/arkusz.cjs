/* Arkusz zrzutów (stykówka) do obejrzenia naraz. Użycie: node qa/arkusz.cjs wyjscie.png szerokoscKafla kolumny plik1.png plik2.png ... */
const { przegladarka, ZRZUTY, path, fs } = require('./wspolne.cjs');
(async () => {
  const [out, kw, kol, ...pliki] = process.argv.slice(2);
  const w = +kw || 240, n = +kol || 4;
  const kafle = pliki.map(p => { const f = path.isAbsolute(p) ? p : path.join(ZRZUTY, p); const b64 = fs.readFileSync(f).toString('base64'); return '<figure><img src="data:image/png;base64,' + b64 + '"><figcaption>' + path.basename(f, '.png') + '</figcaption></figure>'; }).join('');
  const html = '<html><body style="margin:0;background:#888;font:11px sans-serif"><div style="display:grid;grid-template-columns:repeat(' + n + ',' + w + 'px);gap:4px;padding:4px">' + kafle + '</div><style>figure{margin:0}img{width:' + w + 'px;display:block}figcaption{color:#000;background:#eee;padding:1px 3px}</style></body></html>';
  const br = await przegladarka(); const pg = await br.newPage({ viewport: { width: n * (w + 4) + 4, height: 400 }, deviceScaleFactor: 1 });
  await pg.setContent(html); await pg.waitForTimeout(200);
  await pg.screenshot({ path: path.isAbsolute(out) ? out : path.join(ZRZUTY, out), fullPage: true }); await br.close();
})();
