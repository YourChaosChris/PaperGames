// text/zh/arrowludo.js
// Rules and history texts of arrowludo (zh). Loaded by arrowludo-rules.html and arrowludo-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    arrowludo_rules_title: "箭头飞行棋规则",
    arrowludo_rules_intro: "带近道的飞行棋：棋盘中间有箭头。比其他人更早把自己的四枚棋子沿跑道送到终点。",
    arrowludo_rules_basics_title: "规则",
    arrowludo_term_ludo: "与飞行棋相同",
    arrowludo_rules_ludo: "每位玩家有4枚棋子。掷骰子，按点数移动一枚棋子。棋子只有掷出6点才能进入棋盘，掷出6点可以再掷一次(连续三次6点，本回合作废)。除了标有记号的安全格，落在对手的棋子上会把它送回基地。同一颜色的两枚棋子在同一格上形成封锁，对手既不能落在上面，也不能越过。进入终点需要点数正好。",
    arrowludo_term_arrow: "箭头格",
    arrowludo_rules_arrow: "每种颜色有一个箭头格，就是自己那一臂的最后一格，在起点之后第12步。四个箭头格标有指向中心的箭头，棋盘上带箭头的两条线把相对的格子连起来。",
    arrowludo_term_flight: "飞行",
    arrowludo_rules_flight: "如果你的棋子恰好落在自己的箭头格上，它会立刻飞过中间，落在对面的箭头格上，向前26格。如果那里有对手的棋子，它会被送回基地；如果那里有对手的两枚棋子形成封锁，你就不能走这一步。经过箭头格但没有停在上面，什么也不会发生；其他颜色的箭头格对你来说是普通格子。",
    arrowludo_term_players: "玩家",
    arrowludo_rules_players: "经典棋盘，2至4人。你玩一种颜色，其他颜色由电脑玩(简单、中等或困难)，或者大家在同一台设备上玩。提示按钮会为你这一掷显示一步好棋。每种颜色都有自己的形状，没有颜色也能玩：红色是实心圆，绿色是空心圆，黄色是三角形，蓝色是空心方块。",
    arrowludo_history_title: "箭头飞行棋的历史",
    arrowludo_history_origins_title: "从帕奇西到飞行棋",
    arrowludo_history_origins_p1: "飞行棋是帕奇西的简单现代形式；帕奇西是来自印度的竞速游戏，已经玩了许多个世纪。玩家在十字形棋盘上移动棋子，互相把对方的棋子送回基地，并赛跑冲向中心。随着时间推移，各地的家庭和玩家想出了自己的家规，其中就有穿过中间的近道。",
    arrowludo_history_modern_title: "PaperGames的箭头飞行棋",
    arrowludo_history_modern_p1: "箭头飞行棋是PaperGames自己的变体。箭头格和飞过中间是我们自己定的简单规则，棋盘图和文字也都是我们自己的。普通的飞行棋仍是另一个独立的游戏。"
});
I18n.markTextLoaded("zh");
