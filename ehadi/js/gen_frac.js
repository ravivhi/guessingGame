/* Fractions and decimals: frac, fracequiv, fraccmp, fracline, fracqty, fracop, mixed, decimal
   Fraction answers are {n, d}; mixed numbers {w, n, d}. Input tokens: {frac:[n|null, d|null]}, {mixed:[w,n,d]}, {blankFrac}, {blankMixed}. */
(function (MA) {
  'use strict';
  var G = MA.gen, S = MA.svg, f = G.fmt, t = function (k, p) { return MA.t(k, p); }, U = MA.u, m = G.m;
  var FH = function (n, d) { return S.fracHTML(n, d); };
  var val = function (a) { return a == null ? NaN : (a.w || 0) + a.n / a.d; };
  var sameVal = function (a, b) { return a && b && isFinite(val(a)) && Math.abs(val(a) - val(b)) < 1e-9 && a.d > 0; };
  G.fracEquiv = sameVal;
  var fs = function (n, d) { return n + '/' + d; };

  MA.i18n.add({
    en: {
      q_fr_what: 'What fraction is shaded?', q_fr_which_pic: 'Which picture shows {fr}?', q_fr_shade: 'Color {fr} of the {shape}', q_fr_cut: 'Show {fr}: cut the {shape} into equal parts, then color.',
      q_fr_of: 'What is {fr} of {n}?', q_fr_equal: 'Is this shape divided into equal parts?', q_fr_which_equal: 'Which shape is divided into {k} equal parts?',
      q_fr_numer: 'Which number is the numerator of {fr}?', q_fr_denom: 'Which number is the denominator of {fr}?', q_fr_how_parts: 'Into how many equal parts is the shape divided?',
      q_fr_how_shaded: 'How many parts are shaded?', q_fr_write: 'Write the fraction: numerator {n}, denominator {d}', q_fr_which_nd: 'Which fraction has numerator {n} and denominator {d}?',
      q_fr_eq_which: 'Which fraction is equal to {fr}?', q_fr_simplify: 'Write {fr} in simplest form', q_fr_cmp: 'Compare the fractions. Choose the correct sign.', q_fr_order: 'Order the fractions from smallest to greatest',
      q_fr_line: 'Put the marker on {fr}', q_fr_line_read: 'Which fraction does the point show?', q_mixed_pic: 'Write the mixed number shown by the pizzas', q_mixed_imp: 'Write as an improper fraction',
      q_mixed_mix: 'Write {fr} as a mixed number', q_mixed_choose: 'Which mixed number equals {fr}?',
      shape_pizza: 'pizza', shape_bar: 'chocolate bar', shape_grid: 'rectangle',
      hc_fr_parts: 'The denominator (bottom) tells how many equal parts. The numerator (top) tells how many we take.', hc_fr_equiv: 'Multiply or divide the top and bottom by the same number.',
      hc_fr_cmp_same: 'Same denominator? Compare the numerators. Same numerator? Fewer parts means bigger parts.', hc_fr_half: 'Compare each fraction with one half.',
      hc_fr_of: 'Split {n} into {d} equal groups, then take {k} of them.', hc_fr_add: 'Same denominator: add (or subtract) the numerators and keep the denominator.',
      hc_mixed: 'Each whole is {d}/{d}.', hc_line: 'Split each whole into {d} equal jumps.',
      q_dec_what: 'What decimal is shaded?', q_dec_write: 'Write as a decimal', q_dec_place: 'Which digit is in the {p} place of {n}?', q_dec_tenths: 'Fill in the missing number',
      q_dec_which: 'Which decimal is {a} tenths and {b} hundredths?', q_dec_line: 'Put the marker on {n}', q_dec_cmp: 'Compare the decimals. Choose the correct sign.', q_dec_match: 'Match each fraction to its decimal',
      q_dec_money: 'How much money is this? Write it as a decimal.', q_dec_money_split: 'Fill in the missing number', dp_tenths: 'tenths', dp_hundredths: 'hundredths', dp_ones: 'ones',
      hc_dec: 'The first digit after the point is tenths, the second is hundredths.', hc_dec_cmp: 'Line up the points and compare digit by digit. 0.5 is the same as 0.50.', unit_main: 'shekels', unit_sub: 'agorot'
    },
    he: {
      q_fr_what: 'איזה חלק צבוע?', q_fr_which_pic: 'איזה ציור מראה {fr}?', q_fr_shade: 'צבעו {fr} מה{shape}', q_fr_cut: 'הראו {fr}: חלקו את ה{shape} לחלקים שווים ואז צבעו.',
      q_fr_of: 'כמה זה {fr} מ־{n}?', q_fr_equal: 'האם הצורה מחולקת לחלקים שווים?', q_fr_which_equal: 'איזו צורה מחולקת ל־{k} חלקים שווים?',
      q_fr_numer: 'מהו המונה של {fr}?', q_fr_denom: 'מהו המכנה של {fr}?', q_fr_how_parts: 'לכמה חלקים שווים מחולקת הצורה?',
      q_fr_how_shaded: 'כמה חלקים צבועים?', q_fr_write: 'כתבו את השבר: מונה {n}, מכנה {d}', q_fr_which_nd: 'לאיזה שבר יש מונה {n} ומכנה {d}?',
      q_fr_eq_which: 'איזה שבר שווה ל־{fr}?', q_fr_simplify: 'צמצמו את {fr} עד הסוף', q_fr_cmp: 'השוו את השברים. בחרו את הסימן המתאים.', q_fr_order: 'סדרו את השברים מהקטן לגדול',
      q_fr_line: 'הזיזו את הסמן אל {fr}', q_fr_line_read: 'איזה שבר מראה הנקודה?', q_mixed_pic: 'כתבו את המספר המעורב שמראות הפיצות', q_mixed_imp: 'כתבו כשבר מדומה',
      q_mixed_mix: 'כתבו את {fr} כמספר מעורב', q_mixed_choose: 'איזה מספר מעורב שווה ל־{fr}?',
      shape_pizza: 'פיצה', shape_bar: 'שוקולד', shape_grid: 'מלבן',
      hc_fr_parts: 'המכנה (למטה) אומר לכמה חלקים שווים חילקנו. המונה (למעלה) אומר כמה חלקים לקחנו.', hc_fr_equiv: 'כופלים או מחלקים את המונה ואת המכנה באותו מספר.',
      hc_fr_cmp_same: 'מכנה שווה? משווים את המונים. מונה שווה? פחות חלקים - חלקים גדולים יותר.', hc_fr_half: 'השוו כל שבר לחצי.',
      hc_fr_of: 'חלקו את {n} ל־{d} קבוצות שוות, וקחו {k} מהן.', hc_fr_add: 'מכנה שווה: מחברים (או מחסרים) את המונים ומשאירים את המכנה.',
      hc_mixed: 'כל שלם הוא {d}/{d}.', hc_line: 'חלקו כל שלם ל־{d} קפיצות שוות.',
      q_dec_what: 'איזה מספר עשרוני צבוע?', q_dec_write: 'כתבו כמספר עשרוני', q_dec_place: 'מהי ספרת {p} במספר {n}?', q_dec_tenths: 'השלימו את המספר החסר',
      q_dec_which: 'איזה מספר עשרוני הוא {a} עשיריות ו־{b} מאיות?', q_dec_line: 'הזיזו את הסמן אל {n}', q_dec_cmp: 'השוו את המספרים העשרוניים. בחרו את הסימן המתאים.', q_dec_match: 'התאימו כל שבר למספר העשרוני שלו',
      q_dec_money: 'כמה כסף יש כאן? כתבו כמספר עשרוני.', q_dec_money_split: 'השלימו את המספר החסר', dp_tenths: 'העשיריות', dp_hundredths: 'המאיות', dp_ones: 'היחידות',
      hc_dec: 'הספרה הראשונה אחרי הנקודה היא עשיריות, השנייה היא מאיות.', hc_dec_cmp: 'מיישרים את הנקודות ומשווים ספרה אחר ספרה. 0.5 זה כמו 0.50.', unit_main: 'שקלים', unit_sub: 'אגורות'
    }
  });
  var FR_WORD = { en: { '1/2': 'one half', '1/3': 'one third', '1/4': 'one quarter', '2/3': 'two thirds', '3/4': 'three quarters', '2/4': 'two quarters' }, he: { '1/2': 'חצי', '1/3': 'שליש', '1/4': 'רבע', '2/3': 'שני שלישים', '3/4': 'שלושה רבעים', '2/4': 'שני רבעים' } };
  function frWord(n, d) { return FR_WORD[G.lang()][n + '/' + d] || m(fs(n, d)); }
  function shadeSvg(shape, n, d, w) {
    var idx = U.range(n);
    if (shape === 'pizza') return S.pizza(d, idx, { width: w || 170 });
    if (shape === 'bar') return S.fracBar(d, idx, { width: w || 260 });
    var cols = d % 3 === 0 && d > 3 ? d / 3 : d % 2 === 0 && d > 4 ? d / 2 : d, rows = d / cols;
    return S.fracGrid(rows, cols, idx, { cell: 34, width: w || Math.min(260, cols * 34 + 8) });
  }
  function fracOptions(rng, ans, cands) {
    var seen = {}, out = [];
    [ans].concat(cands).forEach(function (x) { var k = x.n + '/' + x.d; if (!seen[k] && x.n >= 0 && x.d > 0 && out.length < 4 && (out.length === 0 || !sameVal(x, ans))) { seen[k] = 1; out.push({ v: k, html: FH(x.n, x.d), aria: k }); } });
    return rng.shuffle(out);
  }
  function pickND(rng, dens, unit) { var d = rng.pick(dens), n = unit ? 1 : rng.int(1, d - 1); return { n: n, d: d }; }

  /* ------------------------------------------------------------------ frac */
  G.register('frac', function (c) {
    var rng = c.rng, p = c.p, L = c.level, dens = p.dens || [2, 3, 4], q, unit = Math.max.apply(null, dens) <= 4 && dens.length === 1;
    var fr = pickND(rng, dens, unit || (L <= 2 && dens.length > 1 && p.kind !== 'parts')), shape = rng.pick(fr.d <= 8 ? ['pizza', 'bar', 'grid'] : ['bar', 'grid']), n = fr.n, d = fr.d;
    if (p.kind === 'visual' || p.kind === 'shade') {
      var mode = p.kind === 'shade' ? (L <= 3 ? 'shade' : L === 4 ? 'read' : 'cut') : ['read', 'pick', 'shade', 'readin', 'cut'][L - 1];
      // a one-fraction skill (halves) also shows other unit fractions, so the answer isn't always the same
      if (unit && (mode === 'read' || mode === 'readin') && rng.chance(.5)) { d = rng.pick([2, 3, 4].filter(function (x) { return x !== d; })); n = 1; }
      if (mode === 'read') q = { ui: 'choice', prompt: t('q_fr_what'), visual: shadeSvg(shape, n, d), data: { options: fracOptions(rng, { n: n, d: d }, [{ n: d - n, d: d }, { n: n, d: d + 1 }, { n: n, d: d === 2 ? 4 : d - 1 }, { n: d, d: n }, { n: n + 1, d: d + 2 }]) }, answer: n + '/' + d };
      else if (mode === 'pick') {
        var km = unit ? rng.pick([1, 2].filter(function (k) { return d * k <= 8; })) : 1, good = { v: 'g', html: shadeSvg(shape, n * km, d * km, 130) }, opts = [good];
        if (d > 2 || n > 1) opts.push({ v: 'b1', html: shadeSvg(shape, d - n === n ? n + 1 : d - n, d, 130) });
        opts.push({ v: 'b2', html: S.cutShape(shape === 'pizza' ? 'circle' : 'rect', d, false, { width: 130 }) });
        opts.push({ v: 'b3', html: shadeSvg(shape, n, d + 1, 130) });
        q = { ui: 'choice', prompt: t('q_fr_which_pic', { fr: frWord(n, d) }), data: { options: rng.shuffle(opts), layout: 'two' }, answer: 'g' };
        q.sig = 'frpick:' + n + '/' + d + 'x' + km + shape;
      } else if (mode === 'shade') {
        // one half of a pizza cut into 4 or 6 slices is 2 or 3 slices
        var mult = n === 1 ? rng.pick((L <= 1 ? [1, 1, 2] : [1, 2, 3]).filter(function (k) { return d * k <= (shape === 'pizza' ? 8 : 12); })) : 1;
        q = { ui: 'fraction', prompt: t('q_fr_shade', { fr: frWord(n, d), shape: t('shape_' + shape) }), data: { shape: shape, d: d * mult, mode: 'shade' }, answer: n * mult };
        q.sig = 'frs:' + L + ':' + n + '/' + d + 'x' + mult + shape;
      }
      else if (mode === 'readin') q = { ui: 'input', prompt: t('q_fr_what'), visual: shadeSvg(shape, n, d), data: { kind: 'frac', eq: [{ blankFrac: true }] }, answer: { n: n, d: d } };
      else { q = { ui: 'fraction', prompt: t('q_fr_cut', { fr: frWord(n, d), shape: t('shape_' + (shape === 'grid' ? 'bar' : shape)) }), data: { shape: shape === 'grid' ? 'bar' : shape, mode: 'cut', maxParts: 12 }, answer: { n: n, d: d } }; q.check = function (a) { return sameVal(a, { n: n, d: d }); }; }
    } else if (p.kind === 'ofset') {
      var k = L >= 4 && d > 2 ? rng.int(1, d - 1) : 1, per = rng.int(2, L <= 2 ? 4 : 6), tot = d * per, it = G.item(rng);
      if (L <= 2) q = { ui: 'group', prompt: t('q_div_share', { n: G.qty(tot, it), g: d }) + ' — ' + t('q_fr_of', { fr: frWord(1, d), n: tot }), data: { groups: d, per: per, emoji: it.e, mode: 'share', total: tot }, answer: U.range(d).map(function () { return per; }) };
      else q = { ui: L === 3 ? 'choice' : 'input', prompt: t('q_fr_of', { fr: frWord(k, d), n: G.qty(tot, it) }), visual: G.pictures(tot, 0, it.e), data: L === 3 ? { options: G.numOpts(k * per, rng, { n: 3, min: 1, max: tot }) } : { kind: 'int' }, answer: k * per };
      q.hints = G.hintList(t('hc_fr_of', { n: tot, d: d, k: k }), { text: m(tot + ' ÷ ' + d + ' = ' + per + (k > 1 ? ', ' + per + ' × ' + k + ' = ' + per * k : '')) });
      q.sig = 'frset:' + L + ':' + k + '/' + d + ':' + tot;
      return q;
    } else if (p.kind === 'equalparts') {
      var kk = rng.pick(dens), sh = rng.pick(['circle', 'rect']);
      if (L <= 3) { var eq = rng.chance(.5); q = { ui: 'choice', prompt: t('q_fr_equal'), visual: S.cutShape(sh, kk, eq, { width: 190 }), data: { options: G.textOpts([['yes', t('q_yes')], ['no', t('q_no')]], rng), layout: 'two' }, answer: eq ? 'yes' : 'no' }; q.sig = 'freq:' + sh + kk + eq; }
      else {
        var opts2 = [{ v: 'g', html: S.cutShape(sh, kk, true, { width: 130 }) }, { v: 'b1', html: S.cutShape(sh, kk, false, { width: 130 }) }, { v: 'b2', html: S.cutShape(sh === 'circle' ? 'rect' : 'circle', kk === 2 ? 3 : kk - 1, true, { width: 130 }) }];
        q = { ui: 'choice', prompt: t('q_fr_which_equal', { k: kk }), data: { options: rng.shuffle(opts2), layout: 'two' }, answer: 'g' };
        q.sig = 'freqw:' + sh + kk;
      }
      q.hints = G.hintList(t('hc_fr_parts'));
      return q;
    } else if (p.kind === 'parts') {
      var askN = p.ask === 'numerator';
      if (L === 1) q = { ui: 'choice', prompt: t(askN ? 'q_fr_numer' : 'q_fr_denom', { fr: m(fs(n, d)) }), visual: '<div class="eq">' + FH(n, d) + '</div>', data: { options: G.textOpts([[n, String(n)], [d, String(d)]], rng), layout: 'two' }, answer: askN ? n : d };
      else if (L === 2) q = { ui: 'input', prompt: t(askN ? 'q_fr_how_shaded' : 'q_fr_how_parts'), visual: shadeSvg(shape, n, d), data: { kind: 'int' }, answer: askN ? n : d };
      else if (L === 3) q = { ui: 'input', prompt: t(askN ? 'q_fr_how_shaded' : 'q_fr_how_parts'), visual: shadeSvg(shape, n, d), data: { kind: 'int', eq: askN ? [{ frac: [null, d] }] : [{ frac: [n, null] }] }, answer: askN ? n : d };
      else if (L === 4) q = { ui: 'input', prompt: t('q_fr_write', { n: n, d: d }), data: { kind: 'frac', eq: [{ blankFrac: true }] }, answer: { n: n, d: d } };
      else q = { ui: 'choice', prompt: t('q_fr_which_nd', { n: n, d: d }), data: { options: fracOptions(rng, { n: n, d: d }, [{ n: d, d: n }, { n: n, d: d + 1 }, { n: n + 1, d: d }]) }, answer: n + '/' + d };
      if (L === 4) q.check = function (a) { return a && a.n === n && a.d === d; };
    }
    if (!q) return null;
    q.hints = q.hints || G.hintList(t('hc_fr_parts'), { text: m(fs(n, d)), svg: shadeSvg(shape, n, d, 160) }, { text: m('1/4') + ' → ' + frWord(1, 4) });
    q.explain = q.explain || { text: m(fs(n, d)), svg: shadeSvg(shape, n, d, 140) };
    q.sig = q.sig || 'fr:' + p.kind + L + ':' + n + '/' + d + ':' + shape + q.ui;
    return q;
  });

  /* ------------------------------------------------------------------ equivalence & simplifying */
  G.register('fracequiv', function (c) {
    var rng = c.rng, p = c.p, L = c.level, dens = p.dens, q;
    var base = pickND(rng, dens.filter(function (d) { return d <= 6; }).length ? dens.filter(function (d) { return d <= 6; }) : dens), g = U.gcd(base.n, base.d);
    base = { n: base.n / g, d: base.d / g };
    if (base.d === 1) base = { n: 1, d: 2 };
    var k = rng.int(2, L >= 5 ? 5 : 3), big = { n: base.n * k, d: base.d * k };
    if (p.kind === 'simplify') {
      if (big.d > 12 && L <= 3) { k = 2; big = { n: base.n * 2, d: base.d * 2 }; }
      if (L <= 2) q = { ui: 'input', prompt: t('q_fr_simplify', { fr: m(fs(big.n, big.d)) }), data: { kind: 'int', eq: [{ frac: [big.n, big.d] }, '=', { frac: [base.n, null] }] }, answer: base.d };
      else { q = { ui: 'input', prompt: t('q_fr_simplify', { fr: m(fs(big.n, big.d)) }), data: { kind: 'frac', eq: [{ frac: [big.n, big.d] }, '=', { blankFrac: true }] }, answer: base }; q.check = function (a) { return a && sameVal(a, base) && U.gcd(a.n, a.d) === 1; }; }
      q.hints = G.hintList(t('hc_fr_equiv'), { text: m(fs(big.n, big.d) + ' = ' + big.n + '÷' + k + ' / ' + big.d + '÷' + k) });
    } else {
      if (L <= 2) q = { ui: 'input', prompt: t('q_fill'), visual: S.fracBar(base.d, U.range(base.n), { w: 280, h: 40, width: 290 }) + S.fracBar(big.d, U.range(big.n), { w: 280, h: 40, width: 290, color: '#3BB7F0' }), data: { kind: 'int', eq: [{ frac: [base.n, base.d] }, '=', { frac: [null, big.d] }] }, answer: big.n };
      else if (L === 3) q = { ui: 'input', prompt: t('q_fill'), data: { kind: 'int', eq: [{ frac: [base.n, base.d] }, '=', { frac: [big.n, null] }] }, answer: big.d };
      else if (L === 4) {
        var cands = [{ n: base.n + k, d: base.d + k }, { n: base.n * k, d: base.d * (k + 1) }, { n: base.n + 1, d: base.d * k }, { n: base.d, d: base.n * k }].filter(function (x) { return !sameVal(x, base) && x.n > 0; });
        q = { ui: 'choice', prompt: t('q_fr_eq_which', { fr: m(fs(base.n, base.d)) }), data: { options: fracOptions(rng, big, cands) }, answer: big.n + '/' + big.d, check: function (a) { var pr = String(a).split('/'); return sameVal({ n: +pr[0], d: +pr[1] }, base); } };
      } else { var k2 = rng.int(3, 6), b2 = { n: base.n * k2, d: base.d * k2 }; q = { ui: 'input', prompt: t('q_fill'), data: { kind: 'int', eq: [{ frac: [base.n, base.d] }, '=', { frac: [null, b2.d] }] }, answer: b2.n }; big = b2; }
      q.hints = G.hintList(t('hc_fr_equiv'), { text: m(base.n + '×' + (big.d / base.d) + ' / ' + base.d + '×' + (big.d / base.d) + ' = ' + fs(big.n, big.d)), svg: S.fracBar(base.d, U.range(base.n), { w: 280, h: 36, width: 290 }) + S.fracBar(big.d, U.range(big.n), { w: 280, h: 36, width: 290, color: '#3BB7F0' }) });
    }
    q.explain = { text: m(fs(base.n, base.d) + ' = ' + fs(big.n, big.d)) };
    q.sig = 'fe:' + p.kind + L + ':' + fs(base.n, base.d) + '=' + fs(big.n, big.d);
    q.verify = function () { return base.n * big.d === big.n * base.d; };
    return q;
  });

  /* ------------------------------------------------------------------ compare & order */
  G.register('fraccmp', function (c) {
    var rng = c.rng, p = c.p, L = c.level, dens = p.dens, q, a, b;
    if (p.kind === 'order') {
      var cnt = L >= 4 ? 4 : 3, items = [], tries = 0, bigD = dens.filter(function (x) { return x > cnt; }), oneDen = L <= 2 && bigD.length ? rng.pick(bigD) : 0;
      while (items.length < cnt && tries++ < 200) { var x = oneDen ? { n: rng.int(1, oneDen - 1), d: oneDen } : pickND(rng, dens); if (!items.some(function (y) { return sameVal(y, x); })) items.push(x); }
      if (items.length < cnt) return null;
      var sorted = items.slice().sort(function (u1, u2) { return val(u1) - val(u2); });
      q = { ui: 'order', prompt: t('q_fr_order'), data: { items: rng.shuffle(items).map(function (x) { return { v: fs(x.n, x.d), html: FH(x.n, x.d), aria: fs(x.n, x.d) }; }), dir: 'asc', startLabel: t('ord_small'), endLabel: t('ord_great') }, answer: sorted.map(function (x) { return fs(x.n, x.d); }) };
      q.hints = G.hintList(t('hc_fr_half'), { text: '', svg: null });
      q.hints = G.hintList(t('hc_fr_half'), { text: m(sorted.map(function (x) { return fs(x.n, x.d); })[0] + ' < …') });
      q.explain = { text: m(sorted.map(function (x) { return fs(x.n, x.d); }).join(' < ')) };
      q.sig = 'fo:' + q.answer.join(',');
      return q;
    }
    var kind = p.kind;
    if (kind === 'same-den' && L >= 3) kind = L === 3 ? 'same-num' : rng.pick(['same-den', 'same-num']);
    for (var i = 0; i < 100; i++) {
      if (kind === 'same-den') { var d = rng.pick(dens.filter(function (x) { return x > 2; }).length ? dens.filter(function (x) { return x > 2; }) : dens); a = { n: rng.int(1, d - 1), d: d }; b = { n: rng.int(1, d - 1), d: d }; }
      else if (kind === 'same-num') { var n = rng.int(1, 3), d1 = rng.pick(dens), d2 = rng.pick(dens); a = { n: n, d: d1 }; b = { n: n, d: d2 }; if (n >= Math.min(d1, d2)) continue; }
      else { a = pickND(rng, dens); b = pickND(rng, dens); if (a.d === b.d && L >= 3) continue; }
      if (!sameVal(a, b) || (kind === 'unlike' && rng.chance(.25) && a.d !== b.d)) break;
    }
    var sign = val(a) < val(b) - 1e-9 ? '<' : val(a) > val(b) + 1e-9 ? '>' : '=';
    q = { ui: 'compare', prompt: t('q_fr_cmp'), data: { left: fs(a.n, a.d), right: fs(b.n, b.d), leftHtml: FH(a.n, a.d) + (L <= 2 ? '<div>' + S.fracBar(a.d, U.range(a.n), { w: 150, h: 30, width: 150 }) + '</div>' : ''), rightHtml: FH(b.n, b.d) + (L <= 2 ? '<div>' + S.fracBar(b.d, U.range(b.n), { w: 150, h: 30, width: 150, color: '#3BB7F0' }) + '</div>' : '') }, answer: sign };
    q.hints = G.hintList(kind === 'unlike' ? t('hc_fr_half') : t('hc_fr_cmp_same'), { text: m(fs(a.n, a.d) + ' ' + sign + ' ' + fs(b.n, b.d)).replace(sign, '?'), svg: S.fracBar(a.d, U.range(a.n), { w: 280, h: 34, width: 290 }) + S.fracBar(b.d, U.range(b.n), { w: 280, h: 34, width: 290, color: '#3BB7F0' }) });
    q.explain = { text: m(fs(a.n, a.d) + ' ' + sign + ' ' + fs(b.n, b.d)) };
    q.sig = 'fc:' + fs(a.n, a.d) + sign + fs(b.n, b.d) + (L <= 2);
    q.verify = function () { return (sign === '<') === (a.n * b.d < b.n * a.d) && (sign === '=') === (a.n * b.d === b.n * a.d); };
    return q;
  });

  /* ------------------------------------------------------------------ number line */
  G.register('fracline', function (c) {
    var rng = c.rng, p = c.p, L = c.level, d = rng.pick(L <= 2 ? p.dens.filter(function (x) { return x <= 6; }) : p.dens), max = L >= 3 ? (p.max || 1) : 1, n = rng.int(1, d * max - 1);
    if (n % d === 0) n += 1;
    var q, target = n / d;
    if (L <= 3) q = { ui: 'numberline', prompt: t('q_fr_line', { fr: m(fs(n, d)) }), sub: null, data: { min: 0, max: max, step: 1 / d, labelEvery: d, den: d, fracLabels: L === 1, start: 0 }, answer: target };
    else { q = { ui: 'input', prompt: t('q_fr_line_read'), visual: S.numberLine({ min: 0, max: max, step: 1 / d, labelEvery: d, marks: [{ v: target, label: '?' }], width: 600, fmt: function (v) { return String(Math.round(v)); } }), data: { kind: 'frac', eq: [{ blankFrac: true }] }, answer: { n: n, d: d } }; q.check = function (a) { return sameVal(a, { n: n, d: d }); }; }
    if (q.ui === 'numberline') q.check = function (a) { return Math.abs(a - target) < 1 / (2 * d) - 1e-9; };
    q.hints = G.hintList(t('hc_line', { d: d }), { text: m(fs(n, d)), svg: S.numberLine({ min: 0, max: max, step: 1 / d, labelEvery: d, marks: [{ v: target, label: fs(n, d) }], width: 600, fmt: function (v) { return String(Math.round(v)); } }) });
    q.explain = { text: m(fs(n, d)) };
    q.sig = 'fl:' + L + ':' + n + '/' + d + ':' + max;
    return q;
  });

  /* ------------------------------------------------------------------ fraction of a quantity */
  G.register('fracqty', function (c) {
    var rng = c.rng, p = c.p, L = c.level, d = rng.pick(p.dens), k = p.unit || L <= 2 ? 1 : rng.int(1, d - 1), per = rng.int(2, Math.max(4, Math.floor((p.max || 40) / d * [.3, .5, .7, 1, 1][L - 1]))), tot = d * per, ans = k * per, q;
    if (L === 1) q = { ui: 'choice', prompt: t('q_fr_of', { fr: frWord(k, d), n: tot }), visual: tot <= 24 ? S.groups(d, per, '🍪') : null, data: { options: G.numOpts(ans, rng, { n: 3, min: 1, max: tot }) }, answer: ans };
    else q = { ui: 'input', prompt: t('q_fr_of', { fr: k === 1 && d <= 4 ? frWord(k, d) : m(fs(k, d)), n: f(tot) }), data: { kind: 'int', eq: [{ frac: [k, d] }, '×', f(tot), '=', { blank: true }] }, answer: ans };
    if (L >= 2) q.data.eq = [f(tot), '÷', String(d), k > 1 ? '× ' + k : '', '=', { blank: true }].filter(Boolean);
    if (L >= 4) q.data.eq = null;
    q.hints = G.hintList(t('hc_fr_of', { n: tot, d: d, k: k }), { text: m(f(tot) + ' ÷ ' + d + ' = ' + per + (k > 1 ? ', ' + per + ' × ' + k + ' = ' + ans : '')) });
    q.explain = { text: m(fs(k, d) + ' × ' + f(tot) + ' = ' + f(ans)) };
    q.sig = 'fq:' + L + ':' + k + '/' + d + ':' + tot;
    q.verify = function () { return tot / d * k === ans; };
    return q;
  });

  /* ------------------------------------------------------------------ add / subtract with like denominators */
  G.register('fracop', function (c) {
    var rng = c.rng, p = c.p, L = c.level, d = rng.pick(p.dens), op = p.op, a, b, q, wA = 0, wB = 0;
    var mixed = (p.maxWhole || 1) > 1 && L >= 4;
    for (var i = 0; i < 100; i++) {
      a = rng.int(1, d - 1); b = rng.int(1, d - 1);
      if (op === '+' && !mixed && a + b > d) continue;
      if (op === '-' && !mixed && b >= a) continue;
      break;
    }
    if (op === '-' && !mixed && b >= a) { var tmp = a; a = b; b = tmp; if (a === b) return null; }
    if (mixed) { wA = rng.int(1, p.maxWhole - 1); wB = rng.int(op === '-' ? 0 : 1, Math.max(0, op === '-' ? wA - 1 : p.maxWhole - 1 - wA)); if (op === '-' && wA * d + a <= wB * d + b) return null; }
    var A = wA * d + a, B = wB * d + b, R = op === '+' ? A + B : A - B, sym = op === '+' ? '+' : '−';
    if (R <= 0) return null;
    var tokA = wA ? { mixed: [wA, a, d] } : { frac: [a, d] }, tokB = wB ? { mixed: [wB, b, d] } : { frac: [b, d] };
    if (L <= 2) q = { ui: 'input', prompt: t('q_solve'), visual: S.fracBar(d, U.range(a), { w: 280, h: 36, width: 290 }), data: { kind: 'int', eq: [tokA, sym, tokB, '=', { frac: [null, d] }] }, answer: R };
    else if (!mixed) { q = { ui: 'input', prompt: t('q_solve'), data: { kind: 'frac', eq: [tokA, sym, tokB, '=', { blankFrac: true }] }, answer: { n: R, d: d } }; q.check = function (x) { return sameVal(x, { n: R, d: d }); }; }
    else { q = { ui: 'input', prompt: t('q_solve'), data: { kind: 'mixed', eq: [tokA, sym, tokB, '=', { blankMixed: true }] }, answer: { w: Math.floor(R / d), n: R % d, d: d } }; q.check = function (x) { return x && Math.abs(val(x) - R / d) < 1e-9; }; }
    q.hints = G.hintList(t('hc_fr_add'), { text: m(fs(A, d) + ' ' + sym + ' ' + fs(B, d) + ' = ' + fs('?', d)), svg: S.fracBar(d, U.range(Math.min(d, a)), { w: 280, h: 34, width: 290 }) });
    q.explain = { text: m(fs(A, d) + ' ' + sym + ' ' + fs(B, d) + ' = ' + fs(R, d) + (R >= d ? ' = ' + Math.floor(R / d) + (R % d ? ' ' + fs(R % d, d) : '') : '')) };
    q.sig = 'fo:' + op + L + ':' + A + ',' + B + '/' + d;
    q.verify = function () { return op === '+' ? A + B === R : A - B === R; };
    return q;
  });

  /* ------------------------------------------------------------------ mixed numbers */
  G.register('mixed', function (c) {
    var rng = c.rng, p = c.p, L = c.level, d = rng.pick(p.dens), w = rng.int(1, L <= 2 ? 2 : 4), n = rng.int(1, d - 1), imp = w * d + n, q;
    var lbl = function (W, N, D) { return '<span class="mixed math"><b style="font-size:1.4em">' + W + '</b>' + FH(N, D) + '</span>'; };
    if (p.kind === 'picture') {
      var pics = U.range(w).map(function () { return S.pizza(d, U.range(d), { width: 110 }); }).join('') + S.pizza(d, U.range(n), { width: 110 });
      if (L <= 2) {
        var opts = [{ v: w + ' ' + n + '/' + d, html: lbl(w, n, d) }], cs = [[w + 1, n, d], [w, d - n, d], [n, w, d]], seen = {}; seen[opts[0].v] = 1;
        cs.forEach(function (x) { var k = x[0] + ' ' + x[1] + '/' + x[2]; if (!seen[k] && x[1] < x[2] && x[1] > 0 && !(x[0] === w && x[1] === n)) { seen[k] = 1; opts.push({ v: k, html: lbl(x[0], x[1], x[2]) }); } });
        q = { ui: 'choice', prompt: t('q_mixed_pic'), visual: pics, data: { options: rng.shuffle(opts) }, answer: w + ' ' + n + '/' + d };
      } else { q = { ui: 'input', prompt: t('q_mixed_pic'), visual: pics, data: { kind: 'mixed', eq: [{ blankMixed: true }] }, answer: { w: w, n: n, d: d } }; q.check = function (x) { return x && x.w === w && sameVal(x, { w: w, n: n, d: d }); }; }
      if (L === 5) { q = { ui: 'input', prompt: t('q_mixed_imp'), visual: pics, data: { kind: 'frac', eq: [{ blankFrac: true }] }, answer: { n: imp, d: d } }; q.check = function (x) { return sameVal(x, { n: imp, d: d }); }; }
    } else {
      if (L <= 2) q = { ui: 'input', prompt: t('q_mixed_imp'), data: { kind: 'int', eq: [{ mixed: [w, n, d] }, '=', { frac: [null, d] }] }, answer: imp };
      else if (L <= 4) { q = { ui: 'input', prompt: t('q_mixed_mix', { fr: m(fs(imp, d)) }), data: { kind: 'mixed', eq: [{ frac: [imp, d] }, '=', { blankMixed: true }] }, answer: { w: w, n: n, d: d } }; q.check = function (x) { return x && x.w === w && sameVal(x, { w: w, n: n, d: d }) && x.n < x.d; }; }
      else {
        var o2 = [{ v: 'g', html: lbl(w, n, d) }], alt = [[w + 1, n], [w, (n + 1) % d || 1], [Math.max(1, w - 1), n]], sk = {}; sk[w + ',' + n] = 1;
        alt.forEach(function (x, i) { if (!sk[x[0] + ',' + x[1]]) { sk[x[0] + ',' + x[1]] = 1; o2.push({ v: 'b' + i, html: lbl(x[0], x[1], d) }); } });
        q = { ui: 'choice', prompt: t('q_mixed_choose', { fr: m(fs(imp, d)) }), data: { options: rng.shuffle(o2) }, answer: 'g' };
      }
    }
    q.hints = G.hintList(t('hc_mixed', { d: d }), { text: m(w + ' × ' + d + ' + ' + n + ' = ' + imp) });
    q.explain = { text: m(w + ' ' + fs(n, d) + ' = ' + fs(imp, d)) };
    q.sig = 'mx:' + p.kind + L + ':' + w + ' ' + n + '/' + d;
    q.verify = function () { return w * d + n === imp; };
    return q;
  });

  /* ------------------------------------------------------------------ decimals */
  function dfmt(x, places) { return x.toFixed(places); }
  G.register('decimal', function (c) {
    var rng = c.rng, p = c.p, L = c.level, kind = p.kind, q, n, x;
    if (kind === 'tenths') {
      n = rng.int(1, 9); x = n / 10;
      if (L <= 2) q = { ui: 'choice', prompt: t('q_dec_what'), visual: S.fracBar(10, U.range(n), { w: 300, h: 50, width: 310 }), data: { options: rng.shuffle(U.uniq([n, 10 - n, n === 1 ? 2 : n - 1]).map(function (k) { return { v: k / 10, label: dfmt(k / 10, 1) }; }).concat([{ v: n, label: String(n) }])) }, answer: x };
      else if (L <= 4) q = { ui: 'input', prompt: L === 3 ? t('q_dec_what') : t('q_dec_write'), visual: L === 3 ? S.fracBar(10, U.range(n), { w: 300, h: 50, width: 310 }) : null, data: { kind: 'dec', eq: L === 4 ? [{ frac: [n, 10] }, '=', { blank: true }] : null }, answer: x };
      else { var w0 = rng.int(1, 9); x = w0 + n / 10; q = { ui: 'input', prompt: t('q_dec_write'), data: { kind: 'dec', eq: [{ mixed: [w0, n, 10] }, '=', { blank: true }] }, answer: x }; }
    } else if (kind === 'hundredths') {
      n = rng.int(1, 99); if (n % 10 === 0) n += 1; x = n / 100;
      if (L <= 2) q = { ui: 'choice', prompt: t('q_dec_what'), visual: S.fracGrid(10, 10, U.range(n), { cell: 18, width: 200 }), data: { options: rng.shuffle(U.uniq([n, (n % 10) * 10 + Math.floor(n / 10), n + 10 > 99 ? n - 10 : n + 10]).map(function (k) { return { v: k / 100, label: dfmt(k / 100, 2) }; })) }, answer: x };
      else q = { ui: 'input', prompt: L === 3 ? t('q_dec_what') : t('q_dec_write'), visual: L === 3 ? S.fracGrid(10, 10, U.range(n), { cell: 18, width: 200 }) : null, data: { kind: 'dec', eq: L >= 4 ? [{ frac: [n, 100] }, '=', { blank: true }] : null }, answer: x };
    } else if (kind === 'represent') {
      var a = rng.int(1, 9), b = rng.int(1, 9), w = rng.int(0, 9); x = w + a / 10 + b / 100;
      if (L <= 2) q = { ui: 'input', prompt: t('q_dec_tenths'), data: { kind: 'int', eq: [dfmt(a / 10, 1), '=', { blank: true }, t('dp_tenths').replace(/^ה/, '')] }, answer: a };
      else if (L === 3) { var place = rng.pick(['tenths', 'hundredths']); q = { ui: 'choice', prompt: t('q_dec_place', { p: t('dp_' + place), n: dfmt(x, 2) }), data: { options: rng.shuffle(U.uniq([a, b, w]).map(function (k) { return { v: k, label: String(k) }; })) }, answer: place === 'tenths' ? a : b }; if (U.uniq([a, b, w]).length < 3) return null; }
      else { var good = dfmt(a / 10 + b / 100, 2), o = [{ v: good, label: good }], alts = [dfmt(b / 10 + a / 100, 2), dfmt(a / 100 + b / 1000, 3), a + '.' + b + '0']; alts.forEach(function (s) { if (!o.some(function (y) { return y.label === s; })) o.push({ v: s, label: s }); }); q = { ui: 'choice', prompt: t('q_dec_which', { a: a, b: b }), data: { options: rng.shuffle(o) }, answer: good }; if (a === b) return null; }
    } else if (kind === 'line') {
      n = rng.int(1, 9); var wh = L >= 4 ? rng.int(0, 2) : 0; x = wh + n / 10;
      if (L <= 3) { q = { ui: 'numberline', prompt: t('q_dec_line', { n: dfmt(x, 1) }), data: { min: wh, max: wh + 1, step: .1, labelEvery: L === 1 ? 1 : 5, decimals: 1, start: wh }, answer: x }; q.check = function (v) { return Math.abs(v - x) < .05 - 1e-9; }; }
      else { q = { ui: 'input', prompt: t('q_fr_line_read'), visual: S.numberLine({ min: wh, max: wh + 1, step: .1, labelEvery: 10, marks: [{ v: x, label: '?' }], width: 600, fmt: function (v) { return dfmt(v, 0); } }), data: { kind: 'dec' }, answer: Math.round(x * 10) / 10 }; }
    } else if (kind === 'compare') {
      var A, B;
      for (var i = 0; i < 50; i++) { A = rng.int(1, 99) / 100; B = rng.chance(.4) ? rng.int(1, 9) / 10 : rng.int(1, 99) / 100; if (L >= 4) { A += rng.int(0, 3); B += Math.floor(A); } if (Math.abs(A - B) > 1e-9 || rng.chance(.15)) break; }
      A = Math.round(A * 100) / 100; B = Math.round(B * 100) / 100;
      var sA = String(A), sB = String(B), sign = A < B - 1e-9 ? '<' : A > B + 1e-9 ? '>' : '=';
      q = { ui: 'compare', prompt: t('q_dec_cmp'), data: { left: sA, right: sB }, answer: sign };
      x = A;
    } else if (kind === 'fracdec') {
      if (L === 5) {
        var pairs = rng.sample([[1, 10], [3, 10], [7, 10], [1, 2], [1, 4], [3, 4], [9, 10], [25, 100], [6, 10], [1, 5]], 4).filter(function (pr, i, arr) { return arr.findIndex(function (y) { return y[0] / y[1] === pr[0] / pr[1]; }) === i; });
        if (pairs.length < 3) return null;
        q = { ui: 'match', prompt: t('q_dec_match'), data: { pairs: pairs.map(function (pr, i) { return { id: 'p' + i, left: { html: FH(pr[0], pr[1]) }, right: { label: String(pr[0] / pr[1]) } }; }) } };
        q.answer = {}; pairs.forEach(function (pr, i) { q.answer['p' + i] = 'p' + i; });
        q.sig = 'decm:' + pairs.map(function (pr) { return pr[0] + '/' + pr[1]; }).join(',');
        x = pairs.length;
      } else if (L <= 2) { n = rng.int(1, 9); x = n / 10; q = { ui: 'input', prompt: t('q_dec_write'), data: { kind: 'dec', eq: [{ frac: [n, 10] }, '=', { blank: true }] }, answer: x }; }
      else if (L === 3) { n = rng.int(1, 99); x = n / 100; q = { ui: 'input', prompt: t('q_dec_write'), data: { kind: 'dec', eq: [{ frac: [n, 100] }, '=', { blank: true }] }, answer: x }; }
      else { n = rng.int(11, 99); x = n / 100; q = { ui: 'input', prompt: t('q_fill'), data: { kind: 'int', eq: [dfmt(x, 2), '=', { frac: [null, 100] }] }, answer: n }; }
    } else if (kind === 'money') {
      var cur = G.currency(), main = rng.int(1, 20), sub = rng.int(1, 9) * 10 + (L >= 4 ? rng.int(0, 9) : 0);
      if (sub >= 100) sub = 95;
      x = main + sub / 100;
      var sym = cur === 'ILS' ? '₪' : '$', uMain = cur === 'ILS' ? t('unit_main') : 'dollars', uSub = cur === 'ILS' ? t('unit_sub') : 'cents';
      if (L <= 2) q = { ui: 'input', prompt: t('q_dec_money_split'), data: { kind: 'int', eq: [sym + dfmt(x, 2), '=', String(main), uMain, '+', { blank: true }, uSub] }, answer: sub };
      else if (L <= 4) { q = { ui: 'input', prompt: t('q_dec_money'), visual: '<div class="eq">' + U.esc(main + ' ' + uMain + ' + ' + sub + ' ' + uSub) + '</div>', data: { kind: 'dec', prefix: sym }, answer: x }; }
      else { var y = Math.round((x + rng.pick([-1, 1]) * rng.int(1, 3) / 10) * 100) / 100; q = { ui: 'compare', prompt: t('q_dec_cmp'), data: { left: sym + dfmt(x, 2), right: sym + dfmt(y, 2) }, answer: x < y ? '<' : '>' }; }
    }
    if (!q) return null;
    q.hints = G.hintList(kind === 'compare' ? t('hc_dec_cmp') : t('hc_dec'), { text: m('0.3 = 3/10, 0.25 = 25/100'), svg: kind === 'tenths' ? S.fracBar(10, U.range(3), { w: 280, h: 36, width: 290 }) : null });
    q.explain = { text: typeof q.answer === 'number' ? m(String(q.answer)) : '' };
    q.sig = q.sig || 'dec:' + kind + L + ':' + x + ':' + JSON.stringify(q.answer);
    return q;
  });
})(window.MA = window.MA || {});
