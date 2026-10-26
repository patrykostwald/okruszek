# Z18: plakietki HUD z pamięci (miękki brzeg shadowBlur liczony raz, nie co klatkę: w rasteryzacji programowej rozmycie jest drogie)
import sys
p = sys.argv[1]
s = open(p, encoding='utf8').read()
old = """  function drawHudPlakietki() {
    var a = hudPlA * hudK, ny = napis ? 118 : 96;
    if (a < 0.01) return;
    ctx.save(); ctx.fillStyle = rgba(HUD_MLEKO, a); ctx.shadowColor = rgba(HUD_MLEKO, a); ctx.shadowBlur = 14;
    rrect(8, 8, 200, ny - 8, 14); ctx.fill();   /* lewa: dystans, kreska, poziom, iskierki (i nazwa krainy, gdy jest) */
    rrect(W - 144, 8, 136, 50, 14); ctx.fill();   /* prawa: wysokość */
    ctx.restore();
  }"""
new = """  var hudPlC = null, hudPlKey = '';
  function drawHudPlakietki() {
    var a = hudPlA * hudK, ny = napis ? 118 : 96, key, x, m = 16;
    if (a < 0.01) return;
    key = Math.round(a * 40) + ':' + ny + ':' + SC + ':' + W;
    if (key !== hudPlKey) {   /* lewa: dystans, kreska, poziom, iskierki (i nazwa krainy, gdy jest); prawa: wysokość; rysowane raz do płótna pamięci */
      hudPlKey = key; if (!hudPlC) hudPlC = document.createElement('canvas');
      hudPlC.width = Math.ceil(W * SC); hudPlC.height = Math.ceil((ny + m) * SC); x = hudPlC.getContext('2d');
      x.setTransform(SC, 0, 0, SC, 0, 0); x.clearRect(0, 0, W, ny + m); x.fillStyle = rgba(HUD_MLEKO, Math.round(a * 40) / 40); x.shadowColor = x.fillStyle; x.shadowBlur = 14;
      x.beginPath(); if (x.roundRect) { x.roundRect(8, 8, 200, ny - 8, 14); x.roundRect(W - 144, 8, 136, 50, 14); } else { x.rect(8, 8, 200, ny - 8); x.rect(W - 144, 8, 136, 50); } x.fill();
    }
    ctx.drawImage(hudPlC, 0, 0, W, hudPlC.height / SC);
  }"""
assert old in s
s = s.replace(old, new, 1)
open(p, 'w', encoding='utf8').write(s)
print('ok')
