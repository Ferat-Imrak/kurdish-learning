const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = ffmpegInstaller.path;

const audioPath = process.argv[2] || path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3/months/di-cileye-de.mp3');
const newDuration = process.argv[3] || '2.65'; // seconds

if (!fs.existsSync(audioPath)) {
  console.error(`❌ Audio file not found: ${audioPath}`);
  process.exit(1);
}

const tempPath = audioPath.replace('.mp3', '-trimmed.mp3');

console.log(`🔄 Trimming audio to ${newDuration} seconds...`);

try {
  execSync(
    `"${ffmpeg}" -i "${audioPath}" -t ${newDuration} -codec:a copy "${tempPath}" -y -loglevel error`,
    { stdio: 'pipe' }
  );
  
  // Replace original with trimmed version
  fs.renameSync(tempPath, audioPath);
  
  const sizeKB = (fs.statSync(audioPath).size / 1024).toFixed(1);
  console.log(`✅ Successfully trimmed to ${newDuration}s (${sizeKB} KB)`);
  console.log(`📁 Output: ${audioPath}`);
} catch (error) {
  console.error('❌ Trimming failed:', error.message);
  process.exit(1);
}



