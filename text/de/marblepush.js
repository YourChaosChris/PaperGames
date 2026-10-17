// text/de/marblepush.js
// Rules and history texts of marblepush (de). Loaded by marblepush-rules.html and marblepush-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    marblepush_rules_title: "Kugelschub-Regeln",
    marblepush_rules_intro: "Eine kurze Übersicht darüber, wie PaperGames Kugelschub spielt – nützlich, wenn du aus der Übung bist oder es gerade lernst.",
    marblepush_rules_basics_title: "Die Grundidee",
    marblepush_term_board: "Das Spielbrett",
    marblepush_rules_board: "Ein Sechseck aus 61 Feldern, angeordnet in Reihen von 5, 6, 7, 8, 9, 8, 7, 6, 5. Jeder Spieler startet mit 14 Kugeln: die beiden nächstgelegenen Reihen vollständig gefüllt sowie die mittleren 3 Felder der nächsten Reihe. Schwarz beginnt.",
    marblepush_term_move: "Eine einzelne Kugel bewegen",
    marblepush_rules_single: "Wähle eine Kugel aus und ziehe sie auf ein beliebiges angrenzendes freies Feld.",
    marblepush_term_line: "Eine Reihe bewegen",
    marblepush_rules_line: "Wähle 2 oder 3 eigene Kugeln aus, die in einer geraden, ununterbrochenen Reihe stehen, und bewege die gesamte Reihe einen Schritt in eine der 6 Richtungen des Bretts. Es gibt zwei Arten von Reihenzügen, die unten beschrieben werden.",
    marblepush_term_broadside: "Seitwärtszug",
    marblepush_rules_broadside: "Die Reihe zieht seitwärts, quer zu ihrer eigenen Achse. Jedes Feld, auf das die Reihe zieht, muss leer sein - ein Seitwärtszug kann niemals etwas verdrängen.",
    marblepush_term_inline: "Zug entlang der Achse",
    marblepush_rules_inline: "Die Reihe bewegt sich entlang ihrer eigenen Achse, in die Richtung, in die eines ihrer beiden Enden zeigt. Ist das Feld direkt davor leer, gleitet die gesamte Reihe einfach vorwärts.",
    marblepush_term_sumito: "Der Schub",
    marblepush_rules_sumito: "Befinden sich auf dem Feld direkt vor einem Achsenzug gegnerische Kugeln, darfst du sie verdrängen - aber nur, wenn deine Reihe strikt länger ist als die zusammenhängende gegnerische Reihe, die den Weg blockiert (3 Kugeln können 1 oder 2 verdrängen, 2 Kugeln können 1 verdrängen; 1 Kugel kann nie verdrängen). Außerdem muss Platz zum Verdrängen vorhanden sein: entweder ein freies Feld direkt hinter der gegnerischen Reihe oder der Rand des Bretts. Läuft die gegnerische Reihe über den Rand des Bretts hinaus, wird ihre letzte Kugel eliminiert - so erzielt man Punkte.",
    marblepush_rules_example_title: "Beispiel: 3 Kugeln schieben 1",
    marblepush_rules_example_intro: "Im kleinen Diagramm unten ist ● Schwarz und ○ Weiß. Schwarz hat 3 Kugeln in einer Reihe (A, B, C), die einer einzelnen weißen Kugel (D) gegenüberstehen, mit einem freien Feld (E) - oder dem Rand des Bretts - direkt dahinter.",
    marblepush_rules_example_caption: "Schwarz' Dreierreihe (A, B, C) ist der einzelnen weißen Kugel (D) zahlenmäßig überlegen, und Feld E ist leer - also darf Schwarz verdrängen: Die gesamte Reihe rückt einen Schritt vor, D wird nach E geschoben, und Schwarz' Reihe belegt danach B, C und das frühere Feld von D. Wäre E stattdessen der Rand des Bretts, würde D vollständig eliminiert.",
    marblepush_rules_end_title: "Wie ein Spiel endet",
    marblepush_term_win: "Sieg",
    marblepush_rules_win: "Wer als Erster 6 gegnerische Kugeln vom Brett verdrängt hat, gewinnt.",
    marblepush_term_resignation: "Aufgabe",
    marblepush_rules_resignation: "Ein Spieler kann jederzeit aufgeben, wodurch das Spiel sofort zugunsten des Gegners endet.",
    marblepush_history_title: "Die Geschichte von Kugelschub",
    marblepush_history_origins_title: "Schiebespiele auf sechseckigen Brettern",
    marblepush_history_origins_p1: "Spiele, in denen Figuren geschoben statt übersprungen oder auf ihrem Feld geschlagen werden, haben eine lange Tradition, und sechseckige Bretter ebenso: Jedes Feld hat sechs Nachbarn statt vier. Das gibt jeder Figur mehr Richtungen und vermeidet die umständlichen Diagonalen eines quadratischen Gitters.",
    marblepush_history_origins_p2: "Kugelschub gehört zu dieser Familie. Die Kugeln sind schlicht und alle gleich, und das ganze Spiel beruht auf einem einzigen Gedanken: Eine längere Reihe von Kugeln kann eine kürzere schieben.",
    marblepush_history_award_title: "Eine Regel, viel Tiefe",
    marblepush_history_award_p1: "Weil eine Kugel nur verloren geht, wenn eine echt längere Reihe sie vom Brett schiebt, ist nichts wichtiger, als die Kugeln in festen Gruppen zusammenzuhalten. Eine einzelne Kugel kann nie schieben, und eine Gruppe am Rand ist immer in Gefahr.",
    marblepush_history_award_p2: "So wird jede Partie zu einem zähen Kampf um die Brettmitte: Wer die Mitte hält, kann in alle Richtungen nach außen schieben, während die andere Seite an den Rand gedrängt wird.",
    marblepush_history_legacy_title: "Ein Spiel ohne Glück",
    marblepush_history_legacy_p1: "Es gibt keine Würfel, keine verdeckten Informationen und keine besonderen Figuren – nur zwei Sätze gleicher Kugeln und ein paar einfache Regeln, welche Reihe welche schieben darf. Damit ist es eine reine Prüfung des Planens, ganz im Geist älterer Denkspiele wie Go und Dame."
});
I18n.markTextLoaded("de");
