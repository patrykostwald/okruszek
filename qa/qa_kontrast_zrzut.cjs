/* Kontrast tekstu na zrzucie: node qa/qa_kontrast_zrzut.cjs plik.png x y w h [x y w h ...] (piksele zrzutu). 99. percentyl jasności wobec mediany pudełka. */
const { przegladarka, ZRZUTY, path, fs } = require('./wspolne.cjs');
(async () => {
  const [plik, ...liczby] = process.argv.slice(2);
  const f = path.isAbsolute(plik) ? plik : path.join(ZRZUTY, plik);
  const b = await przegladarka(); const p = await b.newPage();
  await p.setContent('<img src="data:image/png;base64,' + fs.readFileSync(f).toString('base64') + '">'); await p.waitForTimeout(200);
  const boxes = []; for (let i = 0; i + 3 < liczby.length; i += 4) boxes.push(liczby.slice(i, i + 4).map(Number));
  const r = await p.evaluate((boxes) => {
    const i = document.images[0], c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; const x = c.getContext('2d'); x.drawImage(i, 0, 0);
    const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return boxes.map(([x0, y0, w, h]) => { const d = x.getImageData(x0, y0, w, h).data, L = []; for (let k = 0; k < d.length; k += 4) L.push(0.2126 * lin(d[k]) + 0.7152 * lin(d[k + 1]) + 0.0722 * lin(d[k + 2])); L.sort((a, b) => a - b); const bg = L[L.length >> 1], hi = L[Math.floor(L.length * 0.99)], lo = L[Math.floor(L.length * 0.01)]; return { box: [x0, y0, w, h], jasnyTekst: +((hi + 0.05) / (bg + 0.05)).toFixed(2), ciemnyTekst: +((bg + 0.05) / (lo + 0.05)).toFixed(2) }; });
  }, boxes);
  console.log(path.basename(f), JSON.stringify(r)); await b.close();
})();
