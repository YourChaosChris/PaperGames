// text/fr/animalsudoku.js
// Rules and history texts of animalsudoku (fr). Loaded by animalsudoku-rules.html and animalsudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    animalsudoku_rules_title: "Règles du sudoku des animaux",
    animalsudoku_rules_intro: "Un petit sudoku pour enfants : des animaux au lieu de chiffres, et seulement 4 x 4 ou 6 x 6 cases.",
    animalsudoku_rules_basics_title: "Les règles",
    animalsudoku_term_board: "La grille",
    animalsudoku_rules_board: "La grille a 4 x 4 cases en quatre blocs de 2 x 2, ou 6 x 6 cases en six blocs de 2 lignes et 3 colonnes. Des traits épais montrent les blocs.",
    animalsudoku_term_animals: "Les animaux",
    animalsudoku_rules_animals: "En 4 x 4, il y a quatre animaux : chien, chat, lapin et souris. En 6 x 6, le hibou et le poisson s'y ajoutent. Chaque animal apparaît exactement une fois dans chaque ligne, chaque colonne et chaque bloc.",
    animalsudoku_term_given: "Animaux donnés",
    animalsudoku_rules_given: "Certains animaux sont déjà sur la grille. Ils ont un cadre épais et ne peuvent pas être changés.",
    animalsudoku_term_input: "Comment jouer",
    animalsudoku_rules_input: "Choisissez un animal dans la rangée de boutons sous la grille, puis touchez une case vide. Touchez-la à nouveau avec le même animal pour le retirer, ou utilisez la gomme. Si un animal apparaît deux fois dans une ligne, une colonne ou un bloc, les deux reçoivent un cadre en pointillés.",
    animalsudoku_term_hint: "Indice",
    animalsudoku_rules_hint: "Le bouton « Indice » fonctionne comme au sudoku : s'il y a une erreur, il la montre d'abord ; sinon il marque la case suivante, explique ensuite pourquoi et, à la troisième pression, place l'animal.",
    animalsudoku_term_levels: "Niveaux",
    animalsudoku_rules_levels: "Facile, Moyen et Difficile diffèrent par le nombre d'animaux donnés au départ. Chaque grille a exactement une solution et se résout sans deviner.",
    animalsudoku_rules_example_title: "Un exemple résolu",
    animalsudoku_rules_example: "L'image montre une grille 4 x 4 résolue : dans chaque ligne, chaque colonne et chaque bloc de 2 x 2, chacun des quatre animaux apparaît une fois.",
    animalsudoku_rules_end_title: "Terminer une grille",
    animalsudoku_term_win: "Résolu",
    animalsudoku_rules_win: "La grille est résolue quand chaque case contient le bon animal.",
    animalsudoku_history_title: "L'histoire du sudoku en images",
    animalsudoku_history_origins_title: "Du carré latin au sudoku",
    animalsudoku_history_origins_p1: "Une grille où chaque symbole apparaît une fois dans chaque ligne et chaque colonne s'appelle un carré latin. Le mathématicien suisse Leonhard Euler a écrit sur ces carrés au XVIIIe siècle.",
    animalsudoku_history_origins_p2: "Le casse-tête avec des blocs en plus est paru en 1979 dans un magazine de jeux américain sous le nom de Number Place ; il a été conçu par Howard Garns. L'éditeur japonais Nikoli l'a repris en 1984 et lui a donné le nom de sudoku.",
    animalsudoku_history_small_title: "Petites grilles et images",
    animalsudoku_history_small_p1: "Après que le sudoku est devenu populaire dans le monde entier au milieu des années 2000, des versions plus petites de 4 x 4 et 6 x 6 cases et des versions avec des images au lieu de chiffres sont apparues, surtout pour les enfants : la règle est la même, mais il y a moins de choses à garder en tête à la fois.",
    animalsudoku_history_modern_title: "Comment PaperGames crée chaque grille",
    animalsudoku_history_modern_p1: "Chaque grille vient du générateur propre à PaperGames. Il remplit une grille complète au hasard, puis retire les animaux un par un - mais seulement tant que la grille garde exactement une solution et peut encore se résoudre avec les deux étapes les plus simples : un seul animal convient à une case, ou un animal n'a plus qu'une case possible dans une ligne, une colonne ou un bloc."
});
I18n.markTextLoaded("fr");
