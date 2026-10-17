// text/es/amazons.js
// Rules and history texts of amazons (es). Loaded by amazons-rules.html and amazons-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    amazons_rules_title: "Reglas de Amazonas",
    amazons_rules_intro: "Una referencia rápida de cómo PaperGames juega al Juego de las Amazonas - útil si estás oxidado o si lo estás aprendiendo.",
    amazons_rules_basics_title: "La idea básica",
    amazons_term_setup: "La preparación",
    amazons_rules_setup: "Cada jugador tiene cuatro amazonas en un tablero de 10x10, colocadas en la posición inicial simétrica estándar. En este juego no hay capturas de ningún tipo - se gana únicamente por el movimiento y el control del territorio.",
    amazons_term_moving: "Mover una amazona",
    amazons_rules_moving: "En tu turno, mueve una de tus amazonas cualquier número de casillas vacías en línea recta - horizontal, vertical o diagonalmente - exactamente como una dama de ajedrez. Nunca puede saltar sobre otra amazona ni sobre una casilla quemada.",
    amazons_term_shooting: "Disparar una flecha",
    amazons_rules_shooting: "Justo después de moverse, esa misma amazona debe disparar una flecha desde su nueva casilla: otro desplazamiento al estilo de una dama, en cualquiera de las 8 direcciones, solo a través de casillas vacías, aterrizando en una casilla vacía.",
    amazons_term_burned: "Casillas quemadas",
    amazons_rules_burned: "Allí donde aterriza una flecha, esa casilla queda quemada durante el resto de la partida - terreno permanentemente infranqueable que ninguna amazona ni ninguna flecha futura podrá volver a cruzar o donde podrá aterrizar.",
    amazons_rules_end_title: "Ganar la partida",
    amazons_term_win: "Cómo termina la partida",
    amazons_rules_win: "Si es tu turno y ninguna de tus amazonas tiene ya un solo movimiento legal - bloqueadas en todas direcciones por otras amazonas, casillas quemadas o el borde del tablero - pierdes. Gana el último jugador que todavía pueda mover.",
    amazons_history_title: "La Historia del Juego de las Amazonas",
    amazons_history_origins_title: "Inventado en 1988",
    amazons_history_origins_p1: "El Juego de las Amazonas fue inventado en 1988 por Walter Zamkauskas, un diseñador de juegos argentino, y publicado por primera vez en la revista argentina de pasatiempos El Acertijo (publicada en español).",
    amazons_history_origins_p2: "Sus piezas, que se mueven como damas, recuerdan al ajedrez, pero el disparo de flecha que cierra cada turno - quemando una casilla de forma permanente tras cada movimiento - es una idea totalmente propia, que convierte el juego de una carrera en un lento estrangulamiento del espacio disponible del rival.",
    amazons_history_design_title: "Un favorito de la teoría de juegos combinatoria",
    amazons_history_design_p1: "Amazonas no tiene tablas ni capturas, y posee un árbol de juego realmente enorme - según algunas estimaciones, mayor que el del Go -, lo que lo convirtió en un tema natural para los investigadores de la teoría de juegos combinatoria y en una cita habitual en competiciones y olimpiadas de juegos por ordenador desde finales de los años 90.",
    amazons_history_design_p2: "Conseguir que un ordenador jugara bien resultó ser un reto propio y serio: con decenas de movimientos de pieza legales y, para cada uno, decenas de disparos de flecha legales, un solo turno puede tener bastante más de mil movimientos legales - muchos más que en el ajedrez -, lo que empujó a los programas de Amazonas hacia una ordenación de movimientos exhaustiva y un análisis del territorio de final de partida en lugar de la simple fuerza bruta.",
    amazons_history_version_title: "Esta versión",
    amazons_history_version_p1: "PaperGames juega con las reglas estándar en el tablero estándar de 10x10 con cuatro amazonas por bando. Cada turno es una simple secuencia de tres toques: toca una amazona, toca su destino y luego toca el lugar desde el que dispara su flecha."
});
I18n.markTextLoaded("es");
