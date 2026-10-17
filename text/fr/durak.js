// text/fr/durak.js
// Rules and history texts of durak (fr). Loaded by durak-rules.html and durak-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    sudoku_rules_basics_title: "L'idée de base",
    durak_rules_title: "Règles du Durak",
    durak_rules_intro: "Comment PaperGames joue au Durak, dans la forme courante où l'on peut ajouter des cartes.",
    durak_term_setup: "Cartes et atout",
    durak_rules_setup: "Un jeu de 36 cartes (du Six à l'As dans quatre couleurs), 2 à 4 joueurs, six cartes chacun. La carte suivante est posée face visible sous la pioche : sa couleur est l'atout pour toute la partie, et c'est la dernière carte piochée. La couleur d'atout est toujours affichée en haut du plateau.",
    durak_term_attack: "Attaque et défense",
    durak_rules_attack: "Le joueur qui a l'atout le plus faible attaque en premier. L'attaquant pose une carte face visible ; le joueur suivant défend et doit la battre avec une carte plus forte de la même couleur, ou avec n'importe quel atout si la carte d'attaque n'est pas un atout. Un atout n'est battu que par un atout plus fort.",
    durak_term_throw: "Ajouter des cartes",
    durak_rules_throw: "Une fois la première carte posée, l'attaquant puis les autres joueurs peuvent ajouter des cartes - mais seulement des valeurs déjà présentes sur la table, comme carte d'attaque ou de défense. Le défenseur doit battre chacune d'elles. Il n'y a jamais plus de six cartes d'attaque par tour, ni plus que ce que le défenseur avait en main au début du tour.",
    durak_term_take: "Ramasser",
    durak_rules_take: "Si le défenseur ne peut pas ou ne veut pas battre une carte, il prend toutes les cartes de la table en main ; les autres peuvent encore ajouter des cartes correspondantes avant. Ensuite, le joueur après le défenseur attaque - le défenseur est sauté. Si le défenseur bat tout, les cartes quittent le jeu et le défenseur attaque ensuite.",
    durak_term_draw: "Compléter sa main",
    durak_rules_draw: "Après chaque tour, chacun complète sa main à six cartes depuis la pioche : l'attaquant d'abord, puis dans l'ordre de la table, le défenseur en dernier.",
    durak_term_end: "La fin",
    durak_rules_end: "Quand la pioche est vide, on ne pioche plus, et un joueur sans cartes est sorti. Le dernier joueur à avoir encore des cartes est le durak - l'idiot - et perd. Si les derniers se défont de leurs cartes ensemble, la partie est nulle.",
    durak_term_transfer: "En option : renvoyer l'attaque",
    durak_rules_transfer: "Cette règle est désactivée, sauf si vous l'activez avant la partie. Avant de battre quoi que ce soit, le défenseur peut poser une carte de même valeur que les cartes d'attaque et renvoyer ainsi toute l'attaque au joueur suivant, qui doit alors se défendre contre toutes. Le joueur suivant doit avoir assez de cartes pour cela.",
    durak_history_title: "L'histoire du Durak",
    durak_history_origins_title: "Un jeu populaire russe",
    durak_history_origins_p1: "Le Durak se serait répandu parmi les gens ordinaires en Russie au XIXe siècle, joué avec le jeu de 36 cartes courant là-bas. Au XXe siècle, il est devenu l'un des jeux de cartes les plus joués en Union soviétique et dans les pays voisins, appris à la maison, dans le train et à l'armée.",
    durak_history_origins_p2: "Contrairement à la plupart des jeux de cartes, il n'a pas de gagnant, seulement un perdant : « durak » signifie « idiot », et c'est ainsi qu'on appelle le dernier à avoir des cartes, jusqu'au début de la partie suivante.",
    durak_history_names_title: "Beaucoup de façons de jouer",
    durak_history_names_p1: "La forme jouée ici, où l'on peut ajouter des cartes, s'appelle podkidnoï durak. Dans une autre forme populaire, perevodnoï durak, le défenseur peut renvoyer l'attaque avec une carte de même valeur - PaperGames le propose en option.",
    durak_history_names_p2: "S'y ajoutent d'innombrables règles maison, par exemple sur le nombre de cartes qu'on peut ajouter au premier tour. Les familles en débattent volontiers, et cela fait partie du charme du jeu."
});
I18n.markTextLoaded("fr");
