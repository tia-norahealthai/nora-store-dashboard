import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, context } = body

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage.content.toLowerCase()

    // Check if it's a menu item creation request
    if (userMessage.includes('create menu item') || userMessage.includes('add menu item')) {
      try {
        const itemData = extractMenuItemData(lastMessage.content)
        
        if (!itemData) {
          return NextResponse.json({
            content: "I couldn't understand the menu item details. Please provide the information in this format:\n\n" +
              "Create menu item with:\n" +
              "- name: 'Item Name'\n" +
              "- price: 00.00\n" +
              "- category: 'Category Name'\n" +
              "- description: 'Item Description' (optional)"
          })
        }

        // Create the menu item
        const newItem = await db.menu.createItem({
          name: itemData.name,
          price: itemData.price,
          category: itemData.category,
          description: itemData.description || '',
          status: 'active'
        })

        return NextResponse.json({
          content: `✅ Successfully created menu item: ${newItem.name}\n\nDetails:\n` +
            `- Price: $${newItem.price}\n` +
            `- Category: ${newItem.category}\n` +
            (newItem.description ? `- Description: ${newItem.description}\n` : '')
        })
      } catch (error) {
        console.error('Error creating menu item:', error)
        return NextResponse.json({
          content: "Sorry, I couldn't create the menu item. Please try again or make sure all required information is provided correctly."
        })
      }
    }

    // Handle other types of messages
    return NextResponse.json({
      content: "I understand you want to interact with the menu. What would you like to do?\n\n" +
        "You can:\n" +
        "1. Create a new menu item\n" +
        "2. View existing menu items\n" +
        "3. Update menu items\n" +
        "4. Remove menu items\n\n" +
        "To create a new item, use this format:\n" +
        "Create menu item with:\n" +
        "- name: 'Item Name'\n" +
        "- price: 00.00\n" +
        "- category: 'Category Name'\n" +
        "- description: 'Item Description' (optional)"
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function extractMenuItemData(message: string) {
  const nameMatch = message.match(/name:\s*['"]([^'"]+)['"]/)
  const priceMatch = message.match(/price:\s*(\d+(\.\d{1,2})?)/)
  const categoryMatch = message.match(/category:\s*['"]([^'"]+)['"]/)
  const descriptionMatch = message.match(/description:\s*['"]([^'"]+)['"]/)

  if (!nameMatch || !priceMatch || !categoryMatch) {
    return null
  }

  return {
    name: nameMatch[1],
    price: parseFloat(priceMatch[1]),
    category: categoryMatch[1],
    description: descriptionMatch ? descriptionMatch[1] : ''
  }
} 