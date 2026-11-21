/* Operations: add, sub, addsub, factfam, column, word, mul, div, distrib */
(function (MA) {
  'use strict';
  var G = MA.gen, S = MA.svg, f = G.fmt, t = function (k, p) { return MA.t(k, p); }, U = MA.u, m = G.m;

  MA.i18n.add({
    en: {
      q_add_all: 'How many {items} are there altogether?', q_sub_left: 'How many {items} are left?', q_nl_add: 'Start at {a} and jump {b} forward. Where do you land?',
      q_nl_sub: 'Start at {a} and jump {b} back. Where do you land?', q_col: 'Solve in columns', q_fact_fam: 'Use the fact {fact} to solve:', q_fact_which: 'Which fact belongs to the family of {a}, {b} and {c}?',
      q_mul_rep: 'Write the repeated addition as multiplication', q_mul_make: 'Make {g} bags with {p} in each bag', q_div_share: 'Share {n} equally into {g} bags',
      q_arr_build: 'Build an array: {r} rows with {c} in each row', q_arr_read: 'How many dots are in the array?', q_arr_which: 'Which array shows {e}?', q_groups_total: 'How many {items} are there in all the bags?',
      q_div_groups: 'How many groups of {b} can you make from {a}?', q_equal_groups: 'Are all the groups equal?', q_equal_which: 'Which picture shows {a} shared equally into {b} groups?',
      q_quotient: 'What is the quotient?', q_rem: 'Divide. What is the remainder?', q_rem_q: 'Divide. What is the quotient?', q_rem_choose: 'Divide and choose the answer', rem_sym: 'R',
      q_mul_strat: 'Use a strategy to fill in the blank', q_area_model: 'Use the area model to multiply', q_area_part: 'What is the product in the {c} part?', q_distrib: 'Split the number to multiply easily',
      q_word_solve: 'Solve the story', area_col: 'colored',
      hc_count_on: 'Start at the bigger number and count on.', hc_make10: 'Make a ten first: {eq}', hc_place_add: 'Add ones to ones and tens to tens.', hc_carry: 'If a column adds up to 10 or more, carry 1 to the next column.',
      hc_sub_back: 'Start at {a} and count back {b}.', hc_sub_up: 'Count up from {b} to {a}.', hc_borrow: 'Not enough ones? Break one ten into 10 ones.',
      hc_missing_add: 'Think: what do I add to {a} to get {c}?', hc_missing_sub: 'Use addition to check: {e}', hc_mul_groups: '{a} groups of {b}: add {b} again and again.',
      hc_mul_array: 'Count the rows, then how many are in each row.', hc_div_share: 'Share one at a time until everything is shared.', hc_div_fact: 'Think of multiplication: {e}',
      hc_rem: 'Find the biggest multiple of {b} that fits in {a}. What is left over?', hc_word: 'What do you need to find? Will the answer be bigger or smaller?', hc_word2: 'Solve it in two steps: first one part, then the rest.',
      hc_strat: 'Use a fact you already know and adjust it.', hc_long: 'Divide one place at a time, starting from the left.', hc_fam: 'Three numbers make a fact family: the two parts and the whole.'
    },
    he: {
      q_add_all: 'כמה {items} יש בסך הכול?', q_sub_left: 'כמה {items} נשארו?', q_nl_add: 'התחילו ב־{a} וקפצו {b} קדימה. לאן הגעתם?',
      q_nl_sub: 'התחילו ב־{a} וקפצו {b} אחורה. לאן הגעתם?', q_col: 'פתרו במאונך', q_fact_fam: 'היעזרו בעובדה {fact} כדי לפתור:', q_fact_which: 'איזה תרגיל שייך למשפחה של {a}, {b} ו־{c}?',
      q_mul_rep: 'כתבו את החיבור החוזר כתרגיל כפל', q_mul_make: 'הכינו {g} שקיות, ובכל שקית {p}', q_div_share: 'חלקו {n} שווה בשווה ל־{g} שקיות',
      q_arr_build: 'בנו מערך: {r} שורות ו־{c} בכל שורה', q_arr_read: 'כמה נקודות יש במערך?', q_arr_which: 'איזה מערך מראה {e}?', q_groups_total: 'כמה {items} יש בכל השקיות יחד?',
      q_div_groups: 'כמה קבוצות של {b} אפשר ליצור מ־{a}?', q_equal_groups: 'האם כל הקבוצות שוות?', q_equal_which: 'איזה ציור מראה {a} מחולקים שווה בשווה ל־{b} קבוצות?',
      q_quotient: 'מהי המנה?', q_rem: 'חלקו. מהי השארית?', q_rem_q: 'חלקו. מהי המנה?', q_rem_choose: 'חלקו ובחרו את התשובה', rem_sym: 'שארית',
      q_mul_strat: 'השתמשו באסטרטגיה כדי להשלים', q_area_model: 'היעזרו במודל השטח כדי לכפול', q_area_part: 'מהי המכפלה בחלק ה{c}?', q_distrib: 'פרקו את המספר כדי לכפול בקלות',
      q_word_solve: 'פתרו את הסיפור', area_col: 'הצבוע',
      hc_count_on: 'התחילו מהמספר הגדול וספרו קדימה.', hc_make10: 'השלימו קודם לעשר: {eq}', hc_place_add: 'חברו יחידות ליחידות ועשרות לעשרות.', hc_carry: 'אם בטור יוצא 10 או יותר, מעבירים 1 לטור הבא.',
      hc_sub_back: 'התחילו ב־{a} וספרו אחורה {b}.', hc_sub_up: 'ספרו קדימה מ־{b} עד {a}.', hc_borrow: 'אין מספיק יחידות? פורטים עשרת אחת ל־10 יחידות.',
      hc_missing_add: 'חשבו: כמה צריך להוסיף ל־{a} כדי לקבל {c}?', hc_missing_sub: 'בדקו בעזרת חיבור: {e}', hc_mul_groups: '{a} קבוצות של {b}: מחברים {b} שוב ושוב.',
      hc_mul_array: 'ספרו את השורות, ואז כמה יש בכל שורה.', hc_div_share: 'חלקו אחד־אחד עד שהכול מחולק.', hc_div_fact: 'חשבו על כפל: {e}',
      hc_rem: 'מצאו את הכפולה הגדולה ביותר של {b} שנכנסת ב־{a}. מה נשאר?', hc_word: 'מה צריך למצוא? האם התשובה תהיה גדולה או קטנה יותר?', hc_word2: 'פתרו בשני שלבים: קודם חלק אחד, ואחר כך את השאר.',
      hc_strat: 'השתמשו בעובדה שאתם כבר יודעים ושנו אותה.', hc_long: 'חלקו מקום אחד בכל פעם, החל מצד שמאל.', hc_fam: 'שלושה מספרים יוצרים משפחה: שני החלקים והשלם.'
    }
  });

  function lvlMax(max, level) {
    if (max <= 5) return [4, 5, 5, 5, 5][level - 1];
    if (max <= 10) return [5, 7, 10, 10, 10][level - 1];
    if (max <= 20) return [10, 12, 15, 20, 20][level - 1];
    return Math.max(10, Math.round(max * [.1, .3, .6, 1, 1][level - 1]));
  }
  function carries(a, b) { var c = 0, k = 0; while (a > 0 || b > 0) { k = (a % 10) + (b % 10) + k >= 10 ? 1 : 0; c += k; a = Math.floor(a / 10); b = Math.floor(b / 10); } return c; }
  function borrows(a, b) { var c = 0, k = 0; while (a > 0 || b > 0) { var d = (a % 10) - (b % 10) - k; k = d < 0 ? 1 : 0; c += k; a = Math.floor(a / 10); b = Math.floor(b / 10); } return c; }
  function pickAdd(rng, total, o) {
    o = o || {};
    for (var i = 0; i < 200; i++) {
      var s = rng.int(o.min || 2, total), a = rng.int(o.minA || 0, s), b = s - a;
      if (o.minPart && (a < o.minPart || b < o.minPart)) continue;
      if (o.regroup === true && !carries(a, b)) continue;
      if (o.regroup === false && carries(a, b)) continue;
      if (o.tens && !(a % 10 === 0 || b < 10 || (a % 10) + (b % 10) < 10)) continue;
      return [a, b];
    }
    return null;
  }
  function pictures(a, b, emoji, crossed) {
    var g = '', x = 10, size = 30, per = 5;
    function grp(n, off, cross) {
      var out = '';
      for (var i = 0; i < n; i++) {
        var cx = off + 18 + (i % per) * size, cy = 22 + Math.floor(i / per) * size;
        out += S.emoji(cx, cy, emoji, 24) + (cross && i >= n - cross ? '<path d="M' + (cx - 11) + ' ' + (cy - 11) + ' l22 22 M' + (cx + 11) + ' ' + (cy - 11) + ' l-22 22" stroke="#E53935" stroke-width="3"/>' : '');
      }
      return out;
    }
    var wA = Math.min(a, per) * size + 16, rows = Math.max(Math.ceil(a / per), Math.ceil((b || 0) / per));
    g += '<rect x="4" y="4" width="' + wA + '" height="' + (rows * size + 8) + '" rx="14" fill="#FFF6DA"/>' + grp(a, 4, crossed);
    if (b) { x = wA + 44; g += S.text(wA + 24, rows * size / 2 + 8, '+', { size: 30, fill: '#6C4CF1' }) + '<rect x="' + x + '" y="4" width="' + (Math.min(b, per) * size + 16) + '" height="' + (rows * size + 8) + '" rx="14" fill="#E3F5FD"/>' + grp(b, x, 0); x += Math.min(b, per) * size + 20; }
    else x = wA + 8;
    return S.wrap(x, rows * size + 16, g, { width: Math.min(560, x * 1.3) });
  }
  G.pictures = pictures;
  function hopLine(a, b, sign) {
    var end = sign > 0 ? a + b : a - b, lo = Math.min(a, end), hi = Math.max(a, end);
    var min = Math.max(0, Math.floor(lo / 10) * 10 - (lo % 10 === 0 ? 0 : 0)), max = Math.max(min + 10, Math.ceil(hi / 10) * 10);
    if (max - min > 40) return null;
    var hops = [];
    if (b <= 10) for (var i = 0; i < b; i++) hops.push({ from: a + sign * i, to: a + sign * (i + 1) });
    else hops.push({ from: a, to: end, label: (sign > 0 ? '+' : '−') + b });
    return S.numberLine({ min: min, max: max, step: 1, labelEvery: max - min > 20 ? 5 : 1, hops: hops, marks: [{ v: a, label: f(a), color: '#6C4CF1' }], width: 600 });
  }

  /* ------------------------------------------------------------------ add */
  G.register('add', function (c) {
    var rng = c.rng, p = c.p, L = c.level, max = p.max || 10, top = lvlMax(max, L), it = G.item(rng), q, pair;
    var mode = p.mode || '', rep = p.rep || '';
    if (mode === 'regroup') pair = pickAdd(rng, top < 20 ? 20 : top, { regroup: true, minPart: 2 });
    else if (mode === 'tens') {
      var ta = rng.int(1, 8), tb = rng.int(1, 9 - ta), oa = rng.int(0, 9), ob = rng.int(0, 9 - oa);
      pair = L === 1 ? [ta * 10, tb * 10] : L === 2 ? [ta * 10 + oa, tb * 10] : L === 3 ? [ta * 10 + oa, ob] : [ta * 10 + oa, tb * 10 + ob];
    }
    else pair = pickAdd(rng, Math.max(2, top), { regroup: max > 20 && L <= 1 ? false : undefined, minPart: max > 20 ? Math.min(10, Math.round(top / 10)) : 0, min: max > 20 ? Math.round(top / 3) : 2 });
    if (!pair) return null;
    var a = pair[0], b = pair[1], s = a + b, eq = a + ' + ' + b + ' = ' + s;
    var visualHint = s <= 20 ? { text: t('hc_count_on'), svg: hopLine(Math.max(a, b), Math.min(a, b), 1) } : { text: t('hc_place_add') + ' ' + m(f(a) + ' + ' + f(b)) };
    if (rep === 'objects' && L <= 3 || (rep === 'objects' && L === 4 && rng.chance(.5))) {
      q = { ui: 'count', prompt: t('q_add_all', { items: G.word(it, 2) }), sub: m(a + ' + ' + b + ' = ?'), data: { groups: [{ emoji: it.e, n: a, target: true }, { emoji: it.e, n: b, target: true, color: 'b' }], arrange: 'groups', answerUi: L <= 2 ? 'choice' : 'input' }, answer: s };
      if (L <= 2) q.data.options = G.numOpts(s, rng, { n: 3, min: 0, max: max + 2, deltas: [1, -1, 2] });
    } else if ((rep === 'pictures' && L <= 4) || (!rep && !mode && L === 1 && max <= 20)) {
      q = { ui: L <= 2 ? 'choice' : 'input', prompt: t('q_add_all', { items: G.word(it, 2) }), visual: pictures(a, b, it.e), data: { kind: 'int', eq: G.eqTokens(a + ' + ' + b + ' = _') }, answer: s };
      if (L <= 2) { q.data = { options: G.numOpts(s, rng, { n: 3, min: 0, max: max + 2, deltas: [1, -1, 2] }) }; q.sub = m(a + ' + ' + b + ' = ?'); }
    } else if ((rep === 'numberline' && L <= 4) || (!rep && !mode && L === 4 && s <= 20)) {
      q = { ui: 'numberline', prompt: t('q_nl_add', { a: a, b: b }), data: { min: 0, max: s <= 10 && max <= 10 ? 10 : 20, step: 1, labelEvery: 1, from: a, start: a, sign: 1 }, answer: s };
    } else if (mode === 'missing' || (!mode && L === 5 && max <= 20 && rng.chance(.5))) {
      var bl = rng.chance(.5) ? 0 : 1, toks = bl ? f(a) + ' + _ = ' + f(s) : '_ + ' + f(b) + ' = ' + f(s);
      q = { ui: L === 1 ? 'choice' : 'input', prompt: t('q_fill'), data: { kind: 'int', eq: G.eqTokens(toks) }, answer: bl ? b : a };
      if (L === 1) { q.data = { options: G.numOpts(q.answer, rng, { n: 3, min: 0, max: max }) }; q.sub = m(toks.replace('_', '?')); }
      if (L <= 2 && s <= 10) q.visual = pictures(bl ? a : b, 0, it.e);
      visualHint = { text: t('hc_missing_add', { a: f(bl ? a : b), c: f(s) }), svg: s <= 20 ? hopLine(bl ? a : b, bl ? b : a, 1) : null };
    } else if (mode === 'mental') {
      if (max <= 20) {
        var kind = rng.pick(L <= 2 ? ['double', 'ten', 'plus'] : ['double', 'near', 'make10', 'ten']);
        if (kind === 'double') { a = rng.int(1, Math.min(10, Math.floor(top / 2))); b = a; }
        else if (kind === 'ten') { a = 10; b = rng.int(1, 9); if (rng.chance(.5)) { a = b; b = 10; } }
        else if (kind === 'plus') { a = rng.int(2, 9); b = rng.int(1, 2); }
        else if (kind === 'near') { a = rng.int(2, 9); b = a + 1; }
        else { a = rng.int(6, 9); b = rng.int(10 - a + 1, 9); }
        s = a + b; eq = a + ' + ' + b + ' = ' + s;
        visualHint = kind === 'make10' ? { text: t('hc_make10', { eq: m(a + ' + ' + (10 - a) + ' + ' + (b - 10 + a) + ' = ' + s) }) }
          : kind === 'ten' || kind === 'plus' ? { text: t('hc_count_on'), svg: hopLine(Math.max(a, b), Math.min(a, b), 1) }
          : { text: m(a + ' + ' + a + ' = ' + 2 * a + (kind === 'near' ? ', +1 = ' + s : '')) };
      } else {
        var form = rng.int(0, 2);
        if (form === 0) { a = rng.int(1, 8) * 10; b = rng.int(1, 9 - a / 10) * 10; }
        else if (form === 1) { a = rng.int(11, 89); b = rng.int(1, 9) * 10; if (a + b > 100) b = 10; }
        else { a = rng.int(11, 80); b = rng.int(1, 9); }
        s = a + b; eq = a + ' + ' + b + ' = ' + s;
        visualHint = { text: t('hc_place_add') };
      }
      q = { ui: 'input', prompt: t('q_mental'), data: { kind: 'int', eq: G.eqTokens(a + ' + ' + b + ' = _') }, answer: s };
    } else if (max >= 100 && L === 4 && rng.chance(.6)) {
      q = { ui: 'column', prompt: t('q_col'), data: { a: a, b: b, op: '+' }, answer: s };
      visualHint = { text: t('hc_carry') };
    } else if (L === 5 && max >= 20 && max <= 100 && rng.chance(.5)) {
      var x = rng.int(1, Math.max(1, Math.floor(s / 3))), y = rng.int(1, Math.max(1, Math.floor((s - x) / 2))), z = s - x - y;
      a = x; b = y; eq = x + ' + ' + y + ' + ' + z + ' = ' + s;
      q = { ui: 'input', prompt: t('q_solve'), data: { kind: 'int', eq: G.eqTokens(f(x) + ' + ' + f(y) + ' + ' + f(z) + ' = _') }, answer: s };
      q.verify = function () { return x + y + z === s; };
    } else {
      q = { ui: L <= 2 && max <= 20 ? 'choice' : 'input', prompt: t('q_solve'), data: { kind: 'int', eq: G.eqTokens(f(a) + ' + ' + f(b) + ' = _') }, answer: s };
      if (q.ui === 'choice') { q.data = { options: G.numOpts(s, rng, { n: 3, min: 0, max: max + 3 }) }; q.sub = m(a + ' + ' + b + ' = ?'); }
    }
    q.meta = { range: [0, max] };
    q.hints = G.hintList(max > 20 && carries(a, b) ? t('hc_carry') : t('hc_count_on'), visualHint, { text: m(s <= 20 ? '2 + 3 = 5' : '30 + 20 = 50, 4 + 5 = 9 → 59') });
    q.explain = { text: m(eq.replace(/\d+/g, function (d) { return f(+d); })), svg: s <= 20 ? hopLine(a, b, 1) : null };
    q.sig = q.sig || 'add:' + q.ui + ':' + a + '+' + b + ':' + JSON.stringify(q.answer);
    if (!q.verify) q.verify = function () { return q.ui === 'input' && q.data.eq && q.data.eq.indexOf('+') >= 0 ? true : true; };
    return q;
  });

  /* ------------------------------------------------------------------ sub */
  G.register('sub', function (c) {
    var rng = c.rng, p = c.p, L = c.level, max = p.max || 10, top = lvlMax(max, L), it = G.item(rng), q, a, b, d;
    var mode = p.mode || '', rep = p.rep || '';
    for (var i = 0; i < 200; i++) {
      a = rng.int(max > 20 ? Math.round(top / 3) : 2, Math.max(2, top)); b = rng.int(max > 20 ? Math.max(1, Math.round(top / 20)) : 0, a);
      if (mode === 'regroup' && !borrows(a, b)) continue;
      if (max > 20 && L <= 1 && borrows(a, b)) continue;
      if (rep && b === 0) continue;
      break;
    }
    d = a - b;
    var eq = f(a) + ' − ' + f(b) + ' = ' + f(d), visualHint = a <= 20 ? { text: t('hc_sub_back', { a: a, b: b }), svg: hopLine(a, b, -1) } : { text: borrows(a, b) ? t('hc_borrow') : t('hc_sub_up', { a: f(a), b: f(b) }) };
    if (rep === 'objects' && L <= 3) {
      q = { ui: 'count', prompt: t('q_sub_left', { items: G.word(it, 2) }), sub: m(a + ' − ' + b + ' = ?'), data: { groups: [{ emoji: it.e, n: a, target: true, crossed: b }], arrange: 'rows', answerUi: L <= 2 ? 'choice' : 'input' }, answer: d };
      if (L <= 2) q.data.options = G.numOpts(d, rng, { n: 3, min: 0, max: max, deltas: [1, -1, 2] });
    } else if ((rep === 'pictures' && L <= 4) || (!rep && !mode && L === 1 && max <= 20)) {
      q = { ui: L <= 2 ? 'choice' : 'input', prompt: t('q_sub_left', { items: G.word(it, 2) }), visual: pictures(a, 0, it.e, b), data: { kind: 'int', eq: G.eqTokens(a + ' − ' + b + ' = _') }, answer: d };
      if (L <= 2) { q.data = { options: G.numOpts(d, rng, { n: 3, min: 0, max: max, deltas: [1, -1, 2] }) }; q.sub = m(a + ' − ' + b + ' = ?'); }
    } else if ((rep === 'numberline' && L <= 4) || (!rep && !mode && L === 4 && a <= 20)) {
      q = { ui: 'numberline', prompt: t('q_nl_sub', { a: a, b: b }), data: { min: 0, max: a <= 10 && max <= 10 ? 10 : 20, step: 1, labelEvery: 1, from: a, start: a, sign: -1 }, answer: d };
    } else if (mode === 'missing' || (!mode && L === 5 && max <= 20 && rng.chance(.5))) {
      var form = rng.int(0, 1), toks = form ? f(a) + ' − _ = ' + f(d) : '_ − ' + f(b) + ' = ' + f(d);
      q = { ui: L === 1 ? 'choice' : 'input', prompt: t('q_fill'), data: { kind: 'int', eq: G.eqTokens(toks) }, answer: form ? b : a };
      if (L === 1) { q.data = { options: G.numOpts(q.answer, rng, { n: 3, min: 0, max: max }) }; q.sub = m(toks.replace('_', '?')); }
      visualHint = { text: t('hc_missing_sub', { e: m(form ? f(d) + ' + ? = ' + f(a) : f(d) + ' + ' + f(b) + ' = ?') }) };
    } else if (mode === 'mental') {
      if (max <= 20) { a = rng.int(11, 18); b = rng.int(a - 10 + 1, 9); }
      else { var fm = rng.int(0, 2); if (fm === 0) { a = rng.int(3, 9) * 10; b = rng.int(1, a / 10 - 1) * 10; } else if (fm === 1) { a = rng.int(31, 99); b = rng.int(1, Math.floor(a / 10) - 1) * 10; } else { a = rng.int(21, 99); b = rng.int(1, a % 10 || 1); } }
      d = a - b; eq = a + ' − ' + b + ' = ' + d;
      q = { ui: 'input', prompt: t('q_mental'), data: { kind: 'int', eq: G.eqTokens(a + ' − ' + b + ' = _') }, answer: d };
      visualHint = { text: max <= 20 ? t('hc_make10', { eq: m(a + ' − ' + (a - 10) + ' − ' + (b - a + 10) + ' = ' + d) }) : t('hc_sub_up', { a: a, b: b }) };
    } else if (max >= 100 && L === 4 && rng.chance(.6)) {
      q = { ui: 'column', prompt: t('q_col'), data: { a: a, b: b, op: '-' }, answer: d };
      visualHint = { text: t('hc_borrow') };
    } else {
      q = { ui: L <= 2 && max <= 20 ? 'choice' : 'input', prompt: t('q_solve'), data: { kind: 'int', eq: G.eqTokens(f(a) + ' − ' + f(b) + ' = _') }, answer: d };
      if (q.ui === 'choice') { q.data = { options: G.numOpts(d, rng, { n: 3, min: 0, max: max }) }; q.sub = m(a + ' − ' + b + ' = ?'); }
    }
    q.meta = { range: [0, max] };
    q.hints = G.hintList(t('hc_sub_up', { a: f(a), b: f(b) }), visualHint, { text: m(a <= 20 ? '9 − 4 = 5' : '50 − 20 = 30') });
    q.explain = { text: m(eq), svg: a <= 20 ? hopLine(a, b, -1) : null };
    q.sig = 'sub:' + q.ui + ':' + a + '-' + b + ':' + JSON.stringify(q.answer);
    q.verify = function () { return a - b === d && d >= 0; };
    return q;
  });

  /* ------------------------------------------------------------------ addsub */
  G.register('addsub', function (c) {
    var rng = c.rng, p = c.p, L = c.level, max = p.max, mode = p.mode, top = Math.max(100, Math.round(max * [.1, .3, .6, 1, 1][L - 1])), a, b, op, ans, q;
    op = rng.pick(['+', '-']);
    for (var i = 0; i < 300; i++) {
      a = rng.int(Math.round(top / 5), top); b = rng.int(Math.round(top / 20) + 1, top);
      if (op === '+' && a + b > max) continue;
      if (op === '-' && b >= a) continue;
      if (mode === 'regroup' && !(op === '+' ? carries(a, b) : borrows(a, b))) continue;
      break;
    }
    if (mode === 'mental') {
      var big = max >= 10000 ? 1000 : 100;
      if (op === '+') { b = big * rng.int(1, 5) - rng.int(1, 3); a = rng.int(big, big * 4); }
      else { a = rng.int(big * 2, big * 9); b = big * rng.int(1, Math.floor(a / big) - 1) - rng.int(1, 3); }
    }
    ans = op === '+' ? a + b : a - b;
    var sym = op === '+' ? '+' : '−', eq = f(a) + ' ' + sym + ' ' + f(b) + ' = ' + f(ans);
    if (mode === 'missing') {
      var form = rng.int(0, 2), toks;
      if (form === 0) { toks = f(a) + ' ' + sym + ' _ = ' + f(ans); q = { answer: b }; }
      else if (form === 1) { toks = '_ ' + sym + ' ' + f(b) + ' = ' + f(ans); q = { answer: a }; }
      else { toks = f(ans) + ' = ' + f(a) + ' ' + sym + ' _'; q = { answer: b }; }
      q.ui = 'input'; q.prompt = t('q_fill'); q.data = { kind: 'int', eq: G.eqTokens(toks) };
    } else if (L >= 3 && rng.chance(.4) && mode !== 'mental') q = { ui: 'column', prompt: t('q_col'), data: { a: a, b: b, op: op }, answer: ans };
    else q = { ui: 'input', prompt: mode === 'mental' ? t('q_mental') : t('q_solve'), data: { kind: 'int', eq: G.eqTokens(f(a) + ' ' + sym + ' ' + f(b) + ' = _') }, answer: ans };
    var tip = mode === 'mental' ? (op === '+' ? m(f(a) + ' + ' + f(b + (b % 100 ? 100 - b % 100 : 0)) + ' − ' + f(b % 100 ? 100 - b % 100 : 0)) : m(f(a) + ' − ' + f(b + (100 - b % 100) % 100) + ' + ' + f((100 - b % 100) % 100))) : (op === '+' ? t('hc_carry') : t('hc_borrow'));
    q.hints = G.hintList(t('hc_strat'), { text: tip }, { text: m(op === '+' ? '299 + 46 = 300 + 46 − 1 = 345' : '503 − 198 = 503 − 200 + 2 = 305') });
    q.explain = { text: m(eq) };
    q.sig = 'as:' + mode + q.ui + ':' + a + op + b + ':' + q.answer;
    q.verify = function () { return op === '+' ? a + b === ans : a - b === ans; };
    return q;
  });

  /* ------------------------------------------------------------------ fact families */
  G.register('factfam', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q, a, b, w, s1, s2, inv;
    if (p.op === 'mul') { a = rng.pick(p.tables || [2, 5, 10]); b = rng.int(1, p.max || 10); w = a * b; s1 = '×'; s2 = '÷'; }
    else { a = rng.int(1, (p.max || 10) - 1); b = rng.int(1, (p.max || 10) - a); w = a + b; s1 = '+'; s2 = '−'; }
    var fact = f(a) + ' ' + s1 + ' ' + f(b) + ' = ' + f(w);
    if (L <= 3) {
      var useA = rng.chance(.5);
      q = { ui: L === 1 ? 'choice' : 'input', prompt: t('q_fact_fam', { fact: m(fact) }), data: { kind: 'int', eq: G.eqTokens(f(w) + ' ' + s2 + ' ' + f(useA ? a : b) + ' = _') }, answer: useA ? b : a };
      if (L === 1) { q.data = { options: G.numOpts(q.answer, rng, { n: 3, min: 0 }) }; q.sub = m(f(w) + ' ' + s2 + ' ' + f(useA ? a : b) + ' = ?'); }
    } else if (L === 4) {
      inv = rng.chance(.5);
      q = { ui: 'input', prompt: t('q_fact_fam', { fact: m(fact) }), data: { kind: 'int', eq: G.eqTokens(inv ? '_ ' + s2 + ' ' + f(a) + ' = ' + f(b) : f(w) + ' ' + s2 + ' _ = ' + f(a)) }, answer: inv ? w : b };
    } else {
      var good = f(w) + ' ' + s2 + ' ' + f(a) + ' = ' + f(b), bads = [f(a) + ' ' + s2 + ' ' + f(b) + ' = ' + f(w), f(w) + ' ' + s1 + ' ' + f(a) + ' = ' + f(b), f(b) + ' ' + s2 + ' ' + f(a) + ' = ' + f(w)];
      var opts = [{ v: 'g', label: '\u2066' + good + '\u2069' }];
      bads.forEach(function (x, i) { if (x !== good && !opts.some(function (o) { return o.label === '\u2066' + x + '\u2069'; })) opts.push({ v: 'b' + i, label: '\u2066' + x + '\u2069' }); });
      q = { ui: 'choice', prompt: t('q_fact_which', { a: f(a), b: f(b), c: f(w) }), data: { options: rng.shuffle(opts), layout: 'col' }, answer: 'g' };
    }
    q.hints = G.hintList(t('hc_fam'), { text: m(fact + ',  ' + f(w) + ' ' + s2 + ' ' + f(b) + ' = ' + f(a)) });
    q.explain = { text: m(fact + ' → ' + f(w) + ' ' + s2 + ' ' + f(a) + ' = ' + f(b)) };
    q.sig = 'ff:' + p.op + L + ':' + a + ':' + b + ':' + JSON.stringify(q.answer) + (inv ? 'i' : '');
    q.verify = function () { return p.op === 'mul' ? a * b === w : a + b === w; };
    return q;
  });

  /* ------------------------------------------------------------------ column */
  G.register('column', function (c) {
    var rng = c.rng, p = c.p, L = c.level, dg = p.digits || [3, 3], da = Math.max(2, dg[0] - (L <= 2 ? 1 : 0)), db = Math.max(1, dg[1] - (L <= 2 ? 1 : 0) - (L === 3 ? 1 : 0));
    var op = p.op === 'mix' ? rng.pick(['+', '-']) : p.op, a, b;
    for (var i = 0; i < 300; i++) {
      a = G.randDigits(rng, da); b = G.randDigits(rng, Math.min(db, da));
      if (op === '-' && b >= a) continue;
      var rg = op === '+' ? carries(a, b) : borrows(a, b);
      if (L === 1 && rg) continue;
      if (L >= 2 && !rg) continue;
      break;
    }
    var ans = op === '+' ? a + b : a - b;
    var q = { ui: 'column', prompt: t('q_col'), data: { a: a, b: b, op: op }, answer: ans };
    q.hints = G.hintList(op === '+' ? t('hc_carry') : t('hc_borrow'), { text: t('hc_place_add') }, { text: m(op === '+' ? '48 + 35: 8 + 5 = 13 → 3, carry 1 → 4 + 3 + 1 = 8 → 83' : '52 − 27: 12 − 7 = 5, 4 − 2 = 2 → 25') });
    q.explain = { text: m(f(a) + ' ' + (op === '+' ? '+' : '−') + ' ' + f(b) + ' = ' + f(ans)) };
    q.sig = 'col:' + a + op + b;
    q.verify = function () { return op === '+' ? a + b === ans : a - b === ans; };
    return q;
  });

  /* ------------------------------------------------------------------ word problems */
  var V = function (P, m_, f_) { return P.g === 'f' ? f_ : m_; };
  var WP = {
    add: [
      function (P) { return G.lang() === 'he' ? 'ל' + P.name + ' יש ' + G.qty(P.a, P.it) + '. ' + V(P, 'הוא קיבל', 'היא קיבלה') + ' עוד ' + f(P.b) + '. כמה ' + P.its + ' יש ל' + P.name + ' עכשיו?' : P.name + ' has ' + G.qty(P.a, P.it) + '. ' + V(P, 'He', 'She') + ' gets ' + f(P.b) + ' more. How many ' + P.its + ' does ' + P.name + ' have now?'; },
      function (P) { return G.lang() === 'he' ? 'בסל יש ' + G.qty(P.a, P.it) + ', ועל השולחן יש ' + G.qty(P.b, P.it) + '. כמה ' + P.its + ' יש בסך הכול?' : 'There are ' + G.qty(P.a, P.it) + ' in the basket and ' + G.qty(P.b, P.it) + ' on the table. How many ' + P.its + ' are there in all?'; },
      function (P) { return G.lang() === 'he' ? P.name + ' ' + V(P, 'קרא', 'קראה') + ' ' + f(P.a) + ' עמודים ביום ראשון ו־' + f(P.b) + ' עמודים ביום שני. כמה עמודים ' + V(P, 'הוא קרא', 'היא קראה') + ' בסך הכול?' : P.name + ' read ' + f(P.a) + ' pages on Sunday and ' + f(P.b) + ' pages on Monday. How many pages did ' + V(P, 'he', 'she') + ' read in all?'; },
      function (P) { return G.lang() === 'he' ? 'באוטובוס יש ' + f(P.a) + ' נוסעים. בתחנה הבאה עלו עוד ' + f(P.b) + ' נוסעים. כמה נוסעים יש עכשיו באוטובוס?' : 'A bus has ' + f(P.a) + ' passengers. At the next stop, ' + f(P.b) + ' more get on. How many passengers are on the bus now?'; }
    ],
    sub: [
      function (P) { return G.lang() === 'he' ? 'ל' + P.name + ' היו ' + G.qty(P.a, P.it) + '. ' + V(P, 'הוא נתן', 'היא נתנה') + ' ' + f(P.b) + ' לחברים. כמה ' + P.its + ' נשארו ל' + P.name + '?' : P.name + ' had ' + G.qty(P.a, P.it) + '. ' + V(P, 'He', 'She') + ' gave ' + f(P.b) + ' to friends. How many ' + P.its + ' does ' + P.name + ' have left?'; },
      function (P) { return G.lang() === 'he' ? 'בפארק משחקים ' + f(P.a) + ' ילדים. ' + f(P.b) + ' ילדים הלכו הביתה. כמה ילדים נשארו בפארק?' : 'There are ' + f(P.a) + ' children in the park. ' + f(P.b) + ' children go home. How many children are still in the park?'; },
      function (P) { return G.lang() === 'he' ? 'ל' + P.name + ' יש ' + G.qty(P.a, P.it) + ' ול' + P.name2 + ' יש ' + G.qty(P.b, P.it) + '. כמה ' + P.its + ' יותר יש ל' + P.name + '?' : P.name + ' has ' + G.qty(P.a, P.it) + '. ' + P.name2 + ' has ' + G.qty(P.b, P.it) + '. How many more ' + P.its + ' does ' + P.name + ' have?'; },
      function (P) { return G.lang() === 'he' ? 'בספר יש ' + f(P.a) + ' עמודים. ' + P.name + ' כבר ' + V(P, 'קרא', 'קראה') + ' ' + f(P.b) + ' עמודים. כמה עמודים נשארו לקרוא?' : 'A book has ' + f(P.a) + ' pages. ' + P.name + ' has read ' + f(P.b) + ' pages. How many pages are left to read?'; }
    ],
    mul: [
      function (P) { return G.lang() === 'he' ? 'יש ' + f(P.a) + ' שקיות, ובכל שקית יש ' + G.qty(P.b, P.it) + '. כמה ' + P.its + ' יש בסך הכול?' : 'There are ' + f(P.a) + ' bags with ' + G.qty(P.b, P.it) + ' in each bag. How many ' + P.its + ' are there altogether?'; },
      function (P) { return G.lang() === 'he' ? P.name + ' ' + V(P, 'קנה', 'קנתה') + ' ' + f(P.a) + ' חבילות מדבקות. בכל חבילה יש ' + f(P.b) + ' מדבקות. כמה מדבקות ' + V(P, 'הוא קנה', 'היא קנתה') + '?' : P.name + ' buys ' + f(P.a) + ' packs of stickers. Each pack has ' + f(P.b) + ' stickers. How many stickers does ' + V(P, 'he', 'she') + ' buy?'; },
      function (P) { return G.lang() === 'he' ? 'בגינה יש ' + f(P.a) + ' שורות, ובכל שורה יש ' + f(P.b) + ' פרחים. כמה פרחים יש בגינה?' : 'A garden has ' + f(P.a) + ' rows with ' + f(P.b) + ' flowers in each row. How many flowers are in the garden?'; }
    ],
    div: [
      function (P) { return G.lang() === 'he' ? P.name + ' ' + V(P, 'מחלק', 'מחלקת') + ' ' + G.qty(P.a, P.it) + ' שווה בשווה בין ' + f(P.b) + ' חברים. כמה ' + P.its + ' מקבל כל חבר?' : P.name + ' shares ' + G.qty(P.a, P.it) + ' equally among ' + f(P.b) + ' friends. How many ' + P.its + ' does each friend get?'; },
      function (P) { return G.lang() === 'he' ? 'יש ' + G.qty(P.a, P.it) + '. אורזים ' + f(P.b) + ' בכל קופסה. כמה קופסאות מתמלאות?' : 'There are ' + G.qty(P.a, P.it) + '. They are packed ' + f(P.b) + ' in each box. How many boxes are filled?'; },
      function (P) { return G.lang() === 'he' ? f(P.a) + ' ילדים מתחלקים לקבוצות של ' + f(P.b) + '. כמה קבוצות יש?' : f(P.a) + ' children split into teams of ' + f(P.b) + '. How many teams are there?'; }
    ]
  };
  var WP2 = [
    { ops: ['add', 'sub'], calc: function (a, b, c) { return a + b - c; }, ok: function (a, b, c) { return c <= a + b; }, eq: function (a, b, c) { return f(a) + ' + ' + f(b) + ' − ' + f(c); }, text: function (P) { return G.lang() === 'he' ? 'ל' + P.name + ' היו ' + G.qty(P.a, P.it) + '. ' + V(P, 'הוא קנה', 'היא קנתה') + ' עוד ' + f(P.b) + ', ואחר כך ' + V(P, 'נתן', 'נתנה') + ' ' + f(P.c) + ' לחבר. כמה ' + P.its + ' יש ל' + P.name + ' עכשיו?' : P.name + ' had ' + G.qty(P.a, P.it) + '. ' + V(P, 'He', 'She') + ' bought ' + f(P.b) + ' more and then gave ' + f(P.c) + ' to a friend. How many ' + P.its + ' does ' + P.name + ' have now?'; } },
    { ops: ['sub'], calc: function (a, b, c) { return a - b - c; }, ok: function (a, b, c) { return b + c <= a; }, eq: function (a, b, c) { return f(a) + ' − ' + f(b) + ' − ' + f(c); }, text: function (P) { return G.lang() === 'he' ? 'בחנות היו ' + f(P.a) + ' בלונים. בבוקר נמכרו ' + f(P.b) + ' ואחר הצהריים נמכרו ' + f(P.c) + '. כמה בלונים נשארו?' : 'A shop had ' + f(P.a) + ' balloons. It sold ' + f(P.b) + ' in the morning and ' + f(P.c) + ' in the afternoon. How many balloons are left?'; } },
    { ops: ['mul', 'sub'], calc: function (a, b, c) { return a * b - c; }, ok: function (a, b, c) { return c < a * b; }, mul: true, eq: function (a, b, c) { return f(a) + ' × ' + f(b) + ' − ' + f(c); }, text: function (P) { return G.lang() === 'he' ? 'יש ' + f(P.a) + ' קופסאות, ובכל קופסה ' + G.qty(P.b, P.it) + '. ' + P.name + ' ' + V(P, 'נתן', 'נתנה') + ' ' + f(P.c) + ' לחברים. כמה ' + P.its + ' נשארו?' : 'There are ' + f(P.a) + ' boxes with ' + G.qty(P.b, P.it) + ' in each. ' + P.name + ' gives ' + f(P.c) + ' to friends. How many ' + P.its + ' are left?'; } },
    { ops: ['mul', 'add'], calc: function (a, b, c) { return a * b + c; }, ok: function () { return true; }, mul: true, money: true, eq: function (a, b, c) { return f(a) + ' × ' + f(b) + ' + ' + f(c); }, text: function (P) { return G.lang() === 'he' ? P.name + ' ' + V(P, 'קנה', 'קנתה') + ' ' + f(P.a) + ' מחברות ב־' + G.money(P.b) + ' כל אחת ועט ב־' + G.money(P.c) + '. כמה ' + V(P, 'הוא שילם', 'היא שילמה') + ' בסך הכול?' : P.name + ' buys ' + f(P.a) + ' notebooks for ' + G.money(P.b) + ' each and a pen for ' + G.money(P.c) + '. How much does ' + V(P, 'he', 'she') + ' pay in all?'; } },
    { ops: ['div', 'add'], calc: function (a, b, c) { return a / b + c; }, ok: function (a, b) { return a % b === 0; }, div: true, eq: function (a, b, c) { return f(a) + ' ÷ ' + f(b) + ' + ' + f(c); }, text: function (P) { return G.lang() === 'he' ? f(P.a) + ' מדבקות מחולקות שווה בשווה בין ' + f(P.b) + ' ילדים. אחר כך כל ילד מקבל עוד ' + f(P.c) + '. כמה מדבקות יש עכשיו לכל ילד?' : f(P.a) + ' stickers are shared equally among ' + f(P.b) + ' kids. Then each kid gets ' + f(P.c) + ' more. How many stickers does each kid have now?'; } }
  ];
  var THEMES = {
    measure: [
      { op: 'sub', text: function (P) { return G.lang() === 'he' ? 'סרט באורך ' + f(P.a) + ' ס״מ. ' + P.name + ' ' + V(P, 'גזר', 'גזרה') + ' ממנו ' + f(P.b) + ' ס״מ. מה אורך הסרט עכשיו (בס״מ)?' : 'A ribbon is ' + f(P.a) + ' cm long. ' + P.name + ' cuts off ' + f(P.b) + ' cm. How long is the ribbon now (in cm)?'; } },
      { op: 'mul', text: function (P) { return G.lang() === 'he' ? 'בכל בקבוק יש ' + f(P.a) + ' מ״ל מיץ. כמה מ״ל יש ב־' + f(P.b) + ' בקבוקים?' : 'Each bottle holds ' + f(P.a) + ' ml of juice. How many ml do ' + f(P.b) + ' bottles hold?'; } },
      { op: 'add', text: function (P) { return G.lang() === 'he' ? P.name + ' ' + V(P, 'הלך', 'הלכה') + ' ' + f(P.a) + ' מטרים לבית הספר ו־' + f(P.b) + ' מטרים לפארק. כמה מטרים ' + V(P, 'הוא הלך', 'היא הלכה') + ' בסך הכול?' : P.name + ' walked ' + f(P.a) + ' m to school and ' + f(P.b) + ' m to the park. How many meters did ' + V(P, 'he', 'she') + ' walk in all?'; } },
      { op: 'mul', text: function (P) { return G.lang() === 'he' ? 'שקית קמח שוקלת ' + f(P.a) + ' גרם. כמה גרם שוקלות ' + f(P.b) + ' שקיות?' : 'A bag of flour weighs ' + f(P.a) + ' g. How many grams do ' + f(P.b) + ' bags weigh?'; } }
    ],
    money: [
      { op: 'add', text: function (P) { return G.lang() === 'he' ? 'ספר עולה ' + G.money(P.a) + ' ומשחק עולה ' + G.money(P.b) + '. כמה הם עולים יחד?' : 'A book costs ' + G.money(P.a) + ' and a game costs ' + G.money(P.b) + '. How much do they cost together?'; } },
      { op: 'sub', text: function (P) { return G.lang() === 'he' ? 'ל' + P.name + ' יש ' + G.money(P.a) + '. ' + V(P, 'הוא קנה', 'היא קנתה') + ' צעצוע ב־' + G.money(P.b) + '. כמה כסף נשאר?' : P.name + ' has ' + G.money(P.a) + ' and buys a toy for ' + G.money(P.b) + '. How much money is left?'; } },
      { op: 'mul', text: function (P) { return G.lang() === 'he' ? 'כרטיס להצגה עולה ' + G.money(P.a) + '. כמה עולים ' + f(P.b) + ' כרטיסים?' : 'A theater ticket costs ' + G.money(P.a) + '. How much do ' + f(P.b) + ' tickets cost?'; } },
      { op: 'div', text: function (P) { return G.lang() === 'he' ? G.money(P.a) + ' מתחלקים שווה בשווה בין ' + f(P.b) + ' ילדים. כמה מקבל כל ילד?' : G.money(P.a) + ' is shared equally among ' + f(P.b) + ' children. How much does each child get?'; } }
    ]
  };
  THEMES.real = THEMES.money.concat(THEMES.measure);
  function nums(rng, op, max, L) {
    var top = Math.max(10, Math.round(max * [.2, .4, .7, 1, 1][L - 1])), a, b;
    if (op === 'add') { a = rng.int(Math.max(1, Math.round(top / 5)), Math.max(2, top - 1)); b = rng.int(1, Math.max(1, top - a)); }
    else if (op === 'sub') { a = rng.int(Math.max(3, Math.round(top / 3)), top); b = rng.int(1, a - 1); }
    else if (op === 'mul') { var fm = max >= 1000 && L >= 3 ? 99 : 10; a = rng.int(2, Math.min(fm, Math.max(2, Math.floor(top / 2)))); b = rng.int(2, Math.max(2, Math.min(10, Math.floor(top / a)))); }
    else { var qmax = max >= 1000 && L >= 3 ? 99 : 10, qn = rng.int(2, Math.max(2, Math.min(qmax, Math.floor(top / 2)))); b = rng.int(2, Math.max(2, Math.min(10, Math.floor(top / qn)))); a = b * qn; }
    return [a, b];
  }
  G.register('word', function (c) {
    var rng = c.rng, p = c.p, L = c.level, ops = p.ops || ['add'], max = p.max || 20, P = G.person(rng), it = G.item(rng), q, ans, eq;
    P.it = it; P.its = G.word(it, 2); P.name2 = G.person(rng, P.name).name;
    var two = p.steps === 2 && (L >= 2 || ops.length === 1);
    if (p.theme && !two) {
      var th = rng.pick(THEMES[p.theme].filter(function (x) { return ops.indexOf(x.op) >= 0; }));
      if (!th) return null;
      var nb = nums(rng, th.op, max, L); P.a = nb[0]; P.b = nb[1];
      if (th.op === 'mul') { P.a = rng.int(2, Math.max(2, Math.min(250, Math.floor(max / 4)))); if (p.theme === 'measure' && P.a > 20) P.a = Math.round(P.a / 10) * 10; P.b = rng.int(2, Math.max(2, Math.min(9, Math.floor(max / P.a)))); }
      ans = th.op === 'add' ? P.a + P.b : th.op === 'sub' ? P.a - P.b : th.op === 'mul' ? P.a * P.b : P.a / P.b;
      eq = f(P.a) + ' ' + { add: '+', sub: '−', mul: '×', div: '÷' }[th.op] + ' ' + f(P.b) + ' = ' + f(ans);
      q = { prompt: th.text(P) };
    } else if (two) {
      var tpl = rng.pick(WP2.filter(function (x) { return x.ops.every(function (o) { return ops.indexOf(o) >= 0; }); }));
      if (!tpl) return null;
      var top = Math.max(12, Math.round(max * [.15, .3, .6, 1, 1][L - 1]));
      for (var i = 0; i < 100; i++) {
        if (tpl.mul) { P.a = rng.int(2, 9); P.b = rng.int(2, Math.max(2, Math.min(12, Math.floor(top / P.a)))); P.c = rng.int(1, Math.max(1, Math.min(P.a * P.b - 1, tpl.money ? 20 : P.a * P.b - 1))); }
        else if (tpl.div) { P.b = rng.int(2, 6); P.a = P.b * rng.int(2, Math.max(2, Math.floor(top / P.b))); P.c = rng.int(1, 9); }
        else { P.a = rng.int(Math.round(top / 3), top); P.b = rng.int(1, Math.round(top / 2)); P.c = rng.int(1, Math.round(top / 2)); }
        if (tpl.ok(P.a, P.b, P.c) && tpl.calc(P.a, P.b, P.c) >= 0) break;
      }
      if (!tpl.ok(P.a, P.b, P.c)) return null;
      ans = tpl.calc(P.a, P.b, P.c); eq = tpl.eq(P.a, P.b, P.c) + ' = ' + f(ans);
      q = { prompt: tpl.text(P) };
    } else {
      var op = rng.pick(ops), nn = nums(rng, op, max, L); P.a = nn[0]; P.b = nn[1];
      if (op === 'sub' && rng.chance(.3)) { P.b = rng.int(1, P.a - 1); }
      ans = op === 'add' ? P.a + P.b : op === 'sub' ? P.a - P.b : op === 'mul' ? P.a * P.b : P.a / P.b;
      eq = f(P.a) + ' ' + { add: '+', sub: '−', mul: '×', div: '÷' }[op] + ' ' + f(P.b) + ' = ' + f(ans);
      q = { prompt: rng.pick(WP[op])(P) };
      if (max <= 20 && L <= 2 && op !== 'div' && op !== 'mul') q.visual = pictures(P.a, op === 'add' ? P.b : 0, it.e, op === 'sub' ? P.b : 0);
    }
    q.ui = max <= 20 && L === 1 ? 'choice' : 'input';
    q.data = q.ui === 'choice' ? { options: G.numOpts(ans, rng, { n: 3, min: 0 }) } : { kind: 'int' };
    q.answer = ans;
    q.hints = G.hintList(two ? t('hc_word2') : t('hc_word'), { text: m(eq.replace(/= .*$/, '= ?')) }, { text: m(two ? '5 + 3 − 2 = 6' : '4 + 3 = 7') });
    q.explain = { text: m(eq) };
    q.sig = 'word:' + q.prompt.length + ':' + eq;
    q.verify = function () { return Math.round(ans) === ans && ans >= 0; };
    return q;
  });

  /* ------------------------------------------------------------------ mul */
  function arrOpts(rng, r, cc) {
    var cands = [[r, cc], [r + 1, cc], [r, cc + 1], [Math.max(1, r - 1), cc], [r, Math.max(1, cc - 1)]], seen = {}, out = [];
    cands.forEach(function (x, i) { var k = x[0] + 'x' + x[1]; if (!seen[k] && (i === 0 || x[0] * x[1] !== r * cc)) { seen[k] = 1; out.push({ v: k, html: S.arrayDots(x[0], x[1], { cell: 22, width: Math.min(150, x[1] * 22 + 6) }), aria: x[0] + ' × ' + x[1] }); } });
    return rng.shuffle(out.slice(0, 4));
  }
  G.register('mul', function (c) {
    var rng = c.rng, p = c.p, L = c.level, it = G.item(rng), q, a, b, ans;
    var tables = p.tables || [2, 3, 4, 5, 10], fmax = p.max || 10;
    if (p.digits) {
      var d = p.digits;
      if (d[1] === 2 && L <= 2) d = [2, 1];
      if (d[0] === 3 && L <= 2) d = [2, 1];
      if (d[0] === 3 && L === 5) d = [2, 2];
      a = G.randDigits(rng, d[0]); b = G.randDigits(rng, d[1]);
      if (d[1] === 1) b = rng.int(2, 9);
      ans = a * b;
      if (p.rep === 'area') {
        if (L <= 2) {
          var at = Math.floor(a / 10) * 10, ao = a % 10;
          if (!ao) return null;
          var part = rng.chance(.5) ? at : ao, bb = b >= 10 ? Math.floor(b / 10) * 10 : b;
          q = { ui: 'input', prompt: t('q_area_model'), visual: S.areaModel(a, b, { products: false }), data: { kind: 'int', eq: G.eqTokens(f(part) + ' × ' + f(bb) + ' = _') }, answer: part * bb };
        } else q = { ui: 'input', prompt: t('q_area_model'), visual: S.areaModel(a, b, { products: L <= 3 }), data: { kind: 'int', eq: G.eqTokens(f(a) + ' × ' + f(b) + ' = _') }, answer: ans };
      } else if (d[1] === 1 && L >= 3 && rng.chance(.5)) q = { ui: 'column', prompt: t('q_col'), data: { a: a, b: b, op: '×' }, answer: ans };
      else q = { ui: 'input', prompt: t('q_solve'), data: { kind: 'int', eq: G.eqTokens(f(a) + ' × ' + f(b) + ' = _') }, answer: ans };
      q.hints = G.hintList(t('hc_strat'), { text: t('q_area_model'), svg: S.areaModel(a, b, { products: true }) }, { text: m('23 × 4 = 20 × 4 + 3 × 4 = 80 + 12 = 92') });
      q.explain = { text: m(f(a) + ' × ' + f(b) + ' = ' + f(ans)), svg: S.areaModel(a, b, { products: true }) };
      q.sig = 'muld:' + a + 'x' + b + q.ui + JSON.stringify(q.answer);
      q.verify = function () { return a * b === ans; };
      return q;
    }
    a = rng.pick(tables); b = rng.int(L >= 5 ? 0 : 1, L <= 1 ? Math.min(5, fmax) : fmax);
    if (rng.chance(.5) && p.rep !== 'groups' && p.rep !== 'repeated') { var tmp = a; a = b; b = tmp; }
    ans = a * b;
    var groups = Math.max(a, 1), per = b;
    if (p.rep === 'repeated' || p.rep === 'groups' || p.rep === 'visual') { groups = rng.int(2, Math.min(5, fmax)); per = rng.pick(tables.filter(function (x) { return x <= 10; })); a = groups; b = per; ans = a * b; }
    var rep = p.rep, sumStr = U.range(a).map(function () { return b; }).join(' + ');
    if (rep === 'repeated') {
      if (L === 1) q = { ui: 'input', prompt: t('q_groups_total', { items: G.word(it, 2) }), visual: S.groups(a, b, it.e), data: { kind: 'int', eq: G.eqTokens(sumStr + ' = _') }, answer: ans };
      else if (L === 2) q = { ui: 'choice', prompt: t('q_groups_total', { items: G.word(it, 2) }), visual: S.groups(a, b, it.e), sub: m(sumStr + ' = ?'), data: { options: G.numOpts(ans, rng, { deltas: [b, -b, 1, -1], min: 1 }) }, answer: ans };
      else if (L === 3) q = { ui: 'input', prompt: t('q_mul_rep'), data: { kind: 'int', eq: G.eqTokens(sumStr + ' = _ × ' + b) }, answer: a };
      else q = { ui: 'input', prompt: t('q_solve'), visual: L === 4 ? S.groups(a, b, it.e) : null, data: { kind: 'int', eq: G.eqTokens(a + ' × ' + b + ' = _') }, answer: ans };
    } else if (rep === 'array') {
      var r = Math.max(2, Math.min(a, 10)), cc = Math.max(2, Math.min(b, 10)); ans = r * cc; a = r; b = cc;
      if (L === 1) q = { ui: 'choice', prompt: t('q_arr_read'), visual: S.arrayDots(r, cc), sub: m(r + ' × ' + cc + ' = ?'), data: { options: G.numOpts(ans, rng, { deltas: [cc, -cc, r, 1], min: 1 }) }, answer: ans };
      else if (L === 2 || L === 4) q = { ui: 'array', prompt: t('q_arr_build', { r: r, c: cc }), data: { rows: r, cols: cc, maxR: Math.max(6, r + 1), maxC: Math.max(8, cc + 1) }, answer: { r: r, c: cc } };
      else if (L === 3) q = { ui: 'input', prompt: t('q_arr_read'), visual: S.arrayDots(r, cc), data: { kind: 'int', eq: G.eqTokens(r + ' × ' + cc + ' = _') }, answer: ans };
      else q = { ui: 'choice', prompt: t('q_arr_which', { e: m(r + ' × ' + cc) }), data: { options: arrOpts(rng, r, cc), layout: 'two' }, answer: r + 'x' + cc };
    } else if (rep === 'groups') {
      if (L <= 2) q = { ui: 'group', prompt: t('q_mul_make', { g: a, p: G.qty(b, it) }), data: { groups: a, per: b, emoji: it.e, mode: 'make', total: a * b + (L === 2 ? rng.int(1, 3) : 0) }, answer: U.range(a).map(function () { return b; }) };
      else if (L === 3) q = { ui: 'input', prompt: t('q_groups_total', { items: G.word(it, 2) }), visual: S.groups(a, b, it.e), data: { kind: 'int', eq: G.eqTokens(a + ' × ' + b + ' = _') }, answer: ans };
      else if (L === 4) q = { ui: 'input', prompt: t('q_fill'), data: { kind: 'int', eq: G.eqTokens('_ × ' + b + ' = ' + ans) }, answer: a };
      else q = { ui: 'input', prompt: rng.pick(WP.mul)({ name: G.person(rng).name, g: 'f', a: a, b: b, it: it, its: G.word(it, 2) }), data: { kind: 'int' }, answer: ans };
    } else if (rep === 'visual') {
      if (L <= 2) q = { ui: 'choice', prompt: t('q_groups_total', { items: G.word(it, 2) }), visual: S.groups(a, b, it.e), data: { options: G.numOpts(ans, rng, { deltas: [b, -b, 1], min: 1 }) }, answer: ans };
      else if (L === 3) q = { ui: 'choice', prompt: t('q_arr_which', { e: m(a + ' × ' + b) }), data: { options: arrOpts(rng, a, b), layout: 'two' }, answer: a + 'x' + b };
      else q = { ui: 'input', prompt: t('q_solve'), visual: S.arrayDots(a, b, { emoji: it.e, cell: 30 }), data: { kind: 'int', eq: G.eqTokens(a + ' × ' + b + ' = _') }, answer: ans };
    } else if (p.mode === 'strategy') {
      var x = rng.pick(tables), y = rng.int(3, fmax), st = rng.int(0, 2);
      if (st === 0 && x % 2 === 0) { var half = x / 2; q = { ui: 'input', prompt: t('q_mul_strat'), sub: m(half + ' × ' + y + ' = ' + half * y), data: { kind: 'int', eq: G.eqTokens(x + ' × ' + y + ' = _') }, answer: x * y }; }
      else if (st === 1 || x === 9) { q = { ui: 'input', prompt: t('q_mul_strat'), data: { kind: 'int', eq: G.eqTokens(x + ' × ' + y + ' = ' + (x + 1) + ' × ' + y + ' − _') }, answer: y }; }
      else { q = { ui: 'input', prompt: t('q_mul_strat'), data: { kind: 'int', eq: G.eqTokens(x + ' × ' + y + ' = ' + (x - 1) + ' × ' + y + ' + _') }, answer: y }; }
      if (L === 5) q = { ui: 'input', prompt: t('q_solve'), data: { kind: 'int', eq: G.eqTokens(x + ' × ' + y + ' = _') }, answer: x * y };
      a = x; b = y; ans = x * y;
    } else {
      if (L === 2 && rng.chance(.35)) {
        var facts = [], used = {};
        while (facts.length < 4) { var fa = rng.pick(tables), fb = rng.int(1, fmax); if (!used[fa * fb]) { used[fa * fb] = 1; facts.push([fa, fb]); } }
        q = { ui: 'memory', prompt: t('q_mem_facts'), data: { pairs: facts.map(function (x, i) { return { id: 'p' + i, a: { label: '\u2066' + x[0] + ' × ' + x[1] + '\u2069' }, b: { label: f(x[0] * x[1]) } }; }) }, answer: 'done' };
        q.sig = 'mulmem:' + facts.join(';');
        q.hints = G.hintList(t('hc_mem'));
        return q;
      }
      if (L <= 2) q = { ui: 'choice', prompt: t('q_solve'), sub: m(a + ' × ' + b + ' = ?'), data: { options: G.numOpts(ans, rng, { deltas: [a || 1, -(a || 1), b || 1, 1], min: 0 }) }, answer: ans };
      else if (L === 4) {
        var mis = rng.chance(.5);
        // a single-table skill would otherwise keep asking for the table number itself
        if (tables.length === 1 && rng.chance(.8)) mis = a === tables[0];
        q = { ui: 'input', prompt: t('q_fill'), data: { kind: 'int', eq: G.eqTokens(mis ? a + ' × _ = ' + ans : '_ × ' + b + ' = ' + ans) }, answer: mis ? b : a }; if ((mis ? a : b) === 0) return null;
      }
      else q = { ui: 'input', prompt: t('q_solve'), data: { kind: 'int', eq: G.eqTokens(a + ' × ' + b + ' = _') }, answer: ans };
    }
    q.hints = q.hints || G.hintList(t('hc_mul_groups', { a: a, b: b }), { text: m(sumStr + ' = ' + f(a * b)), svg: a * b <= 60 && a > 0 && b > 0 ? S.arrayDots(Math.min(a, 10), Math.min(b, 12), { cell: 20 }) : null }, { text: m('3 × 4 = 4 + 4 + 4 = 12') });
    q.explain = { text: m(a + ' × ' + b + ' = ' + f(a * b)) };
    q.sig = 'mul:' + (rep || p.mode || '') + L + ':' + a + 'x' + b + ':' + JSON.stringify(q.answer);
    q.verify = function () { return true; };
    return q;
  });
  MA.i18n.add({ en: { q_mem_facts: 'Memory game: match each fact with its answer', hc_mem: 'Remember where you saw each card!' }, he: { q_mem_facts: 'משחק זיכרון: התאימו כל תרגיל לתשובה שלו', hc_mem: 'נסו לזכור איפה ראיתם כל קלף!' } });

  /* ------------------------------------------------------------------ div */
  function groupsSvg(counts, emoji) {
    var g = '', x = 6, h = 0;
    counts.forEach(function (n) {
      var cols = Math.min(3, Math.max(1, n)), w = cols * 26 + 16, rows = Math.max(1, Math.ceil(n / cols)); h = Math.max(h, rows * 26 + 16);
      g += '<rect x="' + x + '" y="4" width="' + w + '" height="' + (rows * 26 + 12) + '" rx="14" fill="#FFF3D9" stroke="#F0C66B" stroke-width="2.5"/>';
      for (var i = 0; i < n; i++) g += S.emoji(x + 21 + (i % cols) * 26, 20 + Math.floor(i / cols) * 26, emoji, 20);
      x += w + 10;
    });
    return S.wrap(x, h + 4, g, { width: Math.min(420, x * 1.2) });
  }
  G.register('div', function (c) {
    var rng = c.rng, p = c.p, L = c.level, it = G.item(rng), q, dv, qt, dd, rem = 0;
    var tables = p.tables || [2, 3, 4, 5], fmax = p.max || 10;
    if (p.digits || p.mode === 'long' || p.mode === 'strategy') {
      var dg = p.digits || [2, 1], da = dg[0] - (L <= 1 && dg[0] > 2 ? 1 : 0);
      dv = rng.int(2, 9);
      for (var i = 0; i < 200; i++) { qt = rng.int(Math.ceil(Math.pow(10, da - 1) / dv), Math.floor((Math.pow(10, da) - 1) / dv)); if (qt >= 2) break; }
      rem = p.remainder ? rng.int(1, dv - 1) : 0; dd = dv * qt + rem;
      if (dd >= Math.pow(10, da)) { qt -= 1; dd = dv * qt + rem; }
      if (p.remainder) {
        if (L <= 2) {
          var lbl = function (x, y) { return '\u2066' + f(x) + ' ' + t('rem_sym') + ' ' + f(y) + '\u2069'; }, cands = [[qt, rem], [qt, rem + 1 < dv ? rem + 1 : rem - 1], [qt + 1, rem], [qt - 1, rem + dv]];
          var seen = {}, opts = [];
          cands.forEach(function (x, k) { var key = x[0] + 'r' + x[1]; if (!seen[key] && x[1] >= 0) { seen[key] = 1; opts.push({ v: key, label: lbl(x[0], x[1]) }); } });
          q = { ui: 'choice', prompt: t('q_rem_choose'), sub: m(f(dd) + ' ÷ ' + dv + ' = ?'), data: { options: rng.shuffle(opts) }, answer: qt + 'r' + rem };
        } else if (L <= 4) q = { ui: 'input', prompt: t('q_rem'), data: { kind: 'int', eq: [f(dd), '÷', String(dv), '=', f(qt), t('rem_sym'), { blank: true }] }, answer: rem };
        else q = { ui: 'input', prompt: t('q_rem_q'), data: { kind: 'int', eq: [f(dd), '÷', String(dv), '=', { blank: true }, t('rem_sym'), f(rem)] }, answer: qt };
      } else if (p.mode === 'strategy') {
        var big = Math.floor(qt / 10) * 10 * dv, small = dd - big;
        q = L <= 3 && big > 0 && small > 0 ? { ui: 'input', prompt: t('q_mul_strat'), sub: m(f(dd) + ' = ' + f(big) + ' + ' + f(small)), data: { kind: 'int', eq: G.eqTokens(f(big) + ' ÷ ' + dv + ' + ' + f(small) + ' ÷ ' + dv + ' = _') }, answer: qt } : { ui: 'input', prompt: t('q_solve'), data: { kind: 'int', eq: G.eqTokens(f(dd) + ' ÷ ' + dv + ' = _') }, answer: qt };
      } else if (p.mode === 'quotient') {
        q = L <= 2 ? { ui: 'choice', prompt: t('q_quotient'), sub: m(f(dd) + ' ÷ ' + dv), data: { options: G.numOpts(qt, rng, { deltas: [1, -1, 10, -10], min: 1 }) }, answer: qt } : { ui: 'input', prompt: t('q_quotient'), sub: m(f(dd) + ' ÷ ' + dv), data: { kind: 'int' }, answer: qt };
      } else q = { ui: 'input', prompt: t('q_solve'), data: { kind: 'int', eq: G.eqTokens(f(dd) + ' ÷ ' + dv + ' = _') }, answer: qt };
      var steps = String(dd).split('').reduce(function (acc, ch) { var cur = acc.r * 10 + (+ch); acc.out.push(Math.floor(cur / dv)); acc.r = cur % dv; return acc; }, { r: 0, out: [] });
      q.hints = G.hintList(p.remainder ? t('hc_rem', { a: f(dd), b: dv }) : t('hc_long'), { text: m(f(dv) + ' × ' + f(qt) + ' = ' + f(dv * qt) + (rem ? ', ' + f(dd) + ' − ' + f(dv * qt) + ' = ' + rem : '')) }, { text: m('84 ÷ 4: 8 ÷ 4 = 2, 4 ÷ 4 = 1 → 21') });
      q.explain = { text: m(f(dd) + ' ÷ ' + dv + ' = ' + f(qt) + (rem ? ' ' + t('rem_sym') + ' ' + rem : '')) };
      q.sig = 'divd:' + (p.mode || '') + L + ':' + dd + '/' + dv;
      q.verify = function () { return dv * qt + rem === dd && rem < dv && steps.out.length > 0; };
      return q;
    }
    dv = rng.pick(tables); qt = rng.int(L <= 1 ? 1 : 2, L <= 2 ? Math.min(5, fmax) : fmax);
    if (p.remainder) rem = rng.int(1, dv - 1);
    dd = dv * qt + rem;
    var rep = p.rep;
    if (p.remainder) {
      if (L <= 2) {
        var lb = function (x, y) { return '\u2066' + f(x) + ' ' + t('rem_sym') + ' ' + f(y) + '\u2069'; }, cs = [[qt, rem], [qt + 1, rem === 1 ? 2 : rem - 1], [qt - 1, rem + dv], [qt, rem === dv - 1 ? rem - 1 : rem + 1]], sn = {}, op2 = [];
        cs.forEach(function (x) { var key = x[0] + 'r' + x[1]; if (!sn[key] && x[0] >= 0 && x[1] >= 0) { sn[key] = 1; op2.push({ v: key, label: lb(x[0], x[1]) }); } });
        q = { ui: 'choice', prompt: t('q_rem_choose'), visual: L === 1 ? groupsSvg(U.range(qt).map(function () { return dv; }).concat([rem]), it.e) : null, sub: m(f(dd) + ' ÷ ' + dv + ' = ?'), data: { options: rng.shuffle(op2) }, answer: qt + 'r' + rem };
      } else q = { ui: 'input', prompt: t('q_rem'), data: { kind: 'int', eq: [f(dd), '÷', String(dv), '=', f(qt), t('rem_sym'), { blank: true }] }, answer: rem };
    } else if (rep === 'share') {
      if (L <= 2) q = { ui: 'group', prompt: t('q_div_share', { n: G.qty(dd, it), g: dv }), data: { groups: dv, per: qt, emoji: it.e, mode: 'share', total: dd }, answer: U.range(dv).map(function () { return qt; }) };
      else if (L === 3) q = { ui: 'input', prompt: rng.pick(WP.div.slice(0, 1))({ name: G.person(rng).name, g: 'm', a: dd, b: dv, it: it, its: G.word(it, 2) }), visual: groupsSvg(U.range(dv).map(function () { return qt; }), it.e), data: { kind: 'int' }, answer: qt };
      else q = { ui: 'input', prompt: t('q_solve'), data: { kind: 'int', eq: G.eqTokens(dd + ' ÷ ' + dv + ' = _') }, answer: qt };
    } else if (rep === 'group') {
      var gsz = dv; dv = qt; qt = dd / gsz;
      if (L <= 2) q = { ui: 'choice', prompt: t('q_div_groups', { a: dd, b: gsz }), visual: pictures(dd, 0, it.e), data: { options: G.numOpts(qt, rng, { n: 3, min: 1 }) }, answer: qt };
      else q = { ui: 'input', prompt: t('q_div_groups', { a: dd, b: gsz }), data: { kind: 'int', eq: G.eqTokens(dd + ' ÷ ' + gsz + ' = _') }, answer: qt };
      dv = gsz;
    } else if (rep === 'equal') {
      if (L <= 3) {
        var equal = rng.chance(.5), counts = U.range(dv).map(function () { return qt; });
        if (!equal) { var k = rng.int(0, dv - 1), j = (k + 1) % dv; if (counts[k] > 1) { counts[k] -= 1; counts[j] += 1; } else { counts[j] += 1; counts[k] += 0; } }
        equal = counts.every(function (x) { return x === counts[0]; });
        q = { ui: 'choice', prompt: t('q_equal_groups'), visual: groupsSvg(counts, it.e), data: { options: G.textOpts([['yes', t('q_yes')], ['no', t('q_no')]], rng), layout: 'two' }, answer: equal ? 'yes' : 'no' };
        q.sig = 'diveq:' + counts.join(',');
      } else {
        var good = U.range(dv).map(function () { return qt; }), bad1 = good.slice(), bad2 = U.range(qt).map(function () { return dv; });
        bad1[0] += 1; bad1[bad1.length - 1] -= 1;
        var opts3 = [{ v: 'g', html: groupsSvg(good, it.e) }];
        if (bad1[bad1.length - 1] >= 0 && JSON.stringify(bad1) !== JSON.stringify(good)) opts3.push({ v: 'b1', html: groupsSvg(bad1, it.e) });
        if (JSON.stringify(bad2) !== JSON.stringify(good)) opts3.push({ v: 'b2', html: groupsSvg(bad2, it.e) });
        if (opts3.length < 2) return null;
        q = { ui: 'choice', prompt: t('q_equal_which', { a: dd, b: dv }), data: { options: rng.shuffle(opts3), layout: 'col' }, answer: 'g' };
      }
    } else {
      if (L <= 2) q = { ui: 'choice', prompt: t('q_solve'), sub: m(dd + ' ÷ ' + dv + ' = ?'), data: { options: G.numOpts(qt, rng, { n: L === 1 ? 3 : 4, min: 1 }) }, answer: qt };
      else if (L === 4) q = { ui: 'input', prompt: t('q_fill'), data: { kind: 'int', eq: G.eqTokens(dd + ' ÷ _ = ' + qt) }, answer: dv };
      else q = { ui: 'input', prompt: t('q_solve'), data: { kind: 'int', eq: G.eqTokens(dd + ' ÷ ' + dv + ' = _') }, answer: qt };
    }
    q.hints = q.hints || G.hintList(rep === 'share' ? t('hc_div_share') : p.remainder ? t('hc_rem', { a: dd, b: dv }) : t('hc_div_fact', { e: m(dv + ' × ? = ' + (dd - rem)) }), { text: m(dv + ' × ' + qt + ' = ' + (dv * qt)), svg: dd <= 30 ? groupsSvg(U.range(Math.min(dv, 6)).map(function () { return qt; }), it.e) : null }, { text: m('12 ÷ 3 = 4, 3 × 4 = 12') });
    q.explain = { text: m(dd + ' ÷ ' + dv + ' = ' + qt + (rem ? ' ' + t('rem_sym') + ' ' + rem : '')) };
    q.sig = q.sig || 'div:' + (rep || '') + L + ':' + dd + '/' + dv + ':' + JSON.stringify(q.answer);
    q.verify = function () { return dv * qt + rem === dd; };
    return q;
  });

  G.register('distrib', function (c) {
    var rng = c.rng, L = c.level, a = rng.int(3, 9), b = rng.int(11, c.p.max || 19), tens = Math.floor(b / 10) * 10, ones = b % 10, q;
    if (!ones) return null;
    if (L <= 2) q = { ui: 'input', prompt: t('q_distrib'), data: { kind: 'int', eq: G.eqTokens(a + ' × ' + b + ' = ' + a + ' × ' + tens + ' + ' + a + ' × _') }, answer: ones };
    else if (L <= 4) q = { ui: 'input', prompt: t('q_distrib'), data: { kind: 'int', eq: G.eqTokens(a + ' × ' + b + ' = ' + (a * tens) + ' + _') }, answer: a * ones };
    else q = { ui: 'input', prompt: t('q_solve'), data: { kind: 'int', eq: G.eqTokens(a + ' × ' + b + ' = _') }, answer: a * b };
    q.hints = G.hintList(t('hc_strat'), { text: m(a + ' × ' + b + ' = ' + a + ' × ' + tens + ' + ' + a + ' × ' + ones), svg: S.areaModel(b, a, { products: true }) });
    q.explain = { text: m(a + ' × ' + tens + ' + ' + a + ' × ' + ones + ' = ' + (a * tens) + ' + ' + (a * ones) + ' = ' + (a * b)) };
    q.sig = 'dist:' + L + ':' + a + 'x' + b;
    q.verify = function () { return a * tens + a * ones === a * b; };
    return q;
  });
})(window.MA = window.MA || {});
