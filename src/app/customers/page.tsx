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
import { CustomersTable } from "@/components/customers-table"
import { ChatSidebar } from "@/components/chat-sidebar"
import { getCustomers, getCustomerMetrics } from "@/lib/data-collector"
import { MetricCard } from "@/components/ui/metric-card"
import { Users, DollarSign, TrendingUp, ShoppingBag } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Customer } from "@/types/customer"

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const customers = await getCustomers() as Customer[]
  const metrics = await getCustomerMetrics()
  
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
                  <BreadcrumbPage>Customers</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-4 p-4 pt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Customers"
                value={metrics.totalCustomers.toString()}
                description={`+${metrics.newCustomers} this month`}
                icon={Users}
              />
              <MetricCard
                title="Average Order Value"
                value={formatCurrency(metrics.averageOrderValue)}
                description="vs last month"
                icon={DollarSign}
                trend={metrics.orderValueTrend > 0 ? "up" : "down"}
                trendValue={`${metrics.orderValueTrend}%`}
              />
              <MetricCard
                title="Customer Retention"
                value={`${metrics.retentionRate}%`}
                description="vs last month"
                icon={TrendingUp}
                trend={metrics.retentionTrend > 0 ? "up" : "down"}
                trendValue={`${metrics.retentionTrend}%`}
              />
              <MetricCard
                title="Orders This Month"
                value={metrics.monthlyOrders.toString()}
                description="vs last month"
                icon={ShoppingBag}
                trend={metrics.ordersTrend > 0 ? "up" : "down"}
                trendValue={`${metrics.ordersTrend}%`}
              />
            </div>
            <CustomersTable initialData={customers} />
          </div>
        </div>
      </SidebarInset>
      <ChatSidebar />
    </SidebarProvider>
  )
} 