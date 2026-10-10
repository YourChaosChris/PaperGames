// war-app.js
// Wires WarCore ("War" / Krieg) to war.html.
//
// You against the computer. There are no decisions: tap your pile, and
// both top cards are turned up at once; the table shows the round - with
// the face-down cards of a war as striped backs - and the status line
// says who took how many cards. Both piles show their card count. "Short"
// (the default) ends after 30 rounds, "To the end" plays until one side
// has all 32 cards.

const WAR_SAVE_KEY = "einkchess_save_war";

const AppStateWar = {
  mode: "short",
  state: null,
  started: false,
  gameOver: false
};

function setStatusWar(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setResultWar(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveWar() {
  if (typeof GameStorage === "undefined" || !AppStateWar.state) return;
  GameStorage.save(WAR_SAVE_KEY, { mode: AppStateWar.mode, state: AppStateWar.state });
}

function clearSaveWar() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(WAR_SAVE_KEY);
}

function initWarApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeSelect = document.getElementById("war-mode");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-war-game").addEventListener("click", () => startGameWar(modeSelect ? modeSelect.value : "short"));
  document.getElementById("war-own-pile").addEventListener("click", playRoundWar);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateWar.state) renderWar(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(WAR_SAVE_KEY) : null;
  if (saved && saved.state && !saved.state.gameOver && Array.isArray(saved.state.piles)) {
    AppStateWar.mode = saved.mode === "full" ? "full" : "short";
    AppStateWar.state = saved.state;
    AppStateWar.started = true;
    if (modeSelect) modeSelect.value = AppStateWar.mode;
    showBoardWar();
    setStatusWar("Tap your pile to turn up the next card.");
    renderWar();
  }
}

function showBoardWar() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameWar(mode) {
  AppStateWar.mode = mode === "full" ? "full" : "short";
  AppStateWar.state = WarCore.createInitialState(AppStateWar.mode);
  AppStateWar.started = true;
  AppStateWar.gameOver = false;
  setResultWar("");
  showBoardWar();
  setStatusWar("Cards dealt: 16 each. Tap your pile to turn up the first card.");
  renderWar();
  saveWar();
}

function roundTextWar(last) {
  const parts = [];
  if (last.wars === 1) parts.push("War!");
  else if (last.wars > 1) parts.push(last.wars + " wars in a row!");
  const a = last.up[0][last.up[0].length - 1], b = last.up[1][last.up[1].length - 1];
  if (!a) parts.push("You have no card left for the war.");
  else if (!b) parts.push("The computer has no card left for the war.");
  else if (last.winner === 0) parts.push("You win the round: " + CardFaces.labelAny(a) + " beats " + CardFaces.labelAny(b) + ".");
  else parts.push("The computer wins the round: " + CardFaces.labelAny(b) + " beats " + CardFaces.labelAny(a) + ".");
  if (last.winner === 0) parts.push("You take " + last.won + " cards.");
  else if (last.winner === 1) parts.push("The computer takes " + last.won + " cards.");
  return parts.join(" ");
}

function playRoundWar() {
  const s = AppStateWar.state;
  if (!s || AppStateWar.gameOver || s.gameOver) return;
  AppStateWar.state = WarCore.playRound(s);
  const msg = roundTextWar(AppStateWar.state.last);
  if (AppStateWar.state.gameOver) { endGameWar(msg); return; }
  setStatusWar(msg);
  renderWar();
  saveWar();
}

function endGameWar(prefix) {
  const s = AppStateWar.state;
  AppStateWar.gameOver = true;
  const a = s.piles[0].length, b = s.piles[1].length;
  let end;
  if (s.endReason === "rounds") end = "30 rounds played: you have " + a + " cards, the computer " + b + ".";
  else if (s.endReason === "limit") end = "After 2000 rounds there is still no winner.";
  else if (s.winner === 0) end = "You have all 32 cards.";
  else if (s.winner === 1) end = "The computer has all 32 cards.";
  else end = "Neither side has a card left.";
  const verdict = s.winner === 0 ? "You win!" : (s.winner === 1 ? "You lose." : "Draw.");
  const full = (prefix ? prefix + " " : "") + end + " " + verdict;
  setResultWar(end + " " + verdict);
  setStatusWar(full);
  if (typeof GameStats !== "undefined") GameStats.record("war", s.winner === 0 ? "win" : (s.winner === 1 ? "loss" : "draw"));
  if (window.ResultModal) window.ResultModal.show(s.winner === 0 ? "You win!" : (s.winner === 1 ? "You lose" : "Draw"), end + " " + verdict);
  clearSaveWar();
  renderWar();
}

function cardElWar(card) {
  const c = document.createElement("span");
  c.className = "pc-card pc-card-small";
  c.setAttribute("role", "img");
  CardFaces.renderTall(c, card);
  I18n.setAria(c, CardFaces.labelAny(card));
  return c;
}

function backElWar() {
  const c = document.createElement("span");
  c.className = "pc-card pc-card-small pc-card-back";
  c.setAttribute("role", "img");
  I18n.setAria(c, "face-down card");
  return c;
}

function renderWar() {
  const s = AppStateWar.state;
  if (!s) return;
  const over = AppStateWar.gameOver || s.gameOver;
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, s.mode === "short" ? "Round " + s.round + " / " + WarCore.SHORT_ROUNDS : "Round " + s.round);

  const counts = [s.piles[0].length, s.piles[1].length];
  const own = document.getElementById("war-own-pile");
  own.disabled = over || !counts[0];
  own.classList.toggle("pc-card-back", counts[0] > 0);
  I18n.setMsg(document.getElementById("war-own-count"), counts[0] + " cards");
  I18n.setAria(own, over ? "Your pile, " + counts[0] + " cards" : "Your pile, " + counts[0] + " cards - tap to turn up a card");
  const cpu = document.getElementById("war-cpu-pile");
  cpu.classList.toggle("pc-card-back", counts[1] > 0);
  I18n.setMsg(document.getElementById("war-cpu-count"), counts[1] + " cards");
  I18n.setAria(cpu, "The computer's pile, " + counts[1] + " cards");

  // The last round: each side's turned-up cards, face-down war cards between.
  ["war-own-table", "war-cpu-table"].forEach((id, p) => {
    const el = document.getElementById(id);
    el.innerHTML = "";
    if (!s.last) return;
    s.last.up[p].forEach((card, i) => {
      if (i > 0 && s.last.hidden && s.last.hidden[p][i - 1]) el.appendChild(backElWar());
      el.appendChild(cardElWar(card));
    });
  });
  document.getElementById("war-table").classList.toggle("hidden", !s.last);
}

document.addEventListener("DOMContentLoaded", initWarApp);
