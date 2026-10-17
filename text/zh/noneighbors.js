// text/zh/noneighbors.js
// Rules and history texts of noneighbors (zh). Loaded by noneighbors-rules.html and noneighbors-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sudoku_rules_basics_title: "基本玩法",
    sudoku_term_goal: "目标",
    sudoku_term_input: "输入数字",
    sudoku_rules_end_title: "完成一局",
    sudoku_term_win: "已解出",
    sudoku_term_difficulty: "难度",
    puzzle_rules_hint: "“提示”按钮分三步帮你。第一次按下会标出下一步的位置。第二次给出理由，也就是那里适用的规则。第三次执行这一步（填入数字或架桥）。提示从你当前的局面出发：如果某处有错误的数字或桥，它会先告诉你。它从不猜测——如果只能靠尝试才能继续，它会如实说明。提示次数不限。用提示解开的谜题照样算作胜利；统计里会另外显示其中有多少次胜利用了提示。",
    numberblocks_rules_title: "互不相邻规则",
    numberblocks_rules_intro: "PaperGames中互不相邻玩法的简明说明，适合复习或入门。",
    numberblocks_term_board: "方格",
    numberblocks_rules_board: "粗线把方格分成由一到五个格子组成的方块。有些格子一开始就已填好（粗体），不能更改。",
    numberblocks_rules_goal: "填满所有空格，使由n个格子组成的方块恰好包含1到n每个数字一次——三个格子的方块包含1、2和3。PaperGames生成的每道题都只有唯一解。",
    numberblocks_term_regions: "相邻规则",
    numberblocks_rules_regions: "两个相同的数字绝不能相邻——不能左右相邻，不能上下相邻，也不能斜向相邻。一个数字周围最多八个格子里都不能有相同的数字，即使它们属于别的方块。",
    numberblocks_rules_input: "选择一个格子，然后从棋盘下方的数字键盘中选一个数字（也可以用键盘输入）。当一个数字在方块中重复、超过方块大小或与相同数字相邻时，所有相关格子的数字都会以黑底白字显示。",
    numberblocks_rules_difficulty: "简单题使用6x6方格，中等7x7，困难8x8，难度每升一级，给出的数字就更少。",
    numberblocks_rules_win: "当所有格子都填满，且既不违反方块规则也不违反相邻规则时，题目就完成了。",
    numberblocks_history_title: "互不相邻的历史",
    numberblocks_history_origins_title: "一位发明者的谜题",
    numberblocks_history_origins_p1: "互不相邻由日本谜题作者稻叶直贵发明，并于2001年发表。稻叶创作了大量逻辑谜题，它们往往建立在一条清晰的规则上，却能引出出人意料的深入推理。",
    numberblocks_history_origins_p2: "这个谜题结合了两个熟悉的想法：每个区域必须包含一组固定的数字，就像数独的宫；以及借鉴国际象棋中国王走法的邻接规则——国王能走到的地方，都不能出现相同的数字。",
    numberblocks_history_names_title: "其他名称",
    numberblocks_history_names_p1: "这类谜题也以Suguru或Tectonic之名广为人知，规则同样围绕区域与相邻关系。",
    numberblocks_history_names_p2: "这里的每道题都在你的设备上新生成：方块和一个有效解被一格一格地同时构建，然后逐个去掉数字，只要内置的求解器仍然只找到唯一解。"
});
I18n.markTextLoaded("zh");
