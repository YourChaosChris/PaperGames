// text/es/hanoi.js
// Rules and history texts of hanoi (es). Loaded by hanoi-rules.html and hanoi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    hanoi_rules_title: "Reglas de las torres de Hanói",
    hanoi_rules_intro: "Una torre de discos, el más pequeño arriba, está en la varilla izquierda. Llévala a la varilla derecha.",
    hanoi_rules_basics_title: "Las reglas",
    hanoi_term_move: "Un movimiento",
    hanoi_rules_move: "Toca una varilla: coges su disco de arriba (la varilla recibe un marco grueso). Toca una varilla para poner el disco. Toca otra vez la misma varilla para devolverlo.",
    hanoi_term_rule: "La regla",
    hanoi_rules_rule: "Solo se mueve el disco de arriba de una varilla, y nunca puede quedar sobre un disco más pequeño. Un movimiento así se rechaza y nada se mueve.",
    hanoi_term_goal: "El objetivo",
    hanoi_rules_goal: "Toda la torre en la varilla derecha (marcada con una estrella). El mínimo de movimientos es 2 elevado al número de discos, menos 1: 7 con 3 discos, 15 con 4, 255 con 8.",
    hanoi_term_help: "Deshacer y pista",
    hanoi_rules_help: "Deshacer retira movimientos. La pista da a dos varillas un marco doble: mueve el disco de arriba de la primera a la segunda; es el siguiente movimiento de un camino más corto desde la posición en la que estás.",
    hanoi_history_title: "La historia de las torres de Hanói",
    hanoi_history_lucas_title: "Édouard Lucas, 1883",
    hanoi_history_lucas_p1: "El matemático francés Édouard Lucas presentó el rompecabezas en 1883 como un juego que supuestamente había encontrado un tal «N. Claus (de Siam)», las letras de «Lucas d'Amiens» cambiadas de orden. En 1889 lo publicó como folleto.",
    hanoi_history_legend_title: "Una leyenda inventada",
    hanoi_history_legend_p1: "El folleto contaba que unos sacerdotes de un templo de Benarés mueven una torre de 64 discos de oro; cuando terminen, el mundo se acabará. La leyenda formaba parte de la historia del juego, no de la historia real.",
    hanoi_history_math_title: "El mínimo de movimientos",
    hanoi_history_math_p1: "Mover n discos exige al menos 2^n − 1 movimientos: primero los n − 1 más pequeños a la varilla del medio, luego el más grande a la meta y después los pequeños encima. Con 64 discos y un movimiento por segundo se tardaría mucho más que la edad del universo."
});
I18n.markTextLoaded("es");
