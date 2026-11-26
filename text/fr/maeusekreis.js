// text/fr/maeusekreis.js
// Rules and history texts of maeusekreis (fr). Loaded by maeusekreis-rules.html and maeusekreis-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    maeusekreis_rules_title: "Règles du Cercle de la souris",
    maeusekreis_rules_intro: "Un chat et une souris sur un cercle de points. La souris ne suit que le cercle ; le chat peut aussi emprunter les lignes droites qui le traversent. Le chat attrapera-t-il la souris avant d’avoir épuisé ses pas ?",
    maeusekreis_rules_basics_title: "Les règles",
    maeusekreis_term_board: "Le plateau",
    maeusekreis_rules_board: "Les points forment un cercle ; chacun est relié à ses deux voisins. Quelques lignes en pointillés traversent le cercle. Facile a 8 points, Moyen 10 et Difficile 12. Le chat et la souris commencent sur des points choisis au hasard, séparés d’au moins trois points.",
    maeusekreis_term_moves: "Les déplacements",
    maeusekreis_rules_moves: "La souris joue d’abord, puis le chat, et ainsi de suite. À chaque tour, la pièce avance d’un pas vers un point voisin ; elle ne peut pas rester sur place. La souris suit seulement le cercle. Le chat peut suivre le cercle ou les lignes en pointillés. La souris ne peut pas aller sur le chat. Touchez un point marqué pour vous y déplacer.",
    maeusekreis_term_end: "Attrapée ou en fuite",
    maeusekreis_rules_end: "Quand le chat arrive sur le point de la souris, il l’attrape et gagne. Personne ne se fait mal : la partie se termine, c’est tout. Le chat a un nombre fixe de pas, indiqué au-dessus du plateau. S’il les a tous utilisés et que la souris est encore libre, elle s’échappe et gagne.",
    maeusekreis_term_steps: "Le nombre de pas",
    maeusekreis_rules_steps: "Le nombre de pas est calculé pour chaque départ. À deux, ou quand vous jouez le chat, celui-ci a exactement assez de pas pour attraper la souris, à condition de n’en gaspiller aucun. Quand vous jouez la souris contre l’ordinateur, le chat a un pas de moins : une souris prudente peut donc s’échapper.",
    maeusekreis_term_computer: "L’ordinateur",
    maeusekreis_rules_computer: "Contre l’ordinateur, choisissez le chat ou la souris. Facile fait beaucoup d’erreurs, Moyen quelques-unes, Difficile aucune. Le bouton Indice montre le meilleur pas, et Annuler retire votre dernier coup.",
    maeusekreis_history_title: "L’histoire du Cercle de la souris",
    maeusekreis_history_origins_title: "Les anciens jeux de poursuite",
    maeusekreis_history_origins_p1: "Les jeux où un camp chasse et l’autre tente de s’échapper existent dans de nombreux pays. En Europe, le renard et les oies se joue depuis des siècles sur un plateau de lignes et de points ; des jeux de chasse semblables viennent d’Asie. Un camp est fort, l’autre a le nombre ou l’espace pour lui.",
    maeusekreis_history_maths_title: "Une poursuite sur des points et des lignes",
    maeusekreis_history_maths_p1: "À partir de la fin des années 1970, des mathématiciens ont commencé à étudier les poursuites sur des réseaux de points et de lignes : sur quels réseaux un chasseur peut-il toujours attraper le fuyard ? Ce jeu est souvent appelé les policiers et les voleurs. Sur un cercle simple, le fuyard s’échappe toujours ; les raccourcis qui traversent le cercle changent la donne.",
    maeusekreis_history_here_title: "Le Cercle de la souris ici",
    maeusekreis_history_here_p1: "L’idée d’un chat et d’une souris sur un cercle vient d’un joueur. Les règles de PaperGames sont originales : la souris reste sur le cercle, le chat peut couper à travers, et une recherche de toutes les positions détermine le nombre de pas du chat."
});
I18n.markTextLoaded("fr");
