// text/es/fanorona.js
// Rules and history texts of fanorona (es). Loaded by fanorona-rules.html and fanorona-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    fanorona_rules_title: "Reglas del Fanorona",
    fanorona_rules_intro: "Una referencia rápida de cómo juega PaperGames al Fanorona - útil si estás oxidado o lo estás aprendiendo.",
    fanorona_rules_basics_title: "La idea básica",
    fanorona_term_board: "El tablero",
    fanorona_rules_board: "45 puntos en una cuadrícula de 5x9, conectados por líneas horizontales, verticales y algunas diagonales - las diagonales alternan de dirección de una celda a otra, así que cerca de la mitad de los puntos ('puntos fuertes') se conectan con sus 8 vecinos, mientras que el resto ('puntos débiles') solo se conectan en horizontal y vertical. Cada jugador empieza con 22 fichas, ocupando sus dos filas más cercanas más la mitad de la fila central en alternancia, dejando vacío el punto central exacto. Las blancas mueven primero.",
    fanorona_term_capture: "Capturar",
    fanorona_rules_capture: "Desliza una ficha por una línea hasta un punto vacío adyacente. Según la dirección del movimiento, esto puede capturar una línea recta de fichas enemigas por aproximación, por retirada, o (si ambas son posibles) a tu elección - ver los ejemplos de abajo. Capturar es obligatorio: si hay algún movimiento de captura disponible en cualquier parte del tablero, debes jugarlo en lugar de un movimiento tranquilo (paika).",
    fanorona_term_approach: "Captura por aproximación",
    fanorona_rules_approach: "Mueve una ficha de modo que el punto justo más allá de su nueva posición, en la misma dirección en la que te acabas de mover, tenga una ficha enemiga. Esa ficha, y toda ficha enemiga justo detrás de ella en línea ininterrumpida, es capturada.",
    fanorona_term_withdrawal: "Captura por retirada",
    fanorona_rules_withdrawal: "Aleja una ficha de una ficha enemiga que estaba justo detrás de su posición anterior, en la dirección exactamente opuesta a tu movimiento. Esa ficha, y toda ficha enemiga justo detrás de ella en línea ininterrumpida, es capturada.",
    fanorona_rules_example_title: "Ejemplo resuelto",
    fanorona_rules_example_intro: "En los pequeños diagramas de abajo, ● son las blancas, ○ las negras, y el círculo discontinuo es el punto al que las blancas están a punto de moverse.",
    fanorona_rules_example_approach_caption: "Aproximación: las blancas juegan A→B. Como hay fichas negras en la continuación de esa misma línea justo más allá de B, quedan capturadas.",
    fanorona_rules_example_withdrawal_caption: "Retirada: las blancas juegan A→B, alejándose directamente de fichas negras que estaban detrás de A. Como las blancas se alejan de ellas por esa misma línea, también quedan capturadas.",
    fanorona_term_chain: "Encadenar capturas",
    fanorona_rules_chain: "Tras capturar, la misma ficha puede seguir capturando desde su nueva posición - pero, a diferencia de las damas, nunca estás obligado: puedes detenerte después de cualquier captura. Mientras encadenas se aplican dos reglas adicionales: la ficha no puede moverse dos veces seguidas en exactamente la misma dirección, y nunca puede caer en un punto que ya haya visitado antes en ese mismo turno.",
    fanorona_rules_end_title: "Cómo termina una partida",
    fanorona_term_win: "Ganar",
    fanorona_rules_win: "Ganas capturando todas las fichas de tu oponente, o si tu oponente no tiene ningún movimiento legal en su turno.",
    fanorona_term_resignation: "Rendición",
    fanorona_rules_resignation: "Un jugador puede rendirse en cualquier momento, terminando la partida de inmediato a favor del oponente.",
    fanorona_history_title: "La historia del Fanorona",
    fanorona_history_origins_title: "Del Alquerque a las tierras altas de Madagascar",
    fanorona_history_origins_p1: "Se cree que el Fanorona desciende del Alquerque, un antiquísimo juego de captura por salto que probablemente llegó a Madagascar con comerciantes árabes o del sudeste asiático. El Alquerque es también el antepasado común de las damas, lo que convierte al Fanorona y a las damas en primos lejanos: ambos conservaron la idea básica de capturar saltando, pero desarrollaron por separado reglas muy diferentes.",
    fanorona_history_origins_p2: "Los jugadores malgaches transformaron el juego importado en algo propio y distintivo: un tablero más grande de 5x9 con una mezcla de líneas ortogonales y diagonales, y el sistema de captura por aproximación/retirada, que no tiene equivalente ni en el Alquerque ni en las damas. Algunos de los tableros de Fanorona más antiguos que se conservan, tallados en piedra cerca de Antananarivo, se estiman de los siglos XVI o XVII.",
    fanorona_history_legend_title: "Una partida que (según dicen) decidió un trono",
    fanorona_history_legend_p1: "Según una conocida leyenda malgache, el rey Ralambo puso a prueba a sus dos hijos para ver cuál era más apto para sucederlo: fingió estar gravemente enfermo y los mandó llamar, para ver cuál llegaba primero. Se dice que el hijo mayor, absorto en una difícil posición de Fanorona, se quedó a terminar la partida, de modo que su hermano menor llegó primero y, según la historia, acabó heredando el trono. Como ocurre con la mayoría de las tradiciones orales transmitidas durante siglos, los detalles varían según la versión y el episodio no puede verificarse como hecho histórico, pero todavía se cita hoy como muestra de lo en serio que se ha tomado siempre el Fanorona en Madagascar.",
    fanorona_history_modern_title: "Todavía el juego de Madagascar",
    fanorona_history_modern_p1: "El Fanorona se sigue jugando ampliamente en Madagascar hoy en día y a menudo se describe como el juego de mesa nacional del país, practicado de forma casual en pueblos y ciudades y también estudiado de manera competitiva. Existen variantes más pequeñas - una versión 3x3 (Fanoron-Telo, con una profundidad similar al tres en raya) y una versión 5x5 (Fanoron-Dimy) -, pero el tablero de 5x9 descrito en esta página (Fanoron-Tsivy) es la forma estándar y más conocida.",
    fanorona_history_modern_p2: "El juego también ha despertado interés académico real: un análisis por ordenador publicado en 2008 resolvió débilmente el Fanorona, estableciendo que una partida jugada a la perfección termina en tablas - situándolo en la misma compañía poco frecuente que las damas, otro juego antiguo resuelto con precisión por ordenadores modernos."
});
I18n.markTextLoaded("es");
