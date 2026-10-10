// canasta-app.js
// Wires CanastaCore/CanastaAi to canasta.html: you against the computer
// (Easy, Medium, Hard), a game to 5000 points or the short game to 2000.
//
// Layout from top to bottom: score line, the two players (cards, red
// Threes, canastas, minimum for the first meld), the computer's melds,
// the stock and the discard pile, your melds, the melds staged for your
// first meld, your hand sorted by rank. A meld shows its rank, the
// number of cards and of wild cards; a canasta has a double frame and
// says "natural" or "mixed" - never grey alone.
//
// A turn: tap the stock to draw two cards, or select the cards that go
// with the top discard and tap the pile to take it. Select cards and
// press "Lay out" for a new meld, or tap one of your melds to add them.
// Before the first meld the melds are staged until they reach the
// minimum ("Lay out first meld"); staged melds also count when you take
// the pile. Select one card and press "Discard" to end the turn.

const CANASTA_SAVE_KEY = "einkchess_save_canasta";

const AppStateCn = {
  level: 2,
  target: 5000,
  state: null,
  selected: [],
  staged: [],        // arrays of card ids (before the first meld)
  newIds: [],
  busy: false,
  recorded: false
};

const CN_JOKER_SVG = '<svg class="card-suit pc-suit" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z" fill="#fff" stroke="currentColor" stroke-width="9" stroke-linejoin="round"/><circle cx="50" cy="52" r="10" fill="currentColor"/></svg>';
const CN_RANK = { 14: "A", 13: "K", 12: "Q", 11: "J" };

function nameCn(p) { return p === 0 ? "You" : "Computer"; }
function cardTextCn(c) { return c.joker ? "Joker" : CardFaces.labelAny(c); }
function rankTextCn(r) { return CN_RANK[r] || String(r); }

function setStatusCn(text) { const el = document.getElementById("board-info"); if (el) I18n.setMsg(el, text || ""); }
function setResultCn(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveCn() {
  if (typeof GameStorage === "undefined" || !AppStateCn.state) return;
  GameStorage.save(CANASTA_SAVE_KEY, { level: AppStateCn.level, target: AppStateCn.target, state: AppStateCn.state, recorded: AppStateCn.recorded });
}

/*** Setup ***/

function initCanastaApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-cn-game").addEventListener("click", () => {
    startGameCn(parseInt(document.getElementById("cn-level").value, 10), parseInt(document.getElementById("cn-target").value, 10));
  });
  document.getElementById("cn-stock").addEventListener("click", () => humanMoveCn({ type: "draw" }));
  document.getElementById("cn-discard").addEventListener("click", onPileCn);
  document.getElementById("cn-meld-button").addEventListener("click", onMeldButtonCn);
  document.getElementById("cn-confirm-button").addEventListener("click", onConfirmCn);
  document.getElementById("cn-cancel-button").addEventListener("click", () => { AppStateCn.staged = []; AppStateCn.selected = []; promptCn(""); });
  document.getElementById("cn-discard-button").addEventListener("click", onDiscardButtonCn);
  document.getElementById("cn-next").addEventListener("click", nextHandCn);
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.addEventListener("click", resignCn);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateCn.state) renderCn(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(CANASTA_SAVE_KEY) : null;
  if (saved && saved.state && Array.isArray(saved.state.hands)) {
    Object.assign(AppStateCn, { level: saved.level || 2, target: saved.target || 5000, state: saved.state, recorded: !!saved.recorded, selected: [], staged: [] });
    showBoardCn();
    if (saved.state.phase === "over") showHandEndCn("");
    else { promptCn(""); continueCn(); }
  }
}

function showBoardCn() {
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameCn(level, target) {
  AppStateCn.level = level >= 1 && level <= 3 ? level : 2;
  AppStateCn.target = target === 2000 ? 2000 : 5000;
  const dealer = typeof RandomStart !== "undefined" ? RandomStart.choose(0, [0, 1]) : 1;
  AppStateCn.state = CanastaCore.deal({ target: AppStateCn.target, dealer });
  Object.assign(AppStateCn, { selected: [], staged: [], newIds: [], busy: false, recorded: false });
  setResultCn("");
  showBoardCn();
  saveCn();
  promptCn(dealtRedCn(AppStateCn.state));
  continueCn();
}

function nextHandCn() {
  const s = AppStateCn.state;
  if (!s || s.phase !== "over" || s.result.gameOver) return;
  AppStateCn.state = CanastaCore.nextHand(s);
  Object.assign(AppStateCn, { selected: [], staged: [], newIds: [] });
  setResultCn("");
  saveCn();
  promptCn(dealtRedCn(AppStateCn.state));
  continueCn();
}

// Red Threes laid out from the deal.
function dealtRedCn(s) {
  const parts = [];
  if (s.red3[0].length) parts.push(s.red3[0].length === 1 ? "You lay out a red three from the deal." : "You lay out " + s.red3[0].length + " red threes from the deal.");
  if (s.red3[1].length) parts.push(s.red3[1].length === 1 ? "Computer lays out a red three from the deal." : "Computer lays out " + s.red3[1].length + " red threes from the deal.");
  return parts.join(" ");
}

/*** Flow ***/

function promptTextCn() {
  const s = AppStateCn.state;
  if (s.turn !== 0) return "Computer's turn.";
  const me = s.melds[0].length > 0;
  if (s.phase === "draw") {
    if (!s.stock.length) return "The stock is empty: take the discard pile.";
    return "Your turn: draw two cards from the stock, or select cards for the top discard and take the pile.";
  }
  if (AppStateCn.staged.length) return "Staged for the first meld: " + stagedValueCn() + " of " + s.req[0] + " points.";
  if (s.hands[0].length === 1 && !CanastaCore.canGoOut(s, 0)) return "Lay out your last card on a meld to go out.";
  if (!me) return "Your turn: lay out your first meld (at least " + s.req[0] + " points) or discard a card.";
  return "Your turn: lay out melds or add to your melds, then discard a card.";
}

function promptCn(prefix) {
  setStatusCn((prefix ? prefix + " " : "") + promptTextCn());
  renderCn();
}

function continueCn() {
  const s = AppStateCn.state;
  if (!s || s.phase === "over" || s.turn !== 1 || AppStateCn.busy) return;
  AppStateCn.busy = true;
  setTimeout(aiStepCn, AiPacing.delay(s.phase === "draw" ? 800 : 900));
}

function aiStepCn() {
  AppStateCn.busy = false;
  const s = AppStateCn.state;
  if (!s || s.phase === "over" || s.turn !== 1) return;
  let move = CanastaAi.chooseMove(s, AppStateCn.level);
  let r = CanastaCore.applyMove(s, move);
  if (!r.ok) {
    // Should not happen; never leave the computer stuck.
    move = s.phase === "draw" ? { type: "draw" } : { type: "discard", id: s.hands[1][s.hands[1].length - 1].id };
    r = CanastaCore.applyMove(s, move);
    if (!r.ok) return;
  }
  afterMoveCn(s, r.state, move);
}

function describeCn(before, after, move) {
  const p = before.turn, you = p === 0;
  const ev = after.last || {};
  const parts = [];
  if (move.type === "draw") {
    const n = ev.count || 0;
    if (you) parts.push(n === 1 ? "You draw 1 card." : "You draw " + n + " cards.");
    else parts.push(n === 1 ? "Computer draws 1 card." : "Computer draws " + n + " cards.");
    (ev.red || []).forEach(() => parts.push(you ? "You lay out a red three and draw again." : "Computer lays out a red three and draws again."));
  } else if (move.type === "takePile") {
    if (ev.count === 1) parts.push(you ? "You take the discard pile (1 card)." : "Computer takes the discard pile (1 card).");
    else parts.push(you ? "You take the discard pile (" + ev.count + " cards)." : "Computer takes the discard pile (" + ev.count + " cards).");
    if (!before.melds[p].length) parts.push(you ? "Your first meld: " + firstValueCn(before, after, p) + " points." : "Computer's first meld: " + firstValueCn(before, after, p) + " points.");
  } else if (move.type === "meld") {
    if (ev.count === 1) parts.push(you ? "You lay out 1 card." : "Computer lays out 1 card.");
    else parts.push(you ? "You lay out " + ev.count + " cards." : "Computer lays out " + ev.count + " cards.");
    if (ev.first) parts.push(you ? "Your first meld: " + ev.value + " points." : "Computer's first meld: " + ev.value + " points.");
  } else if (move.type === "discard") {
    parts.push(you ? "You discard " + cardTextCn(ev.card) + "." : "Computer discards " + cardTextCn(ev.card) + ".");
  }
  return parts.join(" ");
}

// Points of the melds laid out with a first meld that took the pile.
function firstValueCn(before, after, p) {
  return after.melds[p].reduce((t, m) => t + CanastaCore.sum(m.cards), 0);
}

function afterMoveCn(before, after, move) {
  AppStateCn.state = after;
  AppStateCn.selected = [];
  if (before.turn === 0 && move.type !== "draw") AppStateCn.staged = [];
  if (move.type === "takePile" && before.turn === 0) AppStateCn.staged = [];
  AppStateCn.newIds = before.turn === 0 && move.type === "draw" ? after.drawn.slice() : [];
  const msg = describeCn(before, after, move);
  saveCn();
  if (after.phase === "over") { showHandEndCn(msg); return; }
  promptCn(msg);
  continueCn();
}

function showHandEndCn(prefix) {
  const s = AppStateCn.state;
  const res = s.result;
  const pre = prefix ? prefix + " " : "";
  let msg;
  if (res.outPlayer === 0) msg = res.concealed ? "You go out concealed." : "You go out.";
  else if (res.outPlayer === 1) msg = res.concealed ? "Computer goes out concealed." : "Computer goes out.";
  else msg = "The stock is used up - the hand ends.";
  msg = pre + msg + " This hand: you " + res.parts[0].total + ", Computer " + res.parts[1].total + ".";
  let title = null;
  if (res.gameOver) {
    if (res.winner === 0) { msg += " You win the game " + s.scores[0] + " to " + s.scores[1] + "."; title = "You win!"; }
    else if (res.winner === 1) { msg += " Computer wins the game " + s.scores[1] + " to " + s.scores[0] + "."; title = "You lose"; }
    else { msg += " The game ends in a draw at " + s.scores[0] + " points."; title = "Draw"; }
    if (!AppStateCn.recorded && typeof GameStats !== "undefined") {
      GameStats.record("canasta", res.winner === 0 ? "win" : res.winner === 1 ? "loss" : "draw");
      AppStateCn.recorded = true;
      saveCn();
    }
    setResultCn(msg);
    if (window.ResultModal && prefix !== "") window.ResultModal.show(title, msg);
  }
  setStatusCn(msg);
  renderCn();
}

function resignCn() {
  const s = AppStateCn.state;
  if (!s || s.phase === "over") return;
  if (typeof GameStats !== "undefined") GameStats.record("canasta", "loss");
  if (typeof GameStorage !== "undefined") GameStorage.clear(CANASTA_SAVE_KEY);
  const msg = "You resigned.";
  AppStateCn.state = Object.assign(CanastaCore.clone(s), { phase: "resigned" });
  setResultCn(msg);
  setStatusCn(msg);
  if (window.ResultModal) window.ResultModal.show("You lose", msg);
  renderCn();
}

/*** Human input ***/

const CN_REASON_TEXT = {
  "not-a-meld": "These cards don't form a meld: at least three cards of one rank, at least two of them natural, at most three wild cards.",
  "too-few": "A meld needs at least three cards.",
  "too-many-wild": "A meld may hold at most three wild cards.",
  "mixed-ranks": "Select cards of one rank (and wild cards).",
  "wild-needs-meld": "Wild cards alone: tap one of your melds to add them.",
  "black-three": "Black threes can only be melded when you go out.",
  "keep-card": "You can't go out yet (two canastas needed): keep at least one card to discard.",
  "frozen": "The pile is frozen: you need two natural cards of the top card's rank.",
  "frozen-first": "Before your first meld you need two natural cards of the top card's rank to take the pile.",
  "top-needs-two": "Select at least two cards to meld with the top card.",
  "top-rank": "The selected cards must have the top card's rank (or be wild).",
  "pile-black-three": "A black three on top blocks the pile.",
  "pile-wild": "A wild card on top: the pile can't be taken now.",
  "no-meld-yet": "Make your first meld before adding to melds.",
  "draw-first": "Draw first.",
  "not-now": "You have already drawn.",
  "stock-empty": "The stock is empty: take the discard pile.",
  "select": "Select cards first.",
  "no-pile": "The discard pile is empty."
};

function humanCanActCn() {
  const s = AppStateCn.state;
  if (!s || s.phase === "over" || s.phase === "resigned") return false;
  if (s.turn !== 0) { setStatusCn("Computer's turn."); return false; }
  return true;
}

function reasonTextCn(r) {
  const s = AppStateCn.state;
  if (r.reason === "below-minimum") return "Not enough for the first meld: " + r.value + " of " + s.req[0] + " points.";
  return CN_REASON_TEXT[r.reason] || "That isn't possible right now.";
}

function humanMoveCn(move) {
  if (!humanCanActCn()) return;
  const s = AppStateCn.state;
  const r = CanastaCore.applyMove(s, move);
  if (!r.ok) { setStatusCn(reasonTextCn(r)); renderCn(); return; }
  afterMoveCn(s, r.state, move);
}

function onHandCardCn(id) {
  if (!humanCanActCn()) return;
  AppStateCn.newIds = [];
  const sel = AppStateCn.selected;
  const k = sel.indexOf(id);
  if (k === -1) sel.push(id); else sel.splice(k, 1);
  renderCn();
}

function stagedIdsCn() { return [].concat.apply([], AppStateCn.staged); }

function stagedValueCn() {
  const s = AppStateCn.state;
  const ids = stagedIdsCn();
  return CanastaCore.sum(s.hands[0].filter((c) => ids.indexOf(c.id) !== -1));
}

function onMeldButtonCn() {
  if (!humanCanActCn()) return;
  const s = AppStateCn.state;
  const sel = AppStateCn.selected.slice();
  if (!sel.length) { setStatusCn("Select three or more cards for a meld."); return; }
  if (s.melds[0].length) {
    if (s.phase !== "play") { setStatusCn("Draw first."); return; }
    humanMoveCn({ type: "meld", groups: [{ ids: sel }] });
    return;
  }
  // Before the first meld: stage the meld (also in the draw phase, for
  // taking the pile).
  const cards = s.hands[0].filter((c) => sel.indexOf(c.id) !== -1);
  const rank = CanastaCore.groupRank(cards);
  if (rank === null) { setStatusCn(CN_REASON_TEXT["wild-needs-meld"]); return; }
  if (rank === -1) { setStatusCn(CN_REASON_TEXT["mixed-ranks"]); return; }
  if (cards.some(CanastaCore.isBlackThree)) { setStatusCn(CN_REASON_TEXT["black-three"]); return; }
  const stagedRanks = AppStateCn.staged.map((ids) => CanastaCore.groupRank(s.hands[0].filter((c) => ids.indexOf(c.id) !== -1)));
  const idx = stagedRanks.indexOf(rank);
  const all = idx === -1 ? cards : s.hands[0].filter((c) => AppStateCn.staged[idx].indexOf(c.id) !== -1).concat(cards);
  if (!CanastaCore.validMeld(rank, all)) {
    setStatusCn(all.length < 3 ? CN_REASON_TEXT["too-few"] : CanastaCore.wildCount(all) > 3 ? CN_REASON_TEXT["too-many-wild"] : CN_REASON_TEXT["not-a-meld"]);
    return;
  }
  if (idx === -1) AppStateCn.staged.push(sel); else AppStateCn.staged[idx] = AppStateCn.staged[idx].concat(sel);
  AppStateCn.selected = [];
  promptCn("");
}

function onConfirmCn() {
  if (!humanCanActCn()) return;
  const s = AppStateCn.state;
  if (s.phase !== "play") { setStatusCn("Draw first - or take the pile with the staged melds."); return; }
  humanMoveCn({ type: "meld", groups: AppStateCn.staged.map((ids) => ({ ids: ids.slice() })) });
}

function onOwnMeldCn(rank) {
  if (!humanCanActCn()) return;
  const s = AppStateCn.state;
  if (!AppStateCn.selected.length) { setStatusCn("Select the cards to add to this meld first."); return; }
  if (s.phase !== "play") { setStatusCn("Draw first."); return; }
  humanMoveCn({ type: "meld", groups: [{ ids: AppStateCn.selected.slice(), target: rank }] });
}

function onPileCn() {
  if (!humanCanActCn()) return;
  const s = AppStateCn.state;
  if (s.phase !== "draw") { setStatusCn(CN_REASON_TEXT["not-now"]); return; }
  const groups = [{ ids: AppStateCn.selected.slice() }];
  AppStateCn.staged.forEach((ids) => groups.push({ ids: ids.slice() }));
  humanMoveCn({ type: "takePile", groups });
}

function onDiscardButtonCn() {
  if (!humanCanActCn()) return;
  const s = AppStateCn.state;
  if (s.phase !== "play") { setStatusCn("Draw first."); return; }
  if (AppStateCn.selected.length !== 1) { setStatusCn("Select exactly one card to discard."); return; }
  if (s.hands[0].length === 1 && !CanastaCore.canGoOut(s, 0)) { setStatusCn("Lay out your last card on a meld to go out."); return; }
  if (AppStateCn.staged.length) { setStatusCn("Lay out the staged melds or take them back before discarding."); return; }
  humanMoveCn({ type: "discard", id: AppStateCn.selected[0] });
}

/*** Rendering ***/

// Hand order: by rank - Threes, Four to Ace, then Twos and jokers.
function sortKeyCn(c) {
  if (c.joker) return 200;
  if (c.rank === 2) return 150;
  if (c.rank === 3) return CanastaCore.isRedThree(c) ? 1 : 2;
  return c.rank * 10 + "CSHD".indexOf(c.suit);
}

function cardElCn(card, tag, extra) {
  const el = document.createElement(tag);
  if (tag === "button") el.type = "button";
  el.className = "pc-card cn-card" + (extra ? " " + extra : "") + (card.joker ? " romme-joker" : "") + (CanastaCore.isWild(card) ? " cn-wild" : "");
  if (card.joker) el.innerHTML = '<span class="pc-rank">&#9733;</span>' + CN_JOKER_SVG;
  else CardFaces.renderTall(el, card);
  return el;
}

// A meld as one box: rank, number of cards, wild cards, canasta.
function meldElCn(m, tappable) {
  const el = document.createElement(tappable ? "button" : "span");
  if (tappable) { el.type = "button"; el.setAttribute("data-rank", String(m.rank)); el.addEventListener("click", () => onOwnMeldCn(m.rank)); }
  else el.setAttribute("role", "img");
  const wild = CanastaCore.wildCount(m.cards);
  const canasta = CanastaCore.isCanasta(m);
  el.className = "cn-meld" + (canasta ? " cn-canasta" : "");
  const rk = document.createElement("span");
  rk.className = "cn-meld-rank";
  rk.textContent = rankTextCn(m.rank);
  el.appendChild(rk);
  const n = document.createElement("span");
  n.className = "cn-meld-count";
  n.textContent = "×" + m.cards.length + (wild ? " (★" + wild + ")" : "");
  el.appendChild(n);
  if (canasta) {
    const t = document.createElement("span");
    t.className = "cn-meld-tag";
    I18n.setMsg(t, wild ? "mixed" : "natural");
    el.appendChild(t);
  }
  let label = "Meld " + rankTextCn(m.rank) + ", " + m.cards.length + " cards";
  if (wild) label += ", " + wild + (wild === 1 ? " wild card" : " wild cards");
  if (canasta) label += ", " + (wild ? "mixed canasta" : "natural canasta");
  I18n.setAria(el, label, { segments: true });
  return el;
}

function renderMeldsCn(p, tappable) {
  const s = AppStateCn.state;
  const box = document.getElementById("cn-melds-" + p);
  box.innerHTML = "";
  if (!s.melds[p].length) {
    const e = document.createElement("span");
    e.className = "romme-empty";
    I18n.setMsg(e, "No melds yet.");
    box.appendChild(e);
    return;
  }
  s.melds[p].forEach((m) => box.appendChild(meldElCn(m, tappable)));
}

function renderCn() {
  const s = AppStateCn.state;
  if (!s) return;
  const over = s.phase === "over" || s.phase === "resigned";
  const myTurn = !over && s.turn === 0;

  I18n.setMsg(document.getElementById("cn-score-line"), "Hand " + s.hand + " · game to " + s.target + " points");

  // Players
  const pl = document.getElementById("cn-players");
  pl.innerHTML = "";
  for (let p = 0; p < 2; p++) {
    const row = document.createElement("div");
    row.className = "game-player" + (p === s.turn && !over ? " game-player-active" : "");
    const nm = document.createElement("span");
    nm.className = "game-player-name";
    I18n.setMsg(nm, nameCn(p));
    row.appendChild(nm);
    const pts = document.createElement("span");
    pts.className = "game-player-count";
    I18n.setMsg(pts, "Score: " + s.scores[p]);
    row.appendChild(pts);
    const ex = document.createElement("span");
    ex.className = "pc-player-extra";
    const bits = [s.hands[p].length === 1 ? "1 card" : s.hands[p].length + " cards"];
    bits.push("Red threes: " + s.red3[p].length);
    bits.push("Canastas: " + CanastaCore.canastaCount(s.melds[p]));
    if (!s.melds[p].length) bits.push("First meld: at least " + s.req[p] + " points");
    bits.forEach((b, i) => {
      if (i) ex.appendChild(document.createTextNode(" · "));
      const sp = document.createElement("span");
      I18n.setMsg(sp, b);
      ex.appendChild(sp);
    });
    row.appendChild(ex);
    pl.appendChild(row);
  }

  renderMeldsCn(1, false);
  renderMeldsCn(0, myTurn && s.phase === "play" && s.melds[0].length > 0);

  // Piles
  const stock = document.getElementById("cn-stock");
  stock.innerHTML = "";
  const sc = document.createElement("span");
  sc.className = "pc-count";
  sc.textContent = String(s.stock.length);
  stock.appendChild(sc);
  stock.disabled = !(myTurn && s.phase === "draw" && s.stock.length);
  I18n.setAria(stock, "Stock: " + s.stock.length + " cards, draw two");
  const pile = document.getElementById("cn-discard");
  const top = CanastaCore.topDiscard(s);
  pile.innerHTML = "";
  pile.className = "pc-card cn-pile" + (top && top.joker ? " romme-joker" : "") + (CanastaCore.pileFrozen(s) ? " cn-frozen" : "");
  pile.disabled = !(myTurn && s.phase === "draw" && top);
  if (top) {
    if (top.joker) pile.innerHTML = '<span class="pc-rank">&#9733;</span>' + CN_JOKER_SVG;
    else CardFaces.renderTall(pile, top);
  }
  const frozen = CanastaCore.pileFrozen(s);
  const info = document.getElementById("cn-pile-info");
  const countText = s.discard.length === 1 ? "1 card" : s.discard.length + " cards";
  info.innerHTML = "";
  const ci = document.createElement("span");
  I18n.setMsg(ci, countText);
  info.appendChild(ci);
  if (frozen) {
    info.appendChild(document.createTextNode(" · "));
    const fz = document.createElement("strong");
    I18n.setMsg(fz, "frozen");
    info.appendChild(fz);
  }
  I18n.setAria(pile, top ? "Discard pile: " + cardTextCn(top) + ", " + countText + (frozen ? ", frozen" : "") : "Discard pile empty");
  const red = document.getElementById("cn-red-line");
  const reds = [0, 1].map((p) => s.red3[p].map(cardTextCn).join(" ")).map((t) => t || "–");
  I18n.setMsg(red, "Red threes: you " + reds[0] + " · Computer " + reds[1]);

  // Staged melds
  const stagedRow = document.getElementById("cn-staged");
  const showStaged = myTurn && AppStateCn.staged.length > 0;
  stagedRow.classList.toggle("hidden", !showStaged);
  const stagedBox = document.getElementById("cn-staged-melds");
  stagedBox.innerHTML = "";
  if (showStaged) {
    AppStateCn.staged.forEach((ids) => {
      const cards = s.hands[0].filter((c) => ids.indexOf(c.id) !== -1);
      stagedBox.appendChild(meldElCn({ rank: CanastaCore.groupRank(cards), cards }, false));
    });
    I18n.setMsg(document.getElementById("cn-staged-label"), "Staged for the first meld: " + stagedValueCn() + " of " + s.req[0] + " points.");
  }

  // Hand
  const handEl = document.getElementById("cn-hand");
  handEl.innerHTML = "";
  const stagedIds = stagedIdsCn();
  const hand = s.hands[0].filter((c) => stagedIds.indexOf(c.id) === -1).sort((a, b) => sortKeyCn(a) - sortKeyCn(b) || a.id - b.id);
  I18n.setMsg(document.getElementById("cn-hand-label"), "Your cards: " + s.hands[0].length);
  hand.forEach((c) => {
    const sel = AppStateCn.selected.indexOf(c.id) !== -1;
    const fresh = AppStateCn.newIds.indexOf(c.id) !== -1;
    const btn = cardElCn(c, "button", (sel ? "pc-card-selected" : "") + (fresh ? " card-new" : ""));
    btn.disabled = !myTurn;
    I18n.setAria(btn, (c.joker ? "Joker" : "Card " + cardTextCn(c)) + (sel ? ", selected" : "") + (fresh ? ", new" : ""), { segments: true });
    btn.setAttribute("data-card", String(c.id));
    btn.addEventListener("click", () => onHandCardCn(c.id));
    handEl.appendChild(btn);
  });
  document.getElementById("cn-actions").classList.toggle("hidden", !myTurn);
  document.getElementById("cn-confirm-button").classList.toggle("hidden", !(AppStateCn.staged.length && s.phase === "play"));
  document.getElementById("cn-cancel-button").classList.toggle("hidden", !AppStateCn.staged.length);
  document.getElementById("cn-discard-button").classList.toggle("hidden", s.phase !== "play");

  // End of the hand
  const end = document.getElementById("cn-hand-end");
  end.classList.toggle("hidden", s.phase !== "over");
  if (s.phase === "over") renderScoreCn();
  document.getElementById("cn-next").classList.toggle("hidden", !(s.phase === "over" && !s.result.gameOver));
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", over);
}

function renderScoreCn() {
  const s = AppStateCn.state;
  const res = s.result;
  const table = document.getElementById("cn-score-table");
  table.innerHTML = "";
  const rows = [
    ["", nameCn(0), nameCn(1)],
    ["Cards in melds", res.parts[0].melded, res.parts[1].melded],
    ["Canasta bonus", res.parts[0].canastas, res.parts[1].canastas],
    ["Red threes", res.parts[0].red, res.parts[1].red],
    ["Going out", res.parts[0].out, res.parts[1].out],
    ["Cards in hand", -res.parts[0].hand, -res.parts[1].hand],
    ["This hand", res.parts[0].total, res.parts[1].total],
    ["Total", s.scores[0], s.scores[1]]
  ];
  rows.forEach((row, i) => {
    const tr = document.createElement("tr");
    row.forEach((v, j) => {
      const cell = document.createElement(i === 0 || j === 0 ? "th" : "td");
      if (typeof v === "number") { cell.textContent = String(v); cell.className = "sk-num"; }
      else I18n.setMsg(cell, v);
      tr.appendChild(cell);
    });
    if (i >= 6) tr.className = "cn-sum-row";
    table.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", initCanastaApp);
