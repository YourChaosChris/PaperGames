// text/fr/hanoi.js
// Rules and history texts of hanoi (fr). Loaded by hanoi-rules.html and hanoi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    hanoi_rules_title: "Règles des tours de Hanoï",
    hanoi_rules_intro: "Une tour de disques, le plus petit en haut, se trouve sur la tige de gauche. Déplace-la sur la tige de droite.",
    hanoi_rules_basics_title: "Les règles",
    hanoi_term_move: "Un coup",
    hanoi_rules_move: "Touche une tige : tu prends son disque du haut (la tige reçoit un cadre épais). Touche une tige pour y poser le disque. Touche à nouveau la même tige pour le reposer.",
    hanoi_term_rule: "La règle",
    hanoi_rules_rule: "Seul le disque du haut d’une tige peut bouger, et il ne doit jamais être posé sur un disque plus petit. Un tel coup est refusé et rien ne bouge.",
    hanoi_term_goal: "Le but",
    hanoi_rules_goal: "Toute la tour sur la tige de droite (marquée d’une étoile). Le minimum de coups est 2 puissance le nombre de disques, moins 1 : 7 avec 3 disques, 15 avec 4, 255 avec 8.",
    hanoi_term_help: "Annuler et indice",
    hanoi_rules_help: "Annuler reprend des coups. L’indice donne à deux tiges un double cadre : déplace le disque du haut de la première vers la seconde – c’est le coup suivant d’un chemin le plus court depuis la position où tu es.",
    hanoi_history_title: "L’histoire des tours de Hanoï",
    hanoi_history_lucas_title: "Édouard Lucas, 1883",
    hanoi_history_lucas_p1: "Le mathématicien français Édouard Lucas présenta le casse-tête en 1883 comme un jeu soi-disant trouvé par un « N. Claus (de Siam) » – les lettres de « Lucas d’Amiens » remises dans un autre ordre. En 1889, il le publia sous forme de livret.",
    hanoi_history_legend_title: "Une légende inventée",
    hanoi_history_legend_p1: "Le livret racontait que des prêtres, dans un temple de Bénarès, déplacent une tour de 64 disques d’or ; quand ils auront fini, le monde prendra fin. La légende faisait partie de l’histoire du jeu, pas de l’histoire réelle.",
    hanoi_history_math_title: "Le minimum de coups",
    hanoi_history_math_p1: "Déplacer n disques demande au moins 2^n − 1 coups : d’abord les n − 1 plus petits sur la tige du milieu, puis le plus grand sur la tige d’arrivée, puis les plus petits par-dessus. Avec 64 disques et un coup par seconde, il faudrait bien plus longtemps que l’âge de l’univers."
});
I18n.markTextLoaded("fr");
