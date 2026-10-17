// text/zh/loosen.js
// Rules and history texts of loosen (zh). Loaded by loosen-rules.html and loosen-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    lr_rules_title: "解开圆环规则",
    lr_rules_intro: "解开圆环是一个互相扣住的圆环谜题：转动它们，直到它们一个接一个脱开。",
    lr_rules_basics_title: "规则",
    lr_term_rings: "圆环",
    lr_rules_rings: "每个圆环都有一个缺口。相互重叠的圆环像链条的环节一样扣在一起：在两个交点中，一个交点处这个在上，另一个交点处那个在上——下面的圆环在那里画成断开的。",
    lr_term_turn: "转动",
    lr_rules_turn: "点一个圆环，它会顺时针转四分之一圈；两个按钮可以把选中的圆环向左或向右转。每个和它扣住的圆环都会像齿轮一样反向转四分之一圈。",
    lr_term_free: "自由",
    lr_rules_free: "当圆环的缺口位于扣住的圆环压在上面的那个交点处时——对每个仍与它扣住的圆环都是如此——它就自由了。所以和两个或更多圆环扣住的圆环还不能自由。点一个自由的圆环，它就会被取出。",
    lr_term_goal: "目标",
    lr_rules_goal: "取出所有圆环。圆环上方的一行显示最少步数；转动和取出各算一步。",
    lr_term_levels: "难度",
    lr_rules_levels: "简单：3个圆环。中等：4或5个。困难：6或7个，其中有一个圆环和另外三个扣住。",
    lr_term_help: "帮助",
    lr_rules_help: "“撤销”退回一步。“提示”会标出最短路线中下一步要动的圆环。没有时间限制。",
    lr_rules_example_title: "示例",
    lr_rules_example: "圆环1只和圆环2扣住。它的缺口在上方交点，那里圆环2压在上面——所以圆环1是自由的。圆环2还不自由：它的缺口不在下方交点，那里圆环1压在上面。",
    lr_history_title: "解开圆环的历史",
    lr_history_old_title: "古老的圆环谜题",
    lr_history_old_p1: "需要把圆环解开的谜题由来已久。最著名的九连环，卢卡·帕乔利在约1500年的手稿《论数量的力量》中有所描述，1550年由吉罗拉莫·卡尔达诺印刷出版；在中国，它最早在16世纪初见于记载。它在哪里发明尚不清楚。",
    lr_history_new_title: "纸上的新谜题",
    lr_history_new_p1: "解开圆环是为PaperGames制作的：从上方看的、带缺口的平面圆环，像齿轮一样转动。因为圆环只能在邻环压在上面的地方脱开，图中的编织关系就是谜题的一部分。"
});
I18n.markTextLoaded("zh");
