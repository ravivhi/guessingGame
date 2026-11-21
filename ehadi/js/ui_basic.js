/* Renderers part 1: registry, drag-and-drop helper, choice, input (numpad), compare, order, sort, match, memory.
   Every interaction works with touch, mouse and keyboard (tap-to-select then tap-to-place as the drag alternative). */
(function (MA) {
  'use strict';
  var U = MA.u, h = U.h, t = function (k, p) { return MA.t(k, p); };
  var R = MA.ui = { reg: {} };
  R.register = function (name, fn) { R.reg[name] = fn; };
  R.mount = function (el, q, api) {
    var fn = R.reg[q.ui];
    if (!fn) throw new Error('No renderer for ' + q.ui);
    return fn(el, q, api) || {};
  };
  R.content = function (o, cls) {
    var span = h('span', { class: cls || '' });
    if (o.html) span.innerHTML = o.html; else span.textContent = o.label != null ? String(o.label) : '';
    return span;
  };
  R.aria = function (o) { return o.aria || o.label || ''; };

  /* drag helper: pointer drag with ghost; onDrop(target) or onTap() for click/keyboard */
  R.draggable = function (el, opts) {
    var justDragged = false;
    el.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || el.disabled) return;
      var sx = e.clientX, sy = e.clientY, dragging = false, ghost = null, over = null;
      function move(ev) {
        if (!dragging && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 10) {
          dragging = true; ghost = el.cloneNode(true); ghost.classList.add('dragging'); ghost.classList.remove('sel');
          var r = el.getBoundingClientRect(); ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px';
          document.body.appendChild(ghost); el.classList.add('ghost');
        }
        if (dragging) {
          ghost.style.left = (ev.clientX - ghost.offsetWidth / 2) + 'px'; ghost.style.top = (ev.clientY - ghost.offsetHeight / 2) + 'px';
          var tg = hit(ev.clientX, ev.clientY, opts.targets());
          if (tg !== over) { if (over) over.classList.remove('over'); over = tg; if (over) over.classList.add('over'); }
          ev.preventDefault();
        }
      }
      function up(ev) {
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        if (over) over.classList.remove('over');
        if (dragging) {
          ghost.remove(); el.classList.remove('ghost'); justDragged = true; setTimeout(function () { justDragged = false; }, 50);
          var tg = ev.type === 'pointercancel' ? null : hit(ev.clientX, ev.clientY, opts.targets());
          if (tg) opts.onDrop(tg);
        }
      }
      window.addEventListener('pointermove', move, { passive: false }); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    });
    el.addEventListener('click', function (e) { if (justDragged) { e.preventDefault(); return; } if (opts.onTap) opts.onTap(e); });
  };
  function hit(x, y, targets) {
    for (var i = 0; i < targets.length; i++) { var r = targets[i].getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return targets[i]; }
    return null;
  }

  /* ------------------------------------------------------------------ choice */
  R.register('choice', function (el, q, api) {
    var d = q.data, sel = d.multi ? {} : null, locked = false, btns = [];
    var grid = h('div', { class: 'opts ' + (d.layout === 'col' ? 'col' : d.layout === 'two' ? 'two' : ''), role: d.multi ? 'group' : 'radiogroup' });
    d.options.forEach(function (o, i) {
      var b = h('button', { class: 'opt' + (o.html ? ' vis' : '') + ((o.label || '').length > 14 ? ' txt' : ''), type: 'button', role: d.multi ? 'checkbox' : 'radio', 'aria-checked': 'false', 'aria-label': R.aria(o) || null },
        R.content(o));
      b.addEventListener('click', function () {
        if (locked || b.disabled) return;
        MA.sfx.play('click');
        if (d.multi) { var k = JSON.stringify(o.v); if (sel[k]) delete sel[k]; else sel[k] = o.v; b.classList.toggle('sel', !!sel[k]); b.setAttribute('aria-checked', sel[k] ? 'true' : 'false'); api.setReady(Object.keys(sel).length > 0); }
        else { sel = o; btns.forEach(function (x) { x.classList.remove('sel'); x.setAttribute('aria-checked', 'false'); }); b.classList.add('sel'); b.setAttribute('aria-checked', 'true'); api.setReady(true); api.submit(); }
      });
      b._o = o; btns.push(b); grid.appendChild(b);
    });
    el.appendChild(grid);
    api.setReady(false);
    return {
      value: function () { if (d.multi) { var v = Object.keys(sel).map(function (k) { return sel[k]; }); return v.length ? v.sort() : null; } return sel ? sel.v : null; },
      lock: function () { locked = true; btns.forEach(function (b) { b.disabled = true; }); },
      onWrong: function () {
        if (d.multi) { btns.forEach(function (b) { b.classList.remove('sel'); b.setAttribute('aria-checked', 'false'); }); sel = {}; api.setReady(false); MA.fx.anim(grid, 'wiggle'); return; }
        btns.forEach(function (b) { if (b._o === sel) { b.classList.remove('sel'); b.classList.add('wrong'); b.disabled = true; } });
        sel = null; api.setReady(false);
      },
      showAnswer: function () { btns.forEach(function (b) { if (MA.gen.check(q, d.multi ? [b._o.v] : b._o.v) || (d.multi && (q.answer || []).some(function (a) { return U.eq(a, b._o.v); }))) b.classList.add('right'); }); },
      markRight: function () { btns.forEach(function (b) { if (b.classList.contains('sel')) { b.classList.add('right'); MA.fx.anim(b, 'pop'); } }); },
      focus: function () { if (btns[0]) btns[0].focus(); }
    };
  });

  /* ------------------------------------------------------------------ input with on-screen keypad */
  function parseNum(s, dec) {
    s = String(s == null ? '' : s).trim().replace(/[\u2066\u2069\s]/g, '').replace(/,/g, dec ? '.' : '');
    if (!s) return null;
    if (dec ? !/^-?\d*\.?\d+$/.test(s) : !/^-?\d+$/.test(s)) return null;
    return dec ? parseFloat(s) : parseInt(s, 10);
  }
  R.parseNum = parseNum;
  R.register('input', function (el, q, api) {
    var d = q.data || {}, kind = d.kind || 'int', fields = [], locked = false, last = null;
    function mkInput(cls, label) {
      var inp = h('input', { class: 'ans-input' + (cls ? ' ' + cls : ''), type: 'text', inputmode: kind === 'dec' ? 'decimal' : 'numeric', autocomplete: 'off', 'aria-label': label || t('q_type'), maxlength: kind === 'time' ? 2 : 9, spellcheck: 'false' });
      inp.addEventListener('input', function () { inp.value = inp.value.replace(kind === 'dec' ? /[^0-9.,]/g : /[^0-9]/g, ''); refresh(); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (ready()) api.submit(); } });
      inp.addEventListener('focus', function () { last = inp; });
      fields.push(inp);
      return inp;
    }
    function fracBox(nInp, dInp, nStatic, dStatic) {
      return h('span', { class: 'frac-blank frac math' }, h('span', null, nInp || String(nStatic)), h('span', null, dInp || String(dStatic)));
    }
    function staticFrac(n, dd) { var s = h('span', { html: MA.svg.fracHTML(n, dd) }); return s; }
    var main = null, slots = {};
    function blankFor(tok) {
      if (tok.blank) { main = mkInput(); return main; }
      if (tok.blankFrac) { slots.n = mkInput('sm', t('q_numerator')); slots.d = mkInput('sm', t('q_denominator')); return fracBox(slots.n, slots.d); }
      if (tok.blankMixed) { slots.w = mkInput('sm', t('q_whole')); slots.n = mkInput('sm', t('q_numerator')); slots.d = mkInput('sm', t('q_denominator')); return h('span', { class: 'mixed math' }, slots.w, fracBox(slots.n, slots.d)); }
      return null;
    }
    var row;
    if (d.eq && d.eq.length) {
      row = h('div', { class: 'eq math' });
      d.eq.forEach(function (tok) {
        if (typeof tok === 'string') { row.appendChild(h('span', null, tok)); return; }
        if (tok.frac) {
          if (tok.frac[0] == null) { main = mkInput('sm', t('q_numerator')); row.appendChild(fracBox(main, null, null, tok.frac[1])); }
          else if (tok.frac[1] == null) { main = mkInput('sm', t('q_denominator')); row.appendChild(fracBox(null, main, tok.frac[0], null)); }
          else row.appendChild(staticFrac(tok.frac[0], tok.frac[1]));
          return;
        }
        if (tok.mixed) { row.appendChild(h('span', { class: 'mixed math' }, h('b', { style: { fontSize: '1.1em' } }, String(tok.mixed[0])), staticFrac(tok.mixed[1], tok.mixed[2]))); return; }
        var b = blankFor(tok); if (b) row.appendChild(b);
      });
    }
    if (!fields.length) {
      row = h('div', { class: 'input-row' });
      if (kind === 'frac') row.appendChild(blankFor({ blankFrac: true }));
      else if (kind === 'mixed') row.appendChild(blankFor({ blankMixed: true }));
      else if (kind === 'time') { slots.h = mkInput('sm', t('q_hours')); slots.m = mkInput('sm', t('q_minutes')); row.appendChild(h('span', { class: 'eq math' }, slots.h, h('b', null, ':'), slots.m)); }
      else { if (d.prefix) row.appendChild(h('span', { class: 'unit-label' }, d.prefix)); main = mkInput(); row.appendChild(main); }
    }
    if (d.unit) row.appendChild(h('span', { class: 'unit-label' }, d.unit));
    el.appendChild(row);
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', kind === 'dec' ? '.' : '⌫', '0', kind === 'dec' ? '⌫' : '→'];
    var pad = h('div', { class: 'numpad', 'aria-hidden': 'false' }, keys.map(function (k) {
      return h('button', { type: 'button', class: k === '⌫' || k === '→' ? 'fn' : '', 'aria-label': k === '⌫' ? t('q_backspace') : k === '→' ? t('q_next_box') : k, onclick: function () {
        if (locked) return;
        var f = last && fields.indexOf(last) >= 0 ? last : fields[0];
        if (k === '⌫') f.value = f.value.slice(0, -1);
        else if (k === '→') { var i = fields.indexOf(f); last = fields[(i + 1) % fields.length]; last.focus(); return; }
        else if (f.value.length < (kind === 'time' ? 2 : 9)) f.value += k;
        MA.sfx.play('click'); refresh();
      } }, k);
    }));
    el.appendChild(pad);
    function ready() { return fields.every(function (f) { return f.value.trim() !== ''; }); }
    function refresh() { api.setReady(ready()); }
    function value() {
      if (!ready()) return null;
      if (slots.n && slots.d) {
        var n = parseNum(slots.n.value), dd = parseNum(slots.d.value);
        if (n == null || dd == null || dd === 0) return null;
        if (slots.w) { var w = parseNum(slots.w.value); if (w == null) return null; return { w: w, n: n, d: dd }; }
        return { n: n, d: dd };
      }
      if (slots.h) { var hh = parseNum(slots.h.value), mm = parseNum(slots.m.value); if (hh == null || mm == null || mm > 59) return null; return { h: hh, m: mm }; }
      return parseNum(main.value, kind === 'dec');
    }
    last = fields[0];
    api.setReady(false);
    return {
      value: value,
      lock: function () { locked = true; fields.forEach(function (f) { f.readOnly = true; }); U.$$('button', pad).forEach(function (b) { b.disabled = true; }); },
      onWrong: function () { MA.fx.anim(row, 'wiggle'); setTimeout(function () { if (fields[0]) { fields[0].focus(); fields[0].select(); } }, 60); },
      showAnswer: function () {
        var a = q.answer;
        if (a && typeof a === 'object') { if (slots.w) slots.w.value = a.w; if (slots.n) slots.n.value = a.n; if (slots.d) slots.d.value = a.d; if (slots.h) { slots.h.value = a.h; slots.m.value = (a.m < 10 ? '0' : '') + a.m; } }
        else if (main) main.value = String(a);
        fields.forEach(function (f) { f.style.borderColor = 'var(--c-mint)'; });
      },
      focus: function () { if (fields[0] && !('ontouchstart' in window)) fields[0].focus(); }
    };
  });

  /* ------------------------------------------------------------------ compare (<, =, >) */
  R.register('compare', function (el, q, api) {
    var d = q.data, chosen = null, locked = false, btns = {};
    var side = function (txt, html) { var s = h('div', { class: 'cmp-side math' }); if (html) s.innerHTML = html; else s.textContent = txt; return s; };
    var slot = h('div', { class: 'cmp-slot', 'aria-live': 'polite' }, '?');
    el.appendChild(h('div', { class: 'compare-wrap' }, side(d.left, d.leftHtml), slot, side(d.right, d.rightHtml)));
    var row = h('div', { class: 'cmp-btns' });
    ['<', '=', '>'].forEach(function (s) {
      var b = h('button', { class: 'opt', type: 'button', 'aria-label': s === '<' ? t('sign_less') : s === '>' ? t('sign_greater') : t('sign_equal') }, s);
      b.addEventListener('click', function () { if (locked || b.disabled) return; chosen = s; slot.textContent = s; MA.sfx.play('click'); api.setReady(true); api.submit(); });
      btns[s] = b; row.appendChild(b);
    });
    el.appendChild(row);
    api.setReady(false);
    return {
      value: function () { return chosen; },
      lock: function () { locked = true; Object.keys(btns).forEach(function (k) { btns[k].disabled = true; }); },
      onWrong: function () { if (btns[chosen]) { btns[chosen].classList.add('wrong'); btns[chosen].disabled = true; } chosen = null; slot.textContent = '?'; api.setReady(false); },
      showAnswer: function () { slot.textContent = q.answer; if (btns[q.answer]) btns[q.answer].classList.add('right'); },
      markRight: function () { slot.style.borderColor = 'var(--c-mint)'; MA.fx.anim(slot, 'pop'); }
    };
  });

  /* ------------------------------------------------------------------ order */
  R.register('order', function (el, q, api) {
    var d = q.data, n = d.items.length, placed = new Array(n), locked = false, chips = {};
    var slotsRow = h('div', { class: 'slots' }), pool = h('div', { class: 'dnd-pool', role: 'list' });
    var slots = [];
    for (var i = 0; i < n; i++) {
      var s = h('div', { class: 'slot', 'aria-label': t('q_slot_n', { n: i + 1 }), role: 'listitem' });
      slots.push(s); slotsRow.appendChild(s);
    }
    var selected = null;
    function chip(it) {
      var c = h('button', { class: 'chip-item', type: 'button', 'aria-label': R.aria(it) }, R.content(it));
      c._it = it; chips[JSON.stringify(it.v)] = c;
      R.draggable(c, {
        targets: function () { return slots; },
        onDrop: function (tg) { if (!locked) place(c, slots.indexOf(tg)); },
        onTap: function () {
          if (locked) return;
          var where = placed.indexOf(c);
          if (where >= 0) { unplace(where); return; }
          var free = placed.findIndex(function (x) { return !x; });
          if (free >= 0) place(c, free);
        }
      });
      return c;
    }
    function place(c, i) {
      var old = placed.indexOf(c); if (old >= 0) placed[old] = null;
      if (placed[i]) pool.appendChild(placed[i]);
      placed[i] = c; U.clear(slots[i]).appendChild(c); c.classList.remove('sel'); selected = null;
      slots.forEach(function (s, k) { if (!placed[k]) U.clear(s); });
      MA.sfx.play('click'); refresh();
    }
    function unplace(i) { var c = placed[i]; placed[i] = null; pool.appendChild(c); U.clear(slots[i]); refresh(); }
    function refresh() { api.setReady(placed.every(Boolean)); }
    d.items.forEach(function (it) { pool.appendChild(chip(it)); });
    el.appendChild(h('div', { class: 'order-wrap' }, h('div', { class: 'order-hint' }, h('span', null, d.startLabel || ''), h('span', { class: 'flip-rtl' }, '→'), h('span', null, d.endLabel || '')), slotsRow, pool));
    api.setReady(false);
    return {
      value: function () { return placed.every(Boolean) ? placed.map(function (c) { return c._it.v; }) : null; },
      lock: function () { locked = true; },
      onWrong: function () {
        placed.forEach(function (c, i) { if (c && !U.eq(c._it.v, q.answer[i])) { placed[i] = null; pool.appendChild(c); U.clear(slots[i]); MA.fx.anim(c, 'wiggle'); } });
        refresh();
      },
      showAnswer: function () { q.answer.forEach(function (v, i) { var c = chips[JSON.stringify(v)]; if (c) { placed[i] = c; U.clear(slots[i]).appendChild(c); } }); }
    };
  });

  /* ------------------------------------------------------------------ sort into bins */
  R.register('sort', function (el, q, api) {
    var d = q.data, where = {}, locked = false, selected = null, chips = {}, binEls = {};
    var pool = h('div', { class: 'dnd-pool' });
    var bins = h('div', { class: 'bins' });
    d.bins.forEach(function (b) {
      var body = h('div', { class: 'bin-body' });
      var head = h('div', { class: 'bin-head' }); if (b.html) head.appendChild(h('span', { html: b.html })); head.appendChild(document.createTextNode(' ' + b.label));
      var be = h('div', { class: 'bin', role: 'button', tabindex: '0', 'aria-label': b.label }, head, body);
      be._id = b.id; be._body = body; binEls[b.id] = be;
      function act() { if (locked || !selected) return; move(selected, b.id); }
      be.addEventListener('click', act);
      be.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      bins.appendChild(be);
    });
    function move(c, binId) {
      where[c._id] = binId; binEls[binId]._body.appendChild(c); c.classList.remove('sel'); selected = null; MA.sfx.play('click'); refresh();
    }
    d.items.forEach(function (it) {
      var c = h('button', { class: 'chip-item', type: 'button', 'aria-label': R.aria(it) }, R.content(it));
      c._id = it.id; chips[it.id] = c;
      R.draggable(c, {
        targets: function () { return Object.keys(binEls).map(function (k) { return binEls[k]; }); },
        onDrop: function (tg) { if (!locked) move(c, tg._id); },
        onTap: function (e) {
          if (locked) return;
          e.stopPropagation();
          if (where[c._id]) { delete where[c._id]; pool.appendChild(c); refresh(); return; }
          if (selected) selected.classList.remove('sel');
          selected = selected === c ? null : c; if (selected) c.classList.add('sel');
        }
      });
      pool.appendChild(c);
    });
    function refresh() { api.setReady(Object.keys(where).length === d.items.length); }
    el.appendChild(pool); el.appendChild(h('div', { class: 'small muted center' }, t('q_sort_tip'))); el.appendChild(bins);
    api.setReady(false);
    return {
      value: function () { if (Object.keys(where).length !== d.items.length) return null; var o = {}; for (var k in where) o[k] = where[k]; return o; },
      lock: function () { locked = true; },
      onWrong: function () { Object.keys(where).forEach(function (id) { if (q.answer[id] !== where[id]) { delete where[id]; pool.appendChild(chips[id]); MA.fx.anim(chips[id], 'wiggle'); } }); refresh(); },
      showAnswer: function () { Object.keys(q.answer).forEach(function (id) { binEls[q.answer[id]]._body.appendChild(chips[id]); }); }
    };
  });

  /* ------------------------------------------------------------------ match pairs */
  R.register('match', function (el, q, api) {
    var d = q.data, pairs = {}, locked = false, selL = null, lEls = {}, rEls = {}, colorOf = {};
    var COLORS = ['#6C4CF1', '#2BC79A', '#FF9F43', '#3BB7F0', '#FF7A7A', '#A855F7'];
    var left = h('div', { class: 'match-col' }), right = h('div', { class: 'match-col' });
    var rights = MA.u.shuffle(d.pairs.map(function (p) { return { id: p.id, o: p.right }; }));
    d.pairs.forEach(function (p, i) {
      var b = h('button', { class: 'match-item', type: 'button', 'aria-label': R.aria(p.left) }, R.content(p.left));
      b.addEventListener('click', function () { if (locked) return; if (pairs[p.id]) { unpair(p.id); } selL = p.id; Object.keys(lEls).forEach(function (k) { lEls[k].classList.toggle('sel', k === p.id); }); });
      lEls[p.id] = b; colorOf[p.id] = COLORS[i % COLORS.length]; left.appendChild(b);
    });
    rights.forEach(function (r) {
      var b = h('button', { class: 'match-item', type: 'button', 'aria-label': R.aria(r.o) }, R.content(r.o));
      b.addEventListener('click', function () {
        if (locked) return;
        var owner = Object.keys(pairs).filter(function (k) { return pairs[k] === r.id; })[0];
        if (owner) { unpair(owner); if (!selL) return; }
        if (!selL) return;
        pairs[selL] = r.id; paint(selL); lEls[selL].classList.remove('sel'); selL = null; MA.sfx.play('click'); api.setReady(Object.keys(pairs).length === d.pairs.length);
      });
      rEls[r.id] = b; right.appendChild(b);
    });
    function paint(lid) { var c = colorOf[lid]; [lEls[lid], rEls[pairs[lid]]].forEach(function (x) { x.classList.add('paired'); x.style.borderColor = c; x.style.boxShadow = '0 4px 0 ' + c; }); }
    function unpair(lid) { var r = pairs[lid]; delete pairs[lid]; [lEls[lid], rEls[r]].forEach(function (x) { if (x) { x.classList.remove('paired'); x.style.borderColor = ''; x.style.boxShadow = ''; } }); api.setReady(false); }
    el.appendChild(h('div', { class: 'match-wrap' }, left, right));
    el.appendChild(h('div', { class: 'small muted center' }, t('q_match_tip')));
    api.setReady(false);
    return {
      value: function () { return Object.keys(pairs).length === d.pairs.length ? JSON.parse(JSON.stringify(pairs)) : null; },
      lock: function () { locked = true; },
      onWrong: function () { Object.keys(pairs).forEach(function (k) { if (pairs[k] !== q.answer[k]) { MA.fx.anim(lEls[k], 'wiggle'); unpair(k); } }); },
      showAnswer: function () { Object.keys(pairs).forEach(unpair); Object.keys(q.answer).forEach(function (k) { pairs[k] = q.answer[k]; paint(k); }); }
    };
  });

  /* ------------------------------------------------------------------ memory game */
  R.register('memory', function (el, q, api) {
    var d = q.data, cards = [], open = [], found = 0, mistakes = 0, busy = false, locked = false;
    d.pairs.forEach(function (p) { cards.push({ pid: p.id, o: p.a }); cards.push({ pid: p.id, o: p.b }); });
    cards = MA.u.shuffle(cards);
    var grid = h('div', { class: 'mem-grid' });
    cards.forEach(function (c, i) {
      var b = h('button', { class: 'mem-card', type: 'button', 'aria-label': t('q_card_n', { n: i + 1 }) }, '?');
      b.addEventListener('click', function () {
        if (locked || busy || c.found || open.indexOf(c) >= 0) return;
        U.clear(b).appendChild(R.content(c.o)); b.classList.add('up'); b.setAttribute('aria-label', R.aria(c.o)); open.push(c); MA.sfx.play('click');
        if (open.length === 2) {
          busy = true;
          var a = open[0], z = open[1];
          if (a.pid === z.pid) {
            setTimeout(function () { [a, z].forEach(function (x) { x.found = true; x.el.classList.add('found'); }); open = []; busy = false; found++; MA.sfx.play('coin'); if (found === d.pairs.length) { api.meta({ mistakes: mistakes, maxMistakes: d.pairs.length + 1 }); api.setReady(true); api.submit(); } }, 350);
          } else {
            mistakes++;
            setTimeout(function () { [a, z].forEach(function (x) { x.el.classList.remove('up'); U.clear(x.el).appendChild(document.createTextNode('?')); x.el.setAttribute('aria-label', t('q_card')); }); open = []; busy = false; }, 900);
          }
        }
      });
      c.el = b; grid.appendChild(b);
    });
    el.appendChild(grid);
    api.setReady(false);
    return { value: function () { return found === d.pairs.length ? 'done' : null; }, lock: function () { locked = true; } };
  });

  MA.i18n.add({
    en: { q_numerator: 'numerator', q_denominator: 'denominator', q_whole: 'whole number', q_hours: 'hours', q_minutes: 'minutes', q_backspace: 'Delete', q_next_box: 'Next box',
      sign_less: 'less than', sign_greater: 'greater than', sign_equal: 'equal to', q_slot_n: 'Place {n}', q_sort_tip: 'Drag each picture into a group, or tap a picture and then tap a group.',
      q_match_tip: 'Tap an item on one side, then its partner on the other side.', q_card_n: 'Card {n}', q_card: 'Card' },
    he: { q_numerator: 'מונה', q_denominator: 'מכנה', q_whole: 'שלמים', q_hours: 'שעות', q_minutes: 'דקות', q_backspace: 'מחיקה', q_next_box: 'לתיבה הבאה',
      sign_less: 'קטן מ', sign_greater: 'גדול מ', sign_equal: 'שווה ל', q_slot_n: 'מקום {n}', q_sort_tip: 'גררו כל תמונה לקבוצה, או געו בתמונה ואז בקבוצה.',
      q_match_tip: 'געו בפריט בצד אחד, ואז בבן הזוג שלו בצד השני.', q_card_n: 'קלף {n}', q_card: 'קלף' }
  });
})(window.MA = window.MA || {});
