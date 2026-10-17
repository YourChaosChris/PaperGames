// text/es/blackjack.js
// Rules and history texts of blackjack (es). Loaded by blackjack-rules.html and blackjack-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    bj_rules_title: "Reglas del Blackjack",
    bj_rules_intro: "Acércate más a 21 que la banca, pero sin pasarte. Dos variantes, un solo juego: con fichas, que solo son puntos.",
    bj_rules_basics_title: "Las reglas",
    bj_term_variants: "Dos variantes",
    bj_rules_variants: "17 y 4 se juega con 32 cartas (del 7 al as) y el Blackjack con 52 cartas (del 2 al as). Elige la variante en Nueva partida.",
    bj_term_values17: "Valor de las cartas en 17 y 4",
    bj_rules_values17: "As 11, rey 4, reina 3, jota 2, las cartas del 7 al 10 según su valor. Dos ases como primeras cartas se llaman «fuego» y son la mejor mano.",
    bj_term_valuesbj: "Valor de las cartas en Blackjack",
    bj_rules_valuesbj: "As 1 u 11 (lo que más te convenga), rey, reina y jota 10, las demás cartas según su valor. Un as y una carta de 10 como primeras cartas son un blackjack.",
    bj_term_round: "Una ronda",
    bj_rules_round: "Elige tu apuesta: 5, 10 o 20 fichas. Recibes dos cartas; la banca, una boca arriba y otra boca abajo. Con «Carta» tomas más cartas y con «Plantarse» paras. Si pasas de 21, pierdes en el acto.",
    bj_term_bank: "La banca",
    bj_rules_bank: "Cuando te plantas, la banca descubre su carta. Siempre sigue la misma regla: pide mientras tenga 16 o menos y se planta desde 17. Si pasa de 21, ganas tú.",
    bj_term_result: "Quién gana",
    bj_rules_result: "Gana quien esté más cerca de 21. Ganas tantas fichas como apostaste; un blackjack gana una vez y media la apuesta (redondeando hacia abajo). Empate: en 17 y 4 gana la banca, en Blackjack conservas tus fichas. Un 21 con dos cartas (blackjack) o el fuego termina la ronda en el acto.",
    bj_term_double: "Doblar (solo Blackjack)",
    bj_rules_double: "Con tus dos primeras cartas puedes doblar: tu apuesta se duplica, recibes exactamente una carta más y luego juega la banca. Necesitas fichas suficientes. No hay separar ni seguro.",
    bj_term_chips: "Fichas",
    bj_rules_chips: "Empiezas con 100 fichas. Son solo puntos del juego y no se pueden cambiar por nada. Si te quedas sin ninguna, empiezas de nuevo con 100.",
    bj_rules_example_title: "Mismas cartas, otros puntos",
    bj_rules_example: "As y rey: en Blackjack suman 21, un blackjack. En 17 y 4 solo suman 15 (as 11, rey 4).",
    bj_history_title: "La historia del Blackjack",
    bj_history_origins_title: "Veintiuno",
    bj_history_origins_p1: "Los juegos de cartas en los que hay que llegar a 21 sin pasarse son antiguos: la primera mención escrita está en un libro del escritor español Miguel de Cervantes. El 17 y 4 alemán procede del siglo XVIII y era muy popular en Francia en la corte de Luis XV. El vingt-et-un francés (21) desciende del trente-et-un, más antiguo, en el que la meta era 31. En alemán también se llamó antiguamente Hopsen. Con los valores de la baraja de 32 cartas, 17 más un rey (4) suman exactamente 21.",
    bj_history_us_title: "Blackjack",
    bj_history_us_p1: "En Estados Unidos, una forma estadounidense del veintiuno se convirtió en un juego propio y recibió el nombre de blackjack hacia 1899. La historia, muy repetida, de una prima por un as con una jota negra es un mito según el historiador Thierry Depaulis. Tradicionalmente, un blackjack paga 3 a 2 y, si hay empate, se devuelve la apuesta.",
    bj_history_modern_title: "El Blackjack en PaperGames",
    bj_history_modern_p1: "PaperGames juega solo con fichas: son simplemente puntos del juego y no se pueden cambiar por nada. La banca sigue siempre la misma regla fija, las cartas se barajan de nuevo en cada ronda y tus puntos se muestran siempre; las cartas se distinguen por símbolos rellenos y huecos, para que el juego funcione en tinta electrónica en blanco y negro."
});
I18n.markTextLoaded("es");
