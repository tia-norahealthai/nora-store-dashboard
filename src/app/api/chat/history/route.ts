import { NextResponse } from 'next/server'
import { getStoredSessions, deleteSession } from '@/lib/local-storage'

export async function GET() {
  try {
    const sessions = getStoredSessions()
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    deleteSession(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await req.json()
    const newSession = storeSession(session)
    return NextResponse.json(newSession)
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
} 