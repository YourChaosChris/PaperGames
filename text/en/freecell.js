// text/en/freecell.js
// Rules and history texts of freecell (en). Loaded by freecell-rules.html and freecell-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    freecell_rules_title: "FreeCell Rules",
    freecell_rules_intro: "A quick reference for how PaperGames plays FreeCell - useful if you're rusty, or learning.",
    freecell_rules_basics_title: "The basic idea",
    freecell_term_layout: "The layout",
    freecell_rules_layout: "All 52 cards are dealt face-up into 8 tableau columns from the start - four cards short of a full 7 in the last four columns. Four free cells above the columns can each hold exactly one card, and four foundations (one per suit) are built up from Ace to King.",
    freecell_term_tableau: "Moving cards",
    freecell_rules_tableau: "A card can move onto a tableau column only onto a card exactly one rank higher and the opposite color, or onto any empty column. A run of several cards already stacked in that same descending, alternating order can be moved together as one 'supermove', up to a limit set by how many free cells and empty columns are available to relay them through.",
    freecell_term_foundation: "Foundations",
    freecell_rules_foundation: "A foundation only accepts its own suit, starting with the Ace and moving up one rank at a time. Once a card is on a foundation it stays there - foundations only receive cards, they never give them back to the tableau.",
    freecell_rules_end_title: "Finishing a game",
    freecell_term_win: "Winning",
    freecell_rules_win: "The game is won the moment all four foundations are complete, Ace through King. Unlike Mahjong Solitaire's deal here, a FreeCell deal is just a plain shuffle - the overwhelming majority are solvable, exactly like the real game, but PaperGames makes no special guarantee for any one deal.",
    freecell_history_title: "The History of FreeCell",
    freecell_history_origins_title: "An Open-Information Card Game",
    freecell_history_origins_p1: "FreeCell descends from a family of \"open\" or \"Baker's Game\"-style patience games dating back to at least the early 20th century, in which every card is dealt face-up from the very first move - unlike most solitaire games, nothing is ever hidden, so a skilled enough player (or computer) can in principle work out whether a given deal is winnable before making a single move.",
    freecell_history_origins_p2: "The free cells themselves - small holding areas for temporarily parking individual cards - were not new: older games such as Baker's Game already had them. Paul Alfille's change was to build the tableau columns in alternating colors instead of by suit, and in 1978 he programmed the first computer version, called FreeCell, for the PLATO system, giving the game the ruleset played today.",
    freecell_history_spread_title: "Bundled With Windows",
    freecell_history_spread_p1: "FreeCell became a household name after Microsoft included it with Windows starting in 1995, alongside Solitaire and Minesweeper, introducing it to hundreds of millions of PC users who had never encountered it before - much like Minesweeper's own path to fame.",
    freecell_history_spread_p2: "Microsoft's version shipped with a fixed set of 32,000 numbered deals rather than a fresh random shuffle each time, which let players compare notes and replay a specific deal - a convention this PaperGames version doesn't follow, generating a genuinely fresh shuffle every time instead.",
    freecell_history_modern_title: "The Deal That (Almost) Always Wins",
    freecell_history_modern_p1: "Because every card is visible from the start, FreeCell is unusually well-suited to computer analysis: of Microsoft's original 32,000 numbered deals, exhaustive solver searches found that all but one - deal number 11,982 - are solvable, a piece of trivia FreeCell enthusiasts still bring up decades later.",
    freecell_history_modern_p2: "Later research pushed the analysis further, confirming that only a handful of deals among the first million numbered games are unsolvable - which is why a plain random shuffle, as this version uses, is such a safe bet: the odds of landing on one of those rare exceptions are vanishingly small."
});
I18n.markTextLoaded("en");
