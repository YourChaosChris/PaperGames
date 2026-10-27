// text/fr/cardtactics.js
// Rules and history texts of cardtactics (fr). Loaded by cardtactics-rules.html and cardtactics-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    cardtactics_rules_title: "Règles de Tactique de Cartes",
    cardtactics_rules_intro: "Un guide rapide pour comprendre comment PaperGames joue cette course à travers le plateau, guidée par des cartes.",
    cardtactics_rules_basics_title: "Le principe",
    cardtactics_term_setup: "Mise en place",
    cardtactics_rules_setup: "Le plateau a 7 rangées et 6 colonnes. Les six pierres des Noirs occupent la rangée du bas, celles des Blancs la rangée du haut. Les Noirs commencent.",
    cardtactics_term_cards: "Cartes de déplacement",
    cardtactics_rules_cards: "Il y a douze cartes de déplacement ; au début, elles sont mélangées et chaque camp en reçoit six. Trois sont posées visibles devant son camp (les deux joueurs peuvent les voir), les trois autres face cachée dans sa propre pile. Chaque carte indique ses déplacements avec des flèches : ↑↑ signifie deux cases vers l’avant, ↑← une case vers l’avant et une vers la gauche, ↗ une case en diagonale. « Vers l’avant » signifie toujours en direction de l’autre camp.",
    cardtactics_term_moving: "Jouer un coup",
    cardtactics_rules_moving: "Choisis l’une de tes trois cartes visibles, puis l’une de tes pierres, puis une case autorisée par la carte. Tu peux aller sur une case vide ou sur une pierre ennemie, que tu captures. Tes propres pierres bloquent le passage. Tu n’utilises jamais une carte de l’autre camp.",
    cardtactics_term_cycle: "La pile de cartes",
    cardtactics_rules_cycle: "La carte au sommet de ta pile face cachée prend la place de celle que tu as utilisée, et la carte utilisée retourne dans ta pile à un endroit caché. Tu ne sais donc jamais quelle carte viendra ensuite, et tes cartes ne passent jamais à l’autre camp.",
    cardtactics_term_opening: "Premier coup",
    cardtactics_rules_opening: "Le premier coup du joueur qui commence avance d’une rangée au maximum, et son deuxième coup ne peut pas avancer de deux rangées tout droit. Cela compense l’avantage de commencer.",
    cardtactics_term_pass: "Aucun coup possible",
    cardtactics_rules_pass: "Si tu ne peux pas jouer, tu passes ton tour et ta première carte visible retourne dans ta pile.",
    cardtactics_rules_end_title: "Gagner la partie",
    cardtactics_term_win: "Deux pierres au but",
    cardtactics_rules_win: "Une pierre qui atteint la rangée du fond adverse (la rangée d’arrivée) a traversé : elle quitte le plateau et compte comme arrivée au but ; une pierre ennemie qui s’y trouve est capturée. Le premier à amener deux pierres au but gagne. Tu gagnes aussi si l’autre camp n’a plus deux pierres au total sur le plateau et au but.",
    cardtactics_term_limit: "Limite de coups",
    cardtactics_rules_limit: "Après 120 coups, la partie se termine : gagne celui qui a le plus de pierres au but, puis celui qui en a le plus sur le plateau ; sinon, c’est une nulle.",
    cardtactics_history_title: "L’histoire de Tactique de Cartes",
    cardtactics_history_origins_title: "Les courses vers l’autre côté",
    cardtactics_history_origins_p1: "Amener ses propres pièces de l’autre côté du plateau est un vieux but des jeux de société. Halma, inventé en 1883 ou 1884 par le chirurgien américain George Howard Monks, se gagne en étant le premier à déplacer toutes ses pièces dans le camp du coin opposé.",
    cardtactics_history_origins_p2: "Dans Halma et aux échecs, chaque pièce se déplace toujours de la même façon. Dans Tactique de Cartes, une pierre n’a pas de mouvement propre : tes cartes visibles déterminent les déplacements possibles, et chaque camp a ses propres cartes.",
    cardtactics_history_version_title: "Cette version",
    cardtactics_history_version_p1: "PaperGames a réécrit les règles en octobre 2026 : un plateau de 7 rangées sur 6 colonnes, six pierres identiques par camp, six cartes propres à chaque camp (trois visibles, trois dans une pile face cachée) et l’objectif d’amener deux pierres à la maison. Les douze cartes, leurs flèches et leurs noms sont propres à PaperGames."
});
I18n.markTextLoaded("fr");
