// text/pl/maeusekreis.js
// Rules and history texts of maeusekreis (pl). Loaded by maeusekreis-rules.html and maeusekreis-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    maeusekreis_rules_title: "Zasady Kręgu myszy",
    maeusekreis_rules_intro: "Kot i mysz na okręgu z punktów. Mysz porusza się tylko po okręgu, a kot może też przechodzić po prostych liniach przez środek. Czy kot złapie mysz, zanim skończą mu się ruchy?",
    maeusekreis_rules_basics_title: "Zasady",
    maeusekreis_term_board: "Plansza",
    maeusekreis_rules_board: "Punkty leżą na okręgu, a każdy łączy się z dwoma sąsiednimi. Kilka przerywanych linii przecina okrąg. Łatwy ma 8 punktów, Średni 10, a Trudny 12. Kot i mysz zaczynają w losowych punktach, oddalone od siebie o co najmniej trzy punkty.",
    maeusekreis_term_moves: "Ruchy",
    maeusekreis_rules_moves: "Najpierw porusza się mysz, potem kot i tak dalej. W swojej turze pionek przesuwa się o jeden krok do sąsiedniego punktu; nie wolno stać w miejscu. Mysz porusza się tylko po okręgu. Kot może używać okręgu i przerywanych linii. Mysz nie może wejść na kota. Dotknij zaznaczonego punktu, aby tam przejść.",
    maeusekreis_term_end: "Złapana lub wolna",
    maeusekreis_rules_end: "Gdy kot wejdzie na punkt myszy, łapie ją i wygrywa. Nikomu nic się nie dzieje — gra po prostu się kończy. Kot ma ustaloną liczbę ruchów, pokazaną nad planszą. Jeśli wykona je wszystkie, a mysz nadal jest wolna, mysz ucieka i wygrywa.",
    maeusekreis_term_steps: "Liczba ruchów",
    maeusekreis_rules_steps: "Liczba ruchów jest obliczana dla każdego startu. W grze dla dwóch osób i gdy grasz kotem, ma on dokładnie tyle ruchów, by złapać mysz — ale tylko wtedy, gdy żadnego nie zmarnuje. Gdy grasz myszą przeciw komputerowi, kot ma o jeden ruch mniej, więc ostrożna mysz może uciec.",
    maeusekreis_term_computer: "Komputer",
    maeusekreis_rules_computer: "Przeciw komputerowi wybierz kota albo mysz. Łatwy popełnia wiele błędów, Średni kilka, a Trudny żadnego. Przycisk Podpowiedź pokazuje najlepszy ruch, a Cofnij zabiera twój ostatni ruch.",
    maeusekreis_history_title: "Historia Kręgu myszy",
    maeusekreis_history_origins_title: "Stare gry w pościg",
    maeusekreis_history_origins_p1: "Gry, w których jedna strona poluje, a druga próbuje uciec, są znane w wielu krajach. W Europie od wielu wieków gra się w lisa i gęsi na planszy z liniami i punktami; podobne gry łowieckie pochodzą z Azji. Jedna strona jest silna, druga ma więcej pionków lub przestrzeni.",
    maeusekreis_history_maths_title: "Pościg po punktach i liniach",
    maeusekreis_history_maths_p1: "Od końca lat 70. matematycy zaczęli badać pościgi na sieciach punktów i linii: na jakich sieciach łowca zawsze może złapać uciekającego? Grę często nazywa się policjanci i złodzieje. Na zwykłym okręgu uciekający zawsze ucieknie; skróty przez środek to zmieniają.",
    maeusekreis_history_here_title: "Krąg myszy tutaj",
    maeusekreis_history_here_p1: "Pomysł kota i myszy na okręgu przysłał gracz. Zasady PaperGames są własne: mysz trzyma się okręgu, kot może przecinać go na skróty, a przeszukanie wszystkich pozycji wyznacza liczbę ruchów kota."
});
I18n.markTextLoaded("pl");
