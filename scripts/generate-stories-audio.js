/**
 * Generate story paragraph audios using Kurdish TTS (kurdishtts.com).
 * Output: frontend/public/audio/kurdish-tts-mp3/stories/<filename>.mp3 (MP3 via ffmpeg from API WAV).
 * Speaker: kurmanji_12. Only the sentence is spoken: speaker names (e.g. "Dayik:", "Baran:") are stripped
 * via extractSpeechContent() so e.g. "Dayik: Baran, tu çi dixwazî..." → TTS says "Baran, tu çi dixwazî...".
 *
 * Usage: node scripts/generate-stories-audio.js
 * Optional: KURDISH_TTS_API_KEY=your_key node scripts/generate-stories-audio.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const API_KEY = process.env.KURDISH_TTS_API_KEY || '8f183799c5a8be31514135110279812e7bc1229a';
const SPEAKER_ID = 'kurmanji_12';
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/audio/kurdish-tts-mp3/stories');

// Same as Stories page
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

// Strip speaker name (e.g. "Dayik:", "Baran:") so only the sentence is sent to TTS
function extractSpeechContent(text) {
  if (text.includes(':')) {
    const afterColon = text.split(':').slice(1).join(':').trim();
    return afterColon.replace(/^["']|["']$/g, '').trim();
  }
  return text.replace(/^["']|["']$/g, '').trim();
}

// Stories data: same paragraphs as in frontend/src/app/stories/page.tsx
const stories = [
  {
    id: 'story-9',
    title: 'Mişka Spî – The White Mouse',
    paragraphs: [
      { ku: 'Di rojekê de, mişkek spî di nav baxê de dijî.', en: 'One day, a white mouse lived in the garden.' },
      { ku: 'Ew gulên zer dît û kêf xwest.', en: 'She saw yellow flowers and wanted to have fun.' },
      { ku: 'Paşê çiçekek şîn li ser darekê nêzîkî wê rûnişt.', en: 'Then a blue bird sat on a tree near her.' },
      { ku: 'Mişk got: Ez spî me, ez ji zer hez dikim, û şîn jî pir xweşik e!', en: 'The mouse said: "I am white, I like yellow, and blue is also beautiful!"' },
      { ku: 'Di dawiyê de, hêvî got: Her reng xwe xweşik e!', en: 'Finally, hope said: "Every color is beautiful!"' },
    ],
  },
  {
    id: 'story-10',
    title: 'Şêr û Mişk – The Lion and the Mouse',
    paragraphs: [
      { ku: 'Şêrekî bihêz di xew de bû dema ku mişkekî piçûk li ser pençeya wî bazda.', en: 'A mighty lion was sleeping when a tiny mouse ran across his paw.' },
      { ku: 'Şêr şiyar bû, mişk girt û xwest wî bixwe.', en: 'The lion woke up, caught the mouse, and wanted to eat it.' },
      { ku: 'Mişk got: Ji kerema xwe berde min. Rojekê ez ê alîkariya te bikim.', en: 'The mouse said, "Please let me go. One day I will help you."' },
      { ku: 'Şêr kenîya lê mişk berda.', en: 'The lion laughed but released the mouse.' },
      { ku: 'Çend roj şûnda, şêr di tora nêçîrvanekî de asê ma. Mişk dengê wî bihîst, bazda û zû têl xwar.', en: 'A few days later, the lion was trapped in a hunter\'s net. The mouse heard him, ran over, and quickly chewed the ropes.' },
      { ku: 'Şêr azad bû û fêr bû ku hevalê herî piçûk jî dikare ferqek mezin çêbike.', en: 'The lion was freed and learned that even the smallest friend can make a big difference.' },
    ],
  },
  {
    id: 'story-11',
    title: 'Hevpeyvîn – Conversation',
    paragraphs: [
      { ku: 'Baran: Silav! Tu çawa yî?', en: 'Baran: "Hello! How are you?"' },
      { ku: 'Dilan: Silav! Ez baş im, spas. Tu çawa yî?', en: 'Dilan: "Hello! I am fine, thank you. How are you?"' },
      { ku: 'Baran: Ez jî baş im. Îro çi dikî?', en: 'Baran: "I am also fine. What are you doing today?"' },
      { ku: 'Dilan: Ez diçim bazarê. Ez nan û sêv dixwazim. Tu jî diçî bazarê?', en: 'Dilan: "I am going to the market. I want bread and apple. Are you also going to the market?"' },
      { ku: 'Baran: Na, ez diçim malê. Ez dixwazim bi malbatê xwe biaxivim.', en: 'Baran: "No, I am going home. I want to talk with my family."' },
      { ku: 'Dilan: Baş e! Paşê em ê li baxçê hev bibînin?', en: 'Dilan: "Good! Later shall we meet in the garden?"' },
      { ku: 'Baran: Erê, baş e! Ez ê li baxçe li benda te bimînim.', en: 'Baran: "Yes, good! I will wait for you in the garden."' },
      { ku: 'Dilan: Baş e! Ez ê piştî nîvro werim.', en: 'Dilan: "Good! I will come after noon."' },
      { ku: 'Baran: Baş e! Ez ê li benda te bim.', en: 'Baran: "Good! I will wait for you."' },
      { ku: 'Dilan: Spas! Rojbaş!', en: 'Dilan: "Thank you! Goodbye!"' },
      { ku: 'Baran: Rojbaş!', en: 'Baran: "Goodbye!"' },
    ],
  },
  {
    id: 'story-12',
    title: 'Hevpeyvîna Xwarinê – Food Conversation',
    paragraphs: [
      { ku: 'Dayik: Baran, tu çi dixwazî ji bo xwarina êvarê?', en: 'Mother: "Baran, what do you want for dinner?"' },
      { ku: 'Baran: Ez birinc û goşt dixwazim. Tu jî çi dixwazî?', en: 'Baran: "I want rice and meat. What do you also want?"' },
      { ku: 'Dayik: Ez nan û sebze dixwazim. Sebze xweş e.', en: 'Mother: "I want bread and vegetables. Vegetables are delicious."' },
      { ku: 'Baran: Baş e! Ez jî sebze hez dikim. Sebze kesk in.', en: 'Baran: "Good! I also like vegetables. Vegetables are green."' },
      { ku: 'Dayik: Erê, sebze kesk û xweş in. Em nan, birinc, goşt û sebze amade dikin.', en: 'Mother: "Yes, vegetables are green and delicious. We prepare bread, rice, meat, and vegetables."' },
      { ku: 'Baran: Baş e! Ez dixwazim alîkariya te bikim.', en: 'Baran: "Good! I want to help you."' },
      { ku: 'Dayik: Spas! Tu dikarî sebzeyan bişo û deynî ser mase.', en: 'Mother: "Thank you! You can wash the vegetables and put them on the table."' },
      { ku: 'Baran: Baş e! Ez ê sebzeyan bişom û deynim ser mase.', en: 'Baran: "Good! I will wash the vegetables and put them on the table."' },
      { ku: 'Dayik: Spas, Baran! Tu zarokek baş î.', en: 'Mother: "Thank you, Baran! You are a good child."' },
      { ku: 'Baran: Spas, dayik! Ez ji alîkariya te kêfxweş im.', en: 'Baran: "Thank you, mother! I am happy to help you."' },
    ],
  },
  {
    id: 'story-13',
    title: 'Hevpeyvîna Hewayê – Weather Conversation',
    paragraphs: [
      { ku: 'Rojin: Silav, Hêvî! Îro hewa çawa ye?', en: 'Rojin: "Hello, Hêvî! How is the weather today?"' },
      { ku: 'Hêvî: Silav, Rojin! Îro roj derdikeve. Hewa germ e.', en: 'Hêvî: "Hello, Rojin! Today the sun comes out. The weather is warm."' },
      { ku: 'Rojin: Baş e! Em dikarin derkevin baxçe û bilîzin.', en: 'Rojin: "Good! We can go out to the garden and play."' },
      { ku: 'Hêvî: Erê, baş e! Lê ez dibînim ku ewrek heye. Dibe ku baran bibare.', en: 'Hêvî: "Yes, good! But I see there is a cloud. It might rain."' },
      { ku: 'Rojin: Baş e! Em dikarin li malê bimînin û li pencereyê binêrin.', en: 'Rojin: "Good! We can stay at home and look at the window."' },
      { ku: 'Hêvî: Baş e! Ez jî li malê dimînim. Em dikarin lîstikan bilîzin.', en: 'Hêvî: "Good! I also stay at home. We can play games."' },
      { ku: 'Rojin: Baş e! Em ê di odeyê de bilîzin.', en: 'Rojin: "Good! We will play in the room."' },
      { ku: 'Hêvî: Baş e! Ez ê bi te re werim.', en: 'Hêvî: "Good! I will come with you."' },
      { ku: 'Rojin: Spas, Hêvî! Em ê kêfxweş bibin.', en: 'Rojin: "Thank you, Hêvî! We will be happy."' },
      { ku: 'Hêvî: Belê, em ê kêfxweş bibin.', en: 'Hêvî: "Yes, we will be happy!"' },
    ],
  },
  {
    id: 'story-14',
    title: 'Hevpeyvîna Ajelan – Animals Conversation',
    paragraphs: [
      { ku: 'Ava: Silav, Dara! Tu çi dikî?', en: 'Ava: "Hello, Dara! What are you doing?"' },
      { ku: 'Dara: Silav, Ava! Ez li baxçê me. Ez ajelan dibînim.', en: 'Dara: "Hello, Ava! I am in our garden. I see animals."' },
      { ku: 'Ava: Baş e! Tu çend ajel dibînî?', en: 'Ava: "Good! How many animals do you see?"' },
      { ku: 'Dara: Ez du pisîk dibînim. Pisîk spî ne. Ez yek se dibînim. Se reş e.', en: 'Dara: "I see two cats. The cats are white. I see one dog. The dog is black."' },
      { ku: 'Ava: Baş e! Ez jî ajel hez dikim. Tu çend balinde dibînî?', en: 'Ava: "Good! I also like animals. How many birds do you see?"' },
      { ku: 'Dara: Ez sê balinde dibînim. Balinde şîn in. Balinde difirin.', en: 'Dara: "I see three birds. The birds are blue. The birds fly."' },
      { ku: 'Ava: Baş e! Em dikarin ajelan binêrin û hejmaran fêr bibin.', en: 'Ava: "Good! We can look at animals and learn numbers."' },
      { ku: 'Dara: Baş e! Ez ê ajelan bijmêrim. Yek, du, sê, çar, pênc.', en: 'Dara: "Good! I will count the animals. One, two, three, four, five."' },
      { ku: 'Ava: Baş e! Tu ajelan baş dizanî. Ez jî dixwazim ajelan fêr bibim.', en: 'Ava: "Good! You know animals well. I also want to learn animals."' },
      { ku: 'Dara: Baş e! Em dikarin bi hev re ajelan fêr bibin.', en: 'Dara: "Good! We can learn animals together."' },
    ],
  },
  {
    id: 'story-15',
    title: 'Hevpeyvîna Malê – House Conversation',
    paragraphs: [
      { ku: 'Berîvan: Silav, Rojda! Tu li ku yî?', en: 'Berîvan: "Hello, Rojda! Where are you?"' },
      { ku: 'Rojda: Silav, Berîvan! Ez li malê me. Ez li odeyê me.', en: 'Rojda: "Hello, Berîvan! I am in our house. I am in my room."' },
      { ku: 'Berîvan: Baş e! Di odeyê de çi heye?', en: 'Berîvan: "Good! What is in the room?"' },
      { ku: 'Rojda: Di odeyê de mase heye. Mase sor e. Di odeyê de kursî heye. Kursî kesk e.', en: 'Rojda: "In the room there is a table. The table is red. In the room there is a chair. The chair is green."' },
      { ku: 'Berîvan: Baş e! Tu çend pencere dibînî?', en: 'Berîvan: "Good! How many windows do you see?"' },
      { ku: 'Rojda: Ez du pencereyan dibînim. Pencere şîn in. Pencere xweşik in.', en: 'Rojda: "I see two windows. The windows are blue. The windows are nice."' },
      { ku: 'Berîvan: Baş e! Di odeyê de nivîn heye?', en: 'Berîvan: "Good! Is there a bed in the room?"' },
      { ku: 'Rojda: Erê, nivînek heye. Nivîn spî ye.', en: 'Rojda: "Yes, there is a bed. The bed is white."' },
      { ku: 'Berîvan: Baş e! Odeya te xweş e. Ez jî dixwazim odeya xwe bibînim.', en: 'Berîvan: "Good! Your room is nice. I also want to see my room."' },
      { ku: 'Rojda: Baş e! Em dikarin bi hev re odeyan bibînin.', en: 'Rojda: "Good! We can see the rooms together."' },
    ],
  },
];

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
      if (ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) return ffmpegInstaller.path;
    } catch (e) {}
    return null;
  } catch (e) {
    return null;
  }
}

function generateAudio(text, filename) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(OUTPUT_DIR, `${filename}.mp3`);

    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipped (exists): ${filename}.mp3`);
      resolve({ skipped: true });
      return;
    }

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
      },
      timeout: 45000
    };

    console.log(`📝 Generating: "${text.substring(0, 50)}${text.length > 50 ? '…' : ''}" -> ${filename}.mp3`);

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          const errorBody = Buffer.concat(chunks).toString();
          const msg = errorBody.length > 200 ? errorBody.substring(0, 200) : errorBody;
          reject(new Error(`HTTP ${res.statusCode}: ${msg}`));
          return;
        }

        const wavBuffer = Buffer.concat(chunks);
        if (wavBuffer.length < 1000) {
          reject(new Error(`Response too small (${wavBuffer.length} bytes)`));
          return;
        }

        const tempWavPath = path.join(__dirname, 'temp-stories-audio.wav');
        fs.writeFileSync(tempWavPath, wavBuffer);

        const ffmpegPath = getFfmpegPath();
        if (ffmpegPath) {
          try {
            execSync(`"${ffmpegPath}" -i "${tempWavPath}" -acodec libmp3lame -ab 128k -y "${outputPath}"`, { stdio: 'ignore' });
            fs.unlinkSync(tempWavPath);
            console.log(`✅ Generated: ${filename}.mp3`);
            resolve({ success: true });
          } catch (convertError) {
            fs.copyFileSync(tempWavPath, outputPath.replace('.mp3', '.wav'));
            fs.unlinkSync(tempWavPath);
            console.warn(`⚠️  Saved as WAV: ${filename}.mp3 (ffmpeg failed)`);
            resolve({ success: true });
          }
        } else {
          fs.renameSync(tempWavPath, outputPath.replace('.mp3', '.wav'));
          console.warn(`⚠️  Saved as WAV (no ffmpeg): ${filename}`);
          resolve({ success: true });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Generating story paragraph audios (Kurdish TTS)...\n');
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const seen = new Set();
  const audioFiles = [];

  for (const story of stories) {
    for (const p of story.paragraphs) {
      const cleanText = extractSpeechContent(p.ku);
      if (!cleanText) continue;
      const filename = getAudioFilename(cleanText);
      if (seen.has(filename)) continue;
      seen.add(filename);
      audioFiles.push({ text: cleanText, filename });
    }
  }

  console.log(`Total unique paragraphs to generate: ${audioFiles.length}\n`);

  let success = 0, skipped = 0, failed = 0;
  const failedFiles = [];

  for (let i = 0; i < audioFiles.length; i++) {
    const { text, filename } = audioFiles[i];
    try {
      const result = await generateAudio(text, filename);
      if (result.skipped) skipped++;
      else if (result.success) success++;
    } catch (error) {
      console.error(`❌ Failed: ${filename}.mp3 - ${error.message}`);
      failed++;
      failedFiles.push({ filename, text: text.substring(0, 40), error: error.message });
      await new Promise(r => setTimeout(r, 3000));
    }
    if (i < audioFiles.length - 1) {
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  console.log('\n📊 Results:');
  console.log(`   ✅ Generated: ${success}`);
  console.log(`   ⏭️  Skipped (exists): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  if (failed > 0 && failedFiles.length) {
    console.log('\n   Failed files:');
    failedFiles.forEach(f => console.log(`   - ${f.filename}.mp3`));
  }
  if (success > 0 || skipped > 0) {
    console.log('\n✅ Story audio generation complete.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
