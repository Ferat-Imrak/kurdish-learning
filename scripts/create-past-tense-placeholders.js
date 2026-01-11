const fs = require('fs');
const path = require('path');

const GRAMMAR_DIR = path.join(__dirname, '../mobile/assets/audio/grammar');
const FRONTEND_DIR = path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3/grammar');

function getAudioFilename(text) {
  return text
    .toLowerCase()
    .replace(/[îÎ]/g, 'i')
    .replace(/[êÊ]/g, 'e')
    .replace(/[ûÛ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const commonVerbs = [
  { past: "xwar" },
  { past: "çû" },
  { past: "kir" },
  { past: "xwend" },
  { past: "hat" },
  { past: "dît" },
  { past: "bihîst" },
  { past: "axaft" }
];

const pronouns = ["Min", "Te", "Wî", "Wê", "Me", "We", "Wan"];

// Mapping: for missing files, use a similar existing file as placeholder
const placeholderMap = {
  // For xwar - use min-xwar as base
  'te-xwar': 'min-xwar',
  'wi-xwar': 'min-xwar',
  'we-xwar': 'min-xwar',
  'me-xwar': 'min-xwar',
  'wan-xwar': 'min-xwar',
  
  // For çû - use min-cu-bazare (we'll trim/use it) or wi-cu-male
  'min-cu': 'wi-cu-male',
  'te-cu': 'wi-cu-male',
  'wi-cu': 'wi-cu-male',
  'we-cu': 'wi-cu-male',
  'me-cu': 'wi-cu-male',
  'wan-cu': 'wi-cu-male',
  
  // For kir - use me-kir as base
  'min-kir': 'me-kir',
  'te-kir': 'me-kir',
  'wi-kir': 'me-kir',
  'we-kir': 'me-kir',
  'wan-kir': 'me-kir',
  
  // For xwend - use te-pirtuk-xwend (contains xwend)
  'min-xwend': 'te-pirtuk-xwend',
  'te-xwend': 'te-pirtuk-xwend',
  'wi-xwend': 'te-pirtuk-xwend',
  'we-xwend': 'te-pirtuk-xwend',
  'me-xwend': 'te-pirtuk-xwend',
  'wan-xwend': 'te-pirtuk-xwend',
  
  // For hat - use wan-hat as base
  'min-hat': 'wan-hat',
  'te-hat': 'wan-hat',
  'wi-hat': 'wan-hat',
  'we-hat': 'wan-hat',
  'me-hat': 'wan-hat',
  
  // For dît - use min-dit as base
  'te-dit': 'min-dit',
  'wi-dit': 'min-dit',
  'we-dit': 'min-dit',
  'me-dit': 'min-dit',
  'wan-dit': 'min-dit',
  
  // For bihîst - use te-bihist as base
  'min-bihist': 'te-bihist',
  'wi-bihist': 'te-bihist',
  'we-bihist': 'te-bihist',
  'me-bihist': 'te-bihist',
  'wan-bihist': 'te-bihist',
  
  // For axaft - use wi-axaft as base
  'min-axaft': 'wi-axaft',
  'te-axaft': 'wi-axaft',
  'we-axaft': 'wi-axaft',
  'me-axaft': 'wi-axaft',
  'wan-axaft': 'wi-axaft',
};

function fileExists(filepath) {
  return fs.existsSync(filepath);
}

function createPlaceholders() {
  let created = 0;
  let skipped = 0;
  let missing = 0;

  console.log('Creating placeholder audio files...\n');

  for (const verb of commonVerbs) {
    for (const pronoun of pronouns) {
      const text = `${pronoun} ${verb.past}`;
      const filename = `${getAudioFilename(text)}.mp3`;
      
      const grammarPath = path.join(GRAMMAR_DIR, filename);
      const frontendPath = path.join(FRONTEND_DIR, filename);

      // Skip if already exists
      if (fileExists(grammarPath) && fileExists(frontendPath)) {
        skipped++;
        continue;
      }

      // Find placeholder
      const placeholderName = placeholderMap[filename.replace('.mp3', '')];
      
      if (!placeholderName) {
        console.warn(`⚠️  No placeholder for: ${filename}`);
        missing++;
        continue;
      }

      const placeholderGrammarPath = path.join(GRAMMAR_DIR, `${placeholderName}.mp3`);
      const placeholderFrontendPath = path.join(FRONTEND_DIR, `${placeholderName}.mp3`);

      if (!fileExists(placeholderGrammarPath) || !fileExists(placeholderFrontendPath)) {
        console.warn(`⚠️  Placeholder file not found: ${placeholderName}.mp3`);
        missing++;
        continue;
      }

      // Copy placeholder to new filename
      try {
        if (!fileExists(grammarPath)) {
          fs.copyFileSync(placeholderGrammarPath, grammarPath);
        }
        if (!fileExists(frontendPath)) {
          fs.copyFileSync(placeholderFrontendPath, frontendPath);
        }
        console.log(`✅ Created: ${filename} (from ${placeholderName}.mp3)`);
        created++;
      } catch (error) {
        console.error(`❌ Failed to create ${filename}: ${error.message}`);
        missing++;
      }
    }
  }

  console.log(`\n✅ Complete! Created: ${created}, Skipped: ${skipped}, Missing: ${missing}`);
}

createPlaceholders();

