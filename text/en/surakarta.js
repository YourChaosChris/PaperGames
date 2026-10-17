// text/en/surakarta.js
// Rules and history texts of surakarta (en). Loaded by surakarta-rules.html and surakarta-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    surakarta_rules_title: "Surakarta Rules",
    surakarta_rules_intro: "A quick reference for how PaperGames plays Surakarta - useful if you're rusty, or learning. The looping-track capture is the one part almost everyone finds confusing at first, so there's a full worked example below.",
    surakarta_rules_basics_title: "The basic idea",
    surakarta_term_board: "The board",
    surakarta_rules_board: "A plain 6x6 grid of points. Each player starts with 12 stones filling the two rows nearest their own side (Black on the top two rows, White on the bottom two), with the middle two rows empty. Black moves first.",
    surakarta_term_movement: "Moving",
    surakarta_rules_movement: "On your turn, slide one stone a single step to any adjacent empty point - straight or diagonal, any of the 8 directions. A step like this is always quiet: it never captures anything, even if it lands right next to an enemy stone.",
    surakarta_term_loop: "The loop tracks",
    surakarta_rules_loop: "Four lines on the board - the 2nd and 5th row, and the 2nd and 5th column - don't just stop at the edge: each end of each of these four lines curves outward and connects to the nearest end of the neighboring special line at that same corner, forming a loop around each of the board's 4 corners. A stone sliding along one of these four lines can ride a loop off one edge and reappear travelling along the connected line, still moving in a straight line as far as the track and any further loops allow.",
    surakarta_term_capture: "Capturing",
    surakarta_rules_capture: "Capturing is completely separate from moving, and only works along the loop tracks. Instead of taking a single step, a stone can slide all the way along one of its 8 directions - passing straight over every other stone, friend or foe, without effect - for as long as the line and its loop connections carry it. The moment it has gone around at least one loop AND the next stone it reaches is an enemy stone, that stone is captured and the slider lands on its square, ending the move right there. If the line runs off the board with no loop to continue it, or if it loops all the way around without ever meeting a qualifying enemy stone, there's no capture that way. Capturing is optional here: even with a capture available, you may play a quiet step instead.",
    surakarta_rules_example_title: "Worked example: a loop capture",
    surakarta_rules_example_intro: "○ is White (the piece that moves in this example), ● is Black. White's stone at A sits on one of the four loop-carrying lines. There's nothing blocking it all the way to the edge, so instead of a quiet step, White plays a full capturing slide.",
    surakarta_rules_example_caption: "White's stone at A slides left along the row. It runs off the edge, rides the loop track around the corner, and re-enters travelling down the connected column. The first stone it meets after using that loop is Black's stone at B - so B is captured, and White's stone lands on B's now-empty square (dashed circle). If A had instead been just one step from an enemy stone with no loop involved, that adjacent enemy would NOT be captured - only a slide that actually uses a loop can capture.",
    surakarta_rules_end_title: "How a game ends",
    surakarta_term_win: "Winning",
    surakarta_rules_win: "You win by capturing every one of your opponent's stones, or if your opponent has no legal move at all on their turn.",
    surakarta_term_resignation: "Resignation",
    surakarta_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    surakarta_history_title: "The History of Surakarta",
    surakarta_history_origins_title: "Named After a City on Java",
    surakarta_history_origins_p1: "Surakarta - also widely known as Solo, its more everyday name - is a city in Central Java, Indonesia, and the game that bears its name is traditionally believed to have originated there. As with many traditional board games passed down mostly through play rather than written record, its exact age and the details of its early history aren't precisely documented; what's clear is that it has been played in the region for a very long time and remains strongly associated with the city today.",
    surakarta_history_unique_title: "A Favorite Example of a \"Non-Obvious\" Capture Rule",
    surakarta_history_unique_p1: "Surakarta is unusual, even among traditional games, for splitting movement and capture into two completely different mechanics: an ordinary quiet move is just a single step to a neighboring point, while every capture instead depends entirely on the board's distinctive looping corner tracks - a stone that has no loop-eligible line available simply cannot capture that turn, no matter how it's surrounded. That sharp separation, and the fact that a stone can lie right next to an enemy piece in perfect safety, is exactly what makes the game click once it's understood - and exactly what makes it a frequently cited example in game-design discussions of capture mechanics that aren't immediately obvious from looking at the board.",
    surakarta_history_modern_title: "Still Played Today",
    surakarta_history_modern_p1: "Surakarta remains a living part of traditional Indonesian games culture and has also travelled well beyond it: it's a recurring subject in abstract-games hobbyist circles and computer game research precisely because its capture rule is so distinctive, and it has appeared in general board-game compilations and game-programming exercises as a compact, self-contained example of a mechanic unlike almost anything else in the traditional board game canon."
});
I18n.markTextLoaded("en");
