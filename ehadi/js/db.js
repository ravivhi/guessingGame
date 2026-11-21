/* Local database: JSON tables persisted in localStorage on this device.
   Content (curriculum, activities, shop, question bank) is seeded once. */
(function (MA) {
  'use strict';
  var U = MA.u;
  var TABLES = ['students', 'domains', 'topics', 'skills', 'activities', 'questions', 'progress', 'attempts', 'answers',
    'events', 'errors', 'shopItems'];
  /* tables of removed features (missions, badges, notifications); deleted from saved games to free storage */
  var OLD_TABLES = ['achievements', 'studentAchievements', 'missions', 'studentMissions', 'notifications'];
  var KEY = 'mathoria:db:v1';
  var CAPS = { events: 4000, answers: 9000, errors: 300 };
  var data = null, timer = null;

  function empty() { var d = { v: 1, meta: { createdAt: Date.now(), contentVersion: 0 }, settings: {}, t: {} }; TABLES.forEach(function (n) { d.t[n] = {}; }); return d; }
  function store() { try { return window.localStorage; } catch (e) { return null; } }

  var db = MA.db = {
    TABLES: TABLES,
    KEY: KEY,
    open: function () {
      var raw = null, ls = store();
      if (ls) try { raw = ls.getItem(KEY); } catch (e) { raw = null; }
      data = null;
      if (raw) try { data = JSON.parse(raw); } catch (e) { MA.errors.capture(e, 'db:parse'); data = null; }
      if (!data || !data.t) data = empty();
      TABLES.forEach(function (n) { if (!data.t[n]) data.t[n] = {}; });
      OLD_TABLES.forEach(function (n) { delete data.t[n]; });
      db.seedContent();
      db.saveNow();
      return data;
    },
    save: function () { clearTimeout(timer); timer = setTimeout(db.saveNow, 120); },
    saveNow: function () {
      clearTimeout(timer);
      var ls = store(); if (!ls || !data) return false;
      for (var attempt = 0; attempt < 3; attempt++) {
        try { ls.setItem(KEY, JSON.stringify(data)); return true; }
        catch (e) { db.prune(attempt + 1); }
      }
      MA.toast(MA.t('storage_full'), { type: 'bad', icon: '💾' });
      return false;
    },
    prune: function (strength) {
      ['events', 'answers', 'errors'].forEach(function (n) { db.cap(n, Math.floor(Object.keys(data.t[n]).length * (1 - .3 * strength))); });
    },

    table: function (n) { return data.t[n]; },
    all: function (n, pred) { var t = data.t[n], out = []; for (var k in t) if (!pred || pred(t[k])) out.push(t[k]); return out; },
    count: function (n, pred) { var t = data.t[n], c = 0; for (var k in t) if (!pred || pred(t[k])) c++; return c; },
    get: function (n, id) { return id == null ? null : data.t[n][id] || null; },
    insert: function (n, rec) {
      rec.id = rec.id || U.uid(n.slice(0, 3));
      if (rec.createdAt == null) rec.createdAt = U.now();
      data.t[n][rec.id] = rec;
      if (CAPS[n]) db.capLazy(n);
      db.save();
      return rec;
    },
    put: function (n, rec) { data.t[n][rec.id] = rec; db.save(); return rec; },
    update: function (n, id, patch) { var r = data.t[n][id]; if (!r) return null; for (var k in patch) r[k] = patch[k]; r.updatedAt = U.now(); db.save(); return r; },
    remove: function (n, id) { delete data.t[n][id]; db.save(); },
    removeWhere: function (n, pred) { var t = data.t[n]; for (var k in t) if (pred(t[k])) delete t[k]; db.save(); },
    capLazy: function (n) { var c = Object.keys(data.t[n]).length; if (c > CAPS[n] * 1.1) db.cap(n, CAPS[n]); },
    cap: function (n, max) {
      var arr = db.all(n).sort(function (a, b) { return (a.ts || a.createdAt || 0) - (b.ts || b.createdAt || 0); });
      for (var i = 0; i < arr.length - max; i++) delete data.t[n][arr[i].id];
    },
    setting: function (k) { return data.settings[k] != null ? data.settings[k] : DEFAULT_SETTINGS[k]; },
    meta: function () { return data.meta; },

    /* Built-in content comes from code. When CONTENT_VERSION goes up, every built-in record is rewritten
       (new grades, shop items and text fixes reach saved games); player data keeps referring to the same ids. */
    seedContent: function () {
      if ((data.meta.contentVersion || 0) >= CONTENT_VERSION) return;
      var C = MA.CURRICULUM, t = data.t;
      C.domains.forEach(function (d) { t.domains[d.id] = U.copy(d); });
      C.topics.forEach(function (x) { t.topics[x.id] = U.copy(x); });
      C.skills.forEach(function (s) { t.skills[s.id] = U.copy(s); });
      C.skills.forEach(function (s) { var a = MA.practiceActivity(s); t.activities[a.id] = a; });
      MA.ACTIVITY_SEED.forEach(function (a) { var sk = t.skills[a.skillId]; var c = U.copy(a); c.grade = sk ? sk.grade : 1; t.activities[a.id] = c; });
      Object.keys(t.activities).forEach(function (id) { var a = t.activities[id], sk = t.skills[a.skillId]; if (sk) { a.grade = a.grade || sk.grade; a.domainId = sk.domainId; a.world = sk.world; } });
      SHOP.forEach(function (s) { t.shopItems[s.id] = U.copy(s); });
      Object.keys(t.shopItems).forEach(function (id) { if (!SHOP.some(function (s) { return s.id === id; })) delete t.shopItems[id]; });
      BANK.forEach(function (b) { t.questions[b.id] = U.copy(b); });
      data.meta.contentVersion = CONTENT_VERSION;
    }
  };
  var CONTENT_VERSION = 3;
  var DEFAULT_SETTINGS = { xpPerCorrect: 10, activityXp: 20, activityCoins: 10, maxTries: 3, bankMixRate: .2 };

  /* the shop catalog lives in shop_items.js */
  var SHOP = MA.SHOP_ITEMS || [];
  function bq(id, skillId, type, pEn, pHe, options, answer, eEn, eHe, diff) {
    return { id: id, skillId: skillId, type: type, prompt: { en: pEn, he: pHe }, options: options, answer: answer, explanation: { en: eEn, he: eHe }, difficulty: diff || 2, status: 'published', createdBy: 'system', createdAt: Date.now() };
  }
  var BANK = [
    bq('bq1', 'g1-add-addword', 'input', 'A cat has 4 legs. How many legs do 2 cats have?', 'לחתול יש 4 רגליים. כמה רגליים יש ל־2 חתולים?', null, 8, '4 + 4 = 8', '4 + 4 = 8', 3),
    bq('bq2', 'g1-num-oddeven', 'choice', 'Which number is between 6 and 8?', 'איזה מספר נמצא בין 6 ל־8?', [{ en: '5', he: '5' }, { en: '7', he: '7' }, { en: '9', he: '9' }], 1, '6, 7, 8', '6, 7, 8', 1),
    bq('bq3', 'g1-time-days', 'choice', 'How many days are in a week?', 'כמה ימים יש בשבוע?', [{ en: '5', he: '5' }, { en: '7', he: '7' }, { en: '10', he: '10' }], 1, 'A week has 7 days.', 'בשבוע יש 7 ימים.', 1),
    bq('bq4', 'g2-mul-x2', 'input', 'A bike has 2 wheels. How many wheels do 6 bikes have?', 'לאופניים יש 2 גלגלים. כמה גלגלים יש ל־6 אופניים?', null, 12, '6 × 2 = 12', '6 × 2 = 12', 2),
    bq('bq5', 'g2-tm-coins', 'choice', 'Which is more money?', 'מה שווה יותר כסף?', [{ en: '3 coins of 10 cents', he: '3 מטבעות של 10 אגורות' }, { en: '1 coin of 50 cents', he: 'מטבע אחד של 50 אגורות' }], 1, '30 is less than 50.', '30 קטן מ־50.', 2),
    bq('bq6', 'g2-num-oddeven', 'choice', 'Which number is even?', 'איזה מספר זוגי?', [{ en: '35', he: '35' }, { en: '48', he: '48' }, { en: '51', he: '51' }], 1, '48 ends in 8, so it is even.', '48 מסתיים ב־8, ולכן הוא זוגי.', 2),
    bq('bq7', 'g3-div-word', 'input', '24 children sit at tables of 4. How many tables are needed?', '24 ילדים יושבים ליד שולחנות של 4. כמה שולחנות צריך?', null, 6, '24 ÷ 4 = 6', '24 ÷ 4 = 6', 2),
    bq('bq8', 'g3-frac-qty', 'input', 'Half of the 18 cupcakes are chocolate. How many are chocolate?', 'חצי מ־18 העוגיות הן שוקולד. כמה עוגיות שוקולד יש?', null, 9, '18 ÷ 2 = 9', '18 ÷ 2 = 9', 2),
    bq('bq9', 'g3-logic-reasoning', 'choice', 'Dan is taller than Ella. Ella is taller than Tom. Who is the shortest?', 'דן גבוה מאלה. אלה גבוהה מתום. מי הכי נמוך?', [{ en: 'Dan', he: 'דן' }, { en: 'Ella', he: 'אלה' }, { en: 'Tom', he: 'תום' }], 2, 'Dan > Ella > Tom, so Tom is the shortest.', 'דן > אלה > תום, ולכן תום הכי נמוך.', 3),
    bq('bq10', 'g3-time-elapsed', 'input', 'A movie starts at 4:00 and ends at 5:30. How many minutes long is the movie?', 'סרט מתחיל ב־4:00 ומסתיים ב־5:30. כמה דקות נמשך הסרט?', null, 90, '60 min + 30 min = 90 min', '60 דקות + 30 דקות = 90 דקות', 3),
    bq('bq11', 'g4-num-round', 'choice', 'A stadium has 48,615 seats. About how many seats is that, to the nearest thousand?', 'באצטדיון יש 48,615 מקומות. בערך כמה מקומות זה, לאלף הקרוב?', [{ en: '48,000', he: '48,000' }, { en: '49,000', he: '49,000' }, { en: '50,000', he: '50,000' }], 1, '48,615 is closer to 49,000.', '48,615 קרוב יותר ל־49,000.', 3),
    bq('bq12', 'g4-frac-compare', 'choice', 'Maya ate 3/8 of a pizza. Leo ate 1/2 of the same size pizza. Who ate more?', 'מאיה אכלה 3/8 פיצה. לאו אכל 1/2 פיצה באותו גודל. מי אכל יותר?', [{ en: 'Maya', he: 'מאיה' }, { en: 'Leo', he: 'לאו' }, { en: 'The same', he: 'אותו דבר' }], 1, '1/2 = 4/8, and 4/8 > 3/8.', '1/2 = 4/8, ו־4/8 > 3/8.', 3),
    bq('bq13', 'g4-mul-word', 'input', 'A box holds 24 crayons. How many crayons are in 5 boxes?', 'בקופסה יש 24 צבעים. כמה צבעים יש ב־5 קופסאות?', null, 120, '24 × 5 = 120', '24 × 5 = 120', 3),
    bq('bq14', 'g4-meas-real', 'input', 'Juice costs $7 per bottle. How many dollars do 4 bottles cost?', 'בקבוק מיץ עולה 7 שקלים. כמה שקלים עולים 4 בקבוקים?', null, 28, '7 × 4 = 28', '7 × 4 = 28', 2),
    bq('bq15', 'g2-geo-shapes2d', 'choice', 'How many corners does a hexagon have?', 'כמה פינות יש למשושה?', [{ en: '5', he: '5' }, { en: '6', he: '6' }, { en: '8', he: '8' }], 1, 'A hexagon has 6 sides and 6 corners.', 'למשושה 6 צלעות ו־6 פינות.', 2),
    bq('bq16', 'g1-meas-weight', 'choice', 'Which is usually heavier?', 'מה בדרך כלל כבד יותר?', [{ en: 'A watermelon', he: 'אבטיח' }, { en: 'A grape', he: 'ענב' }], 0, 'A watermelon is much heavier than a grape.', 'אבטיח כבד הרבה יותר מענב.', 1)
  ];
  MA.i18n.add({ en: { storage_full: 'Storage is full. Old activity history was trimmed; some data could not be saved.' }, he: { storage_full: 'האחסון מלא. היסטוריה ישנה קוצרה; חלק מהנתונים לא נשמרו.' } });
})(window.MA = window.MA || {});
