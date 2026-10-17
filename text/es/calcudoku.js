// text/es/calcudoku.js
// Rules and history texts of calcudoku (es). Loaded by calcudoku-rules.html and calcudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    sudoku_rules_basics_title: "La idea básica",
    sudoku_term_goal: "El objetivo",
    sudoku_term_input: "Introducir números",
    sudoku_rules_end_title: "Terminar un puzle",
    sudoku_term_win: "Resuelto",
    sudoku_term_difficulty: "Dificultad",
    puzzle_rules_hint: "El botón «Pista» ayuda en tres pasos. La primera pulsación marca dónde está el siguiente paso. La segunda da el motivo, es decir, la regla que se aplica allí. La tercera realiza el paso (anota el número o construye el puente). La pista parte de tu situación actual: si en algún sitio hay un número o un puente equivocado, te lo dice primero. Nunca adivina: si solo se puede seguir probando, lo dice con sinceridad. Las pistas son ilimitadas. Un pasatiempo resuelto con pistas cuenta igualmente como victoria; las estadísticas muestran además cuántas victorias fueron con pistas.",
    calcudoku_rules_title: "Reglas del Calcudoku",
    calcudoku_rules_intro: "Una referencia rápida de cómo juega PaperGames al Calcudoku, útil para repasar o aprender.",
    calcudoku_term_board: "La cuadrícula",
    calcudoku_rules_board: "La cuadrícula es cuadrada, de 4x4 a 7x7. A diferencia del Sudoku no tiene cajas; en su lugar, líneas gruesas la dividen en jaulas: grupos de una a cuatro casillas contiguas.",
    calcudoku_rules_goal: "Rellena cada casilla con una cifra del 1 al tamaño de la cuadrícula (del 1 al 5 en una de 5x5) para que cada fila y cada columna contenga cada cifra exactamente una vez. Cada puzle que genera PaperGames tiene exactamente una solución.",
    calcudoku_term_regions: "Jaulas y operaciones",
    calcudoku_rules_regions: "La pequeña etiqueta en la casilla superior izquierda de una jaula indica un resultado y una operación. Con + o × las cifras de la jaula deben sumar o multiplicar ese resultado, en cualquier orden. Una jaula con – o ÷ siempre tiene dos casillas: la cifra mayor menos la menor, o dividida entre la menor, da el resultado. Una jaula de una sola casilla muestra simplemente su cifra. Una cifra puede aparecer dos veces en una jaula, siempre que su fila y su columna lo permitan.",
    calcudoku_rules_input: "Selecciona una casilla y elige un número del teclado bajo el tablero (o escribe una cifra en un teclado). Una cifra en blanco sobre negro choca con otra de su fila o columna, o completa una jaula que no alcanza su resultado.",
    calcudoku_rules_difficulty: "Elige el tamaño de la cuadrícula y un nivel antes de empezar. Cuadrículas más grandes y niveles más altos significan jaulas más grandes y menos jaulas de una casilla, que revelan menos.",
    calcudoku_rules_win: "El puzle está resuelto en cuanto todas las casillas están llenas y ninguna fila, columna ni jaula incumple una regla.",
    calcudoku_history_title: "La historia del Calcudoku",
    calcudoku_history_origins_title: "Desde un aula de Japón",
    calcudoku_history_origins_p1: "Este tipo de puzle se atribuye normalmente a Tetsuya Miyamoto, un profesor de matemáticas japonés que lo ideó hacia 2004 para entrenar a sus alumnos en el cálculo y el razonamiento lógico sin decirles cómo resolverlo. La idea pronto salió de su aula a través de libros de pasatiempos y periódicos.",
    calcudoku_history_origins_p2: "Bajo la aritmética está el cuadrado latino - una cuadrícula en la que cada símbolo aparece exactamente una vez por fila y columna -, que estudiaron matemáticos como Leonhard Euler en el siglo XVIII y que también es el núcleo del Sudoku.",
    calcudoku_history_names_title: "Muchos nombres, un solo puzle",
    calcudoku_history_names_p1: "El mismo tipo de puzle se publica también comercialmente con el nombre KenKen. KenKen es una marca registrada de Nextoy LLC. PaperGames no tiene ninguna relación con Nextoy LLC y usa en su lugar el nombre genérico Calcudoku.",
    calcudoku_history_names_p2: "Cada Calcudoku se crea en tu dispositivo: un cuadrado latino aleatorio se divide en jaulas, cada jaula recibe una operación con resultado entero y un solucionador integrado solo conserva las divisiones que dejan exactamente una solución."
});
I18n.markTextLoaded("es");
