'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AppSidebar } from "@/components/app-sidebar"
import { ChatSidebar } from "@/components/chat-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Package, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { OrdersTable } from "@/components/orders-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/components/providers/supabase-auth-provider'
import { formatCurrency } from '@/lib/utils'

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

interface OrderMetrics {
  total: number
  pending: number
  processing: number
  completed: number
  cancelled: number
  totalRevenue: number
  averageOrder: number
}

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [orders, setOrders] = useState([])
  const [metrics, setMetrics] = useState<OrderMetrics>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    averageOrder: 0
  })
  const supabase = createClientComponentClient()
  const { user } = useAuth()

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      let query = supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*)
        `)

      // Check if user is admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)

      const isAdmin = roles?.some(r => r.role === 'admin') ?? false

      // If not admin, filter by user's restaurants
      if (!isAdmin) {
        const { data: userRestaurants, error: restaurantsError } = await supabase
          .from('restaurant_users')
          .select('restaurant_id')
          .eq('user_id', user.id)

        if (restaurantsError) {
          console.error('Error fetching user restaurants:', restaurantsError)
          return
        }

        const restaurantIds = userRestaurants.map(r => r.restaurant_id)

        // If user has no restaurants, return empty array
        if (restaurantIds.length === 0) {
          setOrders([])
          setMetrics({
            total: 0,
            pending: 0,
            processing: 0,
            completed: 0,
            cancelled: 0,
            totalRevenue: 0,
            averageOrder: 0
          })
          return
        }

        query = query.in('restaurant_id', restaurantIds)
      }
      
      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (!error && data) {
        setOrders(data)
        // Calculate metrics
        const totalRevenue = data.reduce((sum, order) => {
          return sum + (order.total_amount || 0)
        }, 0)
        
        const newMetrics = {
          total: data.length,
          pending: data.filter(order => order.status === 'pending').length,
          processing: data.filter(order => order.status === 'processing').length,
          completed: data.filter(order => order.status === 'completed').length,
          cancelled: data.filter(order => order.status === 'cancelled').length,
          totalRevenue,
          averageOrder: data.length > 0 ? totalRevenue / data.length : 0
        }
        setMetrics(newMetrics)
      }
    }

    fetchOrders()
  }, [status, user])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
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

        <div className="flex-1 space-y-4 p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.cancelled}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.averageOrder.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Orders</h1>
          </div>

          <div className="flex gap-2 border-b pb-2">
            <button
              onClick={() => setStatus('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                status === 'all' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setStatus('pending')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                status === 'pending' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatus('processing')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                status === 'processing' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Processing
            </button>
            <button
              onClick={() => setStatus('completed')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                status === 'completed' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatus('cancelled')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                status === 'cancelled' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cancelled
            </button>
          </div>

          <OrdersTable orders={orders} />
        </div>
      </SidebarInset>
      <ChatSidebar />
    </SidebarProvider>
  )
} 