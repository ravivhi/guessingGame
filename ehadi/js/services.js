/* Services for the account-free game: content index, the players on this device (create, switch,
   update, delete) and analytics events. Views never write to MA.db directly. */
(function (MA) {
  'use strict';
  var U = MA.u, db = MA.db, t = function (k, p) { return MA.t(k, p); };
  var S = MA.svc = {};
  function Err(key, p) { var e = new Error(t(key, p)); e.key = key; return e; }
  S.Err = Err;
  var PLAYER_KEY = 'mathoria:player';

  /* ------------------------------------------------------------------ content index */
  var C = MA.content = { _v: -1 };
  function idx() {
    var v = db.meta().contentStamp || 0;
    if (C._v === v && C._ix) return C._ix;
    var ix = { skills: {}, bySkillAct: {}, byDomain: {}, byWorld: {} };
    db.all('skills').forEach(function (s) { ix.skills[s.id] = s; (ix.byDomain[s.domainId] = ix.byDomain[s.domainId] || []).push(s); });
    Object.keys(ix.byDomain).forEach(function (k) { ix.byDomain[k].sort(function (a, b) { return a.order - b.order; }); });
    db.all('activities').forEach(function (a) { (ix.bySkillAct[a.skillId] = ix.bySkillAct[a.skillId] || []).push(a); });
    C._ix = ix; C._v = v;
    return ix;
  }
  C.worlds = function () { return MA.CURRICULUM.worlds; };
  C.world = function (id) { return MA.CURRICULUM.worlds.filter(function (w) { return w.id === id; })[0]; };
  C.skill = function (id) { return idx().skills[id] || null; };
  C.skills = function (f) { var all = db.all('skills', f); return all.sort(function (a, b) { return a.grade - b.grade || a.order - b.order; }); };
  C.gradeSkills = function (g, includeDisabled) { return C.skills(function (s) { return s.grade === g && (includeDisabled || s.enabled !== false); }); };
  C.domains = function (g) { return db.all('domains', function (d) { return g == null || d.grade === g; }).sort(function (a, b) { return a.grade - b.grade || a.order - b.order; }); };
  C.domain = function (id) { return db.get('domains', id); };
  C.topics = function (domainId) { return db.all('topics', function (x) { return x.domainId === domainId; }).sort(function (a, b) { return a.order - b.order; }); };
  C.topic = function (id) { return db.get('topics', id); };
  C.domainSkills = function (domainId, includeDisabled) { return (idx().byDomain[domainId] || []).filter(function (s) { return includeDisabled || s.enabled !== false; }); };
  C.activity = function (id) { return db.get('activities', id); };
  C.activitiesForSkill = function (skillId, all) { return (idx().bySkillAct[skillId] || []).filter(function (a) { return all || a.status === 'published'; }); };
  C.practiceFor = function (skillId) { return db.get('activities', 'pr-' + skillId); };
  C.flagships = function (grade) { return db.all('activities', function (a) { return a.flagship && a.status === 'published' && (grade == null || a.grade <= grade); }).sort(function (a, b) { return a.grade - b.grade; }); };
  C.worldSkills = function (worldId, grade) { return C.gradeSkills(grade).filter(function (s) { return s.world === worldId; }); };
  C.icon = function (skill) { var d = MA.CURRICULUM.domainMeta[skill.domain]; return d ? d.icon : '⭐'; };
  C.worldOfDomain = function (key) { return MA.CURRICULUM.worlds.filter(function (w) { return w.domains.indexOf(key) >= 0; })[0]; };

  /* ------------------------------------------------------------------ players on this device */
  var AV_COLORS = S.AV_COLORS = ['#FFD6A5', '#CAFFBF', '#9BF6FF', '#BDB2FF', '#FFC6FF', '#FDFFB6', '#FFADAD', '#A0C4FF'];
  function validGrade(g) { g = +g; return [1, 2, 3, 4, 5, 6].indexOf(g) >= 0 ? g : null; }
  function cleanName(n) { n = String(n || '').replace(/[<>]/g, '').trim(); if (!n || n.length > 30) throw Err('err_name'); return n; }
  function remember(id) { try { localStorage.setItem(PLAYER_KEY, id); } catch (e) { /* storage blocked */ } }

  S.players = function () { return db.all('students', function (s) { return s.status !== 'disabled'; }).sort(function (a, b) { return a.createdAt - b.createdAt; }); };
  S.session = function () {
    var id = null; try { id = localStorage.getItem(PLAYER_KEY); } catch (e) { /* storage blocked */ }
    var s = id ? db.get('students', id) : null;
    return s && s.status !== 'disabled' ? { kind: 'student', student: s, role: 'student' } : null;
  };
  S.student = function () { var s = S.session(); return s ? s.student : null; };
  /* the current player, else the most recently active one, else a brand-new player (first launch) */
  S.ensurePlayer = function () {
    var ses = S.session(); if (ses) return ses;
    var recent = S.players().sort(function (a, b) { return (b.lastActive || b.createdAt) - (a.lastActive || a.createdAt); })[0];
    if (recent) remember(recent.id); else S.createPlayer();
    return S.session();
  };
  S.createPlayer = function () {
    var av = MA.avatar.defaults('m'); av.color = U.pick(AV_COLORS);
    var s = db.insert('students', {
      name: '', grade: 1, lang: MA.i18n.lang, gender: null, avatar: av, character: 'nomi', status: 'active', onboarded: false, ui: 3,
      settings: { sound: true, readAloud: true, reducedMotion: false, largeText: false, highContrast: false, hints: true },
      xp: 0, totalXp: 0, coins: 0, level: 1,
      inventory: [], equipped: {}, stats: { activities: 0, correct: 0, answered: 0 }, inProgress: null, lastActive: null, unlocked: {}
    });
    remember(s.id);
    S.track('player_created', {});
    db.saveNow();
    return s;
  };
  S.switchPlayer = function (sid) {
    var s = db.get('students', sid); if (!s || s.status === 'disabled') throw Err('forbidden');
    remember(sid);
    S.track('player_switched', {});
  };
  S.updatePlayer = function (sid, patch) {
    var s = db.get('students', sid); if (!s) throw Err('forbidden');
    if (patch.name != null) s.name = String(patch.name).trim() ? cleanName(patch.name) : '';
    if (patch.grade != null) { var g = validGrade(patch.grade); if (!g) throw Err('err_grade'); s.grade = g; }
    if (patch.lang) s.lang = patch.lang === 'he' ? 'he' : 'en';
    if (patch.settings) for (var k in patch.settings) if (k in s.settings) s.settings[k] = !!patch.settings[k];
    if (patch.gender === 'm' || patch.gender === 'f') {
      if (s.avatar && s.avatar.v === 2 && MA.avatar.BASE_HAIR[patch.gender].indexOf(s.avatar.hair) < 0) s.avatar.hair = MA.avatar.defaults(patch.gender).hair;
      s.gender = patch.gender;
    }
    if (patch.avatar) setLook(s, patch.avatar);
    if (patch.onboarded != null) s.onboarded = !!patch.onboarded;
    db.saveNow();
    return s;
  };
  /* the free look: only values from the pickers are accepted */
  function setLook(s, a) {
    var AV = MA.avatar, cur = s.avatar && s.avatar.v === 2 ? s.avatar : AV.defaults(s.gender);
    cur.v = 2;
    if (AV.SKINS.indexOf(a.skin) >= 0) cur.skin = a.skin;
    if (AV.BASE_HAIR.m.concat(AV.BASE_HAIR.f).indexOf(a.hair) >= 0) cur.hair = a.hair;
    if (AV.HAIR_COLORS.indexOf(a.hairColor) >= 0) cur.hairColor = a.hairColor;
    if (AV.EYES.indexOf(a.eyes) >= 0) cur.eyes = a.eyes;
    if (AV.TEES.indexOf(a.top) >= 0) cur.top = a.top;
    if (AV_COLORS.indexOf(a.color) >= 0) cur.color = a.color;
    s.avatar = cur;
  }
  /* the shop before the boy/girl characters: similar new items replace old ones, the rest is refunded */
  var OLD_ITEMS = { acc_cap: ['hat_cap_red', 20], acc_glasses: ['gl_round', 30], acc_shades: ['gl_sun', 60], acc_grad: ['hat_grad', 80], acc_crown: ['hat_crown', 140], acc_headphones: ['hat_headphones', 70],
    acc_scarf: ['jw_scarf', 50], acc_medal: ['jw_medal', 160], acc_wand: ['toy_wand', 320], acc_gem: ['toy_diamond', 550], acc_trophy: ['toy_trophy', 1500], acc_tophat: ['hat_tophat', 35],
    acc_bow: [null, 25], acc_flower: [null, 30], acc_sunhat: [null, 45], acc_backpack: [null, 55], acc_ring: [null, 220], char_robot: [null, 100], char_dino: [null, 120], char_alien: [null, 150],
    char_ninja: [null, 200], char_wizard: [null, 260], char_fairy: [null, 300], char_mermaid: [null, 300], char_hero: [null, 450], char_genie: [null, 650], char_prince: [null, 900], char_princess: [null, 900] };
  S.deletePlayer = function (sid) {
    if (!db.get('students', sid)) return;
    ['progress', 'attempts', 'answers'].forEach(function (tb) { db.removeWhere(tb, function (r) { return r.studentId === sid; }); });
    db.removeWhere('events', function (e) { return e.sid === sid; });
    db.remove('students', sid);
    var cur = null; try { cur = localStorage.getItem(PLAYER_KEY); } catch (e) { /* storage blocked */ }
    if (cur === sid) try { localStorage.removeItem(PLAYER_KEY); } catch (e) { /* storage blocked */ }
    db.saveNow();
  };

  /* players from earlier versions: read-aloud on and removed-feature fields dropped (ui 2), then the drawn
     boy/girl character with the new shop (ui 3). Each step runs once. */
  S.migratePlayers = function () {
    var changed = false;
    db.all('students').forEach(function (s) {
      if (s.ui >= 3) return;
      changed = true;
      if (!(s.ui >= 2)) {
        if (s.settings) { s.settings.readAloud = true; delete s.settings.timed; }
        delete s.goals; delete s.streak; delete s.worldsVisited; delete s.lastDailyNotif; delete s.dailyDone;
      }
      s.ui = 3;
      if (!(s.avatar && s.avatar.v === 2)) { var color = s.avatar && s.avatar.color; s.avatar = MA.avatar.defaults(s.gender); if (color) s.avatar.color = color; }
      var inv = [], eq = {}, old = s.equipped || {};
      (s.inventory || []).forEach(function (id) {
        var o = OLD_ITEMS[id];
        if (!o) { if (db.get('shopItems', id)) inv.push(id); return; }
        if (o[0] && db.get('shopItems', o[0])) inv.push(o[0]); else s.coins = (s.coins || 0) + o[1];
      });
      ['pet', 'bg', 'frame'].forEach(function (k) { if (old[k] && inv.indexOf(old[k]) >= 0) eq[k] = old[k]; });
      var acc = old.acc && OLD_ITEMS[old.acc] && OLD_ITEMS[old.acc][0], accIt = acc && db.get('shopItems', acc);
      if (accIt && inv.indexOf(acc) >= 0) eq[accIt.slot] = acc;
      s.inventory = U.uniq(inv); s.equipped = eq;
    });
    if (changed) db.saveNow();
  };

  /* ------------------------------------------------------------------ analytics events (local only) */
  S.track = function (type, payload) {
    var st = S.student();
    try { db.insert('events', { ts: U.now(), type: type, sid: st ? st.id : null, p: payload || {} }); } catch (e) { /* analytics must never break the game */ }
  };

  MA.i18n.add({
    en: {
      player_default: 'Player', err_name: 'Please enter a name (up to 30 characters).', err_grade: 'Please choose a grade from 1 to 6.'
    },
    he: {
      player_default: 'שחקן/ית', err_name: 'הקלידו שם (עד 30 תווים).', err_grade: 'בחרו כיתה מ־א׳ עד ו׳.'
    }
  });
})(window.MA = window.MA || {});
