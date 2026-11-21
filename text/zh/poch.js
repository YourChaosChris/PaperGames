// text/zh/poch.js
// Rules and history texts of poch (zh). Loaded by poch-rules.html and poch-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    poch_rules_title: "波赫牌规则",
    poch_rules_intro: "波赫牌是用32张牌和筹码玩的古老纸牌游戏。每局分三个阶段：特定的牌赢得对应的池，玩家为自己最大的一组同点牌下注，最后所有人按顺序打出手牌。六局后筹码最多者获胜。",
    poch_rules_basics_title: "规则",
    poch_term_pools: "池",
    poch_rules_pools: "盘上有九个池：A、K、Q、J、10、夫妻（K和Q）、顺子（7、8、9）、波赫和中央池。每局开始前每位玩家往每个池放一枚筹码，共9枚。除一张外的牌全部发完，那张牌翻开放置：它的花色就是支付花色。",
    poch_term_first: "第一阶段：支付",
    poch_rules_first: "持有支付花色的A、K、Q、J或10的人，拿走对应池里的筹码。同时持有支付花色的K和Q，还赢得夫妻池；同时持有支付花色的7、8、9，赢得顺子池。无人赢得的池（没人持有该牌，或该牌是翻开的那张）留到下一局并不断增加。",
    poch_term_pochen: "第二阶段：波赫",
    poch_rules_pochen: "只有手里有两张、三张或四张同点牌的玩家参加，用自己最大的一组比较。庄家左边的第一位玩家过牌或下注1；之后可以跟注、每次加1（总共最多4）或弃牌。付不起跟注的玩家只能弃牌。四条胜过三条，三条胜过一对；点数大的胜过点数小的；同一对牌中含有支付花色的牌，胜过没有的。最大的一组赢得波赫池和所有下注。如果大家都过牌，波赫池保留；只有一人有一组时，他立即拿走波赫池。",
    poch_term_play: "第三阶段：打牌",
    poch_rules_play: "波赫的赢家（或庄家左边的玩家）先出任意一张牌。同花色的下一张更大的牌必须由持有者打出，然后是再下一张，直到A。如果下一张牌不存在——已经打出或是翻开的那张——就由最后出牌的人再次先出。最先打完手牌的人赢得中央池，并从每位其他玩家那里按其剩余手牌数各得一枚筹码。",
    poch_term_end: "游戏结束",
    poch_rules_end: "一场游戏共六局；如果有人付不起一局所需的9枚筹码，游戏提前结束。筹码最多者获胜。筹码只是游戏中的分数，不涉及金钱。",
    poch_term_computer: "电脑",
    poch_rules_computer: "“简单”多数时候过牌并随便出一张牌。“中等”在有三条、四条或大对子时加注，并出一张无人能接的牌。“困难”还会统计仍在下注的玩家人数，并规划自己手牌的顺序。提示按钮会显示“困难”会怎么做。",
    poch_history_title: "波赫牌的历史",
    poch_history_origins_title: "非常古老的游戏",
    poch_history_origins_p1: "波赫牌至少有五百年历史，最早见于15世纪的记载。在德国叫Pochen或Pochspiel，在法国叫La Poque，用一块专门放筹码的盘来玩。波赫牌被视为扑克的前身之一，类似的带筹码盘的游戏至今仍在许多国家流行。",
    poch_history_here_title: "这里的波赫牌",
    poch_history_here_p1: "PaperGames把波赫牌做成一人对战一至三个电脑的游戏。它有自己的九个池的盘面和自己的文字，共六局，不涉及金钱，电脑在两步之间会停顿。"
});
I18n.markTextLoaded("zh");
