// text/it/tablut.js
// Rules and history texts of tablut (it). Loaded by tablut-rules.html and tablut-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    tablut_rules_title: "Regole del Tablut",
    tablut_rules_intro: "Una guida rapida a come PaperGames gioca a Tablut, il membro 9x9 della famiglia Tafl - utile se sei arrugginito, o se stai imparando.",
    tablut_rules_basics_title: "L'idea di base",
    tablut_term_setup: "L'allestimento",
    tablut_rules_setup: "Il re inizia sul trono centrale, al centro di una croce di otto difensori, assediato da otto attaccanti disposti due per lato. Gli attaccanti muovono per primi, e i due schieramenti inseguono obiettivi molto diversi: lo schieramento del re vuole che raggiunga un angolo, gli attaccanti vogliono intrappolarlo per primi.",
    tablut_term_moving: "Muoversi",
    tablut_rules_moving: "Ogni pezzo - attaccante, difensore o il re - si muove come una torre: qualsiasi distanza in linea retta, ma mai attraverso o sopra un altro pezzo.",
    tablut_term_special: "Il trono e gli angoli",
    tablut_rules_special: "Il trono centrale e le quattro caselle d'angolo sono off-limits per tutti tranne il re: attaccanti e difensori non possono né posizionarvisi né attraversarli, mentre il re può rientrare liberamente nel trono vuoto. Gli angoli sono le uniche caselle di fuga del re.",
    tablut_term_capture: "Catturare",
    tablut_rules_capture: "Un pezzo normale (attaccante o difensore) viene catturato per cattura a tenaglia: intrappolalo tra due pezzi nemici, oppure un pezzo nemico e una casella speciale ostile (il trono vuoto o un angolo), su lati opposti di una linea retta. Solo il pezzo appena mosso può innescare una cattura, quindi muovere tu stesso un pezzo tra due nemici è sempre sicuro.",
    tablut_rules_example_title: "Esempio pratico",
    tablut_rules_example_intro: "Due brevi esempi di come funziona la tenaglia nella pratica (usando le classiche coordinate del tavoliere a-i / 1-9, colonna e poi riga):",
    tablut_term_example_ordinary: "Una tenaglia ordinaria",
    tablut_rules_example_ordinary: "Un difensore svedese si trova in d6, con un attaccante moscovita posizionato in c6, subito a ovest. Quando un secondo attaccante scivola in e6, il difensore è ora intrappolato tra due attaccanti in linea retta - e viene catturato.",
    tablut_term_example_throne: "Una tenaglia assistita dal trono",
    tablut_rules_example_throne: "Un difensore in e6 si trova subito a sud del trono vuoto (e5). Un solo attaccante che scivola in e7, subito a sud del difensore, basta per catturarlo: il trono vuoto conta come ostile sul lato opposto, quindi non serve un secondo pezzo attaccante.",
    tablut_rules_end_title: "Vincere la partita",
    tablut_term_kingcapture: "Catturare il re",
    tablut_rules_kingcapture: "Il re viene catturato solo quando tutte e quattro le caselle ortogonalmente adiacenti a lui sono ostili: occupate da attaccanti, oppure - per un lato rivolto verso il trono - il trono vuoto stesso, che conta come casella ostile equivalente a un attaccante. A differenza di un pezzo normale, il bordo del tavoliere non conta mai come ostile nei confronti del re in questo regolamento: un re spinto contro il bordo ha comunque bisogno di un vero attaccante su ogni lato aperto.",
    tablut_term_win: "Come finisce la partita",
    tablut_rules_win: "Lo schieramento del re vince nell'istante in cui raggiunge uno qualsiasi dei quattro angoli. Gli attaccanti vincono catturando il re come descritto sopra. Uno schieramento senza alcuna mossa legale al proprio turno perde.",
    tablut_history_title: "La storia del Tablut",
    tablut_history_linnaeus_title: "Linneo in Lapponia",
    tablut_history_linnaeus_p1: "Nel 1732, il naturalista svedese Carl Linneo - decenni prima di rivoluzionare la biologia con il suo sistema per nominare le specie - viaggiò per la Lapponia catalogando piante, animali e le usanze del popolo sami che incontrava lungo il percorso. Tra i suoi appunti, registrò un gioco da tavolo che i sami chiamavano Tablut: il suo tavoliere 9x9, i suoi pezzi e le regole con cui vi giocavano.",
    tablut_history_linnaeus_p2: "Quella descrizione si rivelò enormemente importante. Non è sopravvissuto quasi nessun regolamento completo di alcun gioco Tafl fin dall'epoca vichinga stessa - il gioco era semplicemente caduto in disuso nella maggior parte d'Europa prima che a qualcuno venisse in mente di metterne le regole per iscritto. Gli appunti di Linneo sul Tablut, sebbene registrati secoli dopo l'apice vichingo del Tafl e imperfetti in alcuni punti (il suo manoscritto è ambiguo su un paio di casi limite, ed è proprio per questo che ricostruzioni diverse e regolamenti moderni sono ancora oggi in disaccordo su alcuni dettagli), restano da allora la fonte primaria più importante usata dagli studiosi per ricostruire come probabilmente si giocasse in tutta la famiglia Tafl.",
    tablut_history_family_title: "La variante Tafl più conosciuta",
    tablut_history_family_p1: "Anche grazie a questa documentazione, il Tablut è il membro più conosciuto e storicamente più importante della famiglia Tafl - quello più spesso usato come base quando si ricostruiscono le regole dei suoi numerosi parenti, dal piccolo Brandub 7x7 fino all'enorme Alea Evangelii 19x19.",
    tablut_history_brandub_link: "PaperGames offre anche la variante Brandub più piccola, su un tavoliere 7x7, se vuoi confrontare le due dimensioni di tavoliere.",
    tablut_history_version_title: "Questa versione",
    tablut_history_version_p1: "PaperGames gioca a Tablut sul tavoliere standard 9x9 con 8 attaccanti, 8 difensori e un re, usando una regola moderna e chiaramente definita per la cattura del re (vedi la pagina delle regole) - poiché, come dimostrano gli stessi appunti di Linneo, anche la fonte Tafl meglio documentata lascia alcuni dettagli aperti all'interpretazione."
});
I18n.markTextLoaded("it");
