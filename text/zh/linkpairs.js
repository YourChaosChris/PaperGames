// text/zh/linkpairs.js
// Rules and history texts of linkpairs (zh). Loaded by linkpairs-rules.html and linkpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    linkpairs_rules_title: "连接成对规则",
    linkpairs_rules_intro: "用线把每一对相同的符号连起来。线不能交叉，所有线合起来填满整个棋盘。",
    linkpairs_rules_basics_title: "规则",
    linkpairs_term_board: "棋盘",
    linkpairs_rules_board: "一个由格子组成的正方形棋盘。有些格子上有符号——数字或动物——每个符号正好出现两次。",
    linkpairs_term_lines: "线",
    linkpairs_rules_lines: "用一条线连起每一对。线一格一格地沿水平和垂直方向前进，绝不斜走。线不能交叉，不能共用格子，也不能穿过别的符号。",
    linkpairs_term_goal: "目标",
    linkpairs_rules_goal: "每一对都连上、每个格子都被线用上时，谜题就解开了。每道谜题都正好只有一个答案。",
    linkpairs_term_draw: "画线",
    linkpairs_rules_draw: "用手指从符号开始拖动，或者先点符号，再依次点格子。碰到另一条线时，那条线会被缩短。点一条线上的格子，线就在那里结束，你可以从那一格继续画。点一个符号会重新开始它的线——点线起点处的符号就能把线清除。",
    linkpairs_term_symbols: "数字或动物",
    linkpairs_rules_symbols: "在菜单里选择数字或动物。线上的每个格子都带着这条线符号的小标记，所以不用颜色也能看出哪条线属于哪一对。",
    linkpairs_term_tools: "撤销和提示",
    linkpairs_rules_tools: "“撤销”可以撤回任意多步。“提示”会完整地画出一条正确的线；挡路的线会被缩短。",
    linkpairs_term_levels: "难度",
    linkpairs_rules_levels: "简单：5 x 5。中等：7 x 7。困难：9 x 9。",
    linkpairs_rules_example_title: "已解开的示例",
    linkpairs_rules_example: "图中是一道已解开的 5×5 谜题：每一对都连上了，线没有交叉，每个格子都用上了。",
    linkpairs_history_title: "连线谜题的历史",
    linkpairs_history_origins_title: "早期形式",
    linkpairs_history_origins_p1: "1897年，这种谜题的一个稍有不同的形式出现在萨姆·劳埃德于《布鲁克林鹰报》（Brooklyn Daily Eagle）的专栏中。1917年，亨利·欧内斯特·杜德尼在他的书《Amusements in Mathematics》中收录了一个用字母对的版本，作为给驾车人的谜题。",
    linkpairs_history_japan_title: "数字和字母",
    linkpairs_history_japan_p1: "在日本，谜题出版社 Nikoli 以两种形式使这种谜题流行起来：字母对和数字对。这种谜题的通称是 Numberlink。一道谜题若正好只有一个答案、并且线填满每个格子，就被认为是好题。",
    linkpairs_history_modern_title: "PaperGames 如何制作谜题",
    linkpairs_history_modern_p1: "这里的谜题由 PaperGames 自己的生成程序预先制作：它先画出合起来经过每个格子的随机线条，再由求解程序检查连接这些对的方法是否正好只有一种。如果找到第二种，就把一条线拆成两对；末端相接的线只要答案仍然唯一，就会重新合并。"
});
I18n.markTextLoaded("zh");
