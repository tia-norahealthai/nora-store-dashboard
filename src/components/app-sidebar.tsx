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
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Pierangelo Raiola",
    email: "pierangelo.raiola@norahealth.ai",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Nora Health AI",
      logo: GalleryVerticalEnd,
      plan: "Business",
    },
    {
      name: "Nora Health AI",
      logo: AudioWaveform,
      plan: "Ownership",
    },
    {
      name: "Nora Health AI",
      logo: Command,
      plan: "Developer",
    },
  ],
  navMain: [
    {
      title: "Analytics",
      url: "/",
      icon: SquareTerminal,
      items: [
        {
          title: "Dashboard",
          url: "/",
        },
        {
          title: "Opportunities",
          url: "/opportunities",
        },
        {
          title: "Orders",
          url: "/orders",
        },
        {
          title: "Customers",
          url: "/customers",
        },
        {
          title: "Invoices",
          url: "/invoices",
        },
      ],
    },
    {
      title: "Store",
      url: "#",
      icon: Store,
      items: [
        {
          title: "Menu",
          url: "/menu",
        },
        {
          title: "Promotions",
          url: "#",
        },
        {
          title: "Locations",
          url: "#",
        },
        {
          title: "Feedbacks",
          url: "/feedbacks",
        },
      ],
    },
    {
      title: "MarIA Assistant",
      url: "/maria",
      icon: Bot,
      items: [
        {
          title: "Chat with MarIA",
          url: "/maria",
        },
        {
          title: "Chat History",
          url: "/maria/history",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
