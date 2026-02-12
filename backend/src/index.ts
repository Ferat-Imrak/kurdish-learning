import express from 'express'
import os from 'os'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import lessonRoutes from './routes/lessons'
import progressRoutes from './routes/progress'
import gameRoutes from './routes/games'
import achievementRoutes from './routes/achievements'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

dotenv.config()

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

const app = express()
const PORT = Number(process.env.PORT) || 5001

if (process.env.NODE_ENV !== 'development') {
  app.set('trust proxy', 1)
}

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/achievements', achievementRoutes)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

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

