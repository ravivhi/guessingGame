/* Geometry: shapes, solids, position, spatial, pattern, symmetry, angles, lines, perimeter, area */
(function (MA) {
  'use strict';
  var G = MA.gen, S = MA.svg, f = G.fmt, t = function (k, p) { return MA.t(k, p); }, U = MA.u, m = G.m;
  MA.i18n.add({
    en: {
      sh_circle: 'circle', sh_square: 'square', sh_rectangle: 'rectangle', sh_triangle: 'triangle', sh_pentagon: 'pentagon', sh_hexagon: 'hexagon', sh_heptagon: 'heptagon', sh_octagon: 'octagon',
      sh_oval: 'oval', sh_rhombus: 'rhombus', sh_trapezoid: 'trapezoid', sh_parallelogram: 'parallelogram', sh_kite: 'kite', sh_star: 'star', sh_heart: 'heart', sh_semicircle: 'semicircle', sh_quadrilateral: 'quadrilateral',
      shp_circle: 'circles', shp_square: 'squares', shp_rectangle: 'rectangles', shp_triangle: 'triangles',
      tri_equilateral: 'equilateral', tri_isosceles: 'isosceles', tri_scalene: 'scalene', tri_right: 'right', tri_acute: 'acute', tri_obtuse: 'obtuse',
      so_cube: 'cube', so_cuboid: 'rectangular prism', so_cylinder: 'cylinder', so_cone: 'cone', so_sphere: 'sphere', so_sq_pyramid: 'square pyramid', so_tri_pyramid: 'triangular pyramid', so_tri_prism: 'triangular prism',
      q_find: 'Tap all the {shapes}', q_shape_name: 'What is the name of this shape?', q_sides: 'How many sides does this shape have?', q_corners: 'How many corners (vertices) does this shape have?',
      q_which_prop: 'Which shape has {prop}?', prop_4eq: '4 equal sides and 4 right angles', prop_4right: '4 right angles, but not all sides equal', prop_rhombus: '4 equal sides but no right angles', prop_trap: 'exactly one pair of parallel sides',
      prop_3: '3 sides', prop_5: '5 sides', prop_6: '6 sides', prop_8: '8 sides', q_poly_name: 'What do we call a polygon with {n} sides?', q_poly_sides: 'How many sides does a {name} have?', q_not_poly: 'Which shape is NOT a polygon?',
      q_quad_name: 'Which quadrilateral is this?', q_tri_sides: 'What kind of triangle is this, by its sides?', q_tri_angles: 'What kind of triangle is this, by its angles?', q_classify: 'Sort the shapes',
      cl_right: 'Has a right angle', cl_noright: 'No right angle', cl_par: 'Has parallel sides', cl_nopar: 'No parallel sides', cl_quad: 'Quadrilaterals', cl_notquad: 'Not quadrilaterals',
      q_solid_name: 'What is the name of this solid?', q_solid_obj: 'Which object looks like a {name}?', q_faces: 'How many faces does this solid have?', q_edges: 'How many edges does this solid have?', q_vertices: 'How many vertices (corners) does this solid have?',
      q_solid_which: 'Which solid has {f} faces and {v} vertices?', hc_faces: 'Faces are the flat sides. Count the hidden ones too (dashed lines).', hc_edges: 'Edges are where two faces meet.', hc_vertices: 'Vertices are the corners where edges meet.',
      q_pos: 'What is {dir} the {ref}?', dir_above: 'above', dir_below: 'below', dir_left: 'to the left of', dir_right: 'to the right of', q_between: 'What is between the {a} and the {b}?',
      q_grid_move: 'Start at ⭐. Move {moves}. What do you find?', mv_right: '{n} right', mv_left: '{n} left', mv_up: '{n} up', mv_down: '{n} down', hc_pos: 'Put your finger on the starting picture and move one square at a time.',
      q_same_turned: 'Which shape is the same as the first one, just turned?', hc_turn: 'Imagine turning the shape. A flipped (mirror) shape is not the same!', q_cubes: 'How many cubes are in this building?', sub_cubes: 'Every cube sits on the table or on another cube.',
      hc_cubes: 'Count one column at a time, from the back to the front.', q_pattern_next: 'What comes next in the pattern?', q_pattern_missing: 'What is missing in the pattern?', q_growing: 'How many dots will the next picture have?',
      q_num_pattern: 'What number comes next?', hc_pattern: 'Find the part that repeats or the rule that changes.', q_sym_is: 'Is the dashed line a line of symmetry?', q_sym_complete: 'Color squares to make the picture symmetric across the line',
      q_sym_count: 'How many lines of symmetry does this shape have?', hc_sym: 'If you fold along the line, both halves must match exactly.', q_ang_bigger: 'Which angle is bigger?', q_ang_right_which: 'Which angle is a right angle?',
      q_ang_is_right: 'Is this a right angle?', q_ang_right_count: 'How many right angles does this shape have?', q_ang_type: 'What type of angle is this?', q_ang_which: 'Which angle is {type}?',
      q_ang_measure: 'What does the angle measure in degrees?', an_acute: 'acute', an_right: 'right', an_obtuse: 'obtuse', an_straight: 'straight', hc_ang: 'Compare with a corner of a page: that is a right angle (90°).',
      hc_ang_size: 'The size of an angle is how wide it opens, not how long the arms are.', hc_protractor: 'Start from 0 on the arm lying on the base line and read where the other arm crosses.',
      q_deg_right: 'A right angle measures how many degrees?', q_deg_straight: 'A straight angle measures how many degrees?', q_deg_full: 'A full turn measures how many degrees?', q_deg_half: 'Half of a right angle measures how many degrees?',
      q_deg_comp: 'Two angles make a right angle. Find the missing angle.', q_deg_supp: 'Two angles make a straight angle. Find the missing angle.',
      ln_line: 'line', ln_ray: 'ray', ln_segment: 'line segment', ln_parallel: 'parallel', ln_perp: 'perpendicular', ln_intersect: 'intersecting (not perpendicular)',
      q_line_name: 'What is this called?', q_is_parallel: 'Are these lines parallel?', q_is_perp: 'Are these lines perpendicular?', q_which_parallel: 'Which picture shows parallel lines?', q_which_perp: 'Which picture shows perpendicular lines?',
      q_lines_type: 'How are these lines related?', hc_parallel: 'Parallel lines never meet, like train tracks.', hc_perp: 'Perpendicular lines meet at a right angle, like a plus sign.',
      q_perim_grid: 'What is the perimeter? Count the unit sides around the shape.', q_perim_rect: 'What is the perimeter of the rectangle?', q_perim_missing: 'A rectangle has a perimeter of {p} {u} and a length of {l} {u}. What is its width?',
      q_perim_build: 'Color a rectangle with a perimeter of {p} units', q_perim_poly: 'What is the perimeter of this shape?', hc_perim: 'Perimeter is the distance all the way around: add all the sides.',
      q_area_count: 'What is the area? Count the squares.', q_area_build: 'Color exactly {n} squares', q_area_rect_build: 'Color a rectangle with an area of {n} squares', q_area_rect: 'What is the area of the rectangle?',
      q_area_missing: 'A rectangle has an area of {a} square {u} and a length of {l} {u}. What is its width?', q_area_l: 'What is the area of this shape?', hc_area: 'Area is how many squares cover the shape: rows × columns.',
      q_fence: 'A garden is {w} m long and {h} m wide. How many meters of fence go all around it?', q_grass: 'A garden is {w} m long and {h} m wide. How many square meters of grass cover it?', hc_fence: 'Fence goes around the edge (perimeter). Grass covers the inside (area).'
    },
    he: {
      sh_circle: 'עיגול', sh_square: 'ריבוע', sh_rectangle: 'מלבן', sh_triangle: 'משולש', sh_pentagon: 'מחומש', sh_hexagon: 'משושה', sh_heptagon: 'משובע', sh_octagon: 'מתומן',
      sh_oval: 'אליפסה', sh_rhombus: 'מעוין', sh_trapezoid: 'טרפז', sh_parallelogram: 'מקבילית', sh_kite: 'דלתון', sh_star: 'כוכב', sh_heart: 'לב', sh_semicircle: 'חצי עיגול', sh_quadrilateral: 'מרובע',
      shp_circle: 'העיגולים', shp_square: 'הריבועים', shp_rectangle: 'המלבנים', shp_triangle: 'המשולשים',
      tri_equilateral: 'שווה צלעות', tri_isosceles: 'שווה שוקיים', tri_scalene: 'שונה צלעות', tri_right: 'ישר זווית', tri_acute: 'חד זווית', tri_obtuse: 'קהה זווית',
      so_cube: 'קובייה', so_cuboid: 'תיבה', so_cylinder: 'גליל', so_cone: 'חרוט', so_sphere: 'כדור', so_sq_pyramid: 'פירמידה מרובעת', so_tri_pyramid: 'פירמידה משולשת', so_tri_prism: 'מנסרה משולשת',
      q_find: 'געו בכל {shapes}', q_shape_name: 'איך קוראים לצורה הזו?', q_sides: 'כמה צלעות יש לצורה?', q_corners: 'כמה קודקודים (פינות) יש לצורה?',
      q_which_prop: 'לאיזו צורה יש {prop}?', prop_4eq: '4 צלעות שוות ו־4 זוויות ישרות', prop_4right: '4 זוויות ישרות, אבל לא כל הצלעות שוות', prop_rhombus: '4 צלעות שוות אבל אין זוויות ישרות', prop_trap: 'בדיוק זוג אחד של צלעות מקבילות',
      prop_3: '3 צלעות', prop_5: '5 צלעות', prop_6: '6 צלעות', prop_8: '8 צלעות', q_poly_name: 'איך קוראים למצולע עם {n} צלעות?', q_poly_sides: 'כמה צלעות יש ל{name}?', q_not_poly: 'איזו צורה איננה מצולע?',
      q_quad_name: 'איזה מרובע זה?', q_tri_sides: 'איזה משולש זה לפי הצלעות?', q_tri_angles: 'איזה משולש זה לפי הזוויות?', q_classify: 'מיינו את הצורות',
      cl_right: 'יש זווית ישרה', cl_noright: 'אין זווית ישרה', cl_par: 'יש צלעות מקבילות', cl_nopar: 'אין צלעות מקבילות', cl_quad: 'מרובעים', cl_notquad: 'לא מרובעים',
      q_solid_name: 'איך קוראים לגוף הזה?', q_solid_obj: 'איזה חפץ דומה ל{name}?', q_faces: 'כמה פאות יש לגוף?', q_edges: 'כמה מקצועות יש לגוף?', q_vertices: 'כמה קודקודים יש לגוף?',
      q_solid_which: 'לאיזה גוף יש {f} פאות ו־{v} קודקודים?', hc_faces: 'פאות הן הצדדים השטוחים. ספרו גם את הנסתרות (קווים מקווקווים).', hc_edges: 'מקצוע הוא המקום שבו שתי פאות נפגשות.', hc_vertices: 'קודקודים הם הפינות שבהן נפגשים המקצועות.',
      q_pos: 'מה נמצא {dir} {ref}?', dir_above: 'מעל', dir_below: 'מתחת ל־', dir_left: 'משמאל ל־', dir_right: 'מימין ל־', q_between: 'מה נמצא בין {a} לבין {b}?',
      q_grid_move: 'מתחילים ב־⭐. זזים {moves}. מה מוצאים?', mv_right: '{n} ימינה', mv_left: '{n} שמאלה', mv_up: '{n} למעלה', mv_down: '{n} למטה', hc_pos: 'שימו אצבע על התמונה שבה מתחילים וזוזו משבצת אחת בכל פעם.',
      q_same_turned: 'איזו צורה זהה לראשונה, רק מסובבת?', hc_turn: 'דמיינו שאתם מסובבים את הצורה. צורה הפוכה (תמונת מראה) היא לא אותה צורה!', q_cubes: 'כמה קוביות יש בבניין?', sub_cubes: 'כל קובייה מונחת על השולחן או על קובייה אחרת.',
      hc_cubes: 'ספרו עמודה אחת בכל פעם, מאחור לפנים.', q_pattern_next: 'מה בא אחר כך בתבנית?', q_pattern_missing: 'מה חסר בתבנית?', q_growing: 'כמה נקודות יהיו בציור הבא?',
      q_num_pattern: 'איזה מספר בא אחר כך?', hc_pattern: 'מצאו את החלק שחוזר או את החוק שמשתנה.', q_sym_is: 'האם הקו המקווקו הוא ציר סימטרייה?', q_sym_complete: 'צבעו משבצות כדי שהציור יהיה סימטרי לפי הקו',
      q_sym_count: 'כמה צירי סימטרייה יש לצורה?', hc_sym: 'אם מקפלים לאורך הקו, שני החצאים צריכים להתאים בדיוק.', q_ang_bigger: 'איזו זווית גדולה יותר?', q_ang_right_which: 'איזו זווית היא זווית ישרה?',
      q_ang_is_right: 'האם זו זווית ישרה?', q_ang_right_count: 'כמה זוויות ישרות יש לצורה?', q_ang_type: 'איזו זווית זו?', q_ang_which: 'איזו זווית היא {type}?',
      q_ang_measure: 'מה גודל הזווית במעלות?', an_acute: 'חדה', an_right: 'ישרה', an_obtuse: 'קהה', an_straight: 'שטוחה', hc_ang: 'השוו לפינה של דף: זו זווית ישרה (90°).',
      hc_ang_size: 'גודל הזווית הוא כמה היא פתוחה, לא כמה ארוכות הקרניים.', hc_protractor: 'מתחילים מ־0 על הקרן שמונחת על קו הבסיס, וקוראים איפה הקרן השנייה חוצה.',
      q_deg_right: 'כמה מעלות יש בזווית ישרה?', q_deg_straight: 'כמה מעלות יש בזווית שטוחה?', q_deg_full: 'כמה מעלות יש בסיבוב שלם?', q_deg_half: 'כמה מעלות יש בחצי זווית ישרה?',
      q_deg_comp: 'שתי זוויות יוצרות יחד זווית ישרה. מצאו את הזווית החסרה.', q_deg_supp: 'שתי זוויות יוצרות יחד זווית שטוחה. מצאו את הזווית החסרה.',
      ln_line: 'ישר', ln_ray: 'קרן', ln_segment: 'קטע', ln_parallel: 'מקבילים', ln_perp: 'מאונכים', ln_intersect: 'נחתכים (לא מאונכים)',
      q_line_name: 'איך קוראים לזה?', q_is_parallel: 'האם הישרים מקבילים?', q_is_perp: 'האם הישרים מאונכים?', q_which_parallel: 'איזה ציור מראה ישרים מקבילים?', q_which_perp: 'איזה ציור מראה ישרים מאונכים?',
      q_lines_type: 'מה הקשר בין הישרים?', hc_parallel: 'ישרים מקבילים לעולם לא נפגשים, כמו מסילת רכבת.', hc_perp: 'ישרים מאונכים נפגשים בזווית ישרה, כמו סימן פלוס.',
      q_perim_grid: 'מה ההיקף? ספרו את צלעות המשבצות מסביב לצורה.', q_perim_rect: 'מה ההיקף של המלבן?', q_perim_missing: 'למלבן היקף של {p} {u} ואורך של {l} {u}. מה הרוחב שלו?',
      q_perim_build: 'צבעו מלבן שההיקף שלו {p} יחידות', q_perim_poly: 'מה ההיקף של הצורה?', hc_perim: 'היקף הוא המרחק מסביב לצורה: מחברים את כל הצלעות.',
      q_area_count: 'מה השטח? ספרו את המשבצות.', q_area_build: 'צבעו בדיוק {n} משבצות', q_area_rect_build: 'צבעו מלבן ששטחו {n} משבצות', q_area_rect: 'מה השטח של המלבן?',
      q_area_missing: 'למלבן שטח של {a} {u} רבועים ואורך של {l} {u}. מה הרוחב שלו?', q_area_l: 'מה השטח של הצורה?', hc_area: 'שטח הוא כמה משבצות מכסות את הצורה: שורות × עמודות.',
      q_fence: 'גינה באורך {w} מ׳ וברוחב {h} מ׳. כמה מטרים של גדר צריך מסביב לה?', q_grass: 'גינה באורך {w} מ׳ וברוחב {h} מ׳. כמה מטרים רבועים של דשא מכסים אותה?', hc_fence: 'גדר הולכת מסביב (היקף). דשא מכסה את הפנים (שטח).'
    }
  });
  var SH = function (k) { return t('sh_' + k); };
  function shOpt(kind, i, rng, size) { return { v: kind + '_' + i, html: S.shape(kind, { size: size || 80, fill: S.COLORS[(i * 3 + 1) % S.COLORS.length], rot: rng.pick([0, 0, 15, -20, 30, 45]), width: 100 }), aria: SH(kind.replace(/_.*$/, '')) }; }

  /* ------------------------------------------------------------------ 2D shapes */
  var FIND_DISTRACT = { circle: ['oval', 'semicircle', 'square', 'triangle', 'hexagon'], square: ['rectangle', 'rhombus', 'trapezoid', 'circle', 'triangle'], rectangle: ['square', 'parallelogram', 'trapezoid', 'circle', 'triangle'], triangle: ['semicircle', 'square', 'pentagon', 'circle', 'rhombus'] };
  var NAME_SETS = { basic: ['circle', 'square', 'rectangle', 'triangle'], more: ['circle', 'square', 'rectangle', 'triangle', 'pentagon', 'hexagon', 'octagon', 'oval', 'rhombus', 'trapezoid'] };
  var POLY = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon' };
  var POLY_DRAW = { 3: 'scalene', 4: 'kite', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon' };
  G.register('shapes', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q, kind = p.kind;
    if (kind === 'find') {
      var tgt = p.target, nT = L <= 2 ? rng.int(1, 2) : rng.int(2, 3), nOpts = L <= 2 ? 4 : 6, dis = FIND_DISTRACT[tgt].slice(L <= 2 ? 3 : 0), opts = [], ans = [];
      for (var i = 0; i < nT; i++) { var o = shOpt(tgt, i, rng, 60 + rng.int(0, 30)); opts.push(o); ans.push(o.v); }
      rng.shuffle(dis.concat(dis)).slice(0, nOpts - nT).forEach(function (k, j) { opts.push(shOpt(k, j + 10, rng)); });
      if (tgt === 'square' || tgt === 'rectangle') opts.forEach(function (o) { if (o.v.indexOf(tgt) === 0 || o.v.indexOf('rectangle') === 0 || o.v.indexOf('square') === 0) o.html = S.shape(o.v.split('_')[0], { size: 80, fill: S.COLORS[opts.indexOf(o) % 8], rot: 0, width: 100 }); });
      q = { ui: 'choice', prompt: t('q_find', { shapes: t('shp_' + tgt) }), data: { options: rng.shuffle(opts), multi: true, layout: 'grid' }, answer: ans.sort() };
      q.check = function (a) { return Array.isArray(a) && U.eq(a.slice().sort(), ans); };
      q.hints = G.hintList(t('hc_find_' + tgt) !== 'hc_find_' + tgt ? t('hc_find_' + tgt) : t('hc_read_again'), { text: SH(tgt), svg: S.shape(tgt, { size: 90, fill: '#FFC93C' }) });
      q.sig = 'find:' + tgt + ':' + opts.map(function (o) { return o.v; }).join(',');
      return q;
    }
    if (kind === 'name' || (kind === 'props' && L === 5)) {
      var set = NAME_SETS[p.set] || NAME_SETS.basic, s = rng.pick(set), rot = L >= 3 ? rng.pick([0, 20, 45, 90, -30]) : 0;
      if (s === 'circle' || s === 'square') rot = s === 'square' && L >= 4 ? 45 : 0;
      var names = [s].concat(rng.sample(set.filter(function (x) { return x !== s && !(s === 'square' && (x === 'rectangle' || x === 'rhombus')) && !(s === 'rectangle' && x === 'square') && !(s === 'rhombus' && x === 'square'); }), L <= 2 ? 2 : 3));
      q = { ui: 'choice', prompt: t('q_shape_name'), visual: S.shape(s, { size: 120, fill: rng.pick(S.COLORS), rot: rot }), data: { options: G.textOpts(names.map(function (x) { return [x, SH(x)]; }), rng), layout: 'two' }, answer: s };
      if (kind === 'props') {
        var prop = rng.pick([['prop_4eq', 'square', ['rectangle', 'triangle', 'pentagon']], ['prop_3', 'triangle', ['square', 'circle', 'pentagon']], ['prop_4right', 'rectangle', ['triangle', 'circle', 'pentagon']], ['prop_5', 'pentagon', ['square', 'triangle', 'hexagon']], ['prop_6', 'hexagon', ['pentagon', 'square', 'triangle']]]);
        q = { ui: 'choice', prompt: t('q_which_prop', { prop: t(prop[0]) }), data: { options: rng.shuffle([prop[1]].concat(prop[2]).map(function (k, i) { return { v: k, html: S.shape(k, { size: 70, fill: S.COLORS[i], width: 90 }), aria: SH(k) }; })), layout: 'two' }, answer: prop[1] };
        q.sig = 'shprop:' + prop[0] + L;
      }
      q.hints = G.hintList(t('hc_shape_count'), { text: SH(s), svg: S.shape(s, { size: 90, fill: '#FFC93C' }) });
      q.sig = q.sig || 'shn:' + kind + ':' + s + rot + L;
      return q;
    }
    if (kind === 'props') {
      var ps = rng.pick(['triangle', 'square', 'rectangle', 'pentagon', 'hexagon'].concat(p.set === 'basic' ? [] : ['octagon'])), sides = S.SHAPE_SIDES[ps], askC = rng.chance(.5);
      q = { ui: L <= 2 ? 'choice' : 'input', prompt: t(askC ? 'q_corners' : 'q_sides'), visual: S.shape(ps, { size: 130, fill: rng.pick(S.COLORS), rot: L >= 3 ? rng.int(-30, 30) : 0 }), data: L <= 2 ? { options: G.numOpts(sides, rng, { n: 3, min: 3, max: 8, deltas: [1, -1, 2] }) } : { kind: 'int' }, answer: sides };
      q.hints = G.hintList(t('hc_shape_count'), { text: m(U.range(1, sides + 1).join(', ')) });
      q.sig = 'shp:' + ps + askC + L;
      return q;
    }
    if (kind === 'polygon') {
      var n = rng.pick([3, 4, 5, 6, 8].concat(L >= 4 ? [7] : [])), nm = POLY[n];
      if (L <= 2) q = { ui: 'choice', prompt: t('q_shape_name'), visual: S.shape(POLY_DRAW[n], { size: 130, fill: rng.pick(S.COLORS), rot: rng.int(-20, 20) }), data: { options: G.textOpts(rng.sample([3, 4, 5, 6, 8].filter(function (x) { return x !== n; }), 3).concat([n]).map(function (x) { return [POLY[x], SH(POLY[x])]; }), rng), layout: 'two' }, answer: nm };
      else if (L === 3) q = { ui: 'choice', prompt: t('q_poly_name', { n: n }), data: { options: G.textOpts(rng.sample([3, 4, 5, 6, 8].filter(function (x) { return x !== n; }), 3).concat([n]).map(function (x) { return [POLY[x], SH(POLY[x])]; }), rng), layout: 'two' }, answer: nm };
      else if (L === 4) q = { ui: 'input', prompt: t('q_poly_sides', { name: SH(nm) }), data: { kind: 'int' }, answer: n };
      else {
        var nonp = rng.pick(['circle', 'heart', 'semicircle', 'oval']), polys = rng.sample(['triangle', 'square', 'pentagon', 'hexagon', 'trapezoid', 'rhombus'], 3);
        q = { ui: 'choice', prompt: t('q_not_poly'), data: { options: rng.shuffle([nonp].concat(polys).map(function (k, i) { return { v: k, html: S.shape(k, { size: 70, fill: S.COLORS[i + 2], width: 90 }), aria: SH(k) }; })), layout: 'two' }, answer: nonp };
      }
      q.hints = G.hintList(t('hc_shape_count'), { text: m('3 → ' + SH('triangle') + ', 5 → ' + SH('pentagon') + ', 6 → ' + SH('hexagon')) });
      q.sig = 'poly:' + L + ':' + n + q.ui;
      return q;
    }
    if (kind === 'quad') {
      var quads = ['square', 'rectangle', 'rhombus', 'trapezoid', 'parallelogram'], qs = rng.pick(quads);
      var excl = { square: ['rectangle', 'rhombus', 'parallelogram'], rectangle: ['parallelogram', 'square'], rhombus: ['parallelogram', 'square'], parallelogram: ['trapezoid'], trapezoid: ['parallelogram'] };
      if (p.advanced && L >= 3) {
        var pr = rng.pick([['prop_4eq', 'square'], ['prop_4right', 'rectangle'], ['prop_rhombus', 'rhombus'], ['prop_trap', 'trapezoid']]);
        q = { ui: 'choice', prompt: t('q_which_prop', { prop: t(pr[0]) }), data: { options: rng.shuffle(['square', 'rectangle', 'rhombus', 'trapezoid'].map(function (k, i) { return { v: k, html: S.shape(k, { size: 74, fill: S.COLORS[i], width: 96 }) + '<div class="small">' + U.esc(SH(k)) + '</div>', aria: SH(k) }; })), layout: 'two' }, answer: pr[1] };
      } else {
        var dis2 = quads.filter(function (x) { return x !== qs && excl[qs].indexOf(x) < 0; }).concat(['kite', 'pentagon']).slice(0, 3);
        q = { ui: 'choice', prompt: t('q_quad_name'), visual: S.shape(qs, { size: 130, fill: rng.pick(S.COLORS), rot: L >= 3 ? rng.pick([0, 30, -20]) : 0 }), data: { options: G.textOpts([qs].concat(dis2).map(function (x) { return [x, SH(x)]; }), rng), layout: 'two' }, answer: qs };
      }
      q.hints = G.hintList(t('hc_quad'), { text: SH('square') + ': 4 = , 4 ∟ · ' + SH('rectangle') + ': 4 ∟ · ' + SH('rhombus') + ': 4 = · ' + SH('trapezoid') + ': 1 ∥' });
      q.sig = 'quad:' + L + ':' + q.answer + (q.visual ? 'v' : 'p');
      return q;
    }
    if (kind === 'triangle') {
      var by = p.by === 'both' ? rng.pick(['sides', 'angles']) : p.by;
      if (by === 'sides') {
        var tk = rng.pick(['equilateral', 'isosceles', 'scalene']), draw = tk === 'scalene' ? rng.pick(['scalene', 'acute_triangle']) : tk;
        var lens = tk === 'equilateral' ? [5, 5, 5] : tk === 'isosceles' ? [7, 7, 4] : [6, 8, 9];
        var tri = S.wrap(200, 170, S.shapeEl(draw, 100, 90, 150, rng.pick(S.COLORS), 0) + (L >= 3 ? '' : ''), { width: 200 });
        var opts3 = tk === 'equilateral' ? [['equilateral', t('tri_equilateral')], ['scalene', t('tri_scalene')]] : [['equilateral', t('tri_equilateral')], ['isosceles', t('tri_isosceles')], ['scalene', t('tri_scalene')]];
        q = { ui: 'choice', prompt: t('q_tri_sides'), visual: tri, sub: L >= 3 ? m(lens.map(function (x) { return x + ' cm'; }).join(', ')) : null, data: { options: G.textOpts(opts3, rng), layout: 'col' }, answer: tk };
        q.hints = G.hintList(t('hc_tri_sides'));
      } else {
        var ak = rng.pick(['right', 'acute', 'obtuse']), dr = { right: 'right_triangle', acute: 'acute_triangle', obtuse: 'obtuse_triangle' }[ak];
        q = { ui: 'choice', prompt: t('q_tri_angles'), visual: S.wrap(200, 170, S.shapeEl(dr, 100, 90, 150, rng.pick(S.COLORS), L >= 3 ? rng.pick([0, 15, -15]) : 0), { width: 200 }), data: { options: G.textOpts([['right', t('tri_right')], ['acute', t('tri_acute')], ['obtuse', t('tri_obtuse')]], rng), layout: 'col' }, answer: ak };
        q.hints = G.hintList(t('hc_ang'));
      }
      q.sig = 'tri:' + by + L + ':' + q.answer + (q.visual || '').length;
      return q;
    }
    if (kind === 'classify') {
      var crit = rng.pick(['right', 'par', 'quad']);
      var pool = { right: { yes: ['square', 'rectangle', 'right_triangle'], no: ['equilateral', 'pentagon', 'hexagon', 'rhombus', 'parallelogram', 'scalene'] }, par: { yes: ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid', 'hexagon'], no: ['equilateral', 'pentagon', 'kite', 'scalene'] }, quad: { yes: ['square', 'rectangle', 'rhombus', 'trapezoid', 'kite', 'parallelogram'], no: ['equilateral', 'pentagon', 'hexagon', 'circle', 'octagon'] } }[crit];
      var yes = rng.sample(pool.yes, 3), no = rng.sample(pool.no, 3), bins = [{ id: 'y', label: t('cl_' + crit) }, { id: 'n', label: t('cl_no' + crit === 'cl_noquad' ? 'cl_notquad' : 'cl_no' + crit) }];
      bins[1].label = crit === 'quad' ? t('cl_notquad') : t('cl_no' + crit);
      var items = yes.map(function (k, i) { return { id: 'y' + i, html: S.shape(k, { size: 52, fill: S.COLORS[i], width: 64 }), aria: SH(k.replace(/_.*/, '')), bin: 'y' }; }).concat(no.map(function (k, i) { return { id: 'n' + i, html: S.shape(k, { size: 52, fill: S.COLORS[i + 3], width: 64 }), aria: SH(k.replace(/_.*/, '')), bin: 'n' }; }));
      q = { ui: 'sort', prompt: t('q_classify'), data: { bins: bins, items: rng.shuffle(items) } };
      q.answer = {}; items.forEach(function (x) { q.answer[x.id] = x.bin; });
      q.hints = G.hintList(crit === 'right' ? t('hc_ang') : crit === 'par' ? t('hc_parallel') : t('hc_quad'));
      q.sig = 'cls:' + crit + yes.join() + no.join();
      return q;
    }
    return null;
  });
  MA.i18n.add({
    en: { hc_shape_count: 'Count the straight sides one by one. Corners are where two sides meet.', hc_quad: 'Check the sides (equal? parallel?) and the corners (right angles?).', hc_tri_sides: 'Equilateral: 3 equal sides. Isosceles: 2 equal sides. Scalene: no equal sides.', hc_find_circle: 'A circle is perfectly round, with no corners.', hc_find_square: 'A square has 4 equal sides and 4 square corners.', hc_find_rectangle: 'A rectangle has 4 square corners; opposite sides are equal.', hc_find_triangle: 'A triangle has 3 straight sides and 3 corners.' },
    he: { hc_shape_count: 'ספרו את הצלעות הישרות אחת־אחת. פינה היא המקום שבו שתי צלעות נפגשות.', hc_quad: 'בדקו את הצלעות (שוות? מקבילות?) ואת הפינות (זוויות ישרות?).', hc_tri_sides: 'שווה צלעות: 3 צלעות שוות. שווה שוקיים: 2 צלעות שוות. שונה צלעות: אין צלעות שוות.', hc_find_circle: 'עיגול הוא עגול לגמרי, בלי פינות.', hc_find_square: 'לריבוע 4 צלעות שוות ו־4 פינות ישרות.', hc_find_rectangle: 'למלבן 4 פינות ישרות, והצלעות שמול זו מול זו שוות.', hc_find_triangle: 'למשולש 3 צלעות ישרות ו־3 פינות.' }
  });

  /* ------------------------------------------------------------------ 3D solids */
  var SOLID_OBJ = { cube: '🎲', cuboid: '📦', cylinder: '🥫', cone: '🍦', sphere: '⚽' };
  G.register('solids', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q, ask = p.ask;
    if (ask === 'name') {
      var all = ['cube', 'cuboid', 'cylinder', 'cone', 'sphere', 'sq_pyramid', 'tri_prism'], s = rng.pick(L <= 2 ? ['cube', 'cuboid', 'cylinder', 'cone', 'sphere'] : all);
      if (L >= 4 && SOLID_OBJ[s] && rng.chance(.6)) {
        var objs = Object.keys(SOLID_OBJ).filter(function (k) { return k !== s; });
        q = { ui: 'choice', prompt: t('q_solid_obj', { name: t('so_' + s) }), data: { options: rng.shuffle([s].concat(rng.sample(objs, 3)).map(function (k) { return { v: k, label: SOLID_OBJ[k] }; })), layout: 'two' }, answer: s };
      } else {
        var names = [s].concat(rng.sample(all.filter(function (x) { return x !== s; }), L <= 2 ? 2 : 3));
        q = { ui: 'choice', prompt: t('q_solid_name'), visual: S.solid(s, { fill: rng.pick(['#7FC8F8', '#FFC46B', '#A5E3B5', '#C9B8FF']) }), data: { options: G.textOpts(names.map(function (x) { return [x, t('so_' + x)]; }), rng), layout: 'two' }, answer: s };
      }
      q.hints = G.hintList(t('hc_faces'), { text: t('so_' + s) + ' ' + (SOLID_OBJ[s] || ''), svg: S.solid(s) });
      q.sig = 'sol:' + L + s + q.ui + (q.visual ? 'v' : 'o');
      return q;
    }
    var poly = ['cube', 'cuboid', 'tri_prism', 'sq_pyramid', 'tri_pyramid'], sp = rng.pick(poly), facts = S.SOLIDS[sp];
    if (L === 5) {
      var target = rng.pick(['tri_prism', 'sq_pyramid', 'tri_pyramid', 'cube']), tf = S.SOLIDS[target];
      var others = poly.filter(function (x) { return x !== target && !(S.SOLIDS[x].faces === tf.faces && S.SOLIDS[x].vertices === tf.vertices); });
      q = { ui: 'choice', prompt: t('q_solid_which', { f: tf.faces, v: tf.vertices }), data: { options: rng.shuffle([target].concat(rng.sample(others, 2)).map(function (k) { return { v: k, html: S.solid(k, { width: 120 }) + '<div class="small">' + U.esc(t('so_' + k)) + '</div>', aria: t('so_' + k) }; })), layout: 'two' }, answer: target };
      q.sig = 'solw:' + target;
      q.hints = G.hintList(t('hc_faces'));
      return q;
    }
    var key = ask === 'faces' ? 'faces' : ask === 'edges' ? 'edges' : 'vertices', ans = facts[key];
    q = { ui: L <= 2 ? 'choice' : 'input', prompt: t('q_' + key), visual: S.solid(sp, { fill: rng.pick(['#7FC8F8', '#FFC46B', '#A5E3B5']) }), data: L <= 2 ? { options: G.numOpts(ans, rng, { n: 3, min: 3, max: 14, deltas: [1, -1, 2, -2, 4] }) } : { kind: 'int' }, answer: ans };
    q.hints = G.hintList(t('hc_' + key), { text: t('so_' + sp) + ': ' + facts.faces + ' / ' + facts.edges + ' / ' + facts.vertices });
    q.hints[1].text = t('so_' + sp);
    q.explain = { text: t('so_' + sp) + ': ' + ans };
    q.sig = 'solf:' + key + sp + L;
    return q;
  });

  /* ------------------------------------------------------------------ position & spatial */
  var POS_EMOJI = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵', '🐔', '🦁', '🐯', '🐷'];
  function gridSvg(cells, cols, rows, cs) {
    cs = cs || 56;
    var g = '';
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) g += '<rect x="' + (4 + x * cs) + '" y="' + (4 + y * cs) + '" width="' + cs + '" height="' + cs + '" fill="' + ((x + y) % 2 ? '#F6F3FF' : '#fff') + '" stroke="#D8D2F0"/>';
    cells.forEach(function (cl) { g += S.emoji(4 + cl.x * cs + cs / 2, 4 + cl.y * cs + cs / 2, cl.e, cs * .62); });
    return S.wrap(cols * cs + 8, rows * cs + 8, g, { width: Math.min(360, cols * cs + 8) });
  }
  G.register('position', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q;
    if (p.kind === 'words') {
      var em = rng.sample(POS_EMOJI, 9), cells = em.map(function (e, i) { return { e: e, x: i % 3, y: Math.floor(i / 3) }; }), at = function (x, y) { return cells.filter(function (cl) { return cl.x === x && cl.y === y; })[0]; };
      if (L >= 4 && rng.chance(.5)) {
        var row = rng.int(0, 2);
        q = { ui: 'choice', prompt: t('q_between', { a: at(0, row).e, b: at(2, row).e }), visual: gridSvg(cells, 3, 3), data: { options: rng.shuffle([at(1, row).e].concat(rng.sample(em.filter(function (e) { return e !== at(1, row).e; }), 3))).map(function (e) { return { v: e, label: e }; }) }, answer: at(1, row).e };
      } else {
        var dirs = L <= 2 ? ['above', 'below'] : ['above', 'below', 'left', 'right'], d = rng.pick(dirs), dx = { left: -1, right: 1 }[d] || 0, dy = { above: -1, below: 1 }[d] || 0;
        var ref = rng.pick(cells.filter(function (cl) { return at(cl.x + dx, cl.y + dy); })), tgt = at(ref.x + dx, ref.y + dy);
        var wrong = [at(ref.x - dx, ref.y - dy), at(ref.x + dy, ref.y + dx), at(ref.x - dy, ref.y - dx)].filter(Boolean).map(function (x) { return x.e; });
        var opts = U.uniq([tgt.e].concat(wrong).concat(rng.sample(em, 4))).filter(function (e) { return e !== ref.e; }).slice(0, 4);
        q = { ui: 'choice', prompt: t('q_pos', { dir: t('dir_' + d), ref: ref.e }), visual: gridSvg(cells, 3, 3), data: { options: rng.shuffle(opts).map(function (e) { return { v: e, label: e }; }) }, answer: tgt.e };
      }
      q.hints = G.hintList(t('hc_pos'));
      q.sig = 'pos:' + em.join('') + q.prompt;
      return q;
    }
    var size = 5, start = { x: rng.int(0, 4), y: rng.int(0, 4) }, mx = 0, my = 0;
    for (var i = 0; i < 50; i++) { mx = rng.int(-3, 3); my = L <= 2 ? 0 : rng.int(-3, 3); if ((mx || my) && start.x + mx >= 0 && start.x + mx < size && start.y + my >= 0 && start.y + my < size) break; }
    if (!(mx || my) || start.x + mx < 0 || start.x + mx >= size || start.y + my < 0 || start.y + my >= size) return null;
    var pool = rng.sample(POS_EMOJI, 5), targetCell = { x: start.x + mx, y: start.y + my, e: pool[0] }, items = [{ x: start.x, y: start.y, e: '⭐' }, targetCell], used = {};
    used[start.x + ',' + start.y] = 1; used[targetCell.x + ',' + targetCell.y] = 1;
    pool.slice(1).forEach(function (e) { for (var k = 0; k < 30; k++) { var x = rng.int(0, 4), y = rng.int(0, 4); if (!used[x + ',' + y]) { used[x + ',' + y] = 1; items.push({ x: x, y: y, e: e }); break; } } });
    var moves = [];
    if (mx) moves.push(t(mx > 0 ? 'mv_right' : 'mv_left', { n: Math.abs(mx) }));
    if (my) moves.push(t(my > 0 ? 'mv_down' : 'mv_up', { n: Math.abs(my) }));
    q = { ui: 'choice', prompt: t('q_grid_move', { moves: moves.join(G.lang() === 'he' ? ' ואז ' : ' then ') }), visual: gridSvg(items, size, size, 52), data: { options: rng.shuffle(pool.slice(0, 4)).map(function (e) { return { v: e, label: e }; }) }, answer: targetCell.e };
    q.hints = G.hintList(t('hc_pos'));
    q.sig = 'grid:' + JSON.stringify(items) + mx + my;
    return q;
  });
  var POLYOS = { L: [[0, 0], [0, 1], [0, 2], [1, 2]], T: [[0, 0], [1, 0], [2, 0], [1, 1]], S: [[1, 0], [2, 0], [0, 1], [1, 1]], P: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], F: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]] };
  function norm(cells) { var mx = Math.min.apply(null, cells.map(function (c) { return c[0]; })), my = Math.min.apply(null, cells.map(function (c) { return c[1]; })); return cells.map(function (c) { return [c[0] - mx, c[1] - my]; }).sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; }); }
  function rot(cells) { return norm(cells.map(function (c) { return [-c[1], c[0]]; })); }
  function mirror(cells) { return norm(cells.map(function (c) { return [-c[0], c[1]]; })); }
  function key(cells) { return JSON.stringify(norm(cells)); }
  function rotations(cells) { var r = [norm(cells)]; for (var i = 0; i < 3; i++) r.push(rot(r[r.length - 1])); return r.map(key); }
  function polySvg(cells, color, w) {
    var cs = 26, mxx = Math.max.apply(null, cells.map(function (c) { return c[0]; })) + 1, myy = Math.max.apply(null, cells.map(function (c) { return c[1]; })) + 1, g = '';
    cells.forEach(function (c) { g += '<rect x="' + (4 + c[0] * cs) + '" y="' + (4 + c[1] * cs) + '" width="' + cs + '" height="' + cs + '" fill="' + color + '" stroke="#23233A" stroke-width="2"/>'; });
    return S.wrap(Math.max(mxx, myy) * cs + 8, Math.max(mxx, myy) * cs + 8, g, { width: w || 90 });
  }
  G.register('spatial', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q;
    if (p.kind === 'cubes') {
      var rows = L <= 2 ? 1 : 2, cols = L <= 1 ? rng.int(2, 3) : 3, hmax = L <= 1 ? 2 : 3, heights = U.range(rows).map(function () { return U.range(cols).map(function () { return rng.int(1, hmax); }); });
      if (rows === 2) heights[0] = heights[0].map(function (h, i) { return Math.max(h, heights[1][i]); });
      var total = U.sum(heights.map(function (r) { return U.sum(r); }));
      q = { ui: L <= 2 ? 'choice' : 'input', prompt: t('q_cubes'), sub: rows > 1 ? t('sub_cubes') : null, visual: S.cubes(heights), data: L <= 2 ? { options: G.numOpts(total, rng, { n: 3, min: 1, deltas: [1, -1, 2] }) } : { kind: 'int' }, answer: total };
      q.hints = G.hintList(t('hc_cubes'), { text: m(heights.map(function (r) { return r.join(' + '); }).join(' + ') + ' = ' + total) });
      q.sig = 'cubes:' + JSON.stringify(heights);
      return q;
    }
    var name = rng.pick(L <= 2 ? ['L', 'T', 'P'] : ['L', 'S', 'P', 'F']), base = norm(POLYOS[name]), rots = rotations(base);
    var turned = base; for (var i = 0, n = rng.int(1, 3); i < n; i++) turned = rot(turned);
    var opts = [{ v: 'g', html: polySvg(turned, '#7FC8F8') }], mir = mirror(base);
    if (rots.indexOf(key(mir)) < 0) { var mr = mir; for (var j = 0, k = rng.int(0, 3); j < k; j++) mr = rot(mr); opts.push({ v: 'm', html: polySvg(mr, '#7FC8F8') }); }
    var others = Object.keys(POLYOS).filter(function (x) { return x !== name; });
    rng.shuffle(others).forEach(function (o) { var cand = norm(POLYOS[o]); if (opts.length < 4 && rots.indexOf(key(cand)) < 0) opts.push({ v: 'o' + o, html: polySvg(cand, '#7FC8F8') }); });
    q = { ui: 'choice', prompt: t('q_same_turned'), visual: polySvg(base, '#FFC46B', 110), data: { options: rng.shuffle(opts), layout: 'two' }, answer: 'g' };
    q.verify = function () { return rots.indexOf(key(turned)) >= 0; };
    q.hints = G.hintList(t('hc_turn'));
    q.sig = 'spat:' + name + key(turned) + L;
    return q;
  });

  /* ------------------------------------------------------------------ patterns */
  var PAT_UNITS = { ab: [[0, 1]], aab: [[0, 0, 1]], abb: [[0, 1, 1]], abc: [[0, 1, 2]], aabb: [[0, 0, 1, 1]] };
  G.register('pattern', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q;
    if (p.kind === 'ab' || p.kind === 'logic') {
      var unit = (p.kind === 'ab' ? PAT_UNITS[rng.pick(L <= 1 ? ['ab'] : L <= 3 ? ['ab', 'aab', 'abb'] : ['abc', 'aabb', 'abb'])] : PAT_UNITS[rng.pick(['abc', 'aabb', 'aab'])])[0];
      var sets = [['🔴', '🔵', '🟡'], ['⭐', '🌙', '☀️'], ['🍎', '🍌', '🍇'], ['🐶', '🐱', '🐭'], ['🔺', '🟦', '🟢'], ['🐸', '🐢', '🐙'], ['🚗', '🚌', '🚲'], ['🌸', '🍀', '🌻'], ['💜', '💚', '💛'], ['🎈', '🎁', '🎂']], set = rng.shuffle(rng.pick(sets).slice()), seq = [];
      if (p.kind === 'logic' && rng.chance(.5)) {
        var arrows = ['⬆️', '➡️', '⬇️', '⬅️'], st = rng.int(0, 3), stp = rng.pick([1, 2]);
        seq = U.range(7).map(function (i) { return arrows[(st + i * stp) % 4]; });
        set = arrows;
      } else { for (var i = 0; seq.length < 7 + (L >= 3 ? 1 : 0); i++) seq.push(set[unit[i % unit.length]]); }
      var blank = L >= 4 ? rng.int(2, seq.length - 2) : seq.length - 1, ans = seq[blank];
      var shown = seq.map(function (e, i) { return i === blank ? '❔' : e; }).slice(0, blank === seq.length - 1 ? seq.length : seq.length);
      q = { ui: 'choice', prompt: t(blank === seq.length - 1 ? 'q_pattern_next' : 'q_pattern_missing'), visual: '<div class="eq" style="gap:6px;font-size:2.2rem">' + shown.map(U.esc).join(' ') + '</div>', data: { options: rng.shuffle(U.uniq(set.slice(0, Math.max(3, U.uniq(seq).length)))).map(function (e) { return { v: e, label: e }; }) }, answer: ans };
      q.hints = G.hintList(t('hc_pattern'), { text: seq.slice(0, unit.length).join(' ') + ' | ' + seq.slice(unit.length, unit.length * 2).join(' ') });
      q.sig = 'pat:' + seq.join('') + blank;
      return q;
    }
    if (p.kind === 'growing') {
      var a0 = rng.int(1, 4), d = rng.int(1, L >= 3 ? 4 : 2), terms = U.range(4).map(function (i) { return a0 + d * i; }), next = a0 + d * 4;
      var pics = terms.map(function (n) { return S.dots(n, { per: Math.max(2, d), width: 70 }); }).join('<span style="font-size:28px;align-self:center">→</span>');
      q = L <= 3 ? { ui: L <= 1 ? 'choice' : 'input', prompt: t('q_growing'), visual: '<div class="visual">' + pics + '<span style="font-size:36px;align-self:center">→ ❔</span></div>', data: L <= 1 ? { options: G.numOpts(next, rng, { n: 3, min: 1, deltas: [1, -1, d] }) } : { kind: 'int' }, answer: next }
        : { ui: 'input', prompt: t('q_num_pattern'), data: { kind: 'int', eq: terms.map(String).concat([{ blank: true }]).reduce(function (acc, x, i) { if (i) acc.push(','); acc.push(x); return acc; }, []) }, answer: next };
      q.hints = G.hintList(t('hc_pattern'), { text: m('+' + d + ' → ' + terms.join(', ')) });
      q.sig = 'grow:' + terms.join(',') + L;
      return q;
    }
    var rule = rng.pick(p.hard ? ['sq', 'tri', 'alt', 'dbl', 'fib', 'add2'] : L <= 2 ? ['add', 'sub'] : ['add', 'sub', 'dbl', 'alt', 'add2']), seq2;
    var s0 = rng.int(1, 9), k = rng.int(2, 9);
    if (rule === 'add') seq2 = U.range(5).map(function (i) { return s0 + k * i; });
    else if (rule === 'sub') seq2 = U.range(5).map(function (i) { return s0 + k * 5 - k * i; });
    else if (rule === 'dbl') seq2 = U.range(5).map(function (i) { return s0 * Math.pow(2, i); });
    else if (rule === 'alt') { var up = rng.int(3, 6), down = rng.int(1, up - 1); seq2 = [s0]; for (var j = 1; j < 6; j++) seq2.push(seq2[j - 1] + (j % 2 ? up : -down)); }
    else if (rule === 'add2') { seq2 = [s0]; for (var j2 = 1; j2 < 5; j2++) seq2.push(seq2[j2 - 1] + j2); }
    else if (rule === 'sq') { var st2 = rng.int(1, 3); seq2 = U.range(5).map(function (i) { return (st2 + i) * (st2 + i); }); }
    else if (rule === 'tri') seq2 = [1, 3, 6, 10, 15];
    else { var f1 = rng.int(1, 3); seq2 = [f1, f1]; for (var j3 = 2; j3 < 6; j3++) seq2.push(seq2[j3 - 1] + seq2[j3 - 2]); }
    var shownSeq = seq2.slice(0, seq2.length - 1), ans2 = seq2[seq2.length - 1];
    q = { ui: 'input', prompt: t('q_num_pattern'), data: { kind: 'int', eq: shownSeq.map(f).concat([{ blank: true }]).reduce(function (acc, x, i) { if (i) acc.push(','); acc.push(x); return acc; }, []) }, answer: ans2 };
    q.hints = G.hintList(t('hc_pattern'), { text: m(U.range(1, shownSeq.length).map(function (i) { var df = shownSeq[i] - shownSeq[i - 1]; return (df >= 0 ? '+' : '') + df; }).join(', ')) });
    q.explain = { text: m(seq2.map(f).join(', ')) };
    q.sig = 'npat:' + seq2.join(',');
    return q;
  });

  /* ------------------------------------------------------------------ symmetry */
  var SYM_CASES = [
    ['rectangle', 'v', true], ['rectangle', 'h', true], ['rectangle', 'd', false], ['square', 'v', true], ['square', 'd', true], ['square', 'off', false],
    ['isosceles', 'v', true], ['isosceles', 'h', false], ['heart', 'v', true], ['heart', 'h', false], ['circle', 'd', true], ['circle', 'off', false],
    ['scalene', 'v', false], ['hexagon', 'h', true], ['parallelogram', 'v', false], ['parallelogram', 'h', false], ['kite', 'v', true], ['kite', 'h', false],
    ['star', 'v', true], ['star', 'h', false], ['trapezoid', 'v', true], ['trapezoid', 'h', false]
  ];
  var SYM_COUNT = { square: 4, rectangle: 2, equilateral: 3, isosceles: 1, scalene: 0, pentagon: 5, hexagon: 6, rhombus: 2, parallelogram: 0, kite: 1, heart: 1, trapezoid: 1, star: 5 };
  function symLine(type) {
    var d = 'M100 8 V192';
    if (type === 'h') d = 'M8 100 H192'; else if (type === 'd') d = 'M20 20 L180 180'; else if (type === 'off') d = 'M70 8 V192';
    return '<path d="' + d + '" stroke="#E53935" stroke-width="3" stroke-dasharray="9 7"/>';
  }
  G.register('symmetry', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q;
    if (p.kind === 'is-line') {
      var cs = rng.pick(SYM_CASES), shape = cs[0], size = shape === 'rectangle' ? 150 : 130;
      if (cs[1] === 'd' && shape === 'rectangle') size = 150;
      var inner = S.shapeEl(shape, 100, 100, size, rng.pick(S.COLORS), 0);
      if (shape === 'rectangle' && cs[1] === 'd') inner = '<rect x="25" y="55" width="150" height="90" fill="#7FC8F8" stroke="#23233A" stroke-width="3"/>', cs = ['rectangle', 'dr', false];
      var line = cs[1] === 'dr' ? '<path d="M25 55 L175 145" stroke="#E53935" stroke-width="3" stroke-dasharray="9 7"/>' : symLine(cs[1]);
      q = { ui: 'choice', prompt: t('q_sym_is'), visual: S.wrap(200, 200, inner + line, { width: 210 }), data: { options: G.textOpts([['yes', t('q_yes')], ['no', t('q_no')]], rng), layout: 'two' }, answer: cs[2] ? 'yes' : 'no' };
      q.hints = G.hintList(t('hc_sym'));
      q.sig = 'symi:' + cs.join('');
      return q;
    }
    if (p.kind === 'count-lines') {
      var sh = rng.pick(Object.keys(SYM_COUNT)), cnt = SYM_COUNT[sh];
      var opts = U.uniq([cnt, (cnt + 1) % 7, Math.abs(cnt - 1), cnt + 2, 0, 4]).slice(0, 4);
      q = { ui: 'choice', prompt: t('q_sym_count'), visual: S.shape(sh, { size: 140, fill: rng.pick(S.COLORS) }), data: { options: rng.shuffle(opts).map(function (v) { return { v: v, label: String(v) }; }) }, answer: cnt };
      q.hints = G.hintList(t('hc_sym'));
      q.sig = 'symc:' + sh + L;
      return q;
    }
    var cols = 8, rows = L <= 2 ? 5 : 6, half = cols / 2, nCells = L <= 2 ? 3 : L <= 4 ? 5 : 7, given = [], seen = {};
    var cur = [rng.int(1, half - 1), rng.int(0, rows - 1)];
    for (var i = 0; i < 200 && given.length < nCells; i++) {
      if (!seen[cur[0] + ',' + cur[1]]) { seen[cur[0] + ',' + cur[1]] = 1; given.push(cur.slice()); }
      var dir = rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]), nx = cur[0] + dir[0], ny = cur[1] + dir[1];
      if (nx >= 0 && nx < half && ny >= 0 && ny < rows) cur = [nx, ny];
    }
    var target = given.map(function (g) { return [cols - 1 - g[0], g[1]]; }), tkey = target.map(function (x) { return x.join(','); }).sort();
    q = { ui: 'grid', prompt: t('q_sym_complete'), data: { cols: cols, rows: rows, mode: 'symmetry', given: given, axis: half }, answer: tkey };
    q.check = function (a) { return Array.isArray(a) && U.eq(a.slice().sort(), tkey); };
    q.hints = G.hintList(t('hc_sym'), { text: t('hc_sym_count') });
    q.sig = 'symg:' + given.map(function (x) { return x.join(','); }).sort().join(';');
    return q;
  });
  MA.i18n.add({ en: { hc_sym_count: 'Count how far each colored square is from the line, and color the same distance on the other side.' }, he: { hc_sym_count: 'ספרו כמה רחוקה כל משבצת צבועה מהקו, וצבעו באותו מרחק בצד השני.' } });

  /* ------------------------------------------------------------------ angles */
  function angType(d) { return d < 90 ? 'acute' : d === 90 ? 'right' : d < 180 ? 'obtuse' : 'straight'; }
  G.register('angles', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q, kind = p.kind;
    var acute = function () { return rng.pick([30, 40, 45, 50, 60, 70]); }, obtuse = function () { return rng.pick([110, 120, 130, 135, 140, 150]); };
    if (kind === 'compare') {
      var a1 = rng.pick([30, 45, 60, 90, 120, 150]), a2;
      do { a2 = rng.pick([30, 45, 60, 90, 120, 150]); } while (Math.abs(a1 - a2) < 30);
      var big = Math.max(a1, a2);
      q = { ui: 'choice', prompt: t('q_ang_bigger'), data: { options: rng.shuffle([a1, a2]).map(function (a, i) { return { v: a, html: S.angle(a, { rot: rng.int(0, 40), width: a === Math.min(a1, a2) ? 180 : 130 }), aria: a + '°' }; }), layout: 'two' }, answer: big };
      q.hints = G.hintList(t('hc_ang_size'));
      q.sig = 'angc:' + a1 + ':' + a2;
      return q;
    }
    if (kind === 'right') {
      if (L <= 2) q = { ui: 'choice', prompt: t('q_ang_right_which'), data: { options: rng.shuffle([90, acute(), obtuse()]).map(function (a) { return { v: a, html: S.angle(a, { rot: rng.pick([0, 20, -15]), width: 150, mark: false }), aria: a + '°' }; }), layout: 'col' }, answer: 90 };
      else if (L === 3) { var aa = rng.pick([90, 90, acute(), obtuse()]); q = { ui: 'choice', prompt: t('q_ang_is_right'), visual: S.angle(aa, { rot: rng.pick([0, 30, -20, 45]), mark: false }), data: { options: G.textOpts([['yes', t('q_yes')], ['no', t('q_no')]], rng), layout: 'two' }, answer: aa === 90 ? 'yes' : 'no' }; q.sig = 'angr3:' + aa + Math.random(); }
      else { var shp = rng.pick([['square', 4], ['rectangle', 4], ['right_triangle', 1], ['equilateral', 0], ['pentagon', 0], ['rhombus', 0], ['trapezoid', 0]]); q = { ui: L === 4 ? 'choice' : 'input', prompt: t('q_ang_right_count'), visual: S.shape(shp[0], { size: 130, fill: rng.pick(S.COLORS) }), data: L === 4 ? { options: [0, 1, 2, 4].map(function (v) { return { v: v, label: String(v) }; }) } : { kind: 'int' }, answer: shp[1] }; q.sig = 'angrc:' + shp[0] + L; }
      q.hints = G.hintList(t('hc_ang'));
      q.sig = q.sig || 'angr:' + L + JSON.stringify(q.data.options.map(function (o) { return o.v; }));
      return q;
    }
    if (kind === 'classify') {
      var focus = p.focus, deg;
      if (focus && L >= 2) {
        var opts = [{ v: 'acute', d: acute() }, { v: 'right', d: 90 }, { v: 'obtuse', d: obtuse() }];
        q = { ui: 'choice', prompt: t('q_ang_which', { type: t('an_' + focus) }), data: { options: rng.shuffle(opts.map(function (o) { return { v: o.v, html: S.angle(o.d, { rot: rng.pick([0, 15, -20, 35]), width: 150 }), aria: o.d + '°' }; })), layout: 'col' }, answer: focus };
        q.sig = 'angf:' + focus + L + Math.random();
      } else {
        deg = focus ? (rng.chance(.5) ? (focus === 'acute' ? acute() : focus === 'right' ? 90 : obtuse()) : rng.pick([acute(), 90, obtuse()])) : rng.pick([acute(), 90, obtuse()].concat(L >= 4 ? [180] : []));
        var labels = [['acute', t('an_acute')], ['right', t('an_right')], ['obtuse', t('an_obtuse')]].concat(L >= 4 ? [['straight', t('an_straight')]] : []);
        q = { ui: 'choice', prompt: t('q_ang_type'), visual: S.angle(deg, { rot: rng.pick([0, 20, -25, 40]) }), data: { options: G.textOpts(labels, rng), layout: 'two' }, answer: angType(deg) };
        q.sig = 'angt:' + deg + L;
      }
      q.hints = G.hintList(t('hc_ang'), { text: t('an_acute') + ' < 90° · ' + t('an_right') + ' = 90° · ' + t('an_obtuse') + ' > 90°' });
      return q;
    }
    if (kind === 'measure') {
      var dg = L <= 3 ? rng.int(1, 17) * 10 : rng.int(2, 34) * 5;
      q = { ui: 'input', prompt: t('q_ang_measure'), visual: S.protractor(dg), data: { kind: 'int', unit: '°' }, answer: dg };
      q.hints = G.hintList(t('hc_protractor'), { text: dg < 90 ? t('an_acute') + ' < 90°' : dg > 90 ? t('an_obtuse') + ' > 90°' : '90°' });
      q.sig = 'angm:' + dg;
      return q;
    }
    var basicForms = ['right', 'straight', 'full', 'half', 'quarter', 'halfturn'].concat(L >= 2 ? ['three'] : []), fm = rng.pick(L <= 2 ? basicForms : basicForms.concat(['comp', 'supp', 'comp', 'supp']));
    if (fm === 'comp') { var x = rng.int(1, 8) * 10; q = { ui: 'input', prompt: t('q_deg_comp'), data: { kind: 'int', eq: [x + '°', '+', { blank: true }, '=', '90°'] }, answer: 90 - x }; q.visual = S.angle(90, {}); }
    else if (fm === 'supp') { var y = rng.int(2, 16) * 10; q = { ui: 'input', prompt: t('q_deg_supp'), data: { kind: 'int', eq: [y + '°', '+', { blank: true }, '=', '180°'] }, answer: 180 - y }; }
    else q = { ui: L <= 1 ? 'choice' : 'input', prompt: t('q_deg_' + fm), data: L <= 1 ? { options: [45, 90, 180, 360].map(function (v) { return { v: v, label: v + '°' }; }) } : { kind: 'int', unit: '°' }, answer: { right: 90, straight: 180, full: 360, half: 45, quarter: 90, halfturn: 180, three: 270 }[fm] };
    q.hints = G.hintList(t('hc_ang'), { text: m('90° · 180° · 360°') });
    q.sig = 'angd:' + fm + JSON.stringify(q.answer) + L;
    return q;
  });
  MA.i18n.add({
    en: { q_deg_quarter: 'How many degrees are in a quarter turn?', q_deg_halfturn: 'How many degrees are in a half turn?', q_deg_three: 'How many degrees are in three right angles?', prop_5: '5 sides', prop_6: '6 sides' },
    he: { q_deg_quarter: 'כמה מעלות יש ברבע סיבוב?', q_deg_halfturn: 'כמה מעלות יש בחצי סיבוב?', q_deg_three: 'כמה מעלות יש בשלוש זוויות ישרות?', prop_5: '5 צלעות', prop_6: '6 צלעות' }
  });

  /* ------------------------------------------------------------------ lines */
  G.register('lines', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q, kind = p.kind;
    if (kind === 'identify') {
      var k = rng.pick(['line', 'ray', 'segment']);
      q = { ui: 'choice', prompt: t('q_line_name'), visual: S.lineFig(k, { rot: rng.pick([0, 20, -30, 45]) }), data: { options: G.textOpts([['line', t('ln_line')], ['ray', t('ln_ray')], ['segment', t('ln_segment')]], rng), layout: 'col' }, answer: k };
      q.hints = G.hintList(t('hc_lines'));
      q.sig = 'ln:' + k + L + Math.random();
      return q;
    }
    if (kind === 'mixed' || L >= 5) {
      var k2 = rng.pick(['parallel', 'perp', 'intersect']);
      q = { ui: 'choice', prompt: t('q_lines_type'), visual: S.lineFig(k2, { rot: rng.pick([0, 25, -35, 60]) }), data: { options: G.textOpts([['parallel', t('ln_parallel')], ['perp', t('ln_perp')], ['intersect', t('ln_intersect')]], rng), layout: 'col' }, answer: k2 };
      q.hints = G.hintList(t('hc_parallel') + ' ' + t('hc_perp'));
      q.sig = 'lnm:' + k2 + Math.random();
      return q;
    }
    var want = kind === 'parallel' ? 'parallel' : 'perp';
    if (L <= 3) {
      var shown = rng.pick([want, want, 'intersect', want === 'parallel' ? 'perp' : 'parallel']);
      q = { ui: 'choice', prompt: t(want === 'parallel' ? 'q_is_parallel' : 'q_is_perp'), visual: S.lineFig(shown, { rot: rng.pick([0, 30, -40, 70]) }), data: { options: G.textOpts([['yes', t('q_yes')], ['no', t('q_no')]], rng), layout: 'two' }, answer: shown === want ? 'yes' : 'no' };
    } else {
      q = { ui: 'choice', prompt: t(want === 'parallel' ? 'q_which_parallel' : 'q_which_perp'), data: { options: rng.shuffle(['parallel', 'perp', 'intersect'].map(function (k3) { return { v: k3, html: S.lineFig(k3, { rot: rng.pick([0, 30, -40]), width: 160 }), aria: k3 }; })), layout: 'col' }, answer: want };
    }
    q.hints = G.hintList(want === 'parallel' ? t('hc_parallel') : t('hc_perp'));
    q.sig = 'lnp:' + want + L + Math.random();
    return q;
  });
  MA.i18n.add({ en: { hc_lines: 'A line goes on forever both ways (2 arrows). A ray has 1 end point. A segment has 2 end points.' }, he: { hc_lines: 'ישר נמשך לנצח לשני הכיוונים (2 חצים). לקרן נקודת קצה אחת. לקטע 2 נקודות קצה.' } });

  /* ------------------------------------------------------------------ perimeter & area */
  function rectCells(w, h, ox, oy) { var out = []; for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) out.push([ox + x, oy + y]); return out; }
  function lCells(rng, maxW, maxH) {
    var w = rng.int(3, maxW), h = rng.int(3, maxH), cw = rng.int(1, w - 1), ch = rng.int(1, h - 1);
    return rectCells(w, h, 0, 0).filter(function (c) { return !(c[0] >= w - cw && c[1] < ch); });
  }
  function perimOf(cells) { var on = {}, p = 0; cells.forEach(function (c) { on[c[0] + ',' + c[1]] = 1; }); cells.forEach(function (c) { [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { if (!on[(c[0] + d[0]) + ',' + (c[1] + d[1])]) p++; }); }); return p; }
  G.perimOf = perimOf;
  G.register('perimeter', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q, unit = 'cm';
    if (p.kind === 'grid') {
      if (L === 5) {
        var P = rng.pick([6, 8, 10, 12, 14, 16, 18, 20, 22, 24]), pw = Math.min(8, P / 2 - 1);
        if (P / 2 - pw > 6) return null;
        q = { ui: 'grid', prompt: t('q_perim_build', { p: P }), data: { cols: 8, rows: 6, mode: 'perimeter', target: P }, answer: rectKeys(pw, P / 2 - pw) };
        q.check = function (a) { return Array.isArray(a) && a.length > 0 && isRect(a) && perimOf(a.map(function (s) { return s.split(',').map(Number); })) === P; };
        q.sig = 'perb:' + P;
      } else {
        var cells = L <= 2 ? rectCells(rng.int(2, L === 1 ? 4 : 6), rng.int(1, L === 1 ? 3 : 4), 0, 0) : lCells(rng, 6, 5), per = perimOf(cells);
        var W = Math.max.apply(null, cells.map(function (x) { return x[0]; })) + 1, H = Math.max.apply(null, cells.map(function (x) { return x[1]; })) + 1;
        q = { ui: 'input', prompt: t('q_perim_grid'), visual: S.gridCells(W + 2, H + 2, cells.map(function (x) { return [x[0] + 1, x[1] + 1]; }), { cell: 32 }), data: { kind: 'int' }, answer: per };
        q.sig = 'perg:' + JSON.stringify(cells);
      }
      q.hints = G.hintList(t('hc_perim'), { text: t('hc_perim_grid') });
      return q;
    }
    var w = rng.int(3, Math.min(25, p.max / 4)), h = rng.int(2, Math.max(2, w - 1));
    if (L <= 2) { q = { ui: 'input', prompt: t('q_perim_rect'), visual: S.rectDims(w, h, { unit: unit }), data: { kind: 'int', unit: unit }, answer: 2 * (w + h) }; }
    else if (L <= 4) { var Pp = 2 * (w + h); q = { ui: 'input', prompt: t('q_perim_missing', { p: Pp, l: w, u: unit }), visual: S.rectDims(w, h, { unit: unit, hl: '?' }), data: { kind: 'int', unit: unit }, answer: h }; }
    else { var a = rng.int(6, 14), b = rng.int(5, 12), cc = rng.int(2, a - 3), dd = rng.int(2, b - 3); q = { ui: 'input', prompt: t('q_perim_poly'), visual: S.lShape(a, b, cc, dd, { unit: unit }), data: { kind: 'int', unit: unit }, answer: 2 * (a + b) }; w = a; h = b; }
    q.hints = G.hintList(t('hc_perim'), { text: m(w + ' + ' + h + ' + ' + w + ' + ' + h) });
    q.explain = { text: m('2 × (' + w + ' + ' + h + ') = ' + 2 * (w + h)) };
    q.sig = 'per:' + L + ':' + w + 'x' + h + JSON.stringify(q.answer);
    return q;
  });
  function rectKeys(w, h) { return rectCells(w, h, 0, 0).map(function (c) { return c[0] + ',' + c[1]; }); }
  /* a w x h rectangle with area n that fits the 8 x 6 grid */
  function rectFor(n) { for (var hh = 2; hh <= 6; hh++) if (n % hh === 0 && n / hh <= 8) return [n / hh, hh]; return [n, 1]; }
  function isRect(keys) {
    var pts2 = keys.map(function (s) { return s.split(',').map(Number); }), xs = pts2.map(function (p) { return p[0]; }), ys = pts2.map(function (p) { return p[1]; });
    var w = Math.max.apply(null, xs) - Math.min.apply(null, xs) + 1, h = Math.max.apply(null, ys) - Math.min.apply(null, ys) + 1;
    return w * h === U.uniq(keys).length;
  }
  G.isRect = isRect;
  MA.i18n.add({ en: { hc_perim_grid: 'Walk around the outside edge and count every little side.' }, he: { hc_perim_grid: 'עברו לאורך השפה החיצונית וספרו כל צלע קטנה.' } });
  G.register('area', function (c) {
    var rng = c.rng, p = c.p, L = c.level, q, w, h, unit = 'cm';
    if (p.kind === 'count') {
      if (L === 4) { var n = rng.int(5, 12); q = { ui: 'grid', prompt: t('q_area_build', { n: n }), data: { cols: 8, rows: 6, mode: 'area', target: n }, answer: rectKeys(8, 6).slice(0, n) }; q.check = function (a) { return Array.isArray(a) && U.uniq(a).length === n; }; q.sig = 'areab:' + n; q.hints = G.hintList(t('hc_area')); return q; }
      if (L === 5) { var n2 = rng.pick([4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24]), rr = rectFor(n2); q = { ui: 'grid', prompt: t('q_area_rect_build', { n: n2 }), data: { cols: 8, rows: 6, mode: 'rect', target: n2 }, answer: rectKeys(rr[0], rr[1]) }; q.check = function (a) { return Array.isArray(a) && U.uniq(a).length === n2 && isRect(a); }; q.sig = 'arear:' + n2; q.hints = G.hintList(t('hc_area'), { text: m(n2 + ' = ' + rr[0] + ' × ' + rr[1]) }); return q; }
      var cells = L <= 2 ? rectCells(rng.int(2, 5), rng.int(2, 4), 0, 0) : lCells(rng, 6, 5);
      var W = Math.max.apply(null, cells.map(function (x) { return x[0]; })) + 1, H = Math.max.apply(null, cells.map(function (x) { return x[1]; })) + 1;
      q = { ui: L === 1 ? 'choice' : 'input', prompt: t('q_area_count'), visual: S.gridCells(W + 2, H + 2, cells.map(function (x) { return [x[0] + 1, x[1] + 1]; }), { cell: 32 }), data: L === 1 ? { options: G.numOpts(cells.length, rng, { n: 3, min: 1 }) } : { kind: 'int' }, answer: cells.length };
      q.hints = G.hintList(t('hc_area'));
      q.sig = 'areac:' + JSON.stringify(cells);
      return q;
    }
    if (p.kind === 'both') {
      w = rng.int(4, 15); h = rng.int(3, w - 1);
      var askPer = rng.chance(.5);
      q = { ui: 'input', prompt: t(askPer ? 'q_fence' : 'q_grass', { w: w, h: h }), visual: S.rectDims(w, h, { unit: 'm', fill: '#B9E8A5' }), data: { kind: 'int' }, answer: askPer ? 2 * (w + h) : w * h };
      q.hints = G.hintList(t('hc_fence'), { text: askPer ? m(w + ' + ' + h + ' + ' + w + ' + ' + h) : m(w + ' × ' + h) });
      q.sig = 'areap:' + w + 'x' + h + askPer;
      return q;
    }
    w = rng.int(3, Math.min(12, Math.floor(Math.sqrt(p.max || 100)) + 2)); h = rng.int(2, Math.max(2, Math.min(12, w)));
    if (L <= 2) q = { ui: 'input', prompt: t('q_area_rect'), visual: L === 1 ? S.gridCells(w, h, rectCells(w, h, 0, 0), { cell: 26 }) : S.rectDims(w, h, { unit: unit }), data: { kind: 'int' }, answer: w * h };
    else if (L === 3) q = { ui: 'input', prompt: t('q_area_missing', { a: w * h, l: w, u: unit }), visual: S.rectDims(w, h, { unit: unit, hl: '?' }), data: { kind: 'int', unit: unit }, answer: h };
    else { var a = rng.int(6, 12), b = rng.int(5, 10), cc = rng.int(2, a - 3), dd = rng.int(2, b - 3); q = { ui: 'input', prompt: t('q_area_l'), visual: S.lShape(a, b, cc, dd, { unit: unit }), data: { kind: 'int' }, answer: a * b - cc * dd }; w = a; h = b; }
    q.hints = G.hintList(t('hc_area'), { text: L >= 4 ? m(w + ' × ' + h + ' − ' + '…') : m(w + ' × ' + h) });
    q.sig = 'area:' + L + ':' + w + 'x' + h + JSON.stringify(q.answer);
    return q;
  });
})(window.MA = window.MA || {});
