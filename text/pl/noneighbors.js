// text/pl/noneighbors.js
// Rules and history texts of noneighbors (pl). Loaded by noneighbors-rules.html and noneighbors-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    sudoku_rules_basics_title: "Podstawowa idea",
    sudoku_term_goal: "Cel",
    sudoku_term_input: "Wpisywanie liczb",
    sudoku_rules_end_title: "Kończenie łamigłówki",
    sudoku_term_win: "Rozwiązane",
    sudoku_term_difficulty: "Trudność",
    puzzle_rules_hint: "Przycisk „Podpowiedź” pomaga w trzech etapach. Pierwsze naciśnięcie zaznacza, gdzie jest następny krok. Drugie podaje powód, czyli zasadę, która tam działa. Trzecie wykonuje krok (wpisuje liczbę albo buduje most). Podpowiedź wychodzi od twojego obecnego stanu: jeśli gdzieś stoi błędna liczba albo błędny most, najpierw ci to powie. Nigdy nie zgaduje – jeśli dalej da się iść tylko przez próbowanie, mówi to uczciwie. Podpowiedzi są bez limitu. Łamigłówka rozwiązana z podpowiedziami liczy się normalnie jako wygrana; statystyki pokazują dodatkowo, ile wygranych było z podpowiedziami.",
    numberblocks_rules_title: "Zasady Bez sąsiadów",
    numberblocks_rules_intro: "Krótkie podsumowanie, jak PaperGames gra w Bez sąsiadów - przydatne do odświeżenia pamięci lub nauki.",
    numberblocks_term_board: "Diagram",
    numberblocks_rules_board: "Grube linie dzielą diagram na bloki od jednego do pięciu pól. Niektóre pola są wypełnione od początku (pogrubione) i nie można ich zmienić.",
    numberblocks_rules_goal: "Wypełnij każde puste pole tak, aby blok z n pól zawierał cyfry od 1 do n, każdą dokładnie raz - blok z trzech pól zawiera 1, 2 i 3. Każda łamigłówka tworzona przez PaperGames ma dokładnie jedno rozwiązanie.",
    numberblocks_term_regions: "Zasada styku",
    numberblocks_rules_regions: "Dwie równe cyfry nigdy nie mogą się stykać - ani obok siebie, ani jedna nad drugą, ani po skosie. Żadne z maksymalnie ośmiu pól wokół cyfry nie może zawierać tej samej cyfry, nawet jeśli należy do innego bloku.",
    numberblocks_rules_input: "Wybierz pole, a potem liczbę z klawiatury pod planszą (albo wpisz cyfrę z klawiatury fizycznej). Gdy cyfra powtarza się w swoim bloku, jest za duża dla swojego bloku albo styka się z tą samą cyfrą, wszystkie pola, których to dotyczy, pokazują cyfrę na biało na czarnym tle.",
    numberblocks_rules_difficulty: "Łatwe łamigłówki mają diagram 6x6, średnie 7x7, a trudne 8x8, z mniejszą liczbą podanych cyfr na każdym poziomie.",
    numberblocks_rules_win: "Łamigłówka jest rozwiązana, gdy każde pole jest wypełnione, a ani zasada bloków, ani zasada styku nie jest złamana.",
    numberblocks_history_title: "Historia Bez sąsiadów",
    numberblocks_history_origins_title: "Łamigłówka wynalazcy",
    numberblocks_history_origins_p1: "Bez sąsiadów wymyślił japoński twórca łamigłówek Naoki Inaba, który opublikował je w 2001 roku. Inaba stworzył bardzo wiele łamigłówek logicznych, często opartych na jednej jasnej zasadzie prowadzącej do zaskakująco głębokiego rozumowania.",
    numberblocks_history_origins_p2: "Łamigłówka łączy dwa znane pomysły: obszary, z których każdy musi zawierać określony zestaw cyfr, jak bloki w Sudoku, oraz zasadę sąsiedztwa zapożyczoną od szachowego króla - cyfra nie może się powtórzyć nigdzie, gdzie mógłby przejść król.",
    numberblocks_history_names_title: "Pod innymi nazwami",
    numberblocks_history_names_p1: "Łamigłówka jest znana na świecie także jako Suguru lub Tectonic; nazwy te oznaczają te same zasady obszarów i sąsiedztwa.",
    numberblocks_history_names_p2: "Każda łamigłówka powstaje na twoim urządzeniu: bloki i poprawne rozwiązanie są budowane razem pole po polu, a potem cyfry są usuwane jedna po drugiej, dopóki wbudowany solver wciąż znajduje dokładnie jedno rozwiązanie."
});
I18n.markTextLoaded("pl");
