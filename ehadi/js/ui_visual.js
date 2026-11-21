/* Renderers part 2: manipulatives. numberline, count, group, array, fraction, placevalue, column, clock, money, grid, bargraph */
(function (MA) {
  'use strict';
  var U = MA.u, h = U.h, R = MA.ui, S = MA.svg, t = function (k, p) { return MA.t(k, p); };
  function svgPoint(svg, e) { var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return { x: (e.clientX - r.left) * vb.width / r.width, y: (e.clientY - r.top) * vb.height / r.height }; }
  function fracLabel(v, den) { var n = Math.round(v * den); if (n % den === 0) return String(n / den); var w = Math.floor(n / den), r = n % den; return (w ? w + ' ' : '') + r + '/' + den; }
  function stepBtn(label, aria, fn) { return h('button', { class: 'btn btn-soft btn-icon', type: 'button', 'aria-label': aria, onclick: fn }, label); }

  /* ------------------------------------------------------------------ number line */
  R.register('numberline', function (el, q, api) {
    var d = q.data, min = d.min, max = d.max, step = d.step, W = 700, pad = 36, y = 92, H = 140, locked = false, moved = false;
    var n = Math.round((max - min) / step), val = d.start != null ? d.start : min;
    var X = function (v) { return pad + (v - min) / (max - min) * (W - 2 * pad); };
    var fmt = function (v) { return d.den ? fracLabel(v, d.den) : d.decimals ? v.toFixed(d.decimals) : U.num(Math.round(v)); };
    var g = '<path d="M' + (pad - 16) + ' ' + y + ' H' + (W - pad + 16) + '" stroke="#23233A" stroke-width="3.5" stroke-linecap="round"/>';
    for (var i = 0; i <= n; i++) {
      var v = min + i * step, major = i % (d.labelEvery || 1) === 0, x = X(v);
      g += '<path d="M' + x.toFixed(1) + ' ' + (y - (major ? 13 : 8)) + ' V' + (y + (major ? 13 : 8)) + '" stroke="#23233A" stroke-width="' + (major ? 2.6 : 1.6) + '"/>';
      if (major || d.fracLabels) g += S.text(x, y + 30, d.fracLabels && d.den ? fracLabel(v, d.den) : fmt(v), { size: d.fracLabels ? 13 : 16, weight: 700 });
    }
    g += '<path class="hop" d="" stroke="#6C4CF1" stroke-width="3.5" fill="none" stroke-dasharray="7 5"/><text class="hop-label" x="0" y="0" text-anchor="middle" font-size="16" font-weight="800" fill="#5835DF"></text>';
    if (d.from != null) g += '<circle cx="' + X(d.from).toFixed(1) + '" cy="' + y + '" r="7" fill="#FFC93C" stroke="#23233A" stroke-width="2"/>';
    g += '<g class="marker" style="cursor:grab"><circle cx="0" cy="' + y + '" r="15" fill="#FF7A7A" stroke="#fff" stroke-width="4"/><path d="M-9 ' + (y - 24) + ' L9 ' + (y - 24) + ' L0 ' + (y - 13) + 'Z" fill="#FF7A7A"/></g>';
    var wrapEl = h('div', { class: 'nl-wrap', html: S.wrap(W, H, g, { width: '100%', label: t('q_numberline') }) });
    var svg = wrapEl.querySelector('svg'); svg.setAttribute('tabindex', '0'); svg.style.touchAction = 'none';
    var marker = svg.querySelector('.marker'), hop = svg.querySelector('.hop'), hopL = svg.querySelector('.hop-label');
    var valEl = h('div', { class: 'nl-val math', 'aria-live': 'polite' });
    function snap(v) { var k = Math.round((v - min) / step); return Math.round((min + U.clamp(k, 0, n) * step) * 1e6) / 1e6; }
    function render() {
      marker.setAttribute('transform', 'translate(' + X(val).toFixed(1) + ' 0)');
      if (d.from != null && Math.abs(val - d.from) > 1e-9) {
        var x0 = X(d.from), x1 = X(val), mid = (x0 + x1) / 2, top = y - 34 - Math.min(26, Math.abs(x1 - x0) * .15), diff = Math.round((val - d.from) / step);
        hop.setAttribute('d', 'M' + x0.toFixed(1) + ' ' + (y - 8) + ' Q' + mid.toFixed(1) + ' ' + top.toFixed(1) + ' ' + x1.toFixed(1) + ' ' + (y - 8));
        hopL.setAttribute('x', mid.toFixed(1)); hopL.setAttribute('y', (top - 4).toFixed(1)); hopL.textContent = (diff > 0 ? '+' : '−') + Math.abs(diff);
      } else { hop.setAttribute('d', ''); hopL.textContent = ''; }
      valEl.textContent = d.den || d.decimals ? '' : fmt(val);
    }
    function set(v) { if (locked) return; var nv = snap(v); if (nv !== val) { val = nv; moved = true; MA.sfx.play('click'); render(); api.setReady(true); } }
    svg.addEventListener('pointerdown', function (e) {
      if (locked) return; e.preventDefault(); svg.setPointerCapture(e.pointerId);
      var pt = svgPoint(svg, e); set(min + (pt.x - pad) / (W - 2 * pad) * (max - min));
      function mv(ev) { var p2 = svgPoint(svg, ev); set(min + (p2.x - pad) / (W - 2 * pad) * (max - min)); }
      function up() { svg.removeEventListener('pointermove', mv); svg.removeEventListener('pointerup', up); svg.removeEventListener('pointercancel', up); }
      svg.addEventListener('pointermove', mv); svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    });
    svg.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(val + step); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(val - step); } else if (e.key === 'Enter' && moved) api.submit(); });
    el.appendChild(wrapEl);
    el.appendChild(h('div', { class: 'nl-ctrl' }, stepBtn('◀', t('q_move_left'), function () { set(val - step); }), valEl, stepBtn('▶', t('q_move_right'), function () { set(val + step); })));
    el.appendChild(h('div', { class: 'small muted center' }, t('q_nl_tip')));
    render(); api.setReady(false);
    return {
      value: function () { return moved ? val : null; },
      lock: function () { locked = true; },
      onWrong: function () { MA.fx.anim(wrapEl, 'wiggle'); },
      showAnswer: function () { locked = false; val = snap(q.answer); render(); locked = true; marker.querySelector('circle').setAttribute('fill', '#2BC79A'); },
      focus: function () { svg.focus({ preventScroll: true }); }
    };
  });

  /* ------------------------------------------------------------------ counting objects */
  R.register('count', function (el, q, api) {
    var d = q.data, tapped = 0, area = h('div', { class: 'count-area', role: 'group', 'aria-label': t('q_count_area') });
    function obj(e, crossed) {
      var b = h('button', { class: 'count-obj', type: 'button', 'aria-label': e, style: crossed ? { opacity: .35 } : null }, e);
      if (crossed) { b.disabled = true; b.appendChild(h('span', { style: { position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#E53935', fontSize: '.8em' }, 'aria-hidden': 'true' }, '✖')); }
      else b.addEventListener('click', function () { if (b.classList.contains('tapped')) { b.classList.remove('tapped'); tapped--; renumber(); } else { tapped++; b.dataset.n = tapped; b.classList.add('tapped'); MA.sfx.play('click'); } });
      return b;
    }
    function renumber() { var k = 0; U.$$('.count-obj.tapped', area).forEach(function (b) { b.dataset.n = ++k; }); tapped = k; }
    if (d.arrange === 'groups') {
      area.style.alignItems = 'center';
      d.groups.forEach(function (g, gi) {
        if (gi) area.appendChild(h('span', { style: { fontSize: '2rem', fontWeight: 800, color: '#6C4CF1' } }, '+'));
        var box = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '230px', justifyContent: 'center', padding: '8px', borderRadius: '18px', background: gi ? '#E3F5FD' : '#FFF6DA' } });
        for (var i = 0; i < g.n; i++) box.appendChild(obj(g.emoji, false));
        area.appendChild(box);
      });
    } else {
      var items = [];
      d.groups.forEach(function (g) { for (var i = 0; i < g.n; i++) items.push({ e: g.emoji, crossed: g.crossed && i >= g.n - g.crossed }); });
      if (d.arrange === 'scatter') items = U.shuffle(items);
      items.forEach(function (it) { var b = obj(it.e, it.crossed); if (d.arrange === 'scatter') b.style.transform = 'rotate(' + U.rand(-18, 18) + 'deg) translateY(' + U.rand(-6, 6) + 'px)'; area.appendChild(b); });
    }
    el.appendChild(area);
    el.appendChild(h('div', { class: 'small muted center' }, t('q_count_tip')));
    var sub = h('div', { class: 'answer-area' }); el.appendChild(sub);
    var pseudo = { ui: d.answerUi, data: d.answerUi === 'choice' ? { options: d.options } : { kind: 'int' }, answer: q.answer };
    return R.reg[d.answerUi === 'choice' ? 'choice' : 'input'](sub, pseudo, api);
  });

  /* ------------------------------------------------------------------ grouping (bags) */
  R.register('group', function (el, q, api) {
    var d = q.data, bags = [], pool = h('div', { class: 'dnd-pool' }), locked = false, counts = U.range(d.groups).map(function () { return 0; });
    var eq = h('div', { class: 'eq-live', 'aria-live': 'polite' });
    function item() {
      var b = h('button', { class: 'chip-item', type: 'button', 'aria-label': d.emoji, style: { minWidth: '52px', minHeight: '52px', fontSize: '1.7rem' } }, d.emoji);
      R.draggable(b, {
        targets: function () { return bags; },
        onDrop: function (bag) { if (!locked) into(b, bags.indexOf(bag)); },
        onTap: function (e) { if (locked) return; e.stopPropagation(); var bi = b._bag; if (bi != null) { out(b); } else { var target = counts.indexOf(Math.min.apply(null, counts)); into(b, target); } }
      });
      return b;
    }
    function into(b, i) { if (i < 0) return; if (b._bag != null) counts[b._bag]--; b._bag = i; counts[i]++; bags[i].appendChild(b); b.style.minWidth = '40px'; b.style.minHeight = '40px'; b.style.fontSize = '1.3rem'; MA.sfx.play('click'); refresh(); }
    function out(b) { counts[b._bag]--; b._bag = null; pool.appendChild(b); b.style.minWidth = '52px'; b.style.minHeight = '52px'; b.style.fontSize = '1.7rem'; refresh(); }
    for (var i = 0; i < d.groups; i++) {
      (function (i) {
        var bag = h('div', { class: 'bag', role: 'button', tabindex: '0', 'data-label': t('q_bag_n', { n: i + 1 }), 'aria-label': t('q_bag_n', { n: i + 1 }) });
        function addOne() { if (locked) return; var free = U.$$('.chip-item', pool)[0]; if (free) into(free, i); }
        bag.addEventListener('click', function (e) { if (e.target === bag) addOne(); });
        bag.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addOne(); } });
        bags.push(bag);
      })(i);
    }
    for (var k = 0; k < d.total; k++) pool.appendChild(item());
    function refresh() {
      var total = U.sum(counts), allEq = counts.every(function (c) { return c === counts[0] && c > 0; });
      bags.forEach(function (b, i) { b.classList.toggle('full', d.mode === 'make' ? counts[i] === d.per : allEq && !pool.children.length); });
      var txt = counts.filter(function (c) { return c > 0; }).length ? counts.join(' + ') + ' = ' + total : '';
      if (allEq && (d.mode === 'make' ? counts[0] === d.per : !pool.children.length)) txt += d.mode === 'make' ? '   ✨ ' + d.groups + ' × ' + counts[0] + ' = ' + total : '   ✨ ' + total + ' ÷ ' + d.groups + ' = ' + counts[0];
      eq.textContent = txt;
      api.setReady(d.mode === 'share' ? pool.children.length === 0 : counts.every(function (c) { return c > 0; }));
    }
    el.appendChild(h('div', { class: 'group-area' }, pool, h('div', { class: 'small muted center' }, t('q_group_tip')), h('div', { class: 'bags' }, bags), eq));
    refresh(); api.setReady(false);
    return {
      value: function () { return counts.slice(); },
      lock: function () { locked = true; },
      onWrong: function () { bags.forEach(function (b, i) { if (counts[i] !== q.answer[i]) MA.fx.anim(b, 'wiggle'); }); },
      showAnswer: function () { locked = false; U.$$('.chip-item', el).forEach(function (b) { if (b._bag != null) out(b); }); var items = U.$$('.chip-item', pool); var idx = 0; q.answer.forEach(function (c, i) { for (var j = 0; j < c; j++) if (items[idx]) into(items[idx++], i); }); locked = true; }
    };
  });

  /* ------------------------------------------------------------------ arrays */
  R.register('array', function (el, q, api) {
    var d = q.data, R0 = d.maxR || 6, C0 = d.maxC || 8, sel = { r: 0, c: 0 }, locked = false, cells = [];
    var grid = h('div', { class: 'array-grid', style: { gridTemplateColumns: 'repeat(' + C0 + ', auto)' }, role: 'grid', 'aria-label': t('q_array_area') });
    for (var r = 0; r < R0; r++) for (var c = 0; c < C0; c++) {
      (function (r, c) {
        var b = h('button', { class: 'cell', type: 'button', 'aria-label': (r + 1) + ' × ' + (c + 1), tabindex: r === 0 && c === 0 ? '0' : '-1' });
        b._r = r; b._c = c; cells.push(b); grid.appendChild(b);
      })(r, c);
    }
    var label = h('div', { class: 'eq-live' });
    function set(r, c) { if (locked) return; sel = { r: r, c: c }; render(); api.setReady(r > 0 && c > 0); }
    function render() { cells.forEach(function (b) { b.classList.toggle('on', b._r < sel.r && b._c < sel.c); }); label.textContent = sel.r && sel.c ? sel.r + ' × ' + sel.c + ' = ' + sel.r * sel.c : ''; }
    function cellAt(e) { var el2 = document.elementFromPoint(e.clientX, e.clientY); return el2 && el2._r != null ? el2 : null; }
    grid.addEventListener('pointerdown', function (e) {
      var c0 = cellAt(e); if (!c0 || locked) return; e.preventDefault(); set(c0._r + 1, c0._c + 1); MA.sfx.play('click');
      function mv(ev) { var c1 = cellAt(ev); if (c1) set(c1._r + 1, c1._c + 1); }
      function up() { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); }
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    });
    grid.addEventListener('keydown', function (e) { if (e.target._r == null) return; set(e.target._r + 1, e.target._c + 1); });
    var ctrl = h('div', { class: 'row', style: { justifyContent: 'center' } },
      h('span', { class: 'bold' }, t('q_rows')), stepBtn('−', t('q_rows') + ' −', function () { set(Math.max(0, sel.r - 1), Math.max(1, sel.c)); }), stepBtn('+', t('q_rows') + ' +', function () { set(Math.min(R0, sel.r + 1), Math.max(1, sel.c)); }),
      h('span', { class: 'bold', style: { marginInlineStart: '14px' } }, t('q_cols')), stepBtn('−', t('q_cols') + ' −', function () { set(Math.max(1, sel.r), Math.max(0, sel.c - 1)); }), stepBtn('+', t('q_cols') + ' +', function () { set(Math.max(1, sel.r), Math.min(C0, sel.c + 1)); }));
    el.appendChild(grid); el.appendChild(label); el.appendChild(ctrl);
    api.setReady(false);
    return { value: function () { return sel.r && sel.c ? { r: sel.r, c: sel.c } : null; }, lock: function () { locked = true; }, onWrong: function () { MA.fx.anim(grid, 'wiggle'); }, showAnswer: function () { locked = false; set(q.answer.r, q.answer.c); locked = true; } };
  });

  /* ------------------------------------------------------------------ fractions (shade / cut) */
  R.register('fraction', function (el, q, api) {
    var d = q.data, parts = d.mode === 'cut' ? 1 : d.d, shaded = {}, locked = false;
    var holder = h('div', { class: 'frac-wrap' }), info = h('div', { class: 'eq-live' });
    function count() { return Object.keys(shaded).length; }
    function draw() {
      var idx = Object.keys(shaded).map(Number), svg;
      if (d.shape === 'pizza') svg = S.pizza(parts, idx, { width: 280 });
      else if (d.shape === 'bar') svg = S.fracBar(parts, idx, { width: 320 });
      else { var cols = parts % 3 === 0 && parts > 3 ? parts / 3 : parts % 2 === 0 && parts > 4 ? parts / 2 : parts; svg = S.fracGrid(parts / cols, cols, idx, { cell: 46 }); }
      holder.innerHTML = svg;
      U.$$('.slice', holder).forEach(function (sl) { sl.addEventListener('click', function () { if (locked) return; var i = +sl.getAttribute('data-i'); if (shaded[i]) delete shaded[i]; else shaded[i] = 1; MA.sfx.play('click'); draw(); }); });
      info.textContent = d.mode === 'cut' ? (parts > 1 ? count() + ' / ' + parts : '') : count() + ' / ' + parts;
      api.setReady(count() > 0 && (d.mode !== 'cut' || parts > 1));
    }
    if (d.mode === 'cut') {
      var pv = h('b', { class: 'big' }, '1');
      el.appendChild(h('div', { class: 'row', style: { justifyContent: 'center' } }, h('span', { class: 'bold' }, t('q_parts')),
        stepBtn('−', t('q_parts') + ' −', function () { if (locked || parts <= 1) return; parts--; shaded = {}; pv.textContent = parts; draw(); }), pv,
        stepBtn('+', t('q_parts') + ' +', function () { if (locked || parts >= (d.maxParts || 12)) return; parts++; shaded = {}; pv.textContent = parts; draw(); })));
    }
    el.appendChild(holder); el.appendChild(info);
    el.appendChild(h('div', { class: 'row', style: { justifyContent: 'center' } }, h('span', { class: 'small muted' }, t('q_shade_tip')),
      stepBtn('−', t('q_unshade'), function () { if (locked) return; var k = Object.keys(shaded).map(Number).sort(function (a, b) { return b - a; })[0]; if (k != null) { delete shaded[k]; draw(); } }),
      stepBtn('+', t('q_shade'), function () { if (locked) return; for (var i = 0; i < parts; i++) if (!shaded[i]) { shaded[i] = 1; break; } draw(); })));
    draw(); api.setReady(false);
    return {
      value: function () { if (!count()) return null; return d.mode === 'cut' ? { n: count(), d: parts } : count(); },
      lock: function () { locked = true; },
      onWrong: function () { MA.fx.anim(holder, 'wiggle'); },
      showAnswer: function () { locked = false; if (d.mode === 'cut') { parts = q.answer.d; } shaded = {}; for (var i = 0; i < (d.mode === 'cut' ? q.answer.n : q.answer); i++) shaded[i] = 1; draw(); locked = true; }
    };
  });

  /* ------------------------------------------------------------------ place value blocks */
  var PV = { th: 1000, h: 100, t: 10, o: 1 };
  R.register('placevalue', function (el, q, api) {
    var d = q.data, cnt = {}, locked = false, cols = {}, total = h('div', { class: 'eq-live big' });
    d.places.forEach(function (p) { cnt[p] = 0; });
    function render() {
      d.places.forEach(function (p) { var c = cols[p]; U.clear(c.blocks); for (var i = 0; i < cnt[p]; i++) c.blocks.appendChild(h('i', { class: 'blk-' + p })); c.num.textContent = cnt[p]; });
      var v = value0(); total.textContent = v ? '= ' + U.num(v) : ''; api.setReady(v > 0);
    }
    function value0() { return d.places.reduce(function (s, p) { return s + cnt[p] * PV[p]; }, 0); }
    var board = h('div', { class: 'pv-board' });
    d.places.forEach(function (p) {
      var blocks = h('div', { class: 'pv-blocks' }), num = h('div', { class: 'pv-count' }, '0');
      cols[p] = { blocks: blocks, num: num };
      board.appendChild(h('div', { class: 'pv-col' }, h('div', { class: 'pv-name' }, t('pw_' + p)), blocks, num,
        h('div', { class: 'row' }, stepBtn('−', t('pw_' + p) + ' −', function () { if (!locked && cnt[p] > 0) { cnt[p]--; MA.sfx.play('click'); render(); } }), stepBtn('+', t('pw_' + p) + ' +', function () { if (!locked && cnt[p] < 9) { cnt[p]++; MA.sfx.play('click'); render(); } }))));
    });
    el.appendChild(board); el.appendChild(total);
    render(); api.setReady(false);
    return { value: function () { var v = value0(); return v > 0 ? v : null; }, lock: function () { locked = true; }, onWrong: function () { MA.fx.anim(board, 'wiggle'); }, showAnswer: function () { var a = q.answer; d.places.forEach(function (p) { cnt[p] = Math.floor(a / PV[p]) % 10; }); render(); } };
  });

  /* ------------------------------------------------------------------ column arithmetic */
  R.register('column', function (el, q, api) {
    var d = q.data, a = String(d.a), b = String(d.b), op = d.op, locked = false;
    var resLen = op === '+' ? Math.max(a.length, b.length) + 1 : op === '-' ? a.length : a.length + b.length;
    var width = Math.max(resLen, a.length, b.length + 1);
    var grid = h('div', { class: 'col-calc' }), ans = [], carry = [], active = null;
    function cellRow(chars, cls) { var r = h('div', { class: 'cc-row' + (cls ? ' ' + cls : '') }); for (var i = 0; i < width - chars.length; i++) r.appendChild(h('span', { class: 'cc-cell' })); chars.forEach(function (ch) { r.appendChild(typeof ch === 'string' ? h('span', { class: 'cc-cell' }, ch) : ch); }); return r; }
    function digitInput(list, cls, label) {
      var inp = h('input', { type: 'text', inputmode: 'numeric', maxlength: 1, class: cls || '', autocomplete: 'off', 'aria-label': label });
      inp.addEventListener('input', function () { inp.value = inp.value.replace(/\D/g, '').slice(-1); if (inp.value && list === ans) { var i = ans.indexOf(inp); if (i > 0) ans[i - 1].focus(); } refresh(); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && !inp.value && list === ans) { var i = ans.indexOf(inp); if (i < ans.length - 1) ans[i + 1].focus(); } if (e.key === 'Enter') { e.preventDefault(); if (value() != null) api.submit(); } });
      inp.addEventListener('focus', function () { active = inp; });
      list.push(inp); return inp;
    }
    var carryCells = []; for (var i = 0; i < width - 1; i++) carryCells.push(digitInput(carry, '', t('q_carry')));
    var cr = cellRow(carryCells.concat(['']), 'cc-carry');
    grid.appendChild(cr);
    grid.appendChild(cellRow(a.split('')));
    var bRow = h('div', { class: 'cc-row' }, h('span', { class: 'cc-op' }, op === '-' ? '−' : op));
    for (var pb = 0; pb < width - b.length - 1; pb++) bRow.appendChild(h('span', { class: 'cc-cell' }));
    b.split('').forEach(function (ch) { bRow.appendChild(h('span', { class: 'cc-cell' }, ch)); });
    grid.appendChild(bRow);
    grid.appendChild(h('div', { class: 'cc-line' }));
    var aRow = []; for (var k = 0; k < resLen; k++) aRow.push(digitInput(ans, '', t('q_digit_n', { n: resLen - k })));
    grid.appendChild(cellRow(aRow));
    el.appendChild(grid);
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '→'];
    el.appendChild(h('div', { class: 'numpad' }, keys.map(function (kk) {
      return h('button', { type: 'button', class: kk === '⌫' || kk === '→' ? 'fn' : '', 'aria-label': kk === '⌫' ? t('q_backspace') : kk === '→' ? t('q_next_box') : kk, onclick: function () {
        if (locked) return;
        var f = active || ans[ans.length - 1];
        if (kk === '⌫') { f.value = ''; } else if (kk === '→') { var i2 = ans.indexOf(f); active = ans[i2 > 0 ? i2 - 1 : ans.length - 1]; active.focus(); return; }
        else { f.value = kk; var i3 = ans.indexOf(f); if (i3 > 0) { active = ans[i3 - 1]; } }
        MA.sfx.play('click'); refresh();
      } }, kk);
    })));
    function value() {
      var s = ans.map(function (x) { return x.value; }), first = s.findIndex(function (x) { return x !== ''; });
      if (first < 0) return null;
      var tail = s.slice(first); if (tail.some(function (x) { return x === ''; })) return null;
      return parseInt(tail.join(''), 10);
    }
    function refresh() { api.setReady(value() != null && ans[ans.length - 1].value !== ''); }
    active = ans[ans.length - 1];
    api.setReady(false);
    return {
      value: value, lock: function () { locked = true; ans.concat(carry).forEach(function (x) { x.readOnly = true; }); },
      onWrong: function () { MA.fx.anim(grid, 'wiggle'); },
      showAnswer: function () { var s = String(q.answer); ans.forEach(function (x, i) { var k2 = i - (ans.length - s.length); x.value = k2 >= 0 ? s[k2] : ''; x.style.borderColor = 'var(--c-mint)'; }); },
      focus: function () { if (!('ontouchstart' in window)) ans[ans.length - 1].focus(); }
    };
  });

  /* ------------------------------------------------------------------ clock (set the time) */
  R.register('clock', function (el, q, api) {
    var d = q.data, step = d.step || 5, st = { h: 12, m: 0 }, locked = false, touched = false;
    if (d.target && d.target.h === 12 && d.target.m === 0) st = { h: 6, m: 30 };
    var box = h('div', { class: 'clock-wrap' }), holder = h('div');
    function draw() {
      holder.innerHTML = S.clock(st.h, st.m, { width: 300 });
      var svg = holder.querySelector('svg'); svg.setAttribute('tabindex', '0'); svg.style.touchAction = 'none';
      svg.addEventListener('pointerdown', down);
      svg.addEventListener('keydown', key);
    }
    function angleAt(svg, e) { var p = svgPoint(svg, e), dx = p.x - 100, dy = p.y - 100; return { a: (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360, r: Math.sqrt(dx * dx + dy * dy) }; }
    function down(e) {
      if (locked) return; e.preventDefault();
      var svg = e.currentTarget, first = angleAt(svg, e), handIsMin = first.r > 52;
      function apply(ev) {
        var p = angleAt(svg, ev);
        if (handIsMin) { var mm = Math.round(p.a / 6 / step) * step % 60; st.m = mm; }
        else { var hh = Math.round(p.a / 30) % 12; st.h = hh === 0 ? 12 : hh; }
        touched = true; render();
      }
      apply(e);
      function mv(ev) { apply(ev); }
      function up() { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); }
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    }
    function key(e) { if (e.key === 'ArrowRight') { bump('m', 1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { bump('m', -1); e.preventDefault(); } else if (e.key === 'ArrowUp') { bump('h', 1); e.preventDefault(); } else if (e.key === 'ArrowDown') { bump('h', -1); e.preventDefault(); } }
    function render() {
      var svg = holder.querySelector('svg'), hr = svg.querySelector('.hour'), mn = svg.querySelector('.minute'), ha = ((st.h % 12) + st.m / 60) * 30 * Math.PI / 180, ma = st.m * 6 * Math.PI / 180;
      hr.setAttribute('x2', (100 + 44 * Math.sin(ha)).toFixed(1)); hr.setAttribute('y2', (100 - 44 * Math.cos(ha)).toFixed(1));
      mn.setAttribute('x2', (100 + 70 * Math.sin(ma)).toFixed(1)); mn.setAttribute('y2', (100 - 70 * Math.cos(ma)).toFixed(1));
      api.setReady(touched);
    }
    function bump(which, dir) { if (locked) return; if (which === 'h') { st.h = ((st.h - 1 + dir + 12) % 12) + 1; } else { st.m = (st.m + dir * step + 60) % 60; } touched = true; MA.sfx.play('click'); render(); }
    draw();
    box.appendChild(holder);
    box.appendChild(h('div', { class: 'clock-ctrl' },
      h('div', { class: 'cc-group' }, stepBtn('−', t('q_hour_back'), function () { bump('h', -1); }), h('span', null, '⏱ ' + t('q_hour_hand')), stepBtn('+', t('q_hour_fwd'), function () { bump('h', 1); })),
      h('div', { class: 'cc-group' }, stepBtn('−', t('q_min_back'), function () { bump('m', -1); }), h('span', null, '⏱ ' + t('q_minute_hand')), stepBtn('+', t('q_min_fwd'), function () { bump('m', 1); }))));
    box.appendChild(h('div', { class: 'small muted center' }, t('q_clock_tip')));
    el.appendChild(box);
    render(); api.setReady(false);
    return { value: function () { return touched ? { h: st.h, m: st.m } : null; }, lock: function () { locked = true; }, onWrong: function () { MA.fx.anim(holder, 'wiggle'); }, showAnswer: function () { st = { h: q.answer.h, m: q.answer.m }; render(); } };
  });

  /* ------------------------------------------------------------------ money (make an amount) */
  R.register('money', function (el, q, api) {
    var d = q.data, tray = h('div', { class: 'tray', 'aria-label': t('q_tray'), role: 'list' }), totalEl = h('div', { class: 'tray-total hidden' }), locked = false, inTray = [];
    var bank = h('div', { class: 'coin-bank' }, d.coins.map(function (v) {
      var big = S.CURRENCIES[d.cur].bills.indexOf(v) >= 0;
      return h('button', { class: 'coin-btn', type: 'button', 'aria-label': t('q_add_coin', { c: S.moneyLabel(v, d.cur) }), html: S.coin(v, d.cur, { width: big ? 120 : 70 }), onclick: function () { if (locked || inTray.length >= 30) return; add(v); } });
    }));
    function add(v) {
      var big = S.CURRENCIES[d.cur].bills.indexOf(v) >= 0;
      var b = h('button', { class: 'coin-btn', type: 'button', 'aria-label': t('q_remove_coin', { c: S.moneyLabel(v, d.cur) }), html: S.coin(v, d.cur, { width: big ? 96 : 54 }) });
      b.addEventListener('click', function () { if (locked) return; inTray.splice(inTray.indexOf(entry), 1); b.remove(); refresh(); });
      var entry = { v: v, el: b }; inTray.push(entry); tray.appendChild(b); MA.sfx.play('coin'); refresh();
    }
    function sum() { return U.sum(inTray, function (e) { return e.v; }); }
    function refresh() { totalEl.textContent = S.moneyLabel(sum(), d.cur); api.setReady(inTray.length > 0); }
    el.appendChild(h('div', { class: 'money-wrap' }, bank, h('div', { class: 'small muted' }, t('q_money_tip')), tray, totalEl));
    api.setReady(false);
    return {
      value: function () { return inTray.length ? sum() : null; }, lock: function () { locked = true; },
      onWrong: function () { totalEl.classList.remove('hidden'); MA.fx.anim(tray, 'wiggle'); },
      showAnswer: function () { totalEl.classList.remove('hidden'); totalEl.textContent = S.moneyLabel(q.answer, d.cur); }
    };
  });

  /* ------------------------------------------------------------------ grid painting (area, rectangles, symmetry) */
  R.register('grid', function (el, q, api) {
    var d = q.data, cs = 44, W = d.cols * cs + 8, H = d.rows * cs + 8, on = {}, given = {}, locked = false;
    (d.given || []).forEach(function (g) { given[g[0] + ',' + g[1]] = 1; });
    var g = '';
    for (var y = 0; y < d.rows; y++) for (var x = 0; x < d.cols; x++) g += '<rect class="gcell" data-k="' + x + ',' + y + '" x="' + (4 + x * cs) + '" y="' + (4 + y * cs) + '" width="' + cs + '" height="' + cs + '" rx="3" fill="' + (given[x + ',' + y] ? '#FFB020' : '#fff') + '" stroke="#C9CEDA" stroke-width="1.5" tabindex="' + (given[x + ',' + y] ? '-1' : '0') + '"/>';
    if (d.mode === 'symmetry') g += '<path d="M' + (4 + d.axis * cs) + ' 0 V' + H + '" stroke="#E53935" stroke-width="4" stroke-dasharray="10 7"/>';
    var holder = h('div', { class: 'grid-board', html: S.wrap(W, H, g, { width: Math.min(W, 460), label: t('q_grid_area') }) });
    var svg = holder.querySelector('svg');
    function paint(k, val) { if (given[k] || locked) return; if (val) on[k] = 1; else delete on[k]; var r = svg.querySelector('[data-k="' + k + '"]'); r.setAttribute('fill', val ? '#3BB7F0' : '#fff'); api.setReady(Object.keys(on).length > 0); }
    function keyAt(e) { var p = svgPoint(svg, e), x = Math.floor((p.x - 4) / cs), y = Math.floor((p.y - 4) / cs); return x >= 0 && y >= 0 && x < d.cols && y < d.rows ? x + ',' + y : null; }
    svg.style.touchAction = 'none';
    svg.addEventListener('pointerdown', function (e) {
      var k = keyAt(e); if (!k || locked || given[k]) return; e.preventDefault();
      var mode = !on[k]; paint(k, mode); MA.sfx.play('click');
      function mv(ev) { var k2 = keyAt(ev); if (k2 && !!on[k2] !== mode) paint(k2, mode); }
      function up() { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); }
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    });
    svg.addEventListener('keydown', function (e) { var k = e.target.getAttribute && e.target.getAttribute('data-k'); if (k && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); paint(k, !on[k]); } });
    el.appendChild(holder);
    el.appendChild(h('div', { class: 'row', style: { justifyContent: 'center' } }, h('span', { class: 'small muted' }, t('q_grid_tip')), h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: function () { Object.keys(on).forEach(function (k) { paint(k, false); }); } }, '🧽 ' + t('q_clear'))));
    api.setReady(false);
    return {
      value: function () { var ks = Object.keys(on); return ks.length ? ks.sort() : null; }, lock: function () { locked = true; },
      onWrong: function () { MA.fx.anim(holder, 'wiggle'); },
      showAnswer: function () { locked = false; Object.keys(on).forEach(function (k) { paint(k, false); }); (q.answer || []).forEach(function (k) { if (typeof k === 'string') paint(k, true); }); locked = true; }
    };
  });

  /* ------------------------------------------------------------------ build a bar graph */
  R.register('bargraph', function (el, q, api) {
    var d = q.data, vals = d.cats.map(function () { return 0; }), locked = false, cols = [];
    var wrap = h('div', { class: 'bg-build' });
    d.cats.forEach(function (c, i) {
      var track = h('div', { class: 'bg-track', style: { height: (d.max * 22) + 'px' } });
      for (var k = 1; k <= d.max; k++) {
        (function (k) { track.appendChild(h('button', { type: 'button', 'aria-label': c.label + ' ' + k, style: { width: '100%', height: '22px', border: 0, background: 'transparent', padding: 0 }, onclick: function () { if (locked) return; vals[i] = vals[i] === k ? k - 1 : k; MA.sfx.play('click'); render(); } })); })(k);
      }
      var bar = h('div', { class: 'bg-bar', style: { position: 'absolute', bottom: 0, height: '0px', pointerEvents: 'none' } }); track.appendChild(bar);
      var num = h('b', { class: 'big' }, '0');
      cols.push({ bar: bar, num: num });
      wrap.appendChild(h('div', { class: 'bg-col' }, num, track, h('div', { class: 'bold' }, (c.icon || '') + ' ' + c.label),
        h('div', { class: 'row', style: { gap: '4px' } }, stepBtn('−', c.label + ' −', function () { if (!locked && vals[i] > 0) { vals[i]--; render(); } }), stepBtn('+', c.label + ' +', function () { if (!locked && vals[i] < d.max) { vals[i]++; render(); } }))));
    });
    function render() { cols.forEach(function (c, i) { c.bar.style.height = (vals[i] * 22) + 'px'; c.num.textContent = vals[i]; }); api.setReady(vals.some(function (v) { return v > 0; })); }
    el.appendChild(wrap);
    api.setReady(false);
    return { value: function () { return vals.slice(); }, lock: function () { locked = true; }, onWrong: function () { MA.fx.anim(wrap, 'wiggle'); }, showAnswer: function () { vals = q.answer.slice(); render(); } };
  });

  MA.i18n.add({
    en: { q_numberline: 'Number line', q_move_left: 'Move left', q_move_right: 'Move right', q_nl_tip: 'Drag the red marker, tap the line, or use the arrows.', q_count_area: 'Objects to count',
      q_count_tip: 'Tip: tap each one as you count it.', q_bag_n: 'Bag {n}', q_group_tip: 'Drag items into the bags, or tap a bag to drop one in. Tap an item to take it out.', q_array_area: 'Array grid', q_rows: 'Rows', q_cols: 'In each row',
      q_parts: 'Equal parts:', q_shade_tip: 'Tap the parts to color them.', q_shade: 'Color one more part', q_unshade: 'Uncolor one part', q_carry: 'carry', q_digit_n: 'answer digit {n}',
      q_hour_back: 'Hour hand back', q_hour_fwd: 'Hour hand forward', q_min_back: 'Minute hand back', q_min_fwd: 'Minute hand forward', q_hour_hand: 'hour', q_minute_hand: 'minutes', q_clock_tip: 'Drag the hands or use the buttons.',
      q_tray: 'Your coins', q_add_coin: 'Add {c}', q_remove_coin: 'Remove {c}', q_money_tip: 'Tap coins to put them in the tray. Tap a coin in the tray to take it back.',
      q_grid_area: 'Grid', q_grid_tip: 'Tap or drag over squares to color them.', q_clear: 'Clear' },
    he: { q_numberline: 'ישר המספרים', q_move_left: 'הזזה שמאלה', q_move_right: 'הזזה ימינה', q_nl_tip: 'גררו את הסמן האדום, געו בישר, או השתמשו בחצים.', q_count_area: 'חפצים לספירה',
      q_count_tip: 'טיפ: געו בכל אחד בזמן שאתם סופרים.', q_bag_n: 'שקית {n}', q_group_tip: 'גררו פריטים לשקיות, או געו בשקית כדי להוסיף אחד. געו בפריט כדי להוציא אותו.', q_array_area: 'רשת המערך', q_rows: 'שורות', q_cols: 'בכל שורה',
      q_parts: 'חלקים שווים:', q_shade_tip: 'געו בחלקים כדי לצבוע אותם.', q_shade: 'צביעת חלק נוסף', q_unshade: 'ביטול צביעה של חלק', q_carry: 'העברה', q_digit_n: 'ספרה {n} של התשובה',
      q_hour_back: 'מחוג השעות אחורה', q_hour_fwd: 'מחוג השעות קדימה', q_min_back: 'מחוג הדקות אחורה', q_min_fwd: 'מחוג הדקות קדימה', q_hour_hand: 'שעות', q_minute_hand: 'דקות', q_clock_tip: 'גררו את המחוגים או השתמשו בכפתורים.',
      q_tray: 'המטבעות שלכם', q_add_coin: 'הוספת {c}', q_remove_coin: 'הוצאת {c}', q_money_tip: 'געו במטבעות כדי לשים אותם במגש. געו במטבע במגש כדי להחזיר אותו.',
      q_grid_area: 'רשת', q_grid_tip: 'געו או גררו על משבצות כדי לצבוע אותן.', q_clear: 'ניקוי' }
  });
})(window.MA = window.MA || {});
