// text/zh/war.js
// Rules and history texts of war (zh). Loaded by war-rules.html and war-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    war_rules_title: "比大小规则",
    war_rules_intro: "两人玩的纯运气纸牌游戏：牌大的赢，一样大就开战。",
    war_rules_basics_title: "规则",
    war_term_cards: "牌",
    war_rules_cards: "32 张牌：四种花色的 7、8、9、10、J、Q、K 和 A。A 最大；花色不算。每人得到 16 张，扣成一堆。",
    war_term_round: "一轮",
    war_rules_round: "双方翻开自己牌堆最上面的一张。大的赢走两张牌，放到赢家牌堆的底下。",
    war_term_war: "开战",
    war_rules_war: "如果两张牌一样大，就开战：每人扣下一张牌，再翻开一张。翻开的牌大的赢走桌上所有的牌。如果又一样大，就继续开战。",
    war_term_empty: "牌用完时",
    war_rules_empty: "开战时只剩一张牌的玩家，不扣牌，直接把它翻开。没有牌可翻的玩家输掉这局。",
    war_term_modes: "短局还是打到底",
    war_rules_modes: "短局（默认）：30 轮后牌多的赢；张数相同就是平局。打到底：一直打到一方拿到全部 32 张。为了让长局不会来回打转，赢来的牌以随机顺序放到牌堆底下，打满 2000 轮则算平局。",
    war_term_play: "在这里怎么玩",
    war_rules_play: "你和电脑对战。不需要做任何决定：点你的牌堆，两张牌就会翻开。桌上显示这一轮，开战时扣着的牌显示为条纹背面，两个牌堆都会显示有几张牌。",
    war_rules_example_title: "开战示例",
    war_rules_example: "图中是一次开战：双方都翻出了 9；各扣一张牌后，K 胜过了 8。",
    war_history_title: "比大小的历史",
    war_history_origins_title: "古老的儿童游戏",
    war_history_origins_p1: "这种游戏（英语叫 War）是最简单的纸牌游戏之一，常常是孩子们学会的第一个。在英国它也叫 Battle。它的德国变体早在1833年就出现在 C. F. 申克尔的百科全书里。一个相近的游戏是 Beggar-my-neighbour。",
    war_history_end_title: "一定会结束吗？",
    war_history_end_p1: "一局可能打得很久，理论上甚至可能永远打不完。大多数说明也没讲清楚：开战时一方的牌用完了该怎么办。数学家研究过这个游戏是否一定会结束；仅仅是赢来的牌放回牌堆底下的顺序，就可能改变结果。",
    war_history_modern_title: "PaperGames 的比大小",
    war_history_modern_p1: "因为这种游戏可能很长，PaperGames 默认提供 30 轮的短局。赢来的牌以随机顺序放到牌堆底下，开战时只剩一张牌的玩家把它翻开——这是处理这个问题的常见办法之一。"
});
I18n.markTextLoaded("zh");
