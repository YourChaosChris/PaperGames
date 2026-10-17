// text/fr/mathcross.js
// Rules and history texts of mathcross (fr). Loaded by mathcross-rules.html and mathcross-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    mc_rules_title: "Grille de calcul – règles",
    mc_rules_intro: "Placez les nombres de 1 à 9 pour que chaque calcul tombe juste.",
    mc_rules_basics_title: "Les règles",
    mc_term_grid: "La grille",
    mc_rules_grid: "Neuf cases en trois lignes et trois colonnes, un signe d'opération entre deux cases voisines (+, −, ×, ÷) et le résultat au bout de chaque ligne et sous chaque colonne. Chaque nombre de 1 à 9 va dans une seule case. Certains nombres sont donnés.",
    mc_term_order: "De gauche à droite",
    mc_rules_order: "Une ligne se calcule de gauche à droite, une colonne de haut en bas, une étape après l'autre, sans priorité de la multiplication : 3 + 4 × 2 donne 7 × 2 = 14, pas 11. Certaines versions scolaires de cette énigme appliquent les priorités habituelles ; ici, c'est toujours de gauche à droite.",
    mc_term_whole: "Nombres entiers",
    mc_rules_whole: "Chaque résultat intermédiaire et chaque résultat est un nombre entier supérieur à 0 ; une division tombe donc toujours juste.",
    mc_term_levels: "Niveaux",
    mc_rules_levels: "Facile : seulement + et −, 4 nombres donnés. Moyen : aussi ×, 3 donnés. Difficile : les quatre opérations avec au moins une ÷, 2 donnés. Chaque grille a une seule solution et se résout sans deviner.",
    mc_term_help: "Jouer",
    mc_rules_help: "Touchez une case vide, puis un nombre sous la grille ; touchez de nouveau le nombre ou Effacer pour vider la case. Un nombre déjà placé dans une autre case est déplacé ici. Quand une ligne ou une colonne est pleine, une coche ou une croix indique si elle tombe juste. Le bouton Indice signale d'abord un nombre faux, sinon il remplit une case que l'on peut déduire maintenant.",
    mc_rules_example_title: "Exemple",
    mc_rules_example: "Une grille de calcul résolue. Ligne du milieu : 9 − 1 = 8, puis 8 × 3 = 24, de gauche à droite, et non 9 − 3 = 6.",
    mc_history_title: "Histoire de la grille de calcul",
    mc_history_magic_title: "Le carré magique",
    mc_history_magic_p1: "L'énigme numérique la plus connue avec les nombres de 1 à 9 dans une grille 3 × 3 est le carré magique, où chaque ligne, colonne et diagonale donne 15. En Chine, on l'appelle Lo Shu (Luoshu) et il est lié à une légende de tortue. Son âge réel reste incertain : les dates données par les sources sont très éloignées les unes des autres.",
    mc_history_today_title: "Des calculs en lignes et en colonnes",
    mc_history_today_p1: "La grille de calcul garde la grille 3 × 3 avec les nombres de 1 à 9, mais demande un calcul différent dans chaque ligne et chaque colonne. Des énigmes de ce genre paraissent dans les cahiers d'école et les recueils de jeux, parfois avec les priorités habituelles. PaperGames n'a pas pu savoir où cette forme est apparue en premier ; le nom décrit simplement ce que l'on voit."
});
I18n.markTextLoaded("fr");
