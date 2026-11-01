# Z18 (P1-7): jasne, pastelowe panele (start, pauza, koniec, prywatność, przycisk sterowania) z ciemnym fioletowym tuszem zamiast granatu 93%;
# (P1-8) opis trybu 2 bez ucięcia przy 360 px; (P2-6) pasy boczne w kolorze nieba; manifest i theme-color jasne.
import sys, re
p = sys.argv[1]
s = open(p, encoding='utf8').read()
a = s.index('<style>'); b = s.index('</style>')
css = s[a:b]
css0 = css
css = css.replace('background:#ecf0f8; color:#0d1224;', 'background:var(--tusz); color:var(--tlo);')
css = css.replace('#ecf0f8', 'var(--tusz)')
css = css.replace('rgba(236,240,248,', 'rgba(var(--tusz-rgb),')
css = css.replace('rgba(13,18,36,', 'rgba(var(--tlo-rgb),')
css = css.replace('#0d1224', 'var(--tlo)')
# tło strony (pasy obok pionowej gry) w kolorze nieba
css = css.replace('html, body { margin:0; height:100%; background:var(--tlo);', 'html, body { margin:0; height:100%; background:var(--niebo);')
# krycie tekstów >= 0,75 (kontrast >= 4,5:1 na mlecznym tle)
for o in ['.6', '.65', '.7', '.55']:
    css = re.sub(r'opacity:' + re.escape(o) + r'([;\s}])', r'opacity:.78\1', css)
# zmienne na początku
css = css.replace('<style>', """<style>
  /* Z18 (P1-7, 15.8): panele jasne i pastelowe (mleczna lawenda) z ciemnym fioletowym tuszem; dawniej granat 93% (rgba(13,18,36,.93)) po jasnym wstępie.
     --tusz na --tlo ok. 12,5:1; teksty pomocnicze z kryciem >= 0,75 (>= 5,9:1). --niebo: tło strony obok pionowej gry (pasy boczne w kolorze nieba). */
  :root { --tusz:#2a2658; --tusz-rgb:42,38,88; --tlo:#f5f2fb; --tlo-rgb:245,242,251; --niebo:#cdd5ee; }""", 1)
assert css != css0
s = s[:a] + css + s[b:]
# ikony trybów: kolor z tuszu przycisku
s = s.replace('stroke="#ecf0f8"', 'stroke="currentColor"')
s = s.replace('<meta name="theme-color" content="#0d1224">', '<meta name="theme-color" content="#cdd5ee">')
# pauza rysowana na płótnie: mleczna mgiełka i ciemny tusz
old = """      ctx.fillStyle = 'rgba(13,18,36,0.6)'; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.fillStyle = rgba(LINE, 0.95); ctx.font = '600 30px ' + FONT; ctx.fillText('Pauza', W / 2, H * 0.42);
      ctx.font = '400 14px ' + FONT; ctx.fillStyle = rgba(LINE, 0.7); ctx.fillText('Dotknij ekranu albo naciśnij P', W / 2, H * 0.42 + 30); ctx.textAlign = 'left';"""
new = """      ctx.fillStyle = 'rgba(245,242,251,0.72)'; ctx.fillRect(0, 0, W, H);   /* Z18 (P1-7): pauza jasna, nie granatowa */
      ctx.textAlign = 'center'; ctx.fillStyle = rgba(HUD_INK, 0.96); ctx.font = '600 30px ' + FONT; ctx.fillText('Pauza', W / 2, H * 0.42);
      ctx.font = '400 14px ' + FONT; ctx.fillStyle = rgba(HUD_INK, 0.85); ctx.fillText('Dotknij ekranu albo naciśnij P', W / 2, H * 0.42 + 30); ctx.textAlign = 'left';"""
assert old in s
s = s.replace(old, new, 1)
open(p, 'w', encoding='utf8').write(s)

# manifest
m = open('manifest.webmanifest', encoding='utf8').read()
m = m.replace('"background_color": "#0d1224"', '"background_color": "#cdd5ee"').replace('"theme_color": "#0d1224"', '"theme_color": "#cdd5ee"')
open('manifest.webmanifest', 'w', encoding='utf8').write(m)

# P1-8: krótszy opis trybu 2 w torze (teksty.js)
t = open('teksty.js', encoding='utf8').read()
old = "'Stuknij lewym albo prawym: skrzydło w tę stronę i w górę. Oba naraz: mocno w górę. Przytrzymaj oba: nurkuj.'"
assert old in t
t = t.replace(old, "'Lewym albo prawym: skrzydło w tę stronę i w górę. Oba naraz: mocno w górę. Przytrzymaj oba: nurkuj.'")
open('teksty.js', 'w', encoding='utf8').write(t)
print('ok')
