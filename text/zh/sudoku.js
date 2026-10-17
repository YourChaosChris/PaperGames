// text/zh/sudoku.js
// Rules and history texts of sudoku (zh). Loaded by sudoku-rules.html and sudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sudoku_rules_title: "数独规则",
    sudoku_rules_intro: "关于 PaperGames 如何演绎数独的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    sudoku_rules_basics_title: "基本玩法",
    sudoku_term_board: "九宫格",
    sudoku_rules_board: "9x9 的网格被划分为九个 3x3 的小九宫格。部分格子一开始就填有数字（称为“提示数”），不能更改；其余格子起始为空，等待你填入。",
    sudoku_term_goal: "目标",
    sudoku_rules_goal: "在每个空格中填入 1 到 9 之间的一个数字，使每一行、每一列、以及每一个 3x3 小九宫格都恰好包含每个数字一次。PaperGames 生成的每一道题都有且只有一个解。",
    sudoku_term_input: "输入数字",
    sudoku_rules_input: "先选中一个格子，再从棋盘下方的数字盘中选择一个数字（也可以用键盘直接输入数字）。显示虚线边框的格子表示它与同一行、同一列或同一小九宫格中的其他格子存在冲突——把它当作需要修改的提示。",
    sudoku_rules_end_title: "完成一局",
    sudoku_term_win: "已解出",
    sudoku_rules_win: "当整个网格被完全填满且不存在任何冲突时，这道题即被解出。",
    sudoku_term_difficulty: "难度",
    sudoku_rules_difficulty: "简单、中等和困难三种难度的唯一区别在于 81 个格子中起始就填好的数字有多少——提示数越少，需要推理的步骤就越多。",
    sudoku_history_title: "数独的历史",
    sudoku_history_origins_title: "首先是一款美国谜题",
    sudoku_history_origins_p1: "如今我们称之为数独的这种数字填充谜题，最早于 1979 年出现在一本美国谜题杂志上，由 Dell 出版公司以“数字位置”（Number Place）为题发表。它的发明者通常被认为是霍华德·加恩斯（Howard Garns），一位退休建筑师兼自由撰稿的谜题设计者，不过当时这本杂志并未署名，因此这一归属只是依据间接证据，而非有署名的确凿声明。",
    sudoku_history_origins_p2: "这种谜题借鉴了一个历史更为悠久的数学概念——拉丁方阵，即每个符号在每一行、每一列中都恰好出现一次的网格，18 世纪的莱昂哈德·欧拉曾对此深入研究——数独在此基础上叠加了 3x3 小九宫格的约束，使得仅凭逻辑推理、无需猜测就能得到唯一解。",
    sudoku_history_spread_title: "一个日文名字，一场全球风潮",
    sudoku_history_spread_p1: "这种谜题于 1984 年经由谜题公司 Nikoli 传入日本，被改名为“数字は独身に限る”（意为“数字必须保持单身”），后来简称为“数独”（意为“单一数字”）。Nikoli 的编辑们还确立了如今已成惯例的做法：提示数呈对称分布，且每道题只有一个有效解。",
    sudoku_history_spread_p2: "此后二十年间，数独一直只是日本一种不温不火的消遣，直到退休法官韦恩·古尔德（Wayne Gould）在东京旅行时偶然接触到它，编写了一个能够快速生成谜题的电脑程序，并说服伦敦《泰晤士报》于 2004 年开始刊登数独——由此在大约一年之内，引发了一场席卷全球报纸的解谜热潮。",
    sudoku_history_modern_title: "从报纸专栏到计算机科学",
    sudoku_history_modern_p1: "数独突如其来的流行，吸引的不只是普通解谜爱好者，还有数学家和计算机科学家：2005 年，人们精确计算出了 9x9 完整数独网格的总数（略多于 6.6 万亿亿）；2012 年，一次详尽的计算机搜索证明，任何有效的 9x9 数独题目，若要保证唯一解，至少需要 17 个提示数。",
    sudoku_history_modern_p2: "第二个结论，恰恰是 PaperGames 的题目生成器反过来加以利用的原理：由于提示数越少，唯一解就越难保持，本应用中的每一道题目，都是从一个完整解出的网格开始，逐一移除格子，直到再移除下去就会破坏唯一解为止——这与谜题设计者自 Nikoli 早期刊物以来一直沿用的逻辑完全一致，只是反过来使用。",
    puzzle_rules_hint: "“提示”按钮分三步帮你。第一次按下会标出下一步的位置。第二次给出理由，也就是那里适用的规则。第三次执行这一步（填入数字或架桥）。提示从你当前的局面出发：如果某处有错误的数字或桥，它会先告诉你。它从不猜测——如果只能靠尝试才能继续，它会如实说明。提示次数不限。用提示解开的谜题照样算作胜利；统计里会另外显示其中有多少次胜利用了提示。"
});
I18n.markTextLoaded("zh");
