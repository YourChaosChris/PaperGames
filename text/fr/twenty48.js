// text/fr/twenty48.js
// Rules and history texts of twenty48 (fr). Loaded by twenty48-rules.html and twenty48-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    twenty48_rules_title: "Règles du 2048",
    twenty48_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au 2048 - utile si vous êtes rouillé, ou si vous apprenez.",
    twenty48_rules_basics_title: "L'idée de base",
    twenty48_term_board: "Le plateau et le glissement",
    twenty48_rules_board: "Chaque coup fait glisser toutes les tuiles du plateau de 4x4 aussi loin que possible dans une direction - haut, bas, gauche ou droite. Après chaque coup qui déplace effectivement quelque chose, une nouvelle tuile (généralement un 2, parfois un 4) apparaît sur une case vide au hasard.",
    twenty48_term_merging: "Fusionner",
    twenty48_rules_merging: "Quand deux tuiles de même valeur se rencontrent en glissant, elles fusionnent en une seule tuile valant leur somme, ajoutant cette nouvelle valeur à votre score. Chaque tuile ne peut fusionner qu'une fois par coup, donc trois tuiles égales qui glissent ensemble fusionnent la première paire et laissent la troisième tuile seule, plutôt que de tout enchaîner.",
    twenty48_rules_end_title: "Comment une partie se termine",
    twenty48_term_win: "Atteindre 2048",
    twenty48_rules_win: "Fusionnez vos tuiles jusqu'à obtenir une tuile 2048 et vous avez gagné - mais la partie ne s'arrête pas là. Continuez à jouer ensuite pour pousser votre score (et le plateau) encore plus loin.",
    twenty48_term_loss: "Plus aucun coup possible",
    twenty48_rules_loss: "La partie se termine dès que le plateau est complètement plein et qu'aucune deux tuiles adjacentes ne partagent la même valeur, si bien qu'aucun coup - dans aucune direction - ne pourrait rien changer.",
    twenty48_history_title: "L'histoire du 2048",
    twenty48_history_origins_title: "Construit sur les bases de Threes",
    twenty48_history_origins_p1: "2048 a été créé en mars 2014 par Gabriele Cirulli, développeur italien de 19 ans, en un seul week-end, comme exercice personnel pour apprendre à construire rapidement un jeu complet. Il n'a pas inventé la mécanique de base à partir de rien : 2048 est un clone explicite d'un jeu appelé 1024 (de Veewo Studio), lui-même inspiré d'un jeu antérieur appelé Threes! (d'Asher Vollmer, Greg Wohlwend et Jimmy Hinson) qui était en développement minutieux depuis plus d'un an.",
    twenty48_history_origins_p2: "Cirulli a publié gratuitement le code source de 2048 sous une licence ouverte dès le premier jour, ce qui s'est révélé énormément important : plutôt que de stopper les clones, cela les a invités, et le jeu s'est répandu en étant sans cesse et légalement réimplémenté plutôt que simplement joué.",
    twenty48_history_spread_title: "Un phénomène viral et cloné",
    twenty48_history_spread_p1: "Le jeu est devenu viral en quelques jours après sa sortie, attirant semble-t-il des millions de joueurs dès ses deux premières semaines, et a déclenché une vague énorme de clones, de portages et de variantes - des versions relookées intégrant tout, des emojis aux personnages de la culture populaire, ainsi que des variantes de taille, des variantes à tuiles colorées, et des versions en trois dimensions.",
    twenty48_history_spread_p2: "Cette version d'PaperGames conserve délibérément le plateau 4x4 original et le taux d'apparition de 90 %/10 % pour les tuiles deux ou quatre, plutôt que d'adopter l'une de ces variantes - le même choix que fait cette collection partout ailleurs, en privilégiant le règlement standard et bien connu plutôt qu'une variation originale.",
    twenty48_history_modern_title: "Un petit plateau, sérieusement étudié",
    twenty48_history_modern_p1: "Malgré ses règles simples, jouer au 2048 de façon optimale se révèle être un problème de recherche véritablement difficile à cause du hasard dans l'apparition des tuiles : les meilleurs joueurs informatiques utilisent une recherche expectiminimax (pesant les coups selon la probabilité de chaque tuile suivante possible) plutôt que la simple recherche minimax que permet un jeu déterministe comme les échecs.",
    twenty48_history_modern_p2: "Les meilleurs joueurs informatiques documentés atteignent la tuile 32768 dans la plupart des parties et parfois même 65536 - quatre et cinq doublements au-delà de la tuile 2048 que la plupart des joueurs humains sont ravis d'apercevoir ne serait-ce qu'une fois."
});
I18n.markTextLoaded("fr");
