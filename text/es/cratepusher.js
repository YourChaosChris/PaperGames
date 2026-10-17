// text/es/cratepusher.js
// Rules and history texts of cratepusher (es). Loaded by cratepusher-rules.html and cratepusher-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    sudoku_rules_basics_title: "La idea básica",
    cratepusher_rules_title: "Reglas de Empujacajas",
    cratepusher_rules_intro: "Cómo funciona Empujacajas en PaperGames: un rompecabezas para una persona que consiste en mover cajas en un pequeño almacén.",
    cratepusher_term_board: "El tablero",
    cratepusher_rules_board: "Una cuadrícula rectangular de paredes (negro macizo) y suelo (blanco). En el suelo están tú (un círculo relleno), varias cajas (un cuadrado con una cruz) y exactamente tantas casillas objetivo (un pequeño cuadrado hueco). Una caja sobre un objetivo se convierte en un cuadrado relleno.",
    cratepusher_term_move: "Moverse",
    cratepusher_rules_move: "Te mueves casilla a casilla hacia arriba, abajo, izquierda o derecha, nunca en diagonal. No puedes atravesar paredes ni cajas.",
    cratepusher_rules_move_targets: "Puedes caminar sobre los objetivos vacíos; solo te bloquean las paredes y las cajas.",
    cratepusher_rules_hint: "«Pista» te muestra un solo empujón: el primero de una solución más corta desde tu posición actual. La caja que hay que empujar recibe un marco discontinuo, la casilla adonde debe ir un marco continuo, y una frase bajo el tablero indica la fila, la columna y la dirección (contadas sin el muro exterior). La pista solo muestra el empujón; lo haces tú. Para el siguiente, vuelve a tocar «Pista». Si desde tu posición ya no hay solución, la pista te lo dice. Las pistas no se guardan y no cambian tus estadísticas.",
    cratepusher_term_push: "Empujar",
    cratepusher_rules_push: "Si caminas contra una caja, la empujas una casilla más, pero solo si la casilla de detrás está libre: sin pared y sin una segunda caja. Solo empujas una caja cada vez, y nunca puedes arrastrar una caja hacia ti.",
    cratepusher_term_goal: "El objetivo",
    cratepusher_rules_goal: "El nivel está resuelto en cuanto cada caja está sobre un objetivo. No importa qué caja va a qué objetivo.",
    cratepusher_term_stuck: "Atascarse",
    cratepusher_rules_stuck: "Como las cajas no se pueden arrastrar, un empuje descuidado puede hacer que un nivel no tenga solución; por ejemplo, una caja empujada a una esquina que no es un objetivo. El juego te avisa cuando una caja queda atascada en una esquina así. Otros callejones sin salida no se anuncian: piensa con antelación y usa «Deshacer movimiento» tantas veces como quieras.",
    cratepusher_term_controls: "Controles",
    cratepusher_rules_controls: "Toca una casilla junto a ti para ir allí (y empujar la caja que haya). Toca una casilla de suelo más lejana y caminarás allí por el camino más corto, pero solo si puedes llegar sin empujar ninguna caja. Las teclas de flecha y W, A, S, D también te mueven. «Deshacer movimiento» deshace tus movimientos uno a uno, tantos como quieras; «Reiniciar nivel» empieza el nivel de nuevo.",
    cratepusher_term_levels: "Los niveles",
    cratepusher_rules_levels: "Cada nivel lo construye PaperGames, nuevo cada vez: fácil en una cuadrícula de 7x7 con 3 cajas, medio en 9x9 con 4 y difícil en 10x10 con 5. El programa construye cada nivel hacia atrás desde la posición resuelta, así que siempre tiene solución, y luego lo comprueba otra vez con su propio solucionador. El número de empujes que necesita la mejor solución aparece sobre el tablero, junto con tus pasos, tus empujes y cuántas cajas están ya sobre un objetivo.",
    cratepusher_history_title: "La historia de Empujacajas",
    cratepusher_history_origins_title: "Una idea de 1981",
    cratepusher_history_origins_p1: "El principio de empujar cajas una a una hasta lugares marcados, sin arrastrarlas nunca, lo inventó Hiroyuki Imabayashi en 1981. En 1982 la empresa japonesa Thinking Rabbit lo publicó como videojuego con el nombre de Sokoban.",
    cratepusher_history_origins_p2: "Detrás de sus reglas sencillas hay verdadera profundidad: incluso salas pequeñas pueden exigir largas secuencias de movimientos cuidadosamente planeadas, y los informáticos han demostrado que resolver este tipo de rompecabezas es, en general, muy difícil. Desde entonces la idea ha sido adoptada por innumerables juegos de ingenio.",
    cratepusher_history_names_title: "Por qué otro nombre",
    cratepusher_history_names_p1: "Sokoban es una marca registrada de Falcon Co., Ltd. PaperGames no tiene ninguna relación con Falcon ni con el juego original y por eso usa un nombre propio: Empujacajas. Lo mismo ocurre con Calcudoku, que se juega con nombre propio por el mismo motivo.",
    cratepusher_history_names_p2: "Ninguno de los niveles de aquí procede del juego original ni de ninguna colección de niveles. Cada nivel lo genera el propio programa de PaperGames cuando pides uno, construido hacia atrás desde la posición resuelta y comprobado con su propio solucionador."
});
I18n.markTextLoaded("es");
