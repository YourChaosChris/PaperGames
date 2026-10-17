// text/es/adventurebook.js
// Rules and history texts of adventurebook (es). Loaded by adventurebook-rules.html and adventurebook-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.es, {
    ab_rules_title: "Libro de aventuras – reglas",
    ab_rules_intro: "Juegas con un héroe. Encuentra el tesoro de una cueva, una torre o un bosque y llévalo de vuelta a la entrada.",
    ab_rules_basics_title: "Las reglas",
    ab_term_hero: "Tu héroe",
    ab_rules_hero: "Escribe un nombre, elige una de las cuatro clases y reparte 6 puntos entre Fuerza, Destreza y Saber (como mucho 4 en un valor). Luchador: 16 puntos de vida, ataca con Fuerza. Exploradora: 13, ataca con Destreza. Sanador: 13, ataca con un bastón de luz (Saber). Erudita: 11, ataca con hechizos (Saber). Cada clase suma 1 a un valor y tiene una habilidad que puede usar una vez por combate.",
    ab_term_place: "El lugar",
    ab_rules_place: "Cada aventura es un lugar nuevo de 12 a 20 salas en una pequeña cuadrícula: la Cueva de cristal, la Torre de los cuervos o el Bosque de niebla. Cada sala tiene un texto breve y dos o tres botones. Cada camino va en ambas direcciones, así que siempre puedes volver. El tesoro está en la sala más alejada de la entrada, vigilado por un enemigo fuerte.",
    ab_term_checks: "Pruebas",
    ab_rules_checks: "Empujar una roca, saltar una grieta, leer runas, registrar una sala o huir: tira dos dados y suma el valor. Si la suma alcanza el número necesario, lo consigues. La cuerda, la palanca y la lupa suman 2 mientras las lleves; un trébol permite volver a tirar una vez. El resultado aparece siempre con la cuenta, por ejemplo «7 + Destreza 2 = 9, necesario 8: conseguido».",
    ab_term_fight: "Combates",
    ab_rules_fight: "Un combate va por turnos. Atacar: dos dados más tu valor de ataque deben alcanzar la defensa del enemigo, que pierde entonces puntos de vida. Defenderse: el enemigo acierta menos y solo hace la mitad de daño. Objeto: una poción o un pergamino. Habilidad: tu habilidad de clase, una vez por combate. Huir (prueba de Destreza): vuelves a la sala de donde venías; el enemigo se queda, pero conserva el daño. Tras tu acción ataca el enemigo. Un enemigo con 0 puntos de vida se rinde y huye; recibes experiencia y oro.",
    ab_term_pack: "Mochila y niveles",
    ab_rules_pack: "La mochila lleva 8 objetos: comida y pociones para curarse, armas y armaduras (la mejor se equipa enseguida), amuletos que suben un valor para siempre, pergaminos para combates y herramientas útiles. Cofres, obstáculos y registros dan objetos y oro. Con experiencia subes hasta el nivel 5: cada nivel da 3 puntos de vida y +1 en ataques.",
    ab_term_end: "Final y dificultad",
    ab_rules_end: "Ganas cuando llevas el tesoro de vuelta a la entrada. Con 0 puntos de vida al héroe no le quedan fuerzas y la aventura termina. Después puedes seguir con el mismo héroe (nivel y valores se mantienen, mochila y oro empiezan de nuevo) o crear uno nuevo. Fácil: enemigos más débiles y 3 pociones al empezar; Medio: 2 pociones; Difícil: enemigos más fuertes, pruebas más duras y 1 poción.",
    ab_term_playing: "Cómo jugar",
    ab_rules_playing: "Arriba lees la sala y lo que acaba de pasar, debajo están las opciones como botones y abajo los valores de tu héroe. El mapa y la mochila se abren con sus propios botones. El mapa muestra las salas que has visto; tu sala tiene un marco grueso. El juego guarda tras cada paso, así que puedes parar cuando quieras.",
    ab_rules_example_title: "Ejemplo",
    ab_rules_example: "Tu exploradora quiere saltar una grieta. Saca 4 y 3, es decir 7, más Destreza 2 da 9. Hacía falta 8: lo consigue y encuentra una cuerda al otro lado.",
    ab_history_title: "Historia del Libro de aventuras",
    ab_history_origin_title: "Interpretar a un héroe",
    ab_history_origin_p1: "En los años setenta aparecieron los juegos de rol, en los que cada jugador interpreta a un héroe con valores apuntados en papel. Una persona narra la historia y los dados deciden si algo sale bien. Pronto hubo también libros en los que, según la decisión, se sigue leyendo en otra página, y aventuras en solitario con dados y una hoja de personaje.",
    ab_history_screen_title: "Salas en la pantalla",
    ab_history_screen_p1: "Hacia 1980, los videojuegos retomaron la idea: salas nuevas en cada partida, un héroe que se hace más fuerte y turnos que esperan a que decidas. Estos juegos siguen siendo populares porque ninguna aventura es igual a otra.",
    ab_history_here_title: "El Libro de aventuras en PaperGames",
    ab_history_here_p1: "El Libro de aventuras lo reúne de forma tranquila para el lector electrónico: sin prisa, cada tirada mostrada como cuenta, tres lugares con salas, enemigos y tesoros propios, y un tono familiar: los enemigos vencidos se rinden y huyen. Todos los nombres y textos son propios."
});
I18n.markTextLoaded("es");
