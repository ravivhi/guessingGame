/* Activity catalog seed: 30 flagship games + one practice activity per skill (built at seed time),
   Math Detective cases and the example "Multiplication World" / "Fraction World" sequences. */
(function (MA) {
  'use strict';
  function A(id, skillId, icon, en, he, descEn, descHe, o) {
    o = o || {};
    return {
      id: id, skillId: skillId, icon: icon, title: { en: en, he: he }, desc: { en: descEn, he: descHe }, flagship: true, gameType: o.gameType || 'game',
      prefer: o.prefer || null, difficulty: o.difficulty || 1, questions: o.questions || 8, duration: o.duration || 6, status: 'published',
      instructions: o.instructions || { en: descEn, he: descHe }, reward: { xp: o.xp || 30, coins: o.coins || 8 }, completion: { minQuestions: o.questions || 8 },
      mastery: { accuracy: .8 }, source: 'generator', sequence: o.sequence || null, story: o.story || null, timed: o.timed || 0, minLevel: o.minLevel || 1
    };
  }
  MA.ACTIVITY_SEED = [
    A('fl-count', 'g1-num-count20', '🐞', 'Count the Critters', 'סופרים חברים', 'Tap each critter as you count it, then say how many.', 'געו בכל חבר בזמן הספירה, ואז אמרו כמה יש.'),
    A('fl-train', 'g1-num-seqs', '🚂', 'Number Train', 'רכבת המספרים', 'Fill the missing wagons on the number train.', 'השלימו את הקרונות החסרים ברכבת המספרים.'),
    A('fl-gator', 'g1-num-compare', '🐊', 'Hungry Alligator', 'התנין הרעב', 'The alligator always eats the bigger number. Pick the sign!', 'התנין תמיד אוכל את המספר הגדול. בחרו את הסימן!'),
    A('fl-basket', 'g1-add-addobj', '🧺', 'Apple Basket', 'סל התפוחים', 'Put two groups together and count them all.', 'מצרפים שתי קבוצות וסופרים את הכול.'),
    A('fl-frog', 'g1-add-addline', '🐸', 'Frog Jumps', 'קפיצות הצפרדע', 'Help the frog hop along the number line to add.', 'עזרו לצפרדע לקפוץ על ישר המספרים כדי לחבר.', { prefer: 'numberline' }),
    A('fl-balloon', 'g1-sub-subobj', '🎈', 'Balloon Pop', 'פיצוץ בלונים', 'Some balloons pop. How many are left?', 'כמה בלונים התפוצצו. כמה נשארו?'),
    A('fl-mystery', 'g1-add-addmiss', '❓', 'Mystery Number', 'המספר המסתורי', 'Find the hidden number that makes the equation true.', 'מצאו את המספר החבוי שמשלים את התרגיל.'),
    A('fl-blocks', 'g2-num-hto', '🧱', 'Block Builder', 'בוני הקוביות', 'Build numbers with hundreds, tens and ones blocks.', 'בונים מספרים מקוביות של מאות, עשרות ויחידות.', { difficulty: 2 }),
    A('fl-garden', 'g2-mul-arrays', '🌷', 'Garden Rows', 'שורות בגינה', 'Plant flowers in rows to build multiplication arrays.', 'שותלים פרחים בשורות ובונים מערכי כפל.', { difficulty: 2 }),
    A('fl-race', 'g3-mul-t210', '🏁', 'Times Table Race', 'מרוץ לוח הכפל', 'Race through the times tables and memory cards.', 'דוהרים בלוח הכפל ובקלפי זיכרון.', { difficulty: 2, questions: 10 }),
    A('fl-picnic', 'g2-div-share', '🧺', 'Fair Share Picnic', 'פיקניק שווה בשווה', 'Share the snacks fairly between the bags.', 'מחלקים את החטיפים בצורה הוגנת בין השקיות.'),
    A('fl-boxes', 'g2-div-group', '📦', 'Packing Boxes', 'אורזים קופסאות', 'How many full boxes can you pack?', 'כמה קופסאות מלאות אפשר לארוז?'),
    A('fl-pizza', 'g2-frac-shapes', '🍕', 'Pizza Party', 'מסיבת פיצה', 'Color slices of pizza to show fractions.', 'צובעים משולשי פיצה כדי להראות שברים.'),
    A('fl-choco', 'g3-frac-equiv', '🍫', 'Chocolate Bars', 'חטיפי שוקולד', 'Use chocolate bars to find equal fractions.', 'משתמשים בחטיפי שוקולד כדי למצוא שברים שווים.'),
    A('fl-trail', 'g3-frac-line', '🥾', 'Fraction Trail', 'שביל השברים', 'Walk along the number line to each fraction.', 'הולכים על ישר המספרים אל כל שבר.', { prefer: 'numberline' }),
    A('fl-sorter', 'g2-datalogic-sorting', '🔷', 'Shape Sorter', 'ממיין הצורות', 'Sort shapes by color and by shape.', 'ממיינים צורות לפי צבע ולפי צורה.'),
    A('fl-builder', 'g3-geo-area', '📐', 'Shape Builder', 'בונה הצורות', 'Build shapes and rectangles on the grid.', 'בונים צורות ומלבנים על הרשת.', {
      difficulty: 3, questions: 6, sequence: [{ skill: 'g3-geo-area', level: 4 }, { skill: 'g3-geo-area', level: 5 }, { skill: 'g3-geo-symmetry', level: 2 }, { skill: 'g3-geo-perimeter', level: 5 }, { skill: 'g3-geo-area', level: 5 }, { skill: 'g3-geo-symmetry', level: 4 }]
    }),
    A('fl-fence', 'g3-geo-perimeter', '🚧', 'Fence Explorer', 'חוקרי הגדרות', 'Walk around shapes to find their perimeter.', 'מסתובבים סביב צורות כדי למצוא את ההיקף.'),
    A('fl-tiles', 'g3-geo-area', '🟦', 'Tile the Floor', 'מרצפים את הרצפה', 'Count and build areas with square tiles.', 'סופרים ובונים שטחים בעזרת אריחים מרובעים.'),
    A('fl-clock', 'g2-tm-read', '🕰️', 'Clock Tower', 'מגדל השעון', 'Read and set the clock tower to the right time.', 'קוראים ומכוונים את מגדל השעון לשעה הנכונה.'),
    A('fl-shop', 'g2-tm-amounts', '🧸', 'Toy Shop', 'חנות הצעצועים', 'Pay for toys with the exact coins.', 'משלמים על צעצועים במטבעות המדויקים.', { prefer: 'money' }),
    A('fl-ruler', 'g2-meas-cm', '📏', 'Ruler Rally', 'מרוץ הסרגל', 'Measure objects with a ruler.', 'מודדים חפצים בעזרת סרגל.'),
    A('fl-survey', 'g2-datalogic-bar', '🛰️', 'Space Survey', 'סקר החלל', 'Read the space station\'s graphs and answer questions.', 'קוראים את הדיאגרמות של תחנת החלל ועונים על שאלות.'),
    A('fl-riddles', 'g3-logic-deduce', '🧩', 'Cave Riddles', 'חידות המערה', 'Use clues to crack the mystery numbers.', 'משתמשים ברמזים כדי לפצח את המספרים הסודיים.', { minLevel: 3 }),
    A('fl-patterns', 'g2-datalogic-seq', '🔮', 'Pattern Crystals', 'קריסטלי התבניות', 'Find the rule and complete the crystal patterns.', 'מוצאים את החוק ומשלימים את תבניות הקריסטלים.'),
    A('fl-mulworld', 'g2-mul-groups', '🎒', 'Explorers\' Apple Bags', 'שקי התפוחים של החוקרים', 'Help the explorers fill bags with apples, then turn the groups into multiplication.', 'עזרו לחוקרים למלא שקים בתפוחים, והפכו את הקבוצות לתרגילי כפל.', {
      questions: 6, sequence: [
        { skill: 'g2-mul-groups', level: 1 }, { skill: 'g2-mul-groups', level: 2 }, { skill: 'g2-mul-repadd', level: 1 }, { skill: 'g2-mul-repadd', level: 3 }, { skill: 'g2-mul-arrays', level: 3 }, { skill: 'g2-mul-repadd', level: 4 }]
    }),
    A('fl-fracworld', 'g2-frac-half', '👩‍🍳', 'Pizza Chef', 'השף של הפיצות', 'Cut pizzas into equal parts, pick halves and quarters, then compare and combine fractions.', 'חותכים פיצות לחלקים שווים, בוחרים חצאים ורבעים, ואז משווים ומחברים שברים.', {
      questions: 6, sequence: [
        { skill: 'g2-frac-equalparts', level: 1 }, { skill: 'g2-frac-half', level: 5 }, { skill: 'g2-frac-half', level: 3 }, { skill: 'g2-frac-quarter', level: 3 }, { skill: 'g3-frac-compare', level: 1 }, { skill: 'g3-frac-add', level: 1 }]
    }),
    A('fl-lightning', 'g3-mul-t210', '⚡', 'Lightning Round', 'סבב הברק', 'Optional speed challenge: how many facts can you solve in 60 seconds?', 'אתגר מהירות לבחירה: כמה תרגילים תפתרו ב־60 שניות?', { gameType: 'timed', timed: 60, questions: 30, minLevel: 2 }),
    A('fl-det1', 'g1-add-addword', '🕵️', 'Math Detective: The Missing Cookies', 'הבלש המתמטי: העוגיות הנעלמות', 'Solve clues to find out who took the cookies from the bakery.', 'פתרו רמזים כדי לגלות מי לקח את העוגיות מהמאפייה.', { gameType: 'detective', story: 'cookies', questions: 5, minLevel: 1 }),
    A('fl-det2', 'g1-geo-shapeid', '🕵️', 'Math Detective: The Lost Crown', 'הבלש המתמטי: הכתר האבוד', 'Follow the clues across Geometry City to find the lost crown.', 'עקבו אחרי הרמזים ברחבי עיר הצורות כדי למצוא את הכתר האבוד.', { gameType: 'detective', story: 'crown', questions: 5, minLevel: 4 }),
    A('fl-det3', 'g1-time-clock', '🕵️', 'Math Detective: The Midnight Train', 'הבלש המתמטי: רכבת חצות', 'Who switched the train tickets? Crack the code before midnight.', 'מי החליף את כרטיסי הרכבת? פצחו את הקוד לפני חצות.', { gameType: 'detective', story: 'train', questions: 5, minLevel: 6 })
  ];

  /* one generated practice activity per skill */
  MA.practiceActivity = function (skill) {
    return {
      id: 'pr-' + skill.id, skillId: skill.id, icon: null, flagship: false, gameType: 'practice',
      title: { en: skill.name.en, he: skill.name.he }, desc: { en: skill.objective.en, he: skill.objective.he }, instructions: { en: skill.objective.en, he: skill.objective.he },
      prefer: null, difficulty: 1, questions: 8, duration: 5, status: 'published', reward: { xp: 25, coins: 6 }, completion: { minQuestions: 8 }, mastery: { accuracy: .8 }, source: 'mixed', sequence: null, story: null, timed: 0, minLevel: 1
    };
  };

  /* Math Detective: story frames; each clue picks a skill from the student's grade by domain */
  MA.DETECTIVE = {
    cookies: {
      char: '🕵️', title: { en: 'The Missing Cookies', he: 'העוגיות הנעלמות' }, culprit: '🦝',
      intro: { en: 'Oh no! All the cookies vanished from the Number Forest bakery. Detective, help me find out what happened!', he: 'אוי לא! כל העוגיות נעלמו מהמאפייה ביער המספרים. בלשים, עזרו לי לגלות מה קרה!' },
      steps: [
        { pick: ['add', 'addsub'], en: 'Clue 1: We found two piles of crumbs. How many crumbs are there in all?', he: 'רמז 1: מצאנו שתי ערימות פירורים. כמה פירורים יש בסך הכול?' },
        { pick: ['num'], en: 'Clue 2: Strange footprints form a number pattern on the floor.', he: 'רמז 2: עקבות מוזרים יוצרים תבנית מספרים על הרצפה.' },
        { pick: ['sub', 'addsub'], en: 'Clue 3: The cookie jar is missing some cookies. Work out how many.', he: 'רמז 3: בצנצנת חסרות עוגיות. חשבו כמה.' },
        { pick: ['time', 'tm', 'meas'], en: 'Clue 4: The bakery clock stopped when the thief ran by. Read the clue!', he: 'רמז 4: השעון במאפייה נעצר כשהגנב רץ ליד. קראו את הרמז!' },
        { pick: ['data', 'datalogic', 'logic', 'geo'], en: 'Clue 5: The last clue will unlock the secret door.', he: 'רמז 5: הרמז האחרון יפתח את הדלת הסודית.' }
      ],
      outro: { en: 'Mystery solved! Rocky the raccoon took the cookies to bake a surprise party for the whole forest. Everyone is invited! 🎉', he: 'התעלומה נפתרה! רוקי הדביבון לקח את העוגיות כדי להכין מסיבת הפתעה לכל היער. כולם מוזמנים! 🎉' }
    },
    crown: {
      char: '🕵️', title: { en: 'The Lost Crown', he: 'הכתר האבוד' }, culprit: '🦜',
      intro: { en: 'The Queen of Geometry City lost her shiny crown! Follow the clues around the city.', he: 'מלכת עיר הצורות איבדה את הכתר הנוצץ שלה! עקבו אחרי הרמזים ברחבי העיר.' },
      steps: [
        { pick: ['geo'], en: 'Clue 1: A shape was drawn on the palace door.', he: 'רמז 1: על דלת הארמון צוירה צורה.' },
        { pick: ['mul', 'add'], en: 'Clue 2: The guards counted tiles in the hallway.', he: 'רמז 2: השומרים ספרו אריחים במסדרון.' },
        { pick: ['meas', 'tm', 'time'], en: 'Clue 3: Someone measured the tower window. Check the measurement.', he: 'רמז 3: מישהו מדד את חלון המגדל. בדקו את המדידה.' },
        { pick: ['frac', 'num'], en: 'Clue 4: A torn map shows only part of the city.', he: 'רמז 4: מפה קרועה מראה רק חלק מהעיר.' },
        { pick: ['logic', 'data', 'datalogic', 'geo'], en: 'Clue 5: Crack the final puzzle to open the treasure chest.', he: 'רמז 5: פצחו את החידה האחרונה כדי לפתוח את תיבת האוצר.' }
      ],
      outro: { en: 'Found it! Polly the parrot borrowed the crown because it was so shiny. She gave it back with a big apology. 👑', he: 'מצאנו! פולי התוכי שאלה את הכתר כי הוא נוצץ כל כך. היא החזירה אותו עם התנצלות גדולה. 👑' }
    },
    train: {
      char: '🕵️', title: { en: 'The Midnight Train', he: 'רכבת חצות' }, culprit: '🦉',
      intro: { en: 'Someone mixed up all the tickets on the Midnight Train! Solve the clues before the train leaves.', he: 'מישהו ערבב את כל הכרטיסים ברכבת חצות! פתרו את הרמזים לפני שהרכבת יוצאת.' },
      steps: [
        { pick: ['time', 'tm'], en: 'Clue 1: Check the station clock.', he: 'רמז 1: בדקו את השעון בתחנה.' },
        { pick: ['div', 'mul'], en: 'Clue 2: The passengers must be split evenly between the wagons.', he: 'רמז 2: צריך לחלק את הנוסעים שווה בשווה בין הקרונות.' },
        { pick: ['num', 'addsub', 'add'], en: 'Clue 3: The ticket numbers follow a secret rule.', he: 'רמז 3: מספרי הכרטיסים מצייתים לחוק סודי.' },
        { pick: ['data', 'datalogic'], en: 'Clue 4: The conductor kept a record of the tickets.', he: 'רמז 4: הכרטיסן רשם את הכרטיסים בטבלה.' },
        { pick: ['logic', 'frac', 'geo'], en: 'Clue 5: The final code opens the ticket box.', he: 'רמז 5: הקוד האחרון פותח את תיבת הכרטיסים.' }
      ],
      outro: { en: 'Case closed! Oliver the owl was sorting tickets by number to help - he just got the order mixed up. Next stop: fun! 🚂', he: 'התיק נסגר! אוליבר הינשוף מיין את הכרטיסים לפי מספר כדי לעזור - הוא רק התבלבל בסדר. התחנה הבאה: כיף! 🚂' }
    }
  };
})(window.MA = window.MA || {});
