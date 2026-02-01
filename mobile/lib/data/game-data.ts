/**
 * Shared vocabulary card data for games. Aligned with frontend categories.
 */

export type Card = { english: string; kurdish: string; audio?: string };

export const colorsCards: Card[] = [
  { english: 'Red', kurdish: 'sor' }, { english: 'Green', kurdish: 'kesk' },
  { english: 'Blue', kurdish: 'şîn' }, { english: 'Yellow', kurdish: 'zer' },
  { english: 'Orange', kurdish: 'porteqalî' }, { english: 'Purple', kurdish: 'mor' },
  { english: 'Silver', kurdish: 'zîv' }, { english: 'Black', kurdish: 'reş' },
  { english: 'White', kurdish: 'spî' }, { english: 'Gray', kurdish: 'xwelî' },
  { english: 'Gold', kurdish: 'zêr' },
];

export const animalsCards: Card[] = [
  { english: 'Cat', kurdish: 'pisîk' }, { english: 'Dog', kurdish: 'se' },
  { english: 'Bird', kurdish: 'balinde' }, { english: 'Cow', kurdish: 'çêlek' },
  { english: 'Bull', kurdish: 'ga' }, { english: 'Horse', kurdish: 'hesp' },
  { english: 'Fish', kurdish: 'masî' }, { english: 'Lion', kurdish: 'şêr' },
  { english: 'Goat', kurdish: 'bizin' }, { english: 'Sheep', kurdish: 'pez' },
  { english: 'Elephant', kurdish: 'fîl' }, { english: 'Monkey', kurdish: 'meymûn' },
  { english: 'Wolf', kurdish: 'gur' }, { english: 'Snake', kurdish: 'mar' },
  { english: 'Rabbit', kurdish: 'kevroşk' }, { english: 'Chicken', kurdish: 'mirîşk' },
  { english: 'Rooster', kurdish: 'dîk' }, { english: 'Tiger', kurdish: 'piling' },
  { english: 'Bear', kurdish: 'hirç' }, { english: 'Fox', kurdish: 'rovî' },
  { english: 'Butterfly', kurdish: 'perperok' }, { english: 'Mouse', kurdish: 'mişk' },
  { english: 'Duck', kurdish: 'werdek' }, { english: 'Pig', kurdish: 'beraz' },
  { english: 'Donkey', kurdish: 'ker' }, { english: 'Owl', kurdish: 'kund' },
  { english: 'Turkey', kurdish: 'elok' }, { english: 'Hedgehog', kurdish: 'jûjî' },
  { english: 'Crow', kurdish: 'qel' },
];

export const foodCards: Card[] = [
  { english: 'Apple', kurdish: 'sêv' }, { english: 'Orange', kurdish: 'pirteqal' },
  { english: 'Banana', kurdish: 'mûz' }, { english: 'Mulberry', kurdish: 'tû' },
  { english: 'Pomegranate', kurdish: 'hinar' }, { english: 'Peach', kurdish: 'xox' },
  { english: 'Fig', kurdish: 'hêjîr' }, { english: 'Olive', kurdish: 'zeytûn' },
  { english: 'Grape', kurdish: 'tirî' }, { english: 'Lemon', kurdish: 'leymûn' },
  { english: 'Watermelon', kurdish: 'zebeş' }, { english: 'Peach', kurdish: 'şeftalî' },
  { english: 'Carrot', kurdish: 'gizêr' }, { english: 'Potato', kurdish: 'kartol' },
  { english: 'Onion', kurdish: 'pîvaz' }, { english: 'Garlic', kurdish: 'sîr' },
  { english: 'Tomato', kurdish: 'bacansor' }, { english: 'Cucumber', kurdish: 'xiyar' },
  { english: 'Cabbage', kurdish: 'kelem' }, { english: 'Spinach', kurdish: 'îspenax' },
  { english: 'Eggplant', kurdish: 'bacanreş' }, { english: 'Pepper', kurdish: 'îsot' },
  { english: 'Mushroom', kurdish: 'kivark' }, { english: 'Corn', kurdish: 'garis' },
  { english: 'Fish', kurdish: 'masî' }, { english: 'Egg', kurdish: 'hêk' },
  { english: 'Meat', kurdish: 'goşt' }, { english: 'Chicken', kurdish: 'mirîşk' },
  { english: 'Lamb', kurdish: 'berx' }, { english: 'Beans', kurdish: 'nok' },
  { english: 'Lentils', kurdish: 'nîsk' }, { english: 'Turkey', kurdish: 'elok' },
  { english: 'Pistachios', kurdish: 'fistîq' }, { english: 'Almonds', kurdish: 'behîv' },
  { english: 'Milk', kurdish: 'şîr' }, { english: 'Yogurt', kurdish: 'mast' },
  { english: 'Cheese', kurdish: 'penîr' }, { english: 'Butter', kurdish: 'rûn' },
  { english: 'Cream', kurdish: 'qeymax' }, { english: 'Yogurt drink', kurdish: 'dew' },
  { english: 'Bread', kurdish: 'nan' }, { english: 'Rice', kurdish: 'birinc' },
  { english: 'Wheat', kurdish: 'genim' }, { english: 'Barley', kurdish: 'ceh' },
  { english: 'Bulgur', kurdish: 'bulgur' }, { english: 'Pasta', kurdish: 'makarna' },
  { english: 'Cake', kurdish: 'kek' }, { english: 'Cookie', kurdish: 'kurabiye' },
  { english: 'Coffee', kurdish: 'qehwe' }, { english: 'Tea', kurdish: 'çay' },
  { english: 'Water', kurdish: 'av' }, { english: 'Sherbet', kurdish: 'şerbet' },
  { english: 'Lemonade', kurdish: 'limonata' },
];

export const familyCards: Card[] = [
  { english: 'Family', kurdish: 'malbat' }, { english: 'Mother', kurdish: 'dayik' },
  { english: 'Father', kurdish: 'bav' }, { english: 'Sister', kurdish: 'xwişk' },
  { english: 'Brother', kurdish: 'bira' }, { english: 'Daughter', kurdish: 'keç' },
  { english: 'Son', kurdish: 'kur' }, { english: 'Grandmother', kurdish: 'dapîr' },
  { english: 'Grandfather', kurdish: 'bapîr' }, { english: 'Paternal uncle', kurdish: 'apo' },
  { english: 'Maternal uncle', kurdish: 'xalo' }, { english: 'Paternal aunt', kurdish: 'metê' },
  { english: 'Maternal aunt', kurdish: 'xaltî' }, { english: 'Parents', kurdish: 'dewûbav' },
  { english: 'Baby', kurdish: 'zarok' }, { english: 'Cousin', kurdish: 'pismam' },
  { english: "Uncle's daughter", kurdish: 'dotmam' }, { english: "Uncle's son", kurdish: 'kurap' },
  { english: 'Mother-in-law', kurdish: 'xesû' }, { english: 'Father-in-law', kurdish: 'xezûr' },
  { english: 'Sister-in-law', kurdish: 'jinbira' }, { english: 'Brother-in-law', kurdish: 'tîbira' },
  { english: 'Groom', kurdish: 'zava' }, { english: 'Bride', kurdish: 'bûk' },
];

export const natureCards: Card[] = [
  { english: 'Tree', kurdish: 'dar' }, { english: 'Oak', kurdish: 'berû' },
  { english: 'Pine', kurdish: 'sûs' }, { english: 'Palm', kurdish: 'darê bejî' },
  { english: 'Sycamore', kurdish: 'darê çinar' }, { english: 'Flower', kurdish: 'gul' },
  { english: 'Rose', kurdish: 'gulên sor' }, { english: 'Sunflower', kurdish: 'gulên rojê' },
  { english: 'Lily', kurdish: 'gulên sîrî' }, { english: 'Blossom', kurdish: 'gulên çîçek' },
  { english: 'Mountain', kurdish: 'çiya' }, { english: 'Valley', kurdish: 'newal' },
  { english: 'Forest', kurdish: 'daristan' }, { english: 'Spring', kurdish: 'çavkanî' },
  { english: 'Desert', kurdish: 'çol' }, { english: 'Plain', kurdish: 'deşt' },
  { english: 'River', kurdish: 'çem' }, { english: 'Lake', kurdish: 'gol' },
  { english: 'Sea', kurdish: 'behr' }, { english: 'Rain', kurdish: 'barîn' },
  { english: 'Sun', kurdish: 'roj' }, { english: 'Snow', kurdish: 'berf' },
  { english: 'Wind', kurdish: 'ba' }, { english: 'Cloud', kurdish: 'ewr' },
  { english: 'Storm', kurdish: 'bahoz' }, { english: 'Hail', kurdish: 'zîpik' },
  { english: 'Leaf', kurdish: 'pel' }, { english: 'Root', kurdish: 'kok' },
  { english: 'Grass', kurdish: 'gîha' }, { english: 'Seed', kurdish: 'tohum' },
  { english: 'Moss', kurdish: 'giyayê çavkanî' }, { english: 'Mud', kurdish: 'herrî' },
  { english: 'Land/Soil', kurdish: 'zevî' },
];

export const timeCards: Card[] = [
  { english: 'Morning', kurdish: 'sibê' }, { english: 'Noon', kurdish: 'nîvro' },
  { english: 'Evening', kurdish: 'êvar' }, { english: 'Night', kurdish: 'şev' },
  { english: 'Today', kurdish: 'îro' }, { english: 'Tomorrow', kurdish: 'sibê' },
  { english: 'Yesterday', kurdish: 'duh' }, { english: 'Now', kurdish: 'niha' },
  { english: 'Later', kurdish: 'paşê' }, { english: 'Earlier', kurdish: 'berê' },
  { english: 'Five minutes', kurdish: 'pênc deqe' }, { english: 'Half hour', kurdish: 'nîv saet' },
  { english: 'Around', kurdish: 'nêzîkê' }, { english: 'After', kurdish: 'piştî' },
  { english: 'Before', kurdish: 'berî' },
];

export const weatherCards: Card[] = [
  { english: 'Weather', kurdish: 'hewa' }, { english: 'Sun', kurdish: 'roj' },
  { english: 'Cloud', kurdish: 'ewr' }, { english: 'Rain', kurdish: 'baran' },
  { english: 'Snow', kurdish: 'berf' }, { english: 'Wind', kurdish: 'ba' },
  { english: 'Hot', kurdish: 'germ' }, { english: 'Cold', kurdish: 'sar' },
  { english: 'Very hot', kurdish: 'pir germ' }, { english: 'Very cold', kurdish: 'pir sar' },
  { english: 'Warm', kurdish: 'germik' }, { english: 'Spring', kurdish: 'bihar' },
  { english: 'Summer', kurdish: 'havîn' }, { english: 'Fall', kurdish: 'payiz' },
  { english: 'Winter', kurdish: 'zivistan' },
];

export const houseCards: Card[] = [
  { english: 'House', kurdish: 'mal' }, { english: 'Room', kurdish: 'ode' },
  { english: 'Door', kurdish: 'derî' }, { english: 'Window', kurdish: 'pencere' },
  { english: 'Bed', kurdish: 'nivîn' }, { english: 'Chair', kurdish: 'kursî' },
  { english: 'Sofa', kurdish: 'qenepe' }, { english: 'Lamp', kurdish: 'çira' },
  { english: 'Television', kurdish: 'televîzyon' }, { english: 'Refrigerator', kurdish: 'sarinc' },
  { english: 'Kitchen', kurdish: 'aşxane' }, { english: 'Table', kurdish: 'mase' },
];

export const numbersCards: Card[] = [
  { english: 'One', kurdish: 'yek' }, { english: 'Two', kurdish: 'du' },
  { english: 'Three', kurdish: 'sê' }, { english: 'Four', kurdish: 'çar' },
  { english: 'Five', kurdish: 'pênc' }, { english: 'Six', kurdish: 'şeş' },
  { english: 'Seven', kurdish: 'heft' }, { english: 'Eight', kurdish: 'heşt' },
  { english: 'Nine', kurdish: 'neh' }, { english: 'Ten', kurdish: 'deh' },
  { english: 'Eleven', kurdish: 'yanzdeh' }, { english: 'Twelve', kurdish: 'danzdeh' },
  { english: 'Thirteen', kurdish: 'sêzdeh' }, { english: 'Fourteen', kurdish: 'çardeh' },
  { english: 'Fifteen', kurdish: 'pênzdeh' }, { english: 'Sixteen', kurdish: 'şanzdeh' },
  { english: 'Seventeen', kurdish: 'hevdeh' }, { english: 'Eighteen', kurdish: 'hejdeh' },
  { english: 'Nineteen', kurdish: 'nozdeh' }, { english: 'Twenty', kurdish: 'bîst' },
];

export const daysMonthsCards: Card[] = [
  { english: 'Monday', kurdish: 'duşem' }, { english: 'Tuesday', kurdish: 'sêşem' },
  { english: 'Wednesday', kurdish: 'çarşem' }, { english: 'Thursday', kurdish: 'pêncşem' },
  { english: 'Friday', kurdish: 'în' }, { english: 'Saturday', kurdish: 'şemî' },
  { english: 'Sunday', kurdish: 'yekşem' }, { english: 'January', kurdish: 'çile' },
  { english: 'February', kurdish: 'sibat' }, { english: 'March', kurdish: 'adar' },
  { english: 'April', kurdish: 'nîsan' }, { english: 'May', kurdish: 'gulan' },
  { english: 'June', kurdish: 'hezîran' }, { english: 'July', kurdish: 'tîrmeh' },
  { english: 'August', kurdish: 'tebax' }, { english: 'September', kurdish: 'îlon' },
  { english: 'October', kurdish: 'cotmeh' }, { english: 'November', kurdish: 'mijdar' },
  { english: 'December', kurdish: 'kanûn' },
];

export const questionWordsCards: Card[] = [
  { english: 'Who', kurdish: 'kî' }, { english: 'What', kurdish: 'çi' },
  { english: 'Where', kurdish: 'ku' }, { english: 'When', kurdish: 'kengî' },
  { english: 'Why', kurdish: 'çima' }, { english: 'How', kurdish: 'çawa' },
  { english: 'How many/much', kurdish: 'çend' }, { english: 'Which', kurdish: 'kîjan' },
];

export const pronounsCards: Card[] = [
  { english: 'I', kurdish: 'ez' }, { english: 'You (singular)', kurdish: 'tu' },
  { english: 'He/She/It', kurdish: 'ew' }, { english: 'We', kurdish: 'em' },
  { english: 'You (plural/formal)', kurdish: 'hûn' }, { english: 'They', kurdish: 'ew' },
  { english: 'My', kurdish: 'min' }, { english: 'Your (singular)', kurdish: 'te' },
  { english: 'His', kurdish: 'wî' }, { english: 'Her', kurdish: 'wê' },
  { english: 'Our', kurdish: 'me' }, { english: 'Your (plural/formal)', kurdish: 'we' },
  { english: 'Their', kurdish: 'wan' },
];

export const bodyPartsCards: Card[] = [
  { english: 'Head', kurdish: 'ser' }, { english: 'Eye', kurdish: 'çav' },
  { english: 'Ear', kurdish: 'guh' }, { english: 'Nose', kurdish: 'poz' },
  { english: 'Mouth', kurdish: 'dev' }, { english: 'Tooth', kurdish: 'didan' },
  { english: 'Tongue', kurdish: 'ziman' }, { english: 'Neck', kurdish: 'stû' },
  { english: 'Shoulder', kurdish: 'mil' }, { english: 'Hand', kurdish: 'dest' },
  { english: 'Finger', kurdish: 'tili' }, { english: 'Chest', kurdish: 'sîng' },
  { english: 'Stomach', kurdish: 'zik' }, { english: 'Back', kurdish: 'pişt' },
  { english: 'Leg', kurdish: 'ling' }, { english: 'Foot', kurdish: 'pê' },
  { english: 'Ankle', kurdish: 'pêçî' }, { english: 'Knee', kurdish: 'çok' },
  { english: 'Eyebrow', kurdish: 'birû' }, { english: 'Eyelash', kurdish: 'mijang' },
  { english: 'Fingernail', kurdish: 'neynok' }, { english: 'Wrist', kurdish: 'zendik' },
  { english: 'Elbow', kurdish: 'enîşk' },
];

export const allCards: Card[] = [
  ...colorsCards, ...animalsCards, ...foodCards, ...familyCards,
  ...natureCards, ...timeCards, ...weatherCards, ...houseCards,
  ...numbersCards, ...daysMonthsCards, ...questionWordsCards, ...pronounsCards,
  ...bodyPartsCards,
];

/** Matching / Word Builder category ids (14 + master) */
export const MATCHING_CATEGORY_IDS = [
  'colors', 'animals', 'food', 'family', 'nature', 'time', 'weather',
  'house', 'numbers', 'daysMonths', 'questions', 'pronouns', 'bodyParts',
] as const;

/** Memory Cards: frontend has 9 decks (no family, time, daysMonths, questions, pronouns) */
export const MEMORY_CARD_CATEGORY_IDS = [
  'colors', 'animals', 'food', 'nature', 'weather', 'house', 'numbers', 'bodyParts',
] as const;

export const cardsByCategoryId: Record<string, Card[]> = {
  colors: colorsCards,
  animals: animalsCards,
  food: foodCards,
  family: familyCards,
  nature: natureCards,
  time: timeCards,
  weather: weatherCards,
  house: houseCards,
  numbers: numbersCards,
  daysMonths: daysMonthsCards,
  questions: questionWordsCards,
  pronouns: pronounsCards,
  bodyParts: bodyPartsCards,
};

/** Display names for Picture Quiz / Sentence Builder (match frontend) */
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  colors: 'Colors',
  animals: 'Animals',
  food: 'Food & Meals',
  family: 'Family Members',
  nature: 'Nature',
  time: 'Time & Schedule',
  weather: 'Weather & Seasons',
  house: 'House & Objects',
  numbers: 'Numbers',
  daysMonths: 'Days & Months',
  questions: 'Basic Question Words',
  pronouns: 'Pronouns',
  bodyParts: 'Body Parts',
  master: 'Master Challenge',
};

export const CATEGORY_ICONS: Record<string, string> = {
  colors: '🎨',
  animals: '🐾',
  food: '🍽️',
  family: '👨‍👩‍👧‍👦',
  nature: '🌿',
  time: '⏰',
  weather: '🌤️',
  house: '🏠',
  numbers: '🔢',
  daysMonths: '📅',
  questions: '❓',
  pronouns: '👥',
  bodyParts: '👤',
  master: '🏆',
};
