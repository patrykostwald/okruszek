/* Okruszek Z10: boty-gracze dla autopilota w grze (__okruszek.autopilot). Każdy bot to źródło funkcji-fabryki (eval w stronie),
   wywoływanej w każdym kroku symulacji z obiektem A (t, s, h, bx, prady, obst, haw, ZB, HIT, HITB, HITR, speed, r = losowość bota). Zwraca { u: skręt -1..1, hold: nurkowanie }.
   - idealny: łapie każdy prąd, omija każdą przeszkodę na kursie kolizyjnym (deszcz tylko, gdy nie zasłania prądu), przed drapieżnikiem (gdy wolny) chowa się
     w gęstej chmurze, nurkuje jak bot idealny z Z3b, ale dopiero od 50% wysokości (idealny121: od 30%, jak w Z3b, do testu "L4 w 60 s").
   - siedemdziesiat ("70%"): łapie 70% prądów (decyzja losowa przy pierwszym zobaczeniu prądu), omija 70% przeszkód, chowa się przed drapieżnikiem w 70% pościgów,
     nurkuje losowo ok. 30% czasu (odcinki 0,8-2,8 s; nie nurkuje poniżej 25% wysokości), reaguje co 0,15 s (opóźnienie człowieka).
   - losowy: co 1,2-3,7 s nowy losowy skręt i nurkowanie z prawdopodobieństwem 0,4 (jak bot losowy z Z3b).
   Z11: przeszkody złożone z części (wieże szpil, sznury festiwalu latawców, wiry Wielkiego przelotu, ulewa finału) mają w grze listę o.czesci {x, half, z, aktywna};
   bot widzi każdą część jak osobny trzon (jak człowiek widzi każdą wieżę) i wybiera najbliższą wolną szczelinę (scalone przedziały zajęte). Stare przeszkody bez zmian. */
const wspolne = `
  function zagrozenie(A, o) {
    var eta, xc, half;
    if (o.hit || o.zw || o.gesta || o.typ === 'wiatr') return null;
    if (o.typ === 'grad') { if (o.done || o.faza === 'koniec') return null; return { xc: o.x, half: 72, eta: 0, typ: o.typ }; }
    if (o.z < A.ZB - 0.05) return null;
    eta = (o.z - A.ZB) / A.speed; if (eta > 2.6) return null;
    xc = o.x + (o.v || 0) * eta;
    if (o.typ === 'ptak') half = A.HITB + 22;
    else if (o.typ === 'stado') { xc -= (o.dir || 1) * 45; half = 95; }
    else if (o.typ === 'latawiec') half = o.half + 22;
    else half = A.HITR + 18;
    return { xc: xc, half: half, eta: eta, typ: o.typ };
  }
  function czesciZagr(A, o, out) {
    var k, c, eta;
    if (o.zw) return;
    for (k = 0; k < o.czesci.length; k++) {
      c = o.czesci[k]; if (c.aktywna === false || c.z < A.ZB - 0.05) continue;
      eta = (c.z - A.ZB) / A.speed; if (eta > 2.6) continue;
      out.push([c.x - c.half - 16, c.x + c.half + 16]);
    }
  }
  function omin(A, tx, bl) {   /* scal przedziały zajęte; cel w środku przedziału -> najbliższa wolna krawędź (bliżej ptaszka) */
    var m = [], k, q, best = tx, bd = 1e9, c;
    bl.sort(function (a, b) { return a[0] - b[0]; });
    for (k = 0; k < bl.length; k++) { q = bl[k]; if (m.length && q[0] <= m[m.length - 1][1]) m[m.length - 1][1] = Math.max(m[m.length - 1][1], q[1]); else m.push([q[0], q[1]]); }
    for (k = 0; k < m.length; k++) if (tx > m[k][0] && tx < m[k][1]) {
      c = [m[k][0] - 6, m[k][1] + 6];
      for (q = 0; q < 2; q++) if (Math.abs(c[q] - A.bx) < bd) { bd = Math.abs(c[q] - A.bx); best = c[q]; }
      return best;
    }
    return tx;
  }
  function cel(A, chce, chceO, kryjOk) {
    var k, p, o, best = null, bz = 1e9, kryj = null, danger = null, d, tx, l, r, bl = [];
    for (k = 0; k < A.prady.length; k++) { p = A.prady[k]; if (!p.hit && p.z > A.ZB && chce(p) && p.z < bz) { bz = p.z; best = p; } }
    if (A.haw && (A.haw.faza === 'poscig' || A.haw.faza === 'zapowiedz') && A.s < 0.72 && kryjOk) {
      for (k = 0; k < A.obst.length; k++) { o = A.obst[k]; if (o.gesta && !o.hit && o.z > A.ZB) kryj = o; }
    }
    for (k = 0; k < A.obst.length; k++) {
      o = A.obst[k];
      if (o.czesci) { if (chceO(o)) czesciZagr(A, o, bl); continue; }   /* Z11: części */
      d = zagrozenie(A, o);
      if (!d || !chceO(o)) continue;
      if (d.typ === 'deszcz' && best && Math.abs(best.x - d.xc) < d.half) continue;   /* deszcz (S1, mokre piórka) nie wygrywa z prądem */
      if (Math.abs(d.xc - A.bx) < d.half + 15 && (!danger || d.eta < danger.eta)) danger = d;
    }
    tx = kryj ? kryj.x : (best ? best.x : A.bx);
    if (danger) {
      l = danger.xc - danger.half - 12; r = danger.xc + danger.half + 12;
      if (tx > l && tx < r) tx = (A.bx < danger.xc) ? l : r;
      else if (A.bx > l && A.bx < r) tx = (tx < danger.xc) ? l : r;
    }
    if (bl.length) tx = omin(A, tx, bl);
    return { tx: tx, best: best };
  }`;
const idealny = `(function () {${wspolne}
  var HMIN = 0.5;   /* przetrwanie: nurkuje tylko z zapasem wysokości */
  return function (A) {
    var c = cel(A, function () { return true; }, function () { return true; }, true);
    return { u: Math.max(-1, Math.min(1, (c.tx - A.bx) / 40)), hold: A.h > HMIN && ((c.best && c.best.z < 3.8) || A.s > 0.4) };
  };
})()`;
const siedemdziesiat = `(function () {${wspolne}
  var dp = {}, dob = {}, kryjDec = null, nurk = false, nastT = 0, rT = -1, u = 0;
  return function (A) {
    var k, c;
    for (k = 0; k < A.prady.length; k++) if (!(A.prady[k].id in dp)) dp[A.prady[k].id] = A.r() < 0.7;
    for (k = 0; k < A.obst.length; k++) if (!(A.obst[k].id in dob)) dob[A.obst[k].id] = A.r() < 0.7;
    if (A.haw && kryjDec === null) kryjDec = A.r() < 0.7; if (!A.haw) kryjDec = null;
    if (A.t >= nastT) { nurk = A.r() < 0.3; nastT = A.t + 0.8 + A.r() * 2.0; }
    if (A.t - rT >= 0.15) {
      rT = A.t;
      c = cel(A, function (p) { return dp[p.id]; }, function (o) { return dob[o.id]; }, !!kryjDec);
      u = Math.max(-1, Math.min(1, (c.tx - A.bx) / 40));
    }
    return { u: u, hold: nurk && A.h > 0.25 };
  };
})()`;
/* bot idealny z testu 12.1 (Z3b): nurkuje od 30% wysokości (szybkość, nie przetrwanie); do testu "L4 w 60 s" w trybie krain */
const idealny121 = idealny.replace('var HMIN = 0.5;', 'var HMIN = 0.3;');
const losowy = `(function () {
  var nastT = 0, u = 0, d = false;
  return function (A) {
    if (A.t >= nastT) { nastT = A.t + 1.2 + A.r() * 2.5; d = A.r() < 0.4; u = A.r() * 2 - 1; }
    return { u: u, hold: d };
  };
})()`;
module.exports = { idealny, idealny121, siedemdziesiat, losowy, wspolne };
