// text/it/tictactoe.js
// Rules and history texts of tictactoe (it). Loaded by tictactoe-rules.html and tictactoe-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    tictactoe_rules_title: "Regole del tris",
    tictactoe_rules_intro: "Un breve riepilogo di come PaperGames gioca a tris, detto anche tic-tac-toe.",
    tictactoe_rules_basics_title: "L'idea di base",
    tictactoe_term_board: "La griglia e i segni",
    tictactoe_rules_board: "La griglia è di 3x3 caselle. A turno, ogni giocatore mette il proprio segno in una casella libera: una croce il giocatore 1, un cerchio il giocatore 2. Il giocatore 1 inizia sempre. Un segno resta dov'è fino alla fine della partita.",
    tictactoe_rules_end_title: "Come finisce una partita",
    tictactoe_term_win: "Vittoria",
    tictactoe_rules_win: "Il primo che mette in fila tre dei propri segni – in orizzontale, in verticale o in diagonale – vince subito. La fila vincente viene mostrata in nero pieno.",
    tictactoe_term_draw: "Pareggio",
    tictactoe_rules_draw: "Se tutte e nove le caselle sono piene e nessuno ha fatto tris, la partita è patta. Due giocatori che non sbagliano pareggiano sempre: per questo a livello Difficile il computer non perde mai, e contro di lui si può al massimo pareggiare.",
    tictactoe_term_resignation: "Abbandono",
    tictactoe_rules_resignation: "Un giocatore può abbandonare in qualsiasi momento: la partita finisce subito a favore dell'avversario.",
    tictactoe_rules_hard_title: "Il livello Difficile",
    tictactoe_rules_hard: "A livello Difficile il computer esamina tutte le continuazioni possibili e non sbaglia mai. Per la griglia 3x3 è dimostrato – controllando tutte le partite possibili – che due giocatori senza errori pareggiano sempre. Contro questo livello il massimo che puoi ottenere è quindi un pareggio; un solo errore e perdi.",
    tictactoe_history_title: "La storia del tris",
    tictactoe_history_origins_title: "Tre sassolini a Roma",
    tictactoe_history_origins_p1: "Un antenato si giocava nell'Impero romano intorno al I secolo a.C., probabilmente con il nome di terni lapilli, «tre sassolini alla volta». Ogni giocatore aveva solo tre pedine; una volta piazzate tutte, si spostavano su punti liberi per continuare.",
    tictactoe_history_origins_p2: "Griglie di questo gioco sono state trovate in molti luoghi di Roma.",
    tictactoe_history_spread_title: "Noughts and Crosses, Tic-Tac-Toe",
    tictactoe_history_spread_p1: "Il gioco ha avuto molti nomi. Il nome britannico «noughts and crosses» (zeri e croci) compariva già a stampa verso la metà dell'Ottocento, per esempio nel 1858 nella rivista Notes and Queries.",
    tictactoe_history_spread_p2: "Negli Stati Uniti si è affermato nel Novecento il nome tic-tac-toe. Forse deriva da «tick-tack», un'antica forma di backgammon nota in Inghilterra già nel Cinquecento.",
    tictactoe_history_modern_title: "Uno dei primi giochi al computer",
    tictactoe_history_modern_p1: "Nel 1952 A. S. (Sandy) Douglas scrisse OXO per il calcolatore EDSAC dell'Università di Cambridge, nell'ambito della sua tesi di dottorato sull'interazione tra persone e computer. La casella si sceglieva con un disco combinatore telefonico e il computer giocava in modo perfetto. OXO è tra i primi videogiochi conosciuti.",
    tictactoe_history_modern_p2: "Il gioco è abbastanza piccolo da poter essere calcolato per intero: a meno di rotazioni e riflessioni ci sono 26.830 partite possibili, e giocando in modo perfetto finiscono tutte patte. È proprio ciò che fa qui il livello Difficile: prima di ogni mossa esamina tutti i possibili seguiti."
});
I18n.markTextLoaded("it");
