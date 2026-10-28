// text/pl/mahjong.js
// Rules and history texts of mahjong (pl). Loaded by mahjong-rules.html and mahjong-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.pl, {
    mahjong_rules_title: "Zasady Mahjong Solitaire",
    mahjong_rules_intro: "Krótkie przypomnienie zasad, według których PaperGames rozgrywa Mahjong Solitaire - przydatne, jeśli dawno nie grałeś albo dopiero się uczysz.",
    mahjong_rules_basics_title: "Podstawowa idea",
    mahjong_term_layout: "Układ",
    mahjong_rules_layout: "80 kafelków jest ułożonych w trzech warstwach w kształcie przypominającym piramidę. Kafelek można podnieść tylko wtedy, gdy nic na nim nie leży i przynajmniej jeden z jego bezpośrednich sąsiadów po lewej lub prawej stronie, na tej samej warstwie, brakuje albo został już usunięty.",
    mahjong_term_matching: "Dopasowywanie",
    mahjong_rules_matching: "Kliknij wolny kafelek, a potem kliknij inny wolny kafelek z tym samym symbolem, by usunąć oba z planszy. Każdy układ jest generowany tak, by pełne usunięcie z pozycji startowej było zawsze możliwe, choć nieostrożna kolejność dopasowań wciąż może utknąć w połowie gry.",
    mahjong_term_shuffle: "Utknięcie",
    mahjong_rules_shuffle: "Jeśli nigdzie na planszy nie zostało żadne legalne dopasowanie, użyj przycisku Przetasuj pozostałe kafelki, by rozdać na nowo symbole na tym, co zostało - od tego momentu gwarantowane jest nowe rozwiązanie, więc jedna utknięta pozycja nigdy nie oznacza konieczności zaczynania od zera.",
    mahjong_rules_end_title: "Kończenie gry",
    mahjong_term_win: "Ukończone",
    mahjong_rules_win: "Plansza jest oczyszczona w chwili, gdy każdy kafelek został dopasowany i usunięty.",
    mahjong_history_title: "Historia Mahjong Solitaire",
    mahjong_history_origins_title: "Pożyczone kafelki, nowa gra",
    mahjong_history_origins_p1: "Mahjong Solitaire (nazywany też Shanghai) nie jest tradycyjną chińską grą. Wykorzystuje pięknie ilustrowany zestaw kafelków z gry dla czterech graczy Mahjong (samej w sobie chińskiego dzieła z XIX wieku) do zupełnie innej łamigłówki dla jednego gracza, polegającej na dopasowywaniu par, bez układów, odrzuconych kafelków ani punktowanych układów oryginalnej gry. Najwcześniejsza udokumentowana wersja to gra komputerowa: Brodie Lockard napisał ją w 1981 roku na system PLATO.",
    mahjong_history_origins_p2: "Kto dokładnie pierwszy połączył format solitera opartego na dopasowywaniu par z kafelkami Mahjong, jest naprawdę niejasne, a konkurencyjne twierdzenia sięgają dekad przed erą komputerów - pewne jest natomiast to, że to połączenie nie stało się globalnym fenomenem, dopóki nie przeskoczyło na komputery osobiste.",
    mahjong_history_spread_title: "Stały element ekranów komputerów lat 80.",
    mahjong_history_spread_p1: "Gra dotarła do masowej publiczności dzięki wczesnym wersjom komputerowym z lat 80., a zwłaszcza wydanemu przez Activision w 1986 roku \"Shanghai\" na Macintosha - na tyle popularnemu, że nazwa \"Shanghai\" stała się, i w wielu miejscach wciąż pozostaje, alternatywną nazwą dla całego gatunku gier typu soliter polegających na dopasowywaniu kafelków, zbudowanych wokół klasycznego, warstwowego układu.",
    mahjong_history_spread_p2: "Układ, który dał grze jej nazwę - schodkowy, przypominający piramidę kopiec, nazywany przez graczy \"Żółwiem\" - stał się tak silnie kojarzony z tym gatunkiem, że większość implementacji, w tym ta, domyślnie stosuje jakąś jego odmianę, zamiast wymyślać nowy kształt.",
    mahjong_history_modern_title: "Łamigłówka rozwiązywalna z założenia",
    mahjong_history_modern_p1: "W przeciwieństwie do gry takiej jak Sudoku czy Nonogram, gdzie jednoznaczność rozwiązania sprawdza się dopiero po zaprojektowaniu łamigłówki, rozdanie w Mahjong Solitaire jest zwykle gwarantowane jako rozgrywalne w inny sposób: wiele implementacji, w tym ta w PaperGames, buduje rozdanie, pracując wstecz od pustej planszy i odtwarzając w odwrotnej kolejności legalną sekwencję usuwania, by zdecydować, gdzie trafi który symbol.",
    mahjong_history_modern_p2: "Gwarantuje to istnienie co najmniej jednej zwycięskiej ścieżki od samego pierwszego postawionego kafelka, ale - dokładnie jak w przypadku prawdziwej talii kart do Klondike'a - nie mówi niczego o tym, czy jakakolwiek konkretna sekwencja dopasowań, które gracz faktycznie wykona, do niej doprowadzi, dlatego utknięcie w połowie w pełni rozwiązywalnego rozdania jest normalną, oczekiwaną częścią gry, a nie oznaką, że coś poszło nie tak."
});
I18n.markTextLoaded("pl");
