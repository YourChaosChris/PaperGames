// pairs-app.js
// Wires PairsCore/PairsAi to the pairs.html UI.
//
// E-ink rule for this game: nothing ever turns back by itself. The first
// card stays open, the second card stays open, and then nothing happens
// until the next tap - anywhere on the board. If the two cards were a
// pair they are taken at once (the same player goes again); if not, that
// next tap turns both back and passes the turn. The same holds after the
// computer's turn: its two cards stay open until the player taps.
//
// The 18 card faces are inline black-and-white SVG shapes that differ in
// outline, not in shade: no grey fills, no emoji, no raster images. The
// "Animals", "Fruit and vegetables" and "Vehicles" motifs swap them for
// 18 line drawings each (pairs-animals.js, pairs-food.js,
// pairs-vehicles.js); the rules stay the same. Taken pairs leave an
// empty, dashed slot.

const PAIRS_SYMBOLS = [
  // 0 disc
  '<circle cx="50" cy="50" r="32"/>',
  // 1 square
  '<rect x="20" y="20" width="60" height="60"/>',
  // 2 triangle
  '<polygon points="50,14 88,82 12,82"/>',
  // 3 five-pointed star
  '<polygon points="50,8 61,38 93,38 67,57 77,89 50,70 23,89 33,57 7,38 39,38"/>',
  // 4 plus
  '<polygon points="40,12 60,12 60,40 88,40 88,60 60,60 60,88 40,88 40,60 12,60 12,40 40,40"/>',
  // 5 diamond
  '<polygon points="50,8 86,50 50,92 14,50"/>',
  // 6 half disc
  '<path d="M14 62 A36 36 0 0 1 86 62 Z"/>',
  // 7 spiral (stroke only)
  '<path d="M50 50 m0 -6 a6 6 0 1 1 -6 6 a12 12 0 0 1 12 -12 a18 18 0 0 1 18 18 a24 24 0 0 1 -24 24 a30 30 0 0 1 -30 -30 a36 36 0 0 1 36 -36" fill="none" stroke="#111" stroke-width="7" stroke-linecap="round"/>',
  // 8 sun: disc with eight rays
  '<circle cx="50" cy="50" r="18"/><g stroke="#111" stroke-width="8" stroke-linecap="round"><line x1="50" y1="8" x2="50" y2="22"/><line x1="50" y1="78" x2="50" y2="92"/><line x1="8" y1="50" x2="22" y2="50"/><line x1="78" y1="50" x2="92" y2="50"/><line x1="20" y1="20" x2="30" y2="30"/><line x1="70" y1="70" x2="80" y2="80"/><line x1="80" y1="20" x2="70" y2="30"/><line x1="30" y1="70" x2="20" y2="80"/></g>',
  // 9 heart
  '<path d="M50 86 C30 70 10 56 10 36 C10 22 21 12 33 12 C41 12 47 17 50 24 C53 17 59 12 67 12 C79 12 90 22 90 36 C90 56 70 70 50 86 Z"/>',
  // 10 crescent moon
  '<circle cx="44" cy="50" r="38"/><circle cx="64" cy="40" r="33" fill="#fff"/>',
  // 11 hexagon
  '<polygon points="50,10 85,30 85,70 50,90 15,70 15,30"/>',
  // 12 arrow pointing up
  '<polygon points="50,8 86,46 64,46 64,92 36,92 36,46 14,46"/>',
  // 13 diagonal cross (X)
  '<path d="M20 20 L80 80 M80 20 L20 80" fill="none" stroke="#111" stroke-width="16" stroke-linecap="round"/>',
  // 14 lightning bolt
  '<polygon points="58,6 22,56 46,56 38,94 78,40 54,40 64,6"/>',
  // 15 three dots
  '<circle cx="50" cy="26" r="14"/><circle cx="26" cy="70" r="14"/><circle cx="74" cy="70" r="14"/>',
  // 16 hourglass
  '<polygon points="16,10 84,10 54,50 84,90 16,90 46,50"/>',
  // 17 wave (stroke only)
  '<path d="M8 50 C20 26 32 26 44 50 C56 74 68 74 80 50 C84 42 88 38 92 38" fill="none" stroke="#111" stroke-width="10" stroke-linecap="round"/>'
];

function pairsSymbolSvg(n) {
  return '<svg class="pairs-symbol" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g fill="#111">' + PAIRS_SYMBOLS[n] + "</g></svg>";
}

// English animal names for screen readers; I18n translates them through
// the msg_pairs_animal_* keys.
const PAIRS_ANIMAL_NAMES = {
  dog: "Dog", cat: "Cat", rabbit: "Rabbit", mouse: "Mouse", hedgehog: "Hedgehog", owl: "Owl",
  fish: "Fish", turtle: "Turtle", snail: "Snail", duck: "Duck", frog: "Frog", pig: "Pig",
  elephant: "Elephant", butterfly: "Butterfly", bee: "Bee", lion: "Lion", giraffe: "Giraffe", sheep: "Sheep"
};

// Picture sets besides the shapes: module (global name), its English
// screen-reader names.
const PAIRS_MOTIFS = {
  animals: { lib: "PairsAnimals", labels: PAIRS_ANIMAL_NAMES },
  food: { lib: "PairsFood", labels: null },
  vehicles: { lib: "PairsVehicles", labels: null }
};

function pairsMotifValue(v) {
  return PAIRS_MOTIFS[v] ? v : "shapes";
}

function pairsMotifLib() {
  const m = PAIRS_MOTIFS[AppStatePairs.motif];
  return m && typeof window !== "undefined" ? window[m.lib] || null : null;
}

function pairsMotif() {
  return pairsMotifLib() ? AppStatePairs.motif : "shapes";
}

function pairsFaceSvg(n) {
  const lib = pairsMotifLib();
  return lib ? lib.svg(n) : pairsSymbolSvg(n);
}

function pairsFaceLabel(n) {
  const lib = pairsMotifLib();
  if (!lib) return "symbol " + (n + 1);
  const labels = PAIRS_MOTIFS[AppStatePairs.motif].labels || lib.LABELS;
  return labels[lib.NAMES[n]];
}

const AppStatePairs = {
  opponent: "two",          // "solo" | "two" | "ai"
  motif: "shapes",          // "shapes" | "animals" | "food" | "vehicles"
  aiLevel: 2,
  humanPlayer: "1",         // vs the computer
  state: null,
  seen: [],                 // card indices in the order they were shown face up
  gameOver: false
};

const PAIRS_SAVE_KEY = "einkchess_save_pairs";

function savePairsGame() {
  if (typeof GameStorage === "undefined" || !AppStatePairs.state) return;
  GameStorage.save(PAIRS_SAVE_KEY, {
    opponent: AppStatePairs.opponent,
    aiLevel: AppStatePairs.aiLevel,
    humanPlayer: AppStatePairs.humanPlayer,
    motif: AppStatePairs.motif,
    state: AppStatePairs.state,
    seen: AppStatePairs.seen
  });
}

function clearSavedPairsGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(PAIRS_SAVE_KEY);
}

function playerNamePairs(p) {
  return p === "1" ? "Player 1" : "Player 2";
}

function setStatusPairs(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function isAiTurnPairs() {
  const s = AppStatePairs.state;
  return AppStatePairs.opponent === "ai" && s && !s.gameOver && s.turn !== AppStatePairs.humanPlayer;
}

// What to do next, in words - shown after every tap in every state.
function promptPairs() {
  const s = AppStatePairs.state;
  if (!s || s.gameOver) return "";
  if (s.pendingMiss) return "No pair. Tap anywhere to turn both cards back.";
  if (isAiTurnPairs()) return "Computer thinking…";
  if (s.solo) return s.open.length ? "Turn over a second card." : "Turn over a card.";
  return playerNamePairs(s.turn) + (s.open.length ? ": turn over a second card." : ": turn over a card.");
}

function initPairsApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const startBtn = document.getElementById("start-pairs-game");
  const sizeSelect = document.getElementById("pairs-size");
  const opponentSelect = document.getElementById("pairs-opponent");
  const motifSelect = document.getElementById("pairs-motif");
  const boardContainer = document.getElementById("board-container");

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const opening = settingsPanel.classList.contains("hidden");
      settingsPanel.classList.toggle("hidden", !opening);
      I18n.setKey(menuToggle, opening ? "menu_close" : "menu_toggle");
    });
  }

  startBtn.addEventListener("click", () => {
    const size = sizeSelect ? sizeSelect.value : PairsCore.DEFAULT_SIZE;
    const choice = opponentSelect ? opponentSelect.value : "two";
    let opponent = "two", level = 0;
    if (choice === "solo") opponent = "solo";
    else if (choice !== "two") { opponent = "ai"; level = parseInt(choice, 10) || 2; }
    AppStatePairs.motif = pairsMotifValue(motifSelect ? motifSelect.value : "shapes");
    startNewGamePairs(size, opponent, level);
  });

  // A tap anywhere on the board after a miss turns the two cards back.
  if (boardContainer) {
    boardContainer.addEventListener("click", (evt) => {
      const s = AppStatePairs.state;
      if (!s || !s.pendingMiss || s.gameOver) return;
      evt.stopPropagation();
      AppStatePairs.state = PairsCore.resolveMiss(s);
      afterChangePairs();
    }, true);
  }

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(PAIRS_SAVE_KEY) : null;
  if (saved && saved.state && Array.isArray(saved.state.cards) && !saved.state.gameOver) {
    AppStatePairs.opponent = saved.opponent === "solo" || saved.opponent === "ai" ? saved.opponent : "two";
    AppStatePairs.aiLevel = saved.aiLevel || 2;
    AppStatePairs.humanPlayer = saved.humanPlayer === "2" ? "2" : "1";
    AppStatePairs.motif = pairsMotifValue(saved.motif);
    AppStatePairs.state = saved.state;
    AppStatePairs.seen = Array.isArray(saved.seen) ? saved.seen : [];
    AppStatePairs.gameOver = false;
    if (sizeSelect) sizeSelect.value = saved.state.size || PairsCore.DEFAULT_SIZE;
    if (motifSelect) motifSelect.value = AppStatePairs.motif;
    showBoardSectionPairs();
    buildPairsBoardDOM();
    afterChangePairs();
  }
}

function startNewGamePairs(size, opponent, level) {
  AppStatePairs.opponent = opponent;
  AppStatePairs.aiLevel = level || 2;
  AppStatePairs.humanPlayer = opponent === "ai" ? RandomStart.choose("1", ["1", "2"]) : "1";
  AppStatePairs.state = PairsCore.createState(size, opponent === "solo");
  AppStatePairs.seen = [];
  AppStatePairs.gameOver = false;
  if (window.ResultModal) window.ResultModal.hide();
  setStatusPairs("game-result", "");
  showBoardSectionPairs();
  buildPairsBoardDOM();

  if (opponent === "ai") {
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusPairs("offline-pairs-status",
      RandomStart.label("You play " + playerNamePairs(AppStatePairs.humanPlayer) + ", computer level: " + (levelNames[level] || level) + ".") +
      (level === 3 ? " On Hard the computer remembers every card it has seen." : ""));
  } else if (opponent === "two") {
    setStatusPairs("offline-pairs-status", "Local 2-player game (no computer).");
  } else {
    setStatusPairs("offline-pairs-status", "");
  }
  afterChangePairs();
}

function onPairsCardClick(i) {
  const s = AppStatePairs.state;
  if (!s) return;
  if (s.gameOver) {
    setStatusPairs("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (isAiTurnPairs()) {
    setStatusPairs("board-info", "Computer to move.");
    return;
  }
  if (!PairsCore.canFlip(s, i)) return; // an open or taken card - nothing to do
  flipPairs(i);
}

function flipPairs(i) {
  const r = PairsCore.flip(AppStatePairs.state, i);
  if (!r.result) return;
  AppStatePairs.state = r.state;
  AppStatePairs.seen.push(i);
  afterChangePairs(r.result);
}

// Redraw, save, announce - and let the computer move when it is its turn.
function afterChangePairs(result) {
  const s = AppStatePairs.state;
  updatePairsBoard();
  updateLabelsPairs();

  if (s.gameOver) {
    finishPairs();
    return;
  }
  let text = promptPairs();
  if (result === "pair" && !isAiTurnPairs()) {
    text = s.solo ? "Pair found! Turn over a card." : playerNamePairs(s.turn) + " found a pair and goes again.";
  }
  setStatusPairs("board-info", text);
  savePairsGame();

  if (isAiTurnPairs() && !s.pendingMiss) {
    const scheduledFor = s;
    setTimeout(() => {
      if (AppStatePairs.state !== scheduledFor || !isAiTurnPairs()) return;
      const card = PairsAi.chooseCard(scheduledFor, AppStatePairs.seen, AppStatePairs.aiLevel);
      if (card !== null) flipPairs(card);
    }, AiPacing.delay(500));
  }
}

function finishPairs() {
  const s = AppStatePairs.state;
  AppStatePairs.gameOver = true;
  clearSavedPairsGame();
  let title, message;
  if (s.winner === "solo") {
    title = "Solved!";
    message = "All pairs found in " + s.moves + " moves.";
  } else if (s.winner === "draw") {
    title = "Draw";
    message = "Draw - " + s.scores["1"] + " pairs each.";
    recordPairsStats("draw");
  } else {
    const loser = PairsCore.otherPlayer(s.winner);
    title = AppStatePairs.opponent === "ai" ? (s.winner === AppStatePairs.humanPlayer ? "You win!" : "You lose") : playerNamePairs(s.winner) + " wins";
    message = playerNamePairs(s.winner) + " wins with " + s.scores[s.winner] + " pairs to " + s.scores[loser] + ".";
    recordPairsStats(s.winner === AppStatePairs.humanPlayer ? "win" : "loss");
  }
  setStatusPairs("game-result", message);
  setStatusPairs("board-info", message);
  if (window.ResultModal) window.ResultModal.show(title, message);
}

function recordPairsStats(outcome) {
  if (typeof GameStats === "undefined" || AppStatePairs.opponent !== "ai") return;
  GameStats.record("pairs", outcome);
}

function showBoardSectionPairs() {
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

/*** Board: cols x rows buttons, placed by percentage in a JS-sized box ***/

function buildPairsBoardDOM() {
  const boardEl = document.getElementById("pairs-board");
  const s = AppStatePairs.state;
  if (!boardEl || !s) return;
  boardEl.innerHTML = "";
  boardEl.dataset.cols = s.cols;
  boardEl.dataset.rows = s.rows;
  const w = 100 / s.cols, h = 100 / s.rows;
  for (let i = 0; i < s.cards.length; i++) {
    const r = Math.floor(i / s.cols), c = i % s.cols;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pairs-card";
    btn.dataset.card = i;
    btn.style.left = (c * w) + "%";
    btn.style.top = (r * h) + "%";
    btn.style.width = w + "%";
    btn.style.height = h + "%";
    btn.addEventListener("click", () => onPairsCardClick(i));
    boardEl.appendChild(btn);
  }
  ensurePairsBoardAspect();
  if (window.requestAnimationFrame) window.requestAnimationFrame(ensurePairsBoardAspect);
  else setTimeout(ensurePairsBoardAspect, 0);
  ensurePairsResizeHandler();
}

let pairsResizeHandlerAttached = false;
let pairsResizeTimeoutId = null;

// Square cards, so that even 4 x 4 and 6 x 6 fit on a 632 x 840 screen
// below the controls.
function ensurePairsBoardAspect() {
  const boardEl = document.getElementById("pairs-board");
  const s = AppStatePairs.state;
  if (!boardEl || !s) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = (rect.width / s.cols * s.rows) + "px";
}

function ensurePairsResizeHandler() {
  if (pairsResizeHandlerAttached) return;
  pairsResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (pairsResizeTimeoutId !== null) clearTimeout(pairsResizeTimeoutId);
    pairsResizeTimeoutId = setTimeout(() => {
      pairsResizeTimeoutId = null;
      ensurePairsBoardAspect();
    }, 150);
  });
}

function updatePairsBoard() {
  const boardEl = document.getElementById("pairs-board");
  const s = AppStatePairs.state;
  if (!boardEl || !s) return;
  boardEl.querySelectorAll(".pairs-card").forEach((btn) => {
    const i = parseInt(btn.dataset.card, 10);
    const taken = s.taken[i] !== null;
    const open = s.open.indexOf(i) !== -1;
    const view = taken ? "taken" : open ? "open-" + pairsMotif() + "-" + s.cards[i] : "down";
    if (btn.dataset.view !== view) { // unchanged cards keep their content - fewer e-ink redraws
      btn.dataset.view = view;
      btn.innerHTML = open ? pairsFaceSvg(s.cards[i]) : "";
    }
    btn.classList.toggle("pairs-card-down", !taken && !open);
    btn.classList.toggle("pairs-card-open", open);
    btn.classList.toggle("pairs-card-taken", taken);
    const r = Math.floor(i / s.cols) + 1, c = i % s.cols + 1;
    let label = "Row " + r + ", column " + c + ", ";
    label += taken ? "pair found" : open ? pairsFaceLabel(s.cards[i]) : "face down";
    I18n.setAria(btn, label);
  });
  ensurePairsBoardAspect();
}

function updateLabelsPairs() {
  const s = AppStatePairs.state;
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, s && s.moves ? "Move " + s.moves : "");
  const score = document.getElementById("score-line");
  const scoreText = document.getElementById("score-pairs");
  if (!score || !scoreText || !s) return;
  score.classList.remove("hidden");
  if (s.solo) {
    I18n.setMsg(scoreText, "Pairs found: " + s.scores["1"] + "/" + PairsCore.pairCount(s));
  } else {
    I18n.setMsg(scoreText, "Pairs – Player 1: " + s.scores["1"] + " · Player 2: " + s.scores["2"]);
  }
}

document.addEventListener("DOMContentLoaded", initPairsApp);
