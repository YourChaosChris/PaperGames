// text/pl/pegsolitaire.js
// Rules and history texts of pegsolitaire (pl). Loaded by pegsolitaire-rules.html and pegsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    pegsolitaire_rules_title: "Zasady Solitera",
    pegsolitaire_rules_intro: "Krótkie przypomnienie zasad, według których PaperGames rozgrywa Solitera (grę w kołeczki) - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    pegsolitaire_rules_basics_title: "Podstawowa idea",
    pegsolitaire_term_board: "Plansza i pozycja startowa",
    pegsolitaire_rules_board: "Przed grą wybierasz planszę; domyślnie ustawiona jest angielska (33 pola). Każde pole zaczyna z kołkiem oprócz jednego – którego, podano dla każdej planszy w części „Plansze”.",
    pegsolitaire_term_jump: "Przeskakiwanie",
    pegsolitaire_rules_jump: "Wybierz kołeczek, a potem pusty otwór oddalony o dwa pola w linii prostej (w górę, w dół, w lewo lub w prawo - nigdy po przekątnej), między którymi stoi dokładnie jeden inny kołeczek. Kołeczek przeskakuje do pustego otworu, a przeskoczony kołeczek zostaje zdjęty z planszy. Wyjątek: na planszy trójkątnej wolno skakać także na ukos, wzdłuż jej skośnych linii.",
    pegsolitaire_rules_end_title: "Kończenie gry",
    pegsolitaire_term_win: "Rozwiązane",
    pegsolitaire_rules_win: "Klasyczny cel to przeskakiwanie kołeczkami aż do pozostawienia jednego. Gra kończy się też, nierozwiązana, w chwili gdy nie zostaje już żaden legalny skok, bez względu na to, ile kołeczków wciąż jest na planszy.",
    pegsolitaire_rules_boards_title: "Plansze",
    pegsolitaire_rules_boards: "Angielska: siatka 7x7 bez czterech narożników 2x2, 33 pola; środek jest pusty. Europejska: siatka 7x7, z której w każdym narożniku usunięto tylko trzy pola, 37 pól; puste jest pole tuż nad środkiem, bo od środka nie da się jej rozwiązać. Niemiecka (J. C. Wiegleb, 1779): siatka 9x9 bez czterech narożników 3x3, 45 pól; środek jest pusty. Kwadrat: pełna siatka 6x6, 36 pól; puste jest lewe górne z czterech środkowych pól. Duży romb: romb z 41 pól na siatce 9x9; puste jest pole dwa rzędy nad środkiem – na tej planszy w ogóle bardzo niewiele pól startowych daje się rozwiązać. Trójkąt: pięć rzędów po 1 do 5 pól, każdy rząd przesunięty o pół pola, 15 pól; puste jest lewe górne z trzech środkowych pól. Na wszystkich planszach z kwadratową siatką skacze się tylko poziomo lub pionowo, nigdy po przekątnej. Tylko na trójkącie wolno skakać także na ukos, wzdłuż jego skośnych linii – łącznie w sześciu kierunkach.",
    pegsolitaire_history_title: "Historia Solitera",
    pegsolitaire_history_origins_title: "Gra francuskiego dworu",
    pegsolitaire_history_origins_p1: "Najwcześniejsze potwierdzone dowody istnienia Solitera pochodzą z Francji końca XVII wieku, gdzie gra pojawia się na rycinie z 1697 roku i była na tyle modna na dworze Ludwika XIV, że wspominano o niej we współczesnych jej tekstach. Popularna legenda przypisuje jej wynalezienie francuskiemu szlachcicowi uwięzionemu w Bastylii -urocza historia, niemająca żadnego potwierdzenia i niemal na pewno wymyślona długo po fakcie, by nadać grze bardziej romantyczne pochodzenie.",
    pegsolitaire_history_origins_p2: "Plansza, która stała się standardem we Francji, ma 37 otworów (dodaje cztery narożniki do zwykłego krzyża), podczas gdy wersja, która rozprzestrzeniła się do Anglii - używany tutaj 33-otworowy krzyż - stała się bardziej powszechnym standardem w krajach anglojęzycznych.",
    pegsolitaire_history_spread_title: "Jedna plansza, wiele kształtów",
    pegsolitaire_history_spread_p1: "Poza klasycznym krzyżem, plansze do Solitera budowano także w kształcie trójkąta (z własną, 15-kołeczkową wersją, przez dekady stałym elementem stolików w amerykańskich restauracjach), rombu i innych układach - zasada przeskakiwania pozostaje identyczna bez względu na to, w jaki kształt ułożono otwory.",
    pegsolitaire_history_wiegleb: "Większy krzyż z 45 polami na siatce 9x9 opisał J. C. Wiegleb w 1779 roku w książce „Unterricht in der natürlichen Magie” (Nauka magii naturalnej).",
    pegsolitaire_history_spread_p2: "Ponieważ każdy ruch usuwa dokładnie jeden kołeczek, pełna gra od n kołeczków do 1 zawsze zajmuje dokładnie n-1 skoków - jeden z niewielu przypadków gry planszowej, w której liczba ruchów w wygranej partii jest ustalona z góry, niezależnie od tego, jaka konkretna sekwencja skoków do niej doprowadzi.",
    pegsolitaire_history_modern_title: "Rozwiązana łamigłówka, z pewnym zwrotem",
    pegsolitaire_history_modern_p1: "Soliter przyciągnął poważną uwagę matematyków w latach 60. i 70. XX wieku, gdy badacze, w tym John Conway, analizowali go za pomocą narzędzi takich jak liczniki zasobów (tak zwane funkcje pagodowe) i argumenty algebraiczne, by dokładnie ustalić, które końcowe pozycje z jednym kołeczkiem są osiągalne ze standardowej pozycji startowej - środek jest jedną z nich, choć nie jedyną.",
    pegsolitaire_history_modern_p2: "Późniejsze przeszukiwanie komputerowe rozstrzygnęło tę kwestię całkowicie dla planszy z 33 otworami: gra zaczynająca się od pustego środka może zostać doprowadzona do jednego kołeczka, a dokładna liczba wygrywających gier została obliczona - rzadki przypadek, gdy fizyczna łamigłówka przekształciła się w problem kombinatoryczny rozwiązany w pełni."
});
I18n.markTextLoaded("pl");
