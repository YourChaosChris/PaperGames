// text/pl/surakarta.js
// Rules and history texts of surakarta (pl). Loaded by surakarta-rules.html and surakarta-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    surakarta_rules_title: "Zasady gry Surakarta",
    surakarta_rules_intro: "Krótkie przypomnienie, jak PaperGames rozgrywa Surakartę - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz. Bicie po pętli to element, który prawie każdemu na początku sprawia trudność, więc poniżej znajduje się pełny przykład.",
    surakarta_rules_basics_title: "Podstawowa idea",
    surakarta_term_board: "Plansza",
    surakarta_rules_board: "Zwykła siatka punktów 6x6. Każdy gracz zaczyna z 12 pionkami wypełniającymi dwa rzędy najbliższe jego stronie (Czarne na dwóch górnych rzędach, Białe na dwóch dolnych), środkowe dwa rzędy zaczynają puste. Czarne ruszają się pierwsze.",
    surakarta_term_movement: "Ruch",
    surakarta_rules_movement: "W swoim ruchu przesuwasz jeden pionek o jedno pole na sąsiednie puste pole - w linii prostej lub po skosie, w dowolnym z 8 kierunków. Taki krok jest zawsze cichy: nigdy niczego nie bije, nawet jeśli ląduje tuż obok pionka przeciwnika.",
    surakarta_term_loop: "Pętle",
    surakarta_rules_loop: "Cztery linie na planszy - 2. i 5. rząd oraz 2. i 5. kolumna - nie kończą się po prostu na krawędzi: każdy koniec tych czterech linii zakręca na zewnątrz i łączy się z najbliższym końcem sąsiedniej specjalnej linii przy tym samym narożniku, tworząc pętlę wokół każdego z 4 narożników planszy. Pionek ślizgający się wzdłuż jednej z tych czterech linii może wjechać na pętlę, opuszczając krawędź, i pojawić się ponownie, poruszając się dalej po połączonej linii, wciąż w linii prostej, tak daleko, jak pozwala na to tor i kolejne pętle.",
    surakarta_term_capture: "Bicie",
    surakarta_rules_capture: "Bicie jest całkowicie odrębne od zwykłego ruchu i działa wyłącznie poprzez pętle. Zamiast wykonać pojedynczy krok, pionek może przesunąć się w całości w jednym z 8 kierunków - przeskakując bez efektu nad każdym innym pionkiem, własnym lub przeciwnika - tak długo, jak pozwala na to linia i jej połączenia pętlowe. Gdy tylko przejdzie przez co najmniej jedną pętlę I napotka jako pierwszy pionek przeciwnika, ten pionek zostaje zbity, a ślizgający się pionek ląduje na jego polu, kończąc tam ruch. Jeśli linia wychodzi poza planszę bez pętli, która by ją przedłużyła, albo jeśli okrąży całość, nigdy nie napotykając odpowiedniego pionka przeciwnika, to tą drogą bicie nie jest możliwe. Bicie jest tu opcjonalne: nawet gdy bicie jest dostępne, możesz zamiast tego zagrać cichy ruch.",
    surakarta_rules_example_title: "Przykład: bicie po pętli",
    surakarta_rules_example_intro: "○ to Białe (pionek, który się porusza w tym przykładzie), ● to Czarne. Biały pionek na A stoi na jednej z czterech linii prowadzących do pętli. Nic nie blokuje mu drogi aż do krawędzi, więc zamiast cichego ruchu Białe wykonują pełny ślizg bijący.",
    surakarta_rules_example_caption: "Biały pionek na A ślizga się w lewo wzdłuż rzędu. Wychodzi poza krawędź, przejeżdża przez pętlę wokół narożnika i pojawia się ponownie, zjeżdżając w dół połączoną kolumną. Pierwszym pionkiem, który napotyka po użyciu tej pętli, jest czarny pionek na B - B zostaje więc zbity, a biały pionek ląduje na jego opróżnionym polu (przerywane kółko). Gdyby A stał zamiast tego tylko o jeden krok od pionka przeciwnika bez udziału żadnej pętli, ten sąsiedni przeciwnik NIE zostałby zbity - bić może tylko ślizg, który rzeczywiście korzysta z pętli.",
    surakarta_rules_end_title: "Jak kończy się partia",
    surakarta_term_win: "Wygrana",
    surakarta_rules_win: "Wygrywasz, bijąc wszystkie pionki przeciwnika, albo jeśli przeciwnik w swoim ruchu nie ma już żadnego legalnego posunięcia.",
    surakarta_term_resignation: "Poddanie się",
    surakarta_rules_resignation: "Gracz może poddać się w dowolnym momencie, co natychmiast kończy grę na korzyść przeciwnika.",
    surakarta_history_title: "Historia gry Surakarta",
    surakarta_history_origins_title: "Nazwana na cześć miasta na Jawie",
    surakarta_history_origins_p1: "Surakarta - znana też powszechnie pod swoją bardziej potoczną nazwą Solo - to miasto w środkowej Jawie, w Indonezji, i tradycyjnie uważa się, że gra nosząca tę nazwę właśnie tam powstała. Podobnie jak w przypadku wielu tradycyjnych gier planszowych przekazywanych głównie poprzez grę, a nie zapisy pisemne, dokładny wiek i szczegóły wczesnej historii nie są precyzyjnie udokumentowane; jasne jest natomiast, że w regionie gra się w nią od bardzo dawna i do dziś jest silnie kojarzona z tym miastem.",
    surakarta_history_unique_title: "Ulubiony przykład „nieoczywistej” zasady bicia",
    surakarta_history_unique_p1: "Surakarta jest niezwykła nawet wśród tradycyjnych gier, ponieważ całkowicie rozdziela ruch i bicie na dwa zupełnie odrębne mechanizmy: zwykły cichy ruch to tylko jeden krok na sąsiednie pole, podczas gdy każde bicie zależy wyłącznie od charakterystycznych narożnych pętli planszy - pionek bez żadnej dostępnej linii nadającej się do pętli po prostu nie może w tym ruchu bić, niezależnie od tego, jak jest otoczony. To wyraźne rozdzielenie, oraz fakt, że pionek może leżeć tuż obok pionka przeciwnika w całkowitym bezpieczeństwie, to właśnie to, co sprawia, że gra „klika” po jej zrozumieniu - i to, co czyni ją często przywoływanym przykładem w dyskusjach o projektowaniu gier na temat mechanik bicia, które nie są od razu oczywiste po spojrzeniu na planszę.",
    surakarta_history_modern_title: "Wciąż grana dzisiaj",
    surakarta_history_modern_p1: "Surakarta pozostaje żywą częścią tradycyjnej indonezyjskiej kultury gier, a jednocześnie rozprzestrzeniła się daleko poza nią: to powracający temat w kręgach entuzjastów gier abstrakcyjnych i w badaniach nad grami komputerowymi właśnie dlatego, że jej zasada bicia jest tak wyjątkowa, a także pojawia się w ogólnych zbiorach gier planszowych i ćwiczeniach programistycznych jako zwarty, samodzielny przykład mechaniki niemal niemającej odpowiednika w kanonie tradycyjnych gier planszowych."
});
I18n.markTextLoaded("pl");
