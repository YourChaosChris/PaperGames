// text/fr/checkers.js
// Rules and history texts of checkers (fr). Loaded by checkers-rules.html and checkers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    checkers_rules_title: "Règles des dames",
    checkers_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue aux dames (dames anglaises) - utile si vous êtes rouillé, ou si vous apprenez.",
    checkers_rules_basics_title: "L'idée de base",
    checkers_term_men: "Pions",
    checkers_rules_men: "Noir et Blanc commencent chacun avec 12 pions sur les cases sombres de leurs trois rangées de fond, et se déplacent en diagonale vers l'avant d'une case à la fois, en alternant les tours, Noir en premier.",
    checkers_term_kings: "Dames",
    checkers_rules_kings: "Un pion qui atteint la rangée de fond adverse devient une dame. Les dames se déplacent en diagonale dans n'importe quelle direction, toujours une case à la fois.",
    checkers_rules_capture_title: "Capturer",
    checkers_term_capture: "Capture",
    checkers_rules_capture: "On capture en sautant en diagonale par-dessus une pièce ennemie adjacente pour atterrir sur la case vide juste après, en retirant la pièce sautée.",
    checkers_term_mandatory: "Prise obligatoire",
    checkers_rules_mandatory: "Si une capture est possible, vous devez en jouer une - un coup tranquille est interdit tant qu'une capture existe. Vous pouvez choisir quelle pièce capture si plusieurs le peuvent.",
    checkers_term_multijump: "Enchaînements de prises",
    checkers_rules_multijump: "Si une capture vous amène là où une autre capture est immédiatement possible avec la même pièce, vous devez continuer à sauter avec elle jusqu'à ce qu'aucune autre capture ne soit possible. Atterrir sur la rangée de fond promeut la pièce et met fin à son tour immédiatement, même en plein enchaînement.",
    checkers_rules_end_title: "Comment une partie se termine",
    checkers_term_win: "Victoire",
    checkers_rules_win: "Vous gagnez quand votre adversaire n'a plus aucune pièce, ou n'a aucun coup légal à jouer à son tour.",
    checkers_term_resignation: "Abandon",
    checkers_rules_resignation: "Un joueur peut abandonner à tout moment, ce qui met fin à la partie immédiatement en faveur de l'adversaire.",
    checkers_term_draw: "Nulle",
    checkers_rules_draw: "Si 40 coups s'enchaînent sans qu'aucun camp ne capture, la partie est nulle.",
    checkers_history_title: "L'histoire des dames",
    checkers_history_origins_title: "Un plateau ancien, un jeu médiéval",
    checkers_history_origins_p1: "Le plateau des dames et sa disposition de départ remontent à l'Alquerque, un jeu de capture pratiqué sur un plateau quadrillé de 5x5, connu en Égypte et au Moyen-Orient depuis plus de 3 000 ans, et plus tard populaire en Espagne mauresque.",
    checkers_history_origins_p2: "Vers le 12e siècle, dans le sud de la France, quelqu'un a combiné les captures en diagonale de l'Alquerque avec un échiquier, créant le « Fierges » ou « Jeu de Dames » - l'ancêtre direct du jeu pratiqué aujourd'hui.",
    checkers_history_spread_title: "De la France au monde entier",
    checkers_history_spread_p1: "Le jeu s'est répandu à travers l'Europe sous de nombreux noms - draughts en Angleterre, dama en Espagne, Dame en Allemagne - et a traversé l'Atlantique avec les colons, devenant particulièrement populaire aux États-Unis, où se sont imposées les règles utilisées dans cette application (les dames américaines) : plateau de 8x8 et prise obligatoire.",
    checkers_history_spread_p2: "Des championnats nationaux et mondiaux sont organisés depuis le 19e siècle, et une pratique compétitive structurée en Grande-Bretagne, aux États-Unis et au-delà a produit des générations de joueurs célèbres et d'ouvertures profondément étudiées.",
    checkers_history_modern_title: "Un jeu résolu",
    checkers_history_modern_p1: "Les dames occupent une place unique en théorie des jeux : en 2007, après près de deux décennies de calcul, le programme Chinook de Jonathan Schaeffer a prouvé que les dames sont une partie nulle si les deux camps jouent parfaitement - le jeu le plus complexe résolu aussi complètement à l'époque.",
    checkers_history_modern_p2: "Cela ne rend pas les dames moins amusantes à jouer pour autant - comme pour une finale résolue aux échecs, connaître le résultat théorique ne change rien à l'habileté nécessaire pour mener une vraie partie sur le plateau."
});
I18n.markTextLoaded("fr");
