// text/pl/shogi.js
// Rules and history texts of shogi (pl). Loaded by shogi-rules.html and shogi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    shogi_rules_title: "Zasady Shogi",
    shogi_rules_intro: "Krótkie przypomnienie zasad, według których PaperGames rozgrywa Shogi (japońskie szachy) - przydatne, jeśli znasz szachy międzynarodowe, bo kilka pomysłów działa tu inaczej.",
    shogi_rules_basics_title: "Podstawowa idea",
    shogi_term_board: "Plansza i bierki",
    shogi_rules_board: "Każda strona ma 20 bierek na planszy 9x9: Króla, Wieżę, Gońca, dwóch Złotych Generałów, dwóch Srebrnych Generałów, dwóch Skoczków, dwie Lance i dziewięć Pionków. Bierki to zwykłe pięciokąty skierowane w stronę przeciwnika - to, do kogo należy bierka, wynika z kierunku, w który jest zwrócona, a nie z koloru. Czarny zawsze rusza się jako pierwszy.",
    shogi_term_promotion: "Promocja",
    shogi_rules_promotion: "Każda bierka poza Królem i Złotym Generałem może się promować do silniejszej formy, gdy wchodzi do trzech najdalszych rzędów planszy, wychodzi z nich albo porusza się w ich obrębie. Promocja jest opcjonalna, z wyjątkiem sytuacji, gdy Pionek lub Lanca dotrą do samego ostatniego rzędu, albo Skoczek dotrze do jednego z dwóch ostatnich rzędów - wtedy jest wymuszona, bo inaczej bierka nigdy nie miałaby już żadnego legalnego ruchu.",
    shogi_term_drops: "Bicie i zrzuty",
    shogi_rules_drops: "Zbicie bierki nie usuwa jej z gry: zmienia ona stronę, wraca do swojej niepromowanej formy i trafia do puli bierek gracza, który ją zbił. W kolejnej turze ten gracz może, zamiast ruszać bierkę już stojącą na planszy, zrzucić bierkę ze swojej puli na dowolne puste pole - to jeden z charakterystycznych pomysłów Shogi, dzięki któremu partiom rzadko brakuje materiału.",
    shogi_term_drop_limits: "Ograniczenia zrzutu",
    shogi_rules_drop_limits: "Pionka lub Lancy nie można zrzucić na ostatni rząd, a Skoczka nie można zrzucić na żaden z dwóch ostatnich rzędów, bo bierki te nie miałyby tam żadnego legalnego ruchu. Pionka nie można zrzucić na kolumnę, na której stoi już twój niepromowany Pionek, a zrzut Pionka nigdy nie może od razu dać mata (może za to dać szacha, tylko nie mata).",
    shogi_rules_end_title: "Jak kończy się partia",
    shogi_term_win: "Zwycięstwo",
    shogi_rules_win: "Król w szachu, który nie ma jak uciec, zablokować ani zbić szachującej bierki, jest zamatowany - gra kończy się natychmiast.",
    shogi_term_resignation: "Poddanie się",
    shogi_rules_resignation: "Gracz może poddać się w dowolnym momencie, co natychmiast kończy grę na korzyść przeciwnika.",
    shogi_term_sennichite: "Powtórzenie (sennichite)",
    shogi_rules_sennichite: "Jeśli ta sama pozycja - te same bierki na tych samych polach, te same bierki w rękach obu graczy i ten sam gracz na ruchu - wystąpi cztery razy, gra kończy się remisem. Wyjątek: jeśli jeden gracz przez całe powtórzenie szachował każdym swoim ruchem, to on przegrywa. PaperGames stosuje tę zasadę automatycznie.",
    shogi_history_title: "Historia Shogi",
    shogi_history_origins_title: "Z Indii, przez Azję Południowo-Wschodnią",
    shogi_history_origins_p1: "Podobnie jak szachy międzynarodowe i Xiangqi, Shogi ostatecznie wywodzi się z czaturangi, starożytnej indyjskiej gry wojennej, która rozprzestrzeniała się po Azji szlakami handlowymi od mniej więcej VI wieku n.e. Do Japonii dotarła gdzieś przed X wiekiem, najprawdopodobniej przez Azję Południowo-Wschodnią i Chiny, i przez kolejne stulecia była przystosowywana do wyraźnie japońskich form.",
    shogi_history_origins_p2: "Wczesne japońskie warianty szachów były znacznie większe od dzisiejszej gry - niektóre historyczne formy, jak Dai Shogi czy ogromne Tai Shogi, używały plansz 15x15 pól lub większych, z ponad setką bierek na stronę. Wersja 9x9 z 20 bierkami, w którą gra się dziś, wyłoniła się jako standard mniej więcej w XVI wieku.",
    shogi_history_spread_title: "Skąd wzięła się zasada zrzutu",
    shogi_history_spread_p1: "Charakterystyczna cecha Shogi - że zbita bierka zmienia stronę i można ją zrzucić z powrotem na planszę - nie ma odpowiednika w szachach ani w Xiangqi i odróżnia tę grę od każdej innej w tym zbiorze. Historycy zwykle łączą jej powstanie ze zwyczajem, powszechnym wśród walczących ze sobą japońskich klanów samurajów, wcielania zdobytych żołnierzy bezpośrednio do armii zwycięzcy, zamiast traktować ich wyłącznie jako straty.",
    shogi_history_spread_p2: "Niezależnie od dokładnego pochodzenia, zasada zrzutu przekształca charakter gry: materiał niemal nigdy nie znika z niej na stałe, partie rzadko grzęzną w prostej wymianie bierek, a agresywny atak może być podsycany bez końca tym, co atakujący już zdobył.",
    shogi_history_modern_title: "Żywa tradycja zawodowa",
    shogi_history_modern_p1: "Shogi podtrzymuje w Japonii nieprzerwaną tradycję profesjonalnych turniejów od okresu Edo (XVII-XIX wiek), gdy szogunat Tokugawa finansował dziedziczny system domów profesjonalnych graczy - rodowód, który przekształcił się we współczesne Japońskie Stowarzyszenie Shogi, założone w 1924 roku.",
    shogi_history_modern_p2: "Komputerowe Shogi długo pozostawało w tyle za komputerowymi szachami z powodu ogromnego współczynnika rozgałęzień wynikającego z zasady zrzutu, ale w połowie lat 2010. programy takie jak Ponanza zdecydowanie pokonały czołowych profesjonalnych graczy, wywołując te same debaty o grze człowieka z komputerem, jakie szachy przeszły dekadę lub dwie wcześniej."
});
I18n.markTextLoaded("pl");
