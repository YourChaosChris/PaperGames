// text/es/mathcross.js
// Rules and history texts of mathcross (es). Loaded by mathcross-rules.html and mathcross-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    mc_rules_title: "Cuadrícula de cálculo – reglas",
    mc_rules_intro: "Coloca los números del 1 al 9 para que cada cuenta cuadre.",
    mc_rules_basics_title: "Las reglas",
    mc_term_grid: "La cuadrícula",
    mc_rules_grid: "Nueve casillas en tres filas y tres columnas, con un signo de operación entre casillas vecinas (+, −, ×, ÷) y el resultado al final de cada fila y debajo de cada columna. Cada número del 1 al 9 va en una sola casilla. Algunos números están dados.",
    mc_term_order: "De izquierda a derecha",
    mc_rules_order: "Una fila se calcula de izquierda a derecha y una columna de arriba abajo, paso a paso, sin que la multiplicación vaya primero: 3 + 4 × 2 da 7 × 2 = 14, no 11. Algunas versiones escolares de este acertijo usan la jerarquía habitual de operaciones; aquí siempre es de izquierda a derecha.",
    mc_term_whole: "Números enteros",
    mc_rules_whole: "Cada resultado intermedio y cada resultado es un número entero mayor que 0; así, una división siempre es exacta.",
    mc_term_levels: "Niveles",
    mc_rules_levels: "Fácil: solo + y −, 4 números dados. Medio: también ×, 3 dados. Difícil: las cuatro operaciones con al menos una ÷, 2 dados. Cada acertijo tiene una sola solución y se resuelve sin adivinar.",
    mc_term_help: "Jugar",
    mc_rules_help: "Toca una casilla vacía y luego un número debajo del tablero; toca otra vez el número o Borrar para vaciar la casilla. Un número que ya está en otra casilla se mueve aquí. Cuando una fila o columna está llena, una marca o una cruz indica si cuadra. El botón Pista señala primero un número incorrecto; si no, rellena una casilla que ya se puede deducir.",
    mc_rules_example_title: "Ejemplo",
    mc_rules_example: "Una cuadrícula de cálculo resuelta. Fila central: 9 − 1 = 8, luego 8 × 3 = 24, de izquierda a derecha, no 9 − 3 = 6.",
    mc_history_title: "Historia de la cuadrícula de cálculo",
    mc_history_magic_title: "El cuadrado mágico",
    mc_history_magic_p1: "El acertijo numérico más conocido con los números del 1 al 9 en una cuadrícula de 3 × 3 es el cuadrado mágico, en el que cada fila, columna y diagonal suma 15. En China se llama Lo Shu (Luoshu) y está ligado a una leyenda sobre una tortuga. Su verdadera antigüedad sigue sin estar clara: las fechas que dan las fuentes están muy alejadas entre sí.",
    mc_history_today_title: "Cuentas en filas y columnas",
    mc_history_today_p1: "La cuadrícula de cálculo conserva la cuadrícula de 3 × 3 con los números del 1 al 9, pero pide una cuenta distinta en cada fila y columna. Acertijos de este tipo aparecen en cuadernos escolares y colecciones de pasatiempos, a veces con la jerarquía habitual de operaciones. PaperGames no ha podido averiguar dónde apareció esta forma por primera vez; el nombre describe simplemente lo que se ve."
});
I18n.markTextLoaded("es");
