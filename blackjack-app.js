// blackjack-app.js
// Wires BlackjackCore ("17 and 4" / "Blackjack") to blackjack.html.
//
// You against the bank. Choose a bet (5, 10 or 20 chips), tap Deal, then
// Card or Stand (Blackjack also Double). When you stand, the bank turns
// over its face-down card and draws its cards one after another with a
// pause (AiPacing). Your points are always shown. Chips are only points
// in the game; with none left, New game starts again with 100.

const BLACKJACK_SAVE_KEY = "einkchess_save_blackjack";

const AppStateBJ = {
  state: null,
  bet: 10,
  shownBank: 0,     // bank cards shown while the bank draws
  busy: false
};

/*** Status and save ***/

function setStatusBJ(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setResultBJ(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveBJ() {
  if (typeof GameStorage === "undefined" || !AppStateBJ.state) return;
  GameStorage.save(BLACKJACK_SAVE_KEY, { state: AppStateBJ.state, bet: AppStateBJ.bet });
}

function clearSaveBJ() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(BLACKJACK_SAVE_KEY);
}

/*** Setup ***/

function initBlackjackApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-bj-game").addEventListener("click", () => startGameBJ(document.getElementById("bj-variant").value));
  document.querySelectorAll(".bj-bet").forEach((btn) => btn.addEventListener("click", () => chooseBetBJ(parseInt(btn.getAttribute("data-bet"), 10))));
  document.getElementById("bj-deal").addEventListener("click", dealBJ);
  document.getElementById("bj-hit").addEventListener("click", hitBJ);
  document.getElementById("bj-stand").addEventListener("click", standBJ);
  document.getElementById("bj-double").addEventListener("click", doubleBJ);
  document.getElementById("bj-restart").addEventListener("click", () => startGameBJ(AppStateBJ.state ? AppStateBJ.state.variant : "blackjack"));
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateBJ.state) renderBJ(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(BLACKJACK_SAVE_KEY) : null;
  if (saved && saved.state && Array.isArray(saved.state.player) && saved.state.phase !== "broke") {
    AppStateBJ.state = saved.state;
    AppStateBJ.bet = saved.bet || 10;
    AppStateBJ.shownBank = saved.state.bank.length;
    document.getElementById("bj-variant").value = saved.state.variant;
    showBoardBJ();
    promptBJ();
  }
}

function showBoardBJ() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameBJ(variant) {
  AppStateBJ.state = BlackjackCore.createGame(variant);
  AppStateBJ.shownBank = 0;
  AppStateBJ.busy = false;
  if (AppStateBJ.bet > AppStateBJ.state.chips) AppStateBJ.bet = 10;
  setResultBJ("");
  showBoardBJ();
  saveBJ();
  promptBJ();
}

/*** Turns ***/

function promptBJ(prefix) {
  const s = AppStateBJ.state;
  let text;
  if (s.phase === "broke") text = "No chips left. Tap New game to start again with 100 chips.";
  else if (s.phase === "player") text = BlackjackCore.canDouble(s) ? "Your turn: tap Card, Stand or Double." : "Your turn: tap Card or Stand.";
  else text = "Choose your bet and tap Deal.";
  setStatusBJ((prefix ? prefix + " " : "") + text);
  renderBJ();
}

function chooseBetBJ(bet) {
  const s = AppStateBJ.state;
  if (!s || AppStateBJ.busy || (s.phase !== "bet" && s.phase !== "over")) return;
  AppStateBJ.bet = bet;
  renderBJ();
}

function dealBJ() {
  const s = AppStateBJ.state;
  if (!s || AppStateBJ.busy || (s.phase !== "bet" && s.phase !== "over")) return;
  const next = BlackjackCore.startRound(s, AppStateBJ.bet);
  if (!next) return;
  AppStateBJ.state = next;
  setResultBJ("");
  if (next.phase === "player") {
    AppStateBJ.shownBank = 2;
    saveBJ();
    promptBJ();
    return;
  }
  // The round ended at once (21 with two cards, or fire) or you stood
  // with 21: the bank's cards come one after another.
  revealBankBJ("");
}

function hitBJ() {
  const s = AppStateBJ.state;
  if (!s || AppStateBJ.busy || s.phase !== "player") return;
  const next = BlackjackCore.hit(s);
  const drawn = next.player[next.player.length - 1];
  AppStateBJ.state = next;
  const pre = "You draw " + CardFaces.labelAny(drawn) + ".";
  if (next.phase === "player") { saveBJ(); promptBJ(pre); return; }
  revealBankBJ(pre);
}

function standBJ() {
  const s = AppStateBJ.state;
  if (!s || AppStateBJ.busy || s.phase !== "player") return;
  AppStateBJ.state = BlackjackCore.stand(s);
  revealBankBJ("You stand at " + BlackjackCore.handValue(s.variant, s.player).total + ".");
}

function doubleBJ() {
  const s = AppStateBJ.state;
  if (!s || AppStateBJ.busy || !BlackjackCore.canDouble(s)) return;
  const next = BlackjackCore.double(s);
  AppStateBJ.state = next;
  revealBankBJ("You double: " + next.bet + " chips on this hand. You draw " + CardFaces.labelAny(next.player[next.player.length - 1]) + ".");
}

// Shows the bank's face-down card and every card it drew, one after
// another, then the result.
function revealBankBJ(prefix) {
  const s = AppStateBJ.state;
  AppStateBJ.busy = true;
  AppStateBJ.shownBank = 2;
  setStatusBJ((prefix ? prefix + " " : "") + "The bank plays.");
  renderBJ();
  const step = () => {
    if (AppStateBJ.state !== s) return;
    if (AppStateBJ.shownBank < s.bank.length) {
      AppStateBJ.shownBank++;
      const c = s.bank[AppStateBJ.shownBank - 1];
      setStatusBJ((prefix ? prefix + " " : "") + "The bank draws " + CardFaces.labelAny(c) + ".");
      renderBJ();
      setTimeout(step, AiPacing.delay(800));
      return;
    }
    AppStateBJ.busy = false;
    finishRoundBJ(prefix);
  };
  setTimeout(step, AiPacing.delay(800));
}

function resultTextBJ(s) {
  const r = s.result;
  const p = BlackjackCore.handValue(s.variant, s.player).total, b = BlackjackCore.handValue(s.variant, s.bank).total;
  const won = r.delta, lost = -r.delta;
  switch (r.reason) {
    case "bust": return "Over 21! You lose " + lost + " chips.";
    case "bankbust": return "The bank is over 21. You win " + won + " chips.";
    case "more": return p + " against " + b + ": you win " + won + " chips.";
    case "less": return p + " against " + b + ": you lose " + lost + " chips.";
    case "tie": return r.outcome === "push" ? "Equal points (" + p + "): you keep your chips." : "Equal points (" + p + "): the bank wins. You lose " + lost + " chips.";
    case "natural": return "Blackjack! You win " + won + " chips.";
    case "banknatural": return "The bank has blackjack. You lose " + lost + " chips.";
    case "bothnatural": return "You and the bank both have blackjack: you keep your chips.";
    case "fire": return "Two aces - fire! You win " + won + " chips.";
    case "bankfire": return "The bank has two aces - fire. You lose " + lost + " chips.";
  }
  return "";
}

function finishRoundBJ(prefix) {
  const s = AppStateBJ.state;
  const text = resultTextBJ(s);
  setResultBJ(text);
  if (typeof GameStats !== "undefined") GameStats.record("blackjack", s.result.outcome === "win" ? "win" : (s.result.outcome === "loss" ? "loss" : "draw"));
  if (s.phase === "broke") {
    clearSaveBJ();
    if (window.ResultModal) window.ResultModal.show("No chips left", text + " No chips left. Tap New game to start again with 100 chips.");
  } else {
    if (AppStateBJ.bet > s.chips) AppStateBJ.bet = BlackjackCore.BETS.filter((b) => b <= s.chips).pop() || s.chips;
    saveBJ();
  }
  promptBJ((prefix ? prefix + " " : "") + text);
}

/*** Rendering ***/

function cardElBJ(card, hidden) {
  const c = document.createElement("span");
  c.setAttribute("role", "img");
  if (hidden) {
    c.className = "pc-card pc-card-back bj-card";
    I18n.setAria(c, "face-down card");
  } else {
    c.className = "pc-card bj-card";
    CardFaces.renderTall(c, card);
    I18n.setAria(c, CardFaces.labelAny(card));
  }
  return c;
}

function renderBJ() {
  const s = AppStateBJ.state;
  if (!s) return;
  const V = s.variant;
  const inRound = s.player.length > 0;
  // Bank
  const bankEl = document.getElementById("bj-bank-cards");
  bankEl.innerHTML = "";
  const shown = s.holeHidden ? 1 : Math.min(AppStateBJ.shownBank || s.bank.length, s.bank.length);
  s.bank.forEach((c, i) => {
    if (i >= Math.max(shown, s.holeHidden ? 2 : shown)) return;
    bankEl.appendChild(cardElBJ(c, i >= shown));
  });
  const bankPts = document.getElementById("bj-bank-points");
  if (!inRound) I18n.setMsg(bankPts, "");
  else if (s.holeHidden || shown < 2) I18n.setMsg(bankPts, "Points: " + BlackjackCore.handValue(V, s.bank.slice(0, 1)).total + " + ?");
  else I18n.setMsg(bankPts, "Points: " + BlackjackCore.handValue(V, s.bank.slice(0, shown)).total);
  // You
  const youEl = document.getElementById("bj-player-cards");
  youEl.innerHTML = "";
  s.player.forEach((c) => youEl.appendChild(cardElBJ(c, false)));
  I18n.setMsg(document.getElementById("bj-player-points"), inRound ? "Points: " + BlackjackCore.handValue(V, s.player).total : "");
  // Chips and bet
  I18n.setMsg(document.getElementById("bj-chips"), "Chips: " + s.chips);
  const betting = (s.phase === "bet" || s.phase === "over") && !AppStateBJ.busy;
  I18n.setMsg(document.getElementById("bj-bet-now"), inRound && !betting ? "Bet: " + s.bet : "");
  document.getElementById("bj-bet-row").classList.toggle("hidden", !betting);
  document.querySelectorAll(".bj-bet").forEach((btn) => {
    const v = parseInt(btn.getAttribute("data-bet"), 10);
    const on = v === AppStateBJ.bet;
    btn.classList.toggle("bj-bet-selected", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.disabled = v > s.chips && v !== AppStateBJ.bet;
    I18n.setAria(btn, "Bet " + v + " chips");
  });
  const playing = s.phase === "player" && !AppStateBJ.busy;
  document.getElementById("bj-actions").classList.toggle("hidden", !playing);
  const dbl = document.getElementById("bj-double");
  dbl.classList.toggle("hidden", V !== "blackjack");
  dbl.disabled = !BlackjackCore.canDouble(s);
  document.getElementById("bj-restart-row").classList.toggle("hidden", s.phase !== "broke" || AppStateBJ.busy);
}

document.addEventListener("DOMContentLoaded", initBlackjackApp);
