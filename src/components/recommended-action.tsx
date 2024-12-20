"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useVittoriaContext } from "@/contexts/vittoria-context"

interface RecommendedActionProps {
  title: string
  description: string
}

export function RecommendedAction({ title, description }: RecommendedActionProps) {
  const vittoriaContext = useVittoriaContext()
  
  const handleAskVittoria = () => {
    const query = `Show me how to ${title.toLowerCase()}. Here's what I want to achieve: ${description}`
    
    // First dispatch typing start event
    window.dispatchEvent(new CustomEvent('vittoria-typing-start'))
    
    // Then send the message after a small delay
    setTimeout(() => {
      vittoriaContext.executeCommand('getActionResponse', { 
        action: title,
        query: query 
      })
    }, 500)
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
        onClick={handleAskVittoria}
      >
        <MessageCircle className="h-4 w-4" />
        Get instructions
      </Button>
    </div>
  )
} 