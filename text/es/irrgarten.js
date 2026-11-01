// text/es/irrgarten.js
// Rules and history texts of irrgarten (es). Loaded by irrgarten-rules.html and irrgarten-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    ig_rules_title: "Reglas del laberinto",
    ig_rules_intro: "Un laberinto cuadrado de casillas y paredes. Encuentra el camino desde la salida hasta la meta.",
    ig_rules_basics_title: "Las reglas",
    ig_term_move: "Avanzar",
    ig_rules_move: "Empiezas en la casilla del círculo, arriba a la izquierda; la meta es la bandera abajo a la derecha. Toca una casilla contigua para avanzar, o una más lejana por un pasillo recto y libre para llegar de una vez. El camino se dibuja con una línea gruesa.",
    ig_term_draw: "Trazar con el dedo",
    ig_rules_draw: "En los ajustes puedes elegir «Trazar con el dedo»: mueve el dedo por los pasillos y el círculo irá de casilla en casilla. También puedes tocar.",
    ig_term_walls: "Paredes y retroceso",
    ig_rules_walls: "No se pueden cruzar paredes; un aviso breve te lo indica. Al volver a la casilla de la que venías, esta desaparece del camino. Toca cualquier casilla de tu camino para volver a ella.",
    ig_term_goal: "La meta",
    ig_rules_goal: "Al llegar a la bandera, resuelves el laberinto. Cada laberinto tiene un único camino desde la salida hasta la meta.",
    ig_term_levels: "Niveles",
    ig_rules_levels: "Fácil (para niños): 6 x 6 casillas con pasillos anchos. Medio: 10 x 10. Difícil: 15 x 15. Muy difícil: 20 x 20. Cada nivel tiene cinco laberintos, uno tras otro. El programa crea cada uno a partir de un número fijo, así que siempre es igual.",
    ig_term_help: "Atrás y pista",
    ig_rules_help: "«Atrás» retrocede una casilla. «Pista» marca con círculos discontinuos las tres casillas siguientes del camino correcto, incluso desde un callejón sin salida.",
    ig_history_title: "La historia de los laberintos",
    ig_history_old_title: "Diseños muy antiguos",
    ig_history_old_p1: "En piedras, monedas y suelos de muchas culturas antiguas hay diseños sinuosos que llevan al centro. Muchos solo tienen un camino, sin opciones; los rompecabezas con callejones sin salida llegaron después.",
    ig_history_puzzle_title: "Setos y libros de pasatiempos",
    ig_history_puzzle_p1: "Desde el siglo XVI se plantaban laberintos de setos en jardines, donde los visitantes podían perderse. En los siglos XIX y XX, los laberintos de papel se hicieron habituales en revistas infantiles y libros de pasatiempos. Los matemáticos los describen como grafos, y los programas pueden crear nuevos sin fin.",
    ig_history_here_title: "Esta versión",
    ig_history_here_p1: "El programa crea aquí cada laberinto: recorre la cuadrícula y derriba paredes hasta que se puede llegar a todas las casillas. No se copia ningún laberinto de un libro."
});
I18n.markTextLoaded("es");
