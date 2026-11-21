/* Question generator framework: registry, validation, distractors, shared word banks.
   A generator family is a function(ctx) -> question. ctx = { level 1-5, p: skill params, rng, skill, prefer, t, L }.
   Question contract (consumed by renderers + player):
     ui, prompt, sub?, visual? (trusted SVG/HTML), data, answer, check?(ans), hints[{text, svg?}], explain{text, svg?}, sig, verify?() */
(function (MA) {
  'use strict';
  var G = MA.gen = { fam: {} };
  var t = function (k, p) { return MA.t(k, p); };
  G.UIS = ['choice', 'input', 'compare', 'order', 'sort', 'match', 'memory', 'numberline', 'count', 'group', 'array', 'fraction', 'placevalue', 'column', 'clock', 'money', 'grid', 'bargraph'];
  G.register = function (name, fn) { G.fam[name] = fn; };
  G.L = function (level, arr) { return arr[Math.max(0, Math.min(arr.length, level) - 1)]; };
  G.fmt = function (n) { return MA.u.num(n); };
  G.check = function (q, ans) { return q.check ? !!q.check(ans) : MA.u.eq(ans, q.answer); };

  G.validate = function (q) {
    var e = [];
    if (!q || typeof q !== 'object') return { ok: false, errors: ['no question'] };
    if (!q.prompt || typeof q.prompt !== 'string') e.push('missing prompt');
    var blob = String(q.prompt) + ' ' + (q.sub || '') + ' ' + JSON.stringify(q.data || {}) + ' ' + (q.hints || []).map(function (h) { return h.text; }).join(' ');
    if (/undefined|NaN|\[object Object\]|Infinity|\{[a-z_]+\}/.test(blob)) e.push('broken text: ' + blob.slice(0, 160));
    if (q.answer === undefined || q.answer === null || (typeof q.answer === 'number' && !isFinite(q.answer))) e.push('missing answer');
    if (G.UIS.indexOf(q.ui) < 0) e.push('unknown ui ' + q.ui);
    try { if (!G.check(q, q.answer)) e.push('answer fails its own check'); } catch (x) { e.push('check threw ' + x.message); }
    var d = q.data || {};
    if (d.options) {
      if (d.options.length < 2) e.push('fewer than 2 options');
      var keys = d.options.map(function (o) { return JSON.stringify(o.v); });
      if (MA.u.uniq(keys).length !== keys.length) e.push('duplicate option values');
      var labels = d.options.map(function (o) { return (o.label || '') + (o.html || ''); });
      if (MA.u.uniq(labels).length !== labels.length) e.push('duplicate option labels');
      if (!d.multi) {
        var nOk = d.options.filter(function (o) { try { return G.check(q, o.v); } catch (x) { return false; } }).length;
        if (nOk !== 1) e.push(nOk + ' correct options');
      } else if (!Array.isArray(q.answer) || !q.answer.length) e.push('multi answer must be a non-empty array');
    }
    if (q.ui === 'input' && d.kind === 'int' && typeof q.answer === 'number' && Math.round(q.answer) !== q.answer) e.push('int input with fractional answer');
    if (q.verify) { try { if (!q.verify()) e.push('independent verification failed'); } catch (x) { e.push('verify threw ' + x.message); } }
    if (q.meta && q.meta.range && typeof q.answer === 'number' && (q.answer < q.meta.range[0] || q.answer > q.meta.range[1])) e.push('answer ' + q.answer + ' outside skill range');
    if (!q.sig) e.push('missing signature');
    return { ok: !e.length, errors: e };
  };

  /* Generate one validated question for a skill. Never shows an unvalidated question. */
  G.make = function (skill, level, opts) {
    opts = opts || {};
    var fam = G.fam[skill.gen], lastErr = 'unknown generator ' + skill.gen, seen = opts.seen;
    level = MA.u.clamp(Math.round(level || 1), 1, 5);
    if (!fam) { G.report(skill, level, lastErr); return null; }
    for (var i = 0; i < 40; i++) {
      var rng = opts.rng || MA.u.rng;
      var ctx = { level: level, p: skill.params || {}, rng: rng, skill: skill, prefer: opts.prefer, grade: skill.grade, t: t, L: function (arr) { return G.L(level, arr); } };
      var q;
      try { q = fam(ctx); } catch (x) { lastErr = 'threw: ' + x.message; continue; }
      if (!q) { lastErr = 'returned nothing'; continue; }
      q.kind = skill.gen; q.skillId = skill.id; q.level = level;
      q.hints = (q.hints || []).filter(function (h) { return h && h.text; });
      q.sig = q.sig || (skill.gen + ':' + q.prompt + ':' + JSON.stringify(q.answer));
      var v = G.validate(q);
      if (!v.ok) { lastErr = v.errors.join('; '); continue; }
      if (seen && seen.has(q.sig) && i < 32) continue;
      if (seen) seen.add(q.sig);
      return q;
    }
    G.report(skill, level, lastErr);
    return null;
  };
  G.report = function (skill, level, msg) { MA.errors.capture(new Error('Question generation failed for ' + skill.id + ' L' + level + ': ' + msg), 'generator'); };

  /* Questions written by administrators in the question bank (choice or numeric input). */
  G.fromBank = function (bq) {
    var tl = MA.tl, q = { kind: 'bank', ui: bq.type === 'choice' ? 'choice' : 'input', prompt: tl(bq.prompt), sig: 'bank:' + bq.id, bankId: bq.id, level: bq.difficulty || 2 };
    if (bq.type === 'choice') {
      q.data = { options: (bq.options || []).map(function (o, i) { return { v: i, label: tl(o) }; }), layout: 'col' };
      q.answer = bq.answer;
    } else { q.data = { kind: Math.round(+bq.answer) === +bq.answer ? 'int' : 'dec' }; q.answer = +bq.answer; }
    q.hints = bq.hint && tl(bq.hint) ? [{ text: tl(bq.hint) }] : [];
    q.explain = { text: tl(bq.explanation) || '' };
    var v = G.validate(q);
    return v.ok ? q : null;
  };

  /* ---------------------------------------------------------------- helpers */
  G.numOpts = function (ans, rng, o) {
    o = o || {};
    var n = o.n || 4, min = o.min == null ? 0 : o.min, max = o.max == null ? Infinity : o.max, step = o.step || 1, set = [ans], cands = (o.cands || []).slice();
    (o.deltas || [1, -1, 2, -2, 10, -10]).forEach(function (d) { cands.push(ans + d * step); });
    if (ans >= 10 && ans < 100 && ans % 10 !== Math.floor(ans / 10)) cands.push((ans % 10) * 10 + Math.floor(ans / 10));
    cands = rng.shuffle(cands);
    var okv = function (v) { return v >= min && v <= max && set.indexOf(v) < 0 && (o.allowFrac || Math.round(v) === v) && isFinite(v); };
    cands.forEach(function (c) { if (set.length < n && okv(c)) set.push(c); });
    var guard = 0;
    while (set.length < n && guard++ < 200) { var r = ans + rng.int(-Math.max(5, Math.round(ans * .3)), Math.max(5, Math.round(ans * .3))) * step; if (okv(r)) set.push(r); }
    return rng.shuffle(set).map(function (v) { return { v: v, label: o.label ? o.label(v) : G.fmt(v) }; });
  };
  G.textOpts = function (pairs, rng) { return rng.shuffle(pairs.map(function (p) { return { v: p[0], label: p[1] }; })); };
  G.hintList = function (clue, visual, example) {
    var out = [];
    if (clue) out.push(typeof clue === 'string' ? { text: clue } : clue);
    if (visual) out.push(typeof visual === 'string' ? { text: visual } : visual);
    if (example) out.push({ text: t('hint_example') + ': ' + (example.text || example), svg: example.svg });
    return out;
  };
  G.eqTokens = function (str) {
    /* "3 + _ = 8" -> tokens with one blank */
    return str.split(' ').map(function (s) { return s === '_' ? { blank: true } : s; });
  };
  G.eqText = function (str) { return str.replace('_', '?'); };
  G.digitsOf = function (n) { return String(n).split('').map(Number); };
  G.randDigits = function (rng, digits) { var lo = Math.pow(10, digits - 1), hi = Math.pow(10, digits) - 1; return rng.int(digits === 1 ? 2 : lo, hi); };

  /* ---------------------------------------------------------------- word banks */
  G.ITEMS = [
    { e: '🍎', en: ['apple', 'apples'], he: ['תפוח', 'תפוחים'], g: 'm', fruit: 1 },
    { e: '🍌', en: ['banana', 'bananas'], he: ['בננה', 'בננות'], g: 'f', fruit: 1 },
    { e: '🍓', en: ['strawberry', 'strawberries'], he: ['תות', 'תותים'], g: 'm', fruit: 1 },
    { e: '🍪', en: ['cookie', 'cookies'], he: ['עוגייה', 'עוגיות'], g: 'f', food: 1 },
    { e: '🍬', en: ['candy', 'candies'], he: ['סוכרייה', 'סוכריות'], g: 'f', food: 1 },
    { e: '⭐', en: ['star', 'stars'], he: ['כוכב', 'כוכבים'], g: 'm' },
    { e: '🎈', en: ['balloon', 'balloons'], he: ['בלון', 'בלונים'], g: 'm', toy: 1 },
    { e: '⚽', en: ['ball', 'balls'], he: ['כדור', 'כדורים'], g: 'm', toy: 1 },
    { e: '🚗', en: ['toy car', 'toy cars'], he: ['מכונית צעצוע', 'מכוניות צעצוע'], g: 'f', toy: 1 },
    { e: '🐟', en: ['fish', 'fish'], he: ['דג', 'דגים'], g: 'm', animal: 1 },
    { e: '🦋', en: ['butterfly', 'butterflies'], he: ['פרפר', 'פרפרים'], g: 'm', animal: 1 },
    { e: '🐣', en: ['chick', 'chicks'], he: ['אפרוח', 'אפרוחים'], g: 'm', animal: 1 },
    { e: '🌸', en: ['flower', 'flowers'], he: ['פרח', 'פרחים'], g: 'm' },
    { e: '✏️', en: ['pencil', 'pencils'], he: ['עיפרון', 'עפרונות'], g: 'm', school: 1 },
    { e: '📚', en: ['book', 'books'], he: ['ספר', 'ספרים'], g: 'm', school: 1 },
    { e: '🐚', en: ['shell', 'shells'], he: ['צדף', 'צדפים'], g: 'm' },
    { e: '🥕', en: ['carrot', 'carrots'], he: ['גזר', 'גזרים'], g: 'm', food: 1 },
    { e: '🍩', en: ['donut', 'donuts'], he: ['סופגנייה', 'סופגניות'], g: 'f', food: 1 }
  ];
  G.NAMES = {
    en: [['Maya', 'f'], ['Leo', 'm'], ['Sara', 'f'], ['Omar', 'm'], ['Noa', 'f'], ['Ben', 'm'], ['Lily', 'f'], ['Adam', 'm'], ['Mia', 'f'], ['Sam', 'm'], ['Zoe', 'f'], ['Eli', 'm'], ['Aisha', 'f'], ['Kai', 'm']],
    he: [['נועה', 'f'], ['דניאל', 'm'], ['מאיה', 'f'], ['יונתן', 'm'], ['תמר', 'f'], ['איתי', 'm'], ['שירה', 'f'], ['עומר', 'm'], ['יעל', 'f'], ['אורי', 'm'], ['ליה', 'f'], ['אדם', 'm'], ['רוני', 'f'], ['אמיר', 'm']]
  };
  G.lang = function () { return MA.i18n.lang === 'he' ? 'he' : 'en'; };
  G.person = function (rng, not) {
    var list = G.NAMES[G.lang()].filter(function (x) { return !not || x[0] !== not; }), p = rng.pick(list);
    return { name: p[0], g: p[1] };
  };
  G.item = function (rng, filter) { var l = G.ITEMS.filter(filter || function () { return true; }); return rng.pick(l); };
  G.word = function (it, n) { var L = G.lang(); return it[L][n === 1 ? 0 : 1]; };
  /* "5 apples" / "תפוח אחד" with correct agreement */
  G.qty = function (n, it) {
    if (G.lang() === 'he') return n === 1 ? it.he[0] + ' ' + (it.g === 'f' ? 'אחת' : 'אחד') : (n === 2 ? (it.g === 'f' ? 'שתי ' : 'שני ') + it.he[1] : G.fmt(n) + ' ' + it.he[1]);
    return G.fmt(n) + ' ' + it.en[n === 1 ? 0 : 1];
  };
  G.he = function (p, m, f) { return p.g === 'f' ? f : m; };
  G.money = function (n) { return G.lang() === 'he' ? G.fmt(n) + ' ₪' : '$' + G.fmt(n); };
  G.currency = function () { return G.lang() === 'he' ? 'ILS' : 'USD'; };

  /* Everything a child needs to hear for a question: story, instructions, the exercise and the answer choices. */
  function spokenLabel(o) {
    if (o == null) return '';
    if (typeof o !== 'object') return String(o);
    return String(o.aria || (o.label != null ? o.label : '') || '');
  }
  function spokenToken(tok) {
    if (tok == null) return '';
    if (typeof tok !== 'object') return String(tok);
    if (tok.blank || tok.blankFrac || tok.blankMixed) return '?';
    if (tok.frac) return (tok.frac[0] == null ? '?' : tok.frac[0]) + '/' + (tok.frac[1] == null ? '?' : tok.frac[1]);
    if (tok.mixed) return tok.mixed[0] + ' ' + tok.mixed[1] + '/' + tok.mixed[2];
    return '';
  }
  /* text shown in an HTML visual (statements, clues, sequences); drawings and fraction markup are skipped */
  function visualText(v) {
    if (!v || typeof v !== 'string' || /<svg|frac/i.test(v)) return '';
    return v.replace(/<\/(div|p|li)>|<br\s*\/?>/gi, '. ').replace(/<[^>]+>/g, ' ')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ').replace(/(\.\s*)+/g, '. ').replace(/^[\s.]+|[\s.]+$/g, '');
  }
  G.spoken = function (q, story) {
    var d = q.data || {}, parts = [], list;
    if (story) parts.push(story);
    parts.push(q.prompt);
    if (q.sub) parts.push(q.sub);
    parts.push(visualText(q.visual));
    if (d.eq && d.eq.length) { var eqs = d.eq.map(spokenToken).join(' ').trim(); if (/[^?\s\/]/.test(eqs)) parts.push(eqs + (d.unit ? ' ' + d.unit : '')); }
    else if (q.ui === 'column' && d.a != null) parts.push(G.fmt(d.a) + ' ' + (d.op === '-' ? '−' : d.op) + ' ' + G.fmt(d.b) + ' = ?');
    else if (q.ui === 'compare' && d.left != null && d.right != null) parts.push(t('read_compare', { a: spokenLabel(d.left), b: spokenLabel(d.right) }));
    if (d.options && d.options.length) list = d.options.map(spokenLabel);
    else if (q.ui === 'order' && d.items) list = d.items.map(spokenLabel);
    if (list && list.length && list.every(Boolean)) parts.push(t(q.ui === 'order' ? 'read_items' : 'read_options', { list: list.join(', ') }));
    else if (q.ui === 'sort' && d.bins && d.bins.length && d.bins.every(spokenLabel)) parts.push(t('read_groups', { list: d.bins.map(spokenLabel).join(', ') }));
    return G.sentences(parts);
  };
  /* join text pieces into sentences (adds a period where a piece has no closing punctuation) */
  G.sentences = function (parts) {
    return parts.filter(Boolean).map(function (p) { p = String(p).trim(); return /[.!?:;,]$/.test(p) ? p : p + '.'; }).join(' ');
  };

  MA.i18n.add({
    en: {
      q_how_many: 'How many {item} are there?', q_choose: 'Choose the correct answer', q_type: 'Type the answer', q_drag: 'Drag the items into place',
      q_solve: 'Solve:', q_what_number: 'What number is it?', q_true: 'True', q_false: 'False', q_yes: 'Yes', q_no: 'No',
      hc_read_again: 'Read the question again and find the important numbers.', hc_count_one: 'Point to each one and count slowly: 1, 2, 3…',
      q_ex_eq: '{eq}', q_answer_is: 'The answer is {a}.', q_because: 'Because {eq}.',
      read_options: 'The choices are: {list}.', read_items: 'The items are: {list}.', read_groups: 'The groups are: {list}.', read_compare: 'Compare {a} and {b}.'
    },
    he: {
      q_how_many: 'כמה {item} יש?', q_choose: 'בחרו את התשובה הנכונה', q_type: 'הקלידו את התשובה', q_drag: 'גררו את הפריטים למקום',
      q_solve: 'פתרו:', q_what_number: 'איזה מספר זה?', q_true: 'נכון', q_false: 'לא נכון', q_yes: 'כן', q_no: 'לא',
      hc_read_again: 'קראו שוב את השאלה ומצאו את המספרים החשובים.', hc_count_one: 'הצביעו על כל אחד וספרו לאט: 1, 2, 3…',
      q_ex_eq: '{eq}', q_answer_is: 'התשובה היא {a}.', q_because: 'כי {eq}.',
      read_options: 'האפשרויות הן: {list}.', read_items: 'הפריטים הם: {list}.', read_groups: 'הקבוצות הן: {list}.', read_compare: 'השוו בין {a} לבין {b}.'
    }
  });
})(window.MA = window.MA || {});
