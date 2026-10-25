# Z6: dźwięk Okruszka (moduł dzwiek.js)

Przeczytaj ../gra-okruszek/PROJEKT.md (sekcja 2 nienaruszalna; sekcja 8 "Dźwięk v1") i ZLECENIA.md (Z6).
Zrób SAMODZIELNY moduł `dzwiek.js` (IIFE, zero zależności, zero pobierania z sieci, tylko WebAudio i synteza własna),
który później wkleimy do index.html. API na window.OkruszekDzwiek:
  start()            - tworzy/wznawia AudioContext (wołane z pierwszego gestu użytkownika), idempotentne
  muzyka(bool)       - przełącznik pętli muzycznej (klawisz N); domyślnie włączona po start()
  dzwiek(bool)       - przełącznik efektów (klawisz M)
  predkosc(s)        - s 0..1: modulacja szumu wiatru (filtr + głośność) i barwy pętli; wołane co klatkę, tanie
  prad()             - "fiu": krótki unoszący się dźwięk przy wlocie w prąd powietrzny
  nurkowanie(bool)   - szum nurkowania (włącz/wyłącz z płynnym wejściem/wyjściem)
  cwir()             - ćwir ptaszka na starcie biegu (mały, uroczy, zmienny, nie ten sam za każdym razem)
  och()              - cichy "och" przy złapaniu przez jastrzębia
  ladowanie()        - miękki, ciepły dźwięk lądowania na chmurce
  pauza(bool)        - wycisza całość (też przy ukryciu karty: sam podłącz visibilitychange)
Pętla muzyczna: wiatr + 3-4 nuty (skala pentatoniczna, wolne, ciepłe, bez rytmu perkusyjnego), generowane proceduralnie, nie
powtarzające się mechanicznie; łagodne wejście. Nigdy gwałtowne piki głośności (limiter/kompresor na masterze, master ~0.5).
Telefon: jeden AudioContext, mało węzłów, brak ScriptProcessor; po powrocie na kartę wznów kontekst.
Zakazy (lekcja właściciela z Kociłapek): żadnej wymiany "całej muzyki naraz" w przyszłości - zbuduj tak, by każdy element
(wiatr, pętla nut, każdy efekt) był osobną funkcją z własnym parametrem głośności w obiekcie `GLOS` na górze pliku,
żeby właściciel mógł zmieniać po jednym. Dźwięk ptaszka ma być uroczy, nie "przerażający".
Dostarcz: dzwiek.js, dzwiek-test.html (przyciski do każdego dźwięku + suwak s + przełączniki N/M), ZRODLA.md (napisz: synteza własna,
bez cudzych próbek), test dzwiek_test.cjs (Playwright, chromium z C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe,
playwright z C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright, uruchamiany z flagą
--autoplay-policy=no-user-gesture-required): ładuje dzwiek-test.html, woła każde API, sprawdza brak błędów konsoli, że AudioContext.state==='running',
że master nie przekracza limitu (AnalyserNode: szczyt < 0.98) i że `predkosc(0)` vs `predkosc(1)` zmienia energię sygnału (RMS rośnie).
Test musi kończyć się linią "DZWIEK OK". Zacommituj w tym worktree (komunikat po polsku). Nie pushuj. Nie dotykaj index.html ani innych folderów.
Na końcu raport (po polsku, krótki): co zrobione, jak sprawdzić, czego nie da się zweryfikować bez ucha (uczciwie).
