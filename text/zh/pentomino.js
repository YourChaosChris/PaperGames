// text/zh/pentomino.js
// Rules and history texts of pentomino (zh). Loaded by pentomino-rules.html and pentomino-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    pt_rules_title: "五连块拼图规则",
    pt_rules_intro: "用由五个正方形组成的拼块填满一个长方形。",
    pt_rules_basics_title: "规则",
    pt_term_pieces: "拼块",
    pt_rules_pieces: "如果把旋转和翻转后相同的形状算作一种，五个正方形边对边连接的方式正好有十二种。每块都带着它惯用的字母——F、I、L、N、P、T、U、V、W、X、Y、Z——和自己的黑白花纹。",
    pt_term_lay: "摆放",
    pt_rules_lay: "在格子下方选一块。“旋转 ↻”和“翻转 ⇋”改变它的方向；它的圆点标出一个格子。点圆点要放的格子：放得下就放好了。点已放的拼块可以重新拿起。不需要拖动。",
    pt_term_free: "自由摆放",
    pt_rules_free: "摆放拼块，直到长方形填满——任何填法都算数。简单：5块放进5 × 5。中等：8块放进5 × 8。困难：全部12块放进6 × 10、5 × 12、4 × 15或3 × 20。",
    pt_term_fixed: "给出起始拼块",
    pt_rules_fixed: "在6 × 10上有些拼块固定不动（内有虚线框）；其余拼块只有一种放法。简单：要放3块，中等：5块，困难：7块。",
    pt_term_help: "提示",
    pt_rules_help: "提示会标出下一块可以放在哪里。如果某块已放的拼块挡住了所有完成的办法，提示会指出这一块。",
    pt_rules_example_title: "示例",
    pt_rules_example: "一个解好的简单题：五块拼块填满了5 × 5的正方形。",
    pt_history_title: "五连块拼图的历史",
    pt_history_early_title: "杜德尼与哥隆",
    pt_history_early_p1: "已知最早的一套十二块俱全的谜题，见于亨利·杜德尼1907年的书《坎特伯雷谜题》。“五连块”（pentomino）这个名字来自数学家所罗门·哥隆，他从1953年开始描述这些形状；马丁·加德纳在《科学美国人》上的谜题专栏使它们广为人知。",
    pt_history_count_title: "解的数目",
    pt_history_count_p1: "填满6 × 10有多少种方法？C. B.哈泽尔格罗夫和珍妮弗·哈泽尔格罗夫在1960年用计算机算出：2339种，整解旋转或翻转后的副本不算在内。5 × 12有1010种，4 × 15有368种，3 × 20只有2种。"
});
I18n.markTextLoaded("zh");
