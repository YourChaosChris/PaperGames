// text/pl/sudoku.js
// Rules and history texts of sudoku (pl). Loaded by sudoku-rules.html and sudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    sudoku_rules_title: "Zasady Sudoku",
    sudoku_rules_intro: "Krótkie przypomnienie zasad, według których PaperGames rozgrywa Sudoku - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    sudoku_rules_basics_title: "Podstawowa idea",
    sudoku_term_board: "Siatka",
    sudoku_rules_board: "Siatka 9x9 jest podzielona na dziewięć kwadratów 3x3. Niektóre pola są od początku wypełnione (\"podpowiedzi startowe\") i nie można ich zmieniać; reszta zaczyna pusta - to je masz uzupełnić.",
    sudoku_term_goal: "Cel",
    sudoku_rules_goal: "Wypełnij każde puste pole cyfrą od 1 do 9 tak, by w każdym wierszu, każdej kolumnie i każdym z dziewięciu kwadratów 3x3 każda cyfra pojawiła się dokładnie raz. Każda łamigłówka wygenerowana przez PaperGames ma dokładnie jedno rozwiązanie.",
    sudoku_term_input: "Wpisywanie liczb",
    sudoku_rules_input: "Zaznacz pole, a potem wybierz liczbę z panelu pod planszą (albo wpisz cyfrę z klawiatury). Pole z przerywaną obwódką jest aktualnie w konflikcie z innym polem w swoim wierszu, kolumnie lub kwadracie - potraktuj to jako wskazówkę, że coś trzeba zmienić.",
    sudoku_rules_end_title: "Kończenie łamigłówki",
    sudoku_term_win: "Rozwiązane",
    sudoku_rules_win: "Łamigłówka jest rozwiązana w chwili, gdy siatka jest całkowicie wypełniona i nie pozostał żaden konflikt.",
    sudoku_term_difficulty: "Trudność",
    sudoku_rules_difficulty: "Łamigłówki Łatwe, Średnie i Trudne różnią się wyłącznie liczbą spośród 81 pól wypełnionych od początku - im mniej podpowiedzi startowych, tym więcej dedukcji potrzeba, by zrobić postęp.",
    sudoku_history_title: "Historia Sudoku",
    sudoku_history_origins_title: "Najpierw amerykańska łamigłówka",
    sudoku_history_origins_p1: "Łamigłówka polegająca na rozmieszczaniu liczb, którą dziś nazywamy Sudoku, pojawiła się po raz pierwszy w 1979 roku w amerykańskim magazynie z łamigłówkami, wydawanym przez Dell Magazines pod tytułem \"Number Place\". Za jej wynalazcę zwykle uznaje się Howarda Garnsa, emerytowanego architekta i niezależnego twórcę łamigłówek, choć czasopismo nie podawało wówczas nazwisk autorów, więc to przypisanie opiera się na poszlakach, a nie na podpisanym oświadczeniu.",
    sudoku_history_origins_p2: "Łamigłówka czerpała ze znacznie starszej idei matematycznej - kwadratu łacińskiego, czyli siatki, w której każdy symbol pojawia się dokładnie raz w każdym wierszu i każdej kolumnie - badanego przez Leonharda Eulera w XVIII wieku, z dodanym na to dodatkowym ograniczeniem kwadratów 3x3, dzięki któremu jedyne rozwiązanie można osiągnąć samą logiką, bez zgadywania.",
    sudoku_history_spread_title: "Japońska nazwa dla światowej mody",
    sudoku_history_spread_p1: "Łamigłówka dotarła do Japonii w 1984 roku za sprawą firmy Nikoli, która przemianowała ją na \"Suuji wa dokushin ni kagiru\" (\"cyfry muszą pozostać pojedyncze\"), wkrótce skróconą do Sudoku (\"pojedyncza liczba\"). W 1986 roku Nikoli wprowadziło dwie zasady, które do dziś są powszechne: górny limit liczby podpowiedzi startowych i ich symetryczny układ.",
    sudoku_history_spread_p2: "Sudoku pozostawało skromną japońską rozrywką przez dwie dekady, aż emerytowany sędzia Wayne Gould, który zetknął się z nim podczas podróży do Tokio, napisał program komputerowy do szybkiego generowania łamigłówek i przekonał londyński The Times, by zaczął je publikować w 2004 roku - co w ciągu około roku wywołało ogólnoświatową modę na łamigłówki prasowe.",
    sudoku_history_modern_title: "Od rubryki w gazecie do informatyki",
    sudoku_history_modern_p1: "Nagła popularność Sudoku przyciągnęła matematyków i informatyków niemal tak samo jak zwykłych fanów łamigłówek: w 2005 roku dokładnie obliczono całkowitą liczbę różnych ukończonych siatek 9x9 (nieco ponad 6,6 tryliarda), a w 2012 roku wyczerpujące przeszukiwanie komputerowe ustaliło, że żadna prawidłowa łamigłówka 9x9 nie potrzebuje mniej niż 17 podpowiedzi startowych, by mieć jedno rozwiązanie.",
    sudoku_history_modern_p2: "Ten drugi wynik to dokładnie ten rodzaj faktu, na którym generator PaperGames opiera się w odwrotnym kierunku: ponieważ jednoznaczność coraz trudniej zachować w miarę usuwania podpowiedzi, każda łamigłówka tutaj powstaje przez rozpoczęcie od pełnej, rozwiązanej siatki i usuwanie pól jedno po drugim, dopóki jednoznaczne rozwiązanie przetrwa.",
    puzzle_rules_hint: "Przycisk „Podpowiedź” pomaga w trzech etapach. Pierwsze naciśnięcie zaznacza, gdzie jest następny krok. Drugie podaje powód, czyli zasadę, która tam działa. Trzecie wykonuje krok (wpisuje liczbę albo buduje most). Podpowiedź wychodzi od twojego obecnego stanu: jeśli gdzieś stoi błędna liczba albo błędny most, najpierw ci to powie. Nigdy nie zgaduje – jeśli dalej da się iść tylko przez próbowanie, mówi to uczciwie. Podpowiedzi są bez limitu. Łamigłówka rozwiązana z podpowiedziami liczy się normalnie jako wygrana; statystyki pokazują dodatkowo, ile wygranych było z podpowiedziami."
});
I18n.markTextLoaded("pl");
