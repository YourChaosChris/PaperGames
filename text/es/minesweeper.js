// text/es/minesweeper.js
// Rules and history texts of minesweeper (es). Loaded by minesweeper-rules.html and minesweeper-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    minesweeper_rules_title: "Reglas del Buscaminas",
    minesweeper_rules_intro: "Una referencia rápida de cómo juega PaperGames al Buscaminas, útil si estás oxidado, o si estás aprendiendo.",
    minesweeper_rules_basics_title: "La idea básica",
    minesweeper_term_board: "La cuadrícula y el primer clic",
    minesweeper_rules_board: "Hay minas ocultas repartidas por la cuadrícula. Tu primera casilla revelada siempre es segura: las minas solo se colocan después, evitando esa casilla y todo lo que la rodea, así que la partida nunca termina antes de empezar.",
    minesweeper_term_numbers: "Leer los números",
    minesweeper_rules_numbers: "Revelar una casilla segura muestra un número: cuántas minas se esconden en sus ocho casillas vecinas. Una casilla en blanco significa cero, y revelarla abre automáticamente toda el área en blanco conectada.",
    minesweeper_term_flags: "Marcar con banderas",
    minesweeper_rules_flags: "Marca con una bandera una casilla que creas que esconde una mina, usando el modo bandera (para pantallas táctiles) o un clic derecho (en un navegador de escritorio); las casillas marcadas no se pueden revelar por accidente. Hacer clic en un número ya revelado cuyas casillas marcadas coinciden con su cuenta revela de golpe el resto de sus vecinas, igual que un clic central en el juego de escritorio clásico, pero una bandera mal colocada todavía puede costarte la partida de esta forma.",
    minesweeper_rules_end_title: "Cómo termina una partida",
    minesweeper_term_win: "Victoria",
    minesweeper_rules_win: "Revela todas las casillas que no sean una mina y habrás despejado el tablero.",
    minesweeper_term_loss: "Derrota",
    minesweeper_rules_loss: "Revela una mina y la partida termina de inmediato: se muestran todas las minas del tablero, con la que te alcanzó marcada aparte del resto.",
    minesweeper_history_title: "La historia del Buscaminas",
    minesweeper_history_origins_title: "De los mainframes al escritorio",
    minesweeper_history_origins_p1: "Los juegos de revelar-y-deducir al estilo Buscaminas se remontan a principios de la década de 1960 y aparecieron bajo varios nombres en mainframes y ordenadores personales tempranos a lo largo de la década de 1980, incluida una versión de 1989 para Windows/OS2 llamada 'Mined-Out' y varios clones gratuitos con nombres como 'RLogic' y 'Cube'.",
    minesweeper_history_origins_p2: "La versión para Windows que hizo famoso el juego se debe a dos empleados de Microsoft: Curt Johnson escribió primero el juego para OS/2 de IBM y Robert Donner lo trasladó a Windows. Apareció por primera vez en 1990 en el Microsoft Entertainment Pack y desde 1992 formó parte de la instalación estándar de Windows 3.1, donde sustituyó al anterior juego de Windows Reversi.",
    minesweeper_history_spread_title: "Instalado en todos los escritorios",
    minesweeper_history_spread_p1: "Como Windows se instaló en una proporción abrumadora de los ordenadores del mundo durante las décadas de 1990 y 2000, el Buscaminas se convirtió casi por defecto en uno de los juegos de ordenador más jugados de la historia: instalado en todas partes, sin necesidad de manual, y jugable en los minutos muertos entre tareas de trabajo real.",
    minesweeper_history_spread_p2: "El primer clic garantizado como seguro, hoy considerado una parte fundamental de las reglas, fue en sí mismo un refinamiento: la versión original de 1992 a veces podía matarte en el primerísimo clic, una frustración que versiones posteriores eliminaron retrasando la colocación de las minas hasta después de esa primera revelación, el mismo método usado aquí.",
    minesweeper_history_modern_title: "Un puzle genuinamente difícil",
    minesweeper_history_modern_p1: "Más allá de la nostalgia, el Buscaminas resulta ser matemáticamente serio: en el año 2000, Richard Kaye demostró que determinar si un tablero de Buscaminas parcialmente revelado tiene una solución consistente con sus pistas es un problema NP-completo, situándolo en la misma clase de complejidad computacional que problemas notoriamente difíciles como el del viajante de comercio.",
    minesweeper_history_modern_p2: "Ese resultado significa que no existe ningún algoritmo atajo conocido que siempre resuelva rápidamente una posición arbitraria de Buscaminas: en los casos más difíciles, un jugador (o un ordenador) puede verse reducido a una auténtica apuesta al 50/50 sin forma de deducir la casilla segura solo con lógica, que es exactamente el momento que todo jugador experimentado ha aprendido a temer."
});
I18n.markTextLoaded("es");
