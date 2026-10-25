// text/fr/nonogram.js
// Rules and history texts of nonogram (fr). Loaded by nonogram-rules.html and nonogram-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    nonogram_rules_title: "Règles des Nonogrammes",
    nonogram_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue aux Nonogrammes (aussi appelés Griddlers) - utile si vous êtes rouillé, ou si vous apprenez.",
    nonogram_rules_basics_title: "L'idée de base",
    nonogram_term_clues: "Lire les indices",
    nonogram_rules_clues: "Chaque rangée et chaque colonne a un indice : une suite de nombres donnant la longueur de chaque bloc consécutif de cases remplies sur cette ligne, dans l'ordre, séparés par au moins une case vide. Un indice « 3 1 » signifie une série de trois cases remplies, puis un espace, puis encore une case remplie, quelque part sur cette ligne.",
    nonogram_term_filling: "Remplir et marquer",
    nonogram_rules_filling: "Utilisez le mode Remplir pour colorier une case dont vous êtes sûr qu'elle fait partie de l'image, et le mode Marquer X pour barrer une case dont vous êtes sûr qu'elle est vide - marquer est purement une aide-mémoire et n'a aucun effet sur la victoire, mais cela aide à écarter des possibilités en travaillant les indices.",
    nonogram_rules_end_title: "Terminer une grille",
    nonogram_term_win: "Résolue",
    nonogram_rules_win: "La grille est résolue à l'instant où vos cases remplies correspondent exactement à l'image cachée - les cases marquées n'ont pas besoin d'être correctes, seules les cases remplies comptent.",
    nonogram_history_title: "L'histoire des Nonogrammes",
    nonogram_history_origins_title: "Deux inventeurs, deux continents",
    nonogram_history_origins_p1: "Le casse-tête vient du Japon de la fin des années 1980. En 1987, la graphiste japonaise Non Ishida remporta à Tokyo un concours de création avec des images en grille formées de fenêtres de gratte-ciel allumées ou éteintes ; elle en tira l’idée du casse-tête et publia en 1988 trois de ces énigmes illustrées sous le nom de « Window Art Puzzles ». L’auteur japonais de casse-tête Tetsuya Nishio inventa le même type d’énigme de son côté et le publia dans un autre magazine.",
    nonogram_history_origins_p2: "Le collectionneur britannique de casse-tête James Dalgety découvrit les énigmes d’Ishida et aida à les publier hors du Japon. Il forgea le nom « Nonogram », à partir de « Non » (le prénom d’Ishida) et de « -gram » (de « diagram »). À partir de 1990, le journal britannique The Sunday Telegraph publia ces énigmes chaque semaine ; en 1998, ses lecteurs choisirent lors d’un concours le nouveau nom « Griddlers ». Aujourd’hui, le casse-tête porte plusieurs noms, dont Picross et Hanjie.",
    nonogram_history_spread_title: "Des magazines à la Game Boy",
    nonogram_history_spread_p1: "Nintendo a popularisé le puzzle dans le monde entier sous le nom de « Picross » (un mot-valise de « picture » et « crossword »), en sortant des jeux Picross pour la Game Boy et la Super Famicom à partir de 1995 - pour de nombreux joueurs hors du Japon, cette série portable a constitué leur première rencontre avec ce type de puzzle.",
    nonogram_history_spread_p2: "L'attrait du puzzle a fini par dépasser largement le seul jeu vidéo dédié : les pages de jeux des journaux l'ont adopté aux côtés du Sudoku pendant l'engouement pour les puzzles des années 2000, généralement sous le nom de Griddlers ou Hanjie, et il reste aujourd'hui un incontournable des livres de jeux et des applications.",
    nonogram_history_modern_title: "Un puzzle qui ne nécessite pas de deviner (en général)",
    nonogram_history_modern_p1: "Un Nonogramme bien construit est conçu pour être résolu par pure déduction logique, ligne par ligne, sans jamais avoir à deviner - c'est exactement la propriété que les puzzles propres à PaperGames vérifient avant d'être inclus, à l'aide d'un solveur par propagation de contraintes qui confirme que les indices de chaque image n'admettent qu'une seule grille valide.",
    nonogram_history_modern_p2: "Ce n'est pas vrai de tous les ensembles d'indices possibles, cependant : comme le Démineur, la résolution générale des Nonogrammes a été prouvée NP-complète, ce qui signifie qu'un puzzle assez grand ou délibérément retors peut exiger de véritables tâtonnements par essais-erreurs pour être craqué - les puzzles bien conçus pour des humains sont spécifiquement construits pour éviter cela, ce qui constitue en soi un petit art."
});
I18n.markTextLoaded("fr");
