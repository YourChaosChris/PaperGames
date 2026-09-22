// game-stats.js
// Tiny shared localStorage-backed win/loss/draw tracker, recorded only
// for local games against the built-in AI (not 2-player hotseat games,
// which have no single "you", and not online chess, which Lichess
// already tracks). Read by stats.html.

const GameStats = (function () {
  const KEY = "einkchess_stats";
  const GAMES = ["chess", "go", "checkers", "ur", "morris", "backgammon", "xiangqi", "mancala", "othello", "connectfour", "gomoku", "senet", "shogi", "sudoku", "pegsolitaire", "minesweeper", "nonogram", "twenty48", "mahjong", "freecell", "onitama", "hnefatafl", "quoridor", "hex", "halma", "lightsout", "mastermind", "dotsandboxes", "amazons", "kakuro", "fanorona", "sternhalma", "baghchal", "tablut", "abalone", "pyramidsolitaire", "surakarta"];

  function loadAll() {
    try {
      if (!window.localStorage) return {};
      const raw = window.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveAll(data) {
    try {
      if (window.localStorage) window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* storage unavailable or full - just don't persist */ }
  }

  function emptyRecord() {
    return { wins: 0, losses: 0, draws: 0 };
  }

  // outcome is from the human player's perspective: "win" | "loss" | "draw"
  function record(game, outcome) {
    if (GAMES.indexOf(game) === -1) return;
    if (outcome !== "win" && outcome !== "loss" && outcome !== "draw") return;
    const all = loadAll();
    if (!all[game]) all[game] = emptyRecord();
    if (outcome === "win") all[game].wins++;
    else if (outcome === "loss") all[game].losses++;
    else all[game].draws++;
    saveAll(all);
  }

  function getAll() {
    const all = loadAll();
    const result = {};
    GAMES.forEach((g) => { result[g] = all[g] || emptyRecord(); });
    return result;
  }

  function reset() {
    try {
      if (window.localStorage) window.localStorage.removeItem(KEY);
    } catch (e) { /* ignore */ }
  }

  return { GAMES, record, getAll, reset };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = GameStats;
}
