// text/fr/pentomino.js
// Rules and history texts of pentomino (fr). Loaded by pentomino-rules.html and pentomino-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.fr, {
    pt_rules_title: "Puzzle pentomino – règles",
    pt_rules_intro: "Remplissez un rectangle avec des pièces de cinq carrés.",
    pt_rules_basics_title: "Les règles",
    pt_term_pieces: "Les pièces",
    pt_rules_pieces: "Il existe exactement douze façons d'assembler cinq carrés bord à bord, si l'on compte comme identiques les formes tournées ou retournées. Chaque pièce porte sa lettre habituelle (F, I, L, N, P, T, U, V, W, X, Y, Z) et son propre motif noir et blanc.",
    pt_term_lay: "Poser",
    pt_rules_lay: "Choisissez une pièce sous le plateau. Tourner ↻ et Retourner ⇋ changent son orientation ; son point marque une case. Touchez la case où doit aller le point : si la pièce rentre, elle est posée. Touchez une pièce posée pour la reprendre. Pas besoin de glisser.",
    pt_term_free: "Placement libre",
    pt_rules_free: "Posez les pièces jusqu'à remplir le rectangle : tout remplissage compte. Facile : 5 pièces en 5 × 5. Moyen : 8 pièces en 5 × 8. Difficile : les 12 en 6 × 10, 5 × 12, 4 × 15 ou 3 × 20.",
    pt_term_fixed: "Pièces de départ imposées",
    pt_rules_fixed: "Sur 6 × 10, certaines pièces sont fixes (cadres intérieurs en pointillés) ; les autres s'y emboîtent d'une seule façon. Facile : 3 pièces à poser, Moyen : 5, Difficile : 7.",
    pt_term_help: "Indice",
    pt_rules_help: "L'indice marque où va la pièce suivante. Si une pièce posée bloque toute solution, il la nomme.",
    pt_rules_example_title: "Exemple",
    pt_rules_example: "Un plateau Facile résolu : cinq pièces remplissent le carré 5 × 5.",
    pt_history_title: "Histoire du puzzle pentomino",
    pt_history_early_title: "Dudeney et Golomb",
    pt_history_early_p1: "La plus ancienne énigme connue avec les douze pièces se trouve dans le livre de Henry Dudeney The Canterbury Puzzles, paru en 1907. Le nom « pentomino » vient du mathématicien Solomon Golomb, qui a commencé à décrire ces formes en 1953 ; la rubrique de jeux de Martin Gardner dans Scientific American les a fait connaître.",
    pt_history_count_title: "Les solutions comptées",
    pt_history_count_p1: "Combien de façons y a-t-il de remplir 6 × 10 ? C. B. et Jenifer Haselgrove l'ont calculé par ordinateur en 1960 : 2339, sans compter les copies tournées ou retournées d'une solution entière. Pour 5 × 12, il y en a 1010, pour 4 × 15, 368, et pour 3 × 20, seulement 2."
});
I18n.markTextLoaded("fr");
