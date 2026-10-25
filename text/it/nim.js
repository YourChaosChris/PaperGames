// text/it/nim.js
// Rules and history texts of nim (it). Loaded by nim-rules.html and nim-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    nim_rules_title: "Regole del Nim",
    nim_rules_intro: "Due giocatori prendono a turno pietre da più mucchi. Con la regola normale vince chi prende l’ultima pietra.",
    nim_rules_basics_title: "Le regole",
    nim_term_move: "Una mossa",
    nim_rules_move: "Scegli una fila e prendine quante pietre vuoi, almeno una. Tocca la pietra fino a cui vuoi prendere: lei e tutte le pietre alla sua destra ricevono una croce. Poi tocca «Prendi le pietre».",
    nim_term_end: "La fine",
    nim_rules_end: "Normale: chi prende l’ultima pietra vince. Misère: chi prende l’ultima pietra perde.",
    nim_term_heaps: "Mucchi",
    nim_rules_heaps: "3, 4 e 5 pietre (predefinito), i classici 1, 3, 5 e 7, oppure mucchi a caso (3 o 4 mucchi da 1 a 7 pietre).",
    nim_term_secret: "La regola vincente",
    nim_rules_secret: "Scrivi la grandezza di ogni mucchio in binario e somma le colonne senza riporto (xor): il risultato è la somma nim. Se è 0, il giocatore di turno perde contro un gioco perfetto; altrimenti c’è sempre una mossa che la porta a 0. Nel misère si gioca allo stesso modo finché resterebbero solo mucchi di una pietra: allora se ne lascia un numero dispari.",
    nim_term_computer: "Il computer",
    nim_rules_computer: "Facile gioca una mossa qualsiasi, Medio la mossa migliore una volta su due, Difficile sempre la migliore. Da una posizione vincente Difficile è imbattibile; per questo la riga sotto i mucchi dice se la partenza è vinta o persa per chi comincia: scegli chi comincia tenendone conto.",
    nim_history_title: "La storia del Nim",
    nim_history_origins_title: "Togliere pietre",
    nim_history_origins_p1: "Giochi in cui si tolgono oggetti da mucchi si giocano fin dall’antichità; l’origine del Nim è incerta. Spesso viene collegato al gioco cinese jiǎn shízǐ («raccogliere pietre»), e le più antiche menzioni europee risalgono all’inizio del XVI secolo.",
    nim_history_bouton_title: "Bouton, 1901",
    nim_history_bouton_p1: "Nel 1901 Charles L. Bouton dell’Università di Harvard pubblicò la teoria completa del gioco e gli diede il nome di Nim. Non spiegò mai il nome; spesso lo si collega alla parola tedesca «nimm» («prendi!»).",
    nim_history_machines_title: "Macchine per il Nim",
    nim_history_machines_p1: "Il Nim fu uno dei primi giochi giocati da macchine: il Nimatron all’Esposizione universale di New York nel 1940 e un calcolatore della Ferranti presentato al Festival of Britain nel 1951."
});
I18n.markTextLoaded("it");
