// durak-app.js
// Wires DurakCore/DurakAi to durak.html.
//
// Layout: the trump suit always visible at the top (symbol and word, with
// the face-up trump card and the stock count), the players with their
// card counts and who attacks or defends, the table as attack cards with
// the beating card laid slightly lower over each, and the player's hand
// below. Tap a card to lead, beat the oldest unbeaten card, or throw it
// in. "Take the cards", "Pass" and (with the transfer rule) "Pass the
// attack on" are buttons. Cards that can't be used right now sit lower
// with a dashed border; tapping one says why.
//
// With two or more people on one device the hand is covered whenever the
// player who has to decide changes. Against the computer the human is
// Player 1. Computer moves wait AiPacing.delay().

const DURAK_SAVE_KEY = "einkchess_save_durak";
const DURAK_SUIT_NAME = { S: "Spades", H: "Hearts", D: "Diamonds", C: "Clubs" };

const AppStateDurak = {
  mode: "vs-ai",
  numPlayers: 2,
  aiLevel: 2,
  transfer: false,
  state: null,
  started: false,
  gameOver: false,
  revealed: true,
  shownFor: null,     // hotseat: whose hand is uncovered
  transferMode: false,
  busy: false
};

function playerNameDurak(i) {
  return "Player " + (i + 1);
}

function isAiDurak(i) {
  return AppStateDurak.mode === "vs-ai" && i !== 0;
}

function cardTextDurak(card) {
  return CardFaces.labelAny(card);
}

function setStatusDurak(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setResultDurak(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveDurak() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(DURAK_SAVE_KEY, {
    mode: AppStateDurak.mode,
    numPlayers: AppStateDurak.numPlayers,
    aiLevel: AppStateDurak.aiLevel,
    transfer: AppStateDurak.transfer,
    state: AppStateDurak.state
  });
}

function clearSaveDurak() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(DURAK_SAVE_KEY);
}

/*** Game flow ***/

function initDurakApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeAi = document.getElementById("mode-offline-ai");
  const levelWrap = document.getElementById("durak-level-wrap");
  const levelSelect = document.getElementById("durak-level-inline");
  const playersSelect = document.getElementById("durak-num-players");
  const transferBox = document.getElementById("durak-transfer-rule");
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

  document.getElementById("start-durak-game").addEventListener("click", () => {
    const n = playersSelect ? parseInt(playersSelect.value, 10) : 2;
    const level = levelSelect ? parseInt(levelSelect.value, 10) : 2;
    startGameDurak(pendingMode, n, level, !!(transferBox && transferBox.checked));
    const status = document.getElementById("offline-durak-status");
    if (status) {
      const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
      I18n.setMsg(status, pendingMode === "vs-ai"
        ? "You play Player 1, computer level: " + levelNames[level] + "."
        : "Local " + n + "-player hotseat game (no computer).");
    }
  });

  document.getElementById("durak-take").addEventListener("click", () => humanMoveDurak({ type: "take" }));
  document.getElementById("durak-pass").addEventListener("click", () => humanMoveDurak({ type: "pass" }));
  document.getElementById("durak-transfer").addEventListener("click", () => {
    if (!humanCanActDurak()) return;
    AppStateDurak.transferMode = !AppStateDurak.transferMode;
    setStatusDurak(AppStateDurak.transferMode
      ? "Tap a card of the same rank to pass the attack on."
      : promptTextDurak());
    renderDurak();
  });
  document.getElementById("durak-show-hand").addEventListener("click", () => {
    AppStateDurak.revealed = true;
    AppStateDurak.shownFor = AppStateDurak.state.actor;
    setStatusDurak(playerNameDurak(AppStateDurak.state.actor) + "'s turn. " + promptTextDurak());
    renderDurak();
  });
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.addEventListener("click", resignDurak);

  setMode("vs-ai");

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(DURAK_SAVE_KEY) : null;
  if (saved && saved.state && !saved.state.gameOver) {
    AppStateDurak.mode = saved.mode;
    AppStateDurak.numPlayers = saved.numPlayers;
    AppStateDurak.aiLevel = saved.aiLevel;
    AppStateDurak.transfer = saved.transfer;
    AppStateDurak.state = saved.state;
    AppStateDurak.started = true;
    AppStateDurak.gameOver = false;
    AppStateDurak.revealed = saved.mode !== "hotseat";
    AppStateDurak.shownFor = null;
    setMode(saved.mode);
    if (transferBox) transferBox.checked = !!saved.transfer;
    showBoardDurak();
    announceTurnDurak("");
  }
}

function showBoardDurak() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameDurak(mode, numPlayers, level, transfer) {
  AppStateDurak.mode = mode;
  AppStateDurak.numPlayers = numPlayers;
  AppStateDurak.aiLevel = level;
  AppStateDurak.transfer = transfer;
  AppStateDurak.state = DurakCore.createInitialState(numPlayers, { transfer });
  AppStateDurak.started = true;
  AppStateDurak.gameOver = false;
  AppStateDurak.busy = false;
  AppStateDurak.transferMode = false;
  AppStateDurak.revealed = mode !== "hotseat";
  AppStateDurak.shownFor = null;
  setResultDurak("");
  showBoardDurak();
  const s = AppStateDurak.state;
  let msg = "Trump is " + DURAK_SUIT_NAME[s.trumpSuit] + ".";
  msg += s.firstTrump
    ? " " + playerNameDurak(s.firstAttacker) + " has the lowest trump and attacks first."
    : " Nobody has a trump - Player 1 attacks first.";
  saveDurak();
  announceTurnDurak(msg);
}

function promptTextDurak() {
  const s = AppStateDurak.state;
  if (s.phase === "lead") return "Choose a card to attack with.";
  if (s.phase === "defend") {
    const i = DurakCore.unbeatenIndex(s);
    return "Beat the " + cardTextDurak(s.table[i].attack) + " or take the cards.";
  }
  if (s.taking) return playerNameDurak(s.defender) + " is taking the cards: throw in more of the same ranks, or pass.";
  return "Throw in a card of a rank on the table, or pass.";
}

// Tells whose decision it is now, covers the hand in a hotseat game when
// that person changed, and hands over to the computer when it is its
// turn.
function announceTurnDurak(prefix) {
  const s = AppStateDurak.state;
  const pre = prefix ? prefix + " " : "";
  if (s.gameOver) {
    endGameDurak(pre);
    return;
  }
  if (isAiDurak(s.actor)) {
    setStatusDurak(pre + playerNameDurak(s.actor) + "'s turn.");
    renderDurak();
    continueDurak();
    return;
  }
  if (AppStateDurak.mode === "hotseat" && AppStateDurak.shownFor !== s.actor) {
    AppStateDurak.revealed = false;
    setStatusDurak(pre + "Pass the device to " + playerNameDurak(s.actor) + ".");
    renderDurak();
    return;
  }
  setStatusDurak(pre + playerNameDurak(s.actor) + "'s turn. " + promptTextDurak());
  renderDurak();
}

function continueDurak() {
  const s = AppStateDurak.state;
  if (AppStateDurak.gameOver || !isAiDurak(s.actor) || AppStateDurak.busy) return;
  AppStateDurak.busy = true;
  setTimeout(aiTurnDurak, AiPacing.delay(800));
}

function aiTurnDurak() {
  AppStateDurak.busy = false;
  const s = AppStateDurak.state;
  if (AppStateDurak.gameOver || !isAiDurak(s.actor)) return;
  applyMoveDurak(DurakAi.chooseMove(s, AppStateDurak.aiLevel));
}

function describeDurak(before, after, move) {
  const who = playerNameDurak(before.actor);
  let msg;
  if (move.type === "lead") msg = who + " attacks with " + cardTextDurak(move.card) + ".";
  else if (move.type === "defend") {
    const i = DurakCore.unbeatenIndex(before);
    msg = who + " beats " + cardTextDurak(before.table[i].attack) + " with " + cardTextDurak(move.card) + ".";
  } else if (move.type === "throw") msg = who + " throws in " + cardTextDurak(move.card) + ".";
  else if (move.type === "take") msg = who + " takes the cards.";
  else if (move.type === "transfer") msg = who + " passes the attack on with " + cardTextDurak(move.card) + ".";
  else msg = who + " passed.";
  // A round that just ended.
  const ev = after.lastEvent;
  if (ev && (ev.type === "defended" || ev.type === "took")) {
    if (ev.type === "defended") msg += " Everything is beaten - the cards leave the game.";
    else msg += " " + playerNameDurak(ev.defender) + (ev.count === 1 ? " picks up 1 card." : " picks up " + ev.count + " cards.");
    for (let p = 0; p < after.numPlayers; p++) {
      if (after.outPlayers.indexOf(p) !== -1 && before.outPlayers.indexOf(p) === -1) msg += " " + playerNameDurak(p) + " has no cards left.";
    }
  }
  return msg;
}

function applyMoveDurak(move) {
  const before = AppStateDurak.state;
  const r = DurakCore.applyMove(before, move);
  if (!r.ok) return false;
  AppStateDurak.state = r.state;
  AppStateDurak.transferMode = false;
  const msg = describeDurak(before, r.state, move);
  saveDurak();
  announceTurnDurak(msg);
  return true;
}

function endGameDurak(prefix) {
  const s = AppStateDurak.state;
  AppStateDurak.gameOver = true;
  let title, full;
  if (s.draw) {
    full = prefix + "Everybody ran out of cards together - the game is a draw.";
    title = "Draw";
    if (AppStateDurak.mode === "vs-ai" && typeof GameStats !== "undefined") GameStats.record("durak", "draw");
  } else {
    full = prefix + playerNameDurak(s.loser) + " is left holding cards and is the durak.";
    if (AppStateDurak.mode === "vs-ai") {
      title = s.loser === 0 ? "You lose" : "You win!";
      if (typeof GameStats !== "undefined") GameStats.record("durak", s.loser === 0 ? "loss" : "win");
    } else {
      title = playerNameDurak(s.loser) + " is the durak";
    }
  }
  setResultDurak(full);
  setStatusDurak(full);
  if (window.ResultModal) window.ResultModal.show(title, full);
  clearSaveDurak();
  renderDurak();
}

function resignDurak() {
  if (AppStateDurak.gameOver || !AppStateDurak.started) return;
  const s = AppStateDurak.state;
  const loser = AppStateDurak.mode === "vs-ai" ? 0 : s.actor;
  s.gameOver = true;
  s.loser = loser;
  AppStateDurak.gameOver = true;
  const msg = playerNameDurak(loser) + " resigned and is the durak.";
  if (AppStateDurak.mode === "vs-ai" && typeof GameStats !== "undefined") GameStats.record("durak", "loss");
  setResultDurak(msg);
  setStatusDurak(msg);
  if (window.ResultModal) window.ResultModal.show(AppStateDurak.mode === "vs-ai" ? "You lose" : playerNameDurak(loser) + " is the durak", msg);
  clearSaveDurak();
  renderDurak();
}

/*** Human input ***/

function humanCanActDurak() {
  const s = AppStateDurak.state;
  if (!AppStateDurak.started || AppStateDurak.gameOver || !s) return false;
  if (isAiDurak(s.actor)) {
    setStatusDurak("Computer thinking…");
    return false;
  }
  if (AppStateDurak.mode === "hotseat" && !AppStateDurak.revealed) return false;
  return true;
}

function humanMoveDurak(move) {
  if (!humanCanActDurak()) return;
  const s = AppStateDurak.state;
  if (move.type === "take" && s.phase !== "defend") {
    setStatusDurak("Only the defender can take the cards.");
    return;
  }
  if (move.type === "pass" && s.phase !== "throw") {
    setStatusDurak(s.phase === "lead" ? "You have to attack with a card." : "Beat the card or take the cards.");
    return;
  }
  applyMoveDurak(move);
}

function onHandCardDurak(index) {
  if (!humanCanActDurak()) return;
  const s = AppStateDurak.state;
  const card = s.hands[s.actor][index];
  if (s.phase === "lead") {
    applyMoveDurak({ type: "lead", card });
    return;
  }
  if (s.phase === "defend") {
    if (AppStateDurak.transferMode) {
      if (DurakCore.canTransfer(s, card)) applyMoveDurak({ type: "transfer", card });
      else setStatusDurak("To pass the attack on you need a card of the same rank, and the next player needs enough cards.");
      return;
    }
    const problem = DurakCore.defendProblem(s, card);
    if (problem) {
      const attack = s.table[DurakCore.unbeatenIndex(s)].attack;
      setStatusDurak("The " + cardTextDurak(card) + " can't beat the " + cardTextDurak(attack) +
        ": use a higher card of the same suit or a trump.");
      return;
    }
    applyMoveDurak({ type: "defend", card });
    return;
  }
  if (s.phase === "throw") {
    const problem = DurakCore.throwProblem(s, s.actor, card);
    if (problem === "rank") setStatusDurak("Only ranks that are already on the table can be thrown in.");
    else if (problem === "limit") setStatusDurak("No more cards can be thrown in this round.");
    else applyMoveDurak({ type: "throw", card });
  }
}

/*** Rendering ***/

function cardElDurak(card, tag, extraClass) {
  const el = document.createElement(tag);
  if (tag === "button") el.type = "button";
  else el.setAttribute("role", "img");
  el.className = "pc-card" + (extraClass ? " " + extraClass : "");
  CardFaces.renderTall(el, card);
  return el;
}

function usableDurak(s, card) {
  if (s.phase === "lead") return true;
  if (s.phase === "defend") return AppStateDurak.transferMode ? DurakCore.canTransfer(s, card) : !DurakCore.defendProblem(s, card);
  if (s.phase === "throw") return !DurakCore.throwProblem(s, s.actor, card);
  return false;
}

function renderDurak() {
  const s = AppStateDurak.state;
  if (!s) return;
  const over = AppStateDurak.gameOver;

  // Trump and stock
  const trumpEl = document.getElementById("durak-trump");
  trumpEl.innerHTML = "";
  const label = document.createElement("span");
  label.className = "durak-trump-label";
  I18n.setMsg(label, "Trump: " + DURAK_SUIT_NAME[s.trumpSuit]);
  trumpEl.appendChild(label);
  const sym = document.createElement("span");
  sym.className = "durak-trump-symbol";
  sym.innerHTML = CardFaces.suitSvg(s.trumpSuit);
  trumpEl.appendChild(sym);
  const trumpCard = cardElDurak(s.trumpCard, "span", "pc-card-small durak-trump-card" + (s.stock.length ? "" : " pc-card-dim"));
  I18n.setAria(trumpCard, "Trump card " + cardTextDurak(s.trumpCard));
  trumpEl.appendChild(trumpCard);
  const stock = document.createElement("span");
  stock.className = "pc-count";
  I18n.setMsg(stock, "Stock: " + s.stock.length);
  trumpEl.appendChild(stock);

  // Players
  const playersEl = document.getElementById("durak-players");
  playersEl.innerHTML = "";
  for (let p = 0; p < s.numPlayers; p++) {
    const row = document.createElement("div");
    const out = s.outPlayers.indexOf(p) !== -1;
    row.className = "game-player" + (p === s.actor && !over ? " game-player-active" : "") + (out ? " game-player-stock" : "");
    const name = document.createElement("span");
    name.className = "game-player-name";
    let nm = playerNameDurak(p);
    if (AppStateDurak.mode === "vs-ai") nm = p === 0 ? nm + " (you)" : nm + " (computer)";
    I18n.setMsg(name, nm);
    row.appendChild(name);
    const count = document.createElement("span");
    count.className = "game-player-count";
    I18n.setMsg(count, out ? "out" : (s.hands[p].length === 1 ? "1 card" : s.hands[p].length + " cards"));
    row.appendChild(count);
    if (!over && !out && (p === s.attacker || p === s.defender)) {
      const role = document.createElement("span");
      role.className = "pc-player-extra";
      I18n.setMsg(role, p === s.defender ? "defends" : "attacks");
      row.appendChild(role);
    }
    playersEl.appendChild(row);
  }

  // Table
  const tableEl = document.getElementById("durak-table");
  tableEl.innerHTML = "";
  s.table.forEach((pair) => {
    const wrap = document.createElement("span");
    wrap.className = "durak-pair";
    const a = cardElDurak(pair.attack, "span", "pc-card-small durak-attack");
    let aria = "Attack " + cardTextDurak(pair.attack);
    wrap.appendChild(a);
    if (pair.defense) {
      const d = cardElDurak(pair.defense, "span", "pc-card-small durak-defense");
      wrap.appendChild(d);
      aria += ", beaten by " + cardTextDurak(pair.defense);
    }
    I18n.setAria(wrap, aria);
    wrap.setAttribute("role", "img");
    a.removeAttribute("role");
    tableEl.appendChild(wrap);
  });
  const tableInfo = document.getElementById("durak-table-info");
  I18n.setMsg(tableInfo, s.table.length ? "Attack cards: " + s.table.length + " / " + s.maxAttacks : "");

  // Hand
  const hidden = AppStateDurak.mode === "hotseat" && !AppStateDurak.revealed && !over;
  const cover = document.getElementById("durak-hand-cover");
  cover.classList.toggle("hidden", !hidden);
  if (hidden) I18n.setMsg(document.getElementById("durak-hand-cover-text"), "Pass the device to " + playerNameDurak(s.actor) + ".");
  const handEl = document.getElementById("durak-hand");
  handEl.classList.toggle("hidden", hidden);
  handEl.innerHTML = "";
  const viewer = AppStateDurak.mode === "vs-ai" ? 0 : (AppStateDurak.shownFor !== null ? AppStateDurak.shownFor : s.actor);
  const myTurn = !over && !hidden && s.actor === viewer && !isAiDurak(s.actor);
  if (!hidden) {
    const hand = s.hands[viewer].slice().map((c, i) => ({ c, i }));
    hand.sort((x, y) => (x.c.suit === s.trumpSuit) - (y.c.suit === s.trumpSuit) ||
      DurakCore.SUITS.indexOf(x.c.suit) - DurakCore.SUITS.indexOf(y.c.suit) || x.c.rank - y.c.rank);
    hand.forEach(({ c, i }) => {
      const btn = cardElDurak(c, "button", myTurn && !usableDurak(s, c) ? "pc-card-dim" : "");
      btn.disabled = !myTurn;
      I18n.setAria(btn, "Card " + cardTextDurak(c));
      btn.addEventListener("click", () => onHandCardDurak(i));
      handEl.appendChild(btn);
    });
  }

  const takeBtn = document.getElementById("durak-take");
  const passBtn = document.getElementById("durak-pass");
  const transferBtn = document.getElementById("durak-transfer");
  takeBtn.classList.toggle("hidden", !(myTurn && s.phase === "defend"));
  passBtn.classList.toggle("hidden", !(myTurn && s.phase === "throw"));
  const canTransferAny = myTurn && s.phase === "defend" && s.hands[s.actor].some((c) => DurakCore.canTransfer(s, c));
  transferBtn.classList.toggle("hidden", !canTransferAny);
  transferBtn.classList.toggle("active-mode", AppStateDurak.transferMode);
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", over || !AppStateDurak.started);
}

document.addEventListener("DOMContentLoaded", initDurakApp);
