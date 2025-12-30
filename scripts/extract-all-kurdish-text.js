const fs = require('fs');
const path = require('path');

// This script extracts ALL Kurdish text from the app
// Run this to get a complete list of what needs to be downloaded

const allKurdishText = new Set();

// Add text helper
const add = (text) => {
  if (text && text.trim()) {
    allKurdishText.add(text.trim());
  }
};

// Colors
add('sor'); add('kesk'); add('şîn'); add('zer'); add('mor');
add('reş'); add('spî'); add('xwelî'); add('binefş'); add('gewr');
add('pembe'); add('pirteqalî');

// Animals
add('pisîk'); add('se'); add('hesp'); add('ga'); add('balinde');
add('masî'); add('şêr'); add('bizin'); add('pez'); add('fîl');
add('meymûn'); add('gur'); add('mar'); add('kevok'); add('mirîşk');
add('dîk'); add('piling');

// Food
add('sêv'); add('pirteqal'); add('mûz'); add('tû'); add('hinar');
add('xox'); add('hêjîr'); add('zeytûn'); add('tirî'); add('leymûn');
add('zebeş'); add('gizêr'); add('kartol'); add('pîvaz'); add('sîr');
add('bacansor'); add('xiyar'); add('kelem'); add('kivark'); add('garis');
add('nan'); add('av'); add('şîr'); add('penîr');

// Family
add('bav'); add('dê'); add('kur'); add('keç'); add('bapîr');
add('dapîr'); add('birayê'); add('xwişk'); add('zarok'); add('apo');
add('xalo'); add('metê'); add('xaltî'); add('zava'); add('bûk');
add('duçar'); add('malbat');

// Nature
add('dar'); add('berû'); add('sûs'); add('gul'); add('roj');
add('heyv'); add('stêrk'); add('av'); add('agir'); add('ba');
add('berf'); add('baran');

// Numbers
add('yek'); add('du'); add('sê'); add('çar'); add('pênc');
add('şeş'); add('heft'); add('heşt'); add('neh'); add('deh');
add('yazde'); add('dwazde'); add('sêzde'); add('çarde'); add('pazde');
add('şazde'); add('hevde'); add('hejde'); add('nozde'); add('bîst');

// Days
add('duşem'); add('sêşem'); add('çarşem'); add('pêncşem');
add('în'); add('şemî'); add('yekşem');

// Months
add('rêbendan'); add('reşemî'); add('adar'); add('avrêl');
add('gulan'); add('hezîran'); add('tîrmeh'); add('tebax');
add('îlon'); add('cotmeh'); add('sermawez'); add('berfanbar');

// Greetings
add('silav'); add('spas'); add('ji kerema xwe'); add('beyanî baş');
add('êvar baş'); add('şev baş'); add('bi xatirê te');

// Questions
add('çi'); add('kî'); add('çawa'); add('kengî'); add('li ku'); add('çima');

// Pronouns
add('ez'); add('tu'); add('ew'); add('em'); add('hûn');

// Body Parts
add('serî'); add('çav'); add('guh'); add('dev'); add('difin');
add('dest'); add('ling'); add('pî'); add('tilî');

// Verbs
add('çûn'); add('hatin'); add('xwarin'); add('vexwarin');
add('nivîsîn'); add('xwendin'); add('gotin'); add('bîstin');
add('dîtin'); add('kirin'); add('bûn'); add('zanîn');
add('girtin'); add('dayîn'); add('kirîn');

// Weather
add('hewa'); add('germ'); add('sar'); add('hûr'); add('tarî');
add('baranî'); add('berfî');

// Time
add('seet'); add('deqe'); add('çirke'); add('niha'); add('îro');
add('sibe'); add('duh');

// Grammar Page - Basic Sentences
add('Ez nan dixwim');
add('Ew sêv dixwe');
add('Tu pirtûk dixwînî');
add('Ez çavên te dibînim');
add('Tu dengê min dibihîzî');

// Grammar Page - Nouns & Gender
add('kitêb');
add('Pisîkê spî');
add('Kitêbê sor');
add('pisîkek');
add('kitêbek');
add('malek');
add('mal');

// Grammar Page - Demonstratives
add('ev kitêb');
add('ew pisîk');
add('ev mal');
add('ew av');

// Grammar Page - Pronouns & Possessives
add('min');
add('te');
add('wî');
add('wê');
add('me');
add('we');
add('wan');
add('kitêba min');
add('pisîka te');
add('mala wî');
add('ava me');

// Songs/Phrases Page
add('Hêdî biaxive'); // Speak slowly
add('Ez birçî me'); // I am hungry
add('Ez tî me'); // I am thirsty
add('Alîkariya min bike'); // Help me
add('Ew çi ye?'); // What is that?
add('Ev çend e?'); // How much is this?
add('Ez … salî me'); // I am ... years old
add('Ez li ……… dijîm'); // I live in
add('Tu çawa yî?'); // How are you?
add('Baş im, spas'); // I'm fine, thank you

// Practice Speaking Page - Common Phrases
add('Navê te çi ye?'); // What's your name?
add('Navê min... e'); // My name is...
add('Ez hêz dikim'); // I love

// More common words
add('dixwe'); // eats
add('dixwim'); // eat
add('dixwînî'); // read
add('dibînim'); // see
add('dibihîzî'); // hear
add('dengê min'); // my voice
add('çavên te'); // your eyes

// Convert Set to Array and save
const allWords = Array.from(allKurdishText).sort();

console.log(`\n📊 Total unique Kurdish words/phrases: ${allWords.length}\n`);

// Save to file
const outputPath = path.join(__dirname, 'all-kurdish-words.json');
fs.writeFileSync(outputPath, JSON.stringify(allWords, null, 2));

console.log(`✅ Saved to: ${outputPath}\n`);

// Show what we have vs what we need
const mp3Dir = path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3');
let existingCount = 0;

if (fs.existsSync(mp3Dir)) {
  const existing = fs.readdirSync(mp3Dir).filter(f => f.endsWith('.mp3'));
  existingCount = existing.length;
}

console.log(`📈 Status:`);
console.log(`   Unique words needed: ${allWords.length}`);
console.log(`   Already downloaded: ${existingCount}`);
console.log(`   Still needed: ${allWords.length - existingCount}`);

// Show missing words
console.log(`\n📋 Sample of words to download:\n`);
allWords.slice(0, 20).forEach((word, idx) => {
  console.log(`   ${idx + 1}. ${word}`);
});

if (allWords.length > 20) {
  console.log(`   ... and ${allWords.length - 20} more`);
}

