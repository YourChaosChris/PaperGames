// text/it/alquerque.js
// Rules and history texts of alquerque (it). Loaded by alquerque-rules.html and alquerque-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    alquerque_rules_title: "Regole dell'Alquerque",
    alquerque_rules_intro: "Un breve riepilogo di come PaperGames gioca all'Alquerque, il gioco di salti descritto nel Libro dei giochi di Alfonso X di Castiglia.",
    alquerque_rules_basics_title: "L'idea di base",
    alquerque_term_board: "Il tabellone",
    alquerque_rules_board: "Il tabellone ha 25 punti in una griglia 5x5. I punti vicini sono collegati in orizzontale e in verticale, e alcuni anche in diagonale: le linee diagonali passano solo per un punto sì e uno no, così che i quattro angoli e il centro sono collegati in tutte e otto le direzioni. Le pedine possono muoversi solo lungo le linee tracciate.",
    alquerque_term_setup: "Disposizione iniziale",
    alquerque_rules_setup: "Ogni schieramento ha 12 pedine: il Bianco (anelli) in basso, il Nero (dischi pieni) in alto. Ogni schieramento occupa le due file più vicine a sé e i due punti della fila centrale alla propria destra. Il punto centrale resta vuoto. Il Bianco muove per primo.",
    alquerque_term_move: "Movimento",
    alquerque_rules_move: "Al tuo turno sposta una tua pedina lungo una linea su un punto vicino libero: in avanti, di lato o in diagonale in avanti. Una pedina non torna mai indietro, nemmeno in diagonale. In avanti significa verso il lato dell'avversario.",
    alquerque_term_capture: "Cattura",
    alquerque_rules_capture: "Una pedina cattura saltando lungo una linea sopra una pedina nemica vicina fino al punto vuoto subito dietro di essa. La pedina saltata viene rimossa. Se la stessa pedina può poi saltare di nuovo, continua nello stesso turno, anche cambiando direzione. I salti possono andare in ogni direzione, anche all'indietro: è una regola di PaperGames, perché la fonte vieta solo di muoversi all'indietro.",
    alquerque_term_forced: "Cattura obbligatoria",
    alquerque_rules_forced: "Se puoi catturare, devi farlo: finché è disponibile una cattura, PaperGames ti lascia fare solo mosse di cattura, e una pedina che può continuare a saltare deve proseguire finché non può più farlo. Quando sono possibili più catture, puoi sceglierne una qualsiasi, non solo la più lunga.",
    alquerque_rules_end_title: "Come finisce una partita",
    alquerque_term_win: "Vittoria",
    alquerque_rules_win: "Vinci quando al tuo avversario non restano più pedine, oppure ne ha ancora ma non ha mosse legali al suo turno.",
    alquerque_term_resignation: "Abbandono",
    alquerque_term_dead: "Schieramenti che non possono più incontrarsi",
    alquerque_rules_dead: "Regola di PaperGames: quando ogni pedina bianca sta almeno due file più in alto di ogni pedina nera, gli schieramenti non possono più incontrarsi – il Bianco va solo in su o di lato, il Nero solo in giù o di lato. Nessuno potrebbe più catturare e la partita non finirebbe mai, quindi termina subito: vince chi ha più pedine, a parità è patta.",
    alquerque_rules_resignation: "Un giocatore può abbandonare in qualsiasi momento, terminando immediatamente la partita a favore dell'avversario.",
    alquerque_rules_versions_title: "Quale versione si gioca qui",
    alquerque_rules_versions: "Le antiche descrizioni dell'alquerque lasciano aperti alcuni dettagli. Nella fonte indicata sotto la presa non è obbligatoria: una pedina che poteva catturare e non l'ha fatto viene tolta (\"soffiare\", in inglese \"huffing\"). PaperGames mantiene la presa obbligatoria, perché l'app offre comunque solo mosse legali. Le pedine non tornano mai indietro muovendosi, ma saltano in ogni direzione (regola di PaperGames). Inizia il Bianco.",
    alquerque_rules_sources_title: "Fonti",
    alquerque_rules_sources: "Il divieto di tornare indietro e la fine della partita seguono: Wikipedia, „Alquerque“, section Rules: https://en.wikipedia.org/wiki/Alquerque (consultato il 6 ottobre 2026).",
    alquerque_history_title: "La storia dell'Alquerque",
    alquerque_history_origins_title: "Un nome dall'arabo",
    alquerque_history_origins_p1: "Il nome deriva dall'arabo al-qirkat, il nome di un gioco da tavolo conosciuto nel mondo arabo. Giunse in Spagna durante la dominazione moresca e lì sopravvisse come alquerque.",
    alquerque_history_book_title: "Il Libro dei giochi",
    alquerque_history_book_p1: "Nel 1283 il re Alfonso X di Castiglia fece completare il Libro de los juegos, il Libro dei giochi. Oltre agli scacchi, ai dadi e ai giochi di tavola, descrive l'alquerque con le sue regole e illustrazioni, il che lo rende una delle più antiche fonti scritte sul gioco.",
    alquerque_history_checkers_title: "Dall'Alquerque alla dama",
    alquerque_history_checkers_p1: "La dama è generalmente considerata una discendente dell'alquerque: la cattura per salto e la regola secondo cui una cattura va eseguita sono state trasferite sulle caselle della scacchiera. L'alquerque stesso ha continuato a essere giocato, e giochi simili sono noti in molte regioni.",
    alquerque_history_modern_title: "Su PaperGames",
    alquerque_history_modern_p1: "PaperGames propone la partita 12 contro 12 sul tabellone 5x5 con cattura obbligatoria. Le linee del tabellone sono tracciate per intero, perché solo esse mostrano quali mosse diagonali esistono."
});
I18n.markTextLoaded("it");
