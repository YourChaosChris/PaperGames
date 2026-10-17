// text/nl/nonogram.js
// Rules and history texts of nonogram (nl). Loaded by nonogram-rules.html and nonogram-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    nonogram_rules_title: "Nonogram-regels",
    nonogram_rules_intro: "Een korte samenvatting van hoe PaperGames Nonogrammen (ook wel Griddlers genoemd) speelt - handig als je wat roestig bent, of het net leert.",
    nonogram_rules_basics_title: "Het basisidee",
    nonogram_term_clues: "De aanwijzingen lezen",
    nonogram_rules_clues: "Elke rij en kolom heeft een aanwijzing: een reeks getallen die de lengte van elk aaneengesloten blok gevulde vakjes in die lijn aangeeft, in volgorde, gescheiden door minstens één leeg vakje. Een aanwijzing \"3 1\" betekent een reeks van drie gevulde vakjes, dan een opening, dan nog één gevuld vakje, ergens in die lijn.",
    nonogram_term_filling: "Vullen en markeren",
    nonogram_rules_filling: "Gebruik de vulmodus om een vakje in te kleuren waarvan je zeker weet dat het bij het beeld hoort, en de X-markeermodus om een vakje door te strepen waarvan je zeker weet dat het leeg is - markeren is puur een geheugensteun en heeft geen invloed op winnen, maar helpt je mogelijkheden uit te sluiten terwijl je de aanwijzingen doorwerkt.",
    nonogram_rules_end_title: "Een puzzel afronden",
    nonogram_term_win: "Opgelost",
    nonogram_rules_win: "De puzzel is opgelost op het moment dat je gevulde vakjes precies overeenkomen met het verborgen beeld - gemarkeerde vakjes hoeven niet correct te zijn, alleen de gevulde vakjes tellen.",
    nonogram_history_title: "De Geschiedenis van Nonogrammen",
    nonogram_history_origins_title: "Twee Uitvinders, Twee Continenten",
    nonogram_history_origins_p1: "De puzzel gaat terug op twee onafhankelijke uitvindingen halverwege de jaren 80: Non Ishida, een Japanse grafisch redacteur, creëerde rond 1985 roosterpuzzels die via op aanwijzingen gebaseerde logica beelden onthulden, terwijl vrijwel gelijktijdig de Britse puzzelontwerper James Dalgety een vergelijkbaar concept bedacht en de naam 'Griddlers' muntte.",
    nonogram_history_origins_p2: "Ishida's puzzels werden gepubliceerd in een Japans puzzeltijdschrift en sloegen snel aan; de naam 'Nonogram' zelf wordt algemeen gezien als een samentrekking van 'Non' (haar voornaam) en '-gram', al staat de puzzel in verschillende landen bekend onder verscheidene andere namen, waaronder Griddlers, Picross en Hanjie.",
    nonogram_history_spread_title: "Van Tijdschriften naar de Game Boy",
    nonogram_history_spread_p1: "Nintendo maakte de puzzel wereldwijd bekend onder de naam 'Picross' (een samentrekking van 'picture' en 'crossword'), en bracht vanaf 1995 Picross-spellen uit voor de Game Boy en de Super Famicom - voor veel spelers buiten Japan was die handheldreeks hun eerste kennismaking met het format.",
    nonogram_history_spread_p2: "De aantrekkingskracht van de puzzel reikte ver voorbij toegewijde videospellen: krantenpuzzelpagina's namen hem tijdens de puzzelrage van de jaren 2000 samen met Sudoku op, meestal onder de naam Griddlers of Hanjie, en hij blijft tot op vandaag een vast onderdeel van puzzelboeken en apps.",
    nonogram_history_modern_title: "Een Puzzel die (Meestal) Geen Giswerk Vereist",
    nonogram_history_modern_p1: "Een goed geconstrueerd nonogram is zo opgezet dat het puur door logische deductie op te lossen is, regel voor regel, zonder ooit te hoeven raden - precies de eigenschap waarop PaperGames' eigen puzzels worden gecontroleerd voordat ze worden opgenomen, met een constraint-propagation-oplosser die bevestigt dat de aanwijzingen van elk beeld precies één geldig rooster toelaten.",
    nonogram_history_modern_p2: "Dat geldt echter niet voor elke mogelijke aanwijzingenset: net als bij Minesweeper is ook bewezen dat het algemene oplossen van nonogrammen NP-volledig is, wat betekent dat een voldoende grote of doelbewust vijandig geconstrueerde puzzel echt backtracking-achtig giswerk kan vereisen - goed ontworpen puzzels voor menselijke oplossers zijn er specifiek op gebouwd om dat te vermijden, wat op zichzelf een kleine kunstvorm is."
});
I18n.markTextLoaded("nl");
