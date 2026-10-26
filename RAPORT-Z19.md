# Raport Z19 — 26.10.2026

Zaimplementowano P1-N1–N7: czytelną oś wiatru z magnesem i ochroną trafienia przed machnięciem; zmienne namierzanie drapieżnika, zwód, parę uderzeń i dwa cele od K4; reakcję przy dotknięciu; dźwięki i zapamiętywane wibracje; kontrast HUD/cienia; wskazówkę pierwszego lotu. Drapieżnik zawsze zostawia sąsiednie wyjście i zapowiada każdy atak przez ≥1,5 s. Presja narasta także po ósmej minucie.

P2-N1/2/3/4/6/10: rzadsze komunikaty, wolniejsze gaśnięcie koloru w rytmie, wstęga również bez przerzutu, trzepot w nadchmurzu, łagodniejsza kara przy dnie, poprawiona perspektywa i widoczność dolnej przeszkody. Nie zmieniono manifestu, service workera, instalacji ani wyglądu startu; panel rozszerzono wyłącznie o wibracje.

Dziesięć poprawek czucia lotu: (1) oś/magnes, (2) natychmiastowe skrzydła, (3) syntezowane efekty, (4) krótkie wibracje, (5) przechył/FOV/przysiad kamery, (6) realna presja, (7) dłuższy ciężki zamach z piórami, (8) przestrzelenie boczne 6% i impuls wzlotu, (9) mikro-nagrody x2/x3 i rzadsze awanse, (10) trzepot oraz dźwięk Schodów światła. Melodia łańcucha przesuwa następną nutę muzyki. Reduced-motion wyłącza dodatkowe ruchy kamery; burze mają wspólną fazę błysków.

## Pomiary

- Dotyk CDP, 12 prób/tryb: mediany do pierwszej klatki **2,0 / 2,4 / 2,4 ms**, maksimum 26,7 ms. Punkt odniesienia QA2: 100–200 ms.
- 11 rodzajów zdarzeń: obraz oraz liczniki wywołań dźwięku i vibrate; wszystkie pokryte. Synteza 11 efektów bez błędów.
- Porównanie przed/po, identyczne ziarna, 24 biegi/profil: mediany idealnego **>1200 → 960,8 s**, 70% **319,4 → 325,7 s**, zawsze uważnego **>1200 → 358,2 s**. Limit pomiaru 1200 s; po zmianie 8/24 idealnych nadal dociera do limitu.
- Pełny kolor ≤60 s: idealny **23/24 → 23/24**, 50% **1/24 → 1/24 (4,2%)**, losowy **0/24 → 0/24**. Nie jest to gwarancja koloru w każdym idealnym biegu.
- Kontrast w macierzy czterech pór × L0/L5: HUD minimum **6,89:1**, cień **2,67:1**. Siedem obejrzanych zrzutów 390×844 w `zrzuty-z19/`.

## Weryfikacja

PRECHECK_STATUS

Testy zmieniono bez obniżania progów: Z18 używa rzeczywistego czasu namierzenia i wolnej komórki; bot widzi oba oznaczone cele; scenariusz dotyku jawnie wznawia grę. Z17 mierzy bezwzględny kontrast cienia, ponieważ nocą znacznik jest jasny. Dodano Z19 do preflightu oraz skrypty porównania i dotyku w `qa/`.

Pozostają P2 dotyczące gęstości wiatrów, bocznych pasów, długich luk i poziomego układu. Telefon, iOS i odsłuch niezmierzone; brak API sprawdzono stubem. Własna ostrożna ocena: **8/10** — szybsza odpowiedź i wyraźne nagrody, bez podstaw do deklarowania 9/10 przed próbą właściciela.

Sprawdzenie: otworzyć `index.html?tor=1`, spróbować trzech trybów i wibracji w pauzie. Automatycznie: `node gra_test_z19.cjs`, `node preflight.cjs`. Bez commita i wdrożenia.
