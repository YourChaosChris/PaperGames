// text/de/mahjong.js
// Rules and history texts of mahjong (de). Loaded by mahjong-rules.html and mahjong-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    mahjong_rules_title: "Mahjong-Solitär-Regeln",
    mahjong_rules_intro: "Eine kurze Übersicht darüber, wie PaperGames Mahjong Solitär spielt – nützlich, wenn man aus der Übung ist oder es gerade lernt.",
    mahjong_rules_basics_title: "Die Grundidee",
    mahjong_term_layout: "Das Layout",
    mahjong_rules_layout: "80 Steine sind drei Ebenen tief in einer pyramidenartigen Form gestapelt. Ein Stein ist nur dann frei zum Aufnehmen, wenn nichts auf ihm liegt und mindestens einer seiner direkten linken oder rechten Nachbarn auf derselben Ebene fehlt oder bereits entfernt wurde.",
    mahjong_term_matching: "Paare finden",
    mahjong_rules_matching: "Einen freien Stein anklicken und dann einen anderen freien Stein mit demselben Symbol anklicken, um beide vom Brett zu entfernen. Jedes Blatt wird so erzeugt, dass ein vollständiges Räumen von der Startposition aus immer möglich ist – eine unbedachte Reihenfolge kann einen aber trotzdem mittendrin feststecken lassen.",
    mahjong_term_shuffle: "Wenn nichts mehr geht",
    mahjong_rules_shuffle: "Bleibt kein legaler Zug mehr übrig, hilft \"Verbleibende Steine mischen\": Die übrigen Steine bekommen frische Symbole zugewiesen, wobei ab diesem Punkt wieder eine Lösung garantiert ist – eine festgefahrene Stellung muss also nie einen kompletten Neustart bedeuten.",
    mahjong_rules_end_title: "Eine Partie abschließen",
    mahjong_term_win: "Geräumt",
    mahjong_rules_win: "Das Brett ist geräumt, sobald jeder Stein durch ein Paar entfernt wurde.",
    mahjong_history_title: "Die Geschichte von Mahjong Solitär",
    mahjong_history_origins_title: "Geliehene Steine, neues Spiel",
    mahjong_history_origins_p1: "Mahjong Solitär (auch Shanghai genannt) ist kein traditionelles chinesisches Spiel. Es übernimmt den prächtig illustrierten Steinsatz des Vierspielerspiels Mahjong (selbst eine chinesische Schöpfung des 19. Jahrhunderts) für ein völlig anderes Einzelspieler-Zuordnungsrätsel ohne Kombinationen, Abwürfe oder Wertungshände des Originalspiels. Die früheste belegte Version ist ein Computerspiel: Brodie Lockard schrieb es 1981 für das PLATO-System.",
    mahjong_history_origins_p2: "Wer genau als Erster ein Paar-Zuordnungs-Solitär-Format mit Mahjong-Steinen verband, ist wirklich unklar, mit konkurrierenden Ansprüchen, die Jahrzehnte vor der Computerzeit zurückreichen – sicher ist nur, dass die Kombination erst mit dem Sprung auf Personal Computer zum weltweiten Phänomen wurde.",
    mahjong_history_spread_title: "Ein Bildschirmklassiker der 1980er",
    mahjong_history_spread_p1: "Das Spiel erreichte durch frühe Computerversionen in den 1980er-Jahren ein Massenpublikum, allen voran Activisions \"Shanghai\" von 1986 für den Macintosh – so beliebt, dass \"Shanghai\" vielerorts bis heute als alternativer Name für das gesamte Genre der Solitär-Zuordnungsspiele mit dem klassischen gestapelten Layout dient.",
    mahjong_history_spread_p2: "Das Layout, das dem Spiel seinen Namen gibt – ein gestuftes, pyramidenartiges Gebilde mit dem Spitznamen \"die Schildkröte\" – wurde so stark mit dem Genre verknüpft, dass die meisten Umsetzungen, auch diese hier, standardmäßig auf eine Variante davon zurückgreifen, statt eine neue Form zu erfinden.",
    mahjong_history_modern_title: "Ein durch Konstruktion lösbares Rätsel",
    mahjong_history_modern_p1: "Anders als etwa bei Sudoku oder einem Nonogramm, wo die Lösung eines Rätsels nach dem Entwurf auf Eindeutigkeit geprüft wird, wird ein Mahjong-Solitär-Blatt normalerweise auf andere Weise als spielbar garantiert: Viele Umsetzungen, auch die von PaperGames, bauen das Blatt rückwärts von einem leeren Brett auf, indem sie eine legale Entfernungsreihenfolge rückwärts abspielen, um zu entscheiden, welches Symbol wohin kommt.",
    mahjong_history_modern_p2: "Das garantiert, dass vom allerersten gelegten Stein an mindestens ein Gewinnweg existiert, sagt aber – genau wie bei einem echten Klondike-Kartenspiel – nichts darüber aus, ob die konkrete Zugfolge, die ein Spieler tatsächlich wählt, dorthin führt. Deshalb ist es ein normaler, erwarteter Teil des Spiels, in einem eigentlich vollständig lösbaren Blatt mittendrin steckenzubleiben, und kein Zeichen dafür, dass etwas schiefgelaufen ist."
});
I18n.markTextLoaded("de");
