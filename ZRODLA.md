# Dźwięk Okruszka — Z6

Synteza własna, bez cudzych próbek. Wszystkie dźwięki powstają lokalnie
przez Web Audio API: oscylatory sinusoidalne i trójkątne, wygenerowany szum,
filtry i obwiednie. Brak pobierania z sieci, bibliotek i nagrań zewnętrznych.
Nie wykorzystano materiałów CC0 ani innych cudzych utworów.

## Odsłuch i regulacja

Otwórz `dzwiek-test.html`, wybierz „Uruchom dźwięk”. N przełącza muzykę
z wiatrem, M efekty. Suwak steruje prędkością. Każdy efekt ma osobny przycisk;
nurkowanie i pauza mają przełączniki. Muzyka i efekty domyślnie są włączone.
Przed `start()` przełączniki zapamiętują wybór, efekty jednorazowe są pomijane.
`start()` zwraca Promise z wynikiem logicznym i można je ponawiać po geście.
Moduł sam obsługuje widoczność; klawisze obsługuje strona testowa, a docelowo gra.

Na początku `dzwiek.js` obiekt `GLOS` zawiera osobne poziomy: `wiatr`, `nuty`,
`prad`, `nurkowanie`, `cwir`, `och`, `ladowanie`, oraz `master` (0,5).
Zmieniaj pojedynczą wartość i odsłuchuj A/B tego elementu, następnie uruchom
test limitu. Kompresor i limit 12 głosów chronią sumę przy częstych efektach.
Pętla układa nowe frazy z 3–4 nut pentatonicznych, zmienia ich odstępy i długości.
`predkosc()` aktualizuje tylko istniejące parametry, pomijając pomijalne zmiany.

## Sprawdzenie

`node dzwiek_test.cjs` — Chromium i Playwright ze ścieżek wskazanych w zleceniu.
Test mierzy wyjście przez AnalyserNode, sprawdza start, wszystkie metody,
wyciszanie, powrót po ukryciu, RMS i szczyty przy nakładaniu efektów.
Uruchom także `node preflight.cjs` dla istniejącej gry.

Ocena uroku ćwirkania, ciepła brzmienia, płynności odsłuchowej i komfortu
głośności wymaga odsłuchu przez człowieka. Test headless nie zastępuje
sprawdzenia na głośniku i słuchawkach prawdziwego telefonu.
Moduł nie jest jeszcze podłączony do `index.html` — zgodnie z zakresem Z6.
