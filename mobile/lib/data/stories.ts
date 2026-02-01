/**
 * Stories data – same as frontend (stories/page.tsx) for parity.
 * IDs story-9 … story-15; paragraphs { ku, en }[]; vocabularyDict for word tap.
 */

export function getAudioFilename(text: string): string {
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

export type Story = {
  id: string;
  title: string;
  summary: string;
  paragraphs: { ku: string; en: string }[];
};

export const vocabularyDict: Record<string, string> = {
  'sor': 'red',
  'spî': 'white',
  'bax': 'garden',
  'baxê': 'garden (with preposition)',
  'gul': 'flower',
  'gulên': 'flowers',
  'zer': 'yellow',
  'kêf': 'fun',
  'xwest': 'wanted',
  'çilçek': 'bird',
  'şîn': 'blue',
  'dar': 'tree',
  'darê': 'tree (with preposition)',
  'nezdîkî': 'near',
  'rûnişt': 'sat',
  'got': 'said',
  'hez': 'like',
  'dikim': 'I do',
  'bedew': 'beautiful',
  'dawiyê': 'end',
  'hêvî': 'hope',
  'reng': 'color',
  'xweşik': 'nice/beautiful',
  'şêr': 'lion',
  'şêrekî': 'a lion',
  'bihêz': 'mighty',
  'xew': 'sleep',
  'mişk': 'mouse',
  'mişkekî': 'a mouse',
  'piçûk': 'small',
  'pençe': 'paw',
  'pençeya': 'paw (with preposition)',
  'bazda': 'ran',
  'şiyar': 'woke up',
  'girt': 'caught',
  'bixwe': 'eat',
  'ji': 'from',
  'kerema': 'kindness',
  'berde': 'let go',
  'min': 'me',
  'rojekê': 'one day',
  'alîkariya': 'help',
  'bikim': 'I do',
  'kenîya': 'laughed',
  'lê': 'but',
  'berda': 'released',
  'çend': 'few',
  'roj': 'day',
  'şûnda': 'later',
  'tora': 'net',
  'nêçîrvanekî': 'a hunter',
  'asê': 'trapped',
  'ma': 'stayed',
  'dengê': 'voice',
  'bihîst': 'heard',
  'zû': 'quickly',
  'têl': 'rope',
  'xwar': 'chewed',
  'azad': 'free',
  'fêr': 'learned',
  'hevalê': 'friend',
  'ferqek': 'a difference',
  'mezin': 'big',
  'çêbike': 'make',
  'silav': 'hello',
  'tu': 'you',
  'çawa': 'how',
  'yî': 'are',
  'ez': 'I',
  'baş': 'good',
  'im': 'am',
  'spas': 'thank you',
  'jî': 'also',
  'îro': 'today',
  'çi': 'what',
  'dikî': 'you do',
  'diçim': 'I go',
  'bazarê': 'market',
  'nan': 'bread',
  'sêv': 'apple',
  'dixwazim': 'I want',
  'diçî': 'you go',
  'na': 'no',
  'malê': 'home',
  'malbatê': 'family',
  'biaxivim': 'I talk',
  'paşê': 'later',
  'em': 'we',
  'li': 'at',
  'hev': 'each other',
  'bibînin': 'meet',
  'erê': 'yes',
  'bimînim': 'I wait',
  'benda': 'waiting for',
  'te': 'you',
  'piştî': 'after',
  'nîvro': 'noon',
  'werim': 'I come',
  'bim': 'I am',
  'rojbaş': 'goodbye',
  'dayik': 'mother',
  'birinc': 'rice',
  'goşt': 'meat',
  'sebze': 'vegetable',
  'sebzeyan': 'vegetables',
  'xweş': 'delicious',
  'kesk': 'green',
  'amade': 'prepare',
  'dikin': 'we do',
  'bişo': 'wash',
  'deynî': 'put',
  'ser': 'on',
  'mase': 'table',
  'bişom': 'I wash',
  'deynim': 'I put',
  'zarokek': 'a child',
  'kêfxweş': 'happy',
  'hewa': 'weather',
  'ye': 'is',
  'derdikeve': 'comes out',
  'germ': 'warm',
  'dikarin': 'we can',
  'derkevin': 'go out',
  'bilîzin': 'we play',
  'dibînim': 'I see',
  'ewrek': 'a cloud',
  'heye': 'there is',
  'dibe': 'it might',
  'ku': 'that',
  'baran': 'rain',
  'bibare': 'it rains',
  'bimînin': 'we stay',
  'pencereyê': 'window',
  'binêrin': 'we look',
  'dimînim': 'I stay',
  'lîstikan': 'games',
  'odeyê': 'room',
  'de': 'in',
  'bi': 'with',
  're': 'with',
  'bibin': 'we are',
  'belê': 'yes',
  'ajelan': 'animals',
  'du': 'two',
  'pisîk': 'cat',
  'ne': 'are',
  'yek': 'one',
  'se': 'dog',
  'reş': 'black',
  'sê': 'three',
  'balinde': 'bird',
  'difirin': 'they fly',
  'bijmêrim': 'I count',
  'dizanî': 'you know',
  'bibim': 'I become',
  'berîvan': 'Berîvan (name)',
  'roda': 'Rojda (name)',
  'kursî': 'chair',
  'pencereyan': 'windows',
  'nivîn': 'bed',
  'nivînek': 'a bed',
  'odeya': 'room',
  'odeyan': 'rooms',
};

export const stories: Story[] = [
  {
    id: 'story-9',
    title: 'Mişka Spî – The White Mouse',
    summary: 'A story about a white mouse who discovers the beauty of all colors.',
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
    summary: 'A classic fable about kindness and how even small friends can help.',
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
    summary: 'A simple conversation between two friends meeting and talking.',
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
    summary: 'A conversation about food and what to eat for dinner.',
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
    summary: 'A conversation about the weather and what to do.',
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
    summary: 'A conversation about animals and counting them.',
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
    summary: 'A conversation about objects in the house and their colors.',
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

export function extractVocabulary(story: Story): Array<{ word: string; translation: string }> {
  const vocabSet = new Set<string>();
  const vocab: Array<{ word: string; translation: string }> = [];

  story.paragraphs.forEach((para) => {
    const words = para.ku
      .replace(/[.,!?";:]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    words.forEach((word) => {
      const cleanWord = word.toLowerCase().trim();
      if (cleanWord && vocabularyDict[cleanWord] && !vocabSet.has(cleanWord)) {
        vocabSet.add(cleanWord);
        vocab.push({ word: cleanWord, translation: vocabularyDict[cleanWord] });
      }
    });
  });

  return vocab.sort((a, b) => a.word.localeCompare(b.word));
}
