// text/pl/killersudoku.js
// Rules and history texts of killersudoku (pl). Loaded by killersudoku-rules.html and killersudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    sudoku_rules_basics_title: "Podstawowa idea",
    sudoku_term_goal: "Cel",
    sudoku_term_input: "Wpisywanie liczb",
    sudoku_rules_end_title: "Kończenie łamigłówki",
    sudoku_term_win: "Rozwiązane",
    sudoku_term_difficulty: "Trudność",
    puzzle_rules_hint: "Przycisk „Podpowiedź” pomaga w trzech etapach. Pierwsze naciśnięcie zaznacza, gdzie jest następny krok. Drugie podaje powód, czyli zasadę, która tam działa. Trzecie wykonuje krok (wpisuje liczbę albo buduje most). Podpowiedź wychodzi od twojego obecnego stanu: jeśli gdzieś stoi błędna liczba albo błędny most, najpierw ci to powie. Nigdy nie zgaduje – jeśli dalej da się iść tylko przez próbowanie, mówi to uczciwie. Podpowiedzi są bez limitu. Łamigłówka rozwiązana z podpowiedziami liczy się normalnie jako wygrana; statystyki pokazują dodatkowo, ile wygranych było z podpowiedziami.",
    killersudoku_rules_title: "Zasady Killer Sudoku",
    killersudoku_rules_intro: "Krótkie podsumowanie, jak PaperGames gra w Killer Sudoku - przydatne do odświeżenia pamięci lub nauki.",
    killersudoku_term_board: "Diagram",
    killersudoku_rules_board: "Jak w Sudoku, grube linie dzielą diagram 9x9 na dziewięć bloków 3x3. Linie przerywane dzielą go dodatkowo na klatki od jednego do pięciu pól. Na początku wypełnionych jest niewiele pól albo żadne.",
    killersudoku_rules_goal: "Wpisz w każde pole cyfrę od 1 do 9 tak, aby każdy wiersz, każda kolumna i każdy blok 3x3 zawierały każdą cyfrę dokładnie raz. Każda łamigłówka tworzona przez PaperGames ma dokładnie jedno rozwiązanie.",
    killersudoku_term_regions: "Klatki",
    killersudoku_rules_regions: "Mała liczba w lewym górnym polu klatki to jej suma: cyfry w klatce muszą razem ją dawać. W przeciwieństwie do Calcudoku żadna cyfra nie może się powtórzyć w klatce.",
    killersudoku_rules_input: "Wybierz pole, a potem liczbę z klawiatury pod planszą (albo wpisz cyfrę z klawiatury fizycznej). Cyfra pokazana na biało na czarnym tle powtarza się w swoim wierszu, kolumnie, bloku lub klatce albo zamyka klatkę z niewłaściwą sumą.",
    killersudoku_rules_difficulty: "Łatwe łamigłówki mają głównie małe klatki i kilka dodatkowych podanych cyfr; trudne mają większe klatki i tylko cyfry potrzebne do jednego rozwiązania, często prawie żadnych.",
    killersudoku_rules_win: "Łamigłówka jest rozwiązana, gdy każde pole jest wypełnione i żaden wiersz, kolumna, blok ani klatka nie łamie zasad.",
    killersudoku_history_title: "Historia Killer Sudoku",
    killersudoku_history_origins_title: "Sumy na diagramie Sudoku",
    killersudoku_history_origins_p1: "Łamigłówki łączące zasady Sudoku z sumami klatek ukazywały się w Japonii już w latach 90., gdzie popularne były łamigłówki z sumami, takie jak Kakuro. Pomysł rozpowszechnił się w 2005 roku, kiedy brytyjskie gazety zaczęły je drukować pod nazwą Killer Sudoku w czasie światowej mody na Sudoku.",
    killersudoku_history_origins_p2: "Nazwa jest opisowa, a nie handlowa: „killer” obiecywał po prostu trudniejsze wyzwanie niż zwykłe Sudoku, bo na start jest mało cyfr albo nie ma ich wcale.",
    killersudoku_history_names_title: "Jak powstają tutaj łamigłówki",
    killersudoku_history_names_p1: "Każde Killer Sudoku zaczyna się od świeżo utworzonego, całkowicie rozwiązanego diagramu Sudoku, który jest potem dzielony na spójne klatki bez powtórzonej cyfry w żadnej z nich.",
    killersudoku_history_names_p2: "Wbudowany solver sprawdza następnie, czy sumy klatek dopuszczają tylko jedno rozwiązanie. Jeśli nie, odsłaniana jest cyfra, w której różnią się dwa możliwe rozwiązania, a sprawdzanie powtarza się, aż zostanie dokładnie jedno rozwiązanie."
});
I18n.markTextLoaded("pl");
