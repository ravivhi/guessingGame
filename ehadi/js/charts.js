/* Lightweight SVG charts for parent/teacher/admin dashboards (no external libraries). */
(function (MA) {
  'use strict';
  var esc = MA.svg.esc, Ch = MA.chart = {};
  var PAL = Ch.PAL = ['#6C4CF1', '#2BC79A', '#FFC93C', '#FF7A7A', '#3BB7F0', '#FF9F43', '#FF8FC7', '#8BC34A'];
  function wrap(w, h, inner, label) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(label || '') + '" direction="ltr" font-family="Rubik, Segoe UI, Arial, sans-serif">' + inner + '</svg>'; }
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || 'middle') + '" font-size="' + (o.s || 11) + '" font-weight="' + (o.w || 600) + '" fill="' + (o.f || '#6B6B85') + '">' + esc(s) + '</text>'; }
  function niceMax(v) { if (v <= 0) return 1; var p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
  Ch.bars = function (items, o) {
    o = o || {};
    var W = o.width || Math.max(320, items.length * 46 + 50), H = o.height || 200, x0 = 40, y0 = H - 30, top = 14, max = o.max || niceMax(Math.max.apply(null, items.map(function (i) { return i.value || 0; }).concat([1]))), g = '', fmt = o.fmt || String;
    for (var k = 0; k <= 4; k++) { var v = max * k / 4, y = y0 - (y0 - top) * k / 4; g += '<path d="M' + x0 + ' ' + y + ' H' + (W - 6) + '" stroke="#EEE"/>' + txt(x0 - 6, y + 4, fmt(Math.round(v * 10) / 10), { a: 'end', s: 10 }); }
    var bw = Math.min(34, (W - x0 - 10) / items.length - 8);
    items.forEach(function (it, i) {
      var cx = x0 + 8 + i * ((W - x0 - 10) / items.length) + bw / 2, h = (y0 - top) * Math.min(1, (it.value || 0) / max);
      g += '<rect x="' + (cx - bw / 2) + '" y="' + (y0 - h) + '" width="' + bw + '" height="' + Math.max(0, h) + '" rx="4" fill="' + (it.color || o.color || PAL[0]) + '"><title>' + esc(it.label + ': ' + fmt(it.value || 0)) + '</title></rect>';
      if (o.showValues && it.value) g += txt(cx, y0 - h - 4, fmt(it.value), { s: 10, f: '#23233A' });
      g += txt(cx, y0 + 14, it.label, { s: 10 });
    });
    g += '<path d="M' + x0 + ' ' + y0 + ' H' + (W - 6) + '" stroke="#9C9CB5"/>';
    return wrap(W, H, g, o.label);
  };
  Ch.hbars = function (items, o) {
    o = o || {};
    var W = o.width || 520, rowH = 30, H = items.length * rowH + 10, lw = o.labelWidth || 190, max = o.max || Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1])), g = '', fmt = o.fmt || String;
    items.forEach(function (it, i) {
      var y = 6 + i * rowH, w = (W - lw - 60) * Math.min(1, it.value / max);
      g += txt(lw - 8, y + 16, it.label.length > 28 ? it.label.slice(0, 27) + '…' : it.label, { a: 'end', s: 11, f: '#23233A' }) + '<rect x="' + lw + '" y="' + (y + 4) + '" width="' + (W - lw - 60) + '" height="16" rx="8" fill="#F0EEF7"/>' +
        '<rect x="' + lw + '" y="' + (y + 4) + '" width="' + Math.max(0, w) + '" height="16" rx="8" fill="' + (it.color || o.color || PAL[0]) + '"/>' + txt(W - 52, y + 16, fmt(it.value), { a: 'start', s: 11, f: '#23233A' });
    });
    return wrap(W, H, g, o.label);
  };
  Ch.line = function (series, o) {
    o = o || {};
    var W = o.width || 520, H = o.height || 200, x0 = 40, y0 = H - 28, top = 12, labels = o.labels || [], n = labels.length, g = '';
    var allV = []; series.forEach(function (s) { s.points.forEach(function (p) { if (p != null) allV.push(p); }); });
    var max = o.max || niceMax(Math.max.apply(null, allV.concat([1]))), min = o.min || 0, fmt = o.fmt || String;
    var X = function (i) { return x0 + 10 + (n <= 1 ? 0 : i * (W - x0 - 20) / (n - 1)); }, Y = function (v) { return y0 - (y0 - top) * (v - min) / (max - min || 1); };
    for (var k = 0; k <= 4; k++) { var v = min + (max - min) * k / 4; g += '<path d="M' + x0 + ' ' + Y(v) + ' H' + (W - 6) + '" stroke="#EEE"/>' + txt(x0 - 6, Y(v) + 4, fmt(Math.round(v * 10) / 10), { a: 'end', s: 10 }); }
    var every = Math.ceil(n / 8);
    labels.forEach(function (l, i) { if (i % every === 0 || i === n - 1) g += txt(X(i), y0 + 16, l, { s: 10 }); });
    series.forEach(function (s, si) {
      var col = s.color || PAL[si], seg = [], d = '';
      s.points.forEach(function (p, i) { if (p == null) { if (seg.length) { d += 'M' + seg.join(' L'); seg = []; } return; } seg.push(X(i).toFixed(1) + ' ' + Y(p).toFixed(1)); });
      if (seg.length) d += 'M' + seg.join(' L');
      if (d) g += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2.5" stroke-linejoin="round"/>';
      s.points.forEach(function (p, i) { if (p != null) g += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(p).toFixed(1) + '" r="3.2" fill="' + col + '"><title>' + esc((labels[i] || '') + ': ' + fmt(p)) + '</title></circle>'; });
    });
    g += '<path d="M' + x0 + ' ' + y0 + ' H' + (W - 6) + '" stroke="#9C9CB5"/>';
    return wrap(W, H, g, o.label);
  };
  Ch.stacked = function (items, o) {
    o = o || {};
    var W = o.width || 520, rowH = 28, lw = o.labelWidth || 150, H = items.length * rowH + 8, g = '';
    items.forEach(function (it, i) {
      var y = 4 + i * rowH, tot = it.parts.reduce(function (s, p) { return s + p.value; }, 0) || 1, x = lw;
      g += txt(lw - 8, y + 16, it.label, { a: 'end', s: 11, f: '#23233A' });
      it.parts.forEach(function (p) { var w = (W - lw - 10) * p.value / tot; if (w > 0) g += '<rect x="' + x + '" y="' + (y + 3) + '" width="' + w + '" height="18" fill="' + p.color + '"><title>' + esc(p.name + ': ' + p.value) + '</title></rect>'; if (w > 22) g += txt(x + w / 2, y + 16, String(p.value), { s: 10, f: '#fff', w: 700 }); x += w; });
    });
    return wrap(W, H, g, o.label);
  };
  Ch.donut = function (parts, o) {
    o = o || {};
    var S = o.size || 160, R = S / 2 - 6, r = R * .62, cx = S / 2, cy = S / 2, tot = parts.reduce(function (s, p) { return s + p.value; }, 0), a0 = -Math.PI / 2, g = '';
    if (!tot) g = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#F0EEF7"/>';
    parts.forEach(function (p) {
      if (!p.value) return;
      var a1 = a0 + 2 * Math.PI * p.value / tot, large = a1 - a0 > Math.PI ? 1 : 0;
      if (p.value === tot) { g += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="' + p.color + '"/>'; return; }
      g += '<path d="M' + (cx + R * Math.cos(a0)) + ' ' + (cy + R * Math.sin(a0)) + ' A' + R + ' ' + R + ' 0 ' + large + ' 1 ' + (cx + R * Math.cos(a1)) + ' ' + (cy + R * Math.sin(a1)) + ' L' + cx + ' ' + cy + 'Z" fill="' + p.color + '"><title>' + esc(p.label + ': ' + p.value) + '</title></path>';
      a0 = a1;
    });
    g += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fff"/>' + (o.center ? txt(cx, cy + 6, o.center, { s: 18, w: 800, f: '#23233A' }) : '');
    return wrap(S, S, g, o.label);
  };
  Ch.spark = function (vals, o) {
    o = o || {};
    var W = o.w || 120, H = o.h || 32, max = Math.max.apply(null, vals.concat([1])), bw = W / Math.max(1, vals.length), g = '';
    vals.forEach(function (v, i) { var h = (H - 4) * v / max; g += '<rect x="' + (i * bw + 1) + '" y="' + (H - h) + '" width="' + Math.max(2, bw - 3) + '" height="' + Math.max(v ? 2 : 0, h) + '" rx="2" fill="' + (o.color || PAL[0]) + '"/>'; });
    return wrap(W, H, g, o.label);
  };
  Ch.ring = function (pct, o) {
    o = o || {};
    var S = o.size || 90, R = S / 2 - 7, C = 2 * Math.PI * R, v = Math.max(0, Math.min(1, pct || 0));
    return wrap(S, S, '<circle cx="' + S / 2 + '" cy="' + S / 2 + '" r="' + R + '" fill="none" stroke="' + (o.track || '#ECEAF6') + '" stroke-width="10"/>' +
      '<circle cx="' + S / 2 + '" cy="' + S / 2 + '" r="' + R + '" fill="none" stroke="' + (o.color || PAL[0]) + '" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + (C * v).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 ' + S / 2 + ' ' + S / 2 + ')"/>', o.label);
  };
  Ch.STATUS_COLORS = { not_started: '#D9D7E6', learning: '#FF9E80', practicing: '#FFC93C', developing: '#3BB7F0', mastered: '#2BC79A', challenge: '#A855F7' };
})(window.MA = window.MA || {});
