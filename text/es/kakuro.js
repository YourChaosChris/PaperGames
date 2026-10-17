// text/es/kakuro.js
// Rules and history texts of kakuro (es). Loaded by kakuro-rules.html and kakuro-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    kakuro_rules_title: "Reglas del Kakuro",
    kakuro_rules_intro: "Una referencia rápida de cómo juega PaperGames al Kakuro - útil si tienes que refrescar la memoria, o si lo estás aprendiendo. El Kakuro a veces se describe como un «crucigrama de sudoku»: en vez de letras, cada casilla blanca lleva un dígito, y en vez de palabras, las pistas son sumas.",
    kakuro_rules_basics_title: "La idea básica",
    kakuro_term_board: "La cuadrícula",
    kakuro_rules_board: "La cuadrícula combina casillas negras con pistas y casillas blancas para rellenar. Toda línea continua de casillas blancas, leída de izquierda a derecha o de arriba abajo, se llama «serie». Cada serie tiene exactamente una pista: el total al que deben sumar sus dígitos.",
    kakuro_term_clues: "Cómo leer las casillas de pista",
    kakuro_rules_clues: "Una casilla negra muestra su suma (o sumas) en dígitos blancos, divididos en diagonal cuando lleva dos: el número de la esquina superior derecha es el objetivo de la serie de casillas blancas que empieza justo a su derecha (una pista «horizontal»), y el número de la esquina inferior izquierda es el objetivo de la serie que empieza justo debajo (una pista «vertical»). Una casilla negra con una sola pista muestra solo ese número.",
    kakuro_term_goal: "El objetivo",
    kakuro_rules_goal: "Rellena cada casilla blanca con un dígito del 1 al 9 para que los dígitos de cada serie sumen exactamente su pista - y, igual de importante, que ningún dígito se repita dentro de la misma serie (un dígito puede reaparecer en una serie que la cruce, pero nunca dos veces en la misma serie).",
    kakuro_term_input: "Introducir números",
    kakuro_rules_input: "Selecciona una casilla blanca y luego elige un dígito en el panel bajo el tablero (o teclea un dígito). Una casilla con el contorno discontinuo repite actualmente un dígito ya usado en alguna de sus series, o pertenece a una serie totalmente rellena cuyo total todavía no coincide con su pista - úsalo como aviso de que algo hay que cambiar.",
    kakuro_term_difficulty: "Dificultad",
    kakuro_rules_difficulty: "Los niveles Fácil, Medio y Difícil usan cuadrículas cada vez más grandes (7x7, 9x9 y 11x11), lo que significa series más largas y más cruces entre ellas - más dígitos que manejar a la vez, pero siempre las mismas dos reglas.",
    kakuro_rules_example_title: "Un ejemplo resuelto",
    kakuro_term_example: "Dos series que se cruzan",
    kakuro_rules_example_p1: "Supongamos que una serie horizontal de 2 casillas tiene la pista 4, y su primera casilla es también el inicio de una serie vertical de 2 casillas con pista 3. Los dos dígitos de la serie horizontal deben sumar 4 sin repetirse - solo 1+3 o 3+1 lo consiguen (2+2 repite el 2, así que no vale). Los dos dígitos de la serie vertical deben sumar 3 sin repetirse, lo que solo logran 1+2 o 2+1.",
    kakuro_rules_example_p2: "La casilla compartida debe tener un dígito que sirva para ambas series. La serie horizontal ofrece {1, 3} para esa casilla y la vertical ofrece {1, 2} - el único dígito común a ambos conjuntos es el 1. Así que la casilla compartida debe ser 1, lo que fija la otra casilla de la serie horizontal en 3 y la otra casilla de la serie vertical en 2. Todo el puzle queda resuelto solo por eliminación, sin necesidad de adivinar - el mismo tipo de deducción que, repetida muchas más veces, resuelve cualquier cuadrícula de Kakuro más grande.",
    kakuro_rules_end_title: "Terminar un puzle",
    kakuro_term_win: "Resuelto",
    kakuro_rules_win: "El puzle queda resuelto en cuanto todas las casillas blancas están rellenas, cada serie suma su pista y ninguna serie repite un dígito.",
    kakuro_history_title: "La historia del Kakuro",
    kakuro_history_origins_title: "Cross Sums, inventado en Estados Unidos",
    kakuro_history_origins_p1: "El crucigrama numérico hoy conocido como Kakuro fue inventado en 1966 por Jacques Cousin, un canadiense que trabajaba para la editorial de pasatiempos Dell Magazines, quien lo presentó en Estados Unidos con el nombre «Cross Sums» (también escrito «Cross Sum»). Pronto se convirtió en una sección habitual de las revistas de pasatiempos de Dell, junto a sus otros puzles numéricos y de lógica.",
    kakuro_history_origins_p2: "La idea combinaba el aspecto de una cuadrícula de crucigrama con aritmética en lugar de vocabulario: casillas negras con números de pista en lugar de definiciones, y casillas blancas que rellenar con dígitos cuyas sumas debían coincidir con esas pistas.",
    kakuro_history_spread_title: "Un nombre japonés para una segunda vida",
    kakuro_history_spread_p1: "Cross Sums llegó a Japón, donde la editorial de pasatiempos Nikoli - la misma empresa que más tarde popularizaría y bautizaría el Sudoku - lo adoptó y le dio el nombre «Kakuro», contracción de «kasan kurosu» (加算クロス), que en japonés significa «cruz de suma».",
    kakuro_history_spread_p2: "A lo largo de los años ochenta, el Kakuro se convirtió en uno de los pasatiempos más populares de Nikoli en Japón, ganando allí seguidores mucho antes del auge del Sudoku que después llevaría el nombre de Nikoli al resto del mundo.",
    kakuro_history_modern_title: "Un pasatiempo redescubierto",
    kakuro_history_modern_p1: "La proyección internacional del Kakuro volvió a crecer a mediados de la década de 2000, a raíz del auge mundial del Sudoku en los periódicos, cuando los editores de pasatiempos que buscaban un sucesor recurrieron a otros puzles numéricos de Nikoli - lo que hizo que muchos aficionados occidentales conocieran el Kakuro por primera vez bajo su nombre japonés, aunque el puzle en sí se había inventado décadas antes en Norteamérica.",
    kakuro_history_modern_p2: "Esa historia en dos etapas se refleja en cómo se resuelve el puzle todavía hoy: una cuadrícula de Kakuro nunca requiere adivinar, solo la misma eliminación serie por serie que ya usaban los aficionados al Cross Sums original de Dell - expresada simplemente dígito a dígito, una pista cada vez, el mismo principio que el generador de esta colección usa al revés para construir un puzle nuevo a partir de una cuadrícula rellenada al azar."
});
I18n.markTextLoaded("es");
