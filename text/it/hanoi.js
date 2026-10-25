// text/it/hanoi.js
// Rules and history texts of hanoi (it). Loaded by hanoi-rules.html and hanoi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.it, {
    hanoi_rules_title: "Regole della Torre di Hanoi",
    hanoi_rules_intro: "Una torre di dischi, il più piccolo in cima, sta sul paletto di sinistra. Spostala sul paletto di destra.",
    hanoi_rules_basics_title: "Le regole",
    hanoi_term_move: "Una mossa",
    hanoi_rules_move: "Tocca un paletto: prendi il disco in cima (il paletto riceve una cornice spessa). Tocca un paletto per appoggiarvi il disco. Tocca di nuovo lo stesso paletto per rimetterlo giù.",
    hanoi_term_rule: "La regola",
    hanoi_rules_rule: "Si muove solo il disco in cima a un paletto, e non può mai stare su un disco più piccolo. Una mossa così viene rifiutata e nulla si muove.",
    hanoi_term_goal: "L’obiettivo",
    hanoi_rules_goal: "Tutta la torre sul paletto di destra (segnato con una stella). Il minimo di mosse è 2 elevato al numero di dischi, meno 1: 7 con 3 dischi, 15 con 4, 255 con 8.",
    hanoi_term_help: "Annulla e suggerimento",
    hanoi_rules_help: "Annulla toglie mosse. Il suggerimento dà a due paletti una doppia cornice: sposta il disco in cima dal primo al secondo – è la mossa successiva di una via più breve dalla posizione in cui ti trovi.",
    hanoi_history_title: "La storia della Torre di Hanoi",
    hanoi_history_lucas_title: "Édouard Lucas, 1883",
    hanoi_history_lucas_p1: "Il matematico francese Édouard Lucas presentò il rompicapo nel 1883 come un gioco trovato, a suo dire, da un certo «N. Claus (de Siam)» – le lettere di «Lucas d'Amiens» in un altro ordine. Nel 1889 lo pubblicò come opuscolo.",
    hanoi_history_legend_title: "Una leggenda inventata",
    hanoi_history_legend_p1: "L’opuscolo raccontava di sacerdoti in un tempio di Benares che spostano una torre di 64 dischi d’oro; quando avranno finito, il mondo finirà. La leggenda faceva parte della storia del gioco, non della storia vera.",
    hanoi_history_math_title: "Il minimo di mosse",
    hanoi_history_math_p1: "Spostare n dischi richiede almeno 2^n − 1 mosse: prima gli n − 1 dischi più piccoli sul paletto centrale, poi il più grande sull’arrivo, poi i più piccoli sopra. Con 64 dischi e una mossa al secondo ci vorrebbe molto più dell’età dell’universo."
});
I18n.markTextLoaded("it");
