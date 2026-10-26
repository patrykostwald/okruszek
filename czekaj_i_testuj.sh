#!/bin/bash
# Czeka, aż obciążenie CPU spadnie poniżej 45% (3 próbki z rzędu, co 30 s, maks. 25 min), potem uruchamia podane testy w worktree.
# Użycie: bash czekaj_i_testuj.sh <katalog-worktree> <test1> [test2 ...]
dir="$1"; shift
spokoj=0
for i in $(seq 1 50); do
  load=$(wmic cpu get loadpercentage 2>/dev/null | tr -d '\r' | sed -n 2p | tr -d ' ')
  load=${load:-100}
  echo "próba $i: obciążenie CPU ${load}%"
  if [ "$load" -lt 45 ]; then spokoj=$((spokoj+1)); else spokoj=0; fi
  if [ "$spokoj" -ge 3 ]; then echo "maszyna spokojna, startuję testy"; break; fi
  sleep 30
done
if [ "$spokoj" -lt 3 ]; then echo "UWAGA: maszyna nie uspokoiła się w 25 min; wyniki orientacyjne"; fi
cd "$dir" || exit 2
for t in "$@"; do
  echo "=== $t"
  node "$t.cjs" 2>&1 | grep -E "FAIL|^TEST Z[0-9a-z]+ (OK|NIE)|klatki|bot idealny: pierwsze|bot idealny: L4" | cut -c1-260 | tail -8
done
echo "KONIEC"
