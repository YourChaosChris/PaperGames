// text/es/poch.js
// Rules and history texts of poch (es). Loaded by poch-rules.html and poch-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    poch_rules_title: "Reglas de Poch",
    poch_rules_intro: "Poch es un viejo juego de cartas con 32 cartas y fichas. Cada mano tiene tres etapas: se pagan casillas por ciertas cartas, los jugadores apuestan por su mejor grupo de cartas iguales y al final todos juegan sus cartas en secuencias. Tras seis manos gana quien tenga más fichas.",
    poch_rules_basics_title: "Las reglas",
    poch_term_pools: "Las casillas",
    poch_rules_pools: "El tablero tiene nueve casillas: As, Rey, Reina, Jota, Diez, Matrimonio (Rey y Reina), Secuencia (7, 8 y 9), Poch y el bote central. Antes de cada mano cada jugador pone una ficha en cada casilla, es decir, 9 fichas. Se reparten todas las cartas menos una, que queda boca arriba: su palo es el palo de pago.",
    poch_term_first: "Etapa 1: pagos",
    poch_rules_first: "Quien tenga el As, el Rey, la Reina, la Jota o el Diez del palo de pago se lleva las fichas de esa casilla. El Rey y la Reina del palo de pago juntos ganan también la casilla del Matrimonio, y el 7, el 8 y el 9 juntos la de la Secuencia. Una casilla que nadie gana, porque nadie tiene la carta o porque está boca arriba, queda para la mano siguiente y crece.",
    poch_term_pochen: "Etapa 2: pochar",
    poch_rules_pochen: "Solo participan los jugadores con dos, tres o cuatro cartas del mismo valor, con su mejor grupo. El primer jugador a la izquierda del que reparte pasa o apuesta 1; después se iguala, se sube de 1 en 1 (hasta 4 en total) o se abandona. Quien no puede pagar una igualación solo puede abandonar. Cuatro iguales superan a tres, y tres superan a una pareja; un valor más alto supera a uno más bajo; la misma pareja con una carta del palo de pago supera a la que no la tiene. El mejor grupo gana la casilla de Poch y todas las apuestas. Si todos pasan, la casilla de Poch se queda; un único jugador con un grupo se la lleva de inmediato.",
    poch_term_play: "Etapa 3: juego de las cartas",
    poch_rules_play: "El ganador del Poch (o el jugador a la izquierda del que reparte) sale con cualquier carta. La carta siguiente del mismo palo la juega quien la tenga, luego la siguiente, hasta el As. Cuando falta la carta siguiente – ya jugada o la descubierta –, vuelve a salir quien jugó último. Quien juega primero su última carta gana el bote central y de cada otro jugador una ficha por cada carta que aún tenga.",
    poch_term_end: "El final de la partida",
    poch_rules_end: "Una partida tiene seis manos; termina antes si alguien no puede pagar las 9 fichas de una mano. Gana quien tenga más fichas. Las fichas son solo puntos en el juego; no hay dinero de por medio.",
    poch_term_computer: "El ordenador",
    poch_rules_computer: "Fácil casi siempre pasa y juega cualquier carta. Medio sube con trío, póquer o una pareja alta y sale con una carta que nadie puede seguir. Difícil cuenta además los jugadores que siguen en la apuesta y planea las secuencias con sus propias cartas. El botón de pista sugiere lo que haría Difícil.",
    poch_history_title: "La historia del Poch",
    poch_history_origins_title: "Un juego muy antiguo",
    poch_history_origins_p1: "El Poch tiene al menos quinientos años y aparece por primera vez en el siglo XV. En Alemania se jugaba como Pochen o Pochspiel y en Francia como La Poque, con un tablero especial para las fichas. El Poch se cuenta entre los antecesores del póker, y juegos parecidos con tablero de fichas se siguen jugando en muchos países.",
    poch_history_here_title: "Poch aquí",
    poch_history_here_p1: "PaperGames convierte el Poch en un juego para una persona contra uno a tres ordenadores. Tiene su propio tablero de nueve casillas y su propia redacción, dura seis manos y no necesita dinero, y los ordenadores esperan entre sus jugadas."
});
I18n.markTextLoaded("es");
