// text/fr/sudoku.js
// Rules and history texts of sudoku (fr). Loaded by sudoku-rules.html and sudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    sudoku_rules_title: "Règles du Sudoku",
    sudoku_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Sudoku - utile si vous êtes rouillé, ou si vous apprenez.",
    sudoku_rules_basics_title: "L'idée de base",
    sudoku_term_board: "La grille",
    sudoku_rules_board: "La grille de 9x9 est divisée en neuf blocs de 3x3. Certaines cases commencent remplies (les « indices ») et ne peuvent pas être changées ; les autres commencent vides, à vous de les remplir.",
    sudoku_term_goal: "L'objectif",
    sudoku_rules_goal: "Remplissez chaque case vide avec un chiffre de 1 à 9 de façon à ce que chaque rangée, chaque colonne et chacun des neuf blocs de 3x3 contienne chaque chiffre exactement une fois. Chaque grille générée par PaperGames a exactement une solution.",
    sudoku_term_input: "Saisir les chiffres",
    sudoku_rules_input: "Sélectionnez une case, puis choisissez un chiffre sur le pavé sous le plateau (ou tapez un chiffre au clavier). Une case au contour en pointillés est actuellement en conflit avec une autre case de sa rangée, de sa colonne ou de son bloc - voyez cela comme un indice qu'il faut changer quelque chose.",
    sudoku_rules_end_title: "Terminer une grille",
    sudoku_term_win: "Résolue",
    sudoku_rules_win: "La grille est résolue dès qu'elle est entièrement remplie sans aucun conflit restant.",
    sudoku_term_difficulty: "Difficulté",
    sudoku_rules_difficulty: "Les grilles Facile, Moyen et Difficile ne diffèrent que par le nombre de cases parmi les 81 qui commencent remplies - moins il y a d'indices, plus il faut déduire pour avancer.",
    sudoku_history_title: "L'histoire du Sudoku",
    sudoku_history_origins_title: "Un puzzle américain, d'abord",
    sudoku_history_origins_p1: "Le puzzle de placement de chiffres que l'on appelle aujourd'hui Sudoku est apparu pour la première fois en 1979 dans un magazine de jeux américain, publié par Dell Magazines sous le titre « Number Place ». Son invention est généralement attribuée à Howard Garns, un architecte à la retraite et concepteur de puzzles indépendant, bien que le magazine n'imprimait jamais de signatures à l'époque, si bien que cette attribution repose sur des indices indirects plutôt que sur une revendication signée.",
    sudoku_history_origins_p2: "Le puzzle s'inspirait d'une idée mathématique bien plus ancienne, le carré latin - une grille où chaque symbole apparaît exactement une fois par rangée et par colonne - étudié par Leonhard Euler au 18e siècle, avec la contrainte supplémentaire des blocs de 3x3 ajoutée par-dessus pour rendre une solution unique atteignable par la seule logique, sans avoir à deviner.",
    sudoku_history_spread_title: "Un nom japonais pour un engouement mondial",
    sudoku_history_spread_p1: "Le puzzle a atteint le Japon en 1984 grâce à l'éditeur de jeux Nikoli, qui l'a rebaptisé « Suuji wa dokushin ni kagiru » (« les chiffres doivent rester célibataires »), bientôt raccourci en Sudoku (« chiffre unique »). En 1986, Nikoli a ajouté deux règles encore courantes aujourd'hui : un nombre maximal d'indices et leur disposition symétrique.",
    sudoku_history_spread_p2: "Le Sudoku est resté un modeste passe-temps japonais pendant deux décennies, jusqu'à ce que le juge à la retraite Wayne Gould, l'ayant découvert lors d'un voyage à Tokyo, écrive un programme informatique pour générer rapidement des grilles et persuade The Times de Londres de commencer à en publier en 2004 - déclenchant un engouement mondial pour ce puzzle dans la presse en l'espace d'environ un an.",
    sudoku_history_modern_title: "De la rubrique de journal à l'informatique théorique",
    sudoku_history_modern_p1: "La popularité soudaine du Sudoku a autant attiré les mathématiciens et informaticiens que les amateurs occasionnels : en 2005, le nombre total de grilles 9x9 complètes distinctes a été calculé exactement (un peu plus de 6,6 milliards de milliards), et en 2012, une recherche informatique exhaustive a établi qu'aucune grille 9x9 valide n'a besoin de moins de 17 indices pour avoir une solution unique.",
    sudoku_history_modern_p2: "Ce second résultat est exactement le genre de fait sur lequel le générateur d'PaperGames s'appuie, mais à l'envers : comme l'unicité devient plus difficile à préserver à mesure que l'on retire des indices, chaque grille ici est produite en partant d'une grille complète résolue et en retirant les cases une à une tant qu'une solution unique subsiste.",
    puzzle_rules_hint: "Le bouton « Indice » aide en trois étapes. Le premier appui marque l'endroit de la prochaine étape. Le deuxième donne la raison, c'est-à-dire la règle qui s'y applique. Le troisième effectue l'étape (inscrit le chiffre ou construit le pont). L'indice part de votre position actuelle : si un chiffre ou un pont est faux quelque part, il vous le dit d'abord. Il ne devine jamais – si on ne peut avancer qu'en essayant, il le dit honnêtement. Les indices sont illimités. Une grille résolue avec des indices compte quand même comme une victoire ; les statistiques montrent en plus combien de victoires ont été obtenues avec des indices."
});
I18n.markTextLoaded("fr");
