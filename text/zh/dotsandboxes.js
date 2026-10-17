// text/zh/dotsandboxes.js
// Rules and history texts of dotsandboxes (zh). Loaded by dotsandboxes-rules.html and dotsandboxes-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    dotsandboxes_rules_title: "点格棋规则",
    dotsandboxes_rules_intro: "关于 PaperGames 中点格棋玩法的简要说明——无论你是想回忆规则，还是刚开始学习，都会有帮助。",
    dotsandboxes_rules_basics_title: "基本玩法",
    dotsandboxes_term_board: "棋盘与连线",
    dotsandboxes_rules_board: "开局前先选择棋盘：4x4、5x5、6x6 或 8x8 个方格（即 5x5、6x6、7x7 或 9x9 个点），默认是 6x6。轮到你时，在两个相邻的点之间画一条线——水平或垂直方向均可。玩家1的线为实线，玩家2的线为点线。玩家1总是先走。",
    dotsandboxes_term_completing: "完成一个方格",
    dotsandboxes_rules_completing: "如果你画的线是某个方格的第四条、也是最后一条边，这个方格就归你所有：它会被标记上你的符号（玩家1为叉，玩家2为圈），并计入你的得分。如果一条线同时是两个方格各自缺少的最后一条边，就能一次完成两个方格。",
    dotsandboxes_term_extra_turn: "额外的回合",
    dotsandboxes_rules_extra_turn: "只要完成至少一个方格，你就能立刻再走一步。这可以连续发生：如果你的下一条线又完成了一个方格，你就再走一步，如此持续下去，直到你画出一条没有完成任何方格的线，回合才会轮到对手。",
    dotsandboxes_rules_end_title: "游戏如何结束",
    dotsandboxes_term_win: "获胜",
    dotsandboxes_rules_win: "当棋盘上所有的线都被画完时（此时所有方格都已各有归属：16、25、36 或 64 个），游戏结束。拥有方格更多的一方获胜。",
    dotsandboxes_term_draw: "平局",
    dotsandboxes_rules_draw: "如果双方最终拥有的方格数量相同，则为平局。在 5x5 的棋盘上（25 个方格，是奇数）不会出现平局。",
    dotsandboxes_term_resignation: "认输",
    dotsandboxes_rules_resignation: "玩家可以随时认输，游戏会立即结束，对手获胜。",
    dotsandboxes_history_title: "点格棋的历史",
    dotsandboxes_history_origins_title: "19世纪的法国智力游戏",
    dotsandboxes_history_origins_p1: "点格棋最早由法国数学家爱德华·卢卡斯于19世纪80年代以文字形式记录下来，他如今更为人熟知的是在数论方面的工作(包括卢卡斯数列)以及发明了汉诺塔益智游戏。卢卡斯用法语名称「la pipopipette」介绍了这款游戏。",
    dotsandboxes_history_origins_p2: "由于只需要一支铅笔和一个点阵，这款游戏就像大多数纸笔游戏一样传播开来：通过课堂和笔记本非正式地流传，远在有人想到为它注册商标或进行商业化生产之前。",
    dotsandboxes_history_spread_title: "「Dots and Boxes」名称的由来",
    dotsandboxes_history_spread_p1: "在英语国家，这款游戏渐渐被简单地称为「Dots and Boxes」，这也是如今大多数玩家所熟知的名字，尽管其有据可查的历史可以追溯到19世纪卢卡斯的法语记述。",
    dotsandboxes_history_modern_title: "组合博弈论中的严肃课题",
    dotsandboxes_history_modern_p1: "尽管规则简单，点格棋的策略却出人意料地深奥，因而成为组合博弈论中备受青睐的研究案例。数学家埃尔文·伯利坎普与约翰·康威、理查德·盖伊在其里程碑式的著作《Winning Ways for Your Mathematical Plays》中，正式分析了这款游戏的残局，包括「双重交叉策略」(double-cross)与「长链法则」：即熟练的玩家会在一条链的末尾主动牺牲几个方格，以掌握谁将被迫打开下一条链的主动权。",
    dotsandboxes_history_modern_p2: "伯利坎普后来还写了一整本专门讨论这款游戏的书，《The Dots and Boxes Game: Sophisticated Child's Play》，详细说明了一款简单到孩子一分钟就能学会的游戏，背后竟隐藏着如此深厚的策略。"
});
I18n.markTextLoaded("zh");
