// text/es/nonogram.js
// Rules and history texts of nonogram (es). Loaded by nonogram-rules.html and nonogram-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    nonogram_rules_title: "Reglas de los Nonogramas",
    nonogram_rules_intro: "Una referencia rápida de cómo juega PaperGames a los Nonogramas (también llamados Griddlers), útil si estás oxidado, o si estás aprendiendo.",
    nonogram_rules_basics_title: "La idea básica",
    nonogram_term_clues: "Leer las pistas",
    nonogram_rules_clues: "Cada fila y columna tiene una pista: una secuencia de números que da la longitud de cada bloque consecutivo de celdas rellenas en esa línea, en orden, separados por al menos una celda vacía. Una pista de \"3 1\" significa una tanda de tres celdas rellenas, luego un hueco, y luego una celda rellena más, en algún lugar de esa línea.",
    nonogram_term_filling: "Rellenar y marcar",
    nonogram_rules_filling: "Usa el modo Rellenar para sombrear una celda de la que estés seguro que forma parte del dibujo, y el modo Marcar X para tachar una celda de la que estés seguro que está vacía; marcar es puramente una ayuda de memoria y no afecta a ganar, pero ayuda a descartar posibilidades mientras trabajas con las pistas.",
    nonogram_rules_end_title: "Terminar un puzle",
    nonogram_term_win: "Resuelto",
    nonogram_rules_win: "El puzle se resuelve en el instante en que tus celdas rellenas coinciden exactamente con el dibujo oculto; las celdas marcadas no necesitan ser correctas, solo importan las rellenas.",
    nonogram_history_title: "La historia de los nonogramas",
    nonogram_history_origins_title: "Dos inventores, dos continentes",
    nonogram_history_origins_p1: "El puzle se remonta a dos invenciones independientes a mediados de la década de 1980: Non Ishida, una diseñadora gráfica japonesa, creó puzles de cuadrícula que revelaban imágenes mediante lógica basada en pistas hacia 1985, mientras que casi al mismo tiempo el diseñador de puzles británico James Dalgety inventó un concepto similar y acuñó el nombre 'Griddlers'.",
    nonogram_history_origins_p2: "Los puzles de Ishida se publicaron en una revista japonesa de puzles y pronto tuvieron éxito; el nombre 'Nonogram' en sí se entiende generalmente como una mezcla de 'Non' (su nombre de pila) y '-gram', aunque el puzle es conocido con varios otros nombres en distintos países, incluidos Griddlers, Picross y Hanjie.",
    nonogram_history_spread_title: "De las revistas a la Game Boy",
    nonogram_history_spread_p1: "Nintendo popularizó el puzle en todo el mundo bajo el nombre 'Picross' (un acrónimo de 'picture' y 'crossword'), lanzando juegos de Picross para Game Boy y Super Famicom a partir de 1995; para muchos jugadores fuera de Japón, esa serie portátil fue su primer contacto con el formato.",
    nonogram_history_spread_p2: "El atractivo del puzle resultó viajar mucho más allá de los videojuegos dedicados: las páginas de puzles de los periódicos lo adoptaron junto al Sudoku durante el auge de los puzles de la década de 2000, normalmente bajo el nombre de Griddlers o Hanjie, y sigue siendo un básico de los libros de puzles y las apps hoy en día.",
    nonogram_history_modern_title: "Un puzle que (normalmente) no necesita adivinar",
    nonogram_history_modern_p1: "Un nonograma bien construido está diseñado para poder resolverse solo mediante deducción lógica pura, línea a línea, sin necesidad de adivinar nunca, que es exactamente la propiedad que se comprueba en los propios puzles de PaperGames antes de incluirlos, usando un solucionador de propagación de restricciones que confirma que las pistas de cada imagen admiten una única cuadrícula válida.",
    nonogram_history_modern_p2: "Eso no es cierto para cualquier conjunto de pistas posible, sin embargo: al igual que el Buscaminas, se ha demostrado que resolver nonogramas en general es NP-completo, lo que significa que un puzle lo bastante grande o deliberadamente adverso puede requerir auténtico tanteo al estilo de la vuelta atrás para resolverse; los puzles bien diseñados para resolutores humanos están construidos específicamente para evitar eso, lo cual es en sí mismo una pequeña forma de arte."
});
I18n.markTextLoaded("es");
