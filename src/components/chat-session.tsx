"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, User } from "lucide-react"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
}

type Session = {
  id: string
  title: string
  date: string
  topics: string[]
  messages: Message[]
}

// This would typically come from your API/database
const mockSession: Session = {
  id: "1",
  title: "Restaurant Menu Recommendations",
  date: "2024-03-20T14:30:00Z",
  topics: ["Menu", "Recommendations", "Dietary"],
  messages: [
    {
      id: "1",
      content: "Can you suggest some vegetarian options from the menu?",
      role: "user",
      timestamp: "2024-03-20T14:30:00Z"
    },
    {
      id: "2",
      content: "I'd be happy to help you with vegetarian menu options! Our menu includes several delicious vegetarian dishes:\n\n1. Margherita Pizza - Fresh tomatoes, mozzarella, and basil\n2. Vegetable Stir-Fry - Seasonal vegetables with tofu\n3. Mushroom Risotto - Creamy arborio rice with wild mushrooms\n4. Garden Salad - Mixed greens with house-made vinaigrette\n\nWould you like more details about any of these dishes?",
      role: "assistant",
      timestamp: "2024-03-20T14:30:30Z"
    }
  ]
}

export function ChatSession({ sessionId }: { sessionId: string }) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{mockSession.title}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(mockSession.date).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {mockSession.topics.map((topic) => (
            <Badge key={topic} variant="secondary">
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {mockSession.messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "assistant" ? "justify-start" : "justify-end"
            }`}
          >
            {message.role === "assistant" && (
              <Avatar className="h-8 w-8">
                <AvatarImage src="/maria-avatar.png" />
                <AvatarFallback>MA</AvatarFallback>
              </Avatar>
            )}
            <Card className={`max-w-[80%] p-3 ${
              message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </Card>
            {message.role === "user" && (
              <Avatar className="h-8 w-8">
                <AvatarImage src="/user-avatar.png" />
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 