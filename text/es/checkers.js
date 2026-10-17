// text/es/checkers.js
// Rules and history texts of checkers (es). Loaded by checkers-rules.html and checkers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    checkers_rules_title: "Reglas de las damas",
    checkers_rules_intro: "Una referencia rápida de cómo juega PaperGames a las damas (damas inglesas), útil si estás oxidado, o si estás aprendiendo.",
    checkers_rules_basics_title: "La idea básica",
    checkers_term_men: "Fichas",
    checkers_rules_men: "Negro y Blanco empiezan cada uno con 12 fichas en las casillas oscuras de sus tres filas traseras, y se mueven en diagonal hacia adelante una casilla cada vez, alternando turnos, Negro primero.",
    checkers_term_kings: "Damas",
    checkers_rules_kings: "Una ficha que llega a la fila trasera contraria se convierte en dama. Las damas se mueven en diagonal en cualquier dirección, siempre una casilla cada vez.",
    checkers_rules_capture_title: "Capturar",
    checkers_term_capture: "Captura",
    checkers_rules_capture: "Se captura saltando en diagonal sobre una ficha enemiga adyacente hasta la casilla vacía justo detrás de ella, retirando la ficha saltada.",
    checkers_term_mandatory: "Captura obligatoria",
    checkers_rules_mandatory: "Si hay alguna captura disponible, debes realizarla; una jugada tranquila es ilegal mientras exista una captura posible. Puedes elegir qué ficha captura si hay más de una que pueda hacerlo.",
    checkers_term_multijump: "Cadenas de capturas múltiples",
    checkers_rules_multijump: "Si al capturar quedas en una posición donde otra captura está inmediatamente disponible con la misma ficha, debes seguir saltando con ella hasta que ya no sea posible ninguna otra captura. Llegar a la fila trasera corona la ficha y termina su turno de inmediato, incluso a mitad de una cadena.",
    checkers_rules_end_title: "Cómo termina una partida",
    checkers_term_win: "Victoria",
    checkers_rules_win: "Ganas cuando tu oponente no tiene fichas restantes, o no tiene ninguna jugada legal disponible en su turno.",
    checkers_term_resignation: "Rendición",
    checkers_rules_resignation: "Un jugador puede rendirse en cualquier momento, terminando la partida de inmediato a favor del oponente.",
    checkers_term_draw: "Tablas",
    checkers_rules_draw: "Si pasan 40 jugadas seguidas sin que ningún bando capture, la partida es tablas.",
    checkers_history_title: "La historia de las damas",
    checkers_history_origins_title: "Un tablero antiguo, un juego medieval",
    checkers_history_origins_p1: "El tablero y la disposición inicial de las damas se remontan al Alquerque, un juego de captura practicado en un tablero cuadriculado de 5x5 conocido en Egipto y Oriente Medio desde hace más de 3000 años, y más tarde popular en la España musulmana.",
    checkers_history_origins_p2: "Hacia el siglo XII, en el sur de Francia, alguien combinó las capturas diagonales del Alquerque con un tablero de ajedrez, creando el \"Fierges\" o \"Jeu de Dames\": el antecesor directo del juego que se practica hoy.",
    checkers_history_spread_title: "De Francia al mundo",
    checkers_history_spread_p1: "El juego se extendió por Europa con muchos nombres —draughts en Inglaterra, dama en España, Dame en Alemania— y cruzó el Atlántico con los colonos, haciéndose especialmente popular en Estados Unidos, donde arraigaron el tablero de 8x8 y las reglas de captura obligatoria que usa esta app (damas americanas).",
    checkers_history_spread_p2: "Se han celebrado campeonatos nacionales y mundiales desde el siglo XIX, y el juego competitivo organizado en Gran Bretaña, Estados Unidos y otros lugares ha producido generaciones de jugadores célebres y aperturas muy estudiadas.",
    checkers_history_modern_title: "Un juego resuelto",
    checkers_history_modern_p1: "Las damas ocupan un lugar único en la teoría de juegos: en 2007, tras casi dos décadas de cálculo, el programa Chinook de Jonathan Schaeffer demostró que las damas terminan en tablas con un juego perfecto por ambos bandos: el juego más complejo resuelto de forma tan exhaustiva hasta la fecha.",
    checkers_history_modern_p2: "Eso no hace que las damas sean menos divertidas de jugar: al igual que un final resuelto en ajedrez, conocer el resultado teórico no cambia en nada la habilidad necesaria para llevar una partida real sobre el tablero."
});
I18n.markTextLoaded("es");
