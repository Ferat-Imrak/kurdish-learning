const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const KURDISH_TTS_API_KEY = process.env.KURDISH_TTS_API_KEY || '6e006ad7e233745f64db03bafd6de3cd805a45e7';

if (!KURDISH_TTS_API_KEY) {
  console.error('❌ KURDISH_TTS_API_KEY not found in environment variables');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3/grammar');
const MOBILE_DIR = path.join(__dirname, '../mobile/assets/audio/grammar');

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(MOBILE_DIR)) {
  fs.mkdirSync(MOBILE_DIR, { recursive: true });
}

const audioFiles = [
  {
    text: 'Wî çû ku derê',
    filename: 'wi-cu-ku-dere.mp3'
  }
];

function getFfmpegPath() {
  try {
    // Try to find ffmpeg in common locations
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
    
    // Try to find ffmpeg-installer
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

function generateAudio(text, filename) {
  return new Promise((resolve, reject) => {
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
      }
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
        
        // Convert WAV to MP3
        const ffmpegPath = getFfmpegPath();
        if (!ffmpegPath) {
          console.warn(`⚠️  ffmpeg not found. Saving as WAV with MP3 extension: ${filename}`);
          const targetPath = path.join(OUTPUT_DIR, filename);
          fs.copyFileSync(tempWavPath, targetPath);
          fs.unlinkSync(tempWavPath);
          
          // Copy to mobile
          const mobileTargetPath = path.join(MOBILE_DIR, filename);
          fs.copyFileSync(tempWavPath, mobileTargetPath);
          resolve();
          return;
        }

        const frontendPath = path.join(OUTPUT_DIR, filename);
        const mobilePath = path.join(MOBILE_DIR, filename);

        try {
          // Convert to MP3
          execSync(`"${ffmpegPath}" -i "${tempWavPath}" -acodec libmp3lame -ab 128k "${frontendPath}"`, { stdio: 'ignore' });
          
          // Copy to mobile
          fs.copyFileSync(frontendPath, mobilePath);
          
          // Clean up temp file
          fs.unlinkSync(tempWavPath);
          
          console.log(`✅ Generated: ${filename}`);
          resolve();
        } catch (error) {
          console.error(`Error converting to MP3: ${error.message}`);
          // Fallback: copy WAV as MP3
          fs.copyFileSync(tempWavPath, frontendPath);
          fs.copyFileSync(tempWavPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          console.warn(`⚠️  Saved as WAV with MP3 extension: ${filename}`);
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Generating audio files for Simple Past Tense corrections...\n');
  
  for (const audioFile of audioFiles) {
    try {
      await generateAudio(audioFile.text, audioFile.filename);
    } catch (error) {
      console.error(`❌ Failed to generate ${audioFile.filename}:`, error.message);
    }
  }
  
  console.log('\n✅ Audio generation complete!');
}

main();

