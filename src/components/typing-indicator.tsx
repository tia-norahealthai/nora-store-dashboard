"use client"

import { cn } from "@/lib/utils"

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-1", className)}>
      <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
    </div>
  )
} 