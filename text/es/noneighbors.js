// text/es/noneighbors.js
// Rules and history texts of noneighbors (es). Loaded by noneighbors-rules.html and noneighbors-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    sudoku_rules_basics_title: "La idea básica",
    sudoku_term_goal: "El objetivo",
    sudoku_term_input: "Introducir números",
    sudoku_rules_end_title: "Terminar un puzle",
    sudoku_term_win: "Resuelto",
    sudoku_term_difficulty: "Dificultad",
    puzzle_rules_hint: "El botón «Pista» ayuda en tres pasos. La primera pulsación marca dónde está el siguiente paso. La segunda da el motivo, es decir, la regla que se aplica allí. La tercera realiza el paso (anota el número o construye el puente). La pista parte de tu situación actual: si en algún sitio hay un número o un puente equivocado, te lo dice primero. Nunca adivina: si solo se puede seguir probando, lo dice con sinceridad. Las pistas son ilimitadas. Un pasatiempo resuelto con pistas cuenta igualmente como victoria; las estadísticas muestran además cuántas victorias fueron con pistas.",
    numberblocks_rules_title: "Reglas de Sin vecinos",
    numberblocks_rules_intro: "Una referencia rápida de cómo juega PaperGames a Sin vecinos, útil para repasar o aprender.",
    numberblocks_term_board: "La cuadrícula",
    numberblocks_rules_board: "Líneas gruesas dividen la cuadrícula en bloques de una a cinco casillas. Algunas casillas vienen rellenas (en negrita) y no se pueden cambiar.",
    numberblocks_rules_goal: "Rellena cada casilla vacía para que un bloque de n casillas contenga las cifras del 1 al n, cada una exactamente una vez: un bloque de tres casillas contiene 1, 2 y 3. Cada puzle que genera PaperGames tiene exactamente una solución.",
    numberblocks_term_regions: "La regla del contacto",
    numberblocks_rules_regions: "Dos cifras iguales nunca pueden tocarse: ni una al lado de otra, ni una encima de otra, ni en diagonal. Ninguna de las hasta ocho casillas alrededor de una cifra puede contener la misma cifra, aunque pertenezca a otro bloque.",
    numberblocks_rules_input: "Selecciona una casilla y elige un número del teclado bajo el tablero (o escribe una cifra en un teclado). Cuando una cifra se repite en su bloque, es demasiado grande para su bloque o toca la misma cifra, todas las casillas implicadas muestran su cifra en blanco sobre negro.",
    numberblocks_rules_difficulty: "Los puzles fáciles usan una cuadrícula de 6x6, los medios de 7x7 y los difíciles de 8x8, con menos cifras dadas en cada nivel.",
    numberblocks_rules_win: "El puzle está resuelto en cuanto todas las casillas están llenas sin romper la regla de los bloques ni la del contacto.",
    numberblocks_history_title: "La historia de Sin vecinos",
    numberblocks_history_origins_title: "El puzle de un inventor",
    numberblocks_history_origins_p1: "Sin vecinos fue inventado por el creador japonés de puzles Naoki Inaba, que lo publicó en 2001. Inaba ha creado muchísimos puzles lógicos, a menudo basados en una sola regla clara que lleva a razonamientos sorprendentemente profundos.",
    numberblocks_history_origins_p2: "El puzle une dos ideas conocidas: zonas que deben contener cada una un conjunto fijo de cifras, como las cajas del Sudoku, y una regla de vecindad tomada del rey del ajedrez: una cifra no puede repetirse en ninguna casilla a la que podría moverse un rey.",
    numberblocks_history_names_title: "Con otros nombres",
    numberblocks_history_names_p1: "El rompecabezas también se conoce internacionalmente como Suguru o Tectonic; esos nombres designan las mismas reglas de regiones y vecindad.",
    numberblocks_history_names_p2: "Cada puzle se crea en tu dispositivo: los bloques y una solución válida se construyen juntos casilla a casilla, y luego se quitan cifras una a una mientras un solucionador integrado siga encontrando exactamente una solución."
});
I18n.markTextLoaded("es");
