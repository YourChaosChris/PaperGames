// text/en/bullsandcows.js
// Rules and history texts of bullsandcows (en). Loaded by bullsandcows-rules.html and bullsandcows-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    bullsandcows_rules_title: "Bulls and Cows Rules",
    bullsandcows_rules_intro: "A quick reference for how PaperGames plays Bulls and Cows - useful if you're rusty, or learning.",
    bullsandcows_rules_basics_title: "The basic idea",
    bullsandcows_term_code: "The secret code",
    bullsandcows_rules_code: "At the start of a new game, the computer picks a hidden code of four positions, each set to one of six shapes: circle, square, triangle, diamond, star, or cross. Depending on the difficulty, the same shape may appear more than once in the code.",
    bullsandcows_term_guess: "Making a guess",
    bullsandcows_rules_guess: "Tap a slot to cycle it through the six shapes, then tap Submit guess once all four slots show the shapes you want to try. A guess can repeat a shape freely, whether or not the secret code itself has any repeats.",
    bullsandcows_term_feedback: "Reading the feedback",
    bullsandcows_rules_feedback: "Each guess gets back a row of pegs: a black peg for every shape that's both correct and in the right position, and a white peg for every shape that's correct but in the wrong position. For example, if the code is circle-circle-square-triangle and you guess circle-square-square-square, you get two black pegs (the first circle and the third square are both exactly right) and no white pegs - the extra squares in the guess have nothing left over in the code to match. The pegs never say which slots they refer to, so working that out from guess to guess is the whole puzzle.",
    bullsandcows_rules_end_title: "Finishing a game",
    bullsandcows_term_win: "Winning",
    bullsandcows_rules_win: "You win the moment a guess earns four black pegs - every shape in exactly the right position.",
    bullsandcows_term_loss: "Running out of guesses",
    bullsandcows_rules_loss: "Each difficulty level allows a fixed number of guesses. If you use them all without cracking the code, the game ends there and the secret code is revealed.",
    bullsandcows_term_levels: "Difficulty levels",
    bullsandcows_rules_levels: "Easy gives you 12 guesses, but the secret code never repeats a shape. Medium gives 10 guesses and allows repeats, the traditional way the game is played. Hard gives only 8 guesses and also allows repeats, so duplicate shapes are something to watch for.",
    bullsandcows_history_title: "The History of Bulls and Cows",
    bullsandcows_history_origins_title: "A Pencil-and-Paper Classic",
    bullsandcows_history_origins_p1: "The central idea - guess a hidden code and get back only a count of exact and partial matches, never which positions are right - comes from Bulls and Cows, a pencil-and-paper guessing game played long before 1970. It is traditionally played with secret numbers: a right digit in the right place is a bull, a right digit in the wrong place is a cow.",
    bullsandcows_history_origins_p2: "It was also one of the first games people wrote for computers: versions, often called Moo, ran on university computers from the late 1960s on, and programming it is still a classic exercise today.",
    bullsandcows_history_spread_title: "The Board Game and the Name",
    bullsandcows_history_spread_p1: "In 1970 the idea was turned into a board game with colored pegs, which became famous worldwide under the name Mastermind. Mastermind is a trademark; the rights lie with Invicta Plastics. PaperGames is not affiliated with Invicta Plastics or that board game and therefore uses the older name, Bulls and Cows.",
    bullsandcows_history_modern_title: "A Favorite Puzzle for Computer Scientists",
    bullsandcows_history_modern_p1: "Because it boils down to searching for a hidden answer using nothing but match-count feedback, the game became a standard test case in computer science and combinatorics for studying guessing strategies and search algorithms.",
    bullsandcows_history_modern_p2: "In a well-known 1977 paper, Donald Knuth showed that the classic version with four positions and six symbols can always be solved in at most five guesses using an optimal strategy - a result still cited whenever the game comes up in discussions of algorithmic search."
});
I18n.markTextLoaded("en");
