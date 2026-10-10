// skat-app.js
// Wires SkatCore/SkatAi to skat.html: you against two computers (Easy,
// Medium, Hard), French or German card faces.
//
// Bidding is guided: when it is your turn the allowed values are buttons,
// and the values your hand would reach in each game are listed. As the
// declarer you take the skat (then tap two cards to put away) or play
// Hand, then choose the game and, in a Hand game, the announcements.
// Tricks: tap a card; cards that may not be played are dimmed. The
// computers act one after another with a pause (AiPacing). After each
// game the value is worked out step by step and added to the score list.

const SKAT_SAVE_KEY = "einkchess_save_skat";
const SK_SUIT_ORDER = { C: 0, S: 1, H: 2, D: 3 };

const AppStateSk = {
  level: 2,
  deck: "french",
  state: null,
  dealer: 2,
  list: [],          // finished games: { declarer, game, value, delta, passedIn }
  totals: [0, 0, 0],
  busy: false,
  selected: [],      // cards chosen to put away
  annType: null,
  annOpts: { schneider: false, schwarz: false, ouvert: false },
  lastTrickShown: null
};

/*** Names and texts ***/

function nameSk(p) { return p === 0 ? "You" : "Computer " + p; }

function cardTextSk(c) {
  return AppStateSk.deck === "german" ? GermanCards.label(c) : CardFaces.labelAny(c);
}

function suitNameSk(t) {
  if (AppStateSk.deck === "german") return { C: "Acorns", S: "Leaves", H: "Hearts", D: "Bells" }[t];
  return { C: "Clubs", S: "Spades", H: "Hearts", D: "Diamonds" }[t];
}

// The game's name as one English text with its own translation key.
function gameNameSk(game) {
  const base = game.type === "grand" ? "Grand" : game.type === "null" ? "Null" : suitNameSk(game.type);
  if (game.type === "null") return base + (game.ouvert ? " Ouvert" : "") + (game.hand ? " Hand" : "");
  if (game.ouvert) return base + " Ouvert Hand";
  if (!game.hand) return base;
  if (game.schwarz) return base + " Hand, Schwarz announced";
  if (game.schneider) return base + " Hand, Schneider announced";
  return base + " Hand";
}

function roleSk(s, p) {
  const st = SkatCore.seats(s.dealer);
  return p === st.vorhand ? "Forehand" : p === st.mittelhand ? "Middlehand" : "Rearhand";
}

function setStatusSk(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setResultSk(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveSk() {
  if (typeof GameStorage === "undefined" || !AppStateSk.state) return;
  GameStorage.save(SKAT_SAVE_KEY, { level: AppStateSk.level, deck: AppStateSk.deck, state: AppStateSk.state, dealer: AppStateSk.dealer, list: AppStateSk.list, totals: AppStateSk.totals });
}

/*** Setup ***/

function initSkatApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  const deckSel = document.getElementById("sk-deck");
  deckSel.addEventListener("change", () => { AppStateSk.deck = deckSel.value; if (AppStateSk.state) { saveSk(); renderSk(); } });
  document.getElementById("start-sk-game").addEventListener("click", () => {
    startGameSk(parseInt(document.getElementById("sk-level").value, 10), deckSel.value);
  });
  document.getElementById("sk-take").addEventListener("click", () => humanSkatSk(true));
  document.getElementById("sk-hand").addEventListener("click", () => humanSkatSk(false));
  document.getElementById("sk-discard").addEventListener("click", humanDiscardSk);
  document.getElementById("sk-announce").addEventListener("click", humanAnnounceSk);
  ["schneider", "schwarz", "ouvert"].forEach((k) => {
    document.getElementById("sk-opt-" + k).addEventListener("change", (e) => {
      AppStateSk.annOpts[k] = e.target.checked;
      if (k === "schwarz" && e.target.checked) AppStateSk.annOpts.schneider = true;
      if (k === "ouvert" && e.target.checked && AppStateSk.annType !== "null") { AppStateSk.annOpts.schneider = true; AppStateSk.annOpts.schwarz = true; }
      renderSk();
    });
  });
  document.getElementById("sk-next").addEventListener("click", nextGameSk);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateSk.state) renderSk(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(SKAT_SAVE_KEY) : null;
  if (saved && saved.state && Array.isArray(saved.state.hands)) {
    Object.assign(AppStateSk, { level: saved.level || 2, deck: saved.deck || "french", state: saved.state, dealer: saved.dealer, list: saved.list || [], totals: saved.totals || [0, 0, 0] });
    deckSel.value = AppStateSk.deck;
    showBoardSk();
    promptSk();
    continueSk();
  }
}

function showBoardSk() {
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameSk(level, deck) {
  AppStateSk.level = level >= 1 && level <= 3 ? level : 2;
  AppStateSk.deck = deck === "german" ? "german" : "french";
  AppStateSk.list = [];
  AppStateSk.totals = [0, 0, 0];
  AppStateSk.dealer = Math.floor(Math.random() * 3);
  setResultSk("");
  showBoardSk();
  dealSk();
}

function dealSk() {
  AppStateSk.state = SkatCore.deal(AppStateSk.dealer);
  AppStateSk.busy = false;
  AppStateSk.selected = [];
  AppStateSk.annType = null;
  AppStateSk.annOpts = { schneider: false, schwarz: false, ouvert: false };
  AppStateSk.lastTrickShown = null;
  saveSk();
  promptSk("New game: " + nameSk(AppStateSk.dealer) + " deals.");
  continueSk();
}

function nextGameSk() {
  const s = AppStateSk.state;
  if (!s || s.phase !== "over" || AppStateSk.busy) return;
  AppStateSk.dealer = (AppStateSk.dealer + 1) % 3;
  setResultSk("");
  dealSk();
}

/*** Whose turn ***/

function actorSk(s) {
  if (s.phase === "bid") return SkatCore.bidTurn(s).player;
  if (s.phase === "skat" || s.phase === "discard" || s.phase === "announce") return s.declarer;
  if (s.phase === "play") return s.turn;
  return -1;
}

function promptSk(prefix) {
  const s = AppStateSk.state;
  const a = actorSk(s);
  let text = "";
  if (s.phase === "over") text = "";
  else if (a !== 0) text = nameSk(a) + "'s turn.";
  else if (s.phase === "bid") {
    const t = SkatCore.bidTurn(s);
    if (t.kind === "open") text = "Nobody has bid: play for 18 or pass?";
    else if (t.kind === "answer") text = nameSk(s.bidding.bidder) + " says " + s.bidding.bid + ": hold or pass?";
    else text = "Your turn to bid: say a value or pass.";
  } else if (s.phase === "skat") text = "Take the skat or play Hand?";
  else if (s.phase === "discard") text = "Choose two cards to put away.";
  else if (s.phase === "announce") text = "Choose your game.";
  else text = "Your turn: play a card.";
  setStatusSk(((prefix ? prefix + " " : "") + text).trim());
  renderSk();
}

function continueSk() {
  const s = AppStateSk.state;
  if (!s || AppStateSk.busy || s.phase === "over") return;
  const a = actorSk(s);
  if (a === 0 || a < 0) return;
  AppStateSk.busy = true;
  setTimeout(() => { AppStateSk.busy = false; if (AppStateSk.state === s) aiStepSk(); }, AiPacing.delay(s.phase === "play" ? 900 : 800));
}

function aiStepSk() {
  const s = AppStateSk.state, lv = AppStateSk.level;
  const a = actorSk(s);
  if (s.phase === "bid") {
    const ch = SkatAi.bidChoice(s, lv);
    applyBidSk(a, ch.action, ch.value);
  } else if (s.phase === "skat") {
    if (SkatAi.wantsHand(s, lv)) {
      AppStateSk.state = SkatCore.playHand(s);
      const type = SkatAi.handGameChoice(AppStateSk.state, lv);
      AppStateSk.state = SkatCore.announce(AppStateSk.state, { type });
      afterAnnounceSk(nameSk(a) + " plays Hand.");
    } else {
      let st = SkatCore.takeSkat(s);
      const ch = SkatAi.discardAndGame(st, lv);
      st = SkatCore.discard(st, ch.discard);
      AppStateSk.state = SkatCore.announce(st, { type: ch.type });
      afterAnnounceSk(nameSk(a) + " takes the skat.");
    }
  } else if (s.phase === "play") {
    playSk(SkatAi.chooseCard(s, lv));
  }
}

/*** Bidding ***/

function applyBidSk(p, action, value) {
  const s = AppStateSk.state;
  const t = SkatCore.bidTurn(s);
  const next = SkatCore.bidAction(s, action, value);
  if (!next) return;
  AppStateSk.state = next;
  const you = p === 0, who = nameSk(p);
  let text;
  if (t.kind === "open") text = action === "bid" ? (you ? "You play for 18." : who + " plays for 18.") : (you ? "You pass." : who + " passes.");
  else if (action === "bid") text = you ? "You say " + value + "." : who + " says " + value + ".";
  else if (action === "hold") text = you ? "You hold." : who + " holds.";
  else text = you ? "You pass." : who + " passes.";
  if (next.phase === "over") {
    text += " All pass - the deal is passed in.";
    AppStateSk.list.push({ passedIn: true, declarer: -1 });
    saveSk();
    setResultSk("All pass - the deal is passed in.");
    promptSk(text);
    return;
  }
  if (next.phase === "skat") text += " " + (next.declarer === 0 ? "You are the declarer for " + next.bid + "." : nameSk(next.declarer) + " is the declarer for " + next.bid + ".");
  saveSk();
  promptSk(text);
  continueSk();
}

function humanBidSk(action, value) {
  const s = AppStateSk.state;
  if (!s || AppStateSk.busy || s.phase !== "bid" || SkatCore.bidTurn(s).player !== 0) return;
  applyBidSk(0, action, value);
}

/*** Skat and announcement ***/

function humanSkatSk(take) {
  const s = AppStateSk.state;
  if (!s || AppStateSk.busy || s.phase !== "skat" || s.declarer !== 0) return;
  AppStateSk.state = take ? SkatCore.takeSkat(s) : SkatCore.playHand(s);
  AppStateSk.selected = [];
  saveSk();
  const sk = AppStateSk.state.skat;
  promptSk(take ? "You take the skat: " + cardTextSk(sk[0]) + " and " + cardTextSk(sk[1]) + "." : "You play Hand.");
}

function toggleDiscardSk(card) {
  const sel = AppStateSk.selected;
  const i = sel.findIndex((c) => SkatCore.same(c, card));
  if (i >= 0) sel.splice(i, 1);
  else if (sel.length < 2) sel.push(card);
  else { sel.shift(); sel.push(card); }
  renderSk();
}

function humanDiscardSk() {
  const s = AppStateSk.state;
  if (!s || s.phase !== "discard" || s.declarer !== 0 || AppStateSk.selected.length !== 2) return;
  const next = SkatCore.discard(s, AppStateSk.selected);
  if (!next) return;
  AppStateSk.state = next;
  const put = cardTextSk(AppStateSk.selected[0]) + " and " + cardTextSk(AppStateSk.selected[1]);
  AppStateSk.selected = [];
  saveSk();
  promptSk("You put away " + put + ".");
}

function chooseTypeSk(type) {
  AppStateSk.annType = type;
  if (type === "null") { AppStateSk.annOpts.schneider = false; AppStateSk.annOpts.schwarz = false; }
  renderSk();
}

function humanAnnounceSk() {
  const s = AppStateSk.state;
  if (!s || s.phase !== "announce" || s.declarer !== 0 || !AppStateSk.annType) return;
  const o = AppStateSk.annOpts;
  const g = { type: AppStateSk.annType, schneider: o.schneider, schwarz: o.schwarz, ouvert: o.ouvert };
  const problem = SkatCore.announceProblem(s, Object.assign({ hand: s.handGame }, g, g.ouvert && g.type !== "null" ? { schneider: true, schwarz: true } : {}));
  if (problem === "null-too-low") { setStatusSk("This Null game is worth less than your bid."); return; }
  if (problem) { setStatusSk("Schneider, Schwarz and Ouvert can only be announced in a Hand game."); return; }
  AppStateSk.state = SkatCore.announce(s, g);
  afterAnnounceSk("");
}

function afterAnnounceSk(prefix) {
  const s = AppStateSk.state;
  const g = gameNameSk(s.game);
  const text = (prefix ? prefix + " " : "") + (s.declarer === 0 ? "You announce " + g + "." : nameSk(s.declarer) + " announces " + g + ".");
  saveSk();
  promptSk(text);
  continueSk();
}

// The values each game would reach with the given cards (at least the
// matadors in the cards): for showing your own highest values.
function valuesSk(cards, hand) {
  const out = ["C", "S", "H", "D", "grand"].map((t) => ({ type: t, value: SkatCore.gameValue({ type: t, hand }, cards, {}) }));
  out.push({ type: "null", value: hand ? 35 : 23 });
  return out;
}

/*** Play ***/

function playSk(card) {
  const s = AppStateSk.state;
  const p = s.turn;
  const next = SkatCore.playCard(s, card);
  if (!next) return;
  AppStateSk.state = next;
  let text = p === 0 ? "You play " + cardTextSk(card) + "." : nameSk(p) + " plays " + cardTextSk(card) + ".";
  if (next.trick.length === 0 && next.lastTrick && (next.lastTrick !== s.lastTrick)) {
    const w = next.lastTrick.winner;
    const pts = SkatCore.pointsOf(next.lastTrick.cards.map((e) => e.card));
    text += " " + (w === 0 ? "You win the trick (" + pts + " points)." : nameSk(w) + " wins the trick (" + pts + " points).");
    AppStateSk.lastTrickShown = next.lastTrick;
  } else AppStateSk.lastTrickShown = null;
  if (next.phase === "over") { finishSk(text); return; }
  saveSk();
  promptSk(text);
  continueSk();
}

function onHandCardSk(card) {
  const s = AppStateSk.state;
  if (!s || AppStateSk.busy) return;
  if (s.phase === "discard" && s.declarer === 0) { toggleDiscardSk(card); return; }
  if (s.phase !== "play" || s.turn !== 0) return;
  if (!SkatCore.legalCards(s, 0).some((c) => SkatCore.same(c, card))) { setStatusSk("You must follow suit."); return; }
  playSk(card);
}

function resultTextSk(s) {
  const r = s.result, g = gameNameSk(s.game), d = s.declarer, you = d === 0;
  if (s.game.type === "null") {
    if (r.won) return you ? "You win " + g + "." : nameSk(d) + " wins " + g + ".";
    return you ? "You lose " + g + "." : nameSk(d) + " loses " + g + ".";
  }
  if (r.won) return you ? "You win " + g + " with " + r.eyes + " points." : nameSk(d) + " wins " + g + " with " + r.eyes + " points.";
  return you ? "You lose " + g + " with " + r.eyes + " points." : nameSk(d) + " loses " + g + " with " + r.eyes + " points.";
}

function finishSk(prefix) {
  const s = AppStateSk.state;
  const r = s.result;
  const text = resultTextSk(s);
  for (let p = 0; p < 3; p++) AppStateSk.totals[p] += r.deltas[p];
  AppStateSk.list.push({ declarer: s.declarer, game: s.game, value: r.value, delta: r.deltas[s.declarer], won: r.won });
  if (typeof GameStats !== "undefined") {
    if (s.declarer === 0) GameStats.record("skat", r.won ? "win" : "loss");
    else GameStats.record("skat", r.won ? "loss" : "win");
  }
  setResultSk(text);
  saveSk();
  promptSk((prefix ? prefix + " " : "") + text);
}

/*** Rendering ***/

function cardElSk(card, tag, extra) {
  const el = document.createElement(tag);
  if (tag === "button") el.type = "button"; else el.setAttribute("role", "img");
  el.className = "pc-card" + (extra ? " " + extra : "");
  if (AppStateSk.deck === "german") GermanCards.renderTall(el, card); else CardFaces.renderTall(el, card);
  I18n.setAria(el, cardTextSk(card));
  return el;
}

function sortedSk(cards, game) {
  const g = game || { type: "grand" };
  const nullOrder = { 14: 8, 13: 7, 12: 6, 11: 5, 10: 4, 9: 3, 8: 2, 7: 1 };
  const plain = { 14: 8, 10: 7, 13: 6, 12: 5, 9: 3, 8: 2, 7: 1, 11: 4 };
  const jack = { C: 4, S: 3, H: 2, D: 1 };
  const key = (c) => {
    if (g.type === "null") return 100 * (4 - SK_SUIT_ORDER[c.suit]) + nullOrder[c.rank];
    if (c.rank === 11) return 1000 + jack[c.suit];
    if (g.type !== "grand" && c.suit === g.type) return 900 + plain[c.rank];
    return 100 * (4 - SK_SUIT_ORDER[c.suit]) + plain[c.rank];
  };
  return cards.slice().sort((a, b) => key(b) - key(a));
}

function renderSk() {
  const s = AppStateSk.state;
  if (!s) return;
  const over = s.phase === "over";
  // Game line
  const line = document.getElementById("sk-game-line");
  line.innerHTML = "";
  const addSpan = (el, text, cls) => { const sp = document.createElement("span"); if (cls) sp.className = cls; I18n.setMsg(sp, text); el.appendChild(sp); return sp; };
  if (s.declarer < 0) addSpan(line, s.phase === "over" ? "passed in" : "Bidding");
  else {
    addSpan(line, "Declarer: " + nameSk(s.declarer) + ", bid " + s.bid);
    if (s.game) { line.appendChild(document.createTextNode(" · ")); addSpan(line, gameNameSk(s.game), "sk-game-name"); }
  }
  // Players
  const playersEl = document.getElementById("sk-players");
  playersEl.innerHTML = "";
  for (let p = 0; p < 3; p++) {
    const row = document.createElement("div");
    row.className = "game-player" + (actorSk(s) === p && !over ? " game-player-active" : "");
    const nm = document.createElement("span");
    nm.className = "game-player-name";
    I18n.setMsg(nm, nameSk(p));
    row.appendChild(nm);
    row.appendChild(document.createTextNode(": "));
    const role = document.createElement("span");
    I18n.setMsg(role, roleSk(s, p));
    row.appendChild(role);
    if (p === s.declarer) {
      row.appendChild(document.createTextNode(" "));
      const dec = document.createElement("span");
      dec.className = "dk-party";
      I18n.setMsg(dec, "declarer");
      row.appendChild(dec);
    }
    if (s.phase === "play" || over) {
      row.appendChild(document.createTextNode(" "));
      const tr = document.createElement("span");
      tr.className = "game-player-count";
      I18n.setMsg(tr, s.trickCount[p] === 1 ? "1 trick" : s.trickCount[p] + " tricks");
      row.appendChild(tr);
    }
    const tot = document.createElement("span");
    tot.className = "pc-player-extra";
    tot.textContent = "Σ " + (AppStateSk.totals[p] > 0 ? "+" : "") + AppStateSk.totals[p];
    row.appendChild(tot);
    playersEl.appendChild(row);
  }
  // Open hand of a computer declarer in an Ouvert game
  const openEl = document.getElementById("sk-open");
  openEl.innerHTML = "";
  const openShown = s.game && s.game.ouvert && s.declarer !== 0 && s.phase === "play";
  openEl.classList.toggle("hidden", !openShown);
  if (openShown) {
    const lab = document.createElement("span");
    lab.className = "pc-row-label";
    I18n.setMsg(lab, nameSk(s.declarer) + " (Ouvert)");
    openEl.appendChild(lab);
    sortedSk(s.hands[s.declarer], s.game).forEach((c) => openEl.appendChild(cardElSk(c, "span", "pc-card-small")));
  }
  // Trick (or the trick just won)
  const trickEl = document.getElementById("sk-trick");
  trickEl.innerHTML = "";
  const shown = s.trick.length ? null : AppStateSk.lastTrickShown;
  const cards = shown ? shown.cards : s.trick;
  trickEl.classList.toggle("hidden", s.phase !== "play" && !shown);
  for (let p = 0; p < 3; p++) {
    const slot = document.createElement("div");
    const k = cards.findIndex((e) => e.player === p);
    const win = shown && shown.winner === p;
    slot.className = "dk-slot" + (win ? " dk-slot-win" : "");
    const label = document.createElement("span");
    label.className = "dk-slot-name";
    I18n.setMsg(label, nameSk(p));
    slot.appendChild(label);
    if (k !== -1) slot.appendChild(cardElSk(cards[k].card, "span", "pc-card-small"));
    else { const e = document.createElement("span"); e.className = "pc-card pc-card-small dk-slot-empty"; e.setAttribute("aria-hidden", "true"); slot.appendChild(e); }
    const mark = document.createElement("span");
    mark.className = "dk-slot-mark";
    if (win) I18n.setMsg(mark, "wins");
    slot.appendChild(mark);
    trickEl.appendChild(slot);
  }
  renderPanelsSk(s);
  renderScoreSk(s);
  // Hand
  const handEl = document.getElementById("sk-hand-cards");
  handEl.innerHTML = "";
  const mine = s.hands[0];
  const myPlay = s.phase === "play" && s.turn === 0 && !AppStateSk.busy;
  const discarding = s.phase === "discard" && s.declarer === 0;
  const legal = myPlay ? SkatCore.legalCards(s, 0) : [];
  sortedSk(mine, s.game).forEach((c) => {
    const sel = AppStateSk.selected.some((x) => SkatCore.same(x, c));
    const playable = legal.some((x) => SkatCore.same(x, c));
    const btn = cardElSk(c, "button", (myPlay && !playable ? "pc-card-dim" : "") + (sel ? " pc-card-selected" : ""));
    btn.disabled = !(myPlay || discarding);
    if (sel) I18n.setAria(btn, cardTextSk(c) + ", selected");
    btn.addEventListener("click", () => onHandCardSk(c));
    handEl.appendChild(btn);
  });
  I18n.setMsg(document.getElementById("sk-hand-label"), "Your cards: " + mine.length);
  document.getElementById("sk-next-row").classList.toggle("hidden", !over);
}

function renderPanelsSk(s) {
  const mineTurn = actorSk(s) === 0 && !AppStateSk.busy;
  // Bidding
  const bidEl = document.getElementById("sk-bid");
  const bidding = s.phase === "bid" && mineTurn;
  bidEl.classList.toggle("hidden", !bidding);
  const valuesEl = document.getElementById("sk-values");
  valuesEl.innerHTML = "";
  if (s.phase === "bid") {
    const head = document.createElement("span");
    head.className = "sk-values-head";
    I18n.setMsg(head, "Your values:");
    valuesEl.appendChild(head);
    valuesSk(s.hands[0], false).forEach((v) => {
      const sp = document.createElement("span");
      sp.className = "sk-value";
      const nm = document.createElement("span");
      I18n.setMsg(nm, v.type === "grand" ? "Grand" : v.type === "null" ? "Null" : suitNameSk(v.type));
      sp.appendChild(nm);
      sp.appendChild(document.createTextNode(" " + v.value));
      valuesEl.appendChild(sp);
    });
  }
  valuesEl.classList.toggle("hidden", s.phase !== "bid");
  if (bidding) {
    const t = SkatCore.bidTurn(s);
    const btns = document.getElementById("sk-bid-buttons");
    btns.innerHTML = "";
    const add = (text, cls, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = cls; I18n.setMsg(b, text); b.addEventListener("click", fn); btns.appendChild(b); };
    if (t.kind === "bid") {
      let v = s.bidding.bid;
      for (let k = 0; k < 4; k++) { v = SkatCore.nextBid(v); if (!v) break; const val = v; add(String(val), "primary", () => humanBidSk("bid", val)); }
      add("I pass", "secondary", () => humanBidSk("pass"));
    } else if (t.kind === "answer") {
      add("Hold " + s.bidding.bid, "primary", () => humanBidSk("hold"));
      add("I pass", "secondary", () => humanBidSk("pass"));
    } else {
      add("Play for 18", "primary", () => humanBidSk("bid"));
      add("I pass", "secondary", () => humanBidSk("pass"));
    }
  }
  document.getElementById("sk-skat-panel").classList.toggle("hidden", !(s.phase === "skat" && mineTurn));
  const disc = document.getElementById("sk-discard-panel");
  disc.classList.toggle("hidden", !(s.phase === "discard" && mineTurn));
  if (s.phase === "discard") {
    const b = document.getElementById("sk-discard");
    b.disabled = AppStateSk.selected.length !== 2;
    I18n.setMsg(b, "Put away (" + AppStateSk.selected.length + " / 2)");
  }
  const ann = document.getElementById("sk-announce-panel");
  const announcing = s.phase === "announce" && mineTurn;
  ann.classList.toggle("hidden", !announcing);
  if (announcing) {
    const box = document.getElementById("sk-types");
    box.innerHTML = "";
    const cards = s.handGame ? s.hands[0] : s.declarerCards;
    const o = AppStateSk.annOpts;
    ["C", "S", "H", "D", "grand", "null"].forEach((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "secondary sk-type" + (AppStateSk.annType === t ? " bj-bet-selected" : "");
      b.setAttribute("aria-pressed", AppStateSk.annType === t ? "true" : "false");
      const g = { type: t, hand: s.handGame, schneider: t !== "null" && o.schneider, schwarz: t !== "null" && o.schwarz, ouvert: o.ouvert };
      const v = t === "null" ? SkatCore.nullValue(g) : SkatCore.gameValue(g, cards, {});
      const name = t === "grand" ? "Grand" : t === "null" ? "Null" : suitNameSk(t);
      const nm = document.createElement("span");
      I18n.setMsg(nm, name);
      b.appendChild(nm);
      b.appendChild(document.createTextNode(" " + v));
      I18n.setAria(b, name + ", value " + v);
      b.addEventListener("click", () => chooseTypeSk(t));
      box.appendChild(b);
    });
    const nul = AppStateSk.annType === "null";
    ["schneider", "schwarz"].forEach((k) => {
      const cb = document.getElementById("sk-opt-" + k);
      cb.checked = !nul && o[k];
      cb.disabled = !s.handGame || nul || (o.ouvert && !nul);
      document.getElementById("sk-opt-" + k + "-wrap").classList.toggle("hidden", nul);
    });
    const ov = document.getElementById("sk-opt-ouvert");
    ov.checked = o.ouvert;
    ov.disabled = !s.handGame && !nul;
    document.getElementById("sk-announce").disabled = !AppStateSk.annType;
    I18n.setMsg(document.getElementById("sk-bid-note"), "Bid: " + s.bid + "." + (s.handGame ? "" : " Skat put away: " + cardTextSk(s.discarded[0]) + " and " + cardTextSk(s.discarded[1]) + "."));
  }
}

function renderScoreSk(s) {
  const el = document.getElementById("sk-score");
  const over = s.phase === "over";
  el.classList.toggle("hidden", !over);
  if (!over) return;
  el.innerHTML = "";
  const r = s.result;
  const para = (t) => { const p = document.createElement("p"); I18n.setMsg(p, t); el.appendChild(p); return p; };
  if (!r.passedIn) {
    if (s.game.type === "null") para("Value of " + gameNameSk(s.game) + ": " + r.value);
    else {
      para("Declarer: " + r.eyes + " points, defenders: " + r.defenderEyes + " points.");
      // The value step by step, each part translated on its own.
      const m = r.matadors;
      const parts = [(m.with ? "with " : "without ") + m.count, "game " + (m.count + 1)];
      let lv = m.count + 1;
      if (s.game.hand) parts.push("Hand " + (++lv));
      if (r.schneider) parts.push("Schneider " + (++lv));
      if (s.game.schneider) parts.push("announced " + (++lv));
      if (r.schwarz) parts.push("Schwarz " + (++lv));
      if (s.game.schwarz) parts.push("announced " + (++lv));
      if (s.game.ouvert) parts.push("Ouvert " + (++lv));
      const p = document.createElement("p");
      parts.forEach((t, i) => {
        if (i) p.appendChild(document.createTextNode(", "));
        const sp = document.createElement("span");
        I18n.setMsg(sp, t);
        p.appendChild(sp);
      });
      p.appendChild(document.createTextNode(" × " + SkatCore.BASE[s.game.type] + " = " + (lv * SkatCore.BASE[s.game.type])));
      el.appendChild(p);
      if (r.overbid) para("Overbid: the bid was " + s.bid + ", so the game counts " + r.value + ".");
    }
    para(r.won ? "Won: plus " + r.value : "Lost: counts double, minus " + (2 * r.value));
  }
  // The list of all games so far.
  const table = document.createElement("table");
  table.className = "dk-score-table sk-list";
  const hr = document.createElement("tr");
  ["#", "Game", nameSk(0), nameSk(1), nameSk(2)].forEach((h) => { const th = document.createElement("th"); I18n.setMsg(th, h); hr.appendChild(th); });
  table.appendChild(hr);
  AppStateSk.list.forEach((e, i) => {
    const tr = document.createElement("tr");
    const c0 = document.createElement("td"); c0.textContent = String(i + 1); tr.appendChild(c0);
    const c1 = document.createElement("td");
    I18n.setMsg(c1, e.passedIn ? "passed in" : gameNameSk(e.game));
    tr.appendChild(c1);
    for (let p = 0; p < 3; p++) {
      const td = document.createElement("td");
      if (!e.passedIn && e.declarer === p) td.textContent = (e.delta > 0 ? "+" : "") + e.delta;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  });
  const foot = document.createElement("tr");
  const f0 = document.createElement("td"); f0.textContent = "Σ"; foot.appendChild(f0);
  foot.appendChild(document.createElement("td"));
  for (let p = 0; p < 3; p++) { const td = document.createElement("td"); td.textContent = String(AppStateSk.totals[p]); foot.appendChild(td); }
  table.appendChild(foot);
  const wrap = document.createElement("div");
  wrap.className = "sk-list-wrap";
  wrap.appendChild(table);
  el.appendChild(wrap);
}

document.addEventListener("DOMContentLoaded", initSkatApp);
