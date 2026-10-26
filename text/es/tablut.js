// text/es/tablut.js
// Rules and history texts of tablut (es). Loaded by tablut-rules.html and tablut-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    tablut_rules_title: "Reglas del Tablut",
    tablut_rules_intro: "Una referencia rápida de cómo juega PaperGames al Tablut, el miembro de 9x9 de la familia Tafl, útil si estás oxidado, o si estás aprendiendo.",
    tablut_rules_basics_title: "La idea básica",
    tablut_term_setup: "La preparación",
    tablut_rules_setup: "El rey empieza en el trono central, en medio de una cruz de ocho defensores, asediado por ocho atacantes situados de dos en dos en cada lado. Los atacantes mueven primero, y los dos bandos persiguen objetivos muy distintos: el bando del rey quiere que llegue a una esquina, los atacantes quieren atraparlo antes.",
    tablut_term_moving: "Movimiento",
    tablut_rules_moving: "Toda pieza —atacante, defensor o el rey— se mueve como una torre: cualquier distancia en línea recta, pero nunca a través de otra pieza ni sobre ella.",
    tablut_term_special: "El trono y las esquinas",
    tablut_rules_special: "El trono central y las cuatro casillas de esquina están prohibidos para todos salvo para el rey: los atacantes y defensores no pueden ni ocuparlos ni atravesarlos, aunque el rey puede volver libremente al trono vacío. Las esquinas son las únicas casillas de escape del rey.",
    tablut_term_capture: "Captura",
    tablut_rules_capture: "Una pieza normal (atacante o defensor) se captura mediante captura de custodio: atrápala entre dos piezas enemigas, o una pieza enemiga y una casilla especial hostil (el trono vacío o una esquina), en lados opuestos de una línea recta. Solo la pieza que acaba de moverse puede desencadenar una captura, así que mover tú mismo una pieza entre dos enemigas siempre es seguro.",
    tablut_rules_example_title: "Ejemplo resuelto",
    tablut_rules_example_intro: "Dos ejemplos breves de cómo funciona la captura en la práctica (usando las coordenadas clásicas a-i / 1-9, columna y luego fila):",
    tablut_term_example_ordinary: "Una captura ordinaria",
    tablut_rules_example_ordinary: "Un defensor sueco está en d6, con un atacante moscovita en c6, justo al oeste. Cuando un segundo atacante se desliza a e6, el defensor queda atrapado entre dos atacantes en línea recta, y es capturado.",
    tablut_term_example_throne: "Una captura asistida por el trono",
    tablut_rules_example_throne: "Un defensor en e6 está justo al sur del trono vacío (e5). Basta con que un solo atacante se deslice a e7, justo al sur del defensor, para capturarlo: el trono vacío cuenta como hostil en el lado opuesto, así que no hace falta una segunda pieza atacante.",
    tablut_rules_end_title: "Ganar la partida",
    tablut_term_kingcapture: "Capturar al rey",
    tablut_rules_kingcapture: "El rey solo se captura cuando las cuatro casillas ortogonalmente adyacentes a él son hostiles: ocupadas por atacantes, o —para un lado que da al trono— el propio trono vacío, que cuenta como una casilla hostil equivalente a un atacante. A diferencia de una pieza normal, el borde del tablero nunca cuenta como hostil para el rey en este reglamento: un rey empujado al borde del tablero sigue necesitando un atacante real en cada lado abierto.",
    tablut_term_win: "Cómo termina la partida",
    tablut_rules_win: "El bando del rey gana en el instante en que llega a cualquiera de las cuatro esquinas. Los atacantes ganan capturando al rey como se describe arriba. Un bando sin ningún movimiento legal en su turno pierde.",
    tablut_history_title: "La historia del Tablut",
    tablut_history_linnaeus_title: "Linneo en Laponia",
    tablut_history_linnaeus_p1: "En 1732, el naturalista sueco Carlos Linneo —décadas antes de revolucionar la biología con su sistema para nombrar especies— viajó por Laponia catalogando plantas, animales y las costumbres del pueblo sami que fue encontrando por el camino. Entre sus notas, registró un juego de mesa que los sami llamaban Tablut: su tablero de 9x9, sus piezas y las reglas con las que jugaban.",
    tablut_history_linnaeus_p2: "Esa descripción resultó ser enormemente importante. Prácticamente ningún reglamento completo de ningún juego Tafl sobrevivió desde la propia era vikinga: el juego simplemente había caído en desuso en la mayor parte de Europa antes de que a nadie se le ocurriera poner sus reglas por escrito. Las notas de Linneo sobre el Tablut, aunque registradas siglos después del apogeo vikingo del Tafl e imperfectas en algunos puntos (su manuscrito es ambiguo en un par de casos límite, y la primera traducción inglesa de 1811 añadió errores propios; por eso distintas reconstrucciones y reglamentos modernos aún discrepan hoy en algunos detalles), siguen siendo la fuente primaria más importante que los estudiosos han usado desde entonces para reconstruir cómo se jugaba probablemente toda la familia Tafl.",
    tablut_history_family_title: "La variante Tafl más conocida",
    tablut_history_family_p1: "En parte gracias a esa documentación, el Tablut es el miembro más conocido e históricamente más importante de la familia Tafl: el que más se usa como base a la hora de reconstruir las reglas de sus numerosos parientes, desde el pequeño Brandub de 7x7 hasta el enorme Alea Evangelii de 19x19.",
    tablut_history_brandub_link: "PaperGames también tiene la variante Brandub, más pequeña, en un tablero de 7x7, por si quieres comparar los dos tamaños de tablero.",
    tablut_history_version_title: "Esta versión",
    tablut_history_version_p1: "PaperGames juega al Tablut en el tablero estándar de 9x9 con 8 atacantes, 8 defensores y un rey, con una regla moderna y claramente definida para capturar al rey (consulta la página de reglas), ya que, como muestran las propias notas de Linneo, incluso la fuente mejor documentada sobre el Tafl deja algunos detalles abiertos a interpretación."
});
I18n.markTextLoaded("es");
