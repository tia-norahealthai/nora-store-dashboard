import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { MetricCard } from "@/components/ui/metric-card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BarChart3, Users, DollarSign, ArrowUpRight } from "lucide-react"
import { RecentOrders } from "@/components/recent-orders"
import { TopCustomers } from "@/components/top-customers"
import { ChatSidebar } from "@/components/chat-sidebar"
import { DashboardMetricsData } from '@/components/dashboard-metrics'
import { OpportunitiesRecap } from "@/components/opportunities-recap"
import { GrowthPotentialCard } from "@/components/growth-potential-card"

export default function Page() {
  // This would typically come from your API/database
  const dashboardMetrics = {
    revenue: 125000.00,
    activeUsers: 1250,
    conversionRate: 3.2,
    pendingOrders: 45,
    totalOrders: 1890
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
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-4 p-4 pt-0">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Total Revenue"
                value="$45,231.89"
                description="Monthly revenue"
                icon={DollarSign}
                trend="up"
                trendValue="+20.1% from last month"
              />
              <MetricCard
                title="Active Users"
                value="2,350"
                description="Active users this month"
                icon={Users}
                trend="down"
                trendValue="-4% from last month"
              />
              <MetricCard
                title="Conversion Rate"
                value="3.2%"
                description="Average conversion rate"
                icon={BarChart3}
                trend="up"
                trendValue="+2.4% from last month"
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <OpportunitiesRecap 
                percentage={35} 
                missedRevenue={12450}
              />
              <GrowthPotentialCard
                potentialIncrease={24}
                orderValueIncrease={15}
                retentionIncrease={15}
              />
              <RecentOrders />
              <TopCustomers />
            </div>
          </div>
        </div>
      </SidebarInset>
      <ChatSidebar />
      <DashboardMetricsData metrics={dashboardMetrics} />
    </SidebarProvider>
  )
}
