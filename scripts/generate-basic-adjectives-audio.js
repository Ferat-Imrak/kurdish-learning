const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const API_KEY = process.env.KURDISH_TTS_API_KEY || '6e006ad7e233745f64db03bafd6de3cd805a45e7';
const SPEAKER_ID = 'kurmanji_12';
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3/grammar');
const MOBILE_OUTPUT_DIR = path.join(__dirname, '../mobile/assets/audio/grammar');

// Helper function to sanitize Kurdish text for filename lookup
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

// Audio files to generate
const audioFiles = [
  { text: "Zarokê biçûk.", filename: "zaroke-bicuk.mp3" },
  { text: "Pirtûka baş.", filename: "pirtuka-bas.mp3" },
  { text: "Hewa xirab.", filename: "hewa-xirab.mp3" },
  { text: "Av germ.", filename: "av-germ.mp3" },
  { text: "Av sar.", filename: "av-sar.mp3" },
  { text: "Malê min mezin e", filename: "male-min-mezin-e.mp3" },
  { text: "Zarokê te biçûk e", filename: "zaroke-te-bicuk-e.mp3" },
  { text: "Pirtûka wî baş e", filename: "pirtuka-wi-bas-e.mp3" },
  { text: "Hewa xirab e", filename: "hewa-xirab-e.mp3" },
  { text: "Av germ e", filename: "av-germ-e.mp3" },
  { text: "Pirtûka nû xweş e", filename: "pirtuka-nu-xwes-e.mp3" },
  { text: "Darê dirêj.", filename: "dare-direj.mp3" },
  { text: "Mêra kurt.", filename: "mera-kurt.mp3" },
  { text: "Rêya fireh.", filename: "reya-fireh.mp3" },
  { text: "Rêya teng.", filename: "reya-teng.mp3" },
  { text: "Pirtûka giran.", filename: "pirtuka-giran.mp3" },
  { text: "Pirtûka sivik.", filename: "pirtuka-sivik.mp3" },
  { text: "Karê hêsan.", filename: "kare-hesan.mp3" },
  { text: "Karê giran.", filename: "kare-giran.mp3" },
  { text: "Roja xweş.", filename: "roja-xwes.mp3" },
  { text: "Otomobîla zû.", filename: "otomobila-zu.mp3" },
  { text: "Otomobîla hêdî.", filename: "otomobila-hedi.mp3" },
  { text: "Pirtûka nû.", filename: "pirtuka-nu.mp3" },
  { text: "Malê kevn.", filename: "male-kevn.mp3" },
  { text: "Kûrsiyê nû.", filename: "kursiye-nu.mp3" },
  { text: "Kûrsiyê kevn.", filename: "kursiye-kevn.mp3" },
];

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
          // Try to find ffmpeg
          let ffmpegCmd = 'ffmpeg';
          try {
            execSync('which ffmpeg', { stdio: 'pipe' });
          } catch (e) {
            // Try to use @ffmpeg-installer/ffmpeg
            try {
              const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
              ffmpegCmd = ffmpegInstaller.path;
            } catch (e2) {
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
  console.log(`🎙️  Generating ${audioFiles.length} audio files for Basic Adjectives`);
  console.log('=========================================\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < audioFiles.length; i++) {
    const { text, filename } = audioFiles[i];
    const frontendPath = path.join(OUTPUT_DIR, filename);
    const mobilePath = path.join(MOBILE_OUTPUT_DIR, filename);

    // Skip if already exists
    if (fs.existsSync(frontendPath)) {
      console.log(`[${i + 1}/${audioFiles.length}] ⏭️  Skipping: ${filename} (already exists)`);
      // Copy to mobile if not exists there
      if (!fs.existsSync(mobilePath)) {
        fs.copyFileSync(frontendPath, mobilePath);
        console.log(`    ✅ Copied to mobile`);
      }
      successCount++;
      continue;
    }

    console.log(`[${i + 1}/${audioFiles.length}] 🎙️  Generating: "${text}"`);
    console.log(`    → ${filename}`);

    const result = await downloadAudioAsMP3(text, frontendPath);
    
    if (result.success) {
      console.log(`    ✅ Generated: ${frontendPath} (${result.size} KB)`);
      
      // Copy to mobile
      fs.copyFileSync(frontendPath, mobilePath);
      console.log(`    ✅ Copied to: ${mobilePath}`);
      successCount++;
    } else {
      console.log(`    ❌ Failed: ${result.error}`);
      failCount++;
    }
    
    console.log('');
    
    // Small delay to avoid overwhelming the API
    if (i < audioFiles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('=========================================');
  console.log(`✅ Success: ${successCount}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
  }
  console.log('\n🎉 Audio generation complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

