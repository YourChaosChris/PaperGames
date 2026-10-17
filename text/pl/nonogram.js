// text/pl/nonogram.js
// Rules and history texts of nonogram (pl). Loaded by nonogram-rules.html and nonogram-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    nonogram_rules_title: "Zasady Nonogramów",
    nonogram_rules_intro: "Krótkie przypomnienie zasad, według których PaperGames rozgrywa Nonogramy (nazywane też Griddlers albo Japończykami) - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    nonogram_rules_basics_title: "Podstawowa idea",
    nonogram_term_clues: "Czytanie wskazówek",
    nonogram_rules_clues: "Każdy wiersz i każda kolumna ma wskazówkę: ciąg liczb podających długość każdego kolejnego bloku wypełnionych pól w tej linii, w kolejności, oddzielonych co najmniej jednym pustym polem. Wskazówka \"3 1\" oznacza ciąg trzech wypełnionych pól, potem przerwę, a potem jeszcze jedno wypełnione pole, gdzieś w tej linii.",
    nonogram_term_filling: "Wypełnianie i zaznaczanie",
    nonogram_rules_filling: "Użyj trybu Wypełnij, by zaciemnić pole, co do którego jesteś pewien, że jest częścią obrazka, i trybu Zaznacz X, by przekreślić pole, co do którego jesteś pewien, że jest puste - zaznaczanie to czysto pomoc pamięciowa i nie wpływa na wygraną, ale pomaga wykluczać możliwości w miarę rozpracowywania wskazówek.",
    nonogram_rules_end_title: "Kończenie łamigłówki",
    nonogram_term_win: "Rozwiązane",
    nonogram_rules_win: "Łamigłówka jest rozwiązana w chwili, gdy twoje wypełnione pola dokładnie pokrywają się z ukrytym obrazkiem - zaznaczone pola nie muszą być poprawne, liczą się tylko wypełnione.",
    nonogram_history_title: "Historia Nonogramów",
    nonogram_history_origins_title: "Dwoje twórców, dwa kontynenty",
    nonogram_history_origins_p1: "Łamigłówka wywodzi się z dwóch niezależnych wynalazków z połowy lat 80. XX wieku: Non Ishida, japońska redaktorka graficzna, stworzyła około 1985 roku łamigłówki siatkowe odsłaniające obrazki dzięki logice opartej na wskazówkach, a niemal w tym samym czasie brytyjski projektant łamigłówek James Dalgety wynalazł podobną koncepcję i ukuł nazwę \"Griddlers\".",
    nonogram_history_origins_p2: "Łamigłówki Ishidy opublikowano w japońskim magazynie z łamigłówkami i szybko się przyjęły; sama nazwa \"Nonogram\" jest zwykle rozumiana jako połączenie \"Non\" (jej imienia) i końcówki \"-gram\", choć w różnych krajach łamigłówka znana jest pod kilkoma innymi nazwami, w tym Griddlers, Picross i Hanjie.",
    nonogram_history_spread_title: "Od magazynów do Game Boya",
    nonogram_history_spread_p1: "Nintendo spopularyzowało tę łamigłówkę na całym świecie pod nazwą \"Picross\" (połączenie słów \"picture\" i \"crossword\"), wydając gry Picross na Game Boya i Super Famicom od 1995 roku - dla wielu graczy spoza Japonii ta seria na konsolę przenośną była pierwszym kontaktem z tym formatem.",
    nonogram_history_spread_p2: "Urok tej łamigłówki okazał się sięgać znacznie dalej niż same gry wideo: gazetowe strony z łamigłówkami podchwyciły ją obok Sudoku podczas boomu na łamigłówki w latach 2000., zwykle pod nazwą Griddlers albo Hanjie, i pozostaje ona dziś stałym elementem książeczek z łamigłówkami oraz aplikacji.",
    nonogram_history_modern_title: "Łamigłówka niewymagająca zgadywania (zwykle)",
    nonogram_history_modern_p1: "Dobrze skonstruowany Nonogram jest zaprojektowany tak, by dało się go rozwiązać wyłącznie czystą dedukcją logiczną, linia po linii, bez konieczności zgadywania - dokładnie tę właściwość sprawdza się we własnych łamigłówkach PaperGames przed ich dodaniem, za pomocą solvera opartego na propagacji ograniczeń, który potwierdza, że wskazówki każdego obrazka dopuszczają dokładnie jedną prawidłową siatkę.",
    nonogram_history_modern_p2: "Nie jest to jednak prawdą dla każdego możliwego zestawu wskazówek: podobnie jak w przypadku Sapera, udowodniono, że ogólne rozwiązywanie Nonogramów jest NP-zupełne, co oznacza, że dostatecznie duża albo celowo złośliwie skonstruowana łamigłówka może wymagać prawdziwego zgadywania w stylu nawrotów - dobrze zaprojektowane łamigłówki dla ludzkich graczy są specjalnie budowane tak, by tego uniknąć, co samo w sobie jest małą sztuką."
});
I18n.markTextLoaded("pl");
