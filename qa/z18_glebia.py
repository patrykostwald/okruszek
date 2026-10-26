# Z18 (P0-4): czytelność przeszkód w chwili decyzji: głębokość widoku plastrów, niższy punkt zbiegu, mocniejsza zapowiedź (cień i poświata od 2 s)
import sys
p = sys.argv[1]
s = open(p, encoding='utf8').read()

def rep(old, new, cnt=1):
    global s
    assert old in s, old[:100]
    s = s.replace(old, new, cnt)

rep("""    CELL_SX: 120, ROW_Y0: 0.46, ROW_Y1: 0.74, VP_Y: 0.27,""", """    CELL_SX: 120, ROW_Y0: 0.46, ROW_Y1: 0.74, VP_Y: 0.32,   /* Z18 (P0-4): punkt zbiegu niżej (było 0,27): nadlatujące komórki bliżej wiersza Okruszka */""")
rep("""Z_SPAWN: 6.2, DZ_MIN: 0.9, T_GAP: 0.85, FADE_IN: 0.3, OSTRZEZ: 1.5,""", """Z_SPAWN: 6.2, DZ_MIN: 0.9, T_GAP: 0.85, FADE_IN: 0.45, OSTRZEZ: 2.0,""")

# głębokość widoku
rep("""  function torZSpawn() {""", """  /* Z18 (P0-4): głębokość WIDOKU plastra. Logika (kontakt, zapowiedź) liczy prawdziwe z; rysunek bierze z' = ZB + (z - ZB) * k, k = ZV_K / v^0,75
     (v = wygładzona prędkość świata): plaster 1,5 s przed kontaktem ma skalę ok. 0,55-0,6 (dawniej 0,33), komórki sąsiednie dzieli ok. 70 px (dawniej 38),
     a przy dużej prędkości nadlatuje odrobinę szybciej (poczucie pędu zostaje). */
  function torZV(z) { return z <= G.ZB ? z : G.ZB + (z - G.ZB) * TOR.ZV_K / Math.pow(Math.max(0.5, torZvSp), 0.75); }
  function torZSpawn() {""")
rep("""KARA_P: 0.35, KARA_DNO: 0.8, SINK_RAMP: 0.45, SINK_RAMP_T: 300, ATAK_LOCK: 0.6, ZV_K: 0.42,""", """KARA_P: 0.35, KARA_DNO: 0.8, SINK_RAMP: 0.45, SINK_RAMP_T: 300, ATAK_LOCK: 0.6, ZV_K: 0.31,""")
# wygładzanie prędkości widoku w torSim
rep("""    sp = TOR.V0 + TOR.V1 * s; curSpeed = sp;
    torSwiat(dt, sp, true);""", """    sp = TOR.V0 + TOR.V1 * s; curSpeed = sp; torZvSp += (sp - torZvSp) * Math.min(1, dt / TOR.ZV_TAU);
    torSwiat(dt, sp, true);""")
# rysowanie plastra
rep("""  function drawTorPlaster(pl, front) {
    var z = pl.z, sc = 1 / z, tt = cl((z - NEAR) / (FAR - NEAR)), fade = sm(pl.age / TOR.FADE_IN) * sm((z - 0.2) / 0.35) * sm((TOR.Z_SPAWN + 0.6 - z) / 0.6) * (front ? 0.45 : 1), amt = obAmt(z),""",
"""  function drawTorPlaster(pl, front) {
    var z = torZV(pl.z), sc = 1 / z, tt = cl((z - NEAR) / (FAR - NEAR)), fade = sm(pl.age / TOR.FADE_IN) * sm((z - 0.2) / 0.35) * (front ? 0.45 : 1), amt = obAmt(z),""")
rep("""chS = torCH / G.ZB, e0 = torRowSY(0) - chS / 2, eta = (z - G.ZB) / Math.max(0.3, curSpeed), pu = reduce ? 0.6 : 0.5 + 0.5 * Math.sin(t * 9), cx, cy, hw, hh;
    if (fade < 0.02) return;""", """chS = torCH / G.ZB, e0 = torRowSY(0) - chS / 2, eta = (pl.z - G.ZB) / Math.max(0.3, curSpeed), pu = reduce ? 0.6 : 0.5 + 0.5 * Math.sin(t * 9), cx, cy, hw, hh;
    if (fade < 0.02) return;""")
rep("""    eta = (z - G.ZB) / Math.max(0.3, curSpeed);
    switch (ch) {""", """    eta = (pl.z - G.ZB) / Math.max(0.3, curSpeed);   /* Z18: czas do kontaktu z prawdziwej głębokości (z to głębokość widoku) */
    switch (ch) {""")
# kolejność rysowania z resztą świata: głębokość widoku
rep("""  function torItems(items) { var k; for (k = 0; k < torPl.length; k++) if (torPl[k].z >= G.ZB) items.push({ typ: 'torPl', pl: torPl[k], z: torPl[k].z });""",
"""  function torItems(items) { var k; for (k = 0; k < torPl.length; k++) if (torPl[k].z >= G.ZB) items.push({ typ: 'torPl', pl: torPl[k], z: torZV(torPl[k].z) });""")
# mocniejsza zapowiedź: cień przeszkody na chmurach pod jej komórką (od OSTRZEZ s) i poświata
rep("""  var CIEN17 = { Y0: 0.7, Y1: 0.84, RX: 42, RY: 11, A: 0.42, A_PRZESZK: 0.5, A_WIATR: 0.55, A_DROGA: 0.1 };""",
"""  var CIEN17 = { Y0: 0.7, Y1: 0.84, RX: 42, RY: 11, A: 0.42, A_PRZESZK: 0.72, A_WIATR: 0.6, A_DROGA: 0.1 };   /* Z18: cień przeszkody mocniejszy (0,5 -> 0,72) */""")
# hak gdzie(): położenie rysunku (głębokość widoku) i skala
rep("""out.push({ typ: TOR_NAZWY[ch] || ch, znak: ch, kom: [c, r], plaster: pl.id, z: pl.z, eta: (pl.z - G.ZB) / Math.max(0.3, curSpeed), ex: torSX(c, pl.z), ey: torSY(r, pl.z), faza: pl.z > G.ZB ? 'zapowiedz' : 'minela', wiatr: !!TOR_WIATRY[ch] });""",
"""out.push({ typ: TOR_NAZWY[ch] || ch, znak: ch, kom: [c, r], plaster: pl.id, z: pl.z, zv: torZV(pl.z), skala: G.ZB / torZV(pl.z), eta: (pl.z - G.ZB) / Math.max(0.3, curSpeed), ex: torSX(c, torZV(pl.z)), ey: torSY(r, torZV(pl.z)), faza: pl.z > G.ZB ? 'zapowiedz' : 'minela', wiatr: !!TOR_WIATRY[ch] });""")
open(p, 'w', encoding='utf8').write(s)
print('ok')
