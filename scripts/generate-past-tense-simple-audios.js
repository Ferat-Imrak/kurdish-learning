const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

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
    const possiblePaths = ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', 'ffmpeg'];
    for (const ffmpegPath of possiblePaths) {
      try {
        execSync(`"${ffmpegPath}" -version`, { stdio: 'ignore' });
        return ffmpegPath;
      } catch (e) { continue; }
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

    if (fileExists(frontendPath) && fileExists(mobilePath)) {
      console.log(`⏭️  Skipped: ${filename}`);
      resolve();
      return;
    }

    // Try with period if original text is very short
    let textToSend = text;
    if (text.split(' ').length <= 2 && !text.endsWith('.')) {
      textToSend = text + '.';
    }

    const data = JSON.stringify({
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
        'Content-Length': Buffer.byteLength(data)
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
          reject(new Error(`Status ${res.statusCode}: ${res.statusMessage} - ${errorBody.substring(0, 200)}`));
          return;
        }

        const wavBuffer = Buffer.concat(chunks);
        
        // Check if response is too small (likely an error)
        if (wavBuffer.length < 1000) {
          const errorText = wavBuffer.toString();
          reject(new Error(`Response too small (${wavBuffer.length} bytes). Response: ${errorText.substring(0, 200)}`));
          return;
        }

        const tempWavPath = path.join(__dirname, 'temp-audio.wav');
        fs.writeFileSync(tempWavPath, wavBuffer);

        const ffmpegPath = getFfmpegPath();
        if (!ffmpegPath) {
          if (!fileExists(frontendPath)) fs.copyFileSync(tempWavPath, frontendPath);
          if (!fileExists(mobilePath)) fs.copyFileSync(tempWavPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          resolve();
          return;
        }

        try {
          execSync(`"${ffmpegPath}" -i "${tempWavPath}" -acodec libmp3lame -ab 128k "${frontendPath}"`, { stdio: 'ignore' });
          fs.copyFileSync(frontendPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          console.log(`✅ ${filename}`);
          resolve();
        } catch (error) {
          if (!fileExists(frontendPath)) fs.copyFileSync(tempWavPath, frontendPath);
          if (!fileExists(mobilePath)) fs.copyFileSync(tempWavPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          console.warn(`⚠️  ${filename} (WAV)`);
          resolve();
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    console.log(`📝 Generating: "${textToSend}" -> ${filename}`);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Generating missing Simple Past Tense conjugations...\n');
  
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
      const filename = `${getAudioFilename(text)}.mp3`;
      audioFiles.push({ text, filename });
    }
  }

  console.log(`Total: ${audioFiles.length} files\n`);

  let success = 0, skipped = 0, failed = 0;

  for (const audioFile of audioFiles) {
    const frontendPath = path.join(OUTPUT_DIR, audioFile.filename);
    const mobilePath = path.join(MOBILE_DIR, audioFile.filename);
    
    if (fileExists(frontendPath) && fileExists(mobilePath)) {
      skipped++;
      continue;
    }

    try {
      await generateAudio(audioFile.text, audioFile.filename);
      success++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay
    } catch (error) {
      console.error(`❌ ${audioFile.filename}: ${error.message}`);
      failed++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Even longer delay on error
    }
  }
  
  console.log(`\n✅ Complete! Generated: ${success}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch(console.error);

