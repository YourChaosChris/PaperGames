// text/es/mahjong.js
// Rules and history texts of mahjong (es). Loaded by mahjong-rules.html and mahjong-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    mahjong_rules_title: "Reglas del Mahjong Solitaire",
    mahjong_rules_intro: "Una referencia rápida de cómo juega PaperGames al Mahjong Solitaire, útil si estás oxidado, o si estás aprendiendo.",
    mahjong_rules_basics_title: "La idea básica",
    mahjong_term_layout: "La disposición",
    mahjong_rules_layout: "80 fichas se apilan en tres capas de profundidad formando una especie de pirámide. Una ficha solo se puede coger cuando no hay nada encima de ella y al menos uno de sus vecinos inmediatos, a izquierda o derecha en su propia capa, falta o ya ha sido retirado.",
    mahjong_term_matching: "Emparejar",
    mahjong_rules_matching: "Haz clic en una ficha libre, y luego en otra ficha libre que muestre el mismo símbolo para retirar ambas del tablero. Cada reparto se genera de forma que siempre es posible despejar el tablero por completo desde la posición inicial, aunque un orden descuidado de emparejamientos todavía puede dejarte atascado a mitad de camino.",
    mahjong_term_shuffle: "Quedarse atascado",
    mahjong_rules_shuffle: "Si ya no queda ningún emparejamiento legal en ningún lugar del tablero, usa Rebarajar fichas restantes para repartir símbolos nuevos sobre lo que queda; a partir de ahí se garantiza una nueva solución, así que un único punto muerto nunca tiene por qué significar empezar completamente de cero.",
    mahjong_rules_end_title: "Terminar una partida",
    mahjong_term_win: "Despejado",
    mahjong_rules_win: "El tablero queda despejado en el momento en que todas las fichas han sido emparejadas y retiradas.",
    mahjong_history_title: "La historia del Mahjong Solitaire",
    mahjong_history_origins_title: "Fichas prestadas, juego nuevo",
    mahjong_history_origins_p1: "El Mahjong Solitaire (también llamado Shanghai) no es un juego chino tradicional: es una invención occidental de principios o mediados del siglo XX que reutiliza el bellamente ilustrado juego de fichas del juego para cuatro jugadores Mahjong (que a su vez es una creación china del siglo XIX) para un puzle de emparejamiento completamente distinto y para un solo jugador, sin ninguna de las combinaciones, descartes o manos puntuables del juego original.",
    mahjong_history_origins_p2: "Quién combinó exactamente por primera vez un formato de solitario de emparejar parejas con fichas de Mahjong no está del todo claro, con reclamaciones enfrentadas que se remontan décadas antes de la era informática; lo que sí es seguro es que la combinación no se convirtió en un fenómeno mundial hasta que dio el salto a los ordenadores personales.",
    mahjong_history_spread_title: "Un clásico de las pantallas de los años 80",
    mahjong_history_spread_p1: "El juego llegó a un público masivo a través de las primeras versiones informáticas de la década de 1980, sobre todo el 'Shanghai' de Activision de 1986 para Macintosh, lo bastante popular como para que 'Shanghai' se convirtiera, y en muchos lugares siga siendo, un nombre alternativo para todo el género de juegos de solitario de emparejar fichas construidos en torno a la disposición clásica en capas.",
    mahjong_history_spread_p2: "La disposición que da nombre al juego —un montículo escalonado en forma de pirámide apodado 'la Tortuga'— quedó tan fuertemente asociada al género que la mayoría de las implementaciones, incluida esta, usan por defecto alguna variación de ella en lugar de inventar una forma nueva.",
    mahjong_history_modern_title: "Un puzle resoluble por construcción",
    mahjong_history_modern_p1: "A diferencia de un juego como el Sudoku o un nonograma, donde la solución de un puzle se comprueba en cuanto a su unicidad después de diseñarlo, un reparto de Mahjong Solitaire normalmente se garantiza jugable de otra manera: muchas implementaciones, incluida la de PaperGames, construyen el reparto trabajando hacia atrás desde un tablero vacío, reproduciendo en sentido inverso una secuencia legal de retiradas para decidir qué símbolo va en cada lugar.",
    mahjong_history_modern_p2: "Eso garantiza que exista al menos un camino ganador desde la primerísima ficha colocada, pero —exactamente igual que con una baraja real de solitario Klondike— no dice nada sobre si una secuencia concreta de emparejamientos que haga un jugador llegará realmente a ese camino, razón por la cual quedarse atascado a mitad de un reparto perfectamente resoluble es una parte normal y esperable del juego, y no una señal de que algo haya ido mal."
});
I18n.markTextLoaded("es");
