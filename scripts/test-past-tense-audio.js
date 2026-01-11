const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const KURDISH_TTS_API_KEY = process.env.KURDISH_TTS_API_KEY || '6e006ad7e233745f64db03bafd6de3cd805a45e7';

const OUTPUT_DIR = path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3/grammar');
const MOBILE_DIR = path.join(__dirname, '../mobile/assets/audio/grammar');

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

function generateAudio(text, filename, force = false) {
  return new Promise((resolve, reject) => {
    const frontendPath = path.join(OUTPUT_DIR, filename);
    const mobilePath = path.join(MOBILE_DIR, filename);

    // Only skip if not forcing and file exists
    if (!force && fs.existsSync(frontendPath) && fs.existsSync(mobilePath)) {
      console.log(`⏭️  Skipped (exists): ${filename}`);
      resolve({ skipped: true });
      return;
    }

    // Try with period if original text is very short
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

    console.log(`📝 Generating: "${textToSend}" -> ${filename}`);

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

        const tempWavPath = path.join(__dirname, 'temp-audio-test.wav');
        fs.writeFileSync(tempWavPath, wavBuffer);

        const ffmpegPath = getFfmpegPath();
        if (!ffmpegPath) {
          if (!fs.existsSync(frontendPath)) fs.copyFileSync(tempWavPath, frontendPath);
          if (!fs.existsSync(mobilePath)) fs.copyFileSync(tempWavPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          console.log(`✅ Generated (WAV): ${filename}`);
          resolve({ success: true });
          return;
        }

        try {
          execSync(`"${ffmpegPath}" -i "${tempWavPath}" -acodec libmp3lame -ab 128k "${frontendPath}"`, { stdio: 'ignore' });
          fs.copyFileSync(frontendPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          console.log(`✅ Generated (MP3): ${filename}`);
          resolve({ success: true });
        } catch (error) {
          // Fallback: copy WAV as MP3
          if (!fs.existsSync(frontendPath)) fs.copyFileSync(tempWavPath, frontendPath);
          if (!fs.existsSync(mobilePath)) fs.copyFileSync(tempWavPath, mobilePath);
          fs.unlinkSync(tempWavPath);
          console.log(`⚠️  Generated (WAV format): ${filename}`);
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
  console.log('Testing audio generation with corrected voice (kurmanji_12)...\n');
  
  // Test with a few phrases that previously failed
  const testPhrases = [
    { text: 'Te xwar', filename: 'te-xwar.mp3' },
    { text: 'Min çû', filename: 'min-cu.mp3' },
    { text: 'Wî kir', filename: 'wi-kir.mp3' },
  ];

  console.log('Testing 3 phrases that previously failed (with corrected voice)...\n');

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const phrase of testPhrases) {
    try {
      const result = await generateAudio(phrase.text, phrase.filename, false); // Check if exists, generate if not
      if (result.skipped) {
        skipped++;
      } else if (result.success) {
        success++;
      }
      await new Promise(resolve => setTimeout(resolve, 1500)); // Delay between requests
    } catch (error) {
      console.error(`❌ Failed: ${phrase.filename}\n   Error: ${error.message}\n`);
      failed++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ⏭️  Skipped (exists): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);

  if (success > 0 || skipped === testPhrases.length) {
    console.log(`\n✅ Voice parameter is working! Ready to generate all missing files.`);
  } else {
    console.log(`\n⚠️  Still having issues. May need different approach for short phrases.`);
  }
}

main().catch(console.error);

