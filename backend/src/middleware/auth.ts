import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { getJwtSecret } from '../utils/jwt'

const prisma = new PrismaClient()

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Access token required' })
    }

    const decoded = jwt.verify(token, getJwtSecret()) as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }

    return next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    return next()
  }
}

