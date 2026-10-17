// text/es/sudoku.js
// Rules and history texts of sudoku (es). Loaded by sudoku-rules.html and sudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    sudoku_rules_title: "Reglas del Sudoku",
    sudoku_rules_intro: "Una referencia rápida de cómo juega PaperGames al Sudoku, útil si estás oxidado, o si estás aprendiendo.",
    sudoku_rules_basics_title: "La idea básica",
    sudoku_term_board: "La cuadrícula",
    sudoku_rules_board: "La cuadrícula de 9x9 está dividida en nueve cajas de 3x3. Algunas celdas empiezan rellenas ('pistas iniciales') y no se pueden cambiar; el resto empiezan vacías para que las rellenes tú.",
    sudoku_term_goal: "El objetivo",
    sudoku_rules_goal: "Rellena cada celda vacía con un dígito del 1 al 9 de forma que cada fila, cada columna y cada una de las nueve cajas de 3x3 contenga cada dígito exactamente una vez. Todos los puzles que genera PaperGames tienen exactamente una solución.",
    sudoku_term_input: "Introducir números",
    sudoku_rules_input: "Selecciona una celda y luego elige un número del panel debajo del tablero (o escribe un dígito con el teclado). Una celda con un contorno discontinuo entra en conflicto actualmente con otra celda de su fila, columna o caja; tómalo como una pista de que algo tiene que cambiar.",
    sudoku_rules_end_title: "Terminar un puzle",
    sudoku_term_win: "Resuelto",
    sudoku_rules_win: "El puzle está resuelto en el momento en que la cuadrícula queda completamente rellena sin conflictos restantes.",
    sudoku_term_difficulty: "Dificultad",
    sudoku_rules_difficulty: "Los puzles Fácil, Medio y Difícil solo se diferencian en cuántas de las 81 celdas empiezan rellenas; menos pistas iniciales significa que hace falta más deducción para avanzar.",
    sudoku_history_title: "La historia del Sudoku",
    sudoku_history_origins_title: "Primero, un puzle estadounidense",
    sudoku_history_origins_p1: "El puzle de colocación numérica que hoy llamamos Sudoku apareció por primera vez en 1979 en una revista de puzles estadounidense, publicada por Dell Magazines bajo el título 'Number Place'. Su invención suele atribuirse a Howard Garns, un arquitecto jubilado y creador independiente de puzles, aunque la revista nunca publicaba los créditos de autoría en aquella época, así que la atribución se apoya en pruebas circunstanciales más que en una autoría firmada.",
    sudoku_history_origins_p2: "El puzle se basaba en una idea matemática mucho más antigua, el cuadrado latino —una cuadrícula en la que cada símbolo aparece exactamente una vez por fila y columna—, estudiada por Leonhard Euler en el siglo XVIII, a la que se añadió la restricción de las cajas de 3x3 para lograr una solución única alcanzable solo con lógica, sin adivinar.",
    sudoku_history_spread_title: "Un nombre japonés para una fiebre mundial",
    sudoku_history_spread_p1: "El puzle llegó a Japón en 1984 a través de la empresa de puzles Nikoli, que lo rebautizó como 'Suuji wa dokushin ni kagiru' ('los dígitos deben permanecer solteros'), pronto acortado a Sudoku ('número único'). Los editores de Nikoli también introdujeron la ahora convención estándar de un patrón simétrico de pistas iniciales y puzles con una única solución válida.",
    sudoku_history_spread_p2: "El Sudoku siguió siendo un pasatiempo japonés modesto durante dos décadas, hasta que el juez jubilado Wayne Gould, tras encontrárselo en un viaje a Tokio, escribió un programa informático para generar puzles rápidamente y convenció a The Times de Londres de empezar a publicarlos en 2004, desatando una fiebre mundial de puzles de periódico en aproximadamente un año.",
    sudoku_history_modern_title: "De la columna de periódico a la informática",
    sudoku_history_modern_p1: "La repentina popularidad del Sudoku atrajo tanto a matemáticos e informáticos como a resolutores casuales: en 2005 se calculó exactamente el número total de cuadrículas de 9x9 completadas distintas (algo más de 6,6 trillones), y en 2012 una búsqueda informática exhaustiva estableció que ningún puzle válido de 9x9 necesita menos de 17 pistas iniciales para tener una solución única.",
    sudoku_history_modern_p2: "Ese segundo resultado es exactamente el tipo de hecho en el que se apoya, a la inversa, el generador de PaperGames: como la unicidad se vuelve más difícil de preservar a medida que se retiran pistas, cada puzle aquí se produce partiendo de una cuadrícula completa resuelta y retirando celdas una a una mientras sobreviva una solución única: la misma lógica, aplicada al revés, que los creadores de puzles han usado desde los primeros números de Nikoli.",
    puzzle_rules_hint: "El botón «Pista» ayuda en tres pasos. La primera pulsación marca dónde está el siguiente paso. La segunda da el motivo, es decir, la regla que se aplica allí. La tercera realiza el paso (anota el número o construye el puente). La pista parte de tu situación actual: si en algún sitio hay un número o un puente equivocado, te lo dice primero. Nunca adivina: si solo se puede seguir probando, lo dice con sinceridad. Las pistas son ilimitadas. Un pasatiempo resuelto con pistas cuenta igualmente como victoria; las estadísticas muestran además cuántas victorias fueron con pistas."
});
I18n.markTextLoaded("es");
