// text/pl/shapesort.js
// Rules and history texts of shapesort (pl). Loaded by shapesort-rules.html and shapesort-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    shapesort_rules_title: "Zasady sortowania kształtów",
    shapesort_rules_intro: "Łamigłówka sortowania z kształtami zamiast kolorów: przesuwaj kamienie, aż w każdej probówce będzie tylko jeden kształt.",
    shapesort_rules_basics_title: "Zasady",
    shapesort_term_tubes: "Probówki",
    shapesort_rules_tubes: "Każda probówka mieści tyle kamieni, ile wybrano w polu Kamienie w probówce: 4, 6, 8 lub 10. Na początku kamienie są wymieszane, a dwie probówki są puste.",
    shapesort_term_move: "Ruch",
    shapesort_rules_move: "Dotknij probówki: jej górny kamień zostaje zaznaczony razem z kamieniami tego samego kształtu tuż pod nim. Potem dotknij innej probówki. Kamienie trafiają tam, jeśli jest pusta albo ma na górze ten sam kształt - tyle, ile się zmieści. Ponowne dotknięcie zaznaczonej probówki odkłada kamienie.",
    shapesort_term_goal: "Cel",
    shapesort_rules_goal: "Łamigłówka jest rozwiązana, gdy każda probówka jest pusta albo pełna kamieni tego samego kształtu.",
    shapesort_term_shapes: "Kształty",
    shapesort_rules_shapes: "Koło, kwadrat, trójkąt, gwiazda, serce, krzyż, romb i księżyc. Różnią się obrysem; niektóre są wypełnione, inne tylko obrysowane, ale to tylko dodatkowa pomoc.",
    shapesort_term_levels: "Poziomy",
    shapesort_rules_levels: "Łatwy: 4 kształty w 6 probówkach. Średni: 6 kształtów w 8 probówkach. Trudny: 8 kształtów w 10 probówkach. Liczbę kamieni w probówce wybiera się osobno; przy większej liczbie kształty są mniejsze, a probówki wyższe. Na wąskich ekranach probówki stoją w kilku rzędach.",
    shapesort_term_tools: "Cofnij, Przetasuj, Podpowiedź",
    shapesort_rules_tools: "„Cofnij” cofa dowolnie wiele ruchów. „Przetasuj” rozdaje nową łamigłówkę. „Podpowiedź” zaznacza dwie probówki: przenieś górne kamienie z pierwszej do drugiej. Każdą łamigłówkę sprawdzono pod kątem rozwiązywalności; jeśli utkniesz, podpowiedź to powie i możesz cofnąć kilka ruchów.",
    shapesort_rules_example_title: "Przykład",
    shapesort_rules_example: "Obrazek pokazuje probówki w trakcie gry. Zaznaczone kamienie na górze pierwszej probówki mogą trafić do probówki z tym samym kształtem na górze albo do pustej.",
    shapesort_history_title: "Historia łamigłówek sortowania",
    shapesort_history_origins_title: "Elementy, pręty i zasady",
    shapesort_history_origins_p1: "Łamigłówki, w których elementy przesuwa się między pojemnikami według stałych zasad, są stare. W wieżach Hanoi, opublikowanych w 1883 roku przez francuskiego matematyka Édouarda Lucasa, krążki wędrują pojedynczo między trzema prętami, nigdy większy na mniejszy.",
    shapesort_history_sort_title: "Sortowanie według rodzaju",
    shapesort_history_sort_p1: "W ostatnich latach pojawiło się wiele łamigłówek, w których wymieszane elementy przesuwa się między pojemnikami, aż w każdym zostanie jeden rodzaj - głównie jako gry na telefon i prawie zawsze z kolorami. Na czarno-białym ekranie e-papieru kolory nie działają, dlatego PaperGames sortuje kształty.",
    shapesort_history_modern_title: "Jak PaperGames tworzy każdą łamigłówkę",
    shapesort_history_modern_p1: "Każda łamigłówka jest rozdawana losowo. Następnie program rozwiązujący szuka sposobu, by ją całkowicie posortować; używane jest tylko rozdanie, dla którego go znajdzie, i żadna probówka nie jest na początku gotowa. Ten sam program daje podpowiedzi."
});
I18n.markTextLoaded("pl");
