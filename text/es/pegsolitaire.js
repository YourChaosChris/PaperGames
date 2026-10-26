// text/es/pegsolitaire.js
// Rules and history texts of pegsolitaire (es). Loaded by pegsolitaire-rules.html and pegsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    pegsolitaire_rules_title: "Reglas del Solitario",
    pegsolitaire_rules_intro: "Una referencia rápida de cómo juega PaperGames al Solitario, útil si estás oxidado, o si estás aprendiendo.",
    pegsolitaire_rules_basics_title: "La idea básica",
    pegsolitaire_term_board: "El tablero y la posición inicial",
    pegsolitaire_rules_board: "Antes de la partida eliges el tablero; el inglés (33 agujeros) viene preseleccionado. Todos los agujeros empiezan con una ficha salvo uno – cuál, se indica para cada tablero en «Los tableros».",
    pegsolitaire_term_jump: "Saltar",
    pegsolitaire_rules_jump: "Elige una clavija y luego un agujero vacío a dos casillas de distancia en línea recta (arriba, abajo, izquierda o derecha, nunca en diagonal) con otra clavija justo entre medias. La clavija salta al agujero vacío, y la clavija sobre la que saltó se retira del tablero. Excepción: en el tablero triangular también se puede saltar en diagonal, a lo largo de sus líneas inclinadas.",
    pegsolitaire_rules_end_title: "Terminar una partida",
    pegsolitaire_term_win: "Resuelto",
    pegsolitaire_rules_win: "El objetivo clásico es ir saltando hasta quedarte con una sola clavija. La partida también termina, sin resolver, en el momento en que ya no queda ningún salto legal, sean cuantas clavijas queden en el tablero.",
    pegsolitaire_rules_boards_title: "Los tableros",
    pegsolitaire_rules_boards: "Inglés: una cuadrícula de 7x7 sin las cuatro esquinas de 2x2, 33 agujeros; el centro está vacío. Europeo: una cuadrícula de 7x7 a la que solo se quitan tres agujeros en cada esquina, 37 agujeros; está vacío el agujero justo encima del centro, porque desde el centro no tiene solución. Alemán (J. C. Wiegleb, 1779): una cuadrícula de 9x9 sin las cuatro esquinas de 3x3, 45 agujeros; el centro está vacío. Cuadrado: la cuadrícula completa de 6x6, 36 agujeros; está vacío el de arriba a la izquierda de los cuatro agujeros centrales. Rombo grande: un rombo de 41 agujeros en una cuadrícula de 9x9; está vacío el agujero dos filas por encima del centro – en este tablero solo muy pocos agujeros iniciales tienen solución. Triángulo: cinco filas de 1 a 5 agujeros, cada fila desplazada medio agujero, 15 agujeros; está vacío el de arriba a la izquierda de los tres agujeros centrales. En todos los tableros de cuadrícula se salta solo en horizontal o en vertical, nunca en diagonal. Solo en el triángulo se puede saltar también en diagonal, a lo largo de sus líneas inclinadas: seis direcciones en total.",
    pegsolitaire_history_title: "La historia del Solitario",
    pegsolitaire_history_origins_title: "Un juego de la corte francesa",
    pegsolitaire_history_origins_p1: "La primera evidencia confirmada del Solitario procede de Francia, a finales del siglo XVII, donde el juego aparece en un grabado de 1697 y era lo bastante conocido en la corte de Luis XIV como para ser mencionado en escritos de la época. Una leyenda popular atribuye su invención a un noble francés encarcelado en la Bastilla,una historia encantadora sin ninguna prueba que la respalde, e inventada casi con toda seguridad mucho después de los hechos para dar al juego un origen más romántico.",
    pegsolitaire_history_origins_p2: "El tablero que se convirtió en estándar en Francia tiene 37 agujeros (añadiendo cuatro esquinas más a la cruz simple), mientras que la versión que se extendió a Inglaterra —la cruz de 33 agujeros usada aquí— se convirtió en el estándar de habla inglesa más habitual.",
    pegsolitaire_history_spread_title: "Un tablero, muchas formas",
    pegsolitaire_history_spread_p1: "Más allá de la cruz clásica, se han construido tableros de solitario en forma triangular (con su propia versión de 15 clavijas, un clásico de las mesas de restaurante estadounidenses durante décadas), en forma de diamante y en otras disposiciones: la regla del salto se mantiene idéntica sin importar la forma en que se organicen los agujeros.",
    pegsolitaire_history_wiegleb: "Una cruz mayor, de 45 agujeros en una cuadrícula de 9x9, la describió J. C. Wiegleb en 1779 en su libro «Unterricht in der natürlichen Magie» (Lecciones de magia natural).",
    pegsolitaire_history_spread_p2: "Como cada jugada retira exactamente una clavija, una partida completa de n clavijas a 1 siempre requiere exactamente n-1 saltos: uno de los pocos juegos de mesa donde el número de jugadas de una partida ganada queda fijado de antemano, sin importar qué secuencia concreta de saltos se use para llegar hasta ahí.",
    pegsolitaire_history_modern_title: "Un puzle resuelto, con un giro",
    pegsolitaire_history_modern_p1: "El Solitario atrajo una atención matemática seria en las décadas de 1960 y 1970, cuando investigadores como John Conway lo analizaron usando herramientas como recuentos de recursos (las llamadas funciones pagoda) y argumentos algebraicos para determinar exactamente qué posiciones finales de una sola clavija son alcanzables desde la posición inicial estándar: el centro es una de ellas, aunque no la única.",
    pegsolitaire_history_modern_p2: "Búsquedas informáticas posteriores resolvieron por completo la cuestión para el tablero de 33 agujeros: una partida que empieza con el centro vacío puede terminarse hasta quedar en una sola clavija, y se ha calculado el número exacto de partidas ganadoras: un caso poco frecuente de un puzle físico que se convierte en un problema combinatorio completamente resuelto."
});
I18n.markTextLoaded("es");
