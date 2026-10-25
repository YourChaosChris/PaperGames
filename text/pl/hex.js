// text/pl/hex.js
// Rules and history texts of hex (pl). Loaded by hex-rules.html and hex-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    hex_rules_title: "Zasady Hex",
    hex_rules_intro: "Krótkie przypomnienie zasad, według których PaperGames rozgrywa Hex - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    hex_rules_basics_title: "Podstawowa idea",
    hex_term_setup: "Ustawienie startowe",
    hex_rules_setup: "Plansza to romb złożony z sześciokątnych pól. Czerwony posiada górną i dolną krawędź, Niebieski lewą i prawą krawędź. Czerwony rusza się jako pierwszy.",
    hex_term_moving: "Wykonywanie ruchu",
    hex_rules_moving: "W swojej turze postaw jeden kamień swojego koloru na dowolnym pustym polu - nie ma bicia, a kamienie po postawieniu nigdy się nie ruszają.",
    hex_term_swap: "Zasada zamiany",
    hex_rules_swap: "Pierwszy ruch daje przewagę, dlatego obowiązuje zasada zamiany, chyba że wyłączysz ją przed grą. Po pierwszym kamieniu Czerwonego Niebieski może zamiast stawiać kamień dotknąć „Zamień”: gracze zamieniają się kolorami, pierwszy kamień należy teraz do gracza, który był Niebieskim, a drugi gra dalej jako Niebieski. Czerwony nadal łączy górę z dołem, Niebieski lewą stronę z prawą. Komputer zamienia, gdy pierwszy kamień leży na środku planszy.",
    hex_term_win: "Zwycięstwo",
    hex_rules_win: "Zbuduj nieprzerwany łańcuch swoich kamieni łączący twoje dwie krawędzie. Hex nigdy nie może zakończyć się remisem: gdy plansza jest pełna, zawsze gwarantowane jest istnienie łańcucha jednego z graczy, niezależnie od tego, czy któraś ze stron próbowała zablokować drugą.",
    hex_rules_end_title: "Uwaga o strategii",
    hex_term_blocking: "Atak i obrona to ten sam ruch",
    hex_rules_blocking: "Ponieważ remis jest niemożliwy, blokowanie połączenia przeciwnika i budowanie własnego to w gruncie rzeczy to samo zadanie, tylko widziane z dwóch stron - pole, które pomaga twojemu łańcuchowi, bardzo często jednocześnie przerywa łańcuch przeciwnika.",
    hex_history_title: "Historia Hex",
    hex_history_origins_title: "Wynaleziona dwukrotnie",
    hex_history_origins_p1: "Hex po raz pierwszy wynalazł w 1942 roku duński matematyk, poeta i projektant Piet Hein, który przedstawił ją w Danii pod nazwą \"Polygon\", zastanawiając się, czy gra w stylu mapy czterokolorowej mogłaby kiedykolwiek zakończyć się remisem.",
    hex_history_origins_p2: "Niezależnie wynalazł ją ponownie w 1948 roku matematyk John Nash - później laureat Nagrody Nobla w dziedzinie ekonomii i bohater filmu \"Piękny umysł\" - gdy był studentem na Princeton, gdzie studenci grali w nią na sześciokątnych płytkach podłogowych w łazienkach i nazywali ją \"Nash\".",
    hex_history_origins_p3: "Gra dotarła do szerszej publiczności w 1957 roku, gdy Martin Gardner napisał o niej w swojej rubryce \"Mathematical Games\" w Scientific American, nadając jej nazwę \"Hex\", która przylgnęła do niej już na zawsze.",
    hex_history_math_title: "Ulubienica matematyków",
    hex_history_math_p1: "Hex to ulubiony temat teorii gier i topologii ze względu na klarowny, dowodliwy fakt: gra nigdy nie może zakończyć się remisem - konsekwencja tej samej matematyki, która stoi za twierdzeniem Brouwera o punkcie stałym - co oznacza też, że argument \"kradzieży strategii\" dowodzi, iż pierwszy gracz musi mieć zwycięską strategię, choć nikt nie wie, jaka dokładnie jest ta strategia dla większych plansz.",
    hex_history_math_p2: "Całkowite rozwiązanie Hex staje się dramatycznie trudniejsze wraz ze wzrostem planszy: małe plansze (do około 10x10) zostały w pełni rozwiązane przez przeszukiwanie komputerowe, ale standardowy turniejowy rozmiar 11x11 i większe pozostają nierozwiązane, co czyni Hex wciąż aktualnym celem zarówno dla badań nad AI do gier, jak i dla kombinatorycznej teorii gier.",
    hex_history_version_title: "Ta wersja",
    hex_history_version_p1: "PaperGames rozgrywa się na planszy 9x9 - rozmiarze, który utrzymuje partie wygodnie krótsze, wciąż dając zarówno strategii łączenia, jak i blokowania prawdziwe pole do popisu."
});
I18n.markTextLoaded("pl");
