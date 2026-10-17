// text/it/surakarta.js
// Rules and history texts of surakarta (it). Loaded by surakarta-rules.html and surakarta-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    surakarta_rules_title: "Regole di Surakarta",
    surakarta_rules_intro: "Un rapido promemoria su come PaperGames gioca a Surakarta - utile se sei arrugginito o lo stai imparando. La cattura tramite anello è la parte che confonde quasi tutti all'inizio, quindi qui sotto trovi un esempio completo.",
    surakarta_rules_basics_title: "L'idea di base",
    surakarta_term_board: "La plancia",
    surakarta_rules_board: "Una semplice griglia di punti 6x6. Ogni giocatore inizia con 12 pedine che riempiono le due file più vicine al proprio lato (Nero sulle due file superiori, Bianco sulle due inferiori), mentre le due file centrali restano vuote. Il Nero muove per primo.",
    surakarta_term_movement: "Muovere",
    surakarta_rules_movement: "Al tuo turno, sposta una pedina di un solo passo verso un punto vuoto adiacente - dritto o in diagonale, in una delle 8 direzioni. Un passo del genere è sempre silenzioso: non cattura mai nulla, anche se finisce proprio accanto a una pedina nemica.",
    surakarta_term_loop: "Gli anelli",
    surakarta_rules_loop: "Quattro linee della plancia - la 2ª e la 5ª riga, e la 2ª e la 5ª colonna - non finiscono semplicemente al bordo: ogni estremità di queste quattro linee curva verso l'esterno e si collega all'estremità più vicina della linea speciale adiacente allo stesso angolo, formando un anello attorno a ciascuno dei 4 angoli della plancia. Una pedina che scivola lungo una di queste quattro linee può percorrere un anello uscendo da un bordo e ricomparire proseguendo lungo la linea collegata, sempre in linea retta, per quanto la pista e ulteriori anelli lo permettano.",
    surakarta_term_capture: "Catturare",
    surakarta_rules_capture: "Catturare è completamente separato dal muovere, e funziona solo tramite gli anelli. Invece di fare un solo passo, una pedina può scivolare per intero in una delle sue 8 direzioni - scavalcando ogni altra pedina, amica o nemica, senza alcun effetto - finché la linea e i suoi collegamenti ad anello lo consentono. Nel momento in cui ha percorso almeno un anello E la prossima pedina che incontra è nemica, quella pedina viene catturata e la pedina che scivola atterra sulla sua casella, terminando lì la mossa. Se la linea esce dalla plancia senza un anello che la prosegua, o se gira tutt'intorno senza mai incontrare una pedina nemica valida, non c'è cattura per quella via. Catturare qui è facoltativo: anche con una cattura disponibile, puoi comunque giocare un passo silenzioso.",
    surakarta_rules_example_title: "Esempio svolto: una cattura ad anello",
    surakarta_rules_example_intro: "○ è il Bianco (la pedina che si muove in questo esempio), ● è il Nero. La pedina bianca in A si trova su una delle quattro linee che portano a un anello. Niente la blocca fino al bordo, quindi invece di un passo silenzioso, il Bianco gioca uno scivolamento di cattura completo.",
    surakarta_rules_example_caption: "La pedina bianca in A scivola a sinistra lungo la riga. Esce dal bordo, percorre l'anello attorno all'angolo e ricompare scendendo lungo la colonna collegata. La prima pedina che incontra dopo aver usato quell'anello è la pedina nera in B - quindi B viene catturata, e la pedina bianca atterra sulla sua casella ora vuota (cerchio tratteggiato). Se A fosse stata invece a un solo passo da una pedina nemica senza che fosse coinvolto alcun anello, quel nemico adiacente NON sarebbe stato catturato - solo uno scivolamento che usa davvero un anello può catturare.",
    surakarta_rules_end_title: "Come finisce una partita",
    surakarta_term_win: "Vincere",
    surakarta_rules_win: "Vinci catturando tutte le pedine dell'avversario, oppure se il tuo avversario non ha alcuna mossa legale al proprio turno.",
    surakarta_term_resignation: "Resa",
    surakarta_rules_resignation: "Un giocatore può arrendersi in qualsiasi momento, terminando subito la partita a favore dell'avversario.",
    surakarta_history_title: "La storia di Surakarta",
    surakarta_history_origins_title: "Chiamato come una città di Giava",
    surakarta_history_origins_p1: "Surakarta - conosciuta anche ampiamente con il suo nome più comune, Solo - è una città di Giava Centrale, in Indonesia, e il gioco che ne porta il nome si ritiene tradizionalmente abbia avuto origine lì. Come per molti giochi da tavolo tradizionali tramandati soprattutto attraverso la pratica piuttosto che per iscritto, l'età esatta e i dettagli della sua storia più antica non sono documentati con precisione; ciò che è chiaro è che viene giocato nella regione da moltissimo tempo e resta ancora oggi fortemente associato alla città.",
    surakarta_history_unique_title: "Un esempio molto citato di regola di cattura \"non ovvia\"",
    surakarta_history_unique_p1: "Surakarta è insolito, persino tra i giochi tradizionali, per il modo in cui separa completamente il movimento dalla cattura in due meccaniche del tutto diverse: una normale mossa silenziosa è solo un passo verso un punto vicino, mentre ogni cattura dipende interamente dai caratteristici anelli d'angolo della plancia - una pedina senza alcuna linea idonea a un anello semplicemente non può catturare in quel turno, per quanto sia circondata. Questa netta separazione, e il fatto che una pedina possa trovarsi proprio accanto a un pezzo nemico in totale sicurezza, è esattamente ciò che rende il gioco chiaro una volta compreso - ed esattamente ciò che lo rende un esempio spesso citato nelle discussioni di game design sulle meccaniche di cattura non immediatamente evidenti guardando la plancia.",
    surakarta_history_modern_title: "Ancora giocato oggi",
    surakarta_history_modern_p1: "Surakarta resta una parte viva della cultura ludica tradizionale indonesiana e ha viaggiato anche ben oltre: è un argomento ricorrente negli ambienti appassionati di giochi astratti e nella ricerca sui giochi al computer proprio perché la sua regola di cattura è così particolare, ed è comparso in raccolte generali di giochi da tavolo e in esercizi di programmazione di giochi come esempio compatto e autonomo di una meccanica quasi senza equivalenti nel canone dei giochi da tavolo tradizionali."
});
I18n.markTextLoaded("it");
