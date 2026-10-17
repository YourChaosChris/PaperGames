// text/zh/yatzy.js
// Rules and history texts of yatzy (zh). Loaded by yatzy-rules.html and yatzy-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    yatzy_rules_kniffel: "只有正好1-2-3-4-5（小顺子）和2-3-4-5-6（大顺子）算作顺子，其他四个或五个连续点数的组合不算。",
    yatzy_rules_title: "快艇骰子规则",
    yatzy_rules_intro: "关于 PaperGames 版快艇骰子玩法的简明说明——无论你是想找回手感，还是刚开始学习，都用得上。",
    yatzy_rules_basics_title: "基本玩法",
    yatzy_term_dice: "骰子",
    yatzy_rules_dice: "每个回合你要掷5个六面骰子。掷完后，点击任意骰子即可将其保留——被保留的骰子会维持原来的点数——然后再次掷骰，重新投掷剩下的骰子。每个回合总共最多可以掷3次。",
    yatzy_term_categories: "记分表",
    yatzy_rules_categories: "在本回合的最后一次掷骰之后，点击记分表中15个项目之一，将当前的骰子结果记在该项目上。每个项目在整局游戏中只能使用一次，所以即使掷得不好，也必须选一个项目记下来——当全部15个项目都填满后，游戏结束。",
    yatzy_term_upper: "上半区：1点到6点",
    yatzy_rules_upper: "这六个项目计算相应点数骰子的总和——例如三个4点，在“4点”一栏中记12分。如果这六项都填满并且总分达到63分或以上，就能额外获得50分的奖励。",
    yatzy_term_lower: "下半区：组合",
    yatzy_rules_lower: "一对和两对计算相应骰子的总和，取可用的最高一对或两对——四条也算作同一数字的两对。三条和四条只计算相应的三个或四个骰子的总和，而不是全部五个。小顺子（1-2-3-4-5）和大顺子（2-3-4-5-6）分别固定得15分和20分。葫芦（三个相同点数加另一组一对）计算全部五个骰子的总和。机会不论骰子点数如何，都计算全部五个骰子的总和。快艇（五个骰子点数全部相同）固定得50分。",
    yatzy_rules_end_title: "结束一局游戏",
    yatzy_term_total: "最终得分",
    yatzy_rules_total: "当所有项目都填满后，你的最终得分等于上半区总分（如果达标，还包括50分奖励）加上下半区总分。这里没有对手需要击败——只有你自己的最好成绩，留待下一次挑战。",
    yatzy_history_title: "快艇骰子的历史",
    yatzy_history_origins_title: "从骰子扑克到「快艇」游戏",
    yatzy_history_origins_p1: "早在快艇骰子出现之前，19世纪的「骰子扑克」游戏就使用五个印有扑克牌面（从9到A）的骰子，在完全不用纸牌的情况下组成对子、三条、四条、葫芦等扑克牌型。后来出现的「快艇」（Yacht）游戏改用普通的数字骰子，并允许每个回合多次重掷，把同样的一套扑克牌型分类搬到了带数字的记分表上，还加入了顺子和自己的五个相同点数的组合。",
    yatzy_history_origins_p2: "据通常流传的说法，20世纪50年代中期，一对夫妇喜欢和朋友们在自己的私人游艇上玩「快艇」游戏，并制作了少量套装作为礼物送人，这引起了美国玩具公司E.S. Lowe的注意。",
    yatzy_history_spread_title: "米尔顿·布拉德利时代",
    yatzy_history_spread_p1: "E.S. Lowe 公司取得了这款游戏的权利，从1956年起以新的注册商标名「Yahtzee」进行生产。它成为20世纪最畅销的骰子游戏之一，E.S. Lowe 公司本身也在1973年被 Milton Bradley 公司收购，后者后来又并入了 Hasbro——如今 Yahtzee 商标仍归 Hasbro 所有。",
    yatzy_history_spread_p2: "由于「Yahtzee」是注册商标，想要销售或介绍同类游戏的其他出版商和地区通常不能直接使用这个名称——这也是同样玩法的记分表在数十年间以各种不同的地方名称流传的原因之一。",
    yatzy_history_modern_title: "北欧版本与不同的记分表",
    yatzy_history_modern_p1: "「快艇骰子」是这类游戏在北欧地区常用的名称，它和美式版本的差异并不只是名字不同，而是有真正的规则区别：北欧版记分表增加了两个额外项目——一对和两对，这是标准美式 Yahtzee 记分表所没有的，因此项目数变成15个、15个回合，而不是13个。",
    yatzy_history_modern_p2: "上半区的奖励分也不同：美式 Yahtzee 在1点到6点的总分达到63分或以上时奖励35分，而这里使用的北欧版快艇骰子记分表在同样达到63分的门槛时会奖励50分——这是规则上一个虽小却真实的差异，而不仅仅是同一款游戏在不同地区的叫法。",
    yatzy_history_names_title: "关于名称的说明",
    yatzy_history_names_p1: "Yahtzee 和 Kniffel 是注册商标。PaperGames 与这些商标的所有者没有任何关联，提供的是斯堪的纳维亚版本 Yatzy，它对顺子有自己的规则。"
});
I18n.markTextLoaded("zh");
