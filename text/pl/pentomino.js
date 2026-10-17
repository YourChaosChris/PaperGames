// text/pl/pentomino.js
// Rules and history texts of pentomino (pl). Loaded by pentomino-rules.html and pentomino-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    pt_rules_title: "Układanka pentomino – zasady",
    pt_rules_intro: "Wypełnij prostokąt klockami z pięciu kwadratów.",
    pt_rules_basics_title: "Zasady",
    pt_term_pieces: "Klocki",
    pt_rules_pieces: "Istnieje dokładnie dwanaście sposobów połączenia pięciu kwadratów bokami, jeśli kształty obrócone i odbite liczyć jako takie same. Każdy klocek ma swoją zwykłą literę - F, I, L, N, P, T, U, V, W, X, Y, Z - i własny czarno-biały wzór.",
    pt_term_lay: "Układanie",
    pt_rules_lay: "Wybierz klocek pod planszą. Obróć ↻ i Odbij ⇋ zmieniają jego położenie; kropka oznacza jedno pole. Dotknij pola, na które ma trafić kropka: jeśli klocek pasuje, zostaje położony. Dotknij położonego klocka, aby go podnieść. Przeciąganie nie jest potrzebne.",
    pt_term_free: "Swobodne układanie",
    pt_rules_free: "Układaj klocki, aż prostokąt będzie pełny - liczy się każde wypełnienie. Łatwy: 5 klocków w 5 × 5. Średni: 8 klocków w 5 × 8. Trudny: wszystkie 12 w 6 × 10, 5 × 12, 4 × 15 lub 3 × 20.",
    pt_term_fixed: "Podane klocki startowe",
    pt_rules_fixed: "Na planszy 6 × 10 niektóre klocki leżą na stałe (przerywane ramki wewnątrz); pozostałe pasują do nich tylko w jeden sposób. Łatwy: 3 klocki do ułożenia, Średni: 5, Trudny: 7.",
    pt_term_help: "Podpowiedź",
    pt_rules_help: "Podpowiedź zaznacza, gdzie pasuje następny klocek. Jeśli położony klocek blokuje każdą drogę do celu, podaje ten klocek.",
    pt_rules_example_title: "Przykład",
    pt_rules_example: "Rozwiązana łatwa plansza: pięć klocków wypełnia kwadrat 5 × 5.",
    pt_history_title: "Historia układanki pentomino",
    pt_history_early_title: "Dudeney i Golomb",
    pt_history_early_p1: "Najstarsza znana łamigłówka ze wszystkimi dwunastoma klockami pochodzi z książki Henry'ego Dudeneya The Canterbury Puzzles z 1907 roku. Nazwa „pentomino” pochodzi od matematyka Solomona Golomba, który zaczął opisywać te kształty w 1953 roku; rozsławiła je rubryka łamigłówek Martina Gardnera w Scientific American.",
    pt_history_count_title: "Policzone rozwiązania",
    pt_history_count_p1: "Na ile sposobów można wypełnić 6 × 10? C. B. i Jenifer Haselgrove obliczyli to komputerowo w 1960 roku: 2339, nie licząc obróconych ani odbitych kopii całego rozwiązania. Dla 5 × 12 jest ich 1010, dla 4 × 15 - 368, a dla 3 × 20 tylko 2."
});
I18n.markTextLoaded("pl");
