"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddFirstMenuItem } from "@/components/add-first-menu-item"
import { AppSidebar } from "@/components/app-sidebar"
import { ChatSidebar } from "@/components/chat-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

interface DashboardClientProps {
  user: {
    id: string
  }
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [restaurant, setRestaurant] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const loadRestaurantAndMenuItems = async () => {
      try {
        // Get restaurant ID for the current user
        const { data: restaurantUser, error: restaurantUserError } = await supabase
          .from('restaurant_users')
          .select('restaurant_id')
          .eq('user_id', user.id)
          .single()

        if (restaurantUserError) {
          console.error('Error fetching restaurant user:', restaurantUserError)
          console.error('User ID:', user.id)
          setError('Could not fetch restaurant information')
          setIsLoading(false)
          return
        }

        if (!restaurantUser) {
          console.error('No restaurant user found for user ID:', user.id)
          router.push('/onboarding')
          return
        }

        console.log('Found restaurant user:', restaurantUser)

        // Get restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantUser.restaurant_id)
          .single()

        if (restaurantError) {
          console.error('Error fetching restaurant:', restaurantError)
          console.error('Restaurant ID:', restaurantUser.restaurant_id)
          setError('Could not fetch restaurant information')
          setIsLoading(false)
          return
        }

        console.log('Found restaurant:', restaurantData)
        setRestaurant(restaurantData)

        // Get menu items
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantUser.restaurant_id)

        if (menuItemsError) {
          console.error('Error fetching menu items:', menuItemsError)
          console.error('Restaurant ID:', restaurantUser.restaurant_id)
          setError('Could not fetch menu items')
          setIsLoading(false)
          return
        }

        console.log('Found menu items:', menuItemsData)
        setMenuItems(menuItemsData || [])
        setIsLoading(false)
      } catch (err) {
        console.error('Error in loadRestaurantAndMenuItems:', err)
        setError('An unexpected error occurred')
        setIsLoading(false)
      }
    }

    loadRestaurantAndMenuItems()
  }, [user, supabase, router])

  const handleSkip = () => {
    console.log('Skipping add menu item, restaurant ID:', restaurant?.id)
    router.push('/dashboard')
  }

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
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
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

  if (error) {
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
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="flex flex-col gap-4 p-4 pt-0">
              <div>Error: {error}</div>
            </div>
          </div>
        </SidebarInset>
        <ChatSidebar />
      </SidebarProvider>
    )
  }

  // Show add first menu item form if restaurant exists but has no menu items
  if (restaurant && menuItems.length === 0) {
    console.log('Showing AddFirstMenuItem component with restaurant ID:', restaurant.id)
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
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="flex flex-col gap-4 p-4 pt-0">
              <AddFirstMenuItem 
                restaurantId={restaurant.id} 
                onSkip={handleSkip}
              />
            </div>
          </div>
        </SidebarInset>
        <ChatSidebar />
      </SidebarProvider>
    )
  }

  // Regular dashboard view
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
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-4 p-4 pt-0">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <Button onClick={() => router.push('/menu')}>
                View Menu
              </Button>
            </div>

            {/* Display menu items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                    <p className="mt-2 font-semibold">${item.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
      <ChatSidebar />
    </SidebarProvider>
  )
} 