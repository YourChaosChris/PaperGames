#!/usr/bin/env node
// Source-level guard that every computer-opponent game uses the shared
// localized turn and winner status sentences in its status path.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const games = [
  "alquerque", "amazons", "backgammon", "baghchal", "blockers", "cardduel",
  "cardtactics", "checkers", "concan", "domino", "doppelkopf", "dotsandboxes",
  "durak", "fanorona", "fleetbattle", "forestvillage", "fourinarow", "foxandgeese",
  "go", "gomoku", "halma", "hex", "hnefatafl", "konane", "ludo", "mancala",
  "marblepush", "maumau", "morris", "pairs", "poker", "reversi", "romme",
  "schwimmen", "seega", "senet", "shogi", "snakesladders", "sternhalma",
  "surakarta", "tablut", "tictactoe", "trix", "ur", "villains", "wallmaze",
  "war", "xiangqi"
];
const statusKeys = [
  "ui_status_your_turn", "ui_status_computer_turn",
  "ui_status_you_win", "ui_status_computer_wins"
];
// War reveals both cards together after the human taps; it has no separate
// computer-turn status phase. Its human-turn and decisive winner statuses
// still use the shared keys; a tied round remains the existing draw message.
const exceptions = {
  war: { keys: ["ui_status_computer_turn"], reason: "The round is simultaneous: there is no separate computer turn to announce." }
};
const failures = [];
for (const game of games) {
  const file = `${game}-app.js`;
  const source = fs.readFileSync(path.join(ROOT, file), "utf8");
  const allowedMissing = new Set(exceptions[game] ? exceptions[game].keys : []);
  for (const key of statusKeys) {
    if (allowedMissing.has(key)) continue;
    if (!source.includes(`"${key}"`)) failures.push(`${file}: missing ${key}`);
  }
}
// Chess lives in app.js and also has an online mode; these shared statuses
// are used only when its local computer mode is active.
const chess = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
for (const key of statusKeys) if (!chess.includes(`"${key}"`)) failures.push(`app.js (Chess): missing ${key}`);
for (const [game, exception] of Object.entries(exceptions)) {
  if (!exception.reason.trim()) failures.push(`${game}: exception needs a reason`);
}
if (failures.length) {
  console.error("UI status checks failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log(`UI status pass: ${games.length + 1} computer games checked; ${Object.keys(exceptions).length} documented exception.`);
