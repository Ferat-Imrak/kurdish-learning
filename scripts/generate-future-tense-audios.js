const fs = require('fs');
const path = require('path');
const https = require('https');

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

// Audio files to generate
const audioFiles = [
  // xwarin (to eat) - corrected
  { text: "Ez ê bixwim", filename: "ez-e-bixwim.mp3" },
  { text: "Tu ê bixwî", filename: "tu-e-bixwi.mp3" },
  { text: "Ew ê bixwe", filename: "ew-e-bixwe.mp3" },
  
  // çûn (to go) - may already exist but checking
  { text: "Ez ê biçim", filename: "ez-e-bicim.mp3" },
  { text: "Tu ê biçî", filename: "tu-e-bici.mp3" },
  { text: "Ew ê biçe", filename: "ew-e-bice.mp3" },
  
  // kirin (to do) - may already exist but checking
  { text: "Ez ê bikim", filename: "ez-e-bikim.mp3" },
  { text: "Tu ê bikî", filename: "tu-e-biki.mp3" },
  { text: "Ew ê bike", filename: "ew-e-bike.mp3" },
  
  // xwendin (to read) - corrected
  { text: "Ez ê bixwînim", filename: "ez-e-bixwinim.mp3" },
  { text: "Tu ê bixwînî", filename: "tu-e-bixwini.mp3" },
  { text: "Ew ê bixwîne", filename: "ew-e-bixwine.mp3" },
  
  // hatin (to come) - corrected/irregular
  { text: "Ez ê werim", filename: "ez-e-werim.mp3" },
  { text: "Tu ê werî", filename: "tu-e-weri.mp3" },
  // Ew ê bê already exists in examples
  
  // dîtin (to see) - may already exist but checking
  { text: "Ez ê bibînim", filename: "ez-e-bibinim.mp3" },
  { text: "Tu ê bibînî", filename: "tu-e-bibini.mp3" },
  { text: "Ew ê bibîne", filename: "ew-e-bibine.mp3" },
  
  // bihîstin (to hear) - corrected (z not s)
  { text: "Ez ê bibihîzim", filename: "ez-e-bibihizim.mp3" },
  { text: "Tu ê bibihîzî", filename: "tu-e-bibihizi.mp3" },
  { text: "Ew ê bibihîze", filename: "ew-e-bibihize.mp3" },
  
  // axaftin (to speak) - corrected (axev not axaft)
  { text: "Ez ê biaxevim", filename: "ez-e-biaxevim.mp3" },
  { text: "Tu ê biaxevî", filename: "tu-e-biaxevi.mp3" },
  { text: "Ew ê biaxeve", filename: "ew-e-biaxeve.mp3" },
];

function generateAudio(text, outputPath) {
  return new Promise((resolve, reject) => {
    const filename = path.basename(outputPath);
    
    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`);
      resolve({ success: true, skipped: true });
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
      }
    };
    
    console.log(`📝 Generating: ${text} -> ${filename}`);
    
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      
      res.on('end', () => {
        if (res.statusCode !== 200) {
          const errorBody = Buffer.concat(chunks).toString();
          reject(new Error(`HTTP ${res.statusCode}: ${errorBody}`));
          return;
        }
        
        const wavBuffer = Buffer.concat(chunks);
        
        // Check if file is too small (likely empty/error)
        if (wavBuffer.length < 10000) {
          reject(new Error('File too small'));
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
            } catch (err) {
              // Try Homebrew path
              if (fs.existsSync('/opt/homebrew/bin/ffmpeg')) {
                ffmpegCmd = '/opt/homebrew/bin/ffmpeg';
              } else if (fs.existsSync('/usr/local/bin/ffmpeg')) {
                ffmpegCmd = '/usr/local/bin/ffmpeg';
              } else {
                throw new Error('ffmpeg not found');
              }
            }
          }
          
          // Convert WAV to MP3
          execSync(`${ffmpegCmd} -i "${tempWavPath}" -y -q:a 2 "${outputPath}"`, { stdio: 'pipe' });
          fs.unlinkSync(tempWavPath);
          
          console.log(`✅ Generated: ${filename}`);
          resolve({ success: true });
        } catch (err) {
          // If MP3 conversion fails, save as WAV with MP3 extension (browsers can play it)
          fs.copyFileSync(tempWavPath, outputPath);
          fs.unlinkSync(tempWavPath);
          console.log(`⚠️  Saved as WAV with MP3 extension: ${filename}`);
          resolve({ success: true, warning: 'Saved as WAV' });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🎵 Generating audio files for corrected future tense conjugations...\n');
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const audio of audioFiles) {
    const frontendPath = path.join(OUTPUT_DIR, audio.filename);
    const mobilePath = path.join(MOBILE_DIR, audio.filename);
    
    try {
      // Generate for frontend first
      const result = await generateAudio(audio.text, frontendPath);
      
      if (result && result.skipped) {
        skipCount++;
      } else if (result && result.success) {
        successCount++;
      }
      
      // Copy to mobile if generated or already exists
      if (fs.existsSync(frontendPath)) {
        if (!fs.existsSync(mobilePath)) {
          fs.copyFileSync(frontendPath, mobilePath);
          console.log(`📱 Copied to mobile: ${audio.filename}`);
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      errorCount++;
      console.error(`❌ Error generating ${audio.filename}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Generated: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}

main().catch(console.error);

