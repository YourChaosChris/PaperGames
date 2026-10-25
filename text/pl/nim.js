// text/pl/nim.js
// Rules and history texts of nim (pl). Loaded by nim-rules.html and nim-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    nim_rules_title: "Zasady gry Nim",
    nim_rules_intro: "Dwóch graczy na zmianę zabiera kamienie z kilku stosów. Przy zwykłej zasadzie wygrywa ten, kto weźmie ostatni kamień.",
    nim_rules_basics_title: "Zasady",
    nim_term_move: "Ruch",
    nim_rules_move: "Wybierz jeden rząd i weź z niego tyle kamieni, ile chcesz, co najmniej jeden. Dotknij kamienia, do którego chcesz brać: on i wszystkie kamienie na prawo od niego dostają krzyżyk. Potem dotknij „Weź kamienie”.",
    nim_term_end: "Koniec",
    nim_rules_end: "Normalnie: kto weźmie ostatni kamień, wygrywa. Misère: kto weźmie ostatni kamień, przegrywa.",
    nim_term_heaps: "Stosy",
    nim_rules_heaps: "3, 4 i 5 kamieni (domyślnie), klasyczne 1, 3, 5 i 7 albo losowe stosy (3 lub 4 stosy po 1 do 7 kamieni).",
    nim_term_secret: "Zasada wygrywania",
    nim_rules_secret: "Zapisz wielkość każdego stosu dwójkowo i dodaj kolumny bez przenoszenia (xor): wynik to suma nim. Jeśli wynosi 0, gracz, który ma ruch, przegrywa przy najlepszej grze przeciwnika; w przeciwnym razie zawsze istnieje ruch, który daje 0. W wersji misère gra się tak samo, aż zostałyby same stosy z jednym kamieniem – wtedy zostawia się ich nieparzystą liczbę.",
    nim_term_computer: "Komputer",
    nim_rules_computer: "Łatwy gra dowolny ruch, Średni w połowie przypadków najlepszy, Trudny zawsze najlepszy. Z pozycji wygranej Trudny jest nie do pokonania, dlatego wiersz pod stosami mówi, czy start jest wygrany, czy przegrany dla zaczynającego – wybierz, kto zaczyna, mając to na uwadze.",
    nim_history_title: "Historia gry Nim",
    nim_history_origins_title: "Zabieranie kamieni",
    nim_history_origins_p1: "Gry, w których zabiera się przedmioty ze stosów, znane są od starożytności; pochodzenie Nim jest niepewne. Często łączy się ją z chińską grą jiǎn shízǐ („zbieranie kamieni”), a najwcześniejsze wzmianki europejskie pochodzą z początku XVI wieku.",
    nim_history_bouton_title: "Bouton, 1901",
    nim_history_bouton_p1: "W 1901 roku Charles L. Bouton z Uniwersytetu Harvarda opublikował pełną teorię gry i nadał jej nazwę Nim. Nigdy nie wyjaśnił tej nazwy; często wywodzi się ją od niemieckiego słowa „nimm” („weź!”).",
    nim_history_machines_title: "Maszyny do Nim",
    nim_history_machines_p1: "Nim był jedną z pierwszych gier, w które grały maszyny: Nimatron na Wystawie Światowej w Nowym Jorku w 1940 roku i komputer firmy Ferranti pokazany na Festival of Britain w 1951 roku."
});
I18n.markTextLoaded("pl");
