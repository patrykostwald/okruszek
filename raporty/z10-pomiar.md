# Z10: pomiar prędkości typowej (bot „70%” w K1)

Pomiar: 2026-10-25 12:28, `node pomiar_z10.cjs --zapisz` (Chromium headless, krok symulacji 1/60 s bez rysowania, hak `?test`).
Bot „70%” (`boty_z10.cjs`): łapie 70% prądów, omija 70% przeszkód, nurkuje losowo ok. 30% czasu (nie poniżej 25% wysokości), reaguje co 0,15 s.
Kraina: K1 przez cały bieg (hak `pomiar(true)`: bez bramy), przeszkody i napięcie N(t) K1, SINK K1 = 0,032, bez drapieżników (K1). Ziarna 1-10.
Prędkość biegu = dystans / czas biegu (z 20 s spokojnego startu). Dystans w grze rośnie o 10 + 22·s m/s [kod].

| Ziarno | Czas biegu (s) | Dystans (m) | Prędkość (m/s) | Koniec | Wloty | Maks. poziom |
|---|---|---|---|---|---|---|
| 1 | 1200,0 | 22178 | 18,5 | limit pomiaru 1200 s (leci dalej) | 404 | L5 |
| 2 | 188,7 | 3087 | 16,4 | ladowanie | 51 | L4 |
| 3 | 1012,9 | 17980 | 17,8 | ladowanie | 320 | L5 |
| 4 | 1200,0 | 22025 | 18,4 | limit pomiaru 1200 s (leci dalej) | 406 | L5 |
| 5 | 1200,0 | 21649 | 18,0 | limit pomiaru 1200 s (leci dalej) | 387 | L5 |
| 6 | 1200,0 | 22015 | 18,3 | limit pomiaru 1200 s (leci dalej) | 393 | L5 |
| 7 | 540,7 | 9901 | 18,3 | ladowanie | 172 | L5 |
| 8 | 847,2 | 15484 | 18,3 | ladowanie | 284 | L5 |
| 9 | 1200,0 | 21887 | 18,2 | limit pomiaru 1200 s (leci dalej) | 400 | L5 |
| 10 | 1200,0 | 21951 | 18,3 | limit pomiaru 1200 s (leci dalej) | 402 | L5 |

Limit pomiaru: 1200 s na bieg; 6 z 10 biegów doleciało do limitu (ich długość to dolne oszacowanie). Mediana długości liczona z 5. i 6. wartości po posortowaniu.

**Mediana prędkości: 18,28 m/s** (w `KRAINY`: `V_TYP = 18.3`). **Mediana długości biegu: co najmniej 1200,0 s, 21768 m.**

## Metry krain (czas typowy x 18,3 m/s, zaokrąglone do 100 m)

| Kraina | Czas typowy | Długość | Od-do na Drodze |
|---|---|---|---|
| K1 Nad Wielką Górą | 90 s | 1600 m | 0-1600 m |
| K2 Morze Pierzyn | 120 s | 2200 m | 1600-3800 m |
| K3 Kamienny Las | 135 s | 2500 m | 3800-6300 m |
| K4 Wietrzne Schody | 150 s | 2700 m | 6300-9000 m |
| K5 Szlak Żelaznych Gęsi | 165 s | 3000 m | 9000-12000 m |
| Dalekie Niebo | bez końca | bez końca | od 12000 m |

Bot idealny w tych samych warunkach (informacyjnie, 3 ziarna): 1200,0 s, 21,6 m/s, koniec: ; 1200,0 s, 21,7 m/s, koniec: ; 1200,0 s, 21,6 m/s, koniec: .
