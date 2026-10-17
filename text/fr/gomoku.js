// text/fr/gomoku.js
// Rules and history texts of gomoku (fr). Loaded by gomoku-rules.html and gomoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    gomoku_rules_title: "Règles du Gomoku",
    gomoku_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Gomoku (alignement de cinq) - utile si vous êtes rouillé, ou si vous apprenez.",
    gomoku_rules_basics_title: "L'idée de base",
    gomoku_term_board: "Le plateau et la pose des pierres",
    gomoku_rules_board: "Les pierres se posent sur les intersections d'une grille de 15x15, exactement comme au Go - jamais déplacées une fois posées, et jamais capturées. Noir joue toujours en premier.",
    gomoku_rules_end_title: "Comment une partie se termine",
    gomoku_term_win: "Victoire",
    gomoku_rules_win: "Le premier joueur à aligner cinq de ses propres pierres ou plus, sans interruption - à l'horizontale, à la verticale ou en diagonale - gagne immédiatement.",
    gomoku_term_draw: "Nulle",
    gomoku_rules_draw: "Si le plateau se remplit complètement sans que personne n'ait aligné cinq pierres, la partie est nulle.",
    gomoku_term_resignation: "Abandon",
    gomoku_rules_resignation: "Un joueur peut abandonner à tout moment, ce qui met fin à la partie immédiatement en faveur de l'adversaire.",
    gomoku_history_title: "L'histoire du Gomoku",
    gomoku_history_origins_title: "Racines anciennes, nom moderne",
    gomoku_history_origins_p1: "Les jeux construits autour de l'alignement de pierres sur une grille remontent à des siècles à travers l'Asie de l'Est ; les règles précises aujourd'hui connues sous le nom de Gomoku ont pris forme au Japon, où son nom (五目並べ, gomokunarabe) signifie simplement « cinq points alignés ».",
    gomoku_history_origins_p2: "Il se joue traditionnellement avec les mêmes pierres noires et blanches et le même plateau à intersections que le Go, ce qui en fait une variante simple et peu exigeante en matériel, adoptée par des générations de joueurs de Go comme petit jeu annexe.",
    gomoku_history_spread_title: "Du passe-temps populaire au Renju",
    gomoku_history_spread_p1: "Parce que les règles simples du Gomoku donnent au premier joueur (traditionnellement Noir) un avantage important intégré au jeu, une variante de compétition plus stricte appelée Renju est apparue au Japon au début du 20e siècle, ajoutant des restrictions supplémentaires - interdisant à Noir certaines configurations de double-trois ou double-quatre - pour rééquilibrer le jeu.",
    gomoku_history_spread_p2: "Le Renju est devenu la norme pour la pratique sérieuse en tournoi, tandis que le règlement plus simple et sans restriction pratiqué ici (souvent appelé Gomoku « freestyle ») est resté la version décontractée la plus courante dans le monde.",
    gomoku_history_modern_title: "Une victoire du premier joueur résolue",
    gomoku_history_modern_p1: "En 1994, le chercheur L. Victor Allis a prouvé, par une analyse informatique exhaustive (une technique appelée recherche par nombre de preuve), que le Gomoku freestyle sur un plateau standard est une victoire forcée pour le premier joueur avec un jeu parfait.",
    gomoku_history_modern_p2: "Ce résultat explique exactement pourquoi le Renju compétitif existe : sans ses restrictions supplémentaires sur Noir, le Gomoku en tournoi ne serait qu'une formalité résolue plutôt qu'une véritable compétition - un cas rare où un jeu résolu a directement remodelé sa pratique en compétition, plutôt que de rester une simple curiosité."
});
I18n.markTextLoaded("fr");
