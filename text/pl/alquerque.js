// text/pl/alquerque.js
// Rules and history texts of alquerque (pl). Loaded by alquerque-rules.html and alquerque-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    alquerque_rules_title: "Zasady Alquerque",
    alquerque_rules_intro: "Krótkie przypomnienie, jak PaperGames rozgrywa Alquerque, grę w przeskakiwanie opisaną w Księdze gier Alfonsa X Kastylijskiego.",
    alquerque_rules_basics_title: "Podstawowa idea",
    alquerque_term_board: "Plansza",
    alquerque_rules_board: "Plansza ma 25 punktów w siatce 5x5. Sąsiednie punkty są połączone poziomo i pionowo, a niektóre także po przekątnej: linie ukośne przechodzą tylko przez co drugi punkt, dzięki czemu cztery narożniki i środek są połączone we wszystkich ośmiu kierunkach. Pionki mogą poruszać się tylko wzdłuż narysowanych linii.",
    alquerque_term_setup: "Ustawienie początkowe",
    alquerque_rules_setup: "Każda strona ma 12 pionków: Białe (pierścienie) na dole, Czarne (pełne krążki) na górze. Każda strona zajmuje dwa najbliższe sobie rzędy oraz dwa punkty środkowego rzędu po swojej prawej stronie. Punkt środkowy pozostaje pusty. Białe zaczynają.",
    alquerque_term_move: "Ruch",
    alquerque_rules_move: "W swoim ruchu przesuń jeden ze swoich pionów wzdłuż linii na sąsiedni wolny punkt: do przodu, w bok lub ukośnie do przodu. Pion nigdy nie cofa się, także ukośnie. Do przodu znaczy: w stronę przeciwnika.",
    alquerque_term_capture: "Bicie",
    alquerque_rules_capture: "Pionek bije, przeskakując wzdłuż linii nad sąsiednim pionkiem przeciwnika na pusty punkt tuż za nim. Przeskoczony pionek jest zdejmowany z planszy. Jeśli ten sam pionek może potem skoczyć ponownie, kontynuuje w tej samej turze, nawet zmieniając kierunek. Skoki są dozwolone w każdym kierunku, także do tyłu – to ustalenie PaperGames, bo źródło zabrania tylko cofania się zwykłym ruchem.",
    alquerque_term_forced: "Obowiązek bicia",
    alquerque_rules_forced: "Jeśli możesz bić, musisz to zrobić: dopóki dostępne jest bicie, PaperGames pozwala ci wykonywać tylko ruchy z biciem, a pionek, który może skakać dalej, musi kontynuować, dopóki może. Gdy możliwych jest kilka bić, możesz wybrać dowolne z nich, nie tylko najdłuższe.",
    alquerque_rules_end_title: "Jak kończy się partia",
    alquerque_term_win: "Zwycięstwo",
    alquerque_rules_win: "Wygrywasz, gdy przeciwnik nie ma już żadnych pionków albo ma pionki, ale nie ma żadnego legalnego ruchu w swojej turze.",
    alquerque_term_resignation: "Poddanie się",
    alquerque_term_dead: "Strony, które nie mogą się już spotkać",
    alquerque_rules_dead: "Ustalenie PaperGames: gdy każdy biały pion stoi co najmniej dwa rzędy wyżej niż każdy czarny, strony nie mogą się już nigdy spotkać – białe idą tylko w górę lub w bok, czarne tylko w dół lub w bok. Nikt nie mógłby już bić, a gra nigdy by się nie skończyła, więc kończy się od razu: wygrywa strona z większą liczbą pionów, przy równej liczbie jest remis.",
    alquerque_rules_resignation: "Gracz może poddać się w dowolnym momencie, co natychmiast kończy grę na korzyść przeciwnika.",
    alquerque_rules_versions_title: "Która wersja jest tu rozgrywana",
    alquerque_rules_versions: "Dawne opisy alquerque pozostawiają niektóre szczegóły otwarte. W źródle podanym niżej bicie nie jest obowiązkowe: pion, który mógł bić, a tego nie zrobił, zostaje zdjęty (po angielsku „huffing“). PaperGames zostaje przy obowiązku bicia, bo aplikacja i tak proponuje tylko dozwolone ruchy. Piony nigdy nie cofają się zwykłym ruchem, ale skaczą w każdym kierunku (ustalenie PaperGames). Zaczynają białe.",
    alquerque_rules_sources_title: "Źródła",
    alquerque_rules_sources: "Zakaz cofania się i koniec gry według: Wikipedia, „Alquerque“, section Rules: https://en.wikipedia.org/wiki/Alquerque (dostęp 6 października 2026).",
    alquerque_history_title: "Historia Alquerque",
    alquerque_history_origins_title: "Nazwa z arabskiego",
    alquerque_history_origins_p1: "Nazwa pochodzi od arabskiego al-qirkat, nazwy gry planszowej znanej w świecie arabskim. Gra dotarła do Hiszpanii pod panowaniem Maurów i przetrwała tam jako alquerque.",
    alquerque_history_book_title: "Księga gier",
    alquerque_history_book_p1: "W 1283 roku król Alfons X Kastylijski polecił ukończyć Libro de los juegos, czyli Księgę gier. Oprócz szachów, gier w kości i gier z rodziny tryktraka opisuje ona alquerque wraz z zasadami i ilustracjami, co czyni ją jednym z najwcześniejszych pisanych źródeł o tej grze.",
    alquerque_history_checkers_title: "Od Alquerque do warcabów",
    alquerque_history_checkers_p1: "Warcaby są powszechnie uważane za potomka alquerque: bicie przez przeskok i zasada, że bicie trzeba wykonać, zostały przeniesione na pola szachownicy. Samo alquerque nadal było rozgrywane, a podobne gry znane są z wielu regionów.",
    alquerque_history_modern_title: "W PaperGames",
    alquerque_history_modern_p1: "PaperGames rozgrywa partię 12 na 12 na planszy 5x5 z obowiązkiem bicia. Linie planszy są narysowane w całości, bo tylko one pokazują, jakie ruchy po przekątnej istnieją."
});
I18n.markTextLoaded("pl");
