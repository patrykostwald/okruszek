/* Okruszek Z3c: boty-gracze do testu energii koloru (autopilot w grze, kroki symulacji bez rysowania). Format jak w boty_z10.cjs.
   - polowa ("50% prądów"): przy pierwszym zobaczeniu prądu losuje z prawdopodobieństwem 0,5, czy po niego leci; pozostałe celowo omija (nie wpada w nie przypadkiem); przeszkód nie ma w teście;
     nurkuje jak bot idealny (od 50% wysokości, gdy prąd blisko albo s > 0,4), czyli NAJGORSZY dla gry przypadek średniaka (umie nurkować); reakcja co 0,15 s.
   - polowaA ("co drugi prąd"): zamiast losowania co drugi prąd (parzysty numer), reszta jak wyżej.
   - sprawny80 ("80% prądów"): jak polowa, ale 80% (górna granica ludzkiego szczytu).
   - bierny: nic nie robi. */
const { wspolne } = require('./boty_z10.cjs');
const baza = (wybor) => `(function () {${wspolne}
  var dp = {}, nr = 0, rT = -1, u = 0, hold = false;
  return function (A) {
    var k, c, p;
    for (k = 0; k < A.prady.length; k++) if (!(A.prady[k].id in dp)) { dp[A.prady[k].id] = ${wybor}; nr++; }
    if (A.t - rT >= 0.15) {
      rT = A.t;
      c = cel(A, function (p) { return dp[p.id]; }, function () { return true; }, true);
      for (k = 0; k < A.prady.length; k++) { p = A.prady[k]; if (!p.hit && p.z > A.ZB && p.z < 3.4 && dp[p.id] === false && Math.abs(p.x - c.tx) < 70) c.tx = (c.tx < p.x) ? p.x - 75 : p.x + 75; }   /* pominięty prąd się omija, nie wpada się w niego przypadkiem */
      u = Math.max(-1, Math.min(1, (c.tx - A.bx) / 40));
      hold = A.h > 0.5 && ((c.best && c.best.z < 3.8) || A.s > 0.4);
    }
    return { u: u, hold: hold };
  };
})()`;
module.exports = {
  polowa: baza('A.r() < 0.5'),
  polowaA: baza('(nr % 2) === 0'),
  sprawny80: baza('A.r() < 0.8'),
  bierny: '(function () { return function () { return { u: 0, hold: false }; }; })()'
};
