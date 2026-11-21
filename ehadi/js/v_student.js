/* Kid screens, made for children who can't read yet: big pictures, few choices, and every screen says what
   to do out loud. Home (play button, worlds, shop), world trail, prize shop and "my look" with the child's
   own boy or girl character, onboarding, play route, and the grown-ups settings behind the lock. */
(function (MA) {
  'use strict';
  var U = MA.u, h = U.h, db = MA.db, S = MA.svc, C = MA.content, A = MA.adapt, Gm = MA.game, V = MA.views, Rt = MA.router, AV = MA.avatar, t = function (k, p) { return MA.t(k, p); };
  MA.i18n.add({
    en: {
      s_hello: 'Hi {name}!', s_play: 'Play', s_shop: 'Prize shop', s_games: 'Games', s_buy: 'Get it',
      s_cat_me: 'My look', s_cat_clothes: 'Clothes', s_cat_legs: 'Pants and shoes', s_cat_hair: 'Hair', s_cat_hats: 'Hats and glasses', s_cat_jewels: 'Jewelry and accessories',
      s_cat_toys: 'Toys', s_cat_pets: 'Pets', s_cat_room: 'Backgrounds and frames',
      v_home: 'Hi {name}! Press the big button to play, or choose a world.', v_home_anon: 'Hi! Press the big button to play, or choose a world.',
      v_world: 'Welcome to {name}! Press a circle on the path to play.', v_shop: 'Choose a prize. Prizes cost coins.',
      v_locked: 'This is still locked. Keep playing to open it!', v_coins: 'You need more coins. Play to earn more!',
      v_buy_q: 'Get {name} for {n} coins? Press the green check.', v_wear: 'Press a prize you have to put it on or take it off.',
      v_me: 'This is how you look! Choose your skin, hair, eyes and shirt. Press the green check when you are done.',
      v_gender: 'Are you a boy or a girl? Press your picture.', v_look: 'Now choose how you look. Then press the rocket.',
      onb_hi: 'Welcome to Mathoria!', onb_grownup: "For a grown-up: write the child's name and choose the grade.", onb_name: "Child's name", onb_name_ph: 'Name',
      onb_grade: 'Grade', onb_who: 'Boy or girl?', onb_look: 'Choose your look', onb_enter: "Let's go!", g_boy: 'Boy', g_girl: 'Girl',
      look_skin: 'Skin', look_hair: 'Hair', look_hair_color: 'Hair color', look_eyes: 'Eyes', look_shirt: 'Shirt', me_done: 'Done',
      set_name: 'Name', set_gender: 'Boy or girl', set_options: 'Options', set_readAloud: 'Read everything aloud', set_hints: 'Show the hint button', set_largeText: 'Large text',
      set_highContrast: 'High contrast', set_reducedMotion: 'Reduce motion', set_players: 'Players on this device', set_playing_now: 'Playing now', set_switch: 'Play',
      set_new_player: 'New player', set_delete_q: 'Delete {name} and all of their progress?'
    },
    he: {
      s_hello: 'היי {name}!', s_play: 'משחקים', s_shop: 'חנות הפרסים', s_games: 'משחקים', s_buy: 'לקבל',
      s_cat_me: 'המראה שלי', s_cat_clothes: 'בגדים', s_cat_legs: 'מכנסיים ונעליים', s_cat_hair: 'שיער', s_cat_hats: 'כובעים ומשקפיים', s_cat_jewels: 'תכשיטים ואביזרים',
      s_cat_toys: 'צעצועים', s_cat_pets: 'חיות מחמד', s_cat_room: 'רקעים ומסגרות',
      v_home: 'היי {name}! לחצו על הכפתור הגדול כדי לשחק, או בחרו עולם.', v_home_anon: 'היי! לחצו על הכפתור הגדול כדי לשחק, או בחרו עולם.',
      v_world: 'ברוכים הבאים ל{name}! לחצו על עיגול בשביל כדי לשחק.', v_shop: 'בחרו פרס. הפרסים עולים מטבעות.',
      v_locked: 'זה עוד נעול. שחקו עוד כדי לפתוח!', v_coins: 'צריך עוד מטבעות. שחקו כדי להרוויח עוד!',
      v_buy_q: 'לקנות {name} ב־{n} מטבעות? לחצו על הסימן הירוק.', v_wear: 'לחצו על פרס שכבר יש לכם כדי ללבוש אותו או להוריד אותו.',
      v_me: 'ככה אתם נראים! בחרו צבע עור, שיער, עיניים וחולצה. לחצו על הסימן הירוק כשמסיימים.',
      v_gender: 'בן או בת? לחצו על התמונה שלכם.', v_look: 'עכשיו בחרו איך אתם נראים. ואז לחצו על הטיל.',
      onb_hi: 'ברוכים הבאים למתמטוריה!', onb_grownup: 'למבוגר/ת: כתבו את שם הילד/ה ובחרו כיתה.', onb_name: 'שם הילד/ה', onb_name_ph: 'שם',
      onb_grade: 'כיתה', onb_who: 'בן או בת?', onb_look: 'בחרו איך אתם נראים', onb_enter: 'יוצאים לדרך!', g_boy: 'בן', g_girl: 'בת',
      look_skin: 'צבע עור', look_hair: 'תסרוקת', look_hair_color: 'צבע שיער', look_eyes: 'עיניים', look_shirt: 'חולצה', me_done: 'סיימתי',
      set_name: 'שם', set_gender: 'בן או בת', set_options: 'אפשרויות', set_readAloud: 'להקריא הכול בקול', set_hints: 'להציג את כפתור הרמז', set_largeText: 'טקסט גדול',
      set_highContrast: 'ניגודיות גבוהה', set_reducedMotion: 'הפחתת תנועה', set_players: 'השחקנים במכשיר הזה', set_playing_now: 'משחק/ת עכשיו', set_switch: 'לשחק',
      set_new_player: 'שחקן/ית חדש/ה', set_delete_q: 'למחוק את {name} ואת כל ההתקדמות?'
    }
  });
  var GRADE_ICONS = ['🐣', '🌱', '🌟', '🚀', '🏆', '🎓'];
  var SHOP_TABS = [['me', '🪞'], ['clothes', '👕'], ['legs', '👟'], ['hair', '💇'], ['hats', '🎩'], ['jewels', '💎'], ['toys', '🧸'], ['pets', '🐶'], ['room', '🖼️']];
  function me() { return S.student(); }
  function starsFor(p) { var n = !p || !p.attempts ? 0 : A.isMastered(p) ? 3 : p.status === 'developing' ? 2 : 1; return h('span', { class: 'stars', 'aria-label': n + '/3' }, [1, 2, 3].map(function (k) { return h('span', { class: k <= n ? 'on' : '' }, '★'); })); }
  function actIcon(a) { var sk = C.skill(a.skillId); return a.icon || (sk ? C.icon(sk) : '🎲'); }
  function worldProgress(st, w) { var sks = C.worldSkills(w.id, st.grade), m = sks.filter(function (s) { return A.isMastered(A.view(st.id, s.id)); }).length; return { total: sks.length, mastered: m }; }

  /* ------------------------------------------------------------------ home: the child, one big play button, the worlds and the shop */
  Rt.add('/s/home', { render: function (main) {
    var st = me(), next = A.next(st), named = !!st.name;
    var say = function () { return named ? t('v_home', { name: st.name }) : t('v_home_anon'); };
    var href = next ? '#/s/play/' + next.activity.id + (next.resume ? '?resume=1&mode=' + st.inProgress.mode : '') : firstPractice(st);
    var worlds = C.worlds().filter(function (w) { return C.worldSkills(w.id, st.grade).length || w.bonus; });
    U.clear(main).appendChild(h('div', { class: 'home' },
      h('section', { class: 'home-hero' },
        h('a', { class: 'hh-buddy', href: '#/s/me', 'aria-label': t('s_cat_me') }, h('span', { class: 'hh-bubble' }, t('s_hello', { name: V.playerName(st) })), V.figure(st, { cls: 'hh-figure float' })),
        h('a', { class: 'play-big', href: href, 'aria-label': t('s_play') }, h('span', { class: 'pb-tri', 'aria-hidden': 'true' }, '▶'),
          next ? h('span', { class: 'pb-badge', 'aria-hidden': 'true' }, actIcon(next.activity)) : null),
        V.voiceBtn(say)),
      h('div', { class: 'world-grid' }, worlds.map(function (w) { return worldCard(st, w); }), shopCard(st))));
    V.voice(say());
  } });
  function firstPractice(st) { var sk = C.gradeSkills(st.grade)[0], a = sk && C.practiceFor(sk.id); return a ? '#/s/play/' + a.id : '#/s/home'; }
  function worldCard(st, w) {
    var open = Gm.worldUnlocked(st, w), pr = worldProgress(st, w), card;
    var parts = [h('div', { class: 'w-art', html: MA.svg.world(w.id) }), open ? null : h('span', { class: 'w-lock', 'aria-hidden': 'true' }, '🔒'),
      h('div', { class: 'w-info' }, h('div', { class: 'w-name' }, w.icon + ' ' + MA.tl(w.name)), open && pr.total ? V.pbar(pr.mastered / pr.total, 'good') : null)];
    card = open ? h('a', { class: 'world-card', href: '#/s/world/' + w.id, 'aria-label': MA.tl(w.name) }, parts)
      : h('button', { class: 'world-card locked', type: 'button', 'aria-label': MA.tl(w.name) + ' 🔒', onclick: function () { V.nudge(card, 'v_locked'); } }, parts);
    return card;
  }
  function shopCard(st) {
    return h('a', { class: 'world-card shop-card', href: '#/s/rewards', 'aria-label': t('s_shop') },
      h('div', { class: 'w-art shop-art' }, V.avatar(st, 'xl', { noPet: true }), h('span', { class: 'shop-gift', 'aria-hidden': 'true' }, '🎁')),
      h('div', { class: 'w-info' }, h('div', { class: 'w-name' }, '🪙 ' + U.num(st.coins))));
  }

  /* ------------------------------------------------------------------ a world: tap a circle on the path to play it */
  Rt.add('/s/world/:id', { render: function (main, p) {
    var st = me(), w = C.world(p.id);
    if (!w || !Gm.worldUnlocked(st, w)) { location.replace('#/s/home'); return; }
    var say = function () { return t('v_world', { name: MA.tl(w.name) }); };
    var sks = C.worldSkills(w.id, st.grade), firstOpen = -1, theme = w.theme || ['⭐'], trail = h('div', { class: 'trail' });
    sks.forEach(function (sk, i) {
      var pr = A.view(st.id, sk.id), open = A.unlocked(st, sk, i), done = A.isMastered(pr), act = C.practiceFor(sk.id), node;
      if (firstOpen < 0 && open && !done) firstOpen = i;
      var parts = [i === firstOpen ? h('span', { class: 'n-flag', 'aria-hidden': 'true' }, '👇') : null,
        h('span', { class: 'n-circle', 'aria-hidden': 'true' }, open ? theme[i % theme.length] : '🔒'), h('span', { class: 'n-name' }, MA.tl(sk.name)), starsFor(pr)];
      node = open && act ? h('a', { class: 'node' + (done ? ' done' : '') + (i === firstOpen ? ' current' : ''), href: '#/s/play/' + act.id, 'aria-label': MA.tl(sk.name) }, parts)
        : h('button', { class: 'node locked', type: 'button', 'aria-label': MA.tl(sk.name) + ' 🔒', onclick: function () { V.nudge(node, 'v_locked'); } }, parts);
      trail.appendChild(h('div', { class: 'trail-row' }, node));
    });
    var games = C.flagships(st.grade).filter(function (a) {
      var s2 = C.skill(a.skillId);
      if (a.gameType === 'timed') return false;
      return (s2 && s2.world === w.id && a.gameType !== 'detective') || (w.id === 'cave' && (a.gameType === 'detective' || a.id === 'fl-riddles' || a.id === 'fl-patterns'));
    });
    U.clear(main).appendChild(h('div', { class: 'stack' },
      h('div', { class: 'world-head' }, h('div', { class: 'w-art', html: MA.svg.world(w.id) }), h('div', { class: 'w-title' }, w.icon + ' ' + MA.tl(w.name)), h('div', { class: 'wh-voice' }, V.voiceBtn(say))),
      games.length ? h('div', { class: 'kid-card' }, h('h2', null, '🎮 ' + t('s_games')), h('div', { class: 'game-grid' }, games.map(function (a) { return gameTile(st, a); }))) : null,
      h('div', { class: 'kid-card' }, trail)));
    V.voice(say());
  } });
  function gameTile(st, a) {
    var locked = (a.minLevel || 1) > (st.level || 1), tile;
    var parts = [h('span', { class: 'gt-icon', 'aria-hidden': 'true' }, locked ? '🔒' : actIcon(a)), h('span', { class: 'gt-name' }, MA.tl(a.title))];
    tile = locked ? h('button', { class: 'game-tile locked', type: 'button', 'aria-label': MA.tl(a.title) + ' 🔒', onclick: function () { V.nudge(tile, 'v_locked'); } }, parts)
      : h('a', { class: 'game-tile', href: '#/s/play/' + a.id, 'aria-label': MA.tl(a.title) }, parts);
    return tile;
  }

  /* ------------------------------------------------------------------ the look pickers: skin, hair, hair color, eyes, shirt (all free) */
  function pickers(look, onPick) {
    var g = look.gender === 'f' ? 'f' : 'm';
    function row(icon, label, items) { return h('div', { class: 'lp-row', role: 'group', 'aria-label': label }, h('span', { class: 'lp-icon', 'aria-hidden': 'true' }, icon), h('div', { class: 'lp-items' }, items)); }
    function dot(key, color, label) {
      var on = look[key] === color, p = {}; p[key] = color;
      return h('button', { class: 'lp-dot' + (on ? ' on' : ''), type: 'button', style: { background: color }, 'aria-pressed': on ? 'true' : 'false', 'aria-label': label + ' ' + color, onclick: function () { MA.sfx.play('click'); onPick(p); } });
    }
    return h('div', { class: 'look-pickers' },
      row('🎨', t('look_skin'), AV.SKINS.map(function (c) { return dot('skin', c, t('look_skin')); })),
      row('💇', t('look_hair'), AV.BASE_HAIR[g].map(function (hs) {
        var l = U.copy(look), on = look.hair === hs; l.hair = hs; l.hat = null; l.glasses = null; l.top = { kind: 'tee', color: typeof look.top === 'string' ? look.top : AV.TEES[3] };
        return h('button', { class: 'lp-hair' + (on ? ' on' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false', 'aria-label': t('look_hair') + ' ' + hs, onclick: function () { MA.sfx.play('click'); onPick({ hair: hs }); }, html: AV.svg(l, { view: 'hairdo' }) });
      })),
      row('🖌️', t('look_hair_color'), AV.HAIR_COLORS.map(function (c) { return dot('hairColor', c, t('look_hair_color')); })),
      row('👀', t('look_eyes'), AV.EYES.map(function (c) { return dot('eyes', c, t('look_eyes')); })),
      row('👕', t('look_shirt'), AV.TEES.map(function (c) { return dot('top', c, t('look_shirt')); })));
  }
  /* what the pickers show for a player: their free look, with worn shop hair shown as it is */
  function freeLook(st) { var l = AV.look(st); l.top = st.avatar.top || AV.defaults(st.gender).top; return l; }
  /* a free pick also takes off the shop item that would hide it */
  function pickForPlayer(st, p) {
    var eq = st.equipped || (st.equipped = {});
    if (p.hair) eq.hair = null; if (p.hairColor) eq.hairColor = null; if (p.top) eq.top = null;
    S.updatePlayer(st.id, { avatar: Object.assign(U.copy(st.avatar), p) });
    Rt.render();
  }
  function genderTiles(onPick) {
    return h('div', { class: 'gender-picks' }, ['m', 'f'].map(function (g) {
      var look = { gender: g, skin: AV.SKINS[1], hair: AV.defaults(g).hair, hairColor: AV.HAIR_COLORS[2], eyes: AV.EYES[0], top: { kind: 'tee', color: AV.defaults(g).top } };
      return h('button', { class: 'gender-pick', type: 'button', 'aria-label': t(g === 'f' ? 'g_girl' : 'g_boy'), onclick: function () { MA.sfx.play('click'); onPick(g); } },
        h('span', { class: 'figure', html: AV.svg(look, { view: 'full' }) }), h('span', { class: 'gp-sign', 'aria-hidden': 'true' }, g === 'f' ? '👧' : '👦'));
    }));
  }

  /* ------------------------------------------------------------------ my look (also asks old players boy or girl, once) */
  Rt.add('/s/me', { title: 's_cat_me', render: function (main, p, q) {
    var st = me(), back = q.from === 'shop' ? '#/s/rewards?tab=me' : '#/s/home';
    if (!st.gender) {
      U.clear(main).appendChild(h('div', { class: 'stack center' }, h('h1', null, t('onb_who')), genderTiles(function (g) { S.updatePlayer(st.id, { gender: g }); Rt.render(); }), h('div', { class: 'row', style: { justifyContent: 'center' } }, V.voiceBtn(function () { return t('v_gender'); }))));
      V.voice(t('v_gender'));
      return;
    }
    var say = function () { return t('v_me'); };
    U.clear(main).appendChild(h('div', { class: 'stack me-page' },
      h('section', { class: 'shop-head' }, V.figure(st, { cls: 'me-figure' }), V.voiceBtn(say)),
      h('div', { class: 'kid-card' }, pickers(freeLook(st), function (pk) { pickForPlayer(st, pk); })),
      h('div', { class: 'row', style: { justifyContent: 'center' } }, h('a', { class: 'btn btn-success btn-round btn-go', href: back, 'aria-label': t('me_done') }, '✔'))));
    V.voice(say());
  } });

  /* ------------------------------------------------------------------ prize shop: picture tabs, each prize shown on the child */
  Rt.add('/s/rewards', { title: 's_shop', render: function (main, p, q) {
    var st = me(), tab = SHOP_TABS.some(function (c) { return c[0] === q.tab; }) ? q.tab : 'clothes', say = function () { return t(tab === 'me' ? 'v_me' : 'v_shop'); };
    var body = tab === 'me' ? h('div', { class: 'kid-card' }, pickers(freeLook(st), function (pk) { pickForPlayer(st, pk); }))
      : h('div', { class: 'shop-grid' }, Gm.shopFor(st, tab).map(function (it) { return shopTile(st, it); }));
    U.clear(main).appendChild(h('div', { class: 'stack' },
      h('section', { class: 'shop-head' }, V.figure(st, { cls: 'shop-figure' }), h('span', { class: 'pill coins big' }, '🪙 ' + U.num(st.coins)), V.voiceBtn(say)),
      h('div', { class: 'cat-tabs', role: 'tablist' }, SHOP_TABS.map(function (c) {
        return h('a', { class: 'cat-tab' + (tab === c[0] ? ' on' : ''), href: '#/s/rewards?tab=' + c[0], role: 'tab', 'aria-selected': tab === c[0] ? 'true' : 'false', 'aria-label': t('s_cat_' + c[0]) }, c[1]);
      })),
      body));
    V.voice(say());
  } });
  function itemPic(st, it, cls) {
    cls = 'si-icon' + (cls ? ' ' + cls : '');
    if (it.slot === 'toy' || it.slot === 'pet') return h('span', { class: cls + ' si-emoji', 'aria-hidden': 'true' }, it.icon);
    if (it.slot === 'bg') return h('span', { class: cls + ' si-swatch', style: { background: it.css }, 'aria-hidden': 'true' });
    if (it.slot === 'frame') return h('span', { class: cls + ' si-frame', 'aria-hidden': 'true' }, V.avatar(st, 'md', { frame: it, noPet: true }));
    var look = AV.look(st, it);
    if (it.slot === 'hair' || it.slot === 'hairColor') look.hat = null;
    return h('span', { class: cls + ' si-svg', html: AV.svg(look, { view: AV.viewFor(it) }), 'aria-hidden': 'true' });
  }
  function shopTile(st, it) {
    var owned = st.inventory.indexOf(it.id) >= 0, worn = Gm.wearing(st, it);
    var locked = !owned && (st.level || 1) < it.minLevel, poor = !owned && !locked && st.coins < it.price, tile;
    tile = h('button', { class: 'shop-item' + (owned ? ' owned' : '') + (worn ? ' equipped' : '') + (locked ? ' locked' : '') + (poor ? ' cant' : ''), type: 'button', title: MA.tl(it.name), 'data-id': it.id,
      'aria-label': MA.tl(it.name) + (locked ? ' 🔒' : owned ? '' : ' (' + U.num(it.price) + ' ' + t('coins') + ')'),
      onclick: function () {
        if (owned) { Gm.equip(st, it.id); MA.sfx.play('click'); Rt.render(); return; }
        if (locked) { V.nudge(tile, 'v_locked'); return; }
        if (poor) { V.nudge(tile, 'v_coins'); return; }
        buyConfirm(st, it);
      } },
    itemPic(st, it),
    h('span', { class: 'si-tag', 'aria-hidden': 'true' }, worn ? '✓' : owned ? '' : locked ? '🔒' : '🪙 ' + U.num(it.price)));
    return tile;
  }
  /* "are you sure", in pictures: the child wearing the prize, its price, ✕ and ✔ */
  function buyConfirm(st, it) {
    var preview = it.slot === 'bg' ? V.avatar(st, 'xl', { bg: it.css }) : it.slot === 'frame' ? V.avatar(st, 'xl', { frame: it }) : V.figure(st, { look: AV.look(st, it), cls: 'try-on' });
    var m = MA.modal({ title: MA.tl(it.name), body: h('div', { class: 'buy-box' }, preview,
      h('span', { class: 'pill coins big' }, '🪙 ' + U.num(it.price)),
      h('div', { class: 'row buy-btns' },
        h('button', { class: 'btn btn-soft btn-round', type: 'button', 'aria-label': t('cancel'), onclick: function () { m.close(); } }, '✕'),
        h('button', { class: 'btn btn-success btn-round btn-go', type: 'button', 'aria-label': t('s_buy'), onclick: function () {
          m.close();
          if (V.run(function () { return Gm.buy(st, it.id); })) { MA.sfx.play('coin'); MA.fx.confetti(40); }
          Rt.render();
        } }, '✔'))) });
    if (V.readAloudOn()) MA.speech.say(t('v_buy_q', { name: MA.tl(it.name), n: U.num(it.price) }));
  }

  /* ------------------------------------------------------------------ onboarding: a grown-up enters name and grade, the child picks boy or girl and a look */
  var onbDraft = {};
  function langSwitch(st) {
    return h('div', { class: 'seg', role: 'group', 'aria-label': t('language') }, [['he', '\u05e2\u05d1\u05e8\u05d9\u05ea'], ['en', 'English']].map(function (l) {
      return h('button', { class: st.lang === l[0] ? 'on' : '', 'aria-pressed': st.lang === l[0] ? 'true' : 'false', onclick: function () { S.updatePlayer(st.id, { lang: l[0] }); MA.i18n.setLang(l[0]); } }, l[1]);
    }));
  }
  Rt.add('/s/onboarding', { render: function (main) {
    var st = me(), d = onbDraft[st.id] = onbDraft[st.id] || { step: 1, name: st.name || '', grade: st.grade, gender: st.gender || null, look: null, spoke: {} };
    function render() {
      var body;
      if (d.step === 1) {
        var nameIn = h('input', { class: 'input', maxlength: 30, value: d.name, placeholder: t('onb_name_ph'), autocomplete: 'off', 'aria-label': t('onb_name'), oninput: function () { d.name = nameIn.value; } });
        body = h('div', { class: 'stack' },
          h('div', { class: 'row between' }, h('div', { html: MA.svg.mascot('wave', 84) }), langSwitch(st)),
          h('h1', null, t('onb_hi')),
          h('div', { class: 'notice' }, '👪 ' + t('onb_grownup')),
          h('div', { class: 'label' }, t('onb_name')), nameIn,
          h('div', { class: 'label mt' }, t('onb_grade')),
          h('div', { class: 'pick-grid' }, [1, 2, 3, 4, 5, 6].map(function (g) {
            return h('button', { class: 'pick' + (d.grade === g ? ' on' : ''), type: 'button', 'aria-pressed': d.grade === g ? 'true' : 'false', onclick: function () { d.grade = g; render(); } }, h('span', { class: 'pk-icon' }, GRADE_ICONS[g - 1]), h('span', { class: 'bold' }, V.gradeLabel(g)));
          })));
      } else if (d.step === 2) {
        body = h('div', { class: 'stack' },
          h('div', { class: 'row', style: { justifyContent: 'center' } }, h('h1', null, t('onb_who')), V.voiceBtn(function () { return t('v_gender'); })),
          genderTiles(function (g) {
            if (d.gender !== g) d.look = null;
            d.gender = g; d.step = 3;
            S.updatePlayer(st.id, { gender: g });
            render();
          }));
      } else {
        d.look = d.look || Object.assign(AV.defaults(d.gender), { color: st.avatar.color });
        var look = { gender: d.gender, skin: d.look.skin, hair: d.look.hair, hairColor: d.look.hairColor, eyes: d.look.eyes, top: { kind: 'tee', color: d.look.top } };
        body = h('div', { class: 'stack' },
          h('div', { class: 'row', style: { justifyContent: 'center' } }, h('h1', null, t('onb_look')), V.voiceBtn(function () { return t('v_look'); })),
          h('div', { class: 'center' }, h('span', { class: 'figure onb-figure', html: AV.svg(look, { view: 'full' }) })),
          pickers(Object.assign(U.copy(look), { top: d.look.top }), function (pk) { Object.assign(d.look, pk); render(); }));
      }
      var nav = h('div', { class: 'row mt onb-nav' },
        d.step > 1 ? h('button', { class: 'btn btn-soft btn-round', type: 'button', 'aria-label': t('back'), onclick: function () { d.step--; render(); } }, h('span', { class: 'flip-rtl' }, '⬅')) : null,
        d.step === 2 ? null : h('button', { class: 'btn btn-primary btn-round btn-go', type: 'button', 'aria-label': d.step === 3 ? t('onb_enter') : t('next'), onclick: next }, d.step === 3 ? '🚀' : h('span', { class: 'flip-rtl' }, '➜')));
      U.clear(main).appendChild(h('div', { class: 'onb kid-card' }, h('div', { class: 'onb-steps', 'aria-hidden': 'true' }, [1, 2, 3].map(function (k) { return h('i', { class: k <= d.step ? 'on' : '' }); })), body, nav));
      if (d.step >= 2 && !d.spoke[d.step] && V.readAloudOn()) { d.spoke[d.step] = true; MA.speech.say(t(d.step === 2 ? 'v_gender' : 'v_look')); }
    }
    function next() {
      if (d.step === 1) { d.step = 2; render(); return; }
      var patch = { grade: d.grade, gender: d.gender, avatar: d.look, onboarded: true };
      if (String(d.name || '').trim()) patch.name = d.name;
      if (!V.run(function () { return S.updatePlayer(st.id, patch); })) { d.step = 1; render(); return; }
      delete onbDraft[st.id];
      S.track('onboarding_completed', {});
      var first = C.gradeSkills(st.grade)[0];
      location.hash = first ? '#/s/play/pr-' + first.id + '?mode=onboarding' : '#/s/home';
    }
    render();
  } });

  /* ------------------------------------------------------------------ grown-ups: the weekly report and the settings (⚙️, behind the lock) */
  var OPTION_KEYS = ['readAloud', 'hints', 'largeText', 'highContrast', 'reducedMotion'];
  V.openSettings = function (tab) {
    var st = me(), m, checks = {}, view = h('div', { class: 'grown-view' }), reportFor = st, tabs;
    var name = h('input', { maxlength: 30, value: st.name || '', placeholder: t('onb_name_ph'), autocomplete: 'off' });
    var grade = V.select([1, 2, 3, 4, 5, 6].map(function (g) { return [g, V.gradeLabel(g)]; }), st.grade);
    var lang = V.select([['he', '\u05e2\u05d1\u05e8\u05d9\u05ea'], ['en', 'English']], st.lang);
    var gender = V.select([['m', '👦 ' + t('g_boy')], ['f', '👧 ' + t('g_girl')]], st.gender || 'm');
    var options = OPTION_KEYS.map(function (k) {
      var cb = h('input', { type: 'checkbox', checked: k === 'hints' ? st.settings[k] !== false : !!st.settings[k] });
      checks[k] = cb;
      return h('label', { class: 'check' }, cb, t('set_' + k));
    });
    var players = h('div', { class: 'list' }, S.players().map(function (p) {
      var cur = p.id === st.id;
      return h('div', { class: 'list-item' }, V.avatar(p, 'sm'), h('div', { class: 'li-main' }, h('div', { class: 'li-title' }, V.playerName(p)), h('div', { class: 'li-sub' }, V.gradeLabel(p.grade))),
        cur ? h('span', { class: 'badge b-good' }, t('set_playing_now')) : h('button', { class: 'btn btn-primary btn-sm', onclick: function () { m.close(); S.switchPlayer(p.id); Rt.go('#/s/home'); } }, '▶ ' + t('set_switch')),
        cur ? null : h('button', { class: 'btn btn-ghost btn-sm', title: t('delete'), 'aria-label': t('delete') + ' ' + V.playerName(p), onclick: function () { MA.confirm(t('set_delete_q', { name: V.playerName(p) }), { danger: true, ok: t('delete') }).then(function (y) { if (!y) return; S.deletePlayer(p.id); m.close(); V.openSettings('settings'); }); } }, '🗑️'));
    }));
    var err = h('div', { class: 'form-error', role: 'alert' });
    var form = h('div', { class: 'form' },
      h('div', { class: 'grid g2' }, V.field(t('set_name'), name), V.field(t('grade'), grade), V.field(t('language'), lang), V.field(t('set_gender'), gender)),
      h('div', { class: 'label mt' }, t('set_options')), h('div', { class: 'grid g2' }, options), err,
      h('div', { class: 'label mt' }, '👥 ' + t('set_players')), players,
      h('div', null, h('button', { class: 'btn btn-soft', onclick: function () { m.close(); S.createPlayer(); Rt.go('#/s/onboarding'); } }, '➕ ' + t('set_new_player'))),
      h('p', { class: 'small muted' }, '🔒 ' + t('local_note')));
    function show(which) {
      tabs.forEach(function (b) { var on = b.getAttribute('data-tab') === which; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      U.clear(view).appendChild(which === 'report' ? MA.report.view(reportFor, { players: S.players(), onPick: function (p) { reportFor = p; show('report'); } }) : form);
      m.el.classList.toggle('show-report', which === 'report');
    }
    tabs = [['report', '📊 ' + t('rp_tab')], ['settings', '⚙️ ' + t('set_tab')]].map(function (x) { return h('button', { type: 'button', role: 'tab', 'data-tab': x[0], onclick: function () { show(x[0]); } }, x[1]); });
    var body = h('div', { class: 'stack' }, h('div', { class: 'seg grown-tabs', role: 'tablist' }, tabs), view);
    m = MA.modal({ title: t('settings'), icon: '⚙️', wide: true, body: body, actions: [{ label: t('cancel'), cls: 'btn-ghost' }, { label: t('save'), cls: 'btn-primary', close: false, onClick: function (close) {
      err.textContent = '';
      var settings = {}; OPTION_KEYS.forEach(function (k) { settings[k] = checks[k].checked; });
      try { S.updatePlayer(st.id, { name: name.value, grade: grade.value, lang: lang.value, gender: gender.value, settings: settings }); } catch (x) { err.textContent = V.errorMsg(x); return false; }
      close();
      if (MA.i18n.lang !== lang.value) MA.i18n.setLang(lang.value); else Rt.render();
      return false;
    } }] });
    show(tab || 'report');
  };

  /* ------------------------------------------------------------------ play */
  Rt.add('/s/play/:id', { render: function (main, p, q) {
    var st = me(), act = C.activity(p.id);
    if (!act || (act.status !== 'published' && act.status !== 'testing')) { location.replace('#/s/home'); return; }
    var mode = q.mode || (act.gameType === 'detective' ? 'detective' : act.gameType === 'timed' ? 'timed' : 'practice');
    if (['practice', 'assess', 'timed', 'detective', 'onboarding'].indexOf(mode) < 0) mode = 'practice';
    if ((act.minLevel || 1) > (st.level || 1) && mode !== 'onboarding') { location.replace('#/s/home'); return; }
    if (mode === 'timed' && q.skill && C.skill(q.skill)) { act = U.copy(act); act.skillId = q.skill; }
    MA.player.open(main, { activity: act, mode: mode, resume: q.resume === '1', skillId: q.skill || act.skillId, back: mode === 'onboarding' ? '#/s/home' : null });
  } });
})(window.MA = window.MA || {});
