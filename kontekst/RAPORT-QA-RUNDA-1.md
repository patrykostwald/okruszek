# Okruszek / Crumbi, tryb TOR (?tor=1): raport QA, runda 1

Data: 26.10.2026. Wersja: gałąź z17-integracja, commit e072659 (worktree gra-okruszek-QA1, gałąź qa1; kod gry bez zmian). Żywa strona https://zbudujmi.com/crumbi/ jest bajt w bajt tym samym commitem (porównanie pliku).
Metoda: Chromium 1134 headless (Playwright), dotyk przez CDP, hak ?test tam, gdzie trzeba czytać stan; user journey (A) i bot dotykowy (B) w czasie rzeczywistym. Skrypty: `qa\qa_*.cjs`, dane: `qa\wynik_*.json`, zrzuty: `qa\zrzuty\` (arkusze zbiorcze `_ark_*.png`).

## Podsumowanie (10 linii)
1. Stabilnie: 0 błędów konsoli w całej rundzie (lokalnie i na żywej stronie), CSP bez naruszeń, offline z service workerem działa, brak wycieku w 631 s czasu gry.
2. Ścieżka nowego gracza działa: wstęp, wybór sterowania, „Leć”, pauza, przeładowanie (wstęp pominięty), „Usuń zapis”, „Jeszcze raz” (53 ms).
3. Świat jest ładny i pastelowy od startu (15.8 spełnione w grze), ale ekrany startu, pauzy i końca są ciemnym granatem.
4. Największy problem: gra nie ma napięcia. Gracz, który na ślepo stuka co 0,7 s, przeżywa 300 s w 114 z 120 biegów, 92% czasu w górnym wierszu (nadchmurze), gdzie drapieżnik nie atakuje.
5. Nadchmurze osiąga się machaniem, a rozstrzygnięcie 17 nr 1 (zatwierdzone) mówi: tylko wiatrem po dwóch wiatrach z rzędu.
6. Pełny kolor jest za łatwy: bot „50%” ma go w ≤ 60 s w 45-75% biegów (cel sekcji 14: rzadko, ≤ 15%), a „idealne wejście” to 92-97% wszystkich wejść.
7. Turbo (L4) i Hiper (L5) są w torze praktycznie nieosiągalne: 0 s L5 i 1 raz L4 w 380 biegach botów, także z łańcuchem 7 wiatrów i nurkowaniem.
8. Przeszkody są nieczytelne w chwili decyzji: 1,5 s przed kontaktem chmura w komórce ptaszka ma ok. 20 px i wisi 188 px nad nim; sąsiednie komórki dzieli wtedy ok. 38 px.
9. Sterowanie: wszystkie 8 kierunków, machnięcie, szybowanie, nurkowanie i wybicie działają w trzech trybach i na klawiaturze; dwie pułapki: kciuk położony > 0,2 s zamienia przesunięcie w nurkowanie (tryb 1), a „oba kciuki” wymagają różnicy < 90 ms (tryb 2).
10. Wydajność: przy CPU x4 50 kl/s w L0 i 25-40 kl/s w gęstych scenach i L5; zimne ładowanie przy CPU x4 to 4,4 s do pierwszej klatki bez żadnego wskaźnika.

**Ocena ogólna (1-10):** piękno **7** · satysfakcja z lotu **4** · czytelność **4** · trudność (strojenie) **3** · stabilność **9**.
Liczba wpisów: **P0: 4 · P1: 12 · P2: 12.**

---

## P0 (blokuje: błąd, nieczytelne, niesprawiedliwe, łamie decyzje właściciela)

| Nr | Opis | Dowód | Proponowana poprawka | Szac. | Obszar |
|---|---|---|---|---|---|
| P0-1 | Górny wiersz (nadchmurze, S0, bez drapieżników) osiąga się machaniem; stukanie bez patrzenia daje nieskończony bieg. Łamie rozstrzygnięcie 17 nr 1 i 17.1 („tylko wiatrem po dwóch z rzędu, nie machaniem: TAK”). | `qa_c_boty.cjs`: bot „stukacz” (stuk co 0,7 s, nic więcej) przeżywa 300 s w 114/120 biegów (K1-K6), końce tylko przez jastrzębia (6/120). `qa_c2_cele.cjs`: stukacz 1108 z 1200 s w wierszu 0. Kroki: ?tor=1, „Leć”, stukaj w środek co 0,7 s; w A naiwny gracz leciał 60 s bez końca (zrzuty A05). | Wiersz 0 tylko z wiatru (U/Schody po łańcuchu ≥ 2) albo machanie do wiersza 0 bardzo drogie; w wierszu 0 szybsze opadanie (05: co 2,5 s) i limit pobytu; ewentualnie drapieżnik czeka pod nadchmurzem i atakuje po zejściu. | M | logika |
| P0-2 | Pełny kolor (E = 1) za łatwy; „idealne wejście” nie wymaga precyzji. Łamie kryterium sekcji 14 (bot 50%: trójka ≤ 15% serii, pełny kolor ≤ 2 s). | `wynik_c.json`: bot 50% (łapie co drugi wiatr, unika 85% przeszkód) ma E = 1 w ≤ 60 s w 9-15/20 biegów na krainę; najdłuższy ciągły pełny kolor mediana 3-3,5 s, max 6,25 s. Bot 70%: 12-20/20. Idealne wejścia: 92-97% wszystkich wejść (każdy bot). | Węższe IDEAL (ruch komórkowy i tak centruje ptaszka, więc mierzyć np. moment wejścia względem rytmu albo środka wstęgi), krótsze CHAIN_W, częściej wiatry poza drogą (wymóg lawirowania), szybszy FALL_E; strojenie testem botów. | M | logika |
| P0-3 | Turbo (L4) i Hiper (L5) praktycznie nieosiągalne w torze; HUD nigdy nie pokaże „Turbo” ani „Hiper”. Łamie 15.3 („parę pod rząd = hiperprędkość”) i 12.1. | 360 biegów botów po 300 s: poziom max 3. `qa_c2_cele.cjs`: bot idealny + nurkowanie przy łańcuchu, 20 × 240 s: łańcuch do 7, 10 wiatrów w 12 s, L4 raz (s max 0,804), L5 0 s. | Prędkość s w torze powiązać z łańcuchem tak, by 3 z rzędu dawały L4, a 5 w 12 s + nurkowanie przekraczało G.HY_S przez G.HY_HOLD; test: bot idealny L4 w ≤ 60 s, L5 osiągalny, bot 50% L5 nigdy. | M | logika |
| P0-4 | Przeszkody i wiatry nieczytelne w chwili decyzji: małe, wysoko nad ptaszkiem, komórki bardzo blisko siebie; kolor chmury (= siła kary) nierozróżnialny na zapowiedzi. | `qa_d3_zblizenie.cjs` (390 px): przy eta 1,5 s skala 0,33, chmura w komórce ptaszka na y 319, ptaszek na y 507; ta sama chmura w komórce prawo-dół na x 233 (różnica 38 px). Przy eta 0,5 s chmura z prawo-dół nachodzi na ptaszka (zrzut `_ark_D8.png`). Wszystkie 20 typów przy eta 1,5 s to plamki 10-20 px (`_ark_D7a.png`). Formalnie zapowiedź ≥ 2,95 s (`wynik_c3.json`), ale wzrokowo komórkę widać dopiero < 0,5 s. | Punkt zbiegu niżej i bliżej (większa skala na 1,5 s, min. ok. 0,6), cień przeszkody na „podłodze” jej komórki na wysokości ptaszka od 1,5 s, wyraźne kolory i większe chmury toru; test laika: „wskaż komórkę przeszkody” na zrzucie eta 1,5 s ≥ 9/10. | M-L | rysunek |

## P1 (ważne dla jakości i satysfakcji)

| Nr | Opis | Dowód | Proponowana poprawka | Szac. | Obszar |
|---|---|---|---|---|---|
| P1-1 | Brak presji: przeszkody tylko spowalniają, spowolnienie niczego nie grozi; aktywny gracz nie kończy biegu. | 360 biegów botów idealny/70%/50% × K1-K6 × 300 s: 0 końców. Bot dotykowy 3 × 5 min (B): 0 końców, 0 kar. „Leć jak najdalej” = „leć jak długo”. | Kara za chmurę także w wysokości (S1: opadanie szybsze przez 2 s, S2: wiersz w dół), tempo opadania rośnie z czasem, drapieżnik częściej i także w wierszu 0 (po P0-1); dystans zależny od prędkości (szybki lot = więcej metrów). | M | logika |
| P1-2 | Tryb 1: kciuk położony > 0,2 s przed przesunięciem = nurkowanie, a przesunięcie w bok jest ignorowane. | `qa_b_sterowanie.cjs` B1_kciuk_lezy_0_3s_potem_w_bok: kolumna bez zmiany, wiersz 1 → 2, nurkowanie. Kroki: dotknij, poczekaj 0,3 s, przesuń 60 px w bok. | Przesunięcie > SWIPE_D przerywa nurkowanie i wykonuje krok; przytrzymanie dopiero po 0,3 s bez ruchu. | S | sterowanie |
| P1-3 | Tryb 2: „oba kciuki naraz” tylko przy różnicy < 90 ms; 120 ms daje skręt zamiast mocnego machnięcia. Każde stuknięcie czeka 79 ms. | B2_ruchy: oba_30ms_rozjazd = mocne machnięcie, oba_120ms_rozjazd = kolumna w prawo. B2_opoznienie: 79 ms. | PARA_T ok. 0,15-0,18 s; ruch boczny od razu, a po drugim kciuku zamiana na mocne machnięcie (cofnięcie kolumny). Do testu na telefonie. | S | sterowanie |
| P1-4 | HUD w dzień nieczytelny: biały tekst na jasnym niebie. | Kontrast (WCAG) przy L0 dzień: DYSTANS 1,75:1, liczba metrów 2,0:1, WYSOKOŚĆ 1,75:1; świt L1: 2,05-2,46:1. Komunikat poziomu („KOLOR”) w dzień 1,33:1, nazwa krainy 2,0:1 (`D1-390-dzien-L2.png`). Noc: 5,9-9,3:1 (dobrze). | Tusz HUD zależny od jasności tła (ciemny fiolet #4a4f7a w dzień) albo miękka jasna plakietka; komunikat poziomu z cieniem tonalnym. Cel ≥ 3:1 dla liczb, ≥ 4,5:1 dla etykiet. | S | rysunek |
| P1-5 | Wstęp: zdania prawie niewidoczne, „Dotknij, żeby pominąć” niewidoczne; od wejścia do ekranu startu 15,3 s. | `A01-intro-4.0s.png`: kontrast zdania ok. 1,5:1, napisu pominięcia ok. 1,1:1 (biały na bladej lawendzie). | Ciemniejszy tusz zdań (lub ciemniejszy welon tylko pod tekstem), napis pominięcia ≥ 3:1; rozważyć skrócenie wstępu do ok. 9 s. | S | rysunek |
| P1-6 | Nakładanie w HUD: nazwa krainy („Kamienny Las”) leży na trzech iskierkach łańcucha. | `D1-390-dzien-L2.png`, `D5-360x640-noc-L5.png`, `F2-*.png`. | Nazwa krainy pod iskierkami (stała strefa tekstu) albo iskierki obok paska poziomu. | S | rysunek |
| P1-7 | Ekrany startu, pauzy panelu, końca i prywatności to ciemny granat 93% (rgba(13,18,36,.93)); po jasnym wstępie pierwszy ekran jest ciemny. Manifest: background/theme #0d1224 (ciemny ekran powitalny PWA). Sprzeczne z duchem 15.8 („start bez ciemności”). | `A02-start-390.png`, `A04-koniec-bierny.png`, `D4-*.png`. | Jasny, pastelowy wariant paneli (mleczna mgiełka z tuszem fioletowym), koniec biegu „zasypia na chmurce” w barwach szczytu biegu; manifest w jasnym kolorze. | M | rysunek |
| P1-8 | Opis trybu 2 ucięty przy 360 px: brak „nurkuj.” (pole .op ma stałe 51 px i overflow hidden). | `D4-360x640-start.png`. | Krótszy tekst albo 4 linie przy wąskim ekranie. | S | rysunek |
| P1-9 | Długie puste odcinki: do 21 s bez żadnego plastra (ani wiatru, ani przeszkody). | `wynik_c.json` „luka max”: bot idealny 14,8-21,2 s; `wynik_c2.json`: 17 przerw > 8 s w 12 biegach po 300 s (pościg, brama, cisza po bramie). | W czasie ciszy i pościgu i tak wiatry co ≤ 3 s; maks. 4 s bez niczego. | S | logika |
| P1-10 | Wiatry mało zachęcające i nieczytelne: małe żółte znaczki daleko w górze, kierunek (U, u, Z, D, <, >) trudny do odczytania. | `_ark_D7a.png`, `_ark_D7b.png` (wiatry przy eta 1,5 i 0,5 s), `A03-bierny-03s.png`. | Szersza wstęga w świecie biegnąca do komórki docelowej, kształt mówi kierunek (spirala w górę, opadająca fala), ciepły kolor zawsze ten sam dla wiatru. | M | rysunek |
| P1-11 | Wydajność poniżej celu 55 kl/s przy CPU x4; zimny start bez wskaźnika. | `wynik_e_fps.json` (bez innych procesów): CPU x1 ok. 100 kl/s, 2,4-4,3 ms/klatkę; CPU x4: L0 dzień 50 kl/s, L5 noc 40, gęsto 25-28; CPU x6: 20. `wynik_e.json`: jedno długie zadanie startu 1,8 s (x1), 3,7 s (x4), 5,4 s (x6); pierwsza klatka 1,9 / 4,4 / 6,7 s. Uwaga: w ?test tryb lekki jest wyłączony, więc w grze jest lepiej, ale niezmierzone. | Sprite'y budować etapami po pierwszej klatce (ekran startu od razu), prosty wskaźnik ładowania; profil L5 i gęstych scen. | M | logika / rysunek |
| P1-12 | Zawartość z 05 słabo odzwierciedlona w torze 3 × 3 (lista niżej); tornado od K4 i burza od K5 wbrew rozstrzygnięciu 4 (zatwierdzonemu; dopuszczono dostosowanie „przy scalaniu lub w Z16”). | Kod: TOR_OD T:4, B:5; TOR_KRAINY 4 ma T:0,5, 5 ma B:0,3. Bot w K4 spotyka tornada (wynik_c, idealny_K4 „T”: 76). | TOR_OD T:5, B:6 teraz; reszta listy w Z16. | S | logika |

## P2 (miłe do zrobienia)

| Nr | Opis | Dowód | Proponowana poprawka | Szac. | Obszar |
|---|---|---|---|---|---|
| P2-1 | Nazwa „Kontur” przy L0 nie pasuje do jasnego pastelowego świata (konturów już nie ma). | `hudNazwa()`: L0 „KONTUR”; zrzuty D1. | **„Mgiełka”** (szereg: Mgiełka, Pastel, Kolor, Złoto, Turbo, Hiper); zapas: „Brzask”. | S | rysunek |
| P2-2 | Noc: nagroda pełnego koloru słabo widoczna. | `wynik_d.json` przejście noc: jasność E0 104,9 → E1 91,0, nasycenie 0,36 → 0,46, 1 grupa odcieni; dzień 0,13 → 0,34. | Nocą więcej barwnych świateł (neonowa noc z 12.3). | M | rysunek |
| P2-3 | Koralowa poświata zachodu daje „czerwone” piksele poza szalikiem (konkuruje z szalikiem). | Zachód L4: 4,7% pikseli (czerwień: r > 1,6 g i > 1,4 b), zachód E = 1: 8,3%; dzień i świt ≈ 0. | Przesunąć zachód w brzoskwinię i róż pudrowy. | S | rysunek |
| P2-4 | Ptaszek zlewa się z jasnym niebem (błękitny na błękitnym); w L5 zamienia się w białą plamę. | `A03-bierny-03s.png`, `D1-390-dzien-L5.png`. | Cieplejszy brzuszek albo jasny rim light od strony nieba; w L5 mniejsza poświata na sylwetce. | S | rysunek |
| P2-5 | HUD ma ciemny obrys (nazwa poziomu, segmenty paska, iskierki); przycisk „sterowanie” to ciężka ciemna pigułka. | `A03-bierny-03s.png`. | Obrys tonalny lub jasna plakietka, przycisk półprzezroczysty jasny. | S | rysunek |
| P2-6 | Poziomo 844 × 390 panel startu wymaga przewinięcia do „Leć” (działa, #ster przewija się); na 1440 ciemne pasy boczne obok pionowej gry. | `D4-844x390-start.png`, `D4-1440x900-start.png`. | Układ poziomy w Z16; pasy boczne w kolorze nieba. | S | rysunek |
| P2-7 | Budżet uwagi z 05 (4.4) łamany w K5 i Dalekim Niebie: dwa plastry z S2 pod rząd; odstęp plastrów min. 0,55 s (05: ≥ 0,75 s). | `wynik_c3.json`: S2 pod rząd K5 7/29, DN 8/39; odstęp min 0,55 s we wszystkich krainach. | Filtr kolejki: po S2 plaster bez przeszkód obok drogi. | S | logika |
| P2-8 | Drapieżnik wg pory i krainy różni się od 05: sowa o zachodzie i w K5, jastrząb o świcie, sowa atakuje w K2 po pierwszej wizycie (05: K2 tylko pohukuje). | `wynik_c2.json` ataki: sowa@K2/noc 6, sowa@K3/zachód 12, sowa@K5 14, jastrząb@K4/świt 3. | Uzgodnić z 05 albo poprawić 05. | S | logika |
| P2-9 | Dostępność: fokus wychodzi z dialogu startu (Tab 8 → BODY); canvas bez role="img"; zmiana poziomu i zapowiedź drapieżnika nie trafiają do czytnika ekranu. | `wynik_f.json` klawiatura.kroki; dom.canvas. | Pułapka fokusu w dialogach, role="img" na canvasie, krótkie komunikaty w aria-live. | S | logika |
| P2-10 | Szpila (wieża) w górnym wierszu rysowana jako pionowy pręt wiszący w niebie. | `_ark_B.png` (B-bot-tryb2, B-bot-tryb1). | Wieże tylko od dołu (wiersz 2 i 1) albo rysunek z podstawą w chmurach. | S | rysunek |
| P2-11 | Adaptacyjna jakość: tylko w dół i nigdy w górę; wyłączona w ?test, więc niezmierzona. Ryzyko: chwilowy spadek przy starcie na stałe włączy tryb lekki. | Kod: frame(), „if (!TEST && dts.length >= 90)”. | Ignorować pierwsze 3 s po starcie i po bramie; hak do odczytu stanu poza ?test. | S | testy |
| P2-12 | Wstęp na starcie: 0,9 s pustego welonu, potem 3 zdania; całość 12,6 s + ładowanie. | `A01-intro-0.5s/1.6s.png`, A_ekran_startu 15,3 s. | Pierwsze zdanie od 0,3 s, krótszy wlot. | S | rysunek |

---

## Szczegóły pomiarów

### A. User journey (czas rzeczywisty, czysty profil, bez ?test; `qa_a_journey.cjs`, `wynik_a.json`)
- Ładowanie lokalne: load 1,9 s (przesył 554 kB, bez kompresji lokalnie); żywa strona: 170 kB (zstd), TTFB 148 ms, load 1,1 s.
- Wstęp: 3 zdania widoczne (A01), ekran startu po 15,3 s; „Wybierz sterowanie”, tryby 92 px, suwak 46 px, „Leć” 200 × 52, „Prywatność” 161 × 46.
- Bierny gracz (nic nie robi): koniec po 30,8 s, 314 m, „Okruszek zasnął na chmurce…” (A03, A04); ratunkowy wiatr raz go podniósł (A03-20s).
- Czy laik wie, co robić bez instrukcji: w grze nie ma żadnej podpowiedzi; jedyna instrukcja to opis trybu w panelu. Naiwny gracz stukający w środek leciał 60 s bez końca, 637 m, cały czas „Kontur” (A05): stukanie jest intuicyjne, ale nic go nie uczy wiatrów ani koloru. Pierwsze 20 s to tylko wiatry (nauka), przeszkody od 20 s.
- Tor bez widocznej siatki (15.9): spełnione; siatka tylko z ?siatka=1. Drogę wyznaczają cień i wstęgi, ale patrz P0-4 i P1-10.
- „Jeszcze raz”: ekran końca znika po 53 ms (cel < 400 ms).
- Pauza: Esc zatrzymuje obraz (dwa zrzuty identyczne), napis „Pauza. Dotknij ekranu albo naciśnij P” (A07); dotyk wznawia. Przycisk „sterowanie” w locie otwiera panel „Wróć do lotu” (A08).
- Przeładowanie: wstęp pominięty, ekran startu od razu (A09).
- Prywatność: treść czytelna, „Usuń zapis” z potwierdzeniem; po usunięciu localStorage pusty, komunikat „Zapis usunięty. Gra wczyta się od nowa.” (A10-A13).
- Offline / PWA: service worker aktywny, cache crumbi-1 z 9 plikami, przeładowanie bez sieci działa (A14). Manifest: orientation portrait, kolory #0d1224 (P1-7).
- Błędy konsoli: 0.

### B. Sterowanie (`qa_b_sterowanie.cjs`, `wynik_b.json`, `wynik_b_bot.json`)
- Tryb 1: 8 kierunków ze środka poprawnie (w górę = 1 machnięcie). Do górnego wiersza 3 stuknięcia w rytmie, z dołu do środka 2 w rytmie i 4 przy spamie (rytm oszczędniejszy, zgodnie z 15.2). Szybowanie: wiersz w dół po 4,5 s (K1). Nurkowanie: wiersz po 0,2 s, drugi po 0,6 s; puszczenie = wybicie o wiersz. Czułość: ruch 30 px przesuwa tylko przy 1,5. Opóźnienie logiki: przesunięcie 2-3 ms, stuknięcie 9-10 ms od puszczenia palca (machnięcie liczy się przy puszczeniu, nurkowanie po 0,2 s; ruch obrazu ok. 0,2 s).
- Tryb 2: lewe i prawe stuknięcie = kolumna + machnięcie; oba naraz = mocne machnięcie (4 × oba = wiersz w górę); przytrzymanie obu = nurkowanie + wybicie; przytrzymanie jednego = ukos w dół. Problem pary: P1-3.
- Tryb 3: 8 kierunków drążkiem, drążek przy krawędzi działa (baza dosuwa się), stuknięcie prawą = machnięcie (także z trzymanym drążkiem), przytrzymanie prawą = nurkowanie. Drążek 140 px średnicy.
- Duch palca: touchCancel czyści nurkowanie; blur w trakcie czyści; 2 i 3 palce nie psują stanu. Zmiana trybu z palcem na ekranie: bez zawieszonego stanu. Klawisz T zmienia tryb i zapisuje. Klawiatura: strzałki, W/spacja, S/Shift działają.
- Bot dotykowy, 5 min na tryb, prawdziwe gesty CDP: tryb 1 / 2 / 3: 78 / 96 / 81 wejść w wiatr (100% / 99% / 100% idealnych), E max 1, poziom max 3, pełny kolor łącznie 23 / 28 / 23 s, 0 kar, 0 końców. Wszystkie ruchy wykonalne; satysfakcji nie da się zmierzyć botem.

### C. Mechanika i trudność (`qa_c_boty.cjs` 6 botów × 6 krain × 20 biegów × 300 s; `qa_c2_cele.cjs`; `qa_c3_plastry.cjs`)
- Pełny kolor ≤ 60 s: idealny 20/20 w każdej krainie (mediana 7,5 s), 70%: 12-20/20, 50%: 9-15/20, losowy 0, bierny 0, stukacz 0-3/20.
- Długość biegu: aktywne boty 300 s zawsze; losowy mediana 8,7-15,8 s; bierny 19,5-28,1 s; końce tylko „lądowanie”, jastrząb, sowa (S3 jedynymi końcami poza morzem chmur: spełnione).
- Wiatry 23-25 komórek/min (05: 11-31), przeszkody 13-22/min (05 dla L2: 21-55, czyli w K5 i Dalekim Niebie za mało), kary bota idealnego 0-0,1/min.
- Uczciwość: 0 plastrów nieuczciwych w 82 541 zalogowanych plastrach; zapowiedź (pojawienie → kontakt) min. 2,95 s, mediana 5,1-5,5 s; nie znalazłem sytuacji bez wyjścia ani przeszkody nie do ominięcia (atak drapieżnika: 1,6 s na zmianę komórki, ruch boczny zawsze możliwy). Nagłych śmierci brak; nieczytelność to P0-4.
- Zajęte komórki: 70-75% plastrów z zawartością ma tylko wiatr; max 3-5 przeszkód na plaster.

**Rozbieżności 05 (bestiariusz) vs kod toru:**
1. Siatka 3 × 3 zamiast 3 × 4 (brak strefy Ziemia, przysiadu przy pierwszym dotknięciu, ziemskich przeszkód i znajdziek).
2. Wejście do nadchmurza machaniem (05 i 17.1: tylko Schody światła po łańcuchu ≥ 2 albo jetstream); U przerzuca z dołu prosto na górę.
3. Brak typów: Schody światła (^), jetstream (J), promień zachodu (y), tęcza księżycowa jako komórka (r), komin (k), termiki i bryza, polana (=), ciepła rzeka (_), oaza tylko jako chmura, tunel (#), gęsta mgła (~), flauta (%), szkwał (&), pyłki (:), lodowe chmurki (i), meteory (m), drzewo, wiatrak, strach, klucz gęsi i autostop, Fiuk, wszystkie znajdźki (+). Satelita i statek tylko jako widowisko (zgodnie z 17.1).
4. Debiuty: tornado od K4 (05: K5), burza od K5 (05: Dalekie Niebo); reszta (s, g, o, H, Y od K2; f, S od K3; M, K od K4; A, v, X od K5) zgodna.
5. Gęstość nie rośnie z poziomem L0-L5 tak jak w tabeli 4.1/4.2 (kod: liczba przeszkód z napięcia N, poziom tylko podnosi trudność wzorców).
6. Budżet uwagi 4.4: S2 pod rząd i odstęp 0,55 s (P2-7).
7. Drapieżniki wg pory i krainy (P2-8).

### D. Grafika (`qa_d_grafika.cjs`, `qa_d2_przeszkody.cjs`, `qa_d3_zblizenie.cjs`; arkusze `_ark_D1`, `_ark_D4`, `_ark_D5`, `_ark_D7a/b`, `_ark_D8`)
- L0-L5 × świt, dzień, zachód, noc (`_ark_D1.png`): start jasny i pastelowy (jasność L0 dzień 215/255, nasycenie 0,13), noc lawendowo-granatowa, nie czarna; L5 z promienistymi smugami bardzo ładne. Chmury wyglądają jak chmury (kłęby z miękkim światłem), bez paskowania widocznego na zrzutach.
- Przejście E 0 → 1 co 0,1: największy skok jasności między krokami 9,6 (zachód) do 19,8 (noc) na 255; nasycenie rośnie płynnie (max skok 0,09). Brak „przeskoku z ciemnej” w grze.
- Ciemne kontury: cienkie ciemne linie 0,0002-0,0012 kadru (L0-L4), 0,0028 noc L5; w normie Z15. Wyjątek: HUD (P2-5).
- Zieleń: 0 przy L0-L4 bez zielonych chmur; 0,05-0,39% tylko przy L5 (światło hiper). Czerwień poza szalikiem: P2-3.
- Rozmiary: 360 × 640 (ucięty opis, P1-8), 412 × 915 bez problemów, 1440 × 900 pionowa kolumna, 844 × 390 panel z przewijaniem (P2-6). Brak przewijania poziomego strony.

### E. Wydajność i stabilność (`qa_e_wydajnosc.cjs`, `wynik_e.json`, `wynik_e_fps.json`)
- Pliki: index.html 554 kB (gzip 176 kB, brotli 139 kB; żywa strona wysyła 170 kB zstd), teksty.js 4 kB, dzwiek.js 8 kB, ikony 34 / 37 / 187 kB (180 / 192 / 512).
- fps i czas pracy klatki: P1-11. Pamięć sprite'ów 16,7-23,7 MB (limit 60 MB), sterta 6-14 MB.
- Długi bieg 631 s czasu gry (tempo 4): praca klatki 2,6-4,3 ms bez trendu wzrostu, sterta 8-14 MB bez wzrostu, sprite'y 18,8 → 27,8 MB (nowe krainy). Brak wycieku.
- Konsola: 0 błędów i ostrzeżeń we wszystkich testach. Żywa strona: CSP w nagłówku (self + unsafe-inline), 0 naruszeń, X-Robots-Tag noindex, nofollow, meta robots noindex.

### F. Dostępność (`qa_f_dostepnosc.cjs`, `wynik_f.json`)
- Cele dotyku: wszystkie przyciski ≥ 44 px (jedyny wyjątek: link e-mail w tekście prywatności, 18 px wysokości).
- Kontrast tekstów w panelach (ciemne tło): 5,5-16,3:1 (dobrze). Kontrast HUD i wstępu: P1-4, P1-5.
- Klawiatura: od wejścia do końca biegu da się grać samą klawiaturą (pominięcie wstępu dowolnym klawiszem, Tab po panelu, Enter „Leć”, strzałki, P pauza, Enter „Jeszcze raz”); fokus widoczny (obrys 2 px). Fokus ucieka z dialogu (P2-9).
- Czytnik ekranu: ekran końca jako dialog z aria-label „Okruszek zasnął na chmurce. Przeleciał 481 m. Słońce obiecało wrócić rano.”, fokus na „Jeszcze raz”; zdania wstępu w aria-live.
- Migotanie: 17 burz w 4 s (14 trafień) dało najwyżej 1 błysk na sekundę; z prefers-reduced-motion 0 błysków; wejście w L5 bez błysków. Drżenie kamery wyłączane przy reduced-motion (warunek w kodzie; mój pomiar drżenia po samolocie dał 0 w obu trybach, więc niejednoznaczny).
- Dźwięk nie jest jedynym kanałem: zapowiedź jastrzębia i sowy to duża sylwetka, trójkąt w HUD i łuk (zrzuty `_ark_F.png`); atak na komórkę: drapieżnik zawisa nad ptaszkiem.

## G. Panel recenzentów
Uwaga: to perspektywy odegrane przez agenta QA na podstawie zrzutów i pomiarów powyżej, a nie oceny prawdziwych osób.

| Rola | Ocena | Trzy konkretne poprawki |
|---|---|---|
| 1. UX i wygląd | 3/5 | Większe przeszkody i cień komórki na wysokości ptaszka (P0-4); HUD z tuszem czytelnym w dzień i nazwa krainy poza iskierkami (P1-4, P1-6); jasne panele zamiast granatu (P1-7). |
| 2. Laik 1 (dorosły, nie gra) | 3/5 | Jedno zdanie podpowiedzi w pierwszych 5 s lotu („Stuknij, żeby machnąć. Złap złoty wiatr.”); widoczniejsze wiatry, bo nie wiem, że te żółte iskry to coś dobrego (P1-10); czytelny wstęp (P1-5). |
| 3. Laik 2 (dziecko ok. 9 lat, perspektywa) | 4/5 | Ptaszek i szalik super, ale „gdzie jest chmurka, w którą wlecę?” (P0-4); więcej „wow” za trzy wiatry (rozkwit w dzień słabo widać przy jasnym tle); żeby było czym się pochwalić: Turbo i Hiper naprawdę do zdobycia (P0-3). |
| 4. Laik 3 (gracz casual, zna Alto's Odyssey) | 2/5 | Brak ryzyka: stukam i lecę w nieskończoność (P0-1, P1-1); ruch po siatce czuje się „skokowo”, a nie jak szybowanie, więc potrzebny płynny zjazd i wybicie z czuciem prędkości; cel krótkoterminowy (np. 3 wiatry = punkt kontrolny, rekord metrów widoczny w locie). |
| 5. Ruch i dostępność | 4/5 | Kontrast HUD i wstępu (P1-4, P1-5); pułapka fokusu i role="img" (P2-9); próg „położonego kciuka” i okno pary kciuków (P1-2, P1-3) dla osób z wolniejszą motoryką. |
| 6. Strażnik (testy, bezpieczeństwo, koszty) | 4/5 | Testy akceptacyjne sekcji 14 i 12.1 dopisać dla trybu toru (dziś przechodzą preflight, a łamią kryteria; brakuje botów 50% i stukacza w torze); hak stanu jakości poza ?test (P2-11); zimny start: rozłożyć budowę sprite'ów (P1-11). Bezpieczeństwo: CSP i noindex w porządku, brak danych osobowych, koszt zerowy. |
| 7. Krytyk Seba | 2/5 | „Leć jak najdalej” z torem 3 × 3 bez porażki to wygaszacz ekranu: po 3 minutach nuda, bo nic nie grozi, a kolor przychodzi sam (P0-1, P0-2, P1-1). Siatka 3 × 3 z punktem zbiegu wysoko nad ptaszkiem zabija czytelność: albo bliżej kamery i większe, albo mniej komórek (P0-4). Do „szalenie pięknej i szalenie satysfakcjonującej” brakuje: stawki (ryzyko utraty biegu), rytmu (muzyka łańcucha z Z13), szczytu (Hiper osiągalny i wyjątkowy) i ziemi z sekcji 16, która da kontrast „spokój nisko, pęd wysoko”. |

## Czego nie zmierzono (wprost)
- Prawdziwy telefon (dotyk, opóźnienie ekranu, 120 Hz, Safari na iOS, gesty systemowe przy krawędzi), wibracje.
- Dźwięk na słuch (w ?test moduł dźwięku nie gra; w journey dźwięk działał technicznie bez błędów, ale nikt go nie słuchał).
- Prawdziwi laicy i dziecko (panel G jest odegrany).
- fps na prawdziwym urządzeniu i działanie trybu lekkiego poza ?test.
- Odczucie płynności ruchu (tylko pomiary stałych czasowych i zrzuty).

## Pliki
- Raport: `qa\RAPORT-QA-RUNDA-1.md`
- Skrypty: `qa\wspolne.cjs`, `qa\arkusz.cjs`, `qa\qa_a_journey.cjs`, `qa\qa_b_sterowanie.cjs` (z argumentem `bot 5`), `qa\qa_b_dwa_palce.cjs`, `qa\qa_c_boty.cjs`, `qa\qa_c2_cele.cjs`, `qa\qa_c3_plastry.cjs`, `qa\qa_d_grafika.cjs`, `qa\qa_d2_przeszkody.cjs`, `qa\qa_d3_zblizenie.cjs`, `qa\qa_e_wydajnosc.cjs` (argument `tylkofps`), `qa\qa_f_dostepnosc.cjs`, `qa\qa_kontrast_zrzut.cjs`
- Dane: `qa\wynik_a.json` … `qa\wynik_f.json`; zrzuty: `qa\zrzuty\` (arkusze `_ark_*.png`).
