// text/es/gomoku.js
// Rules and history texts of gomoku (es). Loaded by gomoku-rules.html and gomoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    gomoku_rules_title: "Reglas del Gomoku",
    gomoku_rules_intro: "Una referencia rápida de cómo juega PaperGames al Gomoku (cinco en raya), útil si estás oxidado, o si estás aprendiendo.",
    gomoku_rules_basics_title: "La idea básica",
    gomoku_term_board: "El tablero y colocar piedras",
    gomoku_rules_board: "Las piedras se colocan en las intersecciones de una cuadrícula de 15x15, igual que en el Go: nunca se mueven una vez colocadas, y nunca se capturan. Negro siempre mueve primero.",
    gomoku_rules_end_title: "Cómo termina una partida",
    gomoku_term_win: "Victoria",
    gomoku_rules_win: "El primer jugador en conseguir cinco o más piedras propias en línea continua —horizontal, vertical o diagonal— gana de inmediato.",
    gomoku_term_draw: "Tablas",
    gomoku_rules_draw: "Si el tablero se llena por completo sin que ningún bando consiga cinco en línea, la partida es tablas.",
    gomoku_term_resignation: "Rendición",
    gomoku_rules_resignation: "Un jugador puede rendirse en cualquier momento, terminando la partida de inmediato a favor del oponente.",
    gomoku_history_title: "La historia del Gomoku",
    gomoku_history_origins_title: "Raíces antiguas, nombre moderno",
    gomoku_history_origins_p1: "Los juegos basados en alinear piedras en una cuadrícula se remontan siglos atrás por todo el este asiático; las reglas concretas que hoy se conocen como Gomoku tomaron forma en Japón, donde su nombre (五目並べ, gomokunarabe) significa simplemente \"cinco puntos en fila\".",
    gomoku_history_origins_p2: "Tradicionalmente se juega con las mismas piedras blancas y negras y el mismo tablero de cuadrícula que el Go, lo que lo convirtió en una variante fácil y con poco equipamiento que generaciones de jugadores de Go adoptaron como pasatiempo rápido.",
    gomoku_history_spread_title: "De pasatiempo casual a Renju",
    gomoku_history_spread_p1: "Como las reglas simples del Gomoku dan al primer jugador (tradicionalmente Negro) una ventaja incorporada considerable, a principios del siglo XX surgió en Japón una variante competitiva más estricta llamada Renju, que añadía restricciones adicionales —prohibiendo a Negro ciertas configuraciones de doble tres o doble cuatro— para equilibrar el juego.",
    gomoku_history_spread_p2: "El Renju se convirtió en el estándar para el juego de torneo serio, mientras que el conjunto de reglas más simple y sin restricciones que se juega aquí (a menudo llamado Gomoku \"libre\") siguió siendo la versión casual más común en todo el mundo.",
    gomoku_history_modern_title: "Una victoria del primer jugador resuelta",
    gomoku_history_modern_p1: "En 1994, el investigador L. Victor Allis demostró mediante un análisis informático exhaustivo (una técnica llamada búsqueda por número de prueba) que el Gomoku libre en un tablero estándar es una victoria forzada para el primer jugador con un juego perfecto.",
    gomoku_history_modern_p2: "Ese resultado es exactamente la razón por la que existe el Renju competitivo: sin sus restricciones adicionales sobre Negro, el Gomoku de torneo sería una formalidad ya resuelta en lugar de una competición real: un caso poco frecuente en el que un juego resuelto cambió directamente la forma en que se practica a nivel competitivo, en lugar de ser solo una curiosidad."
});
I18n.markTextLoaded("es");
