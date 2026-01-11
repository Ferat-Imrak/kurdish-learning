const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const API_KEY = process.env.KURDISH_TTS_API_KEY || '6e006ad7e233745f64db03bafd6de3cd805a45e7';
const SPEAKER_ID = 'kurmanji_12';

// Get text and output path from command line
const text = process.argv[2];
const outputPath = process.argv[3];

if (!text || !outputPath) {
  console.error('Usage: node regenerate-color-audio.js "text" "output/path.mp3"');
  process.exit(1);
}

// Create output directory if it doesn't exist
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
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
          // Try to find ffmpeg in common locations or use system ffmpeg
          let ffmpegCmd = 'ffmpeg';
          try {
            execSync('which ffmpeg', { stdio: 'pipe' });
          } catch (e) {
            // Try homebrew path on macOS
            if (fs.existsSync('/opt/homebrew/bin/ffmpeg')) {
              ffmpegCmd = '/opt/homebrew/bin/ffmpeg';
            } else if (fs.existsSync('/usr/local/bin/ffmpeg')) {
              ffmpegCmd = '/usr/local/bin/ffmpeg';
            } else {
              throw new Error('ffmpeg not found');
            }
          }
          
          execSync(
            `${ffmpegCmd} -i "${tempWavPath}" -codec:a libmp3lame -qscale:a 2 "${outputPath}" -y -loglevel error`,
            { stdio: 'pipe' }
          );
          
          // Delete temp WAV
          fs.unlinkSync(tempWavPath);
          
          const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
          resolve({ success: true, size: sizeKB });
        } catch (convertError) {
          // If conversion fails, try to save as WAV and rename to MP3 (browser can play WAV)
          try {
            fs.renameSync(tempWavPath, outputPath);
            const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
            console.log('⚠️  Saved as WAV (MP3 conversion failed, but file is usable)');
            resolve({ success: true, size: sizeKB });
          } catch (renameError) {
            resolve({ success: false, error: 'Conversion failed: ' + convertError.message });
          }
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
  console.log(`📁 Output: ${outputPath}\n`);

  const result = await downloadAudioAsMP3(text, outputPath);
  
  if (result.success) {
    console.log(`✅ Generated: ${outputPath} (${result.size} KB)`);
    console.log('\n🎉 Success! Audio file regenerated.');
  } else {
    console.log(`❌ Failed: ${result.error}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

