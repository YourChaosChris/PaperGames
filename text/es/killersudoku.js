// text/es/killersudoku.js
// Rules and history texts of killersudoku (es). Loaded by killersudoku-rules.html and killersudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    sudoku_rules_basics_title: "La idea básica",
    sudoku_term_goal: "El objetivo",
    sudoku_term_input: "Introducir números",
    sudoku_rules_end_title: "Terminar un puzle",
    sudoku_term_win: "Resuelto",
    sudoku_term_difficulty: "Dificultad",
    puzzle_rules_hint: "El botón «Pista» ayuda en tres pasos. La primera pulsación marca dónde está el siguiente paso. La segunda da el motivo, es decir, la regla que se aplica allí. La tercera realiza el paso (anota el número o construye el puente). La pista parte de tu situación actual: si en algún sitio hay un número o un puente equivocado, te lo dice primero. Nunca adivina: si solo se puede seguir probando, lo dice con sinceridad. Las pistas son ilimitadas. Un pasatiempo resuelto con pistas cuenta igualmente como victoria; las estadísticas muestran además cuántas victorias fueron con pistas.",
    killersudoku_rules_title: "Reglas del Sudoku Killer",
    killersudoku_rules_intro: "Una referencia rápida de cómo juega PaperGames al Sudoku Killer, útil para repasar o aprender.",
    killersudoku_term_board: "La cuadrícula",
    killersudoku_rules_board: "Como en el Sudoku, líneas gruesas dividen la cuadrícula de 9x9 en nueve cajas de 3x3. Líneas punteadas la dividen además en jaulas de una a cinco casillas. Pocas casillas, o ninguna, vienen rellenas.",
    killersudoku_rules_goal: "Rellena cada casilla con una cifra del 1 al 9 para que cada fila, cada columna y cada caja de 3x3 contenga cada cifra exactamente una vez. Cada puzle que genera PaperGames tiene exactamente una solución.",
    killersudoku_term_regions: "Jaulas",
    killersudoku_rules_regions: "El pequeño número en la casilla superior izquierda de una jaula es su suma: las cifras de la jaula deben sumarlo. A diferencia del Calcudoku, ninguna cifra puede repetirse dentro de una jaula.",
    killersudoku_rules_input: "Selecciona una casilla y elige un número del teclado bajo el tablero (o escribe una cifra en un teclado). Una cifra en blanco sobre negro se repite en su fila, columna, caja o jaula, o completa una jaula con la suma equivocada.",
    killersudoku_rules_difficulty: "Los puzles fáciles tienen sobre todo jaulas pequeñas y algunas cifras dadas más; los difíciles tienen jaulas más grandes y solo las cifras necesarias para una solución única, a menudo casi ninguna.",
    killersudoku_rules_win: "El puzle está resuelto en cuanto todas las casillas están llenas y ninguna fila, columna, caja ni jaula incumple una regla.",
    killersudoku_history_title: "La historia del Sudoku Killer",
    killersudoku_history_origins_title: "Sumas sobre una cuadrícula de Sudoku",
    killersudoku_history_origins_p1: "Puzles que combinan las reglas del Sudoku con sumas de jaulas ya se publicaban en Japón en los años noventa, donde los pasatiempos de sumas como el Kakuro eran populares. La idea se extendió en 2005, cuando periódicos británicos empezaron a publicarlos con el nombre de Killer Sudoku durante la fiebre mundial del Sudoku.",
    killersudoku_history_origins_p2: "El nombre es descriptivo, no una marca: «killer» simplemente prometía un reto más duro que un Sudoku corriente, ya que hay pocas cifras, o ninguna, para empezar.",
    killersudoku_history_names_title: "Cómo se crean aquí los puzles",
    killersudoku_history_names_p1: "Cada Sudoku Killer empieza como una cuadrícula de Sudoku recién generada y completamente resuelta, que luego se divide en jaulas contiguas sin cifras repetidas en ninguna jaula.",
    killersudoku_history_names_p2: "Después, un solucionador integrado comprueba si las sumas de las jaulas solo permiten una solución. Si no, se revela como pista una cifra en la que dos soluciones posibles difieren, y la comprobación se repite hasta que queda exactamente una solución."
});
I18n.markTextLoaded("es");
