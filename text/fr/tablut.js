// text/fr/tablut.js
// Rules and history texts of tablut (fr). Loaded by tablut-rules.html and tablut-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    tablut_rules_title: "Règles du Tablut",
    tablut_rules_intro: "Un aide-mémoire rapide sur la façon dont PaperGames joue au Tablut, le membre 9x9 de la famille Tafl - utile si vous êtes rouillé, ou si vous apprenez.",
    tablut_rules_basics_title: "L'idée de base",
    tablut_term_setup: "La mise en place",
    tablut_rules_setup: "Le roi commence sur le trône central, au milieu d'une croix de huit défenseurs, assiégé par huit attaquants postés deux par bord. Les attaquants jouent en premier, et les deux camps poursuivent des objectifs très différents : le camp du roi veut qu'il atteigne un coin, les attaquants veulent le piéger en premier.",
    tablut_term_moving: "Se déplacer",
    tablut_rules_moving: "Chaque pièce - attaquant, défenseur ou le roi - se déplace comme une tour : n'importe quelle distance en ligne droite, mais jamais à travers ou sur une autre pièce.",
    tablut_term_special: "Le trône et les coins",
    tablut_rules_special: "Le trône central et les quatre cases d'angle sont interdits à tous sauf au roi : les attaquants et les défenseurs ne peuvent ni s'y poser ni les traverser, alors que le roi peut librement revenir sur le trône vide. Les coins sont les seules cases par lesquelles le roi peut s'échapper.",
    tablut_term_capture: "Capturer",
    tablut_rules_capture: "Une pièce ordinaire (attaquant ou défenseur) est capturée par prise en tenaille : piégez-la entre deux pièces ennemies, ou une pièce ennemie et une case spéciale hostile (le trône vide, ou un coin), sur des côtés opposés d'une ligne droite. Seule la pièce qui vient de bouger peut déclencher une capture, donc déplacer vous-même une pièce entre deux ennemies est toujours sûr.",
    tablut_rules_example_title: "Exemple détaillé",
    tablut_rules_example_intro: "Deux exemples rapides de la prise en tenaille en pratique (avec les coordonnées classiques a-i / 1-9, colonne puis rangée) :",
    tablut_term_example_ordinary: "Une prise en tenaille ordinaire",
    tablut_rules_example_ordinary: "Un défenseur suédois est en d6, avec un attaquant moscovite posté en c6, juste à l'ouest. Quand un second attaquant glisse en e6, le défenseur se retrouve pris en tenaille entre deux attaquants sur une ligne droite - et il est capturé.",
    tablut_term_example_throne: "Une prise en tenaille assistée par le trône",
    tablut_rules_example_throne: "Un défenseur en e6 se trouve juste au sud du trône vide (e5). Un seul attaquant glissant en e7, juste au sud du défenseur, suffit à le capturer : le trône vide compte comme hostile du côté opposé, donc aucune seconde pièce attaquante n'est nécessaire.",
    tablut_rules_end_title: "Gagner la partie",
    tablut_term_kingcapture: "Capturer le roi",
    tablut_rules_kingcapture: "Le roi n'est capturé que lorsque les quatre cases orthogonalement adjacentes à lui sont toutes hostiles : occupées par des attaquants, ou - pour un côté faisant face au trône - le trône vide lui-même, qui compte comme une case hostile équivalente à un attaquant. Contrairement à une pièce ordinaire, le bord du plateau ne compte jamais comme hostile envers le roi dans ce règlement : un roi acculé au bord du plateau a toujours besoin d'un véritable attaquant sur chaque côté ouvert.",
    tablut_term_win: "Comment une partie se termine",
    tablut_rules_win: "Le camp du roi gagne dès l'instant où il atteint l'un des quatre coins. Les attaquants gagnent en capturant le roi comme décrit ci-dessus. Un camp qui n'a aucun coup légal à jouer à son tour perd la partie.",
    tablut_history_title: "L'histoire du Tablut",
    tablut_history_linnaeus_title: "Linné en Laponie",
    tablut_history_linnaeus_p1: "En 1732, le naturaliste suédois Carl von Linné - des décennies avant de révolutionner la biologie avec son système de classification des espèces - parcourut la Laponie en répertoriant les plantes, les animaux et les coutumes du peuple sami qu'il rencontrait en chemin. Parmi ses notes, il consigna un jeu de plateau que les Samis appelaient Tablut : son plateau 9x9, ses pièces, et les règles selon lesquelles ils y jouaient.",
    tablut_history_linnaeus_p2: "Cette description s'est révélée immensément importante. Presque aucun règlement complet d'un jeu Tafl n'a survécu depuis l'âge viking lui-même - le jeu était tout simplement tombé en désuétude dans la majeure partie de l'Europe avant que quiconque ne pense à en coucher les règles par écrit. Les notes de Linné sur le Tablut, bien que rédigées des siècles après l'âge d'or viking du Tafl et imparfaites par endroits (son manuscrit reste ambigu sur quelques cas limites, ce qui explique justement pourquoi différentes reconstitutions et règlements modernes restent aujourd'hui en désaccord sur certains détails), demeurent la source primaire la plus importante que les chercheurs aient utilisée depuis pour reconstituer la façon dont toute la famille Tafl était probablement jouée.",
    tablut_history_family_title: "La variante Tafl la plus connue",
    tablut_history_family_p1: "En partie grâce à cette documentation, le Tablut est le membre le plus connu et historiquement le plus important de la famille Tafl - celui le plus souvent utilisé comme référence pour reconstituer les règles de ses nombreux cousins, du petit Brandub 7x7 jusqu'à l'immense Alea Evangelii 19x19.",
    tablut_history_brandub_link: "PaperGames propose aussi la variante Brandub, plus petite, sur un plateau 7x7, si vous voulez comparer les deux tailles de plateau.",
    tablut_history_version_title: "Cette version",
    tablut_history_version_p1: "PaperGames joue au Tablut sur le plateau standard 9x9 avec 8 attaquants, 8 défenseurs et un roi, avec une règle moderne de capture du roi clairement définie (voir la page des règles) - car, comme le montrent les propres notes de Linné, même la source la mieux documentée sur le Tafl laisse certains détails ouverts à l'interprétation."
});
I18n.markTextLoaded("fr");
