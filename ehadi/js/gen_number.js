/* Number sense generators: count, seq, recognize, writeNum, compare, order, oddEven, place, round, estimate, mental */
(function (MA) {
  'use strict';
  var G = MA.gen, S = MA.svg, f = G.fmt, t = function (k, p) { return MA.t(k, p); }, U = MA.u;
  var m = G.m = function (s) { return '\u2066' + s + '\u2069'; }; // keep math left-to-right inside Hebrew sentences
  var WORDS = {
    en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'],
    he: ['אפס', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר', 'אחת־עשרה', 'שתים־עשרה', 'שלוש־עשרה', 'ארבע־עשרה', 'חמש־עשרה', 'שש־עשרה', 'שבע־עשרה', 'שמונה־עשרה', 'תשע־עשרה', 'עשרים']
  };
  G.numWord = function (n) { return WORDS[G.lang()][n]; };
  var PLACES = ['o', 't', 'h', 'th', 'tth', 'hth'];
  var PV = [1, 10, 100, 1000, 10000, 100000];
  function placeName(i) { return t('pl_' + PLACES[i]); }
  function seqTokens(seq, blank) {
    var out = [];
    seq.forEach(function (v, i) { if (i) out.push(','); out.push(i === blank ? { blank: true } : f(v)); });
    return out;
  }

  MA.i18n.add({
    en: {
      q_count: 'How many {items} can you count?', q_count_tens: 'How many {items} are there? Count the tens first.', hc_tens_first: 'Count by tens: 10, 20, 30… then add the ones.',
      hc_tenframe: 'Ten-frames help: each full frame is 10.', q_seq_next: 'What number comes next?', q_seq_back: 'Count backward. What comes next?', q_seq_fill: 'Find the missing number',
      q_seq_rule: 'What is the rule of this pattern?', q_skip: 'Count by {n}s. What comes next?', hc_seq: 'Look at how much the numbers change each time.', hc_seq_step: 'Each jump is {s}.',
      rule_a: 'Add {n}', rule_s: 'Subtract {n}', rule_m: 'Multiply by {n}',
      q_find_num: 'Find the number "{w}"', q_which_word: 'Which word matches this number?', q_dots_num: 'How many dots? Choose the number.', q_match_words: 'Match each number to its word',
      q_write_word: 'Write the number: {w}', q_write_dots: 'Write the number you see', q_write_ten: 'Write the number: 1 ten and {o} ones',
      q_cmp: 'Compare. Choose the correct sign.', hc_cmp: 'The open side of the sign faces the bigger number.', q_greater: 'Which number is greater?', q_greatest: 'Which number is the greatest?',
      q_less: 'Which number is smaller?', q_least: 'Which number is the smallest?', q_equal_to: 'Which one is equal to {n}?', hc_bigger_digits: 'Compare from the left: the biggest place value first.',
      q_order_asc: 'Put the numbers in order from smallest to greatest', q_order_desc: 'Put the numbers in order from greatest to smallest', ord_small: 'smallest', ord_great: 'greatest',
      q_oe: 'Is {n} odd or even?', oe_odd: 'Odd', oe_even: 'Even', q_oe_sort: 'Sort the numbers: odd or even?', q_which_even: 'Which number is even?', q_which_odd: 'Which number is odd?',
      q_next_even: 'What is the next even number after {n}?', hc_pairs: 'Even numbers can be split into pairs with nothing left over. Look at the ones digit: 0, 2, 4, 6, 8 are even.',
      pl_o: 'ones', pl_t: 'tens', pl_h: 'hundreds', pl_th: 'thousands', pl_tth: 'ten thousands', pl_hth: 'hundred thousands',
      q_pv_build: 'Build the number {n} with blocks', q_pv_read: 'What number do the blocks show?', q_pv_tens_in: 'How many tens are in {n}?', q_pv_value: 'What is the value of the digit {d} in {n}?',
      q_pv_place: 'Which digit is in the {place} place of {n}?', q_pv_write: 'Write the number: {parts}', q_pv_chart: 'Write the number shown in the place-value chart',
      q_fill: 'Fill in the missing number', q_expanded: 'Which is the expanded form of {n}?', hc_pv: 'Each place is worth 10 times the place to its right.',
      q_round: 'Round {n} to the nearest {to}', q_round_which: 'Which number rounds to {r} when rounding to the nearest {to}?', hc_round: 'Look at the digit to the right. 5 or more rounds up, 4 or less rounds down.',
      rn_10: 'ten', rn_100: 'hundred', rn_1000: 'thousand', rn_10000: 'ten thousand',
      q_est_qty: 'About how many dots are there? Choose the best estimate.', q_est_closer: 'Is {n} closer to {a} or to {b}?', q_est_sum: 'Estimate by rounding each number to the nearest {to}:',
      q_est_quot: 'About how much is {e}? Choose the best estimate.', hc_est: 'Round to friendly numbers first, then calculate.', q_mental: 'Solve in your head:', hc_mental: 'Break the numbers into friendly parts.'
    },
    he: {
      q_count: 'כמה {items} אתם סופרים?', q_count_tens: 'כמה {items} יש? ספרו קודם את העשרות.', hc_tens_first: 'ספרו בעשרות: 10, 20, 30… ואז הוסיפו את היחידות.',
      hc_tenframe: 'מסגרות עשר עוזרות: כל מסגרת מלאה היא 10.', q_seq_next: 'איזה מספר בא אחר כך?', q_seq_back: 'סופרים אחורה. מה בא אחר כך?', q_seq_fill: 'מצאו את המספר החסר',
      q_seq_rule: 'מה החוק של הסדרה?', q_skip: 'סופרים בקפיצות של {n}. מה בא אחר כך?', hc_seq: 'בדקו בכמה המספרים משתנים בכל פעם.', hc_seq_step: 'כל קפיצה היא {s}.',
      rule_a: 'להוסיף {n}', rule_s: 'להחסיר {n}', rule_m: 'לכפול ב־{n}',
      q_find_num: 'מצאו את המספר "{w}"', q_which_word: 'איזו מילה מתאימה למספר?', q_dots_num: 'כמה נקודות? בחרו את המספר.', q_match_words: 'התאימו כל מספר למילה שלו',
      q_write_word: 'כתבו את המספר: {w}', q_write_dots: 'כתבו את המספר שאתם רואים', q_write_ten: 'כתבו את המספר: עשרת אחת ו־{o} יחידות',
      q_cmp: 'השוו. בחרו את הסימן המתאים.', hc_cmp: 'הצד הפתוח של הסימן פונה למספר הגדול.', q_greater: 'איזה מספר גדול יותר?', q_greatest: 'איזה מספר הכי גדול?',
      q_less: 'איזה מספר קטן יותר?', q_least: 'איזה מספר הכי קטן?', q_equal_to: 'מה שווה ל־{n}?', hc_bigger_digits: 'משווים משמאל: קודם את המקום עם הערך הגדול ביותר.',
      q_order_asc: 'סדרו את המספרים מהקטן לגדול', q_order_desc: 'סדרו את המספרים מהגדול לקטן', ord_small: 'הקטן', ord_great: 'הגדול',
      q_oe: 'האם {n} זוגי או אי־זוגי?', oe_odd: 'אי־זוגי', oe_even: 'זוגי', q_oe_sort: 'מיינו את המספרים: זוגי או אי־זוגי?', q_which_even: 'איזה מספר זוגי?', q_which_odd: 'איזה מספר אי־זוגי?',
      q_next_even: 'מהו המספר הזוגי הבא אחרי {n}?', hc_pairs: 'מספר זוגי אפשר לחלק לזוגות בלי שארית. הסתכלו על ספרת היחידות: 0, 2, 4, 6, 8 הן זוגיות.',
      pl_o: 'היחידות', pl_t: 'העשרות', pl_h: 'המאות', pl_th: 'האלפים', pl_tth: 'עשרות האלפים', pl_hth: 'מאות האלפים',
      q_pv_build: 'בנו את המספר {n} בעזרת קוביות', q_pv_read: 'איזה מספר מראות הקוביות?', q_pv_tens_in: 'כמה עשרות שלמות יש במספר {n}?', q_pv_value: 'מה הערך של הספרה {d} במספר {n}?',
      q_pv_place: 'מהי ספרת {place} במספר {n}?', q_pv_write: 'כתבו את המספר: {parts}', q_pv_chart: 'כתבו את המספר שמופיע בטבלת ערך המקום',
      q_fill: 'השלימו את המספר החסר', q_expanded: 'מהי הכתיבה המורחבת של {n}?', hc_pv: 'כל מקום שווה פי 10 מהמקום שמימינו.',
      q_round: 'עגלו את {n} ל{to}', q_round_which: 'איזה מספר מתעגל ל־{r} כשמעגלים ל{to}?', hc_round: 'הסתכלו על הספרה שמימין. 5 ומעלה מעגלים למעלה, 4 ומטה מעגלים למטה.',
      rn_10: 'עשרת הקרובה', rn_100: 'מאה הקרובה', rn_1000: 'אלף הקרוב', rn_10000: 'עשרת האלפים הקרובה',
      q_est_qty: 'בערך כמה נקודות יש? בחרו את האומדן הטוב ביותר.', q_est_closer: 'האם {n} קרוב יותר ל־{a} או ל־{b}?', q_est_sum: 'אמדו בעזרת עיגול כל מספר ל{to}:',
      q_est_quot: 'בערך כמה זה {e}? בחרו את האומדן הטוב ביותר.', hc_est: 'עגלו קודם למספרים נוחים, ואז חשבו.', q_mental: 'פתרו בראש:', hc_mental: 'פרקו את המספרים לחלקים נוחים.'
    }
  });
  /* the units-place word differs for "ones" in sentences like "4 tens and 5 ones" */
  MA.i18n.add({ en: { pw_o: 'ones', pw_t: 'tens', pw_h: 'hundreds', pw_th: 'thousands', pw_tth: 'ten thousands', pw_hth: 'hundred thousands' }, he: { pw_o: 'יחידות', pw_t: 'עשרות', pw_h: 'מאות', pw_th: 'אלפים', pw_tth: 'עשרות אלפים', pw_hth: 'מאות אלפים' } });

  /* ------------------------------------------------------------------ count */
  G.register('count', function (c) {
    var rng = c.rng, max = c.p.max || 20, it = G.item(rng), q;
    if (max <= 20) {
      var n = c.L([rng.int(1, 5), rng.int(3, 10), rng.int(6, Math.min(15, max)), rng.int(10, max), rng.int(11, max)]);
      var groups = [{ emoji: it.e, n: n, target: true }];
      if (c.level === 5) { var other = G.item(rng, function (x) { return x.e !== it.e; }); groups.push({ emoji: other.e, n: rng.int(2, 6) }); }
      var choice = c.level <= 2;
      q = { ui: 'count', prompt: t('q_count', { items: G.word(it, 2) }), data: { groups: groups, arrange: c.level >= 4 ? 'scatter' : 'rows', answerUi: choice ? 'choice' : 'input' }, answer: n, meta: { range: [0, max] } };
      if (choice) q.data.options = G.numOpts(n, rng, { n: 3, min: 1, max: max + 2, deltas: [1, -1, 2, -2] });
      q.hints = G.hintList(t('hc_count_one'), { text: t('hc_tenframe'), svg: S.tenFrame(n) }, { text: '🍎🍎🍎 → 3' });
      q.explain = { text: t('q_answer_is', { a: f(n) }), svg: S.tenFrame(n) };
      q.sig = 'count:' + it.e + n + (groups[1] ? groups[1].emoji + groups[1].n : '');
      q.verify = function () { return U.sum(groups.filter(function (g) { return g.target; }), function (g) { return g.n; }) === q.answer; };
      return q;
    }
    var n2 = c.L([rng.int(1, 10) * 10, rng.int(21, 59), rng.int(30, 99), rng.int(40, 99), rng.int(55, 100)]), tens = Math.floor(n2 / 10), ones = n2 % 10;
    q = { ui: c.level <= 2 ? 'choice' : 'input', prompt: t('q_count_tens', { items: G.word(it, 2) }), visual: S.baseTen(0, tens === 10 ? 1 : 0, tens === 10 ? 0 : tens, ones), data: { kind: 'int' }, answer: n2, meta: { range: [0, 100] } };
    if (q.ui === 'choice') q.data.options = G.numOpts(n2, rng, { deltas: [10, -10, 1, -1], min: 1, max: 100 });
    q.hints = G.hintList(t('hc_tens_first'), { text: t('q_answer_is', { a: '…' }).replace('…', m(U.range(1, Math.min(tens, 9) + 1).map(function (k) { return k * 10; }).join(', ') + (ones ? ' … +' + ones : ''))) }, { text: m('3 × 10 + 4 = 34') });
    q.explain = { text: m(tens * 10 + ' + ' + ones + ' = ' + n2) };
    q.sig = 'count100:' + n2;
    return q;
  });

  /* ------------------------------------------------------------------ seq */
  G.register('seq', function (c) {
    var rng = c.rng, p = c.p, mode = p.mode || 'next', steps = p.steps || [1];
    var stepIdx = steps.length > 1 ? rng.int(0, Math.min(steps.length - 1, Math.floor((c.level - 1) * steps.length / 4))) : 0, step = steps[stepIdx];
    var dir = p.dir === 0 ? (c.level >= 3 && rng.chance(.4) ? -1 : 1) : (p.dir || 1);
    var len = 5, span = step * (len - 1);
    // low levels still need room for about ten different sequences
    var lvlMax = Math.min(Math.max(p.max, span + step), Math.max(span + step * 6, Math.round(p.max * c.L([.15, .35, .6, .85, 1])), Math.min(p.max, span + 10)));
    if (p.mult && c.level >= 4 && rng.chance(.5)) {
      var ratio = rng.pick([2, 10]), st = ratio === 2 ? rng.int(1, 6) : rng.int(1, 9), gs = U.range(4).map(function (i) { return st * Math.pow(ratio, i); }), bi = 3;
      var qg = { ui: 'input', prompt: t('q_seq_fill'), data: { kind: 'int', eq: seqTokens(gs, bi) }, answer: gs[bi] };
      if (c.level === 5) { qg.ui = 'choice'; qg.prompt = t('q_seq_rule'); qg.data = { options: G.textOpts([['m' + ratio, t('rule_m', { n: ratio })], ['a' + (gs[1] - gs[0]), t('rule_a', { n: f(gs[1] - gs[0]) })], ['m' + (ratio === 2 ? 3 : 5), t('rule_m', { n: ratio === 2 ? 3 : 5 })]], rng), layout: 'col' }; qg.visual = '<div class="eq math">' + gs.map(f).join(', ') + ', …</div>'; qg.answer = 'm' + ratio; }
      qg.hints = G.hintList(t('hc_seq'), t('rule_m', { n: ratio }));
      qg.explain = { text: t('rule_m', { n: ratio }) };
      qg.sig = 'seqm:' + gs.join(',') + qg.ui;
      return qg;
    }
    var start = dir > 0 ? rng.int(0, Math.max(0, lvlMax - span)) : rng.int(span, Math.max(span, lvlMax));
    if (mode === 'skip' || (step >= 10 && c.level <= 2)) start = Math.round(start / step) * step;
    if (dir < 0 && start - span < 0) start = span;
    var seq = U.range(len).map(function (i) { return start + dir * i * step; });
    var blank = (mode === 'next' || mode === 'prev' || mode === 'skip' || c.level === 1) ? len - 1 : rng.int(1, len - 1);
    var ans = seq[blank], prompt = mode === 'skip' ? t('q_skip', { n: step }) : mode === 'prev' ? t('q_seq_back') : (blank === len - 1 ? t('q_seq_next') : t('q_seq_fill'));
    var q = { ui: c.level <= 1 ? 'choice' : 'input', prompt: prompt, data: { kind: 'int', eq: seqTokens(seq, blank) }, answer: ans, meta: { range: [0, p.max] } };
    if (q.ui === 'choice') { q.data.options = G.numOpts(ans, rng, { n: 3, deltas: [step, -step, 1, -1, 2 * step], min: 0, max: p.max + step * 2 }); q.visual = '<div class="eq math">' + seq.map(function (v, i) { return i === blank ? '?' : f(v); }).join(', ') + '</div>'; delete q.data.eq; delete q.data.kind; }
    if (mode === 'pattern' && c.level >= 4 && rng.chance(.5)) {
      q = { ui: 'choice', prompt: t('q_seq_rule'), visual: '<div class="eq math">' + seq.map(f).join(', ') + ', …</div>', answer: (dir > 0 ? 'a' : 's') + step };
      var alt = step === 1 ? 2 : (step >= 100 ? step / 2 : step * 2);
      q.data = { options: G.textOpts([[(dir > 0 ? 'a' : 's') + step, t(dir > 0 ? 'rule_a' : 'rule_s', { n: f(step) })], [(dir > 0 ? 's' : 'a') + step, t(dir > 0 ? 'rule_s' : 'rule_a', { n: f(step) })], [(dir > 0 ? 'a' : 's') + alt, t(dir > 0 ? 'rule_a' : 'rule_s', { n: f(alt) })]], rng), layout: 'col' };
    }
    q.hints = G.hintList(t('hc_seq'), { text: t('hc_seq_step', { s: (dir > 0 ? '+' : '−') + f(step) }), svg: seq[len - 1] <= 100 && seq[0] <= 100 ? S.numberLine({ min: Math.min(seq[0], seq[len - 1]), max: Math.max(seq[0], seq[len - 1]), step: step, hops: U.range(len - 1).map(function (i) { return { from: seq[i], to: seq[i + 1] }; }), width: 560 }) : null },
      { text: m('2, 4, 6, 8 → 10') });
    q.explain = { text: m(seq.map(f).join(', ')) };
    q.sig = 'seq:' + seq.join(',') + ':' + blank + q.ui;
    q.verify = function () { return U.range(1, len).every(function (i) { return seq[i] - seq[i - 1] === dir * step; }); };
    return q;
  });

  /* ------------------------------------------------------------------ recognize / writeNum */
  G.register('recognize', function (c) {
    var rng = c.rng, max = Math.min(20, c.p.max || 20), n = rng.int(c.level <= 2 ? 1 : 0, c.level <= 2 ? 10 : max), q;
    if (c.level === 5) {
      var nums = rng.sample(U.range(0, max + 1), 4);
      q = { ui: 'match', prompt: t('q_match_words'), data: { pairs: nums.map(function (v) { return { id: 'n' + v, left: { label: f(v) }, right: { label: G.numWord(v) } }; }) } };
      q.answer = {}; nums.forEach(function (v) { q.answer['n' + v] = 'n' + v; });
      q.sig = 'recogm:' + nums.join(',');
      q.hints = G.hintList(t('hc_read_again'));
      return q;
    }
    var near = function () { return G.numOpts(n, rng, { n: c.level === 1 ? 3 : 4, min: 0, max: max, deltas: [1, -1, 2, -2, 10, -10] }); };
    if (c.level === 1 || c.level === 4) { q = { ui: 'choice', prompt: t('q_dots_num'), visual: n <= 6 && c.level === 1 ? S.dice(n) : S.tenFrame(n), data: { options: near() }, answer: n }; }
    else if (c.level === 2) { q = { ui: 'choice', prompt: t('q_find_num', { w: G.numWord(n) }), data: { options: near() }, answer: n }; }
    else { var o = near(); o.forEach(function (x) { x.label = G.numWord(x.v); }); q = { ui: 'choice', prompt: t('q_which_word'), visual: '<div class="eq math">' + f(n) + '</div>', data: { options: o, layout: 'two' }, answer: n }; }
    q.hints = G.hintList(t('hc_count_one'), { text: G.numWord(n) + ' = ' + n, svg: S.tenFrame(n) });
    q.sig = 'recog:' + c.level + ':' + n;
    return q;
  });
  G.register('writeNum', function (c) {
    var rng = c.rng, n, q = { ui: 'input', data: { kind: 'int' } };
    if (c.level === 1) { n = rng.int(0, 10); q.prompt = t('q_write_word', { w: G.numWord(n) }); }
    else if (c.level === 2) { n = rng.int(1, 10); q.prompt = t('q_write_dots'); q.visual = S.tenFrame(n); }
    else if (c.level === 3) { n = rng.int(11, 20); q.prompt = t('q_write_word', { w: G.numWord(n) }); }
    else if (c.level === 4) { n = rng.int(11, 20); q.prompt = t('q_write_dots'); q.visual = S.tenFrame(n); }
    else { var o = rng.int(2, 9); n = 10 + o; q.prompt = t('q_write_ten', { o: o }); q.visual = S.baseTen(0, 0, 1, o); }
    q.answer = n;
    q.hints = G.hintList(t('hc_tenframe'), { text: G.numWord(n), svg: S.tenFrame(n) });
    q.explain = { text: G.numWord(n) + ' = ' + n };
    q.sig = 'write:' + c.level + ':' + n;
    return q;
  });

  /* ------------------------------------------------------------------ compare / order */
  function bigPair(rng, max, close) {
    var a = rng.int(Math.floor(max / 10), max), b;
    if (close && a >= 100) { var d = String(a).length, cut = rng.int(1, Math.max(1, d - 2)), pw = Math.pow(10, d - cut - 1); b = Math.floor(a / (pw * 10)) * pw * 10 + rng.int(0, pw * 10 - 1); }
    else if (close) b = a + rng.pick([-3, -2, -1, 1, 2, 3]);
    else b = rng.int(0, max);
    return [a, U.clamp(b, 0, max)];
  }
  G.register('compare', function (c) {
    var rng = c.rng, p = c.p, max = Math.max(5, Math.round(p.max * c.L([.5, .7, 1, 1, 1]))), q;
    if (p.focus === 'greater' || p.focus === 'less') {
      var cnt = c.level >= 4 ? 4 : c.level >= 2 ? 3 : 2, nums = [];
      while (nums.length < cnt) { var v = rng.int(0, max); if (nums.indexOf(v) < 0) nums.push(v); }
      var ans = p.focus === 'greater' ? Math.max.apply(null, nums) : Math.min.apply(null, nums);
      q = { ui: 'choice', prompt: t(p.focus === 'greater' ? (cnt > 2 ? 'q_greatest' : 'q_greater') : (cnt > 2 ? 'q_least' : 'q_less')), data: { options: nums.map(function (x) { return { v: x, label: f(x) }; }) }, answer: ans };
      if (c.level === 1 && max <= 20) q.data.options.forEach(function (o) { o.html = '<div>' + S.dots(o.v, { per: 5 }) + '</div><div>' + f(o.v) + '</div>'; delete o.label; });
      q.hints = G.hintList(t('hc_bigger_digits'), { text: t('hc_cmp'), svg: max <= 100 ? S.numberLine({ min: 0, max: Math.max(10, Math.ceil(Math.max.apply(null, nums) / 10) * 10), step: max <= 20 ? 1 : 10, marks: nums.map(function (x, i) { return { v: x, label: f(x), color: S.COLORS[i] }; }), width: 560 }) : null });
      q.sig = 'cmpf:' + nums.join(',');
      return q;
    }
    if (p.focus === 'equal') {
      var n = rng.int(2, Math.max(4, max)), a1 = rng.int(0, n), good = a1 + ' + ' + (n - a1), opts = [{ v: 'g', label: good }], used = {}; used[good] = 1;
      while (opts.length < (c.level >= 3 ? 4 : 3)) { var s = rng.int(Math.max(0, n - 3), n + 3), a2 = rng.int(0, s), e = a2 + ' + ' + (s - a2); if (s !== n && !used[e]) { used[e] = 1; opts.push({ v: 'b' + opts.length, label: e }); } }
      opts.forEach(function (o) { o.label = '\u2066' + o.label + '\u2069'; });
      q = { ui: 'choice', prompt: t('q_equal_to', { n: n }), data: { options: rng.shuffle(opts) }, answer: 'g' };
      q.hints = G.hintList(t('hc_read_again'), { text: m(good + ' = ' + n) });
      q.sig = 'cmpeq:' + n + ':' + good;
      return q;
    }
    var pair = bigPair(rng, max, c.level >= 4), a = pair[0], b = pair[1];
    if (rng.chance(.12)) b = a;
    var sign = a < b ? '<' : a > b ? '>' : '=';
    q = { ui: 'compare', prompt: t('q_cmp'), data: { left: f(a), right: f(b) }, answer: sign };
    if (c.level === 5 && p.max <= 100) {
      var x = rng.int(1, Math.min(9, a)), le = '\u2066' + x + ' + ' + (a - x) + '\u2069';
      q.data.left = le; q.data.leftExpr = true;
    }
    if (c.level === 1 && max <= 20) { q.data.leftHtml = S.dots(a, { per: 5, width: 110 }) + '<div>' + f(a) + '</div>'; q.data.rightHtml = S.dots(b, { per: 5, width: 110, color: '#3BB7F0' }) + '<div>' + f(b) + '</div>'; }
    q.hints = G.hintList(t('hc_cmp'), { text: t('hc_bigger_digits'), svg: max <= 100 ? S.numberLine({ min: 0, max: Math.max(10, Math.ceil(Math.max(a, b) / 10) * 10), step: Math.max(a, b) <= 20 ? 1 : 10, marks: [{ v: a, label: f(a) }, { v: b, label: f(b), color: '#3BB7F0' }], width: 560 }) : null }, { text: m('3 < 7, 9 > 2, 5 = 5') });
    q.explain = { text: m(f(a) + ' ' + sign + ' ' + f(b)) };
    q.sig = 'cmp:' + a + sign + b + (q.data.leftExpr ? 'e' : '');
    q.verify = function () { return (a < b && q.answer === '<') || (a > b && q.answer === '>') || (a === b && q.answer === '='); };
    return q;
  });
  G.register('order', function (c) {
    var rng = c.rng, p = c.p, max = Math.max(10, Math.round(p.max * c.L([.4, .7, 1, 1, 1])));
    if (p.max >= 10000 && c.level <= 2) {
      var pr = bigPair(rng, max, c.level === 2), a = pr[0], b = pr[1] === pr[0] ? pr[0] + 1 : pr[1];
      return { ui: 'compare', prompt: t('q_cmp'), data: { left: f(a), right: f(b) }, answer: a < b ? '<' : '>', hints: G.hintList(t('hc_bigger_digits')), sig: 'ordcmp:' + a + ':' + b };
    }
    var cnt = (p.count || 3) + (c.level >= 4 ? 1 : 0), nums = [], base = rng.int(0, max);
    while (nums.length < cnt) {
      var v = c.level >= 4 && max >= 1000 ? U.clamp(base + rng.int(-Math.round(max / 20), Math.round(max / 20)), 0, max) : rng.int(0, max);
      if (nums.indexOf(v) < 0) nums.push(v);
    }
    var desc = c.level === 5 || p.dir === 'desc';
    var sorted = nums.slice().sort(function (x, y) { return desc ? y - x : x - y; });
    var q = { ui: 'order', prompt: t(desc ? 'q_order_desc' : 'q_order_asc'), data: { items: rng.shuffle(nums).map(function (x) { return { v: x, label: f(x) }; }), dir: desc ? 'desc' : 'asc', startLabel: t(desc ? 'ord_great' : 'ord_small'), endLabel: t(desc ? 'ord_small' : 'ord_great') }, answer: sorted };
    q.hints = G.hintList(t('hc_bigger_digits'), { text: m(sorted.map(f).join(desc ? ' > ' : ' < ').replace(/\S+$/, '…')) });
    q.explain = { text: m(sorted.map(f).join(desc ? ' > ' : ' < ')) };
    q.sig = 'ord:' + nums.slice().sort().join(',') + desc;
    return q;
  });

  /* ------------------------------------------------------------------ odd / even */
  G.register('oddEven', function (c) {
    var rng = c.rng, max = c.p.max || 20, q, oe = function (n) { return n % 2 ? 'odd' : 'even'; };
    var opts = function () { return G.textOpts([['odd', t('oe_odd')], ['even', t('oe_even')]], rng); };
    if (c.level === 1) { var n1 = rng.int(2, 12); q = { ui: 'choice', prompt: t('q_oe', { n: n1 }), visual: S.dots(n1, { per: 2 }), data: { options: opts(), layout: 'two' }, answer: oe(n1) }; q.sig = 'oe1:' + n1; }
    else if (c.level === 2) { var n2 = rng.int(1, Math.min(20, max)); q = { ui: 'choice', prompt: t('q_oe', { n: n2 }), data: { options: opts(), layout: 'two' }, answer: oe(n2) }; q.sig = 'oe2:' + n2; }
    else if (c.level === 3 || c.level === 5) {
      var cnt = c.level === 3 ? 6 : 8, nums = rng.sample(U.range(1, Math.max(cnt + 2, c.level === 3 ? Math.min(30, max) : max) + 1), cnt);
      q = { ui: 'sort', prompt: t('q_oe_sort'), data: { bins: [{ id: 'even', label: t('oe_even') }, { id: 'odd', label: t('oe_odd') }], items: nums.map(function (n) { return { id: 'i' + n, label: f(n), bin: oe(n) }; }) } };
      q.answer = {}; nums.forEach(function (n) { q.answer['i' + n] = oe(n); });
      q.sig = 'oes:' + nums.slice().sort().join(',');
    } else {
      var wantEven = rng.chance(.5), pool = U.range(1, Math.min(max, 100) + 1), good = rng.pick(pool.filter(function (n) { return (n % 2 === 0) === wantEven; }));
      var bad = rng.sample(pool.filter(function (n) { return (n % 2 === 0) !== wantEven; }), 3);
      q = { ui: 'choice', prompt: t(wantEven ? 'q_which_even' : 'q_which_odd'), data: { options: rng.shuffle([good].concat(bad)).map(function (n) { return { v: n, label: f(n) }; }) }, answer: good };
      q.sig = 'oe4:' + good + ':' + bad.join(',');
    }
    q.hints = G.hintList(t('hc_pairs'), { text: '🧦🧦 🧦🧦 🧦 → ' + t('oe_odd'), svg: S.dots(7, { per: 2 }) });
    q.explain = { text: t('hc_pairs') };
    return q;
  });

  /* ------------------------------------------------------------------ place value */
  function digitsAt(n) { var d = []; for (var i = 0; i < 6; i++) d.push(Math.floor(n / PV[i]) % 10); return d; }
  function placesFor(max) { return max <= 99 ? 2 : max <= 999 ? 3 : max <= 9999 ? 4 : max <= 99999 ? 5 : 6; }
  function partsText(n, k) { var d = digitsAt(n), out = []; for (var i = k - 1; i >= 0; i--) out.push(d[i] + ' ' + t('pw_' + PLACES[i])); return out.join(', '); }
  function chartHTML(n, k) {
    var d = digitsAt(n), th = '', td = '';
    for (var i = k - 1; i >= 0; i--) { th += '<th>' + U.esc(t('pw_' + PLACES[i])) + '</th>'; td += '<td>' + d[i] + '</td>'; }
    return '<table class="table pv-chart math" style="max-width:520px;font-size:1.2em;text-align:center"><tr>' + th + '</tr><tr style="font-size:1.4em;font-weight:800">' + td + '</tr></table>';
  }
  G.register('place', function (c) {
    var rng = c.rng, p = c.p, kind = p.kind, q, k;
    if (kind === 'tensones') {
      var o = rng.int(c.level <= 2 ? 1 : 0, 9), n = 10 + o;
      if (c.level === 1) q = { ui: 'choice', prompt: t('q_pv_read'), visual: S.baseTen(0, 0, 1, o), data: { options: G.numOpts(n, rng, { n: 3, min: 10, max: 20, deltas: [1, -1, 2] }) }, answer: n };
      else if (c.level === 3) q = { ui: 'placevalue', prompt: t('q_pv_build', { n: n }), data: { places: ['t', 'o'], target: n }, answer: n };
      else if (c.level === 2 || c.level === 5) q = { ui: 'input', prompt: t('q_fill'), data: { kind: 'int', eq: [f(n), '=', '1', t('pw_t'), '+', { blank: true }, t('pw_o')] }, answer: o };
      else q = { ui: 'input', prompt: t('q_fill'), data: { kind: 'int', eq: ['10', '+', String(o), '=', { blank: true }] }, answer: n };
      q.hints = G.hintList(t('hc_pv'), { text: m('10 + ' + o + ' = ' + n), svg: S.baseTen(0, 0, 1, o) });
      q.sig = 'pv1:' + c.level + ':' + n;
      return q;
    }
    var max = p.max || 99;
    // a round max (1000, 10000) is the top of the range, not the digit count: 1000 means numbers with 3 digits
    k = placesFor(Math.min(max - 1, c.level <= 2 && max > 999 ? 9999 : max));
    var lo = Math.pow(10, k - 1), num = rng.int(lo, Math.min(max, Math.pow(10, k) - 1)), d = digitsAt(num);
    if (kind === 'build') {
      if (c.level === 1 || c.level === 4) q = { ui: 'choice', prompt: t('q_pv_read'), visual: S.baseTen(0, d[2], d[1], d[0]), data: { options: G.numOpts(num, rng, { deltas: [10, -10, 1, -1, 100], min: 1, max: Math.max(99, max) }) }, answer: num };
      else if (c.level === 2) q = { ui: 'placevalue', prompt: t('q_pv_build', { n: f(num) }), data: { places: k >= 3 ? ['h', 't', 'o'] : ['t', 'o'], target: num }, answer: num };
      else if (c.level === 3) q = { ui: 'input', prompt: t('q_pv_tens_in', { n: f(num) }), data: { kind: 'int' }, answer: Math.floor(num / 10) };
      else { var tn = d[1] > 0 ? d[1] - 1 : d[1], rest = num - tn * 10 - d[2] * 100; q = { ui: 'input', prompt: t('q_fill'), data: { kind: 'int', eq: [f(num), '=', (d[2] ? d[2] + ' ' + t('pw_h') + ' +' : ''), tn + ' ' + t('pw_t'), '+', { blank: true }, t('pw_o')].filter(Boolean) }, answer: rest }; }
      q.hints = G.hintList(t('hc_pv'), { text: partsText(num, k), svg: num < 1000 ? S.baseTen(0, d[2], d[1], d[0]) : null });
      q.sig = 'pvb:' + c.level + ':' + num;
      return q;
    }
    if (kind === 'read') {
      if (k <= 3 && c.level <= 2) q = { ui: 'choice', prompt: t('q_pv_read'), visual: S.baseTen(0, d[2], d[1], d[0]), data: { options: G.numOpts(num, rng, { deltas: [100, -100, 10, -10, 1], min: 1, max: 1000 }) }, answer: num };
      else if (c.level % 2) q = { ui: 'input', prompt: t('q_pv_chart'), visual: chartHTML(num, k), data: { kind: 'int' }, answer: num };
      else q = { ui: 'input', prompt: t('q_pv_write', { parts: partsText(num, k) }), data: { kind: 'int' }, answer: num };
      if (c.level === 5 && k >= 4) { var z = rng.int(1, k - 2); num = num - d[z] * PV[z]; q = { ui: 'input', prompt: t('q_pv_write', { parts: partsText(num, k) }), data: { kind: 'int' }, answer: num }; }
      q.hints = G.hintList(t('hc_pv'), { text: partsText(num, k), svg: k >= 4 ? null : S.baseTen(0, digitsAt(num)[2], digitsAt(num)[1], digitsAt(num)[0]) });
      q.sig = 'pvr:' + c.level + ':' + num;
      return q;
    }
    if (kind === 'digit') {
      var places = U.range(k).filter(function (i) { return d.slice(0, k).filter(function (x) { return x === d[i]; }).length === 1 && d[i] > 0; });
      if (!places.length) return null;
      var pi = rng.pick(places);
      if (c.level % 2 === 1) {
        var vals = U.uniq([d[pi] * PV[pi], d[pi], d[pi] * PV[Math.min(5, pi + 1)], d[pi] * PV[Math.max(0, pi - 1)], d[pi] * PV[Math.min(5, pi + 2)]]).slice(0, 4);
        q = { ui: 'choice', prompt: t('q_pv_value', { d: d[pi], n: f(num) }), data: { options: rng.shuffle(vals).map(function (v) { return { v: v, label: f(v) }; }) }, answer: d[pi] * PV[pi] };
      } else q = { ui: 'input', prompt: t('q_pv_place', { place: placeName(pi), n: f(num) }), data: { kind: 'int' }, answer: d[pi] };
      q.hints = G.hintList(t('hc_pv'), { text: '', svg: null }, null);
      q.hints = G.hintList(t('hc_pv'), { text: chartHTML ? partsText(num, k) : '' });
      q.visual = c.level >= 3 ? null : chartHTML(num, k);
      q.sig = 'pvd:' + c.level + ':' + num + ':' + pi;
      return q;
    }
    if (kind === 'decompose' || kind === 'expanded') {
      var terms = U.range(k).map(function (i) { return d[i] * PV[i]; }).reverse();
      if (kind === 'expanded' && c.level % 2 === 0) {
        var good = terms.filter(Boolean).map(f).join(' + '), opts = [{ v: 'g', label: '\u2066' + good + '\u2069' }];
        var b1 = terms.filter(Boolean).map(function (x) { return f(x / 10 >= 1 ? x / 10 : x * 10); }).join(' + ');
        var b2 = terms.filter(Boolean).map(function (x) { return f(String(x).replace(/0+$/, '') * 1); }).join(' + ');
        var b3 = terms.filter(Boolean).map(function (x, i, a) { return f(i === 0 ? x * 10 : x); }).join(' + ');
        [b1, b2, b3].forEach(function (b, i) { if (b !== good && !opts.some(function (o) { return o.label === '\u2066' + b + '\u2069'; })) opts.push({ v: 'b' + i, label: '\u2066' + b + '\u2069' }); });
        if (opts.length < 2) return null;
        q = { ui: 'choice', prompt: t('q_expanded', { n: f(num) }), data: { options: rng.shuffle(opts), layout: 'col' }, answer: 'g' };
      } else {
        var nz = U.range(k).filter(function (i) { return d[i] > 0 && i < k - 1; });
        if (!nz.length) return null;
        var bi = rng.pick(nz), tk = [f(num), '='], ans = d[bi] * PV[bi], parts = terms.slice();
        if (c.level >= 4 && kind === 'decompose' && d[k - 1] > 1) {
          parts[0] = (d[k - 1] - 1) * PV[k - 1];
          var rem = num - parts[0];
          tk = [f(num), '=', f(parts[0]), '+', { blank: true }];
          q = { ui: 'input', prompt: t('q_fill'), data: { kind: 'int', eq: tk }, answer: rem };
        } else {
          parts.forEach(function (x, i) { var idx = k - 1 - i; if (!x && idx !== bi) return; if (tk.length > 2) tk.push('+'); tk.push(idx === bi ? { blank: true } : f(x)); });
          q = { ui: 'input', prompt: t('q_fill'), data: { kind: 'int', eq: tk }, answer: ans };
        }
      }
      q.hints = G.hintList(t('hc_pv'), { text: partsText(num, k), svg: null });
      q.explain = { text: m(f(num) + ' = ' + terms.filter(Boolean).map(f).join(' + ')) };
      q.sig = 'pvx:' + kind + c.level + ':' + num + JSON.stringify(q.answer);
      q.verify = function () { return U.sum(terms) === num; };
      return q;
    }
    return null;
  });

  /* ------------------------------------------------------------------ rounding / estimation / mental */
  function roundTo(n, to) { return Math.floor((n + to / 2) / to) * to; }
  G.round = roundTo;
  G.register('round', function (c) {
    var rng = c.rng, p = c.p, tos = p.to || [10], to = tos[Math.min(tos.length - 1, Math.floor((c.level - 1) * tos.length / 5))];
    var max = Math.max(to * 10, Math.min(p.max, to * c.L([10, 30, 100, 100, 100])));
    var n = rng.int(to + 1, max - 1);
    if (n % to === 0) n += rng.int(1, to - 1);
    var r = roundTo(n, to), q, lo = Math.floor(n / to) * to;
    if (c.level === 5) {
      var target = roundTo(rng.int(to * 2, max - to), to), good = target + rng.int(-Math.floor(to / 2), Math.floor((to - 1) / 2));
      var bads = [target - to + rng.int(-Math.floor(to / 2), Math.floor((to - 1) / 2)), target + to + rng.int(-Math.floor(to / 2), Math.floor((to - 1) / 2)), target + Math.ceil(to / 2) + rng.int(0, Math.floor(to / 2) - 1)];
      var opts = U.uniq([good].concat(bads)).filter(function (x) { return x > 0; });
      q = { ui: 'choice', prompt: t('q_round_which', { r: f(target), to: t('rn_' + to) }), data: { options: rng.shuffle(opts).map(function (x) { return { v: x, label: f(x) }; }) }, answer: good, check: function (a) { return roundTo(a, to) === target; } };
      q.sig = 'rnd5:' + good + ':' + to;
    } else {
      q = { ui: c.level <= 2 ? 'choice' : 'input', prompt: t('q_round', { n: f(n), to: t('rn_' + to) }), data: { kind: 'int' }, answer: r };
      if (q.ui === 'choice') { q.data.options = U.uniq([lo, lo + to, r, lo - to > 0 ? lo - to : lo + 2 * to]).map(function (x) { return { v: x, label: f(x) }; }); q.data.options = rng.shuffle(q.data.options); }
      q.sig = 'rnd:' + n + ':' + to;
    }
    q.hints = G.hintList(t('hc_round'), { text: m(f(lo) + ' … ' + f(n) + ' … ' + f(lo + to)), svg: S.numberLine({ min: lo, max: lo + to, step: to / 10, labelEvery: 5, marks: [{ v: n, label: f(n) }], width: 560 }) });
    q.explain = { text: m(f(n) + ' → ' + f(r)) };
    return q;
  });
  G.register('estimate', function (c) {
    var rng = c.rng, p = c.p, kind = p.kind, q;
    if (kind === 'mixed') kind = rng.pick(p.max >= 10000 && c.level >= 4 ? ['sum', 'diff', 'product'] : ['sum', 'diff']);
    if (kind === 'quantity') {
      if (c.level <= 2) {
        var n = c.level === 1 ? rng.pick([10, 20, 30]) + rng.int(-2, 2) : rng.pick([20, 30, 50]) + rng.int(-3, 3), best = roundTo(n, 10);
        var choices = U.uniq([best, Math.max(1, Math.round(best / 4)), best * 3]).map(function (x) { return { v: x, label: f(x) }; });
        q = { ui: 'choice', prompt: t('q_est_qty'), visual: S.dots(n, { per: 10, width: 300 }), data: { options: rng.shuffle(choices) }, answer: best };
        q.sig = 'estq:' + n;
      } else {
        var tt = rng.int(1, 9) * 10 + (c.level === 5 ? 100 * rng.int(0, 1) : 0), o = rng.pick([1, 2, 3, 4, 6, 7, 8, 9]), x = tt + o, a = tt, b = tt + 10, near = o < 5 ? a : b;
        q = { ui: 'choice', prompt: t('q_est_closer', { n: x, a: a, b: b }), data: { options: [{ v: a, label: f(a) }, { v: b, label: f(b) }], layout: 'two' }, answer: near };
        q.hints = G.hintList(t('hc_round'), { text: '', svg: S.numberLine({ min: a, max: b, step: 1, marks: [{ v: x, label: f(x) }], width: 560 }) });
        q.sig = 'estc:' + x;
      }
      if (!q.hints) q.hints = G.hintList(t('hc_est'));
      return q;
    }
    if (kind === 'quotient') {
      var dv = rng.int(2, 9), qm = rng.int(2, 9) * (c.level >= 3 ? 10 : 1), nice = dv * qm, shown = nice + rng.pick([-3, -2, -1, 1, 2, 3]) * (qm >= 10 ? 2 : 1);
      if (shown % dv === 0) shown += 1;
      var opts = U.uniq([qm, qm * 10, Math.max(1, Math.round(qm / 10)) === qm ? qm + 5 : Math.max(1, Math.round(qm / 10)), qm * 2]).slice(0, 4);
      q = { ui: 'choice', prompt: t('q_est_quot', { e: m(f(shown) + ' ÷ ' + dv) }), data: { options: rng.shuffle(opts).map(function (v) { return { v: v, label: f(v) }; }) }, answer: qm };
      q.hints = G.hintList(t('hc_est'), { text: m(f(shown) + ' ≈ ' + f(nice) + ', ' + f(nice) + ' ÷ ' + dv + ' = ' + qm) });
      q.sig = 'estd:' + shown + ':' + dv;
      return q;
    }
    var to = p.max >= 10000 && c.level >= 4 ? 1000 : p.max >= 1000 && c.level >= 3 ? 100 : 10;
    var hi = Math.min(p.max, to * c.L([9, 30, 60, 90, 99])), A = rng.int(to + 1, hi), B = rng.int(to + 1, hi);
    if (kind === 'product') { A = rng.int(to + 1, Math.min(hi, to * 9)); B = rng.int(3, 9); }
    if (kind === 'diff' && B > A) { var tmp = A; A = B; B = tmp; }
    var rA = roundTo(A, to), rB = kind === 'product' ? B : roundTo(B, to), est = kind === 'sum' ? rA + rB : kind === 'diff' ? rA - rB : rA * rB, op = kind === 'sum' ? '+' : kind === 'diff' ? '−' : '×';
    q = { ui: 'input', prompt: t('q_est_sum', { to: t('rn_' + to) }), data: { kind: 'int', eq: [f(A), op, f(B), '≈', { blank: true }] }, answer: est };
    q.hints = G.hintList(t('hc_est'), { text: m(f(A) + ' → ' + f(rA) + (kind === 'product' ? '' : ', ' + f(B) + ' → ' + f(rB))) });
    q.explain = { text: m(f(rA) + ' ' + op + ' ' + f(rB) + ' = ' + f(est)) };
    q.sig = 'est:' + kind + A + ':' + B;
    q.verify = function () { return est === (kind === 'sum' ? rA + rB : kind === 'diff' ? rA - rB : rA * rB); };
    return q;
  });
  G.register('mental', function (c) {
    var rng = c.rng, p = c.p, ops = p.ops || ['+', '-'], op = rng.pick(ops.slice(0, Math.max(1, Math.min(ops.length, c.level)))), a, b, ans, tip;
    var big = p.max >= 10000 && c.level >= 3 ? 1000 : p.max >= 1000 ? 100 : 10;
    if (op === '+') {
      var form = rng.int(0, 2);
      if (form === 0) { a = rng.int(1, 9) * big; b = rng.int(1, 9) * big; }
      else if (form === 1) { a = rng.int(10, 99) * (big / 10); b = (rng.int(1, 9) * big) - (big / 10 < 1 ? 1 : big / 10); }
      else { a = big * rng.int(1, 8) - rng.int(1, 3); b = rng.int(11, 89); }
      ans = a + b; tip = m(f(a) + ' + ' + f(b) + ' = ' + f(ans));
    } else if (op === '-') { a = rng.int(2, 9) * big + rng.int(0, 9) * (big / 10 >= 1 ? big / 10 : 1); b = rng.int(1, Math.floor(a / big)) * big - (rng.chance(.4) ? Math.max(1, big / 100) : 0); if (b <= 0 || b >= a) b = big; ans = a - b; tip = m(f(a) + ' − ' + f(b) + ' = ' + f(ans)); }
    else if (op === '×') { a = rng.pick([25, 50, 20, 40, 15, 12, 11]); b = rng.pick([2, 3, 4, 5, 6]) * (rng.chance(.3) ? 10 : 1); ans = a * b; tip = m(f(a) + ' × ' + f(b) + ' = ' + f(ans)); }
    else { b = rng.int(2, 9); ans = rng.int(2, 9) * (rng.chance(.5) ? 10 : 100); a = ans * b; tip = m(f(a) + ' ÷ ' + b + ' = ' + f(ans)); }
    var sym = op === '-' ? '−' : op;
    var q = { ui: 'input', prompt: t('q_mental'), data: { kind: 'int', eq: [f(a), sym, f(b), '=', { blank: true }] }, answer: ans };
    q.hints = G.hintList(t('hc_mental'), { text: tip.replace(f(ans), '?') });
    q.explain = { text: tip };
    q.sig = 'mental:' + a + sym + b;
    q.verify = function () { return op === '+' ? a + b === ans : op === '-' ? a - b === ans : op === '×' ? a * b === ans : a / b === ans; };
    return q;
  });
})(window.MA = window.MA || {});
