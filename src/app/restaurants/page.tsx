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
import { AddRestaurantForm } from "@/components/add-restaurant-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Clock, MapPin, Globe } from "lucide-react"
import { RestaurantHeader } from "@/components/restaurant-header"

export const dynamic = 'force-dynamic'

// Add type for the metrics data
type MetricsData = {
  total_locations: number
  avg_hours: number
  cities: number
  digital_platforms: number
}

export default async function RestaurantsPage() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
  
  // Update the query to get the actual count of orders
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select(`
      id,
      name,
      address,
      phone,
      email,
      website,
      cashback_percentage,
      orders:orders(count)
    `)
    .order('name')

  // Transform the data to include orders_count correctly
  const restaurantsWithCounts = restaurants?.map(restaurant => ({
    ...restaurant,
    // Access the count from the first element of the orders array
    orders_count: (restaurant.orders?.[0]?.count ?? 0)
  })) ?? []

  // Fix the metrics data typing
  const { data: metricsData } = await supabase.rpc('get_restaurant_metrics') as { data: MetricsData[] }
  const metrics = {
    totalLocations: metricsData?.[0]?.total_locations ?? 0,
    avgHours: metricsData?.[0]?.avg_hours ?? 0,
    cities: metricsData?.[0]?.cities ?? 0,
    digitalPlatforms: metricsData?.[0]?.digital_platforms ?? 0,
  }

  if (error) {
    console.error('Error fetching restaurants:', error.message)
  }

  const hasRestaurants = restaurants && restaurants.length > 0

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
                  <BreadcrumbPage>Restaurants</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-4 p-4 pt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalLocations}</div>
                  <p className="text-xs text-muted-foreground">
                    Active restaurant locations
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.avgHours}</div>
                  <p className="text-xs text-muted-foreground">
                    Hours open per day
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.cities}</div>
                  <p className="text-xs text-muted-foreground">
                    Cities served
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Online Presence</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.digitalPlatforms}</div>
                  <p className="text-xs text-muted-foreground">
                    Digital platforms
                  </p>
                </CardContent>
              </Card>
            </div>
            <RestaurantHeader />
            <Suspense fallback={<div>Loading restaurants...</div>}>
              {error ? (
                <div className="col-span-full text-center py-8 text-red-500">
                  Error loading restaurants. Please try again later.
                </div>
              ) : !hasRestaurants ? (
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
                  {restaurantsWithCounts.map((restaurant) => (
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
} 