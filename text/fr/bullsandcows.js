// text/fr/bullsandcows.js
// Rules and history texts of bullsandcows (fr). Loaded by bullsandcows-rules.html and bullsandcows-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    bullsandcows_rules_title: "Règles de Taureaux et vaches",
    bullsandcows_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue à Taureaux et vaches - utile si vous êtes rouillé, ou si vous apprenez.",
    bullsandcows_rules_basics_title: "L'idée de base",
    bullsandcows_term_code: "Le code secret",
    bullsandcows_rules_code: "Au début d'une nouvelle partie, l'ordinateur choisit un code caché de quatre positions, chacune réglée sur l'une des six formes : cercle, carré, triangle, losange, étoile ou croix. Selon la difficulté, une même forme peut apparaître plusieurs fois dans le code.",
    bullsandcows_term_guess: "Faire une proposition",
    bullsandcows_rules_guess: "Touchez une case pour la faire défiler parmi les six formes, puis touchez Valider la proposition une fois que les quatre cases affichent les formes voulues. Une proposition peut répéter une forme librement, que le code secret comporte lui-même des répétitions ou non.",
    bullsandcows_term_feedback: "Lire les indices",
    bullsandcows_rules_feedback: "Chaque proposition reçoit en retour une rangée de pions : un pion noir pour chaque forme à la fois correcte et bien placée, et un pion blanc pour chaque forme correcte mais mal placée. Par exemple, si le code est cercle-cercle-carré-triangle et que vous proposez cercle-carré-carré-carré, vous obtenez deux pions noirs (le premier cercle et le troisième carré sont exactement corrects) et aucun pion blanc - les carrés supplémentaires de la proposition n'ont plus rien à associer dans le code. Les pions n'indiquent jamais à quelles cases ils se rapportent : le découvrir est tout l'intérêt du jeu.",
    bullsandcows_rules_end_title: "Terminer une partie",
    bullsandcows_term_win: "Gagner",
    bullsandcows_rules_win: "Vous gagnez dès qu'une proposition obtient quatre pions noirs - chaque forme exactement à la bonne position.",
    bullsandcows_term_loss: "Plus d'essais disponibles",
    bullsandcows_rules_loss: "Chaque niveau de difficulté autorise un nombre fixe d'essais. Si vous les utilisez tous sans trouver le code, la partie se termine et le code secret est révélé.",
    bullsandcows_term_levels: "Niveaux de difficulté",
    bullsandcows_rules_levels: "Facile vous donne 12 essais, mais le code secret ne répète jamais une forme. Moyen donne 10 essais et autorise les répétitions - la façon traditionnelle de jouer. Difficile ne donne que 8 essais et autorise aussi les répétitions, ce dont il faut donc se méfier.",
    bullsandcows_history_title: "L'histoire de Taureaux et vaches",
    bullsandcows_history_origins_title: "Un classique du papier et du crayon",
    bullsandcows_history_origins_p1: "L'idée centrale - deviner un code caché et n'apprendre que le nombre de correspondances exactes et partielles, jamais lesquelles - vient de Bulls and Cows (Taureaux et vaches), un jeu de devinettes sur papier joué bien avant 1970. On le joue traditionnellement avec des nombres secrets : un bon chiffre à la bonne place est un taureau, un bon chiffre à la mauvaise place une vache.",
    bullsandcows_history_origins_p2: "Ce fut aussi l'un des premiers jeux programmés sur ordinateur : des versions, souvent appelées Moo, tournaient sur les ordinateurs des universités dès la fin des années 1960, et le programmer reste aujourd'hui un exercice classique.",
    bullsandcows_history_spread_title: "Le jeu de plateau et le nom",
    bullsandcows_history_spread_p1: "En 1970, l'idée devint un jeu de plateau à fiches colorées, connu dans le monde entier sous le nom de Mastermind. Mastermind est une marque ; les droits appartiennent à Invicta Plastics. PaperGames n'a aucun lien avec Invicta Plastics ni avec ce jeu de plateau et utilise donc le nom plus ancien de Bulls and Cows, Taureaux et vaches.",
    bullsandcows_history_modern_title: "Un casse-tête prisé des informaticiens",
    bullsandcows_history_modern_p1: "Comme il revient à chercher une réponse cachée à l'aide du seul nombre de correspondances, le jeu est devenu un cas d'école en informatique et en combinatoire pour étudier les stratégies de devinette et les algorithmes de recherche.",
    bullsandcows_history_modern_p2: "Dans un article célèbre de 1977, Donald Knuth a montré que la version classique à quatre positions et six symboles peut toujours être résolue en cinq essais au plus avec une stratégie optimale - un résultat encore cité dès qu'il est question de recherche algorithmique."
});
I18n.markTextLoaded("fr");
