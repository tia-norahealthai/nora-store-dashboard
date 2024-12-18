import { Suspense } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MenuItems } from "@/components/menu-items"
import { ChatSidebar } from "@/components/chat-sidebar"
import { db } from "@/lib/supabase/db"
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { RestaurantHeader } from "@/components/restaurant-header"
import { AddMenuItemForm } from "@/components/add-menu-item-form"
import type { Database } from '@/types/supabase'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  // Check authentication
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    console.error('Session error:', sessionError)
    redirect('/login')
  }
  
  if (!session) {
    redirect('/login')
  }

  try {
    // Add a small delay to ensure auth is properly initialized
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log('Current user ID:', session.user.id)

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)

    const isAdmin = roles?.some(r => r.role === 'admin') ?? false

    let menuItems;
    if (isAdmin) {
      // Admin can see all menu items
      const { data: allMenuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .order('name')

      if (menuError) {
        console.error('Error fetching menu items:', menuError)
        throw menuError
      }
      menuItems = allMenuItems
    } else {
      // Regular users can only see their restaurant's menu items
      const { data: userRestaurants, error: restaurantsError } = await supabase
        .from('restaurant_users')
        .select('restaurant_id')
        .eq('user_id', session.user.id)

      if (restaurantsError) {
        console.error('Error fetching user restaurants:', restaurantsError)
        throw restaurantsError
      }

      console.log('User restaurants:', userRestaurants)

      const restaurantIds = userRestaurants.map(r => r.restaurant_id)
      console.log('Restaurant IDs:', restaurantIds)

      if (restaurantIds.length === 0) {
        return (
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Menu</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>
              <div className="flex-1 overflow-auto">
                <div className="flex flex-col gap-4 p-4 pt-0 w-full items-center justify-center min-h-[400px]">
                  <h2 className="text-xl font-medium text-muted-foreground text-center">
                    You don't have any restaurants yet
                  </h2>
                  <p className="text-muted-foreground text-center max-w-md">
                    To start managing your menu items, you need to create or be assigned to a restaurant first.
                  </p>
                  <Link href="/restaurants">
                    <Button>
                      Go to Restaurants
                    </Button>
                  </Link>
                </div>
              </div>
            </SidebarInset>
            <ChatSidebar />
          </SidebarProvider>
        )
      }

      const { data: restaurantMenuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .in('restaurant_id', restaurantIds)
        .order('name')

      if (menuError) {
        console.error('Error fetching menu items:', menuError)
        throw menuError
      }

      menuItems = restaurantMenuItems
    }

    console.log('Menu items:', menuItems)

    // If we have no menu items, show a different message
    if (menuItems?.length === 0) {
      return (
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Menu</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex-1 overflow-auto">
              <div className="flex flex-col gap-4 p-4 pt-0 w-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight">Menu Items</h2>
                  <AddMenuItemForm restaurantId={isAdmin ? undefined : userRestaurants[0].restaurant_id} />
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  No menu items found. Click the "Add Menu Item" button above to create your first menu item.
                </div>
              </div>
            </div>
          </SidebarInset>
          <ChatSidebar />
        </SidebarProvider>
      )
    }

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Menu</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="flex flex-col gap-4 p-4 pt-0 w-full">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Menu Items</h2>
                <AddMenuItemForm restaurantId={isAdmin ? undefined : userRestaurants[0].restaurant_id} />
              </div>
              
              <Suspense fallback={<div>Loading menu items...</div>}>
                <MenuItems initialItems={menuItems || []} />
              </Suspense>
            </div>
          </div>
        </SidebarInset>
        <ChatSidebar />
      </SidebarProvider>
    )
  } catch (error) {
    console.error('Error:', error)
    return (
      <div className="p-4 text-red-500">
        An error occurred while loading the menu items. Please try refreshing the page.
      </div>
    )
  }
} 