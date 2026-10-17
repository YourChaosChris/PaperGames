// text/es/bullsandcows.js
// Rules and history texts of bullsandcows (es). Loaded by bullsandcows-rules.html and bullsandcows-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    bullsandcows_rules_title: "Reglas de Toros y vacas",
    bullsandcows_rules_intro: "Una referencia rápida de cómo juega PaperGames a Toros y vacas, útil si estás oxidado, o si estás aprendiendo.",
    bullsandcows_rules_basics_title: "La idea básica",
    bullsandcows_term_code: "El código secreto",
    bullsandcows_rules_code: "Al comenzar una nueva partida, el ordenador elige un código oculto de cuatro posiciones, cada una con una de seis formas: círculo, cuadrado, triángulo, rombo, estrella o cruz. Según la dificultad, una misma forma puede aparecer más de una vez en el código.",
    bullsandcows_term_guess: "Hacer un intento",
    bullsandcows_rules_guess: "Toca una casilla para recorrer las seis formas y toca Enviar intento cuando las cuatro casillas muestren las formas que quieres probar. Un intento puede repetir una forma libremente, tenga o no repeticiones el propio código secreto.",
    bullsandcows_term_feedback: "Interpretar las pistas",
    bullsandcows_rules_feedback: "Cada intento recibe una fila de fichas: una ficha negra por cada forma correcta y en la posición correcta, y una ficha blanca por cada forma correcta pero en la posición equivocada. Por ejemplo, si el código es círculo-círculo-cuadrado-triángulo y tu intento es círculo-cuadrado-cuadrado-cuadrado, obtienes dos fichas negras (el primer círculo y el tercer cuadrado son exactamente correctos) y ninguna ficha blanca - a los cuadrados adicionales del intento no les queda nada en el código con lo que emparejarse. Las fichas nunca indican a qué casillas se refieren; averiguarlo es todo el reto.",
    bullsandcows_rules_end_title: "Terminar una partida",
    bullsandcows_term_win: "Ganar",
    bullsandcows_rules_win: "Ganas en el momento en que un intento consigue cuatro fichas negras - cada forma exactamente en su posición correcta.",
    bullsandcows_term_loss: "Quedarse sin intentos",
    bullsandcows_rules_loss: "Cada nivel de dificultad permite un número fijo de intentos. Si los usas todos sin descifrar el código, la partida termina ahí y se revela el código secreto.",
    bullsandcows_term_levels: "Niveles de dificultad",
    bullsandcows_rules_levels: "Fácil te da 12 intentos, pero el código secreto nunca repite una forma. Medio da 10 intentos y permite repeticiones, la forma tradicional de jugar. Difícil da solo 8 intentos y también permite repeticiones, así que hay que vigilar las formas duplicadas.",
    bullsandcows_history_title: "La historia de Toros y vacas",
    bullsandcows_history_origins_title: "Un clásico de lápiz y papel",
    bullsandcows_history_origins_p1: "La idea central - adivinar un código oculto y saber solo cuántas coincidencias exactas y parciales hay, nunca cuáles - viene de Bulls and Cows (Toros y vacas), un juego de adivinanzas con lápiz y papel que se jugaba mucho antes de 1970. Tradicionalmente se juega con números secretos: una cifra correcta en su sitio es un toro, una cifra correcta fuera de sitio es una vaca.",
    bullsandcows_history_origins_p2: "También fue uno de los primeros juegos escritos para ordenadores: versiones, a menudo llamadas Moo, funcionaban en ordenadores universitarios desde finales de los años sesenta, y programarlo sigue siendo un ejercicio clásico.",
    bullsandcows_history_spread_title: "El juego de tablero y el nombre",
    bullsandcows_history_spread_p1: "En 1970 la idea se convirtió en un juego de tablero con clavijas de colores, famoso en todo el mundo con el nombre de Mastermind. Mastermind es una marca; los derechos pertenecen a Invicta Plastics. PaperGames no tiene relación con Invicta Plastics ni con ese juego de tablero y por eso usa el nombre más antiguo, Bulls and Cows, Toros y vacas.",
    bullsandcows_history_modern_title: "Un rompecabezas favorito de los informáticos",
    bullsandcows_history_modern_p1: "Como se reduce a buscar una respuesta oculta con solo el recuento de coincidencias, el juego se convirtió en un caso de estudio habitual en informática y combinatoria para analizar estrategias de adivinanza y algoritmos de búsqueda.",
    bullsandcows_history_modern_p2: "En un conocido artículo de 1977, Donald Knuth demostró que la versión clásica de cuatro posiciones y seis símbolos siempre puede resolverse en cinco intentos como máximo con una estrategia óptima, un resultado que se sigue citando cuando se habla de búsqueda algorítmica."
});
I18n.markTextLoaded("es");
