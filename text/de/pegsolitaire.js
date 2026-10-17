// text/de/pegsolitaire.js
// Rules and history texts of pegsolitaire (de). Loaded by pegsolitaire-rules.html and pegsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    pegsolitaire_rules_title: "Solitär-Regeln",
    pegsolitaire_rules_intro: "Eine kurze Übersicht darüber, wie PaperGames Solitär (Peg Solitaire) spielt – nützlich, wenn man aus der Übung ist oder es gerade lernt.",
    pegsolitaire_rules_basics_title: "Die Grundidee",
    pegsolitaire_term_board: "Das Brett und die Startaufstellung",
    pegsolitaire_rules_board: "Vor der Partie wählst du das Brett; voreingestellt ist das englische (33 Felder). Jedes Loch beginnt mit einem Stift gefüllt, bis auf eines – welches, steht für jedes Brett unter „Die Bretter“.",
    pegsolitaire_term_jump: "Springen",
    pegsolitaire_rules_jump: "Einen Stift auswählen und dann ein leeres Loch zwei Felder entfernt in gerader Linie (hoch, runter, links oder rechts – nie diagonal) wählen, wobei direkt dazwischen ein weiterer Stift steht. Der Stift springt ins leere Loch, und der übersprungene Stift wird vom Brett entfernt. Ausnahme: Auf dem Dreiecksbrett darf zusätzlich schräg gesprungen werden, entlang seiner schrägen Linien.",
    pegsolitaire_rules_end_title: "Eine Partie abschließen",
    pegsolitaire_term_win: "Gelöst",
    pegsolitaire_rules_win: "Das klassische Ziel ist, sich bis auf einen einzigen übrig bleibenden Stift durchzuspringen. Die Partie endet auch unlösbar, sobald kein legaler Sprung mehr möglich ist, egal wie viele Stifte noch auf dem Brett sind.",
    pegsolitaire_rules_boards_title: "Die Bretter",
    pegsolitaire_rules_boards: "Englisch: ein 7x7-Raster ohne die vier 2x2-Ecken, 33 Felder; die Mitte ist leer. Europäisch: ein 7x7-Raster, an jeder Ecke sind nur drei Felder abgeschnitten, 37 Felder; leer ist das Loch direkt über der Mitte, denn von der Mitte aus ist es nicht lösbar. Deutsch (J. C. Wiegleb, 1779): ein 9x9-Raster ohne die vier 3x3-Ecken, 45 Felder; die Mitte ist leer. Quadrat: das volle 6x6-Raster, 36 Felder; leer ist das obere linke der vier mittleren Löcher. Große Raute: eine Raute aus 41 Feldern auf einem 9x9-Raster; leer ist das Loch zwei Reihen über der Mitte – auf diesem Brett sind überhaupt nur sehr wenige Startlöcher lösbar. Dreieck: fünf Reihen mit 1 bis 5 Löchern, jede Reihe um ein halbes Loch versetzt, 15 Felder; leer ist das obere linke der drei Löcher in der Mitte. Auf allen Brettern mit quadratischem Raster wird nur waagerecht und senkrecht gesprungen, nie diagonal. Nur auf dem Dreieck darf zusätzlich schräg gesprungen werden, entlang seiner schrägen Linien – insgesamt in sechs Richtungen.",
    pegsolitaire_history_title: "Die Geschichte von Solitär (Peg Solitaire)",
    pegsolitaire_history_origins_title: "Ein französisches Hofspiel",
    pegsolitaire_history_origins_p1: "Der früheste gesicherte Beleg für Peg Solitaire stammt aus dem Frankreich des späten 17. Jahrhunderts, wo das Spiel auf einem Stich von 1697 erscheint und am Hof Ludwigs XIV. offenbar beliebt genug war, um in zeitgenössischen Schriften erwähnt zu werden. Eine populäre Legende schreibt seine Erfindung einem Adligen zu, der allein auf einer Insel gefangen war – eine reizvolle Geschichte ohne jeden Beleg, fast sicher erst im Nachhinein erfunden, um dem Spiel einen romantischeren Ursprung zu geben.",
    pegsolitaire_history_origins_p2: "Das in Frankreich zum Standard gewordene Brett hat 37 Löcher (vier zusätzliche Ecken am schlichten Kreuz), während die nach England verbreitete Version – das hier verwendete 33-Loch-Kreuz – im englischsprachigen Raum zum gebräuchlicheren Standard wurde und sich im 19. Jahrhundert in Großbritannien durchsetzte.",
    pegsolitaire_history_spread_title: "Ein Spielprinzip, viele Formen",
    pegsolitaire_history_spread_p1: "Neben dem klassischen Kreuz wurden Solitär-Bretter auch in Dreiecksform (mit einer eigenen 15-Stift-Version, jahrzehntelang fester Bestandteil amerikanischer Restauranttische), Rautenform und weiteren Anordnungen gebaut – die Sprungregel bleibt dabei immer dieselbe, ganz gleich, in welcher Form die Löcher angeordnet sind.",
    pegsolitaire_history_wiegleb: "Ein größeres Kreuz mit 45 Feldern auf einem 9x9-Raster beschrieb J. C. Wiegleb 1779 in seinem Buch „Unterricht in der natürlichen Magie“.",
    pegsolitaire_history_spread_p2: "Da jeder Zug genau einen Stift entfernt, braucht eine vollständige Partie von n Stiften bis zu einem einzigen immer genau n-1 Sprünge – eines der wenigen Brettspiele, bei denen die Zuganzahl einer gewonnenen Partie von vornherein feststeht, unabhängig davon, welche konkrete Sprungfolge dorthin führt.",
    pegsolitaire_history_modern_title: "Ein gelöstes Rätsel mit einer Pointe",
    pegsolitaire_history_modern_p1: "Peg Solitaire zog ab den 1960er- und 70er-Jahren ernsthafte mathematische Aufmerksamkeit auf sich, als Forscher wie John Conway es mit Werkzeugen wie Widerstandsnetzwerk- und gruppentheoretischen Argumenten analysierten, um genau zu bestimmen, welche letzten Ein-Stift-Positionen von der Standard-Ausgangsstellung aus erreichbar sind – die Mitte ist eine davon, aber bei Weitem nicht die einzige.",
    pegsolitaire_history_modern_p2: "Eine spätere Computersuche klärte die Frage für das 33-Loch-Brett vollständig: Eine Partie, die mit leerer Mitte beginnt, lässt sich immer bis auf einen Stift zu Ende spielen, und die Anzahl grundlegend unterschiedlicher Gewinnpartien wurde exakt berechnet – ein seltener Fall, in dem ein physisches Rätsel zu einem vollständig gelösten kombinatorischen Problem wurde."
});
I18n.markTextLoaded("de");
