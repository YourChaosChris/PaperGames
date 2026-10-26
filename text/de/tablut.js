// text/de/tablut.js
// Rules and history texts of tablut (de). Loaded by tablut-rules.html and tablut-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    tablut_rules_title: "Tablut-Regeln",
    tablut_rules_intro: "Eine kurze Übersicht darüber, wie PaperGames Tablut spielt, das 9x9-Mitglied der Tafl-Familie – nützlich, wenn man aus der Übung ist oder es gerade lernt.",
    tablut_rules_basics_title: "Die Grundidee",
    tablut_term_setup: "Der Aufbau",
    tablut_rules_setup: "Der König beginnt auf dem mittleren Thron inmitten eines Kreuzes aus acht Verteidigern, belagert von acht Angreifern, die zu zweit an jeder Kante stehen. Die Angreifer ziehen zuerst, und die beiden Seiten verfolgen ganz unterschiedliche Ziele: Die Seite des Königs will, dass er eine Ecke erreicht, die Angreifer wollen ihn zuerst einschließen.",
    tablut_term_moving: "Ziehen",
    tablut_rules_moving: "Jede Figur – Angreifer, Verteidiger oder der König – zieht wie ein Turm: beliebig weit in einer geraden Linie, aber nie durch oder auf eine andere Figur.",
    tablut_term_special: "Thron und Ecken",
    tablut_rules_special: "Der mittlere Thron und die vier Eckfelder sind für alle außer dem König tabu: Angreifer und Verteidiger dürfen weder darauf ziehen noch hindurchziehen, während der König den leeren Thron jederzeit wieder betreten darf. Die Ecken sind die einzigen Fluchtfelder des Königs.",
    tablut_term_capture: "Schlagen",
    tablut_rules_capture: "Eine normale Figur (Angreifer oder Verteidiger) wird durch Zangenschlag geschlagen: Fange sie zwischen zwei gegnerischen Figuren oder einer gegnerischen Figur und einem feindlichen Sonderfeld (dem leeren Thron oder einer Ecke) auf gegenüberliegenden Seiten einer geraden Linie ein. Nur die Figur, die gerade gezogen wurde, kann einen Schlag auslösen, sodass es immer sicher ist, eine eigene Figur selbst zwischen zwei gegnerische zu ziehen.",
    tablut_rules_example_title: "Ausführliches Beispiel",
    tablut_rules_example_intro: "Zwei kurze Beispiele dafür, wie der Zangenschlag in der Praxis funktioniert (mit den klassischen Brettkoordinaten a-i / 1-9, erst Spalte, dann Reihe):",
    tablut_term_example_ordinary: "Ein gewöhnlicher Zangenschlag",
    tablut_rules_example_ordinary: "Ein schwedischer Verteidiger steht auf d6, ein moskowitischer Angreifer sitzt direkt westlich davon auf c6. Zieht ein zweiter Angreifer nach e6, ist der Verteidiger nun zwischen zwei Angreifern in einer geraden Linie gefangen – und wird geschlagen.",
    tablut_term_example_throne: "Ein Zangenschlag mit Hilfe des Throns",
    tablut_rules_example_throne: "Ein Verteidiger auf e6 steht direkt südlich des leeren Throns (e5). Zieht ein einzelner Angreifer nach e7, direkt südlich des Verteidigers, reicht das aus, um ihn zu schlagen: Der leere Thron zählt auf der gegenüberliegenden Seite als feindlich, sodass keine zweite Angreiferfigur nötig ist.",
    tablut_rules_end_title: "Das Spiel gewinnen",
    tablut_term_kingcapture: "Den König schlagen",
    tablut_rules_kingcapture: "Der König wird nur geschlagen, wenn alle vier orthogonal an ihn angrenzenden Felder feindlich sind: besetzt von Angreifern, oder – wenn eine Seite an den Thron grenzt – der leere Thron selbst, der als angreifer-gleichwertiges feindliches Feld zählt. Anders als bei einer normalen Figur zählt der Spielfeldrand in diesem Regelwerk nie als feindlich gegenüber dem König: Ein an den Rand gedrängter König braucht weiterhin auf jeder offenen Seite einen echten Angreifer.",
    tablut_term_win: "Wie das Spiel endet",
    tablut_rules_win: "Die Seite des Königs gewinnt in dem Moment, in dem er eine der vier Ecken erreicht. Die Angreifer gewinnen, indem sie den König wie oben beschrieben schlagen. Eine Seite, die an ihrem Zug überhaupt keinen legalen Zug hat, verliert.",
    tablut_history_title: "Die Geschichte von Tablut",
    tablut_history_linnaeus_title: "Linné in Lappland",
    tablut_history_linnaeus_p1: "1732 reiste der schwedische Naturforscher Carl von Linné – Jahrzehnte bevor er mit seinem System zur Benennung von Arten die Biologie revolutionierte – durch Lappland, um Pflanzen, Tiere und die Bräuche der Sami zu dokumentieren, denen er dabei begegnete. Unter seinen Aufzeichnungen findet sich ein Brettspiel, das die Sami Tablut nannten: sein 9x9-Brett, seine Figuren und die Regeln, nach denen sie spielten.",
    tablut_history_linnaeus_p2: "Diese Beschreibung erwies sich als enorm wichtig. Von kaum einem Tafl-Spiel überlebte ein vollständiges Regelwerk aus der Wikingerzeit selbst – das Spiel war in weiten Teilen Europas schlicht außer Gebrauch geraten, bevor jemand auf die Idee kam, seine Regeln niederzuschreiben. Linnés Aufzeichnungen zu Tablut sind zwar Jahrhunderte nach der Blütezeit des Tafl in der Wikingerzeit entstanden und stellenweise unvollständig (sein Manuskript ist bei ein paar Grenzfällen mehrdeutig, und die erste englische Übersetzung von 1811 brachte eigene Fehler hinzu – weshalb sich verschiedene Rekonstruktionen und moderne Regelwerke bis heute in manchen Details uneinig sind), bleiben aber bis heute die wichtigste Primärquelle, mit der Forscher rekonstruiert haben, wie die gesamte Tafl-Familie wahrscheinlich gespielt wurde.",
    tablut_history_family_title: "Die bekannteste Tafl-Variante",
    tablut_history_family_p1: "Auch dank dieser Dokumentation ist Tablut das bekannteste und historisch bedeutendste Mitglied der Tafl-Familie – dasjenige, das am häufigsten als Ausgangspunkt dient, wenn die Regeln seiner zahlreichen Verwandten rekonstruiert werden, vom kleinen 7x7-Brandub bis zum riesigen 19x19-Alea Evangelii.",
    tablut_history_brandub_link: "PaperGames bietet auch die kleinere Brandub-Variante auf einem 7x7-Brett an, falls du die beiden Brettgrößen vergleichen möchtest.",
    tablut_history_version_title: "Diese Version",
    tablut_history_version_p1: "PaperGames spielt Tablut auf dem klassischen 9x9-Brett mit 8 Angreifern, 8 Verteidigern und einem König, mit einer klar definierten modernen Regel zum Schlagen des Königs (siehe die Regelseite) – denn wie Linnés eigene Aufzeichnungen zeigen, lässt selbst die am besten dokumentierte Tafl-Quelle manche Details offen für Interpretation."
});
I18n.markTextLoaded("de");
