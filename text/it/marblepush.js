// text/it/marblepush.js
// Rules and history texts of marblepush (it). Loaded by marblepush-rules.html and marblepush-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    marblepush_rules_title: "Regole di Spingi biglie",
    marblepush_rules_intro: "Una guida rapida a come PaperGames gioca a Spingi biglie - utile se sei arrugginito, o se stai imparando.",
    marblepush_rules_basics_title: "L'idea di base",
    marblepush_term_board: "Il tabellone",
    marblepush_rules_board: "Un esagono di 61 caselle, disposte in file di 5, 6, 7, 8, 9, 8, 7, 6, 5. Ogni giocatore inizia con 14 biglie: le sue due file più vicine completamente piene, più le 3 caselle centrali della fila successiva. Il Nero muove per primo.",
    marblepush_term_move: "Muovere una singola biglia",
    marblepush_rules_single: "Seleziona una biglia e spostala su una qualsiasi casella vuota adiacente.",
    marblepush_term_line: "Muovere una fila",
    marblepush_rules_line: "Seleziona 2 o 3 tue biglie disposte in una fila dritta e ininterrotta, quindi sposta l'intera fila di un passo in una delle 6 direzioni del tabellone. Esistono due tipi di mosse in fila, descritti di seguito.",
    marblepush_term_sidestep: "Mossa laterale",
    marblepush_rules_sidestep: "La fila si sposta lateralmente, fuori dal proprio asse. Ogni casella in cui si sposta la fila deve essere vuota - una mossa laterale non può mai spingere nulla.",
    marblepush_term_linestep: "Mossa in linea",
    marblepush_rules_linestep: "La fila si muove lungo il proprio asse, nella direzione verso cui punta una delle sue due estremità. Se la casella immediatamente davanti è vuota, l'intera fila scivola semplicemente in avanti.",
    marblepush_term_pushing: "La spinta",
    marblepush_rules_pushing: "Se la casella immediatamente davanti a una mossa in linea contiene biglie nemiche, puoi spingerle - ma solo se la tua fila è strettamente più lunga della fila nemica contigua che la blocca (3 biglie possono spingerne 1 o 2, 2 biglie possono spingerne 1; 1 biglia non può mai spingere). Deve inoltre esserci spazio per spingere: una casella vuota subito dopo la fila nemica, oppure il bordo del tabellone. Se la fila nemica arriva oltre il bordo del tabellone, la sua ultima biglia viene eliminata - è così che si segna un punto.",
    marblepush_rules_example_title: "Esempio pratico: 3 biglie ne spingono 1",
    marblepush_rules_example_intro: "Nel piccolo diagramma qui sotto, ● è il Nero e ○ è il Bianco. Il Nero ha 3 biglie in fila (A, B, C) di fronte a una singola biglia bianca (D), con una casella vuota (E) - o il bordo del tabellone - subito dopo.",
    marblepush_rules_example_caption: "La fila di 3 biglie nere (A, B, C) supera numericamente la singola biglia bianca (D), e la casella E è vuota - quindi il Nero può spingere: l'intera fila avanza di un passo, D viene spinta in E, e la fila nera finisce per occupare B, C e la vecchia casella di D. Se E fosse stato invece il bordo del tabellone, D sarebbe stata eliminata del tutto.",
    marblepush_rules_end_title: "Come finisce una partita",
    marblepush_term_win: "Vittoria",
    marblepush_rules_win: "Vince il primo giocatore che riesce a spingere fuori dal tabellone 6 biglie dell'avversario.",
    marblepush_term_resignation: "Abbandono",
    marblepush_rules_resignation: "Un giocatore può abbandonare in qualsiasi momento, terminando immediatamente la partita a favore dell'avversario.",
    marblepush_history_title: "La storia di Spingi biglie",
    marblepush_history_origins_title: "Giochi di spinta su tabelloni esagonali",
    marblepush_history_origins_p1: "I giochi in cui i pezzi vengono spinti invece che scavalcati o catturati sul posto hanno una lunga tradizione, e così i tabelloni esagonali: ogni casella ha sei vicine invece di quattro, il che dà a ogni pezzo più direzioni ed evita le scomode diagonali di una griglia quadrata.",
    marblepush_history_origins_p2: "Spingi biglie appartiene a questa famiglia. Le biglie sono semplici e tutte uguali, e l'intero gioco si basa su un'unica idea: una fila di biglie più lunga può spingerne una più corta.",
    marblepush_history_award_title: "Una regola, molta profondità",
    marblepush_history_award_p1: "Poiché una biglia si perde solo se una fila strettamente più lunga la spinge fuori dal tabellone, niente conta più che tenere le biglie unite in gruppi compatti. Una biglia isolata non può mai spingere, e un gruppo vicino al bordo è sempre in pericolo.",
    marblepush_history_award_p2: "Così ogni partita diventa una lenta lotta per il centro: chi tiene il mezzo può spingere verso l'esterno in ogni direzione, mentre l'altro viene schiacciato verso il bordo.",
    marblepush_history_legacy_title: "Un gioco senza fortuna",
    marblepush_history_legacy_p1: "Non ci sono dadi, informazioni nascoste o pezzi speciali - solo due serie di biglie identiche e poche regole semplici su quale fila può spingere quale. È quindi una pura prova di pianificazione, nello spirito di classici più antichi come il go e la dama."
});
I18n.markTextLoaded("it");
