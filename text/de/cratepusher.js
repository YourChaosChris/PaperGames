// text/de/cratepusher.js
// Rules and history texts of cratepusher (de). Loaded by cratepusher-rules.html and cratepusher-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    sudoku_rules_basics_title: "Die Grundidee",
    cratepusher_rules_title: "Kistenschieber-Regeln",
    cratepusher_rules_intro: "So funktioniert Kistenschieber bei PaperGames: ein Rätsel für eine Person, bei dem Kisten in einem kleinen Lagerraum bewegt werden.",
    cratepusher_term_board: "Das Spielfeld",
    cratepusher_rules_board: "Ein rechteckiges Gitter aus Wänden (vollflächig schwarz) und Boden (weiß). Auf dem Boden stehen du (ein gefüllter Kreis), mehrere Kisten (ein Quadrat mit Kreuz) und genau so viele Zielfelder (ein kleines hohles Quadrat). Steht eine Kiste auf einem Zielfeld, wird sie zu einem gefüllten Quadrat.",
    cratepusher_term_move: "Bewegen",
    cratepusher_rules_move: "Du bewegst dich Feld für Feld nach oben, unten, links oder rechts – nie schräg. Durch Wände und Kisten kannst du nicht gehen.",
    cratepusher_rules_move_targets: "Über leere Zielfelder darfst du laufen; blockiert wirst du nur von Wänden und Kisten.",
    cratepusher_rules_hint: "„Tipp“ zeigt dir genau einen Schiebezug: den ersten Zug einer kürzesten Lösung ab deiner jetzigen Stellung. Die Kiste bekommt einen gestrichelten Rahmen, das Feld, auf das sie soll, einen durchgezogenen, und unter dem Brett steht ein Satz mit Zeile, Spalte und Richtung (gezählt ohne die äußere Wand). Der Tipp zeigt den Zug nur – schieben musst du selbst. Für den nächsten tippst du einfach noch einmal auf „Tipp“. Gibt es von deiner Stellung aus keine Lösung mehr, sagt dir der Tipp das. Tipps werden nicht gespeichert und ändern nichts an deiner Statistik.",
    cratepusher_term_push: "Schieben",
    cratepusher_rules_push: "Läufst du gegen eine Kiste, schiebst du sie ein Feld weiter, aber nur, wenn das Feld dahinter frei ist: keine Wand und keine zweite Kiste. Du schiebst immer nur eine Kiste auf einmal, und eine Kiste zu dir zurückziehen kannst du nie.",
    cratepusher_term_goal: "Das Ziel",
    cratepusher_rules_goal: "Das Level ist gelöst, sobald jede Kiste auf einem Zielfeld steht. Welche Kiste auf welchem Zielfeld landet, ist egal.",
    cratepusher_term_stuck: "Festfahren",
    cratepusher_rules_stuck: "Weil Kisten sich nicht ziehen lassen, kann ein unbedachter Schiebezug ein Level unlösbar machen – zum Beispiel eine Kiste, die in eine Ecke geschoben wird, die kein Zielfeld ist. Das Spiel warnt dich, wenn eine Kiste in so einer Ecke festsitzt. Andere Sackgassen werden nicht gemeldet: Denk voraus und nimm mit „Zug zurück“ so oft zurück, wie du willst.",
    cratepusher_term_controls: "Bedienung",
    cratepusher_rules_controls: "Tippe ein Feld neben dir an, um dorthin zu gehen (und eine Kiste, die dort steht, zu schieben). Tippst du ein weiter entferntes Bodenfeld an, läufst du auf dem kürzesten Weg dorthin – aber nur, wenn du dabei keine Kiste schieben musst. Auch die Pfeiltasten und W, A, S, D bewegen dich. „Zug zurück“ nimmt deine Züge einzeln zurück, so viele du willst; „Level neu starten“ beginnt das Level von vorn.",
    cratepusher_term_levels: "Die Level",
    cratepusher_rules_levels: "Jedes Level baut PaperGames selbst, jedes Mal neu: leicht auf einem 7x7-Gitter mit 3 Kisten, mittel auf 9x9 mit 4, schwer auf 10x10 mit 5. Das Programm baut jedes Level rückwärts aus der gelösten Stellung, darum ist es immer lösbar, und prüft es danach noch einmal mit einem eigenen Löser. Wie viele Schiebezüge die beste Lösung braucht, steht über dem Spielfeld, zusammen mit deinen Schritten, deinen Schiebezügen und der Zahl der Kisten, die schon auf einem Zielfeld stehen.",
    cratepusher_history_title: "Die Geschichte von Kistenschieber",
    cratepusher_history_origins_title: "Eine Idee von 1981",
    cratepusher_history_origins_p1: "Das Prinzip, Kisten einzeln auf markierte Plätze zu schieben und nie zu ziehen, hat Hiroyuki Imabayashi 1981 erfunden. 1982 hat die japanische Firma Thinking Rabbit es als Computerspiel unter dem Namen Sokoban veröffentlicht.",
    cratepusher_history_origins_p2: "Hinter den einfachen Regeln steckt echte Tiefe: Schon kleine Räume können lange, sorgfältig geplante Zugfolgen verlangen, und Informatiker haben gezeigt, dass solche Rätsel allgemein sehr schwer zu lösen sind. Die Idee ist seitdem von unzähligen Rätselspielen aufgegriffen worden.",
    cratepusher_history_names_title: "Warum ein anderer Name",
    cratepusher_history_names_p1: "Sokoban ist eine eingetragene Marke von Falcon Co., Ltd. PaperGames steht in keiner Verbindung zu Falcon oder zum ursprünglichen Spiel und benutzt deshalb einen eigenen Namen: Kistenschieber. Genauso wird es bei Calcudoku gehandhabt, das aus demselben Grund unter eigenem Namen gespielt wird.",
    cratepusher_history_names_p2: "Keines der Level hier stammt aus dem ursprünglichen Spiel oder aus einer Levelsammlung. Jedes Level erzeugt das eigene Programm von PaperGames, wenn du eines anforderst – rückwärts aus der gelösten Stellung gebaut und mit einem eigenen Löser geprüft."
});
I18n.markTextLoaded("de");
