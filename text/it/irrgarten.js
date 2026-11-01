// text/it/irrgarten.js
// Rules and history texts of irrgarten (it). Loaded by irrgarten-rules.html and irrgarten-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    ig_rules_title: "Regole del labirinto",
    ig_rules_intro: "Un labirinto quadrato di caselle e muri. Trova la strada dalla partenza al traguardo.",
    ig_rules_basics_title: "Le regole",
    ig_term_move: "Camminare",
    ig_rules_move: "Parti dalla casella con il cerchio in alto a sinistra; il traguardo è la bandiera in basso a destra. Tocca una casella vicina per entrarci, oppure una più avanti in un corridoio diritto e libero per raggiungerla subito. Il percorso appare come una linea spessa.",
    ig_term_draw: "Tracciare con un dito",
    ig_rules_draw: "Nelle impostazioni puoi scegliere «Tracciare con un dito»: muovi il dito nei corridoi e il cerchio segue, casella per casella. Anche i tocchi funzionano.",
    ig_term_walls: "Muri e ritorno",
    ig_rules_walls: "Non si possono attraversare i muri; un breve avviso te lo dice. Tornando nella casella da cui sei arrivato, questa viene tolta dal percorso. Tocca una casella del percorso per tornare lì.",
    ig_term_goal: "Il traguardo",
    ig_rules_goal: "Quando raggiungi la bandiera, il labirinto è risolto. Ogni labirinto ha un solo percorso dalla partenza al traguardo.",
    ig_term_levels: "Livelli",
    ig_rules_levels: "Facile (per bambini): 6 x 6 caselle con corridoi larghi. Medio: 10 x 10. Difficile: 15 x 15. Molto difficile: 20 x 20. Ogni livello ha cinque labirinti, uno dopo l’altro. Il programma crea ciascuno partendo da un numero fisso, quindi è sempre uguale.",
    ig_term_help: "Indietro e suggerimento",
    ig_rules_help: "«Indietro» torna indietro di una casella. «Suggerimento» cerchia con anelli tratteggiati le tre caselle successive del percorso giusto, anche da un vicolo cieco.",
    ig_history_title: "La storia dei labirinti",
    ig_history_old_title: "Schemi antichissimi",
    ig_history_old_p1: "In molte culture antiche si trovano su pietre, monete e pavimenti schemi tortuosi che portano al centro. Molti hanno un solo percorso senza bivi; l’idea degli enigmi con vicoli ciechi è arrivata dopo.",
    ig_history_puzzle_title: "Siepi e libri di enigmi",
    ig_history_puzzle_p1: "Dal XVI secolo si piantavano nei giardini labirinti di siepi in cui i visitatori potevano perdersi. Nei secoli XIX e XX i labirinti di carta divennero comuni nelle riviste per bambini e nei libri di enigmi. I matematici li descrivono come grafi e i programmi possono crearne senza fine.",
    ig_history_here_title: "Questa versione",
    ig_history_here_p1: "Qui ogni labirinto è creato dal programma: percorre la griglia e abbatte muri finché ogni casella è raggiungibile. Nessun labirinto è copiato da un libro."
});
I18n.markTextLoaded("it");
