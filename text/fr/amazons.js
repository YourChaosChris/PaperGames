// text/fr/amazons.js
// Rules and history texts of amazons (fr). Loaded by amazons-rules.html and amazons-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    amazons_rules_title: "Règles des Amazones",
    amazons_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Jeu des Amazones - utile pour se rafraîchir la mémoire ou pour apprendre.",
    amazons_rules_basics_title: "L'idée de base",
    amazons_term_setup: "La mise en place",
    amazons_rules_setup: "Chaque joueur a quatre amazones sur un plateau de 10x10, placées dans la position de départ symétrique standard. Il n'y a aucune capture dans ce jeu - on gagne uniquement par le déplacement et le contrôle du territoire.",
    amazons_term_moving: "Déplacer une amazone",
    amazons_rules_moving: "À votre tour, déplacez une de vos amazones d'un nombre quelconque de cases vides en ligne droite - horizontalement, verticalement ou en diagonale - exactement comme une dame aux échecs. Elle ne peut jamais sauter par-dessus une autre amazone ou une case brûlée.",
    amazons_term_shooting: "Tirer une flèche",
    amazons_rules_shooting: "Juste après son déplacement, cette même amazone doit tirer une flèche depuis sa nouvelle case : un autre déplacement à la façon d'une dame, dans l'une des 8 directions, uniquement à travers des cases vides, atterrissant sur une case vide.",
    amazons_term_burned: "Cases brûlées",
    amazons_rules_burned: "Là où atterrit une flèche, la case est brûlée pour le reste de la partie - un terrain définitivement infranchissable qu'aucune amazone ni aucune flèche future ne pourra plus jamais traverser ou où elle pourra atterrir.",
    amazons_rules_end_title: "Gagner la partie",
    amazons_term_win: "Comment une partie se termine",
    amazons_rules_win: "Si c'est votre tour et qu'aucune de vos amazones n'a plus le moindre coup légal - bloquées dans toutes les directions par d'autres amazones, des cases brûlées ou le bord du plateau - vous perdez. Le dernier joueur encore capable de jouer gagne.",
    amazons_history_title: "L'Histoire du Jeu des Amazones",
    amazons_history_origins_title: "Inventé en 1988",
    amazons_history_origins_p1: "Le Jeu des Amazones a été inventé en 1988 par Walter Zamkauskas, un concepteur de jeux argentin, et publié pour la première fois dans le magazine de jeux d'esprit argentin El Acertijo (publié en espagnol).",
    amazons_history_origins_p2: "Ses pièces qui se déplacent comme des dames rappellent les échecs, mais le tir de flèche qui conclut chaque tour - brûlant définitivement une case après chaque coup - est une idée entièrement originale, qui transforme le jeu d'une course en un lent étranglement de l'espace disponible pour l'adversaire.",
    amazons_history_design_title: "Un jeu chéri de la théorie des jeux combinatoire",
    amazons_history_design_p1: "Les Amazones ne connaissent ni match nul ni capture, et possèdent un arbre de jeu véritablement immense - plus grand que celui du Go selon certaines estimations - ce qui en a fait un sujet naturel pour les chercheurs en théorie des jeux combinatoire, et un rendez-vous régulier des compétitions et olympiades de jeux sur ordinateur depuis la fin des années 1990.",
    amazons_history_design_p2: "Faire jouer un ordinateur à un haut niveau s'est révélé un défi à part entière : avec des dizaines de déplacements de pièces légaux et, pour chacun, des dizaines de tirs de flèche légaux, un seul tour peut compter bien plus d'un millier de coups légaux - bien plus qu'aux échecs - ce qui a poussé les programmes joueurs d'Amazones vers un tri de coups poussé et une analyse du territoire en fin de partie plutôt que la seule recherche par force brute.",
    amazons_history_version_title: "Cette version",
    amazons_history_version_p1: "PaperGames applique les règles standard sur le plateau standard de 10x10 avec quatre amazones par joueur. Chaque tour se joue en une simple séquence de trois appuis : touchez une amazone, touchez sa destination, puis touchez l'endroit d'où elle tire sa flèche."
});
I18n.markTextLoaded("fr");
