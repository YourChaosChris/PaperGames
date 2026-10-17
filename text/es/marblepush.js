// text/es/marblepush.js
// Rules and history texts of marblepush (es). Loaded by marblepush-rules.html and marblepush-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    marblepush_rules_title: "Reglas de Empuja canicas",
    marblepush_rules_intro: "Una referencia rápida de cómo juega PaperGames a Empuja canicas, útil si estás oxidado, o si estás aprendiendo.",
    marblepush_rules_basics_title: "La idea básica",
    marblepush_term_board: "El tablero",
    marblepush_rules_board: "Un hexágono de 61 casillas, dispuestas en filas de 5, 6, 7, 8, 9, 8, 7, 6, 5. Cada jugador empieza con 14 canicas: sus dos filas más cercanas completamente llenas, más las 3 casillas centrales de la siguiente fila. Las Negras mueven primero.",
    marblepush_term_move: "Mover una sola canica",
    marblepush_rules_single: "Selecciona una canica y deslízala a cualquier casilla vacía adyacente.",
    marblepush_term_line: "Mover una línea",
    marblepush_rules_line: "Selecciona 2 o 3 de tus propias canicas que estén en una línea recta e ininterrumpida, y mueve toda la línea un paso en cualquiera de las 6 direcciones del tablero. Hay dos tipos de movimiento de línea, descritos a continuación.",
    marblepush_term_broadside: "Movimiento lateral",
    marblepush_rules_broadside: "La línea se desplaza hacia un lado, fuera de su propio eje. Todas las casillas a las que se mueve la línea deben estar vacías - un movimiento lateral nunca puede empujar nada.",
    marblepush_term_inline: "Movimiento en línea",
    marblepush_rules_inline: "La línea se mueve a lo largo de su propio eje, en la dirección hacia la que apunta uno de sus dos extremos. Si la casilla justo delante está vacía, toda la línea simplemente se desliza hacia adelante.",
    marblepush_term_sumito: "El empuje",
    marblepush_rules_sumito: "Si la casilla justo delante de un movimiento en línea contiene canicas enemigas, puedes empujarlas - pero solo si tu línea es estrictamente más larga que la línea enemiga contigua que la bloquea (3 canicas pueden empujar 1 o 2; 2 canicas pueden empujar 1; 1 canica nunca puede empujar). También debe haber espacio para empujar: una casilla vacía justo después de la línea enemiga, o el borde del tablero. Si la línea enemiga llega al borde del tablero, su última canica queda eliminada - así es como se puntúa.",
    marblepush_rules_example_title: "Ejemplo resuelto: 3 canicas empujan 1",
    marblepush_rules_example_intro: "En el pequeño diagrama de abajo, ● son las Negras y ○ las Blancas. Las Negras tienen 3 canicas en fila (A, B, C) frente a una sola canica blanca (D), con una casilla vacía (E) - o el borde del tablero - justo detrás.",
    marblepush_rules_example_caption: "La línea de 3 negras (A, B, C) supera en número a la canica blanca solitaria (D), y la casilla E está vacía - así que las Negras pueden empujar: toda la línea avanza un paso, D es empujada hacia E, y la línea negra termina ocupando B, C y la antigua casilla de D. Si E hubiera sido el borde del tablero, D habría quedado eliminada por completo.",
    marblepush_rules_end_title: "Cómo termina una partida",
    marblepush_term_win: "Victoria",
    marblepush_rules_win: "Gana el primer jugador que empuje 6 canicas del oponente fuera del tablero.",
    marblepush_term_resignation: "Rendición",
    marblepush_rules_resignation: "Un jugador puede rendirse en cualquier momento, terminando la partida de inmediato a favor del oponente.",
    marblepush_history_title: "La historia de Empuja canicas",
    marblepush_history_origins_title: "Juegos de empuje en tableros hexagonales",
    marblepush_history_origins_p1: "Los juegos en los que las piezas se empujan en lugar de saltarse o capturarse en su casilla tienen una larga tradición, igual que los tableros hexagonales: cada casilla tiene seis vecinas en vez de cuatro, lo que da a cada pieza más direcciones y evita las incómodas diagonales de una cuadrícula.",
    marblepush_history_origins_p2: "Empuja canicas pertenece a esa familia. Las canicas son sencillas y todas iguales, y todo el juego se basa en una sola idea: una línea de canicas más larga puede empujar a una más corta.",
    marblepush_history_award_title: "Una regla, mucha profundidad",
    marblepush_history_award_p1: "Como una canica solo se pierde si una línea estrictamente más larga la saca del tablero, nada importa más que mantener las canicas juntas en grupos sólidos. Una canica sola nunca puede empujar, y un grupo junto al borde siempre está en peligro.",
    marblepush_history_award_p2: "Así cada partida se convierte en una lenta lucha por el centro: quien domina el medio puede empujar hacia fuera en todas las direcciones, mientras el otro es arrinconado contra el borde.",
    marblepush_history_legacy_title: "Un juego sin suerte",
    marblepush_history_legacy_p1: "No hay dados, ni información oculta, ni piezas especiales: solo dos juegos de canicas idénticas y unas pocas reglas sencillas sobre qué línea puede empujar a cuál. Eso lo convierte en una prueba pura de planificación, en el espíritu de clásicos más antiguos como el go y las damas."
});
I18n.markTextLoaded("es");
