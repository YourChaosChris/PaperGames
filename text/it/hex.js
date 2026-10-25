// text/it/hex.js
// Rules and history texts of hex (it). Loaded by hex-rules.html and hex-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    hex_rules_title: "Regole di Hex",
    hex_rules_intro: "Una guida rapida a come PaperGames gioca a Hex - utile se sei arrugginito, o se stai imparando.",
    hex_rules_basics_title: "L'idea di base",
    hex_term_setup: "L'allestimento",
    hex_rules_setup: "La tavola è un rombo di caselle esagonali. Il Nero (pietre piene) ha i bordi in alto e in basso, il Bianco (pietre contornate) quelli a sinistra e a destra. Comincia il Nero. Le tavole di Hex stampate usano spesso il rosso e il blu; PaperGames gioca con il nero e il bianco, perché uno schermo a inchiostro elettronico non mostra colori.",
    hex_term_moving: "Fare un turno",
    hex_rules_moving: "Al tuo turno, piazza una pietra del tuo colore su una cella vuota qualsiasi - non ci sono catture e le pietre non si muovono mai una volta piazzate.",
    hex_term_swap: "La regola dello scambio",
    hex_rules_swap: "Cominciare è un vantaggio, per questo la regola dello scambio è attiva, a meno che tu non la spenga prima della partita. Dopo la prima pietra del Nero, il Bianco può toccare «Scambia» invece di mettere una pietra: i giocatori si scambiano i colori, la prima pietra appartiene ora a chi era Bianco e l’altro continua col Bianco. Il Nero collega sempre alto e basso, il Bianco sinistra e destra. Il computer scambia quando la prima pietra è al centro della tavola.",
    hex_term_win: "Vittoria",
    hex_rules_win: "Costruisci una catena ininterrotta delle tue pietre che colleghi i tuoi due lati. Hex non può mai finire in patta: una volta che il tavoliere è pieno, è sempre garantito che esista la catena di un giocatore, indipendentemente dal fatto che uno dei due stesse cercando di bloccare l'altro.",
    hex_rules_end_title: "Una nota sulla strategia",
    hex_term_blocking: "Attacco e difesa sono la stessa mossa",
    hex_rules_blocking: "Poiché la patta è impossibile, bloccare la connessione del tuo avversario e costruire la tua sono in realtà lo stesso compito visto da due lati - una cella che aiuta la tua catena molto spesso interrompe anche la loro.",
    hex_history_title: "La storia di Hex",
    hex_history_origins_title: "Inventato due volte",
    hex_history_origins_p1: "Hex fu inventato per la prima volta nel 1942 dal matematico, poeta e designer danese Piet Hein, che lo introdusse in Danimarca con il nome \"Polygon\" dopo essersi interrogato sulla possibilità che un gioco in stile mappa a quattro colori potesse mai finire in patta.",
    hex_history_origins_p2: "Fu reinventato indipendentemente nel 1948 dal matematico John Nash - in seguito premio Nobel per l'economia e soggetto del film A Beautiful Mind - mentre era uno studente di dottorato a Princeton, dove gli studenti ci giocavano sulle piastrelle esagonali dei pavimenti dei bagni e lo chiamavano \"Nash\".",
    hex_history_origins_p3: "Il gioco raggiunse un pubblico più ampio nel 1957, quando Martin Gardner ne scrisse nella sua rubrica \"Mathematical Games\" su Scientific American, dandogli il nome \"Hex\" che gli è rimasto da allora.",
    hex_history_math_title: "Un favorito dei matematici",
    hex_history_math_p1: "Hex è un soggetto prediletto nella teoria dei giochi e nella topologia grazie a un fatto pulito e dimostrabile: il gioco non può mai finire in patta - una conseguenza della stessa matematica alla base del teorema del punto fisso di Brouwer - il che significa anche che un argomento di \"furto di strategia\" dimostra che il primo giocatore deve avere una strategia vincente, anche se nessuno sa quale sia effettivamente quella strategia per tavolieri più grandi.",
    hex_history_math_p2: "Risolvere completamente Hex diventa drammaticamente più difficile man mano che il tavoliere cresce: i tavolieri piccoli (fino a circa 10x10) sono stati completamente risolti tramite ricerca computerizzata, ma la dimensione standard da torneo 11x11 e quelle più grandi restano irrisolte, il che rende Hex un obiettivo continuo sia per la ricerca sull'IA nei giochi sia per la teoria dei giochi combinatoria.",
    hex_history_version_title: "Questa versione",
    hex_history_version_p1: "PaperGames gioca su un tavoliere 9x9, una dimensione che mantiene le partite comodamente più brevi pur lasciando comunque un margine reale sia alla strategia di collegamento sia a quella di blocco."
});
I18n.markTextLoaded("it");
