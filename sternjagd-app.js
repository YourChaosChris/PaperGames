// sternjagd-app.js
// Wires SternjagdCore ("Sternjagd", a chase game with one die) to
// sternjagd.html.
//
// The board is one svg: twelve fields joined by arrows. Roll the die, then
// tap one of the ringed fields (a field where exactly that many steps along
// the arrows can end). Whoever ends on an opponent takes one of its three
// stars. One person plays against one to three computers, or 2 to 4 people
// pass the device around. A short list under the board tells what happened.
// Nothing is animated.
//
// Computer turns one at a time (task 165): right after a person's move the
// next computer plays its turn at once; every further computer turn waits for
// "Continue" (#sj-next). The field a computer moved to gets a thick dashed
// ring and the status line names the move; both stay until a person moves.
// The ring comes from `state.last`, so it is saved and comes back on load.
// Once no person has stars left, the computers play the rest at once.
//
// Undo takes back the last move (the state before it, the die included),
// also against the computer: snapshots are only taken where a person
// decides, so going back never re-rolls the die.

const STERNJAGD_SAVE_KEY = "einkchess_save_sternjagd";

const AppStateSJ = {
  state: null,
  undoStack: [],
  log: [],      // the last events, newest first (not saved)
  logged: 0,    // state.seq of the newest logged event
  starter: -1   // who began the new game, shown until a person rolls (not saved)
};

// Centres of the twelve fields on the 100 x 100 board.
const SJ_XY = [
  [11, 11], [89, 11], [89, 89], [11, 89],
  [50, 11], [89, 50], [50, 89], [11, 50],
  [31, 31], [69, 31], [69, 69], [31, 69]
];
const SJ_R = 8.5;

function tSJ(key, values) {
  return DiceCommon.fill(I18n.t(key), values);
}

function nameSJ(i) {
  return DiceCommon.playerName(AppStateSJ.state.computer, i);
}

function humansSJ() {
  return AppStateSJ.state.computer.filter((c) => !c).length;
}

/*** Save and load ***/

function saveSJ() {
  if (typeof GameStorage === "undefined" || !AppStateSJ.state) return;
  if (AppStateSJ.state.phase === "over") {
    GameStorage.clear(STERNJAGD_SAVE_KEY);
    return;
  }
  GameStorage.save(STERNJAGD_SAVE_KEY, {
    state: AppStateSJ.state,
    undoStack: AppStateSJ.undoStack.slice(-50)
  });
}

function validStateSJ(s) {
  return !!s && s.game === "sternjagd" && Array.isArray(s.pos) && Array.isArray(s.stars) && Array.isArray(s.computer) && s.phase !== "over";
}

/*** Game flow ***/

function startGameSJ() {
  const mode = DiceCommon.activeMode();
  const n = parseInt(document.getElementById("sj-players").value, 10) || 2;
  const balance = document.getElementById("sj-balance");
  AppStateSJ.state = SternjagdCore.newGame({
    players: n,
    computer: DiceCommon.seats(mode, n),
    first: Math.floor(Math.random() * n),
    balance: n === 2 && !!(balance && balance.checked)
  });
  AppStateSJ.undoStack = [];
  AppStateSJ.log = [];
  AppStateSJ.logged = 0;
  // The starter is drawn at random (task 128) and named on the screen.
  AppStateSJ.starter = AppStateSJ.state.current;
  setResultSJ("");
  DiceCommon.showBoard();
  afterActionSJ();
}

// Remembers an event that has just happened, to show what the computers did.
function noteSJ() {
  const s = AppStateSJ.state;
  if (!s.last || s.seq === AppStateSJ.logged) return;
  AppStateSJ.logged = s.seq;
  AppStateSJ.log.unshift(JSON.parse(JSON.stringify(s.last)));
  AppStateSJ.log = AppStateSJ.log.slice(0, 3);
}

// The last event was a computer's move (its field is ringed, task 165).
function lastByComputerSJ(s) {
  return !!s.last && !!s.computer[s.last.player];
}

// A computer is to move and waits for "Continue".
function waitingSJ(s) {
  return s.phase !== "over" && !!s.computer[s.current];
}

function humanAliveSJ(s) {
  return s.computer.some((c, i) => !c && s.alive[i]);
}

// One whole turn of the computer to move: roll, then move (or pass).
function computerTurnSJ() {
  const seq = AppStateSJ.state.seq;
  let guard = 0;
  while (waitingSJ(AppStateSJ.state) && AppStateSJ.state.seq === seq && guard++ < 50) {
    const next = SternjagdCore.aiStep(AppStateSJ.state);
    if (next === AppStateSJ.state) break;
    AppStateSJ.state = next;
  }
  noteSJ();
}

// After a person's move (or at the start) the next computer plays at once;
// after a computer's move the next one waits for "Continue". With no person
// left in the game the computers play the rest at once.
function runComputersSJ() {
  const s = AppStateSJ.state;
  if (!waitingSJ(s)) return;
  if (!humanAliveSJ(s)) {
    let guard = 0;
    while (waitingSJ(AppStateSJ.state) && guard++ < 5000) computerTurnSJ();
    return;
  }
  if (!lastByComputerSJ(s)) computerTurnSJ();
}

function nextSJ() {
  if (!AppStateSJ.state || !waitingSJ(AppStateSJ.state)) return;
  computerTurnSJ();
  afterActionSJ();
}

function afterActionSJ() {
  noteSJ();
  runComputersSJ();
  if (AppStateSJ.state.phase === "over") finishSJ();
  renderSJ();
  saveSJ();
}

function rollSJ() {
  const s = AppStateSJ.state;
  if (!s || s.phase !== "roll" || s.computer[s.current]) return;
  AppStateSJ.starter = -1;
  AppStateSJ.state = SternjagdCore.roll(s);
  afterActionSJ();
}

function moveSJ(to) {
  const s = AppStateSJ.state;
  if (!s || s.phase !== "move" || s.computer[s.current]) return;
  const next = SternjagdCore.move(s, to);
  if (next === s) return;
  AppStateSJ.undoStack.push(JSON.parse(JSON.stringify(s)));
  AppStateSJ.undoStack = AppStateSJ.undoStack.slice(-50);
  AppStateSJ.state = next;
  afterActionSJ();
}

function undoSJ() {
  let prev = null;
  while (AppStateSJ.undoStack.length) {
    const candidate = AppStateSJ.undoStack.pop();
    // Snapshots are taken where a person decides; skip any other.
    if (!candidate.computer[candidate.current]) { prev = candidate; break; }
  }
  if (!prev) return;
  AppStateSJ.state = prev;
  AppStateSJ.log = [];
  AppStateSJ.logged = prev.seq;
  setResultSJ("");
  if (window.ResultModal) window.ResultModal.hide();
  afterActionSJ();
}

/*** End of the game ***/

function finishSJ() {
  const s = AppStateSJ.state;
  const humans = humansSJ();
  let title;
  let text;
  if (s.winner === -1) {
    title = "Draw";
    text = tSJ("dg_draw");
  } else if (!s.computer[s.winner]) {
    title = humans === 1 ? "You win!" : "Player " + (s.computer.slice(0, s.winner + 1).filter((c) => !c).length) + " wins";
    text = humans === 1 ? I18n.t("ui_status_you_win") : tSJ("dg_wins", { name: nameSJ(s.winner) });
  } else {
    const nth = s.computer.slice(0, s.winner + 1).filter((c) => c).length;
    const several = s.computer.filter((c) => c).length > 1;
    title = humans === 1 ? "You lose" : (several ? "Computer " + nth : "Computer") + " wins";
    text = humans === 1 ? I18n.t("ui_status_computer_wins") : tSJ("dg_wins", { name: nameSJ(s.winner) });
  }
  setResultSJ(text);
  DiceCommon.showResult(title, s.winner === -1 ? "" : tSJ("sj_over_message"));
  if (humans === 1 && s.computer.length > 1 && typeof GameStats !== "undefined") {
    GameStats.record("sternjagd", SternjagdCore.outcomeFor(s, s.computer.indexOf(false)));
  }
}

/*** Display ***/

function setStatusSJ(text) {
  DiceCommon.setText(document.getElementById("board-info"), text);
}

function setResultSJ(text) {
  DiceCommon.setText(document.getElementById("game-result"), text);
}

function eventTextSJ(l) {
  const name = nameSJ(l.player);
  let text;
  if (l.kind === "capture") text = tSJ("sj_last_capture", { name: name, n: l.die, victim: nameSJ(l.captured) });
  else if (l.kind === "pass") text = tSJ("sj_last_pass", { name: name, n: l.die });
  else text = tSJ("sj_last_move", { name: name, n: l.die });
  // The double turn of the balance (task 130).
  return l.again ? text + " " + I18n.t("sj_last_again") : text;
}

// The status sentence for a computer's move (task 165): what it rolled and
// where it went; the field has the dashed ring.
function computerEventTextSJ(l) {
  const s = AppStateSJ.state;
  const name = nameSJ(l.player);
  let text;
  if (l.kind === "capture") {
    const you = humansSJ() === 1 && !s.computer[l.captured];
    text = you ? tSJ("sj_cpu_capture_you", { name: name, n: l.die }) : tSJ("sj_cpu_capture", { name: name, n: l.die, victim: nameSJ(l.captured) });
  } else if (l.kind === "pass") text = tSJ("sj_last_pass", { name: name, n: l.die });
  else text = tSJ("sj_cpu_move", { name: name, n: l.die });
  return l.again ? text + " " + I18n.t("sj_last_again") : text;
}

// The field to ring: where the last computer moved to, until a person moves.
function markSJ(s) {
  return lastByComputerSJ(s) && s.last.kind !== "pass" ? s.last.to : -1;
}

function turnStatusSJ() {
  const s = AppStateSJ.state;
  if (s.computer[s.current]) return humanAliveSJ(s) ? tSJ("sj_next_hint", { name: nameSJ(s.current) }) : I18n.t("ui_status_computer_turn");
  const who = humansSJ() === 1 ? I18n.t("ui_status_your_turn") : tSJ("dg_turn_of", { name: nameSJ(s.current) });
  const hint = s.phase === "roll" ? tSJ("sj_roll_hint") : tSJ("sj_move_hint", { n: s.die });
  return who + " " + hint;
}

function f1SJ(x) {
  return (Math.round(x * 10) / 10).toString();
}

// One arrow from field a to field b, shifted a little to its right so that
// two arrows between the same two fields do not lie on top of each other.
function arrowSJ(a, b) {
  const p = SJ_XY[a];
  const q = SJ_XY[b];
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy * 1.6;
  const ny = ux * 1.6;
  const x1 = p[0] + ux * (SJ_R + 0.5) + nx;
  const y1 = p[1] + uy * (SJ_R + 0.5) + ny;
  const x2 = q[0] - ux * (SJ_R + 1.5) + nx;
  const y2 = q[1] - uy * (SJ_R + 1.5) + ny;
  const hx = x2 - ux * 4.2;
  const hy = y2 - uy * 4.2;
  const wx = -uy * 2.1;
  const wy = ux * 2.1;
  return '<line x1="' + f1SJ(x1) + '" y1="' + f1SJ(y1) + '" x2="' + f1SJ(hx) + '" y2="' + f1SJ(hy) + '" stroke="#141413" stroke-width="1.1"/>' +
    '<polygon points="' + f1SJ(x2 + ux * 1.3) + "," + f1SJ(y2 + uy * 1.3) + " " + f1SJ(hx + wx) + "," + f1SJ(hy + wy) + " " + f1SJ(hx - wx) + "," + f1SJ(hy - wy) + '" fill="#141413"/>';
}

function boardHtmlSJ() {
  const s = AppStateSJ.state;
  const human = !s.computer[s.current] && s.phase === "move";
  const goals = human ? SternjagdCore.destinations(s) : [];
  const mark = markSJ(s);
  let html = '<svg viewBox="-5 -5 110 110" width="400" height="400" role="group" aria-label="' + tSJ("sj_board_aria") + '" focusable="false">';
  SternjagdCore.NEXT.forEach((list, a) => list.forEach((b) => { html += arrowSJ(a, b); }));
  for (let v = 0; v < SternjagdCore.NODES; v++) {
    const c = SJ_XY[v];
    let owner = -1;
    s.pos.forEach((at, i) => { if (s.alive[i] && at === v) owner = i; });
    const goal = goals.indexOf(v) >= 0;
    let label = tSJ("sj_field_aria", { n: v + 1 });
    if (owner >= 0) label = tSJ("sj_field_piece_aria", { n: v + 1, name: nameSJ(owner) });
    if (goal) label = tSJ("sj_field_move_aria", { n: v + 1 });
    if (v === mark) label += ". " + tSJ("sj_mark_aria", { name: nameSJ(s.last.player) });
    html += '<g' + (goal ? ' class="sj-goal" data-node="' + v + '" role="button" tabindex="0"' : ' role="img"') + ' aria-label="' + label + '">';
    // The computer's last move: a thick dashed ring outside the goal ring.
    if (v === mark) html += '<circle class="sj-mark" cx="' + c[0] + '" cy="' + c[1] + '" r="' + (SJ_R + 5.5) + '" fill="none" stroke="#141413" stroke-width="2.4" stroke-dasharray="4 2.4"/>';
    if (goal) html += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + (SJ_R + 3) + '" fill="#fff" stroke="#141413" stroke-width="1.8"/>';
    if (v < 4) {
      html += '<rect x="' + (c[0] - SJ_R) + '" y="' + (c[1] - SJ_R) + '" width="' + (2 * SJ_R) + '" height="' + (2 * SJ_R) + '" rx="2" fill="#fff" stroke="#141413" stroke-width="' + (goal ? 2.6 : 1.6) + '"/>';
    } else {
      html += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + SJ_R + '" fill="#fff" stroke="#141413" stroke-width="' + (goal ? 2.6 : 1.6) + '"/>';
    }
    if (owner >= 0) {
      html += '<g transform="translate(' + f1SJ(c[0] - 6.5) + " " + f1SJ(c[1] - 6.5) + ') scale(0.13)">' + DiceCommon.markerShape(owner) + "</g>";
    }
    html += "</g>";
  }
  return html + "</svg>";
}

function renderBoardSJ() {
  document.getElementById("sj-board").innerHTML = boardHtmlSJ();
}

function renderDiceSJ() {
  const s = AppStateSJ.state;
  const wrap = document.getElementById("sj-dice");
  wrap.innerHTML = DiceCommon.dieSvg(s.die);
  wrap.setAttribute("aria-label", s.die ? tSJ("dg_dice_aria", { dice: String(s.die) }) : tSJ("dg_dice_none"));
}

function renderLogSJ() {
  const wrap = document.getElementById("sj-last");
  wrap.innerHTML = "";
  AppStateSJ.log.forEach((l) => {
    const p = document.createElement("div");
    p.textContent = eventTextSJ(l);
    wrap.appendChild(p);
  });
  if (AppStateSJ.starter >= 0) {
    const p = document.createElement("div");
    p.id = "sj-starter";
    const s = AppStateSJ.state;
    const isYou = (i) => humansSJ() === 1 && !s.computer[i];
    let text = isYou(AppStateSJ.starter) ? I18n.t("sj_starts_you") : tSJ("sj_starts", { name: nameSJ(AppStateSJ.starter) });
    // With the balance (task 130) the line also names the double turn.
    if (s.balance) {
      const second = 1 - AppStateSJ.starter;
      text += " " + (isYou(second) ? I18n.t("sj_balance_note_you") : tSJ("sj_balance_note", { name: nameSJ(second) }));
    }
    p.textContent = text;
    wrap.appendChild(p);
  }
}

function renderSJ() {
  const s = AppStateSJ.state;
  if (!s) return;
  const over = s.phase === "over";
  const extra = s.stars.map((n, i) => (s.alive[i] ? tSJ("sj_stars_tag", { n: n }) : I18n.t("sj_out_tag")));
  document.getElementById("sj-players-list").innerHTML = DiceCommon.playersHtml(s.computer, s.current, extra, over);
  renderDiceSJ();
  renderBoardSJ();
  const humanTurn = !over && !s.computer[s.current];
  const roll = document.getElementById("sj-roll");
  roll.disabled = !(humanTurn && s.phase === "roll");
  // While a computer waits, "Continue" stands where the roll button is.
  const waiting = waitingSJ(s) && humanAliveSJ(s);
  roll.classList.toggle("hidden", waiting);
  document.getElementById("sj-next").classList.toggle("hidden", !waiting);
  document.getElementById("undo-btn").disabled = AppStateSJ.undoStack.length === 0;
  renderLogSJ();
  const lead = !over && lastByComputerSJ(s) ? computerEventTextSJ(s.last) + " " : "";
  setStatusSJ(over ? "" : lead + turnStatusSJ());
}

/*** Setup ***/

function nodeOfSJ(el) {
  while (el && el.getAttribute) {
    const v = el.getAttribute("data-node");
    if (v !== null && v !== "") return parseInt(v, 10);
    el = el.parentNode;
  }
  return -1;
}

// The balance is only offered with 2 players (task 130).
function updateBalanceRowSJ() {
  const row = document.getElementById("sj-balance-row");
  const n = parseInt(document.getElementById("sj-players").value, 10) || 2;
  if (row) row.classList.toggle("hidden", n !== 2);
}

function initSternjagdApp() {
  DiceCommon.wireMenu();
  const players = document.getElementById("sj-players");
  players.addEventListener("change", updateBalanceRowSJ);
  // quick-rules.js restores the remembered fields in a timeout after
  // DOMContentLoaded (without a change event); look again after it.
  updateBalanceRowSJ();
  window.setTimeout(updateBalanceRowSJ, 0);
  document.getElementById("mode-ai").addEventListener("click", () => DiceCommon.setMode("ai"));
  document.getElementById("mode-offline").addEventListener("click", () => DiceCommon.setMode("hotseat"));
  document.getElementById("start-sj-game").addEventListener("click", startGameSJ);
  document.getElementById("sj-roll").addEventListener("click", rollSJ);
  document.getElementById("sj-next").addEventListener("click", nextSJ);
  document.getElementById("undo-btn").addEventListener("click", undoSJ);
  const board = document.getElementById("sj-board");
  board.addEventListener("click", (e) => {
    const v = nodeOfSJ(e.target);
    if (v >= 0) moveSJ(v);
  });
  board.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const v = nodeOfSJ(e.target);
    if (v >= 0) { e.preventDefault(); moveSJ(v); }
  });
  if (window.I18n && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateSJ.state) renderSJ(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(STERNJAGD_SAVE_KEY) : null;
  if (saved && validStateSJ(saved.state)) {
    AppStateSJ.state = saved.state;
    AppStateSJ.undoStack = Array.isArray(saved.undoStack) ? saved.undoStack : [];
    AppStateSJ.log = [];
    AppStateSJ.logged = saved.state.seq || 0;
    DiceCommon.showBoard();
    afterActionSJ();
  }
}

document.addEventListener("DOMContentLoaded", initSternjagdApp);
