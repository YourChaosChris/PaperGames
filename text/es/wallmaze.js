// text/es/wallmaze.js
// Rules and history texts of wallmaze (es). Loaded by wallmaze-rules.html and wallmaze-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    wallmaze_rules_title: "Reglas del Laberinto de Muros",
    wallmaze_rules_intro: "Una referencia rápida de cómo PaperGames juega al Laberinto de Muros - útil si estás oxidado o si lo estás aprendiendo.",
    wallmaze_rules_basics_title: "La idea básica",
    wallmaze_term_setup: "La preparación",
    wallmaze_rules_setup: "Cada jugador tiene un peón, que empieza en el medio de su propio borde de un tablero de 9x9, y diez muros en reserva. El Jugador 1 apunta a la fila del fondo, el Jugador 2 a la fila superior; quien lleve antes su peón hasta allí gana.",
    wallmaze_term_moving: "Mover tu peón",
    wallmaze_rules_moving: "En tu turno, o mueves tu peón una casilla arriba, abajo, izquierda o derecha, o colocas un muro. Si los dos peones están adyacentes, puedes saltar directamente sobre el otro peón; si un muro o el borde del tablero bloquea ese salto, puedes en su lugar rodearlo dando un paso en diagonal.",
    wallmaze_term_walls: "Colocar muros",
    wallmaze_rules_walls: "Un muro mide dos casillas de largo y bloquea el movimiento en línea recta a través de él, para ambos jugadores. Los muros nunca pueden solaparse ni cruzarse con otro muro, y un muro nunca se puede colocar si sellaría el último camino restante de cualquiera de los jugadores hacia su fila de meta: siempre queda al menos una vía libre.",
    wallmaze_rules_end_title: "Ganar la partida",
    wallmaze_term_win: "Cómo termina la partida",
    wallmaze_rules_win: "En el momento en que el peón de un jugador llega a cualquier casilla de su fila de meta, gana; no importa en qué columna sea.",
    wallmaze_history_title: "La Historia del Laberinto de Muros",
    wallmaze_history_origins_title: "Un diseño de los años 90",
    wallmaze_history_origins_p1: "El Quoridor fue diseñado por Mirko Marchesi y publicado por primera vez en 1997 por la empresa francesa de juegos Gigamic, convirtiéndose rápidamente en uno de los títulos más conocidos de la compañía junto a otros juegos abstractos compactos para dos jugadores.",
    wallmaze_history_origins_p2: "Pertenece a una familia más amplia de juegos de \"laberinto de bloqueo\", donde el propio tablero cambia de forma a lo largo de la partida en lugar de permanecer fijo como un tablero de ajedrez: cada muro que coloca un jugador remodela de forma permanente los caminos que pueden tomar ambos peones durante el resto de la partida.",
    wallmaze_history_design_title: "Reglas sencillas, profundidad real",
    wallmaze_history_design_p1: "Todo el reglamento cabe en una sola tarjeta —mueve tu peón o coloca un muro, llega al otro extremo para ganar—, y sin embargo la tensión entre avanzar y gastar un turno para bloquear a tu oponente le da una profundidad estratégica real, y se cita con frecuencia en textos sobre diseño de juegos como ejemplo de minimalismo elegante.",
    wallmaze_history_design_p2: "El Quoridor también se ha estudiado como un problema de informática: como el espacio de estados es grande pero está bien estructurado (posiciones de peones más colocaciones de muros, con una regla de conectividad de caminos que hay que respetar), es un objetivo popular tanto para la IA tradicional basada en búsqueda como, más recientemente, para agentes de aprendizaje por refuerzo.",
    wallmaze_history_names_title: "Por qué otro nombre",
    wallmaze_history_names_p1: "El mismo principio de juego aparece en el comercio con el nombre de Quoridor, diseñado en 1997 por Mirko Marchesi y publicado por Gigamic. Quoridor es una marca registrada. PaperGames no tiene relación con Gigamic ni con ese juego y por eso usa su propio nombre, Laberinto de Muros.",
    wallmaze_history_version_title: "Esta versión",
    wallmaze_history_version_p1: "PaperGames juega con las reglas estándar en el tablero estándar de 9x9 con diez muros por jugador. Colocar un muro es un pequeño modo propio: toca \"Colocar un muro\", toca en cualquier lugar del tablero para previsualizar el muro legal más cercano a ese punto, y confirma; un objetivo deliberadamente permisivo en una pantalla táctil, en lugar de tener que acertar en un punto exacto."
});
I18n.markTextLoaded("es");
