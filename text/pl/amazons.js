// text/pl/amazons.js
// Rules and history texts of amazons (pl). Loaded by amazons-rules.html and amazons-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    amazons_rules_title: "Zasady gry Amazonki",
    amazons_rules_intro: "Krótkie podsumowanie zasad Gry w Amazonki w PaperGames - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    amazons_rules_basics_title: "Podstawowa idea",
    amazons_term_setup: "Ustawienie startowe",
    amazons_rules_setup: "Każdy gracz ma cztery amazonki na planszy 10x10, ustawione w standardowej, symetrycznej pozycji początkowej. W tej grze nie ma żadnych bić - wygrywa się wyłącznie dzięki ruchowi i kontroli terytorium.",
    amazons_term_moving: "Ruch amazonki",
    amazons_rules_moving: "W swojej turze przesuń jedną ze swoich amazonek o dowolną liczbę pustych pól po linii prostej - poziomo, pionowo lub po przekątnej - dokładnie jak hetmana w szachach. Nigdy nie może przeskoczyć nad inną amazonką ani nad spalonym polem.",
    amazons_term_shooting: "Wystrzelenie strzały",
    amazons_rules_shooting: "Zaraz po ruchu ta sama amazonka musi wystrzelić strzałę ze swojego nowego pola: kolejny ruch w stylu hetmana, w jednym z 8 kierunków, wyłącznie przez puste pola, lądujący na pustym polu.",
    amazons_term_burned: "Spalone pola",
    amazons_rules_burned: "Gdziekolwiek wyląduje strzała, to pole zostaje spalone do końca partii - trwale nieprzejezdny teren, przez który żadna amazonka ani żadna przyszła strzała nigdy więcej nie przejdzie ani na nim nie wyląduje.",
    amazons_rules_end_title: "Wygrywanie partii",
    amazons_term_win: "Jak kończy się partia",
    amazons_rules_win: "Jeśli to twoja tura i żadna z twoich amazonek nie ma już ani jednego legalnego ruchu - zablokowana w każdym kierunku przez inne amazonki, spalone pola lub krawędź planszy - przegrywasz. Wygrywa ten, kto jako ostatni potrafi jeszcze wykonać ruch.",
    amazons_history_title: "Historia Gry w Amazonki",
    amazons_history_origins_title: "Wynaleziona w 1988 roku",
    amazons_history_origins_p1: "Gra w Amazonki została wynaleziona w 1988 roku przez argentyńskiego projektanta gier Waltera Zamkauskasa i po raz pierwszy opublikowana w argentyńskim magazynie z łamigłówkami El Acertijo (wydawanym po hiszpańsku).",
    amazons_history_origins_p2: "Poruszające się jak hetman pionki przywodzą na myśl szachy, ale druga połowa każdej tury - wystrzelenie strzały, które trwale spala pole po każdym ruchu - to całkowicie własny pomysł, który zamienia grę z wyścigu w powolne dławienie przestrzeni ruchu przeciwnika.",
    amazons_history_design_title: "Ulubieniec kombinatorycznej teorii gier",
    amazons_history_design_p1: "Amazonki nie znają remisów ani bić, a w każdej turze oferują ogromną liczbę możliwych ruchów - na początku partii nawet więcej niż Go - co uczyniło je naturalnym przedmiotem badań dla naukowców zajmujących się kombinatoryczną teorią gier oraz stałym punktem zawodów i olimpiad gier komputerowych od końca lat 90.",
    amazons_history_design_p2: "Nauczenie komputera dobrej gry okazało się osobnym, poważnym wyzwaniem: przy dziesiątkach legalnych ruchów pionków, a dla każdego z nich dziesiątkach legalnych strzałów, pojedyncza tura może mieć znacznie ponad tysiąc legalnych ruchów - dużo więcej niż w szachach - co zmusiło programy grające w Amazonki do intensywnego porządkowania ruchów i analizy terytorium w końcówce zamiast czystego przeszukiwania siłowego.",
    amazons_history_version_title: "Ta wersja",
    amazons_history_version_p1: "PaperGames rozgrywa standardowe zasady na standardowej planszy 10x10 z czterema amazonkami na stronę. Każda tura to prosta sekwencja trzech dotknięć: dotknij amazonki, dotknij jej celu, a potem dotknij miejsca, z którego wystrzeli strzałę."
});
I18n.markTextLoaded("pl");
