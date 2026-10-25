# Okruszek v1.5: zlecenia Z10-Z13 (kolejność, silnik, kryteria odbioru)

Uzupełnienie `ZLECENIA.md` (którego nie zmieniamy). Werdykt i uzasadnienia: `fabula\00-wybor.md` (sekcje 1-3); tam też kanoniczna lista krain K1-K10 i rozstrzygnięcia C1-C30.
Zasady jak w `ZLECENIA.md`: każde zlecenie w osobnym worktree (`gra-okruszek-Z10` itd., od najnowszego scalonego `index.html`); jedno zlecenie do `index.html` naraz; po każdym `node preflight.cjs` i zrzuty 390 px;
właściciel testuje na telefonie, uwagi wdrażać od razu. Nie zmieniać decyzji z sekcji 2 `PROJEKT.md`. Nie przekazywać silnikom `fabula\02-przeszkadzajki.md` jako specyfikacji (uszkodzony tekst, kolidujące oznaczenia; C25, C26): potrzebne parametry są niżej.

**Kolejność całości:** `Z3b → Z2b + 5b → Z10 → Z4 → Z3c → Z5 (+ Z6) → Z11 → Z12 → Z13 → Z7 → Z8 → Z9`. Z4 może powstawać równolegle w osobnym worktree; scalanie do `index.html` po kolei.

**Oznaczenia (obowiązują w kodzie, testach i raportach):** K1-K10 = krainy; L0-L5 = poziomy prędkości; S0-S3 = klasy skutku; Z = zlecenia; przeszkody, prądy i zdarzenia po nazwie (`szpile`, `przelot`, `bak`).
**Klasy skutku:** S0 brak kary (widowisko, okazja); S1 lekka (wirowanie ≤ 0,8 s, s −0,05…−0,1, kolor chwilowo gaśnie); S2 mocna (wirowanie 1 s, s w dół najwyżej o jeden poziom, utrata wysokości); S3 koniec biegu: TYLKO jastrząb, sowa i morze chmur.
**Jednostka skoku:** „1 j.” = `G.PRAD_S` z kodu (dziś 0,24 [kod Z3b]); każdy bonus zapisany jako mnożnik `G.PRAD_S`, nigdy liczba na sztywno.
**Reguła budżetu prędkości:** każdy przyspieszacz liczy się jako JEDEN prąd w łańcuchu albo nie podnosi s powyżej `G.CAP4`; L5 wyłącznie przez `G.GATE5`. Testy 12.1 (bot idealny L4 w 60 s, bot losowy nigdy L4, L5 tylko z łańcuchem) muszą zostać zielone po każdym zleceniu.

| Nr | Zlecenie | Silnik | Zależy od | Kryterium odbioru (skrót; pełne niżej) |
|----|----------|--------|-----------|-------------------|
| Z10 | Szkielet długiej gry: `KRAINY` K1-K5 + Dalekie Niebo jako dane, bramy-kurtyny, start z bramy o porze domowej, brama przez wytrwałość, kreska do bramy, napięcie N(t), zapowiedź w sekundach i zasada szkicu, klasy S0-S3, prąd ratunkowy, cicha pomoc, ziarno dnia, drapieżniki wg krain, zapis `okruszek.zapis` v1, tryb zgodności `?pasmo=1`; pomiar typowej prędkości | Opus 5.5 high (Codex: testy botów) | Z3b, Z2b + 5b | zmierzona prędkość typowa w raporcie i w `KRAINY`; bot idealny przechodzi K1-K5 w ≥ 9/10 ziaren; bot „70%” z bramy do następnej ≥ 50% prób; zapowiedzi ≥ 1,5 s (drapieżnik ≥ 2 s) na L0, L2, L4, L5; 0 końców biegu od przeszkód innych niż S3; ≥ 55 kl/s przy bramie; testy Z2, Z3, Z3b, Z2b zielone |
| Z3c | Pełny kolor tylko po trzech przyspieszeniach z rzędu: energia koloru E z łańcucha prądów, idealne wejście, zawężone okno, szybki zanik, rozkwit koloru, HUD z iskierkami, GATE4=3 (PROJEKT.md sekcja 14) | Sonnet 5.5 high | Z10, Z4 | bot idealny pełny kolor >= 1 raz w 60 s; bot 50% trójka z rzędu <= 15% serii, pełny kolor <= 2 s; bot losowy nigdy; testy 12.1 i kolejność koloru zielone; zrzuty E=0, 0,3, 0,62, 1 |
| Z11 | Treść krain K2-K5 w docelowym stylu: tęcza księżycowa i Rogal (K2), szpile miasta i komin ciepła (K3), festiwal latawców i poryw (K4), Wielki przelot z wirami i smugą (K5), finały i zwiastuny krain, kierunek słońca (wschód za plecami, zachód przed Okruszkiem) | Opus 5.5 high + panel designu (laik x3, Projektant) + Prawnik | Z10, Z4 | każdy element wymuszalny hakiem; panel ≥ 4/5 „ładne i czytelne” i „widzę zagrożenie, zanim w nie wlecę”; przy s = 0 brak czerwieni poza szalikiem; ≥ 55 kl/s z samolotem i 5 wieżami na ekranie; reguła budżetu prędkości zielona; Prawnik bez uwag |
| Z12 | Zeszyt Okruszka i ekrany v1.5: strony krain malowane najlepszym poziomem, 15 wspomnień, pocztówki, start z paskiem bram, koniec biegu z paskiem Drogi, „szczytem lotu” i Pierzynką w kolorach szczytu, pełny zapis, „Zacznij od nowa”, prywatność | Sonnet 5.5 high + panel designu | Z5, Z11 | `odstepy.js` bez ZLE (1440 i 390) na start, koniec, Zeszyt, strona krainy, ustawienia; zapis < 4 KB, tylko w 3 chwilach, odporny na tryb prywatny i uszkodzony JSON; „Leć jeszcze raz” < 400 ms; bez liczników kolekcji; Prawnik bez uwag do prywatności |
| Z13 | Nuty wiatru i idealne wejście (rdzeń prądu, melodia łańcucha), talia rzadkich zdarzeń (Bączek, chmura w kształcie, autostop za kluczem gęsi) z pocztówkami, narracja (szepty, rytm tekstów), „Okruszek ziewa” po 20 min, jedno polecenie wszystkich testów v1.5 | Sonnet 5.5 high (Codex: testy) | Z12 | testy 12.1 zielone mimo bonusów; rdzeń widoczny bez dźwięku; talia: ≤ 1 rzadkie na 4 min, nigdy w pościgu, pierwsze w ≤ 3 biegach > 90 s; Bączek bez wiązki i bez wciągania; szepty ≥ 35 s odstępu; `node testy_v15.cjs` zielone |

---

## Z10. Szkielet długiej gry (Opus 5.5 high)

**Cel:** z biegu na 1-4 min zrobić Drogę na wiele dni, nie zmieniając stałej mechaniki („leć jak najdalej”, s 0..1, L0-L5, kolor z prędkości, doba z prędkością).

**Zakres:**
1. **Pomiar najpierw.** Bot „70%” (łapie 70% prądów, nurkuje losowo 30% czasu) w K1, 10 ziaren: mediana prędkości m/s i mediana długości biegu. Wynik do `raporty/z10-pomiar.md`. Metry krain = czas typowy x zmierzona prędkość, zaokrąglone do 100 m.
2. **`KRAINY` jako dane** (jedna tablica w `index.html`, teksty w `teksty.js`): `id, od, do, czasTyp, pora (phi), akcent (paleta mieszana z porą), sink, pradCo, pradTyp, przeszkody {typ: waga}, debiut [typy], drapieznik {jastrzab, sowa}, nBaza, final`.
   Czasy typowe: K1 90 s, K2 120 s, K3 135 s, K4 150 s, K5 165 s; za K5 „Dalekie Niebo” bez końca. Pory domowe: K1 zmierzch, K2 noc, K3 świt, K4 dzień, K5 popołudnie.
   Do czasu Z11 krainy K2-K5 używają przeszkadzajek z Z3/Z3b: K1 większy ptak; K2 deszcz + krótki grad; K3 mgła poranna (łagodna) i stado jako zastępstwo wież; K4 sznur latawca + wiatr boczny; K5 stado; Dalekie Niebo: wszystko + burza.
   SINK na start (do strojenia): K1 0,032; K2 0,036; K3 0,038; K4 i K5 0,040; Dalekie Niebo 0,042.
3. **Przenikanie:** 300 m przed bramą lerp akcentu palety i wag harmonogramu; sprite'y nowej krainy dorenderowywane po 1-2 na klatkę (budżet 2 ms), najwyżej dwie pule naraz. Zwiastun: 300 m przed bramą jeden element następnej krainy.
4. **Brama-kurtyna:** dwie wysokie kulisy chmur rozsuwają się na boki; w szczelinie światło następnej krainy. Przelot: nazwa krainy 2,5 s w stałej strefie tekstu (pas pod wskaźnikiem poziomu), wysokość `h = max(h, 0,8)`, 10 s bez nowych zdarzeń. Gra się nie zatrzymuje. **Doby nie przewijamy** (C11). Zapis bramy w chwili przelotu.
5. **Start z bramy:** dowolna odblokowana brama; bieg zaczyna się o porze domowej krainy; 20 s bez zdarzeń, prądy co 3 s przez 20 s (jak start z Gniazda).
6. **Brama przez wytrwałość:** suma metrów przeleconych wewnątrz krainy n we wszystkich biegach ≥ 3 x długość krainy n → brama n+1 otwarta na starcie następnego biegu; scena 3 s (Fiuk-zawijas prowadzi przez kurtynę), szept „Fiuk zna już drogę.”. Bez komunikatu o próbach.
7. **Kreska do bramy:** cienka linia pod licznikiem dystansu, napełnia się do następnej bramy, bez liczb (Goal-Gradient).
8. **Napięcie N(t)** = min(0,85; nBaza krainy + 0,15·min(1; t / 6 min) + fala(t)); fala: piła co 90 s (70 s rośnie od −0,10 do +0,10, potem 20 s oddechu: N x 0,4, same prądy). Odstęp przeszkód od 9 s (N = 0) do 3,2 s (N = 0,85), nigdy mniej niż 3,2 s; udział przeszkód S2 = N². nBaza: K1 0,10; K2 0,20; K3 0,28; K4 0,36; K5 0,44; Dalekie Niebo 0,55. Rozgrzewka: pierwsze 25 s N x 0,3. Po bramie 10 s spokoju, po pościgu 15 s.
9. **Budżet uwagi:** najwyżej 1 widowisko, 1 przeszkoda S2 i 2 przeszkody S1 naraz; po S2 cisza 4 s; drapieżnik nie wchodzi 6 s po S2; ≤ 3 duże sprite'y i ≤ 120 cząstek na ekran (log w `__okruszek`).
10. **Zapowiedź w sekundach i zasada szkicu:** odległość pojawienia się liczona z czasu do kontaktu, nie z warstwy z; minimum 1,5 s dla przeszkód i 2 s dla drapieżników na każdym poziomie (typowo 2,5-3 s). Każde zagrożenie najpierw jako jasny, kreskowany szkic toru lub konturu tam, gdzie przeleci, dopiero potem farba. Minimum dwa kanały zapowiedzi (obraz + dźwięk albo łuk na krawędzi ekranu); dźwięk nigdy jedynym kanałem.
11. **Klasy skutku S0-S3** jako tabela w kodzie (typ przeszkody → klasa); S3 tylko `jastrzab`, `sowa`, morze chmur.
12. **Drapieżniki wg krain:** K1 brak; K2 sowa (pierwsza wizyta w zapisie: tylko pohukuje i przelatuje w tle); od K3 sowa nocą; od K4 jastrząb w dzień (pierwszy pościg w K4); K5 jastrząb co ok. 120 s. Najwcześniej 120 s od startu z Gniazda i 60 s od startu z bramy. Próg ucieczki zostaje `G.HAW_S` (C9). W L5 nowy pościg nie startuje.
13. **Prąd ratunkowy:** gdy h < 0,2, w ciągu 3 s pojawia się osiągalny prąd (najwyżej raz na 30 s).
14. **Cicha pomoc:** po 3 biegach z rzędu krótszych niż 60 s następny bieg ma +15% prądów i drapieżnika 30 s później; bez komunikatu; w `?test` tylko na żądanie hakiem.
15. **Ziarno:** data + numer biegu tego dnia; w `?test` stałe (`seed`).
16. **Zapis `okruszek.zapis` v1** (localStorage, każdy odczyt i zapis w try/catch; gra działa bez zapisu): `v, bramy [n], najdalej (m na Drodze), najdluzszy (m), krainy {n: {m, loty}}, krotkie, dzien {d, n}`. Zapis tylko przy przelocie bramy, na końcu biegu i przy zmianie ustawień, nigdy w pętli klatek. Uszkodzony JSON → kopia w `okruszek.zapis.zly`, czysty start bez komunikatu. Klucz ustawień z 5b musi mieć pole `v` (jeśli Z2b go nie dodał, dodać).
17. **Tryb zgodności `?pasmo=1`:** stary harmonogram z Z3/Z3b bez krain (dla starych testów i jako zapas awaryjny).
18. **Hak testowy:** `__okruszek.kraina(n)`, `.brama(n)` (start z bramy n), `.napiecie()`, `.zapowiedzi()` (log: id, czas szkicu, czas kontaktu), `.zapis()`, `.wyczyscZapis()`, `.wytrwalosc(n, m)` (dopisz metry), `.cichaPomoc(true)`.

**Poza zakresem:** nowe rysunki (Z11), Zeszyt i ekrany (Z12), nuty i rzadkie zdarzenia (Z13), Pogoda dnia (v2).

**Kryteria odbioru:**
- `raporty/z10-pomiar.md`: zmierzona prędkość typowa i długość biegu; te same liczby w `KRAINY`.
- Bot idealny: start z każdej bramy K1-K4 dolatuje do następnej w ≥ 9/10 ziaren. Bot „70%”: ≥ 50% prób w K1-K5. Bot losowy: nigdy L4 (test 12.1).
- `zapowiedzi()`: dla każdego wymuszonego zagrożenia na L0, L2, L4 i L5 czas od szkicu do kontaktu ≥ 1,5 s; dla drapieżników ≥ 2 s.
- 50 wymuszeń każdej przeszkody innej niż jastrząb i sowa: 0 końców biegu.
- Log N: zawsze ≤ 0,85; odstęp przeszkód ≥ 3,2 s; 20 s bez zdarzeń po starcie z bramy; brak drapieżnika w K1.
- Brama: ≥ 55 kl/s przez cały przelot (log fps, średni Android albo Chromium z ograniczeniem CPU x4); zamknięcie karty tuż po przelocie zostawia bramę w zapisie.
- Wytrwałość: `wytrwalosc(1, 3 x długość K1)` → brama 2 dostępna w następnym biegu.
- Prąd ratunkowy: h < 0,2 → prąd w ≤ 3 s; nie częściej niż raz na 30 s.
- Zapis: zablokowany localStorage (Playwright podmienia `Storage.prototype.setItem` na rzucający wyjątek) → gra działa; uszkodzony JSON → `okruszek.zapis.zly` i czysty start.
- Zrzuty 390 px: kurtyna w połowie dla bram 1-5, start z bram 1-5 (pora domowa widoczna), kreska do bramy.
- Testy Z2, Z3, Z3b, Z2b zielone (te, które zakładają stary harmonogram, z `?test&pasmo=1`); `preflight.cjs` zielony.

---

## Z11. Treść krain K2-K5 (Opus 5.5 high + panel designu + Prawnik)

**Cel:** pomysły właściciela (wieże przez chmury, wielkie samoloty z turbulencją) i krainy Księgi 1 w docelowym stylu z Z4 (kreska tuszem, akwarela poza konturem, pseudo-3D z 12.6).
**Zasady wspólne:** każdy element: 3 warianty rysunku, sprite'y pre-renderowane (kontur / kolor / kolor zamglony), hitbox 55% sylwetki ptaszka i 60-70% rysunku przeszkody (akwarela, poświata i kołnierz chmury nie kolidują), zapowiedź wg Z10, klasa skutku z tabeli Z10, debiut pierwszy raz w zapisie łagodniej (S0 albo zapowiedź +1 s) z jednym zdaniem w strefie tekstu. Czerwień tylko w szaliku; światła białe i miodowe, kolor świateł dopiero od L2. Żadnych logo, znanych budynków ani sylwetek z filmów.

**Zakres:**
1. **Kierunek słońca** (jeśli Z3b/Z4 tego nie zrobiły): świt = światło od strony kamery (jasny brzeg na plecach Okruszka, długie cienie chmur w głąb ekranu), dzień = słońce wysoko, zachód = słońce przed Okruszkiem nad horyzontem. Zrzuty 4 pór.
2. **K2 Morze Pierzyn:** Rogal (sierp księżyca z jednym okiem z profilu, mruga od L3, poświata jak rozlane mleko); tęcza księżycowa po deszczu (blady łuk w kulisie; przelot pod łukiem = 1 prąd w łańcuchu + suche piórka; w L0-L1 alfa ≤ 0,35, pełna od L2; kolor tylko łuku, nie świata); debiut sowy (przelot w tle, „huu”, bez pościgu przy pierwszej wizycie); finał „ulewa i łuk” (kulisa deszczu z jedną szczeliną ≥ 2,2 szerokości ptaszka, za nią największa tęcza).
3. **K3 Kamienny Las:** szpile miasta = szczyty drapaczy przebijają morze chmur; 8 różnych sylwetek (iglica z anteną, ścięty daszek z ogrodem, walec, wieża z tarasem...), kreska odręczna, pochylenie 1-2 stopnie, okna jako kropki, nocą okna jak konstelacje; kołnierz chmury wokół trzonu (dolna połowa chowa się za chmurą bliższej warstwy).
   Układy: rząd (3-5 wież, szczelina ≥ 2,2 szerokości ptaszka w L0-L2, ≥ 1,8 w L3-L4, ≥ 1,5 w L5), aleja, strzała, skos. Kolizja tylko trzonu (60% szerokości rysunku); wysokość szczytu w jednostkach h: niska wieża (szczyt < 0,55) przelatywalna górą przy h > szczyt + 0,1. Uderzenie = S1 (odbicie, wirowanie 0,8 s, s −0,08, piórka).
   Komin ciepła nad najwyższym dachem: drgające powietrze; przelot tuż nad dachem = +0,2 h i s najwyżej +0,5 j. (nie liczy się do łańcucha, nie przekracza `CAP4`); gaśnie 5 s po wlocie, nie dwa razy z rzędu. Mgła poranna (z Z3b) łagodna przy pierwszej wizycie. Szept przy pierwszym świcie: „Słońce wstało z tyłu. Jak to?”. Finał „kanion wież” z łańcuchem kominów.
4. **K4 Wietrzne Schody:** festiwal latawców (3-7 latawców, sznury z chorągiewkami co 40 px, sznur nigdy cieńszy niż 3 px przy 390; zapowiedź: latawiec wyżej, sznur rysuje się w dół 1,5 s; kontakt = S1, sznur się nie zrywa); poryw latawcowy (latawce szarpią w górę 1 s przed prądem; prąd w tym miejscu = 1 prąd w łańcuchu); wiatr boczny z Z3b częściej; pierwszy pościg jastrzębia (opcjonalnie fałszywy alarm: latawiec w kształcie ptaka, S0). Finał „festiwal”.
5. **K5 Szlak Żelaznych Gęsi: Wielki przelot.** Olbrzymi, okrągły, bajkowy samolot przelatuje w poprzek głębi w warstwie za ptaszkiem (z ≈ 0,7): kadłub NIE koliduje (S0, widowisko). Wygląd: gruba ręczna sylwetka bez znaków linii, okienka jak koraliki, w kokpicie pilot robi „o” i macha; nocą tylko białe i miodowe światła; warianty: jumbo, odrzutowiec, nocny.
   Zapowiedź ≥ 2,5 s: cień na morzu chmur, narastający pomruk ze strony nadlotu, szkic sylwetki i torów, Okruszek ogląda się w tę stronę. Wiry po bokach (dwie spirale wstęg) = S1: drżenie kamery 6-10 px przez ≤ 1,2 s (przy `prefers-reduced-motion` tylko kołysanie ptaszka), znos do ±1 szerokości ptaszka, czułość skrętu −40% przez 1,2 s. Smuga w środku za samolotem = prąd długi 3 s, liczony jako 1 prąd w łańcuchu (najwyżej 1,5 j.), dostępny przy s ≥ 0,35. Pierwszy przelot w zapisie = sam pokaz (bez wirów). Najwyżej jedno widowisko naraz. Stado w kluczu (z Z3b), szept: „Ciocia Gęgawa: Gę! W lewo!”. Finał „przelot olbrzyma” (cień przykrywa ekran, 2 s ciszy, smuga przez całą kulisę do bramy).
6. **Finały i zwiastuny** wszystkich pięciu krain według `00-wybor.md` §3.2; wpisy w `KRAINY`.
7. **Hak:** `__okruszek.zdarzenie('tecza_ks' | 'szpile' | 'komin' | 'latawce' | 'poryw' | 'przelot' | 'smuga' | 'final')`.

**Poza zakresem:** surfowanie po wirach, wieloryb, UFO (Z13), K6-K10 (v2).

**Kryteria odbioru:**
- Każdy element wymuszalny hakiem; zrzuty 390 px na L0, L2 i L4 w dzień i w nocy dla każdego elementu; zrzuty 1440 px dla K3 i K5.
- Panel laików x3 (w tym, jeśli możliwe, dziecko 6-10 lat za zgodą rodzica, bez nagrań twarzy) + Projektant: „ładne i czytelne” ≥ 4/5 i „widzę zagrożenie, zanim w nie wlecę” ≥ 4/5.
- Test konturu: zrzut L0 390 px, laik poprawnie odróżnia prąd, zagrożenie i widowisko w ≥ 9/10 kadrów.
- Przy s = 0: 0 pikseli czerwonych (odcień czerwony, nasycenie powyżej progu) poza obszarem szalika.
- ≥ 55 kl/s z samolotem i 5 wieżami na ekranie (średni Android albo Chromium z ograniczeniem CPU x4).
- Zapowiedzi z `zapowiedzi()` ≥ 1,5 s (samolot ≥ 2,5 s) na L0-L5.
- Budżet prędkości: bot z wymuszaną smugą, kominem, porywem i tęczą nie osiąga L4 bez `GATE4` i L5 bez `GATE5`; testy 12.1 i Z10 zielone.
- Prawnik bez uwag (brak logo, znanych budynków, cudzych sylwetek).

---

## Z12. Zeszyt Okruszka i ekrany v1.5 (Sonnet 5.5 high + panel designu)

**Cel:** postęp widać jako kolor; ekrany startu i końca z Z5 dostają Drogę i Zeszyt bez przebudowy.

**Zakres:**
1. **Zapis pełny `okruszek.zapis` v2** (migracja z v1 z Z10): dochodzi `intro, krainy {n: {poz, m, loty}}, wspom [id], pocztowki [id], licznik {loty, km, doby}, sesja {start}, ostatni {m, brama, koniec}`. Rozmiar < 4 KB. Zapis tylko w 3 chwilach (brama, koniec biegu, ustawienia).
2. **Zeszyt Okruszka:** górny pasek „Wróć” (44 px) i tytuł; linijka łagodnych liczb („42 km · 37 dób · 31 lotów”); pas Drogi (10 odcinków jak pociągnięcia pędzla: K1-K5 w kolorze odwiedzin, K6-K10 w ołówku); strony krain w siatce (2 kolumny przy 390, 5 przy 1440), boksy równej wysokości (ok. 176 px), u góry obrazek krainy rysowany kodem w etapie najlepszego poziomu (L0 kontur, L1 szarości, L2 pastele, L3 ciepłe, L4 pełna akwarela, L5 złoty brzeg strony), nazwa w jednej linii, na dole najlepszy poziom słowem i najdłuższy przelot.
   Strona krainy po stuknięciu: duży obrazek, 2-3 zdania (`teksty.js`), 3 wspomnienia (Z/P/S z `00-wybor.md` §3.3; brakujące jako ołówkowy szkic z podpowiedzią), przycisk „Leć stąd”. Nieodkryte krainy: czysty papier bez nazwy. Pocztówki: tylko widziane, pod nimi „Niebo ma jeszcze tajemnice.”. Bez „x/15”, procentów, gwiazdek i szarych sylwetek.
3. **Start:** pasek „Skąd lecimy?” (odblokowane bramy jako plamy akwareli 44 px + następna jako kontur), przełącznik sterowania 1 | 2 | 3 i suwak czułości z 5b w stałej strefie, „Leć” (56 px), wejście do Zeszytu (44 px, dopiero po pierwszej bramie; przy pierwszym uruchomieniu tylko tytuł, „Leć” i sterowanie).
4. **Koniec biegu:** zdanie przyczyny (stała wysokość: „Okruszek zasnął na chmurce.”, „Jastrząb był szybszy. Okruszek wraca jutro.”, „Sowa była szybsza. Okruszek wraca jutro.”), metry, „od Bramy ... · nazwa krainy”, pas Drogi z zamalowanym odcinkiem tego lotu, jedna linijka „szczytu lotu” (np. „Najpiękniej: Złoto nad Kamiennym Lasem”), najwyżej jedna nowość (karta 72 px), scena: Okruszek śpi na Pierzynce (chmurka z zamkniętymi oczami i rumieńcem od L2), namalowany w kolorach najlepszego poziomu biegu. Przyciski „Leć jeszcze raz” (z tej samej bramy) i „Zeszyt”, pod nimi „Inna brama”. Bez słów „porażka”, bez „zabrakło 200 m”.
5. **Ustawienia:** jak w 04 §3.6 (sterowanie, czułość, dźwięk, muzyka, mniej błysków, mniej ruchu, grafika, kreska do bramy) + „Zacznij od nowa” w dwóch krokach (czyści postęp, ustawienia zostają).
6. **Prywatność iapply:** akapit o zapisie lokalnym (co zapisujemy, że nic nie idzie na serwer, jak usunąć: „Zacznij od nowa” albo wyczyszczenie danych strony); przegląd Prawnika.
7. **Hak:** `__okruszek.zeszyt()`, `.ekran('start' | 'koniec' | 'zeszyt' | 'strona' | 'ustawienia')`, `.licznikZapisow()`.

**Kryteria odbioru:**
- `node C:\Users\User\zbudujmi\gust\odstepy.js <plik> 1440` i `390` bez ZLE dla: start, koniec, Zeszyt, strona krainy, ustawienia, pauza.
- Zasady boksów z `CLAUDE.md`: równe wysokości, dół przy dole, tytuły w jednej linii, cele ≥ 44 px, pierwszy element ≤ 28 px od góry na telefonie i ≤ 40 px na komputerze; zrzuty 1440 i 390 z pomiarem krawędzi.
- Strona K1 w 6 stanach (L0-L5): zrzuty pokazują kolejne etapy koloru.
- Zapis: < 4 KB; `licznikZapisow()` rośnie tylko przy bramie, końcu i ustawieniach; tryb prywatny i zablokowany localStorage → gra i Zeszyt działają (komunikat: „Zeszyt zapamięta loty, gdy przeglądarka na to pozwoli.”); uszkodzony JSON → czysty start; migracja v1 → v2 bez utraty bram.
- „Leć jeszcze raz” startuje lot w < 400 ms (pomiar w `?test`).
- Panel laików x3: „rozumiem, co mi daje Zeszyt” ≥ 4/5. Prawnik bez uwag do prywatności.

---

## Z13. Nuty wiatru, talia rzadkich zdarzeń i narracja (Sonnet 5.5 high + Codex: testy)

**Cel:** satysfakcja z umiejętności (słychać i widać, że grasz dobrze) i „jutro może być inaczej” bez presji.

**Zakres:**
1. **Rdzeń prądu i idealne wejście:** każdy prąd ma trzy strefy: brzeg (skok x1,0 j.), środek (x1,08), rdzeń (x1,15) = jasna nitka w środku wstęgi. Idealne wejście: błysk „kontur do koloru” wokół Okruszka (widoczny także bez dźwięku) i czysta nuta. Pudło nie karze: cisza.
2. **Melodia łańcucha:** każdy złapany prąd w oknie łańcucha dodaje nutę (pentatonika, 5 nut, jeden instrument przez moduł Z6); idealne wejście dodaje harmonię; po minięciu okna melodia się rozpływa. Wprowadzić jako JEDEN nowy element dźwięku (A/B z właścicielem, nigdy wymiana całej muzyki).
3. **Talia rzadkich zdarzeń** (kolejka bez powtórzeń w zapisie `talia`; najwyżej 1 na 4 min lotu; nigdy w pościgu, burzy ani oddechu po bramie; pierwsze gwarantowane w ciągu 3 pierwszych biegów dłuższych niż 90 s; każde pierwszy raz bez kary):
   - **Bączek** (noc, od K2): malutki spodek wielkości gruszki z kopułką i trzema lampkami, kręci się jak bąk, chwieje się, gdy się boi; ta sama kreska i akwarela co świat (bez metalu i neonów). Zapowiedź ≥ 2,5 s (pulsujący punkt w tle, „pi-pi-bąk”, szkic spirali). Spirala wiru: lot zgodnie z obrotem = proca (1 prąd w łańcuchu + mała wysokość), środek = wirowanie 0,8 s (S1). Bez wiązki światła, bez wciągania, bez skanowania. Szept: „Bączek: U nas są dwa słońca. Gdzie śpi twoje?”. Pocztówka „Pi-pi-bąk”.
   - **Chmura w kształcie** (każda pora): w najdalszej kulisie przepływa chmura ułożona z płatów w kształt z opowieści (gniazdo, mama z rozłożonymi skrzydłami, babcia z drutami, rogal, złote jajko); w L1 cień, od L2 wyraźna; 3 s w kadrze = pocztówka. Tylko widok (S0).
   - **Autostop za kluczem gęsi** (dzień, od K4): wolne miejsce na końcu klucza; wlot = 6 s ciągłego prądu w szyku (liczony jako 1 prąd), łagodniejszy skręt, wysokość nie spada; odpadnięcie bez kary; środek klucza dalej S1. Pocztówka „W kluczu gęsi”.
4. **Narracja:** szepty Okruszka i kwestie postaci (imię + dwukropek, bez dymków) w strefie tekstu; jedna linijka naraz, ≤ 7 słów, znika po 2,5 s; najwyżej 1 na 35 s; nic w pierwszych 20 s biegu i w czasie zapowiedzi drapieżnika i burzy. Teksty w `teksty.js` w grupach `krainy, szepty, poziomy, koniec, wspomnienia, pocztowki`. Źródło zdań: `fabula\01-fabula.md` §2 (tabela tekstów) dopasowane do kanonicznych krain. Zasada słońca: nigdy „zostaje dłużej”, tylko „jest go więcej”. Przed wgraniem: Recenzent i Korektor.
5. **„Okruszek ziewa”:** po 20 min sesji (sesja zerowana po 30 min przerwy) Okruszek ziewa częściej i raz pokazuje: „Okruszek jest śpiący. Polecimy dalej jutro?” z przyciskami „Jeszcze chwilę” i „Dobranoc”; niczego nie blokuje.
6. **Jedno polecenie testów:** `node testy_v15.cjs` uruchamia preflight, testy Z2, Z3, Z3b, Z2b, Z10, Z11, Z12, Z13 i zapisuje raport w `raporty/`.
7. **Hak:** `__okruszek.rzadkie('bak' | 'ksztalt' | 'autostop')`, `.rdzen()` (log stref wlotu), `.sesja(minuty)` (przesunięcie zegara sesji w `?test`).

**Poza zakresem:** Pogoda dnia, wieloryb, Wiatrołap, pozostałe pocztówki (v2).

**Kryteria odbioru:**
- Testy 12.1 zielone mimo bonusów: bot trafiający same rdzenie nie osiąga L4 bez `GATE4` ani L5 bez `GATE5`; bot idealny nadal osiąga L4 w 60 s.
- `rdzen()`: skoki zgodne z mnożnikami 1,0 / 1,08 / 1,15 j.; zrzut 390 px z wyciszonym dźwiękiem pokazuje błysk idealnego wejścia.
- Symulacja 60 min lotu (`?test`, przyspieszony zegar): ≤ 1 rzadkie zdarzenie na 4 min, 0 w pościgu, burzy i oddechu; pierwsze w ≤ 3 biegach > 90 s; brak powtórzeń, dopóki talia się nie skończy.
- Bączek: przegląd panelu potwierdza brak wiązki i wciągania; proca liczona jako 1 prąd; zrzuty 390 px na L0, L2, L4.
- Szepty: odstęp ≥ 35 s, 0 w pierwszych 20 s, 0 w zapowiedziach (log); Recenzent i Korektor bez uwag.
- `sesja(20)` → ziewanie i pytanie; „Jeszcze chwilę” wraca do lotu bez kary.
- Właściciel odsłuchuje melodię łańcucha A/B (z melodią i bez); wdrażamy tylko po jego „tak”.
- `node testy_v15.cjs` zielone; ≥ 55 kl/s w 60 s lotu z Bączkiem na ekranie.

---

## Jak zlecać (szablon dla sesji Opus/Sonnet/Codex)
„Przeczytaj `Desktop\projekty\gra-okruszek\PROJEKT.md`, `ZLECENIA.md`, `ZLECENIA-Z10-Z13.md` i `fabula\00-wybor.md` (sekcje 1-3). Wykonaj zlecenie Zn w worktree `gra-okruszek-Zn` od najnowszego scalonego `index.html`.
Nie zmieniaj decyzji z sekcji 2 `PROJEKT.md` ani rozstrzygnięć C1-C30. Po zmianach uruchom `preflight.cjs`, testy z kryteriów i zrzuty 390 px (przy ekranach także 1440 px).
Raport: co zrobione, co nie, zmierzone liczby, jak sprawdzić (link podglądu i hak `?test`).”
