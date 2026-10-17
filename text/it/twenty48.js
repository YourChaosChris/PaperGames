// text/it/twenty48.js
// Rules and history texts of twenty48 (it). Loaded by twenty48-rules.html and twenty48-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    twenty48_rules_title: "Regole di 2048",
    twenty48_rules_intro: "Una guida rapida a come PaperGames gioca a 2048 - utile se sei arrugginito, o se stai imparando.",
    twenty48_rules_basics_title: "L'idea di base",
    twenty48_term_board: "Il tavoliere e lo scorrimento",
    twenty48_rules_board: "Ogni mossa fa scorrere tutte le tessere sul tavoliere 4x4 il più lontano possibile in una direzione - su, giù, sinistra o destra. Dopo ogni mossa che sposta effettivamente qualcosa, una nuova tessera (di solito un 2, occasionalmente un 4) appare in una cella vuota casuale.",
    twenty48_term_merging: "Fusione",
    twenty48_rules_merging: "Quando due tessere dello stesso valore si scontrano mentre scorrono, si fondono in un'unica tessera pari alla loro somma, aggiungendo quel nuovo valore al tuo punteggio. Ogni tessera può fondersi una sola volta per mossa, quindi tre tessere uguali che scorrono insieme fondono la coppia in testa e lasciano la terza da sola invece di fondersi a cascata.",
    twenty48_rules_end_title: "Come finisce una partita",
    twenty48_term_win: "Raggiungere 2048",
    twenty48_rules_win: "Fondi le tessere fino a ottenere una tessera 2048 e avrai vinto - ma la partita non si ferma lì. Continua a giocare per spingere ancora oltre il tuo punteggio (e il tavoliere).",
    twenty48_term_loss: "Finire le mosse",
    twenty48_rules_loss: "La partita finisce nel momento in cui il tavoliere è completamente pieno e nessuna coppia di tessere adiacenti condivide lo stesso valore, quindi nessuna mossa - in nessuna direzione - potrebbe cambiare nulla.",
    twenty48_history_title: "La storia di 2048",
    twenty48_history_origins_title: "Costruito sopra Threes",
    twenty48_history_origins_p1: "2048 fu creato nel marzo 2014 dallo sviluppatore italiano diciannovenne Gabriele Cirulli in un solo weekend, come esercizio personale per imparare a costruire rapidamente un gioco completo. Non inventò la meccanica di base da zero: 2048 è un clone dichiarato di un gioco chiamato 1024 (di Veewo Studio), a sua volta ispirato da un gioco precedente chiamato Threes! (di Asher Vollmer, Greg Wohlwend e Jimmy Hinson), che era stato in sviluppo accurato per oltre un anno.",
    twenty48_history_origins_p2: "Cirulli rilasciò gratuitamente il codice sorgente di 2048 sotto una licenza aperta fin dal primo giorno, il che si rivelò importantissimo: invece di bloccare i cloni, li invitava, e il gioco si diffuse venendo reimplementato all'infinito e legalmente, più che semplicemente giocato.",
    twenty48_history_spread_title: "Un fenomeno virale e clonato",
    twenty48_history_spread_p1: "Il gioco divenne virale nel giro di pochi giorni dalla pubblicazione, attirando a quanto pare milioni di giocatori nelle prime due settimane, e diede origine a un'enorme ondata di cloni, conversioni e varianti - versioni con grafica diversa che sostituivano di tutto, dalle emoji ai personaggi della cultura pop, oltre a varianti di dimensioni, varianti a tessere colorate e versioni tridimensionali.",
    twenty48_history_spread_p2: "Questa versione di PaperGames mantiene deliberatamente il tavoliere 4x4 originale e la probabilità di comparsa 90%/10% tra il 2 e il 4, invece di scegliere una di quelle varianti - la stessa scelta che questa raccolta fa ovunque altrove, preferendo il regolamento standard e ben conosciuto a una variazione originale.",
    twenty48_history_modern_title: "Un piccolo tavoliere, studiato seriamente",
    twenty48_history_modern_p1: "Nonostante le sue regole semplici, il gioco ottimale di 2048 si rivela essere un problema di ricerca genuinamente difficile a causa della casualità nella comparsa delle tessere: i migliori giocatori computerizzati usano la ricerca expectimax (valutando le mosse rispetto alla probabilità di ogni possibile tessera successiva) invece della semplice ricerca minimax che un gioco deterministico come gli scacchi permette.",
    twenty48_history_modern_p2: "I migliori giocatori computerizzati documentati riescono a raggiungere la tessera 32768 con alta probabilità e occasionalmente hanno raggiunto la 65536 - due raddoppi oltre la tessera che la maggior parte dei giocatori umani è entusiasta di vedere anche solo una volta."
});
I18n.markTextLoaded("it");
