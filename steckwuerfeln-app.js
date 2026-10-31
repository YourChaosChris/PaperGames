// steckwuerfeln-app.js
// Wires SteckwuerfelnCore ("Steckwürfeln", pegs and two dice) to
// steckwuerfeln.html.
//
// One person plays against one to three computers, or 2 to 4 people pass
// the device around. Roll the two large dice, then tap one of the ways to
// peg (the hole of the total, or the two holes of the single dice). Eleven
// holes show the board: a free hole is a white circle with its number, a
// hole with a peg is a black circle. A short list under the board tells
// what happened. Nothing is animated.
//
// Turns stay readable (task 167): every computer turn waits for "Continue"
// (#sw-next), except right after a person pegged on the shared board. The
// dice of the last roll stay on screen ("Last roll: ...") until the person
// rolls; the status line names every roll of the computer's turn, and on the
// shared board the holes it pegged get a double ring. When the game is over
// the last roll stays too and the result only opens with "Result" (the same
// button). Shown turn and waiting result are saved with the game.
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
  logged: 0,    // state.seq of the newest logged event
  lead: -1,     // state.seq of the event the status line starts with (-1: none)
  turn: null,   // the rolls of the last computer turn: { player, seq, rolls }
  pending: false, // the game is over, the result waits for "Result"
  finished: false // the result has been shown
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
  if (AppStateSW.state.phase === "over" && !AppStateSW.pending) {
    GameStorage.clear(STECKWUERFELN_SAVE_KEY);
    return;
  }
  GameStorage.save(STECKWUERFELN_SAVE_KEY, {
    state: AppStateSW.state,
    undoStack: AppStateSW.undoStack.slice(-50),
    lead: AppStateSW.lead,
    turn: AppStateSW.turn,
    pending: AppStateSW.pending
  });
}

// A finished game only comes back while its result still waits (task 167).
function validStateSW(s, pending) {
  return !!s && s.game === "steckwuerfeln" && Array.isArray(s.open) && Array.isArray(s.scores) && Array.isArray(s.computer) && (s.phase !== "over" || pending === true);
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
  AppStateSW.lead = -1;
  AppStateSW.turn = null;
  AppStateSW.pending = false;
  AppStateSW.finished = false;
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

// A computer is to roll and waits for "Continue".
function waitingSW(s) {
  return s.phase !== "over" && !!s.computer[s.current];
}

// Is a person still in the game (the shared board puts players out)?
function humanInSW(s) {
  return s.computer.some((c, i) => !c && !s.out[i]);
}

// One whole turn of the computer to move; every roll is written down.
function computerTurnSW() {
  const p = AppStateSW.state.current;
  const rolls = [];
  let guard = 0;
  while (waitingSW(AppStateSW.state) && AppStateSW.state.current === p && guard++ < 200) {
    const before = AppStateSW.state;
    const next = SteckwuerfelnCore.aiStep(before);
    if (next === before) break;
    AppStateSW.state = next;
    if (next.phase === "plug" && next.dice.length) rolls.push(next.dice.slice());
    if (next.seq !== before.seq) {
      noteSW();
      // A roll that ends the turn (or rolls again) never reaches "plug".
      if (["stuck", "pass", "out", "again"].indexOf(next.last.kind) >= 0) rolls.push(next.last.dice.slice());
      if (next.last.kind !== "again") break;
    }
  }
  AppStateSW.turn = { player: p, seq: AppStateSW.state.seq, rolls: rolls };
  AppStateSW.lead = AppStateSW.state.seq;
}

// Right after a person pegged on the shared board (or at the start) the
// next computer plays at once; after any other turn it waits for
// "Continue", so that the last roll can be read. With no person left the
// computers play the rest at once.
function runComputersSW() {
  const s = AppStateSW.state;
  if (!waitingSW(s)) return;
  if (!humanInSW(s)) {
    let guard = 0;
    while (waitingSW(AppStateSW.state) && guard++ < 5000) computerTurnSW();
    return;
  }
  if (!s.last || (!s.computer[s.last.player] && s.last.kind === "plug")) computerTurnSW();
}

function afterActionSW() {
  noteSW();
  runComputersSW();
  // The end waits for "Result" (task 167).
  if (AppStateSW.state.phase === "over" && !AppStateSW.finished) AppStateSW.pending = true;
  renderSW();
  saveSW();
}

function nextSW() {
  const s = AppStateSW.state;
  if (!s) return;
  if (s.phase === "over" && AppStateSW.pending) {
    AppStateSW.pending = false;
    AppStateSW.finished = true;
    finishSW();
    renderSW();
    saveSW();
    return;
  }
  if (!waitingSW(s)) return;
  computerTurnSW();
  afterActionSW();
}

function rollSW() {
  const s = AppStateSW.state;
  if (!s || s.phase !== "roll" || s.computer[s.current]) return;
  AppStateSW.lead = -1;
  AppStateSW.state = SteckwuerfelnCore.roll(s);
  // A roll that ends the person's turn stays readable.
  if (AppStateSW.state.seq !== s.seq) AppStateSW.lead = AppStateSW.state.seq;
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
  AppStateSW.lead = -1;
  AppStateSW.pending = false;
  AppStateSW.finished = false;
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
  // The holes a computer has just pegged on the shared board (task 167).
  const fresh = s.last && s.last.kind === "plug" && s.computer[s.last.player] && AppStateSW.lead === s.seq ? s.last.fields : [];
  SteckwuerfelnCore.FIELDS.forEach((n) => {
    const free = s.open.indexOf(n) >= 0;
    const way = free ? ways.filter((w) => w.indexOf(n) >= 0)[0] : null;
    const hole = document.createElement(way ? "button" : "span");
    hole.className = "sw-hole" + (free ? "" : " sw-hole-pegged") + (way ? " sw-hole-way" : "") + (fresh.indexOf(n) >= 0 ? " sw-hole-last" : "");
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

// The dice on screen: the running roll, else the last roll of the game
// (with whose it was) until the person rolls (task 167).
function shownDiceSW() {
  const s = AppStateSW.state;
  if (s.dice.length) return { dice: s.dice, who: -1 };
  if (s.last && Array.isArray(s.last.dice) && s.last.dice.length && AppStateSW.lead === s.seq) return { dice: s.last.dice, who: s.last.player };
  return { dice: [], who: -1 };
}

function renderDiceSW() {
  const shown = shownDiceSW();
  const wrap = document.getElementById("sw-dice");
  let html = "";
  shown.dice.forEach((d) => { html += DiceCommon.dieSvg(d); });
  if (!shown.dice.length) html = DiceCommon.dieSvg(0) + DiceCommon.dieSvg(0);
  wrap.innerHTML = html;
  wrap.setAttribute("aria-label", shown.dice.length ? tSW("dg_dice_aria", { dice: shown.dice.join(", ") }) : tSW("dg_dice_none"));
  document.getElementById("sw-total").textContent = shown.dice.length ? "= " + sumSW(shown.dice) : "";
  DiceCommon.setText(document.getElementById("sw-dice-who"), shown.who >= 0 ? tSW("sw_dice_last", { name: nameSW(shown.who) }) : "");
}

// The status line for the turn that has just ended (task 167): all rolls of
// a computer's turn, then what came of it.
function leadTextSW() {
  const s = AppStateSW.state;
  if (!s.last || AppStateSW.lead !== s.seq) return "";
  const t = AppStateSW.turn;
  const event = eventTextSW(s.last);
  if (t && t.seq === s.seq && s.computer[t.player] && t.rolls.length) {
    return tSW("sw_cpu_rolls", { name: nameSW(t.player), dice: t.rolls.map((r) => r.join(" + ")).join(", ") }) + " " + event;
  }
  return event;
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
  const roll = document.getElementById("sw-roll");
  roll.disabled = !(humanTurn && s.phase === "roll");
  // "Continue" (a computer waits) or "Result" (task 167) instead of the roll button.
  const waiting = waitingSW(s) && humanInSW(s);
  const result = over && AppStateSW.pending;
  const next = document.getElementById("sw-next");
  roll.classList.toggle("hidden", waiting || result);
  next.classList.toggle("hidden", !(waiting || result));
  I18n.setKey(next, result ? "sw_result" : "sw_next");
  document.getElementById("undo-btn").disabled = AppStateSW.undoStack.length === 0;
  renderScoresSW();
  renderLogSW();
  const lead = leadTextSW();
  let tail = "";
  if (result) tail = I18n.t("sw_result_hint");
  else if (!over) tail = waiting ? tSW("sw_next_hint", { name: nameSW(s.current) }) : turnStatusSW();
  setStatusSW((lead ? lead + " " : "") + tail);
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
  document.getElementById("sw-next").addEventListener("click", nextSW);
  document.getElementById("undo-btn").addEventListener("click", undoSW);
  updateSetupSW();
  const D = (v) => Howto.die(v, 44), P = (n, st) => Howto.tile(n, st, 36);
  Howto.init({ slug: "steckwuerfeln", actions: ["sw-roll"], steps: [
    { pics: D(2) + D(4), key: "sw_howto_1" },
    { pics: D(2) + D(4) + Howto.arrow() + P(6, "peg") + Howto.sign("/") + P(2, "peg") + P(4, "peg"), key: "sw_howto_2" },
    { pics: P(2, "peg") + P(3) + P(4, "peg") + P(5) + P(6, "peg") + P(7), key: "sw_howto_3" },
    { pics: P(3) + Howto.sign("+") + P(5) + Howto.sign("=") + Howto.sign("8"), key: "sw_howto_4" }
  ] });
  if (window.I18n && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateSW.state) renderSW(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(STECKWUERFELN_SAVE_KEY) : null;
  if (saved && validStateSW(saved.state, saved.pending)) {
    AppStateSW.state = saved.state;
    AppStateSW.undoStack = Array.isArray(saved.undoStack) ? saved.undoStack : [];
    AppStateSW.log = [];
    AppStateSW.logged = saved.state.seq || 0;
    // Saves from before task 167 have no shown turn: nothing waits to be read.
    AppStateSW.lead = typeof saved.lead === "number" ? saved.lead : -1;
    AppStateSW.turn = saved.turn && Array.isArray(saved.turn.rolls) ? saved.turn : null;
    AppStateSW.pending = saved.pending === true;
    AppStateSW.finished = false;
    DiceCommon.showBoard();
    afterActionSW();
  }
}

document.addEventListener("DOMContentLoaded", initSteckwuerfelnApp);
