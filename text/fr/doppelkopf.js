// text/fr/doppelkopf.js
// Rules and history texts of doppelkopf (fr). Loaded by doppelkopf-rules.html and doppelkopf-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    sudoku_rules_basics_title: "L'idée de base",
    doppelkopf_rules_title: "Règles du Doppelkopf",
    doppelkopf_rules_intro: "Comment PaperGames joue au Doppelkopf. Seule la partie normale est proposée ici, avec la règle du mariage ; la dernière section indique ce qui est laissé de côté.",
    doppelkopf_term_setup: "Cartes et joueurs",
    doppelkopf_rules_setup: "Quatre joueurs et 48 cartes : neuf, dix, valet, dame, roi et as dans quatre couleurs, chaque carte en double. Chacun reçoit douze cartes. Le joueur après le donneur entame la première levée ; le donneur avance d'une place à chaque donne.",
    doppelkopf_term_trumps: "Atouts",
    doppelkopf_rules_trumps: "Il y a 26 atouts. Du plus fort au plus faible : les deux dix de cœur, les dames (trèfle, pique, cœur, carreau), les valets (dans le même ordre de couleurs), puis as, dix, roi et neuf de carreau. Quand deux cartes identiques tombent dans la même levée, la première gagne – avec une exception : le second dix de cœur bat le premier. Le bouton « Ordre des atouts » au-dessus de la table montre la liste complète à tout moment, et vos atouts sont rangés sur une ligne à part au-dessus de vos autres cartes.",
    doppelkopf_term_plain: "Couleurs simples",
    doppelkopf_rules_plain: "Tout ce qui n'est pas atout appartient à une couleur simple : trèfle et pique ont chacun as, dix, roi et neuf ; cœur n'a que as, roi et neuf, car le dix de cœur est un atout. Dans une couleur simple, l'as est la plus forte, puis le dix, le roi, le neuf.",
    doppelkopf_term_follow: "Fournir",
    doppelkopf_rules_follow: "Vous devez fournir la couleur demandée, et l'atout compte comme une couleur à part. Si l'on entame atout, vous devez jouer atout si vous en avez. Si l'on entame cœur, le dix de cœur ne compte pas – c'est un atout –, pas plus que les dames et les valets. Ce n'est que si vous ne pouvez pas fournir que vous pouvez jouer n'importe quelle carte, y compris un atout, qui bat alors toutes les cartes simples. Le jeu affiche plus bas et en pointillés les cartes que vous ne pouvez pas jouer et vous explique pourquoi si vous en touchez une.",
    doppelkopf_term_parties: "Qui joue avec qui",
    doppelkopf_rules_parties: "Les deux joueurs qui ont une dame de trèfle forment le camp Re ; les deux autres sont Kontra. Au début, personne ne sait qui est ensemble – vous seul savez si vous avez une dame de trèfle. Le camp d'un joueur est connu quand il joue sa dame de trèfle. Jusque-là, la table affiche un point d'interrogation pour lui.",
    doppelkopf_term_marriage: "Mariage",
    doppelkopf_rules_marriage: "Si un joueur a les deux dames de trèfle, c'est un mariage, et le jeu l'annonce. La première levée parmi les trois premières qui est entamée dans une couleur simple et remportée par un autre joueur décide : ce joueur devient le partenaire, et les deux jouent Re contre les deux autres. S'il n'y a pas de telle levée dans les trois premières, le joueur du mariage joue seul contre les trois autres.",
    doppelkopf_term_points: "Points des cartes et victoire",
    doppelkopf_rules_points: "Les as valent 11, les dix 10, les rois 4, les dames 3, les valets 2 et les neuf rien – 240 points en tout. Après la douzième levée, chaque camp compte les cartes de ses levées. Re a besoin d'au moins 121 points pour gagner ; avec 120 points, Kontra gagne.",
    doppelkopf_term_scoring: "Décompte",
    doppelkopf_rules_scoring: "Le camp gagnant reçoit un point de partie pour la victoire, et un de plus si Kontra gagne (pour avoir battu les dames de trèfle). Il y a encore un point chaque fois que les perdants ont moins de 90, moins de 60 et moins de 30 points, et un de plus s'ils n'ont fait aucune levée. Chaque joueur du camp gagnant marque ces points, chaque joueur du camp perdant les perd. Quand un joueur joue seul contre trois, il marque le triple.",
    doppelkopf_term_extras: "Points spéciaux",
    doppelkopf_rules_extras: "Quand on joue à deux contre deux, il y a aussi des points spéciaux pour le camp qui les obtient : une levée de 40 points ou plus (un « Doppelkopf »), la capture d'un as de carreau (le « renard ») de l'autre camp dans une levée, et la dernière levée remportée avec un valet de trèfle (« Charlot »). Les points spéciaux s'ajoutent aux points de partie, si bien que le camp perdant peut en récupérer une partie.",
    doppelkopf_term_left_out: "Ce qui est laissé de côté",
    doppelkopf_rules_left_out: "PaperGames ne joue que la partie normale. Il n'y a pas de solos, pas d'annonces de Re, de Kontra, de « pas 90 », etc., pas de règle de pauvreté (un joueur avec très peu d'atouts), pas d'autres façons de trouver un partenaire de mariage que la règle ci-dessus, et pas de règles de tournoi. Clubs et familles en ajoutent souvent une partie ; elles ne font pas partie de cette version.",
    doppelkopf_history_title: "L'histoire du Doppelkopf",
    doppelkopf_history_origins_title: "Du Schafkopf au Doppelkopf",
    doppelkopf_history_origins_p1: "Le Doppelkopf est issu du Schafkopf, un jeu de levées où les dames et les valets sont aussi des atouts permanents, joué en Allemagne depuis le XVIIIe siècle. Au cours du XIXe siècle, des joueurs du nord et du centre de l'Allemagne se mirent à y jouer avec deux paquets mélangés – d'où le nom, qui signifie à peu près « double tête ».",
    doppelkopf_history_origins_p2: "Le paquet doublé a apporté ce qui fait la particularité du jeu : chaque carte existe deux fois, l'ordre dans lequel elles tombent compte, et les alliances peuvent rester secrètes, car personne ne sait qui a l'autre dame de trèfle.",
    doppelkopf_history_names_title: "Beaucoup de tables, beaucoup de règles",
    doppelkopf_history_names_p1: "Pendant longtemps, chaque région, chaque club et chaque famille a joué selon ses propres règles, du rang des dix de cœur aux solos autorisés. Au XXe siècle, des associations de joueurs ont fixé des règles communes pour les tournois, mais à la maison beaucoup de tablées gardent leurs règles maison.",
    doppelkopf_history_names_p2: "PaperGames propose la partie normale avec mariage – le cœur du jeu que presque toutes les tablées jouent de la même façon – et indique sur la page des règles quels ajouts sont laissés de côté."
});
I18n.markTextLoaded("fr");
