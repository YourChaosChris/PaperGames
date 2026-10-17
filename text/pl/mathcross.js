// text/pl/mathcross.js
// Rules and history texts of mathcross (pl). Loaded by mathcross-rules.html and mathcross-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    mc_rules_title: "Siatka działań – zasady",
    mc_rules_intro: "Wpisz liczby od 1 do 9 tak, aby każde działanie się zgadzało.",
    mc_rules_basics_title: "Zasady",
    mc_term_grid: "Siatka",
    mc_rules_grid: "Dziewięć kratek w trzech wierszach i trzech kolumnach, między sąsiednimi kratkami znak działania (+, −, ×, :), a na końcu każdego wiersza i pod każdą kolumną wynik. Każda liczba od 1 do 9 trafia do dokładnie jednej kratki. Niektóre liczby są podane.",
    mc_term_order: "Od lewej do prawej",
    mc_rules_order: "Wiersz liczymy od lewej do prawej, kolumnę z góry na dół - krok po kroku, bez pierwszeństwa mnożenia: 3 + 4 × 2 daje 7 × 2 = 14, a nie 11. Niektóre szkolne wersje tej łamigłówki stosują zwykłą kolejność działań; tutaj zawsze liczymy od lewej do prawej.",
    mc_term_whole: "Liczby całkowite",
    mc_rules_whole: "Każdy wynik pośredni i każdy wynik jest liczbą całkowitą większą od 0; dzielenie zawsze więc wychodzi bez reszty.",
    mc_term_levels: "Poziomy",
    mc_rules_levels: "Łatwy: tylko + i −, 4 liczby podane. Średni: także ×, 3 podane. Trudny: wszystkie cztery działania, co najmniej jedno :, 2 podane. Każda łamigłówka ma dokładnie jedno rozwiązanie i da się ją rozwiązać bez zgadywania.",
    mc_term_help: "Gra",
    mc_rules_help: "Dotknij pustej kratki, a potem liczby pod planszą; dotknij tej liczby jeszcze raz albo Wyczyść, aby opróżnić kratkę. Liczba, która stoi już w innej kratce, przenosi się tutaj. Gdy wiersz lub kolumna są pełne, ptaszek lub krzyżyk pokazuje, czy się zgadzają. Przycisk Podpowiedź najpierw wskazuje błędną liczbę, a jeśli jej nie ma, wypełnia kratkę, którą da się teraz wywnioskować.",
    mc_rules_example_title: "Przykład",
    mc_rules_example: "Rozwiązany siatka działań. Środkowy wiersz: 9 − 1 = 8, potem 8 × 3 = 24 - od lewej do prawej, a nie 9 − 3 = 6.",
    mc_history_title: "Historia siatki działań",
    mc_history_magic_title: "Kwadrat magiczny",
    mc_history_magic_p1: "Najbardziej znaną łamigłówką z liczbami od 1 do 9 w siatce 3 × 3 jest kwadrat magiczny, w którym każdy wiersz, kolumna i przekątna dają 15. W Chinach nazywa się Lo Shu (Luoshu) i wiąże się z legendą o żółwiu. Jak stary jest naprawdę, pozostaje niejasne: daty podawane w źródłach bardzo się różnią.",
    mc_history_today_title: "Działania w wierszach i kolumnach",
    mc_history_today_p1: "Siatka działań zachowuje siatkę 3 × 3 z liczbami od 1 do 9, ale w każdym wierszu i kolumnie wymaga innego działania. Takie łamigłówki pojawiają się w zeszytach szkolnych i zbiorach zagadek, czasem ze zwykłą kolejnością działań. PaperGames nie zdołało ustalić, gdzie ta forma pojawiła się po raz pierwszy; nazwa po prostu opisuje to, co widać."
});
I18n.markTextLoaded("pl");
