// text/zh/concan.js
// Rules and history texts of concan (zh). Loaded by concan-rules.html and concan-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sudoku_rules_basics_title: "基本玩法",
    concan_rules_romme_difference: "与 Rommé 的区别：在 Concan 中只能往自己的牌组里加牌。在 Rommé（PaperGames 上也是）中，首次亮牌后可以往桌上的任何牌组里加牌，包括对手的牌组。",
    concan_rules_title: "康坎规则",
    concan_rules_intro: "PaperGames 中康坎（也写作 Conquian）的玩法。这个游戏流传下来有几种细节不同的版本；这里采用的版本如下所述。",
    concan_term_setup: "牌和人数",
    concan_rules_setup: "一副 40 张牌：普通牌去掉 8、9、10，即四种花色的 A、2 到 7、J、Q、K。两位玩家各十张牌，再翻开一张作为弃牌堆的第一张。",
    concan_term_melds: "牌组",
    concan_rules_melds: "牌组是三或四张同点数的同点组，或者三张及以上同花色的连续顺子。顺序是 A、2、3、4、5、6、7、J、Q、K——因为没有 8 到 10，J 紧接在 7 之后，所以 7、J、Q 是有效的顺子。A 总是最小。",
    concan_term_turn: "轮到你",
    concan_rules_turn: "弃牌堆最上面的牌只有在立刻亮出时才能拿：和手里的牌组成新牌组，或加到自己的牌组上。否则从牌堆摸最上面的一张牌。之后你可以再亮出牌组或给自己的牌组加牌，最后弃掉一张牌结束这一轮。",
    concan_term_forced: "强制拿牌",
    concan_rules_forced: "这就是康坎的特别之处：每张弃牌都会给对手，如果对手能用，就必须拿走并亮出。游戏会替你检查，并在必须拿牌时提示你。所以弃掉对手可能用得上的牌之前要三思。",
    concan_term_end: "获胜",
    concan_rules_end: "第一个亮出十一张牌的玩家立即获胜。因为每一轮都以弃牌结束，你手里的最后一张牌只有在凑成十一张时才能亮出。如果在有人亮出十一张牌之前牌堆用完，则为平局。",
    concan_term_variant: "这里采用的玩法",
    concan_rules_variant: "关于康坎的旧描述各不相同，例如摸到的牌是放进手里还是给双方看，以及必须亮出多少张牌。PaperGames 采用本页描述的版本：摸到的牌进入手牌，每一轮以弃牌结束，能用的弃牌必须拿，亮出十一张牌获胜。",
    concan_history_title: "康坎的历史",
    concan_history_origins_title: "从墨西哥到拉米家族",
    concan_history_origins_p1: "康坎（Conquian）在 19 世纪的墨西哥和美国西南部流行，用西班牙花色的 40 张牌来玩。纸牌游戏史学家把它列为收集同点组和顺子的拉米类游戏中最古老的之一。",
    concan_history_origins_p2: "这个游戏本身从哪里来并不确定。有些史学家认为源于更古老的亚洲纸牌游戏，另一些则认为源于西班牙游戏；可以肯定的是，组成并亮出牌组的想法从康坎这样的游戏传到了今天的许多拉米游戏中。",
    concan_history_names_title: "名字和规则",
    concan_history_names_p1: "这个名字常被和西班牙语短语“con quién”（“和谁？”）联系在一起，但这种解释并未得到证实。在英文资料中，它也写作 Conquian 或 Coon Can。",
    concan_history_names_p2: "由于这个游戏是靠玩而不是靠规则书传承的，所以存在多种版本。PaperGames 采用简单好玩的版本，并在规则页面上加以说明。"
});
I18n.markTextLoaded("zh");
