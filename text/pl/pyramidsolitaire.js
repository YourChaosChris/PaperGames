// text/pl/pyramidsolitaire.js
// Rules and history texts of pyramidsolitaire (pl). Loaded by pyramidsolitaire-rules.html and pyramidsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    pyramidsolitaire_rules_title: "Zasady Piramidy (pasjansa)",
    pyramidsolitaire_rules_intro: "Krótkie przypomnienie tego, jak PaperGames prowadzi rozgrywkę w Piramidę - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    pyramidsolitaire_rules_basics_title: "Podstawowa idea",
    pyramidsolitaire_term_layout: "Układ",
    pyramidsolitaire_rules_layout: "28 kart rozdaje się odkrytych w trójkąt z 7 rzędów: 1 karta na górze, 2 pod nią, i tak dalej aż do 7 kart w dolnym rzędzie, każda karta spoczywa nad dwiema kartami pod spodem i między nimi. Pozostałe 24 karty tworzą stos dobierania, z którego dobiera się po jednej karcie odkrytej na stos odrzuconych kart.",
    pyramidsolitaire_term_pairing: "Parowanie do 13",
    pyramidsolitaire_rules_pairing: "Karty liczą się tu według swojej wartości: As = 1, od 2 do 10 zgodnie z nadrukiem, Walet = 11, Dama = 12, Król = 13. Usuń dwie dostępne karty, których wartości sumują się dokładnie do 13 - na przykład 5 i 8, 9 i 4, albo Walet (11) i 2. Król sam w sobie jest już wart 13, więc usuwa się go bez pary.",
    pyramidsolitaire_term_exposed: "Odkryte karty",
    pyramidsolitaire_rules_exposed: "Kartę w piramidzie można wziąć dopiero wtedy, gdy obie karty spoczywające na niej w rzędzie poniżej znikną - dolny rząd jest odkryty od razu, ponieważ nic pod nim nie leży. Usunąć można wyłącznie odkryte karty piramidy oraz aktualną wierzchnią kartę stosu odrzuconych kart; zakryta karta piramidy jest wyświetlana przyciemniona i nie można jej jeszcze wziąć, mimo że widać, jaka to karta.",
    pyramidsolitaire_term_stock: "Stos dobierania, stos odrzuconych kart i rozdania",
    pyramidsolitaire_rules_stock: "Dotknij stosu dobierania, aby odkryć jego wierzchnią kartę na stos odrzuconych kart, po jednej karcie na raz - do pary można użyć tylko wierzchniej karty stosu odrzuconych kart. Gdy stos dobierania się wyczerpie, kolejne dotknięcie rozdaje cały stos odrzuconych kart z powrotem do stosu dobierania, dzięki czemu możesz przejść przez niego ponownie, do 2 razy w ciągu gry. Liczba pozostałych rozdań jest zawsze widoczna obok stosu dobierania.",
    pyramidsolitaire_rules_example_title: "Przykład krok po kroku",
    pyramidsolitaire_term_example: "Usuwanie pary",
    pyramidsolitaire_rules_example: "Załóżmy, że w dolnym rzędzie jest odkryta 9, a gdzie indziej w piramidzie odkryta 4 - kliknięcie najpierw 9, a potem 4 usuwa obie, ponieważ 9 + 4 = 13. Jeśli ta 4 była jedyną kartą spoczywającą na 6 w rzędzie powyżej, a jej sąsiadka pod tą 6 też już zniknęła, 6 staje się odkryta i również można ją sparować - na przykład z 7 leżącą na wierzchu stosu odrzuconych kart. Usuwanie kart w ten sposób stopniowo odsłania kolejne rzędy powyżej, aż w idealnym przypadku znika cała piramida.",
    pyramidsolitaire_rules_end_title: "Kończenie gry",
    pyramidsolitaire_term_win: "Zwycięstwo",
    pyramidsolitaire_rules_win: "Gra jest wygrana w chwili, gdy wszystkie 28 kart piramidy zostanie usuniętych - stos dobierania i stos odrzuconych kart nie muszą przy tym zostać opróżnione, co jest standardowym warunkiem zwycięstwa stosowanym w większości wersji tej gry.",
    pyramidsolitaire_term_lose: "Utknięcie bez ruchów",
    pyramidsolitaire_rules_lose: "Jeśli stos dobierania jest pusty, nie zostały żadne rozdania, a wśród odkrytych kart piramidy i wierzchniej karty stosu odrzuconych kart nie ma ani Króla, ani pary sumującej się do 13, gra kończy się przegraną - PaperGames pokazuje to wyraźnie, zamiast zostawiać cię bez ruchów i bez wyjaśnienia.",
    pyramidsolitaire_history_title: "Historia Piramidy (pasjansa)",
    pyramidsolitaire_history_origins_title: "Starsza, słabo udokumentowana gra",
    pyramidsolitaire_history_origins_p1: "Piramida należy do tej samej dużej rodziny jednoosobowych gier karcianych \"cierpliwości\" co Klondike i FreeCell, z których większość rozprzestrzeniła się w Europie i Ameryce Północnej w XIX i na początku XX wieku pod różnymi regionalnymi nazwami i z drobnymi różnicami zasad. Podobnie jak w przypadku większości klasycznych pasjansów, dokładne pochodzenie Piramidy - kto pierwszy ułożył 28 kart w trójkąt i zaczął parować je do 13 - nie da się przypisać do jednego udokumentowanego źródła ani daty.",
    pyramidsolitaire_history_origins_p2: "Jasne jest natomiast to, co odróżnia ją od reszty rodziny: podczas gdy Klondike, FreeCell i Pająk w gruncie rzeczy polegają na budowaniu malejących sekwencji kart, definiującym mechanizmem Piramidy jest arytmetyka - usuwanie par, których wartości sumują się dokładnie do 13, oraz samotnego Króla, który sam w sobie jest już wart 13. Ta zasada parowania do 13 to najbardziej charakterystyczny historycznie element tej gry i najwyraźniejszy sposób odróżnienia jej od kuzynów budujących sekwencje.",
    pyramidsolitaire_history_spread_title: "Znów dołączona do Windows",
    pyramidsolitaire_history_spread_p1: "Piramida krążyła już od lat w drukowanych poradnikach o grach karcianych i wczesnych cyfrowych zbiorach pasjansów, ale naprawdę masowego odbiorcę zdobyła w taki sam sposób jak dekady wcześniej Klondike: dzięki dołączeniu do Windows. Microsoft umieścił ją wśród gier w Microsoft Solitaire Collection, wbudowanej w Windows 8 i nowsze wersje, obok Klondike, Pająka i FreeCell.",
    pyramidsolitaire_history_spread_p2: "Dla ogromnej liczby graczy, dla których pasjans w Windows oznaczał konkretnie Klondike, Solitaire Collection była dla wielu pierwszym prawdziwym zetknięciem ze stylem pasjansa opartym na parowaniu, który reprezentuje Piramida - zupełnie innym rodzajem układanki ukrytym pod tą samą znajomą nazwą \"pasjans\".",
    pyramidsolitaire_history_modern_title: "Ta wersja",
    pyramidsolitaire_history_modern_p1: "PaperGames prowadzi rozgrywkę według standardowych zasad: prawdziwie nowe tasowanie w każdej grze, wszystkie 28 kart piramidy rozdanych odkrytych od początku, stos dobierania/stos odrzuconych kart dobierany po jednej karcie z maksymalnie 2 rozdaniami oraz powszechny warunek zwycięstwa \"rozbierz piramidę\" - stos dobierania i stos odrzuconych kart nie muszą przy tym zostać opróżnione, tak jak robi to większość nowoczesnych implementacji tej gry."
});
I18n.markTextLoaded("pl");
