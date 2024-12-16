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
import { RequireRole } from '@/components/auth/require-role'

export const dynamic = 'force-dynamic'

// Add type for the metrics data
type MetricsData = {
  total_locations: number
  avg_hours: number
  cities: number
  digital_platforms: number
}

export default async function RestaurantsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  try {
    // Get the current authenticated user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Not authenticated')
    }

    // Get user roles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', session.user.id)
      .single()

    const isSuperAdmin = userRoles?.roles?.some(role => role.name === 'super_admin')

    // Build the base query
    let query = supabase
      .from('restaurants')
      .select(`
        *,
        locations: restaurant_locations(count),
        platforms: restaurant_platforms(count),
        restaurant_users!inner(user_id)
      `)
      .order('created_at', { ascending: false })

    // If not super admin, filter by user_id
    if (!isSuperAdmin) {
      query = query.eq('restaurant_users.user_id', session.user.id)
    }

    const { data: restaurantsData, error: restaurantsError } = await query

    if (restaurantsError) throw restaurantsError

    // Calculate metrics
    const metrics: MetricsData = {
      total_locations: restaurantsData.reduce((sum, r) => sum + (r.locations?.[0]?.count || 0), 0),
      avg_hours: 12,
      cities: new Set(restaurantsData.flatMap(r => r.cities || [])).size,
      digital_platforms: restaurantsData.reduce((sum, r) => sum + (r.platforms?.[0]?.count || 0), 0)
    }

    const hasRestaurants = restaurantsData.length > 0
    const restaurantsWithCounts = restaurantsData.map(restaurant => ({
      ...restaurant,
      locationCount: restaurant.locations?.[0]?.count || 0,
      platformCount: restaurant.platforms?.[0]?.count || 0
    }))

    return (
      <RequireRole allowedRoles={['super_admin', 'business_owner']}>
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
                      <div className="text-2xl font-bold">{metrics.total_locations}</div>
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
                      <div className="text-2xl font-bold">{metrics.avg_hours}</div>
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
                      <div className="text-2xl font-bold">{metrics.digital_platforms}</div>
                      <p className="text-xs text-muted-foreground">
                        Digital platforms
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <RestaurantHeader />
                <Suspense fallback={<div>Loading restaurants...</div>}>
                  {restaurantsError ? (
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
      </RequireRole>
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