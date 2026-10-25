// text/zh/hanoi.js
// Rules and history texts of hanoi (zh). Loaded by hanoi-rules.html and hanoi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    hanoi_rules_title: "汉诺塔规则",
    hanoi_rules_intro: "一座圆盘塔（最小的在最上面）立在左边的柱子上。把它移到右边的柱子上。",
    hanoi_rules_basics_title: "规则",
    hanoi_term_move: "一步",
    hanoi_rules_move: "点一根柱子：拿起它最上面的圆盘（柱子会有粗边框）。点一根柱子，把圆盘放上去。再点一次同一根柱子，就把圆盘放回去。",
    hanoi_term_rule: "规定",
    hanoi_rules_rule: "只能移动柱子最上面的圆盘，而且它永远不能放在比它小的圆盘上。这样的移动会被拒绝，什么也不会动。",
    hanoi_term_goal: "目标",
    hanoi_rules_goal: "整座塔移到右边的柱子上（有星号标记）。最少步数是2的圆盘数次方减1：3个圆盘7步，4个15步，8个255步。",
    hanoi_term_help: "撤销和提示",
    hanoi_rules_help: "“撤销”可以收回步数。提示会给两根柱子加双边框：把第一根柱子最上面的圆盘移到第二根——这是从你当前局面出发的最短路线的下一步。",
    hanoi_history_title: "汉诺塔的历史",
    hanoi_history_lucas_title: "爱德华·卢卡斯，1883年",
    hanoi_history_lucas_p1: "法国数学家爱德华·卢卡斯于1883年把这个谜题作为一个据说由“N. 克劳斯（德·暹罗）”发现的游戏推出——这个名字是“Lucas d'Amiens”的字母重新排列。1889年，他把它出版成一本小册子。",
    hanoi_history_legend_title: "编造的传说",
    hanoi_history_legend_p1: "随游戏附带的传说讲到，贝拿勒斯一座寺庙里的僧侣在移动一座由64个金盘组成的塔，等他们移完，世界就会毁灭。这个传说是游戏故事的一部分，并不是真实的历史。",
    hanoi_history_math_title: "最少步数",
    hanoi_history_math_p1: "移动n个圆盘至少需要2^n − 1步：先把较小的n − 1个圆盘移到中柱，再把最大的移到目标柱，然后把较小的移到它上面。如果是64个圆盘、每秒移一步，所需时间远远超过宇宙的年龄。"
});
I18n.markTextLoaded("zh");
