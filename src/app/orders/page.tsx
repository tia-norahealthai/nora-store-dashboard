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
        id,
        created_at,
        customer_id,
        status,
        total_amount,
        customer:customers(
          id,
          created_at,
          email,
          name
        ),
        order_items(
          id,
          quantity,
          unit_price,
          menu_item:menu_items(
            id,
            name,
            description,
            price,
            category
          )
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
      customer: Array.isArray(order.customer) ? order.customer[0] : order.customer,
      order_items: order.order_items.map(item => ({
        ...item,
        menu_item: Array.isArray(item.menu_item) ? item.menu_item[0] : item.menu_item
      }))
    })) as Order[]

    console.log('Transformed orders:', transformedOrders)

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