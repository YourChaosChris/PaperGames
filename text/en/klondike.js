// text/en/klondike.js
// Rules and history texts of klondike (en). Loaded by klondike-rules.html and klondike-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    klondike_rules_title: "Klondike Rules",
    klondike_rules_intro: "A quick reference for how PaperGames plays Klondike - useful if you're rusty, or learning.",
    klondike_rules_basics_title: "The basic idea",
    klondike_term_layout: "The layout",
    klondike_rules_layout: "Cards are dealt into 7 tableau columns of 1 through 7 cards each, with only the top card of every column face-up. Four foundations (one per suit) are built up from Ace to King. The rest of the deck sits in a stock pile, drawn one card at a time onto a waste pile.",
    klondike_term_tableau: "Moving cards",
    klondike_rules_tableau: "A card can move onto a tableau column only onto a card exactly one rank higher and the opposite color, or onto any empty column, which accepts a King only. A run of several cards already stacked face-up in that same descending, alternating order can be moved together as one unit onto a valid destination.",
    klondike_term_foundation: "Foundations",
    klondike_rules_foundation: "A foundation only accepts its own suit, starting with the Ace and moving up one rank at a time. Once a card is on a foundation it stays there - foundations only receive cards, they never give them back to the tableau.",
    klondike_term_stock: "The stock and waste",
    klondike_rules_stock: "Tap the stock pile to flip its top card face-up onto the waste pile, one card at a time. Once the stock is empty, tapping it again reshuffles the whole waste pile back into the stock so you can draw through it again - PaperGames doesn't limit how many times you can redeal.",
    klondike_rules_end_title: "Finishing a game",
    klondike_term_win: "Winning",
    klondike_rules_win: "The game is won the moment all four foundations are complete, Ace through King. Not every shuffle can be won - unlike FreeCell, a Klondike deal can genuinely become unsolvable partway through, since only the top card of each tableau column is visible up front.",
    klondike_history_title: "The History of Klondike",
    klondike_history_origins_title: "A Name From the Gold Rush - Maybe",
    klondike_history_origins_p1: "Klondike belongs to a large family of one-player \"patience\" card games that spread through Europe and North America over the 19th century, most needing nothing but a standard deck and a flat surface. The specific ruleset played today - seven cascading tableau columns, four foundations built up by suit, a stock and waste pile to draw through - is first described in card-game books of the early 1900s and has gone by a variety of names since.",
    klondike_history_origins_p2: "Exactly how it came to be called \"Klondike\" is genuinely uncertain. The most-repeated story ties the name to the Klondike Gold Rush of the late 1890s, the idea being that prospectors travelling to, or wintering in, the Yukon played it to pass the time - a colorful, plausible-sounding origin that, like many card game etymologies, has never been pinned down to a documented first use. PaperGames repeats it here as the popular account, not as settled history.",
    klondike_history_spread_title: "Bundled With Windows",
    klondike_history_spread_p1: "Klondike's overwhelming popularity today owes less to its 19th-century card-table origins than to one specific piece of software: Microsoft bundled a version of it, simply named \"Solitaire\", with Windows 3.0 in 1990 - reportedly included in part to gently teach a generation of new Windows users how to click, drag, and drop with a mouse.",
    klondike_history_spread_p2: "It worked almost too well: within a few years Windows Solitaire was reputed to be one of the most-used pieces of software in the world, installed on effectively every PC that shipped with Windows whether or not its owner ever meant to open a game. It reshaped what \"solitaire\" meant to millions of people who had never played a single physical card game by that name.",
    klondike_history_modern_title: "This Version",
    klondike_history_modern_p1: "PaperGames plays the standard draw-one ruleset with no redeal limit, favoring the lower-friction version of the rules the same way this collection's FreeCell does - a fresh shuffle every game rather than a fixed set of numbered deals, and no cap on how many times you can cycle back through the stock."
});
I18n.markTextLoaded("en");
