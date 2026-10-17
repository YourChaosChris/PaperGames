// text/fr/shapesort.js
// Rules and history texts of shapesort (fr). Loaded by shapesort-rules.html and shapesort-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    shapesort_rules_title: "Règles de Trier les formes",
    shapesort_rules_intro: "Un casse-tête de tri avec des formes au lieu de couleurs : déplacez les pierres jusqu'à ce que chaque tube ne contienne qu'une forme.",
    shapesort_rules_basics_title: "Les règles",
    shapesort_term_tubes: "Les tubes",
    shapesort_rules_tubes: "Chaque tube contient autant de pierres que choisi sous Pierres par tube : 4, 6, 8 ou 10. Au départ, les pierres sont mélangées et deux tubes sont vides.",
    shapesort_term_move: "Un coup",
    shapesort_rules_move: "Touchez un tube : sa pierre du dessus est marquée, avec les pierres de même forme juste en dessous. Touchez ensuite un autre tube. Les pierres y vont si ce tube est vide ou a la même forme au-dessus - autant qu'il en tient. Touchez de nouveau le tube marqué pour reposer les pierres.",
    shapesort_term_goal: "Le but",
    shapesort_rules_goal: "Le casse-tête est résolu quand chaque tube est vide ou rempli de pierres de la même forme.",
    shapesort_term_shapes: "Les formes",
    shapesort_rules_shapes: "Cercle, carré, triangle, étoile, cœur, croix, losange et lune. Elles se distinguent par leur contour ; certaines sont pleines, d'autres seulement dessinées en contour, mais ce n'est qu'une aide de plus.",
    shapesort_term_levels: "Niveaux",
    shapesort_rules_levels: "Facile : 4 formes dans 6 tubes. Moyen : 6 formes dans 8 tubes. Difficile : 8 formes dans 10 tubes. Le nombre de pierres par tube se choisit à part ; avec plus de pierres, les formes sont plus petites et les tubes plus hauts. Sur les écrans étroits, les tubes sont sur plusieurs rangées.",
    shapesort_term_tools: "Annuler, Mélanger, Indice",
    shapesort_rules_tools: "« Annuler » reprend autant de coups que vous voulez. « Mélanger » distribue un nouveau casse-tête. « Indice » marque deux tubes : déplacez les pierres du dessus du premier vers le second. Chaque casse-tête a été vérifié comme soluble ; si vous êtes bloqué, l'indice le dit et vous pouvez annuler quelques coups.",
    shapesort_rules_example_title: "Exemple",
    shapesort_rules_example: "L'image montre des tubes en cours de partie. Les pierres marquées en haut du premier tube peuvent aller sur le tube qui a la même forme au-dessus, ou dans le tube vide.",
    shapesort_history_title: "L'histoire des casse-têtes de tri",
    shapesort_history_origins_title: "Pièces, tiges et règles",
    shapesort_history_origins_p1: "Les casse-têtes où l'on déplace des pièces entre des supports selon des règles fixes sont anciens. Dans la tour de Hanoï, publiée en 1883 par le mathématicien français Édouard Lucas, des disques passent un par un entre trois tiges, jamais un grand sur un plus petit.",
    shapesort_history_sort_title: "Trier par sorte",
    shapesort_history_sort_p1: "Ces dernières années sont apparus de nombreux casse-têtes où l'on déplace des pièces mélangées entre des récipients jusqu'à ce que chacun n'en contienne qu'une sorte - surtout comme jeux pour téléphone et presque toujours avec des couleurs. Sur un écran à encre électronique noir et blanc, les couleurs ne fonctionnent pas : PaperGames trie donc des formes.",
    shapesort_history_modern_title: "Comment PaperGames crée chaque casse-tête",
    shapesort_history_modern_p1: "Chaque casse-tête est distribué au hasard. Un solveur cherche ensuite une façon de tout trier ; seule une donne pour laquelle il en trouve une est utilisée, et aucun tube n'est déjà terminé au départ. Le même solveur donne les indices."
});
I18n.markTextLoaded("fr");
