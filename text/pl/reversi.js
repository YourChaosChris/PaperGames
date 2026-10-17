// text/pl/reversi.js
// Rules and history texts of reversi (pl). Loaded by reversi-rules.html and reversi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    reversi_rules_title: "Zasady Reversi",
    reversi_rules_intro: "Krótkie podsumowanie zasad Reversi w PaperGames - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    reversi_rules_basics_title: "Podstawowa idea",
    reversi_term_discs: "Pionki i ustawienie startowe",
    reversi_rules_discs: "Reversi gra się na planszy 8x8. Gra zaczyna się z dwoma pionkami każdego koloru ustawionymi na przekątnej w czterech środkowych polach. Czarne zawsze zaczynają.",
    reversi_term_flanking: "Oskrzydlenie",
    reversi_rules_flanking: "Ruch polega na postawieniu pionka na pustym polu tak, by oskrzydlić - uwięzić między nowym pionkiem a innym twoim pionkiem - jeden lub więcej pionków przeciwnika ustawionych w linii prostej (poziomo, pionowo albo po przekątnej). Każdy oskrzydlony pionek natychmiast zmienia kolor na twój.",
    reversi_rules_pass_title: "Gdy nie masz ruchu",
    reversi_term_pass: "Brak legalnego ruchu",
    reversi_rules_pass: "Jeśli nie masz żadnego legalnego ruchu, twoja tura jest automatycznie pomijana i gra wraca do przeciwnika - nie ma sposobu, by dobrowolnie spasować, dopóki istnieje legalny ruch. Jeśli żaden z graczy nie ma legalnego ruchu, gra kończy się natychmiast.",
    reversi_rules_end_title: "Jak kończy się partia",
    reversi_term_win: "Zwycięstwo",
    reversi_rules_win: "Gra kończy się w chwili, gdy żaden z graczy nie ma legalnego ruchu (zwykle dlatego, że plansza jest pełna). Wygrywa ten, kto ma więcej pionków na planszy; równy podział to remis.",
    reversi_term_resignation: "Poddanie się",
    reversi_rules_resignation: "Gracz może poddać się w dowolnym momencie, co natychmiast kończy grę na korzyść przeciwnika.",
    reversi_history_title: "Historia Reversi",
    reversi_history_origins_title: "Wiktoriański oryginał",
    reversi_history_origins_p1: "Reversi pojawiło się po raz pierwszy w Anglii na początku lat 80. XIX wieku, w środku typowo wiktoriańskiego sporu: dwoje graczy, Lewis Waterman i John W. Mollett, twierdziło, że to oni wynaleźli grę, i w 1888 roku opublikowało konkurencyjne pamflety, oskarżając się nawzajem o kradzież pomysłu. Historycy do dziś nie są pewni, komu należy się uznanie.",
    reversi_history_origins_p2: "We wczesnej wersji Reversi gracze mogli umieszczać swoje pierwsze pionki w dowolnym miejscu planszy, a niektóre wiktoriańskie zestawy zasad sprawiały, że całkowicie okrążona strona traciła kontrolę nad całą planszą jednym ruchem - osobliwości te ostatecznie zniknęły, gdy zasady zostały ustandaryzowane.",
    reversi_history_spread_title: "Odkryte na nowo w Japonii",
    reversi_history_spread_p1: "Gra odżyła w Japonii w 1973 roku, gdy Goro Hasegawa udoskonalił zasady Reversi - ustalając cztery startowe pionki w znanym, przekątnym układzie i usuwając starsze warianty zasad - i wydał ją przez firmę Tsukuda Original pod nową nazwą: Othello, w nawiązaniu do sztuki Szekspira i jej centralnego konfliktu czerni z bielą.",
    reversi_history_spread_p2: "Othello stało się ogromnie popularne w Japonii, a potem na całym świecie, dając początek Mistrzostwom Świata w Othello, rozgrywanym co roku od 1977 roku, i utrwalając ujednolicony zestaw zasad - ten sam, który jest używany w tej aplikacji - jako wersję rozgrywaną dziś w rywalizacji zawodowej.",
    reversi_history_modern_title: "Pole bitwy dla komputerów",
    reversi_history_modern_p1: "Othello okazało się niezwykle dobrym tematem dla badań nad komputerowym graniem w gry: jego zasady są proste, ale sama liczba osiągalnych pozycji przez długi czas uniemożliwiała działanie naiwnych strategii.",
    reversi_history_modern_p2: "W sierpniu 1997 roku program Logistello Michaela Buro pokonał panującego mistrza świata wśród ludzi, Takeshiego Murakamiego, 6:0 - przełomowy wynik, który przypadł na ten sam rok, co zwycięstwo Deep Blue w szachach. Od tamtej pory silniki do Othello stały się jeszcze silniejsze, a grę uznaje się dziś za rozwiązaną, albo niemal rozwiązaną, dla szerokiego zakresu pozycji.",
    reversi_history_names_title: "Dlaczego Reversi",
    reversi_history_names_p1: "Samo Reversi pochodzi z XIX wieku i należy do domeny publicznej. Othello to zarejestrowany znak towarowy. PaperGames nie ma żadnego związku z właścicielami tego znaku i dlatego używa starszej nazwy Reversi."
});
I18n.markTextLoaded("pl");
