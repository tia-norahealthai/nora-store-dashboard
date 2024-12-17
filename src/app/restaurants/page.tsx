import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
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
import { ChatSidebar } from "@/components/chat-sidebar"
import { RestaurantCard } from "@/components/restaurant-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, ShoppingBag } from "lucide-react"
import { RestaurantHeader } from "@/components/restaurant-header"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function RestaurantsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  try {
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error('Auth error:', sessionError)
      redirect('/login')
    }

    // Fetch restaurants with orders metrics only
    const { data: restaurantsData, error: restaurantsError } = await supabase
      .from('restaurants')
      .select(`
        *,
        orders:orders(count)
      `)
      .order('created_at', { ascending: false })

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError)
      throw restaurantsError
    }

    const transformedRestaurantsData = restaurantsData?.map(restaurant => ({
      ...restaurant,
      orders_count: restaurant.orders?.[0]?.count ?? 0
    }))

    // Calculate metrics
    const totalRestaurants = transformedRestaurantsData.length
    const totalOrders = transformedRestaurantsData.reduce((sum, restaurant) => 
      sum + (restaurant.orders_count || 0), 0)

    const hasRestaurants = transformedRestaurantsData.length > 0

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
                    <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Restaurants</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="flex flex-col gap-4 p-4 pt-0">
              <RestaurantHeader />
              
              {/* Metrics Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Restaurants
                    </CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalRestaurants}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Orders
                    </CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalOrders}</div>
                  </CardContent>
                </Card>
              </div>

              <Suspense fallback={<div>Loading restaurants...</div>}>
                {!hasRestaurants ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <Store className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">No restaurants found</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get started by adding your first restaurant
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {transformedRestaurantsData.map((restaurant) => (
                      <RestaurantCard 
                        key={restaurant.id} 
                        restaurant={restaurant}
                      />
                    ))}
                  </div>
                )}
              </Suspense>
            </div>
          </div>
        </SidebarInset>
        <ChatSidebar />
      </SidebarProvider>
    )
  } catch (error) {
    console.error('Error in RestaurantsPage:', error)
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Error loading restaurants</h2>
          <p className="mt-2 text-gray-600">Please try again later</p>
        </div>
      </div>
    )
  }
} 