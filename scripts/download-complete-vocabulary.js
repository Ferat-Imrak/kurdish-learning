const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const API_KEY = '3d07e55fd32ac4df5f9c41b478f90d54094218a0';
const SPEAKER = '46_speaker';
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3');
const DELAY_MS = 800; // Reduced delay for faster download

// Load the complete word list
const wordsFile = path.join(__dirname, 'all-kurdish-words.json');
const allWords = JSON.parse(fs.readFileSync(wordsFile, 'utf8'));

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Sanitize filename
function sanitizeFilename(text) {
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
    .replace(/^-+|-+$/g, '')
    .trim();
}

// Download and convert to MP3 in one step
async function downloadAudioAsMP3(text) {
  const filename = `${sanitizeFilename(text)}.mp3`;
  const filePath = path.join(OUTPUT_DIR, filename);
  
  // Skip if exists
  if (fs.existsSync(filePath)) {
    return { success: true, skipped: true };
  }
  
  const postData = JSON.stringify({
    text: text,
    language: 'kurmanji',
    speaker_key: SPEAKER,
    enhance_audio: true
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
      if (res.statusCode !== 200) {
        resolve({ success: false, error: `HTTP ${res.statusCode}` });
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      
      res.on('end', () => {
        const wavBuffer = Buffer.concat(chunks);
        
        // Check if file is too small (likely empty/error)
        if (wavBuffer.length < 10000) {
          resolve({ success: false, error: 'File too small' });
          return;
        }
        
        // Save as WAV temporarily
        const tempWavPath = filePath.replace('.mp3', '.temp.wav');
        fs.writeFileSync(tempWavPath, wavBuffer);
        
        // Convert to MP3 using ffmpeg
        const { execSync } = require('child_process');
        try {
          execSync(
            `ffmpeg -i "${tempWavPath}" -codec:a libmp3lame -qscale:a 2 "${filePath}" -y -loglevel error`,
            { stdio: 'pipe' }
          );
          
          // Delete temp WAV
          fs.unlinkSync(tempWavPath);
          
          const sizeKB = (fs.statSync(filePath).size / 1024).toFixed(1);
          resolve({ success: true, size: sizeKB });
        } catch (convertError) {
          // If conversion fails, keep the WAV
          fs.renameSync(tempWavPath, filePath.replace('.mp3', '.wav'));
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
  console.log('🚀 Complete Kurdish Vocabulary Downloader');
  console.log('=========================================');
  console.log(`Total words: ${allWords.length}`);
  console.log(`Speaker: ${SPEAKER}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  let success = 0, skipped = 0, failed = 0;
  const failures = [];
  const startTime = Date.now();

  for (let i = 0; i < allWords.length; i++) {
    const word = allWords[i];
    const progress = `[${i + 1}/${allWords.length}]`;
    
    const result = await downloadAudioAsMP3(word);
    
    if (result.skipped) {
      console.log(`${progress} ⏭️  "${word}" (exists)`);
      skipped++;
    } else if (result.success) {
      console.log(`${progress} ✅ "${word}" (${result.size} KB)`);
      success++;
    } else {
      console.log(`${progress} ❌ "${word}" - ${result.error}`);
      failed++;
      failures.push({ word, error: result.error });
    }
    
    // Delay between requests
    if (i < allWords.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  
  console.log('\n=========================================');
  console.log(`✅ Downloaded: ${success}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Time: ${duration} minutes`);
  console.log(`📁 Location: ${OUTPUT_DIR}`);
  
  if (failures.length > 0) {
    console.log(`\n❌ Failed downloads:`);
    failures.forEach(f => console.log(`   - ${f.word}: ${f.error}`));
    
    const retryFile = path.join(__dirname, 'failed-words.json');
    fs.writeFileSync(retryFile, JSON.stringify(failures.map(f => f.word), null, 2));
    console.log(`\n💾 Failed words saved to: ${retryFile}`);
    console.log(`   Run this script again to retry.`);
  }
  
  if (success > 0) {
    console.log(`\n🎉 Success! Your app now has instant audio for ${success + skipped} words!`);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

