// text/it/tenpairs.js
// Rules and history texts of tenpairs (it). Loaded by tenpairs-rules.html and tenpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    tp_rules_title: "Regole di Coppie da dieci",
    tp_rules_intro: "Cancella coppie di cifre finché non ne resta nessuna.",
    tp_rules_basics_title: "Le regole",
    tp_term_field: "Il campo",
    tp_rules_field: "Cifre da 1 a 9 su nove colonne, lette riga per riga come un testo.",
    tp_term_pairs: "Coppie",
    tp_rules_pairs: "Due cifre si cancellano insieme se sono uguali (3 e 3) o se fanno 10 (1 e 9, 2 e 8, 3 e 7, 4 e 6, 5 e 5).",
    tp_term_see: "Vedersi",
    tp_rules_see: "Le due devono vedersi: vicine in orizzontale, in verticale o in diagonale, oppure con solo caselle cancellate in mezzo su quella linea. In orizzontale si va anche oltre la fine della riga: l'ultima cifra di una riga vede la prima della successiva, e così via nel senso di lettura.",
    tp_term_add: "Ricopia",
    tp_rules_add: "Quando sei bloccato, tocca Ricopia: tutte le cifre non ancora cancellate vengono riscritte, nello stesso ordine, alla fine del campo. Al massimo 5 volte per partita.",
    tp_term_rows: "Righe vuote",
    tp_rules_rows: "Una riga con tutte e nove le caselle cancellate sparisce.",
    tp_term_end: "Vincere e perdere",
    tp_rules_end: "Vinci quando tutte le cifre sono cancellate. Perdi quando non resta né una coppia né una ricopiatura, oppure quando il campo supera le 40 righe.",
    tp_term_start: "Inizio",
    tp_rules_start: "Classico: 1 2 3 4 5 6 7 8 9, poi 1 1 1 2 1 3 1 4 1 5 1 6 1 7 1 8 1 9 (i numeri da 1 a 19 senza il 10). Casuale: tre, quattro o cinque righe; più facile è il livello, più coppie sono vicine.",
    tp_term_help: "Aiuto",
    tp_rules_help: "Annulla torna indietro di quanti passi vuoi. Suggerimento segna una coppia da cancellare, oppure dice che resta solo Ricopia.",
    tp_rules_example_title: "Esempio",
    tp_rules_example: "L'inizio classico. L'1 in alto a sinistra e l'1 sotto di esso si vedono (in verticale) e sono uguali. Il 9 alla fine della prima riga e l'1 all'inizio della seconda si vedono oltre la fine della riga e fanno 10.",
    tp_history_title: "Storia di Coppie da dieci",
    tp_history_origins_title: "Dai quaderni di scuola",
    tp_history_origins_p1: "L'origine di questo passatempo non è documentata nelle fonti che PaperGames ha potuto consultare. Un articolo del 2011 sul sito russo Habr lo ricorda dalla scuola e dall'università: si giocava su quaderni a quadretti, con nomi come «numeri», «cifre», «semi» o «19»; non c'era un nome ufficiale. Lì il gioco comincia con i numeri da 1 a 19 (senza il 10) scritti di seguito, le stesse cifre dell'inizio classico qui, e quando non resta nessuna coppia si ricopiano in fondo le cifre rimaste.",
    tp_history_name_title: "Il nome",
    tp_history_name_p1: "«Coppie da dieci» dice semplicemente di che cosa si tratta. Diverse app usano la stessa idea con nomi propri; PaperGames non li usa. Le coppie in diagonale e i limiti di 5 ricopiature e di 40 righe sono regole di PaperGames."
});
I18n.markTextLoaded("it");
