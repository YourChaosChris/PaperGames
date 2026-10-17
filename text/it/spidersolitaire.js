// text/it/spidersolitaire.js
// Rules and history texts of spidersolitaire (it). Loaded by spidersolitaire-rules.html and spidersolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    spidersolitaire_rules_title: "Regole dello Spider Solitario",
    spidersolitaire_rules_intro: "Un rapido riferimento su come PaperGames gioca allo Spider Solitario - utile se sei arrugginito, o se stai imparando.",
    spidersolitaire_rules_basics_title: "L'idea di base",
    spidersolitaire_term_layout: "La disposizione",
    spidersolitaire_rules_layout: "Due mazzi completi (104 carte) vengono distribuiti su 10 colonne di tableau - le prime 4 colonne ricevono 6 carte ciascuna, le altre 6 ricevono 5 carte ciascuna - con solo la carta in cima a ogni colonna scoperta. Non ci sono fondazioni. Le restanti 50 carte formano il tallone, distribuito più avanti in gruppi di 10.",
    spidersolitaire_term_difficulty: "Scegliere una difficoltà",
    spidersolitaire_rules_difficulty: "Prima di iniziare, scegli quanti semi sono in gioco: 1 seme è il più facile (ogni carta del rango giusto può estendere qualsiasi scala), 2 semi è medio, e 4 semi è la versione tradizionale e più difficile - esattamente come due mazzi veri mescolati insieme.",
    spidersolitaire_term_tableau: "Spostare una singola carta",
    spidersolitaire_rules_tableau: "Una carta può spostarsi in una colonna di tableau solo su una carta esattamente di un rango superiore - il seme non conta per questo. Una colonna vuota accetta qualsiasi carta, o qualsiasi scala valida, senza alcuna restrizione di rango.",
    spidersolitaire_term_group: "Spostare un gruppo di carte",
    spidersolitaire_rules_group: "Diverse carte già impilate possono essere spostate insieme come un'unica unità solo se formano già una scala correttamente discendente dello STESSO seme (per esempio un 5-4-3 di Cuori, esattamente in quell'ordine) - spostare una scala che mescola semi, anche se i ranghi scendono correttamente, non è permesso. Spostare un gruppo segue comunque la regola di posizionamento del rango superiore descritta sopra. Non appena le carte si allontanano, la carta appena esposta in cima alla sua colonna si gira automaticamente scoperta.",
    spidersolitaire_term_stock: "Il tallone",
    spidersolitaire_rules_stock: "Tocca il tallone per distribuire il prossimo gruppo di 10 carte, una carta scoperta su ciascuna delle 10 colonne. La distribuzione è bloccata finché una colonna è vuota - svuotala prima (spostando le sue carte altrove o completando una scala al suo interno) prima di poter distribuire di nuovo.",
    spidersolitaire_term_sequences: "Completare una scala",
    spidersolitaire_rules_sequences: "Ogni volta che una scala completa da Re ad Asso, tutte dello stesso seme e in ordine, finisce contigua in una colonna, viene rilevata automaticamente e rimossa - non serve che siano le uniche carte in quella colonna, basta che siano impilate correttamente nel punto in cui si solleverebbero naturalmente insieme. Ogni scala completata aggiunge un punto al contatore sopra il tavoliere.",
    spidersolitaire_rules_end_title: "Finire una partita",
    spidersolitaire_term_win: "Vincere",
    spidersolitaire_rules_win: "La partita è vinta non appena tutte le 8 scale da Re ad Asso sono state assemblate e rimosse - cioè 104 carte / 13, lo stesso totale indipendentemente dalla difficoltà di numero di semi scelta.",
    spidersolitaire_history_title: "La storia dello Spider Solitario",
    spidersolitaire_history_origins_title: "Un favorito non documentato",
    spidersolitaire_history_origins_p1: "A differenza di alcuni giochi di carte con un inventore rintracciabile, l'origine esatta dello Spider Solitario non è documentata con precisione - come molti giochi di pazienza, si è evoluto attraverso il gioco popolare piuttosto che essere attribuito a una singola persona o a un'unica prima pubblicazione. Ciò che è chiaro è che, tra l'inizio e la metà del XX secolo, era già un favorito ben consolidato tra la famiglia dei giochi di pazienza a due mazzi giocati su carta e feltro molto prima che esistessero i computer.",
    spidersolitaire_history_origins_p2: "Il suo nome allude quasi certamente alla propria difficoltà e struttura piuttosto che a qualsiasi immagine di ragno sulle carte: otto scale simili a fondazioni da tessere insieme (a eco delle otto zampe di un ragno) a partire da dieci colonne di tableau molto estese, senza alcun aiuto di colore o di fondazione per seme una volta che sono in gioco quattro semi.",
    spidersolitaire_history_spread_title: "Incluso con Windows",
    spidersolitaire_history_spread_p1: "Il momento più famoso della popolarizzazione di massa dello Spider Solitario arrivò nel 1998, quando Microsoft lo incluse come gioco integrato in Windows - apparendo prima nel pacchetto Windows 98 Plus! e nell'era di Windows Me, per poi diventare un'inclusione standard a partire da Windows XP.",
    spidersolitaire_history_spread_p2: "Quella singola decisione fece conoscere Spider a un enorme pubblico globale, proprio come Windows aveva già fatto prima per il Klondike (chiamato semplicemente «Solitario») e poi per il FreeCell - trasformando un gioco di carte che era vissuto tranquillamente sui tavoli da gioco fisici per decenni in uno dei software più giocati al mondo, senza che i suoi giocatori dovessero mai possedere un vero mazzo di carte.",
    spidersolitaire_history_modern_title: "Questa versione",
    spidersolitaire_history_modern_p1: "PaperGames gioca con le regole standard con tutte e tre le tradizionali difficoltà di numero di semi selezionabili fin dall'inizio - 1 seme, 2 semi, o il gioco completo a 4 semi - lo stesso approccio a bassa frizione e mazzo davvero nuovo a ogni partita già usato dal Klondike e dal FreeCell di questa raccolta, adattato alla disposizione a dieci colonne senza fondazioni propria dello Spider."
});
I18n.markTextLoaded("it");
