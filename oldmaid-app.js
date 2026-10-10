// oldmaid-app.js
// Wires OldMaidCore ("Old Maid" / Schwarzer Peter) to oldmaid.html.
//
// You play against 1 to 3 computers. The cards carry no writing, only a
// picture - an animal from pairs-animals.js or the Black Peter (a black
// cat with a top hat) - with the name small underneath, so children who
// cannot read can play. On your turn the hidden cards of the player to
// your left stand in a row: tap one to draw it. Pairs are laid down by
// themselves. Computer turns follow one after another with a pause
// (AiPacing), the computers draw at random.

const OLDMAID_SAVE_KEY = "einkchess_save_oldmaid";

const AppStateOldMaid = {
  numPlayers: 2,
  state: null,
  started: false,
  gameOver: false,
  busy: false,
  lastCard: null    // the card you drew last, marked in your hand
};

const OLDMAID_ANIMAL_EN = {
  dog: "Dog", cat: "Cat", rabbit: "Rabbit", mouse: "Mouse", hedgehog: "Hedgehog", owl: "Owl", fish: "Fish",
  turtle: "Turtle", snail: "Snail", duck: "Duck", frog: "Frog", pig: "Pig", elephant: "Elephant",
  butterfly: "Butterfly", bee: "Bee", lion: "Lion", giraffe: "Giraffe", sheep: "Sheep"
};

// The Black Peter: a black cat's head with white eyes and whiskers,
// wearing a top hat - filled black, unlike every animal card.
const OLDMAID_PETER_SVG =
  '<path d="M9 31L10 18L17 22ZM31 31L30 18L23 22Z" fill="#141413"/>' +
  '<circle cx="20" cy="28" r="10.5" fill="#141413"/>' +
  '<ellipse cx="16" cy="27" rx="2.6" ry="2.2" fill="#fff"/><ellipse cx="24" cy="27" rx="2.6" ry="2.2" fill="#fff"/>' +
  '<path d="M16 25.4V28.6M24 25.4V28.6" stroke="#141413" stroke-width="1.3"/>' +
  '<path d="M18.6 31.5H21.4L20 33Z" fill="#fff"/>' +
  '<path d="M3 30H13M3 34L13 32.5M37 30H27M37 34L27 32.5" stroke="#141413" stroke-width="1.6" stroke-linecap="round"/>' +
  '<rect x="11" y="15" width="18" height="3" rx="1" fill="#141413"/>' +
  '<rect x="14.5" y="2" width="11" height="14" fill="#141413"/>' +
  '<rect x="14.5" y="11.5" width="11" height="2.3" fill="#fff"/>';

function cardNameOldMaid(card) {
  if (card === OldMaidCore.PETER) return "Black Peter";
  return OLDMAID_ANIMAL_EN[PairsAnimals.NAMES[card]];
}

function cardSvgOldMaid(card) {
  if (card === OldMaidCore.PETER) {
    return '<svg class="oldmaid-pic" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + OLDMAID_PETER_SVG + "</svg>";
  }
  return PairsAnimals.svg(card, "oldmaid-pic");
}

// Picture on top, the name small underneath.
function fillCardOldMaid(el, card) {
  el.innerHTML = cardSvgOldMaid(card);
  const name = document.createElement("span");
  name.className = "oldmaid-name";
  I18n.setMsg(name, cardNameOldMaid(card));
  el.appendChild(name);
}

function playerNameOldMaid(i) {
  return i === 0 ? "You" : "Computer " + i;
}

function setStatusOldMaid(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setResultOldMaid(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function saveOldMaid() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(OLDMAID_SAVE_KEY, { numPlayers: AppStateOldMaid.numPlayers, state: AppStateOldMaid.state });
}

function clearSaveOldMaid() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(OLDMAID_SAVE_KEY);
}

/*** Game flow ***/

function initOldMaidApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const playersSelect = document.getElementById("oldmaid-num-players");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-oldmaid-game").addEventListener("click", () => {
    startGameOldMaid(playersSelect ? parseInt(playersSelect.value, 10) : 2);
  });
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateOldMaid.state) renderOldMaid(); });
  }

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(OLDMAID_SAVE_KEY) : null;
  if (saved && saved.state && !saved.state.gameOver && Array.isArray(saved.state.hands)) {
    AppStateOldMaid.numPlayers = saved.numPlayers;
    AppStateOldMaid.state = saved.state;
    AppStateOldMaid.started = true;
    AppStateOldMaid.gameOver = false;
    if (playersSelect) playersSelect.value = String(saved.numPlayers);
    showBoardOldMaid();
    promptOldMaid();
    continueOldMaid();
  }
}

function showBoardOldMaid() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameOldMaid(numPlayers) {
  const n = OldMaidCore.PAIRS[numPlayers] ? numPlayers : 2;
  AppStateOldMaid.numPlayers = n;
  AppStateOldMaid.state = OldMaidCore.createInitialState(n);
  AppStateOldMaid.started = true;
  AppStateOldMaid.gameOver = false;
  AppStateOldMaid.busy = false;
  AppStateOldMaid.lastCard = null;
  setResultOldMaid("");
  showBoardOldMaid();
  saveOldMaid();
  if (AppStateOldMaid.state.gameOver) { endGameOldMaid("Cards dealt, pairs laid down."); return; }
  promptOldMaid("Cards dealt, pairs laid down.");
  continueOldMaid();
}

function promptOldMaid(prefix) {
  const s = AppStateOldMaid.state;
  const pre = prefix ? prefix + " " : "";
  if (s.turn === 0) {
    setStatusOldMaid(pre + "Your turn: tap one of " + playerNameOldMaid(OldMaidCore.giver(s)) + "'s cards to draw it.");
  } else {
    setStatusOldMaid(pre + playerNameOldMaid(s.turn) + "'s turn.");
  }
  renderOldMaid();
}

function continueOldMaid() {
  const s = AppStateOldMaid.state;
  if (AppStateOldMaid.gameOver || !s || s.gameOver || s.turn === 0 || AppStateOldMaid.busy) return;
  AppStateOldMaid.busy = true;
  setTimeout(aiTurnOldMaid, AiPacing.delay(900));
}

function aiTurnOldMaid() {
  AppStateOldMaid.busy = false;
  const s = AppStateOldMaid.state;
  if (AppStateOldMaid.gameOver || !s || s.gameOver || s.turn === 0) return;
  const from = OldMaidCore.giver(s);
  applyDrawOldMaid(Math.floor(Math.random() * s.hands[from].length));
}

// A sentence about a draw. Cards drawn by one computer from another stay
// hidden; what you draw, and what is drawn from you, is named.
function describeDrawOldMaid(r) {
  const parts = [];
  const who = playerNameOldMaid(r.taker), from = playerNameOldMaid(r.from);
  if (r.taker === 0) {
    parts.push(r.card === OldMaidCore.PETER ? "You drew the Black Peter!" : "You drew: " + cardNameOldMaid(r.card) + ".");
    if (r.pair) parts.push("A pair - laid down.");
  } else if (r.from === 0) {
    parts.push(who + " drew a card from you: " + cardNameOldMaid(r.card) + ".");
    if (r.pair) parts.push(who + " lays down a pair.");
  } else {
    parts.push(who + " drew a card from " + from + ".");
    if (r.pair) parts.push(who + " lays down a pair.");
  }
  if (r.takerOut) parts.push(r.taker === 0 ? "You have no cards left - you are safe." : who + " has no cards left.");
  if (r.giverOut) parts.push(r.from === 0 ? "You have no cards left - you are safe." : from + " has no cards left.");
  return parts.join(" ");
}

function applyDrawOldMaid(index) {
  const r = OldMaidCore.draw(AppStateOldMaid.state, index, Math.random, 0);
  if (!r.ok) return false;
  AppStateOldMaid.state = r.state;
  AppStateOldMaid.lastCard = r.taker === 0 && !r.pair ? r.card : null;
  const msg = describeDrawOldMaid(r);
  saveOldMaid();
  if (r.state.gameOver) { endGameOldMaid(msg); return true; }
  promptOldMaid(msg);
  continueOldMaid();
  return true;
}

function endGameOldMaid(summary) {
  const s = AppStateOldMaid.state;
  AppStateOldMaid.gameOver = true;
  const lost = s.loser === 0;
  const end = lost ? "You have the Black Peter - you lose." : playerNameOldMaid(s.loser) + " has the Black Peter. You win!";
  const full = (summary ? summary + " " : "") + end;
  setResultOldMaid(end);
  setStatusOldMaid(full);
  if (typeof GameStats !== "undefined") GameStats.record("oldmaid", lost ? "loss" : "win");
  if (window.ResultModal) window.ResultModal.show(lost ? "You lose" : "You win!", end);
  clearSaveOldMaid();
  renderOldMaid();
}

function onHiddenCardOldMaid(i) {
  const s = AppStateOldMaid.state;
  if (!s || AppStateOldMaid.gameOver || s.gameOver) return;
  if (s.turn !== 0) {
    setStatusOldMaid("Computer thinking…");
    return;
  }
  applyDrawOldMaid(i);
}

/*** Rendering ***/

function renderOldMaid() {
  const s = AppStateOldMaid.state;
  if (!s) return;
  const over = AppStateOldMaid.gameOver || s.gameOver;

  // Players: cards in hand and pairs laid down.
  const playersEl = document.getElementById("oldmaid-players");
  playersEl.innerHTML = "";
  for (let p = 0; p < s.numPlayers; p++) {
    const row = document.createElement("div");
    row.className = "game-player" + (p === s.turn && !over ? " game-player-active" : "") + (!s.hands[p].length ? " game-player-stock" : "");
    const name = document.createElement("span");
    name.className = "game-player-name";
    I18n.setMsg(name, playerNameOldMaid(p));
    row.appendChild(name);
    row.appendChild(document.createTextNode(":"));
    const extra = document.createElement("span");
    extra.className = "pc-player-extra";
    I18n.setMsg(extra, "Cards: " + s.hands[p].length + " · Pairs: " + s.pairs[p]);
    row.appendChild(extra);
    playersEl.appendChild(row);
  }

  // The hidden cards to draw from (your turn), or every hand at the end.
  const fromWrap = document.getElementById("oldmaid-from-wrap");
  const fromLabel = document.getElementById("oldmaid-from-label");
  const fromEl = document.getElementById("oldmaid-from");
  fromEl.innerHTML = "";
  const yourTurn = !over && s.turn === 0;
  fromWrap.classList.toggle("hidden", !yourTurn);
  if (yourTurn) {
    const g = OldMaidCore.giver(s);
    I18n.setMsg(fromLabel, playerNameOldMaid(g) + "'s cards - tap one");
    s.hands[g].forEach((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pc-card oldmaid-card pc-card-back";
      I18n.setAria(btn, "Hidden card " + (i + 1) + " of " + s.hands[g].length);
      btn.addEventListener("click", () => onHiddenCardOldMaid(i));
      fromEl.appendChild(btn);
    });
  }

  // Your own cards, face up and sorted.
  const handLabel = document.getElementById("oldmaid-hand-label");
  const handEl = document.getElementById("oldmaid-hand");
  handEl.innerHTML = "";
  I18n.setMsg(handLabel, s.hands[0].length ? "Your cards" : "You have no cards left - you are safe.");
  const mine = s.hands[0].slice().sort((a, b) => (a === OldMaidCore.PETER ? 99 : a) - (b === OldMaidCore.PETER ? 99 : b));
  let marked = false;
  mine.forEach((card) => {
    const c = document.createElement("span");
    c.className = "pc-card oldmaid-card";
    if (!marked && card === AppStateOldMaid.lastCard) { c.classList.add("card-new"); marked = true; }
    c.setAttribute("role", "img");
    fillCardOldMaid(c, card);
    I18n.setAria(c, cardNameOldMaid(card));
    handEl.appendChild(c);
  });

  // At the end: the loser's last card.
  const endEl = document.getElementById("oldmaid-end");
  endEl.innerHTML = "";
  endEl.classList.toggle("hidden", !over || s.loser <= 0);
  if (over && s.loser > 0) {
    const label = document.createElement("span");
    label.className = "pc-row-label";
    I18n.setMsg(label, playerNameOldMaid(s.loser) + "'s last card");
    endEl.appendChild(label);
    s.hands[s.loser].forEach((card) => {
      const c = document.createElement("span");
      c.className = "pc-card oldmaid-card";
      c.setAttribute("role", "img");
      fillCardOldMaid(c, card);
      I18n.setAria(c, cardNameOldMaid(card));
      endEl.appendChild(c);
    });
  }
}

document.addEventListener("DOMContentLoaded", initOldMaidApp);
