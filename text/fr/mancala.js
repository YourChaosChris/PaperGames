// text/fr/mancala.js
// Rules and history texts of mancala (fr). Loaded by mancala-rules.html and mancala-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    mancala_rules_title: "Règles du Mancala",
    mancala_rules_intro: "Un aide-mémoire rapide sur la version du Mancala que joue PaperGames - plus précisément le Kalaha, le règlement standardisé qu'utilisent la plupart des jeux de mancala numériques - utile si vous êtes rouillé, ou si vous apprenez.",
    mancala_rules_basics_title: "L'idée de base",
    mancala_term_board: "Les cases et les greniers",
    mancala_rules_board: "Chaque joueur a six cases alignées, commençant avec 4 graines chacune, plus un grenier à l'extrémité droite de sa propre rangée. À votre tour, choisissez l'une de vos cases non vides et semez ses graines une par une dans chaque case suivante, en vous déplaçant dans le sens antihoraire autour de tout le plateau.",
    mancala_term_sowing: "Semer",
    mancala_rules_sowing: "Semer dépose une graine dans chaque case que vous traversez, y compris votre propre grenier, mais saute toujours entièrement le grenier de votre adversaire - il ne reçoit jamais de graine venant de votre coup.",
    mancala_term_extra: "Tours supplémentaires",
    mancala_rules_extra: "Si votre toute dernière graine atterrit dans votre propre grenier, vous rejouez immédiatement.",
    mancala_rules_capture_title: "Capturer",
    mancala_term_capture: "Capture",
    mancala_rules_capture: "Si votre toute dernière graine atterrit dans l'une de vos propres cases qui était vide avant cette graine, vous la capturez ainsi que toutes les graines de la case directement en face - le tout va droit dans votre grenier. Si la case d'en face est vide, rien n'est capturé.",
    mancala_rules_end_title: "Comment une partie se termine",
    mancala_term_win: "Victoire",
    mancala_rules_win: "La partie se termine dès que les six cases d'un des joueurs sont toutes vides à son tour. Chaque graine restant de l'autre côté est balayée dans le grenier de ce joueur, et celui qui a le plus de graines dans son grenier gagne (un partage égal est une nulle).",
    mancala_term_resignation: "Abandon",
    mancala_rules_resignation: "Un joueur peut abandonner à tout moment, ce qui met fin à la partie immédiatement en faveur de l'adversaire.",
    mancala_history_title: "L'histoire du Mancala",
    mancala_history_origins_title: "Des cases creusées dans la pierre",
    mancala_history_origins_p1: "Des plateaux de jeux de la famille du mancala ont été retrouvés directement creusés dans la pierre à travers l'Afrique et le Moyen-Orient, certains estimés à bien plus de mille ans, bien que - comme pour beaucoup de jeux anciens - la datation exacte et l'origine fassent débat parmi les historiens.",
    mancala_history_origins_p2: "Ce qui est clair, c'est que les jeux de graines et de cases se sont répandus et diversifiés énormément au fil des siècles, produisant des centaines de variantes régionales à travers l'Afrique, le Moyen-Orient et l'Asie, de l'Oware et du Bao au Congkak - chacune avec sa propre taille de plateau, son nombre de graines et ses règles de capture, tout en partageant la même idée fondamentale de semer.",
    mancala_history_spread_title: "Une famille, d'innombrables variantes",
    mancala_history_spread_p1: "Contrairement aux échecs ou au Go, qui se sont chacun stabilisés autour d'un seul règlement mondial dominant, les jeux de mancala n'ont jamais véritablement convergé : la famille se définit davantage par sa mécanique commune - semer des graines une à une autour d'un plateau de cases - que par un quelconque ensemble de règles fixe.",
    mancala_history_spread_p2: "Cette diversité explique en partie pourquoi les jeux de mancala restent profondément ancrés dans la culture quotidienne d'une grande partie de l'Afrique et de l'Asie, souvent pratiqués de façon informelle sur les marchés et dans les cours, avec pour tout matériel un plateau griffonné dans le sol et une poignée de graines ou de cailloux.",
    mancala_history_modern_title: "Le Kalaha : un règlement standardisé",
    mancala_history_modern_p1: "Le règlement précis qu'utilise PaperGames - deux rangées de six cases, un grenier à chaque extrémité, une capture dans une case vide, et un tour supplémentaire en atterrissant dans son propre grenier - est le Kalaha, une variante du mancala qui a été déposée comme marque et popularisée comme jeu de plateau produit en série aux États-Unis au milieu du 20e siècle.",
    mancala_history_modern_p2: "Les règles claires et précisément définies du Kalaha en ont fait tôt un candidat naturel pour les ordinateurs, et c'est aujourd'hui l'un des règlements de mancala les plus courants dans les jeux et applications numériques du monde entier, y compris celle-ci."
});
I18n.markTextLoaded("fr");
