// text/it/pyramidsolitaire.js
// Rules and history texts of pyramidsolitaire (it). Loaded by pyramidsolitaire-rules.html and pyramidsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    pyramidsolitaire_rules_title: "Regole di Piramide Solitario",
    pyramidsolitaire_rules_intro: "Un rapido promemoria di come PaperGames gioca a Piramide Solitario - utile se sei arrugginito, o se lo stai imparando.",
    pyramidsolitaire_rules_basics_title: "L'idea di base",
    pyramidsolitaire_term_layout: "La disposizione",
    pyramidsolitaire_rules_layout: "28 carte vengono distribuite scoperte in un triangolo di 7 file: 1 carta in cima, 2 sotto di essa, e così via fino a 7 carte nella fila in basso, con ogni carta appoggiata sopra e tra le due carte sottostanti. Le restanti 24 carte formano il tallone, da cui si pesca una carta alla volta scoperta verso gli scarti.",
    pyramidsolitaire_term_pairing: "Abbinare a 13",
    pyramidsolitaire_rules_pairing: "Le carte valgono il loro valore nominale per questo: Asso = 1, da 2 a 10 come stampato, Fante = 11, Regina = 12, Re = 13. Rimuovi due carte disponibili i cui valori sommano esattamente 13 - per esempio un 5 e un 8, un 9 e un 4, oppure un Fante (11) e un 2. Un Re vale già 13 da solo, quindi viene rimosso senza bisogno di un partner.",
    pyramidsolitaire_term_exposed: "Carte scoperte",
    pyramidsolitaire_rules_exposed: "Una carta della piramide può essere presa solo quando entrambe le carte appoggiate su di essa nella fila sottostante sono sparite - la fila in basso parte già scoperta, dato che non c'è nulla sotto di essa. Possono essere rimosse solo le carte scoperte della piramide e la carta in cima agli scarti; una carta coperta della piramide viene mostrata attenuata e non può ancora essere presa, anche se puoi vedere di che carta si tratta.",
    pyramidsolitaire_term_stock: "Il tallone, gli scarti e i rimescolamenti",
    pyramidsolitaire_rules_stock: "Tocca il tallone per girare la sua carta in cima scoperta sugli scarti, una carta alla volta - solo la carta in cima agli scarti può essere abbinata. Quando il tallone si esaurisce, toccarlo di nuovo rimescola tutti gli scarti di nuovo nel tallone così puoi ripercorrerlo, fino a 2 volte per partita. Il numero di rimescolamenti rimasti viene sempre mostrato accanto al tallone.",
    pyramidsolitaire_rules_example_title: "Un esempio svolto",
    pyramidsolitaire_term_example: "Rimuovere una coppia",
    pyramidsolitaire_rules_example: "Supponiamo che la fila in basso abbia un 9 scoperto e, altrove nella piramide, un 4 scoperto - cliccando sul 9 e poi sul 4 vengono rimossi entrambi, poiché 9 + 4 = 13. Se quel 4 era l'unica carta appoggiata su un 6 nella fila sopra, e anche la sua vicina sotto il 6 è già sparita, il 6 diventa scoperto e può a sua volta essere abbinato - per esempio con un 7 in cima agli scarti. Rimuovere le carte in questo modo apre via via le file superiori finché, idealmente, l'intera piramide non scompare.",
    pyramidsolitaire_rules_end_title: "Concludere una partita",
    pyramidsolitaire_term_win: "Vittoria",
    pyramidsolitaire_rules_win: "La partita è vinta nel momento in cui tutte le 28 carte della piramide sono state rimosse - il tallone e gli scarti non devono essere svuotati anch'essi, che è la condizione di vittoria standard usata dalla maggior parte delle versioni di questo gioco.",
    pyramidsolitaire_term_lose: "Rimanere bloccati",
    pyramidsolitaire_rules_lose: "Se il tallone è vuoto, non restano rimescolamenti, e non è disponibile né un Re né una coppia che sommi 13 tra le carte scoperte della piramide e la carta in cima agli scarti, la partita finisce in sconfitta - PaperGames lo mostra chiaramente invece di lasciarti bloccato senza mosse né spiegazioni.",
    pyramidsolitaire_history_title: "La storia di Piramide Solitario",
    pyramidsolitaire_history_origins_title: "Un gioco più antico, poco documentato",
    pyramidsolitaire_history_origins_p1: "Piramide appartiene alla stessa grande famiglia di giochi di carte \"di pazienza\" per un giocatore solo a cui appartengono Klondike e FreeCell, gran parte dei quali si diffusero in Europa e Nord America durante il XIX secolo e l'inizio del XX sotto vari nomi regionali e con piccole varianti di regole. Come per la maggior parte dei solitari classici, l'origine esatta di Piramide - chi per primo dispose 28 carte in un triangolo e iniziò ad abbinarle a 13 - non è riconducibile a un'unica fonte o data documentata.",
    pyramidsolitaire_history_origins_p2: "Ciò che è chiaro è cosa lo distingue dal resto della famiglia: mentre Klondike, FreeCell e Spider riguardano tutti, in fondo, la costruzione di sequenze decrescenti di carte, il meccanismo distintivo di Piramide è aritmetico - rimuovere coppie i cui valori sommano esattamente 13, oltre al Re solitario che vale già 13 da sé. Questa regola dell'abbinamento a 13 è l'elemento storicamente più distintivo di questo gioco, e il modo più chiaro per distinguerlo dai suoi cugini costruttori di sequenze.",
    pyramidsolitaire_history_spread_title: "Di nuovo incluso con Windows",
    pyramidsolitaire_history_spread_p1: "Piramide Solitario circolava già da anni nei manuali di riferimento sui giochi di carte e nelle prime raccolte digitali di solitari, ma ha raggiunto un pubblico davvero di massa nello stesso modo in cui lo fece Klondike decenni prima: venendo incluso con Windows. Microsoft lo ha inserito tra i giochi della Microsoft Solitaire Collection, integrata in Windows 8 e versioni successive, accanto a Klondike, Spider e FreeCell.",
    pyramidsolitaire_history_spread_p2: "Per moltissimi giocatori cresciuti con Windows Solitaire inteso specificamente come Klondike, la Solitaire Collection è stata per molti il primo vero incontro con lo stile di solitario basato sugli abbinamenti che Piramide rappresenta - un tipo di rompicapo diverso nascosto sotto lo stesso familiare nome \"Solitario\".",
    pyramidsolitaire_history_modern_title: "Questa versione",
    pyramidsolitaire_history_modern_p1: "PaperGames gioca con il regolamento standard: un mazzo davvero nuovo a ogni partita, tutte le 28 carte della piramide distribuite scoperte fin dall'inizio, un tallone/scarti a pesca singola con fino a 2 rimescolamenti, e la comune condizione di vittoria \"libera la piramide\" - tallone e scarti non devono essere svuotati anch'essi, proprio come fanno la maggior parte delle implementazioni moderne di questo gioco."
});
I18n.markTextLoaded("it");
