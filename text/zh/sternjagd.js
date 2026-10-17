// text/zh/sternjagd.js
// Rules and history texts of sternjagd (zh). Loaded by sternjagd-rules.html and sternjagd-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sj_rules_title: "Sternjagd 规则",
    sj_rules_intro: "用一颗骰子在棋盘上追逐其他人并拿走他们的星星；最后还剩有星星的玩家获胜。",
    sj_rules_basics_title: "基础",
    sj_term_board: "棋盘",
    sj_rules_board: "棋盘上有十二个由箭头相连的格子：四个角、边上的四个圆圈和内侧的四个圆圈。每个格子都有两个箭头指出。四个角是起点格。",
    sj_term_turn: "你的回合",
    sj_rules_turn: "掷骰子，把棋子沿箭头正好走那么多步，每一步沿一个箭头。路线由你选择。所有可能停下的格子都会带圈，点按其中一个。能走就必须走，但不能停在出发的格子上。",
    sj_term_catch: "抓住",
    sj_rules_catch: "如果你的走法停在对手棋子所在的格子上，就抓住了它：对方失去一颗星，回到空着的起点角上。只是经过棋子则没有影响。",
    sj_term_stars: "星星",
    sj_rules_stars: "每人从三颗星开始。没有星星的人出局。",
    sj_term_win: "获胜",
    sj_rules_win: "最后留下的玩家获胜。如果600步后仍无人获胜，则为平局。",
    sj_term_start: "谁先走",
    sj_rules_start: "每局开始时抽签决定谁先走，因为先走略占优势。",
    sj_term_computer: "电脑",
    sj_rules_computer: "电脑只要能抓就会抓。否则它会选择对手下一回合最不可能打到的格子。",
    sj_term_help: "撤销",
    sj_rules_help: "“撤销”可收回你的上一步，对电脑时也一样。骰子保留原来的点数。",
    sj_history_title: "Sternjagd 的历史",
    sj_history_old_title: "追逐游戏",
    sj_history_old_p1: "棋子沿路径互相追逐、由骰子决定步数的游戏在许多文化中都有，抓住对手的棋子也是孩子们喜爱的规则。这类游戏究竟起源于何时何地，并不确定。",
    sj_history_version_title: "本版本",
    sj_history_version_p1: "Sternjagd 沿用传统骰子追逐游戏的模式。带箭头的星形棋盘、三颗星和抓捕规则都是我们自己的设计，没有复制任何历史上的棋盘。"
});
I18n.markTextLoaded("zh");
