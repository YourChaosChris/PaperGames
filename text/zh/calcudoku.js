// text/zh/calcudoku.js
// Rules and history texts of calcudoku (zh). Loaded by calcudoku-rules.html and calcudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sudoku_rules_basics_title: "基本玩法",
    sudoku_term_goal: "目标",
    sudoku_term_input: "输入数字",
    sudoku_rules_end_title: "完成一局",
    sudoku_term_win: "已解出",
    sudoku_term_difficulty: "难度",
    puzzle_rules_hint: "“提示”按钮分三步帮你。第一次按下会标出下一步的位置。第二次给出理由，也就是那里适用的规则。第三次执行这一步（填入数字或架桥）。提示从你当前的局面出发：如果某处有错误的数字或桥，它会先告诉你。它从不猜测——如果只能靠尝试才能继续，它会如实说明。提示次数不限。用提示解开的谜题照样算作胜利；统计里会另外显示其中有多少次胜利用了提示。",
    calcudoku_rules_title: "Calcudoku规则",
    calcudoku_rules_intro: "PaperGames中Calcudoku玩法的简明说明，适合复习或入门。",
    calcudoku_term_board: "方格",
    calcudoku_rules_board: "方格是正方形，从4x4到7x7。与数独不同，它没有宫；粗线把它分成若干“笼子”，每个笼子由一到四个相连的格子组成。",
    calcudoku_rules_goal: "在每个格子里填入1到方格边长之间的数字（5x5方格为1到5），使每行和每列都恰好包含每个数字一次。PaperGames生成的每道题都只有唯一解。",
    calcudoku_term_regions: "笼子与运算",
    calcudoku_rules_regions: "笼子左上角格子里的小标记给出目标数和运算。如果是+或×，笼子里的数字以任意顺序相加或相乘必须等于目标数。带–或÷的笼子总是两个格子：较大的数减去较小的数，或除以较小的数，得到目标数。只有一个格子的笼子直接显示它的数字。只要行和列允许，同一个数字可以在一个笼子里出现两次。",
    calcudoku_rules_input: "选择一个格子，然后从棋盘下方的数字键盘中选一个数字（也可以用键盘输入）。以黑底白字显示的数字，表示它与同行或同列的另一个数字重复，或者填完的笼子没有得到目标数。",
    calcudoku_rules_difficulty: "开始前选择方格大小和难度。方格越大、难度越高，笼子就越大，单格笼子也越少，提示也就越少。",
    calcudoku_rules_win: "当所有格子都填满，且没有任何行、列或笼子违反规则时，题目就完成了。",
    calcudoku_history_title: "Calcudoku的历史",
    calcudoku_history_origins_title: "来自日本的教室",
    calcudoku_history_origins_p1: "这类谜题通常被认为是日本数学教师宫本哲也发明的。他在2004年前后设计了它，用来训练学生的计算和逻辑思维，而不直接告诉他们解法。这个想法很快通过谜题书和报纸传出了他的教室。",
    calcudoku_history_origins_p2: "计算的背后是拉丁方阵——一种每个符号在每行每列都恰好出现一次的方格。莱昂哈德·欧拉等数学家在18世纪研究过它，它也是数独的核心。",
    calcudoku_history_names_title: "名字不同，谜题相同",
    calcudoku_history_names_p1: "同样的谜题也以KenKen的名字进行商业出版。KenKen是Nextoy LLC的注册商标。PaperGames与Nextoy LLC没有任何关系，而是使用通用名称Calcudoku。",
    calcudoku_history_names_p2: "这里的每道Calcudoku都在你的设备上新生成：随机的拉丁方阵被分成笼子，每个笼子得到一个结果为整数的运算，内置的求解器只保留恰好有唯一解的分法。"
});
I18n.markTextLoaded("zh");
