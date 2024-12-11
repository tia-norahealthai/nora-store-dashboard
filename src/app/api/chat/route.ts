import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, context } = body

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage.content.toLowerCase()

    // Handle menu item creation
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

    // Handle menu item updates
    if (userMessage.includes('update menu item') || userMessage.includes('edit menu item')) {
      // If no specific ID is provided, show available items
      if (!userMessage.includes('id:')) {
        const menuItems = await db.menu.getItems()
        return NextResponse.json({
          content: "Which menu item would you like to update? Here are the current items:\n\n" +
            menuItems.map(item => 
              `ID: ${item.id} - ${item.name} ($${item.price}) - ${item.category}`
            ).join('\n') +
            "\n\nTo update an item, use this format:\n" +
            "Update menu item with id: '[ID]' to:\n" +
            "- name: 'New Name' (optional)\n" +
            "- price: 00.00 (optional)\n" +
            "- category: 'New Category' (optional)\n" +
            "- description: 'New Description' (optional)"
        })
      }

      // Process the update if ID is provided
      try {
        const itemData = extractMenuItemUpdateData(lastMessage.content)
        
        if (!itemData || !itemData.id) {
          return NextResponse.json({
            content: "I couldn't understand the update details. Please provide the information in this format:\n\n" +
              "Update menu item with id: '123' to:\n" +
              "- name: 'New Name' (optional)\n" +
              "- price: 00.00 (optional)\n" +
              "- category: 'New Category' (optional)\n" +
              "- description: 'New Description' (optional)"
          })
        }

        // Update the menu item
        const updatedItem = await db.menu.updateItem(itemData.id, {
          ...(itemData.name && { name: itemData.name }),
          ...(itemData.price && { price: itemData.price }),
          ...(itemData.category && { category: itemData.category }),
          ...(itemData.description && { description: itemData.description })
        })

        return NextResponse.json({
          content: `✅ Successfully updated menu item with ID: ${updatedItem.id}\n\nUpdated details:\n` +
            `- Name: ${updatedItem.name}\n` +
            `- Price: $${updatedItem.price}\n` +
            `- Category: ${updatedItem.category}\n` +
            (updatedItem.description ? `- Description: ${updatedItem.description}\n` : '')
        })
      } catch (error) {
        console.error('Error updating menu item:', error)
        return NextResponse.json({
          content: "Sorry, I couldn't update the menu item. Please try again or make sure the item ID exists."
        })
      }
    }

    // Handle menu item deletion
    if (userMessage.includes('delete menu item') || userMessage.includes('remove menu item')) {
      // If no specific ID is provided, show available items
      if (!userMessage.includes('id:')) {
        const menuItems = await db.menu.getItems()
        return NextResponse.json({
          content: "Which menu item would you like to delete? Here are the current items:\n\n" +
            menuItems.map(item => 
              `ID: ${item.id} - ${item.name} ($${item.price}) - ${item.category}`
            ).join('\n') +
            "\n\nTo delete an item, use this format:\n" +
            "Delete menu item with id: '[ID]'"
        })
      }

      // Process the deletion if ID is provided
      try {
        const itemId = extractMenuItemId(lastMessage.content)
        
        if (!itemId) {
          return NextResponse.json({
            content: "I couldn't find the menu item ID. Please provide it in this format:\n\n" +
              "Delete menu item with id: '123'"
          })
        }

        // Delete the menu item
        await db.menu.deleteItem(itemId)

        return NextResponse.json({
          content: `✅ Successfully deleted menu item with ID: ${itemId}`
        })
      } catch (error) {
        console.error('Error deleting menu item:', error)
        return NextResponse.json({
          content: "Sorry, I couldn't delete the menu item. Please make sure the item ID exists."
        })
      }
    }

    // Update the general help message
    return NextResponse.json({
      content: "I understand you want to interact with the menu. What would you like to do?\n\n" +
        "You can:\n" +
        "1. Create a new menu item\n" +
        "2. Update an existing menu item (I'll show you the available items)\n" +
        "3. Delete a menu item (I'll show you the available items)\n" +
        "4. View menu items\n\n" +
        "Just let me know what you'd like to do!"
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

function extractMenuItemUpdateData(message: string) {
  const idMatch = message.match(/id:\s*['"]([^'"]+)['"]/)
  const nameMatch = message.match(/name:\s*['"]([^'"]+)['"]/)
  const priceMatch = message.match(/price:\s*(\d+(\.\d{1,2})?)/)
  const categoryMatch = message.match(/category:\s*['"]([^'"]+)['"]/)
  const descriptionMatch = message.match(/description:\s*['"]([^'"]+)['"]/)

  if (!idMatch) {
    return null
  }

  return {
    id: idMatch[1],
    ...(nameMatch && { name: nameMatch[1] }),
    ...(priceMatch && { price: parseFloat(priceMatch[1]) }),
    ...(categoryMatch && { category: categoryMatch[1] }),
    ...(descriptionMatch && { description: descriptionMatch[1] })
  }
}

function extractMenuItemId(message: string) {
  const idMatch = message.match(/id:\s*['"]([^'"]+)['"]/)
  return idMatch ? idMatch[1] : null
} 