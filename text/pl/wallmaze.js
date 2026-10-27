// text/pl/wallmaze.js
// Rules and history texts of wallmaze (pl). Loaded by wallmaze-rules.html and wallmaze-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    wallmaze_rules_title: "Zasady Labiryntu Murów",
    wallmaze_rules_intro: "Krótkie podsumowanie zasad Labiryntu Murów w PaperGames - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    wallmaze_rules_basics_title: "Podstawowa idea",
    wallmaze_term_setup: "Ustawienie startowe",
    wallmaze_rules_setup: "Każdy gracz ma jeden pionek, startujący na środku swojej krawędzi planszy 9x9, oraz dziesięć ścian w zapasie. Gracz 1 dąży do najdalszego rzędu na dole, Gracz 2 do najdalszego rzędu na górze - wygrywa ten, kto pierwszy doprowadzi tam swój pionek.",
    wallmaze_term_moving: "Poruszanie pionkiem",
    wallmaze_rules_moving: "W swojej turze albo przesuń pionek o jedno pole w górę, w dół, w lewo lub w prawo, albo postaw ścianę. Jeśli oba pionki stoją obok siebie, możesz przeskoczyć prosto nad drugim pionkiem; jeśli ten skok blokuje ściana albo krawędź planszy, możesz zamiast tego obejść go po przekątnej.",
    wallmaze_term_walls: "Stawianie ścian",
    wallmaze_rules_walls: "Ściana ma długość dwóch pól i blokuje ruch w poprzek siebie dla obu graczy. Ściany nigdy nie mogą się nakładać ani krzyżować z inną ścianą, a ściany nie można postawić, jeśli odcięłaby ostatnią pozostałą drogę któregokolwiek gracza do jego rzędu docelowego - zawsze musi pozostać co najmniej jedna droga przejścia.",
    wallmaze_rules_end_title: "Wygrywanie partii",
    wallmaze_term_win: "Jak kończy się partia",
    wallmaze_rules_win: "W chwili, gdy pionek gracza dotrze do dowolnego pola w jego rzędzie docelowym, gracz wygrywa - nie ma znaczenia, która to kolumna.",
    wallmaze_history_title: "Historia Labiryntu Murów",
    wallmaze_history_origins_title: "Gry ze ścianami i ścieżkami",
    wallmaze_history_origins_p1: "Gry wyścigowe, w których gracze zmieniają planszę w trakcie rozgrywki, to stary pomysł w abstrakcyjnych grach strategicznych: zamiast tylko iść naprzód, można poświęcić ruch na postawienie przeszkody na drodze przeciwnika.",
    wallmaze_history_origins_p2: "Należy do szerszej rodziny gier typu \"blokujący labirynt\", w których sama plansza zmienia kształt w trakcie rozgrywki, zamiast pozostawać stała jak szachownica - każda postawiona przez gracza ściana trwale przekształca drogi, jakimi oba pionki mogą się poruszać do końca partii.",
    wallmaze_history_design_title: "Proste zasady, prawdziwa głębia",
    wallmaze_history_design_p1: "Cały zestaw zasad mieści się na jednej karcie - przesuń pionek albo postaw ścianę, dotrzyj na drugi koniec, by wygrać - a mimo to napięcie między pędzeniem naprzód a poświęceniem tury na zablokowanie przeciwnika daje grze prawdziwą głębię strategiczną.",
    wallmaze_history_design_p2: "Takie gry są też dobrym ćwiczeniem dla programów komputerowych: pozycji jest bardzo wiele, ale każdą łatwo opisać (dwa pionki, ściany na planszy i zasada, że jakaś ścieżka musi zostać otwarta). Komputerowy przeciwnik w PaperGames ocenia pozycję głównie na podstawie tego, ile kroków każdy pionek potrzebuje jeszcze do celu.",
    wallmaze_history_names_title: "Dlaczego inna nazwa",
    wallmaze_history_names_p1: "Ta sama zasada gry jest też sprzedawana pod nazwą Quoridor, zarejestrowanym znakiem towarowym firmy Gigamic. PaperGames nie ma żadnego związku z Gigamic ani z tą grą i dlatego używa własnej nazwy Labirynt Murów.",
    wallmaze_history_version_title: "Ta wersja",
    wallmaze_history_version_p1: "PaperGames gra na planszy 9x9, z dziesięcioma ścianami na gracza. Stawianie ściany to swój własny, niewielki tryb: dotknij \"Postaw ścianę\", dotknij dowolnego miejsca na planszy, by zobaczyć podgląd najbliższej legalnej ściany w tym miejscu, i potwierdź - celowo wybaczający cel na ekranie dotykowym, zamiast konieczności trafienia w dokładny punkt."
});
I18n.markTextLoaded("pl");
