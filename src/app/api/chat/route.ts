import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { handleMenuQuery } from '@/lib/menu-context-handler'
import { PageContextData, PageType } from '@/types/data-types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FALLBACK_ENABLED = false; // Set to false in production

function createSystemMessage(
  pageType: PageType | string = 'dashboard', 
  contextData: PageContextData[PageType] | null = null
): string {
  let systemMessage = `You are Maria, an AI assistant for a restaurant management system. 
  You have access to real-time data about menu items, orders, customers, and business metrics.
  
  Current context type: ${pageType}`

  if (contextData) {
    switch (pageType) {
      case 'menu_details': {
        const { item } = contextData as PageContextData['menu_details']
        systemMessage += `\n\nCurrent Menu Item Context:
        - Name: ${item.name}
        - Price: $${item.price}
        - Category: ${item.category}
        - Description: ${item.description}
        - Dietary: ${item.dietary.join(', ')}
        - Allergens: ${item.allergens?.join(', ') || 'None listed'}
        - Status: ${item.status}
        ${item.preparationTime ? `- Preparation Time: ${item.preparationTime}` : ''}
        ${item.ingredients ? `- Ingredients: ${item.ingredients.join(', ')}` : ''}
        ${item.nutritionalInfo ? `
        - Nutritional Info:
          * Calories: ${item.nutritionalInfo.calories}
          * Protein: ${item.nutritionalInfo.protein}g
          * Carbs: ${item.nutritionalInfo.carbs}g
          * Fat: ${item.nutritionalInfo.fat}g` : ''}`
        break
      }

      // Add other cases for different page types...
    }
  }

  return systemMessage
}

export async function POST(request: Request) {
  try {
    const { messages, context } = await request.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: createSystemMessage(context.type, context.data)
        },
        ...messages
      ]
    });

    const response = completion.choices[0].message.content || ''

    // Check for command patterns in the response
    const commandMatch = response.match(/\[COMMAND:(.*?)\](.*?)\[\/COMMAND\]/s)
    
    if (commandMatch) {
      const [_, command, commandData] = commandMatch
      try {
        const parsedData = JSON.parse(commandData)
        
        return NextResponse.json({
          content: response.replace(/\[COMMAND:.*?\].*?\[\/COMMAND\]/s, '').trim(),
          command,
          commandData: parsedData
        })
      } catch (error) {
        console.error('Failed to parse command data:', error)
      }
    }

    return NextResponse.json({ content: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
} 