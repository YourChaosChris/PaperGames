// kleeberg-app.js
// Wires KleebergCore ("Kleeberg", a building game on a pyramid) to
// kleeberg.html.
//
// The board is one svg: fifteen round fields in five rows, joined by thin
// lines. The ringed fields are the free ones that can be used now (both
// fields below are filled); fields with a dashed edge are not open yet. The
// hearts player and the clovers player take turns. Three of your symbols
// in a straight line win; the line is drawn thick. One person plays against
// the computer, or two people share the device. The computer answers at
// once; its last piece has a double ring. Nothing is animated.
//
// Undo takes back the last move of a person (also the answer of the
// computer): snapshots are only taken where a person decides.

const KLEEBERG_SAVE_KEY = "einkchess_save_kleeberg";

const AppStateKB = {
  state: null,
  undoStack: []
};

const KB_DX = 19.5;
const KB_DY = 17;
const KB_Y0 = 18;
const KB_R = 8.5;

function tKB(key, values) {
  return DiceCommon.fill(I18n.t(key), values);
}

function nameKB(i) {
  return DiceCommon.playerName(AppStateKB.state.computer, i);
}

function humansKB() {
  return AppStateKB.state.computer.filter((c) => !c).length;
}

/*** The two symbols, on a 100 x 100 square, black with a white edge ***/

function symbolShapeKB(player) {
  const edge = ' stroke="#fff" stroke-width="4" stroke-linejoin="round"';
  if (player === 0) {
    return '<path d="M50 88 C8 58 8 22 30 22 C41 22 47 28 50 35 C53 28 59 22 70 22 C92 22 92 58 50 88 Z" fill="#141413"' + edge + "/>";
  }
  return '<rect x="46" y="58" width="8" height="34" fill="#141413"' + edge + "/>" +
    '<circle cx="50" cy="26" r="19" fill="#141413"' + edge + "/>" +
    '<circle cx="72" cy="48" r="19" fill="#141413"' + edge + "/>" +
    '<circle cx="50" cy="70" r="19" fill="#141413"' + edge + "/>" +
    '<circle cx="28" cy="48" r="19" fill="#141413"' + edge + "/>" +
    '<circle cx="50" cy="48" r="6" fill="#fff"/>';
}

function symbolSvgKB(player) {
  return '<svg class="dg-marker" viewBox="0 0 100 100" width="28" height="28" aria-hidden="true" focusable="false">' + symbolShapeKB(player) + "</svg>";
}

/*** Save and load ***/

function saveKB() {
  if (typeof GameStorage === "undefined" || !AppStateKB.state) return;
  if (AppStateKB.state.phase === "over") {
    GameStorage.clear(KLEEBERG_SAVE_KEY);
    return;
  }
  GameStorage.save(KLEEBERG_SAVE_KEY, {
    state: AppStateKB.state,
    undoStack: AppStateKB.undoStack.slice(-50)
  });
}

function validStateKB(s) {
  return !!s && s.game === "kleeberg" && Array.isArray(s.board) && s.board.length === KleebergCore.CELLS && Array.isArray(s.computer) && s.phase !== "over";
}

/*** Game flow ***/

function startGameKB() {
  const mode = DiceCommon.activeMode();
  AppStateKB.state = KleebergCore.newGame({
    computer: DiceCommon.seats(mode, 2),
    first: Math.floor(Math.random() * 2)
  });
  AppStateKB.undoStack = [];
  setResultKB("");
  DiceCommon.showBoard();
  afterActionKB();
}

// The computer answers at once when it is its turn.
function runComputerKB() {
  let guard = 0;
  while (AppStateKB.state.phase !== "over" && AppStateKB.state.computer[AppStateKB.state.current] && guard++ < 50) {
    const next = KleebergCore.aiStep(AppStateKB.state);
    if (next === AppStateKB.state) break;
    AppStateKB.state = next;
  }
}

function afterActionKB() {
  runComputerKB();
  if (AppStateKB.state.phase === "over") finishKB();
  renderKB();
  saveKB();
}

function moveKB(cell) {
  const s = AppStateKB.state;
  if (!s || s.phase !== "play" || s.computer[s.current]) return;
  const next = KleebergCore.place(s, cell);
  if (next === s) return;
  AppStateKB.undoStack.push(JSON.parse(JSON.stringify(s)));
  AppStateKB.undoStack = AppStateKB.undoStack.slice(-50);
  AppStateKB.state = next;
  afterActionKB();
}

function undoKB() {
  let prev = null;
  while (AppStateKB.undoStack.length) {
    const candidate = AppStateKB.undoStack.pop();
    if (!candidate.computer[candidate.current]) { prev = candidate; break; }
  }
  if (!prev) return;
  AppStateKB.state = prev;
  setResultKB("");
  if (window.ResultModal) window.ResultModal.hide();
  afterActionKB();
}

/*** End of the game ***/

function finishKB() {
  const s = AppStateKB.state;
  const humans = humansKB();
  let title;
  let text;
  if (s.winner === -1) {
    title = "Draw";
    text = tKB("dg_draw");
  } else if (!s.computer[s.winner]) {
    title = humans === 1 ? "You win!" : "Player " + (s.winner + 1) + " wins";
    text = humans === 1 ? I18n.t("ui_status_you_win") : tKB("dg_wins", { name: nameKB(s.winner) });
  } else {
    title = humans === 1 ? "You lose" : "Computer wins";
    text = humans === 1 ? I18n.t("ui_status_computer_wins") : tKB("dg_wins", { name: nameKB(s.winner) });
  }
  setResultKB(text);
  DiceCommon.showResult(title, tKB("kb_over_message"));
  if (humans === 1 && typeof GameStats !== "undefined") {
    GameStats.record("kleeberg", KleebergCore.outcomeFor(s, s.computer.indexOf(false)));
  }
}

/*** Display ***/

function setStatusKB(text) {
  DiceCommon.setText(document.getElementById("board-info"), text);
}

function setResultKB(text) {
  DiceCommon.setText(document.getElementById("game-result"), text);
}

function turnStatusKB() {
  const s = AppStateKB.state;
  if (s.computer[s.current]) return I18n.t("ui_status_computer_turn");
  const who = humansKB() === 1 ? I18n.t("ui_status_your_turn") : tKB("dg_turn_of", { name: nameKB(s.current) });
  return who + " " + tKB("kb_move_hint");
}

function f1KB(x) {
  return (Math.round(x * 10) / 10).toString();
}

function cellXYKB(rows, r, c) {
  return [50 + (c - r / 2) * KB_DX, KB_Y0 + r * KB_DY];
}

// One pyramid as svg markup. opts: board (cell values), open (list of
// ringed cells), line (winning cells), last (cell of the last piece),
// rows, interactive, label.
function pyramidHtmlKB(opts) {
  const rows = opts.rows || KleebergCore.ROWS;
  const pos = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c <= r; c++) pos.push(cellXYKB(rows, r, c));
  const idx = (r, c) => r * (r + 1) / 2 + c;
  const open = opts.open || [];
  const line = opts.line || [];
  const size = opts.size || 400;
  const vh = KB_Y0 + (rows - 1) * KB_DY + KB_R + 6;
  const h = Math.round(size * vh / 100);
  let html = '<svg viewBox="0 0 100 ' + f1KB(vh) + '" width="' + size + '" height="' + h + '" role="group" aria-label="' + opts.label + '" focusable="false">';
  // the summit flag on the top field
  html += '<line x1="50" y1="' + (KB_Y0 - KB_R - 0.5) + '" x2="50" y2="1" stroke="#141413" stroke-width="1"/>' +
    '<polygon points="50,1 58,3.5 50,6" fill="#141413"/>';
  // thin lines between neighbouring fields
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= r; c++) {
      const a = pos[idx(r, c)];
      const nb = [];
      if (c < r) nb.push(pos[idx(r, c + 1)]);
      if (r + 1 < rows) { nb.push(pos[idx(r + 1, c)]); nb.push(pos[idx(r + 1, c + 1)]); }
      nb.forEach((b) => {
        html += '<line x1="' + f1KB(a[0]) + '" y1="' + f1KB(a[1]) + '" x2="' + f1KB(b[0]) + '" y2="' + f1KB(b[1]) + '" stroke="#141413" stroke-width="0.8"/>';
      });
    }
  }
  if (line.length === 3) {
    const a = pos[line[0]];
    const b = pos[line[2]];
    html += '<line x1="' + f1KB(a[0]) + '" y1="' + f1KB(a[1]) + '" x2="' + f1KB(b[0]) + '" y2="' + f1KB(b[1]) + '" stroke="#141413" stroke-width="4.2" stroke-linecap="round"/>';
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= r; c++) {
      const i = idx(r, c);
      const p = pos[i];
      const mark = opts.board[i];
      const isOpen = open.indexOf(i) >= 0;
      const inLine = line.indexOf(i) >= 0;
      const fieldNo = tKB("kb_field_name", { r: rows - r, c: c + 1 });
      let label = fieldNo;
      if (mark) label += ": " + I18n.t(mark === 1 ? "kb_hearts" : "kb_clovers");
      else if (isOpen) label += ": " + I18n.t("kb_field_move");
      else label += ": " + I18n.t("kb_field_locked");
      html += '<g' + (isOpen && opts.interactive ? ' class="kb-goal-cell" data-cell="' + i + '" role="button" tabindex="0"' : ' role="img"') + ' aria-label="' + label + '">';
      if (isOpen && opts.interactive) {
        html += '<circle cx="' + f1KB(p[0]) + '" cy="' + f1KB(p[1]) + '" r="' + (KB_R + 3) + '" fill="#fff" stroke="#141413" stroke-width="1.8"/>';
      }
      if (opts.last === i && mark) {
        html += '<circle cx="' + f1KB(p[0]) + '" cy="' + f1KB(p[1]) + '" r="' + (KB_R + 2.6) + '" fill="#fff" stroke="#141413" stroke-width="1.2"/>';
      }
      html += '<circle cx="' + f1KB(p[0]) + '" cy="' + f1KB(p[1]) + '" r="' + KB_R + '" fill="#fff" stroke="#141413" stroke-width="' + (inLine ? 3 : isOpen && opts.interactive ? 2.4 : 1.4) + '"' +
        (!mark && !isOpen ? ' stroke-dasharray="2.2 1.8"' : "") + "/>";
      if (mark) {
        html += '<g transform="translate(' + f1KB(p[0] - 7.2) + " " + f1KB(p[1] - 7.2) + ') scale(0.144)">' + symbolShapeKB(mark - 1) + "</g>";
      }
      html += "</g>";
    }
  }
  return html + "</svg>";
}

function renderBoardKB() {
  const s = AppStateKB.state;
  const human = s.phase === "play" && !s.computer[s.current];
  document.getElementById("kb-board").innerHTML = pyramidHtmlKB({
    board: s.board,
    open: s.phase === "play" ? KleebergCore.destinations(s) : [],
    line: s.line,
    last: s.last,
    interactive: human,
    label: tKB("kb_board_aria")
  });
}

// The goal, shown as a picture: three hearts on a straight line of a small
// pyramid, next to one short sentence.
function renderGoalKB() {
  const mini = pyramidHtmlKB({
    rows: 3,
    board: [1, 1, 2, 1, 2, 2],
    open: [],
    line: [0, 1, 3],
    size: 110,
    label: tKB("kb_goal_aria")
  });
  document.getElementById("kb-goal").innerHTML = '<span class="kb-goal-pic">' + mini + '</span><span class="kb-goal-text">' + tKB("kb_goal_text") + "</span>";
}

function renderKB() {
  const s = AppStateKB.state;
  if (!s) return;
  const over = s.phase === "over";
  const extra = [I18n.t("kb_hearts"), I18n.t("kb_clovers")];
  let html = "";
  s.computer.forEach((c, i) => {
    const on = !over && i === s.current;
    html += '<span class="game-player dg-player' + (on ? " game-player-active" : "") + '">' +
      symbolSvgKB(i) + '<span class="game-player-name">' + nameKB(i) + '</span> <span class="dg-player-extra">' + extra[i] + "</span></span>";
  });
  document.getElementById("kb-players-list").innerHTML = html;
  renderBoardKB();
  renderGoalKB();
  document.getElementById("undo-btn").disabled = AppStateKB.undoStack.length === 0;
  setStatusKB(over ? "" : turnStatusKB());
}

/*** Setup ***/

function cellOfKB(el) {
  while (el && el.getAttribute) {
    const v = el.getAttribute("data-cell");
    if (v !== null && v !== "") return parseInt(v, 10);
    el = el.parentNode;
  }
  return -1;
}

function initKleebergApp() {
  DiceCommon.wireMenu();
  document.getElementById("mode-ai").addEventListener("click", () => DiceCommon.setMode("ai"));
  document.getElementById("mode-offline").addEventListener("click", () => DiceCommon.setMode("hotseat"));
  document.getElementById("start-kb-game").addEventListener("click", startGameKB);
  document.getElementById("undo-btn").addEventListener("click", undoKB);
  const board = document.getElementById("kb-board");
  board.addEventListener("click", (e) => {
    const v = cellOfKB(e.target);
    if (v >= 0) moveKB(v);
  });
  board.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const v = cellOfKB(e.target);
    if (v >= 0) { e.preventDefault(); moveKB(v); }
  });
  if (window.I18n && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateKB.state) renderKB(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(KLEEBERG_SAVE_KEY) : null;
  if (saved && validStateKB(saved.state)) {
    AppStateKB.state = saved.state;
    AppStateKB.undoStack = Array.isArray(saved.undoStack) ? saved.undoStack : [];
    DiceCommon.showBoard();
    afterActionKB();
  }
}

document.addEventListener("DOMContentLoaded", initKleebergApp);
