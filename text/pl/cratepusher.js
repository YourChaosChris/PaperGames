// text/pl/cratepusher.js
// Rules and history texts of cratepusher (pl). Loaded by cratepusher-rules.html and cratepusher-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    sudoku_rules_basics_title: "Podstawowa idea",
    cratepusher_rules_title: "Zasady gry Przesuwanie skrzyń",
    cratepusher_rules_intro: "Jak działa Przesuwanie skrzyń w PaperGames: łamigłówka dla jednej osoby, w której przesuwa się skrzynie w małym magazynie.",
    cratepusher_term_board: "Plansza",
    cratepusher_rules_board: "Prostokątna siatka ścian (pełna czerń) i podłogi (biel). Na podłodze stoisz ty (wypełnione koło), kilka skrzyń (kwadrat z krzyżykiem) i dokładnie tyle samo pól docelowych (mały pusty kwadrat). Skrzynia stojąca na polu docelowym zmienia się w wypełniony kwadrat.",
    cratepusher_term_move: "Ruch",
    cratepusher_rules_move: "Poruszasz się o jedno pole w górę, w dół, w lewo albo w prawo – nigdy na ukos. Nie możesz przechodzić przez ściany ani skrzynie.",
    cratepusher_rules_move_targets: "Po pustych polach docelowych możesz chodzić; zatrzymują cię tylko ściany i skrzynie.",
    cratepusher_rules_hint: "„Podpowiedź” pokazuje dokładnie jedno pchnięcie: pierwsze pchnięcie najkrótszego rozwiązania z twojej obecnej pozycji. Skrzynia do pchnięcia dostaje przerywaną ramkę, pole, na które ma trafić – ciągłą, a zdanie pod planszą podaje wiersz, kolumnę i kierunek (liczone bez zewnętrznej ściany). Podpowiedź tylko pokazuje pchnięcie – wykonujesz je sam. Po następną dotknij „Podpowiedź” jeszcze raz. Jeśli z twojej pozycji nie ma już rozwiązania, podpowiedź ci to powie. Podpowiedzi nie są zapisywane i nie zmieniają twoich statystyk.",
    cratepusher_term_push: "Pchanie",
    cratepusher_rules_push: "Gdy wejdziesz na skrzynię, pchasz ją o jedno pole dalej, ale tylko jeśli pole za nią jest wolne: bez ściany i bez drugiej skrzyni. Zawsze pchasz tylko jedną skrzynię naraz i nigdy nie możesz przyciągnąć skrzyni do siebie.",
    cratepusher_term_goal: "Cel",
    cratepusher_rules_goal: "Poziom jest rozwiązany, gdy każda skrzynia stoi na polu docelowym. Nie ma znaczenia, która skrzynia trafi na które pole.",
    cratepusher_term_stuck: "Utknięcie",
    cratepusher_rules_stuck: "Ponieważ skrzyń nie da się ciągnąć, nieprzemyślane pchnięcie może uczynić poziom nierozwiązywalnym – na przykład skrzynia wepchnięta w róg, który nie jest polem docelowym. Gra ostrzega, gdy skrzynia utknie w takim rogu. Inne ślepe zaułki nie są zgłaszane: myśl naprzód i używaj „Cofnij ruch” tyle razy, ile chcesz.",
    cratepusher_term_controls: "Sterowanie",
    cratepusher_rules_controls: "Dotknij pola obok siebie, aby na nie przejść (i pchnąć stojącą tam skrzynię). Dotknij dalszego pola podłogi, a dojdziesz tam najkrótszą drogą – ale tylko jeśli da się tam dotrzeć bez pchania skrzyni. Poruszają cię też klawisze strzałek oraz W, A, S, D. „Cofnij ruch” cofa ruchy jeden po drugim, ile chcesz; „Zacznij poziom od nowa” rozpoczyna poziom od początku.",
    cratepusher_term_levels: "Poziomy",
    cratepusher_rules_levels: "Każdy poziom buduje samo PaperGames, za każdym razem nowy: łatwy na siatce 7x7 z 3 skrzyniami, średni na 9x9 z 4, trudny na 10x10 z 5. Program buduje każdy poziom wstecz od pozycji rozwiązanej, więc zawsze da się go rozwiązać, a potem sprawdza go jeszcze raz własnym solverem. Liczba pchnięć najlepszego rozwiązania jest pokazana nad planszą, razem z twoimi krokami, pchnięciami i liczbą skrzyń, które już stoją na polach docelowych.",
    cratepusher_history_title: "Historia gry Przesuwanie skrzyń",
    cratepusher_history_origins_title: "Pomysł z 1981 roku",
    cratepusher_history_origins_p1: "Zasadę pchania skrzyń jedna po drugiej na oznaczone miejsca, bez ciągnięcia, wymyślił w 1981 roku Hiroyuki Imabayashi. W 1982 roku japońska firma Thinking Rabbit wydała ją jako grę komputerową pod nazwą Sokoban.",
    cratepusher_history_origins_p2: "Za prostymi zasadami kryje się prawdziwa głębia: nawet małe pomieszczenia mogą wymagać długich, starannie zaplanowanych ciągów ruchów, a informatycy wykazali, że rozwiązywanie takich łamigłówek jest w ogólności bardzo trudne. Pomysł podjęły od tego czasu niezliczone gry logiczne.",
    cratepusher_history_names_title: "Dlaczego inna nazwa",
    cratepusher_history_names_p1: "Sokoban jest zarejestrowanym znakiem towarowym firmy Falcon Co., Ltd. PaperGames nie ma żadnego związku z firmą Falcon ani z oryginalną grą i dlatego używa własnej nazwy: Przesuwanie skrzyń. Tak samo jest z Calcudoku, w które z tego samego powodu gra się pod własną nazwą.",
    cratepusher_history_names_p2: "Żaden z tutejszych poziomów nie pochodzi z oryginalnej gry ani z żadnego zbioru poziomów. Każdy poziom tworzy własny program PaperGames, gdy o niego poprosisz – zbudowany wstecz od pozycji rozwiązanej i sprawdzony własnym solverem."
});
I18n.markTextLoaded("pl");
