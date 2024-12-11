"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Bot } from "lucide-react"
import { MariaChat } from "@/components/maria-chat"
import { cn } from "@/lib/utils"

const CHAT_SIDEBAR_WIDTH = "400px"

export function ChatSidebar() {
  const pathname = usePathname()
  
  // Hide the sidebar on the Maria chat page and history page
  if (pathname.startsWith("/maria")) {
    return null
  }

  return (
    <div 
      className={cn(
        "hidden h-screen w-[400px] border-l bg-background md:block"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Maria AI Assistant</span>
              <span className="text-xs text-muted-foreground">Chat with Maria</span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <MariaChat />
        </div>
      </div>
    </div>
  )
} 