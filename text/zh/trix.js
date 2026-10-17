// text/zh/trix.js
// Rules and history texts of trix (zh). Loaded by trix-rules.html and trix-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sudoku_rules_basics_title: "基本玩法",
    trix_rules_title: "特里克斯规则",
    trix_rules_intro: "PaperGames 中特里克斯（Trix）的玩法。这个游戏有多种版本，其中包括搭档版；这里玩的是下面介绍的四人各自为战的版本。",
    trix_term_setup: "牌和人数",
    trix_rules_setup: "四名玩家各自为战，使用普通的 52 张牌。每次发牌每人 13 张。在吃墩合约中 A 最大，没有王牌。",
    trix_term_kingdoms: "王国与合约",
    trix_rules_kingdoms: "一局完整的游戏有四个王国，每名玩家拥有其中一个。第一次发牌时持有红心 7 的玩家拥有第一个王国；之后依次轮到下一名玩家。在自己的王国里，拥有者每次发牌后先看新牌，再从剩下的五个合约中选一个，直到五个都打完。当前合约的名称始终显示在牌桌上方，下面的列表显示该王国已完成的合约。",
    trix_term_king: "红心 K",
    trix_rules_king: "吃墩合约：能跟牌就必须跟首家出的花色；拥有者首先出牌，每墩的赢家出下一墩。收下红心 K 的人被罚 75 分，这次发牌立即结束。如果你无法跟牌又持有红心 K，就必须打出它。",
    trix_term_queens: "Q",
    trix_rules_queens: "吃墩玩法同上。每收下一张 Q 罚 25 分。四张 Q 全部被收下后，这次发牌结束。",
    trix_term_diamonds: "方块",
    trix_rules_diamonds: "吃墩玩法同上。每收下一张方块罚 10 分。13 张方块全部被收下后，这次发牌结束。",
    trix_term_tricks: "牌墩",
    trix_rules_tricks: "吃墩玩法同上，每收下一墩罚 15 分。13 墩全部打完。",
    trix_term_trix: "特里克斯",
    trix_rules_trix: "这里不吃墩：四张 J 开启四列，每种花色一列。每列从 J 往上接到 A，从 J 往下接到 2，每次一张。拥有者先出；轮到你时接上一张合适的牌，只有在没有任何牌能接时才可以过。第一个出完牌的人得 200 分，第二个 150 分，第三个 100 分，最后一个 50 分。轮到你时，每张能接的牌都带一个黑角。",
    trix_term_order: "查看分数",
    trix_rules_order: "记分板始终可见：每名玩家的总分、当前发牌的分数，以及每人在这次发牌中收下的罚分牌。打完的一墩会在牌桌上停留片刻，让你看清是谁收下的。",
    trix_term_end: "结束",
    trix_rules_end: "一个王国的分数加起来总是零：四个罚分合约共扣 75、100、130 和 195 分，特里克斯共发出 500 分。四个王国结束后，得分最高的玩家获胜。你也可以在任何一个王国结束后结束游戏——此时领先者获胜——或者暂停以后再继续，因为每出一张牌游戏都会保存。",
    trix_term_variant: "这里采用的玩法",
    trix_rules_variant: "特里克斯有很多玩法：搭档版、红心 K 或 Q 加倍、组合合约，或关于谁先出的其他规则。PaperGames 采用本页介绍的、不加倍的四人各自为战简单版本。",
    trix_history_title: "特里克斯的历史",
    trix_history_origins_title: "20 世纪的游戏",
    trix_history_origins_p1: "特里克斯主要流行于黎巴嫩、叙利亚、约旦、巴勒斯坦、伊拉克和海湾国家。一般认为它在 20 世纪的黎凡特地区流行起来。是谁、在哪里编排了这个游戏，已无从知晓。",
    trix_history_origins_p2: "它的结构属于“合约集合”类游戏，这一类也包括欧洲的 Barbu 等游戏：玩家轮流从固定的合约列表中选择——几个要设法避开某些牌或牌墩的负分合约，以及一个把牌接成列的正分合约。",
    trix_history_names_title: "王国、搭档与应用",
    trix_history_names_p1: "把每名玩家的五个合约称为“王国”是这个游戏特有的说法，而红心 K 的特殊地位给游戏带来了许多紧张感。除了个人赛，还有非常流行的搭档版，许多牌友还会加上加倍规则。",
    trix_history_names_p2: "近年来，特里克斯在手机上也很受欢迎，相隔遥远的朋友和家人可以一起玩。PaperGames 提供简单的个人版本，并在规则页面详细说明玩法。"
});
I18n.markTextLoaded("zh");
