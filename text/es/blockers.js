// text/es/blockers.js
// Rules and history texts of blockers (es). Loaded by blockers-rules.html and blockers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    bl_rules_title: "Reglas de Piedras de bloqueo",
    bl_rules_intro: "Una carrera de dados hasta lo alto del tablero, pero las piedras cierran el paso y puedes ponérselas delante a los demás.",
    bl_rules_basics_title: "Las reglas",
    bl_term_board: "El tablero",
    bl_rules_board: "Los caminos unen las casillas; la meta está arriba. Cada jugador tiene bajo el tablero una casa con 5 fichas y entra al tablero por su propia casilla de la fila de abajo, marcada con un anillo grueso. Al principio hay 6 piedras en los caminos.",
    bl_term_move: "Un turno",
    bl_rules_move: "Tira el dado y mueve una de tus fichas exactamente esa cantidad de casillas. Desde la casa, el primer paso va a tu casilla de entrada. Puedes girar en cualquier cruce, pero un movimiento no puede pisar dos veces la misma casilla. Si ninguna ficha puede usar la tirada, pasa el turno.",
    bl_term_stones: "Las piedras",
    bl_rules_stones: "Ninguna ficha puede pasar por encima de una piedra. Una ficha que cae exactamente en una piedra la coge y la pone en cualquier casilla libre, pero no en la fila de abajo ni en la meta. Tampoco se puede pasar de la meta: hay que llegar con el número exacto.",
    bl_term_hit: "Devolver a casa",
    bl_rules_hit: "Una ficha que cae justo en la ficha de otro jugador la manda de vuelta a su casa, pero solo en la mitad superior del tablero, donde las casillas son redondas. En la mitad inferior las casillas son cuadradas: allí las fichas están a salvo y ninguna jugada puede terminar en la ficha de otro jugador. Dos fichas tuyas no pueden estar en la misma casilla.",
    bl_term_win: "El ganador",
    bl_rules_win: "Cómo termina la partida se elige antes de jugar. «Una ficha en la meta» (por defecto): gana el primer jugador que lleva una ficha a la meta; todos tienen 5 fichas. «Todas las fichas en la meta»: todos tienen 3 o 5 fichas, según se elija; una ficha que llega a la meta sale del tablero y la meta queda libre de nuevo; en las tres últimas casillas antes de la meta no hay piedra. Gana el primer jugador con todas sus fichas en la meta, y los demás se clasifican según sus fichas en la meta.",
    bl_term_players: "Jugadores",
    bl_rules_players: "De 2 a 4 jugadores en un dispositivo; cualquiera de ellos puede jugarlo el ordenador (Fácil, Medio o Difícil). Las fichas se distinguen por su forma: círculo, triángulo, rombo y estrella.",
    bl_rules_example_title: "Una piedra en el camino",
    bl_rules_example: "La imagen muestra una ficha (círculo) delante de una piedra (cuadrado negro). Con un 2 cae en la piedra, la coge y la pone en otra casilla libre. Con un 3 no puede seguir recto, porque tendría que pasar por encima de la piedra.",
    bl_history_title: "La historia de Piedras de bloqueo",
    bl_history_origins_title: "Antiguos juegos de carreras",
    bl_history_origins_p1: "Los juegos de carreras, en los que las piezas avanzan con dados por un recorrido hacia una meta, están entre los juegos de tablero más antiguos; el Juego Real de Ur es el juego más antiguo cuyas reglas se han conservado. Devolver a casa y bloquear también son ideas antiguas: en el parchís indio (pachisi), una pieza que cae en una pieza rival la devuelve a la salida, y en el backgammon un muro de piezas en puntos consecutivos, llamado prime, retiene detrás las piezas del rival.",
    bl_history_modern_title: "Piedras de bloqueo en PaperGames",
    bl_history_modern_p1: "Piedras de bloqueo es un juego propio de PaperGames: una red de caminos con 49 casillas y la meta arriba, seis piedras y hasta cuatro jugadores. Una piedra alcanzada no se retira, sino que se vuelve a colocar, así que el camino a la meta cambia sin parar. Las casas entran al tablero por casillas igual de lejos de la meta, y las fichas se distinguen por la forma y no por el color, para que el juego funcione en tinta electrónica en blanco y negro."
});
I18n.markTextLoaded("es");
