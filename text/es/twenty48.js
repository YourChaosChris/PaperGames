// text/es/twenty48.js
// Rules and history texts of twenty48 (es). Loaded by twenty48-rules.html and twenty48-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    twenty48_rules_title: "Reglas del 2048",
    twenty48_rules_intro: "Una referencia rápida de cómo juega PaperGames al 2048, útil si estás oxidado, o si estás aprendiendo.",
    twenty48_rules_basics_title: "La idea básica",
    twenty48_term_board: "El tablero y el deslizamiento",
    twenty48_rules_board: "Cada movimiento desliza todas las fichas del tablero de 4x4 tan lejos como puedan llegar en una dirección: arriba, abajo, izquierda o derecha. Después de cada movimiento que realmente desplace algo, aparece una nueva ficha (normalmente un 2, ocasionalmente un 4) en una celda vacía al azar.",
    twenty48_term_merging: "Fusión",
    twenty48_rules_merging: "Cuando dos fichas del mismo valor chocan al deslizarse, se fusionan en una ficha que vale su suma, y ese nuevo valor se añade a tu puntuación. Cada ficha solo puede fusionarse una vez por movimiento, así que tres fichas iguales que se deslizan juntas fusionan el par delantero y dejan la tercera ficha intacta en lugar de encadenarse.",
    twenty48_rules_end_title: "Cómo termina una partida",
    twenty48_term_win: "Llegar a 2048",
    twenty48_rules_win: "Fusiona tu camino hasta una ficha de 2048 y habrás ganado, pero la partida no se detiene ahí. Sigue jugando después para llevar tu puntuación (y el tablero) aún más lejos.",
    twenty48_term_loss: "Quedarse sin movimientos",
    twenty48_rules_loss: "La partida termina en el momento en que el tablero está completamente lleno y no hay dos fichas adyacentes que compartan valor, de modo que ningún movimiento, en ninguna dirección, podría cambiar nada.",
    twenty48_history_title: "La historia del 2048",
    twenty48_history_origins_title: "Construido sobre Threes",
    twenty48_history_origins_p1: "El 2048 fue creado en marzo de 2014 por el desarrollador italiano de 19 años Gabriele Cirulli en un solo fin de semana, como ejercicio personal para aprender a construir un juego completo rápidamente. No inventó la mecánica central desde cero: 2048 es un clon explícito de un juego llamado 1024 (de Veewo Studio), que a su vez se inspiró en un juego anterior llamado Threes! (de Asher Vollmer, Greg Wohlwend y Jimmy Hinson) que llevaba más de un año en desarrollo cuidadoso.",
    twenty48_history_origins_p2: "Cirulli publicó el código fuente de 2048 de forma gratuita bajo una licencia abierta desde el primer día, algo que resultó importar enormemente: en lugar de cerrar el paso a los clones, los invitó, y el juego se difundió al ser reimplementado sin parar y de forma legal, más que simplemente jugado.",
    twenty48_history_spread_title: "Una sensación viral y clonada",
    twenty48_history_spread_p1: "El juego se hizo viral pocos días después de su lanzamiento, atrayendo según se dice a millones de jugadores en sus primeras dos semanas, y provocó una enorme oleada de clones, adaptaciones y variantes: versiones con nuevo aspecto que cambiaban de todo, desde emojis hasta personajes de la cultura pop, además de variantes de tamaño, variantes de fichas de colores y versiones tridimensionales.",
    twenty48_history_spread_p2: "Esta versión de PaperGames mantiene deliberadamente el tablero original de 4x4 y la probabilidad original de aparición del 90 %/10 % entre un dos y un cuatro, en lugar de elegir alguna de esas variantes: la misma elección que hace esta colección en todos los demás casos, favoreciendo el conjunto de reglas estándar y bien conocido frente a un giro novedoso sobre él.",
    twenty48_history_modern_title: "Un tablero pequeño, estudiado en serio",
    twenty48_history_modern_p1: "A pesar de sus reglas sencillas, el juego óptimo de 2048 resulta ser un problema de búsqueda genuinamente difícil debido a la aleatoriedad en la aparición de fichas: los mejores jugadores informáticos usan la búsqueda expectimax (sopesando las jugadas frente a la probabilidad de cada posible ficha siguiente) en lugar de la simple búsqueda minimax que permite un juego determinista como el ajedrez.",
    twenty48_history_modern_p2: "Los mejores jugadores informáticos documentados pueden alcanzar la ficha de 32768 con alta probabilidad y en ocasiones han llegado a 65536: dos duplicaciones más allá de la ficha que la mayoría de los jugadores humanos se alegran de ver alguna vez."
});
I18n.markTextLoaded("es");
