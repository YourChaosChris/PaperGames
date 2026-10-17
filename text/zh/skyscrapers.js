// text/zh/skyscrapers.js
// Rules and history texts of skyscrapers (zh). Loaded by skyscrapers-rules.html and skyscrapers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    skyscrapers_rules_title: "摩天大楼规则",
    skyscrapers_rules_intro: "关于PaperGames如何呈现摩天大楼（Skyscrapers）玩法的简明说明——无论你是生疏了还是刚开始学，都能派上用场。",
    skyscrapers_rules_basics_title: "基本玩法",
    skyscrapers_term_board: "网格",
    skyscrapers_rules_board: "每个格子里填的是一栋建筑的高度，从1（最矮）到N（最高，N为网格的大小）。在网格外围，有些行和列在紧靠那条边的外侧带有一个提示数字——并非每一行或每一列都有，也不一定每一侧都有。",
    skyscrapers_term_clues: "读懂边缘提示",
    skyscrapers_rules_clues: "提示数字表示从那一侧看向对应的行或列时能看到多少栋建筑：如果某栋建筑前面有更高的建筑，从那个视角看它就会被完全挡住。上方的提示是从上往下看这一列，下方的提示是从下往上看，左侧的提示是沿着这一行从左往右看，右侧的提示是从右往左看。",
    skyscrapers_term_goal: "目标",
    skyscrapers_rules_goal: "在每个格子中填入1到N之间的高度，使每行每列都恰好包含每个高度一次（与数独中行、列的规则相同，只是没有九宫格式的方块规则），并且网格四周显示的每个提示都要与从那一侧实际可见的建筑数量相符。",
    skyscrapers_term_input: "输入高度",
    skyscrapers_rules_input: "先选择一个格子，再从棋盘下方的面板中选择高度（也可以用键盘输入数字）。显示虚线边框的格子，说明它与所在行或列中已使用的某个高度重复了——这是提醒你需要做出修改的信号。",
    skyscrapers_term_difficulty: "难度",
    skyscrapers_rules_difficulty: "简单、中等和困难难度使用依次增大的网格（4x4、5x5和6x6），公开的边缘提示数量也依次减少——需要同时兼顾的高度更多，但规则始终只有这两条。",
    skyscrapers_rules_example_title: "实例演示",
    skyscrapers_term_example: "数一数可见的建筑",
    skyscrapers_rules_example_p1: "假设有一行四栋建筑，高度依次为3、1、4、2，从左到右排列。从左边看过去：3最先可见，因为它前面没有更高的建筑。1比已经看到的3矮，所以被挡住看不见。4比前面所有建筑都高，所以也可见。2比4矮，所以仍然被挡住。",
    skyscrapers_rules_example_p2: "这样从左边一共能看到2栋建筑——3和4——所以左侧提示为2正好符合这一行。如果换成从右边看这同一行（按观察顺序读作2、4、1、3）：2最先可见，4比它高所以也可见，而随后的1和3都比已经看到的4矮，所以都看不见——这里右侧提示恰好也是2，不过这纯粹是这一行的巧合。",
    skyscrapers_rules_end_title: "完成谜题",
    skyscrapers_term_win: "已解出",
    skyscrapers_rules_win: "当网格被完全填满、每行每列都恰好包含每个高度一次，并且边缘的每个提示都与其所在行或列实际可见的建筑数量相符时，谜题即告解出。",
    skyscrapers_history_title: "摩天大楼的历史",
    skyscrapers_history_origins_title: "根植于谜题杂志文化",
    skyscrapers_history_origins_p1: "与数独不同，摩天大楼并没有一位有充分记载、为历史学家所公认的发明者，也没有公认的首次发表日期。和许多逻辑谜题类型一样，它似乎是通过谜题杂志文化逐渐出现并传播开来的，而不是在某个特定时刻归功于某位具名的创作者——「可见数量提示」这个想法足够简单，完全可能有不止一位谜题设计者各自独立地想到了它。",
    skyscrapers_history_origins_p2: "可以确定的是它背后的数学原理：与数独一样，解出的摩天大楼网格就是一个拉丁方阵——即每个符号（这里是建筑高度）在每行每列中恰好出现一次的网格，这正是莱昂哈德·欧拉在18世纪研究过的对象，远早于这两种谜题的诞生。",
    skyscrapers_history_spread_title: "一种竞技谜题",
    skyscrapers_history_spread_p1: "摩天大楼通过竞技解谜活动获得了最广泛的国际知名度，尤其是世界解谜锦标赛（World Puzzle Championship）——一项始办于1992年的年度国际解谜赛事。在那里，它与数独系列以及其他基于拉丁方阵的谜题一样，是反复出现的标准谜题类型之一。",
    skyscrapers_history_spread_p2: "正是这种竞技场合，帮助这款谜题的规则和呈现方式定型为如今通行的标准形式，即便它并没有一位公认的发明者——这也和许多反复出现的谜题类型一样，其最终形态与其说归功于某一位创作者，不如说来自谜题杂志和锦标赛题库中反复不断的使用。",
    skyscrapers_history_modern_title: "从外部观察的拉丁方阵",
    skyscrapers_history_modern_p1: "摩天大楼在概念上的独特之处，在于它把一种空间化、可视化的想法——沿着一排建筑望过去，数一数有多少栋高得能被看见——叠加在了数独行列逻辑这一已经熟悉的基础之上。正是这种结合，赋予了这款谜题它的名字和主题化的呈现方式，不同于数独或纯粹的拉丁方阵谜题所呈现的单调数字网格。",
    skyscrapers_history_modern_p2: "这也正是PaperGames的生成器反向利用的特性：既然边缘提示归根结底只是从一个已完成网格中计算出的事实，这里的每道谜题都是先构建一个完整有效的网格，从中计算出所有可能的提示，然后只保留足以让该网格仍然只有唯一解的那部分提示——这正是本合集中数独和卡库罗生成器所使用的「先生成、再削减」方法，只是适配了不同的约束条件。"
});
I18n.markTextLoaded("zh");
