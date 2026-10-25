// text/nl/sudoku.js
// Rules and history texts of sudoku (nl). Loaded by sudoku-rules.html and sudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    sudoku_rules_title: "Sudoku-regels",
    sudoku_rules_intro: "Een korte samenvatting van hoe PaperGames Sudoku speelt - handig als je wat roestig bent, of het net leert.",
    sudoku_rules_basics_title: "Het basisidee",
    sudoku_term_board: "Het rooster",
    sudoku_rules_board: "Het 9x9-rooster is verdeeld in negen 3x3-vakken. Sommige velden zijn vooraf ingevuld ('gegevens') en kunnen niet veranderd worden; de rest is leeg en moet door jou ingevuld worden.",
    sudoku_term_goal: "Het doel",
    sudoku_rules_goal: "Vul elk leeg veld met een cijfer van 1 tot 9, zodat elke rij, elke kolom en elk van de negen 3x3-vakken elk cijfer precies één keer bevat. Elke puzzel die PaperGames genereert heeft precies één oplossing.",
    sudoku_term_input: "Cijfers invoeren",
    sudoku_rules_input: "Selecteer een veld en kies dan een cijfer uit het paneel onder het bord (of typ een cijfer op een toetsenbord). Een veld met een gestippelde rand staat momenteel in conflict met een ander veld in zijn rij, kolom of vak - een hint dat daar iets moet veranderen.",
    sudoku_rules_end_title: "Een puzzel afronden",
    sudoku_term_win: "Opgelost",
    sudoku_rules_win: "De puzzel is opgelost zodra het rooster volledig is ingevuld zonder overgebleven conflicten.",
    sudoku_term_difficulty: "Moeilijkheidsgraad",
    sudoku_rules_difficulty: "Makkelijke, gemiddelde en moeilijke puzzels verschillen alleen in hoeveel van de 81 velden vooraf zijn ingevuld - minder gegeven cijfers betekent dat meer logisch redeneren nodig is om vooruitgang te boeken.",
    sudoku_history_title: "De Geschiedenis van Sudoku",
    sudoku_history_origins_title: "Eerst een Amerikaanse Puzzel",
    sudoku_history_origins_p1: "De cijferplaatsingspuzzel die we nu Sudoku noemen, verscheen voor het eerst in 1979 in een Amerikaans puzzeltijdschrift, uitgegeven door Dell Magazines onder de titel 'Number Place'. De uitvinder ervan wordt meestal Howard Garns genoemd, een gepensioneerd architect en freelance puzzelontwerper, al drukte het tijdschrift destijds nooit auteursnamen af, waardoor de toeschrijving berust op indirect bewijs in plaats van een ondertekende claim.",
    sudoku_history_origins_p2: "De puzzel bouwde voort op een veel ouder wiskundig idee, het Latijnse vierkant - een rooster waarin elk symbool precies één keer per rij en kolom voorkomt - bestudeerd door Leonhard Euler in de 18e eeuw, met de toegevoegde 3x3-vakbeperking om een unieke oplossing puur door logica bereikbaar te maken, zonder te hoeven raden.",
    sudoku_history_spread_title: "Een Japanse Naam voor een Wereldwijde Rage",
    sudoku_history_spread_p1: "De puzzel bereikte Japan in 1984 via het puzzelbedrijf Nikoli, dat hem hernoemde tot 'Suuji wa dokushin ni kagiru' ('de cijfers moeten alleen blijven'), al snel afgekort tot Sudoku ('enkel getal'). In 1986 voegde Nikoli twee regels toe die nog steeds gangbaar zijn: een maximum aantal vooringevulde cijfers en een symmetrische plaatsing ervan.",
    sudoku_history_spread_p2: "Sudoku bleef twee decennia lang een bescheiden Japans tijdverdrijf, tot de gepensioneerde rechter Wayne Gould, die het tijdens een reis naar Tokio was tegengekomen, een computerprogramma schreef om snel puzzels te genereren en The Times van Londen overhaalde ze vanaf 2004 te publiceren - wat binnen ongeveer een jaar een wereldwijde krantenpuzzelrage ontketende.",
    sudoku_history_modern_title: "Van Krantenkolom tot Informatica",
    sudoku_history_modern_p1: "Sudoku's plotselinge populariteit trok net zo veel wiskundigen en computerwetenschappers aan als gelegenheidsoplossers: in 2005 werd het totale aantal verschillende volledig ingevulde 9x9-roosters exact berekend (iets meer dan 6,6 triljard), en in 2012 toonde een uitputtende computerzoektocht aan dat geen enkele geldige 9x9-puzzel met minder dan 17 vooringevulde cijfers een unieke oplossing kan hebben.",
    sudoku_history_modern_p2: "Dat tweede resultaat is precies het soort feit waarop PaperGames' generator omgekeerd vertrouwt: omdat uniciteit moeilijker te behouden wordt naarmate er meer vooringevulde cijfers worden verwijderd, wordt elke puzzel hier gemaakt door te beginnen met een volledig opgelost rooster en er één voor één velden uit te verwijderen zolang er een unieke oplossing overblijft.",
    puzzle_rules_hint: "De knop ‘Tip’ helpt in drie stappen. De eerste druk markeert waar de volgende stap zit. De tweede geeft de reden, dus de regel die daar geldt. De derde voert de stap uit (vult het getal in of bouwt de brug). De tip gaat uit van je huidige stand: staat er ergens een fout getal of een foute brug, dan zegt hij dat eerst. Hij gokt nooit – kan het alleen verder door te proberen, dan zegt hij dat eerlijk. Tips zijn onbeperkt. Een puzzel die je met tips oplost, telt gewoon als overwinning; de statistieken laten daarnaast zien hoeveel overwinningen met tips waren."
});
I18n.markTextLoaded("nl");
