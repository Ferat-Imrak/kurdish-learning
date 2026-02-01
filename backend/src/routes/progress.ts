import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Helper: get or create default child for user (same logic as lesson progress)
async function getOrCreateChild(userId: string) {
  let child = await prisma.child.findFirst({
    where: { parentId: userId, name: 'Default' }
  })
  if (!child) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.name) {
      child = await prisma.child.findFirst({
        where: { parentId: userId, name: user.name }
      })
      if (child) {
        child = await prisma.child.update({
          where: { id: child.id },
          data: { name: 'Default' }
        })
      }
    }
    if (!child) {
      child = await prisma.child.create({
        data: { parentId: userId, name: 'Default', age: 0, language: 'KURMANJI' }
      })
    }
  }
  return child
}

// --- Games progress (sync between frontend and mobile) ---
// GET /api/progress/games - get all games progress for authenticated user
router.get('/games', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    const child = await getOrCreateChild(userId)
    const row = await prisma.gamesProgress.findUnique({
      where: { childId: child.id }
    })
    const data = (row?.data as Record<string, unknown>) ?? {}
    return res.json({ data })
  } catch (error: any) {
    console.error('GET /progress/games error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// POST /api/progress/games/sync - save full games progress (merge with existing per-key "best" value)
router.post('/games/sync', authenticateToken, [
  body('data').isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    const child = await getOrCreateChild(userId)
    const incoming = req.body.data as Record<string, unknown>
    const existing = await prisma.gamesProgress.findUnique({
      where: { childId: child.id }
    })
    const existingData = (existing?.data as Record<string, unknown>) ?? {}
    const merged = { ...existingData }
    for (const [key, value] of Object.entries(incoming)) {
      if (value === undefined) continue
      const prev = merged[key]
      merged[key] = takeBestGamesProgress(key, prev, value)
    }
    await prisma.gamesProgress.upsert({
      where: { childId: child.id },
      create: { childId: child.id, data: merged },
      update: { data: merged }
    })
    return res.json({ data: merged })
  } catch (error: any) {
    console.error('POST /progress/games/sync error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

function takeBestGamesProgress(key: string, a: unknown, b: unknown): unknown {
  if (a == null) return b
  if (b == null) return a
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b)
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    const ao = a as Record<string, unknown>
    const bo = b as Record<string, unknown>
    if ('score' in ao && 'total' in ao && 'score' in bo && 'total' in bo) {
      const ra = (ao.total as number) > 0 ? (ao.score as number) / (ao.total as number) : 0
      const rb = (bo.total as number) > 0 ? (bo.score as number) / (bo.total as number) : 0
      return ra >= rb ? a : b
    }
    if ('correct' in ao && 'total' in ao && 'correct' in bo && 'total' in bo) {
      const ca = (ao.correct as number) >= (ao.total as number) ? 1 : 0
      const cb = (bo.correct as number) >= (bo.total as number) ? 1 : 0
      if (ca !== cb) return ca > cb ? a : b
      return (ao.correct as number) >= (bo.correct as number) ? a : b
    }
    if ('completed' in ao && 'total' in ao && 'completed' in bo && 'total' in bo) {
      const pa = (ao.total as number) > 0 ? (ao.completed as number) / (ao.total as number) : 0
      const pb = (bo.total as number) > 0 ? (bo.completed as number) / (bo.total as number) : 0
      return pa >= pb ? a : b
    }
    if ('uniqueWords' in ao && 'uniqueWords' in bo) {
      return (ao.uniqueWords as number) >= (bo.uniqueWords as number) ? a : b
    }
    if ('completed' in ao && typeof ao.completed === 'boolean' && 'completed' in bo && typeof bo.completed === 'boolean') {
      return (ao.completed === true || bo.completed === true) ? { ...ao, completed: true } : a
    }
  }
  return b
}

// Apply authentication to all user-level routes
router.use('/user', authenticateToken)

// User-level progress endpoints (must come BEFORE /:lessonId to avoid route conflicts)

// Delete all progress for the authenticated user
router.delete('/user', async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Find the default child for the user
    let child = await prisma.child.findFirst({
      where: {
        parentId: userId,
        name: 'Default'
      }
    })

    // Fallback: check for child with user's name
    if (!child) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (user?.name) {
        child = await prisma.child.findFirst({
          where: {
            parentId: userId,
            name: user.name
          }
        })
      }
    }

    if (child) {
      // Delete all progress records for this child
      await prisma.progress.deleteMany({
        where: {
          childId: child.id
        }
      })
      console.log(`🗑️ DELETE /user: Cleared all progress for user ${userId}, child ${child.id}`)
    }

    return res.json({ message: 'Progress cleared successfully' })
  } catch (error: any) {
    console.error('Error clearing progress:', error)
    return res.status(500).json({ message: 'Failed to clear progress', error: error.message })
  }
})

// Get all progress for the authenticated user
router.get('/user', async (req, res) => {
  try {
    const userId = req.user?.id
    const userEmail = req.user?.email

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Get or create a default child for the user
    // IMPORTANT: Always use 'Default' name to ensure consistency between GET and SYNC endpoints
    // But also check for existing children with user's name (for migration from old code)
    let child = await prisma.child.findFirst({
      where: {
        parentId: userId,
        name: 'Default'
      }
    })

    // Fallback: If no "Default" child, check for child with user's name (migration from old code)
    if (!child) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (user?.name) {
        child = await prisma.child.findFirst({
          where: {
            parentId: userId,
            name: user.name
          }
        })
        
        // If found, rename it to "Default" for consistency
        if (child) {
          console.log(`🔄 GET /user: Found child with user's name "${user.name}", renaming to "Default"`);
          child = await prisma.child.update({
            where: { id: child.id },
            data: { name: 'Default' }
          })
          console.log(`👶 GET /user: Renamed child ${child.id} to "Default" for user ${userId}`);
        }
      }
    }

    // If still no child, create a new one
    if (!child) {
      child = await prisma.child.create({
        data: {
          parentId: userId,
          name: 'Default', // Always use 'Default' for consistency
          age: 0,
          language: 'KURMANJI'
        }
      })
      console.log(`👶 GET /user: Created default child ${child.id} for user ${userId}`);
    } else {
      console.log(`👶 GET /user: Using existing child ${child.id} for user ${userId}`);
    }

    const progress = await prisma.progress.findMany({
      where: { childId: child.id },
      include: {
        lesson: true
      },
      orderBy: { updatedAt: 'desc' }
    })
    
    // Enhanced debug logging
    console.log(`📊 GET /user: User ${userId} (${userEmail || 'no email'}) - Child ${child.id} - Found ${progress.length} progress records`);
    if (progress.length > 0) {
      progress.forEach(p => {
        console.log(`  📚 Lesson ${p.lessonId}: progress=${p.score || 0}%, status=${p.status}`);
      });
    }

    // Transform to match frontend/mobile format
    // Note: score field stores overall progress (schema limitation)
    // Return score as undefined to avoid confusion (mobile app should use progress field)
    const formattedProgress = progress.reduce((acc, p) => {
      const overallProgress = p.score || 0
      acc[p.lessonId] = {
        lessonId: p.lessonId,
        progress: overallProgress, // Overall lesson progress (stored in score field)
        status: p.status,
        lastAccessed: p.updatedAt,
        score: undefined, // Don't return score - it's the same as progress (prevents confusion)
        timeSpent: p.timeSpent ? Math.floor(p.timeSpent / 60) : 0 // Convert seconds to minutes
      }
      return acc
    }, {} as Record<string, any>)

    console.log(`📊 Backend GET /user: Returning ${Object.keys(formattedProgress).length} lessons`);
    if (formattedProgress['1']) {
      console.log(`📊 Backend GET /user: Alphabet progress:`, formattedProgress['1']);
    }

    res.json({ progress: formattedProgress })
  } catch (error) {
    console.error('Get user progress error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Bulk update progress (for syncing) - must come before /user/:lessonId
router.post('/user/sync', [
  body('progress').isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { progress } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Get or create a default child for the user
    // IMPORTANT: Always use 'Default' name to ensure consistency between GET and SYNC endpoints
    let child = await prisma.child.findFirst({
      where: {
        parentId: userId,
        name: 'Default'
      }
    })

    if (!child) {
      // Create default child for user (always use 'Default' name)
      child = await prisma.child.create({
        data: {
          parentId: userId,
          name: 'Default', // Always use 'Default' for consistency
          age: 0,
          language: 'KURMANJI'
        }
      })
      console.log(`👶 SYNC /user: Created default child ${child.id} for user ${userId}`);
    } else {
      console.log(`👶 SYNC /user: Using existing child ${child.id} for user ${userId}`);
    }

    // Sync all progress records
    const syncedProgress: Record<string, any> = {}
    
    for (const [lessonId, lessonData] of Object.entries(progress)) {
      const data = lessonData as any
      
      // Ensure lesson exists in database (create if it doesn't)
      let lesson = await prisma.lesson.findUnique({
        where: { id: lessonId }
      })

      if (!lesson) {
        // Lesson doesn't exist - create it with basic info
        // Map lesson IDs to their metadata (matching frontend/mobile lessons)
        const lessonMetadata: Record<string, { title: string; type: 'ALPHABET' | 'NUMBERS' | 'WORDS'; order: number }> = {
          '1': { title: 'Alphabet', type: 'ALPHABET', order: 1 },
          '2': { title: 'Numbers', type: 'NUMBERS', order: 2 },
          '3': { title: 'Days of the Week', type: 'NUMBERS', order: 3 },
          '4': { title: 'Months of the Year', type: 'NUMBERS', order: 4 },
          '5': { title: 'Weather & Seasons', type: 'WORDS', order: 5 },
          '6': { title: 'Things Around the House', type: 'WORDS', order: 6 },
          '7': { title: 'Food & Meals', type: 'WORDS', order: 7 },
          '8': { title: 'Family Members', type: 'WORDS', order: 8 },
          '9': { title: 'Animals', type: 'WORDS', order: 9 },
          '12': { title: 'Time & Daily Schedule', type: 'NUMBERS', order: 12 },
          '13': { title: 'Body Parts', type: 'WORDS', order: 13 },
          '14': { title: 'Common Verbs', type: 'WORDS', order: 14 },
          '15': { title: 'Simple Present Tense', type: 'WORDS', order: 15 },
          '16': { title: 'Simple Past Tense', type: 'WORDS', order: 16 },
          '17': { title: 'Simple Future Tense', type: 'WORDS', order: 17 },
          '18': { title: 'Sentence Structure & Pronouns', type: 'WORDS', order: 18 },
          '19': { title: 'Articles & Plurals', type: 'WORDS', order: 19 },
          '20': { title: 'Questions & Negation', type: 'WORDS', order: 20 },
          '21': { title: 'Possessive Pronouns', type: 'WORDS', order: 21 },
          '22': { title: 'Prepositions', type: 'WORDS', order: 22 },
          '23': { title: 'Colors', type: 'WORDS', order: 23 },
          '24': { title: 'Basic Adjectives', type: 'WORDS', order: 24 },
          '25': { title: 'Daily Conversations', type: 'WORDS', order: 25 },
          '26': { title: 'Nature', type: 'WORDS', order: 26 },
        }

        const metadata = lessonMetadata[lessonId] || {
          title: `Lesson ${lessonId}`,
          type: 'WORDS' as const,
          order: parseInt(lessonId) || 999
        }

        try {
          lesson = await prisma.lesson.create({
            data: {
              id: lessonId, // Use the provided ID explicitly (overrides @default(cuid()))
              title: metadata.title,
              description: `Learn ${metadata.title.toLowerCase()}`,
              type: metadata.type,
              language: 'KURMANJI',
              difficulty: 'BEGINNER',
              order: metadata.order,
              isActive: true
            }
          })
          console.log(`✅ Created lesson ${lessonId}: ${metadata.title}`)
        } catch (error: any) {
          console.error(`❌ Failed to create lesson ${lessonId}:`, error.message)
          // Skip this lesson if creation fails
          continue
        }
      }
      
      // Merge with existing progress (take highest progress, latest timestamp)
      const existing = await prisma.progress.findUnique({
        where: {
          childId_lessonId: {
            childId: child.id,
            lessonId
          }
        }
      })

      // Progress is the overall lesson progress (audio + time + practice)
      // The database stores overall progress in the 'score' field (schema limitation)
      // We need to store overall progress in score, but also track practice separately if possible
      let finalProgress = data.progress !== undefined ? data.progress : (existing?.score || 0)
      let finalStatus = data.status || 'IN_PROGRESS'
      
      // Score handling: 
      // - If score is explicitly provided AND different from progress, it represents practice completion
      // - Otherwise, score should store overall progress (for database compatibility)
      // For now, we'll store overall progress in score (since that's what the schema uses)
      // and only use a separate practice score if it's explicitly provided and different
      let finalScore: number | null = null
      if (data.score !== undefined && data.score !== data.progress) {
        // Score is different from progress - this is practice-specific
        // Store overall progress in score, but we'll need to track practice separately
        // For now, just store overall progress
        finalScore = finalProgress
      } else if (data.progress !== undefined) {
        // Progress was provided - store it in score (overall progress)
        finalScore = finalProgress
      } else if (existing) {
        // No new data - preserve existing
        finalScore = existing.score
        finalProgress = existing.score || 0
      }
      
      // Validate and convert timeSpent (mobile sends in minutes, we store in seconds)
      // Max reasonable time: 10000 minutes (~166 hours) - if larger, likely a bug (milliseconds/timestamp)
      let finalTimeSpent: number | null = null
      if (data.timeSpent !== undefined && data.timeSpent !== null) {
        const timeSpentMinutes = Number(data.timeSpent)
        
        // Debug log to catch the issue
        if (timeSpentMinutes > 10000) {
          console.warn(`⚠️ Received suspicious timeSpent value: ${timeSpentMinutes} (likely milliseconds or timestamp)`)
        }
        
        // If timeSpent is unreasonably large (> 10000 minutes), it's likely in milliseconds or a timestamp
        // Convert milliseconds to minutes: divide by 60000
        // Or if it's a timestamp, it would be even larger
        if (timeSpentMinutes > 10000) {
          // Likely in milliseconds - convert to minutes first
          const timeSpentMs = timeSpentMinutes
          const timeSpentMinutesCorrected = timeSpentMs / 60000
          if (timeSpentMinutesCorrected <= 10000) {
            // Valid after conversion - use it
            finalTimeSpent = Math.floor(timeSpentMinutesCorrected * 60) // Convert to seconds
            console.log(`✅ Converted timeSpent from ${timeSpentMinutes}ms to ${finalTimeSpent}s`)
          } else {
            // Still too large - might be a timestamp, reset to 0 or existing
            console.warn(`⚠️ Invalid timeSpent value: ${timeSpentMinutes} (${timeSpentMinutesCorrected} minutes). Resetting to existing or 0.`)
            finalTimeSpent = existing?.timeSpent || 0
          }
        } else if (timeSpentMinutes >= 0 && timeSpentMinutes <= 10000) {
          // Valid time in minutes - convert to seconds
          finalTimeSpent = Math.floor(timeSpentMinutes * 60)
        } else {
          // Negative or invalid - use existing or 0
          console.warn(`⚠️ Invalid timeSpent value: ${timeSpentMinutes}. Using existing or 0.`)
          finalTimeSpent = existing?.timeSpent || 0
        }
      } else if (existing?.timeSpent !== undefined && existing?.timeSpent !== null) {
        // No new time provided - keep existing, but validate it first
        const existingTime = Number(existing.timeSpent)
        // Validate existing timeSpent (should be in seconds, max 10M seconds = ~115 days)
        if (existingTime > 0 && existingTime <= 10000000) {
          finalTimeSpent = Math.floor(existingTime)
        } else {
          console.warn(`⚠️ Existing timeSpent is corrupted: ${existingTime}. Resetting to 0.`)
          finalTimeSpent = 0
        }
      } else {
        // No time at all - set to 0
        finalTimeSpent = 0
      }
      
      // Final safeguard: ensure finalTimeSpent is a valid integer within INT4 range
      // INT4 max: 2,147,483,647 (seconds = ~68 years, way more than reasonable)
      // But let's cap at 10,000,000 seconds (~115 days) to be safe
      if (finalTimeSpent !== null && (finalTimeSpent < 0 || finalTimeSpent > 10000000)) {
        console.error(`❌ finalTimeSpent out of bounds: ${finalTimeSpent}. Resetting to 0.`)
        finalTimeSpent = 0
      }
      
      // Ensure it's an integer and not null
      if (finalTimeSpent === null || isNaN(finalTimeSpent)) {
        finalTimeSpent = 0
      } else {
        finalTimeSpent = Math.floor(finalTimeSpent)
      }
      
      // Debug log before database operation
      if (finalTimeSpent > 1000000) {
        console.warn(`⚠️ Warning: finalTimeSpent is very large: ${finalTimeSpent} seconds (${Math.floor(finalTimeSpent / 60)} minutes)`)
      }
      
      let finalLastAccessed = data.lastAccessed ? new Date(data.lastAccessed) : new Date()

      // Merge logic: take highest progress, latest timestamp
      if (existing) {
        const existingProgress = existing.score || 0
        const existingTime = existing.updatedAt.getTime()
        const newTime = finalLastAccessed.getTime()

        // Take HIGHER progress value
        if (finalProgress > existingProgress) {
          // New progress is higher - use it
          finalStatus = finalStatus || existing.status
        } else if (existingProgress > finalProgress) {
          // Existing progress is higher - keep it
          finalProgress = existingProgress
          finalStatus = existing.status
          // Don't update lastAccessed if keeping existing progress
          if (existingTime > newTime) {
            finalLastAccessed = existing.updatedAt
          }
        } else {
          // Same progress - take latest time when progress is equal
          if (existingTime > newTime) {
            finalLastAccessed = existing.updatedAt
          }
        }

        // Take latest time (unless we already handled it above)
        if (finalProgress <= existingProgress && existingTime > newTime) {
          finalLastAccessed = existing.updatedAt
        }

        // Time spent: mobile app sends TOTAL time (base + session) in minutes
        // So we should use the provided timeSpent directly (after converting to seconds)
        // Don't add to existing - the mobile app already calculated the total
        // Note: finalTimeSpent is already set above, so we don't need to overwrite it here
        // Only use existing.timeSpent if finalTimeSpent is null/undefined AND existing is valid
        if (finalTimeSpent === null || finalTimeSpent === undefined) {
          if (existing.timeSpent !== null && existing.timeSpent !== undefined) {
            // Validate existing timeSpent before using it
            const existingTime = Number(existing.timeSpent)
            if (existingTime > 0 && existingTime <= 10000000) {
              finalTimeSpent = Math.floor(existingTime)
            } else {
              // Existing is corrupted - use 0
              finalTimeSpent = 0
            }
          } else {
            finalTimeSpent = 0
          }
        }
        // If finalTimeSpent is already set (even if 0), don't overwrite it
        
        // Preserve existing score if new score wasn't provided
        if (finalScore === null && existing.score !== null) {
          finalScore = existing.score
        }
      }

      const progressRecord = await prisma.progress.upsert({
        where: {
          childId_lessonId: {
            childId: child.id,
            lessonId
          }
        },
        update: {
          status: finalStatus,
          score: finalScore,
          timeSpent: finalTimeSpent,
          updatedAt: finalLastAccessed
        },
        create: {
          childId: child.id,
          lessonId,
          status: finalStatus,
          score: finalScore,
          timeSpent: finalTimeSpent,
          attempts: 1,
          completedAt: (finalStatus === 'COMPLETED' || finalStatus === 'MASTERED') ? new Date() : undefined
        }
      })

      // Return overall progress (stored in score field) as progress
      // Only return score separately if it represents practice (which we can't distinguish yet)
      // For now, always return undefined for score to avoid confusion
      const overallProgress = progressRecord.score || 0
      
      syncedProgress[lessonId] = {
        lessonId: progressRecord.lessonId,
        progress: overallProgress, // Overall lesson progress (stored in score field)
        status: progressRecord.status,
        lastAccessed: progressRecord.updatedAt,
        score: undefined, // Don't return score - it's the same as progress (prevents confusion)
        timeSpent: progressRecord.timeSpent ? Math.floor(progressRecord.timeSpent / 60) : 0
      }
      
      console.log(`📊 Backend: Synced lesson ${lessonId} - progress: ${overallProgress}, status: ${progressRecord.status}`)
    }

    res.json({
      message: 'Progress synced successfully',
      progress: syncedProgress
    })
  } catch (error) {
    console.error('Sync progress error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Update or create progress for a specific lesson (user-level)
router.post('/user/:lessonId', [
  body('status').isIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MASTERED']).optional(),
  body('progress').optional().isInt({ min: 0, max: 100 }),
  body('score').optional().isInt({ min: 0, max: 100 }),
  body('timeSpent').optional().isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { lessonId } = req.params
    const { status, progress, score, timeSpent } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Get or create a default child for the user
    let child = await prisma.child.findFirst({
      where: {
        parentId: userId,
        name: 'Default'
      }
    })

    if (!child) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      child = await prisma.child.create({
        data: {
          parentId: userId,
          name: user?.name || 'Default',
          age: 0,
          language: 'KURMANJI'
        }
      })
    }

    // Determine status - use provided status or infer from progress
    let finalStatus = status
    if (!finalStatus && progress !== undefined) {
      if (progress === 0) {
        finalStatus = 'NOT_STARTED'
      } else if (progress === 100) {
        finalStatus = 'COMPLETED'
      } else {
        finalStatus = 'IN_PROGRESS'
      }
    }

    // Use progress as score if score not provided
    const finalScore = score !== undefined ? score : (progress !== undefined ? progress : null)
    const finalTimeSpent = timeSpent ? timeSpent * 60 : null // Convert minutes to seconds

    // Update or create progress
    const progressRecord = await prisma.progress.upsert({
      where: {
        childId_lessonId: {
          childId: child.id,
          lessonId
        }
      },
      update: {
        status: finalStatus || 'IN_PROGRESS',
        score: finalScore,
        timeSpent: finalTimeSpent,
        attempts: { increment: 1 },
        completedAt: (finalStatus === 'COMPLETED' || finalStatus === 'MASTERED') ? new Date() : undefined
      },
      create: {
        childId: child.id,
        lessonId,
        status: finalStatus || 'IN_PROGRESS',
        score: finalScore,
        timeSpent: finalTimeSpent,
        attempts: 1,
        completedAt: (finalStatus === 'COMPLETED' || finalStatus === 'MASTERED') ? new Date() : undefined
      }
    })

    res.json({
      message: 'Progress updated successfully',
      progress: {
        lessonId: progressRecord.lessonId,
        progress: progressRecord.score || 0,
        status: progressRecord.status,
        lastAccessed: progressRecord.updatedAt,
        score: progressRecord.score || undefined,
        timeSpent: progressRecord.timeSpent ? Math.floor(progressRecord.timeSpent / 60) : 0
      }
    })
  } catch (error) {
    console.error('Update user progress error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Update lesson progress (child-based - keep for backward compatibility)
router.post('/:lessonId', [
  body('childId').isString(),
  body('status').isIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MASTERED']),
  body('score').optional().isInt({ min: 0, max: 100 }),
  body('timeSpent').optional().isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { lessonId } = req.params
    const { childId, status, score, timeSpent } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Verify child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parentId: userId
      }
    })

    if (!child) {
      return res.status(404).json({ message: 'Child not found' })
    }

    // Update or create progress
    const progress = await prisma.progress.upsert({
      where: {
        childId_lessonId: {
          childId,
          lessonId
        }
      },
      update: {
        status,
        score,
        timeSpent,
        attempts: { increment: 1 },
        completedAt: status === 'COMPLETED' || status === 'MASTERED' ? new Date() : undefined
      },
      create: {
        childId,
        lessonId,
        status,
        score,
        timeSpent,
        attempts: 1,
        completedAt: status === 'COMPLETED' || status === 'MASTERED' ? new Date() : undefined
      }
    })

    res.json({
      message: 'Progress updated successfully',
      progress
    })
  } catch (error) {
    console.error('Update progress error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get child's progress
router.get('/child/:childId', async (req, res) => {
  try {
    const { childId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Verify child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parentId: userId
      }
    })

    if (!child) {
      return res.status(404).json({ message: 'Child not found' })
    }

    const progress = await prisma.progress.findMany({
      where: { childId },
      include: {
        lesson: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    res.json({ progress })
  } catch (error) {
    console.error('Get progress error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get progress summary for dashboard
router.get('/child/:childId/summary', async (req, res) => {
  try {
    const { childId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Verify child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parentId: userId
      }
    })

    if (!child) {
      return res.status(404).json({ message: 'Child not found' })
    }

    const progress = await prisma.progress.findMany({
      where: { childId },
      include: {
        lesson: true
      }
    })

    const summary = {
      totalLessons: progress.length,
      completedLessons: progress.filter(p => p.status === 'COMPLETED' || p.status === 'MASTERED').length,
      inProgressLessons: progress.filter(p => p.status === 'IN_PROGRESS').length,
      averageScore: progress.length > 0 
        ? Math.round(progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length)
        : 0,
      totalTimeSpent: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      achievements: await prisma.achievement.count({
        where: { childId }
      })
    }

    res.json({ summary })
  } catch (error) {
    console.error('Get progress summary error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

