// text/zh/cardtactics.js
// Rules and history texts of cardtactics (zh). Loaded by cardtactics-rules.html and cardtactics-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    cardtactics_rules_title: "卡牌战术规则",
    cardtactics_rules_intro: "关于 PaperGames 如何演绎这款卡牌驱动的对决游戏的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    cardtactics_rules_basics_title: "基本玩法",
    cardtactics_term_setup: "初始摆放",
    cardtactics_rules_setup: "每一方以四枚学徒和一枚宗师起手，排列在自己的底排，宗师位于正中央的格子上。从一副共享的牌堆中随机发五张移动卡牌：每位玩家各得两张，还有一张正面朝上放在中间，作为备用卡。",
    cardtactics_term_cards: "移动卡牌",
    cardtactics_rules_cards: "每张卡牌都展示了一小组相对位移，你的任意一枚棋子都可以据此从当前所在位置移动——同一张卡牌对学徒和宗师同样适用。没有哪枚棋子可以无视卡牌行动：这一回合能怎么走，完全由手中的卡牌决定。",
    cardtactics_term_moving: "走一步棋",
    cardtactics_rules_moving: "轮到你时，先选择手中两张卡牌中的一张，再选一枚己方棋子，然后选一个该卡牌允许它到达的格子——如果那格上站着敌方棋子，就将其吃掉。你用过的卡牌会放到中间，原本在中间等待的那张卡牌则加入你的手中，取而代之——于是这五张卡牌会在整局对局中不断在双方之间轮转。",
    cardtactics_rules_end_title: "赢得对局",
    cardtactics_term_win: "两种获胜方式",
    cardtactics_rules_win: "吃掉对方的宗师，或者让自己的宗师走到对方的“本阵”——也就是对方底排正中央的格子。任何一种情况都会让对局立即结束。",
    cardtactics_history_title: "卡牌驱动对决的历史",
    cardtactics_history_origins_title: "一款由卡牌驱动的国际象棋变体",
    cardtactics_history_origins_p1: "用其他机制取代固定棋子走法的国际象棋变体由来已久，但那种专门围绕一小手可互换的“移动卡牌”构建的游戏，则是较为近期的发明，诞生于 2010 年代那一波注重设计感的桌面抽象策略游戏浪潮之中。",
    cardtactics_history_origins_p2: "这个核心构思说起来很简单，实际下起来却出人意料地深邃：由于双方手中的卡牌都与那张共享的中间卡牌相互衔接，你每走一步棋，也会在下一回合给对手带来新的选项——想要往后多算几步，就不能只盯着棋子，还必须一并跟踪卡牌接下来会如何流转。",
    cardtactics_history_design_title: "小棋盘，深棋局",
    cardtactics_history_design_p1: "这款游戏在一个紧凑的 5x5 棋盘上进行，每方只有五枚棋子，一局通常几分钟内就能结束，这让它成了双人游戏之夜和旅行套装的热门之选——小小的体量之下，藏着一场真正需要精密计算的较量。",
    cardtactics_history_design_p2: "两种获胜条件——吃掉对方宗师，或让己方宗师走到对方的本阵——让进攻策略与纯粹以位置取胜的“抢跑”策略始终同时存在，因此哪怕在子力上大幅落后，也仍有可能凭借突破抵达本阵而突然获胜。",
    cardtactics_history_version_title: "本应用的版本",
    cardtactics_history_version_p1: "PaperGames 实现了这套卡牌驱动的移动机制，但采用了一套完全原创的十六张移动卡牌与元素命名，而不是照搬任何特定发行商的卡牌设计——发牌、轮转与获胜的底层规则是相同的，但你在这里看到的具体卡牌内容，是本应用独有的。"
});
I18n.markTextLoaded("zh");
