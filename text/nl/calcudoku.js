// text/nl/calcudoku.js
// Rules and history texts of calcudoku (nl). Loaded by calcudoku-rules.html and calcudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    sudoku_rules_basics_title: "Het basisidee",
    sudoku_term_goal: "Het doel",
    sudoku_term_input: "Cijfers invoeren",
    sudoku_rules_end_title: "Een puzzel afronden",
    sudoku_term_win: "Opgelost",
    sudoku_term_difficulty: "Moeilijkheidsgraad",
    puzzle_rules_hint: "De knop ‘Tip’ helpt in drie stappen. De eerste druk markeert waar de volgende stap zit. De tweede geeft de reden, dus de regel die daar geldt. De derde voert de stap uit (vult het getal in of bouwt de brug). De tip gaat uit van je huidige stand: staat er ergens een fout getal of een foute brug, dan zegt hij dat eerst. Hij gokt nooit – kan het alleen verder door te proberen, dan zegt hij dat eerlijk. Tips zijn onbeperkt. Een puzzel die je met tips oplost, telt gewoon als overwinning; de statistieken laten daarnaast zien hoeveel overwinningen met tips waren.",
    calcudoku_rules_title: "Regels van Calcudoku",
    calcudoku_rules_intro: "Een kort overzicht van hoe PaperGames Calcudoku speelt - handig om op te frissen of te leren.",
    calcudoku_term_board: "Het rooster",
    calcudoku_rules_board: "Het rooster is vierkant, van 4x4 tot 7x7. Anders dan bij Sudoku zijn er geen blokken; in plaats daarvan verdelen dikke lijnen het in kooien - groepen van één tot vier aaneengesloten vakjes.",
    calcudoku_rules_goal: "Vul elk vakje met een cijfer van 1 tot de roostergrootte (1 tot 5 bij 5x5), zodat elke rij en elke kolom elk cijfer precies één keer bevat. Elke puzzel die PaperGames maakt, heeft precies één oplossing.",
    calcudoku_term_regions: "Kooien en bewerkingen",
    calcudoku_rules_regions: "Het kleine label in het vakje linksboven van een kooi toont een uitkomst en een bewerking. Bij + of × moeten de cijfers van de kooi opgeteld of vermenigvuldigd de uitkomst geven, in elke volgorde. Een kooi met – of ÷ heeft altijd twee vakjes: het grootste cijfer min het kleinste, of gedeeld door het kleinste, geeft de uitkomst. Een kooi van één vakje toont gewoon zijn cijfer. Een cijfer mag twee keer in een kooi staan, zolang de rij en kolom het toelaten.",
    calcudoku_rules_input: "Kies een vakje en daarna een getal op het toetsenblok onder het bord (of typ een cijfer op een toetsenbord). Een cijfer dat wit op zwart staat, botst met een ander in zijn rij of kolom, of maakt een kooi af die zijn uitkomst niet haalt.",
    calcudoku_rules_difficulty: "Kies voor het begin de roostergrootte en een niveau. Grotere roosters en hogere niveaus betekenen grotere kooien en minder kooien van één vakje, die minder verraden.",
    calcudoku_rules_win: "De puzzel is opgelost zodra elk vakje gevuld is en geen rij, kolom of kooi een regel breekt.",
    calcudoku_history_title: "De geschiedenis van Calcudoku",
    calcudoku_history_origins_title: "Uit een klaslokaal in Japan",
    calcudoku_history_origins_p1: "Dit soort puzzel wordt meestal toegeschreven aan Tetsuya Miyamoto, een Japanse wiskundeleraar die hem rond 2004 bedacht om zijn leerlingen te laten oefenen in rekenen en logisch denken zonder hun de oplossingsweg voor te zeggen. Het idee verspreidde zich al snel buiten zijn klas via puzzelboeken en kranten.",
    calcudoku_history_origins_p2: "Onder het rekenwerk ligt het Latijnse vierkant - een rooster waarin elk teken precies één keer per rij en kolom voorkomt - dat wiskundigen als Leonhard Euler in de 18e eeuw bestudeerden en dat ook de kern van Sudoku vormt.",
    calcudoku_history_names_title: "Veel namen, één puzzel",
    calcudoku_history_names_p1: "Hetzelfde soort puzzel verschijnt commercieel ook onder de naam KenKen. KenKen is een geregistreerd handelsmerk van Nextoy LLC. PaperGames heeft geen enkele band met Nextoy LLC en gebruikt in plaats daarvan de algemene naam Calcudoku.",
    calcudoku_history_names_p2: "Elke Calcudoku wordt vers op je apparaat gemaakt: een willekeurig Latijns vierkant wordt in kooien verdeeld, elke kooi krijgt een bewerking met een geheel getal als uitkomst, en een ingebouwde oplosser houdt alleen verdelingen met precies één oplossing over."
});
I18n.markTextLoaded("nl");
