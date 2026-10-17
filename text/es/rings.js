// text/es/rings.js
// Rules and history texts of rings (es). Loaded by rings-rules.html and rings-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    rg_rules_title: "Gira los anillos – reglas",
    rg_rules_intro: "Gira los anillos hasta que cada rayo muestre una sola figura.",
    rg_rules_basics_title: "Las reglas",
    rg_term_rings: "Los anillos",
    rg_rules_rings: "De tres a cinco anillos están uno dentro de otro, numerados de dentro hacia fuera. Cada anillo tiene 8 casillas, cada una con una figura: círculo, anillo, triángulo, cuadrado, estrella, rombo, cruz o luna creciente. Las figuras rellenas y huecas se distinguen sin color.",
    rg_term_turn: "Girar",
    rg_rules_turn: "Bajo el dibujo, cada anillo tiene dos botones: ↺ lo gira una casilla a la izquierda (en sentido antihorario), ↻ una casilla a la derecha (en sentido horario). El anillo salta enseguida a su nuevo lugar.",
    rg_term_goal: "Objetivo",
    rg_rules_goal: "Unas líneas discontinuas dividen el dibujo en 8 rayos desde el centro hacia fuera. El acertijo está resuelto cuando cada rayo muestra la misma figura en todos los anillos. Rayos distintos pueden mostrar figuras distintas.",
    rg_term_coupled: "Anillos acoplados",
    rg_rules_coupled: "En Difícil los anillos están acoplados: al girar un anillo también gira el siguiente hacia fuera una casilla en el mismo sentido. El anillo exterior gira solo.",
    rg_term_levels: "Niveles",
    rg_rules_levels: "Fácil: 3 anillos con 4 tipos de figura, de 3 a 5 movimientos. Medio: 4 anillos con 6 tipos, de 5 a 8 movimientos. Difícil: 5 anillos acoplados con 8 tipos, de 7 a 11 movimientos. El ordenador calcula el mínimo de movimientos de cada acertijo; se muestra desde el principio.",
    rg_term_help: "Pista",
    rg_rules_help: "«Pista» enmarca el botón de un giro que te acerca un paso a la solución. «Deshacer» retira el último giro; cuenta como movimiento.",
    rg_rules_example_title: "Ejemplo",
    rg_rules_example: "El anillo 2 va una casilla por delante del anillo 1. Un giro del anillo 2 a la izquierda pone la misma figura en cada rayo.",
    rg_history_title: "Historia de Gira los anillos",
    rg_history_disk_title: "El disco de cifrado de Alberti",
    rg_history_disk_p1: "En 1467 el erudito italiano Leon Battista Alberti describió en su tratado sobre cifras un disco de dos anillos unidos por un eje: un anillo exterior fijo con letras y un anillo interior giratorio con otros signos. Al girar el anillo interior, cada letra se emparejaba con otro signo. Se considera el primer ejemplo de cifrado con varios alfabetos.",
    rg_history_game_title: "Anillos como acertijo",
    rg_history_game_p1: "Los acertijos en los que se giran anillos o discos con dibujos hasta que todo encaja existen hoy de muchas formas, como juguetes y en libros de pasatiempos. La versión de aquí, con hasta cinco anillos y, en Difícil, anillos que arrastran a su vecino, está hecha para PaperGames. El ordenador comprueba cada acertijo y cuenta su mínimo de movimientos."
});
I18n.markTextLoaded("es");
