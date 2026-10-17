// text/fr/adventurebook.js
// Rules and history texts of adventurebook (fr). Loaded by adventurebook-rules.html and adventurebook-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    ab_rules_title: "Livre d’aventure – règles",
    ab_rules_intro: "Tu joues un héros. Trouve le trésor d’une grotte, d’une tour ou d’une forêt et rapporte-le à l’entrée.",
    ab_rules_basics_title: "Les règles",
    ab_term_hero: "Ton héros",
    ab_rules_hero: "Donne un nom, choisis l’une des quatre classes et répartis 6 points entre Force, Adresse et Savoir (au plus 4 sur une valeur). Combattant : 16 points de vie, attaque avec la Force. Éclaireuse : 13, attaque avec l’Adresse. Guérisseur : 13, attaque avec un bâton de lumière (Savoir). Érudite : 11, attaque avec des sorts (Savoir). Chaque classe ajoute 1 à une valeur et possède une capacité utilisable une fois par combat.",
    ab_term_place: "Le lieu",
    ab_rules_place: "Chaque aventure est un nouveau lieu de 12 à 20 salles sur une petite grille : la Grotte de cristal, la Tour aux corbeaux ou la Forêt des brumes. Chaque salle a un court texte et deux ou trois boutons. Chaque passage va dans les deux sens, tu peux donc toujours revenir. Le trésor se trouve dans la salle la plus éloignée de l’entrée, gardé par un ennemi puissant.",
    ab_term_checks: "Épreuves",
    ab_rules_checks: "Pousser un rocher, sauter une crevasse, lire des runes, fouiller une salle ou fuir : lance deux dés et ajoute la valeur. Si la somme atteint le nombre demandé, c’est réussi. La corde, le pied-de-biche et la loupe ajoutent 2 tant que tu les portes ; un trèfle permet de relancer une fois. Le résultat s’affiche toujours avec le calcul, par exemple « 7 + Adresse 2 = 9, il fallait 8 : réussi ».",
    ab_term_fight: "Combats",
    ab_rules_fight: "Un combat se joue en tours. Attaquer : deux dés plus ta valeur d’attaque doivent atteindre la défense de l’ennemi, qui perd alors des points de vie. Se défendre : l’ennemi touche moins souvent et deux fois moins fort. Objet : une potion ou un parchemin. Capacité : ta capacité de classe, une fois par combat. Fuir (épreuve d’Adresse) : retour dans la salle d’où tu viens – l’ennemi reste, mais garde ses dégâts. Après ton action, l’ennemi attaque. Un ennemi à 0 point de vie abandonne et s’enfuit ; tu gagnes de l’expérience et de l’or.",
    ab_term_pack: "Sac à dos et niveaux",
    ab_rules_pack: "Le sac à dos contient 8 objets : nourriture et potions pour se soigner, armes et armures (la meilleure est équipée aussitôt), talismans qui augmentent une valeur pour de bon, parchemins pour les combats et outils utiles. Coffres, obstacles et fouilles rapportent objets et or. Avec l’expérience, tu montes jusqu’au niveau 5 : chaque niveau donne 3 points de vie et +1 aux attaques.",
    ab_term_end: "Fin et difficulté",
    ab_rules_end: "Tu gagnes quand tu rapportes le trésor à l’entrée. À 0 point de vie, le héros n’a plus de forces et l’aventure est terminée. Ensuite, tu peux continuer avec le même héros (niveau et valeurs restent, sac et or repartent de zéro) ou en créer un nouveau. Facile : ennemis plus faibles et 3 potions de soin au départ ; Moyen : 2 potions ; Difficile : ennemis plus forts, épreuves plus dures et 1 potion.",
    ab_term_playing: "Jouer",
    ab_rules_playing: "En haut, tu lis la salle et ce qui vient de se passer ; en dessous se trouvent les choix sous forme de boutons et, en bas, les valeurs de ton héros. La carte et le sac à dos s’ouvrent avec leurs propres boutons. La carte montre les salles que tu as vues ; ta salle a un cadre épais. Le jeu sauvegarde après chaque pas, tu peux donc t’arrêter à tout moment.",
    ab_rules_example_title: "Exemple",
    ab_rules_example: "Ton éclaireuse veut sauter une crevasse. Elle fait 4 et 3, soit 7, plus Adresse 2, cela fait 9. Il fallait 8 – elle réussit et trouve une corde de l’autre côté.",
    ab_history_title: "Histoire du Livre d’aventure",
    ab_history_origin_title: "Incarner un héros",
    ab_history_origin_p1: "Dans les années 1970 sont apparus des jeux de rôle où chaque joueur incarne un héros dont les valeurs sont notées sur papier. Une personne raconte l’histoire, les dés décident si une action réussit. Bientôt, il y eut aussi des livres où l’on continue sur une autre page selon son choix, et des aventures en solo avec dés et feuille de personnage, pour jouer seul.",
    ab_history_screen_title: "Des salles à l’écran",
    ab_history_screen_p1: "Vers 1980, des jeux vidéo ont repris l’idée : de nouvelles salles à chaque partie, un héros qui devient plus fort et des tours qui attendent ta décision. Ces jeux restent populaires, car aucune aventure ne ressemble à une autre.",
    ab_history_here_title: "Le Livre d’aventure dans PaperGames",
    ab_history_here_p1: "Le Livre d’aventure réunit tout cela sous une forme calme pour la liseuse : pas de pression du temps, chaque lancer affiché en calcul, trois lieux avec leurs salles, ennemis et trésors, et un ton familial – les ennemis vaincus abandonnent et s’enfuient. Tous les noms et textes sont originaux."
});
I18n.markTextLoaded("fr");
