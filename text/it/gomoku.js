// text/it/gomoku.js
// Rules and history texts of gomoku (it). Loaded by gomoku-rules.html and gomoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    gomoku_rules_title: "Regole del Gomoku",
    gomoku_rules_intro: "Una guida rapida a come PaperGames gioca a Gomoku (Cinque in fila) - utile se sei arrugginito, o se stai imparando.",
    gomoku_rules_basics_title: "L'idea di base",
    gomoku_term_board: "Il tavoliere e il piazzamento delle pietre",
    gomoku_rules_board: "Le pietre vengono piazzate sulle intersezioni di una griglia 15x15, esattamente come nel Go - non vengono mai spostate una volta piazzate, e non vengono mai catturate. Il Nero muove sempre per primo.",
    gomoku_rules_end_title: "Come finisce una partita",
    gomoku_term_win: "Vittoria",
    gomoku_rules_win: "Vince immediatamente il primo giocatore che allinea cinque o più delle proprie pietre in una linea ininterrotta - orizzontale, verticale o diagonale.",
    gomoku_term_draw: "Patta",
    gomoku_rules_draw: "Se il tavoliere si riempie completamente senza che nessuno dei due giocatori abbia allineato cinque pietre, la partita è patta.",
    gomoku_term_resignation: "Abbandono",
    gomoku_rules_resignation: "Un giocatore può abbandonare in qualsiasi momento, terminando immediatamente la partita a favore dell'avversario.",
    gomoku_history_title: "La storia del Gomoku",
    gomoku_history_origins_title: "Radici antiche, nome moderno",
    gomoku_history_origins_p1: "Giochi costruiti intorno all'allineamento di pietre su una griglia risalgono a secoli fa in tutta l'Asia orientale; le regole specifiche oggi note come Gomoku presero forma in Giappone, dove il suo nome (五目並べ, gomokunarabe) significa semplicemente \"cinque punti in fila\".",
    gomoku_history_origins_p2: "Si gioca tradizionalmente con le stesse pietre bianche e nere e lo stesso tavoliere a intersezioni del Go, il che ne fa una variante facile e a basso costo di materiale che generazioni di giocatori di Go hanno adottato come gioco veloce collaterale.",
    gomoku_history_spread_title: "Da passatempo informale a Renju",
    gomoku_history_spread_p1: "Poiché le regole semplici del Gomoku danno al primo giocatore (tradizionalmente il Nero) un vantaggio intrinseco significativo, in Giappone all'inizio del Novecento emerse una variante competitiva più rigida chiamata Renju, che aggiungeva restrizioni extra - vietando al Nero certe configurazioni a doppio-tre o doppio-quattro - per riequilibrare il gioco.",
    gomoku_history_spread_p2: "Il Renju divenne lo standard per il gioco serio nei tornei, mentre il regolamento più semplice e senza restrizioni giocato qui (spesso chiamato Gomoku \"freestyle\") è rimasto la versione informale più comune nel mondo.",
    gomoku_history_modern_title: "Una vittoria del primo giocatore risolta",
    gomoku_history_modern_p1: "Nel 1994, il ricercatore L. Victor Allis dimostrò attraverso un'analisi computerizzata esaustiva (una tecnica chiamata ricerca a numero di prova) che il Gomoku freestyle su un tavoliere standard è una vittoria forzata per il primo giocatore con gioco perfetto.",
    gomoku_history_modern_p2: "Questo risultato è esattamente il motivo per cui esiste il Renju competitivo: senza le sue restrizioni extra sul Nero, il Gomoku nei tornei sarebbe una formalità già risolta invece di una vera sfida - un caso raro in cui un gioco risolto ha rimodellato direttamente il modo in cui viene giocato a livello competitivo, invece di restare solo una curiosità interessante."
});
I18n.markTextLoaded("it");
