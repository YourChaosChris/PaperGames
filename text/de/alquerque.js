// text/de/alquerque.js
// Rules and history texts of alquerque (de). Loaded by alquerque-rules.html and alquerque-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    alquerque_rules_title: "Alquerque-Regeln",
    alquerque_rules_intro: "Eine kurze Übersicht, wie PaperGames Alquerque spielt, das Sprungspiel aus dem Buch der Spiele von Alfons X. von Kastilien.",
    alquerque_rules_basics_title: "Die Grundidee",
    alquerque_term_board: "Das Brett",
    alquerque_rules_board: "Das Brett hat 25 Punkte in einem 5x5-Gitter. Benachbarte Punkte sind waagerecht und senkrecht verbunden, manche auch diagonal: Diagonale Linien laufen nur durch jeden zweiten Punkt, sodass die vier Ecken und die Mitte in alle acht Richtungen verbunden sind. Steine dürfen nur entlang der gezeichneten Linien ziehen.",
    alquerque_term_setup: "Aufstellung",
    alquerque_rules_setup: "Jede Seite hat 12 Steine: Weiß (Ringe) unten, Schwarz (gefüllte Scheiben) oben. Jede Seite besetzt die beiden Reihen, die ihr am nächsten sind, und die beiden Punkte der mittleren Reihe auf ihrer eigenen rechten Seite. Der Mittelpunkt bleibt frei. Weiß zieht zuerst.",
    alquerque_term_move: "Ziehen",
    alquerque_rules_move: "Wer am Zug ist, zieht einen eigenen Stein entlang einer Linie auf einen freien Nachbarpunkt: vorwärts, seitwärts oder schräg vorwärts. Rückwärts zieht ein Stein nie, auch nicht schräg. Vorwärts heißt: in Richtung der gegnerischen Seite.",
    alquerque_term_capture: "Schlagen",
    alquerque_rules_capture: "Ein Stein schlägt, indem er entlang einer Linie über einen benachbarten gegnerischen Stein auf den leeren Punkt direkt dahinter springt. Der übersprungene Stein wird entfernt. Kann derselbe Stein danach erneut springen, macht er im selben Zug weiter, auch mit Richtungswechsel. Sprünge gehen in alle Richtungen, auch rückwärts – eine PaperGames-Festlegung, denn die Quelle verbietet nur das Rückwärts-Ziehen.",
    alquerque_term_forced: "Schlagzwang",
    alquerque_rules_forced: "Kannst du schlagen, musst du es tun: Solange ein Schlag möglich ist, lässt PaperGames nur Schlagzüge zu, und ein Stein, der weiterspringen kann, muss weitermachen, bis es nicht mehr geht. Sind mehrere Schläge möglich, darfst du jeden davon wählen, nicht nur den längsten.",
    alquerque_rules_end_title: "Wie eine Partie endet",
    alquerque_term_win: "Gewinnen",
    alquerque_rules_win: "Du gewinnst, wenn der Gegner keine Steine mehr hat oder zwar Steine hat, aber am Zug keinen legalen Zug mehr machen kann.",
    alquerque_term_resignation: "Aufgabe",
    alquerque_term_dead: "Seiten, die sich nicht mehr begegnen",
    alquerque_rules_dead: "PaperGames-Festlegung: Steht jeder weiße Stein mindestens zwei Reihen weiter oben als jeder schwarze, können sich die Seiten nie mehr begegnen – Weiß zieht nur nach oben oder seitwärts, Schwarz nur nach unten oder seitwärts. Dann könnte niemand mehr schlagen und die Partie würde nie enden; deshalb endet sie sofort: Wer mehr Steine hat, gewinnt, bei gleich vielen ist sie unentschieden.",
    alquerque_rules_resignation: "Ein Spieler kann jederzeit aufgeben, wodurch die Partie sofort zugunsten des Gegners endet.",
    alquerque_rules_versions_title: "Welche Variante hier gespielt wird",
    alquerque_rules_versions: "Alte Beschreibungen von Alquerque lassen manches offen. In der unten genannten Quelle gibt es keinen Schlagzwang: Ein Stein, der hätte schlagen können und es nicht tat, wird stattdessen weggenommen („Blasen“, englisch „huffing“). PaperGames bleibt beim Schlagzwang, weil die App ohnehin nur erlaubte Züge anbietet. Steine ziehen nie rückwärts, springen aber in alle Richtungen (PaperGames-Festlegung). Weiß beginnt.",
    alquerque_rules_sources_title: "Quellen",
    alquerque_rules_sources: "Das Verbot von Rückwärtszügen und das Spielende folgen: Wikipedia, „Alquerque“, section Rules: https://en.wikipedia.org/wiki/Alquerque (abgerufen am 6. Oktober 2026).",
    alquerque_history_title: "Die Geschichte von Alquerque",
    alquerque_history_origins_title: "Ein Name aus dem Arabischen",
    alquerque_history_origins_p1: "Der Name kommt vom arabischen al-qirkat, dem Namen eines in der arabischen Welt bekannten Brettspiels. Unter maurischer Herrschaft gelangte es nach Spanien und lebte dort als alquerque weiter.",
    alquerque_history_book_title: "Das Buch der Spiele",
    alquerque_history_book_p1: "1283 ließ König Alfons X. von Kastilien das Libro de los juegos, das Buch der Spiele, fertigstellen. Neben Schach, Würfel- und Puffspielen beschreibt es Alquerque mit Regeln und Abbildungen, was es zu einer der frühesten schriftlichen Quellen für das Spiel macht.",
    alquerque_history_checkers_title: "Von Alquerque zu Dame",
    alquerque_history_checkers_p1: "Dame gilt allgemein als Nachfahre von Alquerque: Das Schlagen durch Überspringen und die Regel, dass ein Schlag ausgeführt werden muss, wurden auf die Felder des Schachbretts übertragen. Alquerque selbst wurde weiter gespielt, und ähnliche Spiele kennt man aus vielen Regionen.",
    alquerque_history_modern_title: "Auf PaperGames",
    alquerque_history_modern_p1: "PaperGames spielt die Partie 12 gegen 12 auf dem 5x5-Brett mit Schlagzwang. Die Linien des Bretts sind vollständig eingezeichnet, denn nur sie zeigen, welche diagonalen Züge es gibt."
});
I18n.markTextLoaded("de");
