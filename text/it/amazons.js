// text/it/amazons.js
// Rules and history texts of amazons (it). Loaded by amazons-rules.html and amazons-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    amazons_rules_title: "Regole delle Amazzoni",
    amazons_rules_intro: "Un rapido riferimento su come PaperGames gioca al Gioco delle Amazzoni - utile se sei arrugginito o lo stai imparando.",
    amazons_rules_basics_title: "L'idea di base",
    amazons_term_setup: "L'allestimento",
    amazons_rules_setup: "Ogni giocatore ha quattro amazzoni su un tavoliere 10x10, disposte nella posizione di partenza simmetrica standard. In questo gioco non esistono catture di alcun tipo - si vince soltanto tramite il movimento e il controllo del territorio.",
    amazons_term_moving: "Muovere un'amazzone",
    amazons_rules_moving: "Al tuo turno, muovi una delle tue amazzoni per un numero qualsiasi di caselle vuote in linea retta - orizzontale, verticale o diagonale - esattamente come una donna degli scacchi. Non può mai saltare sopra un'altra amazzone o una casella bruciata.",
    amazons_term_shooting: "Scoccare una freccia",
    amazons_rules_shooting: "Subito dopo essersi mossa, quella stessa amazzone deve scoccare una freccia dalla sua nuova casella: un altro spostamento in stile donna, in una qualsiasi delle 8 direzioni, solo attraverso caselle vuote, atterrando su una casella vuota.",
    amazons_term_burned: "Caselle bruciate",
    amazons_rules_burned: "Ovunque atterri una freccia, quella casella resta bruciata per il resto della partita - terreno permanentemente invalicabile che nessuna amazzone e nessuna freccia futura potrà mai più attraversare o su cui potrà atterrare.",
    amazons_rules_end_title: "Vincere la partita",
    amazons_term_win: "Come finisce la partita",
    amazons_rules_win: "Se è il tuo turno e nessuna delle tue amazzoni ha più una sola mossa legale - bloccate in ogni direzione da altre amazzoni, caselle bruciate o il bordo del tavoliere - perdi. Vince l'ultimo giocatore ancora in grado di muoversi.",
    amazons_history_title: "La Storia del Gioco delle Amazzoni",
    amazons_history_origins_title: "Inventato nel 1988",
    amazons_history_origins_p1: "Il Gioco delle Amazzoni fu inventato nel 1988 dal game designer argentino Walter Zamkauskas e pubblicato per la prima volta sulla rivista argentina di enigmistica El Acertijo (pubblicata in spagnolo).",
    amazons_history_origins_p2: "I suoi pezzi che si muovono come donne ricordano gli scacchi, ma il tiro con l'arco che conclude ogni turno - bruciando permanentemente una casella dopo ogni mossa - è un'idea del tutto originale, che trasforma il gioco da una corsa in un lento soffocamento dello spazio disponibile dell'avversario.",
    amazons_history_design_title: "Un favorito della teoria dei giochi combinatoria",
    amazons_history_design_p1: "Le Amazzoni non prevedono patte né catture, e hanno un albero di gioco davvero enorme - secondo alcune stime più grande di quello del Go - il che ne ha fatto un soggetto naturale per i ricercatori di teoria dei giochi combinatoria, e un appuntamento fisso nelle competizioni e olimpiadi di giochi per computer sin dalla fine degli anni '90.",
    amazons_history_design_p2: "Far giocare bene un computer si è rivelata una sfida seria a sé stante: con decine di mosse di pezzo legali e, per ciascuna, decine di tiri di freccia legali, un solo turno può avere ben oltre mille mosse legali - molte più che negli scacchi - il che ha spinto i programmi per le Amazzoni verso un ordinamento delle mosse molto curato e un'analisi del territorio di fine partita, piuttosto che la sola ricerca a forza bruta.",
    amazons_history_version_title: "Questa versione",
    amazons_history_version_p1: "PaperGames gioca con le regole standard sul tavoliere standard 10x10 con quattro amazzoni per lato. Ogni turno è una semplice sequenza di tre tocchi: tocca un'amazzone, tocca la sua destinazione, poi tocca il punto da cui scocca la freccia."
});
I18n.markTextLoaded("it");
