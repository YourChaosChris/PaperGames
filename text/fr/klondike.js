// text/fr/klondike.js
// Rules and history texts of klondike (fr). Loaded by klondike-rules.html and klondike-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    klondike_rules_title: "Règles du Klondike",
    klondike_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Klondike - utile si vous êtes rouillé, ou si vous apprenez.",
    klondike_rules_basics_title: "L'idée de base",
    klondike_term_layout: "La disposition",
    klondike_rules_layout: "Les cartes sont réparties en 7 colonnes de tableau de 1 à 7 cartes chacune, seule la carte du dessus de chaque colonne étant face visible. Quatre fondations (une par couleur) se construisent de l'As au Roi. Le reste du jeu forme la pioche, dont on tire une carte à la fois vers le talon.",
    klondike_term_tableau: "Déplacer les cartes",
    klondike_rules_tableau: "Une carte ne peut se poser sur une colonne du tableau que sur une carte exactement une valeur au-dessus et de la couleur opposée, ou sur une colonne vide, qui n'accepte qu'un Roi. Une série de plusieurs cartes déjà empilées face visible dans ce même ordre décroissant et alterné peut être déplacée d'un bloc vers une destination valide.",
    klondike_term_foundation: "Fondations",
    klondike_rules_foundation: "Une fondation n'accepte que sa propre couleur, en commençant par l'As et en montant d'une valeur à la fois. Une fois qu'une carte est sur une fondation, elle y reste - les fondations ne font que recevoir des cartes, elles ne les rendent jamais au tableau.",
    klondike_term_stock: "La pioche et le talon",
    klondike_rules_stock: "Touchez la pioche pour retourner sa carte du dessus face visible sur le talon, une carte à la fois. Une fois la pioche épuisée, la toucher à nouveau remélange tout le talon dans la pioche pour que vous puissiez la parcourir de nouveau - PaperGames ne limite pas le nombre de fois où vous pouvez recommencer.",
    klondike_rules_end_title: "Terminer une partie",
    klondike_term_win: "Victoire",
    klondike_rules_win: "La partie est gagnée dès que les quatre fondations sont complètes, de l'As au Roi. Tous les mélanges ne sont pas gagnables - contrairement au FreeCell, une donne de Klondike peut réellement devenir insoluble en cours de partie, puisque seule la carte du dessus de chaque colonne est visible au départ.",
    klondike_history_title: "L'histoire du Klondike",
    klondike_history_origins_title: "Un nom venu de la ruée vers l'or - peut-être",
    klondike_history_origins_p1: "Le Klondike appartient à une grande famille de jeux de cartes de \"patience\" à un joueur qui se sont répandus en Europe et en Amérique du Nord au cours du 19e siècle, la plupart ne nécessitant qu'un jeu de cartes standard et une surface plane. Le règlement précis pratiqué aujourd'hui - sept colonnes de tableau en cascade, quatre fondations construites par couleur, une pioche et un talon à écouler - avait globalement pris sa forme moderne à la fin du 19e siècle, sous divers noms régionaux.",
    klondike_history_origins_p2: "La façon exacte dont il en est venu à s'appeler \"Klondike\" reste réellement incertaine. L'histoire la plus répétée relie ce nom à la ruée vers l'or du Klondike à la fin des années 1890, l'idée étant que les chercheurs d'or en route vers le Yukon, ou y passant l'hiver, y jouaient pour passer le temps - une origine pittoresque et plausible qui, comme beaucoup d'étymologies de jeux de cartes, n'a jamais pu être rattachée à un premier usage documenté. PaperGames la rapporte ici comme le récit populaire, pas comme une histoire établie.",
    klondike_history_spread_title: "Inclus avec Windows",
    klondike_history_spread_p1: "La popularité écrasante du Klondike aujourd'hui doit moins à ses origines au 19e siècle sur une table de jeu qu'à un logiciel bien précis : Microsoft a inclus une version simplement nommée \"Solitaire\" avec Windows 3.0 en 1990 - en partie, dit-on, pour apprendre en douceur à toute une génération de nouveaux utilisateurs de Windows à cliquer et à faire du glisser-déposer avec une souris.",
    klondike_history_spread_p2: "Cela a presque trop bien fonctionné : en quelques années, Windows Solitaire aurait été l'un des logiciels les plus utilisés au monde, installé sur pratiquement tous les PC vendus avec Windows, que son propriétaire ait ou non l'intention d'ouvrir un jeu un jour. Il a redéfini ce que \"solitaire\" signifiait pour des millions de personnes qui n'avaient jamais joué à un seul jeu de cartes physique sous ce nom.",
    klondike_history_modern_title: "Cette version",
    klondike_history_modern_p1: "PaperGames joue avec le règlement classique à tirage d'une carte, sans limite de recommencement, privilégiant la version la moins contraignante des règles tout comme le FreeCell de cette collection - un mélange véritablement nouveau à chaque partie plutôt qu'un ensemble fixe de donnes numérotées, et aucune limite au nombre de fois où vous pouvez reparcourir la pioche."
});
I18n.markTextLoaded("fr");
