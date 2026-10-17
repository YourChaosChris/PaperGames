// text/es/shapesort.js
// Rules and history texts of shapesort (es). Loaded by shapesort-rules.html and shapesort-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    shapesort_rules_title: "Reglas de Ordenar formas",
    shapesort_rules_intro: "Un pasatiempo de ordenar con formas en lugar de colores: mueve las piedras hasta que cada tubo tenga una sola forma.",
    shapesort_rules_basics_title: "Las reglas",
    shapesort_term_tubes: "Los tubos",
    shapesort_rules_tubes: "Cada tubo tiene sitio para tantas piedras como se elija en Piedras por tubo: 4, 6, 8 o 10. Al principio las piedras están mezcladas y dos tubos están vacíos.",
    shapesort_term_move: "Un movimiento",
    shapesort_rules_move: "Toca un tubo: su piedra de arriba queda marcada, junto con las piedras de la misma forma justo debajo. Luego toca otro tubo. Las piedras van allí si ese tubo está vacío o tiene la misma forma arriba, tantas como quepan. Si vuelves a tocar el tubo marcado, dejas las piedras donde estaban.",
    shapesort_term_goal: "El objetivo",
    shapesort_rules_goal: "El pasatiempo está resuelto cuando cada tubo está vacío o lleno de piedras de la misma forma.",
    shapesort_term_shapes: "Las formas",
    shapesort_rules_shapes: "Círculo, cuadrado, triángulo, estrella, corazón, cruz, rombo y luna. Se distinguen por su contorno; unas están rellenas y otras solo dibujadas en contorno, pero eso es solo una ayuda más.",
    shapesort_term_levels: "Niveles",
    shapesort_rules_levels: "Fácil: 4 formas en 6 tubos. Medio: 6 formas en 8 tubos. Difícil: 8 formas en 10 tubos. El número de piedras por tubo se elige aparte; con más piedras las formas son más pequeñas y los tubos más altos. En pantallas estrechas los tubos se muestran en varias filas.",
    shapesort_term_tools: "Deshacer, Mezclar, Pista",
    shapesort_rules_tools: "«Deshacer» retira tantos movimientos como quieras. «Mezclar» reparte un pasatiempo nuevo. «Pista» marca dos tubos: mueve las piedras de arriba del primero al segundo. Se ha comprobado que cada pasatiempo tiene solución; si te atascas, la pista lo dice y puedes deshacer algunos movimientos.",
    shapesort_rules_example_title: "Ejemplo",
    shapesort_rules_example: "La imagen muestra tubos en mitad de una partida. Las piedras marcadas arriba del primer tubo pueden ir al tubo que tiene la misma forma arriba o al tubo vacío.",
    shapesort_history_title: "La historia de los pasatiempos de ordenar",
    shapesort_history_origins_title: "Piezas, varillas y reglas",
    shapesort_history_origins_p1: "Los pasatiempos en los que se mueven piezas entre soportes con reglas fijas son antiguos. En la torre de Hanói, publicada en 1883 por el matemático francés Édouard Lucas, los discos pasan de uno en uno entre tres varillas, nunca uno grande sobre otro más pequeño.",
    shapesort_history_sort_title: "Ordenar por clases",
    shapesort_history_sort_p1: "En los últimos años han aparecido muchos pasatiempos en los que se mueven piezas mezcladas entre recipientes hasta que cada uno tiene una sola clase, sobre todo como juegos para el móvil y casi siempre con colores. En una pantalla de tinta electrónica en blanco y negro los colores no sirven, así que PaperGames ordena formas.",
    shapesort_history_modern_title: "Cómo crea PaperGames cada pasatiempo",
    shapesort_history_modern_p1: "Cada pasatiempo se reparte al azar. Después un programa resolutor busca una forma de ordenarlo del todo; solo se usa un reparto para el que la encuentra, y ningún tubo empieza ya terminado. El mismo resolutor da las pistas."
});
I18n.markTextLoaded("es");
