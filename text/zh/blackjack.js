// text/zh/blackjack.js
// Rules and history texts of blackjack (zh). Loaded by blackjack-rules.html and blackjack-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    bj_rules_title: "二十一点规则",
    bj_rules_intro: "比庄家更接近21，但不能超过。两种玩法，一个游戏——用筹码，筹码只是分数。",
    bj_rules_basics_title: "规则",
    bj_term_variants: "两种玩法",
    bj_rules_variants: "“17加4”用32张牌（7到A），二十一点用52张牌（2到A）。在“新游戏”中选择玩法。",
    bj_term_values17: "“17加4”的牌点",
    bj_rules_values17: "A为11，K为4，Q为3，J为2，7到10按牌面计。前两张牌是两张A叫作“火”，是最好的牌。",
    bj_term_valuesbj: "二十一点的牌点",
    bj_rules_valuesbj: "A为1或11（取对你有利的），K、Q、J为10，其余按牌面计。前两张牌是A和一张10点牌，就是二十一点（blackjack）。",
    bj_term_round: "一局",
    bj_rules_round: "选择下注：5、10或20个筹码。你拿两张牌，庄家一张明牌、一张暗牌。点“要牌”再拿牌，点“停牌”停下。超过21就立刻输了。",
    bj_term_bank: "庄家",
    bj_rules_bank: "你停牌后，庄家翻开暗牌。庄家总是遵守同一条规则：16点及以下要牌，17点及以上停牌。庄家超过21，你就赢。",
    bj_term_result: "谁赢",
    bj_rules_result: "更接近21的一方赢。你赢得与下注相同的筹码；二十一点赢得下注的1.5倍（向下取整）。点数相同时：“17加4”庄家赢，二十一点你保留筹码。两张牌21点（二十一点）或“火”会立即结束这一局。",
    bj_term_double: "加倍（仅二十一点）",
    bj_rules_double: "拿到前两张牌时可以加倍：下注翻倍，你正好再拿一张牌，然后轮到庄家。需要有足够的筹码。没有分牌，也没有保险。",
    bj_term_chips: "筹码",
    bj_rules_chips: "开始时有100个筹码。筹码只是游戏中的分数，不能兑换任何东西。用完后用100个重新开始。",
    bj_rules_example_title: "同样的牌，不同的点数",
    bj_rules_example: "A和K：在二十一点中是21点——二十一点。在“17加4”中只有15点（A为11，K为4）。",
    bj_history_title: "二十一点的历史",
    bj_history_origins_title: "二十一",
    bj_history_origins_p1: "力求达到21而不超过的纸牌游戏历史悠久：最早的文字记载见于西班牙作家米格尔·德·塞万提斯的一本书。德国的“17加4”起源于18世纪，在法国路易十五的宫廷中非常流行。法国的vingt-et-un（21）源于更古老的trente-et-un，那时的目标是31。在德语中它过去也叫Hopsen。按32张牌的点数，17加一张K（4）正好是21。",
    bj_history_us_title: "二十一点",
    bj_history_us_p1: "在美国，二十一的一种美式玩法发展成独立的游戏，约在1899年得名blackjack。常被讲述的“A配黑色J有奖金”的故事，据历史学家蒂埃里·德波利斯所说是一个传说。传统上二十一点按3比2赔付，点数相同时退还下注。",
    bj_history_modern_title: "PaperGames中的二十一点",
    bj_history_modern_p1: "PaperGames只用筹码玩：筹码只是游戏中的分数，不能兑换任何东西。庄家始终遵守同一条固定规则，每局都重新洗牌，你的点数始终显示；纸牌用实心和空心花色符号区分，让游戏在黑白电子墨水屏上也能玩。"
});
I18n.markTextLoaded("zh");
