// text/nl/freecell.js
// Rules and history texts of freecell (nl). Loaded by freecell-rules.html and freecell-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    freecell_rules_title: "FreeCell-regels",
    freecell_rules_intro: "Een korte samenvatting van hoe PaperGames FreeCell speelt - handig als je wat roestig bent, of het net leert.",
    freecell_rules_basics_title: "Het basisidee",
    freecell_term_layout: "De indeling",
    freecell_rules_layout: "Alle 52 kaarten worden vanaf het begin open in 8 tableaukolommen uitgedeeld - vier kaarten minder dan een volle rij van 7 in de laatste vier kolommen. Vier vrije cellen boven de kolommen kunnen elk precies één kaart bevatten, en vier basen (één per kleur) worden opgebouwd van aas tot heer.",
    freecell_term_tableau: "Kaarten verplaatsen",
    freecell_rules_tableau: "Een kaart kan in een tableaukolom alleen op een kaart worden gelegd die precies één rang hoger is en van de andere kleur, of op een lege kolom. Een reeks kaarten die al zo aflopend en afwisselend gestapeld ligt, kan als één 'supermove' samen worden verplaatst, tot een limiet die bepaald wordt door hoeveel vrije cellen en lege kolommen beschikbaar zijn om ze via te relayen.",
    freecell_term_foundation: "Basen",
    freecell_rules_foundation: "Een basis accepteert alleen zijn eigen kleur, beginnend bij het aas en telkens één rang omhoog. Eenmaal op een basis blijft een kaart daar - basen ontvangen alleen kaarten, ze geven ze nooit terug aan het tableau.",
    freecell_rules_end_title: "Een spel afronden",
    freecell_term_win: "Winnen",
    freecell_rules_win: "Het spel is gewonnen zodra alle vier de basen compleet zijn, aas tot heer. Anders dan bij de indeling van Mahjong Solitaire hier, is een FreeCell-indeling gewoon een simpele schudding - de overgrote meerderheid is oplosbaar, net als in het echte spel, maar PaperGames geeft voor geen enkele ronde een speciale garantie.",
    freecell_history_title: "De Geschiedenis van FreeCell",
    freecell_history_origins_title: "Een Kaartspel met Open Informatie",
    freecell_history_origins_p1: "FreeCell stamt af van een familie van \"open\" of \"Baker's Game\"-achtige patience-spellen die minstens teruggaan tot het begin van de 20e eeuw, waarbij elke kaart vanaf de allereerste zet open ligt - anders dan bij de meeste solitairespellen is er nooit iets verborgen, zodat een voldoende bekwame speler (of computer) in principe kan uitrekenen of een gegeven indeling winbaar is, nog voordat er één zet is gedaan.",
    freecell_history_origins_p2: "De toevoeging van vrije cellen - kleine opslagplekken om losse kaarten tijdelijk te parkeren - wordt algemeen toegeschreven aan Paul Alfille, die in 1978 een vroege digitale versie genaamd FreeCell maakte voor het PLATO-computersysteem, en zo het oudere open-tableauformat verfijnde tot het specifieke regelwerk dat vandaag gespeeld wordt.",
    freecell_history_spread_title: "Meegeleverd met Windows",
    freecell_history_spread_p1: "FreeCell werd een huishoudelijke naam nadat Microsoft het vanaf 1995 meeleverde met Windows, naast Solitaire en Minesweeper, en zo aan honderden miljoenen pc-gebruikers voorstelde die het nog nooit hadden gezien - een pad naar bekendheid dat veel leek op dat van Minesweeper zelf.",
    freecell_history_spread_p2: "Microsofts versie kwam met een vaste set van 32.000 genummerde indelingen in plaats van elke keer een verse willekeurige schudding, waardoor spelers notities konden vergelijken en een specifieke indeling opnieuw konden spelen - een conventie die deze PaperGames-versie niet volgt, en die in plaats daarvan elke keer een echt verse schudding genereert.",
    freecell_history_modern_title: "De Indeling die (Bijna) Altijd Wint",
    freecell_history_modern_p1: "Omdat elke kaart vanaf het begin zichtbaar is, leent FreeCell zich ongewoon goed voor computeranalyse: van Microsofts oorspronkelijke 32.000 genummerde indelingen ontdekten uitputtende solver-zoektochten dat op één na - indeling nummer 11.982 - allemaal oplosbaar zijn, een stukje trivia dat FreeCell-liefhebbers decennia later nog steeds ter sprake brengen.",
    freecell_history_modern_p2: "Later onderzoek dreef de analyse verder door en bevestigde dat slechts een handvol indelingen onder de eerste miljoen genummerde spellen onoplosbaar zijn - wat precies is waarom een gewone willekeurige schudding, zoals deze versie gebruikt, zo'n veilige gok is: de kans om net op een van die zeldzame uitzonderingen te landen, is verwaarloosbaar klein."
});
I18n.markTextLoaded("nl");
