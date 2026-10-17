// text/it/mancala.js
// Rules and history texts of mancala (it). Loaded by mancala-rules.html and mancala-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    mancala_rules_title: "Regole del Mancala",
    mancala_rules_intro: "Una guida rapida alla versione di PaperGames del Mancala - nello specifico il Kalaha, il regolamento standardizzato usato dalla maggior parte dei giochi di mancala digitali - utile se sei arrugginito, o se stai imparando.",
    mancala_rules_basics_title: "L'idea di base",
    mancala_term_board: "Buche e depositi",
    mancala_rules_board: "Ogni giocatore ha sei buche in fila, con 4 semi ciascuna all'inizio, più un deposito all'estremità destra della propria fila. Al tuo turno, scegli una delle tue buche non vuote e semina i suoi semi uno alla volta in ogni buca successiva, procedendo in senso antiorario intorno a tutto il tavoliere.",
    mancala_term_sowing: "Semina",
    mancala_rules_sowing: "Seminando si deposita un seme in ogni buca che attraversi, incluso il tuo deposito, ma si salta sempre completamente il deposito dell'avversario - non riceve mai un seme dalla tua mossa.",
    mancala_term_extra: "Turni extra",
    mancala_rules_extra: "Se il tuo ultimo seme finisce nel tuo deposito, muovi immediatamente di nuovo.",
    mancala_rules_capture_title: "Catturare",
    mancala_term_capture: "Cattura",
    mancala_rules_capture: "Se il tuo ultimo seme finisce in una delle tue buche che era vuota prima di quel seme, lo catturi insieme a tutti i semi della buca direttamente opposta - tutto finisce dritto nel tuo deposito. Se la buca opposta è vuota, non si cattura nulla.",
    mancala_rules_end_title: "Come finisce una partita",
    mancala_term_win: "Vittoria",
    mancala_rules_win: "La partita finisce nel momento in cui le sei buche di un giocatore sono tutte vuote al suo turno. Ogni seme rimasto dall'altra parte viene raccolto nel deposito di quel giocatore, e vince chi ha più semi nel proprio deposito (una divisione paritaria è patta).",
    mancala_term_resignation: "Abbandono",
    mancala_rules_resignation: "Un giocatore può abbandonare in qualsiasi momento, terminando immediatamente la partita a favore dell'avversario.",
    mancala_history_title: "La storia del Mancala",
    mancala_history_origins_title: "Buche incise nella pietra",
    mancala_history_origins_p1: "Tavolieri per giochi della famiglia del mancala sono stati ritrovati incisi direttamente nella pietra in tutta l'Africa e il Medio Oriente, alcuni stimati a ben oltre mille anni di età, anche se - come per molti giochi antichi - la datazione e l'origine esatte sono dibattute tra gli storici.",
    mancala_history_origins_p2: "Ciò che è chiaro è che i giochi di buche e semi si sono diffusi e diversificati enormemente nel corso dei secoli, producendo centinaia di varianti regionali in Africa, Medio Oriente e Asia, dall'Oware e il Bao al Congkak - ciascuna con le proprie dimensioni del tavoliere, numero di semi e regole di cattura, tutte condividendo la stessa idea di fondo della semina.",
    mancala_history_spread_title: "Una famiglia, innumerevoli varianti",
    mancala_history_spread_p1: "A differenza degli scacchi o del Go, che si sono ciascuno assestati su un unico regolamento globale dominante, i giochi di mancala non hanno mai del tutto convergato: la famiglia è definita più dalla sua meccanica condivisa - seminare semi uno per uno intorno a un tavoliere di buche - che da un singolo insieme fisso di regole.",
    mancala_history_spread_p2: "Questa varietà è parte del motivo per cui i giochi di mancala restano profondamente radicati nella cultura quotidiana di gran parte dell'Africa e dell'Asia, spesso giocati in modo informale nei mercati e nei cortili con nient'altro che un tavoliere graffiato nel terreno e una manciata di semi o sassolini.",
    mancala_history_modern_title: "Kalaha: un regolamento standardizzato",
    mancala_history_modern_p1: "Il regolamento specifico usato da PaperGames - due file di sei buche, un deposito a ciascuna estremità, cattura in una buca vuota, e un turno extra per l'atterraggio nel proprio deposito - è il Kalaha, una variante del mancala che fu registrata come marchio e resa popolare come gioco da tavolo prodotto in serie negli Stati Uniti a metà del Novecento.",
    mancala_history_modern_p2: "Le regole chiare e precisamente definite del Kalaha lo resero fin da subito adatto ai computer, ed è oggi uno dei regolamenti di mancala più comuni nei giochi e nelle app digitali in tutto il mondo, compresa questa."
});
I18n.markTextLoaded("it");
