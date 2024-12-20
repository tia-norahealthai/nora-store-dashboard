"use client"

import { useAuthorization } from "@/hooks/use-authorization"
import { redirect } from 'next/navigation'
import { ReactNode, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChatSidebar } from "@/components/chat-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

interface BusinessOwnerWrapperProps {
  children: ReactNode
}

export function BusinessOwnerWrapper({ children }: BusinessOwnerWrapperProps) {
  const { isAdmin, isLoading } = useAuthorization()

  useEffect(() => {
    if (!isLoading && isAdmin) {
      redirect('/')
    }
  }, [isAdmin, isLoading])

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Loading...</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="flex flex-col gap-4 p-4 pt-0">
              <div>Loading...</div>
            </div>
          </div>
        </SidebarInset>
        <ChatSidebar />
      </SidebarProvider>
    )
  }

  return <>{children}</>
} 