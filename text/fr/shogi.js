// text/fr/shogi.js
// Rules and history texts of shogi (fr). Loaded by shogi-rules.html and shogi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    shogi_rules_title: "Règles du Shogi",
    shogi_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Shogi (échecs japonais) - utile si vous venez des échecs internationaux, car plusieurs idées fonctionnent différemment ici.",
    shogi_rules_basics_title: "L'idée de base",
    shogi_term_board: "Le plateau et les pièces",
    shogi_rules_board: "Chaque camp a 20 pièces sur un plateau de 9x9 : un Roi, une Tour, un Fou, deux Généraux d'or, deux Généraux d'argent, deux Cavaliers, deux Lances et neuf Pions. Les pièces sont de simples pentagones pointant vers l'adversaire - le camp d'une pièce se reconnaît à son orientation, pas à sa couleur. Noir joue toujours en premier.",
    shogi_term_promotion: "Promotion",
    shogi_rules_promotion: "Chaque pièce sauf le Roi et le Général d'or peut être promue en une forme plus forte quand elle entre dans, sort de, ou se déplace à l'intérieur des trois dernières rangées du plateau. La promotion est facultative, sauf quand un Pion ou une Lance atteint la toute dernière rangée, ou qu'un Cavalier atteint l'une des deux dernières rangées - dans ce cas elle est obligatoire, car la pièce n'aurait sinon plus jamais de coup légal.",
    shogi_term_drops: "Captures et parachutages",
    shogi_rules_drops: "Capturer une pièce ne la retire pas de la partie : elle change de camp, redevient sa forme non promue, et rejoint la main du joueur qui l'a capturée. À un tour ultérieur, au lieu de déplacer une pièce déjà sur le plateau, ce joueur peut parachuter une pièce de sa main sur n'importe quelle case vide - l'une des idées emblématiques du Shogi, et la raison pour laquelle les parties manquent rarement de matériel.",
    shogi_term_drop_limits: "Restrictions de parachutage",
    shogi_rules_drop_limits: "Un Pion ou une Lance ne peuvent pas être parachutés sur la dernière rangée, et un Cavalier ne peut pas être parachuté sur l'une des deux dernières rangées, car ils n'y auraient aucun coup légal. Un Pion ne peut pas être parachuté sur une colonne qui a déjà un de vos Pions non promus, et un parachutage de Pion ne peut jamais délivrer l'échec et mat directement (il peut tout de même mettre en échec, simplement pas mater).",
    shogi_rules_end_title: "Comment une partie se termine",
    shogi_term_win: "Victoire",
    shogi_rules_win: "Un Roi en échec qui n'a aucun moyen de s'échapper, de bloquer, ou de capturer la pièce qui met en échec est maté - la partie se termine immédiatement.",
    shogi_term_resignation: "Abandon",
    shogi_rules_resignation: "Un joueur peut abandonner à tout moment, ce qui met fin à la partie immédiatement en faveur de l'adversaire.",
    shogi_term_sennichite: "Répétition (sennichite)",
    shogi_rules_sennichite: "Si la même position - les mêmes pièces sur les mêmes cases, les mêmes pièces en main des deux côtés et le même joueur au trait - se produit quatre fois, la partie est nulle. Exception : si un joueur a donné échec à chacun de ses coups pendant toute la répétition, c'est lui qui perd. PaperGames applique cette règle automatiquement.",
    shogi_history_title: "L'histoire du Shogi",
    shogi_history_origins_title: "De l'Inde, en passant par l'Asie du Sud-Est",
    shogi_history_origins_p1: "Comme les échecs internationaux et le Xiangqi, le Shogi descend en définitive du chaturanga, l'ancien jeu de guerre indien qui s'est répandu à travers l'Asie le long des routes commerciales à partir du 6e siècle environ de notre ère. Il a atteint le Japon quelque temps avant le 10e siècle, très probablement en passant par l'Asie du Sud-Est et la Chine, et a été adapté au fil des siècles suivants en des formes distinctement japonaises.",
    shogi_history_origins_p2: "Les premières variantes japonaises des échecs étaient considérablement plus grandes que le jeu moderne - certaines formes historiques, comme le Dai Shogi et l'énorme Tai Shogi, utilisaient des plateaux de 15x15 cases ou plus avec bien plus d'une centaine de pièces par camp. La version à 9x9 et 20 pièces pratiquée aujourd'hui s'est imposée comme la norme vers le 16e siècle.",
    shogi_history_spread_title: "Les origines de la règle du parachutage",
    shogi_history_spread_p1: "La caractéristique déterminante du Shogi - une pièce capturée change de camp et peut être reposée sur le plateau - n'a d'équivalent ni aux échecs ni au Xiangqi et distingue ce jeu de tous les autres de cette collection. Les historiens relient généralement son apparition à la pratique, courante parmi les clans de samouraïs en guerre au Japon, d'intégrer directement les soldats capturés dans l'armée victorieuse plutôt que de les considérer simplement comme des pertes.",
    shogi_history_spread_p2: "Quelle que soit son origine exacte, la règle du parachutage transforme le caractère du jeu : le matériel n'est presque jamais définitivement retiré, les parties s'enlisent rarement par simple échange de matériel, et une attaque agressive peut être nourrie indéfiniment par tout ce que l'attaquant a déjà capturé.",
    shogi_history_modern_title: "Une tradition professionnelle vivante",
    shogi_history_modern_p1: "Le Shogi soutient une tradition de tournois professionnels ininterrompue au Japon depuis la période Edo (17e-19e siècles), quand le shogunat Tokugawa a financé un système héréditaire de maisons de joueurs professionnels - une lignée qui a évolué vers la Japan Shogi Association moderne, fondée en 1924.",
    shogi_history_modern_p2: "Le Shogi informatique a longtemps accusé un retard sur les échecs informatiques à cause de l'énorme facteur de branchement introduit par la règle du parachutage, mais dès le milieu des années 2010, des programmes comme Ponanza avaient décisivement battu les meilleurs joueurs professionnels, suscitant les mêmes débats sur le jeu homme-machine que les échecs avaient connus une décennie ou deux plus tôt."
});
I18n.markTextLoaded("fr");
