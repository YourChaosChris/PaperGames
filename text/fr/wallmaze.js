// text/fr/wallmaze.js
// Rules and history texts of wallmaze (fr). Loaded by wallmaze-rules.html and wallmaze-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    wallmaze_rules_title: "Règles du Labyrinthe de Murs",
    wallmaze_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Labyrinthe de Murs - utile pour se rafraîchir la mémoire ou pour apprendre.",
    wallmaze_rules_basics_title: "L'idée de base",
    wallmaze_term_setup: "La mise en place",
    wallmaze_rules_setup: "Chaque joueur a un pion, commençant au milieu de son propre bord d'un plateau de 9x9, et dix murs en réserve. Le Joueur 1 vise la rangée opposée en bas, le Joueur 2 la rangée opposée en haut - le premier à y amener son pion gagne.",
    wallmaze_term_moving: "Déplacer votre pion",
    wallmaze_rules_moving: "À votre tour, soit vous déplacez votre pion d'une case vers le haut, le bas, la gauche ou la droite, soit vous posez un mur. Si les deux pions sont adjacents, vous pouvez sauter directement par-dessus l'autre pion ; si un mur ou le bord du plateau bloque ce saut, vous pouvez à la place vous déplacer en diagonale autour de lui.",
    wallmaze_term_walls: "Poser des murs",
    wallmaze_rules_walls: "Un mur fait deux cases de long et bloque le déplacement en ligne droite à travers lui, pour les deux joueurs. Les murs ne peuvent jamais se chevaucher ni en croiser un autre, et un mur ne peut jamais être posé s'il condamnerait le dernier chemin restant d'un joueur vers sa rangée d'arrivée - il reste toujours au moins un passage.",
    wallmaze_rules_end_title: "Gagner la partie",
    wallmaze_term_win: "Comment une partie se termine",
    wallmaze_rules_win: "Dès qu'un pion atteint n'importe quelle case de la rangée d'arrivée de son joueur, celui-ci gagne - peu importe la colonne.",
    wallmaze_history_title: "L'Histoire du Labyrinthe de Murs",
    wallmaze_history_origins_title: "Une création des années 1990",
    wallmaze_history_origins_p1: "Le Quoridor a été conçu par Mirko Marchesi et publié pour la première fois en 1997 par l'éditeur de jeux français Gigamic, devenant rapidement l'un des titres les plus connus de la société aux côtés d'autres jeux abstraits compacts à deux joueurs.",
    wallmaze_history_origins_p2: "Il appartient à une famille plus large de jeux de « labyrinthe bloquant », où le plateau lui-même change de forme au fil de la partie plutôt que de rester fixe comme un échiquier - chaque mur qu'un joueur pose remodèle durablement les chemins que peuvent emprunter les deux pions pour le reste de la partie.",
    wallmaze_history_design_title: "Règles simples, vraie profondeur",
    wallmaze_history_design_p1: "L'ensemble des règles tient sur une seule carte - déplacez votre pion ou posez un mur, atteignez l'autre bord pour gagner - et pourtant la tension entre foncer en avant et passer un tour à bloquer son adversaire lui donne une réelle profondeur stratégique.",
    wallmaze_history_design_p2: "Le Quoridor a aussi été étudié comme problème d'informatique théorique : parce que l'espace des états est vaste mais bien structuré (positions des pions plus placements des murs, avec une règle de connectivité des chemins à faire respecter), c'est une cible populaire aussi bien pour l'IA classique par recherche que, plus récemment, pour les agents d'apprentissage par renforcement.",
    wallmaze_history_names_title: "Pourquoi un autre nom",
    wallmaze_history_names_p1: "Le même principe de jeu existe dans le commerce sous le nom de Quoridor, conçu en 1997 par Mirko Marchesi et publié par Gigamic. Quoridor est une marque déposée. PaperGames n'a aucun lien avec Gigamic ni avec ce jeu et utilise donc son propre nom, Labyrinthe de Murs.",
    wallmaze_history_version_title: "Cette version",
    wallmaze_history_version_p1: "PaperGames joue selon les règles standard sur le plateau standard de 9x9 avec dix murs par joueur. Poser un mur est un petit mode à part entière : appuyez sur « Poser un mur », touchez n'importe où sur le plateau pour prévisualiser le mur légal le plus proche à cet endroit, puis confirmez - une cible délibérément tolérante sur un écran tactile, plutôt que d'exiger de viser un point précis."
});
I18n.markTextLoaded("fr");
