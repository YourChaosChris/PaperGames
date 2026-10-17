// text/nl/cratepusher.js
// Rules and history texts of cratepusher (nl). Loaded by cratepusher-rules.html and cratepusher-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    sudoku_rules_basics_title: "Het basisidee",
    cratepusher_rules_title: "Spelregels Kistenschuiver",
    cratepusher_rules_intro: "Zo werkt Kistenschuiver op PaperGames: een puzzel voor één persoon waarin je kisten verplaatst in een kleine opslagruimte.",
    cratepusher_term_board: "Het speelveld",
    cratepusher_rules_board: "Een rechthoekig raster van muren (helemaal zwart) en vloer (wit). Op de vloer sta jij (een gevulde cirkel), staan een paar kisten (een vierkant met een kruis) en precies evenveel doelvakken (een klein hol vierkant). Een kist op een doelvak wordt een gevuld vierkant.",
    cratepusher_term_move: "Bewegen",
    cratepusher_rules_move: "Je beweegt vak voor vak omhoog, omlaag, naar links of naar rechts – nooit schuin. Door muren en kisten kun je niet heen.",
    cratepusher_rules_move_targets: "Over lege doelvakken mag je lopen; alleen muren en kisten houden je tegen.",
    cratepusher_rules_hint: "‘Tip’ laat je precies één duw zien: de eerste duw van een kortste oplossing vanaf je huidige stand. De kist die je moet duwen krijgt een gestreepte rand, het vak waar hij heen moet een doorgetrokken rand, en een zin onder het bord noemt rij, kolom en richting (geteld zonder de buitenmuur). De tip laat de duw alleen zien – duwen doe je zelf. Tik voor de volgende gewoon nog eens op ‘Tip’. Is er vanaf je stand geen oplossing meer, dan zegt de tip dat. Tips worden niet opgeslagen en veranderen niets aan je statistieken.",
    cratepusher_term_push: "Duwen",
    cratepusher_rules_push: "Loop je tegen een kist, dan duw je die één vak verder, maar alleen als het vak erachter vrij is: geen muur en geen tweede kist. Je duwt altijd maar één kist tegelijk, en je kunt een kist nooit naar je toe trekken.",
    cratepusher_term_goal: "Het doel",
    cratepusher_rules_goal: "Het level is opgelost zodra elke kist op een doelvak staat. Welke kist op welk doelvak komt, maakt niet uit.",
    cratepusher_term_stuck: "Vastlopen",
    cratepusher_rules_stuck: "Omdat je kisten niet kunt trekken, kan één onnadenkende duw een level onoplosbaar maken – bijvoorbeeld een kist die in een hoek wordt geduwd die geen doelvak is. Het spel waarschuwt je als een kist in zo'n hoek vastzit. Andere doodlopende situaties worden niet gemeld: denk vooruit en gebruik ‘Zet terug’ zo vaak als je wilt.",
    cratepusher_term_controls: "Bediening",
    cratepusher_rules_controls: "Tik op een vak naast je om erheen te gaan (en een kist die daar staat te duwen). Tik je op een vloervak verderop, dan loop je er via de kortste weg heen – maar alleen als je er kunt komen zonder een kist te duwen. Ook de pijltjestoetsen en W, A, S, D bewegen je. ‘Zet terug’ neemt je zetten één voor één terug, zoveel als je wilt; ‘Level opnieuw’ begint het level opnieuw.",
    cratepusher_term_levels: "De levels",
    cratepusher_rules_levels: "Elk level bouwt PaperGames zelf, elke keer nieuw: makkelijk op een raster van 7x7 met 3 kisten, gemiddeld op 9x9 met 4, moeilijk op 10x10 met 5. Het programma bouwt elk level achterstevoren vanuit de opgeloste stand, dus het is altijd oplosbaar, en controleert het daarna nog eens met een eigen oplosser. Hoe vaak de beste oplossing moet duwen, staat boven het speelveld, samen met je stappen, je keren duwen en hoeveel kisten al op een doelvak staan.",
    cratepusher_history_title: "De geschiedenis van Kistenschuiver",
    cratepusher_history_origins_title: "Een idee uit 1981",
    cratepusher_history_origins_p1: "Het principe om kisten één voor één naar gemarkeerde plekken te duwen, zonder ze ooit te trekken, werd in 1981 bedacht door Hiroyuki Imabayashi. In 1982 bracht het Japanse bedrijf Thinking Rabbit het uit als computerspel onder de naam Sokoban.",
    cratepusher_history_origins_p2: "Achter de eenvoudige regels schuilt echte diepgang: zelfs kleine ruimtes kunnen lange, zorgvuldig geplande reeksen zetten vragen, en informatici hebben aangetoond dat zulke puzzels in het algemeen erg moeilijk op te lossen zijn. Het idee is sindsdien door talloze puzzelspellen overgenomen.",
    cratepusher_history_names_title: "Waarom een andere naam",
    cratepusher_history_names_p1: "Sokoban is een geregistreerd handelsmerk van Falcon Co., Ltd. PaperGames heeft geen enkele band met Falcon of met het oorspronkelijke spel en gebruikt daarom een eigen naam: Kistenschuiver. Hetzelfde gebeurt bij Calcudoku, dat om dezelfde reden onder een eigen naam wordt gespeeld.",
    cratepusher_history_names_p2: "Geen van de levels hier komt uit het oorspronkelijke spel of uit een levelverzameling. Elk level wordt door het eigen programma van PaperGames gemaakt als je erom vraagt – achterstevoren gebouwd vanuit de opgeloste stand en gecontroleerd met een eigen oplosser."
});
I18n.markTextLoaded("nl");
