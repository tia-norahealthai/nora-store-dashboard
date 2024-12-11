import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FALLBACK_ENABLED = false; // Set to false in production

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (FALLBACK_ENABLED) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({ 
        content: "This is a fallback response while the API key is being set up. I'm Maria, your AI assistant. How can I help you today?",
        role: 'assistant'
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Maria, a helpful AI assistant focused on providing clear and concise responses."
        },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }))
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({ 
      content: completion.choices[0].message.content,
      role: 'assistant'
    });
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    if (FALLBACK_ENABLED) {
      return NextResponse.json({ 
        content: "I apologize, but I'm currently in development mode. I can still chat with you, but my responses are pre-programmed. How can I assist you?",
        role: 'assistant'
      });
    }
    
    return NextResponse.json(
      { error: 'There was an error processing your request' },
      { status: 500 }
    );
  }
} 