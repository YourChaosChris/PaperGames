// text/it/durak.js
// Rules and history texts of durak (it). Loaded by durak-rules.html and durak-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    sudoku_rules_basics_title: "L'idea di base",
    durak_rules_title: "Regole del Durak",
    durak_rules_intro: "Come si gioca a Durak su PaperGames, nella forma comune in cui i giocatori possono aggiungere altre carte.",
    durak_term_setup: "Carte e briscola",
    durak_rules_setup: "Un mazzo di 36 carte (dal Sei all'Asso in quattro semi), da 2 a 4 giocatori, sei carte ciascuno. La carta successiva viene messa scoperta sotto il mazzo: il suo seme è la briscola per tutta la partita, ed è l'ultima carta a essere pescata. Il seme di briscola è sempre indicato in cima al tavolo.",
    durak_term_attack: "Attacco e difesa",
    durak_rules_attack: "Attacca per primo chi ha la briscola più bassa. L'attaccante mette una carta scoperta; il giocatore successivo difende e deve batterla con una carta più alta dello stesso seme, oppure con una briscola qualsiasi se la carta d'attacco non è una briscola. Una briscola si batte solo con una briscola più alta.",
    durak_term_throw: "Aggiungere carte",
    durak_rules_throw: "Dopo la prima carta, l'attaccante e poi gli altri giocatori possono aggiungere altre carte, ma solo di valori già presenti sul tavolo, come carte d'attacco o di difesa. Chi difende deve batterle tutte. In un giro non ci sono mai più di sei carte d'attacco, e mai più di quante ne avesse chi difende all'inizio del giro.",
    durak_term_take: "Prendere le carte",
    durak_rules_take: "Se chi difende non può o non vuole battere una carta, prende in mano tutte le carte sul tavolo; prima gli altri possono ancora aggiungere carte adatte. Poi attacca il giocatore dopo chi ha difeso, che viene saltato. Se chi difende batte tutto, le carte escono dal gioco e chi ha difeso attacca per primo.",
    durak_term_draw: "Pescare",
    durak_rules_draw: "Dopo ogni giro tutti tornano a sei carte pescando dal mazzo: prima l'attaccante, poi gli altri in ordine, per ultimo chi ha difeso.",
    durak_term_end: "La fine",
    durak_rules_end: "Quando il mazzo è finito non si pesca più, e chi resta senza carte è fuori. L'ultimo giocatore con carte in mano è il durak, lo sciocco, e perde. Se gli ultimi giocatori finiscono le carte insieme, la partita è patta.",
    durak_term_transfer: "Facoltativo: passare l'attacco",
    durak_rules_transfer: "Questa regola è disattivata a meno che tu non la attivi prima della partita. Prima di battere qualsiasi carta, chi difende può mettere una carta dello stesso valore delle carte d'attacco e passare così l'intero attacco al giocatore successivo, che deve poi difendersi da tutte. Il giocatore successivo deve avere abbastanza carte per farlo.",
    durak_history_title: "La storia del Durak",
    durak_history_origins_title: "Un gioco popolare russo",
    durak_history_origins_p1: "Si ritiene che il Durak si sia diffuso tra la gente comune in Russia nel XIX secolo, giocato con il mazzo da 36 carte lì in uso. Nel XX secolo è diventato uno dei giochi di carte più diffusi in tutta l'Unione Sovietica e nei paesi vicini, insegnato in casa, sui treni e nell'esercito.",
    durak_history_origins_p2: "A differenza della maggior parte dei giochi di carte non ha un vincitore, solo un perdente: \"durak\" significa \"sciocco\", e l'ultimo giocatore con carte in mano viene chiamato così fino all'inizio della partita successiva.",
    durak_history_names_title: "Molti modi di giocare",
    durak_history_names_p1: "La forma giocata qui, in cui si possono aggiungere altre carte, è nota come podkidnoy durak. In un'altra forma popolare, il perevodnoy durak, chi difende può passare l'attacco con una carta dello stesso valore: PaperGames la offre come opzione.",
    durak_history_names_p2: "Oltre a queste esistono innumerevoli regole della casa, per esempio su quante carte si possono aggiungere nel primo giro. Nelle famiglie se ne discute spesso, e anche questo fa parte del fascino del gioco."
});
I18n.markTextLoaded("it");
