// text/es/freecell.js
// Rules and history texts of freecell (es). Loaded by freecell-rules.html and freecell-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    freecell_rules_title: "Reglas del FreeCell",
    freecell_rules_intro: "Una referencia rápida de cómo juega PaperGames al FreeCell, útil si estás oxidado, o si estás aprendiendo.",
    freecell_rules_basics_title: "La idea básica",
    freecell_term_layout: "La disposición",
    freecell_rules_layout: "Las 52 cartas se reparten boca arriba en 8 columnas de tablero desde el principio: a cuatro cartas de completar una séptima carta en las cuatro últimas columnas. Cuatro celdas libres encima de las columnas pueden contener cada una exactamente una carta, y cuatro fundaciones (una por palo) se construyen del As al Rey.",
    freecell_term_tableau: "Mover cartas",
    freecell_rules_tableau: "Una carta puede moverse a una columna del tablero solo sobre una carta exactamente un rango superior y de color opuesto, o a cualquier columna vacía. Una serie de varias cartas ya apiladas en ese mismo orden descendente y alterno puede moverse junta como un único \"supermovimiento\", hasta un límite marcado por cuántas celdas libres y columnas vacías haya disponibles para transportarlas.",
    freecell_term_foundation: "Fundaciones",
    freecell_rules_foundation: "Una fundación solo acepta su propio palo, empezando por el As y subiendo un rango cada vez. Una vez que una carta está en una fundación, se queda allí: las fundaciones solo reciben cartas, nunca las devuelven al tablero.",
    freecell_rules_end_title: "Terminar una partida",
    freecell_term_win: "Victoria",
    freecell_rules_win: "La partida se gana en el momento en que las cuatro fundaciones están completas, del As al Rey. A diferencia del reparto del Mahjong Solitaire de aquí, un reparto de FreeCell es simplemente una baraja mezclada al azar: la inmensa mayoría se pueden resolver, exactamente igual que en el juego real, pero PaperGames no ofrece ninguna garantía especial para ningún reparto en concreto.",
    freecell_history_title: "La historia del FreeCell",
    freecell_history_origins_title: "Un juego de cartas de información abierta",
    freecell_history_origins_p1: "El FreeCell desciende de una familia de juegos de paciencia \"abiertos\" al estilo del \"Baker's Game\", que se remontan al menos a principios del siglo XX, en los que todas las cartas se reparten boca arriba desde la primera jugada: a diferencia de la mayoría de los solitarios, nada permanece oculto, así que un jugador (o un ordenador) lo bastante hábil puede en principio averiguar si un reparto dado es ganable antes de hacer una sola jugada.",
    freecell_history_origins_p2: "La adición de las celdas libres —pequeñas zonas de espera para aparcar cartas individuales de forma temporal— suele atribuirse a Paul Alfille, que creó una versión digital temprana llamada FreeCell para el sistema informático PLATO en 1978, refinando el antiguo formato de tablero abierto hasta el conjunto de reglas concreto que se juega hoy.",
    freecell_history_spread_title: "Incluido con Windows",
    freecell_history_spread_p1: "El FreeCell se convirtió en un nombre familiar después de que Microsoft lo incluyera con Windows a partir de 1995, junto al Solitario y el Buscaminas, dándolo a conocer a cientos de millones de usuarios de PC que nunca lo habían visto antes, de forma muy parecida a como el Buscaminas alcanzó su propia fama.",
    freecell_history_spread_p2: "La versión de Microsoft venía con un conjunto fijo de 32 000 repartos numerados en lugar de una nueva baraja aleatoria cada vez, lo que permitía a los jugadores comparar notas y repetir un reparto concreto: una costumbre que esta versión de PaperGames no sigue, generando en su lugar una baraja genuinamente nueva cada vez.",
    freecell_history_modern_title: "El reparto que (casi) siempre se gana",
    freecell_history_modern_p1: "Como todas las cartas son visibles desde el principio, el FreeCell se presta de forma inusual al análisis informático: de los 32 000 repartos numerados originales de Microsoft, búsquedas exhaustivas con programas resolutores encontraron que todos menos uno —el reparto número 11 982— son resolubles, un dato curioso que los aficionados al FreeCell todavía mencionan décadas después.",
    freecell_history_modern_p2: "Investigaciones posteriores llevaron el análisis más lejos, confirmando que solo un puñado de repartos entre el primer millón de partidas numeradas son irresolubles, razón por la cual una simple baraja aleatoria, como la que usa esta versión, es una apuesta tan segura: las probabilidades de caer en una de esas raras excepciones son insignificantes."
});
I18n.markTextLoaded("es");
