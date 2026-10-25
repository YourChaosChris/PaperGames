// text/it/klondike.js
// Rules and history texts of klondike (it). Loaded by klondike-rules.html and klondike-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    klondike_rules_title: "Regole del Klondike",
    klondike_rules_intro: "Un rapido promemoria di come PaperGames gioca a Klondike - utile se sei arrugginito, o se lo stai imparando.",
    klondike_rules_basics_title: "L'idea di base",
    klondike_term_layout: "La disposizione",
    klondike_rules_layout: "Le carte vengono distribuite in 7 colonne di tableau da 1 a 7 carte ciascuna, con solo la carta in cima a ogni colonna scoperta. Quattro basi (una per seme) si costruiscono dall'Asso al Re. Il resto del mazzo forma il tallone, da cui si pesca una carta alla volta verso gli scarti.",
    klondike_term_tableau: "Spostare le carte",
    klondike_rules_tableau: "Una carta può essere spostata su una colonna del tableau solo su una carta esattamente un valore più alto e di colore opposto, oppure su una colonna vuota, che accetta solo un Re. Una sequenza di più carte già impilate scoperte in quello stesso ordine decrescente e alternato può essere spostata insieme come un'unica unità verso una destinazione valida.",
    klondike_term_foundation: "Basi",
    klondike_rules_foundation: "Una base accetta solo il proprio seme, iniziando dall'Asso e salendo di un valore alla volta. Una volta che una carta è su una base vi resta - le basi ricevono solo carte, non le restituiscono mai al tableau.",
    klondike_term_stock: "Il tallone e gli scarti",
    klondike_rules_stock: "Tocca il tallone per girare la sua carta in cima scoperta sugli scarti, una carta alla volta. Quando il tallone si esaurisce, toccarlo di nuovo rimescola tutti gli scarti di nuovo nel tallone così puoi ripercorrerlo - PaperGames non limita quante volte puoi ripescare.",
    klondike_rules_end_title: "Concludere una partita",
    klondike_term_win: "Vittoria",
    klondike_rules_win: "La partita è vinta nel momento in cui tutte e quattro le basi sono complete, dall'Asso al Re. Non tutti i mescolamenti sono vincibili - a differenza del FreeCell, una partita di Klondike può davvero diventare irrisolvibile a metà, dato che all'inizio è visibile solo la carta in cima a ogni colonna.",
    klondike_history_title: "La storia del Klondike",
    klondike_history_origins_title: "Un nome dalla corsa all'oro - forse",
    klondike_history_origins_p1: "Il Klondike appartiene a una vasta famiglia di giochi di carte \"di pazienza\" per un giocatore diffusisi in Europa e Nord America nel corso dell'Ottocento, la maggior parte dei quali richiede solo un mazzo standard e una superficie piana. Il regolamento specifico giocato oggi - sette colonne di tableau a cascata, quattro basi costruite per seme, un tallone e degli scarti da percorrere - compare per la prima volta descritto in libri di giochi di carte dei primi anni del Novecento e da allora è stato chiamato con vari nomi.",
    klondike_history_origins_p2: "Come sia arrivato esattamente a chiamarsi \"Klondike\" resta davvero incerto. La storia più ripetuta lega il nome alla corsa all'oro del Klondike di fine anni 1890, con l'idea che i cercatori d'oro diretti verso lo Yukon, o che vi svernavano, ci giocassero per passare il tempo - un'origine pittoresca e plausibile che, come molte etimologie dei giochi di carte, non è mai stata ricondotta a un primo uso documentato. PaperGames la riporta qui come il racconto popolare, non come storia accertata.",
    klondike_history_spread_title: "Incluso con Windows",
    klondike_history_spread_p1: "La schiacciante popolarità odierna del Klondike deve meno alle sue origini ottocentesche al tavolo da gioco che a un software ben preciso: Microsoft incluse una versione, chiamata semplicemente \"Solitario\", con Windows 3.0 nel 1990 - a quanto si dice, in parte per insegnare dolcemente a una nuova generazione di utenti Windows a fare clic e a trascinare con il mouse.",
    klondike_history_spread_p2: "Ha funzionato quasi troppo bene: nel giro di pochi anni il Solitario di Windows si guadagnò la fama di uno dei programmi più usati al mondo, installato praticamente su ogni PC venduto con Windows, che il proprietario avesse mai intenzione di aprire un gioco o no. Ha ridefinito cosa significasse \"solitario\" per milioni di persone che non avevano mai giocato una sola partita fisica di carte con quel nome.",
    klondike_history_modern_title: "Questa versione",
    klondike_history_modern_p1: "PaperGames gioca con il regolamento classico a pesca singola e senza limiti di rimescolamento, privilegiando la versione meno macchinosa delle regole proprio come il FreeCell di questa raccolta - un mazzo davvero nuovo a ogni partita invece di un insieme fisso di mani numerate, e nessun limite a quante volte puoi ripercorrere il tallone."
});
I18n.markTextLoaded("it");
