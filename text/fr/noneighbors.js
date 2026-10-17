// text/fr/noneighbors.js
// Rules and history texts of noneighbors (fr). Loaded by noneighbors-rules.html and noneighbors-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    sudoku_rules_basics_title: "L'idée de base",
    sudoku_term_goal: "L'objectif",
    sudoku_term_input: "Saisir les chiffres",
    sudoku_rules_end_title: "Terminer une grille",
    sudoku_term_win: "Résolue",
    sudoku_term_difficulty: "Difficulté",
    puzzle_rules_hint: "Le bouton « Indice » aide en trois étapes. Le premier appui marque l'endroit de la prochaine étape. Le deuxième donne la raison, c'est-à-dire la règle qui s'y applique. Le troisième effectue l'étape (inscrit le chiffre ou construit le pont). L'indice part de votre position actuelle : si un chiffre ou un pont est faux quelque part, il vous le dit d'abord. Il ne devine jamais – si on ne peut avancer qu'en essayant, il le dit honnêtement. Les indices sont illimités. Une grille résolue avec des indices compte quand même comme une victoire ; les statistiques montrent en plus combien de victoires ont été obtenues avec des indices.",
    numberblocks_rules_title: "Règles des Sans voisins",
    numberblocks_rules_intro: "Un aide-mémoire sur la façon dont PaperGames joue aux Sans voisins - utile pour réviser ou apprendre.",
    numberblocks_term_board: "La grille",
    numberblocks_rules_board: "Des traits épais divisent la grille en blocs d'une à cinq cases. Certaines cases sont remplies dès le départ (en gras) et ne peuvent pas être modifiées.",
    numberblocks_rules_goal: "Remplissez chaque case vide pour qu'un bloc de n cases contienne les chiffres 1 à n, chacun exactement une fois - un bloc de trois cases contient 1, 2 et 3. Chaque grille générée par PaperGames a exactement une solution.",
    numberblocks_term_regions: "La règle du contact",
    numberblocks_rules_regions: "Deux chiffres égaux ne doivent jamais se toucher - ni côte à côte, ni l'un au-dessus de l'autre, ni en diagonale. Aucune des huit cases autour d'un chiffre ne peut contenir le même chiffre, même si elle appartient à un autre bloc.",
    numberblocks_rules_input: "Sélectionnez une case, puis choisissez un chiffre sur le pavé sous la grille (ou tapez-le au clavier). Quand un chiffre se répète dans son bloc, est trop grand pour son bloc ou touche le même chiffre, toutes les cases concernées affichent leur chiffre en blanc sur noir.",
    numberblocks_rules_difficulty: "Les grilles faciles font 6x6, les moyennes 7x7 et les difficiles 8x8, avec moins de chiffres donnés à chaque niveau.",
    numberblocks_rules_win: "La grille est résolue dès que chaque case est remplie sans enfreindre la règle des blocs ni celle du contact.",
    numberblocks_history_title: "L'histoire des Sans voisins",
    numberblocks_history_origins_title: "Le jeu d'un inventeur",
    numberblocks_history_origins_p1: "Les Sans voisins ont été inventés par le créateur japonais de casse-têtes Naoki Inaba, qui les a publiés en 2001. Inaba a conçu un très grand nombre de jeux logiques, souvent fondés sur une seule règle claire qui mène à des raisonnements étonnamment profonds.",
    numberblocks_history_origins_p2: "Le jeu réunit deux idées connues : des zones qui doivent contenir chacune un ensemble fixe de chiffres, comme les blocs du Sudoku, et une règle de voisinage empruntée au roi des échecs - un chiffre ne peut se répéter sur aucune case où un roi pourrait aller.",
    numberblocks_history_names_title: "Sous d'autres noms",
    numberblocks_history_names_p1: "Le jeu est également connu à l’international sous les noms Suguru ou Tectonic ; ces noms désignent les mêmes règles de régions et de voisinage.",
    numberblocks_history_names_p2: "Chaque grille est créée sur votre appareil : les blocs et une solution valable sont construits ensemble case par case, puis des chiffres sont retirés un à un tant qu'un solveur intégré trouve encore exactement une solution."
});
I18n.markTextLoaded("fr");
