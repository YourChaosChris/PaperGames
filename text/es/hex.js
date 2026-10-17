// text/es/hex.js
// Rules and history texts of hex (es). Loaded by hex-rules.html and hex-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    hex_rules_title: "Reglas del Hex",
    hex_rules_intro: "Una referencia rápida de cómo juega PaperGames al Hex, útil si estás oxidado, o si estás aprendiendo.",
    hex_rules_basics_title: "La idea básica",
    hex_term_setup: "La preparación",
    hex_rules_setup: "El tablero es un rombo de celdas hexagonales. Rojo posee los bordes superior e inferior, Azul posee los bordes izquierdo y derecho. Rojo mueve primero.",
    hex_term_moving: "Hacer un turno",
    hex_rules_moving: "En tu turno, coloca una piedra de tu propio color en cualquier celda vacía; no hay capturas y las piedras nunca se mueven una vez colocadas.",
    hex_term_win: "Victoria",
    hex_rules_win: "Construye una cadena ininterrumpida de piedras propias que conecte tus dos bordes. El Hex nunca puede terminar en tablas: una vez que el tablero está lleno, siempre existe garantizada la cadena de algún jugador, hayan intentado o no ambos bandos bloquear al otro.",
    hex_rules_end_title: "Una nota sobre estrategia",
    hex_term_blocking: "Atacar y defender son la misma jugada",
    hex_rules_blocking: "Como las tablas son imposibles, bloquear la conexión de tu oponente y construir la tuya propia son en realidad la misma tarea vista desde dos lados: una celda que ayuda a tu cadena muy a menudo también rompe la suya.",
    hex_history_title: "La historia del Hex",
    hex_history_origins_title: "Inventado dos veces",
    hex_history_origins_p1: "El Hex fue inventado por primera vez en 1942 por el matemático, poeta y diseñador danés Piet Hein, que lo presentó en Dinamarca con el nombre de \"Polygon\" tras preguntarse si un juego al estilo del mapa de cuatro colores podría terminar alguna vez en tablas.",
    hex_history_origins_p2: "Fue reinventado de forma independiente en 1948 por el matemático John Nash —más tarde premio Nobel de Economía y protagonista de la película Una mente maravillosa— mientras era estudiante de posgrado en Princeton, donde los estudiantes lo jugaban sobre las baldosas hexagonales del suelo de los baños y lo llamaban \"Nash\".",
    hex_history_origins_p3: "El juego alcanzó un público más amplio en 1957, cuando Martin Gardner escribió sobre él en su columna \"Juegos matemáticos\" de Scientific American, dándole el nombre de \"Hex\" que se le quedó desde entonces.",
    hex_history_math_title: "Un favorito de los matemáticos",
    hex_history_math_p1: "El Hex es un tema favorito en la teoría de juegos y la topología por un hecho limpio y demostrable: el juego nunca puede terminar en tablas —una consecuencia de las mismas matemáticas que hay detrás del teorema del punto fijo de Brouwer—, lo que también significa que un argumento de robo de estrategia demuestra que el primer jugador debe tener una estrategia ganadora, aunque nadie sepa en qué consiste realmente esa estrategia para tableros más grandes.",
    hex_history_math_p2: "Resolver el Hex por completo se vuelve dramáticamente más difícil a medida que crece el tablero: los tableros pequeños (hasta unos 10x10) se han resuelto por completo mediante búsqueda informática, pero el tamaño de torneo estándar de 11x11 y los mayores siguen sin resolver, lo que convierte al Hex en un objetivo continuo tanto para la investigación en IA de juegos como para la teoría combinatoria de juegos.",
    hex_history_version_title: "Esta versión",
    hex_history_version_p1: "PaperGames juega en un tablero de 9x9, un tamaño que mantiene las partidas cómodamente más cortas sin dejar de dar a las estrategias de conexión y de bloqueo un margen real para importar."
});
I18n.markTextLoaded("es");
