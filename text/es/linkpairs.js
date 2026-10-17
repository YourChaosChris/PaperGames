// text/es/linkpairs.js
// Rules and history texts of linkpairs (es). Loaded by linkpairs-rules.html and linkpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    linkpairs_rules_title: "Reglas de Unir las parejas",
    linkpairs_rules_intro: "Une cada pareja de símbolos iguales con una línea. Las líneas no pueden cruzarse y, juntas, llenan todo el tablero.",
    linkpairs_rules_basics_title: "Las reglas",
    linkpairs_term_board: "El tablero",
    linkpairs_rules_board: "Un tablero cuadrado de casillas. Algunas casillas tienen un símbolo – un número o un animal – y cada símbolo aparece exactamente dos veces.",
    linkpairs_term_lines: "Líneas",
    linkpairs_rules_lines: "Une cada pareja con una línea. Una línea va de casilla en casilla, en horizontal y en vertical, nunca en diagonal. Las líneas no pueden cruzarse, compartir casilla ni pasar por otro símbolo.",
    linkpairs_term_goal: "El objetivo",
    linkpairs_rules_goal: "El acertijo está resuelto cuando todas las parejas están unidas y cada casilla la usa una línea. Cada acertijo tiene exactamente una solución.",
    linkpairs_term_draw: "Dibujar",
    linkpairs_rules_draw: "Arrastra el dedo desde un símbolo, o toca el símbolo y luego las casillas una tras otra. Si te cruzas con otra línea, esa línea se acorta. Toca una casilla de una línea para que la línea termine ahí; puedes seguir dibujando desde esa casilla. Tocar un símbolo empieza su línea de nuevo: toca el símbolo donde empieza una línea para borrarla.",
    linkpairs_term_symbols: "Números o animales",
    linkpairs_rules_symbols: "En el menú eliges números o animales. Cada casilla de una línea lleva una pequeña copia de su símbolo, así se ve sin color qué línea pertenece a qué pareja.",
    linkpairs_term_tools: "Deshacer y Pista",
    linkpairs_rules_tools: "«Deshacer» retira tantos pasos como quieras. «Pista» dibuja entera una línea correcta; las líneas que estorban se acortan.",
    linkpairs_term_levels: "Niveles",
    linkpairs_rules_levels: "Fácil: 5 x 5. Medio: 7 x 7. Difícil: 9 x 9.",
    linkpairs_rules_example_title: "Un ejemplo resuelto",
    linkpairs_rules_example: "La imagen muestra un acertijo de 5 x 5 resuelto: todas las parejas están unidas, ninguna línea se cruza y se usan todas las casillas.",
    linkpairs_history_title: "La historia de los acertijos de unir",
    linkpairs_history_origins_title: "Primeras formas",
    linkpairs_history_origins_p1: "En 1897 apareció una forma algo distinta de este acertijo en una columna de Sam Loyd en el Brooklyn Daily Eagle. En 1917 Henry Ernest Dudeney incluyó una versión con parejas de letras en su libro «Amusements in Mathematics», como acertijo para automovilistas.",
    linkpairs_history_japan_title: "Números y letras",
    linkpairs_history_japan_p1: "En Japón, la editorial de acertijos Nikoli lo hizo popular en dos formas: con parejas de letras y con parejas de números. El nombre general del acertijo es Numberlink. Un acertijo se considera bien hecho cuando tiene exactamente una solución y las líneas llenan todas las casillas.",
    linkpairs_history_modern_title: "Cómo crea PaperGames cada acertijo",
    linkpairs_history_modern_p1: "Los acertijos se crearon de antemano con el generador propio de PaperGames: coloca líneas al azar que juntas pasan por todas las casillas y luego un resolutor comprueba que solo hay una manera de unir las parejas. Si encuentra una segunda, una línea se divide en dos parejas; las líneas cuyos extremos se tocan se vuelven a unir mientras la solución siga siendo la única."
});
I18n.markTextLoaded("es");
