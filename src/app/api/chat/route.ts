import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { handleDatabaseQuery } from '@/lib/db-query-handler'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const isDatabaseQuery = (query: string): boolean => {
  const dbKeywords = [
    'how many', 'total', 'count', 'list', 'show me',
    'customers', 'orders', 'menu items', 'revenue',
    'sales', 'dishes', 'pending', 'active'
  ]
  return dbKeywords.some(keyword => query.toLowerCase().includes(keyword))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages } = body
    
    // Get the latest user message
    const userMessage = messages[messages.length - 1]
    
    // Check if it's a database query
    if (isDatabaseQuery(userMessage.content)) {
      const dbResponse = await handleDatabaseQuery(userMessage.content)
      return NextResponse.json({
        content: dbResponse.response,
        data: dbResponse.data
      })
    }

    // If not a database query, use OpenAI for general conversation
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Maria, a helpful AI assistant for a restaurant management system. You can help with general questions and guide users to ask about database information like customers, orders, menu items, and revenue."
        },
        ...messages
      ]
    })

    return NextResponse.json({
      content: completion.choices[0].message.content
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 