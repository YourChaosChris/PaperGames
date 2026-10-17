// text/es/pyramidsolitaire.js
// Rules and history texts of pyramidsolitaire (es). Loaded by pyramidsolitaire-rules.html and pyramidsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    pyramidsolitaire_rules_title: "Reglas del Solitario Pirámide",
    pyramidsolitaire_rules_intro: "Una referencia rápida de cómo juega PaperGames al Solitario Pirámide, útil si estás oxidado, o si estás aprendiendo.",
    pyramidsolitaire_rules_basics_title: "La idea básica",
    pyramidsolitaire_term_layout: "La disposición",
    pyramidsolitaire_rules_layout: "Se reparten 28 cartas boca arriba formando un triángulo de 7 filas: 1 carta arriba, 2 debajo, y así sucesivamente hasta 7 cartas en la fila inferior, cada carta apoyada sobre y entre las dos cartas de debajo. Las 24 cartas restantes forman el mazo, del que se roba una carta a la vez boca arriba hacia el descarte.",
    pyramidsolitaire_term_pairing: "Emparejar hasta 13",
    pyramidsolitaire_rules_pairing: "Las cartas valen su valor nominal para esto: As = 1, del 2 al 10 como aparece impreso, Jota = 11, Reina = 12, Rey = 13. Retira dos cartas disponibles cuyos valores sumen exactamente 13 - por ejemplo un 5 y un 8, un 9 y un 4, o una Jota (11) y un 2. Un Rey ya vale 13 por sí solo, así que se retira sin pareja.",
    pyramidsolitaire_term_exposed: "Cartas visibles",
    pyramidsolitaire_rules_exposed: "Una carta de la pirámide solo se puede coger cuando las dos cartas que se apoyan en ella en la fila de abajo han desaparecido - la fila inferior empieza ya visible, ya que no hay nada debajo. Solo se pueden retirar las cartas visibles de la pirámide y la carta superior del descarte; una carta cubierta de la pirámide se muestra atenuada y no se puede coger todavía, aunque puedas ver de qué carta se trata.",
    pyramidsolitaire_term_stock: "El mazo, el descarte y los rebarajados",
    pyramidsolitaire_rules_stock: "Toca el mazo para voltear su carta superior boca arriba sobre el descarte, una carta a la vez - solo la carta superior del descarte se puede emparejar. Cuando el mazo se vacía, tocarlo de nuevo rebaraja todo el descarte de vuelta al mazo para que puedas recorrerlo otra vez, hasta 2 veces por partida. El número de rebarajados restantes se muestra siempre junto al mazo.",
    pyramidsolitaire_rules_example_title: "Un ejemplo resuelto",
    pyramidsolitaire_term_example: "Retirar una pareja",
    pyramidsolitaire_rules_example: "Supongamos que la fila inferior tiene un 9 visible y, en otra parte de la pirámide, un 4 visible - al hacer clic en el 9 y luego en el 4 se retiran ambos, ya que 9 + 4 = 13. Si ese 4 era la única carta apoyada sobre un 6 en la fila de arriba, y su vecina bajo el 6 también ha desaparecido ya, el 6 queda visible y también se puede emparejar - por ejemplo con un 7 en la parte superior del descarte. Retirar cartas así va abriendo las filas de arriba hasta que, idealmente, desaparece toda la pirámide.",
    pyramidsolitaire_rules_end_title: "Terminar una partida",
    pyramidsolitaire_term_win: "Victoria",
    pyramidsolitaire_rules_win: "La partida se gana en cuanto se retiran las 28 cartas de la pirámide - el mazo y el descarte no hace falta vaciarlos también, que es la condición de victoria estándar que usan la mayoría de versiones de este juego.",
    pyramidsolitaire_term_lose: "Quedarse sin jugadas",
    pyramidsolitaire_rules_lose: "Si el mazo está vacío, no quedan rebarajados, y no hay ningún Rey ni pareja que sume 13 disponible entre las cartas visibles de la pirámide y la carta superior del descarte, la partida termina en derrota - PaperGames lo muestra con claridad en lugar de dejarte atascado sin ninguna explicación.",
    pyramidsolitaire_history_title: "La historia del Solitario Pirámide",
    pyramidsolitaire_history_origins_title: "Un juego más antiguo, poco documentado",
    pyramidsolitaire_history_origins_p1: "El Pirámide pertenece a la misma gran familia de juegos de cartas de \"paciencia\" para un jugador que el Klondike y el FreeCell, la mayoría de los cuales se extendieron por Europa y Norteamérica durante el siglo XIX y principios del XX bajo distintos nombres regionales y con pequeñas variaciones de reglas. Como ocurre con la mayoría de los solitarios clásicos, el origen exacto del Pirámide - quién fue el primero en colocar 28 cartas en forma de triángulo y empezar a emparejarlas hasta 13 - no se puede atribuir a ninguna fuente ni fecha documentada concreta.",
    pyramidsolitaire_history_origins_p2: "Lo que sí está claro es lo que lo distingue del resto de la familia: mientras que el Klondike, el FreeCell y el Spider tratan, en el fondo, de construir secuencias descendentes de cartas, la mecánica definitoria del Pirámide es aritmética - retirar parejas cuyos valores suman exactamente 13, más el Rey solitario que ya vale 13 por sí mismo. Esa regla de emparejar hasta 13 es lo históricamente más distintivo de este juego, y la forma más clara de diferenciarlo de sus primos constructores de secuencias.",
    pyramidsolitaire_history_spread_title: "De nuevo incluido con Windows",
    pyramidsolitaire_history_spread_p1: "El Solitario Pirámide ya circulaba desde hacía años en libros de referencia de juegos de cartas y en las primeras colecciones digitales de solitarios, pero alcanzó un público realmente masivo de la misma forma que el Klondike décadas antes: viniendo incluido con Windows. Microsoft lo incorporó como uno de los juegos de la Microsoft Solitaire Collection, integrada en Windows 8 y versiones posteriores, junto al Klondike, el Spider y el FreeCell.",
    pyramidsolitaire_history_spread_p2: "Para muchísimos jugadores que crecieron con el Solitario de Windows significando específicamente el Klondike, la Solitaire Collection fue su primer contacto real con el estilo de solitario basado en emparejar cartas que representa el Pirámide - un tipo de rompecabezas distinto escondido bajo el mismo nombre familiar de \"Solitario\".",
    pyramidsolitaire_history_modern_title: "Esta versión",
    pyramidsolitaire_history_modern_p1: "PaperGames juega con el reglamento estándar: una baraja realmente nueva en cada partida, las 28 cartas de la pirámide repartidas boca arriba desde el principio, un mazo/descarte de robo de una carta cada vez con hasta 2 rebarajados, y la condición de victoria habitual de \"despejar la pirámide\" - el mazo y el descarte no hace falta vaciarlos también, tal como lo hacen la mayoría de las implementaciones modernas de este juego."
});
I18n.markTextLoaded("es");
