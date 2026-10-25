/* Okruszek: teksty do łatwej podmiany (PROJEKT.md sekcja 9). Z10: nazwy krain i szepty Drogi. Z5: intro, koniec biegu, dźwięk.
   Z11: tablice krain K2-K5, szepty (świt, Rogal, Gęgawa), zwiastuny, debiuty nowych przeszkadzajek i prądów, finały krain (źródło zdań: fabula/01-fabula.md §2).
   Grupy (ZLECENIA-Z10-Z13): krainy, szepty, intro, koniec, dzwiek; kolejne grupy dopisują Z12, Z13 (poziomy, wspomnienia, pocztowki).
   Zasada słońca: nigdy „zostaje dłużej”, tylko „jest go więcej”. Przed wgraniem nowych zdań: Recenzent i Korektor. */
window.OKRUSZEK_TEKSTY = {
  krainy: {
    1: { nazwa: 'Nad Wielką Górą' },
    2: { nazwa: 'Morze Pierzyn', tablica: 'Noc przyszła po cichu.' },
    3: { nazwa: 'Kamienny Las', tablica: 'Drzewa bez liści?' },
    4: { nazwa: 'Wietrzne Schody', tablica: 'Trzymaj się!' },
    5: { nazwa: 'Szlak Żelaznych Gęsi', tablica: 'Głośno tu!' },
    6: { nazwa: 'Dalekie Niebo', tablica: 'Dalej niebo jeszcze się maluje.' }
  },
  szepty: {
    fiuk: 'Fiuk zna już drogę.',
    swit: 'Słońce wstało z tyłu. Jak to?',
    rogal: 'Rogal: Słońce? Poszło tam.',
    gegawa: 'Ciocia Gęgawa: Gę! W lewo!'
  },
  /* Z11: jedno zdanie 300 m przed bramą, razem ze zwiastunem następnej krainy */
  zwiastuny: {
    2: 'Coś bladego świeci w dali.',
    3: 'Z chmur coś wystaje.',
    4: 'Ktoś puszcza latawce?',
    5: 'Słyszysz to buczenie?',
    6: 'Pomruk burczy w oddali.'
  },
  /* Z11: pierwsze spotkanie w zapisie (zapowiedź o 1 s dłuższa i to jedno zdanie) */
  debiuty: {
    szpile: 'Kamienne drzewa! Leć szczeliną.',
    komin: 'Ciepły dach. Fiu, do góry!',
    latawce: 'Uwaga na sznurki latawców!',
    przelot: 'Żelazna gęś! Środkiem smugi.',
    tecza: 'Pod łukiem czeka prąd.',
    poryw: 'Latawce szarpnęły? Tam wieje!'
  },
  /* Z11: finały krain (krótkie widowisko bez presji tuż przed bramą) */
  finaly: {
    1: 'Trzy w rytmie: fiu, fiu, fiu!',
    2: 'Ulewa! Za nią łuk.',
    3: 'Kanion wież. Ciepło od dachów.',
    4: 'Festiwal latawców!',
    5: 'Przelot olbrzyma.'
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
