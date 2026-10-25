// text/fr/teufelsieben.js
// Rules and history texts of teufelsieben (fr). Loaded by teufelsieben-rules.html and teufelsieben-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    ts_rules_title: "Règles de Le Sept du Diable",
    ts_rules_intro: "Révèle les cartes une à une et arrête-toi à temps : un nombre déjà présent te fait sauter. Quand quelqu’un atteint la cible, le joueur avec le plus de points gagne.",
    ts_rules_basics_title: "Les règles",
    ts_term_cards: "Les cartes",
    ts_rules_cards: "90 cartes. Les cartes numérotées vont de 0 à 12, chaque nombre apparaît autant de fois que sa valeur (douze 12, un 1 et un 0) : 79 cartes. Cartes spéciales : Pause (2), Portion en plus (2), Sauvetage (2), +3 (2), +5 (2) et Double (1).",
    ts_term_turn: "Ton tour",
    ts_rules_turn: "Au début d’un tour, chacun reçoit une carte. Ensuite, chacun à son tour, parmi ceux qui jouent encore, appuie sur « Révéler une carte » ou « Stop ». Si tu t’arrêtes, tu gardes les points du tour.",
    ts_term_bust: "Sauter",
    ts_rules_bust: "Si tu révèles un nombre déjà devant toi, tu sautes : aucun point ce tour. Une carte Sauvetage te protège une fois : la deuxième carte identique est écartée et la carte Sauvetage est utilisée.",
    ts_term_seven: "Sept nombres",
    ts_rules_seven: "Si tu as sept nombres différents devant toi, le tour se termine aussitôt et tu gagnes 20 points en plus.",
    ts_term_special: "Cartes spéciales",
    ts_rules_special: "Pause : tu choisis un joueur encore dans le tour (toi aussi), qui doit s’arrêter et garde ses points. Portion en plus : tu choisis un joueur encore dans le tour ; il doit révéler trois cartes l’une après l’autre. Une Pause ou une Portion en plus révélée pendant une Portion en plus n’a aucun effet. +3 et +5 ajoutent des points, Double double la somme de tes nombres.",
    ts_term_points: "Points et fin de partie",
    ts_rules_points: "Points du tour : somme de tes nombres (doublée avec Double), plus +3 et +5, plus 20 pour sept nombres. Le tour se termine quand plus personne n’y participe. Après le tour où quelqu’un atteint la cible (100, 150 ou 200 points, choisie avant la partie), le jeu prend fin : le plus grand total gagne ; en cas d’égalité au meilleur score, les joueurs gagnent ensemble.",
    ts_term_computer: "L’ordinateur",
    ts_rules_computer: "L’ordinateur s’arrête quand, selon son niveau, le risque de sauter avec la prochaine carte est trop grand. Il ne compte que les cartes visibles et ne regarde jamais celles qui sont cachées. Facile s’arrête tôt, Difficile prend plus de risques.",
    ts_rules_example_title: "Exemple",
    ts_rules_example: "Tu as 5, 9 et 2 : 16 points. Parmi les cartes pas encore vues, il reste quatre 5, huit 9 et un 2 qui te feraient sauter. Si tu t’arrêtes, tu gardes 16 points ; si tu révèles un 9, tu ne marques rien ce tour.",
    ts_history_title: "À propos de Le Sept du Diable",
    ts_history_family_title: "Jeu de prise de risque",
    ts_history_family_p1: "Les jeux où tu décides sans cesse de prendre un risque de plus ou de garder ce que tu as s’appellent des jeux de prise de risque. Beaucoup de jeux de dés et de cartes fonctionnent ainsi.",
    ts_history_modern_title: "Cette version",
    ts_history_modern_p1: "Le Sept du Diable a été créé pour PaperGames, avec ses propres cartes, noms et textes : les cartes spéciales Pause, Portion en plus, Sauvetage, +3, +5 et Double, ainsi que 20 points en plus pour sept nombres différents."
});
I18n.markTextLoaded("fr");
