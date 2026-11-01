# Z19: czucie lotu (game feel) i poprawki P1 z QA rundy 2 (zlecenie dla Codexa)

Pracujesz samodzielnie i autonomicznie, bez pytań, po polsku. Nie wdrażaj, nie wysyłaj maili, nie ruszaj niczego poza tym katalogiem (worktree gra-okruszek-Z19).
Nie wykonuj `git commit` (sandbox tego nie pozwala; orkiestrator zacommituje); zostaw pliki zmienione.
Gra: Okruszek/Crumbi, jeden plik `index.html` (Canvas 2D) plus `teksty.js`, `dzwiek.js`, `sw.js`, `manifest.webmanifest`. Testy: `gra_test_*.cjs` i `preflight.cjs` (Playwright; przeglądarka
`C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe`, moduł `C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright`; wzoruj się na istniejących testach).
Hak testowy `?test` = `window.__okruszek`; `?tor=1` włącza tor 3x3.

## Cel właściciela
„Satysfakcja z lotu musi być zdecydowanie bliżej 10/10.” Ocena QA rundy 2: piękno 8, satysfakcja z lotu 5, czytelność 6, uczciwość trudności 6, stabilność 9.
Kryterium kolejnych rund: wszystko >= 9. Ostatecznie ocenia właściciel na telefonie.

## Czytaj w katalogu kontekst/
- `RAPORT-QA-RUNDA-2.md` (CAŁY: statusy poprawek, nowe P1 i P2, 10 poprawek czucia lotu uporządkowanych wg wpływu, dowody) i `RAPORT-QA-RUNDA-1.md`.
- `PROJEKT.md` (sekcja 2 nienaruszalna; 5a/5b sterowanie, 12-18; szczególnie 14 pełny kolor po trzech wiatrach z rzędu, 15 tor, 15.9 TOR NIE JEST WIDOCZNĄ SIATKĄ, 15.8 start jasny,
  16.5 drążek, 17, 17.1, 17.2 dźwignie czucia lotu, 18 strojenie Z18) i `05-bestiariusz-stref.md`.

## Decyzje właściciela, których NIE wolno łamać
Widok zza pleców; tor NIE jest widoczną siatką (siatka tylko pod ?siatka=1); styl bez ciemnych konturów (tonalne warstwy), start jasny i delikatnie kolorowy; zieleń tylko z funkcją
(buff/nerf); szczyt (nadchmurze) tylko wiatrem; w nadchmurzu drapieżniki/UFO/statki tylko jako widowisko bez kolizji; pełny kolor dopiero po trzech wiatrach z rzędu;
drążek pełnoprawnym trybem; reduced-motion respektowany; dźwięk nigdy jedynym kanałem informacji; jastrząb i sowa jedynymi końcami biegu poza morzem chmur.

## Zadanie 1: P1 z rundy 2 (najpierw)
- P1-N1: idealne wejście w wiatr to okno ±11 px, a nic tego nie pokazuje; jedno machnięcie wypycha ptaszka. Zrób celowanie CZYTELNYM i przyjemnym: wiatr świeci mocniej, gdy Okruszek
  jest w osi wstęgi (miękka poświata, nuta w dźwięku), delikatne przyciąganie do osi („magnes”) w obrębie okna +-18 px, bez zmiany celów trudności z Z18 (boty: idealny pełny kolor
  >= raz w 60 s; bot 50% <= 15% biegów; losowy nigdy). Liczby weryfikuj `qa/` skryptami i `gra_test_z18.cjs`; jeśli magnes zmienia statystyki, koryguj okno, nie testy.
- P1-N2: uważny gracz nie przegrywa (drapieżnik łapie raz na 916 ataków). Zrób z niego realne, UCZCIWE zagrożenie bez nagłych śmierci: zmienne czasy namierzania 0,5-1,1 s, zwód i dwa
  kolejne uderzenia po sobie, atak na dwie komórki naraz od K4, krótsze okno ucieczki na wysokich poziomach, zawsze zapowiedź >= 1,5 s i wolna droga ucieczki. Cel: bot 70% kończy bieg
  po 3-8 min, bot idealny 8-20 min, bot uważny w dłuższym czasie, ale nie nieskończenie.
- P1-N3: obraz reaguje dopiero po puszczeniu palca (100-200 ms od dotknięcia; cel < 50 ms): reaguj na pointerdown/touchstart (natychmiastowa reakcja skrzydeł i początek ruchu), zmierz hakiem i w testach.
- P1-N4: dźwięk i wibracja. Rozszerz `dzwiek.js` o brakujące zdarzenia (machnięcie z siłą, uderzenie w chmurę tłumione, wybicie, łańcuch z rosnącą melodią, pełny kolor „rozkwit”, zapowiedź
  drapieżnika, Turbo, Hiper, wejście w wiatr z nutą zależną od trafienia w oś) i podepnij pod zdarzenia toru. Dodaj wibracje (`navigator.vibrate`, krótkie wzorce, tylko gdy dostępne, wyłączalne
  przełącznikiem „Wibracje” w panelu pauzy, domyślnie włączone, zapamiętane w zapisie; iOS bez API: bez błędu). Każde zdarzenie toru ma co najmniej dwa kanały sprzężenia.
- Pozostałe P1 i tanie P2 z raportu: HUD w hiperprędkości za dnia kontrast >= 4,5:1; cień Okruszka czytelny (tor bez siatki: cień ma być widoczny, kontrast >= 2:1 na każdym tle);
  przedmiot z dolnego wiersza rysowany nad ptakiem 1,5 s przed kontaktem (popraw perspektywę/pozycję); krótka, znikająca wskazówka dla nowego gracza przy pierwszym biegu
  (jedno zdanie zależne od trybu sterowania, np. „Stuknij, żeby machnąć. Przytrzymaj, żeby zanurkować.”), tylko do pierwszego wiatru, bez dymków.
  NIE ruszaj: `manifest.webmanifest`, `sw.js`, przycisku „Zainstaluj” i ekranu startu (robi to inny wykonawca równolegle); panel pauzy tylko o przełącznik wibracji.

## Zadanie 2: czucie lotu (potem)
Wdróż 10 poprawek czucia lotu z raportu QA w kolejności wpływu: sprzężenie zmysłów (obraz, dźwięk, wibracja), skrzydła z dobiegiem (anticipation, overshoot, easing; ciężki zamach wyraźnie
cięższy od lekkiego; asymetria przy skręcie), kamera (pochylanie przy skręcie, rozszerzenie pola widzenia przy prędkości, drżenie tylko w turbulencjach, bez migotania > 3/s), poczucie masy i
wysokości, rytm fraz z muzyką, mikro-nagrody. Reduced-motion zmniejsza ruch kamery i drgania.

## Testy i środowisko
- Wszystkie dotychczasowe testy zielone (Z2-Z18); dostosuj UCZCIWIE tylko te, które zmieniają nowe cele (zapisz zmiany z uzasadnieniem w raporcie), nie luzuj progów bez uzasadnienia.
- Nowy `gra_test_z19.cjs`: opóźnienie wejścia do pierwszej reakcji < 50 ms (hak); pokrycie zdarzeń kanałami (każdy typ ma >= 2 kanały: liczniki wywołań dzwięku i `vibrate` w haku ?test);
  wibracje (stub `navigator.vibrate`, przełącznik działa, brak błędu bez API); celowanie (poświata rośnie z bliskością osi; magnes nie zmienia celów trudności botów); drapieżnik (rozkład
  czasów namierzania, atak na dwie komórki, zawsze wolna droga ucieczki); brak migotań > 3/s; reduced-motion zmniejsza drżenie kamery. Dołącz do `preflight.cjs`.
- Komputer właściciela bywa obciążony (mało wolnej RAM): używaj pomiarów deterministycznych (hak ?test, tempo, stałe ziarna, mediany z wielu rund). Pełny `node preflight.cjs` trwa ok. 30 min:
  w trakcie używaj pojedynczych testów, pełny raz na końcu; przy porażce pomiaru klatek/botów uruchom ten test osobno przed ruszaniem progów.
- Skrypty z ukośnikami/regex pisz do pliku; po każdej edycji JS sprawdź składnię (`node --check`).
- Zrzuty 390x844 do `zrzuty-z19/` (poświata wiatru przy różnym wyrównaniu, cień Okruszka, wskazówka, HUD w hiperprędkości za dnia, przedmiot z dolnego wiersza); obejrzyj i popraw.

## Raport końcowy (zapisz do `RAPORT-Z19.md` w tym katalogu, po polsku, do 450 słów, prawdziwy)
Które P1/P2 i które z 10 poprawek zrobione, liczby (opóźnienie, boty przed/po, kanały sprzężenia), zmiany testów z uzasadnieniem, wynik preflightu, pozostałe braki, własna ocena
satysfakcji z lotu 1-10 z uzasadnieniem, jak sprawdzić. Co niezmierzone (prawdziwy telefon, iOS, dźwięk na słuch) napisz wprost. Nie przesadzaj z deklaracjami: jeśli test nie przeszedł, napisz to.
