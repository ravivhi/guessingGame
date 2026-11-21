/* The prize shop: what children can buy with their coins. slot = where it is worn (one item per slot),
   gender 'm' / 'f' = only shown to boys / girls (null = everyone), draw = how avatar.js draws it.
   Pets, backgrounds and frames keep their ids from earlier versions, so purchases carry over. */
(function (MA) {
  'use strict';
  var out = MA.SHOP_ITEMS = [];
  function I(id, cat, slot, g, price, lvl, icon, en, he, draw, extra) {
    var r = { id: id, category: cat, slot: slot, gender: g || null, price: price, minLevel: lvl, icon: icon, name: { en: en, he: he }, draw: draw || null, enabled: true };
    if (extra) for (var k in extra) r[k] = extra[k];
    out.push(r);
  }
  /* ---------------------------------------------------------------- clothes: tops, dresses, costumes */
  var c = 'clothes';
  I('top_stripes', c, 'top', null, 30, 1, '👕', 'Striped T-shirt', 'חולצת פסים', { kind: 'tee', color: '#3B82F6', pattern: 'stripes', patternColor: '#FFFFFF' });
  I('top_dino', c, 'top', null, 40, 1, '🦖', 'Dinosaur T-shirt', 'חולצת דינוזאור', { kind: 'tee', color: '#4CC38A', emblem: '🦖' });
  I('top_stars', c, 'top', null, 45, 1, '⭐', 'Star T-shirt', 'חולצת כוכבים', { kind: 'tee', color: '#6C4CF1', pattern: 'stars', patternColor: '#FFD43B' });
  I('top_cat', c, 'top', 'f', 40, 1, '🐱', 'Kitty T-shirt', 'חולצת חתלתול', { kind: 'tee', color: '#FFC9E3', emblem: '🐱' });
  I('top_heart', c, 'top', 'f', 45, 1, '💖', 'Heart T-shirt', 'חולצת לבבות', { kind: 'tee', color: '#FF7EB6', pattern: 'hearts', patternColor: '#FFFFFF' });
  I('top_car', c, 'top', 'm', 45, 1, '🏎️', 'Race car T-shirt', 'חולצת מכונית מרוץ', { kind: 'tee', color: '#FFD43B', emblem: '🏎️' });
  I('top_ball', c, 'top', 'm', 40, 1, '⚽', 'Soccer T-shirt', 'חולצת כדורגל', { kind: 'tee', color: '#4CC38A', emblem: '⚽' });
  I('top_rocket', c, 'top', null, 55, 2, '🚀', 'Rocket T-shirt', 'חולצת חללית', { kind: 'tee', color: '#1E3A8A', emblem: '🚀' });
  I('top_shark', c, 'top', null, 60, 2, '🦈', 'Shark T-shirt', 'חולצת כריש', { kind: 'tee', color: '#22B8CF', emblem: '🦈' });
  I('top_butterfly', c, 'top', 'f', 55, 2, '🦋', 'Butterfly T-shirt', 'חולצת פרפר', { kind: 'tee', color: '#B197FC', emblem: '🦋' });
  I('top_unicorn', c, 'top', 'f', 65, 2, '🦄', 'Unicorn T-shirt', 'חולצת חד־קרן', { kind: 'tee', color: '#E5DBFF', emblem: '🦄' });
  I('top_robot', c, 'top', 'm', 60, 2, '🤖', 'Robot T-shirt', 'חולצת רובוט', { kind: 'tee', color: '#868E96', emblem: '🤖' });
  I('top_lightning', c, 'top', 'm', 60, 2, '⚡', 'Lightning T-shirt', 'חולצת ברק', { kind: 'tee', color: '#212529', emblem: '⚡' });
  I('top_camo', c, 'top', 'm', 70, 2, '🪖', 'Camo T-shirt', 'חולצת הסוואה', { kind: 'tee', color: '#6B7F4E', pattern: 'camo', patternColor: '#3F4A2E' });
  I('top_dots', c, 'top', 'f', 50, 2, '🔴', 'Polka dot T-shirt', 'חולצת נקודות', { kind: 'tee', color: '#FF6B6B', pattern: 'dots', patternColor: '#FFFFFF' });
  I('top_jersey_blue', c, 'top', 'm', 90, 2, '🎽', 'Blue soccer jersey', 'גופיית כדורגל כחולה', { kind: 'tank', color: '#1E66F5', color2: '#FFFFFF', num: '10' });
  I('top_jersey_red', c, 'top', 'm', 90, 2, '🎽', 'Red soccer jersey', 'גופיית כדורגל אדומה', { kind: 'tank', color: '#E03131', color2: '#FFFFFF', num: '7' });
  I('top_jersey_basket', c, 'top', null, 110, 3, '🏀', 'Basketball jersey', 'גופיית כדורסל', { kind: 'tank', color: '#FF922B', color2: '#1E3A8A', num: '23' });
  I('top_hoodie_gray', c, 'top', null, 80, 2, '🧥', 'Gray hoodie', 'קפוצ׳ון אפור', { kind: 'hoodie', color: '#9AA5B1' });
  I('top_hoodie_green', c, 'top', 'm', 80, 2, '🧥', 'Green hoodie', 'קפוצ׳ון ירוק', { kind: 'hoodie', color: '#2F9E44' });
  I('top_hoodie_pink', c, 'top', 'f', 80, 2, '🧥', 'Pink hoodie', 'קפוצ׳ון ורוד', { kind: 'hoodie', color: '#F783AC' });
  I('top_pajamas', c, 'top', null, 90, 2, '🌙', 'Starry pajamas', 'פיג׳מת כוכבים', { kind: 'pajamas', color: '#364FC7', pattern: 'stars', patternColor: '#FFE066' });
  I('top_sweater', c, 'top', null, 100, 3, '🧶', 'Winter sweater', 'סוודר חורף', { kind: 'sweater', color: '#E03131', color2: '#FFFFFF' });
  I('top_raincoat', c, 'top', null, 120, 3, '☔', 'Raincoat', 'מעיל גשם', { kind: 'raincoat', color: '#FFD43B' });
  I('top_overalls', c, 'top', null, 130, 3, '👖', 'Overalls', 'סרבל ג׳ינס', { kind: 'overalls', color: '#4A7BC8', color2: '#FF6B6B' });
  I('top_rainbow', c, 'top', null, 150, 3, '🌈', 'Rainbow T-shirt', 'חולצת קשת', { kind: 'tee', color: 'rainbow' });
  I('top_denim', c, 'top', null, 160, 4, '🧥', 'Denim jacket', 'מעיל ג׳ינס', { kind: 'jacket', color: '#4A7BC8', color2: '#FFFFFF' });
  I('top_chef', c, 'top', null, 180, 4, '👨‍🍳', 'Chef jacket', 'מדי שף', { kind: 'chef', color: '#E03131' });
  I('top_leather', c, 'top', 'm', 220, 5, '🧥', 'Cool jacket', 'מעיל עור', { kind: 'jacket', color: '#2B2B2B', color2: '#E03131' });
  I('top_karate', c, 'top', null, 260, 5, '🥋', 'Karate uniform', 'חליפת קראטה', { kind: 'karate', color: '#212529' });
  I('top_hero', c, 'top', 'm', 350, 6, '🦸‍♂️', 'Superhero suit', 'חליפת גיבור־על', { kind: 'cape', color: '#1E66F5', color2: '#E53935', emblem: '⚡' });
  I('top_heroine', c, 'top', 'f', 350, 6, '🦸‍♀️', 'Superheroine suit', 'חליפת גיבורת־על', { kind: 'cape', color: '#9B6BFF', color2: '#FF7EB6', emblem: '⭐' });
  I('top_tux', c, 'top', 'm', 400, 7, '🤵', 'Tuxedo', 'חליפה חגיגית', { kind: 'suit', color: '#2B2B2B', color2: '#E03131' });
  I('top_space', c, 'top', null, 450, 8, '👩‍🚀', 'Astronaut suit', 'חליפת אסטרונאוט', { kind: 'space', color: '#F1F3F5' });
  I('top_armor', c, 'top', null, 600, 9, '🛡️', 'Knight armor', 'שריון אביר', { kind: 'armor', color: 'silver', color2: '#E03131' });
  I('top_gold_hero', c, 'top', 'm', 1000, 12, '🏆', 'Golden hero suit', 'חליפת גיבור זהב', { kind: 'cape', color: 'gold', color2: '#7048E8', emblem: '🏆' });
  /* dresses */
  I('dress_pink', c, 'top', 'f', 90, 1, '👗', 'Pink dress', 'שמלה ורודה', { kind: 'dress', color: '#FF8FC7', color2: '#FFFFFF' });
  I('dress_stripes', c, 'top', 'f', 110, 2, '👗', 'Sunny striped dress', 'שמלת פסים', { kind: 'dress', color: '#FFB020', pattern: 'stripes', patternColor: '#FFF3BF', color2: '#FFFFFF' });
  I('dress_dots', c, 'top', 'f', 120, 2, '👗', 'Polka dot dress', 'שמלת נקודות', { kind: 'dress', color: '#3B82F6', pattern: 'dots', patternColor: '#FFFFFF', color2: '#FFD43B' });
  I('dress_flowers', c, 'top', 'f', 140, 3, '🌼', 'Flower dress', 'שמלת פרחים', { kind: 'dress', color: '#69DB7C', pattern: 'flowers', patternColor: '#FFFFFF', color2: '#FF7EB6' });
  I('dress_hearts', c, 'top', 'f', 150, 3, '💗', 'Heart dress', 'שמלת לבבות', { kind: 'dress', color: '#E64980', pattern: 'hearts', patternColor: '#FFDEEB', color2: '#FFFFFF' });
  I('dress_tutu', c, 'top', 'f', 200, 4, '🩰', 'Ballet tutu', 'טוטו של בלט', { kind: 'tutu', color: '#FF8FC7', color2: '#FFD1E8' });
  I('dress_sparkle', c, 'top', 'f', 240, 5, '✨', 'Sparkly party dress', 'שמלת מסיבה נוצצת', { kind: 'dress', color: '#9B6BFF', pattern: 'sparkle', patternColor: '#FFFFFF', color2: '#FFD43B' });
  I('dress_princess', c, 'top', 'f', 500, 8, '👸', 'Princess gown', 'שמלת נסיכה', { kind: 'gown', color: '#C084FC', color2: '#FFFFFF' });
  I('dress_ice', c, 'top', 'f', 700, 10, '❄️', 'Ice queen gown', 'שמלת מלכת הקרח', { kind: 'gown', color: '#74C0FC', color2: '#FFFFFF' });
  I('dress_gold', c, 'top', 'f', 1000, 12, '🌟', 'Golden ball gown', 'שמלת נשף זהובה', { kind: 'gown', color: 'gold', color2: '#FFFFFF' });

  /* ---------------------------------------------------------------- pants, skirts and shoes */
  c = 'legs';
  I('bot_jeans_light', c, 'bottom', null, 30, 1, '👖', 'Light jeans', 'ג׳ינס בהיר', { kind: 'pants', color: '#6C9BD2' });
  I('bot_black', c, 'bottom', null, 30, 1, '👖', 'Black pants', 'מכנסיים שחורים', { kind: 'pants', color: '#343A40' });
  I('bot_shorts_red', c, 'bottom', null, 25, 1, '🩳', 'Red shorts', 'מכנסיים קצרים אדומים', { kind: 'shorts', color: '#E03131' });
  I('bot_shorts_sport', c, 'bottom', 'm', 40, 1, '🩳', 'Sports shorts', 'מכנסי ספורט', { kind: 'shorts', color: '#1E66F5', stripe: '#FFFFFF' });
  I('bot_skirt_pink', c, 'bottom', 'f', 30, 1, '👗', 'Pink skirt', 'חצאית ורודה', { kind: 'skirt', color: '#F783AC' });
  I('bot_leggings', c, 'bottom', 'f', 35, 1, '🩱', 'Purple leggings', 'טייץ סגול', { kind: 'leggings', color: '#7048E8' });
  I('bot_skirt_dots', c, 'bottom', 'f', 45, 2, '👗', 'Dotty skirt', 'חצאית נקודות', { kind: 'skirt', color: '#20C997', pattern: 'dots', patternColor: '#FFFFFF' });
  I('bot_cargo', c, 'bottom', 'm', 60, 2, '👖', 'Cargo pants', 'מכנסי דגמ״ח', { kind: 'cargo', color: '#6B7F4E' });
  I('bot_skirt_plaid', c, 'bottom', 'f', 60, 2, '👗', 'Checked skirt', 'חצאית משבצות', { kind: 'skirt', color: '#E03131', pattern: 'checks', patternColor: '#FFC9C9' });
  I('bot_camo', c, 'bottom', 'm', 70, 3, '👖', 'Camo pants', 'מכנסי הסוואה', { kind: 'pants', color: '#6B7F4E', pattern: 'camo', patternColor: '#3F4A2E' });
  I('bot_leggings_stars', c, 'bottom', 'f', 70, 3, '⭐', 'Star leggings', 'טייץ כוכבים', { kind: 'leggings', color: '#364FC7', pattern: 'stars', patternColor: '#FFE066' });
  I('bot_tutu', c, 'bottom', 'f', 90, 3, '🩰', 'Tutu skirt', 'חצאית טוטו', { kind: 'tutu', color: '#FFC9E3' });
  I('bot_rainbow', c, 'bottom', null, 160, 5, '🌈', 'Rainbow pants', 'מכנסי קשת', { kind: 'pants', color: 'rainbow' });
  I('shoe_blue', c, 'shoes', null, 25, 1, '👟', 'Blue sneakers', 'נעלי ספורט כחולות', { kind: 'sneakers', color: '#3B82F6' });
  I('shoe_green', c, 'shoes', null, 25, 1, '👟', 'Green sneakers', 'נעלי ספורט ירוקות', { kind: 'sneakers', color: '#40C057' });
  I('shoe_black', c, 'shoes', 'm', 30, 1, '👟', 'Black sneakers', 'נעלי ספורט שחורות', { kind: 'sneakers', color: '#343A40' });
  I('shoe_purple', c, 'shoes', 'f', 30, 1, '👟', 'Purple sneakers', 'נעלי ספורט סגולות', { kind: 'sneakers', color: '#9B6BFF' });
  I('shoe_sandals', c, 'shoes', null, 35, 1, '🩴', 'Sandals', 'סנדלים', { kind: 'sandals', color: '#A0522D' });
  I('shoe_flats', c, 'shoes', 'f', 50, 2, '🩰', 'Ballet flats', 'נעלי בובה', { kind: 'flats', color: '#E64980' });
  I('shoe_rain', c, 'shoes', null, 55, 2, '🥾', 'Rain boots', 'מגפי גשם', { kind: 'boots', color: '#FFD43B' });
  I('shoe_boots', c, 'shoes', null, 70, 2, '🥾', 'Hiking boots', 'נעלי הרים', { kind: 'boots', color: '#8B5A2B' });
  I('shoe_cleats', c, 'shoes', 'm', 90, 3, '⚽', 'Soccer cleats', 'נעלי כדורגל', { kind: 'cleats', color: '#FF922B' });
  I('shoe_sparkle', c, 'shoes', 'f', 120, 4, '✨', 'Sparkly shoes', 'נעליים נוצצות', { kind: 'sparkle', color: '#C084FC' });
  I('shoe_lightup', c, 'shoes', null, 200, 5, '💡', 'Light-up sneakers', 'נעליים מאירות', { kind: 'lightup', color: '#F1F3F5' });
  I('shoe_rocket', c, 'shoes', null, 600, 9, '🚀', 'Rocket boots', 'מגפי טיל', { kind: 'rocket', color: '#D7DEE6' });

  /* ---------------------------------------------------------------- hair styles and colors */
  c = 'hair';
  I('hair_bowl', c, 'hair', 'm', 60, 2, '💇‍♂️', 'Bowl cut', 'תספורת קערה', { style: 'bowl' });
  I('hair_long_boy', c, 'hair', 'm', 90, 2, '🏄', 'Surfer hair', 'שיער גולש', { style: 'long_boy' });
  I('hair_quiff', c, 'hair', 'm', 110, 3, '😎', 'Cool quiff', 'בלורית', { style: 'quiff' });
  I('hair_mohawk', c, 'hair', 'm', 130, 3, '🤘', 'Mohawk', 'מוהוק', { style: 'mohawk' });
  I('hair_manbun', c, 'hair', 'm', 150, 4, '🥷', 'Ninja bun', 'קוקו נינג׳ה', { style: 'manbun' });
  I('hair_bun', c, 'hair', 'f', 70, 2, '🩰', 'Ballet bun', 'קוקו בלרינה', { style: 'bun' });
  I('hair_side_pony', c, 'hair', 'f', 80, 2, '🎀', 'Side ponytail', 'קוקו בצד', { style: 'side_pony' });
  I('hair_braids', c, 'hair', 'f', 90, 2, '👧', 'Braids', 'צמות', { style: 'braids' });
  I('hair_puffs', c, 'hair', 'f', 110, 3, '☁️', 'Puffy buns', 'פונפונים', { style: 'afro_puffs' });
  I('hair_space_buns', c, 'hair', 'f', 120, 3, '🪐', 'Space buns', 'שני קוקויים עגולים', { style: 'space_buns' });
  I('hair_princess', c, 'hair', 'f', 300, 6, '👸', 'Princess hair', 'שיער נסיכה ארוך', { style: 'princess' });
  I('hc_red', c, 'hairColor', null, 70, 2, '🔴', 'Red hair color', 'צבע שיער אדום', { color: '#E03131' });
  I('hc_orange', c, 'hairColor', null, 70, 2, '🟠', 'Orange hair color', 'צבע שיער כתום', { color: '#FF922B' });
  I('hc_blue', c, 'hairColor', null, 80, 2, '🔵', 'Blue hair color', 'צבע שיער כחול', { color: '#4AA8FF' });
  I('hc_pink', c, 'hairColor', 'f', 80, 2, '🩷', 'Pink hair color', 'צבע שיער ורוד', { color: '#FF7EB6' });
  I('hc_green', c, 'hairColor', null, 90, 3, '🟢', 'Green hair color', 'צבע שיער ירוק', { color: '#40C057' });
  I('hc_purple', c, 'hairColor', null, 90, 3, '🟣', 'Purple hair color', 'צבע שיער סגול', { color: '#9B6BFF' });
  I('hc_turquoise', c, 'hairColor', null, 100, 3, '🩵', 'Turquoise hair color', 'צבע שיער טורקיז', { color: '#22D3EE' });
  I('hc_silver', c, 'hairColor', null, 150, 4, '⚪', 'Silver hair color', 'צבע שיער כסוף', { color: 'silver' });
  I('hc_rainbow', c, 'hairColor', null, 400, 7, '🌈', 'Rainbow hair', 'שיער בצבעי הקשת', { color: 'rainbow' });
  I('hc_gold', c, 'hairColor', null, 500, 8, '🟡', 'Golden hair', 'שיער זהב', { color: 'gold' });

  /* ---------------------------------------------------------------- hats and glasses */
  c = 'hats';
  I('hat_cap_red', c, 'hat', null, 30, 1, '🧢', 'Red cap', 'כובע מצחייה אדום', { kind: 'cap', color: '#E03131' });
  I('hat_cap_blue', c, 'hat', 'm', 30, 1, '🧢', 'Blue cap', 'כובע מצחייה כחול', { kind: 'cap', color: '#1E66F5' });
  I('hat_bow_pink', c, 'hat', 'f', 30, 1, '🎀', 'Pink bow', 'פפיון ורוד', { kind: 'bow', color: '#F783AC' });
  I('hat_bow_red', c, 'hat', 'f', 30, 1, '🎀', 'Red bow', 'פפיון אדום', { kind: 'bow', color: '#E03131' });
  I('hat_clip_star', c, 'hat', 'f', 25, 1, '⭐', 'Star hair clip', 'סיכת כוכב', { kind: 'clip', emoji: '⭐' });
  I('hat_clip_butterfly', c, 'hat', 'f', 30, 1, '🦋', 'Butterfly hair clip', 'סיכת פרפר', { kind: 'clip', emoji: '🦋' });
  I('hat_beanie', c, 'hat', null, 40, 1, '🧶', 'Winter beanie', 'כובע גרב', { kind: 'beanie', color: '#40C057', color2: '#FFFFFF' });
  I('hat_party', c, 'hat', null, 50, 1, '🥳', 'Party hat', 'כובע מסיבה', { kind: 'party', color: '#7048E8', color2: '#FFD43B' });
  I('hat_bunny', c, 'hat', 'f', 70, 2, '🐰', 'Bunny ears', 'אוזני ארנב', { kind: 'bunny', color: '#FFFFFF' });
  I('hat_cat', c, 'hat', 'f', 70, 2, '🐱', 'Cat ears', 'אוזני חתול', { kind: 'cat', color: '#495057' });
  I('hat_sunhat', c, 'hat', 'f', 80, 2, '👒', 'Sun hat', 'כובע קש', { kind: 'sunhat', color: '#F4D9A0', color2: '#FF7EB6' });
  I('hat_chef', c, 'hat', null, 80, 2, '👨‍🍳', 'Chef hat', 'כובע שף', { kind: 'chef' });
  I('hat_cowboy', c, 'hat', null, 90, 2, '🤠', 'Cowboy hat', 'כובע בוקרים', { kind: 'cowboy', color: '#A0522D' });
  I('hat_headphones', c, 'hat', null, 110, 3, '🎧', 'Headphones', 'אוזניות', { kind: 'headphones', color: '#E03131' });
  I('hat_propeller', c, 'hat', null, 120, 3, '🚁', 'Propeller cap', 'כובע פרופלור', { kind: 'propeller' });
  I('hat_flowers', c, 'hat', 'f', 120, 3, '🌸', 'Flower crown', 'זר פרחים', { kind: 'flowers' });
  I('hat_pirate', c, 'hat', 'm', 140, 4, '🏴‍☠️', 'Pirate hat', 'כובע פיראטים', { kind: 'pirate' });
  I('hat_tophat', c, 'hat', 'm', 150, 4, '🎩', 'Top hat', 'כובע צילינדר', { kind: 'tophat', color: '#E03131' });
  I('hat_grad', c, 'hat', null, 200, 5, '🎓', 'Graduation cap', 'כובע סיום', { kind: 'grad' });
  I('hat_viking', c, 'hat', 'm', 220, 5, '🪓', 'Viking helmet', 'קסדת ויקינגים', { kind: 'viking' });
  I('hat_wizard', c, 'hat', null, 260, 6, '🧙', 'Wizard hat', 'כובע קוסם', { kind: 'wizard', color: '#4263EB' });
  I('hat_tiara', c, 'hat', 'f', 300, 6, '💎', 'Tiara', 'נזר', { kind: 'tiara', color: '#F06595' });
  I('hat_space', c, 'hat', null, 400, 7, '🧑‍🚀', 'Space helmet', 'קסדת חלל', { kind: 'helmet' });
  I('hat_crown', c, 'hat', null, 500, 8, '👑', 'Royal crown', 'כתר מלכותי', { kind: 'crown' });
  I('gl_round', c, 'glasses', null, 40, 1, '👓', 'Round glasses', 'משקפיים עגולים', { kind: 'round', color: '#343A40' });
  I('gl_square', c, 'glasses', null, 40, 1, '👓', 'Square glasses', 'משקפיים מרובעים', { kind: 'square', color: '#1E66F5' });
  I('gl_sun', c, 'glasses', null, 70, 2, '🕶️', 'Sunglasses', 'משקפי שמש', { kind: 'sun' });
  I('gl_star', c, 'glasses', null, 90, 3, '🤩', 'Star glasses', 'משקפי כוכבים', { kind: 'star', color: '#FFD43B' });
  I('gl_heart', c, 'glasses', 'f', 90, 3, '😍', 'Heart glasses', 'משקפי לבבות', { kind: 'heart', color: '#F06595' });
  I('gl_goggles', c, 'glasses', 'm', 100, 3, '🥽', 'Swim goggles', 'משקפי שחייה', { kind: 'goggles', color: '#1E66F5' });
  I('gl_mask', c, 'glasses', null, 150, 4, '🦹', 'Hero mask', 'מסכת גיבורים', { kind: 'mask', color: '#212529' });

  /* ---------------------------------------------------------------- jewelry and accessories */
  c = 'jewels';
  I('jw_band', c, 'wrist', 'm', 40, 1, '🔴', 'Sports wristband', 'מגן זיעה', { kind: 'band', color: '#E03131' });
  I('jw_bracelet', c, 'wrist', 'f', 50, 1, '💗', 'Pink bracelet', 'צמיד ורוד', { kind: 'band', color: '#F783AC' });
  I('jw_scarf', c, 'neck', null, 50, 1, '🧣', 'Striped scarf', 'צעיף פסים', { kind: 'scarf', color: '#E03131', pattern: 'stripes', patternColor: '#FFFFFF' });
  I('jw_bowtie', c, 'neck', 'm', 60, 2, '🎀', 'Bow tie', 'עניבת פרפר', { kind: 'bowtie', color: '#E03131' });
  I('jw_studs', c, 'ears', 'f', 60, 2, '✨', 'Gold earrings', 'עגילי זהב', { kind: 'studs', color: '#FCC419' });
  I('jw_tie', c, 'neck', 'm', 70, 2, '👔', 'Tie', 'עניבה', { kind: 'tie', color: '#1E66F5' });
  I('jw_beads', c, 'wrist', 'f', 70, 2, '📿', 'Bead bracelet', 'צמיד חרוזים', { kind: 'beads' });
  I('jw_lei', c, 'neck', null, 90, 3, '🌺', 'Flower necklace', 'שרשרת פרחים', { kind: 'lei' });
  I('jw_hoops', c, 'ears', 'f', 90, 3, '⭕', 'Hoop earrings', 'עגילי חישוק', { kind: 'hoops', color: '#FCC419' });
  I('jw_heart', c, 'neck', 'f', 120, 3, '💖', 'Heart necklace', 'שרשרת לב', { kind: 'heart', color: '#F03E3E' });
  I('jw_watch', c, 'wrist', null, 120, 3, '⌚', 'Wristwatch', 'שעון יד', { kind: 'watch', color: '#1E66F5' });
  I('jw_star_ears', c, 'ears', 'f', 110, 3, '⭐', 'Star earrings', 'עגילי כוכבים', { kind: 'stars', color: '#FCC419' });
  I('jw_heart_ears', c, 'ears', 'f', 110, 3, '💕', 'Heart earrings', 'עגילי לבבות', { kind: 'hearts', color: '#F06595' });
  I('jw_sport_watch', c, 'wrist', 'm', 140, 4, '⌚', 'Sports watch', 'שעון ספורט', { kind: 'watch', color: '#40C057' });
  I('jw_pearls', c, 'neck', 'f', 150, 4, '🦪', 'Pearl necklace', 'שרשרת פנינים', { kind: 'pearls' });
  I('jw_chain', c, 'neck', 'm', 200, 5, '⛓️', 'Gold chain', 'שרשרת זהב', { kind: 'chain' });
  I('jw_medal', c, 'neck', null, 250, 6, '🏅', 'Gold medal', 'מדליית זהב', { kind: 'medal', color: '#1E66F5' });
  I('jw_diamonds', c, 'ears', 'f', 600, 9, '💎', 'Diamond earrings', 'עגילי יהלום', { kind: 'diamonds' });

  /* ---------------------------------------------------------------- toys (held in the hand) */
  c = 'toys';
  [['toy_balloon', null, 20, 1, '🎈', 'Balloon', 'בלון'], ['toy_lollipop', null, 25, 1, '🍭', 'Lollipop', 'סוכרייה על מקל'], ['toy_icecream', null, 30, 1, '🍦', 'Ice cream', 'גלידה'],
    ['toy_yoyo', null, 30, 1, '🪀', 'Yo-yo', 'יו־יו'], ['toy_puzzle', null, 40, 1, '🧩', 'Puzzle piece', 'חלק של פאזל'], ['toy_soccer', null, 40, 1, '⚽', 'Soccer ball', 'כדורגל'],
    ['toy_basket', null, 45, 1, '🏀', 'Basketball', 'כדורסל'], ['toy_teddy', null, 50, 1, '🧸', 'Teddy bear', 'דובי'], ['toy_palette', null, 60, 2, '🎨', 'Paint palette', 'פלטת צבעים'],
    ['toy_maracas', null, 60, 2, '🪇', 'Maracas', 'מרקס'], ['toy_car', 'm', 60, 2, '🚗', 'Toy car', 'מכונית צעצוע'], ['toy_kite', null, 70, 2, '🪁', 'Kite', 'עפיפון'],
    ['toy_pingpong', null, 70, 2, '🏓', 'Ping-pong paddle', 'מחבט פינג־פונג'], ['toy_doll', 'f', 90, 2, '🪆', 'Nesting doll', 'בובת מטריושקה'], ['toy_bunny', 'f', 90, 2, '🐰', 'Bunny plush', 'בובת ארנב'],
    ['toy_rocket', null, 90, 3, '🚀', 'Toy rocket', 'טיל צעצוע'], ['toy_dino', 'm', 100, 3, '🦖', 'Toy dinosaur', 'דינוזאור צעצוע'], ['toy_mic', null, 120, 3, '🎤', 'Microphone', 'מיקרופון'],
    ['toy_robot', 'm', 120, 3, '🤖', 'Robot', 'רובוט'], ['toy_unicorn', 'f', 140, 4, '🦄', 'Unicorn plush', 'בובת חד־קרן'], ['toy_wand', 'f', 150, 4, '🪄', 'Magic wand', 'שרביט קסמים'],
    ['toy_skates', 'f', 150, 4, '🛼', 'Roller skate', 'רולר'], ['toy_gamepad', 'm', 150, 4, '🎮', 'Game controller', 'שלט משחקים'], ['toy_skateboard', 'm', 180, 4, '🛹', 'Skateboard', 'סקייטבורד'],
    ['toy_drum', null, 150, 5, '🥁', 'Drum', 'תוף'], ['toy_guitar', null, 200, 5, '🎸', 'Guitar', 'גיטרה'], ['toy_telescope', null, 250, 6, '🔭', 'Telescope', 'טלסקופ'],
    ['toy_crystal', null, 350, 7, '🔮', 'Crystal ball', 'כדור בדולח'], ['toy_diamond', null, 900, 12, '💎', 'Giant diamond', 'יהלום ענק'], ['toy_trophy', null, 1500, 14, '🏆', 'Champion trophy', 'גביע אלופים']
  ].forEach(function (x) { I(x[0], c, 'toy', x[1], x[2], x[3], x[4], x[5], x[6]); });

  /* ---------------------------------------------------------------- pets (ids from earlier versions kept) */
  c = 'pets';
  [['pet_ladybug', 30, 1, '🐞', 'Ladybug', 'פרת משה רבנו'], ['pet_chick', 40, 1, '🐣', 'Chick', 'אפרוח'], ['pet_fish', 45, 1, '🐠', 'Goldfish', 'דג זהב'], ['pet_butterfly', 50, 1, '🦋', 'Butterfly', 'פרפר'],
    ['pet_turtle', 70, 1, '🐢', 'Turtle', 'צב'], ['pet_hamster', 80, 1, '🐹', 'Hamster', 'אוגר'], ['pet_bunny', 85, 1, '🐰', 'Bunny', 'ארנבון'], ['pet_frog', 60, 2, '🐸', 'Frog', 'צפרדע'],
    ['pet_puppy', 90, 2, '🐶', 'Puppy', 'גור כלבים'], ['pet_kitten', 90, 2, '🐱', 'Kitten', 'חתלתול'], ['pet_squirrel', 90, 2, '🐿️', 'Squirrel', 'סנאי'], ['pet_parrot', 110, 3, '🦜', 'Parrot', 'תוכי'],
    ['pet_hedgehog', 110, 3, '🦔', 'Hedgehog', 'קיפוד'], ['pet_fox', 130, 3, '🦊', 'Fox', 'שועל'], ['pet_penguin', 140, 4, '🐧', 'Penguin', 'פינגווין'], ['pet_panda', 160, 4, '🐼', 'Panda', 'פנדה'],
    ['pet_koala', 170, 5, '🐨', 'Koala', 'קואלה'], ['pet_owl', 190, 5, '🦉', 'Owl', 'ינשוף'], ['pet_flamingo', 200, 5, '🦩', 'Flamingo', 'פלמינגו'], ['pet_unicorn', 200, 6, '🦄', 'Unicorn', 'חד־קרן'],
    ['pet_giraffe', 260, 6, '🦒', 'Giraffe', 'ג׳ירפה'], ['pet_dragon', 260, 8, '🐉', 'Dragon', 'דרקון'], ['pet_tiger', 300, 7, '🐯', 'Tiger', 'נמר'], ['pet_shark', 300, 7, '🦈', 'Shark', 'כריש'],
    ['pet_elephant', 320, 7, '🐘', 'Elephant', 'פיל'], ['pet_lion', 350, 8, '🦁', 'Lion', 'אריה'], ['pet_peacock', 420, 9, '🦚', 'Peacock', 'טווס'], ['pet_whale', 480, 10, '🐳', 'Whale', 'לווייתן'],
    ['pet_dino', 500, 9, '🦕', 'Long-neck dinosaur', 'דינוזאור ארך־צוואר'], ['pet_royal_dragon', 1000, 12, '🐲', 'Royal dragon', 'דרקון מלכותי']
  ].forEach(function (x) { I(x[0], c, 'pet', null, x[1], x[2], x[3], x[4], x[5]); });

  /* ---------------------------------------------------------------- my room: picture backgrounds and frames */
  c = 'room';
  [['bg_sunset', 40, 1, '🌅', 'Sunset', 'שקיעה', 'linear-gradient(135deg,#FFB199,#FF7EB3)'], ['bg_ocean', 40, 1, '🌊', 'Ocean', 'אוקיינוס', 'linear-gradient(135deg,#7FD6FF,#3B82F6)'],
    ['bg_beach', 60, 1, '🏖️', 'Beach', 'חוף ים', 'linear-gradient(180deg,#8FD3FF 55%,#FFE29A 55%)'], ['bg_forest', 60, 2, '🌲', 'Forest', 'יער', 'linear-gradient(135deg,#B9F6CA,#43A047)'],
    ['bg_candy', 80, 2, '🍭', 'Candy land', 'ארץ הממתקים', 'linear-gradient(135deg,#FFD1F2,#C9A7FF)'], ['bg_desert', 80, 2, '🌵', 'Desert', 'מדבר', 'linear-gradient(135deg,#FFE0A3,#F59E0B)'],
    ['bg_snow', 100, 3, '⛄', 'Snow', 'שלג', 'linear-gradient(135deg,#F0F9FF,#93C5FD)'], ['bg_blossom', 120, 3, '🌸', 'Cherry blossom', 'פריחת דובדבן', 'radial-gradient(circle at 30% 30%,#FFF0F6,#FCC2D7 60%,#F783AC)'],
    ['bg_galaxy', 120, 4, '🌌', 'Galaxy', 'גלקסיה', 'linear-gradient(135deg,#7B5CFF,#1A1F5C)'], ['bg_rainbow', 150, 4, '🌈', 'Rainbow sky', 'שמי קשת', 'linear-gradient(180deg,#FF8787,#FFD43B,#69DB7C,#74C0FC,#B197FC)'],
    ['bg_stadium', 180, 5, '🏟️', 'Stadium', 'אצטדיון', 'linear-gradient(180deg,#74C0FC 40%,#51CF66 40%)'], ['bg_volcano', 220, 6, '🌋', 'Volcano', 'הר געש', 'linear-gradient(135deg,#FDBA74,#B91C1C)'],
    ['bg_space', 250, 6, '🚀', 'Outer space', 'החלל החיצון', 'radial-gradient(circle at 70% 30%,#4C6EF5,#1A1B4B 55%,#0B0B24)'], ['bg_aurora', 350, 8, '🌠', 'Northern lights', 'זוהר צפוני', 'linear-gradient(135deg,#22D3EE,#7C3AED,#DB2777)'],
    ['bg_gold', 700, 11, '🏰', 'Golden palace', 'ארמון הזהב', 'linear-gradient(135deg,#FEF3C7,#F59E0B,#B45309)']
  ].forEach(function (x) { I(x[0], c, 'bg', null, x[1], x[2], x[3], x[4], x[5], null, { css: x[6] }); });
  [['fr_gold', 100, 3, '🥇', 'Gold frame', 'מסגרת זהב', 'frame-gold'], ['fr_flower', 120, 3, '🌼', 'Flower frame', 'מסגרת פרחים', 'frame-flower'], ['fr_rainbow', 150, 5, '🌈', 'Rainbow frame', 'מסגרת קשת', 'frame-rainbow'],
    ['fr_star', 180, 7, '✨', 'Star frame', 'מסגרת כוכבים', 'frame-star'], ['fr_fire', 250, 6, '🔥', 'Fire frame', 'מסגרת אש', 'frame-fire'], ['fr_ice', 250, 6, '🧊', 'Ice frame', 'מסגרת קרח', 'frame-ice'],
    ['fr_diamond', 600, 10, '💠', 'Diamond frame', 'מסגרת יהלום', 'frame-diamond'], ['fr_galaxy', 1200, 13, '🪐', 'Galaxy frame', 'מסגרת גלקטית', 'frame-galaxy']
  ].forEach(function (x) { I(x[0], c, 'frame', null, x[1], x[2], x[3], x[4], x[5], null, { cls: x[6] }); });
})(window.MA = window.MA || {});
