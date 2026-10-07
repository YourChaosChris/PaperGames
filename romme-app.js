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
// Settings: number of rounds (penalty points add up; after the last round
// the fewest points win the game - statistics then count only the whole
// game) and the house rule "take cards from melds": with no hand card
// selected, the cards that may be taken show a corner triangle and are
// buttons; a taken card must go into a new meld before discarding, and
// "Take back" restores table and hand. Melds on the table are grouped by
// the player who laid them out.
//
// Against the computer the human is "You" (seat 0), with one to three computer
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
  recorded: false,      // statistics recorded for the current round
  choice: null          // house rule "split runs": { meld, id } while asking "add or split?"
};

// Against the computer the human is "You" and the computers "Computer 1"
// to "Computer 3"; on one device the seats are "Player 1" to "Player 4".
// Sentences about the human have their own wording ("You draw a card."),
// they are not built from the name.
function playerNameRomme(i) {
  if (AppStateRomme.mode === "vs-ai") return i === 0 ? "You" : "Computer " + i;
  return "Player " + (i + 1);
}

function isYouRomme(i) { return AppStateRomme.mode === "vs-ai" && i === 0; }

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
    const roundsEl = document.getElementById("romme-rounds-inline");
    const rounds = roundsEl ? parseInt(roundsEl.value, 10) || 1 : 1;
    const takeEl = document.getElementById("romme-take-rule");
    const takeRule = !!(takeEl && takeEl.checked);
    const discEl = document.getElementById("romme-discard-rule");
    const discardRule = !!(discEl && discEl.checked);
    const splitEl = document.getElementById("romme-split-rule");
    const splitRule = !!(splitEl && splitEl.checked);
    const layoffEl = document.getElementById("romme-joker-layoff-rule");
    const jokerLayoffRule = !!(layoffEl && layoffEl.checked);
    const players = pendingMode === "vs-ai" ? opponents + 1 : seats;
    startGameRomme(pendingMode, level, players, threshold, rounds, takeRule, discardRule, splitRule, jokerLayoffRule);
    const status = document.getElementById("offline-romme-status");
    if (status) {
      const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
      I18n.setMsg(status, pendingMode === "vs-ai"
        ? "Computer opponents: " + opponents + " · computer level: " + levelNames[level]
        : "Game on one device for " + players + " players (no computer).");
    }
  });

  document.getElementById("romme-stock").addEventListener("click", () => humanMoveRomme({ type: "draw" }));
  document.getElementById("romme-discard").addEventListener("click", () => humanMoveRomme({ type: "takeDiscard" }));
  document.getElementById("romme-meld-button").addEventListener("click", onMeldButtonRomme);
  document.getElementById("romme-discard-button").addEventListener("click", onDiscardButtonRomme);
  document.getElementById("romme-confirm-button").addEventListener("click", () => humanMoveRomme({ type: "confirmOpen" }));
  document.getElementById("romme-cancel-button").addEventListener("click", () => humanMoveRomme({ type: "cancelPending" }));
  document.getElementById("romme-return-button").addEventListener("click", () => humanMoveRomme({ type: "returnDiscard" }));
  document.getElementById("romme-choice-extend").addEventListener("click", () => onChoiceRomme(false));
  document.getElementById("romme-choice-split").addEventListener("click", () => onChoiceRomme(true));
  document.getElementById("romme-sort-button").addEventListener("click", () => {
    setSortRomme(getSortRomme() === "rank" ? "suit" : "rank");
    renderRomme();
  });
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

function startGameRomme(mode, level, players, threshold, rounds, takeRule, discardRule, splitRule, jokerLayoffRule) {
  AppStateRomme.mode = mode;
  AppStateRomme.aiLevel = level;
  const dealer = typeof RandomStart !== "undefined" ? RandomStart.choose(0, Array.from({ length: players }, (_, i) => i)) : 0;
  AppStateRomme.state = RommeCore.createInitialState({ players, threshold, dealer, rounds: rounds || 1, takeRule: !!takeRule, discardRule: !!discardRule, splitRule: !!splitRule, jokerLayoffRule: !!jokerLayoffRule });
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
  if (!s || !s.over || RommeCore.matchResult(s).over) return;
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
  const you = isYouRomme(s.turn);
  if (s.phase === "draw") return you ? "Your turn: draw a card from the stock or take the top discard." : who + ": draw a card from the stock or take the top discard.";
  if (s.pendingJoker !== null) return s.jokerLayoffRule && !(s.takenIds || []).includes(s.pendingJoker) ? "Lay out the joker you took back in a new meld or add it to a meld first." : "Lay out the joker you took back in a new meld first.";
  if (s.takenIds && s.takenIds.length) return "Lay out the card you took in a new meld first, or take it back.";
  if (RommeCore.discardCardOpen(s) && !s.pending.length) return "Lay out the card from the discard pile in a meld first - or put it back and draw from the stock.";
  if (s.pending.length) return "Staged for the first meld: " + RommeCore.pendingValue(s) + " of " + s.threshold + " points.";
  if (s.firstTurn && s.turn === s.dealer) return you ? "Your turn: start the round by discarding a card (you may lay out melds first)." : who + ": start the round by discarding a card (you may lay out melds first).";
  if (!s.players[s.turn].opened) return you ? "Your turn: your first meld needs at least " + s.threshold + " points - lay out melds or discard a card." : who + ": your first meld needs at least " + s.threshold + " points - lay out melds or discard a card.";
  return you ? "Your turn: lay out melds or add to melds, then discard a card." : who + ": lay out melds or add to melds, then discard a card.";
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
  if (isYouRomme(before.turn)) return describeYouRomme(before, after, move, ev);
  if (move.type === "draw") return (ev.type === "reshuffle" ? "The discard pile is shuffled into a new stock. " : "") + who + " draws a card.";
  if (move.type === "takeDiscard") return who + " takes the " + cardLabelRomme(ev.card) + ".";
  if (move.type === "meld") return after.players[before.turn].opened && before.players[before.turn].opened ? who + " lays out a meld." : "";
  if (move.type === "confirmOpen") return who + " makes the first meld with " + ev.points + " points.";
  if (move.type === "extend") return ev.card && ev.card.joker ? who + " adds the joker to a meld." : who + " adds the " + cardLabelRomme(ev.card) + " to a meld.";
  if (move.type === "swapJoker") return who + " swaps the " + cardLabelRomme(ev.card) + " for a joker.";
  if (move.type === "take") return who + " takes the " + cardLabelRomme(ev.card) + " from a meld.";
  if (move.type === "split") return who + " splits a run with the " + cardLabelRomme(ev.card) + ".";
  if (move.type === "returnDiscard") return who + " puts the " + cardLabelRomme(ev.card) + " back and draws from the stock.";
  if (move.type === "discard") return who + " discards the " + cardLabelRomme(ev.card) + ".";
  return "";
}

// The same events in the human's own words.
function describeYouRomme(before, after, move, ev) {
  const card = ev.card ? cardLabelRomme(ev.card) : "";
  if (move.type === "draw") return (ev.type === "reshuffle" ? "The discard pile is shuffled into a new stock. " : "") + "You draw a card.";
  if (move.type === "takeDiscard") return "You take the " + card + ".";
  if (move.type === "meld") return after.players[before.turn].opened && before.players[before.turn].opened ? "You lay out a meld." : "";
  if (move.type === "confirmOpen") return "You make the first meld with " + ev.points + " points.";
  if (move.type === "extend") return ev.card && ev.card.joker ? "You add the joker to a meld." : "You add the " + card + " to a meld.";
  if (move.type === "swapJoker") return "You swap the " + card + " for a joker.";
  if (move.type === "take") return "You take the " + card + " from a meld.";
  if (move.type === "split") return "You split a run with the " + card + ".";
  if (move.type === "returnDiscard") return "You put the " + card + " back and draw from the stock.";
  if (move.type === "discard") return "You discard the " + card + ".";
  return "";
}

function applyRomme(move) {
  const before = AppStateRomme.state;
  const r = RommeCore.applyMove(before, move);
  if (!r.ok) return r.reason;
  AppStateRomme.state = r.state;
  AppStateRomme.selected = [];
  AppStateRomme.choice = null;
  afterStepRomme(describeRomme(before, r.state, move), r.state.turn !== before.turn);
  return null;
}

function showRoundEndRomme(prefix) {
  const s = AppStateRomme.state;
  const pre = prefix ? prefix + " " : "";
  const multi = (s.rounds || 1) > 1;
  const match = RommeCore.matchResult(s);
  let msg, title, outcome = null;
  if (s.winner === null) {
    msg = pre + "Nothing is left to draw - the round ends without a winner.";
    title = "Draw";
  } else {
    msg = pre + (isYouRomme(s.winner) ? "You have no cards left and win the round." : playerNameRomme(s.winner) + " has no cards left and wins the round.");
    title = AppStateRomme.mode === "vs-ai" ? (s.winner === 0 ? "You win!" : "You lose") : playerNameRomme(s.winner) + " wins";
  }
  if (!multi) {
    outcome = s.winner === null ? "draw" : s.winner === 0 ? "win" : "loss";
  } else if (match.over) {
    // The whole game: fewest penalty points over all rounds.
    const best = Math.min.apply(null, s.scores);
    if (match.winner === null) {
      msg += " Game over after " + s.rounds + " rounds: a draw at " + best + " penalty points.";
      title = "Draw";
      outcome = "draw";
    } else {
      msg += isYouRomme(match.winner)
        ? " Game over after " + s.rounds + " rounds: you win with " + best + " penalty points."
        : " Game over after " + s.rounds + " rounds: " + playerNameRomme(match.winner) + " wins with " + best + " penalty points.";
      title = AppStateRomme.mode === "vs-ai" ? (match.winner === 0 ? "You win!" : "You lose") : playerNameRomme(match.winner) + " wins";
      outcome = match.winner === 0 ? "win" : "loss";
    }
  } else {
    title = "Round " + s.round + " of " + s.rounds;
  }
  if (outcome && AppStateRomme.mode === "vs-ai" && !AppStateRomme.recorded && typeof GameStats !== "undefined") {
    GameStats.record("romme", outcome);
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
  const msg = isYouRomme(loser) ? "You resigned." : playerNameRomme(loser) + " resigned.";
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
  "no-discard": "The discard pile is empty.",
  "take-breaks-meld": "At least three cards must stay in the meld - from a run only the first or the last card.",
  "take-joker": "Jokers can't be taken - swap them instead.",
  "taken-first": "Lay out the card you took in a new meld first, or take it back.",
  "taken-new-meld": "A card taken from the table must go into a new meld.",
  "taken-joker-unusable": "A joker freed by a card you took must go into a new meld - you have no cards for one.",
  "discard-card-first": "Lay out the card from the discard pile in a meld first - or put it back and draw from the stock.",
  "split-set": "Sets can't be split.",
  "split-short": "Both runs must have at least three cards after the split.",
  "split-joker": "A joker stands for that card - the run can't be split there."
};

// Hand order: "suit" (suit, then rank - the default) or "rank" (equal
// ranks side by side, then suit); jokers last either way. Remembered on
// this device.
const ROMME_SORT_KEY = "papergames_romme_sort";

function getSortRomme() {
  try { return window.localStorage && window.localStorage.getItem(ROMME_SORT_KEY) === "rank" ? "rank" : "suit"; } catch (e) { return "suit"; }
}

function setSortRomme(order) {
  try { if (window.localStorage) window.localStorage.setItem(ROMME_SORT_KEY, order); } catch (e) { /* not remembered then */ }
}

function sortHandRomme(hand) {
  const suitIdx = (c) => RommeCore.SUITS.indexOf(c.suit);
  const byRank = getSortRomme() === "rank";
  return hand.slice().sort((a, b) => (a.joker ? 1 : 0) - (b.joker ? 1 : 0) ||
    (byRank ? (a.rank - b.rank || suitIdx(a) - suitIdx(b)) : (suitIdx(a) - suitIdx(b) || a.rank - b.rank)));
}

function humanMoveRomme(move) {
  if (!humanCanActRomme()) return;
  const s = AppStateRomme.state;
  const reason = applyRomme(move);
  if (!reason) return;
  if (s.pendingJoker !== null && (s.takenIds || []).includes(s.pendingJoker) && (reason === "taken-new-meld" || reason === "joker-first")) {
    setStatusRomme("Lay out the joker you took back in a new meld first.");
    return;
  }
  if (reason === "below-threshold") setStatusRomme("Not enough yet: the first meld needs at least " + s.threshold + " points.");
  else if (reason === "joker-first" && s.jokerLayoffRule && !(s.takenIds || []).includes(s.pendingJoker)) setStatusRomme("Lay out the joker you took back in a new meld or add it to a meld first.");
  else setStatusRomme(ROMME_REASON_TEXT[reason] || "That isn't possible right now.");
}

function onHandCardRomme(id) {
  if (!humanCanActRomme()) return;
  AppStateRomme.choice = null;
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
  // House rule "split runs": a card that only splits the run splits it;
  // one that could also be added there asks which is meant.
  const canSplit = !!(s.splitRule && card && meld && RommeCore.splitIndex(meld, card) !== -1);
  const canAdd = !!(card && meld && (RommeCore.extendMeld(meld, card) || RommeCore.jokerSlotFor(meld, card) !== -1));
  if (canSplit && canAdd) {
    AppStateRomme.choice = { meld: index, id };
    setStatusRomme("This card fits both ways: add it to the meld or split the run?");
    renderRomme();
    return;
  }
  if (canSplit) { humanMoveRomme({ type: "split", meld: index, id }); return; }
  if (s.splitRule && card && meld && meld.type === "run" && !canAdd) {
    // Let the rules say why a split is not possible here.
    const r = RommeCore.applyMove(s, { type: "split", meld: index, id });
    if (r.reason === "split-short" || r.reason === "split-joker") { setStatusRomme(ROMME_REASON_TEXT[r.reason]); return; }
  }
  if (card && meld && RommeCore.jokerSlotFor(meld, card) !== -1) humanMoveRomme({ type: "swapJoker", meld: index, id });
  else humanMoveRomme({ type: "extend", meld: index, id });
}

// The answer to "add or split?".
function onChoiceRomme(split) {
  const c = AppStateRomme.choice;
  AppStateRomme.choice = null;
  if (!c || !humanCanActRomme()) { renderRomme(); return; }
  const s = AppStateRomme.state;
  const card = s.players[s.turn].hand.find((x) => x.id === c.id);
  const meld = s.melds[c.meld];
  if (split) humanMoveRomme({ type: "split", meld: c.meld, id: c.id });
  else if (card && meld && RommeCore.jokerSlotFor(meld, card) !== -1) humanMoveRomme({ type: "swapJoker", meld: c.meld, id: c.id });
  else humanMoveRomme({ type: "extend", meld: c.meld, id: c.id });
  renderRomme();
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

// A meld: one button (add to it / swap its joker) when `tappable`; with
// the house rule, the cards in `takeIds` are buttons of their own that
// take the card (marked by a corner triangle, not by grey).
function renderMeldRomme(meld, tappable, onTap, takeIds, onTake) {
  const takes = takeIds || [];
  const group = document.createElement(tappable ? "button" : "span");
  if (tappable) {
    group.type = "button";
    group.addEventListener("click", onTap);
  } else if (!takes.length) {
    group.setAttribute("role", "img");
  } else {
    group.setAttribute("role", "group");
  }
  group.className = "concan-meld romme-meld";
  meld.entries.forEach((e) => {
    if (takes.indexOf(e.card.id) !== -1) {
      const btn = cardElRomme(e.card, "button", "pc-card-small romme-takeable", null);
      I18n.setAria(btn, "Take " + cardLabelRomme(e.card));
      btn.addEventListener("click", () => onTake(e.card.id));
      group.appendChild(btn);
    } else {
      group.appendChild(cardElRomme(e.card, "span", "pc-card-small", e.card.joker ? e : null));
    }
  });
  I18n.setAria(group, "Meld " + meldTextRomme(meld));
  return group;
}

// Heading of a player's area on the table.
function ownerLabelRomme(p) {
  return playerNameRomme(p);
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
    const nm = playerNameRomme(p);
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
  I18n.setMsg(document.getElementById("romme-round-line"), (s.rounds || 1) > 1
    ? "Round " + s.round + " of " + s.rounds + " · first meld: at least " + s.threshold + " points"
    : "Round " + s.round + " · first meld: at least " + s.threshold + " points");

  // Table: one area per player with their melds (adding to any meld is
  // still allowed; an added card stays in its owner's meld).
  const tableEl = document.getElementById("romme-table");
  tableEl.innerHTML = "";
  const canTap = myTurn && s.phase === "play" && me.opened;
  const takeOpts = canTap && AppStateRomme.selected.length === 0 ? RommeCore.takeOptions(s) : [];
  if (!s.melds.length) {
    const empty = document.createElement("span");
    empty.className = "romme-empty";
    I18n.setMsg(empty, "No melds on the table yet.");
    tableEl.appendChild(empty);
  } else {
    for (let owner = 0; owner < s.n; owner++) {
      const area = document.createElement("div");
      area.className = "romme-owner-area";
      const head = document.createElement("span");
      head.className = "romme-owner-name";
      I18n.setMsg(head, ownerLabelRomme(owner));
      area.appendChild(head);
      let any = false;
      s.melds.forEach((meld, i) => {
        if (meld.owner !== owner) return;
        any = true;
        const takeIds = takeOpts.filter((o) => o.meld === i).map((o) => o.id);
        area.appendChild(renderMeldRomme(meld, canTap && !takeIds.length, () => onTableMeldRomme(i), takeIds, (id) => humanMoveRomme({ type: "take", meld: i, id })));
      });
      if (!any) {
        const none = document.createElement("span");
        none.className = "romme-empty";
        I18n.setMsg(none, "No melds yet.");
        area.appendChild(none);
      }
      tableEl.appendChild(area);
    }
  }

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
  I18n.setMsg(document.getElementById("romme-my-label"), isYouRomme(viewer) ? "Your cards" : playerNameRomme(viewer) + ": your cards");
  const handEl = document.getElementById("romme-hand");
  handEl.innerHTML = "";
  if (!hidden) {
    const sorted = sortHandRomme(me.hand);
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
  document.getElementById("romme-return-button").classList.toggle("hidden", !(myTurn && s.phase === "play" && RommeCore.discardCardOpen(s)));
  I18n.setKey(document.getElementById("romme-sort-button"), getSortRomme() === "rank" ? "romme_sort_by_suit" : "romme_sort_by_rank");
  document.getElementById("romme-cancel-button").classList.toggle("hidden", !s.pending.length && !(s.takenIds && s.takenIds.length));
  const asking = !!AppStateRomme.choice;
  document.getElementById("romme-choice-extend").classList.toggle("hidden", !asking);
  document.getElementById("romme-choice-split").classList.toggle("hidden", !asking);
  document.getElementById("romme-confirm-button").classList.toggle("hidden", !s.pending.length);

  // Round end
  const endEl = document.getElementById("romme-round-end");
  endEl.classList.toggle("hidden", !s.over);
  document.getElementById("romme-next-round").classList.toggle("hidden", !s.over || RommeCore.matchResult(s).over);
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
