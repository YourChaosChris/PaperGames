// text/es/teufelsieben.js
// Rules and history texts of teufelsieben (es). Loaded by teufelsieben-rules.html and teufelsieben-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    ts_rules_title: "Reglas del Siete del Diablo",
    ts_rules_intro: "Descubre cartas una a una y para a tiempo: un número que ya tienes te hace pasarte. Cuando alguien alcanza el objetivo, gana quien tenga más puntos.",
    ts_rules_basics_title: "Las reglas",
    ts_term_cards: "Las cartas",
    ts_rules_cards: "60 cartas. Números del 1 al 10: tres 1, cuatro 2, cinco 3, seis de cada 4, 5, 6 y 7, cinco 8, cuatro 9 y tres 10. Dos de cada carta especial: Valor, Tachar, Pasar, Puente, Coleccionista y Mirar.",
    ts_term_turn: "Tu turno",
    ts_rules_turn: "Cada jugador tiene un turno completo por ronda. Descubre cartas una a una; después de la primera, puedes parar cuando quieras. La ronda acaba cuando todos han jugado. El primer jugador avanza un puesto cada ronda.",
    ts_term_bust: "Estallar",
    ts_rules_bust: "Un número que ya tienes te hace estallar: cero puntos esta ronda. Valor te salva una vez; descarta el número repetido y Valor. Cada Valor usado cuesta 5 puntos al final de la ronda.",
    ts_term_run: "Secuencias",
    ts_rules_run: "La secuencia más larga de 4 números o más da 5 × (longitud − 2): cuatro seguidos dan 10 y cinco dan 15. Cada Puente cubre un número que falta.",
    ts_term_extreme: "Cadena salvaje",
    ts_rules_extreme: "Antes de jugar puedes elegir las cartas «Cadena salvaje»: se añaden 12 cartas, 72 en total – los números 11, 12, 13 y 14 (2 cartas de cada uno), Eslabón (2 cartas, +2 puntos por cada número de tu serie más larga de 2 o más, con dos Eslabones +4) y Espejo (2 cartas: tu último número n pasa a ser 15 − n, así se intercambian 1 y 14, 2 y 13 … 7 y 8; si ya tienes ese número, o aún no tienes ninguno, no pasa nada). Las series llegan hasta 14. Se juega hasta 250 o 500 puntos.",
    ts_term_special: "Cartas especiales",
    ts_rules_special: "Valor te salva una vez y cuesta 5 puntos al usarlo. Tachar quita tu último número. Pasar: el siguiente jugador que aún tiene turno en esta ronda debe empezarlo con una carta ya descubierta, que también puede hacerle pasarse; si no queda nadie, no tiene efecto. Puente: se queda contigo la ronda y sustituye un número que falta en tu serie, así 4 5 _ 7 cuenta como cuatro seguidos. Coleccionista da 1 punto por número. Mirar muestra la siguiente carta.",
    ts_term_points: "Puntos y final",
    ts_rules_points: "Los puntos de la ronda son la suma de números, más el bonus de secuencia y 1 por número por cada Coleccionista, menos 5 por Valor usado (mínimo cero). Meta: 60, 90 o 120; por defecto 90. Tras la ronda en que alguien llega a la meta, gana la puntuación más alta; los empates ganan juntos.",
    ts_term_computer: "El ordenador",
    ts_rules_computer: "El ordenador cuenta solo cartas visibles y la que muestra Mirar. Fácil para pronto; Difícil compara la ganancia posible con el riesgo.",
    ts_rules_example_title: "Ejemplo",
    ts_rules_example: "Tienes 3, 4, 5, 6 y 9: 27 puntos en números. La secuencia de cuatro suma 10: 37 antes de los efectos especiales.",
    ts_history_title: "Acerca del Siete del Diablo",
    ts_history_family_title: "Seguir o parar",
    ts_history_family_p1: "En estos juegos se decide una y otra vez si asumir otro riesgo o conservar lo conseguido. Muchos juegos de dados y cartas funcionan así.",
    ts_history_modern_title: "Esta versión",
    ts_history_modern_p1: "El Siete del Diablo se creó para PaperGames, con cartas, reglas y textos propios: una mezcla de números del 1 al 10, un bonus por secuencias y Valor, Tachar, Pasar, Puente, Coleccionista y Mirar.",
});
I18n.markTextLoaded("es");
