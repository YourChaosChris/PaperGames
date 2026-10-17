// text/es/arrows.js
// Rules and history texts of arrows (es). Loaded by arrows-rules.html and arrows-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    aw_rules_title: "Flechas – reglas",
    aw_rules_intro: "Saca todas las flechas del tablero.",
    aw_rules_basics_title: "Las reglas",
    aw_term_move: "Mover",
    aw_rules_move: "Toca una flecha. Sale del tablero deslizándose en la dirección de su punta, pero solo si todas las casillas desde la punta hasta el borde están libres. Una flecha de varias casillas sigue a su punta; tampoco su propio cuerpo puede estar en medio.",
    aw_term_blocked: "Bloqueada",
    aw_rules_blocked: "Si otra flecha está en medio, la flecha tocada se queda donde está y la que estorba recibe un marco punteado. No hay penalización: saca primero esa flecha.",
    aw_term_glide: "Flechas que se deslizan (Difícil y Maestro)",
    aw_rules_glide: "En Difícil, una flecha bloqueada no se queda quieta: se desliza hacia delante, con el cuerpo siguiendo a la cabeza, hasta la siguiente flecha y se detiene allí. Eso puede bloquear otras flechas para siempre: piensa antes de tocar. Deshacer anula un movimiento, y Pista busca una salida desde la posición actual. Allí las flechas tienen hasta dos esquinas y ocupan 11 × 11 casillas.",
    aw_term_master: "Maestro",
    aw_rules_master: "Como Difícil, pero con tres corazones: cada toque que no saca una flecha del tablero cuesta uno. No hay pista ni marco para la flecha que estorba. Sin corazones puedes volver a intentar el mismo acertijo.",
    aw_term_goal: "Objetivo",
    aw_rules_goal: "Vacía todo el tablero. Cada acertijo está hecho para tener solución, y sacar una flecha nunca bloquea a otra, así que no puedes quedarte atascado. El mínimo de movimientos es el número de flechas; deshacer también cuenta como movimiento.",
    aw_term_levels: "Niveles",
    aw_rules_levels: "Fácil: 5 × 5 casillas con flechas cortas. Medio: 7 × 7 con flechas de dos a cuatro casillas. Difícil: 11 × 11 con flechas que se deslizan, de hasta siete casillas y dos esquinas. Maestro: como Difícil, con tres corazones. Gran maestro: 15 × 15, con flechas deslizantes de hasta 15 casillas y seis giros, además de tres corazones. Las figuras usan una de doce siluetas de casillas. Las pistas funcionan en Gran maestro y en las figuras.",
    aw_term_help: "Pista",
    aw_rules_help: "«Pista» marca una flecha que puede salir ahora.",
    aw_rules_example_title: "Ejemplo",
    aw_rules_example: "La flecha larga apunta a la derecha, pero la corta le cierra el paso. La flecha corta puede salir hacia arriba; después el camino queda libre para la larga.",
    aw_history_title: "Historia de Flechas",
    aw_history_slide_title: "Piezas que se deslizan",
    aw_history_slide_p1: "Los acertijos en los que las piezas se deslizan dentro de un marco son antiguos. El más conocido es el juego del 15: quince bloques numerados en una caja con sitio para dieciséis. Lo inventó Noyes Palmer Chapman, jefe de correos de Canastota, en el estado de Nueva York. Desde diciembre de 1879, el artesano de la madera de Boston Matthias Rice lo fabricó como «Gem Puzzle», y en 1880 causó furor en América y pronto en Europa. Sam Loyd afirmó más tarde haberlo inventado, pero no tuvo nada que ver.",
    aw_history_arrows_title: "Flechas que salen",
    aw_history_arrows_p1: "En el acertijo de flechas cada pieza solo puede moverse en una dirección y sale del tablero en lugar de deslizarse de un lado a otro. Estos acertijos se han hecho populares en los últimos años en juegos para pantallas táctiles; no se conoce un inventor concreto. Los acertijos de aquí están hechos para PaperGames: construidos al revés, para que cada tablero pueda vaciarse."
});
I18n.markTextLoaded("es");
