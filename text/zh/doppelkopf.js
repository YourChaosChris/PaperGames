// text/zh/doppelkopf.js
// Rules and history texts of doppelkopf (zh). Loaded by doppelkopf-rules.html and doppelkopf-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    sudoku_rules_basics_title: "基本玩法",
    doppelkopf_rules_title: "双头牌规则",
    doppelkopf_rules_intro: "PaperGames 中双头牌（Doppelkopf）的玩法。这里只有带“结婚”规则的普通局；最后一节列出了未包含的内容。",
    doppelkopf_term_setup: "牌和人数",
    doppelkopf_rules_setup: "四名玩家，48 张牌：四种花色的 9、10、J、Q、K、A，每张牌各两张。每人十二张牌。发牌者的下家首先出牌；每局发牌者顺移一个座位。",
    doppelkopf_term_trumps: "王牌",
    doppelkopf_rules_trumps: "共有 26 张王牌。从大到小：两张红心 10，Q（梅花、黑桃、红心、方块），J（同样的花色顺序），然后是方块 A、10、K、9。同一墩中出现两张相同的牌时，先出的赢——只有一个例外：第二张红心 10 胜过第一张。牌桌上方的“王牌顺序”按钮随时显示完整列表，你的王牌单独排成一行，放在其他牌的上方。",
    doppelkopf_term_plain: "副牌",
    doppelkopf_rules_plain: "不是王牌的牌都属于副牌花色：梅花和黑桃各有 A、10、K、9；红心只有 A、K、9，因为红心 10 是王牌。在副牌花色中，A 最大，然后是 10、K、9。",
    doppelkopf_term_follow: "跟牌",
    doppelkopf_rules_follow: "你必须跟首家出的花色，王牌算作单独的一种花色。首家出王牌时，有王牌就必须出王牌。首家出红心时，红心 10 不算——它是王牌——Q 和 J 也不算。只有无法跟牌时，才可以出任意一张牌，包括王牌，这时王牌胜过所有副牌。不能出的牌会显示得较低并带虚线边框，点它时会告诉你原因。",
    doppelkopf_term_parties: "谁和谁一伙",
    doppelkopf_rules_parties: "持有梅花 Q 的两名玩家组成 Re 方；另外两人是 Kontra 方。开始时没有人知道谁和谁一伙——只有你知道自己有没有梅花 Q。某位玩家打出梅花 Q 时，他属于哪一方就公开了。在此之前，牌桌上他那一栏显示问号。",
    doppelkopf_term_marriage: "结婚",
    doppelkopf_rules_marriage: "如果一名玩家同时持有两张梅花 Q，就是“结婚”，游戏会宣布。前三墩中第一个以副牌花色首出、并由另一名玩家赢得的牌墩决定同伴：这名玩家成为同伴，两人作为 Re 方对抗另外两人。如果前三墩中没有这样的牌墩，结婚的玩家就独自对抗其他三人。",
    doppelkopf_term_points: "牌分和胜负",
    doppelkopf_rules_points: "A 计 11 分，10 计 10 分，K 计 4 分，Q 计 3 分，J 计 2 分，9 不计分——共 240 分。第十二墩之后，各方把自己赢得的牌分相加。Re 方至少需要 121 分才能获胜；120 分时 Kontra 方获胜。",
    doppelkopf_term_scoring: "计分",
    doppelkopf_rules_scoring: "获胜一方获胜得 1 个局分；如果是 Kontra 方获胜，再加 1 分（因为战胜了梅花 Q）。输方不足 90、不足 60、不足 30 分时各再加 1 分，输方一墩未得时再加 1 分。获胜方每名玩家加上这些分数，输方每名玩家减去同样的分数。一人对抗三人时，这名玩家的分数按三倍计算。",
    doppelkopf_term_extras: "特殊分",
    doppelkopf_rules_extras: "两人对两人时，还有归于获得方的特殊分：一墩达到 40 分或以上（“双头”），在一墩中捉到对方的方块 A（“狐狸”），以及用梅花 J 赢得最后一墩（“查理”）。特殊分加在局分之上，所以输方也能挽回一些。",
    doppelkopf_term_left_out: "未包含的内容",
    doppelkopf_rules_left_out: "PaperGames 只提供普通局。没有独奏，没有 Re、Kontra、“不足 90”等叫牌，没有“贫穷”规则（王牌极少的玩家），除上述规则外没有其他寻找结婚同伴的方式，也没有比赛规则。俱乐部和家庭常常会加入其中一些；它们不属于这个版本。",
    doppelkopf_history_title: "双头牌的历史",
    doppelkopf_history_origins_title: "从羊头牌到双头牌",
    doppelkopf_history_origins_p1: "双头牌源自羊头牌（Schafkopf）——一种以 Q 和 J 为固定王牌的吃墩游戏，自 18 世纪起在德国流行。大约在 19 世纪，德国北部和中部的玩家开始把两副牌混在一起玩，这个名字由此而来，意思大致是“双头”。",
    doppelkopf_history_origins_p2: "双副牌带来了这个游戏的独特之处：每张牌都有两张，哪一张先出很重要；而且同伴关系可以是秘密的，因为没人知道另一张梅花 Q 在谁手里。",
    doppelkopf_history_names_title: "牌桌多，规则也多",
    doppelkopf_history_names_p1: "长期以来，每个地区、俱乐部和家庭都按自己的规则玩，从红心 10 的大小到允许哪些独奏各不相同。20 世纪，玩家协会为比赛制定了统一规则，但在家里，许多牌友仍保留着自己的家规。",
    doppelkopf_history_names_p2: "PaperGames 提供带“结婚”规则的普通局——几乎所有牌友都以同样方式玩的核心部分——并在规则页面说明省略了哪些附加规则。"
});
I18n.markTextLoaded("zh");
