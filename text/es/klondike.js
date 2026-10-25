// text/es/klondike.js
// Rules and history texts of klondike (es). Loaded by klondike-rules.html and klondike-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    klondike_rules_title: "Reglas del Klondike",
    klondike_rules_intro: "Una referencia rápida de cómo juega PaperGames al Klondike, útil si estás oxidado, o si estás aprendiendo.",
    klondike_rules_basics_title: "La idea básica",
    klondike_term_layout: "La disposición",
    klondike_rules_layout: "Las cartas se reparten en 7 columnas de tablero de 1 a 7 cartas cada una, con solo la carta superior de cada columna boca arriba. Cuatro fundaciones (una por palo) se construyen del As al Rey. El resto de la baraja forma el mazo, del que se roba una carta a la vez hacia el descarte.",
    klondike_term_tableau: "Mover cartas",
    klondike_rules_tableau: "Una carta puede moverse a una columna del tablero solo sobre una carta exactamente un rango superior y de color opuesto, o a una columna vacía, que solo acepta un Rey. Una serie de varias cartas ya apiladas boca arriba en ese mismo orden descendente y alterno puede moverse junta como una unidad hacia un destino válido.",
    klondike_term_foundation: "Fundaciones",
    klondike_rules_foundation: "Una fundación solo acepta su propio palo, empezando por el As y subiendo un rango cada vez. Una vez que una carta está en una fundación, se queda allí: las fundaciones solo reciben cartas, nunca las devuelven al tablero.",
    klondike_term_stock: "El mazo y el descarte",
    klondike_rules_stock: "Toca el mazo para voltear su carta superior boca arriba sobre el descarte, una carta a la vez. Cuando el mazo se vacía, tocarlo de nuevo rebaraja todo el descarte de vuelta al mazo para que puedas recorrerlo otra vez: PaperGames no limita cuántas veces puedes volver a repartir.",
    klondike_rules_end_title: "Terminar una partida",
    klondike_term_win: "Victoria",
    klondike_rules_win: "La partida se gana en el momento en que las cuatro fundaciones están completas, del As al Rey. No todos los repartos se pueden ganar: a diferencia del FreeCell, un reparto de Klondike puede llegar a ser realmente irresoluble a mitad de partida, ya que al principio solo se ve la carta superior de cada columna.",
    klondike_history_title: "La historia del Klondike",
    klondike_history_origins_title: "Un nombre de la fiebre del oro - quizás",
    klondike_history_origins_p1: "El Klondike pertenece a una gran familia de juegos de cartas de \"patience\" para un jugador que se extendieron por Europa y Norteamérica a lo largo del siglo XIX, la mayoría sin necesitar más que una baraja estándar y una superficie plana. El conjunto de reglas concreto que se juega hoy - siete columnas de tablero en cascada, cuatro fundaciones construidas por palo, un mazo y un descarte para recorrer - aparece descrito por primera vez en libros de juegos de cartas de principios del siglo XX y desde entonces ha recibido diversos nombres.",
    klondike_history_origins_p2: "Cómo llegó exactamente a llamarse \"Klondike\" es realmente incierto. La historia más repetida vincula el nombre a la fiebre del oro de Klondike de finales de la década de 1890, con la idea de que los buscadores de oro que viajaban hacia el Yukón, o pasaban allí el invierno, lo jugaban para hacer tiempo: un origen pintoresco y plausible que, como muchas etimologías de juegos de cartas, nunca se ha podido rastrear hasta un primer uso documentado. PaperGames la repite aquí como el relato popular, no como historia asentada.",
    klondike_history_spread_title: "Incluido con Windows",
    klondike_history_spread_p1: "La abrumadora popularidad del Klondike hoy en día se debe menos a sus orígenes decimonónicos en la mesa de cartas que a un programa muy concreto: Microsoft incluyó una versión, llamada simplemente \"Solitario\", con Windows 3.0 en 1990, según se dice en parte para enseñar suavemente a toda una generación de nuevos usuarios de Windows a hacer clic y arrastrar y soltar con el ratón.",
    klondike_history_spread_p2: "Funcionó casi demasiado bien: en pocos años, el Solitario de Windows tenía fama de ser uno de los programas más usados del mundo, instalado en prácticamente todos los PC que llevaban Windows, quisiera o no su dueño abrir alguna vez un juego. Redefinió lo que \"solitario\" significaba para millones de personas que nunca habían jugado a una sola partida física de cartas con ese nombre.",
    klondike_history_modern_title: "Esta versión",
    klondike_history_modern_p1: "PaperGames juega con el reglamento clásico de robar una carta cada vez y sin límite de rebarajados, favoreciendo la versión de menor fricción de las reglas igual que el FreeCell de esta colección: una baraja realmente nueva en cada partida en vez de un conjunto fijo de repartos numerados, y sin límite de cuántas veces puedes volver a recorrer el mazo."
});
I18n.markTextLoaded("es");
