// text/zh/backgammon.js
// Rules and history texts of backgammon (zh). Loaded by backgammon-rules.html and backgammon-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    backgammon_rules_title: "西洋双陆棋规则",
    backgammon_rules_intro: "关于 PaperGames 如何演绎西洋双陆棋的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    backgammon_rules_basics_title: "基本玩法",
    backgammon_term_pieces: "棋子与棋盘",
    backgammon_rules_pieces: "每位玩家有 15 枚棋子，棋盘共有 24 个点位。黑方从第 1 点向第 24 点方向前进，白方从第 24 点向第 1 点方向前进——双方都要先把全部棋子带入自己的内区，再将其收出棋盘。",
    backgammon_term_dice: "骰子",
    backgammon_rules_dice: "每回合掷两枚骰子，得到两个可用的点数；若掷出对子（两枚骰子点数相同），则可使用该点数走四步。凡是能合法使用的骰子点数，都必须使用。",
    backgammon_term_blocking: "封锁与打吃",
    backgammon_rules_blocking: "被对方两枚或以上棋子占据的点位视为被封锁。只有一枚棋子占据的点位（称为“单子”）可以被对方棋子落入并打吃，被打吃的棋子会被送上门柱——必须先从对方内区重新入局，之后才能走其他棋子。",
    backgammon_rules_end_title: "收子与获胜",
    backgammon_term_bearoff: "收子出局",
    backgammon_rules_bearoff: "一旦你全部 15 枚棋子都进入自己的内区，就可以开始收子出局：掷出与某枚棋子所在点位相符的点数即可将其收出；若掷出的点数比任何有棋子的点位都大，也可以改为收出距离最远的那枚棋子。",
    backgammon_term_win: "获胜",
    backgammon_rules_win: "率先收出全部 15 枚棋子的玩家获胜。",
    backgammon_term_resignation: "认输",
    backgammon_rules_resignation: "任何一方都可以随时认输，对局立即结束，对手获胜。",
    backgammon_term_doubling: "加倍骰",
    backgammon_rules_doubling: "在掷骰之前，持有（或共享）加倍骰的一方可以提出把赌注加倍。对手必须接受——接过加倍骰的控制权，并让这局棋的分值翻倍——或者拒绝，直接以当前分值输掉这一局。若对方在收子阶段还未收出任何一枚棋子，本局按双倍计分（gammon）；若对方在获胜方内区或门柱上还留有棋子，则按三倍计分（backgammon）——两种情况都要在加倍骰的基础上再乘。",
    backgammon_history_title: "西洋双陆棋的历史",
    backgammon_history_origins_title: "比文字还古老的骰子游戏",
    backgammon_history_origins_p1: "西洋双陆棋的血统可以一路追溯到乌尔皇室游戏与罗马游戏“十二线游戏”（Ludus Duodecim Scriptorum，意为“十二线的游戏”），后者后来被简化为塔布拉（Tabula）——一款双方各用 15 枚棋子、以两枚骰子决胜负的竞速游戏，到古典时代晚期，已经和今天的西洋双陆棋非常接近了。",
    backgammon_history_origins_p2: "据说罗马皇帝克劳狄乌斯十分痴迷塔布拉，甚至为它写过一本策略专著（如今已失传），还让人在自己的马车里装了一块棋盘，好在旅途中也能对弈。",
    backgammon_history_spread_title: "“桌戏”、Trictrac，以及英文名字的由来",
    backgammon_history_spread_p1: "在整个中世纪欧洲，各种类似西洋双陆棋的竞速游戏统称为“Tables”（桌戏），法国的 trictrac 等地方变体各自加入了独特的计分方式。英文名“backgammon”最早见于 17 世纪的文献，可能来自“back”（回）和一个古老的表示“游戏”的词——暗指棋子有时需要重新进场、再次走过整个棋盘。",
    backgammon_history_spread_p2: "加倍骰——让任何一方都能在对局中途提高赌注——诞生于 1920 年代的纽约，把西洋双陆棋从一场单纯的竞速，转变成了如今锦标赛选手所熟知的、充满精密风险计算的博弈（PaperGames 也包含加倍骰——详见规则页面）。",
    backgammon_history_modern_title: "人工智能的早期胜利",
    backgammon_history_modern_p1: "西洋双陆棋在人工智能发展史上占有特殊地位：1992 年，IBM 研究员杰拉尔德·特索罗（Gerald Tesauro）开发出名为 TD-Gammon 的程序，它通过与自己对弈数百万局来学习，是如今被称为“强化学习”的最早成功案例之一。",
    backgammon_history_modern_p2: "TD-Gammon 达到了足以与世界顶尖人类高手抗衡的水平，这比同类技术攻克国际象棋或围棋要早了许多年，它那些非常规的战略思路，最终也改变了顶尖人类棋手对这项运动的理解方式。"
});
I18n.markTextLoaded("zh");
