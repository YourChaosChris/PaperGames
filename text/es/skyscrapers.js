// text/es/skyscrapers.js
// Rules and history texts of skyscrapers (es). Loaded by skyscrapers-rules.html and skyscrapers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    skyscrapers_rules_title: "Reglas de Rascacielos",
    skyscrapers_rules_intro: "Una referencia rápida de cómo juega PaperGames a Rascacielos (Skyscrapers) - útil si tienes que refrescar la memoria, o si lo estás aprendiendo.",
    skyscrapers_rules_basics_title: "La idea básica",
    skyscrapers_term_board: "La cuadrícula",
    skyscrapers_rules_board: "Cada casilla contiene la altura de un edificio, del 1 (el más bajo) al N (el más alto, siendo N el tamaño de la cuadrícula). Alrededor de la cuadrícula, algunas filas y columnas llevan un número de pista justo pasado ese borde - no necesariamente todas las filas o columnas, ni necesariamente en todos los lados.",
    skyscrapers_term_clues: "Cómo leer las pistas del borde",
    skyscrapers_rules_clues: "Una pista indica cuántos edificios se verían mirando hacia esa fila o columna desde ese lado, si un edificio más alto oculta por completo, desde ese punto de vista, a cualquier edificio más bajo situado delante de él. Las pistas de arriba miran su columna hacia abajo, las de abajo la miran hacia arriba, las de la izquierda miran su fila hacia la derecha, y las de la derecha la miran hacia la izquierda.",
    skyscrapers_term_goal: "El objetivo",
    skyscrapers_rules_goal: "Rellena cada casilla con una altura del 1 al N para que cada fila y cada columna contenga cada altura exactamente una vez (la misma regla que las filas y columnas del Sudoku, solo que sin regla de bloque), y que cada pista mostrada alrededor de la cuadrícula coincida con el número de edificios realmente visibles desde ese lado.",
    skyscrapers_term_input: "Introducir alturas",
    skyscrapers_rules_input: "Selecciona una casilla y luego elige una altura en el panel bajo el tablero (o teclea un dígito). Una casilla con el contorno discontinuo repite actualmente una altura ya usada en otra parte de su fila o columna - úsalo como aviso de que algo hay que cambiar.",
    skyscrapers_term_difficulty: "Dificultad",
    skyscrapers_rules_difficulty: "Los niveles Fácil, Medio y Difícil usan cuadrículas cada vez más grandes (4x4, 5x5 y 6x6) con cada vez menos pistas de borde reveladas - más alturas que manejar a la vez, pero siempre las mismas dos reglas.",
    skyscrapers_rules_example_title: "Un ejemplo resuelto",
    skyscrapers_term_example: "Contar edificios visibles",
    skyscrapers_rules_example_p1: "Toma una fila de cuatro edificios, alturas 3, 1, 4, 2, leída de izquierda a derecha. Mirando desde la izquierda: el 3 se ve primero, ya que nada más alto lo ha precedido. El 1 es más bajo que el 3 ya visto, así que queda oculto tras él. El 4 es más alto que todo lo anterior, así que también se ve. El 2 es más bajo que el 4, así que sigue oculto.",
    skyscrapers_rules_example_p2: "Eso son 2 edificios visibles desde la izquierda - el 3 y el 4 -, así que una pista izquierda de 2 encaja con esta fila. Mirando esa misma fila desde la derecha (leída en orden de visión 2, 4, 1, 3): el 2 se ve primero, el 4 es más alto así que también se ve, y tanto el 1 como el 3 que le siguen son más bajos que el 4 ya visto, así que ninguno se ve - una pista derecha de 2 también, aquí por pura coincidencia de esta fila en concreto.",
    skyscrapers_rules_end_title: "Terminar un puzle",
    skyscrapers_term_win: "Resuelto",
    skyscrapers_rules_win: "El puzle queda resuelto en cuanto la cuadrícula está completamente rellena, cada fila y columna contiene cada altura exactamente una vez, y cada pista del borde coincide con el número real de edificios visibles de su fila o columna.",
    skyscrapers_history_title: "La historia de Rascacielos",
    skyscrapers_history_origins_title: "Raíces en las revistas de pasatiempos",
    skyscrapers_history_origins_p1: "A diferencia del Sudoku, Rascacielos no tiene un único inventor bien documentado ni una fecha de primera publicación en la que coincidan los historiadores. Como muchos géneros de puzles lógicos, parece haber surgido y difundido gradualmente a través de la cultura de las revistas de pasatiempos, en lugar de atribuirse a un creador concreto en un momento determinado - la idea de la pista de visibilidad es lo bastante sencilla como para que más de un diseñador de puzles llegara a ella de forma independiente.",
    skyscrapers_history_origins_p2: "Lo que sí es seguro es la matemática que hay detrás: como el Sudoku, una cuadrícula de Rascacielos resuelta es un cuadrado latino - una cuadrícula en la que cada símbolo, aquí una altura de edificio, aparece exactamente una vez por fila y columna -, un objeto estudiado por Leonhard Euler en el siglo XVIII, mucho antes de que existiera ninguno de los dos puzles.",
    skyscrapers_history_spread_title: "Un puzle de competición",
    skyscrapers_history_spread_p1: "Rascacielos alcanzó su mayor reconocimiento internacional a través de la resolución de puzles en competición, en especial el Campeonato Mundial de Puzles (World Puzzle Championship), una competición internacional anual celebrada por primera vez en 1992, donde es uno de los muchos géneros estándar recurrentes junto a la familia del Sudoku y otros puzles basados en cuadrados latinos.",
    skyscrapers_history_spread_p2: "Ese entorno de competición ayudó a fijar las reglas y la presentación del puzle en la forma estándar que se juega hoy, incluso sin un inventor único reconocido - de forma parecida a como varios géneros de puzles recurrentes deben su forma definitiva menos a un solo creador que al uso repetido en revistas de pasatiempos y colecciones de puzles de campeonato.",
    skyscrapers_history_modern_title: "Cuadrados latinos, vistos desde fuera",
    skyscrapers_history_modern_p1: "Lo que hace a Rascacielos conceptualmente distintivo es cómo superpone una idea espacial y visual - mirar a lo largo de una fila de edificios y contar cuántos son lo bastante altos para verse - sobre una lógica ya familiar por las filas y columnas del Sudoku. Esa combinación es precisamente también lo que le da al puzle su nombre y su presentación temática, a diferencia de la simple cuadrícula de dígitos que presentan un Sudoku o un puzle de cuadrado latino desnudo.",
    skyscrapers_history_modern_p2: "Es también exactamente la propiedad en la que se apoya, a la inversa, el generador de PaperGames: dado que una pista de borde no es más que un dato calculado a partir de una cuadrícula terminada, cada puzle aquí se produce construyendo primero una cuadrícula completa y válida, calculando a partir de ella todas las pistas posibles y conservando después solo las suficientes para que la cuadrícula siga teniendo una única solución - el mismo enfoque de generar y luego reducir que usan los generadores de Sudoku y Kakuro de esta colección, adaptado a una restricción distinta."
});
I18n.markTextLoaded("es");
