// text/fr/skyscrapers.js
// Rules and history texts of skyscrapers (fr). Loaded by skyscrapers-rules.html and skyscrapers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    skyscrapers_rules_title: "Règles des Gratte-ciel",
    skyscrapers_rules_intro: "Un mémo rapide sur la façon dont PaperGames joue aux Gratte-ciel (Skyscrapers) - utile si vous êtes rouillé, ou si vous apprenez.",
    skyscrapers_rules_basics_title: "L'idée de base",
    skyscrapers_term_board: "La grille",
    skyscrapers_rules_board: "Chaque case contient la hauteur d'un bâtiment, de 1 (le plus bas) à N (le plus haut, N étant la taille de la grille). Autour de la grille, certaines lignes et colonnes portent un indice numérique juste après ce bord - pas nécessairement chaque ligne ou colonne, ni nécessairement de chaque côté.",
    skyscrapers_term_clues: "Lire les indices de bord",
    skyscrapers_rules_clues: "Un indice donne le nombre de bâtiments que l'on verrait en regardant dans cette ligne ou cette colonne depuis ce côté, sachant qu'un bâtiment plus haut cache complètement tout bâtiment plus bas placé devant lui depuis ce point de vue. Les indices du haut regardent leur colonne vers le bas, ceux du bas la regardent vers le haut, ceux de gauche regardent leur ligne vers la droite, et ceux de droite la regardent vers la gauche.",
    skyscrapers_term_goal: "L'objectif",
    skyscrapers_rules_goal: "Remplissez chaque case d'une hauteur de 1 à N afin que chaque ligne et chaque colonne contienne chaque hauteur exactement une fois (la même règle que les lignes et colonnes du Sudoku, mais sans règle de bloc), et que chaque indice affiché autour de la grille corresponde au nombre de bâtiments réellement visibles depuis ce côté.",
    skyscrapers_term_input: "Saisir les hauteurs",
    skyscrapers_rules_input: "Sélectionnez une case, puis choisissez une hauteur sur le pavé sous la grille (ou tapez un chiffre au clavier). Une case au contour pointillé répète actuellement une hauteur déjà utilisée ailleurs dans sa ligne ou sa colonne - c'est le signal que quelque chose doit changer.",
    skyscrapers_term_difficulty: "Difficulté",
    skyscrapers_rules_difficulty: "Les niveaux Facile, Moyen et Difficile utilisent des grilles de plus en plus grandes (4x4, 5x5 et 6x6), avec de moins en moins d'indices de bord révélés - plus de hauteurs à jongler à la fois, mais toujours les deux mêmes règles.",
    skyscrapers_rules_example_title: "Un exemple résolu",
    skyscrapers_term_example: "Compter les bâtiments visibles",
    skyscrapers_rules_example_p1: "Prenez une ligne de quatre bâtiments, hauteurs 3, 1, 4, 2, lue de gauche à droite. En regardant depuis la gauche : le 3 est visible en premier, puisque rien de plus haut ne l'a précédé. Le 1 est plus bas que le 3 déjà vu, donc il reste caché derrière lui. Le 4 est plus haut que tout ce qui précède, donc il est visible aussi. Le 2 est plus bas que le 4, donc il reste caché.",
    skyscrapers_rules_example_p2: "Cela fait 2 bâtiments visibles depuis la gauche - le 3 et le 4 - donc un indice de gauche de 2 correspond à cette ligne. En regardant cette même ligne depuis la droite (lue dans l'ordre de vue 2, 4, 1, 3) : le 2 est visible en premier, le 4 est plus haut donc visible aussi, et le 1 comme le 3 qui suivent sont tous deux plus bas que le 4 déjà vu, donc ni l'un ni l'autre n'est visible - un indice de droite de 2 également, ici purement par coïncidence pour cette ligne précise.",
    skyscrapers_rules_end_title: "Terminer une grille",
    skyscrapers_term_win: "Résolu",
    skyscrapers_rules_win: "La grille est résolue dès qu'elle est entièrement remplie, que chaque ligne et chaque colonne contient chaque hauteur exactement une fois, et que chaque indice de bord correspond au nombre réel de bâtiments visibles de sa ligne ou de sa colonne.",
    skyscrapers_history_title: "L'histoire des Gratte-ciel",
    skyscrapers_history_origins_title: "Des racines dans les magazines de jeux",
    skyscrapers_history_origins_p1: "Contrairement au Sudoku, les Gratte-ciel n'ont pas d'inventeur unique bien documenté ni de date de première publication sur laquelle les historiens s'accordent. Comme beaucoup de genres de puzzles logiques, le jeu semble avoir émergé et s'être répandu progressivement à travers la culture des magazines de jeux plutôt que d'être attribué à un créateur nommé à un moment précis - l'idée de l'indice de visibilité est assez simple pour que plusieurs concepteurs de puzzles y soient plausiblement arrivés indépendamment les uns des autres.",
    skyscrapers_history_origins_p2: "Ce qui est certain, en revanche, c'est la mathématique qui la sous-tend : comme le Sudoku, une grille de Gratte-ciel résolue est un carré latin - une grille où chaque symbole, ici une hauteur de bâtiment, apparaît exactement une fois par ligne et par colonne -, un objet étudié par Leonhard Euler au XVIIIe siècle, bien avant l'existence de l'un ou l'autre de ces deux jeux.",
    skyscrapers_history_spread_title: "Un jeu de compétition",
    skyscrapers_history_spread_p1: "Les Gratte-ciel ont trouvé leur plus large public international à travers le jeu de compétition, en particulier le Championnat du monde de puzzle (World Puzzle Championship), une compétition internationale annuelle organisée pour la première fois en 1992, où ils comptent parmi les genres standards récurrents, aux côtés de la famille du Sudoku et d'autres puzzles fondés sur les carrés latins.",
    skyscrapers_history_spread_p2: "Ce cadre compétitif a contribué à fixer les règles et la présentation du jeu dans la forme standard jouée aujourd'hui, même sans inventeur unique reconnu - un peu comme plusieurs genres de puzzles récurrents doivent leur forme définitive moins à un créateur unique qu'à un usage répété dans les magazines de jeux et les recueils de puzzles de championnat.",
    skyscrapers_history_modern_title: "Des carrés latins, vus de l'extérieur",
    skyscrapers_history_modern_p1: "Ce qui rend les Gratte-ciel conceptuellement singuliers, c'est la manière dont ils superposent une idée spatiale et visuelle - regarder le long d'une ligne de bâtiments et compter combien sont assez hauts pour être vus - à une logique déjà familière grâce aux lignes et colonnes du Sudoku. C'est exactement cette combinaison qui donne son nom au jeu et sa présentation thématique, à la différence de la simple grille de chiffres que présentent un Sudoku ou un puzzle de carré latin nu.",
    skyscrapers_history_modern_p2: "C'est aussi exactement la propriété sur laquelle s'appuie, à l'envers, le générateur de PaperGames : puisqu'un indice de bord n'est en réalité qu'un fait calculé à partir d'une grille terminée, chaque grille ici est produite en construisant d'abord une grille complète et valide, en en calculant tous les indices possibles, puis en ne conservant que le nombre d'indices suffisant pour que la grille garde une solution unique - la même approche de génération puis réduction qu'utilisent les générateurs de Sudoku et de Kakuro de cette collection, adaptée à une contrainte différente."
});
I18n.markTextLoaded("fr");
