// trix-app.js
// Wires TrixCore/TrixAi to trix.html.
//
// Four seats: against the computer you are Player 1; on one device 2-4
// people share the seats and the computer takes the rest. The page shows
// the running contract's name at the top with the kingdom and which of
// its five contracts are done, the score board (always visible, with the
// penalty cards each player has taken this deal), then either the trick
// or the four Trix rows, and the hand. In Trix every card you may lay
// carries a black corner; in the trick contracts cards you may not play
// sit lower with a dashed border. Tapping a card that doesn't fit says
// why. A finished trick stays on the table for a moment (AiPacing).
//
// The game can be ended after any kingdom; everything is saved, so it can
// also be continued later.

const TX_SAVE_KEY = "einkchess_save_trix";
const TX_CONTRACT_NAME = {
  king: "King of Hearts",
  queens: "Queens",
  diamonds: "Diamonds",
  tricks: "Tricks",
  trix: "Trix"
};
const TX_FOLLOW_TEXT = {
  C: "Clubs were led: you have to follow with Clubs.",
  S: "Spades were led: you have to follow with Spades.",
  H: "Hearts were led: you have to follow with Hearts.",
  D: "Diamonds were led: you have to follow with Diamonds."
};

const AppStateTx = {
  mode: "vs-ai",
  humans: [true, false, false, false],
  aiLevel: 2,
  game: null,
  started: false,
  busy: false,
  showTrick: null,     // a finished trick still on the table
  pending: null,       // "continue" | "kingdom" after a deal / kingdom
  revealed: true,
  shownFor: null,
  recorded: false
};

function playerNameTx(i) {
  return "Player " + (i + 1);
}

function isAiTx(i) {
  return !AppStateTx.humans[i];
}

function cardTextTx(card) {
  return CardFaces.labelAny(card);
}

function setStatusTx(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function saveTx() {
  if (typeof GameStorage === "undefined") return;
  if (AppStateTx.game && AppStateTx.game.gameOver) {
    GameStorage.clear(TX_SAVE_KEY);
    return;
  }
  GameStorage.save(TX_SAVE_KEY, {
    mode: AppStateTx.mode,
    humans: AppStateTx.humans,
    aiLevel: AppStateTx.aiLevel,
    game: AppStateTx.game,
    pending: AppStateTx.pending
  });
}

// Whose turn it is to decide right now: the owner while a contract is
// being chosen, otherwise the player to play.
function actorTx() {
  const g = AppStateTx.game;
  if (g.deal) return g.deal.turn;
  return g.owner;
}

function nextHumanTx(from) {
  let p = from;
  for (let k = 0; k < 4 && isAiTx(p); k++) p = (p + 1) % 4;
  return p;
}

/*** Game flow ***/

function initTrixApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeAi = document.getElementById("mode-offline-ai");
  const humansWrap = document.getElementById("tx-humans-wrap");
  const humansSelect = document.getElementById("tx-humans");
  const levelSelect = document.getElementById("tx-level-inline");
  let pendingMode = "vs-ai";

  function setMode(mode) {
    pendingMode = mode;
    if (modeOffline) modeOffline.classList.toggle("active-mode", mode === "hotseat");
    if (modeAi) modeAi.classList.toggle("active-mode", mode === "vs-ai");
    if (humansWrap) humansWrap.classList.toggle("hidden", mode !== "hotseat");
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  if (modeOffline) modeOffline.addEventListener("click", () => setMode("hotseat"));
  if (modeAi) modeAi.addEventListener("click", () => setMode("vs-ai"));

  document.getElementById("start-trix-game").addEventListener("click", () => {
    const humans = pendingMode === "hotseat" ? parseInt(humansSelect.value, 10) : 1;
    const level = parseInt(levelSelect.value, 10);
    startGameTx(pendingMode, humans, level);
    const status = document.getElementById("offline-trix-status");
    if (status) {
      const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
      I18n.setMsg(status, pendingMode === "vs-ai"
        ? "You play Player 1, computer level: " + levelNames[level] + "."
        : (humans === 4 ? "Four players on this device." : humans + " players on this device, the computer plays the other seats."));
    }
  });

  document.querySelectorAll("#tx-choose button[data-contract]").forEach((btn) => {
    btn.addEventListener("click", () => humanChooseTx(btn.getAttribute("data-contract")));
  });
  document.getElementById("tx-pass").addEventListener("click", () => humanMoveTx({ pass: true }));
  document.getElementById("tx-continue").addEventListener("click", () => {
    AppStateTx.pending = null;
    saveTx();
    announceTx("");
  });
  document.getElementById("tx-next-kingdom").addEventListener("click", () => {
    AppStateTx.game = TrixCore.nextKingdom(AppStateTx.game);
    AppStateTx.pending = null;
    saveTx();
    announceTx("Kingdom " + (AppStateTx.game.kingdom + 1) + " / 4.");
  });
  document.getElementById("tx-end-game").addEventListener("click", () => {
    AppStateTx.game = TrixCore.endGame(AppStateTx.game);
    AppStateTx.pending = null;
    endGameTx();
  });
  document.getElementById("tx-show-hand").addEventListener("click", () => {
    AppStateTx.revealed = true;
    AppStateTx.shownFor = actorTx();
    announceTx("");
  });

  setMode("vs-ai");

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(TX_SAVE_KEY) : null;
  if (saved && saved.game && !saved.game.gameOver) {
    AppStateTx.mode = saved.mode;
    AppStateTx.humans = saved.humans;
    AppStateTx.aiLevel = saved.aiLevel;
    AppStateTx.game = saved.game;
    AppStateTx.pending = saved.pending || null;
    AppStateTx.started = true;
    AppStateTx.revealed = saved.mode !== "hotseat";
    AppStateTx.shownFor = null;
    setMode(saved.mode);
    showBoardTx();
    announceTx("");
  }
}

function showBoardTx() {
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameTx(mode, humans, level) {
  AppStateTx.mode = mode;
  AppStateTx.humans = [0, 1, 2, 3].map((p) => p < humans);
  AppStateTx.aiLevel = level;
  AppStateTx.game = TrixCore.createGame();
  AppStateTx.started = true;
  AppStateTx.busy = false;
  AppStateTx.showTrick = null;
  AppStateTx.pending = null;
  AppStateTx.recorded = false;
  AppStateTx.revealed = mode !== "hotseat";
  AppStateTx.shownFor = null;
  showBoardTx();
  saveTx();
  announceTx("Kingdom 1 / 4. " + playerNameTx(AppStateTx.game.owner) + " holds the Seven of Hearts and owns the first kingdom.");
}

function promptTx() {
  const g = AppStateTx.game;
  if (!g.deal) return "Choose a contract.";
  const d = g.deal;
  if (d.contract === "trix") {
    return TrixCore.legalCards(d, d.turn).length ? "Lay a card on a row." : "No card fits: pass.";
  }
  return d.trick.length ? "Play a card." : "Lead a card.";
}

// Says who has to act, covers hands on a shared device, and hands over
// to the computer.
function announceTx(prefix) {
  const g = AppStateTx.game;
  const pre = prefix ? prefix + " " : "";
  if (g.gameOver) {
    endGameTx();
    return;
  }
  if (AppStateTx.pending) {
    renderTx();
    return;
  }
  const actor = actorTx();
  if (isAiTx(actor)) {
    if (AppStateTx.mode === "hotseat" && AppStateTx.revealed && nextHumanTx(actor) !== AppStateTx.shownFor) {
      AppStateTx.revealed = false;
      AppStateTx.shownFor = null;
    }
    setStatusTx(pre + playerNameTx(actor) + "'s turn.");
    renderTx();
    continueTx();
    return;
  }
  if (AppStateTx.mode === "hotseat" && AppStateTx.shownFor !== actor) {
    AppStateTx.revealed = false;
    setStatusTx(pre + "Pass the device to " + playerNameTx(actor) + ".");
    renderTx();
    return;
  }
  setStatusTx(pre + playerNameTx(actor) + "'s turn. " + promptTx());
  renderTx();
}

function continueTx() {
  if (AppStateTx.busy || AppStateTx.showTrick || AppStateTx.pending) return;
  AppStateTx.busy = true;
  setTimeout(aiTurnTx, AiPacing.delay(700));
}

function aiTurnTx() {
  AppStateTx.busy = false;
  const g = AppStateTx.game;
  if (g.gameOver || AppStateTx.showTrick || AppStateTx.pending) return;
  const actor = actorTx();
  if (!isAiTx(actor)) return;
  if (!g.deal) chooseTx(TrixAi.chooseContract(g, AppStateTx.aiLevel));
  else moveTx(TrixAi.chooseMove(g, AppStateTx.aiLevel));
}

function chooseTx(contract) {
  const g = AppStateTx.game;
  const r = TrixCore.chooseContract(g, contract);
  if (!r.ok) return;
  AppStateTx.game = r.game;
  saveTx();
  announceTx(playerNameTx(g.owner) + " chooses " + TX_CONTRACT_NAME[contract] + ".");
}

function moveTx(move) {
  const before = AppStateTx.game;
  const d0 = before.deal;
  const p = d0.turn;
  const r = TrixCore.play(before, move);
  if (!r.ok) return false;
  AppStateTx.game = r.game;
  let msg = move.pass ? playerNameTx(p) + " passed." : playerNameTx(p) + " plays " + cardTextTx(move.card) + ".";
  const g = r.game;
  if (d0.contract === "trix" && !move.pass) {
    const d = r.dealDone ? null : g.deal;
    const place = d ? d.lastMove.finishedPlace : null;
    if (place) msg += " " + playerNameTx(p) + " has no cards left and gets " + TrixCore.TRIX_POINTS[place - 1] + " points.";
  }
  if (r.trickDone || (r.dealDone && d0.contract !== "trix")) {
    const lt = r.dealDone ? lastTrickOf(before, move) : g.deal.lastTrick;
    msg += " " + playerNameTx(lt.winner) + (lt.points ? " takes the trick with " + (-lt.points) + " penalty points." : " takes the trick.");
    AppStateTx.showTrick = lt;
  }
  if (r.dealDone) {
    msg += " The contract " + TX_CONTRACT_NAME[d0.contract] + " is over.";
    AppStateTx.pending = g.kingdomOver ? "kingdom" : "continue";
    if (g.kingdomOver) msg += " Kingdom " + (g.kingdom + 1) + " is over.";
  }
  saveTx();
  if (AppStateTx.showTrick) {
    setStatusTx(msg);
    renderTx();
    setTimeout(() => {
      AppStateTx.showTrick = null;
      if (AppStateTx.game.gameOver) endGameTx();
      else if (AppStateTx.pending) { setStatusTx(msg); renderTx(); }
      else announceTx("");
    }, AiPacing.delay(1500));
    return true;
  }
  if (AppStateTx.pending) {
    if (g.gameOver) { endGameTx(msg); return true; }
    setStatusTx(msg);
    renderTx();
    return true;
  }
  announceTx(msg);
  return true;
}

// The last trick of a deal that just ended (the deal itself is gone from
// the game state by then): replay the move on a copy of the deal.
function lastTrickOf(before, move) {
  const d = JSON.parse(JSON.stringify(before.deal));
  const trick = d.trick.concat([{ player: d.turn, card: move.card }]);
  const w = trick[TrixCore.winningIndex(trick)].player;
  let pts = 0;
  trick.forEach((e) => { pts += TrixCore.cardPenalty(d.contract, e.card); });
  if (d.contract === "tricks") pts = -15;
  return { cards: trick, winner: w, points: pts };
}

function endGameTx(prefix) {
  const g = AppStateTx.game;
  const pre = prefix ? prefix + " " : "";
  const top = Math.max.apply(null, g.totals);
  const winners = [0, 1, 2, 3].filter((p) => g.totals[p] === top);
  const names = winners.map(playerNameTx).join(", ");
  const text = pre + (winners.length === 1 ? names + " wins the game." : "Draw: " + names + " share first place.");
  if (!AppStateTx.recorded) {
    AppStateTx.recorded = true;
    if (AppStateTx.mode === "vs-ai" && typeof GameStats !== "undefined") {
      GameStats.record("trix", winners.indexOf(0) === -1 ? "loss" : (winners.length === 1 ? "win" : "draw"));
    }
    if (window.ResultModal) {
      const title = AppStateTx.mode === "vs-ai"
        ? (winners.indexOf(0) === -1 ? "You lose" : (winners.length === 1 ? "You win!" : "Draw"))
        : text;
      window.ResultModal.show(title, text);
    }
  }
  setStatusTx(text);
  saveTx();
  renderTx();
}

/*** Human input ***/

function humanReadyTx() {
  const g = AppStateTx.game;
  if (!AppStateTx.started || g.gameOver || AppStateTx.showTrick || AppStateTx.pending) return false;
  if (isAiTx(actorTx())) {
    setStatusTx("Computer thinking…");
    return false;
  }
  if (AppStateTx.mode === "hotseat" && (!AppStateTx.revealed || AppStateTx.shownFor !== actorTx())) return false;
  return true;
}

function humanChooseTx(contract) {
  if (!humanReadyTx() || AppStateTx.game.deal) return;
  chooseTx(contract);
}

function humanMoveTx(move) {
  if (!humanReadyTx() || !AppStateTx.game.deal) return;
  const d = AppStateTx.game.deal;
  if (move.pass) {
    if (TrixCore.legalCards(d, d.turn).length) {
      setStatusTx("A card of yours fits a row, so you can't pass.");
      return;
    }
    moveTx(move);
    return;
  }
  const problem = TrixCore.playProblem(d, move.card);
  if (problem === "follow") {
    setStatusTx(TX_FOLLOW_TEXT[d.trick[0].card.suit]);
    return;
  }
  if (problem === "king-must") {
    setStatusTx("You can't follow suit and hold the King of Hearts: you have to play it.");
    return;
  }
  if (problem === "jack-first") {
    setStatusTx("A row starts with its Jack.");
    return;
  }
  if (problem === "row") {
    setStatusTx("That card doesn't fit: a row grows one card at a time, up from the Jack to the Ace and down to the Two.");
    return;
  }
  if (problem) return;
  moveTx(move);
}

/*** Rendering ***/

function cardElTx(card, tag, extraClass) {
  const el = document.createElement(tag);
  if (tag === "button") el.type = "button";
  else el.setAttribute("role", "img");
  el.className = "pc-card" + (extraClass ? " " + extraClass : "");
  CardFaces.renderTall(el, card);
  return el;
}

function handOwnerTx() {
  if (AppStateTx.mode === "vs-ai") return 0;
  return AppStateTx.revealed ? AppStateTx.shownFor : null;
}

function renderTx() {
  const g = AppStateTx.game;
  if (!g) return;
  const d = g.deal;
  const over = g.gameOver;
  const shown = AppStateTx.showTrick;

  // Contract, kingdom, contracts done
  const lastDeal = g.history.length ? g.history[g.history.length - 1] : null;
  // Between deals (and while the last trick is still shown) the finished
  // contract and its points stay on screen.
  const showLast = !d && lastDeal && (AppStateTx.pending || shown || over);
  const contract = d ? d.contract : (showLast ? lastDeal.contract : null);
  I18n.setMsg(document.getElementById("tx-contract"), contract ? TX_CONTRACT_NAME[contract] : (over ? "" : "Choose a contract."));
  I18n.setMsg(document.getElementById("tx-kingdom"), "Kingdom " + (g.kingdom + 1) + " / 4: " + playerNameTx(g.owner));
  const listEl = document.getElementById("tx-contract-list");
  listEl.innerHTML = "";
  TrixCore.CONTRACTS.forEach((c) => {
    const item = document.createElement("span");
    const done = g.done.indexOf(c) !== -1;
    const now = d && d.contract === c;
    item.className = "tx-contract-item" + (done ? " tx-contract-done" : "") + (now ? " tx-contract-now" : "");
    const mark = document.createElement("span");
    mark.className = "tx-contract-mark";
    mark.textContent = done ? "✓" : (now ? "▶" : "·");
    mark.setAttribute("aria-hidden", "true");
    item.appendChild(mark);
    const name = document.createElement("span");
    I18n.setMsg(name, TX_CONTRACT_NAME[c]);
    item.appendChild(name);
    listEl.appendChild(item);
  });

  // Score board: always visible
  const playersEl = document.getElementById("tx-players");
  playersEl.innerHTML = "";
  for (let p = 0; p < 4; p++) {
    const row = document.createElement("div");
    const active = !over && !shown && !AppStateTx.pending && p === actorTx();
    row.className = "tx-player" + (active ? " tx-player-active" : "");
    const head = document.createElement("div");
    head.className = "tx-player-head";
    const name = document.createElement("span");
    name.className = "tx-player-name";
    let nm = playerNameTx(p);
    if (AppStateTx.mode === "vs-ai") nm = p === 0 ? nm + " (you)" : nm + " (computer)";
    else if (isAiTx(p)) nm = nm + " (computer)";
    if (active) {
      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "▶";
      head.appendChild(arrow);
    }
    I18n.setMsg(name, nm);
    head.appendChild(name);
    head.appendChild(document.createTextNode(" "));
    const total = document.createElement("span");
    total.className = "tx-total";
    total.textContent = "Σ " + formatSignedTx(g.totals[p]);
    head.appendChild(total);
    head.appendChild(document.createTextNode(" "));
    if (d || showLast) {
      const now = document.createElement("span");
      now.className = "tx-deal-score";
      now.textContent = formatSignedTx(d ? d.scores[p] : lastDeal.scores[p]);
      head.appendChild(now);
    }
    row.appendChild(head);
    // This deal: penalty cards taken, tricks, or Trix place.
    if (d) {
      const info = document.createElement("div");
      info.className = "tx-player-info";
      if (d.contract === "tricks") {
        const n = d.trickCount[p];
        const t = document.createElement("span");
        I18n.setMsg(t, n === 1 ? "1 trick" : n + " tricks");
        info.appendChild(t);
      } else if (d.contract === "trix") {
        const place = d.finished.indexOf(p);
        const t = document.createElement("span");
        if (place !== -1) I18n.setMsg(t, "Place " + (place + 1));
        else I18n.setMsg(t, d.hands[p].length === 1 ? "1 card" : d.hands[p].length + " cards");
        info.appendChild(t);
      } else {
        d.taken[p].filter((c) => TrixCore.isPenaltyCard(d.contract, c)).forEach((c) => {
          const el = cardElTx(c, "span", "pc-card-mini");
          I18n.setAria(el, "Card " + cardTextTx(c));
          info.appendChild(el);
        });
      }
      row.appendChild(info);
    }
    playersEl.appendChild(row);
  }

  // Choosing a contract
  const choosing = !over && !d && !AppStateTx.pending && !shown;
  const chooseEl = document.getElementById("tx-choose");
  const ownerHuman = !isAiTx(g.owner);
  const canChoose = choosing && ownerHuman && (AppStateTx.mode === "vs-ai" || (AppStateTx.revealed && AppStateTx.shownFor === g.owner));
  chooseEl.classList.toggle("hidden", !canChoose);
  if (canChoose) {
    I18n.setMsg(document.getElementById("tx-choose-text"), "Choose a contract.");
    const left = TrixCore.remainingContracts(g);
    chooseEl.querySelectorAll("button[data-contract]").forEach((btn) => {
      btn.classList.toggle("hidden", left.indexOf(btn.getAttribute("data-contract")) === -1);
    });
  }

  // Trick or Trix rows
  const trickEl = document.getElementById("tx-trick");
  const rowsEl = document.getElementById("tx-rows");
  const isTrix = contract === "trix" && d;
  trickEl.classList.toggle("hidden", !(d && !isTrix) && !shown);
  rowsEl.classList.toggle("hidden", !isTrix);
  if (!trickEl.classList.contains("hidden")) renderTrickTx(trickEl, shown ? shown.cards : d.trick, shown);
  if (isTrix) renderRowsTx(rowsEl, d);

  // Buttons
  const owner = handOwnerTx();
  const myTurn = !!d && !shown && !AppStateTx.pending && !over && owner !== null && d.turn === owner && !isAiTx(d.turn);
  document.getElementById("tx-pass").classList.toggle("hidden", !(myTurn && isTrix && !TrixCore.legalCards(d, d.turn).length));
  document.getElementById("tx-continue").classList.toggle("hidden", !(AppStateTx.pending === "continue" && !shown));
  document.getElementById("tx-next-kingdom").classList.toggle("hidden", !(AppStateTx.pending === "kingdom" && !shown && !over));
  document.getElementById("tx-end-game").classList.toggle("hidden", !(AppStateTx.pending === "kingdom" && !shown && !over));

  // Hand
  const coverNeeded = AppStateTx.mode === "hotseat" && !AppStateTx.revealed && !over && !AppStateTx.pending;
  const cover = document.getElementById("tx-hand-cover");
  cover.classList.toggle("hidden", !coverNeeded);
  if (coverNeeded) {
    I18n.setMsg(document.getElementById("tx-hand-cover-text"), "Pass the device to " + playerNameTx(nextHumanTx(actorTx())) + ".");
    document.getElementById("tx-show-hand").classList.toggle("hidden", isAiTx(actorTx()) || !!shown);
  }
  const handEl = document.getElementById("tx-hand");
  handEl.innerHTML = "";
  const hand = owner === null ? null : (d ? d.hands[owner] : (g.hands ? g.hands[owner] : null));
  handEl.classList.toggle("hidden", coverNeeded || over || !hand);
  if (coverNeeded || over || !hand) return;
  const legal = myTurn ? TrixCore.legalCards(d, owner) : [];
  hand.forEach((c) => {
    const playable = legal.some((x) => TrixCore.sameCard(x, c));
    let cls = "";
    if (myTurn && isTrix && playable) cls = "tx-playable";
    else if (myTurn && !playable) cls = "pc-card-dim";
    const btn = cardElTx(c, "button", cls);
    btn.disabled = !myTurn;
    I18n.setAria(btn, "Card " + cardTextTx(c) + (myTurn && isTrix && playable ? ", fits" : ""));
    btn.addEventListener("click", () => humanMoveTx({ card: c }));
    handEl.appendChild(btn);
  });
}

function renderTrickTx(el, cards, shown) {
  el.innerHTML = "";
  const winIdx = shown ? TrixCore.winningIndex(shown.cards) : -1;
  for (let p = 0; p < 4; p++) {
    const slot = document.createElement("div");
    const k = cards.findIndex((e) => e.player === p);
    const isWin = shown && k === winIdx;
    slot.className = "dk-slot" + (isWin ? " dk-slot-win" : "");
    const label = document.createElement("span");
    label.className = "dk-slot-name";
    I18n.setMsg(label, playerNameTx(p));
    slot.appendChild(label);
    if (k !== -1) {
      const card = cardElTx(cards[k].card, "span", "pc-card-small");
      I18n.setAria(card, "Card " + cardTextTx(cards[k].card));
      slot.appendChild(card);
    } else {
      const empty = document.createElement("span");
      empty.className = "pc-card pc-card-small dk-slot-empty";
      empty.setAttribute("aria-hidden", "true");
      slot.appendChild(empty);
    }
    const mark = document.createElement("span");
    mark.className = "dk-slot-mark";
    if (isWin) I18n.setMsg(mark, "takes");
    slot.appendChild(mark);
    el.appendChild(slot);
  }
}

function renderRowsTx(el, d) {
  el.innerHTML = "";
  TrixCore.SUITS.forEach((suit) => {
    const row = document.createElement("div");
    row.className = "tx-row";
    const head = document.createElement("span");
    head.className = "tx-row-suit";
    head.innerHTML = CardFaces.suitSvg(suit);
    row.appendChild(head);
    const r = d.rows[suit];
    if (!r) {
      const empty = document.createElement("span");
      empty.className = "tx-row-empty";
      I18n.setMsg(empty, "Waiting for the Jack");
      row.appendChild(empty);
    } else {
      for (let rank = r.low; rank <= r.high; rank++) {
        const c = cardElTx({ rank, suit }, "span", "pc-card-mini" + (rank === 11 ? " tx-row-jack" : ""));
        c.removeAttribute("role");
        c.setAttribute("aria-hidden", "true");
        row.appendChild(c);
      }
      const label = CardFaces.labelAny({ rank: r.low, suit }) + " – " + CardFaces.labelAny({ rank: r.high, suit });
      row.setAttribute("role", "img");
      row.setAttribute("aria-label", label);
    }
    el.appendChild(row);
  });
}

function formatSignedTx(n) {
  return n > 0 ? "+" + n : String(n);
}

document.addEventListener("DOMContentLoaded", initTrixApp);
