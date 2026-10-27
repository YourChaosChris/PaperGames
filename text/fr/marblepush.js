// text/fr/marblepush.js
// Rules and history texts of marblepush (fr). Loaded by marblepush-rules.html and marblepush-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    marblepush_rules_title: "Règles de Pousse-billes",
    marblepush_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue à Pousse-billes - utile si vous êtes rouillé, ou si vous apprenez.",
    marblepush_rules_basics_title: "L'idée de base",
    marblepush_term_board: "Le plateau",
    marblepush_rules_board: "Un hexagone de 61 cases, disposées en rangées de 5, 6, 7, 8, 9, 8, 7, 6, 5. Chaque joueur commence avec 14 billes : ses deux rangées les plus proches entièrement remplies, plus les 3 cases centrales de la rangée suivante. Les Noirs jouent en premier.",
    marblepush_term_move: "Déplacer une seule bille",
    marblepush_rules_single: "Sélectionnez une bille et faites-la glisser vers n'importe quelle case vide adjacente.",
    marblepush_term_line: "Déplacer une ligne",
    marblepush_rules_line: "Sélectionnez 2 ou 3 de vos propres billes alignées sans interruption, puis déplacez toute la ligne d'un pas dans l'une des 6 directions du plateau. Il existe deux types de mouvements de ligne, décrits ci-dessous.",
    marblepush_term_sidestep: "Mouvement latéral",
    marblepush_rules_sidestep: "La ligne se déplace sur le côté, hors de son propre axe. Chaque case sur laquelle la ligne se déplace doit être vide - un mouvement latéral ne peut jamais pousser quoi que ce soit.",
    marblepush_term_linestep: "Mouvement en ligne",
    marblepush_rules_linestep: "La ligne se déplace le long de son propre axe, dans la direction indiquée par l'une de ses deux extrémités. Si la case juste devant est vide, toute la ligne glisse simplement vers l'avant.",
    marblepush_term_pushing: "La poussée",
    marblepush_rules_pushing: "Si la case juste devant un mouvement en ligne contient des billes adverses, vous pouvez les pousser - mais seulement si votre ligne est strictement plus longue que la ligne adverse continue qui la bloque (3 billes peuvent pousser 1 ou 2 billes, 2 billes peuvent en pousser 1 ; 1 bille ne peut jamais pousser). Il faut aussi de la place pour pousser : soit une case vide juste après la ligne adverse, soit le bord du plateau. Si la ligne adverse dépasse le bord du plateau, sa dernière bille est éliminée - c'est ainsi que l'on marque des points.",
    marblepush_rules_example_title: "Exemple concret : 3 billes en poussent 1",
    marblepush_rules_example_intro: "Dans le petit diagramme ci-dessous, ● représente les Noirs et ○ les Blancs. Les Noirs ont 3 billes alignées (A, B, C) face à une seule bille blanche (D), avec une case vide (E) - ou le bord du plateau - juste derrière.",
    marblepush_rules_example_caption: "La ligne de 3 billes noires (A, B, C) est plus nombreuse que la bille blanche isolée (D), et la case E est vide - les Noirs peuvent donc pousser : toute la ligne avance d'un pas, D est poussée vers E, et la ligne noire occupe alors B, C et l'ancienne case de D. Si E avait plutôt été le bord du plateau, D aurait été totalement éliminée.",
    marblepush_rules_end_title: "Fin de partie",
    marblepush_term_win: "Victoire",
    marblepush_rules_win: "Le premier joueur à pousser 6 billes adverses hors du plateau gagne la partie.",
    marblepush_term_resignation: "Abandon",
    marblepush_rules_resignation: "Un joueur peut abandonner à tout moment, ce qui met immédiatement fin à la partie en faveur de l'adversaire.",
    marblepush_history_title: "L'histoire de Pousse-billes",
    marblepush_history_origins_title: "Les jeux de poussée sur plateau hexagonal",
    marblepush_history_origins_p1: "Les jeux où l'on pousse les pièces au lieu de les sauter ou de les prendre sur place ont une longue tradition, tout comme les plateaux hexagonaux : chaque case a six voisines au lieu de quatre, ce qui donne plus de directions à chaque pièce et évite les diagonales peu pratiques d'une grille carrée.",
    marblepush_history_origins_p2: "Pousse-billes appartient à cette famille. Les billes sont simples et toutes égales, et tout le jeu repose sur une seule idée : une ligne de billes plus longue peut pousser une ligne plus courte.",
    marblepush_history_award_title: "Une règle, beaucoup de profondeur",
    marblepush_history_award_p1: "Comme une bille ne peut être perdue que si une ligne strictement plus longue la pousse hors du plateau, rien ne compte plus que de garder ses billes en groupes solides. Une bille isolée ne peut jamais pousser, et un groupe près du bord est toujours en danger.",
    marblepush_history_award_p2: "Chaque partie devient ainsi une lutte patiente pour le centre : le camp qui tient le milieu peut pousser vers l'extérieur dans toutes les directions, tandis que l'autre est repoussé vers le bord.",
    marblepush_history_legacy_title: "Un jeu sans hasard",
    marblepush_history_legacy_p1: "Pas de dés, pas d'information cachée, pas de pièces spéciales - seulement deux jeux de billes identiques et quelques règles simples sur quelle ligne peut pousser laquelle. C'est donc une pure épreuve de planification, dans l'esprit de classiques plus anciens comme le go et les dames."
});
I18n.markTextLoaded("fr");
