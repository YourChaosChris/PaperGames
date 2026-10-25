// text/de/hanoi.js
// Rules and history texts of hanoi (de). Loaded by hanoi-rules.html and hanoi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    hanoi_rules_title: "Türme von Hanoi – Regeln",
    hanoi_rules_intro: "Ein Turm aus Scheiben, die kleinste oben, steht auf dem linken Stab. Versetze ihn auf den rechten Stab.",
    hanoi_rules_basics_title: "Die Regeln",
    hanoi_term_move: "Ein Zug",
    hanoi_rules_move: "Tippe einen Stab an: Du nimmst seine oberste Scheibe auf (der Stab bekommt einen dicken Rahmen). Tippe einen Stab an, um die Scheibe daraufzulegen. Tippe denselben Stab noch einmal an, um sie zurückzulegen.",
    hanoi_term_rule: "Die Regel",
    hanoi_rules_rule: "Nur die oberste Scheibe eines Stabes darf sich bewegen, und sie darf nie auf einer kleineren Scheibe liegen. Ein solcher Zug wird abgelehnt, nichts bewegt sich.",
    hanoi_term_goal: "Das Ziel",
    hanoi_rules_goal: "Der ganze Turm auf dem rechten Stab (mit einem Stern markiert). Die wenigsten Züge sind 2 hoch Scheibenzahl, minus 1: 7 bei 3 Scheiben, 15 bei 4, 255 bei 8.",
    hanoi_term_help: "Zurücknehmen und Hinweis",
    hanoi_rules_help: "„Zurücknehmen“ nimmt Züge zurück. Der Hinweis gibt zwei Stäben einen doppelten Rahmen: Lege die oberste Scheibe vom ersten auf den zweiten – das ist der nächste Zug eines kürzesten Weges ab der Stellung, in der du gerade bist.",
    hanoi_history_title: "Die Geschichte der Türme von Hanoi",
    hanoi_history_lucas_title: "Édouard Lucas, 1883",
    hanoi_history_lucas_p1: "Der französische Mathematiker Édouard Lucas stellte das Rätsel 1883 als Spiel vor, das angeblich ein „N. Claus (de Siam)“ gefunden hatte – die umgestellten Buchstaben von „Lucas d'Amiens“. 1889 veröffentlichte er es als Heft.",
    hanoi_history_legend_title: "Eine erfundene Legende",
    hanoi_history_legend_p1: "Die Legende, die dem Spiel beigegeben war, erzählte von Priestern in einem Tempel in Benares, die einen Turm aus 64 goldenen Scheiben versetzen; sind sie fertig, gehe die Welt unter. Die Legende gehörte zur Geschichte des Spiels, nicht zur wirklichen Geschichte.",
    hanoi_history_math_title: "Die wenigsten Züge",
    hanoi_history_math_p1: "Für n Scheiben braucht man mindestens 2^n − 1 Züge: erst die n − 1 kleineren Scheiben auf den mittleren Stab, dann die größte ans Ziel, dann die kleineren darauf. Mit 64 Scheiben und einem Zug pro Sekunde würde das weit länger dauern, als das Weltall alt ist."
});
I18n.markTextLoaded("de");
