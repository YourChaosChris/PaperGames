// text/it/skyscrapers.js
// Rules and history texts of skyscrapers (it). Loaded by skyscrapers-rules.html and skyscrapers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    skyscrapers_rules_title: "Regole di Skyscrapers",
    skyscrapers_rules_intro: "Un rapido promemoria su come PaperGames gioca a Skyscrapers (Grattacieli) - utile se sei arrugginito o lo stai imparando.",
    skyscrapers_rules_basics_title: "L'idea di base",
    skyscrapers_term_board: "La griglia",
    skyscrapers_rules_board: "Ogni casella contiene l'altezza di un edificio, da 1 (il più basso) a N (il più alto, dove N è la dimensione della griglia). Intorno alla griglia, alcune righe e colonne portano un numero-indizio appena oltre quel bordo - non necessariamente ogni riga o colonna, né necessariamente su ogni lato.",
    skyscrapers_term_clues: "Leggere gli indizi ai bordi",
    skyscrapers_rules_clues: "Un indizio indica quanti edifici si vedrebbero guardando in quella riga o colonna da quel lato, se un edificio più alto nasconde completamente, da quel punto di vista, ogni edificio più basso che gli sta davanti. Gli indizi in alto guardano la propria colonna verso il basso, quelli in basso la guardano verso l'alto, quelli a sinistra guardano la propria riga verso destra, e quelli a destra la guardano verso sinistra.",
    skyscrapers_term_goal: "L'obiettivo",
    skyscrapers_rules_goal: "Riempi ogni casella con un'altezza da 1 a N in modo che ogni riga e ogni colonna contenga ogni altezza esattamente una volta (la stessa regola delle righe e colonne del Sudoku, ma senza la regola dei riquadri), e che ogni indizio mostrato intorno alla griglia corrisponda al numero di edifici effettivamente visibili da quel lato.",
    skyscrapers_term_input: "Inserire le altezze",
    skyscrapers_rules_input: "Seleziona una casella, poi scegli un'altezza dal tastierino sotto il tabellone (o digita una cifra da tastiera). Una casella con il contorno tratteggiato sta ripetendo un'altezza già usata altrove nella sua riga o colonna - prendilo come segnale che qualcosa va cambiato.",
    skyscrapers_term_difficulty: "Difficoltà",
    skyscrapers_rules_difficulty: "I livelli Facile, Medio e Difficile usano griglie progressivamente più grandi (4x4, 5x5 e 6x6) con progressivamente meno indizi ai bordi rivelati - più altezze da tenere a mente insieme, ma sempre le stesse due regole.",
    skyscrapers_rules_example_title: "Un esempio svolto",
    skyscrapers_term_example: "Contare gli edifici visibili",
    skyscrapers_rules_example_p1: "Prendi una riga di quattro edifici, altezze 3, 1, 4, 2, letta da sinistra a destra. Guardando da sinistra: il 3 è visibile per primo, dato che nulla di più alto lo ha preceduto. L'1 è più basso del 3 già visto, quindi resta nascosto dietro di esso. Il 4 è più alto di tutto quello che lo precede, quindi è visibile anch'esso. Il 2 è più basso del 4, quindi resta nascosto.",
    skyscrapers_rules_example_p2: "Sono quindi 2 gli edifici visibili da sinistra - il 3 e il 4 - dunque un indizio sinistro di 2 corrisponde a questa riga. Guardando la stessa riga da destra (letta nell'ordine di vista 2, 4, 1, 3): il 2 è visibile per primo, il 4 è più alto quindi visibile anch'esso, e sia l'1 sia il 3 che seguono sono più bassi del 4 già visto, quindi nessuno dei due è visibile - anche qui un indizio destro di 2, per pura coincidenza di questa particolare riga.",
    skyscrapers_rules_end_title: "Completare uno schema",
    skyscrapers_term_win: "Risolto",
    skyscrapers_rules_win: "Lo schema è risolto nel momento in cui la griglia è completamente riempita, ogni riga e colonna contiene ogni altezza esattamente una volta, e ogni indizio ai bordi corrisponde al numero effettivo di edifici visibili della sua riga o colonna.",
    skyscrapers_history_title: "La storia di Skyscrapers",
    skyscrapers_history_origins_title: "Radici nella cultura delle riviste enigmistiche",
    skyscrapers_history_origins_p1: "A differenza del Sudoku, Skyscrapers non ha un singolo inventore ben documentato né una data di prima pubblicazione su cui gli storici concordino. Come molti generi di rompicapi logici, sembra essere emerso e diffuso gradualmente attraverso la cultura delle riviste enigmistiche, piuttosto che essere attribuito a un unico creatore in un momento preciso - l'idea dell'indizio di visibilità è abbastanza semplice da far pensare che più di un autore di enigmi vi sia arrivato in modo indipendente.",
    skyscrapers_history_origins_p2: "Ciò che è certo è invece la matematica che vi sta dietro: come il Sudoku, una griglia di Skyscrapers risolta è un quadrato latino - una griglia in cui ogni simbolo, qui un'altezza di edificio, compare esattamente una volta per riga e per colonna -, un oggetto studiato da Leonhard Euler nel XVIII secolo, molto prima che esistesse uno dei due rompicapi.",
    skyscrapers_history_spread_title: "Un rompicapo da competizione",
    skyscrapers_history_spread_p1: "Skyscrapers ha trovato il suo pubblico internazionale più ampio attraverso le gare di enigmistica, in particolare i Campionati Mondiali di Puzzle (World Puzzle Championship), una competizione internazionale annuale tenutasi per la prima volta nel 1992, dove è uno dei tanti generi standard ricorrenti insieme alla famiglia del Sudoku e ad altri rompicapi basati sui quadrati latini.",
    skyscrapers_history_spread_p2: "Questo contesto competitivo ha contribuito a fissare le regole e la presentazione del rompicapo nella forma standard giocata oggi, anche senza un unico inventore riconosciuto - un po' come diversi generi di rompicapi ricorrenti devono la loro forma definitiva meno a un singolo creatore che all'uso ripetuto in riviste enigmistiche e raccolte di rompicapi per campionati.",
    skyscrapers_history_modern_title: "Quadrati latini, visti dall'esterno",
    skyscrapers_history_modern_p1: "Ciò che rende Skyscrapers concettualmente distintivo è il modo in cui sovrappone un'idea spaziale e visiva - guardare lungo una fila di edifici e contare quanti sono abbastanza alti da essere visti - a una logica già familiare dalle righe e colonne del Sudoku. Proprio questa combinazione è anche ciò che dà al rompicapo il suo nome e la sua presentazione tematica, a differenza della semplice griglia di cifre che presentano un Sudoku o un puro rompicapo a quadrato latino.",
    skyscrapers_history_modern_p2: "È anche esattamente la proprietà su cui si basa, al contrario, il generatore di PaperGames: poiché un indizio ai bordi è in realtà solo un fatto calcolato a partire da una griglia completata, ogni schema qui viene prodotto costruendo prima una griglia completa e valida, calcolandone poi ogni indizio possibile, e mantenendo infine solo tanti di quegli indizi quanti bastano a fissare la griglia su un'unica soluzione - lo stesso approccio genera-e-poi-riduci usato dai generatori di Sudoku e Kakuro di questa raccolta, adattato a un vincolo diverso."
});
I18n.markTextLoaded("it");
