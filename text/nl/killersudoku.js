// text/nl/killersudoku.js
// Rules and history texts of killersudoku (nl). Loaded by killersudoku-rules.html and killersudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    sudoku_rules_basics_title: "Het basisidee",
    sudoku_term_goal: "Het doel",
    sudoku_term_input: "Cijfers invoeren",
    sudoku_rules_end_title: "Een puzzel afronden",
    sudoku_term_win: "Opgelost",
    sudoku_term_difficulty: "Moeilijkheidsgraad",
    puzzle_rules_hint: "De knop ‘Tip’ helpt in drie stappen. De eerste druk markeert waar de volgende stap zit. De tweede geeft de reden, dus de regel die daar geldt. De derde voert de stap uit (vult het getal in of bouwt de brug). De tip gaat uit van je huidige stand: staat er ergens een fout getal of een foute brug, dan zegt hij dat eerst. Hij gokt nooit – kan het alleen verder door te proberen, dan zegt hij dat eerlijk. Tips zijn onbeperkt. Een puzzel die je met tips oplost, telt gewoon als overwinning; de statistieken laten daarnaast zien hoeveel overwinningen met tips waren.",
    killersudoku_rules_title: "Regels van Killer Sudoku",
    killersudoku_rules_intro: "Een kort overzicht van hoe PaperGames Killer Sudoku speelt - handig om op te frissen of te leren.",
    killersudoku_term_board: "Het rooster",
    killersudoku_rules_board: "Net als bij Sudoku verdelen dikke lijnen het 9x9-rooster in negen blokken van 3x3. Gestippelde lijnen verdelen het bovendien in kooien van één tot vijf vakjes. Weinig of geen vakjes zijn vooraf ingevuld.",
    killersudoku_rules_goal: "Vul elk vakje met een cijfer van 1 tot 9, zodat elke rij, elke kolom en elk 3x3-blok elk cijfer precies één keer bevat. Elke puzzel die PaperGames maakt, heeft precies één oplossing.",
    killersudoku_term_regions: "Kooien",
    killersudoku_rules_regions: "Het kleine getal in het vakje linksboven van een kooi is zijn som: de cijfers in de kooi moeten samen die som geven. Anders dan bij Calcudoku mag binnen een kooi geen cijfer herhaald worden.",
    killersudoku_rules_input: "Kies een vakje en daarna een getal op het toetsenblok onder het bord (of typ een cijfer op een toetsenbord). Een cijfer dat wit op zwart staat, komt dubbel voor in zijn rij, kolom, blok of kooi, of maakt een kooi af met de verkeerde som.",
    killersudoku_rules_difficulty: "Makkelijke puzzels hebben vooral kleine kooien en een paar extra gegeven cijfers; moeilijke hebben grotere kooien en alleen de cijfers die nodig zijn voor één oplossing, vaak bijna geen.",
    killersudoku_rules_win: "De puzzel is opgelost zodra elk vakje gevuld is en geen rij, kolom, blok of kooi een regel breekt.",
    killersudoku_history_title: "De geschiedenis van Killer Sudoku",
    killersudoku_history_origins_title: "Sommen op een Sudoku-rooster",
    killersudoku_history_origins_p1: "Puzzels die de Sudoku-regels combineren met kooisommen verschenen al in de jaren negentig in Japan, waar sompuzzels zoals Kakuro populair waren. Het idee werd breed bekend in 2005, toen Britse kranten zulke puzzels tijdens de wereldwijde Sudoku-rage onder de naam Killer Sudoku gingen plaatsen.",
    killersudoku_history_origins_p2: "De naam is beschrijvend, geen merk: 'killer' beloofde gewoon een zwaardere uitdaging dan een gewone Sudoku, omdat er weinig of geen cijfers zijn om mee te beginnen.",
    killersudoku_history_names_title: "Hoe de puzzels hier ontstaan",
    killersudoku_history_names_p1: "Elke Killer Sudoku begint als een vers gemaakt, volledig opgelost Sudoku-rooster, dat daarna in aaneengesloten kooien wordt verdeeld zonder herhaald cijfer in een kooi.",
    killersudoku_history_names_p2: "Een ingebouwde oplosser controleert daarna of de kooisommen maar één oplossing toelaten. Zo niet, dan wordt een cijfer waarin twee mogelijke oplossingen verschillen als gegeven onthuld, en de controle herhaalt zich tot er precies één oplossing over is."
});
I18n.markTextLoaded("nl");
