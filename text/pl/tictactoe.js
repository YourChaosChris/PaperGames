// text/pl/tictactoe.js
// Rules and history texts of tictactoe (pl). Loaded by tictactoe-rules.html and tictactoe-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    tictactoe_rules_title: "Zasady gry w kółko i krzyżyk",
    tictactoe_rules_intro: "Krótkie podsumowanie, jak PaperGames gra w kółko i krzyżyk, znane też jako tic-tac-toe.",
    tictactoe_rules_basics_title: "Podstawy",
    tictactoe_term_board: "Plansza i znaki",
    tictactoe_rules_board: "Plansza to siatka 3x3 z dziewięcioma polami. Gracze na zmianę stawiają swój znak na wolnym polu: krzyżyk gracz 1, kółko gracz 2. Gracz 1 zawsze zaczyna. Postawiony znak zostaje na miejscu do końca gry.",
    tictactoe_rules_end_title: "Jak kończy się gra",
    tictactoe_term_win: "Wygrana",
    tictactoe_rules_win: "Kto pierwszy ustawi trzy swoje znaki w rzędzie – poziomo, pionowo lub po przekątnej – od razu wygrywa. Zwycięski rząd jest pokazany na czarno.",
    tictactoe_term_draw: "Remis",
    tictactoe_rules_draw: "Jeśli wszystkie dziewięć pól jest zajętych i nikt nie ma trzech w rzędzie, gra kończy się remisem. Dwaj gracze, którzy nie popełniają błędów, zawsze remisują – dlatego na poziomie Trudny komputer nigdy nie przegrywa, a najlepszym możliwym wynikiem przeciwko niemu jest remis.",
    tictactoe_term_resignation: "Poddanie się",
    tictactoe_rules_resignation: "Gracz może się poddać w dowolnej chwili, co natychmiast kończy grę na korzyść przeciwnika.",
    tictactoe_rules_hard_title: "Poziom Trudny",
    tictactoe_rules_hard: "Na poziomie Trudny komputer przelicza każdą możliwą kontynuację i nigdy się nie myli. Dla planszy 3x3 udowodniono – sprawdzając wszystkie możliwe partie – że dwaj bezbłędni gracze zawsze remisują. Przeciwko temu poziomowi najwięcej, co możesz osiągnąć, to remis; jeden błąd i przegrywasz.",
    tictactoe_history_title: "Historia gry w kółko i krzyżyk",
    tictactoe_history_origins_title: "Trzy kamyki w Rzymie",
    tictactoe_history_origins_p1: "Wczesną krewną grano w Cesarstwie Rzymskim około I wieku p.n.e., prawdopodobnie pod nazwą terni lapilli, „po trzy kamyki”. Każdy gracz miał tylko trzy pionki; gdy wszystkie leżały na planszy, przesuwano je na wolne punkty, by grać dalej.",
    tictactoe_history_origins_p2: "Plansze do tej gry znaleziono w wielu miejscach Rzymu.",
    tictactoe_history_spread_title: "Noughts and Crosses, Tic-Tac-Toe",
    tictactoe_history_spread_p1: "Gra miała wiele nazw. Brytyjska nazwa „noughts and crosses” (zera i krzyżyki) pojawiała się drukiem już około połowy XIX wieku, na przykład w 1858 roku w czasopiśmie Notes and Queries.",
    tictactoe_history_spread_p2: "W Stanach Zjednoczonych w XX wieku przyjęła się nazwa tic-tac-toe. Być może pochodzi od „tick-tack”, dawnej odmiany tryktraka znanej w Anglii już w XVI wieku.",
    tictactoe_history_modern_title: "Jedna z pierwszych gier komputerowych",
    tictactoe_history_modern_p1: "W 1952 roku A. S. (Sandy) Douglas napisał na Uniwersytecie Cambridge program OXO dla komputera EDSAC, w ramach swojej pracy doktorskiej o współdziałaniu człowieka z komputerem. Pole wybierało się tarczą telefonu, a komputer grał bezbłędnie. OXO należy do pierwszych znanych gier wideo.",
    tictactoe_history_modern_p2: "Gra jest na tyle mała, że da się ją policzyć w całości: z dokładnością do obrotów i odbić istnieje 26 830 możliwych partii, a przy bezbłędnej grze każda kończy się remisem. Dokładnie tak działa tu poziom Trudny – przed każdym ruchem sprawdza wszystkie możliwe dalsze przebiegi."
});
I18n.markTextLoaded("pl");
