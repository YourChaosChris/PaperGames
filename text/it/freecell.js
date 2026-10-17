// text/it/freecell.js
// Rules and history texts of freecell (it). Loaded by freecell-rules.html and freecell-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    freecell_rules_title: "Regole di FreeCell",
    freecell_rules_intro: "Una guida rapida a come PaperGames gioca a FreeCell - utile se sei arrugginito, o se stai imparando.",
    freecell_rules_basics_title: "L'idea di base",
    freecell_term_layout: "La disposizione",
    freecell_rules_layout: "Tutte le 52 carte vengono distribuite scoperte in 8 colonne di tableau fin dall'inizio - quattro carte in meno di un pieno 7 nelle ultime quattro colonne. Quattro celle libere sopra le colonne possono contenere ciascuna esattamente una carta, e quattro fondazioni (una per seme) vengono costruite dall'Asso al Re.",
    freecell_term_tableau: "Muovere le carte",
    freecell_rules_tableau: "Una carta può essere spostata su una colonna del tableau solo sopra una carta esattamente di un valore superiore e di colore opposto, oppure su una colonna vuota qualsiasi. Una sequenza di più carte già impilate in quello stesso ordine decrescente e alternato può essere spostata insieme come un'unica 'supermossa', fino a un limite determinato da quante celle libere e colonne vuote sono disponibili per farle transitare.",
    freecell_term_foundation: "Fondazioni",
    freecell_rules_foundation: "Una fondazione accetta solo il proprio seme, iniziando dall'Asso e salendo di un valore alla volta. Una volta che una carta è su una fondazione ci resta - le fondazioni ricevono solo carte, non le restituiscono mai al tableau.",
    freecell_rules_end_title: "Completare una partita",
    freecell_term_win: "Vittoria",
    freecell_rules_win: "La partita è vinta nel momento in cui tutte e quattro le fondazioni sono complete, dall'Asso al Re. A differenza della distribuzione del Mahjong Solitario qui presente, una distribuzione di FreeCell è semplicemente un mescolamento casuale - la stragrande maggioranza sono risolvibili, esattamente come nel gioco reale, ma PaperGames non offre alcuna garanzia speciale per una singola distribuzione.",
    freecell_history_title: "La storia di FreeCell",
    freecell_history_origins_title: "Un gioco di carte a informazione aperta",
    freecell_history_origins_p1: "FreeCell discende da una famiglia di solitari in stile \"aperto\" o \"Baker's Game\" risalenti almeno all'inizio del Novecento, in cui ogni carta viene distribuita scoperta fin dalla primissima mossa - a differenza della maggior parte dei solitari, non c'è mai nulla di nascosto, quindi un giocatore (o un computer) abbastanza abile può in linea di principio stabilire se una data distribuzione sia vincibile prima ancora di fare una sola mossa.",
    freecell_history_origins_p2: "L'aggiunta delle celle libere - piccole aree di sosta per parcheggiare temporaneamente singole carte - è generalmente attribuita a Paul Alfille, che creò una delle prime versioni digitali chiamata FreeCell per il sistema informatico PLATO nel 1978, perfezionando il più vecchio formato a tableau aperto nel regolamento specifico giocato oggi.",
    freecell_history_spread_title: "Incluso con Windows",
    freecell_history_spread_p1: "FreeCell divenne un nome familiare dopo che Microsoft lo incluse con Windows a partire dal 1995, insieme a Solitario e Campo Minato, facendolo conoscere a centinaia di milioni di utenti PC che non l'avevano mai incontrato prima - proprio come il percorso verso la fama dello stesso Campo Minato.",
    freecell_history_spread_p2: "La versione di Microsoft veniva distribuita con un insieme fisso di 32.000 distribuzioni numerate invece di un nuovo mescolamento casuale ogni volta, il che permetteva ai giocatori di confrontare le proprie esperienze e rigiocare una distribuzione specifica - una convenzione che questa versione di PaperGames non segue, generando invece un mescolamento genuinamente nuovo ogni volta.",
    freecell_history_modern_title: "La distribuzione che vince (quasi) sempre",
    freecell_history_modern_p1: "Poiché ogni carta è visibile fin dall'inizio, FreeCell si presta insolitamente bene all'analisi computerizzata: delle 32.000 distribuzioni numerate originali di Microsoft, ricerche esaustive con solutori hanno scoperto che tutte tranne una - la distribuzione numero 11.982 - sono risolvibili, una curiosità che gli appassionati di FreeCell ancora citano decenni dopo.",
    freecell_history_modern_p2: "Ricerche successive hanno spinto l'analisi oltre, confermando che solo una manciata di distribuzioni tra il primo milione di partite numerate sono irrisolvibili - motivo per cui un semplice mescolamento casuale, come quello usato in questa versione, è una scommessa così sicura: le probabilità di capitare su una di quelle rare eccezioni sono infinitesime."
});
I18n.markTextLoaded("it");
