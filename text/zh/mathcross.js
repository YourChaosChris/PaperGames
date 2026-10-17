// text/zh/mathcross.js
// Rules and history texts of mathcross (zh). Loaded by mathcross-rules.html and mathcross-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    mc_rules_title: "计算网格规则",
    mc_rules_intro: "把1到9填进去，让每个算式都成立。",
    mc_rules_basics_title: "规则",
    mc_term_grid: "格子",
    mc_rules_grid: "三行三列共九个方格，相邻方格之间有运算符号（+、−、×、÷），每行末尾和每列下方是结果。1到9的每个数正好放进一个方格。有些数已经给出。",
    mc_term_order: "从左往右",
    mc_rules_order: "一行从左往右算，一列从上往下算——一步接一步，不先算乘法：3 + 4 × 2 得 7 × 2 = 14，而不是 11。这个谜题的一些学校版本按通常的运算顺序计算；这里始终从左往右。",
    mc_term_whole: "整数",
    mc_rules_whole: "每个中间结果和每个结果都是大于0的整数，所以除法总能除尽。",
    mc_term_levels: "难度",
    mc_rules_levels: "简单：只有+和−，给出4个数。中等：还有×，给出3个。困难：四种运算都有，至少一个÷，给出2个。每道题只有一个解，不用猜就能解出。",
    mc_term_help: "玩法",
    mc_rules_help: "先点一个空方格，再点格子下面的一个数；再点一次同一个数或“清除”可以清空方格。已经在别的方格里的数会移到这里。一行或一列填满后，✓或✗表示它是否成立。“提示”按钮先指出填错的数，否则填好一个现在就能推出的方格。",
    mc_rules_example_title: "示例",
    mc_rules_example: "一个解好的计算网格。中间一行：9 − 1 = 8，再 8 × 3 = 24——从左往右算，而不是 9 − 3 = 6。",
    mc_history_title: "计算网格的历史",
    mc_history_magic_title: "幻方",
    mc_history_magic_p1: "把1到9放进3 × 3格子的数字谜题中，最有名的是幻方：每行、每列和每条对角线的和都是15。它在中国称为洛书，与一个关于神龟的传说有关。它究竟有多古老并不清楚，各种资料给出的年代相差很远。",
    mc_history_today_title: "行与列中的算式",
    mc_history_today_p1: "计算网格保留了放1到9的3 × 3格子，但每一行和每一列要求不同的算式。这类谜题见于学校练习册和谜题集，有的按通常的运算顺序计算。这种形式最早出现在哪里，PaperGames没能查到；“计算网格”这个名字只是描述了看到的样子。"
});
I18n.markTextLoaded("zh");
