// text/en/dotsandboxes.js
// Rules and history texts of dotsandboxes (en). Loaded by dotsandboxes-rules.html and dotsandboxes-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    dotsandboxes_rules_title: "Dots and Boxes Rules",
    dotsandboxes_rules_intro: "A quick reference for how PaperGames plays Dots and Boxes - useful if you're rusty, or learning.",
    dotsandboxes_rules_basics_title: "The basic idea",
    dotsandboxes_term_board: "The board and drawing lines",
    dotsandboxes_rules_board: "Before a game you pick the board: 4x4, 5x5, 6x6 or 8x8 boxes (5x5, 6x6, 7x7 or 9x9 dots); 6x6 is preset. On your turn, draw one line - horizontal or vertical - connecting two dots that are directly next to each other. Player 1's lines are drawn solid, Player 2's dotted. Player 1 always moves first.",
    dotsandboxes_term_completing: "Completing a box",
    dotsandboxes_rules_completing: "If the line you draw is the fourth and final side of a box, that box is yours: it's marked with your symbol (a cross for Player 1, a circle for Player 2) and added to your score. A single line can complete two boxes at once if it's the last missing side for both of them.",
    dotsandboxes_term_extra_turn: "The extra turn",
    dotsandboxes_rules_extra_turn: "Completing at least one box earns you another turn immediately. This can chain: if your next line completes another box too, you go again, and again, for as long as you keep completing boxes. Turn passes to your opponent only once you draw a line that completes nothing.",
    dotsandboxes_rules_end_title: "How a game ends",
    dotsandboxes_term_win: "Winning",
    dotsandboxes_rules_win: "The game ends once every line on the board has been drawn (all boxes are then owned: 16, 25, 36 or 64). Whoever owns more boxes wins.",
    dotsandboxes_term_draw: "Draw",
    dotsandboxes_rules_draw: "If both players end up owning the same number of boxes, the game is a draw. On the 5x5 board (25 boxes, an odd number) a draw can't happen.",
    dotsandboxes_term_resignation: "Resignation",
    dotsandboxes_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    dotsandboxes_history_title: "The History of Dots and Boxes",
    dotsandboxes_history_origins_title: "A 19th-Century French Puzzle",
    dotsandboxes_history_origins_p1: "Dots and Boxes was first described in print in the 1880s by the French mathematician Édouard Lucas, who is better known today for his work in number theory (including the Lucas numbers) and for inventing the Tower of Hanoi puzzle. Lucas wrote about the game under the French name \"la pipopipette\".",
    dotsandboxes_history_origins_p2: "Needing nothing but a pencil and a grid of dots, the game spread the way most paper-and-pencil games do: informally, through classrooms and notebooks, long before anyone thought to trademark or manufacture it.",
    dotsandboxes_history_spread_title: "Becoming \"Dots and Boxes\"",
    dotsandboxes_history_spread_p1: "In English-speaking countries the game came to be known simply as Dots and Boxes (also Dots and Squares, or Boxes), the name most players today would recognize, even though its documented history stretches back to Lucas's 19th-century French description.",
    dotsandboxes_history_modern_title: "A Serious Subject in Game Theory",
    dotsandboxes_history_modern_p1: "Despite its simplicity, Dots and Boxes turned out to have surprisingly deep strategy, and it became a favorite case study in combinatorial game theory. Mathematician Elwyn Berlekamp - together with John Conway and Richard Guy in their landmark book \"Winning Ways for Your Mathematical Plays\" - formally analyzed the game's endgame, including the \"double-cross strategy\" and the \"long chain rule\": the idea that a skilled player deliberately sacrifices a couple of boxes at the end of a chain to keep control of who is forced to open the next one.",
    dotsandboxes_history_modern_p2: "Berlekamp later wrote an entire book devoted to the game, \"The Dots and Boxes Game: Sophisticated Child's Play\", laying out just how much strategic depth hides behind a game simple enough for children to learn in a minute."
});
I18n.markTextLoaded("en");
