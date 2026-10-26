# Z18: HUD czytelny w dzień (P1-4), nazwa krainy pod iskierkami (P1-6), wstęp czytelny (P1-5), bez ciemnych obrysów HUD (P2-5)
import sys
p = sys.argv[1]
s = open(p, encoding='utf8').read()

def rep(old, new, cnt=1):
    global s
    assert old in s, old[:90]
    s = s.replace(old, new, cnt)

# 1. próbkowanie tła pod HUD zamiast stałego welonu
rep("""        var hk = sm((lumOf(PAL.bg) - 120) / 60);
        if (hk > 0.01) { if (!HUDW || HUDW.key !== Math.round(hk * 20)) { HUDW = ctx.createLinearGradient(0, 0, 0, 120); HUDW.addColorStop(0, rgba([58, 66, 108], 0.34 * hk)); HUDW.addColorStop(1, rgba([58, 66, 108], 0)); HUDW.key = Math.round(hk * 20); } ctx.fillStyle = HUDW; ctx.fillRect(0, 0, W, 120); }
        drawHUD();""",
"""        hudProbe(dt); drawHudPlakietki();   /* Z18 (P1-4): tusz HUD z jasności tła pod nim (próbka obrazu), na jasnym niebie mleczna plakietka i ciemny fiolet */
        drawHUD();""")

# 2. funkcje tuszu HUD (przed drawHUD)
rep("""  function drawHUD() {""",
"""  /* ---------- Z18 (P1-4, P2-5): tusz HUD zależny od jasności tła ----------
     Co HUD_PROBE s średnia luminancja względna (WCAG) obrazu w strefach HUD (lewa: dystans, poziom, iskierki, nazwa krainy; prawa: wysokość), zanim HUD zostanie narysowany.
     Ciemne tło (noc): jasny tusz LINE z ciemną poświatą. Jasne tło (dzień, świt, pastelowy start): ciemny fiolet HUD_INK z jasną poświatą i mleczną plakietką,
     której krycie dobiera się tak, by tło pod tekstem miało luminancję >= HUD_LMIN (kontrast tuszu >= 4,5:1). Przełączenie z histerezą (HUD_L_DZ / HUD_L_NOC), płynnie. */
  var HUD_INK = [52, 48, 98], HUD_MLEKO = [250, 248, 255], HUD_PROBE = 0.4, HUD_L_DZ = 0.2, HUD_L_NOC = 0.15, HUD_LMIN = 0.5;
  var hudL = 0.1, hudDz = false, hudK = 0, hudPT = 9, hudPlA = 0;
  function linL(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function hudProbe(dt) {
    var d, i, n = 0, sum = 0, Z = [[14, 10, 150, 104], [W - 146, 10, 134, 50]], z, sx, sy, sw, shh;
    hudPT += dt;
    if (hudPT >= HUD_PROBE) {
      hudPT = 0;
      try {
        for (z = 0; z < Z.length; z++) {
          sx = Math.max(0, Math.round(Z[z][0] * SC)); sy = Math.round(Z[z][1] * SC); sw = Math.round(Z[z][2] * SC); shh = Math.round(Z[z][3] * SC);
          d = ctx.getImageData(sx, sy, sw, shh).data;
          for (i = 0; i < d.length; i += 4 * 7) { sum += 0.2126 * linL(d[i]) + 0.7152 * linL(d[i + 1]) + 0.0722 * linL(d[i + 2]); n++; }
        }
        if (n) hudL = sum / n;
      } catch (e) { hudL = lumOf(PAL.bg) / 255; }
      if (!hudDz && hudL > HUD_L_DZ) hudDz = true; else if (hudDz && hudL < HUD_L_NOC) hudDz = false;
    }
    hudK += ((hudDz ? 1 : 0) - hudK) * Math.min(1, dt * 6);
    if (lockS !== null || paused || hudPT === 0 && dt === 0) hudK = hudDz ? 1 : 0;   /* zrzut, pauza, pierwsza klatka: bez przejścia */
    hudPlA = hudDz ? Math.max(0.16, Math.min(0.6, (HUD_LMIN - hudL) / Math.max(0.2, 0.96 - hudL))) : 0;
  }
  function hudTusz(a) { return rgba(mixc(LINE, HUD_INK, hudK), a); }
  function hudPoswiata(blur) { ctx.shadowColor = hudK > 0.5 ? 'rgba(255,252,255,' + (0.9 * hudK).toFixed(3) + ')' : 'rgba(13,18,36,' + (0.75 * (1 - hudK)).toFixed(3) + ')'; ctx.shadowBlur = blur; }
  function hudObrys(a) { return hudK > 0.5 ? rgba(HUD_INK, a * 0.5 * hudK) : 'rgba(13,18,36,' + (a * (1 - hudK)).toFixed(3) + ')'; }
  function drawHudPlakietki() {
    var a = hudPlA * hudK, ny = napis ? 118 : 96;
    if (a < 0.01) return;
    ctx.save(); ctx.fillStyle = rgba(HUD_MLEKO, a); ctx.shadowColor = rgba(HUD_MLEKO, a); ctx.shadowBlur = 14;
    rrect(8, 8, 162, ny - 8, 14); ctx.fill();   /* lewa: dystans, kreska, poziom, iskierki (i nazwa krainy, gdy jest) */
    rrect(W - 144, 8, 136, 50, 14); ctx.fill();   /* prawa: wysokość */
    ctx.restore();
  }
  function drawHUD() {""")

# 3. drawHUD: tusz zamiast LINE, poświata
rep("""    ctx.save(); ctx.shadowColor = 'rgba(13,18,36,0.75)'; ctx.shadowBlur = 5; ctx.textBaseline = 'alphabetic';
    if (ls) ctx.letterSpacing = '1.4px';
    ctx.font = '600 10px ' + FONT; ctx.fillStyle = rgba(LINE, 0.72);""",
"""    ctx.save(); hudPoswiata(5); ctx.textBaseline = 'alphabetic';
    if (ls) ctx.letterSpacing = '1.4px';
    ctx.font = '600 10px ' + FONT; ctx.fillStyle = hudTusz(hudK > 0.5 ? 0.92 : 0.72);""")
rep("""    ctx.textAlign = 'left'; ctx.fillStyle = rgba(LINE, 0.96); ctx.font = '600 24px ' + FONT;
    var txt = fmtM(dist); ctx.fillText(txt, pad, 51);
    var tw = ctx.measureText(txt).width; ctx.font = '600 13px ' + FONT; ctx.fillStyle = rgba(LINE, 0.8); ctx.fillText('m', pad + tw + 4, 51);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = rgba(LINE, 0.55); ctx.lineWidth = 1.2; rrect(W - pad - bw, 38, bw, 11, 5.5); ctx.stroke();
    ctx.fillStyle = rgba(LINE, 0.92 * bl);""",
"""    ctx.textAlign = 'left'; ctx.fillStyle = hudTusz(0.96); ctx.font = '600 24px ' + FONT;
    var txt = fmtM(dist); ctx.fillText(txt, pad, 51);
    var tw = ctx.measureText(txt).width; ctx.font = '600 13px ' + FONT; ctx.fillStyle = hudTusz(0.85); ctx.fillText('m', pad + tw + 4, 51);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hudTusz(0.55); ctx.lineWidth = 1.2; rrect(W - pad - bw, 38, bw, 11, 5.5); ctx.stroke();
    ctx.fillStyle = hudTusz(0.92 * bl);""")

# 4. pasek poziomu i nazwa
rep("""      ctx.strokeStyle = 'rgba(13,18,36,0.55)'; ctx.lineWidth = 3; rrect(x0 + (k - 1) * (sw + gp), y, sw, hh, 2); ctx.stroke();
      ctx.strokeStyle = rgba(LINE, 0.4); ctx.lineWidth = 1; rrect(x0 + (k - 1) * (sw + gp), y, sw, hh, 2); ctx.stroke();""",
"""      ctx.strokeStyle = hudObrys(0.55); ctx.lineWidth = 3; rrect(x0 + (k - 1) * (sw + gp), y, sw, hh, 2); ctx.stroke();   /* Z18 (P2-5): w dzień obrys tonalny, nie granatowy */
      ctx.strokeStyle = hudTusz(0.4); ctx.lineWidth = 1; rrect(x0 + (k - 1) * (sw + gp), y, sw, hh, 2); ctx.stroke();""")
rep("""    ctx.shadowColor = 'rgba(13,18,36,0.95)'; ctx.shadowBlur = 6;
    if (ls) ctx.letterSpacing = '1.2px';
    ctx.font = '600 10px ' + FONT; ctx.textAlign = 'left'; ctx.fillStyle = lvl === 5 ? hsla(hueFlow() + 40, 90, 74, 1) : rgba(lvl > 0 ? mixc(LINE, LVCOL[lvl], 0.5) : LINE, 0.9);
    ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(13,18,36,0.6)'; ctx.strokeText(nm, xt, y + 7);
    ctx.fillText(nm, xt, y + 7);
    if (cn >= 2) { tw = ctx.measureText(nm).width; if (ls) ctx.letterSpacing = '0px'; ctx.fillStyle = rgba(LINE, 0.75);""",
"""    hudPoswiata(6);
    if (ls) ctx.letterSpacing = '1.2px';
    ctx.font = '600 10px ' + FONT; ctx.textAlign = 'left';
    ctx.fillStyle = hudK > 0.5 ? rgba(mixc(HUD_INK, lvl > 0 ? LVCOL[lvl] : HUD_INK, lvl === 5 ? 0.15 : 0.22), 1) : (lvl === 5 ? hsla(hueFlow() + 40, 90, 74, 1) : rgba(lvl > 0 ? mixc(LINE, LVCOL[lvl], 0.5) : LINE, 0.9));   /* Z18: w dzień ciemny tusz z odcieniem poziomu */
    if (hudK <= 0.5) { ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(13,18,36,0.6)'; ctx.strokeText(nm, xt, y + 7); }
    ctx.fillText(nm, xt, y + 7);
    if (cn >= 2) { tw = ctx.measureText(nm).width; if (ls) ctx.letterSpacing = '0px'; ctx.fillStyle = hudTusz(0.8);""")
# 5. iskierki: obrys tonalny
rep("""      sparkPath(cx, y, r); ctx.strokeStyle = 'rgba(13,18,36,0.55)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = rgba(LINE, 0.42 + 0.2 * p); ctx.lineWidth = 1; ctx.stroke();""",
"""      sparkPath(cx, y, r); ctx.strokeStyle = hudObrys(0.55); ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = hudTusz(0.42 + 0.2 * p); ctx.lineWidth = 1; ctx.stroke();""")
# 6. komunikat poziomu (środek ekranu)
rep("""    txt = LV_MSG[m.lv].toUpperCase(); col = m.lv === 5 ? hsla(hueFlow() + 40, 90, 74, 1).replace(/,[\\d.]+\\)$/, ',' + env.toFixed(3) + ')') : rgba(mixc(LINE, LVCOL[m.lv], 0.6), env);
    ctx.save(); ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(13,18,36,0.8)'; ctx.shadowBlur = 8; if (ls) ctx.letterSpacing = '3px';
    ctx.font = '600 19px ' + FONT; ctx.fillStyle = col; ctx.fillText(txt, W / 2, 142);
    if (ls) ctx.letterSpacing = '0px';
    ctx.shadowBlur = 0; ctx.strokeStyle = rgba(LINE, 0.5 * env);""",
"""    txt = LV_MSG[m.lv].toUpperCase(); col = hudK > 0.5 ? rgba(mixc(HUD_INK, LVCOL[m.lv], m.lv === 5 ? 0.12 : 0.28), env) : (m.lv === 5 ? hsla(hueFlow() + 40, 90, 74, 1).replace(/,[\\d.]+\\)$/, ',' + env.toFixed(3) + ')') : rgba(mixc(LINE, LVCOL[m.lv], 0.6), env));
    ctx.save(); ctx.textAlign = 'center'; hudPoswiata(10); if (ls) ctx.letterSpacing = '3px';
    if (hudK > 0.5) { ctx.font = '600 19px ' + FONT; ctx.fillStyle = rgba(HUD_MLEKO, 0.55 * env); ctx.fillText(txt, W / 2, 142); }   /* Z18: w dzień jasna poświata pod napisem (2 przebiegi) */
    ctx.font = '600 19px ' + FONT; ctx.fillStyle = col; ctx.fillText(txt, W / 2, 142);
    if (ls) ctx.letterSpacing = '0px';
    ctx.shadowBlur = 0; ctx.strokeStyle = hudTusz(0.5 * env);""")
# 7. komunikat sterowania
rep("""    ctx.save(); ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(13,18,36,0.85)'; ctx.shadowBlur = 8; if (ls) ctx.letterSpacing = '0.5px';
    ctx.font = '600 14px ' + FONT; ctx.fillStyle = rgba(LINE, 0.95 * env);""",
"""    ctx.save(); ctx.textAlign = 'center'; hudPoswiata(8); if (ls) ctx.letterSpacing = '0.5px';
    ctx.font = '600 14px ' + FONT; ctx.fillStyle = hudTusz(0.95 * env);""")
# 8. kreska do bramy
rep("""    ctx.strokeStyle = 'rgba(13,18,36,0.5)'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke();
    ctx.strokeStyle = rgba(LINE, 0.28); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke();
    if (f > 0.005) { ctx.strokeStyle = rgba(LINE, 0.9);""",
"""    ctx.strokeStyle = hudObrys(0.5); ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke();
    ctx.strokeStyle = hudTusz(0.28); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke();
    if (f > 0.005) { ctx.strokeStyle = hudTusz(0.9);""")
# 9. nazwa krainy: pod iskierkami (P1-6), tusz HUD
rep("""    ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.shadowColor = 'rgba(13,18,36,0.9)'; ctx.shadowBlur = 6; if (ls) ctx.letterSpacing = '0.3px';
    ctx.font = 'italic 400 16px Georgia, "Times New Roman", serif'; ctx.fillStyle = rgba(LINE, 0.96 * env); ctx.fillText(napis.txt, 18, 96, 232);""",
"""    ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; hudPoswiata(6); if (ls) ctx.letterSpacing = '0.3px';
    ctx.font = 'italic 400 16px Georgia, "Times New Roman", serif'; ctx.fillStyle = hudTusz(0.96 * env); ctx.fillText(napis.txt, 18, 111, 232);   /* Z18 (P1-6): pod iskierkami (y 75-89), nie na nich */""")

# 10. wstęp: ciemny tusz z jasną poświatą (tło wstępu jest jasne, 15.8), napis pominięcia >= 3:1
rep("""      ctx.font = '400 24px Georgia, "Times New Roman", serif'; ctx.fillStyle = rgba(LINE, env); ctx.shadowColor = 'rgba(13,18,36,0.9)'; ctx.shadowBlur = 10;""",
"""      ctx.font = '400 24px Georgia, "Times New Roman", serif'; ctx.fillStyle = rgba(HUD_INK, env); ctx.shadowColor = 'rgba(255,252,255,0.85)'; ctx.shadowBlur = 10;   /* Z18 (P1-5): ciemny fiolet na jasnym wstępie (dawniej biały: ok. 1,5:1) */""")
rep("""      ctx.font = '400 12px ' + FONT; ctx.fillStyle = rgba(LINE, 0.5 * sm((it - 1.4) / 0.6)); ctx.fillText(p, W / 2, H - 34);""",
"""      ctx.font = '600 13px ' + FONT; ctx.shadowColor = 'rgba(255,252,255,0.8)'; ctx.shadowBlur = 6; ctx.fillStyle = rgba(HUD_INK, 0.85 * sm((it - 1.4) / 0.6)); ctx.fillText(p, W / 2, H - 34); ctx.shadowBlur = 0;   /* Z18: >= 3:1 */""")
open(p, 'w', encoding='utf8').write(s)
print('ok')
