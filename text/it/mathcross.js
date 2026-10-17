// text/it/mathcross.js
// Rules and history texts of mathcross (it). Loaded by mathcross-rules.html and mathcross-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    mc_rules_title: "Griglia dei calcoli – regole",
    mc_rules_intro: "Metti i numeri da 1 a 9 in modo che ogni calcolo torni.",
    mc_rules_basics_title: "Le regole",
    mc_term_grid: "La griglia",
    mc_rules_grid: "Nove caselle in tre righe e tre colonne, con un segno di operazione tra caselle vicine (+, −, ×, ÷) e il risultato alla fine di ogni riga e sotto ogni colonna. Ogni numero da 1 a 9 va in una sola casella. Alcuni numeri sono dati.",
    mc_term_order: "Da sinistra a destra",
    mc_rules_order: "Una riga si calcola da sinistra a destra, una colonna dall'alto in basso, un passo dopo l'altro, senza la precedenza della moltiplicazione: 3 + 4 × 2 dà 7 × 2 = 14, non 11. Alcune versioni scolastiche di questo gioco usano le solite precedenze; qui si calcola sempre da sinistra a destra.",
    mc_term_whole: "Numeri interi",
    mc_rules_whole: "Ogni risultato intermedio e ogni risultato è un numero intero maggiore di 0; una divisione torna quindi sempre esatta.",
    mc_term_levels: "Livelli",
    mc_rules_levels: "Facile: solo + e −, 4 numeri dati. Medio: anche ×, 3 dati. Difficile: tutte e quattro le operazioni con almeno una ÷, 2 dati. Ogni gioco ha una sola soluzione e si risolve senza tirare a indovinare.",
    mc_term_help: "Giocare",
    mc_rules_help: "Tocca una casella vuota, poi un numero sotto la griglia; tocca di nuovo il numero o Cancella per svuotare la casella. Un numero già presente in un'altra casella viene spostato qui. Quando una riga o una colonna è piena, una spunta o una croce indica se torna. Il pulsante Suggerimento segnala prima un numero sbagliato, altrimenti riempie una casella che ora si può dedurre.",
    mc_rules_example_title: "Esempio",
    mc_rules_example: "Una griglia dei calcoli risolta. Riga centrale: 9 − 1 = 8, poi 8 × 3 = 24, da sinistra a destra, non 9 − 3 = 6.",
    mc_history_title: "Storia della griglia dei calcoli",
    mc_history_magic_title: "Il quadrato magico",
    mc_history_magic_p1: "L'enigma numerico più noto con i numeri da 1 a 9 in una griglia 3 × 3 è il quadrato magico, in cui ogni riga, colonna e diagonale dà 15. In Cina si chiama Lo Shu (Luoshu) ed è legato a una leggenda su una tartaruga. Quanto sia antico davvero resta incerto: le date indicate dalle fonti sono molto distanti tra loro.",
    mc_history_today_title: "Calcoli in righe e colonne",
    mc_history_today_p1: "La griglia dei calcoli mantiene la griglia 3 × 3 con i numeri da 1 a 9, ma chiede un calcolo diverso in ogni riga e colonna. Giochi di questo tipo compaiono nei quaderni di scuola e nelle raccolte di enigmi, a volte con le solite precedenze. PaperGames non è riuscito a scoprire dove sia apparsa per prima questa forma; il nome descrive semplicemente ciò che si vede."
});
I18n.markTextLoaded("it");
