// text/es/yut.js
// Rules and history texts of yut (es). Loaded by yut-rules.html and yut-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    yut_rules_title: "Reglas de Yut",
    yut_rules_intro: "El juego coreano de carreras con lanzamiento de palos: lanza cuatro palos, lleva tus cuatro piezas una vez alrededor del tablero y a la meta antes que los demás.",
    yut_rules_basics_title: "Las reglas",
    yut_term_throw: "El lanzamiento",
    yut_rules_throw: "Se lanzan cuatro palos. Cuenta los lados planos hacia arriba: 1 es do 도 (1 paso), 2 es gae 개 (2 pasos), 3 es geol 걸 (3 pasos), 4 es yut 윷 (4 pasos) y ninguno es mo 모 (5 pasos). Yut y mo conceden otro lanzamiento. Si el único palo marcado es el único plano, el lanzamiento es backdo 빽도: un paso hacia atrás. Los lanzamientos no utilizados se guardan hasta que los uses. Un backdo en la primera casilla después de la salida devuelve la pieza a la salida, donde vuelve a esperar para entrar.",
    yut_term_move: "Un movimiento",
    yut_rules_move: "Elige uno de tus lanzamientos, luego una pieza y después la casilla de destino. Una pieza que espera en la salida entra al tablero con el lanzamiento. Las piezas en la misma casilla se mueven juntas como una pila. El circuito tiene 20 casillas; la salida y la meta están en la esquina inferior derecha.",
    yut_term_shortcuts: "Atajos",
    yut_rules_shortcuts: "Una pieza que comienza su movimiento en una de las dos esquinas marcadas en la parte superior puede tomar el atajo a través del tablero en lugar de seguir el circuito. Una pieza que se detiene en la casilla central va a la meta por el camino más corto; si llegó desde la esquina superior derecha, puede en cambio seguir recto hasta la esquina inferior izquierda. Pasar por una esquina sin detenerse en ella no permite tomar un atajo.",
    yut_term_capture: "Captura",
    yut_rules_capture: "Si caes en una casilla con piezas oponentes, estas vuelven a la salida y vuelves a lanzar. Tus propias piezas en la casilla se unen a ti formando una pila.",
    yut_term_finish: "La meta",
    yut_rules_finish: "Una pieza que pasa la casilla de salida llega a la meta. El primer jugador en llevar las cuatro piezas a la meta gana.",
    yut_term_players: "Jugadores",
    yut_rules_players: "De 2 a 4 jugadores. Juegas como A, los demás son manejados por la computadora, en nivel Fácil o Difícil. Las piezas se distinguen por su forma y letra: círculo A, cuadrado B, triángulo C, rombo D.",
    yut_history_title: "La historia de Yut",
    yut_history_origins_title: "Un juego folclórico coreano",
    yut_history_origins_p1: "Yut Nori (yunnori) es un juego tradicional de Corea. Las familias y los vecinos juegan juntos, especialmente en el Año Nuevo Lunar (Seollal). Su origen exacto es incierto; generalmente se cuenta entre los antiguos juegos folclóricos de Corea. Los lanzamientos tienen nombres de animales en la tradición coreana: do, gae, geol, yut y mo.",
    yut_history_modern_title: "Yut en PaperGames",
    yut_history_modern_p1: "PaperGames utiliza su propio diseño de tablero y sus propios textos. Las reglas siguen la versión común del juego: cuatro palos, cuatro piezas por jugador, atajos en las esquinas y un lanzamiento extra por yut, mo y capturas."
});
I18n.markTextLoaded("es");
