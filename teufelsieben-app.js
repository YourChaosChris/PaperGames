// teufelsieben-app.js
// Wires TeufelSiebenCore ("Devilish Seven") to teufelsieben.html.
//
// 2 to 6 players on one device, any number of them played by the computer
// (Easy, Medium, Hard). One fixed row per player: name, whether they are
// still in the round, stopped or bust, the round and total points, and the
// cards in front of them. On your turn: "Turn up a card" or "Stop". A Pause
// or Second helping asks whom it goes to: the rows of the players still in
// the round become buttons. Computers act one step at a time after a calm
// pause (AiPacing). After each round a panel shows the round's points and
// "Next round". No sound, no time limit, nothing animated; numbers and
// special cards differ by their number or sign, black on white.
// No Undo: the cards come from a hidden shuffled deck, and taking a card
// back would show the next one.

const TEUFELSIEBEN_SAVE_KEY = "einkchess_save_teufelsieben";

const AppStateTS = {
  state: null,
  generation: 0   // guards a pending computer step after a new game
};

function tTS(key, values) {
  let text = I18n.t(key);
  Object.keys(values || {}).forEach((k) => { text = text.split("{" + k + "}").join(String(values[k])); });
  return text;
}

function nameTS(i) {
  return DiceCommon.playerName(AppStateTS.state.computer, i);
}

function cardNameTS(card) {
  return TeufelSiebenCore.isNumber(card) ? String(card) : tTS("ts_card_" + card);
}

function humansTS() {
  return AppStateTS.state.computer.filter((c) => !c).length;
}

/*** Save and load ***/

function saveTS() {
  if (typeof GameStorage === "undefined" || !AppStateTS.state) return;
  if (AppStateTS.state.phase === "over") { GameStorage.clear(TEUFELSIEBEN_SAVE_KEY); return; }
  GameStorage.save(TEUFELSIEBEN_SAVE_KEY, { state: AppStateTS.state });
}

function validStateTS(s) {
  return !!s && s.game === "teufelsieben" && Array.isArray(s.hands) && Array.isArray(s.deck) && Array.isArray(s.totals) && s.phase !== "over";
}

/*** Game flow ***/

function startTS() {
  const n = parseInt(document.getElementById("ts-players").value, 10) || 2;
  const comps = Math.min(n - 1, parseInt(document.getElementById("ts-computers").value, 10) || 0);
  const level = parseInt(document.getElementById("ts-level").value, 10) || 2;
  const target = parseInt(document.getElementById("ts-target").value, 10) || 150;
  const computer = [], levels = [];
  for (let i = 0; i < n; i++) { computer.push(i >= n - comps); levels.push(level); }
  AppStateTS.state = TeufelSiebenCore.newGame({ players: n, computer, levels, target });
  AppStateTS.generation++;
  setResultTS("");
  if (window.ResultModal) window.ResultModal.hide();
  DiceCommon.showBoard();
  afterTS();
}

function actorIsComputerTS() {
  const s = AppStateTS.state;
  return !!s && (s.phase === "turn" || s.phase === "target") && s.computer[TeufelSiebenCore.actor(s)];
}

function afterTS() {
  const s = AppStateTS.state;
  if (s.phase === "over") finishTS();
  renderTS();
  saveTS();
  if (actorIsComputerTS()) {
    const gen = AppStateTS.generation, from = s;
    setTimeout(() => {
      if (gen !== AppStateTS.generation || AppStateTS.state !== from) return;
      AppStateTS.state = TeufelSiebenCore.aiStep(from);
      afterTS();
    }, typeof AiPacing !== "undefined" ? AiPacing.delay(900) : 900);
  }
}

function humanTurnTS() {
  const s = AppStateTS.state;
  return !!s && (s.phase === "turn" || s.phase === "target") && !s.computer[TeufelSiebenCore.actor(s)];
}

function drawTS() {
  const s = AppStateTS.state;
  if (!humanTurnTS() || s.phase !== "turn") return;
  const next = TeufelSiebenCore.draw(s);
  if (next === s) return;
  AppStateTS.state = next;
  afterTS();
}

function stopTS() {
  const s = AppStateTS.state;
  if (!humanTurnTS() || s.phase !== "turn") return;
  const next = TeufelSiebenCore.stop(s);
  if (next === s) return;
  AppStateTS.state = next;
  afterTS();
}

function giveTS(i) {
  const s = AppStateTS.state;
  if (!humanTurnTS() || s.phase !== "target") return;
  const next = TeufelSiebenCore.giveTo(s, i);
  if (next === s) return;
  AppStateTS.state = next;
  afterTS();
}

function nextRoundTS() {
  const s = AppStateTS.state;
  if (!s || s.phase !== "roundover") return;
  AppStateTS.state = TeufelSiebenCore.nextRound(s);
  afterTS();
}

function finishTS() {
  const s = AppStateTS.state;
  const humans = humansTS();
  const best = s.totals[s.winners[0]];
  let title, text;
  if (s.winners.length > 1) {
    title = "Draw";
    text = tTS("ts_game_over_tie", { names: s.winners.map(nameTS).join(", "), n: best });
  } else {
    const w = s.winners[0];
    text = tTS("ts_game_over", { name: nameTS(w), n: best });
    if (humans === 1) {
      title = s.computer[w] ? "You lose" : "You win!";
      text = I18n.t(s.computer[w] ? "ui_status_computer_wins" : "ui_status_you_win") + " " + text;
    }
    else title = s.computer[w] ? "Computer wins" : "Player " + (s.computer.slice(0, w + 1).filter((c) => !c).length) + " wins";
  }
  setResultTS(text);
  if (window.ResultModal) window.ResultModal.show(title, text);
  if (humans === 1 && s.n > 1 && typeof GameStats !== "undefined") GameStats.record("teufelsieben", TeufelSiebenCore.outcomeFor(s, s.computer.indexOf(false)));
}

/*** Display ***/

function setStatusTS(text) {
  DiceCommon.setText(document.getElementById("board-info"), text);
}

function setResultTS(text) {
  DiceCommon.setText(document.getElementById("game-result"), text);
}

// The sign of a special card (inline SVG, black on white).
const TS_SIGNS = {
  pause: '<rect x="11" y="8" width="6" height="24" fill="#141413"/><rect x="23" y="8" width="6" height="24" fill="#141413"/>',
  helping: '<text x="20" y="27" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="17" fill="#141413">3×</text><path d="M6 33H34" stroke="#141413" stroke-width="2.5"/>',
  rescue: '<circle cx="20" cy="20" r="13" fill="none" stroke="#141413" stroke-width="6"/><path d="M20 7V13M20 27V33M7 20H13M27 20H33" stroke="#fff" stroke-width="3"/>',
  plus3: '<text x="20" y="27" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="18" fill="#141413">+3</text>',
  plus5: '<text x="20" y="27" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="18" fill="#141413">+5</text>',
  double: '<text x="20" y="27" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="18" fill="#141413">×2</text>'
};

// A card: a number in large type, or a special card with its sign and
// name in a double frame. size: "" (big) or "small".
function cardHtmlTS(card, size, extraClass) {
  const cls = "ts-card" + (size ? " ts-card-" + size : "") + (TeufelSiebenCore.isNumber(card) ? "" : " ts-card-special") + (extraClass ? " " + extraClass : "");
  if (TeufelSiebenCore.isNumber(card)) return '<span class="' + cls + '" role="img" aria-label="' + card + '"><span class="ts-num">' + card + "</span></span>";
  return '<span class="' + cls + '" role="img" aria-label="' + cardNameTS(card) + '"><svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + TS_SIGNS[card] + '</svg><span class="ts-card-name">' + cardNameTS(card) + "</span></span>";
}

function lastTextTS() {
  const s = AppStateTS.state, l = s.last;
  if (!l) return "";
  const v = { name: nameTS(l.player), n: l.card, card: l.card !== undefined ? cardNameTS(l.card) : "", target: l.target !== undefined ? nameTS(l.target) : "" };
  switch (l.type) {
    case "number": return tTS("ts_last_number", v);
    case "bust": return tTS("ts_last_bust", v);
    case "rescued": return tTS("ts_last_rescued", v);
    case "seven": return tTS("ts_last_seven", v);
    case "stop": return tTS("ts_last_stop", { name: v.name, n: l.points });
    case "paused": return tTS("ts_last_paused", v);
    case "helping": return tTS("ts_last_helping", v);
    case "void": return tTS("ts_last_void", v);
    case "rescue": case "rescue-extra": case "extra": case "special": return tTS("ts_last_card", v);
    default: return "";
  }
}

function statusTS() {
  const s = AppStateTS.state;
  if (s.phase === "over") return "";
  if (s.phase === "roundover") return tTS("ts_round_over", { r: s.round });
  const a = TeufelSiebenCore.actor(s);
  if (s.computer[a]) return I18n.t("ui_status_computer_turn");
  const who = humansTS() === 1 ? I18n.t("ui_status_your_turn") : DiceCommon.fill(I18n.t("dg_turn_of"), { name: nameTS(a) });
  return who + " " + (s.phase === "target" ? tTS("ts_hint_target", { card: cardNameTS(s.pending.card) }) : tTS("ts_hint_turn"));
}

function renderPlayersTS() {
  const s = AppStateTS.state;
  const wrap = document.getElementById("ts-rows");
  wrap.innerHTML = "";
  const giving = humanTurnTS() && s.phase === "target";
  const canGet = giving ? TeufelSiebenCore.targets(s) : [];
  const showRound = s.phase === "roundover" || s.phase === "over";
  s.hands.forEach((h, i) => {
    const row = document.createElement(giving && canGet.indexOf(i) !== -1 ? "button" : "div");
    if (row.tagName === "BUTTON") { row.type = "button"; row.addEventListener("click", () => giveTS(i)); }
    const active = (s.phase === "turn" || s.phase === "target") && TeufelSiebenCore.actor(s) === i;
    row.className = "ts-player" + (active ? " ts-player-active" : "") + (row.tagName === "BUTTON" ? " ts-player-target" : "") + " ts-player-" + h.status;
    const pts = showRound && s.roundPoints ? s.roundPoints[i] : TeufelSiebenCore.handPoints(h);
    const status = tTS("ts_status_" + h.status);
    let cards = h.numbers.map((c, k) => cardHtmlTS(c, "small", h.status === "bust" && k === h.numbers.length - 1 ? "ts-card-bust" : "")).join("");
    cards += h.extras.map((c) => cardHtmlTS(c, "small")).join("");
    if (h.rescue) cards += cardHtmlTS("rescue", "small");
    row.innerHTML = '<span class="ts-player-head"><span class="ts-player-name">' + nameTS(i) + '</span> <span class="ts-player-status">' + status + "</span>" +
      '<span class="ts-player-points">' + tTS("ts_round", { n: pts }) + " · " + tTS("ts_total", { n: s.totals[i] }) + "</span></span>" +
      '<span class="ts-player-cards">' + cards + "</span>";
    row.setAttribute("aria-label", nameTS(i) + ", " + status + ", " + tTS("ts_round", { n: pts }) + ", " + tTS("ts_total", { n: s.totals[i] }) +
      (h.numbers.length ? ", " + h.numbers.join(" ") : "") + (h.rescue ? ", " + tTS("ts_rescue_aria") : "") + (row.tagName === "BUTTON" ? ", " + tTS("ts_target_tap") : ""));
    wrap.appendChild(row);
  });
}

function renderTS() {
  const s = AppStateTS.state;
  if (!s) return;
  renderPlayersTS();
  const lastCard = document.getElementById("ts-last-card");
  lastCard.innerHTML = s.last && s.last.card !== undefined ? cardHtmlTS(s.last.card, "") : "";
  document.getElementById("ts-last-text").textContent = lastTextTS();
  const myTurn = humanTurnTS() && s.phase === "turn";
  document.getElementById("ts-draw").disabled = !myTurn;
  document.getElementById("ts-stop").disabled = !myTurn;
  document.getElementById("ts-actions").classList.toggle("hidden", s.phase === "roundover" || s.phase === "over");
  const roundWrap = document.getElementById("ts-roundover");
  roundWrap.classList.toggle("hidden", s.phase !== "roundover");
  document.getElementById("game-meta").textContent = tTS("ts_meta", { r: s.round, n: s.target });
  setStatusTS(statusTS());
}

/*** Setup ***/

function initTeufelSiebenApp() {
  DiceCommon.wireMenu();
  const computers = document.getElementById("ts-computers");
  const limitComputers = () => {
    const n = parseInt(document.getElementById("ts-players").value, 10);
    Array.from(computers.options).forEach((o) => { o.disabled = parseInt(o.value, 10) > n - 1; });
    if (parseInt(computers.value, 10) > n - 1) computers.value = String(n - 1);
  };
  document.getElementById("ts-players").addEventListener("change", limitComputers);
  limitComputers();
  document.getElementById("start-ts-game").addEventListener("click", startTS);
  document.getElementById("ts-draw").addEventListener("click", drawTS);
  document.getElementById("ts-stop").addEventListener("click", stopTS);
  document.getElementById("ts-next").addEventListener("click", nextRoundTS);
  const T = (n, st) => Howto.tile(n, st, 36);
  Howto.init({ slug: "teufelsieben", actions: ["ts-draw", "ts-stop"], steps: [
    { pics: T("5") + T("9") + T("2"), key: "ts_howto_1" },
    { pics: T("5") + T("9") + Howto.arrow() + T("5", "shut"), key: "ts_howto_2" },
    { pics: T("5") + T("9") + Howto.sign("=") + Howto.sign("14"), key: "ts_howto_3" },
    { pics: T("1") + T("2") + T("3") + T("4") + T("5") + T("6") + T("7") + Howto.sign("+20"), key: "ts_howto_4" }
  ] });
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateTS.state) renderTS(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(TEUFELSIEBEN_SAVE_KEY) : null;
  if (saved && validStateTS(saved.state)) {
    AppStateTS.state = saved.state;
    DiceCommon.showBoard();
    afterTS();
  }
}

document.addEventListener("DOMContentLoaded", initTeufelSiebenApp);
