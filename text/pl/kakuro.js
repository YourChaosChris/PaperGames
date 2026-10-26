// text/pl/kakuro.js
// Rules and history texts of kakuro (pl). Loaded by kakuro-rules.html and kakuro-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    kakuro_rules_title: "Zasady Kakuro",
    kakuro_rules_intro: "Szybkie przypomnienie, jak PaperGames obsługuje Kakuro - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz. Kakuro bywa opisywane jako „krzyżówka liczbowa”: zamiast liter każde białe pole zawiera cyfrę, a zamiast haseł wskazówkami są sumy.",
    kakuro_rules_basics_title: "Podstawowa idea",
    kakuro_term_board: "Plansza",
    kakuro_rules_board: "Plansza to mieszanka czarnych pól ze wskazówkami i białych pól do wypełnienia. Każda nieprzerwana linia białych pól, czytana od lewej do prawej lub z góry na dół, nazywana jest „ciągiem”. Każdy ciąg ma dokładnie jedną wskazówkę: sumę, do której muszą się dodawać jego cyfry.",
    kakuro_term_clues: "Odczytywanie pól ze wskazówkami",
    kakuro_rules_clues: "Czarne pole pokazuje swoją sumę (lub sumy) białymi cyframi, podzielone po przekątnej, gdy niesie dwie: liczba w prawym górnym rogu to cel dla ciągu białych pól zaczynającego się bezpośrednio na prawo od niego (wskazówka „pozioma”), a liczba w lewym dolnym rogu to cel dla ciągu zaczynającego się bezpośrednio pod nim (wskazówka „pionowa”). Czarne pole z tylko jedną wskazówką pokazuje tylko tę jedną liczbę.",
    kakuro_term_goal: "Cel",
    kakuro_rules_goal: "Wypełnij każde białe pole cyfrą od 1 do 9 tak, aby cyfry każdego ciągu sumowały się dokładnie do jego wskazówki - i, równie ważne, aby żadna cyfra nie powtarzała się w tym samym ciągu (cyfra może pojawić się ponownie w ciągu, który go krzyżuje, ale nigdy dwa razy w tym samym ciągu).",
    kakuro_term_input: "Wpisywanie cyfr",
    kakuro_rules_input: "Wybierz białe pole, a następnie wybierz cyfrę z panelu pod planszą (lub wpisz cyfrę na klawiaturze). Pole z przerywaną obwódką aktualnie powtarza cyfrę użytą już gdzie indziej w jednym ze swoich ciągów, albo należy do w pełni wypełnionego ciągu, którego suma nie zgadza się jeszcze ze wskazówką - potraktuj to jako sygnał, że coś trzeba zmienić.",
    kakuro_term_difficulty: "Poziom trudności",
    kakuro_rules_difficulty: "Poziomy Łatwy, Średni i Trudny używają coraz większych plansz (7x7, 9x9 i 11x11), co oznacza dłuższe ciągi i więcej ich skrzyżowań - więcej cyfr do żonglowania naraz, ale wciąż te same dwie zasady.",
    kakuro_rules_example_title: "Rozwiązany przykład",
    kakuro_term_example: "Dwa krzyżujące się ciągi",
    kakuro_rules_example_p1: "Załóżmy, że poziomy ciąg z 2 pól ma wskazówkę 4, a jego pierwsze pole jest jednocześnie górą pionowego ciągu z 2 pól ze wskazówką 3. Dwie cyfry ciągu poziomego muszą sumować się do 4 bez powtórzeń - potrafią to tylko 1+3 lub 3+1 (2+2 powtarza 2, więc jest niedozwolone). Dwie cyfry ciągu pionowego muszą sumować się do 3 bez powtórzeń, co potrafią tylko 1+2 lub 2+1.",
    kakuro_rules_example_p2: "Wspólne pole musi zawierać cyfrę, którą mogą wykorzystać oba ciągi. Ciąg poziomy oferuje dla tego pola {1, 3}, a ciąg pionowy {1, 2} - jedyną cyfrą wspólną dla obu zbiorów jest 1. Wspólne pole musi więc mieć wartość 1, co ustala drugie pole ciągu poziomego na 3, a drugie pole ciągu pionowego na 2. Cała łamigłówka zostaje w ten sposób rozwiązana samą eliminacją, bez zgadywania - to samo rozumowanie, powtórzone znacznie więcej razy, rozwiązuje każdą większą planszę Kakuro.",
    kakuro_rules_end_title: "Kończenie łamigłówki",
    kakuro_term_win: "Rozwiązane",
    kakuro_rules_win: "Łamigłówka jest rozwiązana, gdy tylko każde białe pole jest wypełnione, każdy ciąg sumuje się do swojej wskazówki, a żaden ciąg nie powtarza cyfry.",
    kakuro_history_title: "Historia Kakuro",
    kakuro_history_origins_title: "Cross Sums, wynalezione w Ameryce",
    kakuro_history_origins_p1: "Krzyżówka liczbowa znana dziś jako Kakuro ukazała się najpierw w Stanach Zjednoczonych pod nazwą „Cross Sums” (pisaną też „Cross Sum”) w magazynach łamigłówek wydawnictwa Dell; najstarszy znany przykład pochodzi z 1950 roku. Jej wynalezienie przypisuje się często Kanadyjczykowi Jacobowi E. Funkowi. Przyjęła się dopiero po kilku latach, ale w połowie lat 60. była już stałą rubryką w magazynach Dell, obok innych łamigłówek liczbowych i logicznych tego wydawnictwa.",
    kakuro_history_origins_p2: "Pomysł łączył wygląd krzyżówkowej siatki z arytmetyką zamiast słownictwa: czarne pola ze wskazówkami liczbowymi w miejsce definicji krzyżówkowych oraz białe pola do wypełnienia cyframi, których sumy musiały pasować do tych wskazówek.",
    kakuro_history_spread_title: "Japońska nazwa dla drugiego życia",
    kakuro_history_spread_p1: "Cross Sums trafiło do Japonii, gdzie wydawnictwo łamigłówek Nikoli - ta sama firma, która później spopularyzowała i nazwała Sudoku - przejęło je, nadając mu nazwę „Kakuro”, skrót od „kasan kurosu” (加算クロス), co po japońsku znaczy „krzyż dodawania”.",
    kakuro_history_spread_p2: "W latach 80. Kakuro stało się jedną z najpopularniejszych łamigłówek Nikoli w Japonii, zdobywając tam wiernych fanów na długo przed boomem na Sudoku, który później poniósł nazwę Nikoli na resztę świata.",
    kakuro_history_modern_title: "Odkryta na nowo łamigłówka",
    kakuro_history_modern_p1: "Międzynarodowa popularność Kakuro wzrosła ponownie w połowie lat 2000., w cieniu światowego, gazetowego boomu na Sudoku, gdy redaktorzy łamigłówek szukający następcy zwrócili się ku innym liczbowym łamigłówkom Nikoli - dzięki czemu wielu zachodnich graczy po raz pierwszy poznało Kakuro pod jego japońską nazwą, choć sama łamigłówka została wynaleziona dekady wcześniej w Ameryce Północnej.",
    kakuro_history_modern_p2: "Ta dwuetapowa historia znajduje odbicie w tym, jak łamigłówkę rozwiązuje się do dziś: plansza Kakuro nigdy nie wymaga zgadywania, tylko tej samej eliminacji ciąg po ciągu, jakiej używali gracze rozwiązujący oryginalne Cross Sums wydawnictwa Dell - wyrażonej po prostu cyfra po cyfrze, jedna wskazówka naraz, dokładnie tej samej zasady, którą generator tej kolekcji stosuje odwrotnie, by zbudować nową łamigłówkę z losowo wypełnionej planszy."
});
I18n.markTextLoaded("pl");
