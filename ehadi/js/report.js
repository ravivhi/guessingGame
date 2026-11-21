/* Weekly progress report for grown-ups (settings, behind the lock): how long the child played, what was
   practiced and how it went, what is going well, what needs practice and what to practice next week.
   Deliberately short: three numbers, one small chart, a topic list, and one example question per topic
   (topic names alone mean little to parents). */
(function (MA) {
  'use strict';
  var U = MA.u, h = U.h, db = MA.db, C = MA.content, A = MA.adapt, V = MA.views, t = function (k, p) { return MA.t(k, p); };
  var R = MA.report = {};
  var Q_CAP = 120000;   /* a question left open for longer counts as 2 minutes: an idle tab should not count as play */
  MA.i18n.add({
    en: {
      rp_tab: 'Weekly report', set_tab: 'Game settings', rp_title: "{name}'s week", rp_for: 'Report for',
      rp_time: 'Time played', rp_success: 'Correct answers', rp_days: 'Days played', rp_days_val: '{n} of 7',
      rp_more: '{v} more than last week', rp_less: '{v} less than last week', rp_same: 'About the same as last week',
      rp_up_from: 'Up from {v} last week', rp_down_from: 'Down from {v} last week',
      rp_per_day: 'Minutes each day', rp_topics: 'What was practiced', rp_acts: { one: '1 activity', other: '{n} activities' },
      rp_q: { one: '1 question', other: '{n} questions' }, rp_min: '{n} min', rp_lt_min: 'under a minute',
      rp_hours: function (p) { return p.h + ' h' + (p.m ? ' ' + p.m + ' min' : ''); },
      rp_st_star: 'Excellent', rp_st_good: 'Going well', rp_st_ok: 'Getting there', rp_st_help: 'Needs practice', rp_st_new: 'Just started',
      rp_up: 'Improving', rp_down: 'Harder lately', rp_example: 'Example', rp_example_title: 'An example question',
      rp_good: 'Going well', rp_hard: 'Worth practicing', rp_no_good: 'Not enough play yet to tell.', rp_no_hard: 'Nothing was especially hard this week.',
      rp_correct: '{n}% correct', rp_hints: 'many hints',
      rp_next: 'For next week', rp_why_practice: 'Practice again: still hard', rp_why_keep_going: 'Keep going: almost there', rp_why_new_skill: 'The next new topic',
      rp_why_review: 'A short review', rp_why_challenge: 'Ready for a harder level', rp_why_gap: 'Will help with {skill}',
      rp_tip_more: 'Tip: 10 to 15 minutes a day, 4 to 5 days a week, is plenty.', rp_tip_keep: 'A great week! Keep it up: 10 to 15 minutes a day is perfect.',
      rp_empty: 'No games were played this week yet.', rp_more_topics: { one: 'Show 1 more topic', other: 'Show {n} more topics' }
    },
    he: {
      rp_tab: 'דוח שבועי', set_tab: 'הגדרות המשחק', rp_title: 'השבוע של {name}', rp_for: 'דוח עבור',
      rp_time: 'זמן משחק', rp_success: 'תשובות נכונות', rp_days: 'ימי משחק', rp_days_val: '{n} מתוך 7',
      rp_more: '{v} יותר מהשבוע שעבר', rp_less: '{v} פחות מהשבוע שעבר', rp_same: 'בערך כמו בשבוע שעבר',
      rp_up_from: 'עלייה מ־{v} בשבוע שעבר', rp_down_from: 'ירידה מ־{v} בשבוע שעבר',
      rp_per_day: 'דקות בכל יום', rp_topics: 'מה תרגלו', rp_acts: { one: 'פעילות אחת', other: '{n} פעילויות' },
      rp_q: { one: 'שאלה אחת', other: '{n} שאלות' }, rp_min: '{n} דק׳', rp_lt_min: 'פחות מדקה',
      rp_hours: function (p) { return (p.h === 1 ? 'שעה' : p.h === 2 ? 'שעתיים' : p.h + ' שעות') + (p.m ? ' ו־' + p.m + ' דק׳' : ''); },
      rp_st_star: 'מצוין', rp_st_good: 'הולך טוב', rp_st_ok: 'בדרך הנכונה', rp_st_help: 'צריך עוד תרגול', rp_st_new: 'רק התחילו',
      rp_up: 'משתפר', rp_down: 'קשה יותר לאחרונה', rp_example: 'דוגמה', rp_example_title: 'שאלה לדוגמה',
      rp_good: 'מה הולך טוב', rp_hard: 'מה כדאי לחזק', rp_no_good: 'עוד מוקדם לדעת.', rp_no_hard: 'השבוע לא היה נושא קשה במיוחד.',
      rp_correct: '{n}% תשובות נכונות', rp_hints: 'הרבה רמזים',
      rp_next: 'לשבוע הבא', rp_why_practice: 'לחזור ולתרגל: עדיין קשה', rp_why_keep_going: 'להמשיך: כמעט שם', rp_why_new_skill: 'הנושא החדש הבא',
      rp_why_review: 'חזרה קצרה', rp_why_challenge: 'מוכנים לרמה קשה יותר', rp_why_gap: 'יעזור ב{skill}',
      rp_tip_more: 'טיפ: מספיקות 10 עד 15 דקות ביום, 4 עד 5 ימים בשבוע.', rp_tip_keep: 'שבוע מצוין! כדאי להמשיך כך: 10 עד 15 דקות ביום זה מושלם.',
      rp_empty: 'השבוע עוד לא שיחקו.', rp_more_topics: { one: 'להציג עוד נושא אחד', other: 'להציג עוד {n} נושאים' }
    }
  });

  /* ---------------------------------------------------------------- the numbers */
  function days(now, from) {
    var out = [];
    for (var i = 0; i < 7; i++) { var d = new Date(now); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + from + i); out.push({ key: U.dayKey(d.getTime()), ts: d.getTime(), ms: 0, answered: 0, correct: 0 }); }
    return out;
  }
  function trend(series) {
    if (series.length < 2) return null;
    var half = Math.floor(series.length / 2), a = U.avg(series.slice(0, half)), b = U.avg(series.slice(series.length - half));
    return b - a >= .1 ? 'up' : a - b >= .1 ? 'down' : 'flat';
  }
  /* the last 7 days (today included) and the 7 before them, for one player */
  R.week = function (st, now) {
    now = now == null ? U.now() : now;
    var week = days(now, -6), prev = days(now, -13), inWeek = {}, inPrev = {};
    week.forEach(function (d) { inWeek[d.key] = d; });
    prev.forEach(function (d) { inPrev[d.key] = d; });
    var W = { days: week, from: week[0].ts, to: week[6].ts, ms: 0, answered: 0, correct: 0, activities: 0, prevMs: 0, prevAnswered: 0, prevCorrect: 0 };
    db.all('attempts', function (a) { return a.studentId === st.id; }).forEach(function (a) {
      var k = U.dayKey(a.startedAt), ms = Math.min(a.timeMs || 0, Math.max(1, a.answered || 0) * Q_CAP);
      if (inWeek[k]) { inWeek[k].ms += ms; W.ms += ms; if (a.status === 'completed') W.activities++; }
      else if (inPrev[k]) W.prevMs += ms;
    });
    var topics = {};
    db.all('answers', function (a) { return a.studentId === st.id; }).sort(function (a, b) { return a.ts - b.ts; }).forEach(function (a) {
      var k = U.dayKey(a.ts);
      if (inPrev[k]) { W.prevAnswered++; if (a.firstTry) W.prevCorrect++; return; }
      if (!inWeek[k]) return;
      W.answered++; inWeek[k].answered++;
      if (a.firstTry) { W.correct++; inWeek[k].correct++; }
      var tp = topics[a.skillId] = topics[a.skillId] || { answered: 0, correct: 0, hints: 0, revealed: 0, ms: 0, sessions: {}, order: [] };
      tp.answered++; if (a.firstTry) tp.correct++;
      tp.hints += a.hints || 0; if (a.revealed) tp.revealed++;
      tp.ms += Math.min(a.ms || 0, Q_CAP);
      var s = tp.sessions[a.attemptId];
      if (!s) { s = tp.sessions[a.attemptId] = { n: 0, c: 0 }; tp.order.push(s); }
      s.n++; if (a.firstTry) s.c++;
    });
    W.topics = Object.keys(topics).map(function (id) {
      var tp = topics[id], sk = C.skill(id); if (!sk) return null;
      var p = A.view(st.id, id);
      tp.skill = sk; tp.acc = tp.correct / tp.answered; tp.level = p.level || 1;
      tp.series = tp.order.map(function (s) { return s.c / s.n; }).slice(-8);
      tp.trend = trend(tp.series);
      tp.manyHints = tp.hints / tp.answered >= .8;
      tp.status = tp.answered < 4 ? 'new' : A.isMastered(p) || (tp.acc >= .9 && tp.answered >= 8) ? 'star' : tp.acc >= .75 ? 'good' : tp.acc >= .55 ? 'ok' : 'help';
      delete tp.sessions; delete tp.order;
      return tp;
    }).filter(Boolean).sort(function (a, b) { return b.answered - a.answered; });
    W.strengths = W.topics.filter(function (x) { return x.answered >= 5 && x.acc >= .8; }).sort(function (a, b) { return b.acc - a.acc || b.answered - a.answered; }).slice(0, 2);
    W.struggles = W.topics.filter(function (x) { return x.answered >= 4 && (x.acc < .6 || x.revealed / x.answered >= .25); }).sort(function (a, b) { return a.acc - b.acc; }).slice(0, 2);
    var seen = {};
    W.next = W.struggles.map(function (x) { seen[x.skill.id] = 1; return { skill: x.skill, reason: 'practice', level: x.level }; });
    A.recommend(st, 6).forEach(function (r) {
      if (W.next.length >= 3 || seen[r.skill.id]) return;
      seen[r.skill.id] = 1;
      W.next.push({ skill: r.skill, reason: r.reason === 'needs_practice' ? 'practice' : r.reason, forSkill: r.forSkill, level: A.get(st.id, r.skill.id).level || 1 });
    });
    W.minutes = Math.round(W.ms / 60000); W.prevMinutes = Math.round(W.prevMs / 60000);
    W.acc = W.answered ? W.correct / W.answered : null;
    W.prevAcc = W.prevAnswered >= 5 ? W.prevCorrect / W.prevAnswered : null;
    W.daysPlayed = week.filter(function (d) { return d.ms > 0 || d.answered > 0; }).length;
    return W;
  };

  /* ---------------------------------------------------------------- the view */
  function pct(x) { return Math.round(x * 100) + '%'; }
  R.fmtMinutes = function (min) {
    if (min < 1) return t('rp_lt_min');
    if (min < 60) return t('rp_min', { n: min });
    return t('rp_hours', { h: Math.floor(min / 60), m: min % 60 });
  };
  function kpi(icon, value, label, sub) {
    return h('div', { class: 'rp-kpi' }, h('span', { class: 'rp-k-icon', 'aria-hidden': 'true' }, icon), h('div', { class: 'rp-k-val' }, value), h('div', { class: 'rp-k-label' }, label),
      sub ? h('div', { class: 'rp-k-sub ' + sub.cls }, sub.text) : null);
  }
  function timeDelta(W) {
    if (!W.prevMs) return null;
    var d = W.minutes - W.prevMinutes;
    if (Math.abs(d) < 5) return { cls: 'same', text: t('rp_same') };
    return d > 0 ? { cls: 'up', text: '▲ ' + t('rp_more', { v: R.fmtMinutes(d) }) } : { cls: 'down', text: '▼ ' + t('rp_less', { v: R.fmtMinutes(-d) }) };
  }
  function accDelta(W) {
    if (W.prevAcc == null || W.acc == null) return null;
    var d = Math.round((W.acc - W.prevAcc) * 100);
    if (Math.abs(d) < 3) return { cls: 'same', text: t('rp_same') };
    return d > 0 ? { cls: 'up', text: '▲ ' + t('rp_up_from', { v: pct(W.prevAcc) }) } : { cls: 'down', text: '▼ ' + t('rp_down_from', { v: pct(W.prevAcc) }) };
  }
  function dayBars(W) {
    var max = Math.max.apply(null, W.days.map(function (d) { return d.ms; }).concat([60000])), today = U.today();
    var short = MA.i18n.lang === 'he' ? 'narrow' : 'short', fmt = new Intl.DateTimeFormat(MA.i18n.locale(), { weekday: short });
    return h('div', { class: 'rp-days', role: 'img', 'aria-label': t('rp_per_day') + ': ' + W.days.map(function (d) { return fmt.format(new Date(d.ts)) + ' ' + Math.round(d.ms / 60000); }).join(', ') },
      W.days.map(function (d) {
        var min = d.ms ? Math.max(1, Math.round(d.ms / 60000)) : 0;
        return h('div', { class: 'rp-day' + (d.key === today ? ' today' : '') }, h('span', { class: 'rp-dmin' }, min ? String(min) : ''),
          h('div', { class: 'rp-dbar' }, h('i', { style: { height: (min ? Math.max(6, 100 * d.ms / max) : 0) + '%' } })), h('span', { class: 'rp-dname' }, fmt.format(new Date(d.ts))));
      }));
  }
  var ST_ICON = { star: '⭐', good: '😀', ok: '🙂', help: '💪', new: '🌱' };
  var ACC_COLOR = function (a) { return a >= .75 ? '#2BC79A' : a >= .55 ? '#FFC93C' : '#FF8A5B'; };
  function spark(series, tr) {
    if (series.length < 2) return null;
    var W = 70, H = 24, n = series.length, col = tr === 'up' ? '#0B8A5B' : tr === 'down' ? '#E8590C' : '#7B5CFF';
    var pts = series.map(function (v, i) { return [(4 + i * (W - 8) / (n - 1)).toFixed(1), (H - 4 - v * (H - 8)).toFixed(1)]; });
    var last = pts[n - 1];
    return h('span', { class: 'rp-spark flip-rtl', html: '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true"><polyline points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '" fill="none" stroke="' + col + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="' + last[0] + '" cy="' + last[1] + '" r="3.5" fill="' + col + '"/></svg>' });
  }
  /* "👁 Example": one question of the topic, at the child's level, shown answered */
  function exampleToggle(skill, level) {
    var box = h('div', { class: 'rp-ex' }), open = false, btn;
    btn = h('button', { class: 'btn btn-soft btn-sm rp-ex-btn', type: 'button', 'aria-expanded': 'false', onclick: function () {
      open = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); U.clear(box);
      if (open) box.appendChild(R.example(skill, level));
    } }, '👁 ' + t('rp_example'));
    return { btn: btn, box: box };
  }
  function answerText(q) {
    var a = q.answer, opts = q.data && Array.isArray(q.data.options) ? q.data.options : null;
    if (opts) { var o = opts.filter(function (x) { return U.eq(x.v, a); })[0]; return o && o.label != null ? t('q_answer_is', { a: o.label }) : ''; }
    if (q.explain && q.explain.text) return q.explain.text;
    if (typeof a === 'number') return t('q_answer_is', { a: U.num(a) });
    if (typeof a === 'string') return t('q_answer_is', { a: a });
    if (a && a.d) return t('q_answer_is', { a: (a.w ? a.w + ' ' : '') + a.n + '/' + a.d });
    if (a && a.h != null) return t('q_answer_is', { a: a.h + ':' + (a.m < 10 ? '0' : '') + a.m });
    return '';
  }
  R.example = function (skill, level) {
    var q = null;
    for (var i = 0; i < 4 && !q; i++) q = MA.gen.make(skill, U.clamp(level || 1, 1, 5), {});
    if (!q) return h('div', { class: 'muted small' }, '—');
    var box = h('div', { class: 'rp-ex-box' }, h('div', { class: 'rp-ex-title' }, '💡 ' + t('rp_example_title')), h('div', { class: 'prompt' }, q.prompt));
    if (q.sub) box.appendChild(h('div', { class: 'prompt-sub math' }, q.sub));
    if (q.visual) box.appendChild(h('div', { class: 'visual small-visual', html: q.visual }));
    var area = h('div', { class: 'answer-area mini-answer', 'aria-hidden': 'true' });
    try {
      var ctrl = MA.ui.mount(area, q, { setReady: function () {}, submit: function () {}, meta: function () {} });
      if (ctrl.showAnswer) ctrl.showAnswer();
      if (ctrl.lock) ctrl.lock();
      box.appendChild(area);
    } catch (e) { /* the written answer below is enough */ }
    var ans = answerText(q);
    if (ans) box.appendChild(h('div', { class: 'rp-ex-ans' }, '✔ ' + ans));
    return box;
  };
  function topicRow(tp) {
    var ex = exampleToggle(tp.skill, tp.level), mins = Math.round(tp.ms / 60000);
    return h('div', { class: 'rp-topic' },
      h('div', { class: 'rp-t-top' }, h('span', { class: 'rp-t-icon', 'aria-hidden': 'true' }, C.icon(tp.skill)), h('span', { class: 'rp-t-name' }, MA.tl(tp.skill.name)),
        h('span', { class: 'rp-chip ' + tp.status }, ST_ICON[tp.status] + ' ' + t('rp_st_' + tp.status)), ex.btn),
      h('div', { class: 'rp-t-bottom' },
        h('span', { class: 'rp-acc', role: 'img', 'aria-label': t('rp_correct', { n: Math.round(tp.acc * 100) }) }, h('i', { style: { width: Math.round(tp.acc * 100) + '%', background: ACC_COLOR(tp.acc) } })),
        h('b', null, pct(tp.acc)), spark(tp.series, tp.trend),
        tp.trend === 'up' || tp.trend === 'down' ? h('span', { class: 'rp-trend ' + tp.trend }, h('span', { class: 'flip-rtl', 'aria-hidden': 'true' }, tp.trend === 'up' ? '↗' : '↘'), ' ' + t(tp.trend === 'up' ? 'rp_up' : 'rp_down')) : null,
        h('span', { class: 'rp-meta' }, t('rp_q', { n: tp.answered }) + ' · ' + R.fmtMinutes(mins))),
      ex.box);
  }
  function listBox(icon, title, items, empty) {
    return h('div', { class: 'rp-card rp-mini' }, h('div', { class: 'rp-h' }, icon + ' ' + title),
      items.length ? items.map(function (x) { return h('div', { class: 'rp-li' }, h('b', null, MA.tl(x.skill.name)), h('span', { class: 'rp-meta' }, t('rp_correct', { n: Math.round(x.acc * 100) }) + (x.manyHints ? ' · ' + t('rp_hints') : ''))); })
        : h('div', { class: 'rp-meta' }, empty));
  }
  function nextRow(r, i) {
    var ex = exampleToggle(r.skill, r.level);
    return h('div', { class: 'rp-n-row' },
      h('div', { class: 'rp-n-top' }, h('span', { class: 'rp-n-num', 'aria-hidden': 'true' }, String(i + 1)),
        h('div', { class: 'rp-n-main' }, h('b', null, C.icon(r.skill) + ' ' + MA.tl(r.skill.name)), h('div', { class: 'rp-meta' }, t('rp_why_' + r.reason, { skill: r.forSkill ? MA.tl(r.forSkill.name) : '' }))), ex.btn),
      ex.box);
  }
  /* the report for one player; o.players + o.onPick add a player picker when the device has several */
  R.view = function (st, o) {
    o = o || {};
    var W = R.week(st), fmtD = function (ts) { return U.fmtDate(ts, { day: 'numeric', month: 'short' }); };
    var el = h('div', { class: 'rp' },
      o.players && o.players.length > 1 ? h('div', { class: 'rp-players', role: 'group', 'aria-label': t('rp_for') }, o.players.map(function (p) {
        return h('button', { class: 'rp-player' + (p.id === st.id ? ' on' : ''), type: 'button', 'aria-pressed': p.id === st.id ? 'true' : 'false', onclick: function () { o.onPick(p); } }, V.avatar(p, 'sm'), V.playerName(p));
      })) : null,
      h('div', { class: 'rp-head' }, h('h3', null, '📊 ' + t('rp_title', { name: V.playerName(st) })), h('span', { class: 'rp-meta' }, fmtD(W.from) + ' – ' + fmtD(W.to))));
    if (!W.answered && !W.ms) el.appendChild(h('div', { class: 'notice' }, '🌱 ' + t('rp_empty')));
    else {
      el.appendChild(h('div', { class: 'rp-kpis' },
        kpi('⏱', R.fmtMinutes(W.minutes), t('rp_time'), timeDelta(W)),
        kpi('✅', W.acc == null ? '–' : pct(W.acc), t('rp_success'), accDelta(W)),
        kpi('📅', t('rp_days_val', { n: W.daysPlayed }), t('rp_days'))));
      el.appendChild(h('div', { class: 'rp-card' }, h('div', { class: 'rp-h' }, t('rp_per_day')), dayBars(W)));
      var list = h('div', { class: 'rp-topics' }, W.topics.slice(0, 5).map(topicRow)), rest = W.topics.slice(5);
      var card = h('div', { class: 'rp-card' }, h('div', { class: 'rp-h' }, t('rp_topics') + ' · ' + t('rp_acts', { n: W.activities })), list);
      if (rest.length) {
        var more = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: function () { rest.forEach(function (tp) { list.appendChild(topicRow(tp)); }); more.remove(); } }, t('rp_more_topics', { n: rest.length }));
        card.appendChild(more);
      }
      el.appendChild(card);
      el.appendChild(h('div', { class: 'rp-two' }, listBox('👍', t('rp_good'), W.strengths, t('rp_no_good')), listBox('💪', t('rp_hard'), W.struggles, t('rp_no_hard'))));
    }
    if (W.next.length) el.appendChild(h('div', { class: 'rp-card rp-next' }, h('div', { class: 'rp-h' }, '🗓 ' + t('rp_next')), W.next.map(nextRow),
      h('p', { class: 'rp-tip' }, '💡 ' + t(W.minutes >= 45 && W.daysPlayed >= 3 ? 'rp_tip_keep' : 'rp_tip_more'))));
    return el;
  };
})(window.MA = window.MA || {});
