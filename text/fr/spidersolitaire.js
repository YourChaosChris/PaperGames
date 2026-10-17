// text/fr/spidersolitaire.js
// Rules and history texts of spidersolitaire (fr). Loaded by spidersolitaire-rules.html and spidersolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    spidersolitaire_rules_title: "Règles du Spider Solitaire",
    spidersolitaire_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Spider Solitaire - utile si vous êtes rouillé, ou si vous apprenez.",
    spidersolitaire_rules_basics_title: "L'idée de base",
    spidersolitaire_term_layout: "La disposition",
    spidersolitaire_rules_layout: "Deux jeux de cartes complets (104 cartes) sont distribués sur 10 colonnes de tableau - les 4 premières colonnes reçoivent 6 cartes chacune, les 6 autres 5 cartes chacune - seule la carte du dessus de chaque colonne étant face visible. Il n'y a pas de fondations. Les 50 cartes restantes forment la pioche, distribuée plus tard par paquets de 10.",
    spidersolitaire_term_difficulty: "Choisir une difficulté",
    spidersolitaire_rules_difficulty: "Avant de commencer, choisissez combien de couleurs sont en jeu : 1 couleur est la plus facile (n'importe quelle carte du bon rang peut prolonger n'importe quelle suite), 2 couleurs sont moyennes, et 4 couleurs sont la version traditionnelle et la plus difficile - exactement comme deux vrais jeux de cartes mélangés ensemble.",
    spidersolitaire_term_tableau: "Déplacer une seule carte",
    spidersolitaire_rules_tableau: "Une carte ne peut se déplacer dans une colonne de tableau que sur une carte exactement un rang au-dessus - la couleur n'a pas d'importance ici. Une colonne vide accepte n'importe quelle carte, ou n'importe quelle suite valide, sans aucune restriction de rang.",
    spidersolitaire_term_group: "Déplacer un groupe de cartes",
    spidersolitaire_rules_group: "Plusieurs cartes déjà empilées ne peuvent être déplacées ensemble que si elles forment déjà une suite correctement décroissante de LA MÊME couleur (par exemple un 5-4-3 de Cœur, dans cet ordre précis) - déplacer une suite qui mélange les couleurs, même si les rangs descendent correctement, n'est pas autorisé. Déplacer un groupe suit toujours la règle de placement « un rang au-dessus » ci-dessus. Une fois des cartes déplacées, la carte nouvellement exposée au sommet de sa colonne se retourne automatiquement face visible.",
    spidersolitaire_term_stock: "La pioche",
    spidersolitaire_rules_stock: "Touchez la pioche pour distribuer son prochain paquet de 10 cartes, une carte face visible sur chacune des 10 colonnes. La distribution est bloquée tant qu'une colonne est vide - videz-la d'abord (en déplaçant ses cartes ailleurs ou en complétant une suite à travers elle) avant de pouvoir distribuer à nouveau.",
    spidersolitaire_term_sequences: "Compléter une suite",
    spidersolitaire_rules_sequences: "Dès qu'une suite complète du Roi jusqu'à l'As, toutes de la même couleur et dans l'ordre, se retrouve contiguë dans une colonne, elle est détectée automatiquement et retirée - elle n'a pas besoin d'être les seules cartes de cette colonne, il suffit qu'elles soient correctement empilées à l'endroit où elles pourraient naturellement se soulever ensemble. Chaque suite complétée ajoute un point au compteur au-dessus du plateau.",
    spidersolitaire_rules_end_title: "Terminer une partie",
    spidersolitaire_term_win: "Gagner",
    spidersolitaire_rules_win: "La partie est gagnée une fois que les 8 suites Roi-à-As ont été assemblées et retirées - soit 104 cartes / 13, le même total quelle que soit la difficulté de nombre de couleurs choisie.",
    spidersolitaire_history_title: "L'histoire du Spider Solitaire",
    spidersolitaire_history_origins_title: "Un favori non documenté",
    spidersolitaire_history_origins_p1: "Contrairement à certains jeux de cartes dotés d'un inventeur identifiable, l'origine exacte du Spider Solitaire n'est pas précisément documentée - comme beaucoup de jeux de patience, il a évolué par la pratique populaire plutôt que d'être attribué à une seule personne ou à une unique première publication. Ce qui est clair, c'est qu'au début ou au milieu du XXe siècle, il était déjà un favori bien établi parmi la famille des jeux de patience à deux jeux de cartes, joués sur papier et sur feutre bien avant l'existence des ordinateurs.",
    spidersolitaire_history_origins_p2: "Son nom fait presque certainement référence à sa propre difficulté et à sa structure plutôt qu'à une quelconque imagerie d'araignée sur les cartes : huit suites façon fondations à tisser ensemble (faisant écho aux huit pattes d'une araignée) à partir de dix colonnes de tableau tentaculaires, sans aucune aide de couleur ou de fondation par couleur dès que quatre couleurs sont en jeu.",
    spidersolitaire_history_spread_title: "Fourni avec Windows",
    spidersolitaire_history_spread_p1: "Le moment le plus célèbre de la popularisation massive du Spider Solitaire est survenu en 1998, lorsque Microsoft l'a intégré comme jeu natif de Windows - apparaissant d'abord dans le pack Windows 98 Plus ! et à l'époque de Windows Me, puis devenant un composant standard à partir de Windows XP.",
    spidersolitaire_history_spread_p2: "Cette seule décision a fait découvrir Spider à un immense public mondial, tout comme Windows l'avait fait auparavant pour le Klondike (simplement appelé « Solitaire ») puis pour le FreeCell - transformant un jeu de cartes qui avait vécu discrètement sur de vraies tables de jeu pendant des décennies en l'un des logiciels les plus joués au monde, sans que ses joueurs n'aient jamais besoin de posséder un vrai jeu de cartes.",
    spidersolitaire_history_modern_title: "Cette version",
    spidersolitaire_history_modern_p1: "PaperGames joue avec les règles standard, avec les trois difficultés traditionnelles de nombre de couleurs sélectionnables dès le départ - 1 couleur, 2 couleurs, ou le jeu complet à 4 couleurs - la même approche à faible friction et au mélange vraiment nouveau à chaque partie que le Klondike et le FreeCell de cette collection utilisent déjà, adaptée à la disposition propre du Spider à dix colonnes et sans fondations."
});
I18n.markTextLoaded("fr");
