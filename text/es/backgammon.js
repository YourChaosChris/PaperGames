// text/es/backgammon.js
// Rules and history texts of backgammon (es). Loaded by backgammon-rules.html and backgammon-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    backgammon_rules_title: "Reglas del backgammon",
    backgammon_rules_intro: "Una referencia rápida de cómo juega PaperGames al backgammon, útil si estás oxidado, o si estás aprendiendo.",
    backgammon_rules_basics_title: "La idea básica",
    backgammon_term_pieces: "Las fichas y el tablero",
    backgammon_rules_pieces: "Cada jugador tiene 15 fichas en un tablero de 24 puntos. Negro se mueve del punto 1 hacia el punto 24, Blanco del punto 24 hacia el punto 1; cada uno lleva todas sus fichas a su propio cuadrante final y luego las saca del tablero.",
    backgammon_term_dice: "Dados",
    backgammon_rules_dice: "Se tiran dos dados en cada turno, dando dos jugadas con esos números; sacar dobles da cuatro jugadas de ese número. Todo dado que se pueda jugar legalmente debe jugarse.",
    backgammon_term_blocking: "Bloqueos y capturas",
    backgammon_rules_blocking: "Un punto ocupado por dos o más fichas del oponente está bloqueado. Un punto ocupado por exactamente una (una \"ficha suelta\") puede recibir una ficha enemiga, que la envía a la barra; esa ficha debe reentrar por el cuadrante final del oponente antes de que ese jugador pueda hacer cualquier otra jugada.",
    backgammon_rules_end_title: "Sacar fichas y ganar",
    backgammon_term_bearoff: "Sacar fichas",
    backgammon_rules_bearoff: "Una vez que tus 15 fichas están en tu cuadrante final, puedes empezar a sacarlas: una tirada que coincida con el punto de una ficha la retira, y una tirada mayor que cualquier punto ocupado puede retirar en su lugar la ficha más alejada.",
    backgammon_term_win: "Victoria",
    backgammon_rules_win: "El primer jugador en sacar sus 15 fichas gana.",
    backgammon_term_resignation: "Rendición",
    backgammon_rules_resignation: "Un jugador puede rendirse en cualquier momento, terminando la partida de inmediato a favor del oponente.",
    backgammon_term_doubling: "El cubo doblador",
    backgammon_rules_doubling: "Antes de tirar, un jugador que tenga (o comparta) el cubo puede ofrecer doblar la apuesta. El oponente debe aceptar, tomando el control del cubo y doblando el valor de la partida, o rechazar y perder la partida de inmediato al valor actual. Un gammon (el oponente no saca ninguna ficha) cuenta doble, y un backgammon (el oponente todavía tiene una ficha en el cuadrante final del ganador o en la barra) cuenta triple, ambos multiplicados además por el valor del cubo.",
    backgammon_history_title: "La historia del backgammon",
    backgammon_history_origins_title: "Juegos de dados más antiguos que la escritura",
    backgammon_history_origins_p1: "El linaje del backgammon se remonta al Juego Real de Ur y al juego romano Ludus Duodecim Scriptorum (\"juego de las doce líneas\"), simplificado más tarde en el Tabula: un juego de carreras para dos dados y 15 piezas por bando, ya reconociblemente cercano al backgammon en la Antigüedad tardía.",
    backgammon_history_origins_p2: "Se dice que el emperador Claudio adoraba tanto el Tabula que escribió un libro de estrategia sobre él (hoy perdido), y que mandó construir un tablero en su carruaje para poder jugar mientras viajaba.",
    backgammon_history_spread_title: "Tables, trictrac y el nombre inglés",
    backgammon_history_spread_p1: "A lo largo de la Europa medieval, los juegos de carreras parecidos al backgammon se conocían colectivamente como \"Tables\", con variantes regionales como el trictrac francés que añadían sus propias particularidades de puntuación. El nombre inglés \"backgammon\" se registra por primera vez en el siglo XVII, probablemente de \"back\" y una palabra antigua para \"juego\": un guiño a que las piezas a veces tienen que volver a entrar y cruzar el tablero de nuevo.",
    backgammon_history_spread_p2: "El cubo doblador, que permite a cualquiera de los jugadores subir la apuesta a mitad de partida, se introdujo en Nueva York en la década de 1920 y transformó el backgammon de una simple carrera en el agudo juego de gestión de riesgo que conocen hoy los jugadores de torneo (PaperGames también lo incluye; consulta la página de reglas).",
    backgammon_history_modern_title: "Un triunfo temprano para la inteligencia artificial",
    backgammon_history_modern_p1: "El backgammon ocupa un lugar especial en la historia de la IA: en 1992, un programa llamado TD-Gammon, creado por el investigador de IBM Gerald Tesauro, usó una red neuronal que aprendió jugando contra sí misma millones de veces, uno de los primeros éxitos de lo que hoy se llama aprendizaje por refuerzo.",
    backgammon_history_modern_p2: "TD-Gammon jugaba a un nivel competitivo con los mejores humanos del mundo años antes de que técnicas similares conquistaran el ajedrez o el Go, y sus ideas estratégicas poco convencionales acabaron cambiando la forma en que los mejores jugadores humanos abordaban el juego."
});
I18n.markTextLoaded("es");
