// text/es/irrgarten.js
// Rules and history texts of irrgarten (es). Loaded by irrgarten-rules.html and irrgarten-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    ig_rules_title: "Reglas del laberinto",
    ig_rules_intro: "Un laberinto cuadrado de casillas y paredes. Encuentra el camino desde la salida hasta la meta.",
    ig_rules_basics_title: "Las reglas",
    ig_term_move: "Avanzar",
    ig_rules_move: "Empiezas en la casilla con el círculo; la meta es la bandera. Ambos pueden estar en cualquier sitio, en el borde o en el centro. Toca una casilla junto a ti para entrar, o una casilla más lejos en un pasillo recto y abierto para ir allí directamente. Tu camino aparece como una línea gruesa.",
    ig_term_draw: "Trazar con el dedo",
    ig_rules_draw: "En los ajustes puedes elegir «Trazar con el dedo»: mueve el dedo por los pasillos y el círculo irá de casilla en casilla. También puedes tocar.",
    ig_term_walls: "Paredes y retroceso",
    ig_rules_walls: "No se pueden cruzar paredes; un aviso breve te lo indica. Al volver a la casilla de la que venías, esta desaparece del camino. Toca cualquier casilla de tu camino para volver a ella.",
    ig_term_goal: "La meta",
    ig_rules_goal: "Del inicio salen dos o tres caminos, pero solo uno llega a la bandera; los demás terminan en callejones sin salida. Cuando llegas a la bandera, el laberinto está resuelto. Cada laberinto tiene exactamente un camino del inicio a la meta.",
    ig_term_levels: "Niveles",
    ig_rules_levels: "Fácil (para niños): 6 x 6 casillas con pasillos largos y pocas bifurcaciones. Medio: 10 x 10. Difícil: 15 x 15. Muy difícil: 20 x 20. Cuanto más alto el nivel, más bifurcaciones. Cada nivel tiene cinco laberintos por tipo de juego, uno tras otro; cada uno lo crea el programa a partir de un número fijo, así que siempre es igual.",
    ig_term_help: "Atrás y pista",
    ig_rules_help: "«Atrás» retrocede una casilla. «Pista» marca con círculos discontinuos las tres casillas siguientes del camino correcto, incluso desde un callejón sin salida.",
    ig_term_multi: "Varias figuras",
    ig_rules_multi: "En los ajustes puedes elegir «Varias figuras»: dos o tres figuras salen de lugares distintos, cada una con su meta: el niño (círculo lleno) a la escuela (círculo vacío), el perro (cuadrado lleno) a la caseta (cuadrado vacío), el gato (triángulo lleno) a la cesta (triángulo vacío). Toca una figura o su botón bajo el laberinto para elegirla; la elegida tiene un anillo. Cada figura tiene exactamente un camino hasta su meta. El laberinto está resuelto cuando todas han llegado.",
    ig_history_title: "La historia de los laberintos",
    ig_history_old_title: "Diseños muy antiguos",
    ig_history_old_p1: "En piedras, monedas y suelos de muchas culturas antiguas hay diseños sinuosos que llevan al centro. Muchos solo tienen un camino, sin opciones; los rompecabezas con callejones sin salida llegaron después.",
    ig_history_puzzle_title: "Setos y libros de pasatiempos",
    ig_history_puzzle_p1: "Desde el siglo XVI se plantaban laberintos de setos en jardines, donde los visitantes podían perderse. En los siglos XIX y XX, los laberintos de papel se hicieron habituales en revistas infantiles y libros de pasatiempos. Los matemáticos los describen como grafos, y los programas pueden crear nuevos sin fin.",
    ig_history_here_title: "Esta versión",
    ig_history_here_p1: "El programa crea aquí cada laberinto: recorre la cuadrícula y derriba paredes hasta que se puede llegar a todas las casillas. No se copia ningún laberinto de un libro."
});
I18n.markTextLoaded("es");
