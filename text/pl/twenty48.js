// text/pl/twenty48.js
// Rules and history texts of twenty48 (pl). Loaded by twenty48-rules.html and twenty48-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    twenty48_rules_title: "Zasady 2048",
    twenty48_rules_intro: "Krótkie przypomnienie zasad, według których PaperGames rozgrywa 2048 - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    twenty48_rules_basics_title: "Podstawowa idea",
    twenty48_term_board: "Plansza i przesuwanie",
    twenty48_rules_board: "Każdy ruch przesuwa wszystkie kafelki na planszy 4x4 tak daleko, jak to możliwe, w jednym kierunku - w górę, w dół, w lewo lub w prawo. Po każdym ruchu, który faktycznie coś przesunie, na losowym pustym polu pojawia się nowy kafelek (zwykle 2, czasem 4).",
    twenty48_term_merging: "Łączenie",
    twenty48_rules_merging: "Gdy podczas przesuwania zderzą się dwa kafelki o tej samej wartości, łączą się w jeden kafelek o wartości równej ich sumie, dodając tę nową wartość do twojego wyniku. Każdy kafelek może połączyć się tylko raz na ruch, więc trzy równe kafelki suwające się razem łączą tylko wiodącą parę, a trzeci zostawiają bez zmian, zamiast łączyć się kaskadowo.",
    twenty48_rules_end_title: "Jak kończy się gra",
    twenty48_term_win: "Osiągnięcie 2048",
    twenty48_rules_win: "Połącz kafelki aż do uzyskania kafelka 2048 i wygrałeś - ale gra się na tym nie kończy. Graj dalej, by jeszcze bardziej podbić swój wynik (i planszę).",
    twenty48_term_loss: "Brak dalszych ruchów",
    twenty48_rules_loss: "Gra kończy się w chwili, gdy plansza jest całkowicie pełna i żadne dwa sąsiadujące kafelki nie mają tej samej wartości, więc żaden ruch - w żadnym kierunku - niczego by nie zmienił.",
    twenty48_history_title: "Historia gry 2048",
    twenty48_history_origins_title: "Zbudowana na Threes",
    twenty48_history_origins_p1: "2048 powstało w marcu 2014 roku za sprawą 19-letniego włoskiego programisty Gabriele Cirulliego w ciągu jednego weekendu, jako osobiste ćwiczenie w szybkim budowaniu kompletnej gry. Cirulli nie wymyślił podstawowego mechanizmu od zera: 2048 to jawny klon gry o nazwie 1024 (autorstwa Veewo Studio), która z kolei zainspirowana była wcześniejszą grą o nazwie Threes! (autorstwa Ashera Vollmera, Grega Wohlwenda i Jimmy'ego Hinsona), rozwijaną starannie przez ponad rok.",
    twenty48_history_origins_p2: "Cirulli od pierwszego dnia udostępnił kod źródłowy 2048 za darmo na otwartej licencji, co okazało się mieć ogromne znaczenie: zamiast blokować klony, zaprosił je do powstawania, a gra rozprzestrzeniała się dzięki niekończącemu się i legalnemu odtwarzaniu, a nie tylko graniu.",
    twenty48_history_spread_title: "Wirusowa sensacja pełna klonów",
    twenty48_history_spread_p1: "Gra stała się wirusowym hitem w ciągu kilku dni od wydania, ponoć przyciągając miliony graczy w pierwszych dwóch tygodniach, i wywołała ogromną falę klonów, portów i wariantów - przemalowanych wersji podmieniających wszystko, od emoji po postacie z popkultury, a także wariantów o innych rozmiarach, kolorowych kafelkach i wersji trójwymiarowych.",
    twenty48_history_spread_p2: "Ta wersja w PaperGames celowo zachowuje oryginalną planszę 4x4 oraz szansę pojawienia się dwójki lub czwórki w proporcji 90%/10%, zamiast wybierać jeden z tych wariantów - taki sam wybór, jaki ten zbiór gier stosuje wszędzie indziej, stawiając na standardowy, dobrze znany zestaw zasad zamiast nowatorskiej odmiany.",
    twenty48_history_modern_title: "Mała plansza, poważnie badana",
    twenty48_history_modern_p1: "Mimo prostych zasad, optymalna gra w 2048 okazuje się naprawdę trudnym problemem przeszukiwania z powodu losowości w pojawianiu się kafelków: silni komputerowi gracze używają przeszukiwania typu expectimax (ważącego ruchy według prawdopodobieństwa każdego możliwego kolejnego kafelka), a nie zwykłego przeszukiwania minimax, jakie umożliwia deterministyczna gra taka jak szachy.",
    twenty48_history_modern_p2: "Najlepiej udokumentowani komputerowi gracze potrafią z dużym prawdopodobieństwem osiągnąć kafelek 32768, a sporadycznie osiągali nawet 65536 - dwa podwojenia poza kafelek, który większość ludzkich graczy cieszy się, widząc choć raz w życiu."
});
I18n.markTextLoaded("pl");
