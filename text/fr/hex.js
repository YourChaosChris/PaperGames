// text/fr/hex.js
// Rules and history texts of hex (fr). Loaded by hex-rules.html and hex-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    hex_rules_title: "Règles du Hex",
    hex_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Hex - utile si vous êtes rouillé, ou si vous apprenez.",
    hex_rules_basics_title: "L'idée de base",
    hex_term_setup: "La mise en place",
    hex_rules_setup: "Le plateau est un losange de cases hexagonales. Noir (pierres pleines) possède les bords du haut et du bas, Blanc (pierres contour) ceux de gauche et de droite. Noir commence. Les plateaux de Hex imprimés utilisent souvent le rouge et le bleu ; PaperGames joue en noir et blanc, car un écran à encre électronique n’affiche pas de couleurs.",
    hex_term_moving: "Jouer un tour",
    hex_rules_moving: "À votre tour, posez une pierre de votre couleur sur n'importe quelle case vide - il n'y a pas de capture et les pierres ne bougent jamais une fois posées.",
    hex_term_swap: "La règle du changement",
    hex_rules_swap: "Commencer est un avantage, c’est pourquoi la règle d’échange est active, sauf si tu la désactives avant la partie. Après la première pierre de Noir, Blanc peut toucher « Changer » au lieu de poser une pierre : les joueurs échangent leurs couleurs, la première pierre appartient désormais à celui qui était Blanc, et l’autre continue avec Blanc. Noir relie toujours le haut et le bas, Blanc la gauche et la droite. L’ordinateur échange quand la première pierre est au milieu du plateau.",
    hex_term_win: "Victoire",
    hex_rules_win: "Construisez une chaîne ininterrompue de vos propres pierres reliant vos deux bords. Le Hex ne peut jamais se terminer par une nulle : une fois le plateau plein, la chaîne d'un des deux joueurs existe toujours forcément, que l'un ou l'autre ait essayé de bloquer l'autre ou non.",
    hex_rules_end_title: "Une remarque sur la stratégie",
    hex_term_blocking: "Attaque et défense sont le même coup",
    hex_rules_blocking: "Comme une nulle est impossible, bloquer la connexion de votre adversaire et construire la vôtre sont en réalité la même tâche vue sous deux angles - une case qui aide votre chaîne casse aussi très souvent la sienne.",
    hex_history_title: "L'histoire du Hex",
    hex_history_origins_title: "Inventé deux fois",
    hex_history_origins_p1: "Le Hex a été inventé pour la première fois en 1942 par le mathématicien, poète et designer danois Piet Hein, qui l'a présenté au Danemark sous le nom de « Polygon » après s'être demandé si un jeu de type carte à quatre couleurs pouvait un jour se terminer par une nulle.",
    hex_history_origins_p2: "Il a été réinventé indépendamment en 1948 par le mathématicien John Nash - plus tard lauréat du prix Nobel d'économie et sujet du film Un homme d'exception - alors qu'il était étudiant de troisième cycle à Princeton, où les étudiants y jouaient sur les carreaux hexagonaux des sols de salles de bains et l'appelaient « Nash ».",
    hex_history_origins_p3: "Le jeu a touché un public plus large en 1957 quand Martin Gardner en a parlé dans sa chronique « Mathematical Games » du Scientific American, lui donnant le nom de « Hex » qui lui est resté depuis.",
    hex_history_math_title: "Un favori des mathématiciens",
    hex_history_math_p1: "Le Hex est un sujet de prédilection en théorie des jeux et en topologie à cause d'un fait net et démontrable : le jeu ne peut jamais se terminer par une nulle - une conséquence des mêmes mathématiques qui sous-tendent le théorème du point fixe de Brouwer - ce qui implique aussi qu'un argument de « vol de stratégie » prouve que le premier joueur doit posséder une stratégie gagnante, même si personne ne sait quelle est réellement cette stratégie pour les grands plateaux.",
    hex_history_math_p2: "Résoudre le Hex complètement devient nettement plus difficile à mesure que le plateau grandit : les petits plateaux (jusqu'à environ 10x10) ont été entièrement résolus par recherche informatique, mais la taille de tournoi standard de 11x11 et au-delà restent non résolues, ce qui fait du Hex une cible continue à la fois pour la recherche en IA de jeu et pour la théorie des jeux combinatoires.",
    hex_history_version_title: "Cette version",
    hex_history_version_p1: "PaperGames joue sur un plateau de 9x9, une taille qui garde des parties confortablement plus courtes tout en laissant une vraie place aux stratégies de connexion comme de blocage."
});
I18n.markTextLoaded("fr");
