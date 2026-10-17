// text/de/kakuro.js
// Rules and history texts of kakuro (de). Loaded by kakuro-rules.html and kakuro-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    kakuro_rules_title: "Kakuro-Regeln",
    kakuro_rules_intro: "Eine kurze Übersicht, wie PaperGames Kakuro spielt - nützlich, wenn du aus der Übung bist oder es gerade lernst. Kakuro wird manchmal als „Kreuzworträtsel mit Zahlen“ beschrieben: Statt Buchstaben trägt jedes weiße Feld eine Ziffer, und statt Wörtern sind die Hinweise Summen.",
    kakuro_rules_basics_title: "Die Grundidee",
    kakuro_term_board: "Das Gitter",
    kakuro_rules_board: "Das Gitter besteht aus schwarzen Hinweisfeldern und weißen, ausfüllbaren Feldern. Jede zusammenhängende Reihe weißer Felder, von links nach rechts oder von oben nach unten gelesen, heißt „Lauf“. Jeder Lauf hat genau einen Hinweis: die Summe, zu der seine Ziffern addiert werden müssen.",
    kakuro_term_clues: "Die Hinweisfelder lesen",
    kakuro_rules_clues: "Ein schwarzes Feld zeigt seine Summe(n) in weißen Ziffern, diagonal geteilt, wenn es zwei trägt: Die Zahl oben rechts ist das Ziel für den Lauf weißer Felder, der direkt rechts davon beginnt (ein „waagerechter“ Hinweis), und die Zahl unten links ist das Ziel für den Lauf, der direkt darunter beginnt (ein „senkrechter“ Hinweis). Ein schwarzes Feld mit nur einem Hinweis zeigt nur diese eine Zahl.",
    kakuro_term_goal: "Das Ziel",
    kakuro_rules_goal: "Fülle jedes weiße Feld mit einer Ziffer von 1 bis 9, sodass die Ziffern jedes Laufs genau seine Summenvorgabe ergeben - und ebenso wichtig: keine Ziffer darf innerhalb desselben Laufs doppelt vorkommen (in einem kreuzenden Lauf darf dieselbe Ziffer wieder auftauchen, nur nicht zweimal im gleichen Lauf).",
    kakuro_term_input: "Zahlen eingeben",
    kakuro_rules_input: "Wähle ein weißes Feld und dann eine Ziffer aus dem Ziffernblock unter dem Spielfeld (oder tippe eine Ziffer auf der Tastatur). Ein Feld mit gestricheltem Rand wiederholt gerade eine Ziffer, die in einem seiner Läufe schon vorkommt, oder gehört zu einem vollständig ausgefüllten Lauf, dessen Summe noch nicht mit dem Hinweis übereinstimmt - das ist der Hinweis, dass etwas geändert werden muss.",
    kakuro_term_difficulty: "Schwierigkeit",
    kakuro_rules_difficulty: "Leicht-, Mittel- und Schwer-Rätsel nutzen zunehmend größere Gitter (7x7, 9x9 und 11x11), was längere Läufe bedeutet, die sich häufiger kreuzen - mehr Ziffern, die gleichzeitig im Kopf jongliert werden müssen, aber durchgehend dieselben zwei Regeln.",
    kakuro_rules_example_title: "Ein durchgerechnetes Beispiel",
    kakuro_term_example: "Zwei sich kreuzende Läufe",
    kakuro_rules_example_p1: "Angenommen, ein waagerechter Lauf aus 2 Feldern hat die Summenvorgabe 4, und sein erstes Feld ist zugleich der Anfang eines senkrechten Laufs aus 2 Feldern mit der Vorgabe 3. Die beiden Ziffern des waagerechten Laufs müssen sich ohne Wiederholung zu 4 addieren - das schaffen nur 1+3 oder 3+1 (2+2 wiederholt die 2 und ist daher nicht erlaubt). Die beiden Ziffern des senkrechten Laufs müssen sich ohne Wiederholung zu 3 addieren, was nur 1+2 oder 2+1 schaffen.",
    kakuro_rules_example_p2: "Das gemeinsame Feld muss eine Ziffer sein, die beide Läufe verwenden können. Der waagerechte Lauf bietet dafür {1, 3}, der senkrechte Lauf {1, 2} - die einzige Ziffer in beiden Mengen ist die 1. Also muss das gemeinsame Feld eine 1 sein, wodurch das andere Feld des waagerechten Laufs auf 3 und das andere Feld des senkrechten Laufs auf 2 festgelegt wird. Damit ist das ganze Rätsel allein durch logisches Ausschließen gelöst, ganz ohne Raten - genau die Art von Schlussfolgerung, die, viele Male wiederholt, auch jedes größere Kakuro-Gitter löst.",
    kakuro_rules_end_title: "Ein Rätsel abschließen",
    kakuro_term_win: "Gelöst",
    kakuro_rules_win: "Das Rätsel ist gelöst, sobald jedes weiße Feld ausgefüllt ist, jeder Lauf seine Summenvorgabe erreicht und keine Ziffer innerhalb eines Laufs doppelt vorkommt.",
    kakuro_history_title: "Die Geschichte von Kakuro",
    kakuro_history_origins_title: "Cross Sums, erfunden in Amerika",
    kakuro_history_origins_p1: "Das heute als Kakuro bekannte Zahlenkreuzworträtsel wurde 1966 von Jacques Cousin erfunden, einem Kanadier, der für den Rätselverlag Dell Magazines arbeitete, und in den USA unter dem Namen „Cross Sums“ (auch „Cross Sum“ geschrieben) eingeführt. Es wurde schnell zu einem festen Bestandteil von Dells Rätselheften, neben Dells anderen Zahlen- und Logikrätseln.",
    kakuro_history_origins_p2: "Die Idee verband die Optik eines Kreuzworträtsel-Gitters mit Arithmetik statt Wortschatz: schwarze Felder mit Hinweiszahlen anstelle von Kreuzworträtsel-Definitionen und weiße Felder, die mit Ziffern gefüllt werden mussten, deren Summen zu diesen Hinweisen passen.",
    kakuro_history_spread_title: "Ein japanischer Name für ein zweites Leben",
    kakuro_history_spread_p1: "Cross Sums gelangte nach Japan, wo der Rätselverlag Nikoli - dasselbe Unternehmen, das später Sudoku populär machte und benannte - es aufgriff und ihm den Namen „Kakuro“ gab, eine Kurzform von „kasan kurosu“ (加算クロス), japanisch für „Additionskreuz“.",
    kakuro_history_spread_p2: "In den 1980er-Jahren wurde Kakuro zu einem von Nikolis beliebtesten Rätseln in Japan und gewann dort schon lange vor dem Sudoku-Boom eine treue Anhängerschaft, der später auch Nikolis Namen in den Rest der Welt tragen sollte.",
    kakuro_history_modern_title: "Ein wiederentdecktes Rätsel",
    kakuro_history_modern_p1: "Kakuros internationale Bekanntheit stieg Mitte der 2000er-Jahre erneut, im Windschatten von Sudokus weltweitem Zeitungs-Boom, als Rätselredakteure auf der Suche nach einem Nachfolgehit sich Nikolis anderen Zahlenrätseln zuwandten - wodurch viele westliche Löser Kakuro zum ersten Mal unter seinem japanischen Namen kennenlernten, obwohl das Rätsel selbst Jahrzehnte zuvor in Nordamerika erfunden worden war.",
    kakuro_history_modern_p2: "Diese zweistufige Geschichte spiegelt sich darin, wie das Rätsel bis heute gelöst wird: Ein Kakuro-Gitter erfordert nie Raten, sondern nur dasselbe lauf-für-lauf-Ausschlussverfahren, das schon die Löser von Dells ursprünglichem Cross Sums nutzten - nur Ziffer für Ziffer, ein Hinweis nach dem anderen ausgedrückt, genau das Prinzip, das der Generator dieser Sammlung umgekehrt nutzt, um aus einem zufällig gefüllten Gitter ein frisches Rätsel zu bauen."
});
I18n.markTextLoaded("de");
