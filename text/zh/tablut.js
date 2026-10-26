// text/zh/tablut.js
// Rules and history texts of tablut (zh). Loaded by tablut-rules.html and tablut-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    tablut_rules_title: "塔布鲁棋规则",
    tablut_rules_intro: "关于 PaperGames 如何演绎塔布鲁棋——塔夫尔家族中的 9x9 成员——的简明参考，无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    tablut_rules_basics_title: "基本玩法",
    tablut_term_setup: "初始摆放",
    tablut_rules_setup: "国王起始位于正中央的王座上，八名护卫呈十字形环绕在他周围，棋盘每条边各驻有两名攻方棋子，共八名攻方将其团团围住。攻方先行，双方的目标截然不同：国王一方希望他能抵达角格，攻方则要抢先把他困死。",
    tablut_term_moving: "移动",
    tablut_rules_moving: "无论是攻方、护卫还是国王，每枚棋子的走法都和车一样：可以沿直线走任意距离，但不能穿过或落在其他棋子上。",
    tablut_term_special: "王座与角格",
    tablut_rules_special: "正中央的王座和四个角格，除国王之外任何人都不得进入或穿过：攻方和护卫既不能落子其上，也不能从中穿行；国王则可以随时自由返回空置的王座。角格是国王唯一的逃脱格。",
    tablut_term_capture: "吃子",
    tablut_rules_capture: "普通棋子（攻方或护卫）通过“夹击吃子法”被吃掉：把它夹在两枚敌方棋子之间，或者一枚敌方棋子与一个对其构成威胁的特殊格（空置的王座或某个角格）之间的相对两侧，且处于同一条直线上。只有刚刚移动的那一步才能触发吃子，所以自己主动把棋子走到两枚敌方棋子中间，永远是安全的。",
    tablut_rules_example_title: "实战举例",
    tablut_rules_example_intro: "两个简短的例子，展示夹击吃子在实战中的运作方式（采用经典的 a-i / 1-9 棋盘坐标，先列后行）：",
    tablut_term_example_ordinary: "普通的夹击",
    tablut_rules_example_ordinary: "一名瑞典护卫位于 d6，紧邻其西侧的 c6 上站着一名莫斯科攻方棋子。当第二名攻方棋子滑动到 e6 时，该护卫就在同一直线上被两枚攻方棋子夹在中间——于是被吃掉。",
    tablut_term_example_throne: "借助王座的夹击",
    tablut_rules_example_throne: "位于 e6 的护卫紧邻空置王座（e5）的南侧。此时只需一枚攻方棋子滑动到护卫正南方的 e7，就足以将其吃掉：对面的空置王座本身就算作敌对格，因此无需第二枚攻方棋子。",
    tablut_rules_end_title: "赢得对局",
    tablut_term_kingcapture: "围困国王",
    tablut_rules_kingcapture: "只有当与国王正交相邻的四个格子全部处于敌对状态时，国王才会被围死：这些格子要么被攻方棋子占据，要么——若某一侧紧邻王座——空置的王座本身也算作等同于攻方棋子的敌对格。与普通棋子不同，本规则中棋盘边缘永远不算作对国王构成威胁：即便国王被逼到棋盘边缘，每个开放的方向仍然需要一枚真正的攻方棋子才能围死他。",
    tablut_term_win: "对局如何结束",
    tablut_rules_win: "国王一方只要抵达四个角格中的任意一个，即刻获胜。攻方则按上述方式围死国王即可获胜。若轮到某一方行动时它没有任何合法着法，该方即告落败。",
    tablut_history_title: "塔布鲁棋的历史",
    tablut_history_linnaeus_title: "拉普兰的林奈",
    tablut_history_linnaeus_p1: "1732年，瑞典博物学家卡尔·林奈——在他以物种命名体系为生物学带来革命性变革的数十年之前——曾游历拉普兰地区，沿途记录当地的动植物，以及他所遇到的萨米人的各种习俗。在他的笔记中，记载了一款萨米人称之为“塔布鲁”的棋类游戏：它的 9x9 棋盘、棋子，以及他们所遵循的规则。",
    tablut_history_linnaeus_p2: "这份记录后来被证明极为重要。几乎没有任何一款塔夫尔游戏的完整规则手册从维京时代本身流传下来——早在有人想到要把规则写下来之前，这款游戏就已经在欧洲大部分地区逐渐式微。林奈关于塔布鲁棋的笔记虽然是在塔夫尔维京时代鼎盛期过去几个世纪之后才写就的，且有些地方并不完善（他的手稿在若干边缘情形上表述含糊，而 1811 年的首个英译本又增添了自身的错误，因此直到今天，不同的复原方案和现代规则体系仍会在一些细节上存在分歧），但自那以后，它始终是学者们用以复原整个塔夫尔家族玩法的最重要的第一手资料。",
    tablut_history_family_title: "最知名的塔夫尔变体",
    tablut_history_family_p1: "部分正因为有这样的文献记录，塔布鲁棋成为塔夫尔家族中最广为人知、历史意义也最重大的一员——在复原其众多近亲的规则时，从小巧的 7x7 Brandub 到庞大的 19x19 Alea Evangelii，人们最常以它作为参照基准。",
    tablut_history_brandub_link: "PaperGames 也收录了较小的 7x7 Brandub 变体，如果你想比较一下两种棋盘尺寸，不妨去看看。",
    tablut_history_version_title: "本应用的版本",
    tablut_history_version_p1: "PaperGames 采用标准的 9x9 棋盘来演绎塔布鲁棋，配置 8 名攻方、8 名护卫和 1 位国王，并使用一套明确定义的现代围王规则（详见规则页面）——因为正如林奈自己的笔记所展示的那样，即便是文献记录最完整的塔夫尔史料，也仍在一些细节上留有解读的空间。"
});
I18n.markTextLoaded("zh");
