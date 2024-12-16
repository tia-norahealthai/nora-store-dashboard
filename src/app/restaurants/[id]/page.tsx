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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ChatSidebar } from "@/components/chat-sidebar"
import { db } from "@/lib/supabase/db"
import { notFound } from "next/navigation"
import { Store, Clock, MapPin, Globe, Mail, Phone, Receipt, DollarSign } from "lucide-react"
import { MenuItems } from "@/components/menu-items"
import { AddMenuItemForm } from "@/components/add-menu-item-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { OrdersTable } from "@/components/orders-table"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/lib/supabase/db"
import { MetricCard } from "@/components/ui/metric-card"
import { OrdersMetricCard, RevenueMetricCard } from "@/components/metrics/dynamic-metric-cards"
import { RestaurantMetricsCards } from "@/components/metrics/restaurant-metrics"
import { Restaurant, RestaurantMetrics } from "@/types/restaurant"
import { ITEMS_PER_PAGE } from "@/lib/constants"

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const id = params.id

  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })

  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select(`
      *,
      orders (
        id,
        created_at,
        status,
        customer:customers (
          id,
          name,
          email
        ),
        order_items (
          quantity,
          menu_item:menu_items (
            name,
            price
          )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (restaurantError || !restaurant) {
    notFound()
  }

  const restaurantData = restaurant as unknown as Restaurant

  const totalOrders = restaurantData.orders?.length ?? 0
  const totalRevenue = (restaurantData.orders ?? []).reduce((sum, order) => 
    sum + (order.order_items ?? []).reduce((itemSum, item) => 
      itemSum + (item.quantity * (item.menu_item?.price ?? 0)), 0
    ), 0
  )
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  const fixedFeeRate = 0.10
  const cashbackRate = (restaurantData.cashback_percentage ?? 0) / 100
  
  const totalFixedFees = totalRevenue * fixedFeeRate
  const totalCashback = totalRevenue * cashbackRate
  const totalCosts = totalFixedFees + totalCashback
  const averageCostPerOrder = totalOrders > 0 ? totalCosts / totalOrders : 0

  const metricsData: RestaurantMetrics = {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    averageCostPerOrder,
    fixedFeeRate,
    cashbackRate,
    cashbackPercentage: restaurantData.cashback_percentage ?? 0
  }

  const { data: menuItems, error: menuError, count } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact' })
    .eq('restaurant_id', id)
    .order('name')
    .range(0, ITEMS_PER_PAGE - 1)

  if (menuError) {
    console.error('Error fetching menu items:', menuError)
  }

  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select(`
      id,
      name,
      orders!orders_customer_id_fkey (count)
    `)
    .in('id', (restaurantData.orders ?? []).map(order => order.customer.id))

  if (customersError) {
    console.error('Error fetching customers:', customersError)
  }

  const transformedCustomers = (customers ?? []).map(customer => ({
    id: customer.id,
    name: customer.name,
    orders_count: customer.orders?.[0]?.count ?? 0
  }))

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
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
                  <BreadcrumbLink href="/restaurants">Restaurants</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{restaurantData.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 space-y-6">
            {/* Restaurant Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{restaurantData.name}</h1>
                <p className="text-muted-foreground">
                  Added on {new Date(restaurantData.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge>Active</Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Restaurant Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                    <p className="text-sm">{restaurantData.address}</p>
                  </div>
                  {restaurantData.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm">{restaurantData.phone}</p>
                    </div>
                  )}
                  {restaurantData.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm">{restaurantData.email}</p>
                    </div>
                  )}
                  {restaurantData.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={restaurantData.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-500 hover:underline"
                      >
                        {(() => {
                          try {
                            // Ensure URL starts with protocol
                            const websiteUrl = restaurantData.website.startsWith('http') 
                              ? restaurantData.website 
                              : `https://${restaurantData.website}`
                            return new URL(websiteUrl).hostname
                          } catch (error) {
                            return restaurantData.website
                          }
                        })()}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(restaurantData.business_hours || {}).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{day}</span>
                        <span className="text-sm text-muted-foreground">
                          {hours.open} - {hours.close}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <RestaurantMetricsCards 
              restaurantId={id} 
              initialData={metricsData} 
            />

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {transformedCustomers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No customers have ordered from this restaurant yet.
                        </p>
                      ) : (
                        transformedCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className="flex items-center gap-3 rounded-lg border p-3"
                          >
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {customer.name
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {customer.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {customer.orders_count} orders
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Menu Items</h2>
                  <AddMenuItemForm restaurantId={restaurantData.id} />
                </div>
                <MenuItems 
                  initialItems={menuItems || []} 
                  restaurantId={restaurantData.id}
                  totalItems={count || 0}
                />
              </div>
            </div>

            {/* Recent Orders Section */}
            {restaurantData.orders && restaurantData.orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {restaurantData.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge>{order.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
      <ChatSidebar />
    </SidebarProvider>
  )
} 