// text/zh/zahlenschloss.js
// Rules and history texts of zahlenschloss (zh). Loaded by zahlenschloss-rules.html and zahlenschloss-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    zahlenschloss_rules_title: "数字锁规则",
    zahlenschloss_rules_intro: "数字锁由一组秘密数字打开。几组数字会告诉你它们离答案有多近。你不必猜测，所有线索都能帮你找到答案。",
    zahlenschloss_rules_basics_title: "规则",
    zahlenschloss_term_code: "密码",
    zahlenschloss_rules_code: "密码有3位（简单和中等）或4位（困难）。每个数字只出现一次，密码可以以0开头。",
    zahlenschloss_term_clues: "线索",
    zahlenschloss_rules_clues: "每条线索由一个与密码位数相同的数字和一句说明组成：说明其中有多少位数字正确且位置正确，有多少位数字在密码中但位置不对。“没有数字正确”表示这些数字都不在密码中。每道谜题只有一个解，而且需要用到每条线索。",
    zahlenschloss_term_notes: "笔记",
    zahlenschloss_rules_notes: "点线索中的数字可以将它划掉，例如你确定它不在密码中时。再点一次可恢复。撤销会删除你最近的笔记。笔记只供你自己参考，不会计入结果。",
    zahlenschloss_term_enter: "打开数字锁",
    zahlenschloss_rules_enter: "用数字键把密码输入空格，然后点“开锁”。输错会算一次错误，但你可以马上重试。提示按钮会根据一条或两条线索给出一个推论。“显示答案”会在确认后把密码填入空格，这道题算作放弃。",
    zahlenschloss_term_levels: "难度",
    zahlenschloss_rules_levels: "简单模式是3位数，并且总有一条线索中没有正确数字。中等模式是3位数，每条线索至少有一个正确数字。困难模式是4位数。每道谜题都有编号；相同编号始终对应同一道题。",
    zahlenschloss_history_title: "数字锁的历史",
    zahlenschloss_history_origins_title: "位置正确或错误",
    zahlenschloss_history_origins_p1: "区分数字在正确位置或错误位置的想法来自一种古老的纸笔游戏，常叫作公牛与母牛。一位玩家想好一个各位不同的数字，另一位玩家不断猜，每次尝试后都会得到回应。这种游戏可能已有一个世纪；大约在1970年，它成为最早的一批大学计算机游戏之一。",
    zahlenschloss_history_puzzle_title: "线索固定的谜题",
    zahlenschloss_history_puzzle_p1: "后来，猜数字游戏变成了谜题：所有反馈一次给出，你要从中推导出密码。这类带五条线索的数字锁谜题在2010年代通过互联网广泛传播，如今也出现在谜题书和课堂中。这个点子不属于任何人。",
    zahlenschloss_history_here_title: "这里的数字锁",
    zahlenschloss_history_here_p1: "这个点子由一位玩家提交。PaperGames制作自己的谜题：电脑尝试所有可能的密码，只保留恰好有一个解的题目，并删去不必要的线索。"
});
I18n.markTextLoaded("zh");
