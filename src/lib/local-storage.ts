import { nanoid } from 'nanoid'

export type ChatSession = {
  id: string
  title: string
  preview: string
  date: string
  messageCount: number
  topics: string[]
}

const STORAGE_KEY = 'chat_sessions'

export const getStoredSessions = (): ChatSession[] => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export const storeSession = (session: Omit<ChatSession, 'id' | 'date'>) => {
  const sessions = getStoredSessions()
  const newSession: ChatSession = {
    ...session,
    id: nanoid(),
    date: new Date().toISOString(),
  }
  sessions.unshift(newSession)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  return newSession
}

export const deleteSession = (id: string) => {
  const sessions = getStoredSessions()
  const filtered = sessions.filter(session => session.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export const getSession = (id: string) => {
  const sessions = getStoredSessions()
  return sessions.find(session => session.id === id)
} 