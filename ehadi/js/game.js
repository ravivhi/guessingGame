/* Rewards: coins and the shop. XP and levels stay in the background: they unlock worlds and shop items. */
(function (MA) {
  'use strict';
  var U = MA.u, db = MA.db, A = MA.adapt, S = MA.svc;
  var Gm = MA.game = {};

  Gm.xpForLevel = function (L) { return 50 * L * (L - 1); };
  Gm.levelInfo = function (xp) {
    var L = 1; while (Gm.xpForLevel(L + 1) <= xp) L++;
    var base = Gm.xpForLevel(L), next = Gm.xpForLevel(L + 1);
    return { level: L, base: base, next: next, into: xp - base, need: next - base, pct: (xp - base) / (next - base) };
  };
  var LEVEL_MULT = [.6, .8, 1, 1.2, 1.5];
  /* multiplier that reduces XP for repeating easy, already-mastered work */
  Gm.activityMult = function (student, activity) {
    var today = U.today(), n = db.count('attempts', function (a) { return a.studentId === student.id && a.activityId === activity.id && a.status === 'completed' && U.dayKey(a.startedAt) === today; });
    var m = n >= 5 ? .25 : n >= 3 ? .5 : 1;
    if (activity.skillId) { var p = A.get(student.id, activity.skillId); if (A.isMastered(p) && (activity.difficulty || 1) <= 2 && p.level >= 4) m *= .5; }
    return m;
  };
  Gm.answerXp = function (level, res, mult) {
    var base = db.setting('xpPerCorrect') * LEVEL_MULT[U.clamp(level, 1, 5) - 1];
    if (res.revealed) return 0;
    var x = base * (res.firstTry ? 1 : .4) * Math.max(.4, 1 - .15 * (res.hints || 0));
    return Math.max(1, Math.round(x * (mult == null ? 1 : mult)));
  };

  /* --------------------------------------------------------------- XP, coins, levels */
  Gm.addXp = function (st, xp, out) {
    if (!xp) return;
    var before = Gm.levelInfo(st.totalXp || 0).level;
    st.totalXp = (st.totalXp || 0) + xp; st.xp = st.totalXp;
    var after = Gm.levelInfo(st.totalXp).level;
    st.level = after;
    if (after > before) {
      st.coins += 20 * (after - before);
      if (out) out.levelUp = after;
      S.track('level_up', { level: after });
    }
  };
  Gm.worldUnlocked = function (st, w) { return (st.level || 1) >= (w.unlockLevel || 1); };

  /* --------------------------------------------------------------- activity completion */
  Gm.completeActivity = function (st, att, act) {
    var out = { xp: 0, coins: 0 }, mult = Gm.activityMult(st, act), acc = att.accuracy || 0;
    var stars = att.total ? (acc >= .9 ? 3 : acc >= .7 ? 2 : 1) : 0;
    var perfect = att.total >= 5 && att.correct === att.total && att.hintsUsed === 0;
    var xp = Math.round((db.setting('activityXp') + (perfect ? 10 : 0) + (act.reward ? (act.reward.xp || 0) - 20 : 0)) * mult);
    var coins = Math.round((db.setting('activityCoins') + stars * 2 + (perfect ? 5 : 0)) * mult);
    st.stats.activities = (st.stats.activities || 0) + 1;
    out.stars = stars; out.perfect = perfect; out.xp = att.xp + xp; out.coins = coins; out.mult = mult;
    st.coins += coins;
    Gm.addXp(st, xp, out);
    db.saveNow();
    return out;
  };
  Gm.onAnswer = function (st, ans) {
    st.stats.answered = (st.stats.answered || 0) + 1;
    if (ans.firstTry) st.stats.correct = (st.stats.correct || 0) + 1;
  };

  /* --------------------------------------------------------------- shop */
  Gm.buy = function (st, itemId) {
    var it = db.get('shopItems', itemId);
    if (!it || !it.enabled) throw S.Err('forbidden');
    if ((st.inventory || []).indexOf(itemId) >= 0) return st;
    if ((st.level || 1) < it.minLevel) throw S.Err('shop_locked', { n: it.minLevel });
    if (st.coins < it.price) throw S.Err('shop_coins');
    st.coins -= it.price; st.inventory.push(itemId);
    S.track('reward_earned', { item: itemId }, { kind: 'student', student: st });
    Gm.equip(st, itemId, true);
    db.saveNow();
    return st;
  };
  /* one item per slot; a dress or costume (MA.avatar.covers) replaces the pants, pants replace a dress */
  Gm.equip = function (st, itemId, force) {
    var it = db.get('shopItems', itemId); if (!it || st.inventory.indexOf(itemId) < 0) return;
    var eq = st.equipped = st.equipped || {}, slot = it.slot || it.category;
    if (!force && eq[slot] === itemId) { eq[slot] = null; db.save(); return; }
    eq[slot] = itemId;
    if (slot === 'top' && MA.avatar.covers(it.draw)) eq.bottom = null;
    if (slot === 'bottom' && eq.top) { var top = db.get('shopItems', eq.top); if (top && MA.avatar.covers(top.draw)) eq.top = null; }
    db.save();
  };
  Gm.wearing = function (st, it) { return !!(st.equipped && st.equipped[it.slot || it.category] === it.id); };
  Gm.shopFor = function (st, cat) {
    var g = st.gender === 'f' ? 'f' : st.gender === 'm' ? 'm' : null;
    return db.all('shopItems', function (i) { return i.enabled && i.category === cat && (!i.gender || !g || i.gender === g); })
      .sort(function (a, b) { return a.minLevel - b.minLevel || a.price - b.price; });
  };

  MA.i18n.add({
    en: { shop_locked: 'Unlocks at level {n}', shop_coins: 'Not enough coins yet - keep learning to earn more!' },
    he: { shop_locked: 'ייפתח בשלב {n}', shop_coins: 'עוד אין מספיק מטבעות - המשיכו ללמוד כדי להרוויח עוד!' }
  });
})(window.MA = window.MA || {});
