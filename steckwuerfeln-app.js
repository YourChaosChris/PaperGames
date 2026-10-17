// steckwuerfeln-app.js
// Wires SteckwuerfelnCore ("Steckwürfeln", pegs and two dice) to
// steckwuerfeln.html.
//
// One person plays against one to three computers, or 2 to 4 people pass
// the device around. Roll the two large dice, then tap one of the ways to
// peg (the hole of the total, or the two holes of the single dice). Eleven
// holes show the board: a free hole is a white circle with its number, a
// hole with a peg is a black circle. The computers play at once; a short
// list under the board tells what they did. Nothing is animated.
//
// Two ways to play: points (every player on a fresh board, 1/3/5 rounds)
// or one shared board where whoever cannot peg any more is out. The double
// six joker is chosen before the game.
//
// Undo takes back the last pegging (the state before it, dice included),
// also against the computer: snapshots are only taken where a person
// decides, so going back never re-rolls a die.

const STECKWUERFELN_SAVE_KEY = "einkchess_save_steckwuerfeln";

const AppStateSW = {
  state: null,
  undoStack: [],
  log: [],      // the last events, newest first (not saved)
  logged: 0     // state.seq of the newest logged event
};

function tSW(key, values) {
  return DiceCommon.fill(I18n.t(key), values);
}

function nameSW(i) {
  return DiceCommon.playerName(AppStateSW.state.computer, i);
}

function humansSW() {
  return AppStateSW.state.computer.filter((c) => !c).length;
}

function sumSW(list) {
  return list.reduce((a, b) => a + b, 0);
}

/*** Save and load ***/

function saveSW() {
  if (typeof GameStorage === "undefined" || !AppStateSW.state) return;
  if (AppStateSW.state.phase === "over") {
    GameStorage.clear(STECKWUERFELN_SAVE_KEY);
    return;
  }
  GameStorage.save(STECKWUERFELN_SAVE_KEY, {
    state: AppStateSW.state,
    undoStack: AppStateSW.undoStack.slice(-50)
  });
}

function validStateSW(s) {
  return !!s && s.game === "steckwuerfeln" && Array.isArray(s.open) && Array.isArray(s.scores) && Array.isArray(s.computer) && s.phase !== "over";
}

/*** Game flow ***/

function startGameSW() {
  updateSetupSW();
  const mode = DiceCommon.activeMode();
  const n = parseInt(document.getElementById("sw-players").value, 10) || 2;
  AppStateSW.state = SteckwuerfelnCore.newGame({
    players: n,
    computer: DiceCommon.seats(mode, n),
    mode: document.getElementById("sw-mode").value,
    sixes: document.getElementById("sw-sixes").value,
    rounds: parseInt(document.getElementById("sw-rounds").value, 10) || 3
  });
  AppStateSW.undoStack = [];
  AppStateSW.log = [];
  AppStateSW.logged = 0;
  setResultSW("");
  DiceCommon.showBoard();
  afterActionSW();
}

// Remembers an event that has just happened, to show what the computers did.
function noteSW() {
  const s = AppStateSW.state;
  if (!s.last || s.seq === AppStateSW.logged) return;
  AppStateSW.logged = s.seq;
  AppStateSW.log.unshift(JSON.parse(JSON.stringify(s.last)));
  AppStateSW.log = AppStateSW.log.slice(0, 3);
}

// The computers play at once until a person is to roll or the game is over.
function runComputersSW() {
  let guard = 0;
  while (AppStateSW.state.phase !== "over" && AppStateSW.state.computer[AppStateSW.state.current] && guard++ < 5000) {
    const next = SteckwuerfelnCore.aiStep(AppStateSW.state);
    if (next === AppStateSW.state) break;
    AppStateSW.state = next;
    noteSW();
  }
}

function afterActionSW() {
  noteSW();
  runComputersSW();
  if (AppStateSW.state.phase === "over") finishSW();
  renderSW();
  saveSW();
}

function rollSW() {
  const s = AppStateSW.state;
  if (!s || s.phase !== "roll" || s.computer[s.current]) return;
  AppStateSW.state = SteckwuerfelnCore.roll(s);
  afterActionSW();
}

function plugSW(fields) {
  const s = AppStateSW.state;
  if (!s || s.phase !== "plug" || s.computer[s.current]) return;
  const next = SteckwuerfelnCore.plug(s, fields);
  if (next === s) return;
  AppStateSW.undoStack.push(JSON.parse(JSON.stringify(s)));
  AppStateSW.undoStack = AppStateSW.undoStack.slice(-50);
  AppStateSW.state = next;
  afterActionSW();
}

function undoSW() {
  let prev = null;
  while (AppStateSW.undoStack.length) {
    const candidate = AppStateSW.undoStack.pop();
    // Snapshots are taken where a person decides; skip any other.
    if (!candidate.computer[candidate.current]) { prev = candidate; break; }
  }
  if (!prev) return;
  AppStateSW.state = prev;
  AppStateSW.log = [];
  AppStateSW.logged = prev.seq;
  setResultSW("");
  if (window.ResultModal) window.ResultModal.hide();
  afterActionSW();
}

/*** End of the game ***/

function finishSW() {
  const s = AppStateSW.state;
  const humans = humansSW();
  let title;
  let text;
  if (s.winner === -1) {
    title = "Draw";
    text = tSW("dg_draw");
  } else if (!s.computer[s.winner]) {
    title = humans === 1 ? "You win!" : "Player " + (s.computer.slice(0, s.winner + 1).filter((c) => !c).length) + " wins";
    text = humans === 1 ? I18n.t("ui_status_you_win") : tSW("dg_wins", { name: nameSW(s.winner) });
  } else {
    const nth = s.computer.slice(0, s.winner + 1).filter((c) => c).length;
    const several = s.computer.filter((c) => c).length > 1;
    title = humans === 1 ? "You lose" : (several ? "Computer " + nth : "Computer") + " wins";
    text = humans === 1 ? I18n.t("ui_status_computer_wins") : tSW("dg_wins", { name: nameSW(s.winner) });
  }
  setResultSW(text);
  let message;
  if (s.full) message = tSW("sw_full_message");
  else if (s.mode === "shared") message = tSW("sw_shared_message");
  else {
    const totals = SteckwuerfelnCore.totals(s);
    message = s.computer.map((c, i) => nameSW(i) + ": " + totals[i]).join(" · ");
  }
  DiceCommon.showResult(title, message);
  if (humans === 1 && s.computer.length > 1 && typeof GameStats !== "undefined") {
    GameStats.record("steckwuerfeln", SteckwuerfelnCore.outcomeFor(s, s.computer.indexOf(false)));
  }
}

/*** Display ***/

function setStatusSW(text) {
  DiceCommon.setText(document.getElementById("board-info"), text);
}

function setResultSW(text) {
  DiceCommon.setText(document.getElementById("game-result"), text);
}

function eventTextSW(l) {
  const s = AppStateSW.state;
  const name = nameSW(l.player);
  if (l.kind === "full") return tSW("sw_last_full", { name: name });
  if (l.kind === "again") return tSW("sw_last_again", { name: name });
  if (l.kind === "pass") return tSW("sw_last_pass", { name: name });
  if (l.kind === "out") return tSW("sw_last_out", { name: name });
  if (l.kind === "plug") return tSW("sw_last_plug", { name: name, fields: l.fields.join(" + ") });
  if (s.sixes === "out" && l.dice.length === 2 && l.dice[0] === 6 && l.dice[1] === 6) return tSW("sw_last_joker_out", { name: name, n: l.points });
  return tSW("sw_last_stuck", { name: name, dice: l.dice.join(" + "), n: l.points });
}

function turnStatusSW() {
  const s = AppStateSW.state;
  if (s.computer[s.current]) return I18n.t("ui_status_computer_turn");
  const who = humansSW() === 1 ? I18n.t("ui_status_your_turn") : tSW("dg_turn_of", { name: nameSW(s.current) });
  const again = s.phase === "roll" && s.dice.length === 2 && s.last && s.last.kind === "again";
  const hint = s.phase === "roll" ? (again ? tSW("sw_again_hint") : tSW("sw_roll_hint")) : tSW("sw_choose_hint");
  return who + " " + hint;
}

function renderHolesSW() {
  const s = AppStateSW.state;
  const wrap = document.getElementById("sw-holes");
  wrap.innerHTML = "";
  // While a person pegs, every hole of a legal way can be tapped; the tap
  // pegs the whole way (one hole, or both holes of the single dice).
  const ways = s.phase === "plug" && !s.computer[s.current] ? SteckwuerfelnCore.choices(s) : [];
  SteckwuerfelnCore.FIELDS.forEach((n) => {
    const free = s.open.indexOf(n) >= 0;
    const way = free ? ways.filter((w) => w.indexOf(n) >= 0)[0] : null;
    const hole = document.createElement(way ? "button" : "span");
    hole.className = "sw-hole" + (free ? "" : " sw-hole-pegged") + (way ? " sw-hole-way" : "");
    if (way) {
      hole.type = "button";
      hole.setAttribute("aria-label", way.length === 1 ? tSW("sw_way_one", { n: way[0] }) : tSW("sw_way_two", { a: way[0], b: way[1] }));
      hole.addEventListener("click", () => plugSW(way));
    } else {
      hole.setAttribute("role", "img");
      hole.setAttribute("aria-label", tSW(free ? "sw_hole_aria" : "sw_hole_pegged_aria", { n: n }));
    }
    hole.textContent = String(n);
    wrap.appendChild(hole);
  });
}

function renderDiceSW() {
  const s = AppStateSW.state;
  const wrap = document.getElementById("sw-dice");
  let html = "";
  s.dice.forEach((d) => { html += DiceCommon.dieSvg(d); });
  if (!s.dice.length) html = DiceCommon.dieSvg(0) + DiceCommon.dieSvg(0);
  wrap.innerHTML = html;
  wrap.setAttribute("aria-label", s.dice.length ? tSW("dg_dice_aria", { dice: s.dice.join(", ") }) : tSW("dg_dice_none"));
  document.getElementById("sw-total").textContent = s.dice.length ? "= " + sumSW(s.dice) : "";
}

function renderWaysSW() {
  const s = AppStateSW.state;
  const wrap = document.getElementById("sw-ways");
  wrap.innerHTML = "";
  if (s.phase !== "plug" || s.computer[s.current]) return;
  SteckwuerfelnCore.choices(s).forEach((way) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "primary sw-way";
    b.textContent = way.length === 1 ? tSW("sw_way_one", { n: way[0] }) : tSW("sw_way_two", { a: way[0], b: way[1] });
    b.addEventListener("click", () => plugSW(way));
    wrap.appendChild(b);
  });
}

function renderScoresSW() {
  const s = AppStateSW.state;
  const table = document.getElementById("sw-scores");
  if (s.mode !== "score") { table.innerHTML = ""; table.classList.add("hidden"); return; }
  table.classList.remove("hidden");
  const totals = SteckwuerfelnCore.totals(s);
  let head = "<tr><th></th>";
  for (let r = 1; r <= s.rounds; r++) head += "<th>" + r + "</th>";
  head += "<th>" + I18n.t("dg_total") + "</th></tr>";
  let rows = "";
  s.computer.forEach((c, i) => {
    rows += "<tr><td>" + DiceCommon.markerSvg(i, "dg-marker dg-marker-small") + " " + nameSW(i) + "</td>";
    for (let r = 0; r < s.rounds; r++) rows += "<td>" + (s.scores[i][r] === undefined ? "–" : s.scores[i][r]) + "</td>";
    rows += "<td><b>" + totals[i] + "</b></td></tr>";
  });
  table.innerHTML = "<thead>" + head + "</thead><tbody>" + rows + "</tbody>";
}

function renderLogSW() {
  const wrap = document.getElementById("sw-last");
  wrap.innerHTML = "";
  AppStateSW.log.forEach((l) => {
    const p = document.createElement("div");
    p.textContent = eventTextSW(l);
    wrap.appendChild(p);
  });
}

function renderSW() {
  const s = AppStateSW.state;
  if (!s) return;
  const over = s.phase === "over";
  const extra = s.mode === "score"
    ? SteckwuerfelnCore.totals(s).map((t) => tSW("dg_points", { n: t }))
    : s.out.map((o) => (o ? tSW("sw_out_tag") : ""));
  document.getElementById("sw-players-list").innerHTML = DiceCommon.playersHtml(s.computer, s.current, extra, over);
  document.getElementById("sw-round").textContent = s.mode === "score" ? tSW("dg_round_of", { n: s.round, m: s.rounds }) : "";
  renderDiceSW();
  renderHolesSW();
  renderWaysSW();
  const humanTurn = !over && !s.computer[s.current];
  document.getElementById("sw-roll").disabled = !(humanTurn && s.phase === "roll");
  document.getElementById("undo-btn").disabled = AppStateSW.undoStack.length === 0;
  renderScoresSW();
  renderLogSW();
  setStatusSW(over ? "" : turnStatusSW());
}

/*** Setup ***/

function updateSetupSW() {
  const score = document.getElementById("sw-mode").value === "score";
  document.getElementById("sw-rounds-row").classList.toggle("hidden", !score);
}

function initSteckwuerfelnApp() {
  DiceCommon.wireMenu();
  document.getElementById("mode-ai").addEventListener("click", () => DiceCommon.setMode("ai"));
  document.getElementById("mode-offline").addEventListener("click", () => DiceCommon.setMode("hotseat"));
  document.getElementById("sw-mode").addEventListener("change", updateSetupSW);
  document.getElementById("start-sw-game").addEventListener("click", startGameSW);
  document.getElementById("sw-roll").addEventListener("click", rollSW);
  document.getElementById("undo-btn").addEventListener("click", undoSW);
  updateSetupSW();
  if (window.I18n && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateSW.state) renderSW(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(STECKWUERFELN_SAVE_KEY) : null;
  if (saved && validStateSW(saved.state)) {
    AppStateSW.state = saved.state;
    AppStateSW.undoStack = Array.isArray(saved.undoStack) ? saved.undoStack : [];
    AppStateSW.log = [];
    AppStateSW.logged = saved.state.seq || 0;
    DiceCommon.showBoard();
    afterActionSW();
  }
}

document.addEventListener("DOMContentLoaded", initSteckwuerfelnApp);
