/* Mathoria curriculum: Grade -> Domain -> Topic -> Skill (+ learning objective, generator, prerequisites).
   This is the seed content; administrators can edit it later (stored in the local database). */
(function (MA) {
  'use strict';

  var WORLDS = [
    { id: 'forest', icon: '🌳', color: '#4CB963', theme: ['🍄', '🦉', '🐿️', '🌰', '🍃', '🌲', '🦔', '🌼'], domains: ['num'], unlockLevel: 1, name: { en: 'Number Forest', he: 'יער המספרים' }, desc: { en: 'Counting, place value and number patterns', he: 'ספירה, ערך המקום ותבניות מספרים' } },
    { id: 'village', icon: '🏡', color: '#FF9F43', theme: ['🏠', '🧺', '🐓', '🌻', '🚲', '🍞', '🪿', '🎪'], domains: ['add', 'sub', 'addsub'], unlockLevel: 1, name: { en: 'Addition Village', he: 'כפר החיבור' }, desc: { en: 'Adding and subtracting adventures', he: 'הרפתקאות של חיבור וחיסור' } },
    { id: 'mountain', icon: '⛰️', color: '#7B5CFF', theme: ['🧗', '🦅', '🏔️', '🐐', '🪨', '⛺', '🎒', '🚩'], domains: ['mul', 'div'], unlockLevel: 1, name: { en: 'Multiplication Mountain', he: 'הר הכפל' }, desc: { en: 'Groups, arrays, multiplication and division', he: 'קבוצות, מערכים, כפל וחילוק' } },
    { id: 'island', icon: '🏝️', color: '#25A9E0', theme: ['🐚', '🦀', '🍍', '🐠', '⛱️', '🍕', '🍫', '🥥'], domains: ['frac', 'dec', 'pct'], unlockLevel: 1, name: { en: 'Fraction Island', he: 'אי השברים' }, desc: { en: 'Pizzas, bars, fractions, decimals and percents', he: 'פיצות, שוקולדים, שברים, עשרוניים ואחוזים' } },
    { id: 'city', icon: '🏙️', color: '#FF6B6B', theme: ['🚦', '🏗️', '🚕', '🎡', '🗼', '📐', '🔷', '🏛️'], domains: ['geo'], unlockLevel: 1, name: { en: 'Geometry City', he: 'עיר הצורות' }, desc: { en: 'Shapes, angles, symmetry and area', he: 'צורות, זוויות, סימטרייה ושטח' } },
    { id: 'harbor', icon: '⚓', color: '#1FB58F', theme: ['🚢', '🧭', '🐟', '🦭', '⛵', '🕰️', '📏', '🪙'], domains: ['meas', 'time', 'tm'], unlockLevel: 1, name: { en: 'Measurement Harbor', he: 'נמל המדידות' }, desc: { en: 'Length, weight, time and money', he: 'אורך, משקל, זמן וכסף' } },
    { id: 'station', icon: '🚀', color: '#4C5BD4', theme: ['🛰️', '🪐', '👩‍🚀', '🌟', '🌙', '📡', '📊', '☄️'], domains: ['data', 'datalogic'], unlockLevel: 1, name: { en: 'Math Space Station', he: 'תחנת החלל' }, desc: { en: 'Tables, graphs and chance', he: 'טבלאות, דיאגרמות וסיכויים' } },
    { id: 'cave', icon: '💎', color: '#A55EEA', theme: ['🔦', '🦇', '🗝️', '🧩', '💎', '📜', '🕵️', '🪨'], domains: ['logic'], unlockLevel: 3, bonus: true, name: { en: 'Puzzle Cave', he: 'מערת החידות' }, desc: { en: 'Logic puzzles and Math Detective mysteries', he: 'חידות היגיון ותעלומות של הבלש המתמטי' } }
  ];

  var DOMAIN_META = {
    num: { icon: '🔢', en: 'Number Sense', he: 'חוש מספרי' },
    add: { icon: '➕', en: 'Addition', he: 'חיבור' },
    sub: { icon: '➖', en: 'Subtraction', he: 'חיסור' },
    addsub: { icon: '🔄', en: 'Addition and Subtraction', he: 'חיבור וחיסור' },
    mul: { icon: '✖️', en: 'Multiplication', he: 'כפל' },
    div: { icon: '➗', en: 'Division', he: 'חילוק' },
    frac: { icon: '🍕', en: 'Fractions', he: 'שברים' },
    dec: { icon: '🔟', en: 'Decimals', he: 'שברים עשרוניים' },
    pct: { icon: '💯', en: 'Percent and Ratio', he: 'אחוזים ויחס' },
    geo: { icon: '🔷', en: 'Geometry', he: 'גאומטריה' },
    meas: { icon: '📏', en: 'Measurement', he: 'מדידות' },
    time: { icon: '⏰', en: 'Time', he: 'זמן' },
    tm: { icon: '💰', en: 'Time and Money', he: 'זמן וכסף' },
    data: { icon: '📊', en: 'Data', he: 'נתונים' },
    datalogic: { icon: '📊', en: 'Data and Logic', he: 'נתונים והיגיון' },
    logic: { icon: '🧩', en: 'Logic and Problem Solving', he: 'היגיון ופתרון בעיות' }
  };

  /* skill row: [key, nameEn, nameHe, gen, params, objectiveEn, objectiveHe, prereqIds] */
  var G = {};
  G[1] = [
    ['num', null, [
      ['count', 'Counting', 'ספירה', [
        ['count20', 'Counting 0–20', 'ספירה 0–20', 'count', { max: 20 }, 'Count objects up to 20 and tell how many.', 'לספור עצמים עד 20 ולומר כמה יש.', []],
        ['count100', 'Counting 0–100', 'ספירה 0–100', 'count', { max: 100 }, 'Count big groups using tens and ones up to 100.', 'לספור כמויות גדולות בעזרת עשרות ויחידות עד 100.', ['g1-count20']],
        ['countfwd', 'Counting forward', 'ספירה קדימה', 'seq', { steps: [1], dir: 1, max: 100, mode: 'next' }, 'Say the numbers that come next.', 'לומר אילו מספרים באים אחרי.', ['g1-count20']],
        ['countback', 'Counting backward', 'ספירה אחורה', 'seq', { steps: [1], dir: -1, max: 30, mode: 'prev' }, 'Count back from a given number.', 'לספור אחורה ממספר נתון.', ['g1-countfwd']]]],
      ['numbers', 'Numbers', 'מספרים', [
        ['recog', 'Number recognition', 'זיהוי מספרים', 'recognize', { max: 20 }, 'Match numerals with quantities and number words.', 'להתאים בין ספרות, כמויות ומילים.', []],
        ['write', 'Number writing', 'כתיבת מספרים', 'writeNum', { max: 20 }, 'Write the numeral for a quantity or number word.', 'לכתוב את המספר המתאים לכמות או למילה.', ['g1-recog']],
        ['seqs', 'Number sequences', 'סדרות מספרים', 'seq', { steps: [1, 2, 10], dir: 1, max: 50, mode: 'fill' }, 'Complete sequences that count by 1, 2 or 10.', 'להשלים סדרות בקפיצות של 1, 2 או 10.', ['g1-countfwd']],
        ['missing', 'Missing numbers', 'מספרים חסרים', 'seq', { steps: [1], dir: 1, max: 100, mode: 'missing' }, 'Find the missing number in a counting row.', 'למצוא את המספר החסר בשורת ספירה.', ['g1-countfwd']]]],
      ['comparing', 'Comparing & ordering', 'השוואה וסידור', [
        ['compare', 'Comparing numbers', 'השוואת מספרים', 'compare', { max: 20 }, 'Compare two numbers using <, > and =.', 'להשוות שני מספרים בעזרת <, > ו־=.', ['g1-count20']],
        ['greater', 'Greater than', 'גדול מ־', 'compare', { max: 50, focus: 'greater' }, 'Find the greater number.', 'למצוא את המספר הגדול יותר.', ['g1-compare']],
        ['less', 'Less than', 'קטן מ־', 'compare', { max: 50, focus: 'less' }, 'Find the smaller number.', 'למצוא את המספר הקטן יותר.', ['g1-compare']],
        ['equal', 'Equal to', 'שווה ל־', 'compare', { max: 10, focus: 'equal' }, 'Recognize amounts and expressions that are equal.', 'לזהות כמויות וביטויים שווים.', ['g1-compare']],
        ['order', 'Ordering numbers', 'סידור מספרים', 'order', { max: 20, count: 3 }, 'Put numbers in order from smallest to greatest.', 'לסדר מספרים מהקטן לגדול.', ['g1-compare']]]],
      ['oddeven', 'Odd & even', 'זוגי ואי־זוגי', [
        ['oddeven', 'Odd and even introduction', 'היכרות עם זוגי ואי־זוגי', 'oddEven', { max: 20 }, 'Tell whether a number is odd or even by making pairs.', 'לזהות אם מספר זוגי או אי־זוגי בעזרת זוגות.', ['g1-count20']]]],
      ['pv', 'Place value', 'ערך המקום', [
        ['pvintro', 'Place value introduction', 'היכרות עם ערך המקום', 'place', { kind: 'tensones', max: 20 }, 'See 11–20 as one ten and some ones.', 'לראות את 11–20 כעשרת אחת ועוד יחידות.', ['g1-count20']],
        ['tensones', 'Tens and ones', 'עשרות ויחידות', 'place', { kind: 'build', max: 99 }, 'Build and read two-digit numbers with tens and ones.', 'לבנות ולקרוא מספרים דו־ספרתיים בעשרות ויחידות.', ['g1-pvintro']]]]]],
    ['add', null, [
      ['addvis', 'Adding with objects & pictures', 'חיבור עם חפצים ותמונות', [
        ['addobj', 'Addition using objects', 'חיבור בעזרת חפצים', 'add', { max: 10, rep: 'objects' }, 'Join two groups and count them all.', 'לצרף שתי קבוצות ולספור את הכול.', ['g1-count20']],
        ['addpic', 'Addition using pictures', 'חיבור בעזרת תמונות', 'add', { max: 10, rep: 'pictures' }, 'Use pictures to solve addition.', 'לפתור חיבור בעזרת תמונות.', ['g1-addobj']],
        ['addline', 'Addition on number lines', 'חיבור על ישר המספרים', 'add', { max: 20, rep: 'numberline' }, 'Hop forward on a number line to add.', 'לקפוץ קדימה על ישר המספרים כדי לחבר.', ['g1-addobj']]]],
      ['addfacts', 'Addition facts', 'עובדות חיבור', [
        ['add5', 'Addition within 5', 'חיבור עד 5', 'add', { max: 5 }, 'Add numbers with sums up to 5.', 'לחבר מספרים עם סכום עד 5.', ['g1-addobj']],
        ['add10', 'Addition within 10', 'חיבור עד 10', 'add', { max: 10 }, 'Add numbers with sums up to 10.', 'לחבר מספרים עם סכום עד 10.', ['g1-add5']],
        ['add20', 'Addition within 20', 'חיבור עד 20', 'add', { max: 20 }, 'Add numbers with sums up to 20.', 'לחבר מספרים עם סכום עד 20.', ['g1-add10']],
        ['add100', 'Addition within 100 introduction', 'היכרות עם חיבור עד 100', 'add', { max: 100, mode: 'tens' }, 'Add tens and ones without regrouping.', 'לחבר עשרות ויחידות בלי המרה.', ['g1-add20', 'g1-tensones']]]],
      ['addapply', 'Using addition', 'שימוש בחיבור', [
        ['addmiss', 'Missing addends', 'מחובר חסר', 'add', { max: 10, mode: 'missing' }, 'Find the missing number in an addition sentence.', 'למצוא את המספר החסר בתרגיל חיבור.', ['g1-add10']],
        ['addword', 'Word problems', 'בעיות מילוליות', 'word', { ops: ['add'], max: 20 }, 'Solve addition stories.', 'לפתור סיפורי חיבור.', ['g1-add10']],
        ['addmental', 'Mental addition', 'חיבור בעל פה', 'add', { max: 20, mode: 'mental' }, 'Add quickly using doubles and making 10.', 'לחבר מהר בעזרת כפולות והשלמה ל־10.', ['g1-add20']]]]]],
    ['sub', null, [
      ['subvis', 'Subtracting with objects & pictures', 'חיסור עם חפצים ותמונות', [
        ['subobj', 'Subtraction using objects', 'חיסור בעזרת חפצים', 'sub', { max: 10, rep: 'objects' }, 'Take away objects and count what is left.', 'להוריד חפצים ולספור כמה נשארו.', ['g1-count20']],
        ['subpic', 'Subtraction using pictures', 'חיסור בעזרת תמונות', 'sub', { max: 10, rep: 'pictures' }, 'Use pictures to solve subtraction.', 'לפתור חיסור בעזרת תמונות.', ['g1-subobj']],
        ['subline', 'Number-line subtraction', 'חיסור על ישר המספרים', 'sub', { max: 20, rep: 'numberline' }, 'Hop back on a number line to subtract.', 'לקפוץ אחורה על ישר המספרים כדי לחסר.', ['g1-subobj']]]],
      ['subfacts', 'Subtraction facts', 'עובדות חיסור', [
        ['sub5', 'Subtraction within 5', 'חיסור עד 5', 'sub', { max: 5 }, 'Subtract within 5.', 'לחסר בתחום 5.', ['g1-subobj']],
        ['sub10', 'Subtraction within 10', 'חיסור עד 10', 'sub', { max: 10 }, 'Subtract within 10.', 'לחסר בתחום 10.', ['g1-sub5']],
        ['sub20', 'Subtraction within 20', 'חיסור עד 20', 'sub', { max: 20 }, 'Subtract within 20.', 'לחסר בתחום 20.', ['g1-sub10']]]],
      ['subapply', 'Using subtraction', 'שימוש בחיסור', [
        ['submiss', 'Missing numbers', 'מספרים חסרים', 'sub', { max: 10, mode: 'missing' }, 'Find the missing number in a subtraction sentence.', 'למצוא את המספר החסר בתרגיל חיסור.', ['g1-sub10']],
        ['subrel', 'Relationship between addition and subtraction', 'הקשר בין חיבור לחיסור', 'factfam', { op: 'add', max: 10 }, 'Use an addition fact to solve subtraction.', 'להשתמש בעובדת חיבור כדי לפתור חיסור.', ['g1-add10', 'g1-sub10']],
        ['subword', 'Word problems', 'בעיות מילוליות', 'word', { ops: ['sub'], max: 20 }, 'Solve take-away and difference stories.', 'לפתור סיפורים של הורדה והפרש.', ['g1-sub10']],
        ['submental', 'Mental subtraction', 'חיסור בעל פה', 'sub', { max: 20, mode: 'mental' }, 'Subtract quickly in your head.', 'לחסר מהר בראש.', ['g1-sub20']]]]]],
    ['geo', { en: 'Shapes and Geometry', he: 'צורות וגאומטריה' }, [
      ['flat', 'Flat shapes', 'צורות שטוחות', [
        ['circle', 'Circle', 'עיגול', 'shapes', { kind: 'find', target: 'circle', set: 'basic' }, 'Find circles among other shapes.', 'למצוא עיגולים בין צורות אחרות.', []],
        ['square', 'Square', 'ריבוע', 'shapes', { kind: 'find', target: 'square', set: 'basic' }, 'Find squares among other shapes.', 'למצוא ריבועים בין צורות אחרות.', []],
        ['rect', 'Rectangle', 'מלבן', 'shapes', { kind: 'find', target: 'rectangle', set: 'basic' }, 'Find rectangles among other shapes.', 'למצוא מלבנים בין צורות אחרות.', []],
        ['tri', 'Triangle', 'משולש', 'shapes', { kind: 'find', target: 'triangle', set: 'basic' }, 'Find triangles among other shapes.', 'למצוא משולשים בין צורות אחרות.', []],
        ['shapeid', 'Identify shapes', 'זיהוי צורות', 'shapes', { kind: 'name', set: 'basic' }, 'Name circles, squares, rectangles and triangles.', 'לקרוא בשם לעיגול, ריבוע, מלבן ומשולש.', ['g1-circle', 'g1-square']],
        ['shapeprops', 'Shape properties', 'תכונות של צורות', 'shapes', { kind: 'props', set: 'basic' }, 'Count the sides and corners of shapes.', 'לספור צלעות ופינות של צורות.', ['g1-shapeid']]]],
      ['space', 'Space & patterns', 'מרחב ותבניות', [
        ['spatial', 'Basic spatial reasoning', 'חשיבה מרחבית בסיסית', 'spatial', { kind: 'same' }, 'Find the shape that matches after turning.', 'למצוא את הצורה הזהה גם אחרי סיבוב.', ['g1-shapeid']],
        ['position', 'Position and direction', 'מיקום וכיוון', 'position', { kind: 'words' }, 'Use words like above, below, left and right.', 'להשתמש במילים מעל, מתחת, ימינה ושמאלה.', []],
        ['patterns', 'Patterns', 'תבניות', 'pattern', { kind: 'ab' }, 'Continue repeating patterns.', 'להמשיך תבניות חוזרות.', []]]]]],
    ['meas', null, [
      ['cmpmeas', 'Comparing', 'השוואה', [
        ['length', 'Compare length', 'השוואת אורך', 'measure', { kind: 'compare', attr: 'length' }, 'Tell which object is longer or shorter.', 'לקבוע איזה חפץ ארוך או קצר יותר.', []],
        ['height', 'Compare height', 'השוואת גובה', 'measure', { kind: 'compare', attr: 'height' }, 'Tell which object is taller or shorter.', 'לקבוע איזה חפץ גבוה או נמוך יותר.', []],
        ['weight', 'Compare weight', 'השוואת משקל', 'measure', { kind: 'compare', attr: 'weight' }, 'Use a balance to tell which is heavier.', 'להשתמש במאזניים כדי לקבוע מה כבד יותר.', []],
        ['capacity', 'Compare capacity', 'השוואת קיבולת', 'measure', { kind: 'compare', attr: 'capacity' }, 'Tell which container holds more.', 'לקבוע איזה כלי מכיל יותר.', []]]],
      ['measuring', 'Measuring', 'מדידה', [
        ['ordobj', 'Ordering objects', 'סידור חפצים', 'measure', { kind: 'order', attr: 'length' }, 'Order objects from shortest to longest.', 'לסדר חפצים מהקצר לארוך.', ['g1-length']],
        ['nonstd', 'Non-standard units', 'יחידות מידה לא תקניות', 'measure', { kind: 'nonstd' }, 'Measure length with paper clips and blocks.', 'למדוד אורך בעזרת אטבים וקוביות.', ['g1-length']]]]]],
    ['time', null, [
      ['days', 'Days & calendar', 'ימים ולוח שנה', [
        ['days', 'Days of the week', 'ימות השבוע', 'calendar', { kind: 'days' }, 'Know the order of the days of the week.', 'להכיר את סדר ימות השבוע.', []],
        ['months', 'Months', 'חודשי השנה', 'calendar', { kind: 'months' }, 'Know the order of the months.', 'להכיר את סדר החודשים.', ['g1-days']],
        ['cal', 'Calendar', 'לוח שנה', 'calendar', { kind: 'calendar' }, 'Read dates and days on a calendar.', 'לקרוא תאריכים וימים בלוח שנה.', ['g1-days']],
        ['dayparts', 'Morning and evening', 'בוקר וערב', 'calendar', { kind: 'dayparts' }, 'Match daily activities to morning, noon and evening.', 'להתאים פעולות יומיות לבוקר, צהריים וערב.', []]]],
      ['clocks', 'Clocks', 'שעונים', [
        ['hour', 'Hour introduction', 'היכרות עם השעה', 'clock', { step: 60, mode: 'read' }, 'Read the hour on an analog clock.', 'לקרוא שעה עגולה בשעון מחוגים.', []],
        ['clock', 'Reading simple clocks', 'קריאת שעון פשוט', 'clock', { step: 60, mode: 'mixed' }, 'Read and set whole hours on a clock.', 'לקרוא ולכוון שעות עגולות בשעון.', ['g1-hour']]]]]],
    ['data', null, [
      ['sorting', 'Sorting', 'מיון', [
        ['sortobj', 'Sort objects', 'מיון חפצים', 'sortcat', { kind: 'sort' }, 'Sort objects by one property.', 'למיין חפצים לפי תכונה אחת.', []],
        ['cats', 'Categories', 'קטגוריות', 'sortcat', { kind: 'categories' }, 'Find which object does not belong.', 'למצוא איזה חפץ לא שייך לקבוצה.', ['g1-sortobj']]]],
      ['graphs', 'Tables & graphs', 'טבלאות ודיאגרמות', [
        ['tables', 'Simple tables', 'טבלאות פשוטות', 'graph', { kind: 'table', max: 10 }, 'Read information from a simple table.', 'לקרוא מידע מטבלה פשוטה.', ['g1-count20']],
        ['picto', 'Picture graphs', 'דיאגרמת תמונות', 'graph', { kind: 'picto', max: 8 }, 'Read a picture graph.', 'לקרוא דיאגרמת תמונות.', ['g1-count20']],
        ['dataq', 'Answer questions using data', 'מענה על שאלות מנתונים', 'graph', { kind: 'questions', max: 10 }, 'Use data to answer most, fewest and how many more.', 'להשתמש בנתונים כדי לענות: הכי הרבה, הכי מעט וכמה יותר.', ['g1-picto']]]]]]
  ];

  G[2] = [
    ['num', null, [
      ['n1000', 'Numbers to 1,000', 'מספרים עד 1,000', [
        ['n1000', 'Numbers up to 1,000', 'מספרים עד 1,000', 'place', { kind: 'read', max: 1000 }, 'Read and write numbers up to 1,000.', 'לקרוא ולכתוב מספרים עד 1,000.', ['g1-tensones']],
        ['hto', 'Hundreds, tens, and ones', 'מאות, עשרות ויחידות', 'place', { kind: 'build', max: 999 }, 'Build numbers with hundreds, tens and ones.', 'לבנות מספרים ממאות, עשרות ויחידות.', ['g2-n1000']],
        ['pv', 'Place value', 'ערך המקום', 'place', { kind: 'digit', max: 999 }, 'Tell the value of each digit.', 'לקבוע את הערך של כל ספרה.', ['g2-hto']],
        ['decomp', 'Number decomposition', 'פירוק מספרים', 'place', { kind: 'decompose', max: 999 }, 'Break numbers into hundreds, tens and ones.', 'לפרק מספרים למאות, עשרות ויחידות.', ['g2-pv']]]],
      ['cmp', 'Comparing & ordering', 'השוואה וסידור', [
        ['compare', 'Number comparison', 'השוואת מספרים', 'compare', { max: 1000 }, 'Compare three-digit numbers.', 'להשוות מספרים תלת־ספרתיים.', ['g2-pv']],
        ['order', 'Ordering', 'סידור', 'order', { max: 1000, count: 4 }, 'Order numbers up to 1,000.', 'לסדר מספרים עד 1,000.', ['g2-compare']]]],
      ['pattern', 'Patterns & counting', 'תבניות וספירה', [
        ['numpat', 'Number patterns', 'תבניות מספרים', 'seq', { steps: [2, 5, 10, 100], dir: 0, max: 1000, mode: 'pattern' }, 'Find the rule and continue number patterns.', 'למצוא את החוקיות ולהמשיך סדרות.', ['g1-seqs']],
        ['skip', 'Skip counting', 'ספירה בדילוגים', 'seq', { steps: [2, 5, 10], dir: 1, max: 200, mode: 'skip' }, 'Count by 2s, 5s and 10s.', 'לספור בקפיצות של 2, 5 ו־10.', ['g1-seqs']],
        ['oddeven', 'Odd and even', 'זוגי ואי־זוגי', 'oddEven', { max: 100 }, 'Identify odd and even numbers up to 100.', 'לזהות מספרים זוגיים ואי־זוגיים עד 100.', ['g1-oddeven']],
        ['estimate', 'Estimation', 'אומדן', 'estimate', { kind: 'quantity', max: 100 }, 'Estimate how many and find the nearest ten.', 'לאמוד כמויות ולמצוא את העשרת הקרובה.', ['g1-count100']]]]]],
    ['add', null, [
      ['addcalc', 'Adding numbers', 'חיבור מספרים', [
        ['add100', 'Addition within 100', 'חיבור עד 100', 'add', { max: 100 }, 'Add two-digit numbers.', 'לחבר מספרים דו־ספרתיים.', ['g1-add20', 'g1-tensones']],
        ['add1000', 'Addition within 1,000', 'חיבור עד 1,000', 'add', { max: 1000 }, 'Add three-digit numbers.', 'לחבר מספרים תלת־ספרתיים.', ['g2-add100', 'g2-hto']],
        ['regroup', 'Addition with regrouping', 'חיבור עם המרה', 'add', { max: 100, mode: 'regroup' }, 'Add when ones make a new ten.', 'לחבר כשהיחידות יוצרות עשרת חדשה.', ['g2-add100']],
        ['column', 'Column addition', 'חיבור במאונך', 'column', { op: '+', digits: [3, 3] }, 'Add in columns, carrying when needed.', 'לחבר במאונך ולהעביר כשצריך.', ['g2-regroup']]]],
      ['addstrat', 'Strategies & problems', 'אסטרטגיות ובעיות', [
        ['mental', 'Mental strategies', 'אסטרטגיות בעל פה', 'add', { max: 100, mode: 'mental' }, 'Add tens and ones in your head.', 'לחבר עשרות ויחידות בראש.', ['g2-add100']],
        ['missing', 'Missing addends', 'מחובר חסר', 'add', { max: 100, mode: 'missing' }, 'Find missing addends up to 100.', 'למצוא מחובר חסר עד 100.', ['g2-add100']],
        ['multi', 'Multi-step introduction', 'היכרות עם בעיות דו־שלביות', 'word', { ops: ['add', 'sub'], max: 100, steps: 2 }, 'Solve two-step stories.', 'לפתור סיפורים בשני שלבים.', ['g2-word']],
        ['word', 'Word problems', 'בעיות מילוליות', 'word', { ops: ['add'], max: 100 }, 'Solve addition stories with bigger numbers.', 'לפתור סיפורי חיבור עם מספרים גדולים יותר.', ['g2-add100']]]]]],
    ['sub', null, [
      ['subcalc', 'Subtracting numbers', 'חיסור מספרים', [
        ['sub100', 'Subtraction within 100', 'חיסור עד 100', 'sub', { max: 100 }, 'Subtract two-digit numbers.', 'לחסר מספרים דו־ספרתיים.', ['g1-sub20', 'g1-tensones']],
        ['sub1000', 'Subtraction within 1,000', 'חיסור עד 1,000', 'sub', { max: 1000 }, 'Subtract three-digit numbers.', 'לחסר מספרים תלת־ספרתיים.', ['g2-sub100', 'g2-hto']],
        ['regroup', 'Regrouping', 'חיסור עם פריטה', 'sub', { max: 100, mode: 'regroup' }, 'Subtract by breaking a ten into ones.', 'לחסר בעזרת פריטה של עשרת ליחידות.', ['g2-sub100']],
        ['column', 'Column subtraction', 'חיסור במאונך', 'column', { op: '-', digits: [3, 3] }, 'Subtract in columns, regrouping when needed.', 'לחסר במאונך ולפרוט כשצריך.', ['g2-regroup']]]],
      ['substrat', 'Strategies & problems', 'אסטרטגיות ובעיות', [
        ['mental', 'Mental subtraction', 'חיסור בעל פה', 'sub', { max: 100, mode: 'mental' }, 'Subtract tens and ones in your head.', 'לחסר עשרות ויחידות בראש.', ['g2-sub100']],
        ['missing', 'Missing numbers', 'מספרים חסרים', 'sub', { max: 100, mode: 'missing' }, 'Find missing numbers in subtraction.', 'למצוא מספרים חסרים בחיסור.', ['g2-sub100']],
        ['word', 'Word problems', 'בעיות מילוליות', 'word', { ops: ['sub'], max: 100 }, 'Solve subtraction stories.', 'לפתור סיפורי חיסור.', ['g2-sub100']],
        ['multi', 'Multi-step introduction', 'היכרות עם בעיות דו־שלביות', 'word', { ops: ['sub', 'add'], max: 100, steps: 2 }, 'Solve two-step stories that use subtraction.', 'לפתור סיפורים דו־שלביים עם חיסור.', ['g2-word']]]]]],
    ['mul', null, [
      ['meaning', 'Meaning of multiplication', 'משמעות הכפל', [
        ['repadd', 'Multiplication as repeated addition', 'כפל כחיבור חוזר', 'mul', { rep: 'repeated', tables: [2, 3, 4, 5], max: 5 }, 'See multiplication as adding equal groups.', 'לראות כפל כחיבור של קבוצות שוות.', ['g1-add20']],
        ['arrays', 'Arrays', 'מערכים', 'mul', { rep: 'array', tables: [2, 3, 4, 5], max: 5 }, 'Build and read arrays of rows and columns.', 'לבנות ולקרוא מערכים של שורות ועמודות.', ['g2-repadd']],
        ['groups', 'Groups', 'קבוצות', 'mul', { rep: 'groups', tables: [2, 3, 4, 5], max: 5 }, 'Make equal groups and find the total.', 'ליצור קבוצות שוות ולמצוא את הסך הכול.', ['g2-repadd']],
        ['visual', 'Visual multiplication', 'כפל חזותי', 'mul', { rep: 'visual', tables: [2, 3, 4, 5, 10], max: 6 }, 'Use pictures to multiply.', 'להשתמש בתמונות כדי לכפול.', ['g2-groups']]]],
      ['facts', 'Multiplication facts', 'עובדות כפל', [
        ['x2', 'Multiplication by 2', 'כפל ב־2', 'mul', { tables: [2], max: 10 }, 'Know the 2 times table.', 'לדעת את לוח הכפל של 2.', ['g2-repadd']],
        ['x5', 'Multiplication by 5', 'כפל ב־5', 'mul', { tables: [5], max: 10 }, 'Know the 5 times table.', 'לדעת את לוח הכפל של 5.', ['g2-repadd']],
        ['x10', 'Multiplication by 10', 'כפל ב־10', 'mul', { tables: [10], max: 10 }, 'Know the 10 times table.', 'לדעת את לוח הכפל של 10.', ['g2-repadd']],
        ['basic', 'Basic multiplication tables', 'לוח הכפל הבסיסי', 'mul', { tables: [2, 3, 4, 5, 10], max: 10 }, 'Recall facts for 2, 3, 4, 5 and 10.', 'לזכור עובדות כפל של 2, 3, 4, 5 ו־10.', ['g2-x2', 'g2-x5', 'g2-x10']]]]]],
    ['div', null, [
      ['meaning', 'Meaning of division', 'משמעות החילוק', [
        ['share', 'Division as sharing', 'חילוק כחלוקה שווה', 'div', { rep: 'share', tables: [2, 3, 4, 5], max: 5 }, 'Share objects equally between friends.', 'לחלק חפצים שווה בשווה בין חברים.', ['g2-groups']],
        ['group', 'Division as grouping', 'חילוק כהכלה', 'div', { rep: 'group', tables: [2, 3, 4, 5], max: 5 }, 'Find how many equal groups can be made.', 'למצוא כמה קבוצות שוות אפשר ליצור.', ['g2-share']],
        ['equal', 'Equal groups', 'קבוצות שוות', 'div', { rep: 'equal', tables: [2, 3, 4, 5], max: 5 }, 'Tell whether groups are equal.', 'לקבוע אם הקבוצות שוות.', ['g2-share']]]],
      ['facts', 'Division facts', 'עובדות חילוק', [
        ['rel', 'Relationship between multiplication and division', 'הקשר בין כפל לחילוק', 'factfam', { op: 'mul', tables: [2, 5, 10], max: 5 }, 'Use multiplication facts to divide.', 'להשתמש בעובדות כפל כדי לחלק.', ['g2-basic', 'g2-share']],
        ['simple', 'Simple division problems', 'תרגילי חילוק פשוטים', 'div', { tables: [2, 5, 10], max: 10 }, 'Divide by 2, 5 and 10.', 'לחלק ב־2, 5 ו־10.', ['g2-rel']]]]]],
    ['frac', null, [
      ['unit', 'Halves, quarters & thirds', 'חצי, רבע ושליש', [
        ['half', 'Half', 'חצי', 'frac', { kind: 'visual', dens: [2] }, 'Recognize one half of a shape.', 'לזהות חצי של צורה.', []],
        ['quarter', 'Quarter', 'רבע', 'frac', { kind: 'visual', dens: [4] }, 'Recognize one quarter of a shape.', 'לזהות רבע של צורה.', ['g2-half']],
        ['third', 'Third introduction', 'היכרות עם שליש', 'frac', { kind: 'visual', dens: [3] }, 'Recognize one third of a shape.', 'לזהות שליש של צורה.', ['g2-half']]]],
      ['use', 'Using fractions', 'שימוש בשברים', [
        ['shapes', 'Fractions of shapes', 'שברים של צורות', 'frac', { kind: 'shade', dens: [2, 3, 4] }, 'Shade a fraction of a shape.', 'לצבוע שבר של צורה.', ['g2-quarter']],
        ['sets', 'Fractions of collections', 'שברים של כמות', 'frac', { kind: 'ofset', dens: [2, 3, 4] }, 'Find a half, third or quarter of a group.', 'למצוא חצי, שליש או רבע מקבוצה.', ['g2-half']],
        ['equalparts', 'Equal and unequal parts', 'חלקים שווים ולא שווים', 'frac', { kind: 'equalparts', dens: [2, 3, 4] }, 'Tell whether a shape is cut into equal parts.', 'לקבוע אם צורה חולקה לחלקים שווים.', []]]]]],
    ['geo', null, [
      ['shapes', 'Shapes & solids', 'צורות וגופים', [
        ['shapes2d', '2D shapes', 'צורות דו־ממדיות', 'shapes', { kind: 'name', set: 'more' }, 'Name polygons such as pentagons and hexagons.', 'לקרוא בשם למצולעים כמו מחומש ומשושה.', ['g1-shapeid']],
        ['solids', '3D shapes', 'גופים תלת־ממדיים', 'solids', { ask: 'name' }, 'Name cubes, cylinders, cones and more.', 'לקרוא בשם לקובייה, גליל, חרוט ועוד.', []],
        ['vertices', 'Vertices', 'קודקודים', 'solids', { ask: 'vertices' }, 'Count the vertices of shapes and solids.', 'לספור קודקודים של צורות וגופים.', ['g2-solids']],
        ['edges', 'Edges', 'מקצועות', 'solids', { ask: 'edges' }, 'Count the edges of solids.', 'לספור מקצועות של גופים.', ['g2-solids']],
        ['faces', 'Faces', 'פאות', 'solids', { ask: 'faces' }, 'Count the faces of solids.', 'לספור פאות של גופים.', ['g2-solids']]]],
      ['space', 'Symmetry & space', 'סימטרייה ומרחב', [
        ['symmetry', 'Symmetry introduction', 'היכרות עם סימטרייה', 'symmetry', { kind: 'is-line' }, 'Decide whether a line is a line of symmetry.', 'לקבוע אם קו הוא ציר סימטרייה.', ['g1-shapeid']],
        ['patterns', 'Patterns', 'תבניות', 'pattern', { kind: 'growing' }, 'Continue growing patterns.', 'להמשיך תבניות גדלות.', ['g1-patterns']],
        ['orient', 'Spatial orientation', 'התמצאות במרחב', 'position', { kind: 'grid' }, 'Follow directions on a grid.', 'לעקוב אחרי הוראות כיוון על רשת.', ['g1-position']]]]]],
    ['meas', null, [
      ['len', 'Length', 'אורך', [
        ['length', 'Length', 'אורך', 'ruler', { unit: 'cm', max: 12 }, 'Measure objects with a ruler.', 'למדוד חפצים בעזרת סרגל.', ['g1-nonstd']],
        ['cm', 'Centimeters', 'סנטימטרים', 'ruler', { unit: 'cm', max: 20 }, 'Measure and draw lengths in centimeters.', 'למדוד אורכים בסנטימטרים.', ['g2-length']],
        ['m', 'Meters introduction', 'היכרות עם מטרים', 'units', { kind: 'choose', dim: 'length', basic: true }, 'Choose centimeters or meters.', 'לבחור בין סנטימטרים למטרים.', ['g2-cm']]]],
      ['wc', 'Weight & capacity', 'משקל וקיבולת', [
        ['weight', 'Weight', 'משקל', 'scale', { kind: 'mass', unit: 'kg' }, 'Read a scale in kilograms.', 'לקרוא משקל בקילוגרמים.', ['g1-weight']],
        ['mass', 'Mass', 'מסה', 'units', { kind: 'choose', dim: 'mass', basic: true }, 'Choose grams or kilograms.', 'לבחור בין גרמים לקילוגרמים.', ['g2-weight']],
        ['capacity', 'Capacity', 'קיבולת', 'scale', { kind: 'capacity', unit: 'l' }, 'Read how many liters a jug holds.', 'לקרוא כמה ליטרים יש בכלי.', ['g1-capacity']],
        ['unitcmp', 'Simple unit comparison', 'השוואת יחידות פשוטה', 'units', { kind: 'compare', dim: 'all', basic: true }, 'Compare simple measurements.', 'להשוות מדידות פשוטות.', ['g2-m', 'g2-mass']]]]]],
    ['tm', null, [
      ['clock', 'Clocks & calendar', 'שעון ולוח שנה', [
        ['read', 'Read clocks', 'קריאת שעון', 'clock', { step: 15, mode: 'mixed' }, 'Read clocks to the quarter hour.', 'לקרוא שעון ברבעי שעה.', ['g1-clock']],
        ['hours', 'Hours', 'שעות', 'clock', { step: 60, mode: 'set' }, 'Set clocks to whole hours.', 'לכוון שעון לשעות עגולות.', ['g1-clock']],
        ['half', 'Half-hours', 'חצאי שעות', 'clock', { step: 30, mode: 'mixed' }, 'Read and set half-hours.', 'לקרוא ולכוון חצאי שעות.', ['g2-hours']],
        ['calendar', 'Calendar', 'לוח שנה', 'calendar', { kind: 'calendar' }, 'Use a calendar to find days and dates.', 'להשתמש בלוח שנה כדי למצוא ימים ותאריכים.', ['g1-cal']]]],
      ['money', 'Money', 'כסף', [
        ['coins', 'Coins', 'מטבעות', 'money', { kind: 'coins' }, 'Know coin values and count coins.', 'להכיר ערכי מטבעות ולספור מטבעות.', []],
        ['bills', 'Bills', 'שטרות', 'money', { kind: 'bills' }, 'Know bill values and count money.', 'להכיר ערכי שטרות ולספור כסף.', ['g2-coins']],
        ['amounts', 'Making amounts', 'הרכבת סכומים', 'money', { kind: 'make', max: 50 }, 'Make an amount with coins.', 'להרכיב סכום בעזרת מטבעות.', ['g2-coins']],
        ['change', 'Simple change', 'עודף פשוט', 'money', { kind: 'change', max: 20 }, 'Work out the change.', 'לחשב עודף.', ['g2-amounts']]]]]],
    ['datalogic', null, [
      ['data', 'Data', 'נתונים', [
        ['picto', 'Picture graphs', 'דיאגרמת תמונות', 'graph', { kind: 'picto', max: 10 }, 'Read and compare picture graphs.', 'לקרוא ולהשוות דיאגרמות תמונות.', ['g1-picto']],
        ['bar', 'Bar graphs introduction', 'היכרות עם דיאגרמת עמודות', 'graph', { kind: 'bar', max: 10 }, 'Read a simple bar graph.', 'לקרוא דיאגרמת עמודות פשוטה.', ['g2-picto']],
        ['tables', 'Tables', 'טבלאות', 'graph', { kind: 'table', max: 20 }, 'Read and use tables.', 'לקרוא טבלאות ולהשתמש בהן.', ['g1-tables']],
        ['sorting', 'Sorting', 'מיון', 'sortcat', { kind: 'sort2' }, 'Sort objects by two properties.', 'למיין חפצים לפי שתי תכונות.', ['g1-sortobj']]]],
      ['logic', 'Logic', 'היגיון', [
        ['seq', 'Logical sequences', 'סדרות הגיוניות', 'pattern', { kind: 'logic' }, 'Find the rule in a sequence.', 'למצוא את החוק בסדרה.', ['g1-patterns']],
        ['prob', 'Simple probability intuition', 'הסתברות פשוטה', 'prob', { kind: 'likely' }, 'Describe events as certain, likely, unlikely or impossible.', 'לתאר אירועים כוודאיים, סבירים, לא סבירים או בלתי אפשריים.', []]]]]]
  ];

  G[3] = [
    ['num', null, [
      ['n10000', 'Numbers to 10,000', 'מספרים עד 10,000', [
        ['n10000', 'Numbers up to 10,000', 'מספרים עד 10,000', 'place', { kind: 'read', max: 10000 }, 'Read and write four-digit numbers.', 'לקרוא ולכתוב מספרים ארבע־ספרתיים.', ['g2-n1000']],
        ['pv', 'Place value', 'ערך המקום', 'place', { kind: 'digit', max: 9999 }, 'Tell the value of digits in thousands.', 'לקבוע ערך ספרות עד האלפים.', ['g3-n10000']],
        ['decomp', 'Number decomposition', 'פירוק מספרים', 'place', { kind: 'decompose', max: 9999 }, 'Break four-digit numbers into parts.', 'לפרק מספרים ארבע־ספרתיים לחלקים.', ['g3-pv']]]],
      ['approx', 'Rounding & estimating', 'עיגול ואומדן', [
        ['round', 'Rounding introduction', 'היכרות עם עיגול מספרים', 'round', { to: [10, 100], max: 1000 }, 'Round to the nearest 10 or 100.', 'לעגל לעשרת או למאה הקרובה.', ['g3-pv']],
        ['estimate', 'Estimation', 'אומדן', 'estimate', { kind: 'sum', max: 1000 }, 'Estimate sums by rounding.', 'לאמוד סכומים בעזרת עיגול.', ['g3-round']]]],
      ['cmp', 'Comparing & patterns', 'השוואה ותבניות', [
        ['cmporder', 'Comparing and ordering', 'השוואה וסידור', 'order', { max: 10000, count: 4 }, 'Compare and order numbers up to 10,000.', 'להשוות ולסדר מספרים עד 10,000.', ['g3-pv']],
        ['numpat', 'Number patterns', 'תבניות מספרים', 'seq', { steps: [25, 50, 100, 1000], dir: 0, max: 10000, mode: 'pattern' }, 'Continue patterns with bigger steps.', 'להמשיך סדרות בקפיצות גדולות.', ['g2-numpat']],
        ['mental', 'Mental arithmetic', 'חשבון בעל פה', 'mental', { max: 1000, ops: ['+', '-'] }, 'Calculate in your head with friendly numbers.', 'לחשב בראש בעזרת מספרים נוחים.', ['g2-mental']]]]]],
    ['addsub', null, [
      ['multi', 'Multi-digit', 'רב־ספרתי', [
        ['add', 'Multi-digit addition', 'חיבור רב־ספרתי', 'add', { max: 10000 }, 'Add numbers up to 10,000.', 'לחבר מספרים עד 10,000.', ['g2-add1000']],
        ['sub', 'Multi-digit subtraction', 'חיסור רב־ספרתי', 'sub', { max: 10000 }, 'Subtract numbers up to 10,000.', 'לחסר מספרים עד 10,000.', ['g2-sub1000']],
        ['regroup', 'Regrouping', 'המרה ופריטה', 'addsub', { max: 1000, mode: 'regroup' }, 'Add and subtract with regrouping.', 'לחבר ולחסר עם המרה ופריטה.', ['g2-column']],
        ['mental', 'Mental strategies', 'אסטרטגיות בעל פה', 'addsub', { max: 1000, mode: 'mental' }, 'Use compensation and friendly numbers.', 'להשתמש באיזון ובמספרים עגולים.', ['g2-mental']]]],
      ['problems', 'Problem solving', 'פתרון בעיות', [
        ['estimate', 'Estimation', 'אומדן', 'estimate', { kind: 'mixed', max: 1000 }, 'Check answers by estimating.', 'לבדוק תשובות בעזרת אומדן.', ['g3-round']],
        ['multistep', 'Multi-step problems', 'בעיות רב־שלביות', 'word', { ops: ['add', 'sub'], max: 1000, steps: 2 }, 'Solve two-step addition and subtraction stories.', 'לפתור סיפורים דו־שלביים של חיבור וחיסור.', ['g3-word']],
        ['missing', 'Missing numbers', 'מספרים חסרים', 'addsub', { max: 1000, mode: 'missing' }, 'Find unknown numbers in equations.', 'למצוא מספרים חסרים במשוואות.', ['g3-add']],
        ['word', 'Word problems', 'בעיות מילוליות', 'word', { ops: ['add', 'sub'], max: 1000 }, 'Solve stories with three-digit numbers.', 'לפתור סיפורים עם מספרים תלת־ספרתיים.', ['g3-add', 'g3-sub']]]]]],
    ['mul', null, [
      ['tables', 'Times tables', 'לוח הכפל', [
        ['tables', 'Multiplication tables', 'לוח הכפל', 'mul', { tables: [2, 3, 4, 5, 6], max: 10 }, 'Recall facts up to the 6 times table.', 'לזכור עובדות כפל עד לוח ה־6.', ['g2-basic']],
        ['t210', 'Tables 2–10', 'לוח הכפל 2–10', 'mul', { tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], max: 10 }, 'Recall all facts from 2 to 10.', 'לזכור את כל עובדות הכפל מ־2 עד 10.', ['g3-tables']],
        ['strat', 'Multiplication strategies', 'אסטרטגיות כפל', 'mul', { mode: 'strategy', tables: [3, 4, 6, 7, 8, 9], max: 10 }, 'Use doubling and known facts to multiply.', 'להשתמש בהכפלה ובעובדות ידועות כדי לכפול.', ['g3-tables']]]],
      ['models', 'Models & problems', 'מודלים ובעיות', [
        ['arrays', 'Arrays', 'מערכים', 'mul', { rep: 'array', tables: [2, 3, 4, 5, 6, 7, 8, 9], max: 9 }, 'Use arrays for bigger facts.', 'להשתמש במערכים לעובדות גדולות.', ['g2-arrays']],
        ['area', 'Area models', 'מודל השטח', 'mul', { rep: 'area', digits: [2, 1] }, 'Split a rectangle to multiply.', 'לפצל מלבן כדי לכפול.', ['g3-arrays']],
        ['multi', 'Multi-digit multiplication introduction', 'היכרות עם כפל רב־ספרתי', 'mul', { digits: [2, 1] }, 'Multiply a two-digit number by a one-digit number.', 'לכפול מספר דו־ספרתי בחד־ספרתי.', ['g3-area']],
        ['word', 'Multiplication word problems', 'בעיות מילוליות בכפל', 'word', { ops: ['mul'], max: 100 }, 'Solve equal-group stories.', 'לפתור סיפורים של קבוצות שוות.', ['g3-tables']]]]]],
    ['div', null, [
      ['facts', 'Division facts', 'עובדות חילוק', [
        ['facts', 'Division facts', 'עובדות חילוק', 'div', { tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], max: 10 }, 'Recall division facts.', 'לזכור עובדות חילוק.', ['g3-t210']],
        ['share', 'Equal sharing', 'חלוקה שווה', 'div', { rep: 'share', tables: [2, 3, 4, 5, 6], max: 6 }, 'Share equally and find each share.', 'לחלק שווה בשווה ולמצוא כמה מקבל כל אחד.', ['g2-share']],
        ['group', 'Grouping', 'הכלה', 'div', { rep: 'group', tables: [2, 3, 4, 5, 6], max: 6 }, 'Find how many groups fit.', 'למצוא כמה קבוצות נכנסות.', ['g2-group']],
        ['rel', 'Multiplication/division relationship', 'הקשר בין כפל לחילוק', 'factfam', { op: 'mul', tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], max: 10 }, 'Write fact families.', 'לכתוב משפחות של עובדות.', ['g3-facts']]]],
      ['more', 'More division', 'עוד חילוק', [
        ['long', 'Long division introduction', 'היכרות עם חילוק ארוך', 'div', { mode: 'long', digits: [2, 1] }, 'Divide a two-digit number step by step.', 'לחלק מספר דו־ספרתי שלב אחר שלב.', ['g3-facts']],
        ['rem', 'Remainders introduction', 'היכרות עם שארית', 'div', { remainder: true, tables: [2, 3, 4, 5, 6, 7, 8, 9], max: 9 }, 'Find what is left over.', 'למצוא מה נשאר.', ['g3-facts']],
        ['word', 'Division word problems', 'בעיות מילוליות בחילוק', 'word', { ops: ['div'], max: 100 }, 'Solve sharing and grouping stories.', 'לפתור סיפורי חלוקה והכלה.', ['g3-facts']]]]]],
    ['frac', null, [
      ['parts', 'Parts of a fraction', 'חלקי השבר', [
        ['numer', 'Numerator', 'מונה', 'frac', { kind: 'parts', ask: 'numerator', dens: [2, 3, 4, 5, 6, 8] }, 'Know that the numerator counts the parts we take.', 'לדעת שהמונה סופר את החלקים שלוקחים.', ['g2-shapes']],
        ['denom', 'Denominator', 'מכנה', 'frac', { kind: 'parts', ask: 'denominator', dens: [2, 3, 4, 5, 6, 8] }, 'Know that the denominator counts the equal parts.', 'לדעת שהמכנה סופר את החלקים השווים.', ['g2-shapes']],
        ['visual', 'Visual fraction models', 'ייצוגים חזותיים של שברים', 'frac', { kind: 'visual', dens: [2, 3, 4, 5, 6, 8] }, 'Name fractions shown in pictures.', 'לקרוא שברים מתוך ציור.', ['g3-numer', 'g3-denom']]]],
      ['cmp', 'Comparing fractions', 'השוואת שברים', [
        ['equiv', 'Equivalent fractions introduction', 'היכרות עם שברים שקולים', 'fracequiv', { kind: 'equiv', dens: [2, 3, 4, 6, 8] }, 'Find fractions that show the same amount.', 'למצוא שברים שמראים אותה כמות.', ['g3-visual']],
        ['compare', 'Compare simple fractions', 'השוואת שברים פשוטים', 'fraccmp', { kind: 'same-den', dens: [2, 3, 4, 5, 6, 8] }, 'Compare fractions with the same denominator or numerator.', 'להשוות שברים עם מכנה או מונה שווים.', ['g3-visual']],
        ['line', 'Fractions on number lines', 'שברים על ישר המספרים', 'fracline', { dens: [2, 3, 4, 6, 8], max: 1 }, 'Place fractions on a number line.', 'למקם שברים על ישר המספרים.', ['g3-visual']]]],
      ['use', 'Using fractions', 'שימוש בשברים', [
        ['qty', 'Fractions of quantities', 'שבר מכמות', 'fracqty', { dens: [2, 3, 4, 5, 10], max: 40, unit: true }, 'Find a unit fraction of a number.', 'למצוא שבר יסודי של מספר.', ['g2-sets']],
        ['add', 'Addition of simple fractions with equal denominators', 'חיבור שברים בעלי מכנה שווה', 'fracop', { op: '+', dens: [3, 4, 5, 6, 8, 10], maxWhole: 1 }, 'Add fractions with the same denominator.', 'לחבר שברים עם אותו מכנה.', ['g3-visual']]]]]],
    ['geo', null, [
      ['angles', 'Angles & lines', 'זוויות וקווים', [
        ['angles', 'Angles introduction', 'היכרות עם זוויות', 'angles', { kind: 'compare' }, 'Compare the size of angles.', 'להשוות גודל של זוויות.', []],
        ['right', 'Right angles', 'זוויות ישרות', 'angles', { kind: 'right' }, 'Find right angles.', 'למצוא זוויות ישרות.', ['g3-angles']],
        ['lines', 'Lines', 'קווים', 'lines', { kind: 'identify' }, 'Tell lines, rays and line segments apart.', 'להבחין בין ישר, קרן וקטע.', []],
        ['parallel', 'Parallel lines', 'ישרים מקבילים', 'lines', { kind: 'parallel' }, 'Recognize parallel lines.', 'לזהות ישרים מקבילים.', ['g3-lines']],
        ['perp', 'Perpendicular lines', 'ישרים מאונכים', 'lines', { kind: 'perp' }, 'Recognize perpendicular lines.', 'לזהות ישרים מאונכים.', ['g3-lines', 'g3-right']]]],
      ['polys', 'Polygons', 'מצולעים', [
        ['polygons', 'Polygons', 'מצולעים', 'shapes', { kind: 'polygon', set: 'all' }, 'Name polygons by their sides.', 'לקרוא בשם למצולעים לפי מספר הצלעות.', ['g2-shapes2d']],
        ['quads', 'Quadrilaterals', 'מרובעים', 'shapes', { kind: 'quad' }, 'Name squares, rectangles, rhombuses and trapezoids.', 'לזהות ריבוע, מלבן, מעוין וטרפז.', ['g3-polygons']],
        ['tris', 'Triangles', 'משולשים', 'shapes', { kind: 'triangle', by: 'sides' }, 'Classify triangles by their sides.', 'למיין משולשים לפי הצלעות.', ['g3-polygons']]]],
      ['measure', 'Perimeter, area & symmetry', 'היקף, שטח וסימטרייה', [
        ['perimeter', 'Perimeter', 'היקף', 'perimeter', { kind: 'grid', max: 24 }, 'Find the distance around a shape.', 'למצוא את המרחק מסביב לצורה.', ['g3-polygons']],
        ['area', 'Area introduction', 'היכרות עם שטח', 'area', { kind: 'count', max: 24 }, 'Find area by counting squares.', 'למצוא שטח בעזרת ספירת משבצות.', ['g3-arrays']],
        ['symmetry', 'Symmetry', 'סימטרייה', 'symmetry', { kind: 'complete' }, 'Complete a symmetric picture.', 'להשלים ציור סימטרי.', ['g2-symmetry']]]]]],
    ['meas', null, [
      ['len', 'Length units', 'יחידות אורך', [
        ['units', 'Units', 'יחידות מידה', 'units', { kind: 'choose', dim: 'all' }, 'Choose a sensible unit.', 'לבחור יחידת מידה מתאימה.', ['g2-m']],
        ['length', 'Length', 'אורך', 'units', { kind: 'compare', dim: 'length' }, 'Compare lengths in different units.', 'להשוות אורכים ביחידות שונות.', ['g3-units']],
        ['cm', 'Centimeters', 'סנטימטרים', 'ruler', { unit: 'cm', max: 25 }, 'Measure accurately in centimeters.', 'למדוד בדיוק בסנטימטרים.', ['g2-cm']],
        ['m', 'Meters', 'מטרים', 'units', { kind: 'convert', dim: 'length', pairs: ['m-cm'] }, 'Convert meters and centimeters.', 'להמיר מטרים וסנטימטרים.', ['g3-units']],
        ['km', 'Kilometers introduction', 'היכרות עם קילומטרים', 'units', { kind: 'convert', dim: 'length', pairs: ['km-m'] }, 'Know that 1 km is 1,000 m.', 'לדעת שק״מ אחד הוא 1,000 מ׳.', ['g3-m']]]],
      ['mv', 'Mass, volume & temperature', 'מסה, נפח וטמפרטורה', [
        ['mass', 'Mass', 'מסה', 'scale', { kind: 'mass', unit: 'g' }, 'Read scales in grams.', 'לקרוא משקל בגרמים.', ['g2-weight']],
        ['volume', 'Volume', 'נפח', 'scale', { kind: 'capacity', unit: 'ml' }, 'Read measuring jugs in milliliters.', 'לקרוא כלי מדידה במיליליטרים.', ['g2-capacity']],
        ['temp', 'Temperature', 'טמפרטורה', 'scale', { kind: 'temp' }, 'Read a thermometer.', 'לקרוא מדחום.', []],
        ['convert', 'Conversion introduction', 'היכרות עם המרת יחידות', 'units', { kind: 'convert', dim: 'all', basic: true }, 'Convert between simple units.', 'להמיר בין יחידות פשוטות.', ['g3-m']]]]]],
    ['time', null, [
      ['clock', 'Clocks', 'שעונים', [
        ['read', 'Read clocks', 'קריאת שעון', 'clock', { step: 5, mode: 'mixed' }, 'Read clocks to 5 minutes.', 'לקרוא שעון ברמת 5 דקות.', ['g2-read']],
        ['minutes', 'Minutes', 'דקות', 'clock', { step: 1, mode: 'read' }, 'Read clocks to the minute.', 'לקרוא שעון ברמת דקה.', ['g3-read']],
        ['hours', 'Hours', 'שעות', 'clock', { step: 5, mode: 'set' }, 'Set clocks to the exact time.', 'לכוון שעון לשעה מדויקת.', ['g3-read']]]],
      ['duration', 'Durations', 'משכי זמן', [
        ['elapsed', 'Elapsed time', 'משך זמן', 'elapsed', { kind: 'elapsed', step: 15 }, 'Find how much time has passed.', 'למצוא כמה זמן עבר.', ['g3-read']],
        ['intervals', 'Time intervals', 'פרקי זמן', 'elapsed', { kind: 'interval', step: 5 }, 'Find start and end times.', 'למצוא שעת התחלה וסיום.', ['g3-elapsed']],
        ['calcalc', 'Calendar calculations', 'חישובים בלוח השנה', 'calendar', { kind: 'calc' }, 'Count days and weeks on a calendar.', 'לספור ימים ושבועות בלוח השנה.', ['g2-calendar']]]]]],
    ['data', null, [
      ['read', 'Reading data', 'קריאת נתונים', [
        ['tables', 'Tables', 'טבלאות', 'graph', { kind: 'table', max: 50 }, 'Read tables with larger numbers.', 'לקרוא טבלאות עם מספרים גדולים יותר.', ['g2-tables']],
        ['bar', 'Bar graphs', 'דיאגרמות עמודות', 'graph', { kind: 'bar', max: 20, scale: 2 }, 'Read bar graphs with a scale of 2.', 'לקרוא דיאגרמת עמודות עם קנה מידה 2.', ['g2-bar']],
        ['picto', 'Pictographs', 'דיאגרמות תמונות', 'graph', { kind: 'picto', max: 20, scale: 2 }, 'Read pictographs where one picture stands for 2.', 'לקרוא דיאגרמות שבהן כל תמונה שווה 2.', ['g2-picto']],
        ['charts', 'Simple charts', 'תרשימים פשוטים', 'graph', { kind: 'tally', max: 20 }, 'Read tally charts.', 'לקרוא טבלאות סימון.', ['g3-tables']]]],
      ['use', 'Using data', 'שימוש בנתונים', [
        ['interpret', 'Interpret data', 'פירוש נתונים', 'graph', { kind: 'questions', max: 30 }, 'Answer questions about graphs.', 'לענות על שאלות על דיאגרמות.', ['g3-bar']],
        ['compare', 'Compare datasets', 'השוואת נתונים', 'graph', { kind: 'compare', max: 20 }, 'Compare two sets of data.', 'להשוות שתי קבוצות נתונים.', ['g3-interpret']],
        ['solve', 'Solve problems using data', 'פתרון בעיות בעזרת נתונים', 'graph', { kind: 'multistep', max: 30 }, 'Use data to solve two-step problems.', 'להשתמש בנתונים לפתרון בעיות דו־שלביות.', ['g3-interpret']]]]]],
    ['logic', null, [
      ['reasoning', 'Reasoning', 'חשיבה', [
        ['multistep', 'Multi-step problems', 'בעיות רב־שלביות', 'word', { ops: ['add', 'sub', 'mul'], max: 200, steps: 2 }, 'Plan and solve multi-step problems.', 'לתכנן ולפתור בעיות רב־שלביות.', ['g3-word']],
        ['deduce', 'Logical deduction', 'הסקה לוגית', 'logic', { kind: 'riddle', max: 100 }, 'Use clues to find a mystery number.', 'להשתמש ברמזים כדי למצוא מספר סודי.', []],
        ['patterns', 'Patterns', 'תבניות', 'pattern', { kind: 'number' }, 'Find the rule of number patterns.', 'למצוא את החוק של סדרות מספרים.', ['g2-numpat']],
        ['spatial', 'Spatial puzzles', 'חידות מרחביות', 'spatial', { kind: 'cubes' }, 'Count cubes in a stack.', 'לספור קוביות במגדל.', []],
        ['reasoning', 'Mathematical reasoning', 'חשיבה מתמטית', 'logic', { kind: 'truefalse', max: 100 }, 'Decide whether math statements are true.', 'לקבוע אם טענות מתמטיות נכונות.', []]]]]]
  ];

  G[4] = [
    ['num', null, [
      ['big', 'Big numbers', 'מספרים גדולים', [
        ['n100k', 'Numbers up to 100,000 and beyond', 'מספרים עד 100,000 ויותר', 'place', { kind: 'read', max: 1000000 }, 'Read and write numbers to a million.', 'לקרוא ולכתוב מספרים עד מיליון.', ['g3-n10000']],
        ['pv', 'Place value', 'ערך המקום', 'place', { kind: 'digit', max: 999999 }, 'Tell the value of digits up to hundred-thousands.', 'לקבוע ערך ספרות עד מאות האלפים.', ['g4-n100k']],
        ['expanded', 'Expanded notation', 'כתיבה מורחבת', 'place', { kind: 'expanded', max: 999999 }, 'Write numbers in expanded form.', 'לכתוב מספרים בצורה מורחבת.', ['g4-pv']]]],
      ['cmp', 'Comparing & ordering', 'השוואה וסידור', [
        ['compare', 'Number comparison', 'השוואת מספרים', 'compare', { max: 1000000 }, 'Compare large numbers.', 'להשוות מספרים גדולים.', ['g4-pv']],
        ['order', 'Ordering', 'סידור', 'order', { max: 1000000, count: 4 }, 'Order large numbers.', 'לסדר מספרים גדולים.', ['g4-compare']]]],
      ['approx', 'Rounding & estimation', 'עיגול ואומדן', [
        ['round', 'Rounding', 'עיגול מספרים', 'round', { to: [10, 100, 1000, 10000], max: 100000 }, 'Round to any place.', 'לעגל לכל מקום.', ['g3-round']],
        ['estimate', 'Estimation', 'אומדן', 'estimate', { kind: 'mixed', max: 10000 }, 'Estimate sums, differences and products.', 'לאמוד סכומים, הפרשים ומכפלות.', ['g4-round']]]],
      ['pm', 'Patterns & mental math', 'תבניות וחשבון בעל פה', [
        ['numpat', 'Number patterns', 'תבניות מספרים', 'seq', { steps: [25, 250, 500, 1000, 5000], dir: 0, max: 100000, mode: 'pattern', mult: true }, 'Find rules with big steps or doubling.', 'למצוא חוקים בקפיצות גדולות או בהכפלה.', ['g3-numpat']],
        ['mental', 'Mental arithmetic', 'חשבון בעל פה', 'mental', { max: 10000, ops: ['+', '-', '×', '÷'] }, 'Use all four operations mentally.', 'להשתמש בארבע פעולות החשבון בעל פה.', ['g3-mental']]]]]],
    ['addsub', null, [
      ['large', 'Large numbers', 'מספרים גדולים', [
        ['large', 'Large numbers', 'מספרים גדולים', 'addsub', { max: 1000000, mode: 'mixed' }, 'Add and subtract numbers up to a million.', 'לחבר ולחסר מספרים עד מיליון.', ['g3-add', 'g3-sub']],
        ['multi', 'Multiple-digit calculations', 'חישובים רב־ספרתיים', 'column', { op: 'mix', digits: [4, 4] }, 'Calculate in columns with many digits.', 'לחשב במאונך עם מספרים רב־ספרתיים.', ['g3-regroup']],
        ['regroup', 'Regrouping', 'המרה ופריטה', 'addsub', { max: 100000, mode: 'regroup' }, 'Regroup across several places.', 'להמיר ולפרוט בכמה מקומות.', ['g3-regroup']]]],
      ['strat', 'Strategies & problems', 'אסטרטגיות ובעיות', [
        ['mental', 'Mental arithmetic', 'חשבון בעל פה', 'addsub', { max: 10000, mode: 'mental' }, 'Add and subtract mentally with round numbers.', 'לחבר ולחסר בראש עם מספרים עגולים.', ['g3-mental']],
        ['estimate', 'Estimation', 'אומדן', 'estimate', { kind: 'sum', max: 100000 }, 'Estimate big sums and differences.', 'לאמוד סכומים והפרשים גדולים.', ['g4-round']],
        ['word', 'Multi-step word problems', 'בעיות מילוליות רב־שלביות', 'word', { ops: ['add', 'sub'], max: 10000, steps: 2 }, 'Solve multi-step stories.', 'לפתור סיפורים רב־שלביים.', ['g3-multistep']]]]]],
    ['mul', null, [
      ['facts', 'Facts & strategies', 'עובדות ואסטרטגיות', [
        ['mastery', 'Multiplication tables mastery', 'שליטה בלוח הכפל', 'mul', { tables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], max: 12 }, 'Know all facts up to 12 × 12.', 'לדעת את כל העובדות עד 12 × 12.', ['g3-t210']],
        ['strat', 'Multiplication strategies', 'אסטרטגיות כפל', 'mul', { mode: 'strategy', tables: [6, 7, 8, 9, 11, 12], max: 12 }, 'Choose smart strategies for hard facts.', 'לבחור אסטרטגיות חכמות לעובדות קשות.', ['g3-strat']]]],
      ['multi', 'Multi-digit multiplication', 'כפל רב־ספרתי', [
        ['multi', 'Multi-digit multiplication', 'כפל רב־ספרתי', 'mul', { digits: [3, 1] }, 'Multiply 3-digit by 1-digit and 2-digit by 2-digit numbers.', 'לכפול תלת־ספרתי בחד־ספרתי ודו־ספרתי בדו־ספרתי.', ['g3-multi']],
        ['area', 'Area models', 'מודל השטח', 'mul', { rep: 'area', digits: [2, 2] }, 'Use area models for 2-digit by 2-digit.', 'להשתמש במודל השטח לכפל דו־ספרתי בדו־ספרתי.', ['g3-area']],
        ['distrib', 'Distributive thinking', 'חוק הפילוג', 'distrib', { max: 20 }, 'Split a factor to multiply easily.', 'לפרק גורם כדי לכפול בקלות.', ['g4-area']],
        ['word', 'Word problems', 'בעיות מילוליות', 'word', { ops: ['mul'], max: 1000 }, 'Solve multiplication stories.', 'לפתור סיפורי כפל.', ['g4-multi']]]]]],
    ['div', null, [
      ['long', 'Long division', 'חילוק ארוך', [
        ['multi', 'Multi-digit division', 'חילוק רב־ספרתי', 'div', { mode: 'long', digits: [3, 1] }, 'Divide 3-digit numbers by 1-digit numbers.', 'לחלק מספר תלת־ספרתי בחד־ספרתי.', ['g3-long']],
        ['quot', 'Quotients', 'מנה', 'div', { mode: 'quotient', digits: [2, 1] }, 'Find quotients of two-digit numbers.', 'למצוא מנה של מספרים דו־ספרתיים.', ['g3-facts']],
        ['rem', 'Remainders', 'שארית', 'div', { remainder: true, digits: [2, 1] }, 'Divide with remainders.', 'לחלק עם שארית.', ['g3-rem']]]],
      ['strat', 'Strategies & problems', 'אסטרטגיות ובעיות', [
        ['strat', 'Division strategies', 'אסטרטגיות חילוק', 'div', { mode: 'strategy', digits: [3, 1] }, 'Split the dividend into friendly parts.', 'לפרק את המחולק לחלקים נוחים.', ['g4-quot']],
        ['estimate', 'Estimation', 'אומדן', 'estimate', { kind: 'quotient', max: 1000 }, 'Estimate quotients.', 'לאמוד מנות.', ['g4-quot']],
        ['word', 'Word problems', 'בעיות מילוליות', 'word', { ops: ['div'], max: 1000 }, 'Solve division stories.', 'לפתור סיפורי חילוק.', ['g4-quot']],
        ['multistep', 'Multi-step calculations', 'חישובים רב־שלביים', 'word', { ops: ['mul', 'div', 'add', 'sub'], max: 1000, steps: 2 }, 'Combine operations to solve problems.', 'לשלב פעולות כדי לפתור בעיות.', ['g4-word']]]]]],
    ['frac', null, [
      ['equiv', 'Equivalence', 'שקילות', [
        ['equiv', 'Equivalent fractions', 'שברים שקולים', 'fracequiv', { kind: 'equiv', dens: [2, 3, 4, 5, 6, 8, 10, 12] }, 'Make equivalent fractions.', 'ליצור שברים שקולים.', ['g3-equiv']],
        ['simplify', 'Simplifying fractions introduction', 'היכרות עם צמצום שברים', 'fracequiv', { kind: 'simplify', dens: [4, 6, 8, 10, 12] }, 'Write a fraction in simplest form.', 'לצמצם שבר לצורה הפשוטה ביותר.', ['g4-equiv']]]],
      ['cmp', 'Comparing & ordering', 'השוואה וסידור', [
        ['compare', 'Comparing fractions', 'השוואת שברים', 'fraccmp', { kind: 'unlike', dens: [2, 3, 4, 5, 6, 8, 10, 12] }, 'Compare fractions with different denominators.', 'להשוות שברים עם מכנים שונים.', ['g4-equiv']],
        ['order', 'Ordering fractions', 'סידור שברים', 'fraccmp', { kind: 'order', dens: [2, 3, 4, 6, 8, 12] }, 'Order several fractions.', 'לסדר כמה שברים.', ['g4-compare']],
        ['line', 'Fractions on number lines', 'שברים על ישר המספרים', 'fracline', { dens: [2, 3, 4, 5, 6, 8, 10], max: 2 }, 'Place fractions between 0 and 2.', 'למקם שברים בין 0 ל־2.', ['g3-line']]]],
      ['mixed', 'Mixed & improper', 'מעורבים ומדומים', [
        ['mixed', 'Mixed numbers introduction', 'היכרות עם מספרים מעורבים', 'mixed', { kind: 'picture', dens: [2, 3, 4, 5, 6, 8] }, 'Read mixed numbers from pictures.', 'לקרוא מספרים מעורבים מציור.', ['g4-line']],
        ['improper', 'Improper fractions introduction', 'היכרות עם שברים מדומים', 'mixed', { kind: 'toImproper', dens: [2, 3, 4, 5, 6, 8] }, 'Convert mixed numbers and improper fractions.', 'להמיר בין מספר מעורב לשבר מדומה.', ['g4-mixed']]]],
      ['ops', 'Fraction operations', 'פעולות בשברים', [
        ['add', 'Fraction addition', 'חיבור שברים', 'fracop', { op: '+', dens: [3, 4, 5, 6, 8, 10, 12], maxWhole: 3 }, 'Add fractions and mixed numbers with like denominators.', 'לחבר שברים ומספרים מעורבים עם מכנה שווה.', ['g3-add']],
        ['sub', 'Fraction subtraction', 'חיסור שברים', 'fracop', { op: '-', dens: [3, 4, 5, 6, 8, 10, 12], maxWhole: 3 }, 'Subtract fractions with like denominators.', 'לחסר שברים עם מכנה שווה.', ['g4-add']],
        ['qty', 'Fractions of quantities', 'שבר מכמות', 'fracqty', { dens: [2, 3, 4, 5, 6, 8, 10], max: 100 }, 'Find any fraction of a number.', 'למצוא כל שבר של מספר.', ['g3-qty']],
        ['visual', 'Visual models', 'ייצוגים חזותיים', 'frac', { kind: 'visual', dens: [2, 3, 4, 5, 6, 8, 10, 12] }, 'Use pictures to show fractions.', 'להשתמש בציורים כדי להראות שברים.', ['g3-visual']]]]]],
    ['dec', null, [
      ['basics', 'Decimal basics', 'יסודות העשרוניים', [
        ['tenths', 'Tenths', 'עשיריות', 'decimal', { kind: 'tenths' }, 'Read and write tenths.', 'לקרוא ולכתוב עשיריות.', ['g4-equiv']],
        ['hundredths', 'Hundredths introduction', 'היכרות עם מאיות', 'decimal', { kind: 'hundredths' }, 'Read and write hundredths.', 'לקרוא ולכתוב מאיות.', ['g4-tenths']],
        ['represent', 'Decimal representation', 'ייצוג עשרוני', 'decimal', { kind: 'represent' }, 'Show decimals with grids and place value.', 'להציג עשרוניים ברשת ובערך המקום.', ['g4-tenths']],
        ['line', 'Decimal number lines', 'עשרוניים על ישר המספרים', 'decimal', { kind: 'line' }, 'Place decimals on a number line.', 'למקם עשרוניים על ישר המספרים.', ['g4-tenths']]]],
      ['use', 'Using decimals', 'שימוש בעשרוניים', [
        ['compare', 'Comparing decimals', 'השוואת עשרוניים', 'decimal', { kind: 'compare' }, 'Compare decimals.', 'להשוות מספרים עשרוניים.', ['g4-hundredths']],
        ['fracdec', 'Relationship between fractions and decimals', 'הקשר בין שברים לעשרוניים', 'decimal', { kind: 'fracdec' }, 'Change tenths and hundredths between forms.', 'להמיר עשיריות ומאיות בין שבר לעשרוני.', ['g4-hundredths']],
        ['money', 'Money and decimals', 'כסף ועשרוניים', 'decimal', { kind: 'money' }, 'Use decimals with money.', 'להשתמש בעשרוניים בכסף.', ['g4-hundredths']]]]]],
    ['geo', null, [
      ['angles', 'Angles', 'זוויות', [
        ['angles', 'Angles', 'זוויות', 'angles', { kind: 'classify' }, 'Name angle types.', 'לקרוא בשם לסוגי זוויות.', ['g3-right']],
        ['measure', 'Angle measurement', 'מדידת זוויות', 'angles', { kind: 'measure' }, 'Measure angles with a protractor.', 'למדוד זוויות במד־זווית.', ['g4-angles']],
        ['degrees', 'Degrees', 'מעלות', 'angles', { kind: 'degrees' }, 'Know right and straight angles in degrees.', 'לדעת זווית ישרה ושטוחה במעלות.', ['g4-measure']],
        ['acute', 'Acute angles', 'זוויות חדות', 'angles', { kind: 'classify', focus: 'acute' }, 'Recognize angles smaller than a right angle.', 'לזהות זוויות קטנות מזווית ישרה.', ['g4-angles']],
        ['right', 'Right angles', 'זוויות ישרות', 'angles', { kind: 'classify', focus: 'right' }, 'Recognize 90° angles.', 'לזהות זוויות של 90°.', ['g4-angles']],
        ['obtuse', 'Obtuse angles', 'זוויות קהות', 'angles', { kind: 'classify', focus: 'obtuse' }, 'Recognize angles bigger than a right angle.', 'לזהות זוויות גדולות מזווית ישרה.', ['g4-angles']]]],
      ['lines', 'Lines', 'קווים', [
        ['lines', 'Lines', 'קווים', 'lines', { kind: 'identify' }, 'Name lines, rays and segments.', 'לקרוא בשם לישר, קרן וקטע.', ['g3-lines']],
        ['parperp', 'Parallel and perpendicular lines', 'ישרים מקבילים ומאונכים', 'lines', { kind: 'mixed' }, 'Tell parallel and perpendicular lines apart.', 'להבחין בין ישרים מקבילים למאונכים.', ['g3-parallel', 'g3-perp']]]],
      ['shapes', 'Shapes', 'צורות', [
        ['polygons', 'Polygons', 'מצולעים', 'shapes', { kind: 'polygon', set: 'all' }, 'Name and describe polygons.', 'לקרוא בשם למצולעים ולתאר אותם.', ['g3-polygons']],
        ['tris', 'Triangles', 'משולשים', 'shapes', { kind: 'triangle', by: 'both' }, 'Classify triangles by sides and angles.', 'למיין משולשים לפי צלעות וזוויות.', ['g3-tris']],
        ['quads', 'Quadrilaterals', 'מרובעים', 'shapes', { kind: 'quad', advanced: true }, 'Classify quadrilaterals by their properties.', 'למיין מרובעים לפי תכונותיהם.', ['g3-quads']],
        ['symmetry', 'Symmetry', 'סימטרייה', 'symmetry', { kind: 'count-lines' }, 'Count lines of symmetry.', 'לספור צירי סימטרייה.', ['g3-symmetry']],
        ['classify', 'Shape classification', 'מיון צורות', 'shapes', { kind: 'classify' }, 'Sort shapes by their properties.', 'למיין צורות לפי תכונות.', ['g4-quads']]]],
      ['ap', 'Area & perimeter', 'שטח והיקף', [
        ['area', 'Area', 'שטח', 'area', { kind: 'rect', max: 144 }, 'Find areas of rectangles and composite shapes.', 'למצוא שטח של מלבנים וצורות מורכבות.', ['g3-area']],
        ['perimeter', 'Perimeter', 'היקף', 'perimeter', { kind: 'missing', max: 100 }, 'Find perimeters and missing sides.', 'למצוא היקף וצלעות חסרות.', ['g3-perimeter']]]]]],
    ['meas', null, [
      ['quant', 'Quantities', 'כמויות', [
        ['length', 'Length', 'אורך', 'units', { kind: 'convert', dim: 'length' }, 'Convert km, m, cm and mm.', 'להמיר ק״מ, מ׳, ס״מ ומ״מ.', ['g3-km']],
        ['mass', 'Mass', 'מסה', 'units', { kind: 'convert', dim: 'mass' }, 'Convert kilograms and grams.', 'להמיר קילוגרמים וגרמים.', ['g3-mass']],
        ['volume', 'Volume', 'נפח', 'units', { kind: 'convert', dim: 'volume' }, 'Convert liters and milliliters.', 'להמיר ליטרים ומיליליטרים.', ['g3-volume']],
        ['time', 'Time', 'זמן', 'units', { kind: 'convert', dim: 'time' }, 'Convert hours, minutes and seconds.', 'להמיר שעות, דקות ושניות.', ['g3-elapsed']]]],
      ['units', 'Units & conversion', 'יחידות והמרה', [
        ['units', 'Units', 'יחידות מידה', 'units', { kind: 'choose', dim: 'all' }, 'Pick the best unit for a measurement.', 'לבחור את היחידה המתאימה ביותר.', ['g3-units']],
        ['conversion', 'Unit conversion', 'המרת יחידות', 'units', { kind: 'convert', dim: 'all' }, 'Convert between units of all kinds.', 'להמיר בין יחידות מכל הסוגים.', ['g4-length', 'g4-mass']]]],
      ['apply', 'Applying measurement', 'יישום מדידות', [
        ['problems', 'Measurement problems', 'בעיות מדידה', 'word', { ops: ['add', 'sub', 'mul'], max: 1000, theme: 'measure' }, 'Solve stories with measurements.', 'לפתור סיפורים עם מדידות.', ['g4-conversion']],
        ['areaper', 'Area and perimeter', 'שטח והיקף', 'area', { kind: 'both', max: 100 }, 'Choose area or perimeter to solve problems.', 'לבחור בין שטח להיקף כדי לפתור בעיות.', ['g4-geo-area', 'g4-perimeter']],
        ['real', 'Real-life applications', 'יישומים בחיי היום־יום', 'word', { ops: ['add', 'sub', 'mul', 'div'], max: 1000, theme: 'real' }, 'Use measurement in everyday situations.', 'להשתמש במדידות במצבים יומיומיים.', ['g4-problems']]]]]],
    ['data', null, [
      ['graphs', 'Graphs', 'דיאגרמות', [
        ['tables', 'Tables', 'טבלאות', 'graph', { kind: 'table', max: 200 }, 'Read tables with several columns.', 'לקרוא טבלאות עם כמה עמודות.', ['g3-tables']],
        ['bar', 'Bar charts', 'דיאגרמות עמודות', 'graph', { kind: 'bar', max: 100, scale: 10 }, 'Read bar charts with scales of 5 and 10.', 'לקרוא דיאגרמות עמודות עם קנה מידה 5 ו־10.', ['g3-bar']],
        ['line', 'Line graphs introduction', 'היכרות עם גרף קווי', 'graph', { kind: 'line', max: 30 }, 'Read values and changes on a line graph.', 'לקרוא ערכים ושינויים בגרף קווי.', ['g4-bar']]]],
      ['analysis', 'Analysis', 'ניתוח', [
        ['interpret', 'Data interpretation', 'פירוש נתונים', 'graph', { kind: 'questions', max: 100 }, 'Draw conclusions from data.', 'להסיק מסקנות מנתונים.', ['g3-interpret']],
        ['compare', 'Data comparisons', 'השוואת נתונים', 'graph', { kind: 'compare', max: 100 }, 'Compare data sets and totals.', 'להשוות קבוצות נתונים וסכומים.', ['g4-interpret']],
        ['multistep', 'Multi-step questions', 'שאלות רב־שלביות', 'graph', { kind: 'multistep', max: 100 }, 'Answer multi-step questions about data.', 'לענות על שאלות רב־שלביות על נתונים.', ['g4-interpret']]]]]],
    ['logic', { en: 'Advanced Problem Solving', he: 'פתרון בעיות מתקדם' }, [
      ['problems', 'Problems & puzzles', 'בעיות וחידות', [
        ['multistep', 'Multi-step problems', 'בעיות רב־שלביות', 'word', { ops: ['add', 'sub', 'mul', 'div'], max: 1000, steps: 2 }, 'Solve challenging multi-step problems.', 'לפתור בעיות רב־שלביות מאתגרות.', ['g3-multistep']],
        ['puzzles', 'Logic puzzles', 'חידות היגיון', 'logic', { kind: 'symbols', max: 50 }, 'Solve symbol puzzles.', 'לפתור חידות סמלים.', ['g3-deduce']],
        ['reasoning', 'Mathematical reasoning', 'חשיבה מתמטית', 'logic', { kind: 'truefalse', max: 1000 }, 'Check and explain math statements.', 'לבדוק ולהסביר טענות מתמטיות.', ['g3-reasoning']]]],
      ['strategy', 'Patterns & strategy', 'תבניות ואסטרטגיה', [
        ['patterns', 'Pattern recognition', 'זיהוי תבניות', 'pattern', { kind: 'number', hard: true }, 'Find rules in complex patterns.', 'למצוא חוקים בתבניות מורכבות.', ['g3-patterns']],
        ['strategy', 'Strategy problems', 'בעיות אסטרטגיה', 'logic', { kind: 'strategy', max: 100 }, 'Work systematically to find all possibilities.', 'לעבוד באופן שיטתי כדי למצוא את כל האפשרויות.', ['g3-deduce']],
        ['real', 'Real-world math', 'מתמטיקה בחיי היום־יום', 'word', { ops: ['add', 'sub', 'mul', 'div'], max: 1000, theme: 'money' }, 'Plan budgets and solve real-life problems.', 'לתכנן תקציב ולפתור בעיות מהחיים.', ['g4-multistep']]]]]]
  ];

  G[5] = [
    ['num', null, [
      ['divis', 'Divisibility', 'התחלקות', [
        ['rules', 'Divisibility rules', 'סימני התחלקות', 'divis', { kind: 'rules' }, 'Use the divisibility rules for 2, 3, 4, 5, 6, 9 and 10.', 'להשתמש בסימני ההתחלקות ב־2, 3, 4, 5, 6, 9 ו־10.', ['g4-mastery']],
        ['factors', 'Factors', 'מחלקים', 'divis', { kind: 'factors' }, 'Find the factors of a number.', 'למצוא את המחלקים של מספר.', ['g5-rules']],
        ['multiples', 'Multiples', 'כפולות', 'divis', { kind: 'multiples' }, 'Recognize multiples of a number.', 'לזהות כפולות של מספר.', ['g4-mastery']],
        ['prime', 'Prime and composite numbers', 'מספרים ראשוניים ופריקים', 'divis', { kind: 'prime' }, 'Tell prime numbers from composite numbers.', 'להבחין בין מספרים ראשוניים למספרים פריקים.', ['g5-factors']]]],
      ['ops', 'Order of operations', 'סדר פעולות החשבון', [
        ['order', 'Order of operations', 'סדר פעולות החשבון', 'orderops', { kind: 'basic' }, 'Multiply and divide before adding and subtracting.', 'לכפול ולחלק לפני שמחברים ומחסרים.', ['g4-mental']],
        ['paren', 'Parentheses', 'סוגריים', 'orderops', { kind: 'paren' }, 'Calculate expressions with parentheses.', 'לחשב תרגילים עם סוגריים.', ['g5-order']],
        ['squares', 'Squares', 'חזקה שנייה', 'orderops', { kind: 'squares' }, 'Calculate squares of numbers.', 'לחשב חזקה שנייה של מספרים.', ['g4-mastery']]]]]],
    ['addsub', null, [
      ['big', 'Big numbers', 'מספרים גדולים', [
        ['column', 'Column calculations to a million', 'חישוב במאונך עד מיליון', 'column', { op: 'mix', digits: [6, 5] }, 'Add and subtract numbers up to a million in columns.', 'לחבר ולחסר במאונך מספרים עד מיליון.', ['g4-multi']],
        ['word', 'Multi-step word problems', 'בעיות מילוליות רב־שלביות', 'word', { ops: ['add', 'sub'], max: 100000, steps: 2 }, 'Solve multi-step stories with big numbers.', 'לפתור סיפורים רב־שלביים עם מספרים גדולים.', ['g4-word']]]]]],
    ['mul', null, [
      ['multi', 'Multi-digit multiplication', 'כפל רב־ספרתי', [
        ['multi', 'Multiplying by 2-digit numbers', 'כפל במספר דו־ספרתי', 'mul', { digits: [3, 2] }, 'Multiply 3-digit numbers by 2-digit numbers.', 'לכפול מספר תלת־ספרתי במספר דו־ספרתי.', ['g4-multi']],
        ['big', 'Multiplying big numbers', 'כפל מספרים גדולים', 'mul', { digits: [4, 1] }, 'Multiply 4-digit numbers by 1-digit numbers.', 'לכפול מספר ארבע־ספרתי במספר חד־ספרתי.', ['g4-multi']],
        ['word', 'Word problems', 'בעיות מילוליות', 'word', { ops: ['mul'], max: 10000 }, 'Solve multiplication stories with big numbers.', 'לפתור סיפורי כפל עם מספרים גדולים.', ['g4-word']]]]]],
    ['div', null, [
      ['long', 'Long division', 'חילוק ארוך', [
        ['long', 'Dividing 4-digit numbers', 'חילוק מספרים ארבע־ספרתיים', 'div', { mode: 'long', digits: [4, 1] }, 'Divide 4-digit numbers by 1-digit numbers.', 'לחלק מספר ארבע־ספרתי במספר חד־ספרתי.', ['g4-multi']],
        ['rem', 'Remainders', 'שארית', 'div', { remainder: true, digits: [3, 1] }, 'Divide bigger numbers with remainders.', 'לחלק מספרים גדולים עם שארית.', ['g4-rem']],
        ['word', 'Word problems', 'בעיות מילוליות', 'word', { ops: ['div'], max: 10000 }, 'Solve division stories with big numbers.', 'לפתור סיפורי חילוק עם מספרים גדולים.', ['g4-word']]]]]],
    ['frac', null, [
      ['equiv', 'Equivalence', 'שקילות', [
        ['simplify', 'Simplifying fractions', 'צמצום שברים', 'fracequiv', { kind: 'simplify', dens: [4, 6, 8, 9, 10, 12, 15, 16, 18, 20] }, 'Write fractions in simplest form.', 'לצמצם שברים לצורה הפשוטה ביותר.', ['g4-simplify']],
        ['compare', 'Comparing fractions', 'השוואת שברים', 'fraccmp', { kind: 'unlike', dens: [2, 3, 4, 5, 6, 8, 9, 10, 12] }, 'Compare fractions with different denominators.', 'להשוות שברים עם מכנים שונים.', ['g4-compare']]]],
      ['ops', 'Fraction operations', 'פעולות בשברים', [
        ['add', 'Adding unlike fractions', 'חיבור שברים עם מכנים שונים', 'fracadd', { op: '+' }, 'Add fractions with different denominators.', 'לחבר שברים עם מכנים שונים.', ['g4-add', 'g5-compare']],
        ['sub', 'Subtracting unlike fractions', 'חיסור שברים עם מכנים שונים', 'fracadd', { op: '-' }, 'Subtract fractions with different denominators.', 'לחסר שברים עם מכנים שונים.', ['g5-add']],
        ['mixed', 'Adding and subtracting mixed numbers', 'חיבור וחיסור מספרים מעורבים', 'fracadd', { op: 'mix', mixed: true }, 'Add and subtract mixed numbers.', 'לחבר ולחסר מספרים מעורבים.', ['g5-sub', 'g4-improper']],
        ['mulwhole', 'Multiplying a fraction by a whole number', 'כפל שבר במספר שלם', 'fracmul', { kind: 'whole' }, 'Multiply fractions by whole numbers.', 'לכפול שבר במספר שלם.', ['g4-qty']],
        ['qty', 'Fractions of big quantities', 'שבר מכמות גדולה', 'fracqty', { dens: [2, 3, 4, 5, 6, 8, 10, 12], max: 1000 }, 'Find fractions of bigger amounts.', 'למצוא שבר מכמויות גדולות.', ['g4-qty']]]]]],
    ['dec', null, [
      ['calc', 'Decimal calculations', 'חישובים בעשרוניים', [
        ['add', 'Adding decimals', 'חיבור מספרים עשרוניים', 'decop', { kind: 'add' }, 'Add decimals by lining up the decimal points.', 'לחבר מספרים עשרוניים בעזרת יישור הנקודות.', ['g4-hundredths']],
        ['sub', 'Subtracting decimals', 'חיסור מספרים עשרוניים', 'decop', { kind: 'sub' }, 'Subtract decimals.', 'לחסר מספרים עשרוניים.', ['g5-add']],
        ['pow10', 'Multiplying and dividing by 10, 100 and 1,000', 'כפל וחילוק ב־10, 100 ו־1,000', 'decop', { kind: 'pow10' }, 'Move the decimal point when multiplying or dividing by 10, 100 and 1,000.', 'להזיז את הנקודה העשרונית בכפל ובחילוק ב־10, 100 ו־1,000.', ['g4-tenths']],
        ['mulwhole', 'Multiplying decimals by whole numbers', 'כפל מספר עשרוני במספר שלם', 'decop', { kind: 'mulwhole' }, 'Multiply a decimal by a whole number.', 'לכפול מספר עשרוני במספר שלם.', ['g5-add']],
        ['round', 'Rounding decimals', 'עיגול מספרים עשרוניים', 'decop', { kind: 'round' }, 'Round decimals to whole numbers, tenths and hundredths.', 'לעגל מספרים עשרוניים לשלמים, לעשיריות ולמאיות.', ['g4-compare']]]]]],
    ['pct', null, [
      ['intro', 'Percent', 'אחוזים', [
        ['meaning', 'What is a percent?', 'מהו אחוז?', 'pct', { kind: 'meaning' }, 'Understand a percent as a part of 100.', 'להבין אחוז כחלק מתוך 100.', ['g4-hundredths']],
        ['convert', 'Fractions, decimals and percents', 'שברים, עשרוניים ואחוזים', 'pct', { kind: 'convert' }, 'Change between fractions, decimals and percents.', 'להמיר בין שברים, עשרוניים ואחוזים.', ['g5-meaning']],
        ['of', 'Percent of a number', 'אחוז מכמות', 'pct', { kind: 'of' }, 'Find 10%, 25%, 50% and other percents of a number.', 'למצוא 10%, 25%, 50% ואחוזים אחרים מכמות.', ['g5-convert']]]]]],
    ['geo', null, [
      ['angles', 'Angles in shapes', 'זוויות בצורות', [
        ['straight', 'Angles on a straight line', 'זוויות על קו ישר', 'geo2', { kind: 'straight' }, 'Find a missing angle on a straight line.', 'למצוא זווית חסרה על קו ישר.', ['g4-degrees']],
        ['trisum', 'Angles in a triangle', 'זוויות במשולש', 'geo2', { kind: 'trisum' }, 'Use the fact that the angles of a triangle add up to 180°.', 'להשתמש בכך שסכום הזוויות במשולש הוא 180°.', ['g5-straight']],
        ['quadsum', 'Angles in a quadrilateral', 'זוויות במרובע', 'geo2', { kind: 'quadsum' }, 'Use the fact that the angles of a quadrilateral add up to 360°.', 'להשתמש בכך שסכום הזוויות במרובע הוא 360°.', ['g5-trisum']]]],
      ['area', 'Area', 'שטח', [
        ['parallelogram', 'Area of a parallelogram', 'שטח מקבילית', 'area2', { kind: 'parallelogram' }, 'Find the area of parallelograms.', 'למצוא שטח של מקביליות.', ['g4-area']],
        ['triangle', 'Area of a triangle', 'שטח משולש', 'area2', { kind: 'triangle' }, 'Find the area of triangles.', 'למצוא שטח של משולשים.', ['g5-parallelogram']]]],
      ['solids', 'Solids and volume', 'גופים ונפח', [
        ['cubes', 'Volume with unit cubes', 'נפח בקוביות יחידה', 'volume', { kind: 'cubes' }, 'Count unit cubes to find a volume.', 'לספור קוביות יחידה כדי למצוא נפח.', ['g4-area']],
        ['box', 'Volume of a box', 'נפח תיבה', 'volume', { kind: 'formula' }, 'Use length × width × height.', 'להשתמש בנוסחה אורך × רוחב × גובה.', ['g5-cubes']]]]]],
    ['meas', null, [
      ['units', 'Units & problems', 'יחידות ובעיות', [
        ['conversion', 'Unit conversion', 'המרת יחידות', 'units', { kind: 'convert', dim: 'all' }, 'Convert between units of length, mass, volume and time.', 'להמיר בין יחידות של אורך, מסה, נפח וזמן.', ['g4-conversion']],
        ['problems', 'Measurement problems', 'בעיות מדידה', 'word', { ops: ['add', 'sub', 'mul', 'div'], max: 10000, theme: 'measure' }, 'Solve stories with measurements.', 'לפתור סיפורים עם מדידות.', ['g4-problems']]]]]],
    ['data', null, [
      ['stats', 'Statistics', 'סטטיסטיקה', [
        ['mean', 'Average (mean)', 'ממוצע', 'stats', { kind: 'mean' }, 'Find the average of a set of numbers.', 'למצוא ממוצע של קבוצת מספרים.', ['g4-interpret']],
        ['range', 'Range, median and mode', 'טווח, חציון ושכיח', 'stats', { kind: 'mmr' }, 'Describe data with the range, median and mode.', 'לתאר נתונים בעזרת טווח, חציון ושכיח.', ['g5-mean']],
        ['graphs', 'Graphs with big numbers', 'דיאגרמות עם מספרים גדולים', 'graph', { kind: 'multistep', max: 1000 }, 'Answer questions about graphs with bigger numbers.', 'לענות על שאלות על דיאגרמות עם מספרים גדולים.', ['g4-multistep']]]]]],
    ['logic', { en: 'Advanced Problem Solving', he: 'פתרון בעיות מתקדם' }, [
      ['problems', 'Problems & puzzles', 'בעיות וחידות', [
        ['multistep', 'Multi-step problems', 'בעיות רב־שלביות', 'word', { ops: ['add', 'sub', 'mul', 'div'], max: 10000, steps: 2 }, 'Solve challenging multi-step problems.', 'לפתור בעיות רב־שלביות מאתגרות.', ['g4-multistep']],
        ['missing', 'Missing numbers in expressions', 'מספר חסר בתרגיל', 'orderops', { kind: 'missing' }, 'Work backwards to find a missing number.', 'לעבוד מהסוף להתחלה כדי למצוא מספר חסר.', ['g5-paren']],
        ['reasoning', 'Mathematical reasoning', 'חשיבה מתמטית', 'logic', { kind: 'truefalse', max: 10000 }, 'Check and explain math statements.', 'לבדוק ולהסביר טענות מתמטיות.', ['g4-reasoning']]]]]]
  ];

  G[6] = [
    ['num', null, [
      ['factors', 'Factors and multiples', 'מחלקים וכפולות', [
        ['factorize', 'Prime factorization', 'פירוק לגורמים ראשוניים', 'divis', { kind: 'factorize' }, 'Write a number as a product of prime numbers.', 'לכתוב מספר כמכפלה של מספרים ראשוניים.', ['g5-prime']],
        ['gcd', 'Greatest common divisor', 'מחלק משותף גדול ביותר', 'divis', { kind: 'gcd' }, 'Find the greatest common divisor of two numbers.', 'למצוא את המחלק המשותף הגדול ביותר של שני מספרים.', ['g5-factors']],
        ['lcm', 'Least common multiple', 'כפולה משותפת קטנה ביותר', 'divis', { kind: 'lcm' }, 'Find the least common multiple of two numbers.', 'למצוא את הכפולה המשותפת הקטנה ביותר של שני מספרים.', ['g5-multiples']]]],
      ['expr', 'Expressions and equations', 'ביטויים ומשוואות', [
        ['paren', 'Order of operations challenge', 'אתגר סדר פעולות', 'orderops', { kind: 'paren', hard: true }, 'Calculate longer expressions with parentheses.', 'לחשב ביטויים ארוכים עם סוגריים.', ['g5-paren']],
        ['equations', 'Simple equations', 'משוואות פשוטות', 'orderops', { kind: 'missing', hard: true }, 'Find the unknown number in an equation.', 'למצוא את המספר הנעלם במשוואה.', ['g5-missing']]]]]],
    ['frac', null, [
      ['ops', 'Multiplying and dividing fractions', 'כפל וחילוק שברים', [
        ['mul', 'Multiplying fractions', 'כפל שברים', 'fracmul', { kind: 'frac' }, 'Multiply a fraction by a fraction.', 'לכפול שבר בשבר.', ['g5-mulwhole']],
        ['div', 'Dividing fractions', 'חילוק שברים', 'fracmul', { kind: 'div' }, 'Divide with fractions using the reciprocal.', 'לחלק בשברים בעזרת השבר ההפוך.', ['g6-mul']],
        ['mixed', 'Mixed number challenge', 'אתגר מספרים מעורבים', 'fracadd', { op: 'mix', mixed: true, hard: true }, 'Add and subtract mixed numbers with any denominators.', 'לחבר ולחסר מספרים מעורבים עם מכנים שונים.', ['g5-mixed']]]]]],
    ['dec', null, [
      ['calc', 'Decimal calculations', 'חישובים בעשרוניים', [
        ['mul', 'Multiplying decimals', 'כפל מספרים עשרוניים', 'decop', { kind: 'mul' }, 'Multiply two decimals.', 'לכפול שני מספרים עשרוניים.', ['g5-mulwhole']],
        ['div', 'Dividing decimals', 'חילוק מספרים עשרוניים', 'decop', { kind: 'divwhole' }, 'Divide a decimal by a whole number.', 'לחלק מספר עשרוני במספר שלם.', ['g5-mulwhole']],
        ['round', 'Rounding to hundredths', 'עיגול למאיות', 'decop', { kind: 'round', hard: true }, 'Round decimals to tenths and hundredths.', 'לעגל מספרים עשרוניים לעשיריות ולמאיות.', ['g5-round']],
        ['mix', 'Mixed decimal practice', 'תרגול מעורב בעשרוניים', 'decop', { kind: 'mix' }, 'Choose the right method for each decimal problem.', 'לבחור את הדרך הנכונה לכל תרגיל עשרוני.', ['g6-mul']]]]]],
    ['pct', null, [
      ['pct', 'Percent problems', 'בעיות אחוזים', [
        ['discount', 'Discounts and price changes', 'הנחות ושינויי מחיר', 'pct', { kind: 'discount' }, 'Find a price after a discount or an increase.', 'למצוא מחיר אחרי הנחה או התייקרות.', ['g5-of']]]],
      ['ratio', 'Ratio and rate', 'יחס וקצב', [
        ['ratio', 'Ratio', 'יחס', 'pct', { kind: 'ratio' }, 'Write ratios and share in a ratio.', 'לכתוב יחסים ולחלק לפי יחס.', ['g6-gcd']],
        ['rate', 'Unit price', 'מחיר ליחידה', 'pct', { kind: 'rate' }, 'Find the price of one, then of many.', 'למצוא מחיר של יחידה אחת ואז של כמה יחידות.', ['g5-word']],
        ['scale', 'Map scale', 'קנה מידה', 'pct', { kind: 'scale' }, 'Use a map scale to find real distances.', 'להשתמש בקנה מידה כדי למצוא מרחקים אמיתיים.', ['g5-conversion']]]]]],
    ['geo', null, [
      ['angles', 'Angles', 'זוויות', [
        ['iso', 'Isosceles triangles', 'משולש שווה־שוקיים', 'geo2', { kind: 'isosceles' }, 'Find angles in isosceles triangles.', 'למצוא זוויות במשולש שווה־שוקיים.', ['g5-trisum']],
        ['trisum', 'Triangle angle challenge', 'אתגר זוויות במשולש', 'geo2', { kind: 'trisum', hard: true }, 'Find missing angles in all kinds of triangles.', 'למצוא זוויות חסרות בכל סוגי המשולשים.', ['g5-trisum']]]],
      ['area', 'Area', 'שטח', [
        ['trapezoid', 'Area of a trapezoid', 'שטח טרפז', 'area2', { kind: 'trapezoid' }, 'Find the area of trapezoids.', 'למצוא שטח של טרפזים.', ['g5-triangle']],
        ['height', 'Finding a missing height', 'מציאת גובה חסר', 'area2', { kind: 'missing' }, 'Use an area formula backwards to find a height.', 'להשתמש בנוסחת שטח בכיוון ההפוך כדי למצוא גובה.', ['g5-triangle']]]],
      ['circle', 'Circles', 'מעגלים', [
        ['circumference', 'Circumference of a circle', 'היקף מעגל', 'area2', { kind: 'circleC' }, 'Find the circumference of a circle with π = 3.14.', 'למצוא היקף מעגל עם π = 3.14.', ['g5-dec-mulwhole']],
        ['carea', 'Area of a circle', 'שטח עיגול', 'area2', { kind: 'circleA' }, 'Find the area of a circle with π = 3.14.', 'למצוא שטח עיגול עם π = 3.14.', ['g6-circumference']]]],
      ['solids', 'Solids', 'גופים', [
        ['surface', 'Surface area of a box', 'שטח פנים של תיבה', 'volume', { kind: 'surface' }, 'Add the areas of all six faces.', 'לחבר את השטחים של כל שש הפאות.', ['g5-box']],
        ['edge', 'Missing edge of a box', 'מקצוע חסר בתיבה', 'volume', { kind: 'missing' }, 'Use the volume to find a missing edge.', 'להשתמש בנפח כדי למצוא מקצוע חסר.', ['g5-box']]]]]],
    ['meas', null, [
      ['apply', 'Applying measurement', 'יישום מדידות', [
        ['liters', 'Liters and cubic centimeters', 'ליטרים וסמ״ק', 'volume', { kind: 'liters' }, 'Change a volume in cm³ to liters.', 'להמיר נפח בסמ״ק לליטרים.', ['g5-box']],
        ['speed', 'Speed, distance and time', 'מהירות, דרך וזמן', 'pct', { kind: 'speed' }, 'Use distance = speed × time.', 'להשתמש בנוסחה דרך = מהירות × זמן.', ['g6-rate']]]]]],
    ['data', null, [
      ['stats', 'Statistics', 'סטטיסטיקה', [
        ['median', 'Median and mode', 'חציון ושכיח', 'stats', { kind: 'mmr', adv: true }, 'Find the median, mode and range of data.', 'למצוא חציון, שכיח וטווח של נתונים.', ['g5-range']],
        ['missing', 'Missing value from the average', 'ערך חסר לפי הממוצע', 'stats', { kind: 'missing' }, 'Use the average to find a missing number.', 'להשתמש בממוצע כדי למצוא מספר חסר.', ['g5-mean']]]],
      ['prob', 'Probability', 'הסתברות', [
        ['prob', 'Probability as a fraction', 'הסתברות כשבר', 'stats', { kind: 'prob', hard: true }, 'Find the probability of an event as a fraction.', 'למצוא את ההסתברות של מאורע כשבר.', ['g5-simplify']]]]]],
    ['logic', { en: 'Advanced Problem Solving', he: 'פתרון בעיות מתקדם' }, [
      ['problems', 'Problems & puzzles', 'בעיות וחידות', [
        ['multistep', 'Multi-step problems', 'בעיות רב־שלביות', 'word', { ops: ['add', 'sub', 'mul', 'div'], max: 100000, steps: 2 }, 'Solve challenging multi-step problems with big numbers.', 'לפתור בעיות רב־שלביות מאתגרות עם מספרים גדולים.', ['g5-multistep']],
        ['strategy', 'Strategy problems', 'בעיות אסטרטגיה', 'logic', { kind: 'strategy', max: 1000 }, 'Work systematically to find all possibilities.', 'לעבוד באופן שיטתי כדי למצוא את כל האפשרויות.', ['g4-strategy']],
        ['reasoning', 'Mathematical reasoning', 'חשיבה מתמטית', 'logic', { kind: 'truefalse', max: 100000 }, 'Check and explain math statements.', 'לבדוק ולהסביר טענות מתמטיות.', ['g5-reasoning']]]]]]
  ];

  /* build flat tables; skill id = g<grade>-<domain>-<key> */
  var domains = [], topics = [], skills = [];
  [1, 2, 3, 4, 5, 6].forEach(function (g) {
    G[g].forEach(function (d, di) {
      var key = d[0], meta = DOMAIN_META[key], dname = d[1] || { en: meta.en, he: meta.he };
      var world = WORLDS.filter(function (w) { return w.domains.indexOf(key) >= 0; })[0];
      var did = 'g' + g + '-' + key;
      domains.push({ id: did, grade: g, key: key, name: dname, icon: meta.icon, world: world.id, order: di });
      d[2].forEach(function (t, ti) {
        var tid = did + '-' + t[0];
        topics.push({ id: tid, domainId: did, grade: g, name: { en: t[1], he: t[2] }, order: ti });
        t[3].forEach(function (s, si) {
          skills.push({
            id: did + '-' + s[0], key: s[0], grade: g, domain: key, domainId: did, topicId: tid, world: world.id,
            order: di * 1000 + ti * 50 + si, name: { en: s[1], he: s[2] }, gen: s[3], params: s[4],
            objective: { en: s[5], he: s[6] }, prereq: s[7] || [], mastery: 80, enabled: true
          });
        });
      });
    });
  });
  /* Prerequisites are written as g<grade>-<key>; resolve to the same-domain skill when a key repeats in a grade. */
  var byId = {};
  skills.forEach(function (s) { byId[s.id] = s; });
  skills.forEach(function (s) {
    s.prereq = s.prereq.map(function (ref) {
      if (byId[ref]) return ref;
      var m = /^g(\d)-(.+)$/.exec(ref), g = +m[1], key = m[2];
      var c = skills.filter(function (x) { return x.grade === g && x.key === key; });
      var same = c.filter(function (x) { return x.domain === s.domain; })[0];
      var hit = same || c[0];
      if (!hit && typeof console !== 'undefined') console.warn('Unresolved prerequisite', ref, 'for', s.id);
      return hit ? hit.id : null;
    }).filter(Boolean);
  });

  MA.CURRICULUM = { worlds: WORLDS, domainMeta: DOMAIN_META, domains: domains, topics: topics, skills: skills, version: 1 };
})(typeof window !== 'undefined' ? (window.MA = window.MA || {}) : (globalThis.MA = globalThis.MA || {}));
