/* Grades 5-6 generators: divis, orderops, fracadd, fracmul, decop, pct, stats, geo2, area2, volume.
   Decimal answers use input kind 'dec' with a tolerance check; fraction answers accept any equivalent fraction. */
(function (MA) {
  'use strict';
  var G = MA.gen, S = MA.svg, U = MA.u, f = G.fmt, m = G.m, t = function (k, p) { return MA.t(k, p); };
  var val = function (a) { return a == null ? NaN : (a.w || 0) + a.n / a.d; };
  function r6(x) { return Math.round(x * 1e6) / 1e6; }
  function fd(x) { return U.num(r6(x), { maximumFractionDigits: 6 }); }
  function near(a, b) { return typeof a === 'number' && isFinite(a) && Math.abs(a - b) < 1e-6; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var r = a % b; a = b; b = r; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function isPrime(n) { if (n < 2) return false; for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
  function factors(n) { var out = []; for (var i = 1; i <= n; i++) if (n % i === 0) out.push(i); return out; }
  function primeFactors(n) { var out = [], k = 2; while (n > 1) { while (n % k === 0) { out.push(k); n /= k; } k++; } return out; }
  function fs(n, d) { return n + '/' + d; }
  function list(key) { return MA.i18n.list(key); }
  function intQ(prompt, ans, o) {
    o = o || {};
    var q = { ui: 'input', prompt: prompt, data: { kind: 'int' }, answer: ans };
    if (o.sub) q.sub = m(o.sub);
    if (o.eq) q.data.eq = G.eqTokens(o.eq);
    if (o.unit) q.data.unit = o.unit;
    if (o.prefix) q.data.prefix = o.prefix;
    if (o.visual) q.visual = o.visual;
    return q;
  }
  function decQ(prompt, ans, o) { var q = intQ(prompt, r6(ans), o); q.data.kind = 'dec'; q.check = function (x) { return near(x, q.answer); }; return q; }
  function fracQ(prompt, eqToks, ans, mixed) {
    var q = { ui: 'input', prompt: prompt, data: { kind: mixed ? 'mixed' : 'frac', eq: eqToks.concat([mixed ? { blankMixed: true } : { blankFrac: true }]) }, answer: ans };
    q.check = function (x) { return !!x && x.d > 0 && Math.abs(val(x) - val(ans)) < 1e-9; };
    return q;
  }
  /* a whole-number result gets a normal number box instead of numerator and denominator boxes */
  function fracOrInt(prompt, eqToks, ans) {
    if (ans.n % ans.d === 0) return { ui: 'input', prompt: prompt, data: { kind: 'int', eq: eqToks.concat([{ blank: true }]) }, answer: ans.n / ans.d };
    return fracQ(prompt, eqToks, ans);
  }
  function coprime(rng, d) { return rng.pick(U.range(1, d).filter(function (x) { return gcd(x, d) === 1; })); }
  /* what follows a fraction in an explanation: " = 3/4", " = 2 3/4" or " = 3" */
  function simpler(n, d) {
    var g = gcd(n, d), sn = n / g, sd = d / g, out = '';
    if (sd === 1) return ' = ' + sn;
    if (g > 1) out += ' = ' + fs(sn, sd);
    if (sn > sd) out += ' = ' + Math.floor(sn / sd) + ' ' + fs(sn % sd, sd);
    return out;
  }
  function choiceQ(prompt, values, ans, label, rng) {
    return { ui: 'choice', prompt: prompt, data: { options: rng.shuffle(values).map(function (v) { return { v: v, label: label ? label(v) : f(v) }; }) }, answer: ans };
  }
  function yesNo(prompt, ans, rng) { return { ui: 'choice', prompt: prompt, data: { options: G.textOpts([[true, t('q_yes')], [false, t('q_no')]], rng) }, answer: ans }; }
  function money(n) { return G.money(n); }

  /* ---------------------------------------------------------------- drawings */
  function fitter(points, W, H, pad) {
    var xs = points.map(function (p) { return p[0]; }), ys = points.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var s = Math.min((W - 2 * pad) / ((x1 - x0) || 1), (H - 2 * pad) / ((y1 - y0) || 1));
    var ox = pad + ((W - 2 * pad) - (x1 - x0) * s) / 2, oy = pad + ((H - 2 * pad) - (y1 - y0) * s) / 2;
    return function (p) { return [ox + (p[0] - x0) * s, oy + (p[1] - y0) * s]; };
  }
  function dashed(a, b) { return '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="#FF7A7A" stroke-width="2.5" stroke-dasharray="6 5"/>'; }
  /* polygon with a label inside each corner (toward the middle) */
  function cornerFig(pts, labels, fill) {
    var W = 320, H = 220, T = fitter(pts, W, H, 36), P = pts.map(T), g = S.poly(P, fill || '#FFE3A3');
    var cx = U.avg(P, function (p) { return p[0]; }), cy = U.avg(P, function (p) { return p[1]; });
    P.forEach(function (p, i) {
      if (labels[i] == null) return;
      var dx = cx - p[0], dy = cy - p[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      g += S.text(p[0] + dx / len * 34, p[1] + dy / len * 34, labels[i], { size: 17, fill: '#5B3CC4' });
    });
    return S.wrap(W, H, g, { width: 300 });
  }
  /* triangle whose corners at the base have the angles A and B (drawn to scale) */
  function triangleByAngles(A, B) {
    var a = A * Math.PI / 180, b = B * Math.PI / 180, side = Math.sin(b) / Math.sin(a + b);
    return [[0, 0], [1, 0], [side * Math.cos(a), -side * Math.sin(a)]];
  }
  function straightFig(A, lab1, lab2) {
    var cx = 160, cy = 130, a = A * Math.PI / 180, g = '';
    g += '<line x1="20" y1="' + cy + '" x2="300" y2="' + cy + '" stroke="#23233A" stroke-width="4" stroke-linecap="round"/>';
    g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + 125 * Math.cos(a)).toFixed(1) + '" y2="' + (cy - 125 * Math.sin(a)).toFixed(1) + '" stroke="#23233A" stroke-width="4" stroke-linecap="round"/>';
    var m1 = a / 2, m2 = (a + Math.PI) / 2;
    g += S.text(cx + 62 * Math.cos(m1), cy - 62 * Math.sin(m1), lab1, { size: 17, fill: '#5B3CC4' });
    g += S.text(cx + 62 * Math.cos(m2), cy - 62 * Math.sin(m2), lab2, { size: 17, fill: '#FF6B6B' });
    return S.wrap(320, 150, g, { width: 300 });
  }
  /* shape with dimension labels: base label below, optional top label, dashed height with its label */
  function dimFig(pts, o) {
    var W = 330, H = 220, T = fitter(pts, W, H, 40), P = pts.map(T), g = S.poly(P, '#C5E8FF');
    if (o.h) { var a = T(o.h[0]), b = T(o.h[1]); g += dashed(a, b) + S.text((a[0] + b[0]) / 2 + 10, (a[1] + b[1]) / 2, o.hl, { size: 15, anchor: 'start', fill: '#D9480F' }); }
    var bl = T(o.base[0]), br = T(o.base[1]);
    g += S.text((bl[0] + br[0]) / 2, Math.max(bl[1], br[1]) + 20, o.bl, { size: 15 });
    if (o.top) { var tl = T(o.top[0]), tr = T(o.top[1]); g += S.text((tl[0] + tr[0]) / 2, Math.min(tl[1], tr[1]) - 14, o.tl, { size: 15 }); }
    return S.wrap(W, H, g, { width: 310 });
  }
  function circleFig(label, diameter) {
    var g = '<circle cx="140" cy="110" r="88" fill="#FFE3A3" stroke="#23233A" stroke-width="3"/><circle cx="140" cy="110" r="4" fill="#23233A"/>';
    g += diameter ? '<line x1="52" y1="110" x2="228" y2="110" stroke="#D9480F" stroke-width="3"/>' : '<line x1="140" y1="110" x2="228" y2="110" stroke="#D9480F" stroke-width="3"/>';
    g += S.text(diameter ? 140 : 184, 96, label, { size: 15, fill: '#D9480F' });
    return S.wrap(280, 220, g, { width: 240 });
  }
  function boxFig(l, w, h, labs) {
    var s = Math.min(150 / l, 110 / h, 120 / w), L = l * s, Hh = h * s, D = w * s * .45, x0 = 60, y0 = 24 + D, g = '';
    var fr = [[x0, y0], [x0 + L, y0], [x0 + L, y0 + Hh], [x0, y0 + Hh]], tp = [[x0, y0], [x0 + D, y0 - D], [x0 + L + D, y0 - D], [x0 + L, y0]];
    var sd = [[x0 + L, y0], [x0 + L + D, y0 - D], [x0 + L + D, y0 + Hh - D], [x0 + L, y0 + Hh]];
    g += S.poly(tp, '#D8CCFF', { sw: 2 }) + S.poly(sd, '#B9A6FF', { sw: 2 }) + S.poly(fr, '#EFE9FF', { sw: 2 });
    g += S.text(x0 + L / 2, y0 + Hh + 18, labs[0], { size: 15 }) + S.text(x0 - 8, y0 + Hh / 2, labs[2], { size: 15, anchor: 'end' });
    g += S.text(x0 + L + D / 2 + 10, y0 + Hh - D / 2 + 4, labs[1], { size: 15, anchor: 'start' });
    return S.wrap(x0 + L + D + 100, y0 + Hh + 34, g, { width: 320 });
  }
  function marblesFig(counts) {
    var em = { red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡' }, all = [];
    Object.keys(counts).forEach(function (k) { for (var i = 0; i < counts[k]; i++) all.push(em[k]); });
    var per = 10, g = '';
    all.forEach(function (e, i) { g += S.emoji(22 + (i % per) * 30, 22 + Math.floor(i / per) * 30, e, 24); });
    return S.wrap(per * 30 + 14, Math.ceil(all.length / per) * 30 + 14, g, { width: 300 });
  }

  /* ---------------------------------------------------------------- divisibility, factors, primes */
  G.register('divis', function (c) {
    var rng = c.rng, p = c.p, L = c.level, kind = p.kind, q, opts, guard = 0;
    if (kind === 'rules') {
      var k = rng.pick(L <= 1 ? [2, 5, 10] : L <= 3 ? [2, 3, 5, 9, 10] : [3, 4, 6, 9]), lo = L <= 2 ? 100 : 1000, hi = L <= 2 ? 999 : 9999;
      if (L % 2 === 1) {
        var yes = k * rng.int(Math.ceil(lo / k), Math.floor(hi / k));
        opts = [yes];
        while (opts.length < 4 && guard++ < 300) { var x = rng.int(lo, hi); if (x % k && opts.indexOf(x) < 0) opts.push(x); }
        q = choiceQ(t('q_dv_which', { k: k }), opts, yes, null, rng);
        q.explain = { text: m(f(yes) + ' = ' + k + ' × ' + f(yes / k)) };
        q.sig = 'dv:w' + k + ':' + yes;
      } else {
        var n = rng.int(lo, hi);
        if (rng.chance(.5)) n -= n % k;
        q = yesNo(t('q_dv_is', { n: f(n), k: k }), n % k === 0, rng);
        q.explain = { text: n % k === 0 ? m(f(n) + ' = ' + k + ' × ' + f(n / k)) : t('dv_rem', { e: m(f(n) + ' ÷ ' + k), r: n % k }) };
        q.sig = 'dv:i' + k + ':' + n;
      }
      q.hints = G.hintList(t('hc_dv_' + k));
      return q;
    }
    if (kind === 'factors') {
      var N;
      if (L <= 2) {
        N = rng.pick([12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 54, 56, 60, 64, 72, 80, 84, 90, 96, 100]);
        var right = rng.pick(factors(N).filter(function (x) { return x > 1 && x < N; })), wrong = U.range(2, N).filter(function (x) { return N % x; });
        q = choiceQ(t('q_dv_factor_which', { n: N }), [right].concat(rng.sample(wrong, 3)), right, null, rng);
        q.explain = { text: m(f(N) + ' = ' + right + ' × ' + N / right) };
        q.sig = 'dv:f' + N + ':' + right;
      } else {
        N = rng.int(L <= 3 ? 10 : 20, L <= 3 ? 50 : 100);
        q = intQ(t('q_dv_factor_count', { n: N }), factors(N).length);
        q.explain = { text: m(factors(N).join(', ')) };
        q.sig = 'dv:fc' + N;
      }
      q.hints = G.hintList(t('hc_dv_factors', { n: N }));
      return q;
    }
    if (kind === 'multiples') {
      var k2 = rng.int(L <= 2 ? 3 : 6, L <= 2 ? 9 : 15);
      if (L <= 3) {
        var yes2 = k2 * rng.int(3, 9 + L * 3);
        opts = [yes2];
        while (opts.length < 4 && guard++ < 300) { var z = yes2 + rng.int(-k2 * 2, k2 * 2); if (z > 1 && z % k2 && opts.indexOf(z) < 0) opts.push(z); }
        q = choiceQ(t('q_dv_mult_which', { k: k2 }), opts, yes2, null, rng);
        q.explain = { text: m(k2 + ' × ' + yes2 / k2 + ' = ' + yes2) };
        q.sig = 'dv:m' + k2 + ':' + yes2;
      } else {
        var X = rng.int(50, 300), ans = (Math.floor(X / k2) + 1) * k2;
        q = intQ(t('q_dv_mult_next', { k: k2, n: X }), ans);
        q.explain = { text: m(k2 + ' × ' + ans / k2 + ' = ' + ans) };
        q.sig = 'dv:mn' + k2 + ':' + X;
      }
      q.hints = G.hintList(t('hc_dv_mult', { k: k2 }));
      return q;
    }
    if (kind === 'prime') {
      var lim = L <= 2 ? 50 : L <= 4 ? 100 : 200, primes = U.range(11, lim + 1).filter(isPrime);
      var comps = U.range(9, lim + 1).filter(function (x) { return !isPrime(x) && (L <= 2 || x % 2 === 1); });
      if (L % 2 === 1) {
        var pr = rng.pick(primes);
        q = choiceQ(t('q_dv_prime_which'), [pr].concat(rng.sample(comps, 3)), pr, null, rng);
        q.explain = { text: t('dv_prime_yes', { n: pr }) };
        q.sig = 'dv:p' + pr;
      } else {
        var n2 = rng.chance(.5) ? rng.pick(primes) : rng.pick(comps), isP = isPrime(n2);
        q = yesNo(t('q_dv_prime_is', { n: n2 }), isP, rng);
        var sf = factors(n2)[1];
        q.explain = { text: isP ? t('dv_prime_yes', { n: n2 }) : m(n2 + ' = ' + sf + ' × ' + n2 / sf) };
        q.sig = 'dv:pi' + n2;
      }
      q.hints = G.hintList(t('hc_dv_prime'));
      return q;
    }
    if (kind === 'factorize') {
      var pool = U.range(12, L <= 2 ? 60 : L <= 4 ? 150 : 360).filter(function (x) { return primeFactors(x).length >= (L <= 2 ? 2 : 3) && primeFactors(x).length <= (L <= 2 ? 3 : 5); });
      var N3 = rng.pick(pool), pf = primeFactors(N3), lab = function (arr) { return arr.slice().sort(function (a, b) { return a - b; }).join(' × '); }, cands = [];
      for (var i = 0; i + 1 < pf.length; i++) { var comb = pf.slice(); comb.splice(i, 2, pf[i] * pf[i + 1]); cands.push(lab(comb)); }
      cands.push(lab(pf.slice(1)), lab(pf.concat([2])), lab(pf.slice(0, -1).concat([pf[pf.length - 1] === 2 ? 3 : 2])), lab(pf.concat([3])));
      var good = lab(pf), wrongs = U.uniq(cands).filter(function (s) { return s !== good && s.length; });
      if (wrongs.length < 3) return null;
      q = choiceQ(t('q_dv_factorize', { n: N3 }), [good].concat(rng.sample(wrongs, 3)), good, function (v) { return m(v); }, rng);
      q.hints = G.hintList(t('hc_dv_factorize'));
      q.explain = { text: m(N3 + ' = ' + good) };
      q.sig = 'dv:pf' + N3;
      q.verify = function () { return pf.reduce(function (a, b) { return a * b; }, 1) === N3 && pf.every(isPrime); };
      return q;
    }
    if (kind === 'gcd') {
      var g = rng.pick(L <= 2 ? [2, 3, 4, 5, 6] : [4, 5, 6, 7, 8, 9, 12, 15]), xs, guard2 = 0;
      do { xs = [rng.int(2, L <= 2 ? 6 : 10), rng.int(2, L <= 2 ? 6 : 10)]; } while ((xs[0] === xs[1] || gcd(xs[0], xs[1]) !== 1) && guard2++ < 50);
      if (gcd(xs[0], xs[1]) !== 1 || xs[0] === xs[1]) return null;
      var A = g * xs[0], B = g * xs[1];
      q = intQ(t('q_dv_gcd', { a: A, b: B }), g);
      q.hints = G.hintList(t('hc_dv_gcd'));
      q.explain = { text: m(A + ' = ' + g + ' × ' + xs[0] + ', ' + B + ' = ' + g + ' × ' + xs[1]) };
      q.sig = 'dv:g' + A + ',' + B;
      q.verify = function () { return gcd(A, B) === g; };
      return q;
    }
    if (kind === 'lcm') {
      var a2 = rng.int(2, L <= 2 ? 10 : 15), b2 = rng.int(2, L <= 2 ? 10 : 15), l2 = lcm(a2, b2);
      if (a2 === b2 || l2 > 150 || l2 === Math.max(a2, b2) && L >= 3) return null;
      q = intQ(t('q_dv_lcm', { a: a2, b: b2 }), l2);
      q.hints = G.hintList(t('hc_dv_lcm'));
      q.explain = { text: m(a2 + ' × ' + l2 / a2 + ' = ' + b2 + ' × ' + l2 / b2 + ' = ' + l2) };
      q.sig = 'dv:l' + a2 + ',' + b2;
      return q;
    }
    return null;
  });

  /* ---------------------------------------------------------------- order of operations, squares, simple equations */
  G.register('orderops', function (c) {
    var rng = c.rng, p = c.p, L = c.level, kind = p.kind, N = function (a, b) { return rng.int(a, b); }, e, v, s, q;
    if (kind === 'basic') {
      var forms = L <= 1 ? [0, 4] : L <= 2 ? [0, 1, 4] : L <= 3 ? [0, 1, 3, 4] : [0, 1, 2, 3, 4, 5], fm = rng.pick(forms), big = L >= 4 ? 20 : 9;
      var a = N(2, 30), b = N(2, big), cc = N(2, 9), d = N(2, 9);
      if (fm === 0) { e = a + ' + ' + b + ' × ' + cc; s = a + ' + ' + b * cc; v = a + b * cc; }
      else if (fm === 1) { a = b * cc + N(1, 40); e = a + ' − ' + b + ' × ' + cc; s = a + ' − ' + b * cc; v = a - b * cc; }
      else if (fm === 2) { e = a + ' × ' + cc + ' + ' + b + ' × ' + d; s = a * cc + ' + ' + b * d; v = a * cc + b * d; }
      else if (fm === 3) { var k = N(2, big); e = a + ' + ' + cc * k + ' ÷ ' + cc; s = a + ' + ' + k; v = a + k; }
      else if (fm === 4) { var pr = b * cc, sub2 = N(1, pr - 1); e = b + ' × ' + cc + ' − ' + sub2; s = pr + ' − ' + sub2; v = pr - sub2; }
      else { var k2 = N(2, 9); e = d * k2 + ' ÷ ' + d + ' + ' + b + ' × ' + cc; s = k2 + ' + ' + b * cc; v = k2 + b * cc; }
      q = intQ(t('q_oo_basic'), v, { eq: e + ' = _' });
      q.hints = G.hintList(t('hc_oo_basic'));
    } else if (kind === 'paren') {
      var pforms = L <= 2 ? [0, 1, 3] : L <= 3 ? [0, 1, 2, 3] : p.hard ? [2, 4, 5, 6] : [0, 1, 2, 3, 4, 5], pf = rng.pick(pforms);
      var x = N(2, 12), y = N(2, 12), z = N(2, 9), w = N(2, 9);
      if (pf === 0) { e = '(' + x + ' + ' + y + ') × ' + z; s = (x + y) + ' × ' + z; v = (x + y) * z; }
      else if (pf === 1) { var hi = Math.max(x, y) + N(1, 6), lo = Math.min(x, y); e = z + ' × (' + hi + ' − ' + lo + ')'; s = z + ' × ' + (hi - lo); v = z * (hi - lo); }
      else if (pf === 2) { var qq = N(2, 12), dsum = z * qq, aa = N(dsum + 1, dsum + 40); e = '(' + aa + ' − ' + (aa - dsum) + ') ÷ ' + z; s = dsum + ' ÷ ' + z; v = qq; }
      else if (pf === 3) { var big2 = x + y + N(2, 50); e = big2 + ' − (' + x + ' + ' + y + ')'; s = big2 + ' − ' + (x + y); v = big2 - x - y; }
      else if (pf === 4) { var c2 = w + N(1, 8); e = '(' + x + ' + ' + y + ') × (' + c2 + ' − ' + w + ')'; s = (x + y) + ' × ' + (c2 - w); v = (x + y) * (c2 - w); }
      else if (pf === 5) { var prod = z * (x + y), dd = N(1, prod - 1); e = z + ' × (' + x + ' + ' + y + ') − ' + dd; s = prod + ' − ' + dd; v = prod - dd; }
      else { var dv = N(2, 6), inner, a3, b3, c3, guard3 = 0; do { a3 = N(1, 20); b3 = N(2, 9); c3 = N(2, 9); inner = a3 + b3 * c3; } while (inner % dv && guard3++ < 60); if (inner % dv) return null; e = '(' + a3 + ' + ' + b3 + ' × ' + c3 + ') ÷ ' + dv; s = inner + ' ÷ ' + dv; v = inner / dv; }
      q = intQ(t('q_oo_paren'), v, { eq: e + ' = _' });
      q.hints = G.hintList(t('hc_oo_paren'), t('hc_oo_basic'));
    } else if (kind === 'squares') {
      var sf = L <= 2 ? 0 : L <= 3 ? rng.pick([0, 1]) : rng.pick([1, 2, 3]), n = N(2, L <= 2 ? 12 : 20), b4 = N(2, 30), n2 = N(2, 9);
      if (sf === 0) { e = n + '²'; s = n + ' × ' + n; v = n * n; }
      else if (sf === 1) { e = n + '² + ' + b4; s = n * n + ' + ' + b4; v = n * n + b4; }
      else if (sf === 2) { e = '(' + n2 + ' + ' + (n2 + 1) + ')²'; s = (2 * n2 + 1) + ' × ' + (2 * n2 + 1); v = (2 * n2 + 1) * (2 * n2 + 1); }
      else { var hi2 = N(5, 15), lo2 = N(2, hi2 - 1); e = hi2 + '² − ' + lo2 + '²'; s = hi2 * hi2 + ' − ' + lo2 * lo2; v = hi2 * hi2 - lo2 * lo2; }
      q = intQ(t('q_oo_sq'), v, { eq: e + ' = _' });
      q.hints = G.hintList(t('hc_oo_sq', { e: m('5² = 5 × 5 = 25') }));
    } else if (kind === 'missing') {
      var mf = p.hard ? rng.pick([2, 3]) : L <= 2 ? rng.pick([0, 1]) : L <= 3 ? rng.pick([0, 1, 2]) : rng.pick([0, 2, 3]), X = N(2, p.hard && L >= 3 ? 20 : 12), k3 = N(2, p.hard && L >= 4 ? 12 : 9), b5 = N(1, 20), eqs;
      if (mf === 0) { eqs = k3 + ' × _ + ' + b5 + ' = ' + (k3 * X + b5); e = k3 + ' × ' + X + ' + ' + b5; }
      else if (mf === 1) { eqs = '_ ÷ ' + k3 + ' = ' + X; e = k3 * X + ' ÷ ' + k3; X = k3 * X; }
      else if (mf === 2) { eqs = '( _ + ' + b5 + ' ) × ' + k3 + ' = ' + (X + b5) * k3; e = '(' + X + ' + ' + b5 + ') × ' + k3; }
      else { var cx2 = k3 * X - b5; if (cx2 <= 0) return null; eqs = k3 + ' × _ − ' + b5 + ' = ' + cx2; e = k3 + ' × ' + X + ' − ' + b5; }
      q = intQ(t('q_oo_miss'), X, { eq: eqs });
      q.hints = G.hintList(t('hc_oo_miss'));
      q.explain = { text: m(e + ' = ' + eqs.split('= ').pop()) };
      q.sig = 'oo:m' + eqs;
      return q;
    } else return null;
    q.explain = { text: m(e + ' = ' + s + ' = ' + v) };
    q.sig = 'oo:' + kind + ':' + e;
    q.verify = function () { return v >= 0 && Math.round(v) === v; };
    return q;
  });

  /* ---------------------------------------------------------------- fractions with different denominators */
  G.register('fracadd', function (c) {
    var rng = c.rng, p = c.p, L = c.level, op = p.op === 'mix' ? rng.pick(['+', '-']) : p.op, mixed = !!p.mixed && L >= 2, d1, d2, guard = 0;
    if (L <= 2 && !p.hard) { d1 = rng.pick([2, 3, 4, 5]); d2 = d1 * rng.pick([2, 3]); }
    else { do { d1 = rng.int(2, p.hard ? 12 : 10); d2 = rng.int(2, p.hard ? 12 : 10); } while ((d1 === d2 || lcm(d1, d2) > (p.hard ? 72 : 60)) && guard++ < 60); if (d1 === d2) return null; }
    if (rng.chance(.5)) { var tmp = d1; d1 = d2; d2 = tmp; }
    var a = coprime(rng, d1), b = coprime(rng, d2), wa = mixed ? rng.int(1, 4) : 0, wb = mixed ? (op === '-' ? rng.int(0, wa - 1) : rng.int(1, 3)) : 0;
    var nA = wa * d1 + a, nB = wb * d2 + b, D = lcm(d1, d2), uA = nA * D / d1, uB = nB * D / d2, R = op === '+' ? uA + uB : uA - uB;
    if (R <= 0 || (mixed && (R % D === 0 || R < D)) || (!mixed && L <= 2 && R >= D)) return null;
    var sym = op === '+' ? '+' : '−', tokA = wa ? { mixed: [wa, a, d1] } : { frac: [a, d1] }, tokB = wb ? { mixed: [wb, b, d2] } : { frac: [b, d2] };
    var ans = mixed ? { w: Math.floor(R / D), n: R % D, d: D } : { n: R, d: D };
    var q = mixed ? fracQ(t('q_solve'), [tokA, sym, tokB, '='], ans, true) : fracOrInt(t('q_solve'), [tokA, sym, tokB, '='], ans);
    q.hints = G.hintList(t('hc_fa_common', { d: D }), mixed ? t('hc_fa_mixed') : { text: m(fs(uA, D) + ' ' + sym + ' ' + fs(uB, D) + ' = ?') });
    q.explain = { text: m(fs(nA, d1) + ' ' + sym + ' ' + fs(nB, d2) + ' = ' + fs(uA, D) + ' ' + sym + ' ' + fs(uB, D) + ' = ' + fs(R, D) + simpler(R, D)) };
    q.sig = 'fa:' + op + ':' + nA + '/' + d1 + ',' + nB + '/' + d2;
    q.verify = function () { return Math.abs((op === '+' ? nA / d1 + nB / d2 : nA / d1 - nB / d2) - R / D) < 1e-9; };
    return q;
  });

  /* ---------------------------------------------------------------- multiplying and dividing fractions */
  G.register('fracmul', function (c) {
    var rng = c.rng, p = c.p, L = c.level, kind = p.kind, dens = [2, 3, 4, 5, 6, 8, 10], q, toks, ans, steps;
    var a = function (d) { return coprime(rng, d); };
    if (kind === 'whole') {
      var k = rng.int(2, L <= 2 ? 5 : 9), d = rng.pick(dens.concat([12])), n = a(d);
      toks = [String(k), '×', { frac: [n, d] }, '=']; ans = { n: k * n, d: d }; steps = k + ' × ' + fs(n, d) + ' = ' + fs(k * n, d);
      q = fracOrInt(t('q_solve'), toks, ans); q.hints = G.hintList(t('hc_fm_whole'));
    } else if (kind === 'frac') {
      var b1 = rng.pick(dens), b2 = rng.pick(dens), a1 = a(b1), a2 = a(b2);
      toks = [{ frac: [a1, b1] }, '×', { frac: [a2, b2] }, '=']; ans = { n: a1 * a2, d: b1 * b2 }; steps = fs(a1, b1) + ' × ' + fs(a2, b2) + ' = ' + fs(a1 * a2, b1 * b2);
      q = fracOrInt(t('q_solve'), toks, ans); q.hints = G.hintList(t('hc_fm_frac'));
    } else if (kind === 'div') {
      var form = L <= 2 ? 0 : L <= 3 ? rng.pick([0, 1]) : rng.pick([1, 2]), d3 = rng.pick(dens), n3 = a(d3), k3 = rng.int(2, 6);
      if (form === 0) { toks = [{ frac: [n3, d3] }, '÷', String(k3), '=']; ans = { n: n3, d: d3 * k3 }; steps = fs(n3, d3) + ' × ' + fs(1, k3) + ' = ' + fs(n3, d3 * k3); q = fracOrInt(t('q_solve'), toks, ans); q.hints = G.hintList(t('hc_fm_divwhole'), t('hc_fm_div')); }
      else if (form === 1) { toks = [String(k3), '÷', { frac: [n3, d3] }, '=']; ans = { n: k3 * d3, d: n3 }; steps = k3 + ' × ' + fs(d3, n3) + ' = ' + fs(k3 * d3, n3); q = fracOrInt(t('q_solve'), toks, ans); q.hints = G.hintList(t('hc_fm_div')); }
      else { var d4 = rng.pick(dens), n4 = a(d4); toks = [{ frac: [n3, d3] }, '÷', { frac: [n4, d4] }, '=']; ans = { n: n3 * d4, d: d3 * n4 }; steps = fs(n3, d3) + ' × ' + fs(d4, n4) + ' = ' + fs(n3 * d4, d3 * n4); q = fracOrInt(t('q_solve'), toks, ans); q.hints = G.hintList(t('hc_fm_div')); }
    } else return null;
    q.explain = { text: m(steps + simpler(ans.n, ans.d)) };
    q.sig = 'fm:' + kind + ':' + JSON.stringify(toks);
    return q;
  });

  /* ---------------------------------------------------------------- decimal calculations (integer arithmetic in small units) */
  function dv(units, places) { return units / Math.pow(10, places); }
  G.register('decop', function (c) {
    var rng = c.rng, p = c.p, L = c.level, kind = p.kind === 'mix' ? rng.pick(['add', 'sub', 'mulwhole', 'pow10']) : p.kind, q, a, b, ans, sym;
    if (kind === 'add' || kind === 'sub') {
      var pa = L <= 1 ? 1 : L <= 3 ? rng.pick([1, 2]) : 2, pb = L <= 2 ? pa : rng.pick([1, 2]), P = Math.max(pa, pb);
      var A = rng.int(L <= 2 ? 11 : 101, L <= 2 ? 999 : 9999), B = rng.int(L <= 2 ? 11 : 101, L <= 2 ? 999 : 9999);
      if (A % 10 === 0 || B % 10 === 0) return null;
      var Au = A * Math.pow(10, P - pa), Bu = B * Math.pow(10, P - pb);
      if (kind === 'sub' && Bu > Au) { var tu = Au; Au = Bu; Bu = tu; tu = pa; pa = pb; pb = tu; tu = A; A = B; B = tu; }
      var Ru = kind === 'add' ? Au + Bu : Au - Bu;
      if (Ru <= 0) return null;
      a = dv(A, pa); b = dv(B, pb); ans = dv(Ru, P); sym = kind === 'add' ? '+' : '−';
      q = decQ(t('q_solve'), ans, { eq: fd(a) + ' ' + sym + ' ' + fd(b) + ' = _' });
      q.hints = G.hintList(t('hc_dc_add'));
    } else if (kind === 'pow10') {
      var pw = L <= 1 ? 10 : L <= 2 ? rng.pick([10, 100]) : rng.pick([10, 100, 1000]), mul = rng.chance(.5);
      if (p.whole) { var base = rng.int(2, 999); a = mul ? base : base * pw; ans = mul ? base * pw : base; }
      else { var pl = rng.pick([1, 2]), U1 = rng.int(11, 9999); if (U1 % 10 === 0) return null; a = dv(U1, pl); ans = mul ? dv(U1 * pw, pl) : dv(U1, pl + Math.round(Math.log(pw) / Math.LN10)); }
      sym = mul ? '×' : '÷';
      q = p.whole ? intQ(t('q_solve'), ans, { eq: f(a) + ' ' + sym + ' ' + f(pw) + ' = _' }) : decQ(t('q_solve'), ans, { eq: fd(a) + ' ' + sym + ' ' + f(pw) + ' = _' });
      q.hints = G.hintList(t('hc_dc_pow'));
      b = pw;
    } else if (kind === 'round') {
      var keys = L <= 1 ? ['1'] : L <= 3 ? ['1', '01'] : p.hard ? ['01', '001'] : ['1', '01', '001'], key = rng.pick(keys), X = rng.int(1001, 99999);
      if (X % 10 === 0) return null;
      var unit = key === '1' ? 1000 : key === '01' ? 100 : 10, Ru2 = Math.round(X / unit) * unit;
      a = dv(X, 3); ans = dv(Ru2, 3);
      q = decQ(t('q_dc_round_' + key, { n: m(fd(a)) }), ans);
      q.hints = G.hintList(t('hc_dc_round'));
      q.explain = { text: m(fd(a) + ' ≈ ' + fd(ans)) };
      q.sig = 'dc:r' + key + ':' + X;
      return q;
    } else if (kind === 'mulwhole') {
      var pl2 = L <= 2 ? 1 : rng.pick([1, 2]), A2 = rng.int(11, L <= 2 ? 99 : 999), k = rng.int(2, 9);
      if (A2 % 10 === 0) return null;
      a = dv(A2, pl2); b = k; ans = dv(A2 * k, pl2); sym = '×';
      q = decQ(t('q_solve'), ans, { eq: fd(a) + ' × ' + k + ' = _' });
      q.hints = G.hintList(t('hc_dc_mul'));
    } else if (kind === 'mul') {
      var p1 = 1, p2 = L >= 4 ? rng.pick([1, 2]) : 1, A3 = rng.int(2, 99), B3 = rng.int(2, L >= 4 ? 99 : 9);
      if (A3 % 10 === 0 || B3 % 10 === 0) return null;
      a = dv(A3, p1); b = dv(B3, p2); ans = dv(A3 * B3, p1 + p2); sym = '×';
      q = decQ(t('q_solve'), ans, { eq: fd(a) + ' × ' + fd(b) + ' = _' });
      q.hints = G.hintList(t('hc_dc_mul'));
    } else if (kind === 'divwhole') {
      var k4 = rng.int(2, 9), pq = L <= 2 ? 1 : rng.pick([1, 2]), Q = rng.int(11, L <= 2 ? 99 : 999);
      if (Q % 10 === 0) return null;
      a = dv(Q * k4, pq); b = k4; ans = dv(Q, pq); sym = '÷';
      q = decQ(t('q_solve'), ans, { eq: fd(a) + ' ÷ ' + k4 + ' = _' });
      q.hints = G.hintList(t('hc_dc_div'));
    } else return null;
    q.explain = { text: m(fd(a) + ' ' + sym + ' ' + fd(b) + ' = ' + fd(ans)) };
    q.sig = 'dc:' + kind + ':' + a + sym + b;
    return q;
  });

  /* ---------------------------------------------------------------- percent, ratio, rates, scale, speed */
  var PCT = [[10, 50], [10, 20, 25, 50], [5, 15, 30, 40, 60, 75], [12, 35, 45, 65, 80, 90], [5, 12, 15, 35, 45, 65, 85, 95]];
  G.register('pct', function (c) {
    var rng = c.rng, p = c.p, L = c.level, kind = p.kind, q, ans, cur = G.lang() === 'he' ? { unit: '₪' } : { prefix: '$' };
    if (kind === 'meaning') {
      var k = L <= 1 ? 10 * rng.int(1, 9) : rng.int(3, 97), not = L >= 3 && rng.chance(.5);
      ans = not ? 100 - k : k;
      q = intQ(t(not ? 'q_pc_grid_not' : 'q_pc_grid'), ans, { unit: '%', visual: S.fracGrid(10, 10, U.range(k), { cell: 17, width: 190 }) });
      q.hints = G.hintList(t('hc_pc_grid'));
      q.explain = { text: m(ans + '/100 = ' + ans + '%') };
      q.sig = 'pc:g' + k + not;
      return q;
    }
    if (kind === 'convert') {
      var form = L <= 1 ? 0 : L <= 2 ? rng.pick([0, 1, 2]) : rng.pick([0, 1, 2, 3]);
      if (form === 0) {
        var d = rng.pick(L <= 1 ? [2, 4, 5, 10] : [4, 5, 10, 20, 25, 50]), n = coprime(rng, d);
        ans = n * 100 / d;
        q = intQ(t('q_pc_to_pct'), ans, { unit: '%', eq: n + '/' + d + ' = _' });
        q.data.eq = [{ frac: [n, d] }, '=', { blank: true }];
        q.explain = { text: m(fs(n, d) + ' = ' + fs(ans, 100) + ' = ' + ans + '%') };
        q.sig = 'pc:fp' + n + '/' + d;
      } else if (form === 1) {
        var hu = rng.int(1, 99);
        q = intQ(t('q_pc_to_pct'), hu, { unit: '%' });
        q.data.eq = [fd(hu / 100), '=', { blank: true }];
        q.explain = { text: m(fd(hu / 100) + ' = ' + fs(hu, 100) + ' = ' + hu + '%') };
        q.sig = 'pc:dp' + hu;
      } else if (form === 2) {
        var hv = rng.int(1, 99);
        q = decQ(t('q_pc_to_dec'), hv / 100);
        q.data.eq = [hv + '%', '=', { blank: true }];
        q.explain = { text: m(hv + '% = ' + fs(hv, 100) + ' = ' + fd(hv / 100)) };
        q.sig = 'pc:pd' + hv;
      } else {
        var pv = rng.pick([10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]), g = gcd(pv, 100);
        q = fracQ(t('q_pc_to_frac'), [pv + '%', '='], { n: pv / g, d: 100 / g });
        q.explain = { text: m(pv + '% = ' + fs(pv, 100) + ' = ' + fs(pv / g, 100 / g)) };
        q.sig = 'pc:pf' + pv;
      }
      q.hints = G.hintList(t('hc_pc_conv', { e: m('35% = 35/100 = 0.35') }));
      return q;
    }
    if (kind === 'of') {
      var pc = rng.pick(PCT[L - 1]), step = 100 / gcd(pc, 100), N = step * rng.int(L <= 2 ? 1 : 2, L <= 2 ? Math.max(2, Math.floor(200 / step)) : Math.max(3, Math.floor(1000 / step)));
      ans = pc * N / 100;
      q = intQ(t('q_pc_of', { p: m(pc + '%'), n: f(N) }), ans);
      q.hints = G.hintList(t('hc_pc_of'), { text: m('10% = ' + f(N / 10)) });
      q.explain = { text: m(f(N) + ' × ' + pc + ' ÷ 100 = ' + f(ans)) };
      q.sig = 'pc:of' + pc + ',' + N;
      return q;
    }
    if (kind === 'discount') {
      var up = L >= 4 && rng.chance(.4), pc2 = rng.pick(L <= 2 ? [10, 20, 25, 50] : [5, 10, 15, 20, 25, 30, 40, 50, 75]), step2 = 100 / gcd(pc2, 100);
      var price = step2 * rng.int(Math.max(1, Math.ceil(20 / step2)), Math.max(2, Math.floor(600 / step2))), change = pc2 * price / 100, item = rng.pick(list('pc_items'));
      ans = up ? price + change : price - change;
      q = intQ(t(up ? 'q_pc_up' : 'q_pc_disc', { item: item, price: money(price), p: m(pc2 + '%') }), ans, cur);
      q.hints = G.hintList(t(up ? 'hc_pc_up' : 'hc_pc_disc', { p: m(pc2 + '%') }));
      q.explain = { text: m(f(price) + (up ? ' + ' : ' − ') + f(change) + ' = ' + f(ans)) };
      q.sig = 'pc:d' + up + pc2 + ',' + price;
      return q;
    }
    if (kind === 'ratio') {
      var pair = rng.pick(list('pc_pairs')), x = rng.int(1, 6), y = rng.int(1, 6);
      if (gcd(x, y) !== 1 || x === y) return null;
      if (L <= 2) {
        var mult = rng.int(2, 6), A = x * mult, B = y * mult, lab = function (r) { return m(r[0] + ' : ' + r[1]); };
        var opts = [[x, y], [y, x], [x, x + y], [x + 1, y]].filter(function (r, i, all) { return all.findIndex(function (o) { return o[0] === r[0] && o[1] === r[1]; }) === i; });
        if (opts.length < 4) return null;
        q = { ui: 'choice', prompt: t('q_pc_ratio', { a: A, b: B, x: pair[0], y: pair[1] }), data: { options: rng.shuffle(opts.map(function (r) { return { v: r[0] + ':' + r[1], label: lab(r) }; })) }, answer: x + ':' + y };
        q.hints = G.hintList(t('hc_pc_ratio'));
        q.explain = { text: m(A + ' : ' + B + ' = ' + x + ' : ' + y) };
        q.sig = 'pc:r' + A + ':' + B;
        return q;
      }
      var parts = x + y, share = rng.int(2, L >= 4 ? 25 : 12), total = parts * share;
      ans = Math.max(x, y) * share;
      q = intQ(t('q_pc_share', { n: total, x: rng.pick(list('pc_share_items')), r: m(x + ' : ' + y) }), ans);
      q.hints = G.hintList(t('hc_pc_share'));
      q.explain = { text: m(total + ' ÷ ' + parts + ' = ' + share + ', ' + share + ' × ' + Math.max(x, y) + ' = ' + ans) };
      q.sig = 'pc:s' + total + ':' + x + y;
      return q;
    }
    if (kind === 'rate') {
      var u = rng.int(2, L <= 2 ? 9 : 25), k1 = rng.int(2, 6), k2 = rng.int(2, L <= 2 ? 10 : 15), thing = rng.pick(list('pc_rate_items'));
      if (k1 === k2) return null;
      ans = u * k2;
      q = intQ(t('q_pc_rate', { a: k1, b: k2, x: thing, p: money(u * k1) }), ans, cur);
      q.hints = G.hintList(t('hc_pc_rate'));
      q.explain = { text: m(f(u * k1) + ' ÷ ' + k1 + ' = ' + u + ', ' + u + ' × ' + k2 + ' = ' + f(ans)) };
      q.sig = 'pc:t' + u + ',' + k1 + ',' + k2;
      return q;
    }
    if (kind === 'scale') {
      var sc = [100, 1000, 10000, 100000, 50000][L - 1], cm = rng.int(2, 15), km = sc >= 50000;
      if (sc === 50000 && cm % 2) cm++;
      ans = km ? cm * sc / 100000 : cm * sc / 100;
      q = intQ(t('q_pc_scale', { s: m('1 : ' + f(sc)), cm: cm, u: t(km ? 'ua_kms' : 'ua_meters') }), ans, { unit: t(km ? 'ua_km' : 'ua_m') });
      q.hints = G.hintList(t('hc_pc_scale', { s: f(sc) }));
      q.explain = { text: m(cm + ' × ' + f(sc) + ' = ' + f(cm * sc)) + ' ' + t('ua_cm') + ' = ' + m(f(ans)) + ' ' + t(km ? 'ua_km' : 'ua_m') };
      q.sig = 'pc:sc' + sc + ',' + cm;
      return q;
    }
    if (kind === 'speed') {
      var sp = rng.pick(L <= 2 ? [40, 50, 60, 80, 100] : [45, 60, 70, 75, 80, 90, 120]), hr = rng.int(2, 5), dist = sp * hr, ask = L <= 2 ? 'd' : L <= 3 ? rng.pick(['d', 's']) : rng.pick(['s', 't']);
      if (ask === 'd') q = intQ(t('q_pc_speed_d', { s: sp, h: hr }), dist, { unit: t('ua_km') });
      else if (ask === 's') q = intQ(t('q_pc_speed_s', { d: dist, h: hr }), sp, { unit: t('ua_kmh') });
      else q = intQ(t('q_pc_speed_t', { d: dist, s: sp }), hr, { unit: t('ua_h') });
      q.hints = G.hintList(t('hc_pc_speed'));
      q.explain = { text: m(sp + ' × ' + hr + ' = ' + dist) };
      q.sig = 'pc:v' + ask + sp + ',' + hr;
      return q;
    }
    return null;
  });

  /* ---------------------------------------------------------------- statistics and probability */
  var COLORS = ['red', 'blue', 'green', 'yellow'];
  G.register('stats', function (c) {
    var rng = c.rng, p = c.p, L = c.level, kind = p.kind, q, vals = [], i;
    if (kind === 'mean' || kind === 'missing') {
      var n = kind === 'missing' ? rng.int(4, 5) : L <= 2 ? 3 : L <= 4 ? 4 : 5, M = rng.int(L <= 2 ? 5 : 10, L <= 2 ? 20 : 80), spread = Math.min(M - 1, L <= 2 ? 6 : 25), sum = 0;
      for (i = 0; i < n - 1; i++) { var v = M + rng.int(-spread, spread); vals.push(v); sum += v; }
      var last = n * M - sum;
      if (last < 1 || last > M * 3) return null;
      vals.push(last);
      if (kind === 'mean') {
        q = intQ(t('q_st_mean'), M, { sub: vals.join(', ') });
        q.hints = G.hintList(t('hc_st_mean', { n: n }));
        q.explain = { text: m('(' + vals.join(' + ') + ') ÷ ' + n + ' = ' + n * M + ' ÷ ' + n + ' = ' + M) };
        q.sig = 'st:m' + vals.join(',');
        return q;
      }
      var known = vals.slice(0, -1);
      q = intQ(t('q_st_missing', { n: n, mean: M, k: n - 1 }), last, { sub: known.join(', ') });
      q.hints = G.hintList(t('hc_st_missing', { e: m(n + ' × ' + M + ' = ' + n * M) }));
      q.explain = { text: m(n * M + ' − (' + known.join(' + ') + ') = ' + last) };
      q.sig = 'st:x' + vals.join(',');
      return q;
    }
    if (kind === 'mmr') {
      var what = p.adv ? (L <= 2 ? rng.pick(['median', 'mode']) : rng.pick(['median', 'mode', 'range'])) : L <= 2 ? 'range' : L <= 3 ? rng.pick(['range', 'median']) : rng.pick(['median', 'mode', 'range']);
      if (what === 'mode') {
        var modeV = rng.int(2, 40), others = rng.sample(U.range(1, 50).filter(function (x) { return x !== modeV; }), rng.int(3, 4));
        vals = rng.shuffle(others.concat([modeV, modeV, modeV]));
        q = intQ(t('q_st_mode'), modeV, { sub: vals.join(', ') });
        q.hints = G.hintList(t('hc_st_mode'));
        q.explain = { text: t('st_mode_ex', { n: modeV }) };
      } else {
        var cnt = what === 'median' ? rng.pick([5, 7]) : rng.int(5, 7);
        vals = rng.sample(U.range(1, L <= 2 ? 30 : 99), cnt);
        var sorted = vals.slice().sort(function (a, b) { return a - b; }), ans = what === 'median' ? sorted[(cnt - 1) / 2] : sorted[cnt - 1] - sorted[0];
        q = intQ(t(what === 'median' ? 'q_st_median' : 'q_st_range'), ans, { sub: vals.join(', ') });
        q.hints = G.hintList(t('hc_st_order'));
        q.explain = { text: m(sorted.join(', ')) + ' → ' + m(what === 'median' ? String(ans) : sorted[cnt - 1] + ' − ' + sorted[0] + ' = ' + ans) };
      }
      q.sig = 'st:' + what + vals.join(',');
      return q;
    }
    if (kind === 'prob') {
      var cols = rng.sample(COLORS, L <= 2 ? 2 : 3), counts = {}, total = 0;
      cols.forEach(function (col) { counts[col] = rng.int(2, L <= 2 ? 6 : 9); total += counts[col]; });
      var target = rng.pick(cols), negate = !!p.hard && L >= 3 && rng.chance(.5), good = negate ? total - counts[target] : counts[target];
      var parts = cols.map(function (col) { return t('st_n_' + col, { n: counts[col] }); }), listText = parts.slice(0, -1).join(', ') + t('st_and') + parts[parts.length - 1];
      q = fracQ(t(negate ? 'q_st_prob_not' : 'q_st_prob', { list: listText, c: t('st_c_' + target) }), [], { n: good, d: total });
      q.data.eq = [{ blankFrac: true }];
      q.visual = marblesFig(counts);
      q.hints = G.hintList(t('hc_st_prob'));
      q.explain = { text: m(fs(good, total)) };
      q.sig = 'st:p' + JSON.stringify(counts) + target + negate;
      return q;
    }
    return null;
  });

  /* ---------------------------------------------------------------- angle facts */
  G.register('geo2', function (c) {
    var rng = c.rng, p = c.p, L = c.level, kind = p.kind, q, A, B, C, D, ans;
    if (kind === 'trisum') {
      if (L <= 1) { A = 90; B = rng.int(20, 70); }
      else { A = rng.int(L <= 3 ? 30 : 15, p.hard ? 130 : 100); B = rng.int(15, 165 - A); }
      ans = 180 - A - B;
      if (ans < 10) return null;
      if (rng.chance(.5)) { var tmp = A; A = B; B = tmp; }
      q = intQ(t('q_g2_tri'), ans, { unit: '°', visual: cornerFig(triangleByAngles(A, B), [A + '°', B + '°', '?']) });
      q.hints = G.hintList(t('hc_g2_tri'));
      q.explain = { text: m('180° − ' + A + '° − ' + B + '° = ' + ans + '°') };
      q.sig = 'g2:t' + A + ',' + B;
      return q;
    }
    if (kind === 'straight') {
      A = rng.int(L <= 2 ? 3 : 1, L <= 2 ? 15 : 17) * (L <= 2 ? 10 : 10) + (L >= 3 ? rng.int(0, 9) : 0);
      if (A <= 5 || A >= 175) return null;
      ans = 180 - A;
      q = intQ(t('q_g2_straight'), ans, { unit: '°', visual: straightFig(A, A + '°', '?') });
      q.hints = G.hintList(t('hc_g2_straight'));
      q.explain = { text: m('180° − ' + A + '° = ' + ans + '°') };
      q.sig = 'g2:s' + A;
      return q;
    }
    if (kind === 'quadsum') {
      A = rng.int(60, 130); B = rng.int(60, 130); C = rng.int(60, 130); ans = 360 - A - B - C;
      if (ans < 40 || ans > 170) return null;
      q = intQ(t('q_g2_quad'), ans, { unit: '°', visual: cornerFig([[0, 0], [1.25, 0], [1.05, -0.85], [0.15, -0.95]], [A + '°', B + '°', C + '°', '?'], '#CFF5E7') });
      q.hints = G.hintList(t('hc_g2_quad'));
      q.explain = { text: m('360° − ' + A + '° − ' + B + '° − ' + C + '° = ' + ans + '°') };
      q.sig = 'g2:q' + A + ',' + B + ',' + C;
      return q;
    }
    if (kind === 'isosceles') {
      var top = rng.int(10, 70) * 2, base = (180 - top) / 2, askTop = L >= 4 && rng.chance(.5);
      ans = askTop ? top : base;
      q = intQ(t(askTop ? 'q_g2_iso_top' : 'q_g2_iso_base', { a: askTop ? base : top }), ans, { unit: '°', visual: cornerFig(triangleByAngles(base, base), askTop ? [base + '°', base + '°', '?'] : ['?', '?', top + '°'], '#FFD6E8') });
      q.hints = G.hintList(t('hc_g2_iso'));
      q.explain = { text: askTop ? m('180° − 2 × ' + base + '° = ' + top + '°') : m('(180° − ' + top + '°) ÷ 2 = ' + base + '°') };
      q.sig = 'g2:i' + askTop + top;
      return q;
    }
    return null;
  });

  /* ---------------------------------------------------------------- areas of triangles, parallelograms, trapezoids and circles */
  G.register('area2', function (c) {
    var rng = c.rng, p = c.p, L = c.level, kind = p.kind, q, b, h, ans, cm = t('ua_cm'), cm2 = t('ua_cm2'), lab = function (n) { return fd(n) + ' ' + cm; };
    var big = L <= 2 ? 10 : 20;
    if (kind === 'triangle' || (kind === 'missing' && rng.chance(.5))) {
      do { b = rng.int(3, big); h = rng.int(3, big); } while ((b * h) % 2);
      var apex = b * rng.pick([0.3, 0.45, 0.6, 0.7]), pts = [[0, 0], [b, 0], [apex, -h]];
      var fig = dimFig(pts, { base: [[0, 0], [b, 0]], bl: lab(b), h: [[apex, -h], [apex, 0]], hl: lab(h) });
      if (kind === 'missing') {
        q = intQ(t('q_a2_tri_h', { a: b * h / 2, b: b }), h, { unit: cm });
        q.hints = G.hintList(t('hc_a2_tri'), t('hc_a2_back'));
        q.explain = { text: m(b * h / 2 + ' × 2 ÷ ' + b + ' = ' + h) };
        q.sig = 'a2:th' + b + ',' + h;
        return q;
      }
      ans = b * h / 2;
      q = intQ(t('q_a2_tri'), ans, { unit: cm2, visual: fig });
      q.hints = G.hintList(t('hc_a2_tri'));
      q.explain = { text: m(b + ' × ' + h + ' ÷ 2 = ' + ans) };
    } else if (kind === 'parallelogram' || kind === 'missing') {
      b = rng.int(3, big); h = rng.int(2, big);
      var off = b * 0.35;
      if (kind === 'missing') {
        q = intQ(t('q_a2_par_h', { a: b * h, b: b }), h, { unit: cm });
        q.hints = G.hintList(t('hc_a2_par'), t('hc_a2_back'));
        q.explain = { text: m(b * h + ' ÷ ' + b + ' = ' + h) };
        q.sig = 'a2:ph' + b + ',' + h;
        return q;
      }
      ans = b * h;
      q = intQ(t('q_a2_par'), ans, { unit: cm2, visual: dimFig([[0, 0], [b, 0], [b + off, -h], [off, -h]], { base: [[0, 0], [b, 0]], bl: lab(b), h: [[off, -h], [off, 0]], hl: lab(h) }) });
      q.hints = G.hintList(t('hc_a2_par'));
      q.explain = { text: m(b + ' × ' + h + ' = ' + ans) };
    } else if (kind === 'trapezoid') {
      var a = rng.int(6, big + 4), top = rng.int(2, a - 2);
      h = rng.int(2, big);
      if (((a + top) * h) % 2) return null;
      var sk = (a - top) / 2 + rng.pick([-1, 0, 1]) * (a - top) / 6;
      ans = (a + top) * h / 2;
      q = intQ(t('q_a2_trap'), ans, { unit: cm2, visual: dimFig([[0, 0], [a, 0], [sk + top, -h], [sk, -h]], { base: [[0, 0], [a, 0]], bl: lab(a), top: [[sk, -h], [sk + top, -h]], tl: lab(top), h: [[sk, -h], [sk, 0]], hl: lab(h) }) });
      q.hints = G.hintList(t('hc_a2_trap'));
      q.explain = { text: m('(' + a + ' + ' + top + ') × ' + h + ' ÷ 2 = ' + ans) };
      b = a; h = top * 1000 + h;
    } else if (kind === 'circleC' || kind === 'circleA') {
      var r = rng.int(1, L <= 2 ? 10 : 15), diam = L >= 4 && rng.chance(.5), area = kind === 'circleA';
      ans = area ? 3.14 * r * r : 2 * 3.14 * r;
      q = decQ(t(area ? 'q_a2_carea' : 'q_a2_circ', { pi: m('π = 3.14') }), ans, { unit: area ? cm2 : cm, visual: circleFig((diam ? 'd = ' + 2 * r : 'r = ' + r) + ' ' + cm, diam) });
      q.hints = G.hintList(t(area ? 'hc_a2_carea' : 'hc_a2_circ'), diam ? t('hc_a2_diam') : null);
      q.explain = { text: m(area ? '3.14 × ' + r + ' × ' + r + ' = ' + fd(ans) : '2 × 3.14 × ' + r + ' = ' + fd(ans)) };
      b = r; h = diam ? 1 : 0;
    } else return null;
    q.sig = 'a2:' + kind + ':' + b + ',' + h;
    return q;
  });

  /* ---------------------------------------------------------------- volume, surface area and capacity of boxes */
  G.register('volume', function (c) {
    var rng = c.rng, p = c.p, L = c.level, kind = p.kind, q, l, w, h, ans, cm = t('ua_cm'), lab = function (n) { return f(n) + ' ' + cm; };
    if (kind === 'cubes') {
      l = rng.int(2, L <= 2 ? 3 : 4); w = rng.int(1, L <= 2 ? 2 : 3); h = rng.int(1, L <= 2 ? 2 : 3);
      var heights = U.range(w).map(function () { return U.range(l).map(function () { return h; }); });
      ans = l * w * h;
      q = intQ(t('q_vo_cubes'), ans, { visual: S.cubes(heights) });
      q.hints = G.hintList(t('hc_vo_cubes'));
      q.explain = { text: m(l + ' × ' + w + ' × ' + h + ' = ' + ans) };
    } else if (kind === 'formula' || kind === 'surface') {
      l = rng.int(2, L <= 2 ? 8 : 15); w = rng.int(2, L <= 2 ? 6 : 12); h = rng.int(2, L <= 2 ? 6 : 12);
      var fig = boxFig(l, w, h, [lab(l), lab(w), lab(h)]);
      if (kind === 'formula') {
        ans = l * w * h;
        q = intQ(t('q_vo_box'), ans, { unit: t('ua_cm3'), visual: fig });
        q.hints = G.hintList(t('hc_vo_box'));
        q.explain = { text: m(l + ' × ' + w + ' × ' + h + ' = ' + f(ans)) };
      } else {
        ans = 2 * (l * w + l * h + w * h);
        q = intQ(t('q_vo_surface'), ans, { unit: t('ua_cm2'), visual: fig });
        q.hints = G.hintList(t('hc_vo_surface'));
        q.explain = { text: m('2 × (' + l * w + ' + ' + l * h + ' + ' + w * h + ') = ' + f(ans)) };
      }
    } else if (kind === 'missing') {
      l = rng.int(2, 12); w = rng.int(2, 10); h = rng.int(2, 12);
      ans = h;
      q = intQ(t('q_vo_missing', { v: f(l * w * h), l: l, w: w }), h, { unit: cm });
      q.hints = G.hintList(t('hc_vo_missing'));
      q.explain = { text: m(f(l * w * h) + ' ÷ (' + l + ' × ' + w + ') = ' + h) };
    } else if (kind === 'liters') {
      l = 10 * rng.int(2, L <= 2 ? 5 : 8); w = 10 * rng.int(1, L <= 2 ? 3 : 5); h = 10 * rng.int(1, L <= 2 ? 3 : 5);
      ans = l * w * h / 1000;
      q = intQ(t('q_vo_liters', { l: l, w: w, h: h }), ans, { unit: t('ua_l') });
      q.hints = G.hintList(t('hc_vo_liters'), t('hc_vo_box'));
      q.explain = { text: m(l + ' × ' + w + ' × ' + h + ' = ' + f(l * w * h)) + ' ' + t('ua_cm3') + ' = ' + m(f(ans)) + ' ' + t('ua_l') };
    } else return null;
    q.sig = 'vo:' + kind + ':' + l + ',' + w + ',' + h;
    return q;
  });

  MA.i18n.add({
    en: {
      q_dv_which: 'Which number is divisible by {k}?', q_dv_is: 'Is {n} divisible by {k}?', dv_rem: '{e} leaves a remainder of {r}.',
      hc_dv_2: 'A number divisible by 2 ends in 0, 2, 4, 6 or 8.', hc_dv_3: 'Add the digits. If the sum divides by 3, so does the number.',
      hc_dv_4: 'Look at the last two digits: if they make a number divisible by 4, the whole number is divisible by 4.', hc_dv_5: 'A number divisible by 5 ends in 0 or 5.',
      hc_dv_6: 'A number divisible by 6 is divisible by both 2 and 3.', hc_dv_9: 'Add the digits. If the sum divides by 9, so does the number.', hc_dv_10: 'A number divisible by 10 ends in 0.',
      q_dv_factor_which: 'Which number is a factor of {n}?', q_dv_factor_count: 'How many factors does {n} have?', hc_dv_factors: 'Find pairs of numbers that multiply to {n}.',
      q_dv_mult_which: 'Which number is a multiple of {k}?', q_dv_mult_next: 'What is the smallest multiple of {k} that is bigger than {n}?', hc_dv_mult: 'Multiples of {k} are the numbers you say when you count by {k}.',
      q_dv_prime_which: 'Which number is prime?', q_dv_prime_is: 'Is {n} a prime number?', hc_dv_prime: 'A prime number has exactly two factors: 1 and itself.', dv_prime_yes: '{n} has only two factors: 1 and {n}.',
      q_dv_factorize: 'Which is the prime factorization of {n}?', hc_dv_factorize: 'Keep dividing by the smallest prime you can: 2, 3, 5, 7…',
      q_dv_gcd: 'What is the greatest common divisor of {a} and {b}?', hc_dv_gcd: 'List the factors of both numbers and find the biggest one they share.',
      q_dv_lcm: 'What is the least common multiple of {a} and {b}?', hc_dv_lcm: 'Count by the bigger number until you reach a multiple of the smaller one.',
      q_oo_basic: 'Calculate. Remember: × and ÷ come before + and −.', q_oo_paren: 'Calculate. Start with the parentheses.', q_oo_sq: 'Calculate', q_oo_miss: 'Find the missing number',
      hc_oo_basic: 'First multiply and divide from left to right, then add and subtract.', hc_oo_paren: 'Solve what is inside the parentheses first.',
      hc_oo_sq: 'A square is a number times itself: {e}', hc_oo_miss: 'Work backwards: undo each step with the opposite operation.',
      hc_fa_common: 'Rewrite both fractions with the common denominator {d}.', hc_fa_mixed: 'You can change the mixed numbers to improper fractions first.',
      hc_fm_whole: 'Multiply the numerator by the whole number. The denominator stays the same.', hc_fm_frac: 'Multiply numerator by numerator and denominator by denominator.',
      hc_fm_div: 'To divide by a fraction, multiply by its reciprocal (flip it upside down).', hc_fm_divwhole: 'Dividing by a whole number makes each part smaller: multiply the denominator by it.',
      hc_dc_add: 'Line up the decimal points, then calculate like whole numbers.', hc_dc_pow: 'Multiplying by 10, 100 or 1,000 moves the decimal point 1, 2 or 3 places to the right. Dividing moves it to the left.',
      q_dc_round_1: 'Round {n} to the nearest whole number', q_dc_round_01: 'Round {n} to the nearest tenth', q_dc_round_001: 'Round {n} to the nearest hundredth',
      hc_dc_round: 'Look at the next digit to the right: 5 or more rounds up, 4 or less rounds down.',
      hc_dc_mul: 'Multiply without the decimal points, then put back as many decimal places as the numbers have together.', hc_dc_div: 'Divide like whole numbers and keep the decimal point in the same place.',
      q_pc_grid: 'What percent of the square is colored?', q_pc_grid_not: 'What percent of the square is NOT colored?', hc_pc_grid: 'The big square has 100 small squares. Each one is 1%.',
      q_pc_to_pct: 'Write as a percent', q_pc_to_dec: 'Write as a decimal', q_pc_to_frac: 'Write as a fraction', hc_pc_conv: 'Percent means "out of 100": {e}',
      q_pc_of: 'What is {p} of {n}?', hc_pc_of: 'Find 10% (divide by 10) or 1% (divide by 100) first, then multiply.',
      q_pc_disc: 'A {item} costs {price}. It is on sale for {p} off. What is the sale price?', q_pc_up: 'A {item} costs {price}. The price goes up by {p}. What is the new price?',
      hc_pc_disc: 'Find {p} of the price, then subtract it.', hc_pc_up: 'Find {p} of the price, then add it.',
      pc_items: ['jacket', 'bike', 'board game', 'backpack', 'pair of shoes', 'watch'],
      q_pc_ratio: 'There are {a} {x} and {b} {y}. What is the ratio of {x} to {y} in simplest form?', hc_pc_ratio: 'Divide both numbers by their greatest common divisor.',
      pc_pairs: [['boys', 'girls'], ['red marbles', 'blue marbles'], ['cats', 'dogs'], ['apples', 'oranges'], ['cars', 'bikes']],
      q_pc_share: 'Share {n} {x} between two friends in the ratio {r}. How many does the friend with the bigger share get?', hc_pc_share: 'Add the parts of the ratio to find how many equal shares there are.',
      pc_share_items: ['stickers', 'marbles', 'cards', 'candies'],
      q_pc_rate: 'The price of {a} {x} is {p}. What is the price of {b} {x}?', hc_pc_rate: 'Find the price of one first.', pc_rate_items: ['notebooks', 'pencils', 'stickers', 'muffins', 'balloons'],
      q_pc_scale: 'A map has a scale of {s}. A road on the map is {cm} cm long. How long is the real road in {u}?', hc_pc_scale: '1 cm on the map is {s} cm in real life. 1 m = 100 cm and 1 km = 1,000 m.',
      q_pc_speed_d: 'A car drives at {s} km per hour for {h} hours. How many kilometers does it travel?', q_pc_speed_s: 'A train travels {d} km in {h} hours. What is its speed in km per hour?',
      q_pc_speed_t: 'A bus travels {d} km at {s} km per hour. How many hours does the trip take?', hc_pc_speed: 'Distance = speed × time.',
      q_st_mean: 'What is the average of these numbers?', hc_st_mean: 'Add all the numbers, then divide by how many numbers there are ({n}).',
      q_st_missing: 'The average of {n} numbers is {mean}. Here are {k} of them. What is the missing number?', hc_st_missing: 'Find the total of all the numbers: {e}',
      q_st_range: 'What is the range of these numbers? (the biggest minus the smallest)', q_st_median: 'What is the median? (the middle number when they are in order)',
      q_st_mode: 'What is the mode? (the number that appears most often)', hc_st_order: 'First put the numbers in order from smallest to biggest.', hc_st_mode: 'Count how many times each number appears.', st_mode_ex: '{n} appears most often.',
      q_st_prob: 'A bag has {list}. You pick one without looking. What is the probability of picking {c}?', q_st_prob_not: 'A bag has {list}. You pick one without looking. What is the probability of NOT picking {c}?',
      hc_st_prob: 'Probability = matching marbles ÷ all the marbles.', st_and: ' and ',
      st_n_red: '{n} red marbles', st_n_blue: '{n} blue marbles', st_n_green: '{n} green marbles', st_n_yellow: '{n} yellow marbles',
      st_c_red: 'a red marble', st_c_blue: 'a blue marble', st_c_green: 'a green marble', st_c_yellow: 'a yellow marble',
      q_g2_tri: 'Two angles of a triangle are shown. What is the third angle?', hc_g2_tri: 'The three angles of a triangle add up to 180°.',
      q_g2_straight: 'The two angles together make a straight line. What is the missing angle?', hc_g2_straight: 'Angles on a straight line add up to 180°.',
      q_g2_quad: 'Three angles of a quadrilateral are shown. What is the fourth angle?', hc_g2_quad: 'The four angles of a quadrilateral add up to 360°.',
      q_g2_iso_base: 'In an isosceles triangle the top angle is {a}°. What is each base angle?', q_g2_iso_top: 'In an isosceles triangle each base angle is {a}°. What is the top angle?',
      hc_g2_iso: 'The two base angles are equal, and all three angles add up to 180°.',
      q_a2_tri: 'What is the area of the triangle?', q_a2_par: 'What is the area of the parallelogram?', q_a2_trap: 'What is the area of the trapezoid?',
      q_a2_circ: 'What is the circumference of the circle? ({pi})', q_a2_carea: 'What is the area of the circle? ({pi})',
      q_a2_tri_h: 'A triangle has an area of {a} cm² and a base of {b} cm. What is its height?', q_a2_par_h: 'A parallelogram has an area of {a} cm² and a base of {b} cm. What is its height?',
      hc_a2_tri: 'Area of a triangle = base × height ÷ 2.', hc_a2_par: 'Area of a parallelogram = base × height.', hc_a2_trap: 'Area of a trapezoid = (base + base) × height ÷ 2.',
      hc_a2_circ: 'Circumference = 2 × π × radius.', hc_a2_carea: 'Area of a circle = π × radius × radius.', hc_a2_diam: 'The radius is half of the diameter.', hc_a2_back: 'Use the area formula backwards.',
      q_vo_cubes: 'How many unit cubes build this box?', hc_vo_cubes: 'Count the cubes in one layer, then multiply by the number of layers.',
      q_vo_box: 'What is the volume of the box?', hc_vo_box: 'Volume = length × width × height.',
      q_vo_missing: 'A box has a volume of {v} cm³. It is {l} cm long and {w} cm wide. How high is it?', hc_vo_missing: 'Divide the volume by length × width.',
      q_vo_surface: 'What is the surface area of the box (all 6 faces)?', hc_vo_surface: 'There are 3 pairs of equal faces. Add the areas of 3 different faces and double the sum.',
      q_vo_liters: 'A fish tank is {l} cm long, {w} cm wide and {h} cm high. How many liters of water fit in it?', hc_vo_liters: 'Remember: 1 liter = 1,000 cm³.',
      ua_cm: 'cm', ua_cm2: 'cm²', ua_cm3: 'cm³', ua_m: 'm', ua_km: 'km', ua_l: 'liters', ua_h: 'hours', ua_kmh: 'km/h', ua_meters: 'meters', ua_kms: 'kilometers'
    },
    he: {
      q_dv_which: 'איזה מספר מתחלק ב־{k} בלי שארית?', q_dv_is: 'האם {n} מתחלק ב־{k} בלי שארית?', dv_rem: '{e} משאיר שארית {r}.',
      hc_dv_2: 'מספר מתחלק ב־2 אם ספרת האחדות שלו היא 0, 2, 4, 6 או 8.', hc_dv_3: 'חברו את הספרות. אם הסכום מתחלק ב־3, גם המספר מתחלק ב־3.',
      hc_dv_4: 'בדקו את שתי הספרות האחרונות: אם המספר שהן יוצרות מתחלק ב־4, גם המספר כולו מתחלק ב־4.', hc_dv_5: 'מספר מתחלק ב־5 אם ספרת האחדות שלו היא 0 או 5.',
      hc_dv_6: 'מספר מתחלק ב־6 אם הוא מתחלק גם ב־2 וגם ב־3.', hc_dv_9: 'חברו את הספרות. אם הסכום מתחלק ב־9, גם המספר מתחלק ב־9.', hc_dv_10: 'מספר מתחלק ב־10 אם ספרת האחדות שלו היא 0.',
      q_dv_factor_which: 'איזה מספר הוא מחלק של {n}?', q_dv_factor_count: 'כמה מחלקים יש למספר {n}?', hc_dv_factors: 'מצאו זוגות של מספרים שמכפלתם {n}.',
      q_dv_mult_which: 'איזה מספר הוא כפולה של {k}?', q_dv_mult_next: 'מהי הכפולה הקטנה ביותר של {k} שגדולה מ־{n}?', hc_dv_mult: 'הכפולות של {k} הן המספרים שאומרים כשסופרים בקפיצות של {k}.',
      q_dv_prime_which: 'איזה מספר הוא ראשוני?', q_dv_prime_is: 'האם {n} הוא מספר ראשוני?', hc_dv_prime: 'למספר ראשוני יש בדיוק שני מחלקים: 1 והמספר עצמו.', dv_prime_yes: 'ל־{n} יש רק שני מחלקים: 1 ו־{n}.',
      q_dv_factorize: 'מהו הפירוק של {n} לגורמים ראשוניים?', hc_dv_factorize: 'חלקו שוב ושוב במספר הראשוני הקטן ביותר שאפשר: 2, 3, 5, 7…',
      q_dv_gcd: 'מהו המחלק המשותף הגדול ביותר של {a} ושל {b}?', hc_dv_gcd: 'רשמו את המחלקים של שני המספרים ומצאו את הגדול ביותר ששניהם חולקים.',
      q_dv_lcm: 'מהי הכפולה המשותפת הקטנה ביותר של {a} ושל {b}?', hc_dv_lcm: 'ספרו בקפיצות של המספר הגדול עד שתגיעו לכפולה של המספר הקטן.',
      q_oo_basic: 'חשבו. זכרו: כפל וחילוק לפני חיבור וחיסור.', q_oo_paren: 'חשבו. התחילו במה שבסוגריים.', q_oo_sq: 'חשבו', q_oo_miss: 'מצאו את המספר החסר',
      hc_oo_basic: 'קודם כופלים ומחלקים משמאל לימין, ואחר כך מחברים ומחסרים.', hc_oo_paren: 'פתרו קודם את מה שבתוך הסוגריים.',
      hc_oo_sq: 'חזקה שנייה היא מספר כפול עצמו: {e}', hc_oo_miss: 'עבדו מהסוף להתחלה: בטלו כל שלב בעזרת הפעולה ההפוכה.',
      hc_fa_common: 'כתבו את שני השברים עם המכנה המשותף {d}.', hc_fa_mixed: 'אפשר להפוך קודם את המספרים המעורבים לשברים מדומים.',
      hc_fm_whole: 'כופלים את המונה במספר השלם. המכנה נשאר אותו דבר.', hc_fm_frac: 'כופלים מונה במונה ומכנה במכנה.',
      hc_fm_div: 'כדי לחלק בשבר, כופלים בשבר ההפוך.', hc_fm_divwhole: 'חילוק במספר שלם מקטין כל חלק: כופלים בו את המכנה.',
      hc_dc_add: 'סדרו את הנקודות העשרוניות זו מתחת לזו, ואז חשבו כמו במספרים שלמים.', hc_dc_pow: 'כפל ב־10, 100 או 1,000 מזיז את הנקודה 1, 2 או 3 מקומות ימינה. חילוק מזיז אותה שמאלה.',
      q_dc_round_1: 'עגלו את {n} למספר השלם הקרוב', q_dc_round_01: 'עגלו את {n} לעשירית הקרובה', q_dc_round_001: 'עגלו את {n} למאית הקרובה',
      hc_dc_round: 'הסתכלו על הספרה שמימין למקום העיגול: 5 ומעלה מעגלים למעלה, 4 ומטה מעגלים למטה.',
      hc_dc_mul: 'כופלים בלי הנקודות, ואז מחזירים את הנקודה כך שאחריה יהיו כמה ספרות שיש בשני המספרים יחד.', hc_dc_div: 'מחלקים כמו במספרים שלמים ומשאירים את הנקודה באותו מקום.',
      q_pc_grid: 'כמה אחוזים מהריבוע צבועים?', q_pc_grid_not: 'כמה אחוזים מהריבוע אינם צבועים?', hc_pc_grid: 'בריבוע הגדול יש 100 משבצות. כל משבצת היא 1%.',
      q_pc_to_pct: 'כתבו באחוזים', q_pc_to_dec: 'כתבו כמספר עשרוני', q_pc_to_frac: 'כתבו כשבר', hc_pc_conv: 'אחוז פירושו "מתוך 100": {e}',
      q_pc_of: 'כמה הם {p} מתוך {n}?', hc_pc_of: 'מצאו קודם 10% (מחלקים ב־10) או 1% (מחלקים ב־100), ואז כופלים.',
      q_pc_disc: '{item} עולה {price}. יש הנחה של {p}. מה המחיר אחרי ההנחה?', q_pc_up: '{item} עולה {price}. המחיר עולה ב־{p}. מה המחיר החדש?',
      hc_pc_disc: 'חשבו כמה הם {p} מהמחיר, ואז הפחיתו את הסכום.', hc_pc_up: 'חשבו כמה הם {p} מהמחיר, ואז הוסיפו את הסכום.',
      pc_items: ['מעיל', 'זוג אופניים', 'משחק קופסה', 'תיק גב', 'זוג נעליים', 'שעון'],
      q_pc_ratio: 'יש {a} {x} ו־{b} {y}. מהו היחס של {x} ל{y}, בצורה מצומצמת?', hc_pc_ratio: 'חלקו את שני המספרים במחלק המשותף הגדול ביותר שלהם.',
      pc_pairs: [['בנים', 'בנות'], ['גולות אדומות', 'גולות כחולות'], ['חתולים', 'כלבים'], ['תפוחים', 'תפוזים'], ['מכוניות', 'אופניים']],
      q_pc_share: 'מחלקים {n} {x} בין שני חברים ביחס {r}. כמה מקבל החבר שמקבל את החלק הגדול?', hc_pc_share: 'חברו את חלקי היחס כדי לדעת לכמה חלקים שווים מחלקים.',
      pc_share_items: ['מדבקות', 'גולות', 'קלפים', 'סוכריות'],
      q_pc_rate: 'המחיר של {a} {x} הוא {p}. מה המחיר של {b} {x}?', hc_pc_rate: 'מצאו קודם את המחיר של אחד.', pc_rate_items: ['מחברות', 'עפרונות', 'מדבקות', 'מאפינס', 'בלונים'],
      q_pc_scale: 'קנה המידה של מפה הוא {s}. אורכו של כביש במפה הוא {cm} ס״מ. מה האורך האמיתי של הכביש ב{u}?', hc_pc_scale: 'ס״מ אחד במפה הוא {s} ס״מ במציאות. במטר יש 100 ס״מ, ובקילומטר יש 1,000 מטר.',
      q_pc_speed_d: 'מכונית נוסעת במהירות של {s} קמ״ש במשך {h} שעות. כמה קילומטרים היא עוברת?', q_pc_speed_s: 'רכבת עוברת {d} ק״מ ב־{h} שעות. מהי מהירותה בקמ״ש?',
      q_pc_speed_t: 'אוטובוס עובר {d} ק״מ במהירות של {s} קמ״ש. כמה שעות נמשכת הנסיעה?', hc_pc_speed: 'דרך = מהירות × זמן.',
      q_st_mean: 'מהו הממוצע של המספרים?', hc_st_mean: 'חברו את כל המספרים וחלקו בכמות המספרים ({n}).',
      q_st_missing: 'הממוצע של {n} מספרים הוא {mean}. הנה {k} מהם. מהו המספר החסר?', hc_st_missing: 'מצאו את הסכום של כל המספרים: {e}',
      q_st_range: 'מהו הטווח של המספרים? (הגדול ביותר פחות הקטן ביותר)', q_st_median: 'מהו החציון? (המספר האמצעי כשהמספרים מסודרים לפי הגודל)',
      q_st_mode: 'מהו השכיח? (המספר שמופיע הכי הרבה פעמים)', hc_st_order: 'קודם סדרו את המספרים מהקטן לגדול.', hc_st_mode: 'ספרו כמה פעמים מופיע כל מספר.', st_mode_ex: 'המספר {n} מופיע הכי הרבה פעמים.',
      q_st_prob: 'בשקית יש {list}. מוציאים גולה אחת בלי להסתכל. מה ההסתברות להוציא {c}?', q_st_prob_not: 'בשקית יש {list}. מוציאים גולה אחת בלי להסתכל. מה ההסתברות לא להוציא {c}?',
      hc_st_prob: 'הסתברות = מספר הגולות המתאימות ÷ מספר כל הגולות.', st_and: ' ו־',
      st_n_red: '{n} גולות אדומות', st_n_blue: '{n} גולות כחולות', st_n_green: '{n} גולות ירוקות', st_n_yellow: '{n} גולות צהובות',
      st_c_red: 'גולה אדומה', st_c_blue: 'גולה כחולה', st_c_green: 'גולה ירוקה', st_c_yellow: 'גולה צהובה',
      q_g2_tri: 'במשולש נתונות שתי זוויות. מהי הזווית השלישית?', hc_g2_tri: 'סכום הזוויות במשולש הוא 180°.',
      q_g2_straight: 'שתי הזוויות יחד יוצרות קו ישר. מהי הזווית החסרה?', hc_g2_straight: 'סכום הזוויות על קו ישר הוא 180°.',
      q_g2_quad: 'במרובע נתונות שלוש זוויות. מהי הזווית הרביעית?', hc_g2_quad: 'סכום הזוויות במרובע הוא 360°.',
      q_g2_iso_base: 'במשולש שווה־שוקיים זווית הראש היא {a}°. מהי כל אחת מזוויות הבסיס?', q_g2_iso_top: 'במשולש שווה־שוקיים כל זווית בסיס היא {a}°. מהי זווית הראש?',
      hc_g2_iso: 'שתי זוויות הבסיס שוות, וסכום שלוש הזוויות הוא 180°.',
      q_a2_tri: 'מהו שטח המשולש?', q_a2_par: 'מהו שטח המקבילית?', q_a2_trap: 'מהו שטח הטרפז?',
      q_a2_circ: 'מהו היקף המעגל? ({pi})', q_a2_carea: 'מהו שטח העיגול? ({pi})',
      q_a2_tri_h: 'שטח משולש הוא {a} סמ״ר ואורך הבסיס שלו {b} ס״מ. מהו הגובה?', q_a2_par_h: 'שטח מקבילית הוא {a} סמ״ר ואורך הבסיס שלה {b} ס״מ. מהו הגובה?',
      hc_a2_tri: 'שטח משולש = בסיס × גובה ÷ 2.', hc_a2_par: 'שטח מקבילית = בסיס × גובה.', hc_a2_trap: 'שטח טרפז = (בסיס + בסיס) × גובה ÷ 2.',
      hc_a2_circ: 'היקף מעגל = 2 × π × רדיוס.', hc_a2_carea: 'שטח עיגול = π × רדיוס × רדיוס.', hc_a2_diam: 'הרדיוס הוא חצי מהקוטר.', hc_a2_back: 'השתמשו בנוסחת השטח בכיוון ההפוך.',
      q_vo_cubes: 'מכמה קוביות יחידה בנויה התיבה?', hc_vo_cubes: 'ספרו את הקוביות בשכבה אחת וכפלו במספר השכבות.',
      q_vo_box: 'מהו נפח התיבה?', hc_vo_box: 'נפח = אורך × רוחב × גובה.',
      q_vo_missing: 'נפח תיבה הוא {v} סמ״ק. האורך שלה {l} ס״מ והרוחב {w} ס״מ. מהו הגובה?', hc_vo_missing: 'חלקו את הנפח במכפלת האורך והרוחב.',
      q_vo_surface: 'מהו שטח הפנים של התיבה (כל 6 הפאות)?', hc_vo_surface: 'יש 3 זוגות של פאות שוות. חברו את השטחים של 3 פאות שונות וכפלו את הסכום ב־2.',
      q_vo_liters: 'אקווריום באורך {l} ס״מ, ברוחב {w} ס״מ ובגובה {h} ס״מ. כמה ליטרים של מים נכנסים בו?', hc_vo_liters: 'זכרו: בליטר אחד יש 1,000 סמ״ק.',
      ua_cm: 'ס״מ', ua_cm2: 'סמ״ר', ua_cm3: 'סמ״ק', ua_m: 'מטר', ua_km: 'ק״מ', ua_l: 'ליטר', ua_h: 'שעות', ua_kmh: 'קמ״ש', ua_meters: 'מטרים', ua_kms: 'קילומטרים'
    }
  });
})(window.MA = window.MA || {});
