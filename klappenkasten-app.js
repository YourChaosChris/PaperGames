// Klappenkasten game UI and local game controller.
const KK_SAVE_KEY = "einkchess_save_klappenkasten";
const KK_STATE = { game: null, undoStack: [] };
const kkClone = (x) => JSON.parse(JSON.stringify(x));
const kkT = (key) => window.I18n ? I18n.t(key) : key;
function kkSave() {
  if (window.GameStorage && KK_STATE.game) GameStorage.save(KK_SAVE_KEY, { game: KK_STATE.game, undoStack: KK_STATE.undoStack.slice(-50) });
}
function kkSnapshot() { KK_STATE.undoStack.push(kkClone(KK_STATE.game)); KK_STATE.undoStack = KK_STATE.undoStack.slice(-50); }
function kkName(i) { return KK_STATE.game.mode === "ai" && i === 1 ? kkT("kk_computer") : kkT("kk_player") + " " + (i + 1); }
function kkStatus(key, replacements) {
  const el = document.getElementById("board-info");
  if (!el) return;
  let s = kkT(key);
  Object.keys(replacements || {}).forEach((k) => { s = s.replace("{" + k + "}", replacements[k]); });
  I18n.setMsg(el, s);
}
function kkStart(mode) {
  KK_STATE.game = { mode, current: 0, round: 1, players: [{ score: null }, { score: null }], turn: KlappenkastenCore.initial(), over: false, winner: null };
  KK_STATE.undoStack = [];
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  document.getElementById("board-section").classList.remove("hidden");
  kkRender(); kkStatus("kk_roll_hint", { player: kkName(0) }); kkSave();
}
function kkNeedsOneDie() { return ![7, 8, 9].some((n) => KK_STATE.game.turn.open.includes(n)); }
function kkRoll() {
  const g = KK_STATE.game; if (!g || g.over || g.turn.dice.length) return;
  kkSnapshot();
  let s = KlappenkastenCore.roll(g.turn);
  if (kkNeedsOneDie()) s = { ...s, dice: [1 + Math.floor(Math.random() * 6)] };
  g.turn = s;
  if (!KlappenkastenCore.choices(s).length) { g.turn = KlappenkastenCore.finish(s); kkEndTurn(); return; }
  kkRender(); kkStatus("kk_choose_hint", { player: kkName(g.current) }); kkSave();
  if (g.mode === "ai" && g.current === 1) kkAiPlay();
}
function kkClose() {
  const g = KK_STATE.game; if (!g || g.over) return;
  const nums = Array.from(document.querySelectorAll(".kk-tile.selected"), (b) => Number(b.dataset.num));
  const before = g.turn; const next = KlappenkastenCore.close(before, nums);
  if (next === before) { kkStatus("kk_invalid", {}); return; }
  kkSnapshot(); g.turn = next;
  if (next.over) { g.players[g.current].score = 0; kkRender(); kkFinishRound(true); return; }
  if (!KlappenkastenCore.choices(next).length) { g.turn = KlappenkastenCore.finish(next); g.players[g.current].score = next.score; kkFinishRound(false); return; }
  g.turn = { ...next, dice: [] };
  kkRender(); kkStatus("kk_roll_hint", { player: kkName(g.current) }); kkSave();
}
function kkAiPlay() {
  const g = KK_STATE.game;
  while (g && !g.over && g.mode === "ai" && g.current === 1) {
    if (!g.turn.dice.length) {
      let s = KlappenkastenCore.roll(g.turn);
      if (kkNeedsOneDie()) s = { ...s, dice: [1 + Math.floor(Math.random() * 6)] };
      g.turn = s;
      if (!KlappenkastenCore.choices(s).length) { g.turn = KlappenkastenCore.finish(s); g.players[1].score = s.score; kkFinishRound(false); continue; }
    }
    const move = KlappenkastenCore.chooseAi(g.turn);
    if (!move) { g.turn = KlappenkastenCore.finish(g.turn); g.players[1].score = g.turn.score; kkFinishRound(false); continue; }
    kkSnapshot(); g.turn = KlappenkastenCore.close(g.turn, move);
    if (g.turn.over) { g.players[1].score = 0; kkFinishRound(true); }
    else if (!KlappenkastenCore.choices(g.turn).length) { g.turn = KlappenkastenCore.finish(g.turn); g.players[1].score = g.turn.score; kkFinishRound(false); }
    else g.turn = { ...g.turn, dice: [] };
  }
  kkRender(); kkSave();
}
function kkEndTurn() { const g = KK_STATE.game; g.players[g.current].score = g.turn.score; kkFinishRound(false); }
function kkFinishRound(boxClosed) {
  const g = KK_STATE.game;
  if (boxClosed) g.players[g.current].score = 0;
  if (g.current === 0) { g.current = 1; g.turn = KlappenkastenCore.initial(); if (g.mode === "ai") { kkStatus("kk_ai_turn", {}); kkAiPlay(); return; } }
  else if (g.round === 1) { g.current = 0; g.round = 2; g.players.forEach((p) => { p.score = null; }); g.turn = KlappenkastenCore.initial(); }
  else {
    g.over = true;
    const a = g.players[0].score, b = g.players[1].score;
    g.winner = a === b ? -1 : (a < b ? 0 : 1);
    const el = document.getElementById("game-result");
    const msg = g.winner === -1 ? kkT("kk_draw") : kkT("kk_winner").replace("{player}", kkName(g.winner));
    I18n.setMsg(el, msg); if (window.ResultModal) ResultModal.show(kkT("game_klappenkasten"), msg);
    if (g.mode === "ai" && window.GameStats) GameStats.record("klappenkasten", g.winner === 0 ? "win" : g.winner === 1 ? "loss" : "draw");
  }
  kkRender(); kkStatus(g.over ? "kk_game_over" : "kk_roll_hint", { player: kkName(g.current) }); kkSave();
}
function kkUndo() {
  if (!KK_STATE.undoStack.length || !KK_STATE.game) return;
  let prev = KK_STATE.undoStack.pop();
  if (KK_STATE.game.mode === "ai") while (prev && prev.mode === "ai" && prev.current === 1 && KK_STATE.undoStack.length) prev = KK_STATE.undoStack.pop();
  KK_STATE.game = prev; document.getElementById("game-result").textContent = ""; if (window.ResultModal) ResultModal.hide();
  kkRender(); kkStatus("kk_roll_hint", { player: kkName(prev.current) }); kkSave();
}
function kkRender() {
  const g = KK_STATE.game; if (!g) return;
  document.getElementById("kk-dice").textContent = g.turn.dice.length ? g.turn.dice.join(" + ") + " = " + g.turn.dice.reduce((a,b)=>a+b,0) : "–";
  const board = document.getElementById("kk-tiles"); board.innerHTML = "";
  for (let n = 1; n <= g.turn.size; n++) {
    const b = document.createElement("button"); b.type = "button"; b.className = "kk-tile" + (g.turn.open.includes(n) ? "" : " closed"); b.dataset.num = n; b.textContent = String(n); b.disabled = !g.turn.open.includes(n) || !g.turn.dice.length || (g.mode === "ai" && g.current === 1);
    b.setAttribute("aria-pressed", "false"); b.addEventListener("click", () => { b.classList.toggle("selected"); b.setAttribute("aria-pressed", b.classList.contains("selected") ? "true" : "false"); }); board.appendChild(b);
  }
  document.getElementById("kk-player-label").textContent = kkName(g.current) + " · " + kkT("kk_round") + " " + g.round;
  document.getElementById("kk-scores").textContent = kkName(0) + ": " + (g.players[0].score === null ? "–" : g.players[0].score) + "   |   " + kkName(1) + ": " + (g.players[1].score === null ? "–" : g.players[1].score);
  document.getElementById("kk-roll-btn").disabled = g.over || !!g.turn.dice.length || (g.mode === "ai" && g.current === 1);
  document.getElementById("kk-close-btn").disabled = g.over || !g.turn.dice.length || (g.mode === "ai" && g.current === 1);
  document.getElementById("undo-btn").disabled = !KK_STATE.undoStack.length;
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("mode-ai").addEventListener("click", () => { document.getElementById("mode-ai").setAttribute("aria-pressed", "true"); document.getElementById("mode-offline").setAttribute("aria-pressed", "false"); kkStart("ai"); });
  document.getElementById("mode-offline").addEventListener("click", () => { document.getElementById("mode-offline").setAttribute("aria-pressed", "true"); document.getElementById("mode-ai").setAttribute("aria-pressed", "false"); kkStart("hotseat"); });
  document.getElementById("new-game-btn").addEventListener("click", () => kkStart(document.getElementById("mode-offline").getAttribute("aria-pressed") === "true" ? "hotseat" : "ai"));
  document.getElementById("kk-roll-btn").addEventListener("click", kkRoll); document.getElementById("kk-close-btn").addEventListener("click", kkClose); document.getElementById("undo-btn").addEventListener("click", kkUndo);
  const saved = window.GameStorage && GameStorage.load(KK_SAVE_KEY);
  if (saved && saved.game) { KK_STATE.game = saved.game; KK_STATE.undoStack = Array.isArray(saved.undoStack) ? saved.undoStack : []; document.getElementById("board-placeholder").classList.add("hidden"); document.getElementById("board-container").classList.remove("hidden"); kkRender(); kkStatus("kk_roll_hint", { player: kkName(KK_STATE.game.current) }); }
  if (window.I18n) I18n.onChange(() => { if (KK_STATE.game) kkRender(); });
});
