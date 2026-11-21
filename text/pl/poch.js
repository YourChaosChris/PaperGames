// text/pl/poch.js
// Rules and history texts of poch (pl). Loaded by poch-rules.html and poch-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    poch_rules_title: "Zasady Poch",
    poch_rules_intro: "Poch to stara gra karciana w 32 karty z żetonami. Każde rozdanie ma trzy etapy: za pewne karty wypłaca się pule, gracze licytują swój najlepszy zestaw jednakowych kart, a na końcu wszyscy wykładają karty w ciągach. Po sześciu rozdaniach wygrywa ten, kto ma najwięcej żetonów.",
    poch_rules_basics_title: "Zasady",
    poch_term_pools: "Pule",
    poch_rules_pools: "Plansza ma dziewięć pul: as, król, dama, walet, dziesiątka, małżeństwo (król i dama), sekwencja (7, 8 i 9), Poch oraz pula środkowa. Przed każdym rozdaniem każdy gracz kładzie po jednym żetonie do każdej puli, czyli 9 żetonów. Rozdaje się wszystkie karty poza jedną, która leży odkryta: jej kolor to kolor płatniczy.",
    poch_term_first: "Etap 1: wypłaty",
    poch_rules_first: "Kto ma asa, króla, damę, walet lub dziesiątkę koloru płatniczego, zabiera żetony z tej puli. Król i dama koloru płatniczego razem wygrywają też pulę małżeństwa, a 7, 8 i 9 razem pulę sekwencji. Pula, której nikt nie wygra, bo nikt nie ma karty albo leży ona odkryta, zostaje na następne rozdanie i rośnie.",
    poch_term_pochen: "Etap 2: pochowanie",
    poch_rules_pochen: "Biorą udział tylko gracze mający dwie, trzy lub cztery karty tej samej wartości, ze swoim najlepszym zestawem. Pierwszy gracz po lewej od rozdającego czeka lub stawia 1; potem się wyrównuje, podbija o 1 (łącznie do 4) lub pasuje. Kto nie może zapłacić za wyrównanie, może tylko spasować. Czwórka bije trójkę, trójka bije parę; wyższa wartość bije niższą; ta sama para z kartą koloru płatniczego bije taką bez niej. Najlepszy zestaw wygrywa pulę Poch i wszystkie stawki. Gdy wszyscy czekają, pula Poch zostaje; jedyny gracz z zestawem bierze ją od razu.",
    poch_term_play: "Etap 3: wykładanie kart",
    poch_rules_play: "Zwycięzca pochowania (lub gracz po lewej od rozdającego) wychodzi dowolną kartą. Następną wyższą kartę tego samego koloru musi zagrać ten, kto ją ma, potem kolejną, aż do asa. Gdy brakuje następnej karty – została już zagrana lub leży odkryta – znów wychodzi ten, kto zagrał ostatni. Kto pierwszy zagra ostatnią kartę, wygrywa pulę środkową i od każdego innego gracza po żetonie za każdą kartę, którą jeszcze ma.",
    poch_term_end: "Koniec gry",
    poch_rules_end: "Gra ma sześć rozdań; kończy się wcześniej, jeśli ktoś nie może zapłacić 9 żetonów za rozdanie. Wygrywa ten, kto ma najwięcej żetonów. Żetony są w grze tylko punktami; nie chodzi o pieniądze.",
    poch_term_computer: "Komputer",
    poch_rules_computer: "Łatwy zwykle czeka i gra dowolną kartę. Średni podbija z trójką, czwórką lub wysoką parą i wychodzi kartą, za którą nikt nie może pójść. Trudny liczy też graczy, którzy jeszcze są w licytacji, i planuje ciągi z własnych kart. Przycisk podpowiedzi pokazuje, co zrobiłby Trudny.",
    poch_history_title: "Historia Poch",
    poch_history_origins_title: "Bardzo stara gra",
    poch_history_origins_p1: "Poch ma co najmniej pięćset lat i po raz pierwszy wzmiankowany jest w XV wieku. W Niemczech nazywano go Pochen lub Pochspiel, we Francji La Poque; grano na specjalnej planszy na żetony. Poch zalicza się do poprzedników pokera, a podobne gry z planszą na żetony nadal grane są w wielu krajach.",
    poch_history_here_title: "Poch tutaj",
    poch_history_here_p1: "PaperGames robi z Poch grę dla jednej osoby przeciwko jednemu do trzech komputerów. Ma własną planszę z dziewięcioma pulami i własne sformułowania, trwa sześć rozdań, nie wymaga pieniędzy, a komputery czekają między ruchami."
});
I18n.markTextLoaded("pl");
