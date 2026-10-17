// text/pl/spidersolitaire.js
// Rules and history texts of spidersolitaire (pl). Loaded by spidersolitaire-rules.html and spidersolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    spidersolitaire_rules_title: "Zasady Pasjansa Pająk",
    spidersolitaire_rules_intro: "Szybki poradnik, jak PaperGames rozgrywa Pasjansa Pająk - przydatny, jeśli dawno nie grałeś albo dopiero się uczysz.",
    spidersolitaire_rules_basics_title: "Podstawowa idea",
    spidersolitaire_term_layout: "Układ",
    spidersolitaire_rules_layout: "Dwie pełne talie (104 karty) rozdaje się na 10 kolumn tableau - pierwsze 4 kolumny otrzymują po 6 kart, pozostałe 6 po 5 kart - przy czym tylko wierzchnia karta każdej kolumny leży odkryta. Nie ma fundamentów. Pozostałe 50 kart tworzy stos dobierania, rozdawany później w paczkach po 10.",
    spidersolitaire_term_difficulty: "Wybór poziomu trudności",
    spidersolitaire_rules_difficulty: "Przed rozpoczęciem wybierz, ile kolorów jest w grze: 1 kolor jest najłatwiejszy (każda karta odpowiedniej rangi może przedłużyć dowolny ciąg), 2 kolory to poziom średni, a 4 kolory to tradycyjna, najtrudniejsza wersja - dokładnie jak dwie prawdziwe talie potasowane razem.",
    spidersolitaire_term_tableau: "Przenoszenie pojedynczej karty",
    spidersolitaire_rules_tableau: "Kartę można przenieść na kolumnę tableau tylko na kartę dokładnie o jedną rangę wyższą - kolor nie ma tu znaczenia. Pusta kolumna przyjmuje dowolną kartę lub dowolny prawidłowy ciąg, bez żadnego ograniczenia rangi.",
    spidersolitaire_term_group: "Przenoszenie grupy kart",
    spidersolitaire_rules_group: "Kilka już ułożonych kart można przenieść razem jako jedną całość tylko wtedy, gdy już tworzą prawidłowo malejący ciąg TEGO SAMEGO koloru (na przykład 5-4-3 kier, w dokładnie takiej kolejności) - przenoszenie ciągu mieszającego kolory, nawet jeśli rangi prawidłowo maleją, jest niedozwolone. Przenoszenie grupy nadal podlega powyższej zasadzie „o jedną rangę wyżej”. Gdy karty odejdą, nowo odsłonięta wierzchnia karta swojej kolumny automatycznie odkrywa się.",
    spidersolitaire_term_stock: "Stos dobierania",
    spidersolitaire_rules_stock: "Dotknij stosu dobierania, aby rozdać kolejną paczkę 10 kart, po jednej odkrytej karcie na każdą z 10 kolumn. Rozdawanie jest zablokowane, dopóki którakolwiek kolumna jest pusta - opróżnij ją najpierw (przenosząc jej karty gdzie indziej lub kończąc przez nią ciąg), zanim znów będzie można rozdawać.",
    spidersolitaire_term_sequences: "Ukończenie ciągu",
    spidersolitaire_rules_sequences: "Gdy tylko pełny ciąg od Króla do Asa, wszystkie tego samego koloru i po kolei, znajdzie się razem w jednej kolumnie, zostaje automatycznie wykryty i usunięty - nie muszą to być jedyne karty w tej kolumnie, wystarczy, że są prawidłowo ułożone w miejscu, z którego naturalnie dałoby się je razem podnieść. Każdy ukończony ciąg dodaje jeden punkt do licznika nad planszą.",
    spidersolitaire_rules_end_title: "Kończenie gry",
    spidersolitaire_term_win: "Wygrana",
    spidersolitaire_rules_win: "Gra jest wygrana, gdy tylko wszystkie 8 ciągów od Króla do Asa zostanie ułożonych i usuniętych - to 104 karty / 13, ta sama liczba niezależnie od wybranego poziomu trudności liczby kolorów.",
    spidersolitaire_history_title: "Historia Pasjansa Pająk",
    spidersolitaire_history_origins_title: "Niezudokumentowany faworyt",
    spidersolitaire_history_origins_p1: "W przeciwieństwie do niektórych gier karcianych z możliwym do ustalenia wynalazcą, dokładne pochodzenie Pasjansa Pająk nie jest precyzyjnie udokumentowane - jak wiele pasjansów, rozwinął się dzięki popularnej grze, a nie dzięki przypisaniu go jednej osobie czy jednej pierwszej publikacji. Jasne jest natomiast, że na początku lub w połowie XX wieku był już dobrze ugruntowanym faworytem wśród rodziny pasjansów na dwie talie, granych na papierze i suknie na długo przed powstaniem komputerów.",
    spidersolitaire_history_origins_p2: "Jego nazwa niemal na pewno nawiązuje do jego własnej trudności i struktury, a nie do jakiejkolwiek pajęczej grafiki na kartach: osiem przypominających fundamenty ciągów do utkania razem (echo ośmiu nóg pająka) z dziesięciu rozległych kolumn tableau, bez żadnej pomocy kolorystycznej czy fundamentowej, gdy w grze są cztery kolory.",
    spidersolitaire_history_spread_title: "Dołączony do Windows",
    spidersolitaire_history_spread_p1: "Najsłynniejszy moment masowej popularyzacji Pasjansa Pająk nastąpił w 1998 roku, gdy Microsoft dołączył go jako wbudowaną grę w Windows - pojawił się najpierw w pakiecie Windows 98 Plus! oraz w erze Windows Me, a następnie stał się standardowym elementem od Windows XP.",
    spidersolitaire_history_spread_p2: "Ta jedna decyzja wprowadziła Pająka do ogromnej, globalnej publiczności, tak samo jak Windows wcześniej zrobił to dla Klondike'a (nazywanego po prostu „Pasjansem”), a później dla FreeCella - zamieniając grę karcianą, która przez dekady spokojnie żyła przy prawdziwych stołach kartowych, w jeden z najczęściej używanych programów na świecie, bez konieczności posiadania przez graczy prawdziwej talii kart.",
    spidersolitaire_history_modern_title: "Ta wersja",
    spidersolitaire_history_modern_p1: "PaperGames rozgrywa standardowe zasady, dając od razu do wyboru wszystkie trzy tradycyjne poziomy trudności liczby kolorów - 1 kolor, 2 kolory lub pełną grę na 4 kolory - w tym samym mniej uciążliwym podejściu z prawdziwie nowym tasowaniem przy każdej grze, jakiego używają już Klondike i FreeCell w tej kolekcji, dostosowanym do własnego, dziesięciokolumnowego układu Pająka bez fundamentów."
});
I18n.markTextLoaded("pl");
