// i18n.js
// Minimal, dependency-free i18n. Adding a language later means adding one
// object to STRINGS below - no other code needs to change. Missing keys in
// a non-English language fall back to English rather than showing nothing.

const STRINGS = {
  en: {
    nav_home: "Home",
    nav_play: "Play",
    nav_rules: "Rules",
    nav_guide: "Guide",
    nav_about: "About",

    home_tagline: "Chess, built for e-readers.",
    home_intro: "A small, dependency-free chess app made for E-Ink displays like Tolino, Kobo and Kindle: high contrast, no animations, and it keeps working with no internet connection once you've opened it.",
    home_play_button: "▶ Choose a game",
    home_play_desc: "Local 2-player, vs. the built-in engine, or online via Lichess.",
    home_rules_desc: "How the pieces move, check, castling, and the draw rules.",
    home_guide_desc: "Get it onto your e-reader and keep it working offline.",
    home_about_desc: "Why this exists, and how to say thanks.",
    home_games_title: "Choose a game",
    home_chess_desc: "The classic game. Local 2-player, vs. the built-in engine, or online via Lichess.",
    home_go_desc: "The ancient territory game. Local 2-player or vs. the built-in engine, three board sizes, three difficulty levels.",
    home_more_games_title: "More games, one day",
    home_more_games_intro: "eInkChess is built so more E-Ink-friendly board games can join it here later - nothing below exists yet.",
    home_coming_soon: "Coming soon",
    game_chess: "Chess",
    game_go: "Go",
    game_checkers: "Checkers",
    game_backgammon: "Backgammon",
    game_ur: "Royal Game of Ur",
    game_xiangqi: "Xiangqi (Chinese Chess)",

    chess_piece_pawn: "Pawn",
    chess_piece_knight: "Knight",
    chess_piece_bishop: "Bishop",
    chess_piece_rook: "Rook",
    chess_piece_queen: "Queen",
    chess_piece_king: "King",
    chess_term_castling: "Castling",
    chess_term_en_passant: "En passant",
    chess_term_promotion: "Promotion",
    chess_term_checkmate: "Checkmate",
    chess_term_stalemate: "Stalemate",
    chess_term_threefold: "Threefold repetition",
    chess_term_fifty_move: "Fifty-move rule",
    chess_term_insufficient: "Insufficient material",

    chess_rules_title: "Chess Rules",
    chess_rules_intro: "A quick reference for how eInkChess plays the game - useful if you're rusty, or learning.",
    chess_rules_movement_title: "How the pieces move",
    chess_rules_pawn: "One square forward (two from its starting square), captures one square diagonally forward. Reaching the far side promotes it to any other piece (eInkChess always promotes to a queen).",
    chess_rules_knight: "Moves in an L-shape (two squares one way, one square perpendicular) and is the only piece that can jump over others.",
    chess_rules_bishop: "Any number of squares diagonally. Stays on one square color for the whole game.",
    chess_rules_rook: "Any number of squares horizontally or vertically.",
    chess_rules_queen: "Any number of squares in any direction - combines the rook and bishop.",
    chess_rules_king: "One square in any direction. Can never move into check.",
    chess_rules_special_title: "Special moves",
    chess_rules_castling: "The king moves two squares toward a rook, and that rook jumps to the square beside the king. Only if neither piece has moved yet, the squares between them are empty, and the king isn't in, through, or ending in check.",
    chess_rules_en_passant: "If an enemy pawn advances two squares and lands beside yours, your pawn may capture it as if it had only moved one square - but only immediately on the next move.",
    chess_rules_promotion: "A pawn reaching the last rank becomes another piece, almost always a queen.",
    chess_rules_end_title: "How a game ends",
    chess_rules_checkmate: "The king is in check with no legal move to escape it. That side loses.",
    chess_rules_stalemate: "The side to move has no legal move and isn't in check. The game is a draw.",
    chess_rules_draws_title: "Draws by rule",
    chess_rules_threefold: "The exact same position occurs three times.",
    chess_rules_fifty_move: "Fifty moves pass (by both sides) with no pawn move and no capture.",
    chess_rules_insufficient: "Neither side has enough pieces left to possibly checkmate (e.g. king vs. king, or king and bishop vs. king).",

    go_rules_title: "Go Rules",
    go_rules_intro: "A quick reference for how eInkChess plays Go - useful if you're rusty, or learning.",
    go_rules_basics_title: "The basic idea",
    go_term_stones: "Stones",
    go_rules_stones: "Black and White place stones on empty intersections in turn, starting with Black. Stones never move once placed - the board fills up rather than pieces sliding around.",
    go_term_liberties: "Liberties",
    go_rules_liberties: "A stone's liberties are the empty points directly next to it (up/down/left/right, not diagonally). Connected stones of the same color share their liberties as one group.",
    go_term_capture: "Capture",
    go_rules_capture: "A group with no liberties left is captured and removed from the board immediately after the opponent's move.",
    go_rules_illegal_title: "Illegal moves",
    go_term_suicide: "Suicide",
    go_rules_suicide: "You may not play a stone that would leave your own group with zero liberties, unless doing so captures enough enemy stones to free it first.",
    go_term_ko: "Ko",
    go_rules_ko: "You may not immediately recapture a single stone in a way that would recreate the position from just before your opponent's last move - you must play elsewhere first.",
    go_rules_end_title: "How a game ends",
    go_term_passing: "Passing",
    go_rules_passing: "Either player may pass instead of placing a stone. When both players pass one after another, the game ends and is scored.",
    go_term_scoring: "Scoring",
    go_rules_scoring: "eInkChess uses area scoring: your score is your own stones on the board plus empty points surrounded only by your stones. Points bordering both colors count for neither side.",
    go_term_komi: "Komi",
    go_rules_komi: "White moves second, so White gets a fixed bonus (komi, 7.5 points in eInkChess) to balance that disadvantage. Ties are therefore impossible.",
    go_term_resignation: "Resignation",
    go_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",

    back_home: "← Back to home",

    guide_title: "Guide: eInkChess on your device",
    guide_intro: "Three ways to get eInkChess onto an e-reader, roughly from easiest to most manual.",
    guide_web_title: "1. Just open it in the browser",
    guide_web_body: "Open this same web address in your e-reader's browser and bookmark it. After the first visit, eInkChess caches itself for offline use automatically - close the WiFi and it keeps working. Only the online Lichess mode needs an actual connection.",
    guide_pwa_title: "2. Add it to the home screen",
    guide_pwa_body: "If your e-reader's browser offers “Add to Home Screen” or “Install app”, use it. eInkChess then opens like a regular app, full-screen, without browser chrome around it.",
    guide_sideload_title: "3. Sideload via USB",
    guide_sideload_body: "Copy all the app's files onto the device over USB and open index.html directly from local storage (a file:// address). Offline play works exactly the same way. The one thing that doesn't work over file:// is Lichess login (OAuth requires a real http/https address) - local 2-player and vs-computer modes are unaffected.",
    guide_offline_title: "What works offline",
    guide_offline_body: "Everything except online Lichess games: local 2-player, the built-in computer opponent at every level, and all the rules (checkmate, stalemate, draws) run entirely on the device, no server involved.",

    about_intro: "I searched for a simple chess game for my eReader — but all I found were people searching, not playing. So I built my own. That’s how eInkChess was born, and I’m happy to share it with everyone.",
    about_donate_intro: "If you enjoy eInkChess or have ideas for improvements, you can send feedback and support the project here:",
    about_donate_button: "Buy me a coffee ☕",
    about_qr_text: "Or scan this QR code to open the donation page on your phone:",
    about_credits: "Chess piece set (“cburnett”) by Colin M.L. Burnett, used under the BSD license.",
    about_back: "← Back to the board"
  },
  de: {
    nav_home: "Start",
    nav_play: "Spielen",
    nav_rules: "Regeln",
    nav_guide: "Anleitung",
    nav_about: "Über",

    home_tagline: "Schach, gemacht für E-Reader.",
    home_intro: "Eine kleine Schach-App ohne Abhängigkeiten, gebaut für E-Ink-Displays wie Tolino, Kobo und Kindle: hoher Kontrast, keine Animationen, und funktioniert nach dem ersten Öffnen auch ohne Internetverbindung weiter.",
    home_play_button: "▶ Spiel wählen",
    home_play_desc: "Lokal zu zweit, gegen die eingebaute KI, oder online via Lichess.",
    home_rules_desc: "Wie die Figuren ziehen, Schach, Rochade und die Remis-Regeln.",
    home_guide_desc: "So kommt es auf deinen E-Reader und bleibt offline nutzbar.",
    home_about_desc: "Warum es das gibt, und wie man Danke sagen kann.",
    home_games_title: "Spiel wählen",
    home_chess_desc: "Der Klassiker. Lokal zu zweit, gegen die eingebaute KI, oder online via Lichess.",
    home_go_desc: "Das uralte Gebietsspiel. Lokal zu zweit oder gegen die eingebaute KI, drei Brettgrößen, drei Schwierigkeitsstufen.",
    home_more_games_title: "Mehr Spiele, irgendwann",
    home_more_games_intro: "eInkChess ist so gebaut, dass später weitere E-Ink-freundliche Brettspiele dazukommen können – unten steht noch nichts davon wirklich bereit.",
    home_coming_soon: "Demnächst",
    game_chess: "Schach",
    game_go: "Go",
    game_checkers: "Dame",
    game_backgammon: "Backgammon",
    game_ur: "Königliches Spiel von Ur",
    game_xiangqi: "Xiangqi (Chinesisches Schach)",

    chess_piece_pawn: "Bauer",
    chess_piece_knight: "Springer",
    chess_piece_bishop: "Läufer",
    chess_piece_rook: "Turm",
    chess_piece_queen: "Dame",
    chess_piece_king: "König",
    chess_term_castling: "Rochade",
    chess_term_en_passant: "En passant",
    chess_term_promotion: "Bauernumwandlung",
    chess_term_checkmate: "Schachmatt",
    chess_term_stalemate: "Patt",
    chess_term_threefold: "Dreifache Stellungswiederholung",
    chess_term_fifty_move: "50-Züge-Regel",
    chess_term_insufficient: "Unzureichendes Material",

    chess_rules_title: "Schachregeln",
    chess_rules_intro: "Eine kurze Übersicht, wie eInkChess Schach spielt – nützlich zum Auffrischen oder Lernen.",
    chess_rules_movement_title: "Wie die Figuren ziehen",
    chess_rules_pawn: "Ein Feld vorwärts (vom Startfeld aus zwei), schlägt ein Feld diagonal vorwärts. Erreicht er die gegnüberliegende Grundreihe, wird er umgewandelt (eInkChess wandelt immer in eine Dame um).",
    chess_rules_knight: "Zieht im L-Muster (zwei Felder in eine Richtung, ein Feld quer dazu) und ist die einzige Figur, die andere überspringen kann.",
    chess_rules_bishop: "Beliebig viele Felder diagonal. Bleibt das ganze Spiel über auf einer Feldfarbe.",
    chess_rules_rook: "Beliebig viele Felder waagerecht oder senkrecht.",
    chess_rules_queen: "Beliebig viele Felder in jede Richtung – vereint Turm und Läufer.",
    chess_rules_king: "Ein Feld in jede Richtung. Darf sich nie ins Schach ziehen.",
    chess_rules_special_title: "Sonderzüge",
    chess_rules_castling: "Der König zieht zwei Felder auf einen Turm zu, dieser Turm springt auf das Feld daneben. Nur möglich, wenn beide Figuren noch nicht gezogen haben, die Felder dazwischen frei sind und der König weder im Schach steht noch durch ein bedrohtes Feld zieht oder im Schach landet.",
    chess_rules_en_passant: "Zieht ein gegnerischer Bauer zwei Felder vor und landet neben deinem, darfst du ihn so schlagen, als wäre er nur ein Feld gezogen – aber nur direkt im nächsten Zug.",
    chess_rules_promotion: "Ein Bauer, der die letzte Reihe erreicht, wird zu einer anderen Figur, fast immer einer Dame.",
    chess_rules_end_title: "Wie eine Partie endet",
    chess_rules_checkmate: "Der König steht im Schach und es gibt keinen legalen Zug, das zu ändern. Diese Seite verliert.",
    chess_rules_stalemate: "Die Seite am Zug hat keinen legalen Zug und steht nicht im Schach. Die Partie ist remis.",
    chess_rules_draws_title: "Remis nach Regel",
    chess_rules_threefold: "Die exakt gleiche Stellung tritt dreimal auf.",
    chess_rules_fifty_move: "50 Züge (beider Seiten) vergehen ohne Bauernzug und ohne Schlagen.",
    chess_rules_insufficient: "Keine Seite hat noch genug Material, um überhaupt matt setzen zu können (z. B. König gegen König, oder König und Läufer gegen König).",

    go_rules_title: "Go-Regeln",
    go_rules_intro: "Eine kurze Übersicht, wie eInkChess Go spielt – nützlich zum Auffrischen oder Lernen.",
    go_rules_basics_title: "Die Grundidee",
    go_term_stones: "Steine",
    go_rules_stones: "Schwarz und Weiß setzen abwechselnd Steine auf freie Schnittpunkte, Schwarz beginnt. Steine bewegen sich nie – das Brett füllt sich, statt dass Figuren verschoben werden.",
    go_term_liberties: "Freiheiten",
    go_rules_liberties: "Die Freiheiten eines Steins sind die direkt angrenzenden freien Punkte (oben/unten/links/rechts, nicht diagonal). Verbundene Steine derselben Farbe teilen sich ihre Freiheiten als eine Gruppe.",
    go_term_capture: "Schlagen",
    go_rules_capture: "Eine Gruppe ohne verbleibende Freiheiten wird sofort nach dem gegnerischen Zug geschlagen und vom Brett entfernt.",
    go_rules_illegal_title: "Verbotene Züge",
    go_term_suicide: "Selbstmordzug",
    go_rules_suicide: "Du darfst keinen Stein setzen, der die eigene Gruppe ohne Freiheiten zurücklässt – außer der Zug schlägt zuerst genug gegnerische Steine, um sie zu befreien.",
    go_term_ko: "Ko",
    go_rules_ko: "Du darfst einen einzelnen Stein nicht sofort so zurückschlagen, dass die Stellung von vor dem letzten gegnerischen Zug wiederhergestellt würde – du musst zuerst woanders ziehen.",
    go_rules_end_title: "Wie eine Partie endet",
    go_term_passing: "Passen",
    go_rules_passing: "Jeder Spieler kann passen, statt einen Stein zu setzen. Passen beide Spieler nacheinander, endet die Partie und wird gewertet.",
    go_term_scoring: "Wertung",
    go_rules_scoring: "eInkChess nutzt die Gebietszählung (chinesische Zählweise): Der Punktestand ist die Anzahl eigener Steine auf dem Brett plus freie Punkte, die nur von eigenen Steinen umgeben sind. Punkte, die an beide Farben grenzen, zählen für keine Seite.",
    go_term_komi: "Komi",
    go_rules_komi: "Weiß zieht als Zweiter, deshalb bekommt Weiß einen festen Ausgleichsbonus (Komi, in eInkChess 7,5 Punkte). Unentschieden sind dadurch unmöglich.",
    go_term_resignation: "Aufgabe",
    go_rules_resignation: "Ein Spieler kann jederzeit aufgeben, wodurch die Partie sofort zugunsten des Gegners endet.",

    back_home: "← Zurück zur Startseite",

    guide_title: "Anleitung: eInkChess auf deinem Gerät",
    guide_intro: "Drei Wege, eInkChess auf einen E-Reader zu bekommen – ungefähr vom einfachsten zum manuellsten sortiert.",
    guide_web_title: "1. Einfach im Browser öffnen",
    guide_web_body: "Öffne genau diese Adresse im Browser deines E-Readers und setze ein Lesezeichen. Nach dem ersten Besuch cached sich eInkChess automatisch für die Offline-Nutzung – WLAN aus, und es funktioniert weiter. Nur der Online-Modus mit Lichess braucht eine echte Verbindung.",
    guide_pwa_title: "2. Zum Homescreen hinzufügen",
    guide_pwa_body: "Bietet der Browser deines E-Readers “Zum Startbildschirm hinzufügen” oder “App installieren” an, nutze das. eInkChess öffnet sich dann wie eine normale App, im Vollbild, ohne Browser-Leiste drumherum.",
    guide_sideload_title: "3. Per USB seitladen",
    guide_sideload_body: "Kopiere alle Dateien der App per USB auf das Gerät und öffne index.html direkt aus dem lokalen Speicher (eine file://-Adresse). Offline-Spielen funktioniert genauso. Das Einzige, was über file:// nicht geht, ist der Lichess-Login (OAuth braucht eine echte http/https-Adresse) – der lokale 2-Spieler- und der Computer-Modus sind davon nicht betroffen.",
    guide_offline_title: "Was offline funktioniert",
    guide_offline_body: "Alles außer Online-Partien über Lichess: lokal zu zweit, der eingebaute Computergegner auf jeder Stufe, und alle Regeln (Schachmatt, Patt, Remis) laufen komplett auf dem Gerät, ganz ohne Server.",

    about_intro: "Ich habe nach einem einfachen Schachspiel für meinen eReader gesucht — gefunden habe ich nur andere, die auch suchten, statt zu spielen. Also habe ich mein eigenes gebaut. So ist eInkChess entstanden, und ich freue mich, es mit allen zu teilen.",
    about_donate_intro: "Wenn dir eInkChess gefällt oder du Ideen für Verbesserungen hast, kannst du hier Feedback schicken und das Projekt unterstützen:",
    about_donate_button: "Spendier mir einen Kaffee ☕",
    about_qr_text: "Oder scanne diesen QR-Code, um die Spendenseite auf dem Handy zu öffnen:",
    about_credits: "Figurensatz („cburnett“) von Colin M.L. Burnett, verwendet unter der BSD-Lizenz.",
    about_back: "← Zurück zum Brett"
  }
};

const I18n = (function () {
  const STORAGE_KEY = "einkchess_lang";
  const DEFAULT_LANG = "en";

  function safeGet(key) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (e) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      if (window.localStorage) window.localStorage.setItem(key, value);
    } catch (e) {
      // egal - Sprache faellt dann beim naechsten Laden auf den Default zurueck
    }
  }

  function detectBrowserLang() {
    try {
      const lang = (navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();
      return STRINGS[lang] ? lang : DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function getLang() {
    const saved = safeGet(STORAGE_KEY);
    if (saved && STRINGS[saved]) return saved;
    return detectBrowserLang();
  }

  function t(key, lang) {
    const l = lang || getLang();
    const table = STRINGS[l] || STRINGS[DEFAULT_LANG];
    return (table && table[key]) || (STRINGS[DEFAULT_LANG] && STRINGS[DEFAULT_LANG][key]) || key;
  }

  function apply(lang) {
    const l = lang || getLang();
    if (document.documentElement) document.documentElement.lang = l;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"), l);
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      // Format: data-i18n-attr="title:some_key,placeholder:other_key"
      el.getAttribute("data-i18n-attr").split(",").forEach((pair) => {
        const parts = pair.split(":");
        const attr = parts[0] && parts[0].trim();
        const key = parts[1] && parts[1].trim();
        if (attr && key) el.setAttribute(attr, t(key, l));
      });
    });

    document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
      btn.classList.toggle("active-mode", btn.getAttribute("data-lang") === l);
    });
  }

  function setLang(lang) {
    if (!STRINGS[lang]) return;
    safeSet(STORAGE_KEY, lang);
    apply(lang);
  }

  function init() {
    apply(getLang());
    document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
    });
  }

  return {
    t: t,
    getLang: getLang,
    setLang: setLang,
    apply: apply,
    init: init,
    languages: Object.keys(STRINGS)
  };
})();

if (typeof window !== "undefined") {
  window.I18n = I18n;
  document.addEventListener("DOMContentLoaded", I18n.init);
}
