// maumau-app.js
// Wires MauMauCore/MauMauAi to maumau.html.
//
// Layout: the stock and the discard pile side by side (tap the stock to
// draw), the suit asked for by the last Jack next to them while it
// applies, and the player's own hand below - tap a card to play it.
// Cards that can't be played right now sit lower with a dashed border.
// Opponents' hands are shown as counts. Cards are drawn the way
// Klondike draws them: rank and suit symbol, black on white.
//
// With two or more people on one device, each hand is covered between
// turns so nobody sees another's cards. Against the computer the human
// is always Player 1.

const MAUMAU_SAVE_KEY = "einkchess_save_maumau";

const MAUMAU_SUIT_SYMBOL = { S: "♠", H: "♥", D: "♦", C: "♣" };
const MAUMAU_SUIT_NAME = { S: "Spades", H: "Hearts", D: "Diamonds", C: "Clubs" };
const MAUMAU_RANK_LABEL = { 1: "A", 11: "J", 12: "Q", 13: "K" };

const AppStateMauMau = {
  mode: "vs-ai",       // "vs-ai" | "hotseat"
  numPlayers: 2,
  aiLevel: 2,
  state: null,
  started: false,
  gameOver: false,
  revealed: true,      // hotseat: whether the current hand is uncovered
  pendingJack: null,   // hand index of a Jack waiting for its suit
  lastPlayer: null,    // who played the card on top, for the last-move mark
  busy: false
};

function playerNameMauMau(i) {
  return "Player " + (i + 1);
}

function isAiPlayerMauMau(i) {
  return AppStateMauMau.mode === "vs-ai" && i !== 0;
}

function viewerMauMau() {
  return AppStateMauMau.mode === "vs-ai" ? 0 : AppStateMauMau.state.turn;
}

function cardTextMauMau(card) {
  return (MAUMAU_RANK_LABEL[card.rank] || String(card.rank)) + MAUMAU_SUIT_SYMBOL[card.suit];
}

function setStatusMauMau(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultMauMau(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveMauMauGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(MAUMAU_SAVE_KEY, {
    mode: AppStateMauMau.mode,
    numPlayers: AppStateMauMau.numPlayers,
    aiLevel: AppStateMauMau.aiLevel,
    state: AppStateMauMau.state,
    lastPlayer: AppStateMauMau.lastPlayer
  });
}

function clearSavedMauMauGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(MAUMAU_SAVE_KEY);
}

function recordStatsMauMau(outcome) {
  if (typeof GameStats === "undefined" || AppStateMauMau.mode !== "vs-ai") return;
  GameStats.record("maumau", outcome);
}

/*** Game flow ***/

function initMauMauApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const levelWrap = document.getElementById("maumau-level-wrap");
  const levelSelect = document.getElementById("maumau-level-inline");
  const playersSelect = document.getElementById("maumau-num-players");
  const startBtn = document.getElementById("start-maumau-game");
  const resignBtn = document.getElementById("resign-button");
  let pendingMode = "vs-ai";

  function setMode(mode) {
    pendingMode = mode;
    if (modeOffline) modeOffline.classList.toggle("active-mode", mode === "hotseat");
    if (modeOfflineAi) modeOfflineAi.classList.toggle("active-mode", mode === "vs-ai");
    if (levelWrap) levelWrap.classList.toggle("hidden", mode !== "vs-ai");
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  if (modeOffline) modeOffline.addEventListener("click", () => setMode("hotseat"));
  if (modeOfflineAi) modeOfflineAi.addEventListener("click", () => setMode("vs-ai"));

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const n = playersSelect ? parseInt(playersSelect.value, 10) : 2;
      const level = levelSelect ? parseInt(levelSelect.value, 10) : 2;
      startNewGameMauMau(pendingMode, n, level);
      const status = document.getElementById("offline-maumau-status");
      if (status) {
        const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
        I18n.setMsg(status, pendingMode === "vs-ai"
          ? "You play Player 1, computer level: " + levelNames[level] + "."
          : "Local " + n + "-player hotseat game (no computer).");
      }
    });
  }

  if (resignBtn) resignBtn.addEventListener("click", resignMauMau);

  document.getElementById("maumau-stock").addEventListener("click", onStockClickMauMau);
  document.getElementById("maumau-keep-button").addEventListener("click", onKeepClickMauMau);
  document.querySelectorAll(".maumau-wish-btn").forEach((btn) => {
    btn.addEventListener("click", () => onWishClickMauMau(btn.dataset.suit));
  });
  document.getElementById("maumau-show-hand").addEventListener("click", () => {
    AppStateMauMau.revealed = true;
    promptHumanMauMau();
  });
  document.querySelectorAll(".maumau-wish-btn").forEach((btn) => {
    I18n.setAria(btn, MAUMAU_SUIT_NAME[btn.dataset.suit]);
  });

  setMode("vs-ai");

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(MAUMAU_SAVE_KEY) : null;
  if (saved && saved.state && !saved.state.gameOver) {
    AppStateMauMau.mode = saved.mode;
    AppStateMauMau.numPlayers = saved.numPlayers;
    AppStateMauMau.aiLevel = saved.aiLevel;
    AppStateMauMau.state = saved.state;
    AppStateMauMau.lastPlayer = saved.lastPlayer === undefined ? null : saved.lastPlayer;
    AppStateMauMau.started = true;
    AppStateMauMau.gameOver = false;
    AppStateMauMau.pendingJack = null;
    AppStateMauMau.revealed = saved.mode !== "hotseat";
    setMode(saved.mode);
    showBoardMauMau();
    renderMauMau();
    continueTurnMauMau();
  }
}

function showBoardMauMau() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startNewGameMauMau(mode, numPlayers, level) {
  AppStateMauMau.mode = mode;
  AppStateMauMau.numPlayers = numPlayers;
  AppStateMauMau.aiLevel = level;
  AppStateMauMau.state = MauMauCore.createInitialState(numPlayers);
  AppStateMauMau.started = true;
  AppStateMauMau.gameOver = false;
  AppStateMauMau.pendingJack = null;
  AppStateMauMau.lastPlayer = null;
  AppStateMauMau.busy = false;
  AppStateMauMau.revealed = mode !== "hotseat";
  setGameResultMauMau("");
  showBoardMauMau();
  const top = MauMauCore.topCard(AppStateMauMau.state);
  let msg = "The first card is " + cardTextMauMau(top) + ".";
  if (mode === "hotseat") msg += " Pass the device to " + playerNameMauMau(0) + ".";
  else msg += " " + promptTextMauMau();
  setStatusMauMau(msg);
  renderMauMau();
  saveMauMauGame();
  if (isAiPlayerMauMau(AppStateMauMau.state.turn)) continueTurnMauMau();
}

function promptTextMauMau() {
  const s = AppStateMauMau.state;
  const action = MauMauCore.requiredAction(s);
  if (s.pendingDraw > 0) {
    return action === "play"
      ? "Play a Seven or draw " + s.pendingDraw + " cards from the stock."
      : "No Seven to play - draw " + s.pendingDraw + " cards from the stock.";
  }
  if (action === "keep-or-play") return "The drawn card fits: play it or keep it.";
  if (action === "draw") return "No card fits - draw a card from the stock.";
  return "Choose a card to play.";
}

function continueTurnMauMau() {
  if (AppStateMauMau.gameOver || !AppStateMauMau.started) return;
  const s = AppStateMauMau.state;
  if (isAiPlayerMauMau(s.turn)) {
    if (AppStateMauMau.busy) return;
    AppStateMauMau.busy = true;
    setTimeout(aiTurnMauMau, AiPacing.delay(700));
    return;
  }
  renderMauMau();
}

function promptHumanMauMau() {
  const s = AppStateMauMau.state;
  setStatusMauMau(playerNameMauMau(s.turn) + "'s turn. " + promptTextMauMau());
  renderMauMau();
}

function aiTurnMauMau() {
  AppStateMauMau.busy = false;
  if (AppStateMauMau.gameOver || !AppStateMauMau.started) return;
  const s = AppStateMauMau.state;
  if (!isAiPlayerMauMau(s.turn)) return;
  const action = MauMauCore.requiredAction(s);
  if (action === "play") {
    const move = MauMauAi.chooseMove(s, AppStateMauMau.aiLevel);
    playCardMauMau(move.index, move.wish, "");
  } else if (action === "keep-or-play") {
    if (MauMauAi.playDrawn(s, AppStateMauMau.aiLevel)) {
      const move = MauMauAi.chooseMove(s, AppStateMauMau.aiLevel);
      playCardMauMau(move.index, move.wish, playerNameMauMau(s.turn) + " drew a card. ");
    } else {
      keepDrawnMauMau(playerNameMauMau(s.turn) + " drew a card. ");
    }
  } else {
    drawMauMau();
  }
}

// Plays hand[index] for the player to move. `prefix` carries an earlier
// part of the same turn (a draw) into the message.
function playCardMauMau(index, wish, prefix) {
  const s = AppStateMauMau.state;
  const player = s.turn;
  const who = playerNameMauMau(player);
  const r = MauMauCore.applyMove(s, index, wish);
  AppStateMauMau.state = r.state;
  AppStateMauMau.lastPlayer = player;
  AppStateMauMau.pendingJack = null;
  const ns = r.state;
  let msg = (prefix || "") + who + " played " + cardTextMauMau(r.card) + ".";
  if (r.effect === "win") {
    renderMauMau();
    endGameMauMau(player, msg + " Mau Mau!");
    return;
  }
  if (ns.hands[player].length === 1) msg += " " + who + ": Mau!";
  if (r.effect === "seven") msg += " " + playerNameMauMau(ns.turn) + " must draw " + ns.pendingDraw + " cards or play a Seven.";
  else if (r.effect === "eight") msg += " " + playerNameMauMau((player + 1) % ns.numPlayers) + " misses a turn.";
  else if (r.effect === "jack") msg += " " + who + " asks for " + MAUMAU_SUIT_NAME[ns.wishSuit] + ".";
  else if (r.effect === "ace") msg += " " + who + " plays again.";
  afterTurnPartMauMau(player, msg);
}

function drawMauMau() {
  const s = AppStateMauMau.state;
  const player = s.turn;
  const who = playerNameMauMau(player);
  const r = MauMauCore.draw(s);
  AppStateMauMau.state = r.state;
  let msg = "";
  if (r.reshuffled) msg += "The discard pile was shuffled into a new stock. ";
  if (r.penalty) msg += who + " drew " + r.count + " cards.";
  else if (!r.count) msg += "There is no card left to draw. " + who + " passes.";
  else if (r.playable) {
    // The drawn card fits: a person decides, the computer decides now.
    if (isAiPlayerMauMau(player)) {
      AppStateMauMau.busy = true;
      setStatusMauMau(msg + who + " drew a card.");
      renderMauMau();
      setTimeout(aiTurnMauMau, AiPacing.delay(500));
      return;
    }
    setStatusMauMau(msg + who + " drew a card. " + promptTextMauMau());
    renderMauMau();
    saveMauMauGame();
    return;
  } else msg += who + " drew a card.";
  afterTurnPartMauMau(player, msg);
}

function keepDrawnMauMau(prefix) {
  const player = AppStateMauMau.state.turn;
  AppStateMauMau.state = MauMauCore.keepDrawn(AppStateMauMau.state);
  afterTurnPartMauMau(player, (prefix || "") + playerNameMauMau(player) + " keeps the card.");
}

function afterTurnPartMauMau(player, msg) {
  const s = AppStateMauMau.state;
  if (AppStateMauMau.mode === "hotseat" && s.turn !== player) {
    AppStateMauMau.revealed = false;
    msg += " Pass the device to " + playerNameMauMau(s.turn) + ".";
  } else if (!isAiPlayerMauMau(s.turn)) {
    msg += " " + promptTextMauMau();
  }
  setStatusMauMau(msg);
  renderMauMau();
  saveMauMauGame();
  if (isAiPlayerMauMau(s.turn)) continueTurnMauMau();
}

function endGameMauMau(winner, msg) {
  AppStateMauMau.gameOver = true;
  let title;
  if (AppStateMauMau.mode === "vs-ai") {
    title = winner === 0 ? "You win!" : "You lose";
    recordStatsMauMau(winner === 0 ? "win" : "loss");
  } else {
    title = playerNameMauMau(winner) + " wins";
  }
  const full = msg + " " + playerNameMauMau(winner) + " wins.";
  setGameResultMauMau(full);
  setStatusMauMau(full);
  if (window.ResultModal) window.ResultModal.show(title, full);
  clearSavedMauMauGame();
  renderMauMau();
}

function resignMauMau() {
  if (AppStateMauMau.gameOver || !AppStateMauMau.started) return;
  const s = AppStateMauMau.state;
  const loser = AppStateMauMau.mode === "vs-ai" ? 0 : s.turn;
  // Whoever holds the fewest cards among the others is left as winner.
  let winner = null;
  let fewest = Infinity;
  s.hands.forEach((h, i) => {
    if (i !== loser && h.length < fewest) { fewest = h.length; winner = i; }
  });
  s.gameOver = true;
  s.winner = winner;
  AppStateMauMau.gameOver = true;
  AppStateMauMau.pendingJack = null;
  const msg = playerNameMauMau(loser) + " resigned. " + playerNameMauMau(winner) + " wins.";
  const title = AppStateMauMau.mode === "vs-ai" ? "You lose" : playerNameMauMau(winner) + " wins";
  recordStatsMauMau("loss");
  setGameResultMauMau(msg);
  setStatusMauMau(msg);
  if (window.ResultModal) window.ResultModal.show(title, msg);
  clearSavedMauMauGame();
  renderMauMau();
}

/*** Human input ***/

function humanCanActMauMau() {
  const s = AppStateMauMau.state;
  if (!AppStateMauMau.started || AppStateMauMau.gameOver) return false;
  if (isAiPlayerMauMau(s.turn)) {
    setStatusMauMau("Computer thinking…");
    return false;
  }
  if (AppStateMauMau.mode === "hotseat" && !AppStateMauMau.revealed) return false;
  return true;
}

function onHandCardClickMauMau(index) {
  if (!humanCanActMauMau()) return;
  const s = AppStateMauMau.state;
  const legal = MauMauCore.legalMoves(s);
  if (legal.indexOf(index) === -1) {
    if (s.drawnIndex !== null) setStatusMauMau("Play the card you just drew, or keep it.");
    else if (s.pendingDraw > 0) setStatusMauMau("Play a Seven or draw " + s.pendingDraw + " cards from the stock.");
    else setStatusMauMau("That card doesn't fit.");
    return;
  }
  const card = s.hands[s.turn][index];
  if (card.rank === MauMauCore.JACK && s.hands[s.turn].length > 1) {
    AppStateMauMau.pendingJack = index;
    setStatusMauMau("Choose the suit the next card must follow.");
    renderMauMau();
    return;
  }
  playCardMauMau(index, null, "");
}

function onWishClickMauMau(suit) {
  if (!humanCanActMauMau() || AppStateMauMau.pendingJack === null) return;
  playCardMauMau(AppStateMauMau.pendingJack, suit, "");
}

function onStockClickMauMau() {
  if (!humanCanActMauMau()) return;
  const s = AppStateMauMau.state;
  const action = MauMauCore.requiredAction(s);
  if (action === "keep-or-play") {
    setStatusMauMau("Play the card you just drew, or keep it.");
    return;
  }
  if (action === "play" && s.pendingDraw === 0) {
    setStatusMauMau("You have a card that fits - no need to draw.");
    return;
  }
  AppStateMauMau.pendingJack = null;
  drawMauMau();
}

function onKeepClickMauMau() {
  if (!humanCanActMauMau()) return;
  if (AppStateMauMau.state.drawnIndex === null) return;
  keepDrawnMauMau("");
}

/*** Rendering ***/

function renderMauMau() {
  const s = AppStateMauMau.state;
  if (!s) return;
  renderPlayersMauMau(s);
  renderPilesMauMau(s);
  renderHandMauMau(s);
  const humanTurn = AppStateMauMau.started && !AppStateMauMau.gameOver && !isAiPlayerMauMau(s.turn) &&
    (AppStateMauMau.mode !== "hotseat" || AppStateMauMau.revealed);
  const keepBtn = document.getElementById("maumau-keep-button");
  if (keepBtn) keepBtn.classList.toggle("hidden", !(humanTurn && s.drawnIndex !== null));
  const picker = document.getElementById("maumau-wish-picker");
  if (picker) picker.classList.toggle("hidden", !(humanTurn && AppStateMauMau.pendingJack !== null));
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateMauMau.gameOver || !AppStateMauMau.started);
}

function renderPlayersMauMau(s) {
  const el = document.getElementById("maumau-players");
  if (!el) return;
  el.innerHTML = "";
  s.hands.forEach((hand, i) => {
    const row = document.createElement("div");
    row.className = "game-player" + (i === s.turn && !AppStateMauMau.gameOver ? " game-player-active" : "");
    const name = document.createElement("span");
    name.className = "game-player-name";
    let label = playerNameMauMau(i);
    if (AppStateMauMau.mode === "vs-ai") label += i === 0 ? " (you)" : " (computer)";
    I18n.setMsg(name, label);
    const count = document.createElement("span");
    count.className = "game-player-count";
    I18n.setMsg(count, hand.length === 1 ? "1 card" : hand.length + " cards");
    row.appendChild(name);
    row.appendChild(count);
    el.appendChild(row);
  });
}

function fillCardMauMau(el, card) {
  el.innerHTML = "";
  const rank = document.createElement("span");
  rank.className = "maumau-card-rank";
  rank.textContent = MAUMAU_RANK_LABEL[card.rank] || String(card.rank);
  const suit = document.createElement("span");
  suit.className = "maumau-card-suit";
  suit.textContent = MAUMAU_SUIT_SYMBOL[card.suit];
  el.appendChild(rank);
  el.appendChild(suit);
}

function renderPilesMauMau(s) {
  const stock = document.getElementById("maumau-stock");
  if (stock) {
    stock.innerHTML = "";
    const count = document.createElement("span");
    count.className = "maumau-stock-count";
    count.textContent = String(s.stock.length);
    stock.appendChild(count);
    stock.disabled = AppStateMauMau.gameOver;
    I18n.setAria(stock, "Stock: " + s.stock.length);
  }
  const discard = document.getElementById("maumau-discard");
  if (discard) {
    const top = MauMauCore.topCard(s);
    fillCardMauMau(discard, top);
    // Last move: who put the top card there.
    discard.classList.toggle("maumau-discard-last", AppStateMauMau.lastPlayer !== null);
    if (AppStateMauMau.lastPlayer !== null) {
      const by = document.createElement("span");
      by.className = "maumau-discard-by";
      I18n.setMsg(by, playerNameMauMau(AppStateMauMau.lastPlayer));
      discard.appendChild(by);
    }
    I18n.setAria(discard, "Discard pile " + cardTextMauMau(top));
  }
  const wish = document.getElementById("maumau-wish");
  if (wish) {
    wish.classList.toggle("hidden", !s.wishSuit && !s.pendingDraw);
    wish.innerHTML = "";
    if (s.wishSuit) {
      const label = document.createElement("span");
      I18n.setMsg(label, "Asked for:");
      const sym = document.createElement("span");
      sym.className = "maumau-wish-suit";
      sym.textContent = MAUMAU_SUIT_SYMBOL[s.wishSuit];
      wish.appendChild(label);
      wish.appendChild(sym);
      I18n.setAria(wish, "Asked for: " + MAUMAU_SUIT_NAME[s.wishSuit]);
    } else if (s.pendingDraw) {
      const label = document.createElement("span");
      I18n.setMsg(label, "Draw " + s.pendingDraw + " cards");
      wish.appendChild(label);
      wish.removeAttribute("aria-label");
    }
  }
}

function renderHandMauMau(s) {
  const handEl = document.getElementById("maumau-hand");
  const cover = document.getElementById("maumau-hand-cover");
  const coverText = document.getElementById("maumau-hand-cover-text");
  if (!handEl) return;
  const hidden = AppStateMauMau.mode === "hotseat" && !AppStateMauMau.revealed && !AppStateMauMau.gameOver;
  if (cover) cover.classList.toggle("hidden", !hidden);
  if (hidden && coverText) I18n.setMsg(coverText, "Pass the device to " + playerNameMauMau(s.turn) + ".");
  handEl.classList.toggle("hidden", hidden);
  handEl.innerHTML = "";
  if (hidden) return;
  const viewer = viewerMauMau();
  const myTurn = s.turn === viewer && !AppStateMauMau.gameOver;
  const legal = myTurn ? MauMauCore.legalMoves(s) : [];
  s.hands[viewer].forEach((card, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "maumau-card";
    if (legal.indexOf(i) === -1) btn.classList.add("maumau-card-unplayable");
    if (myTurn && s.drawnIndex === i) btn.classList.add("maumau-card-drawn");
    if (AppStateMauMau.pendingJack === i) btn.classList.add("maumau-card-drawn");
    fillCardMauMau(btn, card);
    let label = "Card " + cardTextMauMau(card);
    if (AppStateMauMau.pendingJack === i) label += ", selected";
    I18n.setAria(btn, label);
    btn.addEventListener("click", () => onHandCardClickMauMau(i));
    handEl.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", initMauMauApp);
