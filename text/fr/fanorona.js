// text/fr/fanorona.js
// Rules and history texts of fanorona (fr). Loaded by fanorona-rules.html and fanorona-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    fanorona_rules_title: "Règles du Fanorona",
    fanorona_rules_intro: "Un rappel rapide de la façon dont PaperGames joue au Fanorona - utile si vous êtes rouillé ou si vous apprenez.",
    fanorona_rules_basics_title: "L'idée de base",
    fanorona_term_board: "Le plateau",
    fanorona_rules_board: "45 points disposés sur une grille de 5x9, reliés par des lignes horizontales, verticales et quelques diagonales - les diagonales changent de direction d'une case à l'autre, si bien qu'environ la moitié des points ('points forts') sont reliés à leurs 8 voisins, tandis que les autres ('points faibles') ne le sont qu'horizontalement et verticalement. Chaque joueur commence avec 22 pions, occupant ses deux rangées les plus proches ainsi que la moitié de la rangée du milieu en alternance, le point central restant vide. Les Blancs jouent en premier.",
    fanorona_term_capture: "Capturer",
    fanorona_rules_capture: "Faites glisser un pion le long d'une ligne vers un point vide adjacent. Selon la direction du déplacement, cela peut capturer une ligne droite de pions ennemis par approche, par retrait, ou (si les deux sont possibles) au choix - voir les exemples ci-dessous. La capture est obligatoire : si un coup de capture est possible quelque part sur le plateau, vous devez le jouer plutôt qu'un coup tranquille (paika).",
    fanorona_term_approach: "Capture par approche",
    fanorona_rules_approach: "Déplacez un pion de sorte que le point situé juste au-delà de sa nouvelle position, dans la direction même de votre déplacement, soit occupé par un pion ennemi. Ce pion, ainsi que tout pion ennemi situé juste derrière lui sur une ligne ininterrompue, est capturé.",
    fanorona_term_withdrawal: "Capture par retrait",
    fanorona_rules_withdrawal: "Éloignez un pion d'un pion ennemi situé juste derrière son ancienne position, dans la direction exactement opposée à votre déplacement. Ce pion, ainsi que tout pion ennemi situé juste derrière lui sur une ligne ininterrompue, est capturé.",
    fanorona_rules_example_title: "Exemple commenté",
    fanorona_rules_example_intro: "Dans les petits diagrammes ci-dessous, ● représente les Blancs, ○ les Noirs, et le cercle en pointillés le point vers lequel les Blancs s'apprêtent à se déplacer.",
    fanorona_rules_example_approach_caption: "Approche : les Blancs jouent A→B. Comme des pions noirs se trouvent dans le prolongement de cette même ligne juste au-delà de B, ils sont capturés.",
    fanorona_rules_example_withdrawal_caption: "Retrait : les Blancs jouent A→B, s'éloignant directement de pions noirs situés derrière A. Puisque les Blancs s'éloignent d'eux le long de cette même ligne, ils sont capturés aussi.",
    fanorona_term_chain: "Enchaîner les captures",
    fanorona_rules_chain: "Après une capture, le même pion peut continuer à capturer depuis sa nouvelle position - mais contrairement aux dames, vous n'y êtes jamais obligé : vous pouvez vous arrêter après n'importe quelle capture. Deux règles supplémentaires s'appliquent lors d'un enchaînement : le pion ne peut pas se déplacer deux fois de suite dans exactement la même direction, et il ne peut jamais atterrir sur un point déjà visité plus tôt dans le même tour.",
    fanorona_rules_end_title: "Fin de partie",
    fanorona_term_win: "Gagner",
    fanorona_rules_win: "Vous gagnez en capturant tous les pions de votre adversaire, ou si votre adversaire n'a plus aucun coup légal à son tour.",
    fanorona_term_resignation: "Abandon",
    fanorona_rules_resignation: "Un joueur peut abandonner à tout moment ; la partie se termine alors immédiatement en faveur de l'adversaire.",
    fanorona_history_title: "L'histoire du Fanorona",
    fanorona_history_origins_title: "De l'Alquerque aux hautes terres de Madagascar",
    fanorona_history_origins_p1: "Le Fanorona descendrait de l'Alquerque, un très ancien jeu de capture par saut probablement apporté à Madagascar par des marchands arabes ou d'Asie du Sud-Est. L'Alquerque est aussi l'ancêtre commun du jeu de dames, ce qui fait du Fanorona et des dames des cousins éloignés : tous deux ont conservé l'idée de base de la capture par saut, tout en développant, chacun de leur côté, des règles très différentes.",
    fanorona_history_origins_p2: "Les joueurs malgaches ont transformé ce jeu importé en quelque chose de bien à eux : un plateau plus grand de 5x9 mêlant lignes orthogonales et diagonales, et un système de capture par approche/retrait sans équivalent en Alquerque ou aux dames. Certains des plus anciens plateaux de Fanorona conservés, gravés dans la pierre près d'Antananarivo, seraient datés du 16e ou 17e siècle.",
    fanorona_history_legend_title: "Une partie qui aurait (dit-on) décidé d'un trône",
    fanorona_history_legend_p1: "Selon une légende malgache bien connue, le roi Ralambo aurait un jour mis ses deux fils à l'épreuve pour voir lequel était le plus apte à lui succéder : il feignit une grave maladie et les fit appeler, pour voir lequel arriverait le premier. Le fils aîné, absorbé par une position difficile de Fanorona, serait resté pour terminer la partie - si bien que son frère cadet arriva le premier et, selon le récit, hérita ensuite du trône. Comme pour la plupart des récits transmis oralement pendant des siècles, les détails varient selon les versions et l'épisode ne peut être vérifié comme un fait historique - il est pourtant encore cité aujourd'hui pour montrer à quel point le Fanorona a toujours été pris au sérieux à Madagascar.",
    fanorona_history_modern_title: "Toujours le jeu de Madagascar",
    fanorona_history_modern_p1: "Le Fanorona reste largement joué à travers Madagascar aujourd'hui et est souvent décrit comme le jeu de plateau national du pays, pratiqué de façon informelle dans les villages et les villes, mais aussi étudié dans un cadre compétitif. Il existe aussi des variantes plus petites - une version 3x3 (Fanoron-Telo, à peu près aussi profonde que le morpion) et une version 5x5 (Fanoron-Dimy) - mais le plateau 5x9 décrit sur cette page (Fanoron-Tsivy) en est la forme standard, la plus connue.",
    fanorona_history_modern_p2: "Le jeu a aussi suscité un véritable intérêt académique : une analyse informatique publiée en 2008 a faiblement résolu le Fanorona, établissant qu'une partie jouée parfaitement se termine par un match nul - le plaçant dans la même rare compagnie que les dames, un autre jeu ancien précisément résolu par des ordinateurs modernes."
});
I18n.markTextLoaded("fr");
