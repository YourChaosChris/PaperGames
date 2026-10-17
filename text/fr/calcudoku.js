// text/fr/calcudoku.js
// Rules and history texts of calcudoku (fr). Loaded by calcudoku-rules.html and calcudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    sudoku_rules_basics_title: "L'idée de base",
    sudoku_term_goal: "L'objectif",
    sudoku_term_input: "Saisir les chiffres",
    sudoku_rules_end_title: "Terminer une grille",
    sudoku_term_win: "Résolue",
    sudoku_term_difficulty: "Difficulté",
    puzzle_rules_hint: "Le bouton « Indice » aide en trois étapes. Le premier appui marque l'endroit de la prochaine étape. Le deuxième donne la raison, c'est-à-dire la règle qui s'y applique. Le troisième effectue l'étape (inscrit le chiffre ou construit le pont). L'indice part de votre position actuelle : si un chiffre ou un pont est faux quelque part, il vous le dit d'abord. Il ne devine jamais – si on ne peut avancer qu'en essayant, il le dit honnêtement. Les indices sont illimités. Une grille résolue avec des indices compte quand même comme une victoire ; les statistiques montrent en plus combien de victoires ont été obtenues avec des indices.",
    calcudoku_rules_title: "Règles du Calcudoku",
    calcudoku_rules_intro: "Un aide-mémoire sur la façon dont PaperGames joue au Calcudoku - utile pour réviser ou apprendre.",
    calcudoku_term_board: "La grille",
    calcudoku_rules_board: "La grille est carrée, de 4x4 à 7x7. Contrairement au Sudoku, elle n'a pas de blocs ; des traits épais la divisent en cages - des groupes d'une à quatre cases voisines.",
    calcudoku_rules_goal: "Remplissez chaque case avec un chiffre de 1 à la taille de la grille (1 à 5 sur une grille 5x5) pour que chaque ligne et chaque colonne contienne chaque chiffre exactement une fois. Chaque grille générée par PaperGames a exactement une solution.",
    calcudoku_term_regions: "Cages et opérations",
    calcudoku_rules_regions: "La petite indication dans la case en haut à gauche d'une cage donne un résultat et une opération. Avec + ou ×, les chiffres de la cage doivent donner ce résultat en les additionnant ou en les multipliant, dans n'importe quel ordre. Une cage avec – ou ÷ a toujours deux cases : le plus grand chiffre moins le plus petit, ou divisé par le plus petit, donne le résultat. Une cage d'une seule case indique simplement son chiffre. Un chiffre peut apparaître deux fois dans une cage, tant que sa ligne et sa colonne le permettent.",
    calcudoku_rules_input: "Sélectionnez une case, puis choisissez un chiffre sur le pavé sous la grille (ou tapez-le au clavier). Un chiffre affiché en blanc sur noir entre en conflit avec un autre de sa ligne ou de sa colonne, ou complète une cage qui n'atteint pas son résultat.",
    calcudoku_rules_difficulty: "Choisissez la taille de la grille et un niveau avant de commencer. Des grilles plus grandes et des niveaux plus élevés donnent des cages plus grandes et moins de cages d'une seule case, qui en révèlent moins.",
    calcudoku_rules_win: "La grille est résolue dès que chaque case est remplie et qu'aucune ligne, colonne ou cage n'enfreint une règle.",
    calcudoku_history_title: "L'histoire du Calcudoku",
    calcudoku_history_origins_title: "Née dans une salle de classe au Japon",
    calcudoku_history_origins_p1: "Ce type de casse-tête est généralement attribué à Tetsuya Miyamoto, professeur de mathématiques japonais, qui l'a conçu vers 2004 pour entraîner ses élèves au calcul et au raisonnement logique sans leur dicter la méthode. L'idée a vite dépassé sa classe grâce aux livres de jeux et aux journaux.",
    calcudoku_history_origins_p2: "Sous les calculs se cache le carré latin - une grille où chaque symbole apparaît exactement une fois par ligne et par colonne - étudié par des mathématiciens comme Leonhard Euler au XVIIIe siècle, et qui est aussi au cœur du Sudoku.",
    calcudoku_history_names_title: "Plusieurs noms, un seul jeu",
    calcudoku_history_names_p1: "Le même type de casse-tête est aussi publié commercialement sous le nom KenKen. KenKen est une marque déposée de Nextoy LLC. PaperGames n'a aucun lien avec Nextoy LLC et utilise à la place le nom générique Calcudoku.",
    calcudoku_history_names_p2: "Chaque Calcudoku est créé sur votre appareil : un carré latin aléatoire est découpé en cages, chaque cage reçoit une opération au résultat entier, et un solveur intégré ne garde que les découpages qui laissent exactement une solution."
});
I18n.markTextLoaded("fr");
