// text/en/pyramidsolitaire.js
// Rules and history texts of pyramidsolitaire (en). Loaded by pyramidsolitaire-rules.html and pyramidsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    pyramidsolitaire_rules_title: "Pyramid Solitaire Rules",
    pyramidsolitaire_rules_intro: "A quick reference for how PaperGames plays Pyramid Solitaire - useful if you're rusty, or learning.",
    pyramidsolitaire_rules_basics_title: "The basic idea",
    pyramidsolitaire_term_layout: "The layout",
    pyramidsolitaire_rules_layout: "28 cards are dealt face-up into a triangle of 7 rows: 1 card at the top, 2 below it, and so on down to 7 cards in the bottom row, each card resting above and between the two cards below it. The remaining 24 cards form the stock, dealt one at a time face-up onto a waste pile.",
    pyramidsolitaire_term_pairing: "Pairing to 13",
    pyramidsolitaire_rules_pairing: "Cards are worth their face value for this: Ace = 1, 2 through 10 as printed, Jack = 11, Queen = 12, King = 13. Remove any two available cards whose values add up to exactly 13 - for example a 5 and an 8, a 9 and a 4, or a Jack (11) and a 2. A King is already worth 13 on its own, so it's removed alone, with no partner needed.",
    pyramidsolitaire_term_exposed: "Exposed cards",
    pyramidsolitaire_rules_exposed: "A card in the pyramid can only be picked once both cards resting on it in the row below are gone - the bottom row starts already exposed, since nothing is below it. Only the pyramid's exposed cards and the waste pile's current top card can ever be removed; a covered pyramid card is shown dimmed and can't be picked yet, even though you can see what it is.",
    pyramidsolitaire_term_stock: "The stock, waste, and redeals",
    pyramidsolitaire_rules_stock: "Tap the stock pile to flip its top card face-up onto the waste pile, one card at a time - only the waste's current top card is available for pairing. Once the stock runs out, tapping it again redeals the whole waste pile back into the stock so you can draw through it again, up to 2 times per game. The remaining redeal count is always shown next to the stock.",
    pyramidsolitaire_rules_example_title: "A worked example",
    pyramidsolitaire_term_example: "Clearing a pair",
    pyramidsolitaire_rules_example: "Say the bottom row has an exposed 9 and, elsewhere in the pyramid, an exposed 4 - clicking the 9 and then the 4 removes them both, since 9 + 4 = 13. If that 4 was the only card resting on a 6 in the row above, and its neighbor below the 6 is also already gone, the 6 becomes exposed and can now be paired too - say with a 7 sitting on the waste pile's top. Clearing cards this way keeps opening up the rows above until, ideally, the whole pyramid is gone.",
    pyramidsolitaire_rules_end_title: "Finishing a game",
    pyramidsolitaire_term_win: "Winning",
    pyramidsolitaire_rules_win: "The game is won the moment all 28 pyramid cards are cleared - the stock and waste piles don't need to be emptied too, which is the standard win condition most versions of this game use.",
    pyramidsolitaire_term_lose: "Getting stuck",
    pyramidsolitaire_rules_lose: "If the stock is empty, no redeals are left, and no King or sum-to-13 pair is available among the exposed pyramid cards and the waste's top card, the game is over as a loss - PaperGames shows this clearly rather than leaving you stuck with no moves and no explanation.",
    pyramidsolitaire_history_title: "The History of Pyramid Solitaire",
    pyramidsolitaire_history_origins_title: "An Older, Loosely Documented Game",
    pyramidsolitaire_history_origins_p1: "Pyramid belongs to the same large family of one-player \"patience\" card games as Klondike and FreeCell, most of which spread through 19th- and early-20th-century Europe and North America under a variety of regional names and minor rule variations. Like most classic solitaires, Pyramid's exact origin - who first laid 28 cards into a triangle and started pairing them off to 13 - isn't pinned down to any single documented source or date.",
    pyramidsolitaire_history_origins_p2: "What is clear is what sets it apart from the rest of the family: while Klondike, FreeCell, and Spider are all, at heart, about building descending sequences of cards, Pyramid's defining mechanic is arithmetic - removing pairs whose values sum to exactly 13, plus the lone King that already equals 13 by itself. That sum-to-13 pairing rule is the single most historically distinctive thing about this game, and the clearest way to tell it apart from its sequence-building cousins.",
    pyramidsolitaire_history_spread_title: "Bundled With Windows, Again",
    pyramidsolitaire_history_spread_p1: "Pyramid Solitaire had already circulated in physical card-game reference books and early digital solitaire collections for years, but it reached a genuinely mainstream audience the same way Klondike did decades earlier: by being bundled with Windows. Microsoft included it as one of the games in the Microsoft Solitaire Collection, built into Windows 8 and later, alongside Klondike, Spider, and FreeCell.",
    pyramidsolitaire_history_spread_p2: "For a huge number of players who grew up with Windows Solitaire meaning Klondike specifically, the Solitaire Collection was many people's first real exposure to the pairing-based style of patience game Pyramid represents - a different kind of puzzle hiding under the same familiar \"Solitaire\" name.",
    pyramidsolitaire_history_modern_title: "This Version",
    pyramidsolitaire_history_modern_p1: "PaperGames plays the standard ruleset: a fresh shuffle every game, all 28 pyramid cards dealt face-up from the start, a one-at-a-time stock/waste draw with up to 2 redeals, and the common \"clear the pyramid\" win condition - the stock and waste don't need to be emptied too, matching how most modern implementations of this game are played."
});
I18n.markTextLoaded("en");
