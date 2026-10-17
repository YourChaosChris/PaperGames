// text/nl/surakarta.js
// Rules and history texts of surakarta (nl). Loaded by surakarta-rules.html and surakarta-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    surakarta_rules_title: "Surakarta-regels",
    surakarta_rules_intro: "Een korte samenvatting van hoe PaperGames Surakarta speelt - handig als je wat roestig bent of het net leert. Het slaan via de lusbanen is het onderdeel waar bijna iedereen in het begin door in de war raakt, dus hieronder staat een volledig uitgewerkt voorbeeld.",
    surakarta_rules_basics_title: "Het basisidee",
    surakarta_term_board: "Het bord",
    surakarta_rules_board: "Een eenvoudig 6x6-rooster van punten. Elke speler begint met 12 stenen die de twee rijen dichtst bij zijn eigen kant vullen (Zwart op de bovenste twee rijen, Wit op de onderste twee), de middelste twee rijen blijven leeg. Zwart begint.",
    surakarta_term_movement: "Zetten doen",
    surakarta_rules_movement: "Op jouw beurt schuif je één steen één stap naar een aangrenzend leeg punt - recht of diagonaal, in elk van de 8 richtingen. Zo'n stap is altijd stil: hij slaat nooit iets, ook niet als hij vlak naast een vijandelijke steen terechtkomt.",
    surakarta_term_loop: "De lusbanen",
    surakarta_rules_loop: "Vier lijnen op het bord - de 2e en 5e rij, en de 2e en 5e kolom - stoppen niet zomaar bij de rand: elk uiteinde van deze vier lijnen buigt naar buiten en verbindt met het dichtstbijzijnde uiteinde van de aangrenzende speciale lijn bij diezelfde hoek, waardoor er rond elk van de 4 hoeken van het bord een lus ontstaat. Een steen die langs een van deze vier lijnen schuift, kan via een lus van de rand af gaan en verderop weer verschijnen op de verbonden lijn, nog steeds in een rechte lijn, zo ver als de baan en eventuele volgende lussen toelaten.",
    surakarta_term_capture: "Slaan",
    surakarta_rules_capture: "Slaan staat helemaal los van zetten doen en werkt alleen via de lusbanen. In plaats van één stap kan een steen helemaal doorschuiven in een van zijn 8 richtingen - waarbij hij elke andere steen, eigen of vijandelijk, zonder effect overslaat - zolang de lijn en de lusverbindingen hem dragen. Zodra hij minstens één lus heeft doorlopen ÉN de volgende steen die hij tegenkomt vijandelijk is, wordt die steen geslagen en landt de schuivende steen op dat veld, waarmee de zet daar eindigt. Loopt de lijn zonder lus van het bord af, of maakt hij een volledige rondgang zonder ooit een geschikte vijandelijke steen tegen te komen, dan is er langs die weg geen slag mogelijk. Slaan is hier optioneel: zelfs als er een slag mogelijk is, mag je in plaats daarvan een stille stap spelen.",
    surakarta_rules_example_title: "Uitgewerkt voorbeeld: een lusslag",
    surakarta_rules_example_intro: "○ is Wit (de steen die in dit voorbeeld zet), ● is Zwart. Wits steen op A staat op een van de vier lusdragende lijnen. Niets blokkeert de weg tot aan de rand, dus in plaats van een stille stap speelt Wit een volledige slagschuif.",
    surakarta_rules_example_caption: "Wits steen op A schuift naar links over de rij. Hij gaat over de rand, volgt de lusbaan om de hoek, en komt weer tevoorschijn terwijl hij de verbonden kolom afgaat. De eerste steen die hij na die lus tegenkomt is Zwarts steen op B - B wordt dus geslagen, en Wits steen landt op het nu lege veld van B (stippellijncirkel). Als A in plaats daarvan maar één stap van een vijandelijke steen had gestaan zonder dat er een lus bij betrokken was, zou die aangrenzende vijand NIET zijn geslagen - alleen een schuif die daadwerkelijk een lus gebruikt, kan slaan.",
    surakarta_rules_end_title: "Hoe een partij eindigt",
    surakarta_term_win: "Winnen",
    surakarta_rules_win: "Je wint door alle stenen van je tegenstander te slaan, of als je tegenstander aan zet helemaal geen geldige zet meer heeft.",
    surakarta_term_resignation: "Opgeven",
    surakarta_rules_resignation: "Een speler kan op elk moment opgeven, waarmee de partij meteen eindigt in het voordeel van de tegenstander.",
    surakarta_history_title: "De geschiedenis van Surakarta",
    surakarta_history_origins_title: "Vernoemd naar een stad op Java",
    surakarta_history_origins_p1: "Surakarta - ook algemeen bekend onder zijn alledaagsere naam Solo - is een stad in Midden-Java, Indonesië, en het spel dat haar naam draagt zou daar traditioneel zijn ontstaan. Zoals bij veel traditionele bordspellen die vooral door het spelen zelf zijn doorgegeven in plaats van door schriftelijke bronnen, zijn de precieze ouderdom en de details van de vroege geschiedenis niet nauwkeurig gedocumenteerd; wat wel duidelijk is, is dat het al heel lang in de regio wordt gespeeld en tot op vandaag sterk met de stad wordt geassocieerd.",
    surakarta_history_unique_title: "Een geliefd voorbeeld van een \"niet-voor-de-hand-liggende\" slagregel",
    surakarta_history_unique_p1: "Surakarta is zelfs onder traditionele spellen ongewoon omdat het zetten doen en slaan opsplitst in twee volledig verschillende mechanismen: een gewone stille zet is slechts één stap naar een naburig punt, terwijl elke slag volledig afhangt van de kenmerkende hoeklussen van het bord - een steen zonder beschikbare lusgeschikte lijn kan die beurt simpelweg niet slaan, hoe omsingeld hij ook is. Die scherpe scheiding, en het feit dat een steen vlak naast een vijandelijk stuk kan liggen in volledige veiligheid, is precies wat het spel doet klikken zodra je het begrijpt - en precies wat het tot een veelgenoemd voorbeeld maakt in gamedesign-discussies over slagmechanismen die niet meteen voor de hand liggen als je naar het bord kijkt.",
    surakarta_history_modern_title: "Nog steeds gespeeld",
    surakarta_history_modern_p1: "Surakarta blijft een levend onderdeel van de traditionele Indonesische spelcultuur en heeft ook ver daarbuiten gereisd: het is een terugkerend onderwerp in kringen van liefhebbers van abstracte spellen en in computerspelonderzoek, juist omdat de slagregel zo bijzonder is, en het duikt op in algemene bordspelverzamelingen en programmeeroefeningen als een compact, op zichzelf staand voorbeeld van een mechanisme dat bijna nergens anders in de traditionele bordspelcanon een equivalent heeft."
});
I18n.markTextLoaded("nl");
