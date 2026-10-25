// text/es/reversi.js
// Rules and history texts of reversi (es). Loaded by reversi-rules.html and reversi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    reversi_rules_title: "Reglas del Reversi",
    reversi_rules_intro: "Una referencia rápida de cómo PaperGames juega al Reversi - útil si estás oxidado o si lo estás aprendiendo.",
    reversi_rules_basics_title: "La idea básica",
    reversi_term_discs: "Los discos y el inicio",
    reversi_rules_discs: "El Reversi se juega en un tablero de 8x8. La partida comienza con dos fichas de cada color colocadas en diagonal en las cuatro casillas centrales. Las negras siempre mueven primero.",
    reversi_term_flanking: "Flanquear",
    reversi_rules_flanking: "Una jugada coloca un disco en una casilla vacía de forma que flanquea —atrapa entre tu nuevo disco y otro disco tuyo— uno o más discos del oponente en línea recta (horizontal, vertical o diagonal). Todo disco flanqueado se voltea a tu color de inmediato.",
    reversi_rules_pass_title: "Cuando no puedes mover",
    reversi_term_pass: "Sin jugada legal",
    reversi_rules_pass: "Si no tienes ninguna jugada legal, tu turno se salta automáticamente y el juego vuelve a tu oponente; no hay forma de pasar voluntariamente mientras exista una jugada legal. Si ningún jugador tiene una jugada legal, la partida termina de inmediato.",
    reversi_rules_end_title: "Cómo termina una partida",
    reversi_term_win: "Victoria",
    reversi_rules_win: "La partida termina en el momento en que ningún jugador tiene una jugada legal (normalmente porque el tablero está lleno). Gana quien tenga más discos en el tablero; un reparto igual es empate.",
    reversi_term_resignation: "Rendición",
    reversi_rules_resignation: "Un jugador puede rendirse en cualquier momento, terminando la partida de inmediato a favor del oponente.",
    reversi_history_title: "La Historia del Reversi",
    reversi_history_origins_title: "Un original victoriano",
    reversi_history_origins_p1: "El Reversi apareció por primera vez en Inglaterra a principios de la década de 1880, en medio de una disputa peculiarmente victoriana: dos ingleses, Lewis Waterman y John W. Mollett, afirmaban cada uno haber inventado el juego y se acusaban mutuamente de fraude. Nunca se ha aclarado a quién corresponde realmente el mérito.",
    reversi_history_origins_p2: "En sus primeras versiones, el Reversi empezaba con el tablero vacío: los jugadores colocaban ellos mismos, una a una, las cuatro primeras fichas en las cuatro casillas centrales - una libertad que el Othello sustituyó más tarde por una posición inicial fija.",
    reversi_history_spread_title: "Reinventado en Japón",
    reversi_history_spread_p1: "En Japón, el juego cobró nueva vida a principios de los años 70 gracias a Goro Hasegawa, que lo presentó como invención propia, con las cuatro fichas iniciales fijadas en su conocido patrón diagonal. Tsukuda Original lo publicó en 1973 bajo un nuevo nombre: Othello, en referencia a la obra de Shakespeare y a su conflicto central entre blancas y negras.",
    reversi_history_spread_p2: "El Othello se hizo enormemente popular en Japón y luego en todo el mundo, dando lugar a un Campeonato Mundial de Othello celebrado anualmente desde 1977 y consolidando el conjunto de reglas estandarizado —el que usa esta app— como la versión que se juega hoy a nivel competitivo.",
    reversi_history_modern_title: "Un campo de batalla para los ordenadores",
    reversi_history_modern_p1: "El Othello resultó ser un tema inusualmente bueno para la investigación en juegos por ordenador: sus reglas son sencillas, pero la enorme cantidad de posiciones alcanzables durante mucho tiempo impidió que funcionaran bien las estrategias ingenuas.",
    reversi_history_modern_p2: "En agosto de 1997, el programa Logistello de Michael Buro derrotó al campeón mundial humano en activo, Takeshi Murakami, por 6 partidas a 0: un resultado histórico que llegó el mismo año que la victoria de Deep Blue en el ajedrez. Los motores de Othello no han dejado de fortalecerse desde entonces, y hoy se considera el juego resuelto, o casi, desde una amplia variedad de posiciones.",
    reversi_history_names_title: "Por qué Reversi",
    reversi_history_names_p1: "El Reversi en sí data del siglo XIX y es de dominio público. Othello es una marca registrada. PaperGames no tiene relación con los titulares de esta marca y por eso usa el nombre más antiguo, Reversi."
});
I18n.markTextLoaded("es");
