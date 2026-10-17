// text/de/twenty48.js
// Rules and history texts of twenty48 (de). Loaded by twenty48-rules.html and twenty48-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    twenty48_rules_title: "2048-Regeln",
    twenty48_rules_intro: "Eine kurze Übersicht darüber, wie PaperGames 2048 spielt – nützlich, wenn man aus der Übung ist oder es gerade lernt.",
    twenty48_rules_basics_title: "Die Grundidee",
    twenty48_term_board: "Das Brett und das Verschieben",
    twenty48_rules_board: "Jeder Zug schiebt alle Kacheln auf dem 4x4-Brett so weit wie möglich in eine Richtung – hoch, runter, links oder rechts. Nach jedem Zug, der tatsächlich etwas verschoben hat, erscheint eine neue Kachel (meist eine 2, gelegentlich eine 4) auf einem zufälligen leeren Feld.",
    twenty48_term_merging: "Verschmelzen",
    twenty48_rules_merging: "Wenn beim Verschieben zwei Kacheln mit demselben Wert zusammenstoßen, verschmelzen sie zu einer Kachel mit ihrer Summe, die dem Punktestand hinzugefügt wird. Jede Kachel kann pro Zug nur einmal verschmelzen – drei gleiche Kacheln, die zusammen verschoben werden, verschmelzen also nur das vorderste Paar und lassen die dritte Kachel unverändert, statt zu kaskadieren.",
    twenty48_rules_end_title: "Wie eine Partie endet",
    twenty48_term_win: "2048 erreichen",
    twenty48_rules_win: "Verschmilzt man sich bis zu einer 2048er-Kachel hoch, hat man gewonnen – die Partie endet damit aber nicht. Man kann danach weiterspielen, um den Punktestand (und das Brett) noch weiter zu treiben.",
    twenty48_term_loss: "Keine Züge mehr",
    twenty48_rules_loss: "Die Partie endet in dem Moment, in dem das Brett vollständig gefüllt ist und keine zwei benachbarten Kacheln denselben Wert teilen, sodass kein Zug – in keine Richtung – mehr etwas verändern könnte.",
    twenty48_history_title: "Die Geschichte von 2048",
    twenty48_history_origins_title: "Aufgebaut auf Threes",
    twenty48_history_origins_p1: "2048 wurde im März 2014 vom damals 19-jährigen italienischen Entwickler Gabriele Cirulli an einem einzigen Wochenende geschaffen, als persönliche Übung, schnell ein vollständiges Spiel zu bauen. Er erfand die Kernmechanik nicht von Grund auf: 2048 ist ein ausdrücklicher Klon eines Spiels namens 1024 (von Veewo Studio), das seinerseits von einem früheren Spiel namens Threes! (von Asher Vollmer, Greg Wohlwend und Jimmy Hinson) inspiriert war, das über ein Jahr sorgfältig entwickelt worden war.",
    twenty48_history_origins_p2: "Cirulli veröffentlichte den Quellcode von 2048 von Anfang an kostenlos unter einer offenen Lizenz, was sich als enorm bedeutsam erwies: Statt Klone zu unterbinden, lud er geradezu dazu ein – das Spiel verbreitete sich dadurch, dass es endlos und legal nachgebaut statt nur gespielt wurde.",
    twenty48_history_spread_title: "Eine virale, vielfach geklonte Sensation",
    twenty48_history_spread_p1: "Das Spiel wurde innerhalb weniger Tage nach Veröffentlichung viral und soll in den ersten zwei Wochen Millionen von Spielern angezogen haben, was eine gewaltige Welle von Klonen, Ports und Varianten auslöste – umgestaltete Versionen mit allem von Emojis bis zu Popkultur-Figuren, dazu Größenvarianten, Varianten mit farbigen Kacheln und dreidimensionale Versionen.",
    twenty48_history_spread_p2: "Diese PaperGames-Version behält bewusst das ursprüngliche 4x4-Brett und die 90/10-Spawn-Rate für Zweier und Vierer bei, statt eine dieser Varianten zu übernehmen – dieselbe Entscheidung, die diese Sammlung überall sonst trifft: dem Standard-Regelwerk den Vorzug vor einer neuartigen Abwandlung zu geben.",
    twenty48_history_modern_title: "Ein kleines Brett, ernsthaft erforscht",
    twenty48_history_modern_p1: "Trotz seiner einfachen Regeln erweist sich optimales 2048-Spiel wegen der Zufälligkeit beim Erscheinen neuer Kacheln als ein wirklich schwieriges Suchproblem: starke Computerspieler verwenden Expectimax-Suche (die Züge gegen die Wahrscheinlichkeit jeder möglichen nächsten Kachel abwägt) statt der einfachen Minimax-Suche, die ein deterministisches Spiel wie Schach erlaubt.",
    twenty48_history_modern_p2: "Die dokumentiert besten Computerspieler erreichen mit hoher Wahrscheinlichkeit die Kachel 32768 und haben gelegentlich sogar 65536 erreicht – zwei Verdopplungen jenseits der Kachel, die die meisten menschlichen Spieler schon einmal zu sehen als Triumph empfinden."
});
I18n.markTextLoaded("de");
