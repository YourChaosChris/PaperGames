// text/it/teufelsieben.js
// Rules and history texts of teufelsieben (it). Loaded by teufelsieben-rules.html and teufelsieben-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    ts_rules_title: "Regole del Sette del Diavolo",
    ts_rules_intro: "Scopri le carte una alla volta e fermati in tempo: un numero che hai già ti fa sballare. Quando qualcuno raggiunge l’obiettivo, vince chi ha più punti.",
    ts_rules_basics_title: "Le regole",
    ts_term_cards: "Le carte",
    ts_rules_cards: "60 carte. Numeri da 1 a 10: tre 1, quattro 2, cinque 3, sei ciascuno di 4, 5, 6 e 7, cinque 8, quattro 9 e tre 10. Due per ogni speciale: Coraggio, Rimuovi, Passa, Ponte, Collezionista e Sbircia.",
    ts_term_turn: "Il tuo turno",
    ts_rules_turn: "Ogni giocatore ha un turno completo per round. Scopri le carte una alla volta; dopo la prima puoi fermarti quando vuoi. Il round finisce quando tutti hanno giocato. Il primo giocatore avanza di un posto a ogni round.",
    ts_term_bust: "Sballare",
    ts_rules_bust: "Un numero già presente ti fa scoppiare: zero punti nel round. Coraggio ti salva una volta; scarta il numero ripetuto e Coraggio. Ogni Coraggio usato costa 5 punti a fine round.",
    ts_term_run: "Sequenze",
    ts_rules_run: "La sequenza più lunga di almeno 4 numeri vale 5 × (lunghezza − 2): quattro in fila valgono 10, cinque 15. Ogni Ponte copre un numero mancante.",
    ts_term_extreme: "Catena selvaggia",
    ts_rules_extreme: "Prima della partita puoi scegliere le carte «Catena selvaggia»: si aggiungono 12 carte, 72 in tutto – i numeri 11, 12, 13 e 14 (2 carte ciascuno), Anello (2 carte, +2 punti per ogni numero della tua fila più lunga di almeno 2, con due Anelli +4) e Specchio (2 carte: il tuo ultimo numero n diventa 15 − n, quindi si scambiano 1 e 14, 2 e 13 … 7 e 8; se hai già quel numero, o non hai ancora numeri, non succede nulla). Le file arrivano fino a 14. Si gioca fino a 250 o 500 punti.",
    ts_term_special: "Carte speciali",
    ts_rules_special: "Coraggio salva una volta e costa 5 punti quando usato. Rimuovi toglie l’ultimo numero. Passa fa iniziare il giocatore successivo con una carta scoperta. Ponte copre un vuoto. Collezionista dà 1 punto per numero. Sbircia mostra la carta successiva.",
    ts_term_points: "Punti e fine",
    ts_rules_points: "I punti del round sono la somma dei numeri, più bonus sequenza e 1 per numero per ogni Collezionista, meno 5 per Coraggio usato (mai sotto zero). Obiettivo: 60, 90 o 120; predefinito 90. Dopo il round in cui qualcuno raggiunge l’obiettivo, vince il punteggio maggiore; pari merito vincono insieme.",
    ts_term_computer: "Il computer",
    ts_rules_computer: "Il computer conta solo le carte scoperte e quella mostrata da Sbircia. Facile si ferma presto; Difficile confronta il possibile guadagno con il rischio.",
    ts_rules_example_title: "Esempio",
    ts_rules_example: "Hai 3, 4, 5, 6 e 9: 27 punti dai numeri. La sequenza di quattro aggiunge 10, per 37 prima degli effetti speciali.",
    ts_history_title: "Informazioni sul Sette del Diavolo",
    ts_history_family_title: "Continuare o fermarsi",
    ts_history_family_p1: "In questi giochi si decide ogni volta se rischiare ancora o tenere ciò che si è ottenuto. Molti giochi di dadi e carte funzionano così.",
    ts_history_modern_title: "Questa versione",
    ts_history_modern_p1: "Il Sette del Diavolo è stato creato per PaperGames, con carte, regole e testi propri: numeri da 1 a 10 in una miscela originale, bonus per le sequenze e Coraggio, Rimuovi, Passa, Ponte, Collezionista e Sbircia.",
});
I18n.markTextLoaded("it");
