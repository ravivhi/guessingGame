/* Shared view infrastructure: hash router (every page belongs to the current player on this device),
   the game shell, avatar rendering, spoken screen instructions, the grown-ups lock and small UI builders. */
(function (MA) {
  'use strict';
  var U = MA.u, h = U.h, db = MA.db, S = MA.svc, t = function (k, p) { return MA.t(k, p); };
  var V = MA.views = {};

  /* ------------------------------------------------------------------ router */
  var routes = [];
  var Rt = MA.router = {
    add: function (pattern, def) {
      var keys = [], re = new RegExp('^' + pattern.replace(/:(\w+)/g, function (m, k) { keys.push(k); return '([^/]+)'; }) + '$');
      def.pattern = pattern; def.re = re; def.keys = keys; routes.push(def);
    },
    parse: function (hash) {
      var raw = (hash || '#/').replace(/^#/, '') || '/', parts = raw.split('?'), path = parts[0], query = {};
      (parts[1] || '').split('&').forEach(function (kv) { if (!kv) return; var p = kv.split('='); query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); });
      for (var i = 0; i < routes.length; i++) { var m = routes[i].re.exec(path); if (m) { var params = {}; routes[i].keys.forEach(function (k, j) { params[k] = decodeURIComponent(m[j + 1]); }); return { route: routes[i], params: params, query: query, path: path }; } }
      return { route: null, params: {}, query: query, path: path };
    },
    go: function (hash) { if (location.hash === hash) Rt.render(); else location.hash = hash; },
    render: function () {
      var r = Rt.parse(location.hash), def = r.route, ses = S.ensurePlayer(), st = ses.student;
      if (!def) { location.replace('#/s/home'); return; }
      if (!st.onboarded && r.path !== '/s/onboarding' && !/^\/s\/play/.test(r.path)) { location.replace('#/s/onboarding'); return; }
      if (st.onboarded && !st.gender && r.path !== '/s/me' && !/^\/s\/play/.test(r.path)) { location.replace('#/s/me?first=1'); return; }
      if (MA.i18n.lang !== st.lang) MA.i18n.setLang(st.lang, true);
      applyKidPrefs(st.settings);
      if (!Rt.current || Rt.current.path !== r.path) Rt.visit = (Rt.visit || 0) + 1;
      Rt.current = r;
      document.title = (def.title ? t(def.title) + ' · ' : '') + t('app_name');
      var app = document.getElementById('app');
      try {
        var main = V.studentShell(app, st, r);
        def.render(main, r.params, r.query, ses);
        if (!/^\/s\/play/.test(r.path)) window.scrollTo(0, 0);
      } catch (e) {
        MA.errors.capture(e, 'route ' + r.path);
        U.clear(app).appendChild(h('div', { class: 'auth-wrap' }, h('div', { class: 'card pad auth-card center' }, h('div', { style: { fontSize: '48px' } }, '🙈'), h('h2', null, t('error_generic')),
          h('a', { class: 'btn btn-primary', href: '#/s/home' }, t('go_home')))));
      }
    }
  };
  function applyKidPrefs(s) {
    var de = document.documentElement;
    de.classList.toggle('large-text', !!(s && s.largeText));
    de.classList.toggle('high-contrast', !!(s && s.highContrast));
    de.classList.toggle('reduce-motion', !!(s && s.reducedMotion));
  }

  /* ------------------------------------------------------------------ small builders */
  /* the player's character in a circle (frame + background from the shop, pet at the side); o.look overrides the look */
  V.avatar = function (s, size, o) {
    o = o || {};
    var eq = (s && s.equipped) || {}, cls = 'avatar' + (size ? ' av-' + size : ''), style = { background: (s && s.avatar && s.avatar.color) || '#E5DCFF' };
    var bg = eq.bg && db.get('shopItems', eq.bg), fr = o.frame || (eq.frame && db.get('shopItems', eq.frame)), pet = eq.pet && db.get('shopItems', eq.pet);
    if (bg && bg.css) style.background = bg.css;
    if (o.bg) style.background = o.bg;
    if (fr && fr.cls) cls += ' ' + fr.cls;
    var look = o.look || MA.avatar.look(s);
    return h('span', { class: cls, style: style, 'aria-hidden': 'true' }, h('span', { class: 'av-pic', html: MA.avatar.svg(look, { view: 'portrait' }) }), pet && !o.noPet ? h('span', { class: 'pet' }, pet.icon) : null);
  };
  /* the whole character, standing (home, my look, the shop) */
  V.figure = function (s, o) {
    o = o || {};
    var look = o.look || MA.avatar.look(s), eq = (s && s.equipped) || {}, bg = eq.bg && db.get('shopItems', eq.bg);
    if (!o.noPet && !look.pet && eq.pet) { var pet = db.get('shopItems', eq.pet); if (pet) look.pet = pet.icon; }
    return h('span', { class: 'figure' + (o.cls ? ' ' + o.cls : ''), style: o.plain ? null : { background: (bg && bg.css) || (s && s.avatar && s.avatar.color) || '#E5DCFF' }, html: MA.avatar.svg(look, { view: 'full' }), 'aria-hidden': 'true' });
  };
  V.gradeLabel = function (g) { return t('grade_n', { n: g }); };
  V.playerName = function (s) { return (s && s.name) || t('player_default'); };
  V.empty = function (icon, title, text, action) { return h('div', { class: 'empty' }, h('div', { class: 'e-icon', 'aria-hidden': 'true' }, icon), h('div', { class: 'e-title' }, title), text ? h('div', null, text) : null, action || null); };
  V.pbar = function (pct, cls) { return h('div', { class: 'pbar ' + (cls || ''), role: 'progressbar', 'aria-valuenow': Math.round((pct || 0) * 100), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: { width: Math.round(U.clamp(pct || 0, 0, 1) * 100) + '%' } })); };
  V.field = function (label, input, hint) { return h('div', { class: 'field' }, h('label', null, label), input, hint ? h('div', { class: 'hint' }, hint) : null); };
  V.select = function (opts, value, attrs) { var s = h('select', attrs || {}, opts.map(function (o) { return h('option', { value: o[0] }, o[1]); })); if (value != null) s.value = String(value); return s; };
  V.errorMsg = function (e) { return (e && e.key) ? e.message : t('error_generic'); };
  V.run = function (fn, okMsg) { try { var r = fn(); if (okMsg) MA.toast(okMsg, { type: 'good', icon: '✅' }); return r; } catch (e) { if (!e.key) MA.errors.capture(e, 'action'); MA.toast(V.errorMsg(e), { type: 'bad', icon: '⚠️' }); return null; } };

  /* ------------------------------------------------------------------ voice: every screen explains itself out loud */
  V.readAloudOn = function () { var st = S.student(); return !!(st && st.settings && st.settings.readAloud); };
  /* speaks a screen's instruction once per visit (re-renders of the same screen stay quiet) */
  V.voice = function (text) {
    if (!V.readAloudOn() || V.voicedVisit === Rt.visit) return;
    V.voicedVisit = Rt.visit;
    MA.speech.say(text);
  };
  V.voiceBtn = function (getText) {
    return MA.speech.supported ? h('button', { class: 'btn btn-soft btn-icon voice-btn', type: 'button', 'aria-label': t('read_aloud'), onclick: function (e) { e.preventDefault(); e.stopPropagation(); MA.speech.say(getText()); } }, '🔊') : null;
  };
  /* a "not yet" shake with a spoken reason, for locked or unaffordable things */
  V.nudge = function (el, key) {
    MA.fx.anim(el, 'wiggle'); MA.sfx.play('click');
    if (V.readAloudOn()) MA.speech.say(t(key));
  };

  /* ------------------------------------------------------------------ grown-ups lock: a sum a 6-year-old can't do keeps the settings out of reach */
  V.grownUps = function (then) {
    var a = U.rng.int(6, 9), b = U.rng.int(6, 9), m;
    var inp = h('input', { class: 'input gate-in', type: 'text', inputmode: 'numeric', maxlength: 3, autocomplete: 'off', 'aria-label': t('gate_q', { a: a, b: b }) });
    function check() { var ok = +inp.value.trim() === a * b; m.close(); if (ok) then(); }
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    m = MA.modal({ title: t('gate_title'), icon: '🔐', body: h('div', { class: 'stack' }, h('p', { class: 'big bold gate-q' }, t('gate_q', { a: a, b: b })), inp),
      actions: [{ label: t('cancel'), cls: 'btn-ghost' }, { label: t('ok'), cls: 'btn-primary', close: false, onClick: function () { check(); return false; } }] });
  };

  /* ------------------------------------------------------------------ game shell: 🏠, my avatar, coins, sound and the grown-ups gear */
  V.studentShell = function (app, st, r) {
    var playing = /^\/s\/play/.test(r.path) || r.path === '/s/onboarding', home = r.path === '/s/home';
    var soundBtn = h('button', { class: 'btn btn-ghost btn-icon', 'aria-label': st.settings.sound ? t('sound_on') : t('sound_off'), onclick: function () { st.settings.sound = !st.settings.sound; MA.sfx.enabled = st.settings.sound; db.save(); Rt.render(); } }, st.settings.sound ? '🔊' : '🔇');
    var top = playing ? null : h('header', { class: 's-top' },
      home ? null : h('a', { class: 'btn btn-primary btn-icon top-home', href: '#/s/home', 'aria-label': t('go_home') }, '🏠'),
      h('a', { class: 's-me', href: '#/s/rewards', 'aria-label': t('s_shop') }, V.avatar(st, 'sm'), h('span', { class: 's-name' }, V.playerName(st))),
      h('span', { class: 'spacer' }),
      h('a', { class: 'pill coins', href: '#/s/rewards', id: 's-coins', 'aria-label': t('coins') }, '🪙 ' + U.num(st.coins)),
      soundBtn,
      h('button', { class: 'btn btn-ghost btn-icon', 'aria-label': t('settings'), title: t('settings'), onclick: function () { V.grownUps(V.openSettings); } }, '⚙️'));
    var main = h('main', { class: 's-main', id: 'main', tabindex: '-1' });
    U.clear(app).appendChild(h('div', { class: 'shell-s' + (playing ? ' playing' : '') }, top, h('div', { class: 's-body' }, main)));
    return main;
  };

  V.refreshStudentHeader = function (st) {
    var el = document.getElementById('s-coins'); if (el) el.textContent = '🪙 ' + U.num(st.coins);
  };

  MA.i18n.add({
    en: { gate_title: 'For grown-ups', gate_q: 'What is {a} × {b}?' },
    he: { gate_title: 'למבוגרים', gate_q: 'כמה זה {a} × {b}?' }
  });
})(window.MA = window.MA || {});
