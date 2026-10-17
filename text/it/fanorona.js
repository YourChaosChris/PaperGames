// text/it/fanorona.js
// Rules and history texts of fanorona (it). Loaded by fanorona-rules.html and fanorona-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    fanorona_rules_title: "Regole del Fanorona",
    fanorona_rules_intro: "Un rapido riferimento su come PaperGames gioca a Fanorona - utile se sei arrugginito o lo stai imparando.",
    fanorona_rules_basics_title: "L'idea di base",
    fanorona_term_board: "Il tabellone",
    fanorona_rules_board: "45 punti disposti in una griglia 5x9, collegati da linee orizzontali, verticali e alcune diagonali - le diagonali alternano direzione da una cella all'altra, così che circa metà dei punti ('punti forti') sono collegati a tutti gli 8 vicini, mentre gli altri ('punti deboli') sono collegati solo in orizzontale e verticale. Ogni giocatore inizia con 22 pedine, occupando le due file più vicine a sé più metà della fila centrale in alternanza, lasciando vuoto il punto centrale esatto. Il Bianco muove per primo.",
    fanorona_term_capture: "Catturare",
    fanorona_rules_capture: "Fai scivolare una pedina lungo una linea fino a un punto vuoto adiacente. A seconda della direzione del movimento, questo può catturare una linea retta di pedine nemiche per avvicinamento, per ritirata, oppure (se entrambe sono possibili) a tua scelta - vedi gli esempi sotto. Catturare è obbligatorio: se da qualche parte sul tabellone è disponibile una mossa di cattura, devi giocarla al posto di una mossa tranquilla (paika).",
    fanorona_term_approach: "Cattura per avvicinamento",
    fanorona_rules_approach: "Muovi una pedina in modo che il punto subito oltre la sua nuova posizione, nella stessa direzione in cui ti sei appena mosso, sia occupato da una pedina nemica. Quella pedina, e ogni pedina nemica subito dietro di essa su una linea ininterrotta, viene catturata.",
    fanorona_term_withdrawal: "Cattura per ritirata",
    fanorona_rules_withdrawal: "Allontana una pedina da una pedina nemica che si trovava subito dietro la sua vecchia posizione, nella direzione esattamente opposta al tuo movimento. Quella pedina, e ogni pedina nemica subito dietro di essa su una linea ininterrotta, viene catturata.",
    fanorona_rules_example_title: "Esempio commentato",
    fanorona_rules_example_intro: "Nei piccoli diagrammi qui sotto, ● è il Bianco, ○ è il Nero, e il cerchio tratteggiato è il punto verso cui il Bianco sta per muoversi.",
    fanorona_rules_example_approach_caption: "Avvicinamento: il Bianco gioca A→B. Poiché ci sono pedine nere sul proseguimento di quella stessa linea appena oltre B, vengono catturate.",
    fanorona_rules_example_withdrawal_caption: "Ritirata: il Bianco gioca A→B, allontanandosi direttamente da pedine nere che si trovavano dietro A. Poiché il Bianco si allontana da esse lungo quella stessa linea, vengono catturate anch'esse.",
    fanorona_term_chain: "Continuare a catturare",
    fanorona_rules_chain: "Dopo una cattura, la stessa pedina può continuare a catturare dalla sua nuova posizione - ma, a differenza della dama, non sei mai obbligato: puoi fermarti dopo qualsiasi cattura. Mentre concateni le catture si applicano due regole aggiuntive: la pedina non può muoversi due volte di fila nella stessa identica direzione, e non può mai atterrare su un punto già visitato in precedenza nello stesso turno.",
    fanorona_rules_end_title: "Come finisce una partita",
    fanorona_term_win: "Vincere",
    fanorona_rules_win: "Vinci catturando tutte le pedine dell'avversario, oppure se il tuo avversario non ha alcuna mossa legale al suo turno.",
    fanorona_term_resignation: "Resa",
    fanorona_rules_resignation: "Un giocatore può arrendersi in qualsiasi momento, terminando immediatamente la partita a favore dell'avversario.",
    fanorona_history_title: "La storia del Fanorona",
    fanorona_history_origins_title: "Dall'Alquerque agli altipiani del Madagascar",
    fanorona_history_origins_p1: "Si ritiene che il Fanorona discenda dall'Alquerque, un antichissimo gioco di cattura per salto giunto in Madagascar probabilmente con mercanti arabi o del sud-est asiatico. L'Alquerque è anche l'antenato comune della dama, il che rende Fanorona e dama cugini lontani: entrambi hanno mantenuto l'idea di base della cattura per salto, sviluppando però in modo indipendente regole molto diverse.",
    fanorona_history_origins_p2: "I giocatori malgasci hanno trasformato il gioco importato in qualcosa di assolutamente proprio: un tabellone più grande, 5x9, con un misto di linee ortogonali e diagonali, e il sistema di cattura per avvicinamento/ritirata, che non ha equivalenti né nell'Alquerque né nella dama. Alcuni dei più antichi tabelloni di Fanorona sopravvissuti, scolpiti nella pietra vicino ad Antananarivo, sono stimati risalire al XVI o XVII secolo.",
    fanorona_history_legend_title: "Una partita che (a quanto si dice) decise un trono",
    fanorona_history_legend_p1: "Secondo una nota leggenda malgascia, il re Ralambo mise alla prova i suoi due figli per vedere chi fosse più adatto a succedergli: finse una grave malattia e li fece chiamare, per vedere chi sarebbe arrivato per primo. Si narra che il figlio maggiore, assorto in una difficile posizione di Fanorona, sia rimasto a finire la partita - così il fratello minore arrivò per primo e, secondo il racconto, ereditò poi il trono. Come per la maggior parte delle tradizioni orali tramandate nei secoli, i dettagli variano da una versione all'altra e l'episodio non può essere verificato come fatto storico, ma viene ancora citato oggi come prova di quanto sia sempre stato preso sul serio il Fanorona in Madagascar.",
    fanorona_history_modern_title: "Ancora il gioco del Madagascar",
    fanorona_history_modern_p1: "Il Fanorona è ancora oggi ampiamente giocato in tutto il Madagascar e viene spesso descritto come il gioco da tavolo nazionale del paese, praticato informalmente nei villaggi e nelle città e studiato anche a livello competitivo. Esistono anche varianti più piccole - una versione 3x3 (Fanoron-Telo, profonda quanto il tris) e una versione 5x5 (Fanoron-Dimy) - ma il tabellone 5x9 descritto in questa pagina (Fanoron-Tsivy) è la forma standard e più conosciuta.",
    fanorona_history_modern_p2: "Il gioco ha suscitato anche un reale interesse accademico: un'analisi al computer pubblicata nel 2008 ha risolto debolmente il Fanorona, stabilendo che una partita giocata alla perfezione finisce in parità - collocandolo nella stessa rara compagnia della dama, un altro gioco antico risolto con precisione dai computer moderni."
});
I18n.markTextLoaded("it");
