// text/en/minesweeper.js
// Rules and history texts of minesweeper (en). Loaded by minesweeper-rules.html and minesweeper-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    minesweeper_rules_title: "Minesweeper Rules",
    minesweeper_rules_intro: "A quick reference for how PaperGames plays Minesweeper - useful if you're rusty, or learning.",
    minesweeper_rules_basics_title: "The basic idea",
    minesweeper_term_board: "The grid and the first click",
    minesweeper_rules_board: "Hidden mines are scattered across the grid. Your first reveal is always guaranteed safe - the mines are only placed afterward, avoiding that cell and everything around it - so the game never ends before it begins.",
    minesweeper_term_numbers: "Reading the numbers",
    minesweeper_rules_numbers: "Revealing a safe cell shows a number: how many mines are hiding in its eight neighboring cells. A blank cell means zero, and revealing it automatically opens up every connected blank area for you.",
    minesweeper_term_flags: "Flagging",
    minesweeper_rules_flags: "Mark a cell you believe hides a mine with a flag, using Flag mode (for touchscreens) or a right-click (on a desktop browser) - flagged cells can't be accidentally revealed. Clicking an already-revealed number whose flagged neighbors match its count reveals the rest of its neighbors at once, exactly like a middle-click in the classic desktop game - but a wrongly placed flag can still cost you the game this way.",
    minesweeper_rules_end_title: "How a game ends",
    minesweeper_term_win: "Winning",
    minesweeper_rules_win: "Reveal every cell that isn't a mine and you've cleared the board.",
    minesweeper_term_loss: "Losing",
    minesweeper_rules_loss: "Reveal a mine and the game ends immediately - every mine on the board is shown, with the one that got you marked apart from the rest.",
    minesweeper_history_title: "The History of Minesweeper",
    minesweeper_history_origins_title: "From Mainframes to the Desktop",
    minesweeper_history_origins_p1: "Minesweeper-style reveal-and-deduce games trace back to the early 1960s and appeared under various names on mainframe and early personal computers through the 1980s, including a 1989 Windows/OS2 version called 'Mined-Out' and several freeware clones with names like 'RLogic' and 'Cube'.",
    minesweeper_history_origins_p2: "The Windows version that made the game widely known goes back to two Microsoft employees: Curt Johnson first wrote the game for IBM's OS/2, and Robert Donner ported it to Windows. It first came out in 1990 in the Microsoft Entertainment Pack, and from 1992 it was part of the standard installation of Windows 3.1, where it replaced the earlier Windows game Reversi.",
    minesweeper_history_spread_title: "Installed on Every Desk",
    minesweeper_history_spread_p1: "Because Windows shipped on such an overwhelming share of the world's PCs through the 1990s and 2000s, Minesweeper became one of the most-played computer games in history almost by default - installed everywhere, requiring no manual, and playable in the idle minutes between real work.",
    minesweeper_history_spread_p2: "The guaranteed-safe first click, now considered a core part of the rules, was itself a refinement: the original 1992 version could occasionally kill you on the very first click, a frustration later versions engineered away by deferring mine placement until after that first reveal - the same approach used here.",
    minesweeper_history_modern_title: "A Genuinely Hard Puzzle",
    minesweeper_history_modern_p1: "Beyond the nostalgia, Minesweeper turns out to be mathematically serious: in 2000, Richard Kaye proved that determining whether a given partially-revealed Minesweeper board has a solution consistent with its clues is NP-complete, putting it in the same computational complexity class as notoriously hard problems like the traveling salesman problem.",
    minesweeper_history_modern_p2: "That result means there's no known shortcut algorithm that always solves an arbitrary Minesweeper position quickly - in the hardest cases, a player (or a computer) may be reduced to a genuine 50/50 guess with no way to deduce the safe cell from logic alone, which is exactly the moment every seasoned player has learned to dread."
});
I18n.markTextLoaded("en");
