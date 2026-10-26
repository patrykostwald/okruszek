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
| L0 Mgiełka (Z18, dawniej Kontur) | 0-0,15 | jasny, mglisty, delikatnie pastelowy świat (15.8; dawniej białe kreski na granacie) | start, machanie |
| L1 Pastel (Z17, dawniej Szarość i błękit) | 0,15-0,35 | kontury grubsze i podwójne, chmury wypełnione 3-4 odcieniami szarości i błękitu, kreskowanie cieni, zimna poświata | 1-2 prądy |
| L2 Kolor | 0,35-0,6 | pastelowy błękit i lawenda w chmurach i niebie, pierwsze ciepłe odcienie przy horyzoncie | łańcuch 2-3 prądów albo nurkowanie |
| L3 Złoto | 0,6-0,8 | brzoskwinia, złoto, róż; słońce rośnie; smugi prędkości | łańcuch 3-4 prądów + nurkowanie |
| L4 Turbo | 0,8-0,95 | pełne nasycenie, kolorowe smugi, lekkie poszerzenie pola widzenia, poświata na brzegach ekranu | łańcuch ≥5 prądów w 12 s + nurkowanie |
| L5 Hiperprzestrzeń | ≥0,95 przez ≥2 s | gwiazdy i chmury w promienistych smugach, przejścia kolorów, chromatyczny rozbłysk, ptaszek świeci; po 6 s wygasa | rzadkość: tylko dobra gra |
Zasady trudności (do strojenia po testach właściciela): prąd daje mały skok (nie +0,6 jak w Z2), skoki z łańcucha rosną (x1, x1,3, x1,6...) tylko gdy prądy złapane w oknie 3 s;
s opada szybciej na wysokich poziomach; nurkowanie podnosi s powoli i kosztuje wysokość. Typowy gracz ma szczyt L2-L3; L4 raz na kilka minut; L5 rzadko.
Test odbioru: bot trafiający wszystkie prądy osiąga L4 co najmniej raz w 60 s i nie osiąga L5 bez łańcucha ≥5; bot losowy nigdy nie osiąga L4; kolejność koloru (od tyłu do przodu) zachowana na każdym poziomie.
Na ekranie: mały wskaźnik poziomu w stałej strefie (pasek ze stopniami L1-L5, bez tekstu „L”: ikony albo nazwy: Mgiełka, Pastel, Kolor, Złoto, Turbo, Hiper; Z18: L0 „Mgiełka”, bo konturów już nie ma), komunikat przy wejściu na nowy poziom (krótki, bez dymków).

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

## 5b. Tryby sterowania do testu właściciela (26.10): zbudujmi.com/crumbi
Właściciel testuje jutro na telefonie różne opcje poruszania; w grze musi być WIDOCZNY przełącznik trybu (ekran startu i pauza; przycisk w stałej strefie, min. 44 px), wybór zapamiętany w localStorage (to jedyna rzecz zapisywana w przeglądarce w tej fazie; try/catch).
Tryby: 1 = jeden kciuk (przesuwanie w bok = skręt, przytrzymanie = nurkowanie); 2 = dwa kciuki jak skrzydła (sekcja 5a); 3 = drążek (duży, >=130 px, pole chwytu, baza idzie za kciukiem, drugi palec w prawej połowie = nurkowanie).
Pod przełącznikiem suwak „czułość skrętu” (0,5-1,5) działający we wszystkich trybach; wartości zapisywane razem z trybem. Test wyboru: ?sterowanie=1|2|3 nadpisuje zapisany tryb. Adres wdrożenia: https://zbudujmi.com/crumbi/ (noindex, nofollow; skrypt wdroz_crumbi.cjs).

### 12.6 Głębia, akwarela i baśniowa paleta (właściciel 25.10, noc)
Cytat: „postaraj się samego Okruszka i resztę uzyskać trochę efekty 3D; Okruszka rysując odpowiednio, resztę animacjami, shaderami, różnymi typami technologii, wieloma,
żeby dać graczowi poczucie głębi; więcej, więcej kolorów, dłużej do nich dochodzić; muszą się pięknie rozmazywać, jakby wielki piękny obraz się tworzył; pamiętaj o akwarelach;
pastelowe, piękne, ciepłe, trochę bajkowe, raczej baśniowe kolory.”
Wymagania (Z4, Opus; wspierane przez Z3b w progach koloru):
- Okruszek w pseudo-3D: objętość z cieniowania (światło z kierunku słońca/księżyca, cień własny, światło odbite od chmur, rim light), pióra jako warstwy z mikro-paralaksą, skrzydła z perspektywą i skrótem, miękki cień rzucany na chmurę pod spodem; obrót ciała przy skręcie (nie tylko pochylenie). Rysowane kodem (Canvas/SVG-ścieżki), bez obrazków.
- Reszta świata: głębia z wielu technik naraz: paralaksa warstw (jest), mgiełka powietrzna rosnąca z dystansem (atmospheric perspective), głębia ostrości (dalekie rozmyte, bliskie ostre; tanie rozmycie przez sprite'y o niższej rozdzielczości), god rays między chmurami (shader/gradient promieniowy), przesuwające się cienie chmur na morzu chmur, ruch wolumetryczny chmur (płaty animowane wolno względem siebie), cząstki pyłu/drobin światła na różnych głębokościach, bloom na słońcu i w turbo (WebGL2 post-process, z bezpiecznym awaryjnym trybem Canvas 2D bez WebGL; test fps).
- Kolor jako akwarela: kolor nakłada się z lekkim przesunięciem względem konturu (wylewa się poza kreskę, nie trafia idealnie w obrys), ma nierówne, rozpływające się brzegi (szum w masce), granulację pigmentu, wilgotne przejścia, „mokre w mokre” mieszanie sąsiednich plam, delikatny efekt papieru. Kolory wypełniają świat stopniowo jak malowany obraz: plamy rosną, łączą się, schną (ciemnieją brzegi).
- Paleta baśniowa, pastelowa, ciepła (własna, nie z referencji): róż pudrowy, brzoskwinia, morela, złoto-miodowe, lawenda, błękit pastelowy, mięta, koral, kremowa biel; dużo więcej odcieni niż dotąd (min. 14 odcieni w wypełnieniach chmur i nieba), płynnie mieszanych; ciepłe światło dominuje, chłodne tylko w cieniach i w nocy.
- Dłuższa droga do kolorów: poziomy koloru rozciągnięte (nowe odcienie dochodzą jeden po drugim w całym zakresie L1-L4); pełna paleta i pełna akwarela dopiero w L4-L5; w L0 nadal sam kontur.
- Wszystko pozostaje tanie: sprite'y pre-renderowane, jeden opcjonalny pass WebGL, tryb lekki przy <50 kl/s; zasada jednego wyróżnika na ekran.

## 13. Decyzje właściciela z 25.10 (przedpołudnie): „1 tak, 2 tak, 3 tak, 4 tak, 5 tak, 6 tak”
1. Długa gra = Droga Słońca z bramami (kolejne loty startują od ostatniej bramy). 2. Brama otwiera się też po kilku próbach (wytrwałość), nikt nie utknie.
3. Szkielet długiej gry (Z10) od razu po trybach sterowania, przed dopracowaniem ekranów. 4. Postaci v1.5: Fiuk (wiaterek), Pierzynka (chmurka do spania), Rogal (księżyc).
5. Kolejność krain: Góra, Morze Pierzyn, Kamienny Las (wieże), Wietrzne Schody (latawce), Szlak Gęsi (samoloty). 6. Doba nie przewija się przy bramie; lot z bramy zaczyna się o porze tej krainy.
Wszystko zgodne z ZLECENIA-Z10-Z13.md; brak otwartych decyzji blokujących Z10-Z13.

## 14. Pełny kolor tylko po trzech przyspieszeniach z rzędu (właściciel 25.10, popołudnie)
Cytat: „pełny, pełny kolor gry powinien być tylko po takim maksymalnym przyspieszeniu, jak się 3 po kolei przyspieszenia znajdzie; sam to dopracuj, żeby człowiek chciał osiągnąć ten stan najwięcej kolorów, ale żeby to nie było takie super łatwe jak teraz.”
Zasada (zlecenie Z3c, Sonnet high, po scaleniu Z10 i Z4):
- Wprowadź „energię koloru” E 0..1 jako to, co steruje ilością koloru (zamiast samej prędkości s). E rośnie TYLKO z łańcucha prądów: 1 prąd w oknie = E do ok. 0,30 (pierwsze odcienie), 2 z rzędu = E do ok. 0,62, 3 z rzędu = E 1,0 (pełna paleta i pełna akwarela, poziom Turbo). Nurkowanie samo daje najwyżej E 0,40. Pełny kolor ma być widocznie nagrodą: krótka, wyraźna faza „rozkwitu” (kolor wypełnia świat falą od tyłu do przodu w ok. 1,2 s, lekki bloom, dźwięk w Z6/Z13).
- Łańcuch liczy się tylko przy „idealnym wejściu” (środek prądu; brzeg daje mały skok, ale nie przedłuża łańcucha), okno między prądami zawężone (CHAIN_W 3,0 → ok. 2,2 s do strojenia), prądy w serii rozstawione w x tak, żeby trzeba było skręcać między nimi (nie leżą na jednej prostej). To ma sprawić, że trzy z rzędu wymagają umiejętności.
- Po zerwaniu łańcucha kolor opada szybko (po 1,5 s łaski, ok. 0,35 E na sekundę), więc pełny kolor jest stanem przejściowym, o który się walczy; w L5 (hiper) nadal pięć prądów w 12 s plus nurkowanie, i jest to wyższy, rzadszy szczyt niż pełny kolor.
- Zachowaj regułę „prędkość = kolor”: łańcuch daje też skok prędkości, więc w odczuciu gracza to jedno; GATE4 = 3 (zamiast 4), CAP4 bez 3 trafień w oknie zostaje, testy 12.1 dostosować uczciwie: bot idealny osiąga pełny kolor co najmniej raz w 60 s; bot „50% prądów” osiąga trójkę z rzędu rzadko (≤ 15% serii) i nie utrzymuje pełnego koloru dłużej niż 2 s; bot losowy nigdy; kolejność koloru od tyłu do przodu nadal zachowana; w L0 nadal sam kontur.
- Pokaż w HUD, że łańcuch „buduje” kolor (np. trzy kropki-iskierki przy poziomie, wypełniane po kolei, bez liczb), żeby gracz rozumiał, czego szuka.
- Strojenie po teście właściciela: E_POJEDYNCZY, E_DWA, E_TRZY, CHAIN_W, szerokość „idealnego wejścia”, FALL_E; stałe w obiekcie G.


## 15. Nowy rdzeń rozgrywki: TOR 3x3, loty skrzydłami, wiatry, chmury jako przeszkody (właściciel 26.10)
Cytat (skrót): „ptaszek musi umieć dobrze latać: sterować lotem góra, dół i na boki, a skrzydła mają to super odwzorowywać, żeby było satysfakcjonujące. Lot do góry to ciężkie stukanie skrzydełkami, bo jest wysoko i mu ciężko. Lot swobodny szybuje, jak się wszystko puszcza, ale też opada. Może zanurkować, żeby się wybić. Widzę to jak tor, gdzie jest 9 dróg na ekranie: patrząc ze środka można w dół, dół-lewo, dół-prawo, prawo, lewo, lewo-góra, góra, góra-prawo; zrobiłbym więcej, ale nie wiem, czy możesz. Ptaszek lawiruje między przeszkodami, tory między chmurami przetykane przyspieszeniami i pustymi polami. Okruszek łapie wiatry i przyspieszenia. Różne wiatry: wyrzucają z dolnego boksu na górny albo środkowy, albo tylko na wprost, jeśli jesteś na środku. Jeśli parę takich pod rząd złapie, dostaje hiperprędkość. Podstawowe przeszkody to chmury różnych kolorów, każdy przelot przez chmurę spowalnia, więc gracz będzie ich unikał. Oprócz tego chmury burzowe, gradowe i tornada, ptaki, samoloty, motolotnie, UFO. Grafika: przejście z ciemnej na kolory to zbyt duży przeskok, a ciemne kontury chyba nie pasują; graj to bardziej warstwami danych chmur, bez jednoznacznych czarnych konturów; tor ma być graficznie wytyczony.”
Decyzje projektowe orkiestratora (do strojenia po teście właściciela):

### 15.1 Tor
- Siatka COLS x ROWS = 3 x 3 (kolumny lewa/środek/prawa, wiersze góra/środek/dół), parametryzowana (łatwo rozszerzyć np. do 5 x 3 lub 5 x 5). Okruszek jest zawsze w jednej komórce, ruch między komórkami płynny (ok. 0,2-0,3 s), ze skrzydłami i pochyleniami. Ze środka dostępne wszystkie osiem kierunków (w tym ukośne); bez wychodzenia poza siatkę.
- Świat to „plastry” toru (slice) przylatujące w głąb ekranu w tempie zależnym od prędkości; każdy plaster ma układ komórek: pusta, wiatr (przyspieszacz), przeszkoda (chmura i inne), rzadziej rzecz specjalna. Plastry z biblioteki wzorców (min. 40 ręcznie zaprojektowanych układów plus generator), w frazach: puste pola, przyspieszenia, przeszkody; trudność rośnie z krainą (Z10) i poziomem prędkości. Zasada uczciwości: przez każdy plaster istnieje co najmniej jedna wolna ścieżka osiągalna z każdej komórki poprzedniego plastra w czasie ruchu; zapowiedź >= 1,5 s.
- Tor graficznie wytyczony: miękka, widoczna siatka torów w perspektywie (jasne wstęgi światła lecące w głąb, bez ciemnych obrysów), podświetlenie komórki Okruszka, delikatne podświetlenie komórek z wiatrem (zachęta) i delikatne ostrzeżenie komórek z przeszkodą na 1,5 s przed kontaktem; w L0 tor widoczny jako jasne kreski i światło.

### 15.2 Sterowanie lotem (wysokość = wiersz; skrzydła mają to odzwierciedlać)
- Do góry: ciężkie stukanie skrzydłami. Wejście o wiersz w górę wymaga rytmu 2-3 stuknięć (ciężko, bo wysoko; im wyżej, tym większy koszt „wysiłku”, bez trwałego wyczerpania; rytm jest oszczędniejszy niż spam). Skrzydła animują się zgodnie ze stuknięciami (silny, ciężki zamach).
- Szybowanie: bez dotyku Okruszek szybuje i powoli opada (jeden wiersz w dół co ok. 3-4 s; opadnięcie poniżej dolnego wiersza = morze chmur = koniec biegu, miękki jak w Z2). Skrzydła rozłożone, lekkie drżenie.
- Nurkowanie (przytrzymanie): szybko w dół o wiersz (lub dwa), rośnie prędkość; po nurkowaniu krótkie „wybicie”: puszczenie daje darmowy wzlot o wiersz w górę (energia prędkości zamieniona w wysokość). Skrzydła złożone.
- Boki: lewo/prawo zmieniają kolumnę (skrzydła asymetryczne). Ruchy ukośne = bok plus góra/dół w jednym geście.
- Mapowanie na istniejące tryby sterowania (5a/5b): tryb 1 (jeden kciuk): przesunięcie w bok = kolumna, stuknięcie = machnięcie skrzydłami (góra), przytrzymanie = nurkowanie, przeciągnięcie w górę/dół = wiersz (ukośne z bokiem). Tryb 2 (dwa kciuki jak skrzydła): stuknięcie lewym = lewe skrzydło (w lewo i w górę), prawym = w prawo i w górę, oba naraz = mocne machnięcie prosto w górę, przytrzymanie obu = nurkowanie. Tryb 3 (drążek): kierunek drążka wybiera komórkę docelową, stukanie prawą połową = machnięcie, przytrzymanie prawej = nurkowanie. Wszystkie tryby muszą pozwalać na te same ruchy; suwak czułości zostaje.

### 15.3 Wiatry (przyspieszacze)
- Typy: winda w górę (z dolnego wiersza do górnego lub środkowego), winda dół-środek, wiatr z tyłu na wprost (działa TYLKO jeśli Okruszek jest w komórce środkowej, daje prędkość), poprzeczny (przerzuca o kolumnę w bok), zjazd (z góry w dół z przyspieszeniem). Każdy wiatr zajmuje komórkę i przerzuca w określoną komórkę (animowana trasa, wstęga).
- Łańcuch wiatrów (jak w Z3c): kilka pod rząd (okno ok. 2,2 s do strojenia, do łańcucha liczy się tylko wejście w „środek” wiatru): 3 z rzędu = pełny kolor (E=1), 5 w 12 s plus nurkowanie = hiperprędkość (L5). Układ plastrów ma tworzyć sekwencje, w których łańcuch wymaga lawirowania (np. wiatr w górnym lewym, następny w środkowym prawym).

### 15.4 Przeszkody
- Podstawowa: chmury w różnych kolorach (palety z Z3c/Z4; kolor chmury = siła spowolnienia: biała lekko, lawenda średnio, szara mocno, fiolet burzowy bardzo); każdy przelot przez chmurę spowalnia (s w dół o stopień, kolor i energia gasną), bez końca biegu; chmura zajmuje komórkę.
- Dalsze: chmury burzowe (spadek s, wirowanie, błysk), gradowe (utrata wysokości o wiersz), tornada (wciągają i znoszą o kolumnę, lejek, 2 komórki), ptaki (poruszają się między komórkami, zapowiedź), samoloty (przelot przez cały wiersz lub kolumnę, turbulencje), motolotnie, UFO „bączek” (kręci się, rzadko, bez wciągania wiązką), szpile miasta (blokują dolne wiersze kolumny), latawce i sznury (K4), Wielki przelot (K5). Jastrząb i sowa nadal jedyne końce biegu (S3), teraz jako pościg po komórkach: drapieżnik zapowiada atak na komórkę, którą trzeba opuścić.
- Treści krain z Z11 zostają; ich kolizje przechodzą na model komórek.

### 15.5 Grafika (zlecenie Z15, równolegle z Z14)
- Przejście z ciemnej na kolory ma być płynniejsze, bez „przeskoku”: L0 nie czarny granat, tylko spokojna, miękka, ciemnoniebieskoszara paleta z warstwami i światłem; kolory wchodzą stopniowo, etapy rozciągnięte.
- Bez jednoznacznych czarnych i ciemnych konturów chmur: chmury budowane WARSTWAMI tonów (płaty światła i cienia, miękkie krawędzie tonalne, mgiełka między warstwami), krawędź wyznaczana różnicą tonu, nie obrysem; kontur, jeśli w ogóle, jasny lub tonalny i półprzezroczysty. Dotyczy chmur, wież, przeszkód, ptaków, samolotów. Szalik Okruszka czerwony zostaje.

### 15.6 Wersjonowanie
- Rdzeń „Tor” wchodzi jako tryb ?tor=1 obok obecnej rozgrywki (swobodny lot z Z2); po akceptacji właściciela po teście na telefonie staje się domyślny, a stary tryb zostaje jako ?swobodny=1 na czas migracji i testów. Zostają: krainy i bramy (Z10), intro i historia, dźwięk, PWA, prywatność, tryby sterowania (adaptowane), energia koloru i poziomy L0-L5, rysunek Z4 (po Z15).

### 15.7 Zasada koloru chmur (właściciel 26.10)
Nie przesadzać z zielonymi chmurkami: zielony tylko wtedy, gdy chmura ma funkcję w grze (buff albo nerf), na przykład zielona mglista chmura jako nerf (zatruta mgła: spowalnia i gasi energię koloru) albo zielona chmura-oaza jako buff (np. odnawia wysokość). Pozostałe chmury w paletach pastelowych bez zieleni: róż, brzoskwinia, morela, lawenda, błękit, krem, szarości. Każdy kolor chmury w torze ma znaczenie i jest czytelny (kolor = rodzaj efektu), a dekoracyjne chmury tła są bez zieleni.


## 16. Tryb poziomy: lot dwoma kciukami jak skrzydłami, strefy wysokości od ziemi po szczyt (właściciel 26.10)
Cytat: „mechanika lotu powinna wyglądać tak, że użytkownik trzyma telefon horyzontalnie i oboma kciukami tak uderza i rozsuwa jak skrzydłami lot. A jak chce zanurkować, to kciuki nie robią na zewnątrz, tylko do wewnątrz, i wtedy Okruszek składa skrzydła jak jastrząb i nabiera szybkości. Jeśli to możliwe, zrobiłbym najniższy level na ziemi, średni w powietrzu, górny w chmurach, najwyższy do top prędkości. Przy ziemi dołożyłbym jakieś znajdźki i taki piękny widok bajkowy jak z pierwszych wiadomości i źródeł.”

### 16.1 Układ i sterowanie (telefon poziomo)
- Ekran poziomy (landscape), Okruszek widziany zza pleców w głąb ekranu, jak dotąd. Układ gry (HUD, ekrany, tor) ma wariant poziomy; w pionie gra pokazuje łagodną prośbę „obróć telefon” (iOS nie pozwala zablokować orientacji w przeglądarce, na Androidzie w trybie aplikacji manifest może wymusić landscape: `orientation: landscape` w osobnym manifeście lub po instalacji).
- Każdy kciuk w swojej strefie chwytu przy dolnych rogach (strefy wcięte min. 48 px od krawędzi ekranu, żeby nie kolidowały z gestami systemu).
- Ruch kciuków oceniany przez zdarzenia wskaźników (dx na krótkim oknie ok. 100-140 ms):
  - Oba kciuki NA ZEWNĄTRZ (lewy w lewo, prawy w prawo) = zamach skrzydeł = ciężkie machnięcie w górę; siła zależy od szybkości i amplitudy ruchu; rytm kolejnych zamachów daje lot w górę (ciężko, im wyżej, tym ciężej).
  - Oba kciuki DO WEWNĄTRZ (do środka) = Okruszek składa skrzydła jak jastrząb: nurkowanie, rośnie prędkość i kolor; przytrzymanie kciuków blisko siebie = utrzymanie nurkowania; rozsunięcie po nurkowaniu = wybicie (darmowy wzlot).
  - Brak ruchu = szybowanie z powolnym opadaniem.
  - Asymetria: tylko jeden kciuk zamachem = skręt w tę stronę (lewe skrzydło = w lewo), jak w sekcji 15.2.
  - Animacja skrzydeł dokładnie odzwierciedla kciuki (amplituda, kierunek, tempo): to główna nagroda dotykowa.
- Tryby 1 i 3 (jeden kciuk, drążek) zostają jako zapas; w poziomie główny jest „dwa kciuki jak skrzydła”.

### 16.2 Strefy wysokości (zamiast jednego „wysokościomierza”)
- Cztery strefy w pionie, każda z własnym światem: ZIEMIA (nisko: łąki, wzgórza, drzewa, rzeka, wieś w stylu baśniowych krajobrazów; znajdźki; spowolnienie przy muskaniu ziemi lub bonus za „muśnięcie” zgodnie z listą pomysłów), POWIETRZE (środek: wiatry, ptaki, motolotnie, samoloty), CHMURY (góra: kolorowe chmury jako przeszkody i buffy, burze, grad, tornada), NADCHMURZE (szczyt: top prędkość, hiperprzestrzeń, gwiazdy i światło; wejście tu wymaga łańcucha wiatrów, jak pełny kolor i L5 w Z3c).
- Mapowanie na tor z Z14: wiersze toru = strefy (ziemia, powietrze, chmury, nadchmurze), czyli ROWS = 4; kolumny jak dotąd 3 (parametryzowane, może 5 w poziomie, bo ekran szerszy).
- Ziemia nie jest śmiercią: dolny wiersz to bezpieczna, ładna strefa z znajdźkami, ale wolniejsza (tarcie) i z przeszkodami naziemnymi (drzewa, wieże, latawce na sznurach); „morze chmur” jako koniec biegu zostaje tylko dla pionowych krain nad chmurami, a w ziemi „lądowanie” to miękkie odpoczęcie (koniec biegu jak w Z2).
- Znajdźki przy ziemi: z listy 03-przyspieszacze-i-dodatki.md (pióra, drobiny akwareli, listy do domu, światełka, wspomnienia do Zeszytu), bez waluty i bez presji.
- Piękny widok przy ziemi: faliste wzgórza z cieniami chmur wędrującymi po polach (pomysł z „Cloud Dancing”, własny rysunek), łąka, kołysząca się trawa, drzewa, rzeka z odbiciem nieba, wioska z okien z ciepłym światłem; paleta baśniowa z 15.5, zieleń ziemi dopuszczalna jako tło krajobrazu (naturalna), a nie jako chmura bez funkcji (15.7).

### 16.3 Ryzyka (uczciwie)
- Orientacja: iOS Safari nie zablokuje poziomu; trzeba prosić o obrót i zaprojektować układ pod oba układy lub tylko pod poziomy.
- Gesty przy krawędziach ekranu mogą kolidować z gestami systemu (cofanie, dom); stąd wcięte strefy chwytu.
- Detekcja „na zewnątrz/do wewnątrz” wymaga strojenia progów (amplituda, prędkość, okno) na prawdziwym telefonie; to zadanie na test właściciela; pierwsza wersja ma suwak czułości i tryb kalibracji.
- Większa liczba pikseli w poziomie i dodatkowa warstwa ziemi zwiększają koszt rysowania; konieczny tryb lekki i ograniczenia dla ziemi (sprite'y pre-renderowane).
- Zmęczenie dłoni: sesje 3-5 minut, krótkie „oddechy”, rytm nie spamowany.
- iOS nie wspiera wibracji w przeglądarce; Android tak (opcjonalne krótkie impulsy przy zamachu).

### 16.4 Zlecenie Z16 (po Z14 i Z15)
Z16 (Opus high): tryb poziomy z gestami skrzydeł (16.1), strefy wysokości i ziemia z znajdźkami i krajobrazem (16.2), układ poziomy HUD i ekranów, prośba o obrót, manifest/orientacja, testy gestów (dotyk dwoma palcami przez CDP, zamach na zewnątrz i do wewnątrz, asymetria), test stref i znajdźek, zrzuty 844x390 (poziomo). Wersjonowanie: ?poziomo=1 obok ?tor=1; po akceptacji właściciela staje się domyślny na telefonach.

### 16.5 Decyzja właściciela: drążek zostaje (26.10)
Właściciel: „jeśli uważasz, że lepiej z drążkami, to zostawimy drążki, fajnie się nimi gra”. Tryb 3 (drążek) jest PEŁNOPRAWNYM trybem w torze (Z14) i w trybie poziomym (Z16): w poziomie lewy kciuk steruje drążkiem (kierunek = komórka docelowa, także ukosy), prawy kciuk robi zamach (stuknięcie) i nurkowanie (przytrzymanie). Wszystkie cztery sposoby sterowania (jeden kciuk, dwa kciuki jak skrzydła, drążek, w poziomie gesty skrzydeł) pozostają do wyboru w grze; domyślny zostaje wybrany po teście właściciela na telefonie, a do tego czasu domyślny to drążek lub jeden kciuk wg jego wskazania (drążek preferowany jako „fajnie się nim gra”).

### 15.8 Start bez ciemności, delikatne kolory od początku (właściciel 26.10)
Cytat: „nie jestem pewien, czy robiłbym tę zupełną ciemność jak jest na starcie, skoro robimy jeszcze ziemię. Zrobiłbym kolory, ale delikatne, a im szybciej lecisz, tym dochodzi ich więcej i więcej barw, żeby chcieć latać szybko.”
Decyzja (nadpisuje „L0 sam kontur i ciemny granat” z sekcji 2/8/12.2 oraz „L0 miękka ciemnoniebieskoszara paleta” z 15.5):
- Start gry (L0) to JASNY, spokojny, delikatnie pokolorowany świat: poranny lub dzienny pastelowy świat z miękkimi barwami o niskim nasyceniu (blady róż, krem, jasny błękit, delikatna lawenda, ciepły piasek), z widoczną ziemią (zarys krajobrazu z sekcji 16) tam, gdzie jest już w grze; NIE czarny granat i NIE tylko białe kreski.
- Im szybciej (energia koloru E z Z3c, łańcuch wiatrów), tym więcej barw i większe nasycenie: kolejne odcienie dochodzą po jednym, mieszają się akwarelowo, plamy rosną; pełna paleta i pełna akwarela nadal dopiero przy E=1, hiperprzestrzeń w L5. Motywacja gracza: chcieć lecieć szybko, żeby zobaczyć więcej barw.
- Doba w tle: start o poranku lub dniu (jasno); noc i zachód pozostają w cyklu (gwiazdy, księżyc) i są ładnymi, nie czarnymi etapami (granat z światłem i barwnymi warstwami). Początkowa pora doby: świt lub dzień zamiast zachodu/zmierzchu.
- Szalik Okruszka nadal czerwony; zasada „przy zerowej prędkości kolor ma tylko szalik” traci moc: zastępuje ją „przy zerowej energii delikatne, pastelowe kolory bazowe”. Kolejność koloru od tyłu do przodu, monotoniczność etapów i testy zachowane (progi dostosować uczciwie).

## 17. Zawartość stref: bestiariusz i tabela (26.10)
Dokument fabula\05-bestiariusz-stref.md (96 typów: ziemia 28, powietrze 28, chmury 24, nadchmurze 16; liczby dla poziomów L0-L5 i krain K1-K5 plus Dalekie Niebo; 12 fraz toru) oraz dane maszynowe fabula\zawartosc.json są OBOWIĄZUJĄCĄ specyfikacją zawartości dla Z14 (tam, gdzie pasuje do toru) i Z16 (tryb poziomy, strefy). Wartości liczbowe są startowe: stroi je bot i test właściciela.
Rozstrzygnięcia orkiestratora (właściciel kazał decydować; do zmiany po jego teście):
1. Na szczyt (nadchmurze) wchodzi się tylko wiatrem po dwóch wiatrach z rzędu (Schody światła) albo jetstreamem, nie machaniem: TAK.
2. Pierwsze dotknięcie ziemi to przysiad (łagodne odbicie), dopiero drugie w krótkim czasie kończy lot: TAK.
3. Hiperprędkość tylko na szczycie, gdzie jastrząb i sowa nigdy nie wlatują (zgodne z Z10: w L5 nowy pościg nie startuje): TAK.
4. Tornado dopiero w K5, burza w Dalekim Niebie (Z14 ma je wcześniej: dostosować przy scalaniu lub w Z16): TAK.
5. Jetstream już w wersji 1.5 (wcześniej odłożony do v2): TAK.
Z16 ma czytać fabula\05-bestiariusz-stref.md i zawartosc.json jako źródło typów, liczb i fraz; generator plastrów z Z14 po scaleniu zasilany tą tabelą.

### 17.1 Odpowiedzi właściciela (26.10) i pętla jakości
Odpowiedzi na pięć rozstrzygnięć: 1 tak; 2 „na razie ok” (przysiad przy pierwszym dotknięciu ziemi, do ponownej oceny po teście); 3 ok z doprecyzowaniem: w NADCHMURZU Okruszek widzi przelatujące drapieżniki, samoloty, UFO, statek kosmiczny i satelity, ale NIE mogą go dotknąć (to widowisko klasy S0, żadnego zagrożenia, żadnej kolizji; dopisać statek kosmiczny i satelity do typów nadchmurza); 4 ok; 5 ok.
Pętla jakości (polecenie właściciela 26.10: „jak skończysz, zrób sporo testów i user journey, potem poprawki, wdróż, i tak w pętli, aż tor nie będzie jak najlepszy”): po scaleniu Z14 i Z15 powtarzaj rundy: (1) agent QA przechodzi ścieżki użytkownika (pierwsze uruchomienie z intro, wybór sterowania, 3-5 minut lotu w każdym z trzech trybów, łapanie wiatrów i łańcuch, przeszkody, drapieżnik, lądowanie, „jeszcze raz”, pauza, przeładowanie strony, tryb offline, ustawienia, prywatność; pion i dla Z16 poziom; ograniczony CPU), robi zrzuty i panel recenzentów (laik x3, UX, dostępność, Strażnik) i zapisuje listę P0/P1/P2; (2) agent poprawek wdraża P0 i P1; (3) orkiestrator weryfikuje własnym preflightem i wdraża na zbudujmi.com/crumbi; powtórz, aż lista P0 i P1 będzie pusta (maksymalnie 4 rundy bez nowego polecenia właściciela, potem raport).

### 15.9 Korekta: tor NIE jest widoczną siatką (właściciel 26.10)
Właściciel po zobaczeniu gry: „po co widać te tory? tego nie powinno być widać, tylko to powinno być intuicyjne, ja mówiłem Ci o mechanice”. Zapis „tor graficznie wytyczony” z sekcji 15 oraz 15.1 należy rozumieć jako: tor wynika z NATURALNEGO układu świata (pasy chmur z prześwitami, wstęgi wiatru, cień Okruszka na chmurach pod nim), a NIE jako narysowana siatka komórek, szyny i ramki. Siatka 3x3 pozostaje wyłącznie modelem logicznym; rysowana jest tylko pod flagą debug ?siatka=1. Ostrzeżenia o przeszkodach i wiatrach są naturalnymi zapowiedziami w świecie (cień, poświata, szkic samej przeszkody), nie podświetlonymi prostokątami. Dotyczy też trybu poziomego (Z16).

### 17.2 Cel: satysfakcja z lotu blisko 10/10 (właściciel 26.10)
Właściciel po rundzie QA 1 (ocena satysfakcji z lotu 4/10): „satysfakcja z lotu musi być zdecydowanie bliżej 10/10”. Kryterium odbioru całej gry: w kolejnych rundach QA ocena satysfakcji z lotu >= 9/10 (oraz piękno >= 9, czytelność >= 9, stabilność >= 9). Dźwignie „czucia lotu” (game feel), które ma dopracować runda Z19 po Z18: (1) skrzydła i ruch ptaszka odpowiadają na dotyk natychmiast (opóźnienie wejścia < 50 ms do pierwszej reakcji wizualnej), z przewidywaniem i dobiegiem (anticipation, overshoot, easing), ciężki zamach wyraźnie cięższy od lekkiego; (2) sprzężenie zwrotne zmysłów przy każdym zdarzeniu: wiatr (smuga, fala koloru, nuta z dzwiek.js, krótka wibracja na Androidzie), nurkowanie (szum, smugi, lekkie przybliżenie kamery), wybicie (przypływ światła, dźwięk), łańcuch wiatrów (rosnąca melodia, narastający kolor), zderzenie z chmurą (miękkie spowolnienie, mgiełka, dźwięk tłumiony); (3) kamera: delikatne pochylanie przy skręcie, rozszerzenie pola widzenia przy prędkości, drżenie tylko w turbulencjach i bez migotania; (4) rytm: wiatry i przeszkody ułożone w frazy, które „śpiewają” razem z muzyką; (5) poczucie masy i wysokości (wysoko = ciężko, nisko = bezpiecznie), czytelny postęp (poziomy, kolor, dystans); (6) mikro-nagrody (znajdźki, nuty, odblaski) bez presji. Pomiary: opóźnienie wejścia, liczba bodźców na zdarzenie, spójność animacji skrzydeł z kciukami, ocena panelu recenzentów.

## 18. Strojenie toru po QA runda 1 (zlecenie Z18, 26.10)
Raport QA: Desktop\projekty\gra-okruszek-QA1\qa\RAPORT-QA-RUNDA-1.md. Wszystkie stałe w obiektach TOR i TOR_G (TOR_G nadpisuje G tylko w torze; swobodny lot bez zmian). Liczby z botów: qa\qa_z18_pomiar.cjs, sprawdzane w gra_test_z18.cjs.
- Nadchmurze (17 nr 1): wejście tylko wiatrem w górę jako drugi (i dalszy) idealny wiatr z rzędu (Schody światła, NADCH_LANC 2); winda bez łańcucha kończy w chmurach; machanie nie wnosi i nie trzyma (rzadkie powietrze), opadanie co 2,5 s; brama stawia w chmurach.
- Idealne wejście (14): Okruszek leci środkiem wstęgi (odchylenie od środka wiersza < 0,09 wiersza; opadanie i zebrany wzlot go przesuwają). Brzeg zrywa łańcuch. W nauce (20 s) najwyżej dwa z rzędu; zaraz po nauce trójka w rytmie (F, Schody, zjazd).
- Prędkość z łańcucha (12.1, 15.3): 1 = Pastel, 2 = Kolor, 3 z rzędu = Turbo (L4, razem z pełnym kolorem), 5 w 12 s + nurkowanie = szansa na Hiper; rozpęd trzyma, póki łańcuch żyje; okno łańcucha 1,6 s, łaska pełnego koloru 0,9 s.
- Presja: chmura spycha w dół (fiolet i burza o wiersz, nigdy od razu koniec), opadanie przyspiesza z czasem biegu (do x1,45 po 5 min), drapieżnik śledzi komórkę i namierza ją 0,6 s przed zejściem (unik po namierzeniu), pościgi coraz częściej.
- Gęstość i debiuty (17, 05 tabela 4.2): generator dobiera frazy do tempa z tabeli dla poziomu i krainy (x0,75 na 3 wiersze), po S2 oddech, najwyżej ok. 4 s bez niczego, tornado od K5, burza w Dalekim Niebie.
- Czytelność: plastry rysowane bliżej (skala 1,5 s przed kontaktem ok. 0,6), pojawiają się >= 3,6 s przed kontaktem; HUD z tuszem zależnym od tła; jasne panele; L0 „Mgiełka”.
- Cele botów (wynik Z18): bot idealny pełny kolor w 60 s w 94-98% biegów, Turbo osiągalne, Hiper tylko z nurkowaniem; bot 50% pełny kolor w <= 60 s w 5-8% biegów (<= 1,1 s); bot 70% kończy bieg po medianie 5-6,5 min; samo machanie ginie w ok. 2,5 min i nie widzi nadchmurza.
