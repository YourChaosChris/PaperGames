// text/it/checkers.js
// Rules and history texts of checkers (it). Loaded by checkers-rules.html and checkers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    checkers_rules_title: "Regole della dama",
    checkers_rules_intro: "Una guida rapida a come PaperGames gioca a dama (dama inglese) - utile se sei arrugginito, o se stai imparando.",
    checkers_rules_basics_title: "L'idea di base",
    checkers_term_men: "Pedine",
    checkers_rules_men: "Nero e Bianco iniziano ciascuno con 12 pedine sulle caselle scure delle proprie tre file di fondo, e si muovono in diagonale in avanti di una casella alla volta, alternandosi, con il Nero che inizia.",
    checkers_term_kings: "Dame",
    checkers_rules_kings: "Una pedina che raggiunge l'ultima traversa avversaria diventa una dama. Le dame si muovono in diagonale in qualsiasi direzione, sempre una casella alla volta.",
    checkers_rules_capture_title: "Catturare",
    checkers_term_capture: "Cattura",
    checkers_rules_capture: "Si cattura saltando in diagonale sopra un pezzo avversario adiacente, atterrando sulla casella vuota subito oltre di esso e rimuovendo il pezzo saltato.",
    checkers_term_mandatory: "Cattura obbligatoria",
    checkers_rules_mandatory: "Se è disponibile una cattura, devi eseguirla - una mossa semplice è illegale finché esiste una cattura possibile. Puoi scegliere quale pezzo cattura se più di uno può farlo.",
    checkers_term_multijump: "Catture multiple",
    checkers_rules_multijump: "Se una cattura ti fa atterrare in una posizione da cui è immediatamente disponibile un'altra cattura con lo stesso pezzo, devi continuare a saltare con esso finché non è più possibile catturare. Atterrare sull'ultima traversa promuove il pezzo e termina immediatamente il turno, anche a metà di una catena.",
    checkers_rules_end_title: "Come finisce una partita",
    checkers_term_win: "Vittoria",
    checkers_rules_win: "Vinci quando al tuo avversario non restano più pezzi, o non ha mosse legali disponibili al suo turno.",
    checkers_term_resignation: "Abbandono",
    checkers_rules_resignation: "Un giocatore può abbandonare in qualsiasi momento, terminando immediatamente la partita a favore dell'avversario.",
    checkers_term_draw: "Patta",
    checkers_rules_draw: "Se passano 40 mosse di fila senza catture da parte di nessuno dei due giocatori, la partita è patta.",
    checkers_history_title: "La storia della dama",
    checkers_history_origins_title: "Un tavoliere antico, un gioco medievale",
    checkers_history_origins_p1: "Il tavoliere e la disposizione iniziale della dama risalgono all'Alquerque, un gioco di cattura giocato su un tavoliere a linee 5x5 conosciuto in Egitto e in Medio Oriente da oltre 3.000 anni, e in seguito popolare nella Spagna moresca.",
    checkers_history_origins_p2: "Intorno al XII secolo, nella Francia meridionale, qualcuno combinò le catture diagonali dell'Alquerque con una scacchiera, creando il \"Fierges\" o \"Jeu de Dames\" - l'antenato diretto del gioco che si pratica oggi.",
    checkers_history_spread_title: "Dalla Francia al mondo",
    checkers_history_spread_p1: "Il gioco si diffuse in Europa con molti nomi diversi - draughts in Inghilterra, dama in Spagna, dame in Germania - e attraversò l'Atlantico con i coloni, diventando particolarmente popolare negli Stati Uniti, dove si affermarono il tavoliere 8x8 e le regole di cattura obbligatoria usate in questa app (la dama americana).",
    checkers_history_spread_p2: "Campionati nazionali e mondiali si tengono dall'Ottocento, e il gioco competitivo organizzato in Gran Bretagna, negli Stati Uniti e altrove ha prodotto generazioni di giocatori celebri e aperture studiate a fondo.",
    checkers_history_modern_title: "Un gioco risolto",
    checkers_history_modern_p1: "La dama occupa un posto unico nella teoria dei giochi: nel 2007, dopo quasi due decenni di calcoli, il programma Chinook di Jonathan Schaeffer dimostrò che la dama è patta con gioco perfetto da entrambe le parti - il gioco più complesso risolto in modo così completo fino a quel momento.",
    checkers_history_modern_p2: "Questo non rende la dama meno divertente da giocare - come un finale di scacchi risolto, conoscere il risultato teorico non cambia nulla riguardo all'abilità necessaria per condurre una vera partita sul tavoliere."
});
I18n.markTextLoaded("it");
