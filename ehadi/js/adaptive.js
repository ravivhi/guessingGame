/* Adaptive engine: per-skill progress, mastery calculation, difficulty adaptation, learning-path stages,
   prerequisite gaps and recommendations. Mastery requires repeated success across sessions and levels. */
(function (MA) {
  'use strict';
  var U = MA.u, db = MA.db, C = MA.content;
  var A = MA.adapt = {};
  var STATUSES = A.STATUSES = ['not_started', 'learning', 'practicing', 'developing', 'mastered', 'challenge'];

  A.key = function (sid, skillId) { return sid + '|' + skillId; };
  A.get = function (sid, skillId) {
    return db.get('progress', A.key(sid, skillId)) || { id: A.key(sid, skillId), studentId: sid, skillId: skillId, attempts: 0, correct: 0, hints: 0, level: 1, history: [], days: [], levelsOk: {}, okStreak: 0, missStreak: 0, masteryScore: 0, status: 'not_started', lastPracticed: null, assessPassed: false, _virtual: true };
  };
  A.all = function (sid) { return db.all('progress', function (p) { return p.studentId === sid; }); };

  A.compute = function (p, skill) {
    if (!p.attempts) return { score: 0, status: 'not_started', recentAcc: null };
    var h = p.history.slice(-15), wsum = 0, acc = 0, ind = 0, nOk = 0, lvl = 0;
    h.forEach(function (x, i) { var w = i + 1; wsum += w; acc += w * x.c; if (x.c) { nOk++; lvl += x.l; if (!x.h) ind++; } });
    var recentAcc = wsum ? acc / wsum : 0, independence = nOk ? ind / nOk : 0, diff = nOk ? Math.min(1, (lvl / nOk) / 4) : 0;
    var okDays = U.uniq(p.history.filter(function (x) { return x.c; }).map(function (x) { return U.dayKey(x.t); })).length;
    var consistency = Math.min(1, okDays / 3), volume = Math.min(1, p.attempts / 15);
    var since = p.lastPracticed ? U.daysBetween(U.dayKey(p.lastPracticed), U.today()) : 0, decay = since > 30 ? .7 : since > 14 ? .85 : 1;
    var score = Math.round(100 * (.45 * recentAcc + .15 * independence + .2 * diff + .1 * consistency + .1 * volume) * decay);
    var levelsWithOk = Object.keys(p.levelsOk || {}).filter(function (k) { return p.levelsOk[k] >= 2; }).length;
    var threshold = (skill && skill.mastery) || 80, status;
    if (p.attempts < 5 || score < 50) status = 'learning';
    else if (score < 65) status = 'practicing';
    else if (score < threshold) status = 'developing';
    else status = 'developing';
    var masteryReady = p.attempts >= 15 && okDays >= 2 && levelsWithOk >= 2 && recentAcc >= .75;
    if ((score >= threshold && masteryReady) || (p.assessPassed && score >= threshold - 10 && okDays >= 2)) status = 'mastered';
    if (status === 'mastered' && p.level >= 4 && recentAcc >= .9) status = 'challenge';
    return { score: score, status: status, recentAcc: recentAcc, okDays: okDays };
  };
  A.isMastered = function (p) { return p.status === 'mastered' || p.status === 'challenge'; };

  /* record one answered question; returns { p, levelChange, newlyMastered } */
  A.record = function (sid, skillId, r) {
    var skill = C.skill(skillId), p = db.get('progress', A.key(sid, skillId));
    if (!p) { p = A.get(sid, skillId); delete p._virtual; db.put('progress', p); }
    var before = p.status, ts = r.ts || U.now();
    p.attempts++; if (r.firstTry) p.correct++; p.hints += r.hints || 0;
    p.history.push({ c: r.firstTry ? 1 : 0, h: r.hints || 0, l: r.level || p.level, t: ts, u: r.ui || '', ms: r.ms || 0 });
    if (p.history.length > 40) p.history = p.history.slice(-40);
    var dk = U.dayKey(ts); if (p.days.indexOf(dk) < 0) { p.days.push(dk); if (p.days.length > 30) p.days = p.days.slice(-30); }
    if (r.firstTry) p.levelsOk[r.level || p.level] = (p.levelsOk[r.level || p.level] || 0) + 1;
    p.lastPracticed = ts;
    var change = 0;
    if (!r.noAdapt) {
      if (r.firstTry && !r.hints) { p.okStreak++; p.missStreak = 0; if (p.okStreak >= 3 && p.level < 5) { p.level++; p.okStreak = 0; change = 1; } }
      else if (!r.firstTry) { p.missStreak++; p.okStreak = 0; if (p.missStreak >= 2 && p.level > 1) { p.level--; p.missStreak = 0; change = -1; } }
      else { p.okStreak = 0; }
    }
    var cmp = A.compute(p, skill);
    p.masteryScore = cmp.score; p.status = cmp.status; p.recentAcc = cmp.recentAcc;
    p.accuracy = p.correct / p.attempts;
    var newly = !A.isMastered({ status: before }) && A.isMastered(p);
    if (newly) p.masteredAt = ts;
    db.save();
    return { p: p, levelChange: change, newlyMastered: newly };
  };
  A.passAssessment = function (sid, skillId) { var p = db.get('progress', A.key(sid, skillId)); if (!p) return; p.assessPassed = true; var c = A.compute(p, C.skill(skillId)); var was = A.isMastered(p); p.status = c.status; p.masteryScore = c.score; if (!was && A.isMastered(p)) p.masteredAt = U.now(); db.save(); };
  /* refresh retention decay for display */
  A.view = function (sid, skillId) { var p = A.get(sid, skillId); if (p.attempts) { var c = A.compute(p, C.skill(skillId)); p.status = c.status; p.masteryScore = c.score; p.recentAcc = c.recentAcc; } return p; };

  /* learning path: 1 intro, 2 visual, 3 guided, 4 independent, 5 challenge, 6 mastery check */
  A.stage = function (p) {
    if (!p || p.attempts < 3) return 1;
    if (p.assessPassed) return 7;
    if ((p.status === 'developing' || A.isMastered(p)) && p.level >= 4 && p.attempts >= 12) return 6;
    return [2, 3, 4, 5, 5][Math.min(4, p.level - 1)];
  };
  A.STAGE_LEVEL = { 1: 1, 2: 1, 3: 2, 4: 3, 5: 4, 6: 3 };

  /* prerequisites: lower-grade prerequisites are assumed known unless the student is visibly struggling */
  A.prereqOk = function (student, skill) {
    return (skill.prereq || []).every(function (pid) {
      var ps = C.skill(pid); if (!ps) return true;
      var p = A.get(student.id, pid);
      if (ps.grade < student.grade) return !(p.attempts >= 6 && (p.recentAcc || 0) < .5);
      return p.attempts >= 8 || ['practicing', 'developing', 'mastered', 'challenge'].indexOf(p.status) >= 0;
    });
  };
  A.unlocked = function (student, skill, i) {
    if (i != null && i < 2) return true;
    var p = A.get(student.id, skill.id);
    if (p.attempts > 0) return true;
    if (student.unlocked && student.unlocked[skill.id]) return true;
    return A.prereqOk(student, skill);
  };
  A.gaps = function (student) {
    var out = [];
    A.all(student.id).forEach(function (p) {
      if (p.attempts >= 6 && (p.recentAcc || 0) < .5) {
        var sk = C.skill(p.skillId); if (!sk) return;
        (sk.prereq || []).forEach(function (pid) { var pp = A.get(student.id, pid); if (!A.isMastered(pp) && C.skill(pid)) out.push({ skill: C.skill(pid), forSkill: sk }); });
      }
    });
    return out;
  };
  A.strengths = function (sid) { return A.all(sid).filter(function (p) { return p.attempts >= 5 && (p.masteryScore >= 70); }).sort(function (a, b) { return b.masteryScore - a.masteryScore; }); };
  A.needsWork = function (sid) { return A.all(sid).filter(function (p) { return p.attempts >= 5 && ((p.recentAcc || 0) < .6 || p.status === 'learning'); }).sort(function (a, b) { return (a.recentAcc || 0) - (b.recentAcc || 0); }); };

  A.pickActivity = function (student, skill) {
    var acts = C.activitiesForSkill(skill.id).filter(function (a) { return a.gameType !== 'timed' && a.gameType !== 'detective' && (a.minLevel || 1) <= (student.level || 1); });
    var today = U.today(), played = {};
    db.all('attempts', function (a) { return a.studentId === student.id && U.dayKey(a.startedAt) === today; }).forEach(function (a) { played[a.activityId] = (played[a.activityId] || 0) + 1; });
    var fl = acts.filter(function (a) { return a.flagship && !played[a.id]; });
    return fl[0] || C.practiceFor(skill.id) || acts[0];
  };
  A.recommend = function (student, n) {
    if (!student) return [];
    n = n || 3;
    var cands = [], now = U.today(), seen = {};
    var gradeSkills = C.gradeSkills(student.grade);
    gradeSkills.forEach(function (sk, i) {
      var p = A.view(student.id, sk.id), since = p.lastPracticed ? U.daysBetween(U.dayKey(p.lastPracticed), now) : 999;
      if (p.attempts > 0 && !A.isMastered(p) && since <= 10) cands.push({ skill: sk, score: 60 + (100 - p.masteryScore) / 4 - since, reason: (p.recentAcc || 0) < .6 && p.attempts >= 5 ? 'needs_practice' : 'keep_going' });
      else if (A.isMastered(p) && since > 10) cands.push({ skill: sk, score: 40 + Math.min(10, since / 3), reason: 'review' });
      else if (p.status === 'challenge') cands.push({ skill: sk, score: 25, reason: 'challenge' });
      else if (!p.attempts && A.unlocked(student, sk)) cands.push({ skill: sk, score: 50 - sk.order / 2000, reason: 'new_skill' });
      else if (p.attempts > 0 && !A.isMastered(p)) cands.push({ skill: sk, score: 35, reason: 'keep_going' });
    });
    A.gaps(student).forEach(function (g) { cands.push({ skill: g.skill, score: 75, reason: 'gap', forSkill: g.forSkill }); });
    cands.sort(function (a, b) { return b.score - a.score; });
    var out = [];
    cands.forEach(function (c) { if (out.length < n && !seen[c.skill.id]) { seen[c.skill.id] = 1; c.activity = A.pickActivity(student, c.skill); if (c.activity) out.push(c); } });
    return out;
  };
  /* "Continue learning": resume an unfinished activity, else the top recommendation */
  A.next = function (student) {
    if (student.inProgress && C.activity(student.inProgress.activityId)) return { resume: true, activity: C.activity(student.inProgress.activityId) };
    var r = A.recommend(student, 1)[0];
    return r ? { activity: r.activity, skill: r.skill, reason: r.reason } : null;
  };
  MA.i18n.add({
    en: { why_needs_practice: 'Let\'s practice this a bit more', why_keep_going: 'Keep going - you\'re making progress', why_review: 'Time for a quick review', why_challenge: 'You\'re ready for a challenge!', why_new_skill: 'New skill unlocked', why_gap: 'This will help with {skill}' },
    he: { why_needs_practice: 'בואו נתרגל את זה עוד קצת', why_keep_going: 'ממשיכים - אתם מתקדמים', why_review: 'הגיע הזמן לחזרה קצרה', why_challenge: 'אתם מוכנים לאתגר!', why_new_skill: 'מיומנות חדשה נפתחה', why_gap: 'זה יעזור ב{skill}' }
  });
  A.reasonText = function (r) { return MA.t('why_' + r.reason, { skill: r.forSkill ? MA.tl(r.forSkill.name) : '' }); };
})(window.MA = window.MA || {});
