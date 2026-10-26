// text/es/teufelsieben.js
// Rules and history texts of teufelsieben (es). Loaded by teufelsieben-rules.html and teufelsieben-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    ts_rules_title: "Reglas de Cadena de suerte",
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
    ts_term_special: "Cartas especiales",
    ts_rules_special: "Valor te salva una vez y cuesta 5 puntos al usarlo. Tachar quita tu último número. Pasar hace que el siguiente jugador empiece con una carta descubierta. Puente cubre un hueco. Coleccionista da 1 punto por número. Mirar muestra la siguiente carta.",
    ts_term_points: "Puntos y final",
    ts_rules_points: "Los puntos de la ronda son la suma de números, más el bonus de secuencia y 1 por número por cada Coleccionista, menos 5 por Valor usado (mínimo cero). Meta: 60, 90 o 120; por defecto 90. Tras la ronda en que alguien llega a la meta, gana la puntuación más alta; los empates ganan juntos.",
    ts_term_computer: "El ordenador",
    ts_rules_computer: "El ordenador cuenta solo cartas visibles y la que muestra Mirar. Fácil para pronto; Difícil compara la ganancia posible con el riesgo.",
    ts_rules_example_title: "Ejemplo",
    ts_rules_example: "Tienes 3, 4, 5, 6 y 9: 27 puntos en números. La secuencia de cuatro suma 10: 37 antes de los efectos especiales.",
    ts_history_title: "Acerca de Cadena de suerte",
    ts_history_family_title: "Seguir o parar",
    ts_history_family_p1: "En estos juegos se decide una y otra vez si asumir otro riesgo o conservar lo conseguido. Muchos juegos de dados y cartas funcionan así.",
    ts_history_modern_title: "Esta versión",
    ts_history_modern_p1: "Cadena de suerte se creó para PaperGames, con cartas, reglas y textos propios: una mezcla de números del 1 al 10, un bonus por secuencias y Valor, Tachar, Pasar, Puente, Coleccionista y Mirar.",
});
I18n.markTextLoaded("es");
