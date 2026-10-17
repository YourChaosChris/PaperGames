// text/fr/arrows.js
// Rules and history texts of arrows (fr). Loaded by arrows-rules.html and arrows-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    aw_rules_title: "Flèches – règles",
    aw_rules_intro: "Faites sortir chaque flèche du plateau.",
    aw_rules_basics_title: "Les règles",
    aw_term_move: "Déplacer",
    aw_rules_move: "Touchez une flèche. Elle glisse hors du plateau dans la direction de sa pointe, mais seulement si toutes les cases entre sa pointe et le bord sont libres. Une flèche de plusieurs cases suit sa pointe ; son propre corps ne doit pas non plus barrer la route.",
    aw_term_blocked: "Bloquée",
    aw_rules_blocked: "Si une autre flèche barre la route, la flèche touchée reste à sa place et la flèche gênante reçoit un cadre pointillé. Il n'y a pas de pénalité : sortez d'abord cette flèche.",
    aw_term_glide: "Flèches glissantes (Difficile et Maître)",
    aw_rules_glide: "En Difficile, une flèche bloquée ne reste pas en place : elle glisse en avant, le corps suivant la tête, jusqu'à la flèche suivante et s'y arrête. Cela peut bloquer d'autres flèches pour de bon : réfléchissez avant de toucher. Annuler reprend un coup, et Indice cherche une issue depuis la position actuelle. Les flèches y ont jusqu'à deux coudes, sur 11 × 11 cases.",
    aw_term_master: "Maître",
    aw_rules_master: "Comme Difficile, mais avec trois cœurs : chaque touche qui ne fait pas sortir une flèche en coûte un. Pas d'indice ni de cadre autour de la flèche qui gêne. Sans cœur, vous pouvez réessayer la même énigme.",
    aw_term_goal: "But",
    aw_rules_goal: "Videz tout le plateau. Chaque énigme est construite pour avoir une solution, et sortir une flèche n'en bloque jamais une autre : vous ne pouvez donc pas rester coincé. Le nombre minimal de coups est le nombre de flèches ; une annulation compte aussi comme un coup.",
    aw_term_levels: "Niveaux",
    aw_rules_levels: "Facile : 5 × 5 cases avec des flèches courtes. Moyen : 7 × 7 avec des flèches de deux à quatre cases. Difficile : 11 × 11 avec des flèches glissantes jusqu'à sept cases et deux coudes. Maître : comme Difficile, avec trois cœurs. Grand maître : 15 × 15, avec des flèches glissantes jusqu’à 15 cases et six coudes, plus trois cœurs. Les images utilisent l’une des douze silhouettes en cases. L’indice fonctionne au Grand maître et dans les images.",
    aw_term_help: "Indice",
    aw_rules_help: "« Indice » marque une flèche qui peut sortir maintenant.",
    aw_rules_example_title: "Exemple",
    aw_rules_example: "La longue flèche pointe vers la droite, mais la courte flèche lui barre la route. La courte flèche peut sortir par le haut ; ensuite la route est libre pour la longue flèche.",
    aw_history_title: "Histoire des Flèches",
    aw_history_slide_title: "Des pièces qui glissent",
    aw_history_slide_p1: "Les énigmes où des pièces glissent dans un cadre sont anciennes. La plus connue est le taquin : quinze blocs numérotés dans une boîte prévue pour seize. Il a été inventé par Noyes Palmer Chapman, receveur des postes à Canastota, dans l'État de New York. À partir de décembre 1879, l'artisan du bois bostonien Matthias Rice l'a fabriqué sous le nom de « Gem Puzzle », et en 1880 il est devenu une mode folle en Amérique, puis bientôt en Europe. Sam Loyd a prétendu plus tard l'avoir inventé, mais il n'y était pour rien.",
    aw_history_arrows_title: "Des flèches qui sortent",
    aw_history_arrows_p1: "Dans l'énigme des flèches, chaque pièce ne peut aller que dans une direction, et elle quitte le plateau au lieu de glisser d'avant en arrière. Ces énigmes sont devenues populaires ces dernières années dans les jeux pour écrans tactiles ; on ne leur connaît pas d'inventeur unique. Les énigmes d'ici sont faites pour PaperGames : construites à rebours, pour que chaque plateau puisse être vidé."
});
I18n.markTextLoaded("fr");
