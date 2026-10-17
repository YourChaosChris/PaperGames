// text/pl/calcudoku.js
// Rules and history texts of calcudoku (pl). Loaded by calcudoku-rules.html and calcudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    sudoku_rules_basics_title: "Podstawowa idea",
    sudoku_term_goal: "Cel",
    sudoku_term_input: "Wpisywanie liczb",
    sudoku_rules_end_title: "Kończenie łamigłówki",
    sudoku_term_win: "Rozwiązane",
    sudoku_term_difficulty: "Trudność",
    puzzle_rules_hint: "Przycisk „Podpowiedź” pomaga w trzech etapach. Pierwsze naciśnięcie zaznacza, gdzie jest następny krok. Drugie podaje powód, czyli zasadę, która tam działa. Trzecie wykonuje krok (wpisuje liczbę albo buduje most). Podpowiedź wychodzi od twojego obecnego stanu: jeśli gdzieś stoi błędna liczba albo błędny most, najpierw ci to powie. Nigdy nie zgaduje – jeśli dalej da się iść tylko przez próbowanie, mówi to uczciwie. Podpowiedzi są bez limitu. Łamigłówka rozwiązana z podpowiedziami liczy się normalnie jako wygrana; statystyki pokazują dodatkowo, ile wygranych było z podpowiedziami.",
    calcudoku_rules_title: "Zasady Calcudoku",
    calcudoku_rules_intro: "Krótkie podsumowanie, jak PaperGames gra w Calcudoku - przydatne do odświeżenia pamięci lub nauki.",
    calcudoku_term_board: "Diagram",
    calcudoku_rules_board: "Diagram jest kwadratowy, od 4x4 do 7x7. W przeciwieństwie do Sudoku nie ma bloków; zamiast tego grube linie dzielą go na klatki - grupy od jednego do czterech sąsiadujących pól.",
    calcudoku_rules_goal: "Wpisz w każde pole cyfrę od 1 do rozmiaru diagramu (od 1 do 5 na diagramie 5x5) tak, aby każdy wiersz i każda kolumna zawierały każdą cyfrę dokładnie raz. Każda łamigłówka tworzona przez PaperGames ma dokładnie jedno rozwiązanie.",
    calcudoku_term_regions: "Klatki i działania",
    calcudoku_rules_regions: "Mały opis w lewym górnym polu klatki podaje wynik i działanie. Przy + lub × cyfry klatki po dodaniu lub pomnożeniu, w dowolnej kolejności, muszą dać wynik. Klatka z – lub ÷ ma zawsze dwa pola: większa cyfra minus mniejsza albo podzielona przez mniejszą daje wynik. Klatka z jednym polem po prostu pokazuje swoją cyfrę. Cyfra może wystąpić w klatce dwa razy, jeśli pozwalają na to jej wiersz i kolumna.",
    calcudoku_rules_input: "Wybierz pole, a potem liczbę z klawiatury pod planszą (albo wpisz cyfrę z klawiatury fizycznej). Cyfra pokazana na biało na czarnym tle koliduje z inną w swoim wierszu lub kolumnie albo zamyka klatkę, która nie daje swojego wyniku.",
    calcudoku_rules_difficulty: "Przed startem wybierz rozmiar diagramu i poziom trudności. Większe diagramy i wyższe poziomy oznaczają większe klatki i mniej klatek jednopolowych, które mniej zdradzają.",
    calcudoku_rules_win: "Łamigłówka jest rozwiązana, gdy każde pole jest wypełnione i żaden wiersz, kolumna ani klatka nie łamie zasad.",
    calcudoku_history_title: "Historia Calcudoku",
    calcudoku_history_origins_title: "Z japońskiej klasy",
    calcudoku_history_origins_p1: "Ten rodzaj łamigłówki przypisuje się zwykle Tetsuyi Miyamoto, japońskiemu nauczycielowi matematyki, który wymyślił go około 2004 roku, aby ćwiczyć z uczniami rachunki i logiczne myślenie bez podpowiadania im sposobu rozwiązania. Pomysł szybko wyszedł poza jego klasę dzięki książkom z łamigłówkami i gazetom.",
    calcudoku_history_origins_p2: "Pod rachunkami kryje się kwadrat łaciński - diagram, w którym każdy symbol występuje dokładnie raz w każdym wierszu i każdej kolumnie - badany w XVIII wieku przez matematyków takich jak Leonhard Euler, który stanowi też serce Sudoku.",
    calcudoku_history_names_title: "Wiele nazw, jedna łamigłówka",
    calcudoku_history_names_p1: "Ten sam rodzaj łamigłówki ukazuje się komercyjnie także pod nazwą KenKen. KenKen jest zastrzeżonym znakiem towarowym firmy Nextoy LLC. PaperGames nie jest w żaden sposób związany z Nextoy LLC i używa zamiast tego ogólnej nazwy Calcudoku.",
    calcudoku_history_names_p2: "Każde Calcudoku powstaje na twoim urządzeniu: losowy kwadrat łaciński jest dzielony na klatki, każda klatka dostaje działanie o wyniku całkowitym, a wbudowany solver zostawia tylko podziały z dokładnie jednym rozwiązaniem."
});
I18n.markTextLoaded("pl");
