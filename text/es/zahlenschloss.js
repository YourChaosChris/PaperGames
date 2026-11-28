// text/es/zahlenschloss.js
// Rules and history texts of zahlenschloss (es). Loaded by zahlenschloss-rules.html and zahlenschloss-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    zahlenschloss_rules_title: "Reglas de Código del candado",
    zahlenschloss_rules_intro: "Un candado se abre con un código secreto. Algunos números te dicen cuánto se acercan. No tienes que adivinar: las pistas contienen todo lo necesario.",
    zahlenschloss_rules_basics_title: "Las reglas",
    zahlenschloss_term_code: "El código",
    zahlenschloss_rules_code: "El código tiene tres cifras (Fácil y Medio) o cuatro (Difícil). No se repite ninguna cifra y puede empezar por 0.",
    zahlenschloss_term_clues: "Las pistas",
    zahlenschloss_rules_clues: "Cada pista es un número con tantas cifras como el código y una frase: indica cuántas cifras están en el código en la posición correcta y cuántas están en el código, pero en otra posición. «Ninguna cifra es correcta» quiere decir que ninguna aparece en el código. Cada acertijo tiene una única solución y necesitas todas las pistas.",
    zahlenschloss_term_notes: "Notas",
    zahlenschloss_rules_notes: "Toca una cifra de una pista para tacharla, por ejemplo, si sabes que no está en el código. Tócala otra vez para recuperarla. Deshacer elimina tu última nota. Las notas son solo para ti y nunca cuentan.",
    zahlenschloss_term_enter: "Abrir el candado",
    zahlenschloss_rules_enter: "Escribe el código con las teclas numéricas en las casillas vacías y toca Abrir. Un código incorrecto cuenta como error, pero puedes volver a intentarlo enseguida. El botón Pista indica una deducción a partir de una o dos pistas. Ver solución pone el código en las casillas tras una pregunta; el acertijo cuenta entonces como abandonado.",
    zahlenschloss_term_levels: "Niveles",
    zahlenschloss_rules_levels: "Fácil tiene tres cifras e incluye siempre una pista sin ninguna cifra correcta. Medio tiene tres cifras y todas las pistas tienen al menos una cifra correcta. Difícil tiene cuatro cifras. Cada acertijo tiene un número; el mismo número siempre corresponde al mismo acertijo.",
    zahlenschloss_history_title: "La historia de Código del candado",
    zahlenschloss_history_origins_title: "Posición correcta o incorrecta",
    zahlenschloss_history_origins_p1: "La idea de distinguir las cifras correctas en el lugar correcto de las que están en un lugar equivocado viene de un antiguo juego de papel y lápiz, llamado a menudo toros y vacas. Una persona piensa un número con cifras distintas; la otra propone números y recibe una respuesta después de cada intento. El juego puede tener un siglo; hacia 1970 se convirtió en uno de los primeros juegos para ordenadores universitarios.",
    zahlenschloss_history_puzzle_title: "Un acertijo con pistas fijas",
    zahlenschloss_history_puzzle_p1: "Más adelante, el juego de adivinar se convirtió en un acertijo: se dan todas las respuestas a la vez y hay que deducir el código. Estos acertijos de candados con cinco pistas se difundieron mucho por internet en la década de 2010 y hoy aparecen en libros de pasatiempos y aulas. La idea no pertenece a nadie.",
    zahlenschloss_history_here_title: "Código del candado aquí",
    zahlenschloss_history_here_p1: "La idea la envió una persona jugadora. PaperGames crea sus propios acertijos: un ordenador prueba todos los códigos posibles, conserva solo los que tienen una única solución y elimina las pistas innecesarias."
});
I18n.markTextLoaded("es");
