/* Okruszek Z15: arkusz kontaktowy zrzutów (do przeglądu). Użycie: node arkusz_z15.cjs wyjscie.png kolumny plik1 plik2 ... (pliki z zrzuty-z15, bez .png) */
const path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const [out, kol, ...pl] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe' });
  const n = +kol, w = 195, h = 422, rows = Math.ceil(pl.length / n);
  const p = await b.newPage({ viewport: { width: n * w + (n + 1) * 4, height: rows * (h + 18) + 4 } });
  const src = (f) => 'file:///' + path.resolve(__dirname, 'zrzuty-z15', f + '.png').split(path.sep).join('/');
  const html = '<body style="margin:0;background:#222;font:11px sans-serif;color:#ddd">' + pl.map(f => '<div style="display:inline-block;margin:2px;width:' + w + 'px;vertical-align:top"><img src="' + src(f) + '" style="width:' + w + 'px;height:' + h + 'px;display:block"><div>' + f + '</div></div>').join('') + '</body>';
  await p.goto('file:///' + path.resolve(__dirname, 'zrzuty-z15').split(path.sep).join('/') + '/');
  await p.setContent(html); await p.waitForTimeout(600);
  await p.screenshot({ path: path.resolve(__dirname, 'zrzuty-z15', out) });
  await b.close();
})();
