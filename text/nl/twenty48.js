// text/nl/twenty48.js
// Rules and history texts of twenty48 (nl). Loaded by twenty48-rules.html and twenty48-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    twenty48_rules_title: "2048-regels",
    twenty48_rules_intro: "Een korte samenvatting van hoe PaperGames 2048 speelt - handig als je wat roestig bent, of het net leert.",
    twenty48_rules_basics_title: "Het basisidee",
    twenty48_term_board: "Het bord en schuiven",
    twenty48_rules_board: "Elke zet schuift alle tegels op het 4x4-bord zo ver mogelijk in één richting - omhoog, omlaag, links of rechts. Na elke zet die daadwerkelijk iets verschuift, verschijnt er een nieuwe tegel (meestal een 2, af en toe een 4) op een willekeurig leeg vakje.",
    twenty48_term_merging: "Samenvoegen",
    twenty48_rules_merging: "Wanneer twee tegels met dezelfde waarde tijdens het schuiven tegen elkaar aan komen, versmelten ze tot één tegel ter waarde van hun som, wat die nieuwe waarde aan je score toevoegt. Elke tegel kan maar één keer per zet samenvoegen, dus drie gelijke tegels die samen schuiven, voegen alleen het voorste paar samen en laten de derde tegel met rust, in plaats van door te cascaderen.",
    twenty48_rules_end_title: "Hoe een partij eindigt",
    twenty48_term_win: "2048 bereiken",
    twenty48_rules_win: "Werk je een weg naar boven tot een 2048-tegel en je hebt gewonnen - maar het spel stopt daar niet. Speel daarna verder om je score (en het bord) nog verder op te drijven.",
    twenty48_term_loss: "Geen zetten meer",
    twenty48_rules_loss: "Het spel eindigt op het moment dat het bord volledig vol is en geen twee aangrenzende tegels dezelfde waarde delen, zodat geen enkele zet - in welke richting dan ook - nog iets zou veranderen.",
    twenty48_history_title: "De Geschiedenis van 2048",
    twenty48_history_origins_title: "Gebouwd op Threes",
    twenty48_history_origins_p1: "2048 werd in maart 2014 gemaakt door de toen 19-jarige Italiaanse ontwikkelaar Gabriele Cirulli, in één enkel weekend, als persoonlijke oefening om snel een compleet spel te leren bouwen. Hij verzon de kernmechaniek niet zelf: 2048 is een expliciete kloon van een spel genaamd 1024 (van Veewo Studio), dat op zijn beurt was geïnspireerd door een eerder spel genaamd Threes! (van Asher Vollmer, Greg Wohlwend en Jimmy Hinson) dat al meer dan een jaar zorgvuldig in ontwikkeling was.",
    twenty48_history_origins_p2: "Cirulli gaf de broncode van 2048 vanaf dag één gratis vrij onder een open licentie, wat enorm belangrijk bleek: in plaats van klonen tegen te houden, nodigde hij ze juist uit - het spel verspreidde zich doordat het eindeloos en legaal werd nagebouwd, in plaats van alleen maar gespeeld.",
    twenty48_history_spread_title: "Een Virale, Veelvuldig Gekloonde Sensatie",
    twenty48_history_spread_p1: "Het spel ging binnen dagen na de release viraal, trok naar verluidt binnen de eerste twee weken al miljoenen spelers, en veroorzaakte een enorme golf van klonen, ports en varianten - omgestyleerde versies met van alles van emoji tot popcultuurfiguren, plus formaatvarianten, varianten met gekleurde tegels en driedimensionale versies.",
    twenty48_history_spread_p2: "Deze PaperGames-versie houdt bewust vast aan het originele 4x4-bord en de 90%/10%-verhouding voor tweeën en vieren, in plaats van een van die varianten te kiezen - dezelfde keuze die deze verzameling overal elders maakt: de voorkeur geven aan het standaard, goed begrepen regelwerk boven een nieuwe draai eraan.",
    twenty48_history_modern_title: "Een Klein Bord, Serieus Bestudeerd",
    twenty48_history_modern_p1: "Ondanks zijn eenvoudige regels blijkt optimaal 2048-spel een werkelijk lastig zoekprobleem te zijn, vanwege de willekeur bij het verschijnen van tegels: sterke computerspelers gebruiken expectimax-zoeken (dat zetten afweegt tegen de kans op elke mogelijke volgende tegel) in plaats van de eenvoudige minimax-zoekmethode die een deterministisch spel als schaken toelaat.",
    twenty48_history_modern_p2: "De best gedocumenteerde computerspelers kunnen met hoge waarschijnlijkheid de tegel 32768 bereiken en hebben af en toe zelfs 65536 gehaald - twee verdubbelingen voorbij de tegel die de meeste menselijke spelers al als een triomf ervaren om ooit één keer te zien."
});
I18n.markTextLoaded("nl");
