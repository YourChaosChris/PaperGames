// text/es/surakarta.js
// Rules and history texts of surakarta (es). Loaded by surakarta-rules.html and surakarta-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    surakarta_rules_title: "Reglas de Surakarta",
    surakarta_rules_intro: "Una referencia rápida de cómo PaperGames juega al Surakarta - útil si estás oxidado o lo estás aprendiendo. La captura por bucle es lo que casi todo el mundo encuentra confuso al principio, así que hay un ejemplo completo más abajo.",
    surakarta_rules_basics_title: "La idea básica",
    surakarta_term_board: "El tablero",
    surakarta_rules_board: "Una simple cuadrícula de puntos 6x6. Cada jugador empieza con 12 fichas que llenan las dos filas más cercanas a su propio lado (Negras en las dos filas superiores, Blancas en las dos inferiores), y las dos filas centrales quedan vacías. Las Negras mueven primero.",
    surakarta_term_movement: "Mover",
    surakarta_rules_movement: "En tu turno, desliza una ficha un solo paso hacia un punto vacío adyacente - en línea recta o en diagonal, en cualquiera de las 8 direcciones. Un paso así siempre es silencioso: nunca captura nada, aunque caiga justo al lado de una ficha enemiga.",
    surakarta_term_loop: "Los bucles",
    surakarta_rules_loop: "Cuatro líneas del tablero - la 2ª y la 5ª fila, y la 2ª y la 5ª columna - no terminan simplemente en el borde: cada extremo de estas cuatro líneas se curva hacia fuera y se conecta con el extremo más cercano de la línea especial vecina en esa misma esquina, formando un bucle alrededor de cada una de las 4 esquinas del tablero. Una ficha que se desliza por una de estas cuatro líneas puede tomar un bucle al salir por un borde y reaparecer avanzando por la línea conectada, siempre en línea recta, hasta donde la pista y otros bucles lo permitan.",
    surakarta_term_capture: "Capturar",
    surakarta_rules_capture: "Capturar es completamente distinto de mover, y solo funciona a través de los bucles. En lugar de dar un solo paso, una ficha puede deslizarse por completo en una de sus 8 direcciones - pasando por encima de cualquier otra ficha, propia o enemiga, sin efecto - todo lo que la línea y sus conexiones de bucle le permitan. En el momento en que haya recorrido al menos un bucle Y la siguiente ficha que encuentre sea enemiga, esa ficha es capturada y la ficha que se desliza aterriza en su casilla, terminando el movimiento ahí mismo. Si la línea sale del tablero sin un bucle que la continúe, o si da toda la vuelta sin encontrar nunca una ficha enemiga válida, no hay captura por ese camino. Capturar es opcional aquí: incluso con una captura disponible, puedes jugar un paso silencioso en su lugar.",
    surakarta_rules_example_title: "Ejemplo resuelto: una captura por bucle",
    surakarta_rules_example_intro: "○ es Blancas (la ficha que se mueve en este ejemplo), ● es Negras. La ficha blanca en A está sobre una de las cuatro líneas que llevan bucle. Nada la bloquea hasta el borde, así que en lugar de un paso silencioso, Blancas juega una deslizada de captura completa.",
    surakarta_rules_example_caption: "La ficha blanca en A se desliza a la izquierda a lo largo de la fila. Sale por el borde, recorre el bucle alrededor de la esquina, y reaparece bajando por la columna conectada. La primera ficha que encuentra tras usar ese bucle es la ficha negra en B - así que B es capturada, y la ficha blanca aterriza en su casilla ahora vacía (círculo discontinuo). Si A hubiera estado a solo un paso de una ficha enemiga sin que hubiera ningún bucle de por medio, ese enemigo adyacente NO habría sido capturado - solo una deslizada que realmente use un bucle puede capturar.",
    surakarta_rules_end_title: "Cómo termina una partida",
    surakarta_term_win: "Ganar",
    surakarta_rules_win: "Ganas capturando todas las fichas de tu oponente, o si tu oponente no tiene ningún movimiento legal en su turno.",
    surakarta_term_resignation: "Rendición",
    surakarta_rules_resignation: "Un jugador puede rendirse en cualquier momento, terminando la partida de inmediato a favor del oponente.",
    surakarta_history_title: "La historia de Surakarta",
    surakarta_history_origins_title: "Nombrado por una ciudad de Java",
    surakarta_history_origins_p1: "Surakarta - también muy conocida por su nombre más cotidiano, Solo - es una ciudad del centro de Java, Indonesia, y se cree tradicionalmente que el juego que lleva su nombre se originó allí. Como ocurre con muchos juegos de tablero tradicionales transmitidos sobre todo mediante la práctica y no por registros escritos, su edad exacta y los detalles de su historia temprana no están documentados con precisión; lo que sí está claro es que se ha jugado en la región durante muchísimo tiempo y sigue muy asociado a la ciudad hoy en día.",
    surakarta_history_unique_title: "Un ejemplo favorito de regla de captura «no evidente»",
    surakarta_history_unique_p1: "Surakarta es inusual, incluso entre los juegos tradicionales, por separar el movimiento y la captura en dos mecánicas completamente distintas: un movimiento silencioso normal es solo un paso a un punto vecino, mientras que toda captura depende por completo de los característicos bucles de las esquinas del tablero - una ficha sin ninguna línea apta para un bucle simplemente no puede capturar ese turno, por muy rodeada que esté. Esa separación tan marcada, y el hecho de que una ficha pueda estar justo al lado de una pieza enemiga con total seguridad, es exactamente lo que hace que el juego encaje una vez se entiende - y exactamente lo que lo convierte en un ejemplo citado con frecuencia en los debates de diseño de juegos sobre mecánicas de captura que no son evidentes a simple vista.",
    surakarta_history_modern_title: "Todavía se juega hoy",
    surakarta_history_modern_p1: "Surakarta sigue siendo parte viva de la cultura tradicional de juegos indonesia y también ha viajado mucho más allá: es un tema recurrente en los círculos aficionados a los juegos abstractos y en la investigación de juegos por computadora precisamente porque su regla de captura es tan distintiva, y ha aparecido en recopilaciones generales de juegos de mesa y en ejercicios de programación de juegos como un ejemplo compacto y autocontenido de una mecánica sin apenas equivalente en el canon de los juegos de tablero tradicionales."
});
I18n.markTextLoaded("es");
