// text/es/animalsudoku.js
// Rules and history texts of animalsudoku (es). Loaded by animalsudoku-rules.html and animalsudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    animalsudoku_rules_title: "Reglas del sudoku de animales",
    animalsudoku_rules_intro: "Un sudoku pequeño para niños: animales en lugar de números y solo 4 x 4 o 6 x 6 casillas.",
    animalsudoku_rules_basics_title: "Las reglas",
    animalsudoku_term_board: "El tablero",
    animalsudoku_rules_board: "El tablero tiene 4 x 4 casillas en cuatro bloques de 2 x 2, o 6 x 6 casillas en seis bloques de 2 filas y 3 columnas. Las líneas gruesas marcan los bloques.",
    animalsudoku_term_animals: "Los animales",
    animalsudoku_rules_animals: "En 4 x 4 hay cuatro animales: perro, gato, conejo y ratón. En 6 x 6 se suman el búho y el pez. Cada animal aparece exactamente una vez en cada fila, cada columna y cada bloque.",
    animalsudoku_term_given: "Animales dados",
    animalsudoku_rules_given: "Algunos animales ya están en el tablero. Tienen un marco grueso y no se pueden cambiar.",
    animalsudoku_term_input: "Cómo se juega",
    animalsudoku_rules_input: "Elige un animal en la fila de botones bajo el tablero y toca una casilla vacía. Si vuelves a tocarla con el mismo animal, se quita; también puedes usar la goma. Si un animal aparece dos veces en una fila, columna o bloque, ambos reciben un marco de rayas.",
    animalsudoku_term_hint: "Pista",
    animalsudoku_rules_hint: "El botón «Pista» funciona como en el sudoku: si hay un error, lo muestra primero; si no, marca la siguiente casilla, después explica por qué y a la tercera pulsación coloca el animal.",
    animalsudoku_term_levels: "Niveles",
    animalsudoku_rules_levels: "Fácil, Medio y Difícil se diferencian en cuántos animales hay al principio. Cada sudoku tiene exactamente una solución y se resuelve sin adivinar.",
    animalsudoku_rules_example_title: "Un ejemplo resuelto",
    animalsudoku_rules_example: "La imagen muestra un tablero de 4 x 4 resuelto: en cada fila, cada columna y cada bloque de 2 x 2, cada uno de los cuatro animales aparece una vez.",
    animalsudoku_rules_end_title: "Terminar un sudoku",
    animalsudoku_term_win: "Resuelto",
    animalsudoku_rules_win: "El sudoku está resuelto cuando cada casilla tiene el animal correcto.",
    animalsudoku_history_title: "La historia del sudoku con dibujos",
    animalsudoku_history_origins_title: "Del cuadrado latino al sudoku",
    animalsudoku_history_origins_p1: "Una cuadrícula en la que cada símbolo aparece una vez en cada fila y cada columna se llama cuadrado latino. El matemático suizo Leonhard Euler escribió sobre estos cuadrados en el siglo XVIII.",
    animalsudoku_history_origins_p2: "El pasatiempo con bloques además apareció en 1979 en una revista estadounidense de pasatiempos con el nombre de Number Place; lo ideó Howard Garns. La editorial japonesa Nikoli lo retomó en 1984 y le dio el nombre de sudoku.",
    animalsudoku_history_small_title: "Tableros pequeños y dibujos",
    animalsudoku_history_small_p1: "Cuando el sudoku se hizo popular en todo el mundo a mediados de los años 2000, aparecieron versiones más pequeñas de 4 x 4 y 6 x 6 casillas y versiones con dibujos en lugar de cifras, sobre todo para niños: la regla es la misma, pero hay menos cosas que recordar a la vez.",
    animalsudoku_history_modern_title: "Cómo crea PaperGames cada sudoku",
    animalsudoku_history_modern_p1: "Cada sudoku de aquí sale del generador propio de PaperGames. Llena un tablero completo al azar y luego quita animales uno a uno, pero solo mientras el sudoku conserve exactamente una solución y siga pudiendo resolverse con los dos pasos más sencillos: solo un animal cabe en una casilla, o un animal solo tiene una casilla libre en una fila, columna o bloque."
});
I18n.markTextLoaded("es");
