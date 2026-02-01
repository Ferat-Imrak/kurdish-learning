"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { useAuth } from '../app/providers'
import { apiRequest } from '../lib/api'

export type GamesProgressData = Record<string, unknown>

interface GamesProgressContextType {
  gamesProgress: GamesProgressData
  isSyncing: boolean
  getProgress: (key: string) => unknown
  saveProgress: (key: string, value: unknown) => void
}

const GamesProgressContext = createContext<GamesProgressContextType | undefined>(undefined)

function takeBest(key: string, a: unknown, b: unknown): unknown {
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

function mergeGamesProgress(remote: GamesProgressData, local: GamesProgressData): GamesProgressData {
  const merged = { ...remote }
  for (const [k, localVal] of Object.entries(local)) {
    if (localVal === undefined) continue
    merged[k] = takeBest(k, merged[k], localVal)
  }
  return merged
}

// Collect all games progress keys from localStorage (for initial merge when we have no remote yet)
function getAllLocalGamesProgress(): GamesProgressData {
  if (typeof window === 'undefined') return {}
  const prefix = [
    'flashcards-progress-',
    'matching-progress-',
    'wordbuilder-progress-',
    'picturequiz-progress-',
    'sentence-builder-progress-',
    'memorycards-progress-'
  ]
  const out: GamesProgressData = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    if (prefix.some(p => key.startsWith(p))) {
      try {
        const raw = localStorage.getItem(key)
        if (raw) out[key] = JSON.parse(raw)
      } catch {
        // ignore
      }
    }
  }
  return out
}

export function GamesProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [gamesProgress, setGamesProgress] = useState<GamesProgressData>({})
  const [isSyncing, setIsSyncing] = useState(false)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const syncFromBackend = useCallback(async () => {
    if (!user?.email) return
    try {
      setIsSyncing(true)
      const res = await apiRequest('/progress/games')
      if (res.status === 401 || !res.ok) return
      const { data } = await res.json()
      const remote = (data || {}) as GamesProgressData
      const local = getAllLocalGamesProgress()
      const merged = mergeGamesProgress(remote, local)
      setGamesProgress(merged)
      for (const [key, value] of Object.entries(merged)) {
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.error('Games progress sync from backend failed:', e)
    } finally {
      setIsSyncing(false)
    }
  }, [user?.email])

  const syncToBackend = useCallback(async (data: GamesProgressData) => {
    if (!user?.email) return
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await apiRequest('/progress/games/sync', {
          method: 'POST',
          body: JSON.stringify({ data })
        })
        if (res.status === 401 || !res.ok) return
        const json = await res.json()
        if (json.data) setGamesProgress(json.data as GamesProgressData)
      } catch (e) {
        console.error('Games progress sync to backend failed:', e)
      }
    }, 2000)
  }, [user?.email])

  useEffect(() => {
    const local = getAllLocalGamesProgress()
    if (!user?.email) {
      setGamesProgress(local)
      return
    }
    setGamesProgress(local)
    syncFromBackend()
  }, [user?.email, syncFromBackend])

  const getProgress = useCallback((key: string): unknown => {
    return gamesProgress[key] ?? null
  }, [gamesProgress])

  const saveProgress = useCallback((key: string, value: unknown) => {
    if (typeof window === 'undefined') return
    const next = { ...gamesProgress, [key]: value }
    setGamesProgress(next)
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore
    }
    if (user?.email) syncToBackend(next)
  }, [gamesProgress, syncToBackend, user?.email])

  return (
    <GamesProgressContext.Provider value={{ gamesProgress, isSyncing, getProgress, saveProgress }}>
      {children}
    </GamesProgressContext.Provider>
  )
}

export function useGamesProgress() {
  const ctx = useContext(GamesProgressContext)
  if (ctx === undefined) throw new Error('useGamesProgress must be used within a GamesProgressProvider')
  return ctx
}
