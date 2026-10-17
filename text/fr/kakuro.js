// text/fr/kakuro.js
// Rules and history texts of kakuro (fr). Loaded by kakuro-rules.html and kakuro-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    kakuro_rules_title: "Règles du Kakuro",
    kakuro_rules_intro: "Un mémo rapide sur la façon dont PaperGames joue au Kakuro - utile si vous êtes rouillé, ou si vous apprenez. Le Kakuro est parfois décrit comme des « mots croisés en chiffres » : au lieu de lettres, chaque case blanche contient un chiffre, et au lieu de mots, les indices sont des sommes.",
    kakuro_rules_basics_title: "L'idée de base",
    kakuro_term_board: "La grille",
    kakuro_rules_board: "La grille mélange des cases noires porteuses d'indices et des cases blanches à remplir. Toute ligne continue de cases blanches, lue de gauche à droite ou de haut en bas, s'appelle une « série ». Chaque série a exactement un indice : le total auquel ses chiffres doivent s'additionner.",
    kakuro_term_clues: "Lire les cases d'indice",
    kakuro_rules_clues: "Une case noire affiche sa (ou ses) somme(s) en chiffres blancs, séparées en diagonale lorsqu'elle en porte deux : le nombre en haut à droite est l'objectif de la série horizontale qui commence juste à sa droite (un indice « horizontal »), et le nombre en bas à gauche est l'objectif de la série verticale qui commence juste en dessous (un indice « vertical »). Une case noire ne portant qu'un seul indice n'affiche que ce nombre-là.",
    kakuro_term_goal: "L'objectif",
    kakuro_rules_goal: "Remplissez chaque case blanche d'un chiffre de 1 à 9 afin que les chiffres de chaque série s'additionnent exactement à son indice - et, tout aussi important, qu'aucun chiffre ne se répète dans une même série (un chiffre peut réapparaître dans une série qui la croise, mais jamais deux fois dans la même série).",
    kakuro_term_input: "Saisir les chiffres",
    kakuro_rules_input: "Sélectionnez une case blanche, puis choisissez un chiffre sur le pavé sous la grille (ou tapez un chiffre au clavier). Une case au contour pointillé répète actuellement un chiffre déjà utilisé ailleurs dans une de ses séries, ou appartient à une série entièrement remplie dont le total ne correspond pas encore à son indice - c'est le signal que quelque chose doit changer.",
    kakuro_term_difficulty: "Difficulté",
    kakuro_rules_difficulty: "Les niveaux Facile, Moyen et Difficile utilisent des grilles de plus en plus grandes (7x7, 9x9 puis 11x11), ce qui donne des séries plus longues et davantage de croisements entre elles - plus de chiffres à jongler à la fois, mais toujours les deux mêmes règles.",
    kakuro_rules_example_title: "Un exemple résolu",
    kakuro_term_example: "Deux séries qui se croisent",
    kakuro_rules_example_p1: "Supposons qu'une série horizontale de 2 cases ait pour indice 4, et que sa première case soit aussi le sommet d'une série verticale de 2 cases indicée 3. Les deux chiffres de la série horizontale doivent s'additionner à 4 sans se répéter - seuls 1+3 ou 3+1 le permettent (2+2 répète le 2, ce qui n'est pas autorisé). Les deux chiffres de la série verticale doivent s'additionner à 3 sans se répéter, ce que seuls 1+2 ou 2+1 permettent.",
    kakuro_rules_example_p2: "La case partagée doit contenir un chiffre que les deux séries peuvent utiliser. La série horizontale propose {1, 3} pour cette case, et la série verticale propose {1, 2} - le seul chiffre commun aux deux ensembles est 1. La case partagée doit donc valoir 1, ce qui fixe l'autre case de la série horizontale à 3 et l'autre case de la série verticale à 2. Toute la grille est ainsi résolue par simple élimination, sans deviner - le même type de déduction, répété bien plus de fois, résout n'importe quelle grille de Kakuro plus grande.",
    kakuro_rules_end_title: "Terminer une grille",
    kakuro_term_win: "Résolu",
    kakuro_rules_win: "La grille est résolue dès que chaque case blanche est remplie, que chaque série atteint son indice et qu'aucune série ne répète de chiffre.",
    kakuro_history_title: "L'histoire du Kakuro",
    kakuro_history_origins_title: "Cross Sums, inventé en Amérique",
    kakuro_history_origins_p1: "Le mot-croisé numérique aujourd'hui connu sous le nom de Kakuro a été inventé en 1966 par Jacques Cousin, un Canadien travaillant pour l'éditeur de jeux Dell Magazines, qui l'a présenté aux États-Unis sous le nom de « Cross Sums » (aussi écrit « Cross Sum »). Il est vite devenu une rubrique régulière des magazines de jeux de Dell, aux côtés de ses autres jeux de chiffres et de logique.",
    kakuro_history_origins_p2: "L'idée mariait l'apparence d'une grille de mots croisés à de l'arithmétique plutôt qu'à du vocabulaire : des cases noires portant des indices numériques à la place de définitions, et des cases blanches à remplir de chiffres dont les sommes devaient correspondre à ces indices.",
    kakuro_history_spread_title: "Un nom japonais pour une seconde vie",
    kakuro_history_spread_p1: "Cross Sums a traversé le Pacifique jusqu'au Japon, où l'éditeur de jeux Nikoli - la même société qui popularisera et nommera plus tard le Sudoku - l'a repris et lui a donné le nom « Kakuro », contraction de « kasan kurosu » (加算クロス), qui signifie « croix d'addition » en japonais.",
    kakuro_history_spread_p2: "Tout au long des années 1980, le Kakuro est devenu l'un des jeux les plus populaires de Nikoli au Japon, se forgeant un public fidèle bien avant l'essor du Sudoku qui porterait plus tard le nom de Nikoli dans le reste du monde.",
    kakuro_history_modern_title: "Un jeu redécouvert",
    kakuro_history_modern_p1: "La notoriété internationale du Kakuro est remontée au milieu des années 2000, dans le sillage de l'essor mondial du Sudoku dans les journaux, quand des rédacteurs de jeux en quête d'une suite se sont tournés vers les autres jeux de chiffres de Nikoli - faisant découvrir le Kakuro à de nombreux joueurs occidentaux sous son nom japonais, alors même que le jeu avait été inventé des décennies plus tôt en Amérique du Nord.",
    kakuro_history_modern_p2: "Cette histoire en deux temps se reflète dans la façon dont le jeu se résout encore aujourd'hui : une grille de Kakuro ne demande jamais de deviner, seulement la même élimination série par série qu'utilisaient déjà les joueurs du Cross Sums original de Dell - exprimée simplement chiffre par chiffre, un indice à la fois, exactement le principe que le générateur de cette collection utilise à l'envers pour construire une nouvelle grille à partir d'un remplissage aléatoire."
});
I18n.markTextLoaded("fr");
