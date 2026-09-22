// mastermind-core.js
// Dependency-free Mastermind engine. No DOM/UI here, same separation of
// concerns as every other <game>-core.js - and, like Sudoku, Minesweeper
// and Peg Solitaire, this is solitaire: the "opponent" is just a fixed
// secret code chosen once at the start, not something that reacts to you.
//
// The classic game uses six colored pegs; on a monochrome e-ink screen
// colors aren't available (and wouldn't be distinguishable even with a
// grayscale approximation), so this version uses six flat shapes instead
// - see SYMBOLS below. Everything else follows the traditional ruleset:
// a 4-symbol secret code, repeats allowed in the code unless the chosen
// difficulty forbids them, and the standard two-pass black/white peg
// scoring algorithm that never lets one peg in the secret satisfy more
// than one peg in the guess.

const MastermindCore = (function () {
  const SYMBOLS = ["circle", "square", "triangle", "diamond", "star", "cross"];
  const CODE_LENGTH = 4;

  // Easy trades a shorter guess budget for a code that can't repeat a
  // shape (strictly easier to reason about); Medium is the traditional
  // 10-guess game with repeats allowed; Hard keeps repeats but tightens
  // the guess budget further.
  const LEVELS = {
    easy: { maxGuesses: 12, allowDuplicates: false },
    medium: { maxGuesses: 10, allowDuplicates: true },
    hard: { maxGuesses: 8, allowDuplicates: true }
  };

  function levelConfig(level) {
    return LEVELS[level] || LEVELS.medium;
  }

  function generateSecret(level, rng) {
    const random = rng || Math.random;
    const cfg = levelConfig(level);
    if (!cfg.allowDuplicates) {
      // Fisher-Yates shuffle of all six shapes, then take the first four -
      // guarantees no repeats since CODE_LENGTH (4) <= SYMBOLS.length (6).
      const pool = SYMBOLS.slice();
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
      }
      return pool.slice(0, CODE_LENGTH);
    }
    const secret = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
      secret.push(SYMBOLS[Math.floor(random() * SYMBOLS.length)]);
    }
    return secret;
  }

  function createState(level, rng) {
    const normalizedLevel = LEVELS[level] ? level : "medium";
    const cfg = levelConfig(normalizedLevel);
    return {
      level: normalizedLevel,
      secret: generateSecret(normalizedLevel, rng),
      maxGuesses: cfg.maxGuesses,
      allowDuplicates: cfg.allowDuplicates,
      guesses: [],
      gameOver: false,
      won: false
    };
  }

  function cloneState(state) {
    return {
      level: state.level,
      secret: state.secret.slice(),
      maxGuesses: state.maxGuesses,
      allowDuplicates: state.allowDuplicates,
      guesses: state.guesses.map((g) => ({ guess: g.guess.slice(), black: g.black, white: g.white })),
      gameOver: state.gameOver,
      won: state.won
    };
  }

  // Standard two-pass Mastermind scoring. First pass: count exact
  // position+symbol matches (black pegs) and set those positions aside
  // on both sides. Second pass: for what's left, count symbols that
  // appear on both sides regardless of position (white pegs), consuming
  // one unit from a shared per-symbol pool each time so a single peg in
  // the secret can never satisfy more than one peg in the guess (and
  // vice versa).
  function computeFeedback(secret, guess) {
    const secretLeft = [];
    const guessLeft = [];
    let black = 0;

    for (let i = 0; i < secret.length; i++) {
      if (secret[i] === guess[i]) {
        black++;
      } else {
        secretLeft.push(secret[i]);
        guessLeft.push(guess[i]);
      }
    }

    const counts = {};
    secretLeft.forEach((s) => { counts[s] = (counts[s] || 0) + 1; });

    let white = 0;
    guessLeft.forEach((g) => {
      if (counts[g] > 0) {
        white++;
        counts[g]--;
      }
    });

    return { black, white };
  }

  function submitGuess(state, guess) {
    if (state.gameOver) return state;
    if (!Array.isArray(guess) || guess.length !== CODE_LENGTH) return state;
    if (guess.some((s) => SYMBOLS.indexOf(s) === -1)) return state;

    const { black, white } = computeFeedback(state.secret, guess);
    const next = cloneState(state);
    next.guesses.push({ guess: guess.slice(), black, white });

    if (black === CODE_LENGTH) {
      next.gameOver = true;
      next.won = true;
    } else if (next.guesses.length >= next.maxGuesses) {
      next.gameOver = true;
      next.won = false;
    }

    return next;
  }

  function guessesRemaining(state) {
    return state.maxGuesses - state.guesses.length;
  }

  return {
    SYMBOLS,
    CODE_LENGTH,
    LEVELS,
    createState,
    cloneState,
    computeFeedback,
    submitGuess,
    guessesRemaining
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = MastermindCore;
}
if (typeof window !== "undefined") {
  window.MastermindCore = MastermindCore;
}
