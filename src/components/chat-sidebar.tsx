"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Bot } from "lucide-react"
import { MariaChat } from "@/components/maria-chat"
import { cn } from "@/lib/utils"
import { MariaProvider } from "@/contexts/maria-context"
import { PageType } from "@/types/data-types"

export function ChatSidebar() {
  const pathname = usePathname()
  
  if (pathname?.startsWith("/maria")) {
    return null
  }

  const getPageType = (): PageType => {
    if (pathname === "/") return "dashboard"
    
    const basePath = pathname?.split('/')[1]
    const isDetailPage = pathname?.includes('/[id]') || pathname?.match(/\/[^/]+$/)
    
    if (basePath === "menu" && isDetailPage) return "menu_details"
    if (basePath === "customers" && isDetailPage) return "customer_details"
    if (basePath === "orders" && isDetailPage) return "order_details"
    
    return basePath as PageType || "dashboard"
  }

  return (
    <div className="hidden h-screen w-[400px] border-l bg-background md:block">
      <MariaProvider pageType={getPageType()} initialData={null}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center border-b px-6">
            <div className="flex items-center gap-3">
              <Bot className="h-7 w-7" />
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-semibold">MarIA</span>
                <span className="text-xs text-muted-foreground">Chat with Maria</span>
              </div>
            </div>
          </div>
          <MariaChat />
        </div>
      </MariaProvider>
    </div>
  )
} 