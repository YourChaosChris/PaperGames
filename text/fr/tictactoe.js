// text/fr/tictactoe.js
// Rules and history texts of tictactoe (fr). Loaded by tictactoe-rules.html and tictactoe-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    tictactoe_rules_title: "Règles du morpion",
    tictactoe_rules_intro: "Un rappel rapide de la façon dont PaperGames joue au morpion, aussi appelé tic-tac-toe.",
    tictactoe_rules_basics_title: "Le principe",
    tictactoe_term_board: "La grille et les marques",
    tictactoe_rules_board: "La grille compte neuf cases, sur 3x3. Chacun à son tour pose sa marque dans une case vide : une croix pour le joueur 1, un rond pour le joueur 2. Le joueur 1 commence toujours. Une marque reste en place jusqu'à la fin de la partie.",
    tictactoe_rules_end_title: "Fin de partie",
    tictactoe_term_win: "Victoire",
    tictactoe_rules_win: "Le premier qui aligne trois de ses marques – en ligne, en colonne ou en diagonale – gagne aussitôt. La ligne gagnante est affichée en noir plein.",
    tictactoe_term_draw: "Partie nulle",
    tictactoe_rules_draw: "Si les neuf cases sont remplies sans alignement de trois, la partie est nulle. Deux joueurs qui ne font aucune erreur font toujours match nul – en mode Difficile, l'ordinateur ne perd donc jamais, et le mieux qu'on puisse obtenir contre lui est une partie nulle.",
    tictactoe_term_resignation: "Abandon",
    tictactoe_rules_resignation: "Un joueur peut abandonner à tout moment, ce qui met immédiatement fin à la partie en faveur de l'adversaire.",
    tictactoe_rules_hard_title: "Le niveau Difficile",
    tictactoe_rules_hard: "En Difficile, l'ordinateur examine toutes les suites possibles et ne fait jamais d'erreur. Pour la grille 3x3, il est prouvé – en vérifiant toutes les parties possibles – que deux joueurs sans faute font toujours match nul. Contre ce niveau, le mieux que vous puissiez obtenir est donc un match nul ; une seule erreur et vous perdez.",
    tictactoe_history_title: "L'histoire du morpion",
    tictactoe_history_origins_title: "Trois cailloux à Rome",
    tictactoe_history_origins_p1: "Un ancêtre du jeu se pratiquait dans l'Empire romain vers le Ier siècle av. J.-C., probablement sous le nom de terni lapilli, « trois cailloux à la fois ». Chaque joueur n'avait que trois pions ; une fois tous posés, on les déplaçait vers des points libres pour continuer.",
    tictactoe_history_origins_p2: "On a retrouvé des grilles de ce jeu en de nombreux endroits de Rome.",
    tictactoe_history_spread_title: "Noughts and Crosses, Tic-Tac-Toe",
    tictactoe_history_spread_p1: "Le jeu a porté bien des noms. Le nom britannique « noughts and crosses » (zéros et croix) figure déjà dans des imprimés vers le milieu du XIXe siècle, par exemple en 1858 dans la revue Notes and Queries.",
    tictactoe_history_spread_p2: "Aux États-Unis, le nom de tic-tac-toe s'est imposé au XXe siècle. Il vient peut-être de « tick-tack », une ancienne forme de backgammon connue en Angleterre dès le XVIe siècle.",
    tictactoe_history_modern_title: "L'un des premiers jeux sur ordinateur",
    tictactoe_history_modern_p1: "En 1952, A. S. (Sandy) Douglas écrit OXO pour l'ordinateur EDSAC de l'université de Cambridge, dans le cadre de sa thèse de doctorat sur l'interaction entre l'humain et l'ordinateur. On choisissait sa case avec un cadran de téléphone, et l'ordinateur jouait parfaitement. OXO compte parmi les premiers jeux vidéo connus.",
    tictactoe_history_modern_p2: "Le jeu est assez petit pour être entièrement calculé : à rotations et symétries près, il existe 26 830 parties possibles, et en jouant parfaitement, chacune se termine par une partie nulle. C'est exactement ce que fait ici le mode Difficile : avant chaque coup, il examine toutes les suites possibles."
});
I18n.markTextLoaded("fr");
