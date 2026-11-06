// text/zh/yut.js
// Rules and history texts of yut (zh). Loaded by yut-rules.html and yut-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    yut_rules_title: "Yut 规则",
    yut_rules_intro: "韩国投棍赛跑游戏：掷四根木棍，让你的四枚棋子都绕棋盘一圈，并抢在其他人之前回到终点。",
    yut_rules_basics_title: "游戏规则",
    yut_term_throw: "投掷",
    yut_rules_throw: "投掷四根木棍。数一数朝上的扁平面的数量：1个是 do 도（前进1步），2个是 gae 개（前进2步），3个是 geol 걸（前进3步），4个是 yut 윷（前进4步），没有扁平面朝上则是 mo 모（前进5步）。投出 yut 和 mo 可以再掷一次。如果只有带标记的那根棍子是扁平面朝上，则为 backdo 빽도：后退一步。未使用的点数会保留，直到你使用它们为止。",
    yut_term_move: "移动",
    yut_rules_move: "选择你的一个点数，然后选择一枚棋子，再选择目标格子。在起点等待的棋子可以通过点数进入棋盘。同一格子上的棋子会叠在一起一同移动。外环有20个格子；起点和终点位于右下角。",
    yut_term_shortcuts: "捷径",
    yut_rules_shortcuts: "如果棋子从上方两个带标记的角落之一开始移动，它可以走穿过棋盘的捷径，而不必沿着外环走。中心格子可以通过更短的路线通往终点。经过某个角落而不停留在上面则不能走捷径。",
    yut_term_capture: "吃子",
    yut_rules_capture: "如果你落在有对手棋子的格子上，对手的棋子会回到起点，并且你可以再掷一次。格子上你自己的棋子会与你叠在一起。",
    yut_term_finish: "终点",
    yut_rules_finish: "越过起点格子的棋子即到达终点。第一个将四枚棋子全部送到终点的玩家获胜。",
    yut_term_players: "玩家",
    yut_rules_players: "2至4名玩家。你扮演A，其余由电脑扮演，可选择简单或困难难度。棋子通过形状和字母区分：圆形A、方形B、三角形C、菱形D。",
    yut_history_title: "Yut 的历史",
    yut_history_origins_title: "韩国民间游戏",
    yut_history_origins_p1: "Yut Nori（yunnori）是韩国的传统游戏。家人和邻居经常一起玩，尤其是在农历新年（Seollal）期间。其确切起源尚不明确；它通常被归类为韩国的古老民间游戏。在韩国传统中，这些投掷结果有动物名称：do、gae、geol、yut 和 mo。",
    yut_history_modern_title: "PaperGames 上的 Yut",
    yut_history_modern_p1: "PaperGames 使用自己的棋盘绘制和自己的文本。规则遵循游戏的通用版本：四根木棍、每位玩家四枚棋子、角落的捷径，以及掷出 yut、mo 和吃子时可获得额外的一次投掷机会。"
});
I18n.markTextLoaded("zh");
