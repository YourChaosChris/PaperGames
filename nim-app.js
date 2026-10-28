// nim-app.js
// Wires NimCore (Nim) to nim.html.
//
// Two people on one device, or one person against the computer (Easy,
// Medium, Hard). The heaps are rows of round stones. To take stones, tap
// the stone up to which they shall go: that stone and every stone to its
// right in the row get a cross; then "Take stones" confirms. "Normal": who
// takes the last stone wins; "Misère": who takes the last stone loses.
// "Who starts": me, the computer or chance. Under the heaps a line says
// whether the start position is won or lost for whoever begins (nim sum
// 0 = lost), and the help says honestly that the Hard computer cannot be
// beaten from a winning position. The computer moves after a calm pause
// (AiPacing); its move is named. Undo takes back the person's last move
// together with the computer's answer. No timer, nothing animated.

const NIM_SAVE_KEY = "einkchess_save_nim";
const NIM_LEVELS = { 1: "easy", 2: "medium", 3: "hard" };

const AppStateNim = {
  mode: "ai",         // "ai" | "hotseat"
  level: 2,
  computer: 1,        // the computer's seat in "ai" mode
  state: null,
  pick: null,         // { heap, from } stones marked to take
  undoStack: [],
  setup: null,        // { heaps, rule, first } as chosen in the menu for this game
  generation: 0       // guards a pending computer move after Undo or a new game
};

function tNim(key, values) {
  let text = I18n.t(key);
  Object.keys(values || {}).forEach((k) => { text = text.split("{" + k + "}").join(String(values[k])); });
  return text;
}

function nameNim(p) {
  if (AppStateNim.mode === "ai") return p === AppStateNim.computer ? I18n.t("dg_computer") : I18n.t("dg_you");
  return tNim("dg_player", { n: p + 1 });
}

function isComputerTurnNim() {
  const s = AppStateNim.state;
  return !!s && !s.over && AppStateNim.mode === "ai" && s.turn === AppStateNim.computer;
}

function saveNim() {
  if (typeof GameStorage === "undefined" || !AppStateNim.state) return;
  if (AppStateNim.state.over) { GameStorage.clear(NIM_SAVE_KEY); return; }
  GameStorage.save(NIM_SAVE_KEY, { mode: AppStateNim.mode, level: AppStateNim.level, computer: AppStateNim.computer, setup: AppStateNim.setup, state: AppStateNim.state, undoStack: AppStateNim.undoStack.slice(-50) });
}

// The menu choices of a saved game. Saves before v276 have none: the rule
// comes from the game, the heaps from its start position ("Random" when it
// is no preset), and "Who starts" stays as the menu shows it.
function setupFromSaveNim(saved) {
  const s = saved.state;
  const setup = saved.setup || {};
  const preset = ["small", "classic"].find((k) => NimCore.PRESETS[k].join() === (s.start || []).join());
  return {
    heaps: ["small", "classic", "random"].includes(setup.heaps) ? setup.heaps : (preset || "random"),
    rule: setup.rule === "misere" || setup.rule === "normal" ? setup.rule : (s.misere ? "misere" : "normal"),
    first: ["me", "computer", "random"].includes(setup.first) ? setup.first : document.getElementById("nim-first").value
  };
}

// Undo is there once the person has made a move: a snapshot in which it was
// their turn. Before that (the computer began) Undo would only let the
// computer choose its first move again.
function canUndoNim() {
  const stack = AppStateNim.undoStack;
  if (AppStateNim.mode !== "ai") return stack.length > 0;
  return stack.some((s) => s.turn !== AppStateNim.computer);
}

function validStateNim(s) {
  return !!s && Array.isArray(s.heaps) && s.heaps.length >= 1 && s.heaps.every((h) => h >= 0 && h <= 15) && (s.turn === 0 || s.turn === 1) && !s.over;
}

function setModeNim(mode) {
  AppStateNim.mode = mode === "hotseat" ? "hotseat" : "ai";
  const two = document.getElementById("mode-offline"), ai = document.getElementById("mode-ai");
  two.classList.toggle("active-mode", AppStateNim.mode === "hotseat");
  two.setAttribute("aria-pressed", AppStateNim.mode === "hotseat" ? "true" : "false");
  ai.classList.toggle("active-mode", AppStateNim.mode === "ai");
  ai.setAttribute("aria-pressed", AppStateNim.mode === "ai" ? "true" : "false");
  document.getElementById("nim-ai-options").classList.toggle("hidden", AppStateNim.mode !== "ai");
}

function startNim() {
  const heapsSel = document.getElementById("nim-heaps").value;
  const heaps = heapsSel === "random" ? NimCore.randomHeaps() : NimCore.PRESETS[heapsSel === "classic" ? "classic" : "small"].slice();
  const misere = document.getElementById("nim-rule").value === "misere";
  const firstSel = document.getElementById("nim-first").value;
  AppStateNim.level = parseInt(document.getElementById("nim-level").value, 10) || 2;
  // Seat 0 starts; in the computer mode the person sits on 0 unless the
  // computer begins.
  let computerFirst = false;
  if (AppStateNim.mode === "ai") computerFirst = firstSel === "computer" || (firstSel === "random" && Math.random() < 0.5);
  AppStateNim.computer = computerFirst ? 0 : 1;
  AppStateNim.setup = { heaps: heapsSel, rule: misere ? "misere" : "normal", first: firstSel };
  AppStateNim.state = NimCore.newGame({ heaps, misere, first: 0 });
  AppStateNim.pick = null;
  AppStateNim.undoStack = [];
  AppStateNim.generation++;
  setResultNim("");
  if (window.ResultModal) window.ResultModal.hide();
  showBoardNim();
  afterMoveNim();
}

function showBoardNim() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
}

function setStatusNim(text) {
  const el = document.getElementById("board-info");
  if (el) { el.removeAttribute("data-i18n"); el.textContent = text || ""; }
}

function setResultNim(text) {
  const el = document.getElementById("game-result");
  if (el) { el.removeAttribute("data-i18n"); el.textContent = text || ""; }
}

function tapStoneNim(heap, index) {
  const s = AppStateNim.state;
  if (!s || s.over || isComputerTurnNim()) return;
  if (AppStateNim.pick && AppStateNim.pick.heap === heap && AppStateNim.pick.from === index) AppStateNim.pick = null;
  else AppStateNim.pick = { heap, from: index };
  renderNim();
}

function confirmNim() {
  const s = AppStateNim.state;
  const p = AppStateNim.pick;
  if (!s || s.over || isComputerTurnNim() || !p) return;
  const count = s.heaps[p.heap] - p.from;
  const next = NimCore.move(s, p.heap, count);
  if (next === s) return;
  AppStateNim.undoStack.push(JSON.parse(JSON.stringify(s)));
  AppStateNim.state = next;
  AppStateNim.pick = null;
  afterMoveNim();
}

function afterMoveNim() {
  const s = AppStateNim.state;
  if (s.over) finishNim();
  renderNim();
  saveNim();
  if (isComputerTurnNim()) {
    const gen = AppStateNim.generation, turnState = s;
    setTimeout(() => {
      if (gen !== AppStateNim.generation || AppStateNim.state !== turnState) return;
      computerMoveNim();
    }, typeof AiPacing !== "undefined" ? AiPacing.delay(900) : 900);
  }
}

function computerMoveNim() {
  const s = AppStateNim.state;
  if (!isComputerTurnNim()) return;
  const m = NimCore.aiMove(s, NIM_LEVELS[AppStateNim.level] || "medium");
  if (!m) return;
  AppStateNim.undoStack.push(JSON.parse(JSON.stringify(s)));
  AppStateNim.state = NimCore.move(s, m.heap, m.count);
  afterMoveNim();
}

// Takes back the person's last move; against the computer together with
// the computer's answer (the snapshots before the computer's moves are
// skipped).
function undoNim() {
  if (!canUndoNim()) return;
  let prev = AppStateNim.undoStack.pop();
  if (AppStateNim.mode === "ai") {
    while (prev.turn === AppStateNim.computer && AppStateNim.undoStack.length) prev = AppStateNim.undoStack.pop();
  }
  AppStateNim.state = prev;
  AppStateNim.pick = null;
  AppStateNim.generation++;
  setResultNim("");
  if (window.ResultModal) window.ResultModal.hide();
  afterMoveNim();
}

function finishNim() {
  const s = AppStateNim.state;
  const w = s.winner;
  const text = AppStateNim.mode === "ai"
    ? (w === AppStateNim.computer ? I18n.t("ui_status_computer_wins") : I18n.t("ui_status_you_win"))
    : tNim("dg_wins", { name: nameNim(w) });
  const why = tNim(s.misere ? "nim_end_misere" : "nim_end_normal", { name: nameNim(s.last.player) });
  setResultNim(text);
  if (window.ResultModal) window.ResultModal.show(AppStateNim.mode === "ai" ? (w === AppStateNim.computer ? "You lose" : "You win!") : "Player " + (w + 1) + " wins", why + " " + text);
  if (AppStateNim.mode === "ai" && typeof GameStats !== "undefined") GameStats.record("nim", w === AppStateNim.computer ? "loss" : "win");
}

function statusNim() {
  const s = AppStateNim.state;
  if (s.over) return "";
  let text;
  if (isComputerTurnNim()) text = I18n.t("ui_status_computer_turn");
  else if (AppStateNim.mode === "ai") text = I18n.t("ui_status_your_turn");
  else text = tNim("dg_turn_of", { name: nameNim(s.turn) });
  if (!isComputerTurnNim()) {
    const p = AppStateNim.pick;
    text += " " + (p ? tNim("nim_hint_confirm", { n: s.heaps[p.heap] - p.from, r: p.heap + 1 }) : tNim("nim_hint_pick"));
  }
  return text;
}

function renderNim() {
  const s = AppStateNim.state;
  if (!s) return;
  const wrap = document.getElementById("nim-heaps-board");
  wrap.innerHTML = "";
  const canTap = !s.over && !isComputerTurnNim();
  s.heaps.forEach((n, h) => {
    const row = document.createElement("div");
    row.className = "nim-row";
    const label = document.createElement("span");
    label.className = "nim-row-label";
    label.textContent = String(h + 1);
    label.setAttribute("aria-hidden", "true");
    row.appendChild(label);
    const stones = document.createElement("div");
    stones.className = "nim-stones";
    stones.setAttribute("role", "group");
    stones.setAttribute("aria-label", tNim("nim_row_aria", { r: h + 1, n: n }));
    for (let k = 0; k < n; k++) {
      const b = document.createElement("button");
      b.type = "button";
      const marked = AppStateNim.pick && AppStateNim.pick.heap === h && k >= AppStateNim.pick.from;
      b.className = "nim-stone" + (marked ? " nim-stone-marked" : "");
      b.setAttribute("aria-label", tNim("nim_stone_aria", { k: k + 1, r: h + 1, n: n - k }));
      b.setAttribute("aria-pressed", marked ? "true" : "false");
      if (canTap) b.addEventListener("click", () => tapStoneNim(h, k));
      else b.disabled = true;
      stones.appendChild(b);
    }
    if (!n) {
      const empty = document.createElement("span");
      empty.className = "nim-empty";
      empty.textContent = tNim("nim_row_empty");
      stones.appendChild(empty);
    }
    row.appendChild(stones);
    wrap.appendChild(row);
  });
  const take = document.getElementById("nim-take");
  take.disabled = !canTap || !AppStateNim.pick;
  const undo = document.getElementById("undo-btn");
  if (undo) undo.disabled = !canUndoNim();
  // The start position: won or lost for whoever begins.
  const startWon = NimCore.isWinning(s.start, s.misere);
  document.getElementById("nim-start-info").textContent = tNim(startWon ? "nim_start_won" : "nim_start_lost", { x: NimCore.nimSum(s.start) }) +
    (AppStateNim.mode === "ai" ? " " + tNim("nim_starts", { name: nameNim(0) }) : "");
  document.getElementById("game-meta").textContent = tNim(s.misere ? "nim_rule_misere_short" : "nim_rule_normal_short");
  const last = document.getElementById("nim-last");
  last.textContent = s.last ? tNim("nim_last", { name: nameNim(s.last.player), n: s.last.count, r: s.last.heap + 1 }) : "";
  setStatusNim(statusNim());
}

function initNimApp() {
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("settings-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const hidden = panel.classList.toggle("hidden");
      I18n.setKey(toggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("mode-ai").addEventListener("click", () => setModeNim("ai"));
  document.getElementById("mode-offline").addEventListener("click", () => setModeNim("hotseat"));
  setModeNim("ai");
  document.getElementById("start-nim-game").addEventListener("click", startNim);
  document.getElementById("nim-take").addEventListener("click", confirmNim);
  document.getElementById("undo-btn").addEventListener("click", undoNim);
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateNim.state) renderNim(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(NIM_SAVE_KEY) : null;
  if (saved && validStateNim(saved.state)) {
    setModeNim(saved.mode);
    AppStateNim.level = saved.level || 2;
    AppStateNim.computer = saved.computer === 0 ? 0 : 1;
    AppStateNim.state = saved.state;
    AppStateNim.undoStack = Array.isArray(saved.undoStack) ? saved.undoStack : [];
    AppStateNim.setup = setupFromSaveNim(saved);
    document.getElementById("nim-level").value = String(AppStateNim.level);
    document.getElementById("nim-heaps").value = AppStateNim.setup.heaps;
    document.getElementById("nim-rule").value = AppStateNim.setup.rule;
    document.getElementById("nim-first").value = AppStateNim.setup.first;
    showBoardNim();
    afterMoveNim();
  }
}

document.addEventListener("DOMContentLoaded", initNimApp);
