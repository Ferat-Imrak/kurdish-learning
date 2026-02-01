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
    const directPath = path.join(__dirname, '../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
    if (fs.existsSync(directPath)) {
      return directPath;
    }
    try {
      const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
      if (ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
        return ffmpegInstaller.path;
      }
    } catch (e) {}
    return null;
  } catch (e) {
    return null;
  }
}

function generateAudio(text, filename) {
  return new Promise((resolve, reject) => {
    const frontendPath = path.join(OUTPUT_DIR, `${filename}.mp3`);
    const mobilePath = path.join(MOBILE_DIR, `${filename}.mp3`);

    // Skip if already exists
    if (fs.existsSync(frontendPath) && fs.existsSync(mobilePath)) {
      console.log(`⏭️  Skipped (exists): ${filename}.mp3`);
      resolve({ skipped: true });
      return;
    }

    const postData = JSON.stringify({
      text: text,
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

    console.log(`📝 Generating: "${text}" -> ${filename}.mp3`);

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

        const tempWavPath = path.join(__dirname, 'temp-future-plural.wav');
        fs.writeFileSync(tempWavPath, wavBuffer);

        const ffmpegPath = getFfmpegPath();
        if (!ffmpegPath) {
          // Fallback: copy WAV as MP3
          fs.copyFileSync(tempWavPath, frontendPath);
          fs.copyFileSync(tempWavPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          console.log(`⚠️  Generated (WAV): ${filename}.mp3`);
          resolve({ success: true });
          return;
        }

        try {
          execSync(`"${ffmpegPath}" -i "${tempWavPath}" -acodec libmp3lame -ab 128k -y "${frontendPath}"`, { stdio: 'ignore' });
          fs.copyFileSync(frontendPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          console.log(`✅ Generated: ${filename}.mp3`);
          resolve({ success: true });
        } catch (error) {
          // Fallback: copy WAV as MP3
          fs.copyFileSync(tempWavPath, frontendPath);
          fs.copyFileSync(tempWavPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          console.warn(`⚠️  Generated (WAV): ${filename}.mp3`);
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
  console.log('Generating audio files for Simple Future Tense plural conjugations (Em, Hûn, Ewan)...\n');
  
  const audioFiles = [
    // xwarin (to eat)
    { text: 'Em ê bixwin', filename: 'em-e-bixwin' },
    { text: 'Hûn ê bixwin', filename: 'hun-e-bixwin' },
    { text: 'Ewan ê bixwin', filename: 'ewan-e-bixwin' },
    // çûn (to go)
    { text: 'Em ê biçin', filename: 'em-e-bicin' },
    { text: 'Hûn ê biçin', filename: 'hun-e-bicin' },
    { text: 'Ewan ê biçin', filename: 'ewan-e-bicin' },
    // kirin (to do)
    { text: 'Em ê bikin', filename: 'em-e-bikin' },
    { text: 'Hûn ê bikin', filename: 'hun-e-bikin' },
    { text: 'Ewan ê bikin', filename: 'ewan-e-bikin' },
    // xwendin (to read)
    { text: 'Em ê bixwînin', filename: 'em-e-bixwinin' },
    { text: 'Hûn ê bixwînin', filename: 'hun-e-bixwinin' },
    { text: 'Ewan ê bixwînin', filename: 'ewan-e-bixwinin' },
    // hatin (to come)
    { text: 'Em ê werin', filename: 'em-e-werin' },
    { text: 'Hûn ê werin', filename: 'hun-e-werin' },
    { text: 'Ewan ê werin', filename: 'ewan-e-werin' },
    // dîtin (to see)
    { text: 'Em ê bibînin', filename: 'em-e-bibinin' },
    { text: 'Hûn ê bibînin', filename: 'hun-e-bibinin' },
    { text: 'Ewan ê bibînin', filename: 'ewan-e-bibinin' },
    // bihîstin (to hear)
    { text: 'Em ê bibihîzin', filename: 'em-e-bibihizin' },
    { text: 'Hûn ê bibihîzin', filename: 'hun-e-bibihizin' },
    { text: 'Ewan ê bibihîzin', filename: 'ewan-e-bibihizin' },
    // axaftin (to speak)
    { text: 'Em ê biaxevin', filename: 'em-e-biaxevin' },
    { text: 'Hûn ê biaxevin', filename: 'hun-e-biaxevin' },
    { text: 'Ewan ê biaxevin', filename: 'ewan-e-biaxevin' },
  ];

  console.log(`Total files to generate: ${audioFiles.length}\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;
  const failedFiles = [];

  for (let i = 0; i < audioFiles.length; i++) {
    const audioFile = audioFiles[i];
    try {
      const result = await generateAudio(audioFile.text, audioFile.filename);
      if (result.skipped) {
        skipped++;
      } else if (result.success) {
        success++;
      }
      // Delay between requests to avoid rate limiting
      if (i < audioFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error(`❌ Failed: ${audioFile.filename}.mp3`);
      console.error(`   Error: ${error.message.substring(0, 100)}\n`);
      failed++;
      failedFiles.push({ ...audioFile, error: error.message });
      // Longer delay on error
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ⏭️  Skipped (exists): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log(`\n⚠️  Failed files:`);
    failedFiles.forEach(f => {
      console.log(`   - ${f.filename}.mp3 (${f.text})`);
    });
  }
  
  if (success > 0 || skipped > 0) {
    console.log(`\n✅ Audio generation complete!`);
  }
}

main().catch(console.error);


