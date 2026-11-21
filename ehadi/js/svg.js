/* Mathoria SVG drawing helpers. Every function returns an SVG markup string generated from numbers and
   our own label strings (escaped). Used by question generators (visuals, hints) and renderers. */
(function (MA) {
  'use strict';
  var S = MA.svg = {};
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  S.esc = esc;
  var COLORS = S.COLORS = ['#FF7A7A', '#FFC93C', '#3BB7F0', '#2BC79A', '#A68BFF', '#FF9F43', '#FF8FC7', '#5CC160'];
  function r1(x) { return Math.round(x * 10) / 10; }
  function pts(arr) { return arr.map(function (p) { return r1(p[0]) + ',' + r1(p[1]); }).join(' '); }
  S.wrap = function (w, h, inner, o) {
    o = o || {};
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + (o.width || w) + '"' + (o.height ? ' height="' + o.height + '"' : '') +
      ' direction="ltr" role="img" aria-label="' + esc(o.label || '') + '"' + (o.cls ? ' class="' + o.cls + '"' : '') + ' font-family="Rubik, Segoe UI, Arial, sans-serif">' + inner + '</svg>';
  };
  S.text = function (x, y, s, o) {
    o = o || {};
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="' + (o.base || 'middle') + '" font-size="' + (o.size || 16) +
      '" font-weight="' + (o.weight || 700) + '" fill="' + (o.fill || '#23233A') + '"' + (o.extra || '') + '>' + esc(s) + '</text>';
  };
  S.emoji = function (x, y, e, size) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="middle" dominant-baseline="central" font-size="' + (size || 28) + '">' + esc(e) + '</text>'; };
  S.regular = function (n, cx, cy, r, rot) {
    var a0 = (rot == null ? -90 : rot) * Math.PI / 180, out = [];
    for (var i = 0; i < n; i++) { var a = a0 + i * 2 * Math.PI / n; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return out;
  };
  S.poly = function (p, fill, o) { o = o || {}; return '<polygon points="' + pts(p) + '" fill="' + (fill || '#A68BFF') + '" stroke="' + (o.stroke || '#23233A') + '" stroke-width="' + (o.sw || 3) + '" stroke-linejoin="round"' + (o.extra || '') + '/>'; };

  /* ------------------------------------------------------------- mascot */
  S.mascot = function (mood, size) {
    mood = mood || 'happy';
    var eyesY = mood === 'think' ? 50 : 54, pupilDy = mood === 'think' ? -4 : 0;
    var mouth = {
      happy: '<path d="M48 74 Q60 86 72 74" stroke="#2B1D5C" stroke-width="4" fill="none" stroke-linecap="round"/>',
      cheer: '<path d="M46 72 Q60 92 74 72 Z" fill="#2B1D5C"/><path d="M52 80 Q60 86 68 80" fill="#FF8FA3"/>',
      think: '<path d="M54 78 Q60 75 66 78" stroke="#2B1D5C" stroke-width="4" fill="none" stroke-linecap="round"/>',
      oops: '<ellipse cx="60" cy="78" rx="6" ry="7" fill="#2B1D5C"/>',
      wave: '<path d="M48 74 Q60 88 72 74" stroke="#2B1D5C" stroke-width="4" fill="none" stroke-linecap="round"/>'
    }[mood] || '';
    var arms = mood === 'cheer'
      ? '<path d="M24 66 Q10 48 14 36" stroke="#6A4BE0" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M96 66 Q110 48 106 36" stroke="#6A4BE0" stroke-width="9" fill="none" stroke-linecap="round"/>'
      : mood === 'wave' ? '<path d="M24 74 Q12 80 14 92" stroke="#6A4BE0" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M96 66 Q112 52 108 38" stroke="#6A4BE0" stroke-width="9" fill="none" stroke-linecap="round"/>'
        : '<path d="M24 74 Q12 80 14 92" stroke="#6A4BE0" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M96 74 Q108 80 106 92" stroke="#6A4BE0" stroke-width="9" fill="none" stroke-linecap="round"/>';
    var sweat = mood === 'oops' ? '<path d="M92 40 q5 8 0 11 q-5 -3 0 -11z" fill="#7FD3FF"/>' : '';
    var inner = '<defs><radialGradient id="nomiG" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#9C82FF"/><stop offset="1" stop-color="#6C4CF1"/></radialGradient></defs>' +
      '<path d="M60 8 L60 22" stroke="#6A4BE0" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M60 0 l3.5 7 7.5 1 -5.5 5 1.5 7.5 -7 -3.8 -7 3.8 1.5 -7.5 -5.5 -5 7.5 -1z" fill="#FFC93C" stroke="#E0A800" stroke-width="1.5"/>' + arms +
      '<path d="M60 20 C92 20 104 44 104 70 C104 98 86 112 60 112 C34 112 16 98 16 70 C16 44 28 20 60 20 Z" fill="url(#nomiG)"/>' +
      '<ellipse cx="60" cy="88" rx="26" ry="18" fill="#B9A6FF" opacity=".55"/>' +
      '<circle cx="45" cy="' + eyesY + '" r="11" fill="#fff"/><circle cx="75" cy="' + eyesY + '" r="11" fill="#fff"/>' +
      '<circle cx="47" cy="' + (eyesY + 1 + pupilDy) + '" r="5.5" fill="#2B1D5C"/><circle cx="77" cy="' + (eyesY + 1 + pupilDy) + '" r="5.5" fill="#2B1D5C"/>' +
      '<circle cx="49" cy="' + (eyesY - 2 + pupilDy) + '" r="1.8" fill="#fff"/><circle cx="79" cy="' + (eyesY - 2 + pupilDy) + '" r="1.8" fill="#fff"/>' +
      '<ellipse cx="34" cy="70" rx="6" ry="4" fill="#FF9EC4" opacity=".8"/><ellipse cx="86" cy="70" rx="6" ry="4" fill="#FF9EC4" opacity=".8"/>' + mouth + sweat +
      '<ellipse cx="42" cy="112" rx="12" ry="5" fill="#5835DF"/><ellipse cx="78" cy="112" rx="12" ry="5" fill="#5835DF"/>';
    return S.wrap(120, 120, inner, { width: size || 120, label: 'Nomi' });
  };
  S.logo = function () { return S.mascot('happy', 40); };

  /* --------------------------------------------------------- world art */
  S.world = function (id) {
    var W = 400, H = 200, g = '';
    function sky(a, b) { return '<defs><linearGradient id="sky_' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect width="400" height="200" fill="url(#sky_' + id + ')"/>'; }
    function tree(x, y, s, c) { return '<rect x="' + (x - 4 * s) + '" y="' + (y - 4) + '" width="' + 8 * s + '" height="' + 22 * s + '" rx="3" fill="#8B5A2B"/><circle cx="' + x + '" cy="' + (y - 14 * s) + '" r="' + 20 * s + '" fill="' + c + '"/><circle cx="' + (x - 12 * s) + '" cy="' + (y - 4 * s) + '" r="' + 13 * s + '" fill="' + c + '"/><circle cx="' + (x + 12 * s) + '" cy="' + (y - 4 * s) + '" r="' + 13 * s + '" fill="' + c + '"/>'; }
    function cloud(x, y) { return '<g fill="#fff" opacity=".9"><circle cx="' + x + '" cy="' + y + '" r="14"/><circle cx="' + (x + 16) + '" cy="' + (y - 6) + '" r="17"/><circle cx="' + (x + 34) + '" cy="' + y + '" r="13"/></g>'; }
    function house(x, y, c, roof) { return '<rect x="' + x + '" y="' + y + '" width="46" height="38" rx="4" fill="' + c + '"/><polygon points="' + (x - 6) + ',' + (y + 2) + ' ' + (x + 23) + ',' + (y - 24) + ' ' + (x + 52) + ',' + (y + 2) + '" fill="' + roof + '"/><rect x="' + (x + 17) + '" y="' + (y + 16) + '" width="12" height="22" rx="2" fill="#7A4A1E"/><rect x="' + (x + 5) + '" y="' + (y + 8) + '" width="9" height="9" fill="#FFF6C9"/><rect x="' + (x + 32) + '" y="' + (y + 8) + '" width="9" height="9" fill="#FFF6C9"/>'; }
    switch (id) {
      case 'forest':
        g = sky('#BDEBFF', '#E8FAFF') + cloud(40, 40) + cloud(290, 30) + '<circle cx="350" cy="44" r="22" fill="#FFD84D"/>' +
          '<path d="M0 150 Q100 110 200 140 T400 130 V200 H0Z" fill="#7FD07F"/><path d="M0 170 Q120 140 240 165 T400 160 V200 H0Z" fill="#5CB85C"/>' +
          tree(60, 150, 1.1, '#3FA34D') + tree(130, 140, .9, '#2E8B3E') + tree(300, 145, 1.2, '#3FA34D') + tree(360, 150, .8, '#2E8B3E') +
          '<rect x="196" y="122" width="44" height="28" rx="6" fill="#C8873C"/><rect x="214" y="150" width="6" height="22" fill="#8B5A2B"/>' + S.text(218, 137, '1 2 3', { size: 13, fill: '#fff' });
        break;
      case 'village':
        g = sky('#FFE3C2', '#FFF6E8') + cloud(250, 36) + '<circle cx="70" cy="46" r="22" fill="#FFB74D"/>' +
          '<path d="M0 150 Q200 120 400 150 V200 H0Z" fill="#9BD47A"/><path d="M170 200 Q200 170 190 150 Q185 140 200 135" stroke="#E8C690" stroke-width="18" fill="none"/>' +
          house(40, 112, '#FF8A80', '#C62828') + house(120, 104, '#FFD180', '#EF6C00') + house(250, 108, '#80D8FF', '#0277BD') + house(320, 116, '#CE93D8', '#6A1B9A') +
          S.text(143, 92, '+', { size: 22, fill: '#fff' }) + S.text(273, 96, '−', { size: 22, fill: '#fff' });
        break;
      case 'mountain':
        g = sky('#D8CCFF', '#F3EEFF') + cloud(30, 50) + cloud(300, 40) +
          '<polygon points="20,170 130,40 240,170" fill="#7B5CFF"/><polygon points="100,74 130,40 160,74 145,68 130,80 115,68" fill="#fff"/>' +
          '<polygon points="170,170 280,60 390,170" fill="#9C82FF"/><polygon points="252,88 280,60 308,88 293,82 280,92 267,82" fill="#fff"/>' +
          '<path d="M0 170 H400 V200 H0Z" fill="#7FD07F"/><path d="M130 170 Q150 150 140 130 Q130 110 150 95" stroke="#FFE0A3" stroke-width="5" stroke-dasharray="8 6" fill="none"/>' +
          '<rect x="276" y="36" width="3" height="26" fill="#5A3E1B"/><polygon points="279,36 300,42 279,48" fill="#FFC93C"/>' + S.text(288, 42, '×', { size: 10 });
        break;
      case 'island':
        g = sky('#B3E5FC', '#E1F5FE') + '<circle cx="320" cy="48" r="26" fill="#FFD54F"/><path d="M320 48 L320 22 A26 26 0 0 1 346 48Z" fill="#FFB300"/>' + cloud(60, 40) +
          '<path d="M0 140 H400 V200 H0Z" fill="#4FC3F7"/><path d="M0 160 Q50 150 100 160 T200 160 T300 160 T400 160 V200 H0Z" fill="#29B6F6"/>' +
          '<ellipse cx="190" cy="145" rx="110" ry="24" fill="#FFE082"/><path d="M190 140 Q186 100 200 70" stroke="#8D6E63" stroke-width="8" fill="none"/>' +
          '<path d="M200 70 Q170 60 150 78 M200 70 Q230 56 250 76 M200 70 Q190 48 170 46 M200 70 Q214 48 236 48" stroke="#43A047" stroke-width="9" fill="none" stroke-linecap="round"/>' +
          '<circle cx="250" cy="134" r="12" fill="#FF7043"/><path d="M250 122 V146 M238 134 H262" stroke="#fff" stroke-width="2"/>';
        break;
      case 'city':
        g = sky('#FFD6D6', '#FFF1F1') + cloud(200, 34) +
          '<rect x="30" y="80" width="60" height="100" fill="#FF8A80"/><circle cx="60" cy="110" r="12" fill="#FFF6C9"/><circle cx="60" cy="146" r="12" fill="#FFF6C9"/>' +
          '<rect x="100" y="56" width="50" height="124" fill="#80D8FF"/><polygon points="100,56 125,24 150,56" fill="#0288D1"/>' + '<rect x="110" y="74" width="12" height="12" fill="#fff"/><rect x="128" y="74" width="12" height="12" fill="#fff"/><rect x="110" y="96" width="12" height="12" fill="#fff"/><rect x="128" y="96" width="12" height="12" fill="#fff"/>' +
          '<rect x="160" y="96" width="70" height="84" fill="#FFD180"/><polygon points="175,120 195,104 215,120 205,140 185,140" fill="#FF7043"/>' +
          '<rect x="240" y="70" width="56" height="110" fill="#B39DDB"/><polygon points="240,70 268,40 296,70" fill="#7E57C2"/><rect x="306" y="110" width="66" height="70" fill="#A5D6A7"/><polygon points="306,110 372,110 339,84" fill="#43A047"/>' +
          '<rect x="0" y="180" width="400" height="20" fill="#90A4AE"/><path d="M0 190 H400" stroke="#fff" stroke-width="3" stroke-dasharray="16 12"/>';
        break;
      case 'harbor':
        g = sky('#C8F2E4', '#EFFFF8') + cloud(60, 36) + '<circle cx="340" cy="44" r="20" fill="#FFD54F"/>' +
          '<path d="M0 130 H400 V200 H0Z" fill="#26A69A"/><path d="M0 150 Q50 140 100 150 T200 150 T300 150 T400 150 V200 H0Z" fill="#00897B"/>' +
          '<rect x="0" y="118" width="170" height="14" fill="#A1887F"/><g fill="#6D4C41">' + [10, 40, 70, 100, 130, 160].map(function (x) { return '<rect x="' + x + '" y="118" width="2" height="8"/>'; }).join('') + '</g>' +
          '<path d="M230 140 H330 L314 162 H246Z" fill="#EF5350"/><rect x="276" y="86" width="4" height="54" fill="#5D4037"/><polygon points="280,90 318,132 280,132" fill="#fff"/><polygon points="276,96 248,132 276,132" fill="#FFF59D"/>' +
          '<circle cx="380" cy="90" r="14" fill="#fff" stroke="#37474F" stroke-width="3"/><path d="M380 90 V81 M380 90 L386 94" stroke="#37474F" stroke-width="2.5" stroke-linecap="round"/><rect x="374" y="104" width="12" height="30" fill="#78909C"/>';
        break;
      case 'station':
        g = sky('#1A1F5C', '#3C3F9E') + [[30, 30], [80, 70], [150, 25], [220, 60], [330, 30], [370, 80], [270, 20], [110, 110], [360, 130]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2" fill="#fff"/>'; }).join('') +
          '<circle cx="320" cy="150" r="60" fill="#7E57C2"/><ellipse cx="320" cy="150" rx="90" ry="14" fill="none" stroke="#FFC93C" stroke-width="5"/>' +
          '<g transform="translate(120 80) rotate(30)"><path d="M0 -40 Q16 -20 14 20 H-14 Q-16 -20 0 -40Z" fill="#ECEFF1"/><circle cy="-8" r="7" fill="#4FC3F7"/><path d="M-14 10 L-26 26 L-14 22Z M14 10 L26 26 L14 22Z" fill="#EF5350"/><path d="M-8 22 Q0 44 8 22Z" fill="#FFB300"/></g>' +
          '<rect x="200" y="120" width="12" height="40" fill="#4FC3F7"/><rect x="216" y="100" width="12" height="60" fill="#2BC79A"/><rect x="232" y="130" width="12" height="30" fill="#FFC93C"/>';
        break;
      case 'cave':
        g = sky('#4A2A6B', '#7B4FA0') + '<path d="M0 200 V120 Q60 40 200 50 Q340 40 400 120 V200Z" fill="#5E3A82"/><path d="M110 200 V150 Q200 60 290 150 V200Z" fill="#26143A"/>' +
          '<polygon points="60,170 74,140 88,170" fill="#4DD0E1"/><polygon points="320,176 336,140 352,176" fill="#F06292"/><polygon points="350,180 360,160 370,180" fill="#FFD54F"/><polygon points="30,186 40,166 50,186" fill="#AED581"/>' +
          '<rect x="96" y="110" width="6" height="30" fill="#8D6E63"/><path d="M99 110 Q90 96 99 88 Q108 96 99 110Z" fill="#FFB300"/>' + S.text(200, 130, '?', { size: 44, fill: '#FFC93C' });
        break;
      default:
        g = sky('#EEE', '#FFF');
    }
    return S.wrap(W, H, g, { width: '100%', label: '' }).replace('width="100%"', 'preserveAspectRatio="xMidYMax slice"');
  };

  /* ------------------------------------------------------------- 2D shapes */
  var SHAPE_PTS = {
    triangle: function (cx, cy, s) { return S.regular(3, cx, cy + s * .1, s * .58); },
    square: function (cx, cy, s) { var a = s * .42; return [[cx - a, cy - a], [cx + a, cy - a], [cx + a, cy + a], [cx - a, cy + a]]; },
    rectangle: function (cx, cy, s) { var a = s * .5, b = s * .3; return [[cx - a, cy - b], [cx + a, cy - b], [cx + a, cy + b], [cx - a, cy + b]]; },
    pentagon: function (cx, cy, s) { return S.regular(5, cx, cy + s * .04, s * .5); },
    hexagon: function (cx, cy, s) { return S.regular(6, cx, cy, s * .5, 0); },
    heptagon: function (cx, cy, s) { return S.regular(7, cx, cy, s * .5); },
    octagon: function (cx, cy, s) { return S.regular(8, cx, cy, s * .5, 22.5); },
    rhombus: function (cx, cy, s) { return [[cx, cy - s * .5], [cx + s * .32, cy], [cx, cy + s * .5], [cx - s * .32, cy]]; },
    trapezoid: function (cx, cy, s) { return [[cx - s * .25, cy - s * .28], [cx + s * .25, cy - s * .28], [cx + s * .5, cy + s * .28], [cx - s * .5, cy + s * .28]]; },
    parallelogram: function (cx, cy, s) { return [[cx - s * .3, cy - s * .28], [cx + s * .5, cy - s * .28], [cx + s * .3, cy + s * .28], [cx - s * .5, cy + s * .28]]; },
    kite: function (cx, cy, s) { return [[cx, cy - s * .5], [cx + s * .3, cy - s * .12], [cx, cy + s * .5], [cx - s * .3, cy - s * .12]]; },
    right_triangle: function (cx, cy, s) { return [[cx - s * .4, cy - s * .4], [cx - s * .4, cy + s * .4], [cx + s * .4, cy + s * .4]]; },
    equilateral: function (cx, cy, s) { return S.regular(3, cx, cy + s * .1, s * .58); },
    isosceles: function (cx, cy, s) { return [[cx, cy - s * .5], [cx + s * .28, cy + s * .42], [cx - s * .28, cy + s * .42]]; },
    scalene: function (cx, cy, s) { return [[cx - s * .45, cy + s * .38], [cx + s * .48, cy + s * .38], [cx + s * .12, cy - s * .4]]; },
    obtuse_triangle: function (cx, cy, s) { return [[cx - s * .5, cy + s * .2], [cx + s * .5, cy + s * .2], [cx - s * .3, cy - s * .05]]; },
    acute_triangle: function (cx, cy, s) { return [[cx - s * .36, cy + s * .38], [cx + s * .4, cy + s * .38], [cx + s * .06, cy - s * .45]]; },
    right_isosceles: function (cx, cy, s) { return [[cx - s * .4, cy - s * .4], [cx - s * .4, cy + s * .4], [cx + s * .4, cy + s * .4]]; }
  };
  S.SHAPE_SIDES = { triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8, rhombus: 4, trapezoid: 4, parallelogram: 4, kite: 4, circle: 0, oval: 0, semicircle: 1, star: 10, heart: 0, right_triangle: 3, equilateral: 3, isosceles: 3, scalene: 3, obtuse_triangle: 3, acute_triangle: 3 };
  S.shapeEl = function (kind, cx, cy, s, fill, rot) {
    fill = fill || '#A68BFF';
    var tr = rot ? ' transform="rotate(' + rot + ' ' + r1(cx) + ' ' + r1(cy) + ')"' : '', st = ' stroke="#23233A" stroke-width="3" stroke-linejoin="round"';
    if (kind === 'circle') return '<circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(s * .45) + '" fill="' + fill + '"' + st + '/>';
    if (kind === 'oval') return '<ellipse cx="' + r1(cx) + '" cy="' + r1(cy) + '" rx="' + r1(s * .5) + '" ry="' + r1(s * .3) + '" fill="' + fill + '"' + st + tr + '/>';
    if (kind === 'semicircle') return '<path d="M' + r1(cx - s * .45) + ' ' + r1(cy + s * .2) + ' A' + r1(s * .45) + ' ' + r1(s * .45) + ' 0 0 1 ' + r1(cx + s * .45) + ' ' + r1(cy + s * .2) + 'Z" fill="' + fill + '"' + st + tr + '/>';
    if (kind === 'star') { var o = []; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? s * .22 : s * .5; o.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); } return '<polygon points="' + pts(o) + '" fill="' + fill + '"' + st + tr + '/>'; }
    if (kind === 'heart') return '<path d="M' + r1(cx) + ' ' + r1(cy + s * .42) + ' C' + r1(cx - s * .6) + ' ' + r1(cy) + ' ' + r1(cx - s * .4) + ' ' + r1(cy - s * .5) + ' ' + r1(cx) + ' ' + r1(cy - s * .2) + ' C' + r1(cx + s * .4) + ' ' + r1(cy - s * .5) + ' ' + r1(cx + s * .6) + ' ' + r1(cy) + ' ' + r1(cx) + ' ' + r1(cy + s * .42) + 'Z" fill="' + fill + '"' + st + tr + '/>';
    var f = SHAPE_PTS[kind] || SHAPE_PTS.square;
    return '<polygon points="' + pts(f(cx, cy, s)) + '" fill="' + fill + '"' + st + tr + '/>';
  };
  S.shape = function (kind, o) {
    o = o || {};
    var s = o.size || 100;
    return S.wrap(s + 20, s + 20, S.shapeEl(kind, (s + 20) / 2, (s + 20) / 2, s, o.fill, o.rot), { width: o.width || s + 20, label: o.label || '' });
  };
  S.shapePoints = function (kind, cx, cy, s) { return (SHAPE_PTS[kind] || SHAPE_PTS.square)(cx, cy, s); };

  /* ------------------------------------------------------------- 3D solids */
  S.SOLIDS = {
    cube: { faces: 6, edges: 12, vertices: 8 }, cuboid: { faces: 6, edges: 12, vertices: 8 }, tri_prism: { faces: 5, edges: 9, vertices: 6 },
    sq_pyramid: { faces: 5, edges: 8, vertices: 5 }, tri_pyramid: { faces: 4, edges: 6, vertices: 4 }, cylinder: { curved: true }, cone: { curved: true }, sphere: { curved: true }
  };
  S.solid = function (kind, o) {
    o = o || {};
    var c = o.fill || '#7FC8F8', d = '#4E9BD1', l = '#B6E1FF', st = ' stroke="#23233A" stroke-width="2.5" stroke-linejoin="round"', hid = ' stroke="#23233A" stroke-width="2" stroke-dasharray="5 4" fill="none"', g = '';
    switch (kind) {
      case 'cube': g = S.poly([[30, 60], [110, 60], [110, 140], [30, 140]], c) + S.poly([[30, 60], [60, 30], [140, 30], [110, 60]], l) + S.poly([[110, 60], [140, 30], [140, 110], [110, 140]], d) + '<path d="M30 140 L60 110 L140 110 M60 110 L60 30"' + hid + '/>'; break;
      case 'cuboid': g = S.poly([[20, 70], [130, 70], [130, 140], [20, 140]], c) + S.poly([[20, 70], [50, 40], [160, 40], [130, 70]], l) + S.poly([[130, 70], [160, 40], [160, 110], [130, 140]], d) + '<path d="M20 140 L50 110 L160 110 M50 110 L50 40"' + hid + '/>'; break;
      case 'tri_prism': g = S.poly([[30, 140], [70, 70], [110, 140]], c) + S.poly([[70, 70], [130, 40], [170, 110], [110, 140]], d) + '<path d="M30 140 L90 110 L170 110 M90 110 L130 40"' + hid + '/>'; break;
      case 'sq_pyramid': g = S.poly([[30, 130], [110, 130], [90, 25]], c) + S.poly([[110, 130], [150, 105], [90, 25]], d) + '<path d="M30 130 L70 105 L150 105 M70 105 L90 25"' + hid + '/>'; break;
      case 'tri_pyramid': g = S.poly([[30, 135], [120, 135], [85, 25]], c) + S.poly([[120, 135], [150, 105], [85, 25]], d) + '<path d="M30 135 L150 105"' + hid + '/>'; break;
      case 'cylinder': g = '<path d="M40 40 V130 A50 14 0 0 0 140 130 V40" fill="' + c + '"' + st + '/><ellipse cx="90" cy="40" rx="50" ry="14" fill="' + l + '"' + st + '/><path d="M40 130 A50 14 0 0 1 140 130"' + hid + '/>'; break;
      case 'cone': g = '<path d="M90 20 L40 130 A50 14 0 0 0 140 130 Z" fill="' + c + '"' + st + '/><path d="M40 130 A50 14 0 0 1 140 130"' + hid + '/>'; break;
      case 'sphere': g = '<circle cx="90" cy="85" r="58" fill="' + c + '"' + st + '/><path d="M32 85 A58 16 0 0 0 148 85"  stroke="#23233A" stroke-width="2" fill="none"/><path d="M32 85 A58 16 0 0 1 148 85"' + hid + '/><ellipse cx="68" cy="60" rx="14" ry="9" fill="#fff" opacity=".5"/>'; break;
    }
    return S.wrap(180, 160, g, { width: o.width || 180, label: o.label || '' });
  };

  /* ------------------------------------------------------------- fractions */
  S.pizza = function (d, shaded, o) {
    o = o || {};
    var R = 100, C = 110, sh = {}, g = '';
    (shaded || []).forEach(function (i) { sh[i] = 1; });
    g += '<circle cx="' + C + '" cy="' + C + '" r="' + (R + 6) + '" fill="#E3A857"/>';
    for (var i = 0; i < d; i++) {
      var a0 = -Math.PI / 2 + i * 2 * Math.PI / d, a1 = a0 + 2 * Math.PI / d, large = (a1 - a0) > Math.PI ? 1 : 0;
      var x0 = C + R * Math.cos(a0), y0 = C + R * Math.sin(a0), x1 = C + R * Math.cos(a1), y1 = C + R * Math.sin(a1);
      var path = d === 1 ? '<circle cx="' + C + '" cy="' + C + '" r="' + R + '"' : '<path d="M' + C + ' ' + C + ' L' + r1(x0) + ' ' + r1(y0) + ' A' + R + ' ' + R + ' 0 ' + large + ' 1 ' + r1(x1) + ' ' + r1(y1) + ' Z"';
      g += path + ' class="slice" data-i="' + i + '" fill="' + (sh[i] ? (o.color || '#FFB020') : '#FFF1CF') + '" stroke="#B9772B" stroke-width="3"/>';
      if (sh[i] && o.toppings !== false) {
        var am = (a0 + a1) / 2;
        g += '<circle cx="' + r1(C + R * .55 * Math.cos(am)) + '" cy="' + r1(C + R * .55 * Math.sin(am)) + '" r="' + Math.max(4, 13 - d) + '" fill="#D84315" pointer-events="none"/>';
      }
    }
    return S.wrap(220, 220, g, { width: o.width || 220, label: o.label || '' });
  };
  S.fracBar = function (d, shaded, o) {
    o = o || {};
    var W = o.w || 300, H = o.h || 60, sh = {}, g = '', cw = W / d;
    (shaded || []).forEach(function (i) { sh[i] = 1; });
    for (var i = 0; i < d; i++) g += '<rect class="slice" data-i="' + i + '" x="' + r1(5 + i * cw) + '" y="5" width="' + r1(cw) + '" height="' + H + '" fill="' + (sh[i] ? (o.color || '#8B5A2B') : '#F5E6D3') + '" stroke="#5D3A1A" stroke-width="3"/>';
    return S.wrap(W + 10, H + 10, g, { width: o.width || W + 10, label: o.label || '' });
  };
  S.fracGrid = function (rows, cols, shaded, o) {
    o = o || {};
    var c = o.cell || 30, g = '', n = 0, sh = {};
    (shaded || []).forEach(function (i) { sh[i] = 1; });
    for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++, n++) g += '<rect class="slice" data-i="' + n + '" x="' + (4 + k * c) + '" y="' + (4 + r * c) + '" width="' + c + '" height="' + c + '" fill="' + (sh[n] ? (o.color || '#3BB7F0') : '#fff') + '" stroke="#5B6B86" stroke-width="1.5"/>';
    g += '<rect x="4" y="4" width="' + cols * c + '" height="' + rows * c + '" fill="none" stroke="#23233A" stroke-width="3"/>';
    return S.wrap(cols * c + 8, rows * c + 8, g, { width: o.width || cols * c + 8, label: o.label || '' });
  };
  /* shapes cut into parts: equal or unequal (for "equal parts" questions) */
  S.cutShape = function (kind, parts, equal, o) {
    o = o || {};
    var g = '', fill = o.fill || '#FFE08A';
    if (kind === 'circle') {
      if (equal) return S.pizza(parts, [], { toppings: false, width: o.width || 150 });
      g = '<circle cx="80" cy="80" r="70" fill="' + fill + '" stroke="#23233A" stroke-width="3"/>' + (parts === 2 ? '<path d="M40 22 L40 138" stroke="#23233A" stroke-width="3"/>' : '<path d="M80 10 L80 80 L140 115 M80 80 L36 135" stroke="#23233A" stroke-width="3"/>');
      return S.wrap(160, 160, g, { width: o.width || 150 });
    }
    var W = 200, H = 120, cuts = [];
    if (equal) for (var i = 1; i < parts; i++) cuts.push(W * i / parts);
    else { var fr = parts === 2 ? [.3] : parts === 3 ? [.2, .62] : [.15, .45, .62]; cuts = fr.map(function (x) { return W * x; }); }
    g = '<rect x="10" y="10" width="' + W + '" height="' + H + '" fill="' + fill + '" stroke="#23233A" stroke-width="3"/>' + cuts.map(function (x) { return '<path d="M' + r1(10 + x) + ' 10 V' + (10 + H) + '" stroke="#23233A" stroke-width="3"/>'; }).join('');
    return S.wrap(W + 20, H + 20, g, { width: o.width || 180 });
  };
  S.fracHTML = function (n, d) { return '<span class="frac math"><span>' + n + '</span><span>' + d + '</span></span>'; };

  /* ------------------------------------------------------------- number line */
  S.numberLine = function (o) {
    var min = o.min, max = o.max, step = o.step || 1, W = o.width || 640, pad = 30, H = o.hops ? 130 : 90, y = H - 40;
    var span = max - min, X = function (v) { return pad + (v - min) / span * (W - 2 * pad); }, g = '';
    g += '<path d="M' + (pad - 14) + ' ' + y + ' H' + (W - pad + 14) + '" stroke="#23233A" stroke-width="3"/>';
    g += '<path d="M' + (W - pad + 14) + ' ' + y + ' l-8 -6 v12z" fill="#23233A"/>';
    var n = Math.round(span / step), every = o.labelEvery || (n > 20 ? Math.ceil(n / 10) : 1);
    for (var i = 0; i <= n; i++) {
      var v = min + i * step, x = X(v), major = i % every === 0;
      g += '<path d="M' + r1(x) + ' ' + (y - (major ? 10 : 6)) + ' V' + (y + (major ? 10 : 6)) + '" stroke="#23233A" stroke-width="' + (major ? 2.5 : 1.5) + '"/>';
      if (major && o.labels !== false) g += S.text(x, y + 24, o.fmt ? o.fmt(v) : u_num(v), { size: 15, weight: 600 });
    }
    (o.hops || []).forEach(function (hp, k) {
      var x0 = X(hp.from), x1 = X(hp.to), mid = (x0 + x1) / 2, top = y - 30 - Math.min(34, Math.abs(x1 - x0) * .25);
      g += '<path d="M' + r1(x0) + ' ' + (y - 6) + ' Q' + r1(mid) + ' ' + r1(top) + ' ' + r1(x1) + ' ' + (y - 6) + '" stroke="' + (hp.color || COLORS[k % COLORS.length]) + '" stroke-width="3" fill="none" marker-end="url(#arr)"/>';
      if (hp.label) g += S.text(mid, top - 4, hp.label, { size: 14, fill: hp.color || '#5835DF' });
    });
    (o.marks || []).forEach(function (m) {
      var x = X(m.v);
      g += '<circle cx="' + r1(x) + '" cy="' + y + '" r="8" fill="' + (m.color || '#FF7A7A') + '" stroke="#fff" stroke-width="2"/>';
      if (m.label) g += S.text(x, y - 22, m.label, { size: 16, fill: m.color || '#D64545' });
    });
    var defs = '<defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#5835DF"/></marker></defs>';
    return S.wrap(W, H, defs + g, { width: o.widthPx || W, label: o.label || '' });
  };
  function u_num(v) { return MA.u && MA.u.num ? MA.u.num(v) : String(v); }

  /* ------------------------------------------------------------- counting visuals */
  S.dots = function (n, o) {
    o = o || {};
    var per = o.per || 5, c = 26, g = '', rows = Math.ceil(n / per);
    for (var i = 0; i < n; i++) g += '<circle cx="' + (16 + (i % per) * c) + '" cy="' + (16 + Math.floor(i / per) * c) + '" r="10" fill="' + (o.color || '#FF7A7A') + '"/>';
    return S.wrap(per * c + 6, rows * c + 6, g, { width: o.width });
  };
  S.tenFrame = function (n, o) {
    o = o || {};
    var g = '', c = 40, frames = Math.max(1, Math.ceil(n / 10));
    for (var f = 0; f < frames; f++) {
      var oy = f * (2 * c + 14);
      for (var i = 0; i < 10; i++) {
        var x = 4 + (i % 5) * c, y = 4 + oy + Math.floor(i / 5) * c, k = f * 10 + i;
        g += '<rect x="' + x + '" y="' + y + '" width="' + c + '" height="' + c + '" fill="#fff" stroke="#5B6B86" stroke-width="2"/>';
        if (k < n) g += '<circle cx="' + (x + c / 2) + '" cy="' + (y + c / 2) + '" r="14" fill="' + (o.color || '#3BB7F0') + '"/>';
      }
    }
    return S.wrap(5 * c + 8, frames * (2 * c + 14) - 6, g, { width: o.width });
  };
  S.dice = function (n, o) {
    o = o || {};
    var P = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[28, 28], [50, 50], [72, 72]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]], 6: [[28, 25], [72, 25], [28, 50], [72, 50], [28, 75], [72, 75]] };
    var g = '<rect x="4" y="4" width="92" height="92" rx="18" fill="#fff" stroke="#23233A" stroke-width="3"/>' + (P[n] || []).map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#23233A"/>'; }).join('');
    return S.wrap(100, 100, g, { width: o.width || 70 });
  };
  /* base-ten blocks: thousands, hundreds (flats), tens (rods), ones */
  S.baseTen = function (th, hu, te, on, o) {
    o = o || {};
    var g = '', x = 6, H = 110;
    for (var a = 0; a < th; a++) { g += '<rect x="' + (x + 8) + '" y="' + (H - 80) + '" width="64" height="64" fill="#FFB3B3" stroke="#B23A3A" stroke-width="2"/><rect x="' + x + '" y="' + (H - 72) + '" width="64" height="64" fill="#FF7A7A" stroke="#B23A3A" stroke-width="2"/>'; x += 80; }
    for (var b = 0; b < hu; b++) { g += '<rect x="' + x + '" y="' + (H - 64) + '" width="60" height="60" fill="#FFC93C" stroke="#B68400" stroke-width="2"/>' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { return '<path d="M' + (x + i * 6) + ' ' + (H - 64) + ' v60 M' + x + ' ' + (H - 64 + i * 6) + ' h60" stroke="#B68400" stroke-width=".8"/>'; }).join(''); x += 68; }
    for (var c = 0; c < te; c++) { g += '<rect x="' + x + '" y="' + (H - 100) + '" width="10" height="100" fill="#3BB7F0" stroke="#1E7FB0" stroke-width="2"/>' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { return '<path d="M' + x + ' ' + (H - 100 + i * 10) + ' h10" stroke="#1E7FB0" stroke-width=".8"/>'; }).join(''); x += 15; }
    if (te) x += 6;
    for (var d = 0; d < on; d++) { g += '<rect x="' + (x + (d % 3) * 13) + '" y="' + (H - 12 - Math.floor(d / 3) * 13) + '" width="10" height="10" fill="#2BC79A" stroke="#168A69" stroke-width="2"/>'; }
    if (on) x += 42;
    return S.wrap(Math.max(x + 4, 60), H + 4, g, { width: o.width, label: o.label || '' });
  };
  S.arrayDots = function (rows, cols, o) {
    o = o || {};
    var c = o.cell || 30, g = '';
    for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++) g += '<circle cx="' + (18 + k * c) + '" cy="' + (18 + r * c) + '" r="' + (c * .36) + '" fill="' + (o.color || '#FF7A7A') + '"/>';
    if (o.emoji) { g = ''; for (var r2 = 0; r2 < rows; r2++) for (var k2 = 0; k2 < cols; k2++) g += S.emoji(18 + k2 * c, 18 + r2 * c, o.emoji, c * .8); }
    return S.wrap(cols * c + 6, rows * c + 6, g, { width: o.width, label: o.label || '' });
  };
  S.groups = function (groups, per, emoji, o) {
    o = o || {};
    var g = '', bw = Math.max(70, Math.ceil(Math.sqrt(per)) * 28 + 20), cols = Math.min(groups, o.cols || 5), rowsN = Math.ceil(groups / cols), bh = Math.ceil(per / Math.ceil(Math.sqrt(per))) * 28 + 26;
    for (var i = 0; i < groups; i++) {
      var gx = 6 + (i % cols) * (bw + 12), gy = 6 + Math.floor(i / cols) * (bh + 12), pc = Math.ceil(Math.sqrt(per));
      g += '<rect x="' + gx + '" y="' + gy + '" width="' + bw + '" height="' + bh + '" rx="18" fill="#FFF3D9" stroke="#F0C66B" stroke-width="3"/>';
      for (var k = 0; k < per; k++) g += S.emoji(gx + 22 + (k % pc) * 28, gy + 24 + Math.floor(k / pc) * 28, emoji, 22);
    }
    return S.wrap(cols * (bw + 12) + 2, rowsN * (bh + 12) + 2, g, { width: o.width, label: o.label || '' });
  };
  S.areaModel = function (a, b, o) {
    o = o || {};
    var at = Math.floor(a / 10) * 10, ao = a % 10, bt = b >= 10 ? Math.floor(b / 10) * 10 : 0, bo = b >= 10 ? b % 10 : b;
    var colsA = [at, ao].filter(Boolean), colsB = (bt ? [bt, bo] : [bo]).filter(Boolean);
    var W = 320, H = 200, g = '', xs = [], ys = [], totA = a, totB = b;
    var x = 40; colsA.forEach(function (v) { var w = Math.max(50, W * v / totA); xs.push([x, w, v]); x += w; });
    var y = 30; colsB.forEach(function (v) { var hh = Math.max(46, H * v / totB); ys.push([y, hh, v]); y += hh; });
    ys.forEach(function (row, ri) {
      xs.forEach(function (col, ci) {
        g += '<rect x="' + r1(col[0]) + '" y="' + r1(row[0]) + '" width="' + r1(col[1]) + '" height="' + r1(row[1]) + '" fill="' + COLORS[(ri * 2 + ci) % COLORS.length] + '" fill-opacity=".35" stroke="#23233A" stroke-width="2"/>';
        if (o.products) g += S.text(col[0] + col[1] / 2, row[0] + row[1] / 2, u_num(col[2] * row[2]), { size: 16 });
      });
      g += S.text(22, row[0] + row[1] / 2, u_num(row[2]), { size: 16, fill: '#5835DF' });
    });
    xs.forEach(function (col) { g += S.text(col[0] + col[1] / 2, 16, u_num(col[2]), { size: 16, fill: '#5835DF' }); });
    return S.wrap(x + 10, y + 10, g, { width: o.width || Math.min(360, x + 10) });
  };

  /* ------------------------------------------------------------- clock */
  S.clock = function (h, m, o) {
    o = o || {};
    var C = 100, g = '<circle cx="100" cy="100" r="94" fill="#fff" stroke="#6C4CF1" stroke-width="8"/>';
    for (var i = 0; i < 60; i++) {
      var a = i * 6 * Math.PI / 180, big = i % 5 === 0, r0 = big ? 76 : 82;
      if (!big && o.minuteTicks === false) continue;
      g += '<path d="M' + r1(C + r0 * Math.sin(a)) + ' ' + r1(C - r0 * Math.cos(a)) + ' L' + r1(C + 88 * Math.sin(a)) + ' ' + r1(C - 88 * Math.cos(a)) + '" stroke="#23233A" stroke-width="' + (big ? 3 : 1.2) + '"/>';
    }
    for (var n = 1; n <= 12; n++) { var b = n * 30 * Math.PI / 180; g += S.text(C + 63 * Math.sin(b), C - 63 * Math.cos(b) + 1, String(n), { size: 18, weight: 800 }); }
    if (o.hands !== false) {
      var ha = ((h % 12) + m / 60) * 30, ma = m * 6;
      g += '<line class="hand hour" x1="100" y1="100" x2="' + r1(C + 44 * Math.sin(ha * Math.PI / 180)) + '" y2="' + r1(C - 44 * Math.cos(ha * Math.PI / 180)) + '" stroke="#23233A" stroke-width="8" stroke-linecap="round"/>';
      g += '<line class="hand minute" x1="100" y1="100" x2="' + r1(C + 70 * Math.sin(ma * Math.PI / 180)) + '" y2="' + r1(C - 70 * Math.cos(ma * Math.PI / 180)) + '" stroke="#FF7A7A" stroke-width="5" stroke-linecap="round"/>';
    }
    g += '<circle cx="100" cy="100" r="7" fill="#23233A"/>';
    return S.wrap(200, 200, g, { width: o.width || 200, label: o.label || '' });
  };

  /* ------------------------------------------------------------- money */
  S.CURRENCIES = {
    ILS: { sym: '₪', sub: 'ag', coins: [10, 50, 100, 200, 500, 1000], bills: [2000, 5000, 10000, 20000] },
    USD: { sym: '$', sub: '¢', coins: [1, 5, 10, 25, 100], bills: [100, 500, 1000, 2000] }
  };
  S.moneyLabel = function (v, cur) {
    if (cur === 'USD') return v < 100 ? v + '¢' : '$' + (v % 100 ? (v / 100).toFixed(2) : v / 100);
    return v < 100 ? v + ' ag' : '₪' + (v % 100 ? (v / 100).toFixed(2) : v / 100);
  };
  S.coin = function (v, cur, o) {
    o = o || {};
    var c = S.CURRENCIES[cur], isBill = c.bills.indexOf(v) >= 0, g, label;
    if (isBill) {
      var colors = cur === 'ILS' ? { 2000: '#E57373', 5000: '#81C784', 10000: '#FFB74D', 20000: '#64B5F6' } : { 100: '#A5D6A7', 500: '#9CCC65', 1000: '#AED581', 2000: '#81C784' };
      label = cur === 'ILS' ? '₪' + v / 100 : '$' + v / 100;
      g = '<rect x="3" y="3" width="114" height="60" rx="8" fill="' + colors[v] + '" stroke="#37474F" stroke-width="2.5"/><rect x="10" y="10" width="100" height="46" rx="5" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>' +
        '<circle cx="34" cy="33" r="14" fill="#fff" opacity=".55"/>' + S.text(80, 34, label, { size: 22, weight: 900, fill: '#263238' });
      return S.wrap(120, 66, g, { width: o.width || 96, label: label });
    }
    label = S.moneyLabel(v, cur);
    var r = cur === 'ILS' ? { 10: 24, 50: 27, 100: 26, 200: 29, 500: 31, 1000: 30 }[v] : { 1: 25, 5: 28, 10: 23, 25: 31, 100: 33 }[v];
    var fill = cur === 'ILS' ? (v <= 50 ? '#E0A458' : v === 1000 ? '#F5D061' : '#CFD8DC') : (v === 1 ? '#D08A5A' : v === 100 ? '#E5C76B' : '#CFD8DC');
    var ring = cur === 'ILS' && v === 1000 ? '<circle cx="36" cy="36" r="' + (r - 7) + '" fill="#CFD8DC"/>' : '';
    var shape = cur === 'ILS' && v === 500 ? '<polygon points="' + pts(S.regular(12, 36, 36, r)) + '" fill="' + fill + '" stroke="#78909C" stroke-width="2.5"/>' : '<circle cx="36" cy="36" r="' + r + '" fill="' + fill + '" stroke="#8D6E63" stroke-width="2.5"/>';
    var txt = cur === 'ILS' ? (v < 100 ? String(v) : String(v / 100)) : (v < 100 ? v + '¢' : '$1');
    g = shape + ring + '<circle cx="36" cy="36" r="' + (r - 4) + '" fill="none" stroke="#fff" stroke-width="1.5" opacity=".6"/>' + S.text(36, cur === 'ILS' && v < 100 ? 33 : 37, txt, { size: txt.length > 2 ? 15 : 19, weight: 900, fill: '#37474F' }) +
      (cur === 'ILS' ? S.text(36, v < 100 ? 49 : 52, v < 100 ? 'ag' : '₪', { size: 10, weight: 700, fill: '#37474F' }) : '');
    return S.wrap(72, 72, g, { width: o.width || 60, label: label });
  };

  /* ------------------------------------------------------------- measuring */
  var OBJ = { pencil: '#FFC93C', crayon: '#FF7A7A', ribbon: '#A68BFF', key: '#B0BEC5', leaf: '#5CC160', worm: '#FF8FC7', stick: '#A1887F' };
  S.ruler = function (o) {
    var len = o.len, cm = 30, x0 = 20, W = len * cm + 2 * x0, g = '', H = 120;
    var ox = x0 + (o.start || 0) * cm, ow = o.objLen * cm, col = OBJ[o.obj] || '#FFC93C';
    if (o.obj === 'pencil') g += '<rect x="' + ox + '" y="16" width="' + (ow - 22) + '" height="26" fill="' + col + '" stroke="#23233A" stroke-width="2"/><polygon points="' + (ox + ow - 22) + ',16 ' + (ox + ow) + ',29 ' + (ox + ow - 22) + ',42" fill="#F5D6A0" stroke="#23233A" stroke-width="2"/><polygon points="' + (ox + ow - 7) + ',25 ' + (ox + ow) + ',29 ' + (ox + ow - 7) + ',33" fill="#23233A"/><rect x="' + ox + '" y="16" width="10" height="26" fill="#FF8FA3" stroke="#23233A" stroke-width="2"/>';
    else g += '<rect x="' + ox + '" y="18" width="' + ow + '" height="22" rx="11" fill="' + col + '" stroke="#23233A" stroke-width="2"/>';
    g += '<path d="M' + ox + ' 44 V58 M' + (ox + ow) + ' 44 V58" stroke="#5835DF" stroke-width="1.5" stroke-dasharray="3 3"/>';
    g += '<rect x="6" y="58" width="' + (W - 12) + '" height="52" rx="6" fill="#FFF3C4" stroke="#C9A227" stroke-width="2"/>';
    for (var i = 0; i <= len; i++) {
      var x = x0 + i * cm;
      g += '<path d="M' + x + ' 58 v18" stroke="#23233A" stroke-width="2"/>' + S.text(x, 92, String(i), { size: 14 });
      if (i < len && o.unit === 'mm') for (var k = 1; k < 10; k++) g += '<path d="M' + r1(x + k * cm / 10) + ' 58 v' + (k === 5 ? 12 : 7) + '" stroke="#23233A" stroke-width="1"/>';
      else if (i < len) g += '<path d="M' + (x + cm / 2) + ' 58 v10" stroke="#23233A" stroke-width="1.2"/>';
    }
    g += S.text(W - 14, 103, 'cm', { size: 11, anchor: 'end', weight: 600 });
    return S.wrap(W, H, g, { width: o.width || Math.min(W, 640), label: '' });
  };
  S.dial = function (o) {
    /* kitchen scale (mass) with a needle */
    var max = o.max, step = o.step, val = o.value, g = '', C = [130, 130], R = 100;
    g += '<rect x="20" y="150" width="220" height="40" rx="12" fill="#90A4AE"/><path d="M30 130 A100 100 0 0 1 230 130 Z" fill="#fff" stroke="#546E7A" stroke-width="5"/>';
    var n = Math.round(max / step);
    for (var i = 0; i <= n; i++) {
      var v = i * step, a = Math.PI + (v / max) * Math.PI, major = o.labelEvery ? (i % o.labelEvery === 0) : true;
      g += '<path d="M' + r1(C[0] + (R - (major ? 16 : 9)) * Math.cos(a)) + ' ' + r1(C[1] + (R - (major ? 16 : 9)) * Math.sin(a)) + ' L' + r1(C[0] + (R - 2) * Math.cos(a)) + ' ' + r1(C[1] + (R - 2) * Math.sin(a)) + '" stroke="#23233A" stroke-width="' + (major ? 2.5 : 1.2) + '"/>';
      if (major) g += S.text(C[0] + (R - 30) * Math.cos(a), C[1] + (R - 30) * Math.sin(a), u_num(v), { size: 12 });
    }
    var av = Math.PI + (val / max) * Math.PI;
    g += '<path d="M' + C[0] + ' ' + C[1] + ' L' + r1(C[0] + (R - 14) * Math.cos(av)) + ' ' + r1(C[1] + (R - 14) * Math.sin(av)) + '" stroke="#E53935" stroke-width="4" stroke-linecap="round"/><circle cx="' + C[0] + '" cy="' + C[1] + '" r="7" fill="#E53935"/>';
    g += S.text(130, 112, o.unit, { size: 14, fill: '#546E7A' }) + (o.item ? S.emoji(130, 172, o.item, 26) : '');
    return S.wrap(260, 196, g, { width: o.width || 260 });
  };
  S.jug = function (o) {
    var max = o.max, step = o.step, val = o.value, g = '', top = 30, bot = 210, X0 = 60, X1 = 170;
    var Y = function (v) { return bot - (v / max) * (bot - top); };
    g += '<path d="M' + X0 + ' ' + top + ' V' + bot + ' Q' + X0 + ' ' + (bot + 10) + ' ' + (X0 + 10) + ' ' + (bot + 10) + ' H' + (X1 - 10) + ' Q' + X1 + ' ' + (bot + 10) + ' ' + X1 + ' ' + bot + ' V' + top + '" fill="#F1F8FF" stroke="#546E7A" stroke-width="4"/>';
    g += '<rect x="' + (X0 + 2) + '" y="' + r1(Y(val)) + '" width="' + (X1 - X0 - 4) + '" height="' + r1(bot - Y(val) + 8) + '" fill="#4FC3F7" opacity=".75"/>';
    var n = Math.round(max / step);
    for (var i = 1; i <= n; i++) {
      var v = i * step, y = Y(v), major = o.labelEvery ? i % o.labelEvery === 0 : true;
      g += '<path d="M' + X0 + ' ' + r1(y) + ' h' + (major ? 22 : 12) + '" stroke="#23233A" stroke-width="' + (major ? 2.5 : 1.2) + '"/>';
      if (major) g += S.text(X0 + 28, y, u_num(v), { size: 12, anchor: 'start' });
    }
    g += '<path d="M' + X1 + ' 60 q30 0 30 40 q0 40 -30 40" stroke="#546E7A" stroke-width="6" fill="none"/>' + S.text(115, 18, o.unit, { size: 14, fill: '#546E7A' });
    return S.wrap(220, 230, g, { width: o.width || 190 });
  };
  S.thermo = function (o) {
    var min = o.min, max = o.max, step = o.step, val = o.value, top = 20, bot = 230, g = '', X = 60;
    var Y = function (v) { return bot - (v - min) / (max - min) * (bot - top); };
    g += '<rect x="' + (X - 10) + '" y="' + (top - 10) + '" width="20" height="' + (bot - top + 20) + '" rx="10" fill="#fff" stroke="#546E7A" stroke-width="3"/><circle cx="' + X + '" cy="' + (bot + 22) + '" r="18" fill="#E53935" stroke="#546E7A" stroke-width="3"/>';
    g += '<rect x="' + (X - 5) + '" y="' + r1(Y(val)) + '" width="10" height="' + r1(bot + 12 - Y(val)) + '" fill="#E53935"/>';
    for (var v = min; v <= max + 1e-9; v += step) {
      var y = Y(v), major = (v % (o.labelEvery || 10)) === 0;
      g += '<path d="M' + (X + 12) + ' ' + r1(y) + ' h' + (major ? 16 : 8) + '" stroke="#23233A" stroke-width="' + (major ? 2 : 1) + '"/>';
      if (major) g += S.text(X + 34, y, u_num(v), { size: 12, anchor: 'start' });
    }
    g += S.text(X + 50, top - 2, '°C', { size: 13, fill: '#546E7A' });
    return S.wrap(130, 270, g, { width: o.width || 120 });
  };
  S.balance = function (left, right, heavier) {
    var tilt = heavier === 'left' ? -10 : heavier === 'right' ? 10 : 0, g = '';
    g += '<polygon points="130,190 112,206 148,206" fill="#78909C"/><rect x="126" y="80" width="8" height="112" fill="#78909C"/>';
    g += '<g transform="rotate(' + tilt + ' 130 80)"><rect x="30" y="76" width="200" height="8" rx="4" fill="#546E7A"/>' +
      '<path d="M40 84 L40 120 M220 84 L220 120" stroke="#546E7A" stroke-width="2"/>' +
      '<g transform="rotate(' + (-tilt) + ' 40 120)"><path d="M0 120 Q40 150 80 120Z" fill="#B0BEC5" stroke="#546E7A" stroke-width="2"/>' + S.emoji(40, 104, left, 36) + '</g>' +
      '<g transform="rotate(' + (-tilt) + ' 220 120)"><path d="M180 120 Q220 150 260 120Z" fill="#B0BEC5" stroke="#546E7A" stroke-width="2"/>' + S.emoji(220, 104, right, 36) + '</g></g>';
    return S.wrap(270, 210, g, { width: 270 });
  };

  /* ------------------------------------------------------------- charts */
  S.barChart = function (cats, o) {
    o = o || {};
    var max = o.max || Math.max.apply(null, cats.map(function (c) { return c.v; })), step = o.step || 1, W = Math.max(320, cats.length * 80 + 70), H = 260, x0 = 50, y0 = 210, top = 20, g = '';
    var Y = function (v) { return y0 - v / max * (y0 - top); };
    for (var v = 0; v <= max + 1e-9; v += step) {
      g += '<path d="M' + x0 + ' ' + r1(Y(v)) + ' H' + (W - 10) + '" stroke="#E3E1EE" stroke-width="1"/>' + S.text(x0 - 8, Y(v), u_num(v), { size: 12, anchor: 'end', weight: 600 });
    }
    g += '<path d="M' + x0 + ' ' + top + ' V' + y0 + ' H' + (W - 10) + '" stroke="#23233A" stroke-width="2" fill="none"/>';
    var bw = Math.min(50, (W - x0 - 20) / cats.length - 18);
    cats.forEach(function (c, i) {
      var cx = x0 + 18 + i * ((W - x0 - 20) / cats.length) + bw / 2;
      g += '<rect x="' + r1(cx - bw / 2) + '" y="' + r1(Y(c.v)) + '" width="' + r1(bw) + '" height="' + r1(y0 - Y(c.v)) + '" rx="5" fill="' + (c.color || COLORS[i % COLORS.length]) + '"/>';
      g += (c.icon ? S.emoji(cx, y0 + 18, c.icon, 20) : '') + S.text(cx, y0 + (c.icon ? 40 : 18), c.label, { size: 12, weight: 600 });
    });
    if (o.title) g += S.text(W / 2, 10, o.title, { size: 13 });
    return S.wrap(W, H, g, { width: o.width || Math.min(W, 560) });
  };
  S.picto = function (cats, o) {
    o = o || {};
    var scale = o.scale || 1, W = 520, rowH = 46, g = '', maxN = 0;
    cats.forEach(function (c) { maxN = Math.max(maxN, Math.ceil(c.v / scale)); });
    var cell = Math.min(38, (W - 150) / Math.max(1, maxN));
    cats.forEach(function (c, i) {
      var y = 26 + i * rowH, n = c.v / scale;
      g += '<rect x="2" y="' + (y - 20) + '" width="' + (W - 4) + '" height="' + (rowH - 4) + '" rx="10" fill="' + (i % 2 ? '#FAF9FF' : '#F2EFFF') + '"/>';
      g += (c.icon ? S.emoji(22, y + 2, c.icon, 22) : '') + S.text(44, y + 2, c.label, { size: 14, anchor: 'start' });
      for (var k = 0; k < Math.floor(n); k++) g += S.emoji(150 + k * cell, y + 2, o.icon || c.icon, cell * .8);
      if (n % 1) g += '<g clip-path="inset(0 50% 0 0)">' + S.emoji(150 + Math.floor(n) * cell, y + 2, o.icon || c.icon, cell * .8) + '</g><rect x="' + r1(150 + Math.floor(n) * cell) + '" y="' + (y - 16) + '" width="' + r1(cell / 2 + 2) + '" height="34" fill="' + (i % 2 ? '#FAF9FF' : '#F2EFFF') + '"/>';
    });
    var H = 26 + cats.length * rowH;
    if (scale > 1) g += S.text(W - 10, H + 4, (o.keyText || ('= ' + scale)), { size: 13, anchor: 'end' }) + S.emoji(W - 10 - (o.keyText || '= ' + scale).length * 7 - 18, H + 4, o.icon || cats[0].icon, 18);
    return S.wrap(W, H + (scale > 1 ? 18 : 0), g, { width: o.width || W });
  };
  S.lineChart = function (pts2, o) {
    o = o || {};
    var max = o.max, step = o.step, W = Math.max(360, pts2.length * 70 + 60), H = 250, x0 = 46, y0 = 200, top = 20, g = '';
    var Y = function (v) { return y0 - v / max * (y0 - top); }, X = function (i) { return x0 + 30 + i * ((W - x0 - 50) / Math.max(1, pts2.length - 1)); };
    for (var v = 0; v <= max + 1e-9; v += step) g += '<path d="M' + x0 + ' ' + r1(Y(v)) + ' H' + (W - 10) + '" stroke="#E3E1EE"/>' + S.text(x0 - 8, Y(v), u_num(v), { size: 12, anchor: 'end', weight: 600 });
    g += '<path d="M' + x0 + ' ' + top + ' V' + y0 + ' H' + (W - 10) + '" stroke="#23233A" stroke-width="2" fill="none"/>';
    g += '<polyline points="' + pts2.map(function (p, i) { return r1(X(i)) + ',' + r1(Y(p.v)); }).join(' ') + '" fill="none" stroke="#6C4CF1" stroke-width="3.5" stroke-linejoin="round"/>';
    pts2.forEach(function (p, i) { g += '<circle cx="' + r1(X(i)) + '" cy="' + r1(Y(p.v)) + '" r="5.5" fill="#FF7A7A" stroke="#fff" stroke-width="2"/>' + S.text(X(i), y0 + 18, p.label, { size: 12, weight: 600 }); });
    if (o.unit) g += S.text(x0, 8, o.unit, { size: 12, anchor: 'start' });
    return S.wrap(W, H - 20, g, { width: o.width || Math.min(W, 560) });
  };
  S.tally = function (n) {
    var g = '', x = 6;
    for (var i = 0; i < Math.floor(n / 5); i++) { for (var k = 0; k < 4; k++) g += '<path d="M' + (x + k * 9) + ' 6 V36" stroke="#23233A" stroke-width="3" stroke-linecap="round"/>'; g += '<path d="M' + (x - 4) + ' 30 L' + (x + 31) + ' 12" stroke="#23233A" stroke-width="3" stroke-linecap="round"/>'; x += 46; }
    for (var j = 0; j < n % 5; j++) { g += '<path d="M' + (x + j * 9) + ' 6 V36" stroke="#23233A" stroke-width="3" stroke-linecap="round"/>'; }
    x += (n % 5) * 9;
    return S.wrap(Math.max(x + 6, 20), 42, g, { width: Math.max(x + 6, 20) });
  };

  /* ------------------------------------------------------------- angles & lines */
  S.angle = function (deg, o) {
    o = o || {};
    var C = [110, 120], L = 90, rot = o.rot || 0, a0 = -rot * Math.PI / 180, a1 = a0 - deg * Math.PI / 180, g = '';
    var p0 = [C[0] + L * Math.cos(a0), C[1] + L * Math.sin(a0)], p1 = [C[0] + L * Math.cos(a1), C[1] + L * Math.sin(a1)];
    if (Math.abs(deg - 90) < 0.01 && o.mark !== false) {
      var s = 16, q0 = [C[0] + s * Math.cos(a0), C[1] + s * Math.sin(a0)], q1 = [C[0] + s * Math.cos(a1), C[1] + s * Math.sin(a1)];
      g += '<path d="M' + r1(q0[0]) + ' ' + r1(q0[1]) + ' L' + r1(q0[0] + q1[0] - C[0]) + ' ' + r1(q0[1] + q1[1] - C[1]) + ' L' + r1(q1[0]) + ' ' + r1(q1[1]) + '" fill="none" stroke="#FF7A7A" stroke-width="2.5"/>';
    } else if (o.arc !== false) {
      var ar = 28, large = deg > 180 ? 1 : 0;
      g += '<path d="M' + r1(C[0] + ar * Math.cos(a0)) + ' ' + r1(C[1] + ar * Math.sin(a0)) + ' A' + ar + ' ' + ar + ' 0 ' + large + ' 0 ' + r1(C[0] + ar * Math.cos(a1)) + ' ' + r1(C[1] + ar * Math.sin(a1)) + '" fill="none" stroke="#FF7A7A" stroke-width="2.5"/>';
    }
    g += '<path d="M' + r1(p0[0]) + ' ' + r1(p0[1]) + ' L' + C[0] + ' ' + C[1] + ' L' + r1(p1[0]) + ' ' + r1(p1[1]) + '" fill="none" stroke="#23233A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="' + C[0] + '" cy="' + C[1] + '" r="4" fill="#23233A"/>';
    return S.wrap(220, 150, g, { width: o.width || 200, label: '' });
  };
  S.protractor = function (deg, o) {
    o = o || {};
    var C = [180, 175], R = 150, g = '<path d="M' + (C[0] - R) + ' ' + C[1] + ' A' + R + ' ' + R + ' 0 0 1 ' + (C[0] + R) + ' ' + C[1] + ' Z" fill="#E3F2FD" fill-opacity=".8" stroke="#1E88E5" stroke-width="2.5"/>';
    for (var d = 0; d <= 180; d += 5) {
      var a = Math.PI - d * Math.PI / 180, major = d % 10 === 0, l = d % 30 === 0 ? 18 : major ? 12 : 7;
      g += '<path d="M' + r1(C[0] + R * Math.cos(a)) + ' ' + r1(C[1] - R * Math.sin(a)) + ' L' + r1(C[0] + (R - l) * Math.cos(a)) + ' ' + r1(C[1] - (R - l) * Math.sin(a)) + '" stroke="#0D47A1" stroke-width="' + (major ? 1.6 : 1) + '"/>';
      if (d % 30 === 0) g += S.text(C[0] + (R - 32) * Math.cos(a), C[1] - (R - 32) * Math.sin(a), String(d), { size: 13, fill: '#0D47A1' });
    }
    var b = Math.PI - deg * Math.PI / 180;
    g += '<path d="M' + (C[0] - R - 10) + ' ' + C[1] + ' H' + C[0] + '" stroke="#23233A" stroke-width="4" stroke-linecap="round"/>';
    g += '<path d="M' + C[0] + ' ' + C[1] + ' L' + r1(C[0] + (R + 12) * Math.cos(b)) + ' ' + r1(C[1] - (R + 12) * Math.sin(b)) + '" stroke="#E53935" stroke-width="4" stroke-linecap="round"/>';
    g += '<circle cx="' + C[0] + '" cy="' + C[1] + '" r="5" fill="#23233A"/>';
    return S.wrap(360, 190, g, { width: o.width || 360 });
  };
  S.lineFig = function (kind, o) {
    o = o || {};
    var g = '', rot = o.rot || 0, st = ' stroke="#23233A" stroke-width="4" stroke-linecap="round"';
    var defs = '<defs><marker id="la" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#23233A"/></marker></defs>';
    switch (kind) {
      case 'line': g = '<path d="M20 60 H200"' + st + ' marker-start="url(#la)" marker-end="url(#la)"/>'; break;
      case 'ray': g = '<path d="M30 60 H200"' + st + ' marker-end="url(#la)"/><circle cx="30" cy="60" r="6" fill="#23233A"/>'; break;
      case 'segment': g = '<path d="M30 60 H190"' + st + '/><circle cx="30" cy="60" r="6" fill="#23233A"/><circle cx="190" cy="60" r="6" fill="#23233A"/>'; break;
      case 'parallel': g = '<path d="M20 35 H200 M20 85 H200"' + st + '/>'; break;
      case 'perp': g = '<path d="M20 60 H200 M110 10 V110"' + st + '/><path d="M110 46 H124 V60" fill="none" stroke="#FF7A7A" stroke-width="2.5"/>'; break;
      case 'intersect': g = '<path d="M30 100 L190 20 M30 30 L190 95"' + st + '/>'; break;
    }
    return S.wrap(220, 120, defs + '<g transform="rotate(' + rot + ' 110 60)">' + g + '</g>', { width: o.width || 200 });
  };

  /* ------------------------------------------------------------- grids & cubes */
  S.gridCells = function (cols, rows, cells, o) {
    o = o || {};
    var c = o.cell || 28, g = '', on = {};
    cells.forEach(function (p) { on[p[0] + ',' + p[1]] = 1; });
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) g += '<rect x="' + (4 + x * c) + '" y="' + (4 + y * c) + '" width="' + c + '" height="' + c + '" fill="' + (on[x + ',' + y] ? (o.color || '#7FC8F8') : '#fff') + '" stroke="#C9CEDA" stroke-width="1"/>';
    if (o.outline !== false) {
      cells.forEach(function (p) {
        var x = p[0], y = p[1], X = 4 + x * c, Y = 4 + y * c;
        if (!on[x + ',' + (y - 1)]) g += '<path d="M' + X + ' ' + Y + ' h' + c + '" stroke="#23233A" stroke-width="3" stroke-linecap="round"/>';
        if (!on[x + ',' + (y + 1)]) g += '<path d="M' + X + ' ' + (Y + c) + ' h' + c + '" stroke="#23233A" stroke-width="3" stroke-linecap="round"/>';
        if (!on[(x - 1) + ',' + y]) g += '<path d="M' + X + ' ' + Y + ' v' + c + '" stroke="#23233A" stroke-width="3" stroke-linecap="round"/>';
        if (!on[(x + 1) + ',' + y]) g += '<path d="M' + (X + c) + ' ' + Y + ' v' + c + '" stroke="#23233A" stroke-width="3" stroke-linecap="round"/>';
      });
    }
    return S.wrap(cols * c + 8, rows * c + 8, g, { width: o.width || cols * c + 8 });
  };
  S.rectDims = function (w, h, o) {
    o = o || {};
    var sc = Math.min(200 / w, 120 / h), W = Math.max(60, w * sc), H = Math.max(40, h * sc), g = '';
    g += '<rect x="40" y="20" width="' + r1(W) + '" height="' + r1(H) + '" fill="' + (o.fill || '#C5E8FF') + '" stroke="#23233A" stroke-width="3"/>';
    g += S.text(40 + W / 2, 20 + H + 20, o.wl != null ? o.wl : u_num(w) + ' ' + (o.unit || ''), { size: 15 });
    g += S.text(26, 20 + H / 2, o.hl != null ? o.hl : u_num(h) + ' ' + (o.unit || ''), { size: 15, anchor: 'end' });
    return S.wrap(W + 100, H + 50, g, { width: o.width || Math.min(360, W + 100) });
  };
  S.lShape = function (a, b, c, d, o) {
    /* L shape: full width a, full height b, notch cut from top-right: notch width c, notch height d */
    o = o || {};
    var sc = Math.min(200 / a, 150 / b), A = a * sc, B = b * sc, Cc = c * sc, D = d * sc, x = 50, y = 20, u = o.unit || '';
    var p = [[x, y], [x + A - Cc, y], [x + A - Cc, y + D], [x + A, y + D], [x + A, y + B], [x, y + B]], g = S.poly(p, '#FFE08A');
    g += S.text(x + A / 2, y + B + 18, u_num(a) + ' ' + u, { size: 14 }) + S.text(x - 8, y + B / 2, u_num(b) + ' ' + u, { size: 14, anchor: 'end' }) +
      S.text(x + (A - Cc) / 2, y - 10, u_num(a - c) + ' ' + u, { size: 14 }) + S.text(x + A + 8, y + D + (B - D) / 2, u_num(b - d) + ' ' + u, { size: 14, anchor: 'start' }) +
      S.text(x + A - Cc / 2, y + D - 8, u_num(c) + ' ' + u, { size: 13, fill: '#6B6B85' }) + S.text(x + A - Cc - 6, y + D / 2, u_num(d) + ' ' + u, { size: 13, fill: '#6B6B85', anchor: 'end' });
    return S.wrap(A + 120, B + 40, g, { width: o.width || 320 });
  };
  S.cubes = function (heights) {
    /* heights[row][col], row 0 = back. Isometric-ish oblique drawing, back to front. */
    var s = 34, dx = 16, dy = 12, rows = heights.length, cols = heights[0].length, g = '', maxH = 0;
    heights.forEach(function (r) { r.forEach(function (h) { maxH = Math.max(maxH, h); }); });
    var W = cols * s + rows * dx + 20, H = maxH * s + rows * dy + 30;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        for (var k = 0; k < heights[r][c]; k++) {
          var x = 10 + c * s + (rows - 1 - r) * dx, y = H - 10 - (k + 1) * s - (rows - 1 - r) * dy;
          g += S.poly([[x, y], [x + s, y], [x + s, y + s], [x, y + s]], '#FFC46B', { sw: 2 }) + S.poly([[x, y], [x + dx, y - dy], [x + s + dx, y - dy], [x + s, y]], '#FFE2A8', { sw: 2 }) + S.poly([[x + s, y], [x + s + dx, y - dy], [x + s + dx, y + s - dy], [x + s, y + s]], '#E89B2E', { sw: 2 });
        }
      }
    }
    return S.wrap(W, H, g, { width: Math.min(W * 1.4, 300) });
  };
})(window.MA = window.MA || {});
