# Raport Z21 (26.10.2026): przewrót w bok, widoczne drogi toru, unoszenie

Gałąź `z21-przewrot` (od `z19-czucie` 7d61ff1), worktree `C:\Users\User\Desktop\projekty\gra-okruszek-Z21`. Bez wdrożenia, bez pusha.

## Co zrobione

**19.1 Przewrót (unik).** Podwójne stuknięcie po prawej = beczka w prawo przez prawe skrzydło, po lewej = w lewo (tryb 1: połowa ekranu; tryb 2: ten sam kciuk, kolumna przesunięta pierwszym stuknięciem nie przesuwa się drugi raz; tryb 3: obszar drążka = w lewo, prawa połowa = w prawo; mysz: podwójny klik; klawiatura Q/E; hak `przewrot('lewo'|'prawo')`, `przewrotStan()`, w `torSymuluj` bot zwraca `{ przewrot: -1|1 }`). Pierwsze stuknięcie macha od razu, drugie w oknie 250 ms zamienia się w przewrót. Skutek: kolumna w stronę przewrotu (przy krawędzi w miejscu), okno niewrażliwości 0,25 s w środku animacji 0,35 s (0,05-0,30 s) na drapieżnika i przeszkody S1/S2 (nie na morze chmur, oaza nadal działa), odnowienie 1,2 s, koszt 25% E (najwyżej 0,1), świst (dzwiek.js `przewrot`), wibracja [10,25,18], smuga trzech łuków, pióra. Animacja: obrót rysunku wokół osi lotu (ease in-out, bez migotania), skrzydło prowadzące składa się pierwsze; przy reduced-motion sam przechył. Stałe `TOR.PRZEWROT_*`. yF, łańcuch i magnes osi (Z19) nietknięte.

**19.2 Drogi.** Dziewięć dróg jako miękkie smugi światła od każdej komórki w głąb (jeden sprite klina rysowany afinicznie: w perspektywie z punktem zbiegu droga jest dokładnie klinem; krycie 0,2 / 0,3 sąsiedzi / 0,42 komórka Okruszka, płynne przejścia). Nad morzem chmur za dnia światła nie widać, więc dolny wiersz to miękkie smugi cienia (multiply), nocą znów światło. Wiersze nad horyzontem rysowane ZA przedmiotami toru (przeszkody czytelne), dolny po morzu. Pasy wysokości: dolny cieplejsza mgiełka, górny bliskie światło, oba gasną gradientami (bez krawędzi). Plamy światła w drodze Okruszka płyną ku graczowi. Przełącznik „Drogi toru” w panelu (tylko tor, nie na ekranie startu; `ZAP.drogi`, domyślnie włączone; hak `drogi(v)`); `?siatka=1` nadal debug. Zapis opisany w ekranie prywatności.

**19.3 Unoszenie.** Rysowana wysokość `yV` wznosi się wolniej niż logiczna `yF` (machnięcia tau 0,15 s, wiatr 0,16 s), opada tak samo; cień i kropki wzlotu idą za `yV`. Dyszki: przy szybowaniu (0,9 s po ostatnim machnięciu, poza nadchmurzem) co 3,2 s łagodne uniesienie o 7 px przez 1,5 s ze skrzydłami lekko uniesionymi; reduced-motion je wyłącza. Logika idealnego wejścia bez zmian (bezpieczne dla łańcucha i botów Z18).

## Liczby (gra_test_z21.cjs, 56 sprawdzeń)
- Beczka: 20 klatek, obrót monotoniczny do 2 pi, największy krok 0,58 rad; prawe skrzydło prowadzi (dr 0,9 > dl 0,23).
- Drapieżnik, 6 ziaren K4, Okruszek przy krawędzi: przewrót 0,2 s przed uderzeniem = `unik` 6/6; 0,02 s i 0,34 s = `zlapal` 6/6; bez przewrotu `zlapal` 6/6.
- Bot-unikacz wobec tego samego bota bez przewrotu (5 ziaren, K4): 240/240/240/240/240 s (limit) wobec 64,7-64,8 s; uniki 2/3/1/4/2.
- Wstęgi: rozjaśnienie górnego wiersza 11,4-16,6 (dzień L0/L4), 27,8-44 (noc); dolny wiersz za dnia pociemnienie 16-18 w L0 i 7 w L4 (ton jaśniejszy od cienia przeszkody: zapowiedź Z17 zostaje czytelna, 7,5 >= 3), nocą rozjaśnienie 25-33. Komórka Okruszka 7,6 wobec dalekiej 4,9 (tryby 1-3). Cień Okruszka >= 2:1 w 4 porach x L0/L5 x 3 wiersze (najmniej 2,35). Linie Z17: grz +0,0000/-0,0004, dol +0,0000/-0,0001. Kontrast chmury w drodze: zmiana 3,7%.
- Wznoszenie 118 px: najwyżej 5,25 px na klatkę (przed: ok. 13-17), 90% po 0,38 s; po wietrze 5,34 px, 0,52 s. Dyszka do 7 px, krok <= 0,27 px.
- Czas rysowania (headless, nie telefon): z drogami p50 2,0 ms, bez 2,1 ms.

## Zmiany testów (uczciwe)
- `gra_test_z5.cjs`: lista API dzwiek.js rozszerzona o `przewrot` (nowy głos).
- `gra_test_z14.cjs`: dwa POJEDYNCZE stuknięcia (tryb 1 i 3) oraz dwa kliki myszą miały odstęp 60-120 ms, czyli według 19.1 są podwójnym stuknięciem (przewrót); teraz 300/320 ms. Podwójne stuknięcie sprawdza gra_test_z21.
- Nic nie obniżono; Z19, Z18, Z17 bez zmian i zielone.

## Pozostałe braki (5)
1. Szybkie machanie w jednym miejscu (< 250 ms) w trybie 1 wywoła przewrót co 1,2 s; do strojenia na telefonie (`TOR.PRZEWROT_OKNO`, `PRZEWROT_TAP_PX`).
2. Przy L3-L4 w dzień drogi są bardzo delikatne (jasne, nasycone niebo; dolne smugi-cienie celowo słabe, by nie zakrywać cienia nadlatującej przeszkody); czytelność najlepsza w L0-L2.
3. Nocą szew na horyzoncie (ciemna krawędź morza chmur) sprzed Z21 nadal widoczny.
4. Środkowy wiersz leży na horyzoncie: jego smugi i górne częściowo się nakładają w kolumnie środkowej (geometria perspektywy); dziewięć miejsc czyta się z trzech kolumn i trzech stref (niebo / horyzont / morze), nie z dziewięciu osobnych znaków.
5. Dźwięk świstu i siła wibracji ocenione tylko z kodu; brak próby na iOS i na prawdziwym telefonie.

Własna ocena satysfakcji z lotu: 8,5/10 (unik daje „dreszcz i nagrodę”, wznoszenie przestało skakać, drogi widać bez instrukcji); 9+ dopiero po teście właściciela na telefonie.

## Preflight
Pełny `preflight.cjs` uruchomiony dwa razy (ok. 30 min każdy). Pierwszy: FAIL Z5 (lista API dźwięku bez `przewrot`) i Z17 (f) (smugi-cienie zakrywały cień zapowiedzi przeszkody: 0,07) - oba naprawione (etap 3). Drugi: FAIL Z3b (pomiar „pory” i etapów koloru w locie swobodnym; padał już w preflight-z18-1.log przed Z21, osobno zielony) i Z21 reduced-motion (test nie czekał na zdarzenie matchMedia pod obciążeniem; test uodporniony). Po poprawkach osobno zielone: Z21 (56), Z17, Z5, Z14, Z19, Z18, Z3b. Trzeciego pełnego biegu nie robiono (polecenie koordynatora).

## Jak sprawdzić
`index.html?tor=1`: podwójne stuknięcie z prawej/lewej (Q/E na klawiaturze), pauza > panel > „Drogi toru”. Automatycznie: `node gra_test_z21.cjs`, `node preflight.cjs` (wynik w `preflight-z21.log`). Zrzuty: `zrzuty-z21/` (przewrot-*, drogi-*, cien-*, wznoszenie-*).
