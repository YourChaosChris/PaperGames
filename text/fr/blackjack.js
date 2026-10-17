// text/fr/blackjack.js
// Rules and history texts of blackjack (fr). Loaded by blackjack-rules.html and blackjack-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    bj_rules_title: "Règles du Blackjack",
    bj_rules_intro: "Approchez-vous plus de 21 que la banque, sans dépasser. Deux variantes, un seul jeu – avec des jetons, qui ne sont que des points.",
    bj_rules_basics_title: "Les règles",
    bj_term_variants: "Deux variantes",
    bj_rules_variants: "17 et 4 se joue avec 32 cartes (du 7 à l'as), le Blackjack avec 52 cartes (du 2 à l'as). Choisissez la variante sous Nouvelle partie.",
    bj_term_values17: "Valeur des cartes au 17 et 4",
    bj_rules_values17: "As 11, roi 4, dame 3, valet 2, les cartes de 7 à 10 selon leur valeur. Deux as comme premières cartes s'appellent « le feu » et sont la meilleure main.",
    bj_term_valuesbj: "Valeur des cartes au Blackjack",
    bj_rules_valuesbj: "As 1 ou 11 (selon ce qui vous arrange), roi, dame et valet 10, les autres cartes selon leur valeur. Un as et une carte de valeur 10 comme premières cartes font un blackjack.",
    bj_term_round: "Une manche",
    bj_rules_round: "Choisissez votre mise : 5, 10 ou 20 jetons. Vous recevez deux cartes, la banque une carte visible et une cachée. Prenez d'autres cartes avec « Carte » ou arrêtez avec « Rester ». Si vous dépassez 21, vous avez perdu tout de suite.",
    bj_term_bank: "La banque",
    bj_rules_bank: "Quand vous restez, la banque retourne sa carte. Elle suit toujours la même règle : elle tire tant qu'elle a 16 ou moins et reste à partir de 17. Si elle dépasse 21, vous gagnez.",
    bj_term_result: "Qui gagne",
    bj_rules_result: "Le plus proche de 21 gagne. Vous gagnez autant de jetons que votre mise ; un blackjack rapporte une fois et demie la mise (arrondi vers le bas). Égalité : au 17 et 4 la banque gagne, au Blackjack vous gardez vos jetons. Un 21 en deux cartes (blackjack) ou le feu termine la manche aussitôt.",
    bj_term_double: "Doubler (Blackjack seulement)",
    bj_rules_double: "Avec vos deux premières cartes, vous pouvez doubler : votre mise double, vous recevez exactement une carte de plus, puis la banque joue. Il vous faut assez de jetons. Il n'y a ni séparation ni assurance.",
    bj_term_chips: "Jetons",
    bj_rules_chips: "Vous commencez avec 100 jetons. Ce ne sont que des points du jeu ; on ne peut les échanger contre rien. S'il ne vous en reste plus, recommencez avec 100.",
    bj_rules_example_title: "Mêmes cartes, autres points",
    bj_rules_example: "As et roi : au Blackjack, ils font 21 – un blackjack. Au 17 et 4, ils ne font que 15 (as 11, roi 4).",
    bj_history_title: "L'histoire du Blackjack",
    bj_history_origins_title: "Vingt-et-un",
    bj_history_origins_p1: "Les jeux de cartes où l'on cherche à atteindre 21 sans dépasser sont anciens : la première mention écrite se trouve dans un livre de l'écrivain espagnol Miguel de Cervantes. Le 17 et 4 allemand date du XVIIIe siècle et était très apprécié en France à la cour de Louis XV. Le vingt-et-un français descend du trente-et-un, plus ancien, où il fallait atteindre 31. En allemand, on l'appelait aussi autrefois Hopsen. Avec les valeurs du jeu de 32 cartes, 17 plus un roi (4) font exactement 21.",
    bj_history_us_title: "Blackjack",
    bj_history_us_p1: "Aux États-Unis, une forme américaine du vingt-et-un est devenue un jeu à part entière et a pris le nom de blackjack vers 1899. L'histoire souvent racontée d'une prime pour un as avec un valet noir est un mythe selon l'historien Thierry Depaulis. Traditionnellement, un blackjack paie 3 contre 2, et en cas d'égalité la mise est rendue.",
    bj_history_modern_title: "Le Blackjack sur PaperGames",
    bj_history_modern_p1: "PaperGames joue uniquement avec des jetons : ce ne sont que des points du jeu, qu'on ne peut échanger contre rien. La banque suit toujours la même règle fixe, les cartes sont mélangées à chaque manche et vos points sont toujours affichés – les cartes se distinguent par des symboles pleins et creux, pour que le jeu fonctionne sur l'encre électronique en noir et blanc."
});
I18n.markTextLoaded("fr");
