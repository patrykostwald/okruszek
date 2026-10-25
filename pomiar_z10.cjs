/* Okruszek Z10, punkt 1: pomiar najpierw. Bot "70%" (boty_z10.cjs) w K1 (cała Droga jako K1: hak pomiar), 10 ziaren.
   Wynik: mediana prędkości (m/s = dystans / czas biegu) i mediana długości biegu; metry krain = czas typowy x zmierzona prędkość, zaokrąglone do 100 m.
   Użycie: node pomiar_z10.cjs [plik.html] [--zapisz]   (--zapisz: raport do raporty/z10-pomiar.md) */
const fs = require('fs'), path = require('path');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const BOTY = require('./boty_z10.cjs');
const file = path.resolve(process.argv.find(a => /\.html$/.test(a)) || path.join(__dirname, 'index.html'));
const med = (a) => { const b = a.slice().sort((x, y) => x - y), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe', args: ['--window-position=-32000,-32000', '--window-size=1,1'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file:///' + file.replace(/\\/g, '/') + '?test&seed=23');
  await page.waitForTimeout(800);
  async function bieg(bot, ziarno, k1) {
    return page.evaluate(([src, z, k1]) => {
      const o = __okruszek; o.pauza(true); o.odblokuj(); o.nurkuj(false); o.przesun(null); o.bezPradow(false); o.bezPrzeszkod(false); o.odblokujPore(); o.pomiar(k1); o.cichaPomoc(false); o.ziarno(z);
      o.brama(1); o.autopilot(eval(src), z * 7919 + 13);
      let r; for (let i = 0; i < 40; i++) { r = o.symuluj(30); if (r.tryb === 'koniec') break; }
      o.autopilot(null); o.pomiar(false);
      return { z, graCzas: r.graCzas, dystans: r.dystans, v: r.dystans / r.graCzas, koniec: r.koniec, wloty: r.wloty, poziomMax: r.poziomMax, czasPoziom: r.czasPoziom, kolizje: r.kolizje };
    }, [bot, ziarno, k1]);
  }
  const rows = [];
  for (let z = 1; z <= 10; z++) rows.push(await bieg(BOTY.siedemdziesiat, z, true));
  const ide = [];
  for (let z = 1; z <= 3; z++) ide.push(await bieg(BOTY.idealny, z, true));
  const vMed = med(rows.map(r => r.v)), tMed = med(rows.map(r => r.graCzas)), mMed = med(rows.map(r => r.dystans));
  const czasy = [90, 120, 135, 150, 165], nazwy = ['K1 Nad Wielką Górą', 'K2 Morze Pierzyn', 'K3 Kamienny Las', 'K4 Wietrzne Schody', 'K5 Szlak Żelaznych Gęsi'];
  const vR = Math.round(vMed * 10) / 10, metry = czasy.map(c => Math.round(c * vR / 100) * 100);
  const f1 = (x) => x.toFixed(1).replace('.', ',');
  console.log('bot 70%:'); rows.forEach(r => console.log('  ziarno ' + r.z + ': ' + f1(r.graCzas) + ' s, ' + Math.round(r.dystans) + ' m, ' + f1(r.v) + ' m/s, koniec ' + r.koniec + ', wlotów ' + r.wloty + ', maks. L' + r.poziomMax + ', kolizji ' + r.kolizje));
  console.log('mediana prędkości ' + vMed.toFixed(3) + ' m/s (do KRAINY: ' + vR + '), mediana biegu ' + tMed.toFixed(1) + ' s / ' + Math.round(mMed) + ' m');
  console.log('bot idealny (informacyjnie): ' + ide.map(r => f1(r.graCzas) + ' s ' + f1(r.v) + ' m/s ' + r.koniec).join(' | '));
  console.log('metry krain: ' + metry.join(' / ') + (errs.length ? '\nBŁĘDY: ' + errs.join(' | ') : ''));
  if (process.argv.includes('--zapisz')) {
    const d = new Date(), ts = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    let md = '# Z10: pomiar prędkości typowej (bot „70%” w K1)\n\n';
    md += 'Pomiar: ' + ts + ', `node pomiar_z10.cjs --zapisz` (Chromium headless, krok symulacji 1/60 s bez rysowania, hak `?test`).\n';
    md += 'Bot „70%” (`boty_z10.cjs`): łapie 70% prądów, omija 70% przeszkód, nurkuje losowo ok. 30% czasu (nie poniżej 25% wysokości), reaguje co 0,15 s.\n';
    md += 'Kraina: K1 przez cały bieg (hak `pomiar(true)`: bez bramy), przeszkody i napięcie N(t) K1, SINK K1 = 0,032, bez drapieżników (K1). Ziarna 1-10.\n';
    md += 'Prędkość biegu = dystans / czas biegu (z 20 s spokojnego startu). Dystans w grze rośnie o 10 + 22·s m/s [kod].\n\n';
    md += '| Ziarno | Czas biegu (s) | Dystans (m) | Prędkość (m/s) | Koniec | Wloty | Maks. poziom |\n|---|---|---|---|---|---|---|\n';
    rows.forEach(r => { md += '| ' + r.z + ' | ' + f1(r.graCzas) + ' | ' + Math.round(r.dystans) + ' | ' + f1(r.v) + ' | ' + (r.koniec || 'limit pomiaru 1200 s (leci dalej)') + ' | ' + r.wloty + ' | L' + r.poziomMax + ' |\n'; });
    md += '\nLimit pomiaru: 1200 s na bieg; ' + rows.filter(r => !r.koniec).length + ' z 10 biegów doleciało do limitu (ich długość to dolne oszacowanie). Mediana długości liczona z 5. i 6. wartości po posortowaniu.\n';
    md += '\n**Mediana prędkości: ' + vMed.toFixed(2).replace('.', ',') + ' m/s** (w `KRAINY`: `V_TYP = ' + vR + '`). **Mediana długości biegu: ' + (tMed >= 1199.9 ? 'co najmniej ' : '') + f1(tMed) + ' s, ' + Math.round(mMed) + ' m.**\n\n';
    md += '## Metry krain (czas typowy x ' + String(vR).replace('.', ',') + ' m/s, zaokrąglone do 100 m)\n\n| Kraina | Czas typowy | Długość | Od-do na Drodze |\n|---|---|---|---|\n';
    let od = 0; czasy.forEach((c, i) => { md += '| ' + nazwy[i] + ' | ' + c + ' s | ' + metry[i] + ' m | ' + od + '-' + (od + metry[i]) + ' m |\n'; od += metry[i]; });
    md += '| Dalekie Niebo | bez końca | bez końca | od ' + od + ' m |\n\n';
    md += 'Bot idealny w tych samych warunkach (informacyjnie, 3 ziarna): ' + ide.map(r => f1(r.graCzas) + ' s, ' + f1(r.v) + ' m/s, koniec: ' + r.koniec).join('; ') + '.\n';
    fs.mkdirSync(path.join(__dirname, 'raporty'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, 'raporty', 'z10-pomiar.md'), md);
    console.log('zapisano raporty/z10-pomiar.md');
  }
  await browser.close();
})();
