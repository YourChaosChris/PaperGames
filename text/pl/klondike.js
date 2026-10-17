// text/pl/klondike.js
// Rules and history texts of klondike (pl). Loaded by klondike-rules.html and klondike-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    klondike_rules_title: "Zasady Klondike",
    klondike_rules_intro: "Szybka ściągawka, jak PaperGames rozgrywa Klondike - przydatna, jeśli dawno nie grałeś, albo dopiero się uczysz.",
    klondike_rules_basics_title: "Podstawowa idea",
    klondike_term_layout: "Układ",
    klondike_rules_layout: "Karty rozdaje się do 7 kolumn tableau po 1 do 7 kart każda, przy czym odkryta jest tylko wierzchnia karta każdej kolumny. Cztery fundamenty (po jednym na kolor) buduje się od Asa do Króla. Reszta talii tworzy stos do dobierania, z którego dobiera się po jednej karcie na stos odrzuconych kart.",
    klondike_term_tableau: "Przenoszenie kart",
    klondike_rules_tableau: "Kartę można przenieść na kolumnę tableau tylko na kartę dokładnie o jedną wartość wyższą i przeciwnego koloru, albo na pustą kolumnę, która przyjmuje wyłącznie Króla. Ciąg kilku kart już ułożonych odkryte w tym samym malejącym, naprzemiennym porządku można przenieść razem jako jedną całość na prawidłowe miejsce docelowe.",
    klondike_term_foundation: "Fundamenty",
    klondike_rules_foundation: "Fundament przyjmuje wyłącznie własny kolor, zaczynając od Asa i rosnąc o jedną wartość na raz. Gdy karta trafi na fundament, zostaje tam - fundamenty tylko przyjmują karty, nigdy nie oddają ich z powrotem na tableau.",
    klondike_term_stock: "Stos dobierania i odrzucone karty",
    klondike_rules_stock: "Dotknij stosu dobierania, aby odkryć jego wierzchnią kartę na stos odrzuconych kart, po jednej karcie na raz. Gdy stos dobierania jest pusty, kolejne dotknięcie tasuje cały stos odrzuconych kart z powrotem w stos dobierania, byś mógł przejść przez niego ponownie - PaperGames nie ogranicza, ile razy możesz rozdawać od nowa.",
    klondike_rules_end_title: "Kończenie gry",
    klondike_term_win: "Zwycięstwo",
    klondike_rules_win: "Grę wygrywa się w chwili, gdy wszystkie cztery fundamenty są kompletne, od Asa do Króla. Nie każde tasowanie da się wygrać - w przeciwieństwie do FreeCell, rozdanie Klondike może naprawdę stać się nierozwiązywalne w trakcie gry, ponieważ na początku widoczna jest tylko wierzchnia karta każdej kolumny.",
    klondike_history_title: "Historia Klondike",
    klondike_history_origins_title: "Nazwa z gorączki złota - być może",
    klondike_history_origins_p1: "Klondike należy do dużej rodziny jednoosobowych gier karcianych typu \"pasjans\", które rozprzestrzeniły się w Europie i Ameryce Północnej w XIX wieku, przy czym większość z nich wymaga jedynie zwykłej talii kart i płaskiej powierzchni. Konkretny zestaw zasad grany dziś - siedem kaskadowych kolumn tableau, cztery fundamenty budowane według koloru, stos dobierania i odrzuconych kart do przeciągania - przybrał mniej więcej swoją współczesną formę do końca XIX wieku, pod różnymi regionalnymi nazwami.",
    klondike_history_origins_p2: "To, jak dokładnie zaczęto ją nazywać \"Klondike\", jest naprawdę niepewne. Najczęściej powtarzana historia wiąże nazwę z gorączką złota w Klondike pod koniec lat 90. XIX wieku, według której poszukiwacze złota jadący na Jukon albo spędzający tam zimę grywali w nią, by zabić czas - barwne, wiarygodnie brzmiące pochodzenie, którego jednak, jak w przypadku wielu etymologii gier karcianych, nigdy nie udało się przypisać do udokumentowanego pierwszego użycia. PaperGames przytacza ją tutaj jako popularną opowieść, a nie ustaloną historię.",
    klondike_history_spread_title: "Dołączony do Windows",
    klondike_history_spread_p1: "Dzisiejsza ogromna popularność Klondike zawdzięcza mniej swoim XIX-wiecznym korzeniom przy karcianym stoliku, a bardziej jednemu konkretnemu oprogramowaniu: Microsoft dołączył jego wersję, nazwaną po prostu \"Pasjans\", do Windows 3.0 w 1990 roku - podobno między innymi po to, by delikatnie nauczyć całe pokolenie nowych użytkowników Windows klikania i przeciągania myszką.",
    klondike_history_spread_p2: "Zadziałało niemal zbyt dobrze: w ciągu kilku lat Pasjans z Windows uchodził za jeden z najczęściej używanych programów na świecie, zainstalowany praktycznie na każdym pececie sprzedawanym z Windows, niezależnie od tego, czy jego właściciel kiedykolwiek zamierzał otworzyć jakąś grę. Na nowo określił, co \"pasjans\" znaczył dla milionów ludzi, którzy nigdy wcześniej nie zagrali ani jednej fizycznej partii kart pod tą nazwą.",
    klondike_history_modern_title: "Ta wersja",
    klondike_history_modern_p1: "PaperGames rozgrywa klasyczny wariant z dobieraniem pojedynczej karty i bez limitu ponownych rozdań, preferując mniej uciążliwą wersję zasad - tak jak FreeCell w tej kolekcji - z prawdziwie nowym tasowaniem przy każdej grze zamiast stałego zestawu ponumerowanych rozdań, i bez ograniczenia, ile razy można ponownie przejść przez stos dobierania."
});
I18n.markTextLoaded("pl");
