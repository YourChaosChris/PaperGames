// text/es/durak.js
// Rules and history texts of durak (es). Loaded by durak-rules.html and durak-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    sudoku_rules_basics_title: "La idea básica",
    durak_rules_title: "Reglas del Durak",
    durak_rules_intro: "Cómo juega PaperGames al Durak, en la forma habitual en la que se pueden echar cartas adicionales.",
    durak_term_setup: "Cartas y triunfo",
    durak_rules_setup: "Una baraja de 36 cartas (del Seis al As en cuatro palos), de 2 a 4 jugadores, seis cartas cada uno. La siguiente carta se coloca boca arriba bajo el mazo: su palo es el triunfo durante toda la partida y es la última carta que se roba. El palo de triunfo siempre se muestra arriba del tablero.",
    durak_term_attack: "Ataque y defensa",
    durak_rules_attack: "El jugador con el triunfo más bajo ataca primero. El atacante pone una carta boca arriba; el siguiente jugador defiende y debe batirla con una carta más alta del mismo palo, o con cualquier triunfo si la carta de ataque no es triunfo. Un triunfo solo lo bate un triunfo más alto.",
    durak_term_throw: "Echar cartas",
    durak_rules_throw: "Una vez puesta la primera carta, el atacante y después los demás jugadores pueden añadir más cartas, pero solo de valores que ya estén en la mesa, como carta de ataque o de defensa. El defensor debe batir cada una. Nunca hay más de seis cartas de ataque por ronda, ni más de las que el defensor tenía al empezarla.",
    durak_term_take: "Recoger las cartas",
    durak_rules_take: "Si el defensor no puede o no quiere batir una carta, recoge todas las cartas de la mesa; antes, los demás aún pueden echar cartas que encajen. Después ataca el jugador que sigue al defensor: el defensor se salta. Si el defensor lo bate todo, las cartas salen del juego y el defensor ataca a continuación.",
    durak_term_draw: "Completar la mano",
    durak_rules_draw: "Después de cada ronda todos completan su mano hasta seis cartas desde el mazo: primero el atacante, luego en el orden de la mesa y el defensor el último.",
    durak_term_end: "El final",
    durak_rules_end: "Cuando el mazo se acaba, ya no se roba, y quien se queda sin cartas sale. El último jugador que aún tiene cartas es el durak, el tonto, y pierde. Si los últimos se quedan sin cartas a la vez, la partida termina en empate.",
    durak_term_transfer: "Opcional: pasar el ataque",
    durak_rules_transfer: "Esta regla está desactivada salvo que la actives antes de la partida. Antes de batir nada, el defensor puede poner una carta del mismo valor que las cartas de ataque y pasar así todo el ataque al siguiente jugador, que entonces debe defenderse de todas. El siguiente jugador debe tener suficientes cartas para ello.",
    durak_history_title: "La historia del Durak",
    durak_history_origins_title: "Un juego popular ruso",
    durak_history_origins_p1: "Se cree que el Durak se extendió entre la gente común de Rusia en el siglo XIX, jugado con la baraja de 36 cartas habitual allí. En el siglo XX se convirtió en uno de los juegos de cartas más jugados en la Unión Soviética y los países vecinos, aprendido en casa, en los trenes y en el ejército.",
    durak_history_origins_p2: "A diferencia de la mayoría de los juegos de cartas, no tiene ganador, solo un perdedor: «durak» significa «tonto», y así se llama al último que se queda con cartas hasta que empieza la siguiente partida.",
    durak_history_names_title: "Muchas formas de jugar",
    durak_history_names_p1: "La forma que se juega aquí, en la que se pueden echar cartas adicionales, se conoce como podkidnói durak. En otra forma popular, perevodnói durak, el defensor puede pasar el ataque con una carta del mismo valor; PaperGames lo ofrece como opción.",
    durak_history_names_p2: "A esto se suman innumerables reglas de la casa, por ejemplo sobre cuántas cartas se pueden echar en la primera ronda. En las familias se discute mucho sobre ellas, y eso forma parte del encanto del juego."
});
I18n.markTextLoaded("es");
