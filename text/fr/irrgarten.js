// text/fr/irrgarten.js
// Rules and history texts of irrgarten (fr). Loaded by irrgarten-rules.html and irrgarten-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    ig_rules_title: "Dédale : règles",
    ig_rules_intro: "Un labyrinthe carré fait de cases et de murs. Trouve le chemin du départ à l’arrivée.",
    ig_rules_basics_title: "Les règles",
    ig_term_move: "Avancer",
    ig_rules_move: "Tu commences dans la case du cercle, en haut à gauche ; le but est le drapeau en bas à droite. Touche une case voisine pour y avancer, ou une case plus loin dans un passage droit et libre pour t’y rendre d’un coup. Ton chemin est tracé en trait épais.",
    ig_term_draw: "Tracer avec le doigt",
    ig_rules_draw: "Dans les réglages, tu peux choisir « Tracer avec le doigt » : déplace ton doigt dans les passages et le cercle suit les cases. Les touches fonctionnent aussi.",
    ig_term_walls: "Murs et retour",
    ig_rules_walls: "Tu ne peux pas traverser les murs ; un court message te le dit. Revenir dans la case d’où tu viens l’enlève de ton chemin. Touche une case déjà parcourue pour y revenir.",
    ig_term_goal: "Le but",
    ig_rules_goal: "Quand tu atteins le drapeau, le labyrinthe est résolu. Chaque labyrinthe a un seul chemin du départ à l’arrivée.",
    ig_term_levels: "Niveaux",
    ig_rules_levels: "Facile (pour les enfants) : 6 x 6 cases avec de larges passages. Moyen : 10 x 10. Difficile : 15 x 15. Très difficile : 20 x 20. Chaque niveau propose cinq labyrinthes, l’un après l’autre. Chacun est créé par le programme à partir d’un nombre fixe : il est donc toujours identique.",
    ig_term_help: "Retour et indice",
    ig_rules_help: "« Retour » recule d’une case. « Indice » entoure en pointillés les trois prochaines cases du bon chemin, même depuis une impasse.",
    ig_history_title: "L’histoire des labyrinthes",
    ig_history_old_title: "Des motifs très anciens",
    ig_history_old_p1: "On trouve dans de nombreuses cultures anciennes des motifs sinueux qui mènent à un centre, sur des pierres, des pièces et des sols. Beaucoup n’ont qu’un seul chemin, sans choix ; les énigmes avec des impasses sont venues plus tard.",
    ig_history_puzzle_title: "Haies et livres de jeux",
    ig_history_puzzle_p1: "À partir du XVIe siècle, on plante dans les jardins des labyrinthes de haies où les visiteurs peuvent se perdre. Aux XIXe et XXe siècles, les labyrinthes sur papier deviennent incontournables dans les magazines pour enfants et les livres de jeux. Les mathématiciens les décrivent comme des graphes, et les programmes peuvent en créer sans fin.",
    ig_history_here_title: "Cette version",
    ig_history_here_p1: "Chaque labyrinthe est créé ici par le programme : il parcourt la grille et abat des murs jusqu’à ce que chaque case soit accessible. Aucun labyrinthe n’est copié d’un livre."
});
I18n.markTextLoaded("fr");
