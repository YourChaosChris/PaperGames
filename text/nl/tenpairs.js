// text/nl/tenpairs.js
// Rules and history texts of tenpairs (nl). Loaded by tenpairs-rules.html and tenpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    tp_rules_title: "Regels van Tienparen",
    tp_rules_intro: "Streep paren cijfers weg tot er geen meer over is.",
    tp_rules_basics_title: "De regels",
    tp_term_field: "Het veld",
    tp_rules_field: "Cijfers 1 tot 9 in negen kolommen, rij voor rij gelezen als een tekst.",
    tp_term_pairs: "Paren",
    tp_rules_pairs: "Twee cijfers worden samen weggestreept als ze gelijk zijn (3 en 3) of samen 10 maken (1 en 9, 2 en 8, 3 en 7, 4 en 6, 5 en 5).",
    tp_term_see: "Elkaar zien",
    tp_rules_see: "De twee moeten elkaar zien: direct naast elkaar horizontaal, verticaal of diagonaal, of met alleen weggestreepte vakjes ertussen op die lijn. Horizontaal gaat het ook over het einde van een rij: het laatste cijfer van een rij ziet het eerste van de volgende, enzovoort in leesrichting.",
    tp_term_add: "Aanvullen",
    tp_rules_add: "Kom je niet verder, tik dan op Aanvullen: alle nog niet weggestreepte cijfers worden in dezelfde volgorde achter het veld opnieuw geschreven. Hoogstens 5 keer per spel.",
    tp_term_rows: "Lege rijen",
    tp_rules_rows: "Een rij waarvan alle negen vakjes zijn weggestreept, verdwijnt.",
    tp_term_end: "Winnen en verliezen",
    tp_rules_end: "Je wint als alle cijfers zijn weggestreept. Je verliest als er geen paar en geen aanvullen meer over is, of als het veld groeit tot meer dan 40 rijen.",
    tp_term_start: "Start",
    tp_rules_start: "Klassiek: 1 2 3 4 5 6 7 8 9, dan 1 1 1 2 1 3 1 4 1 5 1 6 1 7 1 8 1 9 (de getallen 1 tot 19 zonder 10). Willekeurig: drie, vier of vijf rijen; hoe makkelijker het niveau, hoe meer paren direct naast elkaar staan.",
    tp_term_help: "Hulp",
    tp_rules_help: "Ongedaan maken gaat zoveel stappen terug als je wilt. Tip markeert een paar dat je kunt wegstrepen, of zegt dat alleen Aanvullen nog helpt.",
    tp_rules_example_title: "Voorbeeld",
    tp_rules_example: "De klassieke start. De 1 linksboven en de 1 eronder zien elkaar (verticaal) en zijn gelijk. De 9 aan het eind van de eerste rij en de 1 aan het begin van de tweede zien elkaar over het einde van de rij en maken samen 10.",
    tp_history_title: "Geschiedenis van Tienparen",
    tp_history_origins_title: "Uit schoolschriften",
    tp_history_origins_p1: "Waar de puzzel vandaan komt, is niet vastgelegd in de bronnen die PaperGames kon nagaan. Een artikel uit 2011 op de Russische website Habr herinnert zich hem van school en universiteit: hij werd gespeeld in geruite schriften, onder namen als \"getallen\", \"cijfers\", \"zaadjes\" of \"19\" – een officiële naam was er niet. Daar begint het spel met de getallen 1 tot 19 (zonder 10) op een rij, dezelfde cijfers als de klassieke start hier, en als er geen paar meer is, schrijf je de overgebleven cijfers aan het eind.",
    tp_history_name_title: "De naam",
    tp_history_name_p1: "\"Tienparen\" zegt gewoon waar het om gaat. Verschillende apps spelen hetzelfde idee onder eigen namen; PaperGames gebruikt die niet. De diagonale paren en de grenzen van 5 keer aanvullen en 40 rijen zijn regels van PaperGames."
});
I18n.markTextLoaded("nl");
