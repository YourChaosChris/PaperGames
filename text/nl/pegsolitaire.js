// text/nl/pegsolitaire.js
// Rules and history texts of pegsolitaire (nl). Loaded by pegsolitaire-rules.html and pegsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    pegsolitaire_rules_title: "Solitaire-regels",
    pegsolitaire_rules_intro: "Een korte samenvatting van hoe PaperGames Solitaire (Peg Solitaire) speelt - handig als je wat roestig bent, of het net leert.",
    pegsolitaire_rules_basics_title: "Het basisidee",
    pegsolitaire_term_board: "Het bord en de startopstelling",
    pegsolitaire_rules_board: "Voor de partij kies je het bord; het Engelse bord (33 gaten) staat vooraf ingesteld. Elk gat begint met een pin, op één na – welk gat dat is, staat per bord onder „De borden”.",
    pegsolitaire_term_jump: "Springen",
    pegsolitaire_rules_jump: "Selecteer een pin en kies dan een leeg gaatje twee plaatsen verderop in een rechte lijn (omhoog, omlaag, links of rechts - nooit diagonaal), met nog een pin die er precies tussenin staat. De pin springt naar het lege gaatje, en de pin waar hij overheen sprong wordt van het bord verwijderd. Uitzondering: op het driehoekige bord mag je ook schuin springen, langs de schuine lijnen.",
    pegsolitaire_rules_end_title: "Een spel afronden",
    pegsolitaire_term_win: "Opgelost",
    pegsolitaire_rules_win: "Het klassieke doel is om je een weg te springen naar één overgebleven pin. Het spel eindigt ook, onopgelost, zodra er geen legale sprong meer over is, hoeveel pinnen er dan ook nog op het bord staan.",
    pegsolitaire_rules_boards_title: "De borden",
    pegsolitaire_rules_boards: "Engels: een raster van 7x7 zonder de vier hoeken van 2x2, 33 gaten; het midden is leeg. Europees: een raster van 7x7 waarvan per hoek maar drie gaten zijn weggelaten, 37 gaten; leeg is het gat direct boven het midden, want vanuit het midden is het niet oplosbaar. Duits (J. C. Wiegleb, 1779): een raster van 9x9 zonder de vier hoeken van 3x3, 45 gaten; het midden is leeg. Vierkant: het volledige raster van 6x6, 36 gaten; leeg is het linkerbovenste van de vier middelste gaten. Grote ruit: een ruit van 41 gaten op een raster van 9x9; leeg is het gat twee rijen boven het midden – op dit bord zijn maar heel weinig startgaten überhaupt oplosbaar. Driehoek: vijf rijen van 1 tot 5 gaten, elke rij een half gat verschoven, 15 gaten; leeg is het linkerbovenste van de drie middelste gaten. Op alle borden met een vierkant raster spring je alleen horizontaal of verticaal, nooit diagonaal. Alleen op de driehoek mag je ook schuin springen, langs de schuine lijnen – in totaal in zes richtingen.",
    pegsolitaire_history_title: "De Geschiedenis van Solitaire (Peg Solitaire)",
    pegsolitaire_history_origins_title: "Een Frans Hofspel",
    pegsolitaire_history_origins_p1: "Het vroegste bevestigde bewijs voor Solitaire komt uit het Frankrijk van eind 17e eeuw, waar het spel voorkomt in een gravure uit 1697 en populair genoeg was aan het hof van Lodewijk XIV om in tijdgenoten geschriften vermeld te worden. Een populaire legende schrijft de uitvinding toe aan een Franse edelman die in de Bastille gevangenzat - een charmant verhaal zonder enig bewijs, en vrijwel zeker pas achteraf verzonnen om het spel een romantischer oorsprong te geven.",
    pegsolitaire_history_origins_p2: "Het bord dat in Frankrijk de standaard werd, heeft 37 gaatjes (met vier extra hoeken toegevoegd aan het gewone kruis), terwijl de versie die zich naar Engeland verspreidde - het 33-gaatjes-kruis dat hier gebruikt wordt - de meer gangbare Engelstalige standaard werd.",
    pegsolitaire_history_spread_title: "Eén Bord, Veel Vormen",
    pegsolitaire_history_spread_p1: "Naast het klassieke kruis zijn Solitaire-borden ook gebouwd in driehoeksvorm (met een eigen versie van 15 pinnen, decennialang een vast onderdeel van Amerikaanse restauranttafels), ruitvormen en andere opstellingen - de sprongregel blijft altijd hetzelfde, ongeacht in welke vorm de gaatjes zijn gerangschikt.",
    pegsolitaire_history_wiegleb: "Een groter kruis met 45 gaten op een raster van 9x9 beschreef J. C. Wiegleb in 1779 in zijn boek „Unterricht in der natürlichen Magie” (Lessen in natuurlijke magie).",
    pegsolitaire_history_spread_p2: "Omdat elke zet precies één pin verwijdert, kost een volledige partij van n pinnen naar 1 altijd precies n-1 sprongen - een van de weinige bordspellen waarbij het aantal zetten van een gewonnen partij van tevoren vaststaat, ongeacht welke specifieke reeks sprongen daar uiteindelijk toe leidt.",
    pegsolitaire_history_modern_title: "Een Opgeloste Puzzel, met een Wending",
    pegsolitaire_history_modern_p1: "Solitaire trok in de jaren 60 en 70 serieuze wiskundige aandacht, toen onderzoekers waaronder John Conway het analyseerden met hulpmiddelen als hulpbrontellingen (zogeheten pagodefuncties) en algebraïsche argumenten, om precies uit te zoeken welke uiteindelijke één-pin-posities bereikbaar zijn vanaf de standaard startopstelling - het midden is er één van, maar niet de enige.",
    pegsolitaire_history_modern_p2: "Latere computerzoektochten losten de vraag voor het 33-gaatjes-bord volledig op: een partij die begint met een leeg midden kan worden afgemaakt tot één pin, en het exacte aantal winnende partijen is berekend - een zeldzaam geval waarin een fysieke puzzel uitgroeide tot een volledig opgelost combinatorisch probleem."
});
I18n.markTextLoaded("nl");
