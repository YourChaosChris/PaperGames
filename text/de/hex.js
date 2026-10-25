// text/de/hex.js
// Rules and history texts of hex (de). Loaded by hex-rules.html and hex-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    hex_rules_title: "Hex-Regeln",
    hex_rules_intro: "Eine kurze Übersicht darüber, wie PaperGames Hex spielt – nützlich, wenn man aus der Übung ist oder es gerade lernt.",
    hex_rules_basics_title: "Die Grundidee",
    hex_term_setup: "Der Aufbau",
    hex_rules_setup: "Das Brett ist eine Raute aus sechseckigen Feldern. Schwarz (gefüllte Steine) gehören die obere und untere Kante, Weiß (umrandete Steine) die linke und rechte Kante. Schwarz zieht zuerst. Gedruckte Hex-Bretter nutzen oft Rot und Blau; PaperGames spielt mit Schwarz und Weiß, weil ein E-Ink-Bildschirm keine Farben zeigt.",
    hex_term_moving: "Einen Zug ausführen",
    hex_rules_moving: "Am Zug platzierst du einen Stein deiner eigenen Farbe auf ein beliebiges leeres Feld – es wird nicht geschlagen, und einmal gesetzte Steine bewegen sich nie wieder.",
    hex_term_swap: "Die Tauschregel",
    hex_rules_swap: "Wer anfängt, ist im Vorteil. Deshalb gilt die Tauschregel, außer du schaltest sie vor dem Spiel aus. Nach dem ersten Stein von Schwarz darf Weiß auf „Tauschen“ tippen, statt einen Stein zu setzen: Die Spieler tauschen die Farben, der erste Stein gehört jetzt dem, der Weiß war, und der andere spielt als Weiß weiter. Schwarz verbindet weiter oben und unten, Weiß links und rechts. Der Computer tauscht, wenn der erste Stein in der Mitte des Bretts liegt.",
    hex_term_win: "Gewinnen",
    hex_rules_win: "Baue eine ununterbrochene Kette eigener Steine, die deine beiden Kanten verbindet. Hex kann nie unentschieden enden: Ist das Brett voll, existiert garantiert die Kette eines Spielers – unabhängig davon, ob eine Seite versucht hat, die andere zu blockieren.",
    hex_rules_end_title: "Eine Anmerkung zur Strategie",
    hex_term_blocking: "Angriff und Verteidigung sind derselbe Zug",
    hex_rules_blocking: "Weil ein Unentschieden unmöglich ist, sind das Blockieren der gegnerischen Verbindung und der Aufbau der eigenen im Grunde dieselbe Aufgabe, nur von zwei Seiten betrachtet – ein Feld, das der eigenen Kette hilft, durchbricht sehr oft zugleich die des Gegners.",
    hex_history_title: "Die Geschichte von Hex",
    hex_history_origins_title: "Zweimal erfunden",
    hex_history_origins_p1: "Hex wurde 1942 erstmals vom dänischen Mathematiker, Dichter und Designer Piet Hein erfunden, der es in Dänemark unter dem Namen \"Polygon\" vorstellte, nachdem er sich gefragt hatte, ob ein Spiel im Stil des Vierfarbensatzes jemals unentschieden enden könnte.",
    hex_history_origins_p2: "Ende der 1940er Jahre wurde es, nach überlieferter Darstellung unabhängig davon, vom Mathematiker John Nash neu erfunden – später Nobelpreisträger für Wirtschaftswissenschaften und Vorbild für den Film \"A Beautiful Mind\" –, als er Doktorand in Princeton war. Mitstudenten nannten es \"Nash\" oder \"John\", Letzteres angeblich, weil man es auf sechseckigen Badezimmerfliesen spielen konnte.",
    hex_history_origins_p3: "1952 brachte Parker Brothers das Spiel unter dem Namen \"Hex\" heraus, und dieser Name setzte sich durch. Ein deutlich breiteres Publikum erreichte es 1957, als Martin Gardner in seiner Kolumne \"Mathematical Games\" im Scientific American darüber schrieb.",
    hex_history_math_title: "Ein Liebling der Mathematiker",
    hex_history_math_p1: "Hex ist ein beliebtes Thema in Spieltheorie und Topologie wegen einer klaren, beweisbaren Tatsache: Das Spiel kann nie unentschieden enden – eine Folge derselben Mathematik, die auch dem Brouwerschen Fixpunktsatz zugrunde liegt –, was zugleich über ein Strategie-Diebstahl-Argument beweist, dass der erste Spieler eine Gewinnstrategie haben muss, obwohl niemand weiß, wie diese Strategie für größere Bretter tatsächlich aussieht.",
    hex_history_math_p2: "Hex vollständig zu lösen wird mit wachsendem Brett dramatisch schwerer: Per Computersuche wurden alle Bretter bis 9x9 vollständig gelöst, auf 10x10 erst einzelne Eröffnungen, aber die Standard-Turniergröße 11x11 und größere Bretter bleiben ungelöst, weshalb Hex ein fortlaufendes Ziel sowohl für die Spiel-KI-Forschung als auch für die kombinatorische Spieltheorie bleibt.",
    hex_history_version_title: "Diese Version",
    hex_history_version_p1: "PaperGames spielt auf einem 9x9-Brett, einer Größe, die Partien angenehm kürzer hält und dabei sowohl der Verbindungs- als auch der Blockierstrategie noch echten Raum lässt."
});
I18n.markTextLoaded("de");
