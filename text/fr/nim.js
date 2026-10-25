// text/fr/nim.js
// Rules and history texts of nim (fr). Loaded by nim-rules.html and nim-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    nim_rules_title: "Règles du Nim",
    nim_rules_intro: "Deux joueurs prennent à tour de rôle des pierres dans plusieurs tas. Avec la règle normale, celui qui prend la dernière pierre gagne.",
    nim_rules_basics_title: "Les règles",
    nim_term_move: "Un coup",
    nim_rules_move: "Choisis une rangée et prends-y autant de pierres que tu veux, au moins une. Touche la pierre jusqu’à laquelle tu veux prendre : elle et toutes les pierres à sa droite reçoivent une croix. Puis touche « Prendre les pierres ».",
    nim_term_end: "La fin",
    nim_rules_end: "Normal : celui qui prend la dernière pierre gagne. Misère : celui qui prend la dernière pierre perd.",
    nim_term_heaps: "Les tas",
    nim_rules_heaps: "3, 4 et 5 pierres (par défaut), les classiques 1, 3, 5 et 7, ou des tas au hasard (3 ou 4 tas de 1 à 7 pierres).",
    nim_term_secret: "La règle gagnante",
    nim_rules_secret: "Écris chaque taille de tas en binaire et additionne les colonnes sans retenue (xor) : le résultat est la somme de Nim. Si elle vaut 0, le joueur qui doit jouer perd contre un jeu parfait ; sinon, il existe toujours un coup qui la ramène à 0. En misère, on joue de même jusqu’à ce qu’il ne resterait que des tas d’une pierre – on en laisse alors un nombre impair.",
    nim_term_computer: "L’ordinateur",
    nim_rules_computer: "Facile joue n’importe quel coup, Moyen le meilleur coup une fois sur deux, Difficile toujours le meilleur coup. Depuis une position gagnante, Difficile est imbattable ; c’est pourquoi la ligne sous les tas indique si le départ est gagnant ou perdant pour celui qui commence – choisis qui commence en conséquence.",
    nim_history_title: "L’histoire du Nim",
    nim_history_origins_title: "Retirer des pierres",
    nim_history_origins_p1: "Des jeux où l’on retire des objets de tas existent depuis l’Antiquité ; l’origine du Nim est incertaine. On le rapproche souvent du jeu chinois jiǎn shízǐ (« ramasser des pierres »), et les plus anciennes mentions européennes datent du début du XVIe siècle.",
    nim_history_bouton_title: "Bouton, 1901",
    nim_history_bouton_p1: "En 1901, Charles L. Bouton, de l’université Harvard, publia la théorie complète du jeu et lui donna le nom de Nim. Il n’expliqua jamais ce nom ; on le rattache souvent au mot allemand « nimm » (« prends ! »).",
    nim_history_machines_title: "Les machines à Nim",
    nim_history_machines_p1: "Le Nim fut l’un des premiers jeux joués par des machines : le Nimatron à l’Exposition universelle de New York en 1940, et un calculateur de Ferranti présenté au Festival of Britain en 1951."
});
I18n.markTextLoaded("fr");
