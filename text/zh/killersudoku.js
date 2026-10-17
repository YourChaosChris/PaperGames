// text/zh/killersudoku.js
// Rules and history texts of killersudoku (zh). Loaded by killersudoku-rules.html and killersudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sudoku_rules_basics_title: "基本玩法",
    sudoku_term_goal: "目标",
    sudoku_term_input: "输入数字",
    sudoku_rules_end_title: "完成一局",
    sudoku_term_win: "已解出",
    sudoku_term_difficulty: "难度",
    puzzle_rules_hint: "“提示”按钮分三步帮你。第一次按下会标出下一步的位置。第二次给出理由，也就是那里适用的规则。第三次执行这一步（填入数字或架桥）。提示从你当前的局面出发：如果某处有错误的数字或桥，它会先告诉你。它从不猜测——如果只能靠尝试才能继续，它会如实说明。提示次数不限。用提示解开的谜题照样算作胜利；统计里会另外显示其中有多少次胜利用了提示。",
    killersudoku_rules_title: "杀手数独规则",
    killersudoku_rules_intro: "PaperGames中杀手数独玩法的简明说明，适合复习或入门。",
    killersudoku_term_board: "方格",
    killersudoku_rules_board: "和数独一样，粗线把9x9方格分成九个3x3宫。虚线还把它分成由一到五个格子组成的笼子。一开始只有很少的格子填好，或者一个也没有。",
    killersudoku_rules_goal: "在每个格子里填入1到9的数字，使每行、每列和每个3x3宫都恰好包含每个数字一次。PaperGames生成的每道题都只有唯一解。",
    killersudoku_term_regions: "笼子",
    killersudoku_rules_regions: "笼子左上角格子里的小数字是它的和：笼子里的数字加起来必须等于它。与Calcudoku不同，笼子里的数字不能重复。",
    killersudoku_rules_input: "选择一个格子，然后从棋盘下方的数字键盘中选一个数字（也可以用键盘输入）。以黑底白字显示的数字，表示它在所在的行、列、宫或笼子里重复，或者填完的笼子和不对。",
    killersudoku_rules_difficulty: "简单题大多是小笼子，并多给几个数字；困难题的笼子更大，只给出唯一解所必需的数字，常常几乎没有。",
    killersudoku_rules_win: "当所有格子都填满，且没有任何行、列、宫或笼子违反规则时，题目就完成了。",
    killersudoku_history_title: "杀手数独的历史",
    killersudoku_history_origins_title: "数独方格上的加法",
    killersudoku_history_origins_p1: "把数独规则和笼子之和结合起来的谜题，早在1990年代就已在日本刊登，那时数和之类的加法谜题很受欢迎。2005年，在全球数独热潮中，英国报纸开始以Killer Sudoku的名字刊登这类谜题，这个想法随之广为流传。",
    killersudoku_history_origins_p2: "这个名字是描述性的，并不是商标：“杀手”只是表示它比普通数独更难，因为开始时几乎没有或完全没有数字。",
    killersudoku_history_names_title: "这里的题目如何生成",
    killersudoku_history_names_p1: "这里的每道杀手数独都从一个新生成、完全解开的数独方格开始，然后被分成相连的笼子，每个笼子里都没有重复的数字。",
    killersudoku_history_names_p2: "接着，内置的求解器检查笼子之和是否只允许一个解。如果不是，就公开两个可能的解不同的某个格子的数字，并重复检查，直到恰好只剩一个解。"
});
I18n.markTextLoaded("zh");
