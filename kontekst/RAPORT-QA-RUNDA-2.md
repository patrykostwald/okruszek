# Okruszek / Crumbi, tryb TOR (?tor=1): raport QA, runda 2

Data: 26.10.2026. Wersja: gałąź z18-poprawki, commit e9bce7d (worktree gra-okruszek-QA2, gałąź qa2; kod gry bez zmian). Żywa strona https://zbudujmi.com/crumbi/ ma bajt w bajt ten sam index.html (sw.js różni się tylko końcami linii).
Metoda: Chromium 1134 headless (Playwright), dotyk przez CDP, hak ?test. Trudność i długość liczone deterministycznie (torSymuluj, krok 1/60 s, stałe ziarna, Math.random podmieniony na ziarno): 12 botów x 6 krain x 10 ziaren x 300 s oraz 6 botów x 6 krain x 10 ziaren x 1200 s. Komputer był obciążony (ok. 2 GB wolnej RAM, CPU 53% przed testami): wszystkie pomiary czasu rzeczywistego (fps z dławieniem CPU, ładowanie, bot dotykowy, opóźnienia przez CDP) są **orientacyjne**.
Skrypty: `qa\qa2_*.cjs` (nowe) i `qa\qa_*.cjs` (z rundy 1, uruchomione ponownie); dane `qa\r2_wynik_*.json`, logi `qa\r2_log_*.txt`; zrzuty `qa\zrzuty\` (arkusze `_R2_*.png`).

## Podsumowanie (10 linii)
1. Wszystkie 4 P0 z rundy 1 zmieniły się na plus: P0-1, P0-2 i P0-3 naprawione liczbowo, P0-4 częściowo (przeszkody 1,7x większe, ale wiersz przeszkody nadal mylący).
2. Z 12 P1: 7 naprawionych (P1-2, P1-3, P1-6, P1-7, P1-8, P1-9, P1-12), 5 częściowo (P1-1, P1-4, P1-5, P1-10, P1-11), 0 „nadal”. Regresji błędów brak; 0 błędów konsoli we wszystkich testach.
3. Stukacz bez patrzenia ginie (mediana 155 s, 0 z 60 przeżywa 1200 s), nadchmurze tylko wiatrem (0 wejść machaniem), Turbo osiąga 60/60 biegów bota idealnego, Hiper tylko z nurkowaniem (27/60).
4. Pełny kolor nie jest już darmowy (bot 50%: 8% biegów w 60 s), ale zależy od trafienia w okno ±11 px środka wstęgi, którego na ekranie nie widać: ten sam bot idealny bez celowania w pionie ma pełny kolor w 60 s tylko w 17% biegów (z celowaniem 93%).
5. Uważny gracz nie przegrywa: bot reagujący do 0,8 s po namierzeniu przez drapieżnika nie dał się złapać ani razu w ok. 900 atakach; lądowanie aktywnego gracza prawie się nie zdarza. Biegi kończy tylko nieuwaga.
6. Czucie lotu: skrzydła słuchają kciuków (złożenie lewego/prawego, mocny zamach +25% amplitudy), ale pierwsza reakcja obrazu przychodzi dopiero przy puszczeniu palca (ok. 100-110 ms od dotknięcia; cel < 50 ms).
7. Dźwięk podpięty tylko pod wiatr, nurkowanie, start, złapanie i lądowanie; machnięcie, uderzenie w chmurę, wybicie, łańcuch, pełny kolor, zapowiedź drapieżnika i Turbo/Hiper są nieme; wibracji nie ma wcale.
8. Piękno wyraźnie lepsze: jasne panele, czytelny HUD w L0-L4 (4,1-8,2:1), złote wstęgi wiatrów z szewronami; słabe miejsca: HUD w L5 za dnia 1,9-2,7:1, cień Okruszka niewidoczny (kontrast ≤ 1,25:1), czerwień zachodu.
9. Realistyczny gracz (bot „człowiek”) spędza 84% czasu w Mgiełce i Pastelu, a awans poziomu wyskakuje 12-18 razy na minutę: kolor i „Turbo” tracą wyjątkowość.
10. Zimny start: pierwsze malowanie 0,36 s (CPU x1) i 1,5 s (x4) zamiast 1,9 / 4,4 s, ale potem nadal jedno długie zadanie 2,8 s / 4,5 s; brak wycieku w 10 min gry.

**Oceny (1-10), runda 1 → runda 2:** piękno **7 → 8** · satysfakcja z lotu **4 → 5** · czytelność **4 → 6** · trudność (uczciwość) **3 → 6** · stabilność **9 → 9**.
Kryterium 17.2 (≥ 9 dla piękna, satysfakcji, czytelności, stabilności): spełnione tylko dla stabilności.
Nowe wpisy: **P0: 0 · P1: 7 · P2: 11.**

---

## 1. Status poprawek rundy 1 (ten sam skrypt / pomiar, przed → po)

| Nr | Problem z rundy 1 | Przed (R1) | Po (R2) | Status |
|---|---|---|---|---|
| P0-1 | Nadchmurze machaniem, stukacz leci w nieskończoność | stukacz przeżywa 300 s w 114/120 biegów, 92% czasu w wierszu 0 | stukacz: 0/60 przeżywa 1200 s, mediana 155 s, końce 60/60 drapieżnik; 0% czasu w wierszu 0; wejścia do nadchmurza: 2 288 wiatrem, 0 machaniem (3 „inne” to wybicie z nurkowania zaczętego w nadchmurzu); 9 machnięć ze środka nie wnosi na górę (`qa_b_sterowanie`) | naprawione |
| P0-2 | Pełny kolor za łatwy | bot 50%: pełny kolor ≤ 60 s w 45-75% biegów; idealne wejścia 92-97% | bot 50% (Z18): 5/60 = 8%, najdłużej 1,12 s w 60 s; bot 50% z rundy 1: 1/60 = 2%; idealne wejścia 33-46% u botów bez celowania; bot idealny 56/60 = 93% (cel „≥ raz w 60 s”: 4 biegi bez) | naprawione (z nowym P1-N1) |
| P0-3 | Turbo i Hiper nieosiągalne | L4 1 raz, L5 0 s w 380 biegach | L4: bot idealny 60/60 (56 w ≤ 60 s), „człowiek” 59/60; L5: bot z nurkowaniem 27/60 biegów (39 wejść), „człowiek + nurek” 20/60; bez nurkowania L5 = 0 (zgodnie z 15.3) | naprawione |
| P0-4 | Przeszkody nieczytelne w chwili decyzji | eta 1,5 s: skala 0,33, chmura 188 px nad ptakiem, sąsiednie komórki 38 px | eta 1,7 s: skala 0,57 (komórka 46 px), chmura w swojej komórce 102 px nad ptakiem, komórka obok 66 px (`qa2_d3_zblizenie`); ALE przedmiot z dolnego wiersza przy 1,5 s rysuje się 35 px NAD ptakiem (y 472 vs 507), szara i biała chmura toru wyglądają jak chmury tła (`R2-W-dzien-wybor-eta1.5.png`, `R2-D8-k2w2-eta1.5.png`); test laika nie zrobiony | częściowo |
| P1-1 | Brak presji, aktywny gracz nie kończy biegu | 0 końców w 360 biegach | boty Z18 kończą biegi (b70: mediana 452 s), ale tylko przez przegapiony atak (parametr bota „zauważa 90%”); bot zawsze uważny z reakcją ≤ 0,8 s po namierzeniu: 1 złapanie na 916 ataków; bot rundy 1 (unik od razu): 59/60 przeżywa 1200 s | częściowo (P1-N2) |
| P1-2 | Tryb 1: położony kciuk zamienia ruch w nurkowanie | brak skrętu | kciuk leży 0,3 s, potem 60 px w bok: kolumna 1 → 2, bez nurkowania | naprawione |
| P1-3 | Tryb 2: para kciuków tylko < 90 ms, czekanie 79 ms | 120 ms = skręt; 79 ms | 120 ms = mocne machnięcie; stan zmienia się 14 ms po dotyku | naprawione |
| P1-4 | HUD nieczytelny w dzień | 1,75-2,46:1 | L0-L4 (świt, dzień, zachód): 4,1-8,2:1 (najsłabsza etykieta WYSOKOŚĆ o zachodzie w L4); noc 6,5-9,3:1; **L5 dzień: liczba 2,71, „HIPER” 1,86, DYSTANS 1,98, WYSOKOŚĆ 2,21:1**; L5 zachód: etykiety 2,75-2,8:1 (`_R2_hud_L5.png`) | częściowo (P1-N5) |
| P1-5 | Wstęp nieczytelny i długi | zdania ok. 1,5:1, pominięcie 1,1:1; ekran startu po 15,3 s | zdania 5,5:1, „Dotknij, żeby pominąć” 4,4:1; długość bez zmian (IT.koniec 12,6 s), ekran startu po 17,2 s (z ładowaniem 3,1 s na obciążonym komputerze) | częściowo (długość: P2) |
| P1-6 | Nazwa krainy na iskierkach | nakłada się | „Kamienny Las” pod iskierkami we wszystkich 96 zrzutach macierzy | naprawione |
| P1-7 | Ciemne panele, ciemny manifest | granat 93%, #0d1224 | jasne panele (start, koniec, pauza, prywatność), manifest i theme-color #cdd5ee | naprawione |
| P1-8 | Ucięty opis trybu 2 przy 360 px | brak „nurkuj.” | pełny tekst (`D4-360x640-start.png`) | naprawione |
| P1-9 | Luki do 21 s | 14,8-21,2 s | biegi 300 s (720 biegów): luka max 4,6 s, 0 luk > 5 s; biegi 1200 s (360): max 6,6 s, 4 luki > 5 s | naprawione |
| P1-10 | Wiatry mało czytelne | żółte znaczki, kierunek nieczytelny | wiatry z przerzutem: złote wstęgi z szewronami, kierunek czytelny od ok. 1 s (`_R2_ark_W1.png`); wiatr bez przerzutu (U w środkowym wierszu bez łańcucha, „na wprost”, zjazd z góry) przy 1,5 s to blady punkt ok. 15 px (`_R2_wiatry.png`) | częściowo (P2-N3) |
| P1-11 | Wydajność, zimny start bez wskaźnika | pierwsza klatka 1,9 / 4,4 / 6,7 s (x1/x4/x6) | pierwsze malowanie 0,36 s (x1), 1,48 s (x4), pierwsza klatka gry 0,12 / 0,98 / 1,72 s; długie zadanie nadal 2,1-2,8 s (x1), 4,5-4,7 s (x4), 7,0 s (x6); praca klatki x1 2,6-4,5 ms (R1 2,4-4,3); fps x4 22-29 kl/s, ale pomiar zaszumiony obciążeniem (orientacyjny) | częściowo |
| P1-12 | Tornado K4, burza K5 | T:4, B:5 | TOR_OD T:5, B:6; biegi z bramy 4, które nie doleciały do K5: 0 tornad | naprawione |

**Regresje:** brak regresji funkcji. Uwaga do „Jeszcze raz”: journey zmierzył 372 ms, ale to artefakt odpytywania przez CDP na obciążonym komputerze; pomiar w stronie (MutationObserver) daje 1-6 ms do ukrycia ekranu i 9-57 ms do następnej klatki (`qa2_e_start.cjs`). Podobnie „rytm 4 machnięcia, spam 2” w `qa_b_sterowanie` to artefakt; deterministycznie rytm 0,16-0,6 s = 2 machnięcia, spam 0,08-0,12 s = 4 (rytm oszczędniejszy, zgodnie z 15.2).
P2 z rundy 1 sprawdzone przy okazji: P2-1 „Mgiełka” jest; P2-5 HUD bez ciemnego obrysu (jasne plakietki); P2-9 fokus zostaje w dialogu (Tab 8 wraca do trybu 1), canvas role="img" z opisem; P2-6 pasy boczne jasne (ale nocą, P2-N8); P2-2, P2-3, P2-4, P2-12 nadal (liczby w D); P2-7, P2-8, P2-10, P2-11 niezmierzone w tej rundzie.

---

## 2. Nowe problemy

| Nr | Opis | Dowód | Proponowana poprawka | Szac. | Obszar |
|---|---|---|---|---|---|
| P1-N1 | „Idealne wejście” (warunek łańcucha i pełnego koloru) jest niewidoczne i sprzeczne z intuicją: okno ±0,09 wiersza = ±11 px w pionie; ptaszek opada 35 px w cyklu, a jedno machnięcie na dnie podnosi go o ok. 30 px, czyli wypycha z okna. Na wstędze nie ma żadnego znaku „jesteś na środku”. | `r2_wynik_c_glowny.json`: bot z celowaniem w pionie: 86% idealnych, pełny kolor ≤ 60 s 93%; ten sam wybór komórek bez celowania (q1_idealny): 44% idealnych, 17%. Bot dotykowy prawdziwymi gestami: 56-60% idealnych, pełny kolor 1,1 s w 6 min. Kod: `torIdealne()` używane tylko w logice (brak w rysowaniu). | Wstęga zapala się (rdzeń światła, „zatrzask”), gdy ptaszek jest w oknie; w ostatnich 0,3 s lekki magnes do środka, jeśli gracz nie macha w panice; machnięcie tuż przed wiatrem nie wynosi ponad środek; po wejściu „idealne” vs „brzeg” różnym dźwiękiem. | M | rysunek / logika |
| P1-N2 | Uważny gracz nigdy nie przegrywa: drapieżnik daje 0,9 s po namierzeniu (ATAK_LOCK 0,6 + ATAK_UDER 0,3), a ucieczka to jeden ruch w bok; kara chmurą nigdy nie kończy biegu. Długość biegu zależy tylko od tego, ile ataków gracz przegapi. | `qa2_c_drapieznik.cjs`: reakcja 0,2 / 0,4 / 0,55 / 0,7 s: 0 złapań na 736 ataków; 0,8 s: 1/180; 0,9 s: 19/91. 1,8-1,9 ataku na minutę. Bot rundy 1 (unik od razu): 59/60 przeżywa 20 min. | Krótsze okno od K3 (np. 0,6 s), ataki z wyborem (dwie komórki naraz, „kryjówka” w gęstej chmurze z kosztem prędkości), pościg, przed którym ratuje tylko prędkość (HAW_S przez łańcuch), rosnące opadanie także dla aktywnych; cel: bot „człowiek” 3-8 min bez sztucznego „przegapia 5%”. | M | logika |
| P1-N3 | Opóźnienie reakcji na dotyk ok. 100-200 ms (cel < 50 ms): machnięcie i stuknięcie liczą się dopiero przy puszczeniu palca, przesunięcie po 36 px drogi, nurkowanie po 0,2 s; do tej pory obraz stoi. | `qa2_b_czucie.cjs` (mediana 10 prób, z narzutem CDP, orientacyjnie): od dotknięcia: stuknięcie 110 ms, oba kciuki 103, drążek 145, przesunięcie 171, nurkowanie 187-200; od puszczenia palca 6-8 ms (1 klatka); klawiatura 7 ms. | Antycypacja: skrzydła zaczynają zamach w pointerdown (zatwierdzenie w pointerup, cofnięcie przy przytrzymaniu), przechył ptaszka od pierwszych px przesunięcia, przygięcie skrzydeł od razu przy przytrzymaniu. | S | sterowanie / rysunek |
| P1-N4 | Zdarzenia bez drugiego kanału: machnięcie, uderzenie w chmurę/przeszkodę, wybicie, kolejny wiatr łańcucha, rozkwit pełnego koloru, zapowiedź i namierzenie drapieżnika, Turbo/Hiper mają tylko obraz; wiatr idealny i brzegowy mają ten sam dźwięk; wibracji brak. | Kod: `snd()` wołane tylko z: prad (wejście w wiatr), nurkowanie, cwir (start), och (złapanie), ladowanie, predkosc (ciągły szum). `qa2_g_kanaly.cjs`, 240 s: 163-200 machnięć, 3-4 uderzenia, 13-15 wybić, 4-5 rozkwitów, 6-8 ataków: 0 dźwięków; `navigator.vibrate`: 0 wywołań (brak w kodzie). | Dźwięki w dzwiek.js: machnięcie (lekkie / mocne), „puf” chmury, wybicie, łańcuch rosnącą nutą 1-2-3, sygnatura rozkwitu, krzyk jastrzębia / pohukiwanie przy zapowiedzi i namierzeniu, whoosh Turbo/Hiper; krótkie wibracje (Android) przy machnięciu, idealnym wietrze, uderzeniu i namierzeniu. | M | dźwięk |
| P1-N5 | HUD nieczytelny w hiperprzestrzeni za dnia (rozjaśnienie L5 wybiela plakietkę i tusz), słabiej o zachodzie. | `qa_kontrast_zrzut.cjs` na `D1-390-dzien-L5.png`: liczba 2,71, „HIPER” 1,86, DYSTANS 1,98, WYSOKOŚĆ 2,21:1; `D1-390-zachod-L5.png`: etykiety 2,75-2,8:1 (cel ≥ 3 / ≥ 4,5). | W L5 tusz HUD ciemny niezależnie od rozbłysku albo plakietka bez poświaty hiper (HUD rysowany po bloomie). | S | rysunek |
| P1-N6 | Cień Okruszka (główna wskazówka toru z 15.9) jest niewidoczny w zwykłej scenie. | Kontrast pudełka cienia wobec otoczenia 1,04-1,25:1 (`R2-W-dzien-cien-wiersz1.png`, noc 1,22-1,26; `_R2_cien.png`); na zrzutach nie widać elipsy. | Cień ciemniejszy tonalnie (bez czerni) i większy, przesuwa się z wierszem; ewentualnie jasny „krąg” Okruszka na morzu chmur nocą. | S | rysunek |
| P1-N7 | Brak nauki w grze: laik nie dowie się, że złote wstęgi są dobre, że liczy się trzy z rzędu i środek wstęgi, ani że drapieżnika omija się krokiem w bok. | Journey: jedyna instrukcja to opis trybu w panelu (`teksty.js` 67-69); naiwny gracz stuka 60 s w „Mgiełce” (`A05-naiwny-stuka-30s.png`); bierny kończy po 28 s. | Trzy krótkie podpowiedzi w pierwszych 30 s, każda raz na profil („Leć w złote wstęgi”, „Trzy z rzędu, środkiem”, „Jastrząb! W bok”), znikające po wykonaniu. | S | rysunek / logika |
| P2-N1 | Awans poziomu (komunikat HUD i ogłoszenie dla czytnika ekranu) 12-18 razy na minutę: Turbo i Hiper tracą wyjątkowość, czytnik jest zasypany. | `qa2_c_poziomy.cjs`: K1 17,7 / K3 12,3 / K6 14,3 awansu na minutę (180 s, bot „człowiek”). | Komunikat tylko przy awansie powyżej najwyższego poziomu z ostatnich ok. 10 s; czytnik tylko L4 i L5. | S | rysunek / dostępność |
| P2-N2 | Realistyczny gracz rzadko widzi kolor: 84% czasu w Mgiełce i Pastelu. | Bot „człowiek”: L0 52,8%, L1 30,8%, L2 10,1%, L3 2,6%, L4 3,8%, L5 0%; bot 70%: 96% w L0-L1. | Wolniejsze gaśnięcie w L2-L3 przy utrzymanym rytmie, pośrednie nagrody kolorem; strojenie testem właściciela. | S | logika |
| P2-N3 | Wiatr bez przerzutu (U w środkowym wierszu bez łańcucha, wiatr na wprost, zjazd z górnego wiersza) przy eta 1,5 s to blady punkt bez kierunku; U z dołu i U ze środka wyglądają różnie, choć to ten sam znak. | `_R2_wiatry.png`, `D7-dzienL0-wiatr_gora-eta1.5.png`, `R2-W-dzien-zjazd-eta1.0.png`. | Każdy wiatr ma wstęgę i szewrony (na wprost: tunel, zjazd: strzała w dół), także gdy cel = ta sama komórka. | S | rysunek |
| P2-N4 | W nadchmurzu machnięcie nie robi nic (NADCH_MACH 0), bez żadnego sygnału; gracz może uznać, że sterowanie zawiodło. | Kod `torMachnij`: w nadchmurzu `torP` bez zmiany; animacja zamachu gra normalnie. | Inna animacja („trzepot w rzadkim powietrzu”, piórka), krótki napis raz na bieg. | S | rysunek |
| P2-N5 | Gęstość wiatrów nie zależy od krainy (ok. 23/min wszędzie); 05 (tabela 4.2, x0,75 na 3 wiersze) zakłada wzrost K1 → Dalekie Niebo (L0: 8 → 14, L1: 12 → 17). Przeszkody rosną poprawnie (15 → 29/min). | `r2_wynik_c_glowny.json`, pole znaki: wiatry 22,5-24,1/min w K1-K6. | Uzgodnić z 05 albo poprawić 05 (mniej wiatrów w K1, więcej wyborów później). | S | logika |
| P2-N6 | Kara na dnie zostawia tylko ok. 0,5-0,7 s na machnięcie (KARA_DNO 0,8 przy przyspieszonym opadaniu). | 1 przypadek w 60 biegach bota „człowiek + nurek”: lądowanie 0,68 s po uderzeniu. | KARA_DNO 0,7 albo minimalny czas 1 s do morza po karze. | S | logika |
| P2-N7 | Zainstalowana PWA (start_url „./”) otwiera tryb swobodny, nie tor; tester instalujący z ?tor=1 gra w starą wersję. | `manifest.webmanifest`: start_url „./”; `TORON = Q.get('tor') === '1'`. | Na czas testów osobny manifest dla ?tor=1 albo zapamiętanie trybu w zapisie. | S | logika |
| P2-N8 | 1440 x 900 nocą: jasne lawendowe pasy boczne obok ciemnej gry. | `_R2_ark_R_1440x900.png` (noc L0-L5). | Pasy w kolorze nieba bieżącej pory. | S | rysunek |
| P2-N9 | Bardzo długie biegi: pojedyncze luki 5-6,6 s. | Biegi 1200 s: 4 luki > 5 s w 360 biegach (q1_b70 6,6 s). | Ten sam limit luki po 10 min gry. | S | logika |
| P2-N10 | Przedmiot z dolnego wiersza przy 1,5 s rysuje się nad ptakiem, a przeszkody toru mają styl chmur tła (część P0-4). | `qa2_d_wiatry.cjs`: dolny wiersz przy eta 1,5 s na y 472, ptak 507; `R2-D8-k2w2-eta1.5.png`. | Cień przeszkody na „podłodze” wiersza od 1,5 s i lekka barwa funkcji (kolor = skutek), chmury tła jaśniejsze i bardziej rozmyte niż chmury toru. | M | rysunek |
| P2-N11 | 844 x 390 (poziomo): gra jako pasek 257 px szerokości, panel startu wymaga przewijania. | `_R2_ark_R_844x390.png`, `D4-844x390-start.png`. | Układ poziomy w Z16 (bez zmian w torze pionowym). | S | rysunek |

---

## 3. Dziesięć poprawek czucia lotu (dla rundy Z19, od największego wpływu)
1. **Widoczny środek wstęgi** (P1-N1): wstęga „zatrzaskuje się” światłem, gdy Okruszek jest w oknie idealnym; magnes w ostatnich 0,3 s; machnięcie przed wiatrem nie wypycha z okna. Bez tego pełny kolor wygląda na losowy.
2. **Reakcja przy dotknięciu < 50 ms** (P1-N3): zamach zaczyna się w pointerdown, przechył od pierwszych pikseli, przygięcie skrzydeł przy przytrzymaniu od razu.
3. **Dźwięk dla każdego zdarzenia** (P1-N4): machnięcie lekkie i ciężkie, „puf” chmury, wybicie, łańcuch jako rosnące nuty 1-2-3 kończone akordem rozkwitu, krzyk jastrzębia przy namierzeniu, whoosh Turbo i Hiper; idealny wiatr inaczej niż brzegowy.
4. **Wibracja** (Android): 10-15 ms machnięcie, 25 ms idealny wiatr, 40 ms uderzenie, wzór przy namierzeniu; wyłączana razem z efektami.
5. **Kamera**: przechył 4-6° przy zmianie kolumny, przysiad kamery przy nurkowaniu, FOV +8-10% w Turbo i krótkie „kopnięcie” przy każdym wietrze łańcucha (dziś FOV zmienia się tylko o 3% w L4 i 2% w hiper, drżenie tylko po samolocie i wirze), mikrodrżenie przy uderzeniu bez migotania (wyłączane przy reduced-motion).
6. **Stawka** (P1-N2): krótsze okno ucieczki w dalszych krainach i ataki z wyborem, żeby ucieczka była decyzją, a nie odruchem; bez tego po 3 minutach nic nie grozi.
7. **Ciężki zamach naprawdę ciężki**: dziś mocne machnięcie to tylko +25% amplitudy przy tym samym czasie 0,36 s; dłuższy, głębszy zamach, wyrzut piór, mocniejszy dźwięk, krótki wzlot z przestrzeleniem.
8. **Ruch z masą**: sprężyna z przestrzeleniem 5-8% przy zmianie kolumny i wybiciu, pochylenie ciała w kierunku ruchu, smugi prędkości przy zjeździe; dziś ruch komórkowy dochodzi do celu w 0,2 s bez bezwładności.
9. **Rzadsze, ważniejsze nagrody** (P2-N1, P2-N2): komunikat poziomu tylko przy nowym szczycie, licznik łańcucha x2/x3 przy ptaszku, dłuższa łaska koloru przy utrzymanym rytmie; Turbo i Hiper mają być świętem, nie migotaniem 12-18 razy na minutę.
10. **Szczyt frazy w nadchmurzu** (P2-N4): wyraźny „trzepot w rzadkim powietrzu”, Schody światła z dźwiękiem wejścia, a zjazd jako nagroda prędkości (pompa z 05: Schody → pęd → zjazd → znowu w górę).

---

## 4. Szczegóły pomiarów

### A. Ścieżka nowego gracza (czas rzeczywisty, czysty profil, bez ?test; `qa_a_journey.cjs`, `qa2_e_start.cjs`)
- Ładowanie lokalne 3,06 s (komputer obciążony; R1 1,9 s); żywa strona: 180 kB (zstd), TTFB 396 ms, load 2,7 s, plik identyczny z worktree.
- Wstęp: zdania czytelne (5,5:1), pominięcie 4,4:1; ekran startu po 17,2 s; długość wstępu bez zmian (12,6 s).
- Panel startu jasny; tryby 340 x 92 px, „Leć” 200 x 52, „Prywatność i regulamin” 161 x 46.
- Bierny gracz: koniec po 28,0 s, 288 m, „Okruszek zasnął na chmurce…”, fokus na „Jeszcze raz”. Naiwny stukacz (co 0,7 s): 60 s bez końca, cały czas „Mgiełka” (A05).
- „Jeszcze raz”: 1-6 ms do ukrycia ekranu, 9-57 ms do następnej klatki (pomiar w stronie); nowyBieg() 0-0,6 ms.
- Pauza (Esc): obraz stoi, dotyk wznawia; panel w locie „Wróć do lotu”; przeładowanie pomija wstęp; „Usuń zapis” czyści localStorage.
- Offline/PWA: service worker aktywny, cache crumbi-2 z 9 plikami, przeładowanie bez sieci działa; manifest jasny (#cdd5ee), ale start_url bez ?tor=1 (P2-N7).
- Konsola: 0 błędów i ostrzeżeń.

### B. Sterowanie i czucie lotu (`qa_b_sterowanie.cjs`, `qa2_b_czucie.cjs`, `qa2_g_kanaly.cjs`)
- Wszystkie 8 kierunków w trybie 1 i 3, klawiatura, duch palca, 2-3 palce, zmiana trybu z palcem: bez błędów (jak w R1).
- Opóźnienie (P1-N3) i dźwięk (P1-N4) w tabeli. Skrzydła: lekkie machnięcie f od -1,15 do 1,05, mocne (oba kciuki) od -1,44 do 1,31; przytrzymanie lewego kciuka składa lewe skrzydło (dl 0,97), prawego prawe (dr 0,97); szybowanie: lekkie drżenie f -0,29..-0,10.
- Rytm (deterministycznie): z dołu do środka 2 machnięcia przy odstępach 0,16-0,6 s, 4 przy spamie 0,08-0,12 s, 3 przy 0,8 s.
- Kamera (kod): podąża za ptaszkiem w 30% w poziomie, bez przechyłu; FOV -3% w L4, -2% w hiper; drżenie tylko po samolocie i wirze.
- Bot dotykowy prawdziwymi gestami, 2 min na tryb (orientacyjnie): tryb 1: 25 wiatrów, 14 idealnych, pełny kolor 1,1 s, poziom max 4; tryb 2: 21 wiatrów, 12 idealnych, E max 0,3, poziom max 2; tryb 3: 25 wiatrów, 15 idealnych, E max 0,62, poziom max 2. 0 końców biegu, wszystkie ruchy wykonalne. Prawdziwymi gestami pełny kolor tylko raz (tryb 1, 1,1 s) w 6 minutach.

### C. Trudność i długość (`qa2_c_boty.cjs`, `qa2_c_drapieznik.cjs`, `qa2_c_poziomy.cjs`)
Boty: z18_* (z Z18, „idealny” celuje w środek wstęgi), q1_* (z rundy 1, bez celowania w pionie), „człowiek” (bot Z18 z celowaniem w 70% wiatrów i opóźnieniem ruchów 60-180 ms), losowy, bierny, stukacz. 10 ziaren x K1-K5 i Dalekie Niebo.

| Bot | Pełny kolor ≤ 60 s | Turbo (biegi) | Hiper (biegi) | Mediana długości (limit) | Końce | Idealne wejścia |
|---|---|---|---|---|---|---|
| z18_idealny | 56/60 (93%) | 60/60 | 0 | 300 s (300) | 2 drapieżnik | 86% |
| z18 + nurkowanie | 56/60 | 60/60 | 27/60 | 300 s (300) | 1 drapieżnik, 3 lądowania | 80% |
| człowiek | 49/60 (82%) | 59/60 | 0 | 490 s (1200) | 56/60 drapieżnik | 75% |
| człowiek + nurkowanie | 49/60 | 59/60 | 20/60 | 300 s (300) | 19 drapieżnik, 5 lądowań | 73% |
| z18_b70 | 8/60 (13%) | 22/60 | 0 | 452 s (1200) | 57/60 drapieżnik | 46% |
| z18_b50 | 5/60 (8%) | 11/60 | 0 | 236 s (1200) | 60/60 drapieżnik | 42% |
| q1_idealny | 10/60 (17%) | 48/60 | 0 | 300 s (300) | 0 | 44% |
| q1_b70 | 16/60 (27%) | 35/60 | 0 | ≥ 1200 s | 1/60 | 38-45% |
| q1_b50 | 1/60 (2%) | 10/60 | 0 | ≥ 1200 s | 1/60 | 33-43% |
| losowy | 0 | 0 | 0 | 9,8 s | 60 lądowań | - |
| bierny | 0 | 0 | 0 | 20,9 s | 60 lądowań | - |
| stukacz | 0 | 0 | 0 | 155 s | 60 drapieżnik | 0% |

- Cele Z18: bot idealny pełny kolor raz w 60 s: 93% (4 biegi bez, w K1 1 i Dalekim Niebie 3); bot 50% ≤ 15%: tak (8% i 2%); 70% 3-8 min: tak dla botów Z18 (452 s) i „człowieka” (490 s, na granicy), ale tylko dzięki założeniu, że bot przegapia 5-10% ataków (P1-N2).
- Pełny kolor bota idealnego wg krainy: K1 9/10, K2-K5 10/10, Dalekie Niebo 7/10. Bot 70%: K5 i Dalekie Niebo 0/10.
- Uczciwość: 0 plastrów nieuczciwych; zapowiedź (pokazanie → kontakt) min. 2,61 s; złapania zawsze po pełnym oknie 0,9 s od namierzenia; 0 złapań w trakcie przerzutu wiatrem; 1 „nagłe” lądowanie 0,68 s po karze (P2-N6).
- Nudne odcinki: biegi 300 s bez luk > 5 s; czas w wierszach („człowiek”): nadchmurze 3,7%, środek 73%, dół 23%.
- Gęstość: wiatry 22-24/min we wszystkich krainach, przeszkody 15 (K1) → 29 (Dalekie Niebo) na minutę; debiuty: tornado dopiero w K5, burza w Dalekim Niebie (zgodnie z 17 nr 4).
- Rozbieżności z 05 (poza P2-N5): nadal siatka 3 x 3 zamiast 3 x 4 (bez Ziemi, znajdźek, przysiadu); brak typów z listy R1 (jetstream, promień, tunel, flauta i in.); drapieżnik wg pory i krainy niezmierzony w R2.

### D. Grafika i czytelność (`qa_d_grafika.cjs`, `qa2_d_rozmiary.cjs`, `qa2_d3_zblizenie.cjs`, `qa_d2_przeszkody.cjs`, `qa2_d_wiatry.cjs`)
- Macierz L0-L5 x świt, dzień, zachód, noc w 390 x 844, 360 x 640, 412 x 915, 1440 x 900 (96 zrzutów) i 844 x 390 (L0, L5): brak przewijania poziomego, nic nie wychodzi poza ekran, 0 błędów (`_R2_ark_D1.png`, `_R2_ark_R_*.png`).
- Start jasny i delikatnie kolorowy: L0 dzień jasność 217/255, nasycenie 0,13; świt 203, 0,10. Przejście E 0 → 1 co 0,1: największy skok jasności 10,3 (dzień), 9,6 (zachód), 13,7 (świt), 20,2 (noc) na 255; nasycenie rośnie płynnie (skok ≤ 0,09).
- Ciemne kontury: 0,06-0,33% kadru (cienkie linie), bez obrysów chmur. Zieleń: 0 w L0-L4, do 0,43% w L5 (zachód: zielony segment i napis „HIPER” w HUD). Czerwień poza szalikiem: zachód L4 4,15% pikseli, zachód E = 1 7,86% (R1: 4,7% i 8,3%; P2-3 nadal), w HUD różowo-czerwony „TURBO” o zachodzie.
- Noc: pełny kolor ciemniejszy (jasność 108,7 → 92,9), nasycenie 0,35 → 0,46, jedna grupa barw (P2-2 nadal).
- Estetyka (oglądane zrzuty): chmury jak chmury, akwarelowe warstwy, bez paskowania; L5 smugi bardzo ładne; ptaszek nadal błękitny na błękicie (P2-4), ratuje go czerwony szalik.
- „Tor nie jest siatką”: siatki nie widać (zgodnie z 15.9). Gdzie leci i dokąd może: wiatry z przerzutem pokazują trasę złotą wstęgą z szewronami (dobrze), ale cień Okruszka nie działa (P1-N6), wiersz przeszkody przy 1,5 s mylący (P2-N10), wiatr bez przerzutu to punkt (P2-N3).

### E. Wydajność i stabilność (`qa_e_wydajnosc.cjs`, `qa2_e_start.cjs`; obciążony komputer, orientacyjnie)
- CPU x1: 82-95 kl/s średnio (p5 33-98), praca klatki 2,6-4,5 ms. CPU x4: 22-29 kl/s, x6: 24-29 kl/s (R1 bez innych procesów: x4 25-50); różnica wynika co najmniej częściowo z obciążenia, nie da się jej przypisać kodowi.
- Długi bieg 10 min czasu gry (tempo 4): sterta 6-15 MB bez trendu, sprite'y 18,4 → 26,7 MB (nowe krainy, potem stałe), praca klatki rośnie z krainą (K1 4,2 → K3 7-8,7 ms), po restarcie w K1 5,5-7 ms. Wycieku nie widać.
- Zimny start: patrz P1-11. Pliki: index.html 581 495 B (+27 kB względem R1; gzip 185 kB, brotli 147 kB), dzwiek.js 7,6 kB, teksty.js 4,5 kB.
- Żywa strona: CSP w nagłówku (self + unsafe-inline), 0 naruszeń, 0 komunikatów konsoli, X-Robots-Tag noindex, nofollow, meta robots noindex, HSTS, nosniff.

### F. Dostępność (`qa_f_dostepnosc.cjs`)
- Cele dotyku ≥ 44 px (wyjątek: link e-mail w prywatności, 18 px wysokości, w tekście).
- Kontrast paneli 6,5-12,5:1; HUD jak w P1-4 i P1-N5.
- Klawiatura: cała ścieżka bez dotyku, fokus widoczny (obrys 1,8 px), fokus zostaje w dialogu.
- reduced-motion: 0 błysków burzy, drżenie i rozbłysk wyłączane (kod); migotanie bez ograniczeń max 2 błyski na sekundę (≤ 3).
- Dźwięk nie jest jedynym kanałem zagrożeń (sylwetka, trójkąt, łuk), ale zapowiedź drapieżnika ma tylko obraz (P1-N4). Czytnik ekranu: canvas role="img" z opisem toru, ekran końca jako dialog; ogłoszenia poziomu za częste (P2-N1).

---

## 5. Panel recenzentów
Uwaga: role odegrane przez agenta QA na podstawie zrzutów, pomiarów i przejść botów; to nie są oceny prawdziwych osób.

| Rola | Ocena 1-5 | Trzy poprawki |
|---|---|---|
| UX i wygląd | 4 | Środek wstęgi widoczny przed wejściem (P1-N1); cień Okruszka i cień przeszkody na „podłodze” wiersza (P1-N6, P2-N10); HUD w L5 za dnia (P1-N5). |
| Laik dorosły | 3 | Krótkie podpowiedzi w pierwszych 30 s (P1-N7); „dlaczego raz mam kolor, a raz nie?” - pokaż, że liczy się środek (P1-N1); dźwięk, że w coś uderzyłem (P1-N4). |
| Dziecko ok. 9 lat | 4 | Ptaszek super, złote strzałki fajne; „jak jastrząb krzyczy, to wiem, że uciekać” (P1-N4); więcej „wow” przy trzech z rzędu (akord, błysk, wibracja). |
| Gracz casual (zna Alto's Odyssey) | 3 | Lot reaguje dopiero po puszczeniu palca, brak bezwładności i przechyłu kamery (P1-N3, poprawki 2, 5, 8); dźwięk i wibracja przy każdym zdarzeniu; Alto ma ryzyko w każdej sekundzie, tu po nauce uniku nic nie grozi (P1-N2). |
| Ruch i dostępność | 4 | Mniej ogłoszeń poziomu (P2-N1); kontrast HUD w L5 (P1-N5); dłuższe okno nauki dla wolniejszej motoryki tylko w K1-K2, jeśli P1-N2 skróci okno ucieczki dalej. |
| Strażnik (testy, bezpieczeństwo, koszty) | 4 | Testy preflightu liczą cele botem z idealną precyzją i „przegapia 10%”; dodać bota „człowiek” (opóźnienie, 70% celowania) i bota zawsze uważnego (P1-N1, P1-N2); test kanałów (każde zdarzenie ≥ 2 kanały); długie zadanie startu 2,8 s nadal do rozbicia. Bezpieczeństwo: CSP, noindex, brak danych osobowych w porządku, koszt zerowy. |
| Krytyk Seba | 2 | „Po 3 minutach nudzi to, że jedyne zagrożenie omija się zawsze tym samym krokiem w bok, a kolor przychodzi albo nie, i nie wiadomo czemu.” Do „szalenie satysfakcjonującego” brakuje: dźwięku i wibracji pod każdym ruchem, natychmiastowej reakcji na kciuk, widocznej precyzji, prawdziwego ryzyka. „Szalenie piękne” jest blisko (8/10), „szalenie satysfakcjonujące” nie (5/10). |

---

## 6. Czego nie zmierzono (wprost)
- Prawdziwy telefon (Android, iOS Safari, 120 Hz, gesty systemowe), prawdziwe opóźnienie ekranu dotykowego, wibracje (brak w kodzie, więc nie było czego mierzyć).
- Dźwięk na słuch (w ?test moduł nie gra; sprawdzono tylko, które zdarzenia go wołają).
- Prawdziwi laicy i dziecko (panel odegrany); test „wskaż komórkę przeszkody” na zrzucie nie zrobiony z ludźmi.
- fps przy CPU x4/x6 bez obciążenia komputera (wyniki tej rundy zaszumione), tryb lekki poza ?test.
- Odczucie płynności i satysfakcji (oceny 1-10 to wnioski z pomiarów, kodu i zrzutów).
- P2-7, P2-8, P2-10, P2-11 z rundy 1.

## 7. Pliki
- Raport: `qa\RAPORT-QA-RUNDA-2.md`
- Nowe skrypty: `qa\qa2_c_boty.cjs` (boty x krainy, argumenty: etykieta, boty, krainy, biegi, max_s, port), `qa\qa2_c_drapieznik.cjs`, `qa\qa2_c_poziomy.cjs`, `qa\qa2_b_czucie.cjs`, `qa\qa2_g_kanaly.cjs`, `qa\qa2_d3_zblizenie.cjs`, `qa\qa2_d_wiatry.cjs`, `qa\qa2_d_rozmiary.cjs`, `qa\qa2_e_start.cjs`; `qa\wspolne.cjs` zapisuje wyniki z prefiksem `r2_`.
- Ponownie uruchomione skrypty rundy 1: `qa_a_journey`, `qa_b_sterowanie` (+ `bot 2`), `qa_d_grafika`, `qa_d2_przeszkody`, `qa_e_wydajnosc`, `qa_f_dostepnosc`, `qa_kontrast_zrzut`.
- Dane: `qa\r2_wynik_*.json`, logi `qa\r2_log_*.txt`; zrzuty `qa\zrzuty\` (arkusze `_R2_ark_*.png`, `_R2_hud_L5.png`, `_R2_cien.png`, `_R2_wiatry.png`).
