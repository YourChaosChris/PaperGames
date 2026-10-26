// text/nl/kakuro.js
// Rules and history texts of kakuro (nl). Loaded by kakuro-rules.html and kakuro-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    kakuro_rules_title: "Kakuro-regels",
    kakuro_rules_intro: "Een korte samenvatting van hoe PaperGames Kakuro speelt - handig als je wat roestig bent of het net leert. Kakuro wordt weleens omschreven als een „kruiswoordraadsel met cijfers”: in plaats van letters staat er in elk wit vakje een cijfer, en in plaats van woorden zijn de aanwijzingen sommen.",
    kakuro_rules_basics_title: "Het basisidee",
    kakuro_term_board: "Het rooster",
    kakuro_rules_board: "Het rooster bestaat uit zwarte aanwijzingsvakjes en witte, invulbare vakjes. Elke aaneengesloten reeks witte vakjes, van links naar rechts of van boven naar beneden gelezen, heet een „reeks”. Elke reeks heeft precies één aanwijzing: het totaal waartoe de cijfers moeten optellen.",
    kakuro_term_clues: "De aanwijzingsvakjes lezen",
    kakuro_rules_clues: "Een zwart vakje toont zijn som (of sommen) in witte cijfers, diagonaal gescheiden als het er twee draagt: het getal rechtsboven is het doel voor de reeks witte vakjes die direct rechts ervan begint (een „horizontale” aanwijzing), en het getal linksonder is het doel voor de reeks die direct eronder begint (een „verticale” aanwijzing). Een zwart vakje met maar één aanwijzing toont alleen dat getal.",
    kakuro_term_goal: "Het doel",
    kakuro_rules_goal: "Vul elk wit vakje met een cijfer van 1 tot 9 zodat de cijfers van elke reeks precies optellen tot zijn aanwijzing - en net zo belangrijk: geen enkel cijfer mag binnen dezelfde reeks herhaald worden (een cijfer mag wel terugkomen in een kruisende reeks, alleen nooit tweemaal in dezelfde reeks).",
    kakuro_term_input: "Cijfers invoeren",
    kakuro_rules_input: "Selecteer een wit vakje en kies dan een cijfer van het paneel onder het bord (of typ een cijfer op een toetsenbord). Een vakje met een gestippelde rand herhaalt op dit moment een cijfer dat al elders in een van zijn reeksen voorkomt, of hoort bij een volledig ingevulde reeks waarvan het totaal nog niet klopt met de aanwijzing - zie dat als teken dat er iets moet veranderen.",
    kakuro_term_difficulty: "Moeilijkheidsgraad",
    kakuro_rules_difficulty: "Makkelijk, Gemiddeld en Moeilijk gebruiken steeds grotere roosters (7x7, 9x9 en 11x11), wat langere reeksen betekent die elkaar vaker kruisen - meer cijfers om tegelijk mee te jongleren, maar steeds dezelfde twee regels.",
    kakuro_rules_example_title: "Een uitgewerkt voorbeeld",
    kakuro_term_example: "Twee kruisende reeksen",
    kakuro_rules_example_p1: "Stel dat een horizontale reeks van 2 vakjes de aanwijzing 4 heeft, en het eerste vakje ervan ook het begin is van een verticale reeks van 2 vakjes met aanwijzing 3. De twee cijfers van de horizontale reeks moeten zonder herhaling optellen tot 4 - dat lukt alleen met 1+3 of 3+1 (2+2 herhaalt de 2 en mag dus niet). De twee cijfers van de verticale reeks moeten zonder herhaling optellen tot 3, wat alleen 1+2 of 2+1 kunnen.",
    kakuro_rules_example_p2: "Het gedeelde vakje moet een cijfer bevatten dat beide reeksen kunnen gebruiken. De horizontale reeks biedt {1, 3} voor dat vakje, de verticale reeks biedt {1, 2} - het enige cijfer dat in beide sets voorkomt is 1. Het gedeelde vakje moet dus 1 zijn, waardoor het andere vakje van de horizontale reeks op 3 komt te liggen en het andere vakje van de verticale reeks op 2. Zo is de hele puzzel opgelost door pure uitsluiting, zonder te hoeven raden - precies het soort redenering dat, veel vaker herhaald, ook elk groter Kakuro-rooster oplost.",
    kakuro_rules_end_title: "Een puzzel afronden",
    kakuro_term_win: "Opgelost",
    kakuro_rules_win: "De puzzel is opgelost zodra elk wit vakje is ingevuld, elke reeks optelt tot zijn aanwijzing en geen enkele reeks een cijfer herhaalt.",
    kakuro_history_title: "De geschiedenis van Kakuro",
    kakuro_history_origins_title: "Cross Sums, uitgevonden in Amerika",
    kakuro_history_origins_p1: "Het cijferkruiswoordraadsel dat nu bekendstaat als Kakuro verscheen eerst in de Verenigde Staten onder de naam „Cross Sums” (ook wel „Cross Sum” geschreven) in puzzelbladen van uitgever Dell; het oudste bekende voorbeeld is van 1950. De uitvinding wordt vaak toegeschreven aan de Canadees Jacob E. Funk. Het duurde een paar jaar voordat de puzzel aansloeg, maar halverwege de jaren zestig was hij een vast onderdeel van Dells puzzelbladen, naast Dells andere cijfer- en logicapuzzels.",
    kakuro_history_origins_p2: "Het idee combineerde het uiterlijk van een kruiswoordraadsel-rooster met rekenkunde in plaats van woordenschat: zwarte vakjes met aanwijzingsgetallen in plaats van kruiswoordraadsel-omschrijvingen, en witte vakjes om in te vullen met cijfers waarvan de sommen bij die aanwijzingen moesten passen.",
    kakuro_history_spread_title: "Een Japanse naam voor een tweede leven",
    kakuro_history_spread_p1: "Cross Sums belandde in Japan, waar puzzeluitgever Nikoli - hetzelfde bedrijf dat later Sudoku populair zou maken en die naam zou geven - het overnam en de naam „Kakuro” gaf, een samentrekking van „kasan kurosu” (加算クロス), Japans voor „optelkruis”.",
    kakuro_history_spread_p2: "Gedurende de jaren 80 groeide Kakuro uit tot een van Nikoli's populairste puzzels in Japan, met daar al een trouwe schare liefhebbers ruim voordat de latere Sudoku-hype Nikoli's naam naar de rest van de wereld zou brengen.",
    kakuro_history_modern_title: "Een herontdekte puzzel",
    kakuro_history_modern_p1: "Kakuro's internationale bekendheid groeide medio jaren 2000 opnieuw, in de nasleep van Sudoku's wereldwijde krantenhype, toen puzzelredacteuren op zoek naar een opvolger zich tot Nikoli's andere cijferpuzzels wendden - waardoor veel westerse liefhebbers Kakuro voor het eerst leerden kennen onder zijn Japanse naam, ook al was de puzzel zelf decennia eerder in Noord-Amerika bedacht.",
    kakuro_history_modern_p2: "Die geschiedenis in twee fasen is terug te zien in hoe de puzzel vandaag de dag nog wordt opgelost: een Kakuro-rooster vereist nooit gokken, alleen dezelfde reeks-voor-reeks-uitsluiting die de oplossers van Dells oorspronkelijke Cross Sums al gebruikten - simpelweg cijfer voor cijfer uitgedrukt, één aanwijzing tegelijk, precies het principe dat de generator van deze verzameling omgekeerd gebruikt om uit een willekeurig ingevuld rooster een verse puzzel te bouwen."
});
I18n.markTextLoaded("nl");
