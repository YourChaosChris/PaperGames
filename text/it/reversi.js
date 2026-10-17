// text/it/reversi.js
// Rules and history texts of reversi (it). Loaded by reversi-rules.html and reversi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    reversi_rules_title: "Regole del Reversi",
    reversi_rules_intro: "Un rapido riferimento su come PaperGames gioca a Reversi - utile se sei arrugginito o lo stai imparando.",
    reversi_rules_basics_title: "L'idea di base",
    reversi_term_discs: "I dischi e la posizione iniziale",
    reversi_rules_discs: "Il Reversi si gioca su una plancia 8x8. La partita inizia con due dischi per ciascun colore posizionati in diagonale nelle quattro caselle centrali. Il nero muove sempre per primo.",
    reversi_term_flanking: "Accerchiamento",
    reversi_rules_flanking: "Una mossa piazza un disco su una casella vuota in modo da accerchiare - intrappolare tra il tuo nuovo disco e un altro tuo disco - uno o più dischi avversari in linea retta (orizzontale, verticale o diagonale). Ogni disco accerchiato si ribalta immediatamente al tuo colore.",
    reversi_rules_pass_title: "Quando non puoi muovere",
    reversi_term_pass: "Nessuna mossa legale",
    reversi_rules_pass: "Se non hai mosse legali, il tuo turno viene saltato automaticamente e il gioco torna al tuo avversario - non è possibile passare volontariamente finché esiste una mossa legale. Se nessuno dei due giocatori ha mosse legali, la partita finisce immediatamente.",
    reversi_rules_end_title: "Come finisce una partita",
    reversi_term_win: "Vittoria",
    reversi_rules_win: "La partita finisce nel momento in cui nessuno dei due giocatori ha una mossa legale (di solito perché il tavoliere è pieno). Vince chi ha più dischi sul tavoliere; una divisione paritaria è patta.",
    reversi_term_resignation: "Abbandono",
    reversi_rules_resignation: "Un giocatore può abbandonare in qualsiasi momento, terminando immediatamente la partita a favore dell'avversario.",
    reversi_history_title: "La Storia del Reversi",
    reversi_history_origins_title: "Un originale vittoriano",
    reversi_history_origins_p1: "Il Reversi apparve per la prima volta in Inghilterra all'inizio degli anni 1880, nel mezzo di una disputa tipicamente vittoriana: due giocatori, Lewis Waterman e John W. Mollett, sostenevano entrambi di aver inventato il gioco e nel 1888 pubblicarono opuscoli contrapposti accusandosi a vicenda di aver rubato l'idea. Gli storici non sanno ancora con certezza a chi spetti il merito.",
    reversi_history_origins_p2: "Nelle prime versioni del Reversi i giocatori potevano posizionare i primi dischi ovunque sulla plancia, e alcuni regolamenti vittoriani prevedevano che uno schieramento completamente circondato perdesse il controllo dell'intera plancia con una sola mossa - stranezze che furono infine eliminate quando le regole vennero standardizzate.",
    reversi_history_spread_title: "Reinventato in Giappone",
    reversi_history_spread_p1: "Il gioco riemerse in Giappone nel 1973, quando Goro Hasegawa perfezionò le regole del Reversi - fissando i quattro dischi iniziali nel loro consueto schema diagonale ed eliminando le vecchie varianti - pubblicandolo tramite Tsukuda Original con un nuovo nome: Othello, un omaggio all'opera di Shakespeare e al suo conflitto centrale tra bianco e nero.",
    reversi_history_spread_p2: "Othello divenne enormemente popolare in Giappone e poi nel mondo, dando origine a un Campionato del Mondo di Othello disputato ogni anno dal 1977 e consolidando il regolamento standardizzato - quello usato in questa app - come la versione giocata oggi a livello competitivo.",
    reversi_history_modern_title: "Un campo di battaglia per i computer",
    reversi_history_modern_p1: "Othello si rivelò un soggetto insolitamente adatto per la ricerca sull'IA nei giochi: le sue regole sono semplici, ma il numero enorme di posizioni raggiungibili ha a lungo impedito alle strategie ingenue di funzionare bene.",
    reversi_history_modern_p2: "Nell'agosto 1997, il programma Logistello di Michael Buro sconfisse il campione del mondo umano in carica Takeshi Murakami per 6 partite a 0 - un risultato storico arrivato lo stesso anno della vittoria del Deep Blue negli scacchi. I motori di Othello sono diventati solo più forti da allora, e il gioco è oggi considerato risolto, o quasi, per un'ampia gamma di posizioni.",
    reversi_history_names_title: "Perché Reversi",
    reversi_history_names_p1: "Il Reversi in sé risale al XIX secolo ed è di pubblico dominio. Othello è un marchio registrato. PaperGames non ha alcun legame con i titolari di questo marchio e usa quindi il nome più antico, Reversi."
});
I18n.markTextLoaded("it");
