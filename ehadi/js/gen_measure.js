/* Measurement, time and money: measure, ruler, units, scale, calendar, clock, elapsed, money */
(function (MA) {
  'use strict';
  var G = MA.gen, S = MA.svg, f = G.fmt, t = function (k, p) { return MA.t(k, p); }, U = MA.u, m = G.m;
  MA.i18n.add({
    en: {
      q_longer: 'Which one is longer?', q_shorter: 'Which one is shorter?', q_taller: 'Which one is taller?', q_heavier: 'Which one is heavier?', q_lighter: 'Which one is lighter?', q_heaviest: 'Which one is the heaviest?',
      q_holds_more: 'Which container holds the most?', q_order_len: 'Order from shortest to longest', q_nonstd: 'How many {units} long is the {obj}?', u_clips: 'paper clips', u_cubes: 'cubes',
      q_ruler: 'How long is the {obj}?', obj_pencil: 'pencil', obj_crayon: 'crayon', obj_ribbon: 'ribbon', obj_key: 'key', obj_leaf: 'leaf', obj_worm: 'worm',
      hc_len: 'Line up the ends and compare where they stop.', hc_balance: 'The heavier side goes down.', hc_ruler: 'Check where the object starts and where it ends.', hc_ruler_start: 'It does not start at 0! Subtract the start from the end.',
      q_unit_choose: 'Which unit would you use to measure {thing}?', q_convert: 'Convert', q_unit_cmp: 'Compare the measurements. Choose the correct sign.', hc_units: '1 m = 100 cm · 1 km = 1,000 m · 1 kg = 1,000 g · 1 l = 1,000 ml · 1 h = 60 min',
      q_scale_mass: 'How heavy is it?', q_scale_cap: 'How much water is in the jug?', q_temp: 'What temperature does the thermometer show?', hc_scale: 'Find the labeled marks around the needle, then count the small steps.',
      q_day_after: 'Which day comes after {d}?', q_day_before: 'Which day comes before {d}?', q_day_in: 'Today is {d}. What day will it be in {n} days?', q_day_nth: 'Which is day number {n} of the week?',
      q_month_after: 'Which month comes after {m}?', q_month_before: 'Which month comes before {m}?', q_month_nth: 'Which is month number {n} of the year?', q_months_year: 'How many months are in a year?',
      q_cal_weekday: 'On which day of the week is the {n}th?', q_cal_count: 'How many {d}s are in this month?', q_cal_date: 'What is the date of the first {d} of this month?',
      q_daypart: 'When do we usually {act}?', dp_morning: 'Morning', dp_noon: 'Noon', dp_evening: 'Evening', dp_night: 'Night',
      act_breakfast: 'eat breakfast', act_lunch: 'eat lunch', act_dinner: 'eat dinner', act_sleep: 'sleep', act_school: 'go to school', act_sunrise: 'see the sunrise', act_sunset: 'see the sunset', act_stars: 'see the stars',
      q_cal_between: 'How many days are there from the {a}th to the {b}th of the same month?', q_weeks_days: 'How many days are in {n} weeks?', q_date_after: 'Today is the {a}th. What date will it be in {n} days (same month)?',
      hc_days: 'Say the days in order: Sunday, Monday, Tuesday…', hc_cal: 'Find the date on the calendar and look at the top of its column.',
      q_clock_read: 'What time does the clock show?', q_clock_set: 'Set the clock to {time}', hc_clock: 'The short hand shows the hour. The long hand shows the minutes.', hc_clock_min: 'Each number on the clock is 5 minutes for the long hand.',
      q_elapsed: 'It starts at {a} and ends at {b}. How many minutes long is it?', q_interval_end: 'It starts at {a} and lasts {n} minutes. When does it end?', q_interval_start: 'It ended at {b} and lasted {n} minutes. When did it start?',
      hc_elapsed: 'Count on from the start time: first to the next full hour, then the rest.',
      q_money_count: 'How much money is there?', q_money_cents: 'How many cents are there?', q_money_ag: 'How many agorot are there?', q_money_most: 'Which one is worth the most?',
      q_money_make: 'Make {amt} with coins', q_change: 'You pay {paid} for something that costs {cost}. How much change do you get?', hc_money: 'Start with the biggest coins and count on.', hc_change: 'Count up from the cost to the money you paid.'
    },
    he: {
      q_longer: 'מה ארוך יותר?', q_shorter: 'מה קצר יותר?', q_taller: 'מה גבוה יותר?', q_heavier: 'מה כבד יותר?', q_lighter: 'מה קל יותר?', q_heaviest: 'מה הכי כבד?',
      q_holds_more: 'איזה כלי מכיל הכי הרבה?', q_order_len: 'סדרו מהקצר לארוך', q_nonstd: 'כמה {units} אורכו של ה{obj}?', u_clips: 'אטבים', u_cubes: 'קוביות',
      q_ruler: 'מה האורך של ה{obj}?', obj_pencil: 'עיפרון', obj_crayon: 'צבע פסטל', obj_ribbon: 'סרט', obj_key: 'מפתח', obj_leaf: 'עלה', obj_worm: 'תולעת',
      hc_len: 'יישרו את הקצוות והשוו איפה כל אחד נגמר.', hc_balance: 'הצד הכבד יותר יורד למטה.', hc_ruler: 'בדקו איפה החפץ מתחיל ואיפה הוא נגמר.', hc_ruler_start: 'החפץ לא מתחיל ב־0! מחסירים את נקודת ההתחלה מנקודת הסוף.',
      q_unit_choose: 'באיזו יחידה תמדדו את {thing}?', q_convert: 'המירו', q_unit_cmp: 'השוו את המידות. בחרו את הסימן המתאים.', hc_units: '1 מ׳ = 100 ס״מ · 1 ק״מ = 1,000 מ׳ · 1 ק״ג = 1,000 גרם · 1 ליטר = 1,000 מ״ל · 1 שעה = 60 דקות',
      q_scale_mass: 'כמה זה שוקל?', q_scale_cap: 'כמה מים יש בכלי?', q_temp: 'איזו טמפרטורה מראה המדחום?', hc_scale: 'מצאו את הסימונים עם המספרים ליד המחוג, וספרו את הקפיצות הקטנות.',
      q_day_after: 'איזה יום בא אחרי {d}?', q_day_before: 'איזה יום בא לפני {d}?', q_day_in: 'היום {d}. איזה יום יהיה בעוד {n} ימים?', q_day_nth: 'מהו היום ה־{n} בשבוע?',
      q_month_after: 'איזה חודש בא אחרי {m}?', q_month_before: 'איזה חודש בא לפני {m}?', q_month_nth: 'מהו החודש ה־{n} בשנה?', q_months_year: 'כמה חודשים יש בשנה?',
      q_cal_weekday: 'באיזה יום בשבוע חל ה־{n} בחודש?', q_cal_count: 'כמה ימי {d} יש בחודש הזה?', q_cal_date: 'באיזה תאריך חל {d} הראשון של החודש?',
      q_daypart: 'מתי אנחנו בדרך כלל {act}?', dp_morning: 'בוקר', dp_noon: 'צהריים', dp_evening: 'ערב', dp_night: 'לילה',
      act_breakfast: 'אוכלים ארוחת בוקר', act_lunch: 'אוכלים ארוחת צהריים', act_dinner: 'אוכלים ארוחת ערב', act_sleep: 'ישנים', act_school: 'הולכים לבית הספר', act_sunrise: 'רואים את הזריחה', act_sunset: 'רואים את השקיעה', act_stars: 'רואים את הכוכבים',
      q_cal_between: 'כמה ימים יש מה־{a} עד ה־{b} באותו חודש?', q_weeks_days: 'כמה ימים יש ב־{n} שבועות?', q_date_after: 'היום ה־{a} בחודש. איזה תאריך יהיה בעוד {n} ימים (באותו חודש)?',
      hc_days: 'אמרו את הימים לפי הסדר: ראשון, שני, שלישי…', hc_cal: 'מצאו את התאריך בלוח והסתכלו בראש העמודה שלו.',
      q_clock_read: 'מה השעה בשעון?', q_clock_set: 'כוונו את השעון ל־{time}', hc_clock: 'המחוג הקצר מראה את השעה. המחוג הארוך מראה את הדקות.', hc_clock_min: 'כל מספר בשעון שווה 5 דקות למחוג הארוך.',
      q_elapsed: 'זה מתחיל ב־{a} ונגמר ב־{b}. כמה דקות זה נמשך?', q_interval_end: 'זה מתחיל ב־{a} ונמשך {n} דקות. מתי זה נגמר?', q_interval_start: 'זה נגמר ב־{b} ונמשך {n} דקות. מתי זה התחיל?',
      hc_elapsed: 'ספרו קדימה משעת ההתחלה: קודם עד השעה העגולה, ואז את השאר.',
      q_money_count: 'כמה כסף יש כאן?', q_money_cents: 'כמה סנטים יש כאן?', q_money_ag: 'כמה אגורות יש כאן?', q_money_most: 'מה שווה הכי הרבה?',
      q_money_make: 'הרכיבו {amt} ממטבעות', q_change: 'משלמים {paid} על משהו שעולה {cost}. כמה עודף מקבלים?', hc_money: 'מתחילים מהמטבעות הגדולים וסופרים קדימה.', hc_change: 'ספרו קדימה מהמחיר עד הסכום ששילמתם.'
    }
  });
  var UNITS = {
    en: { mm: 'mm', cm: 'cm', m: 'm', km: 'km', g: 'g', kg: 'kg', ml: 'ml', l: 'l', s: 's', min: 'min', h: 'h', day: 'days', week: 'weeks' },
    he: { mm: 'מ״מ', cm: 'ס״מ', m: 'מ׳', km: 'ק״מ', g: 'גרם', kg: 'ק״ג', ml: 'מ״ל', l: 'ליטר', s: 'שנ׳', min: 'דק׳', h: 'שע׳', day: 'ימים', week: 'שבועות' }
  };
  var UNAMES = {
    en: { mm: 'millimeters', cm: 'centimeters', m: 'meters', km: 'kilometers', g: 'grams', kg: 'kilograms', ml: 'milliliters', l: 'liters', s: 'seconds', min: 'minutes', h: 'hours', day: 'days' },
    he: { mm: 'מילימטרים', cm: 'סנטימטרים', m: 'מטרים', km: 'קילומטרים', g: 'גרמים', kg: 'קילוגרמים', ml: 'מיליליטרים', l: 'ליטרים', s: 'שניות', min: 'דקות', h: 'שעות', day: 'ימים' }
  };
  var un = G.unit = function (k) { return UNITS[G.lang()][k]; };
  var unName = function (k) { return UNAMES[G.lang()][k]; };

  /* ------------------------------------------------------------------ comparing measures */
  var LEN_OBJ = [['🐍', '#5CC160'], ['✏️', '#FFC93C'], ['🎀', '#FF8FC7'], ['🖍️', '#FF7A7A'], ['🥖', '#E0A458'], ['🐛', '#A5D86B']];
  var TALL_OBJ = [['🦒', '#FFC46B'], ['🌲', '#4CB963'], ['🏠', '#FF9F43'], ['🌻', '#FFD84D'], ['🐘', '#B0BEC5'], ['🧒', '#A68BFF']];
  var WEIGHT_PAIRS = [['🐘', '🐭'], ['🍉', '🍒'], ['🚗', '🚲'], ['📚', '✏️'], ['🎃', '🍓'], ['🐻', '🐦'], ['🧱', '🪶']];
  function barsSvg(lens, objs, vertical) {
    var g = '', max = Math.max.apply(null, lens);
    if (!vertical) {
      lens.forEach(function (l, i) { var y = 14 + i * 46, w = 40 + l * 34; g += S.emoji(18, y + 14, objs[i][0], 24) + '<rect x="40" y="' + y + '" width="' + w + '" height="26" rx="13" fill="' + objs[i][1] + '" stroke="#23233A" stroke-width="2"/>'; });
      return S.wrap(60 + max * 34 + 20, lens.length * 46 + 16, g, { width: Math.min(560, 80 + max * 34) });
    }
    lens.forEach(function (l, i) { var x = 20 + i * 90, h = 30 + l * 22; g += '<rect x="' + x + '" y="' + (250 - h) + '" width="56" height="' + h + '" rx="10" fill="' + objs[i][1] + '" stroke="#23233A" stroke-width="2"/>' + S.emoji(x + 28, 250 - h - 18, objs[i][0], 28); });
    g += '<path d="M8 250 H' + (lens.length * 90 + 20) + '" stroke="#23233A" stroke-width="3"/>';
    return S.wrap(lens.length * 90 + 30, 260, g, { width: Math.min(400, lens.length * 100) });
  }
  function cupSvg(sizes, labels) {
    var g = '', x = 10;
    sizes.forEach(function (s, i) { var w = 30 + s * 9, h = 40 + s * 13; g += '<path d="M' + x + ' ' + (200 - h) + ' L' + (x + 6) + ' 200 H' + (x + w - 6) + ' L' + (x + w) + ' ' + (200 - h) + '" fill="#E3F5FD" stroke="#23233A" stroke-width="3"/><rect x="' + (x + 5) + '" y="' + (200 - h * .7) + '" width="' + (w - 10) + '" height="' + (h * .7 - 2) + '" fill="#4FC3F7" opacity=".7"/>' + S.text(x + w / 2, 218, labels[i], { size: 18 }); x += w + 26; });
    return S.wrap(x, 230, g, { width: Math.min(420, x) });
  }
  G.register('measure', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q, kind = p.kind, attr = p.attr;
    if (kind === 'nonstd') {
      var n = rng.int(L <= 2 ? 2 : 4, L <= 2 ? 6 : 10), useCubes = rng.chance(.5), cw = 34, g = '';
      g += '<rect x="10" y="10" width="' + (n * cw) + '" height="26" rx="13" fill="#FFC93C" stroke="#23233A" stroke-width="2"/>';
      for (var i = 0; i < n; i++) g += useCubes ? '<rect x="' + (10 + i * cw) + '" y="48" width="' + cw + '" height="' + cw + '" fill="' + S.COLORS[i % 8] + '" stroke="#23233A" stroke-width="2"/>' : '<rect x="' + (12 + i * cw) + '" y="52" width="' + (cw - 4) + '" height="14" rx="7" fill="none" stroke="#78909C" stroke-width="3"/><rect x="' + (18 + i * cw) + '" y="56" width="' + (cw - 14) + '" height="6" rx="3" fill="none" stroke="#78909C" stroke-width="2"/>';
      q = { ui: L <= 2 ? 'choice' : 'input', prompt: t('q_nonstd', { units: t(useCubes ? 'u_cubes' : 'u_clips'), obj: t('obj_ribbon') }), visual: S.wrap(n * cw + 20, 92, g, { width: Math.min(560, n * cw * 1.3 + 20) }), data: L <= 2 ? { options: G.numOpts(n, rng, { n: 3, min: 1, deltas: [1, -1, 2] }) } : { kind: 'int' }, answer: n };
      q.hints = G.hintList(t('hc_count_one'));
      q.sig = 'nonstd:' + n + useCubes;
      return q;
    }
    if (kind === 'order') {
      var cnt = L <= 2 ? 3 : 4, lens = rng.sample(U.range(2, 12), cnt), objs = rng.sample(LEN_OBJ, cnt);
      q = { ui: 'order', prompt: t('q_order_len'), data: { items: lens.map(function (l, i) { return { v: l, html: S.wrap(l * 14 + 10, 26, '<rect x="2" y="2" width="' + l * 14 + '" height="22" rx="11" fill="' + objs[i][1] + '" stroke="#23233A" stroke-width="2"/>', { width: l * 14 + 10 }), aria: objs[i][0] }; }), dir: 'asc', startLabel: t('ord_short'), endLabel: t('ord_long') }, answer: lens.slice().sort(function (a, b) { return a - b; }) };
      q.hints = G.hintList(t('hc_len'));
      q.sig = 'mord:' + lens.join(',');
      return q;
    }
    if (attr === 'weight') {
      if (L >= 4) {
        var tri = rng.sample(['🍉', '🍍', '🍎', '🍒', '🥥', '🍋'], 3);
        q = { ui: 'choice', prompt: t('q_heaviest'), visual: S.balance(tri[0], tri[1], 'left') + S.balance(tri[1], tri[2], 'left'), data: { options: rng.shuffle(tri).map(function (e) { return { v: e, label: e }; }) }, answer: tri[0] };
        q.sig = 'wt3:' + tri.join('');
      } else {
        var pr = rng.pick(WEIGHT_PAIRS), flip = rng.chance(.5), left = flip ? pr[1] : pr[0], right = flip ? pr[0] : pr[1], askLight = L >= 3 && rng.chance(.5);
        q = { ui: 'choice', prompt: t(askLight ? 'q_lighter' : 'q_heavier'), visual: S.balance(left, right, flip ? 'right' : 'left'), data: { options: [{ v: left, label: left }, { v: right, label: right }], layout: 'two' }, answer: askLight ? pr[1] : pr[0] };
        q.sig = 'wt:' + left + right + askLight;
      }
      q.hints = G.hintList(t('hc_balance'));
      return q;
    }
    if (attr === 'capacity') {
      var sizes = rng.sample([2, 4, 6, 8, 10], L <= 2 ? 2 : 3), labels = ['A', 'B', 'C'];
      var best = labels[sizes.indexOf(Math.max.apply(null, sizes))];
      q = { ui: 'choice', prompt: t('q_holds_more'), visual: cupSvg(sizes, labels), data: { options: labels.slice(0, sizes.length).map(function (l) { return { v: l, label: l }; }), layout: 'two' }, answer: best };
      q.hints = G.hintList(t('hc_cap'));
      q.sig = 'cap:' + sizes.join(',');
      return q;
    }
    var vertical = attr === 'height', pool = vertical ? TALL_OBJ : LEN_OBJ, k = L <= 2 ? 2 : 3, ls = rng.sample(U.range(2, 10), k), ob = rng.sample(pool, k);
    var askShort = L >= 2 && rng.chance(.5), target = askShort ? Math.min.apply(null, ls) : Math.max.apply(null, ls);
    q = { ui: 'choice', prompt: t(vertical ? (askShort ? 'q_shorter' : 'q_taller') : (askShort ? 'q_shorter' : 'q_longer')), visual: barsSvg(ls, ob, vertical), data: { options: ob.map(function (o) { return { v: o[0], label: o[0] }; }), layout: 'two' }, answer: ob[ls.indexOf(target)][0] };
    q.hints = G.hintList(t('hc_len'));
    q.sig = 'mcmp:' + attr + ls.join(',') + askShort;
    return q;
  });
  MA.i18n.add({ en: { ord_short: 'shortest', ord_long: 'longest', hc_cap: 'A bigger container (wider and taller) holds more.' }, he: { ord_short: 'הקצר', ord_long: 'הארוך', hc_cap: 'כלי גדול יותר (רחב וגבוה יותר) מכיל יותר.' } });

  /* ------------------------------------------------------------------ ruler */
  G.register('ruler', function (c) {
    var rng = c.rng, p = c.p, L = c.level, maxLen = Math.min(p.max || 12, 15), objLen = rng.int(2, Math.min(maxLen - (L >= 4 ? 3 : 0), L <= 1 ? 8 : maxLen)), start = L >= 4 ? rng.int(1, 3) : 0;
    var obj = rng.pick(['pencil', 'crayon', 'ribbon', 'key', 'leaf', 'worm']), len = Math.max(objLen + start + 1, Math.min(15, objLen + start + rng.int(1, 3)));
    var q = { ui: 'input', prompt: t('q_ruler', { obj: t('obj_' + obj) }), visual: S.ruler({ len: len, objLen: objLen, start: start, obj: obj }), data: { kind: 'int', unit: un('cm') }, answer: objLen };
    q.hints = G.hintList(start ? t('hc_ruler_start') : t('hc_ruler'), { text: m((start + objLen) + ' − ' + start + ' = ' + objLen) });
    q.explain = { text: m(objLen + ' ' + un('cm')) };
    q.sig = 'ruler:' + obj + objLen + ':' + start;
    return q;
  });

  /* ------------------------------------------------------------------ units */
  var THINGS = {
    length: [['an ant', 'mm', 'נמלה'], ['a pencil', 'cm', 'עיפרון'], ['a finger', 'cm', 'אצבע'], ['a classroom', 'm', 'כיתה'], ['a swimming pool', 'm', 'בריכת שחייה'], ['the road between two cities', 'km', 'כביש בין שתי ערים'], ['a marathon race', 'km', 'מרוץ מרתון'], ['a ladybug', 'mm', 'פרת משה רבנו'],
      ['an eraser', 'cm', 'מחק'], ['a spoon', 'cm', 'כפית'], ['a book', 'cm', 'ספר'], ['a shoe', 'cm', 'נעל'], ['a toothbrush', 'cm', 'מברשת שיניים'], ['a leaf', 'cm', 'עלה'], ['a banana', 'cm', 'בננה'], ['a fork', 'cm', 'מזלג'],
      ['a bus', 'm', 'אוטובוס'], ['a football field', 'm', 'מגרש כדורגל'], ['a tall tree', 'm', 'עץ גבוה'], ['a house', 'm', 'בית'], ['a train', 'm', 'רכבת'], ['a giraffe', 'm', 'ג׳ירפה'], ['a school hallway', 'm', 'מסדרון בבית הספר'], ['a flight to another country', 'km', 'טיסה לארץ אחרת'], ['a grain of rice', 'mm', 'גרגר אורז']],
    mass: [['an apple', 'g', 'תפוח'], ['a dog', 'kg', 'כלב'], ['a feather', 'g', 'נוצה'], ['a sack of potatoes', 'kg', 'שק תפוחי אדמה'], ['a letter', 'g', 'מכתב'], ['a grown-up', 'kg', 'אדם מבוגר'],
      ['a strawberry', 'g', 'תות'], ['a coin', 'g', 'מטבע'], ['a cookie', 'g', 'עוגייה'], ['a key', 'g', 'מפתח'], ['a sheet of paper', 'g', 'דף נייר'], ['a mouse', 'g', 'עכבר'], ['a slice of bread', 'g', 'פרוסת לחם'],
      ['a watermelon', 'kg', 'אבטיח'], ['a bicycle', 'kg', 'אופניים'], ['a suitcase', 'kg', 'מזוודה'], ['a sofa', 'kg', 'ספה'], ['a horse', 'kg', 'סוס'], ['a car', 'kg', 'מכונית']],
    volume: [['a spoon of medicine', 'ml', 'כפית תרופה'], ['a bathtub', 'l', 'אמבטיה'], ['a cup of tea', 'ml', 'כוס תה'], ['a bucket', 'l', 'דלי'], ['eye drops', 'ml', 'טיפות עיניים'], ['a fish tank', 'l', 'אקווריום']],
    time: [['brushing your teeth', 'min', 'צחצוח שיניים'], ['a blink', 's', 'מצמוץ'], ['a school day', 'h', 'יום לימודים'], ['summer vacation', 'day', 'חופשת קיץ'], ['a sneeze', 's', 'עיטוש'], ['a movie', 'h', 'סרט']]
  };
  var DIM_UNITS = { length: ['mm', 'cm', 'm', 'km'], mass: ['g', 'kg'], volume: ['ml', 'l'], time: ['s', 'min', 'h', 'day'] };
  var CONV = { length: [['m', 'cm', 100], ['km', 'm', 1000], ['cm', 'mm', 10]], mass: [['kg', 'g', 1000]], volume: [['l', 'ml', 1000]], time: [['h', 'min', 60], ['min', 's', 60], ['day', 'h', 24], ['week', 'day', 7]] };
  G.register('units', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q, dim = p.dim === 'all' ? rng.pick(['length', 'mass', 'volume', 'time']) : p.dim;
    if (p.kind === 'choose') {
      var basicDims = { length: ['cm', 'm'], mass: ['g', 'kg'] };
      if (p.basic && !basicDims[dim]) dim = 'length';
      var units = p.basic ? basicDims[dim] : DIM_UNITS[dim], things = THINGS[dim].filter(function (x) { return units.indexOf(x[1]) >= 0; }), th = rng.pick(things);
      q = { ui: 'choice', prompt: t('q_unit_choose', { thing: G.lang() === 'he' ? th[2] : th[0] }), data: { options: G.textOpts(units.map(function (u) { return [u, unName(u)]; }), rng), layout: 'two' }, answer: th[1] };
      q.hints = G.hintList(t('hc_unit_size'));
      q.sig = 'uch:' + dim + th[0];
      return q;
    }
    var pairs = CONV[dim];
    if (p.pairs) pairs = pairs.filter(function (x) { return p.pairs.indexOf(x[0] + '-' + x[1]) >= 0; });
    if (p.basic) pairs = pairs.filter(function (x) { return x[2] <= 100 || dim !== 'time'; });
    var pr = rng.pick(pairs), big = pr[0], small = pr[1], r = pr[2];
    if (p.kind === 'compare') {
      var a = rng.int(1, 5), bv = a * r + rng.pick([-1, 1]) * rng.int(1, Math.max(1, Math.floor(r / 5))) * (r >= 100 ? 10 : 1);
      if (rng.chance(.15)) bv = a * r;
      if (bv <= 0) bv = a * r + 1;
      var sign = a * r < bv ? '<' : a * r > bv ? '>' : '=';
      q = { ui: 'compare', prompt: t('q_unit_cmp'), data: { left: f(a) + ' ' + un(big), right: f(bv) + ' ' + un(small) }, answer: sign };
      q.hints = G.hintList(t('hc_units'), { text: m(f(a) + ' ' + un(big) + ' = ' + f(a * r) + ' ' + un(small)) });
      q.sig = 'ucmp:' + a + big + bv + small;
      return q;
    }
    var x = rng.int(2, L >= 4 ? 12 : 9), tok;
    if (L <= 2) { tok = [f(x), un(big), '=', { blank: true }, un(small)]; q = { answer: x * r }; }
    else if (L === 3) { tok = [f(x * r), un(small), '=', { blank: true }, un(big)]; q = { answer: x }; }
    else { var extra = rng.int(1, r - 1); tok = [f(x), un(big), f(extra), un(small), '=', { blank: true }, un(small)]; q = { answer: x * r + extra }; }
    q.ui = 'input'; q.prompt = t('q_convert'); q.data = { kind: 'int', eq: tok };
    q.hints = G.hintList(t('hc_units'), { text: m('1 ' + un(big) + ' = ' + f(r) + ' ' + un(small)) });
    q.explain = { text: m('1 ' + un(big) + ' = ' + f(r) + ' ' + un(small)) };
    q.sig = 'uconv:' + L + big + x + JSON.stringify(q.answer);
    return q;
  });
  MA.i18n.add({ en: { hc_unit_size: 'Think about how big it is: tiny things use small units, long distances use big units.' }, he: { hc_unit_size: 'חשבו כמה זה גדול: לדברים קטנים יחידות קטנות, למרחקים ארוכים יחידות גדולות.' } });

  /* ------------------------------------------------------------------ instruments */
  G.register('scale', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q, v;
    if (p.kind === 'temp') {
      var step = L <= 3 ? 5 : 1; v = rng.int(L >= 5 ? -9 : L === 1 ? 5 : 0, 39); v = Math.round(v / step) * step;
      q = { ui: 'input', prompt: t('q_temp'), visual: S.thermo({ min: L >= 5 ? -10 : 0, max: 40, step: L >= 4 ? 2 : 5, value: v, labelEvery: 10 }), data: { kind: 'int', unit: '°C' }, answer: v };
      if (L >= 4 && v % 2 !== 0) { v += 1; q.answer = v; q.visual = S.thermo({ min: L >= 5 ? -10 : 0, max: 40, step: 2, value: v, labelEvery: 10 }); }
      q.sig = 'temp:' + v + L;
    } else if (p.kind === 'mass') {
      var kg = p.unit === 'kg', max = kg ? 10 : 1000, st = kg ? 1 : (L >= 4 ? 50 : 100), le = kg ? (L <= 2 ? 1 : 2) : (L <= 2 ? 2 : 4);
      v = rng.int(1, Math.round(max / st) - 1) * st;
      q = { ui: 'input', prompt: t('q_scale_mass'), visual: S.dial({ max: max, step: st, value: v, unit: un(p.unit), labelEvery: le, item: rng.pick(['🍉', '🥔', '📦', '🍎', '🧀']) }), data: { kind: 'int', unit: un(p.unit) }, answer: v };
      q.sig = 'mass:' + v + p.unit + L;
    } else {
      var lit = p.unit === 'l', mx = lit ? 10 : 1000, st2 = lit ? 1 : (L >= 5 ? 50 : 100), le2 = lit ? 1 : (L <= 2 ? 1 : 2);
      v = rng.int(1, Math.round(mx / st2) - 1) * st2;
      q = { ui: 'input', prompt: t('q_scale_cap'), visual: S.jug({ max: mx, step: st2, value: v, unit: un(p.unit), labelEvery: le2 }), data: { kind: 'int', unit: un(p.unit) }, answer: v };
      q.sig = 'cap:' + v + p.unit + L;
    }
    q.hints = G.hintList(t('hc_scale'));
    q.explain = { text: m(f(q.answer) + ' ' + (q.data.unit || '')) };
    return q;
  });

  /* ------------------------------------------------------------------ calendar */
  function monthGrid(year, month, highlight) {
    var first = new Date(year, month, 1).getDay(), days = new Date(year, month + 1, 0).getDate(), html = '<table class="table math" style="max-width:420px;text-align:center;font-weight:700"><tr>';
    for (var d = 0; d < 7; d++) html += '<th style="text-align:center">' + U.esc(U.weekdayName(d, 'short')) + '</th>';
    html += '</tr><tr>';
    for (var i = 0; i < first; i++) html += '<td></td>';
    for (var day = 1; day <= days; day++) {
      if ((first + day - 1) % 7 === 0 && day > 1) html += '</tr><tr>';
      html += '<td' + (day === highlight ? ' style="background:#FFE38A;border-radius:8px"' : '') + '>' + day + '</td>';
    }
    return '<div style="direction:ltr"><div class="bold center mb-s">' + U.esc(U.monthName(month) + ' ' + year) + '</div>' + html + '</tr></table></div>';
  }
  G.register('calendar', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q, kind = p.kind, dayName = function (i) { return U.weekdayName(((i % 7) + 7) % 7); };
    var dayOpts = function (ans, extra) { var s = U.uniq([ans].concat(extra)).slice(0, 4); return s.map(function (i) { return { v: i, label: dayName(i) }; }); };
    if (kind === 'days') {
      var d = rng.int(0, 6);
      if (L <= 2) { var after = rng.chance(.5); var ans = after ? (d + 1) % 7 : (d + 6) % 7; q = { ui: 'choice', prompt: t(after ? 'q_day_after' : 'q_day_before', { d: dayName(d) }), data: { options: rng.shuffle(dayOpts(ans, [d, after ? (d + 6) % 7 : (d + 1) % 7, (d + 2) % 7, (d + 3) % 7])), layout: 'two' }, answer: ans }; }
      else if (L === 3) { var n = rng.int(1, 7); q = { ui: 'choice', prompt: t('q_day_nth', { n: n }), data: { options: rng.shuffle(dayOpts(n - 1, [n % 7, (n + 5) % 7, (n + 2) % 7])), layout: 'two' }, answer: n - 1 }; }
      else { var k = rng.int(2, L === 5 ? 10 : 6), a2 = (d + k) % 7; q = { ui: 'choice', prompt: t('q_day_in', { d: dayName(d), n: k }), data: { options: rng.shuffle(dayOpts(a2, [(a2 + 1) % 7, (a2 + 6) % 7, (d + 1) % 7, d])), layout: 'two' }, answer: a2 }; }
      q.hints = G.hintList(t('hc_days'), { text: U.range(7).map(dayName).join(' → ') });
      q.sig = 'days:' + L + q.prompt;
      return q;
    }
    if (kind === 'months') {
      var mo = rng.int(0, 11), ml = function (i) { return U.monthName(((i % 12) + 12) % 12); }, mOpts = function (ans, ex) { return U.uniq([ans].concat(ex)).slice(0, 4).map(function (i) { return { v: i, label: ml(i) }; }); };
      if (L === 5 && rng.chance(.2)) q = { ui: 'input', prompt: t('q_months_year'), data: { kind: 'int' }, answer: 12 };
      else if (L === 5) { var kn = rng.int(2, 6), an5 = (mo + kn) % 12; q = { ui: 'choice', prompt: t('q_month_in', { m: ml(mo), n: kn }), data: { options: rng.shuffle(mOpts(an5, [(an5 + 1) % 12, (an5 + 11) % 12, (mo + 1) % 12])), layout: 'two' }, answer: an5 }; }
      else if (L <= 3) { var af = rng.chance(.5), an = af ? (mo + 1) % 12 : (mo + 11) % 12; q = { ui: 'choice', prompt: t(af ? 'q_month_after' : 'q_month_before', { m: ml(mo) }), data: { options: rng.shuffle(mOpts(an, [mo, af ? (mo + 11) % 12 : (mo + 1) % 12, (mo + 2) % 12])), layout: 'two' }, answer: an }; }
      else { var nn = rng.int(1, 12); q = { ui: 'choice', prompt: t('q_month_nth', { n: nn }), data: { options: rng.shuffle(mOpts(nn - 1, [nn % 12, (nn + 10) % 12, (nn + 2) % 12])), layout: 'two' }, answer: nn - 1 }; }
      q.hints = G.hintList(t('hc_months'), { text: U.range(12).map(function (i) { return ml(i); }).join(', ') });
      q.sig = 'months:' + L + q.prompt;
      return q;
    }
    if (kind === 'dayparts') {
      var acts = [['breakfast', 'morning'], ['lunch', 'noon'], ['dinner', 'evening'], ['sleep', 'night'], ['school', 'morning'], ['sunrise', 'morning'], ['sunset', 'evening'], ['stars', 'night']], ac = rng.pick(acts);
      q = { ui: 'choice', prompt: t('q_daypart', { act: t('act_' + ac[0]) }), data: { options: G.textOpts([['morning', '🌅 ' + t('dp_morning')], ['noon', '☀️ ' + t('dp_noon')], ['evening', '🌇 ' + t('dp_evening')], ['night', '🌙 ' + t('dp_night')]], rng), layout: 'two' }, answer: ac[1] };
      q.hints = G.hintList(t('hc_dayparts'));
      q.sig = 'dp:' + ac[0];
      return q;
    }
    var year = rng.int(2025, 2028), month = rng.int(0, 11), days = new Date(year, month + 1, 0).getDate(), first = new Date(year, month, 1).getDay();
    if (kind === 'calc') {
      var form = rng.int(0, 2);
      if (form === 0) { var a = rng.int(1, 14), b = a + rng.int(3, 14); q = { ui: 'input', prompt: t('q_cal_between', { a: a, b: b }), visual: monthGrid(year, month, 0), data: { kind: 'int' }, answer: b - a }; q.hints = G.hintList(t('hc_cal'), { text: m(b + ' − ' + a + ' = ?') }); }
      else if (form === 1) { var w = rng.int(2, 5); q = { ui: 'input', prompt: t('q_weeks_days', { n: w }), data: { kind: 'int' }, answer: w * 7 }; q.hints = G.hintList(t('hc_week7'), { text: m(w + ' × 7') }); }
      else { var a3 = rng.int(1, 15), k3 = rng.int(3, 12); q = { ui: 'input', prompt: t('q_date_after', { a: a3, n: k3 }), visual: monthGrid(year, month, a3), data: { kind: 'int' }, answer: a3 + k3 }; q.hints = G.hintList(t('hc_cal'), { text: m(a3 + ' + ' + k3) }); }
      q.sig = 'calc:' + form + q.prompt + year + month;
      return q;
    }
    var day = rng.int(1, days), wd = (first + day - 1) % 7, form2 = L <= 2 ? 0 : rng.int(0, 2);
    if (form2 === 0) q = { ui: 'choice', prompt: t('q_cal_weekday', { n: day }), visual: monthGrid(year, month, 0), data: { options: rng.shuffle(dayOpts(wd, [(wd + 1) % 7, (wd + 6) % 7, (wd + 3) % 7])), layout: 'two' }, answer: wd };
    else if (form2 === 1) { var wd2 = rng.int(0, 6), cnt = U.range(1, days + 1).filter(function (x) { return (first + x - 1) % 7 === wd2; }).length; q = { ui: 'input', prompt: t('q_cal_count', { d: dayName(wd2) }), visual: monthGrid(year, month, 0), data: { kind: 'int' }, answer: cnt }; }
    else { var wd3 = rng.int(0, 6), firstDate = 1 + ((wd3 - first + 7) % 7); q = { ui: 'input', prompt: t('q_cal_date', { d: dayName(wd3) }), visual: monthGrid(year, month, 0), data: { kind: 'int' }, answer: firstDate }; }
    q.hints = G.hintList(t('hc_cal'));
    q.sig = 'cal:' + form2 + year + month + q.prompt;
    return q;
  });
  MA.i18n.add({ en: { hc_months: 'January, February, March… there are 12 months.', hc_dayparts: 'Think about your own day: what happens first?', hc_week7: 'Every week has 7 days.' }, he: { hc_months: 'ינואר, פברואר, מרץ… יש 12 חודשים.', hc_dayparts: 'חשבו על היום שלכם: מה קורה קודם?', hc_week7: 'בכל שבוע יש 7 ימים.' } });

  /* ------------------------------------------------------------------ clock */
  MA.i18n.add({ en: { q_month_in: 'Which month comes {n} months after {m}?', q_money_least: 'Which one is worth the least?' }, he: { q_month_in: 'איזה חודש יהיה {n} חודשים אחרי {m}?', q_money_least: 'מה שווה הכי מעט?' } });
  var tstr = G.timeStr = function (h, mm) { return h + ':' + (mm < 10 ? '0' : '') + mm; };
  function randTime(rng, step) { return { h: rng.int(1, 12), m: rng.int(0, 60 / step - 1) * step }; }
  G.register('clock', function (c) {
    var rng = c.rng, p = c.p, L = c.level, step = p.step || 60, tm = randTime(rng, step), q, mode = p.mode;
    if (mode === 'mixed') mode = L % 2 ? 'read' : 'set';
    if (mode === 'read') {
      if (L <= 2) {
        var cands = [tm, { h: tm.h % 12 + 1, m: tm.m }, { h: tm.m === 0 ? tm.h : tm.h, m: (tm.m + (step >= 30 ? 30 : step === 15 ? 15 : 5) * (step === 60 ? 0 : 1)) % 60 }, { h: (tm.h + 10) % 12 + 1, m: tm.m }, { h: Math.min(12, Math.round(tm.m / 5) || 12), m: (tm.h % 12) * 5 }];
        var seen = {}, opts = [];
        cands.forEach(function (x) { var k = tstr(x.h, x.m); if (!seen[k] && opts.length < 4) { seen[k] = 1; opts.push({ v: k, label: k }); } });
        q = { ui: 'choice', prompt: t('q_clock_read'), visual: S.clock(tm.h, tm.m), data: { options: rng.shuffle(opts), layout: 'two' }, answer: tstr(tm.h, tm.m) };
      } else { q = { ui: 'input', prompt: t('q_clock_read'), visual: S.clock(tm.h, tm.m), data: { kind: 'time' }, answer: { h: tm.h, m: tm.m } }; q.check = function (a) { return a && (a.h % 12) === (tm.h % 12) && a.m === tm.m; }; }
    } else {
      q = { ui: 'clock', prompt: t('q_clock_set', { time: tstr(tm.h, tm.m) }), data: { mode: 'set', step: step >= 15 ? Math.min(step, 30) : step, target: tm }, answer: { h: tm.h, m: tm.m } };
      if (step === 60) q.data.step = 30;
      q.check = function (a) { return a && (a.h % 12) === (tm.h % 12) && a.m === tm.m; };
    }
    q.hints = G.hintList(t('hc_clock'), { text: step < 60 ? t('hc_clock_min') : tstr(tm.h, 0), svg: S.clock(3, 0, { width: 120 }) }, { text: '🕒 = 3:00' });
    q.explain = { text: tstr(tm.h, tm.m), svg: S.clock(tm.h, tm.m, { width: 140 }) };
    q.sig = 'clock:' + mode + L + tstr(tm.h, tm.m);
    return q;
  });
  G.register('elapsed', function (c) {
    var rng = c.rng, p = c.p, L = c.level, step = p.step || 15, q;
    var sh = rng.int(7, 17), sm = rng.int(0, 60 / step - 1) * step, dur = rng.int(1, L <= 2 ? 4 : 10) * (L <= 2 ? 15 : step) + (L >= 4 ? rng.int(0, 2) * 60 : 0);
    if (dur <= 0) dur = step;
    var end = sh * 60 + sm + dur, eh = Math.floor(end / 60), em = end % 60, fmt = function (h, mm) { return tstr(h, mm); };
    if (p.kind === 'elapsed' || L <= 2) {
      q = { ui: 'input', prompt: t('q_elapsed', { a: fmt(sh, sm), b: fmt(eh, em) }), visual: L <= 3 ? S.clock(sh % 12 || 12, sm, { width: 150 }) + S.clock(eh % 12 || 12, em, { width: 150 }) : null, data: { kind: 'int', unit: un('min') }, answer: dur };
    } else if (rng.chance(.6)) {
      q = { ui: 'input', prompt: t('q_interval_end', { a: fmt(sh, sm), n: dur }), data: { kind: 'time', h24: true }, answer: { h: eh, m: em } };
      q.check = function (a) { return a && (a.h % 12) === (eh % 12) && a.m === em; };
    } else {
      q = { ui: 'input', prompt: t('q_interval_start', { b: fmt(eh, em), n: dur }), data: { kind: 'time', h24: true }, answer: { h: sh, m: sm } };
      q.check = function (a) { return a && (a.h % 12) === (sh % 12) && a.m === sm; };
    }
    q.hints = G.hintList(t('hc_elapsed'), { text: m(fmt(sh, sm) + ' → ' + fmt(eh, em)) });
    q.explain = { text: m(fmt(sh, sm) + ' + ' + dur + ' = ' + fmt(eh, em)) };
    q.sig = 'el:' + p.kind + L + sh + ':' + sm + '+' + dur;
    q.verify = function () { return sh * 60 + sm + dur === eh * 60 + em; };
    return q;
  });

  /* ------------------------------------------------------------------ money */
  function coinsSvgRow(vals, cur) { return '<div class="coin-bank">' + vals.map(function (v) { return S.coin(v, cur, { width: S.CURRENCIES[cur].bills.indexOf(v) >= 0 ? 110 : 62 }); }).join('') + '</div>'; }
  G.register('money', function (c) {
    var rng = c.rng, p = c.p, L = c.level, cur = G.currency(), C = S.CURRENCIES[cur], q, total, vals = [];
    var ils = cur === 'ILS';
    if (p.kind === 'coins') {
      if (L === 1) {
        var least = rng.chance(.5), picks = rng.sample(C.coins, 3), best = (least ? Math.min : Math.max).apply(null, picks);
        q = { ui: 'choice', prompt: t(least ? 'q_money_least' : 'q_money_most'), data: { options: picks.map(function (v) { return { v: v, html: S.coin(v, cur, { width: 70 }), aria: S.moneyLabel(v, cur) }; }), layout: 'grid' }, answer: best };
        q.hints = G.hintList(t('hc_money'));
        q.sig = 'mmost:' + least + picks.join(',');
        return q;
      }
      var small = ils ? (L >= 4 ? [10, 50] : [100, 200, 500, 1000]) : (L >= 4 ? [1, 5, 10, 25] : [1, 5, 10]);
      var n = rng.int(2, L <= 2 ? 4 : 6);
      for (var i = 0; i < n; i++) vals.push(rng.pick(small));
      vals.sort(function (a, b) { return b - a; });
      total = U.sum(vals);
      if (!ils && total >= 100) return null;
      var inSub = !ils || L >= 4;
      q = { ui: 'input', prompt: t(inSub ? (ils ? 'q_money_ag' : 'q_money_cents') : 'q_money_count'), visual: coinsSvgRow(vals, cur), data: { kind: 'int', prefix: inSub ? null : C.sym, unit: inSub ? (ils ? t('unit_sub') : '¢') : null }, answer: inSub ? total : total / 100 };
    } else if (p.kind === 'bills') {
      var bills = C.bills.slice(0, L <= 2 ? 2 : 4), coins = ils ? [100, 200, 500, 1000] : [100];
      var nb = rng.int(1, L <= 2 ? 2 : 4), nc = rng.int(0, L <= 2 ? 1 : 3);
      for (var j = 0; j < nb; j++) vals.push(rng.pick(bills));
      for (var k = 0; k < nc; k++) vals.push(rng.pick(coins));
      vals.sort(function (a, b) { return b - a; });
      total = U.sum(vals);
      q = { ui: 'input', prompt: t('q_money_count'), visual: coinsSvgRow(vals, cur), data: { kind: 'int', prefix: C.sym }, answer: total / 100 };
    } else if (p.kind === 'make') {
      var coinSet = ils ? [100, 200, 500, 1000] : [1, 5, 10, 25], tgt;
      if (ils) tgt = rng.int(3, Math.min(p.max || 50, L <= 2 ? 15 : 50)) * 100; else tgt = rng.int(L <= 2 ? 5 : 30, 99);
      if (ils && L >= 4) coinSet = coinSet.concat([2000]);
      q = { ui: 'money', prompt: t('q_money_make', { amt: S.moneyLabel(tgt, cur) }), data: { cur: cur, coins: coinSet, target: tgt }, answer: tgt };
      total = tgt;
    } else {
      var price, paid;
      if (ils) { price = rng.int(2, (p.max || 20) - 1); paid = price <= 10 && L <= 2 ? 10 : 20; if (L >= 4 && price > 10) paid = rng.pick([20, 50]); q = { ui: 'input', prompt: t('q_change', { paid: G.money(paid), cost: G.money(price) }), data: { kind: 'int', prefix: C.sym }, answer: paid - price }; }
      else { price = rng.int(5, 95); paid = 100; q = { ui: 'input', prompt: t('q_change', { paid: '$1', cost: price + '¢' }), data: { kind: 'int', unit: '¢' }, answer: paid - price }; }
      q.hints = G.hintList(t('hc_change'), { text: m(price + ' + ? = ' + paid) });
      q.sig = 'chg:' + price + ':' + paid;
      return q;
    }
    q.hints = q.hints || G.hintList(t('hc_money'), { text: vals.length ? m(vals.map(function (v) { return S.moneyLabel(v, cur); }).join(' + ')) : '' });
    q.sig = 'money:' + p.kind + L + ':' + vals.join(',') + ':' + total;
    q.verify = function () { return !vals.length || U.sum(vals) === total; };
    return q;
  });
})(window.MA = window.MA || {});
