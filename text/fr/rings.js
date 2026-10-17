// text/fr/rings.js
// Rules and history texts of rings (fr). Loaded by rings-rules.html and rings-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    rg_rules_title: "Anneaux tournants – règles",
    rg_rules_intro: "Tournez les anneaux jusqu'à ce que chaque rayon ne montre qu'une forme.",
    rg_rules_basics_title: "Les règles",
    rg_term_rings: "Les anneaux",
    rg_rules_rings: "Trois à cinq anneaux sont emboîtés, numérotés de l'intérieur vers l'extérieur. Chaque anneau a 8 cases portant chacune une forme : cercle, anneau, triangle, carré, étoile, losange, croix ou croissant de lune. Les formes pleines et creuses se distinguent sans couleur.",
    rg_term_turn: "Tourner",
    rg_rules_turn: "Sous l'image, chaque anneau a deux boutons : ↺ le tourne d'une case vers la gauche (sens inverse des aiguilles d'une montre), ↻ d'une case vers la droite (sens des aiguilles d'une montre). L'anneau saute aussitôt à sa nouvelle place.",
    rg_term_goal: "But",
    rg_rules_goal: "Des lignes pointillées divisent l'image en 8 rayons partant du centre. L'énigme est résolue quand chaque rayon montre la même forme sur tous les anneaux. Des rayons différents peuvent montrer des formes différentes.",
    rg_term_coupled: "Anneaux couplés",
    rg_rules_coupled: "En Difficile, les anneaux sont couplés : tourner un anneau fait aussi tourner l'anneau suivant vers l'extérieur d'une case dans le même sens. L'anneau extérieur tourne seul.",
    rg_term_levels: "Niveaux",
    rg_rules_levels: "Facile : 3 anneaux avec 4 sortes de formes, 3 à 5 coups. Moyen : 4 anneaux avec 6 sortes, 5 à 8 coups. Difficile : 5 anneaux couplés avec 8 sortes, 7 à 11 coups. L'ordinateur calcule le nombre minimal de coups de chaque énigme ; il est affiché dès le début.",
    rg_term_help: "Indice",
    rg_rules_help: "« Indice » encadre le bouton d'un coup qui vous rapproche d'un pas de la solution. « Annuler » reprend le dernier coup ; cela compte comme un coup.",
    rg_rules_example_title: "Exemple",
    rg_rules_example: "L'anneau 2 a une case d'avance sur l'anneau 1. Un tour de l'anneau 2 vers la gauche met la même forme sur chaque rayon.",
    rg_history_title: "Histoire des Anneaux tournants",
    rg_history_disk_title: "Le disque de chiffrement d'Alberti",
    rg_history_disk_p1: "En 1467, le savant italien Leon Battista Alberti a décrit dans son traité sur les chiffres un disque de deux anneaux réunis par une goupille : un anneau extérieur fixe portant des lettres et un anneau intérieur tournant portant d'autres signes. En tournant l'anneau intérieur, chaque lettre recevait un autre signe. On le considère comme le premier exemple de chiffre à plusieurs alphabets.",
    rg_history_game_title: "Des anneaux en énigme",
    rg_history_game_p1: "Les énigmes où l'on tourne des anneaux ou des disques illustrés jusqu'à ce que tout s'aligne existent aujourd'hui sous bien des formes, en jouets comme dans les livres d'énigmes. La version d'ici, avec jusqu'à cinq anneaux et, en Difficile, des anneaux qui entraînent leur voisin, est faite pour PaperGames. L'ordinateur vérifie chaque énigme et compte son nombre minimal de coups."
});
I18n.markTextLoaded("fr");
