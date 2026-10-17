// text/it/killersudoku.js
// Rules and history texts of killersudoku (it). Loaded by killersudoku-rules.html and killersudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    sudoku_rules_basics_title: "L'idea di base",
    sudoku_term_goal: "L'obiettivo",
    sudoku_term_input: "Inserire i numeri",
    sudoku_rules_end_title: "Completare uno schema",
    sudoku_term_win: "Risolto",
    sudoku_term_difficulty: "Difficoltà",
    puzzle_rules_hint: "Il pulsante «Suggerimento» aiuta in tre fasi. La prima pressione segna dove si trova il passo successivo. La seconda dà il motivo, cioè la regola che vale lì. La terza esegue il passo (inserisce il numero o costruisce il ponte). Il suggerimento parte dalla tua situazione attuale: se da qualche parte c'è un numero o un ponte sbagliato, te lo dice prima. Non tira mai a indovinare: se si può andare avanti solo provando, lo dice onestamente. I suggerimenti sono illimitati. Un rompicapo risolto con i suggerimenti conta comunque come vittoria; le statistiche mostrano in più quante vittorie sono arrivate con i suggerimenti.",
    killersudoku_rules_title: "Regole del Killer Sudoku",
    killersudoku_rules_intro: "Un riepilogo rapido di come PaperGames gioca a Killer Sudoku - utile per ripassare o imparare.",
    killersudoku_term_board: "La griglia",
    killersudoku_rules_board: "Come nel Sudoku, linee spesse dividono la griglia 9x9 in nove riquadri 3x3. Linee tratteggiate la dividono inoltre in gabbie da una a cinque caselle. Poche caselle, o nessuna, sono già compilate.",
    killersudoku_rules_goal: "Riempi ogni casella con una cifra da 1 a 9 in modo che ogni riga, ogni colonna e ogni riquadro 3x3 contenga ogni cifra esattamente una volta. Ogni rompicapo generato da PaperGames ha esattamente una soluzione.",
    killersudoku_term_regions: "Gabbie",
    killersudoku_rules_regions: "Il piccolo numero nella casella in alto a sinistra di una gabbia è la sua somma: le cifre della gabbia devono dare quel totale. A differenza del Calcudoku, nessuna cifra può ripetersi in una gabbia.",
    killersudoku_rules_input: "Seleziona una casella, poi scegli un numero dal tastierino sotto la griglia (o digita una cifra sulla tastiera). Una cifra mostrata in bianco su nero si ripete nella sua riga, colonna, riquadro o gabbia, oppure completa una gabbia con la somma sbagliata.",
    killersudoku_rules_difficulty: "I rompicapi facili hanno soprattutto gabbie piccole e qualche cifra data in più; quelli difficili hanno gabbie più grandi e solo le cifre necessarie per una soluzione unica, spesso quasi nessuna.",
    killersudoku_rules_win: "Il rompicapo è risolto appena ogni casella è piena e nessuna riga, colonna, riquadro o gabbia viola una regola.",
    killersudoku_history_title: "La storia del Killer Sudoku",
    killersudoku_history_origins_title: "Somme su una griglia di Sudoku",
    killersudoku_history_origins_p1: "Rompicapi che uniscono le regole del Sudoku a somme di gabbie venivano già pubblicati in Giappone negli anni Novanta, dove i giochi di somme come il Kakuro erano popolari. L'idea si diffuse ampiamente nel 2005, quando giornali britannici iniziarono a pubblicarli con il nome Killer Sudoku durante la mania mondiale del Sudoku.",
    killersudoku_history_origins_p2: "Il nome è descrittivo, non un marchio: «killer» prometteva semplicemente una sfida più dura di un Sudoku normale, dato che ci sono poche o nessuna cifra da cui partire.",
    killersudoku_history_names_title: "Come nascono qui i rompicapi",
    killersudoku_history_names_p1: "Ogni Killer Sudoku parte da una griglia di Sudoku appena generata e completamente risolta, che viene poi divisa in gabbie adiacenti senza cifre ripetute in nessuna gabbia.",
    killersudoku_history_names_p2: "Un risolutore integrato controlla poi se le somme delle gabbie permettono una sola soluzione. Se no, viene svelata una cifra in cui due soluzioni possibili differiscono, e il controllo si ripete finché resta esattamente una soluzione."
});
I18n.markTextLoaded("it");
