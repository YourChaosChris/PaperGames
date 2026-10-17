// text/fr/cratepusher.js
// Rules and history texts of cratepusher (fr). Loaded by cratepusher-rules.html and cratepusher-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    sudoku_rules_basics_title: "L'idée de base",
    cratepusher_rules_title: "Règles du Pousse-caisses",
    cratepusher_rules_intro: "Comment fonctionne le Pousse-caisses sur PaperGames : un casse-tête pour une personne, où l'on déplace des caisses dans un petit entrepôt.",
    cratepusher_term_board: "Le plateau",
    cratepusher_rules_board: "Une grille rectangulaire de murs (noir plein) et de sol (blanc). Sur le sol se trouvent vous-même (un disque plein), plusieurs caisses (un carré avec une croix) et exactement autant de cases cibles (un petit carré creux). Une caisse posée sur une cible devient un carré plein.",
    cratepusher_term_move: "Se déplacer",
    cratepusher_rules_move: "Vous vous déplacez case par case, vers le haut, le bas, la gauche ou la droite – jamais en diagonale. Vous ne pouvez pas traverser les murs ni les caisses.",
    cratepusher_rules_move_targets: "Vous pouvez marcher sur les cibles vides ; seuls les murs et les caisses vous bloquent.",
    cratepusher_rules_hint: "« Indice » vous montre une seule poussée : la première d'une solution la plus courte depuis votre position actuelle. La caisse à pousser reçoit un cadre en pointillés, la case où elle doit aller un cadre plein, et une phrase sous le plateau indique la ligne, la colonne et la direction (comptées sans le mur extérieur). L'indice montre seulement la poussée – c'est vous qui la faites. Pour la suivante, touchez de nouveau « Indice ». S'il n'y a plus de solution depuis votre position, l'indice vous le dit. Les indices ne sont pas enregistrés et ne changent rien à vos statistiques.",
    cratepusher_term_push: "Pousser",
    cratepusher_rules_push: "En marchant contre une caisse, vous la poussez d'une case, mais seulement si la case derrière est libre : ni mur ni deuxième caisse. Vous ne poussez jamais qu'une caisse à la fois, et vous ne pouvez jamais tirer une caisse vers vous.",
    cratepusher_term_goal: "Le but",
    cratepusher_rules_goal: "Le niveau est résolu dès que chaque caisse est sur une cible. Peu importe quelle caisse va sur quelle cible.",
    cratepusher_term_stuck: "Se bloquer",
    cratepusher_rules_stuck: "Comme les caisses ne se tirent pas, une poussée irréfléchie peut rendre un niveau insoluble – par exemple une caisse poussée dans un coin qui n'est pas une cible. Le jeu vous prévient quand une caisse est coincée dans un tel coin. Les autres impasses ne sont pas signalées : réfléchissez à l'avance et utilisez « Annuler le coup » aussi souvent que vous voulez.",
    cratepusher_term_controls: "Commandes",
    cratepusher_rules_controls: "Touchez une case voisine pour y aller (et pousser la caisse qui s'y trouve). Touchez une case de sol plus éloignée et vous y allez par le plus court chemin – seulement si vous pouvez y arriver sans pousser de caisse. Les touches fléchées et W, A, S, D vous déplacent aussi. « Annuler le coup » annule vos coups un par un, autant que vous voulez ; « Recommencer le niveau » reprend le niveau depuis le début.",
    cratepusher_term_levels: "Les niveaux",
    cratepusher_rules_levels: "Chaque niveau est construit par PaperGames lui-même, à chaque fois nouveau : facile sur une grille de 7x7 avec 3 caisses, moyen sur 9x9 avec 4, difficile sur 10x10 avec 5. Le programme construit chaque niveau à rebours à partir de la position résolue, il est donc toujours soluble, puis le vérifie encore avec son propre solveur. Le nombre de poussées de la meilleure solution est affiché au-dessus du plateau, avec vos pas, vos poussées et le nombre de caisses déjà sur une cible.",
    cratepusher_history_title: "L'histoire du Pousse-caisses",
    cratepusher_history_origins_title: "Une idée de 1981",
    cratepusher_history_origins_p1: "Le principe consistant à pousser des caisses une par une sur des emplacements marqués, sans jamais les tirer, a été inventé en 1981 par Hiroyuki Imabayashi. En 1982, la société japonaise Thinking Rabbit l'a publié comme jeu vidéo sous le nom de Sokoban.",
    cratepusher_history_origins_p2: "Derrière ces règles simples se cache une vraie profondeur : même de petites salles peuvent exiger de longues séquences de coups soigneusement planifiées, et des informaticiens ont montré que résoudre ce genre de casse-tête est en général très difficile. L'idée a depuis été reprise par d'innombrables jeux de réflexion.",
    cratepusher_history_names_title: "Pourquoi un autre nom",
    cratepusher_history_names_p1: "Sokoban est une marque déposée de Falcon Co., Ltd. PaperGames n'a aucun lien avec Falcon ni avec le jeu original et utilise donc son propre nom : Pousse-caisses. C'est la même chose pour le Calcudoku, joué sous son propre nom pour la même raison.",
    cratepusher_history_names_p2: "Aucun des niveaux proposés ici ne vient du jeu original ni d'une collection de niveaux. Chaque niveau est créé par le programme de PaperGames quand vous en demandez un – construit à rebours à partir de la position résolue et vérifié par son propre solveur."
});
I18n.markTextLoaded("fr");
