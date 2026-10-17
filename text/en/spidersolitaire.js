// text/en/spidersolitaire.js
// Rules and history texts of spidersolitaire (en). Loaded by spidersolitaire-rules.html and spidersolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    spidersolitaire_rules_title: "Spider Solitaire Rules",
    spidersolitaire_rules_intro: "A quick reference for how PaperGames plays Spider Solitaire - useful if you're rusty, or learning.",
    spidersolitaire_rules_basics_title: "The basic idea",
    spidersolitaire_term_layout: "The layout",
    spidersolitaire_rules_layout: "Two full decks (104 cards) are dealt into 10 tableau columns - the first 4 columns get 6 cards each, the other 6 get 5 cards each - with only the top card of every column face-up. There are no foundations. The remaining 50 cards sit in the stock, dealt out later in batches of 10.",
    spidersolitaire_term_difficulty: "Choosing a difficulty",
    spidersolitaire_rules_difficulty: "Before starting, pick how many suits are in play: 1 suit is easiest (every card of the right rank can extend any run), 2 suits is medium, and 4 suits is the traditional, hardest version - exactly like two real decks shuffled together.",
    spidersolitaire_term_tableau: "Moving a single card",
    spidersolitaire_rules_tableau: "A card can move onto a tableau column only onto a card exactly one rank higher - suit doesn't matter for this. An empty column accepts any card, or any valid run, with no rank restriction at all.",
    spidersolitaire_term_group: "Moving a group of cards",
    spidersolitaire_rules_group: "Several cards already stacked together can only be moved as one unit if they're already sitting in a properly descending run of the SAME suit (for example a 5-4-3 of Hearts, in that exact order) - moving a run that mixes suits, even if the ranks descend correctly, isn't allowed. Moving a group still follows the same-rank-higher placement rule above. Once cards move away, the card newly exposed on top of its column automatically turns face-up.",
    spidersolitaire_term_stock: "The stock",
    spidersolitaire_rules_stock: "Tap the stock to deal its next batch of 10 cards, one face-up card onto each of the 10 columns. Dealing is blocked while any column is empty - clear it first (by moving its cards elsewhere or completing a run through it) before the stock can be dealt again.",
    spidersolitaire_term_sequences: "Completing a sequence",
    spidersolitaire_rules_sequences: "Whenever a complete run from King down to Ace, all the same suit and in order, ends up contiguous in a column, it's detected automatically and removed - no need for it to be the only cards in that column, just properly stacked at the point where they'd naturally lift off together. Each completed run adds one to the counter above the board.",
    spidersolitaire_rules_end_title: "Finishing a game",
    spidersolitaire_term_win: "Winning",
    spidersolitaire_rules_win: "The game is won once all 8 King-to-Ace runs have been assembled and removed - that's 104 cards / 13, the same total regardless of which suit-count difficulty you picked.",
    spidersolitaire_history_title: "The History of Spider Solitaire",
    spidersolitaire_history_origins_title: "An Undocumented Favorite",
    spidersolitaire_history_origins_p1: "Unlike some card games with a traceable inventor, Spider Solitaire's exact origin is not precisely documented - like many patience games, it evolved through popular play rather than being credited to any one person or a single first publication. What is clear is that by the early-to-mid 20th century, it had already become a well-established favorite among the family of two-deck patience games played on paper and felt long before computers existed.",
    spidersolitaire_history_origins_p2: "Its name almost certainly nods to its own difficulty and structure rather than to any spider imagery on the cards: eight foundation-like runs to weave together (echoing a spider's eight legs) out of ten sprawling tableau columns, with no color or foundation-suit help along the way once four suits are in play.",
    spidersolitaire_history_spread_title: "Bundled With Windows",
    spidersolitaire_history_spread_p1: "Spider Solitaire's most famous moment of mass popularization came in 1998, when Microsoft bundled it as a built-in game in Windows - first appearing in the Windows 98 Plus! pack and the Windows Me era, then becoming a standard inclusion from Windows XP onward.",
    spidersolitaire_history_spread_p2: "That one decision introduced Spider to a huge global audience the same way Windows had earlier done for Klondike (simply called \"Solitaire\") and later for FreeCell - turning a card game that had lived quietly on physical card tables for decades into one of the most-played pieces of software in the world, all without its players ever needing to own an actual deck of cards.",
    spidersolitaire_history_modern_title: "This Version",
    spidersolitaire_history_modern_p1: "PaperGames plays the standard rules with all three traditional suit-count difficulties selectable up front - 1 suit, 2 suits, or the full 4-suit game - the same lower-friction, fresh-shuffle-every-game approach this collection's Klondike and FreeCell already use, adapted for Spider's own ten-column, no-foundation layout."
});
I18n.markTextLoaded("en");
