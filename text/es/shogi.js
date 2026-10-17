// text/es/shogi.js
// Rules and history texts of shogi (es). Loaded by shogi-rules.html and shogi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    shogi_rules_title: "Reglas del Shogi",
    shogi_rules_intro: "Una referencia rápida de cómo juega PaperGames al Shogi (ajedrez japonés), útil si vienes del ajedrez internacional, ya que varias ideas aquí funcionan de forma diferente.",
    shogi_rules_basics_title: "La idea básica",
    shogi_term_board: "El tablero y las piezas",
    shogi_rules_board: "Cada bando tiene 20 piezas en un tablero de 9x9: un Rey, una Torre, un Alfil, dos Oros, dos Platas, dos Caballos, dos Lanzas y nueve Peones. Las piezas son simples pentágonos que apuntan hacia el oponente; a qué bando pertenece una pieza depende de hacia dónde mira, no de su color. Negro siempre mueve primero.",
    shogi_term_promotion: "Coronación",
    shogi_rules_promotion: "Toda pieza salvo el Rey y el Oro puede coronar a una forma más fuerte cuando se mueve hacia, desde, o dentro de las tres filas más lejanas del tablero. Coronar es opcional, salvo cuando un Peón o una Lanza llegan a la última fila, o un Caballo llega a cualquiera de las dos últimas filas; ahí es obligatorio, ya que de otro modo la pieza nunca tendría otra jugada legal.",
    shogi_term_drops: "Capturas y colocaciones",
    shogi_rules_drops: "Capturar una pieza no la elimina del juego: cambia de bando, vuelve a su forma no coronada, y se une a la mano del jugador que la capturó. En un turno posterior, en lugar de mover una pieza que ya está en el tablero, ese jugador puede colocar una pieza de su mano en cualquier casilla vacía: una de las ideas más características del Shogi, y la razón por la que las partidas rara vez se quedan sin material.",
    shogi_term_drop_limits: "Restricciones de colocación",
    shogi_rules_drop_limits: "Un Peón o una Lanza no se pueden colocar en la última fila, y un Caballo no se puede colocar en ninguna de las dos últimas filas, ya que no tendrían ninguna jugada legal allí. Un Peón no se puede colocar en una columna que ya tenga uno de tus propios Peones sin coronar, y colocar un Peón nunca puede dar jaque mate directamente (sí puede dar jaque, solo que no mate).",
    shogi_rules_end_title: "Cómo termina una partida",
    shogi_term_win: "Victoria",
    shogi_rules_win: "Un Rey en jaque que no tiene forma de escapar, bloquear o capturar la pieza que da jaque recibe jaque mate: la partida termina de inmediato.",
    shogi_term_resignation: "Rendición",
    shogi_rules_resignation: "Un jugador puede rendirse en cualquier momento, terminando la partida de inmediato a favor del oponente.",
    shogi_term_sennichite: "Repetición (sennichite)",
    shogi_rules_sennichite: "Si la misma posición - las mismas piezas en las mismas casillas, las mismas piezas en la mano de ambos jugadores y el mismo jugador al turno - se da cuatro veces, la partida es tablas. Excepción: si un jugador dio jaque con cada una de sus jugadas durante toda la repetición, ese jugador pierde. PaperGames aplica esta regla automáticamente.",
    shogi_history_title: "La historia del Shogi",
    shogi_history_origins_title: "Desde la India, pasando por el sudeste asiático",
    shogi_history_origins_p1: "Al igual que el ajedrez internacional y el Xiangqi, el Shogi desciende en última instancia del chaturanga, el antiguo juego de guerra indio que se extendió por Asia siguiendo las rutas comerciales a partir del siglo VI d. C. Llegó a Japón en algún momento antes del siglo X, probablemente a través del sudeste asiático y China, y se fue adaptando a lo largo de los siglos siguientes en formas claramente japonesas.",
    shogi_history_origins_p2: "Las primeras variantes japonesas del ajedrez eran considerablemente más grandes que el juego moderno: algunas formas históricas, como el Dai Shogi y el enorme Tai Shogi, usaban tableros de 15x15 casillas o más con bien más de cien piezas por bando. La versión de 9x9 y 20 piezas que se juega hoy se impuso como estándar hacia el siglo XVI.",
    shogi_history_spread_title: "Los orígenes de la regla de colocación",
    shogi_history_spread_p1: "El rasgo distintivo del Shogi —que una pieza capturada cambia de bando y puede volver a colocarse en el tablero— no tiene equivalente en el ajedrez ni en el Xiangqi, y lo distingue de todos los demás juegos de esta colección. Los historiadores suelen relacionar su aparición con la práctica, común entre los clanes samurái en guerra de Japón, de incorporar directamente a los soldados capturados al ejército captor en lugar de tratarlos simplemente como bajas.",
    shogi_history_spread_p2: "Sea cual sea su origen exacto, la regla de colocación transforma el carácter del juego: el material casi nunca se elimina de forma permanente, las partidas rara vez se estancan por un simple intercambio de material, y un ataque agresivo puede alimentarse indefinidamente con todo lo que el atacante ya haya capturado.",
    shogi_history_modern_title: "Una tradición profesional viva",
    shogi_history_modern_p1: "El Shogi ha mantenido una tradición ininterrumpida de torneos profesionales en Japón desde el periodo Edo (siglos XVII-XIX), cuando el shogunato Tokugawa financió un sistema hereditario de casas de jugadores profesionales, un linaje que evolucionó hasta la moderna Asociación Japonesa de Shogi, fundada en 1924.",
    shogi_history_modern_p2: "El shogi informático quedó durante mucho tiempo por detrás del ajedrez informático debido al enorme factor de ramificación que introduce la regla de colocación, pero a mediados de la década de 2010 programas como Ponanza ya habían derrotado de forma decisiva a los mejores profesionales, provocando los mismos debates sobre el juego entre humanos y ordenadores que el ajedrez había vivido una década o dos antes."
});
I18n.markTextLoaded("es");
