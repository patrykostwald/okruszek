/* Okruszek Z11: zrzuty 390x844 (i 1440x900 dla K3 i K5) do zrzuty-z11. Użycie: node zrzuty_z11.cjs [plik.html] [nazwa...] */
const fs = require('fs'), path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const file = path.resolve(process.argv[2] && /\.html$/.test(process.argv[2]) ? process.argv[2] : path.join(__dirname, 'index.html'));
const tylko = process.argv.slice(2).filter(a => !/\.html$/.test(a));
const OUT = path.join(__dirname, 'zrzuty-z11'); fs.mkdirSync(OUT, { recursive: true });
const url = 'file:///' + file.replace(/\\/g, '/') + '?test&seed=23';
/* sceny: b = brama (kraina), L = poziom, pora, ev = wymuszenia [nazwa, opcje], sim = sekundy symulacji po wymuszeniu, fin = finał krainy */
const K2 = [['tecza_ks', { dx: 0.15, z: 2.2 }], ['deszcz', { dx: -0.7, z: 2.8 }], ['rogal', { t: 3.6 }]];
const K3 = [['szpile', { uklad: 'rzad', dx: 0, z: 3.0, n: 5 }], ['komin', { dx: 0.55, z: 2.0 }], ['szpile', { uklad: 'skos', dx: -1.2, z: 4.6 }]];
const K4 = [['latawce', { dx: 0, z: 2.5 }], ['poryw', { dx: 0.7, z: 3.0 }]];
const K5 = [['przelot', { dx: 0, wiry: true }]];
const S = {};
for (const L of [0, 2, 4]) {
  S['K2-L' + L] = { b: 2, L, ev: K2, sim: 1.4 };
  S['K3-L' + L] = { b: 3, L, ev: K3, sim: 1.4 };
  S['K4-L' + L] = { b: 4, L, ev: K4, sim: 1.6 };
  S['K5-L' + L] = { b: 5, L, ev: K5, sim: L === 0 ? 2.6 : (L === 2 ? 1.5 : 1.0) };
}
Object.assign(S, {
  'szpile-z-bliska-L2': { b: 3, L: 2, ev: [['szpile', { uklad: 'aleja', dx: 0, z: 2.2 }]], sim: 1.15 },
  'szpile-z-bliska-L0-noc': { b: 3, L: 0, pora: 'noc', ev: [['szpile', { uklad: 'aleja', dx: 0, z: 2.2 }]], sim: 1.15 },
  'szpile-noc-L4': { b: 3, L: 4, pora: 'noc', ev: [['szpile', { uklad: 'rzad', dx: 0, z: 3.4, n: 5 }]], sim: 1.0 },
  'komin-ciepla-L2': { b: 3, L: 2, ev: [['komin', { dx: 0.05, z: 1.75 }], ['szpile', { uklad: 'rzad', dx: 0.9, z: 2.4, n: 3 }]], sim: 0.8 },
  'przelot-nadlot-L2': { b: 5, L: 2, ev: K5, sim: 1.55 },
  'przelot-nad-glowa-L2': { b: 5, L: 2, ev: K5, sim: 2.15 },
  'przelot-wiry-L2': { b: 5, L: 2, ev: [['przelot', { dx: 0.05, wiry: true }]], sim: 4.9 },
  'przelot-wiry-L4': { b: 5, L: 4, ev: [['przelot', { dx: 0.05, wiry: true }]], sim: 3.0 },
  'przelot-nocny-L2': { b: 5, L: 2, pora: 'noc', ev: K5, sim: 1.5 },
  'festiwal-latawcow-L2': { b: 4, L: 2, fin: 4, ev: [['latawce', { dx: 0.9, z: 3.4 }]], sim: 2.2 },
  'festiwal-latawcow-L4': { b: 4, L: 4, fin: 4, sim: 1.6 },
  'tecza-z-rogalem-L2': { b: 2, L: 2, pora: 'noc', ev: [['tecza_ks', { dx: 0, z: 2.0, big: 1.4 }], ['rogal', { t: 3.6 }]], sim: 0.2 },
  'tecza-z-rogalem-L0': { b: 2, L: 0, pora: 'noc', ev: [['tecza_ks', { dx: 0, z: 2.0, big: 1.4 }], ['rogal', { t: 3.6 }]], sim: 0.2 },
  'rogal-mruga-L4': { b: 2, L: 4, pora: 'noc', ev: [['rogal', { t: 3.8 }]], sim: 0.1 },
  'final-K2-ulewa-i-luk-L2': { b: 2, L: 2, fin: 2, sim: 1.2 },
  'final-K3-kanion-wiez-L2': { b: 3, L: 2, fin: 3, sim: 1.5 },
  'final-K5-przelot-olbrzyma-L2': { b: 5, L: 2, fin: 5, sim: 1.6 },
  'zwiastun-K3-przed-brama-L2': { b: 2, L: 2, doBramy: 290, ev: [['zwiastun', { kraina: 3, dx: 0.9 }]], sim: 1.2 },
  'zwiastun-K5-przed-brama-L2': { b: 4, L: 2, doBramy: 290, ev: [['zwiastun', { kraina: 5, dx: 0.9 }]], sim: 2.6 },
  'pora-swit-L2': { b: 3, L: 2, pora: 'swit', sim: 0.2 },
  'pora-dzien-L2': { b: 4, L: 2, pora: 'dzien', sim: 0.2 },
  'pora-zachod-L2': { b: 1, L: 2, pora: 'zachod', sim: 0.2 },
  'pora-noc-L2': { b: 2, L: 2, pora: 'noc', sim: 0.2 },
  'K3-1440-L2': { b: 3, L: 2, ev: K3, sim: 1.4, szer: 1440 },
  'K5-1440-L2': { b: 5, L: 2, ev: K5, sim: 1.5, szer: 1440 }
});
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const errs = [];
  const strony = {};
  const strona = async (szer) => {
    if (strony[szer]) return strony[szer];
    const p = await browser.newPage({ viewport: szer === 1440 ? { width: 1440, height: 900 } : { width: 390, height: 844 }, deviceScaleFactor: szer === 1440 ? 1 : 2 });
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
    await p.goto(url); await p.waitForTimeout(800); await p.evaluate(() => __okruszek.z11Zbuduj());
    strony[szer] = p; return p;
  };
  for (const nm of (tylko.length ? tylko : Object.keys(S))) {
    const c = S[nm], p = await strona(c.szer || 390);
    await p.evaluate((c) => { const o = __okruszek; o.pauza(true); o.tempo(1); o.bezPrzeszkod(true); o.bezPradow(true); o.odblokuj(); o.odblokujPore(); o.brama(c.b); if (c.pora) o.ustawPore(c.pora); o.ustawPoziom(c.L); o.ustawWysokosc(0.8); o.symuluj(0.6);
      if (c.doBramy) o.doBramy(c.doBramy);
      if (c.fin) { o.bezPrzeszkod(false); o.zdarzenie('final', { kraina: c.fin }); o.bezPrzeszkod(true); }
      (c.ev || []).forEach(e => o.zdarzenie(e[0], e[1])); o.symuluj(c.sim); o.tempo(0.02); o.pauza(false); }, c);
    await p.waitForTimeout(700);
    await p.screenshot({ path: path.join(OUT, nm + '.png') });
    console.log('zrzut ' + nm);
  }
  console.log('błędy konsoli: ' + (errs.length ? errs.slice(0, 3).join(' | ') : 'brak'));
  await browser.close();
})();
