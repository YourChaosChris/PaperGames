// text/fr/mahjong.js
// Rules and history texts of mahjong (fr). Loaded by mahjong-rules.html and mahjong-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    mahjong_rules_title: "Règles du Mahjong solitaire",
    mahjong_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Mahjong solitaire - utile si vous êtes rouillé, ou si vous apprenez.",
    mahjong_rules_basics_title: "L'idée de base",
    mahjong_term_layout: "La disposition",
    mahjong_rules_layout: "80 tuiles sont empilées sur trois niveaux de profondeur en forme de pyramide. Une tuile est libre à prendre seulement si rien ne repose dessus et qu'au moins l'une de ses voisines immédiates, à gauche ou à droite sur son propre niveau, est absente ou déjà retirée.",
    mahjong_term_matching: "Associer",
    mahjong_rules_matching: "Cliquez sur une tuile libre, puis sur une autre tuile libre affichant le même symbole pour retirer les deux du plateau. Chaque donne est générée de façon à ce qu'un nettoyage complet soit toujours possible depuis la position de départ, même si un ordre d'associations maladroit peut encore vous laisser bloqué en cours de route.",
    mahjong_term_shuffle: "Se retrouver bloqué",
    mahjong_rules_shuffle: "Si aucune association légale ne reste possible sur le plateau, utilisez Mélanger les tuiles restantes pour redistribuer de nouveaux symboles sur ce qu'il reste - une solution est garantie à partir de ce point, donc être bloqué une fois ne signifie jamais devoir tout recommencer.",
    mahjong_rules_end_title: "Terminer une partie",
    mahjong_term_win: "Terminé",
    mahjong_rules_win: "Le plateau est nettoyé dès que chaque tuile a été associée et retirée.",
    mahjong_history_title: "L'histoire du Mahjong solitaire",
    mahjong_history_origins_title: "Des tuiles empruntées, un nouveau jeu",
    mahjong_history_origins_p1: "Le Mahjong solitaire (aussi appelé Shanghai) n'est pas un jeu chinois traditionnel. Il reprend le magnifique jeu de tuiles illustrées du Mahjong à quatre joueurs (lui-même une création chinoise du XIXe siècle) pour en faire un casse-tête d'association solo entièrement différent, sans les combinaisons, défausses ni mains à points du jeu original. La plus ancienne version documentée est un jeu vidéo : Brodie Lockard l'a écrit en 1981 pour le système PLATO.",
    mahjong_history_origins_p2: "Qui exactement a le premier combiné un format de solitaire d'association par paires avec des tuiles de Mahjong reste réellement incertain, avec des revendications concurrentes remontant à des décennies avant l'ère informatique - ce qui est certain, c'est que cette combinaison n'est devenue un phénomène mondial qu'après avoir fait le saut vers les ordinateurs personnels.",
    mahjong_history_spread_title: "Un incontournable des écrans d'ordinateur des années 1980",
    mahjong_history_spread_p1: "Le jeu a atteint un public de masse grâce aux premières versions informatiques des années 1980, notamment le « Shanghai » d'Activision de 1986 pour Macintosh - assez populaire pour que « Shanghai » soit devenu, et reste encore à bien des endroits, un nom alternatif pour tout le genre des jeux solo d'association de tuiles construits autour de la disposition en couches classique.",
    mahjong_history_spread_p2: "La disposition qui donne son nom au jeu - un monticule en escalier, en forme de pyramide, surnommé « la Tortue » - est devenue si fortement associée au genre que la plupart des versions, y compris celle-ci, adoptent par défaut une variation de cette forme plutôt que d'en inventer une nouvelle.",
    mahjong_history_modern_title: "Un casse-tête résoluble par construction",
    mahjong_history_modern_p1: "Contrairement à un jeu comme le Sudoku ou un Nonogramme, où l'unicité de la solution d'un puzzle est vérifiée après sa conception, une donne de Mahjong solitaire est normalement garantie jouable d'une autre façon : de nombreuses implémentations, y compris celle d'PaperGames, construisent la donne en partant à rebours d'un plateau vide, en rejouant en sens inverse une séquence légale de retraits pour décider où placer chaque symbole.",
    mahjong_history_modern_p2: "Cela garantit qu'au moins un chemin vers la victoire existe dès la toute première tuile posée, mais - exactement comme pour un vrai jeu de cartes de solitaire Klondike - cela ne dit rien sur le fait qu'une séquence particulière d'associations réellement jouée par un joueur y parviendra, ce qui explique pourquoi se retrouver bloqué en cours de route dans une donne parfaitement résoluble fait partie intégrante et normale du jeu, plutôt que le signe que quelque chose a mal tourné."
});
I18n.markTextLoaded("fr");
