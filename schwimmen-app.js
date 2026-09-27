// schwimmen-app.js
// Wires SchwimmenCore/SchwimmenAi to schwimmen.html.
//
// Layout: the players with their lives (filled and empty circles) at the
// top, the three middle cards, then the player's own three cards with
// their score written out, and the four actions. To swap one card, tap
// one of your cards, then a middle card (or the other way round). Swap
// all, Pass and Knock are buttons. After each round every hand is shown
// with its score; "Next round" deals again.
//
// With two or more people on one device each hand is covered between
// turns ("Show my cards"). Against the computer the human is Player 1.
// Computer turns wait AiPacing.delay() so they can be followed on E-Ink.

const SCHWIMMEN_SAVE_KEY = "einkchess_save_schwimmen";

const AppStateSchwimmen = {
  mode: "vs-ai",
  numPlayers: 3,
  aiLevel: 2,
  state: null,
  started: false,
  gameOver: false,
  revealed: true,
  selectedHand: null,
  selectedTable: null,
  busy: false
};

function playerNameSchwimmen(i) {
  return "Player " + (i + 1);
}

function isAiSchwimmen(i) {
  return AppStateSchwimmen.mode === "vs-ai" && i !== 0;
}

function viewerSchwimmen() {
  return AppStateSchwimmen.mode === "vs-ai" ? 0 : AppStateSchwimmen.state.turn;
}

function scoreTextSchwimmen(score) {
  return String(score);
}

function setStatusSchwimmen(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setResultSchwimmen(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveSchwimmen() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(SCHWIMMEN_SAVE_KEY, {
    mode: AppStateSchwimmen.mode,
    numPlayers: AppStateSchwimmen.numPlayers,
    aiLevel: AppStateSchwimmen.aiLevel,
    state: AppStateSchwimmen.state
  });
}

function clearSaveSchwimmen() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(SCHWIMMEN_SAVE_KEY);
}

/*** Game flow ***/

function initSchwimmenApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeAi = document.getElementById("mode-offline-ai");
  const levelWrap = document.getElementById("schwimmen-level-wrap");
  const levelSelect = document.getElementById("schwimmen-level-inline");
  const playersSelect = document.getElementById("schwimmen-num-players");
  let pendingMode = "vs-ai";

  function setMode(mode) {
    pendingMode = mode;
    if (modeOffline) modeOffline.classList.toggle("active-mode", mode === "hotseat");
    if (modeAi) modeAi.classList.toggle("active-mode", mode === "vs-ai");
    if (levelWrap) levelWrap.classList.toggle("hidden", mode !== "vs-ai");
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  if (modeOffline) modeOffline.addEventListener("click", () => setMode("hotseat"));
  if (modeAi) modeAi.addEventListener("click", () => setMode("vs-ai"));

  document.getElementById("start-schwimmen-game").addEventListener("click", () => {
    const n = playersSelect ? parseInt(playersSelect.value, 10) : 3;
    const level = levelSelect ? parseInt(levelSelect.value, 10) : 2;
    startGameSchwimmen(pendingMode, n, level);
    const status = document.getElementById("offline-schwimmen-status");
    if (status) {
      const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
      I18n.setMsg(status, pendingMode === "vs-ai"
        ? "You play Player 1, computer level: " + levelNames[level] + "."
        : "Local " + n + "-player hotseat game (no computer).");
    }
  });

  document.getElementById("schwimmen-swap-all").addEventListener("click", () => humanMoveSchwimmen({ type: "swapAll" }));
  document.getElementById("schwimmen-pass").addEventListener("click", () => humanMoveSchwimmen({ type: "pass" }));
  document.getElementById("schwimmen-knock").addEventListener("click", () => {
    const s = AppStateSchwimmen.state;
    if (s && !SchwimmenCore.canKnock(s) && humanCanActSchwimmen()) {
      setStatusSchwimmen("Someone has already knocked - you can't knock again.");
      return;
    }
    humanMoveSchwimmen({ type: "knock" });
  });
  document.getElementById("schwimmen-next-round").addEventListener("click", nextRoundSchwimmen);
  document.getElementById("schwimmen-show-hand").addEventListener("click", () => {
    AppStateSchwimmen.revealed = true;
    promptSchwimmen();
  });
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.addEventListener("click", resignSchwimmen);

  setMode("vs-ai");

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(SCHWIMMEN_SAVE_KEY) : null;
  if (saved && saved.state && !saved.state.gameOver) {
    AppStateSchwimmen.mode = saved.mode;
    AppStateSchwimmen.numPlayers = saved.numPlayers;
    AppStateSchwimmen.aiLevel = saved.aiLevel;
    AppStateSchwimmen.state = saved.state;
    AppStateSchwimmen.started = true;
    AppStateSchwimmen.gameOver = false;
    AppStateSchwimmen.revealed = saved.mode !== "hotseat";
    setMode(saved.mode);
    showBoardSchwimmen();
    if (saved.state.roundOver) showRoundResultSchwimmen();
    else { promptSchwimmen(); continueSchwimmen(); }
  }
}

function showBoardSchwimmen() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameSchwimmen(mode, numPlayers, level) {
  AppStateSchwimmen.mode = mode;
  AppStateSchwimmen.numPlayers = numPlayers;
  AppStateSchwimmen.aiLevel = level;
  AppStateSchwimmen.state = SchwimmenCore.createInitialState(numPlayers);
  AppStateSchwimmen.started = true;
  AppStateSchwimmen.gameOver = false;
  AppStateSchwimmen.busy = false;
  AppStateSchwimmen.revealed = mode !== "hotseat";
  clearSelectionSchwimmen();
  setResultSchwimmen("");
  showBoardSchwimmen();
  afterDealSchwimmen();
}

// Called after every deal: a dealt 31 ends the round at once.
function afterDealSchwimmen() {
  const s = AppStateSchwimmen.state;
  saveSchwimmen();
  if (s.roundOver) {
    showRoundResultSchwimmen();
    return;
  }
  if (AppStateSchwimmen.mode === "hotseat") {
    AppStateSchwimmen.revealed = false;
    setStatusSchwimmen("New round. Pass the device to " + playerNameSchwimmen(s.turn) + ".");
    renderSchwimmen();
    return;
  }
  promptSchwimmen();
  continueSchwimmen();
}

function promptTextSchwimmen() {
  const s = AppStateSchwimmen.state;
  let text = "Tap one of your cards and a middle card to swap them - or swap all, pass or knock.";
  if (s.knockedBy !== null) text = playerNameSchwimmen(s.knockedBy) + " knocked - this is your last turn. " + text;
  return text;
}

function promptSchwimmen() {
  const s = AppStateSchwimmen.state;
  if (isAiSchwimmen(s.turn)) {
    setStatusSchwimmen(playerNameSchwimmen(s.turn) + "'s turn.");
  } else {
    setStatusSchwimmen(playerNameSchwimmen(s.turn) + "'s turn. " + promptTextSchwimmen());
  }
  renderSchwimmen();
}

function continueSchwimmen() {
  const s = AppStateSchwimmen.state;
  if (AppStateSchwimmen.gameOver || s.roundOver || !isAiSchwimmen(s.turn) || AppStateSchwimmen.busy) return;
  AppStateSchwimmen.busy = true;
  setTimeout(aiTurnSchwimmen, AiPacing.delay(900));
}

function aiTurnSchwimmen() {
  AppStateSchwimmen.busy = false;
  const s = AppStateSchwimmen.state;
  if (AppStateSchwimmen.gameOver || s.roundOver || !isAiSchwimmen(s.turn)) return;
  applyMoveSchwimmen(SchwimmenAi.chooseMove(s, AppStateSchwimmen.aiLevel));
}

function describeMoveSchwimmen(player, move, before) {
  const who = playerNameSchwimmen(player);
  if (move.type === "swap") {
    return who + " swapped " + CardFaces.label(before.hands[player][move.hand]) + " for " + CardFaces.label(before.table[move.table]) + ".";
  }
  if (move.type === "swapAll") return who + " swapped all three cards.";
  if (move.type === "knock") return who + " knocked.";
  return who + " passed.";
}

function applyMoveSchwimmen(move) {
  const before = AppStateSchwimmen.state;
  const player = before.turn;
  const r = SchwimmenCore.applyMove(before, move);
  if (!r.ok) return false;
  AppStateSchwimmen.state = r.state;
  clearSelectionSchwimmen();
  let msg = describeMoveSchwimmen(player, move, before);
  if (r.refreshed) msg += " Everyone passed: three new cards in the middle.";
  const s = r.state;
  if (s.roundOver) {
    saveSchwimmen();
    showRoundResultSchwimmen(msg);
    return true;
  }
  if (AppStateSchwimmen.mode === "hotseat") {
    AppStateSchwimmen.revealed = false;
    msg += " Pass the device to " + playerNameSchwimmen(s.turn) + ".";
    setStatusSchwimmen(msg);
    renderSchwimmen();
  } else if (isAiSchwimmen(s.turn)) {
    setStatusSchwimmen(msg);
    renderSchwimmen();
  } else {
    setStatusSchwimmen(msg + " " + promptTextSchwimmen());
    renderSchwimmen();
  }
  saveSchwimmen();
  continueSchwimmen();
  return true;
}

function roundSummarySchwimmen() {
  const s = AppStateSchwimmen.state;
  const lr = s.lastRound;
  const parts = [];
  if (lr.reason === "thirtyone") parts.push(playerNameSchwimmen(lr.player) + " has 31!");
  else if (lr.reason === "knock") parts.push("Showdown.");
  else parts.push("The stock is used up - showdown.");
  lr.events.forEach((e) => {
    const who = playerNameSchwimmen(e.player);
    if (e.type === "life") parts.push(who + " loses a life.");
    else if (e.type === "swims") parts.push(who + " is swimming.");
    else parts.push(who + " is out.");
  });
  return parts.join(" ");
}

function showRoundResultSchwimmen(prefix) {
  const s = AppStateSchwimmen.state;
  AppStateSchwimmen.revealed = true;
  const summary = (prefix ? prefix + " " : "") + roundSummarySchwimmen();
  if (s.gameOver) {
    endGameSchwimmen(summary);
    return;
  }
  setStatusSchwimmen(summary);
  renderSchwimmen();
}

function nextRoundSchwimmen() {
  const s = AppStateSchwimmen.state;
  if (!s || !s.roundOver || s.gameOver) return;
  AppStateSchwimmen.state = SchwimmenCore.startNextRound(s);
  clearSelectionSchwimmen();
  afterDealSchwimmen();
}

function endGameSchwimmen(summary) {
  const s = AppStateSchwimmen.state;
  AppStateSchwimmen.gameOver = true;
  let title, full;
  if (s.winner === null) {
    full = summary + " Nobody is left - the game is a draw.";
    title = "Draw";
    if (AppStateSchwimmen.mode === "vs-ai" && typeof GameStats !== "undefined") GameStats.record("schwimmen", "draw");
  } else {
    full = summary + " " + playerNameSchwimmen(s.winner) + " wins.";
    if (AppStateSchwimmen.mode === "vs-ai") {
      title = s.winner === 0 ? "You win!" : "You lose";
      if (typeof GameStats !== "undefined") GameStats.record("schwimmen", s.winner === 0 ? "win" : "loss");
    } else {
      title = playerNameSchwimmen(s.winner) + " wins";
    }
  }
  setResultSchwimmen(full);
  setStatusSchwimmen(full);
  if (window.ResultModal) window.ResultModal.show(title, full);
  clearSaveSchwimmen();
  renderSchwimmen();
}

function resignSchwimmen() {
  if (AppStateSchwimmen.gameOver || !AppStateSchwimmen.started) return;
  const s = AppStateSchwimmen.state;
  const loser = AppStateSchwimmen.mode === "vs-ai" ? 0 : s.turn;
  // The remaining player with the most lives is left as winner.
  let winner = null, best = -1;
  SchwimmenCore.activePlayers(s).forEach((p) => {
    const lives = s.lives[p] + (s.swimming[p] ? 0 : 1);
    if (p !== loser && lives > best) { best = lives; winner = p; }
  });
  s.gameOver = true;
  s.winner = winner;
  AppStateSchwimmen.gameOver = true;
  const msg = playerNameSchwimmen(loser) + " resigned. " + playerNameSchwimmen(winner) + " wins.";
  if (AppStateSchwimmen.mode === "vs-ai" && typeof GameStats !== "undefined") GameStats.record("schwimmen", "loss");
  setResultSchwimmen(msg);
  setStatusSchwimmen(msg);
  if (window.ResultModal) window.ResultModal.show(AppStateSchwimmen.mode === "vs-ai" ? "You lose" : playerNameSchwimmen(winner) + " wins", msg);
  clearSaveSchwimmen();
  renderSchwimmen();
}

/*** Human input ***/

function humanCanActSchwimmen() {
  const s = AppStateSchwimmen.state;
  if (!AppStateSchwimmen.started || AppStateSchwimmen.gameOver || !s || s.roundOver) return false;
  if (isAiSchwimmen(s.turn)) {
    setStatusSchwimmen("Computer thinking…");
    return false;
  }
  if (AppStateSchwimmen.mode === "hotseat" && !AppStateSchwimmen.revealed) return false;
  return true;
}

function humanMoveSchwimmen(move) {
  if (!humanCanActSchwimmen()) return;
  applyMoveSchwimmen(move);
}

function clearSelectionSchwimmen() {
  AppStateSchwimmen.selectedHand = null;
  AppStateSchwimmen.selectedTable = null;
}

function onHandCardSchwimmen(i) {
  if (!humanCanActSchwimmen()) return;
  if (AppStateSchwimmen.selectedTable !== null) {
    humanMoveSchwimmen({ type: "swap", hand: i, table: AppStateSchwimmen.selectedTable });
    return;
  }
  AppStateSchwimmen.selectedHand = AppStateSchwimmen.selectedHand === i ? null : i;
  if (AppStateSchwimmen.selectedHand !== null) setStatusSchwimmen("Now tap the middle card you want instead.");
  renderSchwimmen();
}

function onTableCardSchwimmen(i) {
  if (!humanCanActSchwimmen()) return;
  if (AppStateSchwimmen.selectedHand !== null) {
    humanMoveSchwimmen({ type: "swap", hand: AppStateSchwimmen.selectedHand, table: i });
    return;
  }
  AppStateSchwimmen.selectedTable = AppStateSchwimmen.selectedTable === i ? null : i;
  if (AppStateSchwimmen.selectedTable !== null) setStatusSchwimmen("Now tap the card of yours to give away for it.");
  renderSchwimmen();
}

/*** Rendering ***/

function lifeIconsSchwimmen(lives) {
  let html = "";
  for (let k = 0; k < SchwimmenCore.START_LIVES; k++) {
    const filled = k < lives;
    html += '<svg class="pc-life" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><circle cx="5" cy="5" r="' +
      (filled ? "4.2" : "3.6") + '" fill="' + (filled ? "currentColor" : "#fff") + '" stroke="currentColor" stroke-width="1.4"/></svg>';
  }
  return html;
}

function renderSchwimmen() {
  const s = AppStateSchwimmen.state;
  if (!s) return;
  const over = AppStateSchwimmen.gameOver;
  const showAll = s.roundOver || over;
  const hidden = AppStateSchwimmen.mode === "hotseat" && !AppStateSchwimmen.revealed && !showAll;
  const viewer = viewerSchwimmen();
  const myTurn = !showAll && s.turn === viewer && !isAiSchwimmen(s.turn) && !hidden;

  // Players
  const playersEl = document.getElementById("schwimmen-players");
  playersEl.innerHTML = "";
  for (let p = 0; p < s.numPlayers; p++) {
    const row = document.createElement("div");
    row.className = "game-player" + (p === s.turn && !showAll ? " game-player-active" : "") + (s.out[p] ? " game-player-stock" : "");
    const name = document.createElement("span");
    name.className = "game-player-name";
    let label = playerNameSchwimmen(p);
    if (AppStateSchwimmen.mode === "vs-ai") label = p === 0 ? label + " (you)" : label + " (computer)";
    I18n.setMsg(name, label);
    row.appendChild(name);
    const lives = document.createElement("span");
    lives.className = "pc-player-extra";
    if (s.out[p]) {
      I18n.setMsg(lives, "out");
    } else {
      lives.innerHTML = lifeIconsSchwimmen(s.lives[p]);
      if (s.swimming[p]) {
        const sw = document.createElement("span");
        sw.className = "pc-player-extra";
        I18n.setMsg(sw, "swimming");
        lives.appendChild(sw);
      }
      I18n.setAria(lives, s.swimming[p] ? "swimming" : (s.lives[p] === 1 ? "1 life" : s.lives[p] + " lives"));
    }
    row.appendChild(lives);
    if (s.knockedBy === p && !showAll) {
      const k = document.createElement("span");
      k.className = "pc-player-extra";
      I18n.setMsg(k, "knocked");
      row.appendChild(k);
    }
    if (showAll && s.lastRound && s.lastRound.scores[p] !== null) {
      const sc = document.createElement("span");
      sc.className = "pc-player-extra";
      I18n.setMsg(sc, s.lastRound.scores[p] + " points");
      row.appendChild(sc);
    }
    playersEl.appendChild(row);
  }

  // Middle cards
  const tableEl = document.getElementById("schwimmen-table");
  tableEl.innerHTML = "";
  s.table.forEach((card, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pc-card" + (AppStateSchwimmen.selectedTable === i ? " pc-card-selected" : "");
    CardFaces.renderTall(btn, card);
    btn.disabled = !myTurn;
    I18n.setAria(btn, "Middle card " + CardFaces.label(card));
    btn.addEventListener("click", () => onTableCardSchwimmen(i));
    tableEl.appendChild(btn);
  });

  // Own hand, or every hand after a round
  const cover = document.getElementById("schwimmen-hand-cover");
  const coverText = document.getElementById("schwimmen-hand-cover-text");
  cover.classList.toggle("hidden", !hidden);
  if (hidden) I18n.setMsg(coverText, "Pass the device to " + playerNameSchwimmen(s.turn) + ".");
  const handWrap = document.getElementById("schwimmen-hand-wrap");
  handWrap.classList.toggle("hidden", hidden);
  const handEl = document.getElementById("schwimmen-hand");
  handEl.innerHTML = "";
  const scoreEl = document.getElementById("schwimmen-score");
  const allEl = document.getElementById("schwimmen-all-hands");
  allEl.innerHTML = "";
  if (showAll) {
    handWrap.classList.add("hidden");
    for (let p = 0; p < s.numPlayers; p++) {
      if (!s.hands[p] || !s.hands[p].length) continue;
      const row = document.createElement("div");
      row.className = "pc-row";
      const label = document.createElement("span");
      label.className = "pc-row-label";
      I18n.setMsg(label, playerNameSchwimmen(p) + ": " + scoreTextSchwimmen(SchwimmenCore.handScore(s.hands[p])) + " points");
      row.appendChild(label);
      s.hands[p].forEach((card) => {
        const c = document.createElement("span");
        c.className = "pc-card pc-card-small";
        c.setAttribute("role", "img");
        CardFaces.renderTall(c, card);
        I18n.setAria(c, CardFaces.label(card));
        row.appendChild(c);
      });
      allEl.appendChild(row);
    }
  } else if (!hidden) {
    s.hands[viewer].forEach((card, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pc-card" + (AppStateSchwimmen.selectedHand === i ? " pc-card-selected" : "");
      CardFaces.renderTall(btn, card);
      btn.disabled = !myTurn;
      I18n.setAria(btn, "Your card " + CardFaces.label(card) + (AppStateSchwimmen.selectedHand === i ? ", selected" : ""));
      btn.addEventListener("click", () => onHandCardSchwimmen(i));
      handEl.appendChild(btn);
    });
    I18n.setMsg(scoreEl, "Your points: " + scoreTextSchwimmen(SchwimmenCore.handScore(s.hands[viewer])));
  }

  const actions = document.getElementById("schwimmen-actions");
  actions.classList.toggle("hidden", !myTurn);
  document.getElementById("schwimmen-next-round").classList.toggle("hidden", !(s.roundOver && !over));
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", over || !AppStateSchwimmen.started);
}

document.addEventListener("DOMContentLoaded", initSchwimmenApp);
