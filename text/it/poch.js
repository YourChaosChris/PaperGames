// text/it/poch.js
// Rules and history texts of poch (it). Loaded by poch-rules.html and poch-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    poch_rules_title: "Regole del Poch",
    poch_rules_intro: "Il Poch è un vecchio gioco di carte con 32 carte e gettoni. Ogni mano ha tre fasi: per certe carte si pagano le buche, i giocatori puntano sul loro miglior gruppo di carte uguali e infine tutti giocano le carte in sequenze. Dopo sei mani vince chi ha più gettoni.",
    poch_rules_basics_title: "Le regole",
    poch_term_pools: "Le buche",
    poch_rules_pools: "La tavola ha nove buche: asso, re, regina, fante, dieci, matrimonio (re e regina), sequenza (7, 8 e 9), Poch e il piatto centrale. Prima di ogni mano ogni giocatore mette un gettone in ogni buca, cioè 9 gettoni. Si distribuiscono tutte le carte tranne una, scoperta: il suo seme è il seme di pagamento.",
    poch_term_first: "Fase 1: pagamenti",
    poch_rules_first: "Chi ha l’asso, il re, la regina, il fante o il dieci del seme di pagamento prende i gettoni di quella buca. Re e regina del seme di pagamento insieme vincono anche la buca del matrimonio, e 7, 8 e 9 insieme la buca della sequenza. Una buca che nessuno vince, perché nessuno ha la carta o perché è scoperta, resta per la mano successiva e cresce.",
    poch_term_pochen: "Fase 2: pochare",
    poch_rules_pochen: "Partecipano solo i giocatori con due, tre o quattro carte dello stesso valore, con il loro miglior gruppo. Il primo giocatore a sinistra del mazziere passa o punta 1; poi si vede, si rilancia di 1 (fino a 4 in tutto) o si lascia. Chi non può pagare per vedere può solo lasciare. Un poker batte un tris, un tris batte una coppia; un valore più alto batte uno più basso; la stessa coppia con una carta del seme di pagamento batte quella senza. Il miglior gruppo vince la buca di Poch e tutte le puntate. Se tutti passano, la buca di Poch resta; un solo giocatore con un gruppo la prende subito.",
    poch_term_play: "Fase 3: gioco delle carte",
    poch_rules_play: "Il vincitore del Poch (o il giocatore a sinistra del mazziere) apre con una carta qualsiasi. La carta successiva dello stesso seme deve essere giocata da chi la ha, poi la successiva, fino all’asso. Quando manca la carta successiva – già giocata o scoperta –, apre di nuovo chi ha giocato per ultimo. Chi gioca per primo l’ultima carta vince il piatto centrale e da ogni altro giocatore un gettone per ogni carta che ha ancora.",
    poch_term_end: "La fine della partita",
    poch_rules_end: "Una partita ha sei mani; finisce prima se qualcuno non può pagare i 9 gettoni di una mano. Vince chi ha più gettoni. I gettoni sono solo punti nel gioco; non c’è denaro in gioco.",
    poch_term_computer: "Il computer",
    poch_rules_computer: "Facile per lo più passa e gioca una carta qualsiasi. Medio rilancia con tris, poker o una coppia alta e apre con una carta che nessuno può seguire. Difficile conta anche i giocatori ancora in puntata e pianifica le sequenze con le proprie carte. Il tasto Suggerimento propone ciò che farebbe Difficile.",
    poch_history_title: "La storia del Poch",
    poch_history_origins_title: "Un gioco antichissimo",
    poch_history_origins_p1: "Il Poch ha almeno cinquecento anni ed è attestato per la prima volta nel XV secolo. In Germania si chiamava Pochen o Pochspiel e in Francia La Poque, e si giocava con una tavola speciale per i gettoni. Il Poch è considerato tra i precursori del poker, e giochi simili con una tavola per i gettoni si giocano ancora in molti paesi.",
    poch_history_here_title: "Il Poch qui",
    poch_history_here_p1: "PaperGames trasforma il Poch in un gioco per una persona contro da uno a tre computer. Ha una propria tavola con nove buche e una formulazione propria, dura sei mani e non richiede denaro, e i computer aspettano tra una mossa e l’altra."
});
I18n.markTextLoaded("it");
