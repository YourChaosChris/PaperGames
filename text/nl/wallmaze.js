// text/nl/wallmaze.js
// Rules and history texts of wallmaze (nl). Loaded by wallmaze-rules.html and wallmaze-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    wallmaze_rules_title: "Muurlabyrint-regels",
    wallmaze_rules_intro: "Een snel overzicht van hoe PaperGames het Muurlabyrint speelt - handig als je het even kwijt bent, of het net leert.",
    wallmaze_rules_basics_title: "Het basisidee",
    wallmaze_term_setup: "De opstelling",
    wallmaze_rules_setup: "Elke speler heeft één pion, die start in het midden van zijn eigen rand van een 9x9-bord, en tien muren in reserve. Speler 1 mikt op de verste rij onderaan, speler 2 op de verste rij bovenaan - wie zijn pion daar het eerst krijgt, wint.",
    wallmaze_term_moving: "Je pion bewegen",
    wallmaze_rules_moving: "Op je beurt beweeg je je pion één veld omhoog, omlaag, links of rechts, of je plaatst een muur. Staan de twee pionnen naast elkaar, dan mag je recht over de andere pion springen; blokkeert een muur of de rand van het bord die sprong, dan mag je in plaats daarvan diagonaal eromheen stappen.",
    wallmaze_term_walls: "Muren plaatsen",
    wallmaze_rules_walls: "Een muur is twee velden lang en blokkeert beweging er recht overheen, voor beide spelers. Muren mogen elkaar nooit overlappen of kruisen, en een muur mag nooit geplaatst worden als die de laatst overgebleven weg van een speler naar zijn doelrij zou afsluiten - er is altijd minstens één doorgang.",
    wallmaze_rules_end_title: "Het spel winnen",
    wallmaze_term_win: "Hoe het spel eindigt",
    wallmaze_rules_win: "Zodra de pion van een speler een willekeurig veld van zijn doelrij bereikt, wint hij - de kolom maakt niet uit.",
    wallmaze_history_title: "De Geschiedenis van het Muurlabyrint",
    wallmaze_history_origins_title: "Een Ontwerp uit de Jaren 90",
    wallmaze_history_origins_p1: "Quoridor werd ontworpen door Mirko Marchesi en in 1997 voor het eerst uitgebracht door het Franse spellenbedrijf Gigamic, en werd al snel een van de bekendste titels van het bedrijf, naast andere compacte abstracte tweespellersspellen.",
    wallmaze_history_origins_p2: "Het behoort tot een bredere familie van \"blokkerende doolhof\"-spellen, waarbij het bord zelf van vorm verandert in de loop van het spel, in plaats van vast te blijven zoals een schaakbord - elke muur die een speler plaatst, hervormt permanent de paden die beide pionnen voor de rest van het spel kunnen nemen.",
    wallmaze_history_design_title: "Eenvoudige Regels, Echte Diepgang",
    wallmaze_history_design_p1: "Het hele regelwerk past op één kaartje - beweeg je pion of plaats een muur, bereik de overkant om te winnen - toch geeft de spanning tussen vooruitrennen en een beurt opofferen om juist je tegenstander te blokkeren het echte strategische diepgang, en het wordt in de speldesign-literatuur vaak aangehaald als voorbeeld van elegante eenvoud.",
    wallmaze_history_design_p2: "Quoridor is ook bestudeerd als een informaticaprobleem: omdat de toestandsruimte groot maar goed gestructureerd is (pionposities plus muurplaatsingen, met een padverbindingsregel die gehandhaafd moet worden), is het een populair doelwit voor zowel klassieke zoekgebaseerde AI als, recenter, agents met reinforcement learning.",
    wallmaze_history_names_title: "Waarom een andere naam",
    wallmaze_history_names_p1: "Hetzelfde spelprincipe verschijnt commercieel onder de naam Quoridor, in 1997 ontworpen door Mirko Marchesi en uitgegeven door Gigamic. Quoridor is een geregistreerd merk. PaperGames heeft geen band met Gigamic of dat spel en gebruikt daarom de eigen naam Muurlabyrint.",
    wallmaze_history_version_title: "Deze Versie",
    wallmaze_history_version_p1: "PaperGames speelt de standaardregels op het standaard 9x9-bord met tien muren per speler. Een muur plaatsen is een eigen kleine modus: tik op \"Muur plaatsen\", tik ergens op het bord om de dichtstbijzijnde toegestane muur daar in voorbeeld te zien, en bevestig - een op een touchscreen bewust ruim doelvlak, in plaats van een precieze plek te moeten raken."
});
I18n.markTextLoaded("nl");
