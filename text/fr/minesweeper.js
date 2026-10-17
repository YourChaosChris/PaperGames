// text/fr/minesweeper.js
// Rules and history texts of minesweeper (fr). Loaded by minesweeper-rules.html and minesweeper-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    minesweeper_rules_title: "Règles du Démineur",
    minesweeper_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Démineur - utile si vous êtes rouillé, ou si vous apprenez.",
    minesweeper_rules_basics_title: "L'idée de base",
    minesweeper_term_board: "La grille et le premier clic",
    minesweeper_rules_board: "Des mines cachées sont dispersées sur la grille. Votre premier clic est toujours garanti sans danger - les mines ne sont placées qu'après, en évitant cette case et tout ce qui l'entoure - donc la partie ne peut jamais se terminer avant même d'avoir commencé.",
    minesweeper_term_numbers: "Lire les chiffres",
    minesweeper_rules_numbers: "Révéler une case sûre affiche un chiffre : le nombre de mines cachées parmi ses huit cases voisines. Une case vide signifie zéro, et la révéler ouvre automatiquement toute la zone vide connectée.",
    minesweeper_term_flags: "Poser des drapeaux",
    minesweeper_rules_flags: "Marquez d'un drapeau une case que vous pensez minée, en utilisant le mode drapeau (pour les écrans tactiles) ou un clic droit (sur un navigateur de bureau) - les cases marquées ne peuvent pas être révélées par accident. Cliquer sur un chiffre déjà révélé dont les drapeaux voisins correspondent à son compte révèle d'un coup le reste de ses voisines, exactement comme le clic du milieu dans le jeu de bureau classique - mais un drapeau mal placé peut encore vous faire perdre la partie de cette façon.",
    minesweeper_rules_end_title: "Comment une partie se termine",
    minesweeper_term_win: "Victoire",
    minesweeper_rules_win: "Révélez toutes les cases qui ne sont pas des mines et vous avez déminé le plateau.",
    minesweeper_term_loss: "Défaite",
    minesweeper_rules_loss: "Révélez une mine et la partie se termine immédiatement - toutes les mines du plateau sont alors affichées, celle qui vous a eu étant repérée à part des autres.",
    minesweeper_history_title: "L'histoire du Démineur",
    minesweeper_history_origins_title: "Des mainframes au bureau",
    minesweeper_history_origins_p1: "Les jeux de révélation et de déduction de type Démineur remontent au début des années 1960 et sont apparus sous divers noms sur des mainframes et des premiers ordinateurs personnels jusque dans les années 1980, y compris une version Windows/OS2 de 1989 appelée « Mined-Out » et plusieurs clones gratuits aux noms comme « RLogic » et « Cube ».",
    minesweeper_history_origins_p2: "La version qui a rendu le jeu célèbre a été écrite par Robert Donner et Curt Johnson, de Microsoft, pour Windows 3.1 en 1992, remplaçant l'ancien jeu Windows Reversi comme puzzle fourni pour apprendre aux nouveaux utilisateurs à se servir d'une souris - le clic gauche comme le clic droit demandaient alors une vraie pratique.",
    minesweeper_history_spread_title: "Installé sur chaque bureau",
    minesweeper_history_spread_p1: "Parce que Windows équipait une part écrasante des PC du monde entier durant les années 1990 et 2000, le Démineur est devenu presque par défaut l'un des jeux vidéo les plus joués de l'histoire - installé partout, ne nécessitant aucun manuel, et jouable dans les minutes creuses entre deux tâches sérieuses.",
    minesweeper_history_spread_p2: "Le premier clic garanti sans danger, aujourd'hui considéré comme un élément central des règles, était lui-même un raffinement : la version originale de 1992 pouvait parfois vous tuer dès le tout premier clic, une frustration que les versions ultérieures ont éliminée en repoussant le placement des mines après cette première révélation - la même approche utilisée ici.",
    minesweeper_history_modern_title: "Un casse-tête sérieusement difficile",
    minesweeper_history_modern_p1: "Au-delà de la nostalgie, le Démineur se révèle mathématiquement sérieux : en 2000, Richard Kaye a prouvé que déterminer si une grille de Démineur partiellement révélée admet une solution cohérente avec ses indices est NP-complet, le plaçant dans la même classe de complexité de calcul que des problèmes notoirement difficiles comme celui du voyageur de commerce.",
    minesweeper_history_modern_p2: "Ce résultat signifie qu'il n'existe aucun algorithme raccourci connu qui résolve toujours rapidement une position quelconque de Démineur - dans les cas les plus difficiles, un joueur (ou un ordinateur) peut être réduit à un véritable pile ou face, sans aucun moyen de déduire la case sûre par la seule logique, exactement le moment que tout joueur aguerri a appris à redouter."
});
I18n.markTextLoaded("fr");
