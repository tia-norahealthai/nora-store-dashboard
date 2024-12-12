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
import { OrdersTable } from "@/components/orders-table"
import { ChatSidebar } from "@/components/chat-sidebar"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'
import { formatCurrency } from "@/lib/utils"

type Order = Database['public']['Tables']['orders']['Row'] & {
  customer: Database['public']['Tables']['customers']['Row']
  order_items: (Database['public']['Tables']['order_items']['Row'] & {
    menu_item: Database['public']['Tables']['menu_items']['Row']
  })[]
}

export default async function OrdersPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  
  try {
    console.log('Fetching orders...')
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers!customer_id(*),
        order_items!order_id(
          *,
          menu_items!menu_item_id(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    if (!orders) {
      console.error('No orders returned')
      throw new Error('No orders returned')
    }

    console.log('Orders fetched:', orders)

    const transformedOrders = orders.map(order => ({
      ...order,
      customer: order.customers,
      order_items: order.order_items.map((item: Database['public']['Tables']['order_items']['Row'] & {
        menu_items: Database['public']['Tables']['menu_items']['Row']
      }) => ({
        ...item,
        menu_item: item.menu_items
      }))
    })) as Order[]

    console.log('Transformed orders:', transformedOrders)

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
                    <BreadcrumbPage>Orders</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
                <div className="text-2xl font-bold">{totalOrders}</div>
              </div>
              <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </div>
              <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <div className="text-sm font-medium text-muted-foreground">Average Order Value</div>
                <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
              </div>
              <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <div className="text-sm font-medium text-muted-foreground">Unique Customers</div>
                <div className="text-2xl font-bold">{uniqueCustomers}</div>
              </div>
            </div>
            <OrdersTable orders={transformedOrders} />
          </div>
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