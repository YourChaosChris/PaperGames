// text/it/blackjack.js
// Rules and history texts of blackjack (it). Loaded by blackjack-rules.html and blackjack-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    bj_rules_title: "Regole del Blackjack",
    bj_rules_intro: "Avvicinati a 21 più del banco, ma senza superarlo. Due varianti, un solo gioco: con le fiches, che sono solo punti.",
    bj_rules_basics_title: "Le regole",
    bj_term_variants: "Due varianti",
    bj_rules_variants: "17 e 4 si gioca con 32 carte (dal 7 all'asso), il Blackjack con 52 carte (dal 2 all'asso). Scegli la variante sotto Nuova partita.",
    bj_term_values17: "Valori delle carte in 17 e 4",
    bj_rules_values17: "Asso 11, re 4, donna 3, fante 2, le carte dal 7 al 10 secondo il loro valore. Due assi come prime due carte si chiamano «fuoco» e sono la mano migliore.",
    bj_term_valuesbj: "Valori delle carte nel Blackjack",
    bj_rules_valuesbj: "Asso 1 o 11 (come ti conviene di più), re, donna e fante 10, le altre carte secondo il loro valore. Un asso e una carta da 10 come prime due carte sono un blackjack.",
    bj_term_round: "Un turno",
    bj_rules_round: "Scegli la puntata: 5, 10 o 20 fiches. Ricevi due carte, il banco una scoperta e una coperta. Con «Carta» prendi altre carte, con «Stai» ti fermi. Se superi 21, hai perso subito.",
    bj_term_bank: "Il banco",
    bj_rules_bank: "Quando stai, il banco scopre la sua carta. Segue sempre la stessa regola: pesca finché ha 16 o meno e sta da 17 in su. Se supera 21, vinci tu.",
    bj_term_result: "Chi vince",
    bj_rules_result: "Vince chi è più vicino a 21. Vinci tante fiches quante ne hai puntate; un blackjack vince una volta e mezza la puntata (arrotondando per difetto). Pareggio: in 17 e 4 vince il banco, nel Blackjack tieni le tue fiches. Un 21 con due carte (blackjack) o il fuoco chiude subito il turno.",
    bj_term_double: "Raddoppiare (solo Blackjack)",
    bj_rules_double: "Con le prime due carte puoi raddoppiare: la puntata raddoppia, ricevi esattamente un'altra carta e poi gioca il banco. Servono abbastanza fiches. Non ci sono divisione né assicurazione.",
    bj_term_chips: "Fiches",
    bj_rules_chips: "Cominci con 100 fiches. Sono solo punti del gioco e non si possono scambiare con nulla. Se le finisci, ricominci con 100.",
    bj_rules_example_title: "Stesse carte, punti diversi",
    bj_rules_example: "Asso e re: nel Blackjack fanno 21, un blackjack. In 17 e 4 fanno solo 15 (asso 11, re 4).",
    bj_history_title: "La storia del Blackjack",
    bj_history_origins_title: "Ventuno",
    bj_history_origins_p1: "I giochi di carte in cui si cerca di arrivare a 21 senza superarlo sono antichi: la prima menzione scritta si trova in un libro dello scrittore spagnolo Miguel de Cervantes. Il 17 e 4 tedesco risale al XVIII secolo ed era molto amato in Francia alla corte di Luigi XV. Il vingt-et-un francese (21) deriva dal più antico trente-et-un, in cui la meta era 31. In tedesco un tempo si chiamava anche Hopsen. Con i valori del mazzo da 32 carte, 17 più un re (4) fanno esattamente 21.",
    bj_history_us_title: "Blackjack",
    bj_history_us_p1: "Negli Stati Uniti una forma americana del ventuno divenne un gioco a sé e prese il nome di blackjack verso il 1899. La storia, spesso raccontata, di un premio per un asso con un fante nero è un mito secondo lo storico Thierry Depaulis. Tradizionalmente un blackjack paga 3 a 2 e, a parità di punti, la puntata viene restituita.",
    bj_history_modern_title: "Il Blackjack su PaperGames",
    bj_history_modern_p1: "PaperGames gioca solo con le fiches: sono semplicemente punti del gioco e non si possono scambiare con nulla. Il banco segue sempre la stessa regola fissa, le carte vengono mescolate a ogni turno e i tuoi punti sono sempre visibili; le carte si distinguono per simboli pieni e vuoti, perché il gioco funzioni sull'inchiostro elettronico in bianco e nero."
});
I18n.markTextLoaded("it");
