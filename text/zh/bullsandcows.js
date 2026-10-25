// text/zh/bullsandcows.js
// Rules and history texts of bullsandcows (zh). Loaded by bullsandcows-rules.html and bullsandcows-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    bullsandcows_rules_title: "公牛与母牛规则",
    bullsandcows_rules_intro: "关于 PaperGames 如何演绎公牛与母牛的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    bullsandcows_rules_basics_title: "基本玩法",
    bullsandcows_term_code: "秘密代码",
    bullsandcows_rules_code: "每局新游戏开始时，电脑会选定一个由四个位置组成的隐藏代码，每个位置是圆形、方形、三角形、菱形、星形或十字形这六种图形之一。根据难度不同，同一个图形在代码中可能出现不止一次。",
    bullsandcows_term_guess: "进行猜测",
    bullsandcows_rules_guess: "点击一个格子即可在六种图形之间循环切换，等四个格子都显示出你想尝试的图形后，点击“提交猜测”。无论秘密代码本身是否有重复图形，你在猜测中都可以自由重复使用某个图形。",
    bullsandcows_term_feedback: "解读提示",
    bullsandcows_rules_feedback: "每次猜测都会得到一排提示钉：图形和位置都正确会得到一个黑色提示钉，图形正确但位置错误则得到一个白色提示钉。例如，如果代码是圆形-圆形-方形-三角形，而你猜的是圆形-方形-方形-方形，你会得到两个黑色提示钉（第一个圆形和第三个方形完全正确），没有白色提示钉——因为猜测中多出来的方形在代码里已经没有可以对应的了。提示钉从不说明它们对应哪个格子，弄清楚这一点正是这个游戏的乐趣所在。",
    bullsandcows_rules_end_title: "结束一局游戏",
    bullsandcows_term_win: "获胜",
    bullsandcows_rules_win: "当某次猜测获得四个黑色提示钉时，你就获胜了——也就是每个图形都恰好在正确的位置上。",
    bullsandcows_term_loss: "用完猜测次数",
    bullsandcows_rules_loss: "每个难度都允许固定次数的猜测。如果用完了所有次数仍未猜出代码，游戏就此结束，并会揭晓秘密代码。",
    bullsandcows_term_levels: "难度等级",
    bullsandcows_rules_levels: "简单难度给你12次猜测机会，但秘密代码中不会出现重复图形。中等难度给10次猜测机会，并允许重复图形，这是这款游戏传统的玩法。困难难度只给8次猜测机会，同样允许重复图形，因此需要留意重复出现的图形。",
    bullsandcows_history_title: "公牛与母牛的历史",
    bullsandcows_history_origins_title: "纸笔上的经典",
    bullsandcows_history_origins_p1: "它的核心想法——猜一个隐藏的密码，只得知完全对上和部分对上的数量，却永远不知道是哪几个——来自“公牛与母牛”（Bulls and Cows），一种早于 1970 年的纸笔猜谜游戏，据一些说法还要古老得多。传统上猜的是秘密数字：数字对、位置也对叫“公牛”，数字对但位置不对叫“母牛”。",
    bullsandcows_history_origins_p2: "它也很早就被搬上了计算机：常被称为 Moo 的版本从 20 世纪 60 年代末起就在大学的计算机上运行，编写它至今仍是经典的编程练习。",
    bullsandcows_history_spread_title: "棋盘游戏与名称",
    bullsandcows_history_spread_p1: "1970 年，这个想法被做成了使用彩色插针的棋盘游戏，并以 Mastermind 之名风靡全球。Mastermind 是一个商标，权利属于 Invicta Plastics。PaperGames 与 Invicta Plastics 及该棋盘游戏没有任何关联，因此使用更古老的名称“公牛与母牛”（Bulls and Cows）。",
    bullsandcows_history_modern_title: "计算机科学家钟爱的谜题",
    bullsandcows_history_modern_p1: "由于它归结为只凭匹配数量去寻找隐藏的答案，这个游戏成为计算机科学和组合数学中研究猜测策略与搜索算法的标准案例。",
    bullsandcows_history_modern_p2: "在 1976/77 年一篇著名的论文中，高德纳证明：四个位置、六种符号的经典版本，用最优策略总能在五次以内猜中——每当谈到算法搜索，这一结果至今仍被引用。"
});
I18n.markTextLoaded("zh");
