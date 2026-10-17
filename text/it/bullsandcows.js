// text/it/bullsandcows.js
// Rules and history texts of bullsandcows (it). Loaded by bullsandcows-rules.html and bullsandcows-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    bullsandcows_rules_title: "Regole di Tori e mucche",
    bullsandcows_rules_intro: "Una guida rapida a come PaperGames gioca a Tori e mucche - utile se sei arrugginito, o se stai imparando.",
    bullsandcows_rules_basics_title: "L'idea di base",
    bullsandcows_term_code: "Il codice segreto",
    bullsandcows_rules_code: "All'inizio di una nuova partita, il computer sceglie un codice nascosto di quattro posizioni, ciascuna impostata su una delle sei forme: cerchio, quadrato, triangolo, rombo, stella o croce. A seconda della difficoltà, la stessa forma può comparire più volte nel codice.",
    bullsandcows_term_guess: "Fare un tentativo",
    bullsandcows_rules_guess: "Tocca una casella per farla scorrere tra le sei forme, poi tocca Invia il tentativo quando tutte e quattro le caselle mostrano le forme che vuoi provare. Un tentativo può ripetere una forma liberamente, che il codice segreto stesso abbia o meno ripetizioni.",
    bullsandcows_term_feedback: "Leggere il riscontro",
    bullsandcows_rules_feedback: "Ogni tentativo riceve indietro una fila di pioli: un piolo nero per ogni forma corretta e nella posizione giusta, e un piolo bianco per ogni forma corretta ma nella posizione sbagliata. Per esempio, se il codice è cerchio-cerchio-quadrato-triangolo e il tuo tentativo è cerchio-quadrato-quadrato-quadrato, ottieni due pioli neri (il primo cerchio e il terzo quadrato sono esattamente giusti) e nessun piolo bianco - ai quadrati in più del tentativo non resta più nulla nel codice con cui corrispondere. I pioli non dicono mai a quali caselle si riferiscono: scoprirlo è tutto il rompicapo.",
    bullsandcows_rules_end_title: "Concludere una partita",
    bullsandcows_term_win: "Vincere",
    bullsandcows_rules_win: "Vinci nel momento in cui un tentativo ottiene quattro pioli neri - ogni forma esattamente nella posizione giusta.",
    bullsandcows_term_loss: "Finire i tentativi",
    bullsandcows_rules_loss: "Ogni livello di difficoltà consente un numero fisso di tentativi. Se li usi tutti senza scoprire il codice, la partita finisce lì e il codice segreto viene rivelato.",
    bullsandcows_term_levels: "Livelli di difficoltà",
    bullsandcows_rules_levels: "Facile ti dà 12 tentativi, ma il codice segreto non ripete mai una forma. Medio ne dà 10 e permette le ripetizioni, il modo tradizionale di giocare. Difficile ne dà solo 8 e permette anch'esso le ripetizioni, quindi le forme duplicate sono qualcosa a cui prestare attenzione.",
    bullsandcows_history_title: "La storia di Tori e mucche",
    bullsandcows_history_origins_title: "Un classico di carta e penna",
    bullsandcows_history_origins_p1: "L'idea centrale - indovinare un codice nascosto e sapere solo quante corrispondenze esatte e parziali ci sono, mai quali - viene da Bulls and Cows (Tori e mucche), un gioco di indovinelli con carta e penna giocato molto prima del 1970. Tradizionalmente si gioca con numeri segreti: una cifra giusta al posto giusto è un toro, una cifra giusta al posto sbagliato è una mucca.",
    bullsandcows_history_origins_p2: "Fu anche uno dei primi giochi scritti per computer: versioni, spesso chiamate Moo, giravano sui computer universitari già dalla fine degli anni Sessanta, e programmarlo è ancora oggi un esercizio classico.",
    bullsandcows_history_spread_title: "Il gioco da tavolo e il nome",
    bullsandcows_history_spread_p1: "Nel 1970 l'idea divenne un gioco da tavolo con pioli colorati, famoso in tutto il mondo con il nome Mastermind. Mastermind è un marchio; i diritti appartengono a Invicta Plastics. PaperGames non ha alcun legame con Invicta Plastics né con quel gioco da tavolo e usa quindi il nome più antico, Bulls and Cows, Tori e mucche.",
    bullsandcows_history_modern_title: "Un rompicapo amato dagli informatici",
    bullsandcows_history_modern_p1: "Poiché si riduce a cercare una risposta nascosta usando solo il conteggio delle corrispondenze, il gioco è diventato un caso di studio classico in informatica e combinatoria per analizzare strategie di indovinello e algoritmi di ricerca.",
    bullsandcows_history_modern_p2: "In un noto articolo del 1977, Donald Knuth dimostrò che la versione classica con quattro posizioni e sei simboli si può sempre risolvere in al massimo cinque tentativi con una strategia ottimale - un risultato ancora citato quando si parla di ricerca algoritmica."
});
I18n.markTextLoaded("it");
