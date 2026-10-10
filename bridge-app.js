// bridge-app.js
// Wires BridgeCore/BridgeAi to bridge.html: you are South, your partner
// North and the opponents East and West are computers (Easy, Medium,
// Hard). Scoring Chicago (four deals, the default) or rubber.
//
// Bidding is guided: only allowed calls are buttons (bids higher than the
// last one, double and redouble only when allowed); the auction is shown
// as a table. In the play you tap a card of your hand - or of North's
// hand when you are declarer and North is dummy. When North is declarer
// the computer plays; you watch and tap "Next" after every trick. The
// dummy's cards are open after the opening lead. Computer steps wait
// AiPacing.delay(). After each deal the score is added to the list.

const BRIDGE_SAVE_KEY = "einkchess_save_bridge";

const AppStateBr = {
  level: 2,
  match: null,
  state: null,
  busy: false,
  waitNext: false,
  lastTrickShown: null,
  recorded: false
};

const BR_NAMES = ["North", "East", "You", "West"];
const BR_SEATS = ["North", "East", "South", "West"];
const BR_SIDE = ["North-South", "East-West"];
const BR_SYM = { C: "♣", D: "♦", H: "♥", S: "♠" };
const BR_RANK = { 14: "A", 13: "K", 12: "Q", 11: "J" };

function cardTextBr(c) { return (BR_RANK[c.rank] || String(c.rank)) + BR_SYM[c.suit]; }
// English text of a bid; no trump as words so it translates ("3 no trump").
function bidTextBr(b) { return b.strain === "N" ? b.level + " no trump" : b.level + BR_SYM[b.strain]; }
// Short label for buttons and the auction table: "3♠", "3NT" (NT translated).
function bidShortBr(b) { return b.level + (b.strain === "N" ? I18n.msg("NT") : BR_SYM[b.strain]); }

function setStatusBr(text) { const el = document.getElementById("board-info"); if (el) I18n.setMsg(el, text || ""); }
function setResultBr(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveBr() {
  if (typeof GameStorage === "undefined" || !AppStateBr.state) return;
  GameStorage.save(BRIDGE_SAVE_KEY, { level: AppStateBr.level, match: AppStateBr.match, state: AppStateBr.state, waitNext: AppStateBr.waitNext, recorded: AppStateBr.recorded });
}

/*** Setup ***/

function initBridgeApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-br-game").addEventListener("click", () => {
    startMatchBr(parseInt(document.getElementById("br-level").value, 10), document.getElementById("br-scoring").value);
  });
  document.getElementById("br-next-deal").addEventListener("click", nextDealBr);
  document.getElementById("br-continue").addEventListener("click", () => { AppStateBr.waitNext = false; AppStateBr.lastTrickShown = null; promptBr(""); continueBr(); });
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.addEventListener("click", resignBr);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateBr.state) renderBr(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(BRIDGE_SAVE_KEY) : null;
  if (saved && saved.state && saved.match && Array.isArray(saved.state.hands)) {
    Object.assign(AppStateBr, { level: saved.level || 2, match: saved.match, state: saved.state, waitNext: !!saved.waitNext, recorded: !!saved.recorded });
    showBoardBr();
    if (saved.state.phase === "over") showDealEndBr("");
    else { promptBr(""); continueBr(); }
  }
}

function showBoardBr() {
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startMatchBr(level, scoring) {
  AppStateBr.level = level >= 1 && level <= 3 ? level : 2;
  const dealer = typeof RandomStart !== "undefined" ? RandomStart.choose(0, [0, 1, 2, 3]) : 0;
  AppStateBr.match = BridgeCore.newMatch(scoring === "rubber" ? "rubber" : "chicago", dealer);
  AppStateBr.recorded = false;
  setResultBr("");
  showBoardBr();
  newDealBr("");
}

function newDealBr(prefix) {
  AppStateBr.state = BridgeCore.dealFor(AppStateBr.match);
  Object.assign(AppStateBr, { busy: false, waitNext: false, lastTrickShown: null });
  saveBr();
  const d = AppStateBr.state.dealer;
  promptBr((prefix ? prefix + " " : "") + (d === 2 ? "New deal: you deal." : "New deal: " + BR_NAMES[d] + " deals."));
  continueBr();
}

function nextDealBr() {
  if (!AppStateBr.state || AppStateBr.state.phase !== "over" || AppStateBr.match.over) return;
  setResultBr("");
  newDealBr("");
}

/*** Flow ***/

function humanSeatBr(s) {
  // The seat whose card the human chooses now, or -1.
  if (s.phase === "auction") return s.turn === 2 ? 2 : -1;
  if (s.phase !== "play") return -1;
  return BridgeCore.controller(s, s.turn) === 2 ? s.turn : -1;
}

function promptTextBr() {
  const s = AppStateBr.state;
  if (s.phase === "auction") return s.turn === 2 ? "Your turn to bid." : BR_NAMES[s.turn] + "'s turn.";
  if (s.phase !== "play") return "";
  if (AppStateBr.waitNext) return "North is declarer and plays both hands: tap Next to see the next trick.";
  const h = humanSeatBr(s);
  if (h === 2) return "Your turn: play a card.";
  if (h === 0) return "Your turn: play a card from North's hand (dummy).";
  return BR_NAMES[s.turn] + "'s turn.";
}

function promptBr(prefix) {
  const t = promptTextBr();
  setStatusBr([prefix, t].filter(Boolean).join(" "));
  renderBr();
}

function continueBr() {
  const s = AppStateBr.state;
  if (!s || s.phase === "over" || AppStateBr.busy || AppStateBr.waitNext) return;
  if (humanSeatBr(s) !== -1) return;
  AppStateBr.busy = true;
  setTimeout(aiStepBr, AiPacing.delay(s.phase === "auction" ? 700 : 800));
}

function aiStepBr() {
  AppStateBr.busy = false;
  const s = AppStateBr.state;
  if (!s || s.phase === "over" || humanSeatBr(s) !== -1 || AppStateBr.waitNext) return;
  if (s.phase === "auction") {
    let call = BridgeAi.chooseCall(s, AppStateBr.level);
    if (!BridgeCore.legalCall(s, call)) call = { type: "pass" };
    callBr(call);
    return;
  }
  const who = BridgeCore.controller(s, s.turn);
  // Partner (North) plays with the same level as the opponents.
  const card = BridgeAi.chooseCard(s, who === 0 || who === 2 ? Math.max(2, AppStateBr.level) : AppStateBr.level);
  playBr(card);
}

function callTextBr(seat, call) {
  const you = seat === 2, n = BR_NAMES[seat];
  if (call.type === "pass") return you ? "You pass." : n + " passes.";
  if (call.type === "double") return you ? "You double." : n + " doubles.";
  if (call.type === "redouble") return you ? "You redouble." : n + " redoubles.";
  return you ? "You bid " + bidTextBr(call) + "." : n + " bids " + bidTextBr(call) + ".";
}

function contractTextBr(s) {
  const c = s.contract;
  let t = "Contract: " + bidTextBr(c) + " by " + (s.declarer === 2 ? "you" : BR_NAMES[s.declarer]) + ".";
  if (c.doubled === 1) t += " Doubled.";
  if (c.doubled === 2) t += " Redoubled.";
  return t;
}

function callBr(call) {
  const s = AppStateBr.state;
  const seat = s.turn;
  const next = BridgeCore.applyCall(s, call);
  if (!next) return;
  AppStateBr.state = next;
  let text = callTextBr(seat, call);
  if (next.phase === "over" && next.result && next.result.passedOut) {
    text += " All four pass - the same dealer deals again.";
    const r = BridgeCore.scoreDeal(AppStateBr.match, next);
    AppStateBr.match = r.match;
    saveBr();
    newDealBr(text);
    return;
  }
  if (next.phase === "play") {
    text += " " + contractTextBr(next);
    if (next.declarer === 0) text += " North plays the contract; you watch.";
  }
  saveBr();
  promptBr(text);
  continueBr();
}

function playBr(card) {
  const s = AppStateBr.state;
  const seat = s.turn;
  const next = BridgeCore.playCard(s, card);
  if (!next) return;
  AppStateBr.state = next;
  let text = seat === 2 ? "You play " + cardTextBr(card) + "." : BR_NAMES[seat] + " plays " + cardTextBr(card) + ".";
  if (!next.trick.length && next.lastTrick) {
    const w = next.lastTrick.winner;
    text += " " + (w === 2 ? "You win the trick." : BR_NAMES[w] + " wins the trick.");
    AppStateBr.lastTrickShown = next.lastTrick;
    if (next.phase === "play" && next.declarer === 0) AppStateBr.waitNext = true;
  } else AppStateBr.lastTrickShown = null;
  if (next.phase === "over") { finishDealBr(text); return; }
  saveBr();
  promptBr(text);
  continueBr();
}

function resultTextBr(s) {
  const r = s.result, c = s.contract;
  const who = s.declarer === 2 ? "You" : BR_NAMES[s.declarer];
  const ct = bidTextBr(c);
  if (r.score.made) {
    if (s.declarer === 2) return "You make " + ct + " with " + r.tricks + " tricks.";
    return who + " makes " + ct + " with " + r.tricks + " tricks.";
  }
  if (s.declarer === 2) return "You go down in " + ct + " with " + r.tricks + " tricks.";
  return who + " goes down in " + ct + " with " + r.tricks + " tricks.";
}

function finishDealBr(prefix) {
  const s = AppStateBr.state;
  const r = BridgeCore.scoreDeal(AppStateBr.match, s);
  AppStateBr.match = r.match;
  AppStateBr.waitNext = false;
  saveBr();
  showDealEndBr(prefix);
}

function showDealEndBr(prefix) {
  const s = AppStateBr.state, m = AppStateBr.match;
  const last = m.log[m.log.length - 1];
  let msg = (prefix ? prefix + " " : "") + resultTextBr(s) + " This deal: North-South " + last.points[0] + ", East-West " + last.points[1] + ".";
  if (m.over) {
    const what = m.type === "rubber" ? "Rubber over: " : "Chicago over: ";
    let title;
    if (m.winner === 0) { msg += " " + what + "North-South win " + m.totals[0] + " to " + m.totals[1] + "."; title = "You win!"; }
    else if (m.winner === 1) { msg += " " + what + "East-West win " + m.totals[1] + " to " + m.totals[0] + "."; title = "You lose"; }
    else { msg += " " + what + "a draw at " + m.totals[0] + " points."; title = "Draw"; }
    if (!AppStateBr.recorded && typeof GameStats !== "undefined") {
      GameStats.record("bridge", m.winner === 0 ? "win" : m.winner === 1 ? "loss" : "draw");
      AppStateBr.recorded = true;
      saveBr();
    }
    setResultBr(msg);
    if (window.ResultModal && prefix !== "") window.ResultModal.show(title, msg);
  }
  setStatusBr(msg);
  renderBr();
}

function resignBr() {
  const s = AppStateBr.state;
  if (!s || AppStateBr.match.over) return;
  if (typeof GameStats !== "undefined") GameStats.record("bridge", "loss");
  if (typeof GameStorage !== "undefined") GameStorage.clear(BRIDGE_SAVE_KEY);
  AppStateBr.match = Object.assign(BridgeCore.clone(AppStateBr.match), { over: true, winner: 1 });
  AppStateBr.state = Object.assign(BridgeCore.clone(s), { phase: "resigned" });
  const msg = "You resigned.";
  setResultBr(msg);
  setStatusBr(msg);
  if (window.ResultModal) window.ResultModal.show("You lose", msg);
  renderBr();
}

/*** Human input ***/

function onCallBr(call) {
  const s = AppStateBr.state;
  if (!s || s.phase !== "auction" || s.turn !== 2 || AppStateBr.busy) return;
  if (!BridgeCore.legalCall(s, call)) return;
  callBr(call);
}

function onCardBr(seat, card) {
  const s = AppStateBr.state;
  if (!s || s.phase !== "play" || AppStateBr.busy || AppStateBr.waitNext) return;
  if (humanSeatBr(s) !== seat) return;
  const legal = BridgeCore.legalCards(s, seat);
  if (!legal.some((c) => BridgeCore.same(c, card))) {
    setStatusBr("You must follow suit: play a " + suitWordBr(s.trick[0].card.suit) + ".");
    return;
  }
  playBr(card);
}

function suitWordBr(suit) { return { C: "club", D: "diamond", H: "heart", S: "spade" }[suit]; }

/*** Rendering ***/

function spanBr(parent, text, cls) {
  const sp = document.createElement("span");
  if (cls) sp.className = cls;
  I18n.setMsg(sp, text);
  parent.appendChild(sp);
  return sp;
}

function cardElBr(card, tag, extra) {
  const el = document.createElement(tag);
  if (tag === "button") el.type = "button";
  el.className = "pc-card cn-card" + (extra ? " " + extra : "");
  CardFaces.renderTall(el, card);
  return el;
}

// A hand as rows by suit; cards are buttons when `playable`.
function handElBr(s, seat, playable) {
  const box = document.createElement("div");
  box.className = "br-hand";
  const legal = playable ? BridgeCore.legalCards(s, seat) : [];
  // After the deal all four hands are shown as they were dealt.
  const hand = s.phase === "over" && s.original ? s.original[seat] : s.hands[seat];
  ["S", "H", "D", "C"].forEach((suit) => {
    const cs = hand.filter((c) => c.suit === suit).sort((a, b) => b.rank - a.rank);
    const row = document.createElement("div");
    row.className = "br-suit-row";
    cs.forEach((c) => {
      const ok = legal.some((x) => BridgeCore.same(x, c));
      const el = cardElBr(c, playable ? "button" : "span", playable && !ok ? "pc-card-dim" : "");
      if (playable) {
        el.addEventListener("click", () => onCardBr(seat, c));
        el.setAttribute("data-card", cardTextBr(c));
        I18n.setAria(el, "Card " + cardTextBr(c) + (ok ? "" : ", not allowed now"));
      } else {
        el.setAttribute("role", "img");
        I18n.setAria(el, "Card " + cardTextBr(c));
      }
      row.appendChild(el);
    });
    if (!cs.length) { const e = document.createElement("span"); e.className = "br-void"; e.textContent = BR_SYM[suit] + " –"; row.appendChild(e); }
    box.appendChild(row);
  });
  return box;
}

function seatAreaBr(s, seat) {
  const area = document.getElementById("br-seat-" + seat);
  area.innerHTML = "";
  const head = document.createElement("div");
  head.className = "br-seat-head";
  spanBr(head, BR_SEATS[seat], "br-seat-name");
  if (seat === 0) { head.appendChild(document.createTextNode(" · ")); spanBr(head, "partner"); }
  if (seat === 2) { head.appendChild(document.createTextNode(" · ")); spanBr(head, "you"); }
  if (s.contract && s.phase !== "auction") {
    if (seat === s.declarer) { head.appendChild(document.createTextNode(" · ")); spanBr(head, "declarer", "br-role"); }
    if (seat === s.dummy) { head.appendChild(document.createTextNode(" · ")); spanBr(head, "dummy", "br-role"); }
  }
  if (s.phase === "play" && s.turn === seat) area.classList.add("br-seat-turn"); else area.classList.remove("br-seat-turn");
  area.appendChild(head);
  const dummyDown = s.phase !== "auction" && s.contract && s.played.length > 0;
  const open = seat === 2 || (dummyDown && seat === s.dummy) || s.phase === "over";
  if (open) {
    const h = humanSeatBr(s);
    area.appendChild(handElBr(s, seat, h === seat && !AppStateBr.busy && !AppStateBr.waitNext));
  } else {
    const n = s.hands[seat].length;
    spanBr(area, n === 1 ? "1 card" : n + " cards", "br-count");
  }
}

function renderBr() {
  const s = AppStateBr.state, m = AppStateBr.match;
  if (!s || !m) return;
  const over = s.phase === "over" || s.phase === "resigned";

  // Score line
  const line = document.getElementById("br-score-line");
  line.innerHTML = "";
  const parts = [];
  // After a deal the match already looks at the next one: show the
  // vulnerability of the deal just played.
  const lastEntry = m.log[m.log.length - 1];
  const vul = s.phase === "over" && lastEntry ? lastEntry.vul : BridgeCore.vulnerability(m);
  if (m.type === "chicago") parts.push("Chicago", "Deal " + Math.min(m.deal + (s.phase === "over" ? 0 : 1), 4) + " of 4");
  else parts.push("Rubber", "Games: North-South " + m.games[0] + ", East-West " + m.games[1]);
  parts.push("Dealer: " + BR_SEATS[s.dealer]);
  parts.push(vul[0] && vul[1] ? "Vulnerable: both" : vul[0] ? "Vulnerable: North-South" : vul[1] ? "Vulnerable: East-West" : "Vulnerable: nobody");
  parts.push("Score: North-South " + m.totals[0] + ", East-West " + m.totals[1]);
  parts.forEach((p, i) => { if (i) line.appendChild(document.createTextNode(" · ")); spanBr(line, p); });

  // Contract and tricks
  const cl = document.getElementById("br-contract-line");
  cl.innerHTML = "";
  if (s.contract) {
    spanBr(cl, contractTextBr(s));
    cl.appendChild(document.createTextNode(" "));
    spanBr(cl, "Tricks: North-South " + s.tricksWon[0] + ", East-West " + s.tricksWon[1] + ".");
  }

  // Hands
  [0, 1, 3, 2].forEach((seat) => seatAreaBr(s, seat));

  // Trick
  const trickEl = document.getElementById("br-trick");
  trickEl.innerHTML = "";
  const shown = s.trick.length ? null : AppStateBr.lastTrickShown;
  const cards = shown ? shown.cards : s.trick;
  trickEl.classList.toggle("hidden", s.phase !== "play" && !shown);
  [0, 1, 2, 3].forEach((p) => {
    const slot = document.createElement("div");
    const k = cards.findIndex((e) => e.seat === p);
    const win = shown && shown.winner === p;
    slot.className = "dk-slot" + (win ? " dk-slot-win" : "");
    spanBr(slot, BR_SEATS[p], "dk-slot-name");
    if (k !== -1) {
      const el = cardElBr(cards[k].card, "span", "pc-card-small");
      el.setAttribute("role", "img");
      I18n.setAria(el, BR_SEATS[p] + ", " + cardTextBr(cards[k].card));
      slot.appendChild(el);
    } else { const e = document.createElement("span"); e.className = "pc-card pc-card-small dk-slot-empty"; e.setAttribute("aria-hidden", "true"); slot.appendChild(e); }
    const mark = document.createElement("span");
    mark.className = "dk-slot-mark";
    if (win) I18n.setMsg(mark, "wins");
    slot.appendChild(mark);
    trickEl.appendChild(slot);
  });
  document.getElementById("br-continue-row").classList.toggle("hidden", !(AppStateBr.waitNext && s.phase === "play"));

  // Bidding
  const bidBox = document.getElementById("br-bidding");
  const myBid = s.phase === "auction" && s.turn === 2 && !AppStateBr.busy;
  bidBox.classList.toggle("hidden", !myBid);
  if (myBid) renderBidButtonsBr(s);
  renderAuctionBr(s);

  // Deal end and list
  document.getElementById("br-deal-end").classList.toggle("hidden", !(s.phase === "over"));
  if (s.phase === "over" || m.log.length) renderListBr();
  document.getElementById("br-next-row").classList.toggle("hidden", !(s.phase === "over" && !m.over));
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", over || m.over);
}

function renderBidButtonsBr(s) {
  const box = document.getElementById("br-bid-buttons");
  box.innerHTML = "";
  I18n.setMsg(document.getElementById("br-hcp"), "Your high-card points: " + BridgeCore.hcp(s.hands[2]));
  const top = document.createElement("div");
  top.className = "br-bid-row";
  const add = (parent, label, aria, cls, call) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.setAttribute("data-call", call.level + call.strain);
    b.textContent = label;
    I18n.setAria(b, aria);
    b.addEventListener("click", () => onCallBr(call));
    parent.appendChild(b);
  };
  const addMsg = (parent, text, cls, call) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.setAttribute("data-call", call.type);
    I18n.setMsg(b, text);
    b.addEventListener("click", () => onCallBr(call));
    parent.appendChild(b);
  };
  addMsg(top, "No bid", "secondary", { type: "pass" });
  if (BridgeCore.legalCall(s, { type: "double" })) addMsg(top, "Double (X)", "secondary", { type: "double" });
  if (BridgeCore.legalCall(s, { type: "redouble" })) addMsg(top, "Redouble (XX)", "secondary", { type: "redouble" });
  box.appendChild(top);
  for (let level = 1; level <= 7; level++) {
    const legal = BridgeCore.STRAINS.map((st) => ({ type: "bid", level, strain: st })).filter((b) => BridgeCore.legalCall(s, b));
    if (!legal.length) continue;
    const row = document.createElement("div");
    row.className = "br-bid-row";
    legal.forEach((b) => add(row, bidShortBr(b), bidTextBr(b), "secondary br-bid", b));
    box.appendChild(row);
  }
}

function renderAuctionBr(s) {
  const table = document.getElementById("br-auction");
  table.innerHTML = "";
  if (!s.auction.length && s.phase !== "auction") { table.classList.add("hidden"); return; }
  table.classList.remove("hidden");
  const head = document.createElement("tr");
  BR_SEATS.forEach((n) => { const th = document.createElement("th"); I18n.setMsg(th, n); head.appendChild(th); });
  table.appendChild(head);
  const cells = [];
  for (let i = 0; i < s.dealer; i++) cells.push(null);
  s.auction.forEach((x) => cells.push(x));
  if (s.phase === "auction") cells.push("?");
  for (let i = 0; i < cells.length; i += 4) {
    const tr = document.createElement("tr");
    for (let j = 0; j < 4; j++) {
      const td = document.createElement("td");
      const x = cells[i + j];
      if (x === "?") td.textContent = "?";
      else if (x) {
        if (x.call.type === "pass") I18n.setMsg(td, "No bid");
        else if (x.call.type === "double") td.textContent = "X";
        else if (x.call.type === "redouble") td.textContent = "XX";
        else { td.textContent = bidShortBr(x.call); I18n.setAria(td, bidTextBr(x.call)); }
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

function renderListBr() {
  const m = AppStateBr.match;
  const table = document.getElementById("br-list");
  table.innerHTML = "";
  const head = document.createElement("tr");
  ["#", "Contract", "North-South", "East-West"].forEach((h) => { const th = document.createElement("th"); I18n.setMsg(th, h); head.appendChild(th); });
  table.appendChild(head);
  let k = 0;
  m.log.forEach((e) => {
    if (e.passedOut) return;
    k++;
    const tr = document.createElement("tr");
    const c0 = document.createElement("td"); c0.textContent = String(k); tr.appendChild(c0);
    const c1 = document.createElement("td");
    const dbl = e.contract.doubled === 2 ? "XX" : e.contract.doubled === 1 ? "X" : "";
    const made = e.tricks - 6 - e.contract.level;
    c1.textContent = bidShortBr(e.contract) + dbl + " " + I18n.msg(BR_SEATS[e.declarer]).charAt(0) + " " + (made >= 0 ? (made ? "+" + made : "=") : String(made));
    I18n.setAria(c1, bidTextBr(e.contract) + ", " + BR_SEATS[e.declarer] + ", " + e.tricks + " tricks");
    tr.appendChild(c1);
    [0, 1].forEach((sd) => { const td = document.createElement("td"); td.className = "sk-num"; td.textContent = e.points[sd] ? String(e.points[sd]) : ""; tr.appendChild(td); });
    table.appendChild(tr);
  });
  const foot = document.createElement("tr");
  const f0 = document.createElement("td"); f0.textContent = "Σ"; foot.appendChild(f0);
  foot.appendChild(document.createElement("td"));
  [0, 1].forEach((sd) => { const td = document.createElement("td"); td.className = "sk-num"; td.textContent = String(m.totals[sd]); foot.appendChild(td); });
  table.appendChild(foot);
}

document.addEventListener("DOMContentLoaded", initBridgeApp);
