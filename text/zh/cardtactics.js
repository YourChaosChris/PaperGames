// text/zh/cardtactics.js
// Rules and history texts of cardtactics (zh). Loaded by cardtactics-rules.html and cardtactics-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    cardtactics_rules_title: "卡牌战术规则",
    cardtactics_rules_intro: "快速了解 PaperGames 这款由卡牌驱动的棋盘竞速游戏怎么玩。",
    cardtactics_rules_basics_title: "基本玩法",
    cardtactics_term_setup: "摆放",
    cardtactics_rules_setup: "棋盘有7行6列。黑方的六颗棋子放在底行，白方的六颗放在顶行。黑方先走。",
    cardtactics_term_cards: "移动牌",
    cardtactics_rules_cards: "移动牌共有12张；开局时洗牌，双方各拿六张。每方前面放三张明牌（双方都能看到），其余三张盖放在该方自己的牌堆中。每张牌用箭头表示走法：↑↑表示向前两格，↑←表示向前一格再向左一格，↗表示斜向一格。向前始终指朝向对方的方向。",
    cardtactics_term_moving: "如何走棋",
    cardtactics_rules_moving: "从自己的三张明牌中选一张，再选一颗自己的棋子，最后选该牌允许到达的格子。你可以走到空格，也可以吃掉敌方棋子。自己的棋子会挡路。你不能使用对方的牌。",
    cardtactics_term_cycle: "牌堆",
    cardtactics_rules_cycle: "自己的盖放牌堆顶牌补到你用过的牌的位置，而用过的牌放回自己的牌堆中一个隐蔽的位置。因此你永远不知道自己的哪张牌会接着出现，而且自己的牌不会交给对方。",
    cardtactics_term_opening: "开局第一步",
    cardtactics_rules_opening: "先手的第一步最多只能走一行，第二步不能向前直走两行。这样可以平衡先手优势。",
    cardtactics_term_pass: "无路可走",
    cardtactics_rules_pass: "如果你无法走棋，就跳过本回合，并将自己的第一张明牌放回自己的牌堆。",
    cardtactics_rules_end_title: "赢得游戏",
    cardtactics_term_win: "两颗棋子到达终点",
    cardtactics_rules_win: "棋子到达对方底行（目标行）就算穿越成功：它离开棋盘并计为已到终点；若该行有敌方棋子，则将其吃掉。先让两颗棋子到达终点的一方获胜。如果另一方在棋盘上和终点的棋子加起来不足两颗，你也获胜。",
    cardtactics_term_limit: "步数上限",
    cardtactics_rules_limit: "走满120步后游戏结束：先比较到达终点的棋子数，再比较棋盘上的棋子数；都相同则平局。",
    cardtactics_history_title: "卡牌战术的历史",
    cardtactics_history_origins_title: "奔向对岸",
    cardtactics_history_origins_p1: "把自己的棋子移到棋盘另一侧，是棋盘游戏中一个古老的目标。Halma 由美国外科医生 George Howard Monks 于1883或1884年发明，先把所有棋子移到对角营地的一方获胜。",
    cardtactics_history_origins_p2: "在 Halma 和国际象棋中，每种棋子都有固定走法。在卡牌战术中，棋子没有自己的走法：自己的明牌决定可走的步法，双方各有自己的牌。",
    cardtactics_history_version_title: "此版本",
    cardtactics_history_version_p1: "PaperGames 于2026年10月重写了规则：棋盘为7行6列，双方各有六颗相同的棋子，各有六张自己的牌（三张明牌、三张在盖放牌堆中），目标是让两颗棋子回家。十二张牌、牌上的箭头及其名称均为 PaperGames 自有。"
});
I18n.markTextLoaded("zh");
