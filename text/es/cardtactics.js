// text/es/cardtactics.js
// Rules and history texts of cardtactics (es). Loaded by cardtactics-rules.html and cardtactics-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    cardtactics_rules_title: "Reglas de Táctica de Cartas",
    cardtactics_rules_intro: "Una guía rápida sobre cómo PaperGames juega esta carrera por el tablero, guiada por cartas.",
    cardtactics_rules_basics_title: "La idea básica",
    cardtactics_term_setup: "Preparación",
    cardtactics_rules_setup: "El tablero tiene 7 filas y 6 columnas. Las seis piedras de las negras ocupan la fila inferior y las seis de las blancas, la superior. Empiezan las negras.",
    cardtactics_term_cards: "Cartas de movimiento",
    cardtactics_rules_cards: "Hay doce cartas de movimiento y todas están en juego. Tres están visibles debajo del tablero y pertenecen a ambos jugadores; las otras nueve esperan en una cola, y se muestran las dos siguientes. El diagrama de cada carta indica adónde puede ir una piedra desde la casilla central rayada. Cada jugador usa las cartas en su propia dirección, así que la página siempre muestra las cartas visibles desde el punto de vista de quien tiene el turno.",
    cardtactics_term_moving: "Hacer un movimiento",
    cardtactics_rules_moving: "Elige una de las tres cartas visibles, luego una de tus piedras y después una casilla permitida por la carta. Puedes ir a una casilla vacía o a una piedra enemiga, que capturas. Tus propias piedras bloquean el paso.",
    cardtactics_term_cycle: "La cola de cartas",
    cardtactics_rules_cycle: "La carta que usas va al final de la cola, y la primera carta de la cola ocupa su lugar entre las cartas visibles. Así siempre sabes cuál viene después.",
    cardtactics_term_opening: "Movimiento inicial",
    cardtactics_rules_opening: "El primer movimiento de la partida avanza una fila como máximo. Así se compensa la ventaja de empezar.",
    cardtactics_term_pass: "No hay movimientos posibles",
    cardtactics_rules_pass: "Si no puedes mover, pasas y la primera carta visible va al final de la cola.",
    cardtactics_rules_end_title: "Ganar la partida",
    cardtactics_term_win: "Dos piedras en casa",
    cardtactics_rules_win: "Una piedra que llega a la última fila del rival (la fila de meta) ha cruzado: sale del tablero y cuenta como llegada a casa; si hay una piedra enemiga allí, la capturas. Gana quien primero lleva dos piedras a casa. También ganas si al otro bando ya no le quedan dos piedras entre el tablero y casa.",
    cardtactics_term_limit: "Límite de movimientos",
    cardtactics_rules_limit: "Tras 120 movimientos, la partida termina: gana quien tenga más piedras en casa y, después, quien tenga más en el tablero; si no, hay empate.",
    cardtactics_history_title: "La historia de Táctica de Cartas",
    cardtactics_history_origins_title: "Carreras hacia el otro lado",
    cardtactics_history_origins_p1: "Llevar tus propias piezas al otro lado del tablero es un objetivo antiguo en los juegos de mesa. Halma, inventado en 1883 o 1884 por el cirujano estadounidense George Howard Monks, se gana al llevar primero todas tus piezas al campamento de la esquina opuesta.",
    cardtactics_history_origins_p2: "En Halma y en ajedrez, cada pieza siempre se mueve de la misma manera. En Táctica de Cartas, una piedra no tiene movimiento propio: las cartas visibles determinan los pasos posibles y ambos jugadores eligen entre las mismas cartas.",
    cardtactics_history_version_title: "Esta versión",
    cardtactics_history_version_p1: "PaperGames reescribió las reglas en octubre de 2026: un tablero de 7 filas por 6 columnas, seis piedras iguales por bando, una fila común de tres cartas visibles con una cola detrás y el objetivo de llevar dos piedras a casa. Las doce cartas y sus nombres son propios de PaperGames."
});
I18n.markTextLoaded("es");
