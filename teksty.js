/* Okruszek: teksty do łatwej podmiany (PROJEKT.md sekcja 9). Z10: nazwy krain i szepty Drogi. Z5: intro, koniec biegu, dźwięk.
   Grupy (ZLECENIA-Z10-Z13): krainy, szepty, intro, koniec, dzwiek; kolejne grupy dopisują Z12, Z13 (poziomy, wspomnienia, pocztowki).
   Zasada słońca: nigdy „zostaje dłużej”, tylko „jest go więcej”. Przed wgraniem nowych zdań: Recenzent i Korektor. */
window.OKRUSZEK_TEKSTY = {
  krainy: {
    1: { nazwa: 'Nad Wielką Górą' },
    2: { nazwa: 'Morze Pierzyn' },
    3: { nazwa: 'Kamienny Las' },
    4: { nazwa: 'Wietrzne Schody' },
    5: { nazwa: 'Szlak Żelaznych Gęsi' },
    6: { nazwa: 'Dalekie Niebo', tablica: 'Dalej niebo jeszcze się maluje.' }
  },
  szepty: {
    fiuk: 'Fiuk zna już drogę.'
  },
  /* Z5: intro „Gdzie śpi słońce” (fabula/01-fabula.md, tabela tekstów): trzy krótkie zdania, pokazywane po jednym, na ciszy i samym konturze */
  intro: {
    zdania: [
      'Okruszek chciał zobaczyć, gdzie śpi słońce.',
      'Leciał za nim wyżej i wyżej.',
      'Aż chmury zamknęły się pod nim jak kołderka.'
    ],
    pomin: 'Dotknij, żeby pominąć'
  },
  /* Z5: ekran końca biegu. ladowanie: etykieta nad metrami + dwa zdania pod nimi (razem: „Okruszek zasnął na chmurce. Przeleciał N m. Słońce obiecało wrócić rano.”).
     Teksty jastrzębia i sowy bez zmian względem Z3 / Z3b. */
  koniec: {
    ladowanie: { et: 'Przeleciał', lin: 'Okruszek zasnął na chmurce.\nSłońce obiecało wrócić rano.', calosc: 'Okruszek zasnął na chmurce. Przeleciał {m} m. Słońce obiecało wrócić rano.' },
    jastrzab: { et: 'Koniec lotu', lin: 'Jastrząb był szybszy.\nOkruszek wraca jutro.' },
    sowa: { et: 'Koniec lotu', lin: 'Sowa była szybsza.\nOkruszek wraca jutro.' }
  },
  dzwiek: {
    efekty: 'Efekty', muzyka: 'Muzyka', wl: 'włączone', wyl: 'wyłączone'
  }
};
