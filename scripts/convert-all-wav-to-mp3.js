const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GRAMMAR_DIR = path.join(__dirname, '../mobile/assets/audio/grammar');
const FRONTEND_DIR = path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3/grammar');

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

function isWAVFile(filepath) {
  try {
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

function findWAVFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  
  const files = fs.readdirSync(dir);
  const wavFiles = [];
  
  for (const file of files) {
    if (!file.endsWith('.mp3')) {
      continue;
    }
    
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isFile() && isWAVFile(filepath)) {
      wavFiles.push({ filename: file, filepath });
    }
  }
  
  return wavFiles;
}

function main() {
  console.log('Finding and converting WAV files to MP3...\n');
  
  const ffmpegPath = getFfmpegPath();
  if (!ffmpegPath) {
    console.error('❌ ffmpeg not found. Cannot convert files.');
    return;
  }
  
  console.log(`Using ffmpeg: ${ffmpegPath}\n`);

  // Find all WAV files in both directories
  const mobileWAVFiles = findWAVFiles(GRAMMAR_DIR);
  const frontendWAVFiles = findWAVFiles(FRONTEND_DIR);
  
  // Combine and deduplicate by filename
  const allFiles = new Map();
  for (const file of mobileWAVFiles) {
    allFiles.set(file.filename, { ...file, location: 'mobile' });
  }
  for (const file of frontendWAVFiles) {
    if (allFiles.has(file.filename)) {
      allFiles.get(file.filename).location = 'both';
    } else {
      allFiles.set(file.filename, { ...file, location: 'frontend' });
    }
  }

  console.log(`Found ${allFiles.size} WAV files to convert\n`);

  let converted = 0;
  let failed = 0;

  for (const [filename, fileInfo] of allFiles) {
    const mobilePath = path.join(GRAMMAR_DIR, filename);
    const frontendPath = path.join(FRONTEND_DIR, filename);
    const tempMP3 = path.join(__dirname, 'temp-convert.mp3');
    
    // Use mobile file as source if it exists, otherwise frontend
    const sourcePath = fs.existsSync(mobilePath) ? mobilePath : frontendPath;
    
    console.log(`Converting: ${filename}...`);
    if (convertToMP3(sourcePath, tempMP3, ffmpegPath)) {
      // Update both locations
      if (fs.existsSync(mobilePath)) {
        fs.copyFileSync(tempMP3, mobilePath);
      } else {
        fs.copyFileSync(tempMP3, mobilePath);
      }
      if (fs.existsSync(frontendPath)) {
        fs.copyFileSync(tempMP3, frontendPath);
      } else {
        fs.copyFileSync(tempMP3, frontendPath);
      }
      fs.unlinkSync(tempMP3);
      console.log(`✅ Converted: ${filename}`);
      converted++;
    } else {
      console.error(`❌ Failed: ${filename}`);
      if (fs.existsSync(tempMP3)) {
        fs.unlinkSync(tempMP3);
      }
      failed++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Converted: ${converted}`);
  console.log(`   ❌ Failed: ${failed}`);
}

main();


