"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Store,
  MessageSquare,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
// import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import Image from "next/image"

// This is sample data.
const data = {
  user: {
    name: "Avo Admin",
    email: "admin@avo.com",
    avatar: "/avatars/shadcn.jpg",
  },
  // teams: [
  //   {
  //     name: "Nora Health AI",
  //     logo: GalleryVerticalEnd,
  //     plan: "Business",
  //   },
  //   {
  //     name: "Nora Health AI",
  //     logo: AudioWaveform,
  //     plan: "Ownership",
  //   },
  //   {
  //     name: "Nora Health AI",
  //     logo: Command,
  //     plan: "Developer",
  //   },
  // ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: SquareTerminal,
    },
    {
      title: "Business",
      items: [
        {
          title: "Orders",
          url: "/orders",
          icon: Store,
        },
        {
          title: "Customers",
          url: "/customers",
          icon: MessageSquare,
        },
        {
          title: "Restaurants",
          url: "/restaurants",
          icon: Store,
        },
        {
          title: "Opportunities",
          url: "/opportunities",
          icon: PieChart,
        },
        {
          title: "Invoices",
          url: "/invoices",
          icon: Frame,
        }
      ]
    },
    {
      title: "Restaurant",
      items: [
        {
          title: "Menu",
          url: "/menu",
          icon: Store,
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
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  collapsed?: boolean
}

export function AppSidebar({ collapsed, ...props }: AppSidebarProps) {
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
