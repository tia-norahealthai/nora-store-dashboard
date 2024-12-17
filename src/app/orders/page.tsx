import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ChatSidebar } from "@/components/chat-sidebar"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'
import { formatCurrency } from "@/lib/utils"
import { OrderCard } from "@/components/order-card"
import { MetricCard } from "@/components/ui/metric-card"
import { ShoppingBag, DollarSign, CreditCard, Users } from "lucide-react"
import type { OrderItem } from "@/types/order"
import { OrdersTable } from "@/components/orders-table"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"
import { ViewToggle } from "@/components/view-toggle"

type Order = Database['public']['Tables']['orders']['Row'] & {
  customer: Database['public']['Tables']['customers']['Row']
  restaurant: Database['public']['Tables']['restaurants']['Row']
  order_items: (Database['public']['Tables']['order_items']['Row'] & {
    menu_item: Database['public']['Tables']['menu_items']['Row']
  })[]
}

export default async function OrdersPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  })
  
  try {
    console.log('Fetching orders...')
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers!customer_id(*),
        restaurant:restaurants!restaurant_id(*),
        order_items:order_items!order_id(
          *,
          menu_item:menu_items!menu_item_id(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    if (!ordersData) {
      console.error('No orders returned')
      throw new Error('No orders returned')
    }

    const transformedOrders = ordersData.map(order => ({
      ...order,
      customer: order.customer,
      restaurant: order.restaurant,
      order_items: order.order_items.map((item: OrderItem) => ({
        ...item,
        menu_item: item.menu_item
      }))
    })) as Order[]

    // Calculate metrics
    const totalOrders = transformedOrders.length
    const totalRevenue = transformedOrders.reduce((sum, order) => 
      sum + order.order_items.reduce((itemSum, item) => 
        itemSum + (item.quantity * item.menu_item.price), 0
      ), 0
    )
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const uniqueCustomers = new Set(transformedOrders.map(order => order.customer_id)).size

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
                    <BreadcrumbPage>Orders</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex flex-col gap-4 p-4 pt-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="Total Orders"
                    value={totalOrders}
                    description="All time orders"
                    icon={ShoppingBag}
                  />
                  <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    description="All time revenue"
                    icon={DollarSign}
                  />
                  <MetricCard
                    title="Average Order Value"
                    value={formatCurrency(averageOrderValue)}
                    description="Per order"
                    icon={CreditCard}
                  />
                  <MetricCard
                    title="Unique Customers"
                    value={uniqueCustomers}
                    description="Total customers"
                    icon={Users}
                  />
                </div>
                <ViewToggle orders={transformedOrders} />
              </div>
            </div>
          </main>
        </SidebarInset>
        <ChatSidebar />
      </SidebarProvider>
    )
  } catch (error) {
    console.error('Detailed error:', error)
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Error loading orders</h2>
          <p className="mt-2 text-gray-600">Please check the console for more details</p>
        </div>
      </div>
    )
  }
} 