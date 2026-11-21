/* Data, probability and logic: sortcat, graph, prob, logic */
(function (MA) {
  'use strict';
  var G = MA.gen, S = MA.svg, f = G.fmt, t = function (k, p) { return MA.t(k, p); }, U = MA.u, m = G.m;
  MA.i18n.add({
    en: {
      cat_fruit: 'Fruit', cat_animal: 'Animals', cat_vehicle: 'Vehicles', cat_clothes: 'Clothes', q_sort_cat: 'Sort the pictures into the right groups', q_odd_one: 'Which one does not belong?',
      q_sort2: 'Sort the shapes by color and shape', c_red: 'red', c_blue: 'blue', hc_sort: 'Look at each picture and ask: which group is it part of?', hc_odd: 'Find what the others have in common.',
      g_fruits: 'Our favorite fruits', g_pets: 'Our favorite pets', g_sports: 'Our favorite sports', g_weather: 'Weather this month',
      q_g_read: 'How many chose {c}?', q_g_most: 'Which one got the most votes?', q_g_least: 'Which one got the fewest votes?', q_g_diff: 'How many more chose {a} than {b}?',
      q_g_total: 'How many votes are there in all?', q_g_sum2: 'How many chose {a} or {b}?', q_g_multi: 'How many more chose {a} and {b} together than {c}?', q_g_build: 'Make the bar graph match the table',
      q_g_cmp_class: 'How many more children in class A than in class B chose {c}?', q_g_cmp_tot: 'Which class has more children in all?', class_a: 'Class A', class_b: 'Class B',
      g_plant: 'Plant height (cm)', g_temp: 'Temperature (°C)', q_line_read: 'What was the value on {l}?', q_line_change: 'By how much did it change from {a} to {b}?', q_line_max: 'When was it the highest?',
      g_key: 'Each picture = {n}', hc_graph: 'Find the category first, then read its value carefully.', hc_graph_scale: 'Check the scale: each line (or picture) may be worth more than 1.',
      hc_diff: 'Find both values, then subtract the smaller from the bigger.', g_choice: 'Choice', g_votes: 'Votes', g_tally: 'Tally',
      q_prob: 'You pick one marble without looking. Picking {c} is…', p_certain: 'certain', p_likely: 'likely', p_unlikely: 'unlikely', p_impossible: 'impossible', q_prob_most: 'Which color are you most likely to pick?',
      hc_prob: 'Count the marbles of each color. More marbles means more likely.', col_red: 'red', col_blue: 'blue', col_green: 'green', col_yellow: 'yellow',
      q_riddle: 'Who am I? Use the clues to find the mystery number.', rd_between: 'I am between {a} and {b}.', rd_even: 'I am even.', rd_odd: 'I am odd.', rd_dsum: 'The sum of my digits is {s}.', rd_mult: 'I am a multiple of {k}.',
      rd_tens_gt: 'My tens digit is bigger than my ones digit.', rd_tens_lt: 'My tens digit is smaller than my ones digit.', rd_ones: 'My ones digit is {d}.', hc_riddle: 'Write down all the numbers that fit the first clue, then cross out the ones that do not fit the others.',
      q_tf: 'True or false?', hc_tf: 'Test it with a few examples. One counter-example makes it false.',
      q_symbols: 'Each picture stands for a number. Find the value of {s}.', q_symbols_expr: 'Each picture stands for a number. Find the value of {e}.', hc_symbols: 'Start with the clue that has only one kind of picture.',
      q_outfits: 'You have {s} shirts and {p} pants. How many different outfits can you make?', q_handshakes: '{n} friends meet. Each pair shakes hands once. How many handshakes are there?',
      q_pairs_sum: 'How many ways can you write {n} as the sum of two different numbers from 1 to 9 (order does not matter)?', q_two_digit: 'How many different two-digit numbers can you make with the digits {a}, {b} and {c} (no repeating digits)?',
      hc_strategy: 'Make an organized list so you do not miss or repeat any.'
    },
    he: {
      cat_fruit: 'פירות', cat_animal: 'בעלי חיים', cat_vehicle: 'כלי תחבורה', cat_clothes: 'בגדים', q_sort_cat: 'מיינו את התמונות לקבוצות המתאימות', q_odd_one: 'מה לא שייך?',
      q_sort2: 'מיינו את הצורות לפי צבע וצורה', c_red: 'אדום', c_blue: 'כחול', hc_sort: 'הסתכלו על כל תמונה ושאלו: לאיזו קבוצה היא שייכת?', hc_odd: 'מצאו מה משותף לכל האחרים.',
      g_fruits: 'הפירות האהובים עלינו', g_pets: 'חיות המחמד האהובות עלינו', g_sports: 'ענפי הספורט האהובים עלינו', g_weather: 'מזג האוויר החודש',
      q_g_read: 'כמה בחרו {c}?', q_g_most: 'מה קיבל הכי הרבה קולות?', q_g_least: 'מה קיבל הכי מעט קולות?', q_g_diff: 'בכמה יותר בחרו {a} מאשר {b}?',
      q_g_total: 'כמה קולות יש בסך הכול?', q_g_sum2: 'כמה בחרו {a} או {b}?', q_g_multi: 'בכמה יותר בחרו {a} ו־{b} יחד מאשר {c}?', q_g_build: 'בנו דיאגרמת עמודות שמתאימה לטבלה',
      q_g_cmp_class: 'בכמה ילדים יותר בכיתה א׳ מאשר בכיתה ב׳ בחרו {c}?', q_g_cmp_tot: 'באיזו כיתה יש יותר ילדים בסך הכול?', class_a: 'כיתה א׳', class_b: 'כיתה ב׳',
      g_plant: 'גובה הצמח (ס״מ)', g_temp: 'טמפרטורה (°C)', q_line_read: 'מה היה הערך ב־{l}?', q_line_change: 'בכמה השתנה הערך מ־{a} עד {b}?', q_line_max: 'מתי הערך היה הכי גבוה?',
      g_key: 'כל תמונה = {n}', hc_graph: 'מצאו קודם את הקטגוריה, ואז קראו את הערך שלה בזהירות.', hc_graph_scale: 'בדקו את קנה המידה: כל קו (או תמונה) יכול להיות שווה יותר מ־1.',
      hc_diff: 'מצאו את שני הערכים, ואז החסירו את הקטן מהגדול.', g_choice: 'בחירה', g_votes: 'קולות', g_tally: 'סימונים',
      q_prob: 'מוציאים גולה אחת בלי להסתכל. להוציא גולה {c} זה…', p_certain: 'ודאי', p_likely: 'סביר', p_unlikely: 'לא סביר', p_impossible: 'בלתי אפשרי', q_prob_most: 'איזה צבע הכי סביר להוציא?',
      hc_prob: 'ספרו את הגולות מכל צבע. יותר גולות - יותר סביר.', col_red: 'אדומה', col_blue: 'כחולה', col_green: 'ירוקה', col_yellow: 'צהובה',
      q_riddle: 'מי אני? היעזרו ברמזים כדי למצוא את המספר הסודי.', rd_between: 'אני בין {a} ל־{b}.', rd_even: 'אני זוגי.', rd_odd: 'אני אי־זוגי.', rd_dsum: 'סכום הספרות שלי הוא {s}.', rd_mult: 'אני כפולה של {k}.',
      rd_tens_gt: 'ספרת העשרות שלי גדולה מספרת היחידות.', rd_tens_lt: 'ספרת העשרות שלי קטנה מספרת היחידות.', rd_ones: 'ספרת היחידות שלי היא {d}.', hc_riddle: 'רשמו את כל המספרים שמתאימים לרמז הראשון, ומחקו את אלה שלא מתאימים לשאר הרמזים.',
      q_tf: 'נכון או לא נכון?', hc_tf: 'בדקו בעזרת כמה דוגמאות. דוגמה נגדית אחת מספיקה כדי שזה לא נכון.',
      q_symbols: 'כל תמונה מייצגת מספר. מצאו את הערך של {s}.', q_symbols_expr: 'כל תמונה מייצגת מספר. מצאו את הערך של {e}.', hc_symbols: 'התחילו מהרמז שיש בו רק סוג אחד של תמונה.',
      q_outfits: 'יש לכם {s} חולצות ו־{p} מכנסיים. כמה תלבושות שונות אפשר להרכיב?', q_handshakes: '{n} חברים נפגשים. כל שניים לוחצים ידיים פעם אחת. כמה לחיצות ידיים יש?',
      q_pairs_sum: 'בכמה דרכים אפשר לכתוב את {n} כסכום של שני מספרים שונים מ־1 עד 9 (הסדר לא משנה)?', q_two_digit: 'כמה מספרים דו־ספרתיים שונים אפשר ליצור מהספרות {a}, {b} ו־{c} (בלי לחזור על ספרה)?',
      hc_strategy: 'הכינו רשימה מסודרת כדי לא לפספס ולא לחזור על אפשרות.'
    }
  });

  var CATS = { fruit: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍐', '🍒', '🍍'], animal: ['🐶', '🐱', '🐰', '🐸', '🐵', '🐷', '🐮', '🐔'], vehicle: ['🚗', '🚌', '🚲', '✈️', '🚂', '🚁', '🚀', '⛵'], clothes: ['👕', '👖', '👗', '🧦', '🧢', '👟', '🧤', '🧣'] };
  G.register('sortcat', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q;
    if (p.kind === 'categories') {
      var keys = rng.sample(Object.keys(CATS), 2), same = rng.sample(CATS[keys[0]], L <= 2 ? 3 : 4), odd = rng.pick(CATS[keys[1]]);
      q = { ui: 'choice', prompt: t('q_odd_one'), data: { options: rng.shuffle(same.concat([odd])).map(function (e) { return { v: e, label: e }; }) }, answer: odd };
      q.hints = G.hintList(t('hc_odd'), { text: same.join(' ') + ' → ' + t('cat_' + keys[0]) });
      q.sig = 'odd:' + same.join('') + odd;
      return q;
    }
    if (p.kind === 'sort2') {
      var two = rng.sample(['circle', 'square', 'triangle'], 2), combos = [[two[0], 'r'], [two[0], 'b'], [two[1], 'r'], [two[1], 'b']], bins = combos.map(function (cb) { return { id: cb[0] + cb[1], label: t('c_' + (cb[1] === 'r' ? 'red' : 'blue')) + ' · ' + t('sh_' + cb[0]), html: S.shape(cb[0], { size: 28, fill: cb[1] === 'r' ? '#FF5C5C' : '#3B82F6', width: 36 }) }; });
      var items = [], nIt = L <= 2 ? 6 : 8, picks = rng.shuffle(combos.concat(U.range(nIt - 4).map(function () { return rng.pick(combos); })));
      for (var i = 0; i < nIt; i++) { var cb = picks[i]; items.push({ id: 'i' + i, html: S.shape(cb[0], { size: rng.int(36, 56), fill: cb[1] === 'r' ? '#FF5C5C' : '#3B82F6', width: 56, rot: cb[0] === 'circle' ? 0 : rng.pick([0, 15, -20, 30]) }), aria: t('c_' + (cb[1] === 'r' ? 'red' : 'blue')) + ' ' + t('sh_' + cb[0]), bin: cb[0] + cb[1] }); }
      q = { ui: 'sort', prompt: t('q_sort2'), data: { bins: bins, items: rng.shuffle(items) } };
      q.answer = {}; items.forEach(function (x) { q.answer[x.id] = x.bin; });
      q.hints = G.hintList(t('hc_sort'));
      q.sig = 'sort2:' + picks.map(function (cb) { return cb.join(''); }).join(',');
      return q;
    }
    var nb = L <= 3 ? 2 : 3, ks = rng.sample(Object.keys(CATS), nb), per = L <= 2 ? 3 : 4, its = [];
    ks.forEach(function (k) { rng.sample(CATS[k], per).forEach(function (e) { its.push({ id: 'i' + its.length, label: e, bin: k }); }); });
    q = { ui: 'sort', prompt: t('q_sort_cat'), data: { bins: ks.map(function (k) { return { id: k, label: t('cat_' + k) }; }), items: rng.shuffle(its) } };
    q.answer = {}; its.forEach(function (x) { q.answer[x.id] = x.bin; });
    q.hints = G.hintList(t('hc_sort'));
    q.sig = 'sortc:' + its.map(function (x) { return x.label; }).join('');
    return q;
  });

  var GSETS = {
    fruits: { title: 'g_fruits', items: [['🍎', 'apple', 'תפוח'], ['🍌', 'banana', 'בננה'], ['🍇', 'grapes', 'ענבים'], ['🍓', 'strawberry', 'תות'], ['🍊', 'orange', 'תפוז']] },
    pets: { title: 'g_pets', items: [['🐶', 'dog', 'כלב'], ['🐱', 'cat', 'חתול'], ['🐟', 'fish', 'דג'], ['🐰', 'rabbit', 'ארנב'], ['🐦', 'bird', 'ציפור']] },
    sports: { title: 'g_sports', items: [['⚽', 'soccer', 'כדורגל'], ['🏀', 'basketball', 'כדורסל'], ['🎾', 'tennis', 'טניס'], ['🏊', 'swimming', 'שחייה'], ['🚴', 'cycling', 'רכיבה']] },
    weather: { title: 'g_weather', items: [['☀️', 'sunny', 'שמשי'], ['☁️', 'cloudy', 'מעונן'], ['🌧️', 'rainy', 'גשום'], ['🌬️', 'windy', 'סוער']] }
  };
  function makeData(rng, max, step, n) {
    var set = GSETS[rng.pick(Object.keys(GSETS))], items = rng.sample(set.items, Math.min(n, set.items.length)), vals = [], tries = 0;
    while (tries++ < 200) {
      vals = items.map(function () { return rng.int(1, Math.max(1, Math.floor(max / step))) * step; });
      var mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals);
      if (vals.filter(function (v) { return v === mx; }).length === 1 && vals.filter(function (v) { return v === mn; }).length === 1) break;
    }
    return { title: t(set.title), cats: items.map(function (it, i) { return { icon: it[0], label: G.lang() === 'he' ? it[2] : it[1], v: vals[i] }; }) };
  }
  function tableHTML(cats, tally) {
    return '<table class="table" style="max-width:380px;font-size:1.1em"><tr><th>' + U.esc(t('g_choice')) + '</th><th>' + U.esc(t(tally ? 'g_tally' : 'g_votes')) + '</th></tr>' +
      cats.map(function (c) { return '<tr><td>' + c.icon + ' ' + U.esc(c.label) + '</td><td class="math" style="font-weight:800">' + (tally ? S.tally(c.v) : c.v) + '</td></tr>'; }).join('') + '</table>';
  }
  function graphQuestion(rng, d, L, visual, extra) {
    var cats = d.cats, q, kinds = L <= 1 ? ['read', 'most'] : L <= 2 ? ['read', 'most', 'least'] : L <= 3 ? ['read', 'diff', 'most', 'least'] : ['diff', 'total', 'sum2', 'read'];
    if (extra) kinds = extra;
    var k = rng.pick(kinds), a = rng.pick(cats), b = rng.pick(cats.filter(function (x) { return x !== a; }));
    var catOpts = function () { return cats.map(function (c) { return { v: c.icon, label: c.icon + ' ' + c.label }; }); };
    var name = function (c) { return c.icon + ' ' + c.label; };
    if (k === 'read') q = { ui: L <= 1 ? 'choice' : 'input', prompt: t('q_g_read', { c: name(a) }), data: L <= 1 ? { options: G.numOpts(a.v, rng, { n: 3, min: 0 }) } : { kind: 'int' }, answer: a.v };
    else if (k === 'most' || k === 'least') { var target = cats.slice().sort(function (x, y) { return k === 'most' ? y.v - x.v : x.v - y.v; })[0]; q = { ui: 'choice', prompt: t(k === 'most' ? 'q_g_most' : 'q_g_least'), data: { options: catOpts(), layout: 'two' }, answer: target.icon }; }
    else if (k === 'diff') { var hi = a.v >= b.v ? a : b, lo = hi === a ? b : a; if (hi.v === lo.v) return null; q = { ui: 'input', prompt: t('q_g_diff', { a: name(hi), b: name(lo) }), data: { kind: 'int' }, answer: hi.v - lo.v }; q.hints = G.hintList(t('hc_diff'), { text: m(hi.v + ' − ' + lo.v) }); }
    else if (k === 'total') q = { ui: 'input', prompt: t('q_g_total'), data: { kind: 'int' }, answer: U.sum(cats, function (c) { return c.v; }) };
    else if (k === 'sum2') q = { ui: 'input', prompt: t('q_g_sum2', { a: name(a), b: name(b) }), data: { kind: 'int' }, answer: a.v + b.v };
    else if (k === 'multi') {
      var trio = rng.sample(cats, 3), s = trio[0].v + trio[1].v;
      if (s <= trio[2].v) return null;
      q = { ui: 'input', prompt: t('q_g_multi', { a: name(trio[0]), b: name(trio[1]), c: name(trio[2]) }), data: { kind: 'int' }, answer: s - trio[2].v };
      q.hints = G.hintList(t('hc_word2'), { text: m(trio[0].v + ' + ' + trio[1].v + ' − ' + trio[2].v) });
    }
    q.visual = visual;
    q.hints = q.hints || G.hintList(t('hc_graph'), { text: t('hc_graph_scale') });
    q.sig = 'graph:' + k + ':' + cats.map(function (c) { return c.icon + c.v; }).join(',') + ':' + q.prompt.length;
    return q;
  }
  G.register('graph', function (c) {
    var rng = c.rng, p = c.p, L = c.level, max = Math.max(5, Math.round((p.max || 10) * [.6, .8, 1, 1, 1][L - 1])), kind = p.kind, q, d, scale = p.scale || 1;
    if (kind === 'questions') kind = rng.pick(['picto', 'bar', 'table']);
    if (kind === 'table' || kind === 'tally') {
      d = makeData(rng, kind === 'tally' ? Math.min(max, 20) : max, 1, L <= 2 ? 3 : 4);
      return graphQuestion(rng, d, L, '<div class="bold">' + U.esc(d.title) + '</div>' + tableHTML(d.cats, kind === 'tally'));
    }
    if (kind === 'picto') {
      var stepP = scale > 1 && L >= 4 ? scale / 2 : scale;
      d = makeData(rng, Math.min(max, scale * 8), stepP, L <= 2 ? 3 : 4);
      var vis = '<div class="bold">' + U.esc(d.title) + '</div>' + S.picto(d.cats, { scale: scale, keyText: scale > 1 ? t('g_key', { n: scale }) : null });
      return graphQuestion(rng, d, L, vis);
    }
    if (kind === 'bar') {
      var st = scale, stepB = L >= 4 && st >= 2 ? st / 2 : st;
      d = makeData(rng, Math.max(st * 4, Math.min(max, st * 10)), stepB, L <= 2 ? 3 : 4);
      if (L === 5 && (p.max || 10) <= 10) {
        var cats = d.cats.slice(0, 3);
        q = { ui: 'bargraph', prompt: t('q_g_build'), visual: tableHTML(cats), data: { cats: cats.map(function (x) { return { label: x.label, icon: x.icon }; }), max: Math.max(6, Math.max.apply(null, cats.map(function (x) { return x.v; }))), step: 1 }, answer: cats.map(function (x) { return x.v; }) };
        q.hints = G.hintList(t('hc_graph'));
        q.sig = 'gbuild:' + cats.map(function (x) { return x.icon + x.v; }).join('');
        return q;
      }
      var vmax = Math.ceil(Math.max.apply(null, d.cats.map(function (x) { return x.v; })) / st) * st;
      return graphQuestion(rng, d, L, S.barChart(d.cats, { max: Math.max(vmax, st * 2), step: st, title: d.title }));
    }
    if (kind === 'compare' || kind === 'multistep') {
      d = makeData(rng, max, scale, 4);
      if (kind === 'compare') {
        var d2 = d.cats.map(function (x) { return { icon: x.icon, label: x.label, v: Math.max(1, x.v + rng.int(-3, 3)) }; });
        var html = '<table class="table" style="max-width:440px"><tr><th>' + U.esc(t('g_choice')) + '</th><th>' + U.esc(t('class_a')) + '</th><th>' + U.esc(t('class_b')) + '</th></tr>' + d.cats.map(function (x, i) { return '<tr><td>' + x.icon + ' ' + U.esc(x.label) + '</td><td class="math bold">' + x.v + '</td><td class="math bold">' + d2[i].v + '</td></tr>'; }).join('') + '</table>';
        var ta = U.sum(d.cats, function (x) { return x.v; }), tb = U.sum(d2, function (x) { return x.v; });
        if (L >= 4 && ta !== tb) q = { ui: 'choice', prompt: t('q_g_cmp_tot'), visual: html, data: { options: [{ v: 'A', label: t('class_a') }, { v: 'B', label: t('class_b') }], layout: 'two' }, answer: ta > tb ? 'A' : 'B' };
        else {
          var idx = d.cats.findIndex(function (x, i) { return x.v > d2[i].v; });
          if (idx < 0) return null;
          q = { ui: 'input', prompt: t('q_g_cmp_class', { c: d.cats[idx].icon + ' ' + d.cats[idx].label }), visual: html, data: { kind: 'int' }, answer: d.cats[idx].v - d2[idx].v };
        }
        q.hints = G.hintList(t('hc_diff'));
        q.sig = 'gcmp:' + JSON.stringify(d.cats.map(function (x) { return x.v; })) + JSON.stringify(d2.map(function (x) { return x.v; })) + q.ui;
        return q;
      }
      return graphQuestion(rng, d, L, S.barChart(d.cats, { max: Math.ceil(Math.max.apply(null, d.cats.map(function (x) { return x.v; })) / scale) * scale, step: scale > 1 ? scale : Math.max(1, Math.round(max / 10)), title: d.title }), ['multi', 'sum2', 'total', 'diff']);
    }
    if (kind === 'line') {
      var plant = rng.chance(.5), labels = plant ? U.range(1, 7).map(function (i) { return (G.lang() === 'he' ? 'שבוע ' : 'Wk ') + i; }) : U.range(0, 6).map(function (i) { return U.weekdayName(i, 'short'); });
      var vals = [], v0 = plant ? rng.int(1, 4) : rng.int(12, 22);
      labels.forEach(function (l, i) { v0 = plant ? v0 + rng.int(0, 4) : U.clamp(v0 + rng.int(-4, 4), 5, 30); vals.push(v0); });
      var lmax = Math.ceil(Math.max.apply(null, vals) / 5) * 5 + 5, pts2 = labels.map(function (l, i) { return { label: l, v: vals[i] }; }), qk = rng.pick(L <= 2 ? ['read'] : ['read', 'change', 'max']);
      if (qk === 'max' && vals.filter(function (v) { return v === Math.max.apply(null, vals); }).length > 1) qk = 'read';
      var vis2 = S.lineChart(pts2, { max: lmax, step: 5, unit: t(plant ? 'g_plant' : 'g_temp') });
      var i1 = rng.int(0, labels.length - 1), i2 = rng.int(0, labels.length - 1);
      if (qk === 'read') q = { ui: 'input', prompt: t('q_line_read', { l: labels[i1] }), visual: vis2, data: { kind: 'int' }, answer: vals[i1] };
      else if (qk === 'change') { if (i1 === i2) i2 = (i1 + 2) % labels.length; var lo2 = Math.min(i1, i2), hi2 = Math.max(i1, i2); q = { ui: 'input', prompt: t('q_line_change', { a: labels[lo2], b: labels[hi2] }), visual: vis2, data: { kind: 'int' }, answer: Math.abs(vals[hi2] - vals[lo2]) }; }
      else { var mi = vals.indexOf(Math.max.apply(null, vals)); q = { ui: 'choice', prompt: t('q_line_max'), visual: vis2, data: { options: rng.shuffle(labels.map(function (l, i) { return { v: i, label: l }; })).slice(0, 4).concat([]), layout: 'two' }, answer: mi }; if (!q.data.options.some(function (o) { return o.v === mi; })) q.data.options[0] = { v: mi, label: labels[mi] }; q.data.options = rng.shuffle(q.data.options); }
      q.hints = G.hintList(t('hc_graph'), { text: t('hc_graph_scale') });
      q.sig = 'gline:' + vals.join(',') + qk + i1 + i2;
      return q;
    }
    return null;
  });

  var MARBLE = { red: '#FF5C5C', blue: '#3B82F6', green: '#22C55E', yellow: '#FACC15' };
  function bagSvg(counts) {
    var g = '<path d="M40 60 Q20 200 110 210 Q200 200 180 60 Z" fill="#F3E5D0" stroke="#8D6E63" stroke-width="4"/><path d="M60 60 Q110 30 160 60" stroke="#8D6E63" stroke-width="5" fill="none"/>', all = [];
    Object.keys(counts).forEach(function (k) { for (var i = 0; i < counts[k]; i++) all.push(MARBLE[k]); });
    all.forEach(function (col, i) { g += '<circle cx="' + (62 + (i % 5) * 24) + '" cy="' + (90 + Math.floor(i / 5) * 24) + '" r="10" fill="' + col + '" stroke="#23233A" stroke-width="1.5"/>'; });
    return S.wrap(220, 220, g, { width: 200 });
  }
  G.register('prob', function (c) {
    var rng = c.rng, L = c.level, q, counts = {}, cols = rng.sample(Object.keys(MARBLE), L <= 2 ? 2 : 3);
    var kind = rng.pick(L <= 3 ? ['likely', 'likely', 'most'] : ['likely', 'most']);
    if (kind === 'most') {
      var nums = rng.sample(U.range(1, 9), cols.length);
      cols.forEach(function (k, i) { counts[k] = nums[i]; });
      var best = cols[nums.indexOf(Math.max.apply(null, nums))];
      q = { ui: 'choice', prompt: t('q_prob_most'), visual: bagSvg(counts), data: { options: cols.map(function (k) { return { v: k, html: '<span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:' + MARBLE[k] + '"></span> ' + U.esc(t('col_' + k)), aria: t('col_' + k) }; }), layout: 'two' }, answer: best };
    } else {
      var target = cols[0], cat = rng.pick(['certain', 'likely', 'unlikely', 'impossible']), total = rng.int(6, 10), tn;
      if (cat === 'certain') tn = total; else if (cat === 'impossible') tn = 0; else if (cat === 'likely') tn = rng.int(Math.floor(total / 2) + 1, total - 1); else tn = rng.int(1, Math.ceil(total / 2) - 1);
      counts[target] = tn;
      var rest = total - tn, others = cols.slice(1);
      others.forEach(function (k, i) { counts[k] = i === others.length - 1 ? rest : rng.int(0, rest); rest -= counts[k]; });
      q = { ui: 'choice', prompt: t('q_prob', { c: t('col_' + target) }), visual: bagSvg(counts), data: { options: ['certain', 'likely', 'unlikely', 'impossible'].map(function (k) { return { v: k, label: t('p_' + k) }; }), layout: 'two' }, answer: cat };
      q.verify = function () { var tot = U.sum(Object.keys(counts).map(function (k) { return counts[k]; })), r = counts[target] / tot; return cat === 'certain' ? r === 1 : cat === 'impossible' ? r === 0 : cat === 'likely' ? r > .5 && r < 1 : r > 0 && r < .5; };
    }
    q.hints = G.hintList(t('hc_prob'));
    q.sig = 'prob:' + kind + JSON.stringify(counts);
    return q;
  });

  /* ------------------------------------------------------------------ logic */
  var TF = [
    ['The sum of two odd numbers is always even.', 'סכום של שני מספרים אי־זוגיים הוא תמיד זוגי.', true],
    ['Every square is also a rectangle.', 'כל ריבוע הוא גם מלבן.', true],
    ['A triangle can have two right angles.', 'למשולש יכולות להיות שתי זוויות ישרות.', false],
    ['Any number multiplied by 0 is 0.', 'כל מספר כפול 0 שווה 0.', true],
    ['Any number multiplied by 1 stays the same.', 'כל מספר כפול 1 נשאר אותו מספר.', true],
    ['When you add 10 to a number, its ones digit stays the same.', 'כשמוסיפים 10 למספר, ספרת היחידות שלו לא משתנה.', true],
    ['An odd number plus an even number is even.', 'מספר אי־זוגי ועוד מספר זוגי הוא זוגי.', false],
    ['Changing the order of numbers in addition changes the answer.', 'שינוי סדר המספרים בחיבור משנה את התשובה.', false],
    ['Changing the order of numbers in subtraction can change the answer.', 'שינוי סדר המספרים בחיסור יכול לשנות את התשובה.', true],
    ['Every multiple of 10 is also a multiple of 5.', 'כל כפולה של 10 היא גם כפולה של 5.', true],
    ['Every multiple of 5 is also a multiple of 10.', 'כל כפולה של 5 היא גם כפולה של 10.', false],
    ['A rectangle always has 4 equal sides.', 'למלבן תמיד יש 4 צלעות שוות.', false],
    ['Half of an even number is always even.', 'חצי של מספר זוגי הוא תמיד זוגי.', false],
    ['1/2 is bigger than 1/3.', '1/2 גדול מ־1/3.', true],
    ['A bigger denominator means bigger pieces.', 'מכנה גדול יותר פירושו חלקים גדולים יותר.', false]
  ];
  G.register('logic', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q, max = p.max || 100;
    if (p.kind === 'riddle') {
      var lo = 10, hi = Math.min(99, Math.max(30, Math.round(max * [.3, .5, .8, 1, 1][L - 1]))), secret = rng.int(lo, hi), cand = U.range(lo, hi + 1), clues = [];
      var ds = function (n) { return String(n).split('').reduce(function (s, d) { return s + +d; }, 0); }, tens = function (n) { return Math.floor(n / 10) % 10; };
      var pool = rng.shuffle([
        function () { var a = Math.max(lo, secret - rng.int(3, 12)), b = Math.min(hi + 5, secret + rng.int(3, 12)); return { txt: t('rd_between', { a: a, b: b }), ok: function (n) { return n > a && n < b; } }; },
        function () { return { txt: t(secret % 2 ? 'rd_odd' : 'rd_even'), ok: function (n) { return n % 2 === secret % 2; } }; },
        function () { var s = ds(secret); return { txt: t('rd_dsum', { s: s }), ok: function (n) { return ds(n) === s; } }; },
        function () { var k = [3, 4, 5, 6].filter(function (x) { return secret % x === 0; })[0]; return k ? { txt: t('rd_mult', { k: k }), ok: function (n) { return n % k === 0; } } : null; },
        function () { var o = secret % 10, tt = tens(secret); if (o === tt) return null; return { txt: t(tt > o ? 'rd_tens_gt' : 'rd_tens_lt'), ok: function (n) { return tt > o ? tens(n) > n % 10 : tens(n) < n % 10; } }; },
        function () { var o = secret % 10; return { txt: t('rd_ones', { d: o }), ok: function (n) { return n % 10 === o; } }; }
      ]);
      for (var i = 0; i < pool.length && cand.length > 1; i++) {
        var cl = pool[i](); if (!cl) continue;
        var next = cand.filter(cl.ok);
        if (next.length < cand.length && next.indexOf(secret) >= 0) { clues.push(cl); cand = next; }
      }
      if (cand.length !== 1 || cand[0] !== secret) return null;
      q = { ui: 'input', prompt: t('q_riddle'), visual: '<div class="stack tight" style="text-align:start;font-weight:700">' + clues.map(function (x) { return '<div>🔎 ' + U.esc(x.txt) + '</div>'; }).join('') + '</div>', data: { kind: 'int' }, answer: secret };
      q.verify = function () { return clues.every(function (x) { return x.ok(secret); }) && U.range(lo, hi + 1).filter(function (n) { return clues.every(function (x) { return x.ok(n); }); }).length === 1; };
      q.hints = G.hintList(t('hc_riddle'));
      q.sig = 'riddle:' + secret + clues.map(function (x) { return x.txt; }).join('|');
      return q;
    }
    if (p.kind === 'truefalse') {
      var stmt, truth;
      if (rng.chance(.5)) { var s = rng.pick(TF); stmt = G.lang() === 'he' ? s[1] : s[0]; truth = s[2]; stmt = stmt.replace(/(\d+\/\d+)/g, function (x) { return m(x); }); }
      else {
        var a = rng.int(2, 12), b = rng.int(2, 12), form = rng.int(0, 2), val, shown;
        if (form === 0) { val = a * b; shown = rng.chance(.5) ? val : val + rng.pick([-a, a, 1, -1, 10]); stmt = m(a + ' × ' + b + ' = ' + shown); truth = shown === val; }
        else if (form === 1) { var big = rng.int(20, max >= 1000 ? 999 : 99); val = big + a; shown = rng.chance(.5) ? val : val + rng.pick([10, -10, 1]); stmt = m(f(big) + ' + ' + a + ' = ' + f(shown)); truth = shown === val; }
        else { var n = rng.int(11, 99); if (n % 10 === 5 || n % 10 === 0) return null; var lo10 = Math.floor(n / 10) * 10, hi10 = lo10 + 10, near = n - lo10 < hi10 - n ? lo10 : hi10, far = near === lo10 ? hi10 : lo10; truth = rng.chance(.5); stmt = t('tf_closer', { n: n, a: truth ? near : far, b: truth ? far : near }); }
      }
      q = { ui: 'choice', prompt: t('q_tf'), visual: '<div class="notice" style="font-size:1.15em;font-weight:700">' + U.esc(stmt) + '</div>', data: { options: [{ v: true, label: '✅ ' + t('q_true') }, { v: false, label: '❌ ' + t('q_false') }], layout: 'two' }, answer: truth };
      q.hints = G.hintList(t('hc_tf'));
      q.sig = 'tf:' + stmt;
      return q;
    }
    if (p.kind === 'symbols') {
      var emo = rng.sample(['🍎', '🍌', '🍇', '⭐', '🌙', '🐱'], 3), A = rng.int(2, Math.min(15, Math.floor(max / 3))), B = rng.int(1, 12), C2 = rng.int(1, 9), k = rng.int(2, 3), lines, ask, ans;
      lines = [U.range(k).map(function () { return emo[0]; }).join(' + ') + ' = ' + k * A, emo[0] + ' + ' + emo[1] + ' = ' + (A + B)];
      if (L >= 3) lines.push(emo[1] + ' − ' + emo[2] + ' = ' + (B - C2));
      if (L >= 3 && B - C2 < 0) return null;
      if (L >= 4) { ask = emo[0] + ' + ' + emo[1] + ' + ' + emo[2]; ans = A + B + C2; q = { prompt: t('q_symbols_expr', { e: ask }) }; }
      else if (L === 3) { ask = emo[2]; ans = C2; q = { prompt: t('q_symbols', { s: ask }) }; }
      else { ask = emo[1]; ans = B; q = { prompt: t('q_symbols', { s: ask }) }; }
      q.ui = 'input'; q.data = { kind: 'int' }; q.answer = ans;
      q.visual = '<div class="stack tight" style="font-size:1.6rem;font-weight:800;direction:ltr">' + lines.map(function (l) { return '<div>' + U.esc(l) + '</div>'; }).join('') + '</div>';
      q.hints = G.hintList(t('hc_symbols'), { text: emo[0] + ' = ' + A });
      q.sig = 'sym:' + lines.join('|') + ask;
      q.verify = function () { return ans >= 0; };
      return q;
    }
    var form2 = rng.int(0, 3), ans2;
    if (form2 === 0) { var s2 = rng.int(2, 5), pn = rng.int(2, 4); q = { prompt: t('q_outfits', { s: s2, p: pn }) }; ans2 = s2 * pn; q.hints = G.hintList(t('hc_strategy'), { text: m(s2 + ' × ' + pn) }); }
    else if (form2 === 1) { var nn = rng.int(3, 6); q = { prompt: t('q_handshakes', { n: nn }) }; ans2 = nn * (nn - 1) / 2; q.hints = G.hintList(t('hc_strategy'), { text: m(U.range(1, nn).reverse().join(' + ')) }); }
    else if (form2 === 2) { var N = rng.int(5, 15); q = { prompt: t('q_pairs_sum', { n: N }) }; ans2 = U.range(1, 10).filter(function (a2) { var b2 = N - a2; return b2 > a2 && b2 <= 9; }).length; if (!ans2) return null; q.hints = G.hintList(t('hc_strategy'), { text: m('1 + ' + (N - 1) + ', 2 + ' + (N - 2) + ', …') }); }
    else { var dg = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3); q = { prompt: t('q_two_digit', { a: dg[0], b: dg[1], c: dg[2] }) }; ans2 = 6; q.hints = G.hintList(t('hc_strategy'), { text: m(dg[0] + '' + dg[1] + ', ' + dg[0] + '' + dg[2] + ', ' + dg[1] + '' + dg[0] + ', …') }); }
    q.ui = 'input'; q.data = { kind: 'int' }; q.answer = ans2;
    q.sig = 'strat:' + q.prompt;
    return q;
  });
  MA.i18n.add({ en: { tf_closer: '{n} is closer to {a} than to {b}.' }, he: { tf_closer: '{n} קרוב יותר ל־{a} מאשר ל־{b}.' } });
})(window.MA = window.MA || {});
