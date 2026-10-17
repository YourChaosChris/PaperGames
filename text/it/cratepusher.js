// text/it/cratepusher.js
// Rules and history texts of cratepusher (it). Loaded by cratepusher-rules.html and cratepusher-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    sudoku_rules_basics_title: "L'idea di base",
    cratepusher_rules_title: "Regole di Spingicasse",
    cratepusher_rules_intro: "Come funziona Spingicasse su PaperGames: un rompicapo per una persona in cui si spostano casse in un piccolo magazzino.",
    cratepusher_term_board: "Il tabellone",
    cratepusher_rules_board: "Una griglia rettangolare di muri (nero pieno) e pavimento (bianco). Sul pavimento ci sei tu (un cerchio pieno), diverse casse (un quadrato con una croce) e altrettante caselle obiettivo (un piccolo quadrato vuoto). Una cassa su un obiettivo diventa un quadrato pieno.",
    cratepusher_term_move: "Muoversi",
    cratepusher_rules_move: "Ti muovi una casella alla volta, in su, in giù, a sinistra o a destra, mai in diagonale. Non puoi attraversare muri né casse.",
    cratepusher_rules_move_targets: "Puoi camminare sui bersagli vuoti; ti bloccano solo i muri e le casse.",
    cratepusher_rules_hint: "«Suggerimento» ti mostra una sola spinta: la prima di una soluzione più breve dalla tua posizione attuale. La cassa da spingere riceve una cornice tratteggiata, la casella dove deve andare una cornice continua, e una frase sotto il tabellone indica riga, colonna e direzione (contate senza il muro esterno). Il suggerimento mostra solo la spinta: a farla sei tu. Per la successiva tocca di nuovo «Suggerimento». Se dalla tua posizione non c'è più soluzione, il suggerimento te lo dice. I suggerimenti non vengono salvati e non cambiano le tue statistiche.",
    cratepusher_term_push: "Spingere",
    cratepusher_rules_push: "Camminando contro una cassa la spingi di una casella, ma solo se la casella dietro è libera: niente muro e nessuna seconda cassa. Spingi sempre una sola cassa alla volta, e non puoi mai tirare una cassa verso di te.",
    cratepusher_term_goal: "L'obiettivo",
    cratepusher_rules_goal: "Il livello è risolto appena ogni cassa si trova su un obiettivo. Non importa quale cassa finisca su quale obiettivo.",
    cratepusher_term_stuck: "Bloccarsi",
    cratepusher_rules_stuck: "Poiché le casse non si possono tirare, una spinta sconsiderata può rendere un livello irrisolvibile, per esempio una cassa spinta in un angolo che non è un obiettivo. Il gioco ti avvisa quando una cassa resta bloccata in un angolo così. Altri vicoli ciechi non vengono segnalati: pensa in anticipo e usa «Annulla mossa» tutte le volte che vuoi.",
    cratepusher_term_controls: "Comandi",
    cratepusher_rules_controls: "Tocca una casella accanto a te per andarci (e spingere la cassa che vi si trova). Tocca una casella di pavimento più lontana e ci arrivi per la via più breve, ma solo se puoi arrivarci senza spingere nessuna cassa. Anche i tasti freccia e W, A, S, D ti muovono. «Annulla mossa» annulla le tue mosse una alla volta, quante vuoi; «Ricomincia livello» fa ripartire il livello.",
    cratepusher_term_levels: "I livelli",
    cratepusher_rules_levels: "Ogni livello lo costruisce PaperGames stesso, ogni volta nuovo: facile su una griglia 7x7 con 3 casse, medio su 9x9 con 4, difficile su 10x10 con 5. Il programma costruisce ogni livello all'indietro partendo dalla posizione risolta, quindi è sempre risolvibile, e poi lo verifica ancora con un proprio risolutore. Il numero di spinte della soluzione migliore è mostrato sopra il tabellone, insieme ai tuoi passi, alle tue spinte e a quante casse sono già su un obiettivo.",
    cratepusher_history_title: "La storia di Spingicasse",
    cratepusher_history_origins_title: "Un'idea del 1981",
    cratepusher_history_origins_p1: "Il principio di spingere casse una alla volta su posti segnati, senza mai tirarle, è stato inventato nel 1981 da Hiroyuki Imabayashi. Nel 1982 la società giapponese Thinking Rabbit lo ha pubblicato come videogioco con il nome di Sokoban.",
    cratepusher_history_origins_p2: "Dietro le regole semplici si nasconde una vera profondità: anche stanze piccole possono richiedere lunghe sequenze di mosse pianificate con cura, e gli informatici hanno dimostrato che risolvere rompicapi di questo tipo è in generale molto difficile. Da allora l'idea è stata ripresa da innumerevoli giochi di logica.",
    cratepusher_history_names_title: "Perché un altro nome",
    cratepusher_history_names_p1: "Sokoban è un marchio registrato di Falcon Co., Ltd. PaperGames non ha alcun legame con Falcon né con il gioco originale e usa quindi un nome proprio: Spingicasse. Lo stesso vale per Calcudoku, che per lo stesso motivo si gioca con un nome proprio.",
    cratepusher_history_names_p2: "Nessuno dei livelli qui proviene dal gioco originale o da una raccolta di livelli. Ogni livello è generato dal programma di PaperGames quando ne chiedi uno, costruito all'indietro dalla posizione risolta e verificato con un proprio risolutore."
});
I18n.markTextLoaded("it");
