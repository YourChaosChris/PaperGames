// text/fr/pegsolitaire.js
// Rules and history texts of pegsolitaire (fr). Loaded by pegsolitaire-rules.html and pegsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    pegsolitaire_rules_title: "Règles du Solitaire",
    pegsolitaire_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Solitaire (jeu de billes) - utile si vous êtes rouillé, ou si vous apprenez.",
    pegsolitaire_rules_basics_title: "L'idée de base",
    pegsolitaire_term_board: "Le plateau et la position de départ",
    pegsolitaire_rules_board: "Avant la partie, vous choisissez le plateau ; le plateau anglais (33 trous) est présélectionné. Chaque trou commence occupé par une bille, sauf un – lequel, c'est indiqué pour chaque plateau sous « Les plateaux ».",
    pegsolitaire_term_jump: "Sauter",
    pegsolitaire_rules_jump: "Sélectionnez une bille, puis choisissez un trou vide à deux cases de distance en ligne droite (haut, bas, gauche ou droite - jamais en diagonale) avec une autre bille se trouvant juste entre les deux. La bille saute dans le trou vide, et la bille par-dessus laquelle elle a sauté est retirée du plateau. Exception : sur le plateau triangulaire, on peut aussi sauter en diagonale, le long de ses lignes obliques.",
    pegsolitaire_rules_end_title: "Terminer une partie",
    pegsolitaire_term_win: "Résolu",
    pegsolitaire_rules_win: "L'objectif classique est de sauter jusqu'à ne laisser qu'une seule bille. La partie se termine aussi, non résolue, dès qu'aucun saut légal ne reste possible, quel que soit le nombre de billes encore sur le plateau.",
    pegsolitaire_rules_boards_title: "Les plateaux",
    pegsolitaire_rules_boards: "Anglais : une grille 7x7 sans les quatre coins de 2x2, 33 trous ; le centre est vide. Européen : une grille 7x7 dont on ne retire que trois trous à chaque coin, 37 trous ; le trou juste au-dessus du centre est vide, car depuis le centre la partie est insoluble. Allemand (J. C. Wiegleb, 1779) : une grille 9x9 sans les quatre coins de 3x3, 45 trous ; le centre est vide. Carré : la grille 6x6 complète, 36 trous ; le trou en haut à gauche des quatre trous du milieu est vide. Grand losange : un losange de 41 trous sur une grille 9x9 ; le trou deux rangées au-dessus du centre est vide – sur ce plateau, très peu de trous de départ ont une solution. Triangle : cinq rangées de 1 à 5 trous, chaque rangée décalée d'un demi-trou, 15 trous ; le trou en haut à gauche des trois trous du milieu est vide. Sur tous les plateaux à grille carrée, on saute uniquement horizontalement ou verticalement, jamais en diagonale. Seul le triangle permet aussi de sauter en diagonale, le long de ses lignes obliques – six directions en tout.",
    pegsolitaire_history_title: "L'histoire du Solitaire",
    pegsolitaire_history_origins_title: "Un jeu de cour français",
    pegsolitaire_history_origins_p1: "Les premières preuves confirmées du Solitaire remontent à la France de la fin du 17e siècle, où le jeu apparaît dans une gravure de 1697 et était assez à la mode à la cour de Louis XIV pour être mentionné dans les écrits de l'époque. Une légende populaire attribue son invention à un noble confiné seul sur une île - une histoire charmante mais sans aucune preuve à l'appui, et presque certainement inventée bien après coup pour donner au jeu une origine plus romantique.",
    pegsolitaire_history_origins_p2: "Le plateau devenu standard en France compte 37 trous (ajoutant quatre coins supplémentaires à la croix simple), tandis que la version qui s'est répandue en Angleterre - la croix à 33 trous utilisée ici - est devenue la norme la plus courante dans le monde anglophone, popularisée en Grande-Bretagne au 19e siècle.",
    pegsolitaire_history_spread_title: "Un plateau, de nombreuses formes",
    pegsolitaire_history_spread_p1: "Au-delà de la croix classique, des plateaux de solitaire ont été fabriqués en forme triangulaire (avec sa propre version à 15 billes, un classique des tables de restaurant américains pendant des décennies), en losange, et sous d'autres dispositions - la règle du saut reste identique quelle que soit la forme dans laquelle les trous sont disposés.",
    pegsolitaire_history_wiegleb: "Une croix plus grande, de 45 trous sur une grille 9x9, a été décrite en 1779 par J. C. Wiegleb dans son livre « Unterricht in der natürlichen Magie » (Leçons de magie naturelle).",
    pegsolitaire_history_spread_p2: "Comme chaque coup retire exactement une bille, une partie complète de n billes à 1 prend toujours exactement n-1 sauts - l'un des rares jeux de plateau où le nombre de coups d'une partie gagnée est fixé à l'avance, quelle que soit la séquence particulière de sauts qui y mène.",
    pegsolitaire_history_modern_title: "Un casse-tête résolu, avec un rebondissement",
    pegsolitaire_history_modern_p1: "Le Solitaire a attiré une attention mathématique sérieuse à partir des années 1960 et 1970, quand des chercheurs dont John Conway l'ont analysé à l'aide d'outils comme les réseaux de résistances et les arguments de théorie des groupes pour déterminer exactement quelles positions finales à une seule bille sont atteignables depuis la position de départ standard - le centre en fait partie, mais est loin d'être la seule.",
    pegsolitaire_history_modern_p2: "Une recherche informatique ultérieure a réglé complètement la question pour le plateau à 33 trous : une partie commençant avec le centre vide peut toujours être menée jusqu'à une seule bille, et le nombre de parties gagnantes essentiellement différentes a été calculé exactement - un cas rare où un casse-tête physique s'est transformé en un problème combinatoire entièrement résolu."
});
I18n.markTextLoaded("fr");
