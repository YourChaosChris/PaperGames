// text/fr/reversi.js
// Rules and history texts of reversi (fr). Loaded by reversi-rules.html and reversi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    reversi_rules_title: "Règles du Reversi",
    reversi_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Reversi - utile pour se rafraîchir la mémoire ou pour apprendre.",
    reversi_rules_basics_title: "L'idée de base",
    reversi_term_discs: "Les pions et le départ",
    reversi_rules_discs: "Le Reversi se joue sur un plateau de 8x8. La partie commence avec deux pions de chaque couleur placés en diagonale au centre. Les Noirs jouent toujours en premier.",
    reversi_term_flanking: "Encadrement",
    reversi_rules_flanking: "Un coup place un pion sur une case vide de façon à encadrer - piéger entre votre nouveau pion et un autre pion à vous - un ou plusieurs pions adverses en ligne droite (à l'horizontale, à la verticale ou en diagonale). Chaque pion encadré se retourne immédiatement à votre couleur.",
    reversi_rules_pass_title: "Quand vous ne pouvez pas jouer",
    reversi_term_pass: "Aucun coup légal",
    reversi_rules_pass: "Si vous n'avez aucun coup légal, votre tour est automatiquement passé et la main revient à votre adversaire - il n'existe aucun moyen de passer volontairement tant qu'un coup légal existe. Si aucun des deux joueurs n'a de coup légal, la partie se termine immédiatement.",
    reversi_rules_end_title: "Comment une partie se termine",
    reversi_term_win: "Victoire",
    reversi_rules_win: "La partie se termine dès qu'aucun des deux joueurs n'a de coup légal (généralement parce que le plateau est plein). Celui qui a le plus de pions sur le plateau gagne ; un partage égal est une nulle.",
    reversi_term_resignation: "Abandon",
    reversi_rules_resignation: "Un joueur peut abandonner à tout moment, ce qui met fin à la partie immédiatement en faveur de l'adversaire.",
    reversi_history_title: "L'Histoire du Reversi",
    reversi_history_origins_title: "Un original victorien",
    reversi_history_origins_p1: "Le Reversi est apparu pour la première fois en Angleterre au début des années 1880, au cœur d'une querelle typiquement victorienne : deux joueurs, Lewis Waterman et John W. Mollett, revendiquaient chacun l'invention du jeu, et publièrent en 1888 des pamphlets rivaux s'accusant mutuellement d'avoir volé l'idée. Les historiens ne savent toujours pas avec certitude à qui revient le mérite.",
    reversi_history_origins_p2: "Dans les premières versions du Reversi, les joueurs pouvaient placer leurs premiers pions n'importe où sur le plateau, et certaines règles victoriennes faisaient perdre tout le plateau au camp totalement encerclé en un seul coup - des particularités abandonnées avec le temps lorsque les règles furent standardisées.",
    reversi_history_spread_title: "Réinventé au Japon",
    reversi_history_spread_p1: "Le jeu réapparut au Japon en 1973, lorsque Goro Hasegawa affina les règles du Reversi - en fixant les quatre pions de départ selon le motif diagonal désormais familier et en supprimant les anciennes variantes - puis le publia chez Tsukuda Original sous un nouveau nom : Othello, clin d'œil à la pièce de Shakespeare et à son conflit central noir contre blanc.",
    reversi_history_spread_p2: "L'Othello est devenu extrêmement populaire au Japon puis dans le monde entier, donnant naissance à un championnat du monde d'Othello organisé chaque année depuis 1977 et consacrant le règlement standardisé - celui utilisé dans cette application - comme la version pratiquée en compétition aujourd'hui.",
    reversi_history_modern_title: "Un champ de bataille pour les ordinateurs",
    reversi_history_modern_p1: "L'Othello s'est révélé être un sujet particulièrement propice à la recherche en jeu informatique : ses règles sont simples, mais le nombre considérable de positions atteignables a longtemps empêché les stratégies naïves de bien fonctionner.",
    reversi_history_modern_p2: "En août 1997, le programme Logistello de Michael Buro a battu le champion du monde en titre Takeshi Murakami par 6 parties à 0 - un résultat marquant survenu la même année que la victoire de Deep Blue aux échecs. Les moteurs d'Othello n'ont fait que se renforcer depuis, et le jeu est aujourd'hui considéré comme résolu, ou presque, depuis un large éventail de positions.",
    reversi_history_names_title: "Pourquoi Reversi",
    reversi_history_names_p1: "Le Reversi lui-même date du XIXe siècle et appartient au domaine public. Othello est une marque déposée. PaperGames n'a aucun lien avec les titulaires de cette marque et utilise donc le nom plus ancien de Reversi."
});
I18n.markTextLoaded("fr");
