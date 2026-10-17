// text/zh/snakesladders.js
// Rules and history texts of snakesladders (zh). Loaded by snakesladders-rules.html and snakesladders-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sl_rules_title: "蛇梯棋规则",
    sl_rules_intro: "纯靠运气的掷骰游戏：爬梯子，躲开蛇，第一个到达顶端。",
    sl_rules_basics_title: "规则",
    sl_term_board: "棋盘",
    sl_rules_board: "格子从左下角开始按蛇形编号：沿最下面一排走，往上，再沿下一排往回走，依此类推。大棋盘有 100 格，给小小孩的小棋盘有 50 格。梯子通向上方，蛇通向下方。",
    sl_term_move: "一回合",
    sl_rules_move: "掷骰子，把你的棋子向前走相应的格数。棋子从棋盘外开始，第一次掷骰后进入第 1 到 6 格。一格里可以有任意多个棋子。",
    sl_term_ladders: "梯子和蛇",
    sl_rules_ladders: "如果你的棋子停在梯子底部，就立即爬到顶端。如果停在蛇头上，就滑到蛇尾。只是经过它们则没有影响。",
    sl_term_finish: "终点",
    sl_rules_finish: "最先到达最后一格的人获胜。两种到终点的方式：“多出的点数作废”（默认）——超过终点的点数也能到达终点；“必须正好走到最后一格”——点数必须正好，否则棋子原地不动。",
    sl_term_players: "玩家",
    sl_rules_players: "2 到 4 人同一设备，其中任意多人可以由电脑来玩。棋子按形状区分：圆形、方形、三角形和星形。",
    sl_rules_example_title: "梯子和蛇",
    sl_rules_example: "图中是棋盘的一部分：一架向上的梯子和一条向下的蛇。",
    sl_history_title: "蛇梯棋的历史",
    sl_history_origins_title: "来自印度",
    sl_history_origins_p1: "蛇梯棋源自印度的一类掷骰棋盘游戏；在古印度它叫 Moksha Patam，耆那教的版本叫 Gyan chaupar。梯子代表慷慨、信仰和谦逊等美德，蛇代表愤怒和偷盗等恶行：善行通向解脱，恶行让人退回下方。",
    sl_history_england_title: "传到英国",
    sl_history_england_p1: "19世纪90年代，这个游戏传到了英国。已知最早的英文版本由 F. H. 艾尔斯出版，于1892年10月登记。后来它也在美国销售，从1943年起用的是另一个名字。",
    sl_history_modern_title: "PaperGames 的蛇梯棋",
    sl_history_modern_p1: "PaperGames 使用两个自己的棋盘，梯子和蛇的布置也是自己的，其中有一个给小小孩的 50 格小棋盘。棋子按形状而不是颜色区分，所以游戏在黑白电子墨水屏上也能玩，走法以文字显示在状态行里，而不是用动画。"
});
I18n.markTextLoaded("zh");
