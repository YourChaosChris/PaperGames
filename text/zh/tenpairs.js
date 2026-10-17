// text/zh/tenpairs.js
// Rules and history texts of tenpairs (zh). Loaded by tenpairs-rules.html and tenpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    tp_rules_title: "凑十对规则",
    tp_rules_intro: "划掉成对的数字，直到一个也不剩。",
    tp_rules_basics_title: "规则",
    tp_term_field: "盘面",
    tp_rules_field: "数字1到9排成九列，像读文章一样一行一行地读。",
    tp_term_pairs: "对子",
    tp_rules_pairs: "两个数字相同（3和3）或相加等于10（1和9、2和8、3和7、4和6、5和5）时，可以一起划掉。",
    tp_term_see: "互相看到",
    tp_rules_see: "两个数字必须互相看得到：横、竖或斜着紧挨着，或者在这条线上中间只有已划掉的格子。横向还可以跨过行尾：一行的最后一个数字能看到下一行的第一个，依此按阅读顺序类推。",
    tp_term_add: "补写",
    tp_rules_add: "卡住时点“补写”：所有还没划掉的数字会按原来的顺序写到盘面最后。每局最多5次。",
    tp_term_rows: "空行",
    tp_rules_rows: "九格都已划掉的一行会消失。",
    tp_term_end: "输赢",
    tp_rules_end: "所有数字都划掉就赢了。没有可划的对子也不能再补写，或者盘面超过40行，就输了。",
    tp_term_start: "开局",
    tp_rules_start: "经典：1 2 3 4 5 6 7 8 9，然后是1 1 1 2 1 3 1 4 1 5 1 6 1 7 1 8 1 9（1到19，不含10）。随机：三、四或五行；难度越低，挨在一起的对子越多。",
    tp_term_help: "帮助",
    tp_rules_help: "“撤销”可以退回任意多步。“提示”会标出一对可划掉的数字，或者告诉你只能补写了。",
    tp_rules_example_title: "例子",
    tp_rules_example: "经典开局。左上角的1和它下面的1竖着能互相看到，而且相同。第一行末尾的9和第二行开头的1跨过行尾能互相看到，相加等于10。",
    tp_history_title: "凑十对的历史",
    tp_history_origins_title: "来自作业本",
    tp_history_origins_p1: "在PaperGames能查到的资料里，这个谜题的起源没有记载。俄罗斯网站Habr上一篇2011年的文章回忆了中小学和大学时的玩法：人们在方格作业本上玩，叫它“数”“数字”“瓜子”或“19”，没有正式名称。那里的游戏从连续写下的1到19（不含10）开始，与这里的经典开局是同样的数字；没有对子可划时，就把剩下的数字抄到后面。",
    tp_history_name_title: "名称",
    tp_history_name_p1: "“凑十对”只是说明这个谜题的玩法。好几个应用用各自的名字做同样的玩法；PaperGames不使用那些名字。斜向对子、最多补写5次和40行的上限是PaperGames的规则。"
});
I18n.markTextLoaded("zh");
