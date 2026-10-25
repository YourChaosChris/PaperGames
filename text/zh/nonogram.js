// text/zh/nonogram.js
// Rules and history texts of nonogram (zh). Loaded by nonogram-rules.html and nonogram-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    nonogram_rules_title: "数织规则",
    nonogram_rules_intro: "关于 PaperGames 如何演绎数织（又称 Griddlers）的简明参考——无论你是想重新捡起来，还是刚开始学习，都能用得上。",
    nonogram_rules_basics_title: "基本玩法",
    nonogram_term_clues: "读懂线索",
    nonogram_rules_clues: "每一行和每一列都配有一组线索数字：依次给出该行（列）中每一段连续填色格的长度，各段之间至少间隔一个空格。线索“3 1”表示这条线上某处先有连续三格被填色，隔一格空白后，再有一格被填色。",
    nonogram_term_filling: "填色与标记",
    nonogram_rules_filling: "使用填色模式为你确定属于图案的格子上色，使用标记 X 模式为你确定是空白的格子打叉——标记只是帮助记忆的辅助手段，不影响是否获胜，但能帮助你在推理线索时排除可能性。",
    nonogram_rules_end_title: "完成一局",
    nonogram_term_win: "已解出",
    nonogram_rules_win: "当你填色的格子与隐藏图案完全一致的那一刻，谜题即被解出——打叉标记的格子是否正确并不重要，只有填色的格子才算数。",
    nonogram_history_title: "数织的历史",
    nonogram_history_origins_title: "两位发明者，两块大陆",
    nonogram_history_origins_p1: "这种谜题起源于20世纪80年代末的日本。1987年，日本平面设计编辑石田のん（Non Ishida）在东京的一次设计比赛中获胜，作品是用摩天大楼窗户的亮灯与熄灯组成的网格图画；她由此想到了这种谜题，并在1988年以“Window Art Puzzles”为名发表了三道这样的图画谜题。日本谜题作者西尾彻也独立发明了同类谜题，并在另一本杂志上发表。",
    nonogram_history_origins_p2: "英国谜题收藏家詹姆斯·达尔盖蒂（James Dalgety）看到石田的谜题后，帮助她在日本以外发表。“Nonogram”这个名字就是他取的，由“Non”（石田的名字）和“-gram”（来自“diagram”）组合而成。从1990年起，英国报纸《星期日电讯报》每周刊登这种谜题；1998年，读者通过一次征名比赛选出了新名字“Griddlers”。如今这种谜题有多个名字，其中包括 Picross 和 Hanjie。",
    nonogram_history_spread_title: "从杂志到 Game Boy",
    nonogram_history_spread_p1: "任天堂以“Picross”（“picture”与“crossword”的合成词）之名，将这种谜题推向了全世界，从 1995 年起陆续为 Game Boy 和超级任天堂推出 Picross 系列游戏——对许多日本以外的玩家来说，正是这套掌机系列让他们第一次接触到这种谜题形式。",
    nonogram_history_spread_p2: "这种谜题的魅力，最终远远超出了专门的电子游戏领域：2000 年代的解谜热潮中，报纸的解谜版面把它与数独一起收录进来，通常沿用 Griddlers 或 Hanjie 这个名字，如今它依然是各类谜题书和应用中的常客。",
    nonogram_history_modern_title: "一种（通常）无需猜测的谜题",
    nonogram_history_modern_p1: "一道设计精良的数织谜题，理应能够完全依靠纯逻辑推理、逐行逐列地解出，而无需任何猜测——这也正是 PaperGames 自身谜题在被收录之前必须通过的检验标准：借助一种约束传播求解器，确认每幅图案的线索都能推出唯一合法的网格。",
    nonogram_history_modern_p2: "不过，并非所有的线索组合都具备这一性质：和扫雷一样，一般化的数织求解问题也已被证明是 NP 完全的，这意味着一道足够庞大、或刻意刁难的谜题，可能需要真正的回溯式猜测才能解开——面向普通解谜者精心设计的谜题，则会特意避免这种情况，而这本身就是一门小小的设计艺术。"
});
I18n.markTextLoaded("zh");
