// text/es/alquerque.js
// Rules and history texts of alquerque (es). Loaded by alquerque-rules.html and alquerque-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    alquerque_rules_title: "Reglas del Alquerque",
    alquerque_rules_intro: "Una referencia rápida de cómo juega PaperGames al Alquerque, el juego de saltos descrito en el Libro de los juegos de Alfonso X de Castilla.",
    alquerque_rules_basics_title: "La idea básica",
    alquerque_term_board: "El tablero",
    alquerque_rules_board: "El tablero tiene 25 puntos en una cuadrícula de 5x5. Los puntos vecinos están unidos en horizontal y en vertical, y algunos también en diagonal: las líneas diagonales solo pasan por un punto de cada dos, de modo que las cuatro esquinas y el centro están unidos en las ocho direcciones. Las fichas solo pueden moverse por las líneas dibujadas.",
    alquerque_term_setup: "Colocación inicial",
    alquerque_rules_setup: "Cada bando tiene 12 fichas: las blancas (anillos) abajo y las negras (discos rellenos) arriba. Cada bando ocupa las dos filas más cercanas a él y los dos puntos de la fila central que quedan a su propia derecha. El punto central queda vacío. Las blancas mueven primero.",
    alquerque_term_move: "Movimiento",
    alquerque_rules_move: "En tu turno, mueve una de tus piezas por una línea a un punto vecino libre: hacia delante, de lado o en diagonal hacia delante. Una pieza nunca retrocede, tampoco en diagonal. Hacia delante significa hacia el lado del rival.",
    alquerque_term_capture: "Captura",
    alquerque_rules_capture: "Una ficha captura saltando a lo largo de una línea sobre una ficha enemiga vecina hasta el punto vacío que hay justo detrás. La ficha saltada se retira. Si la misma ficha puede volver a saltar, sigue en el mismo turno, incluso cambiando de dirección. Los saltos pueden ir en cualquier dirección, también hacia atrás: es una norma de PaperGames, porque la fuente solo prohíbe moverse hacia atrás.",
    alquerque_term_forced: "Captura obligatoria",
    alquerque_rules_forced: "Si puedes capturar, debes hacerlo: mientras haya una captura disponible, PaperGames solo te deja hacer movimientos de captura, y una ficha que puede seguir saltando tiene que continuar hasta que ya no pueda. Cuando hay varias capturas posibles, puedes elegir cualquiera de ellas, no solo la más larga.",
    alquerque_rules_end_title: "Cómo termina una partida",
    alquerque_term_win: "Victoria",
    alquerque_rules_win: "Ganas cuando tu oponente no tiene fichas restantes, o tiene fichas pero ningún movimiento legal en su turno.",
    alquerque_term_resignation: "Rendición",
    alquerque_term_dead: "Bandos que ya no pueden encontrarse",
    alquerque_rules_dead: "Norma de PaperGames: cuando cada pieza blanca está al menos dos filas más arriba que cada pieza negra, los bandos ya no pueden encontrarse nunca: las blancas solo van hacia arriba o de lado, las negras solo hacia abajo o de lado. Nadie podría volver a capturar y la partida no terminaría nunca, así que termina en el acto: gana el bando con más piezas; con las mismas, es tablas.",
    alquerque_rules_resignation: "Un jugador puede rendirse en cualquier momento, terminando la partida de inmediato a favor del oponente.",
    alquerque_rules_versions_title: "Qué versión se juega aquí",
    alquerque_rules_versions: "Las descripciones antiguas del alquerque dejan algunos detalles abiertos. En la fuente indicada abajo capturar no es obligatorio: la pieza que pudo capturar y no lo hizo se retira (\"soplar\", en inglés \"huffing\"). PaperGames mantiene la captura obligatoria, porque la app solo ofrece jugadas legales. Las piezas nunca retroceden al moverse, pero saltan en cualquier dirección (norma de PaperGames). Empiezan las blancas.",
    alquerque_rules_sources_title: "Fuentes",
    alquerque_rules_sources: "La prohibición de retroceder y el final de la partida siguen: Wikipedia, „Alquerque“, section Rules: https://en.wikipedia.org/wiki/Alquerque (consultado el 6 de octubre de 2026).",
    alquerque_history_title: "La historia del Alquerque",
    alquerque_history_origins_title: "Un nombre del árabe",
    alquerque_history_origins_p1: "El nombre viene del árabe al-qirkat, el nombre de un juego de tablero conocido en el mundo árabe. Llegó a España bajo el dominio musulmán y allí siguió vivo como alquerque.",
    alquerque_history_book_title: "El Libro de los juegos",
    alquerque_history_book_p1: "En 1283, el rey Alfonso X de Castilla mandó terminar el Libro de los juegos. Además del ajedrez, los dados y los juegos de tablas, describe el alquerque con sus reglas e ilustraciones, lo que lo convierte en una de las fuentes escritas más antiguas sobre el juego.",
    alquerque_history_checkers_title: "Del Alquerque a las damas",
    alquerque_history_checkers_p1: "Las damas se consideran en general descendientes del alquerque: su captura por salto y la regla de que una captura debe realizarse se trasladaron a las casillas del tablero de ajedrez. El propio alquerque se siguió jugando, y se conocen juegos similares de muchas regiones.",
    alquerque_history_modern_title: "En PaperGames",
    alquerque_history_modern_p1: "PaperGames juega la partida de 12 contra 12 en el tablero de 5x5 con captura obligatoria. Las líneas del tablero están dibujadas por completo, porque solo ellas muestran qué movimientos diagonales existen."
});
I18n.markTextLoaded("es");
