// text/fr/alquerque.js
// Rules and history texts of alquerque (fr). Loaded by alquerque-rules.html and alquerque-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    alquerque_rules_title: "Règles de l'Alquerque",
    alquerque_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue à l'Alquerque, le jeu de saut décrit dans le Livre des jeux d'Alphonse X de Castille.",
    alquerque_rules_basics_title: "L'idée de base",
    alquerque_term_board: "Le plateau",
    alquerque_rules_board: "Le plateau compte 25 points sur une grille de 5x5. Les points voisins sont reliés horizontalement et verticalement, et certains aussi en diagonale : les lignes diagonales ne passent que par un point sur deux, de sorte que les quatre coins et le centre sont reliés dans les huit directions. Les pions ne peuvent se déplacer que le long des lignes tracées.",
    alquerque_term_setup: "Mise en place",
    alquerque_rules_setup: "Chaque camp a 12 pions : les Blancs (anneaux) en bas, les Noirs (disques pleins) en haut. Chaque camp occupe les deux rangées les plus proches de lui et les deux points de la rangée du milieu situés sur sa propre droite. Le point central reste vide. Les Blancs commencent.",
    alquerque_term_move: "Déplacement",
    alquerque_rules_move: "À votre tour, déplacez un de vos pions le long d'une ligne vers un point voisin libre : en avant, de côté ou en diagonale vers l'avant. Un pion ne recule jamais, même en diagonale. En avant signifie vers le camp adverse.",
    alquerque_term_capture: "Capture",
    alquerque_rules_capture: "Un pion capture en sautant le long d'une ligne par-dessus un pion ennemi voisin vers le point vide situé juste derrière. Le pion sauté est retiré. Si le même pion peut ensuite sauter à nouveau, il continue dans le même tour, même en changeant de direction. Les sauts sont permis dans toutes les directions, aussi vers l'arrière – une règle de PaperGames, car la source n'interdit que de reculer en se déplaçant.",
    alquerque_term_forced: "Prise obligatoire",
    alquerque_rules_forced: "Si vous pouvez capturer, vous devez le faire : tant qu'une capture est possible, PaperGames ne vous laisse jouer que des coups de capture, et un pion qui peut continuer à sauter doit continuer jusqu'à ce qu'il ne le puisse plus. Quand plusieurs captures sont possibles, vous pouvez choisir n'importe laquelle, pas seulement la plus longue.",
    alquerque_rules_end_title: "Comment une partie se termine",
    alquerque_term_win: "Victoire",
    alquerque_rules_win: "Vous gagnez quand votre adversaire n'a plus aucun pion, ou en a encore mais n'a aucun coup légal à jouer à son tour.",
    alquerque_term_resignation: "Abandon",
    alquerque_term_dead: "Camps qui ne peuvent plus se rencontrer",
    alquerque_rules_dead: "Règle de PaperGames : quand chaque pion blanc se trouve au moins deux rangées plus haut que chaque pion noir, les camps ne peuvent plus jamais se rencontrer – les blancs ne vont que vers le haut ou de côté, les noirs que vers le bas ou de côté. Plus personne ne pourrait prendre et la partie ne finirait jamais ; elle se termine donc aussitôt : le camp qui a le plus de pions gagne, à égalité c'est une partie nulle.",
    alquerque_rules_resignation: "Un joueur peut abandonner à tout moment, ce qui met fin à la partie immédiatement en faveur de l'adversaire.",
    alquerque_rules_versions_title: "Quelle version est jouée ici",
    alquerque_rules_versions: "Les anciennes descriptions de l'alquerque laissent certains points ouverts. Dans la source ci-dessous, la prise n'est pas obligatoire : un pion qui aurait pu prendre et ne l'a pas fait est retiré (« souffler », en anglais « huffing »). PaperGames garde la prise obligatoire, car l'appli ne propose de toute façon que des coups légaux. Les pions ne reculent jamais en se déplaçant, mais sautent dans toutes les directions (règle de PaperGames). Les blancs commencent.",
    alquerque_rules_sources_title: "Sources",
    alquerque_rules_sources: "L'interdiction de reculer et la fin de partie suivent : Wikipedia, „Alquerque“, section Rules: https://en.wikipedia.org/wiki/Alquerque (consulté le 6 octobre 2026).",
    alquerque_history_title: "L'histoire de l'Alquerque",
    alquerque_history_origins_title: "Un nom venu de l'arabe",
    alquerque_history_origins_p1: "Le nom vient de l'arabe al-qirkat, le nom d'un jeu de plateau connu dans le monde arabe. Il est arrivé en Espagne sous la domination maure et y a survécu sous le nom d'alquerque.",
    alquerque_history_book_title: "Le Livre des jeux",
    alquerque_history_book_p1: "En 1283, le roi Alphonse X de Castille fit achever le Libro de los juegos, le Livre des jeux. Outre les échecs, les dés et les jeux de tables, il décrit l'alquerque avec ses règles et des illustrations, ce qui en fait l'une des plus anciennes sources écrites sur ce jeu.",
    alquerque_history_checkers_title: "De l'Alquerque au jeu de dames",
    alquerque_history_checkers_p1: "Le jeu de dames est généralement considéré comme un descendant de l'alquerque : sa capture par saut et la règle selon laquelle une capture doit être jouée ont été transposées sur les cases de l'échiquier. L'alquerque lui-même a continué d'être joué, et des jeux similaires sont connus dans de nombreuses régions.",
    alquerque_history_modern_title: "Sur PaperGames",
    alquerque_history_modern_p1: "PaperGames propose la partie à 12 contre 12 sur le plateau de 5x5 avec prise obligatoire. Les lignes du plateau sont entièrement tracées, car elles seules montrent quels déplacements en diagonale existent."
});
I18n.markTextLoaded("fr");
