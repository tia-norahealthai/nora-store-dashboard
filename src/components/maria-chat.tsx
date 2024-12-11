"use client"

import { useState, useEffect, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Send, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { SuggestedQueries } from "./suggested-queries"
import { usePathname } from "next/navigation"
import { useMariaContext } from "@/contexts/maria-context"
import { useStore } from '@/store'
import { useMenu } from '@/hooks/useMenu'

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface PageData {
  [key: string]: any;
}

const PAGE_SPECIFIC_DATA: { [key: string]: () => PageData } = {
  "/menu": () => ({
    type: "menu",
    data: {
      items: document.querySelectorAll('[data-menu-item]')?.length || 0,
      categories: Array.from(document.querySelectorAll('[data-category]')).map(el => el.textContent),
    }
  }),
  "/customers": () => ({
    type: "customers",
    data: {
      totalCustomers: document.querySelector('[data-total-customers]')?.textContent,
      activeCustomers: document.querySelector('[data-active-customers]')?.textContent,
    }
  }),
  "/orders": () => ({
    type: "orders",
    data: {
      pendingOrders: document.querySelector('[data-pending-orders]')?.textContent,
      totalOrders: document.querySelector('[data-total-orders]')?.textContent,
    }
  })
}

export function MariaChat() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    content: "👋 Hi! I'm Maria, your AI assistant. I can help you with:\n\n" +
      "• Managing menu items and categories\n" +
      "• Analyzing customer data and trends\n" +
      "• Tracking orders and performance\n" +
      "• Providing business insights\n\n" +
      "How can I help you today?",
    role: "assistant",
    timestamp: new Date()
  }])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const { toast } = useToast()
  const mariaContext = useMariaContext()
  const dispatch = useStore((state) => state.dispatch)
  const { createMenuItem } = useMenu()
  
  // Memoize the context data function to prevent infinite loops
  const getContextData = useCallback(() => {
    return {
      page: pathname,
      data: {
        type: mariaContext.pageType,
        data: mariaContext.pageData
      }
    }
  }, [pathname, mariaContext.pageType, mariaContext.pageData])

  const handleMenuItemCreation = async (itemData: any) => {
    try {
      const newItem = {
        name: itemData.name,
        description: itemData.description || '',
        price: parseFloat(itemData.price),
        category: itemData.category,
        image_url: itemData.image_url || '',
        status: 'active',
        ingredients: itemData.ingredients || [],
        preparation_time: itemData.preparation_time || 0,
      }

      await createMenuItem(newItem)
      
      return {
        success: true,
        message: `Successfully created menu item: ${newItem.name}`
      }
    } catch (error) {
      console.error('Failed to create menu item:', error)
      return {
        success: false,
        message: 'Failed to create menu item. Please try again.'
      }
    }
  }

  const handleAssistantResponse = async (content: string) => {
    // Check if the message contains a menu item creation request
    if (content.toLowerCase().includes('create menu item')) {
      try {
        // Extract menu item details from the message
        const itemData = extractMenuItemData(content)
        if (!itemData) {
          return "I couldn't understand the menu item details. Please provide name, price, and category at minimum."
        }

        const result = await handleMenuItemCreation(itemData)
        return result.message
      } catch (error) {
        return "Sorry, I couldn't create the menu item. Please make sure to provide all required information."
      }
    }
    
    // Handle other types of messages
    return content
  }

  const handleCommandExecution = async (command: string, data: any) => {
    try {
      switch (command) {
        case 'deleteMenuItem':
          await dispatch.menu.deleteMenuItem(data.id)
          toast({
            title: "Success",
            description: "Menu item deleted successfully",
          })
          break
        // Add more command cases as needed
        default:
          console.warn(`Unknown command: ${command}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute command. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDatabaseOperation = async (operation: any) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation })
      })

      if (!response.ok) {
        throw new Error('Failed to execute database operation')
      }

      toast({
        title: 'Success',
        description: 'Database operation completed successfully',
      })

      // Refresh relevant data based on the operation
      if (mariaContext.pageType === operation.table) {
        await mariaContext.executeCommand('fetchData', { table: operation.table })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to execute operation',
        variant: 'destructive'
      })
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    setIsLoading(true)
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInput("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          context: getContextData()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.content,
        role: 'assistant',
        timestamp: new Date()
      }])

    } catch (error) {
      console.error('Chat error:', error)
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "Sorry, I encountered an error. Please try again or rephrase your request.",
        role: 'assistant',
        timestamp: new Date()
      }])

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuerySelect = (prompt: string) => {
    sendMessage(prompt)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto mb-4">
        <div className="flex flex-col space-y-4">
          {/* Welcome Header - Only show when there's just the welcome message */}
          {messages.length === 1 && messages[0].id === 'welcome' && (
            <div className="flex flex-col items-center justify-center text-center pb-4">
              <Avatar className="h-16 w-16 mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </Avatar>
              <h2 className="text-2xl font-semibold mb-1">MarIA</h2>
              <p className="text-lg text-slate-600 tracking-wider">Your restaurant management companion</p>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "assistant" ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {message.role === "assistant" ? (
                <Avatar className="h-8 w-8 shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
                </Avatar>
              ) : (
                <Avatar className="h-8 w-8 shrink-0 bg-primary">
                  <User className="h-5 w-5 text-primary-foreground" />
                </Avatar>
              )}
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "assistant"
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Only show suggested queries with the welcome message */}
      {messages.length === 1 && messages[0].id === 'welcome' && (
        <div className="px-4 mb-4">
          <SuggestedQueries onQuerySelect={handleQuerySelect} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-4 pb-4 flex gap-3 border-t bg-background pt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
} 