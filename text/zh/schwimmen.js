// text/zh/schwimmen.js
// Rules and history texts of schwimmen (zh). Loaded by schwimmen-rules.html and schwimmen-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sudoku_rules_basics_title: "基本玩法",
    schwimmen_rules_title: "三十一点规则",
    schwimmen_rules_intro: "PaperGames 中三十一点的玩法。这种游戏在德语国家叫 Schwimmen 或 Schnauz。",
    schwimmen_term_setup: "牌和人数",
    schwimmen_rules_setup: "一副 32 张牌（四种花色的 7 到 A），2 到 6 人。每人三张牌，另外三张正面朝上放在中间。",
    schwimmen_term_values: "手牌计分",
    schwimmen_rules_values: "7 到 10 按点数计，J、Q、K 各 10 点，A 为 11 点。一手牌只计算同一种花色的牌——也就是你最好的那种花色。最高是 31 点：同花色的一张 A 加两张十点牌。三张同点数的牌，例如三张 K，算 30.5 点；三张 A 算 31 点。你自己的分数总是显示在你的牌下方。",
    schwimmen_term_turn: "轮到你",
    schwimmen_rules_turn: "只做一件事：用你的一张牌换中间的一张牌，把你的三张牌全部和中间交换，过，或敲桌。如果所有人连续都过，中间的牌就放到一边，换上牌堆里的三张新牌。",
    schwimmen_term_knock: "敲桌",
    schwimmen_rules_knock: "觉得手牌够好时就敲桌。然后其他每位玩家再各走一手，之后所有人亮牌。每轮只能有一位玩家敲桌。",
    schwimmen_term_31: "三十一点",
    schwimmen_rules_31: "谁正好凑到 31 点——包括发牌时就有——就立刻亮出，其他每位玩家各失去一条命。",
    schwimmen_term_lives: "命和“游泳”",
    schwimmen_rules_lives: "每人开始有三条命，用实心圆表示。亮牌后，分数最低的人失去一条命；最低分并列时，他们都失去一条。没有命的玩家在“游泳”，仍然继续玩；再输一次就出局。最后剩下的玩家获胜。如果最后几位玩家同时出局，则为平局。",
    schwimmen_term_variant: "这里采用的玩法",
    schwimmen_rules_variant: "三十一点有很多家规。这里从第一手起就可以敲桌；如果需要更换中间的牌但牌堆剩下不到三张，这一轮立刻结束并亮牌。",
    schwimmen_history_title: "三十一点的历史",
    schwimmen_history_origins_title: "古老的目标数字",
    schwimmen_history_origins_p1: "以凑出 31 点为目标的纸牌游戏在欧洲已流传了几个世纪，这个数字出现在好几种彼此无关的游戏中。这里的三张牌游戏属于所谓的交换类游戏：玩家通过和中间的公共牌交换来改善手牌。",
    schwimmen_history_origins_p2: "没有人知道谁最先以现在的形式玩这个游戏。和大多数民间纸牌游戏一样，它是靠玩而不是靠文字传播的，规则从一张牌桌传到另一张牌桌，带着一些小的地方差异。",
    schwimmen_history_names_title: "游泳、敲桌、Scat",
    schwimmen_history_names_p1: "在德语国家，这个游戏叫 Schwimmen、Schnauz、Knack 或干脆叫 31；在英语国家叫 Thirty-One 或 Scat。德语名字（“游泳”）来自那位失去所有命、还要“游”完最后一轮的玩家。",
    schwimmen_history_names_p2: "传统上，命是用每位玩家面前的硬币或火柴来计数的。PaperGames 用实心圆和空心圆显示，让游戏状态在黑白屏幕上也一目了然。"
});
I18n.markTextLoaded("zh");
