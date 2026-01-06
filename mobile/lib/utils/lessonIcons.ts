// Helper to get Ionicons name for lesson types (no emojis)
import { Lesson } from '../data/lessons';

export const getLessonIconName = (lesson: Lesson): any => {
  // Special cases for specific lessons
  if (lesson.title.includes('Alphabet')) return 'text-outline';
  if (lesson.title.includes('Numbers')) return 'calculator-outline';
  if (lesson.title.includes('Days')) return 'calendar-outline';
  if (lesson.title.includes('Months')) return 'calendar-number-outline';
  if (lesson.title.includes('Animals')) return 'paw-outline';
  if (lesson.title.includes('Family')) return 'people-outline';
  if (lesson.title.includes('Colors')) return 'color-palette-outline';
  if (lesson.title.includes('Basic Adjectives')) return 'document-text-outline';
  if (lesson.title.includes('Simple Present')) return 'time-outline';
  if (lesson.title.includes('Simple Past')) return 'play-back-outline';
  if (lesson.title.includes('Simple Future')) return 'play-forward-outline';
  if (lesson.title.includes('Sentence Structure')) return 'code-outline';
  if (lesson.title.includes('Articles & Plurals')) return 'library-outline';
  if (lesson.title.includes('Possessive Pronouns')) return 'person-outline';
  if (lesson.title.includes('Prepositions')) return 'location-outline';
  if (lesson.title.includes('Questions & Negation')) return 'help-circle-outline';
  
  // Default by type
  switch (lesson.type) {
    case 'ALPHABET': return 'text-outline';
    case 'NUMBERS': return 'calculator-outline';
    case 'WORDS': return 'document-text-outline';
    case 'GRAMMAR': return 'library-outline';
    case 'TIME': return 'time-outline';
    case 'WEATHER': return 'partly-sunny-outline';
    case 'HOUSE': return 'home-outline';
    case 'FOOD': return 'restaurant-outline';
    case 'CONVERSATIONS': return 'chatbubbles-outline';
    case 'NATURE': return 'leaf-outline';
    case 'BODY': return 'body-outline';
    case 'VERBS': return 'walk-outline';
    default: return 'book-outline';
  }
};

