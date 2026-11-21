// poch-app.js
// Wires PochCore/PochAi (the old German card game Poch) to poch.html.
//
// You against 1 to 3 computers (Easy, Medium, Hard). A hand has three
// stages: the pay-suit cards take their pools (automatic), then Pochen -
// check, call, raise or fold with a pair or better - and finally the play
// of the cards: you lead any card and the next higher cards of that suit
// follow by themselves. The log under the board names every step; the
// computers act one after another with a pause (AiPacing). A game starts
// only with New game and every further hand only with Next hand. Chips
// are only points. The cards stay hidden (no Undo, see tests/undo.js).

const POCH_SAVE_KEY = "einkchess_save_poch";

const AppStatePoch = {
  computers: 2,
  level: 2,
  state: null,
  busy: false,
  gameOver: false
};

const POCH_POOL_TEXT = {
  ace: "Ace pool", king: "King pool", queen: "Queen pool", jack: "Jack pool", ten: "Ten pool",
  marriage: "Marriage pool", sequence: "Sequence pool", poch: "Poch pool", centre: "Centre pot"
};
const POCH_COMBO_TEXT = { 2: "One pair", 3: "Three of a kind", 4: "Four of a kind" };
const POCH_LOG_SHOWN = 10;

function namePoch(i) {
  return i === 0 ? "You" : "Computer " + i;
}

// A finished English sentence, translated now (the status line is built
// again whenever the language changes).
function mPoch(text) {
  return I18n.msg(text);
}

/*** Text of the log ***/

// The English sentence for one event of the log; the translation finds it
// through the msg_* keys.
function eventTextPoch(s, ev) {
  const who = namePoch(ev.p), you = ev.p === 0;
  switch (ev.t) {
    case "hand": return "Hand " + ev.n + " of " + s.maxHands + ", dealer: " + who + ".";
    case "pool": return (you ? "You win " : who + " wins ") + ev.n + " chips: " + POCH_POOL_TEXT[ev.pool] + ".";
    case "pochstays": return "The Poch pool stays for the next hand.";
    case "check": return you ? "You check." : who + " checks.";
    case "call": return you ? "You call." : who + " calls.";
    case "fold": return you ? "You fold." : who + " folds.";
    case "bet": return you ? "You bet " + ev.n + "." : who + " bets " + ev.n + ".";
    case "raise": return you ? "You raise to " + ev.n + "." : who + " raises to " + ev.n + ".";
    case "pochwin":
      if (!ev.showdown) return you ? "You win " + ev.n + " chips - everyone else folded." : who + " wins " + ev.n + " chips - everyone else folded.";
      return (you ? "You win " : who + " wins ") + ev.n + " chips with " + POCH_COMBO_TEXT[ev.count] + ".";
    case "play": return (you ? (ev.lead ? "You lead " : "You play ") : who + (ev.lead ? " leads " : " plays ")) + CardFaces.label(ev.card) + ".";
    case "stuck": return "Nobody holds the next card.";
    case "cards": return (you ? "You win " : who + " wins ") + ev.n + " chips for the cards left in the other hands.";
    default: return "";
  }
}

function overTextPoch(s) {
  const parts = [];
  if (s.over.reason === "ante") {
    s.over.who.forEach((p) => parts.push(p === 0 ? "You cannot pay the 9 chips to start another hand." : namePoch(p) + " cannot pay the 9 chips to start another hand."));
  } else {
    parts.push("All " + s.maxHands + " hands are played.");
  }
  const best = s.chips[s.winners[0]];
  if (s.winners.length > 1) parts.push("It is a draw: the most chips, " + best + ", are shared.");
  else parts.push(s.winners[0] === 0 ? "You win with " + best + " chips." : namePoch(s.winners[0]) + " wins with " + best + " chips.");
  return parts.join(" ");
}

/*** Status, result and save ***/

function setStatusPoch(text) {
  const el = document.getElementById("board-info");
  if (el) { el.removeAttribute("data-i18n-msg"); el.textContent = text || ""; }
}

function setResultPoch(text) {
  const el = document.getElementById("game-result");
  if (el) { el.removeAttribute("data-i18n-msg"); el.textContent = text || ""; }
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function savePoch() {
  if (typeof GameStorage === "undefined" || !AppStatePoch.state) return;
  GameStorage.save(POCH_SAVE_KEY, { computers: AppStatePoch.computers, level: AppStatePoch.level, state: AppStatePoch.state });
}

function clearSavePoch() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(POCH_SAVE_KEY);
}

function humanTurnPoch() {
  const s = AppStatePoch.state;
  return !!s && !AppStatePoch.gameOver && (s.phase === "pochen" || s.phase === "lead") && s.turn === 0;
}

function statusTextPoch() {
  const s = AppStatePoch.state;
  if (!s || s.phase === "over") return "";
  if (s.phase === "handend") return mPoch("Tap Next hand to go on.");
  if (s.turn !== 0) return I18n.t("ui_status_computer_turn");
  return I18n.t("ui_status_your_turn") + " " + mPoch(s.phase === "lead" ? "Tap one of your cards to lead with it." : "Check, call, raise or fold.");
}

/*** Setup ***/

function initPochApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-poch-game").addEventListener("click", () => {
    startGamePoch(parseInt(document.getElementById("poch-computers").value, 10), parseInt(document.getElementById("poch-level").value, 10));
  });
  document.getElementById("poch-fold").addEventListener("click", () => humanMovePoch({ type: "fold" }));
  document.getElementById("poch-call").addEventListener("click", () => {
    const m = PochCore.legalMoves(AppStatePoch.state).find((x) => x.type === "check" || x.type === "call");
    if (m) humanMovePoch(m);
  });
  document.getElementById("poch-raise").addEventListener("click", () => humanMovePoch({ type: "raise" }));
  document.getElementById("poch-next").addEventListener("click", nextHandPoch);
  if (typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStatePoch.state) renderPoch(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(POCH_SAVE_KEY) : null;
  if (saved && PochCore.isCurrentState(saved.state) && saved.state.phase !== "over") {
    AppStatePoch.computers = saved.computers;
    AppStatePoch.level = saved.level || 2;
    AppStatePoch.state = saved.state;
    AppStatePoch.gameOver = false;
    showBoardPoch();
    afterPoch();
  } else if (saved) {
    clearSavePoch();
  }
}

function showBoardPoch() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGamePoch(computers, level) {
  AppStatePoch.computers = Math.max(1, Math.min(3, computers || 2));
  AppStatePoch.level = level >= 1 && level <= 3 ? level : 2;
  AppStatePoch.state = PochCore.createGame(AppStatePoch.computers + 1);
  AppStatePoch.gameOver = false;
  AppStatePoch.busy = false;
  setResultPoch("");
  showBoardPoch();
  afterPoch();
}

function nextHandPoch() {
  const s = AppStatePoch.state;
  if (!s || AppStatePoch.busy || AppStatePoch.gameOver || s.phase !== "handend") return;
  AppStatePoch.state = PochCore.nextHand(s);
  afterPoch();
}

/*** Turns ***/

function afterPoch() {
  const s = AppStatePoch.state;
  if (s.phase === "over") finishPoch();
  else savePoch();
  renderPoch();
  continuePoch();
}

function continuePoch() {
  const s = AppStatePoch.state;
  if (!s || AppStatePoch.gameOver || AppStatePoch.busy || (s.phase !== "pochen" && s.phase !== "lead") || s.turn === 0) return;
  AppStatePoch.busy = true;
  setTimeout(() => {
    AppStatePoch.busy = false;
    if (AppStatePoch.state !== s || AppStatePoch.gameOver) return;
    applyPoch(PochAi.chooseMove(s, AppStatePoch.level));
  }, AiPacing.delay(900));
}

function humanMovePoch(m) {
  if (AppStatePoch.busy || !humanTurnPoch()) return;
  applyPoch(m);
}

function applyPoch(m) {
  const next = PochCore.applyMove(AppStatePoch.state, m);
  if (!next) return;
  AppStatePoch.state = next;
  afterPoch();
}

function finishPoch() {
  const s = AppStatePoch.state;
  if (AppStatePoch.gameOver) return;
  AppStatePoch.gameOver = true;
  const outcome = PochCore.outcomeFor(s, 0);
  const text = overTextPoch(s);
  const title = outcome === "win" ? I18n.t("ui_status_you_win") : (outcome === "draw" ? I18n.t("ts_draw_title") : I18n.t("ui_status_computer_wins"));
  setResultPoch(mPoch(text));
  if (typeof GameStats !== "undefined") GameStats.record("poch", outcome);
  if (window.ResultModal) window.ResultModal.show(title, mPoch(text));
  clearSavePoch();
}

/*** Rendering ***/

const POCH_CELLS = [
  ["ace", "A"], ["king", "K"], ["queen", "Q"],
  ["jack", "J"], ["centre", null], ["ten", "10"],
  ["marriage", "K+Q"], ["sequence", "7-8-9"], ["poch", null]
];

function svgElPoch(name, attrs, text) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.keys(attrs || {}).forEach((k) => el.setAttribute(k, attrs[k]));
  if (text !== undefined) el.textContent = text;
  return el;
}

// Our own board: nine pools in a 3 x 3 square, the centre pot in the middle.
function renderBoardPoch(s) {
  const svg = document.getElementById("poch-board");
  svg.innerHTML = "";
  POCH_CELLS.forEach((cell, i) => {
    const pool = cell[0], x = (i % 3) * 100 + 5, y = Math.floor(i / 3) * 100 + 5;
    const g = svgElPoch("g", { "class": "poch-cell poch-cell-" + pool, role: "img" });
    I18n.setAria(g, POCH_POOL_TEXT[pool] + ": " + s.pools[pool] + " chips");
    g.appendChild(svgElPoch("rect", { x: x, y: y, width: 90, height: 90, rx: pool === "centre" ? 45 : 10, "class": "poch-cell-box" }));
    const label = cell[1] !== null ? cell[1] : I18n.t(pool === "poch" ? "poch_label_poch" : "poch_label_centre");
    g.appendChild(svgElPoch("text", { x: x + 45, y: y + 27, "text-anchor": "middle", "class": "poch-cell-label" }, label));
    g.appendChild(svgElPoch("text", { x: x + 45, y: y + 70, "text-anchor": "middle", "class": "poch-cell-count" }, String(s.pools[pool])));
    svg.appendChild(g);
  });
}

function cardElPoch(card, small, asButton) {
  const c = document.createElement(asButton ? "button" : "span");
  if (asButton) c.type = "button"; else c.setAttribute("role", "img");
  c.className = "pc-card" + (small ? " pc-card-small" : "");
  CardFaces.renderTall(c, card);
  I18n.setAria(c, CardFaces.label(card));
  return c;
}

function textSpanPoch(cls, text, translated) {
  const sp = document.createElement("span");
  sp.className = cls;
  if (translated) sp.textContent = text; else I18n.setMsg(sp, text);
  return sp;
}

function seatPoch(s, i) {
  const showCards = s.phase === "handend" || s.phase === "over";
  const revealed = s.revealed.indexOf(i) !== -1;
  const bet = s.bet;
  const active = (s.phase === "pochen" || s.phase === "lead") && s.turn === i;
  const folded = !!bet && bet.folded[i];
  const seat = document.createElement("div");
  seat.className = "poch-seat" + (active ? " poch-seat-active" : "") + (folded ? " poch-seat-folded" : "");
  const head = document.createElement("div");
  head.className = "poch-seat-head";
  head.appendChild(textSpanPoch("poch-name", namePoch(i)));
  const info = ["Chips: " + s.chips[i]];
  if (i !== 0) info.push("Cards: " + s.hands[i].length);
  if (i === s.dealer) info.push("Dealer");
  if (bet && bet.put[i] > 0) info.push("Bet: " + bet.put[i]);
  if (folded) info.push("folded");
  info.forEach((t) => head.appendChild(textSpanPoch("poch-info" + (t === "Dealer" || t === "folded" ? " poch-tag" : ""), t)));
  seat.appendChild(head);
  I18n.setAria(seat, [namePoch(i)].concat(info).join(", "));
  if (i !== 0 && (showCards || revealed)) {
    const row = document.createElement("div");
    row.className = "poch-seat-cards";
    const combo = s.combos[i];
    if (!showCards && combo) {
      s.hands[i].filter((c) => c.rank === combo.rank).forEach((c) => row.appendChild(cardElPoch(c, true, false)));
      row.appendChild(textSpanPoch("poch-hand-name", POCH_COMBO_TEXT[combo.count]));
    } else {
      s.hands[i].forEach((c) => row.appendChild(cardElPoch(c, true, false)));
    }
    seat.appendChild(row);
  }
  return seat;
}

function renderPoch() {
  const s = AppStatePoch.state;
  if (!s) return;
  renderBoardPoch(s);
  // The face-up pay card
  const pay = document.getElementById("poch-paycard");
  pay.innerHTML = "";
  pay.appendChild(textSpanPoch("poch-paycard-label", I18n.t("poch_paycard_label"), true));
  pay.appendChild(cardElPoch(s.payCard, true, false));
  document.getElementById("game-meta").textContent = mPoch("Hand " + s.handNo + " of " + s.maxHands);
  // Seats: the computers, then you
  const seats = document.getElementById("poch-seats");
  seats.innerHTML = "";
  for (let i = 1; i < s.n; i++) seats.appendChild(seatPoch(s, i));
  const me = document.getElementById("poch-me");
  me.innerHTML = "";
  me.appendChild(seatPoch(s, 0));
  // The log: what happened, newest last
  const log = document.getElementById("poch-log");
  log.innerHTML = "";
  s.log.slice(-POCH_LOG_SHOWN).forEach((ev) => {
    const text = eventTextPoch(s, ev);
    if (!text) return;
    const li = document.createElement("li");
    li.textContent = mPoch(text);
    log.appendChild(li);
  });
  // Your cards: tap one to lead when it is your lead
  const lead = humanTurnPoch() && s.phase === "lead" && !AppStatePoch.busy;
  const hand = document.getElementById("poch-hand");
  hand.innerHTML = "";
  s.hands[0].forEach((card, i) => {
    const btn = cardElPoch(card, false, true);
    btn.disabled = !lead;
    btn.addEventListener("click", () => humanMovePoch({ type: "lead", card: i }));
    hand.appendChild(btn);
  });
  const info = document.getElementById("poch-hand-info");
  const combo = s.combos[0];
  info.textContent = s.hands[0].length ? mPoch(combo ? "You have: " + POCH_COMBO_TEXT[combo.count] : "You have no pair, three or four of a kind.") : "";
  // Buttons
  const myBet = humanTurnPoch() && s.phase === "pochen" && !AppStatePoch.busy;
  document.getElementById("poch-actions").classList.toggle("hidden", !myBet);
  if (myBet) {
    const moves = PochCore.legalMoves(s), b = s.bet;
    const has = (t) => moves.some((m) => m.type === t);
    document.getElementById("poch-fold").disabled = !has("fold");
    const call = document.getElementById("poch-call");
    call.disabled = !has("check") && !has("call");
    I18n.setMsg(call, has("check") ? "Check" : "Call " + (b.high - b.put[0]));
    const raise = document.getElementById("poch-raise");
    raise.disabled = !has("raise");
    I18n.setMsg(raise, b.high === 0 ? "Bet 1" : "Raise to " + (b.high + 1));
  }
  document.getElementById("poch-next-row").classList.toggle("hidden", !(s.phase === "handend" && !AppStatePoch.gameOver));
  setStatusPoch(statusTextPoch());
}

document.addEventListener("DOMContentLoaded", initPochApp);

// Hint button: the move the hard computer would make for you - the bet
// action to press or the card to lead with. It looks only at your own
// cards and at what everybody can see.
document.addEventListener("DOMContentLoaded", () => {
  const BUTTON = { fold: "#poch-fold", check: "#poch-call", call: "#poch-call", raise: "#poch-raise" };
  MoveHint.init({
    button: "poch-hint", board: "board-container", app: AppStatePoch,
    canHint: () => humanTurnPoch() && !AppStatePoch.busy,
    move: () => PochAi.chooseMove(AppStatePoch.state, 3, () => 0.5),
    marks: (m) => (m.type === "lead" ? ["#poch-hand > :nth-child(" + (m.card + 1) + ")"] : [BUTTON[m.type]])
  });
});
