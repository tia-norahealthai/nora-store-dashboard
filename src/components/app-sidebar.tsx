"use client"

import * as React from "react"
import {
  Bot,
  Settings2,
  MessageSquare,
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  TrendingUp,
  Home,
  Users,
  Store,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/supabase-auth-provider'
import { useAuthorization } from '@/hooks/use-authorization'

// Navigation data structure
const data = {
  navMain: [
    {
      title: "Overview",
      items: [
        {
          title: "Homepage",
          url: "/",
          icon: Home,
          showForAdmin: true,
        },
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          hideForAdmin: true,
        },
      ]
    },
    {
      title: "Business",
      items: [
        {
          title: "Orders",
          url: "/orders",
          icon: ShoppingBag,
        },
        {
          title: "Customers",
          url: "/customers",
          icon: Users,
          showForAdmin: true,
        },
        {
          title: "Restaurants",
          url: "/restaurants",
          icon: Store,
          showForAdmin: true,
        },
        {
          title: "Menu",
          url: "/menu",
          icon: Utensils,
        },
        {
          title: "Opportunities",
          url: "/opportunities",
          icon: TrendingUp,
        },
      ]
    },
    {
      title: "AI Assistant",
      items: [
        {
          title: "Chat with MarIA",
          url: "/maria",
          icon: Bot,
        },
        {
          title: "Chat History",
          url: "/maria/history",
          icon: MessageSquare,
        },
      ]
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  collapsed?: boolean
}

export function AppSidebar({ collapsed, ...props }: AppSidebarProps) {
  const { isAdmin, allowedPaths, isLoading } = useAuthorization()

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  // Filter navigation for business owner and admin
  const filteredNavMain = data.navMain.map(section => {
    if (section.items) {
      return {
        ...section,
        items: section.items.filter(item =>
          (item.showForAdmin ? isAdmin : true) &&
          (!isAdmin || !item.hideForAdmin) &&
          (isAdmin || allowedPaths.some(path =>
            path === item.url ||
            item.url.startsWith(path + '/') ||
            path.startsWith(item.url + '/')
          ))
        )
      }
    }
    return section
  }).filter(section => section.items?.length > 0 || section.url)

  // For sections with direct URLs (like Settings), check the URL against allowed paths
  const finalNavMain = filteredNavMain.filter(section => {
    if (section.url) {
      return isAdmin || allowedPaths.some(path =>
        path === section.url ||
        section.url.startsWith(path + '/') ||
        path.startsWith(section.url + '/')
      )
    }
    return true
  })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Image
            src="/nora-logo.svg"
            alt="Nora Logo"
            width={120}
            height={80}
            className={cn(
              "transition-all duration-200",
              collapsed && "w-6 h-6"
            )}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={finalNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
