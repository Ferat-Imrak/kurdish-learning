// Lesson data structure matching frontend
export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: string;
}

export const LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'Alphabet',
    description: 'Learn all 31 letters of the Kurdish alphabet',
    type: 'ALPHABET',
  },
  {
    id: '2',
    title: 'Numbers',
    description: 'Learn numbers from 1 to 20 in Kurdish',
    type: 'NUMBERS',
  },
  {
    id: '3',
    title: 'Days of the Week',
    description: 'Learn the seven days of the week',
    type: 'TIME',
  },
  {
    id: '4',
    title: 'Months of the Year',
    description: 'Learn the twelve months in Kurdish',
    type: 'TIME',
  },
  {
    id: '18',
    title: 'Sentence Structure & Pronouns',
    description: 'Learn word order and essential pronouns',
    type: 'GRAMMAR',
  },
  {
    id: '19',
    title: 'Articles & Plurals',
    description: 'Learn "a/an", "the", "this/that" and making plurals',
    type: 'GRAMMAR',
  },
  {
    id: '21',
    title: 'Possessive Pronouns',
    description: 'Learn how to say "my", "your", "his", "her", "our", "their"',
    type: 'GRAMMAR',
  },
  {
    id: '22',
    title: 'Prepositions',
    description: 'Learn "at", "from", "with", "for", "in", "on" and more',
    type: 'GRAMMAR',
  },
  {
    id: '20',
    title: 'Questions & Negation',
    description: 'Learn how to ask questions and make negative sentences',
    type: 'GRAMMAR',
  },
  {
    id: '15',
    title: 'Simple Present Tense',
    description: 'Learn how to talk about things happening now',
    type: 'GRAMMAR',
  },
  {
    id: '14',
    title: 'Common Verbs',
    description: 'Essential action words for daily conversations',
    type: 'VERBS',
  },
  {
    id: '8',
    title: 'Family Members',
    description: 'Learn family words in Kurdish',
    type: 'WORDS',
  },
  {
    id: '23',
    title: 'Colors',
    description: 'Learn colors in Kurdish',
    type: 'WORDS',
  },
  {
    id: '24',
    title: 'Basic Adjectives',
    description: 'Learn how to describe things: big, small, good, bad, hot, cold, and more',
    type: 'GRAMMAR',
  },
  {
    id: '7',
    title: 'Food & Meals',
    description: 'Learn food vocabulary and meal conversations',
    type: 'FOOD',
  },
  {
    id: '12',
    title: 'Time & Daily Schedule',
    description: 'Learn to tell time and talk about daily activities',
    type: 'TIME',
  },
  {
    id: '6',
    title: 'Things Around the House',
    description: 'Learn vocabulary for items and rooms in the house',
    type: 'HOUSE',
  },
  {
    id: '9',
    title: 'Animals',
    description: 'Learn animal names in Kurdish',
    type: 'WORDS',
  },
  {
    id: '13',
    title: 'Body Parts',
    description: 'Learn vocabulary for human body parts and actions',
    type: 'BODY',
  },
  {
    id: '5',
    title: 'Weather & Seasons',
    description: 'Learn weather vocabulary and descriptions',
    type: 'WEATHER',
  },
  {
    id: '16',
    title: 'Simple Past Tense',
    description: 'Learn how to talk about things that already happened',
    type: 'GRAMMAR',
  },
  {
    id: '17',
    title: 'Simple Future Tense',
    description: 'Learn how to talk about things that will happen',
    type: 'GRAMMAR',
  },
  {
    id: '10',
    title: 'Daily Conversations',
    description: 'Practice conversations and essential phrases in Kurdish',
    type: 'CONVERSATIONS',
  },
  {
    id: '11',
    title: 'Nature',
    description: 'Learn about trees, flowers, mountains, and natural landscapes',
    type: 'NATURE',
  },
];

// Helper function to get lesson icon (emoji)
export const getLessonIcon = (lesson: Lesson): string => {
  if (lesson.title.includes('Alphabet')) return '🔤';
  if (lesson.title.includes('Numbers')) return '🔢';
  if (lesson.title.includes('Days')) return '📅';
  if (lesson.title.includes('Months')) return '📆';
  if (lesson.title.includes('Animals')) return '🐾';
  if (lesson.title.includes('Family')) return '👨‍👩‍👧‍👦';
  if (lesson.title.includes('Colors')) return '🎨';
  if (lesson.title.includes('Basic Adjectives')) return '📝';
  if (lesson.title.includes('Simple Present')) return '⏱️';
  if (lesson.title.includes('Simple Past')) return '⏮️';
  if (lesson.title.includes('Simple Future')) return '⏭️';
  if (lesson.title.includes('Sentence Structure')) return '📝';
  if (lesson.title.includes('Articles & Plurals')) return '📚';
  if (lesson.title.includes('Possessive Pronouns')) return '👤';
  if (lesson.title.includes('Prepositions')) return '📍';
  if (lesson.title.includes('Questions & Negation')) return '❓';
  
  // Default by type
  switch (lesson.type) {
    case 'ALPHABET': return '🔤';
    case 'NUMBERS': return '🔢';
    case 'WORDS': return '📝';
    case 'GRAMMAR': return '📚';
    case 'TIME': return '🕐';
    case 'WEATHER': return '🌤️';
    case 'HOUSE': return '🏠';
    case 'FOOD': return '🍎';
    case 'CONVERSATIONS': return '💬';
    case 'NATURE': return '🌿';
    case 'BODY': return '👁️';
    case 'VERBS': return '🏃';
    default: return '📚';
  }
};

// Helper function to get lesson route
export const getLessonRoute = (lesson: Lesson): string => {
  // Map lesson IDs to routes (matching frontend)
  if (lesson.id === '1') return '/learn/alphabet';
  if (lesson.id === '2') return '/learn/numbers';
  if (lesson.id === '3') return '/learn/days';
  if (lesson.id === '4') return '/learn/months';
  if (lesson.type === 'GRAMMAR' && lesson.title.includes('Simple Present')) return '/learn/simple-present';
  if (lesson.type === 'GRAMMAR' && lesson.title.includes('Simple Past')) return '/learn/simple-past';
  if (lesson.type === 'GRAMMAR' && lesson.title.includes('Simple Future')) return '/learn/simple-future';
  if (lesson.type === 'GRAMMAR' && lesson.title.includes('Sentence Structure')) return '/learn/sentence-structure-pronouns';
  if (lesson.type === 'GRAMMAR' && lesson.title.includes('Articles & Plurals')) return '/learn/articles-plurals';
  if (lesson.type === 'GRAMMAR' && lesson.title.includes('Possessive Pronouns')) return '/learn/possessive-pronouns';
  if (lesson.type === 'GRAMMAR' && lesson.title.includes('Prepositions')) return '/learn/prepositions';
  if (lesson.type === 'GRAMMAR' && lesson.title.includes('Questions & Negation')) return '/learn/questions-negation';
  if (lesson.type === 'WORDS' && lesson.title.includes('Colors')) return '/learn/colors';
  if (lesson.id === '24') return '/learn/basic-adjectives';
  if (lesson.type === 'WORDS' && lesson.title.includes('Family')) return '/learn/family';
  if (lesson.type === 'WORDS' && lesson.title.includes('Animals')) return '/learn/animals';
  if (lesson.type === 'TIME') return '/learn/time';
  if (lesson.type === 'WEATHER') return '/learn/weather';
  if (lesson.type === 'HOUSE') return '/learn/house';
  if (lesson.type === 'FOOD') return '/learn/food';
  if (lesson.type === 'CONVERSATIONS') return '/learn/conversations';
  if (lesson.type === 'NATURE') return '/learn/nature';
  if (lesson.type === 'BODY') return '/learn/body-parts';
  if (lesson.type === 'VERBS') return '/learn/verbs';
  
  return '/learn/kurmanji'; // Default fallback
};

