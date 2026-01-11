const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Configuration
const KURDISH_TTS_API_KEY = process.env.KURDISH_TTS_API_KEY || '6e006ad7e233745f64db03bafd6de3cd805a45e7';

const OUTPUT_DIR = path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3/grammar');
const MOBILE_DIR = path.join(__dirname, '../mobile/assets/audio/grammar');

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(MOBILE_DIR)) {
  fs.mkdirSync(MOBILE_DIR, { recursive: true });
}

// Helper function to sanitize Kurdish text for filename
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

// Common verbs with their past forms
const commonVerbs = [
  { infinitive: "xwarin", en: "to eat", past: "xwar" },
  { infinitive: "çûn", en: "to go", past: "çû" },
  { infinitive: "kirin", en: "to do", past: "kir" },
  { infinitive: "xwendin", en: "to read", past: "xwend" },
  { infinitive: "hatin", en: "to come", past: "hat" },
  { infinitive: "dîtin", en: "to see", past: "dît" },
  { infinitive: "bihîstin", en: "to hear", past: "bihîst" },
  { infinitive: "axaftin", en: "to speak", past: "axaft" }
];

// Pronouns for past tense
const pronouns = [
  { ku: "Min", en: "I" },
  { ku: "Te", en: "You" },
  { ku: "Wî", en: "He" },
  { ku: "Wê", en: "She" },
  { ku: "Me", en: "We" },
  { ku: "We", en: "You (plural)" },
  { ku: "Wan", en: "They" }
];

function getFfmpegPath() {
  try {
    const possiblePaths = [
      '/opt/homebrew/bin/ffmpeg',
      '/usr/local/bin/ffmpeg',
      'ffmpeg'
    ];
    
    for (const ffmpegPath of possiblePaths) {
      try {
        execSync(`"${ffmpegPath}" -version`, { stdio: 'ignore' });
        return ffmpegPath;
      } catch (e) {
        continue;
      }
    }
    
    try {
      const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
      return ffmpegInstaller.path;
    } catch (e) {
      return null;
    }
  } catch (e) {
    return null;
  }
}

function fileExists(filepath) {
  return fs.existsSync(filepath);
}

function generateAudio(text, filename) {
  return new Promise((resolve, reject) => {
    const frontendPath = path.join(OUTPUT_DIR, filename);
    const mobilePath = path.join(MOBILE_DIR, filename);

    // Check if file already exists
    if (fileExists(frontendPath) && fileExists(mobilePath)) {
      console.log(`⏭️  Skipped (already exists): ${filename}`);
      resolve();
      return;
    }

    const data = JSON.stringify({
      text: text,
      voice: 'kurdish-male'
    });

    const options = {
      hostname: 'www.kurdishtts.com',
      path: '/api/tts-proxy',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'x-api-key': KURDISH_TTS_API_KEY
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`API returned status ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      const tempWavPath = path.join(__dirname, 'temp-audio.wav');
      const fileStream = fs.createWriteStream(tempWavPath);

      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        
        const ffmpegPath = getFfmpegPath();
        if (!ffmpegPath) {
          console.warn(`⚠️  ffmpeg not found. Saving as WAV with MP3 extension: ${filename}`);
          if (!fileExists(frontendPath)) {
            fs.copyFileSync(tempWavPath, frontendPath);
          }
          if (!fileExists(mobilePath)) {
            fs.copyFileSync(tempWavPath, mobilePath);
          }
          fs.unlinkSync(tempWavPath);
          resolve();
          return;
        }

        try {
          // Convert to MP3
          execSync(`"${ffmpegPath}" -i "${tempWavPath}" -acodec libmp3lame -ab 128k "${frontendPath}"`, { stdio: 'ignore' });
          
          // Copy to mobile
          fs.copyFileSync(frontendPath, mobilePath);
          
          // Clean up temp file
          fs.unlinkSync(tempWavPath);
          
          console.log(`✅ Generated: ${filename} (${text})`);
          resolve();
        } catch (error) {
          console.error(`Error converting to MP3: ${error.message}`);
          // Fallback: copy WAV as MP3
          if (!fileExists(frontendPath)) {
            fs.copyFileSync(tempWavPath, frontendPath);
          }
          if (!fileExists(mobilePath)) {
            fs.copyFileSync(tempWavPath, mobilePath);
          }
          fs.unlinkSync(tempWavPath);
          console.warn(`⚠️  Saved as WAV with MP3 extension: ${filename}`);
          resolve();
        }
      });

      fileStream.on('error', (error) => {
        reject(error);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Generating audio files for Simple Past Tense conjugations...\n');
  
  const audioFiles = [];

  // Generate infinitive audio files (if missing)
  for (const verb of commonVerbs) {
    const infinitiveFilename = `${getAudioFilename(verb.infinitive)}.mp3`;
    audioFiles.push({
      text: verb.infinitive,
      filename: infinitiveFilename
    });
  }

  // Generate conjugation audio files
  for (const verb of commonVerbs) {
    for (const pronoun of pronouns) {
      // Skip Wê for some verbs, but include for completeness
      const conjugationText = `${pronoun.ku} ${verb.past}`;
      const filename = `${getAudioFilename(conjugationText)}.mp3`;
      
      audioFiles.push({
        text: conjugationText,
        filename: filename
      });
    }
  }

  console.log(`Total audio files to generate: ${audioFiles.length}\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const audioFile of audioFiles) {
    try {
      // Check if already exists
      const frontendPath = path.join(OUTPUT_DIR, audioFile.filename);
      const mobilePath = path.join(MOBILE_DIR, audioFile.filename);
      
      if (fileExists(frontendPath) && fileExists(mobilePath)) {
        skipCount++;
        continue;
      }

      await generateAudio(audioFile.text, audioFile.filename);
      successCount++;
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to generate ${audioFile.filename}: ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`\n✅ Complete!`);
  console.log(`   Generated: ${successCount}`);
  console.log(`   Skipped (exists): ${skipCount}`);
  console.log(`   Failed: ${failCount}`);
}

main().catch(console.error);

