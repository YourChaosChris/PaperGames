// text/fr/linkpairs.js
// Rules and history texts of linkpairs (fr). Loaded by linkpairs-rules.html and linkpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    linkpairs_rules_title: "Règles de Relier les paires",
    linkpairs_rules_intro: "Reliez chaque paire de symboles identiques par une ligne. Les lignes ne doivent pas se croiser et, ensemble, elles remplissent tout le plateau.",
    linkpairs_rules_basics_title: "Les règles",
    linkpairs_term_board: "Le plateau",
    linkpairs_rules_board: "Un plateau carré de cases. Certaines cases portent un symbole – un chiffre ou un animal – et chaque symbole apparaît exactement deux fois.",
    linkpairs_term_lines: "Les lignes",
    linkpairs_rules_lines: "Reliez chaque paire par une ligne. Une ligne va de case en case, horizontalement et verticalement, jamais en diagonale. Les lignes ne peuvent pas se croiser, partager une case ni passer par un autre symbole.",
    linkpairs_term_goal: "Le but",
    linkpairs_rules_goal: "La grille est résolue quand chaque paire est reliée et que chaque case est utilisée par une ligne. Chaque grille a exactement une solution.",
    linkpairs_term_draw: "Tracer",
    linkpairs_rules_draw: "Glissez le doigt depuis un symbole, ou touchez le symbole puis les cases l'une après l'autre. Si vous rencontrez une autre ligne, elle est raccourcie. Touchez une case d'une ligne pour que la ligne s'arrête là ; vous pouvez continuer à tracer depuis cette case. Toucher un symbole recommence sa ligne – touchez le symbole où une ligne commence pour l'effacer.",
    linkpairs_term_symbols: "Chiffres ou animaux",
    linkpairs_rules_symbols: "Dans le menu, vous choisissez des chiffres ou des animaux. Chaque case d'une ligne porte une petite copie de son symbole : on voit sans couleur quelle ligne appartient à quelle paire.",
    linkpairs_term_tools: "Annuler et Indice",
    linkpairs_rules_tools: "« Annuler » reprend autant d'étapes que vous voulez. « Indice » trace entièrement une ligne correcte ; les lignes sur son chemin sont raccourcies.",
    linkpairs_term_levels: "Niveaux",
    linkpairs_rules_levels: "Facile : 5 x 5. Moyen : 7 x 7. Difficile : 9 x 9.",
    linkpairs_rules_example_title: "Un exemple résolu",
    linkpairs_rules_example: "L'image montre une grille 5 x 5 résolue : chaque paire est reliée, aucune ligne ne se croise et chaque case est utilisée.",
    linkpairs_history_title: "L'histoire des casse-tête de liaison",
    linkpairs_history_origins_title: "Premières formes",
    linkpairs_history_origins_p1: "En 1897, une forme un peu différente de ce casse-tête parut dans une chronique de Sam Loyd dans le Brooklyn Daily Eagle. En 1917, Henry Ernest Dudeney en publia une version avec des paires de lettres dans son livre « Amusements in Mathematics », comme casse-tête pour automobilistes.",
    linkpairs_history_japan_title: "Chiffres et lettres",
    linkpairs_history_japan_p1: "Au Japon, l'éditeur de casse-tête Nikoli a rendu le jeu populaire sous deux formes : avec des paires de lettres et avec des paires de chiffres. Le nom général du casse-tête est Numberlink. Une grille est jugée bien faite quand elle a exactement une solution et que les lignes remplissent chaque case.",
    linkpairs_history_modern_title: "Comment PaperGames crée chaque grille",
    linkpairs_history_modern_p1: "Les grilles ont été créées à l'avance par le générateur de PaperGames : il pose des lignes au hasard qui passent ensemble par chaque case, puis un solveur vérifie qu'il n'y a qu'une seule façon de relier les paires. S'il en trouve une deuxième, une ligne est coupée en deux paires ; les lignes dont les bouts se touchent sont réunies tant que la solution reste unique."
});
I18n.markTextLoaded("fr");
