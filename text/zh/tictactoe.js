// text/zh/tictactoe.js
// Rules and history texts of tictactoe (zh). Loaded by tictactoe-rules.html and tictactoe-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    tictactoe_rules_title: "井字棋规则",
    tictactoe_rules_intro: "简要介绍 PaperGames 中井字棋（又称 tic-tac-toe、圈叉棋）的玩法。",
    tictactoe_rules_basics_title: "基本玩法",
    tictactoe_term_board: "棋盘与记号",
    tictactoe_rules_board: "棋盘是 3x3 共九个格子。双方轮流在空格中画上自己的记号：玩家1画叉，玩家2画圈。玩家1总是先走。画下的记号直到对局结束都不会移动。",
    tictactoe_rules_end_title: "对局如何结束",
    tictactoe_term_win: "获胜",
    tictactoe_rules_win: "先把自己的三个记号连成一线——横、竖或斜——的一方立即获胜。获胜的那一行会以黑色填充显示。",
    tictactoe_term_draw: "平局",
    tictactoe_rules_draw: "如果九个格子都已填满而没有人连成三子，则为平局。两位都不犯错的玩家总是会下成平局——因此在“困难”难度下电脑从不输棋，与它对局最好的结果就是平局。",
    tictactoe_term_resignation: "认输",
    tictactoe_rules_resignation: "玩家可以随时认输，对局立即结束，判对手获胜。",
    tictactoe_rules_hard_title: "“困难”难度",
    tictactoe_rules_hard: "在“困难”难度下，电脑会算遍所有可能的后续走法，从不失误。对于 3x3 的棋盘，人们已通过检查所有可能的对局证明：两个不犯错的玩家对弈，结果必然是平局。因此面对这一难度，你最多只能打成平局；一旦失误就会输。",
    tictactoe_history_title: "井字棋的历史",
    tictactoe_history_origins_title: "罗马的三颗石子",
    tictactoe_history_origins_p1: "大约公元前一世纪，罗马帝国流行一种早期的同类游戏，名字可能叫 terni lapilli，意为“每次三颗石子”。每位玩家只有三枚棋子；全部放上棋盘后，就把棋子移到空点上继续下。",
    tictactoe_history_origins_p2: "在罗马的许多地方都发现过这种游戏的棋盘线。",
    tictactoe_history_spread_title: "Noughts and Crosses、Tic-Tac-Toe",
    tictactoe_history_spread_p1: "这个游戏有过许多名字。英国的叫法“noughts and crosses”（圈与叉）在 19 世纪中叶就已见于印刷品，例如 1858 年的期刊《Notes and Queries》。",
    tictactoe_history_spread_p2: "在美国，tic-tac-toe 这个名字在 20 世纪流行开来。它可能源自“tick-tack”，一种早在 16 世纪就已在英格兰为人所知的古老双陆棋。",
    tictactoe_history_modern_title: "最早的电脑游戏之一",
    tictactoe_history_modern_p1: "1952 年，A. S.（桑迪）·道格拉斯在剑桥大学为 EDSAC 计算机编写了 OXO，这是他关于人机交互的博士论文的一部分。玩家用电话拨号盘选择格子，电脑则下得毫无破绽。OXO 被认为是最早的已知电子游戏之一。",
    tictactoe_history_modern_p2: "这个游戏足够小，可以完全算尽：不计旋转和镜像，共有 26,830 种可能的对局，双方都下出最佳着法时，每一局都会以平局结束。这里的“困难”难度正是这样做的——每走一步之前，它都会查看所有可能的后续走法。"
});
I18n.markTextLoaded("zh");
