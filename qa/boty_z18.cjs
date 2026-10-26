/* Z18: boty toru (deterministyczne: własny generator liczb z ziarnem, bez Math.random). Źródła jako tekst: przeglądarka dostaje je przez eval w torSymuluj.
   BOT(P) zwraca funkcję bota; P = { seed, pWiatr, unik, reakcja, precyzja, hawkNotice, hr0, hr1, nurek }.
   pWiatr: szansa, że w danym plastrze próbuje złapać wiatr; unik: szansa, że omija przeszkodę plastra; reakcja: od ilu s przed kontaktem zaczyna działać;
   precyzja: szansa, że przed wiatrem w swojej komórce celuje w środek wstęgi (machnięcie we właściwej chwili; model jak gracz, który patrzy na wstęgę);
   hawkNotice: szansa, że zauważy atak drapieżnika; hr0..hr1: czas reakcji (s) liczony od chwili, gdy drapieżnik namierzy komórkę na stałe (A.hawLock);
   nurek: nurkuje, gdy łańcuch >= nurek (0 = nigdy). */
const BOT = `(function (P) {
  var a = ((P.seed || 1) * 2654435761) >>> 0;
  function rnd() { a |= 0; a = a + 0x6D2B79F5 | 0; var q = Math.imul(a ^ a >>> 15, 1 | a); q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q; return ((q ^ q >>> 14) >>> 0) / 4294967296; }
  var nurDo = -9, last = -9, cel = null, plId = -1, chceW = true, chceU = true, chceP = true, hawT = -1, hawN = false, hawR = 0, lastFlap = -9, ruszyl = false;
  function wolna(ch) { return ch === '.' || 'UuDF<>ZXo'.indexOf(ch) >= 0; }
  function wiatr(ch) { return 'UuDZ<>XF'.indexOf(ch) >= 0; }
  function off(A, k, T, p0, l0, hold) {   /* przewidywane odchylenie od środka wiersza po T s (dodatnie = poniżej środka) */
    var rate = A.opad || (1 / 3.6), p = Math.min(1, p0 + T * rate), lf = Math.max(0, l0 - Math.max(0, T - hold) * 1.6), ko = k.koszt || 2;
    return p * (A.SINK_SHOW || 0.3) - (k.wiersz > 0 ? lf / ko * (A.LIFT_SHOW || 0.5) : 0);
  }
  return function (A) {
    var k = A.kom, out = {}, pl = null, i, c, r, best = null, sc, ch, g, ID = (A.IDEAL || 0.24), lockT = (A.hawLock !== undefined ? A.hawLock : 1.0), hold = Math.max(0, 0.75 - (A.t - lastFlap));
    for (i = 0; i < A.plastry.length; i++) if (!/^[.]+$/.test(A.plastry[i].g.join(''))) { pl = A.plastry[i]; break; }
    if (A.haw && A.haw.cel) {   /* atak drapieżnika: nowy atak = licznik czasu celu zaczyna się od nowa */
      if (A.haw.cel[2] < hawT || hawT < 0) { hawN = rnd() < (P.hawkNotice === undefined ? 1 : P.hawkNotice); hawR = (P.hr0 || 0.1) + rnd() * ((P.hr1 || 0.1) - (P.hr0 || 0.1)); cel = null; }
      hawT = A.haw.cel[2];
      if (hawN && hawT >= lockT + hawR && A.haw.cel[0] === k.kol && A.haw.cel[1] === k.wiersz && A.t - last > 0.1) {
        var dc0 = k.kol < A.COLS - 1 ? 1 : -1;
        if (pl && pl.eta < 1.2) { var gL = k.kol > 0 ? pl.g[k.wiersz].charAt(k.kol - 1) : '#', gP = k.kol < A.COLS - 1 ? pl.g[k.wiersz].charAt(k.kol + 1) : '#'; if (!wolna(gP) && wolna(gL)) dc0 = -1; if (!wolna(gL) && wolna(gP)) dc0 = 1; }
        out.ruch = [dc0, 0]; last = A.t; return out;
      }
    } else hawT = -1;
    if (pl && pl.eta < (P.reakcja || 9)) {
      g = pl.g;
      if (pl.id !== plId) { plId = pl.id; cel = null; chceW = rnd() < (P.pWiatr === undefined ? 1 : P.pWiatr); chceU = rnd() < (P.unik === undefined ? 1 : P.unik); chceP = rnd() < (P.precyzja || 0); ruszyl = false; }
      if (cel && hawN && A.haw && A.haw.cel && hawT >= lockT && cel.c === A.haw.cel[0] && cel.r === A.haw.cel[1]) cel = null;
      if (!cel) {
        for (r = 0; r < A.ROWS; r++) for (c = 0; c < A.COLS; c++) {
          ch = g[r].charAt(c);
          if (!wolna(ch) && chceU) continue;
          if (hawN && A.haw && A.haw.cel && hawT >= lockT && c === A.haw.cel[0] && r === A.haw.cel[1]) continue;   /* nie wraca do komórki namierzonej przez drapieżnika */
          if (ch === 'F' && !(c === (A.COLS - 1) / 2 && r === (A.ROWS - 1) / 2)) continue;
          sc = (wiatr(ch) && chceW ? 10 : (ch === 'o' ? 4 : 0)) - Math.abs(c - k.kol) * 1.5 - Math.max(0, k.wiersz - r) * 2.5 - Math.max(0, r - k.wiersz) * 0.8 - (r === A.ROWS - 1 && !wiatr(ch) ? 1.5 : 0);
          if (!best || sc > best.sc) best = { c: c, r: r, sc: sc, w: wiatr(ch) };
        }
        cel = best;
      }
      if (cel && A.t - last > 0.12) {
        var dc = cel.c > k.kol ? 1 : (cel.c < k.kol ? -1 : 0), dr = cel.r > k.wiersz ? 1 : 0;
        if ((dc || dr) && hawN && A.haw && A.haw.cel && hawT >= lockT && k.kol + dc === A.haw.cel[0] && k.wiersz + dr === A.haw.cel[1]) { dc = 0; dr = 0; }   /* nie wchodzi pod drapieżnika */
        if (dc || dr) { out.ruch = [dc, dr]; last = A.t; ruszyl = true; }
        else if (cel.r < k.wiersz && pl.eta > 0.25) { if (A.t - last > 0.22) { out.stuk = 0; last = A.t; lastFlap = A.t; } }
        else if (cel.w && chceP && cel.r === k.wiersz && cel.c === k.kol && pl.eta > 0.05 && pl.eta < 1.6 && !(k.wiersz >= A.ROWS - 1 && k.p > 0.7)) {   /* precyzja: w środek wstęgi */
          var o0 = off(A, k, pl.eta, k.p, k.wzlot, hold), o1 = off(A, k, pl.eta, Math.max(0, k.p - 0.4), k.wzlot + 1, 0.75);
          var bezpieczne = !(k.wiersz > 0 && k.wzlot + 1 >= (k.koszt || 2) - 1e-6 && !A.sufit);
          if (Math.abs(o0) > ID * 0.6 && Math.abs(o1) < Math.abs(o0) - 0.01 && bezpieczne && A.t - lastFlap > 0.2) { out.stuk = 0; last = A.t; lastFlap = A.t; }
          return out;
        }
      }
    }
    var dno = k.wiersz >= A.ROWS - 1 && (!P.oszczedny || k.p > 0.45 || !(pl && pl.eta < 1.6));   /* oszczędny (bot idealny): przed wiatrem na dnie nie macha bez potrzeby (wzlot wynosi ponad środek wstęgi) */
    if (!out.ruch && out.stuk === undefined && (dno || k.p > 0.55) && A.t - last > 0.24) {   /* trzymaj wysokość rytmem */
      var tgt = pl ? pl.g[Math.max(0, k.wiersz - 1)].charAt(k.kol) : '.';
      if (!pl || pl.eta > 0.6 || wolna(tgt)) { out.stuk = 0; last = A.t; lastFlap = A.t; }
    }
    if (P.nurek) {   /* nurek: po długim łańcuchu (>= nurek albo 5 w 12 s) nurkuje ok. 2,4 s, żeby przekroczyć HY_S na HY_HOLD s (L5); przerywa tuż nad morzem chmur */
      if ((A.lancuch >= P.nurek || A.w12 >= 5) && A.t > nurDo + 1.5) nurDo = A.t + 2.4;
      if (A.t < nurDo && !(k.wiersz >= A.ROWS - 1 && k.p > 0.8)) { out.nurkuj = true; delete out.stuk; }
    }
    return out;
  };
})`;
const LOSOWY = `(function (seed) { var a = (seed * 2654435761) >>> 0; function rnd() { a |= 0; a = a + 0x6D2B79F5 | 0; var q = Math.imul(a ^ a >>> 15, 1 | a); q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q; return ((q ^ q >>> 14) >>> 0) / 4294967296; }
  var nast = 0; return function (A) { if (A.t < nast) return {}; nast = A.t + 0.35 + rnd() * 0.5; var q = Math.floor(rnd() * 10); if (q < 8) { var D = [[1,0],[-1,0],[0,1],[1,1],[-1,1],[0,0],[1,0],[-1,0]][q]; if (q === 5) return { stuk: 0 }; return { ruch: D }; } if (q === 8) return { stuk: 0 }; return { nurkuj: true }; }; })`;
const STUKACZ = `(function () { var nast = 0; return function (A) { if (A.t < nast) return {}; nast = A.t + 0.7; return { stuk: 0 }; }; })`;
/* profile botów (seed dokładany przy każdym biegu) */
const PROFILE = {
  idealny: { pWiatr: 1, unik: 1, reakcja: 9, precyzja: 1, hawkNotice: 1, hr0: 0.1, hr1: 0.15, oszczedny: true },
  b70: { pWiatr: 0.7, unik: 0.95, reakcja: 1.4, precyzja: 0, hawkNotice: 0.9, hr0: 0.25, hr1: 0.75 },
  b50: { pWiatr: 0.5, unik: 0.85, reakcja: 1.2, precyzja: 0, hawkNotice: 0.8, hr0: 0.3, hr1: 0.9 },
  nurek: { pWiatr: 1, unik: 1, reakcja: 9, precyzja: 1, hawkNotice: 1, hr0: 0.1, hr1: 0.15, oszczedny: true, nurek: 4 }
};
function zrodlo(nazwa, seed) {
  if (nazwa === 'losowy') return LOSOWY + '(' + seed + ')';
  if (nazwa === 'stukacz') return STUKACZ + '()';
  if (nazwa === 'bierny') return 'null';
  return BOT + '(' + JSON.stringify(Object.assign({ seed: seed }, PROFILE[nazwa])) + ')';
}
module.exports = { BOT, LOSOWY, STUKACZ, PROFILE, zrodlo };
