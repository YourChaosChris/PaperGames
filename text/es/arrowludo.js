// text/es/arrowludo.js
// Rules and history texts of arrowludo (es). Loaded by arrowludo-rules.html and arrowludo-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    arrowludo_rules_title: "Reglas de Ludo con flechas",
    arrowludo_rules_intro: "Ludo con atajo: el tablero tiene flechas por el medio. Lleva tus cuatro fichas por el recorrido hasta la meta antes que los demás.",
    arrowludo_rules_basics_title: "Las reglas",
    arrowludo_term_ludo: "Como el Ludo",
    arrowludo_rules_ludo: "Cada jugador tiene 4 fichas. Tira el dado y mueve una ficha según el número obtenido. Una ficha entra en juego solo con un 6, y un 6 da otra tirada (tres 6 seguidos hacen perder el turno). Caer en la ficha de un rival la devuelve a su casa, salvo en las casillas seguras marcadas. Dos fichas de un color en una casilla forman un bloqueo que los rivales no pueden pisar ni pasar. A la meta hay que llegar con tirada exacta.",
    arrowludo_term_arrow: "Las casillas de flecha",
    arrowludo_rules_arrow: "Cada color tiene una casilla de flecha: la 4.ª casilla después de su salida, en el extremo interior de su brazo, junto al centro. Las cuatro casillas de flecha están marcadas con una flecha que apunta al centro, y dos líneas con puntas de flecha cruzan el tablero y unen las casillas opuestas.",
    arrowludo_term_flight: "El vuelo",
    arrowludo_rules_flight: "Cada vez que una ficha termina su movimiento en una casilla de flecha (la suya o la de otro color, en la primera vuelta o más tarde), vuela de inmediato en diagonal por el medio hasta la casilla de flecha opuesta, a 26 casillas. En la primera mitad de su camino (su propia casilla de flecha y la siguiente) eso la adelanta 26 casillas; en la segunda mitad la casilla opuesta queda detrás, así que vuela hacia atrás y tiene que recorrer otra vez ese tramo. El vuelo termina en esa casilla y no provoca otro. Una ficha rival en la casilla de flecha o en la casilla de llegada se envía a casa; si dos fichas rivales bloquean la casilla de llegada, no puedes hacer ese movimiento. Un vuelo nunca sale del recorrido común, así que ninguna ficha se salta su camino a la meta. Pasar por una casilla de flecha sin detenerse en ella no hace nada. Después de un vuelo, la casilla de flecha de salida, la de llegada y la línea entre ambas quedan marcadas hasta el siguiente movimiento.",
    arrowludo_term_players: "Jugadores",
    arrowludo_rules_players: "De 2 a 4 jugadores en el tablero clásico. Tú juegas un color y el ordenador juega los demás (Fácil, Medio o Difícil), o todos juegan en un solo dispositivo. El botón Pista muestra un buen movimiento para tu tirada. Cada color tiene su propia forma, para poder jugar sin colores: rojo círculo lleno, verde círculo abierto, amarillo triángulo, azul cuadrado abierto.",
    arrowludo_history_title: "La historia del Ludo con flechas",
    arrowludo_history_origins_title: "Del Pachisi al Ludo",
    arrowludo_history_origins_p1: "El Ludo es la forma moderna y sencilla del Pachisi, un juego de carreras de la India que se juega desde hace muchos siglos. Los jugadores mueven fichas por un tablero en forma de cruz, se mandan las fichas a casa unos a otros y corren hacia el centro. Con el tiempo, familias y jugadores de todas partes han inventado reglas propias, entre ellas atajos por el medio.",
    arrowludo_history_modern_title: "El Ludo con flechas en PaperGames",
    arrowludo_history_modern_p1: "El Ludo con flechas es la versión de PaperGames de una antigua regla familiar: las casillas de flecha junto al centro envían una ficha a través del tablero, unas veces hacia delante y otras hacia atrás. El dibujo del tablero y los textos son nuestros. El Ludo normal sigue siendo un juego aparte."
});
I18n.markTextLoaded("es");
