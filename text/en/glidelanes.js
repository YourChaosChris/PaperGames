// text/en/glidelanes.js
// Rules and history texts of glidelanes (en). Loaded by glidelanes-rules.html and glidelanes-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    aw_rules_title: "Glide Lanes Rules",
    aw_rules_intro: "Send every arrow out of the field.",
    aw_rules_basics_title: "The rules",
    aw_term_move: "Moving",
    aw_rules_move: "Tap an arrow. It slides out of the field in the direction its head points - but only if every square from its head to the edge is free. An arrow made of several squares follows its head; its own body must not lie in the way either.",
    aw_term_blocked: "Blocked",
    aw_rules_blocked: "If another arrow is in the way, the tapped arrow stays where it is, and the arrow in the way gets a dotted frame. There is no penalty: take that arrow out first.",
    aw_term_glide: "Gliding arrows (Hard and Master)",
    aw_rules_glide: "On Hard a blocked arrow does not stay put: it glides forward, body following head, up to the next arrow and stops there. That can block other arrows for good - think before you tap. Undo takes a move back, and Hint looks for a way out from where you are now. The arrows there have up to two corners and lie on 11 × 11 squares.",
    aw_term_master: "Master",
    aw_rules_master: "As Hard, but without a hint and without a frame for the arrow in the way. Every tap that does not take an arrow out of the field counts as a miss; the info line shows the misses, and you can always go on.",
    aw_term_goal: "Goal",
    aw_rules_goal: "Clear the whole field. Every puzzle is made so that it can be solved, and taking an arrow out never blocks another one, so you cannot get stuck. The fewest moves are the number of arrows; Undo counts as a move too.",
    aw_term_levels: "Levels",
    aw_rules_levels: "Easy: 5 × 5 squares with short arrows. Medium: 7 × 7 with arrows of two to four squares. Hard: 11 × 11 with gliding arrows of up to seven squares and two corners. Master: as Hard, misses are counted. Grandmaster: 15 × 15, with gliding arrows up to 15 squares and six bends, misses are counted here too. Picture puzzles use one of twelve outlined cell shapes. Hints work on Grandmaster and picture puzzles.",
    aw_term_help: "Hint",
    aw_rules_help: "Hint marks an arrow that can leave now.",
    aw_rules_example_title: "Example",
    aw_rules_example: "The long arrow points right, but the short arrow stands in its way. The short arrow can leave upwards; after that the way is free for the long arrow.",
    aw_history_title: "History of Glide Lanes",
    aw_history_slide_title: "Sliding pieces",
    aw_history_slide_p1: "Puzzles in which pieces slide inside a frame are old. The best known is the 15 puzzle: fifteen numbered blocks in a box with room for sixteen. It was invented by Noyes Palmer Chapman, a postmaster in Canastota, New York. From December 1879 the Boston woodworker Matthias Rice made it as the \"Gem Puzzle\", and in 1880 it became a craze in America and soon in Europe. Sam Loyd later claimed to have invented it, but he had nothing to do with it.",
    aw_history_arrows_title: "Arrows that leave",
    aw_history_arrows_p1: "In the arrow puzzle each piece may move in one direction only, and it leaves the field instead of sliding back and forth. Such puzzles have become popular in recent years in games for touch screens; no single inventor is known. The puzzles here are made for PaperGames: built backwards, so that every field can be cleared."
});
I18n.markTextLoaded("en");
