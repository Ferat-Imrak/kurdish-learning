import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample lessons for Kurmanji
  const kurmanjiAlphabetLesson = await prisma.lesson.create({
    data: {
      title: 'Kurmanji Alphabet - Part 1',
      description: 'Learn the first 8 letters of the Kurmanji alphabet',
      type: 'ALPHABET',
      language: 'KURMANJI',
      difficulty: 'BEGINNER',
      order: 1,
    }
  })

  // Add lesson content for alphabet
  const alphabetContent = [
    {
      type: 'TEXT',
      title: 'Letter A',
      content: JSON.stringify({
        letter: 'A',
        pronunciation: 'ah',
        example: 'av (water)',
        description: 'The first letter of the Kurdish alphabet'
      }),
      audioUrl: '/audio/kurmanji/a.mp3',
      imageUrl: '/images/letters/a.png',
      order: 1,
      lessonId: kurmanjiAlphabetLesson.id
    },
    {
      type: 'TEXT',
      title: 'Letter B',
      content: JSON.stringify({
        letter: 'B',
        pronunciation: 'beh',
        example: 'bav (father)',
        description: 'The second letter of the Kurdish alphabet'
      }),
      audioUrl: '/audio/kurmanji/b.mp3',
      imageUrl: '/images/letters/b.png',
      order: 2,
      lessonId: kurmanjiAlphabetLesson.id
    },
    {
      type: 'TEXT',
      title: 'Letter C',
      content: JSON.stringify({
        letter: 'C',
        pronunciation: 'jeh',
        example: 'çav (eye)',
        description: 'The third letter of the Kurdish alphabet'
      }),
      audioUrl: '/audio/kurmanji/c.mp3',
      imageUrl: '/images/letters/c.png',
      order: 3,
      lessonId: kurmanjiAlphabetLesson.id
    },
    {
      type: 'INTERACTIVE',
      title: 'Practice Letters A, B, C',
      content: JSON.stringify({
        type: 'tracing',
        letters: ['A', 'B', 'C'],
        instructions: 'Trace the letters with your finger'
      }),
      order: 4,
      lessonId: kurmanjiAlphabetLesson.id
    }
  ]

  for (const content of alphabetContent) {
    await prisma.lessonContent.create({
      data: content
    })
  }

  // Create numbers lesson
  const numbersLesson = await prisma.lesson.create({
    data: {
      title: 'Numbers 1-5',
      description: 'Learn to count from 1 to 5 in Kurmanji',
      type: 'NUMBERS',
      language: 'KURMANJI',
      difficulty: 'BEGINNER',
      order: 2,
    }
  })

  const numbersContent = [
    {
      type: 'TEXT',
      title: 'Number 1',
      content: JSON.stringify({
        number: 1,
        kurdish: 'yek',
        pronunciation: 'yek',
        example: 'yek kitêb (one book)'
      }),
      audioUrl: '/audio/kurmanji/1.mp3',
      imageUrl: '/images/numbers/1.png',
      order: 1,
      lessonId: numbersLesson.id
    },
    {
      type: 'TEXT',
      title: 'Number 2',
      content: JSON.stringify({
        number: 2,
        kurdish: 'du',
        pronunciation: 'doo',
        example: 'du kitêb (two books)'
      }),
      audioUrl: '/audio/kurmanji/2.mp3',
      imageUrl: '/images/numbers/2.png',
      order: 2,
      lessonId: numbersLesson.id
    },
    {
      type: 'INTERACTIVE',
      title: 'Count Together',
      content: JSON.stringify({
        type: 'counting',
        numbers: [1, 2, 3, 4, 5],
        instructions: 'Tap the numbers in order'
      }),
      order: 3,
      lessonId: numbersLesson.id
    }
  ]

  for (const content of numbersContent) {
    await prisma.lessonContent.create({
      data: content
    })
  }

  // Create colors lesson
  const colorsLesson = await prisma.lesson.create({
    data: {
      title: 'Basic Colors',
      description: 'Learn colors in Kurmanji',
      type: 'WORDS',
      language: 'KURMANJI',
      difficulty: 'BEGINNER',
      order: 3,
    }
  })

  const colorsContent = [
    {
      type: 'TEXT',
      title: 'Red',
      content: JSON.stringify({
        english: 'red',
        kurdish: 'sor',
        pronunciation: 'sor',
        example: 'sor gul (red rose)'
      }),
      audioUrl: '/audio/kurmanji/red.mp3',
      imageUrl: '/images/colors/red.png',
      order: 1,
      lessonId: colorsLesson.id
    },
    {
      type: 'TEXT',
      title: 'Blue',
      content: JSON.stringify({
        english: 'blue',
        kurdish: 'şîn',
        pronunciation: 'sheen',
        example: 'şîn esman (blue sky)'
      }),
      audioUrl: '/audio/kurmanji/blue.mp3',
      imageUrl: '/images/colors/blue.png',
      order: 2,
      lessonId: colorsLesson.id
    },
    {
      type: 'INTERACTIVE',
      title: 'Color Matching Game',
      content: JSON.stringify({
        type: 'matching',
        items: [
          { color: 'red', word: 'sor' },
          { color: 'blue', word: 'şîn' },
          { color: 'green', word: 'kewş' },
          { color: 'yellow', word: 'zer' }
        ],
        instructions: 'Match the color with the Kurdish word'
      }),
      order: 3,
      lessonId: colorsLesson.id
    }
  ]

  for (const content of colorsContent) {
    await prisma.lessonContent.create({
      data: content
    })
  }

  // Create games
  const flashcardGame = await prisma.game.create({
    data: {
      name: 'Alphabet Flashcards',
      description: 'Practice Kurdish letters with flashcards',
      type: 'FLASHCARDS',
      language: 'KURMANJI',
      difficulty: 'BEGINNER',
    }
  })

  const matchingGame = await prisma.game.create({
    data: {
      name: 'Word Matching',
      description: 'Match Kurdish words with their meanings',
      type: 'MATCHING',
      language: 'KURMANJI',
      difficulty: 'BEGINNER',
    }
  })

  const memoryGame = await prisma.game.create({
    data: {
      name: 'Memory Game',
      description: 'Find matching pairs of Kurdish words',
      type: 'MEMORY',
      language: 'KURMANJI',
      difficulty: 'INTERMEDIATE',
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log(`📚 Created ${await prisma.lesson.count()} lessons`)
  console.log(`🎮 Created ${await prisma.game.count()} games`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

