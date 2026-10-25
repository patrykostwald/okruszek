# Okruszek (nazwa robocza): projekt gry v1

Stan: projekt zamknięty na Fable 25.10.2026 ok. 03:40. Decyzje właściciela wpisane; trzy jeszcze otwarte (sekcja 9).
Właściciel: Patryk (iapply sp. z o.o.). Operator publiczny: iapply. Nigdy nazwisko właściciela na stronie.

## 1. Jedno zdanie
Malutki, przeuroczy ptaszek wleciał za wysoko i zgubił się wśród chmur; lecisz za nim w głąb ekranu przez kulisy chmur,
a im szybciej leci, tym więcej koloru wraca na świat; zwalnia, a świat gaśnie do białych kresek.

## 2. Co jest stałe (decyzje właściciela, nie negocjować)
- Widok zza pleców, lot w głąb ekranu. NIE z boku.
- Chmury jak kulisy teatru: warstwa za warstwą, każda rośnie przy zbliżaniu i zsuwa się na bok przy skręcie.
- Awatar: tylko ptaszek. Bez samolotu (taka gra już istnieje), bez drugiej formy (kulka, łódka itp. odpadają).
- Ptaszek musi być przeuroczy: gracz ma się martwić, że się zagubił. Jedyny stały kolor na ekranie przy zerowej prędkości: czerwony szalik.
- Kolor: pojawia się stopniowo z prędkością; PEŁNY kolor dopiero przy maksymalnej prędkości (krzywa e = s^2,2; warstwy dostają kolor od tyłu do przodu z progami).
- Przeszkadzajki: większe ptaki; czasem drapieżnik, przed którym trzeba uciec. Przyspieszajki: prądy powietrzne.
- Chmury rysowane ładnie: kłębiaste kumulusy z płatów (duże, średnie, drobne), płaska lekko falująca podstawa, zaokrąglone końce, cień przy podstawie; bez prostych boków.
- Jeden kciuk, telefon w pionie, bez przechyłu, bez drążka. Zasady wspólne gier: Desktop\projekty\raporty\PRZEKAZANIE-25-10-KOCILAPKI.md.
- Nigdy loot boxy, waluta, reklamy. Bez kopii 1:1 referencji (21st.dev, northgarden, dappled, refero, Behance): tylko technika i nastrój, własny kod i rysunek.

## 3. Historia (ZATWIERDZONA przez właściciela 25.10: „Gdzie śpi słońce”)
„Gdzie śpi słońce”: Okruszek chciał zobaczyć, gdzie słońce chodzi spać, i poleciał za nim za wysoko. Goni zachód: im szybciej, tym więcej
słońca zostaje na niebie; zwalnia, a noc go dogania. Koniec biegu: zasypia na chmurce („Okruszek zasnął. Przeleciał 1 240 m. Słońce obiecało wrócić rano.”).
Intro jak u northgarden: cisza, sam kontur, 3 krótkie zdania, Okruszek wlatuje w kadr, kolor budzi się z pierwszym prądem.

## 4. Pętla gry (30 sekund)
1. Lecisz z prędkością podstawową; świat w kreskach, szalik czerwony.
2. Widzisz prąd powietrzny (delikatne wstęgi w kulisie). Skręcasz kciukiem, wlatujesz: skok prędkości i wysokości, kolor skacze, „fiu”.
3. Przytrzymujesz: Okruszek składa skrzydełka i nurkuje: prędkość rośnie, kolor rośnie, wysokość spada.
4. Puszczasz: macha skrzydełkami, prędkość wraca do podstawowej, wysokość powoli rośnie, kolor gaśnie.
5. Omijasz większe ptaki i chmury deszczowe; co jakiś czas jastrząb: uciekasz prędkością (prądy + nurkowanie) albo chowasz się w gęstej chmurze (traci trop, ale mokro: kolor gaśnie).
6. Jeśli opadniesz w morze chmur pod sobą: miękkie lądowanie, koniec biegu, wynik w metrach. Bez ekranu porażki.
Satysfakcja: rytm „prąd, nurkowanie, prąd”; prędkość to zasób (wysokość), kolor to nagroda; drapieżnik daje dreszcz, chmura daje wybór.

## 5a. Drugi tryb sterowania: dwa kciuki jak skrzydła (decyzja właściciela 25.10, obok jednego kciuka)
Jeden kciuk (sekcja 5) zostaje domyślny. Dwa kciuki to tryb wybierany w menu (zapamiętany w localStorage dopiero w Z5; w Z2b przełącznik przez ?sterowanie=2 i klawisz T).
- Ekran dzieli się na lewą i prawą połowę. Lewy kciuk w dół (przytrzymanie w lewej połowie) = lewe skrzydło złożone, skręt w lewo. Prawy = skręt w prawo.
- Oba kciuki w dół = oba skrzydła złożone = nurkowanie (prędkość i kolor rosną, wysokość spada). Oba puszczone = machanie, jak w trybie jednego kciuka.
- Opcjonalna umiejętność: szybkie stukanie na przemian lewy-prawy daje krótki przyrost wysokości (rytm skrzydłami); wygaszany, żeby nie dało się go spamować.
- Ptaszek animuje skrzydła zgodnie z kciukami (lewe skrzydło składa się, gdy lewy kciuk jest w dół).
- Kciuki w dolnych rogach nie zasłaniają kulis (tam jest morze chmur). Ryzyka: brak gry jedną ręką (dlatego tryb zapasowy), ciasne rogi na małych telefonach, mniejsza precyzja skrętu; stałe do nastrojenia po teście właściciela na telefonie.

## 5. Sterowanie (telefon pion 390 px, też mysz)
- Przesunięcie palca w bok (dowolne miejsce ekranu): skręt; kamera idzie za ptaszkiem, kulisy rozjeżdżają się z paralaksą.
- Przytrzymanie: nurkowanie. Puszczenie: machanie. Stuknięcie bez przytrzymania: nic (albo krótki „ćwir”).
- Każdy palec przechwytywany `setPointerCapture`, sprzątanie `pointerup/cancel` na oknie (lekcja z Kociłapek: „duch palca”).
- Mysz: ruch = skręt, LPM = nurkowanie. Klawiatura: strzałki/A-D skręt, spacja nurkowanie, P/Esc pauza.

## 6. Świat i warstwy (od tyłu do przodu)
niebo (gradient z ziarnem) → słońce (poświata radialna rosnąca z prędkością) → gwiazdy (gasną z kolorem) → chmury wysokie (faliste kontury, wolny przesuw)
→ kulisy chmur z = 8,5 … 0,55 (9 warstw; próbka `probki/probka-kulisy.js`) → morze chmur pod spodem (3 pasy, dryf) → przeszkody i prądy w kulisach → Okruszek.
Projekcja: skala = 1/z, x_ekranu = W/2 + (x_świata - camX·(1-tt·0,6))·skala, y = horyzont + y_świata·skala. Warstwa po minięciu kamery wraca na koniec z nowymi chmurami.
Biomy v1: zmierzch (start), noc z gwiazdami (po ~1 km). Świt i inne: v2.

## 7. Przeszkody, prądy, zdarzenia (v1)
- Prąd powietrzny: wstęga 3-5 linii w kulisie; wlot = +prędkość, +wysokość; częstość co 4-7 s; na starcie co 3 s (nauka).
- Większy ptak (gęś/wrona): leci w poprzek kulisy; kontakt = wirowanie 1 s, -prędkość, kilka piórek.
- Chmura deszczowa: ciemniejsza, kreski deszczu; przelot = mokre piórka 5 s: wolniej, kolor gaśnie szybciej.
- Jastrząb: od 2. minuty, co ~90 s, zapowiedź cieniem i dźwiękiem 2 s wcześniej; 10 s pościgu; ucieczka = utrzymać wysoką prędkość albo wlecieć w gęstą chmurę.
  Złapanie = KONIEC BIEGU (decyzja właściciela 25.10): jastrząb łapie Okruszka, ekran końca łagodny (wynik w metrach, „Uciekł jastrzębiowi o włos” nie dotyczy; tekst: „Jastrząb był szybszy. Okruszek wraca jutro.”), bez makabry, bez krwi, ptaszek odlatuje cały w cut-scenie 1 s.
- Harmonogram, nie czysta losowość (lekcja Seby): zmiana biomu co ~1 km, zdarzenia z listy.
- v2 (nie w v1): zgubione rzeczy (balon, latawiec), klucz gęsi (autostop), sowa, drzemka na chmurce, pióra układające mapę do domu, kampania.

## 8. Wygląd
Kierunek „Zmierzch nad chmurami”: paleta własna #141B3A granat, #4A3566 fiolet, #F08A4B żar, #FFC9A0 brzoskwinia, #9FB3D1 mgła; kreska konturu #ECF0F8.
Przy prędkości 0: wszystko konturem (białe kreski na granacie), gwiazdy, słaba poświata słońca, czerwony szalik. Kolor wchodzi od tyłu do przodu:
niebo i słońce od 0,2; dalekie kulisy od 0,35; bliskie od 0,55; smugi prędkości od 0,7; pełnia dopiero przy 1,0.
Ptaszek: okrągły, puchaty, małe skrzydełka trzepoczą szybko, główka rozgląda się (zagubienie), czerwony szalik powiewa ku widzowi. Finalny rysunek przez panel designu (laik x3).
Chmury: funkcja `makeCloud`/`drawCloud` z próbki (płaty 3 poziomy, podstawa, cień); w grze pula 14 chmur pre-renderowanych w 3 wersjach (kontur, kolor, kolor zamglony) dla wydajności.
Dźwięk v1: jedna pętla (wiatr i 3-4 nuty), „fiu” przy prądzie, szum nurkowania, ćwir przy starcie, cichy „och” przy strąceniu; próbki CC0 z źródłami w `dzwieki/ZRODLA.md`. Nigdy nie przerabiać całej muzyki naraz (lekcja z Kociłapek).

## 9. Decyzje właściciela z 25.10.2026 (zamknięte)
1. Historia: „Gdzie śpi słońce”.
2. Imię: Okruszek (zostaje).
3. Jastrząb: złapanie KOŃCZY bieg (nie strąca).
Teksty historii w jednym pliku `teksty.js`, łatwe do podmiany. Brak otwartych decyzji blokujących Z1-Z3.

## 10. Technika i jakość
- Jeden plik `index.html` + `dzwieki/` + `ikona-*.png` + `manifest.webmanifest` + `sw.js` (klocki z Kociłapek: service worker network-first z samoaktualizacją, liczniki Worker+D1, panel za Basic Auth, regulamin i prywatność iapply).
- Canvas 2D; DPR 1-1,5; pauza przy ukryciu karty; automatyczne obniżenie rozdzielczości przy <50 klatek; cel: ≥55 klatek przez 60 s na średnim Androidzie.
- Hak testowy `?test` → `window.__okruszek` (czas, prędkość, wysokość, dystans, kolizje, wymuszenie zdarzenia) dla bota Playwright; pre-flight `preflight.cjs` (składnia, start bez błędów konsoli, wersja cache).
- Podgląd dla właściciela: zbudujmi.com/podglad/okruszek-<id>/ z noindex (jak Kociłapki), potem własna domena/ścieżka po decyzji.
- Prawnik przed publikacją: nazwa, teksty, regulamin; żadnych cudzych assetów.

## 11. Pliki
- Próbki: `probki/probka-kulisy.js` + `probki/kulisy.html` (widok, chmury, ptaszek roboczy), `probki/probka-predkosc.js` (pierwsza próbka z boku, tylko dla idei koloru).
- Artefakty: próbka https://claude.ai/artifact/We6hFEfm4vLQApE8vf9WoG ; opcje konsylium (jeszcze z samolotem) https://claude.ai/artifact/CFUJULtnYEFoubaXBX3BMi
- Zapis głosów konsylium: `Desktop\projekty\raporty\SAMOLOCIK-KONSYLIUM-25-10.md`. Zlecenia: `ZLECENIA.md` obok.

## 12. Zmiany właściciela 25.10 (rano): poziomy prędkości, etapy koloru, doba w tle, więcej przeszkód
Cytat: „musisz zwiększyć te levele do maksymalnej prędkości, to musi być trudno całkiem zdobyć; rysowanie piękniejsze; więcej przeszkadzajek i wszystkiego;
chmury i reszta białe, tylko kreski, potem niebieskawe, więcej odcieni w chmurach (kontury albo szarości), dopiero potem coraz więcej kolorów, jakby dostawał turbo
i leciał w hyperspace; kolory i zachodzące słońce albo noc: czas w tle szybciej się zmienia, jakby ptaszek leciał całymi dniami bez przerwy.” (reszta: „wymyśl sam”)

### 12.1 Poziomy prędkości (stopnie turbo); s nadal 0..1, ale gra pokazuje nazwane poziomy
| Poziom | s | Wygląd świata | Jak trudno |
|---|---|---|---|
| L0 Kontur | 0-0,15 | tylko białe kreski na granacie (jak teraz) | start, machanie |
| L1 Szarość i błękit | 0,15-0,35 | kontury grubsze i podwójne, chmury wypełnione 3-4 odcieniami szarości i błękitu, kreskowanie cieni, zimna poświata | 1-2 prądy |
| L2 Kolor | 0,35-0,6 | pastelowy błękit i lawenda w chmurach i niebie, pierwsze ciepłe odcienie przy horyzoncie | łańcuch 2-3 prądów albo nurkowanie |
| L3 Złoto | 0,6-0,8 | brzoskwinia, złoto, róż; słońce rośnie; smugi prędkości | łańcuch 3-4 prądów + nurkowanie |
| L4 Turbo | 0,8-0,95 | pełne nasycenie, kolorowe smugi, lekkie poszerzenie pola widzenia, poświata na brzegach ekranu | łańcuch ≥5 prądów w 12 s + nurkowanie |
| L5 Hiperprzestrzeń | ≥0,95 przez ≥2 s | gwiazdy i chmury w promienistych smugach, przejścia kolorów, chromatyczny rozbłysk, ptaszek świeci; po 6 s wygasa | rzadkość: tylko dobra gra |
Zasady trudności (do strojenia po testach właściciela): prąd daje mały skok (nie +0,6 jak w Z2), skoki z łańcucha rosną (x1, x1,3, x1,6...) tylko gdy prądy złapane w oknie 3 s;
s opada szybciej na wysokich poziomach; nurkowanie podnosi s powoli i kosztuje wysokość. Typowy gracz ma szczyt L2-L3; L4 raz na kilka minut; L5 rzadko.
Test odbioru: bot trafiający wszystkie prądy osiąga L4 co najmniej raz w 60 s i nie osiąga L5 bez łańcucha ≥5; bot losowy nigdy nie osiąga L4; kolejność koloru (od tyłu do przodu) zachowana na każdym poziomie.
Na ekranie: mały wskaźnik poziomu w stałej strefie (pasek ze stopniami L1-L5, bez tekstu „L”: ikony albo nazwy: Kontur, Szarość, Kolor, Złoto, Turbo, Hiper), komunikat przy wejściu na nowy poziom (krótki, bez dymków).

### 12.2 Etapy koloru (zastępują progi z sekcji 8)
Chmury: L0 sam kontur; L1 wypełnienia szare i błękitne w 3-4 tonach + kreskowanie; L2 pastele; L3 ciepłe; L4 pełne; L5 efekt hiperprzestrzeni.
Niebo, słońce, morze chmur, smugi: te same etapy, od tyłu do przodu (dalekie wcześniej niż bliskie). Pełny kolor tylko od L4. Kolejność koloru z Z1 pozostaje regułą testów.

### 12.3 Doba w tle (lot „całymi dniami”)
Cykl: noc (gwiazdy, księżyc) → świt (zimny róż i błękit) → dzień (jasny błękit, białe słońce wysoko) → zachód (żar, fiolet; obecna paleta) → noc.
Tempo doby zależy od prędkości: spokojny lot ok. 4 min na dobę, L3-L4 ok. 40 s, L5 ok. 15 s; przejścia płynne (interpolacja palet), bez skoków.
Poziom prędkości steruje nasyceniem i liczbą barw, pora doby steruje odcieniem palety. Wzajemnie niezależne, więc w nocy L4 to „neonowa” noc, a w dzień L1 to szaro-błękitny dzień.
Zastępuje to „biom nocny po ok. 1000 m” z Z3 (zostaje jako jedna z pór doby).

### 12.4 Więcej przeszkadzajek (rosną z poziomem i dystansem; harmonogram, nie losowość)
Z Z3: większy ptak, chmura deszczowa, jastrząb. Dochodzą: stado ptaków (klucz w literę V przecina kulisę), wiatr boczny (podmuch znosi w bok, zapowiedź falującymi liniami),
grad (krótki, trafienie = utrata wysokości), burza z błyskiem (zapowiedź ciemnieniem, trafienie = wirowanie i spadek s), sznur latawca (cienka linia w poprzek kulisy), mgła (zimna chmura gasi kolor i obniża s o poziom),
sowa nocą (drapieżnik nocny, odpowiednik jastrzębia; złapanie = koniec biegu, tekst: „Sowa była szybsza. Okruszek wraca jutro.”).
Prądy powietrzne wielkości i barw zależnych od pory doby; w L4-L5 prądy rzadsze (ryzyko).

### 12.5 Rysowanie piękniejsze (zlecenie Z4 rozszerzone, silnik Opus)
Chmury: bogatsze kształty (więcej płatów, miękkie przejścia, jasne brzegi od strony słońca/księżyca, cień własny, wielowarstwowe kontury), kreskowanie, światło między warstwami, mgiełka między kulisami.
Ptaszek (przeuroczy), szalik. Panel designu (laik x3 + Projektant) przed i po. Wszystko własne, nic 1:1 z referencji.
