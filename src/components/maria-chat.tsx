"use client"

import { useState, useEffect } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Send, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { TypingIndicator } from "./typing-indicator"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export function MariaChat() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    content: "👋 Hi! I'm Maria, your AI assistant. How can I help you today?",
    role: "assistant",
    timestamp: new Date()
  }])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    setIsLoading(true)

    // Remove welcome message if it's still there
    setMessages(prev => prev.filter(msg => msg.id !== 'welcome'))
    
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
          }))
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
        role: "assistant",
        timestamp: new Date()
      }])

    } catch (error) {
      console.error('Chat error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleTypingStart = () => {
      setIsLoading(true)
    }

    const handleSendMessage = (event: CustomEvent) => {
      if (event.detail) {
        // Remove welcome message if it exists
        setMessages(prev => prev.filter(msg => msg.id !== 'welcome'))
        
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          content: event.detail.query || '',
          role: 'user',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])

        // Simulate typing delay before showing response
        setTimeout(() => {
          // Add assistant message
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: event.detail.response || event.detail,
            role: 'assistant',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, assistantMessage])
          setIsLoading(false)
        }, 1500) // Adjust typing delay as needed
      }
    }

    window.addEventListener('maria-typing-start', handleTypingStart)
    window.addEventListener('maria-send-message', handleSendMessage as EventListener)

    return () => {
      window.removeEventListener('maria-typing-start', handleTypingStart)
      window.removeEventListener('maria-send-message', handleSendMessage as EventListener)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col space-y-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "assistant" ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {message.role === "assistant" ? (
                <Avatar className="h-8 w-8">
                  <Bot className="h-5 w-5 text-primary" />
                </Avatar>
              ) : (
                <Avatar className="h-8 w-8 bg-primary">
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
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <Bot className="h-5 w-5 text-primary" />
              </Avatar>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
} 