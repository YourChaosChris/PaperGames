// text/pl/hanoi.js
// Rules and history texts of hanoi (pl). Loaded by hanoi-rules.html and hanoi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    hanoi_rules_title: "Zasady Wież Hanoi",
    hanoi_rules_intro: "Wieża z krążków, najmniejszy na górze, stoi na lewym pręcie. Przenieś ją na prawy pręt.",
    hanoi_rules_basics_title: "Zasady",
    hanoi_term_move: "Ruch",
    hanoi_rules_move: "Dotknij pręta: bierzesz jego górny krążek (pręt dostaje grubą ramkę). Dotknij pręta, aby położyć na nim krążek. Dotknij ponownie tego samego pręta, aby go odłożyć.",
    hanoi_term_rule: "Zasada",
    hanoi_rules_rule: "Ruszać się może tylko górny krążek pręta i nigdy nie może leżeć na mniejszym krążku. Taki ruch zostaje odrzucony i nic się nie rusza.",
    hanoi_term_goal: "Cel",
    hanoi_rules_goal: "Cała wieża na prawym pręcie (oznaczonym gwiazdką). Najmniej ruchów to 2 do potęgi liczby krążków, minus 1: 7 przy 3 krążkach, 15 przy 4, 255 przy 8.",
    hanoi_term_help: "Cofanie i podpowiedź",
    hanoi_rules_help: "Cofnij wycofuje ruchy. Podpowiedź daje dwóm prętom podwójną ramkę: przenieś górny krążek z pierwszego na drugi – to następny ruch najkrótszej drogi od pozycji, w której jesteś.",
    hanoi_history_title: "Historia Wież Hanoi",
    hanoi_history_lucas_title: "Édouard Lucas, 1883",
    hanoi_history_lucas_p1: "Francuski matematyk Édouard Lucas przedstawił łamigłówkę w 1883 roku jako grę rzekomo odnalezioną przez „N. Clausa (de Siam)” – litery „Lucas d'Amiens” w innej kolejności. W 1889 roku wydał ją jako broszurę.",
    hanoi_history_legend_title: "Wymyślona legenda",
    hanoi_history_legend_p1: "Broszura opowiadała o kapłanach w świątyni w Benares, którzy przenoszą wieżę z 64 złotych krążków; gdy skończą, nastąpi koniec świata. Legenda była częścią opowieści o grze, a nie prawdziwej historii.",
    hanoi_history_math_title: "Najmniej ruchów",
    hanoi_history_math_p1: "Przeniesienie n krążków wymaga co najmniej 2^n − 1 ruchów: najpierw n − 1 mniejszych krążków na środkowy pręt, potem największy na cel, a potem mniejsze na niego. Przy 64 krążkach i jednym ruchu na sekundę trwałoby to znacznie dłużej niż wiek wszechświata."
});
I18n.markTextLoaded("pl");
