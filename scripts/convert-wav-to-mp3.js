const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GRAMMAR_DIR = path.join(__dirname, '../mobile/assets/audio/grammar');
const FRONTEND_DIR = path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3/grammar');

function getFfmpegPath() {
  try {
    // Try system paths first
    const possiblePaths = ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', 'ffmpeg'];
    for (const ffmpegPath of possiblePaths) {
      try {
        execSync(`"${ffmpegPath}" -version`, { stdio: 'ignore' });
        return ffmpegPath;
      } catch (e) { continue; }
    }
    // Try @ffmpeg-installer
    try {
      const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
      if (ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
        return ffmpegInstaller.path;
      }
    } catch (e) {}
    // Try direct path
    const directPath = path.join(__dirname, '../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
    if (fs.existsSync(directPath)) {
      return directPath;
    }
    return null;
  } catch (e) {
    return null;
  }
}

function isWAVFile(filepath) {
  try {
    // Check if file is actually WAV (RIFF header)
    const buffer = fs.readFileSync(filepath, { start: 0, end: 4 });
    const header = buffer.toString('ascii');
    return header === 'RIFF';
  } catch (e) {
    return false;
  }
}

function convertToMP3(wavPath, mp3Path, ffmpegPath) {
  try {
    execSync(`"${ffmpegPath}" -i "${wavPath}" -acodec libmp3lame -ab 128k -y "${mp3Path}"`, { 
      stdio: 'ignore',
      timeout: 10000
    });
    return true;
  } catch (error) {
    return false;
  }
}

function main() {
  console.log('Converting WAV files to MP3...\n');
  
  const ffmpegPath = getFfmpegPath();
  if (!ffmpegPath) {
    console.error('❌ ffmpeg not found. Cannot convert files.');
    return;
  }
  
  console.log(`Using ffmpeg: ${ffmpegPath}\n`);

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

  const pronouns = ["Min", "Te", "Wî", "We", "Me", "Wan"]; // Skip "Wê" as it's handled by "Wî" audio

  function getFilename(pronoun, verb) {
    return `${pronoun.toLowerCase()
      .replace(/[îÎ]/g, 'i')
      .replace(/[êÊ]/g, 'e')
      .replace(/[ûÛ]/g, 'u')
      .replace(/[şŞ]/g, 's')
      .replace(/[çÇ]/g, 'c')
      .replace(/[^\w-]/g, '')}-${verb.toLowerCase()
      .replace(/[îÎ]/g, 'i')
      .replace(/[êÊ]/g, 'e')
      .replace(/[ûÛ]/g, 'u')
      .replace(/[şŞ]/g, 's')
      .replace(/[çÇ]/g, 'c')
      .replace(/[^\w-]/g, '')}.mp3`;
  }

  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (const verb of commonVerbs) {
    for (const pronoun of pronouns) {
      const filename = getFilename(pronoun, verb.past);
      const grammarPath = path.join(GRAMMAR_DIR, filename);
      const frontendPath = path.join(FRONTEND_DIR, filename);

      // Check mobile file
      let mobileNeedsConversion = false;
      if (fs.existsSync(grammarPath)) {
        mobileNeedsConversion = isWAVFile(grammarPath);
      }
      
      // Check frontend file
      let frontendNeedsConversion = false;
      if (fs.existsSync(frontendPath)) {
        frontendNeedsConversion = isWAVFile(frontendPath);
      }

      if (mobileNeedsConversion || frontendNeedsConversion) {
        // Use mobile file as source if it exists, otherwise frontend
        const sourcePath = fs.existsSync(grammarPath) ? grammarPath : frontendPath;
        const tempMP3 = path.join(__dirname, 'temp-convert.mp3');
        
        console.log(`Converting: ${filename}...`);
        if (convertToMP3(sourcePath, tempMP3, ffmpegPath)) {
          // Replace original files with MP3
          if (fs.existsSync(grammarPath)) {
            fs.copyFileSync(tempMP3, grammarPath);
          }
          if (fs.existsSync(frontendPath)) {
            fs.copyFileSync(tempMP3, frontendPath);
          } else {
            // Create frontend file if it doesn't exist
            fs.copyFileSync(tempMP3, frontendPath);
          }
          // Also create mobile file if it doesn't exist
          if (!fs.existsSync(grammarPath)) {
            fs.copyFileSync(tempMP3, grammarPath);
          }
          fs.unlinkSync(tempMP3);
          console.log(`✅ Converted: ${filename}`);
          converted++;
        } else {
          console.error(`❌ Failed to convert: ${filename}`);
          if (fs.existsSync(tempMP3)) {
            fs.unlinkSync(tempMP3);
          }
          failed++;
        }
      } else {
        if (fs.existsSync(grammarPath) || fs.existsSync(frontendPath)) {
          skipped++;
        }
      }
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Converted: ${converted}`);
  console.log(`   ⏭️  Skipped (already MP3): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
}

main();
