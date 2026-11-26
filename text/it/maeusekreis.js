// text/it/maeusekreis.js
// Rules and history texts of maeusekreis (it). Loaded by maeusekreis-rules.html and maeusekreis-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    maeusekreis_rules_title: "Regole del Cerchio del topo",
    maeusekreis_rules_intro: "Un gatto e un topo su un cerchio di punti. Il topo corre solo lungo il cerchio; il gatto può anche attraversarlo sulle linee dritte. Riuscirà il gatto a prenderlo prima di finire i passi?",
    maeusekreis_rules_basics_title: "Le regole",
    maeusekreis_term_board: "Il tavolo",
    maeusekreis_rules_board: "I punti formano un cerchio e ciascuno è collegato ai due vicini. Alcune linee tratteggiate attraversano il cerchio. Facile ha 8 punti, Medio 10 e Difficile 12. Gatto e topo partono da punti casuali, distanti almeno tre punti.",
    maeusekreis_term_moves: "Muoversi",
    maeusekreis_rules_moves: "Si muove prima il topo, poi il gatto, e così via. A ogni turno la pedina avanza di un passo fino a un punto vicino; non può restare ferma. Il topo usa solo il cerchio. Il gatto può usare il cerchio e le linee tratteggiate. Il topo non può andare sul gatto. Tocca un punto segnato per spostarti lì.",
    maeusekreis_term_end: "Preso o libero",
    maeusekreis_rules_end: "Quando il gatto arriva sul punto del topo, lo prende e vince. Nessuno si fa male: la partita finisce e basta. Il gatto ha un numero fisso di passi, indicato sopra il tavolo. Se li ha fatti tutti e il topo è ancora libero, il topo scappa e vince.",
    maeusekreis_term_steps: "Quanti passi",
    maeusekreis_rules_steps: "Il numero di passi viene calcolato per ogni partenza. In due e quando giochi il gatto, il gatto ha esattamente i passi necessari per prendere il topo, ma solo se non ne spreca nessuno. Se giochi il topo contro il computer, il gatto ha un passo in meno: un topo attento può scappare.",
    maeusekreis_term_computer: "Il computer",
    maeusekreis_rules_computer: "Contro il computer scegli gatto o topo. Facile commette molti errori, Medio qualcuno, Difficile nessuno. Il pulsante Suggerimento mostra il passo migliore e Annulla toglie la tua ultima mossa.",
    maeusekreis_history_title: "La storia del Cerchio del topo",
    maeusekreis_history_origins_title: "Antichi giochi di caccia",
    maeusekreis_history_origins_p1: "I giochi in cui un lato dà la caccia e l’altro cerca di scappare esistono in molti paesi. In Europa si gioca da secoli a volpe e oche su un tavolo di linee e punti; giochi di caccia simili arrivano dall’Asia. Un lato è forte, l’altro ha più pedine o più spazio.",
    maeusekreis_history_maths_title: "Un inseguimento su punti e linee",
    maeusekreis_history_maths_p1: "Dalla fine degli anni Settanta i matematici hanno iniziato a studiare gli inseguimenti su reti di punti e linee: su quali reti un cacciatore può sempre prendere chi fugge? Spesso il gioco si chiama guardie e ladri. Su un semplice cerchio chi corre scappa sempre; le scorciatoie che attraversano il cerchio cambiano le cose.",
    maeusekreis_history_here_title: "Il Cerchio del topo qui",
    maeusekreis_history_here_p1: "L’idea di un gatto e un topo su un cerchio è arrivata da un giocatore. Le regole di PaperGames sono originali: il topo resta sul cerchio, il gatto può tagliare attraverso e una ricerca di tutte le posizioni stabilisce quanti passi ha il gatto."
});
I18n.markTextLoaded("it");
