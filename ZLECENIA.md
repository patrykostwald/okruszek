# Okruszek: zlecenia wykonania (kolejność, silnik, kryteria odbioru)

Zasady: każde zlecenie w osobnym worktree albo osobnej sesji; jeden plik `index.html` jako źródło; po każdym zleceniu `node preflight.cjs` i zrzuty 390 px;
właściciel testuje na telefonie i zgłasza uwagi, wdrażać każdą od razu. Czytać najpierw `PROJEKT.md` i `Desktop\projekty\raporty\PRZEKAZANIE-25-10-KOCILAPKI.md`.
Silniki: Sonnet 5.5 (effort high) buduje według specyfikacji; Codex CLI (`codex exec --skip-git-repo-check`, model gpt-6-astra) jako drugi silnik i testy;
Opus 5.5 (high) tam, gdzie liczy się oko (ptaszek, audyt); Fable tylko na końcu, jedno zadanie naraz.

| Nr | Zlecenie | Silnik | Zależy od | Kryterium odbioru |
|----|----------|--------|-----------|-------------------|
| Z1 | Silnik widoku: kulisy 9 warstw, projekcja, pula 14 chmur pre-renderowanych (kontur / kolor / zamglona), niebo, słońce, gwiazdy, morze chmur, krzywa koloru e=s^2,2 z progami warstw; hak `?test` | Sonnet high (Codex: pre-render chmur) | próbka `probki/probka-kulisy.js` | ≥55 klatek przez 60 s na średnim Androidzie (log fps w `__okruszek`), zrzuty przy prędkości 0 / 0,5 / 1 zgodne z próbką, bez błędów konsoli |
| Z2 | Sterowanie i fizyka lotu: skręt palcem, przytrzymaj = nurkowanie, puść = machanie, wysokość jako zasób, prądy powietrzne (+prędkość, +wysokość), morze chmur = miękkie lądowanie i wynik w metrach; mysz i klawiatura | Sonnet high | Z1 | bot Playwright przelatuje 60 s bez lądowania przy trafianiu w prądy; lądowanie po 20 s bez prądów; „duch palca” nie występuje (test 2 palców) |
| Z3 | Przeszkody i zdarzenia: większy ptak, chmura deszczowa, jastrząb (zapowiedź, pościg 10 s, ucieczka prędkością albo chmurą, złapanie = koniec biegu), harmonogram zdarzeń, biom nocny po ~1 km | Sonnet high | Z2 | każde zdarzenie wymuszalne przez `__okruszek.zdarzenie('jastrzab')`; kolizje w 2,5D sprawdzone botem; brak zdarzeń w pierwszych 20 s |
| Z4 | Ptaszek: finalny rysunek (pseudo-3D, PROJEKT.md 12.6), piękniejsze chmury, głębia (paralaksa, mgiełka, god rays, głębia ostrości, opcjonalny bloom WebGL2 z trybem awaryjnym), akwarela i baśniowa paleta (min. 14 odcieni) i animacje (lot, nurkowanie, wirowanie, otrzepanie, drzemka), szalik; 3 rundy: szkic → panel laików x3 + Projektant → poprawki | Opus high + panel designu | Z1 | panel ocenia „przeuroczy, martwię się o niego” ≥ 4/5 u 3 laików; jeden wyróżnik na ekran (szalik); bez równych okręgów jako motywu UI |
| Z5 | Intro (cisza, kontur, 3 zdania, wlot), koniec biegu (sen na chmurce, metry), ekran startu, pauza P/Esc, teksty w `teksty.js`, PWA (manifest, sw.js, ikony), regulamin i prywatność iapply, liczniki Worker+D1, panel statystyk | Sonnet medium | Z2 | klocki skopiowane z Kociłapek i działające; sw z samoaktualizacją; `preflight.cjs` zielony; teksty po polsku, krótkie, bez zwrotów „redakcja” |
| Z6 | Dźwięk v1: pętla (wiatr, 3-4 nuty), „fiu”, szum nurkowania, ćwir, „och”; CC0 ze źródłami w `dzwieki/ZRODLA.md`; przełączniki M (dźwięk) i N (muzyka) | Sonnet medium | Z2 | właściciel odsłuchuje A/B jednego elementu naraz; nigdy wymiana całości |
| Z7 | Testy: bot-gracz Playwright (`gra_test.cjs`), pre-flight, pomiar fps na 3 rozdzielczościach, test dotyku 2 palców, test offline PWA | Codex | Z3, Z5 | wszystkie testy zielone w jednym poleceniu; raport fps w `raporty/` |
| Z8 | Audyt: panel recenzentów (UX, laik x3, dostępność, Strażnik, Prawnik, Analityk), Seba, drążyciel → lista P0/P1/P2 i poprawki | Opus high | Z7 | lista P0 pusta po poprawkach; zrzuty 1440 i 390; `odstepy.js` bez ZLE na ekranach z boksami (start, koniec, panel) |
| Z9 | Werdykt końcowy, wdrożenie podglądu zbudujmi.com/podglad/okruszek-<id>/ (noindex), pełna komenda dla właściciela | Fable (jedno zadanie) | Z8 | właściciel gra 5 minut i chce lecieć dalej (pytanie Seby); Prawnik bez uwag |

| Z3b | Poziomy prędkości L0-L5 i trudność (PROJEKT.md 12.1), etapy koloru (12.2), doba w tle z tempem zależnym od prędkości (12.3), nowe przeszkadzajki (12.4: stado, wiatr boczny, grad, burza, sznur latawca, mgła, sowa nocą), wskaźnik poziomu | Sonnet high | Z3 | testy z 12.1 (bot idealny L4 w 60 s, losowy nigdy L4, L5 tylko z łańcuchem >=5); doba przechodzi płynnie, tempo zmienia się z poziomem; każda nowa przeszkoda wymuszalna hakiem; kolejność koloru zachowana na każdym poziomie i o każdej porze doby; zrzuty L0-L5 i 4 pory doby |
| Z2b | Drugi tryb sterowania: dwa kciuki jak skrzydła (PROJEKT.md sekcja 5a); przełącznik ?sterowanie=2 i klawisz T; skrzydła ptaszka animowane zgodnie z kciukami | Sonnet high | Z3 | testy dwóch palców: lewy = skręt w lewo, prawy = w prawo, oba = nurkowanie, puszczenie jednego nie zostawia ducha; bot lata w trybie 2 przez 60 s; tryb jednego kciuka bez zmian (testy Z2 zielone); zrzuty z oboma skrzydłami |

Kolejność w praktyce (pliki zależne, jedno zlecenie do index.html naraz): Z2 → Z3 → Z3b → Z2b → Z4 (Opus: piękniejsze chmury i ptaszek, PROJEKT.md 12.5) → Z5 (z wklejeniem Z6) → Z7 → Z8 → Z9. Z4 może ruszyć od razu po Z1 w osobnej sesji.
Reguła zakresu (Seba): dodajesz jedno, wyrzucasz jedno; żadnych dodatków z listy v2 przed Z9.

## Jak zlecać (szablon dla sesji Sonnet/Codex)
„Przeczytaj Desktop\projekty\gra-okruszek\PROJEKT.md i ZLECENIA.md. Wykonaj zlecenie Zn w worktree gra-okruszek-Zn. Źródło: index.html.
Po zmianach uruchom preflight.cjs i zrób zrzuty 390 px przy prędkości 0, 0,5, 1. Nie zmieniaj decyzji z sekcji 2 PROJEKT.md. Raport: co zrobione, co nie, jak sprawdzić.”
