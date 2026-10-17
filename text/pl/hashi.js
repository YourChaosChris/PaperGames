// text/pl/hashi.js
// Rules and history texts of hashi (pl). Loaded by hashi-rules.html and hashi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    puzzle_rules_hint: "Przycisk „Podpowiedź” pomaga w trzech etapach. Pierwsze naciśnięcie zaznacza, gdzie jest następny krok. Drugie podaje powód, czyli zasadę, która tam działa. Trzecie wykonuje krok (wpisuje liczbę albo buduje most). Podpowiedź wychodzi od twojego obecnego stanu: jeśli gdzieś stoi błędna liczba albo błędny most, najpierw ci to powie. Nigdy nie zgaduje – jeśli dalej da się iść tylko przez próbowanie, mówi to uczciwie. Podpowiedzi są bez limitu. Łamigłówka rozwiązana z podpowiedziami liczy się normalnie jako wygrana; statystyki pokazują dodatkowo, ile wygranych było z podpowiedziami.",
    hashi_rules_title: "Zasady Hashiwokakero",
    hashi_rules_intro: "Krótkie przypomnienie, jak PaperGames prowadzi rozgrywkę w Hashiwokakero (dosłownie „zbuduj most!”, po angielsku zwykle nazywane po prostu „Hashi” lub „Bridges”) - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz. Zamiast wpisywać cyfry, rysujesz mosty między ponumerowanymi wyspami, aż cała mapa stanie się jedną spójną siecią.",
    hashi_rules_basics_title: "Podstawowa idea",
    hashi_term_board: "Wyspy",
    hashi_rules_board: "Plansza to siatka, w której niektóre pola zawierają ponumerowane kółko - „wyspę” - a reszta to puste morze. Numer każdej wyspy mówi dokładnie, ile końców mostów musi jej dotykać - ani więcej, ani mniej.",
    hashi_term_bridges: "Rysowanie mostów",
    hashi_rules_bridges: "Most zawsze biegnie idealnie prosto, poziomo lub pionowo, bezpośrednio między dwiema wyspami, między którymi jest całkowicie wolna linia - żadna inna wyspa ani żaden inny most krzyżujący się pod kątem prostym nie może stać na drodze. Dwie wyspy może łączyć maksymalnie dwa równoległe mosty (most „podwójny”), liczące podwójnie do numeru obu wysp, ale nigdy trzy lub więcej, a most nigdy nie może biec po skosie.",
    hashi_term_crossing: "Bez krzyżowania",
    hashi_rules_crossing: "Mosty nigdy nie mogą się krzyżować. Jeśli most poziomy i pionowy musiałyby się skrzyżować, aby oba istniały, można zbudować tylko jedno z tych dwóch połączeń - druga para wysp po prostu nie może zostać połączona bezpośrednio, dopóki krzyżujący ją most stoi.",
    hashi_term_goal: "Cel",
    hashi_rules_goal: "Połącz wszystkie wyspy w jedną sieć - musi być możliwe dotarcie z dowolnej wyspy do każdej innej po mostach - jednocześnie sprawiając, że liczba mostów każdej wyspy dokładnie odpowiada jej numerowi. Dopasowanie wszystkich numerów bez pełnej spójności lub połączenie wszystkiego bez dopasowania wszystkich numerów to oba przypadki niedokończone.",
    hashi_term_input: "Dodawanie i usuwanie mostów",
    hashi_rules_input: "Dotknij linii między dwiema wyspami (lub dotknij najpierw jednej, potem drugiej wyspy), aby dodać most: pierwsze dotknięcie rysuje pojedynczy most, drugie zamienia go w most podwójny, a trzecie usuwa go z powrotem. Wyspa, która ma już dokładnie wymaganą liczbę, jest wyróżniona; wyspa z za dużą liczbą mostów jest oznaczana tak samo jak przekroczona suma w Kakuro - to sygnał do cofnięcia, a nie ślepy zaułek.",
    hashi_term_difficulty: "Poziom trudności",
    hashi_rules_difficulty: "Łamigłówki Łatwe, Średnie i Trudne używają coraz większych plansz z większą liczbą wysp (odpowiednio około 11, 20 i 30), co oznacza więcej nakładających się na siebie numerów naraz, ale wciąż te same zasady.",
    hashi_rules_example_title: "Rozwiązany przykład",
    hashi_term_example: "Trzy wyspy w kształcie L",
    hashi_rules_example_p1: "Załóżmy, że wyspa A (w lewym górnym rogu) ma numer 2, wyspa B leży bezpośrednio na prawo od A i ma numer 1, a wyspa C leży bezpośrednio pod A i ma numer 3, bez niczego innego w pobliżu. A ma tylko dwa możliwe połączenia: do B (w prawo) i do C (w dół) - więc jeśli A potrzebuje 2 końców mostów tylko z dwóch dostępnych kierunków, oba połączenia muszą istnieć, czyli co najmniej jeden pojedynczy most do B i jeden do C.",
    hashi_rules_example_p2: "B potrzebuje tylko 1 i ma już ten jeden most od A, więc B jest gotowa - drugi most do B nie jest dozwolony, bo dałby jej 2. C potrzebuje 3, ale otrzymała dotąd tylko 1 od A; ponieważ A-C to jedyne możliwe połączenie dla C (zakładając, że żadna inna wyspa nie leży z nią w jednej linii), to jedno połączenie musi stać się mostem podwójnym, by dać C brakujące 2 - dwa równoległe mosty między A i C. Dokładnie taka sama dedukcja „tylko jeden układ pasuje do numerów” rozwiązuje każdą większą planszę.",
    hashi_rules_end_title: "Kończenie łamigłówki",
    hashi_term_win: "Rozwiązane",
    hashi_rules_win: "Łamigłówka jest rozwiązana, gdy liczba mostów każdej wyspy dokładnie odpowiada jej numerowi ORAZ każdą wyspę można osiągnąć z każdej innej po narysowanych mostach - oba warunki naraz, nie tylko jeden z nich.",
    hashi_history_title: "Historia Hashiwokakero",
    hashi_history_origins_title: "Oryginał Nikoli",
    hashi_history_origins_p1: "Hashiwokakero zostało wymyślone przez Nikoli, japońskie wydawnictwo łamigłówek, któremu w tej kolekcji przypisuje się już spopularyzowanie i nazwanie Sudoku oraz stworzenie Kakuro i Slitherlinka. Pojawiło się po raz pierwszy w jednym z magazynów łamigłówkowych Nikoli, dołączając do tej samej rodziny łamigłówek logicznych zbudowanych z prostych zasad, które łączą się w zaskakująco głębokie łańcuchy dedukcji.",
    hashi_history_origins_p2: "Pełna japońska nazwa, Hashiwokakero, tłumaczy się mniej więcej jako „zbuduj most!” - bezpośrednie polecenie, a nie tylko opis, zgodne z centralnym działaniem łamigłówki. Anglojęzyczni gracze najczęściej skracają ją do „Hashi” albo po prostu nazywają „Bridges”.",
    hashi_history_theory_title: "Łamigłówka o teoriografowym posmaku",
    hashi_history_theory_p1: "Struktura wysp i połączeń w Hashi nieuchronnie przywodzi na myśl problem siedmiu mostów Królewca, XVIII-wieczny problem, którym Leonhard Euler pomógł zapoczątkować teorię grafów - miasto z wyspami połączonymi mostami i pytaniem, czy można przejść przez każdy most dokładnie raz podczas jednego spaceru. Euler udowodnił, że dla konkretnego układu Królewca było to niemożliwe - przełomowy wynik negatywny dotyczący mostów, jakie wówczas istniały.",
    hashi_history_theory_p2: "Hashi zapożycza ten sam podstawowy obraz - wyspy i łączące je mosty - ale zamienia go w łamigłówkę konstrukcyjną, a nie dowód dotyczący ustalonego układu: zamiast pytać, czy dany układ można przejść za jednym razem, każe graczowi zbudować sieć od zera, spełniającą ponumerowany wymóg każdej wyspy, a przy tym łączącą całą mapę. Pokrewieństwo jest pojęciowe i wizualne, nie jest to wspólny problem matematyczny, ale zdecydowanie należy do tej samej rodziny teorii grafów.",
    hashi_history_spread_title: "Eksport Nikoli obok Sudoku i Kakuro",
    hashi_history_spread_p1: "Podobnie jak wcześniej Kakuro, Hashiwokakero znalazło międzynarodową publiczność w latach po światowym, gazetowym boomie na Sudoku, gdy redaktorzy łamigłówek i gracze szukali czegoś jeszcze równie wciągającego jak inne eksporty Nikoli - proste zasady, bez potrzeby liczenia czy słownictwa, i rozwiązania osiągane przez czystą dedukcję, a nie zgadywanie.",
    hashi_history_spread_p2: "Od tego czasu na stałe zadomowiło się jako jeden ze stabilniejszych międzynarodowych faworytów Nikoli obok Sudoku, Kakuro i Slitherlinka, szczególnie lubiany przez graczy ceniących logikę liczenia i łączności - dokładnie tę samą dyscyplinę generowania i weryfikacji, jaką generator tej kolekcji stosuje, by zagwarantować, że każda świeżo zbudowana łamigłówka Hashi ma dokładnie jedno poprawne rozwiązanie, zanim trafi do gracza."
});
I18n.markTextLoaded("pl");
