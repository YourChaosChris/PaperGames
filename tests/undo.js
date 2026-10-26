#!/usr/bin/env node
// Source and logic checks for Undo in computer games. No browser required.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const status = fs.readFileSync(path.join(ROOT, "tests/ui-status.js"), "utf8");
const gamesBlock = status.split("const games = [")[1].split("];", 1)[0];
const games = [...gamesBlock.matchAll(/"([a-z0-9]+)"/g)].map((m) => m[1]).concat("chess");
const exceptions = {
  bingo: "Bingo draws are random and the call history is not saved, so an undo could not restore the exact draw state.",
  blockers: "Dice rolls are generated randomly and the roll state is not saved.",
  cardduel: "Private hands and deck order are hidden; undoing a revealed computer play would preserve information the player has learned.",
  concan: "Private hands and stock draws are hidden; undoing a revealed computer play or draw would preserve information the player has learned.",
  domino: "The computer's hidden tiles and the boneyard are not stored in undo history; undoing a played tile would reveal information.",
  doppelkopf: "Hands are private; undoing a revealed card would preserve information the player has learned.",
  durak: "Hands and the draw pile are private; undoing a revealed attack or defense would preserve information.",
  fleetbattle: "The opponent's ship placement is hidden; undo would expose information about the hidden board.",
  forestvillage: "Private hands and the shared card supply are not stored in undo history; undoing a computer build or draw would expose hidden information.",
  maumau: "Hands and the draw pile are private and the discard pile can be shuffled back into stock; exact random state is not saved.",
  pairs: "Face-down card locations are hidden; undoing a computer reveal would disclose their positions.",
  poker: "Hole cards and deck order are private; undoing a revealed computer action would preserve information about them.",
  romme: "Hands are private and the discard can be reshuffled into stock; exact random state is not saved.",
  schwimmen: "Hands and the stock are private; undoing revealed cards would preserve information the player has learned.",
  snakesladders: "Dice rolls are generated randomly and the roll state is not saved.",
  trix: "Hands are private; undoing a played card would preserve information the player has learned.",
  villains: "Hands and card decks are private; undoing a revealed computer play or draw would preserve information.",
  weidefreunde: "The animal die is rolled randomly and the roll state is not saved, so an undo could not restore the exact state.",
  teufelsieben: "The cards come from a hidden shuffled deck; taking a card back would show the next one.",
  gipfelwurf: "The three dice are rolled at random; taking a roll back would let the player roll again until the ridge fits.",
  tieryatzy: "The animal dice are rolled randomly and the roll state is not saved, so an undo could not restore the exact state.",
  zoowurf: "The animal dice are rolled randomly and the roll state is not saved, so an undo could not restore the exact state.",
  war: "The round reveals both hidden cards at once; undo would let a player retain knowledge of the computer's card."
};
const failures = [];
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const undoPages = fs.readdirSync(ROOT).filter((name) => name.endsWith(".html") && /id="undo-btn"/.test(read(name)));
if (undoPages.length !== 56) failures.push(`expected the 56 existing Undo pages, found ${undoPages.length}`);
for (const page of undoPages) {
  const html = read(page);
  if (!/data-i18n="undo_button"/.test(html)) failures.push(`${page}: button must use the shared localized Undo label`);
  if (!/<button\b[^>]*id="undo-btn"[^>]*\bdisabled\b/.test(html)) failures.push(`${page}: Undo must start disabled without history`);
}
for (const game of games) {
  const html = read(`${game}.html`);
  const appFile = game === "chess" ? "app.js" : `${game}-app.js`;
  const app = read(appFile);
  if (exceptions[game]) {
    if (!exceptions[game].trim()) failures.push(`${game}: exception needs a reason`);
    continue;
  }
  if (!/id="undo-btn"/.test(html)) failures.push(`${game}: missing Undo button`);
  if (!/data-i18n="undo_button"/.test(html)) failures.push(`${game}: button must use shared localized Undo label`);
  if (!/\bdisabled\b/.test(html) || !/\.disabled\s*=\s*!/.test(app)) failures.push(`${game}: Undo must be disabled when no snapshot exists`);
  if (/classList\.toggle\("hidden",[^;]*(?:undoStack|hasUndo)/.test(app)) failures.push(`${game}: Undo is hidden instead of remaining available after game end`);
  const undo = app.match(/function undo\w*\([^)]*\)\s*\{[\s\S]{0,2400}?\n\}/);
  if (!undo) failures.push(`${game}: missing undo handler`);
  else {
    if (!/undoStack/.test(undo[0])) failures.push(`${game}: undo handler does not restore snapshots`);
    if (game !== "chess" && !/while\s*\(/.test(undo[0])) failures.push(`${game}: computer mode must undo through the computer reply`);
    if (/gameOver\)\s*return|\.gameOver\s*\|\|\s*!/.test(undo[0])) failures.push(`${game}: undo is blocked after game end`);
  }
  if (!/undoStack\.push\(/.test(app)) failures.push(`${game}: no pre-move snapshots are recorded`);
  if (!/GameStorage\.save\([\s\S]{0,900}undoStack: [^,]+\.slice\(-50\)/.test(app)) failures.push(`${game}: saved games do not include the bounded undo history`);
  if (!/undoStack = Array\.isArray\(\w+\.undoStack\) \? \w+\.undoStack : \[\]/.test(app)) failures.push(`${game}: old saves without history are not loaded safely`);
  // A zero-delay call of a named function (e.g. Sternjagd looking at its
  // settings again after quick-rules.js restored them) is no computer work.
  const timers = app.replace(/setTimeout\(\s*[A-Za-z_$][\w$]*\s*,\s*0\s*\)/g, "");
  if (/setTimeout/.test(timers) && !/(scheduledFor|state\s*!==|state\s*===|turn\s*!==|turn\s*===|currentPlayer|moveToken|generation)/.test(app)) {
    failures.push(`${game}: pending computer work has no stale-turn/state guard after Undo`);
  }
}
for (const game of Object.keys(exceptions)) if (!games.includes(game)) failures.push(`${game}: exception is not a computer game`);

// Exercise the same history rule used by the game apps: a computer game
// removes the computer response and the human move as one step; hotseat
// removes one ply. Snapshots include opaque state such as decks and dice.
function clone(state) { return JSON.parse(JSON.stringify(state)); }
function roundTrip(mode) {
  const state = { board: [0], deck: ["hidden-a", "hidden-b"], random: 17, turn: "human", over: false };
  const stack = [];
  const save = () => stack.push(clone(state));
  save(); // before human move
  state.board.push("human move"); state.turn = "computer";
  save(); // before computer reply
  state.board.push("computer reply"); state.turn = "human"; state.over = true;
  let previous = stack.pop();
  if (mode === "computer") {
    previous = stack.pop();
  }
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, previous);
  return state;
}
const start = { board: [0], deck: ["hidden-a", "hidden-b"], random: 17, turn: "human", over: false };
if (JSON.stringify(roundTrip("computer")) !== JSON.stringify(start)) failures.push("logic: human move + computer reply + undo did not restore the full starting state");
if (JSON.stringify(roundTrip("hotseat")) !== JSON.stringify({ board: [0, "human move"], deck: ["hidden-a", "hidden-b"], random: 17, turn: "computer", over: false })) failures.push("logic: hotseat undo did not restore exactly one move");

if (failures.length) {
  console.error("Undo checks failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log(`Undo pass: ${undoPages.length} existing Undo pages checked; ${games.length} computer games checked; ${games.length - Object.keys(exceptions).length} with Undo and ${Object.keys(exceptions).length} documented exceptions; saved history compatibility and turn logic passed.`);
console.log("Exceptions:");
for (const [game, reason] of Object.entries(exceptions)) console.log(`- ${game}: ${reason}`);
