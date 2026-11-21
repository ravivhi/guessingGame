/* Activity player: runs practice, flagship games, daily challenges, Math Detective stories, timed rounds
   and mastery checks. Records every answer as it happens (no lost progress). */
(function (MA) {
  'use strict';
  var U = MA.u, h = U.h, db = MA.db, S = MA.svc, C = MA.content, A = MA.adapt, Gm = MA.game, t = function (k, p) { return MA.t(k, p); };
  var P = MA.player = {};

  MA.i18n.add({
    en: {
      pl_done_say: 'Well done! You got {n} coins.',
      pl_question: 'Question {a} of {b}', pl_finish_first: 'Finish your answer first.', pl_exit_q: 'Leave this activity? Your answers so far are saved.', pl_leave: 'Leave', pl_stay: 'Keep playing',
      pl_next: 'Next', pl_done_title: 'Activity complete!', pl_accuracy: 'Accuracy', pl_play_again: 'Play again', pl_next_activity: 'Next activity', pl_home: 'Home', pl_xp: '+{n} XP', pl_coins: '+{n} coins', pl_xp_gain: '+{n} XP',
      pl_level_up: 'Level up! You reached level {n}!', pl_new_badge: 'New badge: {name}', pl_mission: 'Mission complete: {name}', pl_streak: '{n}-day streak! +{c} coins',      pl_intro_title: "Let's learn: {skill}", pl_intro_go: "Let's start!", pl_example: 'Example', pl_time_left: '{n}s', pl_timed_done: "Time's up!", pl_timed_score: 'You solved {n} questions. Speed is just for fun - accuracy matters most!',
      pl_assess: 'Mastery check: no hints this time. Show what you know!', pl_assess_pass: 'Mastery check passed! 🏅', pl_assess_retry: 'Good effort! Practice a little more and try the mastery check again.',
      pl_easier: 'Repeated practice gives less XP. Try a new skill for more!', pl_correct_count: '{a} of {b} correct on the first try', pl_error_q: 'This question could not be created. Skipping to the next one.',
      pl_daily: 'Daily Challenge', pl_detective_solved: 'Case solved!', pl_retry_note: 'Answered after another try', pl_saved: 'Your progress is saved.', pl_no_questions: 'This activity has no questions available right now.', pl_mastered: 'You mastered "{skill}"!'
    },
    he: {
      pl_done_say: 'כל הכבוד! קיבלתם {n} מטבעות.',
      pl_question: 'שאלה {a} מתוך {b}', pl_finish_first: 'סיימו קודם את התשובה.', pl_exit_q: 'לצאת מהפעילות? התשובות עד עכשיו נשמרו.', pl_leave: 'יציאה', pl_stay: 'ממשיכים לשחק',
      pl_next: 'הבא', pl_done_title: 'הפעילות הושלמה!', pl_accuracy: 'דיוק', pl_play_again: 'שוב', pl_next_activity: 'לפעילות הבאה', pl_home: 'לדף הבית', pl_xp: '{n} נקודות', pl_coins: '{n} מטבעות', pl_xp_gain: 'קיבלתם {n} נקודות',
      pl_level_up: 'עליתם שלב! הגעתם לשלב {n}!', pl_new_badge: 'תג חדש: {name}', pl_mission: 'משימה הושלמה: {name}', pl_streak: 'רצף של {n} ימים! קיבלתם {c} מטבעות',      pl_intro_title: 'בואו נלמד: {skill}', pl_intro_go: 'מתחילים!', pl_example: 'דוגמה', pl_time_left: '{n} שנ׳', pl_timed_done: 'הזמן נגמר!', pl_timed_score: 'פתרתם {n} שאלות. המהירות היא רק בשביל הכיף - הדיוק הכי חשוב!',
      pl_assess: 'בדיקת שליטה: הפעם בלי רמזים. הראו מה אתם יודעים!', pl_assess_pass: 'עברתם את בדיקת השליטה! 🏅', pl_assess_retry: 'מאמץ יפה! תרגלו עוד קצת ונסו שוב את בדיקת השליטה.',
      pl_easier: 'תרגול חוזר נותן פחות נקודות. נסו מיומנות חדשה כדי לקבל יותר!', pl_correct_count: '{a} מתוך {b} נכונות בניסיון הראשון', pl_error_q: 'לא הצלחנו ליצור את השאלה. עוברים לשאלה הבאה.',
      pl_daily: 'האתגר היומי', pl_detective_solved: 'התעלומה נפתרה!', pl_retry_note: 'נענתה אחרי ניסיון נוסף', pl_saved: 'ההתקדמות נשמרה.', pl_no_questions: 'אין כרגע שאלות זמינות בפעילות הזו.', pl_mastered: 'שלטתם ב"{skill}"!'
    }
  });

  /* build the list of question slots for a session */
  function plan(o, student) {
    var items = [], act = o.activity, rng = U.rng;
    if (o.mode === 'detective') {
      var story = MA.DETECTIVE[act.story];
      return story.steps.map(function (st, i) {
        var pool = [];
        for (var g = student.grade; g >= 1 && !pool.length; g--) pool = C.gradeSkills(g).filter(function (s) { return st.pick.indexOf(s.domain) >= 0 && ['memory', 'grid'].indexOf(s.gen) < 0; });
        var sk = U.seeded(student.id + act.id + i + U.today()).pick(pool.length ? pool : C.gradeSkills(student.grade));
        return { skillId: sk.id, level: U.clamp(A.get(student.id, sk.id).level, 1, 4), story: { char: story.char, text: MA.tl(st) } };
      });
    }
    if (o.mode === 'assess') { for (var k = 0; k < 8; k++) items.push({ skillId: o.skillId, level: k % 2 ? 4 : 3, fixed: true, noHints: true, noAdapt: true }); return items; }
    if (o.mode === 'onboarding') { for (var j = 0; j < 3; j++) items.push({ skillId: o.skillId, level: 1, fixed: true }); return items; }
    if (act.sequence) return act.sequence.map(function (x) { return { skillId: x.skill, level: x.level, fixed: true }; });
    var n = o.mode === 'timed' ? 60 : act.questions || 8;
    for (var m = 0; m < n; m++) items.push({ skillId: act.skillId, level: null, noHints: o.mode === 'timed', timed: o.mode === 'timed' });
    return items;
  }

  P.open = function (main, o) {
    var student = S.student(), act = o.activity, mode = o.mode;
    if (!student) throw S.Err('forbidden');
    var stu = student;
    var slots = plan({ mode: mode, activity: act, skillId: o.skillId || act.skillId }, stu);
    if (!slots.length) { main.appendChild(h('div', { class: 'empty' }, t('pl_no_questions'))); return; }
    var st = {
      i: 0, results: [], seen: new Set(), startedAt: U.now(), xp: 0, attemptId: null, timeLeft: mode === 'timed' ? (act.timed || 60) : 0, timer: null, done: false,
      mult: Gm.activityMult(stu, act), maxTries: db.setting('maxTries') || 3, hintsTotal: 0
    };
    var resume = o.resume && student.inProgress && student.inProgress.activityId === act.id && student.inProgress.mode === mode;
    if (resume) { st.i = student.inProgress.index; st.results = student.inProgress.results || []; st.attemptId = student.inProgress.attemptId; st.startedAt = student.inProgress.startedAt || st.startedAt; }
    if (!st.attemptId) {
      var att = db.insert('attempts', { studentId: stu.id, activityId: act.id, skillId: act.skillId, mode: mode, startedAt: U.now(), status: 'in_progress', total: slots.length, answered: 0, correct: 0, hintsUsed: 0, timeMs: 0, xp: 0 });
      st.attemptId = att.id;
      S.track('activity_started', { activity: act.id, mode: mode });
    }
    MA.sfx.enabled = stu.settings ? stu.settings.sound !== false : true;
    var readOn = function () { return !!(stu.settings && stu.settings.readAloud); };

    var root = h('div', { class: 'player' }), body = h('div', { class: 'pl-card' }), dots = h('div', { class: 'pl-dots', 'aria-hidden': 'true' });
    var timerEl = h('div', { class: 'pill', style: { display: mode === 'timed' ? '' : 'none' } });
    var title = (act.icon ? act.icon + ' ' : '') + MA.tl(act.title);
    root.appendChild(h('div', { class: 'pl-top' },
      h('button', { class: 'btn btn-soft btn-icon pl-exit', 'aria-label': t('exit'), onclick: exit }, '✕'),
      h('div', { class: 'pl-title' }, title), timerEl, dots));
    if (mode === 'assess') root.appendChild(h('div', { class: 'notice' }, '🏅 ' + t('pl_assess')));
    root.appendChild(body);
    U.clear(main).appendChild(root);

    function renderDots() {
      U.clear(dots);
      if (mode === 'timed') return;
      slots.forEach(function (s, k) { var r = st.results[k]; dots.appendChild(h('span', { class: 'dot' + (k === st.i ? ' cur' : r ? (r.firstTry ? ' ok' : ' help') : '') })); });
    }
    function speakButton(getText) {
      return MA.speech.supported ? h('button', { class: 'btn btn-soft btn-icon speak-btn', type: 'button', 'aria-label': t('read_aloud'), onclick: function () { MA.speech.say(getText()); } }, '🔊') : null;
    }
    /* answers are saved as they happen, so ✕ leaves at once (an unfinished activity resumes from the play button) */
    function exit() {
      stopTimer(); MA.speech.stop();
      if (!st.done) {
        var a = db.get('attempts', st.attemptId);
        if (a && a.status === 'in_progress') { a.status = 'abandoned'; a.timeMs = U.now() - st.startedAt; }
        S.track('activity_abandoned', { activity: act.id, answered: st.results.length });
        if (!st.results.length) student.inProgress = null;
        db.saveNow();
      }
      finishNav();
    }
    function finishNav() { location.hash = o.back || '#/s/home'; }
    function stopTimer() { if (st.timer) { clearInterval(st.timer); st.timer = null; } }
    if (mode === 'timed') {
      timerEl.textContent = '⏱ ' + t('pl_time_left', { n: st.timeLeft });
      st.timer = setInterval(function () { st.timeLeft--; timerEl.textContent = '⏱ ' + t('pl_time_left', { n: Math.max(0, st.timeLeft) }); if (st.timeLeft <= 0) { stopTimer(); finish(); } }, 1000);
    }

    /* intro card for brand-new skills (learning path stage 1) */
    function maybeIntro(next) {
      if (mode !== 'practice' || act.sequence || st.i > 0) return next();
      var p = A.get(stu.id, act.skillId), sk = C.skill(act.skillId);
      if (p.attempts > 0 || !sk) return next();
      var ex = MA.gen.make(sk, 1, {}), introTitle = t('pl_intro_title', { skill: MA.tl(sk.name) });
      var introText = MA.gen.sentences([introTitle, MA.tl(sk.objective), ex ? t('pl_example') + ': ' + MA.gen.sentences([ex.prompt, ex.sub]) : '', ex && ex.explain ? ex.explain.text : '']);
      var go = function () { MA.speech.stop(); next(); };
      U.clear(body).appendChild(h('div', { class: 'stack', style: { alignItems: 'center', textAlign: 'center' } },
        h('div', { class: 'float', html: MA.svg.mascot('wave', 130) }),
        h('div', { class: 'row', style: { justifyContent: 'center', flexWrap: 'nowrap' } }, h('h2', null, introTitle), speakButton(function () { return introText; })),
        h('p', { class: 'big' }, MA.tl(sk.objective)),
        ex ? h('div', { class: 'hint-box', style: { maxWidth: '560px', width: '100%' } }, h('div', { class: 'hb-head' }, '💡 ' + t('pl_example')), h('div', { class: 'bold' }, ex.prompt + (ex.sub ? ' ' + ex.sub : '')), ex.explain && ex.explain.svg ? h('div', { class: 'hb-svg', html: ex.explain.svg }) : null, ex.explain ? h('div', null, ex.explain.text) : null) : null,
        h('button', { class: 'btn btn-primary btn-round btn-go', 'aria-label': t('pl_intro_go'), onclick: go }, '▶')));
      if (readOn()) MA.speech.say(introText);
    }

    function levelFor(slot) {
      var sk = C.skill(slot.skillId), lvl = slot.level;
      if (!slot.fixed || lvl == null) lvl = A.get(stu.id, slot.skillId).level;
      if (slot.bump) lvl += slot.bump;
      if (sk && sk.gen === 'memory') lvl = lvl || 2;
      return U.clamp(lvl || 1, 1, 5);
    }
    function makeQuestion(slot) {
      var sk = C.skill(slot.skillId); if (!sk) return null;
      var lvl = levelFor(slot), useBank = act.source === 'mixed' && !slot.fixed && Math.random() < db.setting('bankMixRate');
      if (useBank) {
        var bank = db.all('questions', function (x) { return x.skillId === sk.id && x.status === 'published'; });
        if (bank.length) { var bq = MA.gen.fromBank(U.pick(bank)); if (bq && !st.seen.has(bq.sig)) { st.seen.add(bq.sig); bq.skillId = sk.id; bq.level = lvl; return bq; } }
      }
      return MA.gen.make(sk, lvl, { seen: st.seen });
    }

    function show() {
      if (st.i >= slots.length) return finish();
      renderDots();
      var slot = slots[st.i], q = makeQuestion(slot);
      if (!q) { MA.toast(t('pl_error_q'), { icon: '⚠️' }); st.results[st.i] = { skipped: true, firstTry: false }; st.i++; return show(); }
      var tries = 0, hintLevel = 0, shownAt = U.now(), answered = false, hintsAllowed = !slot.noHints && (stu.settings ? stu.settings.hints !== false : true);
      S.track('question_displayed', { skill: q.skillId, level: q.level, ui: q.ui });
      U.clear(body);
      if (slot.story) body.appendChild(h('div', { class: 'pl-story' }, h('span', { class: 'st-char', 'aria-hidden': 'true' }, slot.story.char), h('div', null, slot.story.text)));
      var promptEl = h('div', { class: 'prompt', id: 'q-prompt' }, q.prompt);
      var spoken = MA.gen.spoken(q, slot.story && slot.story.text), speakBtn = speakButton(function () { return spoken; });
      body.appendChild(h('div', { class: 'row', style: { justifyContent: 'center', flexWrap: 'nowrap' } }, promptEl, speakBtn));
      if (q.sub) body.appendChild(h('div', { class: 'prompt-sub math' }, q.sub));
      if (q.visual) body.appendChild(h('div', { class: 'visual', html: q.visual }));
      var area = h('div', { class: 'answer-area' }), fb = h('div', { 'aria-live': 'polite' }), hintBox = h('div');
      body.appendChild(area); body.appendChild(hintBox); body.appendChild(fb);
      var checkBtn = h('button', { class: 'btn btn-primary btn-lg btn-check', 'aria-label': t('check'), disabled: true, onclick: submit }, '✔');
      var hintBtn = hintsAllowed ? h('button', { class: 'btn btn-sun btn-lg btn-hint', 'aria-label': t('hint_btn'), onclick: function () { showHint(true); } }, '💡') : null;
      var bottom = h('div', { class: 'pl-bottom' }, hintBtn, checkBtn);
      body.appendChild(bottom);
      var meta = {}, ctrl;
      var api = {
        setReady: function (b) { checkBtn.disabled = !b || answered; },
        submit: function () { setTimeout(submit, 0); },
        meta: function (m) { for (var k in m) meta[k] = m[k]; }
      };
      try { ctrl = MA.ui.mount(area, q, api); } catch (e) { MA.errors.capture(e, 'render:' + q.ui); st.results[st.i] = { skipped: true }; st.i++; return show(); }
      var forced;
      P._current = { q: q, ctrl: ctrl, answer: function (v) { forced = v; submit(); forced = undefined; } };
      if (ctrl.focus) setTimeout(ctrl.focus, 60);
      if (readOn()) setTimeout(function () { if (!answered && !st.done) MA.speech.say(spoken); }, 250);
      if (['choice', 'compare', 'memory'].indexOf(q.ui) >= 0 && !(q.data && q.data.multi)) checkBtn.style.display = 'none';

      function showHint(requested) {
        if (!hintsAllowed || answered) return;
        var list = [{ text: t('hint_encourage') }].concat(q.hints || []);
        if (hintLevel >= list.length) { MA.fx.anim(hintBox.firstChild, 'pop'); return; }
        var hnt = list[hintLevel]; hintLevel++;
        st.hintsTotal++;
        U.clear(hintBox).appendChild(h('div', { class: 'hint-box' }, h('div', { class: 'hb-head' }, '💡 ' + t('hint_n', { n: hintLevel })), h('div', null, hnt.text), hnt.svg ? h('div', { class: 'hb-svg', html: hnt.svg }) : null));
        MA.sfx.play('hint');
        if (readOn()) MA.speech.say(t('hint_n', { n: hintLevel }) + ': ' + hnt.text, { queue: !requested });
        if (hintBtn && hintLevel >= list.length) hintBtn.disabled = true;
        if (requested) S.track('hint_requested', { skill: q.skillId, level: hintLevel });
      }
      function feedback(kind, text, svg) {
        var mood = kind === 'good' ? 'cheer' : kind === 'try' ? 'think' : 'happy';
        U.clear(fb).appendChild(h('div', { class: 'feedback fb-' + kind }, h('span', { class: 'fb-char', html: MA.svg.mascot(mood, 60) }), h('div', null, h('div', null, text), svg ? h('div', { html: svg, style: { marginTop: '8px' } }) : null)));
        MA.say(text);
        if (readOn()) MA.speech.say(text);
      }
      function submit() {
        if (answered) return;
        var val = forced !== undefined ? forced : ctrl.value ? ctrl.value() : null;
        if (val == null) { MA.toast(t('pl_finish_first'), { icon: '✋', ms: 1800 }); return; }
        var ok = false;
        try { ok = MA.gen.check(q, val); } catch (e) { ok = false; }
        S.track('answer_submitted', { skill: q.skillId, correct: ok, try: tries + 1 });
        if (ok) {
          answered = true;
          var firstTry = tries === 0 && (q.ui !== 'memory' || (meta.mistakes || 0) <= (meta.maxMistakes || 99));
          if (ctrl.markRight) ctrl.markRight();
          if (ctrl.lock) ctrl.lock();
          MA.sfx.play('correct'); MA.fx.burst(checkBtn.style.display === 'none' ? area : checkBtn, '⭐');
          var phrase = tries ? t('fb_correct_retry') : pickPhrase();
          finishQuestion(true, firstTry, false, phrase);
        } else {
          tries++;
          MA.sfx.play('wrong');
          if (ctrl.onWrong) ctrl.onWrong(val);
          if (slot.timed) { answered = true; if (ctrl.lock) ctrl.lock(); finishQuestion(false, false, true, t('fb_try'), true); return; }
          if (tries >= st.maxTries || (!hintsAllowed && tries >= 2)) {
            answered = true;
            if (ctrl.showAnswer) ctrl.showAnswer();
            if (ctrl.lock) ctrl.lock();
            finishQuestion(false, false, true, t('fb_reveal') + ' ' + ((q.explain && q.explain.text) || t('q_answer_is', { a: fmtAns(q.answer) })), false, q.explain && q.explain.svg);
          } else {
            feedback('try', t('fb_try'));
            if (hintsAllowed && (q.level <= 2 || tries >= 2)) showHint(false);
          }
        }
      }
      function fmtAns(a) { if (a && typeof a === 'object') { if (a.d) return (a.w ? a.w + ' ' : '') + a.n + '/' + a.d; if (a.h != null) return a.h + ':' + (a.m < 10 ? '0' : '') + a.m; return ''; } return typeof a === 'number' ? U.num(a) : String(a); }
      function finishQuestion(correct, firstTry, revealed, text, quick, svg) {
        var ms = U.now() - shownAt, res = { skillId: q.skillId, gen: q.kind, sig: q.sig, level: q.level, ui: q.ui, correct: correct, firstTry: firstTry, tries: tries + (correct ? 1 : 0), hints: hintLevel, ms: ms, revealed: revealed };
        var xp = Gm.answerXp(q.level, res, st.mult);
        res.xp = xp; st.xp += xp;
        st.results[st.i] = res;
        record(res, slot);
        checkBtn.disabled = true; if (hintBtn) hintBtn.disabled = true;
        feedback(correct ? 'good' : revealed && !slot.timed ? 'show' : 'try', text, svg);
        renderDots();
        st.i++;
        saveProgress();
        if (slot.timed) { setTimeout(function () { if (!st.done) show(); }, quick ? 450 : 500); return; }
        var nextBtn = h('button', { class: 'btn btn-success btn-lg btn-next', 'aria-label': t('pl_next'), onclick: function () { show(); } }, h('span', { class: 'flip-rtl' }, '➜'));
        bottom.appendChild(nextBtn); checkBtn.style.display = 'none'; if (hintBtn) hintBtn.style.display = 'none';
        setTimeout(function () { nextBtn.focus({ preventScroll: true }); }, 30);
      }
    }
    var lastPhrases = [];
    function pickPhrase() { var list = MA.i18n.list('fb_correct'), p, guard = 0; do { p = U.pick(list); } while (lastPhrases.indexOf(p) >= 0 && guard++ < 10); lastPhrases = lastPhrases.concat([p]).slice(-4); return p; }

    function record(res, slot) {
      var stuRec = db.get('students', stu.id), att = db.get('attempts', st.attemptId);
      db.insert('answers', { attemptId: st.attemptId, studentId: stu.id, skillId: res.skillId, gen: res.gen, sig: res.sig, level: res.level, ui: res.ui, correct: res.correct, firstTry: res.firstTry, tries: res.tries, hints: res.hints, ms: res.ms, revealed: res.revealed, ts: U.now() });
      var r = A.record(stu.id, res.skillId, { firstTry: res.firstTry, hints: res.hints, level: res.level, ui: res.ui, ms: res.ms, noAdapt: slot.noAdapt });
      if (r.newlyMastered) st.mastered = (st.mastered || []).concat([C.skill(res.skillId)]);
      var out = {};
      Gm.onAnswer(stuRec, res);
      if (res.xp) Gm.addXp(stuRec, res.xp, out);
      if (out.levelUp) celebrateLevel(out.levelUp);
      if (att) { att.answered = st.results.filter(function (x) { return x && !x.skipped; }).length; att.correct = st.results.filter(function (x) { return x && x.firstTry; }).length; att.hintsUsed = st.hintsTotal; att.timeMs = U.now() - st.startedAt; att.xp = st.xp; }
      stuRec.lastActive = U.now();
      db.save();
    }
    function celebrateLevel(L) { MA.sfx.play('levelup'); MA.fx.confetti(); MA.toast(t('pl_level_up', { n: L }), { type: 'good', icon: '⭐', ms: 3500 }); }
    function saveProgress() {
      var s = db.get('students', stu.id);
      s.inProgress = st.i < slots.length && mode !== 'timed' ? { activityId: act.id, mode: mode, index: st.i, results: st.results, attemptId: st.attemptId, startedAt: st.startedAt } : null;
      db.save();
    }

    function finish() {
      if (st.done) return; st.done = true; stopTimer(); MA.speech.stop();
      renderDots();
      var res = st.results.filter(function (x) { return x && !x.skipped; }), correct = res.filter(function (x) { return x.firstTry; }).length, total = res.length;
      var acc = total ? correct / total : 0;
      var stuRec = db.get('students', stu.id), att = db.get('attempts', st.attemptId);
      att.status = 'completed'; att.completedAt = U.now(); att.answered = total; att.correct = correct; att.accuracy = acc; att.timeMs = U.now() - st.startedAt; att.level = total ? Math.round(U.avg(res, function (x) { return x.level; })) : 1; att.hintsUsed = st.hintsTotal;
      var summary = Gm.completeActivity(stuRec, att, act);
      att.xp = summary.xp; att.coins = summary.coins; att.stars = summary.stars;
      stuRec.inProgress = null;
      if (mode === 'assess' && acc >= .8) A.passAssessment(stu.id, o.skillId || act.skillId);
      S.track('activity_completed', { activity: act.id, mode: mode, accuracy: Math.round(acc * 100), stars: summary.stars });
      db.saveNow();
      if (summary.levelUp) celebrateLevel(summary.levelUp); else if (summary.stars === 3) MA.fx.confetti(50);
      MA.sfx.play('finish');
      if (MA.views && MA.views.refreshStudentHeader) MA.views.refreshStudentHeader(stuRec);
      renderFinish(summary, correct, total, acc);
    }
    function renderFinish(sm, correct, total, acc) {
      var stars = h('div', { class: 'f-stars', 'aria-label': sm.stars + ' / 3' }, [1, 2, 3].map(function (k) { return h('span', { class: k <= sm.stars ? '' : 'off' }, '⭐'); }));
      var lines = [];
      if (mode === 'detective') { var story = MA.DETECTIVE[act.story]; lines.push(h('div', { class: 'pl-story' }, h('span', { class: 'st-char' }, story.culprit), h('div', null, h('b', null, t('pl_detective_solved') + ' '), MA.tl(story.outro)))); }
      if (mode === 'timed') lines.push(h('div', { class: 'notice' }, '⏱ ' + t('pl_timed_done') + ' ' + t('pl_timed_score', { n: correct })));
      if (mode === 'assess') lines.push(h('div', { class: 'notice ' + (acc >= .8 ? 'good' : 'warn') }, acc >= .8 ? t('pl_assess_pass') : t('pl_assess_retry')));
      (st.mastered || []).forEach(function (sk) { lines.push(h('div', { class: 'notice good' }, '🏅 ' + t('pl_mastered', { skill: MA.tl(sk.name) }))); });
      var nextRec = A.recommend(db.get('students', stu.id), 2).filter(function (r) { return r.activity.id !== act.id; })[0];
      U.clear(body).appendChild(h('div', { class: 'finish' },
        h('div', { class: 'float', html: MA.svg.mascot(sm.stars >= 2 ? 'cheer' : 'happy', 120) }),
        h('h1', null, mode === 'detective' ? t('pl_detective_solved') : t('pl_done_title')), stars,
        h('div', { class: 'reward-row' }, h('div', { class: 'reward-chip coin' }, '🪙 ' + U.num(sm.coins || 0))),
        lines,
        h('div', { class: 'row finish-btns' },
          h('button', { class: 'btn btn-soft btn-round', 'aria-label': t('pl_play_again'), onclick: function () { P.open(main, { activity: act, mode: o.mode, skillId: o.skillId, back: o.back }); } }, '🔁'),
          nextRec ? h('button', { class: 'btn btn-primary btn-round btn-go', 'aria-label': t('pl_next_activity'), onclick: function () { location.hash = '#/s/play/' + nextRec.activity.id; } }, h('span', { class: 'flip-rtl' }, '➜')) : null,
          h('button', { class: 'btn btn-soft btn-round', 'aria-label': t('pl_home'), onclick: finishNav }, '🏠'))));
      if (readOn()) MA.speech.say(MA.gen.sentences([mode === 'detective' ? t('pl_detective_solved') + ' ' + MA.tl(MA.DETECTIVE[act.story].outro) : '', t('pl_done_say', { n: U.num(sm.coins || 0) })]));
    }
    maybeIntro(show);
  };
})(window.MA = window.MA || {});
