import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { MetricCard } from "@/components/ui/metric-card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BarChart3, Users, DollarSign } from "lucide-react"
import { RecentOrders } from "@/components/recent-orders"
import { TopCustomers } from "@/components/top-customers"
import { ChatSidebar } from "@/components/chat-sidebar"
import { DashboardMetricsData } from '@/components/dashboard-metrics'
import { OpportunitiesRecap } from "@/components/opportunities-recap"
import { GrowthPotentialCard } from "@/components/growth-potential-card"
import { BusinessOwnerWrapper } from "@/components/business-owner-wrapper"

export default function DashboardPage() {
  const dashboardMetrics = {
    revenue: 125000.00,
    activeUsers: 1250,
    conversionRate: 3.2,
    pendingOrders: 45,
    totalOrders: 1890
  }

  return (
    <BusinessOwnerWrapper>
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
          {/* Business Owner dashboard content */}
          <div className="flex-1 overflow-auto">
            {/* ... same content as before ... */}
          </div>
        </SidebarInset>
        <ChatSidebar />
        <DashboardMetricsData metrics={dashboardMetrics} />
      </SidebarProvider>
    </BusinessOwnerWrapper>
  )
} 