// text/zh/slitherlink.js
// Rules and history texts of slitherlink (zh). Loaded by slitherlink-rules.html and slitherlink-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.zh, {
    slitherlink_rules_title: "斯利瑟林克规则",
    slitherlink_rules_intro: "关于PaperGames如何呈现斯利瑟林克（也称为「Fences」或「Loop the Loop」）玩法的简明说明——无论你是生疏了还是刚开始学，都能派上用场。与本合集中的大多数谜题不同，这里不需要用数字或字母填格子：整个谜题都是靠画线完成的。",
    slitherlink_rules_basics_title: "基本思路",
    slitherlink_term_board: "网格",
    slitherlink_rules_board: "棋盘是一个由点组成的网格。每两个相邻的点之间（无论横向还是纵向）都有一条可能的边，可以画出或留空。由四个点围成的一些方格中标有一个小数字；没有数字的方格则没有任何限制。",
    slitherlink_term_clue: "读懂提示数字",
    slitherlink_rules_clue: "方格内的数字（0、1、2或3）精确指出了完成后的谜题中，该方格四条边里必须画出多少条——不多也不少。0表示这四条边永远都不会被画出；3表示四条边中恰好有三条会被画出。",
    slitherlink_term_goal: "目标",
    slitherlink_rules_goal: "画出边，使它们恰好构成一条连续封闭、既不分叉也不与自身交叉的回路，同时满足每个带数字方格的要求。回路可以按需要经过网格中或多或少的部分，也不必围出任何特定的形状——决定回路走向的是这些数字，而不是某个目标图案。",
    slitherlink_term_input: "画边",
    slitherlink_rules_input: "点击一条边即可画出；再次点击会把它标记为虚线叉号，这纯粹是给自己的可选提示，意为「肯定不是回路的一部分」（适用于你已经排除、但不想忘记的边）；第三次点击则会将其恢复为空白。已经出错的方格——周围画出的边太多，或剩下的空白边太少而永远无法达到其数字要求——会出现虚线圆环作为提示，说明附近需要做出改动；而已经有三条或更多线相交的点（在单一回路中绝不允许出现）则会显示为空心。",
    slitherlink_term_difficulty: "难度",
    slitherlink_rules_difficulty: "简单、中等和困难的谜题使用逐渐变大的网格（5x5、7x7和10x10个方格），这意味着回路更长、需要同时兼顾的数字更多——但规则始终相同。本合集生成的每一个谜题都预先经过检验，确保恰好只有一条有效回路，因此总能仅凭纯粹的推理找到答案，完全不需要猜测。",
    slitherlink_rules_example_title: "实例演示",
    slitherlink_term_example1: "0旁边的情况",
    slitherlink_rules_example_p1: "标有0的方格会立即使其四周的边全部确定为空白——它的任何一边都绝不可能成为回路的一部分。仅这一点就可能产生连锁反应：如果相邻的方格标有3，并且与这个0方格共用一条边，那么这条共用边已经确定为空白（因为它属于那个0），这意味着3方格其余三条边都必须画出，因为一条空白加三条画出是唯一能恰好凑到3的办法。",
    slitherlink_term_example2: "沿着角点推理",
    slitherlink_rules_example_p2: "一个点如果已经有恰好两条边相交，就不能再多一条——所有触及这个点的其他潜在边都必须保持空白，因为有效的回路绝不会分叉（一个点上有三条或更多线相交），也绝不会出现死胡同（一个点上只有一条线，没有可以继续的方向）。围绕少数带数字方格所强制确定的边，逐点、逐角地反复运用这一条规则，往往就足以在完全不需要猜测的情况下确定棋盘的一大片区域——而且更进一步，一旦所有提示都得到满足，且已画出的边已经构成一个封闭图形，棋盘上其余的每一条边也都会被强制确定为空白，因为绝不允许出现第二条回路。",
    slitherlink_rules_end_title: "完成谜题",
    slitherlink_term_win: "已解出",
    slitherlink_rules_win: "当画出的边恰好构成一条封闭回路——没有松散的端点，没有分叉，棋盘上任何地方都没有第二条独立的回路——并且每个带数字的方格都被精确满足时，谜题即告解出。游戏会立即识别出这一点，无需另外的「检查」步骤。",
    slitherlink_history_title: "斯利瑟林克的历史",
    slitherlink_history_origins_title: "Nikoli的原创作品",
    slitherlink_history_origins_p1: "斯利瑟林克于1989年首次发表，出版方正是日本谜题出版社Nikoli——该公司此前已在日本推广了数独和卡库罗，并为二者命名——发表于自家的一本谜题杂志上。与那两者不同，斯利瑟林克并非Nikoli引进后加以改良的舶来品，而是该公司自己的原创谜题之一；和Nikoli的许多谜题类型一样，它源自读者投来的创意，再由杂志编辑部加以完善。",
    slitherlink_history_origins_p2: "在英语中，它也被称为「Loop the Loop」（绕圈成环），这恰如其分地描述了其目标：网格中的每一个提示数字，其存在的唯一目的就是确定这一条单一、连续、不自相交的回路的走向。",
    slitherlink_history_design_title: "另一种网格谜题",
    slitherlink_history_design_p1: "数独和卡库罗要求解题者用数字填满格子，而斯利瑟林克要求的则是结构上完全不同的东西：在固定的点之间画线，直到它们构成一个封闭图形。这在精神上使它更接近数织（Nonogram）的图案逻辑和卡库罗的数字条推理——只凭提示进行推理，绝不猜测——尽管在纸面上它和这两者看起来都毫不相像。解题从不需要任何计算或语言知识，只需要反复运用同样一小撮局部推理（0会使其四条边都为空白，一个已有两条线相交的角点会使该点上其余的每一条线都为空白，以此类推），直到回路闭合为止。",
    slitherlink_history_design_p2: "正是这种不依赖语言的特性，让它像Nikoli的其他逻辑谜题一样得以广泛流传：一份发表在日本杂志上的斯利瑟林克网格，无需任何翻译，便能在世界任何角落被解出。",
    slitherlink_history_modern_title: "加入更广阔的谜题家族",
    slitherlink_history_modern_p1: "一般认为，斯利瑟林克借着人们对Nikoli谜题目录兴趣高涨的同一股浪潮而走向国际——正是这股浪潮在2000年代中期把数独带上了世界各地的报纸——并以多个名称出现，其中Fences和Loop the Loop这两个英文名称都流传了下来，先后出现在谜题书籍、杂志中，最终遍布各类手机应用和网站。",
    slitherlink_history_modern_p2: "如今，它已是这个家族中一个稳固的成员，而本合集中已经收录了这个家族的好几位成员：这些纯推理谜题不需要共通的语言或计算能力即可享受其乐趣。这里生成的每一份斯利瑟林克，都像本合集中的数独、卡库罗和数织谜题一样，经过计算机验证，保证每个棋盘都恰好只有一个正确答案。"
});
I18n.markTextLoaded("zh");
