// text/it/pegsolitaire.js
// Rules and history texts of pegsolitaire (it). Loaded by pegsolitaire-rules.html and pegsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    pegsolitaire_rules_title: "Regole del Solitario",
    pegsolitaire_rules_intro: "Una guida rapida a come PaperGames gioca a Solitario - utile se sei arrugginito, o se stai imparando.",
    pegsolitaire_rules_basics_title: "L'idea di base",
    pegsolitaire_term_board: "Il tavoliere e la posizione iniziale",
    pegsolitaire_rules_board: "Prima della partita scegli la tavola; è preimpostata quella inglese (33 fori). Ogni foro inizia occupato da un piolo tranne uno – quale, è indicato per ogni tavola in «Le tavole».",
    pegsolitaire_term_jump: "Saltare",
    pegsolitaire_rules_jump: "Seleziona un piolo, poi scegli un buco vuoto a due posizioni di distanza in linea retta (su, giù, sinistra o destra - mai in diagonale) con un altro piolo posizionato esattamente in mezzo. Il piolo salta nel buco vuoto, e il piolo che ha saltato viene rimosso dal tavoliere. Eccezione: sulla tavola triangolare si può saltare anche in diagonale, lungo le sue linee oblique.",
    pegsolitaire_rules_end_title: "Completare una partita",
    pegsolitaire_term_win: "Risolto",
    pegsolitaire_rules_win: "L'obiettivo classico è saltare fino a restare con un solo piolo. La partita finisce anche, irrisolta, nel momento in cui non resta nessun salto legale, indipendentemente da quanti pioli restano sul tavoliere.",
    pegsolitaire_rules_boards_title: "Le tavole",
    pegsolitaire_rules_boards: "Inglese: una griglia 7x7 senza i quattro angoli 2x2, 33 fori; il centro è vuoto. Europea: una griglia 7x7 a cui si tolgono solo tre fori per angolo, 37 fori; è vuoto il foro subito sopra il centro, perché dal centro non è risolvibile. Tedesca (J. C. Wiegleb, 1779): una griglia 9x9 senza i quattro angoli 3x3, 45 fori; il centro è vuoto. Quadrato: la griglia 6x6 completa, 36 fori; è vuoto quello in alto a sinistra dei quattro fori centrali. Rombo grande: un rombo di 41 fori su una griglia 9x9; è vuoto il foro due file sopra il centro – su questa tavola sono risolvibili solo pochissimi fori di partenza. Triangolo: cinque file da 1 a 5 fori, ogni fila spostata di mezzo foro, 15 fori; è vuoto quello in alto a sinistra dei tre fori centrali. Su tutte le tavole a griglia quadrata si salta solo in orizzontale o in verticale, mai in diagonale. Solo sul triangolo si può saltare anche in diagonale, lungo le sue linee oblique: sei direzioni in tutto.",
    pegsolitaire_history_title: "La storia del Solitario",
    pegsolitaire_history_origins_title: "Un gioco di corte francese",
    pegsolitaire_history_origins_p1: "La prima prova confermata del solitario risale alla Francia di fine Seicento, dove il gioco compare in un'incisione del 1697 ed era abbastanza di moda alla corte di Luigi XIV da essere menzionato negli scritti dell'epoca. Una leggenda popolare ne attribuisce l'invenzione a un nobile francese imprigionato nella Bastiglia - una storia affascinante ma priva di prove a sostegno, quasi certamente inventata molto tempo dopo per dare al gioco un'origine più romantica.",
    pegsolitaire_history_origins_p2: "Il tavoliere che divenne lo standard in Francia ha 37 buchi (aggiungendo altri quattro angoli alla semplice croce), mentre la versione che si diffuse in Inghilterra - la croce a 33 buchi usata qui - divenne lo standard più comune nei paesi anglofoni.",
    pegsolitaire_history_spread_title: "Un tavoliere, molte forme",
    pegsolitaire_history_spread_p1: "Oltre alla classica croce, sono stati costruiti tavolieri da solitario in forma triangolare (con una propria versione a 15 pioli, un elemento fisso dei tavoli dei ristoranti americani per decenni), a forma di rombo e in altre disposizioni - la regola del salto resta identica qualunque sia la forma in cui sono disposti i buchi.",
    pegsolitaire_history_wiegleb: "Una croce più grande, con 45 fori su una griglia 9x9, fu descritta da J. C. Wiegleb nel 1779 nel suo libro «Unterricht in der natürlichen Magie» (Lezioni di magia naturale).",
    pegsolitaire_history_spread_p2: "Poiché ogni mossa rimuove esattamente un piolo, una partita completa da n pioli a 1 richiede sempre esattamente n-1 salti - uno dei pochi giochi da tavolo in cui il numero di mosse di una partita vinta è fissato in anticipo, indipendentemente da quale particolare sequenza di salti ci arrivi.",
    pegsolitaire_history_modern_title: "Un rompicapo risolto, con un colpo di scena",
    pegsolitaire_history_modern_p1: "Il solitario attirò una seria attenzione matematica negli anni '60 e '70, quando ricercatori tra cui John Conway lo analizzarono usando strumenti come i conteggi di risorse (le cosiddette funzioni pagoda) e argomenti algebrici per stabilire esattamente quali posizioni finali a un solo piolo sono raggiungibili dalla posizione di partenza standard - il centro è una di queste, ma non l'unica.",
    pegsolitaire_history_modern_p2: "Una successiva ricerca computerizzata risolse completamente la questione per il tavoliere a 33 buchi: una partita che inizia con il centro vuoto può essere portata a termine fino a un solo piolo, e il numero esatto di partite vincenti è stato calcolato - un raro caso di un rompicapo fisico trasformato in un problema combinatorio completamente risolto."
});
I18n.markTextLoaded("it");
