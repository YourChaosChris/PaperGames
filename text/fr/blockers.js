// text/fr/blockers.js
// Rules and history texts of blockers (fr). Loaded by blockers-rules.html and blockers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    bl_rules_title: "Règles de Chemin barré",
    bl_rules_intro: "Une course de dés vers le haut du plateau – mais des blocs barrent la route, et vous pouvez les placer devant les autres.",
    bl_rules_basics_title: "Les règles",
    bl_term_board: "Le plateau",
    bl_rules_board: "Des chemins relient les cases ; l'arrivée est en haut. Chaque joueur a sous le plateau une maison avec 5 pions et entre sur le plateau par sa propre case de la rangée du bas, marquée d'un anneau épais. Au début, 6 blocs se trouvent sur les chemins.",
    bl_term_move: "Un tour",
    bl_rules_move: "Lancez le dé et avancez un de vos pions d'exactement autant de cases. Depuis la maison, le premier pas va sur votre case d'entrée. Vous pouvez tourner à chaque embranchement, mais un coup ne peut pas passer deux fois par la même case. Si aucun pion ne peut utiliser le lancer, c'est au suivant.",
    bl_term_stones: "Les blocs",
    bl_rules_stones: "Aucun pion ne peut passer par-dessus un bloc. Un pion qui s'arrête exactement sur un bloc le prend et le pose sur n'importe quelle case libre – pas dans la rangée du bas ni sur l'arrivée. On ne peut pas non plus dépasser l'arrivée : il faut l'atteindre avec le nombre exact.",
    bl_term_hit: "Renvoyer",
    bl_rules_hit: "Un pion qui tombe exactement sur le pion d'un autre joueur le renvoie à sa maison, mais seulement dans la moitié haute du plateau, où les cases sont rondes. Dans la moitié basse, les cases sont carrées : les pions y sont en sécurité, et aucun coup ne peut finir sur le pion d'un autre joueur. Deux de vos pions ne peuvent pas occuper la même case.",
    bl_term_win: "Le gagnant",
    bl_rules_win: "La fin de partie se choisit avant de jouer. « Un pion à l'arrivée » (par défaut) : le premier joueur qui amène un pion à l'arrivée gagne ; chacun a 5 pions. « Tous les pions à l'arrivée » : chacun a 3 ou 5 pions, selon le choix ; un pion qui atteint l'arrivée quitte le plateau et l'arrivée est de nouveau libre ; aucun bloc ne se trouve sur les trois dernières cases avant l'arrivée. Le premier joueur dont tous les pions sont à l'arrivée gagne, les autres sont classés selon leurs pions à l'arrivée.",
    bl_term_players: "Joueurs",
    bl_rules_players: "2 à 6 joueurs sur un appareil ; chacun peut être joué par l'ordinateur (Facile, Moyen ou Difficile). Les pions se distinguent par leur forme : cercle, triangle, losange, étoile, anneau (un cercle au centre blanc) et croix.",
    bl_term_quick: "Le plateau rapide",
    bl_rules_quick: "Choisis « Plateau : Rapide » avant la partie pour une partie plus courte : un plateau propre, plus petit, avec quatre maisons, 9 pas de chaque maison jusqu’à l’arrivée, 4 pions par joueur et 6 blocs au départ. À la place de la moitié basse protégée, il a quatre cases de repos (octogones à double bord) : un pion sur une case de repos ne peut pas être renvoyé, un seul pion peut s’y trouver et aucun bloc ne peut y être posé.",
    bl_term_blocks: "Nombre de blocs",
    bl_rules_blocks: "Avant la partie, choisis combien de blocs se trouvent sur le plateau au départ : peu (4), normal (6) ou beaucoup (11). « Beaucoup » n’existe que sur le plateau normal avec 2 à 4 joueurs. Toutes les autres règles restent les mêmes.",
    bl_rules_example_title: "Un bloc sur le chemin",
    bl_rules_example: "L'image montre un pion (cercle) devant un bloc (carré noir). Avec un 2, il s'arrête sur le bloc, le prend et le pose sur une autre case libre. Avec un 3, il ne peut pas continuer tout droit, car il devrait passer par-dessus le bloc.",
    bl_history_title: "L'histoire de Chemin barré",
    bl_history_origins_title: "Les anciens jeux de course",
    bl_history_origins_p1: "Les jeux de course, où les pièces avancent aux dés le long d'un parcours vers un but, comptent parmi les plus anciens jeux de plateau ; le jeu royal d'Ur est le plus ancien jeu dont les règles nous sont parvenues. Renvoyer et bloquer sont aussi des idées anciennes : au pachisi, une pièce qui s'arrête sur une pièce adverse la renvoie au départ, et au backgammon, un mur de pièces sur des flèches consécutives, appelé prime, retient les pièces adverses derrière lui.",
    bl_history_modern_title: "Chemin barré chez PaperGames",
    bl_history_modern_p1: "Chez PaperGames, Chemin barré se joue sur un réseau de chemins de 49 cases avec l'arrivée en haut, avec six blocs et jusqu'à six joueurs. Un bloc touché n'est pas retiré mais reposé, si bien que le chemin vers l'arrivée change sans cesse. Les maisons entrent sur le plateau par des cases également éloignées de l'arrivée, et les pions se distinguent par la forme plutôt que par la couleur, pour que le jeu fonctionne sur l'encre électronique en noir et blanc.",
    bl_history_quick_p: "Le plateau rapide est un plateau plus petit, propre à PaperGames, conçu pour des parties plus courtes ; des cases de repos, où un pion ne peut pas être renvoyé, y remplacent la moitié basse protégée.",
});
I18n.markTextLoaded("fr");
