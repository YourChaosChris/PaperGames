// text/ar/tictactoe.js
// Rules and history texts of tictactoe (ar). Loaded by tictactoe-rules.html and tictactoe-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.ar, {
    tictactoe_rules_title: "قواعد إكس-أو",
    tictactoe_rules_intro: "ملخص سريع لطريقة لعب إكس-أو (tic-tac-toe) في PaperGames.",
    tictactoe_rules_basics_title: "الفكرة الأساسية",
    tictactoe_term_board: "اللوحة والعلامات",
    tictactoe_rules_board: "اللوحة شبكة 3x3 من تسع خانات. يضع اللاعبان علامتيهما بالتناوب في خانة فارغة: علامة × للاعب 1، ودائرة للاعب 2. يبدأ اللاعب 1 دائمًا. وتبقى العلامة في مكانها حتى نهاية اللعبة.",
    tictactoe_rules_end_title: "كيف تنتهي اللعبة",
    tictactoe_term_win: "الفوز",
    tictactoe_rules_win: "أول لاعب يضع ثلاث علامات له في صف واحد – أفقيًا أو عموديًا أو قطريًا – يفوز فورًا. ويظهر صف الفوز بتعبئة سوداء.",
    tictactoe_term_draw: "التعادل",
    tictactoe_rules_draw: "إذا امتلأت الخانات التسع ولم يحقق أحد ثلاثة في صف، فاللعبة تعادل. لاعبان لا يخطئان يتعادلان دائمًا – لذلك لا يخسر الحاسوب أبدًا في المستوى الصعب، وأفضل نتيجة ممكنة أمامه هي التعادل.",
    tictactoe_term_resignation: "الاستسلام",
    tictactoe_rules_resignation: "يمكن للاعب أن يستسلم في أي وقت، فتنتهي اللعبة فورًا لصالح الخصم.",
    tictactoe_rules_hard_title: "المستوى «صعب»",
    tictactoe_rules_hard: "في المستوى «صعب» يحسب الكمبيوتر كل الاستمرارات الممكنة ولا يخطئ أبدًا. وقد ثبت للوحة 3×3 – بفحص كل المباريات الممكنة – أن لاعبَين لا يخطئان ينتهيان دائمًا بالتعادل. لذلك فأفضل ما يمكنك تحقيقه أمام هذا المستوى هو التعادل؛ وخطأ واحد يعني الخسارة.",
    tictactoe_history_title: "تاريخ إكس-أو",
    tictactoe_history_origins_title: "ثلاث حصيات في روما",
    tictactoe_history_origins_p1: "لُعبت لعبة قريبة منها في الإمبراطورية الرومانية نحو القرن الأول قبل الميلاد، على الأرجح باسم terni lapilli، أي «ثلاث حصيات في كل مرة». كان لكل لاعب ثلاث قطع فقط؛ وبعد وضعها كلها على اللوحة كانت تُحرّك إلى نقاط فارغة لمواصلة اللعب.",
    tictactoe_history_origins_p2: "عُثر على خطوط شبكات هذه اللعبة في أماكن كثيرة من روما.",
    tictactoe_history_spread_title: "Noughts and Crosses وTic-Tac-Toe",
    tictactoe_history_spread_p1: "عُرفت اللعبة بأسماء كثيرة. يظهر الاسم البريطاني «noughts and crosses» (الأصفار والإكسات) مطبوعًا منذ منتصف القرن التاسع عشر، ومن أمثلة ذلك مجلة Notes and Queries عام 1858.",
    tictactoe_history_spread_p2: "وفي الولايات المتحدة شاع اسم tic-tac-toe خلال القرن العشرين. وربما يعود إلى «tick-tack»، وهو شكل قديم من الطاولة (النرد) كان معروفًا في إنجلترا منذ القرن السادس عشر.",
    tictactoe_history_modern_title: "من أوائل ألعاب الحاسوب",
    tictactoe_history_modern_p1: "في عام 1952 كتب أ. س. (ساندي) دوغلاس برنامج OXO لحاسوب EDSAC في جامعة كامبريدج، ضمن أطروحته للدكتوراه عن التفاعل بين الإنسان والحاسوب. كان اللاعب يختار خانته بقرص هاتف دوّار، وكان الحاسوب يلعب لعبًا مثاليًا. ويُعدّ OXO من أوائل ألعاب الفيديو المعروفة.",
    tictactoe_history_modern_p2: "اللعبة صغيرة بما يكفي لحسابها بالكامل: بعد استبعاد الدوران والانعكاس هناك 26,830 لعبة ممكنة، ومع اللعب المثالي تنتهي كل واحدة منها بالتعادل. وهذا بالضبط ما يفعله المستوى الصعب هنا – قبل كل حركة يفحص كل مسار ممكن للعبة."
});
I18n.markTextLoaded("ar");
