// text/it/wallmaze.js
// Rules and history texts of wallmaze (it). Loaded by wallmaze-rules.html and wallmaze-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    wallmaze_rules_title: "Regole del Labirinto di Muri",
    wallmaze_rules_intro: "Un rapido riferimento su come PaperGames gioca al Labirinto di Muri - utile se sei arrugginito o lo stai imparando.",
    wallmaze_rules_basics_title: "L'idea di base",
    wallmaze_term_setup: "L'allestimento",
    wallmaze_rules_setup: "Ogni giocatore ha una pedina, che parte dal centro del proprio lato di un tavoliere 9x9, e dieci muri di riserva. Il Giocatore 1 punta alla traversa più lontana in basso, il Giocatore 2 a quella più lontana in alto - vince chi porta lì la propria pedina per primo.",
    wallmaze_term_moving: "Muovere la pedina",
    wallmaze_rules_moving: "Al tuo turno, puoi muovere la tua pedina di una casella su, giù, a sinistra o a destra, oppure piazzare un muro. Se le due pedine sono adiacenti, puoi saltare dritto sopra l'altra pedina; se un muro o il bordo del tavoliere blocca quel salto, puoi invece spostarti in diagonale intorno a esso.",
    wallmaze_term_walls: "Piazzare i muri",
    wallmaze_rules_walls: "Un muro è lungo due caselle e blocca il movimento diretto attraverso di esso, per entrambi i giocatori. I muri non possono mai sovrapporsi o incrociare un altro muro, e un muro non può mai essere piazzato se chiuderebbe l'ultimo percorso rimasto di un giocatore verso la propria traversa obiettivo - c'è sempre almeno una via di passaggio.",
    wallmaze_rules_end_title: "Vincere la partita",
    wallmaze_term_win: "Come finisce la partita",
    wallmaze_rules_win: "Nel momento in cui la pedina di un giocatore raggiunge una qualsiasi casella della propria traversa obiettivo, quel giocatore vince - non importa quale colonna.",
    wallmaze_history_title: "La Storia del Labirinto di Muri",
    wallmaze_history_origins_title: "Un design degli anni '90",
    wallmaze_history_origins_p1: "Quoridor fu progettato da Mirko Marchesi e pubblicato per la prima volta nel 1997 dall'azienda di giochi francese Gigamic, diventando rapidamente uno dei titoli più conosciuti dell'azienda insieme ad altri compatti giochi astratti a due giocatori.",
    wallmaze_history_origins_p2: "Appartiene a una famiglia più ampia di giochi \"a labirinto bloccante\", in cui è il tavoliere stesso a cambiare forma nel corso della partita invece di restare fisso come una scacchiera - ogni muro che un giocatore piazza rimodella permanentemente i percorsi che entrambe le pedine possono seguire per il resto della partita.",
    wallmaze_history_design_title: "Regole semplici, vera profondità",
    wallmaze_history_design_p1: "L'intero regolamento sta su un'unica scheda - muovi la tua pedina o piazza un muro, raggiungi il lato opposto per vincere - eppure la tensione tra correre in avanti e spendere un turno per bloccare l'avversario gli dà una vera profondità strategica, ed è spesso citato negli scritti sul design dei giochi come esempio di elegante minimalismo.",
    wallmaze_history_design_p2: "Quoridor è stato studiato anche come problema di informatica: poiché lo spazio degli stati è ampio ma ben strutturato (posizioni delle pedine più piazzamenti dei muri, con una regola di connettività dei percorsi da far rispettare), è un obiettivo popolare sia per l'IA tradizionale basata sulla ricerca sia, più di recente, per gli agenti di apprendimento per rinforzo.",
    wallmaze_history_names_title: "Perché un altro nome",
    wallmaze_history_names_p1: "Lo stesso principio di gioco esiste in commercio con il nome Quoridor, ideato nel 1997 da Mirko Marchesi e pubblicato da Gigamic. Quoridor è un marchio registrato. PaperGames non ha alcun legame con Gigamic né con quel gioco e usa quindi il proprio nome, Labirinto di Muri.",
    wallmaze_history_version_title: "Questa versione",
    wallmaze_history_version_p1: "PaperGames gioca con le regole standard sul tavoliere standard 9x9 con dieci muri per giocatore. Piazzare un muro è una piccola modalità a sé: tocca \"Piazza un muro\", tocca un punto qualsiasi del tavoliere per vedere in anteprima il muro legale più vicino lì, e conferma - un bersaglio deliberatamente tollerante su uno schermo touch, invece di dover colpire un punto preciso."
});
I18n.markTextLoaded("it");
