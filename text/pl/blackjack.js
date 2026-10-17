// text/pl/blackjack.js
// Rules and history texts of blackjack (pl). Loaded by blackjack-rules.html and blackjack-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    bj_rules_title: "Zasady: Blackjack",
    bj_rules_intro: "Zbliż się do 21 bardziej niż bank, ale nie przekrocz. Dwa warianty, jedna gra – na żetony, które są tylko punktami.",
    bj_rules_basics_title: "Zasady",
    bj_term_variants: "Dwa warianty",
    bj_rules_variants: "W 17 i 4 gra się 32 kartami (od 7 do asa), w Blackjacka 52 kartami (od 2 do asa). Wariant wybierasz przy Nowej grze.",
    bj_term_values17: "Wartości kart w 17 i 4",
    bj_rules_values17: "As 11, król 4, dama 3, walet 2, karty od 7 do 10 według wartości. Dwa asy jako pierwsze dwie karty to „ogień” – najlepsza ręka.",
    bj_term_valuesbj: "Wartości kart w Blackjacku",
    bj_rules_valuesbj: "As 1 lub 11 (jak dla ciebie lepiej), król, dama i walet 10, pozostałe karty według wartości. As i karta o wartości 10 jako pierwsze dwie karty to blackjack.",
    bj_term_round: "Runda",
    bj_rules_round: "Wybierz stawkę: 5, 10 lub 20 żetonów. Dostajesz dwie karty, bank jedną odkrytą i jedną zakrytą. Przyciskiem „Karta” dobierasz, przyciskiem „Pas” kończysz. Jeśli przekroczysz 21, od razu przegrywasz.",
    bj_term_bank: "Bank",
    bj_rules_bank: "Gdy spasujesz, bank odkrywa swoją kartę. Zawsze trzyma się tej samej zasady: dobiera, dopóki ma 16 lub mniej, i pasuje od 17. Jeśli przekroczy 21, wygrywasz.",
    bj_term_result: "Kto wygrywa",
    bj_rules_result: "Wygrywa ten, kto jest bliżej 21. Wygrywasz tyle żetonów, ile postawiłeś; blackjack wygrywa półtorej stawki (w dół). Remis: w 17 i 4 wygrywa bank, w Blackjacku zachowujesz żetony. 21 z dwóch kart (blackjack) albo ogień kończy rundę od razu.",
    bj_term_double: "Podwajanie (tylko Blackjack)",
    bj_rules_double: "Przy pierwszych dwóch kartach możesz podwoić: stawka się podwaja, dostajesz dokładnie jedną kartę więcej, a potem gra bank. Potrzebujesz na to dość żetonów. Nie ma dzielenia ani ubezpieczenia.",
    bj_term_chips: "Żetony",
    bj_rules_chips: "Zaczynasz ze 100 żetonami. To tylko punkty w grze – nie można ich na nic wymienić. Gdy ich zabraknie, zaczynasz od nowa ze 100.",
    bj_rules_example_title: "Te same karty, inne punkty",
    bj_rules_example: "As i król: w Blackjacku dają 21 – blackjacka. W 17 i 4 dają tylko 15 (as 11, król 4).",
    bj_history_title: "Historia gry Blackjack",
    bj_history_origins_title: "Oczko",
    bj_history_origins_p1: "Gry karciane, w których trzeba dojść do 21, nie przekraczając tej liczby, są stare: pierwsza wzmianka pisemna pochodzi z książki hiszpańskiego pisarza Miguela de Cervantesa. Niemieckie 17 i 4 pochodzi z XVIII wieku i było bardzo popularne we Francji na dworze Ludwika XV. Francuskie vingt-et-un (21) wywodzi się ze starszego trente-et-un, w którym celem było 31. Po niemiecku nazywano je dawniej także Hopsen. Przy wartościach talii 32 kart 17 i król (4) dają dokładnie 21.",
    bj_history_us_title: "Blackjack",
    bj_history_us_p1: "W Stanach Zjednoczonych amerykańska odmiana oczka stała się osobną grą i około 1899 roku otrzymała nazwę blackjack. Często powtarzana historia o premii za asa z czarnym waletem jest według historyka Thierry'ego Depaulisa mitem. Tradycyjnie blackjack wypłaca 3 do 2, a przy równej liczbie punktów stawka wraca do gracza.",
    bj_history_modern_title: "Blackjack w PaperGames",
    bj_history_modern_p1: "PaperGames gra tylko na żetony: to po prostu punkty w grze, których nie można na nic wymienić. Bank zawsze trzyma się tej samej stałej zasady, karty są tasowane od nowa w każdej rundzie, a twoje punkty są zawsze widoczne – karty różnią się pełnymi i pustymi symbolami, aby gra działała na czarno-białym e-papierze."
});
I18n.markTextLoaded("pl");
