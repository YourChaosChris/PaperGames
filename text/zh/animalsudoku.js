// text/zh/animalsudoku.js
// Rules and history texts of animalsudoku (zh). Loaded by animalsudoku-rules.html and animalsudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    animalsudoku_rules_title: "动物数独规则",
    animalsudoku_rules_intro: "给孩子玩的小数独：用动物代替数字，只有4×4或6×6个格子。",
    animalsudoku_rules_basics_title: "规则",
    animalsudoku_term_board: "棋盘",
    animalsudoku_rules_board: "棋盘有4×4个格子，分成四个2×2的宫；或有6×6个格子，分成六个2行3列的宫。粗线标出各宫。",
    animalsudoku_term_animals: "动物",
    animalsudoku_rules_animals: "4×4有四种动物：狗、猫、兔子和老鼠。6×6再加上猫头鹰和鱼。每种动物在每一行、每一列和每一宫中都恰好出现一次。",
    animalsudoku_term_given: "题目给出的动物",
    animalsudoku_rules_given: "有些动物一开始就在棋盘上。它们带粗框，不能改动。",
    animalsudoku_term_input: "怎么玩",
    animalsudoku_rules_input: "在棋盘下方的按钮中选一种动物，再点一个空格子。用同一种动物再点一次就会拿掉，也可以用橡皮。如果一种动物在同一行、列或宫中出现两次，两者都会加上虚线框。",
    animalsudoku_term_hint: "提示",
    animalsudoku_rules_hint: "“提示”按钮和数独里的一样：如果有错误，先指出错误；否则先标出下一个格子，再说明原因，按第三次时放上动物。",
    animalsudoku_term_levels: "难度",
    animalsudoku_rules_levels: "简单、中等和困难的区别在于开始时给出的动物数量。每道题都只有一个答案，不用猜就能解开。",
    animalsudoku_rules_example_title: "已解开的例子",
    animalsudoku_rules_example: "图中是一个已解开的4×4棋盘：每一行、每一列和每个2×2宫里，四种动物各出现一次。",
    animalsudoku_rules_end_title: "完成谜题",
    animalsudoku_term_win: "解开",
    animalsudoku_rules_win: "当每个格子里都是正确的动物时，谜题就解开了。",
    animalsudoku_history_title: "图画数独的历史",
    animalsudoku_history_origins_title: "从拉丁方到数独",
    animalsudoku_history_origins_p1: "每个符号在每行、每列中各出现一次的方格叫作拉丁方。瑞士数学家莱昂哈德·欧拉在18世纪写过关于这种方阵的文章。",
    animalsudoku_history_origins_p2: "再加上宫的条件的谜题，于1979年以Number Place之名刊登在美国的一本谜题杂志上，设计者是霍华德·加恩斯。日本出版社Nikoli在1984年采用了它，并取名为数独。",
    animalsudoku_history_small_title: "小棋盘和图画",
    animalsudoku_history_small_p1: "2000年代中期数独风靡全球后，出现了4×4和6×6的小版本，以及用图画代替数字的版本，尤其是给孩子玩的：规则相同，但一次要记住的东西更少。",
    animalsudoku_history_modern_title: "PaperGames如何生成每道题",
    animalsudoku_history_modern_p1: "这里的每道题都来自PaperGames自己的生成程序。它先随机填满整个棋盘，再一只一只地拿掉动物——但只在谜题仍然只有一个答案、并且还能用两种最简单的步骤解开时才拿掉：某个格子只能放一种动物，或者某种动物在某行、列或宫中只剩一个格子可放。"
});
I18n.markTextLoaded("zh");
