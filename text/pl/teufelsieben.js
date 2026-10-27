// text/pl/teufelsieben.js
// Rules and history texts of teufelsieben (pl). Loaded by teufelsieben-rules.html and teufelsieben-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    ts_rules_title: "Zasady gry Diabelska Siódemka",
    ts_rules_intro: "Odkrywaj karty po kolei i zatrzymaj się w porę: liczba, którą już masz, oznacza przepadek. Gdy ktoś osiągnie cel, wygrywa ten, kto ma najwięcej punktów.",
    ts_rules_basics_title: "Zasady",
    ts_term_cards: "Karty",
    ts_rules_cards: "60 kart. Liczby od 1 do 10: trzy jedynki, cztery dwójki, pięć trójek, po sześć czwórek, piątek, szóstek i siódemek, pięć ósemek, cztery dziewiątki i trzy dziesiątki. Po dwie karty: Odwaga, Skreślenie, Przekazanie, Most, Kolekcjoner i Podgląd.",
    ts_term_turn: "Twoja tura",
    ts_rules_turn: "Każdy gracz ma jedną pełną turę w rundzie. Odkrywaj karty po jednej; po pierwszej możesz w każdej chwili przerwać. Runda kończy się, gdy każdy wykona ruch. Pierwszy gracz przesuwa się o jedno miejsce.",
    ts_term_bust: "Porażka",
    ts_rules_bust: "Powtórzona liczba oznacza porażkę: zero punktów w tej rundzie. Odwaga raz ratuje; odrzuć powtórzoną liczbę i Odwagę. Każda użyta Odwaga kosztuje 5 punktów na koniec rundy.",
    ts_term_run: "Ciągi",
    ts_rules_run: "Najdłuższy ciąg co najmniej 4 liczb daje 5 × (długość − 2): cztery z rzędu to 10, pięć to 15. Każdy Most uzupełnia jedną brakującą liczbę.",
    ts_term_extreme: "Dziki ciąg",
    ts_rules_extreme: "Przed grą możesz wybrać karty „Dziki ciąg”: dochodzi 12 kart, razem 72 – liczby 11, 12, 13 i 14 (po 2 karty), Ogniwo (2 karty, +2 punkty za każdą liczbę najdłuższego ciągu z co najmniej 2 liczb, przy dwóch Ogniwach +4) i Lustro (2 karty: twoja ostatnia liczba n staje się 15 − n, czyli zamieniają się 1 i 14, 2 i 13 … 7 i 8; jeśli masz już tę liczbę albo nie masz jeszcze żadnej, nic się nie dzieje). Ciągi sięgają do 14. Gra toczy się do 250 lub 500 punktów.",
    ts_term_special: "Karty specjalne",
    ts_rules_special: "Odwaga raz ratuje i kosztuje 5 punktów po użyciu. Skreślenie usuwa ostatnią liczbę. Przekazanie: następny gracz, który w tej rundzie jeszcze ma turę, musi ją zacząć od już odkrytej karty – przez nią może też odpaść; jeśli nikt już nie gra, karta nic nie robi. Most: zostaje u ciebie przez rundę i zastępuje jedną brakującą liczbę w ciągu, więc 4 5 _ 7 liczy się jak cztery po kolei. Kolekcjoner daje 1 punkt za liczbę. Podgląd pokazuje następną kartę.",
    ts_term_points: "Punkty i koniec",
    ts_rules_points: "Punkty rundy to suma liczb, premia za ciąg i 1 punkt za każdą liczbę za każdego Kolekcjonera, minus 5 za używaną Odwagę (minimum zero). Cel: 60, 90 lub 120; domyślnie 90. Po rundzie, w której ktoś osiągnie cel, wygrywa najwyższy wynik; remis oznacza wspólną wygraną.",
    ts_term_computer: "Komputer",
    ts_rules_computer: "Komputer liczy tylko odkryte karty i kartę pokazaną przez Podgląd. Łatwy szybko przerywa; Trudny porównuje możliwy zysk z ryzykiem.",
    ts_rules_example_title: "Przykład",
    ts_rules_example: "Masz 3, 4, 5, 6 i 9: 27 punktów z liczb. Ciąg czterech daje 10, razem 37 przed efektami kart specjalnych.",
    ts_history_title: "O grze Diabelska Siódemka",
    ts_history_family_title: "Grać dalej czy przerwać",
    ts_history_family_p1: "W takich grach wciąż wybiera się między kolejnym ryzykiem a zachowaniem tego, co już zdobyto. Tak działa wiele gier w kości i karty.",
    ts_history_modern_title: "Ta wersja",
    ts_history_modern_p1: "Diabelska Siódemka powstała dla PaperGames i ma własne karty, zasady i teksty: własny układ liczb 1–10, premię za ciąg i karty Odwaga, Skreślenie, Przekazanie, Most, Kolekcjoner oraz Podgląd.",
});
I18n.markTextLoaded("pl");
