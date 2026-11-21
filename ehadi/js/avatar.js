/* The player's character: a cartoon boy or girl drawn in SVG from layers (skin, hair, eyes, clothes, shoes, hat,
   glasses, jewelry, a toy in hand and a pet). One drawing in a 200 x 320 box; views crop it (round avatar,
   shop pictures of one item, the whole outfit). Shop items describe how they are drawn in item.draw. */
(function (MA) {
  'use strict';
  var AV = MA.avatar = {};
  AV.SKINS = ['#FFE3CC', '#F6C9A2', '#E8B083', '#C98A5C', '#9C6239', '#6B3F24'];
  AV.HAIR_COLORS = ['#2B1D16', '#4A2C1D', '#7A4A2A', '#B07A45', '#E8C36A', '#C65A24'];
  AV.EYES = ['#4A2F1E', '#2F6FB8', '#3E8E5A', '#8A6236'];
  AV.TEES = ['#FF6B6B', '#FFB020', '#4CC38A', '#3B82F6', '#9B6BFF', '#FF7EB6', '#22B8CF', '#F1F3F5'];
  AV.BASE_HAIR = { m: ['short', 'spiky', 'curly', 'sidepart', 'buzz', 'afro'], f: ['long', 'ponytail', 'pigtails', 'bob', 'curly_long', 'pixie'] };
  AV.defaults = function (g) {
    return { v: 2, skin: AV.SKINS[1], hair: g === 'f' ? 'long' : 'short', hairColor: AV.HAIR_COLORS[2], eyes: AV.EYES[0], top: g === 'f' ? AV.TEES[5] : AV.TEES[3] };
  };
  var VIEWS = { full: [0, 0, 200, 320], portrait: [14, 6, 172, 172], head: [26, 0, 148, 160], hairdo: [14, 22, 172, 196], top: [30, 148, 140, 132], outfit: [18, 140, 164, 176], bottom: [40, 222, 120, 96], shoes: [56, 276, 88, 40], neck: [50, 138, 100, 92], wrist: [22, 190, 80, 72] };
  AV.VIEWS = VIEWS;

  /* ---------------------------------------------------------------- tiny SVG helpers */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function attrs(o) { var s = ''; for (var k in o) if (o[k] != null && o[k] !== false) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function P(d, fill, o) { o = o || {}; o.d = d; o.fill = fill || 'none'; return '<path' + attrs(o) + '/>'; }
  function C(cx, cy, r, fill, o) { o = o || {}; o.cx = cx; o.cy = cy; o.r = r; o.fill = fill; return '<circle' + attrs(o) + '/>'; }
  function E(cx, cy, rx, ry, fill, o) { o = o || {}; o.cx = cx; o.cy = cy; o.rx = rx; o.ry = ry; o.fill = fill; return '<ellipse' + attrs(o) + '/>'; }
  function R(x, y, w, h, rx, fill, o) { o = o || {}; o.x = x; o.y = y; o.width = w; o.height = h; o.rx = rx; o.fill = fill; return '<rect' + attrs(o) + '/>'; }
  function L(d, stroke, w, o) { o = o || {}; o.d = d; o.fill = 'none'; o.stroke = stroke; o['stroke-width'] = w; o['stroke-linecap'] = 'round'; o['stroke-linejoin'] = 'round'; return '<path' + attrs(o) + '/>'; }
  function emo(x, y, ch, size) { return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,sans-serif">' + esc(ch) + '</text>'; }
  function txt(x, y, s, size, fill) { return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" font-weight="900" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" fill="' + fill + '">' + esc(s) + '</text>'; }
  function shade(hex, f) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return hex;
    var n = parseInt(m[1], 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var mix = function (c) { return Math.max(0, Math.min(255, Math.round(f < 0 ? c * (1 + f) : c + (255 - c) * f))); };
    return '#' + ((1 << 24) + (mix(r) << 16) + (mix(g) << 8) + mix(b)).toString(16).slice(1);
  }
  function star(cx, cy, r) { var d = ''; for (var i = 0; i < 10; i++) { var a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1); } return d + 'Z'; }
  function heart(cx, cy, s) { return 'M' + cx + ',' + (cy + s * .9) + ' C' + (cx - s * 1.4) + ',' + (cy - s * .1) + ' ' + (cx - s * .7) + ',' + (cy - s * 1.1) + ' ' + cx + ',' + (cy - s * .35) + ' C' + (cx + s * .7) + ',' + (cy - s * 1.1) + ' ' + (cx + s * 1.4) + ',' + (cy - s * .1) + ' ' + cx + ',' + (cy + s * .9) + 'Z'; }

  /* fills: plain colors, patterns and gradients (ids are unique per drawing, many drawings share a page) */
  function fill(ctx, color, pattern, c2) {
    var special = { rainbow: 1, candy: 1, gold: 1, silver: 1, galaxy: 1 };
    if (!pattern && !special[color]) return color || '#888';
    var id = ctx.id + 'f' + (ctx.n++), base = special[color] ? '#999' : color, d;
    if (special[color] || pattern === 'grad') {
      var stops = { rainbow: ['#FF5C5C', '#FFB020', '#FFE14D', '#4CC38A', '#3B82F6', '#9B6BFF'], candy: ['#FF9FD2', '#C9A7FF', '#8FD3FF'], gold: ['#FFF1A8', '#F5C518', '#C9940A'], silver: ['#F4F6F8', '#C7D0DB', '#8E9AA8'], galaxy: ['#2A1B6B', '#6C4CF1', '#22D3EE'] }[color] || [color, c2 || shade(color, .4)];
      ctx.defs.push('<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' + stops.map(function (s, i) { return '<stop offset="' + (i / (stops.length - 1)).toFixed(2) + '" stop-color="' + s + '"/>'; }).join('') + '</linearGradient>');
      return 'url(#' + id + ')';
    }
    c2 = c2 || '#FFFFFF';
    if (pattern === 'stripes') d = R(0, 0, 12, 12, 0, base) + R(0, 0, 12, 6, 0, c2);
    else if (pattern === 'vstripes') d = R(0, 0, 12, 12, 0, base) + R(0, 0, 6, 12, 0, c2);
    else if (pattern === 'dots') d = R(0, 0, 14, 14, 0, base) + C(7, 7, 3, c2);
    else if (pattern === 'stars') d = R(0, 0, 22, 22, 0, base) + P(star(11, 11, 5.5), c2);
    else if (pattern === 'hearts') d = R(0, 0, 20, 20, 0, base) + P(heart(10, 10, 4.5), c2);
    else if (pattern === 'flowers') d = R(0, 0, 24, 24, 0, base) + [0, 72, 144, 216, 288].map(function (a) { var r = a * Math.PI / 180; return C((12 + 4.5 * Math.cos(r)).toFixed(1), (12 + 4.5 * Math.sin(r)).toFixed(1), 3, c2); }).join('') + C(12, 12, 2.4, '#FFD43B');
    else if (pattern === 'checks') d = R(0, 0, 16, 16, 0, base) + R(0, 0, 8, 8, 0, c2) + R(8, 8, 8, 8, 0, c2);
    else if (pattern === 'camo') d = R(0, 0, 30, 30, 0, base) + P('M2,6 Q8,0 14,6 Q12,13 5,12 Z', shade(base, -.25)) + P('M17,16 Q25,12 28,20 Q24,27 17,24 Z', c2) + P('M4,20 Q9,17 12,23 Q8,28 3,25 Z', shade(base, .25));
    else if (pattern === 'sparkle') d = R(0, 0, 18, 18, 0, base) + P(star(5, 5, 2.6), c2) + P(star(13, 13, 2), c2);
    else return base;
    var size = /width="(\d+)"/.exec(d)[1];
    ctx.defs.push('<pattern id="' + id + '" width="' + size + '" height="' + size + '" patternUnits="userSpaceOnUse">' + d + '</pattern>');
    return 'url(#' + id + ')';
  }

  /* ---------------------------------------------------------------- hair */
  var CAP_PART = 'M48,116 C46,72 70,50 100,52 C130,50 154,72 152,116 C146,100 134,88 114,82 L100,70 L86,82 C66,88 54,100 48,116 Z';
  var CAP_SIDE = 'M48,114 C46,72 70,50 100,50 C130,50 154,72 152,114 C150,100 144,90 134,84 C118,90 96,88 82,80 C70,88 58,98 48,114 Z';
  var CAP_SLICK = 'M50,112 C48,72 72,54 100,54 C128,54 152,72 150,112 C146,94 128,84 100,84 C72,84 54,94 50,112 Z';
  var HAIR = {
    short: { front: 'M48,114 C44,74 66,50 100,50 C134,50 156,74 152,114 C150,104 146,96 140,90 C132,96 120,94 112,88 C104,94 90,94 80,88 C72,94 60,96 54,94 C51,100 49,107 48,114 Z' },
    spiky: { front: 'M48,114 C46,96 47,86 50,78 L40,70 L56,66 L52,48 L70,56 L74,36 L88,50 L100,30 L112,50 L126,36 L130,56 L148,48 L144,66 L160,70 L150,78 C153,86 154,96 152,114 C148,100 140,92 130,90 C120,96 108,90 100,86 C92,92 80,96 70,90 C60,92 52,100 48,114 Z' },
    curly: { front: 'M52,104 C52,70 72,58 100,58 C128,58 148,70 148,104 C140,90 124,86 100,86 C76,86 60,90 52,104 Z', bumps: [[55, 100, 10], [54, 84, 12], [64, 68, 13], [80, 58, 14], [100, 54, 14], [120, 58, 14], [136, 68, 13], [146, 84, 12], [145, 100, 10], [72, 82, 11], [90, 76, 11], [110, 76, 11], [128, 82, 11]] },
    sidepart: { front: 'M48,114 C44,72 70,48 104,50 C136,52 156,76 152,114 C150,102 146,94 138,88 C124,84 108,88 92,94 C76,98 62,96 54,92 C50,98 49,106 48,114 Z', line: 'M88,54 C92,64 94,72 94,82' },
    buzz: { front: 'M52,108 C50,74 72,56 100,56 C128,56 150,74 148,108 C142,90 124,80 100,80 C76,80 58,90 52,108 Z', alpha: .9 },
    afro: { back: [[100, 92, 64], [52, 112, 26], [148, 112, 26]], front: 'M50,108 C48,82 70,68 100,68 C130,68 152,82 150,108 C144,94 124,88 100,88 C76,88 56,94 50,108 Z' },
    mohawk: { front: 'M52,108 C50,74 72,56 100,56 C128,56 150,74 148,108 C142,90 124,80 100,80 C76,80 58,90 52,108 Z', alpha: .55, crest: 'M86,74 C82,46 90,22 100,10 C110,22 118,46 114,74 Z' },
    long_boy: { back: 'M44,112 C38,62 68,46 100,46 C132,46 162,62 156,112 L160,170 C148,178 132,174 124,164 L76,164 C68,174 52,178 40,170 Z', front: CAP_PART },
    quiff: { front: 'M48,112 C44,76 60,54 88,48 C104,30 138,30 150,52 C140,48 128,50 120,56 C140,64 154,84 152,112 C146,96 132,88 112,88 C90,88 64,94 48,112 Z' },
    bowl: { front: 'M46,112 C44,68 70,48 100,48 C130,48 156,68 154,112 L150,112 L150,98 L50,98 L50,112 Z' },
    manbun: { front: CAP_SLICK, buns: [[100, 44, 15]] },
    long: { back: 'M40,112 C34,56 68,42 100,42 C132,42 166,56 160,112 L166,204 Q150,214 130,206 L70,206 Q50,214 34,204 Z', front: CAP_PART },
    ponytail: { front: CAP_SIDE, back: 'M134,70 C164,58 182,86 176,118 C172,142 178,162 168,184 C158,170 154,150 151,132 C149,112 146,94 132,82 Z', ties: [[138, 74]] },
    pigtails: { front: CAP_PART, back: 'M56,102 C30,108 20,140 28,170 C34,188 48,192 52,176 C44,160 46,136 62,120 Z M144,102 C170,108 180,140 172,170 C166,188 152,192 148,176 C156,160 154,136 138,120 Z', ties: [[54, 106], [146, 106]] },
    bob: { back: 'M42,118 C36,58 68,44 100,44 C132,44 164,58 158,118 C162,142 156,156 142,160 L58,160 C44,156 38,142 42,118 Z', front: 'M48,116 C46,72 70,50 100,50 C130,50 154,72 152,116 C148,104 142,94 132,90 C112,95 88,95 68,90 C58,94 52,104 48,116 Z' },
    pixie: { front: 'M48,114 C44,70 70,48 102,50 C134,52 156,74 152,112 C150,100 146,92 140,86 C124,80 108,84 90,92 C74,98 60,100 52,98 C50,104 48,108 48,114 Z' },
    curly_long: { back: [[100, 70, 52], [48, 104, 20], [152, 104, 20], [42, 132, 19], [158, 132, 19], [44, 160, 18], [156, 160, 18], [52, 186, 16], [148, 186, 16]], front: 'M50,110 C48,74 72,56 100,56 C128,56 152,74 150,110 C144,94 126,86 100,86 C74,86 56,94 50,110 Z', bumps: [[66, 84, 10], [82, 78, 11], [100, 76, 11], [118, 78, 11], [134, 84, 10]] },
    braids: { front: CAP_PART, braids: [56, 144] },
    bun: { front: CAP_SLICK, buns: [[100, 44, 20]] },
    space_buns: { front: CAP_PART, buns: [[64, 58, 17], [136, 58, 17]] },
    side_pony: { front: CAP_SIDE, back: 'M62,86 C32,98 26,132 34,162 C40,186 56,198 62,186 C52,162 56,132 72,106 Z', ties: [[62, 90]] },
    princess: { back: 'M40,112 C34,56 68,40 100,40 C132,40 166,56 160,112 C170,150 158,180 170,214 C176,236 164,256 150,262 C140,240 150,226 140,206 L60,206 C50,226 60,240 50,262 C36,256 24,236 30,214 C42,180 30,150 40,112 Z', front: CAP_PART },
    afro_puffs: { front: CAP_PART, buns: [[58, 66, 26], [142, 66, 26]] }
  };
  AV.HAIR_STYLES = Object.keys(HAIR);
  function hairBack(st, f) {
    var hs = HAIR[st] || HAIR.short, out = '';
    if (typeof hs.back === 'string') out += P(hs.back, f);
    else if (hs.back) out += hs.back.map(function (c) { return C(c[0], c[1], c[2], f); }).join('');
    if (hs.buns) out += hs.buns.map(function (b) { return C(b[0], b[1], b[2], f); }).join('');
    return out;
  }
  function hairOver(st, f, dark) {
    var hs = HAIR[st]; if (!hs || !hs.braids) return '';
    return hs.braids.map(function (x) {
      var s = '';
      for (var y = 140; y <= 212; y += 13) s += E(x + ((y / 13) % 2 ? 2 : -2), y, 9, 8, f, { stroke: dark, 'stroke-width': 1.2 });
      return s + C(x, 222, 5, '#FF5C8A') + P('M' + (x - 6) + ',226 L' + x + ',240 L' + (x + 6) + ',226 Z', f);
    }).join('');
  }
  function hairFront(st, f, dark) {
    var hs = HAIR[st] || HAIR.short, out = P(hs.front, f, hs.alpha ? { 'fill-opacity': hs.alpha } : null);
    if (hs.bumps) out += hs.bumps.map(function (c) { return C(c[0], c[1], c[2], f); }).join('');
    if (hs.crest) out += P(hs.crest, f);
    if (hs.line) out += L(hs.line, dark, 2.5);
    if (hs.ties) out += hs.ties.map(function (t2) { return C(t2[0], t2[1], 6, '#FF5C8A'); }).join('');
    return out;
  }

  /* ---------------------------------------------------------------- body pieces */
  var TEE = 'M64,178 Q76,168 89,168 Q100,180 111,168 Q124,168 136,178 L136,246 Q100,252 64,246 Z';
  var TANK = 'M72,172 Q80,166 88,168 Q100,182 112,168 Q120,166 128,172 L136,190 L136,246 Q100,252 64,246 L64,190 Z';
  var DRESS = 'M64,178 Q76,168 89,168 Q100,180 111,168 Q124,168 136,178 L138,232 L150,282 Q100,292 50,282 L62,232 Z';
  var PANTS = 'M68,236 L132,236 L130,300 L104,300 L101,262 L99,262 L96,300 L70,300 Z';
  var COVERS = { dress: 1, gown: 1, tutu: 1, overalls: 1, suit: 1, space: 1, karate: 1, armor: 1, pajamas: 1 };
  function sleeves(color, long, w) {
    var end = long ? [[56, 230], [144, 230]] : [[59, 204], [141, 204]];
    return L('M65,184 L' + end[0].join(','), color, w || 20) + L('M135,184 L' + end[1].join(','), color, w || 20);
  }
  function drawTop(t, ctx) {
    var k = t.kind || 'tee', c = t.color || '#3B82F6', c2 = t.color2 || '#FFFFFF', f = fill(ctx, c, t.pattern, t.patternColor), dk = shade(c === 'gold' || c === 'silver' || c === 'rainbow' ? '#999999' : c, -.22), out = '';
    var longS = { hoodie: 1, sweater: 1, jacket: 1, raincoat: 1, suit: 1, space: 1, chef: 1, armor: 1, pajamas: 1, karate: 1 }[k];
    if (k === 'hoodie') out += P('M72,178 Q100,146 128,178 Q100,166 72,178 Z', dk);
    if (k === 'tank' || k === 'tutu') out += '';
    else if (k === 'gown' || k === 'dress') out += sleeves(f, false, 18);
    else if (k === 'jacket') out += sleeves(fill(ctx, c), true);
    else out += sleeves(k === 'karate' || k === 'chef' ? '#FFFFFF' : k === 'overalls' ? c2 : f, longS);
    if (k === 'tank') out += P(TANK, f) + L('M88,168 Q100,182 112,168', c2, 3) + txt(100, 214, t.num || '10', 30, c2);
    else if (k === 'dress') out += P(DRESS, f) + R(62, 226, 76, 8, 4, c2) + L('M89,168 Q100,180 111,168', dk, 2);
    else if (k === 'gown') {
      out += P('M68,228 L132,228 Q160,262 166,300 Q100,312 34,300 Q40,262 68,228 Z', f) + P('M66,178 Q78,168 89,168 Q100,180 111,168 Q122,168 134,178 L132,232 L68,232 Z', f)
        + C(64, 182, 13, shade(c, .25)) + C(136, 182, 13, shade(c, .25)) + L('M40,298 Q100,310 160,298', c2, 4) + R(66, 226, 68, 7, 3.5, c2);
      [[70, 262], [100, 280], [130, 262], [84, 296], [118, 294], [100, 250]].forEach(function (s) { out += P(star(s[0], s[1], 4.5), '#FFFFFF', { opacity: .9 }); });
    } else if (k === 'tutu') {
      out += P(TEE, f) + P('M56,232 L144,232 L164,262 Q152,272 140,264 Q128,274 116,264 Q104,274 92,264 Q80,274 68,264 Q56,272 36,262 Z', c2, { opacity: .9 })
        + P('M62,232 L138,232 L152,254 Q140,262 128,256 Q116,264 104,256 Q92,264 80,256 Q68,262 48,254 Z', shade(c2, .3));
    } else if (k === 'overalls') out += P(TEE, fill(ctx, c2)) + P('M78,200 L122,200 L124,248 L76,248 Z', f) + L('M80,202 L70,178 M120,202 L130,178', c, 6) + C(82, 206, 3, '#FFD43B') + C(118, 206, 3, '#FFD43B') + R(92, 214, 16, 12, 2, dk);
    else if (k === 'jacket') out += P(TEE, c2) + P('M64,178 Q76,168 89,168 L97,248 Q80,251 64,246 Z', f) + P('M136,178 Q124,168 111,168 L103,248 Q120,251 136,246 Z', f) + L('M89,168 L94,186 L98,184 M111,168 L106,186 L102,184', dk, 2) + C(92, 214, 2.5, '#FFD43B') + C(92, 230, 2.5, '#FFD43B');
    else if (k === 'raincoat') out += P('M64,178 Q76,168 89,168 Q100,176 111,168 Q124,168 136,178 L140,268 Q100,274 60,268 Z', f) + L('M100,176 L100,266', dk, 2) + [196, 216, 236, 256].map(function (y) { return C(106, y, 2.6, dk); }).join('') + R(70, 236, 18, 10, 2, dk) + R(112, 236, 18, 10, 2, dk);
    else if (k === 'suit') out += P(TEE, f) + P('M88,168 Q100,176 112,168 L104,216 L96,216 Z', '#FFFFFF') + L('M88,168 L97,214 M112,168 L103,214', dk, 2) + C(100, 226, 2.5, '#DDD') + C(100, 238, 2.5, '#DDD') + P('M90,172 L100,178 L90,184 Z M110,172 L100,178 L110,184 Z', c2) + C(100, 178, 3, shade(c2, -.2));
    else if (k === 'space') out += P(TEE, f) + R(84, 194, 32, 22, 4, '#DDE4EC') + C(92, 205, 3.5, '#FF5C5C') + C(100, 205, 3.5, '#FFD43B') + C(108, 205, 3.5, '#4CC38A') + R(64, 234, 72, 9, 3, '#AAB6C4') + C(64, 190, 6, '#3B82F6');
    else if (k === 'karate') out += P(TEE, '#FFFFFF') + L('M89,168 L110,222 M111,168 L92,212', '#D0D5DB', 2.5) + R(64, 232, 72, 8, 3, c) + P('M96,240 L90,256 L96,256 L100,242 L104,256 L110,256 L104,240 Z', c);
    else if (k === 'chef') out += P(TEE, '#FFFFFF') + [192, 208, 224].map(function (y) { return C(90, y, 2.6, '#C9D1DA') + C(110, y, 2.6, '#C9D1DA'); }).join('') + P('M89,168 Q100,182 111,168 L104,186 L96,186 Z', c);
    else if (k === 'armor') out += P(TEE, fill(ctx, 'silver')) + L('M66,196 Q100,204 134,196 M66,218 Q100,226 134,218', '#8E9AA8', 2) + P('M88,190 L112,190 L112,212 Q100,226 88,212 Z', c2) + L('M100,194 L100,218 M91,202 L109,202', '#FFFFFF', 3);
    else {
      out += P(TEE, f) + L('M89,168 Q100,180 111,168', dk, 2);
      if (k === 'hoodie') out += P('M80,222 L120,222 L126,246 L74,246 Z', dk) + L('M95,180 L93,200 M105,180 L107,200', '#FFFFFF', 2);
      if (k === 'sweater') out += P('M64,198 L72,206 L80,198 L88,206 L96,198 L104,206 L112,198 L120,206 L128,198 L136,206 L136,214 L128,206 L120,214 L112,206 L104,214 L96,206 L88,214 L80,206 L72,214 L64,206 Z', c2);
    }
    if (t.emblem) out += emo(100, k === 'cape' ? 206 : 208, t.emblem, 26);
    return out;
  }
  function drawBottom(b, ctx) {
    var k = b.kind || 'pants', c = b.color || '#3D5A99', f = fill(ctx, c, b.pattern, b.patternColor), dk = shade(c, -.25);
    if (k === 'shorts') return P('M68,236 L132,236 L131,270 L103,270 L101,256 L99,256 L97,270 L69,270 Z', f) + (b.stripe ? L('M71,262 L71,240 M129,262 L129,240', b.stripe, 3) : '');
    if (k === 'skirt') return P('M70,234 L130,234 L144,276 Q100,286 56,276 Z', f) + L('M70,238 L130,238', dk, 3);
    if (k === 'tutu') return P('M62,234 L138,234 L156,262 Q144,272 132,264 Q120,274 108,264 Q100,272 92,264 Q80,274 68,264 Q56,272 44,262 Z', f, { opacity: .92 }) + P('M66,234 L134,234 L146,252 Q134,260 122,254 Q110,262 100,254 Q90,262 78,254 Q66,260 54,252 Z', shade(c, .3));
    if (k === 'leggings') return P('M72,236 L128,236 L126,300 L105,300 L101,258 L99,258 L95,300 L74,300 Z', f);
    var out = P(PANTS, f) + L('M100,240 L100,260', dk, 2);
    if (k === 'cargo') out += R(70, 262, 16, 15, 3, dk) + R(114, 262, 16, 15, 3, dk);
    return out;
  }
  function drawShoes(s) {
    var k = s.kind || 'sneakers', c = s.color || '#FF5C5C', out = '';
    [86, 114].forEach(function (x) {
      if (k === 'boots') out += R(x - 12, 280, 24, 22, 5, c) + E(x, 302, 15, 7, c) + R(x - 15, 302, 30, 5, 2.5, shade(c, -.3));
      else if (k === 'sandals') out += E(x, 301, 13, 6, AV._skin) + L('M' + (x - 10) + ',298 L' + (x + 10) + ',298 M' + x + ',294 L' + x + ',304', c, 3) + R(x - 14, 304, 28, 4, 2, shade(c, -.3));
      else if (k === 'flats') out += E(x, 301, 13, 6.5, c) + C(x, 296, 3, shade(c, -.25));
      else if (k === 'rocket') out += R(x - 12, 280, 24, 22, 6, '#D7DEE6') + E(x, 302, 15, 7, '#C0CAD5') + P('M' + (x - 8) + ',308 L' + x + ',320 L' + (x + 8) + ',308 Z', '#FFA94D') + R(x - 12, 286, 24, 5, 2, '#FF5C5C');
      else {
        out += E(x, 300, 15, 8, c) + R(x - 15, 302, 30, 5, 2.5, k === 'lightup' ? fill(AV._ctx, 'rainbow') : '#FFFFFF') + L('M' + (x - 4) + ',294 L' + (x + 4) + ',294', '#FFFFFF', 1.6);
        if (k === 'cleats') out += C(x - 8, 309, 1.8, '#555') + C(x, 309, 1.8, '#555') + C(x + 8, 309, 1.8, '#555');
        if (k === 'sparkle') out += P(star(x - 4, 298, 3), '#FFFFFF') + P(star(x + 6, 300, 2.2), '#FFFFFF');
      }
    });
    if (k === 'lightup') out += C(80, 310, 2, '#FFE14D') + C(120, 310, 2, '#7CF3FF');
    return out;
  }

  /* ---------------------------------------------------------------- head pieces */
  function drawHat(h, ctx, hairF) {
    var k = h.kind, c = h.color || '#FF5C5C', dk = shade(c, -.25), f = fill(ctx, c, h.pattern, h.patternColor);
    switch (k) {
      case 'cap': return P('M52,94 C52,54 148,54 148,94 Z', f) + P('M96,92 L172,92 Q178,100 166,103 L96,100 Z', dk) + C(100, 58, 4, dk);
      case 'propeller': return P('M52,94 C52,54 148,54 148,94 Z', fill(ctx, 'rainbow')) + P('M96,92 L172,92 Q178,100 166,103 L96,100 Z', '#3B82F6') + L('M100,58 L100,44', '#555', 3) + E(86, 42, 16, 4, '#FF5C5C') + E(114, 42, 16, 4, '#FFD43B');
      case 'beanie': return P('M52,96 C52,50 148,50 148,96 Z', f) + R(48, 84, 104, 16, 8, dk) + C(100, 44, 10, c2or(h, '#FFFFFF'));
      case 'cowboy': return E(100, 84, 76, 13, dk) + P('M66,84 C64,40 136,40 134,84 Z', f) + R(66, 72, 68, 8, 2, '#5B3A1E');
      case 'pirate': return P('M36,86 Q100,26 164,86 Q100,70 36,86 Z', '#222') + L('M40,84 Q100,72 160,84', '#FFD43B', 2.5) + emo(100, 62, '☠️', 18);
      case 'wizard': return E(100, 84, 62, 11, dk) + P('M64,84 L100,4 L136,84 Z', f) + P(star(92, 52, 6), '#FFD43B') + P(star(110, 32, 4.5), '#FFD43B') + P(star(108, 70, 4), '#FFFFFF');
      case 'crown': return P('M64,82 L64,50 L78,64 L90,40 L100,60 L110,40 L122,64 L136,50 L136,82 Z', fill(ctx, 'gold')) + C(84, 72, 4, '#FF5C8A') + C(100, 70, 4.5, '#3B82F6') + C(116, 72, 4, '#4CC38A');
      case 'tiara': return P('M70,76 Q100,58 130,76 L126,80 Q100,66 74,80 Z', fill(ctx, 'silver')) + P('M90,70 L100,46 L110,70 Z', fill(ctx, 'silver')) + C(100, 60, 4.5, c) + C(82, 72, 2.5, c) + C(118, 72, 2.5, c);
      case 'party': return P('M78,80 L100,22 L122,80 Z', f) + L('M86,60 L114,60 M82,72 L118,72', c2or(h, '#FFFFFF'), 3) + C(100, 22, 6, '#FFD43B');
      case 'chef': return R(70, 58, 60, 24, 6, '#FFFFFF', { stroke: '#DDE2E8', 'stroke-width': 1.5 }) + C(80, 50, 17, '#FFFFFF') + C(100, 40, 21, '#FFFFFF') + C(120, 50, 17, '#FFFFFF');
      case 'tophat': return E(100, 82, 54, 9, '#222') + R(70, 22, 60, 60, 4, '#2B2B2B') + R(70, 66, 60, 9, 0, c);
      case 'grad': return P('M40,62 L100,44 L160,62 L100,80 Z', '#222') + R(76, 64, 48, 20, 4, '#2B2B2B') + L('M150,64 L156,94', '#FFD43B', 3) + C(156, 96, 4, '#FFD43B');
      case 'helmet': return C(100, 110, 64, '#BFE8FF', { 'fill-opacity': .35, stroke: '#E3EAF2', 'stroke-width': 8 }) + E(78, 80, 10, 18, '#FFFFFF', { opacity: .55, transform: 'rotate(-30 78 80)' });
      case 'headphones': return L('M46,112 C44,46 156,46 154,112', '#333', 8) + R(36, 98, 20, 34, 9, c) + R(144, 98, 20, 34, 9, c);
      case 'viking': return P('M54,96 C54,52 146,52 146,96 Z', '#9AA5B1') + R(50, 86, 100, 12, 5, '#C0A060') + P('M56,80 C36,74 30,52 38,36 C44,56 54,62 64,66 Z', '#F4E9D8') + P('M144,80 C164,74 170,52 162,36 C156,56 146,62 136,66 Z', '#F4E9D8');
      case 'bunny': return L('M58,92 C58,58 142,58 142,92', c, 6) + E(80, 34, 10, 30, c) + E(80, 36, 5, 22, '#FFC2D6') + E(120, 34, 10, 30, c) + E(120, 36, 5, 22, '#FFC2D6');
      case 'cat': return L('M56,92 C56,56 144,56 144,92', c, 6) + P('M62,74 L66,40 L88,62 Z', c) + P('M138,74 L134,40 L112,62 Z', c) + P('M68,66 L70,50 L80,60 Z', '#FFC2D6') + P('M132,66 L130,50 L120,60 Z', '#FFC2D6');
      case 'flowers': return L('M54,90 C56,58 144,58 146,90', '#4CAF50', 4) + [[58, 82], [72, 66], [100, 58], [128, 66], [142, 82]].map(function (p2, i) { return emo(p2[0], p2[1], ['🌸', '🌼', '🌺', '🌼', '🌸'][i], 18); }).join('');
      case 'bow': return P('M118,62 L146,48 L146,80 Z', f) + P('M118,62 L90,48 L90,80 Z', f) + C(118, 64, 7, dk);
      case 'clip': return emo(136, 76, h.emoji || '⭐', 20);
      case 'sunhat': return E(100, 82, 72, 14, f) + P('M68,82 C68,48 132,48 132,82 Z', f) + R(68, 72, 64, 8, 2, c2or(h, '#FF7EB6')) + emo(132, 70, '🌸', 14);
      default: return '';
    }
  }
  function c2or(o, d) { return o.color2 || d; }
  function drawGlasses(g) {
    var k = g.kind, c = g.color || '#333';
    if (k === 'round') return C(82, 116, 12, '#FFFFFF', { 'fill-opacity': .15, stroke: c, 'stroke-width': 3 }) + C(118, 116, 12, '#FFFFFF', { 'fill-opacity': .15, stroke: c, 'stroke-width': 3 }) + L('M94,114 Q100,110 106,114', c, 3);
    if (k === 'square') return R(68, 106, 28, 20, 4, '#FFFFFF', { 'fill-opacity': .15, stroke: c, 'stroke-width': 3 }) + R(104, 106, 28, 20, 4, '#FFFFFF', { 'fill-opacity': .15, stroke: c, 'stroke-width': 3 }) + L('M96,114 L104,114', c, 3);
    if (k === 'sun') return R(66, 106, 32, 22, 10, '#1F2937') + R(102, 106, 32, 22, 10, '#1F2937') + L('M98,112 L102,112', '#1F2937', 3) + L('M72,112 L80,110', '#FFFFFF', 2, { opacity: .6 }) + L('M108,112 L116,110', '#FFFFFF', 2, { opacity: .6 });
    if (k === 'star') return P(star(82, 116, 15), c, { 'fill-opacity': .85 }) + P(star(118, 116, 15), c, { 'fill-opacity': .85 }) + L('M96,114 L104,114', c, 3);
    if (k === 'heart') return P(heart(82, 118, 11), c, { 'fill-opacity': .85 }) + P(heart(118, 118, 11), c, { 'fill-opacity': .85 }) + L('M94,114 L106,114', c, 3);
    if (k === 'goggles') return L('M50,112 L150,112', c, 5) + E(82, 116, 14, 11, '#9BE7FF', { stroke: c, 'stroke-width': 3, 'fill-opacity': .7 }) + E(118, 116, 14, 11, '#9BE7FF', { stroke: c, 'stroke-width': 3, 'fill-opacity': .7 });
    if (k === 'mask') return P('M60,108 Q82,98 100,108 Q118,98 140,108 L138,124 Q118,132 100,122 Q82,132 62,124 Z M72,114 a9,7 0 1,0 18,0 a9,7 0 1,0 -18,0 Z M110,114 a9,7 0 1,0 18,0 a9,7 0 1,0 -18,0 Z', c, { 'fill-rule': 'evenodd' }) + L('M60,110 L46,104 M140,110 L154,104', c, 4);
    return '';
  }
  function drawNeck(n, ctx) {
    var k = n.kind, c = n.color || '#FFD43B', out = '';
    if (k === 'pearls') { for (var i = 0; i <= 8; i++) { var a = Math.PI * (i / 8); out += C((100 - 18 * Math.cos(a)).toFixed(1), (172 + 14 * Math.sin(a)).toFixed(1), 3.2, '#FFFFFF', { stroke: '#D9DEE5', 'stroke-width': .8 }); } return out; }
    if (k === 'heart') return L('M84,170 Q100,190 116,170', fill(ctx, 'gold'), 1.8) + P(heart(100, 190, 6), c);
    if (k === 'chain') return L('M84,170 Q100,196 116,170', fill(ctx, 'gold'), 4) + C(100, 190, 5, fill(ctx, 'gold'));
    if (k === 'medal') return P('M88,168 L100,196 L112,168 L106,168 L100,184 L94,168 Z', c) + C(100, 202, 11, fill(ctx, 'gold')) + P(star(100, 202, 6), '#FFF6C2');
    if (k === 'bowtie') return P('M88,170 L100,176 L88,182 Z M112,170 L100,176 L112,182 Z', c) + C(100, 176, 3, shade(c, -.25));
    if (k === 'tie') return P('M96,172 L104,172 L102,178 L108,214 L100,224 L92,214 L98,178 Z', c) + P('M95,168 L105,168 L104,174 L96,174 Z', shade(c, -.2));
    if (k === 'scarf') return R(80, 162, 40, 16, 8, fill(ctx, c, n.pattern, n.patternColor)) + R(104, 170, 12, 34, 5, fill(ctx, c, n.pattern, n.patternColor));
    if (k === 'lei') return [[80, 172], [88, 182], [100, 186], [112, 182], [120, 172]].map(function (p2, i) { return emo(p2[0], p2[1], i % 2 ? '🌼' : '🌺', 12); }).join('');
    return '';
  }
  function drawEars(e) {
    var k = e.kind, c = e.color || '#FFD43B', out = '';
    [[51, 126], [149, 126]].forEach(function (p2) {
      if (k === 'hoops') out += C(p2[0], p2[1] + 6, 6, 'none', { stroke: c, 'stroke-width': 2.5 });
      else if (k === 'stars') out += P(star(p2[0], p2[1] + 3, 5), c);
      else if (k === 'hearts') out += P(heart(p2[0], p2[1] + 3, 4), c);
      else if (k === 'diamonds') out += P('M' + p2[0] + ',' + (p2[1] - 2) + ' l5,6 l-5,7 l-5,-7 Z', '#BDF3FF', { stroke: '#7FD6FF', 'stroke-width': 1 }) + P(star(p2[0] + 4, p2[1] - 2, 2), '#FFFFFF');
      else out += C(p2[0], p2[1] + 2, 3.2, c);
    });
    return out;
  }
  function drawWrist(w) {
    var k = w.kind, c = w.color || '#FF7EB6';
    if (k === 'watch') return R(48, 226, 16, 8, 3, '#333') + R(51, 223, 10, 13, 3, c) + C(56, 229, 3, '#FFFFFF');
    if (k === 'beads') return [0, 1, 2, 3, 4].map(function (i) { return C(48 + i * 4, 230, 2.6, ['#FF5C5C', '#FFD43B', '#4CC38A', '#3B82F6', '#9B6BFF'][i]); }).join('');
    return R(44, 223, 23, 10, 5, c);
  }

  /* ---------------------------------------------------------------- the whole character */
  var seq = 0;
  AV.svg = function (look, o) {
    o = o || {};
    var ctx = { id: 'av' + (++seq) + '_', defs: [], n: 0 }, out = [], g = look.gender === 'f' ? 'f' : 'm';
    var skin = look.skin || AV.SKINS[1], skinD = shade(skin, -.14), hairF = fill(ctx, look.hairColor || AV.HAIR_COLORS[2]), hairD = shade(/^#/.test(look.hairColor || '') ? look.hairColor : '#7A4A2A', -.3);
    var top = look.top || { kind: 'tee', color: AV.TEES[3] }, covers = COVERS[top.kind];
    AV._skin = skin; AV._ctx = ctx;
    if (o.view === 'full' || !o.view) out.push(E(100, 308, 58, 8, '#000000', { opacity: .1 }));
    if (top.kind === 'cape') out.push(P('M66,176 Q100,166 134,176 L156,292 Q100,302 44,292 Z', top.color2 || '#E53935'));
    out.push(hairBack(look.hair, hairF));
    out.push(R(77, 244, 18, 58, 8, skin) + R(105, 244, 18, 58, 8, skin));
    if (!covers) out.push(drawBottom(look.bottom || { kind: g === 'f' ? 'skirt' : 'pants', color: g === 'f' ? '#7B5CFF' : '#3D5A99' }, ctx));
    else if ({ overalls: 1, suit: 1, space: 1, karate: 1, armor: 1, pajamas: 1 }[top.kind]) out.push(drawBottom({ kind: 'pants', color: top.kind === 'suit' ? top.color : top.kind === 'karate' ? '#FFFFFF' : top.kind === 'armor' ? '#8E9AA8' : top.kind === 'space' ? '#F1F3F5' : top.color, pattern: top.kind === 'pajamas' ? top.pattern : null, patternColor: top.patternColor }, ctx));
    out.push(drawShoes(look.shoes || { kind: 'sneakers', color: g === 'f' ? '#FF7EB6' : '#FF5C5C' }));
    out.push(L('M65,184 L56,234', skin, 15) + L('M135,184 L144,234', skin, 15));
    out.push(R(91, 150, 18, 28, 7, skin));
    out.push(drawTop(top, ctx));
    out.push(C(55, 240, 9, skin) + C(145, 240, 9, skin));
    out.push(hairOver(look.hair, hairF, hairD));
    if (look.neck) out.push(drawNeck(look.neck, ctx));
    if (look.wrist) out.push(drawWrist(look.wrist));
    /* head */
    out.push(C(51, 116, 10, skin) + C(149, 116, 10, skin) + C(51, 116, 5, skinD) + C(149, 116, 5, skinD));
    out.push(C(100, 110, 50, skin, { stroke: skinD, 'stroke-width': 1.5 }));
    var eye = look.eyes || AV.EYES[0];
    [82, 118].forEach(function (x) { out.push(E(x, 117, 8, 9, '#FFFFFF') + C(x, 118, 6, eye) + C(x, 118, 3, '#1B1410') + C(x + 2.2, 115.5, 1.8, '#FFFFFF')); });
    if (g === 'f') out.push(L('M73,110 L68,106 M75,107 L71,102 M127,110 L132,106 M125,107 L129,102', '#2B1D16', 2));
    out.push(L('M73,101 Q82,96 91,101', hairD, 3) + L('M109,101 Q118,96 127,101', hairD, 3));
    out.push(L('M97,127 Q100,130 103,127', skinD, 2));
    out.push(P('M87,135 Q100,150 113,135 Q100,141 87,135 Z', '#8A3B2E') + P('M93,141 Q100,146 107,141 Q100,143 93,141 Z', '#FF8FA3'));
    out.push(E(70, 132, 8, 5, '#FF8FA3', { opacity: g === 'f' ? .5 : .32 }) + E(130, 132, 8, 5, '#FF8FA3', { opacity: g === 'f' ? .5 : .32 }));
    out.push(hairFront(look.hair, hairF, hairD));
    if (look.ears) out.push(drawEars(look.ears));
    if (look.glasses) out.push(drawGlasses(look.glasses));
    if (look.hat) out.push(drawHat(look.hat, ctx, hairF));
    if (look.toy) out.push(emo(150, 244, look.toy, 30));
    if (look.pet && (o.view === 'full' || !o.view)) out.push(emo(36, 286, look.pet, 54));
    var vb = VIEWS[o.view] || VIEWS.full;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '"' + (o.width ? ' width="' + o.width + '"' : '') + (o.height ? ' height="' + o.height + '"' : '') + ' class="av-svg" aria-hidden="true">' + (ctx.defs.length ? '<defs>' + ctx.defs.join('') + '</defs>' : '') + out.join('') + '</svg>';
  };

  /* the drawing spec for a player: their free look plus what they wear (and one item to try on) */
  AV.look = function (st, tryItem) {
    var g = st && st.gender === 'f' ? 'f' : 'm', a = (st && st.avatar && st.avatar.v === 2) ? st.avatar : {}, d = AV.defaults(g), eq = (st && st.equipped) || {};
    var look = { gender: g, skin: a.skin || d.skin, hair: a.hair || d.hair, hairColor: a.hairColor || d.hairColor, eyes: a.eyes || d.eyes, top: { kind: 'tee', color: a.top || d.top } };
    var items = [];
    for (var slot in eq) if (eq[slot]) { var it = MA.db.get('shopItems', eq[slot]); if (it) items.push(it); }
    if (tryItem) items = items.filter(function (x) { return x.slot !== tryItem.slot && !(tryItem.slot === 'bottom' && COVERS[(x.draw || {}).kind]); }).concat([tryItem]);
    items.forEach(function (it) { AV.apply(look, it); });
    return look;
  };
  AV.apply = function (look, it) {
    var d = it.draw || {};
    if (it.slot === 'hair') look.hair = d.style;
    else if (it.slot === 'hairColor') look.hairColor = d.color;
    else if (it.slot === 'top') look.top = d;
    else if (it.slot === 'toy' || it.slot === 'pet') look[it.slot] = it.icon;
    else if (['bottom', 'shoes', 'hat', 'glasses', 'neck', 'ears', 'wrist'].indexOf(it.slot) >= 0) look[it.slot] = d;
    return look;
  };
  AV.covers = function (top) { return !!(top && COVERS[top.kind]); };
  /* which part of the drawing shows an item best */
  AV.viewFor = function (it) {
    var s = it.slot;
    if (s === 'top') return COVERS[(it.draw || {}).kind] || (it.draw || {}).kind === 'cape' || (it.draw || {}).kind === 'raincoat' ? 'outfit' : 'top';
    return { bottom: 'bottom', shoes: 'shoes', hair: 'hairdo', hairColor: 'hairdo', hat: 'head', glasses: 'head', ears: 'head', neck: 'neck', wrist: 'wrist' }[s] || 'portrait';
  };
})(window.MA = window.MA || {});
