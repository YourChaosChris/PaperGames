// text/pl/linkpairs.js
// Rules and history texts of linkpairs (pl). Loaded by linkpairs-rules.html and linkpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    linkpairs_rules_title: "Zasady: Połącz pary",
    linkpairs_rules_intro: "Połącz każdą parę jednakowych symboli linią. Linie nie mogą się krzyżować, a razem wypełniają całą planszę.",
    linkpairs_rules_basics_title: "Zasady",
    linkpairs_term_board: "Plansza",
    linkpairs_rules_board: "Kwadratowa plansza z pól. Na niektórych polach jest symbol – cyfra albo zwierzę – i każdy symbol występuje dokładnie dwa razy.",
    linkpairs_term_lines: "Linie",
    linkpairs_rules_lines: "Połącz każdą parę linią. Linia biegnie z pola na pole, poziomo i pionowo, nigdy po skosie. Linie nie mogą się krzyżować, dzielić pola ani przechodzić przez inny symbol.",
    linkpairs_term_goal: "Cel",
    linkpairs_rules_goal: "Łamigłówka jest rozwiązana, gdy każda para jest połączona, a każde pole zajmuje jakaś linia. Każda łamigłówka ma dokładnie jedno rozwiązanie.",
    linkpairs_term_draw: "Rysowanie",
    linkpairs_rules_draw: "Przeciągnij palcem od symbolu albo stuknij symbol, a potem kolejno pola. Gdy wejdziesz na inną linię, zostanie ona skrócona. Stuknij pole linii, aby linia się na nim kończyła; od tego pola możesz rysować dalej. Stuknięcie symbolu zaczyna jego linię od nowa – stuknij symbol na początku linii, aby ją usunąć.",
    linkpairs_term_symbols: "Cyfry albo zwierzęta",
    linkpairs_rules_symbols: "W menu wybierasz cyfry albo zwierzęta. Każde pole linii nosi małą kopię jej symbolu, więc bez kolorów widać, która linia należy do której pary.",
    linkpairs_term_tools: "Cofnij i Podpowiedź",
    linkpairs_rules_tools: "„Cofnij” cofa dowolnie wiele kroków. „Podpowiedź” rysuje w całości jedną prawidłową linię; linie, które przeszkadzają, są skracane.",
    linkpairs_term_levels: "Poziomy",
    linkpairs_rules_levels: "Łatwy: 5 x 5. Średni: 7 x 7. Trudny: 9 x 9.",
    linkpairs_rules_example_title: "Rozwiązany przykład",
    linkpairs_rules_example: "Obrazek pokazuje rozwiązaną łamigłówkę 5 x 5: każda para jest połączona, żadne linie się nie krzyżują i każde pole jest wykorzystane.",
    linkpairs_history_title: "Historia łamigłówek z łączeniem",
    linkpairs_history_origins_title: "Wczesne odmiany",
    linkpairs_history_origins_p1: "W 1897 roku nieco inna odmiana tej łamigłówki ukazała się w rubryce Sama Loyda w gazecie Brooklyn Daily Eagle. W 1917 roku Henry Ernest Dudeney zamieścił wersję z parami liter w swojej książce „Amusements in Mathematics”, jako łamigłówkę dla kierowców.",
    linkpairs_history_japan_title: "Cyfry i litery",
    linkpairs_history_japan_p1: "W Japonii wydawnictwo łamigłówek Nikoli spopularyzowało ją w dwóch odmianach: z parami liter i z parami cyfr. Ogólna nazwa łamigłówki to Numberlink. Łamigłówkę uważa się za dobrze zrobioną, gdy ma dokładnie jedno rozwiązanie, a linie wypełniają każde pole.",
    linkpairs_history_modern_title: "Jak PaperGames tworzy łamigłówki",
    linkpairs_history_modern_p1: "Łamigłówki zostały przygotowane wcześniej przez własny generator PaperGames: układa on losowe linie, które razem przechodzą przez każde pole, a potem solver sprawdza, że jest dokładnie jeden sposób połączenia par. Jeśli znajdzie drugi, jedna linia zostaje podzielona na dwie pary; linie, których końce się stykają, są z powrotem łączone, dopóki rozwiązanie pozostaje jedyne."
});
I18n.markTextLoaded("pl");
