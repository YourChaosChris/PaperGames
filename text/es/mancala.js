// text/es/mancala.js
// Rules and history texts of mancala (es). Loaded by mancala-rules.html and mancala-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    mancala_rules_title: "Reglas del Mancala",
    mancala_rules_intro: "Una referencia rápida de la versión de PaperGames del Mancala, concretamente Kalaha, el conjunto de reglas estandarizado que usan la mayoría de los juegos de mancala digitales, útil si estás oxidado, o si estás aprendiendo.",
    mancala_rules_basics_title: "La idea básica",
    mancala_term_board: "Hoyos y almacenes",
    mancala_rules_board: "Cada jugador tiene seis hoyos en fila, empezando con 4 semillas cada uno, más un almacén en el extremo derecho de su propia fila. En tu turno, elige uno de tus hoyos no vacíos y siembra sus semillas una a una en cada hoyo siguiente, moviéndote en sentido antihorario alrededor de todo el tablero.",
    mancala_term_sowing: "Siembra",
    mancala_rules_sowing: "Sembrar deja una semilla en cada hoyo por el que pasas, incluido tu propio almacén, pero siempre salta por completo el almacén de tu oponente: nunca recibe una semilla desde tu jugada.",
    mancala_term_extra: "Turnos extra",
    mancala_rules_extra: "Si tu última semilla cae en tu propio almacén, juegas otra vez de inmediato.",
    mancala_rules_capture_title: "Capturar",
    mancala_term_capture: "Captura",
    mancala_rules_capture: "Si tu última semilla cae en uno de tus propios hoyos que estaba vacío antes de esa semilla, la capturas junto con todas las semillas del hoyo justo enfrente: todo va directo a tu almacén. Si el hoyo de enfrente está vacío, no se captura nada.",
    mancala_rules_end_title: "Cómo termina una partida",
    mancala_term_win: "Victoria",
    mancala_rules_win: "La partida termina en el momento en que los seis hoyos de un jugador quedan todos vacíos en su turno. Todas las semillas que quedan en el otro lado se barren hacia el almacén de ese jugador, y quien tenga más semillas en su almacén gana (un reparto igual es empate).",
    mancala_term_resignation: "Rendición",
    mancala_rules_resignation: "Un jugador puede rendirse en cualquier momento, terminando la partida de inmediato a favor del oponente.",
    mancala_history_title: "La historia del Mancala",
    mancala_history_origins_title: "Hoyos tallados en piedra",
    mancala_history_origins_p1: "Se han encontrado tableros de juegos de la familia mancala tallados directamente en piedra por toda África y Oriente Medio, algunos con una antigüedad estimada de más de mil años, aunque —como ocurre con muchos juegos antiguos— la datación y el origen exactos se debaten entre los historiadores.",
    mancala_history_origins_p2: "Lo que está claro es que los juegos de hoyos y semillas se extendieron y diversificaron enormemente a lo largo de los siglos, dando lugar a cientos de variantes regionales por África, Oriente Medio y Asia, desde el Oware y el Bao hasta el Congkak, cada una con su propio tamaño de tablero, número de semillas y reglas de captura, todas compartiendo la misma idea central de sembrar.",
    mancala_history_spread_title: "Una familia, incontables variantes",
    mancala_history_spread_p1: "A diferencia del ajedrez o el Go, que cada uno se asentaron en un único conjunto de reglas dominante a nivel mundial, los juegos de mancala nunca convergieron del todo: la familia se define más por su mecánica compartida —sembrar semillas una a una alrededor de un tablero de hoyos— que por ningún conjunto de reglas único y fijo.",
    mancala_history_spread_p2: "Esa variedad es parte de la razón por la que los juegos de mancala siguen profundamente arraigados en la cultura cotidiana de gran parte de África y Asia, jugados a menudo de forma casual en mercados y patios con nada más que un tablero rayado en el suelo y un puñado de semillas o piedrecitas.",
    mancala_history_modern_title: "Kalaha: un conjunto de reglas estandarizado",
    mancala_history_modern_p1: "El conjunto de reglas concreto que usa PaperGames —dos filas de seis hoyos, un almacén en cada extremo, capturar en un hoyo vacío, y un turno extra por caer en tu propio almacén— es el Kalaha, una variante de mancala que fue registrada como marca y popularizada como juego de mesa producido en masa en Estados Unidos a mediados del siglo XX.",
    mancala_history_modern_p2: "Las reglas limpias y precisamente definidas del Kalaha lo convirtieron pronto en algo natural para los ordenadores, y hoy es uno de los conjuntos de reglas de mancala más comunes en juegos y apps digitales de todo el mundo, incluido este."
});
I18n.markTextLoaded("es");
