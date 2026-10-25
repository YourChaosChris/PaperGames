// text/pl/freecell.js
// Rules and history texts of freecell (pl). Loaded by freecell-rules.html and freecell-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    freecell_rules_title: "Zasady FreeCell",
    freecell_rules_intro: "Krótkie przypomnienie zasad, według których PaperGames rozgrywa FreeCell - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    freecell_rules_basics_title: "Podstawowa idea",
    freecell_term_layout: "Układ",
    freecell_rules_layout: "Wszystkie 52 karty od początku rozdane są odkryte do 8 kolumn układu głównego - w ostatnich czterech kolumnach brakuje po jednej karcie do pełnej siódemki. Cztery wolne pola nad kolumnami mogą pomieścić dokładnie po jednej karcie każde, a cztery fundamenty (po jednym na kolor) buduje się od Asa do Króla.",
    freecell_term_tableau: "Przenoszenie kart",
    freecell_rules_tableau: "Kartę można przenieść na kolumnę układu głównego tylko na kartę dokładnie o jeden wyższą i przeciwnego koloru, albo na dowolną pustą kolumnę. Ciąg kilku kart już ułożonych w tej samej malejącej, naprzemiennej kolejności można przenieść razem jako jeden \"superruch\", do limitu wyznaczonego przez liczbę dostępnych wolnych pól i pustych kolumn, przez które można je przełożyć.",
    freecell_term_foundation: "Fundamenty",
    freecell_rules_foundation: "Fundament przyjmuje tylko karty własnego koloru, zaczynając od Asa i przechodząc w górę o jedną rangę na raz. Gdy karta trafi na fundament, zostaje tam już na stałe - fundamenty tylko przyjmują karty i nigdy nie oddają ich z powrotem do układu głównego.",
    freecell_rules_end_title: "Kończenie gry",
    freecell_term_win: "Zwycięstwo",
    freecell_rules_win: "Gra jest wygrana w chwili, gdy wszystkie cztery fundamenty są kompletne, od Asa do Króla. W przeciwieństwie do rozdania w Mahjong Solitaire tutaj, rozdanie w FreeCell to po prostu zwykłe tasowanie - przytłaczająca większość jest rozwiązywalna, dokładnie jak w prawdziwej grze, ale PaperGames nie daje żadnej specjalnej gwarancji dla konkretnego rozdania.",
    freecell_history_title: "Historia FreeCell",
    freecell_history_origins_title: "Gra karciana z jawną informacją",
    freecell_history_origins_p1: "FreeCell wywodzi się z rodziny pasjansów w stylu \"otwartym\" albo \"Baker's Game\", sięgających wstecz co najmniej do początku XX wieku, w których każda karta jest rozdawana odkryta już od pierwszego ruchu - w przeciwieństwie do większości pasjansów nic nigdy nie jest ukryte, więc wystarczająco umiejętny gracz (albo komputer) może w zasadzie ustalić, czy dane rozdanie jest wygrywalne, zanim wykona choćby jeden ruch.",
    freecell_history_origins_p2: "Same wolne pola - niewielkie miejsca do tymczasowego odkładania pojedynczych kart - nie były nowością: miały je już starsze gry, takie jak Baker's Game. Zmiana Paula Alfille'a polegała na układaniu kolumn naprzemiennie z kart czerwonych i czarnych zamiast w jednym kolorze, a w 1978 roku zaprogramował on pierwszą wersję komputerową o nazwie FreeCell dla systemu PLATO, nadając grze zasady, w które gra się dzisiaj.",
    freecell_history_spread_title: "Dołączony do Windows",
    freecell_history_spread_p1: "FreeCell stał się powszechnie znany, gdy Microsoft dołączył go do Windows od 1995 roku, obok Pasjansa i Sapera, wprowadzając go setkom milionów użytkowników PC, którzy nigdy wcześniej się z nim nie zetknęli - podobnie jak w przypadku drogi Sapera do sławy.",
    freecell_history_spread_p2: "Wersja Microsoftu była dostarczana ze stałym zestawem 32 000 ponumerowanych rozdań, zamiast za każdym razem świeżego losowego tasowania, co pozwalało graczom porównywać notatki i rozgrywać ponownie konkretne rozdanie - konwencja, której ta wersja w PaperGames nie stosuje, generując zamiast tego za każdym razem naprawdę świeże tasowanie.",
    freecell_history_modern_title: "Rozdanie, które (prawie) zawsze wygrywa",
    freecell_history_modern_p1: "Ponieważ każda karta jest widoczna od początku, FreeCell wyjątkowo dobrze nadaje się do analizy komputerowej: spośród oryginalnych 32 000 ponumerowanych rozdań Microsoftu, wyczerpujące przeszukiwania solverów wykazały, że wszystkie poza jednym - rozdaniem numer 11 982 - są rozwiązywalne, ciekawostka, którą entuzjaści FreeCell przywołują jeszcze dekady później.",
    freecell_history_modern_p2: "Późniejsze badania posunęły tę analizę dalej, potwierdzając, że wśród pierwszego miliona ponumerowanych gier nierozwiązywalna jest tylko garstka rozdań - dlatego zwykłe losowe tasowanie, jakiego używa ta wersja, jest tak bezpiecznym wyborem: szanse trafienia na jeden z tych rzadkich wyjątków są znikomo małe."
});
I18n.markTextLoaded("pl");
