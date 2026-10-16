// klappenkasten-app.js
// Wires KlappenkastenCore ("shut the box") to klappenkasten.html.
//
// One person plays against one to three computers, or 2 to 4 people pass
// the device around. Roll the dice (large pip-dot dice), tap the flaps that
// add up to the roll, tap "Close flaps". The computer plays its whole turn
// at once and the line under the board tells what it did. Nothing is
// animated; the flaps are black-and-white: open = white with a thick
// frame, selected = black, closed = dashed frame and crossed out.
//
// Undo takes back the last closing (the state before it, dice included),
// also in the computer mode: snapshots are only taken where a person
// decides, so going back never replays or re-rolls a die.

const KLAPPENKASTEN_SAVE_KEY = "einkchess_save_klappenkasten";

const AppStateKK = {
  state: null,
  undoStack: [],
  selected: []
};

function tKK(key, values) {
  return DiceCommon.fill(I18n.t(key), values);
}

function nameKK(i) {
  return DiceCommon.playerName(AppStateKK.state.computer, i);
}

function humansKK() {
  return AppStateKK.state.computer.filter((c) => !c).length;
}

function sumKK(list) {
  return list.reduce((a, b) => a + b, 0);
}

/*** Save and load ***/

function saveKK() {
  if (typeof GameStorage === "undefined" || !AppStateKK.state) return;
  if (AppStateKK.state.phase === "over") {
    GameStorage.clear(KLAPPENKASTEN_SAVE_KEY);
    return;
  }
  GameStorage.save(KLAPPENKASTEN_SAVE_KEY, {
    state: AppStateKK.state,
    undoStack: AppStateKK.undoStack.slice(-50)
  });
}

function validStateKK(s) {
  return !!s && s.game === "klappenkasten" && Array.isArray(s.open) && Array.isArray(s.scores) && Array.isArray(s.computer) && s.phase !== "over";
}

/*** Game flow ***/

function startGameKK() {
  const mode = DiceCommon.activeMode();
  const n = parseInt(document.getElementById("kk-players").value, 10) || 2;
  const size = parseInt(document.getElementById("kk-size").value, 10) === 12 ? 12 : 9;
  const rounds = parseInt(document.getElementById("kk-rounds").value, 10) || 3;
  AppStateKK.state = KlappenkastenCore.newGame({ players: n, computer: DiceCommon.seats(mode, n), size: size, rounds: rounds });
  AppStateKK.undoStack = [];
  AppStateKK.selected = [];
  setResultKK("");
  DiceCommon.showBoard();
  afterActionKK();
}

// The computers play at once until a person is to roll or the game is over.
function runComputersKK() {
  let guard = 0;
  while (AppStateKK.state.phase !== "over" && AppStateKK.state.computer[AppStateKK.state.current] && guard++ < 2000) {
    const next = KlappenkastenCore.aiStep(AppStateKK.state);
    if (next === AppStateKK.state) break;
    AppStateKK.state = next;
  }
}

function afterActionKK() {
  runComputersKK();
  const s = AppStateKK.state;
  if (s.phase === "over") finishKK();
  renderKK();
  saveKK();
}

function rollKK(count) {
  const s = AppStateKK.state;
  if (!s || s.phase !== "roll" || s.computer[s.current]) return;
  AppStateKK.selected = [];
  AppStateKK.state = KlappenkastenCore.roll(s, count);
  afterActionKK();
}

function toggleFlapKK(n) {
  const s = AppStateKK.state;
  if (!s || s.phase !== "close" || s.computer[s.current] || s.open.indexOf(n) < 0) return;
  const at = AppStateKK.selected.indexOf(n);
  if (at >= 0) AppStateKK.selected.splice(at, 1);
  else AppStateKK.selected.push(n);
  renderKK();
}

function closeFlapsKK() {
  const s = AppStateKK.state;
  if (!s || s.phase !== "close" || s.computer[s.current]) return;
  const picked = AppStateKK.selected.slice().sort((a, b) => a - b);
  const need = sumKK(s.dice);
  const next = KlappenkastenCore.close(s, picked);
  if (next === s) {
    renderKK();
    setStatusKK(tKK("kk_wrong_sum", { n: sumKK(picked), m: need }));
    return;
  }
  AppStateKK.undoStack.push(JSON.parse(JSON.stringify(s)));
  AppStateKK.undoStack = AppStateKK.undoStack.slice(-50);
  AppStateKK.selected = [];
  AppStateKK.state = next;
  afterActionKK();
}

function undoKK() {
  let prev = null;
  while (AppStateKK.undoStack.length) {
    const candidate = AppStateKK.undoStack.pop();
    // Snapshots are taken where a person decides; skip any other.
    if (!candidate.computer[candidate.current]) { prev = candidate; break; }
  }
  if (!prev) return;
  AppStateKK.state = prev;
  AppStateKK.selected = [];
  setResultKK("");
  if (window.ResultModal) window.ResultModal.hide();
  afterActionKK();
}

/*** End of the game ***/

function finishKK() {
  const s = AppStateKK.state;
  const humans = humansKK();
  let title;
  let text;
  if (s.winner === -1) {
    title = "Draw";
    text = tKK("dg_draw");
  } else if (!s.computer[s.winner]) {
    title = humans === 1 ? "You win!" : "Player " + (s.computer.slice(0, s.winner + 1).filter((c) => !c).length) + " wins";
    text = humans === 1 ? I18n.t("ui_status_you_win") : tKK("dg_wins", { name: nameKK(s.winner) });
  } else {
    const nth = s.computer.slice(0, s.winner + 1).filter((c) => c).length;
    const several = s.computer.filter((c) => c).length > 1;
    title = humans === 1 ? "You lose" : (several ? "Computer " + nth : "Computer") + " wins";
    text = humans === 1 ? I18n.t("ui_status_computer_wins") : tKK("dg_wins", { name: nameKK(s.winner) });
  }
  setResultKK(text);
  const totals = KlappenkastenCore.totals(s);
  const message = s.boxShut
    ? tKK("kk_box_message")
    : s.computer.map((c, i) => nameKK(i) + ": " + totals[i]).join(" · ");
  DiceCommon.showResult(title, message);
  if (humans === 1 && s.computer.length > 1 && typeof GameStats !== "undefined") {
    GameStats.record("klappenkasten", KlappenkastenCore.outcomeFor(s, s.computer.indexOf(false)));
  }
}

/*** Display ***/

function setStatusKK(text) {
  DiceCommon.setText(document.getElementById("board-info"), text);
}

function setResultKK(text) {
  DiceCommon.setText(document.getElementById("game-result"), text);
}

function lastTurnTextKK() {
  const s = AppStateKK.state;
  const l = s.last;
  if (!l) return "";
  if (l.boxShut) return tKK("kk_last_box", { name: nameKK(l.player) });
  return tKK("kk_last_stuck", { name: nameKK(l.player), dice: l.dice.join(" + "), n: l.points });
}

function turnStatusKK() {
  const s = AppStateKK.state;
  if (s.computer[s.current]) return I18n.t("ui_status_computer_turn");
  const who = humansKK() === 1 ? I18n.t("ui_status_your_turn") : tKK("dg_turn_of", { name: nameKK(s.current) });
  const hint = s.phase === "roll" ? tKK("kk_roll_hint") : tKK("kk_pick_hint", { n: sumKK(s.dice) });
  return who + " " + hint;
}

function renderFlapsKK() {
  const s = AppStateKK.state;
  const wrap = document.getElementById("kk-flaps");
  const human = !s.computer[s.current] && s.phase === "close";
  wrap.className = "kk-flaps kk-flaps-" + s.size;
  wrap.innerHTML = "";
  for (let n = 1; n <= s.size; n++) {
    const isOpen = s.open.indexOf(n) >= 0;
    const isSel = AppStateKK.selected.indexOf(n) >= 0;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "kk-flap" + (isOpen ? "" : " kk-flap-closed") + (isSel ? " kk-flap-selected" : "");
    b.textContent = String(n);
    b.setAttribute("aria-label", tKK(!isOpen ? "kk_flap_closed_aria" : isSel ? "kk_flap_selected_aria" : "kk_flap_aria", { n: n }));
    if (!isOpen) b.disabled = true;
    else {
      b.setAttribute("aria-pressed", isSel ? "true" : "false");
      if (human) b.addEventListener("click", () => toggleFlapKK(n));
    }
    wrap.appendChild(b);
  }
}

function renderDiceKK() {
  const s = AppStateKK.state;
  const wrap = document.getElementById("kk-dice");
  let html = "";
  s.dice.forEach((d) => { html += DiceCommon.dieSvg(d); });
  if (!s.dice.length) html = DiceCommon.dieSvg(0) + DiceCommon.dieSvg(0);
  wrap.innerHTML = html;
  wrap.setAttribute("aria-label", s.dice.length ? tKK("dg_dice_aria", { dice: s.dice.join(", ") }) : tKK("dg_dice_none"));
  const total = document.getElementById("kk-total");
  total.textContent = s.dice.length ? "= " + sumKK(s.dice) : "";
}

function renderScoresKK() {
  const s = AppStateKK.state;
  const totals = KlappenkastenCore.totals(s);
  let head = "<tr><th></th>";
  for (let r = 1; r <= s.rounds; r++) head += "<th>" + r + "</th>";
  head += "<th>" + I18n.t("dg_total") + "</th></tr>";
  let rows = "";
  s.computer.forEach((c, i) => {
    rows += "<tr><td>" + DiceCommon.markerSvg(i, "dg-marker dg-marker-small") + " " + nameKK(i) + "</td>";
    for (let r = 0; r < s.rounds; r++) rows += "<td>" + (s.scores[i][r] === undefined ? "–" : s.scores[i][r]) + "</td>";
    rows += "<td><b>" + totals[i] + "</b></td></tr>";
  });
  document.getElementById("kk-scores").innerHTML = "<thead>" + head + "</thead><tbody>" + rows + "</tbody>";
}

function renderKK() {
  const s = AppStateKK.state;
  if (!s) return;
  const totals = KlappenkastenCore.totals(s);
  const over = s.phase === "over";
  document.getElementById("kk-players-list").innerHTML = DiceCommon.playersHtml(s.computer, s.current, totals.map((t) => tKK("dg_points", { n: t })), over);
  document.getElementById("kk-round").textContent = tKK("dg_round_of", { n: s.round, m: s.rounds });
  renderDiceKK();
  renderFlapsKK();
  const humanTurn = !over && !s.computer[s.current];
  const sel = sumKK(AppStateKK.selected);
  document.getElementById("kk-selected").textContent = humanTurn && s.phase === "close" ? tKK("kk_selected", { n: sel, m: sumKK(s.dice) }) : "";
  document.getElementById("kk-roll2").disabled = !(humanTurn && s.phase === "roll");
  const one = document.getElementById("kk-roll1");
  one.classList.toggle("hidden", !(humanTurn && KlappenkastenCore.canOneDie(s)));
  one.disabled = !(humanTurn && s.phase === "roll");
  document.getElementById("kk-close").disabled = !(humanTurn && s.phase === "close" && AppStateKK.selected.length > 0);
  document.getElementById("undo-btn").disabled = AppStateKK.undoStack.length === 0;
  renderScoresKK();
  if (over) {
    setStatusKK(lastTurnTextKK());
  } else {
    setStatusKK(turnStatusKK());
  }
  DiceCommon.setText(document.getElementById("kk-last"), over ? "" : lastTurnTextKK());
}

/*** Setup ***/

function initKlappenkastenApp() {
  DiceCommon.wireMenu();
  document.getElementById("mode-ai").addEventListener("click", () => DiceCommon.setMode("ai"));
  document.getElementById("mode-offline").addEventListener("click", () => DiceCommon.setMode("hotseat"));
  document.getElementById("start-kk-game").addEventListener("click", startGameKK);
  document.getElementById("kk-roll2").addEventListener("click", () => rollKK(2));
  document.getElementById("kk-roll1").addEventListener("click", () => rollKK(1));
  document.getElementById("kk-close").addEventListener("click", closeFlapsKK);
  document.getElementById("undo-btn").addEventListener("click", undoKK);
  if (window.I18n && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateKK.state) renderKK(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(KLAPPENKASTEN_SAVE_KEY) : null;
  if (saved && validStateKK(saved.state)) {
    AppStateKK.state = saved.state;
    AppStateKK.undoStack = Array.isArray(saved.undoStack) ? saved.undoStack : [];
    AppStateKK.selected = [];
    DiceCommon.showBoard();
    afterActionKK();
  }
}

document.addEventListener("DOMContentLoaded", initKlappenkastenApp);
