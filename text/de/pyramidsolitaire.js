// text/de/pyramidsolitaire.js
// Rules and history texts of pyramidsolitaire (de). Loaded by pyramidsolitaire-rules.html and pyramidsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    pyramidsolitaire_rules_title: "Pyramide-Solitaire-Regeln",
    pyramidsolitaire_rules_intro: "Eine kurze Übersicht darüber, wie PaperGames Pyramide-Solitaire spielt – nützlich, wenn man aus der Übung ist oder es gerade lernt.",
    pyramidsolitaire_rules_basics_title: "Die Grundidee",
    pyramidsolitaire_term_layout: "Das Layout",
    pyramidsolitaire_rules_layout: "28 Karten werden offen in ein Dreieck aus 7 Reihen ausgeteilt: 1 Karte oben, darunter 2, und so weiter bis zu 7 Karten in der untersten Reihe, wobei jede Karte oberhalb und zwischen den zwei Karten darunter liegt. Die restlichen 24 Karten bilden den Nachziehstapel, von dem eine Karte nach der anderen offen auf den Ablagestapel gezogen wird.",
    pyramidsolitaire_term_pairing: "Paare auf 13",
    pyramidsolitaire_rules_pairing: "Karten zählen dabei nach ihrem Nennwert: Ass = 1, 2 bis 10 wie aufgedruckt, Bube = 11, Dame = 12, König = 13. Entferne zwei verfügbare Karten, deren Werte zusammen genau 13 ergeben - zum Beispiel eine 5 und eine 8, eine 9 und eine 4, oder ein Bube (11) und eine 2. Ein König zählt allein schon 13, wird also ohne Partner entfernt.",
    pyramidsolitaire_term_exposed: "Freiliegende Karten",
    pyramidsolitaire_rules_exposed: "Eine Karte in der Pyramide kann erst aufgenommen werden, wenn beide Karten, die in der Reihe darunter auf ihr liegen, verschwunden sind - die unterste Reihe liegt von Anfang an frei, da nichts darunter ist. Nur die freiliegenden Karten der Pyramide und die oberste Karte des Ablagestapels können entfernt werden; eine verdeckte Pyramidenkarte wird abgeblendet dargestellt und kann noch nicht aufgenommen werden, auch wenn du erkennen kannst, welche Karte es ist.",
    pyramidsolitaire_term_stock: "Nachziehstapel, Ablagestapel und Neuverteilungen",
    pyramidsolitaire_rules_stock: "Tippe den Nachziehstapel an, um seine oberste Karte offen auf den Ablagestapel zu legen, eine Karte nach der anderen - nur die oberste Karte des Ablagestapels lässt sich paaren. Ist der Nachziehstapel leer, verteilt ein weiteres Antippen den gesamten Ablagestapel neu in den Nachziehstapel, sodass du ihn erneut durchgehen kannst, bis zu 2 Mal pro Spiel. Die verbleibende Anzahl an Neuverteilungen wird immer neben dem Nachziehstapel angezeigt.",
    pyramidsolitaire_rules_example_title: "Ein durchgerechnetes Beispiel",
    pyramidsolitaire_term_example: "Ein Paar entfernen",
    pyramidsolitaire_rules_example: "Angenommen, in der untersten Reihe liegt eine freie 9, und anderswo in der Pyramide eine freie 4 - klickst du erst die 9 und dann die 4 an, werden beide entfernt, da 9 + 4 = 13. War diese 4 die einzige Karte, die auf einer 6 in der Reihe darüber lag, und ist auch die Nachbarkarte unter der 6 bereits verschwunden, wird die 6 nun frei und kann ebenfalls gepaart werden - etwa mit einer 7 oben auf dem Ablagestapel. So werden nach und nach die Reihen darüber freigelegt, im Idealfall bis die ganze Pyramide verschwunden ist.",
    pyramidsolitaire_rules_end_title: "Eine Partie abschließen",
    pyramidsolitaire_term_win: "Gewinnen",
    pyramidsolitaire_rules_win: "Das Spiel ist gewonnen, sobald alle 28 Pyramidenkarten entfernt sind - der Nachzieh- und der Ablagestapel müssen dafür nicht geleert werden, das ist die Standard-Gewinnbedingung, die die meisten Versionen dieses Spiels verwenden.",
    pyramidsolitaire_term_lose: "Festgefahren",
    pyramidsolitaire_rules_lose: "Ist der Nachziehstapel leer, sind keine Neuverteilungen mehr übrig, und gibt es weder einen König noch ein Paar auf 13 unter den freiliegenden Pyramidenkarten und der obersten Karte des Ablagestapels, ist das Spiel als Niederlage beendet - PaperGames zeigt das deutlich an, statt dich ohne Erklärung ohne Zug dastehen zu lassen.",
    pyramidsolitaire_history_title: "Die Geschichte von Pyramide-Solitaire",
    pyramidsolitaire_history_origins_title: "Ein älteres, kaum dokumentiertes Spiel",
    pyramidsolitaire_history_origins_p1: "Pyramide gehört zur selben großen Familie einspieliger \"Patience\"-Kartenspiele wie Klondike und FreeCell, von denen sich die meisten im 19. und frühen 20. Jahrhundert in Europa und Nordamerika unter verschiedenen regionalen Namen und mit kleineren Regelunterschieden verbreiteten. Wie bei den meisten klassischen Patience-Spielen lässt sich auch bei Pyramide der genaue Ursprung - wer als Erstes 28 Karten zu einem Dreieck auslegte und begann, sie auf 13 zu paaren - nicht auf eine einzelne dokumentierte Quelle oder ein Datum zurückführen.",
    pyramidsolitaire_history_origins_p2: "Klar ist dagegen, was es vom Rest der Familie unterscheidet: Während es bei Klondike, FreeCell und Spider im Kern immer darum geht, absteigende Kartenfolgen aufzubauen, ist Pyramides bestimmendes Prinzip ein rechnerisches - das Entfernen von Paaren, deren Werte sich genau zu 13 summieren, sowie des einzelnen Königs, der bereits für sich allein 13 zählt. Diese Paarregel auf 13 ist das historisch auffälligste Merkmal dieses Spiels und der klarste Weg, es von seinen folgenaufbauenden Verwandten zu unterscheiden.",
    pyramidsolitaire_history_spread_title: "Wieder mit Windows ausgeliefert",
    pyramidsolitaire_history_spread_p1: "Pyramide-Solitaire kursierte schon jahrelang in gedruckten Kartenspiel-Nachschlagewerken und frühen digitalen Solitaire-Sammlungen, erreichte aber ein wirklich breites Publikum auf dieselbe Weise wie Jahrzehnte zuvor Klondike: durch die Auslieferung mit Windows. Microsoft nahm es als eines der Spiele in die Microsoft Solitaire Collection auf, die fest in Windows 8 und später integriert ist, neben Klondike, Spider und FreeCell.",
    pyramidsolitaire_history_spread_p2: "Für sehr viele Spieler, die mit Windows Solitaire aufwuchsen und darunter speziell Klondike verstanden, war die Solitaire Collection die erste echte Begegnung mit dem paarungsbasierten Patience-Stil, den Pyramide vertritt - ein völlig anderes Rätsel unter demselben vertrauten Namen \"Solitaire\".",
    pyramidsolitaire_history_modern_title: "Diese Version",
    pyramidsolitaire_history_modern_p1: "PaperGames spielt das Standardregelwerk: eine frische Mischung bei jeder Partie, alle 28 Pyramidenkarten von Anfang an offen ausgeteilt, ein Nachzieh-/Ablagestapel mit Einzelziehen und bis zu 2 Neuverteilungen sowie die verbreitete Gewinnbedingung \"Pyramide leeren\" - Nachzieh- und Ablagestapel müssen dafür nicht geleert werden, so wie es die meisten modernen Umsetzungen dieses Spiels handhaben."
});
I18n.markTextLoaded("de");
