// text/pl/bullsandcows.js
// Rules and history texts of bullsandcows (pl). Loaded by bullsandcows-rules.html and bullsandcows-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    bullsandcows_rules_title: "Zasady gry Byki i krowy",
    bullsandcows_rules_intro: "Krótkie przypomnienie zasad, według których PaperGames rozgrywa Byki i krowy - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    bullsandcows_rules_basics_title: "Podstawowa idea",
    bullsandcows_term_code: "Tajny kod",
    bullsandcows_rules_code: "Na początku nowej gry komputer wybiera ukryty kod złożony z czterech pozycji, z których każda ma jeden z sześciu kształtów: koło, kwadrat, trójkąt, romb, gwiazdę lub krzyż. W zależności od poziomu trudności ten sam kształt może pojawić się w kodzie więcej niż raz.",
    bullsandcows_term_guess: "Wykonywanie próby",
    bullsandcows_rules_guess: "Dotknij pola, aby przełączać je między sześcioma kształtami, a następnie dotknij Zatwierdź próbę, gdy wszystkie cztery pola pokazują kształty, które chcesz sprawdzić. W próbie można dowolnie powtarzać kształty, niezależnie od tego, czy sam tajny kod zawiera powtórzenia.",
    bullsandcows_term_feedback: "Odczytywanie wskazówek",
    bullsandcows_rules_feedback: "Każda próba otrzymuje w odpowiedzi rząd kołków: czarny kołek za każdy kształt, który jest zarówno poprawny, jak i na właściwej pozycji, oraz biały kołek za każdy kształt, który jest poprawny, ale na złej pozycji. Na przykład, jeśli kod to koło-koło-kwadrat-trójkąt, a Twoja próba to koło-kwadrat-kwadrat-kwadrat, otrzymujesz dwa czarne kołki (pierwsze koło i trzeci kwadrat są dokładnie trafione) i żadnego białego kołka - dodatkowym kwadratom w próbie nie zostaje już nic w kodzie, z czym mogłyby się dopasować. Kołki nigdy nie mówią, do których pól się odnoszą - odkrycie tego jest całą zagadką.",
    bullsandcows_rules_end_title: "Kończenie gry",
    bullsandcows_term_win: "Wygrana",
    bullsandcows_rules_win: "Wygrywasz w momencie, gdy próba otrzyma cztery czarne kołki - każdy kształt dokładnie na właściwej pozycji.",
    bullsandcows_term_loss: "Wyczerpanie prób",
    bullsandcows_rules_loss: "Każdy poziom trudności pozwala na ustaloną liczbę prób. Jeśli wykorzystasz je wszystkie, nie łamiąc kodu, gra się kończy, a tajny kod zostaje ujawniony.",
    bullsandcows_term_levels: "Poziomy trudności",
    bullsandcows_rules_levels: "Łatwy daje 12 prób, ale tajny kod nigdy nie powtarza kształtu. Średni daje 10 prób i pozwala na powtórzenia - to tradycyjny sposób gry. Trudny daje tylko 8 prób i również pozwala na powtórzenia, więc powtarzające się kształty to coś, na co warto uważać.",
    bullsandcows_history_title: "Historia gry Byki i krowy",
    bullsandcows_history_origins_title: "Klasyka papieru i ołówka",
    bullsandcows_history_origins_p1: "Główna idea - zgadnąć ukryty kod i dowiedzieć się tylko, ile elementów pasuje dokładnie, a ile częściowo, ale nigdy które - pochodzi z Bulls and Cows (Byki i krowy), zgadywanki na papierze, w którą grano na długo przed 1970 rokiem. Tradycyjnie zgaduje się tajne liczby: właściwa cyfra na właściwym miejscu to byk, właściwa cyfra na złym miejscu to krowa.",
    bullsandcows_history_origins_p2: "Była to też jedna z pierwszych gier napisanych na komputery: wersje, często nazywane Moo, działały na komputerach uniwersyteckich od końca lat 60., a zaprogramowanie jej wciąż jest klasycznym ćwiczeniem.",
    bullsandcows_history_spread_title: "Gra planszowa i nazwa",
    bullsandcows_history_spread_p1: "W 1970 roku z tego pomysłu powstała gra planszowa z kolorowymi kołeczkami, znana na całym świecie pod nazwą Mastermind. Mastermind to znak towarowy; prawa należą do Invicta Plastics. PaperGames nie ma żadnego związku z Invicta Plastics ani z tą grą planszową i dlatego używa starszej nazwy Bulls and Cows, czyli Byki i krowy.",
    bullsandcows_history_modern_title: "Ulubiona łamigłówka informatyków",
    bullsandcows_history_modern_p1: "Ponieważ sprowadza się do szukania ukrytej odpowiedzi wyłącznie na podstawie liczby trafień, gra stała się standardowym przykładem w informatyce i kombinatoryce do badania strategii zgadywania i algorytmów wyszukiwania.",
    bullsandcows_history_modern_p2: "W znanym artykule z 1977 roku Donald Knuth wykazał, że klasyczną wersję z czterema pozycjami i sześcioma symbolami przy optymalnej strategii zawsze da się rozwiązać w najwyżej pięciu próbach - wynik ten jest cytowany do dziś, gdy mowa o algorytmach wyszukiwania."
});
I18n.markTextLoaded("pl");
