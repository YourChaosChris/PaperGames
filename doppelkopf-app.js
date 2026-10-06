// doppelkopf-app.js
// Wires DoppelkopfCore/DoppelkopfAi to doppelkopf.html.
//
// Four seats, always: against the computer you are Player 1 and the other
// three are computer players; on one device 2-4 people share the seats and
// the computer takes the rest. Deals follow one another with a running
// score; the dealer moves on each time.
//
// Layout: the game type ("Normal game" or the marriage) and the trick
// number at the top with a button that opens the trump order; the four
// players with their party (Re, Kontra or "?" while it isn't known yet),
// tricks and score; the trick as four seats; the hand below with the
// trumps in a row of their own above the plain suits. A finished trick
// stays on the table for a moment (AiPacing) before the next one starts.
// Cards that can't be played sit lower with a dashed border; tapping one
// says why.

const DK_SAVE_KEY = "einkchess_save_doppelkopf";
const DK_SUIT_PLURAL = { C: "Clubs", S: "Spades", H: "Hearts" };

const AppStateDk = {
  mode: "vs-ai",
  humans: [true, false, false, false],
  aiLevel: 2,
  state: null,
  totals: [0, 0, 0, 0],
  dealNo: 0,
  started: false,
  busy: false,
  showTrick: null,   // a finished trick still shown on the table
  revealed: true,
  shownFor: null
};

// Against the computer the human is "You" and the computers "Computer 1"
// to "Computer 3"; on one device the seats are "Player 1" to "Player 4"
// (also the seats the computer fills there). Sentences about the human
// have their own wording, they are not built from the name.
function playerNameDk(i) {
  if (AppStateDk.mode === "vs-ai") return i === 0 ? "You" : "Computer " + i;
  return "Player " + (i + 1);
}

function isYouDk(i) {
  return AppStateDk.mode === "vs-ai" && i === 0;
}

function isAiDk(i) {
  return !AppStateDk.humans[i];
}

function cardTextDk(card) {
  return CardFaces.labelAny(card);
}

function setStatusDk(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function saveDk() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(DK_SAVE_KEY, {
    mode: AppStateDk.mode,
    humans: AppStateDk.humans,
    aiLevel: AppStateDk.aiLevel,
    state: AppStateDk.state,
    totals: AppStateDk.totals,
    dealNo: AppStateDk.dealNo
  });
}

// The player whose private knowledge the screen shows, or null while a
// hotseat hand is covered.
// The next seat (from the one to play) that a person plays.
function nextHumanDk(s) {
  let p = s.turn;
  for (let k = 0; k < 4 && isAiDk(p); k++) p = (p + 1) % 4;
  return p;
}

function viewerDk() {
  if (AppStateDk.mode === "vs-ai") return 0;
  if (!AppStateDk.revealed) return null;
  return AppStateDk.shownFor;
}

/*** Game flow ***/

function initDoppelkopfApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeAi = document.getElementById("mode-offline-ai");
  const humansWrap = document.getElementById("dk-humans-wrap");
  const humansSelect = document.getElementById("dk-humans");
  const levelSelect = document.getElementById("dk-level-inline");
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

  document.getElementById("start-doppelkopf-game").addEventListener("click", () => {
    const humans = pendingMode === "hotseat" ? parseInt(humansSelect.value, 10) : 1;
    const level = parseInt(levelSelect.value, 10);
    startGameDk(pendingMode, humans, level);
    const status = document.getElementById("offline-doppelkopf-status");
    if (status) {
      const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
      I18n.setMsg(status, pendingMode === "vs-ai"
        ? "Computer opponents: 3 · computer level: " + levelNames[level]
        : (humans === 4 ? "Four players on this device." : humans + " players on this device, the computer plays the other seats."));
    }
  });

  document.getElementById("dk-trump-toggle").addEventListener("click", () => {
    document.getElementById("dk-trump-order").classList.toggle("hidden");
  });
  document.getElementById("dk-next-deal").addEventListener("click", nextDealDk);
  document.getElementById("dk-show-hand").addEventListener("click", () => {
    const s = AppStateDk.state;
    AppStateDk.revealed = true;
    AppStateDk.shownFor = s.turn;
    setStatusDk(playerNameDk(s.turn) + "'s turn. " + promptTextDk());
    renderDk();
  });

  renderTrumpOrderDk();
  setMode("vs-ai");

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(DK_SAVE_KEY) : null;
  if (saved && saved.state) {
    AppStateDk.mode = saved.mode;
    AppStateDk.humans = saved.humans;
    AppStateDk.aiLevel = saved.aiLevel;
    AppStateDk.state = saved.state;
    AppStateDk.totals = saved.totals || [0, 0, 0, 0];
    AppStateDk.dealNo = saved.dealNo || 1;
    AppStateDk.started = true;
    AppStateDk.revealed = saved.mode !== "hotseat";
    AppStateDk.shownFor = null;
    setMode(saved.mode);
    showBoardDk();
    if (AppStateDk.state.dealOver) {
      setStatusDk(resultTextDk());
      renderDk();
    } else {
      announceTurnDk("");
    }
  }
}

function showBoardDk() {
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

function startGameDk(mode, humans, level) {
  AppStateDk.mode = mode;
  AppStateDk.humans = [0, 1, 2, 3].map((p) => p < humans);
  AppStateDk.aiLevel = level;
  AppStateDk.totals = [0, 0, 0, 0];
  AppStateDk.dealNo = 0;
  AppStateDk.started = true;
  showBoardDk();
  dealDk(3);
}

// Deals a new game; the player after `dealer` leads.
function dealDk(dealer) {
  AppStateDk.state = DoppelkopfCore.createDeal(dealer);
  AppStateDk.dealNo++;
  AppStateDk.busy = false;
  AppStateDk.showTrick = null;
  AppStateDk.revealed = AppStateDk.mode !== "hotseat";
  AppStateDk.shownFor = null;
  const s = AppStateDk.state;
  let msg = "Deal " + AppStateDk.dealNo + ".";
  if (s.marriage) {
    msg += isYouDk(s.marriage.player) ? " You have both Queens of Clubs: marriage." : " " + playerNameDk(s.marriage.player) + " has both Queens of Clubs: marriage.";
  }
  saveDk();
  announceTurnDk(msg);
}

function nextDealDk() {
  const s = AppStateDk.state;
  if (!s || !s.dealOver) return;
  dealDk((s.dealer + 1) % 4);
}

function promptTextDk() {
  const s = AppStateDk.state;
  if (!s.trick.length) return "Lead a card.";
  return "Play a card.";
}

// Says whose turn it is, covers the hand when another person has to play
// on a shared device, and hands over to the computer.
function announceTurnDk(prefix) {
  const s = AppStateDk.state;
  const pre = prefix ? prefix + " " : "";
  if (s.dealOver) {
    endDealDk(pre);
    return;
  }
  if (isAiDk(s.turn)) {
    // On a shared device, cover the last hand while the computer plays
    // unless the same person is next.
    if (AppStateDk.mode === "hotseat" && AppStateDk.revealed) {
      let next = s.turn;
      while (isAiDk(next)) next = (next + 1) % 4;
      if (next !== AppStateDk.shownFor) {
        AppStateDk.revealed = false;
        AppStateDk.shownFor = null;
      }
    }
    setStatusDk(pre + playerNameDk(s.turn) + "'s turn.");
    renderDk();
    continueDk();
    return;
  }
  if (AppStateDk.mode === "hotseat" && AppStateDk.shownFor !== s.turn) {
    AppStateDk.revealed = false;
    setStatusDk(pre + "Pass the device to " + playerNameDk(s.turn) + ".");
    renderDk();
    return;
  }
  setStatusDk(pre + (isYouDk(s.turn) ? "Your turn. " : playerNameDk(s.turn) + "'s turn. ") + promptTextDk());
  renderDk();
}

function continueDk() {
  const s = AppStateDk.state;
  if (s.dealOver || !isAiDk(s.turn) || AppStateDk.busy || AppStateDk.showTrick) return;
  AppStateDk.busy = true;
  setTimeout(aiTurnDk, AiPacing.delay(700));
}

function aiTurnDk() {
  AppStateDk.busy = false;
  const s = AppStateDk.state;
  if (s.dealOver || !isAiDk(s.turn) || AppStateDk.showTrick) return;
  playDk(DoppelkopfAi.chooseMove(s, AppStateDk.aiLevel));
}

function playDk(card) {
  const before = AppStateDk.state;
  const r = DoppelkopfCore.playCard(before, card);
  if (!r.ok) return false;
  AppStateDk.state = r.state;
  const you = isYouDk(before.turn);
  let msg = you ? "You play " + cardTextDk(card) + "." : playerNameDk(before.turn) + " plays " + cardTextDk(card) + ".";
  if (DoppelkopfCore.isClubQueen(card) && !before.marriage && !before.revealed[before.turn]) {
    msg += you ? " You play Re." : " " + playerNameDk(before.turn) + " plays Re.";
  }
  saveDk();
  if (!r.trickDone) {
    announceTurnDk(msg);
    return true;
  }
  // The trick stays on the table for a moment.
  const lt = r.state.lastTrick;
  msg += isYouDk(lt.winner) ? " You win the trick with " + lt.points + " points." : " " + playerNameDk(lt.winner) + " wins the trick with " + lt.points + " points.";
  if (lt.partnerFound !== undefined) msg += isYouDk(lt.partnerFound) ? " You become the partner of the marriage." : " " + playerNameDk(lt.partnerFound) + " becomes the partner of the marriage.";
  if (lt.marriageAlone) msg += isYouDk(before.marriage.player) ? " No partner within three tricks: you play alone against the other three." : " No partner within three tricks: " + playerNameDk(before.marriage.player) + " plays alone against the other three.";
  AppStateDk.showTrick = lt;
  setStatusDk(msg);
  renderDk();
  setTimeout(() => {
    AppStateDk.showTrick = null;
    announceTurnDk("");
  }, AiPacing.delay(1600));
  return true;
}

function resultTextDk() {
  const r = AppStateDk.state.result;
  const pts = r.winner === "re" ? r.re : r.kontra;
  return (r.winner === "re" ? "Re wins with " : "Kontra wins with ") + pts + " points.";
}

function endDealDk(prefix) {
  const s = AppStateDk.state;
  const r = s.result;
  if (!s.scored) {
    s.scored = true;
    for (let p = 0; p < 4; p++) AppStateDk.totals[p] += r.deltas[p];
    if (AppStateDk.mode === "vs-ai" && typeof GameStats !== "undefined") {
      GameStats.record("doppelkopf", r.deltas[0] > 0 ? "win" : (r.deltas[0] < 0 ? "loss" : "draw"));
    }
    saveDk();
  }
  setStatusDk(prefix + resultTextDk());
  renderDk();
}

/*** Human input ***/

function onHandCardDk(card) {
  const s = AppStateDk.state;
  if (!AppStateDk.started || s.dealOver || AppStateDk.showTrick) return;
  if (isAiDk(s.turn)) {
    setStatusDk("Computer thinking…");
    return;
  }
  if (AppStateDk.mode === "hotseat" && !AppStateDk.revealed) return;
  const problem = DoppelkopfCore.playProblem(s, card);
  if (problem === "follow") {
    const led = DoppelkopfCore.suitOf(s.trick[0].card);
    setStatusDk(led === "T"
      ? "Trump was led: you have to play a trump. The Queens, Jacks, Diamonds and Heart Tens are trumps."
      : DK_SUIT_PLURAL[led] + " were led: you have to play " + DK_SUIT_PLURAL[led] + " (not a Queen or Jack - those are trumps).");
    return;
  }
  if (problem) return;
  playDk(card);
}

/*** Rendering ***/

function cardElDk(card, tag, extraClass) {
  const el = document.createElement(tag);
  if (tag === "button") el.type = "button";
  else el.setAttribute("role", "img");
  el.className = "pc-card" + (extraClass ? " " + extraClass : "");
  CardFaces.renderTall(el, card);
  return el;
}

function renderTrumpOrderDk() {
  const wrap = document.getElementById("dk-trump-order-cards");
  wrap.innerHTML = "";
  DoppelkopfCore.TRUMP_ORDER.forEach((c) => {
    const el = cardElDk(c, "span", "pc-card-small dk-order-card");
    I18n.setAria(el, "Card " + cardTextDk(c));
    wrap.appendChild(el);
  });
}

function partyLabelDk(s, viewer, p) {
  const known = viewer === null
    ? (s.revealed[p] ? s.party[p] : null)
    : DoppelkopfCore.knownParty(s, viewer, p);
  if (known === "re") return "Re";
  if (known === "kontra") return "Kontra";
  return "?";
}

function renderDk() {
  const s = AppStateDk.state;
  if (!s) return;
  const over = s.dealOver;
  const viewer = viewerDk();

  // Game type and trick number
  const typeEl = document.getElementById("dk-game-type");
  let type = "Normal game";
  if (s.marriage) {
    if (s.marriage.open) type = isYouDk(s.marriage.player) ? "Marriage: you are looking for a partner" : "Marriage: " + playerNameDk(s.marriage.player) + " is looking for a partner";
    else if (s.marriage.alone) type = isYouDk(s.marriage.player) ? "Marriage: you play alone" : "Marriage: " + playerNameDk(s.marriage.player) + " plays alone";
    else type = "Marriage: " + playerNameDk(s.marriage.player) + " and " + playerNameDk(s.marriage.partner);
  }
  I18n.setMsg(typeEl, type);
  const shown = AppStateDk.showTrick;
  const trickNo = Math.min(s.trickNo + (shown ? 0 : 1), 12);
  I18n.setMsg(document.getElementById("dk-trick-no"), "Trick " + trickNo + " / 12");

  // Players
  const playersEl = document.getElementById("dk-players");
  playersEl.innerHTML = "";
  for (let p = 0; p < 4; p++) {
    const row = document.createElement("div");
    row.className = "game-player" + (p === s.turn && !over && !shown ? " game-player-active" : "");
    const name = document.createElement("span");
    name.className = "game-player-name";
    let nm = playerNameDk(p);
    // On one device the seats the computer fills are still marked.
    if (AppStateDk.mode !== "vs-ai" && isAiDk(p)) nm = nm + " (computer)";
    I18n.setMsg(name, nm);
    row.appendChild(name);
    row.appendChild(document.createTextNode(" "));
    const party = document.createElement("span");
    party.className = "dk-party";
    I18n.setMsg(party, partyLabelDk(s, viewer, p));
    row.appendChild(party);
    row.appendChild(document.createTextNode(" "));
    const tricks = document.createElement("span");
    tricks.className = "game-player-count";
    const n = s.won[p].length;
    I18n.setMsg(tricks, n === 1 ? "1 trick" : n + " tricks");
    row.appendChild(tricks);
    row.appendChild(document.createTextNode(" "));
    const score = document.createElement("span");
    score.className = "pc-player-extra dk-total";
    score.textContent = "Σ " + formatSignedDk(AppStateDk.totals[p]);
    row.appendChild(score);
    playersEl.appendChild(row);
  }

  // The trick: four fixed seats.
  const trickEl = document.getElementById("dk-trick");
  trickEl.innerHTML = "";
  const cards = shown ? shown.cards : s.trick;
  const winIdx = shown ? DoppelkopfCore.winningIndex(shown.cards) : -1;
  for (let p = 0; p < 4; p++) {
    const slot = document.createElement("div");
    const k = cards.findIndex((e) => e.player === p);
    const isWin = shown && k === winIdx;
    slot.className = "dk-slot" + (isWin ? " dk-slot-win" : "");
    const label = document.createElement("span");
    label.className = "dk-slot-name";
    I18n.setMsg(label, playerNameDk(p));
    slot.appendChild(label);
    if (k !== -1) {
      const el = cardElDk(cards[k].card, "span", "pc-card-small");
      I18n.setAria(el, "Card " + cardTextDk(cards[k].card));
      slot.appendChild(el);
    } else {
      const empty = document.createElement("span");
      empty.className = "pc-card pc-card-small dk-slot-empty";
      empty.setAttribute("aria-hidden", "true");
      slot.appendChild(empty);
    }
    const mark = document.createElement("span");
    mark.className = "dk-slot-mark";
    if (isWin) I18n.setMsg(mark, "wins");
    slot.appendChild(mark);
    trickEl.appendChild(slot);
  }

  // Score after the deal
  const scoreEl = document.getElementById("dk-score");
  scoreEl.classList.toggle("hidden", !over);
  if (over) renderScoreDk(scoreEl, s);
  document.getElementById("dk-next-deal").classList.toggle("hidden", !over);

  // Hand
  const hidden = AppStateDk.mode === "hotseat" && !AppStateDk.revealed && !over;
  const cover = document.getElementById("dk-hand-cover");
  cover.classList.toggle("hidden", !hidden);
  if (hidden) I18n.setMsg(document.getElementById("dk-hand-cover-text"), "Pass the device to " + playerNameDk(nextHumanDk(s)) + ".");
  document.getElementById("dk-show-hand").classList.toggle("hidden", isAiDk(s.turn) || !!shown);
  const handEl = document.getElementById("dk-hand");
  const handOwner = AppStateDk.mode === "vs-ai" ? 0 : AppStateDk.shownFor;
  handEl.classList.toggle("hidden", hidden || over || handOwner === null);
  if (hidden || over || handOwner === null) return;
  const myTurn = !shown && s.turn === handOwner && !isAiDk(s.turn);
  const hand = s.hands[handOwner];
  const trumps = hand.filter(DoppelkopfCore.isTrump)
    .sort((a, b) => DoppelkopfCore.trumpStrength(b) - DoppelkopfCore.trumpStrength(a));
  const suitOrder = ["C", "S", "H"];
  const plainRank = { 14: 4, 10: 3, 13: 2, 9: 1 };
  const plain = hand.filter((c) => !DoppelkopfCore.isTrump(c))
    .sort((a, b) => suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit) || plainRank[b.rank] - plainRank[a.rank]);
  const legal = myTurn ? DoppelkopfCore.legalCards(s, handOwner) : [];
  function fill(el, list) {
    el.innerHTML = "";
    list.forEach((c) => {
      const playable = legal.some((x) => DoppelkopfCore.sameCard(x, c));
      const btn = cardElDk(c, "button", myTurn && !playable ? "pc-card-dim" : "");
      btn.disabled = !myTurn;
      I18n.setAria(btn, "Card " + cardTextDk(c));
      btn.addEventListener("click", () => onHandCardDk(c));
      el.appendChild(btn);
    });
  }
  I18n.setMsg(document.getElementById("dk-trumps-label"), "Trumps: " + trumps.length);
  I18n.setMsg(document.getElementById("dk-plain-label"), "Plain suits: " + plain.length);
  fill(document.getElementById("dk-hand-trumps"), trumps);
  fill(document.getElementById("dk-hand-plain"), plain);
}

function formatSignedDk(n) {
  return n > 0 ? "+" + n : String(n);
}

const DK_ITEM_TEXT = {
  won: "Won",
  against: "Against the Queens of Clubs",
  no90: "Losers under 90",
  no60: "Losers under 60",
  no30: "Losers under 30",
  black: "Losers without a trick",
  doppelkopf: "Doppelkopf (trick of 40 or more)",
  fox: "Fox caught (Diamond Ace)",
  charlie: "Charlie (last trick with the Jack of Clubs)"
};

function renderScoreDk(el, s) {
  const r = s.result;
  el.innerHTML = "";
  const head = document.createElement("p");
  head.className = "dk-score-head";
  I18n.setMsg(head, resultTextDk());
  el.appendChild(head);
  ["re", "kontra"].forEach((party) => {
    const line = document.createElement("p");
    const names = [0, 1, 2, 3].filter((p) => s.party[p] === party);
    const label = document.createElement("span");
    I18n.setMsg(label, (party === "re" ? "Re: " : "Kontra: ") + (party === "re" ? r.re : r.kontra) + " points");
    line.appendChild(label);
    line.appendChild(document.createTextNode(" – "));
    names.forEach((p, k) => {
      if (k) line.appendChild(document.createTextNode(", "));
      const nm = document.createElement("span");
      I18n.setMsg(nm, playerNameDk(p));
      line.appendChild(nm);
    });
    el.appendChild(line);
  });
  const list = document.createElement("ul");
  list.className = "dk-score-items";
  r.items.forEach((it) => {
    const li = document.createElement("li");
    const who = document.createElement("span");
    who.className = "dk-score-party";
    I18n.setMsg(who, it.party === "re" ? "Re" : "Kontra");
    li.appendChild(who);
    const what = document.createElement("span");
    I18n.setMsg(what, DK_ITEM_TEXT[it.key]);
    li.appendChild(what);
    list.appendChild(li);
  });
  el.appendChild(list);
  if (r.alone) {
    const note = document.createElement("p");
    I18n.setMsg(note, "Alone against three: the single player scores three times.");
    el.appendChild(note);
  }
  const table = document.createElement("table");
  table.className = "dk-score-table";
  const hr = document.createElement("tr");
  ["dk_col_player", "dk_col_deal", "dk_col_total"].forEach((k) => {
    const th = document.createElement("th");
    I18n.setKey(th, k);
    hr.appendChild(th);
  });
  table.appendChild(hr);
  for (let p = 0; p < 4; p++) {
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    I18n.setMsg(td1, playerNameDk(p));
    const td2 = document.createElement("td");
    td2.textContent = formatSignedDk(r.deltas[p]);
    const td3 = document.createElement("td");
    td3.textContent = formatSignedDk(AppStateDk.totals[p]);
    tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
    table.appendChild(tr);
  }
  el.appendChild(table);
}

document.addEventListener("DOMContentLoaded", initDoppelkopfApp);
