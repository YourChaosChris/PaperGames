// text/pl/skyscrapers.js
// Rules and history texts of skyscrapers (pl). Loaded by skyscrapers-rules.html and skyscrapers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    skyscrapers_rules_title: "Zasady Drapaczy Chmur",
    skyscrapers_rules_intro: "Szybkie przypomnienie, jak PaperGames obsługuje Drapacze Chmur (Skyscrapers) - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    skyscrapers_rules_basics_title: "Podstawowa idea",
    skyscrapers_term_board: "Plansza",
    skyscrapers_rules_board: "Każde pole zawiera wysokość budynku, od 1 (najniższy) do N (najwyższy, gdzie N to rozmiar planszy). Wokół planszy niektóre wiersze i kolumny mają liczbę-wskazówkę tuż za tą krawędzią - niekoniecznie każdy wiersz czy kolumna, i niekoniecznie z każdej strony.",
    skyscrapers_term_clues: "Odczytywanie wskazówek na brzegu",
    skyscrapers_rules_clues: "Wskazówka podaje, ile budynków byłoby widać patrząc w ten wiersz lub kolumnę z tej strony, jeśli wyższy budynek całkowicie zasłania z tego punktu widzenia każdy niższy budynek stojący przed nim. Wskazówki u góry patrzą w dół swojej kolumny, te na dole patrzą w górę, te po lewej patrzą wzdłuż swojego wiersza w prawo, a te po prawej - w lewo.",
    skyscrapers_term_goal: "Cel",
    skyscrapers_rules_goal: "Wypełnij każde pole wysokością od 1 do N tak, aby każdy wiersz i każda kolumna zawierały każdą wysokość dokładnie raz (ta sama zasada co w wierszach i kolumnach Sudoku, tylko bez zasady bloku), a każda wskazówka pokazana wokół planszy zgadzała się z liczbą budynków rzeczywiście widocznych z tej strony.",
    skyscrapers_term_input: "Wpisywanie wysokości",
    skyscrapers_rules_input: "Wybierz pole, a następnie wysokość z panelu pod planszą (lub wpisz cyfrę na klawiaturze). Pole z przerywaną obwódką aktualnie powtarza wysokość użytą już gdzie indziej w jego wierszu lub kolumnie - potraktuj to jako sygnał, że coś trzeba zmienić.",
    skyscrapers_term_difficulty: "Poziom trudności",
    skyscrapers_rules_difficulty: "Poziomy Łatwy, Średni i Trudny używają coraz większych plansz (4x4, 5x5 i 6x6) z coraz mniejszą liczbą odkrytych wskazówek na brzegu - więcej wysokości do żonglowania naraz, ale wciąż te same dwie zasady.",
    skyscrapers_rules_example_title: "Rozwiązany przykład",
    skyscrapers_term_example: "Liczenie widocznych budynków",
    skyscrapers_rules_example_p1: "Weźmy wiersz czterech budynków o wysokościach 3, 1, 4, 2, czytany od lewej do prawej. Patrząc od lewej: 3 jest widoczne jako pierwsze, bo nic wyższego go nie poprzedza. 1 jest niższe od widzianej już 3, więc pozostaje za nią ukryte. 4 jest wyższe od wszystkiego wcześniej, więc też jest widoczne. 2 jest niższe od 4, więc pozostaje ukryte.",
    skyscrapers_rules_example_p2: "To daje 2 budynki widoczne od lewej - 3 i 4 - więc lewa wskazówka o wartości 2 pasuje do tego wiersza. Patrząc na ten sam wiersz od prawej (czytany w kolejności patrzenia jako 2, 4, 1, 3): 2 jest widoczne jako pierwsze, 4 jest wyższe, więc też widoczne, a zarówno 1, jak i 3 po nim są niższe od widzianej już 4, więc żadne z nich nie jest widoczne - tu również prawa wskazówka o wartości 2, czysto przypadkowo dla tego konkretnego wiersza.",
    skyscrapers_rules_end_title: "Kończenie łamigłówki",
    skyscrapers_term_win: "Rozwiązane",
    skyscrapers_rules_win: "Łamigłówka jest rozwiązana, gdy tylko plansza jest w pełni wypełniona, każdy wiersz i kolumna zawierają każdą wysokość dokładnie raz, a każda wskazówka na brzegu zgadza się z rzeczywistą liczbą widocznych budynków w swoim wierszu lub kolumnie.",
    skyscrapers_history_title: "Historia Drapaczy Chmur",
    skyscrapers_history_origins_title: "Korzenie w kulturze magazynów z łamigłówkami",
    skyscrapers_history_origins_p1: "W przeciwieństwie do Sudoku, Drapacze Chmur nie mają jednego dobrze udokumentowanego wynalazcy ani daty pierwszej publikacji, co do której zgadzaliby się historycy. Jak wiele gatunków łamigłówek logicznych, wydają się powstały i rozprzestrzeniać stopniowo poprzez kulturę magazynów z łamigłówkami, zamiast być przypisane jednemu, nazwanemu twórcy w konkretnym momencie - pomysł wskazówki widoczności jest na tyle prosty, że mógł niezależnie przyjść do głowy więcej niż jednemu twórcy łamigłówek.",
    skyscrapers_history_origins_p2: "Pewna jest za to leżąca u jej podstaw matematyka: podobnie jak Sudoku, rozwiązana plansza Drapaczy Chmur to kwadrat łaciński - plansza, w której każdy symbol, tutaj wysokość budynku, pojawia się dokładnie raz w każdym wierszu i kolumnie - obiekt badany przez Leonharda Eulera w XVIII wieku, na długo przed powstaniem którejkolwiek z tych dwóch łamigłówek.",
    skyscrapers_history_spread_title: "Łamigłówka turniejowa",
    skyscrapers_history_spread_p1: "Drapacze Chmur zyskały najszerszą międzynarodową publiczność dzięki rozwiązywaniu w zawodach, zwłaszcza podczas World Puzzle Championship, corocznych międzynarodowych zawodów w rozwiązywaniu łamigłówek, rozegranych po raz pierwszy w 1992 roku, gdzie są jednym z wielu powtarzających się standardowych gatunków obok rodziny Sudoku i innych łamigłówek opartych na kwadracie łacińskim.",
    skyscrapers_history_spread_p2: "Ten kontekst zawodowy pomógł ustalić zasady i sposób prezentacji łamigłówki w standardowej formie granej dziś, nawet bez jednego uznanego wynalazcy - podobnie jak kilka powtarzających się gatunków łamigłówek zawdzięcza swoją ostateczną formę mniej jednemu twórcy, a bardziej powtarzalnemu użyciu w magazynach z łamigłówkami i zestawach zadań turniejowych.",
    skyscrapers_history_modern_title: "Kwadraty łacińskie widziane z zewnątrz",
    skyscrapers_history_modern_p1: "To, co czyni Drapacze Chmur koncepcyjnie wyjątkowymi, to sposób, w jaki nakładają przestrzenny, wizualny pomysł - patrzenie wzdłuż rzędu budynków i liczenie, ile z nich jest wystarczająco wysokich, by je zobaczyć - na logikę znaną już z wierszy i kolumn Sudoku. To właśnie to połączenie nadaje łamigłówce jej nazwę i tematyczną prezentację, w przeciwieństwie do zwykłej planszy cyfr, jaką prezentuje Sudoku czy goła łamigłówka z kwadratem łacińskim.",
    skyscrapers_history_modern_p2: "To także dokładnie ta właściwość, na której - w odwrotnym kierunku - opiera się generator PaperGames: skoro wskazówka na brzegu jest tak naprawdę tylko faktem obliczonym na podstawie ukończonej planszy, każda łamigłówka powstaje tu przez zbudowanie najpierw pełnej, poprawnej planszy, obliczenie na jej podstawie każdej możliwej wskazówki, a następnie zachowanie tylko tylu z nich, ile wystarcza, by plansza wciąż miała dokładnie jedno rozwiązanie - to samo podejście generuj-a-potem-redukuj, którego używają generatory Sudoku i Kakuro w tej kolekcji, dostosowane do innego ograniczenia."
});
I18n.markTextLoaded("pl");
