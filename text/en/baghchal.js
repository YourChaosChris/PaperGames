// text/en/baghchal.js
// Rules and history texts of baghchal (en). Loaded by baghchal-rules.html and baghchal-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    baghchal_rules_title: "Bagh-Chal Rules",
    baghchal_rules_intro: "A quick reference for how PaperGames plays Bagh-Chal (\"Tigers and Goats\") - useful if you're rusty, or learning.",
    baghchal_rules_basics_title: "The basic idea",
    baghchal_term_board: "The board",
    baghchal_rules_board: "25 points in a 5x5 grid, connected by horizontal, vertical, and some diagonal lines - the same alquerque-style lattice as Fanorona's board, just square: the four corners and the center are full 8-direction hubs, and diagonals fan out from there, giving the board its distinctive lattice of triangles. Four tigers (bagh) start on the four corners. The other 21 points start empty - the 20 goats (bakhera) aren't on the board yet.",
    baghchal_term_placement: "Placement phase",
    baghchal_rules_placement: "Goats move first each turn: the goat player places one new goat on any empty point. Then the tiger player moves (see below) - tigers can already move and capture from turn one, even while goats are still being placed. This continues until all 20 goats are on the board.",
    baghchal_term_movement: "Movement phase",
    baghchal_rules_movement: "Once every goat has been placed, both sides just move: each turn, slide one of your own pieces one step along a connecting line to an adjacent empty point.",
    baghchal_term_capture: "Capturing",
    baghchal_rules_capture: "A tiger next to a goat, in a straight line along one of the board's real connections, may jump over it to the empty point immediately beyond, removing the goat. Capturing here is optional, not forced: a tiger with a capture available may play a quiet move instead if it prefers to. (Some traditional rule sets make capturing mandatory whenever possible - this is a documented, deliberate choice for the more common modern ruleset, not an oversight.) Goats never capture.",
    baghchal_rules_example_title: "Worked example: a tiger's capture",
    baghchal_rules_example_intro: "In the mini-diagram below, ▲ is a tiger, ○ is a goat, and the dashed circle is the empty point the tiger is about to jump to.",
    baghchal_rules_example_caption: "The tiger at A is next to a goat at B, and the point C directly beyond it (in the same direction, along a real board line) is empty. The tiger may jump A→C, removing the goat at B. If C were occupied, or A-B-C weren't a straight line along an actual board connection, the jump would not be legal.",
    baghchal_rules_end_title: "How a game ends",
    baghchal_term_tiger_win: "Tigers win",
    baghchal_rules_tiger_win: "By capturing 5 goats in total - the standard threshold (some regional variants use a different number, but 5 is the most common).",
    baghchal_term_goat_win: "Goats win",
    baghchal_rules_goat_win: "By trapping every one of the 4 tigers so that the tiger to move has no legal move at all - no quiet move and no capture, for any of its tigers.",
    baghchal_term_resignation: "Resignation",
    baghchal_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    baghchal_history_title: "The History of Bagh-Chal",
    baghchal_history_origins_title: "An Ancient Game of Uncertain Origin",
    baghchal_history_origins_p1: "Nobody can date Bagh-Chal precisely. Like most traditional board games played on scratched-out dirt or stone rather than preserved manuscripts, it left no single founding document - only a long, continuous tradition of play across Nepal, particularly strong in the hill regions around the Kathmandu Valley. The name itself is plain and descriptive: \"bagh\" means tiger, \"chal\" means move - Tigers' Move, or as it's usually rendered in English, Tigers and Goats.",
    baghchal_history_origins_p2: "The board itself - a 5x5 lattice of orthogonal and diagonal lines - is the same alquerque-family geometry found under many other traditional games across Asia, Europe and Africa (PaperGames' own Fanorona, from Madagascar, is a well-documented example of that same wider family). What makes Bagh-Chal distinct isn't the board but the asymmetry built on top of it: a small number of powerful hunters against a large, initially-off-the-board flock trying to out-number and immobilize them.",
    baghchal_history_family_title: "Part of a Worldwide Family of Hunt Games",
    baghchal_history_family_p1: "Bagh-Chal belongs to a broad, independently-invented family of \"hunt games\" found all over the world: unequal numbers of pieces with completely different goals, rather than mirror-image armies. Fox and Geese, played across Europe for centuries, is a close cousin in spirit; so are the various Tafl (Viking chess) games of Northern Europe, where a king's small guard tries to escape a much larger besieging force. None of these games are known to derive from one another - they're best understood as the same simple, compelling idea (a few strong pieces vs. many weak ones, escape/survive vs. capture/trap) being rediscovered independently in different cultures.",
    baghchal_history_family_p2: "In Nepal, Bagh-Chal has long been associated with Dashain, the country's largest and most important Hindu festival: a multi-week autumn celebration during which extended families gather, and board games - Bagh-Chal especially - are a traditional way to pass the long visiting hours, alongside cards and other games. That festival association has helped keep the game alive across generations even as other forms of entertainment have arrived.",
    baghchal_history_modern_title: "Nepal's Board Game Today - and a Subject of Computer Study",
    baghchal_history_modern_p1: "Bagh-Chal remains widely recognized as Nepal's national or most iconic traditional board game, played casually with hand-drawn boards and bottle caps or pebbles as pieces just as often as with carved wooden sets, and it has followed the Nepali diaspora abroad. It has also crossed over into mobile apps and online play, introducing it to players who have never held a physical board.",
    baghchal_history_modern_p2: "The game has drawn real academic attention too: it has been studied in combinatorial game theory and weakly solved by computer analysis, with results for some rule variants showing that the goat side can force at least a draw with perfect play - a rare, hard-won piece of certainty about a game whose deeper strategy had been argued over by human players for a very long time."
});
I18n.markTextLoaded("en");
