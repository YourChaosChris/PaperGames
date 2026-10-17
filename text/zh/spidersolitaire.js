// text/zh/spidersolitaire.js
// Rules and history texts of spidersolitaire (zh). Loaded by spidersolitaire-rules.html and spidersolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    spidersolitaire_rules_title: "空当蜘蛛纸牌规则",
    spidersolitaire_rules_intro: "关于本站如何玩空当蜘蛛纸牌的简明说明——如果你手生了，或者正在学习，都会有帮助。",
    spidersolitaire_rules_basics_title: "基本玩法",
    spidersolitaire_term_layout: "牌局布置",
    spidersolitaire_rules_layout: "两副完整的牌（共104张）会被发到10列牌桌中——前4列每列6张，其余6列每列5张——每列只有最上面一张牌正面朝上。没有基础堆。剩下的50张牌组成发牌堆，之后会以每次10张的方式分批发出。",
    spidersolitaire_term_difficulty: "选择难度",
    spidersolitaire_rules_difficulty: "开始前请选择本局使用几种花色：1种花色最简单（任何点数正确的牌都能接上任何顺子），2种花色为中等难度，4种花色是传统、最难的版本——就像把两副真正的扑克牌混合洗在一起一样。",
    spidersolitaire_term_tableau: "移动单张牌",
    spidersolitaire_rules_tableau: "一张牌只能移动到牌桌某一列中点数恰好大一的牌上——这里花色不重要。空列可以接受任何一张牌或任何合法顺子，没有任何点数限制。",
    spidersolitaire_term_group: "移动一组牌",
    spidersolitaire_rules_group: "若干张已经叠在一起的牌，只有当它们本来就是同一花色、按顺序递减排列的顺子时（例如红心的5-4-3，且正好是这个顺序），才能作为一个整体一起移动——即便点数顺序正确，只要花色混杂，就不能一起移动。移动一组牌时，仍然要遵守上面“点数恰好大一”的放置规则。牌移走后，所在列新露出的最上面一张牌会自动翻成正面朝上。",
    spidersolitaire_term_stock: "发牌堆",
    spidersolitaire_rules_stock: "点击发牌堆即可发出下一批10张牌，每列各得一张正面朝上的牌。只要还有任意一列是空的，就无法发牌——需要先清空它（把牌移到别处，或通过它完成一个顺子），才能再次发牌。",
    spidersolitaire_term_sequences: "完成顺子",
    spidersolitaire_rules_sequences: "只要某一列中出现了从国王到A、同一花色且顺序正确、彼此相连的完整顺子，系统就会自动检测并将其清除——这些牌不需要是该列中仅有的牌，只要它们恰好按顺序叠放在能够自然一起被拿走的位置即可。每完成一组顺子，棋盘上方的计数器就会加一。",
    spidersolitaire_rules_end_title: "结束一局游戏",
    spidersolitaire_term_win: "获胜",
    spidersolitaire_rules_win: "一旦全部8组从国王到A的顺子都被组好并清除，游戏就获胜——那正好是104张牌除以13，无论你选择哪种花色数量的难度，这个总数都不会变。",
    spidersolitaire_history_title: "空当蜘蛛纸牌的历史",
    spidersolitaire_history_origins_title: "一款未被精确记载的热门游戏",
    spidersolitaire_history_origins_p1: "与一些能追溯到具体发明者的纸牌游戏不同，空当蜘蛛纸牌的确切起源并没有被精确记录下来——像许多纸牌游戏一样，它是在大众玩法中逐渐演变而成的，而不是被归功于某一个人或某一次最早的出版物。可以确定的是，早在计算机出现之前很久，到20世纪早中期，它就已经是纸笔和绒布桌上双副牌纸牌游戏家族中一款广受欢迎、地位稳固的游戏了。",
    spidersolitaire_history_origins_p2: "它的名字几乎可以肯定是在暗指游戏本身的难度和结构，而不是纸牌上有什么蜘蛛图案：需要从十个铺展很长的牌桌列中，编织出八组类似基础堆的顺子（呼应蜘蛛的八条腿），而一旦用上四种花色，途中就完全没有颜色或基础堆花色方面的提示可以依靠。",
    spidersolitaire_history_spread_title: "随 Windows 附赠",
    spidersolitaire_history_spread_p1: "空当蜘蛛纸牌最著名的大众化时刻出现在1998年，微软将它作为内置游戏捆绑进了Windows——最早出现在Windows 98 Plus!增强包和Windows Me时代，随后从Windows XP起成为标准内置项目。",
    spidersolitaire_history_spread_p2: "这一个决定，把蜘蛛纸牌介绍给了庞大的全球用户群，就像Windows此前对克朗代克（当时干脆就叫“接龙”）以及后来对空当接龙所做的那样——把一款几十年来只是安静地存在于真实牌桌上的纸牌游戏，变成了世界上使用最广泛的软件之一，而玩家们甚至完全不需要拥有一副真正的扑克牌。",
    spidersolitaire_history_modern_title: "本站的这个版本",
    spidersolitaire_history_modern_p1: "本站按照标准规则来实现空当蜘蛛纸牌，并在开局前就可以选择全部三种传统的花色数量难度——1种、2种，或完整的4种花色版本——沿用了本站克朗代克和空当接龙已经采用的那种摩擦更小、每局都真正重新洗牌的方式，并针对蜘蛛纸牌自身十列、无基础堆的布局做了相应调整。"
});
I18n.markTextLoaded("zh");
