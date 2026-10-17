// text/pl/minesweeper.js
// Rules and history texts of minesweeper (pl). Loaded by minesweeper-rules.html and minesweeper-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    minesweeper_rules_title: "Zasady Sapera",
    minesweeper_rules_intro: "Krótkie przypomnienie zasad, według których PaperGames rozgrywa Sapera - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    minesweeper_rules_basics_title: "Podstawowa idea",
    minesweeper_term_board: "Siatka i pierwsze kliknięcie",
    minesweeper_rules_board: "Ukryte miny są rozrzucone po siatce. Twoje pierwsze odsłonięte pole jest zawsze gwarantowane jako bezpieczne - miny są rozmieszczane dopiero potem, z pominięciem tego pola i wszystkiego wokół niego - więc gra nigdy nie kończy się, zanim się zacznie.",
    minesweeper_term_numbers: "Odczytywanie liczb",
    minesweeper_rules_numbers: "Odsłonięcie bezpiecznego pola pokazuje liczbę: ile min ukrywa się wśród jego ośmiu sąsiednich pól. Puste pole oznacza zero i automatycznie odsłania cały połączony obszar pustych pól.",
    minesweeper_term_flags: "Flagowanie",
    minesweeper_rules_flags: "Oznacz flagą pole, o którym sądzisz, że ukrywa minę - korzystając z trybu flagi (na ekranach dotykowych) albo kliknięcia prawym przyciskiem myszy (w przeglądarce na komputerze) - oflagowanych pól nie da się przypadkowo odsłonić. Kliknięcie już odsłoniętej liczby, przy której liczba oflagowanych sąsiadów zgadza się z tą liczbą, odsłania od razu wszystkich pozostałych sąsiadów, dokładnie jak kliknięcie środkowym przyciskiem myszy w klasycznej wersji gry na komputer - ale źle postawiona flaga wciąż może w ten sposób kosztować cię grę.",
    minesweeper_rules_end_title: "Jak kończy się gra",
    minesweeper_term_win: "Zwycięstwo",
    minesweeper_rules_win: "Odsłoń każde pole, które nie jest miną, a rozminujesz całą planszę.",
    minesweeper_term_loss: "Porażka",
    minesweeper_rules_loss: "Odsłonięcie miny natychmiast kończy grę - pokazane zostają wszystkie miny na planszy, a ta, która cię trafiła, jest oznaczona osobno.",
    minesweeper_history_title: "Historia Sapera",
    minesweeper_history_origins_title: "Od komputerów typu mainframe do pulpitu",
    minesweeper_history_origins_p1: "Gry w stylu Sapera, polegające na odsłanianiu i wnioskowaniu, sięgają wstecz do wczesnych lat 60. XX wieku i pojawiały się pod różnymi nazwami na komputerach typu mainframe oraz wczesnych komputerach osobistych aż do lat 80., w tym w wersji na Windows/OS2 z 1989 roku o nazwie \"Mined-Out\" oraz w kilku darmowych klonach o nazwach takich jak \"RLogic\" i \"Cube\".",
    minesweeper_history_origins_p2: "Wersja, która uczyniła tę grę powszechnie znaną, została napisana przez Roberta Donnera i Curta Johnsona z Microsoftu dla Windows 3.1 w 1992 roku, zastępując wcześniejszą grę Windows, Reversi, jako dołączoną łamigłówkę mającą uczyć nowych użytkowników obsługi myszy - lewy i prawy przycisk wymagały wówczas prawdziwej praktyki.",
    minesweeper_history_spread_title: "Zainstalowany na każdym biurku",
    minesweeper_history_spread_p1: "Ponieważ Windows w latach 90. i 2000. trafiał na przytłaczającą większość komputerów na świecie, Saper niemal domyślnie stał się jedną z najczęściej granych gier komputerowych w historii - zainstalowany wszędzie, niewymagający instrukcji i grywalny w wolnych chwilach między prawdziwą pracą.",
    minesweeper_history_spread_p2: "Gwarantowane bezpieczne pierwsze kliknięcie, dziś uznawane za podstawową część zasad, samo było udoskonaleniem: oryginalna wersja z 1992 roku mogła czasem zabić gracza już na pierwszym kliknięciu - frustrację, którą późniejsze wersje wyeliminowały, odkładając rozmieszczenie min do momentu po tym pierwszym odsłonięciu - dokładnie takie podejście stosuje się tutaj.",
    minesweeper_history_modern_title: "Naprawdę trudna łamigłówka",
    minesweeper_history_modern_p1: "Poza nostalgią, Saper okazuje się poważny również matematycznie: w 2000 roku Richard Kaye udowodnił, że ustalenie, czy dana częściowo odsłonięta plansza Sapera ma rozwiązanie zgodne z jej wskazówkami, jest problemem NP-zupełnym, co stawia go w tej samej klasie złożoności obliczeniowej co notorycznie trudne problemy, takie jak problem komiwojażera.",
    minesweeper_history_modern_p2: "Ten wynik oznacza, że nie istnieje żaden znany skrótowy algorytm, który zawsze szybko rozwiąże dowolną pozycję w Saperze - w najtrudniejszych przypadkach gracz (albo komputer) może zostać zredukowany do prawdziwego zgadywania w stosunku 50/50, bez możliwości wydedukowania bezpiecznego pola samą logiką, co jest dokładnie tym momentem, którego każdy doświadczony gracz nauczył się obawiać."
});
I18n.markTextLoaded("pl");
