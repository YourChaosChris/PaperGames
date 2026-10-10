// poker-app.js
// Wires PokerCore/PokerAi (Texas Hold'em) to poker.html.
//
// You against 1 to 3 computers (Easy, Medium, Hard). A game starts only
// with New game, and every further hand only with Next hand. On your turn
// the buttons show what each action costs: Fold, Check or Call, Bet or
// Raise by the fixed step. The computers act one after another with a
// pause (AiPacing). Their cards stay face down unless they reach the
// showdown; then every remaining hand is shown with its name and its best
// five cards. Chips are only points in the game.

const POKER_SAVE_KEY = "einkchess_save_poker";

const AppStatePK = {
  computers: 1,
  level: 2,
  state: null,
  busy: false,
  over: false
};

function namePK(i) {
  return i === 0 ? "You" : "Computer " + i;
}

function cardsTextPK(cards) {
  return cards.map((c) => CardFaces.labelAny(c)).join(" ");
}

/*** Status and save ***/

function setStatusPK(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setResultPK(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function savePK() {
  if (typeof GameStorage === "undefined" || !AppStatePK.state) return;
  GameStorage.save(POKER_SAVE_KEY, { computers: AppStatePK.computers, level: AppStatePK.level, state: AppStatePK.state });
}

function clearSavePK() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(POKER_SAVE_KEY);
}

/*** Setup ***/

function initPokerApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-pk-game").addEventListener("click", () => {
    startGamePK(parseInt(document.getElementById("pk-computers").value, 10), parseInt(document.getElementById("pk-level").value, 10));
  });
  document.getElementById("pk-fold").addEventListener("click", () => humanActPK("fold"));
  document.getElementById("pk-call").addEventListener("click", () => {
    const L = AppStatePK.state && PokerCore.legal(AppStatePK.state);
    if (L) humanActPK(L.check ? "check" : "call");
  });
  document.getElementById("pk-raise").addEventListener("click", () => humanActPK("raise"));
  document.getElementById("pk-next").addEventListener("click", nextHandPK);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStatePK.state) renderPK(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(POKER_SAVE_KEY) : null;
  if (saved && saved.state && Array.isArray(saved.state.players) && saved.state.phase !== "gameover" && !saved.state.players[0].out) {
    AppStatePK.computers = saved.computers;
    AppStatePK.level = saved.level || 2;
    AppStatePK.state = saved.state;
    AppStatePK.over = false;
    showBoardPK();
    promptPK();
    continuePK();
  }
}

function showBoardPK() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGamePK(computers, level) {
  AppStatePK.computers = Math.max(1, Math.min(3, computers || 1));
  AppStatePK.level = level >= 1 && level <= 3 ? level : 2;
  AppStatePK.state = PokerCore.createGame(AppStatePK.computers);
  AppStatePK.over = false;
  AppStatePK.busy = false;
  setResultPK("");
  showBoardPK();
  dealPK();
}

function dealPK() {
  const s = PokerCore.startHand(AppStatePK.state);
  if (!s) return;
  AppStatePK.state = s;
  const intro = "Hand " + s.hand + ", dealer: " + namePK(s.dealer) + ". Your cards: " + cardsTextPK(s.players[0].hole) + ".";
  afterActionPK(intro);
}

function nextHandPK() {
  const s = AppStatePK.state;
  if (!s || AppStatePK.busy || AppStatePK.over || s.phase !== "handover") return;
  setResultPK("");
  dealPK();
}

/*** Turns ***/

function promptPK(prefix) {
  const s = AppStatePK.state;
  let text = "";
  if (AppStatePK.over) text = "";
  else if (s.phase === "handover") text = "Tap Next hand to go on.";
  else if (s.phase === "betting" && s.toAct === 0) text = "Your turn: choose an action below.";
  else if (s.phase === "betting") text = namePK(s.toAct) + "'s turn.";
  setStatusPK(((prefix ? prefix + " " : "") + text).trim());
  renderPK();
}

function continuePK() {
  const s = AppStatePK.state;
  if (!s || AppStatePK.over || AppStatePK.busy || s.phase !== "betting" || s.toAct === 0) return;
  AppStatePK.busy = true;
  setTimeout(() => {
    AppStatePK.busy = false;
    const st = AppStatePK.state;
    if (st !== s || st.phase !== "betting" || st.toAct === 0) return;
    const a = PokerAi.choose(st, AppStatePK.level);
    applyPK(a);
  }, AiPacing.delay(900));
}

function humanActPK(action) {
  const s = AppStatePK.state;
  if (!s || AppStatePK.busy || AppStatePK.over || s.phase !== "betting" || s.toAct !== 0) return;
  applyPK(action);
}

// The sentence for an action, worked out before it is applied.
function actionTextPK(s, action) {
  const i = s.toAct, p = s.players[i], who = namePK(i), you = i === 0;
  const L = PokerCore.legal(s);
  const allInText = you ? " You are all in." : " " + who + " is all in.";
  if (action === "fold") return you ? "You fold." : who + " folds.";
  if (action === "check") return you ? "You check." : who + " checks.";
  if (action === "call") return (you ? "You call." : who + " calls.") + (L.callAmount >= p.chips ? allInText : "");
  const to = L.raiseTo;
  const allIn = L.raiseAmount >= p.chips ? allInText : "";
  if (L.bet) return (you ? "You bet " + to + "." : who + " bets " + to + ".") + allIn;
  return (you ? "You raise to " + to + "." : who + " raises to " + to + ".") + allIn;
}

function applyPK(action) {
  const before = AppStatePK.state;
  const street = before.street;
  const text = actionTextPK(before, action);
  const next = PokerCore.act(before, action);
  if (!next) return;
  AppStatePK.state = next;
  const parts = [text];
  if (next.street > street && next.phase === "betting") parts.push(streetTextPK(next, street));
  afterActionPK(parts.join(" "), street);
}

function streetTextPK(s, fromStreet) {
  const parts = [];
  if (fromStreet < 1 && s.board.length >= 3) parts.push("The flop: " + cardsTextPK(s.board.slice(0, 3)) + ".");
  if (fromStreet < 2 && s.board.length >= 4) parts.push("The turn: " + CardFaces.labelAny(s.board[3]) + ".");
  if (fromStreet < 3 && s.board.length >= 5) parts.push("The river: " + CardFaces.labelAny(s.board[4]) + ".");
  return parts.join(" ");
}

function afterActionPK(prefix, fromStreet) {
  const s = AppStatePK.state;
  if (s.phase !== "betting") {
    // The hand is over: board run out (if all in), pot shared.
    let text = prefix;
    if (s.result.showdown && typeof fromStreet === "number") {
      const st = streetTextPK(s, fromStreet);
      if (st && text.indexOf(st) === -1) text += " " + st;
    }
    text += " " + resultTextPK(s);
    finishHandPK(text.trim());
    return;
  }
  savePK();
  promptPK(prefix);
  continuePK();
}

function resultTextPK(s) {
  const r = s.result;
  const parts = [];
  r.won.forEach((w, i) => {
    if (!w) return;
    if (!r.showdown) parts.push(i === 0 ? "You win " + w + " chips - everyone else folded." : namePK(i) + " wins " + w + " chips - everyone else folded.");
    else {
      const h = r.hands.find((x) => x.player === i);
      parts.push(i === 0 ? "You win " + w + " chips with " + h.name + "." : namePK(i) + " wins " + w + " chips with " + h.name + ".");
    }
  });
  return parts.join(" ");
}

function finishHandPK(text) {
  const s = AppStatePK.state;
  const me = s.players[0];
  if (me.out || s.phase === "gameover") {
    AppStatePK.over = true;
    const won = !me.out;
    const end = won ? "You have all the chips - you win!" : "You have no chips left - you lose.";
    setResultPK(end);
    if (typeof GameStats !== "undefined") GameStats.record("poker", won ? "win" : "loss");
    if (window.ResultModal) window.ResultModal.show(won ? "You win!" : "You lose", end);
    clearSavePK();
    setStatusPK(text + " " + end);
    renderPK();
    return;
  }
  setResultPK(text.length > 0 ? resultTextPK(s) : "");
  savePK();
  promptPK(text);
}

/*** Rendering ***/

function cardElPK(card, hidden, small) {
  const c = document.createElement("span");
  c.setAttribute("role", "img");
  c.className = "pc-card pk-card" + (small ? " pc-card-small" : "");
  if (!card) {
    c.classList.add("pk-slot");
    I18n.setAria(c, "no card yet");
  } else if (hidden) {
    c.classList.add("pc-card-back");
    I18n.setAria(c, "face-down card");
  } else {
    CardFaces.renderTall(c, card);
    I18n.setAria(c, CardFaces.labelAny(card));
  }
  return c;
}

function statusWordsPK(s, i) {
  const p = s.players[i];
  if (p.out) return "out";
  if (p.folded) return "folded";
  if (p.allIn) return "all in";
  return "";
}

function seatPK(s, i, container) {
  const p = s.players[i];
  const r = s.result;
  const showCards = i === 0 || (s.phase !== "betting" && r && r.showdown && !p.folded && !p.out);
  const seat = document.createElement("div");
  seat.className = "pk-seat" + (s.phase === "betting" && s.toAct === i ? " pk-seat-active" : "") + (p.folded || p.out ? " pk-seat-folded" : "");
  const head = document.createElement("div");
  head.className = "pk-seat-head";
  const name = document.createElement("span");
  name.className = "pk-name";
  I18n.setMsg(name, namePK(i));
  head.appendChild(name);
  const info = [];
  if (i === s.dealer && !p.out) info.push("Dealer");
  info.push("Chips: " + p.chips);
  if (s.phase === "betting" && p.bet > 0) info.push("Bet: " + p.bet);
  const word = statusWordsPK(s, i);
  if (word) info.push(word);
  info.forEach((t) => {
    const sp = document.createElement("span");
    sp.className = "pk-info" + (t === "folded" || t === "all in" || t === "out" || t === "Dealer" ? " pk-tag" : "");
    I18n.setMsg(sp, t);
    head.appendChild(sp);
  });
  seat.appendChild(head);
  I18n.setAria(seat, [namePK(i)].concat(info).join(", "));
  if (!p.out) {
    const cards = document.createElement("div");
    cards.className = "pk-cards";
    if (p.hole.length) p.hole.forEach((c) => cards.appendChild(cardElPK(c, !showCards, i !== 0)));
    seat.appendChild(cards);
  }
  // At the showdown: the hand's name and its best five cards.
  if (r && s.phase !== "betting" && r.showdown) {
    const h = r.hands.find((x) => x.player === i);
    if (h) {
      const line = document.createElement("div");
      line.className = "pk-hand-line";
      const nm = document.createElement("span");
      nm.className = "pk-hand-name";
      I18n.setMsg(nm, h.name);
      line.appendChild(nm);
      line.appendChild(document.createTextNode(": " + cardsTextPK(h.cards)));
      if (r.won[i]) {
        const w = document.createElement("span");
        w.className = "pk-tag";
        I18n.setMsg(w, "+" + r.won[i]);
        line.appendChild(document.createTextNode(" "));
        line.appendChild(w);
      }
      seat.appendChild(line);
    }
  } else if (i === 0 && p.hole.length && !p.folded && s.phase === "betting") {
    const line = document.createElement("div");
    line.className = "pk-hand-line";
    I18n.setMsg(line, "You have: " + PokerCore.HAND_NAMES[PokerCore.categoryOf(PokerCore.evaluate(p.hole.concat(s.board)))]);
    seat.appendChild(line);
  }
  container.appendChild(seat);
}

function renderPK() {
  const s = AppStatePK.state;
  if (!s) return;
  const opp = document.getElementById("pk-opponents");
  opp.innerHTML = "";
  for (let i = 1; i < s.players.length; i++) seatPK(s, i, opp);
  const board = document.getElementById("pk-board");
  board.innerHTML = "";
  for (let k = 0; k < 5; k++) board.appendChild(cardElPK(s.board[k] || null, false, false));
  const pot = s.phase === "betting" ? PokerCore.potOf(s) : (s.result ? s.result.pot : 0);
  I18n.setMsg(document.getElementById("pk-pot"), "Pot: " + pot);
  const me = document.getElementById("pk-me");
  me.innerHTML = "";
  seatPK(s, 0, me);
  // Buttons
  const myTurn = s.phase === "betting" && s.toAct === 0 && !AppStatePK.busy && !AppStatePK.over;
  const L = myTurn ? PokerCore.legal(s) : null;
  document.getElementById("pk-actions").classList.toggle("hidden", !myTurn);
  if (L) {
    const fold = document.getElementById("pk-fold");
    fold.disabled = !L.fold;
    I18n.setMsg(document.getElementById("pk-call"), L.check ? "Check" : "Call " + L.callAmount);
    const raise = document.getElementById("pk-raise");
    raise.disabled = !L.raise;
    I18n.setMsg(raise, L.bet ? "Bet " + L.raiseTo : "Raise to " + L.raiseTo);
  }
  document.getElementById("pk-next-row").classList.toggle("hidden", !(s.phase === "handover" && !AppStatePK.over));
}

document.addEventListener("DOMContentLoaded", initPokerApp);
