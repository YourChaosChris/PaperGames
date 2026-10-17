// text/it/calcudoku.js
// Rules and history texts of calcudoku (it). Loaded by calcudoku-rules.html and calcudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    sudoku_rules_basics_title: "L'idea di base",
    sudoku_term_goal: "L'obiettivo",
    sudoku_term_input: "Inserire i numeri",
    sudoku_rules_end_title: "Completare uno schema",
    sudoku_term_win: "Risolto",
    sudoku_term_difficulty: "Difficoltà",
    puzzle_rules_hint: "Il pulsante «Suggerimento» aiuta in tre fasi. La prima pressione segna dove si trova il passo successivo. La seconda dà il motivo, cioè la regola che vale lì. La terza esegue il passo (inserisce il numero o costruisce il ponte). Il suggerimento parte dalla tua situazione attuale: se da qualche parte c'è un numero o un ponte sbagliato, te lo dice prima. Non tira mai a indovinare: se si può andare avanti solo provando, lo dice onestamente. I suggerimenti sono illimitati. Un rompicapo risolto con i suggerimenti conta comunque come vittoria; le statistiche mostrano in più quante vittorie sono arrivate con i suggerimenti.",
    calcudoku_rules_title: "Regole del Calcudoku",
    calcudoku_rules_intro: "Un riepilogo rapido di come PaperGames gioca a Calcudoku - utile per ripassare o imparare.",
    calcudoku_term_board: "La griglia",
    calcudoku_rules_board: "La griglia è quadrata, da 4x4 a 7x7. A differenza del Sudoku non ha riquadri; linee spesse la dividono invece in gabbie, gruppi da una a quattro caselle adiacenti.",
    calcudoku_rules_goal: "Riempi ogni casella con una cifra da 1 alla dimensione della griglia (da 1 a 5 su una 5x5) in modo che ogni riga e ogni colonna contenga ogni cifra esattamente una volta. Ogni rompicapo generato da PaperGames ha esattamente una soluzione.",
    calcudoku_term_regions: "Gabbie e operazioni",
    calcudoku_rules_regions: "La piccola etichetta nella casella in alto a sinistra di una gabbia mostra un risultato e un'operazione. Con + o × le cifre della gabbia, sommate o moltiplicate in qualsiasi ordine, devono dare il risultato. Una gabbia con – o ÷ ha sempre due caselle: la cifra maggiore meno la minore, o divisa per la minore, dà il risultato. Una gabbia di una sola casella mostra semplicemente la sua cifra. Una cifra può comparire due volte nella stessa gabbia, purché riga e colonna lo permettano.",
    calcudoku_rules_input: "Seleziona una casella, poi scegli un numero dal tastierino sotto la griglia (o digita una cifra sulla tastiera). Una cifra mostrata in bianco su nero è in conflitto con un'altra della sua riga o colonna, oppure completa una gabbia che non raggiunge il suo risultato.",
    calcudoku_rules_difficulty: "Scegli la dimensione della griglia e un livello prima di iniziare. Griglie più grandi e livelli più alti significano gabbie più grandi e meno gabbie di una casella, che rivelano di meno.",
    calcudoku_rules_win: "Il rompicapo è risolto appena ogni casella è piena e nessuna riga, colonna o gabbia viola una regola.",
    calcudoku_history_title: "La storia del Calcudoku",
    calcudoku_history_origins_title: "Da un'aula del Giappone",
    calcudoku_history_origins_p1: "Questo tipo di rompicapo è di solito attribuito a Tetsuya Miyamoto, un insegnante di matematica giapponese che lo ideò intorno al 2004 per allenare i suoi alunni al calcolo e al ragionamento logico senza spiegare loro come risolverlo. L'idea uscì presto dalla sua classe grazie a libri di enigmistica e giornali.",
    calcudoku_history_origins_p2: "Sotto l'aritmetica c'è il quadrato latino - una griglia in cui ogni simbolo compare esattamente una volta per riga e per colonna - studiato da matematici come Leonhard Euler nel XVIII secolo, e che è anche il cuore del Sudoku.",
    calcudoku_history_names_title: "Molti nomi, un solo rompicapo",
    calcudoku_history_names_p1: "Lo stesso tipo di rompicapo è pubblicato commercialmente anche con il nome KenKen. KenKen è un marchio registrato di Nextoy LLC. PaperGames non ha alcun legame con Nextoy LLC e usa invece il nome generico Calcudoku.",
    calcudoku_history_names_p2: "Ogni Calcudoku viene creato sul tuo dispositivo: un quadrato latino casuale viene diviso in gabbie, ogni gabbia riceve un'operazione con risultato intero e un risolutore integrato tiene solo le suddivisioni con esattamente una soluzione."
});
I18n.markTextLoaded("it");
