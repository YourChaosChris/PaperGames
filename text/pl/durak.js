// text/pl/durak.js
// Rules and history texts of durak (pl). Loaded by durak-rules.html and durak-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    sudoku_rules_basics_title: "Podstawowa idea",
    durak_rules_title: "Zasady gry Durak",
    durak_rules_intro: "Jak PaperGames gra w Duraka, w popularnej odmianie, w której gracze mogą dorzucać karty.",
    durak_term_setup: "Karty i atut",
    durak_rules_setup: "Talia 36 kart (od szóstki do asa w czterech kolorach), od 2 do 4 graczy, po sześć kart. Następna karta leży odkryta pod talią: jej kolor jest atutem przez całą grę i jest to ostatnia karta do dobrania. Kolor atutowy jest zawsze pokazany u góry planszy.",
    durak_term_attack: "Atak i obrona",
    durak_rules_attack: "Pierwszy atakuje gracz z najniższym atutem. Atakujący kładzie kartę odkrytą; następny gracz się broni i musi ją pobić wyższą kartą w tym samym kolorze albo dowolnym atutem, jeśli karta ataku nie jest atutem. Atut można pobić tylko wyższym atutem.",
    durak_term_throw: "Dorzucanie",
    durak_rules_throw: "Gdy pierwsza karta leży na stole, atakujący, a potem pozostali gracze mogą dorzucać kolejne karty - ale tylko wartości, które już leżą na stole jako karty ataku lub obrony. Obrońca musi pobić każdą z nich. W rundzie nigdy nie ma więcej niż sześć kart ataku i nigdy więcej, niż obrońca miał na początku rundy.",
    durak_term_take: "Branie kart",
    durak_rules_take: "Jeśli obrońca nie może lub nie chce pobić karty, bierze do ręki wszystkie karty ze stołu; pozostali mogą jeszcze wcześniej dorzucić pasujące karty. Potem atakuje gracz po obrońcy - obrońca jest pomijany. Jeśli obrońca pobije wszystko, karty wychodzą z gry, a obrońca atakuje jako następny.",
    durak_term_draw: "Dobieranie",
    durak_rules_draw: "Po każdej rundzie wszyscy uzupełniają rękę do sześciu kart z talii: najpierw atakujący, potem kolejno reszta, obrońca na końcu.",
    durak_term_end: "Koniec",
    durak_rules_end: "Gdy talia się skończy, nikt już nie dobiera, a gracz bez kart odpada. Ostatni gracz, który ma jeszcze karty, jest durakiem - głupcem - i przegrywa. Jeśli ostatni gracze pozbędą się kart jednocześnie, gra kończy się remisem.",
    durak_term_transfer: "Opcjonalnie: przekazywanie ataku",
    durak_rules_transfer: "Ta zasada jest wyłączona, chyba że włączysz ją przed grą. Zanim cokolwiek pobije, obrońca może położyć kartę tej samej wartości co karty ataku i w ten sposób przekazać cały atak następnemu graczowi, który musi się wtedy obronić przed wszystkimi kartami. Następny gracz musi mieć na to dość kart.",
    durak_history_title: "Historia gry Durak",
    durak_history_origins_title: "Rosyjska gra ludowa",
    durak_history_origins_p1: "Uważa się, że Durak rozpowszechnił się wśród zwykłych ludzi w Rosji w XIX wieku, grany popularną tam talią 36 kart. W XX wieku stał się jedną z najczęściej granych gier karcianych w całym Związku Radzieckim i krajach sąsiednich - uczono jej w domu, w pociągach i w wojsku.",
    durak_history_origins_p2: "W przeciwieństwie do większości gier karcianych nie ma zwycięzcy, jest tylko przegrany: \"durak\" znaczy \"głupiec\", i tak nazywa się ostatniego gracza z kartami aż do rozpoczęcia następnej partii.",
    durak_history_names_title: "Wiele sposobów gry",
    durak_history_names_p1: "Grana tutaj odmiana, w której można dorzucać karty, nazywa się podkidnoj durak. W innej popularnej odmianie, perewodnoj durak, obrońca może przekazać atak kartą tej samej wartości - PaperGames oferuje to jako opcję.",
    durak_history_names_p2: "Do tego dochodzą niezliczone zasady domowe, np. o tym, ile kart można dorzucić w pierwszej rundzie. W rodzinach często się o nie spiera, co jest częścią uroku tej gry."
});
I18n.markTextLoaded("pl");
