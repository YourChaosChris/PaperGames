// text/de/nonogram.js
// Rules and history texts of nonogram (de). Loaded by nonogram-rules.html and nonogram-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    nonogram_rules_title: "Nonogramm-Regeln",
    nonogram_rules_intro: "Eine kurze Übersicht darüber, wie PaperGames Nonogramme (auch Griddlers genannt) spielt – nützlich, wenn man aus der Übung ist oder es gerade lernt.",
    nonogram_rules_basics_title: "Die Grundidee",
    nonogram_term_clues: "Die Hinweise lesen",
    nonogram_rules_clues: "Jede Zeile und Spalte hat einen Hinweis: eine Zahlenfolge, die die Länge jedes zusammenhängenden Blocks ausgefüllter Felder in dieser Linie angibt, in Reihenfolge, jeweils durch mindestens ein leeres Feld getrennt. Ein Hinweis \"3 1\" bedeutet eine Reihe aus drei ausgefüllten Feldern, dann eine Lücke, dann ein weiteres ausgefülltes Feld, irgendwo in dieser Linie.",
    nonogram_term_filling: "Füllen und Markieren",
    nonogram_rules_filling: "Im Füllen-Modus ein Feld einfärben, von dem man sicher ist, dass es zum Bild gehört, und im X-markieren-Modus ein Feld durchstreichen, von dem man sicher ist, dass es leer bleibt – das Markieren ist reine Gedächtnisstütze und hat keinen Einfluss auf den Sieg, hilft aber dabei, Möglichkeiten beim Durcharbeiten der Hinweise auszuschließen.",
    nonogram_rules_end_title: "Ein Rätsel abschließen",
    nonogram_term_win: "Gelöst",
    nonogram_rules_win: "Das Rätsel ist in dem Moment gelöst, in dem die ausgefüllten Felder genau dem versteckten Bild entsprechen – markierte Felder müssen nicht korrekt sein, nur die ausgefüllten zählen.",
    nonogram_history_title: "Die Geschichte der Nonogramme",
    nonogram_history_origins_title: "Zwei Erfinder, zwei Kontinente",
    nonogram_history_origins_p1: "Das Rätsel stammt aus dem Japan der späten 1980er-Jahre. 1987 gewann die japanische Grafikredakteurin Non Ishida in Tokio einen Gestaltungswettbewerb mit Gitterbildern aus Hochhausfenstern, deren Licht an- oder ausgeschaltet war; daraus entstand ihre Idee für das Rätsel, und 1988 veröffentlichte sie drei solcher Bilderrätsel als \"Window Art Puzzles\". Der japanische Rätselautor Tetsuya Nishio erfand dieselbe Art von Rätsel unabhängig davon und veröffentlichte sie in einer anderen Zeitschrift.",
    nonogram_history_origins_p2: "Der britische Rätselsammler James Dalgety sah Ishidas Rätsel und half, sie auch außerhalb Japans zu veröffentlichen. Er prägte den Namen \"Nonogram\", aus \"Non\" (Ishidas Vorname) und \"-gram\" (von \"diagram\"). Ab 1990 druckte die britische Zeitung The Sunday Telegraph die Rätsel jede Woche; 1998 wählten ihre Leser in einem Wettbewerb den neuen Namen \"Griddlers\". Heute ist das Rätsel unter mehreren Namen bekannt, darunter Picross und Hanjie.",
    nonogram_history_spread_title: "Von der Zeitschrift zum Game Boy",
    nonogram_history_spread_p1: "Nintendo machte das Rätsel unter dem Namen \"Picross\" (einer Wortmischung aus \"picture\" und \"crossword\") weltweit bekannt und veröffentlichte ab 1995 Picross-Spiele für den Game Boy und das Super Famicom – für viele Spieler außerhalb Japans war diese Handheld-Reihe die erste Begegnung mit dem Format.",
    nonogram_history_spread_p2: "Der Reiz des Rätsels reichte weit über dedizierte Videospiele hinaus: Zeitungsrätselseiten griffen es während des Rätsel-Booms der 2000er-Jahre neben Sudoku auf, meist unter dem Namen Griddlers oder Hanjie, und es ist bis heute fester Bestandteil von Rätselbüchern und Apps.",
    nonogram_history_modern_title: "Ein Rätsel, das (meist) kein Raten braucht",
    nonogram_history_modern_p1: "Ein gut konstruiertes Nonogramm ist so angelegt, dass es sich allein durch reine logische Schlussfolgerung Zeile für Zeile lösen lässt, ganz ohne Raten – genau die Eigenschaft, auf die PaperGames' eigene Rätsel vor der Aufnahme geprüft werden, mit einem Constraint-Propagation-Löser, der bestätigt, dass die Hinweise jedes Bildes genau ein gültiges Gitter zulassen.",
    nonogram_history_modern_p2: "Das gilt allerdings nicht für jede beliebige Hinweiskombination: Wie bei Minesweeper wurde auch für das allgemeine Lösen von Nonogrammen bewiesen, dass es NP-vollständig ist – ein hinreichend großes oder absichtlich bösartig konstruiertes Rätsel kann also echtes, backtracking-artiges Raten erfordern. Gut gestaltete Rätsel für menschliche Löser vermeiden das gezielt, was selbst eine kleine Kunstform für sich ist."
});
I18n.markTextLoaded("de");
