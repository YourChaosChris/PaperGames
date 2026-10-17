// text/zh/freecell.js
// Rules and history texts of freecell (zh). Loaded by freecell-rules.html and freecell-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    freecell_rules_title: "空当接龙规则",
    freecell_rules_intro: "关于 PaperGames 如何演绎空当接龙的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    freecell_rules_basics_title: "基本玩法",
    freecell_term_layout: "牌局布局",
    freecell_rules_layout: "全部 52 张牌从一开始就正面朝上发到 8 列牌列中——最后四列比完整的 7 张少一张。牌列上方有四个空当，每个空当只能容纳一张牌；此外还有四个基础堆（每种花色一个），从 A 开始按顺序往上叠加，直到 K。",
    freecell_term_tableau: "移动纸牌",
    freecell_rules_tableau: "一张牌只能移到牌列中比它大一点、且颜色相反的牌上，或者移到任意一个空列。若某一列中已经按照这种降序、颜色交替的顺序叠放着连续几张牌，可以把它们作为一次“连续移牌”整体移动，具体能移动多少张，取决于当前有多少个空当和空列可以用来中转。",
    freecell_term_foundation: "基础堆",
    freecell_rules_foundation: "每个基础堆只接受对应的一种花色，从 A 开始，按顺序逐级往上叠加。一旦一张牌进入基础堆，就会一直留在那里——基础堆只进不出，绝不会把牌还给牌列。",
    freecell_rules_end_title: "完成一局",
    freecell_term_win: "获胜",
    freecell_rules_win: "当四个基础堆都从 A 到 K 集齐时，这局游戏即告获胜。与本应用中麻将接龙的牌局不同，空当接龙的每一局只是单纯的随机洗牌——绝大多数牌局都可以解开，这一点和真实的游戏完全一样，但 PaperGames 并不对任何一局的可解性做特别保证。",
    freecell_history_title: "空当接龙的历史",
    freecell_history_origins_title: "一款信息完全公开的纸牌游戏",
    freecell_history_origins_p1: "空当接龙源自一类“公开牌型”或“贝克游戏”（Baker's Game）风格的耐心纸牌游戏家族，其历史至少可以追溯到 20 世纪初——这类游戏从第一步开始就把每一张牌都正面朝上发出，与大多数纸牌接龙不同，没有任何一张牌是藏起来的，因此一个足够熟练的玩家（或电脑）原则上可以在动手之前，就判断出某一局牌是否可解。",
    freecell_history_origins_p2: "引入“空当”——用来临时存放单张牌的小小空位——这一构思，一般归功于保罗·阿尔菲耶（Paul Alfille）。他在 1978 年为 PLATO 计算机系统开发了一款早期数字版本，名为 FreeCell，把原本公开牌型的老玩法，改良成了如今这套具体规则。",
    freecell_history_spread_title: "随 Windows 一同普及",
    freecell_history_spread_p1: "1995 年起，微软将空当接龙与纸牌接龙、扫雷一起内置进 Windows，这款游戏由此成为家喻户晓的名字，也让数以亿计从未接触过它的电脑用户第一次认识了它——这条走红之路，与扫雷的经历颇为相似。",
    freecell_history_spread_p2: "微软的这个版本内置了一套固定的、编号从 1 到 32000 的牌局，而不是每次都重新随机洗牌，这样玩家们就能相互交流心得，重玩同一局特定的牌局——本 PaperGames 版本没有沿用这一惯例，而是每次都真正生成一局全新的随机牌局。",
    freecell_history_modern_title: "那副（几乎）总能获胜的牌局",
    freecell_history_modern_p1: "由于从一开始所有的牌就都清晰可见，空当接龙格外适合计算机分析：在微软最初编号的 32000 局牌局中，经过详尽的求解程序搜索发现，除了一局——编号 11982 的那一局——之外，其余全部都可以解开，这条趣闻至今仍常被空当接龙爱好者们提起。",
    freecell_history_modern_p2: "后续的研究把分析范围推得更远，证实在编号前一百万局的牌局中，无法解开的也只是极少数几局——这正是为什么像本版本这样采用纯粹的随机洗牌，是一个相当安全的选择：碰上那少数几个例外的概率微乎其微。"
});
I18n.markTextLoaded("zh");
