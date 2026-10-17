// text/de/checkers.js
// Rules and history texts of checkers (de). Loaded by checkers-rules.html and checkers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    checkers_rules_title: "Dame-Regeln",
    checkers_rules_intro: "Eine kurze Übersicht, wie PaperGames Dame (nach englischen/amerikanischen Regeln) spielt – nützlich zum Auffrischen oder Lernen.",
    checkers_rules_basics_title: "Die Grundidee",
    checkers_term_men: "Steine",
    checkers_rules_men: "Schwarz und Weiß starten mit je 12 Steinen auf den dunklen Feldern ihrer eigenen drei hinteren Reihen und ziehen abwechselnd ein Feld diagonal vorwärts, Schwarz beginnt.",
    checkers_term_kings: "Damen",
    checkers_rules_kings: "Ein Stein, der die gegnerische Grundreihe erreicht, wird zur Dame. Damen ziehen diagonal in jede Richtung, weiterhin ein Feld pro Zug.",
    checkers_rules_capture_title: "Schlagen",
    checkers_term_capture: "Schlagen",
    checkers_rules_capture: "Geschlagen wird, indem man diagonal über einen angrenzenden gegnerischen Stein auf das direkt dahinterliegende freie Feld springt; der übersprungene Stein wird entfernt.",
    checkers_term_mandatory: "Schlagzwang",
    checkers_rules_mandatory: "Ist ein Schlagzug möglich, muss geschlagen werden – ein normaler Zug ist dann nicht erlaubt. Sind mehrere Schlagzüge möglich, darf frei gewählt werden, welcher Stein schlägt.",
    checkers_term_multijump: "Mehrfachschlagen",
    checkers_rules_multijump: "Landet ein Stein nach dem Schlagen auf einem Feld, von dem aus sofort ein weiterer Schlag mit demselben Stein möglich ist, muss weitergeschlagen werden, bis kein Schlag mehr möglich ist. Erreicht der Stein dabei die gegnerische Grundreihe, wird er sofort zur Dame befördert und der Zug endet – auch mitten in einer Schlagserie.",
    checkers_rules_end_title: "Wie eine Partie endet",
    checkers_term_win: "Gewinnen",
    checkers_rules_win: "Du gewinnst, wenn der Gegner keine Steine mehr hat oder am Zug keinen legalen Zug mehr machen kann.",
    checkers_term_resignation: "Aufgabe",
    checkers_rules_resignation: "Ein Spieler kann jederzeit aufgeben, wodurch die Partie sofort zugunsten des Gegners endet.",
    checkers_term_draw: "Remis",
    checkers_rules_draw: "Vergehen 40 Züge in Folge ohne Schlagen einer Seite, endet die Partie remis.",
    checkers_history_title: "Die Geschichte von Dame",
    checkers_history_origins_title: "Ein uraltes Brett, ein mittelalterliches Spiel",
    checkers_history_origins_p1: "Brett und Aufstellung von Dame gehen auf Alquerque zurück, ein Fangspiel auf einem linierten 5x5-Brett, das seit über 3000 Jahren in Ägypten und dem Nahen Osten bekannt war und später im maurischen Spanien beliebt wurde.",
    checkers_history_origins_p2: "Um das 12. Jahrhundert kombinierte jemand in Südfrankreich Alquerques diagonales Schlagen mit einem Schachbrett und schuf damit „Fierges“ oder „Jeu de Dames“ – den direkten Vorfahren des heute gespielten Spiels.",
    checkers_history_spread_title: "Von Frankreich in die Welt",
    checkers_history_spread_p1: "Das Spiel verbreitete sich unter vielen Namen durch Europa – Draughts in England, Dama in Spanien, Dame in Deutschland – und gelangte mit Siedlern über den Atlantik, wo es besonders in den USA populär wurde. Dort setzten sich das 8x8-Brett und der Schlagzwang durch, die auch diese App verwendet (amerikanisches Dame).",
    checkers_history_spread_p2: "Seit dem 19. Jahrhundert werden nationale und Weltmeisterschaften ausgetragen; organisierter Wettkampfsport in Großbritannien, den USA und darüber hinaus brachte Generationen gefeierter Spieler und intensiv erforschter Eröffnungen hervor.",
    checkers_history_modern_title: "Ein gelöstes Spiel",
    checkers_history_modern_p1: "Dame nimmt in der Spieltheorie eine besondere Stellung ein: 2007 bewies Jonathan Schaeffers Programm Chinook nach fast zwei Jahrzehnten Rechenarbeit, dass Dame bei beidseitig perfektem Spiel remis endet – das komplexeste Spiel, das zu diesem Zeitpunkt derart vollständig gelöst war.",
    checkers_history_modern_p2: "Das macht Dame nicht weniger unterhaltsam – wie ein gelöstes Endspiel im Schach ändert das Wissen um das theoretische Ergebnis nichts an dem Können, das eine echte Partie am Brett verlangt."
});
I18n.markTextLoaded("de");
