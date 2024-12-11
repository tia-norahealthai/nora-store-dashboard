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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, MapPin, Package, User } from "lucide-react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

// Add this interface for type safety
interface OrderDetails {
  id: string
  status: string
  customer: {
    name: string
    email: string
    avatar: string
    phone: string
    address: string
  }
  items: {
    id: string
    name: string
    quantity: number
    price: number
    notes: string
  }[]
  payment: {
    method: string
    subtotal: number
    tax: number
    delivery: number
    total: number
  }
  timestamps: {
    placed: string
    estimated: string
    completed: string | null
  }
}

async function getOrderDetails(orderId: string) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(
        id,
        menu_items(name, price),
        quantity,
        notes
      )
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return null
  }

  // Calculate subtotal from items
  const subtotal = order.items.reduce((sum: number, item: any) => {
    return sum + (item.menu_items.price * item.quantity)
  }, 0)

  // Calculate tax (assuming 10% tax rate - adjust as needed)
  const taxRate = 0.1
  const tax = subtotal * taxRate

  // Delivery fee (you can adjust this or fetch from order if stored)
  const deliveryFee = order.delivery_fee || 5.00

  // Calculate total
  const total = subtotal + tax + deliveryFee

  // Transform the data to match our interface
  const orderDetails: OrderDetails = {
    id: order.id,
    status: order.status,
    customer: {
      name: order.customer.name,
      email: order.customer.email,
      avatar: order.customer.avatar || order.customer.name.substring(0, 2).toUpperCase(),
      phone: order.customer.phone,
      address: order.customer.address
    },
    items: order.items.map((item: any) => ({
      id: item.id,
      name: item.menu_items.name,
      quantity: item.quantity,
      price: item.menu_items.price,
      notes: item.notes || ''
    })),
    payment: {
      method: order.payment_method,
      subtotal: subtotal,
      tax: tax,
      delivery: deliveryFee,
      total: total
    },
    timestamps: {
      placed: order.created_at,
      estimated: order.estimated_delivery,
      completed: order.completed_at
    }
  }

  return orderDetails
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const orderDetails = await getOrderDetails(params.id)

  if (!orderDetails) {
    notFound()
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
                  <BreadcrumbLink href="/orders">Orders</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{orderDetails.id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Order Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Order {orderDetails.id}</h1>
              <p className="text-muted-foreground">
                Placed on {new Date(orderDetails.timestamps.placed).toLocaleString()}
              </p>
            </div>
            <Badge variant={orderDetails.status === "completed" ? "success" : "pending"} className="w-fit">
              {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/avatars/${orderDetails.customer.avatar}.png`} />
                    <AvatarFallback>{orderDetails.customer.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{orderDetails.customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{orderDetails.customer.email}</p>
                    <p className="text-sm text-muted-foreground">{orderDetails.customer.phone}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <p className="text-sm">{orderDetails.customer.address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(orderDetails.timestamps.placed).toLocaleString()}
                    </p>
                  </div>
                </div>
                {orderDetails.timestamps.completed && (
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">Order Completed</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(orderDetails.timestamps.completed).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground">Note: {item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${(orderDetails.payment.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${(orderDetails.payment.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>${(orderDetails.payment.delivery || 0).toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${(orderDetails.payment.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
      <ChatSidebar />
    </SidebarProvider>
  )
} 