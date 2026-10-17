// text/it/noneighbors.js
// Rules and history texts of noneighbors (it). Loaded by noneighbors-rules.html and noneighbors-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    sudoku_rules_basics_title: "L'idea di base",
    sudoku_term_goal: "L'obiettivo",
    sudoku_term_input: "Inserire i numeri",
    sudoku_rules_end_title: "Completare uno schema",
    sudoku_term_win: "Risolto",
    sudoku_term_difficulty: "Difficoltà",
    puzzle_rules_hint: "Il pulsante «Suggerimento» aiuta in tre fasi. La prima pressione segna dove si trova il passo successivo. La seconda dà il motivo, cioè la regola che vale lì. La terza esegue il passo (inserisce il numero o costruisce il ponte). Il suggerimento parte dalla tua situazione attuale: se da qualche parte c'è un numero o un ponte sbagliato, te lo dice prima. Non tira mai a indovinare: se si può andare avanti solo provando, lo dice onestamente. I suggerimenti sono illimitati. Un rompicapo risolto con i suggerimenti conta comunque come vittoria; le statistiche mostrano in più quante vittorie sono arrivate con i suggerimenti.",
    numberblocks_rules_title: "Regole di Senza vicini",
    numberblocks_rules_intro: "Un riepilogo rapido di come PaperGames gioca a Senza vicini - utile per ripassare o imparare.",
    numberblocks_term_board: "La griglia",
    numberblocks_rules_board: "Linee spesse dividono la griglia in blocchi da una a cinque caselle. Alcune caselle sono già compilate (in grassetto) e non si possono modificare.",
    numberblocks_rules_goal: "Riempi ogni casella vuota in modo che un blocco di n caselle contenga le cifre da 1 a n, ciascuna esattamente una volta: un blocco di tre caselle contiene 1, 2 e 3. Ogni rompicapo generato da PaperGames ha esattamente una soluzione.",
    numberblocks_term_regions: "La regola del contatto",
    numberblocks_rules_regions: "Due cifre uguali non devono mai toccarsi: né affiancate, né una sopra l'altra, né in diagonale. Nessuna delle fino a otto caselle intorno a una cifra può contenere la stessa cifra, anche se appartiene a un altro blocco.",
    numberblocks_rules_input: "Seleziona una casella, poi scegli un numero dal tastierino sotto la griglia (o digita una cifra sulla tastiera). Quando una cifra si ripete nel suo blocco, è troppo grande per il suo blocco o tocca la stessa cifra, tutte le caselle coinvolte mostrano la cifra in bianco su nero.",
    numberblocks_rules_difficulty: "I rompicapi facili usano una griglia 6x6, i medi 7x7 e i difficili 8x8, con meno cifre date a ogni livello.",
    numberblocks_rules_win: "Il rompicapo è risolto appena ogni casella è piena senza violare la regola dei blocchi né quella del contatto.",
    numberblocks_history_title: "La storia di Senza vicini",
    numberblocks_history_origins_title: "Il rompicapo di un inventore",
    numberblocks_history_origins_p1: "Senza vicini è stato inventato dall'autore giapponese di rompicapi Naoki Inaba, che lo pubblicò nel 2001. Inaba ha creato moltissimi giochi logici, spesso basati su un'unica regola chiara che porta a ragionamenti sorprendentemente profondi.",
    numberblocks_history_origins_p2: "Il rompicapo unisce due idee note: zone che devono contenere ciascuna un insieme fisso di cifre, come i riquadri del Sudoku, e una regola di vicinato presa dal re degli scacchi: una cifra non può ripetersi in nessuna casella dove potrebbe muoversi un re.",
    numberblocks_history_names_title: "Con altri nomi",
    numberblocks_history_names_p1: "Il rompicapo è noto anche a livello internazionale come Suguru o Tectonic; questi nomi indicano le stesse regole di aree e vicinato.",
    numberblocks_history_names_p2: "Ogni rompicapo viene creato sul tuo dispositivo: i blocchi e una soluzione valida vengono costruiti insieme casella per casella, poi le cifre vengono tolte una alla volta finché un risolutore integrato trova ancora esattamente una soluzione."
});
I18n.markTextLoaded("it");
