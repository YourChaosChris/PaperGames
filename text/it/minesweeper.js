// text/it/minesweeper.js
// Rules and history texts of minesweeper (it). Loaded by minesweeper-rules.html and minesweeper-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    minesweeper_rules_title: "Regole di Campo Minato",
    minesweeper_rules_intro: "Una guida rapida a come PaperGames gioca a Campo Minato - utile se sei arrugginito, o se stai imparando.",
    minesweeper_rules_basics_title: "L'idea di base",
    minesweeper_term_board: "La griglia e il primo click",
    minesweeper_rules_board: "Mine nascoste sono sparse sulla griglia. La tua prima rivelazione è sempre garantita sicura - le mine vengono piazzate solo dopo, evitando quella cella e tutto ciò che le sta intorno - quindi la partita non finisce mai prima di iniziare.",
    minesweeper_term_numbers: "Leggere i numeri",
    minesweeper_rules_numbers: "Rivelare una cella sicura mostra un numero: quante mine si nascondono nelle sue otto celle adiacenti. Una cella vuota significa zero, e rivelarla apre automaticamente tutta l'area vuota collegata.",
    minesweeper_term_flags: "Mettere le bandierine",
    minesweeper_rules_flags: "Segna con una bandierina una cella che credi nasconda una mina, usando la Modalità bandierina (per gli schermi touch) o un click destro (su browser desktop) - le celle contrassegnate non possono essere rivelate per errore. Cliccando su un numero già rivelato i cui vicini contrassegnati corrispondono al suo conteggio si rivelano subito tutti gli altri vicini, esattamente come il click centrale nel classico gioco desktop - ma una bandierina piazzata per errore può comunque costarti la partita in questo modo.",
    minesweeper_rules_end_title: "Come finisce una partita",
    minesweeper_term_win: "Vittoria",
    minesweeper_rules_win: "Rivela tutte le celle che non sono mine e avrai sgombrato il campo.",
    minesweeper_term_loss: "Sconfitta",
    minesweeper_rules_loss: "Rivela una mina e la partita finisce immediatamente - tutte le mine sul tavoliere vengono mostrate, con quella che ti ha fatto perdere contrassegnata diversamente dalle altre.",
    minesweeper_history_title: "La storia di Campo Minato",
    minesweeper_history_origins_title: "Dai mainframe al desktop",
    minesweeper_history_origins_p1: "I giochi di rivelazione e deduzione in stile Campo Minato risalgono ai primi anni '60 e sono apparsi con vari nomi su mainframe e i primi personal computer fino agli anni '80, tra cui una versione del 1989 per Windows/OS2 chiamata 'Mined-Out' e diversi cloni freeware con nomi come 'RLogic' e 'Cube'.",
    minesweeper_history_origins_p2: "La versione per Windows che ha reso famoso il gioco si deve a due dipendenti Microsoft: Curt Johnson scrisse il gioco prima per OS/2 di IBM e Robert Donner lo portò su Windows. Uscì la prima volta nel 1990 nel Microsoft Entertainment Pack e dal 1992 fece parte dell’installazione standard di Windows 3.1, dove sostituì il precedente gioco di Windows Reversi.",
    minesweeper_history_spread_title: "Installato su ogni scrivania",
    minesweeper_history_spread_p1: "Poiché Windows era preinstallato su una quota schiacciante dei PC del mondo negli anni '90 e 2000, Campo Minato divenne uno dei giochi per computer più giocati della storia quasi per default - installato ovunque, senza bisogno di manuale, e giocabile nei minuti morti tra un lavoro vero e l'altro.",
    minesweeper_history_spread_p2: "Il primo click garantito sicuro, oggi considerato una parte fondamentale delle regole, fu esso stesso un perfezionamento: la versione originale del 1992 poteva occasionalmente farti perdere già al primo click, una frustrazione che le versioni successive eliminarono rimandando il piazzamento delle mine a dopo quella prima rivelazione - lo stesso approccio usato qui.",
    minesweeper_history_modern_title: "Un rompicapo genuinamente difficile",
    minesweeper_history_modern_p1: "Al di là della nostalgia, Campo Minato si rivela essere matematicamente serio: nel 2000, Richard Kaye dimostrò che stabilire se un dato tavoliere di Campo Minato parzialmente rivelato abbia una soluzione coerente con i suoi indizi è NP-completo, collocandolo nella stessa classe di complessità computazionale di problemi notoriamente difficili come quello del commesso viaggiatore.",
    minesweeper_history_modern_p2: "Questo risultato significa che non esiste un algoritmo scorciatoia noto che risolva sempre rapidamente una posizione arbitraria di Campo Minato - nei casi più difficili, un giocatore (o un computer) può essere ridotto a una vera scommessa al 50/50, senza modo di dedurre la cella sicura con la sola logica, che è esattamente il momento che ogni giocatore navigato ha imparato a temere."
});
I18n.markTextLoaded("it");
