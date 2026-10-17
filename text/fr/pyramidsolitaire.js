// text/fr/pyramidsolitaire.js
// Rules and history texts of pyramidsolitaire (fr). Loaded by pyramidsolitaire-rules.html and pyramidsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    pyramidsolitaire_rules_title: "Règles du Pyramide",
    pyramidsolitaire_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Pyramide - utile si vous êtes rouillé, ou si vous apprenez.",
    pyramidsolitaire_rules_basics_title: "L'idée de base",
    pyramidsolitaire_term_layout: "La disposition",
    pyramidsolitaire_rules_layout: "28 cartes sont distribuées face visible en un triangle de 7 rangées : 1 carte en haut, 2 en dessous, et ainsi de suite jusqu'à 7 cartes sur la rangée du bas, chaque carte reposant au-dessus et entre les deux cartes situées en dessous. Les 24 cartes restantes forment la pioche, dont on tire une carte à la fois face visible vers un talon.",
    pyramidsolitaire_term_pairing: "Faire une paire à 13",
    pyramidsolitaire_rules_pairing: "Les cartes comptent ici pour leur valeur faciale : As = 1, 2 à 10 comme indiqué, Valet = 11, Dame = 12, Roi = 13. Retirez deux cartes disponibles dont les valeurs totalisent exactement 13 - par exemple un 5 et un 8, un 9 et un 4, ou un Valet (11) et un 2. Un Roi vaut déjà 13 à lui seul, il se retire donc sans partenaire.",
    pyramidsolitaire_term_exposed: "Cartes visibles",
    pyramidsolitaire_rules_exposed: "Une carte de la pyramide ne peut être prise que lorsque les deux cartes reposant sur elle dans la rangée du dessous ont disparu - la rangée du bas est visible dès le départ puisque rien ne se trouve en dessous. Seules les cartes visibles de la pyramide et la carte du dessus du talon peuvent être retirées ; une carte couverte de la pyramide apparaît atténuée et ne peut pas encore être prise, même si vous pouvez voir de quelle carte il s'agit.",
    pyramidsolitaire_term_stock: "La pioche, le talon et les redistributions",
    pyramidsolitaire_rules_stock: "Touchez la pioche pour retourner sa carte du dessus face visible sur le talon, une carte à la fois - seule la carte du dessus du talon peut entrer dans une paire. Une fois la pioche épuisée, la toucher à nouveau redistribue tout le talon dans la pioche pour que vous puissiez la parcourir de nouveau, jusqu'à 2 fois par partie. Le nombre de redistributions restantes est toujours affiché à côté de la pioche.",
    pyramidsolitaire_rules_example_title: "Un exemple détaillé",
    pyramidsolitaire_term_example: "Retirer une paire",
    pyramidsolitaire_rules_example: "Supposons que la rangée du bas ait un 9 visible et, ailleurs dans la pyramide, un 4 visible - cliquer sur le 9 puis sur le 4 les retire tous les deux, puisque 9 + 4 = 13. Si ce 4 était la seule carte reposant sur un 6 dans la rangée au-dessus, et que sa voisine sous le 6 a également disparu, le 6 devient visible et peut à son tour être associé - par exemple avec un 7 posé sur le dessus du talon. Retirer les cartes ainsi ouvre peu à peu les rangées du dessus jusqu'à, idéalement, faire disparaître toute la pyramide.",
    pyramidsolitaire_rules_end_title: "Terminer une partie",
    pyramidsolitaire_term_win: "Victoire",
    pyramidsolitaire_rules_win: "La partie est gagnée dès que les 28 cartes de la pyramide sont retirées - la pioche et le talon n'ont pas besoin d'être vidés aussi, ce qui est la condition de victoire standard utilisée par la plupart des versions de ce jeu.",
    pyramidsolitaire_term_lose: "Être bloqué",
    pyramidsolitaire_rules_lose: "Si la pioche est vide, qu'il ne reste plus de redistribution, et qu'aucun Roi ni aucune paire à 13 n'est disponible parmi les cartes visibles de la pyramide et la carte du dessus du talon, la partie se termine par une défaite - PaperGames l'indique clairement plutôt que de vous laisser bloqué sans explication.",
    pyramidsolitaire_history_title: "L'histoire du Pyramide",
    pyramidsolitaire_history_origins_title: "Un jeu plus ancien, peu documenté",
    pyramidsolitaire_history_origins_p1: "Le Pyramide appartient à la même grande famille de jeux de cartes \"de patience\" à un joueur que le Klondike et le FreeCell, dont la plupart se sont répandus en Europe et en Amérique du Nord au 19e siècle et au début du 20e sous des noms régionaux variés et avec de légères différences de règles. Comme pour la plupart des patiences classiques, l'origine exacte du Pyramide - qui a le premier disposé 28 cartes en triangle et commencé à les associer par paires de 13 - ne remonte à aucune source ni date documentée précise.",
    pyramidsolitaire_history_origins_p2: "Ce qui est clair, en revanche, c'est ce qui le distingue du reste de la famille : là où le Klondike, le FreeCell et le Spider consistent tous, au fond, à construire des séquences décroissantes de cartes, le Pyramide repose sur un principe arithmétique - retirer des paires dont les valeurs totalisent exactement 13, plus le Roi seul qui vaut déjà 13 à lui-même. Cette règle de la paire à 13 est l'élément historiquement le plus distinctif de ce jeu, et le moyen le plus net de le différencier de ses cousins bâtisseurs de séquences.",
    pyramidsolitaire_history_spread_title: "De nouveau inclus avec Windows",
    pyramidsolitaire_history_spread_p1: "Le Pyramide circulait déjà depuis des années dans des ouvrages de référence sur les jeux de cartes et dans les premières collections de solitaires numériques, mais il a touché un public vraiment large de la même façon que le Klondike des décennies plus tôt : en étant inclus avec Windows. Microsoft l'a intégré parmi les jeux de la Microsoft Solitaire Collection, livrée avec Windows 8 et les versions suivantes, aux côtés du Klondike, du Spider et du FreeCell.",
    pyramidsolitaire_history_spread_p2: "Pour un très grand nombre de joueurs ayant grandi avec Windows Solitaire signifiant spécifiquement Klondike, la Solitaire Collection a souvent été leur première vraie rencontre avec le style de patience basé sur les paires que représente le Pyramide - un genre de casse-tête différent caché sous le même nom familier de \"Solitaire\".",
    pyramidsolitaire_history_modern_title: "Cette version",
    pyramidsolitaire_history_modern_p1: "PaperGames joue avec le règlement standard : un mélange véritablement nouveau à chaque partie, les 28 cartes de la pyramide distribuées face visible dès le départ, un tirage pioche/talon carte par carte avec jusqu'à 2 redistributions, et la condition de victoire courante \"dégager la pyramide\" - la pioche et le talon n'ont pas besoin d'être vidés aussi, comme le font la plupart des versions modernes de ce jeu."
});
I18n.markTextLoaded("fr");
