// text/it/mahjong.js
// Rules and history texts of mahjong (it). Loaded by mahjong-rules.html and mahjong-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    mahjong_rules_title: "Regole del Mahjong Solitario",
    mahjong_rules_intro: "Una guida rapida a come PaperGames gioca a Mahjong Solitario - utile se sei arrugginito, o se stai imparando.",
    mahjong_rules_basics_title: "L'idea di base",
    mahjong_term_layout: "La disposizione",
    mahjong_rules_layout: "80 tessere sono impilate su tre livelli in una forma piramidale. Una tessera è libera da prendere solo quando non c'è nulla sopra di essa e almeno uno dei suoi vicini immediati a sinistra o a destra, sul suo stesso livello, è assente o già rimosso.",
    mahjong_term_matching: "Abbinamento",
    mahjong_rules_matching: "Clicca su una tessera libera, poi clicca su un'altra tessera libera che mostra lo stesso simbolo per rimuoverle entrambe dal tavoliere. Ogni distribuzione è generata in modo che uno sgombero completo sia sempre possibile dalla posizione iniziale, anche se un ordine di abbinamenti sbagliato può comunque lasciarti bloccato a metà strada.",
    mahjong_term_shuffle: "Restare bloccati",
    mahjong_rules_shuffle: "Se non resta più nessun abbinamento legale sul tavoliere, usa Rimescola le tessere rimanenti per ridistribuire nuovi simboli su ciò che resta - da quel punto in poi è garantita una nuova soluzione, quindi restare bloccati in una posizione non significa mai dover ricominciare completamente da capo.",
    mahjong_rules_end_title: "Completare una partita",
    mahjong_term_win: "Sgomberato",
    mahjong_rules_win: "Il tavoliere è sgomberato nel momento in cui tutte le tessere sono state abbinate e rimosse.",
    mahjong_history_title: "La storia del Mahjong Solitario",
    mahjong_history_origins_title: "Tessere prese in prestito, nuovo gioco",
    mahjong_history_origins_p1: "Il Mahjong Solitario (chiamato anche Shanghai) non è un gioco cinese tradizionale. Riprende lo splendido set di tessere illustrate del Mahjong a quattro giocatori (esso stesso una creazione cinese del XIX secolo) per un rompicapo di abbinamento a giocatore singolo completamente diverso, senza le combinazioni, gli scarti o i punteggi del gioco originale. La prima versione documentata è un videogioco: Brodie Lockard lo scrisse nel 1981 per il sistema PLATO.",
    mahjong_history_origins_p2: "Chi per primo abbia combinato un formato solitario ad abbinamento di coppie con le tessere del Mahjong non è del tutto chiaro, con rivendicazioni contrastanti che risalgono a decenni prima dell'era del computer - ciò che è certo è che questa combinazione non divenne un fenomeno globale finché non fece il salto verso i personal computer.",
    mahjong_history_spread_title: "Un classico degli schermi dei computer degli anni '80",
    mahjong_history_spread_p1: "Il gioco raggiunse un pubblico di massa attraverso le prime versioni per computer degli anni '80, in particolare 'Shanghai' di Activision del 1986 per Macintosh - abbastanza popolare da far sì che 'Shanghai' diventasse, e in molti luoghi resti ancora, un nome alternativo per l'intero genere dei giochi solitario di abbinamento di tessere costruiti intorno alla classica disposizione a strati.",
    mahjong_history_spread_p2: "La disposizione che dà il nome al gioco - un cumulo a gradoni, a forma di piramide, soprannominato 'la Tartaruga' - divenne così fortemente associata al genere che la maggior parte delle implementazioni, compresa questa, adotta di default una sua variazione invece di inventare una nuova forma.",
    mahjong_history_modern_title: "Un rompicapo risolvibile per costruzione",
    mahjong_history_modern_p1: "A differenza di un gioco come il Sudoku o un Nonogramma, dove la soluzione di uno schema viene verificata per l'unicità dopo essere stata progettata, una distribuzione di Mahjong Solitario è normalmente garantita giocabile in un modo diverso: molte implementazioni, compresa quella di PaperGames, costruiscono la distribuzione lavorando a ritroso da un tavoliere vuoto, riproducendo al contrario una sequenza di rimozione legale per decidere dove va ogni simbolo.",
    mahjong_history_modern_p2: "Questo garantisce che esista almeno un percorso vincente fin dalla primissima tessera piazzata, ma - esattamente come per un vero mazzo di carte del solitario Klondike - non dice nulla sul fatto che una particolare sequenza di abbinamenti effettivamente fatta da un giocatore riesca a raggiungerlo, motivo per cui restare bloccati a metà di una distribuzione perfettamente risolvibile è una parte normale e prevista del gioco, non un segno che qualcosa sia andato storto."
});
I18n.markTextLoaded("it");
