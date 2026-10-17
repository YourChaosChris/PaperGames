// text/de/tenpairs.js
// Rules and history texts of tenpairs (de). Loaded by tenpairs-rules.html and tenpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    tp_rules_title: "Regeln: Zehner-Paare",
    tp_rules_intro: "Streiche Ziffernpaare, bis keine mehr übrig ist.",
    tp_rules_basics_title: "Die Regeln",
    tp_term_field: "Das Feld",
    tp_rules_field: "Ziffern 1 bis 9 in neun Spalten, Zeile für Zeile gelesen wie ein Text.",
    tp_term_pairs: "Paare",
    tp_rules_pairs: "Zwei Ziffern werden zusammen gestrichen, wenn sie gleich sind (3 und 3) oder zusammen 10 ergeben (1 und 9, 2 und 8, 3 und 7, 4 und 6, 5 und 5).",
    tp_term_see: "Sich sehen",
    tp_rules_see: "Die beiden müssen sich sehen: direkt nebeneinander waagerecht, senkrecht oder schräg oder mit nur gestrichenen Feldern dazwischen auf dieser Linie. Waagerecht geht es auch über das Zeilenende: Die letzte Ziffer einer Zeile sieht die erste der nächsten, und so weiter in Leserichtung.",
    tp_term_add: "Nachlegen",
    tp_rules_add: "Kommst du nicht weiter, tippst du auf Nachlegen: Alle noch nicht gestrichenen Ziffern werden in derselben Reihenfolge hinten an das Feld angehängt. Höchstens 5-mal pro Partie.",
    tp_term_rows: "Leere Zeilen",
    tp_rules_rows: "Eine Zeile, deren neun Felder alle gestrichen sind, verschwindet.",
    tp_term_end: "Gewinnen und verlieren",
    tp_rules_end: "Du gewinnst, wenn alle Ziffern gestrichen sind. Du verlierst, wenn kein Paar mehr geht und kein Nachlegen mehr übrig ist, oder wenn das Feld auf mehr als 40 Zeilen wächst.",
    tp_term_start: "Start",
    tp_rules_start: "Klassisch: 1 2 3 4 5 6 7 8 9, dann 1 1 1 2 1 3 1 4 1 5 1 6 1 7 1 8 1 9 (die Zahlen 1 bis 19 ohne 10). Zufall: drei, vier oder fünf Zeilen; je leichter die Stufe, desto mehr Paare stehen direkt nebeneinander.",
    tp_term_help: "Hilfe",
    tp_rules_help: "Rückgängig geht beliebig viele Schritte zurück. Tipp markiert ein Paar, das du streichen kannst, oder sagt, dass nur noch Nachlegen hilft.",
    tp_rules_example_title: "Beispiel",
    tp_rules_example: "Der klassische Start. Die 1 oben links und die 1 darunter sehen sich (senkrecht) und sind gleich. Die 9 am Ende der ersten Zeile und die 1 am Anfang der zweiten sehen sich über das Zeilenende und ergeben zusammen 10.",
    tp_history_title: "Geschichte von Zehner-Paare",
    tp_history_origins_title: "Aus Schulheften",
    tp_history_origins_p1: "Woher das Rätsel stammt, ist in den Quellen, die PaperGames prüfen konnte, nicht belegt. Ein Artikel von 2011 auf der russischen Website Habr erinnert sich daran aus Schule und Studium: Man spielte es in karierten Heften, unter Namen wie „Zahlen“, „Ziffern“, „Sonnenblumenkerne“ oder „19“ – einen offiziellen Namen gab es nicht. Dort beginnt das Spiel mit den Zahlen 1 bis 19 (ohne 10) in einer Reihe, also denselben Ziffern wie der klassische Start hier, und wenn kein Paar mehr geht, schreibt man die übrigen Ziffern ans Ende.",
    tp_history_name_title: "Der Name",
    tp_history_name_p1: "„Zehner-Paare“ sagt einfach, worum es geht. Mehrere Apps spielen dieselbe Idee unter eigenen Namen; PaperGames verwendet sie nicht. Die schrägen Paare, die Grenze von 5-mal Nachlegen und von 40 Zeilen sind Regeln von PaperGames."
});
I18n.markTextLoaded("de");
