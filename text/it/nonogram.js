// text/it/nonogram.js
// Rules and history texts of nonogram (it). Loaded by nonogram-rules.html and nonogram-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    nonogram_rules_title: "Regole dei Nonogrammi",
    nonogram_rules_intro: "Una guida rapida a come PaperGames gioca ai Nonogrammi (chiamati anche Griddlers) - utile se sei arrugginito, o se stai imparando.",
    nonogram_rules_basics_title: "L'idea di base",
    nonogram_term_clues: "Leggere gli indizi",
    nonogram_rules_clues: "Ogni riga e colonna ha un indizio: una sequenza di numeri che indica la lunghezza di ogni blocco consecutivo di celle piene in quella linea, in ordine, separati da almeno una cella vuota. Un indizio \"3 1\" significa una sequenza di tre celle piene, poi uno spazio, poi un'altra cella piena, da qualche parte in quella linea.",
    nonogram_term_filling: "Riempire e segnare",
    nonogram_rules_filling: "Usa la modalità Riempi per colorare una cella che sei sicuro faccia parte del disegno, e la modalità Segna X per barrare una cella che sei sicuro sia vuota - segnare è puramente un aiuto per la memoria e non ha effetto sulla vittoria, ma aiuta a escludere possibilità mentre risolvi gli indizi.",
    nonogram_rules_end_title: "Completare uno schema",
    nonogram_term_win: "Risolto",
    nonogram_rules_win: "Lo schema è risolto nell'istante in cui le tue celle piene corrispondono esattamente al disegno nascosto - le celle segnate non devono essere per forza corrette, contano solo quelle piene.",
    nonogram_history_title: "La storia dei Nonogrammi",
    nonogram_history_origins_title: "Due inventori, due continenti",
    nonogram_history_origins_p1: "Il rompicapo risale a due invenzioni indipendenti a metà degli anni '80: Non Ishida, una grafica editoriale giapponese, creò intorno al 1985 rompicapi a griglia che rivelavano immagini attraverso una logica basata su indizi, mentre quasi nello stesso periodo il designer di rompicapi britannico James Dalgety inventò un concetto simile e coniò il nome 'Griddlers'.",
    nonogram_history_origins_p2: "I rompicapi di Ishida vennero pubblicati in una rivista giapponese di enigmistica e presero rapidamente piede; il nome stesso 'Nonogram' è generalmente inteso come una fusione tra 'Non' (il suo nome di battesimo) e '-gram', anche se il rompicapo è conosciuto con diversi altri nomi in vari paesi, tra cui Griddlers, Picross e Hanjie.",
    nonogram_history_spread_title: "Dalle riviste al Game Boy",
    nonogram_history_spread_p1: "Nintendo rese popolare il rompicapo in tutto il mondo con il nome 'Picross' (una fusione di 'picture' e 'crossword'), pubblicando giochi Picross per Game Boy e Super Famicom a partire dal 1995 - per molti giocatori fuori dal Giappone, quella serie portatile fu il loro primo incontro con questo formato.",
    nonogram_history_spread_p2: "Il fascino del rompicapo si rivelò capace di viaggiare ben oltre i videogiochi dedicati: le pagine di enigmistica dei giornali lo adottarono insieme al Sudoku durante il boom dei rompicapi degli anni 2000, di solito con il nome Griddlers o Hanjie, e resta ancora oggi un classico di libri di enigmistica e app.",
    nonogram_history_modern_title: "Un rompicapo che (di solito) non richiede di indovinare",
    nonogram_history_modern_p1: "Un Nonogramma ben costruito è pensato per essere risolvibile con la sola deduzione logica pura, riga per riga, senza mai dover indovinare - che è esattamente la proprietà verificata negli schemi di PaperGames prima di essere inclusi, usando un risolutore a propagazione di vincoli che conferma che gli indizi di ogni immagine ammettono una e una sola griglia valida.",
    nonogram_history_modern_p2: "Questo però non vale per ogni possibile insieme di indizi: come per Campo Minato, è stato dimostrato che risolvere i Nonogrammi in generale è NP-completo, il che significa che uno schema abbastanza grande o deliberatamente avverso può richiedere un vero e proprio tentativo per tentativi per essere risolto - gli schemi ben progettati per i risolutori umani sono costruiti apposta per evitarlo, il che è di per sé una piccola forma d'arte."
});
I18n.markTextLoaded("it");
