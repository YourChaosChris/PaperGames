// text/fr/tenpairs.js
// Rules and history texts of tenpairs (fr). Loaded by tenpairs-rules.html and tenpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    tp_rules_title: "Règles des Paires de dix",
    tp_rules_intro: "Barre des paires de chiffres jusqu'à ce qu'il n'en reste plus.",
    tp_rules_basics_title: "Les règles",
    tp_term_field: "La grille",
    tp_rules_field: "Des chiffres de 1 à 9 sur neuf colonnes, lus ligne par ligne comme un texte.",
    tp_term_pairs: "Paires",
    tp_rules_pairs: "Deux chiffres sont barrés ensemble s'ils sont égaux (3 et 3) ou si leur somme fait 10 (1 et 9, 2 et 8, 3 et 7, 4 et 6, 5 et 5).",
    tp_term_see: "Se voir",
    tp_rules_see: "Les deux doivent se voir : côte à côte horizontalement, verticalement ou en diagonale, ou avec seulement des cases barrées entre eux sur cette ligne. Horizontalement, cela passe aussi la fin de ligne : le dernier chiffre d'une ligne voit le premier de la suivante, et ainsi de suite dans le sens de lecture.",
    tp_term_add: "Recopier",
    tp_rules_add: "Quand tu es bloqué, touche Recopier : tous les chiffres non barrés sont réécrits dans le même ordre à la fin de la grille. 5 fois au plus par partie.",
    tp_term_rows: "Lignes vides",
    tp_rules_rows: "Une ligne dont les neuf cases sont barrées disparaît.",
    tp_term_end: "Gagner et perdre",
    tp_rules_end: "Tu gagnes quand tous les chiffres sont barrés. Tu perds quand il ne reste ni paire ni recopie, ou quand la grille dépasse 40 lignes.",
    tp_term_start: "Départ",
    tp_rules_start: "Classique : 1 2 3 4 5 6 7 8 9, puis 1 1 1 2 1 3 1 4 1 5 1 6 1 7 1 8 1 9 (les nombres de 1 à 19 sans 10). Aléatoire : trois, quatre ou cinq lignes ; plus le niveau est facile, plus il y a de paires côte à côte.",
    tp_term_help: "Aide",
    tp_rules_help: "Annuler revient autant de pas que tu veux. Indice marque une paire à barrer, ou dit qu'il ne reste que Recopier.",
    tp_rules_example_title: "Exemple",
    tp_rules_example: "Le départ classique. Le 1 en haut à gauche et le 1 en dessous se voient (verticalement) et sont égaux. Le 9 à la fin de la première ligne et le 1 au début de la deuxième se voient par-dessus la fin de ligne et font 10.",
    tp_history_title: "Histoire des Paires de dix",
    tp_history_origins_title: "Des cahiers d'écolier",
    tp_history_origins_p1: "L'origine de ce casse-tête n'est pas documentée dans les sources que PaperGames a pu consulter. Un article de 2011 sur le site russe Habr s'en souvient depuis l'école et l'université : on y jouait dans des cahiers à carreaux, sous des noms comme « nombres », « chiffres », « graines » ou « 19 » – il n'y avait pas de nom officiel. Le jeu y commence avec les nombres de 1 à 19 (sans 10) écrits à la suite, les mêmes chiffres que le départ classique ici, et quand il ne reste plus de paire, on recopie les chiffres restants à la fin.",
    tp_history_name_title: "Le nom",
    tp_history_name_p1: "« Paires de dix » dit simplement de quoi il s'agit. Plusieurs applications reprennent la même idée sous leurs propres noms ; PaperGames ne les utilise pas. Les paires en diagonale et les limites de 5 recopies et de 40 lignes sont des règles de PaperGames."
});
I18n.markTextLoaded("fr");
