// text/zh/kakuro.js
// Rules and history texts of kakuro (zh). Loaded by kakuro-rules.html and kakuro-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    kakuro_rules_title: "卡库罗规则",
    kakuro_rules_intro: "关于PaperGames如何呈现卡库罗玩法的简明说明——无论你是生疏了还是刚开始学，都能派上用场。卡库罗有时被称为「数字填字游戏」：用数字代替字母填入每个白色格子，用总和代替单词作为提示。",
    kakuro_rules_basics_title: "基本玩法",
    kakuro_term_board: "网格",
    kakuro_rules_board: "网格由带提示的黑色格子和可填写的白色格子组成。每一段连续的白色格子（横向从左到右，或纵向从上到下）称为一条「数字条」。每条数字条只有一个提示：其中数字必须相加得到的总和。",
    kakuro_term_clues: "读懂提示格",
    kakuro_rules_clues: "黑色格子用白色数字显示其总和，如果同时带有两个提示，则用对角线分开：右上角的数字是紧邻其右侧、向右延伸的数字条（「横向」提示）的目标总和；左下角的数字是紧邻其下方、向下延伸的数字条（「纵向」提示）的目标总和。只带一个提示的黑色格子只显示那一个数字。",
    kakuro_term_goal: "目标",
    kakuro_rules_goal: "在每个白色格子中填入1到9之间的数字，使每条数字条中的数字相加恰好等于其提示总和——同样重要的是，同一条数字条内不能出现重复的数字（同一个数字可以出现在与之交叉的另一条数字条中，但绝不能在同一条数字条内出现两次）。",
    kakuro_term_input: "输入数字",
    kakuro_rules_input: "先选择一个白色格子，再从棋盘下方的数字面板中选择一个数字（也可以用键盘输入数字）。显示虚线边框的格子，说明它在所属的某条数字条中与其他格子重复了数字，或者所属的数字条已全部填满但总和还未达到提示值——这是提醒你需要做出修改的信号。",
    kakuro_term_difficulty: "难度",
    kakuro_rules_difficulty: "简单、中等和困难难度使用依次增大的网格（7x7、9x9和11x11），这意味着数字条更长，彼此交叉也更多——需要同时兼顾的数字更多，但规则始终只有这两条。",
    kakuro_rules_example_title: "实例演示",
    kakuro_term_example: "两条交叉的数字条",
    kakuro_rules_example_p1: "假设一条2格的横向数字条提示为4，其第一格同时也是一条2格纵向数字条的起点，提示为3。横向数字条的两个数字必须不重复地相加得到4——只有1+3或3+1能做到（2+2重复了数字2，因此不允许）。纵向数字条的两个数字必须不重复地相加得到3，只有1+2或2+1能做到。",
    kakuro_rules_example_p2: "两条数字条共用的格子，必须填入两条数字条都能使用的数字。横向数字条为该格提供的候选是{1, 3}，纵向数字条提供的候选是{1, 2}——两个集合中唯一相同的数字是1。因此共用格必须是1，这样一来横向数字条的另一格就确定为3，纵向数字条的另一格确定为2。整道谜题就这样仅凭排除法解开，完全不需要猜测——同样的推理方式，重复更多次，就能解开任何更大的卡库罗网格。",
    kakuro_rules_end_title: "完成谜题",
    kakuro_term_win: "已解出",
    kakuro_rules_win: "当所有白色格子都已填满、每条数字条的总和都符合提示、且没有任何数字条出现重复数字时，谜题即告解出。",
    kakuro_history_title: "卡库罗的历史",
    kakuro_history_origins_title: "诞生于美国的「Cross Sums」",
    kakuro_history_origins_p1: "如今被称为卡库罗的数字填字谜题，最早以「Cross Sums」（也写作「Cross Sum」）之名出现在美国出版商Dell的谜题杂志上；已知最早的例子来自1950年。人们常认为它的发明者是加拿大人雅各布·E·芬克（Jacob E. Funk）。这款谜题过了几年才流行起来，但到20世纪60年代中期，它已成为Dell旗下谜题杂志的常规栏目，与该公司的其他数字与逻辑谜题并列刊载。",
    kakuro_history_origins_p2: "这个创意把填字游戏网格的外观，与词汇替换为算术结合了起来：黑色格子里写着提示数字，取代了填字游戏的释义；白色格子则要填入数字，其总和须与这些提示相符。",
    kakuro_history_spread_title: "获得日文名字，迎来第二次生命",
    kakuro_history_spread_p1: "Cross Sums传入日本后，被谜题出版商Nikoli（后来推广数独并为其命名的正是这家公司）看中，并为其取名「Kakuro（卡库罗）」，是日语「加算クロス（加法十字）」的缩略说法。",
    kakuro_history_spread_p2: "整个20世纪80年代，卡库罗成长为Nikoli在日本最受欢迎的谜题之一，早在后来把Nikoli之名传遍世界的数独热潮之前，就已在日本积累了大批拥趸。",
    kakuro_history_modern_title: "被重新发现的谜题",
    kakuro_history_modern_p1: "2000年代中期，随着数独在全球报纸上掀起热潮，卡库罗的国际知名度也再度上升：正在寻找「接班」谜题的编辑们把目光投向了Nikoli旗下的其他数字谜题——许多西方玩家由此第一次以其日文名字认识了卡库罗，尽管这款谜题本身早在几十年前就已在北美发明。",
    kakuro_history_modern_p2: "这段分两阶段展开的历史，也体现在这款谜题至今的解法之中：卡库罗网格从不需要靠猜测，只需要与当年解答Dell原版Cross Sums时同样的逐条排除法——只不过表现为一个数字接一个数字、一条提示接一条提示——这正是本合集的生成器反其道而用之的原理：从一个随机填满的网格出发，构造出一道全新的谜题。"
});
I18n.markTextLoaded("zh");
