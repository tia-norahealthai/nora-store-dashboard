"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useMariaContext } from "@/contexts/maria-context"

interface RecommendedActionProps {
  title: string
  description: string
}

export function RecommendedAction({ title, description }: RecommendedActionProps) {
  const handleAskMaria = () => {
    // Format the query to ask Maria about implementation steps
    const query = `Show me how to ${title.toLowerCase()}. Here's what I want to achieve: ${description}`
    
    // Automatically send the message to Maria chat
    window.dispatchEvent(new CustomEvent('maria-send-message', {
      detail: query
    }))
  }

  return (
    <div className="flex items-start justify-between gap-4 items-center">
      <div className="space-y-1">
        <p className="font-semibold text-lg">{title}</p>
        <p className="text-muted-foreground text-base">{description}</p>
      </div>
      <Button
        variant="default"
        size="default"
        className="flex items-center gap-2 text-white hover:text-blue-600"
        onClick={handleAskMaria}
      >
        <MessageCircle className="h-4 w-4" />
        Get instructions
      </Button>
    </div>
  )
} 