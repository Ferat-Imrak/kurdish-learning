import express from 'express'
import os from 'os'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

function getLocalIP(): string {
  const envIp = process.env.MOBILE_ACCESS_IP
  if (envIp) return envIp
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    const iface = nets[name]
    if (!iface) continue
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) return config.address
    }
  }
  return '127.0.0.1'
}

// Import routes
import authRoutes from './routes/auth'
import progressRoutes from './routes/progress'
import achievementRoutes from './routes/achievements'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 5002

// Security middleware
app.use(helmet())
// CORS configuration - allow all origins in development for mobile testing
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? true // Allow all origins in development
    : (process.env.FRONTEND_URL || 'http://localhost:3000'),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit in dev for mobile testing
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health'
  }
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Compression middleware
app.use(compression())

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Health check endpoint (root and under /api for mobile baseURL)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/achievements', achievementRoutes)

// Simple API routes for testing
app.get('/api/lessons', (req, res) => {
  res.json({
    lessons: [
      {
        id: '1',
        title: 'Kurmanji Alphabet - Part 1',
        description: 'Learn the first 8 letters of the Kurdish alphabet',
        type: 'ALPHABET',
        language: 'KURMANJI',
        difficulty: 'BEGINNER',
        order: 1
      },
      {
        id: '2',
        title: 'Numbers 1-5',
        description: 'Learn to count from 1 to 5 in Kurmanji',
        type: 'NUMBERS',
        language: 'KURMANJI',
        difficulty: 'BEGINNER',
        order: 2
      }
    ]
  })
})

app.get('/api/games', (req, res) => {
  res.json({
    games: [
      {
        id: '1',
        name: 'Alphabet Flashcards',
        description: 'Practice Kurdish letters with flashcards',
        type: 'FLASHCARDS',
        language: 'KURMANJI',
        difficulty: 'BEGINNER'
      },
      {
        id: '2',
        name: 'Word Matching',
        description: 'Match Kurdish words with their meanings',
        type: 'MATCHING',
        language: 'KURMANJI',
        difficulty: 'BEGINNER'
      }
    ]
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'
  
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Start server - listen on all interfaces (0.0.0.0) to allow mobile connections
app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP()
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📚 Kurdish Learning API is ready!`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📱 Mobile access: http://${localIP}:${PORT}/api  ← set EXPO_PUBLIC_API_URL in mobile/.env to this`)
  console.log(`💻 Local access: http://localhost:${PORT}/api`)
  if (localIP !== '127.0.0.1') {
    console.log(`📌 If same WiFi still fails: allow port ${PORT} in macOS Firewall (System Settings → Network → Firewall) or allow "node"/"tsx"`)
  }
})

export default app
