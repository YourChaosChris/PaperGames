// text/pl/gomoku.js
// Rules and history texts of gomoku (pl). Loaded by gomoku-rules.html and gomoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    gomoku_rules_title: "Zasady Gomoku",
    gomoku_rules_intro: "Krótkie przypomnienie zasad, według których PaperGames rozgrywa Gomoku (pięć w rzędzie) - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    gomoku_rules_basics_title: "Podstawowa idea",
    gomoku_term_board: "Plansza i stawianie kamieni",
    gomoku_rules_board: "Kamienie stawia się na przecięciach siatki 15x15, dokładnie jak w Go - po postawieniu nigdy się nie ruszają i nigdy nie są zbijane. Czarny zawsze rusza się jako pierwszy.",
    gomoku_rules_end_title: "Jak kończy się partia",
    gomoku_term_win: "Zwycięstwo",
    gomoku_rules_win: "Pierwszy gracz, który ustawi pięć lub więcej swoich kamieni w nieprzerwanej linii - poziomo, pionowo albo po przekątnej - wygrywa natychmiast.",
    gomoku_term_draw: "Remis",
    gomoku_rules_draw: "Jeśli plansza zapełni się całkowicie bez piątki żadnej ze stron, gra kończy się remisem.",
    gomoku_term_resignation: "Poddanie się",
    gomoku_rules_resignation: "Gracz może poddać się w dowolnym momencie, co natychmiast kończy grę na korzyść przeciwnika.",
    gomoku_history_title: "Historia Gomoku",
    gomoku_history_origins_title: "Starożytne korzenie, współczesna nazwa",
    gomoku_history_origins_p1: "Gry oparte na ustawianiu kamieni w rzędzie na siatce sięgają w Azji Wschodniej wstecz o stulecia; konkretne zasady znane dziś jako Gomoku ukształtowały się w Japonii, gdzie ich nazwa (五目並べ, gomokunarabe) oznacza po prostu \"pięć punktów w rzędzie\".",
    gomoku_history_origins_p2: "Tradycyjnie gra się w nią tymi samymi czarno-białymi kamieniami i na planszy z przecięciami linii co w Go, co czyni ją prostym wariantem wymagającym niewiele sprzętu, który pokolenia graczy Go traktowały jako szybką grę poboczną.",
    gomoku_history_spread_title: "Od zwykłej rozrywki do Renju",
    gomoku_history_spread_p1: "Ponieważ proste zasady Gomoku dają pierwszemu graczowi (tradycyjnie Czarnemu) znaczącą wbudowaną przewagę, na początku XX wieku w Japonii powstał bardziej rygorystyczny wariant turniejowy zwany Renju, dodający dodatkowe ograniczenia - zakazujące Czarnemu pewnych układów podwójnej trójki czy podwójnej czwórki - by wyrównać szanse.",
    gomoku_history_spread_p2: "Renju stało się standardem poważnej gry turniejowej, podczas gdy prostszy, nieograniczony zestaw zasad rozgrywany tutaj (często nazywany Gomoku \"freestyle\") pozostał bardziej rozpowszechnioną, swobodną wersją na całym świecie.",
    gomoku_history_modern_title: "Rozwiązana wygrana pierwszego gracza",
    gomoku_history_modern_p1: "W 1994 roku badacz L. Victor Allis udowodnił, poprzez wyczerpującą analizę komputerową (technikę zwaną przeszukiwaniem liczb dowodowych), że przy doskonałej grze Gomoku freestyle na standardowej planszy jest wymuszoną wygraną pierwszego gracza.",
    gomoku_history_modern_p2: "Ten wynik jest właśnie powodem istnienia turniejowego Renju: bez dodatkowych ograniczeń nałożonych na Czarnego, turniejowe Gomoku byłoby rozwiązaną formalnością, a nie prawdziwą rywalizacją - rzadki przypadek, gdy rozwiązana gra bezpośrednio przekształciła sposób jej rozgrywania na poziomie zawodowym, zamiast pozostać jedynie ciekawym przypisem."
});
I18n.markTextLoaded("pl");
