# 05. Bestiariusz stref: co, gdzie i ile (Okruszek, tor 3 x 4)

Rola: główny projektant zawartości (level design i bestiariusz), 26.10.2026.
Podstawa: `PROJEKT.md` (2, 12.1, 12.4, 14, 15 z 15.7-15.8, 16 z 16.5), `00-wybor.md` (krainy K1-K10, C1-C30, S0-S3), `03`, `04`, `01`, `RAPORT-NA-RANO.md`, kod: stałe `G`, `Z`, `Z11`, `KLASA`, `KRAINY` (worktree Z11) oraz model toru `TOR`, `TOR_WIATRY`, `CHMURY_TOR`, `WZORCE`, `TOR_OD` (worktree Z14). Plik `02` tylko jako luźna inspiracja.
Dane maszynowe: `zawartosc.json` (ten sam folder, sprawdzony w node, sekcja 10).
Oznaczenia: [kod] = wzięte z kodu; [założenie] = liczba startowa do strojenia botem; [decyzja] = rozstrzygam tutaj; „j.” = `G.PRAD_S` (skok zwykłego wiatru).

## 0. Skrót w pięciu zdaniach
1. Cztery wiersze toru to cztery światy: **Ziemia** (bezpieczna, wolniejsza, pełna znajdziek), **Powietrze** (start, wiatry, ptaki, maszyny, główne łowisko jastrzębia), **Chmury** (spowalniają kolorem, ale mają oazy, tunele i wyjście w górę), **Nadchmurze** (najszybciej, bez drapieżników, jedyne miejsce hiperprzestrzeni).
2. Wiatry są windami między światami: termika z ziemi do powietrza, winda z powietrza do chmur, a do Nadchmurza prowadzą tylko **Schody światła** po dwóch wiatrach z rzędu albo jetstream; im wyżej, tym szybciej i krócej.
3. 96 typów zawartości (ziemia 28, powietrze 28, chmury 24, nadchmurze 16), z czego 63 da się zrobić z istniejących rysunków, a 33 wymaga nowej grafiki.
4. Gęstość rośnie z poziomem i krainą (od 1,7 do 3,5 zajętej komórki z 12 na plaster), ale po każdej przeszkodzie S2 jest oddech, a w oknie 1,5 s najwyżej 1 widowisko, 1 S2 i 2 plastry z S1.
5. Każda kraina wnosi najwyżej jedną nową zasadę; nowy wygląd znanej zasady (drzewo, dach, wiatrak to ten sam „blok”) nie liczy się jako nowość.

---

## 1. Logika świata: cztery strefy

Wiersze liczone od góry, jak w kodzie Z14: 0 = Nadchmurze, 1 = Chmury, 2 = Powietrze, 3 = Ziemia. Okruszek startuje w środkowej komórce Powietrza [decyzja].

| Strefa | Co tam jest i dlaczego | Wygląd i paleta | Dźwięk | Nastrój |
|---|---|---|---|---|
| **Nadchmurze** (wiersz 0) | Rzadkie powietrze: nie da się tu wejść machaniem, tylko wiatrem. Wysoko latają odrzutowce, płyną jetstreamy, nocą spadają meteory, czasem zagubiony satelita. Ptaki drapieżne tu nie sięgają. | Morze chmur pod spodem jak dywan, blade gwiazdy także w dzień, złote światło, smugi; nocą granat z mlecznym srebrem (nie czerń). Głęboki błękit, lawenda, złoto, perła. | cisza, wysokie dzwoneczki, pogłos nut łańcucha | zachwyt, mistrzostwo, chwila |
| **Chmury** (wiersz 1) | Kumulusy jak kulisy teatru. Kolor chmury mówi, jak mocno spowalnia (15.4). Tu rodzi się pogoda: deszcz, grad, burza, tornado. Tu też są oazy, tunele i Schody światła w górę. | Warstwy tonów bez ciemnych konturów: róż pudrowy, brzoskwinia, lawenda, krem, szarości, fiolet burzy. Zieleń tylko z funkcją (oaza, zatruta mgła). | miękki szum, krople, pomruk, stukanie gradu | baśń, wybór, lekki dreszcz |
| **Powietrze** (wiersz 2) | Środek nieba, gdzie latają ptaki i maszyny ludzi: gęsi, bociany, motolotnie, balony, małe samoloty, latawce na sznurach. Najwięcej wiatrów. Jastrząb poluje głównie tutaj. | Otwarta przestrzeń, wstęgi wiatrów, warstwy mgiełki na horyzoncie. Pastelowy błękit, krem, morela, lawenda w cieniach. | wiatr w piórach, „fiu”, gęganie, daleki warkot | swoboda, zabawa, czujność |
| **Ziemia** (wiersz 3) | Krajobraz z bajki: łąki, wzgórza, drzewa, rzeka, wieś, wiatraki, dzwonnica. Ciepło pól tworzy termiki. W trawie leżą znajdźki. Tarcie spowalnia, więc to strefa odpoczynku i zbierania. | Faliste wzgórza z wędrującymi cieniami chmur, kołysząca się trawa, rzeka z odbiciem nieba, okna z ciepłym światłem. Szałwia i mięta łąk (zieleń krajobrazu dozwolona jako tło), miód, piasek, różowe dachy. | świerszcze, szum trawy, plusk, daleki dzwon, ćwierkanie | spokój, przytulność, „dom blisko” |

### 1.1 Zasady stref (jedna tabela, wszystkie do strojenia)

| Strefa | Opadanie przy szybowaniu | Tempo świata | Spadek prędkości | Jak wejść wyżej | Drapieżnik (udział ataków) |
|---|---|---|---|---|---|
| Nadchmurze | wiersz w dół co 2,5 s | x1,15 | x0,6 (prędkość się trzyma) | wyżej nie ma | brak (0%) |
| Chmury | co 3,6 s [kod: SINK_T] | x1,0 | x1,0 | tylko wiatrem: Schody światła (łańcuch ≥ 2) albo jetstream | rzadko (20%), gęsta chmura chowa |
| Powietrze | co 3,6 s | x1,0 | x1,0 | 3 machnięcia albo winda | najczęściej (55%) |
| Ziemia | 5,4 s do dotknięcia (efekt przy ziemi) | x0,85 | x1,4 (tarcie) | 2 machnięcia albo termika | czasem (25%), kryjówka w dziupli |

Nurkowanie w Nadchmurzu [decyzja]: przez pierwsze 1,2 s Okruszek składa skrzydła „w strzałę” bez utraty wiersza (tylko tak da się dobić do hiperprzestrzeni na szczycie), dłuższe przytrzymanie to zjazd do Chmur.
Dotknięcie ziemi [decyzja do potwierdzenia, pytanie 2]: pierwsze w biegu to **przysiad** (Okruszek siada w trawie na 1 s, kolor spada do bazowego, prędkość do L0, podskok do Ziemi), drugie to sen w trawie, czyli miękki koniec biegu (S3). W Morzu Pierzyn (K2) dół to powierzchnia morza chmur, a dotknięcie to sen na Pierzynce, jak dotąd.

### 1.2 Dół każdej krainy (wiersz Ziemi zmienia scenografię, zasady zostają)

| Kraina | Pora | Dół | Charakter dołu |
|---|---|---|---|
| K1 Nad Wielką Górą | zmierzch | zbocze Wielkiej Góry: hala, świerki, strumień | wiatr zboczowy, pierwsze znajdźki |
| K2 Morze Pierzyn | noc | Pierzyny: miękka powierzchnia morza chmur, Pierzynka | fale Pierzyn, świetliki, sowa tylko pohukuje |
| K3 Kamienny Las | świt | dachy miasteczka, kominy, dzwonnica, pranie | komin ciepła, wieże, mgła poranna |
| K4 Wietrzne Schody | dzień | łąki i pola: wiatraki, strach na wróble, bociany | latawce, wróble z pola, dziupla, pierwszy jastrząb |
| K5 Szlak Żelaznych Gęsi | popołudnie | rzeka, wieś, pola przy lotnisku z rękawem wiatrowym | bryza (rękaw ją zapowiada), klucz gęsi |
| Dalekie Niebo | dowolna | remiks wszystkich dołów | wszystko według pory |

---

## 2. Bestiariusz stref

Kolumny: **Klasa** S0 brak kary, S1 lekka, S2 mocna, S3 koniec biegu (tylko drapieżniki, morze chmur, drugie dotknięcie ziemi). **Rzadkość**: częsty (≥ 1 na 10 s, gdy aktywny), średni (1 na 30-60 s), rzadki (1 na 2-5 min), bardzo rzadki (talia, 1 na 10 min i rzadziej). **Debiut**: najwcześniejsza kraina i poziom. **Grafika**: ist. = jest w kodzie (czasem przemalowanie lub skala), nowa = do narysowania. Zapowiedź każdej przeszkody ≥ 1,5 s, drapieżnika ≥ 2 s (C22). Znak w nawiasie = znak w macierzach fraz (sekcja 7).

### 2.1 Ziemia (28 typów)

**Przeszkody**

| Typ | Klasa | Co robi | Zapowiedź, jak unikać | Rzadkość | Debiut | Grafika |
|---|---|---|---|---|---|---|
| Drzewo, korona (d) | S1 | odbicie, wirowanie 0,8 s, s -0,08, listki | korona rośnie z horyzontu, cień od 2 s; obok albo górą | częsty | K1 L0 | nowa |
| Fala Pierzyn (q) | S1 | miękkie wybrzuszenie morza chmur, s -0,06 | pierzyna puchnie 2 s; obok albo wyżej | częsty | K2 L0 | ist. (morze chmur) |
| Dach kamienicy (c) | S1 | odbicie jak od drzewa | kalenica i okna od 2 s; nad dachem albo ulicą | częsty | K3 L0 | nowa |
| Wieża z dzwonem (W) | S1 | trzon w Ziemi i Powietrzu jednej kolumny | „bim-bam” 2 s; sąsiednia kolumna albo górą | średni | K3 L0 | ist. (wieża Z11 + dzwon) |
| Wiatrak (w) | S1 | zajęta komórka, śmigła tylko dekoracją (bez wyczucia czasu), obok poryw | śmigła z daleka, szum 2 s; obok | średni | K4 L0 | nowa |
| Sznur z praniem (n) | S1 | 2 komórki w wierszu; skarpetka owija Okruszka | pranie powiewa 2 s; trzecia komórka albo wyżej | średni | K3 L1 | nowa |
| Strach na wróble (t) | S1 | macha rękawem; szept „Nie boję się. Prawie.” | sylwetka od 2 s; obok albo górą | rzadki | K4 L0 | nowa |
| Wróble z pola (p) | S1 | stadko zrywa się do Powietrza nad sobą | kłosy kołyszą się 1,5 s; nie lecieć w nie ani tuż nad | średni | K4 L1 | ist. (stado, mniejsze) |
| Bociany na łące (j) | S0 | widowisko; jeden zrywa się i zapowiada bociana w locie | widać od horyzontu; nie kolidują | rzadki | K4 L0 | nowa |

**Wiatry**

| Wiatr | Trasa | Wartość | Łańcuch | Zapowiedź | Debiut | Grafika |
|---|---|---|---|---|---|---|
| Termika nad polem (u) | Ziemia → Powietrze | 1,0 j. | tak | drżące powietrze, dmuchawce wirują w górę | K1 L0 | ist. |
| Wiatr zboczowy (U) | Ziemia → Chmury (+2, tylko z Ziemi) | 1,0 j. | tak | trawy kładą się pod górę, czapka chmury | K1 L0 | ist. |
| Bryza znad rzeki (< >) | o kolumnę w bok | 0,8 j. | tak | zmarszczki na wodzie, w K5 rękaw wiatrowy | K1 L0 | ist. |
| Komin ciepła nad dachem (k) | Ziemia → Powietrze + wysokość | 0,5 j. | **nie** (nie zrywa, nie przedłuża) | drgające powietrze nad dachem | K3 L0 | ist. [kod Z11] |
| Poryw od wiatraka (< >) | o kolumnę od wiatraka | 1,0 j. | tak | śmigła przyspieszają 1,5 s | K4 L1 | ist. |
| Termika ratunkowa (u) | Ziemia → Powietrze, w komórce Okruszka, raz na 30 s | 1,0 j. | tak, szersze idealne wejście | puch wiruje pod Okruszkiem 1,8 s | K1 L0 | ist. [kod Z10] |

**Znajdźki** (żadna nie jest walutą: trafia do Zeszytu jako obrazek, nigdy jako liczba)

| Znajdźka | Za co | Wartość emocjonalna | Rzadkość | Debiut | Grafika |
|---|---|---|---|---|---|
| Okruszki z pikniku | przelot nad kocem w kratkę | imię bohatera: „To ja?”, strona „Skąd moje imię” | średni | K1 L0, dzień | nowa |
| Puch dmuchawca do gniazda | przelot przez łąkę z dmuchawcami | gniazdo w Zeszycie mości się puchem: tęsknota za domem | częsty | K1 L0, dzień | nowa |
| Pióro w trawie | przelot przez komórkę z piórem | strona o ptaku, poznawanie świata | średni | K1 L0 | ist. |
| Wspomnienie w trawie | dotknięcie bańki (dryfuje nisko, wolno) | jedno z 15 wspomnień Zeszytu (00, 3.3) | rzadki | K1 L0 | nowa |
| Świetliki | przelot nisko nocą | lecą wokół Okruszka i gasną od strony sowy | średni | K2 L0, noc | ist. (drobiny) |
| Motyl z kartki | lot za motylem 2-3 plastry | prowadzi do ukrytej znajdźki, mały sekret | rzadki | K4 L1, dzień | nowa |

**Drapieżniki, bonusy, nerfy**

| Typ | Klasa | Co robi | Zapowiedź, ucieczka lub użycie | Rzadkość | Debiut | Grafika |
|---|---|---|---|---|---|---|
| Jastrząb nad polem | S3 | zaznacza komórkę i uderza po 1,6 s; przy ziemi nie ma ucieczki w dół | cień na łące 2,6 s; zmiana komórki, dziupla, prędkość od Złota | rzadki | K4 L0, dzień | ist. |
| Sowa nad łąką | S3 | poluje nisko i cicho | świetliki gasną, „huu” 2,6 s; w górę do chmur, zmiana komórki | rzadki | K3 L0, noc | ist. |
| Słoneczna polana (=) | S0 | 5 s: zagrożenia wstrzymane, opadanie stoi, pewne wspomnienie | słup światła 3 s; zejść i wlecieć | rzadki | K1 L0, dzień | ist. (promienie) |
| Ciepła rzeka (_) | S0 | 3-5 plastrów wzdłuż rzeki: bez przeszkód naziemnych, opadanie 2 x wolniej, kolor stoi | odbicie nieba od horyzontu; środek Ziemi | średni | K1 L0 | nowa |
| Dąb z dziuplą (h) | S0 | w pościgu: drapieżnik traci trop, Okruszek chowa się na 1 s | ciepłe światło w dziupli, tylko przy zapowiedzi drapieżnika | rzadki | K4 L0 | nowa |
| Mgła poranna nad rzeką (~) | S1 | wiersz Ziemi 3-4 plastry: kolor gaśnie, widać tylko 1,5 s naprzód | biała ściana 2 s; podlecieć do Powietrza | średni | K3 L0, świt | ist. |
| Pyłki, apsik! (:) | S1 | kichnięcie: podskok o pół komórki, s -0,05, łańcuch zostaje | złota mgiełka 2 s; ominąć kwitnącą komórkę | średni | K4 L1, dzień | nowa |

### 2.2 Powietrze (28 typów)

**Przeszkody**

| Typ | Klasa | Co robi | Zapowiedź, jak unikać | Rzadkość | Debiut | Grafika |
|---|---|---|---|---|---|---|
| Większy ptak (P) | S1 | przylatuje z sąsiedniej komórki, piórka | skrzydła i szkic toru 2 s; zejść z toru | częsty | K1 L0 | ist. |
| Klucz gęsi (V) | S1 | 2-3 komórki wiersza; koniec klucza wolny (autostop) | „gę-gę” i V od 2,5 s; wolna komórka | średni | K5 L1, dzień | ist. (stado) |
| Bocian w locie (C) | S1 | duży, powolny: 2 plastry w tej samej komórce | zrywa się z łąki 2,5 s; łatwy, uczy skali | średni | K4 L0, dzień | nowa |
| Motolotnia (M) | S1 | przelot ukosem przez Powietrze i Chmury, za nią turbulencja | brzęczenie 2 s; przeciwna strona | średni | K4 L1 | ist. [Z14, prosta] |
| Balon na ogrzane powietrze (O) | S1 | zajmuje komórkę; obok ciepły podmuch palnika (winda) | kopuła z daleka, syk 2 s; nigdy czerwony (C12) | rzadki | K4 L1, dzień | nowa |
| Mały samolot, dwupłatowiec (A, a) | S1 | przelot przez cały wiersz (A) lub kolumnę (a) | warkot i cień 2,5 s; opuścić wiersz lub kolumnę | średni | K5 L1 | ist. [Z14, Z11] |
| Sznur latawca (K) | S1 | sznur przez Ziemię i Powietrze, latawiec w Chmurach | latawiec wyżej, sznur rysuje się 1,5 s; sąsiednia kolumna | częsty | K4 L0, dzień | ist. [Z11] |
| Szpila miasta, wieża (S) | S1 | niska: Ziemia; wysoka: Ziemia i Powietrze; najwyższa do Chmur | sylwetka z oknami 2 s; aleja środkiem | częsty | K3 L0 | ist. [Z11, 8 sylwetek] |
| Szybowiec (G) | S0 | cicho krąży nad termiką: pokazuje, gdzie czeka winda | długie skrzydła w oddali; lecieć pod niego | rzadki | K4 L1, dzień | nowa |
| Dron-klonik (e) | S1 | ogrodowy dron ze śmigiełkami jak nasiona klonu | bzyczenie 2 s; zejść z toru | bardzo rzadki | Dalekie Niebo L2 | nowa, **opcja** (00 odrzucił drona-listonosza) |

**Wiatry**

| Wiatr | Trasa | Wartość | Łańcuch | Zapowiedź | Debiut | Grafika |
|---|---|---|---|---|---|---|
| Wiatr z tyłu na wprost (F) | bez zmiany komórki; **tylko środkowa kolumna Powietrza i Chmur** | 1,25 j. | tak | wstęga biegnie środkiem toru | K1 L0 | ist. |
| Winda o wiersz (u) | Powietrze → Chmury | 1,0 j. | tak | wstęga skręca w górę | K1 L0 | ist. |
| Wiatr poprzeczny (< >) | o kolumnę | 1,0 j. | tak | wstęga zakręca w bok | K1 L0 | ist. |
| Winda dół-środek (D) | Chmury lub Nadchmurze → środek Powietrza | 1,1 j. | tak | wstęga lejkiem do środka | K2 L1 | ist. |
| Poryw latawcowy (u) | Powietrze → Chmury | 1,0 j. | tak | latawce szarpią w górę 1 s | K4 L0 | ist. [Z11] |
| Smuga za Wielkim przelotem (X) | ta sama komórka, ok. 3 s | 1,25 j. (najwyżej 1,5) | tak, jeden prąd | cień olbrzyma, smuga opada 2,7 s; od s 0,35 | K5 L2 | ist. [Z11] |

**Znajdźki, drapieżniki, bonusy, nerfy**

| Typ | Klasa | Co robi | Zapowiedź, ucieczka lub użycie | Rzadkość | Debiut | Grafika |
|---|---|---|---|---|---|---|
| Drobiny akwareli | S0 | plama koloru tylko wokół Okruszka na 3 s (C13): przedsmak nagrody | unoszące się krople pigmentu | częsty | K1 L0, dzień | ist. (drobiny) |
| Pióro z podróży | S0 | spada po spotkaniu z ptakiem; jastrzębie i sowie tylko po ucieczce | pióro wiruje 2 s | średni | K1 L0 | ist. |
| Papierowy samolocik | S0 | leci obok 5 s i nurkuje; za nim ukryty wiatr i pocztówka | szelest papieru | rzadki | K4 L1, dzień | nowa |
| Nasionka klonu | S0 | wirujące „helikopterki”: krótka melodia, strona „Drzewo przy domu” | wirują w dół 2 s | średni | K1 L0, dzień | nowa |
| Jastrząb w powietrzu | S3 | główne łowisko (55% ataków); 3 ataki na komórki, potem odlatuje | cień i niska nuta 2,6 s, zaznaczenie komórki 1,6 s; zmiana komórki, Złoto, gęsta chmura | rzadki | K4 L0, dzień | ist. |
| Sowa w powietrzu | S3 | nocny odpowiednik jastrzębia | pohukiwanie, świetliki gasną; w górę do chmur | rzadki | K3 L0, noc | ist. |
| Autostop za kluczem gęsi | S0 | 6 s w szyku: opadanie stoi, s stałe, wejście = jeden wiatr | wolne miejsce na końcu klucza świeci | rzadki | K5 L1, dzień | ist. |
| Fiuk prowadzi | S0 | po 2 wiatrach z rzędu zawijas Fiuka leci na czele i podświetla następny wiatr | zawijas z oczkami | częsty | K1 L1 | ist. [Z11] |
| Wiatrołap | S0 | raz na bieg wiatr z tyłu 1,5 j., relacja na wiele dni | wróbel z pióropuszem | rzadki | K3 L1 | nowa, **v2** |
| Flauta (%) | S1 | wiersz Powietrza 3 plastry: wiatry śpią, opadanie x1,3 | blada mgiełka i cisza 2 s; do Chmur albo Ziemi | średni | K3 L1 | ist. (mgła, inny ton) |
| Wiry i turbulencja (v) | S1 | drżenie do 8 px 1,2 s, czułość -40%, znos [kod Z11] | zawirowane kreski po bokach smugi; środek smugi | średni | K5 L2 | ist. |
| Szkwał, wiatr boczny (&) | S1 | znosi o kolumnę wbrew woli, bez prędkości | falujące linie z boku 2 s; ruch w przeciwną stronę | średni | K4 L1 | ist. [Z3b] |

### 2.3 Chmury (24 typy)

**Przeszkody** (kolor = siła, zgodnie z 15.4 i 15.7; liczby z `CHMURY_TOR` [kod Z14])

| Typ | Klasa | Co robi | Zapowiedź, jak unikać | Rzadkość | Debiut | Grafika |
|---|---|---|---|---|---|---|
| Biała chmurka (b) | S1 | s -0,04, energia koloru x0,85 | kłąb rośnie od 2 s; można przelecieć tanio | częsty | K1 L0 | ist. |
| Lawendowa chmura (l) | S1 | s -0,08, energia x0,7; gęsta: chowa przed drapieżnikiem | lawendowy kłąb 2 s; obok albo jako kryjówka | częsty | K1 L0 | ist. |
| Szara chmura deszczowa (s) | S1 | s -0,13, energia x0,5, mokre piórka 5 s; gęsta | kreski deszczu 2 s; obok | częsty | K2 L0 | ist. |
| Fioletowa chmura burzowa (f) | S2 | s o poziom w dół, energia x0,3 | ciemniejący fiolet i pomruk 2 s; nigdy przez | średni | K3 L1 | ist. |
| Chmura gradowa (H) | S2 | trafienie: wiersz w dół | stukanie, białe kropki 2 s; obok | średni | K2 L1 | ist. |
| Tornado, lejek (T) | S2 | 2 komórki w pionie (Chmury i Powietrze), wciąga i znosi o kolumnę | lejek rośnie 2,5 s; kolumna dalej | rzadki | **K5** L2 | ist. [Z14] |
| Burza z piorunem (B) | S2 | wirowanie 1 s, poziom w dół, błysk (≤ 3 na s; bez błysku przy ograniczeniu ruchu) | niebo ciemnieje 2 s, pomruk; inny wiersz | rzadki | **Dalekie Niebo** L2 | ist. [Z14] |
| UFO Bączek (Y) | S1 | środek wiru: wirowanie 0,8 s; bez wiązki i bez wciągania (C15) | kręcący się talerzyk 2 s; komórka obok = proca | bardzo rzadki | K2 L1, noc | ist. [Z14, prosta] |

**Wiatry**

| Wiatr | Trasa | Wartość | Łańcuch | Zapowiedź | Debiut | Grafika |
|---|---|---|---|---|---|---|
| **Schody światła (^)** | Powietrze lub Chmury → Nadchmurze; działa tylko przy łańcuchu ≥ 2, inaczej blady szkic (nie działa i nie zrywa) | 1,25 j. | tak (zwykle trzeci = pełny kolor) | stopnie światła zapalają się po drugim wietrze z rzędu | K1 L1 (finał K1) | nowa (prosta) |
| Zjazd (Z) | o wiersz w dół z przyspieszeniem (także z Nadchmurza) | 1,35 j. | tak | wstęga opada | K1 L0 | ist. |
| Tęcza księżycowa (r) | pod łukiem, ta sama komórka; suche piórka | 1,0 j. | tak | blady łuk po deszczu; kolor tylko łuku | K2 L0, noc | ist. [Z11] |
| Proca Bączka | komórka obok UFO, zgodnie z obrotem | 1,0 j. | tak | spirala kresek | K2 L1, noc | ist. |
| Delfin z chmur (u) | Powietrze → Chmury po grzbiecie | 1,0 j. | tak | plusk chmur i łuk 2 s | K2 L1 | nowa, **opcja** |

**Znajdźki, drapieżniki, bonusy, nerfy**

| Typ | Klasa | Co robi | Zapowiedź, ucieczka lub użycie | Rzadkość | Debiut | Grafika |
|---|---|---|---|---|---|---|
| Chmura w kształcie | S0 | pocztówka: gniazdo, mama, babcia z drutami, rogal, złote jajko | kształt z daleka; przelecieć obok | rzadki | K1 L0 | nowa |
| Kropla tęczy | S0 | plama barwy wokół Okruszka; 3 krople malują łuk w Zeszycie | mieniąca się kropla po deszczu | średni | K2 L0 | nowa |
| Wspomnienie w chmurach | S0 | wspomnienie sekretne (od Turbo albo o konkretnej porze) | złota poświata w chmurze | rzadki | K1 L3 | nowa |
| Jastrząb przy chmurach | S3 | atakuje rzadziej, w gęstej chmurze traci trop | cień na chmurach 2,6 s; lawenda, szara, fiolet, tunel | rzadki | K4 L0, dzień | ist. |
| Sowa pod chmurami | S3 | nie wlatuje w chmury: wlot w gęstą chmurę kończy pościg | „huu” z dołu 2,6 s | rzadki | K3 L0, noc | ist. |
| Zielona chmura-oaza (o) | S0 | opadanie stoi 4 s, energia nie gaśnie 4 s, s nie maleje | miętowy kłąb z jasnym środkiem | średni | K2 L0 | ist. [Z14] |
| Tunel w chmurze (#) | S0 | 3 plastry korytarza w środku Chmur: bez przeszkód, gubi drapieżnika; wylot = jeden prąd 1,5 j.; kolor gaśnie na 1,5 s | kumulus z otworem i promieniami | rzadki | K3 L1 | nowa |
| Słońce zza chmury (=) | S0 | przelot przez promień: energia nie gaśnie 3 s (łaska dla łańcucha) | promienie między chmurami | średni | K1 L1, dzień | ist. (promienie) |
| Zatruta zielona mgła (g) | S1 | s -0,10, energia koloru do zera; czytelna od Konturu | zielonkawy kłąb z bąbelkami; obok | średni | K2 L1 | ist. [Z14] |
| Gęsta mgła (~) | S2 | wiersz Chmur 3-4 plastry: kolor gaśnie, poziom w dół | szara ściana 2 s; zejść do Powietrza | średni | K3 L1 | ist. [Z3b] |
| Mokre piórka | S1 | komórka pod szarą chmurą: 5 s wolniej, kolor gaśnie szybciej | kreski deszczu; tęcza zdejmuje mokre piórka | częsty | K2 L0 | ist. |

### 2.4 Nadchmurze (16 typów)

| Typ | Rodzaj | Klasa | Co robi | Zapowiedź, unikanie lub użycie | Rzadkość | Debiut | Grafika |
|---|---|---|---|---|---|---|---|
| Odrzutowiec wysoko (A) | przeszkoda | S1 | przelot przez cały wiersz, za nim smuga | daleki szum, biała kreska 2,5 s; zjazd albo smuga | średni | K5 L2 | ist. [Z11] |
| Iskry meteorów (m) | przeszkoda | S1 | ukośna smuga przez komórkę, błysk, s -0,08 | jasny punkt rośnie 1,5 s; komórka obok | średni | Dalekie Niebo L3, noc | ist. (smugi hiper) |
| Zagubiony satelita (@) | przeszkoda | S1 | koziołkuje i piszczy „bip”, zgubiony jak Okruszek | „bip” i błysk paneli 2 s | rzadki | Dalekie Niebo L3 | nowa |
| Wir na brzegu jetstreamu (v) | przeszkoda | S1 | znos o kolumnę, drżenie 0,8 s | zawirowane kreski przy brzegu; środek rzeki | średni | K5 L3 | ist. (wiry Z11) |
| Jetstream (J) | wiatr | S0 | jeden prąd na wlocie, potem niesie 3 s; J w kolejnych plastrach jednej kolumny = jedna rzeka | szeroka wstęga lawendy i miodu; 1,25 j. | średni | K5 L3, dzień | ist. (wstęga) |
| Smuga kondensacyjna (X) | wiatr | S0 | prąd długi za odrzutowcem, najwyżej 1,5 j. | biała kreska; 1,25 j. | średni | K5 L2 | ist. |
| Promień zachodu (y) | wiatr | S0 | złota droga na wprost, jeden prąd | złoty pas od słońca; 1,25 j. | średni | K1 L2, zachód | ist. (promienie) |
| Gwiezdne smugi (hiper) | wiatr | S0 | w hiperze co plaster smuga gwiazd, każda jeden prąd, podtrzymuje L5 | promieniste smugi; 1,0 j. | częsty | L5 | ist. [Z3b] |
| Zorza | wiatr | S0 | 3 zasłony = naturalny łańcuch nocą | brzeg nieba zielenieje | rzadki | Dalekie Niebo, noc | nowa, **v2** |
| Złote pióro słońca | znajdźka | S0 | sekretne wspomnienie („Ostatni promyk”, „Szybciej niż samolot”) | złoty błysk 2 s | bardzo rzadki | K1 L4, zachód | nowa |
| Spadająca gwiazda | znajdźka | S0 | lot równolegle 3 s = życzenie: cichy prezent (pióro, tęcza, wiatr obok) | dzwoneczek i kreska przez niebo | rzadki | K2 L2, noc | nowa |
| Gwiazdozbiór Małego Ptaka | znajdźka | S0 | 7 kropek łączy się złotą linią | kropki zapalają się po kolei | rzadki | Dalekie Niebo, noc | nowa, **v2** |
| Nad wszystkim | bonus | S0 | pierwsze wejście w biegu: 2 s bez przeszkód, panorama | kurtyna chmur rozsuwa się w dół | średni | K1 L1 | ist. (kurtyna Z10) |
| Hiperprzestrzeń | bonus | S0 | L5 przez 6 s: ptaszek świeci, brak pościgów, na końcu zjazd do Chmur | chromatyczny rozbłysk | rzadki | L4 → L5 | ist. [Z3b] |
| Ogon komety | bonus | S0 | jeden prąd, bez skoku ponad CAP4 bez łańcucha (C8) | ślad pędzla 3 s | bardzo rzadki | Dalekie Niebo L4, noc | nowa, **v2** |
| Lodowe pierzaste chmurki (i) | nerf | S1 | energia -0,2, okno łańcucha -0,4 s przez 3 s | cienkie pióra chmur 2 s; komórka obok | średni | Dalekie Niebo L3 | nowa |

Drapieżników w Nadchmurzu nie ma: jastrząb i sowa nie latają tak wysoko. To nagroda za wejście na szczyt, a jednocześnie trudność: opadanie co 2,5 s i brak machania.

---

## 3. Grafika: nowa czy istniejąca

63 typy korzystają z istniejących rysunków (chmury toru, ptak, stado, sowa, jastrząb, wieże, samolot, latawce, wiatry, mgła, grad, burza, tornado, UFO, tęcza, promienie, hiper, drobiny, kurtyna). 33 typy wymagają nowej grafiki. Kolejność rysowania [decyzja]:

| Priorytet | Nowe rysunki | Dlaczego najpierw |
|---|---|---|
| 1 (Z16, bez tego nie ma Ziemi) | krajobraz dołu (wzgórza, łąka, rzeka, wieś), drzewo, dach, ciepła rzeka, puch dmuchawca, okruszki z kocem, bańka wspomnienia, Schody światła | podstawa strefy Ziemi i wejścia do Nadchmurza |
| 2 (K3-K4) | wiatrak, sznur z praniem, strach na wróble, bociany (łąka i lot), balon, szybowiec, dąb z dziuplą, pyłki, motyl z kartki, papierowy samolocik, nasionka klonu, tunel w chmurze | treść krain K3-K4 |
| 3 (Nadchmurze, Dalekie Niebo) | satelita, lodowe pierzaste chmurki, złote pióro, spadająca gwiazda, chmura w kształcie, kropla tęczy, wspomnienie w chmurach | szczyt i rzadkie chwile |
| v2 i opcje | zorza, gwiazdozbiór, kometa, Wiatrołap, dron-klonik, delfin z chmur | po decyzji właściciela |

Zasady rysunku dla wszystkich nowych: bez ciemnych konturów (15.5), krawędź tonem; światła białe i miodowe, czerwień tylko w szaliku (C12); kolor obiektu według etapu koloru, jasna pastela od L0 (15.8); żadnych logo ani znanych budynków (przegląd Prawnika przed wdrożeniem, 00 1.3); dzwonnica bez symboli religijnych.

---

## 4. Liczby

Wszystkie liczby to [założenie] na start strojenia: bot w Z14 i Z16 sprawdza je i poprawia. Bazą są dane z kodu: odstęp przeszkód 9 s → 3,2 s, opadanie co 3,6 s, łańcuch 2,2 s, budżet `Z` (1 widowisko, 1 S2, 2 S1, 3 duże sprite'y, 120 cząstek).

### 4.1 Strefa x poziom: co i ile (dla laika)

Liczby to rzeczy (wiatry i przeszkody) na minutę lotu w danym wierszu, dla Kamiennego Lasu (K3) jako krainy środkowej. Znajdźki w ostatnim wierszu tabeli.

| Strefa | L0 Kontur | L1 Szarość | L2 Kolor | L3 Złoto | L4 Turbo | L5 Hiper |
|---|---|---|---|---|---|---|
| **Nadchmurze** | zamknięte: samo światło i blade Schody | pierwsze krótkie wejścia; ok. 2 na min | promień zachodu, smugi; ok. 6 | jetstream, odrzutowiec, meteory nocą; ok. 13 | ok. 20, połowa to wiatry | tunel gwiezdny: ok. 40, prawie same smugi i meteory |
| **Chmury** | białe i lawendowe chmurki, zjazd; ok. 7 | + szara, grad, oaza, zielona mgła; ok. 13 | + fiolet, tęcza, Schody; ok. 22 | + mgła, tunel; ok. 30 | + tornado, burza (DN); ok. 36 | zjazd gwiazd, oazy; ok. 17 |
| **Powietrze** | ptak, wiatr na wprost, winda; ok. 11 | + poprzeczne, flauta; ok. 15 | + latawce, motolotnia; ok. 19 | + samoloty, klucz, smuga; ok. 26 | ok. 31 | ok. 7 (tu prawie nikt nie leci) |
| **Ziemia** | drzewa, termiki, puch, okruszki; ok. 10 | + dachy, pranie, mgła poranna; ok. 13 | + wiatraki, wróble, pyłki; ok. 16 | ok. 17 | ok. 15 | ok. 3 |
| **Znajdźki na 100 m** (razem; 60% w Ziemi, 25% w Powietrzu, 10% w Chmurach, 5% w Nadchmurzu) | 3,0 | 2,5 | 2,0 | 1,5 | 1,0 | 0,5 |

Jak to czytać: szybki lot daje kolor i dalekie widoki, ale znajdźek jest mniej i są trudniejsze; spokojny lot przy ziemi daje skarby i odpoczynek.

### 4.2 Poziom x kraina: gęstość toru

W każdej komórce: **zajęte komórki z 12** w plastrze niepustym (wolne pola) · **wiatry / przeszkody na minutę** (w komórkach) · **odstęp plastrów** · **puste plastry** (oddech) · **znajdźki na 100 m** · **frazy z lawirowaniem**.

| Poziom | K1 Góra | K2 Pierzyny | K3 Kamienny Las | K4 Schody | K5 Gęsi | Dalekie Niebo |
|---|---|---|---|---|---|---|
| L0 | 1,7 (86%) · 11/6 · 1,76 s · 63% · 3,6 · 5% | 1,8 (85%) · 13/9 · 1,68 s · 59% · 3,0 · 5% | 2,0 (83%) · 15/13 · 1,6 s · 55% · 3,0 · 10% | 2,1 (83%) · 16/15 · 1,57 s · 53% · 3,3 · 15% | 2,2 (82%) · 17/17 · 1,54 s · 52% · 2,7 · 15% | 2,3 (81%) · 18/20 · 1,5 s · 50% · 2,4 · 20% |
| L1 | 2,0 (83%) · 16/12 · 1,54 s · 58% · 3,0 · 10% | 2,1 (83%) · 18/17 · 1,47 s · 54% · 2,5 · 15% | 2,3 (81%) · 21/23 · 1,4 s · 50% · 2,5 · 20% | 2,4 (80%) · 22/26 · 1,37 s · 48% · 2,8 · 25% | 2,5 (79%) · 23/30 · 1,34 s · 47% · 2,3 · 25% | 2,6 (78%) · 23/34 · 1,32 s · 45% · 2,0 · 30% |
| L2 | 2,2 (82%) · 22/21 · 1,32 s · 53% · 2,4 · 25% | 2,4 (80%) · 24/28 · 1,26 s · 49% · 2,0 · 30% | 2,6 (78%) · 27/37 · 1,2 s · 45% · 2,0 · 35% | 2,7 (78%) · 28/42 · 1,18 s · 43% · 2,2 · 40% | 2,9 (76%) · 30/49 · 1,15 s · 42% · 1,8 · 40% | 3,0 (75%) · 31/55 · 1,13 s · 40% · 1,6 · 45% |
| L3 | 2,4 (80%) · 25/32 · 1,1 s · 53% · 1,8 · 40% | 2,6 (78%) · 27/42 · 1,05 s · 49% · 1,5 · 45% | 2,8 (77%) · 30/55 · 1,0 s · 45% · 1,5 · 50% | 2,9 (76%) · 30/63 · 0,98 s · 43% · 1,7 · 55% | 3,1 (74%) · 31/72 · 0,96 s · 42% · 1,4 · 55% | 3,2 (73%) · 32/81 · 0,94 s · 40% · 1,2 · 60% |
| L4 | 2,6 (78%) · 25/43 · 0,99 s · 53% · 1,2 · 50% | 2,8 (77%) · 27/56 · 0,95 s · 49% · 1,0 · 55% | 3,0 (75%) · 29/73 · 0,9 s · 45% · 1,0 · 60% | 3,2 (73%) · 30/85 · 0,88 s · 43% · 1,1 · 65% | 3,3 (73%) · 29/93 · 0,86 s · 42% · 0,9 · 65% | 3,5 (71%) · 30/107 · 0,85 s · 40% · 0,8 · 70% |
| L5 | 1,9 (84%) · 24/20 · 0,88 s · 63% · 0,6 · 30% | 2,0 (83%) · 27/27 · 0,84 s · 59% · 0,5 · 35% | 2,2 (82%) · 31/37 · 0,8 s · 55% · 0,5 · 40% | 2,3 (81%) · 33/43 · 0,78 s · 53% · 0,6 · 45% | 2,4 (80%) · 34/48 · 0,77 s · 52% · 0,5 · 45% | 2,5 (79%) · 36/56 · 0,75 s · 50% · 0,4 · 50% |

Najwyżej S2 na minutę: K1 zero na każdym poziomie; od K2 rośnie od 0,4 (L1) do 2,6 (L4 w Dalekim Niebie); w L0 nigdy; w L5 najwyżej 0,7. Pełne liczby: `zawartosc.json`, klucz `gestosc`.
Dlaczego w L5 rzadziej: hiper trwa 6 s i ma być rozkoszą, nie testem; przeszkody to głównie meteory obok smug.
Dlaczego w L4 przeszkód dużo, a wiatrów mniej: Turbo ma być trudne do utrzymania (12.1: wiatry rzadsze w L4-L5), stan przejściowy, o który się walczy (14).
Odstęp plastrów nigdy nie spada poniżej 0,75 s (jeden ruch to ok. 0,2 s, zapowiedź od głębokości `Z_SPAWN` daje ≥ 2,7 s [kod Z14]).

### 4.3 Krainy: co nowego i ile

| Kraina | Nowa zasada (rodzina) | Debiutują typy | Drapieżnik | Typowo w L2: zajęte / wiatry / przeszkody na min | Znajdźki na 100 m (L2) | Finał |
|---|---|---|---|---|---|---|
| K1 Nad Wielką Górą | wiatry, chmury, bloki, znajdźki (nauka) | biała i lawendowa chmura, ptak, drzewo, F, u, U, < >, Z, termika ratunkowa, puch, okruszki, pióro, wspomnienie, drobiny, nasionka, chmura w kształcie, polana, rzeka, Fiuk (L1), słońce zza chmury (L1), Schody światła (L1), promień zachodu (L2) | brak | 2,2 / 22 / 21 | 2,4 | trzy w rytmie i pierwsze Schody światła |
| K2 Morze Pierzyn | strefy pogody + drobna: grad (S2) | fala Pierzyn, szara chmura, mokre piórka, grad, zielona mgła, oaza, tęcza księżycowa, winda dół-środek, świetliki, kropla tęczy, spadająca gwiazda, Bączek z procą (bardzo rzadko) | sowa tylko pohukuje | 2,4 / 24 / 28 | 2,0 | ulewa i łuk |
| K3 Kamienny Las | kolumny (wieże) + drobna: komin bez łańcucha | szpile, dach, dzwonnica, pranie, komin, fiolet, mgła poranna, gęsta mgła, flauta, tunel w chmurze | sowa nocą (pościg) | 2,6 / 27 / 37 | 2,0 | kanion wież z kominami |
| K4 Wietrzne Schody | pościg po komórkach z kryjówką | latawce, poryw, wiatrak, strach na wróble, wróble z pola, bociany, motolotnia, balon, szybowiec, szkwał, pyłki, motyl, samolocik, dąb z dziuplą | jastrząb: pierwszy pościg | 2,7 / 28 / 42 | 2,2 | festiwal latawców |
| K5 Szlak Żelaznych Gęsi | linie (samoloty, klucz) + drobna: wiry | klucz gęsi i autostop, mały samolot, smuga, turbulencja, tornado, odrzutowiec, smuga kondensacyjna, jetstream, wir jetstreamu | jastrząb rzadziej (hałas płoszy) | 2,9 / 30 / 49 | 1,8 | przelot olbrzyma |
| Dalekie Niebo | burza z piorunem, pełne Nadchmurze | burza, meteory, satelita, lodowe chmurki, dron (opcja); v2: zorza, gwiazdozbiór, kometa | oba według pory | 3,0 / 31 / 55 | 1,6 | brak (lot bez końca) |

### 4.4 Budżet uwagi naraz

Liczone w **oknie decyzji**: plastry od 0 do 1,5 s przed kontaktem. Kilka chmur w jednym plastrze to jedna jednostka uwagi (gracz czyta plaster jako całość).

| Co | Najwyżej naraz | Uwagi |
|---|---|---|
| widowisko (Wielki przelot, bociany, balon) | 1 | [kod: MAX_S0] |
| plaster z S2 | 1 | po plastrze z S2 następny plaster bez przeszkód w promieniu jednej komórki [decyzja] |
| plastry z S1 | 2 | [kod: MAX_S1] |
| drapieżnik | 1 | w pościgu: 0 S2, 0 widowisk, 0 nerfów strefowych; po pościgu 15 s oddechu [kod: CISZA_POSCIG] |
| nerf strefowy (mgła, flauta, pyłki, cirrus) | 1 | nigdy dwa wiersze naraz |
| bonus | 1 | polana, rzeka, oaza, tunel, autostop |
| znajdźki na ekranie | 2 | nigdy w pościgu, nigdy w tym samym plastrze co S2 |
| wiatry w oknie decyzji | 2 | żeby wybór był czytelny |
| zajęte komórki w plastrze | 7 z 12 | zawsze co najmniej 5 wolnych |
| duże sprite'y, cząstki | 3, 120 | [kod: MAX_DUZE, MAX_CZASTEK] |

### 4.5 Kiedy debiutuje każdy typ

- **W biegu:** pierwsze 20 s bez przeszkód, do 25 s tylko S1 [kod: START_CISZA, ROZGRZEWKA]; drapieżnik najwcześniej 120 s od Gniazda i 60 s od bramy [kod].
- **W krainie:** nowy typ pojawia się pierwszy raz jako pokaz bez kolizji przy ok. 30% długości krainy, a działa od ok. 50% (debiut bez kary); w finale krainy żadnych nowości.
- **Według poziomu:** typy z poziomem minimalnym (np. smuga od L2, jetstream od L3, złote pióro od L4) nie pojawiają się wolniejszym graczom; w Nadchmurzu do L1 widać tylko blade Schody.
- **Według pory:** jastrząb, motyle, drobiny, latawce w dzień; sowa, świetliki, Bączek, meteory, spadająca gwiazda nocą; mgła poranna o świcie; promień i złote pióro o zachodzie.
- **Reguła nowości:** najwyżej jedna nowa rodzina zasad i jedna drobna na krainę (00, C5). Rodziny: blok, ruchomy, chmura, przerzut, wiatr na wprost (K1); strefa, burza (K2); kolumna, bez łańcucha (K3); pościg z kryjówką (K4); linia, wir (K5). Nowy wygląd znanej rodziny (świerk, dach, wiatrak jako „blok”) jest wolny.
- Pełna lista: `zawartosc.json`, pole `debiut` każdego typu.

### 4.6 Lawirowanie

Fraza z lawirowaniem to taka, w której prosta droga jest zablokowana i trzeba zmienić kolumnę lub wiersz (np. „l.l” w Chmurach albo wiatr w komórce obok). Udział: od 5% (K1, L0) do 70% (Dalekie Niebo, L4); w L5 mniej (30-50%), bo hiper ma płynąć. Każdy łańcuch wiatrów jest ułożony tak, że następny wiatr leży w zasięgu jednego ruchu bez wznoszenia od celu poprzedniego (zasada Z14).

---

## 5. Zasady sensu i balansu

### 5.1 Wyżej = szybciej, krócej, trudniej
- **Dlaczego wyższa strefa jest szybsza:** rzadsze powietrze mniej hamuje (spadek prędkości x0,6 w Nadchmurzu, x1,4 przy ziemi), a świat leci szybciej (x1,15 kontra x0,85). Gracz czuje to bez tłumaczenia: na górze pęd, na dole spacer.
- **Dlaczego trudniejsza:** na górze szybciej się opada (co 2,5 s), nie da się wspiąć machaniem, a plastry przylatują częściej. Na górze trzeba żyć z wiatru do wiatru.
- **Dlaczego wyżej więcej koloru:** łańcuch wiatrów naturalnie wynosi w górę (termika, winda, Schody), więc pełny kolor (3 wiatry) zwykle zdarza się w Chmurach, a hiper (5 wiatrów + strzała) tylko w Nadchmurzu. Zasada „prędkość = kolor” z 2 i 14 zostaje, a wysokość staje się jej obrazem.

### 5.2 Ryzyko i nagroda w każdej strefie

| Strefa | Ryzyko | Nagroda |
|---|---|---|
| Ziemia | wolniej, tarcie, bloki naziemne, przy ziemi nie ma ucieczki w dół przed jastrzębiem | znajdźki (60% wszystkich), polana, rzeka, dziupla, termiki; bezpiecznie i pięknie |
| Powietrze | najwięcej drapieżników i ruchomych przeszkód | najwięcej wiatrów, środek z wiatrem na wprost, start każdego łańcucha |
| Chmury | każdy przelot przez chmurę spowalnia, burze i grad | oazy, tunele, kryjówki, Schody do góry, tęcza |
| Nadchmurze | szybkie opadanie, brak machania, meteory, satelita | najwyższa prędkość, brak drapieżników, hiper, złote pióro, najpiękniejszy widok |

### 5.3 Wiatry jako windy między strefami

```
NADCHMURZE   <-- Schody światła (^) tylko przy łańcuchu >= 2, albo jetstream
     |  zjazd (Z), winda dół-środek (D), koniec hipera
CHMURY       <-- winda (u), poryw, delfin; wiatr zboczowy (U) prosto z Ziemi
     |  zjazd (Z), szybowanie co 3,6 s, grad (S2)
POWIETRZE    <-- termika (u), komin (k), termika ratunkowa; start biegu
     |  szybowanie co 3,6 s, nurkowanie
ZIEMIA       przysiad (1. dotknięcie), sen w trawie (2. dotknięcie)
```

Typowy dobry rytm to „pompa”: termika w górę, wiatr na wprost, Schody na szczyt, kilka sekund pędu, zjazd z przyspieszeniem, i znowu w górę. Zjazd daje prędkość za wysokość, więc schodzenie niżej nie jest porażką, tylko częścią łańcucha.

### 5.4 Ile przebywać w strefie (cel dla bota)

| Gracz leci zwykle na | Nadchmurze | Chmury | Powietrze | Ziemia |
|---|---|---|---|---|
| L0 | 0% | 15% | 45% | 40% |
| L1 | 2% | 25% | 45% | 28% |
| L2 | 8% | 35% | 40% | 17% |
| L3 | 15% | 40% | 33% | 12% |
| L4 | 30% | 40% | 25% | 5% |
| L5 | 90% | 10% | 0% | 0% |

Pobyt w Nadchmurzu: 4-8 s bez łańcucha, do 15 s z jetstreamem, 6 s hipera plus zjazd. Ziemia: dowolnie długo, jeśli gracz łapie termiki (opadanie 5,4 s, termika ratunkowa raz na 30 s).

### 5.5 Drapieżnik przy ziemi a w chmurach
- **Przy ziemi** drapieżnik jest najgroźniejszy (pod spodem tylko trawa), ale Ziemia ma kryjówki: dziuplę dębu i ciepłą rzekę (bez przeszkód naziemnych, więc łatwo zmieniać komórki).
- **W powietrzu** jest najczęściej (55% ataków), ale tu najłatwiej uciec prędkością (od Złota, s 0,7 [kod: HAW_S]) albo w górę do gęstej chmury.
- **W chmurach** gubi trop: lawenda, szara i fiolet są gęste (kosztują prędkość, ale ratują), tunel chowa całkiem. Sowa w ogóle nie wlatuje w chmury.
- **W Nadchmurzu** drapieżników nie ma, a w hiperze nowy pościg nie startuje (C9).

### 5.6 Inne zasady sensu
- **Kolor chmury ma znaczenie** (15.7): biel lekko, lawenda średnio, szarość mocno, fiolet o poziom; zieleń tylko oaza (buff) i zatruta mgła (nerf); dekoracyjne chmury tła bez zieleni.
- **Budżet prędkości** (C8): każdy przyspieszacz liczy się jako jeden wiatr w łańcuchu albo nie podnosi prędkości ponad `CAP4`; L5 tylko przez `GATE5`. Komin to jedyny wyjątek bez łańcucha i daje najwyżej 0,5 j.
- **Uczciwość:** z każdej komórki plastra poprzedniego jest wolna komórka w zasięgu jednego ruchu (ta sama albo sąsiednia kolumna, ten sam albo niższy wiersz); zapowiedź ≥ 1,5 s, drapieżnik ≥ 2 s.
- **Bez presji:** znajdźki nie przepadają, nie mają liczb ani waluty; zebrane w wolnym locie są szkicem, a dopełniają się kolorem przy szybszym locie (03, 0.3).

---

## 6. Tryb pionowy i poziomy

| Sprawa | Pion 390 x 844 | Poziom 844 x 390 (sekcja 16) |
|---|---|---|
| Siatka | 3 kolumny x 4 wiersze | 5 kolumn x 4 wiersze (20 komórek); środek wiatru na wprost = kolumna 3 |
| Wielkość komórki na płaszczyźnie ptaszka | ok. 116 px szerokości, ok. 80 px między wierszami (zakres wierszy 0,46-0,74 wysokości, kod Z14) | zakres wierszy trzeba poszerzyć do ok. 0,30-0,82 wysokości, inaczej wiersze dzielą tylko ok. 36 px; wtedy ok. 68 px między wierszami i ok. 160 px komórki |
| Gęstość | tabela 4.2 | zajęte komórki x1,4 (nie x5/3: szerszy ekran ma dać więcej swobody), odstępy i budżet uwagi bez zmian |
| Kciuki i drążek | drążek w lewym dolnym rogu zasłania lewą komórkę Ziemi | kciuki w dolnych rogach (wcięcie 48 px) zasłaniają skrajne komórki Ziemi |
| Reguła dla Ziemi | małe znajdźki nie w komórce pod drążkiem | w skrajnych kolumnach Ziemi tylko scenografia i duże przeszkody, znajdźki w kolumnach 2-4 |
| Czytelność | najwyżej 2 różne rodzaje przeszkód w plastrze; kolor + kształt (nie sam kolor) | to samo; dodatkowe kolumny częściej puste (oddech dla oczu) |
| Frazy | jak w sekcji 7 | rozciągnięcie: kolumna lewa → 1 i 2, środek → 3, prawa → 4 i 5; nowe komórki puste albo kopia sąsiada (generator sprawdza uczciwość) |
| Napisy | strefa tekstu pod wskaźnikiem poziomu (C23) | ta sama, przesunięta poza strefy kciuków |

---

## 7. Dwanaście fraz toru

Macierz: kolumny pl1, pl2... to kolejne plastry (od najbliższego); w każdym plastrze trzy znaki = kolumna lewa, środek, prawa. Okruszek startuje w środku Powietrza.

| Znak | Znaczenie | Znak | Znaczenie |
|---|---|---|---|
| . | pusto | + | znajdźka (w Ziemi puch lub okruszki, wyżej drobiny, krople, pióro) |
| F | wiatr na wprost (tylko środek Powietrza i Chmur) | u | winda o wiersz w górę (termika, poryw) |
| U | wiatr zboczowy z Ziemi do Chmur | ^ | Schody światła do Nadchmurza (łańcuch ≥ 2) |
| D | winda dół-środek | Z | zjazd o wiersz w dół |
| < > | wiatr w lewo, w prawo | X | smuga |
| J | jetstream | y | promień zachodu (Nadchmurze) |
| r | tęcza księżycowa | k | komin ciepła |
| = | polana | _ | ciepła rzeka |
| o | zielona oaza | g | zatruta zielona mgła |
| b l s f | chmura biała, lawendowa, szara, fioletowa | B H T | burza, grad, tornado (2 komórki) |
| P | ptak | A | samolot w wierszu |
| v | wir | S | szpila (wieża) |
| K | sznur latawca | M | motolotnia |
| d | drzewo | w | wiatrak |
| t | strach na wróble | m @ | meteor, satelita |

### L0 Kontur

**F01 Pierwszy fiu (K1):** nauka wiatru na wprost ze środka.
```
              pl1   pl2   pl3
Nadchmurze    ...   ...   ...
Chmury        ...   b.b   ...
Powietrze     .F.   .F.   .F.
Ziemia        ...   +..   ..+
```
Jak grać: zostać w środku Powietrza; trzy wiatry z rzędu = pierwszy rozkwit koloru jako przedsmak. Kto zejdzie po puch, traci łańcuch, ale nic poza tym.

**F02 Łąka i termika (K1):** Ziemia jest bezpieczna i pełna skarbów.
```
              pl1   pl2   pl3   pl4
Nadchmurze    ...   ...   ...   ...
Chmury        ...   ...   .b.   ...
Powietrze     ...   ...   ...   ...
Ziemia        d.+   .u.   +.d   =..
```
Jak grać: zejść nisko, ominąć drzewa, zebrać puch, wziąć termikę w górę albo zostać na polanie.

### L1 Szarość

**F03 Bryza nad rzeką (K1):** wiatry poprzeczne przy ziemi i ptak.
```
              pl1   pl2   pl3
Nadchmurze    ...   ...   ...
Chmury        ...   ...   b..
Powietrze     .P.   ...   ..u
Ziemia        ..<   >.+   _..
```
Jak grać: ptak w środku Powietrza, więc w dół do bryzy; bryza tam i z powrotem, potem rzeka albo winda w prawo.

**F04 Białe owce (K1):** wiatr zboczowy z Ziemi prosto do Chmur, potem zjazd.
```
              pl1   pl2   pl3   pl4
Nadchmurze    ...   ...   ...   ...
Chmury        b.b   .l.   ..b   Z..
Powietrze     ...   ...   .+.   ...
Ziemia        ...   U..   ...   ...
```
Jak grać: lewy dół wynosi o dwa wiersze, między owcami w lewej kolumnie Chmur i zjazd z przyspieszeniem.

### L2 Kolor

**F05 Trzy wiatry (K1):** łańcuch trzech różnych wiatrów z lawirowaniem = pełny kolor i wejście do Nadchmurza.
```
              pl1   pl2   pl3
Nadchmurze    ...   ...   ...
Chmury        ...   l.l   ...
Powietrze     ...   .F.   ..^
Ziemia        .u.   ...   d..
```
Jak grać: termika ze środka Ziemi do środka Powietrza, wiatr na wprost, krok w prawo w Schody światła (to trzeci wiatr, więc schody już świecą).

**F06 Kolorowa bramka (K2):** czytanie koloru chmur.
```
              pl1   pl2   pl3   pl4
Nadchmurze    ...   ...   ...   ...
Chmury        l.s   g.o   s.l   .Z.
Powietrze     ...   .+.   ..r   ...
Ziemia        ...   ...   ...   ...
```
Jak grać: środkiem Chmur, w pl2 skręt w prawo do oazy (zielona mgła po lewej to pułapka), tęcza po prawej w Powietrzu albo zjazd środkiem.

### L3 Złoto

**F07 Kanion wież (K3):** aleja wież, komin, wiatr na wprost.
```
              pl1   pl2   pl3   pl4
Nadchmurze    ...   ...   ...   ...
Chmury        ...   ..f   ...   l..
Powietrze     S.S   ...   .F.   ..S
Ziemia        S.S   k..   S.S   ..S
```
Jak grać: środkiem alei, komin z lewego dołu daje wysokość bez łańcucha, wiatr na wprost w środku; fioletu nigdy nie przelatywać.

**F08 Festiwal latawców (K4):** sznury w kolumnach, wiatrak, motolotnia, poryw.
```
              pl1   pl2   pl3   pl4
Nadchmurze    ...   ...   ...   ...
Chmury        K..   ..M   ..K   K.K
Powietrze     K..   .u.   >.K   K.K
Ziemia        K.w   t..   ..K   .+.
```
Jak grać: lawirowanie między sznurami; poryw w środku Powietrza, poprzeczny z lewej kolumny do środka, na końcu jedyna wolna droga to środek.

### L4 Turbo

**F09 Przelot olbrzyma (K5):** samolot wierszem Chmur, smuga między wirami, Schody światła.
```
              pl1   pl2   pl3   pl4   pl5
Nadchmurze    ...   ...   ...   ...   ...
Chmury        ...   AAA   ...   ...   ...
Powietrze     PF.   ...   vXv   vXv   ..^
Ziemia        ...   ...   ...   .+.   ...
```
Jak grać: wiatr na wprost obok ptaka, nie wchodzić do Chmur, gdy leci samolot; smuga środkiem (dwa plastry to jedna smuga, czyli jeden wiatr), krok w prawo w Schody (trzeci wiatr = pełny kolor i Nadchmurze). Kadłub Wielkiego przelotu przelatuje nad głową jako widowisko S0.

**F10 Burza i tornado (Dalekie Niebo):** przeszkody S2 nie częściej niż co drugi plaster.
```
              pl1   pl2   pl3   pl4   pl5
Nadchmurze    ...   ...   ...   ...   ...
Chmury        B..   ..<   T..   .F.   H..
Powietrze     ...   u..   T.s   ...   ..^
Ziemia        ...   ..d   ...   ...   ...
```
Jak grać: winda z lewego Powietrza, przed tornadem krok do środka Chmur, wiatr na wprost, Schody po prawej (łańcuch 3).

### L5 Hiper

**F11 Jetstream do Hipera (Dalekie Niebo):** pięć wiatrów w Nadchmurzu.
```
              pl1   pl2   pl3   pl4   pl5
Nadchmurze    .J.   m.y   .@J   my.   J.m
Chmury        ...   ...   ...   ...   ...
Powietrze     ...   ...   ...   ...   ...
Ziemia        ...   ...   ...   ...   ...
```
Jak grać: jetstream, promień w prawo, jetstream w prawej kolumnie (satelita w środku), promień w środku, jetstream w lewej; razem z nurkowaniem-strzałą to L5.

**F12 Gwiezdny zjazd (Dalekie Niebo):** wyjście z hipera bez utraty łańcucha.
```
              pl1   pl2   pl3   pl4
Nadchmurze    mZm   ...   ...   ...
Chmury        ...   bDb   o..   ...
Powietrze     ...   ...   .F.   ..u
Ziemia        ...   ...   ...   .+.
```
Jak grać: zjazd między meteorami, winda do środka Powietrza, wiatr na wprost (oaza po lewej w Chmurach dla zmęczonych), winda w prawo z powrotem w górę.

Wszystkie 12 fraz przeszły kontrolę w node: uczciwość każdego plastra, łańcuchy osiągalne bez wznoszenia i w oknie 2,2 s, najwyżej jedna S2 w oknie decyzji, po S2 oddech w promieniu komórki, F tylko w środku, U tylko z Ziemi, Schody dopiero przy łańcuchu 2.

---

## 8. Zmiany względem kodu Z14 i dokumentów 00-04

| Co | Było | Jest [decyzja] | Dlaczego |
|---|---|---|---|
| Wiersze toru | 3 (Z14) | 4 strefy, start w Powietrzu | sekcja 16.2 |
| Wejście na szczyt | winda U z dołu na górę | U tylko z Ziemi do Chmur; do Nadchmurza tylko Schody światła (łańcuch ≥ 2) albo jetstream | 16.2: „wejście tu wymaga łańcucha” |
| Wiatr na wprost | środkowa komórka 3 x 3 | środkowa kolumna, wiersze Powietrze i Chmury | w 4 wierszach nie ma jednej środkowej komórki |
| Tornado | od K4 (`TOR_OD`) | od K5 | jedna nowa zasada na krainę: rodzina „wir” razem z wirami przelotu |
| Burza | od K5 (`TOR_OD`) | Dalekie Niebo | 00, C30; K5 ma już dwie nowości |
| Jetstream | v2 (00, 2.3) | v1.5, od K5 L3 | bez niego Nadchmurze byłoby puste (pytanie 5) |
| Wiatraki | odrzucone w 00 (precyzja czasu) | wiatrak jako blok w komórce, śmigła tylko dekoracją | w modelu komórek nie ma wyczucia czasu |
| Koniec biegu | jastrząb, sowa, morze chmur | + drugie dotknięcie Ziemi (pierwsze to przysiad) | Ziemia ma być przyjazna (pytanie 2) |

---

## 9. Decyzje właściciela (tak/nie)

| Nr | Pytanie | Propozycja | Jeśli „nie” |
|---|---|---|---|
| 1 | Na najwyższe piętro (Nadchmurze) wchodzi się **tylko wiatrem po dwóch wiatrach z rzędu** (Schody światła) albo jetstreamem, nie machaniem? | **tak** | 4 machnięcia z Chmur; szczyt łatwiejszy i mniej wyjątkowy |
| 2 | **Pierwsze dotknięcie ziemi to przysiad** (odpoczynek, kolor spada do delikatnego), dopiero drugie kończy lot? | **tak** | każde dotknięcie ziemi kończy lot, jak dziś lądowanie w morzu chmur |
| 3 | **Hiperprędkość tylko na szczycie**, a jastrząb i sowa nigdy tam nie wlatują? | **tak** | hiper w każdej strefie, drapieżnik może gonić wszędzie |
| 4 | **Tornado dopiero w krainie samolotów (K5), burza dopiero w Dalekim Niebie**, żeby każda kraina uczyła jednej nowej rzeczy? | **tak** | tornado od K4, burza od K5, jak w obecnym kodzie |
| 5 | **Jetstream (rzeka powietrza na szczycie) już w wersji 1.5**, choć wcześniej był odłożony? | **tak** | na szczycie tylko promienie i smugi; szczyt uboższy |

---

## 10. Walidacja danych

`zawartosc.json` wczytany w node 24 i sprawdzony skryptem (w katalogu roboczym sesji, nie w grze):
- 96 typów, 96 unikalnych id; każdy typ ma klasę S0-S3, rzadkość, debiut z istniejącą krainą i poziomem, grafikę, wersję i rodzinę; S3 tylko u drapieżników; każdy wiatr ma trasę, wartość w j. i flagę łańcucha;
- `gestosc` ma wpis dla każdego z 6 poziomów i każdej z 6 krain (36), udziały sumują się do 1; `rozkladWierszy` i `udzialCzasu` sumują się do 1 na każdym poziomie;
- 12 fraz (po 2 na poziom), każda 3-5 plastrów 3 x 4, tylko znaki z legendy, każdy plaster uczciwy, łańcuchy osiągalne, budżet S2 i oddech po S2 zachowane;
- kontrola odwrotna: celowo zepsuta kopia (zdublowane id, brak krainy w gęstości, plaster bez wyjścia, dwie S2 obok siebie, Schody przed łańcuchem) dała 11 błędów, więc walidator działa.
