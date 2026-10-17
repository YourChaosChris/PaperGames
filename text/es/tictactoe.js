// text/es/tictactoe.js
// Rules and history texts of tictactoe (es). Loaded by tictactoe-rules.html and tictactoe-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    tictactoe_rules_title: "Reglas del tres en raya",
    tictactoe_rules_intro: "Un resumen rápido de cómo juega PaperGames al tres en raya, también llamado tic-tac-toe.",
    tictactoe_rules_basics_title: "La idea básica",
    tictactoe_term_board: "El tablero y las marcas",
    tictactoe_rules_board: "El tablero es una cuadrícula de 3x3 con nueve casillas. Por turnos, cada jugador pone su marca en una casilla vacía: una cruz el jugador 1, un círculo el jugador 2. El jugador 1 siempre empieza. Una marca se queda donde está hasta el final de la partida.",
    tictactoe_rules_end_title: "Cómo termina una partida",
    tictactoe_term_win: "Victoria",
    tictactoe_rules_win: "El primero que consigue tres marcas propias en línea – en horizontal, en vertical o en diagonal – gana al instante. La línea ganadora se muestra en negro.",
    tictactoe_term_draw: "Empate",
    tictactoe_rules_draw: "Si las nueve casillas están ocupadas y nadie tiene tres en línea, la partida termina en empate. Dos jugadores que no cometen errores siempre empatan; por eso en el nivel Difícil el ordenador nunca pierde, y lo máximo que se le puede sacar es un empate.",
    tictactoe_term_resignation: "Abandono",
    tictactoe_rules_resignation: "Un jugador puede abandonar en cualquier momento, lo que termina la partida de inmediato a favor del rival.",
    tictactoe_rules_hard_title: "El nivel Difícil",
    tictactoe_rules_hard: "En Difícil, el ordenador analiza todas las continuaciones posibles y nunca comete un error. Para el tablero de 3x3 está demostrado – comprobando todas las partidas posibles – que dos jugadores sin errores siempre empatan. Contra este nivel, lo máximo que puedes conseguir es un empate; un solo error y pierdes.",
    tictactoe_history_title: "La historia del tres en raya",
    tictactoe_history_origins_title: "Tres piedrecitas en Roma",
    tictactoe_history_origins_p1: "Un antecesor se jugaba en el Imperio romano hacia el siglo I a. C. con el nombre de terni lapilli, «tres piedrecitas cada vez». Cada jugador tenía solo tres piezas; cuando estaban todas en el tablero, se movían a puntos vacíos para seguir jugando.",
    tictactoe_history_origins_p2: "Se han encontrado cuadrículas del juego en muchos lugares de Roma.",
    tictactoe_history_spread_title: "Noughts and Crosses, Tic-Tac-Toe",
    tictactoe_history_spread_p1: "El juego ha tenido muchos nombres. El nombre británico «noughts and crosses» (ceros y cruces) aparece impreso por primera vez en 1858, en la revista Notes and Queries.",
    tictactoe_history_spread_p2: "En Estados Unidos se impuso durante el siglo XX el nombre de tic-tac-toe. Quizá venga de «tick-tack», una antigua forma de backgammon descrita ya en 1558.",
    tictactoe_history_modern_title: "Uno de los primeros juegos de ordenador",
    tictactoe_history_modern_p1: "En 1952, A. S. (Sandy) Douglas escribió OXO para el ordenador EDSAC de la Universidad de Cambridge, como parte de su tesis doctoral sobre la interacción entre personas y ordenadores. La casilla se elegía con un disco de teléfono y el ordenador jugaba a la perfección. OXO se cuenta entre los primeros videojuegos conocidos.",
    tictactoe_history_modern_p2: "El juego es lo bastante pequeño para calcularlo por completo: sin contar giros y reflejos hay 26 830 partidas posibles, y con un juego perfecto todas terminan en empate. Eso es justo lo que hace aquí el nivel Difícil: antes de cada jugada examina todas las continuaciones posibles."
});
I18n.markTextLoaded("es");
