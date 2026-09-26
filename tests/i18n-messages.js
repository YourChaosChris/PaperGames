#!/usr/bin/env node
// i18n-messages.js
// Checks I18n.msg(), which translates the English status lines, result
// popups and info lines the games build at runtime (see i18n.js). No
// server or browser needed: i18n.js is loaded into a plain Node VM.
//
// For every sample message and every non-English language it checks that
//  - the message is translated at all (output differs from the input),
//  - no {placeholder} is left unfilled,
//  - for languages without Latin script (uk, ru, ja, zh), no English word
//    is left over - i.e. every sentence of the message was matched.
// Screen-reader label samples are checked the same way.
// It also checks that every msg_t_* template has the same placeholders
// in all 11 languages.

const { I18n, STRINGS } = require("./load-i18n").loadI18n();

// One sample per message shape, as the games actually produce them.
const SAMPLES = [
  "Perpetual check is not allowed - this move would repeat the position a third time. Choose another move.",
  "Perpetual chase is not allowed - this move would repeat the position a third time. Choose another move.",
  "Draw by repetition: the same position occurred three times.",
  "Red wins: Black has no move left that avoids perpetual check or chase.",
  "Placing - 14 pieces left to place",
  "Placing - 1 piece left to place",
  "Computer thinking…",
  "Black to move.",
  "Move undone. White to move. Roll the dice.",
  "You play Black, computer level: Easy.",
  "White wins by resignation.",
  "Game is over. Start a new game to play again.",
  "Local 2‑player game (no computer).",
  "You win!",
  "You lose",
  "The computer wins",
  "Draw",
  "Solved!",
  "Move undone. Goats to move.",
  "Defenders played. Attackers to move.",
  "Defenders win",
  "Red moved token 2 forward 5.",
  "Red brought token 1 into play.",
  "Blue moved token 3 forward 6 and captured Red, Green!",
  "Yellow brought token 4 into play and captured Blue!",
  "Green moved token 1 forward 2 and got it home!",
  "Goats win",
  "Solved “Hourglass” - well done!",
  "Black wins (6 marbles pushed off the board).",
  "White wins (no legal moves).",
  "Black played. Marble pushed off! White to move.",
  "Black wins (backgammon) - 6 points!",
  "White wins (gammon, cube x2) - 8 points!",
  "Black wins (single game) - 1 point!",
  "Black wins by resignation - 1 point.",
  "White accepts. Cube is now 2. Black to roll.",
  "White declines the double. Black wins 1 point.",
  "Black doubles to 2. Computer is thinking…",
  "Black played. 1 die left to play.",
  "Black to move. 2 dice left to play.",
  "Black rolled 3-5. Choose a piece to move.",
  "Black rolled 6-6. No legal move - turn passes.",
  "Goats win by capturing 5 goats!",
  "Tigers win by capturing 5 goats!",
  "Goats win by trapping every tiger!",
  "Tigers win - the other side has no legal move!",
  "Goats win.",
  "Tigers played. A goat was captured! Goats to move.",
  "Attackers win by capturing the king!",
  "Defenders win as the king reaches a corner!",
  "Attackers win - the other side has no legal move!",
  "Red wins by reaching the shrine!",
  "Blue wins by capturing the master!",
  "Black wins (no pieces left).",
  "Black wins (reduced to two pieces).",
  "White wins (no legal moves left).",
  "Black wins (checkmate).",
  "It's a draw - Player 1: 12 · Player 2: 12.",
  "Player 1 wins! Player 1: 14 · Player 2: 10.",
  "Black wins 40-24!",
  "It's a draw, 32-32!",
  "White has no legal move and passes. Black to move again.",
  "Red wins - all 4 tokens home! Blue, Green sent home.",
  "Red captured Blue, Yellow!",
  "Red got a token home!",
  "Red played.",
  "Blue resigned. Red wins.",
  "Black threw a 4 - throw again!",
  "White captured a piece and throws again!",
  "Player 1 wins!",
  "It's a draw!",
  "Player 1 played, captured 4! Player 2 to move.",
  "Player 1 played. Player 2 to move.",
  "Black played. Mill! A piece was removed. White to move.",
  "Black captured. White to move.",
  "Both passed. Black wins by 7.5 (Black 45 – White 37.5).",
  "Invalid move: that point is already occupied.",
  "Invalid move: that would leave your stones with no liberties.",
  "Invalid move: forbidden by the ko rule (recaptures immediately).",
  "Invalid move: it would repeat an earlier board position (superko rule).",
  "You play White, computer level 3 (~1400 Elo (~2–4s/move)).",
  "Computer level 1 (~800 Elo (instant)).",
  "Computer level 2 active.",
  "Online game active. You play White. Opponent to move.",
  "Online game active. You play Black. Your move.",
  "Online: White vs Computer (level 3)",
  "Time control: 300s",
  "Your time: 4:59",
  "No game active",
  "Move: e2–e4. Black to move.",
  "Moving from e2 …",
  "Computer plays e7–e5. Your move.",
  "Checkmate! White wins.",
  "Resigned. Black wins.",
  "Resign failed: Unknown error.",
  "Searching for opponent…",
  "Sending move e2e4 …",
  "Move 12",
  "Captured – Black: 3 · White: 2",
  "Pushed off (of 6 to lose) – Black: 1 · White: 0",
  "Reachable squares – Player 1: 20 · Player 2: 18",
  "Cube: 2 (Black)",
  "Cube: 1",
  "Pips - Black: 167 · White: 167",
  "Goats placed: 3/20 · Captured: 0/5",
  "Movement phase · Captured: 2/5",
  "Boxes – Player 1: 3 · Player 2: 4",
  "12 / 30 satisfied",
  "40 / 81 filled",
  "Moves: 7",
  "44 tiles left",
  "12 cells revealed",
  "20 pegs",
  "Discs – Black: 10 · White: 8",
  "Black borne off: 1 / 5     White borne off: 0 / 5",
  "Score: 128   Best: 2048",
  "Walls left – Player 1: 10 · Player 2: 9",
  "Red (computer)",
  "Blue (you)",
  "You play Red against 3 computer player(s), level: Hard.",
  "Local 4-player hotseat game (no computer).",
  "Computer (Blue) rolled 6, thinking…",
  "Red rolled a third 6 in a row - turn forfeited!",
  "Red rolled a 6 - roll again!",
  "Red's turn. Roll the die.",
  "Move undone. Red's turn. Roll the die.",
  "All clear in 42 seconds - well done!",
  "All lights off in 1 move - well done!",
  "All lights off in 12 moves - well done!",
  "No more jumps available, with 3 pegs left. Try again!",
  "You reached 2048! Keep going for a higher score, or start a new game.",
  "No more moves left. Final score: 1234",
  "Not a match. Now click a matching free tile.",
  "White wins: Black repeated the position four times by perpetual check (sennichite).",
  "White to move. Check!",
  "Board ready. Black to move.",
  "Black wins (no legal jump available)."
];

// Screen-reader labels, translated part by part (I18n.setAria()).
const ARIA_SAMPLES = [
  "Path square 1, safe square, 1 token",
  "Path square 3, 2 tokens",
  "Row 3, column 4, White stone, movable",
  "e4, White knight, selected",
  "Square 3,4, Black 銀",
  "Square 12, House of Water, empty",
  "Red Chariot",
  "Bar, 2 Black checkers",
  "Borne off, 1 White checker",
  "Slot 2: Triangle. Tap to cycle through the shapes.",
  "Go board",
  "Tile ★, free",
  "Vertical line, row 2, column 3, drawn by Player 1",
  "Island 3,4: needs 2",
  "Row 1, column 2, on",
  "Free cell 2, empty",
  "Foundation ♠, up to K♠",
  "Black start, 3 pieces waiting",
  "Player 1 pit, 4 seeds",
  "Black piece (2), movable",
  "White hand, S, 2 available",
  "Die 1: 4",
  "Stock: 3 deals left",
  "Row 2, column 3, 3 adjacent mines",
  "top clue, 4, satisfied",
  "Black's hand",
  "Red home token, waiting",
  "Blue master",
  "Point 7, Tiger, capture available",
  "Row 4, column 5, King"
];

// Words that legitimately stay Latin in every language.
const LATIN_OK = /^(Elo|Lichess|OK|Done|Place|x\d*)$/;
const NON_LATIN = ["uk", "ru", "ja", "zh", "ar"];

let failures = 0;
function fail(msg) {
  failures++;
  console.log("FAIL " + msg);
}

const langs = Object.keys(STRINGS).filter((l) => l !== "en");
for (const lang of langs) {
  for (const sample of SAMPLES) {
    const out = I18n.msg(sample, lang);
    if (out === sample) fail(lang + ": not translated: " + JSON.stringify(sample));
    else if (/\{\w+\}/.test(out)) fail(lang + ": unfilled placeholder: " + JSON.stringify(out));
    else if (NON_LATIN.indexOf(lang) !== -1) {
      const leftover = (out.match(/[A-Za-z]{3,}/g) || []).filter((w) => !LATIN_OK.test(w));
      if (leftover.length) fail(lang + ": English left in " + JSON.stringify(out));
    }
  }
}

for (const lang of langs) {
  for (const sample of ARIA_SAMPLES) {
    const out = I18n.msg(sample, lang, { segments: true });
    if (out === sample) fail(lang + ": label not translated: " + JSON.stringify(sample));
    else if (NON_LATIN.indexOf(lang) !== -1) {
      const leftover = (out.match(/[A-Za-z]{3,}/g) || []).filter((w) => !LATIN_OK.test(w));
      if (leftover.length) fail(lang + ": English left in label " + JSON.stringify(out));
    }
  }
}

// English must pass through unchanged.
for (const sample of SAMPLES) {
  if (I18n.msg(sample, "en") !== sample) fail("en: changed " + JSON.stringify(sample));
}

// Template placeholders must match across languages.
const placeholders = (s) => (s.match(/\{\w+\}/g) || []).sort().join(",");
for (const key of Object.keys(STRINGS.en).filter((k) => k.indexOf("msg_t_") === 0)) {
  const want = placeholders(STRINGS.en[key]);
  for (const lang of langs) {
    if (placeholders(STRINGS[lang][key] || "") !== want) fail(lang + ": placeholders differ in " + key);
  }
}

console.log(`=== I18N MESSAGES: ${SAMPLES.length + ARIA_SAMPLES.length} samples x ${langs.length} languages, ${failures} failure(s) ===`);
process.exit(failures ? 1 : 0);
