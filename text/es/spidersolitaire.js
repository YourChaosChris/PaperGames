// text/es/spidersolitaire.js
// Rules and history texts of spidersolitaire (es). Loaded by spidersolitaire-rules.html and spidersolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    spidersolitaire_rules_title: "Reglas del Solitario Spider",
    spidersolitaire_rules_intro: "Una referencia rápida de cómo PaperGames juega al Solitario Spider - útil si estás oxidado, o aprendiendo.",
    spidersolitaire_rules_basics_title: "La idea básica",
    spidersolitaire_term_layout: "La disposición",
    spidersolitaire_rules_layout: "Dos barajas completas (104 cartas) se reparten en 10 columnas de tablero - las primeras 4 columnas reciben 6 cartas cada una, las otras 6 reciben 5 cartas cada una - con solo la carta superior de cada columna boca arriba. No hay fundaciones. Las 50 cartas restantes forman el mazo, que se reparte más tarde en tandas de 10.",
    spidersolitaire_term_difficulty: "Elegir una dificultad",
    spidersolitaire_rules_difficulty: "Antes de empezar, elige cuántos palos hay en juego: 1 palo es lo más fácil (cualquier carta del rango adecuado puede extender cualquier escalera), 2 palos es medio, y 4 palos es la versión tradicional y más difícil - exactamente como dos barajas reales mezcladas juntas.",
    spidersolitaire_term_tableau: "Mover una sola carta",
    spidersolitaire_rules_tableau: "Una carta solo puede moverse a una columna de tablero sobre una carta exactamente un rango superior - el palo no importa para esto. Una columna vacía acepta cualquier carta, o cualquier escalera válida, sin ninguna restricción de rango.",
    spidersolitaire_term_group: "Mover un grupo de cartas",
    spidersolitaire_rules_group: "Varias cartas ya apiladas solo pueden moverse juntas como una unidad si ya están en una escalera correctamente descendente del MISMO palo (por ejemplo un 5-4-3 de Corazones, en ese orden exacto) - mover una escalera que mezcla palos, aunque los rangos desciendan correctamente, no está permitido. Mover un grupo sigue cumpliendo la regla de colocación de rango superior anterior. En cuanto las cartas se alejan, la carta recién expuesta en la parte superior de su columna se voltea automáticamente boca arriba.",
    spidersolitaire_term_stock: "El mazo",
    spidersolitaire_rules_stock: "Toca el mazo para repartir su siguiente tanda de 10 cartas, una carta boca arriba en cada una de las 10 columnas. El reparto se bloquea mientras alguna columna esté vacía - vacíala primero (moviendo sus cartas a otro lugar o completando una escalera a través de ella) antes de poder repartir de nuevo.",
    spidersolitaire_term_sequences: "Completar una escalera",
    spidersolitaire_rules_sequences: "Cuando una escalera completa de Rey a As, todas del mismo palo y en orden, queda contigua en una columna, se detecta automáticamente y se elimina - no hace falta que sean las únicas cartas de esa columna, solo que estén correctamente apiladas en el punto donde se levantarían juntas de forma natural. Cada escalera completada suma uno al contador sobre el tablero.",
    spidersolitaire_rules_end_title: "Terminar una partida",
    spidersolitaire_term_win: "Ganar",
    spidersolitaire_rules_win: "La partida se gana en cuanto se han formado y eliminado las 8 escaleras de Rey a As - eso son 104 cartas / 13, el mismo total sin importar qué dificultad de número de palos hayas elegido.",
    spidersolitaire_history_title: "La historia del Solitario Spider",
    spidersolitaire_history_origins_title: "Un favorito sin documentar",
    spidersolitaire_history_origins_p1: "A diferencia de algunos juegos de cartas con un inventor rastreable, el origen exacto del Solitario Spider no está documentado con precisión - como muchos juegos de solitario, evolucionó a través del juego popular en lugar de atribuirse a una sola persona o a una única primera publicación. Lo que está claro es que, a principios o mediados del siglo XX, ya era un favorito bien establecido dentro de la familia de solitarios de dos barajas jugados en papel y fieltro mucho antes de que existieran los ordenadores.",
    spidersolitaire_history_origins_p2: "Su nombre casi con certeza alude a su propia dificultad y estructura, más que a cualquier imagen de araña en las cartas: ocho escaleras similares a fundaciones que hay que tejer juntas (haciendo eco de las ocho patas de una araña) a partir de diez columnas de tablero muy extendidas, sin ninguna ayuda de color o de fundación por palo en cuanto entran en juego cuatro palos.",
    spidersolitaire_history_spread_title: "Incluido con Windows",
    spidersolitaire_history_spread_p1: "El momento más famoso de popularización masiva del Solitario Spider llegó en 1998, cuando Microsoft lo incluyó como juego integrado en Windows - apareciendo primero en el paquete Windows 98 Plus! y en la era de Windows Me, para luego convertirse en una inclusión estándar a partir de Windows XP.",
    spidersolitaire_history_spread_p2: "Esa única decisión presentó Spider a una enorme audiencia global, de la misma forma en que Windows ya lo había hecho antes con el Klondike (llamado simplemente «Solitario») y más tarde con el FreeCell - convirtiendo un juego de cartas que había vivido tranquilamente en mesas de cartas físicas durante décadas en uno de los programas más jugados del mundo, sin que sus jugadores tuvieran nunca que poseer una baraja de cartas real.",
    spidersolitaire_history_modern_title: "Esta versión",
    spidersolitaire_history_modern_p1: "PaperGames juega con las reglas estándar con las tres dificultades tradicionales de número de palos seleccionables desde el principio - 1 palo, 2 palos, o el juego completo de 4 palos - con el mismo enfoque de menor fricción y baraja realmente nueva en cada partida que ya usan el Klondike y el FreeCell de esta colección, adaptado al propio diseño de diez columnas sin fundaciones del Spider."
});
I18n.markTextLoaded("es");
