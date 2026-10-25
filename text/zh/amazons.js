// text/zh/amazons.js
// Rules and history texts of amazons (zh). Loaded by amazons-rules.html and amazons-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    amazons_rules_title: "亚马逊棋规则",
    amazons_rules_intro: "关于 PaperGames 如何进行「亚马逊棋」游戏的简明参考——无论你是手生了还是正在学习，都很实用。",
    amazons_rules_basics_title: "基本理念",
    amazons_term_setup: "初始设置",
    amazons_rules_setup: "每位玩家在 10x10 的棋盘上拥有四枚亚马逊棋子，按照标准的对称初始位置摆放。这个游戏完全没有吃子——胜负完全取决于移动和地盘控制。",
    amazons_term_moving: "移动一枚亚马逊棋子",
    amazons_rules_moving: "轮到你时，将你的一枚亚马逊棋子沿直线移动任意数量的空格——水平、垂直或斜向皆可——走法与国际象棋的皇后完全相同。它永远不能跳过另一枚亚马逊棋子或一个已燃烧的格子。",
    amazons_term_shooting: "射出一支箭",
    amazons_rules_shooting: "移动之后，同一枚棋子必须立即从它的新位置射出一支箭：同样是皇后式的直线移动，可选 8 个方向中的任意一个，只能穿过空格，并落在一个空格上。",
    amazons_term_burned: "燃烧的格子",
    amazons_rules_burned: "无论箭落在哪里，那个格子在本局余下的时间里都会被烧毁——永久无法通行的地形，此后任何亚马逊棋子和任何箭都无法再穿过或落在上面。",
    amazons_rules_end_title: "赢得对局",
    amazons_term_win: "对局如何结束",
    amazons_rules_win: "如果轮到你走棋，而你的所有亚马逊棋子都已经没有任何合法走法——在每个方向上都被其他亚马逊棋子、燃烧的格子或棋盘边缘挡住——你就输了。最后一个还能走棋的玩家获胜。",
    amazons_history_title: "亚马逊棋的历史",
    amazons_history_origins_title: "1988 年发明",
    amazons_history_origins_p1: "亚马逊棋由阿根廷游戏设计师沃尔特·萨姆考斯卡斯（Walter Zamkauskas）于 1988 年发明，并首次刊登在阿根廷的西班牙语益智杂志《El Acertijo》上。",
    amazons_history_origins_p2: "它那如皇后般行走的棋子让人联想到国际象棋，但每回合后半段的射箭动作——每走一步就永久烧毁一格——完全是它独有的创意，把游戏从一场竞速变成了慢慢扼杀对手可用空间的过程。",
    amazons_history_design_title: "组合博弈论的宠儿",
    amazons_history_design_p1: "亚马逊棋没有和棋，也没有吃子，每一步可选的走法多得惊人——开局时甚至比围棋还多——这使它自然而然地成为组合博弈论研究者的研究对象，并自上世纪 90 年代末以来一直是电脑博弈比赛和奥林匹克赛事的常规项目。",
    amazons_history_design_p2: "让电脑下出高水平的棋，本身就是一项严峻的挑战：合法的棋子走法有几十种，而每一种走法之后又各自有几十种合法的射箭方式，因此单单一个回合的合法走法总数往往远超一千种——比国际象棋多得多——这迫使亚马逊棋程序更多依赖精细的走法排序和残局地盘分析，而不是单纯的暴力搜索。",
    amazons_history_version_title: "本版本说明",
    amazons_history_version_p1: "PaperGames 采用标准规则，在标准的 10x10 棋盘上进行，每方四枚亚马逊棋子。每个回合只需简单的三次点击：点击一枚棋子，点击它要移动到的位置，然后点击它要从那里射箭的位置。"
});
I18n.markTextLoaded("zh");
