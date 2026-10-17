// text/fr/freecell.js
// Rules and history texts of freecell (fr). Loaded by freecell-rules.html and freecell-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    freecell_rules_title: "Règles du FreeCell",
    freecell_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au FreeCell - utile si vous êtes rouillé, ou si vous apprenez.",
    freecell_rules_basics_title: "L'idée de base",
    freecell_term_layout: "La disposition",
    freecell_rules_layout: "Les 52 cartes sont distribuées face visible dans 8 colonnes de tableau dès le départ - quatre cartes de moins qu'un 7 complet dans les quatre dernières colonnes. Quatre cellules libres au-dessus des colonnes peuvent chacune contenir exactement une carte, et quatre fondations (une par couleur) se construisent de l'As au Roi.",
    freecell_term_tableau: "Déplacer les cartes",
    freecell_rules_tableau: "Une carte ne peut se poser sur une colonne du tableau que sur une carte exactement une valeur au-dessus et de la couleur opposée, ou sur n'importe quelle colonne vide. Une série de plusieurs cartes déjà empilées dans ce même ordre décroissant et alterné peut être déplacée d'un bloc comme un « supermouvement », jusqu'à une limite fixée par le nombre de cellules libres et de colonnes vides disponibles pour les relayer.",
    freecell_term_foundation: "Fondations",
    freecell_rules_foundation: "Une fondation n'accepte que sa propre couleur, en commençant par l'As et en montant d'une valeur à la fois. Une fois qu'une carte est sur une fondation, elle y reste - les fondations ne font que recevoir des cartes, elles ne les rendent jamais au tableau.",
    freecell_rules_end_title: "Terminer une partie",
    freecell_term_win: "Victoire",
    freecell_rules_win: "La partie est gagnée dès que les quatre fondations sont complètes, de l'As au Roi. Contrairement à la donne du Mahjong solitaire ici, une donne de FreeCell est un simple mélange - l'immense majorité sont solubles, exactement comme dans le vrai jeu, mais PaperGames n'offre aucune garantie particulière pour une donne donnée.",
    freecell_history_title: "L'histoire du FreeCell",
    freecell_history_origins_title: "Un jeu de cartes à information ouverte",
    freecell_history_origins_p1: "Le FreeCell descend d'une famille de patiences de style « ouvert » ou « Baker's Game », remontant à au moins le début du 20e siècle, dans lesquelles chaque carte est distribuée face visible dès le tout premier coup - contrairement à la plupart des jeux de solitaire, rien n'est jamais caché, si bien qu'un joueur (ou un ordinateur) suffisamment habile peut en principe déterminer si une donne donnée est gagnable avant même de jouer un seul coup.",
    freecell_history_origins_p2: "L'ajout des cellules libres - de petits espaces de rangement pour stationner temporairement des cartes individuelles - est généralement attribué à Paul Alfille, qui a créé une première version numérique appelée FreeCell pour le système informatique PLATO en 1978, affinant l'ancien format à tableau ouvert dans le règlement précis pratiqué aujourd'hui.",
    freecell_history_spread_title: "Inclus avec Windows",
    freecell_history_spread_p1: "Le FreeCell est devenu un nom familier après que Microsoft l'a inclus avec Windows à partir de 1995, aux côtés du Solitaire et du Démineur, le faisant découvrir à des centaines de millions d'utilisateurs de PC qui ne l'avaient jamais rencontré auparavant - un peu comme le propre chemin vers la célébrité du Démineur.",
    freecell_history_spread_p2: "La version de Microsoft était livrée avec un ensemble fixe de 32 000 donnes numérotées plutôt qu'un mélange véritablement aléatoire à chaque fois, ce qui permettait aux joueurs de comparer leurs notes et de rejouer une donne précise - une convention que cette version d'PaperGames ne suit pas, générant au contraire un mélange réellement nouveau à chaque fois.",
    freecell_history_modern_title: "La donne qui gagne (presque) toujours",
    freecell_history_modern_p1: "Comme chaque carte est visible dès le début, le FreeCell se prête particulièrement bien à l'analyse informatique : sur les 32 000 donnes numérotées originales de Microsoft, des recherches exhaustives de solveurs ont montré que toutes sauf une - la donne numéro 11 982 - sont solubles, une anecdote que les passionnés de FreeCell évoquent encore des décennies plus tard.",
    freecell_history_modern_p2: "Des recherches ultérieures ont poussé l'analyse plus loin, confirmant que seule une poignée de donnes parmi le premier million de parties numérotées sont insolubles - ce qui explique pourquoi un simple mélange aléatoire, comme celui qu'utilise cette version, est un pari si sûr : les probabilités de tomber sur l'une de ces rares exceptions sont infimes."
});
I18n.markTextLoaded("fr");
