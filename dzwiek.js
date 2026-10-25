/* Okruszek — synteza własna. Do wklejenia jako samodzielny <script>.
 * N/M obsługuje gospodarz: muzyka(bool) / dzwiek(bool).
 * Wywołania przed start() są bezpieczne; efekty jednorazowe nie są kolejkowane.
 */
(function () {
  'use strict';
  const GLOS = Object.freeze({
    master: 0.5, wiatr: 0.28, nuty: 0.10, prad: 0.13,
    nurkowanie: 0.18, cwir: 0.10, och: 0.10, ladowanie: 0.12
  });
  let ctx, master, muzykaBus, efektyBus, filtrNut, wiatr, nur;
  let szum, timer, wznowienie, s = 0, ostatnieS = -1;
  let muzykaOn = true, efektyOn = true, pauzaOn = false, nurOn = false;
  let fraza = [], indeks = 0, nastepna = 0, poprzednia = -1;
  const glosy = new Set();
  const ostatniEfekt = Object.create(null);
  const los = (a, b) => a + Math.random() * (b - a);
  const wyciszony = () => pauzaOn || document.hidden;

  function plynnie(param, cel, czas = 0.12) {
    const teraz = ctx.currentTime;
    if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(teraz);
    else { const v = param.value; param.cancelScheduledValues(teraz); param.setValueAtTime(v, teraz); }
    param.setTargetAtTime(cel, teraz, czas);
  }
  function gain(wartosc, cel) {
    const node = ctx.createGain(); node.gain.value = wartosc; node.connect(cel); return node;
  }
  function stworzSzum() {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const dane = buffer.getChannelData(0);
    let v = 0;
    for (let i = 0; i < dane.length; i++) {
      v = 0.97 * v + 0.03 * los(-1, 1);
      dane[i] = v * 3;
    }
    // Złączenie końca z początkiem bez trzasku na granicy pętli.
    const n = Math.floor(ctx.sampleRate * 0.05);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      dane[dane.length - n + i] = dane[dane.length - n + i] * (1 - t) + dane[0] * t;
    }
    return buffer;
  }
  function warstwaSzumu(cel, typ, hz) {
    const zrodlo = ctx.createBufferSource(); zrodlo.buffer = szum; zrodlo.loop = true;
    const filtr = ctx.createBiquadFilter(); filtr.type = typ; filtr.frequency.value = hz; filtr.Q.value = 0.5;
    const glos = gain(0, cel); zrodlo.connect(filtr); filtr.connect(glos); zrodlo.start();
    return { filtr, glos };
  }
  function stworzWiatr() { wiatr = warstwaSzumu(muzykaBus, 'lowpass', 350); }
  function stworzNurkowanie() { nur = warstwaSzumu(efektyBus, 'bandpass', 800); }

  function ton(cel, hz, koniecHz, czas, poziom, atak, typ = 'sine', opoznienie = 0) {
    // Ograniczenie liczby głosów także przy spamowaniu API.
    if (glosy.size >= 12) return;
    const t = ctx.currentTime + opoznienie;
    const osc = ctx.createOscillator(); osc.type = typ;
    osc.frequency.setValueAtTime(hz, t);
    osc.frequency.exponentialRampToValueAtTime(koniecHz, t + czas * 0.8);
    const obwiednia = gain(0, cel);
    obwiednia.gain.setValueAtTime(0, t);
    obwiednia.gain.linearRampToValueAtTime(poziom, t + atak);
    obwiednia.gain.exponentialRampToValueAtTime(0.00001, t + czas);
    obwiednia.gain.linearRampToValueAtTime(0, t + czas + 0.03);
    osc.connect(obwiednia); glosy.add(osc);
    osc.onended = () => { osc.disconnect(); obwiednia.disconnect(); glosy.delete(osc); };
    osc.start(t); osc.stop(t + czas + 0.04);
  }
  function petlaNut() {
    if (!ctx || ctx.state !== 'running' || wyciszony() || !muzykaOn) return;
    const t = ctx.currentTime;
    if (t < nastepna) return;
    if (indeks >= fraza.length) {
      const skala = [0, 2, 4, 7, 9]; // C-dur pentatoniczna, łagodny rejestr.
      fraza = Array.from({ length: Math.random() < 0.5 ? 3 : 4 }, () => {
        let n;
        do { n = Math.floor(Math.random() * skala.length); } while (n === poprzednia);
        poprzednia = n;
        return 261.6256 * Math.pow(2, skala[n] / 12);
      });
      indeks = 0;
    }
    const hz = fraza[indeks++];
    ton(filtrNut, hz, hz * los(0.998, 1.002), los(3.8, 5.2), GLOS.nuty * los(0.7, 1), 0.9, 'triangle');
    nastepna = t + los(2.5, 4.2) + (indeks === fraza.length ? los(1, 2.5) : 0);
  }
  function predkosc(wartosc) {
    s = Number.isFinite(wartosc) ? Math.max(0, Math.min(1, wartosc)) : 0;
    if (!ctx || Math.abs(s - ostatnieS) < 0.002) return;
    ostatnieS = s;
    plynnie(wiatr.filtr.frequency, 350 + 2400 * s, 0.2);
    plynnie(wiatr.glos.gain, GLOS.wiatr * (0.12 + 0.88 * s), 0.2);
    plynnie(filtrNut.frequency, 450 + 1700 * s, 0.3);
    plynnie(nur.filtr.frequency, 700 + 1300 * s, 0.15);
  }
  function aktualizuj() {
    if (!ctx) return;
    plynnie(master.gain, wyciszony() ? 0 : GLOS.master, 0.08);
    plynnie(muzykaBus.gain, muzykaOn ? 1 : 0, 0.25);
    plynnie(efektyBus.gain, efektyOn ? 1 : 0, 0.08);
    plynnie(nur.glos.gain, nurOn ? GLOS.nurkowanie : 0, 0.15);
    clearInterval(timer); timer = undefined;
    if (!wyciszony() && muzykaOn) timer = setInterval(petlaNut, 250);
  }
  function wznow() {
    if (!ctx || ctx.state === 'closed') return Promise.resolve(false);
    if (ctx.state === 'running') return Promise.resolve(true);
    if (!wznowienie) wznowienie = ctx.resume().then(() => true, () => false).finally(() => { wznowienie = null; });
    return wznowienie;
  }
  function start() {
    if (!ctx) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return Promise.resolve(false);
      ctx = new Audio();
      master = gain(0, ctx.destination);
      const kompresor = ctx.createDynamicsCompressor();
      kompresor.threshold.value = -12; kompresor.knee.value = 12;
      kompresor.ratio.value = 12; kompresor.attack.value = 0.003; kompresor.release.value = 0.25;
      kompresor.connect(master);
      muzykaBus = gain(0, kompresor); efektyBus = gain(0, kompresor);
      filtrNut = ctx.createBiquadFilter(); filtrNut.type = 'lowpass'; filtrNut.Q.value = 0.5; filtrNut.connect(muzykaBus);
      szum = stworzSzum(); stworzWiatr(); stworzNurkowanie(); predkosc(s);
      nastepna = ctx.currentTime + 0.3;
    }
    aktualizuj();
    return wznow();
  }
  function moznaEfekt(nazwa) {
    if (!ctx || ctx.state !== 'running' || wyciszony() || !efektyOn) return false;
    if (ctx.currentTime - (ostatniEfekt[nazwa] ?? -10) < 0.12) return false;
    ostatniEfekt[nazwa] = ctx.currentTime; return true;
  }
  function prad() {
    if (moznaEfekt('prad')) ton(efektyBus, 430, 1100, 0.65, GLOS.prad, 0.09);
  }
  function cwir() {
    if (!moznaEfekt('cwir')) return;
    const hz = los(1400, 1800);
    ton(efektyBus, hz, hz * 1.35, 0.16, GLOS.cwir, 0.025);
    ton(efektyBus, hz * 1.15, hz * 0.95, los(0.16, 0.23), GLOS.cwir * 0.7, 0.025, 'sine', 0.18);
  }
  function och() {
    if (moznaEfekt('och')) ton(efektyBus, 360, 220, 0.5, GLOS.och, 0.08, 'triangle');
  }
  function ladowanie() {
    if (!moznaEfekt('ladowanie')) return;
    ton(efektyBus, 330, 262, 1.3, GLOS.ladowanie, 0.14);
    ton(efektyBus, 660, 524, 1.5, GLOS.ladowanie * 0.35, 0.18);
  }
  function muzyka(v) { muzykaOn = !!v; aktualizuj(); }
  function dzwiek(v) { efektyOn = !!v; aktualizuj(); }
  function nurkowanie(v) { nurOn = !!v; if (ctx) plynnie(nur.glos.gain, nurOn ? GLOS.nurkowanie : 0, 0.15); }
  function pauza(v) { pauzaOn = !!v; aktualizuj(); if (!wyciszony()) void wznow(); }
  document.addEventListener('visibilitychange', () => {
    aktualizuj();
    if (!document.hidden) void wznow(); // Nie kasuje ręcznej pauzy.
  });
  window.OkruszekDzwiek = Object.freeze({ start, muzyka, dzwiek, predkosc, prad, nurkowanie, cwir, och, ladowanie, pauza });
})();
