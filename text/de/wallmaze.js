// text/de/wallmaze.js
// Rules and history texts of wallmaze (de). Loaded by wallmaze-rules.html and wallmaze-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    wallmaze_rules_title: "Mauerlabyrinth-Regeln",
    wallmaze_rules_intro: "Eine kurze Übersicht, wie PaperGames Mauerlabyrinth spielt – nützlich, wenn man aus der Übung ist oder es gerade lernt.",
    wallmaze_rules_basics_title: "Die Grundidee",
    wallmaze_term_setup: "Der Aufbau",
    wallmaze_rules_setup: "Jeder Spieler hat eine Figur, die in der Mitte der eigenen Brettkante auf einem 9x9-Brett startet, sowie zehn Mauern in Reserve. Spieler 1 strebt die gegenüberliegende Reihe unten an, Spieler 2 die gegenüberliegende Reihe oben – wer seine Figur zuerst dorthin bringt, gewinnt.",
    wallmaze_term_moving: "Die Figur bewegen",
    wallmaze_rules_moving: "Am Zug bewegst du entweder deine Figur ein Feld nach oben, unten, links oder rechts, oder du platzierst eine Mauer. Stehen die beiden Figuren nebeneinander, darfst du direkt über die andere Figur springen; blockiert eine Mauer oder der Spielfeldrand diesen Sprung, darfst du stattdessen diagonal daran vorbeiziehen.",
    wallmaze_term_walls: "Mauern platzieren",
    wallmaze_rules_walls: "Eine Mauer ist zwei Felder lang und blockiert die Bewegung geradewegs darüber, für beide Spieler. Mauern dürfen sich nie überlappen oder eine andere Mauer kreuzen, und eine Mauer darf nie platziert werden, wenn sie den letzten verbleibenden Weg eines Spielers zu seiner Zielreihe versperren würde – es gibt immer mindestens einen Durchgang.",
    wallmaze_rules_end_title: "Das Spiel gewinnen",
    wallmaze_term_win: "Wie das Spiel endet",
    wallmaze_rules_win: "Sobald die Figur eines Spielers ein beliebiges Feld seiner Zielreihe erreicht, gewinnt er – die Spalte spielt keine Rolle.",
    wallmaze_history_title: "Die Geschichte von Mauerlabyrinth",
    wallmaze_history_origins_title: "Ein Design aus den 1990er-Jahren",
    wallmaze_history_origins_p1: "Quoridor wurde von Mirko Marchesi entworfen und 1997 erstmals vom französischen Spieleverlag Gigamic veröffentlicht, wo es rasch zu einem der bekanntesten Titel des Unternehmens neben anderen kompakten abstrakten Zweispielerspielen wurde.",
    wallmaze_history_origins_p2: "Es gehört zu einer größeren Familie von \"Blockade-Labyrinth\"-Spielen, bei denen sich das Brett selbst im Laufe des Spiels verändert, statt fest zu bleiben wie ein Schachbrett – jede Mauer, die ein Spieler platziert, formt die möglichen Wege beider Figuren für den Rest des Spiels dauerhaft um.",
    wallmaze_history_design_title: "Einfache Regeln, echte Tiefe",
    wallmaze_history_design_p1: "Das gesamte Regelwerk passt auf eine einzige Karte – bewege deine Figur oder platziere eine Mauer, erreiche die gegenüberliegende Seite und gewinne – doch die Spannung zwischen Vorwärtsrennen und dem Verzicht auf einen Zug, um stattdessen den Gegner zu blockieren, verleiht ihm echte strategische Tiefe, weshalb es in der Spieldesign-Literatur häufig als Beispiel für elegante Schlichtheit angeführt wird.",
    wallmaze_history_design_p2: "Quoridor wurde auch als informatisches Problem untersucht: Da der Zustandsraum groß, aber gut strukturiert ist (Figurenpositionen plus Mauerplatzierungen, mit einer Wegverbindungs-Regel, die eingehalten werden muss), ist es ein beliebtes Ziel sowohl für klassische suchbasierte KI als auch, in jüngerer Zeit, für Agenten mit bestärkendem Lernen.",
    wallmaze_history_names_title: "Warum ein anderer Name",
    wallmaze_history_names_p1: "Dasselbe Spielprinzip erscheint kommerziell unter dem Namen Quoridor, entworfen 1997 von Mirko Marchesi und veröffentlicht von Gigamic. Quoridor ist eine eingetragene Marke. PaperGames steht in keiner Verbindung zu Gigamic oder zu diesem Spiel und verwendet deshalb den eigenen Namen Mauerlabyrinth.",
    wallmaze_history_version_title: "Diese Version",
    wallmaze_history_version_p1: "PaperGames spielt die Standardregeln auf dem Standard-9x9-Brett mit zehn Mauern pro Spieler. Eine Mauer zu platzieren ist ein eigener kleiner Modus: \"Mauer platzieren\" antippen, irgendwo auf dem Brett antippen, um die nächstgelegene erlaubte Mauer dort in der Vorschau zu sehen, und bestätigen – ein auf einem Touchscreen bewusst großzügiges Ziel, statt eine genaue Stelle treffen zu müssen."
});
I18n.markTextLoaded("de");
