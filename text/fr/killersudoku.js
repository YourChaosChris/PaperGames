// text/fr/killersudoku.js
// Rules and history texts of killersudoku (fr). Loaded by killersudoku-rules.html and killersudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    sudoku_rules_basics_title: "L'idée de base",
    sudoku_term_goal: "L'objectif",
    sudoku_term_input: "Saisir les chiffres",
    sudoku_rules_end_title: "Terminer une grille",
    sudoku_term_win: "Résolue",
    sudoku_term_difficulty: "Difficulté",
    puzzle_rules_hint: "Le bouton « Indice » aide en trois étapes. Le premier appui marque l'endroit de la prochaine étape. Le deuxième donne la raison, c'est-à-dire la règle qui s'y applique. Le troisième effectue l'étape (inscrit le chiffre ou construit le pont). L'indice part de votre position actuelle : si un chiffre ou un pont est faux quelque part, il vous le dit d'abord. Il ne devine jamais – si on ne peut avancer qu'en essayant, il le dit honnêtement. Les indices sont illimités. Une grille résolue avec des indices compte quand même comme une victoire ; les statistiques montrent en plus combien de victoires ont été obtenues avec des indices.",
    killersudoku_rules_title: "Règles du Sudoku Killer",
    killersudoku_rules_intro: "Un aide-mémoire sur la façon dont PaperGames joue au Sudoku Killer - utile pour réviser ou apprendre.",
    killersudoku_term_board: "La grille",
    killersudoku_rules_board: "Comme au Sudoku, des traits épais divisent la grille 9x9 en neuf blocs 3x3. Des pointillés la divisent aussi en cages d'une à cinq cases. Peu de cases, voire aucune, sont remplies au départ.",
    killersudoku_rules_goal: "Remplissez chaque case avec un chiffre de 1 à 9 pour que chaque ligne, chaque colonne et chaque bloc 3x3 contienne chaque chiffre exactement une fois. Chaque grille générée par PaperGames a exactement une solution.",
    killersudoku_term_regions: "Cages",
    killersudoku_rules_regions: "Le petit nombre dans la case en haut à gauche d'une cage est sa somme : les chiffres de la cage doivent l'atteindre ensemble. Contrairement au Calcudoku, aucun chiffre ne peut se répéter dans une cage.",
    killersudoku_rules_input: "Sélectionnez une case, puis choisissez un chiffre sur le pavé sous la grille (ou tapez-le au clavier). Un chiffre affiché en blanc sur noir se répète dans sa ligne, sa colonne, son bloc ou sa cage, ou complète une cage avec une mauvaise somme.",
    killersudoku_rules_difficulty: "Les grilles faciles ont surtout de petites cages et quelques chiffres donnés en plus ; les difficiles ont des cages plus grandes et seulement les chiffres nécessaires à une solution unique, souvent presque aucun.",
    killersudoku_rules_win: "La grille est résolue dès que chaque case est remplie et qu'aucune ligne, colonne, aucun bloc ni aucune cage n'enfreint une règle.",
    killersudoku_history_title: "L'histoire du Sudoku Killer",
    killersudoku_history_origins_title: "Des sommes sur une grille de Sudoku",
    killersudoku_history_origins_p1: "Des grilles qui combinent les règles du Sudoku et des sommes de cages paraissaient déjà au Japon dans les années 1990, où les jeux de sommes comme le Kakuro étaient populaires. L'idée s'est largement répandue en 2005, quand des journaux britanniques ont publié de telles grilles sous le nom de Killer Sudoku pendant l'engouement mondial pour le Sudoku.",
    killersudoku_history_origins_p2: "Le nom est descriptif, ce n'est pas une marque : « killer » promettait simplement un défi plus rude qu'un Sudoku ordinaire, puisqu'il n'y a que peu ou pas de chiffres pour commencer.",
    killersudoku_history_names_title: "Comment les grilles sont créées ici",
    killersudoku_history_names_p1: "Chaque Sudoku Killer commence par une grille de Sudoku entièrement résolue et générée à l'instant, puis découpée en cages voisines sans chiffre répété dans une cage.",
    killersudoku_history_names_p2: "Un solveur intégré vérifie ensuite si les sommes des cages ne permettent qu'une seule solution. Sinon, un chiffre où deux solutions possibles diffèrent est dévoilé, et la vérification recommence jusqu'à ce qu'il ne reste qu'une solution."
});
I18n.markTextLoaded("fr");
