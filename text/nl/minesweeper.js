// text/nl/minesweeper.js
// Rules and history texts of minesweeper (nl). Loaded by minesweeper-rules.html and minesweeper-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    minesweeper_rules_title: "Minesweeper-regels",
    minesweeper_rules_intro: "Een korte samenvatting van hoe PaperGames Minesweeper speelt - handig als je wat roestig bent, of het net leert.",
    minesweeper_rules_basics_title: "Het basisidee",
    minesweeper_term_board: "Het rooster en de eerste klik",
    minesweeper_rules_board: "Verborgen mijnen liggen verspreid over het rooster. Je eerste onthulling is altijd gegarandeerd veilig - de mijnen worden pas daarna geplaatst, waarbij dat vakje en alles eromheen vermeden wordt - zodat het spel nooit kan eindigen voordat het begonnen is.",
    minesweeper_term_numbers: "De cijfers lezen",
    minesweeper_rules_numbers: "Een veilig vakje onthullen laat een cijfer zien: hoeveel mijnen zich in de acht aangrenzende vakjes verstoppen. Een leeg vakje betekent nul, en het onthullen ervan opent automatisch het hele aaneengesloten lege gebied voor je.",
    minesweeper_term_flags: "Vlaggen zetten",
    minesweeper_rules_flags: "Markeer een vakje waarvan je vermoedt dat er een mijn onder zit met een vlag, via de vlagmodus (voor touchscreens) of een rechtermuisklik (in een desktopbrowser) - vlagvakjes kunnen niet per ongeluk onthuld worden. Klikken op een al onthuld cijfer waarvan het aantal vlaggen ernaast overeenkomt, onthult in één keer de rest van de buren, precies zoals een middelste-muisknopklik in het klassieke desktopspel - maar een verkeerd geplaatste vlag kan je op deze manier alsnog het spel kosten.",
    minesweeper_rules_end_title: "Hoe een partij eindigt",
    minesweeper_term_win: "Winnen",
    minesweeper_rules_win: "Onthul elk vakje dat geen mijn is en je hebt het bord vrijgemaakt.",
    minesweeper_term_loss: "Verliezen",
    minesweeper_rules_loss: "Onthul een mijn en het spel eindigt meteen - elke mijn op het bord wordt getoond, waarbij de mijn die je te pakken kreeg apart van de rest wordt gemarkeerd.",
    minesweeper_history_title: "De Geschiedenis van Minesweeper",
    minesweeper_history_origins_title: "Van Mainframe naar Bureaublad",
    minesweeper_history_origins_p1: "Onthullen-en-afleiden-spellen in de stijl van Minesweeper gaan terug tot de vroege jaren 60 en verschenen onder verschillende namen op mainframes en vroege personal computers tot in de jaren 80, waaronder een Windows/OS2-versie uit 1989 genaamd 'Mined-Out' en verscheidene freeware-klonen met namen als 'RLogic' en 'Cube'.",
    minesweeper_history_origins_p2: "De Windows-versie die het spel bekend maakte, gaat terug op twee medewerkers van Microsoft: Curt Johnson schreef het spel eerst voor OS/2 van IBM, en Robert Donner zette het over naar Windows. Het verscheen eerst in 1990 in het Microsoft Entertainment Pack en hoorde vanaf 1992 bij de standaardinstallatie van Windows 3.1, waar het het eerdere Windows-spel Reversi verving.",
    minesweeper_history_spread_title: "Geïnstalleerd op Elk Bureau",
    minesweeper_history_spread_p1: "Omdat Windows in de jaren 90 en 2000 op zo'n overweldigend deel van 's werelds pc's draaide, werd Minesweeper vrijwel als vanzelf een van de meest gespeelde computerspellen ooit - overal geïnstalleerd, zonder handleiding te spelen, en perfect voor de rustige minuten tussen echt werk door.",
    minesweeper_history_spread_p2: "De gegarandeerd veilige eerste klik, nu beschouwd als een kernonderdeel van de regels, was zelf een latere verfijning: de originele versie uit 1992 kon je soms al bij de allereerste klik laten omkomen, een frustratie die latere versies wegwerkten door de mijnplaatsing pas na die eerste onthulling te laten plaatsvinden - dezelfde aanpak die hier wordt gebruikt.",
    minesweeper_history_modern_title: "Een Werkelijk Moeilijke Puzzel",
    minesweeper_history_modern_p1: "Los van de nostalgie blijkt Minesweeper wiskundig serieus te zijn: in 2000 bewees Richard Kaye dat bepalen of een gegeven, gedeeltelijk onthuld Minesweeper-bord een oplossing heeft die consistent is met zijn aanwijzingen, NP-volledig is, wat het in dezelfde complexiteitsklasse plaatst als notoir lastige problemen zoals het handelsreizigersprobleem.",
    minesweeper_history_modern_p2: "Dat resultaat betekent dat er geen bekend kortere-weg-algoritme bestaat dat elke willekeurige Minesweeper-stelling altijd snel oplost - in de moeilijkste gevallen blijft een speler (of een computer) over met een echte 50/50-gok, zonder het veilige vakje puur uit logica te kunnen afleiden - precies het moment dat elke ervaren speler heeft leren vrezen."
});
I18n.markTextLoaded("nl");
