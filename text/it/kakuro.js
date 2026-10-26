// text/it/kakuro.js
// Rules and history texts of kakuro (it). Loaded by kakuro-rules.html and kakuro-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    kakuro_rules_title: "Regole del Kakuro",
    kakuro_rules_intro: "Un rapido promemoria su come PaperGames gioca a Kakuro - utile se sei arrugginito o lo stai imparando. Il Kakuro è a volte descritto come un «cruciverba a numeri»: invece di lettere, ogni casella bianca contiene una cifra, e invece di parole gli indizi sono somme.",
    kakuro_rules_basics_title: "L'idea di base",
    kakuro_term_board: "La griglia",
    kakuro_rules_board: "La griglia è un mix di caselle nere con indizi e caselle bianche da riempire. Ogni linea ininterrotta di caselle bianche, letta da sinistra a destra o dall'alto in basso, si chiama «serie». Ogni serie ha esattamente un indizio: il totale a cui le sue cifre devono sommare.",
    kakuro_term_clues: "Leggere le caselle con indizio",
    kakuro_rules_clues: "Una casella nera mostra la propria somma (o somme) in cifre bianche, divise in diagonale quando ne porta due: il numero nell'angolo in alto a destra è l'obiettivo della serie di caselle bianche che inizia subito alla sua destra (un indizio «orizzontale»), e il numero nell'angolo in basso a sinistra è l'obiettivo della serie che inizia subito sotto (un indizio «verticale»). Una casella nera con un solo indizio mostra solo quel numero.",
    kakuro_term_goal: "L'obiettivo",
    kakuro_rules_goal: "Riempi ogni casella bianca con una cifra da 1 a 9 in modo che le cifre di ogni serie sommino esattamente al suo indizio - ed è altrettanto importante che nessuna cifra si ripeta nella stessa serie (una cifra può ricomparire in una serie che la incrocia, ma mai due volte nella stessa serie).",
    kakuro_term_input: "Inserire i numeri",
    kakuro_rules_input: "Seleziona una casella bianca, poi scegli una cifra dal tastierino sotto il tabellone (o digita una cifra da tastiera). Una casella con il contorno tratteggiato sta ripetendo una cifra già usata altrove in una delle sue serie, oppure appartiene a una serie completamente riempita il cui totale non corrisponde ancora al suo indizio - prendilo come segnale che qualcosa va cambiato.",
    kakuro_term_difficulty: "Difficoltà",
    kakuro_rules_difficulty: "I livelli Facile, Medio e Difficile usano griglie progressivamente più grandi (7x7, 9x9 e 11x11), quindi serie più lunghe e più incroci fra loro - più cifre da tenere a mente insieme, ma sempre le stesse due regole.",
    kakuro_rules_example_title: "Un esempio svolto",
    kakuro_term_example: "Due serie che si incrociano",
    kakuro_rules_example_p1: "Supponiamo che una serie orizzontale di 2 caselle abbia indizio 4, e che la sua prima casella sia anche l'inizio di una serie verticale di 2 caselle con indizio 3. Le due cifre della serie orizzontale devono sommare a 4 senza ripetersi - solo 1+3 o 3+1 lo permettono (2+2 ripete il 2, quindi non è ammesso). Le due cifre della serie verticale devono sommare a 3 senza ripetersi, cosa che solo 1+2 o 2+1 permettono.",
    kakuro_rules_example_p2: "La casella condivisa deve avere una cifra che entrambe le serie possano usare. La serie orizzontale offre {1, 3} per quella casella, quella verticale offre {1, 2} - l'unica cifra comune a entrambi gli insiemi è 1. Quindi la casella condivisa deve essere 1, il che fissa l'altra casella della serie orizzontale a 3 e l'altra casella della serie verticale a 2. L'intero schema è così risolto per sola eliminazione, senza bisogno di indovinare - lo stesso tipo di deduzione che, ripetuta molte più volte, risolve qualsiasi griglia di Kakuro più grande.",
    kakuro_rules_end_title: "Completare uno schema",
    kakuro_term_win: "Risolto",
    kakuro_rules_win: "Lo schema è risolto nel momento in cui ogni casella bianca è riempita, ogni serie somma al proprio indizio e nessuna serie ripete una cifra.",
    kakuro_history_title: "La storia del Kakuro",
    kakuro_history_origins_title: "Cross Sums, inventato in America",
    kakuro_history_origins_p1: "Il cruciverba a numeri oggi noto come Kakuro apparve per la prima volta negli Stati Uniti con il nome «Cross Sums» (scritto anche «Cross Sum») nelle riviste enigmistiche dell'editore Dell; il più antico esempio noto risale al 1950. L'invenzione viene spesso attribuita al canadese Jacob E. Funk. Ci mise alcuni anni ad affermarsi, ma a metà degli anni Sessanta era ormai una rubrica fissa delle riviste enigmistiche Dell, accanto agli altri giochi numerici e logici della casa editrice.",
    kakuro_history_origins_p2: "L'idea univa l'aspetto di una griglia di cruciverba all'aritmetica anziché al vocabolario: caselle nere con numeri-indizio al posto delle definizioni, e caselle bianche da riempire con cifre le cui somme dovevano corrispondere a quegli indizi.",
    kakuro_history_spread_title: "Un nome giapponese per una seconda vita",
    kakuro_history_spread_p1: "Cross Sums arrivò in Giappone, dove l'editore di enigmistica Nikoli - la stessa azienda che in seguito avrebbe reso popolare e battezzato il Sudoku - lo riprese dandogli il nome «Kakuro», contrazione di «kasan kurosu» (加算クロス), giapponese per «croce d'addizione».",
    kakuro_history_spread_p2: "Durante gli anni '80, il Kakuro divenne uno dei rompicapi più popolari di Nikoli in Giappone, conquistando un seguito ben prima del boom del Sudoku che in seguito avrebbe portato il nome di Nikoli nel resto del mondo.",
    kakuro_history_modern_title: "Un rompicapo riscoperto",
    kakuro_history_modern_p1: "La notorietà internazionale del Kakuro tornò a crescere a metà degli anni 2000, sulla scia del boom mondiale del Sudoku sui giornali, quando i redattori di enigmistica in cerca di un successore si rivolsero agli altri rompicapi numerici di Nikoli - facendo scoprire il Kakuro a molti appassionati occidentali per la prima volta con il suo nome giapponese, anche se il rompicapo stesso era stato inventato decenni prima in Nordamerica.",
    kakuro_history_modern_p2: "Questa storia in due tempi si riflette in come il rompicapo viene risolto ancora oggi: una griglia di Kakuro non richiede mai di indovinare, solo la stessa eliminazione serie per serie usata dai risolutori dell'originale Cross Sums di Dell - espressa semplicemente cifra per cifra, un indizio alla volta, lo stesso principio che il generatore di questa raccolta usa al contrario per costruire uno schema nuovo a partire da una griglia riempita a caso."
});
I18n.markTextLoaded("it");
