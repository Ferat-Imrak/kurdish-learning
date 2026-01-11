const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const API_KEY = process.env.KURDISH_TTS_API_KEY || '6e006ad7e233745f64db03bafd6de3cd805a45e7';
const SPEAKER_ID = 'kurmanji_12';
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3/months');
const MOBILE_OUTPUT_DIR = path.join(__dirname, '../mobile/assets/audio/months');

// Text to generate
const text = 'Di Çileyê de';
const filename = 'di-cileye-de.mp3';

// Create output directories
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(MOBILE_OUTPUT_DIR)) {
  fs.mkdirSync(MOBILE_OUTPUT_DIR, { recursive: true });
}

// Download and convert to MP3
async function downloadAudioAsMP3(text, outputPath) {
  const postData = JSON.stringify({
    text: text,
    speaker_id: SPEAKER_ID
  });

  const options = {
    hostname: 'www.kurdishtts.com',
    port: 443,
    path: '/api/tts-proxy',
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      
      res.on('end', () => {
        if (res.statusCode !== 200) {
          const errorBody = Buffer.concat(chunks).toString();
          console.log('Error response:', errorBody);
          resolve({ success: false, error: `HTTP ${res.statusCode}: ${errorBody}` });
          return;
        }
        
        const wavBuffer = Buffer.concat(chunks);
        
        // Check if file is too small (likely empty/error)
        if (wavBuffer.length < 10000) {
          resolve({ success: false, error: 'File too small' });
          return;
        }
        
        // Save as WAV temporarily
        const tempWavPath = outputPath.replace('.mp3', '.temp.wav');
        fs.writeFileSync(tempWavPath, wavBuffer);
        
        // Convert to MP3 using ffmpeg
        const { execSync } = require('child_process');
        try {
          execSync(
            `ffmpeg -i "${tempWavPath}" -codec:a libmp3lame -qscale:a 2 "${outputPath}" -y -loglevel error`,
            { stdio: 'pipe' }
          );
          
          // Delete temp WAV
          fs.unlinkSync(tempWavPath);
          
          const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
          resolve({ success: true, size: sizeKB });
        } catch (convertError) {
          // If conversion fails, keep the WAV
          fs.renameSync(tempWavPath, outputPath.replace('.mp3', '.wav'));
          resolve({ success: false, error: 'Conversion failed' });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(20000, () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.write(postData);
    req.end();
  });
}

// Main
async function main() {
  console.log(`🎙️  Regenerating audio for: "${text}"`);
  console.log('=========================================\n');

  const frontendPath = path.join(OUTPUT_DIR, filename);
  const mobilePath = path.join(MOBILE_OUTPUT_DIR, filename);

  // Download to frontend first
  console.log('📥 Downloading audio...');
  const result = await downloadAudioAsMP3(text, frontendPath);
  
  if (result.success) {
    console.log(`✅ Generated: ${frontendPath} (${result.size} KB)`);
    
    // Copy to mobile
    fs.copyFileSync(frontendPath, mobilePath);
    console.log(`✅ Copied to: ${mobilePath}`);
    
    console.log('\n🎉 Success! Audio file regenerated for both frontend and mobile.');
  } else {
    console.log(`❌ Failed: ${result.error}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

