import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { 
  Receipt,
  DollarSign,
  ShoppingBag,
  Clock,
  Calculator,
  Users,
  Store,
  Settings,
  ArrowRight
} from "lucide-react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { DashboardMetricsData } from '@/components/dashboard-metrics'
import { BusinessOwnerWrapper } from "@/components/business-owner-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GrowthPotentialCard } from "@/components/growth-potential-card"
import { RecommendedAction } from "@/components/recommended-action"
import { Suspense } from "react"
import { VittoriaProvider } from "@/contexts/vittoria-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AddMenuItemForm } from "@/components/add-menu-item-form"
import { redirect } from 'next/navigation'
import DashboardClient from "@/components/dashboard-client"

interface Restaurant {
  id: string
  cashback_percentage: number | null
  address: string | null
  phone: string | null
}

interface UserRestaurantData {
  restaurant: Restaurant
}

interface UserRestaurant {
  restaurant: Restaurant
}

interface DashboardMetrics {
  revenue: number
  activeUsers: number
  conversionRate: number
  pendingOrders: number
  totalOrders: number
  totalRevenue: number
  averageOrder: number
  averageCost: {
    total: number
    fixedFee: number
    cashback: number
  }
  roas: {
    value: number
    marketingCosts: number
    revenue: number
  }
  repeatCustomers: {
    percentage: number
    description: string
  }
}

export default async function DashboardPage() {
  const supabase = createServerComponentClient({
    cookies: () => cookies()
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's restaurant
  const { data: userRestaurantData } = await supabase
    .from('restaurant_users')
    .select(`
      restaurant:restaurants (
        id,
        cashback_percentage,
        address,
        phone
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (!userRestaurantData?.restaurant) {
    redirect('/onboarding')
  }

  // Ensure we have a single restaurant object, not an array
  const restaurant = Array.isArray(userRestaurantData.restaurant) 
    ? userRestaurantData.restaurant[0] 
    : userRestaurantData.restaurant

  const userRestaurant: UserRestaurant = {
    restaurant: {
      id: restaurant.id,
      cashback_percentage: restaurant.cashback_percentage,
      address: restaurant.address,
      phone: restaurant.phone
    }
  }

  // Now fetch menu items for the restaurant
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id')
    .eq('restaurant_id', userRestaurant.restaurant.id)

  const hasMenuItems = menuItems ? menuItems.length > 0 : false
  const hasCashbackSet = Boolean(userRestaurant.restaurant.cashback_percentage !== null)

  // Mock data matching the image
  const dashboardMetrics: DashboardMetrics = {
    revenue: 1711.72,
    activeUsers: 150,
    conversionRate: 3.2,
    pendingOrders: 5,
    totalOrders: 17,
    totalRevenue: 1711.72,
    averageOrder: 100.69,
    averageCost: {
      total: 40.28,
      fixedFee: 10.07,
      cashback: 30.21
    },
    roas: {
      value: 2.50,
      marketingCosts: 684.69,
      revenue: 1711.72
    },
    repeatCustomers: {
      percentage: 60.0,
      description: "Returning customer rate"
    }
  }

  return (
    <DashboardClient 
      user={user}
    />
  )
} 