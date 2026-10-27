// text/zh/marblepush.js
// Rules and history texts of marblepush (zh). Loaded by marblepush-rules.html and marblepush-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    marblepush_rules_title: "推珠棋规则",
    marblepush_rules_intro: "关于 PaperGames 如何演绎推珠棋的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    marblepush_rules_basics_title: "基本理念",
    marblepush_term_board: "棋盘",
    marblepush_rules_board: "棋盘是由61个格子组成的六边形，各行分别有5、6、7、8、9、8、7、6、5个格子。每位玩家以14颗弹珠开局：最靠近自己的两行全部摆满，再加上下一行中间的3格。黑方先行。",
    marblepush_term_move: "移动单颗弹珠",
    marblepush_rules_single: "选中一颗弹珠，将其移动到任意相邻的空格。",
    marblepush_term_line: "移动一整排弹珠",
    marblepush_rules_line: "选中2或3颗排成一条直线且相邻的己方弹珠，然后将整条线沿棋盘的6个方向之一移动一步。共有两种排移动方式，见下文说明。",
    marblepush_term_sidestep: "横移",
    marblepush_rules_sidestep: "这条线沿垂直于自身轴线的方向侧移。移动到的每一格都必须是空的——横移永远不能推挤任何棋子。",
    marblepush_term_linestep: "沿轴移动",
    marblepush_rules_linestep: "这条线沿自身轴线方向移动，方向可以是其两端任意一端所指的方向。如果正前方的格子是空的，整条线就直接向前滑动。",
    marblepush_term_pushing: "推挤",
    marblepush_rules_pushing: "如果沿轴移动的正前方格子上有对方的弹珠，你可以推挤它们——但前提是你的这条线必须严格长于挡在前面的、连续排列的对方弹珠线（3颗可以推1颗或2颗，2颗可以推1颗；1颗永远不能推挤）。此外还必须有可推挤的空间：要么是对方那条线之后紧邻的空格，要么是棋盘边缘。如果对方的线被推出棋盘边缘，其最前端的那颗弹珠就会被淘汰——这正是得分的方式。",
    marblepush_rules_example_title: "示例：3 颗推 1 颗",
    marblepush_rules_example_intro: "在下面的小图中，●代表黑方，○代表白方。黑方有3颗弹珠排成一行（A、B、C），正对着白方的一颗弹珠（D），而D的正后方是一个空格（E），或者是棋盘边缘。",
    marblepush_rules_example_caption: "黑方的三连线（A、B、C）在数量上超过了白方的单颗弹珠（D），而格子E是空的——因此黑方可以推挤：整条线前进一步，D被推到E，黑方的线最终占据B、C以及D原来所在的格子。如果E换成棋盘边缘，那么D就会被彻底淘汰出局。",
    marblepush_rules_end_title: "对局如何结束",
    marblepush_term_win: "获胜",
    marblepush_rules_win: "率先将对方的6颗弹珠推出棋盘的一方获胜。",
    marblepush_term_resignation: "认输",
    marblepush_rules_resignation: "玩家可以随时认输，对局将立即以对手获胜而结束。",
    marblepush_history_title: "推珠棋的历史",
    marblepush_history_origins_title: "六边形棋盘上的推挤游戏",
    marblepush_history_origins_p1: "棋子被推动、而不是被跳过或在原地被吃掉的游戏有着悠久的传统，六边形棋盘同样如此：每个格子有六个相邻格而不是四个，这让每个棋子有更多方向可走，也避免了方格棋盘上别扭的斜线。",
    marblepush_history_origins_p2: "推珠棋就属于这一家族。弹珠朴素且完全相同，整个游戏只建立在一个想法之上：较长的一排弹珠可以推动较短的一排。",
    marblepush_history_award_title: "一条规则，无穷深度",
    marblepush_history_award_p1: "由于弹珠只有被严格更长的一排推出棋盘时才会损失，把弹珠聚成坚固的群体比什么都重要。单独一颗弹珠永远推不动别人，而靠近边缘的群体总是处境危险。",
    marblepush_history_award_p2: "因此每一局都会变成争夺棋盘中央的持久战：占据中央的一方可以向四面八方往外推，另一方则被逼向边缘。",
    marblepush_history_legacy_title: "没有运气的游戏",
    marblepush_history_legacy_p1: "没有骰子，没有隐藏信息，也没有特殊棋子——只有两套相同的弹珠和几条关于哪一排可以推动哪一排的简单规则。因此它纯粹考验计划能力，与围棋和跳棋等更古老的抽象棋类一脉相承。"
});
I18n.markTextLoaded("zh");
