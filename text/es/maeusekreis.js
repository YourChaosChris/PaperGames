// text/es/maeusekreis.js
// Rules and history texts of maeusekreis (es). Loaded by maeusekreis-rules.html and maeusekreis-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    maeusekreis_rules_title: "Reglas de El círculo del ratón",
    maeusekreis_rules_intro: "Un gato y un ratón en un círculo de puntos. El ratón solo corre por el círculo; el gato también puede cruzar por las líneas rectas. ¿Podrá el gato atraparlo antes de quedarse sin pasos?",
    maeusekreis_rules_basics_title: "Las reglas",
    maeusekreis_term_board: "El tablero",
    maeusekreis_rules_board: "Los puntos forman un círculo y cada uno está unido a sus dos vecinos. Algunas líneas discontinuas cruzan el círculo. Fácil tiene 8 puntos, Medio 10 y Difícil 12. El gato y el ratón empiezan en puntos aleatorios, separados por al menos tres puntos.",
    maeusekreis_term_moves: "Moverse",
    maeusekreis_rules_moves: "Primero se mueve el ratón y después el gato, y así sucesivamente. En cada turno, la ficha avanza un paso hasta un punto vecino; no puede quedarse quieta. El ratón solo usa el círculo. El gato puede usar el círculo y las líneas discontinuas. El ratón no puede ir al punto del gato. Toca un punto marcado para moverte allí.",
    maeusekreis_term_end: "Atrapado o a salvo",
    maeusekreis_rules_end: "Cuando el gato llega al punto del ratón, lo atrapa y gana. Nadie se hace daño: la partida simplemente termina. El gato tiene un número fijo de pasos, que aparece sobre el tablero. Si los ha usado todos y el ratón sigue libre, este escapa y gana.",
    maeusekreis_term_steps: "Cuántos pasos",
    maeusekreis_rules_steps: "El número de pasos se calcula para cada posición inicial. En una partida de dos personas y cuando tú juegas con el gato, este tiene justo los pasos necesarios para atrapar al ratón, pero solo si no desperdicia ninguno. Si juegas con el ratón contra el ordenador, el gato tiene un paso menos, así que un ratón cuidadoso puede escapar.",
    maeusekreis_term_computer: "El ordenador",
    maeusekreis_rules_computer: "Contra el ordenador, elige gato o ratón. Fácil comete muchos errores, Medio unos pocos y Difícil ninguno. El botón Pista muestra el mejor paso y Deshacer retira tu último movimiento.",
    maeusekreis_history_title: "La historia de El círculo del ratón",
    maeusekreis_history_origins_title: "Antiguos juegos de persecución",
    maeusekreis_history_origins_p1: "Hay juegos en los que un lado persigue y el otro intenta escapar en muchos países. En Europa, el zorro y las ocas se juega desde hace siglos en un tablero de líneas y puntos; también hay juegos de caza parecidos en Asia. Un lado es fuerte y el otro cuenta con más piezas o más espacio.",
    maeusekreis_history_maths_title: "Una persecución por puntos y líneas",
    maeusekreis_history_maths_p1: "Desde finales de los años setenta, los matemáticos empezaron a estudiar persecuciones en redes de puntos y líneas: ¿en qué redes puede un cazador atrapar siempre a quien huye? A menudo se llama policías y ladrones. En un círculo sencillo, quien corre siempre escapa; los atajos que cruzan el círculo lo cambian todo.",
    maeusekreis_history_here_title: "El círculo del ratón aquí",
    maeusekreis_history_here_p1: "La idea del gato y el ratón en un círculo la envió una persona jugadora. Las reglas de PaperGames son propias: el ratón sigue el círculo, el gato puede cruzarlo y una búsqueda de todas las posiciones fija cuántos pasos tiene el gato."
});
I18n.markTextLoaded("es");
