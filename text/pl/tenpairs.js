// text/pl/tenpairs.js
// Rules and history texts of tenpairs (pl). Loaded by tenpairs-rules.html and tenpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    tp_rules_title: "Zasady: Pary do dziesięciu",
    tp_rules_intro: "Skreślaj pary cyfr, aż nie zostanie żadna.",
    tp_rules_basics_title: "Zasady",
    tp_term_field: "Pole",
    tp_rules_field: "Cyfry od 1 do 9 w dziewięciu kolumnach, czytane wiersz po wierszu jak tekst.",
    tp_term_pairs: "Pary",
    tp_rules_pairs: "Dwie cyfry skreśla się razem, gdy są równe (3 i 3) albo dają razem 10 (1 i 9, 2 i 8, 3 i 7, 4 i 6, 5 i 5).",
    tp_term_see: "Widzenie się",
    tp_rules_see: "Obie muszą się widzieć: tuż obok siebie w poziomie, w pionie lub po skosie albo z samymi skreślonymi polami między nimi na tej linii. W poziomie liczy się także koniec wiersza: ostatnia cyfra wiersza widzi pierwszą cyfrę następnego i tak dalej w kolejności czytania.",
    tp_term_add: "Dopisywanie",
    tp_rules_add: "Gdy utkniesz, dotknij Dopisz: wszystkie nieskreślone cyfry zostaną dopisane w tej samej kolejności na końcu pola. Najwyżej 5 razy w grze.",
    tp_term_rows: "Puste wiersze",
    tp_rules_rows: "Wiersz, którego wszystkie dziewięć pól jest skreślonych, znika.",
    tp_term_end: "Wygrana i przegrana",
    tp_rules_end: "Wygrywasz, gdy wszystkie cyfry są skreślone. Przegrywasz, gdy nie ma już żadnej pary ani dopisywania albo gdy pole urośnie do ponad 40 wierszy.",
    tp_term_start: "Start",
    tp_rules_start: "Klasyczny: 1 2 3 4 5 6 7 8 9, potem 1 1 1 2 1 3 1 4 1 5 1 6 1 7 1 8 1 9 (liczby od 1 do 19 bez 10). Losowy: trzy, cztery albo pięć wierszy; im łatwiejszy poziom, tym więcej par stoi tuż obok siebie.",
    tp_term_help: "Pomoc",
    tp_rules_help: "Cofnij cofa dowolnie wiele kroków. Podpowiedź zaznacza parę do skreślenia albo mówi, że zostało tylko dopisywanie.",
    tp_rules_example_title: "Przykład",
    tp_rules_example: "Klasyczny start. Jedynka w lewym górnym rogu i jedynka pod nią widzą się (w pionie) i są równe. Dziewiątka na końcu pierwszego wiersza i jedynka na początku drugiego widzą się przez koniec wiersza i dają razem 10.",
    tp_history_title: "Historia gry Pary do dziesięciu",
    tp_history_origins_title: "Ze szkolnych zeszytów",
    tp_history_origins_p1: "Pochodzenie tej łamigłówki nie jest udokumentowane w źródłach, które PaperGames mogło sprawdzić. Artykuł z 2011 roku w rosyjskim serwisie Habr wspomina ją ze szkoły i studiów: grano w nią w zeszytach w kratkę, pod nazwami takimi jak „liczby”, „cyfry”, „pestki” czy „19” – oficjalnej nazwy nie było. Tam gra zaczyna się od liczb od 1 do 19 (bez 10) zapisanych w rzędzie, czyli od tych samych cyfr co klasyczny start tutaj, a gdy nie ma już pary, pozostałe cyfry przepisuje się na koniec.",
    tp_history_name_title: "Nazwa",
    tp_history_name_p1: "„Pary do dziesięciu” mówi po prostu, o co chodzi. Kilka aplikacji wykorzystuje ten sam pomysł pod własnymi nazwami; PaperGames ich nie używa. Pary po skosie oraz granice 5 dopisań i 40 wierszy to zasady PaperGames."
});
I18n.markTextLoaded("pl");
