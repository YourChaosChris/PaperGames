// text/es/nim.js
// Rules and history texts of nim (es). Loaded by nim-rules.html and nim-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    nim_rules_title: "Reglas del Nim",
    nim_rules_intro: "Dos jugadores toman por turnos piedras de varios montones. Con la regla normal, gana quien toma la última piedra.",
    nim_rules_basics_title: "Las reglas",
    nim_term_move: "Un movimiento",
    nim_rules_move: "Elige una fila y toma de ella tantas piedras como quieras, al menos una. Toca la piedra hasta la que quieres tomar: ella y todas las piedras a su derecha reciben una cruz. Luego toca «Tomar piedras».",
    nim_term_end: "El final",
    nim_rules_end: "Normal: quien toma la última piedra gana. Misère: quien toma la última piedra pierde.",
    nim_term_heaps: "Montones",
    nim_rules_heaps: "3, 4 y 5 piedras (por defecto), los clásicos 1, 3, 5 y 7, o montones al azar (3 o 4 montones de 1 a 7 piedras).",
    nim_term_secret: "La regla ganadora",
    nim_rules_secret: "Escribe cada tamaño de montón en binario y suma las columnas sin llevar (xor): el resultado es la suma nim. Si es 0, el jugador al que le toca pierde ante un juego perfecto; si no, siempre hay un movimiento que la deja en 0. En misère se juega igual hasta que solo quedarían montones de una piedra; entonces se deja un número impar de ellos.",
    nim_term_computer: "El ordenador",
    nim_rules_computer: "Fácil juega cualquier movimiento, Medio el mejor movimiento la mitad de las veces, Difícil siempre el mejor. Desde una posición ganadora, Difícil es imbatible; por eso la línea bajo los montones dice si el inicio está ganado o perdido para quien empieza: elige quién empieza teniéndolo en cuenta.",
    nim_history_title: "La historia del Nim",
    nim_history_origins_title: "Quitar piedras",
    nim_history_origins_p1: "Los juegos en los que se quitan objetos de montones se juegan desde la Antigüedad; el origen del Nim es incierto. A menudo se relaciona con el juego chino jiǎn shízǐ («recoger piedras»), y las referencias europeas más antiguas datan de comienzos del siglo XVI.",
    nim_history_bouton_title: "Bouton, 1901",
    nim_history_bouton_p1: "En 1901, Charles L. Bouton, de la Universidad de Harvard, publicó la teoría completa del juego y le dio el nombre de Nim. Nunca explicó el nombre; a menudo se relaciona con la palabra alemana «nimm» («¡toma!»).",
    nim_history_machines_title: "Máquinas de Nim",
    nim_history_machines_p1: "El Nim fue uno de los primeros juegos que jugaron las máquinas: el Nimatron en la Exposición Universal de Nueva York en 1940 y un ordenador de Ferranti presentado en el Festival of Britain en 1951."
});
I18n.markTextLoaded("es");
