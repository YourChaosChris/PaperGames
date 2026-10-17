// text/de/shogi.js
// Rules and history texts of shogi (de). Loaded by shogi-rules.html and shogi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    shogi_rules_title: "Shogi-Regeln",
    shogi_rules_intro: "Eine kurze Übersicht darüber, wie PaperGames Shogi (japanisches Schach) spielt – nützlich, wenn man vom internationalen Schach kommt, da hier einiges anders funktioniert.",
    shogi_rules_basics_title: "Die Grundidee",
    shogi_term_board: "Das Brett und die Steine",
    shogi_rules_board: "Jede Seite hat 20 Steine auf einem 9x9-Brett: einen König, einen Turm, einen Läufer, zwei Goldgeneräle, zwei Silbergeneräle, zwei Springer, zwei Lanzen und neun Bauern. Die Steine sind schlichte Fünfecke, die zum Gegner zeigen – zu welcher Seite ein Stein gehört, erkennt man an seiner Ausrichtung, nicht an seiner Farbe. Schwarz zieht immer zuerst.",
    shogi_term_promotion: "Beförderung",
    shogi_rules_promotion: "Jeder Stein außer dem König und dem Goldgeneral kann zu einer stärkeren Form befördert werden, wenn er in die hintersten drei Reihen des Bretts hinein-, hinaus- oder innerhalb dieser zieht. Die Beförderung ist freiwillig, außer wenn ein Bauer oder eine Lanze die allerletzte Reihe erreicht oder ein Springer eine der letzten beiden Reihen – dort ist sie erzwungen, da der Stein sonst nie wieder einen legalen Zug hätte.",
    shogi_term_drops: "Schlagen und Einsetzen",
    shogi_rules_drops: "Einen Stein zu schlagen entfernt ihn nicht aus dem Spiel: Er wechselt die Seite, wird auf seine unbeförderte Form zurückgestuft und wandert in die Hand des schlagenden Spielers. In einem späteren Zug kann dieser Spieler, statt einen Stein auf dem Brett zu bewegen, einen Stein aus der Hand auf ein beliebiges leeres Feld einsetzen – eine der charakteristischen Ideen von Shogi und der Grund, warum Partien selten an Material verarmen.",
    shogi_term_drop_limits: "Einschränkungen beim Einsetzen",
    shogi_rules_drop_limits: "Ein Bauer oder eine Lanze darf nicht auf die letzte Reihe gesetzt werden, ein Springer nicht auf eine der letzten beiden Reihen, da sie dort keinen legalen Zug hätten. Ein Bauer darf nicht auf eine Linie gesetzt werden, auf der bereits ein eigener unbeförderter Bauer steht, und ein eingesetzter Bauer darf niemals direkt Schachmatt setzen (Schach geben darf er weiterhin, nur eben kein Matt).",
    shogi_rules_end_title: "Wie eine Partie endet",
    shogi_term_win: "Gewinnen",
    shogi_rules_win: "Ein König im Schach, der weder ausweichen noch blocken noch den bedrohenden Stein schlagen kann, ist schachmatt – die Partie endet sofort.",
    shogi_term_resignation: "Aufgabe",
    shogi_rules_resignation: "Ein Spieler kann jederzeit aufgeben, wodurch die Partie sofort zugunsten des Gegners endet.",
    shogi_term_sennichite: "Stellungswiederholung (Sennichite)",
    shogi_rules_sennichite: "Tritt dieselbe Stellung - dieselben Steine auf denselben Feldern, dieselben Steine in beiden Händen und derselbe Spieler am Zug - viermal auf, endet die Partie remis. Ausnahme: Hat ein Spieler während der Wiederholung mit jedem seiner Züge Schach geboten, verliert er stattdessen. PaperGames wendet diese Regel automatisch an.",
    shogi_history_title: "Die Geschichte von Shogi",
    shogi_history_origins_title: "Aus Indien, über Südostasien",
    shogi_history_origins_p1: "Wie das internationale Schach und Xiangqi stammt auch Shogi letztlich von Chaturanga ab, dem alten indischen Kriegsspiel, das sich ab etwa dem 6. Jahrhundert n. Chr. entlang der Handelsrouten über Asien verbreitete. Es erreichte Japan irgendwann vor dem 10. Jahrhundert, höchstwahrscheinlich über Südostasien und China, und wurde in den folgenden Jahrhunderten zu eigenständig japanischen Formen weiterentwickelt.",
    shogi_history_origins_p2: "Frühe japanische Schachvarianten waren deutlich größer als das heutige Spiel – einige historische Formen wie Dai Shogi und das gewaltige Tai Shogi nutzten Bretter von 15x15 Feldern oder mehr mit weit über hundert Steinen pro Seite. Die heute gespielte 9x9-Version mit 20 Steinen setzte sich etwa ab dem 16. Jahrhundert als Standard durch.",
    shogi_history_spread_title: "Der Ursprung der Einsetzregel",
    shogi_history_spread_p1: "Shogis prägendstes Merkmal – dass ein geschlagener Stein die Seite wechselt und wieder aufs Brett eingesetzt werden kann – hat keine Entsprechung im Schach oder in Xiangqi und hebt es von jedem anderen Spiel dieser Sammlung ab. Historiker bringen seine Entstehung meist mit der unter Japans kriegführenden Samurai-Clans üblichen Praxis in Verbindung, gefangene Soldaten direkt ins eigene Heer aufzunehmen, statt sie nur als Verluste zu behandeln.",
    shogi_history_spread_p2: "Wie auch immer ihr genauer Ursprung war – die Einsetzregel verändert den Charakter des Spiels grundlegend: Material verschwindet fast nie dauerhaft, Partien kommen selten durch bloßen Materialtausch zum Stillstand, und ein aggressiver Angriff kann unbegrenzt mit bereits geschlagenem Material weitergeführt werden.",
    shogi_history_modern_title: "Eine lebendige professionelle Tradition",
    shogi_history_modern_p1: "Shogi trägt seit der Edo-Zeit (17.–19. Jahrhundert) eine durchgehende professionelle Turniertradition in Japan, als das Tokugawa-Shogunat ein erbliches Haussystem professioneller Spieler finanzierte – eine Linie, aus der die moderne, 1924 gegründete Japan Shogi Association hervorging.",
    shogi_history_modern_p2: "Computer-Shogi hinkte dem Computerschach lange wegen des durch die Einsetzregel enorm vergrößerten Verzweigungsfaktors hinterher, doch Mitte der 2010er-Jahre besiegten Programme wie Ponanza die besten menschlichen Profispieler deutlich – und lösten damit dieselben Debatten über Mensch-gegen-Computer aus, die das Schach ein bis zwei Jahrzehnte zuvor durchlaufen hatte."
});
I18n.markTextLoaded("de");
