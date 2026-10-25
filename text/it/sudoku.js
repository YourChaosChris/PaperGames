// text/it/sudoku.js
// Rules and history texts of sudoku (it). Loaded by sudoku-rules.html and sudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    sudoku_rules_title: "Regole del Sudoku",
    sudoku_rules_intro: "Una guida rapida a come PaperGames gioca a Sudoku - utile se sei arrugginito, o se stai imparando.",
    sudoku_rules_basics_title: "L'idea di base",
    sudoku_term_board: "La griglia",
    sudoku_rules_board: "La griglia 9x9 è divisa in nove riquadri 3x3. Alcune celle iniziano già compilate ('indizi') e non possono essere modificate; le altre iniziano vuote e tocca a te riempirle.",
    sudoku_term_goal: "L'obiettivo",
    sudoku_rules_goal: "Riempi ogni cella vuota con una cifra da 1 a 9 in modo che ogni riga, ogni colonna e ognuno dei nove riquadri 3x3 contenga ogni cifra esattamente una volta. Ogni schema generato da PaperGames ha esattamente una soluzione.",
    sudoku_term_input: "Inserire i numeri",
    sudoku_rules_input: "Seleziona una cella, poi scegli un numero dal tastierino sotto la griglia (oppure digita una cifra da tastiera). Una cella con un contorno tratteggiato è attualmente in conflitto con un'altra cella nella sua riga, colonna o riquadro - usalo come indizio che qualcosa va cambiato.",
    sudoku_rules_end_title: "Completare uno schema",
    sudoku_term_win: "Risolto",
    sudoku_rules_win: "Lo schema è risolto nel momento in cui la griglia è completamente riempita senza conflitti residui.",
    sudoku_term_difficulty: "Difficoltà",
    sudoku_rules_difficulty: "Gli schemi Facile, Medio e Difficile differiscono solo per quante delle 81 celle iniziano già compilate - meno indizi significa che serve più deduzione per progredire.",
    sudoku_history_title: "La storia del Sudoku",
    sudoku_history_origins_title: "Prima di tutto, un rompicapo americano",
    sudoku_history_origins_p1: "Il rompicapo di piazzamento numerico che oggi chiamiamo Sudoku apparve per la prima volta nel 1979 in una rivista americana di enigmistica, pubblicata da Dell Magazines con il titolo 'Number Place'. Il suo inventore viene di solito indicato in Howard Garns, un architetto in pensione e creatore di rompicapi freelance, anche se all'epoca la rivista non stampava mai i nomi degli autori, quindi l'attribuzione si basa su prove circostanziali piuttosto che su una dichiarazione firmata.",
    sudoku_history_origins_p2: "Il rompicapo si ispirava a un'idea matematica molto più antica, il quadrato latino - una griglia in cui ogni simbolo compare esattamente una volta per riga e colonna - studiata da Leonhard Euler nel Settecento, con in più il vincolo del riquadro 3x3 aggiunto per rendere raggiungibile una soluzione unica con la sola logica, senza dover tirare a indovinare.",
    sudoku_history_spread_title: "Un nome giapponese per una mania globale",
    sudoku_history_spread_p1: "Il rompicapo raggiunse il Giappone nel 1984 grazie all'azienda di enigmistica Nikoli, che lo ribattezzò 'Suuji wa dokushin ni kagiru' ('le cifre devono restare singole'), presto abbreviato in Sudoku ('numero singolo'). Nel 1986 Nikoli aggiunse due regole ancora oggi diffuse: un numero massimo di indizi e la loro disposizione simmetrica.",
    sudoku_history_spread_p2: "Il Sudoku rimase un modesto passatempo giapponese per due decenni, finché il giudice in pensione Wayne Gould, dopo averlo scoperto durante un viaggio a Tokyo, scrisse un programma per generare rapidamente gli schemi e convinse il Times di Londra a iniziare a pubblicarli nel 2004 - innescando in circa un anno una mania mondiale sui giornali.",
    sudoku_history_modern_title: "Dalla rubrica del giornale all'informatica",
    sudoku_history_modern_p1: "L'improvvisa popolarità del Sudoku attirò matematici e informatici tanto quanto risolutori occasionali: nel 2005 fu calcolato esattamente il numero totale di griglie 9x9 completate distinte (poco più di 6,6 sestilioni), e nel 2012 una ricerca computerizzata esaustiva stabilì che nessuno schema 9x9 valido richiede meno di 17 indizi per avere una soluzione unica.",
    sudoku_history_modern_p2: "Questo secondo risultato è esattamente il tipo di fatto su cui il generatore di PaperGames si basa al contrario: poiché l'unicità diventa più difficile da preservare man mano che gli indizi vengono rimossi, ogni schema qui viene prodotto partendo da una griglia completamente risolta e rimuovendo celle una alla volta finché sopravvive una soluzione unica.",
    puzzle_rules_hint: "Il pulsante «Suggerimento» aiuta in tre fasi. La prima pressione segna dove si trova il passo successivo. La seconda dà il motivo, cioè la regola che vale lì. La terza esegue il passo (inserisce il numero o costruisce il ponte). Il suggerimento parte dalla tua situazione attuale: se da qualche parte c'è un numero o un ponte sbagliato, te lo dice prima. Non tira mai a indovinare: se si può andare avanti solo provando, lo dice onestamente. I suggerimenti sono illimitati. Un rompicapo risolto con i suggerimenti conta comunque come vittoria; le statistiche mostrano in più quante vittorie sono arrivate con i suggerimenti."
});
I18n.markTextLoaded("it");
