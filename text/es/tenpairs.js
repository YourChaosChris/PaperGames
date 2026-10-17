// text/es/tenpairs.js
// Rules and history texts of tenpairs (es). Loaded by tenpairs-rules.html and tenpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    tp_rules_title: "Reglas de Parejas de diez",
    tp_rules_intro: "Tacha parejas de números hasta que no quede ninguno.",
    tp_rules_basics_title: "Las reglas",
    tp_term_field: "El campo",
    tp_rules_field: "Números del 1 al 9 en nueve columnas, que se leen fila a fila como un texto.",
    tp_term_pairs: "Parejas",
    tp_rules_pairs: "Dos números se tachan juntos si son iguales (3 y 3) o suman 10 (1 y 9, 2 y 8, 3 y 7, 4 y 6, 5 y 5).",
    tp_term_see: "Verse",
    tp_rules_see: "Los dos deben verse: uno junto al otro en horizontal, vertical o diagonal, o con solo casillas tachadas entre ellos en esa línea. En horizontal también pasa por encima del final de la fila: el último número de una fila ve al primero de la siguiente, y así en el orden de lectura.",
    tp_term_add: "Copiar",
    tp_rules_add: "Cuando te atasques, toca Copiar: todos los números que aún no están tachados se escriben de nuevo, en el mismo orden, al final del campo. Como máximo 5 veces por partida.",
    tp_term_rows: "Filas vacías",
    tp_rules_rows: "Una fila cuyas nueve casillas están tachadas desaparece.",
    tp_term_end: "Ganar y perder",
    tp_rules_end: "Ganas cuando todos los números están tachados. Pierdes cuando no queda ninguna pareja ni ninguna copia, o cuando el campo crece a más de 40 filas.",
    tp_term_start: "Inicio",
    tp_rules_start: "Clásico: 1 2 3 4 5 6 7 8 9 y luego 1 1 1 2 1 3 1 4 1 5 1 6 1 7 1 8 1 9 (los números del 1 al 19 sin el 10). Aleatorio: tres, cuatro o cinco filas; cuanto más fácil el nivel, más parejas están una junto a otra.",
    tp_term_help: "Ayuda",
    tp_rules_help: "Deshacer retrocede tantos pasos como quieras. Pista marca una pareja que se puede tachar o dice que solo queda Copiar.",
    tp_rules_example_title: "Ejemplo",
    tp_rules_example: "El inicio clásico. El 1 de arriba a la izquierda y el 1 de debajo se ven (en vertical) y son iguales. El 9 al final de la primera fila y el 1 al principio de la segunda se ven por encima del final de la fila y suman 10.",
    tp_history_title: "Historia de Parejas de diez",
    tp_history_origins_title: "De los cuadernos escolares",
    tp_history_origins_p1: "El origen de este pasatiempo no está documentado en las fuentes que PaperGames pudo consultar. Un artículo de 2011 en el sitio web ruso Habr lo recuerda de la escuela y la universidad: se jugaba en cuadernos cuadriculados, con nombres como «números», «cifras», «pipas» o «19»; no había un nombre oficial. Allí el juego empieza con los números del 1 al 19 (sin el 10) escritos seguidos, los mismos números que el inicio clásico de aquí, y cuando no queda ninguna pareja se copian al final los números que quedan.",
    tp_history_name_title: "El nombre",
    tp_history_name_p1: "«Parejas de diez» dice simplemente de qué se trata. Varias aplicaciones usan la misma idea con nombres propios; PaperGames no los utiliza. Las parejas en diagonal y los límites de 5 copias y de 40 filas son reglas de PaperGames."
});
I18n.markTextLoaded("es");
