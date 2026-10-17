// text/it/shogi.js
// Rules and history texts of shogi (it). Loaded by shogi-rules.html and shogi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    shogi_rules_title: "Regole dello Shogi",
    shogi_rules_intro: "Una guida rapida a come PaperGames gioca a Shogi (scacchi giapponesi) - utile se vieni dagli scacchi internazionali, dato che qui diverse idee funzionano in modo diverso.",
    shogi_rules_basics_title: "L'idea di base",
    shogi_term_board: "Il tavoliere e i pezzi",
    shogi_rules_board: "Ogni schieramento ha 20 pezzi su un tavoliere 9x9: un Re, una Torre, un Alfiere, due Generali d'Oro, due Generali d'Argento, due Cavalli, due Lance e nove Pedoni. I pezzi sono semplici pentagoni rivolti verso l'avversario - a quale schieramento appartiene un pezzo lo indica il verso in cui è rivolto, non il suo colore. Il Nero muove sempre per primo.",
    shogi_term_promotion: "Promozione",
    shogi_rules_promotion: "Ogni pezzo tranne il Re e il Generale d'Oro può essere promosso in una forma più forte quando entra, esce o si muove all'interno delle ultime tre traverse del tavoliere. La promozione è facoltativa, tranne quando un Pedone o una Lancia raggiunge l'ultimissima traversa, o un Cavallo raggiunge una delle ultime due - in quel caso è obbligatoria, perché altrimenti il pezzo non avrebbe mai più una mossa legale.",
    shogi_term_drops: "Catture e paracadutaggi",
    shogi_rules_drops: "Catturare un pezzo non lo rimuove dal gioco: cambia schieramento, torna alla sua forma non promossa, ed entra nella mano del giocatore che ha catturato. In un turno successivo, invece di muovere un pezzo già sul tavoliere, quel giocatore può paracadutare un pezzo dalla propria mano su qualsiasi casella vuota - una delle idee distintive dello Shogi, ed il motivo per cui le partite raramente restano a corto di materiale.",
    shogi_term_drop_limits: "Restrizioni sul paracadutaggio",
    shogi_rules_drop_limits: "Un Pedone o una Lancia non possono essere paracadutati sull'ultima traversa, e un Cavallo non può essere paracadutato su nessuna delle ultime due, perché lì non avrebbero mosse legali. Un Pedone non può essere paracadutato su una colonna che ha già un tuo Pedone non promosso, e il paracadutaggio di un Pedone non può mai dare scacco matto direttamente (può comunque dare scacco, solo non matto).",
    shogi_rules_end_title: "Come finisce una partita",
    shogi_term_win: "Vittoria",
    shogi_rules_win: "Un Re sotto scacco che non ha modo di scappare, bloccare o catturare il pezzo che dà scacco è sotto scacco matto - la partita finisce immediatamente.",
    shogi_term_resignation: "Abbandono",
    shogi_rules_resignation: "Un giocatore può abbandonare in qualsiasi momento, terminando immediatamente la partita a favore dell'avversario.",
    shogi_term_sennichite: "Ripetizione (sennichite)",
    shogi_rules_sennichite: "Se la stessa posizione - gli stessi pezzi sulle stesse caselle, gli stessi pezzi in mano a entrambi e lo stesso giocatore al tratto - si presenta quattro volte, la partita è patta. Eccezione: se un giocatore ha dato scacco con ogni sua mossa durante tutta la ripetizione, quel giocatore perde. PaperGames applica questa regola automaticamente.",
    shogi_history_title: "La storia dello Shogi",
    shogi_history_origins_title: "Dall'India, passando per il Sud-est asiatico",
    shogi_history_origins_p1: "Come gli scacchi internazionali e lo Xiangqi, anche lo Shogi discende in ultima analisi dal chaturanga, l'antico gioco di guerra indiano che si diffuse in Asia lungo le rotte commerciali a partire da circa il VI secolo d.C. Raggiunse il Giappone in un periodo precedente al X secolo, molto probabilmente passando per il Sud-est asiatico e la Cina, e venne adattato nei secoli successivi in forme decisamente giapponesi.",
    shogi_history_origins_p2: "Le prime varianti giapponesi degli scacchi erano decisamente più grandi del gioco moderno - alcune forme storiche, come il Dai Shogi e l'enorme Tai Shogi, usavano tavolieri di 15x15 caselle o più con ben oltre cento pezzi per schieramento. La versione a 9x9 caselle e 20 pezzi giocata oggi si affermò come standard verso il XVI secolo.",
    shogi_history_spread_title: "Le origini della regola del paracadutaggio",
    shogi_history_spread_p1: "La caratteristica distintiva dello Shogi - il fatto che un pezzo catturato cambi schieramento e possa essere paracadutato di nuovo sul tavoliere - non ha equivalenti negli scacchi o nello Xiangqi e lo distingue da ogni altro gioco di questa raccolta. Gli storici collegano generalmente la sua nascita alla pratica, comune tra i clan di samurai in guerra in Giappone, di assorbire i soldati catturati direttamente nell'esercito che li aveva catturati invece di trattarli semplicemente come perdite.",
    shogi_history_spread_p2: "Quale che sia la sua origine esatta, la regola del paracadutaggio trasforma il carattere del gioco: il materiale non viene quasi mai rimosso in modo permanente, le partite raramente si bloccano per un semplice scambio di materiale, e un attacco aggressivo può essere alimentato indefinitamente da tutto ciò che l'attaccante ha già catturato.",
    shogi_history_modern_title: "Una tradizione professionistica ancora viva",
    shogi_history_modern_p1: "Lo Shogi sostiene una tradizione ininterrotta di tornei professionistici in Giappone fin dal periodo Edo (XVII-XIX secolo), quando lo shogunato Tokugawa finanziò un sistema ereditario di case di giocatori professionisti - una discendenza che si è evoluta nella moderna Japan Shogi Association, fondata nel 1924.",
    shogi_history_modern_p2: "Lo Shogi giocato dal computer è rimasto a lungo indietro rispetto agli scacchi giocati dal computer a causa dell'enorme fattore di ramificazione introdotto dalla regola del paracadutaggio, ma verso la metà degli anni 2010 programmi come Ponanza avevano sconfitto in modo decisivo i migliori giocatori professionisti, suscitando gli stessi dibattiti sul confronto uomo-computer che gli scacchi avevano già vissuto uno o due decenni prima."
});
I18n.markTextLoaded("it");
