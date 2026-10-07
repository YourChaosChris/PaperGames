// concan-app.js
// Wires ConcanCore/ConcanAi to concan.html.
//
// Layout: the opponent's laid-out melds and card count at the top, the
// stock and the discard pile in the middle, your own melds below them and
// your hand at the bottom, each with a count towards eleven. A turn:
// tap the discard pile to take it (only if it fits - and then you must),
// or the stock to draw. Select hand cards and press "Lay out" for a new
// meld, or tap one of your melds to add the selected card (or the card
// you took). Select one card and press "Discard" to end the turn.
//
// With two people on one device each hand is covered between turns.
// Against the computer the human is Player 1. Computer steps wait
// AiPacing.delay().

const CONCAN_SAVE_KEY = "einkchess_save_concan";

const AppStateConcan = {
  mode: "vs-ai",
  aiLevel: 2,
  state: null,
  started: false,
  gameOver: false,
  revealed: true,
  selected: [],   // indices into the current hand
  busy: false,
  newKeys: []     // the card the human just drew from the stock ("7H"), marked in the hand
};

function cardKeyConcan(c) { return c.rank + c.suit; }

// A drawn card is named (and marked) only for whoever may see that hand:
// the human against the computer, or the player at the device, whose
// hand is open during their own turn.
function showDrawnConcan(player) {
  return isYouConcan(player) || AppStateConcan.mode === "hotseat";
}

function drawnCardsConcan(before, after, move) {
  if (move.type !== "draw") return [];
  const had = new Set(before.hands[before.turn].map(cardKeyConcan));
  return after.hands[before.turn].filter((c) => !had.has(cardKeyConcan(c)));
}

// Against the computer the human is "You" and the computer "Computer 1";
// on one device the seats are "Player 1" and "Player 2". Sentences about
// the human have their own wording, they are not built from the name.
function playerNameConcan(i) {
  if (AppStateConcan.mode === "vs-ai") return i === 0 ? "You" : "Computer " + i;
  return "Player " + (i + 1);
}

function isYouConcan(i) {
  return AppStateConcan.mode === "vs-ai" && i === 0;
}

function isAiConcan(i) {
  return AppStateConcan.mode === "vs-ai" && i !== 0;
}

function cardsTextConcan(cards) {
  return cards.map((c) => CardFaces.label(c)).join(" ");
}

function setStatusConcan(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setResultConcan(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveConcan() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(CONCAN_SAVE_KEY, { mode: AppStateConcan.mode, aiLevel: AppStateConcan.aiLevel, state: AppStateConcan.state });
}

function clearSaveConcan() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(CONCAN_SAVE_KEY);
}

/*** Game flow ***/

function initConcanApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeAi = document.getElementById("mode-offline-ai");
  const levelWrap = document.getElementById("concan-level-wrap");
  const levelSelect = document.getElementById("concan-level-inline");
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

  document.getElementById("start-concan-game").addEventListener("click", () => {
    const level = levelSelect ? parseInt(levelSelect.value, 10) : 2;
    startGameConcan(pendingMode, level);
    const status = document.getElementById("offline-concan-status");
    if (status) {
      const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
      I18n.setMsg(status, pendingMode === "vs-ai"
        ? "Computer opponents: 1 · computer level: " + levelNames[level]
        : "Local 2-player hotseat game (no computer).");
    }
  });

  document.getElementById("concan-stock").addEventListener("click", onStockConcan);
  document.getElementById("concan-discard").addEventListener("click", onDiscardPileConcan);
  document.getElementById("concan-meld-button").addEventListener("click", onMeldButtonConcan);
  document.getElementById("concan-discard-button").addEventListener("click", onDiscardButtonConcan);
  document.getElementById("concan-show-hand").addEventListener("click", () => {
    AppStateConcan.revealed = true;
    promptConcan("");
  });
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.addEventListener("click", resignConcan);

  setMode("vs-ai");

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(CONCAN_SAVE_KEY) : null;
  if (saved && saved.state && !saved.state.gameOver) {
    AppStateConcan.mode = saved.mode;
    AppStateConcan.aiLevel = saved.aiLevel;
    AppStateConcan.state = saved.state;
    AppStateConcan.started = true;
    AppStateConcan.gameOver = false;
    AppStateConcan.revealed = saved.mode !== "hotseat";
    AppStateConcan.selected = [];
    setMode(saved.mode);
    showBoardConcan();
    afterStepConcan("");
  }
}

function showBoardConcan() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameConcan(mode, level) {
  AppStateConcan.mode = mode;
  AppStateConcan.aiLevel = level;
  AppStateConcan.state = ConcanCore.createInitialState();
  AppStateConcan.started = true;
  AppStateConcan.gameOver = false;
  AppStateConcan.busy = false;
  AppStateConcan.selected = [];
  AppStateConcan.revealed = mode !== "hotseat";
  setResultConcan("");
  showBoardConcan();
  saveConcan();
  if (mode === "hotseat") {
    setStatusConcan("Pass the device to " + playerNameConcan(0) + ".");
    renderConcan();
    return;
  }
  promptConcan("");
}

function promptTextConcan() {
  const s = AppStateConcan.state;
  const top = ConcanCore.topDiscard(s);
  if (s.phase === "start") {
    if (s.mustTakeDiscard) return "The " + CardFaces.label(top) + " on the discard pile fits your cards - you must take it.";
    return "Draw a card from the stock.";
  }
  if (s.taken) return "Lay out the " + CardFaces.label(s.taken) + " you took: select cards to meld with it, or tap one of your melds.";
  return "Lay out melds or add to yours, then select a card and discard it.";
}

function promptConcan(prefix) {
  const s = AppStateConcan.state;
  const pre = prefix ? prefix + " " : "";
  if (isAiConcan(s.turn)) setStatusConcan(pre + playerNameConcan(s.turn) + "'s turn.");
  else setStatusConcan(pre + (isYouConcan(s.turn) ? "Your turn. " : playerNameConcan(s.turn) + "'s turn. ") + promptTextConcan());
  renderConcan();
}

// After every applied step: game over, hand-over in a hotseat game, the
// computer's next step, or the next prompt.
function afterStepConcan(msg, turnChanged) {
  const s = AppStateConcan.state;
  saveConcan();
  if (s.gameOver) {
    endGameConcan(msg);
    return;
  }
  if (turnChanged && AppStateConcan.mode === "hotseat") {
    AppStateConcan.revealed = false;
    setStatusConcan((msg ? msg + " " : "") + "Pass the device to " + playerNameConcan(s.turn) + ".");
    renderConcan();
    return;
  }
  promptConcan(msg);
  continueConcan();
}

function continueConcan() {
  const s = AppStateConcan.state;
  if (AppStateConcan.gameOver || !isAiConcan(s.turn) || AppStateConcan.busy) return;
  AppStateConcan.busy = true;
  setTimeout(aiStepConcan, AiPacing.delay(800));
}

function aiStepConcan() {
  AppStateConcan.busy = false;
  const s = AppStateConcan.state;
  if (AppStateConcan.gameOver || !isAiConcan(s.turn)) return;
  applyConcan(ConcanAi.chooseMove(s, AppStateConcan.aiLevel));
}

function describeConcan(before, after, move) {
  const who = playerNameConcan(before.turn);
  const ev = after.lastEvent;
  const drawn = drawnCardsConcan(before, after, move);
  if (drawn.length === 1 && showDrawnConcan(before.turn)) {
    return isYouConcan(before.turn) ? "You draw the " + CardFaces.label(drawn[0]) + "." : who + " draws the " + CardFaces.label(drawn[0]) + ".";
  }
  if (isYouConcan(before.turn)) {
    if (move.type === "takeDiscard") return "You take the " + CardFaces.label(ev.card) + ".";
    if (move.type === "draw") return ev.type === "stock-empty" ? "" : "You draw a card.";
    if (move.type === "meld") return "You lay out " + cardsTextConcan(ev.cards) + ".";
    if (move.type === "extend") return "You add the " + CardFaces.label(ev.card) + " to a meld.";
    if (move.type === "discard") return "You discard the " + CardFaces.label(ev.card) + ".";
  }
  if (move.type === "takeDiscard") return who + " takes the " + CardFaces.label(ev.card) + ".";
  if (move.type === "draw") return ev.type === "stock-empty" ? "" : who + " draws a card.";
  if (move.type === "meld") return who + " lays out " + cardsTextConcan(ev.cards) + ".";
  if (move.type === "extend") return who + " adds the " + CardFaces.label(ev.card) + " to a meld.";
  if (move.type === "discard") return who + " discards the " + CardFaces.label(ev.card) + ".";
  return "";
}

function applyConcan(move) {
  const before = AppStateConcan.state;
  const r = ConcanCore.applyMove(before, move);
  if (!r.ok) return r.reason;
  AppStateConcan.state = r.state;
  AppStateConcan.selected = [];
  AppStateConcan.newKeys = showDrawnConcan(before.turn) && r.state.turn === before.turn ? drawnCardsConcan(before, r.state, move).map(cardKeyConcan) : [];
  afterStepConcan(describeConcan(before, r.state, move), r.state.turn !== before.turn);
  return null;
}

function endGameConcan(prefix) {
  const s = AppStateConcan.state;
  AppStateConcan.gameOver = true;
  const pre = prefix ? prefix + " " : "";
  let title, full;
  if (s.draw) {
    full = pre + "The stock is empty and nobody has eleven cards laid out - the game is a draw.";
    title = "Draw";
    if (AppStateConcan.mode === "vs-ai" && typeof GameStats !== "undefined") GameStats.record("concan", "draw");
  } else {
    full = pre + (isYouConcan(s.winner) ? "You have eleven cards laid out and win." : playerNameConcan(s.winner) + " has eleven cards laid out and wins.");
    if (AppStateConcan.mode === "vs-ai") {
      title = s.winner === 0 ? "You win!" : "You lose";
      if (typeof GameStats !== "undefined") GameStats.record("concan", s.winner === 0 ? "win" : "loss");
    } else {
      title = playerNameConcan(s.winner) + " wins";
    }
  }
  setResultConcan(full);
  setStatusConcan(full);
  if (window.ResultModal) window.ResultModal.show(title, full);
  clearSaveConcan();
  renderConcan();
}

function resignConcan() {
  if (AppStateConcan.gameOver || !AppStateConcan.started) return;
  const s = AppStateConcan.state;
  const loser = AppStateConcan.mode === "vs-ai" ? 0 : s.turn;
  s.gameOver = true;
  s.winner = 1 - loser;
  AppStateConcan.gameOver = true;
  const msg = (isYouConcan(loser) ? "You resigned. " : playerNameConcan(loser) + " resigned. ") + playerNameConcan(1 - loser) + " wins.";
  if (AppStateConcan.mode === "vs-ai" && typeof GameStats !== "undefined") GameStats.record("concan", "loss");
  setResultConcan(msg);
  setStatusConcan(msg);
  if (window.ResultModal) window.ResultModal.show(AppStateConcan.mode === "vs-ai" ? "You lose" : playerNameConcan(1 - loser) + " wins", msg);
  clearSaveConcan();
  renderConcan();
}

/*** Human input ***/

function humanCanActConcan() {
  const s = AppStateConcan.state;
  if (!AppStateConcan.started || AppStateConcan.gameOver || !s) return false;
  if (isAiConcan(s.turn)) {
    setStatusConcan("Computer thinking…");
    return false;
  }
  if (AppStateConcan.mode === "hotseat" && !AppStateConcan.revealed) return false;
  return true;
}

const CONCAN_REASON_TEXT = {
  "must-take": "The card on the discard pile fits your cards - you must take it and lay it out.",
  "cant-use": "That card doesn't fit any of your cards or melds - draw from the stock instead.",
  "not-now": "Draw or take a card first.",
  "not-a-meld": "These cards don't form a set (same rank) or a run (same suit in order).",
  "doesnt-fit": "That card doesn't fit this meld.",
  "keep-one": "Keep one card to discard - you can only lay out your last card when it makes eleven.",
  "lay-out-taken": "Lay out the card you took first."
};

function explainConcan(reason) {
  setStatusConcan(CONCAN_REASON_TEXT[reason] || "That isn't possible right now.");
}

function onStockConcan() {
  if (!humanCanActConcan()) return;
  const s = AppStateConcan.state;
  if (s.phase !== "start") {
    setStatusConcan("You have already drawn or taken a card this turn.");
    return;
  }
  const reason = applyConcan({ type: "draw" });
  if (reason) explainConcan(reason);
}

function onDiscardPileConcan() {
  if (!humanCanActConcan()) return;
  const s = AppStateConcan.state;
  if (s.phase !== "start") {
    setStatusConcan("You have already drawn or taken a card this turn.");
    return;
  }
  const reason = applyConcan({ type: "takeDiscard" });
  if (reason) explainConcan(reason);
}

function onHandCardConcan(i) {
  if (!humanCanActConcan()) return;
  AppStateConcan.newKeys = [];
  const sel = AppStateConcan.selected;
  const k = sel.indexOf(i);
  if (k === -1) sel.push(i); else sel.splice(k, 1);
  renderConcan();
}

function selectedCardsConcan() {
  const s = AppStateConcan.state;
  return AppStateConcan.selected.map((i) => s.hands[s.turn][i]);
}

function onMeldButtonConcan() {
  if (!humanCanActConcan()) return;
  const s = AppStateConcan.state;
  if (s.phase !== "meld") { explainConcan("not-now"); return; }
  const cards = selectedCardsConcan();
  const need = s.taken ? 2 : 3;
  if (cards.length < need) {
    setStatusConcan(s.taken ? "Select at least two of your cards to lay out with the card you took." : "Select at least three cards for a meld.");
    return;
  }
  const reason = applyConcan({ type: "meld", cards });
  if (reason) explainConcan(reason);
}

function onMeldTapConcan(meldIndex) {
  if (!humanCanActConcan()) return;
  const s = AppStateConcan.state;
  if (s.phase !== "meld") { explainConcan("not-now"); return; }
  const cards = selectedCardsConcan();
  if (!s.taken && cards.length !== 1) {
    setStatusConcan("Select exactly one card to add to a meld.");
    return;
  }
  const reason = applyConcan({ type: "extend", meld: meldIndex, card: s.taken ? null : cards[0] });
  if (reason) explainConcan(reason);
}

function onDiscardButtonConcan() {
  if (!humanCanActConcan()) return;
  const s = AppStateConcan.state;
  if (s.phase !== "meld") { explainConcan("not-now"); return; }
  if (s.taken) { explainConcan("lay-out-taken"); return; }
  const cards = selectedCardsConcan();
  if (cards.length !== 1) {
    setStatusConcan("Select exactly one card to discard.");
    return;
  }
  const reason = applyConcan({ type: "discard", card: cards[0] });
  if (reason) explainConcan(reason);
}

/*** Rendering ***/

function cardElConcan(card, tag, extra) {
  const el = document.createElement(tag);
  if (tag === "button") el.type = "button";
  el.className = "pc-card" + (extra ? " " + extra : "");
  CardFaces.renderTall(el, card);
  return el;
}

function renderMeldsConcan(el, melds, tappable) {
  el.innerHTML = "";
  melds.forEach((meld, i) => {
    const group = document.createElement(tappable ? "button" : "span");
    if (tappable) {
      group.type = "button";
      group.addEventListener("click", () => onMeldTapConcan(i));
    } else {
      group.setAttribute("role", "img");
    }
    group.className = "concan-meld";
    meld.cards.forEach((c) => {
      const card = cardElConcan(c, "span", "pc-card-small");
      group.appendChild(card);
    });
    I18n.setAria(group, "Meld " + cardsTextConcan(meld.cards));
    el.appendChild(group);
  });
}

function renderConcan() {
  const s = AppStateConcan.state;
  if (!s) return;
  const over = AppStateConcan.gameOver;
  const hidden = AppStateConcan.mode === "hotseat" && !AppStateConcan.revealed && !over;
  const viewer = AppStateConcan.mode === "vs-ai" ? 0 : s.turn;
  const other = 1 - viewer;
  const myTurn = !over && !hidden && !isAiConcan(s.turn) && s.turn === viewer;

  const playersEl = document.getElementById("concan-players");
  playersEl.innerHTML = "";
  for (let p = 0; p < 2; p++) {
    const row = document.createElement("div");
    row.className = "game-player" + (p === s.turn && !over ? " game-player-active" : "");
    const name = document.createElement("span");
    name.className = "game-player-name";
    const nm = playerNameConcan(p);
    I18n.setMsg(name, nm);
    row.appendChild(name);
    const count = document.createElement("span");
    count.className = "game-player-count";
    I18n.setMsg(count, "Laid out: " + ConcanCore.meldedCount(s, p) + " / " + ConcanCore.GOAL);
    row.appendChild(count);
    const hand = document.createElement("span");
    hand.className = "pc-player-extra";
    I18n.setMsg(hand, s.hands[p].length === 1 ? "1 card" : s.hands[p].length + " cards");
    row.appendChild(hand);
    playersEl.appendChild(row);
  }

  renderMeldsConcan(document.getElementById("concan-other-melds"), s.melds[other], false);
  I18n.setMsg(document.getElementById("concan-other-label"), playerNameConcan(other) + ": laid out");

  const stock = document.getElementById("concan-stock");
  stock.innerHTML = "";
  const cnt = document.createElement("span");
  cnt.className = "pc-count";
  cnt.textContent = String(s.stock.length);
  stock.appendChild(cnt);
  stock.disabled = !myTurn;
  I18n.setAria(stock, "Stock: " + s.stock.length);

  const discard = document.getElementById("concan-discard");
  const top = ConcanCore.topDiscard(s);
  discard.innerHTML = "";
  discard.disabled = !myTurn || !top;
  if (top) {
    CardFaces.renderTall(discard, top);
    discard.classList.toggle("concan-discard-offer", myTurn && s.phase === "start" && s.mustTakeDiscard);
    I18n.setAria(discard, "Discard pile " + CardFaces.label(top));
  } else {
    discard.classList.remove("concan-discard-offer");
    I18n.setAria(discard, "Discard pile empty");
  }

  const takenEl = document.getElementById("concan-taken");
  takenEl.innerHTML = "";
  takenEl.classList.toggle("hidden", !s.taken || hidden);
  if (s.taken && !hidden) {
    const label = document.createElement("span");
    label.className = "pc-row-label";
    I18n.setMsg(label, "Card to lay out:");
    takenEl.appendChild(label);
    const c = cardElConcan(s.taken, "span", "pc-card-selected");
    c.setAttribute("role", "img");
    I18n.setAria(c, CardFaces.label(s.taken));
    takenEl.appendChild(c);
  }

  const cover = document.getElementById("concan-hand-cover");
  cover.classList.toggle("hidden", !hidden);
  if (hidden) I18n.setMsg(document.getElementById("concan-hand-cover-text"), "Pass the device to " + playerNameConcan(s.turn) + ".");
  const mine = document.getElementById("concan-mine");
  mine.classList.toggle("hidden", hidden);
  renderMeldsConcan(document.getElementById("concan-my-melds"), hidden ? [] : s.melds[viewer], myTurn);
  I18n.setMsg(document.getElementById("concan-my-label"), playerNameConcan(viewer) + ": laid out");

  const handEl = document.getElementById("concan-hand");
  handEl.innerHTML = "";
  if (!hidden) {
    const order = s.hands[viewer].map((c, i) => ({ c, i }));
    order.sort((a, b) => ConcanCore.SUITS.indexOf(a.c.suit) - ConcanCore.SUITS.indexOf(b.c.suit) || ConcanCore.order(a.c.rank) - ConcanCore.order(b.c.rank));
    order.forEach(({ c, i }) => {
      const sel = AppStateConcan.selected.indexOf(i) !== -1;
      const fresh = (AppStateConcan.newKeys || []).indexOf(cardKeyConcan(c)) !== -1;
      const btn = cardElConcan(c, "button", (sel ? "pc-card-selected" : "") + (fresh ? " card-new" : ""));
      btn.disabled = !myTurn || s.phase !== "meld";
      I18n.setAria(btn, "Card " + CardFaces.label(c) + (sel ? ", selected" : "") + (fresh ? ", new" : ""));
      btn.addEventListener("click", () => onHandCardConcan(i));
      handEl.appendChild(btn);
    });
  }
  document.getElementById("concan-actions").classList.toggle("hidden", !(myTurn && s.phase === "meld"));
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", over || !AppStateConcan.started);
}

document.addEventListener("DOMContentLoaded", initConcanApp);
