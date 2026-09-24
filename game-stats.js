// game-stats.js
// Tiny shared localStorage-backed win/loss/draw tracker, recorded only
// for local games against the built-in AI (not 2-player hotseat games,
// which have no single "you", and not online chess, which Lichess
// already tracks). Read by stats.html.

const GameStats = (function () {
  const KEY = "einkchess_stats";
  const GAMES = ["chess", "go", "checkers", "ur", "morris", "backgammon", "xiangqi", "mancala", "ludo", "othello", "connectfour", "gomoku", "senet", "shogi", "sudoku", "pegsolitaire", "minesweeper", "nonogram", "twenty48", "mahjong", "freecell", "onitama", "hnefatafl", "quoridor", "hex", "halma", "lightsout", "mastermind", "dotsandboxes", "amazons", "kakuro", "hashi", "skyscrapers", "slitherlink", "fanorona", "fleetbattle", "konane", "sternhalma", "baghchal", "tablut", "abalone", "pyramidsolitaire", "surakarta"];

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
    } catch (e) {
      if (window.StorageWarning && typeof StorageWarning.show === "function") StorageWarning.show();
    }
  }

  function emptyRecord() {
    return { wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0 };
  }

  // outcome is from the human player's perspective: "win" | "loss" | "draw"
  function record(game, outcome) {
    if (GAMES.indexOf(game) === -1) return;
    if (outcome !== "win" && outcome !== "loss" && outcome !== "draw") return;
    const all = loadAll();
    if (!all[game]) all[game] = emptyRecord();
    const rec = all[game];
    // A record saved before this field existed has `streak`/`bestStreak`
    // undefined, not 0 - treat that the same as a fresh record rather
    // than letting NaN leak into the running count.
    if (typeof rec.streak !== "number") rec.streak = 0;
    if (typeof rec.bestStreak !== "number") rec.bestStreak = 0;
    if (outcome === "win") {
      rec.wins++;
      rec.streak = rec.streak > 0 ? rec.streak + 1 : 1;
      if (rec.streak > rec.bestStreak) rec.bestStreak = rec.streak;
    } else if (outcome === "loss") {
      rec.losses++;
      rec.streak = rec.streak < 0 ? rec.streak - 1 : -1;
    } else {
      rec.draws++;
      rec.streak = 0;
    }
    saveAll(all);
  }

  function getAll() {
    const all = loadAll();
    const result = {};
    GAMES.forEach((g) => {
      // Spread a real saved record over emptyRecord() rather than using it
      // directly, so a record saved before streak/bestStreak existed still
      // reads as 0 for those instead of undefined.
      result[g] = Object.assign(emptyRecord(), all[g] || {});
    });
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
