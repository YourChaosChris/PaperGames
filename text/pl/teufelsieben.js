// text/pl/teufelsieben.js
// Rules and history texts of teufelsieben (pl). Loaded by teufelsieben-rules.html and teufelsieben-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    ts_rules_title: "Zasady gry Diabelska Siódemka",
    ts_rules_intro: "Odkrywaj karty po kolei i zatrzymaj się w porę: powtórzony numer oznacza wpadkę. Gdy ktoś osiągnie cel, wygrywa osoba z największą liczbą punktów.",
    ts_rules_basics_title: "Zasady",
    ts_term_cards: "Karty",
    ts_rules_cards: "90 kart. Karty z numerami od 0 do 12, każdy numer występuje tyle razy, ile wynosi jego wartość (dwanaście 12, jedna 1 i jedno 0): 79 kart. Karty specjalne: Pauza (2), Dokładka (2), Ratunek (2), +3 (2), +5 (2) i Podwójna (1).",
    ts_term_turn: "Twoja tura",
    ts_rules_turn: "Na początku rundy każdy dostaje jedną kartę. Potem gracze, którzy nadal grają, po kolei wybierają „Odkryj kartę” albo „Pasuj”. Kto pasuje, zachowuje punkty z rundy.",
    ts_term_bust: "Wpadka",
    ts_rules_bust: "Jeśli odkryjesz numer, który już leży przed tobą, zaliczasz wpadkę i nie dostajesz punktów za tę rundę. Karta Ratunek chroni cię raz: druga taka karta jest odrzucana, a Ratunek zostaje zużyty.",
    ts_term_seven: "Siedem numerów",
    ts_rules_seven: "Kto ma przed sobą siedem różnych numerów, od razu kończy rundę i dostaje 20 dodatkowych punktów.",
    ts_term_special: "Karty specjalne",
    ts_rules_special: "Pauza: wybierasz gracza, który nadal gra (możesz wybrać siebie); musi od razu pasować i zachowuje punkty. Dokładka: wybierasz gracza, który nadal gra; musi odkryć trzy karty jedna po drugiej. Pauza ani Dokładka odkryta podczas Dokładki nie działa. +3 i +5 dodają punkty, a Podwójna podwaja sumę twoich numerów.",
    ts_term_points: "Punkty i koniec gry",
    ts_rules_points: "Punkty za rundę: suma twoich numerów (podwojona kartą Podwójna), plus +3 i +5 oraz 20 za siedem numerów. Runda kończy się, gdy nikt już w niej nie gra. Po rundzie, w której ktoś osiągnie cel (100, 150 lub 200 punktów, wybrany przed grą), gra się kończy: wygrywa osoba z największą liczbą punktów; przy remisie na pierwszym miejscu gracze wygrywają razem.",
    ts_term_computer: "Komputer",
    ts_rules_computer: "Komputer pasuje, gdy ryzyko wpadki przy następnej karcie jest zbyt duże dla wybranego poziomu. Liczy tylko odkryte karty i nigdy nie podgląda zakrytych. Łatwy pasuje wcześnie, Trudny ryzykuje bardziej.",
    ts_rules_example_title: "Przykład",
    ts_rules_example: "Masz 5, 9 i 2: 16 punktów. Wśród nieodkrytych kart są cztery 5, osiem 9 i jedna 2, które oznaczają wpadkę. Jeśli spasujesz, zachowasz 16 punktów; jeśli odkryjesz 9, nie dostaniesz punktów za tę rundę.",
    ts_history_title: "O grze Diabelska Siódemka",
    ts_history_family_title: "Gry z ryzykiem",
    ts_history_family_p1: "Gry, w których wciąż decydujesz, czy zaryzykować jeszcze raz, czy zachować to, co masz, to gry z ryzykiem. Wiele gier w kości i w karty działa właśnie tak.",
    ts_history_modern_title: "Ta wersja",
    ts_history_modern_p1: "Diabelska Siódemka powstało dla PaperGames i ma własne karty, nazwy oraz teksty: karty specjalne Pauza, Dokładka, Ratunek, +3, +5 i Podwójna oraz 20 dodatkowych punktów za siedem różnych numerów."
});
I18n.markTextLoaded("pl");
