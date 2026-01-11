const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const KURDISH_TTS_API_KEY = process.env.KURDISH_TTS_API_KEY || '6e006ad7e233745f64db03bafd6de3cd805a45e7';

const OUTPUT_DIR = path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3/grammar');
const MOBILE_DIR = path.join(__dirname, '../mobile/assets/audio/grammar');
const BACKUP_DIR = path.join(__dirname, '../audio-backups/past-tense');

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(MOBILE_DIR)) {
  fs.mkdirSync(MOBILE_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

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

function getFfmpegPath() {
  try {
    // Try system ffmpeg first
    const possiblePaths = ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', 'ffmpeg'];
    for (const ffmpegPath of possiblePaths) {
      try {
        execSync(`"${ffmpegPath}" -version`, { stdio: 'ignore' });
        return ffmpegPath;
      } catch (e) { continue; }
    }
    // Try @ffmpeg-installer package
    try {
      const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
      if (ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
        return ffmpegInstaller.path;
      }
    } catch (e) {
      // Continue to try direct path
    }
    // Try direct path in node_modules
    const directPath = path.join(__dirname, '../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
    if (fs.existsSync(directPath)) {
      return directPath;
    }
    return null;
  } catch (e) {
    return null;
  }
}

function generateAudio(text, filename, force = false) {
  return new Promise((resolve, reject) => {
    const frontendPath = path.join(OUTPUT_DIR, filename);
    const mobilePath = path.join(MOBILE_DIR, filename);

    // Backup existing file if forcing regeneration
    if (force && fs.existsSync(frontendPath)) {
      const backupPath = path.join(BACKUP_DIR, filename);
      fs.copyFileSync(frontendPath, backupPath);
    }

    // Try with period if original text is very short (helps with API)
    let textToSend = text;
    if (text.split(' ').length <= 2 && !text.endsWith('.')) {
      textToSend = text + '.';
    }

    const postData = JSON.stringify({
      text: textToSend,
      voice: 'kurmanji_12'
    });

    const options = {
      hostname: 'www.kurdishtts.com',
      port: 443,
      path: '/api/tts-proxy',
      method: 'POST',
      headers: {
        'x-api-key': KURDISH_TTS_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        if (res.statusCode !== 200) {
          const errorBody = Buffer.concat(chunks).toString();
          const errorMsg = errorBody.length > 200 ? errorBody.substring(0, 200) : errorBody;
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}\nResponse: ${errorMsg}`));
          return;
        }

        const wavBuffer = Buffer.concat(chunks);
        
        // Check if response is too small (likely an error)
        if (wavBuffer.length < 1000) {
          const errorText = wavBuffer.toString();
          reject(new Error(`Response too small (${wavBuffer.length} bytes). Response: ${errorText.substring(0, 200)}`));
          return;
        }

        const tempWavPath = path.join(__dirname, 'temp-audio-regen.wav');
        fs.writeFileSync(tempWavPath, wavBuffer);

        const ffmpegPath = getFfmpegPath();
        if (!ffmpegPath) {
          fs.copyFileSync(tempWavPath, frontendPath);
          fs.copyFileSync(tempWavPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          console.log(`✅ Generated (WAV): ${filename}`);
          resolve({ success: true });
          return;
        }

        try {
          execSync(`"${ffmpegPath}" -i "${tempWavPath}" -acodec libmp3lame -ab 128k "${frontendPath}"`, { stdio: 'ignore' });
          fs.copyFileSync(frontendPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          console.log(`✅ Generated: ${filename}`);
          resolve({ success: true });
        } catch (error) {
          // Fallback: copy WAV as MP3
          fs.copyFileSync(tempWavPath, frontendPath);
          fs.copyFileSync(tempWavPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          console.warn(`⚠️  Generated (WAV format): ${filename}`);
          resolve({ success: true });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Regenerating all Simple Past Tense audio files with corrected voice...\n');
  
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

  const audioFiles = [];
  for (const verb of commonVerbs) {
    for (const pronoun of pronouns) {
      const text = `${pronoun} ${verb.past}`;
      let filename = `${getAudioFilename(text)}.mp3`;
      
      // Handle "We" (you plural) vs "Wê" (she) conflict - both become "we"
      // We'll use "we-plural" for "We" (you plural) to differentiate
      if (pronoun === "We" && filename.includes('we-')) {
        // "We" (you plural) - use "we-plural" prefix
        const verbPart = filename.replace('we-', '').replace('.mp3', '');
        filename = `we-plural-${verbPart}.mp3`;
      } else if (pronoun === "Wê" && filename.includes('we-')) {
        // "Wê" (she) - keep as "we" (will overwrite the plural one, but that's OK since they're separate iterations)
        // Actually, let's keep "Wê" as "we" and skip "We" or handle it differently
        // For now, let's just use the original approach but skip duplicates
      }
      
      audioFiles.push({ text, filename, pronoun });
    }
  }
  
  // Remove duplicates (same filename) - keep first occurrence
  const seen = new Set();
  const uniqueAudioFiles = [];
  for (const audioFile of audioFiles) {
    if (!seen.has(audioFile.filename)) {
      seen.add(audioFile.filename);
      uniqueAudioFiles.push(audioFile);
    } else {
      console.log(`⚠️  Skipping duplicate filename: ${audioFile.filename} (${audioFile.text})`);
    }
  }

  console.log(`Total files to generate: ${uniqueAudioFiles.length} (${audioFiles.length - uniqueAudioFiles.length} duplicates removed)\n`);

  let success = 0;
  let failed = 0;
  const failedFiles = [];

  for (let i = 0; i < uniqueAudioFiles.length; i++) {
    const audioFile = uniqueAudioFiles[i];
    try {
      await generateAudio(audioFile.text, audioFile.filename, true); // Force regeneration
      success++;
      // Delay between requests to avoid rate limiting
      if (i < uniqueAudioFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error(`❌ Failed: ${audioFile.filename}`);
      console.error(`   Error: ${error.message.substring(0, 100)}\n`);
      failed++;
      failedFiles.push({ ...audioFile, error: error.message });
      // Longer delay on error
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log(`\n⚠️  Failed files:`);
    failedFiles.forEach(f => {
      console.log(`   - ${f.filename} (${f.text})`);
    });
  }
  
  if (success > 0) {
    console.log(`\n✅ Generated ${success} audio files with correct voice!`);
  }
}

main().catch(console.error);

