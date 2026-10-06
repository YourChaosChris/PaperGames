// romme-app.js
// Wires RommeCore/RommeAi to romme.html.
//
// Layout from top to bottom: the players (cards in hand, first meld made
// or not, penalty points so far), the melds on the table (each labelled
// with whoever laid it out), the stock and the discard pile, the melds
// staged for a first meld, and the own hand. The hand wraps into two
// rows of full-size cards - 13 to 15 cards never overlap, so every rank
// and suit stays completely readable (at 632 px about nine cards fit in
// a row).
//
// A turn: tap the stock or the discard pile to draw. Select cards and
// press "Lay out" for a new meld; before the first meld it is staged
// until the staged melds reach the minimum and "Lay out first meld" puts
// them on the table ("Take back" returns them). After the first meld:
// select one card and tap any meld on the table to add it there - or, if
// the card is the one a joker in that meld stands for, to swap it for
// the joker, which then has to go into a new meld at once. Select one
// card and press "Discard" to end the turn.
//
// Against the computer the human is Player 1, with one to three computer
// opponents. With two to four people on one device each hand is covered
// between turns ("Show my cards"). Computer steps wait AiPacing.delay().

const ROMME_SAVE_KEY = "einkchess_save_romme";

const AppStateRomme = {
  mode: "vs-ai",        // "vs-ai" | "hotseat"
  aiLevel: 2,
  state: null,
  started: false,
  revealed: true,
  selected: [],         // card ids
  busy: false,
  recorded: false       // statistics recorded for the current round
};

function playerNameRomme(i) { return "Player " + (i + 1); }

function isAiRomme(i) { return AppStateRomme.mode === "vs-ai" && i !== 0; }

function cardLabelRomme(c) { return c.joker ? "Joker" : CardFaces.label(c); }

function setStatusRomme(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setResultRomme(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveRomme() {
  if (typeof GameStorage === "undefined" || !AppStateRomme.state) return;
  GameStorage.save(ROMME_SAVE_KEY, {
    mode: AppStateRomme.mode, aiLevel: AppStateRomme.aiLevel, state: AppStateRomme.state, recorded: AppStateRomme.recorded
  });
}

/*** Game flow ***/

function initRommeApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeAi = document.getElementById("mode-offline-ai");
  const aiWrap = document.getElementById("romme-ai-wrap");
  const seatsWrap = document.getElementById("romme-seats-wrap");
  let pendingMode = "vs-ai";

  function setMode(mode) {
    pendingMode = mode;
    if (modeOffline) modeOffline.classList.toggle("active-mode", mode === "hotseat");
    if (modeAi) modeAi.classList.toggle("active-mode", mode === "vs-ai");
    if (aiWrap) aiWrap.classList.toggle("hidden", mode !== "vs-ai");
    if (seatsWrap) seatsWrap.classList.toggle("hidden", mode !== "hotseat");
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  if (modeOffline) modeOffline.addEventListener("click", () => setMode("hotseat"));
  if (modeAi) modeAi.addEventListener("click", () => setMode("vs-ai"));

  document.getElementById("start-romme-game").addEventListener("click", () => {
    const level = parseInt(document.getElementById("romme-level-inline").value, 10) || 2;
    const opponents = parseInt(document.getElementById("romme-opponents-inline").value, 10) || 1;
    const seats = parseInt(document.getElementById("romme-seats-inline").value, 10) || 2;
    const threshold = parseInt(document.getElementById("romme-threshold-inline").value, 10) || RommeCore.DEFAULT_THRESHOLD;
    const players = pendingMode === "vs-ai" ? opponents + 1 : seats;
    startGameRomme(pendingMode, level, players, threshold);
    const status = document.getElementById("offline-romme-status");
    if (status) {
      const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
      I18n.setMsg(status, pendingMode === "vs-ai"
        ? "You play Player 1, computer level: " + levelNames[level] + "."
        : "Game on one device for " + players + " players (no computer).");
    }
  });

  document.getElementById("romme-stock").addEventListener("click", () => humanMoveRomme({ type: "draw" }));
  document.getElementById("romme-discard").addEventListener("click", () => humanMoveRomme({ type: "takeDiscard" }));
  document.getElementById("romme-meld-button").addEventListener("click", onMeldButtonRomme);
  document.getElementById("romme-discard-button").addEventListener("click", onDiscardButtonRomme);
  document.getElementById("romme-confirm-button").addEventListener("click", () => humanMoveRomme({ type: "confirmOpen" }));
  document.getElementById("romme-cancel-button").addEventListener("click", () => humanMoveRomme({ type: "cancelPending" }));
  document.getElementById("romme-next-round").addEventListener("click", nextRoundRomme);
  document.getElementById("romme-show-hand").addEventListener("click", () => {
    AppStateRomme.revealed = true;
    promptRomme("");
  });
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.addEventListener("click", resignRomme);

  setMode("vs-ai");

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(ROMME_SAVE_KEY) : null;
  if (saved && saved.state) {
    AppStateRomme.mode = saved.mode;
    AppStateRomme.aiLevel = saved.aiLevel;
    AppStateRomme.state = saved.state;
    AppStateRomme.recorded = !!saved.recorded;
    AppStateRomme.started = true;
    AppStateRomme.revealed = saved.mode !== "hotseat";
    AppStateRomme.selected = [];
    setMode(saved.mode);
    showBoardRomme();
    if (saved.state.over) showRoundEndRomme("");
    else afterStepRomme("", false);
  }
}

function showBoardRomme() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameRomme(mode, level, players, threshold) {
  AppStateRomme.mode = mode;
  AppStateRomme.aiLevel = level;
  const dealer = typeof RandomStart !== "undefined" ? RandomStart.choose(0, Array.from({ length: players }, (_, i) => i)) : 0;
  AppStateRomme.state = RommeCore.createInitialState({ players, threshold, dealer });
  AppStateRomme.started = true;
  AppStateRomme.busy = false;
  AppStateRomme.recorded = false;
  AppStateRomme.selected = [];
  AppStateRomme.revealed = mode !== "hotseat";
  setResultRomme("");
  showBoardRomme();
  saveRomme();
  if (mode === "hotseat") {
    setStatusRomme("Pass the device to " + playerNameRomme(AppStateRomme.state.turn) + ".");
    renderRomme();
    return;
  }
  promptRomme("");
  continueRomme();
}

function nextRoundRomme() {
  const s = AppStateRomme.state;
  if (!s || !s.over) return;
  AppStateRomme.state = RommeCore.nextRound(s);
  AppStateRomme.recorded = false;
  AppStateRomme.selected = [];
  AppStateRomme.revealed = AppStateRomme.mode !== "hotseat";
  setResultRomme("");
  saveRomme();
  if (AppStateRomme.mode === "hotseat") {
    setStatusRomme("Pass the device to " + playerNameRomme(AppStateRomme.state.turn) + ".");
    renderRomme();
    return;
  }
  promptRomme("");
  continueRomme();
}

function promptTextRomme() {
  const s = AppStateRomme.state;
  const who = playerNameRomme(s.turn);
  if (s.phase === "draw") return who + ": draw a card from the stock or take the top discard.";
  if (s.pendingJoker !== null) return "Lay out the joker you took back in a new meld first.";
  if (s.pending.length) return "Staged for the first meld: " + RommeCore.pendingValue(s) + " of " + s.threshold + " points.";
  if (s.firstTurn && s.turn === s.dealer) return who + ": start the round by discarding a card (you may lay out melds first).";
  if (!s.players[s.turn].opened) return who + ": your first meld needs at least " + s.threshold + " points - lay out melds or discard a card.";
  return who + ": lay out melds or add to melds, then discard a card.";
}

function promptRomme(prefix) {
  const s = AppStateRomme.state;
  const pre = prefix ? prefix + " " : "";
  if (isAiRomme(s.turn)) setStatusRomme(pre + playerNameRomme(s.turn) + "'s turn.");
  else setStatusRomme(pre + promptTextRomme());
  renderRomme();
}

function afterStepRomme(msg, turnChanged) {
  const s = AppStateRomme.state;
  saveRomme();
  if (s.over) {
    showRoundEndRomme(msg);
    return;
  }
  if (turnChanged && AppStateRomme.mode === "hotseat") {
    AppStateRomme.revealed = false;
    setStatusRomme((msg ? msg + " " : "") + "Pass the device to " + playerNameRomme(s.turn) + ".");
    renderRomme();
    return;
  }
  promptRomme(msg);
  continueRomme();
}

function continueRomme() {
  const s = AppStateRomme.state;
  if (!s || s.over || !isAiRomme(s.turn) || AppStateRomme.busy) return;
  AppStateRomme.busy = true;
  setTimeout(aiStepRomme, AiPacing.delay(700));
}

function aiStepRomme() {
  AppStateRomme.busy = false;
  const s = AppStateRomme.state;
  if (!s || s.over || !isAiRomme(s.turn)) return;
  const move = RommeAi.chooseMove(s, AppStateRomme.aiLevel);
  const err = applyRomme(move);
  if (err) {
    // Should not happen; never leave the computer stuck.
    const hand = s.players[s.turn].hand;
    if (s.phase === "draw") applyRomme({ type: "draw" });
    else if (s.pending.length) applyRomme({ type: "cancelPending" });
    else applyRomme({ type: "discard", id: hand[hand.length - 1].id });
  }
}

function describeRomme(before, after, move) {
  const who = playerNameRomme(before.turn);
  const ev = after.lastEvent || {};
  if (move.type === "draw") return (ev.type === "reshuffle" ? "The discard pile is shuffled into a new stock. " : "") + who + " draws a card.";
  if (move.type === "takeDiscard") return who + " takes the " + cardLabelRomme(ev.card) + ".";
  if (move.type === "meld") return after.players[before.turn].opened && before.players[before.turn].opened ? who + " lays out a meld." : "";
  if (move.type === "confirmOpen") return who + " makes the first meld with " + ev.points + " points.";
  if (move.type === "extend") return who + " adds the " + cardLabelRomme(ev.card) + " to a meld.";
  if (move.type === "swapJoker") return who + " swaps the " + cardLabelRomme(ev.card) + " for a joker.";
  if (move.type === "discard") return who + " discards the " + cardLabelRomme(ev.card) + ".";
  return "";
}

function applyRomme(move) {
  const before = AppStateRomme.state;
  const r = RommeCore.applyMove(before, move);
  if (!r.ok) return r.reason;
  AppStateRomme.state = r.state;
  AppStateRomme.selected = [];
  afterStepRomme(describeRomme(before, r.state, move), r.state.turn !== before.turn);
  return null;
}

function showRoundEndRomme(prefix) {
  const s = AppStateRomme.state;
  const pre = prefix ? prefix + " " : "";
  let msg, title;
  if (s.winner === null) {
    msg = pre + "Nothing is left to draw - the round ends without a winner.";
    title = "Draw";
  } else {
    msg = pre + playerNameRomme(s.winner) + " has no cards left and wins the round.";
    title = AppStateRomme.mode === "vs-ai" ? (s.winner === 0 ? "You win!" : "You lose") : playerNameRomme(s.winner) + " wins";
  }
  if (AppStateRomme.mode === "vs-ai" && !AppStateRomme.recorded && typeof GameStats !== "undefined") {
    GameStats.record("romme", s.winner === null ? "draw" : s.winner === 0 ? "win" : "loss");
    AppStateRomme.recorded = true;
    saveRomme();
  }
  setResultRomme(msg);
  setStatusRomme(msg);
  if (window.ResultModal && prefix !== "") window.ResultModal.show(title, msg);
  renderRomme();
}

function resignRomme() {
  const s = AppStateRomme.state;
  if (!AppStateRomme.started || !s || s.over) return;
  const loser = AppStateRomme.mode === "vs-ai" ? 0 : s.turn;
  const msg = playerNameRomme(loser) + " resigned.";
  if (AppStateRomme.mode === "vs-ai" && typeof GameStats !== "undefined") GameStats.record("romme", "loss");
  AppStateRomme.started = false;
  if (typeof GameStorage !== "undefined") GameStorage.clear(ROMME_SAVE_KEY);
  setResultRomme(msg);
  setStatusRomme(msg);
  if (window.ResultModal) window.ResultModal.show(AppStateRomme.mode === "vs-ai" ? "You lose" : msg, msg);
  renderRomme();
}

/*** Human input ***/

function humanCanActRomme() {
  const s = AppStateRomme.state;
  if (!AppStateRomme.started || !s || s.over) return false;
  if (isAiRomme(s.turn)) { setStatusRomme("Computer thinking…"); return false; }
  if (AppStateRomme.mode === "hotseat" && !AppStateRomme.revealed) return false;
  return true;
}

const ROMME_REASON_TEXT = {
  "not-a-meld": "These cards don't form a set (one rank, different suits) or a run (one suit in order).",
  "open-first": "You may add to melds only after your first meld.",
  "doesnt-fit": "That card doesn't fit this meld.",
  "no-joker-for-card": "That card doesn't fit this meld.",
  "joker-unusable": "You can only swap that joker if you can lay it out again in a new meld right away.",
  "joker-first": "Lay out the joker you took back in a new meld first.",
  "staged-open": "Lay out the staged melds or take them back before discarding.",
  "draw-first": "Draw a card first.",
  "not-now": "You have already drawn a card this turn.",
  "no-discard": "The discard pile is empty."
};

function humanMoveRomme(move) {
  if (!humanCanActRomme()) return;
  const s = AppStateRomme.state;
  const reason = applyRomme(move);
  if (!reason) return;
  if (reason === "below-threshold") setStatusRomme("Not enough yet: the first meld needs at least " + s.threshold + " points.");
  else setStatusRomme(ROMME_REASON_TEXT[reason] || "That isn't possible right now.");
}

function onHandCardRomme(id) {
  if (!humanCanActRomme()) return;
  const sel = AppStateRomme.selected;
  const k = sel.indexOf(id);
  if (k === -1) sel.push(id); else sel.splice(k, 1);
  renderRomme();
}

function onMeldButtonRomme() {
  if (!humanCanActRomme()) return;
  if (AppStateRomme.selected.length < 3) { setStatusRomme("Select three or more cards for a meld."); return; }
  humanMoveRomme({ type: "meld", ids: AppStateRomme.selected.slice() });
}

function onTableMeldRomme(index) {
  if (!humanCanActRomme()) return;
  const s = AppStateRomme.state;
  if (AppStateRomme.selected.length !== 1) { setStatusRomme("Select exactly one card."); return; }
  const id = AppStateRomme.selected[0];
  const card = s.players[s.turn].hand.find((c) => c.id === id);
  const meld = s.melds[index];
  if (card && meld && RommeCore.jokerSlotFor(meld, card) !== -1) humanMoveRomme({ type: "swapJoker", meld: index, id });
  else humanMoveRomme({ type: "extend", meld: index, id });
}

function onDiscardButtonRomme() {
  if (!humanCanActRomme()) return;
  if (AppStateRomme.selected.length !== 1) { setStatusRomme("Select exactly one card."); return; }
  humanMoveRomme({ type: "discard", id: AppStateRomme.selected[0] });
}

/*** Rendering ***/

const ROMME_JOKER_SVG = '<svg class="card-suit pc-suit" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z" fill="#fff" stroke="currentColor" stroke-width="9" stroke-linejoin="round"/><circle cx="50" cy="52" r="10" fill="currentColor"/></svg>';

// A card tile. A joker shows a star; on the table it also shows the rank
// it stands for.
function cardElRomme(card, tag, extra, standsFor) {
  const el = document.createElement(tag);
  if (tag === "button") el.type = "button";
  el.className = "pc-card" + (extra ? " " + extra : "") + (card.joker ? " romme-joker" : "");
  if (card.joker) {
    const rk = standsFor ? ({ 1: "A", 14: "A", 11: "J", 12: "Q", 13: "K" }[standsFor.rank] || String(standsFor.rank)) : "";
    el.innerHTML = '<span class="pc-rank">' + (rk || "&nbsp;") + "</span>" + ROMME_JOKER_SVG;
  } else {
    CardFaces.renderTall(el, card);
  }
  return el;
}

// "Meld 5♠ 6♠ 7♠, joker as 6♠": the cards in order, a joker named by the
// card it stands for, so the label translates segment by segment.
function meldTextRomme(meld) {
  const names = { 1: "A", 14: "A", 11: "J", 12: "Q", 13: "K" };
  const stands = (e) => e.suit ? CardFaces.labelAny({ rank: e.rank, suit: e.suit }) : (names[e.rank] || String(e.rank));
  const text = meld.entries.map((e) => (e.card.joker ? stands(e) : cardLabelRomme(e.card))).join(" ");
  return text + meld.entries.filter((e) => e.card.joker).map((e) => ", joker as " + stands(e)).join("");
}

function renderMeldRomme(meld, tappable, onTap) {
  const group = document.createElement(tappable ? "button" : "span");
  if (tappable) {
    group.type = "button";
    group.addEventListener("click", onTap);
  } else {
    group.setAttribute("role", "img");
  }
  group.className = "concan-meld romme-meld";
  meld.entries.forEach((e) => group.appendChild(cardElRomme(e.card, "span", "pc-card-small", e.card.joker ? e : null)));
  I18n.setAria(group, "Meld " + meldTextRomme(meld));
  return group;
}

function renderRomme() {
  const s = AppStateRomme.state;
  if (!s) return;
  const over = s.over || !AppStateRomme.started;
  const hidden = AppStateRomme.mode === "hotseat" && !AppStateRomme.revealed && !over;
  const viewer = AppStateRomme.mode === "vs-ai" ? 0 : s.turn;
  const myTurn = !over && !hidden && !isAiRomme(s.turn) && s.turn === viewer;
  const me = s.players[viewer];

  // Players
  const playersEl = document.getElementById("romme-players");
  playersEl.innerHTML = "";
  for (let p = 0; p < s.n; p++) {
    const row = document.createElement("div");
    row.className = "game-player" + (p === s.turn && !over ? " game-player-active" : "");
    const name = document.createElement("span");
    name.className = "game-player-name";
    let nm = playerNameRomme(p);
    if (AppStateRomme.mode === "vs-ai") nm = p === 0 ? nm + " (you)" : nm + " (computer)";
    I18n.setMsg(name, nm);
    row.appendChild(name);
    const cnt = document.createElement("span");
    cnt.className = "game-player-count";
    I18n.setMsg(cnt, s.players[p].hand.length === 1 ? "1 card" : s.players[p].hand.length + " cards");
    row.appendChild(cnt);
    const st = document.createElement("span");
    st.className = "pc-player-extra romme-player-status";
    I18n.setMsg(st, (s.players[p].opened ? "First meld made" : "No first meld yet") + " · Penalty points: " + s.scores[p]);
    row.appendChild(st);
    playersEl.appendChild(row);
  }
  I18n.setMsg(document.getElementById("romme-round-line"), "Round " + s.round + " · first meld: at least " + s.threshold + " points");

  // Table
  const tableEl = document.getElementById("romme-table");
  tableEl.innerHTML = "";
  const canTap = myTurn && s.phase === "play" && me.opened;
  if (!s.melds.length) {
    const empty = document.createElement("span");
    empty.className = "romme-empty";
    I18n.setMsg(empty, "No melds on the table yet.");
    tableEl.appendChild(empty);
  }
  s.melds.forEach((meld, i) => {
    const wrap = document.createElement("span");
    wrap.className = "romme-meld-wrap";
    const owner = document.createElement("span");
    owner.className = "romme-meld-owner";
    I18n.setMsg(owner, playerNameRomme(meld.owner));
    wrap.appendChild(owner);
    wrap.appendChild(renderMeldRomme(meld, canTap, () => onTableMeldRomme(i)));
    tableEl.appendChild(wrap);
  });

  // Piles
  const stock = document.getElementById("romme-stock");
  stock.innerHTML = "";
  const sc = document.createElement("span");
  sc.className = "pc-count";
  sc.textContent = String(s.stock.length);
  stock.appendChild(sc);
  stock.disabled = !(myTurn && s.phase === "draw");
  I18n.setAria(stock, "Stock: " + s.stock.length);
  const discard = document.getElementById("romme-discard");
  const top = RommeCore.topDiscard(s);
  discard.innerHTML = "";
  discard.className = "pc-card romme-discard" + (top && top.joker ? " romme-joker" : "");
  discard.disabled = !(myTurn && s.phase === "draw" && top);
  if (top) {
    if (top.joker) discard.innerHTML = '<span class="pc-rank">&nbsp;</span>' + ROMME_JOKER_SVG;
    else CardFaces.renderTall(discard, top);
    I18n.setAria(discard, "Discard pile " + cardLabelRomme(top));
  } else {
    I18n.setAria(discard, "Discard pile empty");
  }

  // Staged melds (before the first meld)
  const stagedEl = document.getElementById("romme-staged");
  const showStaged = !hidden && s.pending.length > 0 && s.turn === viewer;
  stagedEl.classList.toggle("hidden", !showStaged);
  const stagedMelds = document.getElementById("romme-staged-melds");
  stagedMelds.innerHTML = "";
  if (showStaged) {
    s.pending.forEach((m) => stagedMelds.appendChild(renderMeldRomme(m, false)));
    I18n.setMsg(document.getElementById("romme-staged-label"), "Staged for the first meld: " + RommeCore.pendingValue(s) + " of " + s.threshold + " points.");
  }
  document.getElementById("romme-confirm-button").disabled = !(myTurn && s.pending.length && RommeCore.pendingValue(s) >= s.threshold);

  // Hand
  const cover = document.getElementById("romme-hand-cover");
  cover.classList.toggle("hidden", !hidden);
  if (hidden) I18n.setMsg(document.getElementById("romme-hand-cover-text"), "Pass the device to " + playerNameRomme(s.turn) + ".");
  const mine = document.getElementById("romme-mine");
  mine.classList.toggle("hidden", hidden);
  I18n.setMsg(document.getElementById("romme-my-label"), playerNameRomme(viewer) + ": your cards");
  const handEl = document.getElementById("romme-hand");
  handEl.innerHTML = "";
  if (!hidden) {
    const sorted = me.hand.slice().sort((a, b) => (a.joker ? 1 : 0) - (b.joker ? 1 : 0) ||
      RommeCore.SUITS.indexOf(a.suit) - RommeCore.SUITS.indexOf(b.suit) || a.rank - b.rank);
    sorted.forEach((c) => {
      const sel = AppStateRomme.selected.indexOf(c.id) !== -1;
      const btn = cardElRomme(c, "button", sel ? "pc-card-selected" : "");
      btn.disabled = !(myTurn && s.phase === "play");
      I18n.setAria(btn, (c.joker ? "Joker" : "Card " + cardLabelRomme(c)) + (sel ? ", selected" : ""));
      btn.addEventListener("click", () => onHandCardRomme(c.id));
      handEl.appendChild(btn);
    });
  }
  document.getElementById("romme-actions").classList.toggle("hidden", !(myTurn && s.phase === "play"));
  document.getElementById("romme-cancel-button").classList.toggle("hidden", !s.pending.length);
  document.getElementById("romme-confirm-button").classList.toggle("hidden", !s.pending.length);

  // Round end
  const endEl = document.getElementById("romme-round-end");
  endEl.classList.toggle("hidden", !s.over);
  if (s.over && s.penalties) {
    const list = document.getElementById("romme-round-scores");
    list.innerHTML = "";
    for (let p = 0; p < s.n; p++) {
      const li = document.createElement("li");
      I18n.setMsg(li, playerNameRomme(p) + ": " + s.penalties[p] + " penalty points this round, " + s.scores[p] + " in total");
      list.appendChild(li);
    }
  }
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", over);
}

document.addEventListener("DOMContentLoaded", initRommeApp);
