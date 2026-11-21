// text/fr/poch.js
// Rules and history texts of poch (fr). Loaded by poch-rules.html and poch-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    poch_rules_title: "Règles de la Poque",
    poch_rules_intro: "La Poque est un vieux jeu de cartes qui se joue avec 32 cartes et des jetons. Chaque donne comporte trois étapes : des cases sont payées pour certaines cartes, les joueurs misent sur leur meilleur ensemble de cartes identiques, puis chacun joue ses cartes en suites. Après six donnes, le plus de jetons gagne.",
    poch_rules_basics_title: "Les règles",
    poch_term_pools: "Les cases",
    poch_rules_pools: "Le plateau a neuf cases : As, Roi, Dame, Valet, Dix, Mariage (Roi et Dame), Séquence (7, 8 et 9), Poque et le pot central. Avant chaque donne, chaque joueur met un jeton dans chaque case, soit 9 jetons. Toutes les cartes sont distribuées sauf une, retournée : sa couleur est la couleur de paiement.",
    poch_term_first: "Étape 1 : paiement",
    poch_rules_first: "Celui qui détient l’as, le roi, la dame, le valet ou le dix de la couleur de paiement prend les jetons de la case correspondante. Le roi et la dame de cette couleur ensemble gagnent aussi la case Mariage, le 7, le 8 et le 9 ensemble la case Séquence. Une case que personne ne gagne, parce que personne n’a la carte ou qu’elle est retournée, reste pour la donne suivante et s’enrichit.",
    poch_term_pochen: "Étape 2 : poquer",
    poch_rules_pochen: "Seuls les joueurs ayant deux, trois ou quatre cartes de même valeur participent, avec leur meilleur ensemble. Le premier joueur à gauche du donneur fait parole ou mise 1 ; ensuite on suit, on relance de 1 (jusqu’à 4 en tout) ou on se couche. Qui ne peut pas payer pour suivre ne peut que se coucher. Un carré bat un brelan, un brelan bat une paire ; une valeur plus haute bat une plus basse ; la même paire avec une carte de la couleur de paiement bat celle sans. Le meilleur ensemble gagne la case Poque et toutes les mises. Si tous font parole, la case Poque reste ; un joueur seul avec un ensemble la prend aussitôt.",
    poch_term_play: "Étape 3 : jeu des cartes",
    poch_rules_play: "Le gagnant de la Poque (ou le joueur à gauche du donneur) entame n’importe quelle carte. La carte suivante de la même couleur doit être jouée par celui qui l’a, puis la suivante, jusqu’à l’as. Quand la carte suivante manque – déjà jouée ou retournée –, le dernier joueur entame à nouveau. Qui joue le premier sa dernière carte gagne le pot central et, de chaque autre joueur, un jeton par carte qu’il a encore.",
    poch_term_end: "La fin de la partie",
    poch_rules_end: "Une partie comporte six donnes ; elle s’arrête plus tôt si quelqu’un ne peut pas payer les 9 jetons d’une donne. Le plus de jetons gagne. Les jetons ne sont que des points dans le jeu ; il n’y a pas d’argent en jeu.",
    poch_term_computer: "L’ordinateur",
    poch_rules_computer: "Facile fait surtout parole et joue une carte quelconque. Moyen relance avec un brelan, un carré ou une haute paire et entame une carte que personne ne peut suivre. Difficile compte aussi les joueurs encore dans la mise et prépare les suites avec ses propres cartes. Le bouton Indice propose ce que ferait Difficile.",
    poch_history_title: "L’histoire de la Poque",
    poch_history_origins_title: "Un très vieux jeu",
    poch_history_origins_p1: "La Poque a au moins cinq cents ans et apparaît pour la première fois au XVe siècle. On y jouait en Allemagne sous le nom de Pochen ou Pochspiel et en France sous celui de La Poque, avec un plateau spécial qui contient les jetons. La Poque compte parmi les ancêtres du poker, et des jeux de plateau semblables se jouent encore dans de nombreux pays.",
    poch_history_here_title: "La Poque ici",
    poch_history_here_p1: "PaperGames fait de la Poque un jeu pour une personne contre un à trois ordinateurs. Il a son propre plateau de neuf cases et ses propres formulations, se joue en six donnes sans argent, et les ordinateurs attendent entre leurs coups."
});
I18n.markTextLoaded("fr");
