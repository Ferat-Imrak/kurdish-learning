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

    // Skip if already exists in both locations
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

        const tempWavPath = path.join(__dirname, 'temp-present-tense.wav');
        fs.writeFileSync(tempWavPath, wavBuffer);

        const ffmpegPath = getFfmpegPath();
        if (!ffmpegPath) {
          // Fallback: copy WAV as MP3
          if (!fs.existsSync(frontendPath)) {
            fs.copyFileSync(tempWavPath, frontendPath);
          }
          if (!fs.existsSync(mobilePath)) {
            fs.copyFileSync(tempWavPath, mobilePath);
          }
          fs.unlinkSync(tempWavPath);
          console.log(`⚠️  Generated (WAV): ${filename}.mp3`);
          resolve({ success: true });
          return;
        }

        try {
          // Generate for frontend first
          if (!fs.existsSync(frontendPath)) {
            execSync(`"${ffmpegPath}" -i "${tempWavPath}" -acodec libmp3lame -ab 128k -y "${frontendPath}"`, { stdio: 'ignore' });
          }
          // Copy to mobile
          if (!fs.existsSync(mobilePath)) {
            if (fs.existsSync(frontendPath)) {
              fs.copyFileSync(frontendPath, mobilePath);
            } else {
              execSync(`"${ffmpegPath}" -i "${tempWavPath}" -acodec libmp3lame -ab 128k -y "${mobilePath}"`, { stdio: 'ignore' });
            }
          }
          fs.unlinkSync(tempWavPath);
          console.log(`✅ Generated: ${filename}.mp3`);
          resolve({ success: true });
        } catch (error) {
          // Fallback: copy WAV as MP3
          if (!fs.existsSync(frontendPath)) {
            fs.copyFileSync(tempWavPath, frontendPath);
          }
          if (!fs.existsSync(mobilePath)) {
            fs.copyFileSync(tempWavPath, mobilePath);
          }
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
  console.log('Generating audio files for Simple Present Tense conjugations...\n');
  
  // Missing audio files for present tense conjugations
  const audioFiles = [
    // kirin (to do) - missing: ez, tu, ew, hun, ewan (em exists)
    { text: 'Ez dikim', filename: 'ez-dikim' },
    { text: 'Tu dikî', filename: 'tu-diki' },
    { text: 'Ew dike', filename: 'ew-dike' },
    { text: 'Hûn dikin', filename: 'hun-dikin' },
    { text: 'Ewan dikin', filename: 'ewan-dikin' },
    
    // xwendin (to read) - all missing
    { text: 'Ez dixwînim', filename: 'ez-dixwinim' },
    { text: 'Tu dixwînî', filename: 'tu-dixwini' },
    { text: 'Ew dixwîne', filename: 'ew-dixwine' },
    { text: 'Em dixwînin', filename: 'em-dixwinin' },
    { text: 'Hûn dixwînin', filename: 'hun-dixwinin' },
    { text: 'Ewan dixwînin', filename: 'ewan-dixwinin' },
    
    // hatin (to come) - irregular, missing: ez, tu, em, hun, ewan (ew exists)
    { text: 'Ez hatim', filename: 'ez-hatim' },
    { text: 'Tu hatî', filename: 'tu-hati' },
    { text: 'Em tên', filename: 'em-ten' },
    { text: 'Hûn tên', filename: 'hun-ten' },
    { text: 'Ewan tên', filename: 'ewan-ten' },
    
    // dîtin (to see) - missing: tu, ew, em, hun, ewan (ez exists)
    { text: 'Tu dibînî', filename: 'tu-dibini' },
    { text: 'Ew dibîne', filename: 'ew-dibine' },
    { text: 'Em dibînin', filename: 'em-dibinin' },
    { text: 'Hûn dibînin', filename: 'hun-dibinin' },
    { text: 'Ewan dibînin', filename: 'ewan-dibinin' },
    
    // bihîstin (to hear) - missing: ez, ew, em, hun, ewan (tu exists)
    { text: 'Ez dibihîzim', filename: 'ez-dibihizim' },
    { text: 'Ew dibihîze', filename: 'ew-dibihize' },
    { text: 'Em dibihîzin', filename: 'em-dibihizin' },
    { text: 'Hûn dibihîzin', filename: 'hun-dibihizin' },
    { text: 'Ewan dibihîzin', filename: 'ewan-dibihizin' },
    
    // axaftin (to speak) - missing: ez, tu, em, hun, ewan (ew exists)
    { text: 'Ez diaxivim', filename: 'ez-diaxivim' },
    { text: 'Tu diaxivî', filename: 'tu-diaxivi' },
    { text: 'Em diaxevin', filename: 'em-diaxivin' },
    { text: 'Hûn diaxevin', filename: 'hun-diaxivin' },
    { text: 'Ewan diaxevin', filename: 'ewan-diaxivin' },
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

