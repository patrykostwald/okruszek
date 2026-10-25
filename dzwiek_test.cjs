/* Uruchomienie: node dzwiek_test.cjs. Pomiar prawdziwego wyjścia Web Audio. */
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe',
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [], requests = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); });
    page.on('request', r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
    await page.addInitScript(() => {
      const Native = window.AudioContext;
      window.__audio = { contexts: [], active: 0, maxActive: 0, gains: [], filters: [] };
      window.AudioContext = class extends Native {
        constructor(...args) { super(...args); window.__audio.contexts.push(this); }
        createGain() { const n = super.createGain(); window.__audio.gains.push(n); return n; }
        createBiquadFilter() { const n = super.createBiquadFilter(); window.__audio.filters.push(n); return n; }
        createOscillator() {
          const n = super.createOscillator();
          window.__audio.active++;
          window.__audio.maxActive = Math.max(window.__audio.maxActive, window.__audio.active);
          n.addEventListener('ended', () => window.__audio.active--);
          return n;
        }
      };
      const connect = AudioNode.prototype.connect;
      AudioNode.prototype.connect = function (to, ...args) {
        if (to === this.context.destination) {
          const analyser = this.context.createAnalyser(); analyser.fftSize = 2048;
          window.__audio.analyser = analyser; window.__audio.master = this;
          connect.call(this, analyser); connect.call(analyser, to);
          return to;
        }
        return connect.call(this, to, ...args);
      };
      window.__pomiar = async (ms = 1000, spam = false) => {
        const data = new Float32Array(window.__audio.analyser.fftSize);
        let peak = 0, sum = 0, count = 0;
        const end = performance.now() + ms;
        while (performance.now() < end) {
          if (spam) for (let i = 0; i < 20; i++) {
            OkruszekDzwiek.prad(); OkruszekDzwiek.cwir(); OkruszekDzwiek.och(); OkruszekDzwiek.ladowanie();
          }
          window.__audio.analyser.getFloatTimeDomainData(data);
          for (const x of data) { peak = Math.max(peak, Math.abs(x)); sum += x * x; count++; }
          await new Promise(r => setTimeout(r, 20));
        }
        return { peak, rms: Math.sqrt(sum / count) };
      };
    });
    await page.goto(pathToFileURL(path.join(__dirname, 'dzwiek-test.html')).href);
    await page.evaluate(() => {
      const a = OkruszekDzwiek;
      a.muzyka(false); a.dzwiek(false); a.predkosc(0); a.prad(); a.nurkowanie(true);
      a.cwir(); a.och(); a.ladowanie(); a.pauza(true);
      a.muzyka(true); a.dzwiek(true); a.nurkowanie(false); a.pauza(false);
    });
    assert.equal(await page.evaluate(() => __audio.contexts.length), 0, 'brak kontekstu przed gestem');
    await page.click('#start');
    await page.evaluate(() => Promise.all(Array.from({ length: 8 }, () => OkruszekDzwiek.start())));
    assert.deepEqual(await page.evaluate(() => __audio.contexts.map(c => c.state)), ['running']);
    await page.waitForTimeout(1200);
    const low = await page.evaluate(() => __pomiar(1800));
    const lowFilter = await page.evaluate(() => __audio.filters[0].frequency.value);
    await page.evaluate(() => OkruszekDzwiek.predkosc(1));
    await page.waitForTimeout(1500);
    const high = await page.evaluate(() => __pomiar(1800));
    assert.ok(high.rms > low.rms * 1.4, `RMS rośnie: ${low.rms} -> ${high.rms}`);
    assert.ok(await page.evaluate(() => __audio.filters[0].frequency.value) > lowFilter, 'barwa nut reaguje');
    await page.evaluate(() => {
      const count = __audio.gains.length;
      for (let i = 0; i < 10000; i++) OkruszekDzwiek.predkosc(i % 2);
      if (__audio.gains.length !== count) throw Error('predkosc tworzy węzły');
      OkruszekDzwiek.nurkowanie(true);
    });
    const stress = await page.evaluate(() => __pomiar(3500, true));
    assert.ok(stress.peak > 0.005 && stress.peak < 0.98, `szczyt: ${stress.peak}`);
    assert.ok(await page.evaluate(() => __audio.master.gain.value) <= 0.5);
    assert.ok(await page.evaluate(() => __audio.maxActive) <= 12, 'limit głosów');
    await page.evaluate(() => OkruszekDzwiek.nurkowanie(false));
    await page.keyboard.press('n'); await page.keyboard.press('m');
    await page.waitForTimeout(2500);
    const mute = await page.evaluate(() => __pomiar(300));
    assert.ok(mute.peak < 0.0001, 'N/M wyciszają');
    await page.keyboard.press('m');
    for (const name of ['prad', 'cwir', 'och', 'ladowanie']) {
      await page.click(`[data-efekt="${name}"]`);
      const sample = await page.evaluate(() => __pomiar(500));
      assert.ok(sample.peak > 0.0001 && sample.peak < 0.98, `efekt ${name} słyszalny`);
      await page.waitForTimeout(1500);
    }
    await page.evaluate(() => OkruszekDzwiek.nurkowanie(true));
    await page.waitForTimeout(800);
    assert.ok((await page.evaluate(() => __pomiar(300))).rms > 0.0001, 'nurkowanie działa bez muzyki');
    await page.evaluate(() => OkruszekDzwiek.nurkowanie(false));
    await page.waitForTimeout(2000);
    assert.ok((await page.evaluate(() => __pomiar(300))).peak < 0.0001, 'nurkowanie gaśnie');
    assert.equal(await page.evaluate(() => __audio.active), 0, 'głosy jednorazowe posprzątane');
    await page.keyboard.press('n');
    await page.evaluate(() => OkruszekDzwiek.pauza(true));
    await page.waitForTimeout(1200);
    assert.ok((await page.evaluate(() => __pomiar(300))).peak < 0.0001, 'pauza wycisza');
    // Deterministyczna symulacja zdarzenia: headless nie gwarantuje ukrycia karty.
    await page.evaluate(async () => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
      await __audio.contexts[0].suspend();
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(() => __audio.contexts[0].state === 'running');
    assert.ok((await page.evaluate(() => __pomiar(300))).peak < 0.0001, 'powrót nie kasuje ręcznej pauzy');
    await page.evaluate(() => OkruszekDzwiek.pauza(false));
    await page.waitForTimeout(1200);
    assert.ok((await page.evaluate(() => __pomiar(300))).rms > 0.0001, 'wznowienie słyszalne');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(1200);
    assert.ok((await page.evaluate(() => __pomiar(300))).peak < 0.0001, 'ukrycie wycisza');
    await page.evaluate(() => {
      delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));
      for (const v of [-10, 10, NaN, Infinity]) OkruszekDzwiek.predkosc(v);
      OkruszekDzwiek.predkosc(1);
    });
    await page.waitForTimeout(1200);
    assert.ok((await page.evaluate(() => __pomiar(300))).rms > 0.0001, 'powrót przywraca dźwięk');
    assert.equal(await page.evaluate(() => __audio.contexts.length), 1);
    assert.deepEqual(errors, [], 'brak błędów konsoli');
    assert.deepEqual(requests, [], 'brak sieci');
    console.log('Pomiary:', JSON.stringify({ low, high, stress, mute }));
    console.log('DZWIEK OK');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
